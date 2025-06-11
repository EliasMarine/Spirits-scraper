#!/usr/bin/env node

import { EnhancedQueryGenerator } from './src/services/enhanced-query-generator.js';

console.log('Testing new realistic query generation...\n');

const generator = new EnhancedQueryGenerator();

// Test bourbon queries
console.log('=== BOURBON QUERIES (Sample of 20) ===');
const bourbonQueries = generator.generateCategoryDiscoveryQueries('bourbon', 50);
bourbonQueries.slice(0, 20).forEach((query, idx) => {
  console.log(`${idx + 1}. ${query}`);
});

console.log('\n=== SCOTCH QUERIES (Sample of 10) ==='); 
const scotchQueries = generator.generateCategoryDiscoveryQueries('scotch', 30);
scotchQueries.slice(0, 10).forEach((query, idx) => {
  console.log(`${idx + 1}. ${query}`);
});

console.log('\n=== TEQUILA QUERIES (Sample of 10) ===');
const tequilaQueries = generator.generateCategoryDiscoveryQueries('tequila', 30);
tequilaQueries.slice(0, 10).forEach((query, idx) => {
  console.log(`${idx + 1}. ${query}`);
});

// Show distribution of query types
console.log('\n=== QUERY ANALYSIS ===');
const allQueries = bourbonQueries.slice(0, 50);
const siteSpecific = allQueries.filter(q => q.includes('site:')).length;
const multiSite = allQueries.filter(q => q.includes(' OR ')).length;
const natural = allQueries.filter(q => !q.includes('site:') && !q.includes(' OR ')).length;

console.log(`Site-specific product searches: ${siteSpecific} (${(siteSpecific/50*100).toFixed(0)}%)`);
console.log(`Multi-site OR searches: ${multiSite} (${(multiSite/50*100).toFixed(0)}%)`);
console.log(`Natural searches: ${natural} (${(natural/50*100).toFixed(0)}%)`);

// Show some actual products being searched
console.log('\n=== SAMPLE PRODUCTS BEING SEARCHED ===');
const products = new Set<string>();
allQueries.forEach(q => {
  // Extract product name from query
  const match = q.match(/(?:site:\S+\s+)?([^()]+?)(?:\s+price|\s+750ml|\s+in stock|\s+near me|$)/);
  if (match && match[1]) {
    const product = match[1].replace(/^\(.*?\)\s*/, '').trim();
    if (product && !product.includes(' OR ')) {
      products.add(product);
    }
  }
});

Array.from(products).slice(0, 15).forEach(product => {
  console.log(`- ${product}`);
});