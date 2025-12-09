/**
 * Admin routes
 */

const express = require('express');
const logger = require('../utils/logger');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication
router.use(requireAuth);

// Database will be passed from app.js
let sqlQuery;

// Initialize with database query function
router.init = (queryFunction) => {
  sqlQuery = queryFunction;
};

// ============================================================================
// Recipe Form Parsing Helpers
// ============================================================================

/**
 * Parse ingredients from form data
 * @param {Object} formData - The form data object
 * @returns {Array} Array of ingredient objects
 */
function parseIngredients(formData) {
  const ingredientNumbers = [];
  Object.keys(formData).forEach((key) => {
    if (key.startsWith('ingredient_name_')) {
      const num = key.split('_')[2];
      if (formData[key].trim()) {
        ingredientNumbers.push(num);
      }
    }
  });

  return ingredientNumbers
    .map((num) => ({
      amount: (formData[`ingredient_amount_${num}`] || '').trim(),
      unit: (formData[`ingredient_unit_${num}`] || '').trim(),
      name: (formData[`ingredient_name_${num}`] || '').trim(),
      note: (formData[`ingredient_note_${num}`] || '').trim(),
    }))
    .filter((ing) => ing.name);
}

/**
 * Parse steps from form data
 * @param {Object} formData - The form data object
 * @returns {Array} Array of step objects with text and optional note
 */
function parseSteps(formData) {
  const stepTexts = [];
  const stepNotes = [];

  Object.keys(formData).forEach((key) => {
    if (key.startsWith('step_') && !key.includes('note_') && formData[key].trim()) {
      const stepNum = parseInt(key.split('_')[1], 10);
      stepTexts[stepNum - 1] = formData[key].trim();
    }
    if (key.startsWith('step_note_') && formData[key].trim()) {
      const stepNum = parseInt(key.split('_')[2], 10);
      stepNotes[stepNum - 1] = formData[key].trim();
    }
  });

  return stepTexts
    .map((text, index) => (text ? { text, note: stepNotes[index] || null } : null))
    .filter(Boolean);
}

/**
 * Parse images from form data
 * @param {Object} formData - The form data object
 * @returns {Array} Array of image objects
 */
function parseImages(formData) {
  const imageUrls = [];
  const imageDescs = [];

  Object.keys(formData).forEach((key) => {
    if (key.startsWith('image_url_') && formData[key].trim()) {
      const imageNum = parseInt(key.split('_')[2], 10);
      imageUrls[imageNum - 1] = formData[key].trim();
    }
    if (key.startsWith('image_desc_') && formData[key].trim()) {
      const imageNum = parseInt(key.split('_')[2], 10);
      imageDescs[imageNum - 1] = formData[key].trim();
    }
  });

  return imageUrls
    .map((url, index) => (url ? {
      link: url,
      description: imageDescs[index] || '',
      image_nr: index + 1,
    } : null))
    .filter(Boolean);
}

/**
 * Parse categories from form data
 * @param {Object} formData - The form data object
 * @returns {Array} Array of category strings
 */
function parseCategories(formData) {
  if (!formData.categories) return [];
  const categories = Array.isArray(formData.categories)
    ? formData.categories
    : [formData.categories];
  return categories.filter((cat) => cat && cat.trim()).map((cat) => cat.trim());
}

// ============================================================================
// Recipe Database Operations
// ============================================================================

/**
 * Save or update the main recipe record
 * @param {Object} recipeData - The recipe form data
 * @param {boolean} isEdit - Whether this is an edit operation
 */
async function saveRecipeRecord(recipeData, isEdit) {
  const params = [
    recipeData.name,
    recipeData.description || '',
    parseInt(recipeData.cook_time, 10) || 1,
    parseInt(recipeData.servings, 10) || 1,
    recipeData.difficulty,
  ];

  if (isEdit && recipeData.originalName) {
    params.push(recipeData.originalName);
    await sqlQuery(`
      UPDATE recipes SET 
        name = $1, description = $2, cook_time = $3, default_portions = $4, difficulty = $5
      WHERE name = $6
    `, params);
    logger.info('Recipe updated', { recipeName: recipeData.name });
  } else {
    await sqlQuery(`
      INSERT INTO recipes (name, description, cook_time, default_portions, difficulty)
      VALUES ($1, $2, $3, $4, $5)
    `, params);
    logger.info('Recipe created', { recipeName: recipeData.name });
  }
}

/**
 * Replace all ingredients for a recipe
 * @param {string} recipeName - The recipe name
 * @param {Array} ingredients - Array of ingredient objects
 */
