#!/usr/bin/env tsx

/**
 * Test script for normalization key generation
 * Tests patterns identified in duplicate analysis
 */

import { 
  createNormalizedKey, 
  createMultipleKeys,
  extractVariantInfo,
  groupByNormalizedKey 
} from './services/normalization-keys';

// Test cases based on actual duplicates found in analysis
const testCases = [
  // Size variants (8%)
  {
    group: 'Size Variants',
    inputs: [
      'Buffalo Trace Bourbon 750ml',
      'Buffalo Trace Bourbon Sample',
      'Buffalo Trace Bourbon Magnum',
      'Buffalo Trace Bourbon 1L',
      'Buffalo Trace Bourbon Miniature',
    ],
    expectedKey: 'buffalo trace bourbon',
  },
  
  // Marketing text (6%)
  {
    group: 'Marketing Text',
    inputs: [
      'Maker\'s Mark Gift Box',
      'Maker\'s Mark',
      'Maker\'s Mark Order Online',
      'Maker\'s Mark Ratings and Reviews',
      'Maker\'s Mark with Glass',
    ],
    expectedKey: 'makers mark',
  },
  
  // Year variants (4%)
  {
    group: 'Year Variants',
    inputs: [
      'Buffalo Trace Kosher Wheat (2022)',
      'Buffalo Trace Kosher Wheat (2025)',
      'Buffalo Trace Kosher Wheat 2023 Release',
      'Buffalo Trace Kosher Wheat',
    ],
    expectedKey: 'buffalo trace kosher wheat',
  },
  
  // Proof notation (4%)
  {
    group: 'Proof Notation',
    inputs: [
      'Wild Turkey 81 Proof',
      'Wild Turkey 81 Pf',
      'Wild Turkey 81 P.F.',
      'Wild Turkey 81 Proof.',
    ],
    expectedKey: 'wild turkey 81 pf',
  },
  
  // Complex real examples
  {
    group: 'Complex Examples',
    inputs: [
      'Buffalo Trace Single Barrel Select 750ml Gift Box',
      'Buffalo Trace Single Barrel Select',
      'Buffalo Trace Single Barrel Select Order Online 750 ML',
      'Buffalo Trace Single Barrel Select (2023) 750ml',
    ],
    expectedKey: 'buffalo trace sb select',
  },
  
  // Whiskey/Whisky normalization
  {
    group: 'Whiskey/Whisky',
    inputs: [
      'Woodford Reserve Straight Bourbon Whiskey',
      'Woodford Reserve Straight Bourbon Whisky',
      'Woodford Reserve Kentucky Straight Bourbon',
    ],
    expectedKey: 'woodford reserve ky bourbon',
  },
];

console.log('🧪 Testing Normalization Key Generation\n');

// Test each group
testCases.forEach(testCase => {
  console.log(`\n📋 Testing: ${testCase.group}`);
  console.log('─'.repeat(50));
  
  testCase.inputs.forEach(input => {
    const normalized = createNormalizedKey(input);
    const keys = createMultipleKeys(input);
    const variantInfo = extractVariantInfo(input);
    
    console.log(`\nInput: "${input}"`);
    console.log(`Standard key: "${keys.standard}"`);
    console.log(`Aggressive key: "${keys.aggressive}"`);
    console.log(`Ultra-aggressive: "${keys.ultraAggressive}"`);
    
    if (Object.keys(variantInfo).length > 0) {
      console.log(`Variant info:`, variantInfo);
    }
    
    // Check if it matches expected
    const matches = keys.aggressive === testCase.expectedKey;
    console.log(`✅ Matches expected: ${matches ? 'YES' : 'NO'} (expected: "${testCase.expectedKey}")`);
  });
});

// Test grouping functionality
console.log('\n\n📊 Testing Grouping Functionality');
console.log('─'.repeat(50));

const allNames = testCases.flatMap(tc => tc.inputs);
const groups = groupByNormalizedKey(allNames);

console.log(`\nTotal names: ${allNames.length}`);
console.log(`Unique groups: ${groups.size}`);
console.log('\nGroups found:');

groups.forEach((names, key) => {
  if (names.length > 1) {
    console.log(`\n🔑 Key: "${key}" (${names.length} items)`);
    names.forEach(name => console.log(`   - ${name}`));
  }
});

// Test edge cases
console.log('\n\n🔧 Testing Edge Cases');
console.log('─'.repeat(50));

const edgeCases = [
  "Blanton's Original Single Barrel",
  "Blanton's Original Single-Barrel",
  "E.H. Taylor Barrel Proof",
  "E H Taylor Barrel Proof",
  "Maker's Mark Cask Strength",
  "Makers Mark Cask Strength",
  "Buffalo Trace Bourbon-Private Select'barrel 684",
  "Buffalo Trace Bourbon Private Select Barrel 684",
];

edgeCases.forEach(name => {
  const key = createNormalizedKey(name);
  console.log(`\n"${name}"`);
  console.log(`→ "${key}"`);
});

console.log('\n\n✅ Normalization testing complete!');