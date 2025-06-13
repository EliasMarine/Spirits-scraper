#!/usr/bin/env tsx

import { V25CriticalFixes } from '../src/fixes/v2.5-critical-fixes.js';

console.log('🧪 Testing Store Artifact Cleaning Integration\n');

// Test cases that were found in the database
const testCases = [
  {
    input: {
      name: "Glenfiddich Experimental Series-orchard (43%) Bottega Whiskey",
      brand: "Glenfiddich",
      type: "Scotch"
    },
    expected: "Glenfiddich Experimental Series Orchard"
  },
  {
    input: {
      name: "Macallan 12 Year Single Malt Scotch Whisky - Crown Wine",
      brand: "Macallan",
      type: "Scotch" 
    },
    expected: "Macallan 12 Year Single Malt Scotch Whisky"
  },
  {
    input: {
      name: "Buffalo Trace Bourbon (45%) - Total Wine",
      brand: "Buffalo Trace",
      type: "Bourbon"
    },
    expected: "Buffalo Trace Bourbon"
  },
  {
    input: {
      name: "Maker's Mark Bourbon Whisky 750ml",
      brand: "Maker's Mark",
      type: "Bourbon"
    },
    expected: "Maker's Mark Bourbon Whisky"
  }
];

console.log('Testing applyAllFixes integration:\n');

let allPassed = true;

testCases.forEach((testCase, index) => {
  const fixed = V25CriticalFixes.applyAllFixes(testCase.input);
  const passed = fixed.name === testCase.expected;
  
  console.log(`Test ${index + 1}: ${passed ? '✅' : '❌'}`);
  console.log(`  Input:    "${testCase.input.name}"`);
  console.log(`  Expected: "${testCase.expected}"`);
  console.log(`  Got:      "${fixed.name}"`);
  console.log(`  Brand:    "${fixed.brand}"\n`);
  
  if (!passed) allPassed = false;
});

// Test the cleanStoreArtifacts method directly
console.log('\nTesting cleanStoreArtifacts directly:\n');

const directTests = [
  "Series-orchard becomes Series Orchard",
  "Name (43%) becomes Name",
  "Name Bottega Whiskey becomes Name",
  "Name - Crown Wine becomes Name",
  "Name 750ml becomes Name"
];

directTests.forEach(test => {
  const [input, expected] = test.split(' becomes ');
  const result = V25CriticalFixes.cleanStoreArtifacts(input);
  const passed = result === expected;
  
  console.log(`${passed ? '✅' : '❌'} "${input}" → "${result}"`);
  if (!passed) {
    console.log(`   Expected: "${expected}"`);
    allPassed = false;
  }
});

console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed!'}`);