/**
 * Debug test for V3.1.4 validation issues
 */

import { smartProductValidator } from '../src/services/smart-product-validator.js';
import colors from 'colors';

async function debugValidation() {
  const testNames = [
    'Four Roses Limited Edition 2024',
    'Buffalo Trace Antique Collection 2023',
    'Buffalo Trace Collection 2023',  // Test if "Collection" is the issue
    'Four Roses Limited 2024',  // Test if "Edition" is the issue
    'Four Roses 2024 Limited Edition Small Batch'
  ];
  
  for (const name of testNames) {
    console.log(colors.cyan(`\nTesting: "${name}"`));
    const result = await smartProductValidator.validateProductName(name);
    
    console.log(`Valid: ${result.isValid}`);
    console.log(`Confidence: ${result.confidence}`);
    console.log(`Issues: ${result.issues.join(', ')}`);
    
    if (result.normalizedName && result.normalizedName !== name) {
      console.log(`Normalized: "${result.normalizedName}"`);
    }
  }
}

debugValidation().catch(console.error);