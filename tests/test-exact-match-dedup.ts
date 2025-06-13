#!/usr/bin/env tsx

/**
 * Test script for exact match deduplication
 */

// Set environment variables for testing
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-key';

import { ExactMatchDeduplicationService, DuplicateGroup } from './services/exact-match-deduplication';
import { createMultipleKeys } from './services/normalization-keys';

// Mock spirits based on our CSV analysis
const mockSpirits = [
  // Buffalo Trace size variants - should group together
  { 
    id: '1', 
    name: 'Buffalo Trace Bourbon 750ml', 
    brand: 'Buffalo Trace', 
    type: 'Bourbon',
    description: 'Classic bourbon whiskey',
    abv: 45,
    price_range: '$20-30',
    created_at: '2024-01-01',
    image_url: 'https://example.com/bt1.jpg'
  },
  { 
    id: '2', 
    name: 'Buffalo Trace Bourbon Sample', 
    brand: 'Buffalo Trace', 
    type: 'Bourbon',
    description: 'Classic bourbon',
    abv: 45,
    created_at: '2024-01-02'
  },
  { 
    id: '3', 
    name: 'Buffalo Trace Bourbon Magnum', 
    brand: 'Buffalo Trace', 
    type: 'Bourbon',
    abv: 45,
    created_at: '2024-01-03'
  },
  
  // Maker's Mark marketing variants - should group together
  { 
    id: '4', 
    name: "Maker's Mark Gift Box", 
    brand: "Maker's Mark", 
    type: 'Bourbon',
    description: 'Wheated bourbon with distinctive red wax seal',
    abv: 45,
    price_range: '$25-35',
    created_at: '2024-02-01'
  },
  { 
    id: '5', 
    name: "Maker's Mark Order Online", 
    brand: "Maker's Mark", 
    type: 'Bourbon',
    description: 'Wheated bourbon',
    abv: 45,
    created_at: '2024-02-02'
  },
  { 
    id: '6', 
    name: "Maker's Mark", 
    brand: "Maker's Mark", 
    type: 'Bourbon',
    description: 'Kentucky straight bourbon whiskey',
    abv: 45,
    price_range: '$25-35',
    image_url: 'https://example.com/mm.jpg',
    created_at: '2024-02-03'
  },
  
  // Year variants - should group together
  { 
    id: '7', 
    name: 'Buffalo Trace Kosher Wheat (2022)', 
    brand: 'Buffalo Trace', 
    type: 'Whiskey',
    abv: 47,
    created_at: '2024-03-01'
  },
  { 
    id: '8', 
    name: 'Buffalo Trace Kosher Wheat (2025)', 
    brand: 'Buffalo Trace', 
    type: 'Whiskey',
    abv: 47,
    price_range: '$60-80',
    created_at: '2024-03-02'
  },
  
  // Different products - should NOT group together
  { 
    id: '9', 
    name: 'Woodford Reserve', 
    brand: 'Woodford Reserve', 
    type: 'Bourbon',
    description: 'Premium small batch bourbon',
    abv: 43.2,
    created_at: '2024-04-01'
  },
  { 
    id: '10', 
    name: 'Eagle Rare 10 Year', 
    brand: 'Eagle Rare', 
    type: 'Bourbon',
    description: 'Single barrel bourbon aged 10 years',
    abv: 45,
    age_statement: '10 years',
    created_at: '2024-04-02'
  },
];

console.log('🧪 Testing Exact Match Deduplication\n');

// Create service instance
const service = new ExactMatchDeduplicationService({
  useStandardKey: true,
  useAggressiveKey: true,
  useUltraAggressiveKey: false,
  minGroupSize: 2,
  scoringWeights: {
    dataCompleteness: 0.3,
    createdDate: 0.2,
    hasImage: 0.2,
    hasPrice: 0.15,
    descriptionLength: 0.15,
  }
});

// Test grouping
console.log('📋 Testing Grouping Logic');
console.log('─'.repeat(50));

// Show normalized keys for each spirit
mockSpirits.forEach(spirit => {
  const keys = createMultipleKeys(spirit.name);
  console.log(`\n"${spirit.name}"`);
  console.log(`  Standard: "${keys.standard}"`);
  console.log(`  Aggressive: "${keys.aggressive}"`);
});

