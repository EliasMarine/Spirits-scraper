/**
 * V3.1.4 Improvements Test
 * 
 * Tests for enhanced price extraction, blog rejection, and brand validation
 */

import { EnhancedPriceExtractor } from '../src/services/enhanced-price-extractor.js';
import { smartProductValidator } from '../src/services/smart-product-validator.js';
import { preStorageValidator } from '../src/services/pre-storage-validator.js';
import { logger } from '../src/utils/logger.js';
import colors from 'colors';

async function testPriceExtraction() {
  console.log(colors.cyan('\n=== Testing V3.1.4 Price Extraction Improvements ===\n'));
  
  const priceTests = [
    {
      name: 'Total Wine pattern',
      html: '<div data-price="89.99">Buffalo Trace</div>',
      url: 'https://www.totalwine.com/spirits/bourbon/buffalo-trace',
      expected: 89.99
    },
    {
      name: 'K&L Wines pattern',
      html: '<span class="price">$124.99</span>',
      url: 'https://www.klwines.com/p/i?i=1234567',
      expected: 124.99
    },
    {
      name: 'Whisky Exchange (GBP)',
      html: '<div class="product-action__price">£75.00</div>',
      url: 'https://www.thewhiskyexchange.com/p/12345/lagavulin-16',
      expected: 95.25 // £75 * 1.27
    },
    {
      name: 'Master of Malt (GBP)',
      html: '<div itemprop="price" content="85.95">£85.95</div>',
      url: 'https://www.masterofmalt.com/whiskies/highland-park-12',
      expected: 109.16 // £85.95 * 1.27
    },
    {
      name: 'JSON-LD structured data',
      html: '<script type="application/ld+json">{"@type":"Product","offers":{"price":"59.99"}}</script>',
      url: '',
      expected: 59.99
    },
    {
      name: 'Price near volume',
      html: 'Buffalo Trace Bourbon 750ml - $34.99 Add to Cart',
      url: '',
      expected: 34.99
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of priceTests) {
    const price = EnhancedPriceExtractor.extractPriceWithRetry(test.html, test.url);
    if (price && Math.abs(price - test.expected) < 0.5) {
      console.log(colors.green(`✓ ${test.name}: $${price}`));
      passed++;
    } else {
      console.log(colors.red(`✗ ${test.name}: Expected $${test.expected}, got ${price ? '$' + price : 'undefined'}`));
      failed++;
    }
  }
  
  console.log(colors.cyan(`\nPrice extraction: ${passed} passed, ${failed} failed`));
  return failed === 0;
}

async function testBlogRejection() {
  console.log(colors.cyan('\n=== Testing V3.1.4 Blog/Article Rejection ===\n'));
  
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
  
  const validProducts = [
    'Four Roses Limited Edition 2024',
    'Buffalo Trace Antique Collection 2023',
    '1792 Small Batch Bourbon'
  ];
  
  let passed = 0;
  let failed = 0;
  
  // Test blog pattern rejection
  for (const pattern of blogPatterns) {
    const result = await smartProductValidator.validateProductName(pattern);
    if (!result.isValid) {
      console.log(colors.green(`✓ Rejected blog pattern: "${pattern}"`));
      passed++;
    } else {
      console.log(colors.red(`✗ Failed to reject: "${pattern}"`));
      failed++;
    }
  }
  
  // Test valid product acceptance
  for (const product of validProducts) {
    const result = await smartProductValidator.validateProductName(product);
    if (result.isValid) {
      console.log(colors.green(`✓ Accepted valid product: "${product}"`));
      passed++;
    } else {
      console.log(colors.red(`✗ Wrongly rejected: "${product}"`));
      failed++;
    }
  }
  
  console.log(colors.cyan(`\nBlog rejection: ${passed} passed, ${failed} failed`));
  return failed === 0;
}

async function testBrandValidation() {
  console.log(colors.cyan('\n=== Testing V3.1.4 Brand Validation ===\n'));
  
  const invalidBrands = [
    { brand: '8 New', name: 'Blog pattern' },
    { brand: 'Eight New', name: 'Blog pattern' },
    { brand: 'A', name: 'Single letter' },
    { brand: 'A.', name: 'Single letter with period' },
    { brand: 'News', name: 'Invalid word' },
    { brand: 'Review', name: 'Invalid word' },
    { brand: 'Mystery', name: 'Invalid word' },
    { brand: '12 Year Old', name: 'Age as brand' }
  ];
  
  const validBrands = [
    'Buffalo Trace',
    'Four Roses',
    'A. Smith Bowman',
    'E.H. Taylor',
    'W.L. Weller',
    'Old Forester'
  ];
  
  let passed = 0;
  let failed = 0;
  
  // Test invalid brand rejection
  for (const { brand, name } of invalidBrands) {
    const spiritData = {
      name: 'Test Bourbon',
      brand: brand,
      type: 'bourbon'
    };
    
    const result = await preStorageValidator.validate(spiritData);
    if (!result.isValid && result.rejectionReason?.includes('brand')) {
      console.log(colors.green(`✓ Rejected invalid brand (${name}): "${brand}"`));
      passed++;
    } else {
      console.log(colors.red(`✗ Failed to reject invalid brand: "${brand}"`));
      failed++;
    }
  }
  
  // Test valid brand acceptance
  for (const brand of validBrands) {
    const spiritData = {
      name: `${brand} Bourbon`,
      brand: brand,
      type: 'bourbon',
      price: 49.99
    };
    
    const result = await preStorageValidator.validate(spiritData);
    if (!result.rejectionReason?.includes('brand')) {
      console.log(colors.green(`✓ Accepted valid brand: "${brand}"`));
      passed++;
    } else {
      console.log(colors.red(`✗ Wrongly rejected brand: "${brand}" (${result.rejectionReason})`));
      failed++;
    }
  }
  
  console.log(colors.cyan(`\nBrand validation: ${passed} passed, ${failed} failed`));
  return failed === 0;
}

async function testIntegration() {
  console.log(colors.cyan('\n=== Testing V3.1.4 Integration ===\n'));
  
  // Test blog post with price should still be rejected
  const blogPost = {
    name: '8 New Bourbon Releases You\'ll Want To Try',
    brand: 'Eight New',
    price: 59.99,
    description: 'Check out these amazing new releases'
  };
  
  const smartResult = await smartProductValidator.validateProductName(blogPost.name);
  const preStorageResult = await preStorageValidator.validate(blogPost);
  
  if (!smartResult.isValid && !preStorageResult.isValid) {
    console.log(colors.green('✓ Blog post correctly rejected despite having price'));
  } else {
    console.log(colors.red('✗ Blog post should have been rejected'));
  }
  
  // Test valid spirit with price
  const validSpirit = {
    name: 'Buffalo Trace Kentucky Straight Bourbon Whiskey',
    brand: 'Buffalo Trace',
    type: 'bourbon',
    price: 34.99,
    abv: 45,
    description: 'A tribute to the mighty buffalo'
  };
  
  const smartResult2 = await smartProductValidator.validateProductName(validSpirit.name);
  const preStorageResult2 = await preStorageValidator.validate(validSpirit);
  
  if (smartResult2.isValid && preStorageResult2.isValid) {
    console.log(colors.green('✓ Valid spirit correctly accepted with high quality score'));
    console.log(colors.gray(`  Quality score: ${preStorageResult2.qualityScore}`));
  } else {
    console.log(colors.red('✗ Valid spirit should have been accepted'));
  }
  
  return !smartResult.isValid && !preStorageResult.isValid && 
         smartResult2.isValid && preStorageResult2.isValid;
}

async function runTests() {
  console.log(colors.yellow('\n🧪 V3.1.4 Improvements Test Suite\n'));
  
  const results = await Promise.all([
    testPriceExtraction(),
    testBlogRejection(),
    testBrandValidation(),
    testIntegration()
  ]);
  
  const allPassed = results.every(r => r);
  
  if (allPassed) {
    console.log(colors.green('\n✅ All V3.1.4 improvements tests passed!\n'));
  } else {
    console.log(colors.red('\n❌ Some tests failed. Check the output above.\n'));
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(colors.red('Test error:'), error);
  process.exit(1);
});