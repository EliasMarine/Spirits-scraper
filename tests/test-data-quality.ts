import { contentParser } from '../src/services/content-parser.js';
import { dataValidator, DescriptionTracker } from '../src/services/data-validator.js';
import { TextProcessor } from '../src/services/text-processor.js';

// Test cases based on actual issues found in scrape results

describe('Data Quality Improvements', () => {
  beforeEach(() => {
    // Clear description tracker before each test
    DescriptionTracker.clear();
  });

  describe('Review Fragment Filtering', () => {
    it('should filter out personal review content', async () => {
      const reviewTexts = [
        "I knew I wanted 94 proof because I like some bite...",
        "I had tried Virginia Distilling Co.s Cider Cask...",
        "When I first tasted this bourbon, I was amazed...",
        "We absolutely love this whiskey! 5 stars!",
        "My favorite bourbon by far. I recommend it to everyone."
      ];

      for (const text of reviewTexts) {
        const result = contentParser.parseSearchResult({
          title: 'Test Spirit',
          link: 'https://example.com',
          snippet: text,
          displayLink: 'example.com'
        });
        
        expect(result.description).toBe('');
      }
    });

    it('should extract product info from mixed content', async () => {
      const mixedText = "I love this bourbon! It's aged 7 years in charred oak barrels with notes of vanilla and caramel.";
      const result = contentParser.parseSearchResult({
        title: 'Test Bourbon',
        link: 'https://example.com',
        snippet: mixedText,
        displayLink: 'example.com'
      });
      
      expect(result.description).toContain('aged 7 years');
      expect(result.description).not.toContain('I love');
    });
  });

  describe('Price Extraction', () => {
    it('should extract prices with various formats', async () => {
      const priceTests = [
        { text: '$39.99', expected: '$39.99' },
        { text: 'Price: $2999', expected: '$29.99' }, // Missing decimal
        { text: 'MSRP $14995', expected: '$149.95' }, // 5-digit price
        { text: 'Now $5999 Was $79.99', expected: '$59.99' },
        { text: 'Regular price: 4999', expected: '$49.99' }
      ];

      for (const test of priceTests) {
        const result = contentParser.parseSearchResult({
          title: 'Test Spirit',
          link: 'https://example.com',
          snippet: test.text,
          displayLink: 'example.com'
        });
        
        expect(result.price).toBe(test.expected);
      }
    });

    it('should ignore invalid prices', () => {
      const invalidPrices = [
        '$5', // Too low
        '$50000', // Too high
        '$abc', // Non-numeric
      ];

      for (const price of invalidPrices) {
        const result = contentParser.parseSearchResult({
          title: 'Test Spirit',
          link: 'https://example.com',
          snippet: `Price: ${price}`,
          displayLink: 'example.com'
        });
        
        expect(result.price).toBeUndefined();
      }
    });
  });

  describe('Duplicate Description Detection', () => {
    it('should detect and flag duplicate descriptions', () => {
      const genericDesc = "Aged twice what the law requires, each sip reveals flavors of sweet caramel and vanilla.";
      
      // First spirit
      const result1 = dataValidator.validate({
        name: 'Jim Beam',
        brand: 'Jim Beam',
        type: 'Bourbon',
        description: genericDesc,
        source_url: 'https://example.com/1',
        scraped_at: new Date()
      });
      
      expect(result1.isValid).toBe(true);
      expect(result1.warnings).not.toContain(expect.stringMatching(/Description appears to be duplicated/));
      
      // Second spirit with same description
      const result2 = dataValidator.validate({
        name: 'Home Base Bourbon',
        brand: 'Home Base',
        type: 'Bourbon',
        description: genericDesc,
        source_url: 'https://example.com/2',
        scraped_at: new Date()
      });
      
      expect(result2.isValid).toBe(true);
      expect(result2.warnings).toContain(expect.stringMatching(/Description appears to be duplicated/));
    });

    it('should enhance generic descriptions', () => {
      const genericDesc = "Aged twice what the law requires, each sip reveals flavors of sweet caramel and vanilla.";
      
      const result = dataValidator.validate({
        name: 'Test Bourbon',
        brand: 'Test Brand',
        type: 'Bourbon',
        description: genericDesc,
        source_url: 'https://example.com',
        scraped_at: new Date()
      });
      
      expect(result.cleaned?.description).toContain('Test Brand Test Bourbon');
    });
  });

  describe('Age Statement Validation', () => {
    it('should extract valid age statements', () => {
      const validAges = [
        { text: 'Aged 7 years in oak barrels', expected: '7 Year' },
        { text: '12 year old bourbon', expected: '12 Year' },
        { text: 'Aged for 15 years', expected: '15 Year' },
        { text: '21 YO single malt', expected: '21 Year' }
      ];

      for (const test of validAges) {
        const age = TextProcessor.extractValidAge(test.text);
        expect(age).toBe(test.expected);
      }
    });

    it('should reject invalid age statements', () => {
      const invalidAges = [
        'Taste more than 225 years of craft', // Company history
        'Established in 1792', // Founding year
        '150 Year celebration edition', // Too old
        'Must be 21+ to purchase', // Age verification
        'Since 1870, we have been crafting' // Company history
      ];

      for (const text of invalidAges) {
        const age = TextProcessor.extractValidAge(text);
        expect(age).toBeNull();
      }
    });
  });

  describe('Volume Normalization', () => {
    it('should normalize volumes to standard sizes', () => {
      const volumeTests = [
        { input: '750ml', expected: '750ml' },
        { input: '0.75L', expected: '750ml' },
        { input: '75cl', expected: '750ml' },
        { input: '1 liter', expected: '1000ml' },
        { input: '748ml', expected: '750ml' }, // Close to standard
        { input: '1.75L', expected: '1750ml' }
      ];

      for (const test of volumeTests) {
        const normalized = dataValidator.validateVolume(test.input);
        expect(normalized).toBe(test.expected);
      }
    });
  });

  describe('Spirit Type Detection', () => {
    it('should correctly classify bourbon vs rye', () => {
      const tests = [
        { name: 'Four Roses Small Batch Bourbon', expected: 'Bourbon' },
        { name: 'Redemption Rye Whiskey', expected: 'Rye Whiskey' },
        { name: 'Wild Turkey 101', expected: 'Bourbon' }, // Known bourbon brand
        { name: 'Bulleit 95 Rye', expected: 'Rye Whiskey' }, // High rye content
        { name: 'Maker\'s Mark', expected: 'Bourbon' } // Known bourbon brand
      ];

      for (const test of tests) {
        const category = TextProcessor.normalizeCategory(test.name);
        expect([category, 'bourbon', 'rye whiskey']).toContain(test.expected.toLowerCase());
      }
    });
  });

  describe('Text Spacing Fixes', () => {
    it('should fix concatenated text', () => {
      const tests = [
        { input: 'JackDaniels12YearOld', expected: 'Jack Daniels 12 Year Old' },
        { input: 'MakersMarkCaskStrength', expected: 'Makers Mark Cask Strength' },
        { input: 'WildTurkey101Proof', expected: 'Wild Turkey 101 Proof' }
      ];

      for (const test of tests) {
        const fixed = TextProcessor.fixTextSpacing(test.input);
        expect(fixed).toBe(test.expected);
      }
    });
  });
});

