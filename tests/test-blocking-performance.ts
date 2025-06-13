/**
 * Performance Benchmark Tests for Blocking Deduplication Service
 * 
 * Tests the blocking efficiency with various dataset sizes including
 * large datasets (>100K records) to measure performance improvements.
 */

import { BlockingDeduplicationService, PerformanceMetrics } from './services/blocking-deduplication.js';
import { DatabaseSpirit } from './types/index.js';
import { logger } from './utils/logger.js';

// Test configuration
interface BenchmarkConfig {
  sizes: number[];
  iterations: number;
  enableComparisons: boolean;
}

const BENCHMARK_CONFIG: BenchmarkConfig = {
  sizes: [100, 1000, 5000, 10000, 50000, 100000],
  iterations: 3,
  enableComparisons: true
};

// Performance result tracking
interface BenchmarkResult {
  datasetSize: number;
  withBlocking: PerformanceMetrics;
  withoutBlocking?: {
    comparisons: number;
    estimatedTimeMs: number;
  };
  improvement: {
    comparisonsReduced: number;
    timeReductionPercentage: number;
    memoryEfficient: boolean;
  };
}

/**
 * Generate test dataset of specified size with controlled duplicates
 */
function generateTestDataset(size: number): DatabaseSpirit[] {
  const spirits: DatabaseSpirit[] = [];
  const brands = ['Jack Daniels', 'Maker\'s Mark', 'Woodford Reserve', 'Buffalo Trace', 'Wild Turkey'];
  const types = ['Bourbon', 'Tennessee Whiskey', 'American Whiskey', 'Rye Whiskey'];
  const sizes = ['750ml', '1L', '1.75L'];
  const years = ['2020', '2021', '2022', '2023', '2024'];
  const proofs = ['80 proof', '90 proof', '100 proof', '40% ABV', '45% ABV', '50% ABV'];
  
  for (let i = 0; i < size; i++) {
    const brand = brands[i % brands.length];
    const type = types[i % types.length];
    const baseYear = years[i % years.length];
    const bottleSize = sizes[i % sizes.length];
    const proof = proofs[i % proofs.length];
    
    // Create base spirit
    spirits.push({
      id: i + 1,
      name: `${brand} ${type} ${baseYear} ${bottleSize}`,
      brand,
      type,
      price: 30 + (i % 100),
      source_url: `https://example.com/spirit-${i}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      scraped_at: new Date().toISOString()
    });
    
    // Add duplicates for known patterns (about 15% duplication rate)
    if (i % 7 === 0 && spirits.length < size) {
      // Size variant duplicate
      const sizeVariant = sizes[(i + 1) % sizes.length];
      spirits.push({
        id: spirits.length + 1,
        name: `${brand} ${type} ${baseYear} ${sizeVariant}`,
        brand,
        type,
        price: 30 + (i % 100) + 5, // Slight price difference
        source_url: `https://example.com/spirit-variant-${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scraped_at: new Date().toISOString()
      });
    }
    
    if (i % 11 === 0 && spirits.length < size) {
      // Marketing text variant
      spirits.push({
        id: spirits.length + 1,
        name: `${brand} Small-Batch ${type} ${baseYear}`,
        brand,
        type,
        price: 30 + (i % 100),
        source_url: `https://example.com/spirit-marketing-${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scraped_at: new Date().toISOString()
      });
    }
    
    if (i % 13 === 0 && spirits.length < size) {
      // Proof notation variant
      const alternativeProof = proof.includes('proof') ? 
        `${parseInt(proof) / 2}% ABV` : 
        `${parseInt(proof) * 2} proof`;
      
      spirits.push({
        id: spirits.length + 1,
        name: `${brand} ${type} ${alternativeProof}`,
        brand,
        type,
        price: 30 + (i % 100),
        source_url: `https://example.com/spirit-proof-${i}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scraped_at: new Date().toISOString()
      });
    }
  }
  
  // Trim to exact size if we overshot due to duplicates
  return spirits.slice(0, size);
}

