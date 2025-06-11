#!/usr/bin/env node

import { EnhancedQueryGenerator } from './src/services/enhanced-query-generator.js';

const generator = new EnhancedQueryGenerator();

console.log('=== WHISKEY QUERIES (Sample of 10) ===');
const whiskeyQueries = generator.generateCategoryDiscoveryQueries('whiskey', 20);
whiskeyQueries.slice(0, 10).forEach((query, idx) => {
  console.log(`${idx + 1}. ${query}`);
});

console.log('\n=== MEZCAL QUERIES (Sample of 10) ===');
const mezcalQueries = generator.generateCategoryDiscoveryQueries('mezcal', 20);
mezcalQueries.slice(0, 10).forEach((query, idx) => {
  console.log(`${idx + 1}. ${query}`);
});

// Show what products are being searched
console.log('\n=== SAMPLE WHISKEY PRODUCTS ===');
const whiskeyProducts = new Set<string>();
whiskeyQueries.forEach(q => {
  const match = q.match(/(?:site:\S+\s+)?([^()]+?)(?:\s+price|\s+750ml|\s+in stock|\s+near me|$)/);
  if (match && match[1]) {
    const product = match[1].replace(/^\(.*?\)\s*/, '').trim();
    if (product && !product.includes(' OR ')) {
      whiskeyProducts.add(product);
    }
  }
});

Array.from(whiskeyProducts).slice(0, 8).forEach(product => {
  console.log(`- ${product}`);
});

console.log('\n=== SAMPLE MEZCAL PRODUCTS ===');
const mezcalProducts = new Set<string>();
mezcalQueries.forEach(q => {
  const match = q.match(/(?:site:\S+\s+)?([^()]+?)(?:\s+price|\s+750ml|\s+in stock|\s+near me|$)/);
  if (match && match[1]) {
    const product = match[1].replace(/^\(.*?\)\s*/, '').trim();
    if (product && !product.includes(' OR ')) {
      mezcalProducts.add(product);
    }
  }
});

Array.from(mezcalProducts).slice(0, 8).forEach(product => {
  console.log(`- ${product}`);
});