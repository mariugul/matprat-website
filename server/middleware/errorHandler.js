/**
 * Global error handling middleware
 * Logs errors and returns user-friendly messages
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Log error for debugging
  logger.error('Error occurred', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    statusCode: err.statusCode || 500,
  });

  // Determine if we're in development mode
  const isDev = process.env.NODE_ENV === 'development';

  // Default error response
  let statusCode = err.statusCode || 500;
  let errorMessage = 'Something went wrong. Please try again later.';

  // Handle specific database errors
  if (err.code === '23505') {
    // Postgres unique constraint violation
    statusCode = 409;
    errorMessage = 'This item already exists.';
  } else if (err.code === '23503') {
    // Postgres foreign key violation
    statusCode = 400;
    errorMessage = 'Invalid reference to related data.';
  } else if (err.code === '22P02') {
    // Invalid text representation
    statusCode = 400;
    errorMessage = 'Invalid data format.';
  }

  // In development, show actual error message
  if (isDev && err.message) {
    errorMessage = err.message;
  }

  // Send error response
  if (req.xhr || (req.headers && req.headers.accept && req.headers.accept.includes('application/json'))) {
    // API request - return JSON
    return res.status(statusCode).json({
      error: errorMessage,
      ...(isDev && { stack: err.stack }),
    });
  }

  // Web request - render error page
  return res.status(statusCode).render('error', {
    errorMessage,
    activePage: undefined,
  });
};

module.exports = errorHandler;
