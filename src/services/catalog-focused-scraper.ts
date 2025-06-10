import { Distillery, ALL_DISTILLERIES } from '../config/distilleries.js';
import { spiritExtractor } from './spirit-extractor.js';
import { spiritDiscovery } from './spirit-discovery.js';
import { SupabaseStorage } from './supabase-storage.js';
import { cacheService } from './cache-service.js';
import { logger } from '../utils/logger.js';
import { googleSearchClient } from './google-search.js';
import { getAllReputableDomains } from '../config/reputable-domains.js';
import { getSearchExclusions } from '../config/excluded-domains.js';
import { detectSpiritType } from '../config/spirit-types.js';
import { getDistilleryFromBrand } from '../config/brand-distillery-mapping.js';

export interface CatalogScrapingOptions {
  maxProductsPerDistillery?: number;
  startFromDistilleryIndex?: number;
  distilleryNames?: string[];
  skipExisting?: boolean;
}

export interface CatalogScrapingResult {
  distillery: string;
  productsFound: number;
  productsStored: number;
  errors: number;
  queries: string[];
  duration: number;
  efficiency: number; // spirits per API call
}

interface ExtractedProduct {
  name: string;
  brand?: string;
  type?: string;
  price?: string;
  abv?: string;
  volume?: string;
  age?: string;
  description?: string;
  image?: string;
  url: string;
  source?: string;
}

export class CatalogFocusedScraper {
  private storage: SupabaseStorage;
  private reputableDomains: string[];
  private topRetailers = [
    'totalwine.com',
    'thewhiskyexchange.com',
    'masterofmalt.com',
    'klwines.com',
    'wine.com',
    'drizly.com',
    'reservebar.com',
    'seelbachs.com',
    'flaviar.com',
    'caskers.com',
    'nestorliquor.com',
    'finedrams.com',
    'astorwines.com',
    'caskcartel.com'
  ];

  constructor() {
    this.storage = new SupabaseStorage();
    this.reputableDomains = getAllReputableDomains();
  }

  /**
   * Main method to scrape distilleries with catalog-focused approach
   */
  async scrapeAllDistilleries(options: CatalogScrapingOptions = {}): Promise<CatalogScrapingResult[]> {
    const {
      maxProductsPerDistillery = 100,
      startFromDistilleryIndex = 0,
      distilleryNames = [],
      skipExisting = true
    } = options;

    const results: CatalogScrapingResult[] = [];
    
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

    // Sort by priority and start from index
    distilleriesToScrape = distilleriesToScrape
      .sort((a, b) => (b.priority || 5) - (a.priority || 5))
      .slice(startFromDistilleryIndex);

    logger.info(`🚀 Starting CATALOG-FOCUSED scraping for ${distilleriesToScrape.length} distilleries`);

    for (const [index, distillery] of distilleriesToScrape.entries()) {
      logger.info(`\n📋 Processing distillery ${index + 1}/${distilleriesToScrape.length}: ${distillery.name}`);
      
      try {
        const result = await this.scrapeDistilleryCatalogs(distillery, {
          maxProducts: maxProductsPerDistillery,
          skipExisting
        });
        
        results.push(result);
        
        // Log progress with efficiency
        logger.info(`✅ ${distillery.name}: Found ${result.productsFound} products, stored ${result.productsStored}`);
        logger.info(`📊 Efficiency: ${result.efficiency.toFixed(2)} spirits per API call`);
        
        // Add delay between distilleries
        await this.delay(2000);
        
      } catch (error) {
        logger.error(`❌ Error scraping ${distillery.name}:`, error);
        results.push({
          distillery: distillery.name,
          productsFound: 0,
          productsStored: 0,
          errors: 1,
          queries: [],
          duration: 0,
          efficiency: 0
        });
      }
    }

    return results;
  }

