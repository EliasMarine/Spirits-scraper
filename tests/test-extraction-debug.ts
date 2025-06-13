#!/usr/bin/env tsx
/**
 * Debug test for spirit extraction
 */

import { config } from 'dotenv';
import { googleSearchClient } from './services/google-search.js';
import { spiritDiscovery } from './services/spirit-discovery.js';
import { logger } from './utils/logger.js';

// Load environment variables
config();

async function debugExtraction() {
  console.log('🔍 Debug: Testing spirit extraction from search results\n');
  
  // Test with a specific brand query that should return real products
  const testQuery = 'Buffalo Trace bourbon whiskey';
  
  try {
    // First, let's see what Google returns
    console.log(`Query: "${testQuery}"\n`);
    
    const searchResponse = await googleSearchClient.search({
      query: testQuery,
      num: 3,
    });
    
    if (!searchResponse.items || searchResponse.items.length === 0) {
      console.log('❌ No search results found');
      return;
    }
    
    console.log(`Found ${searchResponse.items.length} search results:\n`);
    
    // Show raw search results
    searchResponse.items.forEach((item, index) => {
      console.log(`Result ${index + 1}:`);
      console.log(`  Title: ${item.title}`);
      console.log(`  Link: ${item.link}`);
      console.log(`  Snippet: ${item.snippet || 'No snippet'}`);
      
      if (item.pagemap?.product?.[0]) {
        console.log('  Product data found:');
        Object.entries(item.pagemap.product[0]).forEach(([key, value]) => {
          console.log(`    ${key}: ${value}`);
        });
      }
      
      if (item.pagemap?.metatags?.[0]) {
        const meta = item.pagemap.metatags[0];
        if (meta['og:title'] || meta['product:title']) {
          console.log('  Metadata:');
          if (meta['og:title']) console.log(`    og:title: ${meta['og:title']}`);
          if (meta['product:title']) console.log(`    product:title: ${meta['product:title']}`);
          if (meta['product:brand']) console.log(`    product:brand: ${meta['product:brand']}`);
        }
      }
      
      console.log('');
    });
    
    // Now test the extraction
    console.log('─'.repeat(60));
    console.log('\n🧪 Testing extraction:\n');
    
    const spirits = await spiritDiscovery.discoverSpiritsFromQuery(testQuery, 5);
    
    if (spirits.length === 0) {
      console.log('❌ No spirits extracted');
    } else {
      console.log(`✅ Extracted ${spirits.length} spirits:\n`);
      spirits.forEach((spirit, index) => {
        console.log(`${index + 1}. ${spirit.name}`);
        console.log(`   Brand: ${spirit.brand || 'Unknown'}`);
        console.log(`   Confidence: ${(spirit.confidence * 100).toFixed(0)}%`);
        console.log(`   Source: ${spirit.source}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the debug test
debugExtraction().catch(error => {
  logger.error('Debug test failed:', error);
  process.exit(1);
});