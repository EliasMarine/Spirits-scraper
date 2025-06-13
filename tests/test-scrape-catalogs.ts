#!/usr/bin/env tsx

import { config } from 'dotenv';
import { distilleryScrapeTracker } from '../src/services/distillery-scrape-tracker.js';
import { ALL_DISTILLERIES } from '../src/config/distilleries.js';
import { ultraEfficientScraper } from '../src/services/ultra-efficient-scraper.js';

// Load environment variables
config();

async function testDistilleryTracker() {
  console.log('🧪 Testing Distillery Tracker Initialization...\n');
  
  try {
    // Test 1: Get scraping stats
    console.log('1️⃣ Testing getScrapingStats...');
    const stats = await distilleryScrapeTracker.getScrapingStats();
    console.log('✅ Stats retrieved:', stats);
    
    // Test 2: Get unscraped distilleries
    console.log('\n2️⃣ Testing getUnscrapedDistilleries...');
    const unscraped = await distilleryScrapeTracker.getUnscrapedDistilleries(ALL_DISTILLERIES, 7);
    console.log(`✅ Found ${unscraped.length} unscraped distilleries (out of ${ALL_DISTILLERIES.length} total)`);
    
    // Test 3: Get intelligent selection
    console.log('\n3️⃣ Testing getIntelligentDistillerySelection...');
    const selected = await distilleryScrapeTracker.getIntelligentDistillerySelection(
      ALL_DISTILLERIES,
      100,
      {
        preferUnscraped: true,
        spiritTypeDistribution: true,
        priorityWeighting: true,
        avoidRecentlyCached: true
      }
    );
    console.log(`✅ Selected ${selected.length} distilleries for 100 API calls`);
    
    // Show spirit type distribution
    const typeCount: Record<string, number> = {};
    selected.forEach(d => {
      d.type.forEach(t => {
        typeCount[t] = (typeCount[t] || 0) + 1;
      });
    });
    console.log('\n📊 Spirit Type Distribution:');
    Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} distilleries`);
      });
    
    // Test 4: Test session creation
    console.log('\n4️⃣ Testing session creation...');
    const sessionId = await distilleryScrapeTracker.startSession();
    console.log(`✅ Session created: ${sessionId}`);
    
    // Test 5: Test recording a scrape
    console.log('\n5️⃣ Testing recordDistilleryScrape...');
    const testDistillery = selected[0];
    await distilleryScrapeTracker.recordDistilleryScrape(
      testDistillery,
      10, // spirits found
      8,  // spirits stored
      2,  // API calls
      ['Bourbon', 'Whiskey']
    );
    console.log(`✅ Recorded scrape for ${testDistillery.name}`);
    
    // Test 6: Verify the record
    console.log('\n6️⃣ Testing getDistilleryRecord...');
    const record = await distilleryScrapeTracker.getDistilleryRecord(testDistillery.name);
    console.log('✅ Retrieved record:', record);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

async function testUltraEfficientScraper() {
  console.log('\n\n🧪 Testing Ultra-Efficient Scraper...\n');
  
  try {
    // Test searchAndExtract method
    console.log('1️⃣ Testing searchAndExtract with a simple query...');
    
    // Use a test query that should return results from cache if available
    const testQuery = '"Buffalo Trace" bourbon whiskey';
    const metrics = await ultraEfficientScraper.searchAndExtract(testQuery, 5);
    
    console.log('✅ Search completed:');
    console.log(`  API Calls: ${metrics.apiCalls}`);
    console.log(`  Spirits Found: ${metrics.spiritsFound}`);
    console.log(`  Spirits Stored: ${metrics.spiritsStored}`);
    console.log(`  Efficiency: ${metrics.efficiency.toFixed(1)} spirits/call`);
    if (metrics.spiritTypes && metrics.spiritTypes.length > 0) {
      console.log(`  Spirit Types: ${metrics.spiritTypes.join(', ')}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting V2.5.6 Scraper Tests...\n');
  console.log('=' .repeat(60));
  
  // Check environment
  console.log('📋 Environment Check:');
  console.log(`  UPSTASH_REDIS_REST_URL: ${process.env.UPSTASH_REDIS_REST_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  UPSTASH_REDIS_REST_TOKEN: ${process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`  GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SEARCH_ENGINE_ID: ${process.env.SEARCH_ENGINE_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing'}`);
  
  // Run tests
  const trackerSuccess = await testDistilleryTracker();
  const scraperSuccess = await testUltraEfficientScraper();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Summary:');
  console.log(`  Distillery Tracker: ${trackerSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  Ultra-Efficient Scraper: ${scraperSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('\n✨ Testing complete!');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});