#!/usr/bin/env tsx

import { smartProductValidator } from '../src/services/smart-product-validator.js';
import { logger } from '../src/utils/logger.js';
import colors from 'colors';

// Suppress debug logs for cleaner output
process.env.LOG_LEVEL = 'warn';

interface TestCase {
  name: string;
  expectedValid: boolean;
  description: string;
}

const testCases: TestCase[] = [
  // Valid products - should PASS
  {
    name: "Buffalo Trace Bourbon",
    expectedValid: true,
    description: "Simple valid product"
  },
  {
    name: "Macallan 18 Year Old",
    expectedValid: true,
    description: "Product with age statement"
  },
  {
    name: "Jack Daniel's Single Barrel Select",
    expectedValid: true,
    description: "Product with possessive and style"
  },
  {
    name: "WhistlePig 10 Year Straight Rye",
    expectedValid: true,
    description: "Complex valid product name"
  },
  {
    name: "Four Roses Limited Edition Small Batch 2024",
    expectedValid: true,
    description: "Product with edition and year"
  },
  {
    name: "Blanton's Gold Edition",
    expectedValid: true,
    description: "Product with edition"
  },
  {
    name: "Uncle Nearest 1856 Premium Whiskey",
    expectedValid: true,
    description: "Product with year in name"
  },
  {
    name: "Balcones Texas Single Malt",
    expectedValid: true,
    description: "Product with location"
  },
  
  // Invalid names - should FAIL
  {
    name: "Bourbon Academy At Woodford Reserve",
    expectedValid: false,
    description: "Educational content, not product"
  },
  {
    name: "Available For Purchase Are A Selection Of Bourbons",
    expectedValid: false,
    description: "Store listing, not product"
  },
  {
    name: "It's All About The Whiskey",
    expectedValid: false,
    description: "Article title, not product"
  },
  {
    name: "Call (323) 655 9995 for pricing",
    expectedValid: false,
    description: "Contains phone number"
  },
  {
    name: ". Bourbon. Result",
    expectedValid: false,
    description: "Fragment, not valid name"
  },
  {
    name: "Bourbon Biscuits",
    expectedValid: false,
    description: "Food item, not spirit"
  },
  {
    name: "Buffalo Trace Vs Eagle Rare Comparison",
    expectedValid: false,
    description: "Comparison article, not product"
  },
  {
    name: "1 Ky-jim Beam Whiskey University",
    expectedValid: false,
    description: "Educational content"
  },
  {
    name: "2024 World's Most Admired Whiskey-michter's Distillery",
    expectedValid: false,
    description: "Award announcement, not product"
  },
  {
    name: "About Whistle Pig Whistle Pig Whiskey",
    expectedValid: false,
    description: "About page content"
  },
  {
    name: "Bourbon Belles And Whiskey Women",
    expectedValid: false,
    description: "Book/article title"
  },
  {
    name: "Bourbon Spirits Call (323) 655 9995",
    expectedValid: false,
    description: "Store listing with phone"
  },
  {
    name: "Kentucky Remedy Liquor",
    expectedValid: false,
    description: "Store name, not product"
  },
  {
    name: "Bourbon-glazed Pork Belly Chunks",
    expectedValid: false,
    description: "Food recipe, not spirit"
  },
  {
    name: "Bourbon Barrel Aged Coffee",
    expectedValid: false,
    description: "Coffee product, not spirit"
  },
  
  // Edge cases - normalization tests
  {
    name: "JackDaniels12YearOld",
    expectedValid: true,
    description: "Should normalize camelCase"
  },
  {
    name: "Whistle   Pig   10   Year",
    expectedValid: true,
    description: "Should normalize spacing"
  },
  {
    name: "Buffalo Trace Bourbon.",
    expectedValid: true,
    description: "Should remove trailing punctuation"
  },
  
  // Generic categories - should FAIL
  {
    name: "bottled in bond bourbon",
    expectedValid: false,
    description: "Generic category, not specific product"
  },
  {
    name: "single barrel bourbon",
    expectedValid: false,
    description: "Generic category"
  },
  {
    name: "straight bourbon whiskey",
    expectedValid: false,
    description: "Generic category"
  }
];

