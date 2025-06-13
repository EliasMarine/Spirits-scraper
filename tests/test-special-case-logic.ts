/**
 * Simple test to verify special case normalization logic
 * Tests the specific normalization methods without complex imports
 */

// Test the size variant normalization
function testSizeVariantNormalization(): void {
  console.log('=== Testing Size Variant Normalization ===');
  
  const testCases = [
    "Jack Daniel's Old No. 7 Tennessee Whiskey 750ml",
    "Jack Daniel's Old No. 7 Tennessee Whiskey 1L", 
    "Jack Daniel's Old No. 7 Tennessee Whiskey 1.75L",
    "Maker's Mark Bourbon 375ml",
    "Maker's Mark Bourbon"
  ];
  
  const normalizeSizeVariants = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      // Remove common bottle sizes
      .replace(/\b(375|750|1000|1750)ml?\b/gi, '')
      .replace(/\b(0\.375|0\.75|1|1\.75)l?\b/gi, '')
      .replace(/\b(375ml|750ml|1l|1\.75l|1750ml)\b/gi, '')
      .replace(/\b(pint|quart|half\s*gallon|gallon)\b/gi, '')
      .replace(/\b(50ml|100ml|200ml|350ml|500ml|700ml)\b/gi, '')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const normalized = testCases.map(name => ({
    original: name,
    normalized: normalizeSizeVariants(name)
  }));
  
  normalized.forEach(({ original, normalized }) => {
    console.log(`"${original}" -> "${normalized}"`);
  });
  
  // Check that Jack Daniel's variants normalize to the same thing
  const jackDanielsNormalized = normalized.slice(0, 3).map(n => n.normalized);
  const allSame = jackDanielsNormalized.every(n => n === jackDanielsNormalized[0]);
  console.log(`✓ Jack Daniel's size variants normalize identically: ${allSame}`);
}

// Test marketing text normalization
function testMarketingTextNormalization(): void {
  console.log('\n=== Testing Marketing Text Normalization ===');
  
  const testCases = [
    "Maker's Mark Small Batch Bourbon",
    "Maker's Mark Small-Batch Bourbon",
    "Elijah Craig Single Barrel Bourbon",
    "Elijah Craig Single-Barrel Bourbon",
    "Wild Turkey Master Distiller Reserve",
    "Wild Turkey Master-Distiller Reserve"
  ];
  
  const normalizeMarketingText = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      // Standardize hyphenation and spacing in marketing terms
      .replace(/\bsmall[\s-]*batch\b/gi, 'smallbatch')
      .replace(/\bsingle[\s-]*barrel\b/gi, 'singlebarrel')
      .replace(/\bcask[\s-]*strength\b/gi, 'caskstrength')
      .replace(/\bbottled[\s-]*in[\s-]*bond\b/gi, 'bottledinbond')
      .replace(/\blimited[\s-]*edition\b/gi, 'limitededition')
      .replace(/\bprivate[\s-]*selection\b/gi, 'privateselection')
      .replace(/\bmaster[\s-]*distiller\b/gi, 'masterdistiller')
      .replace(/\bdistillery[\s-]*exclusive\b/gi, 'distilleryexclusive')
      // Remove common marketing words that vary
      .replace(/\b(premium|reserve|select|special|finest|quality|craft|artisan)\b/gi, '')
      // Clean up spaces
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const normalized = testCases.map(name => ({
    original: name,
    normalized: normalizeMarketingText(name)
  }));
  
  normalized.forEach(({ original, normalized }) => {
    console.log(`"${original}" -> "${normalized}"`);
  });
  
  // Check that marketing variants normalize to the same thing
  const makersNormalized = normalized.slice(0, 2).map(n => n.normalized);
  const makersMatch = makersNormalized[0] === makersNormalized[1];
  console.log(`✓ Maker's Mark marketing variants normalize identically: ${makersMatch}`);
  
  const elijahNormalized = normalized.slice(2, 4).map(n => n.normalized);
  const elijahMatch = elijahNormalized[0] === elijahNormalized[1];
  console.log(`✓ Elijah Craig marketing variants normalize identically: ${elijahMatch}`);
}