/**
 * Calculate estimated time for brute force comparison
 */
function estimateBruteForceTime(spiritCount: number): number {
  const comparisons = (spiritCount * (spiritCount - 1)) / 2;
  // Estimate 0.1ms per comparison (very optimistic)
  return comparisons * 0.1;
}

/**
 * Run blocking benchmark for a specific dataset size
 */
async function runBlockingBenchmark(size: number): Promise<BenchmarkResult> {
  logger.info(`\n=== Benchmark: ${size.toLocaleString()} spirits ===`);
  
  // Generate test dataset
  const startGeneration = Date.now();
  const testData = generateTestDataset(size);
  const generationTime = Date.now() - startGeneration;
  logger.info(`Generated ${testData.length} test spirits in ${generationTime}ms`);
  
  // Test different blocking configurations
  const standardConfig = {
    enablePerformanceMonitoring: true,
    enableProgressiveBlocking: true,
    progressiveChunkSize: 10000,
    memoryLimitMB: 512,
    maxBlockSize: 1000,
    batchSize: 5
  };
  
  const service = new BlockingDeduplicationService(standardConfig);
  
  // Run benchmark iterations
  const results: PerformanceMetrics[] = [];
  
  for (let iteration = 0; iteration < BENCHMARK_CONFIG.iterations; iteration++) {
    logger.info(`  Running iteration ${iteration + 1}/${BENCHMARK_CONFIG.iterations}`);
    
    const result = service.createBlocksWithMetrics(testData);
    results.push(result.metrics);
    
    logger.info(`    Iteration ${iteration + 1}: ${result.metrics.totalProcessingTime}ms, ` +
               `${result.metrics.throughputSpiritsPerSecond.toFixed(2)} spirits/sec, ` +
               `${result.metrics.memoryUsageMB}MB memory`);
  }
  
  // Calculate average metrics
  const avgMetrics: PerformanceMetrics = {
    totalProcessingTime: results.reduce((sum, r) => sum + r.totalProcessingTime, 0) / results.length,
    blockingTime: results.reduce((sum, r) => sum + r.blockingTime, 0) / results.length,
    memoryUsageMB: results.reduce((sum, r) => sum + r.memoryUsageMB, 0) / results.length,
    spiritsProcessed: size,
    blocksCreated: results.reduce((sum, r) => sum + r.blocksCreated, 0) / results.length,
    comparisonsAvoidedPercentage: results.reduce((sum, r) => sum + r.comparisonsAvoidedPercentage, 0) / results.length,
    throughputSpiritsPerSecond: results.reduce((sum, r) => sum + r.throughputSpiritsPerSecond, 0) / results.length,
    memoryEfficiency: results.reduce((sum, r) => sum + r.memoryEfficiency, 0) / results.length,
    blockingPassTimes: {}
  };
  
  // Calculate brute force comparison
  const bruteForceComparisons = (size * (size - 1)) / 2;
  const estimatedBruteForceTime = estimateBruteForceTime(size);
  
  const benchmarkResult: BenchmarkResult = {
    datasetSize: size,
    withBlocking: avgMetrics,
    withoutBlocking: {
      comparisons: bruteForceComparisons,
      estimatedTimeMs: estimatedBruteForceTime
    },
    improvement: {
      comparisonsReduced: bruteForceComparisons * (avgMetrics.comparisonsAvoidedPercentage / 100),
      timeReductionPercentage: ((estimatedBruteForceTime - avgMetrics.totalProcessingTime) / estimatedBruteForceTime) * 100,
      memoryEfficient: avgMetrics.memoryUsageMB < standardConfig.memoryLimitMB
    }
  };
  
  return benchmarkResult;
}

/**
 * Test multi-pass blocking performance
 */
