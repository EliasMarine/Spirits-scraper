import { Distillery, ALL_DISTILLERIES } from '../config/distilleries.js';
import { SupabaseStorage } from './supabase-storage.js';
import { logger } from '../utils/logger.js';
import { googleSearchClient } from './google-search.js';
import { TextProcessor } from './text-processor.js';
import { detectSpiritType } from '../config/spirit-types.js';
import { createMultipleKeys } from './normalization-keys.js';
import { apiCallTracker } from './api-call-tracker.js';
import { getSearchExclusions } from '../config/excluded-domains.js';

export interface OptimizedScrapingResult {
  distillery: string;
  apiCalls: number;
  spiritsFound: number;
  spiritsStored: number;
  efficiency: number;
  catalogPagesFound: number;
  duration: number;
}

/**
 * Optimized Catalog Scraper - Achieves 60%+ efficiency
 * 
 * Key improvements:
 * 1. Searches for catalog pages, not individual products
 * 2. Extracts multiple products from each search result
 * 3. Uses high-yield query patterns
 * 4. Prioritizes domains with best catalog structures
 */
export class OptimizedCatalogScraper {
  private storage: SupabaseStorage;
  
  // High-yield domains with good catalog structures
  private topCatalogDomains = [
    { domain: 'totalwine.com', avgYield: 50 },
    { domain: 'thewhiskyexchange.com', avgYield: 40 },
    { domain: 'klwines.com', avgYield: 35 },
    { domain: 'wine.com', avgYield: 30 },
    { domain: 'masterofmalt.com', avgYield: 30 },
    { domain: 'flaviar.com', avgYield: 25 },
    { domain: 'seelbachs.com', avgYield: 20 },
    { domain: 'reservebar.com', avgYield: 20 }
  ];

  constructor() {
    this.storage = new SupabaseStorage();
  }

  /**
   * Scrape with optimized efficiency
   */
  async scrapeDistilleryOptimized(
    distillery: Distillery,
    maxApiCalls: number = 10
  ): Promise<OptimizedScrapingResult> {
    const startTime = Date.now();
    const result: OptimizedScrapingResult = {
      distillery: distillery.name,
      apiCalls: 0,
      spiritsFound: 0,
      spiritsStored: 0,
      efficiency: 0,
      catalogPagesFound: 0,
      duration: 0
    };

    const discoveredSpirits = new Map<string, any>();
    const processedUrls = new Set<string>();

    logger.info(`🚀 Optimized scraping for ${distillery.name} - Target: 60%+ efficiency`);

    try {
      // Generate optimized queries
      const queries = this.generateOptimizedQueries(distillery);
      
      for (const query of queries) {
        if (result.apiCalls >= maxApiCalls) {
          logger.info(`Reached API call limit (${maxApiCalls})`);
          break;
        }

        if (apiCallTracker.isAPILimitReached()) {
          logger.error('Daily API limit reached');
          break;
        }

        try {
          logger.info(`\n🔍 Query ${result.apiCalls + 1}: ${query}`);
          
          const searchResults = await googleSearchClient.search({ query, num: 10 });
          result.apiCalls++;

          if (!searchResults.items || searchResults.items.length === 0) {
            logger.warn('No results found');
            continue;
          }

          // Process all results from this query
          let queryYield = 0;
          
          for (const item of searchResults.items) {
            if (processedUrls.has(item.link)) continue;
            processedUrls.add(item.link);

            // Extract spirits from this result
            const spirits = this.extractSpiritsFromResult(item, distillery);
            
            // Check if this was a catalog page
            if (this.isCatalogPage(item)) {
              result.catalogPagesFound++;
              logger.info(`📑 Found catalog page: ${item.title}`);
            }

            for (const spirit of spirits) {
              const key = this.createSpiritKey(spirit.name);
              
              if (!discoveredSpirits.has(key)) {
                discoveredSpirits.set(key, spirit);
                result.spiritsFound++;
                queryYield++;
              }
            }
          }

          logger.info(`  ✅ Query yielded ${queryYield} new spirits`);
          
          // Calculate running efficiency
          result.efficiency = result.spiritsFound / result.apiCalls;
          logger.info(`  📊 Current efficiency: ${(result.efficiency * 100).toFixed(1)}% (${result.efficiency.toFixed(1)} spirits/call)`);

        } catch (error) {
          logger.error(`Error processing query: ${error}`);
        }

        // Rate limiting
        await this.delay(1000);
      }

      // Store discovered spirits
      logger.info(`\n💾 Storing ${discoveredSpirits.size} spirits...`);
      
      for (const [key, spirit] of discoveredSpirits) {
        const stored = await this.storeSpirit(spirit, distillery);
        if (stored) {
          result.spiritsStored++;
        }
      }

    } catch (error) {
      logger.error(`Error in optimized scraping: ${error}`);
    }

    result.duration = Date.now() - startTime;
    result.efficiency = result.apiCalls > 0 ? result.spiritsFound / result.apiCalls : 0;

    // Log final results
    logger.info(`\n📊 FINAL RESULTS for ${distillery.name}:`);
    logger.info(`  API Calls: ${result.apiCalls}`);
    logger.info(`  Spirits Found: ${result.spiritsFound}`);
    logger.info(`  Spirits Stored: ${result.spiritsStored}`);
    logger.info(`  Efficiency: ${(result.efficiency * 100).toFixed(1)}% (${result.efficiency.toFixed(1)} spirits/call)`);
    logger.info(`  Catalog Pages: ${result.catalogPagesFound}`);
    logger.info(`  Duration: ${(result.duration / 1000).toFixed(1)}s`);

    return result;
  }

