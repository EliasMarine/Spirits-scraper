import { detectSpiritType, getWhiskeyStyle, validateSpiritType } from './config/spirit-types.js';

interface TestCase {
  name: string;
  brand?: string;
  description?: string;
  expectedType: string;
  expectedSubType?: string;
  source: 'csv' | 'synthetic';
}

// Test cases from the problematic CSV where everything was marked as "Bourbon"
const csvTestCases: TestCase[] = [
  // Valid Bourbon products
  {
    name: "Buffalo Trace Kentucky Straight Bourbon",
    brand: "Buffalo Trace",
    description: "Buffalo Trace Kentucky Straight Bourbon Whiskey is made from the finest corn, rye and barley malt",
    expectedType: "Bourbon",
    source: 'csv'
  },
  {
    name: "Four Roses Bourbon Pairing",
    brand: "Four Roses",
    description: "This bourbon is aged between 7 and 9 years and bottled at 100 proof 50% ABV",
    expectedType: "Bourbon",
    expectedSubType: "Bottled-in-Bond",
    source: 'csv'
  },
  {
    name: "Woodford Reserve Batch Proof",
    brand: "Woodford Reserve",
    description: "$39.99 Woodford Reserve Double Oaked Bourbon 750ml",
    expectedType: "Bourbon",
    expectedSubType: "Cask Strength",
    source: 'csv'
  },
  {
    name: "Maker's Mark Bourbon",
    brand: "Makers Mark",
    description: "Makers Mark Cask Strength. Bourbon Whiskey 54.4% ABV",
    expectedType: "Bourbon",
    expectedSubType: "Cask Strength",
    source: 'csv'
  },
  {
    name: "Elijah Craig Barrel Proof Bourbon",
    brand: "Elijah Craig",
    description: "ELIJAH CRAIG BARREL PROOF BOURBON 750 ML",
    expectedType: "Bourbon",
    expectedSubType: "Cask Strength",
    source: 'csv'
  },
  {
    name: "Ben Holladay-bottled In Bond Bourbon",
    brand: "ben holladay",
    description: "The whiskey is distilled, aged, and bottled on-site, spending a minimum of six years",
    expectedType: "Bourbon",
    expectedSubType: "Bottled-in-Bond",
    source: 'csv'
  },
  {
    name: "Johnny Drum Whiskey",
    brand: "johnny",
    description: "Johnny Drum Private Stock Kentucky Straight Bourbon - 50.5%ABV, 101 Proof",
    expectedType: "Bourbon",
    expectedSubType: "Bottled-in-Bond",
    source: 'csv'
  },
  {
    name: "Green River Wheated Bourbon",
    brand: "green river",
    description: "Explore our review of Green Rivers Wheated Single Barrel Bourbon",
    expectedType: "Bourbon",
    expectedSubType: "Wheated",
    source: 'csv'
  },
  {
    name: "Blue Run High Rye Bourbon Whiskey",
    brand: "blue run",
    description: "Review and tasting notes for Blue Run High Rye Bourbon",
    expectedType: "Bourbon",
    expectedSubType: "High Rye",
    source: 'csv'
  },
  {
    name: "1792 High Rye Whiskey",
    brand: "1792",
    description: "Beginning with the 1792 high rye mashbill, this bourbon is bottled",
    expectedType: "Bourbon",
    expectedSubType: "High Rye",
    source: 'csv'
  },
  {
    name: "Redemption Wheated Bourbon",
    brand: "redemption",
    description: "Discover the exceptional taste and unmatched quality of Redemption Wheated Bourbon Whiskey",
    expectedType: "Bourbon",
    expectedSubType: "Wheated",
    source: 'csv'
  },
  
  // Products that should NOT be Bourbon (but were incorrectly marked as such)
  {
    name: "Savannah Bourbon-spirits",
    brand: "savannah",
    description: "Bottled at 70 proof, this whiskey from Savannah Bourbon Co in Georgia",
    expectedType: "Whiskey", // Generic whiskey, not specifically bourbon
    source: 'csv'
  },
  {
    name: "Founder's Original Bourbon Sour",
    brand: "",
    description: "291 Colorado Rye Whiskey made from rye malt, sour mash",
    expectedType: "Rye Whiskey", // Actually describes rye whiskey
    source: 'csv'
  },
  {
    name: "Buffalo Trace's Single Estate Farm Continues Expansion",
    brand: "",
    description: "Double distilled and aged for 3 years in ex bourbon barrels. Ta4 - San Matias Gran Reserva Extra Anejo",
    expectedType: "Tequila", // Description mentions tequila (Anejo)
    source: 'csv'
  },
  {
    name: "Goose Island Bourbon County Stout 5-year Vertical",
    brand: "goose",
    description: "Aged in bourbon barrels, this beer has subtle yet familiar flavors of vanilla and oak",
    expectedType: "Spirit", // This is beer, should be filtered
    source: 'csv'
  },
  {
    name: "Retail Bourbon-bhg",
    brand: "retail",
    description: "But this rich, deeply flavored chocolate pecan pie will also go over great",
    expectedType: "Spirit", // This is food, should be filtered
    source: 'csv'
  },
  
  // Additional test cases for other types
  {
    name: "Straight Bourbon Whiskey-woodford Reserve",
    brand: "straight",
    description: "Palate Thick and full. There are notes of espresso beans, winter spice",
    expectedType: "Bourbon", // Despite weird formatting, this is bourbon
    source: 'csv'
  },
  {
    name: "Wild Turkey Rare Breed Barrel Proof",
    brand: "Wild Turkey",
    description: "Get Wild Turkey Rare Breed Barrel Proof Kentucky Straight Bourbon Whiskey",
    expectedType: "Bourbon",
    expectedSubType: "Cask Strength",
    source: 'csv'
  },
  {
    name: "True Single Barrel Bourbon",
    brand: "True Single",
    description: "No additives must be added to the mash as well",
    expectedType: "Bourbon",
    expectedSubType: "Single Barrel",
    source: 'csv'
  },
  {
    name: "Barrel Proof Nola",
    brand: "",
    description: "A little research shows that they fire their barrels for 40 seconds",
    expectedType: "Spirit", // Too generic to classify
    source: 'csv'
  }
];

