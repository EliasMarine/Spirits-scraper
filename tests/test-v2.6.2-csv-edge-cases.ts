#!/usr/bin/env tsx
import { smartProductValidator } from '../src/services/smart-product-validator-v2.6.2.js';
import { logger } from '../src/utils/logger.js';

/**
 * Real edge cases from actual CSV data (spirits_rows (32).csv)
 * These are the problematic entries found in production
 */

interface TestCase {
  name: string;
  shouldPass: boolean;
  category: string;
  notes?: string;
}

const realCsvEdgeCases: TestCase[] = [
  // === ACTUAL NON-PRODUCTS FROM CSV THAT MUST BE REJECTED ===
  
  { name: "Bbc Bourbon Barrel Loft Event Space In Louisville Ky The Vendry", shouldPass: false, category: "Event venue (CSV)" },
  { name: "Bardstown Bourbon Co Bottling Joseph & Joseph Architects", shouldPass: false, category: "Architecture (CSV)" },
  { name: "Bourbon Experience Belle Meade Winery Nashville's Oldest Winery", shouldPass: false, category: "Tour (CSV)" },
  { name: "Colonel De New Riff Barrel Smoked Spices", shouldPass: false, category: "Food (CSV)" },
  { name: "Bourbon Honey Gold Rush", shouldPass: false, category: "Recipe (CSV)" },
  { name: "Bourbon The Well Known Bourbons With Sweeter Notes", shouldPass: false, category: "Article (CSV)" },
  { name: "Discovery Series 1 The Bardstown Bourbon Company A New Blend Of Bourbon Makers", shouldPass: false, category: "Tagline (CSV)" },
  { name: "Drink Belle Meade Bourbon W/ Charlie Of Nelson's Green Brier Distilling Qbb", shouldPass: false, category: "Event (CSV)" },
  { name: "High West American Whiskey The Whisky Exchange", shouldPass: false, category: "Website (CSV)" },
  { name: "Four Roses Distillery Kentucky Bourbon Trail", shouldPass: false, category: "Trail (CSV)" },
  { name: "Bourbon Academy At Woodford Reserve", shouldPass: false, category: "Academy (CSV)" },
  { name: "Fusion Series A New Blend Of Bourbon Makers", shouldPass: false, category: "Tagline (CSV)" },
  
  // === MORE REAL PROBLEMATIC ENTRIES ===
  
  { name: "1 Ky-jim Beam Whiskey University", shouldPass: false, category: "Education" },
  { name: "2024 World's Most Admired Whiskey-michter's Distillery", shouldPass: false, category: "Award news" },
  { name: "About Whistle Pig Whistle Pig Whiskey", shouldPass: false, category: "About page" },
  { name: "Available For Purchase Are A Selection Of Bourbons", shouldPass: false, category: "Store listing" },
  { name: "Bourbon Belles And Whiskey Women", shouldPass: false, category: "Book/article" },
  { name: "Bourbon Spirits Call (323) 655 9995", shouldPass: false, category: "Contact info" },
  { name: "It's All About The Whiskey", shouldPass: false, category: "Article title" },
  { name: "Kentucky Remedy Liquor", shouldPass: false, category: "Store name" },
  { name: "-free Range Wine &", shouldPass: false, category: "Store fragment" },
  
  // === VALID PRODUCTS THAT MUST BE ACCEPTED ===
  
  // Standard products
  { name: "Buffalo Trace Kentucky Straight Bourbon Whiskey", shouldPass: true, category: "Valid product" },
  { name: "Four Roses Single Barrel Kentucky Straight Bourbon Whiskey", shouldPass: true, category: "Valid product" },
  { name: "Bardstown Bourbon Company Origin Series Bottled In Bond 4 Year Straight", shouldPass: true, category: "Valid product" },
  { name: "High West Double Rye Whiskey (92 Proof)", shouldPass: true, category: "Valid with proof" },
  { name: "High West A Midwinter Night's Dram Whiskey (98.6 Proof)", shouldPass: true, category: "Valid with proof" },
  
  // Series products
  { name: "Bardstown Bourbon Company Discovery Series 10 Spring 2023", shouldPass: true, category: "Series product" },
  { name: "Bardstown Bourbon Company Fusion Series 6", shouldPass: true, category: "Series product" },
  { name: "Bardstown Origin Series Kentucky Straight Bourbon Whiskey", shouldPass: true, category: "Series product" },
  { name: "Discovery Series 10 Spring 2023", shouldPass: true, category: "Series name only" },
  
  // Complex names
  { name: "Four Roses Limited Edition Small Batch Barrel Strength Kentucky Straight Bourbon Whiskey", shouldPass: true, category: "Long name" },
  { name: "Belle Meade Cask Strength Reserve Bourbon Whiskey", shouldPass: true, category: "Reserve product" },
  { name: "High West Rendezvous Rye Whiskey", shouldPass: true, category: "Rye whiskey" },
  { name: "Cedar Ridge The Quint Essential American Single Malt Whiskey", shouldPass: true, category: "Single malt" },
  
  // Store picks/special selections
  { name: "Four Roses Private Selection Single Barrel Bourbon Oesf", shouldPass: true, category: "Store pick" },
  { name: "Four Roses Store Pick Single Barrel", shouldPass: true, category: "Store pick" },
  
  // === EDGE CASES FROM CSV DATA ===
  
  // Bad formatting but valid products
  { name: "Ba Lcones Whiskey", shouldPass: true, category: "Bad spacing", notes: "Should normalize" },
  { name: "Unc Le Nearest", shouldPass: true, category: "Bad spacing", notes: "Should normalize" },
  { name: "Sma Ll Batch", shouldPass: true, category: "Bad spacing", notes: "Should normalize" },
  { name: "WhistlePig", shouldPass: true, category: "No spaces" },
  { name: "Whistle Pig", shouldPass: true, category: "With space" },
  { name: "whistlepig", shouldPass: true, category: "Lowercase" },
  
  // Products with store mentions (should still pass)
  { name: "Buffalo Trace - BevMo!", shouldPass: true, category: "With store" },
  { name: "Four Roses from Total Wine", shouldPass: true, category: "From store" },
  { name: "Maker's Mark at K&L Wines", shouldPass: true, category: "At store" },
  
  // Truncated names (common in CSV)
  { name: "Four Roses Limited Edition Small Batch Barrel Strength Kentucky Straight...", shouldPass: true, category: "Truncated" },
  { name: "High West A Midwinter Night's Dram Act 11 Scene...", shouldPass: true, category: "Truncated" },
  
  // Special characters/HTML entities
  { name: "Maker's Mark", shouldPass: true, category: "Apostrophe" },
  { name: "Maker&apos;s Mark", shouldPass: true, category: "HTML apostrophe" },
  { name: "Buffalo Trace &amp; Benchmark", shouldPass: false, category: "Multiple products", notes: "Two products" },
  { name: "High West-vermont Oak", shouldPass: true, category: "Hyphenated" },
  
  // === BRAND EXTRACTION TEST CASES ===
  
  // These should pass but need proper brand extraction
  { name: "bardstown bourbon company discovery series 10", shouldPass: true, category: "Lowercase brand" },
  { name: "high west double rye", shouldPass: true, category: "Lowercase brand" },
  { name: "four roses small batch", shouldPass: true, category: "Lowercase brand" },
  
  // === TYPE DETECTION TEST CASES ===
  
  // Should detect correct types
  { name: "Jack Daniel's Tennessee Whiskey", shouldPass: true, category: "Tennessee whiskey" },
  { name: "George Dickel Tennessee Whisky", shouldPass: true, category: "Tennessee whisky" },
  { name: "Uncle Nearest Premium Tennessee Whiskey", shouldPass: true, category: "Tennessee whiskey" },
  { name: "Westland American Single Malt", shouldPass: true, category: "American single malt" },
  { name: "Balcones Texas Single Malt", shouldPass: true, category: "American single malt" },
  { name: "Stranahan's American Single Malt", shouldPass: true, category: "American single malt" },
  
  // === PROBLEMATIC PATTERNS FROM CSV ===
  
  // Invalid entries that were stored
  { name: ". Bourbon. Result", shouldPass: false, category: "Fragment" },
  { name: "Bourbon Biscuits", shouldPass: false, category: "Food product" },
  { name: "53 G Heaven Hill Distillery...", shouldPass: false, category: "Weight prefix" },
  { name: "Bourbon-glazed Pork Belly Chunks", shouldPass: false, category: "Food product" },
  { name: "Bourbon Barrel Aged Coffee", shouldPass: false, category: "Food product" },
  
  // Core/bundles/weird brands
  { name: "Core Bourbon", shouldPass: false, category: "Invalid brand", notes: "'core' is not a real brand" },
  { name: "Bundles Whiskey Collection", shouldPass: false, category: "Bundle" },
  { name: "Unknown Bourbon", shouldPass: false, category: "Invalid brand", notes: "'unknown' is not a brand" },
];

