import { Distillery, ALL_DISTILLERIES, QUERY_TEMPLATES, DISCOVERY_STRATEGIES } from '../config/distilleries.js';
import { spiritExtractor } from './spirit-extractor.js';
import { spiritDiscovery } from './spirit-discovery.js';
import { SupabaseStorage } from './supabase-storage.js';
import { cacheService } from './cache-service.js';
import { logger } from '../utils/logger.js';
import { googleSearchClient } from './google-search.js';
import { getAllReputableDomains } from '../config/reputable-domains.js';

export interface DistilleryScrapingOptions {
  maxProductsPerDistillery?: number;
  startFromDistilleryIndex?: number;
  distilleryNames?: string[];
  concurrency?: number;
  includeDiscontinued?: boolean;
  yearRange?: { start: number; end: number };
  skipExisting?: boolean;
}

export interface DistilleryScrapingResult {
  distillery: string;
  productsFound: number;
  productsStored: number;
  errors: number;
  queries: string[];
  duration: number;
}

export class DistilleryScraper {
  private storage: SupabaseStorage;
  private reputableDomains: string[];

  constructor() {
    this.storage = new SupabaseStorage();
    this.reputableDomains = getAllReputableDomains();
  }

  /**
   * Main method to scrape all distilleries systematically
   */
  async scrapeAllDistilleries(options: DistilleryScrapingOptions = {}): Promise<DistilleryScrapingResult[]> {
    const {
      maxProductsPerDistillery = 100,
      startFromDistilleryIndex = 0,
      distilleryNames = [],
      includeDiscontinued = true,
      yearRange = { start: 2010, end: new Date().getFullYear() },
      skipExisting = true
    } = options;

    const results: DistilleryScrapingResult[] = [];
    
    // Filter distilleries if specific names provided
    let distilleriesToScrape = ALL_DISTILLERIES;
    if (distilleryNames.length > 0) {
      distilleriesToScrape = ALL_DISTILLERIES.filter(d => 
        distilleryNames.some(name => 
          d.name.toLowerCase().includes(name.toLowerCase()) ||
          d.variations.some(v => v.toLowerCase().includes(name.toLowerCase()))
        )
      );
    }

    // Start from specific index if provided
    distilleriesToScrape = distilleriesToScrape.slice(startFromDistilleryIndex);

    logger.info(`Starting systematic distillery scraping for ${distilleriesToScrape.length} distilleries`);

    for (const [index, distillery] of distilleriesToScrape.entries()) {
      logger.info(`\n📋 Processing distillery ${index + 1}/${distilleriesToScrape.length}: ${distillery.name}`);
      
      try {
        const result = await this.scrapeDistillery(distillery, {
          maxProducts: maxProductsPerDistillery,
          includeDiscontinued,
          yearRange,
          skipExisting
        });
        
        results.push(result);
        
        // Log progress
        logger.info(`✅ ${distillery.name}: Found ${result.productsFound} products, stored ${result.productsStored}`);
        
        // Add delay between distilleries to avoid rate limiting
        await this.delay(2000);
        
      } catch (error) {
        logger.error(`❌ Error scraping ${distillery.name}:`, error);
        results.push({
          distillery: distillery.name,
          productsFound: 0,
          productsStored: 0,
          errors: 1,
          queries: [],
          duration: 0
        });
      }

      // Save progress periodically
      if ((index + 1) % 10 === 0) {
        await this.saveProgress(results);
      }
    }

    return results;
  }

