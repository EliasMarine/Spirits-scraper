import { googleSearchClient } from './google-search.js';
import { GoogleSearchResult, SpiritSearchItem } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { isReputableDomain, PRIORITY_DOMAINS } from '../config/reputable-domains.js';
import { isExcludedDomain } from '../config/excluded-domains.js';
import { TextProcessor } from './text-processor.js';
import { 
  NON_PRODUCT_FILTERS, 
  containsNonProductPatterns, 
  isNonProductUrl,
  hasRequiredSpiritIndicators,
  hasAlcoholContent 
} from '../config/non-product-filters.js';

export interface DiscoveredSpirit {
  name: string;
  brand?: string;
  type?: string;
  source: string;
  confidence: number;
}

export class SpiritDiscoveryService {
  /**
   * Discover actual spirits from search queries
   * This is the correct pattern - use queries to find real spirits, not treat queries as spirits
   */
  async discoverSpiritsFromQuery(query: string, maxResults: number = 20): Promise<DiscoveredSpirit[]> {
    // Only log spirit discovery in debug mode  
    // logger.info(`Discovering spirits from query: "${query}"`);
    
    try {
      // Check if this is likely a high-yield query
      const isHighYieldQuery = this.isHighYieldQuery(query);
      
      // For high-yield queries, increase search results to find more spirits
      const searchNum = isHighYieldQuery ? 10 : Math.min(maxResults, 10);
      
      // Search for actual spirits using the query
      const searchResults = await googleSearchClient.search({
        query,
        num: searchNum,
      });

      if (!searchResults.items || searchResults.items.length === 0) {
        logger.warn(`No search results found for query: "${query}"`);
        return [];
      }

      // Extract actual spirit names from search results
      const discoveredSpirits: DiscoveredSpirit[] = [];
      
      for (const result of searchResults.items) {
        // Skip excluded domains even if they appear in results
        if (isExcludedDomain(result.link)) {
          logger.warn(`Skipping excluded domain: ${result.link}`);
          continue;
        }
        
        // For catalog/collection pages, extract more spirits
        const extractionOptions = {
          isHighYield: isHighYieldQuery || this.isCatalogPage(result),
          maxSpiritsPerResult: isHighYieldQuery ? 50 : 20
        };
        
        const spirits = this.extractSpiritsFromSearchResult(result, extractionOptions);
        discoveredSpirits.push(...spirits);
      }

      // Deduplicate based on name and brand
      const uniqueSpirits = this.deduplicateSpirits(discoveredSpirits);
      
      // Sort by confidence and prioritize reputable domains
      const sortedSpirits = uniqueSpirits.sort((a, b) => {
        // First sort by reputable domain
        const aReputable = isReputableDomain(a.source) ? 1 : 0;
        const bReputable = isReputableDomain(b.source) ? 1 : 0;
        if (aReputable !== bReputable) return bReputable - aReputable;
        
        // Then by confidence
        return b.confidence - a.confidence;
      });
      
      // Only log discovery results in debug mode
      // logger.info(`Discovered ${sortedSpirits.length} unique spirits from query: "${query}"`);
      
      return sortedSpirits;
    } catch (error) {
      logger.error(`Error discovering spirits from query "${query}":`, error);
      throw error;
    }
  }
  
  /**
   * Check if a query is likely to yield many results
   */
  private isHighYieldQuery(query: string): boolean {
    const highYieldPatterns = [
      /\bcatalog\b/i,
      /\bcollection\b/i,
      /\bportfolio\b/i,
      /\ball\s+products\b/i,
      /\bpage\s+\d+\b/i,
      /\bbrowse\s+all\b/i,
      /\bfull\s+range\b/i,
      /\bcomplete\s+selection\b/i,
      /\binventory\b/i,
      /\blisting\b/i
    ];
    
    return highYieldPatterns.some(pattern => pattern.test(query));
  }
  
  /**
   * Check if a search result is a catalog page
   */
  private isCatalogPage(result: GoogleSearchResult): boolean {
    const catalogIndicators = [
      /\/catalog\//i,
      /\/collection\//i,
      /\/products\//i,
      /\/spirits\//i,
      /\/browse\//i,
      /\/shop\//i,
      /\?page=\d+/i,
      /&sort=/i
    ];
    
    const titleIndicators = [
      /\d+\s+products?/i,
      /showing\s+\d+/i,
      /page\s+\d+/i,
      /results\s+for/i
    ];
    
    return catalogIndicators.some(pattern => pattern.test(result.link)) ||
           titleIndicators.some(pattern => pattern.test(result.title));
  }

  /**
   * Extract actual spirit names and brands from a single search result
   */
  private extractSpiritsFromSearchResult(result: GoogleSearchResult, options?: { isHighYield?: boolean; maxSpiritsPerResult?: number }): DiscoveredSpirit[] {
    const spirits: DiscoveredSpirit[] = [];
    
    // Combine title and snippet for analysis
    const fullText = `${result.title} ${result.snippet}`.toLowerCase();
    
    // Skip non-spirit results
    if (this.isNonSpiritResult(fullText, result.link)) {
      return spirits;
    }

    // Check if this is from a reputable retailer
    const isReputable = isReputableDomain(result.link);
    
    // Special handling for catalog pages with enhanced extraction
    if (options?.isHighYield && this.isCatalogSnippet(result.snippet)) {
      const catalogSpirits = this.extractSpiritsFromCatalogSnippet(result.snippet, result.link);
      spirits.push(...catalogSpirits.slice(0, options.maxSpiritsPerResult || 20));
    }
    
    // Special handling for titles with multiple spirits
    if (this.containsMultipleProducts(result.title)) {
      const titleListSpirits = this.extractSpiritsFromList(result.title, result.link);
      spirits.push(...titleListSpirits);
    }
    
    // Extract from snippet - often contains actual product names
    const snippetSpirits = this.extractSpiritsFromSnippet(result.snippet, result.link);
    spirits.push(...snippetSpirits);
    
    // Extract from structured data if available (highest priority)
    if (result.pagemap?.product?.[0]) {
      const productSpirit = this.extractSpiritFromProduct(result.pagemap.product[0], result.link);
      if (productSpirit && this.isValidSpiritName(productSpirit.name)) {
        spirits.push(productSpirit);
      }
    }
    
    // Extract from metadata if available
    if (result.pagemap?.metatags?.[0]) {
      const metaSpirit = this.extractSpiritFromMetadata(result.pagemap.metatags[0], result.link);
      if (metaSpirit && this.isValidSpiritName(metaSpirit.name)) {
        spirits.push(metaSpirit);
      }
    }
    
    // Only extract from title if:
    // 1. No spirits found yet
    // 2. It's a product page from a reputable source
    // 3. The title doesn't contain multiple products
    if (spirits.length === 0 && this.isProductPage(result) && !this.containsMultipleProducts(result.title)) {
      const titleSpirit = this.extractSpiritFromTitle(result.title, result.link);
      if (titleSpirit && this.isValidSpiritName(titleSpirit.name)) {
        // CRITICAL FIX: One more validation - reject generic categories
        const cleanName = titleSpirit.name.toLowerCase().trim();
        const genericCategories = [
          'bottled in bond bourbon',
          'barrel strength bourbons',
          'cask strength bourbons',
          'single barrel bourbons',
          'small batch bourbons',
          'straight bourbon whiskey',
          'kentucky straight bourbon',
          'bourbon whiskey',
          'rye whiskey',
          'barrel/cask strength bourbons'
        ];
        
        if (!genericCategories.includes(cleanName)) {
          spirits.push(titleSpirit);
        }
      }
    }
    
    // Deduplicate spirits from this result
    const uniqueSpirits = this.deduplicateSpirits(spirits);
    
    // Boost confidence for reputable domains
    if (isReputable) {
      uniqueSpirits.forEach(spirit => {
        spirit.confidence = Math.min(spirit.confidence * 1.2, 0.95);
      });
    }

    return uniqueSpirits;
  }

  /**
   * Check if the search result is likely not about a specific spirit
   */
  private isNonSpiritResult(text: string, url: string): boolean {
    // First check URL patterns using our configuration
    const urlCheck = isNonProductUrl(url);
    if (urlCheck.isNonProduct) {
      logger.debug(`Skipping non-product URL (${urlCheck.category}): ${url}`);
      return true;
    }
    
    // Check if it's excluded domain
    if (isExcludedDomain(url)) {
      return true;
    }
    
    // Check text against all non-product pattern categories
    const nonProductCategories: Array<keyof typeof NON_PRODUCT_FILTERS.patterns> = [
      'tours', 'merchandise', 'beer', 'articles', 'retail', 'cocktails', 'food', 'events'
    ];
    
    for (const category of nonProductCategories) {
      if (containsNonProductPatterns(text, category)) {
        logger.debug(`Skipping non-product result (${category}): ${text.substring(0, 100)}...`);
        return true;
      }
    }
    
    // Additional patterns for lists and guides
    const skipPatterns = [
      /\d+\s+best/i,
      /best\s+\d+/i,
      /top\s+\d+/i,
      /ranked\s+(worst\s+to\s+best|best\s+to\s+worst)/i,
      /^the\s+\d+\s+smoothest/i,
      /i've\s+tried\s+hundreds/i,
      /my\s+picks\s+for/i,
      /worth\s+buying/i,
      /you\s+should\s+try/i,
      /must\s+have/i,
      /ultimate\s+list/i,
      /which\s+bourbon/i,
    ];
    
    if (skipPatterns.some(pattern => pattern.test(text))) {
      return true;
    }
    
    // If no spirit indicators found, likely not a spirit product
    if (!hasRequiredSpiritIndicators(text) && !hasAlcoholContent(text)) {
      logger.debug(`No spirit indicators found in: ${text.substring(0, 100)}...`);
      return true;
    }
    
    return false;
  }

