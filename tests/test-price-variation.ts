#!/usr/bin/env node

/**
 * Test Price Variation Handler
 * 
 * Tests the price variation analysis functionality
 */

import { PriceVariationHandler } from './services/price-variation-handler.js';
import { DatabaseSpirit } from './types/index.js';

// Create test data with price variations
const testSpirits: DatabaseSpirit[] = [
  // Buffalo Trace from different retailers - same normalized key
  {
    id: '1',
    name: 'Buffalo Trace Bourbon 750ml',
    brand: 'Buffalo Trace',
    type: 'Bourbon',
    price: 29.99,
    source_url: 'totalwine.com',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Buffalo Trace Bourbon 750 ml',
    brand: 'Buffalo Trace',
    type: 'Bourbon',
    price: 32.99,
    source_url: 'thewhiskyexchange.com',
    created_at: '2025-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Buffalo Trace Bourbon Gift Box',
    brand: 'Buffalo Trace',
    type: 'Bourbon',
    price: 27.99,
    source_url: 'klwines.com',
    created_at: '2025-01-03T00:00:00Z'
  },
  
  // Blanton's with very high price variation (different products)
  {
    id: '4',
    name: "Blanton's Single Barrel Bourbon",
    brand: "Blanton's",
    type: 'Bourbon',
    price: 79.99,
    source_url: 'totalwine.com',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: "Blanton's Single Barrel Bourbon 750ml",
    brand: "Blanton's",
    type: 'Bourbon',
    price: 149.99, // High variation - allocated/secondary market
    source_url: 'thewhiskyexchange.com',
    created_at: '2025-01-02T00:00:00Z'
  },
  
  // Wild Turkey with outlier price
  {
    id: '6',
    name: 'Wild Turkey 101 Bourbon',
    brand: 'Wild Turkey',
    type: 'Bourbon',
    price: 24.99,
    source_url: 'totalwine.com',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '7',
    name: 'Wild Turkey 101 Bourbon 750ml',
    brand: 'Wild Turkey',
    type: 'Bourbon',
    price: 89.99, // Outlier - likely a 1.75L or special edition
    source_url: 'klwines.com',
    created_at: '2025-01-02T00:00:00Z'
  },
  {
    id: '8',
    name: 'Wild Turkey 101 Bourbon Sample',
    brand: 'Wild Turkey',
    type: 'Bourbon',
    price: 26.99,
    source_url: 'thewhiskyexchange.com',
    created_at: '2025-01-03T00:00:00Z'
  },
  
  // Maker's Mark with consistent pricing
  {
    id: '9',
    name: "Maker's Mark Bourbon",
    brand: "Maker's Mark",
    type: 'Bourbon',
    price: 28.99,
    source_url: 'totalwine.com',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '10',
    name: "Maker's Mark Bourbon 750ml",
    brand: "Maker's Mark",
    type: 'Bourbon',
    price: 29.99,
    source_url: 'thewhiskyexchange.com',
    created_at: '2025-01-02T00:00:00Z'
  },
  {
    id: '11',
    name: "Maker's Mark Bourbon Whisky",
    brand: "Maker's Mark",
    type: 'Bourbon',
    price: 30.99,
    source_url: 'klwines.com',
    created_at: '2025-01-03T00:00:00Z'
  }
];

async function testPriceVariation() {
  console.log('Testing Price Variation Handler\n');
  console.log('='.repeat(50));
  
  const handler = new PriceVariationHandler({
    maxCoefficientOfVariation: 0.5,
    minPricesForStats: 2,
    outlierThreshold: 2.0,
    excludeOutliers: true
  });
  
  // Analyze price variations
  const groups = handler.analyzeByGroups(testSpirits);
  
  console.log(`\nFound ${groups.length} product groups with price variations\n`);
  
  // Display results for each group
  groups.forEach((group, index) => {
    console.log(`\nGroup ${index + 1}: ${group.normalizedKey}`);
    console.log('-'.repeat(40));
    console.log(`Spirits in group: ${group.spirits.length}`);
    console.log(`Primary spirit: ${group.primarySpirit.brand} ${group.primarySpirit.name}`);
    
    console.log('\nPrice Statistics:');
    console.log(`  Min: $${group.priceVariation.min.toFixed(2)}`);
    console.log(`  Max: $${group.priceVariation.max.toFixed(2)}`);
    console.log(`  Average: $${group.priceVariation.average.toFixed(2)}`);
    console.log(`  Median: $${group.priceVariation.median.toFixed(2)}`);
    console.log(`  Std Dev: $${group.priceVariation.standardDeviation.toFixed(2)}`);
    console.log(`  Coefficient of Variation: ${(group.priceVariation.coefficientOfVariation * 100).toFixed(1)}%`);
    
    console.log('\nPrices by source:');
    group.priceVariation.prices.forEach(p => {
      console.log(`  $${p.price.toFixed(2)} - ${p.source}`);
    });
    
    console.log(`\nSuggested Action: ${group.suggestedAction}`);
    
    // Apply price strategy
    const updatedSpirit = handler.applyPriceStrategy(group);
    console.log(`\nApplied Strategy Result:`);
    console.log(`  Original Price: $${group.primarySpirit.price}`);
    console.log(`  New Price: $${updatedSpirit.price}`);
    if (updatedSpirit.metadata?.price_variation_flagged) {
      console.log(`  ⚠️  Flagged for manual review`);
      console.log(`  Price range: ${updatedSpirit.metadata.price_range}`);
    }
  });
  
  // Get summary
  const summary = handler.getPriceSummary(groups);
  console.log('\n' + '='.repeat(50));
  console.log('OVERALL SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total product groups: ${summary.totalGroups}`);
  console.log(`High variation groups: ${summary.highVariationGroups}`);
  console.log(`Average coefficient of variation: ${(summary.averageCoefficientOfVariation * 100).toFixed(1)}%`);
  
  console.log('\nSuggested Actions:');
  Object.entries(summary.suggestedActions).forEach(([action, count]) => {
    if (count > 0) {
      console.log(`  ${action}: ${count} groups`);
    }
  });
}

// Run the test
testPriceVariation().catch(console.error);