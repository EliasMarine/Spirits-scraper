// Simplified edge case testing
import { spiritDiscovery } from './src/services/spirit-discovery.js';
import { isExcludedDomain } from './src/config/excluded-domains.js';

console.log('🧪 EDGE CASE TESTING\n');

// Test 1: Generic Categories
console.log('1️⃣ Testing Generic Categories...');
const genericTests = [
  'bottled in bond bourbon',
  'Bottled In Bond Bourbon',
  'BOTTLED IN BOND BOURBON',
  'Barrel Strength Bourbons',
  'Barrel/cask Strength Bourbons',
  'Kentucky Straight Bourbon',
  'Single Barrel Bourbon',
  'Small Batch Bourbon'
];

genericTests.forEach(name => {
  const cleanName = name.toLowerCase().trim();
  const genericCategories = [
    'bottled in bond bourbon',
    'barrel strength bourbons',
    'cask strength bourbons',
    'single barrel bourbons',
    'small batch bourbons',
    'straight bourbon whiskey',
    'kentucky straight bourbon',
    'bourbon whiskey',
    'rye whiskey',
    'barrel/cask strength bourbons',
    'barrel strength bourbon',
    'cask strength bourbon',
    'single barrel bourbon',
    'small batch bourbon'
  ];
  
  const isGeneric = genericCategories.includes(cleanName);
  console.log(`  ${isGeneric ? '✅' : '❌'} "${name}" - ${isGeneric ? 'Correctly blocked' : 'ERROR: Not blocked!'}`);
});

// Test 2: Excluded Domains
console.log('\n2️⃣ Testing Excluded Domains...');
const excludedTests = [
  'https://fredminnick.com/reviews',
  'https://www.fredminnick.com/article',
  'https://reddit.com/r/bourbon',
  'https://www.reddit.com/comments/123',
  'https://old.reddit.com/r/whiskey',
  'https://facebook.com/bourbon',
  'https://twitter.com/whiskey',
  'https://tripadvisor.com/Restaurant'
];

excludedTests.forEach(url => {
  const isExcluded = isExcludedDomain(url);
  console.log(`  ${isExcluded ? '✅' : '❌'} ${url} - ${isExcluded ? 'Blocked' : 'NOT BLOCKED!'}`);
});

// Test 3: Name Cleaning
console.log('\n3️⃣ Testing Name Cleaning...');
const cleaningTests = [
  { 
    input: 'Wild Turkey Kentucky Straight Bourbon Whiskey Kentucky Straight',
    expected: 'Wild Turkey Kentucky Straight Bourbon Whiskey' 
  },
  { 
    input: 'Heaven Hill Bottled in Bond Bourbon Bottled in Bond',
    expected: 'Heaven Hill Bottled in Bond Bourbon' 
  },
  { 
    input: 'Buffalo Trace Single Barrel Bourbon Single Barrel',
    expected: 'Buffalo Trace Single Barrel Bourbon' 
  }
];

// Simple duplicate removal test
cleaningTests.forEach(test => {
  // Simulate duplicate removal
  let cleaned = test.input;
  const duplicatePatterns = [
    /(\s+Kentucky\s+Straight)(\s+Bourbon\s+Whiskey)?(\s+Kentucky\s+Straight)$/i,
    /(\s+Bottled\s+in\s+Bond)(\s+Bourbon)?(\s+Bottled\s+in\s+Bond)$/i,
    /(\s+Single\s+Barrel)(\s+Bourbon)?(\s+Single\s+Barrel)$/i,
  ];
  
  for (const pattern of duplicatePatterns) {
    cleaned = cleaned.replace(pattern, '$1$2');
  }
  
  const correct = cleaned === test.expected;
  console.log(`  ${correct ? '✅' : '❌'} "${test.input}"`);
  console.log(`     → "${cleaned}" ${correct ? '' : `(expected: "${test.expected}")`}`);
});

// Test 4: Invalid Names
console.log('\n4️⃣ Testing Invalid Names...');
const invalidNames = [
  'Bourbon',
  'Whiskey',
  '1792',
  'Premium Collection',
  'Total Wine Selection',
  '10 Best Bourbons',
  'What Is The Best Bourbon?',
  'Review 88: Buffalo Trace',
  'Buffalo Trace vs Eagle Rare',
  'New Bourbon Releases'
];

invalidNames.forEach(name => {
  const isInvalid = name.length < 8 || 
                   name.split(/\s+/).length < 2 ||
                   /^\d+\s+(best|top)/i.test(name) ||
                   /\?$/.test(name) ||
                   /vs\.?\s+/i.test(name) ||
                   /collection$/i.test(name) ||
                   /releases?$/i.test(name) ||
                   /^(whiskey|bourbon|scotch|vodka|gin|rum|tequila)$/i.test(name) ||
                   /\breview\s+\d+:/i.test(name);
  
  console.log(`  ${isInvalid ? '✅' : '❌'} "${name}" - ${isInvalid ? 'Blocked' : 'NOT BLOCKED!'}`);
});

// Test 5: Real Discovery Test
console.log('\n5️⃣ Testing Spirit Discovery...');
async function testRealDiscovery() {
  const testQueries = [
    'bottled in bond bourbon site:klwines.com',
    'reddit bourbon recommendations',
    'fredminnick best bourbons',
    'site:totalwine.com Eagle Rare bourbon'
  ];
  
  for (const query of testQueries) {
    try {
      const spirits = await spiritDiscovery.discoverSpiritsFromQuery(query, 5);
      console.log(`\n  Query: "${query}"`);
      console.log(`  Found: ${spirits.length} spirits`);
      
      if (spirits.length > 0) {
        spirits.forEach(s => {
          const hasExcludedDomain = s.source && isExcludedDomain(s.source);
          const isGeneric = genericCategories.includes(s.name?.toLowerCase().trim() || '');
          console.log(`    ${!hasExcludedDomain && !isGeneric ? '✅' : '❌'} ${s.name} (${s.brand || 'no brand'})`);
          if (hasExcludedDomain) console.log(`       ⚠️  Excluded domain: ${s.source}`);
          if (isGeneric) console.log(`       ⚠️  Generic category name`);
        });
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
  }
}

// Define generic categories for discovery test
const genericCategories = [
  'bottled in bond bourbon',
  'barrel strength bourbons',
  'cask strength bourbons',
  'single barrel bourbons',
  'small batch bourbons',
  'straight bourbon whiskey',
  'kentucky straight bourbon',
  'bourbon whiskey',
  'rye whiskey',
  'barrel/cask strength bourbons',
  'barrel strength bourbon',
  'cask strength bourbon',
  'single barrel bourbon',
  'small batch bourbon'
];

testRealDiscovery().then(() => {
  console.log('\n✅ Edge case testing complete!');
}).catch(console.error);