#!/usr/bin/env tsx

import { V25CriticalFixes } from '../src/fixes/v2.5-critical-fixes.js';

console.log('🧪 Testing Store Artifact Cleaning\n');
console.log('='.repeat(60));

const testNames = [
  {
    input: "Glenfiddich Experimental Series-orchard (43%) Bottega Whiskey",
    expected: "Glenfiddich Experimental Series Orchard"
  },
  {
    input: "Glenfiddich 12 Year 750ml",
    expected: "Glenfiddich 12 Year"
  },
  {
    input: "Buffalo Trace (45%) - Crown Wine",
    expected: "Buffalo Trace"
  },
  {
    input: "Macallan 18 Year - The Whisky Exchange",
    expected: "Macallan 18 Year"
  }
];

console.log('📋 Testing cleanStoreArtifacts:\n');

testNames.forEach((test, index) => {
  const cleaned = V25CriticalFixes.cleanStoreArtifacts(test.input);
  const success = cleaned === test.expected;
  
  console.log(`Test ${index + 1}:`);
  console.log(`  Input: "${test.input}"`);
  console.log(`  Expected: "${test.expected}"`);
  console.log(`  Got: "${cleaned}"`);
  console.log(`  ${success ? '✅ PASS' : '❌ FAIL'}\n`);
});

// Test validation improvements
console.log('\n📋 Testing improved validation:\n');

const validationTests = [
  { name: "Glenfiddich Grand Cru", expected: true },
  { name: "Glenfiddich Grande Couronne", expected: true },
  { name: "Glenfiddich", expected: true },  // Known distillery
  { name: "Random Product Name", expected: false },
  { name: "Glenfiddich Experimental Series", expected: true }
];

validationTests.forEach((test, index) => {
  const isValid = V25CriticalFixes.isValidProductName(test.name);
  const success = isValid === test.expected;
  
  console.log(`Test ${index + 1}: "${test.name}"`);
  console.log(`  Expected: ${test.expected ? 'VALID' : 'INVALID'}`);
  console.log(`  Got: ${isValid ? 'VALID' : 'INVALID'}`);
  console.log(`  ${success ? '✅ PASS' : '❌ FAIL'}\n`);
});