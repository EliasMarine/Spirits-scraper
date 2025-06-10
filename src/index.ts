#!/usr/bin/env node

import { validateConfig } from './config/index.js';
import { spiritExtractor } from './services/spirit-extractor.js';
import { supabaseStorage } from './services/supabase-storage.js';
import { batchProcessor, BatchProcessor, type BatchProgress } from './services/batch-processor.js';
import { logger, loggers } from './utils/logger.js';
import { retry } from './utils/retry.js';

// Command line arguments
const args = process.argv.slice(2);
const command = args[0];
const options = args.slice(1);

async function main() {
  try {
    // Validate configuration
    validateConfig();

    switch (command) {
    case 'search':
      await searchSpirit(options);
      break;

    case 'batch':
      await batchProcess(options);
      break;

    case 'seed':
      await seedDatabase();
      break;

    case 'enrich':
      await enrichSpirits(options);
      break;

    case 'stats':
      await showStats();
      break;

    default:
      showHelp();
    }
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

/**
 * Search for a single spirit
 */
async function searchSpirit(args: string[]) {
  if (args.length < 1) {
    console.error('Usage: npm run scrape search <spirit-name> [brand]');
    process.exit(1);
  }

  const name = args[0];
  const brand = args[1];

  loggers.scrapeStart(`${brand || ''} ${name}`.trim(), {});

  const startTime = Date.now();

  try {
    const result = await retry(() =>
      spiritExtractor.extractSpirit(name, brand, {
        maxResults: 30,
        includeRetailers: true,
        includeReviews: true,
        deepParse: true,
      }),
    );

    console.log('\n--- Extracted Spirit Data ---');
    console.log(JSON.stringify(result, null, 2));

    // Optionally store in database
    if (args.includes('--save')) {
      const storeResult = await supabaseStorage.storeSpirit(result);
      if (storeResult.success) {
        console.log(`\n✅ Saved to database with ID: ${storeResult.id}`);
      } else {
        console.log(`\n❌ Failed to save: ${storeResult.error}`);
      }
    }

    const duration = Date.now() - startTime;
    loggers.scrapeComplete(name, 1, duration);
  } catch (error) {
    loggers.scrapeError(name, error);
    console.error('\n❌ Search failed:', error);
  }
}

/**
 * Batch process spirits
 */
async function batchProcess(args: string[]) {
  const type = args[0] || 'file';

  if (type === 'category') {
    const category = args[1];
    if (!category) {
      console.error('Usage: npm run scrape batch category <category-name> [limit]');
      process.exit(1);
    }

    const limit = parseInt(args[2] || '50', 10);
    console.log(`\n🔄 Processing spirits in category: ${category} (limit: ${limit})`);

    const result = await batchProcessor.processByCategory(category, limit);
    showBatchResults(result);
  } else if (type === 'file') {
    // TODO: Implement file-based batch processing
    console.log('File-based batch processing not yet implemented');
  } else {
    console.error('Unknown batch type. Use: category or file');
  }
}

/**
 * Seed database with initial data
 */
async function seedDatabase() {
  console.log('\n🌱 Seeding database with initial spirit data...');
  console.log('This may take several minutes due to rate limits.\n');

  const processor = new BatchProcessor({
    concurrency: 5, // Lower concurrency for seeding
    progressCallback: (progress: BatchProgress) => {
      const percent = ((progress.completed / progress.total) * 100).toFixed(1);
      const successRate = ((progress.successful / progress.completed) * 100).toFixed(1);
      process.stdout.write(`\rProgress: ${percent}% | Success rate: ${successRate}% | Current: ${progress.currentItem || 'N/A'}    `);
    },
  });

  const result = await processor.processSeedData();

  console.log('\n');
  showBatchResults(result);
}

/**
 * Enrich spirits with missing data
 */
async function enrichSpirits(args: string[]) {
  const limit = parseInt(args[0] || '50', 10);

  console.log(`\n🔍 Enriching up to ${limit} spirits with missing data...`);

  const result = await batchProcessor.processEnrichment(limit);
  showBatchResults(result);
}

/**
 * Show database statistics
 */
async function showStats() {
  const stats = await supabaseStorage.getStats();

  console.log('\n📊 Database Statistics:');
  console.log(`Total spirits: ${stats.total}`);
  console.log(`Needs enrichment: ${stats.needsEnrichment}`);
  console.log('\nBy Category:');

  if (stats.byCategory.length > 0) {
    stats.byCategory.forEach((cat: any) => {
      console.log(`  ${cat.category?.name || 'Unknown'}: ${cat.count}`);
    });
  } else {
    console.log('  No categories found');
  }
}

/**
 * Show batch processing results
 */
function showBatchResults(result: any) {
  console.log('\n--- Batch Processing Results ---');
  console.log(`✅ Successful: ${result.successful.length}`);
  console.log(`❌ Failed: ${result.failed.length}`);
  console.log(`⏱️  Duration: ${(result.duration / 1000).toFixed(1)}s`);
  console.log(`🔍 Total processed: ${result.totalProcessed}`);

  if (result.failed.length > 0) {
    console.log('\nFailed items:');
    result.failed.slice(0, 10).forEach((f: any) => {
      console.log(`  - ${f.query}: ${f.error}`);
    });
    if (result.failed.length > 10) {
      console.log(`  ... and ${result.failed.length - 10} more`);
    }
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Spirits Scraper CLI

Usage: npm run scrape <command> [options]

Commands:
  search <name> [brand] [--save]   Search for a single spirit
  batch category <name> [limit]    Process spirits by category
  seed                            Seed database with initial data
  enrich [limit]                  Enrich spirits with missing data
  stats                           Show database statistics

Examples:
  npm run scrape search "Macallan 12" --save
  npm run scrape search "Blue Label" "Johnnie Walker"
  npm run scrape batch category Whiskey 100
  npm run scrape seed
  npm run scrape enrich 50
  npm run scrape stats

Environment Variables:
  GOOGLE_API_KEY           Your Google API key
  GOOGLE_SEARCH_ENGINE_ID  Your search engine ID
  SUPABASE_URL            Supabase project URL
  SUPABASE_SERVICE_KEY    Supabase service key
  `);
}

// Run main function
main().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});

// Export all services and utilities
export { spiritExtractor } from './services/spirit-extractor.js';
export { googleSearchClient } from './services/google-search.js';
export { queryGenerator } from './services/query-generator.js';
export { contentParser } from './services/content-parser.js';
export { dataValidator } from './services/data-validator.js';
export { supabaseStorage } from './services/supabase-storage.js';
export { batchProcessor, BatchProcessor, type BatchProgress } from './services/batch-processor.js';
export { config, validateConfig } from './config/index.js';
export { retry } from './utils/retry.js';
export { logger, loggers } from './utils/logger.js';

// Export types
export * from './types/index.js';