async function testMultiPassBlocking(size: number): Promise<void> {
  logger.info(`\n=== Multi-Pass Blocking Test: ${size.toLocaleString()} spirits ===`);
  
  const testData = generateTestDataset(size);
  
  // Standard blocking
  const standardService = new BlockingDeduplicationService({
    enablePerformanceMonitoring: true,
    enableMultiPass: false
  });
  const standardResult = standardService.createBlocksWithMetrics(testData);
  
  // Multi-pass blocking
  const multiPassService = new BlockingDeduplicationService({
    enablePerformanceMonitoring: true,
    enableMultiPass: true
  });
  const multiPassResult = multiPassService.createBlocksMultiPass(testData);
  
  logger.info('Multi-pass vs Standard Blocking Comparison:', {
    standardBlocks: standardResult.blocks.size,
    multiPassBlocks: multiPassResult.blocks.size,
    standardTime: `${standardResult.metrics.totalProcessingTime}ms`,
    multiPassTime: `${multiPassResult.metrics.totalProcessingTime}ms`,
    standardRecall: `${standardResult.metrics.comparisonsAvoidedPercentage.toFixed(2)}%`,
    multiPassRecall: `${multiPassResult.metrics.comparisonsAvoidedPercentage.toFixed(2)}%`,
    timeOverhead: `${((multiPassResult.metrics.totalProcessingTime / standardResult.metrics.totalProcessingTime - 1) * 100).toFixed(2)}%`,
    recallImprovement: `${(multiPassResult.metrics.comparisonsAvoidedPercentage - standardResult.metrics.comparisonsAvoidedPercentage).toFixed(2)}%`
  });
}

/**
 * Test memory optimization with progressive blocking
 */
async function testMemoryOptimization(size: number): Promise<void> {
  logger.info(`\n=== Memory Optimization Test: ${size.toLocaleString()} spirits ===`);
  
  const testData = generateTestDataset(size);
  
  // Test with different memory limits
  const memoryLimits = [128, 256, 512, 1024]; // MB
  
  for (const limit of memoryLimits) {
    const service = new BlockingDeduplicationService({
      enablePerformanceMonitoring: true,
      enableProgressiveBlocking: true,
      memoryLimitMB: limit,
      progressiveChunkSize: Math.max(1000, Math.floor(size / 10))
    });
    
    const result = service.createBlocksWithMetrics(testData);
    
    logger.info(`Memory Limit ${limit}MB:`, {
      usedProgressive: result.usedProgressiveBlocking,
      finalMemory: `${result.metrics.memoryUsageMB}MB`,
      memoryEfficient: result.memoryOptimized,
      processingTime: `${result.metrics.totalProcessingTime}ms`,
      throughput: `${result.metrics.throughputSpiritsPerSecond.toFixed(2)} spirits/sec`
    });
  }
}

/**
 * Run comprehensive performance benchmarks
 */
async function runPerformanceBenchmarks(): Promise<void> {
  logger.info('=== Blocking Deduplication Performance Benchmarks ===');
  logger.info(`Testing dataset sizes: ${BENCHMARK_CONFIG.sizes.map(s => s.toLocaleString()).join(', ')}`);
  logger.info(`Iterations per test: ${BENCHMARK_CONFIG.iterations}`);
  
  const benchmarkResults: BenchmarkResult[] = [];
  
  // Run benchmarks for each dataset size
  for (const size of BENCHMARK_CONFIG.sizes) {
    try {
      const result = await runBlockingBenchmark(size);
      benchmarkResults.push(result);
      
      // Log results for this size
      logger.info(`\nResults for ${size.toLocaleString()} spirits:`);
      logger.info(`  Blocking time: ${result.withBlocking.totalProcessingTime.toFixed(2)}ms`);
      logger.info(`  Throughput: ${result.withBlocking.throughputSpiritsPerSecond.toFixed(2)} spirits/sec`);
      logger.info(`  Memory usage: ${result.withBlocking.memoryUsageMB}MB`);
      logger.info(`  Blocks created: ${result.withBlocking.blocksCreated}`);
      logger.info(`  Comparisons avoided: ${result.withBlocking.comparisonsAvoidedPercentage.toFixed(2)}%`);
      logger.info(`  Estimated time reduction: ${result.improvement.timeReductionPercentage.toFixed(2)}%`);
      
    } catch (error) {
      logger.error(`Failed to benchmark size ${size}:`, error);
    }
  }
  
  // Test specific features with medium-sized dataset
  const mediumSize = 10000;
  await testMultiPassBlocking(mediumSize);
  await testMemoryOptimization(50000);
  
  // Generate summary report
  generateSummaryReport(benchmarkResults);
}

