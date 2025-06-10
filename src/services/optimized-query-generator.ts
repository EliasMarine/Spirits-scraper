import { QueryGenerator } from './query-generator.js';
import { getAllReputableDomains, PRIORITY_DOMAINS } from '../config/reputable-domains.js';
import { cacheService } from './cache-service.js';
import { logger } from '../utils/logger.js';
import { smartSiteSelector } from './smart-site-selector.js';

export interface OptimizedQueryOptions {
  category: string;
  limit: number;
  preferredSites?: string[];
  avoidCachedQueries?: boolean;
  targetEfficiency?: number; // Target spirits per API call
}

export class OptimizedQueryGenerator extends QueryGenerator {
  /**
   * Generate highly optimized queries for maximum API efficiency
   * Target: 3+ spirits per API call
   */
  async generateOptimizedQueries(options: OptimizedQueryOptions): Promise<string[]> {
    const {
      category,
      limit,
      preferredSites,
      avoidCachedQueries = true,
      targetEfficiency = 3.0
    } = options;
    
    // Use smart site selector to get best sites for this category
    const selectedSites = await smartSiteSelector.selectSitesForQuery({
      category,
      preferStructuredData: true,
      minQualityScore: 70,
      maxSitesPerQuery: 10
    });
    
    // Use selected sites or fallback to priority domains
    const sitesToUse = preferredSites || (selectedSites.length > 0 ? selectedSites : PRIORITY_DOMAINS);

    const queries: string[] = [];
    
    // Strategy 1: Multi-product page queries (highest yield)
    queries.push(...this.generateMultiProductQueries(category, sitesToUse));
    
    // Strategy 2: Category browsing pages with pagination
    queries.push(...this.generatePaginatedCategoryQueries(category, sitesToUse));
    
    // Strategy 3: Collection and catalog queries
    queries.push(...this.generateCollectionQueries(category, sitesToUse));
    
    // Strategy 4: High-density search results
    queries.push(...this.generateDensityOptimizedQueries(category, sitesToUse));
    
    // Filter out recently cached queries if requested
    if (avoidCachedQueries) {
      const filteredQueries = await this.filterCachedQueries(queries);
      return this.shuffleArray(filteredQueries).slice(0, limit);
    }
    
    return this.shuffleArray(queries).slice(0, limit);
  }

  /**
   * Generate queries targeting multi-product pages
   */
  private generateMultiProductQueries(category: string, sites: string[]): string[] {
    const queries: string[] = [];
    
    // Target collection/catalog pages that list multiple products
    const multiProductPatterns = [
      `${category} collection catalog`,
      `all ${category} products`,
      `${category} spirits selection`,
      `shop ${category} online catalog`,
      `${category} bottle collection`,
      `browse all ${category}`,
      `${category} product listing`,
      `${category} inventory list`
    ];
    
    // Use provided sites or default catalog sites
    const catalogSites = sites.length > 0 ? sites : [
      'totalwine.com',
      'thewhiskyexchange.com',
      'masterofmalt.com',
      'klwines.com',
      'wine.com',
      'astorwines.com'
    ];
    
    // Limit sites to avoid too many queries
    const topSites = catalogSites.slice(0, 6);
    
    topSites.forEach(site => {
      multiProductPatterns.forEach(pattern => {
        queries.push(`site:${site} ${pattern}`);
      });
    });
    
    return queries;
  }

  /**
   * Generate paginated category queries for browsing pages
   */
  private generatePaginatedCategoryQueries(category: string, sites: string[]): string[] {
    const queries: string[] = [];
    
    // Use provided sites or default to sites known for good pagination
    const paginationSites = sites.length > 0 ? sites.slice(0, 3) : [
      'totalwine.com',
      'wine.com',
      'thewhiskyexchange.com'
    ];
    
    // Target paginated results which often have 20-50 products per page
    paginationSites.forEach(site => {
      for (let page = 1; page <= 5; page++) {
        queries.push(`site:${site} ${category} page ${page}`);
      }
    });
    
    // Sort/filter combinations that often yield full pages
    const sortOptions = ['price low to high', 'price high to low', 'newest', 'best selling', 'highest rated'];
    const sortSites = sites.length > 0 ? sites.slice(0, 2) : ['totalwine.com', 'masterofmalt.com'];
    
    sortSites.forEach(site => {
      sortOptions.forEach(sort => {
        queries.push(`site:${site} ${category} ${sort}`);
      });
    });
    
    return queries;
  }

