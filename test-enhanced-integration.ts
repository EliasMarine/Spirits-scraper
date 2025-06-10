import { catalogFocusedScraper } from './src/services/catalog-focused-scraper.js';
import { createNormalizedKey, createMultipleKeys, extractVariantInfo } from './src/services/normalization-keys.js';
import { spiritExtractor } from './src/services/spirit-extractor.js';
import { logger } from './src/utils/logger.js';

/**
 * Test the enhanced integration of spirit-extractor and normalization-keys
 */
async function testEnhancedIntegration() {
  console.log('🧪 Testing Enhanced Catalog Scraper Integration\n');

  // Test 1: Normalization Keys
  console.log('1️⃣ Testing Normalization Keys:');
  const testNames = [
    'Buffalo Trace Bourbon 750ml',
    'Buffalo Trace Bourbon Sample',
    'Buffalo Trace Bourbon Gift Box with Glasses',
    'Buffalo Trace Bourbon - Order Online',
    'Buffalo Trace Bourbon (2023)',
    'Buffalo Trace Bourbon 90 Proof',
    'Buffalo Trace Bourbon 90 Pf'
  ];

  console.log('\nNormalization results:');
  testNames.forEach(name => {
    const keys = createMultipleKeys(name);
    const variant = extractVariantInfo(name);
    console.log(`\nOriginal: "${name}"`);
    console.log(`Standard key: "${keys.standard}"`);
    console.log(`Aggressive key: "${keys.aggressive}"`);
    console.log(`Ultra-aggressive key: "${keys.ultraAggressive}"`);
    console.log(`Variant info:`, variant);
  });

  // Test 2: Spirit Extractor
  console.log('\n\n2️⃣ Testing Spirit Extractor:');
  try {
    const extractedData = await spiritExtractor.extractSpirit(
      'Blanton\'s Single Barrel Bourbon',
      'Blanton\'s',
      {
        maxResults: 3,
        includeRetailers: true,
        includeReviews: false,
        deepParse: false
      }
    );

    console.log('\nExtracted spirit data:');
    console.log(`Name: ${extractedData.name}`);
    console.log(`Brand: ${extractedData.brand}`);
    console.log(`Type: ${extractedData.type}`);
    console.log(`Category: ${extractedData.category}`);
    console.log(`ABV: ${extractedData.abv}`);
    console.log(`Price: ${extractedData.price}`);
    console.log(`Data Quality Score: ${extractedData.data_quality_score}`);
    console.log(`Description: ${extractedData.description?.substring(0, 100)}...`);
  } catch (error) {
    console.error('Spirit extraction failed:', error);
  }

  // Test 3: Catalog Scraper with Buffalo Trace
  console.log('\n\n3️⃣ Testing Enhanced Catalog Scraper:');
  try {
    const results = await catalogFocusedScraper.scrapeAllDistilleries({
      maxProductsPerDistillery: 10,
      distilleryNames: ['Buffalo Trace'],
      skipExisting: false
    });

    if (results.length > 0) {
      const result = results[0];
      console.log('\nCatalog scraping results:');
      console.log(`Distillery: ${result.distillery}`);
      console.log(`Products found: ${result.productsFound}`);
      console.log(`Products stored: ${result.productsStored}`);
      console.log(`Efficiency: ${result.efficiency.toFixed(2)} spirits per API call`);
      console.log(`Duration: ${result.duration}ms`);
    }
  } catch (error) {
    console.error('Catalog scraping failed:', error);
  }

  // Test 4: Duplicate Detection
  console.log('\n\n4️⃣ Testing Duplicate Detection:');
  const duplicatePairs = [
    ['Eagle Rare 10 Year Bourbon 750ml', 'Eagle Rare 10 Year Bourbon Sample'],
    ['Weller Special Reserve', 'Weller Special Reserve Gift Box'],
    ['Blanton\'s Single Barrel', 'Blantons Single Barrel'],
    ['E.H. Taylor Small Batch', 'E H Taylor Small Batch']
  ];

  duplicatePairs.forEach(([name1, name2]) => {
    const keys1 = createMultipleKeys(name1);
    const keys2 = createMultipleKeys(name2);
    
    const isDuplicate = keys1.aggressive === keys2.aggressive || 
                       keys1.ultraAggressive === keys2.ultraAggressive;
    
    console.log(`\n"${name1}" vs "${name2}"`);
    console.log(`Duplicate detected: ${isDuplicate ? '✅ YES' : '❌ NO'}`);
  });

  console.log('\n\n✅ Integration testing complete!');
}

// Run the tests
testEnhancedIntegration().catch(console.error);