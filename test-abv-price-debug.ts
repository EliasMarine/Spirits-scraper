import { catalogFocusedScraper } from './src/services/catalog-focused-scraper.js';
import { createClient } from '@supabase/supabase-js';
import { config } from './src/config/index.js';
import { logger } from './src/utils/logger.js';

async function testABVPriceDebug() {
  logger.info('🔍 Testing ABV and Price extraction debug...');
  
  const client = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  
  try {
    // Clear test data first
    logger.info('🧹 Clearing existing test data...');
    await client.from('spirits').delete().eq('distillery', 'Buffalo Trace');
    
    // Test with just a few products
    const results = await catalogFocusedScraper.scrapeAllDistilleries({
      distilleryNames: ['Buffalo Trace'],
      maxProductsPerDistillery: 5,
      skipExisting: false
    });
    
    logger.info('✅ Scraping completed. Checking database...');
    
    // Get stored products
    const { data: spirits } = await client
      .from('spirits')
      .select('name, abv, price, description')
      .eq('distillery', 'Buffalo Trace')
      .limit(5);
    
    logger.info('\n📊 Database Results:');
    if (spirits) {
      for (const spirit of spirits) {
        logger.info(`\n${spirit.name}:`);
        logger.info(`  ABV in DB: ${spirit.abv}`);
        logger.info(`  Price in DB: ${spirit.price}`);
        
        // Check if ABV/price are in description
        if (spirit.description) {
          const abvInDesc = spirit.description.match(/(\d+(?:\.\d+)?)\s*%|\d+\s*proof/i);
          const priceInDesc = spirit.description.match(/\$(\d+(?:\.\d{2})?)/);
          
          if (abvInDesc) {
            logger.info(`  ABV in description: ${abvInDesc[0]}`);
          }
          if (priceInDesc) {
            logger.info(`  Price in description: ${priceInDesc[0]}`);
          }
        }
      }
    }
    
  } catch (error) {
    logger.error('❌ Test failed:', error);
  }
}

// Run the test
testABVPriceDebug();