/**
 * LICENSE KEY GENERATOR
 *
 * This script generates license keys for customers.
 * Keep this file SECRET and SECURE - only you should have access to it!
 *
 * Usage:
 * node generateKey.js <machineId> <customerName> [customerEmail]
 *
 * Example:
 * node generateKey.js "abc123-def456-ghi789" "Law Office Name" "office@example.com"
 */

import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMPORTANT: This must match the key in licenseService.js
const ENCRYPTION_KEY = 'LAW_OFFICE_MGMT_2025_SECRET_KEY_CHANGE_THIS';

/**
 * Generate a license key for a specific machine ID
 */
function generateLicenseKey(machineId, licenseInfo = {}) {
  const {
    customerName = 'Customer',
    customerEmail = '',
    expiryDate = null, // null = perpetual license
    maxActivations = 1,
    issueDate = new Date().toISOString()
  } = licenseInfo;

  // Create a deterministic hash based only on machine ID
  // This ensures the same machine ID always gets the same license key
  const hash = CryptoJS.HmacSHA256(machineId, ENCRYPTION_KEY).toString();

  // Take first 20 characters of hash and format as license key
  const keyString = hash.substring(0, 20).toUpperCase();
  const formattedKey = keyString.match(/.{1,4}/g).join('-');

  // Store metadata separately (not part of key generation)
  const licenseData = {
    machineId,
    customerName,
    customerEmail,
    expiryDate,
    maxActivations,
    issueDate,
    version: '1.0'
  };

  return {
    licenseKey: formattedKey,
    licenseData: licenseData
  };
}

/**
 * Save license information to a file
 */
function saveLicenseRecord(licenseKey, licenseData, machineId) {
  const recordsDir = path.join(__dirname, 'license-records');

  // Create records directory if it doesn't exist
  if (!fs.existsSync(recordsDir)) {
    fs.mkdirSync(recordsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `license-${timestamp}.json`;
  const filepath = path.join(recordsDir, filename);

  const record = {
    licenseKey,
    machineId,
    ...licenseData,
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync(filepath, JSON.stringify(record, null, 2), 'utf8');

  return filepath;
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          LICENSE KEY GENERATOR - Law Office Management         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log('Usage:');
  console.log('  node generateKey.js <machineId> <customerName> [customerEmail]\n');
  console.log('Example:');
  console.log('  node generateKey.js "abc123-def456" "Law Office" "office@example.com"\n');
  console.log('The customer will get their Machine ID from the activation screen.');
  process.exit(1);
}

const machineId = args[0];
const customerName = args[1];
const customerEmail = args[2] || '';

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║          LICENSE KEY GENERATOR - Law Office Management         ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

const result = generateLicenseKey(machineId, {
  customerName,
  customerEmail,
  expiryDate: null, // Perpetual license
  maxActivations: 1,
  issueDate: new Date().toISOString()
});

console.log('License Key Generated Successfully!\n');
console.log('─────────────────────────────────────────────────────────────────');
console.log(`Customer Name    : ${customerName}`);
console.log(`Customer Email   : ${customerEmail || 'Not provided'}`);
console.log(`Machine ID       : ${machineId}`);
console.log(`License Type     : Perpetual (No Expiry)`);
console.log(`Generated Date   : ${new Date().toLocaleString()}`);
console.log('─────────────────────────────────────────────────────────────────');
console.log(`\n🔑 LICENSE KEY: ${result.licenseKey}\n`);
console.log('─────────────────────────────────────────────────────────────────\n');

// Save to records
const filepath = saveLicenseRecord(result.licenseKey, result.licenseData, machineId);
console.log(`✓ License record saved to: ${filepath}\n`);

console.log('IMPORTANT INSTRUCTIONS:');
console.log('1. Send this license key to the customer');
console.log('2. Customer should enter this key in the activation window');
console.log('3. Keep the license record file for your records');
console.log('4. NEVER share the generateKey.js file or ENCRYPTION_KEY!\n');
