import { SEARCH_TEMPLATES, SPIRIT_CATEGORIES, SPIRIT_BRANDS } from '../config/index.js';
import { NON_PRODUCT_FILTERS } from '../config/non-product-filters.js';

export interface QueryGeneratorOptions {
  includeRetailers?: boolean;
  includeReviews?: boolean;
  includeImages?: boolean;
  targetSites?: string[];
  excludeSites?: string[];
}

export class QueryGenerator {
  /**
   * Generate comprehensive search exclusions from non-product filters
   */
  private generateExclusions(): string {
    const exclusions: string[] = [];
    
    // Add specific keywords from each category that should be excluded
    // Merchandise exclusions
    exclusions.push('-shirt', '-polo', '-hat', '-cap', '-clothing', '-merchandise', '-apparel');
    exclusions.push('-jacket', '-hoodie', '-tee', '-glassware', '-accessories', '-gift-box');
    exclusions.push('-coaster', '-opener', '-sticker', '-keychain', '-barware');
    
    // Tour exclusions
    exclusions.push('-tour', '-visit', '-experience', '-tasting-room', '-distillery-tour');
    exclusions.push('-visitor-center', '-book-tour', '-schedule-visit');
    
    // Food and cocktail exclusions
    exclusions.push('-recipe', '-cocktail', '-mixed-drink', '-food', '-menu');
    exclusions.push('-martini', '-margarita', '-manhattan', '-sour');
    
    // Beer exclusions
    exclusions.push('-beer', '-ale', '-stout', '-lager', '-ipa', '-porter', '-pilsner');
    exclusions.push('-brewery', '-brewing');
    
    // Article/blog exclusions
    exclusions.push('-blog', '-article', '-news', '-guide', '-comparison', '-versus');
    exclusions.push('-review-guide', '-buying-guide');
    
    // Event exclusions
    exclusions.push('-event', '-festival', '-ticket', '-admission');
    
    // Retail page exclusions
    exclusions.push('-category-page', '-product-list', '-browse-all');
    
    return exclusions.join(' ');
  }
  
  /**
   * Generate search queries for a specific spirit
   */
  generateSpiritQueries(
    name: string,
    brand?: string,
    options: QueryGeneratorOptions = {},
  ): string[] {
    const queries: string[] = [];

    // Get comprehensive exclusions
    const exclusions = this.generateExclusions();

    // CRITICAL: Prioritize retailer queries for better discovery
    // Retailer query FIRST if requested (highest quality results)
    if (options.includeRetailers) {
      const retailerQuery = SEARCH_TEMPLATES.spiritRetailer(name, brand);
      queries.push(`${retailerQuery} ${exclusions}`.trim());
      
      // Add specific retailer site queries for better discovery
      const topRetailers = ['totalwine.com', 'thewhiskyexchange.com', 'masterofmalt.com', 'klwines.com'];
      topRetailers.forEach(site => {
        queries.push(`site:${site} "${name}" ${brand || ''} bottle price ${exclusions}`.trim());
      });
    }

    // Basic info query with exclusions
    const baseInfoQuery = SEARCH_TEMPLATES.spiritInfo(name, brand);
    queries.push(`${baseInfoQuery} ${exclusions}`.trim());

    // Review query if requested (lower priority)
    if (options.includeReviews) {
      const reviewQuery = SEARCH_TEMPLATES.spiritReview(name, brand);
      queries.push(`${reviewQuery} ${exclusions}`.trim());
    }

    // Add site-specific queries with exclusions
    if (options.targetSites && options.targetSites.length > 0) {
      const baseQuery = `${name} ${brand || ''} bottle 750ml`.trim();
      options.targetSites.forEach(site => {
        queries.push(`site:${site} ${baseQuery} ${exclusions}`.trim());
      });
    }

    return queries;
  }