async function runCsvEdgeCaseTests() {
  console.log('🔬 Testing V2.6.2 Validator with Real CSV Edge Cases\n');
  console.log('=' .repeat(100));
  
  let passed = 0;
  let failed = 0;
  const failures: any[] = [];
  
  // Group by category for better display
  const categories = [...new Set(realCsvEdgeCases.map(tc => tc.category))];
  
  for (const category of categories) {
    const categoryTests = realCsvEdgeCases.filter(tc => tc.category === category);
    console.log(`\n📁 ${category.toUpperCase()}`);
    console.log('-'.repeat(80));
    
    for (const testCase of categoryTests) {
      const result = await smartProductValidator.validateProductName(testCase.name);
      const actualResult = result.isValid ? 'ACCEPT' : 'REJECT';
      const expectedResult = testCase.shouldPass ? 'ACCEPT' : 'REJECT';
      const status = actualResult === expectedResult ? '✅' : '❌';
      
      if (actualResult === expectedResult) {
        passed++;
      } else {
        failed++;
        failures.push({
          ...testCase,
          expected: expectedResult,
          actual: actualResult,
          confidence: result.confidence,
          issues: result.issues,
          normalizedName: result.normalizedName
        });
      }
      
      // Show first 60 chars of name
      const displayName = testCase.name.length > 60 
        ? testCase.name.substring(0, 57) + '...'
        : testCase.name.padEnd(60, ' ');
      
      console.log(`${status} ${displayName} [${result.confidence.toFixed(2)}]`);
      
      if (actualResult !== expectedResult) {
        console.log(`   Expected: ${expectedResult}, Got: ${actualResult}`);
        if (result.issues.length > 0) {
          console.log(`   Issues: ${result.issues.join(', ')}`);
        }
        if (testCase.notes) {
          console.log(`   Notes: ${testCase.notes}`);
        }
      }
      
      // Show normalization if it happened
      if (result.normalizedName && result.normalizedName !== testCase.name) {
        console.log(`   ➤ Normalized: "${result.normalizedName}"`);
      }
    }
  }
  
  console.log('\n' + '=' .repeat(100));
  console.log(`\n📊 CSV Edge Case Test Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${((passed / realCsvEdgeCases.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed CSV Edge Cases:');
    failures.forEach((f, idx) => {
      console.log(`\n${idx + 1}. [${f.category}] "${f.name}"`);
      console.log(`   Expected: ${f.expected}, Got: ${f.actual}`);
      console.log(`   Confidence: ${f.confidence.toFixed(2)}`);
      if (f.issues.length > 0) {
        console.log(`   Issues: ${f.issues.join(', ')}`);
      }
      if (f.normalizedName && f.normalizedName !== f.name) {
        console.log(`   Normalized to: "${f.normalizedName}"`);
      }
      if (f.notes) {
        console.log(`   Notes: ${f.notes}`);
      }
    });
    
    console.log('\n🔧 Validator needs adjustment for these real-world cases.');
  } else {
    console.log('\n✅ All CSV edge cases passed! The validator handles real-world data perfectly.');
  }
  
  // Show validator stats
  const stats = smartProductValidator.getStats();
  console.log('\n📈 Validator Stats:');
  console.log(`Patterns learned: ${stats.totalPatterns}`);
  console.log(`Valid patterns: ${stats.validPatterns}`);
  console.log(`Invalid patterns: ${stats.invalidPatterns}`);
  
  // Summary
  console.log('\n📋 Data Quality Summary:');
  console.log(`✅ Non-product rejection rate: ${((realCsvEdgeCases.filter(tc => !tc.shouldPass && actualResult === 'REJECT').length / realCsvEdgeCases.filter(tc => !tc.shouldPass).length) * 100).toFixed(1)}%`);
  console.log(`✅ Valid product acceptance rate: ${((realCsvEdgeCases.filter(tc => tc.shouldPass && actualResult === 'ACCEPT').length / realCsvEdgeCases.filter(tc => tc.shouldPass).length) * 100).toFixed(1)}%`);
  
  function actualResult(tc: TestCase): string {
    return tc.shouldPass ? 'ACCEPT' : 'REJECT';
  }
}

// Run tests
runCsvEdgeCaseTests().catch(console.error);