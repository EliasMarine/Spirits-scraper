import { comprehensiveDataQualityValidator } from '../src/services/comprehensive-data-quality-rules.js';

/**
 * Test Enhanced Validation System
 * Tests the V3.1.6 improvements against problematic entries from spirits_rows-7.csv
 */

// Problematic entries extracted from spirits_rows-7.csv
const problematicEntries = [
  {
    name: "Speyside Single Malt Scotch Reviews Ratings And Facts Best",
    source_url: "https://www.tastings.com/Spirits-Categories/About-Scotch-Whisky/Speyside-Single-Malt-Scotch-Category.aspx",
    reason: "Article/review page title"
  },
  {
    name: "If You Had To Choose Just 10 Bottles Of Single Malt Scotch Malt",
    source_url: "https://www.scotchmaltwhisky.co.uk/forum/viewtopic.php?t=5485",
    reason: "Blog post/forum discussion title"
  },
  {
    name: "Headbangers Whisky Glenlivet Founders Reserve Glenlivet 12 Year Old",
    source_url: "https://whiskygospel.com/2015/06/25/headbangers-whisky-review-glenlivet-founders-reserve-vs-glenlivet-12-year-old/",
    reason: "Blog post title with product comparison"
  },
  {
    name: "Game Of Thrones Single Malts Words Of Whisky A Whisky Blog",
    source_url: "https://wordsofwhisky.com/review-game-of-thrones-single-malts-2018/",
    reason: "Blog article about whisky collection"
  },
  {
    name: "My Top 5 List Of Sherry Finished Scotch Under Taste The Dram",
    source_url: "https://www.tastethedram.com/single-post/2017/02/27/top5-sherry-under-75/",
    reason: "Top X list article"
  },
  {
    name: "Scotch 18 Year Old Whisky",
    source_url: "https://www.masterofmalt.com/age-country/scotch/18-year-old-whisky/",
    reason: "Generic category page"
  },
  {
    name: "Year Old Single Malt Scotch Whisky",
    source_url: "https://www.caskers.com/dalmore-distillery-25-year-old-single-malt-scotch-whisky/",
    reason: "Incomplete product name"
  }
];

// Good entries that should pass validation
const validEntries = [
  {
    name: "Glenlivet 12 Year Old Double Oak Scotch Whisky",
    source_url: "https://www.thewhiskyexchange.com/p/2393/glenlivet-12-year-old-double-oak",
    reason: "Valid product with specific brand and expression"
  },
  {
    name: "Macallan 18 Year Old Sherry Oak Single Malt Scotch Whisky",
    source_url: "https://www.caskers.com/macallan-18-year-old-sherry-oak-single-malt-scotch-whisky/",
    reason: "Valid specific product"
  },
  {
    name: "Jack Daniel's Old No. 7 Tennessee Whiskey",
    source_url: "https://www.totalwine.com/spirits/american-whiskey/tennessee-whiskey/jack-daniels-old-no-7/p/3262750",
    reason: "Valid branded product"
  }
];

interface TestResult {
  name: string;
  source_url: string;
  reason: string;
  shouldReject: boolean;
  wasRejected: boolean;
  hasCriticalErrors: boolean;
  score: number;
  canStore: boolean;
  errors: string[];
  warnings: string[];
}

function testEntry(entry: any, shouldReject: boolean): TestResult {
  console.log(`\n🧪 Testing: "${entry.name}"`);
  console.log(`   URL: ${entry.source_url}`);
  console.log(`   Expected: ${shouldReject ? 'REJECT' : 'ACCEPT'}`);

  // Test with comprehensive validator
  const validation = comprehensiveDataQualityValidator.validate({
    name: entry.name,
    source_url: entry.source_url,
    description: "",
    category: "Other"
  });

  // Test with hasCriticalErrors (early rejection)
  const hasCriticalErrors = comprehensiveDataQualityValidator.hasCriticalErrors({
    name: entry.name,
    source_url: entry.source_url
  });

  const wasRejected = !validation.canStore || hasCriticalErrors;
  const testPassed = wasRejected === shouldReject;

  console.log(`   Result: ${wasRejected ? 'REJECTED' : 'ACCEPTED'} - ${testPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Critical Errors: ${hasCriticalErrors ? 'YES' : 'NO'}`);
  console.log(`   Quality Score: ${validation.score}/100`);
  console.log(`   Can Store: ${validation.canStore ? 'YES' : 'NO'}`);

  if (validation.errors.length > 0) {
    console.log(`   Errors (${validation.errors.length}):`);
    validation.errors.forEach(error => {
      console.log(`     - ${error.code}: ${error.message}`);
    });
  }

  if (validation.warnings.length > 0) {
    console.log(`   Warnings (${validation.warnings.length}):`);
    validation.warnings.forEach(warning => {
      console.log(`     - ${warning.code}: ${warning.message}`);
    });
  }

  return {
    name: entry.name,
    source_url: entry.source_url,
    reason: entry.reason,
    shouldReject,
    wasRejected,
    hasCriticalErrors,
    score: validation.score,
    canStore: validation.canStore,
    errors: validation.errors.map(e => `${e.code}: ${e.message}`),
    warnings: validation.warnings.map(w => `${w.code}: ${w.message}`)
  };
}

