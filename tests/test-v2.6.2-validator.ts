#!/usr/bin/env tsx
import { smartProductValidator } from '../src/services/smart-product-validator-v2.6.2.js';
import { logger } from '../src/utils/logger.js';

/**
 * Test V2.6.2 validator with balanced approach
 * Should reject non-products while accepting valid ones
 */

const testCases = [
  // === NON-PRODUCTS THAT MUST BE REJECTED ===
  
  // Event venues
  { name: "Bbc Bourbon Barrel Loft Event Space In Louisville Ky The Vendry", shouldPass: false, category: "Event venue" },
  { name: "Whiskey Tasting Event at Downtown Venue", shouldPass: false, category: "Event venue" },
  
  // Architecture/construction
  { name: "Bardstown Bourbon Co Bottling Joseph & Joseph Architects", shouldPass: false, category: "Architecture firm" },
  { name: "Distillery Construction Company Services", shouldPass: false, category: "Construction" },
  
  // Tours/experiences
  { name: "Bourbon Experience Belle Meade Winery Nashville's Oldest Winery", shouldPass: false, category: "Tour/experience" },
  { name: "Kentucky Bourbon Trail Experience", shouldPass: false, category: "Tour/experience" },
  { name: "Bourbon Academy At Woodford Reserve", shouldPass: false, category: "Academy/education" },
  
  // Food products
  { name: "Colonel De New Riff Barrel Smoked Spices", shouldPass: false, category: "Food product" },
  { name: "Bourbon Honey Gold Rush", shouldPass: false, category: "Cocktail/food" },
  { name: "Buffalo Trace Bourbon Brittle", shouldPass: false, category: "Food product" },
  { name: "Bourbon Barrel Aged Coffee", shouldPass: false, category: "Food product" },
  
  // Articles/category pages
  { name: "Bourbon The Well Known Bourbons With Sweeter Notes", shouldPass: false, category: "Article/category" },
  { name: "The Best Top 10 Whiskeys of 2024", shouldPass: false, category: "Article listing" },
  { name: "Guide to Kentucky Bourbon", shouldPass: false, category: "Guide" },
  
  // Marketing taglines
  { name: "Discovery Series 1 The Bardstown Bourbon Company A New Blend Of Bourbon Makers", shouldPass: false, category: "Tagline" },
  { name: "Fusion Series A New Blend of Bourbon Makers", shouldPass: false, category: "Tagline" },
  
  // Events/meetups
  { name: "Drink Belle Meade Bourbon W/ Charlie Of Nelson's Green Brier Distilling Qbb", shouldPass: false, category: "Event" },
  { name: "Meet the Master Distiller Event", shouldPass: false, category: "Event" },
  
  // Websites/stores
  { name: "High West American Whiskey The Whisky Exchange", shouldPass: false, category: "Website/store" },
  { name: "Four Roses at Total Wine Store", shouldPass: false, category: "Store listing" },
  
  // Trails/locations
  { name: "Four Roses Distillery Kentucky Bourbon Trail", shouldPass: false, category: "Location/trail" },
  { name: "Buffalo Trace Distillery Visitor Center", shouldPass: false, category: "Visitor center" },
  
  // === VALID PRODUCTS THAT MUST BE ACCEPTED ===
  
  // Standard products
  { name: "Buffalo Trace Bourbon", shouldPass: true, category: "Valid product" },
  { name: "Four Roses Small Batch Bourbon", shouldPass: true, category: "Valid product" },
  { name: "Maker's Mark Bourbon", shouldPass: true, category: "Valid product" },
  { name: "Wild Turkey 101", shouldPass: true, category: "Valid product" },
  { name: "Jim Beam Black Label", shouldPass: true, category: "Valid product" },
  
  // Products with proof/age
  { name: "High West Double Rye Whiskey (92 Proof)", shouldPass: true, category: "Valid with proof" },
  { name: "High West A Midwinter Night's Dram Whiskey (98.6 Proof)", shouldPass: true, category: "Valid with proof" },
  { name: "Bardstown Bourbon Company Origin Series 6 Year Straight Bourbon", shouldPass: true, category: "Valid with age" },
  
  // Limited editions
  { name: "Four Roses Limited Edition Small Batch Barrel Strength Kentucky Straight Bourbon Whiskey", shouldPass: true, category: "Limited edition" },
  { name: "Belle Meade Cask Strength Reserve Bourbon Whiskey", shouldPass: true, category: "Reserve product" },
  
  // Series products
  { name: "Bardstown Bourbon Company Discovery Series 10 Spring 2023", shouldPass: true, category: "Series product" },
  { name: "Bardstown Bourbon Company Fusion Series 6", shouldPass: true, category: "Series product" },
  { name: "Bardstown Origin Series Kentucky Straight Bourbon Whiskey", shouldPass: true, category: "Series product" },
  
  // Products with marketing text (should still pass)
  { name: "Buffalo Trace Bourbon - Handcrafted by the world's most decorated distillery", shouldPass: true, category: "Product with tagline" },
  { name: "Four Roses Single Barrel - Award Winning", shouldPass: true, category: "Product with award" },
  
  // Store pick/private selection
  { name: "Four Roses Private Selection Single Barrel OESF", shouldPass: true, category: "Private selection" },
  { name: "High West Rendezvous Rye Whiskey Single Barrel Select", shouldPass: true, category: "Store pick" }
];

async function runTests() {
  console.log('🧪 Testing V2.6.2 Balanced Validator\n');
  console.log('=' .repeat(100));
  
  let passed = 0;
  let failed = 0;
  const failures: any[] = [];
  
  // Group by category for better display
  const categories = [...new Set(testCases.map(tc => tc.category))];
  
  for (const category of categories) {
    const categoryTests = testCases.filter(tc => tc.category === category);
    console.log(`\n📁 ${category.toUpperCase()}`);
    console.log('-'.repeat(50));
    
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
          issues: result.issues
        });
      }
      
      console.log(`${status} ${testCase.name.substring(0, 60)}...`);
      if (actualResult !== expectedResult) {
        console.log(`   Expected: ${expectedResult}, Got: ${actualResult}, Confidence: ${result.confidence.toFixed(2)}`);
        if (result.issues.length > 0) {
          console.log(`   Issues: ${result.issues.join(', ')}`);
        }
      }
    }
  }
  
  console.log('\n' + '=' .repeat(100));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests Summary:');
    failures.forEach(f => {
      console.log(`\n- [${f.category}] "${f.name}"`);
      console.log(`  Expected: ${f.expected}, Got: ${f.actual}`);
      console.log(`  Confidence: ${f.confidence.toFixed(2)}`);
    });
  } else {
    console.log('\n✅ All tests passed! The validator is properly balanced.');
  }
  
  // Show validator stats
  const stats = smartProductValidator.getStats();
  console.log('\n📈 Validator Stats:');
  console.log(`Patterns learned: ${stats.totalPatterns}`);
  console.log(`Valid patterns: ${stats.validPatterns}`);
  console.log(`Invalid patterns: ${stats.invalidPatterns}`);
}

// Run tests
runTests().catch(console.error);