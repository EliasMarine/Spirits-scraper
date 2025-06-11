#!/usr/bin/env node

import { config } from 'dotenv';
import { ultraEfficientScraper } from './src/services/ultra-efficient-scraper.js';
import { logger } from './src/utils/logger.js';

// Load environment
config();

// Set clean output
process.env.LOG_LEVEL = 'warn';

async function demonstrateUltraEfficiency() {
  console.log('🚀 ULTRA-EFFICIENT SCRAPER DEMONSTRATION');
  console.log('=' .repeat(60));
  console.log('\nThis demonstrates how the ultra-efficient scraper extracts');
  console.log('multiple products from Google search result metadata WITHOUT');
  console.log('fetching any catalog pages!\n');
  
  try {
    // Test with bourbon category (small limit to show efficiency)
    const result = await ultraEfficientScraper.scrapeWithUltraEfficiency({
      category: 'bourbon',
      limit: 20,
      targetEfficiency: 60,
      deepExtraction: false // We don't need to fetch pages!
    });
    
    console.log('\n✅ DEMONSTRATION COMPLETE!');
    console.log('\nKey Points:');
    console.log('1. NO catalog pages were fetched (no axios/HTTP requests)');
    console.log('2. All products extracted from Google search metadata');
    console.log('3. Extraction sources: structured data, metatags, titles, snippets');
    console.log('4. True efficiency without additional network overhead');
    
    console.log('\n📊 Efficiency Breakdown:');
    if (result.topPerformingQueries.length > 0) {
      console.log('Top queries by yield:');
      result.topPerformingQueries.slice(0, 3).forEach((q, i) => {
        console.log(`  ${i + 1}. "${q.query.substring(0, 50)}..." → ${q.spiritsYield} spirits`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the demonstration
demonstrateUltraEfficiency().catch(console.error);