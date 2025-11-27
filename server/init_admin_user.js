/**
 * Script to create the default admin user
 * Run this once to initialize the admin account
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const logger = require('./utils/logger');

const pool = new Pool({
  user: process.env.DB_USER || 'nodejs',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB || 'matprat',
  password: process.env.DB_PASSWORD || 'nodejs',
  port: process.env.DB_PORT || 5432,
});

async function initAdminUser() {
  try {
    logger.info('Creating admin user...');

    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Hash the password
    const password = 'admin';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO users (username, password_hash) 
       VALUES ($1, $2) 
       ON CONFLICT (username) DO UPDATE 
       SET password_hash = $2
       RETURNING id, username`,
      ['admin', passwordHash],
    );

    logger.info('✅ Admin user created successfully!');
    logger.info('Username:', result.rows[0].username);
    logger.info('Password: admin');
    logger.warn('⚠️  Please change the password after first login!');

    await pool.end();
  } catch (err) {
    logger.error('❌ Error creating admin user:', err.message);
    process.exit(1);
  }
}

initAdminUser();