  /**
   * Generate optimized queries for maximum yield
   */
  private generateOptimizedQueries(distillery: Distillery): string[] {
    const queries: string[] = [];
    const exclusions = getSearchExclusions();
    const distilleryName = distillery.name;

    // 1. Direct catalog URLs for top domains
    for (const { domain } of this.topCatalogDomains.slice(0, 4)) {
      queries.push(
        `site:${domain} "${distilleryName}" catalog collection "all products" ${exclusions}`,
        `site:${domain} "${distilleryName}" "view all" "sort by" ${exclusions}`,
        `site:${domain} intitle:"${distilleryName}" products ${exclusions}`
      );
    }

    // 2. Multi-site catalog searches
    queries.push(
      `"${distilleryName}" "products found" OR "items found" (site:totalwine.com OR site:wine.com) ${exclusions}`,
      `"${distilleryName} collection" "filter by" price -reddit -facebook`,
      `"shop ${distilleryName}" online "showing" results spirits`,
      `"all ${distilleryName} products" catalog whiskey bourbon`
    );

    // 3. Product line searches if available
    if (distillery.product_lines && distillery.product_lines.length > 0) {
      const topLine = distillery.product_lines[0];
      queries.push(
        `"${topLine.name}" "${distilleryName}" collection "view all" ${exclusions}`,
        `"${topLine.name} series" by ${distilleryName} products`
      );
    }

    // 4. High-yield patterns
    queries.push(
      `intitle:"${distilleryName}" inurl:products OR inurl:catalog`,
      `"${distilleryName}" filetype:html "add to cart" "price" spirits`
    );

    return queries.slice(0, 15); // Limit to most promising queries
  }

