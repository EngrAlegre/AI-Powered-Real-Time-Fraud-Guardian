/**
 * Create GaussDB Database
 * Run: npx tsx scripts/create-database.ts
 */

import { config } from 'dotenv';
config();

import { Client } from 'pg';
import { gaussDBConfig } from '../src/lib/huawei/config';

async function createDatabase() {
  console.log('🔍 Creating GaussDB Database...\n');

  // Connect to the default 'postgres' database first
  const client = new Client({
    host: gaussDBConfig.endpoint.split(':')[0],
    port: parseInt(gaussDBConfig.endpoint.split(':')[1] || '5432'),
    database: 'postgres', // Connect to default database
    user: gaussDBConfig.username,
    password: gaussDBConfig.password,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('📡 Connecting to default postgres database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Check if database exists
    console.log(`🔍 Checking if database '${gaussDBConfig.database}' exists...`);
    const checkQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const result = await client.query(checkQuery, [gaussDBConfig.database]);

    if (result.rows.length > 0) {
      console.log(`✅ Database '${gaussDBConfig.database}' already exists!\n`);
    } else {
      console.log(`📋 Creating database '${gaussDBConfig.database}'...`);
      // Create database (cannot use parameterized query for CREATE DATABASE)
      await client.query(`CREATE DATABASE ${gaussDBConfig.database}`);
      console.log(`✅ Database '${gaussDBConfig.database}' created successfully!\n`);
    }

    console.log('🎉 Database setup complete!');
    console.log('📝 You can now run: npx tsx scripts/test-gaussdb.ts\n');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\nMake sure:');
    console.error('  1. GaussDB instance is running');
    console.error('  2. Credentials in .env are correct');
    console.error('  3. User has CREATE DATABASE permission');
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();

