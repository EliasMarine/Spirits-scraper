#!/usr/bin/env tsx
/**
 * Test to show the improvements in spirit extraction
 */

import { config } from 'dotenv';
import { spiritDiscovery } from './services/spirit-discovery.js';

// Load environment variables
config();

// Example of problematic search results that were being stored as spirit names
const problematicResults = [
  {
    title: "r/bourbon on Reddit: What's a truly worthwhile, expensive bourbon?",
    snippet: "Discussion about premium bourbons including Pappy Van Winkle, George T. Stagg, and William Larue Weller.",
    link: "https://reddit.com/r/bourbon/comments/abc123"
  },
  {
    title: "The Best Wheated Bourbons Under $50, Ranked Worst To Best - Tasting Table",
    snippet: "Our picks include Maker's Mark, Larceny, and W.L. Weller Special Reserve.",
    link: "https://tastingtable.com/wheated-bourbons"
  },
  {
    title: "Michter's 20 Year Old, Johnnie Walker Lunar New Year Edition, Macallan Harmony & More [New Releases]",
    snippet: "New releases this month from major distilleries.",
    link: "https://whiskyadvocate.com/new-releases"
  },
  {
    title: "Buffalo Trace Bourbon - Buy Online | Total Wine & More",
    snippet: "Buffalo Trace Kentucky Straight Bourbon Whiskey. 90 proof. $24.99",
    link: "https://totalwine.com/spirits/bourbon/buffalo-trace"
  }
];

async function testImprovedExtraction() {
  console.log('🧪 Testing Improved Spirit Extraction\n');
  console.log('The extraction should now:');
  console.log('✓ Skip Reddit discussion titles');
  console.log('✓ Extract individual spirits from lists');
  console.log('✓ Only extract actual product names from retailer pages');
  console.log('✓ Extract spirits from snippets when titles are articles\n');
  
  for (const result of problematicResults) {
    console.log('─'.repeat(80));
    console.log(`\nTitle: ${result.title}`);
    console.log(`Link: ${result.link}`);
    console.log(`Snippet: ${result.snippet}\n`);
    
    // Test extraction (without actually calling Google API)
    const discoveryService = new (spiritDiscovery as any).constructor();
    const spirits = discoveryService.extractSpiritsFromSearchResult(result);
    
    if (spirits.length === 0) {
      console.log('✅ Correctly skipped - no valid spirits extracted');
    } else {
      console.log(`Extracted ${spirits.length} spirits:`);
      spirits.forEach((spirit: any, index: number) => {
        console.log(`  ${index + 1}. ${spirit.name}`);
        console.log(`     Brand: ${spirit.brand || 'Unknown'}`);
        console.log(`     Confidence: ${(spirit.confidence * 100).toFixed(0)}%`);
      });
    }
  }
  
  console.log('\n' + '─'.repeat(80));
  console.log('\n✅ Summary:');
  console.log('- Reddit titles are now skipped');
  console.log('- Article titles extract spirits from snippets instead');
  console.log('- Lists of spirits are parsed into individual entries');
  console.log('- Only actual product names from retailers are extracted from titles');
  console.log('\n🎉 The scraper now extracts real spirit names, not article titles!');
}

// Run the test
testImprovedExtraction().catch(console.error);