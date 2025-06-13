import { 
  NON_PRODUCT_FILTERS,
  containsNonProductPatterns, 
  isNonProductUrl,
  hasRequiredSpiritIndicators,
  hasAlcoholContent 
} from './config/non-product-filters.js';
import { spiritExtractor } from './services/spirit-extractor.js';
import { spiritDiscovery } from './services/spirit-discovery.js';
import { logger } from './utils/logger.js';

interface TestCase {
  input: string;
  description?: string;
  url?: string;
  expectedValid: boolean;
  reason: string;
  source: 'csv' | 'synthetic';
}

// Test cases directly from the problematic CSV
const csvTestCases: TestCase[] = [
  // Valid spirits that should pass
  {
    input: "Buffalo Trace Kentucky Straight Bourbon",
    description: "Buffalo Trace Kentucky Straight Bourbon Whiskey is made from the finest corn, rye and barley malt",
    url: "https://www.totalwine.com/spirits/bourbon/buffalo-trace",
    expectedValid: true,
    reason: "Valid bourbon product",
    source: 'csv'
  },
  {
    input: "Eagle Rare Kentucky Straight Bourbon Whiskey 10 Year",
    description: "Eagle Rare 10 Year Bourbon is a single barrel bourbon aged for no less than 10 years",
    expectedValid: true,
    reason: "Valid bourbon with age statement",
    source: 'csv'
  },
  {
    input: "Woodford Reserve Bourbon",
    description: "$39.99 Woodford Reserve Double Oaked Bourbon 750ml",
    expectedValid: true,
    reason: "Valid bourbon with price",
    source: 'csv'
  },
  
  // Non-products that should be filtered
  {
    input: "Goose Island Bourbon County Stout 5-year Vertical",
    description: "Aged in bourbon barrels, this beer has subtle yet familiar flavors of vanilla and oak",
    expectedValid: false,
    reason: "Beer product (stout)",
    source: 'csv'
  },
  {
    input: "Retail Bourbon-bhg",
    description: "But this rich, deeply flavored chocolate pecan pie will also go over great at any potluck",
    expectedValid: false,
    reason: "Food/retail content",
    source: 'csv'
  },
  {
    input: "Buffalo Trace's Single Estate Farm Continues Expansion",
    description: "Double distilled and aged for 3 years in ex bourbon barrels",
    url: "https://whiskyadvocate.com/news",
    expectedValid: false,
    reason: "News article",
    source: 'csv'
  },
  {
    input: "Founder's Original Bourbon Sour",
    description: "291 Colorado Rye Whiskey made from rye malt, sour mash",
    expectedValid: false,
    reason: "Cocktail recipe",
    source: 'csv'
  },
  {
    input: "Kentucky Distillery & Bourbon Tours",
    description: "Visit us for an unforgettable bourbon experience",
    expectedValid: false,
    reason: "Tour/experience",
    source: 'csv'
  },
  {
    input: "Whiskey Trail Home",
    description: "Explore the legendary bourbon trail",
    expectedValid: false,
    reason: "Tour/travel content",
    source: 'csv'
  },
  {
    input: "Holiday Cask Strength Single Barrels",
    description: "Special holiday releases available now",
    expectedValid: false,
    reason: "Generic retail/seasonal content",
    source: 'csv'
  },
];

// Additional synthetic test cases
const syntheticTestCases: TestCase[] = [
  // Edge cases for beer filtering
  {
    input: "Maker's Mark Bourbon aged in oak barrels",
    description: "Kentucky straight bourbon whiskey aged in charred oak barrels",
    expectedValid: true,
    reason: "Valid bourbon (not beer despite 'barrel' mention)",
    source: 'synthetic'
  },
  {
    input: "Bourbon Barrel Aged Imperial Stout",
    description: "Rich, complex beer aged in bourbon barrels",
    expectedValid: false,
    reason: "Beer product with bourbon aging",
    source: 'synthetic'
  },
  
  // Merchandise edge cases
  {
    input: "Jack Daniel's Tennessee Whiskey",
    expectedValid: true,
    reason: "Valid whiskey product",
    source: 'synthetic'
  },
  {
    input: "Jack Daniel's Men's Black Polo Shirt",
    expectedValid: false,
    reason: "Clothing merchandise",
    source: 'synthetic'
  },
  
  // Tour vs product
  {
    input: "Four Roses Single Barrel Select",
    expectedValid: true,
    reason: "Valid bourbon product",
    source: 'synthetic'
  },
  {
    input: "Four Roses Distillery Tour Experience",
    expectedValid: false,
    reason: "Tour/experience",
    source: 'synthetic'
  },
];

