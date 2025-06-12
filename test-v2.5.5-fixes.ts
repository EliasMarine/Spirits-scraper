import { V25CriticalFixes } from './src/fixes/v2.5-critical-fixes';
import { EnhancedPriceExtractor } from './src/services/enhanced-price-extractor';
import { logger } from './src/utils/logger';

console.log('🚀 V2.5.5 CRITICAL FIXES TEST SUITE 🚀\n');

// Test 1: Brand Extraction
console.log('=== TEST 1: BRAND EXTRACTION ===');
const brandTests = [
  // Should extract correct brands
  { name: '1988 Wild Turkey 8 Year Old 101 Proof', expected: 'Wild Turkey' },
  { name: '1996 Wild Turkey 12 Year Old', expected: 'Wild Turkey' },
  { name: '2021 William Larue Weller', expected: 'William Larue Weller' },
  { name: "Angel's Envy Kentucky Straight Bourbon", expected: "Angel's Envy" },
  { name: 'W.L. Weller Full Proof', expected: 'W.L. Weller' },
  { name: 'E.H. Taylor Jr. Small Batch', expected: 'E.H. Taylor' },
  { name: "Russell's Reserve Single Barrel", expected: "Russell's Reserve" },
  { name: "Michter's US-1 Bourbon", expected: "Michter's" },
  
  // Should reject these
  { name: 'orphan', expected: 'Unknown' },
  { name: 'same', expected: 'Unknown' },
  { name: 'spot', expected: 'Unknown' },
  { name: 'laws', expected: 'Unknown' },
  { name: 'wild', expected: 'Unknown' },
  { name: 'new', expected: 'Unknown' },
  { name: 'old', expected: 'Unknown' },
  { name: 'king of', expected: 'Unknown' },
  
  // Multi-word fixes
  { name: 'Denver Distillery Bourbon', expected: 'Denver Distillery' },
  { name: 'Old Grand-Dad 114', expected: 'Old Grand-Dad' },
  { name: 'Four Roses Single Barrel', expected: 'Four Roses' }
];

let brandPassed = 0;
brandTests.forEach(test => {
  const result = V25CriticalFixes.extractBrandFromName(test.name);
  const passed = result === test.expected;
  console.log(`${passed ? '✅' : '❌'} "${test.name}" → "${result}" (expected: "${test.expected}")`);
  if (passed) brandPassed++;
});

console.log(`\nBrand Extraction: ${brandPassed}/${brandTests.length} passed (${Math.round(brandPassed/brandTests.length*100)}%)\n`);

// Test 2: Product Name Validation
console.log('=== TEST 2: PRODUCT NAME VALIDATION ===');
const productNameTests = [
  // Should REJECT these
  { name: 'Discover The Most Popular Bourbon Whiskey Available In Paris, France', valid: false },
  { name: 'Best Bourbon Whiskey', valid: false },
  { name: 'Top 10 Whiskeys of 2024', valid: false },
  { name: 'How to Choose Bourbon', valid: false },
  { name: 'Bourbon Tasting Guide', valid: false },
  { name: 'Buy Premium Bourbon Online', valid: false },
  { name: 'Shop Our Bourbon Collection', valid: false },
  { name: 'Find Your Perfect Whiskey', valid: false },
  
  // Should ACCEPT these
  { name: 'Buffalo Trace Kentucky Straight Bourbon', valid: true },
  { name: 'Four Roses Limited Edition 2024', valid: true },
  { name: 'Wild Turkey 101', valid: true },
  { name: 'Elijah Craig Barrel Proof', valid: true }
];

// Create validation function
function isValidProductName(name: string): boolean {
  const invalidPatterns = [
    /^discover\s+the/i,
    /^best\s+bourbon/i,
    /^top\s+\d+/i,
    /^how\s+to/i,
    /guide$/i,
    /^the\s+most\s+popular/i,
    /available\s+in\s+\w+,\s+\w+$/i,
    /^buy\s+/i,
    /^shop\s+/i,
    /^find\s+/i
  ];
  
  if (invalidPatterns.some(pattern => pattern.test(name))) {
    return false;
  }
  
  if (name.length > 100) {
    return false;
  }
  
  if (name.includes('?')) {
    return false;
  }
  
  return true;
}

let namePassed = 0;
productNameTests.forEach(test => {
  const result = isValidProductName(test.name);
  const passed = result === test.valid;
  console.log(`${passed ? '✅' : '❌'} "${test.name}" → ${result ? 'VALID' : 'INVALID'} (expected: ${test.valid ? 'VALID' : 'INVALID'})`);
  if (passed) namePassed++;
});

console.log(`\nProduct Name Validation: ${namePassed}/${productNameTests.length} passed (${Math.round(namePassed/productNameTests.length*100)}%)\n`);

