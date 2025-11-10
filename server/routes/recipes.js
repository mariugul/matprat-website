/**
 * Recipe routes
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
 * GET /recipes
 * List all recipes with search and filter functionality
 */
router.get('/', async (req, res, next) => {
  try {
    logger.debug('Loading recipes list page');

    // Get all recipes with categories
    const recipesInfo = await sqlQuery(`
      SELECT r.name, r.description, r.default_portions, r.difficulty, r.cook_time,
             i.link, i.description as image_description, i.image_nr,
             ARRAY_AGG(c.category) FILTER (WHERE c.category IS NOT NULL) as categories
      FROM recipes r
      LEFT JOIN images i ON r.name = i.recipe_name AND i.image_nr = 1
      LEFT JOIN categories c ON r.name = c.recipe_name
      GROUP BY r.name, r.description, r.default_portions, r.difficulty, r.cook_time, i.link, i.description, i.image_nr
    `);

    if (!recipesInfo || recipesInfo.length === 0) {
      logger.warn('No recipes found in database');
      return res.render('error', {
        errorMessage: 'No recipes found in the database.',
        activePage: undefined,
      });
    }

    logger.info('Recipes list loaded successfully', { count: recipesInfo.length });

    return res.render('recipes', {
      recipesInfo,
      activePage: 'recipes',
    });
  } catch (err) {
    logger.error('Database error fetching recipes', { error: err.message });
    err.statusCode = 500;
    return next(err);
  }
});

/**
 * GET /recipes/:name
 * Display a specific recipe with ingredients and steps
 */
router.get('/:name', async (req, res, next) => {
  try {
    logger.debug('Loading recipe detail', { recipeName: req.params.name });

    // Get recipe info
    const recipeInfo = await sqlQuery('SELECT * FROM recipeInfo($1)', [req.params.name]);

    if (!recipeInfo || recipeInfo.length === 0) {
      logger.warn('Recipe not found', { recipeName: req.params.name });
      const err = new Error(`The recipe "${req.params.name}" does not exist.`);
      err.statusCode = 404;
      return next(err);
    }

    // Get ingredients, steps, and images in parallel
    const [ingredients, steps, images] = await Promise.all([
      sqlQuery('SELECT * FROM ingredients($1)', [req.params.name]),
      sqlQuery('SELECT * FROM steps($1)', [req.params.name]),
      sqlQuery('SELECT * FROM images($1)', [req.params.name]),
    ]);

    logger.info('Recipe detail loaded successfully', {
      recipeName: req.params.name,
      ingredientsCount: ingredients?.length || 0,
      stepsCount: steps?.length || 0,
      imagesCount: images?.length || 0,
    });

    return res.render('recipe', {
      recipeInfo,
      ingredients,
      steps,
      images,
      activePage: 'recipes',
    });
  } catch (err) {
    logger.error('Database error fetching recipe', {
      recipeName: req.params.name,
      error: err.message,
    });
    err.statusCode = err.statusCode || 500;
    return next(err);
  }
});

module.exports = router;
