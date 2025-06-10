import { EnhancedQueryGenerator } from './enhanced-query-generator.js';
import { cacheService } from './cache-service.js';
import { apiCallTracker } from './api-call-tracker.js';
import { logger } from '../utils/logger.js';

export interface QueryDiversityOptions {
  category?: string;
  limit?: number;
  minCacheAge?: number; // Avoid queries cached within X hours
  maxCacheHitRate?: number; // Target cache hit rate threshold
  useTimeRandomization?: boolean;
  useBrandRotation?: boolean;
  useRegionalVariation?: boolean;
  forceUniqueQueries?: boolean;
}

export interface QueryAnalytics {
  totalGenerated: number;
  potentialCacheHits: number;
  expectedCacheMisses: number;
  diversityScore: number; // 0-100
  timeVariationUsed: boolean;
  brandRotationUsed: boolean;
  regionalVariationUsed: boolean;
}

export class DiversifiedQueryGenerator extends EnhancedQueryGenerator {
  private usedQueries: Set<string> = new Set();
  private queryHistory: Map<string, number> = new Map(); // query -> timestamp
  private brandRotationIndex: number = 0;
  private regionRotationIndex: number = 0;
  private timeVariationSeed: number = Date.now();

  /**
   * Generate diversified queries optimized for cache avoidance and high success rates
   */
  async generateDiversifiedQueries(options: QueryDiversityOptions = {}): Promise<{
    queries: string[];
    analytics: QueryAnalytics;
  }> {
    const {
      category = 'bourbon',
      limit = 50,
      minCacheAge = 24, // 24 hours
      maxCacheHitRate = 0.3, // Max 30% cache hits
      useTimeRandomization = true,
      useBrandRotation = true,
      useRegionalVariation = true,
      forceUniqueQueries = true,
    } = options;

    logger.info(`🎯 Generating ${limit} diversified queries for category: ${category}`);
    
    // Initialize cache service
    await cacheService.initialize();
    
    const queries: string[] = [];
    const analytics: QueryAnalytics = {
      totalGenerated: 0,
      potentialCacheHits: 0,
      expectedCacheMisses: 0,
      diversityScore: 0,
      timeVariationUsed: useTimeRandomization,
      brandRotationUsed: useBrandRotation,
      regionalVariationUsed: useRegionalVariation,
    };

    // Strategy 1: Time-based query variations (25% of queries)
    if (useTimeRandomization) {
      const timeQueries = await this.generateTimeVariationQueries(category, Math.ceil(limit * 0.25));
      const filteredTimeQueries = await this.filterCachedQueries(timeQueries, minCacheAge);
      queries.push(...filteredTimeQueries);
      logger.debug(`📅 Generated ${filteredTimeQueries.length} time-variation queries`);
    }

    // Strategy 2: Brand rotation queries (25% of queries)
    if (useBrandRotation) {
      const brandQueries = await this.generateBrandRotationQueries(category, Math.ceil(limit * 0.25));
      const filteredBrandQueries = await this.filterCachedQueries(brandQueries, minCacheAge);
      queries.push(...filteredBrandQueries);
      logger.debug(`🏷️  Generated ${filteredBrandQueries.length} brand-rotation queries`);
    }

    // Strategy 3: Regional variation queries (20% of queries)
    if (useRegionalVariation) {
      const regionalQueries = await this.generateRegionalVariationQueries(category, Math.ceil(limit * 0.20));
      const filteredRegionalQueries = await this.filterCachedQueries(regionalQueries, minCacheAge);
      queries.push(...filteredRegionalQueries);
      logger.debug(`🌍 Generated ${filteredRegionalQueries.length} regional-variation queries`);
    }

    // Strategy 4: Semantic variations (15% of queries) 
    const semanticQueries = await this.generateSemanticVariations(category, Math.ceil(limit * 0.15));
    const filteredSemanticQueries = await this.filterCachedQueries(semanticQueries, minCacheAge);
    queries.push(...filteredSemanticQueries);
    logger.debug(`🔤 Generated ${filteredSemanticQueries.length} semantic-variation queries`);

    // Strategy 5: Niche discovery queries (15% of queries)
    const nicheQueries = await this.generateNicheDiscoveryQueries(category, Math.ceil(limit * 0.15));
    const filteredNicheQueries = await this.filterCachedQueries(nicheQueries, minCacheAge);
    queries.push(...filteredNicheQueries);
    logger.debug(`🔍 Generated ${filteredNicheQueries.length} niche-discovery queries`);

    // Fill remaining quota with high-diversity fallback queries
    const remainingCount = limit - queries.length;
    if (remainingCount > 0) {
      const fallbackQueries = await this.generateHighDiversityFallback(category, remainingCount);
      const filteredFallbackQueries = await this.filterCachedQueries(fallbackQueries, minCacheAge);
      queries.push(...filteredFallbackQueries);
      logger.debug(`⚡ Generated ${filteredFallbackQueries.length} fallback queries`);
    }

    // Remove duplicates if requested
    let finalQueries = queries;
    if (forceUniqueQueries) {
      finalQueries = this.removeDuplicateQueries(queries);
      logger.debug(`🧹 Removed duplicates: ${queries.length} → ${finalQueries.length} unique queries`);
    }

    // Shuffle for maximum randomization
    finalQueries = this.shuffleArray(finalQueries);

    // Calculate analytics
    analytics.totalGenerated = finalQueries.length;
    analytics.potentialCacheHits = await this.estimateCacheHits(finalQueries);
    analytics.expectedCacheMisses = analytics.totalGenerated - analytics.potentialCacheHits;
    analytics.diversityScore = this.calculateDiversityScore(finalQueries, analytics);

    // Log analytics
    logger.info(`📊 Query Diversity Analytics:`);
    logger.info(`   • Total Generated: ${analytics.totalGenerated}`);
    logger.info(`   • Expected Cache Misses: ${analytics.expectedCacheMisses} (${((analytics.expectedCacheMisses / analytics.totalGenerated) * 100).toFixed(1)}%)`);
    logger.info(`   • Diversity Score: ${analytics.diversityScore}/100`);
    logger.info(`   • Time Variation: ${analytics.timeVariationUsed ? '✅' : '❌'}`);
    logger.info(`   • Brand Rotation: ${analytics.brandRotationUsed ? '✅' : '❌'}`);
    logger.info(`   • Regional Variation: ${analytics.regionalVariationUsed ? '✅' : '❌'}`);

    // Store queries in history for future avoidance
    finalQueries.forEach(query => {
      this.usedQueries.add(query);
      this.queryHistory.set(query, Date.now());
    });

    return {
      queries: finalQueries.slice(0, limit),
      analytics,
    };
  }