  /**
   * Scrape a single distillery using catalog-focused approach
   */
  async scrapeDistilleryCatalogs(
    distillery: Distillery, 
    options: {
      maxProducts?: number;
      skipExisting?: boolean;
    } = {}
  ): Promise<CatalogScrapingResult> {
    const startTime = Date.now();
    const { maxProducts = 100, skipExisting = true } = options;

    const result: CatalogScrapingResult = {
      distillery: distillery.name,
      productsFound: 0,
      productsStored: 0,
      errors: 0,
      queries: [],
      duration: 0,
      efficiency: 0
    };

    const discoveredProducts = new Set<string>();
    const processedProducts = new Set<string>();

    try {
      // PHASE 1: Generate catalog-focused queries
      const catalogQueries = this.generateCatalogQueries(distillery);
      result.queries = catalogQueries;
      
      let apiCallsUsed = 0;

      // PHASE 2: Search for catalog pages
      for (const query of catalogQueries) {
        if (processedProducts.size >= maxProducts) {
          logger.info(`Reached max products limit (${maxProducts}) for ${distillery.name}`);
          break;
        }

        try {
          logger.info(`🔍 Searching: ${query}`);
          
          // Make the search
          const searchResults = await googleSearchClient.search({
            query,
            num: 10
          });
          apiCallsUsed++;

          if (!searchResults.items || searchResults.items.length === 0) {
            logger.warn(`No results for: ${query}`);
            continue;
          }

          // PHASE 3: Extract ALL products from search results at once
          const productsFromResults = await this.extractProductsFromSearchResults(
            searchResults.items,
            distillery
          );

          logger.info(`📦 Found ${productsFromResults.length} products from this catalog search`);

          // PHASE 4: Process discovered products
          for (const product of productsFromResults) {
            if (processedProducts.size >= maxProducts) break;

            const productKey = `${product.name}-${distillery.name}`.toLowerCase();
            if (discoveredProducts.has(productKey)) continue;
            
            discoveredProducts.add(productKey);
            result.productsFound++;

            // Skip if exists
            if (skipExisting && await this.checkProductExists(product.name, distillery.name)) {
              logger.debug(`Skipping existing: ${product.name}`);
              continue;
            }

            // Try to extract full product data if we have a URL
            let fullProductData = null;
            if (product.url) {
              try {
                fullProductData = await spiritExtractor.extractFromUrl(product.url);
              } catch (error) {
                logger.debug(`Could not extract full data from ${product.url}`);
              }
            }

            // Merge discovered data with extracted data
            const spiritData = {
              name: fullProductData?.name || product.name,
              brand: fullProductData?.brand || product.brand || this.extractBrandFromName(product.name, distillery),
              distillery: distillery.name,
              type: fullProductData?.type || product.type || this.inferTypeFromProduct(product, distillery),
              region: fullProductData?.region || distillery.region,
              country: fullProductData?.origin_country || distillery.country,
              price: fullProductData?.price || product.price,
              abv: fullProductData?.abv || product.abv,
              age: fullProductData?.age || product.age,
              volume: fullProductData?.volume || product.volume || '750ml',
              image_url: fullProductData?.image_url || product.image,
              source_url: product.url,
              description: fullProductData?.description || product.description,
              data_source: 'catalog_scraper',
              data_quality_score: this.calculateQualityScore({
                ...product,
                ...fullProductData
              })
            };

            // Store the product
            const stored = await this.storage.storeSpirit(spiritData);
            if (stored.success) {
              result.productsStored++;
              processedProducts.add(productKey);
              logger.info(`✅ Stored: ${spiritData.name} (${spiritData.type})`);
            }
          }

          // Rate limiting
          await this.delay(1500);
          
        } catch (error) {
          logger.error(`Error processing catalog query "${query}":`, error);
          result.errors++;
        }
      }

      // Calculate efficiency
      result.efficiency = apiCallsUsed > 0 ? result.productsFound / apiCallsUsed : 0;

    } catch (error) {
      logger.error(`Error in catalog scraping for ${distillery.name}:`, error);
      result.errors++;
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Generate catalog-focused queries for maximum efficiency
   */
  private generateCatalogQueries(distillery: Distillery): string[] {
    const queries: string[] = [];
    const exclusions = getSearchExclusions();

    // 1. Direct retailer catalog searches (HIGHEST YIELD)
    for (const retailer of this.topRetailers.slice(0, 6)) {
      queries.push(`site:${retailer} "${distillery.name}" catalog products ${exclusions}`);
      queries.push(`site:${retailer} "${distillery.name}" all products ${exclusions}`);
      
      // Also try with variations
      if (distillery.variations.length > 0) {
        queries.push(`site:${retailer} "${distillery.variations[0]}" collection ${exclusions}`);
      }
    }

    // 2. Multi-retailer OR queries for broader coverage
    const retailerGroups = [
      '(site:totalwine.com OR site:wine.com OR site:klwines.com)',
      '(site:thewhiskyexchange.com OR site:masterofmalt.com OR site:finedrams.com)',
      '(site:caskers.com OR site:flaviar.com OR site:reservebar.com)'
    ];

    for (const group of retailerGroups) {
      queries.push(`${group} "${distillery.name}" catalog ${exclusions}`);
      queries.push(`${group} "${distillery.name}" collection ${exclusions}`);
      queries.push(`${group} "${distillery.name}" "all products" ${exclusions}`);
    }

    // 3. Collection/catalog page searches
    queries.push(`"${distillery.name}" "view all" products ${exclusions}`);
    queries.push(`"${distillery.name}" complete collection catalog ${exclusions}`);
    queries.push(`"${distillery.name}" "all products" "shop now" ${exclusions}`);
    queries.push(`"${distillery.name}" products "sort by" price ${exclusions}`);

    // 4. Product line searches if available
    if (distillery.product_lines && distillery.product_lines.length > 0) {
      const topLines = distillery.product_lines.slice(0, 3);
      for (const line of topLines) {
        queries.push(`"${distillery.name}" "${line.name}" collection ${exclusions}`);
        queries.push(`"${line.name}" by "${distillery.name}" ${exclusions}`);
      }
    }

    // Limit to prevent API waste
    return queries.slice(0, 20);
  }

  /**
   * Extract multiple products from search results (catalog pages)
   */
  private async extractProductsFromSearchResults(
    searchResults: any[],
    distillery: Distillery
  ): Promise<ExtractedProduct[]> {
    const products: ExtractedProduct[] = [];

    for (const result of searchResults) {
      try {
        // Skip non-product results
        if (this.isNonProductResult(result)) {
          continue;
        }

        // Extract from structured data if available
        if (result.pagemap) {
          const structuredProducts = this.extractFromStructuredData(result.pagemap, distillery);
          for (const product of structuredProducts) {
            product.url = result.link;
            products.push(product);
          }
        }

        // Check if it's a catalog page
        if (this.isCatalogPage(result)) {
          const catalogProducts = this.extractFromCatalogSnippet(result.snippet, distillery);
          for (const product of catalogProducts) {
            product.url = result.link;
            products.push(product);
          }
        } else {
          // Try to extract individual products from title/snippet
          const titleProduct = this.extractProductFromTitle(result.title, distillery);
          if (titleProduct) {
            titleProduct.url = result.link;
            products.push(titleProduct);
          }

          const snippetProducts = this.extractProductsFromSnippet(result.snippet, distillery);
          for (const product of snippetProducts) {
            product.url = result.link;
            products.push(product);
          }
        }

      } catch (error) {
        logger.debug(`Error extracting from result: ${error}`);
      }
    }

    // Deduplicate by name
    const uniqueProducts = new Map<string, ExtractedProduct>();
    for (const product of products) {
      const key = this.normalizeProductName(product.name);
      if (!uniqueProducts.has(key)) {
        uniqueProducts.set(key, product);
      } else {
        // Merge data if we have better info
        const existing = uniqueProducts.get(key)!;
        uniqueProducts.set(key, {
          ...existing,
          price: existing.price || product.price,
          abv: existing.abv || product.abv,
          volume: existing.volume || product.volume,
          description: existing.description || product.description,
          image: existing.image || product.image,
        });
      }
    }

    return Array.from(uniqueProducts.values());
  }

  /**
   * Check if this result is non-product (article, review, etc.)
   */
  private isNonProductResult(result: any): boolean {
    const nonProductIndicators = [
      'review', 'blog', 'article', 'news', 'guide', 'tour',
      'vs', 'versus', 'comparison', 'best of', 'top 10',
      'history of', 'story of', 'how to', 'cocktail recipe'
    ];

    const text = `${result.title} ${result.snippet}`.toLowerCase();
    return nonProductIndicators.some(indicator => text.includes(indicator));
  }

  /**
   * Extract product from page title
   */
  private extractProductFromTitle(title: string, distillery: Distillery): ExtractedProduct | null {
    if (!title) return null;

    // Clean common suffixes
    let cleanTitle = title
      .replace(/\s*[\|\-–]\s*.*(?:Wine|Liquor|Spirits|Store|Shop|Online|Buy).*$/i, '')
      .replace(/\s*\|.*$/,'')
      .trim();

    // Skip if it doesn't contain distillery or brand reference
    const hasDistilleryRef = distillery.name.toLowerCase() === cleanTitle.toLowerCase().substring(0, distillery.name.length) ||
      distillery.variations.some(v => cleanTitle.toLowerCase().includes(v.toLowerCase())) ||
      (distillery.product_lines && distillery.product_lines.some(pl => cleanTitle.includes(pl.name)));

    if (!hasDistilleryRef) return null;

    // Extract product details from title
    const priceMatch = cleanTitle.match(/\$(\d+(?:\.\d{2})?)/);
    const abvMatch = cleanTitle.match(/(\d+(?:\.\d+)?)\s*%|(\d+)\s*proof/i);
    const volumeMatch = cleanTitle.match(/(\d+(?:\.\d+)?)\s*(ml|liter|L)/i);

    return {
      name: this.cleanProductName(cleanTitle, distillery),
      price: priceMatch ? `$${priceMatch[1]}` : undefined,
      abv: abvMatch ? (abvMatch[1] || (parseInt(abvMatch[2]) / 2).toString()) : undefined,
      volume: volumeMatch ? `${volumeMatch[1]}${volumeMatch[2]}` : undefined,
      url: ''
    };
  }

  /**
   * Extract products from snippet text
   */
  private extractProductsFromSnippet(snippet: string, distillery: Distillery): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];
    if (!snippet) return products;

    // Look for product patterns in snippet
    // Pattern 1: "Product Name - $XX.XX"
    const pricePattern = new RegExp(
      `([^$]+?)\\s*[\\-–]\\s*\\$?(\\d+(?:\\.\\d{2})?)`,
      'g'
    );
    
    let match;
    while ((match = pricePattern.exec(snippet)) !== null) {
      const productName = match[1].trim();
      if (this.isValidProductName(productName, distillery)) {
        products.push({
          name: this.cleanProductName(productName, distillery),
          price: `$${match[2]}`,
          url: ''
        });
      }
    }

    // Pattern 2: Look for product lines mentioned
    if (distillery.product_lines) {
      for (const line of distillery.product_lines) {
        if (snippet.includes(line.name)) {
          // Check for specific expressions
          const expressionPattern = new RegExp(
            `${line.name}\\s+([A-Z][\\w\\s]+?)(?:\\s+(?:${distillery.type?.join('|') || 'whiskey'}))`,
            'gi'
          );
          
          let lineMatch;
          while ((lineMatch = expressionPattern.exec(snippet)) !== null) {
            products.push({
              name: `${line.name} ${lineMatch[1]}`.trim(),
              url: ''
            });
          }

          // Check for subcategories
          if (line.subcategories) {
            for (const subcat of line.subcategories) {
              if (snippet.includes(subcat)) {
                products.push({
                  name: `${line.name} ${subcat}`,
                  url: ''
                });
              }
            }
          }
        }
      }
    }

    return products;
  }

