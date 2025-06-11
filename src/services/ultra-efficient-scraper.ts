import { GoogleSearchClient } from './google-search';
import { SupabaseStorage } from './supabase-storage';
import { TextProcessor } from './text-processor';
import { detectSpiritType } from '../config/spirit-types';
import { logger } from '../utils/logger';
import { apiCallTracker } from './api-call-tracker';
import { createMultipleKeys } from './normalization-keys';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export interface UltraEfficientOptions {
  category: string;
  limit: number;
  targetEfficiency?: number; // Default 60%
  deepExtraction?: boolean; // Fetch and parse actual catalog pages
}

export interface ScrapingMetrics {
  apiCalls: number;
  spiritsFound: number;
  spiritsStored: number;
  efficiency: number;
  catalogPagesFound: number;
  averageSpiritsPerCatalog: number;
  topPerformingQueries: Array<{
    query: string;
    spiritsYield: number;
    efficiency: number;
  }>;
}

export class UltraEfficientScraper {
  private googleClient: GoogleSearchClient;
  private storage: SupabaseStorage;
  private metrics: ScrapingMetrics = {
    apiCalls: 0,
    spiritsFound: 0,
    spiritsStored: 0,
    efficiency: 0,
    catalogPagesFound: 0,
    averageSpiritsPerCatalog: 0,
    topPerformingQueries: []
  };

  constructor() {
    this.googleClient = new GoogleSearchClient();
    this.storage = new SupabaseStorage();
  }

  /**
   * Main scraping method optimized for 60%+ efficiency
   */
  async scrapeWithUltraEfficiency(options: UltraEfficientOptions): Promise<ScrapingMetrics> {
    const { category, limit, targetEfficiency = 60, deepExtraction = true } = options;
    
    logger.info(`🚀 Ultra-Efficient Scraping Mode - Target: ${targetEfficiency}% efficiency`);
    
    // Reset metrics
    this.metrics = {
      apiCalls: 0,
      spiritsFound: 0,
      spiritsStored: 0,
      efficiency: 0,
      catalogPagesFound: 0,
      averageSpiritsPerCatalog: 0,
      topPerformingQueries: []
    };

    const processedSpirits = new Set<string>();
    const catalogUrls = new Set<string>();

    // Generate ultra-efficient queries
    const queries = this.generateUltraEfficientQueries(category);
    
    for (const query of queries) {
      if (this.metrics.apiCalls >= limit) {
        logger.info('📊 Reached API limit');
        break;
      }

      try {
        logger.info(`\n🔍 Query ${this.metrics.apiCalls + 1}: ${query}`);
        
        const searchResults = await this.googleClient.search(query);
        this.metrics.apiCalls++;

        if (!searchResults.items || searchResults.items.length === 0) {
          logger.warn('No results found');
          continue;
        }

        let queryYield = 0;

        // Process each search result
        for (const result of searchResults.items) {
          // Skip if already processed
          if (catalogUrls.has(result.link)) continue;
          catalogUrls.add(result.link);

          // Check if this is a catalog page
          if (this.isCatalogPage(result)) {
            this.metrics.catalogPagesFound++;
            
            if (deepExtraction) {
              // Fetch and parse the actual page
              const spirits = await this.extractSpiritsFromCatalogPage(result.link, category);
              
              for (const spirit of spirits) {
                const key = this.createSpiritKey(spirit);
                if (!processedSpirits.has(key)) {
                  processedSpirits.add(key);
                  this.metrics.spiritsFound++;
                  queryYield++;
                  
                  // Store the spirit
                  const stored = await this.storeSpirit(spirit);
                  if (stored) {
                    this.metrics.spiritsStored++;
                  }
                }
              }
              
              logger.info(`  ✅ Catalog page yielded ${spirits.length} spirits`);
            }
          } else {
            // Extract from search result snippet/metadata
            const spirits = this.extractSpiritsFromSearchResult(result, category);
            
            for (const spirit of spirits) {
              const key = this.createSpiritKey(spirit);
              if (!processedSpirits.has(key)) {
                processedSpirits.add(key);
                this.metrics.spiritsFound++;
                queryYield++;
                
                const stored = await this.storeSpirit(spirit);
                if (stored) {
                  this.metrics.spiritsStored++;
                }
              }
            }
          }
        }

        // Track query performance
        const queryEfficiency = this.metrics.apiCalls > 0 ? queryYield : 0;
        this.metrics.topPerformingQueries.push({
          query,
          spiritsYield: queryYield,
          efficiency: queryEfficiency
        });

        // Calculate current efficiency
        this.metrics.efficiency = this.metrics.spiritsFound / this.metrics.apiCalls;
        
        logger.info(`📊 Current efficiency: ${this.metrics.efficiency.toFixed(1)} spirits/API call`);
        
        // If we're exceeding target efficiency, we can be more aggressive
        if (this.metrics.efficiency >= targetEfficiency / 100) {
          logger.info(`🎯 Exceeding target efficiency! Current: ${(this.metrics.efficiency * 100).toFixed(1)}%`);
        }

      } catch (error) {
        logger.error(`Error processing query: ${error}`);
      }

      // Rate limiting
      await this.delay(1000);
    }

    // Calculate final metrics
    this.metrics.efficiency = this.metrics.apiCalls > 0 
      ? this.metrics.spiritsFound / this.metrics.apiCalls 
      : 0;
    
    this.metrics.averageSpiritsPerCatalog = this.metrics.catalogPagesFound > 0
      ? this.metrics.spiritsFound / this.metrics.catalogPagesFound
      : 0;

    // Sort top queries by efficiency
    this.metrics.topPerformingQueries.sort((a, b) => b.efficiency - a.efficiency);
    this.metrics.topPerformingQueries = this.metrics.topPerformingQueries.slice(0, 10);

    this.logFinalMetrics();
    
    return this.metrics;
  }

