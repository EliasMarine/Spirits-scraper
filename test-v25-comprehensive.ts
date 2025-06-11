#!/usr/bin/env node

import { config } from 'dotenv';
import { ultraEfficientScraper } from './src/services/ultra-efficient-scraper.js';
import { createClient } from '@supabase/supabase-js';
import { logger } from './src/utils/logger.js';

// Load environment
config();

// Set clean output
process.env.LOG_LEVEL = 'warn';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function testCategory(category: string, limit: number = 20) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing ${category.toUpperCase()} Category`);
  console.log('='.repeat(60));
  
  try {
    // Run the ultra-efficient scraper
    const result = await ultraEfficientScraper.scrapeWithUltraEfficiency({
      category,
      limit,
      targetEfficiency: 60,
      deepExtraction: false
    });
    
    console.log(`\n📊 Scraping Results:`);
    console.log(`  API Calls: ${result.apiCalls}`);
    console.log(`  Spirits Found: ${result.spiritsFound}`);
    console.log(`  Efficiency: ${result.efficiency.toFixed(1)} spirits/call`);
    
    // Query the database to check what was actually stored
    const { data: spirits, error } = await supabase
      .from('spirits')
      .select('*')
      .eq('type', category)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error('Database error:', error);
      return;
    }
    
    console.log(`\n📦 Sample Spirits Stored (${spirits?.length || 0} shown):`);
    
    spirits?.forEach((spirit, index) => {
      console.log(`\n${index + 1}. ${spirit.name}`);
      console.log(`   Brand: ${spirit.brand || 'N/A'}`);
      console.log(`   Price: ${spirit.price ? `$${spirit.price}` : 'N/A'}`);
      console.log(`   ABV: ${spirit.abv ? `${spirit.abv}%` : 'N/A'}`);
      console.log(`   Image: ${spirit.image_url ? '✅' : '❌'}`);
      console.log(`   Description: ${spirit.description ? spirit.description.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`   Quality Score: ${spirit.data_quality_score || 'N/A'}/100`);
    });
    
    // Calculate data completeness
    const withPrice = spirits?.filter(s => s.price).length || 0;
    const withABV = spirits?.filter(s => s.abv).length || 0;
    const withImage = spirits?.filter(s => s.image_url).length || 0;
    const withDescription = spirits?.filter(s => s.description).length || 0;
    const total = spirits?.length || 0;
    
    console.log(`\n📈 Data Completeness (out of ${total}):`);
    console.log(`  With Price: ${withPrice} (${total ? (withPrice/total*100).toFixed(0) : 0}%)`);
    console.log(`  With ABV: ${withABV} (${total ? (withABV/total*100).toFixed(0) : 0}%)`);
    console.log(`  With Image: ${withImage} (${total ? (withImage/total*100).toFixed(0) : 0}%)`);
    console.log(`  With Description: ${withDescription} (${total ? (withDescription/total*100).toFixed(0) : 0}%)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function runComprehensiveTest() {
  console.log('🚀 V2.5 ULTRA-EFFICIENT SCRAPER - COMPREHENSIVE TEST');
  console.log('=' .repeat(60));
  console.log('Testing data extraction quality across multiple categories\n');
  
  // Test different categories
  const categories = ['bourbon', 'scotch', 'vodka', 'rum'];
  
  for (const category of categories) {
    await testCategory(category, 15);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limit
  }
  
  console.log('\n\n✅ COMPREHENSIVE TEST COMPLETE');
  console.log('Results have been stored in the database and logged above.');
  console.log('Check V2.5-FIXES.md for detailed analysis and next steps.');
}

// Run the test
runComprehensiveTest().catch(console.error);