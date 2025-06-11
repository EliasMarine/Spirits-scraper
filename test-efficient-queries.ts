import { EfficientCatalogQueryGenerator } from './src/services/efficient-catalog-query-generator';
import { EnhancedQueryGenerator } from './src/services/enhanced-query-generator';
import { logger } from './src/utils/logger';

async function compareQueryApproaches() {
  console.log('\n=== QUERY GENERATION COMPARISON ===\n');
  
  // Old approach - individual product queries
  console.log('🔴 OLD APPROACH (Individual Product Queries):');
  console.log('-------------------------------------------');
  const oldGen = new EnhancedQueryGenerator();
  const oldQueries = oldGen.generateCategoryDiscoveryQueries('bourbon', 10);
  
  oldQueries.forEach((query, i) => {
    console.log(`${i + 1}. ${query}`);
  });
  
  console.log('\nProblem: Each query searches for ONE specific product!');
  console.log('Expected yield: ~1-2 spirits per query = 10-20 spirits total\n');
  
  // New approach - catalog queries
  console.log('🟢 NEW APPROACH (Catalog Page Queries):');
  console.log('--------------------------------------');
  const newQueries = EfficientCatalogQueryGenerator.generateCatalogQueries('bourbon', 10);
  
  newQueries.forEach((query, i) => {
    console.log(`${i + 1}. ${query.query}`);
    console.log(`   Expected yield: ${query.expectedYield} spirits`);
  });
  
  const totalYield = EfficientCatalogQueryGenerator.estimateTotalYield(newQueries);
  console.log(`\nTotal expected yield: ${totalYield} spirits from 10 queries!`);
  console.log('\n=== EFFICIENCY COMPARISON ===');
  console.log(`Old: 100 API calls → ~4 spirits (0.04 efficiency)`);
  console.log(`New: 100 API calls → ~${totalYield * 10} spirits (${(totalYield * 10 / 100).toFixed(1)} efficiency)`);
  console.log(`Improvement: ${Math.round(totalYield * 10 / 4)}x more efficient! 🚀\n`);
}

// Run the comparison
compareQueryApproaches().catch(console.error);