async function saveIngredients(recipeName, ingredients) {
  await sqlQuery('DELETE FROM ingredients WHERE recipe_name = $1', [recipeName]);

  for (let i = 0; i < ingredients.length; i += 1) {
    const ing = ingredients[i];
    // eslint-disable-next-line no-await-in-loop
    await sqlQuery(`
      INSERT INTO ingredients (recipe_name, ingredient, amount, unit, note)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      recipeName,
      ing.name,
      parseFloat(ing.amount) || 1.0,
      ing.unit || '',
      ing.note || '',
    ]);
  }
  logger.debug('Ingredients saved', { recipeName, count: ingredients.length });
}

/**
 * Replace all steps for a recipe
 * @param {string} recipeName - The recipe name
 * @param {Array} steps - Array of step objects
 */
async function saveSteps(recipeName, steps) {
  await sqlQuery('DELETE FROM steps WHERE recipe_name = $1', [recipeName]);

  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    // eslint-disable-next-line no-await-in-loop
    await sqlQuery(`
      INSERT INTO steps (recipe_name, step_nr, description, note)
      VALUES ($1, $2, $3, $4)
    `, [recipeName, i + 1, step.text, step.note]);
  }
  logger.debug('Steps saved', { recipeName, count: steps.length });
}

/**
 * Replace all images for a recipe
 * @param {string} recipeName - The recipe name
 * @param {Array} images - Array of image objects
 */
async function saveImages(recipeName, images) {
  await sqlQuery('DELETE FROM images WHERE recipe_name = $1', [recipeName]);

  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];
    // eslint-disable-next-line no-await-in-loop
    await sqlQuery(`
      INSERT INTO images (recipe_name, image_nr, link, description)
      VALUES ($1, $2, $3, $4)
    `, [recipeName, image.image_nr, image.link, image.description]);
  }
  logger.debug('Images saved', { recipeName, count: images.length });
}

/**
 * Replace all categories for a recipe
 * @param {string} recipeName - The recipe name
 * @param {Array} categories - Array of category strings
 */
async function saveCategories(recipeName, categories) {
  await sqlQuery('DELETE FROM categories WHERE recipe_name = $1', [recipeName]);

  for (let i = 0; i < categories.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await sqlQuery(`
      INSERT INTO categories (recipe_name, category)
      VALUES ($1, $2)
    `, [recipeName, categories[i]]);
  }
  logger.debug('Categories saved', { recipeName, count: categories.length });
}

/**
 * GET /admin
 * Admin dashboard
 */
router.get('/', async (req, res) => {
  try {
    logger.debug('Loading admin dashboard', { userId: req.session.userId });

    // Get recipe count
    const recipeCount = await sqlQuery('SELECT COUNT(*) as count FROM recipes');

    // Get recent recipes
    const recipes = await sqlQuery('SELECT name, cook_time, difficulty FROM recipes ORDER BY name LIMIT 10');

    res.render('admin/dashboard', {
      activePage: 'admin',
      username: req.session.username,
      recipeCount: recipeCount[0]?.count || 0,
      recipes,
    });
  } catch (err) {
    logger.error('Error loading admin dashboard', { error: err.message });
    res.status(500).render('error', {
      errorMessage: 'Unable to load admin dashboard',
      activePage: undefined,
    });
  }
});

/**
 * GET /admin/recipes/new
 * Show create recipe form
 */
router.get('/recipes/new', async (req, res) => {
  try {
    // Get measurement units from database
    const measurementUnits = await sqlQuery(`
      SELECT e.enumlabel as unit
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'measurement_units' 
      ORDER BY e.enumsortorder
    `);

    // Get difficulty levels from database
    const difficultyLevels = await sqlQuery(`
      SELECT e.enumlabel as difficulty
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'difficulty' 
      ORDER BY e.enumsortorder
    `);

    // Get all available categories
    const availableCategories = await sqlQuery(`
      SELECT e.enumlabel as category
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'category' 
      ORDER BY e.enumsortorder
    `);

    res.render('admin/recipe-form', {
      activePage: 'admin',
      username: req.session.username,
      mode: 'create',
      recipe: null,
      measurementUnits: measurementUnits.map((row) => row.unit),
      difficultyLevels: difficultyLevels.map((row) => row.difficulty),
      availableCategories: availableCategories.map((row) => row.category),
      error: req.query.error,
    });
  } catch (err) {
    logger.error('Error loading new recipe form', { error: err.message });
    res.status(500).render('error', {
      errorMessage: 'Unable to load recipe form',
      activePage: 'admin',
    });
  }
});

/**
 * GET /admin/recipes/edit/:name
 * Show edit recipe form
 */
router.get('/recipes/edit/:name', async (req, res) => {
  try {
    const recipeName = decodeURIComponent(req.params.name);
    logger.debug('Loading recipe for edit', { recipeName });

    const recipes = await sqlQuery('SELECT * FROM recipes WHERE name = $1', [recipeName]);

    if (recipes.length === 0) {
      return res.status(404).render('error', {
        errorMessage: 'Recipe not found',
        activePage: 'admin',
      });
    }

    const recipe = recipes[0];

    // Load recipe ingredients
    const ingredients = await sqlQuery(
      'SELECT ingredient, amount, unit, note FROM ingredients WHERE recipe_name = $1 ORDER BY ingredient',
      [recipeName],
    );

    // Load recipe steps
    const steps = await sqlQuery(
      'SELECT step_nr, description, note FROM steps WHERE recipe_name = $1 ORDER BY step_nr',
      [recipeName],
    );

    // Load recipe images
    const images = await sqlQuery('SELECT * FROM images WHERE recipe_name = $1 ORDER BY image_nr', [recipeName]);

    // Load recipe categories
    const categories = await sqlQuery(
      'SELECT category FROM categories WHERE recipe_name = $1',
      [recipeName],
    );

    // Get measurement units from database
    const measurementUnits = await sqlQuery(`
      SELECT e.enumlabel as unit
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'measurement_units' 
      ORDER BY e.enumsortorder
    `);

    // Get difficulty levels from database
    const difficultyLevels = await sqlQuery(`
      SELECT e.enumlabel as difficulty
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'difficulty' 
      ORDER BY e.enumsortorder
    `);

    // Get all available categories
    const availableCategories = await sqlQuery(`
      SELECT e.enumlabel as category
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'category' 
      ORDER BY e.enumsortorder
    `);

    // Attach related data to recipe object
    recipe.ingredients = ingredients;
    recipe.steps = steps;
    recipe.images = images;
    recipe.categories = categories.map((row) => row.category);

    // Debug logging
    logger.debug('Recipe categories loaded', {
      recipeName,
      categoriesCount: categories.length,
      categories: recipe.categories,
    });

    return res.render('admin/recipe-form', {
      activePage: 'admin',
      username: req.session.username,
      mode: 'edit',
      recipe,
      measurementUnits: measurementUnits.map((row) => row.unit),
      difficultyLevels: difficultyLevels.map((row) => row.difficulty),
      availableCategories: availableCategories.map((row) => row.category),
      error: req.query.error,
    });
  } catch (err) {
    logger.error('Error loading recipe for edit', { error: err.message });
    return res.status(500).render('error', {
      errorMessage: 'Unable to load recipe for editing',
      activePage: 'admin',
    });
  }
});

/**
 * POST /admin/recipes/preview
 * Preview recipe before saving
 */
router.post('/recipes/preview', (req, res) => {
  try {
    const recipeData = req.body;

    // Parse ingredients, steps, and images from form data
    const ingredients = [];
    const stepTexts = [];
    const stepNotes = [];
    const imageUrls = [];
    const imageDescs = [];

    // Extract ingredients, step data, and images
    Object.keys(recipeData).forEach((key) => {
      if (key.startsWith('ingredient_') && recipeData[key].trim()) {
        ingredients.push(recipeData[key].trim());
      }
      if (key.startsWith('step_') && !key.includes('note_') && recipeData[key].trim()) {
        const stepNum = parseInt(key.split('_')[1], 10);
        stepTexts[stepNum - 1] = recipeData[key].trim();
      }
      if (key.startsWith('step_note_') && recipeData[key].trim()) {
        const stepNum = parseInt(key.split('_')[2], 10);
        stepNotes[stepNum - 1] = recipeData[key].trim();
      }
      if (key.startsWith('image_url_') && recipeData[key].trim()) {
        const imageNum = parseInt(key.split('_')[2], 10);
        imageUrls[imageNum - 1] = recipeData[key].trim();
      }
      if (key.startsWith('image_desc_') && recipeData[key].trim()) {
        const imageNum = parseInt(key.split('_')[2], 10);
        imageDescs[imageNum - 1] = recipeData[key].trim();
      }
    });

    // Combine step texts and notes into step objects
    const cleanSteps = [];
    stepTexts.forEach((text, index) => {
      if (text) {
        const stepObj = { text };
        if (stepNotes[index]) {
          stepObj.note = stepNotes[index];
        }
        cleanSteps.push(stepObj);
      }
    });

    // Combine image URLs and descriptions into image objects
    const images = [];
    imageUrls.forEach((url, index) => {
      if (url) {
        images.push({
          link: url,
          description: imageDescs[index] || '',
          image_nr: index + 1,
        });
      }
    });

    const recipe = {
      name: recipeData.name,
      description: recipeData.description,
      cook_time: parseInt(recipeData.cook_time, 10) || 0,
      prep_time: parseInt(recipeData.prep_time, 10) || 0,
      servings: parseInt(recipeData.servings, 10) || 1,
      difficulty: recipeData.difficulty,
      category: recipeData.category,
      ingredients,
      steps: cleanSteps,
      images,
    };

    res.render('admin/recipe-preview', {
      activePage: 'admin',
      username: req.session.username,
      recipe,
      mode: recipeData.mode || 'create',
      originalName: recipeData.originalName,
    });
  } catch (err) {
    logger.error('Error generating recipe preview', { error: err.message });
    res.status(500).render('error', {
      errorMessage: 'Unable to generate preview',
      activePage: 'admin',
    });
  }
});

/**
 * POST /admin/recipes/save
 * Save recipe to database
 */
router.post('/recipes/save', async (req, res) => {
  const recipeData = req.body;
  const isEdit = recipeData.mode === 'edit';

  const getRedirectUrl = (error) => {
    const base = isEdit
      ? `/admin/recipes/edit/${encodeURIComponent(recipeData.originalName || recipeData.name)}`
      : '/admin/recipes/new';
    return error ? `${base}?error=${encodeURIComponent(error)}` : base;
  };

  try {
    logger.debug('Recipe save started', { mode: isEdit ? 'EDIT' : 'CREATE', name: recipeData.name });

    // Parse form data
    const ingredients = parseIngredients(recipeData);
    const steps = parseSteps(recipeData);
    const images = parseImages(recipeData);
    const categories = parseCategories(recipeData);

    // Validate required fields
    if (!recipeData.name || ingredients.length === 0 || steps.length === 0) {
      return res.redirect(getRedirectUrl('Recipe name, ingredients, and steps are required'));
    }

    // Save all recipe data
    await saveRecipeRecord(recipeData, isEdit);
    await saveIngredients(recipeData.name, ingredients);
    await saveSteps(recipeData.name, steps);
    await saveImages(recipeData.name, images);
    await saveCategories(recipeData.name, categories);

    logger.info('Recipe saved successfully', { recipeName: recipeData.name, userId: req.session.userId });
    return res.redirect(`/recipes/${encodeURIComponent(recipeData.name)}`);
  } catch (err) {
    logger.error('Error saving recipe', { error: err.message, recipeName: recipeData.name });
    return res.redirect(getRedirectUrl('Unable to save recipe. Please try again.'));
  }
});

/**
 * DELETE /admin/recipes/delete/:name
 * Delete a recipe and all associated data
 */
router.delete('/recipes/delete/:name', async (req, res) => {
  const recipeName = req.params.name;

  try {
    logger.info('Deleting recipe', {
      recipeName,
      userId: req.session.userId,
    });

    // Database will cascade delete related records due to foreign key constraints
    // Delete from: categories, ingredients, steps, images, recipes
    await sqlQuery('BEGIN');

    try {
      // Delete in order (child tables first due to foreign keys)
      await sqlQuery('DELETE FROM categories WHERE recipe_name = $1', [recipeName]);
      await sqlQuery('DELETE FROM ingredients WHERE recipe_name = $1', [recipeName]);
      await sqlQuery('DELETE FROM steps WHERE recipe_name = $1', [recipeName]);
      await sqlQuery('DELETE FROM images WHERE recipe_name = $1', [recipeName]);
      await sqlQuery('DELETE FROM recipes WHERE name = $1', [recipeName]);

      await sqlQuery('COMMIT');

      logger.info('Recipe deleted successfully', { recipeName });
      return res.status(200).json({
        success: true,
        message: `Recipe "${recipeName}" deleted successfully`,
      });
    } catch (err) {
      await sqlQuery('ROLLBACK');
      throw err;
    }
  } catch (err) {
    logger.error('Error deleting recipe', {
      error: err.message,
      recipeName,
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to delete recipe',
      error: err.message,
    });
  }
});

module.exports = router;