  /**
   * Generate queries to discover spirits by category
   */
  generateCategoryQueries(category: string): string[] {
    const queries: string[] = [];
    const exclusions = this.generateExclusions();

    // CRITICAL: Focus ONLY on trusted RETAILER sites - NO review/blog sites
    const trustedRetailers = [
      'site:totalwine.com',
      'site:wine.com',
      'site:thewhiskyexchange.com',
      'site:masterofmalt.com',
      'site:klwines.com',
      'site:caskers.com',
      'site:reservebar.com',
      'site:seelbachs.com',
      'site:drizly.com',
      'site:flaviar.com',
      'site:astorwines.com',
      'site:binnys.com',
      'site:specsonline.com',
      'site:bevmo.com',
      'site:caskcartel.com',
      'site:dekanta.com',
      'site:finedrams.com'
    ];
    
    // Generate site-specific queries with product keywords and exclusions
    trustedRetailers.forEach(site => {
      // Use product-specific keywords to get actual product pages
      queries.push(`${site} ${category} bottle 750ml ${exclusions}`.trim());
      queries.push(`${site} ${category} spirits buy ${exclusions}`.trim());
      
      if (category.toLowerCase() === 'bourbon') {
        queries.push(`${site} kentucky straight bourbon whiskey ${exclusions}`.trim());
        queries.push(`${site} small batch bourbon 750ml ${exclusions}`.trim());
        queries.push(`${site} single barrel bourbon bottle ${exclusions}`.trim());
      } else if (category.toLowerCase() === 'scotch') {
        queries.push(`${site} single malt scotch whisky ${exclusions}`.trim());
        queries.push(`${site} highland scotch 750ml ${exclusions}`.trim());
        queries.push(`${site} islay scotch bottle ${exclusions}`.trim());
      } else if (category.toLowerCase() === 'whiskey' || category.toLowerCase() === 'whisky') {
        // Add specific whiskey type queries
        queries.push(`${site} irish whiskey bottle 750ml ${exclusions}`.trim());
        queries.push(`${site} rye whiskey bottle ${exclusions}`.trim());
        queries.push(`${site} canadian whisky 750ml ${exclusions}`.trim());
        queries.push(`${site} japanese whisky bottle ${exclusions}`.trim());
        queries.push(`${site} american whiskey spirits ${exclusions}`.trim());
      }
    });

    // Multi-site OR queries for better coverage
    const siteGroups = [
      '(site:totalwine.com OR site:wine.com OR site:drizly.com)',
      '(site:thewhiskyexchange.com OR site:masterofmalt.com OR site:finedrams.com)',
      '(site:klwines.com OR site:astorwines.com OR site:seelbachs.com)',
      '(site:caskers.com OR site:reservebar.com OR site:flaviar.com)'
    ];

    // Specific brand + category combinations with site restrictions
    if (category.toLowerCase() === 'bourbon') {
      siteGroups.forEach(sites => {
        queries.push(`${sites} Buffalo Trace bourbon bottle 750ml ${exclusions}`.trim());
        queries.push(`${sites} Maker's Mark bourbon bottle ${exclusions}`.trim());
        queries.push(`${sites} Four Roses Single Barrel ${exclusions}`.trim());
        queries.push(`${sites} Eagle Rare 10 Year bourbon ${exclusions}`.trim());
        queries.push(`${sites} Blanton's Single Barrel bourbon ${exclusions}`.trim());
      });
    } else if (category.toLowerCase() === 'scotch') {
      siteGroups.forEach(sites => {
        queries.push(`${sites} Glenfiddich 12 Year scotch ${exclusions}`.trim());
        queries.push(`${sites} Macallan 12 Year scotch ${exclusions}`.trim());
        queries.push(`${sites} Lagavulin 16 Year scotch ${exclusions}`.trim());
      });
    } else if (category.toLowerCase() === 'whiskey' || category.toLowerCase() === 'whisky') {
      // Add popular whiskey brands from different regions
      siteGroups.forEach(sites => {
        // Irish whiskeys
        queries.push(`${sites} Jameson Irish Whiskey bottle ${exclusions}`.trim());
        queries.push(`${sites} Redbreast 12 Year Irish Whiskey ${exclusions}`.trim());
        queries.push(`${sites} Green Spot Irish Whiskey ${exclusions}`.trim());
        // American whiskeys (non-bourbon)
        queries.push(`${sites} Jack Daniel's Tennessee Whiskey ${exclusions}`.trim());
        queries.push(`${sites} Bulleit Rye Whiskey bottle ${exclusions}`.trim());
        queries.push(`${sites} High West Double Rye ${exclusions}`.trim());
        // Canadian whiskeys
        queries.push(`${sites} Crown Royal Canadian Whisky ${exclusions}`.trim());
        queries.push(`${sites} Lot 40 Canadian Rye Whisky ${exclusions}`.trim());
        // Japanese whiskeys
        queries.push(`${sites} Hibiki Japanese Harmony Whisky ${exclusions}`.trim());
        queries.push(`${sites} Nikka From The Barrel ${exclusions}`.trim());
        queries.push(`${sites} Yamazaki 12 Year Whisky ${exclusions}`.trim());
      });
    }

    // NEVER do generic searches without site restrictions
    // Always include site: operators to force retail results

    return queries;
  }