  /**
   * Scrape a single distillery comprehensively
   */
  async scrapeDistillery(
    distillery: Distillery, 
    options: {
      maxProducts?: number;
      includeDiscontinued?: boolean;
      yearRange?: { start: number; end: number };
      skipExisting?: boolean;
    } = {}
  ): Promise<DistilleryScrapingResult> {
    const startTime = Date.now();
    const {
      maxProducts = 100,
      includeDiscontinued = true,
      yearRange = { start: 2010, end: new Date().getFullYear() },
      skipExisting = true
    } = options;

    const result: DistilleryScrapingResult = {
      distillery: distillery.name,
      productsFound: 0,
      productsStored: 0,
      errors: 0,
      queries: [],
      duration: 0
    };

    try {
      // Generate comprehensive queries for this distillery
      const queries = this.generateDistilleryQueries(distillery, {
        includeDiscontinued,
        yearRange,
        maxQueries: Math.ceil(maxProducts / 5) // Assume ~5 products per query
      });
      
      result.queries = queries;
      
      const discoveredProducts = new Set<string>();
      const processedProducts = new Set<string>();

      // Process each query
      for (const query of queries) {
        if (processedProducts.size >= maxProducts) {
          logger.info(`Reached max products limit (${maxProducts}) for ${distillery.name}`);
          break;
        }

        try {
          // Check cache first
          const cachedResults = await cacheService.getCachedSearchQuery(query, {});
          if (cachedResults) {
            logger.debug(`Using cached results for: ${query}`);
          }

          // Discover spirits from this query
          const spirits = await spiritDiscovery.discoverSpiritsFromQuery(query, 10);
          
          for (const spirit of spirits) {
            // Deduplicate by name
            const spiritKey = `${spirit.name}-${spirit.distillery}`.toLowerCase();
            if (discoveredProducts.has(spiritKey)) {
              continue;
            }
            
            discoveredProducts.add(spiritKey);
            result.productsFound++;

            // Skip if we already have this product and skipExisting is true
            if (skipExisting) {
              const exists = await this.checkProductExists(spirit.name, distillery.name);
              if (exists) {
                logger.debug(`Skipping existing product: ${spirit.name}`);
                continue;
              }
            }

            // Extract full product details
            const productData = await spiritExtractor.extractSpirit(
              spirit.name,
              distillery.name,
              { maxResults: 5, deepParse: true }
            );

            if (productData) {
              // Ensure distillery info is correct
              productData.distillery = distillery.name;
              productData.brand = productData.brand || distillery.name;
              productData.region = productData.region || distillery.region;
              productData.country = productData.country || distillery.country;
              
              // Store the product
              const stored = await this.storage.storeSpirit(productData);
              if (stored.success) {
                result.productsStored++;
                processedProducts.add(spiritKey);
                logger.info(`✅ Stored: ${productData.name}`);
              } else {
                logger.warn(`❌ Failed to store ${productData.name}: ${stored.error || 'Unknown error'}`);
                if (stored.isDuplicate) {
                  logger.info(`   (Duplicate detected)`);
                }
              }
            }
          }

          // Rate limiting
          await this.delay(1500);
          
        } catch (queryError) {
          logger.error(`Error processing query "${query}":`, queryError);
          result.errors++;
        }
      }

    } catch (error) {
      logger.error(`Error scraping distillery ${distillery.name}:`, error);
      result.errors++;
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Generate comprehensive queries for a specific distillery
   */
  private generateDistilleryQueries(
    distillery: Distillery,
    options: {
      includeDiscontinued?: boolean;
      yearRange?: { start: number; end: number };
      maxQueries?: number;
    } = {}
  ): string[] {
    const queries: string[] = [];
    const { includeDiscontinued = true, yearRange, maxQueries = 50 } = options;

    // 1. Product line specific queries
    if (distillery.product_lines) {
      for (const line of distillery.product_lines) {
        queries.push(QUERY_TEMPLATES.product_line(distillery.name, line.name));
        
        // Add subcategory queries
        if (line.subcategories) {
          for (const subcat of line.subcategories) {
            queries.push(`"${distillery.name}" "${line.name}" "${subcat}"`);
          }
        }
        
        // Add modifier queries
        if (line.modifiers) {
          for (const modifier of line.modifiers) {
            queries.push(`"${distillery.name}" "${line.name}" ${modifier}`);
          }
        }
      }
    }

    // 2. Base queries from distillery config
    if (distillery.base_queries) {
      queries.push(...distillery.base_queries);
    }

    // 3. Year-specific queries
    if (yearRange) {
      const yearQueries = QUERY_TEMPLATES.year_range(
        distillery.name, 
        yearRange.start, 
        yearRange.end
      );
      queries.push(...yearQueries);
    }

    // 4. Discovery strategy queries
    queries.push(...DISCOVERY_STRATEGIES.temporal.generateQueries(distillery));
    
    // 5. Retailer-specific queries for comprehensive catalog
    const topRetailers = ['totalwine.com', 'klwines.com', 'thewhiskyexchange.com'];
    for (const retailer of topRetailers) {
      queries.push(DISCOVERY_STRATEGIES.retailer_mining.generateQueries(distillery, retailer));
    }

    // 6. Press and awards queries
    queries.push(...DISCOVERY_STRATEGIES.press_release.generateQueries(distillery));
    queries.push(...DISCOVERY_STRATEGIES.awards_competitions.generateQueries(distillery));

    // 7. Standard queries
    const standardQueries = [
      `"${distillery.name}" complete collection`,
      `"${distillery.name}" all products`,
      `"${distillery.name}" full lineup`,
      `"${distillery.name}" portfolio`,
      `"${distillery.name}" catalog`,
      `"${distillery.name}" whiskey list`,
      `"${distillery.name}" spirits range`
    ];
    queries.push(...standardQueries);

    // 8. Special edition queries
    queries.push(QUERY_TEMPLATES.limited(distillery.name));
    queries.push(QUERY_TEMPLATES.cask_finish(distillery.name));
    queries.push(QUERY_TEMPLATES.collaboration(distillery.name));

    // 9. Include discontinued if requested
    if (includeDiscontinued) {
      queries.push(QUERY_TEMPLATES.historical(distillery.name));
      queries.push(`"${distillery.name}" discontinued lineup`);
      queries.push(`"${distillery.name}" past releases`);
    }

    // 10. Use variations for more coverage
    for (const variation of distillery.variations.slice(0, 2)) {
      queries.push(`"${variation}" products`);
      queries.push(`"${variation}" whiskey collection`);
    }

    // Deduplicate and limit queries
    const uniqueQueries = [...new Set(queries)];
    return uniqueQueries.slice(0, maxQueries);
  }

  /**
   * Check if a product already exists in the database
   */
  private async checkProductExists(productName: string, distilleryName: string): Promise<boolean> {
    // For now, always return false to allow scraping
    // TODO: Add a method to SupabaseStorage to check existence
    return false;
  }

  /**
   * Save progress to a file
   */
  private async saveProgress(results: DistilleryScrapingResult[]): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const progressFile = `distillery-scraping-progress-${new Date().toISOString().split('T')[0]}.json`;
      await fs.writeFile(
        progressFile,
        JSON.stringify({ 
          timestamp: new Date().toISOString(),
          results,
          summary: {
            totalDistilleries: results.length,
            totalProducts: results.reduce((sum, r) => sum + r.productsFound, 0),
            totalStored: results.reduce((sum, r) => sum + r.productsStored, 0),
            totalErrors: results.reduce((sum, r) => sum + r.errors, 0)
          }
        }, null, 2)
      );
      logger.info(`Progress saved to ${progressFile}`);
    } catch (error) {
      logger.error('Error saving progress:', error);
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const distilleryScraper = new DistilleryScraper();