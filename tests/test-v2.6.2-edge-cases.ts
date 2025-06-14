#!/usr/bin/env tsx
import { smartProductValidator } from '../src/services/smart-product-validator-v2.6.2.js';
import { logger } from '../src/utils/logger.js';

/**
 * Comprehensive edge case testing for V2.6.2 validator
 * Based on real problematic entries from CSV analysis
 */

interface TestCase {
  name: string;
  shouldPass: boolean;
  category: string;
  notes?: string;
}

const edgeCases: TestCase[] = [
  // === PROBLEMATIC ENTRIES FROM LATEST CSV ===
  
  // Architectural/Construction firms
  { name: "Bardstown Bourbon Co Bottling Joseph & Joseph Architects", shouldPass: false, category: "Architecture" },
  { name: "Joseph & Joseph Architects - Bardstown Bourbon Company", shouldPass: false, category: "Architecture" },
  { name: "Distillery Design by Smith Architecture LLC", shouldPass: false, category: "Architecture" },
  { name: "Bourbon Distillery Construction Services", shouldPass: false, category: "Construction" },
  
  // Events/Venues/Tours
  { name: "Bbc Bourbon Barrel Loft Event Space In Louisville Ky The Vendry", shouldPass: false, category: "Event venue" },
  { name: "Private Event Space at Buffalo Trace", shouldPass: false, category: "Event venue" },
  { name: "Bourbon Experience Belle Meade Winery Nashville's Oldest Winery", shouldPass: false, category: "Tour" },
  { name: "Kentucky Bourbon Trail Experience Package", shouldPass: false, category: "Tour" },
  { name: "VIP Distillery Tour and Tasting", shouldPass: false, category: "Tour" },
  { name: "Bourbon Academy At Woodford Reserve", shouldPass: false, category: "Academy" },
  { name: "Master Distiller Workshop Experience", shouldPass: false, category: "Workshop" },
  { name: "Bourbon Making Class for Beginners", shouldPass: false, category: "Class" },
  
  // Food/Non-beverage products
  { name: "Colonel De New Riff Barrel Smoked Spices", shouldPass: false, category: "Food" },
  { name: "Bourbon Barrel Aged Coffee Beans", shouldPass: false, category: "Food" },
  { name: "Buffalo Trace Bourbon Brittle Candy", shouldPass: false, category: "Food" },
  { name: "Bourbon Infused BBQ Sauce", shouldPass: false, category: "Food" },
  { name: "Whiskey Barrel Aged Maple Syrup", shouldPass: false, category: "Food" },
  { name: "Bourbon Honey Gold Rush Recipe", shouldPass: false, category: "Recipe" },
  { name: "Four Roses Bourbon Chicken Marinade", shouldPass: false, category: "Food" },
  { name: "Bourbon Scented Candles", shouldPass: false, category: "Non-beverage" },
  { name: "Whiskey Barrel Furniture Collection", shouldPass: false, category: "Furniture" },
  
  // Articles/Guides/Reviews
  { name: "Bourbon The Well Known Bourbons With Sweeter Notes", shouldPass: false, category: "Article" },
  { name: "The Ultimate Guide to Kentucky Bourbon", shouldPass: false, category: "Guide" },
  { name: "Top 10 Best Bourbon Whiskeys of 2024", shouldPass: false, category: "Listicle" },
  { name: "Everything You Need to Know About Bourbon", shouldPass: false, category: "Article" },
  { name: "How to Choose the Perfect Bourbon Gift", shouldPass: false, category: "Guide" },
  { name: "Bourbon vs Whiskey: What's the Difference?", shouldPass: false, category: "Article" },
  { name: "The Complete Bourbon Beginner's Guide", shouldPass: false, category: "Guide" },
  
  // Marketing taglines as product names
  { name: "Discovery Series 1 The Bardstown Bourbon Company A New Blend Of Bourbon Makers", shouldPass: false, category: "Tagline" },
  { name: "A New Blend of Traditional and Modern", shouldPass: false, category: "Tagline" },
  { name: "The Spirit of Innovation Since 1870", shouldPass: false, category: "Tagline" },
  { name: "Crafted for the Discerning Palate", shouldPass: false, category: "Tagline" },
  
  // Store/Website listings
  { name: "Available For Purchase Are A Selection Of Bourbons", shouldPass: false, category: "Store listing" },
  { name: "Shop Our Premium Bourbon Collection", shouldPass: false, category: "Store page" },
  { name: "Buy Bourbon Online - Free Shipping", shouldPass: false, category: "Store page" },
  { name: "Bourbon Spirits Call (323) 655 9995", shouldPass: false, category: "Contact info" },
  { name: "Visit Our Online Whiskey Store", shouldPass: false, category: "Store page" },
  { name: "High West American Whiskey The Whisky Exchange", shouldPass: false, category: "Website" },
  
  // Meetup/Social events
  { name: "Drink Belle Meade Bourbon W/ Charlie Of Nelson's Green Brier Distilling Qbb", shouldPass: false, category: "Meetup" },
  { name: "Join Us for Bourbon Wednesday Nights", shouldPass: false, category: "Event" },
  { name: "Monthly Bourbon Club Meeting", shouldPass: false, category: "Club event" },
  { name: "Bourbon & Jazz Evening at the Lounge", shouldPass: false, category: "Event" },
  
  // Educational/Informational
  { name: "1 Ky-jim Beam Whiskey University", shouldPass: false, category: "Education" },
  { name: "Learn About Bourbon History", shouldPass: false, category: "Education" },
  { name: "Bourbon Production Process Explained", shouldPass: false, category: "Education" },
  { name: "Understanding Bourbon Mash Bills", shouldPass: false, category: "Education" },
  
  // Awards/News articles
  { name: "2024 World's Most Admired Whiskey-michter's Distillery", shouldPass: false, category: "Award news" },
  { name: "Buffalo Trace Wins Double Gold Medal", shouldPass: false, category: "Award news" },
  { name: "Breaking: New Distillery Opens in Kentucky", shouldPass: false, category: "News" },
  
  // About pages/Company info
  { name: "About Whistle Pig Whistle Pig Whiskey", shouldPass: false, category: "About page" },
  { name: "Our Story - Four Roses Distillery", shouldPass: false, category: "Company info" },
  { name: "The History of Buffalo Trace", shouldPass: false, category: "History page" },
  
  // Location/Trail info
  { name: "Four Roses Distillery Kentucky Bourbon Trail", shouldPass: false, category: "Trail info" },
  { name: "Visit Buffalo Trace Visitor Center", shouldPass: false, category: "Location" },
  { name: "Bardstown Bourbon Capital of the World", shouldPass: false, category: "Location" },
  
  // === TRICKY EDGE CASES THAT SHOULD PASS ===
  
  // Products with location/store mentions
  { name: "Buffalo Trace Bourbon - Available at Total Wine", shouldPass: true, category: "Product with store" },
  { name: "Four Roses Single Barrel from K&L Wines", shouldPass: true, category: "Product from store" },
  { name: "Maker's Mark - Now at BevMo!", shouldPass: true, category: "Product at store" },
  
  // Products with marketing language
  { name: "Wild Turkey 101 - Bold and Spicy", shouldPass: true, category: "Product with description" },
  { name: "Woodford Reserve - A Taste of Kentucky Heritage", shouldPass: true, category: "Product with tagline" },
  { name: "Buffalo Trace - Award Winning Kentucky Straight Bourbon", shouldPass: true, category: "Product with award" },
  
  // Series/Limited editions with complex names
  { name: "Bardstown Bourbon Company Discovery Series #10", shouldPass: true, category: "Series product" },
  { name: "Four Roses Limited Edition Small Batch 2024 Release", shouldPass: true, category: "Limited edition" },
  { name: "High West A Midwinter Night's Dram Act 11 Scene 5", shouldPass: true, category: "Special release" },
  
  // Products with production details
  { name: "Maker's Mark Cask Strength Batch 23-01", shouldPass: true, category: "Batch product" },
  { name: "Russell's Reserve Single Barrel #2023-045", shouldPass: true, category: "Single barrel" },
  { name: "Eagle Rare 10 Year Barrel #5678", shouldPass: true, category: "Aged product" },
  
  // Non-bourbon spirits that should pass
  { name: "Balcones Texas Single Malt Whisky", shouldPass: true, category: "Single malt" },
  { name: "WhistlePig 10 Year Straight Rye Whiskey", shouldPass: true, category: "Rye whiskey" },
  { name: "Jack Daniel's Tennessee Whiskey", shouldPass: true, category: "Tennessee whiskey" },
  { name: "Westland American Single Malt Peated", shouldPass: true, category: "American single malt" },
  
  // === AMBIGUOUS CASES ===
  
  // Gift sets (should these pass or fail?)
  { name: "Buffalo Trace Gift Set with Glasses", shouldPass: false, category: "Gift set", notes: "Not the spirit itself" },
  { name: "Maker's Mark Holiday Gift Pack", shouldPass: false, category: "Gift set", notes: "Not the spirit itself" },
  
  // Miniatures/Samples
  { name: "Bourbon Tasting Set 5x50ml", shouldPass: false, category: "Sample set", notes: "Multiple products" },
  { name: "Four Roses Mini Bottle Collection", shouldPass: false, category: "Mini collection", notes: "Not specific product" },
  
  // Store picks (these SHOULD pass)
  { name: "Four Roses OESF K&L Wines Private Selection", shouldPass: true, category: "Store pick" },
  { name: "Russell's Reserve Seelbach's Pick", shouldPass: true, category: "Store pick" },
  
  // === FORMATTING EDGE CASES ===
  
  // Bad spacing/formatting
  { name: "BuffaloTraceBourbon", shouldPass: true, category: "No spaces", notes: "Should normalize" },
  { name: "Four   Roses    Small    Batch", shouldPass: true, category: "Extra spaces" },
  { name: "maker's mark bourbon", shouldPass: true, category: "Lowercase" },
  { name: "WILD TURKEY 101", shouldPass: true, category: "Uppercase" },
  
  // Special characters
  { name: "Maker's Mark® Bourbon", shouldPass: true, category: "Trademark symbol" },
  { name: "Buffalo Trace™ Kentucky Straight Bourbon", shouldPass: true, category: "Trademark" },
  { name: "Four Roses - Small Batch", shouldPass: true, category: "Hyphen separator" },
  { name: "High West • Double Rye", shouldPass: true, category: "Bullet separator" },
  
  // Truncated names (from CSV issues)
  { name: "Four Roses Small Batch Kentucky Straight...", shouldPass: true, category: "Truncated", notes: "Common issue" },
  { name: "Buffalo Trace Kentucky Straight Bourbon Whi...", shouldPass: true, category: "Truncated" },
  
  // HTML entities
  { name: "Maker&apos;s Mark Bourbon", shouldPass: true, category: "HTML entity" },
  { name: "Buffalo Trace &amp; Four Roses", shouldPass: false, category: "Multiple products" },
  { name: "High West &quot;Double Rye&quot;", shouldPass: true, category: "HTML quotes" },
];

