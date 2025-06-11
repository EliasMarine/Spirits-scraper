import { GoogleSearchClient } from './src/services/google-search';
import { logger } from './src/utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

class StructuredDataAnalyzer {
  private googleClient: GoogleSearchClient;

  constructor() {
    this.googleClient = new GoogleSearchClient();
  }

  async analyzeStructuredData() {
    // Test a specific Total Wine query that should have structured data
    const query = 'site:totalwine.com "Buffalo Trace Bourbon" 750ml';
    
    logger.info(`Testing query: ${query}\n`);
    
    const results = await this.googleClient.search({ query, limit: 5 });
    
    if (!results.items) {
      logger.error('No results found');
      return;
    }

    for (const result of results.items) {
      console.log('\n' + '='.repeat(60));
      console.log(`Title: ${result.title}`);
      console.log(`URL: ${result.link}`);
      console.log(`\nPagemap data:`);
      
      if (result.pagemap) {
        // Check all available structured data
        if (result.pagemap.product) {
          console.log('\n✅ Product structured data found:');
          console.log(JSON.stringify(result.pagemap.product, null, 2));
        }
        
        if (result.pagemap.offer) {
          console.log('\n✅ Offer structured data found:');
          console.log(JSON.stringify(result.pagemap.offer, null, 2));
        }
        
        if (result.pagemap.aggregaterating) {
          console.log('\n✅ Aggregate rating found:');
          console.log(JSON.stringify(result.pagemap.aggregaterating, null, 2));
        }
        
        if (result.pagemap.metatags) {
          console.log('\n✅ Metatags found:');
          const meta = result.pagemap.metatags[0];
          const relevantMeta = {
            'og:title': meta['og:title'],
            'og:description': meta['og:description'],
            'og:image': meta['og:image'],
            'product:price:amount': meta['product:price:amount'],
            'product:price:currency': meta['product:price:currency'],
            'product:availability': meta['product:availability'],
            'product:brand': meta['product:brand']
          };
          console.log(JSON.stringify(relevantMeta, null, 2));
        }
        
        if (result.pagemap.cse_image) {
          console.log('\n✅ CSE Image found:');
          console.log(JSON.stringify(result.pagemap.cse_image[0], null, 2));
        }
        
        // Check for any other structured data types
        const otherKeys = Object.keys(result.pagemap).filter(key => 
          !['product', 'offer', 'aggregaterating', 'metatags', 'cse_image', 'cse_thumbnail'].includes(key)
        );
        
        if (otherKeys.length > 0) {
          console.log('\n📦 Other structured data found:');
          for (const key of otherKeys) {
            console.log(`  - ${key}:`, JSON.stringify(result.pagemap[key], null, 2).substring(0, 200));
          }
        }
      } else {
        console.log('\n❌ No pagemap data available');
      }
      
      // Show snippet to check for price info
      console.log(`\nSnippet: "${result.snippet}"`);
      
      // Extract price patterns from snippet
      const priceMatches = result.snippet.match(/\$[\d,]+\.?\d*/g);
      if (priceMatches) {
        console.log(`\n💰 Prices found in snippet: ${priceMatches.join(', ')}`);
      }
    }
  }

  async testFixedExtraction() {
    console.log('\n\n' + '='.repeat(60));
    console.log('🔧 TESTING ENHANCED EXTRACTION');
    console.log('='.repeat(60));
    
    const query = 'site:totalwine.com bourbon 750ml';
    const results = await this.googleClient.search({ query, limit: 3 });
    
    if (!results.items) return;
    
    for (const result of results.items) {
      console.log(`\n🔹 ${result.title}`);
      
      // Enhanced extraction logic
      const extractedData = this.enhancedExtraction(result);
      
      console.log('Extracted:');
      console.log(`  Name: ${extractedData.name}`);
      console.log(`  Price: ${extractedData.price || 'N/A'}`);
      console.log(`  ABV: ${extractedData.abv || 'N/A'}`);
      console.log(`  Image: ${extractedData.image_url || 'N/A'}`);
      console.log(`  Brand: ${extractedData.brand || 'N/A'}`);
    }
  }

