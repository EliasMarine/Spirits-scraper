#!/usr/bin/env tsx

/**
 * Test the integration of enhanced normalization with deduplication service
 */

// Set environment variables for testing
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-key';

import { DeduplicationService } from './services/deduplication-service';
import { createNormalizedKey, createMultipleKeys } from './services/normalization-keys';

// Mock spirit data based on our CSV analysis
const mockSpirits = [
  // Size variants - should be detected as duplicates
  { id: '1', name: 'Buffalo Trace Bourbon 750ml', brand: 'Buffalo Trace', type: 'Bourbon' },
  { id: '2', name: 'Buffalo Trace Bourbon Sample', brand: 'Buffalo Trace', type: 'Bourbon' },
  { id: '3', name: 'Buffalo Trace Bourbon Magnum', brand: 'Buffalo Trace', type: 'Bourbon' },
  
  // Marketing text variants
  { id: '4', name: "Maker's Mark Gift Box", brand: "Maker's Mark", type: 'Bourbon' },
  { id: '5', name: "Maker's Mark Order Online", brand: "Maker's Mark", type: 'Bourbon' },
  { id: '6', name: "Maker's Mark", brand: "Maker's Mark", type: 'Bourbon' },
  
  // Year variants
  { id: '7', name: 'Buffalo Trace Kosher Wheat (2022)', brand: 'Buffalo Trace', type: 'Whiskey' },
  { id: '8', name: 'Buffalo Trace Kosher Wheat (2025)', brand: 'Buffalo Trace', type: 'Whiskey' },
  
  // Proof notation variants
  { id: '9', name: 'Wild Turkey 81 Proof', brand: 'Wild Turkey', type: 'Bourbon' },
  { id: '10', name: 'Wild Turkey 81 Pf', brand: 'Wild Turkey', type: 'Bourbon' },
  
  // Different products (should NOT be duplicates)
  { id: '11', name: 'Woodford Reserve', brand: 'Woodford Reserve', type: 'Bourbon' },
  { id: '12', name: 'Eagle Rare 10 Year', brand: 'Eagle Rare', type: 'Bourbon' },
];

console.log('🧪 Testing Deduplication with Enhanced Normalization\n');

// Test normalization on spirit names
console.log('📋 Normalization Test Results:');
console.log('─'.repeat(50));

const groups = new Map<string, any[]>();

mockSpirits.forEach(spirit => {
  const keys = createMultipleKeys(spirit.name);
  const normalizedKey = keys.aggressive;
  
  if (!groups.has(normalizedKey)) {
    groups.set(normalizedKey, []);
  }
  groups.get(normalizedKey)!.push(spirit);
  
  console.log(`\n"${spirit.name}"`);
  console.log(`→ Standard: "${keys.standard}"`);
  console.log(`→ Aggressive: "${keys.aggressive}"`);
});

console.log('\n\n📊 Expected Duplicate Groups:');
console.log('─'.repeat(50));

groups.forEach((spirits, key) => {
  if (spirits.length > 1) {
    console.log(`\n🔑 Key: "${key}" (${spirits.length} duplicates)`);
    spirits.forEach(s => console.log(`   - [${s.id}] ${s.name}`));
  }
});

// Test the deduplication service comparison
console.log('\n\n🔬 Testing DeduplicationService Comparison:');
console.log('─'.repeat(50));

const dedupService = new DeduplicationService();

// Test specific pairs
const testPairs = [
  { spirit1: mockSpirits[0], spirit2: mockSpirits[1], expected: 'DUPLICATE' }, // Buffalo Trace size variants
  { spirit1: mockSpirits[3], spirit2: mockSpirits[5], expected: 'DUPLICATE' }, // Maker's Mark variants
  { spirit1: mockSpirits[6], spirit2: mockSpirits[7], expected: 'DUPLICATE' }, // Kosher Wheat year variants
  { spirit1: mockSpirits[8], spirit2: mockSpirits[9], expected: 'DUPLICATE' }, // Wild Turkey proof variants
  { spirit1: mockSpirits[0], spirit2: mockSpirits[10], expected: 'NOT_DUPLICATE' }, // Different products
];

testPairs.forEach(({ spirit1, spirit2, expected }) => {
  const match = dedupService.compareSpirits(spirit1 as any, spirit2 as any);
  const isDuplicate = match !== null && match.similarity >= 0.6;
  const result = isDuplicate ? 'DUPLICATE' : 'NOT_DUPLICATE';
  const correct = result === expected;
  
  console.log(`\n${spirit1.name} vs ${spirit2.name}`);
  console.log(`Expected: ${expected}, Got: ${result} ${correct ? '✅' : '❌'}`);
  if (match) {
    console.log(`Similarity: ${(match.similarity * 100).toFixed(1)}%`);
  }
});

console.log('\n\n✨ Integration test complete!');