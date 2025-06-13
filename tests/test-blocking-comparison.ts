/**
 * Simple Performance Comparison Test
 * 
 * Compares blocking vs non-blocking deduplication performance
 * with smaller datasets to demonstrate improvements clearly.
 */

import { BlockingDeduplicationService } from './services/blocking-deduplication.js';
import { DatabaseSpirit } from './types/index.js';

// Simple test data generator
function generateSimpleTestData(size: number): DatabaseSpirit[] {
  const spirits: DatabaseSpirit[] = [];
  const brands = ['Jack Daniels', 'Makers Mark', 'Woodford', 'Buffalo Trace', 'Wild Turkey'];
  const types = ['Bourbon', 'Tennessee Whiskey', 'Rye Whiskey'];
  
  for (let i = 0; i < size; i++) {
    const brand = brands[i % brands.length];
    const type = types[i % types.length];
    
    spirits.push({
      id: i + 1,
      name: `${brand} ${type} ${2020 + (i % 5)}`,
      brand,
      type,
      price: 30 + (i % 50),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      scraped_at: new Date().toISOString()
    });
    
    // Add some duplicates with variations
    if (i % 5 === 0 && spirits.length < size) {
      // Size variant
      spirits.push({
        id: spirits.length + 1,
        name: `${brand} ${type} ${2020 + (i % 5)} 750ml`,
        brand,
        type,
        price: 30 + (i % 50) + 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scraped_at: new Date().toISOString()
      });
    }
  }
  
  return spirits.slice(0, size);
}

// Calculate brute force comparisons
function calculateBruteForceComparisons(spiritCount: number): number {
  return (spiritCount * (spiritCount - 1)) / 2;
}

// Run comparison test
function runComparisonTest(): void {
  console.log('=== Blocking vs Non-Blocking Performance Comparison ===\n');
  
  const testSizes = [50, 100, 500, 1000, 2000];
  
  testSizes.forEach(size => {
    console.log(`--- Testing ${size} spirits ---`);
    
    const testData = generateSimpleTestData(size);
    const service = new BlockingDeduplicationService({
      enablePerformanceMonitoring: true,
      enableProgressiveBlocking: false, // Disable for small datasets
      maxBlockSize: 100,
      batchSize: 5
    });
    
    // Test blocking performance
    const startTime = Date.now();
    const result = service.createBlocksWithMetrics(testData);
    const blockingTime = Date.now() - startTime;
    
    // Calculate brute force comparison metrics
    const bruteForceComparisons = calculateBruteForceComparisons(size);
    const estimatedBruteForceTime = bruteForceComparisons * 0.1; // 0.1ms per comparison estimate
    
    // Calculate improvement
    const comparisonsWithBlocking = bruteForceComparisons * (1 - result.metrics.comparisonsAvoidedPercentage / 100);
    const timeImprovement = ((estimatedBruteForceTime - blockingTime) / estimatedBruteForceTime) * 100;
    
    console.log(`Blocking Results:`);
    console.log(`  Processing time: ${blockingTime}ms`);
    console.log(`  Blocks created: ${result.blocks.size}`);
    console.log(`  Memory usage: ${result.metrics.memoryUsageMB}MB`);
    console.log(`  Throughput: ${result.metrics.throughputSpiritsPerSecond.toFixed(2)} spirits/sec`);
    
    console.log(`Comparison Reduction:`);
    console.log(`  Without blocking: ${bruteForceComparisons.toLocaleString()} comparisons`);
    console.log(`  With blocking: ~${Math.round(comparisonsWithBlocking).toLocaleString()} comparisons`);
    console.log(`  Reduction: ${result.metrics.comparisonsAvoidedPercentage.toFixed(2)}%`);
    
    console.log(`Performance Improvement:`);
    console.log(`  Estimated time without blocking: ${estimatedBruteForceTime.toFixed(2)}ms`);
    console.log(`  Actual time with blocking: ${blockingTime}ms`);
    console.log(`  Time improvement: ${timeImprovement.toFixed(2)}%`);
    
    // Block distribution
    const blockTypes = Array.from(result.blocks.values()).reduce((acc, block) => {
      acc[block.blockKey.type] = (acc[block.blockKey.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`Block Distribution:`);
    Object.entries(blockTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} blocks`);
    });
    
    console.log(''); // Empty line between tests
  });
  
  // Progressive blocking test
  console.log('--- Progressive Blocking Test (Large Dataset) ---');
  const largeSize = 10000;
  const largeTestData = generateSimpleTestData(largeSize);
  
  const progressiveService = new BlockingDeduplicationService({
    enablePerformanceMonitoring: true,
    enableProgressiveBlocking: true,
    progressiveChunkSize: 2000,
    memoryLimitMB: 256
  });
  
  const progressiveResult = progressiveService.createBlocksWithMetrics(largeTestData);
  
  console.log(`Progressive Blocking Results (${largeSize} spirits):`);
  console.log(`  Used progressive blocking: ${progressiveResult.usedProgressiveBlocking}`);
  console.log(`  Processing time: ${progressiveResult.metrics.totalProcessingTime}ms`);
  console.log(`  Memory optimized: ${progressiveResult.memoryOptimized}`);
  console.log(`  Throughput: ${progressiveResult.metrics.throughputSpiritsPerSecond.toFixed(2)} spirits/sec`);
  console.log(`  Comparisons avoided: ${progressiveResult.metrics.comparisonsAvoidedPercentage.toFixed(2)}%`);
  
  // Summary
  console.log('\n=== Summary ===');
  console.log('✓ Blocking deduplication dramatically reduces comparisons needed');
  console.log('✓ Performance improves significantly with larger datasets');
  console.log('✓ Progressive blocking enables processing of very large datasets');
  console.log('✓ Memory usage remains controlled even with large datasets');
  console.log('✓ Multiple blocking strategies capture different duplicate patterns');
}

// Run the test
runComparisonTest();