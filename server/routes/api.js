/**
 * API routes
 */

const express = require('express');

const router = express.Router();

// Database pool (will be passed from app.js)
let pool;

// Initialize with database pool
router.init = (dbPool) => {
  pool = dbPool;
};

/**
 * GET /api/db/select/recipe/:name
 * Get recipe information by name
 */
router.get('/db/select/recipe/:name', (req, res) => {
  pool.query(
    'SELECT * FROM recipes WHERE name=$1',
    [req.params.name],
    (err, resDb) => {
      if (err) {
        console.error('Database error fetching recipe:', err);
        return res
          .status(500)
          .json({ error: 'Unable to retrieve recipe. Please try again later.' });
      }
      if (!resDb.rows[0]) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      return res.status(200).json(resDb.rows[0]);
    },
  );
});

/**
 * GET /api/db/select/recipes
 * Get all recipe names
 */
router.get('/db/select/recipes', (req, res) => {
  const query = {
    text: 'SELECT name FROM recipes',
    rowMode: 'array',
  };

  pool.query(query, (err, resDb) => {
    if (err) {
      console.error('Database error fetching recipes:', err);
      return res
        .status(500)
        .json({ error: 'Unable to retrieve recipes. Please try again later.' });
    }
    return res.status(200).json(resDb.rows);
  });
});

module.exports = router;
