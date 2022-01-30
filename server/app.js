/* eslint-disable no-console */
/* eslint-disable no-return-assign */
const express = require('express');
const process = require('process');
const bodyParser = require('body-parser');
const multer = require('multer');

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

// var cors = require('cors') // CORS for local development
const app = express();

app.set('view engine', 'ejs'); // use EJS as template engine
app.use(express.static('public'));
app.use(express.static('public/css'));
app.use(express.static('public/js'));
app.use(express.static('public/images'));

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// -----------------------------------------------------------------------------------------------
// Setup termination of application on signaling
// -----------------------------------------------------------------------------------------------
process.on('SIGINT', () => {
  app.shutdown();
});

process.on('SIGTERM', () => {
  app.shutdown();
});

app.shutdown = () => {
  // clean up your resources and exit
  process.exit();
};

// -----------------------------------------------------------------------------------------------
// Set up postgres parameters
// -----------------------------------------------------------------------------------------------
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'nodejs',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB || 'matprat',
  password: process.env.DB_PASSWORD || 'nodejs',
  port: process.env.DB_PORT || 5432,
});

// -----------------------------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------------------------

/**
 * @param {string} theQuery Query to perform
 * @param {Array} queryArgs Optional: Arguments to put into query if the query has
 * arguments e.g. $1, $2 etc.
 * @returns Promise that either resolves or rejects the query
 */
async function sqlQuery(theQuery, queryArgs) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line consistent-return
    pool.query(theQuery, queryArgs, (err, res) => {
      if (err) return reject(err);
      // console.log(res.rows);
      resolve(res.rows);
    });
  });
}

/**
 * Builds a query for inserting into the database
 * @param {string} recipeName Name of the recipe.
 * @param {string} tableName Name of the database table to insert into.
 * @param {Array} columns An array with names of the columns to insert into.
 * @param {Array} values Arrays of the values to insert. The exception is recipe_name, which
 * is the same for all rows and is read from the first parameter.
 */
function buildInsertQuery(recipeName, tableName, columns, ...values) {
  // Debug
  // console.log(`columns: ${columns}`);
  // console.log(`values: ${values}`);
  // console.log(`columns.length: ${columns.length}`);
  // console.log(`values.length: ${values.length}`);
  // console.log(`values[0].length: ${values[0].length}`);

  let insertQuery = `INSERT INTO ${tableName} (`;

  // Add all table-columns to the query
  for (let i = 0; i < columns.length; i++) {
    insertQuery += columns[i];

    // Append comma between values
    if (i !== columns.length - 1) {
      insertQuery += ', ';
    } else {
      insertQuery += ') VALUES ';
    }
  }

  // Loop over all rows of data passed to function and append the data
  for (let row = 0; row < values[0].length; row++) {
    // Append the recipe name
    insertQuery += `('${recipeName}', `;

    // Loop over amount of columns to append one row of values
    for (let col = 0; col < values.length; col++) {
      // Check for empty arrays that signifies an optional 'note'
      // Notes that are empty should be passed as NULL to the DB
      if (values[col][row] === '') {
        insertQuery += 'NULL';
      } else {
        insertQuery += `'${values[col][row]}'`;
      }

      // Append comma between values
      if (col !== values.length - 1) {
        insertQuery += ', ';
      } else {
        insertQuery += ')';
      }
    }

    // Append comma between VALUES-parantheses
    if (row !== values[0].length - 1) {
      insertQuery += ', ';
    }
  }

  return insertQuery;
}

/**
   * Sorts parameters that could be an array or a string -> into an array.
   * e.g. "ingredients" could be just one string or an array of ingredients. Sorting into an array,
   * even for single strings, makes it easier to handle building the query for inserting
   * into the database. Used for the received multiform values.
   * @param {Array} param Accepts either an array of parameters or a string of one parameter.
   * @returns {Array} An array of parameters.
   */
function sortParams(param) {
  const paramArray = [];

  // Check if the parameter passed is an array
  if (Array.isArray(param)) {
    param.forEach((element) => {
      paramArray.push(element);
    });
    // Just a string of one parameter
  } else {
    paramArray.push(param);
  }

  return paramArray;
}

// -----------------------------------------------------------------------------------------------
// API - GET
// -----------------------------------------------------------------------------------------------

// Home page
app.get('/', (req, res) => {
  res.render('index');
});

