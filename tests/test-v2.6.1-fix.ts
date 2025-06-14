#!/usr/bin/env tsx
import { smartProductValidator } from '../src/services/smart-product-validator.js';
import { logger } from '../src/utils/logger.js';

/**
 * Test V2.6.1 emergency fix for smart validator
 * Testing real-world products that were incorrectly rejected
 */

const testCases = [
  // Previously rejected valid products
  "Buffalo Trace Bourbon - Handcrafted by the world's most decorated distillery",
  "Maker's Mark Bourbon",
  "Wild Turkey Longbranch Small-batch Bourbon Whiskey",
  "St. George Baller Single Malt Whiskey",
  "Michter's Toasted Barrel Finish Bourbon",
  "Russell's Reserve 10 Year Bourbon",
  "Woodford Reserve Kentucky Straight Bourbon Whiskey Bottle",
  
  // Products with store names that should pass
  "Buffalo Trace Bourbon - Total Wine",
  "Maker's Mark - Available at K&L Wines",
  "Eagle Rare 10 Year - Remedy Liquor",
  
  // Products with marketing text
  "Four Roses Limited Edition Small Batch - Award Winner",
  "Blanton's Single Barrel - The Original Single Barrel Bourbon",
  "Pappy Van Winkle 15 Year - World's Most Sought After Bourbon",
  
  // Simple valid names
  "Jim Beam",
  "Wild Turkey 101",
  "Elijah Craig Small Batch",
  "Knob Creek 9 Year",
  
  // Should still reject these
  "Bourbon Academy At Woodford Reserve",
  "It's All About The Whiskey",
  "Available For Purchase Are A Selection Of Bourbons",
  "1 Ky-jim Beam Whiskey University",
  "Bourbon Belles And Whiskey Women",
  "Call (323) 655 9995",
  ". Bourbon. Result"
];

async function runTests() {
  console.log('🧪 Testing V2.6.1 Smart Validator Fix\n');
  console.log('=' .repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = await smartProductValidator.validateProductName(testCase);
    const shouldPass = !testCase.includes('Academy') && 
                      !testCase.includes("It's All About") &&
                      !testCase.includes("Available For Purchase") &&
                      !testCase.includes("University") &&
                      !testCase.includes("Belles And Whiskey Women") &&
                      !testCase.includes("Call (") &&
                      !testCase.startsWith(". ");
    
    const status = shouldPass ? (result.isValid ? '✅ PASS' : '❌ FAIL') : (!result.isValid ? '✅ PASS' : '❌ FAIL');
    const expectedResult = shouldPass ? 'ACCEPT' : 'REJECT';
    
    if ((shouldPass && result.isValid) || (!shouldPass && !result.isValid)) {
      passed++;
    } else {
      failed++;
    }
    
    console.log(`\nTest: "${testCase}"`);
    console.log(`Expected: ${expectedResult} | Actual: ${result.isValid ? 'ACCEPT' : 'REJECT'} | ${status}`);
    console.log(`Confidence: ${result.confidence.toFixed(2)} | Issues: ${result.issues.length}`);
    if (result.issues.length > 0) {
      console.log(`Issues: ${result.issues.join(', ')}`);
    }
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed! The validator needs further adjustment.');
  } else {
    console.log('\n✅ All tests passed! The validator is working correctly.');
  }
}

// Run tests
runTests().catch(console.error);