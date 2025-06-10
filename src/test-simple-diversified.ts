#!/usr/bin/env node

import { diversifiedQueryGenerator } from './services/diversified-query-generator.js';

async function testSimple() {
  console.log('🧪 Simple Diversified Query Test\n');

  try {
    console.log('📋 Generating 20 diversified bourbon queries...');
    
    const result = await diversifiedQueryGenerator.generateDiversifiedQueries({
      category: 'bourbon',
      limit: 20,
      minCacheAge: 1, // 1 hour
      useTimeRandomization: true,
      useBrandRotation: true,
      useRegionalVariation: true,
      forceUniqueQueries: true,
    });

    console.log(`✅ Generated ${result.queries.length} queries`);
    console.log(`📊 Diversity Score: ${result.analytics.diversityScore}/100`);
    console.log(`🎯 Expected Cache Misses: ${result.analytics.expectedCacheMisses}/${result.analytics.totalGenerated}`);
    
    console.log('\n📝 Sample queries:');
    result.queries.slice(0, 10).forEach((query, i) => {
      console.log(`  ${i + 1}. "${query}"`);
    });

    console.log('\n✅ Simple test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testSimple();