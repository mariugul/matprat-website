/* eslint-disable no-console */
/* eslint-disable no-return-assign */
const express = require('express');
const process = require('process');
const { Pool } = require('pg');

// Initialize Express app
const app = express();

// Import routes
const indexRouter = require('./routes/index');
const recipesRouter = require('./routes/recipes');
const apiRouter = require('./routes/api');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Configure Express
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('public/css'));
app.use(express.static('public/js'));
app.use(express.static('public/images'));
app.use(express.json());

// Set up PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'nodejs',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB || 'matprat',
  password: process.env.DB_PASSWORD || 'nodejs',
  port: process.env.DB_PORT || 5432,
});

// Database query helper function
async function sqlQuery(query, queryArgs) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line consistent-return
    pool.query(query, queryArgs, (err, res) => {
      if (err) return reject(err);
      resolve(res.rows);
    });
  });
}

// Initialize routes with database access
indexRouter.init(sqlQuery);
recipesRouter.init(sqlQuery);
apiRouter.init(pool);

// Mount routes
app.use('/', indexRouter);
app.use('/recipes', recipesRouter);
app.use('/api', apiRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

// Start server
// Read port from environment variable.
// If it doesn't exist, use port 3000.
const port = process.env.NODE_PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
