const express = require("express");
const { object } = require("joi");
// var cors = require('cors') // CORS for local development
var app = express();

app.set("view engine", "ejs"); // use EJS as template engine
// app.use(express.json(), cors()); // Allow CORS

// Set up postgres parameters
const { Pool, Client } = require("pg");
const pool = new Pool({
  user: "nodejs",
  host: "localhost",
  database: "matprat",
  password: "nodejs",
  port: 5432,
});

// Functions
// ----------------------------------------------
async function sqlQuery(query, queryArgs) {
  return new Promise((resolve, reject) => {
    pool.query(query, queryArgs, (err, res) => {
      if (err) return reject(err);
      resolve(res.rows);
    });
  });
}

// Get
//-------------------------------------------
// PROTOTYPE
// Display a certain recipe
app.get("/:name", (req, res) => {
  // There are 4 queries to perform and it matters that the recipeInfo checks
  // whether the recipe exists first and then the following 3 queries need to finish
  // before the page can be generated and sent back. Therfore an inline async function
  // is declared here to use the 'await' keyword on the sqlQuery function, which is also async.
  queries = (async function () {
    // Get info on recipe. If it doesn't exist, display error page
    await sqlQuery("SELECT recipeInfo($1)", [req.params.name])
      .then((result) => {
        if (result === undefined) {
          res.render("error", {
            errorMessage:
              'The recipe "' +
              req.params.name +
              '" does not exist in the database.',
          });
        }
        recipeInfo = result;
      })
      .catch((err) =>
        res.render("error", {
          errorMessage: err,
        })
      );

    // Get recipe ingredients
    await sqlQuery("SELECT ingredients($1)", [req.params.name])
      .then((result) => (ingredients = result))
      .catch((err) => console.log(err));

    // Get recipe steps (instructions)
    await sqlQuery("SELECT steps($1)", [req.params.name])
      .then((result) => (steps = result))
      .catch((err) => console.log(err));

    // Get recipe images (links)
    // await sqlQuery("SELECT images($1)", [req.params.name])
    //   .then((result) => console.log())
    //   .catch((err) => console.log());

    console.log(recipeInfo);
    console.log(ingredients);
    console.log(steps);

    // Generate the webpage from template and send back
    res.render("recipe", {
      recipeInfo: recipeInfo,
      ingredients: ingredients,
      steps: steps,
    });
  })();
});

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Recipes
app.get("/recipes", (req, res) => {
  res.render("recipes");
});

// Display a certain recipe
app.get("/recipes/:name", (req, res) => {
  sqlQuery(query, values)
    .then((result) => {
      // Recipe doesn't exist in DB
      if (result === undefined) {
        res.render("error", {
          errorMessage:
            'The recipe "' +
            req.params.name +
            '" does not exist in the database.',
        });
      }

      // Recipe exists in DB
      res.render("recipe", {
        recipeInfo: result,
      });
    })
    .catch((err) =>
      // Error quering DB
      res.render("error", {
        errorMessage: err,
      })
    );
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
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

// POSTGRES TESTING -> Put in another script later
// -----------------------------------------------
// INSERT recipe into recipes table
// const recipe_params = ["Biff", "God biff bby", 1];
// pool.query(
//   "INSERT INTO recipes (name, description, default_portions) VALUES($1, $2, $3)",
//   recipe_params,
//   (err, res) => {
//     if (err) {
//       console.log(err.stack);
//     } else {
//       console.table(res.rows[0]);
//     }
//   }
// );
