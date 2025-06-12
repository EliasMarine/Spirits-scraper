#!/usr/bin/env node

/**
 * Debug test for session tracking
 */

import { scrapeSessionTracker } from './dist/services/scrape-session-tracker.js';
import { cacheService } from './dist/services/cache-service.js';
import { supabaseStorage } from './dist/services/supabase-storage.js';

async function debugSessionTracking() {
  console.log('=== SESSION TRACKING DEBUG ===\n');

  // Test 1: Check if we can get DB count
  console.log('1. Checking database counts:');
  try {
    const bourbonCount = await supabaseStorage.getSpiritCountByCategory('bourbon');
    const scotchCount = await supabaseStorage.getSpiritCountByCategory('scotch');
    console.log(`   - Bourbon spirits in DB: ${bourbonCount}`);
    console.log(`   - Scotch spirits in DB: ${scotchCount}`);
  } catch (error) {
    console.error('   ERROR getting DB counts:', error.message);
  }

  // Test 2: Check session states
  console.log('\n2. Checking session states:');
  
  // Bourbon session
  const bourbonSession = await scrapeSessionTracker.loadSession('bourbon');
  if (bourbonSession) {
    console.log('   - Bourbon session exists:');
    console.log(`     Spirits found: ${bourbonSession.spiritsFound}`);
    console.log(`     Spirits stored: ${bourbonSession.spiritsStored}`);
    console.log(`     Unique keys: ${bourbonSession.storedSpiritKeys.size}`);
    console.log(`     Last scraped: ${new Date(bourbonSession.lastScrapedAt).toLocaleString()}`);
  } else {
    console.log('   - No bourbon session found');
  }

  // Scotch session
  const scotchSession = await scrapeSessionTracker.loadSession('scotch');
  if (scotchSession) {
    console.log('   - Scotch session exists:');
    console.log(`     Spirits found: ${scotchSession.spiritsFound}`);
    console.log(`     Spirits stored: ${scotchSession.spiritsStored}`);
    console.log(`     Unique keys: ${scotchSession.storedSpiritKeys.size}`);
    console.log(`     Last scraped: ${new Date(scotchSession.lastScrapedAt).toLocaleString()}`);
  } else {
    console.log('   - No scotch session found');
  }

  // Test 3: Test shouldSkipCategory logic
  console.log('\n3. Testing shouldSkipCategory:');
  
  const bourbonSkip5 = await scrapeSessionTracker.shouldSkipCategory('bourbon', 5);
  console.log(`   - Bourbon limit 5: ${bourbonSkip5.skip ? 'SKIP' : 'SCRAPE'} - ${bourbonSkip5.reason || 'No reason'}`);
  
  const bourbonSkip100 = await scrapeSessionTracker.shouldSkipCategory('bourbon', 100);
  console.log(`   - Bourbon limit 100: ${bourbonSkip100.skip ? 'SKIP' : 'SCRAPE'} - ${bourbonSkip100.reason || 'No reason'}`);
  
  const bourbonSkip200 = await scrapeSessionTracker.shouldSkipCategory('bourbon', 200);
  console.log(`   - Bourbon limit 200: ${bourbonSkip200.skip ? 'SKIP' : 'SCRAPE'} - ${bourbonSkip200.reason || 'No reason'}`);

  const scotchSkip5 = await scrapeSessionTracker.shouldSkipCategory('scotch', 5);
  console.log(`   - Scotch limit 5: ${scotchSkip5.skip ? 'SKIP' : 'SCRAPE'} - ${scotchSkip5.reason || 'No reason'}`);

  // Test 4: Check cache directly
  console.log('\n4. Checking cache directly:');
  try {
    const bourbonCacheKey = 'scrape_session_bourbon';
    const bourbonCached = await cacheService.get(bourbonCacheKey, 'scrape_session');
    console.log(`   - Bourbon cache exists: ${bourbonCached ? 'YES' : 'NO'}`);
    if (bourbonCached && bourbonCached.data) {
      console.log(`     Cache type: ${bourbonCached.type}`);
      console.log(`     Spirits stored in cache: ${bourbonCached.data.spiritsStored}`);
    }
  } catch (error) {
    console.error('   ERROR checking cache:', error.message);
  }

  console.log('\n=== END DEBUG ===');
}

// Run debug
debugSessionTracking().catch(console.error);