// Additional synthetic test cases
const syntheticTestCases: TestCase[] = [
  // Tennessee Whiskey
  {
    name: "Jack Daniel's Old No. 7",
    brand: "Jack Daniel's",
    expectedType: "Tennessee Whiskey",
    source: 'synthetic'
  },
  {
    name: "George Dickel No. 12",
    brand: "George Dickel",
    expectedType: "Tennessee Whiskey",
    source: 'synthetic'
  },
  {
    name: "Uncle Nearest 1856",
    brand: "Uncle Nearest",
    expectedType: "Tennessee Whiskey",
    source: 'synthetic'
  },
  
  // Rye Whiskey
  {
    name: "Rittenhouse Rye",
    brand: "Rittenhouse",
    expectedType: "Rye Whiskey",
    source: 'synthetic'
  },
  {
    name: "WhistlePig 10 Year",
    brand: "WhistlePig",
    expectedType: "Rye Whiskey",
    source: 'synthetic'
  },
  {
    name: "High West Double Rye",
    brand: "High West",
    description: "A blend of two straight rye whiskeys",
    expectedType: "Rye Whiskey",
    source: 'synthetic'
  },
  
  // Scotch
  {
    name: "Macallan 12 Year",
    brand: "Macallan",
    expectedType: "Scotch",
    source: 'synthetic'
  },
  {
    name: "Glenfiddich 15 Year",
    brand: "Glenfiddich",
    expectedType: "Scotch",
    source: 'synthetic'
  },
  {
    name: "Lagavulin 16 Year",
    brand: "Lagavulin",
    expectedType: "Scotch",
    source: 'synthetic'
  },
  
  // Irish Whiskey
  {
    name: "Jameson Irish Whiskey",
    brand: "Jameson",
    expectedType: "Irish Whiskey",
    source: 'synthetic'
  },
  {
    name: "Redbreast 12 Year",
    brand: "Redbreast",
    expectedType: "Irish Whiskey",
    source: 'synthetic'
  },
  
  // Tequila
  {
    name: "Don Julio 1942",
    brand: "Don Julio",
    expectedType: "Tequila",
    source: 'synthetic'
  },
  {
    name: "Patron Silver",
    brand: "Patron",
    expectedType: "Tequila",
    expectedSubType: "Blanco",
    source: 'synthetic'
  },
  {
    name: "Clase Azul Reposado",
    brand: "Clase Azul",
    expectedType: "Tequila",
    expectedSubType: "Reposado",
    source: 'synthetic'
  },
  
  // Vodka
  {
    name: "Grey Goose",
    brand: "Grey Goose",
    expectedType: "Vodka",
    source: 'synthetic'
  },
  {
    name: "Tito's Handmade Vodka",
    brand: "Tito's",
    expectedType: "Vodka",
    source: 'synthetic'
  },
  
  // Gin
  {
    name: "Hendrick's Gin",
    brand: "Hendrick's",
    expectedType: "Gin",
    source: 'synthetic'
  },
  {
    name: "Tanqueray London Dry",
    brand: "Tanqueray",
    expectedType: "Gin",
    expectedSubType: "London Dry",
    source: 'synthetic'
  },
  
  // Rum
  {
    name: "Bacardi Superior",
    brand: "Bacardi",
    expectedType: "Rum",
    expectedSubType: "White",
    source: 'synthetic'
  },
  {
    name: "Captain Morgan Spiced",
    brand: "Captain Morgan",
    expectedType: "Rum",
    expectedSubType: "Spiced",
    source: 'synthetic'
  },
  
  // Cognac
  {
    name: "Hennessy VS",
    brand: "Hennessy",
    expectedType: "Cognac",
    expectedSubType: "VS",
    source: 'synthetic'
  },
  {
    name: "Remy Martin VSOP",
    brand: "Remy Martin",
    expectedType: "Cognac",
    expectedSubType: "VSOP",
    source: 'synthetic'
  },
  
  // Edge cases
  {
    name: "High Rye Bourbon",
    brand: "Generic Brand",
    description: "A bourbon with a high rye content in the mash bill",
    expectedType: "Bourbon",
    expectedSubType: "High Rye",
    source: 'synthetic'
  },
  {
    name: "Bourbon Barrel Aged Maple Syrup",
    brand: "",
    description: "Pure maple syrup aged in bourbon barrels",
    expectedType: "Spirit", // Not a spirit
    source: 'synthetic'
  }
];

