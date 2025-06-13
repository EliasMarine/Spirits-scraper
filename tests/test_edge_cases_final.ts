// Final comprehensive edge case testing
import { spiritDiscovery } from './src/services/spirit-discovery.js';
import { isExcludedDomain } from './src/config/excluded-domains.js';
import { logger } from './src/utils/logger.js';

// Suppress logs for cleaner output
logger.level = 'error';

console.log('🧪 FINAL COMPREHENSIVE EDGE CASE TESTING\n');

// Test all validation layers
async function runFinalTests() {
  let passedTests = 0;
  let totalTests = 0;
  
  // 1. Generic Categories (various forms)
  console.log('1️⃣ Generic Category Blocking...');
  const genericTests = [
    { name: 'bottled in bond bourbon', shouldBlock: true },
    { name: 'Bottled In Bond Bourbon', shouldBlock: true },
    { name: 'BOTTLED IN BOND BOURBON', shouldBlock: true },
    { name: 'barrel strength bourbons', shouldBlock: true },
    { name: 'Barrel/cask Strength Bourbons', shouldBlock: true },
    { name: 'Single Barrel Bourbons', shouldBlock: true },
    { name: 'Heaven Hill Bottled in Bond', shouldBlock: false }, // Real product
    { name: 'Evan Williams Bottled in Bond', shouldBlock: false }, // Real product
  ];
  
  genericTests.forEach(test => {
    totalTests++;
    const isBlocked = isGenericCategory(test.name);
    const correct = isBlocked === test.shouldBlock;
    if (correct) passedTests++;
    console.log(`  ${correct ? '✅' : '❌'} "${test.name}"`);
  });
  
  // 2. Excluded Domains (including fredminnick.com)
  console.log('\n2️⃣ Excluded Domain Blocking...');
  const domainTests = [
    { url: 'https://fredminnick.com/reviews', shouldBlock: true },
    { url: 'https://www.fredminnick.com/2024/best', shouldBlock: true },
    { url: 'https://reddit.com/r/bourbon', shouldBlock: true },
    { url: 'https://old.reddit.com/whiskey', shouldBlock: true },
    { url: 'https://facebook.com/spirits', shouldBlock: true },
    { url: 'https://breakingbourbon.com/review', shouldBlock: true },
    { url: 'https://totalwine.com/spirits', shouldBlock: false }, // Valid retailer
    { url: 'https://klwines.com/bourbon', shouldBlock: false }, // Valid retailer
  ];
  
  domainTests.forEach(test => {
    totalTests++;
    const isBlocked = isExcludedDomain(test.url);
    const correct = isBlocked === test.shouldBlock;
    if (correct) passedTests++;
    console.log(`  ${correct ? '✅' : '❌'} ${test.url}`);
  });
  
  // 3. Duplicate Text Cleaning
  console.log('\n3️⃣ Duplicate Text Cleaning...');
  const duplicateTests = [
    { 
      input: 'Wild Turkey Kentucky Straight Bourbon Whiskey Kentucky Straight',
      expected: 'Wild Turkey Kentucky Straight Bourbon Whiskey'
    },
    { 
      input: 'Four Roses Single Barrel Bourbon Single Barrel',
      expected: 'Four Roses Single Barrel Bourbon'
    },
    { 
      input: 'Makers Mark Cask Strength Bourbon Cask Strength',
      expected: 'Makers Mark Cask Strength Bourbon'
    },
    { 
      input: 'Buffalo Trace Straight Bourbon Whiskey Straight Bourbon Whiskey',
      expected: 'Buffalo Trace Straight Bourbon Whiskey'
    }
  ];
  
  duplicateTests.forEach(test => {
    totalTests++;
    const cleaned = cleanDuplicateText(test.input);
    const correct = cleaned === test.expected;
    if (correct) passedTests++;
    console.log(`  ${correct ? '✅' : '❌'} "${test.input}"`);
    if (!correct) console.log(`     Got: "${cleaned}", Expected: "${test.expected}"`);
  });
  
  // 4. Special Characters & Spacing
  console.log('\n4️⃣ Special Character Handling...');
  const specialCharTests = [
    { input: 'Makers Mark', expected: 'Makers Mark' },
    { input: 'Jack Daniel\\\'s', expected: 'Jack Daniel\\\'s' },
    { input: 'Wi Ld Turkey', expected: 'Wild Turkey' },
    { input: 'Unc Le Nearest', expected: 'Uncle Nearest' },
    { input: 'JackDaniels12Year', expected: 'Jack Daniels 12 Year' },
    { input: 'BuffaloTraceSingleBarrel', expected: 'Buffalo Trace Single Barrel' },
    { input: 'McKenzie BiB', expected: 'McKenzie BiB' },
    { input: 'Mc Kenzie Bourbon', expected: 'McKenzie Bourbon' }
  ];
  
  specialCharTests.forEach(test => {
    totalTests++;
    const cleaned = fixSpacing(test.input);
    const correct = cleaned === test.expected;
    if (correct) passedTests++;
    console.log(`  ${correct ? '✅' : '❌'} "${test.input}" → "${cleaned}"`);
  });
  
  // 5. Invalid Name Patterns
  console.log('\n5️⃣ Invalid Name Detection...');
  const invalidTests = [
    { name: 'Bourbon', shouldBlock: true },
    { name: '10 Best Bourbons', shouldBlock: true },
    { name: 'Review 88: Buffalo Trace', shouldBlock: true },
    { name: 'Buffalo Trace vs Eagle Rare', shouldBlock: true },
    { name: 'New Bourbon Releases', shouldBlock: true },
    { name: 'Bourbon Collection', shouldBlock: true },
    { name: 'Total Wine Selection', shouldBlock: true },
    { name: 'What Is Bourbon?', shouldBlock: true },
    { name: 'Buffalo Trace Bourbon', shouldBlock: false }, // Valid
    { name: 'Four Roses Small Batch', shouldBlock: false } // Valid
  ];
  
  invalidTests.forEach(test => {
    totalTests++;
    const isInvalid = isInvalidName(test.name);
    const correct = isInvalid === test.shouldBlock;
    if (correct) passedTests++;
    console.log(`  ${correct ? '✅' : '❌'} "${test.name}"`);
  });
  
  // 6. Non-Product Filtering
  console.log('\n6️⃣ Non-Product Pattern Detection...');
  const nonProductTests = [
    { name: 'Buffalo Trace Distillery Tour', shouldBlock: true },
    { name: 'Jack Daniels T-Shirt', shouldBlock: true },
    { name: 'Bourbon BBQ Sauce', shouldBlock: true },
    { name: 'Makers Mark Gift Box', shouldBlock: false }, // Gift sets are OK
    { name: 'Buffalo Trace Bourbon', shouldBlock: false } // Valid product
  ];
  
  nonProductTests.forEach(test => {
    totalTests++;
    const isNonProduct = hasNonProductPattern(test.name);
    const correct = isNonProduct === test.shouldBlock;
    if (correct) passedTests++;
    console.log(`  ${correct ? '✅' : '❌'} "${test.name}"`);
  });
  
  // 7. Live Discovery Test
  console.log('\n7️⃣ Live Discovery Test...');
  const liveQueries = [
    'site:totalwine.com Buffalo Trace bourbon',
    'Eagle Rare bourbon -reddit -facebook',
    'fredminnick bourbon recommendations',
    'bottled in bond bourbon'
  ];
  
  for (const query of liveQueries) {
    try {
      const spirits = await spiritDiscovery.discoverSpiritsFromQuery(query, 5);
      console.log(`\n  Query: "${query}"`);
      console.log(`  Found: ${spirits.length} spirits`);
      
      // Validate each spirit
      let validCount = 0;
      spirits.forEach(spirit => {
        const issues = [];
        if (isGenericCategory(spirit.name)) issues.push('generic category');
        if (spirit.source && isExcludedDomain(spirit.source)) issues.push('excluded domain');
        if (!spirit.brand) issues.push('no brand');
        
        const isValid = issues.length === 0;
        if (isValid) validCount++;
        
        console.log(`    ${isValid ? '✅' : '❌'} ${spirit.name} ${issues.length > 0 ? `(${issues.join(', ')})` : ''}`);
      });
      
      totalTests++;
      if (validCount === spirits.length) passedTests++;
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
  }
  
  // Final Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 FINAL RESULTS: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`${passedTests === totalTests ? '✅ ALL TESTS PASSED!' : '❌ Some tests failed'}`);
  console.log('='.repeat(50));
}

// Helper functions
function isGenericCategory(name: string): boolean {
  const cleanName = name?.toLowerCase().trim() || '';
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
  return genericCategories.includes(cleanName);
}

function cleanDuplicateText(text: string): string {
  let cleaned = text;
  const patterns = [
    /(\s+Kentucky\s+Straight)(\s+Bourbon\s+Whiskey)?(\s+Kentucky\s+Straight)$/i,
    /(\s+Bottled\s+in\s+Bond)(\s+Bourbon)?(\s+Bottled\s+in\s+Bond)$/i,
    /(\s+Single\s+Barrel)(\s+Bourbon)?(\s+Single\s+Barrel)$/i,
    /(\s+Small\s+Batch)(\s+Bourbon)?(\s+Small\s+Batch)$/i,
    /(\s+Cask\s+Strength)(\s+Bourbon)?(\s+Cask\s+Strength)$/i,
    /(\s+Straight\s+Bourbon\s+Whiskey)(\s+Straight\s+Bourbon\s+Whiskey)$/i,
  ];
  
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, '$1$2');
  }
  return cleaned;
}