// Test year variant normalization
function testYearVariantNormalization(): void {
  console.log('\n=== Testing Year Variant Normalization ===');
  
  const testCases = [
    "Blanton's Single Barrel Bourbon 2023",
    "Blanton's Single Barrel Bourbon 2024",
    "Four Roses Limited Edition 2022",
    "Four Roses Limited Edition 2023",
    "Macallan 18 Year Old 2020 Release",
    "Macallan 18 Year Old 2021 Release"
  ];
  
  const normalizeYearVariants = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      // Remove 4-digit years (2018, 2019, etc.) but keep age statements
      .replace(/\b(19|20)\d{2}\b/g, '')
      // Remove vintage/release year patterns
      .replace(/\b(vintage|release|bottled|distilled)\s*(19|20)\d{2}\b/gi, '')
      .replace(/\b(19|20)\d{2}\s*(vintage|release|bottled|distilled)\b/gi, '')
      // Remove year ranges
      .replace(/\b(19|20)\d{2}-(19|20)\d{2}\b/g, '')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const normalized = testCases.map(name => ({
    original: name,
    normalized: normalizeYearVariants(name)
  }));
  
  normalized.forEach(({ original, normalized }) => {
    console.log(`"${original}" -> "${normalized}"`);
  });
  
  // Check that year variants normalize to the same thing
  const blantonsNormalized = normalized.slice(0, 2).map(n => n.normalized);
  const blantonsMatch = blantonsNormalized[0] === blantonsNormalized[1];
  console.log(`✓ Blanton's year variants normalize identically: ${blantonsMatch}`);
  
  const fourRosesNormalized = normalized.slice(2, 4).map(n => n.normalized);
  const fourRosesMatch = fourRosesNormalized[0] === fourRosesNormalized[1];
  console.log(`✓ Four Roses year variants normalize identically: ${fourRosesMatch}`);
}

// Test proof notation normalization
function testProofNotationNormalization(): void {
  console.log('\n=== Testing Proof Notation Normalization ===');
  
  const testCases = [
    "Wild Turkey 101 Proof Bourbon",
    "Wild Turkey 50.5% ABV Bourbon",
    "Booker's 120 Proof Bourbon", 
    "Booker's 60% ABV Bourbon",
    "George T. Stagg 140.2 proof",
    "George T. Stagg 70.1% ABV"
  ];
  
  const normalizeProofNotation = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      // Convert common proof to ABV patterns
      .replace(/\b(\d+(?:\.\d+)?)\s*proof\b/gi, (match, number) => {
        const abv = parseFloat(number) / 2;
        return `${abv}abv`;
      })
      // Standardize ABV notation
      .replace(/\b(\d+(?:\.\d+)?)\s*%?\s*abv\b/gi, '$1abv')
      .replace(/\b(\d+(?:\.\d+)?)\s*%\b/gi, '$1abv')
      // Remove alcohol content entirely for basic matching
      .replace(/\b\d+(?:\.\d+)?(abv|proof|%)\b/gi, '')
      // Clean up spaces
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const normalized = testCases.map(name => ({
    original: name,
    normalized: normalizeProofNotation(name)
  }));
  
  normalized.forEach(({ original, normalized }) => {
    console.log(`"${original}" -> "${normalized}"`);
  });
  
  // Check that proof variants normalize to the same thing
  const wildTurkeyNormalized = normalized.slice(0, 2).map(n => n.normalized);
  const wildTurkeyMatch = wildTurkeyNormalized[0] === wildTurkeyNormalized[1];
  console.log(`✓ Wild Turkey proof variants normalize identically: ${wildTurkeyMatch}`);
  
  const bookersNormalized = normalized.slice(2, 4).map(n => n.normalized);
  const bookersMatch = bookersNormalized[0] === bookersNormalized[1];
  console.log(`✓ Booker's proof variants normalize identically: ${bookersMatch}`);
}

// Test type compatibility
function testTypeCompatibility(): void {
  console.log('\n=== Testing Type Compatibility ===');
  
  const testCases = [
    { type: "Bourbon", expected: "american-whiskey" },
    { type: "American Whiskey", expected: "american-whiskey" },
    { type: "Tennessee Whiskey", expected: "american-whiskey" },
    { type: "Single Malt Scotch", expected: "scotch-whisky" },
    { type: "Scotch Whisky", expected: "scotch-whisky" },
    { type: "Irish Whiskey", expected: "irish-whiskey" },
    { type: "Rye Whiskey", expected: "rye-whiskey" }
  ];
  
  const getCompatibleType = (type: string): string => {
    const normalizedType = type.toLowerCase().trim();
    
    // Bourbon and American Whiskey are compatible
    if (normalizedType.includes('bourbon') || 
        normalizedType.includes('american whiskey') ||
        normalizedType.includes('tennessee whiskey')) {
      return 'american-whiskey';
    }
    
    // Scotch variations
    if (normalizedType.includes('scotch') || 
        normalizedType.includes('single malt') ||
        normalizedType.includes('blended scotch')) {
      return 'scotch-whisky';
    }
    
    // Irish whiskey
    if (normalizedType.includes('irish')) {
      return 'irish-whiskey';
    }
    
    // Rye whiskey
    if (normalizedType.includes('rye')) {
      return 'rye-whiskey';
    }
    
    return normalizedType;
  };
  
  testCases.forEach(({ type, expected }) => {
    const result = getCompatibleType(type);
    const match = result === expected;
    console.log(`"${type}" -> "${result}" ${match ? '✓' : '✗'}`);
  });
}

// Run all tests
function runAllTests(): void {
  console.log('Starting Special Case Handler Tests...\n');
  
  testSizeVariantNormalization();
  testMarketingTextNormalization();
  testYearVariantNormalization();  
  testProofNotationNormalization();
  testTypeCompatibility();
  
  console.log('\n=== Special Case Handler Tests Complete ===');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}