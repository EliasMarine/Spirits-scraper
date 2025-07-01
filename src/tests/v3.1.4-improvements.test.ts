/**
 * V3.1.4 Improvements Test Suite
 * 
 * Tests for:
 * - Enhanced price extraction with retry logic
 * - Source-specific price extraction patterns
 * - Blog/article rejection patterns
 * - Brand validation improvements
 */

import { describe, test, expect } from '@jest/globals';
import { EnhancedPriceExtractor } from '../services/enhanced-price-extractor.js';
import { smartProductValidator } from '../services/smart-product-validator.js';
import { preStorageValidator } from '../services/pre-storage-validator.js';

describe('V3.1.4 Price Extraction Improvements', () => {
  describe('Enhanced Price Extraction with Retry', () => {
    test('should extract price from Total Wine HTML', () => {
      const html = `<div data-price="89.99">Buffalo Trace</div>`;
      const url = 'https://www.totalwine.com/spirits/bourbon/buffalo-trace';
      const price = EnhancedPriceExtractor.extractPriceWithRetry(html, url);
      expect(price).toBe(89.99);
    });

    test('should extract price from K&L Wines HTML', () => {
      const html = `<span class="price">$124.99</span>`;
      const url = 'https://www.klwines.com/p/i?i=1234567';
      const price = EnhancedPriceExtractor.extractPriceWithRetry(html, url);
      expect(price).toBe(124.99);
    });

    test('should extract and convert price from Whisky Exchange (GBP)', () => {
      const html = `<div class="product-action__price">£75.00</div>`;
      const url = 'https://www.thewhiskyexchange.com/p/12345/lagavulin-16';
      const price = EnhancedPriceExtractor.extractPriceWithRetry(html, url);
      expect(price).toBeCloseTo(95.25, 1); // £75 * 1.27 conversion rate
    });

    test('should extract price from Master of Malt with conversion', () => {
      const html = `<div itemprop="price" content="85.95">£85.95</div>`;
      const url = 'https://www.masterofmalt.com/whiskies/highland-park-12-year-old';
      const price = EnhancedPriceExtractor.extractPriceWithRetry(html, url);
      expect(price).toBeCloseTo(109.16, 1); // £85.95 * 1.27
    });

    test('should extract price from structured data', () => {
      const html = `
        <script type="application/ld+json">
          {"@type":"Product","offers":{"@type":"Offer","price":"59.99"}}
        </script>
      `;
      const price = EnhancedPriceExtractor.extractPriceWithRetry(html);
      expect(price).toBe(59.99);
    });

    test('should extract price near volume indicator', () => {
      const html = `Buffalo Trace Bourbon 750ml - $34.99 Add to Cart`;
      const price = EnhancedPriceExtractor.extractPriceWithRetry(html);
      expect(price).toBe(34.99);
    });

    test('should extract price near buy button', () => {
      const html = `
        <div>Eagle Rare 10 Year</div>
        <button>Add to Cart</button>
        <span>$39.99</span>
      `;
      const price = EnhancedPriceExtractor.extractPriceWithRetry(html);
      expect(price).toBe(39.99);
    });
  });

  describe('Source-specific patterns', () => {
    const testCases = [
      {
        source: 'Total Wine',
        html: `productprice":"89.99"`,
        url: 'https://www.totalwine.com/test',
        expected: 89.99
      },
      {
        source: 'Wine.com',
        html: `"price":{"amount":124.99}`,
        url: 'https://www.wine.com/test',
        expected: 124.99
      },
      {
        source: 'ReserveBar',
        html: `<div data-product-price="299.99">`,
        url: 'https://www.reservebar.com/test',
        expected: 299.99
      }
    ];

    testCases.forEach(({ source, html, url, expected }) => {
      test(`should extract from ${source} specific pattern`, () => {
        const price = EnhancedPriceExtractor.extractPriceWithRetry(html, url);
        expect(price).toBe(expected);
      });
    });
  });
});

describe('V3.1.4 Blog/Article Rejection Patterns', () => {
  const blogPatterns = [
    '8 New Bourbon Releases',
    'Eight New Bourbon Releases',
    'Ten New Whiskeys You\'ll Want To Try',
    'The Best Bourbon Over $50',
    'Best Whiskeys of 2024',
    'Everything You Need To Know About Bourbon',
    'Bourbon We Can\'t Wait To Try',
    '8 New Bourbon Releases You\'ll Want To Try'
  ];

  blogPatterns.forEach(pattern => {
    test(`should reject blog pattern: "${pattern}"`, async () => {
      const result = await smartProductValidator.validateProductName(pattern);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Matches non-product pattern');
    });
  });

  test('should accept valid products with numbers', async () => {
    const validProducts = [
      'Four Roses Limited Edition 2024',
      'Buffalo Trace Antique Collection 2023',
      '1792 Small Batch Bourbon'
    ];

    for (const product of validProducts) {
      const result = await smartProductValidator.validateProductName(product);
      expect(result.isValid).toBe(true);
    }
  });
});

