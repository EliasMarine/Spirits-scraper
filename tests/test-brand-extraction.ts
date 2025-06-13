#!/usr/bin/env tsx
/**
 * Test brand extraction improvements
 */

import { spiritDiscovery } from './services/spirit-discovery.js';

const testSpirits = [
  "Hudson Whiskey Bright Lights Big Bourbon",
  "McKenzie Bottled in Bond Bourbon",
  "William Wolf Pecan Bourbon",
  "1792 Kentucky Bourbon Whiskey Small Batch",
  "Balcones Texas Pot Still Bourbon",
  "New Riff Kentucky Straight Bourbon",
  "a butterscotch nose. Aged for 4 year",
  "Award-winning Larceny Wheated Bourbon is a 92 proof",
  "We produce the highest-quality Kentucky bourbon",
  "Robert Parker Tackles Bourbon — K&L Spirits Journal",
];

// Access private method for testing
const service = new (spiritDiscovery as any).constructor();

console.log('Testing brand extraction and spirit validation:\n');

for (const spirit of testSpirits) {
  console.log(`Spirit: "${spirit}"`);
  
  // Test if it's a valid spirit name
  const isValid = service.isValidSpiritName(spirit);
  console.log(`  Valid spirit name: ${isValid ? '✅' : '❌'}`);
  
  if (isValid) {
    // Test brand extraction
    const brand = service.extractBrandFromName(spirit);
    console.log(`  Extracted brand: ${brand || 'None'}`);
  }
  
  console.log('');
}

console.log('\nTesting complete spirit validation:');
const completeTest = [
  "Knob Creek 9 Year Small Batch Bourbon",
  "Buffalo Trace Kentucky Straight Bourbon Whiskey",
  "Four Roses Single Barrel",
];

for (const spirit of completeTest) {
  console.log(`\nSpirit: "${spirit}"`);
  const isComplete = service.isCompleteSpiritName(spirit);
  const isValid = service.isValidSpiritName(spirit);
  const brand = service.extractBrandFromName(spirit);
  
  console.log(`  Complete name: ${isComplete ? '✅' : '❌'}`);
  console.log(`  Valid name: ${isValid ? '✅' : '❌'}`);
  console.log(`  Brand: ${brand || 'None'}`);
}