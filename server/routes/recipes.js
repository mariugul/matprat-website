/**
 * Recipe routes
 */

const express = require('express');

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
      return res.render('error', {
        errorMessage: 'No recipes found in the database.',
        activePage: undefined,
      });
    }

    res.render('recipes', {
      recipesInfo,
      activePage: 'recipes',
    });
  } catch (err) {
    console.error('Database error fetching recipes:', err);
    err.statusCode = 500;
    next(err);
  }
});

/**
 * GET /recipes/:name
 * Display a specific recipe with ingredients and steps
 */
router.get('/:name', async (req, res, next) => {
  try {
    // Get recipe info
    const recipeInfo = await sqlQuery('SELECT * FROM recipeInfo($1)', [req.params.name]);

    if (!recipeInfo || recipeInfo.length === 0) {
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

    res.render('recipe', {
      recipeInfo,
      ingredients,
      steps,
      images,
      activePage: 'recipes',
    });
  } catch (err) {
    console.error('Database error fetching recipe:', err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
});

module.exports = router;
