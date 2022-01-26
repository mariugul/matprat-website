/* eslint-disable no-console */
/* eslint-disable no-return-assign */
const express = require('express');
const process = require('process');
const bodyParser = require('body-parser');
const multer = require('multer');

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploaded_images');
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
app.use(bodyParser.urlencoded({
  extended: true,
}));
// app.use(express.json(), cors()); // Allow CORS

//
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

// Set up postgres parameters
const { Pool } = require('pg');
const { render } = require('ejs');

const pool = new Pool({
  user: process.env.DB_USER || 'nodejs',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB || 'matprat',
  password: process.env.DB_PASSWORD || 'nodejs',
  port: process.env.DB_PORT || 5432,
});

// Functions
// ----------------------------------------------
async function sqlQuery(query, queryArgs) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line consistent-return
    pool.query(query, queryArgs, (err, res) => {
      if (err) return reject(err);
      // console.log(res.rows);
      resolve(res.rows);
    });
  });
}

// Get
//-------------------------------------------

// Home page
app.get('/', (req, res) => {
  res.render('index');
});

// Object that defines how to receive the multiform for create recipe
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
  { name: 'recipe_image' },
  { name: 'recipe_image_link' },
  { name: 'recipe_image_description' },
  { name: 'card_image' },
  { name: 'card_image_link' },
  { name: 'card_image_description' },
];

