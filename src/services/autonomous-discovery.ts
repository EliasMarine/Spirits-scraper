import { SpiritExtractor } from './spirit-extractor.js';
import { EnhancedQueryGenerator } from './enhanced-query-generator.js';
import { SupabaseStorage } from './supabase-storage.js';
import { logger } from '../utils/logger.js';
import { cacheService } from './cache-service.js';
import { spiritDiscovery } from './spirit-discovery.js';

export interface DiscoveryResult {
  distilleries: string[];
  bottles: string[];
  queriesGenerated: number;
  spiritsFound: number;
}

export interface DiscoveryStats {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  spiritsExtracted: number;
  duplicatesFound: number;
  cacheHits: number;
}

export class AutonomousDiscovery {
  private spiritExtractor: SpiritExtractor;
  private queryGenerator: EnhancedQueryGenerator;
  private storage: SupabaseStorage;
  private stats: DiscoveryStats;

  constructor() {
    this.spiritExtractor = new SpiritExtractor();
    this.queryGenerator = new EnhancedQueryGenerator();
    this.storage = new SupabaseStorage();
    this.stats = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      spiritsExtracted: 0,
      duplicatesFound: 0,
      cacheHits: 0
    };
  }

  async runDiscovery(maxQueries: number = 10, category?: string, noCache: boolean = false, mode: string = 'auto'): Promise<DiscoveryResult> {
    logger.info(`Starting autonomous discovery: ${maxQueries} queries${category ? ` for category: ${category}` : ''} in ${mode} mode`);
    
    await cacheService.initialize();
    
    const result: DiscoveryResult = {
      distilleries: [],
      bottles: [],
      queriesGenerated: 0,
      spiritsFound: 0
    };

    // Generate queries based on mode and category
    let queries: string[];
    if (mode === 'distillery') {
      // Use distillery-focused queries
      queries = this.queryGenerator.generateDistilleryQueries(maxQueries);
    } else if (category) {
      queries = this.queryGenerator.generateCategoryDiscoveryQueries(category, maxQueries);
    } else {
      queries = this.generateDiscoveryQueries(maxQueries);
    }

    result.queriesGenerated = queries.length;
    this.stats.totalQueries = queries.length;

    logger.info(`Generated ${queries.length} discovery queries`);

    // Process queries with rate limiting
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      
      try {
        logger.info(`Processing query ${i + 1}/${queries.length}: ${query}`);
        
        // Check cache first (unless noCache is enabled)
        let cachedResults = null;
        if (!noCache) {
          cachedResults = await cacheService.getCachedSearchQuery(query, {});
          if (cachedResults) {
            this.stats.cacheHits++;
            logger.info(`Cache hit for query: ${query}`);
            continue;
          }
        } else {
          logger.info(`Skipping cache for query: ${query} (fresh discovery mode)`);
        }

        // NEW APPROACH: Discover actual spirits from the query
        const discoveredSpirits = await spiritDiscovery.discoverSpiritsFromQuery(query, 10);
        
        if (discoveredSpirits.length > 0) {
          this.stats.successfulQueries++;
          logger.info(`Discovered ${discoveredSpirits.length} actual spirits from query: ${query}`);
          
          // Process each discovered spirit
          for (const discovered of discoveredSpirits) {
            try {
              // Extract detailed information for each discovered spirit
              const spirit = await this.spiritExtractor.extractSpirit(
                discovered.name,
                discovered.brand,
                { maxResults: 10, deepParse: false }
              );
              
              // Store the enriched spirit data
              const storeResult = await this.storage.storeSpirit(spirit);
              if (storeResult.success) {
                result.spiritsFound++;
                this.stats.spiritsExtracted++;
                
                // Extract distillery/brand information
                if (spirit.brand && !result.distilleries.includes(spirit.brand)) {
                  result.distilleries.push(spirit.brand);
                }
                
                // Extract bottle names
                if (spirit.name && !result.bottles.includes(spirit.name)) {
                  result.bottles.push(spirit.name);
                }
              } else if (storeResult.isDuplicate) {
                this.stats.duplicatesFound++;
              }
            } catch (error) {
              logger.error(`Error processing discovered spirit ${discovered.name}:`, error);
            }
          }
        } else {
          logger.info(`No spirits found for query: ${query}`);
        }
        
        // Cache the discovered spirits (even in no-cache mode, to benefit future runs)
        await cacheService.cacheSearchQuery(query, {}, discoveredSpirits);
        
        // Rate limiting - wait between queries
        if (i < queries.length - 1) {
          await this.delay(2000); // 2 second delay between queries
        }
        
      } catch (error) {
        this.stats.failedQueries++;
        logger.error(`Error processing query "${query}":`, error);
        
        // Cache failed attempts to avoid retrying immediately
        await cacheService.markFailedAttempt(query, String(error));
      }
    }

    logger.info(`Discovery completed: ${result.spiritsFound} spirits found, ${result.distilleries.length} distilleries, ${result.bottles.length} bottles`);
    
    return result;
  }

  private generateDiscoveryQueries(maxQueries: number): string[] {
    const queries: string[] = [];
    
    // Base discovery queries for finding distilleries and brands
    const baseQueries = [
      'whiskey distilleries',
      'bourbon distilleries',
      'scotch whisky distilleries',
      'irish whiskey distilleries',
      'vodka brands',
      'gin distilleries',
      'rum distilleries',
      'tequila brands',
      'craft spirits distilleries',
      'independent bottlers whisky',
      'single malt scotch brands',
      'premium vodka brands',
      'artisan gin makers',
      'small batch bourbon',
      'Japanese whisky distilleries',
      'Canadian whisky brands',
      'rye whiskey distilleries',
      'cognac houses',
      'armagnac producers',
      'mezcal brands'
    ];

    queries.push(...baseQueries);

    // Add region-specific queries
    const regions = [
      'Kentucky bourbon distilleries',
      'Tennessee whiskey distilleries',
      'Speyside whisky distilleries',
      'Islay whisky distilleries',
      'Highland scotch distilleries',
      'Irish whiskey Midleton',
      'Japanese whisky Suntory',
      'Japanese whisky Nikka'
    ];

    queries.push(...regions);

    // Add premium/rare spirit queries
    const premiumQueries = [
      'rare whiskey bottles',
      'limited edition spirits',
      'vintage whisky releases',
      'collector spirits',
      'expensive whiskey brands',
      'premium gin brands',
      'luxury vodka brands',
      'aged rum bottles'
    ];

    queries.push(...premiumQueries);

    // Return up to maxQueries
    return queries.slice(0, maxQueries);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats(): DiscoveryStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      spiritsExtracted: 0,
      duplicatesFound: 0,
      cacheHits: 0
    };
  }
}

// Singleton instance
export const autonomousDiscovery = new AutonomousDiscovery();