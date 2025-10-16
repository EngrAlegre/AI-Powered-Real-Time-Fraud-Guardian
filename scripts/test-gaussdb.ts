/**
 * GaussDB Connection Test Script
 * Run: npx tsx scripts/test-gaussdb.ts
 */

import { config } from 'dotenv';
config(); // Load .env file

import { gaussDBService } from '../src/lib/huawei/services/gaussdb';
import { gaussDBConfig } from '../src/lib/huawei/config';

async function testGaussDB() {
  console.log('🔍 Testing GaussDB Connection...\n');
  
  console.log('Configuration loaded:');
  console.log(`  Endpoint: ${gaussDBConfig.endpoint}`);
  console.log(`  Database: ${gaussDBConfig.database}`);
  console.log(`  Username: ${gaussDBConfig.username}`);
  console.log(`  Password: ${gaussDBConfig.password ? '***' + gaussDBConfig.password.slice(-4) : 'NOT SET'}`);
  console.log();

  try {
    // Check if service is available
    if (!gaussDBService.isAvailable()) {
      console.error('❌ GaussDB service not available');
      console.error('   Check your .env file has correct credentials');
      process.exit(1);
    }

    console.log('✅ GaussDB service initialized\n');

    // Initialize schema
    console.log('📋 Initializing database schema...');
    await gaussDBService.initializeSchema();
    console.log('✅ Schema initialized successfully\n');

    // Test creating a transaction
    console.log('🧪 Testing transaction creation...');
    const testTransaction = {
      id: `TEST-${Date.now()}`,
      user_id: 'test_user_1',
      user_name: 'Test User',
      amount: 150.50,
      timestamp: new Date().toISOString(),
      location: 'Manila, Philippines',
      country: 'Philippines',
      merchant_type: 'grocery',
      merchant_name: 'Test Grocery Store',
      payment_method: 'credit-card',
      card_last4: '1234',
      ip_address: '192.168.1.100',
      device_id: 'device_test_001',
      risk_score: 25,
      fraud_probability: 0.25,
      confidence: 0.85,
      ai_explanation: {
        factors: ['Low amount', 'Normal merchant'],
        summary: 'Low risk transaction'
      },
      processing_time: 150,
      model_version: 'test-v1.0'
    };

    const transactionId = await gaussDBService.createTransaction(testTransaction);
    console.log(`✅ Transaction created: ${transactionId}\n`);

    // Test retrieving transactions
    console.log('📊 Testing transaction retrieval...');
    const transactions = await gaussDBService.getTransactions(10);
    console.log(`✅ Retrieved ${transactions.length} transaction(s)\n`);

    // Test getting statistics
    console.log('📈 Testing statistics query...');
    const stats = await gaussDBService.getTransactionStats();
    console.log('✅ Statistics retrieved:');
    console.log(`   Total Transactions: ${stats.total}`);
    console.log(`   High Risk: ${stats.highRisk}`);
    console.log(`   Average Risk Score: ${stats.avgRiskScore}`);
    console.log(`   Total Amount: $${stats.totalAmount}\n`);

    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('✅ GaussDB is ready for production use');
    console.log('✅ You can now start migrating your data');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('\nPossible issues:');
    console.error('  1. Check GaussDB instance is running');
    console.error('  2. Verify connection details in .env');
    console.error('  3. Ensure security group allows port 5432');
    console.error('  4. Check if VPC/network is accessible');
    process.exit(1);
  }
}

testGaussDB();

