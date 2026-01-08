const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function updateSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Run schema update
    console.log('📝 Running schema update...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../database/schema_v2.sql'),
      'utf8'
    );
    await client.query(schemaSQL);
    console.log('✅ Schema update completed');

    console.log('🎉 Update completed successfully!');
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updateSchema();