  /**
   * Extract spirit from page title - ONLY actual bottle names
   */
  private extractSpiritFromTitle(title: string, source: string): DiscoveredSpirit | null {
    // ALWAYS skip social media/forum titles - they're discussions, not products
    const socialMediaDomains = [
      'reddit.com', 'facebook.com', 'twitter.com', 'instagram.com',
      'pinterest.com', 'tripadvisor.com', 'yelp.com', 'quora.com',
      'forum', 'community', 'discussion'
    ];
    
    if (socialMediaDomains.some(domain => source.toLowerCase().includes(domain))) {
      return null;
    }
    
    // Skip if title is too generic or an article
    if (this.isGenericTitle(title) || this.isArticleTitle(title)) {
      return null;
    }

    // Clean the title first
    const cleanedTitle = this.cleanPageTitle(title);
    
    // Apply spirit name cleaning to remove review suffixes, etc.
    const preCleanedTitle = this.cleanSpiritName(cleanedTitle);
    
    // CRITICAL FIX: Remove duplicate type/category suffixes
    // Handle cases like "Wild Turkey Kentucky Straight Bourbon Whiskey Kentucky Straight"
    const duplicatePatterns = [
      /(\s+Kentucky\s+Straight)(\s+Bourbon\s+Whiskey)?(\s+Kentucky\s+Straight)$/i,
      /(\s+Bottled\s+in\s+Bond)(\s+Bourbon)?(\s+Bottled\s+in\s+Bond)$/i,
      /(\s+Single\s+Barrel)(\s+Bourbon)?(\s+Single\s+Barrel)$/i,
      /(\s+Small\s+Batch)(\s+Bourbon)?(\s+Small\s+Batch)$/i,
      /(\s+Cask\s+Strength)(\s+Bourbon)?(\s+Cask\s+Strength)$/i,
      /(\s+Barrel\s+Proof)(\s+Bourbon)?(\s+Barrel\s+Proof)$/i,
    ];
    
    let dedupedTitle = preCleanedTitle;
    for (const pattern of duplicatePatterns) {
      dedupedTitle = dedupedTitle.replace(pattern, '$1$2');
    }
    
    // Only extract from actual product pages from retailers
    const retailerPatterns = [
      // Total Wine: "Spirit Name Brand Size | Total Wine & More"
      /^(.+?)\s*\|\s*Total Wine/i,
      // The Whisky Exchange: "Spirit Name - Brand : The Whisky Exchange"
      /^(.+?)\s*:\s*The Whisky Exchange/i,
      // Master of Malt: "Spirit Name - Master of Malt"
      /^(.+?)\s*-\s*Master of Malt/i,
      // Wine.com: "Buy Spirit Name Online | Wine.com"
      /^Buy\s+(.+?)\s+Online\s*\|\s*Wine\.com/i,
      // K&L: "Spirit Name - K&L Wines"
      /^(.+?)\s*-\s*K&L Wines/i,
      // Seelbach's pattern
      /^(.+?)\s*[\|\-–]\s*Seelbach/i,
      // Caskers
      /^(.+?)\s*»\s*Buy.*Caskers/i,
      // Generic retailer pattern
      /^(.+?)\s*[\|\-–]\s*(?:Buy|Shop|Order)\s+Online/i,
    ];

    // Check if this is a retailer product page
    for (const pattern of retailerPatterns) {
      const match = dedupedTitle.match(pattern);
      if (match && match[1]) {
        const productName = match[1].trim();
        
        // Must look like an actual spirit name, not a category or description
        if (this.isValidSpiritName(productName)) {
          const brand = this.extractBrandFromName(productName);
          // Only return if we can identify a brand - prevents generic fragments
          if (brand) {
            const spiritType = this.detectSpiritCategory(productName);
            return {
              name: this.cleanSpiritName(productName),
              brand: brand,
              type: spiritType,
              confidence: 0.9,
              source,
            };
          }
        }
      }
    }

    // For non-retailer pages, be VERY strict
    // Only extract if it's clearly a single product name
    if (isReputableDomain(source) && this.isProductPage({ link: source } as any)) {
      // Check if title is a simple product name (brand + expression) - allow lowercase too
      const simpleProductPattern = /^([A-Za-z][a-zA-Z'\s&.-]+(?:\s+[A-Za-z][a-zA-Z'\s&.-]+){0,3})$/;
      const match = dedupedTitle.match(simpleProductPattern);
      
      if (match && this.isValidSpiritName(match[1]) && !this.containsMultipleProducts(match[1])) {
        const brand = this.extractBrandFromName(match[1]);
        // Only return if we can identify a brand
        if (brand) {
          const spiritType = this.detectSpiritCategory(match[1]);
          return {
            name: this.cleanSpiritName(match[1]),
            brand: brand,
            type: spiritType,
            confidence: 0.7,
            source,
          };
        }
      }
    }