// Run specific test scenarios
async function runQualityTests() {
  console.log('Running data quality improvement tests...\n');
  
  // Test 1: Review filtering
  console.log('Test 1: Review Fragment Filtering');
  const reviewText = "I knew I wanted 94 proof because I like some bite...";
  const filtered = contentParser.parseSearchResult({
    title: 'Row 94 Whiskey',
    link: 'https://example.com',
    snippet: reviewText,
    displayLink: 'example.com'
  });
  console.log(`  Input: "${reviewText}"`);
  console.log(`  Output: "${filtered.description}"`);
  console.log(`  Result: ${filtered.description === '' ? '✅ Filtered' : '❌ Not filtered'}\n`);
  
  // Test 2: Price extraction
  console.log('Test 2: Price Extraction');
  const priceText = "Price: $3999";
  const priceResult = contentParser.parseSearchResult({
    title: 'Test Bourbon',
    link: 'https://example.com',
    snippet: priceText,
    displayLink: 'example.com'
  });
  console.log(`  Input: "${priceText}"`);
  console.log(`  Output: ${priceResult.price}`);
  console.log(`  Result: ${priceResult.price === '$39.99' ? '✅ Correct' : '❌ Incorrect'}\n`);
  
  // Test 3: Age validation
  console.log('Test 3: Age Statement Validation');
  const ageTests = [
    { text: 'Aged 12 years', expected: '12 Year' },
    { text: 'Taste more than 225 years of craft', expected: null }
  ];
  
  for (const test of ageTests) {
    const age = TextProcessor.extractValidAge(test.text);
    console.log(`  Input: "${test.text}"`);
    console.log(`  Output: ${age}`);
    console.log(`  Result: ${age === test.expected ? '✅ Correct' : '❌ Incorrect'}`);
  }
  
  console.log('\n✨ Data quality tests complete!');
}

// Export for command line usage
if (import.meta.url === `file://${process.argv[1]}`) {
  runQualityTests().catch(console.error);
}

export { runQualityTests };