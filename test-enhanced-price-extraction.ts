import { EnhancedPriceExtractor } from './src/services/enhanced-price-extractor';

// Test cases
const testCases = [
  {
    name: 'Price in snippet after volume',
    snippet: '750ml. 4.5 out of 5 stars. (8). $10.99. Mix 6 for $9.89 each.',
    expected: 10.99
  },
  {
    name: 'Multiple prices',
    snippet: 'Buffalo Trace Bourbon 750ml - $29.99, 1.75L - $54.99',
    volumeHint: '750ml',
    expected: 29.99
  },
  {
    name: 'Price with MSRP',
    snippet: 'MSRP: $49.99 Our Price: $39.99 You Save: $10.00',
    expected: 49.99
  },
  {
    name: 'Just volume (should not extract)',
    snippet: '750ml bottle of premium bourbon',
    expected: undefined
  },
  {
    name: 'Year (should not extract)',
    snippet: '2021 Limited Edition',
    expected: undefined
  },
  {
    name: 'Price with currency',
    snippet: 'Price: USD 75.00',
    expected: 75.00
  },
  {
    name: 'Common price format',
    snippet: 'Eagle Rare Bourbon $34.99',
    expected: 34.99
  },
  {
    name: 'Price in parentheses',
    snippet: 'Blanton\'s Single Barrel ($89.99)',
    expected: 89.99
  },
  {
    name: 'Sale price',
    snippet: 'Regular: $45.99 Sale: $37.99',
    expected: 45.99
  },
  {
    name: 'Price range',
    snippet: 'Starting at $19.99',
    expected: 19.99
  }
];

// Test structured data cases
const structuredDataCases = [
  {
    name: 'Product offers price',
    data: {
      product: [{
        name: 'Buffalo Trace',
        offers: {
          price: '29.99',
          priceCurrency: 'USD'
        }
      }]
    },
    expected: 29.99
  },
  {
    name: 'Metatag price',
    data: {
      metatags: [{
        'product:price:amount': '45.00',
        'product:price:currency': 'USD'
      }]
    },
    expected: 45.00
  },
  {
    name: 'Offer array',
    data: {
      offer: [{
        price: '32.99'
      }]
    },
    expected: 32.99
  }
];

console.log('🧪 TESTING ENHANCED PRICE EXTRACTION\n');
console.log('='.repeat(60));

// Test snippet extraction
console.log('\n📝 SNIPPET EXTRACTION TESTS:\n');

for (const testCase of testCases) {
  const result = EnhancedPriceExtractor.extractPriceFromSnippet(
    testCase.snippet,
    testCase.volumeHint
  );
  
  const passed = result === testCase.expected;
  const icon = passed ? '✅' : '❌';
  
  console.log(`${icon} ${testCase.name}`);
  console.log(`   Input: "${testCase.snippet}"`);
  console.log(`   Expected: ${testCase.expected}`);
  console.log(`   Got: ${result}`);
  console.log('');
}

// Test structured data extraction
console.log('\n📊 STRUCTURED DATA TESTS:\n');

for (const testCase of structuredDataCases) {
  const result = EnhancedPriceExtractor.extractFromStructuredData(testCase.data);
  
  const passed = result === testCase.expected;
  const icon = passed ? '✅' : '❌';
  
  console.log(`${icon} ${testCase.name}`);
  console.log(`   Expected: ${testCase.expected}`);
  console.log(`   Got: ${result}`);
  console.log('');
}

// Test edge cases
console.log('\n🔍 EDGE CASES:\n');

const edgeCases = [
  { input: '750', context: '750ml bottle', expected: undefined },
  { input: 2021, context: '2021 vintage', expected: undefined },
  { input: 29.99, context: 'price', expected: 29.99 },
  { input: 5000, context: 'rare whiskey', expected: 5000 },
  { input: 50000, context: 'price', expected: undefined }, // Too high
  { input: 3, context: 'price', expected: undefined } // Too low
];

for (const testCase of edgeCases) {
  const result = EnhancedPriceExtractor.extractPrice(testCase.input, testCase.context);
  
  const passed = result === testCase.expected;
  const icon = passed ? '✅' : '❌';
  
  console.log(`${icon} Input: ${testCase.input}, Context: "${testCase.context}"`);
  console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
  console.log('');
}

// Test real-world examples
console.log('\n🌍 REAL-WORLD EXAMPLES:\n');

const realExamples = [
  {
    name: 'Total Wine snippet',
    snippet: 'Buffalo Trace Bourbon. 750ml. 4.9 out of 5 stars. (2384). $29.99. Add to Cart',
    expected: 29.99
  },
  {
    name: 'K&L Wines snippet',
    snippet: 'Eagle Rare 10 Year Kentucky Straight Bourbon Whiskey (750ml) $34.99',
    expected: 34.99
  },
  {
    name: 'Wine.com format',
    snippet: 'Woodford Reserve Double Oaked Straight Bourbon Whiskey 750 ml $54.99 $49.49',
    expected: 54.99
  },
  {
    name: 'Complex multi-price',
    snippet: '750ml bottle $45.99 (Save $5.00) Was $50.99',
    expected: 45.99
  }
];

for (const example of realExamples) {
  const result = EnhancedPriceExtractor.extractPriceFromSnippet(example.snippet);
  const allPrices = EnhancedPriceExtractor.extractAllPrices(example.snippet);
  
  const passed = result === example.expected;
  const icon = passed ? '✅' : '❌';
  
  console.log(`${icon} ${example.name}`);
  console.log(`   Snippet: "${example.snippet}"`);
  console.log(`   Expected: ${example.expected}`);
  console.log(`   Got: ${result}`);
  console.log(`   All prices found: ${allPrices.map(p => p.price).join(', ')}`);
  console.log('');
}

// Summary
const snippetTests = testCases.filter(t => 
  EnhancedPriceExtractor.extractPriceFromSnippet(t.snippet, t.volumeHint) === t.expected
).length;

const structuredTests = structuredDataCases.filter(t =>
  EnhancedPriceExtractor.extractFromStructuredData(t.data) === t.expected
).length;

console.log('\n📊 TEST SUMMARY:');
console.log('='.repeat(60));
console.log(`Snippet extraction: ${snippetTests}/${testCases.length} passed`);
console.log(`Structured data: ${structuredTests}/${structuredDataCases.length} passed`);
console.log(`\nOverall success rate: ${((snippetTests + structuredTests) / (testCases.length + structuredDataCases.length) * 100).toFixed(1)}%`);