  /**
   * Generate time-based query variations using temporal diversification
   */
  private async generateTimeVariationQueries(category: string, count: number): Promise<string[]> {
    const queries: string[] = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentWeek = Math.floor(currentDate.getDate() / 7) + 1;
    
    // Time-based seed for consistent but varied results
    let timeSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 6)); // Changes every 6 hours
    const random = () => (Math.sin(timeSeed++) * 10000) % 1;

    const timeVariations = [
      // Current temporal context
      `${category} releases ${currentYear}`,
      `new ${category} ${currentYear}`,
      `${category} ${currentYear} collection`,
      `best ${category} ${currentYear}`,
      
      // Recent releases (time-sensitive)
      `${category} releases this month`,
      `${category} new arrivals week ${currentWeek}`,
      `latest ${category} drops ${currentYear}`,
      `${category} weekly releases`,
      
      // Seasonal variations
      `${category} spring ${currentYear}`,
      `${category} summer collection`,
      `${category} fall releases`,
      `${category} holiday ${currentYear}`,
      
      // Historical time periods with randomization
      `${category} releases ${currentYear - 1}`,
      `vintage ${category} ${currentYear - Math.floor(random() * 5)}`,
      `${category} from ${currentYear - Math.floor(random() * 10)}`,
      
      // Monthly rotations
      `${category} ${this.getMonthName(currentMonth)} releases`,
      `${category} ${this.getMonthName((currentMonth + 1) % 12)} preview`,
      
      // Time-randomized search patterns
      `${category} batch ${Math.floor(random() * 1000)}`,
      `${category} release ${Math.floor(random() * 500)}`,
      `${category} series ${Math.floor(random() * 100)}`,
    ];

    // Add category-specific time variations
    if (category.toLowerCase() === 'bourbon') {
      timeVariations.push(
        `bourbon week ${currentWeek} ${currentYear}`,
        `national bourbon heritage month`,
        `bourbon heritage festival ${currentYear}`,
        `fall bourbon releases ${currentYear}`,
        `bourbon spring collection ${currentYear}`
      );
    }

    // Shuffle and return requested count
    return this.getRandomElements(timeVariations, count);
  }

  /**
   * Generate brand rotation queries to cycle through different brands systematically
   */
  private async generateBrandRotationQueries(category: string, count: number): Promise<string[]> {
    const queries: string[] = [];
    const categoryConfig = this.getCategoryConfig(category.toLowerCase());
    
    if (!categoryConfig?.brands) {
      return this.generateGeneralCategoryQueries(category, count);
    }

    const brands = [...categoryConfig.brands];
    const descriptors = categoryConfig.descriptors || ['premium', 'special', 'limited'];
    
    // Rotate through brands systematically to avoid consecutive duplicates
    for (let i = 0; i < count; i++) {
      const brandIndex = (this.brandRotationIndex + i) % brands.length;
      const brand = brands[brandIndex];
      
      const variations = [
        `${brand} ${category} collection`,
        `${brand} distillery ${category}`,
        `${brand} limited edition ${category}`,
        `${brand} master distiller ${category}`,
        `${brand} ${category} reviews`,
        `${brand} special release ${category}`,
        `${brand} ${category} tasting notes`,
        `${brand} premium ${category}`,
        `${brand} ${category} where to buy`,
        `${brand} ${category} price`,
      ];

      // Add descriptor combinations
      if (descriptors.length > 0) {
        const descriptor = descriptors[i % descriptors.length];
        variations.push(`${brand} ${descriptor} ${category}`);
        variations.push(`${descriptor} ${brand} ${category}`);
      }

      // Select a random variation for this brand
      const selectedVariation = variations[i % variations.length];
      queries.push(selectedVariation);
    }

    // Update rotation index for next call
    this.brandRotationIndex = (this.brandRotationIndex + count) % brands.length;
    
    return queries;
  }

  /**
   * Generate regional variation queries with geographic diversification
   */
  private async generateRegionalVariationQueries(category: string, count: number): Promise<string[]> {
    const queries: string[] = [];
    const categoryConfig = this.getCategoryConfig(category.toLowerCase());
    
    // Default regions if category doesn't have specific ones
    const defaultRegions = ['USA', 'Scotland', 'Ireland', 'Japan', 'Canada'];
    const regions = categoryConfig?.regions || defaultRegions;

    // Additional regional descriptors
    const regionalDescriptors = [
      'distilleries', 'producers', 'craft makers', 'traditional', 'heritage',
      'local', 'artisanal', 'small batch', 'family owned', 'independent'
    ];

    // Rotate through regions systematically
    for (let i = 0; i < count; i++) {
      const regionIndex = (this.regionRotationIndex + i) % regions.length;
      const region = regions[regionIndex];
      const descriptor = regionalDescriptors[i % regionalDescriptors.length];

      const variations = [
        `${region} ${category}`,
        `${category} from ${region}`,
        `${region} ${category} ${descriptor}`,
        `${region} ${descriptor} ${category}`,
        `${category} made in ${region}`,
        `${region} craft ${category}`,
        `traditional ${region} ${category}`,
        `${region} ${category} brands`,
        `${category} distilleries ${region}`,
        `${region} ${category} collection`,
      ];

      queries.push(variations[i % variations.length]);
    }

    // Update rotation index
    this.regionRotationIndex = (this.regionRotationIndex + count) % regions.length;
    
    return queries;
  }

  /**
   * Generate semantic variations using linguistic diversification
   */
  private async generateSemanticVariations(category: string, count: number): Promise<string[]> {
    const queries: string[] = [];
    
    // Semantic variation patterns
    const synonyms = {
      bourbon: ['whiskey', 'whisky', 'american whiskey', 'kentucky whiskey', 'straight bourbon'],
      scotch: ['scotch whisky', 'single malt', 'scottish whisky', 'whisky', 'malt whisky'],
      whiskey: ['whisky', 'american whiskey', 'whiskey spirits', 'distilled spirits'],
      rum: ['rhum', 'caribbean rum', 'sugar cane spirits', 'molasses spirits'],
      gin: ['geneva', 'juniper spirits', 'botanical spirits'],
      vodka: ['neutral spirits', 'clear spirits', 'grain spirits'],
    };

    const qualifiers = [
      'premium', 'craft', 'artisanal', 'small batch', 'handcrafted',
      'authentic', 'traditional', 'heritage', 'vintage', 'rare',
      'limited', 'special', 'exclusive', 'reserve', 'select'
    ];

    const actionWords = [
      'buy', 'purchase', 'shop for', 'find', 'discover', 'explore',
      'taste', 'review', 'compare', 'select', 'choose'
    ];

    const contextWords = [
      'collection', 'selection', 'catalog', 'range', 'series',
      'lineup', 'portfolio', 'offering', 'inventory', 'stock'
    ];

    const categoryVariants = synonyms[category.toLowerCase() as keyof typeof synonyms] || [category];

    // Generate semantic combinations
    for (let i = 0; i < count; i++) {
      const variant = categoryVariants[i % categoryVariants.length];
      const qualifier = qualifiers[i % qualifiers.length];
      const action = actionWords[i % actionWords.length];
      const context = contextWords[i % contextWords.length];

      const patterns = [
        `${qualifier} ${variant}`,
        `${action} ${variant}`,
        `${variant} ${context}`,
        `${qualifier} ${variant} ${context}`,
        `${action} ${qualifier} ${variant}`,
        `best ${variant} to ${action}`,
        `${variant} ${qualifier} ${context}`,
        `top ${qualifier} ${variant}`,
        `${variant} for ${context.slice(0, -1)}`, // Remove 's' from plural context words
      ];

      queries.push(patterns[i % patterns.length]);
    }

    return queries;
  }

  /**
   * Generate niche discovery queries for finding specialized products
   */
  private async generateNicheDiscoveryQueries(category: string, count: number): Promise<string[]> {
    const queries: string[] = [];
    
    const nicheTerms = [
      'rare', 'allocated', 'limited edition', 'single barrel', 'cask strength',
      'barrel proof', 'finished', 'experimental', 'special release', 'vintage',
      'collector', 'investment grade', 'discontinued', 'hard to find',
      'store pick', 'private selection', 'exclusive', 'one-off', 'small run'
    ];

    const discoveryContexts = [
      'bottles', 'releases', 'drops', 'finds', 'gems', 'treasures',
      'discoveries', 'picks', 'selections', 'offerings', 'specimens'
    ];

    const sourceTypes = [
      'distillery exclusive', 'auction house', 'private collection',
      'estate sale', 'liquidation', 'warehouse find', 'vault release',
      'cellar selection', 'back stock', 'special reserve'
    ];

    // Generate niche combinations
    for (let i = 0; i < count; i++) {
      const niche = nicheTerms[i % nicheTerms.length];
      const context = discoveryContexts[i % discoveryContexts.length];
      const source = sourceTypes[i % sourceTypes.length];

      const patterns = [
        `${niche} ${category} ${context}`,
        `${category} ${niche} ${context}`,
        `${source} ${category}`,
        `${niche} ${category} from ${source}`,
        `hunting ${niche} ${category}`,
        `finding ${niche} ${category} ${context}`,
        `${category} ${context} ${niche}`,
        `${niche} ${category} market`,
        `${category} ${niche} availability`,
      ];

      queries.push(patterns[i % patterns.length]);
    }

    return queries;
  }

  /**
   * Generate high-diversity fallback queries when other strategies are exhausted
   */
  private async generateHighDiversityFallback(category: string, count: number): Promise<string[]> {
    const queries: string[] = [];
    const randomSeed = Math.floor(Date.now() / 1000);

    // Generate quasi-random but reproducible patterns
    for (let i = 0; i < count; i++) {
      const seed = randomSeed + i;
      const pseudoRandom = (Math.sin(seed) * 10000) % 1;
      
      const patterns = [
        `${category} catalog page ${Math.floor(pseudoRandom * 1000)}`,
        `${category} inventory ${Math.floor(pseudoRandom * 500)}`,
        `${category} listing ${Math.floor(pseudoRandom * 2000)}`,
        `${category} product ${Math.floor(pseudoRandom * 1500)}`,
        `${category} selection ${Math.floor(pseudoRandom * 800)}`,
        `${category} database ${Math.floor(pseudoRandom * 300)}`,
        `${category} registry ${Math.floor(pseudoRandom * 600)}`,
        `${category} archive ${Math.floor(pseudoRandom * 400)}`,
      ];

      queries.push(patterns[i % patterns.length]);
    }

    return queries;
  }

  /**
   * Filter out queries that are likely to hit cache based on age
   */
  private async filterCachedQueries(queries: string[], minCacheAgeHours: number): Promise<string[]> {
    const minAge = minCacheAgeHours * 60 * 60 * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const filtered: string[] = [];

    for (const query of queries) {
      // Check if query was used recently
      const lastUsed = this.queryHistory.get(query);
      if (lastUsed && (currentTime - lastUsed) < minAge) {
        continue; // Skip recently used queries
      }

      // Check if similar query exists in cache (basic check)
      const cachedResult = await cacheService.getCachedSearchQuery(query, {});
      if (!cachedResult) {
        filtered.push(query);
      }
    }

    return filtered;
  }

  /**
   * Remove duplicate queries from array
   */
  private removeDuplicateQueries(queries: string[]): string[] {
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const query of queries) {
      const normalized = query.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(query);
      }
    }

    return unique;
  }

  /**
   * Estimate potential cache hits for given queries
   */
  private async estimateCacheHits(queries: string[]): Promise<number> {
    let cacheHits = 0;

    // Sample a subset for performance (check every 5th query)
    for (let i = 0; i < queries.length; i += 5) {
      const query = queries[i];
      const cachedResult = await cacheService.getCachedSearchQuery(query, {});
      if (cachedResult) {
        cacheHits++;
      }
    }

    // Extrapolate to full set
    const samplingRatio = Math.min(1, queries.length / 5);
    return Math.round(cacheHits / samplingRatio);
  }

  /**
   * Calculate diversity score based on various factors
   */
  private calculateDiversityScore(queries: string[], analytics: QueryAnalytics): number {
    let score = 0;

    // Base score from cache miss rate
    const cacheMissRate = analytics.expectedCacheMisses / analytics.totalGenerated;
    score += cacheMissRate * 40; // 40 points max for cache misses

    // Points for using different strategies
    if (analytics.timeVariationUsed) score += 15;
    if (analytics.brandRotationUsed) score += 15;
    if (analytics.regionalVariationUsed) score += 15;

    // Points for query uniqueness
    const uniquenessScore = this.calculateQueryUniqueness(queries);
    score += uniquenessScore * 15; // 15 points max for uniqueness

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate uniqueness score for query set
   */
  private calculateQueryUniqueness(queries: string[]): number {
    if (queries.length === 0) return 0;

    const uniqueTerms = new Set<string>();
    queries.forEach(query => {
      const words = query.toLowerCase().split(/\s+/);
      words.forEach(word => uniqueTerms.add(word));
    });

    const avgTermsPerQuery = queries.reduce((sum, q) => sum + q.split(/\s+/).length, 0) / queries.length;
    const uniquenessRatio = uniqueTerms.size / (queries.length * avgTermsPerQuery);

    return Math.min(1, uniquenessRatio);
  }

  /**
   * Get month name by index
   */
  private getMonthName(monthIndex: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex % 12];
  }

  /**
   * Get category configuration (enhanced from parent class)
   */
  private getCategoryConfig(category: string) {
    const configs = {
      bourbon: {
        brands: [
          'Buffalo Trace', 'Maker\'s Mark', 'Wild Turkey', 'Four Roses', 'Woodford Reserve',
          'Elijah Craig', 'Knob Creek', 'Bulleit', 'Jim Beam', 'Heaven Hill',
          'Old Forester', 'Eagle Rare', 'Blanton\'s', 'Pappy Van Winkle', 'Weller',
          'George T. Stagg', 'Booker\'s', 'Basil Hayden', 'Angel\'s Envy', 'Michter\'s',
          'Henry McKenna', 'Very Old Barton', 'Evan Williams', 'Old Grand-Dad', 'Larceny',
        ],
        descriptors: [
          'wheated', 'high rye', 'single barrel', 'small batch', 'cask strength',
          'barrel proof', 'bottled in bond', 'finished', 'reserve', 'special release'
        ],
        ageStatements: Array.from({length: 27}, (_, i) => `${i + 1} year`),
        regions: ['Kentucky', 'Tennessee', 'Indiana', 'Texas', 'Colorado', 'Virginia', 'New York']
      },
      scotch: {
        brands: [
          'Glenfiddich', 'The Macallan', 'The Glenlivet', 'Balvenie', 'GlenDronach',
          'Laphroaig', 'Lagavulin', 'Ardbeg', 'Glenmorangie', 'Dalwhinnie',
          'Highland Park', 'Springbank', 'Bruichladdich', 'Bunnahabhain', 'Caol Ila'
        ],
        descriptors: [
          'single malt', 'blended', 'peated', 'sherried', 'port finished',
          'wine finished', 'cask strength', 'natural color', 'non-chill filtered'
        ],
        ageStatements: Array.from({length: 27}, (_, i) => `${i + 1} year`),
        regions: ['Islay', 'Speyside', 'Highland', 'Lowland', 'Campbeltown', 'Islands']
      },
      irish: {
        brands: [
          'Jameson', 'Bushmills', 'Redbreast', 'Green Spot', 'Powers',
          'Teeling', 'Connemara', 'Tullamore D.E.W.', 'Midleton', 'Yellow Spot'
        ],
        descriptors: [
          'single pot still', 'single malt', 'blended', 'single grain',
          'cask strength', 'finished', 'triple distilled'
        ],
        ageStatements: Array.from({length: 27}, (_, i) => `${i + 1} year`),
        regions: ['Dublin', 'Cork', 'Antrim', 'Donegal']
      },
      // Add more categories as needed
    };

    return configs[category as keyof typeof configs];
  }

  /**
   * Clear query history and usage tracking
   */
  clearQueryHistory(): void {
    this.usedQueries.clear();
    this.queryHistory.clear();
    this.brandRotationIndex = 0;
    this.regionRotationIndex = 0;
    this.timeVariationSeed = Date.now();
    logger.info('🧹 Query history and rotation indices cleared');
  }

  /**
   * Get query usage statistics
   */
  getQueryStats(): {
    totalUsedQueries: number;
    uniqueQueries: number;
    oldestQuery: number | null;
    newestQuery: number | null;
    brandRotationIndex: number;
    regionRotationIndex: number;
  } {
    const timestamps = Array.from(this.queryHistory.values());
    return {
      totalUsedQueries: this.queryHistory.size,
      uniqueQueries: this.usedQueries.size,
      oldestQuery: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestQuery: timestamps.length > 0 ? Math.max(...timestamps) : null,
      brandRotationIndex: this.brandRotationIndex,
      regionRotationIndex: this.regionRotationIndex,
    };
  }
}

// Singleton instance
export const diversifiedQueryGenerator = new DiversifiedQueryGenerator();