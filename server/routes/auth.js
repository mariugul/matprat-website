/**
 * Authentication routes
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { redirectIfAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Database pool (will be passed from app.js)
let pool;

// Initialize with database pool
router.init = (dbPool) => {
  pool = dbPool;
};

/**
 * GET /login
 * Display login page
 */
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('login', {
    activePage: undefined,
    error: req.query.error,
  });
});

/**
 * POST /login
 * Handle login form submission
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    logger.info('Login attempt', { username });

    // Validate input
    if (!username || !password) {
      logger.warn('Login failed: missing credentials');
      return res.redirect('/login?error=Missing username or password');
    }

    // Find user in database
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username],
    );

    const user = result.rows[0];

    if (!user) {
      logger.warn('Login failed: user not found', { username });
      return res.redirect('/login?error=Invalid username or password');
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      logger.warn('Login failed: invalid password', { username });
      return res.redirect('/login?error=Invalid username or password');
    }

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;

    logger.info('Login successful', { userId: user.id, username: user.username });

    return res.redirect('/admin');
  } catch (err) {
    logger.error('Login error', { error: err.message });
    return res.redirect('/login?error=An error occurred. Please try again.');
  }
});

/**
 * POST /logout
 * Handle logout
 */
router.post('/logout', (req, res) => {
  const { username } = req.session;

  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error', { error: err.message });
    } else {
      logger.info('Logout successful', { username });
    }
    res.redirect('/');
  });
});

/**
 * GET /logout (convenience)
 * Allow GET requests for logout
 */
router.get('/logout', (req, res) => {
  const { username } = req.session;

  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error', { error: err.message });
    } else {
      logger.info('Logout successful', { username });
    }
    res.redirect('/');
  });
});

module.exports = router;
