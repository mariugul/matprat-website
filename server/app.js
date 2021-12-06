const { render } = require("ejs");
const express = require("express");
const { object } = require("joi");
const process = require('process');
// var cors = require('cors') // CORS for local development

var app = express();

app.set("view engine", "ejs"); // use EJS as template engine
app.use(express.static("public"));
app.use(express.static("public/css"));
app.use(express.static("public/js"));
app.use(express.static("public/images"));
// app.use(express.json(), cors()); // Allow CORS

//
process.on('SIGINT', function onSigint() {
  app.shutdown();
});

process.on('SIGTERM', function onSigterm() {
  app.shutdown();
});

app.shutdown = function () {
  // clean up your resources and exit 
  process.exit();
};


// Set up postgres parameters
const { Pool, Client } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER || "nodejs",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB || "matprat",
  password: process.env.DB_PASSWORD || "nodejs",
  port: process.env.DB_PORT || 5432,
});

// Functions
// ----------------------------------------------
async function sqlQuery(query, queryArgs) {
  return new Promise((resolve, reject) => {
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
app.get("/", (req, res) => {
  res.render("index");
});

// Recipes
app.get("/recipes", (req, res) => {
  res.render("recipes");
});

// Display a specific recipe
app.get("/recipes/:name", (req, res) => {
  // There are 4 queries to perform and it matters that the recipeInfo checks
  // whether the recipe exists first and then the following 3 queries need to finish
  // before the page can be generated and sent back. Therfore an inline async function
  // is declared here to use the 'await' keyword on the sqlQuery function, which is also async.
  queries = (async function () {
    var recipeExists = false;

    // Get info on recipe. If it doesn't exist, display error page
    await sqlQuery("SELECT * FROM recipeInfo($1)", [req.params.name])
      .then((result) => {
        if (result === undefined || result.length == 0) {
          res.render("error", {
            errorMessage:
              'The recipe "' +
              req.params.name +
              '" does not exist in the database.',
          });
          recipeExists = false;
        } else {
          recipeExists = true;
          recipeInfo = result;
        }
      })
      .catch((err) =>
        res.render("error", {
          errorMessage: err,
        })
      );

    // If no recipe was returned from the previous query, exit this function
    if (!recipeExists) {
      return 0;
    }

    // Get recipe ingredients
    await sqlQuery("SELECT * FROM ingredients($1)", [req.params.name])
      .then((result) => (ingredients = result))
      .catch((err) => console.log(err));

    // Get recipe steps (instructions)
    await sqlQuery("SELECT * FROM steps($1)", [req.params.name])
      .then((result) => (steps = result))
      .catch((err) => console.log(err));

    // Get recipe images (links)
    await sqlQuery("SELECT * FROM images($1)", [req.params.name])
      .then((result) => (images = result))
      .catch((err) => console.log(err));

    // Generate the webpage from template and send back
    res.render("recipe", {
      recipeInfo: recipeInfo,
      ingredients: ingredients,
      steps: steps,
      images: images,
    });
  })();
});

// POSTGRES ----------------------------------------
// Get recipe information by name
app.get("/api/db/select/recipe/:name", (req, res) => {
  // Get recipe information by name
  pool.query(
    "SELECT * FROM recipes WHERE name=$1",
    [req.params.name],
    (err, res_db) => {
      if (err) {
        // console.log(err.stack);
        return res
          .status(404)
          .send("There was an error getting the recipes from the database.");
      } else {
        // console.table(res_db.rows[0]);
        return res.status(200).send(res_db.rows[0]);
      }
    }
  );
});

// Get all recipe names
app.get("/api/db/select/recipes", (req, res) => {
  const query = {
    text: "SELECT name FROM recipes",
    rowMode: "array",
  };

  pool.query(query, (err, res_db) => {
    if (err) {
      // console.log(err.stack);
      return res
        .status(404)
        .send("There was an error getting the recipe names from the database.");
    } else {
      // console.table(res_db.rows);
      return res.status(200).send(res_db.rows);
    }
  });
});

// Read port from environment variable.
// If it doesn't exist, use port 3000.
const port = process.env.NODE_PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
