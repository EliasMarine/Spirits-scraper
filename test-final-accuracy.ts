import { catalogFocusedScraper } from './src/services/catalog-focused-scraper.js';
import { supabaseStorage } from './src/services/supabase-storage.js';
import { createClient } from '@supabase/supabase-js';
import { config } from './src/config/index.js';
import { logger } from './src/utils/logger.js';

async function testFinalAccuracy() {
  logger.info('🎯 Testing final catalog scraper for 95%+ accuracy...');
  
  const client = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey
  );
  
  try {
    // Clear test data first
    logger.info('🧹 Clearing existing test data...');
    await client.from('spirits').delete().eq('distillery', 'Buffalo Trace');
    await client.from('spirits').delete().eq('distillery', 'Wheatley');
    
    // Test with Buffalo Trace
    const results = await catalogFocusedScraper.scrapeAllDistilleries({
      distilleryNames: ['Buffalo Trace'],
      maxProductsPerDistillery: 25,
      skipExisting: false
    });
    
    logger.info('✅ Scraping Results:');
    for (const result of results) {
      logger.info(`
Distillery: ${result.distillery}
Products Found: ${result.productsFound}
Products Stored: ${result.productsStored}
Errors: ${result.errors}
Efficiency: ${result.efficiency.toFixed(2)} spirits per API call
      `);
    }
    
    // Get stored products for analysis
    const { data: spirits } = await client
      .from('spirits')
      .select('*')
      .eq('distillery', 'Buffalo Trace')
      .limit(25);
    
    logger.info('\n📊 Detailed Quality Analysis:');
    
    let metrics = {
      total: spirits?.length || 0,
      validSpirits: 0,
      spiritsWithABV: 0,
      spiritsWithPrice: 0,
      correctTypes: 0,
      cleanNames: 0,
      wheatleyVodka: 0,
      nonSpirits: []
    };
    
    if (spirits) {
      for (const spirit of spirits) {
        // Check if it's a valid spirit
        const nonSpiritTerms = ['cigar', 'chocolate', 'candy', 'event', 'tasting', 'gift pack'];
        const isNonSpirit = nonSpiritTerms.some(term => 
          spirit.name.toLowerCase().includes(term)
        );
        
        if (isNonSpirit) {
          metrics.nonSpirits.push(spirit.name);
        } else {
          metrics.validSpirits++;
        }
        
        // Check data quality
        if (spirit.abv && spirit.abv > 0) metrics.spiritsWithABV++;
        if (spirit.price && spirit.price > 0) metrics.spiritsWithPrice++;
        
        // Check type accuracy
        const name = spirit.name.toLowerCase();
        const brand = (spirit.brand || '').toLowerCase();
        
        if (name.includes('wheatley') || brand.includes('wheatley')) {
          if (spirit.type === 'Vodka') {
            metrics.correctTypes++;
            metrics.wheatleyVodka++;
          }
        } else if (spirit.type === 'Bourbon' || spirit.type === 'Liqueur' || spirit.type === 'Rye Whiskey') {
          metrics.correctTypes++;
        }
        
        // Check name cleanliness
        const dirtyPatterns = [
          ': The Whisky Exchange',
          '- Buy from',
          'is a really classy',
          'has partnered with',
          'that is handcrafted',
          '...',
          '- SKU'
        ];
        
        const hasCleanName = !dirtyPatterns.some(pattern => spirit.name.includes(pattern));
        if (hasCleanName) metrics.cleanNames++;
        
        // Log individual spirit details
        logger.info(`
${isNonSpirit ? '❌' : '✅'} ${spirit.name}
   Type: ${spirit.type} ${spirit.type === 'Vodka' && name.includes('wheatley') ? '✅' : ''}
   ABV: ${spirit.abv || 'N/A'} ${spirit.abv ? '✅' : '❌'}
   Price: ${spirit.price ? '$' + spirit.price : 'N/A'} ${spirit.price ? '✅' : '❌'}
   Clean Name: ${hasCleanName ? '✅' : '❌'}
        `);
      }
    }
    
    // Calculate percentages
    const validRate = (metrics.validSpirits / metrics.total * 100).toFixed(1);
    const abvRate = (metrics.spiritsWithABV / metrics.total * 100).toFixed(1);
    const priceRate = (metrics.spiritsWithPrice / metrics.total * 100).toFixed(1);
    const typeAccuracy = (metrics.correctTypes / metrics.total * 100).toFixed(1);
    const cleanNameRate = (metrics.cleanNames / metrics.total * 100).toFixed(1);
    
    logger.info(`
📈 Final Quality Metrics:
================================
Total Products: ${metrics.total}
Valid Spirits: ${validRate}% (${metrics.validSpirits}/${metrics.total})
ABV Extraction: ${abvRate}% (${metrics.spiritsWithABV}/${metrics.total})
Price Extraction: ${priceRate}% (${metrics.spiritsWithPrice}/${metrics.total})
Type Accuracy: ${typeAccuracy}% (${metrics.correctTypes}/${metrics.total})
Clean Names: ${cleanNameRate}% (${metrics.cleanNames}/${metrics.total})
Wheatley Vodka: ${metrics.wheatleyVodka} correctly identified

Non-Spirits Filtered: ${metrics.nonSpirits.length}
${metrics.nonSpirits.map(n => `  - ${n}`).join('\n')}

Overall Quality Score: ${((parseFloat(validRate) + parseFloat(abvRate) + parseFloat(priceRate) + parseFloat(typeAccuracy) + parseFloat(cleanNameRate)) / 5).toFixed(1)}%
    `);
    
    // Check if we meet 95% target
    const overallScore = (parseFloat(validRate) + parseFloat(typeAccuracy) + parseFloat(cleanNameRate)) / 3;
    
    if (overallScore >= 95) {
      logger.info('✅ SUCCESS: Achieved 95%+ accuracy target!');
    } else {
      logger.warn(`⚠️  Current accuracy: ${overallScore.toFixed(1)}% (Target: 95%+)`);
    }
    
  } catch (error) {
    logger.error('❌ Test failed:', error);
  }
}

// Run the test
testFinalAccuracy();