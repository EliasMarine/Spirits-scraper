/**
 * Test script for V2.5.4 brand extraction improvements
 */

import { V25CriticalFixes } from './src/fixes/v2.5-critical-fixes.js';

console.log('🧪 Testing V2.5.4 Brand Extraction Improvements\n');

// Test cases with expected results
const testCases = [
  // Good brands that should be extracted correctly
  { name: 'Buffalo Trace Kentucky Straight Bourbon', expected: 'Buffalo Trace' },
  { name: 'W.L. Weller 12 Year', expected: 'W.L. Weller' },
  { name: 'E.H. Taylor Small Batch', expected: 'E.H. Taylor' },
  { name: 'Russell\'s Reserve Single Barrel', expected: 'Russell\'s Reserve' },
  { name: 'Michter\'s 10 Year Kentucky Straight Bourbon', expected: 'Michter\'s' },
  { name: 'Four Roses Limited Edition Small Batch 2023', expected: 'Four Roses' },
  { name: 'Old Grand-Dad Bottled in Bond', expected: 'Old Grand-Dad' },
  { name: 'Angel\'s Envy Cask Strength', expected: 'Angel\'s Envy' },
  { name: 'High West Bourye', expected: 'High West' },
  { name: 'WhistlePig 12 Year', expected: 'WhistlePig' },
  
  // Single word brands that should be accepted
  { name: 'Blanton\'s Gold Edition', expected: 'Blanton\'s' },
  { name: 'Bulleit Bourbon', expected: 'Bulleit' },
  { name: 'Macallan 18 Year', expected: 'Macallan' },
  { name: 'Glenfiddich 15 Year', expected: 'Glenfiddich' },
  
  // Invalid single words that should return Unknown
  { name: 'old bourbon whiskey', expected: 'Unknown' },
  { name: 'new whiskey release', expected: 'Unknown' },
  { name: 'four year aged', expected: 'Unknown' },
  { name: 'wild bourbon', expected: 'Unknown' },
  { name: 'king whiskey', expected: 'Unknown' },
  
  // Invalid phrases that should return Unknown
  { name: 'Discover the best bourbon', expected: 'Unknown' },
  { name: 'Best Bourbon Under $50', expected: 'Unknown' },
  { name: 'American Whiskey Collection', expected: 'Unknown' },
  { name: 'Scotch under $100', expected: 'Unknown' },
  { name: 'Styles of bourbon', expected: 'Unknown' },
  { name: 'King of Kentucky', expected: 'Unknown' }, // This is tricky - could be a valid brand
  { name: 'standard size bottle', expected: 'Unknown' },
  { name: 'Spiritless Kentucky 74', expected: 'Unknown' },
  
  // Edge cases
  { name: '', expected: 'Unknown' },
  { name: 'A', expected: 'Unknown' },
  { name: 'AB', expected: 'Unknown' },
  { name: 'ABC Distillery', expected: 'ABC Distillery' }
];

console.log('Testing brand extraction...\n');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  const result = V25CriticalFixes.extractBrandFromName(testCase.name);
  const isValid = V25CriticalFixes.isValidBrand(result);
  const status = result === testCase.expected ? '✅' : '❌';
  
  if (result === testCase.expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${status} "${testCase.name}"`);
  console.log(`   Expected: "${testCase.expected}", Got: "${result}", Valid: ${isValid}`);
  
  if (result !== testCase.expected) {
    console.log(`   ⚠️ MISMATCH!`);
  }
  console.log('');
}

console.log('='.repeat(80));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed (${Math.round(passed / testCases.length * 100)}% success rate)\n`);

// Test brand validation separately
console.log('\n🧪 Testing Brand Validation...\n');

const validationTests = [
  // Should be valid
  { brand: 'Buffalo Trace', expected: true },
  { brand: 'W.L. Weller', expected: true },
  { brand: 'Michter\'s', expected: true },
  { brand: 'WhistlePig', expected: true },
  { brand: 'Four Roses', expected: true },
  
  // Should be invalid
  { brand: 'old', expected: false },
  { brand: 'new', expected: false },
  { brand: 'four', expected: false },
  { brand: 'wild', expected: false },
  { brand: 'Discover the', expected: false },
  { brand: 'Best Bourbon', expected: false },
  { brand: 'American Whiskey', expected: false },
  { brand: '', expected: false },
  { brand: 'Unknown', expected: false },
  { brand: 'A', expected: false }
];

let validationPassed = 0;
let validationFailed = 0;

for (const test of validationTests) {
  const result = V25CriticalFixes.isValidBrand(test.brand);
  const status = result === test.expected ? '✅' : '❌';
  
  if (result === test.expected) {
    validationPassed++;
  } else {
    validationFailed++;
  }
  
  console.log(`${status} "${test.brand}" - Expected: ${test.expected}, Got: ${result}`);
}

console.log('='.repeat(80));
console.log(`\n📊 Validation Results: ${validationPassed} passed, ${validationFailed} failed (${Math.round(validationPassed / validationTests.length * 100)}% success rate)\n`);

// Summary
if (failed === 0 && validationFailed === 0) {
  console.log('🎉 All tests passed! Brand extraction V2.5.4 is working correctly.');
} else {
  console.log(`⚠️ ${failed + validationFailed} tests failed. Please review the implementation.`);
}