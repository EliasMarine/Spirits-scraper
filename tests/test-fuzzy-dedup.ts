#!/usr/bin/env tsx

/**
 * Test script for fuzzy match deduplication with TF-IDF
 */

// Set environment variables for testing
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-key';

import { FuzzyMatchDeduplicationService } from './services/fuzzy-match-deduplication';

// Test spirits with variations that should be caught by fuzzy matching
const testSpirits = [
  // Near duplicates with text variations
  {
    id: '1',
    name: 'Buffalo Trace Kentucky Straight Bourbon Whiskey',
    brand: 'Buffalo Trace',
    type: 'Bourbon',
    description: 'A smooth and complex bourbon with notes of vanilla, toffee and candied fruit.',
    abv: 45,
    created_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Buffalo Trace Bourbon Kentucky Straight Whisky',
    brand: 'Buffalo Trace',
    type: 'Bourbon',
    description: 'Smooth, complex bourbon featuring vanilla, toffee, and fruit notes.',
    abv: 45,
    created_at: '2024-01-02'
  },
  
  // Variations with typos
  {
    id: '3',
    name: "Maker's Mark Kentucky Straight Bourbon",
    brand: "Maker's Mark",
    type: 'Bourbon',
    description: 'Full-flavored, hand-dipped red wax seal bourbon.',
    created_at: '2024-02-01'
  },
  {
    id: '4',
    name: "Makers Mark Straight Bourbon Whisky",
    brand: "Maker's Mark",
    type: 'Bourbon',
    description: 'Full flavored bourbon with distinctive red wax seal.',
    created_at: '2024-02-02'
  },
  
  // Different products with similar names
  {
    id: '5',
    name: 'Eagle Rare 10 Year Single Barrel Bourbon',
    brand: 'Eagle Rare',
    type: 'Bourbon',
    description: 'A single barrel bourbon aged for no less than 10 years.',
    age_statement: '10 years',
    created_at: '2024-03-01'
  },
  {
    id: '6',
    name: 'Eagle Rare 17 Year Old Bourbon',
    brand: 'Eagle Rare',
    type: 'Bourbon',
    description: 'An ultra-premium bourbon aged for 17 years.',
    age_statement: '17 years',
    created_at: '2024-03-02'
  },
  
  // Word order variations
  {
    id: '7',
    name: 'Wild Turkey 101 Bourbon Whiskey',
    brand: 'Wild Turkey',
    type: 'Bourbon',
    description: 'High proof bourbon with bold, spicy flavor.',
    abv: 50.5,
    created_at: '2024-04-01'
  },
  {
    id: '8',
    name: 'Bourbon Wild Turkey 101',
    brand: 'Wild Turkey',
    type: 'Bourbon',
    description: 'Bold and spicy high-proof bourbon whiskey.',
    abv: 50.5,
    created_at: '2024-04-02'
  },
  
  // Abbreviation variations
  {
    id: '9',
    name: 'E.H. Taylor Small Batch Bottled in Bond',
    brand: 'E.H. Taylor',
    type: 'Bourbon',
    description: 'Bottled-in-Bond bourbon made from hand-selected barrels.',
    created_at: '2024-05-01'
  },
  {
    id: '10',
    name: 'EH Taylor Small Batch BiB',
    brand: 'E.H. Taylor',
    type: 'Bourbon',
    description: 'Hand selected barrels, bottled in bond bourbon.',
    created_at: '2024-05-02'
  },
  
  // Control: Actually different products
  {
    id: '11',
    name: 'Woodford Reserve Bourbon',
    brand: 'Woodford Reserve',
    type: 'Bourbon',
    description: 'A super premium small batch bourbon.',
    created_at: '2024-06-01'
  },
  {
    id: '12',
    name: 'Four Roses Single Barrel',
    brand: 'Four Roses',
    type: 'Bourbon',
    description: 'Complex and full-bodied single barrel bourbon.',
    created_at: '2024-06-02'
  }
];

