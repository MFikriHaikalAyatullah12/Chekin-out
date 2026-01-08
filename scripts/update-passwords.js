const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function updatePasswords() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    const newHash = '$2a$10$ybcLh3iizwlckUYWCXzO5eksECH8oaI6mB7QOfHvPezcdtVXtO3gK';
    
    console.log('🔑 Updating passwords...');
    const result = await client.query(
      `UPDATE users 
       SET password_hash = $1 
       WHERE email IN ('admin@school.com', 'guru1@school.com', 'guru2@school.com', 'andi@school.com', 'budi@school.com', 'citra@school.com', 'doni@school.com')`,
      [newHash]
    );

    console.log(`✅ Updated ${result.rowCount} user passwords`);
    console.log('🎉 Password update completed successfully!');
    console.log('');
    console.log('All users can now login with password: password123');
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updatePasswords();