  /**
   * Generate collection-focused queries
   */
  private generateCollectionQueries(category: string, sites: string[]): string[] {
    const queries: string[] = [];
    
    // Collections often have multiple products
    const collections = [
      'new arrivals',
      'best sellers',
      'staff picks',
      'limited edition',
      'exclusive',
      'allocated',
      'rare finds',
      'value picks',
      'premium selection',
      'gift sets',
      'sampler packs',
      'discovery sets'
    ];
    
    // Use provided sites or defaults
    const collectionSites = sites.length > 0 ? sites.slice(0, 5) : PRIORITY_DOMAINS.slice(0, 5);
    
    collectionSites.forEach(site => {
      // Select random subset of collections to avoid too many queries
      const selectedCollections = this.shuffleArray(collections).slice(0, 4);
      selectedCollections.forEach(collection => {
        queries.push(`site:${site} ${category} ${collection}`);
      });
    });
    
    return queries;
  }

  /**
   * Generate queries optimized for high result density
   */
  private generateDensityOptimizedQueries(category: string, sites: string[]): string[] {
    const queries: string[] = [];
    
    // Queries that typically return many results
    const highDensityPatterns = [
      // Price range queries (often show full collections)
      `${category} under $50 bottles`,
      `${category} $50 to $100 selection`,
      `${category} premium over $100`,
      
      // Size variations (retailers often list all sizes)
      `${category} 750ml bottles in stock`,
      `${category} 1 liter bottles available`,
      
      // Proof/ABV ranges
      `${category} 80 proof standard`,
      `${category} cask strength high proof`,
      `${category} barrel proof collection`,
      
      // Regional collections
      `Kentucky ${category} distilleries`,
      `Tennessee ${category} producers`,
      `Scottish ${category} regions`,
      
      // Type collections
      `single barrel ${category} selection`,
      `small batch ${category} collection`,
      `bottled in bond ${category}`,
      
      // Brand showcases (often list full portfolio)
      `Buffalo Trace ${category} portfolio`,
      `Heaven Hill ${category} brands`,
      `Beam Suntory ${category} collection`
    ];
    
    // Create multi-site groups from provided sites
    const multiSiteGroups: string[] = [];
    if (sites.length >= 2) {
      // Group sites in pairs for OR queries
      for (let i = 0; i < sites.length; i += 2) {
        if (i + 1 < sites.length) {
          multiSiteGroups.push(`(site:${sites[i]} OR site:${sites[i + 1]})`);
        } else {
          multiSiteGroups.push(`site:${sites[i]}`);
        }
      }
    } else if (sites.length === 1) {
      // Single site queries
      highDensityPatterns.slice(0, 10).forEach(pattern => {
        queries.push(`site:${sites[0]} ${pattern}`);
      });
      return queries;
    } else {
      // Default multi-site groups
      multiSiteGroups.push(
        '(site:totalwine.com OR site:wine.com)',
        '(site:thewhiskyexchange.com OR site:masterofmalt.com)',
        '(site:klwines.com OR site:astorwines.com)',
        '(site:caskers.com OR site:reservebar.com)'
      );
    }
    
    // Use selected patterns with multi-site groups
    const selectedPatterns = this.shuffleArray(highDensityPatterns).slice(0, 5);
    multiSiteGroups.slice(0, 4).forEach(siteGroup => {
      selectedPatterns.forEach(pattern => {
        queries.push(`${siteGroup} ${pattern}`);
      });
    });
    
    return queries;
  }