/**
 * Generate comprehensive summary report
 */
function generateSummaryReport(results: BenchmarkResult[]): void {
  logger.info('\n=== PERFORMANCE BENCHMARK SUMMARY ===');
  
  // Scalability analysis
  logger.info('\nScalability Analysis:');
  results.forEach(result => {
    const throughputMB = result.withBlocking.throughputSpiritsPerSecond * 0.002; // Assume 2KB per spirit
    logger.info(`  ${result.datasetSize.toLocaleString().padStart(8)} spirits: ` +
               `${result.withBlocking.totalProcessingTime.toFixed(0).padStart(6)}ms ` +
               `(${result.withBlocking.throughputSpiritsPerSecond.toFixed(0).padStart(5)} spirits/sec, ` +
               `${throughputMB.toFixed(2)} MB/sec)`);
  });
  
  // Performance improvements
  logger.info('\nPerformance Improvements vs Brute Force:');
  results.forEach(result => {
    logger.info(`  ${result.datasetSize.toLocaleString().padStart(8)} spirits: ` +
               `${result.withBlocking.comparisonsAvoidedPercentage.toFixed(1)}% fewer comparisons, ` +
               `${result.improvement.timeReductionPercentage.toFixed(1)}% faster`);
  });
  
  // Memory efficiency
  logger.info('\nMemory Efficiency:');
  results.forEach(result => {
    const memoryPerSpirit = result.withBlocking.memoryUsageMB / result.datasetSize * 1024; // KB per spirit
    logger.info(`  ${result.datasetSize.toLocaleString().padStart(8)} spirits: ` +
               `${result.withBlocking.memoryUsageMB.toFixed(1)}MB total ` +
               `(${memoryPerSpirit.toFixed(2)} KB/spirit)`);
  });
  
  // Key findings
  const largestTest = results[results.length - 1];
  logger.info('\n=== KEY FINDINGS ===');
  logger.info(`✓ Successfully tested up to ${largestTest.datasetSize.toLocaleString()} spirits`);
  logger.info(`✓ Achieved ${largestTest.withBlocking.throughputSpiritsPerSecond.toFixed(0)} spirits/sec throughput`);
  logger.info(`✓ Reduced comparisons by ${largestTest.withBlocking.comparisonsAvoidedPercentage.toFixed(1)}%`);
  logger.info(`✓ Memory usage: ${largestTest.withBlocking.memoryUsageMB}MB for ${largestTest.datasetSize.toLocaleString()} spirits`);
  
  const avgEfficiency = results.reduce((sum, r) => sum + r.withBlocking.comparisonsAvoidedPercentage, 0) / results.length;
  logger.info(`✓ Average blocking efficiency: ${avgEfficiency.toFixed(1)}%`);
}

// Run benchmarks if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceBenchmarks()
    .then(() => {
      logger.info('\n=== Performance Benchmarks Complete ===');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Benchmark failed:', error);
      process.exit(1);
    });
}

export { 
  runPerformanceBenchmarks, 
  generateTestDataset, 
  testMultiPassBlocking, 
  testMemoryOptimization 
};