// Find duplicate groups
console.log('\n\n🔍 Finding Duplicate Groups');
console.log('─'.repeat(50));

// Mock the findExactDuplicates method since we can't hit a real database
const groups: DuplicateGroup[] = [];

// Manually create groups based on our test data
const groupMap = new Map<string, any[]>();

mockSpirits.forEach(spirit => {
  const keys = createMultipleKeys(spirit.name);
  const groupKey = keys.aggressive;
  
  if (!groupMap.has(groupKey)) {
    groupMap.set(groupKey, []);
  }
  groupMap.get(groupKey)!.push(spirit);
});

// Convert to DuplicateGroup format
groupMap.forEach((spirits, key) => {
  if (spirits.length >= 2) {
    // Score spirits
    const scoredSpirits = spirits.map(spirit => {
      let score = 0;
      // Simple scoring based on data completeness
      if (spirit.description) score += 0.3;
      if (spirit.image_url) score += 0.2;
      if (spirit.price_range) score += 0.2;
      if (spirit.abv) score += 0.15;
      if (spirit.created_at) {
        // Newer is better
        const daysSinceCreation = spirits.indexOf(spirit);
        score += 0.15 * (1 - daysSinceCreation / spirits.length);
      }
      return { spirit, score };
    });
    
    scoredSpirits.sort((a, b) => b.score - a.score);
    
    const group: DuplicateGroup = {
      normalizedKey: key,
      spirits: spirits,
      primarySpirit: scoredSpirits[0].spirit,
      duplicates: scoredSpirits.slice(1).map(s => s.spirit),
      score: 0.85 + Math.random() * 0.15, // Mock confidence score
      mergeStrategy: spirits.length === 2 && spirits[0].brand === spirits[1].brand ? 'auto' : 'manual'
    };
    
    groups.push(group);
  }
});

// Display results
groups.forEach((group, index) => {
  console.log(`\n🔑 Group ${index + 1}: "${group.normalizedKey}"`);
  console.log(`   Confidence: ${(group.score * 100).toFixed(1)}%`);
  console.log(`   Strategy: ${group.mergeStrategy}`);
  console.log(`   Primary: ${group.primarySpirit.name} (ID: ${group.primarySpirit.id})`);
  console.log(`   Duplicates:`);
  group.duplicates.forEach(dup => {
    console.log(`     - ${dup.name} (ID: ${dup.id})`);
  });
});

// Test statistics
console.log('\n\n📊 Deduplication Statistics');
console.log('─'.repeat(50));

const stats = service.getStatistics(groups);
console.log(`Total duplicate groups: ${stats.totalGroups}`);
console.log(`Total duplicate spirits: ${stats.totalDuplicates}`);
console.log(`Average group size: ${stats.avgGroupSize.toFixed(2)}`);
console.log(`Average confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
console.log('\nBy merge strategy:');
Object.entries(stats.byMergeStrategy).forEach(([strategy, count]) => {
  console.log(`  ${strategy}: ${count} groups`);
});

// Test merge simulation
console.log('\n\n🔄 Merge Simulation (Dry Run)');
console.log('─'.repeat(50));

// Simulate what would happen with merging
groups.forEach(group => {
  if (group.mergeStrategy === 'auto') {
    console.log(`\n✅ Would auto-merge: "${group.normalizedKey}"`);
    console.log(`   Keep: ${group.primarySpirit.name}`);
    console.log(`   Delete: ${group.duplicates.map(d => d.name).join(', ')}`);
    
    // Show what data would be merged
    const hasNewData = group.duplicates.some(dup => 
      (dup.price_range && !group.primarySpirit.price_range) ||
      (dup.image_url && !group.primarySpirit.image_url) ||
      (dup.description && (!group.primarySpirit.description || 
        dup.description.length > group.primarySpirit.description.length))
    );
    
    if (hasNewData) {
      console.log('   📈 Would gain additional data from duplicates');
    }
  } else if (group.mergeStrategy === 'manual') {
    console.log(`\n⚠️  Manual review needed: "${group.normalizedKey}"`);
    console.log(`   Spirits: ${group.spirits.map(s => s.name).join(', ')}`);
  }
});

console.log('\n\n✨ Exact match deduplication test complete!');