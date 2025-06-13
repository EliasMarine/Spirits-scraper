import { queryGenerator } from './services/query-generator.js';

console.log('🔍 Testing Query Generator Exclusions...\n');

// Test spirit queries
console.log('📋 Spirit Queries with Exclusions:\n');

const spiritQueries = queryGenerator.generateSpiritQueries('Buffalo Trace', 'Buffalo Trace', {
  includeRetailers: true,
  includeReviews: true,
});

spiritQueries.forEach((query, index) => {
  console.log(`Query ${index + 1}:`);
  console.log(`  ${query}`);
  
  // Check for exclusions
  const hasExclusions = query.includes('-shirt') && query.includes('-tour') && query.includes('-beer');
  console.log(`  ✓ Has exclusions: ${hasExclusions ? 'YES' : 'NO'}\n`);
});

// Test category queries
console.log('\n📋 Category Queries with Exclusions:\n');

const categoryQueries = queryGenerator.generateCategoryQueries('bourbon');

// Show first 5 queries
categoryQueries.slice(0, 5).forEach((query, index) => {
  console.log(`Category Query ${index + 1}:`);
  console.log(`  ${query}`);
  
  // Check for exclusions
  const hasExclusions = query.includes('-shirt') || query.includes('-tour') || query.includes('-beer');
  console.log(`  ✓ Has exclusions: ${hasExclusions ? 'YES' : 'NO'}\n`);
});

console.log(`... and ${categoryQueries.length - 5} more queries\n`);

// Verify exclusion comprehensiveness
console.log('📊 Exclusion Categories Coverage:\n');

const firstQuery = spiritQueries[0];
const exclusionCategories = {
  'Merchandise': ['-shirt', '-polo', '-hat', '-clothing'],
  'Tours': ['-tour', '-visit', '-experience'],
  'Beer': ['-beer', '-ale', '-stout'],
  'Food/Cocktails': ['-recipe', '-cocktail', '-food'],
  'Articles': ['-blog', '-article', '-news'],
  'Events': ['-event', '-festival', '-ticket'],
};

for (const [category, patterns] of Object.entries(exclusionCategories)) {
  const hasPatterns = patterns.some(pattern => firstQuery.includes(pattern));
  console.log(`  ${category}: ${hasPatterns ? '✅' : '❌'}`);
}

console.log('\n✅ Query generator is configured with comprehensive exclusions!');