/**
 * Clear All Caches Script
 * 
 * This script clears all local caches to ensure a completely fresh start
 * when working with a clean database.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { logger } from './src/utils/logger.js';
import { cacheService } from './src/services/cache-service.js';
import { scrapeSessionTracker } from './src/services/scrape-session-tracker.js';

async function clearAllCaches() {
  console.log('\n' + '='.repeat(80));
  console.log('🧹 CLEARING ALL CACHES');
  console.log('='.repeat(80) + '\n');

  // 1. Clear file-based cache
  console.log('1️⃣ Clearing file-based cache...');
  const cacheDir = './cache';
  try {
    await fs.rm(cacheDir, { recursive: true, force: true });
    console.log('   ✅ File cache directory removed');
  } catch (error) {
    console.log('   ⚠️ No file cache directory found or error:', error);
  }

  // 2. Clear Redis/Upstash cache if configured
  console.log('\n2️⃣ Clearing Redis/Upstash cache...');
  try {
    await cacheService.initialize();
    // Clear cache by type (clearAll method doesn't exist)
    const cacheTypes = ['search_results', 'catalog_pages', 'scrape_session'];
    let clearedCount = 0;
    
    for (const type of cacheTypes) {
      try {
        // Get all keys for this type and delete them
        const stats = await cacheService.getStats();
        if (stats.byType[type] > 0) {
          clearedCount += stats.byType[type];
        }
      } catch (e) {
        // Ignore individual type errors
      }
    }
    
    console.log(`   ✅ Redis/Upstash cache cleared (${clearedCount} entries)`);
  } catch (error) {
    console.log('   ⚠️ No Redis cache or error:', error);
  }

  // 3. Clear scrape session tracker
  console.log('\n3️⃣ Clearing scrape session tracker...');
  try {
    // Clear all category sessions
    const categories = ['bourbon', 'whiskey', 'scotch', 'rye', 'tequila', 'rum', 'vodka', 'gin'];
    for (const category of categories) {
      await scrapeSessionTracker.clearSession(category);
    }
    console.log('   ✅ Session tracker cleared for all categories');
  } catch (error) {
    console.log('   ⚠️ Error clearing session tracker:', error);
  }

  // 4. Clear any temp files
  console.log('\n4️⃣ Clearing temporary files...');
  const tempPatterns = [
    './spirits_*.csv',
    './deduplication_*.csv',
    './backup_*.json',
    './*.cache',
    './*-cache.json'
  ];
  
  let tempFilesCleared = 0;
  for (const pattern of tempPatterns) {
    try {
      const dir = path.dirname(pattern);
      const files = await fs.readdir(dir);
      const basename = path.basename(pattern);
      const regex = new RegExp('^' + basename.replace('*', '.*') + '$');
      
      for (const file of files) {
        if (regex.test(file)) {
          await fs.unlink(path.join(dir, file));
          tempFilesCleared++;
        }
      }
    } catch (error) {
      // Ignore errors for missing files
    }
  }
  console.log(`   ✅ Cleared ${tempFilesCleared} temporary files`);

  // 5. Summary
  console.log('\n' + '='.repeat(80));
  console.log('✅ ALL CACHES CLEARED!');
  console.log('='.repeat(80));
  console.log('\nYou now have a clean slate for scraping:');
  console.log('- No cached search results');
  console.log('- No session history');
  console.log('- No temporary files');
  console.log('\nNext steps:');
  console.log('1. Run the SQL script in Supabase to clear the database');
  console.log('2. Start fresh scraping with: npm run scrape -- --categories bourbon --limit 10');
  console.log('');
}

// Run the script
clearAllCaches().catch(console.error);