console.log('🧪 Testing Fuzzy Match Deduplication with TF-IDF\n');

// Create service instance
const service = new FuzzyMatchDeduplicationService({
  sameBrandThreshold: 0.7,
  differentBrandThreshold: 0.85,
  tfidfWeight: 0.4,
  fuzzyWeight: 0.6,
  minDescriptionLength: 20,
  fuzzyMatchConfig: {
    threshold: 0.6,
    weights: {
      levenshtein: 0.2,
      jaroWinkler: 0.3,
      nGram: 0.2,
      phonetic: 0.1,
      tokenBased: 0.2,
    },
    nGramSize: 3,
    caseSensitive: false,
    removeStopWords: true,
  }
});

// Find fuzzy duplicates
console.log('🔍 Finding Fuzzy Duplicates');
console.log('─'.repeat(50));

const candidates = await service.findFuzzyDuplicates(testSpirits as any);

// Display results
console.log(`\nFound ${candidates.length} fuzzy match candidates:\n`);

candidates.forEach((candidate, index) => {
  console.log(`\n📋 Candidate ${index + 1}:`);
  console.log(`Spirit 1: "${candidate.spirit1.name}" (ID: ${candidate.spirit1.id})`);
  console.log(`Spirit 2: "${candidate.spirit2.name}" (ID: ${candidate.spirit2.id})`);
  console.log(`\n📊 Scores:`);
  console.log(`  Combined Similarity: ${(candidate.similarity * 100).toFixed(1)}%`);
  console.log(`  TF-IDF Score: ${(candidate.tfidfScore * 100).toFixed(1)}%`);
  console.log(`  Fuzzy Score: ${(candidate.fuzzyScore * 100).toFixed(1)}%`);
  console.log(`  Confidence: ${candidate.confidence}`);
  console.log(`\n🔍 Match Details:`);
  console.log(`  Brand Match: ${candidate.matchDetails.brandMatch ? '✅' : '❌'}`);
  console.log(`  Type Match: ${candidate.matchDetails.typeMatch ? '✅' : '❌'}`);
  if (candidate.matchDetails.descriptionSimilarity !== undefined) {
    console.log(`  Description Similarity: ${(candidate.matchDetails.descriptionSimilarity * 100).toFixed(1)}%`);
  }
  if (candidate.matchDetails.variantDifferences.length > 0) {
    console.log(`  Variant Differences: ${candidate.matchDetails.variantDifferences.join(', ')}`);
  }
  console.log(`\n🎯 Recommended Action: ${candidate.recommendedAction.toUpperCase()}`);
  console.log('─'.repeat(50));
});

// Test statistics
console.log('\n📊 Fuzzy Match Statistics');
console.log('─'.repeat(50));

const stats = service.getStatistics(candidates);
console.log(`Total candidates: ${stats.total}`);
console.log(`\nBy Action:`);
Object.entries(stats.byAction).forEach(([action, count]) => {
  console.log(`  ${action}: ${count}`);
});
console.log(`\nBy Confidence:`);
Object.entries(stats.byConfidence).forEach(([confidence, count]) => {
  console.log(`  ${confidence}: ${count}`);
});
console.log(`\nAverage Scores:`);
console.log(`  Combined: ${(stats.avgSimilarity * 100).toFixed(1)}%`);
console.log(`  TF-IDF: ${(stats.avgTFIDFScore * 100).toFixed(1)}%`);
console.log(`  Fuzzy: ${(stats.avgFuzzyScore * 100).toFixed(1)}%`);

// Test processing simulation
console.log('\n\n🔄 Processing Simulation (Dry Run)');
console.log('─'.repeat(50));

const processResults = await service.processFuzzyMatches(candidates, true);
console.log(`Processed: ${processResults.processed}`);
console.log(`Would merge: ${processResults.merged}`);
console.log(`Would flag for review: ${processResults.flagged}`);
console.log(`Ignored: ${processResults.ignored}`);

console.log('\n✨ Fuzzy match deduplication test complete!');