function main() {
  console.log('🔍 ENHANCED VALIDATION SYSTEM TEST');
  console.log('Testing V3.1.6 improvements against problematic entries from spirits_rows-7.csv');
  console.log('='.repeat(80));

  const results: TestResult[] = [];

  console.log('\n📋 TESTING PROBLEMATIC ENTRIES (Should be REJECTED):');
  console.log('-'.repeat(60));
  
  problematicEntries.forEach(entry => {
    const result = testEntry(entry, true);
    results.push(result);
  });

  console.log('\n✅ TESTING VALID ENTRIES (Should be ACCEPTED):');
  console.log('-'.repeat(60));
  
  validEntries.forEach(entry => {
    const result = testEntry(entry, false);
    results.push(result);
  });

  // Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log('='.repeat(80));
  
  const totalTests = results.length;
  const passed = results.filter(r => r.wasRejected === r.shouldReject).length;
  const failed = totalTests - passed;
  
  const problematicRejected = results.filter(r => r.shouldReject && r.wasRejected).length;
  const validAccepted = results.filter(r => !r.shouldReject && !r.wasRejected).length;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passed} (${Math.round(passed/totalTests*100)}%)`);
  console.log(`Failed: ${failed} (${Math.round(failed/totalTests*100)}%)`);
  console.log('');
  console.log(`Problematic Entries Correctly Rejected: ${problematicRejected}/${problematicEntries.length}`);
  console.log(`Valid Entries Correctly Accepted: ${validAccepted}/${validEntries.length}`);

  // Failed tests details
  const failedTests = results.filter(r => r.wasRejected !== r.shouldReject);
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(test => {
      console.log(`- "${test.name}"`);
      console.log(`  Expected: ${test.shouldReject ? 'REJECT' : 'ACCEPT'}, Got: ${test.wasRejected ? 'REJECT' : 'ACCEPT'}`);
      console.log(`  Reason: ${test.reason}`);
    });
  }

  // Success rate by category
  console.log('\n🎯 EFFECTIVENESS:');
  const blogArticleTests = results.filter(r => r.reason.includes('Blog') || r.reason.includes('Article') || r.reason.includes('review'));
  const forumTests = results.filter(r => r.reason.includes('forum') || r.reason.includes('discussion'));
  const genericTests = results.filter(r => r.reason.includes('Generic') || r.reason.includes('Incomplete'));
  
  if (blogArticleTests.length > 0) {
    const blogSuccess = blogArticleTests.filter(r => r.wasRejected === r.shouldReject).length;
    console.log(`Blog/Article Detection: ${blogSuccess}/${blogArticleTests.length} (${Math.round(blogSuccess/blogArticleTests.length*100)}%)`);
  }
  
  if (forumTests.length > 0) {
    const forumSuccess = forumTests.filter(r => r.wasRejected === r.shouldReject).length;
    console.log(`Forum/Discussion Detection: ${forumSuccess}/${forumTests.length} (${Math.round(forumSuccess/forumTests.length*100)}%)`);
  }
  
  if (genericTests.length > 0) {
    const genericSuccess = genericTests.filter(r => r.wasRejected === r.shouldReject).length;
    console.log(`Generic/Incomplete Detection: ${genericSuccess}/${genericTests.length} (${Math.round(genericSuccess/genericTests.length*100)}%)`);
  }

  console.log('\n🚀 VALIDATION SYSTEM STATUS:');
  if (passed === totalTests) {
    console.log('✅ ALL TESTS PASSED - Enhanced validation is working correctly!');
  } else if (passed >= totalTests * 0.9) {
    console.log('🟡 MOSTLY WORKING - Minor adjustments may be needed');
  } else {
    console.log('❌ NEEDS IMPROVEMENT - Validation patterns need refinement');
  }
}

main();