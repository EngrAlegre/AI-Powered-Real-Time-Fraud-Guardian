/**
 * GaussDB Debug Script
 */

import { config } from 'dotenv';
config();

console.log('🔍 Debugging GaussDB Configuration...\n');

console.log('Environment Variables:');
console.log(`HUAWEI_GAUSSDB_ENDPOINT: "${process.env.HUAWEI_GAUSSDB_ENDPOINT}"`);
console.log(`HUAWEI_GAUSSDB_DATABASE: "${process.env.HUAWEI_GAUSSDB_DATABASE}"`);
console.log(`HUAWEI_GAUSSDB_USERNAME: "${process.env.HUAWEI_GAUSSDB_USERNAME}"`);
console.log(`HUAWEI_GAUSSDB_PASSWORD: "${process.env.HUAWEI_GAUSSDB_PASSWORD ? '***' + process.env.HUAWEI_GAUSSDB_PASSWORD.slice(-4) : 'NOT SET'}"`);
console.log(`HUAWEI_CLOUD_ACCESS_KEY_ID: "${process.env.HUAWEI_CLOUD_ACCESS_KEY_ID ? '***' + process.env.HUAWEI_CLOUD_ACCESS_KEY_ID.slice(-4) : 'NOT SET'}"`);

console.log('\nChecking if values are present:');
console.log(`Endpoint present: ${!!process.env.HUAWEI_GAUSSDB_ENDPOINT}`);
console.log(`Database present: ${!!process.env.HUAWEI_GAUSSDB_DATABASE}`);
console.log(`Username present: ${!!process.env.HUAWEI_GAUSSDB_USERNAME}`);
console.log(`Password present: ${!!process.env.HUAWEI_GAUSSDB_PASSWORD}`);

