/**
 * Debug integration test
 */

import { smartProductValidator } from '../src/services/smart-product-validator.js';
import { preStorageValidator } from '../src/services/pre-storage-validator.js';
import colors from 'colors';

async function debugIntegration() {
  console.log(colors.cyan('\n=== Debugging Integration Test ===\n'));
  
  const validSpirit = {
    name: 'Buffalo Trace Kentucky Straight Bourbon Whiskey',
    brand: 'Buffalo Trace',
    type: 'bourbon',
    price: 34.99,
    abv: 45,
    description: 'A tribute to the mighty buffalo'
  };
  
  console.log('Testing valid spirit:');
  console.log(JSON.stringify(validSpirit, null, 2));
  
  const smartResult = await smartProductValidator.validateProductName(validSpirit.name);
  console.log('\nSmart validator result:');
  console.log(`Valid: ${smartResult.isValid}`);
  console.log(`Confidence: ${smartResult.confidence}`);
  console.log(`Issues: ${smartResult.issues.join(', ')}`);
  
  const preStorageResult = await preStorageValidator.validate(validSpirit);
  console.log('\nPre-storage validator result:');
  console.log(`Valid: ${preStorageResult.isValid}`);
  console.log(`Quality Score: ${preStorageResult.qualityScore}`);
  console.log(`Issues: ${preStorageResult.issues.join(', ')}`);
  if (preStorageResult.rejectionReason) {
    console.log(`Rejection reason: ${preStorageResult.rejectionReason}`);
  }
}

debugIntegration().catch(console.error);