async function runTests() {
  console.log(colors.cyan('\n🧪 Testing V2.6 Smart Product Validator\n'));
  console.log('='.repeat(80));
  
  let passed = 0;
  let failed = 0;
  let totalConfidence = 0;
  
  // Test each case
  for (const testCase of testCases) {
    const result = await smartProductValidator.validateProductName(testCase.name);
    const success = result.isValid === testCase.expectedValid;
    
    if (success) {
      passed++;
      console.log(colors.green('✅ PASS'), `${testCase.name}`);
    } else {
      failed++;
      console.log(colors.red('❌ FAIL'), `${testCase.name}`);
      console.log(colors.red(`   Expected: ${testCase.expectedValid ? 'VALID' : 'INVALID'}, Got: ${result.isValid ? 'VALID' : 'INVALID'}`));
    }
    
    // Show details
    console.log(colors.gray(`   Description: ${testCase.description}`));
    console.log(colors.gray(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`));
    
    if (result.issues.length > 0) {
      console.log(colors.yellow(`   Issues: ${result.issues.join(', ')}`));
    }
    
    if (result.suggestions.length > 0) {
      console.log(colors.blue(`   Suggestions: ${result.suggestions.join(', ')}`));
    }
    
    if (result.normalizedName && result.normalizedName !== testCase.name) {
      console.log(colors.magenta(`   Normalized: "${result.normalizedName}"`));
    }
    
    console.log('');
    
    totalConfidence += result.confidence;
    
    // Teach the validator
    smartProductValidator.learnFromFeedback(
      testCase.name, 
      testCase.expectedValid,
      testCase.description
    );
  }
  
  // Summary
  console.log('='.repeat(80));
  console.log(colors.cyan('\n📊 Test Summary\n'));
  console.log(`Total Tests: ${testCases.length}`);
  console.log(colors.green(`Passed: ${passed}`));
  console.log(colors.red(`Failed: ${failed}`));
  console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  console.log(`Average Confidence: ${(totalConfidence / testCases.length * 100).toFixed(1)}%`);
  
  // Show learning stats
  const stats = smartProductValidator.getStats();
  console.log(colors.cyan('\n📚 Learning Statistics\n'));
  console.log(`Patterns Learned: ${stats.totalPatterns}`);
  console.log(`Valid Patterns: ${stats.validPatterns}`);
  console.log(`Invalid Patterns: ${stats.invalidPatterns}`);
  console.log(`Average Pattern Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
  
  // Test specific normalization features
  console.log(colors.cyan('\n🔧 Testing Normalization Features\n'));
  
  const normalizationTests = [
    { input: "Ba Lcones Whiskey", expected: "Ba Lcones Whiskey" }, // Should not change valid spacing
    { input: "JackDanielsOldNo7", expected: "Jack Daniels Old No7" },
    { input: "750ML", expected: "750ml" },
    { input: "Buffalo Trace!!!", expected: "Buffalo Trace" },
    { input: "   Spaced    Out    Name   ", expected: "Spaced Out Name" }
  ];
  
  for (const test of normalizationTests) {
    const result = await smartProductValidator.validateProductName(test.input);
    const normalized = result.normalizedName || test.input;
    console.log(`${test.input} → ${normalized}`);
  }
  
  // Return success/failure
  if (failed === 0) {
    console.log(colors.green('\n✅ All tests passed! V2.6 Smart Validation is working correctly.\n'));
    return true;
  } else {
    console.log(colors.red(`\n❌ ${failed} tests failed. Smart validation needs fixes.\n`));
    return false;
  }
}

// Run the tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error(colors.red('Test error:'), error);
  process.exit(1);
});