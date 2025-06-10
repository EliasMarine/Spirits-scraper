import { googleSearchClient } from './src/services/google-search.js';
import { logger } from './src/utils/logger.js';
import { getSearchExclusions } from './src/config/excluded-domains.js';

async function debugSearchResults() {
  logger.info('🔍 Debugging search results to find price data...');
  
  try {
    const exclusions = getSearchExclusions();
    const query = `site:totalwine.com "Buffalo Trace" catalog products ${exclusions}`;
    
    logger.info(`Query: ${query}`);
    
    const searchResults = await googleSearchClient.search({
      query,
      num: 3
    });
    
    if (searchResults.items) {
      logger.info(`\n📊 Search Results (${searchResults.items.length} items):\n`);
      
      searchResults.items.forEach((item, index) => {
        logger.info(`\n========== Result ${index + 1} ==========`);
        logger.info(`Title: ${item.title}`);
        logger.info(`Link: ${item.link}`);
        logger.info(`\nSnippet: ${item.snippet}`);
        
        // Check for structured data
        if (item.pagemap) {
          logger.info('\n📦 Structured Data:');
          if (item.pagemap.product) {
            logger.info('Product data:', JSON.stringify(item.pagemap.product, null, 2));
          }
          if (item.pagemap.offer) {
            logger.info('Offer data:', JSON.stringify(item.pagemap.offer, null, 2));
          }
          if (item.pagemap.metatags) {
            const meta = item.pagemap.metatags[0];
            if (meta['product:price:amount']) {
              logger.info(`Price in metatags: ${meta['product:price:amount']}`);
            }
          }
        }
        
        // Look for price patterns in snippet
        const pricePatterns = [
          /\$(\d+(?:\.\d{2})?)/g,
          /(\d+(?:\.\d{2})?)\s*USD/gi,
          /price[:\s]+\$?(\d+(?:\.\d{2})?)/gi
        ];
        
        let foundPrices = false;
        pricePatterns.forEach(pattern => {
          const matches = item.snippet.matchAll(pattern);
          for (const match of matches) {
            logger.info(`Price found in snippet: ${match[0]}`);
            foundPrices = true;
          }
        });
        
        if (!foundPrices) {
          logger.info('No prices found in snippet');
        }
      });
    }
    
  } catch (error) {
    logger.error('Error:', error);
  }
}

// Run the debug
debugSearchResults();