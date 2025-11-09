/**
 * Home page routes
 */

const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

// Import database query helper (will be passed from app.js)
let sqlQuery;

// Initialize with database query function
router.init = (queryFunction) => {
  sqlQuery = queryFunction;
};

/**
 * GET /
 * Home page with featured recipes and stats
 */
router.get('/', async (req, res, next) => {
  try {
    logger.debug('Loading home page');

    // Get 3 featured recipes with their images
    const featuredRecipes = await sqlQuery(
      'SELECT * FROM recipes() LEFT JOIN images ON name = recipe_name WHERE image_nr=1 LIMIT 3',
    );

    // Get total recipe count for stats
    const recipeCount = await sqlQuery('SELECT COUNT(*) as count FROM recipes');

    // Get average cook time for stats
    const avgCookTime = await sqlQuery('SELECT ROUND(AVG(cook_time)) as avg FROM recipes');

    logger.info('Home page loaded successfully', {
      featuredCount: featuredRecipes?.length || 0,
      totalRecipes: recipeCount[0]?.count || 0,
    });

    res.render('index', {
      featuredRecipes: featuredRecipes || [],
      totalRecipes: recipeCount[0]?.count || 0,
      avgCookTime: avgCookTime[0]?.avg || 30,
      activePage: 'home',
    });
  } catch (err) {
    logger.error('Failed to load home page', { error: err.message });
    err.statusCode = 500;
    next(err);
  }
});

module.exports = router;
