#!/usr/bin/env node

import { config } from 'dotenv';
import { ultraEfficientScraper } from './src/services/ultra-efficient-scraper.js';
import { googleSearchClient } from './src/services/google-search.js';
import { logger } from './src/utils/logger.js';

// Load environment
config();

// Set detailed logging
process.env.LOG_LEVEL = 'info';

interface ExtractionTest {
  query: string;
  expectedFields: string[];
}

async function testSingleQuery(query: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: "${query}"`);
  console.log('='.repeat(60));
  
  try {
    const results = await googleSearchClient.search({ query, num: 5 });
    
    if (!results.items || results.items.length === 0) {
      console.log('❌ No results found');
      return;
    }
    
    console.log(`\n📊 Found ${results.items.length} search results\n`);
    
    results.items.forEach((item, index) => {
      console.log(`\n--- Result ${index + 1}: ${item.title} ---`);
      console.log(`URL: ${item.link}`);
      console.log(`Snippet: ${item.snippet?.substring(0, 100)}...`);
      
      // Check structured data
      if (item.pagemap?.product) {
        console.log('\n✅ STRUCTURED DATA FOUND:');
        const products = Array.isArray(item.pagemap.product) ? item.pagemap.product : [item.pagemap.product];
        products.forEach(product => {
          console.log(`  Name: ${product.name || 'N/A'}`);
          console.log(`  Price: ${product.offers?.price || product.price || 'N/A'}`);
          console.log(`  Brand: ${product.brand?.name || product.brand || 'N/A'}`);
          console.log(`  Image: ${product.image || 'N/A'}`);
          console.log(`  Description: ${product.description?.substring(0, 50) || 'N/A'}...`);
        });
      }
      
      // Check metatags
      if (item.pagemap?.metatags?.[0]) {
        console.log('\n📋 METATAGS:');
        const meta = item.pagemap.metatags[0];
        console.log(`  og:title: ${meta['og:title'] || 'N/A'}`);
        console.log(`  og:description: ${meta['og:description']?.substring(0, 50) || 'N/A'}...`);
        console.log(`  og:image: ${meta['og:image'] || 'N/A'}`);
        console.log(`  product:price: ${meta['product:price:amount'] || meta['product:price'] || 'N/A'}`);
      }
      
      // Check for images
      if (item.pagemap?.cse_image?.[0]) {
        console.log('\n🖼️ IMAGES:');
        console.log(`  CSE Image: ${item.pagemap.cse_image[0].src}`);
      }
      
      // Try to extract ABV/proof from snippet
      const abvMatch = item.snippet?.match(/(\d+(?:\.\d+)?)\s*%\s*(?:ABV|alc)/i);
      const proofMatch = item.snippet?.match(/(\d+)\s*proof/i);
      if (abvMatch || proofMatch) {
        console.log('\n🥃 ALCOHOL CONTENT:');
        if (abvMatch) console.log(`  ABV: ${abvMatch[1]}%`);
        if (proofMatch) console.log(`  Proof: ${proofMatch[1]}`);
      }
      
      // Extract price from snippet
      const priceMatch = item.snippet?.match(/\$(\d+\.?\d*)/);
      if (priceMatch) {
        console.log(`\n💰 SNIPPET PRICE: $${priceMatch[1]}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function runComprehensiveTests() {
  console.log('🧪 V2.5 ULTRA-EFFICIENT SCRAPER - EXTRACTION QUALITY TEST');
  console.log('=' .repeat(60));
  
  const testQueries: ExtractionTest[] = [
    {
      query: 'site:totalwine.com "Buffalo Trace" bourbon',
      expectedFields: ['name', 'price', 'image', 'description']
    },
    {
      query: 'site:klwines.com "Blanton\'s" bourbon 750ml',
      expectedFields: ['name', 'price', 'abv', 'description']
    },
    {
      query: 'site:thewhiskyexchange.com "Macallan 12" scotch',
      expectedFields: ['name', 'price', 'abv', 'image', 'description']
    },
    {
      query: 'site:wine.com "Grey Goose" vodka price',
      expectedFields: ['name', 'price', 'image']
    },
    {
      query: '"Woodford Reserve" bourbon 750ml proof price',
      expectedFields: ['name', 'price', 'proof', 'volume']
    }
  ];
  
  for (const test of testQueries) {
    await testSingleQuery(test.query);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limit
  }
  
  console.log('\n\n📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log('Key findings will be documented in V2.5-FIXES.md');
}

// Run the tests
runComprehensiveTests().catch(console.error);