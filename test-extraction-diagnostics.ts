import { GoogleSearchClient } from './src/services/google-search';
import { UltraEfficientScraper } from './src/services/ultra-efficient-scraper';
import { logger } from './src/utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

interface ExtractionDiagnostics {
  query: string;
  totalResults: number;
  resultsWithPrice: number;
  resultsWithABV: number;
  resultsWithImage: number;
  extractionDetails: Array<{
    title: string;
    url: string;
    hasStructuredData: boolean;
    hasMetaTags: boolean;
    hasPriceInSnippet: boolean;
    hasABVInSnippet: boolean;
    hasCSEImage: boolean;
    extractedData: {
      name: string;
      price?: number;
      abv?: number;
      image_url?: string;
      dataSource: string;
    };
    rawData: {
      snippet: string;
      pagemap?: any;
    };
  }>;
}

class ExtractionDiagnostics {
  private googleClient: GoogleSearchClient;
  private scraper: UltraEfficientScraper;

  constructor() {
    this.googleClient = new GoogleSearchClient();
    this.scraper = new UltraEfficientScraper();
  }

  async diagnoseExtraction(category: string, limit: number = 10): Promise<void> {
    logger.info(`\n🔍 DIAGNOSING EXTRACTION FOR ${category.toUpperCase()}\n`);
    
    // Use a specific query that should return products with prices
    const testQueries = [
      `site:totalwine.com ${category} price buy`,
      `site:klwines.com ${category} "$" 750ml`,
      `site:wine.com ${category} spirits price`
    ];

    for (const query of testQueries) {
      logger.info(`\n📊 Testing query: "${query}"`);
      
      try {
        const searchResults = await this.googleClient.search({ query, limit });
        
        if (!searchResults.items || searchResults.items.length === 0) {
          logger.warn('No results found');
          continue;
        }

        const diagnostics: ExtractionDiagnostics = {
          query,
          totalResults: searchResults.items.length,
          resultsWithPrice: 0,
          resultsWithABV: 0,
          resultsWithImage: 0,
          extractionDetails: []
        };

        // Analyze each result
        for (const result of searchResults.items) {
          const detail = await this.analyzeResult(result, category);
          diagnostics.extractionDetails.push(detail);
          
          if (detail.extractedData.price) diagnostics.resultsWithPrice++;
          if (detail.extractedData.abv) diagnostics.resultsWithABV++;
          if (detail.extractedData.image_url) diagnostics.resultsWithImage++;
        }

        // Print diagnostics
        this.printDiagnostics(diagnostics);
        
      } catch (error) {
        logger.error(`Error with query: ${error}`);
      }
    }
  }

  private async analyzeResult(result: any, category: string): Promise<any> {
    const { title, snippet, link, pagemap } = result;
    
    // Check what data is available
    const hasStructuredData = !!pagemap?.product;
    const hasMetaTags = !!pagemap?.metatags?.[0];
    const hasPriceInSnippet = /\$\d+/.test(snippet);
    const hasABVInSnippet = /\d+%|\d+\s*proof/i.test(snippet);
    const hasCSEImage = !!pagemap?.cse_image?.[0]?.src;

    // Extract using the scraper's method
    const spirits = (this.scraper as any).extractSpiritsFromSearchResult(result, category);
    const extractedData = spirits[0] || { name: 'No extraction', dataSource: 'none' };

    return {
      title,
      url: link,
      hasStructuredData,
      hasMetaTags,
      hasPriceInSnippet,
      hasABVInSnippet,
      hasCSEImage,
      extractedData,
      rawData: {
        snippet,
        pagemap: pagemap ? {
          product: pagemap.product,
          metatags: pagemap.metatags?.[0],
          cse_image: pagemap.cse_image
        } : undefined
      }
    };
  }