    return null;
  }
  
  /**
   * Detect spirit category from name to avoid defaulting to "SingleMalt"
   */
  private detectSpiritCategory(name: string): string | undefined {
    const lowercaseName = name.toLowerCase();
    
    // Bourbon indicators
    if (/\b(bourbon|kentucky\s*straight|wheated|bottled\s*in\s*bond)\b/i.test(name)) {
      return 'Bourbon';
    }
    
    // Rye whiskey indicators
    if (/\b(rye\s*whiskey|rye\s*whisky|straight\s*rye)\b/i.test(name)) {
      return 'Rye Whiskey';
    }
    
    // Irish whiskey indicators
    if (/\b(irish\s*whiskey|irish\s*whisky|pot\s*still|single\s*pot)\b/i.test(name) ||
        /\b(jameson|bushmills|redbreast|powers|teeling|tullamore)\b/i.test(name)) {
      return 'Irish Whiskey';
    }
    
    // Scotch indicators
    if (/\b(single\s*malt|blended\s*scotch|scotch\s*whisky|highland|speyside|islay|lowland)\b/i.test(name) ||
        /\b(glenfiddich|macallan|glenlivet|johnnie\s*walker|ardbeg|lagavulin)\b/i.test(name)) {
      return 'Single Malt Scotch';
    }
    
    // Canadian whisky
    if (/\b(canadian\s*whisky|crown\s*royal|canadian\s*club)\b/i.test(name)) {
      return 'Canadian Whisky';
    }
    
    // Japanese whisky
    if (/\b(japanese\s*whisky|suntory|nikka|yamazaki|hibiki|hakushu)\b/i.test(name)) {
      return 'Japanese Whisky';
    }
    
    // Vodka
    if (/\b(vodka|grey\s*goose|absolut|smirnoff|ketel\s*one|belvedere|titos)\b/i.test(name)) {
      return 'Vodka';
    }
    
    // Gin
    if (/\b(gin|hendricks|bombay|tanqueray|beefeater|plymouth)\b/i.test(name)) {
      return 'Gin';
    }
    
    // Rum
    if (/\b(rum|bacardi|captain\s*morgan|mount\s*gay|appleton)\b/i.test(name)) {
      return 'Rum';
    }
    
    // Tequila
    if (/\b(tequila|don\s*julio|patron|jose\s*cuervo|casamigos)\b/i.test(name)) {
      return 'Tequila';
    }
    
    // Cognac/Brandy
    if (/\b(cognac|brandy|hennessy|remy\s*martin|martell|courvoisier)\b/i.test(name)) {
      return 'Cognac';
    }
    
    // Default to undefined rather than "SingleMalt"
    return undefined;
  }

  /**
   * Extract spirit from metadata
   */
  private extractSpiritFromMetadata(metadata: any, source: string): DiscoveredSpirit | null {
    const name = metadata['og:title'] || metadata['product:title'] || metadata['name'];
    const brand = metadata['product:brand'] || metadata['brand'];
    
    if (name && this.looksLikeSpiritName(name)) {
      return {
        name: this.cleanSpiritName(name),
        brand: brand || this.extractBrandFromName(name),
        confidence: 0.9,
        source,
      };
    }

    return null;
  }

  /**
   * Extract spirit from product structured data
   */
  private extractSpiritFromProduct(product: any, source: string): DiscoveredSpirit | null {
    if (product.name) {
      return {
        name: this.cleanSpiritName(product.name),
        brand: product.brand || this.extractBrandFromName(product.name),
        type: product.category,
        confidence: 0.95,
        source,
      };
    }

    return null;
  }

  /**
   * Check if text looks like a spirit name
   */
  private looksLikeSpiritName(text: string): boolean {
    const spiritIndicators = [
      /whisk(?:e)?y/i,
      /bourbon/i,
      /scotch/i,
      /vodka/i,
      /gin/i,
      /rum/i,
      /tequila/i,
      /mezcal/i,
      /cognac/i,
      /brandy/i,
      /liqueur/i,
      /\d+\s*(?:year|yr)/i,
      /single\s+(?:malt|barrel|grain)/i,
      /small\s+batch/i,
      /cask\s+strength/i,
      /proof/i,
      /distillery/i,
      /reserve/i,
      /edition/i,
    ];

    return spiritIndicators.some(pattern => pattern.test(text));
  }

  /**
   * Check if text is likely a brand name
   */
  private isBrandName(text: string): boolean {
    // Common distillery/brand suffixes
    const brandIndicators = [
      /distillery/i,
      /distillers/i,
      /brewing/i,
      /spirits/i,
      /& (?:sons|co\.?|company)/i,
    ];

    // Expanded list of known major brands
    const knownBrands = [
      // Bourbon
      'Jack Daniel\'s', 'Jim Beam', 'Maker\'s Mark', 'Buffalo Trace', 'Wild Turkey',
      'Four Roses', 'Woodford Reserve', 'Knob Creek', 'Bulleit', 'Elijah Craig',
      'Heaven Hill', 'Old Forester', 'Evan Williams', 'Early Times', 'Ancient Age',
      'Eagle Rare', 'Blanton\'s', 'Pappy Van Winkle', 'Weller', 'Stagg',
      'Booker\'s', 'Basil Hayden', 'Jefferson\'s', 'Angel\'s Envy', 'Michter\'s',
      'Henry McKenna', 'Old Grand-Dad', 'Very Old Barton', 'Benchmark',
      'Larceny', 'Rebel', 'Old Ezra', 'Wilderness Trail', 'New Riff',
      // Scotch
      'Johnnie Walker', 'Glenfiddich', 'Macallan', 'Glenlivet', 'Chivas Regal',
      'Highland Park', 'Ardbeg', 'Lagavulin', 'Talisker', 'Bowmore', 'Laphroaig',
      'Glenmorangie', 'Dalmore', 'Balvenie', 'Oban', 'Springbank', 'Bruichladdich',
      'Bunnahabhain', 'Caol Ila', 'Kilchoman', 'GlenDronach', 'Glenfarclas',
      'Aberlour', 'Cragganmore', 'Dalwhinnie', 'Glen Scotia', 'Auchentoshan',
      // Irish
      'Jameson', 'Bushmills', 'Redbreast', 'Green Spot', 'Yellow Spot',
      'Powers', 'Teeling', 'Tullamore D.E.W.', 'Midleton', 'Connemara',
      'Kilbeggan', 'Tyrconnell', 'Knappogue Castle', 'Slane', 'Proper No. Twelve',
      // Vodka
      'Grey Goose', 'Absolut', 'Smirnoff', 'Ketel One', 'Belvedere',
      'Tito\'s', 'Stolichnaya', 'Skyy', 'Finlandia', 'Chopin',
      // Gin
      'Hendrick\'s', 'Bombay', 'Tanqueray', 'Beefeater', 'Gordon\'s',
      'Plymouth', 'Sipsmith', 'The Botanist', 'Monkey 47', 'Aviation',
      // Rum
      'Bacardi', 'Captain Morgan', 'Kraken', 'Mount Gay', 'Appleton',
      'Flor de Caña', 'Diplomatico', 'Ron Zacapa', 'El Dorado', 'Plantation',
      // Tequila
      'Don Julio', 'Patron', 'Jose Cuervo', 'Casamigos', '1800',
      'Espolon', 'Herradura', 'Milagro', 'Cazadores', 'Hornitos',
      // Cognac
      'Hennessy', 'Remy Martin', 'Martell', 'Courvoisier', 'Camus',
      // Canadian
      'Crown Royal', 'Canadian Club', 'Seagram\'s', 'Gibson\'s', 'Black Velvet',
      // Japanese
      'Suntory', 'Nikka', 'Hibiki', 'Yamazaki', 'Hakushu', 'Yoichi', 'Miyagikyo',
    ];

    const normalized = text.toLowerCase().trim();
    
    return brandIndicators.some(pattern => pattern.test(text)) ||
           knownBrands.some(brand => {
             const brandLower = brand.toLowerCase();
             // Exact match or starts with brand name
             return normalized === brandLower || 
                    normalized.startsWith(brandLower + ' ') ||
                    normalized.includes(' ' + brandLower);
           });
  }

  /**
   * Extract brand name from a full spirit name
   */
  private extractBrandFromName(name: string): string | null {
    // Clean the name first
    const cleanName = name.replace(/[\(\[].*?[\)\]]/g, '').trim();
    
    // Try to extract brand from common patterns
    const patterns = [
      // Known bourbon brands
      /^(Jack Daniel's|Jim Beam|Maker's Mark|Buffalo Trace|Wild Turkey|Four Roses|Woodford Reserve|Knob Creek|Bulleit|Elijah Craig|E\.?H\.?\s*Taylor(?:\s*Jr\.?)?|Nashville\s+Barrel\s+Company|Barrel\s+Proof)/i,
      /^(Eagle Rare|Blanton's|Pappy Van Winkle|W\.?L\.? Weller|George T\.? Stagg|Booker's|Basil Hayden|Jefferson's|Angel's Envy|Michter's)/i,
      /^(Heaven Hill|Old Forester|Evan Williams|Henry McKenna|Larceny|Rebel|Very Old Barton|Wilderness Trail|New Riff)/i,
      /^(Hudson|McKenzie|William Wolf|Balcones|Old Carter|Hillrock|Starlight|Ammunition|Never Say Die|Redemption|Woodinville)/i,
      /^(Makers\s+Mark|Baker's|Old\s+Ezra|Old\s+Crow|Bakers|Michters)/i, // Additional bourbon brands
      // Special case for Mc names that might have spacing issues
      /^(Mc\s*Kenzie|McKenzie)/i,
      /^(1792|1776|1840)\b/i, // Numbered brands
      // Known scotch brands
      /^(Johnnie Walker|Glenfiddich|The Macallan|The Glenlivet|Chivas Regal|Highland Park|Ardbeg|Lagavulin|Talisker|Bowmore|Laphroaig)/i,
      /^(Glenmorangie|The Dalmore|The Balvenie|Oban|Springbank|Bruichladdich|Bunnahabhain|GlenDronach|Glenfarclas|Aberlour)/i,
      // Irish whiskey
      /^(Jameson|Bushmills|Redbreast|Green Spot|Yellow Spot|Powers|Teeling|Tullamore D\.?E\.?W|Midleton|Connemara)/i,
      // Other spirits
      /^(Grey Goose|Absolut|Smirnoff|Ketel One|Belvedere|Tito's|Hendrick's|Bombay|Tanqueray|Beefeater)/i,
      /^(Bacardi|Captain Morgan|Kraken|Mount Gay|Appleton|Don Julio|Patron|Jose Cuervo|Casamigos)/i,
      /^(Hennessy|Remy Martin|Martell|Courvoisier|Crown Royal|Suntory|Nikka|Hibiki|Yamazaki|Hakushu)/i,
      // Generic pattern for possessive brands
      /^([A-Z][a-z]+(?:'s)?(?:\s+[A-Z][a-z]+(?:'s)?){0,2})\s+(?:Distillery|Distillers|Brewing|Spirits)/i,
    ];

    for (const pattern of patterns) {
      const match = cleanName.match(pattern);
      if (match && match[1]) {
        // Apply proper title case and fix Mc/Mac spacing
        return this.fixBrandCapitalization(match[1].trim());
      }
    }

    // Smart brand extraction for unknown brands
    // Pattern: [Brand] [Type/Expression] (e.g., "Hudson Bright Lights Big Bourbon")
    const smartPatterns = [
      // E.H. Taylor variations - MUST come first to override other patterns
      /^(?:Col(?:onel)?\s*)?E\.?\s*H\.?\s*Taylor(?:\s*Jr\.?)?/i,
      // Two-word brand before spirit type
      /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(?:Straight|Kentucky|Tennessee|Texas|Indiana|Bottled|Single|Small|Barrel|Batch|Pot\s+Still)/i,
      // Brand before flavor/expression
      /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(?:Pecan|Honey|Maple|Cinnamon|Apple|Cherry|Vanilla)/i,
      // Brand before unique name + bourbon/whiskey
      /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+(?:Bourbon|Whiskey|Whisky|Rye)/i,
    
      // Brand with city/state name (e.g., "Barrel Proof Nashville", "Barrel Proof NOLA")
      /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(?:Nashville|NOLA|Kentucky|Tennessee|Texas|Indiana|Colorado|Chicago|Denver|Austin|Portland|Seattle)/i,
      // Numbered brands with descriptive names
      /^(\d{4}|Barrel\s+Proof|Single\s+Barrel|Small\s+Batch)\s+[A-Z][a-zA-Z]+/i,
    ];

    for (const pattern of smartPatterns) {
      const match = cleanName.match(pattern);
      if (match) {
        // Special handling for E.H. Taylor pattern (no capture group)
        if (pattern.source.includes('E\\.?\\s*H\\.?\\s*Taylor')) {
          return 'E.H. Taylor';
        }
        // Regular patterns with capture groups
        if (match[1] && !this.isGenericWord(match[1])) {
          // Apply proper title case and fix Mc/Mac spacing
          return this.fixBrandCapitalization(match[1].trim());
        }
      }
    }

    // Check if any known brand appears in the name
    const knownBrandsLower = this.getKnownBrandsLowercase();
    for (const brand of knownBrandsLower) {
      if (cleanName.toLowerCase().startsWith(brand.toLowerCase())) {
        // Find the original case version
        const originalBrand = this.getKnownBrands().find(b => 
          b.toLowerCase() === brand.toLowerCase()
        );
        return this.fixBrandCapitalization(originalBrand || brand);
      }
    }

    // Last resort: If name follows pattern "[One or Two Words] [Rest]" where rest contains bourbon/whiskey
    const lastResortMatch = cleanName.match(/^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(.+)$/i);
    if (lastResortMatch && lastResortMatch[1] && lastResortMatch[2]) {
      const potentialBrand = lastResortMatch[1];
      const rest = lastResortMatch[2];
      
      // Check if the rest contains spirit indicators
      if (/\b(bourbon|whiskey|whisky|scotch|vodka|gin|rum|tequila|single\s*barrel|small\s*batch)\b/i.test(rest) &&
          !this.isGenericWord(potentialBrand) &&
          potentialBrand.length >= 3) {
        // Apply proper title case and fix Mc/Mac spacing
        return this.fixBrandCapitalization(potentialBrand);
      }
    }
    
    // Final fallback: Try first word if it's capitalized and not generic
    const firstWordMatch = cleanName.match(/^([A-Z][a-zA-Z]{2,})\s+/);
    if (firstWordMatch && firstWordMatch[1] && !this.isGenericWord(firstWordMatch[1])) {
      // Only if the name contains spirit indicators
      if (/\b(bourbon|whiskey|whisky|scotch|vodka|gin|rum|tequila)\b/i.test(cleanName)) {
        return this.fixBrandCapitalization(firstWordMatch[1]);
      }
    }

    return null;
  }

  /**
   * Fix brand capitalization and Mc/Mac spacing
   */
  private fixBrandCapitalization(brand: string): string {
    if (!brand) return brand;
    
    // Fix Mc/Mac spacing issues (e.g., "Mc Kenzie" → "McKenzie")
    let fixed = brand.replace(/\bMc\s+([A-Z])/g, 'Mc$1');
    fixed = fixed.replace(/\bMac\s+([A-Z])/g, 'Mac$1');
    
    // Handle specific known brand corrections
    const brandCorrections: { [key: string]: string } = {
      'mckenzie': 'McKenzie',
      'mc kenzie': 'McKenzie',
      'redemption': 'Redemption',
      'woodinville': 'Woodinville',
      'ammunition': 'Ammunition',
      'starlight': 'Starlight',
      'wilderness trail': 'Wilderness Trail',
      'eh taylor': 'E.H. Taylor',
      'e h taylor': 'E.H. Taylor',
      'e.h. taylor': 'E.H. Taylor',
      'col eh taylor': 'Col. E.H. Taylor',
      'colonel eh taylor': 'Colonel E.H. Taylor',
      'barrel proof': 'Barrel Proof',
      'nashville barrel': 'Nashville Barrel Company',
      'nashville barrel co': 'Nashville Barrel Company',
      'angels envy': "Angel's Envy",
      'weller': 'W.L. Weller',
      'wl weller': 'W.L. Weller',
      'blantons': "Blanton's",
      'makers mark': "Maker's Mark",
      'jack daniels': "Jack Daniel's"
    };
    
    const lowerFixed = fixed.toLowerCase();
    for (const [incorrect, correct] of Object.entries(brandCorrections)) {
      if (lowerFixed === incorrect) {
        return correct;
      }
    }
    
    // Apply proper title case to each word
    fixed = fixed.split(/\s+/).map(word => {
      if (word.length === 0) return word;
      
      // Handle special cases
      if (/^(of|and|the|at|in|on|by|for|with|&)$/i.test(word)) {
        return word.toLowerCase();
      }
      
      // Handle apostrophes (e.g., "o'clock", "Daniel's")
      if (word.includes("'")) {
        return word.split("'").map((part, index) => {
          if (index === 0 || part.length === 0) {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          }
          return part.toLowerCase();
        }).join("'");
      }
      
      // Standard title case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    
    // Ensure first word is always capitalized
    if (fixed.length > 0) {
      fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
    }
    
    return fixed;
  }

  /**
   * Clean spirit name by removing common suffixes and noise
   */
  private cleanSpiritName(name: string): string {
    let cleaned = name
      .replace(/\s*\|.*$/, '') // Remove everything after |
      .replace(/\s*-\s*[A-Z][a-zA-Z\s]+(?:\.com|Shop|Store|Online).*$/i, '') // Remove store names
      .replace(/\s*\(\d+ml\)/, '') // Remove volume in parentheses
      .replace(/\s*\[\d+\.\d+%\]/, '') // Remove ABV in brackets
      // Remove review-related suffixes
      .replace(/\s+Review$/i, '')
      .replace(/\s+Scoresheet\s*&\s*Review$/i, '')
      .replace(/\s+Scoresheet\s*&?$/i, '') // Handle "Scoresheet" or "Scoresheet &"
      // Remove website names after dash (e.g., "- Bourbon Culture")
      .replace(/\s*-\s*Bourbon\s*Culture$/i, '')
      .replace(/\s*-\s*The\s*Whisky\s*Exchange$/i, '')
      .replace(/\s*-\s*Master\s*of\s*Malt$/i, '')
      .replace(/\s*-\s*Total\s*Wine$/i, '')
      .replace(/\s*-\s*K&L\s*Wines$/i, '')
      .replace(/\s*-\s*Wine\.com$/i, '')
      .replace(/\s*-\s*Caskers$/i, '')
      .replace(/\s*-\s*Seelbach'?s?$/i, '')
      // Generic pattern for website suffixes
      .replace(/\s*-\s*[A-Z][a-zA-Z\s&.']+(?:Wine|Whisky|Whiskey|Spirits?|Store|Shop|\.com)$/i, '')
      // CRITICAL: Remove website artifacts from CSV data
      .replace(/-musthave.*$/i, '') // "Black-musthave Malts"
      .replace(/Proof-bourbon-kentucky$/i, '') // "81 Proof-bourbon-kentucky"
      .replace(/-bourbon-.*$/i, '') // Any trailing "-bourbon-location" patterns
      .replace(/^Mini\s+/i, '') // Remove "Mini" prefix for miniature bottles
      // Remove any remaining website/review site names
      .replace(/\s+On\s+(?:Whisky\s+)?Connosr$/i, '') // "On Whisky Connosr"
      .replace(/\s+Buy\s+Single\s+Barrel$/i, ' Single Barrel') // Clean up "Buy Single Barrel"
      .replace(/\s+Whisky$/, ' Whisky') // Normalize whisky/whiskey
      .replace(/\s+Whiskey$/, ' Whiskey')
      // Fix specific garbled names from CSV data
      .replace(/^Wi\s+Ld\s+Turkey/i, 'Wild Turkey') // "Wi Ld Turkey"
      .replace(/^Mu\s+Lho\s+L\s+Land/i, 'Mulholland') // "Mu Lho L Land"
      // CRITICAL FIX: Handle quotes and special characters
      .replace(/[''']/g, "'") // Normalize various apostrophe types
      .replace(/["""""]/g, '') // Remove all quote types
      .replace(/Lost\s+Lantern'far-flung\s+Iii'blended/i, 'Lost Lantern Far-Flung III Blended') // Fix specific case
      // Fix incomplete parsing
      .replace(/^Madness\s+Whiskey$/i, 'Method and Madness') // Common incomplete parsing
      .replace(/\s+/, ' ') // Normalize whitespace
      .trim();
    
    // CRITICAL FIX: Remove duplicate type/category suffixes after cleaning
    const duplicatePatterns = [
      /(\s+Kentucky\s+Straight)(\s+Bourbon\s+Whiskey)?(\s+Kentucky\s+Straight)$/i,
      /(\s+Bottled\s+in\s+Bond)(\s+Bourbon)?(\s+Bottled\s+in\s+Bond)$/i,
      /(\s+Single\s+Barrel)(\s+Bourbon)?(\s+Single\s+Barrel)$/i,
      /(\s+Small\s+Batch)(\s+Bourbon)?(\s+Small\s+Batch)$/i,
      /(\s+Cask\s+Strength)(\s+Bourbon)?(\s+Cask\s+Strength)$/i,
      /(\s+Barrel\s+Proof)(\s+Bourbon)?(\s+Barrel\s+Proof)$/i,
      /(\s+Straight\s+Bourbon\s+Whiskey)(\s+Straight\s+Bourbon\s+Whiskey)$/i,
    ];
    
    for (const pattern of duplicatePatterns) {
      cleaned = cleaned.replace(pattern, '$1$2');
    }
    
    // Fix text spacing issues (camelCase, concatenated words, etc.)
    cleaned = TextProcessor.fixTextSpacing(cleaned);
    
    // Apply brand capitalization fixes
    const brand = this.extractBrandFromName(cleaned);
    if (brand) {
      const properBrand = this.fixBrandCapitalization(brand);
      cleaned = cleaned.replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'), properBrand);
    }
    
    return cleaned;
  }
  
  /**
   * Fix camelCase text spacing (e.g., "WildTurkey" → "Wild Turkey")
   */
  private fixCamelCaseSpacing(text: string): string {
    // Handle common camelCase patterns in spirit names
    return text
      // Add space before capital letters in the middle of words
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Handle specific known patterns
      .replace(/\bWildTurkey\b/g, 'Wild Turkey')
      .replace(/\bElijahCraig\b/g, 'Elijah Craig')
      .replace(/\bBuffaloTrace\b/g, 'Buffalo Trace')
      .replace(/\bMakersMatch\b/g, 'Makers Mark')
      .replace(/\bWoodfordReserve\b/g, 'Woodford Reserve')
      .replace(/\bJimBeam\b/g, 'Jim Beam')
      .replace(/\bJackDaniels\b/g, 'Jack Daniels')
      .replace(/\bFourRoses\b/g, 'Four Roses')
      .replace(/\bKnobCreek\b/g, 'Knob Creek')
      .replace(/\bSingleMalt\b/g, 'Single Malt')
      .replace(/\bSmallBatch\b/g, 'Small Batch')
      .replace(/\bSingleBarrel\b/g, 'Single Barrel')
      .replace(/\bCaskStrength\b/g, 'Cask Strength')
      .replace(/\bBarrelProof\b/g, 'Barrel Proof')
      .replace(/\bOldForester\b/g, 'Old Forester')
      .replace(/\bHeavenHill\b/g, 'Heaven Hill')
      .replace(/\bAngelEnvy\b/g, 'Angel Envy')
      .replace(/\bBasilHayden\b/g, 'Basil Hayden')
      .replace(/\bEagleRare\b/g, 'Eagle Rare')
      .replace(/\bPappyVanWinkle\b/g, 'Pappy Van Winkle')
      .replace(/\bGeorgeTStagg\b/g, 'George T Stagg')
      .replace(/\bHenryMcKenna\b/g, 'Henry McKenna')
      .replace(/\bOldGrandDad\b/g, 'Old Grand Dad')
      .replace(/\bVeryOldBarton\b/g, 'Very Old Barton')
      .replace(/\bWildernessTrail\b/g, 'Wilderness Trail')
      .replace(/\bNewRiff\b/g, 'New Riff')
      // Handle whisky patterns
      .replace(/\bKavalanWhiskyClassic\b/g, 'Kavalan Whisky Classic')
      .replace(/\bKavalanWhisky\b/g, 'Kavalan Whisky')
      .replace(/\bYamazakiSingleMalt\b/g, 'Yamazaki Single Malt')
      .replace(/\bHibikiHarmony\b/g, 'Hibiki Harmony')
      .replace(/\bNikkaWhisky\b/g, 'Nikka Whisky')
      // Normalize multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Check if a title is too generic (search results page, category page, etc.)
   */
  private isGenericTitle(title: string): boolean {
    const genericPatterns = [
      /search results/i,
      /product catalog/i,
      /shop\s+all/i,
      /browse\s+our/i,
      /^page\s+\d+/i,
      /collection\s+page/i,
      /category:/i,
      /results for/i,
      // Article/listicle patterns
      /^\d+\s+(best|top)/i,
      /^the\s+\d+\s+(best|top)/i,
      /^best\s+.+\s+(ranked|reviewed)/i,
      /^top\s+\d+/i,
      /ranked\s+(worst\s+to\s+best|best\s+to\s+worst)/i,
      /^the\s+best\s+.+\s+(under|over|between)\s+\$/i,
      /^\d+\s+of\s+the\s+best/i,
      /guide\s+to/i,
      /complete\s+guide/i,
      /ultimate\s+guide/i,
      /everything\s+you\s+need/i,
      /how\s+to\s+(choose|pick|select|find)/i,
      /vs\.?\s+/i,
      /comparison/i,
      /review:/i,
      /^review\s+\d+:/i,
      // Shop/Browse patterns
      /^shop\s+(best|all|our|premium)/i,
      /^explore\s+(our|the|a)/i,
      /^discover\s+/i,
      /^bourbon\s+whiskey$/i,  // Just "Bourbon Whiskey" is not a product
      // Generic releases/news patterns
      /^new\s+whisk(?:e)?y\s+releases?$/i,
      /releases?\s+\d{4}$/i,  // "Releases 2024"
      /^(latest|recent|upcoming)\s+releases?/i,
      // Category patterns with &
      /(?:bourbons?|whisk(?:e)?ys?)\s*&\s*(?:bourbons?|whisk(?:e)?ys?)$/i,
      /wheated\s+bourbons?\s*&/i,
      // Review patterns
      /\s+review$/i,
      /\s+scoresheet$/i,
      /\s+scoresheet\s*&\s*review$/i,
      // News/launch patterns
      /\b(releases?|launches?|introduces?)\b/i,
      /\b(announces?|unveils?|debuts?)\b/i,
      /\b(available\s+now|just\s+released|coming\s+soon)\b/i,
      // Store names
      /\b(total\s*wine|master\s*of\s*malt|whisky\s*exchange)\b/i,
      /\b(bourbon\s*culture|whiskey\s*magazine|spirits?\s*journal)\b/i,
      /\b(wine\.com|caskers|seelbachs?)\b/i,
      // Generic single words that shouldn't be products
      /^(whiskey|bourbon|scotch|vodka|gin|rum|tequila|irish|single\s*malt)$/i,
      // CRITICAL: Generic category patterns from Round 17
      /^bottled\s+in\s+bond\s+bourbon$/i,  // "Bottled In Bond Bourbon"
      /^barrel\/cask\s+strength\s+bourbons?$/i,  // "Barrel/cask Strength Bourbons"
      /^cask\s+strength\s+bourbons?$/i,  // "Cask Strength Bourbons"
      /^single\s+barrel\s+bourbons?$/i,  // "Single Barrel Bourbons"
      /^small\s+batch\s+bourbons?$/i,  // "Small Batch Bourbons"
      /^wheated\s+bourbons?$/i,  // "Wheated Bourbons"
      /^rye\s+whisk(?:e)?ys?$/i,  // "Rye Whiskeys"
      /^tennessee\s+whisk(?:e)?ys?$/i,  // "Tennessee Whiskeys"
      /^irish\s+whisk(?:e)?ys?$/i,  // "Irish Whiskeys"
      /^scotch\s+whiskys?$/i,  // "Scotch Whiskys"
      /^single\s+malt\s+scotch$/i,  // "Single Malt Scotch"
      /^blended\s+scotch$/i,  // "Blended Scotch"
      /^japanese\s+whiskys?$/i,  // "Japanese Whiskys"
      /^canadian\s+whiskys?$/i,  // "Canadian Whiskys"
    ];
    
    return genericPatterns.some(pattern => pattern.test(title));
  }

  /**
   * Check if a product name is too generic (likely a search query)
   */
  private isGenericProductName(name: string): boolean {
    const genericPatterns = [
      // Price descriptors only
      /^(budget|value|premium|mid-range|luxury|ultra-premium)\s+(whiskey|bourbon|scotch|vodka|gin|rum)$/i,
      // Age only
      /^\d+\s*year\s*old\s*(whiskey|bourbon|scotch)$/i,
      // Flavor descriptors only
      /^(smooth|spicy|sweet|complex|rich|mellow)\s+(whiskey|bourbon|scotch|vodka|gin|rum)$/i,
      // Category only
      /^(whiskey|bourbon|scotch|vodka|gin|rum|tequila)\s*(collection|selection|catalog)$/i,
      // Generic search terms
      /^(best|top|good|nice|popular)\s+(whiskey|bourbon|scotch|vodka|gin|rum)$/i,
      // Store inventory pages
      /page\s*\d+$/i,
      /inventory/i,
      /catalog/i,
      // Generic fragments
      /^(single|double|triple)\s*(malt|barrel|grain)$/i,
      /^(small|large)\s*batch$/i,
      /^(cask|barrel)\s*strength$/i,
      /^(bottled|straight)\s*(bourbon|whiskey)$/i,
      // Store/publication fragments
      /^(wine|liquor|spirits?)\s*(store|shop|outlet|market)$/i,
      /^(bourbon|whiskey|whisky)\s*(culture|magazine|journal|blog)$/i,
      /^(total|master|grand)\s*(wine|malt|spirits?)$/i,
      // Generic adjectives
      /^(rare|special|limited|exclusive|select|premium|classic)\s*(edition|reserve|collection)$/i,
      // Generic regional categories
      /^(kentucky|tennessee|scottish|irish|japanese|canadian)\s+(bourbon|whiskey|whisky|scotch)$/i,
      // Generic two-word spirit types
      /^(scotch|irish)\s+(whisky|whiskey)$/i,
      // CRITICAL: Generic category names from Round 17
      /^bottled\s+in\s+bond\s+bourbon$/i,  // "Bottled In Bond Bourbon"
      /^barrel\/cask\s+strength\s+bourbons?$/i,  // "Barrel/cask Strength Bourbons"
      /^cask\s+strength\s+bourbons?$/i,  // "Cask Strength Bourbons"
      /^barrel\s+strength\s+bourbons?$/i,  // "Barrel Strength Bourbons"
      /^single\s+barrel\s+bourbons?$/i,  // "Single Barrel Bourbons"
      /^small\s+batch\s+bourbons?$/i,  // "Small Batch Bourbons"
      /^wheated\s+bourbons?$/i,  // "Wheated Bourbons"
      /^high\s+rye\s+bourbons?$/i,  // "High Rye Bourbons"
      /^finished\s+bourbons?$/i,  // "Finished Bourbons"
      /^limited\s+edition\s+bourbons?$/i,  // "Limited Edition Bourbons"
      /^craft\s+bourbons?$/i,  // "Craft Bourbons"
      /^american\s+whisk(?:e)?ys?$/i,  // "American Whiskeys"
      /^straight\s+bourbons?$/i,  // "Straight Bourbons"
      /^kentucky\s+straight\s+bourbon$/i,  // "Kentucky Straight Bourbon" (generic)
      /^(cask|barrel)\s+(strength|proof)$/i,  // Just "Cask Strength" or "Barrel Proof"
      /^(single|small|large)\s+(barrel|batch)$/i,  // Just "Single Barrel" or "Small Batch"
      /^(bottled\s+in\s+bond|bib)$/i,  // Just "Bottled in Bond" or "BiB"
    ];
    
    return genericPatterns.some(pattern => pattern.test(name));
  }

  /**
   * Clean page title by removing common suffixes and store names
   */
  private cleanPageTitle(title: string): string {
    return title
      // Remove common page suffixes
      .replace(/\s*[\|\-–—]\s*Page\s*\d+$/i, '')
      .replace(/\s*\(\d+\s*Products?\)$/i, '')
      .replace(/\s*-\s*\d+\s*Results?$/i, '')
      // Remove "Buy" prefixes
      .replace(/^Buy\s+/i, '')
      .replace(/^Shop\s+/i, '')
      .replace(/^Purchase\s+/i, '')
      // Keep the product part before store names
      .trim();
  }

  /**
   * Deduplicate discovered spirits
   */
  private deduplicateSpirits(spirits: DiscoveredSpirit[]): DiscoveredSpirit[] {
    const uniqueMap = new Map<string, DiscoveredSpirit>();
    
    for (const spirit of spirits) {
      const key = `${spirit.brand || 'unknown'}::${spirit.name}`.toLowerCase();
      
      // Keep the one with highest confidence
      const existing = uniqueMap.get(key);
      if (!existing || spirit.confidence > existing.confidence) {
        uniqueMap.set(key, spirit);
      }
    }

    return Array.from(uniqueMap.values());
  }

  /**
   * Extract spirits from search result snippet - ONLY actual product names
   */
  private extractSpiritsFromSnippet(snippet: string, source: string): DiscoveredSpirit[] {
    const spirits: DiscoveredSpirit[] = [];
    if (!snippet) return spirits;
    
    // Skip snippets that are clearly not product-focused
    if (this.isDescriptiveSnippet(snippet)) {
      return spirits;
    }
    
    // Only extract from very specific product patterns
    const strictProductPatterns = [
      // Full product name with known brand at start
      /\b(Buffalo Trace|Maker's Mark|Four Roses|Eagle Rare|Blanton's|Wild Turkey|Jim Beam|Jack Daniel's|Knob Creek|Woodford Reserve|Bulleit|Elijah Craig|Michter's|Old Forester|Heaven Hill|Larceny|Wilderness Trail|New Riff|Hudson|McKenzie|William Wolf|Balcones|Old Carter|Hillrock)\s+([A-Z][a-zA-Z'\s]+(?:Bourbon|Whiskey|Whisky|Single\s*Barrel|Small\s*Batch|Reserve|Select|Edition)(?:\s+\d+\s*Year)?)/g,
      // Specific numbered releases (e.g., "1792 Small Batch")
      /\b(\d{4})\s+(Small\s*Batch|Single\s*Barrel|Kentucky\s*Bourbon|Straight\s*Bourbon)/g,
    ];
    
    const foundNames = new Set<string>();
    
    for (const pattern of strictProductPatterns) {
      let match;
      pattern.lastIndex = 0;
      
      while ((match = pattern.exec(snippet)) !== null) {
        const productName = match[0].trim();
        
        // Must be a complete product name, not a fragment
        if (this.isCompleteSpiritName(productName) && !foundNames.has(productName.toLowerCase())) {
          foundNames.add(productName.toLowerCase());
          
          const brand = this.extractBrandFromName(productName) || match[1];
          spirits.push({
            name: this.cleanSpiritName(productName),
            brand: brand,
            confidence: 0.85,
            source,
          });
        }
      }
    }
    
    return spirits;
  }
  
  /**
   * Check if a search result looks like a product page
   */
  private isProductPage(result: GoogleSearchResult): boolean {
    // Check URL patterns
    const productUrlPatterns = [
      /\/product\//i,
      /\/products\//i,
      /\/p\//i,
      /\/item\//i,
      /\/shop\//i,
      /\/whiskey\//i,
      /\/bourbon\//i,
      /\/spirits\//i,
      /\/bottle\//i,
    ];
    
    const hasProductUrl = productUrlPatterns.some(pattern => pattern.test(result.link));
    
    // Check if it's from a known retailer
    const isRetailer = isReputableDomain(result.link);
    
    // Check title patterns
    const hasProductTitle = !this.isGenericTitle(result.title) && 
                          this.looksLikeSpiritName(result.title);
    
    return hasProductUrl || (isRetailer && hasProductTitle);
  }
  
  /**
   * Convert discovered spirits to search items for processing
   */
  convertToSearchItems(spirits: DiscoveredSpirit[]): SpiritSearchItem[] {
    // Filter out any remaining generic entries with stricter validation
    const validSpirits = spirits.filter(spirit => {
      // Must be valid and complete
      if (!this.isValidSpiritName(spirit.name) || spirit.name.length < 8) {
        return false;
      }
      
      // Must not be generic
      if (this.isGenericProductName(spirit.name)) {
        return false;
      }
      
      // Must have a brand (prevents fragments)
      if (!spirit.brand || spirit.brand.length < 2) {
        return false;
      }
      
      // Brand must not be generic
      if (this.isGenericWord(spirit.brand)) {
        return false;
      }
      
      return true;
    });
    
    return validSpirits.map(spirit => ({
      name: spirit.name,
      brand: spirit.brand,
      metadata: {
        discoverySource: spirit.source,
        discoveryConfidence: spirit.confidence,
        spiritType: spirit.type,
      },
    }));
  }
  /**
   * Get list of known brands
   */
  private getKnownBrands(): string[] {
    return [
      // Bourbon
      'Jack Daniel\'s', 'Jim Beam', 'Maker\'s Mark', 'Buffalo Trace', 'Wild Turkey',
      'Four Roses', 'Woodford Reserve', 'Knob Creek', 'Bulleit', 'Elijah Craig',
      'Heaven Hill', 'Old Forester', 'Evan Williams', 'Eagle Rare', 'Blanton\'s',
      'Pappy Van Winkle', 'W.L. Weller', 'George T. Stagg', 'Booker\'s', 'Basil Hayden',
      'Larceny', 'Very Old Barton', 'Old Grand-Dad', 'Henry McKenna', 'Rebel',
      'Wilderness Trail', 'New Riff', 'Hudson', 'McKenzie', 'William Wolf',
      'Balcones', 'Old Carter', 'Hillrock', 'Starlight', 'Ammunition',
      'Never Say Die', 'Michter\'s', 'Jefferson\'s', 'Angel\'s Envy',
      'Redemption', 'Woodinville', 'McKenzie',
      '1792', '1776', 'Benchmark', 'Ancient Age', 'Fighting Cock',
      // Scotch
      'Johnnie Walker', 'Glenfiddich', 'The Macallan', 'The Glenlivet', 'Highland Park',
      'Ardbeg', 'Lagavulin', 'Talisker', 'Bowmore', 'Laphroaig', 'Glenmorangie',
      'The Dalmore', 'The Balvenie', 'Oban', 'Springbank', 'Bruichladdich',
      'Bunnahabhain', 'Caol Ila', 'Kilchoman', 'GlenDronach', 'Glenfarclas',
      // Irish
      'Jameson', 'Bushmills', 'Redbreast', 'Green Spot', 'Teeling',
      'Tullamore D.E.W.', 'Midleton', 'Powers', 'Connemara',
      // Others
      'Grey Goose', 'Hendrick\'s', 'Bombay', 'Bacardi', 'Don Julio', 'Patron',
      'Hennessy', 'Crown Royal', 'Suntory', 'Nikka', 'Tito\'s', 'Ketel One',
      'Absolut', 'Smirnoff', 'Tanqueray', 'Beefeater', 'Captain Morgan',
    ];
  }
  
  /**
   * Get lowercase versions of known brands for comparison
   */
  private getKnownBrandsLowercase(): string[] {
    return this.getKnownBrands().map(b => b.toLowerCase());
  }
  
  /**
   * Check if a word is too generic to be a brand
   */
  private isGenericWord(word: string): boolean {
    const genericWords = [
      'The', 'Best', 'Top', 'Premium', 'Budget', 'Smooth', 'Rich',
      'Buy', 'Shop', 'Get', 'Find', 'Order', 'Try', 'Our', 'New',
      'Limited', 'Special', 'Exclusive', 'Select', 'Private', 'Custom',
      'American', 'Kentucky', 'Tennessee', 'Scottish', 'Irish', 'Japanese',
      'Single', 'Double', 'Triple', 'Small', 'Large', 'Old', 'Young',
      'Rare', 'Common', 'Popular', 'Famous', 'Original', 'Classic',
      'Explore', 'Discover', 'Browse', 'View', 'See', 'Check',
      'World', 'Global', 'International', 'National', 'Local',
      // Spirit type words that should not be brands
      'Bourbon', 'Whiskey', 'Whisky', 'Vodka', 'Gin', 'Rum', 'Tequila',
      'Brandy', 'Cognac', 'Scotch', 'Rye', 'Malt', 'Spirit', 'Spirits',
    ];
    
    return genericWords.some(g => g.toLowerCase() === word.toLowerCase());
  }
  
  /**
   * Check if this is an article title (not a product)
   */
  private isArticleTitle(title: string): boolean {
    const articlePatterns = [
      // CRITICAL NEW PATTERNS FROM ROUND 16
      /\d+\s+(popular|best|worst|top|amazing)/i,  // "11 Popular Bourbon Trends"
      /(trends|tips|tricks|facts)\s+(to|you|that)/i,  // "Trends To Avoid"
      /to\s+(avoid|know|buy|try|drink|skip)(-|$)/i,  // "To Avoid-chowhound"
      /what\s+to\s+know\s+about/i,  // "What To Know About Cask Strength"
      /can\s+evolve/i,  // "Even Bourbon Can Evolve"
      /^even\s+.+\s+can\s+/i,  // "Even X Can Y" pattern
      /curbside\s+(ordering|pickup)/i,  // "Curbside Ordering-woodford"
      /ordering-.+/i,  // Any "Ordering-X" pattern
      /-chowhound|-everydaydrinking|-fredminnick/i,  // Domain suffixes
      
      // Reddit patterns
      /^r\//i,
      /reddit:/i,
      /on\s+reddit:/i,
      /^review\s+\d+:/i,  // "Review 88: Wild Turkey"
      /^review\s+#\d+/i,
      
      // Question patterns
      /what['']s\s+(the|a)/i,
      /\?$/,
      /^(why|what|when|where|who|how)\s+/i,
      
      // Award/competition patterns
      /awards?\s+(are|announce|winner)/i,
      /competition/i,
      /contest/i,
      
      // News/release patterns  
      /\[new\s+releases?\]/i,
      /you\s+don['']t\s+want\s+to\s+miss/i,
      /coming\s+soon/i,
      /just\s+released/i,
      /now\s+available/i,
      
      // Multiple products in title
      /\s*&\s+more/i,
      /\s*\+\s*\d+\s*more/i,
      /multiple|various|several/i,
      
      // Opinion/subjective
      /worthwhile/i,
      /worth\s+(buying|trying|it)/i,
      /my\s+(favorite|pick|choice)/i,
      /I\s+(tried|tested|reviewed)/i,
      /should\s+you/i,
      /is\s+it\s+worth/i,
      /you\s+(need|must|have)/i,
      /ultimate\s+(guide|list)/i,
      
      // Launch/release patterns
      /\b(releases?|launches?|introduces?)\b/i,
      /\b(announces?|unveils?|debuts?)\b/i,
      /\b(breaking|exclusive|first\s+look)\b/i,
      /\b(available|hitting|arriving)\b/i,
      
      // Store/publication patterns
      /\b(store|shop|outlet|market|publication|magazine|journal|blog)\b/i,
      /\b(total\s*wine|master\s*of\s*malt|whisky\s*exchange|bourbon\s*culture)\b/i,
      
      // Generic fragments that are not products
      /^(single|double|triple)\s*(malt|barrel|grain)$/i,
      /^(irish|scottish|japanese|canadian|american)\s*(whiskey|whisky)$/i,
      /^(kentucky|tennessee)\s*bourbon$/i,
      /^(small|large)\s*batch$/i,
      /^(cask|barrel)\s*strength$/i,
    ];
    
    return articlePatterns.some(pattern => pattern.test(title));
  }
  
  /**
   * Check if a name is a valid spirit name (what would be on a bottle)
   */
  private isValidSpiritName(name: string): boolean {
    // Too short or too long
    if (name.length < 8 || name.length > 60) return false;
    
    // CRITICAL: Use comprehensive non-product filtering
    const nonProductCategories: Array<keyof typeof NON_PRODUCT_FILTERS.patterns> = [
      'tours', 'merchandise', 'beer', 'articles', 'retail', 'cocktails', 'food', 'events'
    ];
    
    for (const category of nonProductCategories) {
      if (containsNonProductPatterns(name, category)) {
        logger.debug(`Invalid spirit name - contains ${category} pattern: ${name}`);
        return false;
      }
    }
    
    // Additional specific patterns not in main config
    const additionalNonProductPatterns = [
      /vs\.?\s+/i,  // Comparisons like "Buffalo Trace vs Eagle Rare"
      /versus/i,
      /\b(whiskey\s+trail\s+home|bourbon\s+trail\s+home)\b/i,
      /\b(holiday\s+cask\s+strength\s+single\s+barrels)\b/i,
      /\b(mu\s+lho\s+l\s+land)\b/i,  // Garbled text
      /\b(single\s+estate\s+farm\s+continues\s+expansion)\b/i,  // News headlines
      /\b(founder's\s+original\s+bourbon\s+sour)\b/i,  // Cocktails
    ];
    
    for (const pattern of additionalNonProductPatterns) {
      if (pattern.test(name)) return false;
    }
    
    // If name is all lowercase, check if it could be a valid spirit when properly capitalized
    const hasCapitals = /[A-Z]/.test(name);
    if (!hasCapitals) {
      // Try to validate with proper capitalization
      const properlyCapitalized = name.split(/\s+/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      
      // If the properly capitalized version would be valid, allow it
      if (this.looksLikeSpiritName(properlyCapitalized)) {
        return this.isValidSpiritName(properlyCapitalized);
      }
      return false;
    }
    
    // CRITICAL: Reject duplicate word patterns like "Bourbon - Bourbon"
    if (/^(\w+)\s*-\s*\1$/i.test(name)) return false;
    
    // CRITICAL: Reject bare distillery names without product designation
    if (/^[\w\s]+Distillery$/i.test(name)) return false;
    
    // CRITICAL: Reject names ending with just "Distillery" or "Distillers"
    if (/\s+(Distillery|Distillers)$/i.test(name.trim()) && !/\b(bourbon|whiskey|whisky|vodka|gin|rum|tequila|edition|reserve|select)\b/i.test(name)) {
      return false;
    }
    
    // REJECT single words - spirits must have brand + product designation
    const wordCount = name.trim().split(/\s+/).length;
    if (wordCount < 2) return false;
    
    // REJECT generic single categories/descriptors
    const singleWordRejects = /^(SingleMalt|Irish|Bourbon|Whiskey|Whisky|Scotch|Vodka|Gin|Rum|Tequila|Premium|Select|Reserve|Classic|Special|Limited|Exclusive|Collection|Edition)$/i;
    if (singleWordRejects.test(name.replace(/\s+/g, ''))) return false;
    
    // Should not be just a category
    if (/^(bourbon|whiskey|scotch|vodka|gin|rum|tequila)$/i.test(name)) return false;
    
    // CRITICAL: Must NOT be a sentence or fragment
    if (name.includes('.') || name.includes(',') || name.includes('!') || name.includes('?')) return false;
    if (/\b(we|our|the|this|that|these|those|is|are|was|were|has|have|had)\b/i.test(name)) return false;
    if (/\b(produces?|made|craft|distilled?|aged|gives|offers?)\b/i.test(name)) return false;
    
    // REJECT article/news patterns
    const articlePatterns = [
      /\b(releases?|launches?|introduces?)\b/i,
      /\b(review|reviews?|reviewed)\b/i,
      /\b(scoresheet|rating|score)\b/i,
      /\b(announces?|announcement)\b/i,
      /\b(unveils?|debuts?)\b/i,
      /\b(available|now|just|recently)\b/i,
      /\b(coming|arriving|hitting)\b/i,
    ];
    if (articlePatterns.some(pattern => pattern.test(name))) return false;
    
    // REJECT store/publication names
    const storePatterns = [
      /\b(wine|liquor|spirits?)\s+(store|shop|market|outlet)\b/i,
      /\b(total\s*wine|master\s*of\s*malt|whisky\s*exchange)\b/i,
      /\b(bourbon\s*culture|whiskey\s*magazine|spirits?\s*journal)\b/i,
      /\b(wine\.com|caskers|seelbachs?)\b/i,
      /\b(magazine|journal|blog|publication)\b/i,
    ];
    if (storePatterns.some(pattern => pattern.test(name))) return false;
    
    // Reject specific generic titles
    if (/^New\s+Whisk(?:e)?y\s+Releases?$/i.test(name)) return false;
    
    // Reject category names with & (e.g., "Wheated Bourbons & Whiskey")
    if (/Bourbons?\s*&\s*Whisk(?:e)?y$/i.test(name)) return false;
    if (/Whisk(?:e)?ys?\s*&\s*Bourbons?$/i.test(name)) return false;
    if (/\s+&\s+/.test(name) && !/\s+(distillery|distillers|sons|co\.?|company)/i.test(name)) {
      // Has & but it's not part of a company name
      return false;
    }
    
    // CRITICAL: Reject patterns that are clearly not products
    const rejectPatterns = [
      /^\w+\s+Collection$/i,  // "Bourbon Collection"
      /^\w+\s+Selection$/i,   // "Whiskey Selection" 
      /^\w+\s+Catalog$/i,     // "Spirit Catalog"
      /^Premium\s+\w+$/i,     // "Premium Bourbon"
      /^Limited\s+\w+$/i,     // "Limited Whiskey"
      /^Special\s+\w+$/i,     // "Special Edition"
      /^Exclusive\s+\w+$/i,   // "Exclusive Reserve"
      /^\d{4}\s+Releases?$/i, // "2024 Releases"
      /^New\s+Releases?$/i,   // "New Releases"
      /^Latest\s+\w+$/i,      // "Latest Bourbon"
      // CRITICAL NEW PATTERNS FROM ROUND 17
      /^bottled\s+in\s+bond\s+bourbon$/i,
      /^barrel\/cask\s+strength\s+bourbons?$/i,
      /^(cask|barrel)\s+strength\s+bourbons?$/i,
      /^single\s+barrel\s+bourbons?$/i,
      /^small\s+batch\s+bourbons?$/i,
      /^straight\s+bourbon\s+whiskey$/i,
      /^kentucky\s+straight\s+bourbon$/i,
      /^bourbon\s+whiskey$/i,
      /^rye\s+whiskey$/i,
      /^(whiskey|whisky)\s+bourbons?$/i,
    ];
    
    if (rejectPatterns.some(pattern => pattern.test(name))) return false;
    
    // Should not contain these words that indicate it's not a product name
    const invalidPhrases = [
      /^(the|a|an)\s+(best|top|good|great)/i,
      /^(shop|buy|order|purchase|get)/i,
      /^(explore|discover|browse|find)/i,
      /collection$/i,
      /selection$/i,
      /catalog$/i,
      /^#\d+/,  // "#1 Whiskey"
      /curated/i,
      /awards?\s+are/i,
      /global\s+awards?/i,
      /journal$/i,
      /—/,  // Em dash indicates article title
      /\.\.\./, // Ellipsis indicates truncated text
      /\b(nose|palate|finish|notes|sweet|smooth)\b/i,  // Tasting descriptions
      /releases?$/i,  // "New Releases", "Latest Releases"
      /^(new|latest|recent|upcoming)\s+/i,  // Starts with time indicators
      /^(best|top)\s+/i,  // "Best Bourbon", "Top 10"
      /\b(ranked|reviewed|rated)\b/i,  // Review/ranking indicators
      /^(kentucky|tennessee|scottish|irish|japanese|canadian)\s+(bourbon|whiskey|whisky|scotch)$/i,  // Generic regional categories
      /^(premium|limited|special|exclusive|select|classic)\s+(reserve|edition|collection)$/i,  // Generic descriptors
      /magazine$/i,
      /\s+(store|shop|market|outlet)$/i,
      // CRITICAL: Additional patterns for fragments and non-products
      /^(smooth|rich|complex|balanced|premium|luxury|budget|value)\s+/i,  // Descriptor-led names
      /\s+(inventory|available|stock|supply)$/i,  // Inventory-related
      /^(order|buy|shop|purchase|get)\s+/i,  // Action verbs
      /\s+(now|today|online|here)$/i,  // Call-to-action endings
    ];
    
    if (invalidPhrases.some(pattern => pattern.test(name))) return false;
    
    // Must have both brand and product designation
    if (!this.hasBrandAndProduct(name)) return false;
    
    // CRITICAL: Ensure name is not just a brand or just a distillery name
    const extractedBrand = this.extractBrandFromName(name);
    if (extractedBrand && name.toLowerCase().trim() === extractedBrand.toLowerCase().trim()) {
      return false; // Just a brand name, not a product
    }
    
    // FINAL VALIDATION: Must be a complete product name with proper structure
    if (!this.isCompleteSpiritName(name) || this.isGenericProductName(name)) {
      return false;
    }
    
    // FINAL CHECK: Must have reasonable word count (2-6 words typical for spirits)
    const finalWordCount = name.trim().split(/\s+/).length;
    if (finalWordCount < 2 || finalWordCount > 8) return false;
    
    return true;
  }
  
  /**
   * Check if a title contains multiple products (like a list)
   */
  private containsMultipleProducts(title: string): boolean {
    // Look for patterns that indicate multiple products
    const multiplePatterns = [
      /,\s*[A-Z][a-zA-Z'\s]+,/,  // Comma-separated list with proper nouns
      /\s+(&|and)\s+[A-Z][a-zA-Z'\s]+\s+(Edition|Release|Bourbon|Whiskey)/i,
      /\s*&\s*more/i,
      /\s*\+\s*\d+/,
      /etc\.?$/i,
      /\[.*\]/,  // Contains bracketed info like [New Releases]
    ];
    
    return multiplePatterns.some(pattern => pattern.test(title));
  }
  
  /**
   * Check if snippet is descriptive text rather than product info
   */
  private isDescriptiveSnippet(snippet: string): boolean {
    const descriptivePatterns = [
      /\b(nose|palate|finish|aroma|taste|flavor)\b/i,
      /\b(sweet|smooth|rich|complex|balanced|crisp)\b/i,
      /\b(we|our|us|I|you)\b/i,
      /\b(produces?|makes?|crafts?|distills?)\b/i,
      /\b(offers?|provides?|features?|includes?)\b/i,
      /\b(is|are|was|were|has|have|had)\b/i,
      /\.{2,}/,  // Multiple periods
      /[.!?]\s+[A-Z]/,  // Sentence boundaries
    ];
    
    return descriptivePatterns.some(pattern => pattern.test(snippet));
  }
  
  /**
   * Check if text is a complete spirit name (not a fragment)
   */
  private isCompleteSpiritName(name: string): boolean {
    // Must start with capital letter or number
    if (!/^[A-Z0-9]/.test(name)) return false;
    
    // Must have at least 2 words (brand + product)
    const words = name.trim().split(/\s+/);
    if (words.length < 2) return false;
    
    // If it starts with a known brand, check it has proper product designation
    const knownBrands = this.getKnownBrands();
    const startsWithKnownBrand = knownBrands.some(brand => 
      name.toLowerCase().startsWith(brand.toLowerCase())
    );
    
    if (startsWithKnownBrand) {
      // Should be properly formatted (not all caps, not all lowercase)
      if (name === name.toUpperCase() || name === name.toLowerCase()) return false;
      
      // Must have product designation after brand name
      const matchingBrand = knownBrands.find(brand => 
        name.toLowerCase().startsWith(brand.toLowerCase())
      );
      if (matchingBrand) {
        const afterBrand = name.substring(matchingBrand.length).trim();
        if (!afterBrand || afterBrand.length < 3) return false; // Need product name
      }
      
      return true;
    }
    
    // For unknown brands, must contain spirit type indicator AND have brand-like first word
    const spiritIndicators = /\b(bourbon|whiskey|whisky|scotch|vodka|gin|rum|tequila|single\s*barrel|small\s*batch|cask\s*strength|barrel\s*proof|bottled\s*in\s*bond|straight|reserve|edition)\b/i;
    if (!spiritIndicators.test(name)) return false;
    
    // First word should look like a brand (capitalized, not generic)
    const firstWord = words[0];
    if (this.isGenericWord(firstWord)) return false;
    
    // Should not start with lowercase articles or prepositions
    if (/^(a|an|the|of|in|on|at|by|for|with)\s/i.test(name)) return false;
    
    // Should be properly formatted (not all caps, not all lowercase)
    if (name === name.toUpperCase() || name === name.toLowerCase()) return false;
    
    return true;
  }
  
  /**
   * Check if name has both brand and product designation
   */
  private hasBrandAndProduct(name: string): boolean {
    const words = name.trim().split(/\s+/);
    if (words.length < 2) return false;
    
    // Check if it starts with a known brand
    const knownBrands = this.getKnownBrands();
    const hasKnownBrand = knownBrands.some(brand => 
      name.toLowerCase().startsWith(brand.toLowerCase())
    );
    
    if (hasKnownBrand) {
      // Must have additional product designation
      const matchingBrand = knownBrands.find(brand => 
        name.toLowerCase().startsWith(brand.toLowerCase())
      );
      if (matchingBrand) {
        const afterBrand = name.substring(matchingBrand.length).trim();
        return !!(afterBrand && afterBrand.length >= 3);
      }
    }
    
    // For unknown brands, check pattern: [Brand Words] [Product Descriptor]
    // First 1-2 words should be brand, rest should include spirit type
    const spiritIndicators = /\b(bourbon|whiskey|whisky|scotch|vodka|gin|rum|tequila|single\s*barrel|small\s*batch|cask\s*strength|barrel\s*proof|straight|reserve|edition|year|proof|malt|grain)\b/i;
    
    if (!spiritIndicators.test(name)) return false;
    
    // First word should not be generic
    if (this.isGenericWord(words[0])) return false;
    
    return true;
  }
  
  /**
   * Check if snippet appears to be from a catalog page
   */
  private isCatalogSnippet(snippet: string): boolean {
    if (!snippet) return false;
    
    const catalogPatterns = [
      /\$\d+\.\d{2}.*\$\d+\.\d{2}/,  // Multiple prices
      /\d+ml.*\d+ml/,  // Multiple volumes
      /\bproducts?\s+\d+/i,
      /\bshowing\s+\d+/i,
      /\bresults?\s+\d+/i,
      /\·.*\·.*\·/,  // Multiple items separated by dots
      /\|.*\|.*\|/,  // Multiple items separated by pipes
    ];
    
    return catalogPatterns.some(pattern => pattern.test(snippet));
  }
  
  /**
   * Extract spirits from catalog-style snippets
   */
  private extractSpiritsFromCatalogSnippet(snippet: string, source: string): DiscoveredSpirit[] {
    const spirits: DiscoveredSpirit[] = [];
    if (!snippet) return spirits;
    
    // Pattern 1: Products listed with separators (·, |, -, etc.)
    const separatorPatterns = [
      /([A-Z][a-zA-Z\s'&.-]+(?:Bourbon|Whiskey|Whisky|Vodka|Gin|Rum|Tequila|Scotch))\s*[·|–-]/g,
      /[·|–-]\s*([A-Z][a-zA-Z\s'&.-]+(?:Bourbon|Whiskey|Whisky|Vodka|Gin|Rum|Tequila|Scotch))/g,
    ];
    
    // Pattern 2: Products with prices
    const pricePatterns = [
      /([A-Z][a-zA-Z\s'&.-]+(?:Bourbon|Whiskey|Whisky|Vodka|Gin|Rum|Tequila|Scotch))\s+\$\d+/g,
      /([A-Z][a-zA-Z\s'&.-]+\d+\s*(?:Year|YO|yr))\s+\$\d+/g,
    ];
    
    // Pattern 3: Products with volumes
    const volumePatterns = [
      /([A-Z][a-zA-Z\s'&.-]+(?:Bourbon|Whiskey|Whisky|Vodka|Gin|Rum|Tequila|Scotch))\s+\d+ml/g,
      /([A-Z][a-zA-Z\s'&.-]+)\s+\d+ml\s+(?:Bourbon|Whiskey|Whisky|Vodka|Gin|Rum|Tequila|Scotch)/g,
    ];
    
    // Pattern 4: Brand + Product patterns
    const brandProductPatterns = [
      /([A-Z][a-zA-Z']+(?:\s+[A-Z][a-zA-Z']+)?)\s+([A-Z][a-zA-Z\s]+(?:Bourbon|Whiskey|Whisky|Single\s*Barrel|Small\s*Batch))/g,
    ];
    
    const allPatterns = [...separatorPatterns, ...pricePatterns, ...volumePatterns, ...brandProductPatterns];
    const foundNames = new Set<string>();
    
    for (const pattern of allPatterns) {
      let match;
      pattern.lastIndex = 0;
      
      while ((match = pattern.exec(snippet)) !== null) {
        const productName = match[1]?.trim() || match[0]?.trim();
        
        if (productName && 
            productName.length >= 10 && 
            productName.length <= 60 &&
            this.isValidSpiritName(productName) &&
            !foundNames.has(productName.toLowerCase())) {
          
          foundNames.add(productName.toLowerCase());
          
          const brand = this.extractBrandFromName(productName);
          if (brand) {
            spirits.push({
              name: this.cleanSpiritName(productName),
              brand: brand,
              type: this.detectSpiritCategory(productName),
              confidence: 0.85,
              source,
            });
          }
        }
      }
    }
    
    return spirits;
  }

  /**
   * Extract individual spirits from a list (like in article titles)
   */
  private extractSpiritsFromList(text: string, source: string): DiscoveredSpirit[] {
    const spirits: DiscoveredSpirit[] = [];
    
    // Skip if it's a K&L journal title or similar
    if (/—\s*K&L\s*Spirits\s*Journal/i.test(text)) return spirits;
    
    // Remove bracketed sections like [New Releases]
    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    
    // Split by common delimiters
    const potentialSpirits = cleanText.split(/[,&]|\s+and\s+/i);
    
    for (let spirit of potentialSpirits) {
      spirit = spirit.trim();
      
      // Skip if it's "More" or similar
      if (/^(more|etc\.?|others?)$/i.test(spirit)) continue;
      
      // Clean up common suffixes/prefixes
      spirit = spirit
        .replace(/^(featuring|including|with|plus)\s+/i, '')
        .replace(/\s*\(.*?\)\s*/g, '') // Remove parenthetical info
        .replace(/^\d+\.\s*/, '') // Remove numbering like "1. "
        .trim();
      
      // Must be a complete spirit name
      if (spirit.length >= 10 && this.isCompleteSpiritName(spirit) && this.isValidSpiritName(spirit)) {
        const brand = this.extractBrandFromName(spirit);
        if (brand) {  // Only add if we can identify a brand
          spirits.push({
            name: this.cleanSpiritName(spirit),
            brand: brand,
            confidence: 0.75,
            source,
          });
        }
      }
    }
    
    return spirits;
  }
}

// Singleton instance
export const spiritDiscovery = new SpiritDiscoveryService();