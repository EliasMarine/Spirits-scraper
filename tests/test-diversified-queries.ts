#!/usr/bin/env node

import { diversifiedQueryGenerator } from './services/diversified-query-generator.js';
import { cacheService } from './services/cache-service.js';
import { logger } from './utils/logger.js';

async function testDiversifiedQueries() {
  console.log('🧪 Testing Diversified Query Generator\n');

  try {
    // Initialize services
    await cacheService.initialize();
    
    // Test 1: Basic diversification with moderate limit
    console.log('📋 Test 1: Basic Diversification (50 queries)');
    console.log('─'.repeat(50));
    
    const result1 = await diversifiedQueryGenerator.generateDiversifiedQueries({
      category: 'bourbon',
      limit: 50,
      minCacheAge: 1, // 1 hour
      maxCacheHitRate: 0.2,
      useTimeRandomization: true,
      useBrandRotation: true,
      useRegionalVariation: true,
      forceUniqueQueries: true,
    });

    console.log(`Generated ${result1.queries.length} queries`);
    console.log(`Diversity Score: ${result1.analytics.diversityScore}/100`);
    console.log(`Expected Cache Misses: ${result1.analytics.expectedCacheMisses}/${result1.analytics.totalGenerated}`);
    console.log('\nSample queries:');
    result1.queries.slice(0, 10).forEach((query, i) => {
      console.log(`  ${i + 1}. "${query}"`);
    });

    // Test 2: High-volume diversification
    console.log('\n📋 Test 2: High-Volume Diversification (200 queries)');
    console.log('─'.repeat(50));
    
    const result2 = await diversifiedQueryGenerator.generateDiversifiedQueries({
      category: 'bourbon',
      limit: 200,
      minCacheAge: 12, // 12 hours
      maxCacheHitRate: 0.1, // Very low cache hit rate
      useTimeRandomization: true,
      useBrandRotation: true,
      useRegionalVariation: true,
      forceUniqueQueries: true,
    });

    console.log(`Generated ${result2.queries.length} queries`);
    console.log(`Diversity Score: ${result2.analytics.diversityScore}/100`);
    console.log(`Expected Cache Misses: ${result2.analytics.expectedCacheMisses}/${result2.analytics.totalGenerated}`);

    // Test 3: Category comparison
    console.log('\n📋 Test 3: Category Comparison');
    console.log('─'.repeat(50));
    
    const categories = ['bourbon', 'scotch', 'irish', 'rum', 'gin'];
    
    for (const category of categories) {
      const result = await diversifiedQueryGenerator.generateDiversifiedQueries({
        category,
        limit: 20,
        minCacheAge: 6,
        useTimeRandomization: true,
        useBrandRotation: true,
        useRegionalVariation: true,
      });
      
      console.log(`${category.toUpperCase()}: ${result.queries.length} queries, diversity: ${result.analytics.diversityScore}/100`);
      console.log(`  Sample: "${result.queries[0]}"`);
    }

    // Test 4: Query uniqueness validation
    console.log('\n📋 Test 4: Query Uniqueness Validation');
    console.log('─'.repeat(50));
    
    const result4 = await diversifiedQueryGenerator.generateDiversifiedQueries({
      category: 'bourbon',
      limit: 100,
      forceUniqueQueries: true,
    });

    const uniqueQueries = new Set(result4.queries.map(q => q.toLowerCase()));
    const duplicateCount = result4.queries.length - uniqueQueries.size;
    
    console.log(`Total queries: ${result4.queries.length}`);
    console.log(`Unique queries: ${uniqueQueries.size}`);
    console.log(`Duplicates removed: ${duplicateCount}`);
    console.log(`Uniqueness: ${((uniqueQueries.size / result4.queries.length) * 100).toFixed(1)}%`);

    // Test 5: Time randomization patterns
    console.log('\n📋 Test 5: Time Randomization Patterns');
    console.log('─'.repeat(50));
    
    const timeResult = await diversifiedQueryGenerator.generateDiversifiedQueries({
      category: 'bourbon',
      limit: 30,
      useTimeRandomization: true,
      useBrandRotation: false,
      useRegionalVariation: false,
    });

    console.log('Time-randomized queries:');
    timeResult.queries.slice(0, 8).forEach((query, i) => {
      console.log(`  ${i + 1}. "${query}"`);
    });

    // Test 6: Brand rotation patterns
    console.log('\n📋 Test 6: Brand Rotation Patterns');
    console.log('─'.repeat(50));
    
    const brandResult = await diversifiedQueryGenerator.generateDiversifiedQueries({
      category: 'bourbon',
      limit: 30,
      useTimeRandomization: false,
      useBrandRotation: true,
      useRegionalVariation: false,
    });

    console.log('Brand-rotation queries:');
    brandResult.queries.slice(0, 8).forEach((query, i) => {
      console.log(`  ${i + 1}. "${query}"`);
    });

    // Test 7: Regional variation patterns
    console.log('\n📋 Test 7: Regional Variation Patterns');
    console.log('─'.repeat(50));
    
    const regionalResult = await diversifiedQueryGenerator.generateDiversifiedQueries({
      category: 'bourbon',
      limit: 30,
      useTimeRandomization: false,
      useBrandRotation: false,
      useRegionalVariation: true,
    });

    console.log('Regional-variation queries:');
    regionalResult.queries.slice(0, 8).forEach((query, i) => {
      console.log(`  ${i + 1}. "${query}"`);
    });

    // Test 8: Cache avoidance simulation
    console.log('\n📋 Test 8: Cache Avoidance Simulation');
    console.log('─'.repeat(50));
    
    // Simulate some cached queries first
    await cacheService.cacheSearchQuery('bourbon whiskey', {}, { items: [{ title: 'Test' }] });
    await cacheService.cacheSearchQuery('best bourbon', {}, { items: [] });
    
    const cacheAvoidResult = await diversifiedQueryGenerator.generateDiversifiedQueries({
      category: 'bourbon',
      limit: 50,
      minCacheAge: 0, // Avoid all cached queries
      maxCacheHitRate: 0.1,
    });

    console.log(`Generated ${cacheAvoidResult.queries.length} cache-avoiding queries`);
    console.log(`Expected cache misses: ${cacheAvoidResult.analytics.expectedCacheMisses}`);
    console.log(`Cache hit avoidance rate: ${((cacheAvoidResult.analytics.expectedCacheMisses / cacheAvoidResult.analytics.totalGenerated) * 100).toFixed(1)}%`);

    // Display query statistics
    console.log('\n📊 Query Generator Statistics');
    console.log('─'.repeat(50));
    
    const stats = diversifiedQueryGenerator.getQueryStats();
    console.log(`Total used queries: ${stats.totalUsedQueries}`);
    console.log(`Unique queries: ${stats.uniqueQueries}`);
    console.log(`Brand rotation index: ${stats.brandRotationIndex}`);
    console.log(`Region rotation index: ${stats.regionRotationIndex}`);
    
    if (stats.oldestQuery) {
      const oldestAge = Math.round((Date.now() - stats.oldestQuery) / 1000);
      console.log(`Oldest query: ${oldestAge} seconds ago`);
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n💡 Performance Recommendations:');
    console.log('   • Use high diversification for limits > 50 to reduce cache dependency');
    console.log('   • Enable all variation strategies for maximum diversity');
    console.log('   • Set minCacheAge to 6-24 hours for optimal cache avoidance');
    console.log('   • Target cache hit rate < 30% for maximum API efficiency');

  } catch (error) {
    logger.error('Test failed:', error);
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await cacheService.disconnect();
  }
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDiversifiedQueries();
}