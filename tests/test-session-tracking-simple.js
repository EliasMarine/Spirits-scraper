#!/usr/bin/env node

/**
 * Simple test script for V2.5.2 Smart Session Tracking
 * This is a JavaScript version that imports the compiled modules
 */

const { ultraEfficientScraper } = require('./dist/services/ultra-efficient-scraper.js');
const { scrapeSessionTracker } = require('./dist/services/scrape-session-tracker.js');
const { cacheService } = require('./dist/services/cache-service.js');
const { apiCallTracker } = require('./dist/services/api-call-tracker.js');

// Test configuration
const TEST_CATEGORY = 'bourbon';
const ALT_CATEGORY = 'scotch';
const SMALL_LIMIT = 5;
const LARGE_LIMIT = 10;

// Color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

// Test result tracking
const testResults = [];

/**
 * Run a single test scenario
 */
async function runTest(testName, category, limit, expectSkip = false, clearSession = false) {
  console.log(`\n${COLORS.bright}${COLORS.blue}▶ Running Test: ${testName}${COLORS.reset}`);
  console.log(`  Category: ${category}, Limit: ${limit}, Expect Skip: ${expectSkip}`);
  
  const result = {
    testName,
    passed: false,
    apiCalls: 0,
    spiritsFound: 0,
    spiritsStored: 0,
    skipped: false
  };

  try {
    // Clear session if requested
    if (clearSession) {
      console.log(`  ${COLORS.yellow}Clearing session for ${category}...${COLORS.reset}`);
      await scrapeSessionTracker.clearSession(category);
    }

    // Check current API usage before test
    const apiUsageBefore = apiCallTracker.getTotalAPICalls();
    console.log(`  API calls before: ${apiUsageBefore}`);

    // Check if scraper will skip
    const skipCheck = await scrapeSessionTracker.shouldSkipCategory(category, limit);
    console.log(`  Skip check result: ${skipCheck.skip ? 'YES' : 'NO'}${skipCheck.reason ? ` - ${skipCheck.reason}` : ''}`);

    // Run the scraper
    const startTime = Date.now();
    const metrics = await ultraEfficientScraper.scrapeWithUltraEfficiency({
      category,
      limit,
      targetEfficiency: 60,
      deepExtraction: false // Don't fetch catalog pages for tests
    });
    const duration = Date.now() - startTime;

    // Get API usage after test
    const apiUsageAfter = apiCallTracker.getTotalAPICalls();
    const actualApiCalls = apiUsageAfter - apiUsageBefore;

    // Fill in result data
    result.apiCalls = actualApiCalls;
    result.spiritsFound = metrics.spiritsFound;
    result.spiritsStored = metrics.spiritsStored;
    result.skipped = skipCheck.skip;
    result.skipReason = skipCheck.reason;

    // Check if test passed
    if (expectSkip) {
      // Should have skipped and made no API calls
      result.passed = skipCheck.skip && actualApiCalls === 0;
      if (!result.passed) {
        result.error = `Expected to skip but made ${actualApiCalls} API calls`;
      }
    } else {
      // Should not have skipped and made API calls
      result.passed = !skipCheck.skip && actualApiCalls > 0;
      if (!result.passed) {
        result.error = skipCheck.skip ? 'Unexpectedly skipped' : 'No API calls made';
      }
    }

    // Log results
    console.log(`  ${COLORS.bright}Results:${COLORS.reset}`);
    console.log(`    - API Calls: ${actualApiCalls}`);
    console.log(`    - Spirits Found: ${metrics.spiritsFound}`);
    console.log(`    - Spirits Stored: ${metrics.spiritsStored}`);
    console.log(`    - Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`    - ${result.passed ? `${COLORS.green}✓ PASSED` : `${COLORS.red}✗ FAILED`}${COLORS.reset}`);
    
    if (result.error) {
      console.log(`    - ${COLORS.red}Error: ${result.error}${COLORS.reset}`);
    }

    // Get session stats
    const sessionStats = scrapeSessionTracker.getSessionStats(category);
    if (sessionStats) {
      console.log(`  ${COLORS.bright}Session Stats:${COLORS.reset}`);
      console.log(`    - Unique Spirits: ${sessionStats.uniqueSpirits}`);
      console.log(`    - Queries Processed: ${sessionStats.queriesProcessed}`);
    }

  } catch (error) {
    result.error = error.message || String(error);
    console.log(`  ${COLORS.red}✗ ERROR: ${result.error}${COLORS.reset}`);
  }

  testResults.push(result);
  return result;
}

/**
 * Display final test summary
 */
function displaySummary() {
  console.log(`\n${COLORS.bright}${COLORS.magenta}${'='.repeat(80)}`);
  console.log('TEST SUMMARY');
  console.log('='.repeat(80) + COLORS.reset);

  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const totalApiCalls = testResults.reduce((sum, r) => sum + r.apiCalls, 0);

  console.log(`\n${COLORS.bright}Overall Results:${COLORS.reset}`);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  ${COLORS.green}Passed: ${passedTests}${COLORS.reset}`);
  console.log(`  ${COLORS.red}Failed: ${failedTests}${COLORS.reset}`);
  console.log(`  Total API Calls Used: ${totalApiCalls}`);

  console.log(`\n${COLORS.bright}Test Details:${COLORS.reset}`);
  testResults.forEach((result, index) => {
    const status = result.passed ? `${COLORS.green}✓` : `${COLORS.red}✗`;
    console.log(`\n${index + 1}. ${status} ${result.testName}${COLORS.reset}`);
    console.log(`   - API Calls: ${result.apiCalls}`);
    console.log(`   - Spirits Found/Stored: ${result.spiritsFound}/${result.spiritsStored}`);
    if (result.skipped) {
      console.log(`   - Skipped: ${result.skipReason}`);
    }
    if (result.error) {
      console.log(`   - ${COLORS.red}Error: ${result.error}${COLORS.reset}`);
    }
  });

  // Final verdict
  console.log(`\n${COLORS.bright}${COLORS.magenta}${'='.repeat(80)}${COLORS.reset}`);
  if (failedTests === 0) {
    console.log(`${COLORS.bright}${COLORS.green}✅ ALL TESTS PASSED! Session tracking is working correctly.${COLORS.reset}`);
  } else {
    console.log(`${COLORS.bright}${COLORS.red}❌ ${failedTests} TEST(S) FAILED! Session tracking needs fixes.${COLORS.reset}`);
  }
  console.log(`${COLORS.bright}${COLORS.magenta}${'='.repeat(80)}${COLORS.reset}\n`);
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${COLORS.bright}${COLORS.magenta}${'='.repeat(80)}`);
  console.log('V2.5.2 SMART SESSION TRACKING TEST SUITE');
  console.log('='.repeat(80) + COLORS.reset);
  console.log('\nThis test suite verifies that the session tracking prevents redundant API calls');
  console.log('and correctly manages scraping state across multiple runs.\n');

  try {
    // 0. Clear all caches to start fresh
    console.log(`${COLORS.yellow}📦 Clearing all caches to start fresh...${COLORS.reset}`);
    await cacheService.clear();
    console.log(`${COLORS.green}✓ Caches cleared${COLORS.reset}`);

    // 1. Initial scrape - establish baseline
    await runTest(
      'Initial Scrape (Baseline)',
      TEST_CATEGORY,
      SMALL_LIMIT,
      false, // Should not skip
      false  // Don't clear session
    );

    // Wait a bit to ensure cache is written
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Same category, same limit - should skip
    await runTest(
      'Same Category & Limit (Should Skip)',
      TEST_CATEGORY,
      SMALL_LIMIT,
      true,  // Should skip
      false  // Don't clear session
    );

    // 3. Same category, higher limit - should fetch more
    await runTest(
      'Same Category, Higher Limit (Should Fetch More)',
      TEST_CATEGORY,
      LARGE_LIMIT,
      false, // Should not skip (needs more spirits)
      false  // Don't clear session
    );

    // 4. Same category, same higher limit again - should skip
    await runTest(
      'Same Category & Higher Limit Again (Should Skip)',
      TEST_CATEGORY,
      LARGE_LIMIT,
      true,  // Should skip now
      false  // Don't clear session
    );

    // 5. Different category - should not skip
    await runTest(
      'Different Category (Should Not Skip)',
      ALT_CATEGORY,
      SMALL_LIMIT,
      false, // Should not skip
      false  // Don't clear session
    );

    // 6. Back to first category after clearing session - should not skip
    await runTest(
      'After Clearing Session (Should Not Skip)',
      TEST_CATEGORY,
      SMALL_LIMIT,
      false, // Should not skip
      true   // Clear session first
    );

    // 7. Test session persistence - save and reload
    console.log(`\n${COLORS.bright}${COLORS.blue}▶ Testing Session Persistence${COLORS.reset}`);
    
    // First, do a scrape to create a session
    await runTest(
      'Create Session for Persistence Test',
      'vodka',
      SMALL_LIMIT,
      false,
      true // Clear any existing session
    );

    // Force save the session
    await scrapeSessionTracker.saveSession('vodka');
    
    // Clear in-memory sessions to simulate restart
    console.log(`  ${COLORS.yellow}Simulating application restart...${COLORS.reset}`);
    // Clear the in-memory sessions (this is a hack for testing)
    if (scrapeSessionTracker.sessions) {
      scrapeSessionTracker.sessions.clear();
    }
    
    // Try to scrape again - should skip due to loaded session
    await runTest(
      'After Simulated Restart (Should Skip)',
      'vodka',
      SMALL_LIMIT,
      true,  // Should skip
      false  // Don't clear session
    );

  } catch (error) {
    console.error(`${COLORS.red}Fatal error during tests:`, error, COLORS.reset);
  }

  // Display summary
  displaySummary();

  // Exit with appropriate code
  process.exit(testResults.some(r => !r.passed) ? 1 : 0);
}

// Run tests
console.log(`${COLORS.yellow}Starting test suite...${COLORS.reset}\n`);
runAllTests().catch(error => {
  console.error(`${COLORS.red}Unhandled error:`, error, COLORS.reset);
  process.exit(1);
});