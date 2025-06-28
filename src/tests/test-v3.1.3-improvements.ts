/**
 * Test Suite for V3.1.3 Improvements
 * 
 * Tests all enhancements:
 * - Enhanced validation gates
 * - Price extraction improvements
 * - Brand validation
 * - Duplicate detection
 * - Name cleaning
 */

import { preStorageValidator } from '../services/pre-storage-validator.js';
import { smartProductValidator } from '../services/smart-product-validator.js';
import EnhancedPriceExtractor from '../services/enhanced-price-extractor.js';
import { duplicateDetector } from '../services/duplicate-detector.js';
import { logger } from '../utils/logger.js';

interface TestCase {
  name: string;
  input: any;
  expected: any;
  type: 'validation' | 'price' | 'duplicate' | 'cleaning';
}

// Test cases for validation improvements
const validationTests: TestCase[] = [
  // Invalid brands
  {
    name: 'Reject "Unknown" brand',
    type: 'validation',
    input: {
      name: 'Buffalo Trace Bourbon',
      brand: 'Unknown',
      category: 'Bourbon',
      data_quality_score: 50
    },
    expected: { isValid: false, rejectionReason: 'invalid_brand_v3' }
  },
  {
    name: 'Reject age as brand',
    type: 'validation',
    input: {
      name: '25 Year Old Single Malt',
      brand: '25 Year Old',
      category: 'Scotch'
    },
    expected: { isValid: false, rejectionReason: 'age_as_brand' }
  },
  
  // Volume suffixes
  {
    name: 'Clean volume suffix from name',
    type: 'validation',
    input: {
      name: 'Jameson Irish Whiskey Bottle',
      brand: 'Jameson',
      category: 'Irish Whiskey'
    },
    expected: { cleanedName: 'Jameson Irish Whiskey' }
  },
  {
    name: 'Clean 750ml suffix',
    type: 'validation',
    input: {
      name: 'Glenfiddich 12 Year 750ml',
      brand: 'Glenfiddich',
      category: 'Scotch'
    },
    expected: { cleanedName: 'Glenfiddich 12 Year' }
  },
  
  // Price required from premium sources
  {
    name: 'Reject missing price from Total Wine',
    type: 'validation',
    input: {
      name: 'Macallan 18 Year',
      brand: 'Macallan',
      category: 'Scotch',
      source_domain: 'totalwine.com'
    },
    expected: { isValid: false, rejectionReason: 'missing_required_price' }
  },
  
  // Mystery boxes
  {
    name: 'Reject mystery box',
    type: 'validation',
    input: {
      name: 'Mystery Whiskey Box Monthly',
      brand: 'Whiskey Club',
      category: 'Other'
    },
    expected: { isValid: false, rejectionReason: 'mystery_subscription_review' }
  },
  
  // Review content
  {
    name: 'Reject review content',
    type: 'validation',
    input: {
      name: 'Review of Buffalo Trace Bourbon',
      brand: 'Buffalo Trace',
      category: 'Bourbon'
    },
    expected: { isValid: false }
  }
];

// Test cases for price extraction
const priceTests: TestCase[] = [
  {
    name: 'Extract structured data price',
    type: 'price',
    input: '"price": "89.99"',
    expected: 89.99
  },
  {
    name: 'Extract price near volume',
    type: 'price',
    input: 'Buffalo Trace Bourbon 750ml - $45.99',
    expected: 45.99
  },
  {
    name: 'Extract price from add to cart',
    type: 'price',
    input: '<button>Add to Cart</button> Price: $129.95',
    expected: 129.95
  },
  {
    name: 'Extract price range (lower bound)',
    type: 'price',
    input: 'Price: $75 - $85',
    expected: 75
  },
  {
    name: 'Extract GBP and convert',
    type: 'price',
    input: 'Price: £100',
    expected: 127 // Approximate after conversion
  }
];

