import { detectSpiritType, getWhiskeyStyle, validateSpiritType } from './config/spirit-types.js';

// Comprehensive test cases covering all major spirit types and edge cases
const testCases = [
  // BOURBON TESTS
  { name: "Buffalo Trace Kentucky Straight Bourbon Whiskey", brand: "Buffalo Trace", expected: "Bourbon", description: "A tribute to the mighty buffalo and the rugged, independent spirit of the pioneers" },
  { name: "Maker's Mark 46", brand: "Maker's Mark", expected: "Bourbon", description: "French oak staves create a bold, complex flavor" },
  { name: "Pappy Van Winkle's Family Reserve 23 Year", brand: "Pappy Van Winkle", expected: "Bourbon" },
  { name: "E.H. Taylor, Jr. Small Batch", brand: "E.H. Taylor", expected: "Bourbon" },
  { name: "Blanton's Single Barrel", brand: "Blanton's", expected: "Bourbon" },
  { name: "Woodford Reserve Double Oaked", brand: "Woodford Reserve", expected: "Bourbon" },
  { name: "Wild Turkey 101", brand: "Wild Turkey", expected: "Bourbon" },
  { name: "Four Roses Single Barrel", brand: "Four Roses", expected: "Bourbon" },
  { name: "Knob Creek 9 Year", brand: "Knob Creek", expected: "Bourbon" },
  { name: "Elijah Craig Barrel Proof", brand: "Elijah Craig", expected: "Bourbon" },
  
  // TENNESSEE WHISKEY TESTS
  { name: "Jack Daniel's Old No. 7", brand: "Jack Daniel's", expected: "Tennessee Whiskey" },
  { name: "Jack Daniel's Single Barrel Select", brand: "Jack Daniels", expected: "Tennessee Whiskey" },
  { name: "George Dickel No. 12", brand: "George Dickel", expected: "Tennessee Whiskey" },
  { name: "Uncle Nearest 1856 Premium Whiskey", brand: "Uncle Nearest", expected: "Tennessee Whiskey" },
  
  // RYE WHISKEY TESTS
  { name: "Rittenhouse Rye Bottled in Bond", brand: "Rittenhouse", expected: "Rye Whiskey" },
  { name: "WhistlePig 10 Year Straight Rye", brand: "WhistlePig", expected: "Rye Whiskey" },
  { name: "Sazerac Straight Rye Whiskey", brand: "Sazerac", expected: "Rye Whiskey" },
  { name: "High West Double Rye!", brand: "High West", expected: "Rye Whiskey" },
  { name: "Bulleit 95 Rye", brand: "Bulleit", expected: "Rye Whiskey", description: "95% rye whiskey" },
  { name: "Old Overholt Straight Rye Whiskey", brand: "Old Overholt", expected: "Rye Whiskey" },
  
  // SCOTCH TESTS
  { name: "Macallan 18 Year Old Sherry Oak", brand: "Macallan", expected: "Scotch" },
  { name: "Glenfiddich 12 Year Old", brand: "Glenfiddich", expected: "Scotch" },
  { name: "Lagavulin 16 Year Old", brand: "Lagavulin", expected: "Scotch" },
  { name: "Ardbeg 10 Year Old", brand: "Ardbeg", expected: "Scotch" },
  { name: "Highland Park 12 Year Old Viking Honour", brand: "Highland Park", expected: "Scotch" },
  { name: "The Balvenie DoubleWood 12 Year Old", brand: "Balvenie", expected: "Scotch" },
  
  // IRISH WHISKEY TESTS
  { name: "Jameson Irish Whiskey", brand: "Jameson", expected: "Irish Whiskey" },
  { name: "Redbreast 12 Year Old", brand: "Redbreast", expected: "Irish Whiskey" },
  { name: "Bushmills Black Bush", brand: "Bushmills", expected: "Irish Whiskey" },
  { name: "Powers Gold Label", brand: "Powers", expected: "Irish Whiskey" },
  { name: "Tullamore D.E.W. Original", brand: "Tullamore D.E.W.", expected: "Irish Whiskey" },
  
  // VODKA TESTS
  { name: "Grey Goose Vodka", brand: "Grey Goose", expected: "Vodka" },
  { name: "Tito's Handmade Vodka", brand: "Tito's", expected: "Vodka" },
  { name: "Absolut Vodka", brand: "Absolut", expected: "Vodka" },
  { name: "Belvedere Vodka", brand: "Belvedere", expected: "Vodka" },
  { name: "Ketel One Vodka", brand: "Ketel One", expected: "Vodka" },
  
  // GIN TESTS
  { name: "Hendrick's Gin", brand: "Hendrick's", expected: "Gin" },
  { name: "Tanqueray London Dry Gin", brand: "Tanqueray", expected: "Gin" },
  { name: "Bombay Sapphire", brand: "Bombay", expected: "Gin" },
  { name: "Beefeater London Dry Gin", brand: "Beefeater", expected: "Gin" },
  { name: "The Botanist Islay Dry Gin", brand: "The Botanist", expected: "Gin" },
  
  // RUM TESTS
  { name: "Bacardi Superior White Rum", brand: "Bacardi", expected: "Rum" },
  { name: "Captain Morgan Original Spiced Rum", brand: "Captain Morgan", expected: "Rum" },
  { name: "Mount Gay Eclipse", brand: "Mount Gay", expected: "Rum" },
  { name: "Appleton Estate Signature Blend", brand: "Appleton", expected: "Rum" },
  { name: "Ron Zacapa Centenario 23", brand: "Ron Zacapa", expected: "Rum" },
  
  // TEQUILA TESTS
  { name: "Don Julio 1942", brand: "Don Julio", expected: "Tequila" },
  { name: "Patron Silver", brand: "Patron", expected: "Tequila" },
  { name: "Casamigos Blanco", brand: "Casamigos", expected: "Tequila" },
  { name: "Herradura Reposado", brand: "Herradura", expected: "Tequila" },
  { name: "Clase Azul Reposado", brand: "Clase Azul", expected: "Tequila" },
  
  // COGNAC TESTS
  { name: "Hennessy V.S", brand: "Hennessy", expected: "Cognac" },
  { name: "Remy Martin VSOP", brand: "Remy Martin", expected: "Cognac" },
  { name: "Martell Cordon Bleu", brand: "Martell", expected: "Cognac" },
  { name: "Courvoisier XO", brand: "Courvoisier", expected: "Cognac" },
  
  // EDGE CASES - Products without brands
  { name: "Kentucky Straight Bourbon Whiskey", brand: "", expected: "Bourbon" },
  { name: "Single Malt Scotch Whisky", brand: "", expected: "Scotch" },
  { name: "Blanco Tequila 100% Agave", brand: "", expected: "Tequila" },
  { name: "London Dry Gin", brand: "", expected: "Gin" },
  { name: "VSOP Cognac", brand: "", expected: "Cognac" },
  
  // EDGE CASES - Ambiguous names
  { name: "Wild Turkey American Honey", brand: "Wild Turkey", expected: "Liqueur", description: "Honey liqueur with bourbon" },
  { name: "Crown Royal Regal Apple", brand: "Crown Royal", expected: "Canadian Whisky", description: "Flavored whisky" },
  { name: "Fireball Cinnamon Whisky", brand: "Fireball", expected: "Liqueur", description: "Cinnamon flavored liqueur" },
  
  // EDGE CASES - High Rye Bourbon vs Rye Whiskey
  { name: "Four Roses Single Barrel High Rye", brand: "Four Roses", expected: "Bourbon", description: "High rye bourbon" },
  { name: "Bulleit Bourbon High Rye", brand: "Bulleit", expected: "Bourbon", description: "High rye mash bill bourbon" },
  
  // FALSE POSITIVE TESTS - Should NOT match certain types
  { name: "Premium Forum Discussion", brand: "", expected: "Spirit", description: "Discussion about premium spirits" },
  { name: "Drum Set for Sale", brand: "", expected: "Spirit", description: "Musical instrument" },
  { name: "Ginger Beer", brand: "", expected: "Spirit", description: "Non-alcoholic ginger beer" },
  
  // SUBTYPE TESTS
  { name: "Knob Creek Single Barrel Reserve", brand: "Knob Creek", expected: "Bourbon", expectedSubtype: "Single Barrel" },
  { name: "Maker's Mark Cask Strength", brand: "Maker's Mark", expected: "Bourbon", expectedSubtype: "Cask Strength" },
  { name: "Henry McKenna 10 Year Bottled-in-Bond", brand: "Henry McKenna", expected: "Bourbon", expectedSubtype: "Bottled-in-Bond" },
  { name: "Woodford Reserve Wheat Whiskey", brand: "Woodford Reserve", expected: "Bourbon", expectedSubtype: "Wheated" },
  { name: "Old Forester 1920 Prohibition Style", brand: "Old Forester", expected: "Bourbon", expectedSubtype: undefined },
  { name: "Patron Silver Tequila", brand: "Patron", expected: "Tequila", expectedSubtype: "Blanco" },
  { name: "Don Julio Añejo", brand: "Don Julio", expected: "Tequila", expectedSubtype: "Añejo" },
  { name: "Hennessy Paradis", brand: "Hennessy", expected: "Cognac", expectedSubtype: undefined },
];

