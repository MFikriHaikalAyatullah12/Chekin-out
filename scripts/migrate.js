const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Run schema migration
    console.log('📝 Running schema migration...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../database/schema.sql'),
      'utf8'
    );
    await client.query(schemaSQL);
    console.log('✅ Schema migration completed');

    // Run seed data (optional)
    console.log('🌱 Running seed data...');
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../database/seed.sql'),
      'utf8'
    );
    await client.query(seedSQL);
    console.log('✅ Seed data inserted');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
