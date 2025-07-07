/**
 * V3.3 ULTRATHINK Validation Rules Test Suite
 * Tests all the enhanced validation rules to prevent contamination
 */

import { TextProcessor } from '../src/services/text-processor.js';
import { comprehensiveDataQualityValidator } from '../src/services/comprehensive-data-quality-rules.js';
import { whiskyWhiskeyNormalizer } from '../src/services/whisky-whiskey-normalizer.js';
import { logger } from '../src/utils/logger.js';

// Test data from actual contaminated entries found in database audit
const CONTAMINATED_ENTRIES = [
  // Fashion/Clothing
  {
    name: "Scotch & Soda And Joe Jonas Unveil A Stylish Spring Summer 2025",
    expectedBrand: "Unknown", // Should not extract "Scotch &"
    shouldReject: true,
    reason: "Fashion brand contamination"
  },
  {
    name: "Scotch & Soda Men's Printed Relaxed Fit Short Sleeve Shirt",
    expectedBrand: "Unknown",
    shouldReject: true,
    reason: "Clothing item"
  },
  
  // E-commerce/Navigation
  {
    name: "Order Bourbon Online Bourbon Delivery To Your Doorstep",
    expectedBrand: "Unknown", // Should not extract "Order"
    shouldReject: true,
    reason: "E-commerce navigation page"
  },
  {
    name: "Order Gin Online",
    expectedBrand: "Unknown",
    shouldReject: true,
    reason: "Category page"
  },
  {
    name: "Purchase David E Bourbon And Our Full Line Of Top Shelf Spirits",
    expectedBrand: "Unknown", // Should not extract "Purchase"
    shouldReject: true,
    reason: "Store page"
  },
  
  // Blog/Review Content
  {
    name: "Brian's Whiskey Reviews Whiskey For The Ages",
    expectedBrand: "Unknown", // Should not extract "Brian's"
    shouldReject: true,
    reason: "Blog content"
  },
  {
    name: "The Whiskey Shelf Reviews The Old",
    expectedBrand: "Unknown", // Should not extract "The Whiskey"
    shouldReject: true,
    reason: "Review site"
  },
  {
    name: "What Rye Are You Drinking Or Purchased 2025 American Rye Whiskey",
    expectedBrand: "Unknown", // Should not extract "What"
    shouldReject: true,
    reason: "Forum question"
  },
  
  // Article/List Titles
  {
    name: "The World's Top Rum 2025's Finest Selections",
    expectedBrand: "Unknown", // Should not extract "The World"
    shouldReject: true,
    reason: "List article"
  },
  {
    name: "The Top Blended Scotch Whisky",
    expectedBrand: "Unknown", // Should not extract "The Top"
    shouldReject: true,
    reason: "Top list"
  },
  
  // Delivery/Shipping Info
  {
    name: "Clase Azul Gold Tequila (Cannot Ship Local Delivery Only)",
    expectedBrand: "Clase Azul", // Brand OK but name has issues
    shouldReject: true,
    reason: "Contains delivery info"
  },
  
  // Cocktail Recipes
  {
    name: "The Penicillin Cocktail Is A Scotch",
    expectedBrand: "Unknown",
    shouldReject: true,
    reason: "Cocktail recipe"
  }
];

// Valid entries that should pass
const VALID_ENTRIES = [
  {
    name: "Buffalo Trace Kentucky Straight Bourbon Whiskey",
    expectedBrand: "Buffalo Trace",
    shouldReject: false,
    expectedCategory: "Bourbon"
  },
  {
    name: "Lagavulin 16 Year Old Single Malt Scotch Whisky",
    expectedBrand: "Lagavulin",
    shouldReject: false,
    expectedCategory: "Scotch"
  },
  {
    name: "Clase Azul Reposado Tequila",
    expectedBrand: "Clase Azul",
    shouldReject: false,
    expectedCategory: "Tequila"
  }
];