  /**
   * Generate queries specifically designed for maximum yield
   */
  private generateUltraEfficientQueries(category: string): string[] {
    const queries: string[] = [];
    
    // 1. Direct catalog URLs (highest yield)
    const catalogUrls = [
      `site:totalwine.com/spirits-wine/american-whiskey/${category.toLowerCase()}/c`,
      `site:totalwine.com "${category}" "items found" "sort by"`,
      `site:thewhiskyexchange.com/c/33/american-whiskey "${category}"`,
      `site:wine.com/list/wine/${category.toLowerCase()}`,
      `site:klwines.com/Products?filters=${category}`,
      `site:masterofmalt.com/${category.toLowerCase()}-whisky/`,
      `site:reservebar.com/collections/${category.toLowerCase()}`,
      `site:flaviar.com/spirits/${category.toLowerCase()}`
    ];

    // 2. Multi-site catalog searches
    const multiSiteQueries = [
      `"${category}" "products found" "sort by" (site:totalwine.com OR site:wine.com)`,
      `"${category} whiskey" "view all" "page 1" -reddit -facebook`,
      `"shop ${category}" "showing" "results" online spirits`,
      `"${category} collection" "filter by" price spirits`,
      `intitle:"${category}" "catalog" OR "products" spirits online`
    ];

    // 3. High-yield search operators
    const operatorQueries = [
      `allinurl:${category} products spirits`,
      `allintitle:${category} whiskey collection`,
      `"${category}" site:totalwine.com..klwines.com`,
      `"${category} whiskey" "1-" OR "showing" OR "results"`,
      `filetype:html "${category}" products "add to cart"`
    ];

    // 4. Category listing pages
    const listingQueries = [
      `"browse all ${category}" whiskey spirits`,
      `"${category} whiskey" "grid view" OR "list view"`,
      `"all ${category} products" "filter" "sort"`,
      `"${category}" inurl:category OR inurl:collection`,
      `"complete ${category} selection" spirits`
    ];

    // Combine all queries
    queries.push(...catalogUrls, ...multiSiteQueries, ...operatorQueries, ...listingQueries);
    
    // Add exclusions to all queries
    const exclusions = '-reddit -facebook -twitter -youtube -instagram -pinterest';
    return queries.map(q => `${q} ${exclusions}`).slice(0, 50);
  }

  /**
   * Check if a search result is likely a catalog page
   */
  private isCatalogPage(result: any): boolean {
    const catalogIndicators = [
      'products found', 'items found', 'showing', 'results',
      'sort by', 'filter', 'view all', 'page 1', 'grid view',
      'collection', 'catalog', 'browse', 'shop all'
    ];

    const urlIndicators = [
      '/products', '/catalog', '/collection', '/category',
      '/shop', '/spirits/', '/whiskey/', '/bourbon/'
    ];

    const text = `${result.title} ${result.snippet}`.toLowerCase();
    const url = result.link.toLowerCase();

    const hasTextIndicator = catalogIndicators.some(ind => text.includes(ind));
    const hasUrlIndicator = urlIndicators.some(ind => url.includes(ind));

    return hasTextIndicator || hasUrlIndicator;
  }

