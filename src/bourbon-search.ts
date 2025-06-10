#!/usr/bin/env tsx

import { SpiritExtractor } from './services/spirit-extractor.js';
import { SupabaseStorage } from './services/supabase-storage.js';
import { BatchProcessor } from './services/batch-processor.js';
import { logger } from './utils/logger.js';
import { EnhancedQueryGenerator } from './services/enhanced-query-generator.js';

async function searchBourbons(count: number) {
  try {
    logger.info(`Starting bourbon search for ${count} spirits`);

    // Initialize services
    const storage = new SupabaseStorage();
    const scraper = new SpiritExtractor();
    const batchProcessor = new BatchProcessor();
    const enhancedGenerator = new EnhancedQueryGenerator();

    // Generate comprehensive bourbon queries
    const bourbonQueries = [
      // Popular bourbon brands
      'Buffalo Trace bourbon whiskey',
      'Makers Mark bourbon',
      'Wild Turkey bourbon',
      'Four Roses bourbon',
      'Woodford Reserve bourbon',
      'Elijah Craig bourbon',
      'Knob Creek bourbon',
      'Bulleit bourbon',
      'Jim Beam bourbon varieties',
      'Heaven Hill bourbon',
      'Old Forester bourbon',
      'Eagle Rare bourbon',
      'Blantons bourbon',
      'Pappy Van Winkle bourbon',
      'Weller bourbon varieties',
      'George T Stagg bourbon',
      'Bookers bourbon',
      'Basil Hayden bourbon',
      'Angels Envy bourbon',
      'Michters bourbon',
      
      // Bourbon categories
      'wheated bourbon whiskey brands',
      'high rye bourbon whiskey',
      'bottled in bond bourbon',
      'single barrel bourbon',
      'small batch bourbon',
      'cask strength bourbon',
      'barrel proof bourbon',
      'Kentucky straight bourbon',
      'Tennessee bourbon whiskey',
      'craft bourbon distilleries',
      
      // Price ranges
      'premium bourbon under $50',
      'luxury bourbon over $100',
      'rare bourbon whiskey',
      'allocated bourbon list',
      'value bourbon recommendations',
      
      // Specific searches
      'bourbon whiskey 2024 releases',
      'new bourbon brands 2024',
      'limited edition bourbon',
      'bourbon distillery exclusive',
      'bourbon whiskey awards winners',
      
      // Regional
      'Kentucky bourbon trail spirits',
      'Texas bourbon whiskey',
      'Colorado bourbon distilleries',
      'Indiana bourbon brands',
      'New York bourbon whiskey',
    ];

    // Add year-specific queries
    const years = ['2024', '2023', '2022', '2021', '2020'];
    const yearQueries = years.flatMap(year => [
      `best bourbon releases ${year}`,
      `new bourbon whiskey ${year}`,
      `bourbon of the year ${year}`,
    ]);

    // Add specific distillery searches
    const distilleries = [
      'Heaven Hill', 'Buffalo Trace', 'Wild Turkey', 'Four Roses',
      'Beam Suntory', 'Brown-Forman', 'MGP', 'Barton 1792',
      'Castle & Key', 'Rabbit Hole', 'New Riff', 'Wilderness Trail'
    ];
    const distilleryQueries = distilleries.map(d => `${d} distillery bourbon catalog`);

    // Combine all queries
    let allQueries = [
      ...bourbonQueries,
      ...yearQueries,
      ...distilleryQueries,
      ...enhancedGenerator.generateBourbonQueries(Math.max(0, count - bourbonQueries.length - yearQueries.length - distilleryQueries.length))
    ];

    // Shuffle and limit to requested count
    allQueries = allQueries.sort(() => Math.random() - 0.5).slice(0, count);

    logger.info(`Generated ${allQueries.length} bourbon queries`);

    // Convert to search items
    const searchItems = allQueries.map(query => ({
      query,
      category: 'Bourbon',
      type: 'product_search'
    }));

    // Process in batches
    const results = await batchProcessor.processBatch(searchItems, {
      concurrency: 5,
      onProgress: (progress) => {
        logger.info('Progress:', {
          completed: progress.completed,
          total: progress.total,
          successRate: `${((progress.successful.length / Math.max(1, progress.completed)) * 100).toFixed(1)}%`
        });
      }
    });

    // Log final results
    logger.info('Bourbon search completed:', {
      total: results.successful.length + results.failed.length,
      successful: results.successful.length,
      failed: results.failed.length,
      spirits: results.successful.map(s => ({
        name: s.name,
        brand: s.brand,
        abv: s.abv
      }))
    });

  } catch (error) {
    logger.error('Bourbon search failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const count = parseInt(process.argv[2] || '100');
  searchBourbons(count);
}