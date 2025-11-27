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

    res.render('admin/recipe-form', {
      activePage: 'admin',
      username: req.session.username,
      mode: 'create',
      recipe: null,
      measurementUnits: measurementUnits.map(row => row.unit),
      difficultyLevels: difficultyLevels.map(row => row.difficulty),
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
    
    // Load recipe images
    const images = await sqlQuery('SELECT * FROM images WHERE recipe_name = $1 ORDER BY image_nr', [recipeName]);

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

    recipe.images = images;

    return res.render('admin/recipe-form', {
      activePage: 'admin',
      username: req.session.username,
      mode: 'edit',
      recipe,
      measurementUnits: measurementUnits.map(row => row.unit),
      difficultyLevels: difficultyLevels.map(row => row.difficulty),
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
  try {
    const recipeData = req.body;
    const isEdit = recipeData.mode === 'edit';
    
    logger.debug('Recipe save process started', {
      mode: isEdit ? 'EDIT' : 'CREATE',
      dataKeys: Object.keys(recipeData),
      formData: recipeData
    });

    // Parse ingredients, steps, and images
    const ingredients = [];
    const stepTexts = [];
    const stepNotes = [];
    const imageUrls = [];
    const imageDescs = [];

    // Parse structured ingredients (amount, unit, name, note)
    const ingredientNumbers = [];
    Object.keys(recipeData).forEach((key) => {
      if (key.startsWith('ingredient_name_')) {
        const num = key.split('_')[2];
        if (recipeData[key].trim()) {
          ingredientNumbers.push(num);
        }
      }
    });

    // Build ingredient objects
    ingredientNumbers.forEach((num) => {
      const amount = recipeData[`ingredient_amount_${num}`] || '';
      const unit = recipeData[`ingredient_unit_${num}`] || '';
      const name = recipeData[`ingredient_name_${num}`] || '';
      const note = recipeData[`ingredient_note_${num}`] || '';
      
      if (name.trim()) {
        ingredients.push({
          amount: amount.trim(),
          unit: unit.trim(), 
          name: name.trim(),
          note: note.trim()
        });
      }
    });

    // Continue with original parsing logic
    Object.keys(recipeData).forEach((key) => {
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

    logger.debug('Data parsing completed', {
      ingredients,
      stepTexts,
      stepNotes,
      imageUrls,
      imageDescs
    });

    // Process images
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

    logger.debug('Final processed data ready for database', {
      cleanSteps,
      images,
      recipeName: recipeData.name,
      description: recipeData.description,
      cookTime: parseInt(recipeData.cook_time, 10) || 0,
      servings: parseInt(recipeData.servings, 10) || 1,
      difficulty: recipeData.difficulty
    });

    // Validate required fields
    if (!recipeData.name || ingredients.length === 0 || cleanSteps.length === 0) {
      const errorMsg = 'Recipe name, ingredients, and steps are required';
      const redirectUrl = isEdit
        ? `/admin/recipes/edit/${encodeURIComponent(recipeData.originalName || recipeData.name)}`
        : '/admin/recipes/new';
      return res.redirect(`${redirectUrl}?error=${encodeURIComponent(errorMsg)}`);
    }

    if (isEdit && recipeData.originalName) {
      const updateParams = [
        recipeData.name,
        recipeData.description || '',
        parseInt(recipeData.cook_time, 10) || 0,
        parseInt(recipeData.servings, 10) || 1,
        recipeData.difficulty,
        recipeData.originalName,
      ];
      
      logger.debug('Updating existing recipe', { updateParams });
      
      // Update existing recipe (only the columns that exist)
      await sqlQuery(`
        UPDATE recipes SET 
          name = $1, description = $2, cook_time = $3, default_portions = $4, difficulty = $5
        WHERE name = $6
      `, updateParams);

      logger.info('Recipe updated successfully', {
        recipeName: recipeData.name,
        userId: req.session.userId,
      });
    } else {
      const insertParams = [
        recipeData.name,
        recipeData.description || '',
        parseInt(recipeData.cook_time, 10) || 1,
        parseInt(recipeData.servings, 10) || 1,
        recipeData.difficulty,
      ];
      
      logger.debug('Creating new recipe', { insertParams });
      
      // Create new recipe (only the columns that exist in the table)
      await sqlQuery(`
        INSERT INTO recipes (name, description, cook_time, default_portions, difficulty)
        VALUES ($1, $2, $3, $4, $5)
      `, insertParams);

      logger.info('Recipe created successfully', {
        recipeName: recipeData.name,
        userId: req.session.userId,
      });
    }

    logger.debug('Processing ingredients', { 
      recipeName: recipeData.name, 
      ingredientCount: ingredients.length 
    });
    
    // Handle ingredients - delete existing and insert new ones
    await sqlQuery('DELETE FROM ingredients WHERE recipe_name = $1', [recipeData.name]);
    
    // Insert ingredients
    for (let i = 0; i < ingredients.length; i++) {
      const ingredient = ingredients[i];
      logger.debug('Inserting ingredient', { 
        stepNumber: i + 1, 
        ingredient: ingredient 
      });
      await sqlQuery(`
        INSERT INTO ingredients (recipe_name, ingredient, amount, unit, note)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        recipeData.name,
        ingredient.name,
        parseFloat(ingredient.amount) || 1.0, // Default to 1.0 if empty or invalid
        ingredient.unit || '',
        ingredient.note || '',
      ]);
    }
    logger.debug('Ingredients processing completed');

    logger.debug('Processing steps', { 
      recipeName: recipeData.name, 
      stepCount: cleanSteps.length 
    });
    
    // Handle steps - delete existing and insert new ones  
    await sqlQuery('DELETE FROM steps WHERE recipe_name = $1', [recipeData.name]);
    
    // Insert steps
    for (let i = 0; i < cleanSteps.length; i++) {
      const step = cleanSteps[i];
      logger.debug('Inserting step', { 
        stepNumber: i + 1, 
        step 
      });
      await sqlQuery(`
        INSERT INTO steps (recipe_name, step_nr, description, note)
        VALUES ($1, $2, $3, $4)
      `, [
        recipeData.name,
        i + 1,
        step.text,
        step.note || null,
      ]);
    }
    logger.debug('Steps processing completed');

    logger.debug('Processing images', { 
      recipeName: recipeData.name, 
      imageCount: images.length 
    });
    
    // Handle images - delete existing and insert new ones
    await sqlQuery('DELETE FROM images WHERE recipe_name = $1', [recipeData.name]);
    
    // Insert new images
    for (const image of images) {
      logger.debug('Inserting image', { image });
      await sqlQuery(`
        INSERT INTO images (recipe_name, image_nr, link, description)
        VALUES ($1, $2, $3, $4)
      `, [
        recipeData.name,
        image.image_nr,
        image.link,
        image.description,
      ]);
    }
    logger.debug('Images processing completed');

    logger.info('Images updated successfully', {
      recipeName: recipeData.name,
      imageCount: images.length,
    });

    logger.info('Recipe save process completed successfully', {
      recipeName: recipeData.name,
      redirectUrl: `/recipes/${encodeURIComponent(recipeData.name)}`
    });
    
    // Redirect to the recipe page
    return res.redirect(`/recipes/${encodeURIComponent(recipeData.name)}`);
  } catch (err) {
    console.log('=== RAW ERROR DETAILS ===');
    console.log('Error message:', err.message);
    console.log('Error code:', err.code);
    console.log('Error detail:', err.detail);
    console.log('Full error object:', JSON.stringify(err, null, 2));
    console.log('=== END RAW ERROR ===');
    
    logger.error('Error saving recipe', { 
      error: err.message, 
      stack: err.stack,
      recipeName: req.body.name,
      mode: req.body.mode 
    });
    const errorMsg = 'Unable to save recipe. Please try again.';
    const redirectUrl = req.body.mode === 'edit'
      ? `/admin/recipes/edit/${encodeURIComponent(req.body.originalName || req.body.name)}`
      : '/admin/recipes/new';
    return res.redirect(`${redirectUrl}?error=${encodeURIComponent(errorMsg)}`);
  }
});

module.exports = router;
