/**
 * API routes
 */

const express = require('express');
const logger = require('../utils/logger');

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
  logger.http('API: Get recipe by name', { recipeName: req.params.name });

  pool.query(
    'SELECT * FROM recipes WHERE name=$1',
    [req.params.name],
    (err, resDb) => {
      if (err) {
        logger.error('API: Database error fetching recipe', {
          recipeName: req.params.name,
          error: err.message,
        });
        return res
          .status(500)
          .json({ error: 'Unable to retrieve recipe. Please try again later.' });
      }
      if (!resDb.rows[0]) {
        logger.warn('API: Recipe not found', { recipeName: req.params.name });
        return res.status(404).json({ error: 'Recipe not found' });
      }
      logger.info('API: Recipe retrieved successfully', { recipeName: req.params.name });
      return res.status(200).json(resDb.rows[0]);
    },
  );
});

/**
 * GET /api/db/select/recipes
 * Get all recipe names
 */
router.get('/db/select/recipes', (req, res) => {
  logger.http('API: Get all recipe names');

  const query = {
    text: 'SELECT name FROM recipes',
    rowMode: 'array',
  };

  pool.query(query, (err, resDb) => {
    if (err) {
      logger.error('API: Database error fetching recipes', { error: err.message });
      return res
        .status(500)
        .json({ error: 'Unable to retrieve recipes. Please try again later.' });
    }
    logger.info('API: Retrieved all recipe names', { count: resDb.rows.length });
    return res.status(200).json(resDb.rows);
  });
});

module.exports = router;
