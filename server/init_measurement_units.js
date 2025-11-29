/**
 * Initialize measurement units enum with additional values
 */

/* eslint-disable no-console */

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'matprat',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const additionalUnits = [
  'cups',
  'tsp',
  'tbsp',
  'ml',
  'g',
  'kg',
  'oz',
  'lbs',
  'pcs',
];

async function initMeasurementUnits() {
  const client = await pool.connect();

  try {
    console.log('Adding missing measurement units to enum...');

    // Get existing enum values
    const existingUnits = await client.query(`
      SELECT e.enumlabel 
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'measurement_units'
    `);

    const existing = existingUnits.rows.map((row) => row.enumlabel);
    console.log('Existing units:', existing);

    // Add missing units
    // eslint-disable-next-line no-restricted-syntax
    for (const unit of additionalUnits) {
      if (!existing.includes(unit)) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await client.query(`ALTER TYPE measurement_units ADD VALUE '${unit}'`);
          console.log(`✅ Added unit: ${unit}`);
        } catch (err) {
          if (err.code === '23505') { // duplicate value
            console.log(`⚠️  Unit already exists: ${unit}`);
          } else {
            console.error(`❌ Error adding unit ${unit}:`, err.message);
          }
        }
      } else {
        console.log(`⚠️  Unit already exists: ${unit}`);
      }
    }

    // Show final enum values
    const finalUnits = await client.query(`
      SELECT e.enumlabel 
      FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'measurement_units' 
      ORDER BY e.enumsortorder
    `);

    console.log('\n📋 Final measurement units:');
    finalUnits.rows.forEach((row) => {
      console.log(`  - ${row.enumlabel}`);
    });

    console.log('\n✅ Measurement units initialization completed!');
  } catch (error) {
    console.error('❌ Error initializing measurement units:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initMeasurementUnits();
}

module.exports = { initMeasurementUnits };