  private enhancedExtraction(result: any): any {
    const extracted: any = {
      name: '',
      price: null,
      abv: null,
      image_url: null,
      brand: null
    };

    const { title, snippet, link, pagemap } = result;

    // 1. Try to get name from title
    extracted.name = this.cleanTitle(title);

    // 2. Enhanced price extraction
    // Check structured data first
    if (pagemap?.product?.[0]) {
      const product = pagemap.product[0];
      
      // Try various price fields
      const priceFields = [
        product.offers?.price,
        product.offers?.lowPrice,
        product.price,
        product.offers?.[0]?.price,
        product.offers?.[0]?.lowPrice
      ];
      
      for (const priceField of priceFields) {
        if (priceField) {
          const price = this.parsePrice(priceField);
          if (price) {
            extracted.price = price;
            break;
          }
        }
      }
    }

    // Check offer data
    if (!extracted.price && pagemap?.offer?.[0]) {
      const offer = pagemap.offer[0];
      const price = this.parsePrice(offer.price || offer.pricecurrency);
      if (price) extracted.price = price;
    }

    // Check metatags
    if (!extracted.price && pagemap?.metatags?.[0]) {
      const meta = pagemap.metatags[0];
      const priceStr = meta['product:price:amount'] || meta['og:price:amount'] || meta['price'];
      const price = this.parsePrice(priceStr);
      if (price) extracted.price = price;
    }

    // Last resort: extract from snippet
    if (!extracted.price) {
      const priceMatch = snippet.match(/\$?([\d,]+\.?\d*)/);
      if (priceMatch) {
        const price = this.parsePrice(priceMatch[1]);
        if (price && price > 5 && price < 10000) {
          extracted.price = price;
        }
      }
    }

    // 3. Extract ABV/Proof
    const abvPatterns = [
      /(\d+(?:\.\d+)?)\s*%\s*(?:ABV|ALC|alcohol)/i,
      /(\d+(?:\.\d+)?)\s*proof/i,
      /(?:ABV|ALC)[:\s]+(\d+(?:\.\d+)?)/i
    ];

    for (const pattern of abvPatterns) {
      const match = snippet.match(pattern) || title.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        if (pattern.toString().includes('proof')) {
          extracted.abv = value / 2; // Convert proof to ABV
        } else if (value >= 20 && value <= 75) {
          extracted.abv = value;
        }
        break;
      }
    }

    // 4. Extract image
    extracted.image_url = 
      pagemap?.cse_image?.[0]?.src ||
      pagemap?.product?.[0]?.image ||
      pagemap?.metatags?.[0]?.['og:image'] ||
      pagemap?.metatags?.[0]?.['twitter:image'];

    // 5. Extract brand
    extracted.brand = 
      pagemap?.product?.[0]?.brand?.name ||
      pagemap?.product?.[0]?.brand ||
      pagemap?.metatags?.[0]?.['product:brand'] ||
      this.extractBrandFromName(extracted.name);

    return extracted;
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/\s*[-|]\s*(Total Wine|Wine\.com|K&L|Buy Online).*$/i, '')
      .replace(/\s*\(\d+\)$/, '')
      .replace(/\s*[-–—]\s*$/, '')
      .trim();
  }

  private parsePrice(priceStr: any): number | null {
    if (!priceStr) return null;
    
    const str = priceStr.toString();
    const cleaned = str.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleaned);
    
    return price > 0 && price < 50000 ? price : null;
  }

  private extractBrandFromName(name: string): string {
    const words = name.split(/\s+/);
    if (words.length >= 2) {
      return words.slice(0, 2).join(' ');
    }
    return words[0] || '';
  }
}

// Run analysis
async function main() {
  const analyzer = new StructuredDataAnalyzer();
  await analyzer.analyzeStructuredData();
  await analyzer.testFixedExtraction();
}

main().catch(console.error);