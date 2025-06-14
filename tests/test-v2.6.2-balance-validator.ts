#!/usr/bin/env tsx
import { smartProductValidator } from '../src/services/smart-product-validator.js';
import { logger } from '../src/utils/logger.js';

/**
 * Test V2.6.2 - Balance validator to reject non-products while accepting valid ones
 * Based on real CSV data analysis from 2025-06-14
 */

const testCases = [
  // Non-products that MUST be rejected
  { name: "Bbc Bourbon Barrel Loft Event Space In Louisville Ky The Vendry", shouldPass: false, reason: "Event venue" },
  { name: "Bardstown Bourbon Co Bottling Joseph & Joseph Architects", shouldPass: false, reason: "Architecture firm" },
  { name: "Bourbon Experience Belle Meade Winery Nashville's Oldest Winery", shouldPass: false, reason: "Tour/experience" },
  { name: "Colonel De New Riff Barrel Smoked Spices", shouldPass: false, reason: "Food product" },
  { name: "Bourbon Honey Gold Rush", shouldPass: false, reason: "Cocktail recipe" },
  { name: "Bourbon The Well Known Bourbons With Sweeter Notes", shouldPass: false, reason: "Article/category" },
  { name: "Discovery Series 1 The Bardstown Bourbon Company A New Blend Of Bourbon Makers", shouldPass: false, reason: "Tagline as name" },
  { name: "Drink Belle Meade Bourbon W/ Charlie Of Nelson's Green Brier Distilling Qbb", shouldPass: false, reason: "Event/article" },
  
  // Valid products that MUST be accepted
  { name: "Buffalo Trace Bourbon", shouldPass: true, reason: "Valid product" },
  { name: "Four Roses Small Batch Bourbon", shouldPass: true, reason: "Valid product" },
  { name: "High West Double Rye Whiskey (92 Proof)", shouldPass: true, reason: "Valid product" },
  { name: "Bardstown Bourbon Company Discovery Series 10 Spring 2023", shouldPass: true, reason: "Valid product" },
  { name: "Belle Meade Cask Strength Reserve Bourbon Whiskey", shouldPass: true, reason: "Valid product" },
  { name: "Four Roses Limited Edition Small Batch Barrel Strength Kentucky Straight Bourbon Whiskey", shouldPass: true, reason: "Valid product" },
  { name: "High West A Midwinter Night's Dram Whiskey (98.6 Proof)", shouldPass: true, reason: "Valid product" },
  { name: "Bardstown Bourbon Company Origin Series 6 Year Straight Bourbon", shouldPass: true, reason: "Valid product" },
  
  // Edge cases to test
  { name: "Buffalo Trace Bourbon Brittle", shouldPass: false, reason: "Food product with spirit name" },
  { name: "Four Roses Distillery Kentucky Bourbon Trail", shouldPass: false, reason: "Location/trail" },
  { name: "High West American Whiskey The Whisky Exchange", shouldPass: false, reason: "Website/store page" }
];

async function runTests() {
  console.log('🧪 Testing V2.6.2 Balanced Validator\n');
  console.log('=' .repeat(80));
  
  let passed = 0;
  let failed = 0;
  const failures: any[] = [];
  
  for (const testCase of testCases) {
    const result = await smartProductValidator.validateProductName(testCase.name);
    const actualResult = result.isValid ? 'ACCEPT' : 'REJECT';
    const expectedResult = testCase.shouldPass ? 'ACCEPT' : 'REJECT';
    const status = actualResult === expectedResult ? '✅ PASS' : '❌ FAIL';
    
    if (actualResult === expectedResult) {
      passed++;
    } else {
      failed++;
      failures.push({
        name: testCase.name,
        expected: expectedResult,
        actual: actualResult,
        confidence: result.confidence,
        issues: result.issues,
        reason: testCase.reason
      });
    }
    
    console.log(`\n${status} | ${testCase.reason}`);
    console.log(`Name: "${testCase.name}"`);
    console.log(`Expected: ${expectedResult} | Actual: ${actualResult} | Confidence: ${result.confidence.toFixed(2)}`);
    if (result.issues.length > 0) {
      console.log(`Issues: ${result.issues.join(', ')}`);
    }
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    failures.forEach(f => {
      console.log(`\n- "${f.name}"`);
      console.log(`  Reason: ${f.reason}`);
      console.log(`  Expected: ${f.expected}, Got: ${f.actual}`);
      console.log(`  Confidence: ${f.confidence.toFixed(2)}`);
      console.log(`  Issues: ${f.issues.join(', ')}`);
    });
    
    console.log('\n🔧 The validator needs further adjustment to handle these cases.');
  } else {
    console.log('\n✅ All tests passed! The validator is properly balanced.');
  }
  
  // Show current validator stats
  const stats = smartProductValidator.getStats();
  console.log('\n📈 Validator Learning Stats:');
  console.log(`Total patterns learned: ${stats.totalPatterns}`);
  console.log(`Valid patterns: ${stats.validPatterns}`);
  console.log(`Invalid patterns: ${stats.invalidPatterns}`);
  console.log(`Average confidence: ${stats.avgConfidence.toFixed(2)}`);
}

// Run tests
runTests().catch(console.error);