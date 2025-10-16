/**
 * Migrate Firebase Data to GaussDB
 * Run: npx tsx scripts/migrate-to-gaussdb.ts
 */

import { config } from 'dotenv';
config();

import { dataMigrationService } from '../src/lib/huawei/services/data-migration';

async function main() {
  console.log('🔄 Firebase → GaussDB Migration Tool\n');
  console.log('This will copy all data from Firebase to GaussDB');
  console.log('Firebase data will remain unchanged\n');

  try {
    // Run full migration
    const results = await dataMigrationService.migrateAll();

    // Display results
    console.log('\n' + '='.repeat(50));
    console.log('✅ MIGRATION COMPLETE!');
    console.log('='.repeat(50));

    console.log('\n📊 Final Statistics:');
    console.log('\n  Transactions:');
    console.log(`    ✅ Migrated: ${results.transactions.migrated}`);
    console.log(`    ❌ Failed: ${results.transactions.failed}`);
    console.log(`    📈 Total: ${results.transactions.total}`);

    console.log('\n  Users:');
    console.log(`    ✅ Migrated: ${results.users.migrated}`);
    console.log(`    ❌ Failed: ${results.users.failed}`);
    console.log(`    📈 Total: ${results.users.total}`);

    console.log('\n  Alerts:');
    console.log(`    ✅ Migrated: ${results.alerts.migrated}`);
    console.log(`    ❌ Failed: ${results.alerts.failed}`);
    console.log(`    📈 Total: ${results.alerts.total}`);

    if (results.transactions.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      results.transactions.errors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
      if (results.transactions.errors.length > 5) {
        console.log(`  ... and ${results.transactions.errors.length - 5} more`);
      }
    }

    console.log('\n🎉 Your data is now in GaussDB!');
    console.log('📝 Next: Update your app to use GaussDB for new data\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();

