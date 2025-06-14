#!/usr/bin/env tsx

import { smartProductValidator } from '../services/smart-product-validator.js';
import { logger } from '../utils/logger.js';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const PATTERNS_FILE = path.join(process.cwd(), '.smart-validator-patterns.json');

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'export':
      exportPatterns();
      break;
      
    case 'import':
      importPatterns();
      break;
      
    case 'stats':
      showStats();
      break;
      
    case 'test':
      testValidation();
      break;
      
    default:
      console.log(`
Smart Product Validator Pattern Manager

Usage:
  npm run validator-patterns export   - Export learned patterns to file
  npm run validator-patterns import   - Import patterns from file
  npm run validator-patterns stats    - Show learning statistics
  npm run validator-patterns test     - Test validation on sample names
      `);
  }
}

function exportPatterns() {
  const patterns = smartProductValidator.exportLearnedPatterns();
  writeFileSync(PATTERNS_FILE, patterns);
  console.log(`✅ Exported patterns to ${PATTERNS_FILE}`);
  
  const stats = smartProductValidator.getStats();
  console.log(`\n📊 Exported Statistics:`);
  console.log(`   Total patterns: ${stats.totalPatterns}`);
  console.log(`   Valid patterns: ${stats.validPatterns}`);
  console.log(`   Invalid patterns: ${stats.invalidPatterns}`);
  console.log(`   Average confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
}

function importPatterns() {
  try {
    const patterns = readFileSync(PATTERNS_FILE, 'utf-8');
    smartProductValidator.importLearnedPatterns(patterns);
    console.log(`✅ Imported patterns from ${PATTERNS_FILE}`);
    
    const stats = smartProductValidator.getStats();
    console.log(`\n📊 Imported Statistics:`);
    console.log(`   Total patterns: ${stats.totalPatterns}`);
    console.log(`   Valid patterns: ${stats.validPatterns}`);
    console.log(`   Invalid patterns: ${stats.invalidPatterns}`);
    console.log(`   Average confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
  } catch (error) {
    console.error(`❌ Failed to import patterns:`, error);
  }
}

function showStats() {
  const stats = smartProductValidator.getStats();
  console.log(`\n📊 Smart Validator Statistics:`);
  console.log(`   Total patterns learned: ${stats.totalPatterns}`);
  console.log(`   Valid product patterns: ${stats.validPatterns}`);
  console.log(`   Invalid product patterns: ${stats.invalidPatterns}`);
  console.log(`   Average confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
  
  if (stats.totalPatterns === 0) {
    console.log(`\n💡 No patterns learned yet. The validator will learn as it processes products.`);
  }
}

async function testValidation() {
  const testNames = [
    // Valid products
    "Buffalo Trace Bourbon",
    "Macallan 18 Year Old",
    "Jack Daniel's Single Barrel Select",
    "WhistlePig 10 Year Straight Rye",
    
    // Invalid names
    "Bourbon Academy At Woodford Reserve",
    "Available For Purchase Are A Selection Of Bourbons",
    "It's All About The Whiskey",
    "Call (323) 655 9995 for pricing",
    ". Bourbon. Result",
    "Bourbon Biscuits",
    "Buffalo Trace Vs Eagle Rare Comparison"
  ];
  
  console.log(`\n🧪 Testing Smart Validator on Sample Names:\n`);
  
  for (const name of testNames) {
    const result = await smartProductValidator.validateProductName(name);
    const status = result.isValid ? '✅' : '❌';
    const confidence = (result.confidence * 100).toFixed(0);
    
    console.log(`${status} ${name}`);
    console.log(`   Confidence: ${confidence}%`);
    if (result.issues.length > 0) {
      console.log(`   Issues: ${result.issues.join(', ')}`);
    }
    if (result.normalizedName) {
      console.log(`   Normalized: ${result.normalizedName}`);
    }
    console.log('');
  }
}

// Run the main function
main().catch(error => {
  logger.error('Script error:', error);
  process.exit(1);
});