interface TestResult {
  name: string;
  brand: string;
  expected: string;
  detected: string;
  confidence: number;
  subType?: string;
  expectedSubtype?: string;
  passed: boolean;
  failureReason?: string;
}

function runComprehensiveTests() {
  console.log('🧪 COMPREHENSIVE TYPE DETECTION TEST\n');
  console.log('=' .repeat(80) + '\n');
  
  const results: TestResult[] = [];
  const typeStats = new Map<string, { total: number; correct: number }>();
  
  // Run all tests
  for (const test of testCases) {
    const result = detectSpiritType(test.name, test.brand, test.description);
    
    const passed = result.type === test.expected && 
                   (test.expectedSubtype === undefined || result.subType === test.expectedSubtype);
    
    const testResult: TestResult = {
      name: test.name,
      brand: test.brand || '(no brand)',
      expected: test.expected,
      detected: result.type,
      confidence: result.confidence,
      subType: result.subType,
      expectedSubtype: test.expectedSubtype,
      passed,
      failureReason: !passed ? 
        (result.type !== test.expected ? `Type mismatch: expected "${test.expected}", got "${result.type}"` :
         `Subtype mismatch: expected "${test.expectedSubtype}", got "${result.subType}"`) : undefined
    };
    
    results.push(testResult);
    
    // Update stats
    const stats = typeStats.get(test.expected) || { total: 0, correct: 0 };
    stats.total++;
    if (passed) stats.correct++;
    typeStats.set(test.expected, stats);
  }
  
  // Display results by type
  console.log('📊 RESULTS BY SPIRIT TYPE:\n');
  
  for (const [type, stats] of typeStats) {
    const accuracy = ((stats.correct / stats.total) * 100).toFixed(1);
    const emoji = parseFloat(accuracy) === 100 ? '✅' : parseFloat(accuracy) >= 80 ? '⚠️' : '❌';
    console.log(`${emoji} ${type}: ${stats.correct}/${stats.total} (${accuracy}%)`);
    
    // Show failures for this type
    const failures = results.filter(r => r.expected === type && !r.passed);
    if (failures.length > 0) {
      failures.forEach(f => {
        console.log(`   ❌ "${f.name}" - ${f.failureReason}`);
      });
    }
  }
  
  // Overall statistics
  console.log('\n' + '=' .repeat(80));
  console.log('\n📈 OVERALL STATISTICS:\n');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const overallAccuracy = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Overall Accuracy: ${overallAccuracy}%`);
  
  // Confidence distribution
  console.log('\n📊 CONFIDENCE DISTRIBUTION:');
  const confidenceBuckets = { high: 0, medium: 0, low: 0 };
  results.forEach(r => {
    if (r.confidence >= 0.8) confidenceBuckets.high++;
    else if (r.confidence >= 0.5) confidenceBuckets.medium++;
    else confidenceBuckets.low++;
  });
  console.log(`High (≥0.8): ${confidenceBuckets.high} (${((confidenceBuckets.high / totalTests) * 100).toFixed(1)}%)`);
  console.log(`Medium (0.5-0.8): ${confidenceBuckets.medium} (${((confidenceBuckets.medium / totalTests) * 100).toFixed(1)}%)`);
  console.log(`Low (<0.5): ${confidenceBuckets.low} (${((confidenceBuckets.low / totalTests) * 100).toFixed(1)}%)`);
  
  // Subtype detection accuracy
  const subtypeTests = results.filter(r => r.expectedSubtype !== undefined);
  const subtypePassed = subtypeTests.filter(r => r.passed).length;
  if (subtypeTests.length > 0) {
    console.log(`\n📋 SUBTYPE DETECTION:`);
    console.log(`Accuracy: ${subtypePassed}/${subtypeTests.length} (${((subtypePassed / subtypeTests.length) * 100).toFixed(1)}%)`);
  }
  
  // Show all failures
  console.log('\n' + '=' .repeat(80));
  console.log('\n❌ ALL FAILURES:\n');
  const allFailures = results.filter(r => !r.passed);
  if (allFailures.length === 0) {
    console.log('🎉 No failures! All tests passed.');
  } else {
    allFailures.forEach(f => {
      console.log(`❌ "${f.name}" (${f.brand})`);
      console.log(`   Expected: ${f.expected}${f.expectedSubtype ? ` (${f.expectedSubtype})` : ''}`);
      console.log(`   Detected: ${f.detected}${f.subType ? ` (${f.subType})` : ''} [confidence: ${f.confidence}]`);
      console.log(`   Reason: ${f.failureReason}\n`);
    });
  }
  
  // Test whiskey style detection separately
  console.log('\n' + '=' .repeat(80));
  console.log('\n🥃 WHISKEY STYLE DETECTION:\n');
  
  const whiskeyStyleTests = [
    { name: "Evan Williams Bottled-in-Bond", expected: "Bottled-in-Bond" },
    { name: "Buffalo Trace Single Barrel Select", expected: "Single Barrel" },
    { name: "Four Roses Small Batch", expected: "Small Batch" },
    { name: "Stagg Jr. Barrel Proof", expected: "Cask Strength" },
    { name: "Maker's 46 Cask Strength", expected: "Cask Strength" },
    { name: "Larceny Wheated Bourbon", expected: "Wheated" },
    { name: "Old Grand-Dad 114", expected: undefined }, // High proof but not labeled as cask strength
    { name: "Wild Turkey 101", expected: undefined }, // 101 proof but not bottled-in-bond
  ];
  
  let whiskeyStylePassed = 0;
  whiskeyStyleTests.forEach(test => {
    const detected = getWhiskeyStyle(test.name);
    const passed = detected === test.expected;
    if (passed) whiskeyStylePassed++;
    console.log(`${passed ? '✅' : '❌'} "${test.name}": ${detected || 'none'} (expected: ${test.expected || 'none'})`);
  });
  
  console.log(`\nWhiskey Style Accuracy: ${whiskeyStylePassed}/${whiskeyStyleTests.length} (${((whiskeyStylePassed / whiskeyStyleTests.length) * 100).toFixed(1)}%)`);
  
  // Final summary
  console.log('\n' + '=' .repeat(80));
  console.log('\n🎯 FINAL SUMMARY:\n');
  
  if (parseFloat(overallAccuracy) >= 95) {
    console.log('✅ EXCELLENT! Type detection meets the 95% accuracy target.');
  } else if (parseFloat(overallAccuracy) >= 85) {
    console.log('⚠️  GOOD! Type detection is working well but has room for improvement.');
  } else {
    console.log('❌ NEEDS WORK! Type detection accuracy is below acceptable levels.');
  }
  
  console.log(`\nRecommendations:`);
  if (confidenceBuckets.low > totalTests * 0.1) {
    console.log('- Many low confidence detections. Consider adding more patterns or brand mappings.');
  }
  if (allFailures.length > 0) {
    const failureTypes = new Set(allFailures.map(f => f.expected));
    console.log(`- Focus on improving detection for: ${Array.from(failureTypes).join(', ')}`);
  }
  
  // Test edge cases
  console.log('\n' + '=' .repeat(80));
  console.log('\n🔍 EDGE CASE VALIDATION:\n');
  
  // Test validation function
  const validationTests = [
    { type: "Bourbon", name: "Buffalo Trace Bourbon", brand: "Buffalo Trace", expectedValid: true },
    { type: "Vodka", name: "Buffalo Trace Bourbon", brand: "Buffalo Trace", expectedValid: false },
    { type: "Gin", name: "Hendrick's Gin", brand: "Hendrick's", expectedValid: true },
    { type: "Tequila", name: "Whiskey Sour", brand: "", expectedValid: false },
  ];
  
  validationTests.forEach(test => {
    const isValid = validateSpiritType(test.type, test.name, test.brand);
    const passed = isValid === test.expectedValid;
    console.log(`${passed ? '✅' : '❌'} Validate ${test.type} for "${test.name}": ${isValid} (expected: ${test.expectedValid})`);
  });
}

// Run the comprehensive test
runComprehensiveTests();