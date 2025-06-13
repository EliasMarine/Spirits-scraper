import { spiritExtractor } from './services/spirit-extractor.js';
import { TextProcessor } from './services/text-processor.js';
import { logger } from './utils/logger.js';

/**
 * Test suite for improved category detection and data quality
 */

interface TestCase {
  name: string;
  brand?: string;
  expectedType: string;
  expectedCategory: string;
  description?: string;
}

const testCases: TestCase[] = [
  // Tequila tests (should not be confused with bourbon)
  {
    name: 'Rainbow Anejo Gran Reserva',
    brand: 'Rainbow',
    expectedType: 'Tequila',
    expectedCategory: 'Tequila',
    description: 'Anejo Gran Reserva Rainbow Ceramic Tequila bottled in limited edition bottles'
  },
  {
    name: 'Don Julio 1942',
    brand: 'Don Julio',
    expectedType: 'Tequila',
    expectedCategory: 'Tequila'
  },
  {
    name: 'Patron Silver',
    brand: 'Patron',
    expectedType: 'Tequila',
    expectedCategory: 'Tequila'
  },
  
  // Bourbon tests
  {
    name: 'Makers Mark 101 Kentucky Straight',
    brand: 'Makers Mark',
    expectedType: 'Bourbon',
    expectedCategory: 'Bourbon'
  },
  {
    name: 'Wild Turkey 81 Proof Whiskey',
    brand: 'Wild Turkey',
    expectedType: 'Bourbon',
    expectedCategory: 'Bourbon'
  },
  {
    name: 'Calumet Farm Kentucky',
    brand: 'Calumet Farm',
    expectedType: 'Bourbon',
    expectedCategory: 'Bourbon'
  },
  {
    name: 'Uncle Nearest Single Barrel',
    brand: 'Uncle Nearest',
    expectedType: 'Bourbon',
    expectedCategory: 'Bourbon'
  },
  
  // Rye whiskey tests
  {
    name: 'Sagamore Spirit Cask Strength Rye',
    brand: 'Sagamore Spirit',
    expectedType: 'Rye Whiskey',
    expectedCategory: 'Rye Whiskey'
  },
  {
    name: 'WhistlePig 10 Year Rye',
    brand: 'WhistlePig',
    expectedType: 'Rye Whiskey',
    expectedCategory: 'Rye Whiskey'
  },
  
  // Single Malt tests
  {
    name: 'Blue Spot 7 Year Old Whiskey',
    brand: 'Blue Spot',
    expectedType: 'Irish Whiskey',
    expectedCategory: 'Irish Whiskey'
  },
  
  // Text spacing tests
  {
    name: 'BsbBrownSugarBourbon103',
    brand: 'BSB',
    expectedType: 'Bourbon',
    expectedCategory: 'Bourbon'
  },
  {
    name: 'JackDanielsOldNo7',
    brand: 'Jack Daniels',
    expectedType: 'Whiskey',
    expectedCategory: 'Whiskey'
  }
];

async function runTests() {
  console.log('🧪 Testing Category Detection and Data Quality Improvements\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      // Test text spacing
      const fixedName = TextProcessor.fixTextSpacing(testCase.name);
      console.log(`\n📝 Testing: ${testCase.name}`);
      console.log(`   Fixed name: ${fixedName}`);
      
      // Test brand normalization
      if (testCase.brand) {
        const normalizedBrand = TextProcessor.normalizeBrandName(testCase.brand);
        console.log(`   Normalized brand: ${normalizedBrand}`);
      }
      
      // Create mock search results for type detection
      const mockResults = [{
        title: testCase.name,
        description: testCase.description || `${testCase.name} is a premium ${testCase.expectedType.toLowerCase()}`
      }];
      
      // Test type detection directly
      const detectedType = (spiritExtractor as any).detectSpiritType(
        fixedName, 
        testCase.brand, 
        mockResults
      );
      
      const detectedCategory = (spiritExtractor as any).detectCategory(
        fixedName,
        detectedType
      );
      
      // Check results
      const typeMatch = detectedType === testCase.expectedType;
      const categoryMatch = detectedCategory === testCase.expectedCategory;
      
      if (typeMatch && categoryMatch) {
        console.log(`   ✅ Type: ${detectedType} (correct)`);
        console.log(`   ✅ Category: ${detectedCategory} (correct)`);
        passed++;
      } else {
        console.log(`   ❌ Type: ${detectedType} (expected: ${testCase.expectedType})`);
        console.log(`   ❌ Category: ${detectedCategory} (expected: ${testCase.expectedCategory})`);
        failed++;
      }
      
    } catch (error) {
      console.error(`   ❌ Error testing ${testCase.name}:`, error);
      failed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  // Additional validation tests
  console.log('\n🔍 Testing Description Validation:');
  
  const descriptionTests = [
    {
      name: 'Wild Turkey 81 Proof',
      description: 'Discover Wild Turkey 101 American Whiskey',
      shouldBeValid: false,
      reason: 'Description mentions different proof'
    },
    {
      name: 'Makers Mark Bourbon',
      description: 'Patron Silver Tequila is smooth',
      shouldBeValid: false,
      reason: 'Description is for different product'
    },
    {
      name: 'Buffalo Trace Bourbon',
      description: 'Buffalo Trace Kentucky Straight Bourbon Whiskey',
      shouldBeValid: true,
      reason: 'Description matches product'
    }
  ];
  
  for (const test of descriptionTests) {
    const isValid = (spiritExtractor as any).validateDescription(
      test.description,
      test.name,
      'Bourbon'
    ) !== undefined;
    
    console.log(`\n   Testing: "${test.name}"`);
    console.log(`   Description: "${test.description}"`);
    console.log(`   Valid: ${isValid ? '✅' : '❌'} (expected: ${test.shouldBeValid ? 'valid' : 'invalid'})`);
    console.log(`   Reason: ${test.reason}`);
  }
}

// Run the tests
runTests().catch(console.error);