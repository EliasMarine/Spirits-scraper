#!/usr/bin/env node

import { cacheService } from './services/cache-service.js';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import ora from 'ora';

// Load environment variables
config();

interface ClearCacheOptions {
  clearRedis?: boolean;
  clearFiles?: boolean;
  clearSearchQueries?: boolean;
  clearSpiritData?: boolean;
  clearUrlContent?: boolean;
  clearFailedAttempts?: boolean;
  showStats?: boolean;
}

async function comprehensiveCacheClear(options: ClearCacheOptions = {}) {
  const spinner = ora('Initializing comprehensive cache clear...').start();
  
  try {
    // Initialize cache service
    await cacheService.initialize();
    
    // Show current cache stats before clearing
    if (options.showStats !== false) {
      const beforeStats = await cacheService.getStats();
      spinner.info('📊 Current Cache Status:');
      console.log(`   Total entries: ${beforeStats.totalEntries}`);
      console.log(`   Search queries: ${beforeStats.byType['search_query'] || 0}`);
      console.log(`   Spirit data: ${beforeStats.byType['spirit_data'] || 0}`);
      console.log(`   URL content: ${beforeStats.byType['url_content'] || 0}`);
      console.log(`   Failed attempts: ${beforeStats.byType['failed_attempt'] || 0}`);
      console.log(`   Cache size: ${(beforeStats.sizeBytes / 1024).toFixed(2)} KB`);
      console.log('');
    }
    
    // Clear specific types or all
    const typesToClear = [];
    if (options.clearSearchQueries !== false) typesToClear.push('search_query');
    if (options.clearSpiritData !== false) typesToClear.push('spirit_data');
    if (options.clearUrlContent !== false) typesToClear.push('url_content');
    if (options.clearFailedAttempts !== false) typesToClear.push('failed_attempt');
    
    if (typesToClear.length === 4 || typesToClear.length === 0) {
      // Clear all cache
      spinner.text = 'Clearing all cache entries...';
      await cacheService.clearCache();
      spinner.succeed('✅ All cache cleared successfully!');
    } else {
      // Clear specific types
      for (const type of typesToClear) {
        spinner.text = `Clearing ${type} cache...`;
        await cacheService.clearCache(type);
        spinner.succeed(`✅ Cleared ${type} cache`);
      }
    }
    
    // Show stats after clearing
    if (options.showStats !== false) {
      const afterStats = await cacheService.getStats();
      console.log('\n📊 Cache Status After Clearing:');
      console.log(`   Total entries: ${afterStats.totalEntries}`);
      console.log(`   Cache size: ${(afterStats.sizeBytes / 1024).toFixed(2)} KB`);
    }
    
    console.log('\n💡 Tips for fresh scanning:');
    console.log('   • Use --force-refresh flag to bypass cache during scraping');
    console.log('   • Use --diversify-queries to generate unique queries');
    console.log('   • Consider using --max-cache-age 0 for absolute freshness');
    
  } catch (error) {
    spinner.fail('Cache clearing failed');
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await cacheService.disconnect();
  }
}

// Check if running from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: ClearCacheOptions = {
    clearSearchQueries: !args.includes('--keep-search'),
    clearSpiritData: !args.includes('--keep-spirits'),
    clearUrlContent: !args.includes('--keep-urls'),
    clearFailedAttempts: !args.includes('--keep-failed'),
    showStats: !args.includes('--quiet'),
  };
  
  if (args.includes('--help')) {
    console.log(`
Comprehensive Cache Clear Utility

Usage: npm run clear-cache-all [options]

Options:
  --keep-search     Keep search query cache
  --keep-spirits    Keep spirit data cache
  --keep-urls       Keep URL content cache
  --keep-failed     Keep failed attempt cache
  --quiet          Don't show statistics
  --help           Show this help

Examples:
  npm run clear-cache-all                    # Clear everything
  npm run clear-cache-all --keep-spirits     # Clear all except spirit data
  npm run clear-cache-all --quiet            # Clear without showing stats
`);
    process.exit(0);
  }
  
  comprehensiveCacheClear(options);
}

// Export for use in other scripts
export { comprehensiveCacheClear };