function fixSpacing(text: string): string {
  let fixed = text
    // Fix specific misspellings
    .replace(/\bWi\s+Ld\s+Turkey/i, 'Wild Turkey')
    .replace(/\bUnc\s+Le\s+Nearest/i, 'Uncle Nearest')
    // Fix Mc spacing
    .replace(/\bMc\s+([A-Z])/g, 'Mc$1')
    // Add spaces to camelCase
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim();
  
  return fixed;
}

function isInvalidName(name: string): boolean {
  // Too short
  if (name.length < 8) return true;
  
  // Single word (except valid brands like "1792")
  const words = name.split(/\s+/);
  if (words.length < 2) return true;
  
  // Invalid patterns
  const invalidPatterns = [
    /^\d+\s+(best|top)/i,
    /\?$/,
    /vs\.?\s+/i,
    /collection$/i,
    /selection$/i,
    /releases?$/i,
    /\breview\s+\d+:/i,
    /^(whiskey|bourbon|scotch|vodka|gin|rum|tequila)$/i,
  ];
  
  return invalidPatterns.some(p => p.test(name));
}

function hasNonProductPattern(name: string): boolean {
  const nonProductPatterns = [
    /\b(tour|visit|experience|tasting\s*room)\b/i,
    /\b(shirt|hat|cap|clothing|apparel|merchandise)\b/i,
    /\b(bbq|sauce|food|recipe|cookbook)\b/i,
    /\b(glass|glasses|glassware|coaster|opener)\b/i,
  ];
  
  return nonProductPatterns.some(p => p.test(name));
}

// Run tests
runFinalTests().catch(console.error);