async function runComprehensiveTests() {
  console.log('🧪 Running Comprehensive Non-Product Filtering Tests...\n');
  
  const allTests = [...csvTestCases, ...syntheticTestCases];
  let passed = 0;
  let failed = 0;
  
  // Group by source for better reporting
  const csvTests = allTests.filter(t => t.source === 'csv');
  const synthTests = allTests.filter(t => t.source === 'synthetic');
  
  console.log('📋 CSV-Based Test Cases (from problematic data):\n');
  await runTestGroup(csvTests);
  
  console.log('\n📋 Synthetic Test Cases (edge cases):\n');
  await runTestGroup(synthTests);
  
  async function runTestGroup(tests: TestCase[]) {
    for (const test of tests) {
      const result = await testNonProductFiltering(test);
      if (result) {
        passed++;
      } else {
        failed++;
      }
    }
  }
  
  // Final report
  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 FINAL TEST RESULTS:`);
  console.log(`   Total Tests: ${allTests.length}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / allTests.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log(`\n❌ ${failed} tests failed. Review the output above for details.`);
  } else {
    console.log(`\n✅ All tests passed! Non-product filtering is working correctly.`);
  }
}

async function testNonProductFiltering(test: TestCase): Promise<boolean> {
  const fullText = `${test.input} ${test.description || ''}`;
  
  console.log(`\nTesting: "${test.input}"`);
  if (test.description) {
    console.log(`   Description: "${test.description.substring(0, 60)}${test.description.length > 60 ? '...' : ''}"`);
  }
  console.log(`   Expected: ${test.expectedValid ? 'VALID ✅' : 'FILTERED ❌'} (${test.reason})`);
  
  // Check all non-product categories
  const categories: Array<keyof typeof NON_PRODUCT_FILTERS.patterns> = [
    'tours', 'merchandise', 'beer', 'articles', 'retail', 'cocktails', 'food', 'events'
  ];
  
  let foundNonProduct = false;
  let foundCategory = '';
  
  for (const category of categories) {
    if (containsNonProductPatterns(fullText, category)) {
      foundNonProduct = true;
      foundCategory = category;
      break;
    }
  }
  
  // Check URL if provided
  let urlIsNonProduct = false;
  if (test.url) {
    const urlCheck = isNonProductUrl(test.url);
    if (urlCheck.isNonProduct) {
      urlIsNonProduct = true;
      if (!foundNonProduct) {
        foundCategory = urlCheck.category || 'unknown';
      }
    }
  }
  
  // Check spirit indicators
  const hasSpirit = hasRequiredSpiritIndicators(fullText);
  const hasAlcohol = hasAlcoholContent(fullText);
  
  // Determine if it would be filtered
  const wouldBeFiltered = foundNonProduct || urlIsNonProduct;
  const isValid = !wouldBeFiltered && hasSpirit;
  
  // Check if result matches expectation
  const testPassed = isValid === test.expectedValid;
  
  console.log(`   Non-product detected: ${foundNonProduct ? `YES (${foundCategory})` : 'NO'}`);
  console.log(`   Spirit indicators: ${hasSpirit ? 'YES' : 'NO'}`);
  console.log(`   Result: ${testPassed ? 'PASS ✅' : 'FAIL ❌'}`);
  
  if (!testPassed) {
    console.log(`   ⚠️  UNEXPECTED RESULT!`);
    console.log(`   Expected: ${test.expectedValid ? 'Valid' : 'Filtered'}, Got: ${isValid ? 'Valid' : 'Filtered'}`);
  }
  
  return testPassed;
}

// Also test the spirit discovery service
async function testSpiritDiscovery() {
  console.log('\n\n' + '='.repeat(80));
  console.log('\n🔍 Testing Spirit Discovery Service Filtering...\n');
  
  const testQueries = [
    "Goose Island Bourbon County Stout",
    "Buffalo Trace Kentucky Straight Bourbon",
    "Kentucky Distillery Tours",
    "Men's Bourbon Whiskey Polo Shirt",
  ];
  
  for (const query of testQueries) {
    console.log(`\nQuery: "${query}"`);
    
    // Check if discovery service would filter this
    const isValid = spiritDiscovery['isValidSpiritName'](query);
    console.log(`   Spirit Discovery: ${isValid ? 'VALID ✅' : 'FILTERED ❌'}`);
  }
}

// Run all tests
(async () => {
  await runComprehensiveTests();
  await testSpiritDiscovery();
})().catch(console.error);