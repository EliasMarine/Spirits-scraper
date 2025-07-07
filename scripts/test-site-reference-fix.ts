import { whiskyWhiskeyNormalizer } from '../src/services/whisky-whiskey-normalizer.js';

/**
 * Test Site Reference Detection Fix
 * Validates that legitimate entries ending with "| The" are not flagged as site references
 */

const testCases = [
  {
    name: "Overrated Bourbon (and Whiskey) What To Drink Instead | The",
    shouldBeProblematic: false,
    reason: "Legitimate article title ending with '| The' - not a site reference"
  },
  {
    name: "Best Whiskey Under $50 | The",
    shouldBeProblematic: false,
    reason: "Article title with pipe separator - not a site reference"
  },
  {
    name: "Whiskey Review: Buffalo Trace | The",
    shouldBeProblematic: false,
    reason: "Review article title with pipe - not a site reference"
  },
  {
    name: "Buffalo Trace Bourbon The",
    shouldBeProblematic: true,
    reason: "Product name ending with 'The' (incomplete site reference)"
  },
  {
    name: "Jack Daniel's Old No. 7 The Whisky",
    shouldBeProblematic: true,
    reason: "Product name ending with 'The Whisky' (site reference)"
  },
  {
    name: "Macallan 18 Whisky Exchange",
    shouldBeProblematic: true,
    reason: "Product name with site name 'Whisky Exchange'"
  }
];

function main() {
  console.log('🔍 SITE REFERENCE DETECTION FIX TEST');
  console.log('Testing V3.1.6 fix for over-aggressive "| The" pattern detection');
  console.log('='.repeat(80));

  let totalTests = 0;
  let passedTests = 0;

  testCases.forEach((testCase, index) => {
    console.log(`\n🧪 Test ${index + 1}: "${testCase.name}"`);
    console.log(`   Expected: ${testCase.shouldBeProblematic ? 'PROBLEMATIC' : 'NOT PROBLEMATIC'}`);
    console.log(`   Reason: ${testCase.reason}`);

    const analysis = whiskyWhiskeyNormalizer.hasProblematicPatterns(testCase.name);
    const actualResult = analysis.hasProblems;

    const testPassed = actualResult === testCase.shouldBeProblematic;
    const result = testPassed ? '✅ PASS' : '❌ FAIL';
    
    console.log(`   Result: ${actualResult ? 'PROBLEMATIC' : 'NOT PROBLEMATIC'} - ${result}`);
    
    if (analysis.hasProblems) {
      console.log(`   Issues Found: ${analysis.issues.join(', ')}`);
      console.log(`   Should Delete: ${analysis.shouldDelete ? 'YES' : 'NO'}`);
    }

    totalTests++;
    if (testPassed) passedTests++;

    if (!testPassed) {
      console.log(`   ❌ FAILURE DETAILS:`);
      console.log(`      Expected: ${testCase.shouldBeProblematic ? 'problematic' : 'not problematic'}`);
      console.log(`      Got: ${actualResult ? 'problematic' : 'not problematic'}`);
    }
  });

  console.log('\n📊 TEST SUMMARY:');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`Failed: ${totalTests - passedTests} (${Math.round((totalTests - passedTests)/totalTests*100)}%)`);

  console.log('\n🚀 SITE REFERENCE DETECTION STATUS:');
  if (passedTests === totalTests) {
    console.log('✅ ALL TESTS PASSED - Site reference detection is working correctly!');
    console.log('✅ FIX SUCCESSFUL: "| The" patterns are no longer over-aggressive');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('🟡 MOSTLY WORKING - Minor adjustments may be needed');
  } else {
    console.log('❌ NEEDS IMPROVEMENT - Site reference detection patterns need refinement');
  }
}

main();