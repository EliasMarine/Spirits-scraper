/**
 * Simple Clear All Caches Script
 * 
 * This script clears all local caches without Redis/Upstash complications
 */

import { promises as fs } from 'fs';
import path from 'path';

async function clearAllCaches() {
  console.log('\n' + '='.repeat(80));
  console.log('🧹 CLEARING ALL LOCAL CACHES (SIMPLE VERSION)');
  console.log('='.repeat(80) + '\n');

  let totalCleared = 0;

  // 1. Clear file-based cache directory
  console.log('1️⃣ Clearing file-based cache directory...');
  const cacheDir = './cache';
  try {
    const stats = await fs.stat(cacheDir);
    if (stats.isDirectory()) {
      const files = await fs.readdir(cacheDir);
      totalCleared += files.length;
      await fs.rm(cacheDir, { recursive: true, force: true });
      console.log(`   ✅ Removed cache directory with ${files.length} files`);
    }
  } catch (error) {
    console.log('   ℹ️ No cache directory found');
  }

  // 2. Clear temporary files in root directory
  console.log('\n2️⃣ Clearing temporary files...');
  const tempPatterns = [
    'spirits_*.csv',
    'deduplication_*.csv',
    'backup_*.json',
    '*.cache',
    '*-cache.json',
    'test-*.ts',
    'temp-*.json'
  ];
  
  let tempFilesCleared = 0;
  const rootFiles = await fs.readdir('.');
  
  for (const file of rootFiles) {
    // Check if file matches any temp pattern
    const shouldDelete = tempPatterns.some(pattern => {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(file);
    });
    
    if (shouldDelete && !file.includes('clear-all-caches')) {
      try {
        await fs.unlink(file);
        console.log(`   🗑️ Deleted: ${file}`);
        tempFilesCleared++;
      } catch (error) {
        console.log(`   ⚠️ Could not delete ${file}:`, error.message);
      }
    }
  }
  
  totalCleared += tempFilesCleared;
  console.log(`   ✅ Cleared ${tempFilesCleared} temporary files`);

  // 3. Clear any .cache directories
  console.log('\n3️⃣ Looking for hidden cache directories...');
  try {
    const hiddenCaches = ['.cache', '.redis-cache', '.scrape-cache'];
    let hiddenCleared = 0;
    
    for (const hidden of hiddenCaches) {
      try {
        await fs.rm(hidden, { recursive: true, force: true });
        console.log(`   🗑️ Removed ${hidden}`);
        hiddenCleared++;
      } catch {
        // Directory doesn't exist
      }
    }
    
    if (hiddenCleared > 0) {
      console.log(`   ✅ Cleared ${hiddenCleared} hidden cache directories`);
      totalCleared += hiddenCleared;
    } else {
      console.log('   ℹ️ No hidden cache directories found');
    }
  } catch (error) {
    console.log('   ⚠️ Error checking hidden directories:', error);
  }

  // 4. Summary
  console.log('\n' + '='.repeat(80));
  console.log(`✅ CACHE CLEARING COMPLETE! (${totalCleared} items removed)`);
  console.log('='.repeat(80));
  console.log('\n📝 Note about Redis/Upstash cache:');
  console.log('- Session data in Redis/Upstash will expire after 24 hours');
  console.log('- The scraper will create fresh cache entries on next run');
  console.log('\n💡 To force fresh API calls, you can also use:');
  console.log('- npm run scrape -- --categories bourbon --limit 10 --bypass-cache');
  console.log('\n🚀 Next steps:');
  console.log('1. Run the database cleanup SQL in Supabase');
  console.log('2. Start fresh scraping');
  console.log('');
}

// Run the script
clearAllCaches().catch(console.error);