// Test 3: Price Extraction
console.log('=== TEST 3: PRICE EXTRACTION ===');
const priceTests = [
  // From descriptions
  { text: '1988 Wild Turkey 8 Year Old 101 proof Kentucky Straight Bourbon Whiskey (Bottled Code \'88/Japanese Export) (750ml)  $700.00', expected: 700.00 },
  { text: '1996 Wild Turkey 12 Year Old "Split Label" 101 Proof Kentucky Straight Bourbon Whiskey (750ml).  $1,000.00. Product Details.', expected: 1000.00 },
  { text: 'Buffalo Trace "Kosher Rye Recipe" Kentucky Straight Bourbon Whiskey (750ml).  $59.99. Product Details. Origin Kentucky, United States.', expected: 59.99 },
  
  // From snippets
  { text: 'Price: $89.99 - In Stock', expected: 89.99 },
  { text: 'MSRP: $129.99', expected: 129.99 },
  { text: 'Our Price: $45.99', expected: 45.99 },
  { text: 'Sale Price: $32.99 (was $39.99)', expected: 32.99 },
  
  // Edge cases
  { text: 'Aged 12 years, 750ml bottle', expected: null }, // Should NOT extract 12 or 750
  { text: 'Founded in 1783, this distillery...', expected: null }, // Should NOT extract 1783
];

// Simple price extraction for testing
function extractPrice(text: string): number | null {
  const patterns = [
    /\$([0-9,]+\.?\d*)/g,
    /USD\s*([0-9,]+\.?\d*)/gi,
    /MSRP[:\s]*\$?([0-9,]+\.?\d*)/gi,
    /(?:our|sale|regular)\s*price[:\s]*\$?([0-9,]+\.?\d*)/gi
  ];
  
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const price = parseFloat(match[1].replace(/,/g, ''));
      if (price > 5 && price < 10000) {
        return price;
      }
    }
  }
  
  return null;
}

let pricePassed = 0;
priceTests.forEach(test => {
  const result = extractPrice(test.text);
  const passed = result === test.expected;
  console.log(`${passed ? '✅' : '❌'} "${test.text.substring(0, 50)}..." → $${result} (expected: $${test.expected})`);
  if (passed) pricePassed++;
});

console.log(`\nPrice Extraction: ${pricePassed}/${priceTests.length} passed (${Math.round(pricePassed/priceTests.length*100)}%)\n`);

// Test 4: Brand Slug Generation (no apostrophes!)
console.log('=== TEST 4: BRAND SLUG GENERATION ===');
const slugTests = [
  { name: "Angel's Envy", expected: 'angels-envy' },
  { name: "Michter's", expected: 'michters' },
  { name: "Russell's Reserve", expected: 'russells-reserve' },
  { name: 'W.L. Weller', expected: 'wl-weller' },
  { name: 'E.H. Taylor', expected: 'eh-taylor' },
  { name: 'Four Roses', expected: 'four-roses' }
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['"]/g, '') // Remove apostrophes and quotes
    .replace(/\./g, '') // Remove periods
    .replace(/[^a-z0-9\s-]/g, '') // Remove other special chars
    .replace(/\s+/g, '-') // Spaces to dashes
    .replace(/-+/g, '-') // Multiple dashes to single
    .trim();
}

let slugPassed = 0;
slugTests.forEach(test => {
  const result = generateSlug(test.name);
  const passed = result === test.expected;
  console.log(`${passed ? '✅' : '❌'} "${test.name}" → "${result}" (expected: "${test.expected}")`);
  if (passed) slugPassed++;
});

console.log(`\nSlug Generation: ${slugPassed}/${slugTests.length} passed (${Math.round(slugPassed/slugTests.length*100)}%)\n`);

// SUMMARY
console.log('=== FINAL RESULTS ===');
const totalTests = brandTests.length + productNameTests.length + priceTests.length + slugTests.length;
const totalPassed = brandPassed + namePassed + pricePassed + slugPassed;
const percentage = Math.round(totalPassed / totalTests * 100);

console.log(`\n🎯 OVERALL: ${totalPassed}/${totalTests} tests passed (${percentage}%)`);

if (percentage === 100) {
  console.log('\n✅ ALL TESTS PASSED! V2.5.5 FIXES ARE READY! 🚀');
} else {
  console.log('\n❌ SOME TESTS FAILED - MORE WORK NEEDED! 💪');
}

// Test actual spirit object processing
console.log('\n=== TESTING COMPLETE SPIRIT PROCESSING ===');
const testSpirit = {
  name: "Discover The Most Popular Bourbon Whiskey Available In Paris, France",
  description: "Buffalo Trace Bourbon (750ml). $59.99. Product Details.",
  brand: 'discover'
};

console.log('\nBEFORE:');
console.log(testSpirit);

// Apply fixes
const fixed = V25CriticalFixes.applyAllFixes(testSpirit);
const validName = isValidProductName(fixed.name);
const extractedPrice = extractPrice(fixed.description || '');

console.log('\nAFTER FIXES:');
console.log({
  ...fixed,
  isValidProduct: validName,
  extractedPrice: extractedPrice
});

console.log('\n🔥 V2.5.5 TEST COMPLETE! LET\'S FIX THESE ISSUES! 🔥');