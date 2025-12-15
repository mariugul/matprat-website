/**
 * Test setup and configuration
 * Runs before all tests
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB = process.env.DB || 'matprat';
process.env.DB_USER = process.env.DB_USER || 'nodejs';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'nodejs';

// Suppress logs during tests (optional)
// const logger = require('../utils/logger');
// logger.transports.forEach((t) => (t.silent = true));

// Load chai dynamically for ESM compatibility (Chai 6+)
let expect;

const loadChai = async () => {
  const chai = await import('chai');
  expect = chai.expect;
};

module.exports = {
  loadChai,
  getExpect: () => expect,
};
