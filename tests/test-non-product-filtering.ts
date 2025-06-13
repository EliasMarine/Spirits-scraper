import { 
  NON_PRODUCT_FILTERS,
  containsNonProductPatterns, 
  isNonProductUrl,
  hasRequiredSpiritIndicators,
  hasAlcoholContent 
} from './config/non-product-filters.js';
import { logger } from './utils/logger.js';

// Test cases from the CSV analysis
const testCases = [
  // Non-products that should be filtered
  {
    name: "Goose Island Bourbon County Stout 5-year Vertical",
    description: "Aged in bourbon barrels, this beer has subtle yet familiar flavors of vanilla and oak.",
    url: "https://slightlytoasted.com/drinks/",
    shouldPass: false,
    reason: "Beer product"
  },
  {
    name: "Retail Bourbon-bhg",
    description: "But this rich, deeply flavored chocolate pecan pie will also go over great at any potluck or holiday gathering.",
    url: "https://www.tasteselectrepeat.com/products/old-forester",
    shouldPass: false,
    reason: "Retail page / food content"
  },
  {
    name: "Buffalo Trace's Single Estate Farm Continues Expansion",
    description: "Double distilled and aged for 3 years in ex bourbon barrels.",
    url: "https://whiskyadvocate.com/news",
    shouldPass: false,
    reason: "News article"
  },
  {
    name: "Founder's Original Bourbon Sour",
    description: "291 Colorado Rye Whiskey made from rye malt, sour mash.",
    url: "https://www.breakingbourbon.com/cocktails",
    shouldPass: false,
    reason: "Cocktail/mixed drink"
  },
  {
    name: "Eagle Rare Men's White Polo",
    description: "100% cotton polo shirt with Eagle Rare branding",
    url: "https://shop.buffalotrace.com/merchandise",
    shouldPass: false,
    reason: "Clothing merchandise"
  },
  {
    name: "Kentucky Distillery & Bourbon Tours",
    description: "Visit us for an unforgettable bourbon experience",
    url: "https://www.kentuckytours.com",
    shouldPass: false,
    reason: "Tour/experience"
  },
  
  // Valid products that should pass
  {
    name: "Buffalo Trace Kentucky Straight Bourbon",
    description: "Buffalo Trace Kentucky Straight Bourbon Whiskey is made from the finest corn, rye and barley malt, and ages in new oak barrels for years.",
    url: "https://www.totalwine.com/spirits/bourbon/buffalo-trace",
    shouldPass: true,
    reason: "Valid bourbon product"
  },
  {
    name: "Woodford Reserve Bourbon",
    description: "$39.99 Woodford Reserve Double Oaked Bourbon 750ml A rich and full-bodied bourbon aged in two oak barrels.",
    url: "https://www.woodfordreserve.com/whiskey/bourbon",
    shouldPass: true,
    reason: "Valid bourbon product"
  },
  {
    name: "Blanton's Original Single Barrel",
    description: "Blanton's Original Single Barrel was once designated for ambassadors, dignitaries, and Colonel Blanton's family and friends.",
    url: "https://www.blantonsbourbon.com",
    shouldPass: true,
    reason: "Valid bourbon product"
  }
];

// Run tests
console.log('🧪 Testing Non-Product Filtering...\n');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(`\n📋 Testing: "${testCase.name}"`);
  console.log(`   URL: ${testCase.url}`);
  console.log(`   Expected: ${testCase.shouldPass ? 'PASS ✅' : 'FAIL ❌'} (${testCase.reason})`);
  
  // Test URL filtering
  const urlCheck = isNonProductUrl(testCase.url);
  console.log(`   URL check: ${urlCheck.isNonProduct ? `Non-product (${urlCheck.category})` : 'Clean'}`);
  
  // Test content patterns
  const fullText = `${testCase.name} ${testCase.description}`;
  let foundNonProduct = false;
  let foundCategory = '';
  
  const categories: Array<keyof typeof NON_PRODUCT_FILTERS.patterns> = [
    'tours', 'merchandise', 'beer', 'articles', 'retail', 'cocktails', 'food', 'events'
  ];
  
  for (const category of categories) {
    if (containsNonProductPatterns(fullText, category)) {
      foundNonProduct = true;
      foundCategory = category;
      break;
    }
  }
  
  console.log(`   Content check: ${foundNonProduct ? `Non-product (${foundCategory})` : 'Clean'}`);
  
  // Test spirit indicators
  const hasSpirit = hasRequiredSpiritIndicators(fullText);
  const hasAlcohol = hasAlcoholContent(fullText);
  
  console.log(`   Spirit indicators: ${hasSpirit ? 'YES' : 'NO'}`);
  console.log(`   Alcohol content: ${hasAlcohol ? 'YES' : 'NO'}`);
  
  // Determine if it would be filtered
  const wouldBeFiltered = foundNonProduct || urlCheck.isNonProduct || (!hasSpirit && !testCase.shouldPass);
  const result = wouldBeFiltered !== testCase.shouldPass;
  
  console.log(`   Result: ${result ? 'PASS ✅' : 'FAIL ❌'}`);
  
  if (result) {
    passed++;
  } else {
    failed++;
    console.log(`   ⚠️  UNEXPECTED RESULT!`);
  }
}

console.log(`\n\n📊 Test Results:`);
console.log(`   Passed: ${passed}/${testCases.length}`);
console.log(`   Failed: ${failed}/${testCases.length}`);
console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);

// Test specific patterns from latest CSV
console.log('\n🔍 Testing Specific Problem Patterns...\n');

const problemPatterns = [
  { text: "Goose Island Bourbon County Stout", category: "beer" },
  { text: "Retail Bourbon-bhg", category: "retail" },
  { text: "Buffalo Trace's Single Estate Farm Continues Expansion", category: "articles" },
  { text: "Founder's Original Bourbon Sour", category: "cocktails" },
  { text: "holiday cask strength single barrels", category: "retail" },
  { text: "Men's White Polo Shirt", category: "merchandise" },
  { text: "Kentucky Distillery & Bourbon Tours", category: "tours" },
  { text: "Whiskey Trail Home", category: "tours" },
];

for (const { text, category } of problemPatterns) {
  const isNonProduct = containsNonProductPatterns(text, category as any);
  console.log(`"${text}" -> ${category}: ${isNonProduct ? 'FILTERED ✅' : 'NOT FILTERED ❌'}`);
}