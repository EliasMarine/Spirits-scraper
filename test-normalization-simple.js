// Simple test for normalization-keys without TypeScript compilation

const { createNormalizedKey, createMultipleKeys, extractVariantInfo } = require('./dist/services/normalization-keys.js');

console.log('🧪 Testing Normalization Keys Integration\n');

// Test normalization with different variants
const testNames = [
  'Buffalo Trace Bourbon 750ml',
  'Buffalo Trace Bourbon Sample',
  'Buffalo Trace Bourbon Gift Box with Glasses',
  'Buffalo Trace Bourbon - Order Online',
  'Buffalo Trace Bourbon (2023)',
  'Buffalo Trace Bourbon 90 Proof',
  'Buffalo Trace Bourbon 90 Pf',
  'Eagle Rare 10 Year Bourbon 750ml',
  'Eagle Rare 10 Year Bourbon Sample'
];

console.log('Normalization results:');
testNames.forEach(name => {
  const keys = createMultipleKeys(name);
  const variant = extractVariantInfo(name);
  console.log(`\nOriginal: "${name}"`);
  console.log(`Standard key: "${keys.standard}"`);
  console.log(`Aggressive key: "${keys.aggressive}"`);
  console.log(`Ultra-aggressive key: "${keys.ultraAggressive}"`);
  if (variant.size || variant.year || variant.giftSet) {
    console.log(`Variant info: size=${variant.size}, year=${variant.year}, gift=${variant.giftSet}`);
  }
});

// Test duplicate detection
console.log('\n\n📊 Duplicate Detection:');
const duplicatePairs = [
  ['Eagle Rare 10 Year Bourbon 750ml', 'Eagle Rare 10 Year Bourbon Sample'],
  ['Weller Special Reserve', 'Weller Special Reserve Gift Box'],
  ['Blanton\'s Single Barrel', 'Blantons Single Barrel'],
  ['E.H. Taylor Small Batch', 'E H Taylor Small Batch'],
  ['Buffalo Trace Bourbon 750ml', 'Buffalo Trace Bourbon 1L']
];

duplicatePairs.forEach(([name1, name2]) => {
  const keys1 = createMultipleKeys(name1);
  const keys2 = createMultipleKeys(name2);
  
  const isDuplicate = keys1.aggressive === keys2.aggressive || 
                     keys1.ultraAggressive === keys2.ultraAggressive;
  
  console.log(`\n"${name1}" vs "${name2}"`);
  console.log(`Duplicate detected: ${isDuplicate ? '✅ YES' : '❌ NO'}`);
});

console.log('\n\n✅ Testing complete!');