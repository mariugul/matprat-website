const Joi = require("joi");
const exp = require("constants");
const express = require("express");
var cors = require('cors') // CORS for local development
var app = express();

// Set up postgres parameters
const { Pool, Client } = require("pg");
const pool = new Pool({
  user: "nodejs",
  host: "localhost",
  database: "matprat",
  password: "nodejs",
  port: 5432,
});

app.use(express.json(), cors());

const courses = [
  { id: 1, name: "course1" },
  { id: 2, name: "course2" },
  { id: 3, name: "course3" },
];

// Get
//-------------------------------------------
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Get all the courses
app.get("/api/courses", (req, res) => {
  res.send(courses);
});

// Get a single course
app.get("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).send("The course with the given ID was not found.");
  }

  res.send(course);
});

// Get recipe information by name
app.get("/api/db/select/recipe/:name", (req, res) => {

  pool.query("SELECT * FROM recipes WHERE name=$1", [req.params.name], (err, res_db) => {
    if (err) {
      // console.log(err.stack);
      return res.status(404).send("There was an error getting the recipes from the database.");
    } else {
      // console.table(res_db.rows[0]);
      return res.status(200).send(res_db.rows[0]);
    }
  });
});

// Get all recipe names
app.get("/api/db/select/recipes", (req, res) => {
  const query = {
    text: 'SELECT name FROM recipes',
    rowMode: 'array',
  }

  pool.query(query, (err, res_db) => {
    if (err) {
      // console.log(err.stack);
      return res.status(404).send("There was an error getting the recipe names from the database.");
    } else {
      // console.table(res_db.rows);
      return res.status(200).send(res_db.rows);
    }
  });
});

// Post
//-------------------------------------------
// Post courses
app.post("/api/courses", (req, res) => {
  const { error } = validateCourse(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const course = {
    id: courses.length + 1,
    name: req.body.name,
  };

  courses.push(course);
  res.send(course);
});

// Put
//-------------------------------------------
app.put("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course)
    return res.status(404).send("The course with the given ID was not found.");

  const { error } = validateCourse(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  course.name = req.body.name;
  res.send(course);
});

// Delete
//-------------------------------------------
app.delete("/api/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).send("The course with the given ID was not found.");
  }

  const index = courses.indexOf(course);
  courses.splice(index, 1);

  res.send(course);
});

// Functions
//----------------------S---------------------
function validateCourse(course) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });

  return schema.validate(course);
}

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