// Shows the "create a recipe" page
app.get('/create-recipe', (req, res) => {
  // eslint-disable-next-line no-undef
  queries = (async function queryDatabase() {
    // Define arrays for query results
    const recipes = [];
    const categories = [];
    const difficulties = [];
    const measurementUnits = [];

    // Get recipe names
    await sqlQuery('SELECT name FROM recipes')
      .then((result) => result.forEach((recipe) => {
        recipes.push(recipe.name);
      }))
      .catch((err) => console.log(err));

    // Get categories
    await sqlQuery('SELECT category FROM valid_categories')
      // Split result into an array and filter out empty values
      .then((result) => result.forEach((category) => {
        categories.push(category.category);
      }))
      .catch((err) => console.log(err));

    // Get difficulties
    await sqlQuery('SELECT difficulty FROM valid_difficulties')
      // Split result into an array and filter out empty values
      .then((result) => result.forEach((difficulty) => {
        difficulties.push(difficulty.difficulty);
      }))
      .catch((err) => console.log(err));

    // Get measurement units
    await sqlQuery('SELECT unit FROM valid_measurement_units')
      .then((result) => result.forEach((unit) => {
        measurementUnits.push(unit.unit);
      }))
      .catch((err) => console.log(err));

    // Generate the webpage from template and send back
    // res.json(req.body); // Read the received data
    res.render('create_recipe', {
      recipes,
      categories,
      difficulties,
      measurementUnits,
    });

    return 0;
  }());
});

// Get all recipes from database and return the 'recipes' page that displays all recipes
app.get('/recipes', (req, res) => {
  // eslint-disable-next-line no-undef
  queries = (async function queryDatabase() {
    let recipeExists = false;
    let recipesInfo;

    // Get info of all recipes
    await sqlQuery('SELECT * FROM recipes()')
      .then((result) => {
        if (result === undefined || result.length === 0) {
          res.render('error', {
            errorMessage: `The recipe "${req.params.name}" does not exist in the database.`,
          });
          recipeExists = false;
        } else {
          recipeExists = true;
          recipesInfo = result;
        }
      })
      .catch((err) => res.render('error', {
        errorMessage: err,
      }));

    // If no recipe was returned from the previous query, exit this function
    if (!recipeExists) {
      return 0;
    }

    // Define vars for query results
    let categories;

    // Get recipe categories
    await sqlQuery('SELECT * FROM categories()')
      .then((result) => (categories = result))
      .catch((err) => console.log(err));

    // Generate the webpage from template and send back
    res.render('recipes', {
      recipesInfo,
      categories,
    });

    return 0;
  }());
});

// Get a specific recipe from database and return the recipe page
app.get('/recipes/:name', (req, res) => {
  // There are 4 queries to perform and it matters that the recipeInfo checks
  // whether the recipe exists first and then the following 3 queries need to finish
  // before the page can be generated and sent back. Therfore an inline async function
  // is declared here to use the 'await' keyword on the sqlQuery function, which is also async.
  // eslint-disable-next-line no-undef
  queries = (async function queryDatabase() {
    let recipeExists = false;
    let recipeInfo;

    // Get info on recipe. If it doesn't exist, display error page
    await sqlQuery('SELECT * FROM recipeInfo($1)', [req.params.name])
      .then((result) => {
        if (result === undefined || result.length === 0) {
          res.render('error', {
            errorMessage: `The recipe "${req.params.name}" does not exist in the database.`,
          });
          recipeExists = false;
        } else {
          recipeExists = true;
          recipeInfo = result;
        }
      })
      .catch((err) => res.render('error', {
        errorMessage: err,
      }));

    // If no recipe was returned from the previous query, exit this function
    if (!recipeExists) {
      return 0;
    }

    // Define vars for query results
    let ingredients;
    let steps;

    // Get recipe ingredients
    await sqlQuery('SELECT * FROM ingredients($1)', [req.params.name])
      .then((result) => (ingredients = result))
      .catch((err) => console.log(err));

    // Get recipe steps (instructions)
    await sqlQuery('SELECT * FROM steps($1)', [req.params.name])
      .then((result) => (steps = result))
      .catch((err) => console.log(err));

    // Generate the webpage from template and send back
    res.render('recipe', {
      recipeInfo,
      ingredients,
      steps,
    });

    return 0;
  }());
});

// -----------------------------------------------------------------------------------------------
// API - POST
// -----------------------------------------------------------------------------------------------