async function runTests() {
  console.log('🧪 V3.3 ULTRATHINK Validation Rules Test Suite\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test contaminated entries
  console.log('📋 Testing Contaminated Entries (Should Reject):');
  console.log('='.repeat(80));
  
  for (const entry of CONTAMINATED_ENTRIES) {
    console.log(`\n🔍 Testing: "${entry.name}"`);
    console.log(`   Expected rejection reason: ${entry.reason}`);
    
    // Test brand extraction
    const extractedBrand = TextProcessor['extractBrandFromName'](entry.name);
    const brandCorrect = extractedBrand === entry.expectedBrand;
    console.log(`   Brand extraction: ${extractedBrand} ${brandCorrect ? '✅' : '❌'} (expected: ${entry.expectedBrand})`);
    
    // Test comprehensive validation
    const validation = comprehensiveDataQualityValidator.validate({ name: entry.name, brand: extractedBrand });
    const correctlyRejected = !validation.canStore;
    console.log(`   Quality score: ${validation.score}/100`);
    console.log(`   Can store: ${validation.canStore} ${correctlyRejected ? '✅' : '❌'} (should be false)`);
    
    if (validation.errors.length > 0) {
      console.log(`   Critical errors:`);
      validation.errors.forEach(err => {
        console.log(`     - ${err.code}: ${err.message}`);
      });
    }
    
    if (brandCorrect && correctlyRejected) {
      passed++;
    } else {
      failed++;
      console.log(`   ⚠️ TEST FAILED!`);
    }
  }
  
  // Test valid entries
  console.log('\n\n📋 Testing Valid Entries (Should Accept):');
  console.log('='.repeat(80));
  
  for (const entry of VALID_ENTRIES) {
    console.log(`\n🔍 Testing: "${entry.name}"`);
    
    // Test brand extraction
    const extractedBrand = TextProcessor['extractBrandFromName'](entry.name);
    const brandCorrect = extractedBrand === entry.expectedBrand;
    console.log(`   Brand extraction: ${extractedBrand} ${brandCorrect ? '✅' : '❌'} (expected: ${entry.expectedBrand})`);
    
    // Test category normalization
    const normalizedCategory = TextProcessor.normalizeCategory(entry.name);
    const categoryCorrect = normalizedCategory === entry.expectedCategory;
    console.log(`   Category: ${normalizedCategory} ${categoryCorrect ? '✅' : '❌'} (expected: ${entry.expectedCategory})`);
    
    // Test comprehensive validation
    const validation = comprehensiveDataQualityValidator.validate({ 
      name: entry.name, 
      brand: extractedBrand,
      category: normalizedCategory
    });
    const correctlyAccepted = validation.canStore && validation.score >= 70;
    console.log(`   Quality score: ${validation.score}/100`);
    console.log(`   Can store: ${validation.canStore} ${correctlyAccepted ? '✅' : '❌'} (should be true)`);
    
    if (brandCorrect && categoryCorrect && correctlyAccepted) {
      passed++;
    } else {
      failed++;
      console.log(`   ⚠️ TEST FAILED!`);
    }
  }
  
  // Test whisky/whiskey normalization
  console.log('\n\n📋 Testing Whisky/Whiskey Normalization:');
  console.log('='.repeat(80));
  
  const whiskyTests = [
    { input: "Glenfiddich 12 Year Old Whisky", expected: "Glenfiddich 12 Year Old Whisky" },
    { input: "Glenfiddich 12 Year Old Whiskey", expected: "Glenfiddich 12 Year Old Whisky" },
    { input: "Bourbon Whiskey The Whisky", expected: "Bourbon Whisky" }, // Should remove site ref
  ];
  
  for (const test of whiskyTests) {
    const result = whiskyWhiskeyNormalizer.normalize(test.input);
    const correct = result.normalizedName === test.expected;
    console.log(`\n   Input: "${test.input}"`);
    console.log(`   Output: "${result.normalizedName}" ${correct ? '✅' : '❌'}`);
    console.log(`   Expected: "${test.expected}"`);
    
    if (correct) passed++;
    else failed++;
  }
  
  // Summary
  console.log('\n\n📊 Test Summary:');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! V3.3 validation rules are working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the implementation.');
  }
}

// Run the tests
runTests().catch(console.error);