async function runEdgeCaseTests() {
  console.log('🔬 Testing V2.6.2 Validator with Comprehensive Edge Cases\n');
  console.log('=' .repeat(100));
  
  let passed = 0;
  let failed = 0;
  const failures: any[] = [];
  
  // Group by category for better display
  const categories = [...new Set(edgeCases.map(tc => tc.category))];
  
  for (const category of categories) {
    const categoryTests = edgeCases.filter(tc => tc.category === category);
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
    }
  }
  
  console.log('\n' + '=' .repeat(100));
  console.log(`\n📊 Edge Case Test Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${((passed / edgeCases.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Edge Cases:');
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
    
    // Group failures by type for analysis
    console.log('\n📈 Failure Analysis:');
    const failureCategories = [...new Set(failures.map(f => f.category))];
    failureCategories.forEach(cat => {
      const catFailures = failures.filter(f => f.category === cat);
      console.log(`\n${cat}: ${catFailures.length} failures`);
      catFailures.forEach(f => {
        console.log(`  - "${f.name.substring(0, 50)}..."`);
      });
    });
  } else {
    console.log('\n✅ All edge cases passed! The validator handles edge cases perfectly.');
  }
  
  // Show validator stats
  const stats = smartProductValidator.getStats();
  console.log('\n📈 Validator Stats:');
  console.log(`Patterns learned: ${stats.totalPatterns}`);
  console.log(`Valid patterns: ${stats.validPatterns}`);
  console.log(`Invalid patterns: ${stats.invalidPatterns}`);
  
  // Recommendations
  if (failed > 0) {
    console.log('\n🔧 Recommendations:');
    if (failures.some(f => f.category.includes('Gift') || f.category.includes('Mini'))) {
      console.log('- Consider handling gift sets and miniatures differently');
    }
    if (failures.some(f => f.category.includes('spaces') || f.category.includes('case'))) {
      console.log('- Improve text normalization for spacing and casing issues');
    }
    if (failures.some(f => f.category.includes('HTML'))) {
      console.log('- Add HTML entity decoding to normalization');
    }
  }
}

// Run tests
runEdgeCaseTests().catch(console.error);