import { GoogleSearchClient } from './google-search';
import { SupabaseStorage } from './supabase-storage';
import { TextProcessor } from './text-processor';
import { detectSpiritType } from '../config/spirit-types';
import { logger } from '../utils/logger';
import { apiCallTracker } from './api-call-tracker';
import { createMultipleKeys } from './normalization-keys';
import { scrapeSessionTracker } from './scrape-session-tracker';
import { qualityMonitor } from './real-time-quality-monitor';
// Enhanced price extraction will be integrated after compilation
import axios from 'axios';
import * as cheerio from 'cheerio';
import { V25CriticalFixes } from '../fixes/v2.5-critical-fixes';
import { smartProductValidator } from './smart-product-validator';
import ora from 'ora';

// Configuration constants
const MAX_API_CALLS = 10000; // Daily API call limit for paid GCP account

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
  spiritTypes?: string[];
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
    topPerformingQueries: [],
    spiritTypes: []
  };
  private spiritTypesSet = new Set<string>();

  constructor() {
    this.googleClient = new GoogleSearchClient();
    this.storage = new SupabaseStorage();
  }
  
  /**
   * Reset metrics for a new session
   */
  private resetMetrics(): void {
    this.metrics = {
      apiCalls: 0,
      spiritsFound: 0,
      spiritsStored: 0,
      efficiency: 0,
      catalogPagesFound: 0,
      averageSpiritsPerCatalog: 0,
      topPerformingQueries: [],
      spiritTypes: []
    };
    this.spiritTypesSet.clear();
  }

  /**
   * Search and extract method for external use (e.g., CLI)
   */
  async searchAndExtract(query: string, limit: number = 50): Promise<ScrapingMetrics> {
    // Reset metrics for this search
    this.resetMetrics();
    
    try {
      // Process single query directly
      const searchResults = await this.googleClient.search({ query });
      this.metrics.apiCalls++;
      
      if (!searchResults || !searchResults.items || searchResults.items.length === 0) {
        logger.warn(`No results found for query: ${query}`);
        return this.metrics;
      }
      
      // Process the results
      if (searchResults.items && searchResults.items.length > 0) {
        for (const result of searchResults.items) {
          // Extract spirits from the search result
          // Use 'whiskey' as default category for searchAndExtract since it's the most inclusive
          const spirits = this.extractSpiritsFromSearchResult(result, 'whiskey');
          
          for (const spirit of spirits) {
            this.metrics.spiritsFound++;
            
            const stored = await this.storeSpirit(spirit);
            if (stored) {
              this.metrics.spiritsStored++;
            }
          }
        }
      }
      
      // Calculate efficiency
      this.metrics.efficiency = this.metrics.apiCalls > 0 
        ? this.metrics.spiritsFound / this.metrics.apiCalls 
        : 0;
      
      // Add spirit types to metrics
      this.metrics.spiritTypes = Array.from(this.spiritTypesSet);
      
    } catch (error) {
      logger.error(`Error in searchAndExtract: ${error}`);
    }
    
    return this.metrics;
  }

  /**
   * Main scraping method optimized for 60%+ efficiency
   */
  async scrapeWithUltraEfficiency(options: UltraEfficientOptions): Promise<ScrapingMetrics> {
    const { category, limit, targetEfficiency = 60, deepExtraction = true } = options;
    
    logger.info(`🚀 Ultra-Efficient Scraping Mode - Target: ${targetEfficiency}% efficiency`);
    
    // V3.1.6: Start quality monitoring to prevent catastrophic data quality failures
    qualityMonitor.startMonitoring();
    logger.info('🔍 Real-time quality monitoring enabled');
    
    // Check if we should skip this category entirely
    const skipCheck = await scrapeSessionTracker.shouldSkipCategory(category, limit);
    if (skipCheck.skip) {
      logger.info(`📊 ${skipCheck.reason}`);
      logger.info(`✅ Skipping API calls - requirement already satisfied`);
      
      // Return metrics showing we already have enough
      return {
        apiCalls: 0,
        spiritsFound: skipCheck.existingCount || 0,
        spiritsStored: skipCheck.existingCount || 0,
        efficiency: 0,
        catalogPagesFound: 0,
        averageSpiritsPerCatalog: 0,
        topPerformingQueries: []
      };
    }
    
    // Initialize new session
    const session = scrapeSessionTracker.initSession(category);
    
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
      // Check if we've found enough spirits
      if (this.metrics.spiritsFound >= limit) {
        logger.info(`📊 Found ${this.metrics.spiritsFound} spirits - reached target limit`);
        break;
      }
      
      // Also check API call limit
      if (this.metrics.apiCalls >= MAX_API_CALLS) {
        logger.info(`📊 Reached daily API call limit (${MAX_API_CALLS})`);
        break;
      }

      try {
        logger.info(`\n🔍 Query ${this.metrics.apiCalls + 1}: ${query}`);
        
        // Track this query in the session
        scrapeSessionTracker.recordQuery(category, query);
        
        // Show loading spinner for API call
        const apiSpinner = ora({
          text: `Making Google API call: ${query}`,
          spinner: 'dots',
          color: 'blue'
        }).start();
        
        const searchResults = await this.googleClient.search({ query });
        this.metrics.apiCalls++;
        
        apiSpinner.succeed(`API call complete - Found ${searchResults.items?.length || 0} results`);

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
            logger.info(`  📑 Found catalog page: ${result.title}`);
          }

          // Always extract from search result metadata (more efficient than fetching pages)
          const spirits = this.extractSpiritsFromSearchResult(result, category);
          
          // Only process if we actually found spirits with names
          const validSpirits = spirits.filter(s => s.name && s.name.length > 5 && !s.name.toLowerCase().includes('best local price'));
          
          for (const spirit of validSpirits) {
            const key = this.createSpiritKey(spirit);
            if (!processedSpirits.has(key)) {
              processedSpirits.add(key);
              
              // V2.7 FIX: Check if already stored in database (not just session)
              const alreadyStored = await scrapeSessionTracker.isAlreadyStored(
                category, 
                key,
                spirit.name,
                spirit.brand
              );
              if (alreadyStored) {
                logger.debug(`⏭️ Skipping already stored: ${spirit.name}`);
                continue;
              }
              
              this.metrics.spiritsFound++;
              scrapeSessionTracker.recordSpiritFound(category);
              queryYield++;
              
              // Add the search result URL as source
              spirit.source_url = spirit.source_url || result.link;
              
              // V3.1.6: Monitor spirit quality BEFORE storage attempt
              const qualityAlerts = qualityMonitor.procesSpirit(spirit);
              
              // Handle critical quality alerts
              if (qualityAlerts.length > 0) {
                for (const alert of qualityAlerts) {
                  if (alert.level === 'CRITICAL' || alert.level === 'EMERGENCY') {
                    logger.error(`🚨 ${alert.level} QUALITY ALERT: ${alert.message}`);
                  } else {
                    logger.warn(`⚠️ ${alert.level} QUALITY ALERT: ${alert.message}`);
                  }
                }
              }
              
              // Emergency stop if quality is too poor
              if (qualityMonitor.shouldStopScraping()) {
                logger.error('🛑 EMERGENCY STOP: Data quality critically low - halting scraping');
                logger.error(qualityMonitor.generateReport());
                break;
              }

              const stored = await this.storeSpirit(spirit);
              if (stored) {
                this.metrics.spiritsStored++;
                scrapeSessionTracker.recordSpiritStored(category, key);
                logger.info(`✅ Stored: ${spirit.name} (${spirit.price ? '$' + spirit.price : 'no price'})`);
              } else {
                logger.warn(`❌ Failed to store: ${spirit.name}`);
                // V2.7.3: Temporary - log spirit data at warn level to debug cognac issue
                logger.warn(`  Spirit data: ${JSON.stringify({
                  name: spirit.name,
                  brand: spirit.brand,
                  category: spirit.category,
                  price: spirit.price,
                  abv: spirit.abv,
                  source_url: spirit.source_url
                })}`);
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
        
        // V2.7: Get actual database count for accurate progress tracking
        const dbCount = await this.storage.getSpiritCountByCategory(category);
        
        logger.info(`📊 Progress Update:`);
        logger.info(`   - Found: ${this.metrics.spiritsFound} spirits this session`);
        logger.info(`   - Stored: ${this.metrics.spiritsStored} new spirits`);
        logger.info(`   - In Database: ${dbCount} total ${category} spirits`);
        logger.info(`   - Efficiency: ${this.metrics.efficiency.toFixed(1)} spirits/API call`);
        
        // Calculate proper progress percentage
        const progress = Math.min(100, (dbCount / limit) * 100);
        logger.info(`   - Progress: ${dbCount}/${limit} (${progress.toFixed(1)}%)`);
        
        // If we're exceeding target efficiency, we can be more aggressive
        if (this.metrics.efficiency >= targetEfficiency / 100) {
          logger.info(`🎯 Exceeding target efficiency! Current: ${this.metrics.efficiency.toFixed(1)} spirits/call`);
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

    // Add spirit types to metrics
    this.metrics.spiritTypes = Array.from(this.spiritTypesSet);
    
    // V2.7: Pass category to show database count
    await this.logFinalMetrics(category);
    
    // Save the session for future reference
    await scrapeSessionTracker.saveSession(category);
    
    // Log session stats
    const sessionStats = scrapeSessionTracker.getSessionStats(category);
    if (sessionStats) {
      logger.info(`📝 Session tracked: ${sessionStats.spiritsStored} spirits stored, ${sessionStats.uniqueSpirits} unique keys`);
    }
    
    // V3.1.6: Generate final quality report
    const finalQualityMetrics = qualityMonitor.stopMonitoring();
    logger.info(qualityMonitor.generateReport());
    
    // Log quality summary
    logger.info('🔍 QUALITY SUMMARY:');
    logger.info(`   URL Success Rate: ${(finalQualityMetrics.urlSuccessRate * 100).toFixed(1)}%`);
    logger.info(`   Category Success Rate: ${(finalQualityMetrics.categorySuccessRate * 100).toFixed(1)}%`);
    logger.info(`   Name Validity Rate: ${(finalQualityMetrics.nameValidityRate * 100).toFixed(1)}%`);
    logger.info(`   Average Quality Score: ${finalQualityMetrics.averageQualityScore.toFixed(1)}/100`);
    
    // Warn if quality was poor
    if (qualityMonitor.hasCriticalAlerts()) {
      logger.warn('⚠️ Critical quality issues detected during scraping - review data manually');
    }
    
    return this.metrics;
  }

  /**
   * Generate queries specifically designed for maximum yield
   */
  private generateUltraEfficientQueries(category: string): string[] {
    const queries: string[] = [];
    
    // V2.7: EXPANDED query generation - 100+ queries instead of 15
    
    // Map categories to MANY more distilleries/brands
    const categoryDistilleries: Record<string, string[]> = {
      'bourbon': [
        'Buffalo Trace', 'Wild Turkey', 'Four Roses', 'Heaven Hill', 'Jim Beam', 'Maker\'s Mark',
        'Woodford Reserve', 'Knob Creek', 'Bulleit', 'Elijah Craig', 'Evan Williams', 'Old Forester',
        'Basil Hayden', 'Booker\'s', 'Baker\'s', 'Eagle Rare', 'Blanton\'s', 'W.L. Weller',
        'Pappy Van Winkle', 'George T. Stagg', 'Colonel E.H. Taylor', 'Michter\'s', 'Russell\'s Reserve',
        'Very Old Barton', 'Ancient Age', 'Benchmark', 'Old Grand-Dad', 'Henry McKenna',
        'Fighting Cock', 'Old Ezra', 'Yellowstone', 'Wilderness Trail', 'New Riff', 'Bardstown',
        'Angel\'s Envy', 'Jefferson\'s', 'Widow Jane', 'Belle Meade', 'High West', 'Smooth Ambler'
      ],
      'whiskey': [
        'Jack Daniel\'s', 'Jameson', 'Crown Royal', 'Bushmills', 'Redbreast', 'Green Spot',
        'Yellow Spot', 'Powers', 'Tullamore D.E.W.', 'Proper No. Twelve', 'Teeling', 'Writer\'s Tears',
        'Canadian Club', 'Seagram\'s', 'Pendleton', 'Black Velvet', 'Forty Creek', 'WhistlePig',
        'George Dickel', 'Uncle Nearest', 'Chattanooga', 'Corsair', 'Balcones', 'Westland'
      ],
      'scotch': [
        'Glenfiddich', 'Macallan', 'Glenlivet', 'Ardbeg', 'Highland Park', 'Lagavulin', 'Laphroaig',
        'Bowmore', 'Talisker', 'Oban', 'Dalmore', 'Balvenie', 'Glenmorangie', 'Springbank',
        'Bruichladdich', 'Caol Ila', 'Bunnahabhain', 'Kilchoman', 'Jura', 'Tobermory',
        'Glen Scotia', 'Auchentoshan', 'Glenkinchie', 'Aberlour', 'Glenfarclas', 'BenRiach',
        'GlenDronach', 'Cragganmore', 'Dalwhinnie', 'Glen Elgin', 'Glenrothes', 'Mortlach'
      ],
      'rye': [
        'WhistlePig', 'Bulleit Rye', 'High West', 'Sazerac', 'Rittenhouse', 'Old Overholt',
        'Pikesville', 'Templeton', 'George Dickel Rye', 'Wild Turkey Rye', 'Jim Beam Rye',
        'Knob Creek Rye', 'Russell\'s Reserve Rye', 'Redemption Rye', 'Michter\'s Rye',
        'Dad\'s Hat', 'Few Rye', 'Ragtime Rye', 'Old Forester Rye', 'Jack Daniel\'s Rye'
      ],
      'tequila': [
        'Patron', 'Don Julio', 'Casamigos', 'Espolon', 'Herradura', 'Casa Noble', 'Clase Azul',
        'Fortaleza', 'El Tesoro', 'Ocho', 'G4', 'Pasote', 'Tapatio', 'El Jimador', 'Cazadores',
        'Milagro', 'Hornitos', 'Jose Cuervo', 'Avion', 'Codigo', 'Maestro Dobel', 'Tres Agaves'
      ],
      'rum': [
        'Bacardi', 'Captain Morgan', 'Mount Gay', 'Plantation', 'Appleton', 'Diplomatico',
        'Ron Zacapa', 'Flor de Caña', 'El Dorado', 'Rhum Barbancourt', 'Smith & Cross',
        'Goslings', 'Myers\'s', 'Pusser\'s', 'Kraken', 'Sailor Jerry', 'Don Q', 'Cruzan'
      ],
      'gin': [
        'Tanqueray', 'Bombay', 'Hendrick\'s', 'Beefeater', 'Aviation', 'Plymouth', 'The Botanist',
        'Monkey 47', 'Drumshanbo', 'Roku', 'Nikka Coffey', 'St. George', 'Green Hat', 'Bluecoat'
      ],
      'vodka': [
        'Grey Goose', 'Absolut', 'Belvedere', 'Ketel One', 'Tito\'s', 'Stolichnaya', 'Chopin',
        'Reyka', 'Russian Standard', 'Smirnoff', 'Finlandia', 'Crystal Head', 'Cîroc', 'Hangar 1'
      ],
      'cognac': [
        'Hennessy', 'Rémy Martin', 'Martell', 'Courvoisier', 'Camus', 'Hine', 'Pierre Ferrand',
        'Paul Giraud', 'Delamain', 'Frapin', 'Hardy', 'Gautier', 'Meukow', 'A.E. Dor', 'Baron Otard',
        'Bisquit', 'François Voyer', 'Jean Fillioux', 'Leopold Gourmel', 'Landy', 'Larsen',
        'Louis Royer', 'Maison Surrenne', 'Park', 'Planat', 'Prunier', 'Tesseron', 'D\'Ussé',
        'ABK6', 'Vallein Tercinier', 'Château de Montifaud', 'Claude Chatelier', 'Daniel Bouju',
        'Deau', 'Dudognon', 'François Peyrot', 'Jean-Luc Pasquet', 'Louis XIII', 'Maxime Trijol'
      ]
    };
    
    const allDistilleries = categoryDistilleries[category.toLowerCase()] || [category];
    const spiritType = category.toLowerCase();
    
    // V2.7: Dynamic randomization
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const seasons = ['spring', 'summer', 'fall', 'winter', 'holiday'];
    const currentSeason = seasons[Math.floor(new Date().getMonth() / 3)];
    
    // Shuffle distilleries for variety
    const shuffledDistilleries = [...allDistilleries].sort(() => Math.random() - 0.5);
    
    // Simplified exclusions
    const simpleExclusions = '-reddit -facebook -twitter -youtube';
    
    // Major retailer sites
    const retailerSites = [
      'totalwine.com', 'klwines.com', 'thewhiskyexchange.com', 'wine.com',
      'masterofmalt.com', 'flaviar.com', 'caskers.com', 'reservebar.com',
      'finedrams.com', 'wine-searcher.com', 'drizly.com', 'liquor.com',
      'binnys.com', 'astorwines.com', 'sharedpour.com', 'seelbachs.com',
      'liquorama.net', 'missionliquor.com', 'rancholiquor.com', 'remedyliquor.com'
    ];

    // 1. Site-specific searches for ALL distilleries (not just 3)
    for (let i = 0; i < Math.min(shuffledDistilleries.length, 20); i++) {
      const distillery = shuffledDistilleries[i];
      
      // Rotate through different sites
      queries.push(
        `site:${retailerSites[i % retailerSites.length]} "${distillery}" ${spiritType}`,
        `site:${retailerSites[(i + 1) % retailerSites.length]} "${distillery}" products`,
        `site:${retailerSites[(i + 2) % retailerSites.length]} intitle:"${distillery}"`
      );
    }

    // 2. Multi-site combination searches
    for (let i = 0; i < 10; i++) {
      const site1 = retailerSites[i];
      const site2 = retailerSites[i + 10] || retailerSites[i + 1];
      const dist1 = shuffledDistilleries[i * 2] || shuffledDistilleries[0];
      const dist2 = shuffledDistilleries[i * 2 + 1] || shuffledDistilleries[1];
      
      queries.push(
        `(site:${site1} OR site:${site2}) ${spiritType} -gift -cigar ${simpleExclusions}`,
        `(site:${site1} OR site:${site2}) "${dist1}" "${dist2}" buy`
      );
    }

    // 3. Price range searches with variations
    const priceRanges = ['under 50', '50 100', '100 200', '200 500', 'over 500'];
    priceRanges.forEach(range => {
      queries.push(
        `${category} ${range} dollars buy online ${simpleExclusions}`,
        `"${spiritType}" price ${range} "in stock" ${simpleExclusions}`
      );
    });

    // 4. Age-specific searches
    const ages = [3, 5, 7, 8, 10, 12, 15, 18, 21, 23, 25, 30];
    ages.forEach(age => {
      queries.push(`${age} year ${category} buy ${simpleExclusions}`);
    });

    // 5. Time-based searches for fresh results
    queries.push(
      `best ${category} ${currentYear} ${simpleExclusions}`,
      `new ${category} releases ${currentMonth} ${currentYear}`,
      `${category} ${currentSeason} ${currentYear} collection`,
      `limited edition ${category} ${currentYear}`,
      `${category} awards ${currentYear - 1} winners`
    );

    // 6. Style/type specific searches
    const styleQueries: Record<string, string[]> = {
      'bourbon': ['single barrel', 'small batch', 'bottled in bond', 'cask strength', 'wheated', 'high rye'],
      'scotch': ['single malt', 'blended', 'peated', 'sherry cask', 'islay', 'speyside', 'highland'],
      'whiskey': ['irish single malt', 'canadian rye', 'japanese', 'american single malt'],
      'tequila': ['blanco', 'reposado', 'añejo', 'extra añejo', 'cristalino', '100% agave'],
      'rum': ['white', 'gold', 'dark', 'spiced', 'aged', 'agricole', 'overproof'],
      'gin': ['london dry', 'old tom', 'navy strength', 'barrel aged', 'contemporary'],
      'vodka': ['premium', 'craft', 'potato', 'wheat', 'rye', 'corn'],
      'cognac': ['VS', 'VSOP', 'XO', 'Napoleon', 'Extra', 'Paradis', 'Hors d\'Age', 'Fine Champagne', 'Grande Champagne']
    };
    
    const styles = styleQueries[category.toLowerCase()] || [];
    styles.forEach(style => {
      queries.push(
        `${style} ${category} buy online ${simpleExclusions}`,
        `best ${style} ${category} ${currentYear}`
      );
    });

    // 7. Geographic/regional searches
    queries.push(
      `local ${category} delivery near me`,
      `${category} online shipping USA`,
      `buy ${category} free shipping`
    );

    // 8. Comparison and versus searches
    for (let i = 0; i < 5; i++) {
      const brand1 = shuffledDistilleries[i] || category;
      const brand2 = shuffledDistilleries[i + 5] || 'whiskey';
      queries.push(`${brand1} vs ${brand2} comparison review`);
    }

    // 9. Gift and special occasion searches
    // V2.7.3: Skip problematic gift queries for cognac
    if (category.toLowerCase() !== 'cognac') {
      queries.push(
        `${category} gift guide ${currentYear}`,
        `best ${category} gifts under 100`,
        `${category} wedding gift ideas`,
        `${category} collectors edition`
      );
    } else {
      // V2.7.3: Better cognac-specific queries
      queries.push(
        `cognac VSOP buy online ${simpleExclusions}`,
        `cognac XO price list ${currentYear}`,
        `cognac VS shop online -gift -accessories`,
        `cognac Napoleon limited edition ${currentYear}`
      );
    }

    // 10. Inventory and catalog searches
    queries.push(
      `"${category} catalog" "view all" products ${simpleExclusions}`,
      `"shop all ${category}" online store`,
      `${category} "items found" "sort by" price`,
      `browse ${category} collection "in stock"`
    );

    // 4. Specific searches for popular expressions
    if (spiritType === 'bourbon') {
      queries.push(
        `"single barrel" bourbon price site:totalwine.com`,
        `"small batch" bourbon site:klwines.com`,
        `"bottled in bond" bourbon buy online`
      );
    } else if (spiritType === 'scotch') {
      queries.push(
        `"single malt" scotch whisky site:thewhiskyexchange.com`,
        `"aged 12 years" scotch price`,
        `"highland" OR "islay" scotch buy`
      );
    } else if (spiritType === 'cognac') {
      // V2.7.3: Cognac-specific searches
      queries.push(
        `"Hennessy VSOP" price site:totalwine.com`,
        `"Remy Martin XO" buy online ${simpleExclusions}`,
        `"Martell VS" "cognac" shop -accessories -leather`,
        `"Courvoisier VSOP" 750ml price`,
        `cognac "Grande Champagne" buy online -gift -candle`,
        `"Fine Champagne" cognac price list`
      );
    }
    
    // V2.7: Return ALL queries for maximum discovery (100+)
    // Shuffle for variety on each run
    return queries.sort(() => Math.random() - 0.5);
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
    
    // Show loading spinner for catalog fetch
    const catalogSpinner = ora({
      text: `Fetching catalog page: ${url.substring(0, 50)}...`,
      spinner: 'dots',
      color: 'cyan'
    }).start();
    
    try {
      // Add user agent and other headers to avoid blocking
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000,
        maxRedirects: 5
      });

      const html = response.data;
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
      
      catalogSpinner.succeed(`Extracted ${spirits.length} spirits from catalog`);

    } catch (error) {
      catalogSpinner.fail(`Failed to fetch catalog page`);
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
          category: category,
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
          category: category,
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
          category: category,
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
          category: category,
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
          category: category,
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
              category: category,
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
    const { title, snippet, link, pagemap } = result;
    
    // Skip non-product pages
    const skipDomains = ['buffalotracedaily.com', 'epicurious.com', 'ohlq.com', 'reddit.com', 'facebook.com'];
    if (skipDomains.some(domain => link.includes(domain))) {
      return spirits;
    }
    
    // 1. Extract from structured data first (highest quality)
    if (pagemap?.product) {
      const products = Array.isArray(pagemap.product) ? pagemap.product : [pagemap.product];
      for (const product of products) {
        if (product.name && product.name.length > 5 && !product.name.toLowerCase().includes('gift card')) {
          // Extract price from structured data
          let structuredPrice: number | undefined;
          const priceFields = [
            product.offers?.price,
            product.offers?.lowPrice,
            product.price,
            product.offers?.[0]?.price
          ];
          
          for (const field of priceFields) {
            const price = this.extractPrice(field);
            if (price) {
              structuredPrice = price;
              break;
            }
          }
          
          spirits.push({
            name: TextProcessor.fixTextSpacing(product.name),
            category: category,
            price: structuredPrice,
            brand: product.brand?.name || product.brand || TextProcessor.extractBrandFromName(product.name),
            description: product.description,
            image_url: product.image || product.offers?.image,
            source_url: link,
            data_source: 'structured_data'
          });
        }
      }
    }
    
    // 2. Extract from metatags
    if (pagemap?.metatags?.[0]) {
      const meta = pagemap.metatags[0];
      const productName = meta['og:title'] || meta['product:name'] || meta['twitter:title'];
      
      if (productName && this.isValidProductName(productName, category, link)) {
        // Check if we already have this from structured data
        const exists = spirits.some(s => s.name.toLowerCase() === productName.toLowerCase());
        if (!exists) {
          spirits.push({
            name: this.cleanProductName(productName),
            category: category,
            price: this.extractPrice(meta['product:price:amount'] || meta['product:price'] || meta['og:price:amount']),
            brand: meta['product:brand'] || meta['og:brand'],
            description: meta['og:description'] || meta['description'],
            image_url: meta['og:image'] || meta['twitter:image'],
            source_url: link,
            data_source: 'metatags'
          });
        }
      }
    }
    
    // 3. Extract from title (if it looks like a product)
    const titleSpirit = this.extractFromTitle(title, category, link);
    if (titleSpirit && !spirits.some(s => s.name.toLowerCase() === titleSpirit.name.toLowerCase())) {
      spirits.push(titleSpirit);
    }
    
    // 4. Extract multiple products from snippet
    const snippetSpirits = this.extractFromSnippet(snippet, category, link);
    for (const spirit of snippetSpirits) {
      if (!spirits.some(s => s.name.toLowerCase() === spirit.name.toLowerCase())) {
        spirits.push(spirit);
      }
    }
    
    // 5. Look for price information in snippet to enhance existing spirits
    if (snippet && spirits.length > 0 && !spirits[0].price) {
      // Extract price from snippet with enhanced patterns
      const pricePatterns = [
        // Standard price patterns
        /(?:price|msrp|our\s+price|sale|now):\s*\$?([\d,]+\.?\d*)/i,
        /\$\s*([\d,]+\.?\d{0,2})(?:\s|$|[^\d])/,
        
        // Price near volume (750ml - $29.99)
        /(?:750ml|1L|1\.75L)\s*[-–—]\s*\$?([\d,]+\.?\d*)/i,
        /\d+ml\s*[.-]*\s*\$?([\d,]+\.?\d*)/i,
        
        // Price range patterns
        /\$?([\d,]+\.?\d*)\s*-\s*\$?\d+\.?\d*/,
        /USD\s*([\d,]+\.?\d*)/i,
        
        // Retail/regular price
        /(?:retail|regular)\s+price[:\s]*\$?([\d,]+\.?\d*)/i,
        /priced?\s+at\s+\$?([\d,]+\.?\d*)/i,
        
        // Price in parentheses or after colon
        /\(\$?([\d,]+\.?\d*)\)/,
        /:\s*\$?([\d,]+\.?\d*)(?:\s|$)/,
        
        // Price with currency words
        /(\d+\.?\d*)\s*(?:dollars|bucks)/i,
        
        // Special Total Wine pattern from their snippets
        /(?:was|now|only)\s+\$?([\d,]+\.?\d*)/i
      ];
      
      for (const pattern of pricePatterns) {
        const match = snippet.match(pattern);
        if (match) {
          const price = this.extractPrice(match[1], snippet);
          if (price) {
            spirits[0].price = price;
            break;
          }
        }
      }
    }
    
    // 6. Extract ABV/Proof from snippet
    const abvMatch = snippet.match(/(\d+(?:\.\d+)?)\s*%\s*(?:ABV|alc)/i);
    const proofMatch = snippet.match(/(\d+(?:\.\d+)?)\s*proof/i);
    if ((abvMatch || proofMatch) && spirits.length > 0) {
      if (!spirits[0].abv) {
        if (abvMatch) {
          spirits[0].abv = parseFloat(abvMatch[1]);
        } else if (proofMatch) {
          spirits[0].abv = parseFloat(proofMatch[1]) / 2; // Convert proof to ABV
        }
      }
      if (!spirits[0].proof && proofMatch) {
        spirits[0].proof = parseFloat(proofMatch[1]);
      }
    }
    
    // 7. Extract image from CSE image data
    if (pagemap?.cse_image?.[0]?.src && spirits.length > 0 && !spirits[0].image_url) {
      spirits[0].image_url = pagemap.cse_image[0].src;
    }
    
    // 8. Enhanced description extraction with better cleaning
    if (spirits.length > 0) {
      const enhancedDescription = this.extractEnhancedDescription(pagemap, snippet, spirits[0].description);
      if (enhancedDescription) {
        spirits[0].description = enhancedDescription;
      }
    }

    return spirits;
  }

  /**
   * Enhanced description extraction with better cleaning and prioritization
   */
  private extractEnhancedDescription(pagemap: any, snippet: string, existingDescription?: string): string | undefined {
    const descriptions: string[] = [];
    
    // 1. Extract FULL meta descriptions (no truncation)
    const metaDescriptions = [
      pagemap?.metatags?.[0]?.['og:description'],
      pagemap?.metatags?.[0]?.['description'],
      pagemap?.metatags?.[0]?.['twitter:description'],
      pagemap?.metatags?.[0]?.['product:description']
    ].filter(Boolean);
    
    for (const metaDesc of metaDescriptions) {
      const cleaned = this.cleanDescription(metaDesc);
      if (cleaned && cleaned.length > 50) {
        descriptions.push(cleaned);
      }
    }
    
    // 2. Add existing structured description if good quality
    if (existingDescription && existingDescription.length > 50 && !existingDescription.includes('JavaScript')) {
      const cleaned = this.cleanDescription(existingDescription);
      if (cleaned) descriptions.push(cleaned);
    }
    
    // 3. Add cleaned snippet as supplementary info
    if (snippet && snippet.length > 50) {
      const cleanedSnippet = this.cleanDescription(snippet);
      if (cleanedSnippet && cleanedSnippet.length > 40) {
        descriptions.push(cleanedSnippet);
      }
    }
    
    // 4. Combine descriptions intelligently
    if (descriptions.length === 0) return existingDescription;
    
    // Remove duplicates and combine
    const uniqueDescriptions = [...new Set(descriptions)];
    
    // If we have multiple good descriptions, combine them
    if (uniqueDescriptions.length > 1) {
      // Take the longest one as primary, add others as additional info
      const primary = uniqueDescriptions.sort((a, b) => b.length - a.length)[0];
      const additional = uniqueDescriptions.slice(1).filter(d => 
        // Only add if it contains unique information
        !primary.toLowerCase().includes(d.toLowerCase().substring(0, 30))
      );
      
      if (additional.length > 0) {
        return `${primary} | ${additional.join(' | ')}`;
      }
      return primary;
    }
    
    return uniqueDescriptions[0];
  }
  
  /**
   * Clean and enhance description text
   */
  private cleanDescription(text: string): string | undefined {
    if (!text || text.length < 20) return undefined;
    
    let cleaned = text
      // Remove ellipsis and truncation marks
      .replace(/\.\.\./g, ' ')
      .replace(/…/g, ' ')
      
      // Remove common e-commerce junk
      .replace(/\b(buy now|add to cart|shop online|free shipping|in stock|out of stock)\b/gi, '')
      .replace(/\b(price|msrp|sale|discount|save \$\d+)\b/gi, '')
      .replace(/\$\d+\.?\d*\s*(off|savings?)/gi, '')
      
      // Remove JavaScript errors and technical text
      .replace(/javascript/gi, '')
      .replace(/\berror\b/gi, '')
      .replace(/\b(loading|please wait|404|not found)\b/gi, '')
      
      // Remove repeated characters and fix spacing
      .replace(/([.!?])\1+/g, '$1')
      .replace(/\s+/g, ' ')
      .replace(/\s*[|\-–—]\s*$/, '') // Remove trailing separators
      
      // Capitalize first letter if needed
      .trim();
    
    // Start with capital letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    // Validate quality
    const qualityChecks = [
      cleaned.length >= 30,
      cleaned.length <= 500, // Not too long
      !cleaned.toLowerCase().includes('buy'),
      !cleaned.toLowerCase().includes('cart'),
      !cleaned.toLowerCase().includes('shipping'),
      !cleaned.includes('???'),
      !cleaned.includes('undefined')
    ];
    
    if (qualityChecks.every(check => check)) {
      return cleaned;
    }
    
    return undefined;
  }

  /**
   * Check if a product name is valid
   * V2.5.5: Use critical fixes validation to prevent non-product content
   */
  private isValidProductName(name: string, category: string, source?: string): boolean {
    if (!name || name.length < 5 || name.length > 150) return false;
    
    const lowerName = name.toLowerCase();
    
    // Additional skip patterns specific to scraper
    const skipPatterns = [
      'shop', 'buy', 'browse', 'search', 'collection', 'catalog',
      'all products', 'home page', 'gift card', 'accessories',
      'glasses', 'barware', 'cigar', 'best local price',
      'compare prices', 'find stores', 'unlock exclusive', 'rewards member',
      'priority access', 'faq', 'sign up', 'newsletter', 'shipping'
    ];
    
    if (skipPatterns.some(pattern => lowerName.includes(pattern))) {
      return false;
    }
    
    // V2.6.5: For catalog pages from known retailers, be less strict
    // These often have brand names without spirit type indicators
    if (source && this.isReputableRetailer(source)) {
      // Just check if it looks like a brand/product name
      const brandPattern = /^[A-Z][a-zA-Z'\s&.-]+/;
      if (brandPattern.test(name)) {
        // Check against known brands
        const knownBrands = [
          'W.L. Weller', 'W. L. Weller', 'Buffalo Trace', 'Eagle Rare',
          'Blanton\'s', 'Stagg', 'Pappy Van Winkle', 'Four Roses',
          'Wild Turkey', 'Maker\'s Mark', 'Jim Beam', 'Jack Daniel\'s',
          'Elijah Craig', 'Heaven Hill', 'Woodford Reserve', 'Knob Creek',
          // V2.7.3: Add cognac brands
          'Hennessy', 'Remy Martin', 'Rémy Martin', 'Martell', 'Courvoisier',
          'Hine', 'Camus', 'Pierre Ferrand', 'D\'Ussé', 'D\'usse', 'ABK6',
          'Louis XIII', 'Baron Otard', 'Delamain', 'Frapin', 'Hardy'
        ];
        
        if (knownBrands.some(brand => name.toLowerCase().includes(brand.toLowerCase()))) {
          return true;
        }
        
        // If it's 2-4 words and starts with capital, likely a brand
        const wordCount = name.split(/\s+/).length;
        if (wordCount >= 1 && wordCount <= 4) {
          return true;
        }
      }
    }
    
    // For non-catalog pages, use stricter validation
    if (!V25CriticalFixes.isValidProductName(name)) {
      logger.debug(`❌ Rejected non-product name: "${name}"`);
      return false;
    }
    
    // Must contain spirit-related words (kept for category matching)
    const spiritWords = ['whiskey', 'whisky', 'bourbon', 'rum', 'vodka', 'gin', 'tequila', 'scotch', 'rye', 'brandy', 'cognac'];
    return spiritWords.some(word => lowerName.includes(word));
  }
  
  private isReputableRetailer(url: string): boolean {
    const retailers = [
      'totalwine.com', 'klwines.com', 'thewhiskyexchange.com',
      'wine.com', 'masterofmalt.com', 'seelbachs.com',
      'flaviar.com', 'caskers.com', 'wine-searcher.com'
    ];
    return retailers.some(retailer => url.toLowerCase().includes(retailer));
  }
  
  /**
   * Clean product name
   */
  private cleanProductName(name: string): string {
    // V2.6.5: Enhanced cleaning for catalog page titles
    let cleaned = name;
    
    // First, check if this is a non-product catalog page that should be skipped
    const skipPatterns = [
      // Brand catalog pages - just brand name without product
      /^[A-Z][a-zA-Z'\s.-]+\s*[-–]\s*(?:Spirits|Wine|Beer)\s*\|\s*Total Wine/i,
      // Generic category pages
      /^(?:Spirits|Wine|Beer|Whiskey|Bourbon|Vodka|Gin|Rum|Tequila)\s*\|/i,
      // FAQ and help pages
      /(?:FAQ|Help|About|Contact|Priority Access)\s*\|/i
    ];
    
    // Check if we should skip this entirely
    for (const pattern of skipPatterns) {
      if (pattern.test(cleaned)) {
        // Check if it contains actual product indicators
        const hasProductInfo = /\b(?:\d+ml|\d+\s*Year|Proof|Single Barrel|Small Batch)\b/i.test(cleaned);
        if (!hasProductInfo) {
          // Mark as skip by returning empty string
          return '';
        }
      }
    }
    
    // Handle common retailer patterns for actual products
    const retailerPatterns = [
      // Product pages with full names
      /^(.+?)\s*\|\s*Total Wine/i,
      /^(.+?)\s*:\s*The Whisky Exchange/i,
      /^(.+?)\s*-\s*Master of Malt/i,
      /^Buy\s+(.+?)\s+Online\s*\|\s*Wine\.com/i,
      /^(.+?)\s*-\s*K&L Wines/i
    ];
    
    // Try to extract just the product name from retailer patterns
    for (const pattern of retailerPatterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        cleaned = match[1].trim();
        break;
      }
    }
    
    // Then apply existing cleaning
    cleaned = cleaned
      .replace(/\s*[-|]\s*(Buy|Shop|Store|Online|Price).*$/i, '')
      .replace(/\s*[-|]\s*(Total Wine|Wine\.com|K&L|Whisky Exchange|Master of Malt).*$/i, '')
      .replace(/\s*\(\d+\)\s*$/, '') // Remove SKU numbers
      .replace(/\s*[-–—]\s*$/, '') // Remove trailing dashes
      .replace(/\s+Spirits\s*$/i, '') // Remove "Spirits" suffix
      .replace(/\s*\.\.\.\s*$/, '') // Remove ellipsis
      .trim();
    
    // Apply critical fix for empty parentheses
    cleaned = V25CriticalFixes.removeEmptyParentheses(cleaned);
    
    return TextProcessor.fixTextSpacing(cleaned);
  }
  
  /**
   * Extract product from title
   */
  private extractFromTitle(title: string, category: string, link: string): any | null {
    // V2.6.5: Clean the title FIRST before validation
    const cleaned = this.cleanProductName(title);
    
    // If cleaning returned empty string, skip this title
    if (!cleaned) {
      return null;
    }
    
    // Now validate the cleaned name, not the raw title
    if (!this.isValidProductName(cleaned, category, link)) {
      return null;
    }
    
    // Try to extract brand and product info
    const brandMatch = cleaned.match(/^([A-Z][a-zA-Z\s&'.-]+?)\s+(\w+.*)/);  
    let brand = '';
    let productName = cleaned;
    
    if (brandMatch) {
      brand = brandMatch[1].trim();
      // Make sure the brand isn't a generic word
      const genericWords = ['The', 'Buy', 'Shop', 'New', 'Best', 'Premium'];
      if (!genericWords.includes(brand)) {
        productName = cleaned;
      }
    }
    
    // Extract price from title if present
    const priceMatch = title.match(/\$(\d+\.?\d*)/);
    
    return {
      name: productName,
      brand: brand || TextProcessor.extractBrandFromName(productName),
      category: category,
      price: priceMatch ? this.extractPrice(priceMatch[1]) : undefined,
      source_url: link,
      data_source: 'title_extraction'
    };
  }

  /**
   * Extract products from snippet text
   */
  private extractFromSnippet(snippet: string, category: string, link: string): any[] {
    const products: any[] = [];
    if (!snippet) return products;

    // Pattern 1: "Product Name - $XX.XX" or "Product Name ... $XX.XX"
    const pricePatterns = [
      /([A-Za-z\s&'.-]+(?:Whiskey|Bourbon|Rum|Vodka|Gin|Tequila|Scotch|Rye|Cognac|Brandy|Armagnac)[A-Za-z\s&'.-]*?)\s*[-–...]\s*\$(\d+\.?\d*)/gi,
      /([A-Za-z\s&'.-]+?)\s+(?:Whiskey|Bourbon|Rum|Vodka|Gin|Tequila|Scotch|Rye|Cognac|Brandy|Armagnac)\s*[-–...]\s*\$(\d+\.?\d*)/gi
    ];
    
    for (const pattern of pricePatterns) {
      const matches = Array.from(snippet.matchAll(pattern));
      for (const match of matches) {
        const name = match[1].trim();
        if (this.isValidProductName(name, category, link)) {
          const cleanName = this.cleanProductName(name);
          // Avoid duplicates
          if (!products.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
            products.push({
              name: cleanName,
              brand: TextProcessor.extractBrandFromName(cleanName),
              category: category,
              price: this.extractPrice(match[2]),
              source_url: link,
              data_source: 'snippet_extraction'
            });
          }
        }
      }
    }
    
    // Pattern 2: Look for product listings without prices
    const listingPattern = /(?:^|\n|;|•|·|\|)\s*([A-Z][A-Za-z\s&'.-]+(?:Whiskey|Bourbon|Rum|Vodka|Gin|Tequila|Scotch|Rye|Cognac|Brandy|Armagnac)[A-Za-z\s&'.-]*?)(?:\s*[-–]|$|\n|;)/gi;
    const listingMatches = Array.from(snippet.matchAll(listingPattern));
    
    for (const match of listingMatches) {
      const name = match[1].trim();
      if (this.isValidProductName(name, category, link) && name.length < 80) {
        const cleanName = this.cleanProductName(name);
        if (!products.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
          products.push({
            name: cleanName,
            brand: this.extractBrandFromName(cleanName),
            category: category,
            source_url: link,
            data_source: 'snippet_listing'
          });
        }
      }
    }

    return products.slice(0, 5); // Limit to avoid noise
  }

  /**
   * Extract advanced metadata (age, style, proof) from spirit name and description
   */
  private extractAdvancedMetadata(spirit: any): any {
    const text = `${spirit.name || ''} ${spirit.description || ''}`.toLowerCase();
    const metadata: any = {};
    
    // Extract age statements
    const agePatterns = [
      /(\d{1,2})\s*year(?:s?)?\s*old/,
      /(\d{1,2})\s*yr\b/,
      /(\d{1,2})\s*years?\b/,
      /aged\s*(\d{1,2})\s*years?/,
      /(\d{1,2})\s*year/
    ];
    
    for (const pattern of agePatterns) {
      const match = text.match(pattern);
      if (match) {
        const age = parseInt(match[1]);
        if (age >= 3 && age <= 50) { // Reasonable age range
          // Convert age number to formatted string
          metadata.age_statement = `${age} Year${age > 1 ? 's' : ''}`;
          break;
        }
      }
    }
    
    // Extract whiskey styles
    const stylePatterns = [
      { pattern: /single\s*barrel/, style: 'Single Barrel' },
      { pattern: /small\s*batch/, style: 'Small Batch' },
      { pattern: /cask\s*strength/, style: 'Cask Strength' },
      { pattern: /barrel\s*(?:strength|proof)/, style: 'Barrel Strength' },
      { pattern: /bottled[\s-]*in[\s-]*bond|BiB/, style: 'Bottled-in-Bond' },
      { pattern: /straight\s*bourbon/, style: 'Straight Bourbon' },
      { pattern: /straight\s*rye/, style: 'Straight Rye' },
      { pattern: /straight\s*whiskey/, style: 'Straight Whiskey' },
      { pattern: /single\s*malt/, style: 'Single Malt' },
      { pattern: /double\s*oak/, style: 'Double Oaked' },
      { pattern: /(?:port|sherry|wine|rum|cognac)\s*(?:cask\s*)?finish/, style: 'Finished' },
      { pattern: /reserve(?!\s*(?:bar|restaurant))/, style: 'Reserve' },
      { pattern: /limited\s*edition|special\s*release/, style: 'Limited Edition' },
      { pattern: /private\s*(?:selection|barrel|pick)/, style: 'Private Selection' },
      { pattern: /store\s*pick|exclusive/, style: 'Store Pick' },
      { pattern: /vintage\s*\d{4}/, style: 'Vintage' },
      { pattern: /full\s*proof/, style: 'Full Proof' },
      { pattern: /wheated/, style: 'Wheated' },
      { pattern: /high\s*rye/, style: 'High Rye' },
      { pattern: /toasted\s*barrel/, style: 'Toasted Barrel' },
      { pattern: /triple\s*cask/, style: 'Triple Cask' },
      { pattern: /peated/, style: 'Peated' },
      { pattern: /cask\s*finish/, style: 'Cask Finished' },
      { pattern: /select|selection/, style: 'Select' }
    ];
    
    const detectedStyles: string[] = [];
    for (const { pattern, style } of stylePatterns) {
      if (pattern.test(text)) {
        detectedStyles.push(style);
      }
    }
    
    if (detectedStyles.length > 0) {
      metadata.whiskey_style = detectedStyles.join(', ');
    }
    
    // Extract proof alongside ABV
    const proofPatterns = [
      /(\d{2,3}(?:\.\d+)?)\s*proof/,
      /proof[\s:](\d{2,3}(?:\.\d+)?)/,
      /(\d{2,3}(?:\.\d+)?)°?\s*proof/
    ];
    
    for (const pattern of proofPatterns) {
      const match = text.match(pattern);
      if (match) {
        const proof = parseFloat(match[1]);
        if (proof >= 80 && proof <= 200) { // Reasonable proof range
          metadata.proof = proof;
          // Also calculate ABV if not already present
          if (!spirit.abv) {
            metadata.abv = proof / 2;
          }
          break;
        }
      }
    }
    
    // Extract region/origin
    const regionPatterns = [
      { pattern: /kentucky/i, region: 'Kentucky' },
      { pattern: /tennessee/i, region: 'Tennessee' },
      { pattern: /highland/i, region: 'Highland' },
      { pattern: /islay/i, region: 'Islay' },
      { pattern: /speyside/i, region: 'Speyside' },
      { pattern: /lowland/i, region: 'Lowland' },
      { pattern: /campbeltown/i, region: 'Campbeltown' },
      { pattern: /irish/i, region: 'Ireland' },
      { pattern: /japanese/i, region: 'Japan' },
      { pattern: /canadian/i, region: 'Canada' }
    ];
    
    for (const { pattern, region } of regionPatterns) {
      if (pattern.test(text)) {
        metadata.origin_region = region;
        break;
      }
    }
    
    // Extract cask type
    const caskPatterns = [
      { pattern: /ex[\s-]*bourbon/, cask: 'Ex-Bourbon' },
      { pattern: /sherry\s*cask/, cask: 'Sherry' },
      { pattern: /port\s*cask/, cask: 'Port' },
      { pattern: /wine\s*cask/, cask: 'Wine' },
      { pattern: /cognac\s*cask/, cask: 'Cognac' },
      { pattern: /rum\s*cask/, cask: 'Rum' },
      { pattern: /virgin\s*oak/, cask: 'Virgin Oak' },
      { pattern: /charred\s*oak/, cask: 'Charred Oak' },
      { pattern: /toasted/, cask: 'Toasted' },
      { pattern: /mizunara/, cask: 'Mizunara' }
    ];
    
    for (const { pattern, cask } of caskPatterns) {
      if (pattern.test(text)) {
        metadata.cask_type = cask;
        break;
      }
    }
    
    return metadata;
  }

  /**
   * Store spirit in database
   */
  private async storeSpirit(spirit: any): Promise<boolean> {
    try {
      // Apply critical fixes before storing
      const fixedSpirit = V25CriticalFixes.applyAllFixes(spirit);
      
      // V2.6.1: Use smart NLP-based validation with more lenient handling
      const validationResult = await smartProductValidator.validateProductName(fixedSpirit.name);
      
      // Log validation details for debugging
      if (validationResult.confidence < 0.5) {
        logger.debug(`⚠️ Smart validator warning for: "${fixedSpirit.name}"`);
        logger.debug(`   Confidence: ${validationResult.confidence.toFixed(2)}`);
        logger.debug(`   Issues: ${validationResult.issues.join(', ')}`);
      }
      
      // V2.6.1: Only reject if confidence is VERY low or has critical issues
      if (!validationResult.isValid && validationResult.confidence < 0.1) {
        logger.warn(`❌ Smart validator rejected (confidence ${validationResult.confidence.toFixed(2)}): "${fixedSpirit.name}"`);
        logger.debug(`   Issues: ${validationResult.issues.join(', ')}`);
        if (validationResult.suggestions.length > 0) {
          logger.debug(`   Suggestions: ${validationResult.suggestions.join(', ')}`);
        }
        
        // Learn from this rejection
        smartProductValidator.learnFromFeedback(fixedSpirit.name, false, validationResult.issues[0]);
        
        return false;
      }
      
      // If validation suggests a normalized name, use it
      if (validationResult.normalizedName) {
        logger.debug(`📝 Normalized name: "${fixedSpirit.name}" → "${validationResult.normalizedName}"`);
        fixedSpirit.name = validationResult.normalizedName;
      }
      
      // Also run the existing V2.5.5 validation as a backup
      if (!V25CriticalFixes.isValidProductName(fixedSpirit.name)) {
        logger.warn(`❌ V2.5.5 validator also rejected: "${fixedSpirit.name}"`);
        return false;
      }
      
      // Detect proper type
      const typeDetection = detectSpiritType(fixedSpirit.name, fixedSpirit.brand || '', fixedSpirit.description);
      const detectedType = typeDetection?.type || fixedSpirit.category;
      
      // Skip if the detected type doesn't match the category we're searching for
      // Allow some flexibility (e.g., "Whiskey" matches "Bourbon")
      const categoryMap: Record<string, string[]> = {
        'bourbon': ['Bourbon', 'Whiskey', 'Tennessee Whiskey', 'Bottled-in-Bond', 'Kentucky Straight Bourbon'],
        'whiskey': ['Whiskey', 'Bourbon', 'Rye Whiskey', 'Tennessee Whiskey', 'Irish Whiskey', 'Canadian Whisky'],
        'scotch': ['Scotch', 'Single Malt Scotch', 'Blended Scotch', 'Highland', 'Islay', 'Speyside'],
        'tequila': ['Tequila', 'Blanco', 'Reposado', 'Añejo', 'Extra Añejo'],
        'rum': ['Rum', 'White Rum', 'Gold Rum', 'Dark Rum', 'Spiced Rum'],
        'vodka': ['Vodka'],
        'gin': ['Gin', 'London Dry Gin', 'Navy Strength Gin'],
        'cognac': ['Cognac', 'Brandy', 'Armagnac', 'VS', 'VSOP', 'XO', 'Napoleon', 'Extra']
      };
      
      // For searchAndExtract, be more flexible with type matching
      // If fixedSpirit.category is 'whiskey' (from searchAndExtract), accept all whiskey types
      const categoryKey = fixedSpirit.category.toLowerCase();
      const allowedTypes = categoryMap[categoryKey] || [fixedSpirit.category];
      
      // Special handling for generic searches (searchAndExtract)
      // If the detected type is any valid spirit type, allow it
      if (categoryKey === 'whiskey' || categoryKey === 'spirits') {
        // Accept any valid spirit type when doing generic searches
        const allValidTypes = Object.values(categoryMap).flat();
        if (detectedType && allValidTypes.some(validType => detectedType.includes(validType))) {
          // Type is valid, continue with storage
          logger.debug(`✓ Accepting ${fixedSpirit.name} - detected type: ${detectedType}`);
        } else if (!detectedType) {
          // No type detected, but allow storage for generic searches
          logger.debug(`✓ Accepting ${fixedSpirit.name} - no specific type detected`);
        }
      } else {
        // Strict type checking for category-specific searches
        if (!allowedTypes.some(allowed => detectedType?.includes(allowed))) {
          logger.debug(`⏭️ Skipping ${fixedSpirit.name} - type mismatch: ${detectedType} not in [${allowedTypes.join(', ')}]`);
          return false;
        }
      }
      
      // Extract advanced metadata
      const advancedMetadata = this.extractAdvancedMetadata(fixedSpirit);
      
      // V2.5.5: Extract price from description if not already set
      let finalPrice = fixedSpirit.price;
      
      // V2.6.3: Add logging for price debugging
      if (!finalPrice) {
        logger.debug(`🔍 No initial price for: ${fixedSpirit.name}`);
        if (fixedSpirit.description) {
          logger.debug(`  Description available: ${fixedSpirit.description.substring(0, 100)}...`);
        }
      }
      
      if (!finalPrice && fixedSpirit.description) {
        // Try to extract price from description
        const descPricePatterns = [
          /\$\s*([\d,]+\.?\d{0,2})(?:\s|$|[^\d])/,
          /USD\s*([\d,]+\.?\d*)/i,
          /(?:price|msrp|our\s+price|sale|now):\s*\$?([\d,]+\.?\d*)/i,
          /\(\$?([\d,]+\.?\d*)\)/,
          /\d+ml\s*[).\s-]*\s*\$?([\d,]+\.?\d*)/i,
          /750ml[).\s-]*\s*\$?([\d,]+\.?\d*)/i
        ];
        
        for (const pattern of descPricePatterns) {
          const match = fixedSpirit.description.match(pattern);
          if (match) {
            const price = this.extractPrice(match[1]);
            if (price) {
              finalPrice = price;
              logger.debug(`💰 Extracted price from description: $${price}`);
              break;
            }
          }
        }
      }
      
      // PRICE VALIDATION: Ensure price is reasonable for spirits
      if (finalPrice) {
        // Check if price is in a reasonable range ($10-$5000)
        if (finalPrice < 10) {
          logger.warn(`⚠️ Suspiciously low price: $${finalPrice} for ${fixedSpirit.name}`);
          // Might be wrong decimal place (e.g., 20 instead of 200)
          if (finalPrice * 10 >= 30 && finalPrice * 10 <= 5000) {
            finalPrice = finalPrice * 10;
            logger.info(`💰 Adjusted price: $${finalPrice}`);
          } else {
            // Too low, ignore it
            finalPrice = null;
            logger.warn(`❌ Rejected unrealistic price`);
          }
        } else if (finalPrice > 5000) {
          logger.warn(`⚠️ Suspiciously high price: $${finalPrice} for ${fixedSpirit.name}`);
          // Might be in different currency or wrong decimal
          if (finalPrice / 100 >= 30 && finalPrice / 100 <= 500) {
            finalPrice = finalPrice / 100;
            logger.info(`💰 Adjusted price: $${finalPrice}`);
          } else {
            // Too high, ignore it
            finalPrice = null;
            logger.warn(`❌ Rejected unrealistic price`);
          }
        }
      }
      
      // Calculate ABV and proof
      const calculatedAbv = fixedSpirit.abv || advancedMetadata.abv || this.extractABV(fixedSpirit.description || fixedSpirit.snippet, detectedType);
      // V2.6.3: Always calculate proof if ABV exists, use 0 if no ABV (for database schema compliance)
      const calculatedProof = calculatedAbv ? Math.round(calculatedAbv * 2) : 0;
      
      const spiritData = {
        name: fixedSpirit.name,
        brand: fixedSpirit.brand || TextProcessor.extractBrandFromName(fixedSpirit.name),
        category: detectedType,
        price: finalPrice,
        abv: calculatedAbv,
        proof: calculatedProof,  // V2.6: Calculate proof from ABV
        volume: fixedSpirit.volume || '750ml',
        image_url: fixedSpirit.image_url,
        description: fixedSpirit.description,
        source_url: fixedSpirit.source_url,
        data_source: fixedSpirit.data_source,
        data_quality_score: this.calculateQualityScore(fixedSpirit),
        // Enhanced metadata with advanced extraction
        age_statement: advancedMetadata.age_statement,
        whiskey_style: advancedMetadata.whiskey_style,
        origin_region: advancedMetadata.origin_region,
        cask_type: advancedMetadata.cask_type,
        metadata: {
          ...advancedMetadata,
          extraction_version: 'v2.5_enhanced'
        }
      };

      const result = await this.storage.storeSpirit(spiritData);
      
      if (result.success) {
        logger.debug(`✅ Stored: ${fixedSpirit.name}`);
        
        // Track spirit type
        if (detectedType) {
          this.spiritTypesSet.add(detectedType);
        }
        
        // V2.6: Learn from successful storage
        smartProductValidator.learnFromFeedback(spiritData.name, true, 'valid_product');
        
        return true;
      } else {
        logger.warn(`❌ Failed to store: ${fixedSpirit.name} - Error: ${result.error || 'Unknown error'}`);
        if (result.isDuplicate) {
          logger.debug(`  Marked as duplicate`);
        }
        return false;
      }
    } catch (error) {
      logger.error(`Error storing spirit: ${error}`);
      return false;
    }
  }

  /**
   * Extract price from various formats with enhanced logic
   */
  private extractPrice(priceStr: any, context?: string): number | undefined {
    if (!priceStr) return undefined;
    
    // If already a number, validate it's a reasonable price
    if (typeof priceStr === 'number') {
      return priceStr >= 5 && priceStr <= 10000 ? priceStr : undefined;
    }
    
    const str = priceStr.toString();
    
    // Skip if context suggests this is not a price (volume, year, etc)
    if (context) {
      const nonPriceIndicators = ['ml', 'liter', 'year', 'aged', 'proof', 'abv'];
      const lowerContext = context.toLowerCase();
      if (nonPriceIndicators.some(indicator => lowerContext.includes(indicator))) {
        return undefined;
      }
    }
    
    // Handle structured price formats
    let price: number | undefined;
    
    // Try USD format
    if (str.includes('USD')) {
      const match = str.match(/USD\s*([\d,]+\.?\d*)/);
      if (match) {
        price = parseFloat(match[1].replace(/,/g, ''));
      }
    }
    
    // Try dollar sign format
    if (!price) {
      const match = str.match(/\$\s*([\d,]+\.?\d*)/);
      if (match) {
        price = parseFloat(match[1].replace(/,/g, ''));
      }
    }
    
    // Try plain number
    if (!price) {
      const cleaned = str.replace(/[^0-9.]/g, '');
      if (cleaned) {
        price = parseFloat(cleaned);
      }
    }
    
    // Currency conversion
    let multiplier = 1;
    if (str.includes('£') || str.toLowerCase().includes('gbp')) {
      multiplier = 1.27; // GBP to USD
    } else if (str.includes('€') || str.toLowerCase().includes('eur')) {
      multiplier = 1.08; // EUR to USD
    }
    
    if (price) {
      price = price * multiplier;
      // Validate reasonable price range
      return price >= 5 && price <= 10000 ? price : undefined;
    }
    
    return undefined;
  }

  /**
   * Extract ABV from text with enhanced patterns
   */
  private extractABV(text: string, spiritType?: string): number | undefined {
    if (!text) return undefined;
    
    // Try various patterns
    const patterns = [
      /(\d+(?:\.\d+)?)\s*%\s*(?:ABV|alc|alcohol)/i,
      /(\d+(?:\.\d+)?)\s*%/,
      /(\d+)\s*proof/i,
      /ABV[:\s]+(\d+(?:\.\d+)?)/i,
      /alcohol[:\s]+(\d+(?:\.\d+)?)\s*%/i,
      /(\d+(?:\.\d+)?)\s*degrees/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        
        // Convert proof to ABV if needed
        if (pattern.toString().includes('proof')) {
          const abv = value / 2;
          // Validate ABV range after conversion
          if (abv >= 20 && abv <= 75) {
            return abv;
          }
        } else {
          // Validate ABV range
          if (value >= 20 && value <= 75) {
            return value;
          }
        }
      }
    }
    
    // Return category defaults if no ABV found
    if (spiritType) {
      const categoryDefaults: Record<string, number> = {
        'vodka': 40,
        'gin': 40,
        'rum': 40,
        'tequila': 40,
        'bourbon': 45,
        'whiskey': 43,
        'scotch': 43,
        'rye': 45
      };
      
      const lowerType = spiritType.toLowerCase();
      for (const [key, defaultAbv] of Object.entries(categoryDefaults)) {
        if (lowerType.includes(key)) {
          logger.debug(`Using default ABV ${defaultAbv}% for ${spiritType}`);
          return defaultAbv;
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
   * Enhanced brand extraction from spirit name
   */
  private extractBrandFromName(name: string): string {
    // Use the improved brand extraction from V25CriticalFixes
    return V25CriticalFixes.extractBrandFromName(name);
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
   * Enhanced quality score calculation including advanced metadata
   */
  private calculateQualityScore(spirit: any): number {
    let score = 0; // Start from 0
    
    // Name quality (up to 20 points)
    if (spirit.name && spirit.name.length > 5) {
      score += 10;
      // Extra points for detailed names with year/age/type
      const hasDetail = /\d{2,4}|year|aged|single|barrel|batch|reserve/i.test(spirit.name);
      if (hasDetail && !spirit.name.toLowerCase().includes('shop')) {
        score += 10;
      }
    }
    
    // Price (20 points - most important for commerce)
    if (spirit.price && spirit.price > 10 && spirit.price < 5000) {
      score += 20;
    }
    
    // ABV/Proof (15 points)
    if (spirit.abv && spirit.abv >= 20 && spirit.abv <= 75) {
      score += 15;
    } else if (spirit.proof && spirit.proof >= 40 && spirit.proof <= 150) {
      score += 15;
    }
    
    // Brand (15 points)
    if (spirit.brand && spirit.brand.length > 2 && spirit.brand !== 'Unknown') {
      score += 15;
    }
    
    // Description (15 points)
    if (spirit.description && spirit.description.length > 30) {
      score += 10;
      // Extra points for detailed descriptions
      if (spirit.description.length > 100 && !spirit.description.includes('JavaScript')) {
        score += 5;
      }
    }
    
    // Image URL (10 points)
    if (spirit.image_url && spirit.image_url.startsWith('http')) {
      score += 10;
    }
    
    // Source quality (5 points)
    const trustedSources = ['totalwine.com', 'klwines.com', 'thewhiskyexchange.com', 'wine.com', 'masterofmalt.com'];
    if (spirit.source_url && trustedSources.some(domain => spirit.source_url.includes(domain))) {
      score += 5;
    }
    
    // Advanced metadata bonus points (up to 15 additional points)
    const advancedMetadata = this.extractAdvancedMetadata(spirit);
    
    // Age statement (5 points)
    if (advancedMetadata.age_statement) {
      score += 5;
    }
    
    // Whiskey style (5 points)
    if (advancedMetadata.whiskey_style) {
      score += 5;
    }
    
    // Region/cask info (3 points each)
    if (advancedMetadata.origin_region) {
      score += 3;
    }
    
    if (advancedMetadata.cask_type) {
      score += 2;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Log final metrics summary
   */
  private async logFinalMetrics(category?: string) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ULTRA-EFFICIENT SCRAPING RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n🔍 API Calls: ${this.metrics.apiCalls}`);
    console.log(`🥃 Spirits Found: ${this.metrics.spiritsFound}`);
    console.log(`💾 Spirits Stored: ${this.metrics.spiritsStored}`);
    console.log(`📈 Efficiency: ${this.metrics.efficiency.toFixed(1)} spirits/call`);
    console.log(`📑 Catalog Pages Found: ${this.metrics.catalogPagesFound}`);
    
    // V2.7: Show actual database count
    if (category) {
      const dbCount = await this.storage.getSpiritCountByCategory(category);
      console.log(`\n📚 Total ${category} spirits in database: ${dbCount}`);
    }
    
    if (this.metrics.catalogPagesFound > 0) {
      console.log(`📊 Avg Spirits per Catalog: ${this.metrics.averageSpiritsPerCatalog.toFixed(1)}`);
    }
    
    console.log('\n🏆 TOP PERFORMING QUERIES:');
    this.metrics.topPerformingQueries.slice(0, 5).forEach((q, i) => {
      console.log(`${i + 1}. ${q.query}`);
      console.log(`   Yield: ${q.spiritsYield} spirits`);
    });
    
    // Show efficiency achievement
    if (this.metrics.efficiency >= 0.6) {
      console.log(`\n🎯 Target efficiency achieved! (60%+ = ${this.metrics.efficiency.toFixed(1)} spirits/call)`);
    } else {
      console.log(`\n⚠️ Below target efficiency: ${this.metrics.efficiency.toFixed(1)} spirits/call (target: 0.6+)`);
    }
    
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