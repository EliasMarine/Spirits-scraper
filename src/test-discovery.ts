#!/usr/bin/env tsx
/**
 * Test the spirit discovery service to ensure it extracts real spirits
 * instead of storing generic search queries
 */

import { config } from 'dotenv';
import { spiritDiscovery } from './services/spirit-discovery.js';
import { logger } from './utils/logger.js';

// Load environment variables
config();

async function testDiscovery() {
  console.log('🧪 Testing Spirit Discovery Service\n');
  console.log('This test will verify that the scraper extracts actual spirit names');
  console.log('from search results instead of storing generic search queries.\n');
  
  // Test queries that were previously being stored as spirit names
  const testQueries = [
    // Generic queries that should NOT be stored as spirit names
    'budget wheated bourbon whiskey',
    'premium bourbon collection',
    '10 year old bourbon',
    'smooth bourbon whiskey',
    'bourbon under $50',
    'best bourbon 2024',
    'bourbon catalog page 1',
    // Specific queries that should find real products
    'Maker\'s Mark bourbon',
    'Buffalo Trace whiskey',
    'Blanton\'s Single Barrel',
  ];

  const results = {
    success: 0,
    failed: 0,
    genericDetected: 0,
  };

  for (const query of testQueries) {
    console.log(`\n📍 Testing query: "${query}"`);
    console.log('─'.repeat(60));
    
    try {
      const spirits = await spiritDiscovery.discoverSpiritsFromQuery(query, 5);
      
      if (spirits.length === 0) {
        console.log('❌ No spirits discovered');
        results.failed++;
      } else {
        console.log(`✅ Discovered ${spirits.length} spirits:\n`);
        
        let hasGeneric = false;
        spirits.forEach((spirit, index) => {
          // Check if the spirit name looks like a generic query
          const isGeneric = /^(budget|premium|smooth|best|\d+\s*year\s*old)\s+(wheated\s+)?bourbon/i.test(spirit.name) ||
                          /catalog\s*page\s*\d+/i.test(spirit.name) ||
                          /under\s*\$\d+/i.test(spirit.name);
          
          if (isGeneric) {
            hasGeneric = true;
            results.genericDetected++;
            console.log(`${index + 1}. ⚠️  ${spirit.name} [GENERIC - SHOULD NOT BE STORED]`);
          } else {
            console.log(`${index + 1}. ✓  ${spirit.name}`);
          }
          
          console.log(`   Brand: ${spirit.brand || 'Unknown'}`);
          console.log(`   Confidence: ${(spirit.confidence * 100).toFixed(0)}%`);
          console.log(`   Source: ${spirit.source}`);
          console.log('');
        });
        
        if (!hasGeneric) {
          results.success++;
        }
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      results.failed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`Total queries tested: ${testQueries.length}`);
  console.log(`✅ Successful extractions: ${results.success}`);
  console.log(`❌ Failed extractions: ${results.failed}`);
  console.log(`⚠️  Generic terms detected: ${results.genericDetected}`);
  
  if (results.genericDetected > 0) {
    console.log('\n⚠️  WARNING: The service is still extracting generic search terms!');
    console.log('   These should be filtered out to prevent database pollution.');
  } else if (results.success === testQueries.length) {
    console.log('\n🎉 SUCCESS: All queries extracted real spirit names!');
  }
  
  console.log('\n🏁 Test complete!');
}

// Run the test
testDiscovery().catch(error => {
  logger.error('Test failed:', error);
  process.exit(1);
});