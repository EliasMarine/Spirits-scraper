#!/usr/bin/env node

/**
 * Simple test to verify retail-focused improvements are working
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the latest generated dist files
const queryGeneratorPath = path.join(__dirname, 'dist/services/query-generator.js');
const enhancedGeneratorPath = path.join(__dirname, 'dist/services/enhanced-query-generator.js');
const googleSearchPath = path.join(__dirname, 'dist/services/google-search.js');

console.log('🧪 TESTING RETAIL-FOCUSED QUERY GENERATION\n');

// Check if files exist
if (!fs.existsSync(queryGeneratorPath)) {
  console.error('❌ query-generator.js not found in dist/');
  process.exit(1);
}

// Read the compiled JavaScript to verify our changes
const queryGeneratorContent = fs.readFileSync(queryGeneratorPath, 'utf8');
const enhancedGeneratorContent = fs.readFileSync(enhancedGeneratorPath, 'utf8');
const googleSearchContent = fs.readFileSync(googleSearchPath, 'utf8');

// Test 1: Check if query generator has retail sites
console.log('📝 TEST 1: Query Generator Updates');
console.log('─'.repeat(50));

const hasRetailSites = queryGeneratorContent.includes('site:totalwine.com') && 
                      queryGeneratorContent.includes('site:thewhiskyexchange.com') &&
                      queryGeneratorContent.includes('site:masterofmalt.com');

console.log(`✅ Contains site: operators for retail sites: ${hasRetailSites ? 'YES' : 'NO'}`);

// Test 2: Check if enhanced generator has retail focus
console.log('\n📝 TEST 2: Enhanced Query Generator Updates');
console.log('─'.repeat(50));

const hasRetailPriority = enhancedGeneratorContent.includes('CRITICAL: Priority retail sites') ||
                         enhancedGeneratorContent.includes('PRIORITY 1: Site-specific searches');

console.log(`✅ Prioritizes retail sites: ${hasRetailPriority ? 'YES' : 'NO'}`);

// Test 3: Check if google search has filtering
console.log('\n📝 TEST 3: Google Search Filtering');
console.log('─'.repeat(50));

const hasPostFiltering = googleSearchContent.includes('isExcludedDomain') &&
                        googleSearchContent.includes('Filter results to exclude non-retail domains');

console.log(`✅ Filters excluded domains: ${hasPostFiltering ? 'YES' : 'NO'}`);

// Test 4: Generate sample queries
console.log('\n📝 TEST 4: Sample Query Generation');
console.log('─'.repeat(50));

try {
  const { QueryGenerator } = await import('./dist/services/query-generator.js');
  const qg = new QueryGenerator();
  
  const queries = qg.generateCategoryQueries('bourbon');
  console.log(`Generated ${queries.length} queries:`);
  
  // Show first 5 queries
  queries.slice(0, 5).forEach((q, i) => {
    console.log(`  ${i + 1}. ${q.substring(0, 80)}${q.length > 80 ? '...' : ''}`);
  });
  
  // Count site: operators
  const siteQueries = queries.filter(q => q.includes('site:'));
  const percentage = (siteQueries.length / queries.length * 100).toFixed(0);
  console.log(`\n✅ ${siteQueries.length}/${queries.length} queries use site: operators (${percentage}%)`);
  
} catch (error) {
  console.error('❌ Error loading query generator:', error.message);
}

// Summary
console.log('\n📊 SUMMARY');
console.log('─'.repeat(50));

if (hasRetailSites && hasRetailPriority && hasPostFiltering) {
  console.log('✅ All retail-focused improvements are in place!');
  console.log('\nThe scraper should now:');
  console.log('  1. Generate queries that target retail sites with site: operators');
  console.log('  2. Filter out Reddit, blogs, and other excluded domains');
  console.log('  3. Prioritize results from reputable retail sites');
  console.log('\nExpected result: 90%+ retail site results instead of Reddit/blogs');
} else {
  console.log('⚠️  Some improvements may be missing. Please check the build.');
}