  /**
   * Filter out recently cached queries
   */
  private async filterCachedQueries(queries: string[]): Promise<string[]> {
    const uncachedQueries: string[] = [];
    
    for (const query of queries) {
      const cacheKey = `search_${query}`;
      const cached = await cacheService.get(cacheKey);
      
      if (!cached) {
        uncachedQueries.push(query);
      } else {
        // Check cache age - if older than 24 hours, include it
        const cacheAge = Date.now() - (cached.timestamp || 0);
        if (cacheAge > 24 * 60 * 60 * 1000) {
          uncachedQueries.push(query);
        }
      }
    }
    
    logger.info(`Filtered ${queries.length - uncachedQueries.length} cached queries`);
    return uncachedQueries;
  }

  /**
   * Generate smart brand portfolio queries
   */
  generateBrandPortfolioQueries(category: string): string[] {
    const queries: string[] = [];
    
    // Major producers with large portfolios
    const majorProducers = [
      { name: 'Diageo', brands: ['Johnnie Walker', 'Crown Royal', 'Bulleit'] },
      { name: 'Beam Suntory', brands: ['Jim Beam', 'Makers Mark', 'Knob Creek'] },
      { name: 'Brown-Forman', brands: ['Jack Daniels', 'Woodford Reserve', 'Old Forester'] },
      { name: 'Heaven Hill', brands: ['Evan Williams', 'Elijah Craig', 'Larceny'] },
      { name: 'Buffalo Trace', brands: ['Buffalo Trace', 'Eagle Rare', 'Blantons'] },
      { name: 'Campari', brands: ['Wild Turkey', 'Russell\'s Reserve'] },
      { name: 'Pernod Ricard', brands: ['Jameson', 'Redbreast', 'Powers'] }
    ];
    
    majorProducers.forEach(producer => {
      // Producer portfolio pages
      queries.push(`site:totalwine.com ${producer.name} whiskey portfolio`);
      queries.push(`site:thewhiskyexchange.com ${producer.name} spirits collection`);
      
      // Brand family pages
      producer.brands.forEach(brand => {
        queries.push(`site:totalwine.com ${brand} full collection`);
        queries.push(`site:masterofmalt.com ${brand} complete range`);
      });
    });
    
    return queries;
  }

  /**
   * Utility method to shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Analyze query potential for spirit discovery
   */
  async analyzeQueryPotential(query: string): Promise<number> {
    // Estimate how many spirits a query might return based on patterns
    const highYieldPatterns = [
      /\bcatalog\b/i,
      /\bcollection\b/i,
      /\bportfolio\b/i,
      /\ball\s+products\b/i,
      /\bpage\s+\d+\b/i,
      /\bbrowse\s+all\b/i,
      /\bfull\s+range\b/i,
      /\bcomplete\s+selection\b/i
    ];
    
    const mediumYieldPatterns = [
      /\bnew\s+arrivals\b/i,
      /\bbest\s+sellers\b/i,
      /\bstaff\s+picks\b/i,
      /\bunder\s+\$\d+\b/i,
      /\blimited\s+edition\b/i
    ];
    
    let estimatedYield = 1; // Base yield
    
    // Check for high yield patterns
    if (highYieldPatterns.some(pattern => pattern.test(query))) {
      estimatedYield = 10;
    } else if (mediumYieldPatterns.some(pattern => pattern.test(query))) {
      estimatedYield = 5;
    }
    
    // Boost for multi-site queries
    if (query.includes(' OR ')) {
      estimatedYield *= 1.5;
    }
    
    // Boost for trusted catalog sites
    if (query.includes('totalwine.com') || query.includes('thewhiskyexchange.com')) {
      estimatedYield *= 1.2;
    }
    
    return Math.round(estimatedYield);
  }
}

// Export singleton instance
export const optimizedQueryGenerator = new OptimizedQueryGenerator();