/** Object that defines how to receive the multiform for create recipe */
const createRecipeMultiForm = [
  { name: 'name' },
  { name: 'description' },
  { name: 'cook_time' },
  { name: 'cook_time_selector' },
  { name: 'cook_time_interval_first' },
  { name: 'cook_time_interval_second' },
  { name: 'difficulty' },
  { name: 'default_portions' },
  { name: 'category-other' },
  { name: 'category' },
  { name: 'ingredient' },
  { name: 'ingredient_unit' },
  { name: 'ingredient_note' },
  { name: 'amount' },
  { name: 'step' },
  { name: 'step_note' },
  { name: 'image_link' },
  { name: 'image_description' },
  { name: 'image' },
];

// Adds recipes to the database from the information received from the "create recipe" page
app.post('/create-recipe', upload.fields(createRecipeMultiForm), (req, res) => {
  // Holds the results of a query, errors and results are logged in these arrays
  const queryResult = [];
  const queryError = [];

  // Parameters for the recipe table
  const recipe = [
    req.body.name,
    req.body.description,
    req.body.default_portions,
    req.body.difficulty,
  ];

  // On "interval" the cook time comes as an array of two values e.g. [20, 40]
  // Make that into a string like: "20-40"
  if (req.body.cook_time_selector === 'interval') {
    recipe.push(`${req.body.cook_time[0]}-${req.body.cook_time[1]}`);
    // Save value as just the specific time
  } else if (req.body.cook_time_selector === 'specific') {
    recipe.push(req.body.cook_time);
    // Save value as a "more than" time
  } else if (req.body.cook_time_selector === 'more_than') {
    recipe.push(`>${req.body.cook_time}`);
    // Save value as a "less than" time
  } else if (req.body.cook_time_selector === 'less_than') {
    recipe.push(`<${req.body.cook_time}`);
  }

  // Parameters for fields that may come as an array or a string
  const categories = sortParams(req.body.category);
  const ingredients = sortParams(req.body.ingredient);
  const ingredientAmounts = sortParams(req.body.amount);
  const ingredientUnits = sortParams(req.body.ingredient_unit);
  const ingredientNotes = sortParams(req.body.ingredient_note);
  const steps = sortParams(req.body.step);
  const stepNotes = sortParams(req.body.step_note);
  const imageLink = sortParams(req.body.image_link);
  const imageDescription = sortParams(req.body.image_description);

  // Save step numbers depending on the amount of steps
  // It's useful to have them as an array because it makes the query building simpler to automate.
  const stepNumbers = [];
  for (let i = 1; i <= steps.length; i++) {
    stepNumbers.push(i);
  }

  // Construct queries
  const queryCategories = buildInsertQuery(
    req.body.name,
    'categories',
    ['recipe_name', 'category'],
    categories,
  );

  const queryIngredients = buildInsertQuery(
    req.body.name,
    'ingredients',
    ['recipe_name', 'ingredient', 'amount', 'unit', 'note'],
    ingredients,
    ingredientAmounts,
    ingredientUnits,
    ingredientNotes,
  );

  const querySteps = buildInsertQuery(
    req.body.name,
    'steps',
    ['recipe_name', 'step_nr', 'description', 'note'],
    stepNumbers,
    steps,
    stepNotes,
  );

  const queryRecipe = buildInsertQuery(
    req.body.name,
    'recipes',
    ['name', 'description', 'default_portions', 'difficulty', 'cook_time'],
    recipe,
  );

  // const queryImages = buildInsertQuery(
  //   req.body.name,
  //   'images',
  //   ['recipe_name', 'link', 'description'],
  //   imageLink,
  //   imageDescription,
  // );

  // eslint-disable-next-line no-undef
  queries = (async function queryDatabase() {
    // Insert a recipe into the database
    await sqlQuery(queryRecipe)
      .then((result) => queryResult.push(result))
      .catch((err) => queryError.push(err));

    // Insert categories
    await sqlQuery(queryCategories)
      .then((result) => queryResult.push(result))
      .catch((err) => queryError.push(err));

    // Insert ingredients
    await sqlQuery(queryIngredients)
      .then((result) => queryResult.push(result))
      .catch((err) => queryError.push(err));

    // Insert steps
    await sqlQuery(querySteps)
      .then((result) => queryResult.push(result))
      .catch((err) => queryError.push(err));

    return 0;
  }());

  // Check for any database query errors
  if (queryError.length > 0) {
    res.send(`Error with database queries to create a recipe.\n${queryError}`);
  }
  res.send(`Successfully created recipe in database!\n${queryResult}`);
});

// -----------------------------------------------------------------------------------------------
// Start application
// -----------------------------------------------------------------------------------------------

// Read port from environment variable.
// If it doesn't exist, use port 3000.
const port = process.env.NODE_PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