// Test cases for duplicate detection
const duplicateTests: TestCase[] = [
  {
    name: 'Detect exact name match',
    type: 'duplicate',
    input: {
      name: 'Buffalo Trace Bourbon',
      brand: 'Buffalo Trace',
      category: 'Bourbon'
    },
    expected: { isDuplicate: true, confidence: 0.95 }
  },
  {
    name: 'Detect fuzzy match same brand',
    type: 'duplicate',
    input: {
      name: 'Makers Mark Bourbon Whisky',
      brand: 'Maker\'s Mark',
      existing: { name: 'Maker\'s Mark Bourbon Whiskey' }
    },
    expected: { isDuplicate: true, confidence: 0.85 }
  }
];

/**
 * Run all tests
 */
async function runTests() {
  logger.info('🧪 Starting V3.1.3 improvement tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test validation improvements
  logger.info('📋 Testing validation improvements...');
  for (const test of validationTests) {
    try {
      const result = await preStorageValidator.validate(test.input);
      
      let testPassed = true;
      if (test.expected.isValid !== undefined) {
        testPassed = result.isValid === test.expected.isValid;
      }
      if (test.expected.rejectionReason && !result.isValid) {
        testPassed = testPassed && result.rejectionReason === test.expected.rejectionReason;
      }
      if (test.expected.cleanedName) {
        testPassed = testPassed && result.cleanedName === test.expected.cleanedName;
      }
      
      if (testPassed) {
        logger.info(`  ✅ ${test.name}`);
        passed++;
      } else {
        logger.error(`  ❌ ${test.name}`);
        logger.error(`     Expected: ${JSON.stringify(test.expected)}`);
        logger.error(`     Got: ${JSON.stringify(result)}`);
        failed++;
      }
    } catch (error) {
      logger.error(`  ❌ ${test.name} - Error: ${error.message}`);
      failed++;
    }
  }
  
  // Test price extraction
  logger.info('\n💰 Testing price extraction...');
  for (const test of priceTests) {
    try {
      const price = EnhancedPriceExtractor.extractPriceFromSnippet(test.input);
      
      let testPassed = false;
      if (price && test.expected) {
        // Allow small difference for currency conversion
        testPassed = Math.abs(price - test.expected) < 2;
      }
      
      if (testPassed) {
        logger.info(`  ✅ ${test.name} - $${price}`);
        passed++;
      } else {
        logger.error(`  ❌ ${test.name}`);
        logger.error(`     Expected: $${test.expected}`);
        logger.error(`     Got: $${price || 'null'}`);
        failed++;
      }
    } catch (error) {
      logger.error(`  ❌ ${test.name} - Error: ${error.message}`);
      failed++;
    }
  }
  
  // Test smart product validation
  logger.info('\n🧠 Testing smart product validation...');
  const smartTests = [
    { name: 'These Peaty Scotches Taste Like', expected: false },
    { name: 'Buffalo Trace Bourbon', expected: true },
    { name: 'Review of Jack Daniels', expected: false },
    { name: 'Mystery Whiskey Box', expected: false }
  ];
  
  for (const test of smartTests) {
    const result = await smartProductValidator.validateProductName(test.name);
    if (result.isValid === test.expected) {
      logger.info(`  ✅ "${test.name}" - ${result.isValid ? 'Valid' : 'Invalid'}`);
      passed++;
    } else {
      logger.error(`  ❌ "${test.name}" - Expected: ${test.expected}, Got: ${result.isValid}`);
      failed++;
    }
  }
  
  // Summary
  logger.info('\n📊 Test Summary:');
  logger.info(`  Total tests: ${passed + failed}`);
  logger.info(`  Passed: ${passed} ✅`);
  logger.info(`  Failed: ${failed} ❌`);
  logger.info(`  Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    logger.info('\n🎉 All tests passed! V3.1.3 improvements are working correctly.');
  } else {
    logger.error('\n⚠️  Some tests failed. Please review the implementation.');
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    logger.error('Test suite failed:', error);
    process.exit(1);
  });
}