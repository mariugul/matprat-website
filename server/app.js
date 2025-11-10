/* eslint-disable no-console */
/* eslint-disable no-return-assign */
const express = require('express');
const process = require('process');
const { Pool } = require('pg');

// Import utilities
const logger = require('./utils/logger');

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
  logger.info('Received SIGINT, shutting down gracefully...');
  pool.end(() => {
    logger.info('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  pool.end(() => {
    logger.info('Database pool closed');
    process.exit(0);
  });
});

// Start server only if not being required by tests
if (require.main === module) {
  const port = process.env.NODE_PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
  });
}

// Export app for testing
module.exports = app;
