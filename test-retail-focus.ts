#!/usr/bin/env ts-node

/**
 * Test script to verify retail-focused scraping improvements
 * This should result in 90%+ retail site results, not Reddit/blogs
 */

import { EnhancedQueryGenerator } from './src/services/enhanced-query-generator.js';
import { googleSearchClient } from './src/services/google-search.js';
import { spiritDiscovery } from './src/services/spirit-discovery.js';
import { isReputableDomain, getAllReputableDomains } from './src/config/reputable-domains.js';
import { isExcludedDomain } from './src/config/excluded-domains.js';

async function testRetailFocus() {
  console.log('🧪 TESTING RETAIL-FOCUSED SCRAPING IMPROVEMENTS\n');
  
  const enhancedGenerator = new EnhancedQueryGenerator();
  
  // Test 1: Query Generation
  console.log('📝 TEST 1: Query Generation');
  console.log('─'.repeat(50));
  
  const testQueries = enhancedGenerator.generateSmartQueries('bourbon', 10);
  console.log(`Generated ${testQueries.length} queries:`);
  testQueries.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q}`);
  });
  
  // Count site: operators
  const siteQueries = testQueries.filter(q => q.includes('site:'));
  console.log(`\n✅ ${siteQueries.length}/${testQueries.length} queries use site: operators (${(siteQueries.length/testQueries.length*100).toFixed(0)}%)`);
  
  // Test 2: Search Results Filtering
  console.log('\n🔍 TEST 2: Search Results Filtering');
  console.log('─'.repeat(50));
  
  // Run a test search
  const testQuery = testQueries[0];
  console.log(`Testing query: "${testQuery}"`);
  
  try {
    const searchResults = await googleSearchClient.search({
      query: testQuery,
      num: 10
    });
    
    if (searchResults.items) {
      console.log(`\nFound ${searchResults.items.length} results:`);
      
      let retailCount = 0;
      let excludedCount = 0;
      
      searchResults.items.forEach((item, i) => {
        const isRetail = isReputableDomain(item.link);
        const isExcluded = isExcludedDomain(item.link);
        
        if (isRetail) retailCount++;
        if (isExcluded) excludedCount++;
        
        const domain = new URL(item.link).hostname;
        const status = isRetail ? '✅ RETAIL' : isExcluded ? '❌ EXCLUDED' : '⚠️  OTHER';
        
        console.log(`  ${i + 1}. ${status} - ${domain}`);
        console.log(`     ${item.title.substring(0, 60)}${item.title.length > 60 ? '...' : ''}`);
      });
      
      const retailPercentage = (retailCount / searchResults.items.length) * 100;
      console.log(`\n📊 RESULTS ANALYSIS:`);
      console.log(`  ✅ Retail sites: ${retailCount}/${searchResults.items.length} (${retailPercentage.toFixed(1)}%)`);
      console.log(`  ❌ Excluded sites: ${excludedCount}/${searchResults.items.length}`);
      console.log(`  ⚠️  Other sites: ${searchResults.items.length - retailCount - excludedCount}/${searchResults.items.length}`);
      
      if (retailPercentage >= 80) {
        console.log(`\n🎉 SUCCESS: ${retailPercentage.toFixed(1)}% retail results!`);
      } else if (retailPercentage >= 50) {
        console.log(`\n⚠️  PARTIAL SUCCESS: ${retailPercentage.toFixed(1)}% retail results (target: 80%+)`);
      } else {
        console.log(`\n❌ NEEDS IMPROVEMENT: Only ${retailPercentage.toFixed(1)}% retail results`);
      }
    }
    
    // Test 3: Spirit Discovery
    console.log('\n🥃 TEST 3: Spirit Discovery from Results');
    console.log('─'.repeat(50));
    
    const discoveredSpirits = await spiritDiscovery.discoverSpiritsFromQuery(testQuery, 5);
    console.log(`Discovered ${discoveredSpirits.length} spirits:`);
    
    discoveredSpirits.forEach((spirit, i) => {
      const sourceType = isReputableDomain(spirit.source) ? 'RETAIL' : 'OTHER';
      console.log(`  ${i + 1}. ${spirit.name} (${spirit.brand || 'Unknown'})`);
      console.log(`     Source: ${sourceType} - ${new URL(spirit.source).hostname}`);
      console.log(`     Confidence: ${(spirit.confidence * 100).toFixed(0)}%`);
    });
    
    // Final summary
    console.log('\n📊 FINAL ASSESSMENT');
    console.log('─'.repeat(50));
    
    const allRetailQueries = siteQueries.length === testQueries.length;
    const goodRetailResults = retailPercentage >= 80;
    const noExcludedResults = excludedCount === 0;
    
    if (allRetailQueries && goodRetailResults && noExcludedResults) {
      console.log('✅ All tests passed! Retail-focused scraping is working correctly.');
    } else {
      console.log('⚠️  Some improvements needed:');
      if (!allRetailQueries) console.log('  - Not all queries use site: operators');
      if (!goodRetailResults) console.log('  - Search results contain too many non-retail sites');
      if (!noExcludedResults) console.log('  - Excluded domains are still appearing in results');
    }
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the test
testRetailFocus().catch(console.error);