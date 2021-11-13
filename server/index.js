const Joi = require("joi");
const exp = require("constants");
const express = require("express");
const app = express();

// Set up postgres parameters
const { Pool, Client } = require("pg");
const pool = new Pool({
  user: "nodejs",
  host: "localhost",
  database: "matprat",
  password: "nodejs",
  port: 5432,
});

app.use(express.json());

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
// Test query that works
pool.query("SELECT name, description FROM recipes WHERE id=1", (err, res) => {
  if (err) {
    console.log(err.stack);
  } else {
    console.table(res.rows[0]);
  }
});

// Callback
pool.query("SELECT name, description FROM recipes WHERE id=2", (err, res) => {
  if (err) {
    console.log(err.stack);
  } else {
    console.table(res.rows[0]);
  }
});
