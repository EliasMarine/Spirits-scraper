import { catalogFocusedScraper } from './src/services/catalog-focused-scraper.js';
import { createClient } from '@supabase/supabase-js';
import { config } from './src/config/index.js';
import { logger } from './src/utils/logger.js';

async function testTextProcessorIntegration() {
  logger.info('🧪 Testing text-processor integration...');
  
  const client = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  
  try {
    // Clear test data
    logger.info('🧹 Clearing test data...');
    await client.from('spirits').delete().eq('distillery', 'Buffalo Trace');
    
    // Test with a small batch
    const results = await catalogFocusedScraper.scrapeAllDistilleries({
      distilleryNames: ['Buffalo Trace'],
      maxProductsPerDistillery: 10,
      skipExisting: false
    });
    
    // Get stored products
    const { data: spirits } = await client
      .from('spirits')
      .select('*')
      .eq('distillery', 'Buffalo Trace')
      .limit(10);
    
    logger.info('\n🔍 Text Processing Results:');
    
    if (spirits) {
      for (const spirit of spirits) {
        logger.info(`\n${spirit.name}:`);
        logger.info(`  Brand: ${spirit.brand} (normalized)`);
        logger.info(`  Type: ${spirit.type} (proper case)`);
        logger.info(`  Age: ${spirit.age_statement || 'N/A'}`);
        logger.info(`  ABV: ${spirit.abv || 'N/A'}`);
        logger.info(`  Price: ${spirit.price ? '$' + spirit.price : 'N/A'}`);
        logger.info(`  Description: ${spirit.description ? 
          (spirit.description.length > 100 ? 
            spirit.description.substring(0, 100) + '...' : 
            spirit.description) : 
          'N/A'}`);
        
        // Check for improvements
        const improvements = [];
        if (spirit.brand && spirit.brand.includes("'")) improvements.push("Apostrophe handling");
        if (spirit.type && spirit.type[0] === spirit.type[0].toUpperCase()) improvements.push("Proper case category");
        if (spirit.age_statement) improvements.push("Age extraction");
        if (spirit.description && !spirit.description.match(/^(i|we|you|they)\s/i)) improvements.push("Valid description");
        
        if (improvements.length > 0) {
          logger.info(`  ✅ Improvements: ${improvements.join(', ')}`);
        }
      }
    }
    
    // Summary
    const withAge = spirits?.filter(s => s.age_statement)?.length || 0;
    const withValidDesc = spirits?.filter(s => s.description && s.description.length > 50)?.length || 0;
    const withProperBrand = spirits?.filter(s => s.brand && /[A-Z]/.test(s.brand))?.length || 0;
    
    logger.info(`\n📊 Summary:`);
    logger.info(`  Total spirits: ${spirits?.length || 0}`);
    logger.info(`  With age statements: ${withAge}`);
    logger.info(`  With valid descriptions: ${withValidDesc}`);
    logger.info(`  With properly formatted brands: ${withProperBrand}`);
    
  } catch (error) {
    logger.error('❌ Test failed:', error);
  }
}

// Run the test
testTextProcessorIntegration();