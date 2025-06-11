#!/usr/bin/env node

import { config } from 'dotenv';
import { googleSearchClient } from './src/services/google-search.js';
import { supabaseStorage } from './src/services/supabase-storage.js';
import { ultraEfficientScraper } from './src/services/ultra-efficient-scraper.js';
import { logger } from './src/utils/logger.js';

// Load environment
config();

// Set clean output
process.env.LOG_LEVEL = 'info';

async function testDirectExtraction() {
  console.log('🧪 Testing V2.5 Ultra-Efficient Scraper Improvements');
  console.log('=' .repeat(60));
  
  try {
    // Test a single query to see extraction quality
    const query = 'site:totalwine.com "Blanton\'s" bourbon 750ml price';
    console.log(`\nTesting query: ${query}\n`);
    
    const results = await googleSearchClient.search({ query, num: 3 });
    
    if (!results.items || results.items.length === 0) {
      console.log('❌ No results found');
      return;
    }
    
    console.log(`Found ${results.items.length} search results\n`);
    
    // Test extraction on first result
    const firstResult = results.items[0];
    console.log('📊 First Result Analysis:');
    console.log(`Title: ${firstResult.title}`);
    console.log(`URL: ${firstResult.link}`);
    console.log(`Snippet: ${firstResult.snippet?.substring(0, 100)}...`);
    
    // Extract spirits using the scraper's method
    const scraper = ultraEfficientScraper as any;
    const spirits = scraper.extractSpiritsFromSearchResult(firstResult, 'bourbon');
    
    console.log(`\n🥃 Extracted ${spirits.length} spirits:\n`);
    
    spirits.forEach((spirit: any, index: number) => {
      console.log(`${index + 1}. ${spirit.name}`);
      console.log(`   Brand: ${spirit.brand || 'N/A'}`);
      console.log(`   Price: ${spirit.price ? `$${spirit.price}` : 'N/A'}`);
      console.log(`   ABV: ${spirit.abv ? `${spirit.abv}%` : 'N/A'}`);
      console.log(`   Image: ${spirit.image_url ? '✅' : '❌'}`);
      console.log(`   Description: ${spirit.description ? spirit.description.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`   Data Source: ${spirit.data_source}`);
      
      // Calculate quality score
      const score = scraper.calculateQualityScore(spirit);
      console.log(`   Quality Score: ${score}/100`);
      console.log('');
    });
    
    // Test storing one spirit
    if (spirits.length > 0) {
      console.log('📦 Testing storage of first spirit...');
      const result = await supabaseStorage.storeSpirit({
        ...spirits[0],
        name: spirits[0].name + ' (V2.5 Test)',
        scraped_at: new Date().toISOString()
      });
      
      console.log(`Storage result: ${result.success ? '✅ Success' : '❌ Failed'}`);
      if (!result.success) {
        console.log(`Error: ${result.error}`);
      } else {
        console.log(`Stored with ID: ${result.id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('\n✅ Test complete');
}

// Run the test
testDirectExtraction().catch(console.error);