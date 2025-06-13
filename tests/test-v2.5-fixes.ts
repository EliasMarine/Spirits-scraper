#!/usr/bin/env tsx

import { V25CriticalFixes } from '../src/fixes/v2.5-critical-fixes.js';

console.log('🧪 Testing V2.5 Critical Fixes for Catalog Scraper\n');
console.log('='.repeat(60));

// Test data - the horrible results from the CSV
const testCases = [
  {
    name: "Glenfiddich 12 Year Single Malt Scotch Whisky 1. Crown Wine ...",
    expected: "REJECT - truncated"
  },
  {
    name: "Glenfiddich Distillery-whisky.com",
    expected: "REJECT - website"
  },
  {
    name: "The History Of Glenfiddich Whisky",
    expected: "REJECT - article"
  },
  {
    name: "Glenfiddich 15 Yr Single Malt Scotch Whisky Same-day Delivery ...",
    expected: "REJECT - truncated/delivery"
  },
  {
    name: "Glenfiddich 12 Year Single Malt Scotch Whisky",
    expected: "ACCEPT - valid product"
  },
  {
    name: "Buffalo Trace Bourbon Whiskey 750ml",
    expected: "ACCEPT - valid product"
  },
  {
    name: "How to Choose the Best Bourbon",
    expected: "REJECT - guide"
  },
  {
    name: "shop bourbon online",
    expected: "REJECT - not a product"
  }
];

console.log('\n📋 Testing isValidProductName:');
console.log('-'.repeat(60));

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const isValid = V25CriticalFixes.isValidProductName(testCase.name);
  const expectedValid = testCase.expected.startsWith('ACCEPT');
  const success = isValid === expectedValid;
  
  console.log(`\nTest ${index + 1}: ${testCase.name}`);
  console.log(`  Expected: ${testCase.expected}`);
  console.log(`  Result: ${isValid ? 'ACCEPTED' : 'REJECTED'}`);
  console.log(`  ${success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (success) passed++;
  else failed++;
});

console.log('\n' + '='.repeat(60));
console.log(`Summary: ${passed} passed, ${failed} failed`);

// Test truncation cleaning
console.log('\n\n📋 Testing cleanTruncatedName:');
console.log('-'.repeat(60));

const truncatedNames = [
  {
    input: "Glenfiddich 12 Year Single Malt Scotch Whisky 1. Crown Wine ...",
    expected: "Glenfiddich 12 Year Single Malt Scotch Whisky"
  },
  {
    input: "Buffalo Trace Bourbon 1.",
    expected: "Buffalo Trace Bourbon"
  },
  {
    input: "Macallan 18 Year ...",
    expected: "Macallan 18 Year"
  }
];

truncatedNames.forEach(test => {
  const cleaned = V25CriticalFixes.cleanTruncatedName(test.input);
  const success = cleaned === test.expected;
  
  console.log(`\nInput: "${test.input}"`);
  console.log(`Expected: "${test.expected}"`);
  console.log(`Got: "${cleaned}"`);
  console.log(`${success ? '✅ PASS' : '❌ FAIL'}`);
});

// Test complete fix application
console.log('\n\n📋 Testing Complete Fix Application:');
console.log('-'.repeat(60));

const spiritObjects = [
  {
    name: "Glenfiddich 12 Year Single Malt Scotch Whisky 1. Crown Wine ...",
    type: "Scotch",
    description: "The world's best selling single malt"
  },
  {
    name: "The History Of Glenfiddich Whisky",
    type: "Scotch",
    description: "Learn about the history"
  }
];

spiritObjects.forEach((spirit, index) => {
  console.log(`\n🥃 Spirit ${index + 1} BEFORE fixes:`);
  console.log(`  Name: "${spirit.name}"`);
  console.log(`  Valid: ${V25CriticalFixes.isValidProductName(spirit.name)}`);
  
  const fixed = V25CriticalFixes.applyAllFixes(spirit);
  
  console.log(`\n🔧 Spirit ${index + 1} AFTER fixes:`);
  console.log(`  Name: "${fixed.name}"`);
  console.log(`  Brand: "${fixed.brand}"`);
  console.log(`  Valid: ${V25CriticalFixes.isValidProductName(fixed.name)}`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ Test completed!\n');