#!/usr/bin/env tsx

import { config } from 'dotenv';
import { GoogleSearchClient } from '../src/services/google-search.js';

// Load environment variables
config();

async function testGoogleAPI() {
  console.log('🧪 Testing Google Search API...\n');
  
  const client = new GoogleSearchClient();
  
  try {
    // Simple test query
    const testQuery = 'Buffalo Trace bourbon whiskey price';
    console.log(`📍 Test Query: "${testQuery}"`);
    
    const result = await client.search({ 
      query: testQuery,
      resultLimit: 5
    });
    
    console.log('\n✅ API Response received!');
    console.log(`Found ${result.items?.length || 0} results\n`);
    
    if (result.items && result.items.length > 0) {
      console.log('First 3 results:');
      result.items.slice(0, 3).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`   URL: ${item.link}`);
        console.log(`   Snippet: ${item.snippet?.substring(0, 100)}...`);
      });
    }
    
    // Check search information
    if (result.searchInformation) {
      console.log('\n📊 Search Information:');
      console.log(`   Total Results: ${result.searchInformation.totalResults}`);
      console.log(`   Search Time: ${result.searchInformation.searchTime}s`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    
    // Check if it's an API key issue
    if (error.message?.includes('API key')) {
      console.log('\n⚠️  API Key Issue - Check your credentials:');
      console.log(`   GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? 'Set' : 'Missing'}`);
      console.log(`   SEARCH_ENGINE_ID: ${process.env.SEARCH_ENGINE_ID ? 'Set' : 'Missing'}`);
    }
    
    return false;
  }
}

// Run test
testGoogleAPI().then(success => {
  console.log('\n' + '='.repeat(60));
  console.log(`Test Result: ${success ? '✅ PASSED' : '❌ FAILED'}`);
  process.exit(success ? 0 : 1);
});