describe('V3.1.4 Brand Validation Improvements', () => {
  describe('Invalid brand rejection', () => {
    const invalidBrands = [
      { brand: '8 New', reason: 'Blog pattern in brand name' },
      { brand: 'Eight New', reason: 'Blog pattern in brand name' },
      { brand: 'A', reason: 'Brand name too short' },
      { brand: 'A.', reason: 'Brand name too short' },
      { brand: 'News', reason: 'Invalid brand name pattern V3.1.3' },
      { brand: 'Review', reason: 'Invalid brand name pattern V3.1.3' },
      { brand: 'Mystery', reason: 'Invalid brand name pattern V3.1.3' },
      { brand: '12 Year Old', reason: 'Age used as brand name' }
    ];

    invalidBrands.forEach(({ brand, reason }) => {
      test(`should reject invalid brand: "${brand}"`, async () => {
        const spiritData = {
          name: 'Test Bourbon',
          brand: brand,
          type: 'bourbon'
        };
        
        const result = await preStorageValidator.validate(spiritData);
        expect(result.isValid).toBe(false);
        expect(result.rejectionReason).toMatch(/brand/);
      });
    });
  });

  describe('Valid brand acceptance', () => {
    const validBrands = [
      'Buffalo Trace',
      'Four Roses',
      'A. Smith Bowman',
      'E.H. Taylor',
      'W.L. Weller',
      'Old Forester',
      'Henry McKenna'
    ];

    validBrands.forEach(brand => {
      test(`should accept valid brand: "${brand}"`, async () => {
        const spiritData = {
          name: `${brand} Bourbon`,
          brand: brand,
          type: 'bourbon',
          price: 49.99
        };
        
        const result = await preStorageValidator.validate(spiritData);
        expect(result.rejectionReason).not.toMatch(/brand/);
      });
    });
  });
});

describe('V3.1.4 Integration Tests', () => {
  test('should reject blog post with price', async () => {
    const blogPost = {
      name: '8 New Bourbon Releases You\'ll Want To Try',
      brand: 'Eight New',
      price: 59.99,
      description: 'Check out these amazing new releases'
    };
    
    // Should be rejected by smart validator
    const smartResult = await smartProductValidator.validateProductName(blogPost.name);
    expect(smartResult.isValid).toBe(false);
    
    // Should be rejected by pre-storage validator
    const preStorageResult = await preStorageValidator.validate(blogPost);
    expect(preStorageResult.isValid).toBe(false);
  });

  test('should accept valid spirit with enhanced price extraction', async () => {
    const validSpirit = {
      name: 'Buffalo Trace Kentucky Straight Bourbon Whiskey',
      brand: 'Buffalo Trace',
      type: 'bourbon',
      price: 34.99,
      abv: 45,
      description: 'A tribute to the mighty buffalo and the rugged wilderness'
    };
    
    // Should pass smart validation
    const smartResult = await smartProductValidator.validateProductName(validSpirit.name);
    expect(smartResult.isValid).toBe(true);
    
    // Should pass pre-storage validation
    const preStorageResult = await preStorageValidator.validate(validSpirit);
    expect(preStorageResult.isValid).toBe(true);
    expect(preStorageResult.qualityScore).toBeGreaterThan(50);
  });

  test('should handle price extraction with source URL', () => {
    const testCases = [
      {
        html: '<div data-price="89.99">Eagle Rare</div>',
        url: 'https://www.totalwine.com/spirits/bourbon/eagle-rare',
        expected: 89.99
      },
      {
        html: '750ml £75.00',
        url: 'https://www.thewhiskyexchange.com/p/12345',
        expected: 95.25 // Converted from GBP
      }
    ];

    testCases.forEach(({ html, url, expected }) => {
      const price = EnhancedPriceExtractor.extractPriceWithRetry(html, url);
      expect(price).toBeCloseTo(expected, 1);
    });
  });
});

describe('V3.1.4 Price Extraction Edge Cases', () => {
  test('should handle multiple price formats', () => {
    const prices = [
      { input: '$1,234.56', expected: 1234.56 },
      { input: 'USD 89.99', expected: 89.99 },
      { input: 'Price: $45', expected: 45 },
      { input: '750ml - $67.99', expected: 67.99 },
      { input: 'MSRP $124.99', expected: 124.99 },
      { input: 'Our Price: $39.95', expected: 39.95 }
    ];

    prices.forEach(({ input, expected }) => {
      const price = EnhancedPriceExtractor.extractPriceFromSnippet(input);
      expect(price).toBe(expected);
    });
  });

  test('should reject unreasonable prices', () => {
    const unreasonablePrices = [
      { input: '$3.99', expected: undefined }, // Too low
      { input: '$15000', expected: undefined }, // Too high
      { input: '$0.00', expected: undefined }, // Zero
      { input: '$-50', expected: undefined } // Negative
    ];

    unreasonablePrices.forEach(({ input, expected }) => {
      const price = EnhancedPriceExtractor.extractPriceFromSnippet(input);
      expect(price).toBe(expected);
    });
  });
});