  /**
   * Generate queries for brand exploration
   */
  generateBrandQueries(brand: string): string[] {
    const queries: string[] = [];

    // Brand catalog
    queries.push(SEARCH_TEMPLATES.brandCatalog(brand));

    // Brand's official site
    queries.push(`${brand} official website spirits catalog`);

    // Brand history and heritage
    queries.push(`${brand} distillery history heritage story`);

    // Limited editions
    queries.push(`${brand} limited edition special release rare`);

    return queries;
  }

  /**
   * Generate queries for initial database seeding
   */
  generateSeedQueries(): string[] {
    const queries: string[] = [];

    // Category-based queries
    SPIRIT_CATEGORIES.forEach(category => {
      queries.push(...this.generateCategoryQueries(category));
    });

    // Brand-based queries
    SPIRIT_BRANDS.forEach(brand => {
      queries.push(...this.generateBrandQueries(brand));
    });

    // General discovery queries
    queries.push(
      'top 100 spirits brands worldwide',
      'best spirits 2024 awards winners',
      'new spirit releases 2024',
      'craft distilleries spirits artisanal',
      'rare collectible spirits auction',
      'spirits tasting notes flavor profiles database',
    );

    // Remove duplicates
    return [...new Set(queries)];
  }

  /**
   * Generate targeted queries for specific retailers
   */
  generateRetailerQueries(spiritName: string, brand?: string): string[] {
    const retailers = [
      'totalwine.com',
      'wine.com',
      'drizly.com',
      'reservebar.com',
      'thewhiskyexchange.com',
      'masterofmalt.com',
      'wine-searcher.com',
    ];

    const baseQuery = `${spiritName} ${brand || ''}`.trim();

    return retailers.map(retailer =>
      `site:${retailer} ${baseQuery} price buy`,
    );
  }

  /**
   * Generate queries for enriching existing spirit data
   */
  generateEnrichmentQueries(
    spiritName: string,
    brand?: string,
    currentData?: Partial<{
      abv?: number;
      price?: string;
      description?: string;
    }>,
  ): string[] {
    const queries: string[] = [];
    const baseIdentifier = `${spiritName} ${brand || ''}`.trim();

    // Missing ABV
    if (!currentData?.abv) {
      queries.push(`${baseIdentifier} ABV alcohol content proof`);
    }

    // Missing price
    if (!currentData?.price) {
      queries.push(`${baseIdentifier} price MSRP retail cost`);
    }

    // Missing or short description
    if (!currentData?.description || currentData.description.length < 100) {
      queries.push(`${baseIdentifier} description tasting notes flavor profile`);
      queries.push(`${baseIdentifier} production process distillation aging`);
    }

    // Additional enrichment queries
    queries.push(
      `${baseIdentifier} awards medals recognition`,
      `${baseIdentifier} cocktail recipes mixed drinks`,
      `${baseIdentifier} food pairing suggestions`,
    );

    return queries;
  }

  /**
   * Generate image-specific search queries
   */
  generateImageQueries(spiritName: string, brand?: string): string[] {
    const baseIdentifier = `${spiritName} ${brand || ''}`.trim();

    return [
      `${baseIdentifier} bottle product image high resolution`,
      `${baseIdentifier} label packaging design`,
      `${baseIdentifier} product shot photography`,
      `"${baseIdentifier}" bottle -cocktail -glass`, // Exclude cocktail images
    ];
  }

  /**
   * Optimize query for better search results
   */
  optimizeQuery(query: string): string {
    // Remove extra spaces
    let optimized = query.replace(/\s+/g, ' ').trim();

    // Remove common stop words that don't add value
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but'];
    stopWords.forEach(word => {
      optimized = optimized.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
    });

    // Clean up spaces again
    optimized = optimized.replace(/\s+/g, ' ').trim();

    // Ensure query isn't too long (Google limit is 32 words)
    const words = optimized.split(' ');
    if (words.length > 30) {
      optimized = words.slice(0, 30).join(' ');
    }

    return optimized;
  }
}

// Singleton instance
export const queryGenerator = new QueryGenerator();