// Adds recipes to the database from the information received from the "create recipe" page
app.post('/create-recipe', upload.fields(createRecipeMultiForm), (req, res) => {
  // console.log(req.body);

  // Parameters for the recipe table
  const recipeParams = [
    req.body.name,
    req.body.description,
    req.body.default_portions,
    req.body.difficulty,
  ];

  // On "interval" the cook time comes as an array of two values e.g. [20, 40]
  // Make that into "20-40" in the same variable
  if (req.body.cook_time_selector === 'interval') {
    recipeParams.push(`${req.body.cook_time[0]}-${req.body.cook_time[1]}`);
  // Save value as just the specific time
  } else if (req.body.cook_time_selector === 'specific') {
    recipeParams.push(req.body.cook_time);
  // Save value as a "more than" time
  } else if (req.body.cook_time_selector === 'more_than') {
    recipeParams.push(`>${req.body.cook_time}`);
  // Save value as a "less than" time
  } else if (req.body.cook_time_selector === 'less_than') {
    recipeParams.push(`<${req.body.cook_time}`);
  }

  // eslint-disable-next-line no-undef
  queries = (async function queryDatabase() {
    // Insert a recipe into the database
    await sqlQuery(`INSERT INTO recipes (name, description, default_portions, difficulty, cook_time)
      VALUES ($1, $2, $3, $4, $5)`, recipeParams)
      .then((result) => console.log(result))
      .catch((err) => console.log(err));

    return 0;
  }());

  res.send('Successfully received info');
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
      .then((result) => (result.forEach((recipe) => {
        recipes.push(recipe.name);
      })))
      .catch((err) => console.log(err));

    // Get categories
    await sqlQuery('SELECT category FROM valid_categories')
      // Split result into an array and filter out empty values
      .then((result) => (result.forEach((category) => {
        categories.push(category.category);
      })))
      .catch((err) => console.log(err));

    // Get difficulties
    await sqlQuery('SELECT difficulty FROM valid_difficulties')
      // Split result into an array and filter out empty values
      .then((result) => (result.forEach((difficulty) => {
        difficulties.push(difficulty.difficulty);
      })))
      .catch((err) => console.log(err));

    // Get measurement units
    await sqlQuery('SELECT unit FROM valid_measurement_units')
      .then((result) => (result.forEach((unit) => {
        measurementUnits.push(unit.unit);
      })))
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

// The recipes that exist
app.get('/recipes', (req, res) => {
  // eslint-disable-next-line no-undef
  queries = (async function queryDatabase() {
    let recipeExists = false;
    let recipesInfo;

    // Get info of all recipes
    await sqlQuery('SELECT * FROM recipes() LEFT JOIN images ON name = recipe_name WHERE image_nr=1')
      .then((result) => {
        if (result === undefined || result.length === 0) {
          res.render('error', {
            errorMessage:
              `The recipe "${
                req.params.name
              }" does not exist in the database.`,
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
    let images;
    let categories;

    // Get recipe images (links)
    await sqlQuery('SELECT recipe_name, link, description FROM images WHERE image_nr=1')
      .then((result) => (images = result))
      .catch((err) => console.log(err));

    // Get recipe categories
    await sqlQuery('SELECT * FROM categories()')
      .then((result) => (categories = result))
      .catch((err) => console.log(err));

    // Generate the webpage from template and send back
    res.render('recipes', {
      recipesInfo,
      categories,
      images,
    });

    return 0;
  }());
});

// POSTGRES ----------------------------------------
// Get recipe information by name
app.get('/api/db/select/recipe/:name', (req, res) => {
  // Get recipe information by name
  pool.query(
    'SELECT * FROM recipes WHERE name=$1',
    [req.params.name],
    (err, resDb) => {
      if (err) {
        // console.log(err.stack);
        return res
          .status(404)
          .send('There was an error getting the recipes from the database.');
      }
      // console.table(res_db.rows[0]);
      return res.status(200).send(resDb.rows[0]);
    },
  );
});

// Get all recipe names
app.get('/api/db/select/recipes', (req, res) => {
  const query = {
    text: 'SELECT name FROM recipes',
    rowMode: 'array',
  };

  pool.query(query, (err, resDb) => {
    if (err) {
      // console.log(err.stack);
      return res
        .status(404)
        .send('There was an error getting the recipe names from the database.');
    }
    // console.table(res_db.rows);
    return res.status(200).send(resDb.rows);
  });
});

// Display a specific recipe
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
            errorMessage:
              `The recipe "${
                req.params.name
              }" does not exist in the database.`,
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
    let images;

    // Get recipe ingredients
    await sqlQuery('SELECT * FROM ingredients($1)', [req.params.name])
      .then((result) => (ingredients = result))
      .catch((err) => console.log(err));

    // Get recipe steps (instructions)
    await sqlQuery('SELECT * FROM steps($1)', [req.params.name])
      .then((result) => (steps = result))
      .catch((err) => console.log(err));

    // Get recipe images (links)
    await sqlQuery('SELECT * FROM images($1)', [req.params.name])
      .then((result) => (images = result))
      .catch((err) => console.log(err));

    // Generate the webpage from template and send back
    res.render('recipe', {
      recipeInfo,
      ingredients,
      steps,
      images,
    });

    return 0;
  }());
});

// POSTGRES ----------------------------------------
// Get recipe information by name
app.get('/api/db/select/recipe/:name', (req, res) => {
  // Get recipe information by name
  pool.query(
    'SELECT * FROM recipes WHERE name=$1',
    [req.params.name],
    (err, resDb) => {
      if (err) {
        // console.log(err.stack);
        return res
          .status(404)
          .send('There was an error getting the recipes from the database.');
      }
      // console.table(res_db.rows[0]);
      return res.status(200).send(resDb.rows[0]);
    },
  );
});

// Get all recipe names
app.get('/api/db/select/recipes', (req, res) => {
  const query = {
    text: 'SELECT name FROM recipes',
    rowMode: 'array',
  };

  pool.query(query, (err, resDb) => {
    if (err) {
      // console.log(err.stack);
      return res
        .status(404)
        .send('There was an error getting the recipe names from the database.');
    }
    // console.table(res_db.rows);
    return res.status(200).send(resDb.rows);
  });
});

// Read port from environment variable.
// If it doesn't exist, use port 3000.
const port = process.env.NODE_PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