  /**
   * Extract spirits from a catalog page by fetching and parsing HTML
   */
  private async extractSpiritsFromCatalogPage(url: string, category: string): Promise<any[]> {
    const spirits: any[] = [];
    
    try {
      // Add user agent to avoid blocking
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      if (!response.ok) {
        logger.warn(`Failed to fetch ${url}: ${response.status}`);
        return spirits;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Site-specific extraction patterns
      if (url.includes('totalwine.com')) {
        spirits.push(...this.extractFromTotalWine($, category));
      } else if (url.includes('thewhiskyexchange.com')) {
        spirits.push(...this.extractFromWhiskyExchange($, category));
      } else if (url.includes('wine.com')) {
        spirits.push(...this.extractFromWineCom($, category));
      } else if (url.includes('klwines.com')) {
        spirits.push(...this.extractFromKLWines($, category));
      } else if (url.includes('masterofmalt.com')) {
        spirits.push(...this.extractFromMasterOfMalt($, category));
      } else {
        // Generic extraction
        spirits.push(...this.extractGenericProducts($, category));
      }

    } catch (error) {
      logger.error(`Error fetching catalog page ${url}: ${error}`);
    }

    return spirits;
  }

  /**
   * Extract products from Total Wine HTML
   */
  private extractFromTotalWine($: cheerio.CheerioAPI, category: string): any[] {
    const products: any[] = [];
    
    // Total Wine product selectors
    $('.product-card, .item-tile, [class*="product-item"]').each((_, elem) => {
      const $elem = $(elem);
      
      const name = $elem.find('.product-title, .item-title, h2, h3').first().text().trim();
      const price = $elem.find('.price, .product-price, [class*="price"]').first().text().trim();
      const image = $elem.find('img').first().attr('src');
      
      if (name && name.length > 3) {
        const cleanPrice = this.extractPrice(price);
        
        products.push({
          name: TextProcessor.fixTextSpacing(name),
          type: category,
          price: cleanPrice,
          image_url: image,
          source_url: 'totalwine.com',
          data_source: 'catalog_extraction'
        });
      }
    });

    logger.debug(`Extracted ${products.length} products from Total Wine`);
    return products;
  }

  /**
   * Extract products from The Whisky Exchange HTML
   */
  private extractFromWhiskyExchange($: cheerio.CheerioAPI, category: string): any[] {
    const products: any[] = [];
    
    $('.product-card').each((_, elem) => {
      const $elem = $(elem);
      
      const name = $elem.find('.product-card__name').text().trim();
      const price = $elem.find('.product-card__price').text().trim();
      const meta = $elem.find('.product-card__meta').text().trim();
      const image = $elem.find('img').attr('src');
      
      if (name) {
        const cleanPrice = this.extractPrice(price);
        const abv = this.extractABV(meta);
        
        products.push({
          name: TextProcessor.fixTextSpacing(name),
          type: category,
          price: cleanPrice,
          abv: abv,
          image_url: image,
          source_url: 'thewhiskyexchange.com',
          data_source: 'catalog_extraction'
        });
      }
    });

    return products;
  }

  /**
   * Extract products from Wine.com HTML
   */
  private extractFromWineCom($: cheerio.CheerioAPI, category: string): any[] {
    const products: any[] = [];
    
    $('.prodItem').each((_, elem) => {
      const $elem = $(elem);
      
      const name = $elem.find('.prodItemInfo_name').text().trim();
      const price = $elem.find('.prodItemInfo_price').text().trim();
      const details = $elem.find('.prodItemInfo_details').text().trim();
      
      if (name) {
        const cleanPrice = this.extractPrice(price);
        
        products.push({
          name: TextProcessor.fixTextSpacing(name),
          type: category,
          price: cleanPrice,
          description: details,
          source_url: 'wine.com',
          data_source: 'catalog_extraction'
        });
      }
    });

    return products;
  }

  /**
   * Extract products from K&L Wines HTML
   */
  private extractFromKLWines($: cheerio.CheerioAPI, category: string): any[] {
    const products: any[] = [];
    
    $('.result-item').each((_, elem) => {
      const $elem = $(elem);
      
      const name = $elem.find('.result-title').text().trim();
      const price = $elem.find('.result-price').text().trim();
      const details = $elem.find('.result-desc').text().trim();
      
      if (name) {
        const cleanPrice = this.extractPrice(price);
        const abv = this.extractABV(details);
        
        products.push({
          name: TextProcessor.fixTextSpacing(name),
          type: category,
          price: cleanPrice,
          abv: abv,
          description: details,
          source_url: 'klwines.com',
          data_source: 'catalog_extraction'
        });
      }
    });

    return products;
  }

  /**
   * Extract products from Master of Malt HTML
   */
  private extractFromMasterOfMalt($: cheerio.CheerioAPI, category: string): any[] {
    const products: any[] = [];
    
    $('.product').each((_, elem) => {
      const $elem = $(elem);
      
      const name = $elem.find('.product-name').text().trim();
      const price = $elem.find('.product-price').text().trim();
      const volume = $elem.find('.product-volume').text().trim();
      const abv = $elem.find('.product-abv').text().trim();
      
      if (name) {
        const cleanPrice = this.extractPrice(price);
        const cleanABV = this.extractABV(abv);
        
        products.push({
          name: TextProcessor.fixTextSpacing(name),
          type: category,
          price: cleanPrice,
          abv: cleanABV,
          volume: volume || '700ml',
          source_url: 'masterofmalt.com',
          data_source: 'catalog_extraction'
        });
      }
    });

    return products;
  }

  /**
   * Generic product extraction for unknown sites
   */
  private extractGenericProducts($: cheerio.CheerioAPI, category: string): any[] {
    const products: any[] = [];
    
    // Common product container selectors
    const selectors = [
      '[class*="product"]',
      '[class*="item"]',
      '[class*="listing"]',
      'article',
      '.grid-item'
    ];

    selectors.forEach(selector => {
      $(selector).each((_, elem) => {
        const $elem = $(elem);
        const text = $elem.text();
        
        // Look for price pattern
        const priceMatch = text.match(/\$\d+\.?\d*/);
        if (priceMatch) {
          // Try to extract product name
          const title = $elem.find('h1, h2, h3, h4, [class*="title"], [class*="name"]').first().text().trim();
          
          if (title && title.length > 3) {
            products.push({
              name: TextProcessor.fixTextSpacing(title),
              type: category,
              price: this.extractPrice(priceMatch[0]),
              source_url: 'unknown',
              data_source: 'catalog_extraction'
            });
          }
        }
      });
    });

    return products;
  }

  /**
   * Extract spirits from search result metadata
   */
  private extractSpiritsFromSearchResult(result: any, category: string): any[] {
    const spirits: any[] = [];
    
    // Extract from title
    const titleSpirit = this.parseProductFromTitle(result.title, category);
    if (titleSpirit) spirits.push(titleSpirit);

    // Extract from snippet
    const snippetSpirits = this.parseProductsFromSnippet(result.snippet, category);
    spirits.push(...snippetSpirits);

    // Extract from structured data
    if (result.pagemap?.product) {
      const products = Array.isArray(result.pagemap.product) 
        ? result.pagemap.product 
        : [result.pagemap.product];
      
      for (const product of products) {
        if (product.name) {
          spirits.push({
            name: TextProcessor.fixTextSpacing(product.name),
            type: category,
            price: this.extractPrice(product.offers?.price),
            brand: product.brand,
            description: product.description,
            source_url: result.link,
            data_source: 'search_metadata'
          });
        }
      }
    }

    return spirits;
  }

  /**
   * Parse product from page title
   */
  private parseProductFromTitle(title: string, category: string): any | null {
    if (!title) return null;

    // Clean title
    const cleaned = title
      .replace(/\s*[|\-–].*(?:Buy|Shop|Store|Online).*$/i, '')
      .trim();

    // Check if it looks like a product
    if (cleaned.length < 5 || cleaned.length > 100) return null;
    
    // Extract price if present
    const priceMatch = cleaned.match(/\$(\d+\.?\d*)/);
    
    return {
      name: TextProcessor.fixTextSpacing(cleaned.replace(/\$\d+\.?\d*/, '').trim()),
      type: category,
      price: priceMatch ? parseFloat(priceMatch[1]) : undefined,
      source_url: '',
      data_source: 'search_title'
    };
  }

  /**
   * Parse products from snippet text
   */
  private parseProductsFromSnippet(snippet: string, category: string): any[] {
    const products: any[] = [];
    if (!snippet) return products;

    // Pattern: "Product Name - $XX.XX"
    const matches = snippet.matchAll(/([^$\-]+?)\s*[-–]\s*\$(\d+\.?\d*)/g);
    
    for (const match of matches) {
      const name = match[1].trim();
      if (name.length > 5 && name.length < 100) {
        products.push({
          name: TextProcessor.fixTextSpacing(name),
          type: category,
          price: parseFloat(match[2]),
          source_url: '',
          data_source: 'search_snippet'
        });
      }
    }

    return products;
  }

  /**
   * Store spirit in database
   */
  private async storeSpirit(spirit: any): Promise<boolean> {
    try {
      // Detect proper type
      const typeDetection = detectSpiritType(spirit.name, spirit.brand || '', spirit.description);
      
      const spiritData = {
        name: spirit.name,
        brand: spirit.brand || this.extractBrandFromName(spirit.name),
        type: typeDetection?.type || spirit.type,
        category: this.mapTypeToCategory(typeDetection?.type || spirit.type),
        price: spirit.price,
        abv: spirit.abv,
        volume: spirit.volume || '750ml',
        image_url: spirit.image_url,
        description: spirit.description,
        source_url: spirit.source_url,
        data_source: spirit.data_source,
        data_quality_score: this.calculateQualityScore(spirit)
      };

      const result = await this.storage.storeSpirit(spiritData);
      
      if (result.success) {
        logger.debug(`✅ Stored: ${spirit.name}`);
        return true;
      } else {
        logger.debug(`❌ Failed to store: ${spirit.name}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error storing spirit: ${error}`);
      return false;
    }
  }

  /**
   * Extract price from various formats
   */
  private extractPrice(priceStr: any): number | undefined {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return undefined;
    
    const cleaned = priceStr.toString().replace(/[^0-9.]/g, '');
    const price = parseFloat(cleaned);
    
    return price > 0 && price < 50000 ? price : undefined;
  }

  /**
   * Extract ABV from text
   */
  private extractABV(text: string): number | undefined {
    if (!text) return undefined;
    
    // Try various patterns
    const patterns = [
      /(\d+(?:\.\d+)?)\s*%/,
      /(\d+)\s*proof/i,
      /ABV[:\s]+(\d+(?:\.\d+)?)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        
        // Convert proof to ABV if needed
        if (pattern.toString().includes('proof')) {
          return value / 2;
        }
        
        // Validate ABV range
        if (value >= 20 && value <= 75) {
          return value;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Create unique key for spirit deduplication
   */
  private createSpiritKey(spirit: any): string {
    const keys = createMultipleKeys(spirit.name);
    return keys.aggressive;
  }

  /**
   * Extract brand from spirit name
   */
  private extractBrandFromName(name: string): string {
    // Simple extraction - take first 2-3 words
    const words = name.split(/\s+/);
    
    if (words.length >= 3) {
      return words.slice(0, 2).join(' ');
    }
    
    return words[0] || 'Unknown';
  }

  /**
   * Map spirit type to category
   */
  private mapTypeToCategory(type: string): string {
    const mapping: Record<string, string> = {
      'Bourbon': 'Bourbon',
      'Rye Whiskey': 'Rye Whiskey',
      'Scotch': 'Scotch Whiskey',
      'Irish Whiskey': 'Irish Whiskey',
      'Vodka': 'Vodka',
      'Gin': 'Gin',
      'Rum': 'Rum',
      'Tequila': 'Tequila',
      'Mezcal': 'Mezcal'
    };
    
    return mapping[type] || 'Other';
  }

  /**
   * Calculate quality score for spirit data
   */
  private calculateQualityScore(spirit: any): number {
    let score = 0;
    
    if (spirit.name) score += 20;
    if (spirit.price) score += 20;
    if (spirit.abv) score += 15;
    if (spirit.brand) score += 10;
    if (spirit.description) score += 10;
    if (spirit.image_url) score += 10;
    if (spirit.volume) score += 5;
    if (spirit.type && spirit.type !== 'Spirit') score += 10;
    
    return Math.min(score, 100);
  }

  /**
   * Log final metrics summary
   */
  private logFinalMetrics() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ULTRA-EFFICIENT SCRAPING RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n🔍 API Calls: ${this.metrics.apiCalls}`);
    console.log(`🥃 Spirits Found: ${this.metrics.spiritsFound}`);
    console.log(`💾 Spirits Stored: ${this.metrics.spiritsStored}`);
    console.log(`📈 Efficiency: ${(this.metrics.efficiency * 100).toFixed(1)}% (${this.metrics.efficiency.toFixed(1)} spirits/call)`);
    console.log(`📑 Catalog Pages Found: ${this.metrics.catalogPagesFound}`);
    console.log(`📊 Avg Spirits per Catalog: ${this.metrics.averageSpiritsPerCatalog.toFixed(1)}`);
    
    console.log('\n🏆 TOP PERFORMING QUERIES:');
    this.metrics.topPerformingQueries.slice(0, 5).forEach((q, i) => {
      console.log(`${i + 1}. ${q.query}`);
      console.log(`   Yield: ${q.spiritsYield} spirits (${(q.efficiency * 100).toFixed(1)}% efficiency)`);
    });
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const ultraEfficientScraper = new UltraEfficientScraper();