  private printDiagnostics(diagnostics: ExtractionDiagnostics): void {
    console.log('\n' + '='.repeat(60));
    console.log(`Query: ${diagnostics.query}`);
    console.log(`Total Results: ${diagnostics.totalResults}`);
    console.log(`Results with Price: ${diagnostics.resultsWithPrice} (${(diagnostics.resultsWithPrice / diagnostics.totalResults * 100).toFixed(1)}%)`);
    console.log(`Results with ABV: ${diagnostics.resultsWithABV} (${(diagnostics.resultsWithABV / diagnostics.totalResults * 100).toFixed(1)}%)`);
    console.log(`Results with Image: ${diagnostics.resultsWithImage} (${(diagnostics.resultsWithImage / diagnostics.totalResults * 100).toFixed(1)}%)`);
    
    console.log('\n📋 DETAILED ANALYSIS:');
    
    for (const detail of diagnostics.extractionDetails) {
      console.log(`\n🔹 ${detail.title}`);
      console.log(`   URL: ${detail.url}`);
      console.log(`   Data Available:`);
      console.log(`     - Structured Data: ${detail.hasStructuredData ? '✅' : '❌'}`);
      console.log(`     - Meta Tags: ${detail.hasMetaTags ? '✅' : '❌'}`);
      console.log(`     - Price in Snippet: ${detail.hasPriceInSnippet ? '✅' : '❌'}`);
      console.log(`     - ABV in Snippet: ${detail.hasABVInSnippet ? '✅' : '❌'}`);
      console.log(`     - CSE Image: ${detail.hasCSEImage ? '✅' : '❌'}`);
      
      console.log(`   Extracted:`);
      console.log(`     - Name: ${detail.extractedData.name}`);
      console.log(`     - Price: ${detail.extractedData.price || 'N/A'}`);
      console.log(`     - ABV: ${detail.extractedData.abv || 'N/A'}`);
      console.log(`     - Image: ${detail.extractedData.image_url ? 'Yes' : 'No'}`);
      console.log(`     - Source: ${detail.extractedData.dataSource}`);
      
      // Show raw data for debugging
      if (detail.hasPriceInSnippet && !detail.extractedData.price) {
        console.log(`   ⚠️  Price in snippet but not extracted!`);
        console.log(`   Snippet: "${detail.rawData.snippet.substring(0, 150)}..."`);
      }
      
      if (detail.rawData.pagemap?.product && !detail.extractedData.price) {
        console.log(`   ⚠️  Structured data available but price not extracted!`);
        console.log(`   Product data:`, JSON.stringify(detail.rawData.pagemap.product, null, 2).substring(0, 200));
      }
    }
  }

  async runCompleteDiagnostics(): Promise<void> {
    const categories = ['bourbon', 'vodka', 'rum'];
    
    for (const category of categories) {
      await this.diagnoseExtraction(category, 5);
      await this.delay(2000); // Rate limiting
    }
    
    // Test specific product page that should have all data
    await this.testSpecificProduct();
  }

  private async testSpecificProduct(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TESTING SPECIFIC PRODUCT EXTRACTION');
    console.log('='.repeat(60));
    
    // Search for a specific product that should have complete data
    const testQuery = 'site:totalwine.com "Buffalo Trace Kentucky Straight Bourbon" price';
    
    try {
      const results = await this.googleClient.search({ query: testQuery, limit: 1 });
      
      if (results.items && results.items[0]) {
        const result = results.items[0];
        console.log('\nRaw Search Result:');
        console.log(JSON.stringify(result, null, 2));
        
        // Test extraction
        const spirits = (this.scraper as any).extractSpiritsFromSearchResult(result, 'bourbon');
        console.log('\nExtracted Spirits:');
        console.log(JSON.stringify(spirits, null, 2));
      }
    } catch (error) {
      console.error('Error testing specific product:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run diagnostics
async function main() {
  const diagnostics = new ExtractionDiagnostics();
  await diagnostics.runCompleteDiagnostics();
}

main().catch(console.error);