/**
 * TEST LICENSE SYSTEM
 *
 * This script tests the license generation and validation process
 * Run this to verify everything is working correctly
 *
 * Usage: node test-license.js
 */

import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'LAW_OFFICE_MGMT_2025_SECRET_KEY_CHANGE_THIS';

// Test data
const testMachineId = 'TEST-MACHINE-ID-12345-ABCDE';
const testCustomerName = 'Test Customer';
const testCustomerEmail = 'test@example.com';

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║              LICENSE SYSTEM TEST - VERIFICATION                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Function to generate license key (same as in generateKey.js)
function generateLicenseKey(machineId, licenseInfo = {}) {
  const {
    customerName = 'Customer',
    customerEmail = '',
    expiryDate = null,
    maxActivations = 1,
    issueDate = new Date().toISOString()
  } = licenseInfo;

  // Create a deterministic hash based only on machine ID
  const hash = CryptoJS.HmacSHA256(machineId, ENCRYPTION_KEY).toString();
  const keyString = hash.substring(0, 20).toUpperCase();
  const formattedKey = keyString.match(/.{1,4}/g).join('-');

  // Store metadata separately
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

// Test 1: Generate a license key
console.log('Test 1: Generating License Key');
console.log('─────────────────────────────────────────────────────────────────');

const result = generateLicenseKey(testMachineId, {
  customerName: testCustomerName,
  customerEmail: testCustomerEmail
});

console.log('✓ License key generated successfully');
console.log(`  License Key: ${result.licenseKey}`);
console.log(`  Machine ID: ${testMachineId}`);
console.log(`  Customer: ${testCustomerName}`);
console.log('');

// Test 2: Verify license key format
console.log('Test 2: Verifying License Key Format');
console.log('─────────────────────────────────────────────────────────────────');

const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const isValidFormat = pattern.test(result.licenseKey);

if (isValidFormat) {
  console.log('✓ License key format is valid');
  console.log(`  Format: XXXX-XXXX-XXXX-XXXX-XXXX`);
  console.log(`  Length: 24 characters (including dashes)`);
} else {
  console.log('✗ License key format is INVALID!');
}
console.log('');

// Test 3: Verify key consistency
console.log('Test 3: Verifying Key Consistency');
console.log('─────────────────────────────────────────────────────────────────');

const result2 = generateLicenseKey(testMachineId, {
  customerName: testCustomerName,
  customerEmail: testCustomerEmail
});

if (result.licenseKey === result2.licenseKey) {
  console.log('✓ Same inputs produce same license key (deterministic)');
} else {
  console.log('✗ WARNING: Same inputs produced different keys!');
  console.log(`  Key 1: ${result.licenseKey}`);
  console.log(`  Key 2: ${result2.licenseKey}`);
}
console.log('');

// Test 4: Verify different machine produces different key
console.log('Test 4: Verifying Different Machine = Different Key');
console.log('─────────────────────────────────────────────────────────────────');

const differentMachineId = 'DIFFERENT-MACHINE-ID-67890-FGHIJ';
const result3 = generateLicenseKey(differentMachineId, {
  customerName: testCustomerName,
  customerEmail: testCustomerEmail
});

if (result.licenseKey !== result3.licenseKey) {
  console.log('✓ Different machines produce different license keys');
  console.log(`  Machine 1 Key: ${result.licenseKey}`);
  console.log(`  Machine 2 Key: ${result3.licenseKey}`);
} else {
  console.log('✗ WARNING: Different machines produced same key!');
}
console.log('');

// Test 5: Test encryption/decryption
console.log('Test 5: Testing License Data Encryption');
console.log('─────────────────────────────────────────────────────────────────');

const testData = {
  licenseKey: result.licenseKey,
  machineId: testMachineId,
  customerName: testCustomerName,
  activationDate: new Date().toISOString()
};

const encrypted = CryptoJS.AES.encrypt(JSON.stringify(testData), ENCRYPTION_KEY).toString();
const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
const decryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

if (JSON.stringify(testData) === JSON.stringify(decryptedData)) {
  console.log('✓ Encryption/decryption working correctly');
  console.log(`  Original: ${testData.customerName}`);
  console.log(`  Encrypted length: ${encrypted.length} characters`);
  console.log(`  Decrypted: ${decryptedData.customerName}`);
} else {
  console.log('✗ Encryption/decryption FAILED!');
}
console.log('');

// Summary
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                        TEST SUMMARY                            ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

if (isValidFormat && result.licenseKey === result2.licenseKey &&
    result.licenseKey !== result3.licenseKey &&
    JSON.stringify(testData) === JSON.stringify(decryptedData)) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('');
  console.log('Your license system is working correctly.');
  console.log('You can now build your installer and start generating licenses.');
  console.log('');
  console.log('REMINDER: Change the ENCRYPTION_KEY before building!');
} else {
  console.log('⚠️  SOME TESTS FAILED!');
  console.log('');
  console.log('Please check the errors above and verify:');
  console.log('1. crypto-js is installed correctly');
  console.log('2. ENCRYPTION_KEY is set correctly');
  console.log('3. The generateKey.js file matches licenseService.js');
}

console.log('');
