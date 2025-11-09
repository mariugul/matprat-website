/* eslint-disable no-console */
/* eslint-disable no-return-assign */
const express = require('express');
const process = require('process');
// var cors = require('cors') // CORS for local development

const app = express();

app.set('view engine', 'ejs'); // use EJS as template engine
app.use(express.static('public'));
app.use(express.static('public/css'));
app.use(express.static('public/js'));
app.use(express.static('public/images'));
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
app.get('/', async (req, res) => {
  try {
    // Get 3 featured recipes with their images
    const featuredRecipes = await sqlQuery(
      'SELECT * FROM recipes() LEFT JOIN images ON name = recipe_name WHERE image_nr=1 LIMIT 3',
    );

    // Get total recipe count for stats
    const recipeCount = await sqlQuery('SELECT COUNT(*) as count FROM recipes');

    // Get average cook time for stats
    const avgCookTime = await sqlQuery('SELECT ROUND(AVG(cook_time)) as avg FROM recipes');

    res.render('index', {
      featuredRecipes: featuredRecipes || [],
      totalRecipes: recipeCount[0]?.count || 0,
      avgCookTime: avgCookTime[0]?.avg || 30,
      activePage: 'home',
    });
  } catch (err) {
    console.error('Error loading home page:', err);
    res.render('index', {
      featuredRecipes: [],
      totalRecipes: 0,
      avgCookTime: 30,
      activePage: 'home',
    });
  }
});

// The recipes that exist
app.get('/recipes', (req, res) => {
  (async function queryDatabase() {
    let recipeExists = false;
    let recipesInfo;

    // Get info of all recipes with categories
    await sqlQuery(`
      SELECT r.name, r.description, r.default_portions, r.difficulty, r.cook_time,
             i.link, i.description as image_description, i.image_nr, 
             ARRAY_AGG(c.category) FILTER (WHERE c.category IS NOT NULL) as categories
      FROM recipes r
      LEFT JOIN images i ON r.name = i.recipe_name AND i.image_nr = 1
      LEFT JOIN categories c ON r.name = c.recipe_name
      GROUP BY r.name, r.description, r.default_portions, r.difficulty, r.cook_time, i.link, i.description, i.image_nr
    `)
      .then((result) => {
        if (result === undefined || result.length === 0) {
          res.render('error', {
            errorMessage: 'No recipes found in the database.',
          });
          recipeExists = false;
        } else {
          recipeExists = true;
          recipesInfo = result;
        }
      })
      .catch((err) => {
        console.error('Database error fetching recipes:', err);
        res.render('error', {
          errorMessage: 'Unable to load recipes. Please try again later.',
        });
      });

    // If no recipe was returned from the previous query, exit this function
    if (!recipeExists) {
      return 0;
    }

    // Generate the webpage from template and send back
    res.render('recipes', {
      recipesInfo,
      activePage: 'recipes',
    });

    return 0;
  }());
});

// POSTGRES ----------------------------------------
// Get recipe information by name
app.get('/api/db/select/recipe/:name', (req, res) => {
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

// Get all recipe names
app.get('/api/db/select/recipes', (req, res) => {
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

// Display a specific recipe
app.get('/recipes/:name', (req, res) => {
  // There are 4 queries to perform and it matters that the recipeInfo checks
  // whether the recipe exists first and then the following 3 queries need to finish
  // before the page can be generated and sent back. Therfore an inline async function
  // is declared here to use the 'await' keyword on the sqlQuery function, which is also async.
  (async function queryDatabase() {
    let recipeExists = false;
    let recipeInfo;

    // Get info on recipe. If it doesn't exist, display error page
    await sqlQuery('SELECT * FROM recipeInfo($1)', [req.params.name])
      .then((result) => {
        if (result === undefined || result.length === 0) {
          res.render('error', {
            errorMessage: `The recipe "${req.params.name}" does not exist.`,
          });
          recipeExists = false;
        } else {
          recipeExists = true;
          recipeInfo = result;
        }
      })
      .catch((err) => {
        console.error('Database error fetching recipe:', err);
        res.render('error', {
          errorMessage: 'Unable to load recipe. Please try again later.',
        });
      });

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
      activePage: 'recipes',
    });

    return 0;
  }());
});

// Read port from environment variable.
// If it doesn't exist, use port 3000.
const port = process.env.NODE_PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
