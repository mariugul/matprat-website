/**
 * Authentication middleware
 * Protects routes that require login
 */

const logger = require('../utils/logger');

/**
 * Middleware to check if user is authenticated
 */
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    logger.debug('User authenticated', { userId: req.session.userId });
    return next();
  }

  logger.warn('Unauthorized access attempt', { url: req.url });

  // For API requests, return JSON
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // For web requests, redirect to login
  return res.redirect('/login');
};

/**
 * Middleware to check if user is already logged in
 */
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/admin');
  }
  return next();
};

module.exports = {
  requireAuth,
  redirectIfAuthenticated,
};