async function runTypeDetectionTests() {
  console.log('🧪 Running Spirit Type Detection Tests\n');
  console.log('=' .repeat(80) + '\n');
  
  const allTests = [...csvTestCases, ...syntheticTestCases];
  let passed = 0;
  let failed = 0;
  
  // Group by source
  const csvTests = allTests.filter(t => t.source === 'csv');
  const synthTests = allTests.filter(t => t.source === 'synthetic');
  
  console.log('📋 CSV-Based Test Cases (from problematic data):\n');
  await runTestGroup(csvTests);
  
  console.log('\n📋 Synthetic Test Cases (comprehensive coverage):\n');
  await runTestGroup(synthTests);
  
  async function runTestGroup(tests: TestCase[]) {
    for (const test of tests) {
      const result = await testTypeDetection(test);
      if (result) {
        passed++;
      } else {
        failed++;
      }
    }
  }
  
  // Final report
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 FINAL TEST RESULTS:');
  console.log(`   Total Tests: ${allTests.length}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / allTests.length) * 100).toFixed(1)}%`);
  
  // Type distribution analysis
  console.log('\n📈 Type Distribution Analysis:');
  const typeCount = new Map<string, number>();
  
  for (const test of allTests) {
    const result = detectSpiritType(test.name, test.brand, test.description);
    typeCount.set(result.type, (typeCount.get(result.type) || 0) + 1);
  }
  
  console.log('\n   Detected Types:');
  [...typeCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percentage = ((count / allTests.length) * 100).toFixed(1);
      console.log(`   • ${type}: ${count} (${percentage}%)`);
    });
  
  if (failed > 0) {
    console.log(`\n❌ ${failed} tests failed. Review the output above for details.`);
  } else {
    console.log(`\n✅ All tests passed! Type detection is working correctly.`);
  }
  
  // Whiskey style detection test
  console.log('\n\n🥃 Testing Whiskey Style Detection:\n');
  testWhiskeyStyles();
}

async function testTypeDetection(test: TestCase): Promise<boolean> {
  console.log(`\nTesting: "${test.name}"`);
  if (test.brand) console.log(`   Brand: "${test.brand}"`);
  if (test.description) {
    console.log(`   Description: "${test.description.substring(0, 60)}${test.description.length > 60 ? '...' : ''}"`);
  }
  console.log(`   Expected: ${test.expectedType}${test.expectedSubType ? ` (${test.expectedSubType})` : ''}`);
  
  const result = detectSpiritType(test.name, test.brand, test.description);
  
  console.log(`   Detected: ${result.type}${result.subType ? ` (${result.subType})` : ''} [confidence: ${result.confidence}]`);
  
  // Check main type
  const typeMatches = result.type === test.expectedType;
  
  // Check subtype if expected
  let subTypeMatches = true;
  if (test.expectedSubType) {
    subTypeMatches = result.subType === test.expectedSubType;
  }
  
  const testPassed = typeMatches && subTypeMatches;
  
  console.log(`   Result: ${testPassed ? 'PASS ✅' : 'FAIL ❌'}`);
  
  if (!testPassed) {
    console.log(`   ⚠️  MISMATCH!`);
    if (!typeMatches) {
      console.log(`       Type: Expected "${test.expectedType}", got "${result.type}"`);
    }
    if (!subTypeMatches) {
      console.log(`       SubType: Expected "${test.expectedSubType}", got "${result.subType || 'none'}"`);
    }
  }
  
  // Validate type detection
  const isValid = validateSpiritType(result.type, test.name, test.brand);
  if (!isValid && typeMatches) {
    console.log(`   ⚠️  Warning: Type validation failed despite match`);
  }
  
  return testPassed;
}

function testWhiskeyStyles() {
  const whiskeyTests = [
    { name: "Bottled in Bond Bourbon", expected: "Bottled-in-Bond" },
    { name: "Single Barrel Select", expected: "Single Barrel" },
    { name: "Small Batch Kentucky Straight", expected: "Small Batch" },
    { name: "Cask Strength Bourbon", expected: "Cask Strength" },
    { name: "Barrel Proof Whiskey", expected: "Cask Strength" },
    { name: "Wheated Bourbon", expected: "Wheated" },
    { name: "High Rye Bourbon", expected: "High Rye" },
    { name: "100 Proof Bourbon", expected: "Bottled-in-Bond" },
  ];
  
  for (const test of whiskeyTests) {
    const style = getWhiskeyStyle(test.name);
    const passed = style === test.expected;
    console.log(`   ${test.name}: ${style || 'none'} ${passed ? '✅' : '❌'}`);
    if (!passed) {
      console.log(`      Expected: ${test.expected}`);
    }
  }
}

// Run tests
runTypeDetectionTests().catch(console.error);