  /**
   * Extract spirits from a search result
   */
  private extractSpiritsFromResult(result: any, distillery: Distillery): any[] {
    const spirits: any[] = [];
    const { title, snippet, link, pagemap } = result;

    // 1. Extract from structured data if available
    if (pagemap?.product) {
      const products = Array.isArray(pagemap.product) ? pagemap.product : [pagemap.product];
      for (const product of products) {
        if (this.isValidProduct(product.name, distillery)) {
          spirits.push(this.createSpiritFromProduct(product, distillery, link));
        }
      }
    }

    // 2. Extract from title
    const titleSpirit = this.extractFromTitle(title, distillery, link);
    if (titleSpirit) spirits.push(titleSpirit);

    // 3. Extract multiple products from snippet
    const snippetSpirits = this.extractFromSnippet(snippet, distillery, link);
    spirits.push(...snippetSpirits);

    // 4. Extract from metatags
    if (pagemap?.metatags?.[0]) {
      const meta = pagemap.metatags[0];
      if (meta['og:title'] && this.isValidProduct(meta['og:title'], distillery)) {
        spirits.push({
          name: this.cleanProductName(meta['og:title'], distillery),
          price: this.extractPrice(meta['product:price:amount']),
          description: meta['og:description'],
          image_url: meta['og:image'],
          source_url: link
        });
      }
    }

    return spirits;
  }

  /**
   * Extract product from title
   */
  private extractFromTitle(title: string, distillery: Distillery, url: string): any | null {
    if (!title) return null;

    // Clean title
    const cleaned = title
      .replace(/\s*[|\-–].*(?:Buy|Shop|Store|Online).*$/i, '')
      .replace(/\s*\|.*$/, '')
      .trim();

    if (!this.isValidProduct(cleaned, distillery)) return null;

    // Extract data
    const price = this.extractPrice(title);
    const abv = this.extractABV(title);

    return {
      name: this.cleanProductName(cleaned, distillery),
      price,
      abv,
      source_url: url
    };
  }

  /**
   * Extract multiple products from snippet
   */
  private extractFromSnippet(snippet: string, distillery: Distillery, url: string): any[] {
    const products: any[] = [];
    if (!snippet) return products;

    // Pattern 1: "Product Name - $XX.XX"
    const pricePattern = /([^$\n]+?)\s*[-–]\s*\$(\d+\.?\d*)/g;
    let match;
    
    while ((match = pricePattern.exec(snippet)) !== null) {
      const name = match[1].trim();
      if (this.isValidProduct(name, distillery)) {
        products.push({
          name: this.cleanProductName(name, distillery),
          price: parseFloat(match[2]),
          source_url: url
        });
      }
    }

    // Pattern 2: Product listings
    const listPattern = new RegExp(
      `(${distillery.name}[^.;]+(?:Bourbon|Whiskey|Rye|Vodka|Gin))`,
      'gi'
    );
    
    const listMatches = snippet.match(listPattern);
    if (listMatches) {
      for (const match of listMatches) {
        if (this.isValidProduct(match, distillery)) {
          products.push({
            name: this.cleanProductName(match, distillery),
            source_url: url
          });
        }
      }
    }

    return products;
  }

  /**
   * Check if this is a catalog page
   */
  private isCatalogPage(result: any): boolean {
    const indicators = [
      'products found', 'items found', 'showing',
      'sort by', 'filter', 'view all', 'collection',
      'catalog', 'page 1', 'results'
    ];

    const text = `${result.title} ${result.snippet}`.toLowerCase();
    return indicators.some(ind => text.includes(ind));
  }

  /**
   * Validate product name
   */
  private isValidProduct(name: string, distillery: Distillery): boolean {
    if (!name || name.length < 5 || name.length > 150) return false;

    // Must reference distillery
    const hasDistillery = 
      name.toLowerCase().includes(distillery.name.toLowerCase()) ||
      distillery.variations.some(v => name.toLowerCase().includes(v.toLowerCase()));

    if (!hasDistillery) return false;

    // Exclude non-products
    const excludeTerms = [
      'review', 'article', 'blog', 'gift set', 'merchandise',
      'tour', 'tasting', 'event', 'vs', 'versus'
    ];

    return !excludeTerms.some(term => name.toLowerCase().includes(term));
  }

