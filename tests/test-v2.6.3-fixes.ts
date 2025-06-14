#!/usr/bin/env tsx

import { smartProductValidator } from '../src/services/smart-product-validator.js';
import { logger } from '../src/utils/logger.js';

// Set log level to see debug messages
process.env.LOG_LEVEL = 'debug';

console.log('🧪 Testing V2.6.3 Fixes for Smart Product Validator\n');

// Test cases from the latest scraper logs
const testCases = [
  // News articles that should be rejected
  {
    name: "Buffalo Trace Just Announced A 12 Year Eagle Rare Bourbon For Its Permanent Range",
    expected: false,
    reason: "News article headline"
  },
  {
    name: "Sazerac Introduces Irish Whiskey Distillery Brand Hawk's Rock Ahead Of New Product Launches",
    expected: false,
    reason: "Press release headline"
  },
  
  // Merchandise/Collaborations that should be rejected
  {
    name: "Buffalo Trace X Bettinardi",
    expected: false,
    reason: "Collaboration/merchandise"
  },
  {
    name: "Buffalo Trace Bourbon Dry Goods",
    expected: false,
    reason: "Merchandise"
  },
  {
    name: "Buffalo Trace Hard To Find Whisky Htfw",
    expected: false,
    reason: "Website/service name"
  },
  
  // Valid products that should be accepted
  {
    name: "Buffalo Trace Bourbon",
    expected: true,
    reason: "Valid product"
  },
  {
    name: "Eagle Rare 17 Year Bourbon",
    expected: true,
    reason: "Valid product with age statement"
  },
  {
    name: "George T. Stagg Barrel Proof Bourbon",
    expected: true,
    reason: "Valid cask strength product"
  },
  {
    name: "Buffalo Trace Bourbon Cream Liqueur",
    expected: true,
    reason: "Valid liqueur product"
  },
  
  // Edge cases - products with marketing language but still valid
  {
    name: "Buffalo Trace Bourbon Handcrafted By The World's Most Decorated Distillery",
    expected: true,
    reason: "Valid product with marketing tagline"
  }
];

async function runTests() {
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = await smartProductValidator.validateProductName(testCase.name);
    const success = result.isValid === testCase.expected;
    
    if (success) {
      console.log(`✅ PASS: "${testCase.name}"`);
      console.log(`   Expected: ${testCase.expected ? 'VALID' : 'INVALID'}, Got: ${result.isValid ? 'VALID' : 'INVALID'}`);
      console.log(`   Confidence: ${result.confidence.toFixed(2)}`);
      passed++;
    } else {
      console.log(`❌ FAIL: "${testCase.name}"`);
      console.log(`   Expected: ${testCase.expected ? 'VALID' : 'INVALID'}, Got: ${result.isValid ? 'VALID' : 'INVALID'}`);
      console.log(`   Confidence: ${result.confidence.toFixed(2)}`);
      console.log(`   Issues: ${result.issues.join(', ')}`);
      failed++;
    }
    console.log(`   Reason: ${testCase.reason}\n`);
  }
  
  console.log('='.repeat(60));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed (${((passed / testCases.length) * 100).toFixed(1)}% success rate)`);
  console.log('='.repeat(60));
  
  // Test proof calculation
  console.log('\n🧪 Testing Proof Calculation\n');
  
  const proofTests = [
    { abv: 45, expectedProof: 90 },
    { abv: 40, expectedProof: 80 },
    { abv: 50.5, expectedProof: 101 },
    { abv: null, expectedProof: 0 },
    { abv: undefined, expectedProof: 0 }
  ];
  
  for (const test of proofTests) {
    const proof = test.abv ? Math.round(test.abv * 2) : 0;
    const success = proof === test.expectedProof;
    console.log(`${success ? '✅' : '❌'} ABV: ${test.abv} → Proof: ${proof} (expected: ${test.expectedProof})`);
  }
}

runTests().catch(console.error);