 
 
const express = require('express');
const session = require('express-session');
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
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Configure Express
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static('public')); // Site assets (git-tracked): logos, icons, UI elements
app.use('/content', express.static('content')); // Recipe content (gitignored): user photos, recipe images

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data

// Configure session
app.use(session({
  secret: process.env.SESSION_SECRET || 'matprat-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Make session available to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

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
     
    pool.query(query, queryArgs, (err, res) => {
      if (err) return reject(err);
      resolve(res.rows);
    });
  });
}

// Initialize route dependencies
indexRouter.init(sqlQuery);
recipesRouter.init(sqlQuery);
apiRouter.init(pool);
authRouter.init(pool);
adminRouter.init(sqlQuery);

// Mount routes
app.use('/', authRouter); // Mount auth routes (login, logout)
app.use('/', indexRouter);
app.use('/recipes', recipesRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);

// Health check endpoint for Docker/orchestration
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

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