  /**
   * Extract from structured data (JSON-LD, etc.)
   */
  private extractFromStructuredData(pagemap: any, distillery: Distillery): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];

    // Check for product structured data
    if (pagemap.product) {
      for (const product of pagemap.product) {
        if (product.name && this.isValidProductName(product.name, distillery)) {
          products.push({
            name: this.cleanProductName(product.name, distillery),
            price: product.offers?.price || product.price,
            brand: product.brand || this.extractBrandFromName(product.name, distillery),
            description: product.description,
            image: product.image,
            url: ''
          });
        }
      }
    }

    // Check for offer/aggregate rating which often indicates products
    if (pagemap.offer) {
      for (const offer of pagemap.offer) {
        if (offer.name && this.isValidProductName(offer.name, distillery)) {
          products.push({
            name: this.cleanProductName(offer.name, distillery),
            price: offer.price,
            brand: this.extractBrandFromName(offer.name, distillery),
            url: ''
          });
        }
      }
    }

    // Check metatags for product info
    if (pagemap.metatags && pagemap.metatags[0]) {
      const meta = pagemap.metatags[0];
      if (meta['og:title'] && this.isValidProductName(meta['og:title'], distillery)) {
        products.push({
          name: this.cleanProductName(meta['og:title'], distillery),
          price: meta['product:price:amount'],
          description: meta['og:description'],
          image: meta['og:image'],
          url: ''
        });
      }
    }

    return products;
  }

  /**
   * Check if this is likely a catalog/collection page
   */
  private isCatalogPage(result: any): boolean {
    const catalogIndicators = [
      'products found',
      'items',
      'showing',
      'sort by',
      'filter',
      'view all',
      'collection',
      'catalog',
      'shop',
      'browse',
      'results for',
      'page 1',
      'grid view',
      'list view'
    ];

    const text = `${result.title} ${result.snippet}`.toLowerCase();
    return catalogIndicators.some(indicator => text.includes(indicator));
  }

  /**
   * Extract products from catalog page snippets
   */
  private extractFromCatalogSnippet(snippet: string, distillery: Distillery): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];
    if (!snippet) return products;

    // Pattern 1: "Product Name $XX.XX" or "Product Name - $XX"
    const pricePattern = /([^$\n]+?)\s*[$](\d+(?:\.\d{2})?)/g;
    const matches = Array.from(snippet.matchAll(pricePattern));
    
    for (const match of matches) {
      const name = match[1].trim();
      if (this.isValidProductName(name, distillery)) {
        products.push({
          name: this.cleanProductName(name, distillery),
          price: `$${match[2]}`,
          url: ''
        });
      }
    }

    // Pattern 2: Listed products with bullets or separators
    const listPatterns = [
      /(?:^|[•·|])\s*([^•·|$\n]+?)(?=[•·|$\n])/gm,
      /(?:^|\n)\s*[-*]\s*([^-*\n]+?)(?=\n|$)/gm,
      /(?:^|\n)\s*\d+\.\s*([^\n]+?)(?=\n|$)/gm
    ];
    
    for (const pattern of listPatterns) {
      const listMatches = Array.from(snippet.matchAll(pattern));
      for (const match of listMatches) {
        const name = match[1].trim();
        if (this.isValidProductName(name, distillery)) {
          // Extract price if present
          const priceInName = name.match(/\$(\d+(?:\.\d{2})?)/);
          const cleanName = name.replace(/\s*\$\d+(?:\.\d{2})?/, '').trim();
          
          products.push({
            name: this.cleanProductName(cleanName, distillery),
            price: priceInName ? `$${priceInName[1]}` : undefined,
            url: ''
          });
        }
      }
    }

    // Pattern 3: Grid/table format "Name ... $Price"
    const gridPattern = /([^.\n]+?)\s*\.{2,}\s*\$(\d+(?:\.\d{2})?)/g;
    const gridMatches = Array.from(snippet.matchAll(gridPattern));
    
    for (const match of gridMatches) {
      const name = match[1].trim();
      if (this.isValidProductName(name, distillery)) {
        products.push({
          name: this.cleanProductName(name, distillery),
          price: `$${match[2]}`,
          url: ''
        });
      }
    }

    return products;
  }

  /**
   * Check if a product name is valid
   */
  private isValidProductName(name: string, distillery: Distillery): boolean {
    if (!name || name.length < 3 || name.length > 150) return false;

    // Must contain distillery reference or known product line
    const hasDistilleryRef = 
      name.toLowerCase().includes(distillery.name.toLowerCase()) ||
      distillery.variations.some(v => name.toLowerCase().includes(v.toLowerCase())) ||
      (distillery.product_lines && distillery.product_lines.some(pl => name.includes(pl.name)));

    if (!hasDistilleryRef) return false;

    // Avoid non-product text
    const nonProductTerms = [
      'review', 'article', 'blog', 'news', 'story',
      'vs', 'versus', 'comparison', 'recipe', 'cocktail',
      'gift set', 'merchandise', 'glassware', 'accessories'
    ];

    return !nonProductTerms.some(term => name.toLowerCase().includes(term));
  }

  /**
   * Clean and normalize product name
   */
  private cleanProductName(name: string, distillery: Distillery): string {
    let cleaned = name
      .replace(/^\s*buy\s+/i, '')
      .replace(/\s+online$/i, '')
      .replace(/\s*\|.*$/, '')
      .replace(/\s*-\s*\d+ml$/i, '')
      .replace(/\s*\$\d+(?:\.\d{2})?/, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Don't duplicate distillery name if already present
    if (!cleaned.toLowerCase().startsWith(distillery.name.toLowerCase())) {
      // Check if it starts with a known product line
      const startsWithProductLine = distillery.product_lines?.some(pl => 
        cleaned.toLowerCase().startsWith(pl.name.toLowerCase())
      );
      
      if (!startsWithProductLine) {
        cleaned = `${distillery.name} ${cleaned}`;
      }
    }

    return cleaned;
  }

  /**
   * Normalize product name for deduplication
   */
  private normalizeProductName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/proof$/, '')
      .replace(/years?old$/, '')
      .replace(/yo$/, '');
  }

  /**
   * Extract brand from product name
   */
  private extractBrandFromName(name: string, distillery: Distillery): string {
    // Check if it's a known product line
    if (distillery.product_lines) {
      for (const line of distillery.product_lines) {
        if (name.includes(line.name)) {
          return line.name;
        }
      }
    }

    // Otherwise use distillery name
    return distillery.name;
  }

  /**
   * Infer spirit type from product and distillery
   */
  private inferTypeFromProduct(product: ExtractedProduct, distillery: Distillery): string {
    // First try to detect from product name
    const detected = detectSpiritType(product.name, product.brand);
    if (detected && detected !== 'Other') {
      return detected;
    }

    // Then check distillery default types
    if (distillery.type && distillery.type.length > 0) {
      return distillery.type[0];
    }

    return 'whiskey';
  }

  /**
   * Calculate quality score for discovered product
   */
  private calculateQualityScore(product: any): number {
    let score = 50; // Base score
    
    if (product.name) score += 10;
    if (product.price) score += 10;
    if (product.description && product.description.length > 50) score += 10;
    if (product.image_url || product.image) score += 10;
    if (product.volume) score += 5;
    if (product.type && product.type !== 'Other') score += 5;
    if (product.abv) score += 5;
    if (product.brand) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Check if product exists
   */
  private async checkProductExists(productName: string, distilleryName: string): Promise<boolean> {
    try {
      const normalized = this.normalizeProductName(productName);
      const existing = await this.storage.searchSpirits({
        query: productName,
        filters: { distillery: distilleryName }
      });
      
      return existing.some(spirit => 
        this.normalizeProductName(spirit.name) === normalized
      );
    } catch (error) {
      logger.debug(`Error checking product existence: ${error}`);
      return false;
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
export const catalogFocusedScraper = new CatalogFocusedScraper();