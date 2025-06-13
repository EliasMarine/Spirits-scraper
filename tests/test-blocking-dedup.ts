#!/usr/bin/env node

/**
 * Test Blocking Deduplication
 * 
 * Demonstrates the effectiveness of blocking techniques for large-scale deduplication
 */

import { BlockingDeduplicationService } from './services/blocking-deduplication.js';
import { DatabaseSpirit } from './types/index.js';

// Create test data with known duplicate patterns
const testSpirits: DatabaseSpirit[] = [
  // Buffalo Trace products (same brand block)
  {
    id: '1',
    name: 'Buffalo Trace Bourbon',
    brand: 'Buffalo Trace',
    type: 'Bourbon',
    price: 29.99,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Buffalo Trace Bourbon 750ml',
    brand: 'Buffalo Trace',
    type: 'Bourbon',
    price: 32.99,
    created_at: '2025-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Buffalo Trace Kosher Wheat',
    brand: 'Buffalo Trace',
    type: 'Bourbon',
    price: 44.99,
    created_at: '2025-01-03T00:00:00Z'
  },
  
  // Maker's Mark products (same brand block)
  {
    id: '4',
    name: "Maker's Mark Bourbon",
    brand: "Maker's Mark",
    type: 'Bourbon',
    price: 28.99,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: "Maker's Mark Cask Strength",
    brand: "Maker's Mark",
    type: 'Bourbon',
    price: 59.99,
    created_at: '2025-01-02T00:00:00Z'
  },
  
  // Wild Turkey products (phonetic match - "Wild" and "Wyld")
  {
    id: '6',
    name: 'Wild Turkey 101',
    brand: 'Wild Turkey',
    type: 'Bourbon',
    price: 24.99,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '7',
    name: 'Wyld Turkey 101 Bourbon', // Typo - should be caught by soundex
    brand: 'Wild Turkey',
    type: 'Bourbon',
    price: 25.99,
    created_at: '2025-01-02T00:00:00Z'
  },
  
  // Different spirit types
  {
    id: '8',
    name: 'Grey Goose Vodka',
    brand: 'Grey Goose',
    type: 'Vodka',
    price: 39.99,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '9',
    name: 'Hendricks Gin',
    brand: 'Hendricks',
    type: 'Gin',
    price: 34.99,
    created_at: '2025-01-01T00:00:00Z'
  },
  
  // Blanton's products (apostrophe variations)
  {
    id: '10',
    name: "Blanton's Single Barrel",
    brand: "Blanton's",
    type: 'Bourbon',
    price: 79.99,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '11',
    name: 'Blantons Single Barrel', // Missing apostrophe
    brand: 'Blantons',
    type: 'Bourbon',
    price: 82.99,
    created_at: '2025-01-02T00:00:00Z'
  }
];

async function testBlockingDeduplication() {
  console.log('Testing Blocking Deduplication Service\n');
  console.log('='.repeat(50));
  
  const blockingService = new BlockingDeduplicationService({
    minBlockSize: 2,
    enableMultiPass: true,
    enableSoundex: true,
    enableNGramFingerprint: true
  });
  
  // Create blocks
  console.log(`\nProcessing ${testSpirits.length} spirits...`);
  const blocks = blockingService.createBlocks(testSpirits);
  
  // Display blocks created
  console.log(`\nCreated ${blocks.size} blocks:`);
  console.log('-'.repeat(50));
  
  let blockIndex = 1;
  for (const [key, block] of blocks.entries()) {
    console.log(`\nBlock ${blockIndex}: ${key}`);
    console.log(`  Type: ${block.blockKey.type}`);
    console.log(`  Confidence: ${(block.blockKey.confidence * 100).toFixed(0)}%`);
    console.log(`  Size: ${block.size} spirits`);
    console.log('  Spirits:');
    block.spirits.forEach(spirit => {
      console.log(`    - ${spirit.brand} ${spirit.name}`);
    });
    blockIndex++;
  }
  
  // Calculate and display reduction
  console.log('\n' + '='.repeat(50));
  console.log('COMPARISON REDUCTION ANALYSIS');
  console.log('='.repeat(50));
  
  const reduction = blockingService.calculateReduction(testSpirits.length, blocks);
  
  console.log(`\nWithout blocking:`);
  console.log(`  Total comparisons needed: ${reduction.withoutBlocking.toLocaleString()}`);
  console.log(`  (Each spirit compared with every other spirit)`);
  
  console.log(`\nWith blocking:`);
  console.log(`  Total comparisons needed: ${reduction.withBlocking.toLocaleString()}`);
  console.log(`  (Spirits only compared within their blocks)`);
  
  console.log(`\nReduction:`);
  console.log(`  Comparisons saved: ${reduction.reduction.toLocaleString()}`);
  console.log(`  Reduction percentage: ${reduction.reductionPercentage.toFixed(1)}%`);
  
  // Demonstrate batch processing
  console.log('\n' + '='.repeat(50));
  console.log('BATCH PROCESSING DEMONSTRATION');
  console.log('='.repeat(50));
  
  const batchService = new BlockingDeduplicationService({ batchSize: 2 });
  const batchBlocks = batchService.createBlocks(testSpirits);
  
  console.log('\nProcessing blocks in batches of 2:');
  let batchNum = 1;
  for await (const batch of batchService.processBlocksInBatches(batchBlocks)) {
    console.log(`\nBatch ${batchNum}:`);
    batch.forEach(block => {
      console.log(`  - ${block.blockKey.key} (${block.size} spirits)`);
    });
    batchNum++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log('\nBlocking is most effective when:');
  console.log('1. Dataset has many spirits from same brands');
  console.log('2. Similar products have predictable patterns');
  console.log('3. Dataset is large (1000+ spirits)');
  console.log('\nIn this example:');
  console.log(`- ${testSpirits.length} spirits → ${blocks.size} blocks`);
  console.log(`- ${reduction.reductionPercentage.toFixed(1)}% fewer comparisons needed`);
  console.log(`- Duplicates are contained within blocks for efficient processing`);
}

// Run the test
testBlockingDeduplication().catch(console.error);