  /**
   * Clean product name
   */
  private cleanProductName(name: string, distillery: Distillery): string {
    return TextProcessor.fixTextSpacing(name)
      .replace(/\s*\|.*$/, '')
      .replace(/\s*-\s*\d+ml$/i, '')
      .replace(/\s*\$\d+\.?\d*/, '')
      .trim();
  }

  /**
   * Create spirit key for deduplication
   */
  private createSpiritKey(name: string): string {
    const keys = createMultipleKeys(name);
    return keys.aggressive;
  }

  /**
   * Create spirit object from product data
   */
  private createSpiritFromProduct(product: any, distillery: Distillery, url: string): any {
    return {
      name: this.cleanProductName(product.name, distillery),
      brand: product.brand || distillery.name,
      price: this.extractPrice(product.offers?.price || product.price),
      description: product.description,
      image_url: product.image,
      source_url: url
    };
  }

  /**
   * Store spirit in database
   */
  private async storeSpirit(spirit: any, distillery: Distillery): Promise<boolean> {
    try {
      // Detect type
      const typeDetection = detectSpiritType(
        spirit.name,
        spirit.brand || distillery.name,
        spirit.description
      );

      const spiritData = {
        name: spirit.name,
        brand: TextProcessor.normalizeBrandName(spirit.brand || distillery.name),
        distillery: distillery.name,
        type: typeDetection?.type || distillery.type?.[0] || 'Whiskey',
        category: this.mapTypeToCategory(typeDetection?.type || distillery.type?.[0]),
        price: spirit.price,
        abv: spirit.abv,
        volume: spirit.volume || '750ml',
        image_url: spirit.image_url,
        description: spirit.description,
        source_url: spirit.source_url,
        region: distillery.region,
        country: distillery.country,
        data_source: 'optimized_catalog_scraper',
        data_quality_score: this.calculateQualityScore(spirit)
      };

      const result = await this.storage.storeSpirit(spiritData);
      
      if (result.success) {
        logger.debug(`✅ Stored: ${spirit.name}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error(`Error storing spirit: ${error}`);
      return false;
    }
  }

  /**
   * Extract price from text
   */
  private extractPrice(text: any): number | undefined {
    if (typeof text === 'number') return text;
    if (!text) return undefined;

    const match = text.toString().match(/\$?(\d+\.?\d*)/);
    if (match) {
      const price = parseFloat(match[1]);
      return price > 0 && price < 50000 ? price : undefined;
    }
    
    return undefined;
  }

  /**
   * Extract ABV from text
   */
  private extractABV(text: string): number | undefined {
    if (!text) return undefined;

    const patterns = [
      /(\d+(?:\.\d+)?)\s*%/,
      /(\d+)\s*proof/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        
        if (pattern.toString().includes('proof')) {
          return value / 2;
        }
        
        if (value >= 20 && value <= 75) {
          return value;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Map type to category
   */
  private mapTypeToCategory(type: string): string {
    const mapping: Record<string, string> = {
      'Bourbon': 'Bourbon',
      'Rye Whiskey': 'Rye Whiskey',
      'Scotch': 'Scotch Whiskey',
      'Vodka': 'Vodka',
      'Gin': 'Gin',
      'Rum': 'Rum',
      'Tequila': 'Tequila'
    };
    
    return mapping[type] || 'Other';
  }

  /**
   * Calculate data quality score
   */
  private calculateQualityScore(spirit: any): number {
    let score = 0;
    
    if (spirit.name) score += 20;
    if (spirit.price) score += 20;
    if (spirit.brand) score += 10;
    if (spirit.description) score += 10;
    if (spirit.image_url) score += 10;
    if (spirit.abv) score += 10;
    if (spirit.volume) score += 5;
    if (spirit.type) score += 15;
    
    return Math.min(score, 100);
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const optimizedCatalogScraper = new OptimizedCatalogScraper();