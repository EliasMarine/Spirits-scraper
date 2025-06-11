import { GoogleSearchClient } from './google-search';
import { SupabaseStorage } from './supabase-storage';
import { TextProcessor } from './text-processor';
import { detectSpiritType } from '../config/spirit-types';
import { logger } from '../utils/logger';
import { apiCallTracker } from './api-call-tracker';
import { createMultipleKeys } from './normalization-keys';
// Enhanced price extraction will be integrated after compilation
import axios from 'axios';
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
      // Check if we've found enough spirits
      if (this.metrics.spiritsFound >= limit) {
        logger.info(`📊 Found ${this.metrics.spiritsFound} spirits - reached target limit`);
        break;
      }
      
      // Also check API call limit (max 100 per day)
      if (this.metrics.apiCalls >= 100) {
        logger.info('📊 Reached daily API call limit (100)');
        break;
      }

      try {
        logger.info(`\n🔍 Query ${this.metrics.apiCalls + 1}: ${query}`);
        
        const searchResults = await this.googleClient.search({ query });
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
              this.metrics.spiritsFound++;
              queryYield++;
              
              // Add the search result URL as source
              spirit.source_url = spirit.source_url || result.link;
              
              const stored = await this.storeSpirit(spirit);
              if (stored) {
                this.metrics.spiritsStored++;
                logger.info(`✅ Stored: ${spirit.name} (${spirit.price ? '$' + spirit.price : 'no price'})`);
              } else {
                logger.warn(`❌ Failed to store: ${spirit.name}`);
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

    this.logFinalMetrics();
    
    return this.metrics;
  }

  /**
   * Generate queries specifically designed for maximum yield
   */
  private generateUltraEfficientQueries(category: string): string[] {
    const queries: string[] = [];
    
    // Map categories to popular distilleries/brands for better results
    const categoryDistilleries: Record<string, string[]> = {
      'bourbon': ['Buffalo Trace', 'Wild Turkey', 'Four Roses', 'Heaven Hill', 'Jim Beam', 'Maker\'s Mark'],
      'whiskey': ['Jack Daniel\'s', 'Jameson', 'Crown Royal', 'Bushmills', 'Redbreast'],
      'scotch': ['Glenfiddich', 'Macallan', 'Glenlivet', 'Ardbeg', 'Highland Park'],
      'rye': ['WhistlePig', 'Bulleit Rye', 'High West', 'Sazerac', 'Rittenhouse'],
      'tequila': ['Patron', 'Don Julio', 'Casamigos', 'Espolon', 'Herradura'],
      'rum': ['Bacardi', 'Captain Morgan', 'Mount Gay', 'Plantation', 'Appleton'],
      'gin': ['Tanqueray', 'Bombay', 'Hendrick\'s', 'Beefeater', 'Aviation'],
      'vodka': ['Grey Goose', 'Absolut', 'Belvedere', 'Ketel One', 'Tito\'s']
    };
    
    const distilleries = categoryDistilleries[category.toLowerCase()] || [category];
    const spiritType = category.toLowerCase();
    
    // Simplified exclusions - only critical ones
    const simpleExclusions = '-reddit -facebook -twitter -youtube';

    // 1. High-yield site-specific searches (proven to work)
    for (const distillery of distilleries.slice(0, 3)) {
      queries.push(
        `site:totalwine.com "${distillery}" ${spiritType}`,
        `site:klwines.com "${distillery}" products`,
        `site:thewhiskyexchange.com intitle:"${distillery}"`,
        `site:wine.com "${distillery}" spirits`
      );
    }

    // 2. Multi-site searches with better patterns
    queries.push(
      `(site:totalwine.com OR site:klwines.com) ${spiritType} -gift -cigar ${simpleExclusions}`,
      `(site:thewhiskyexchange.com OR site:masterofmalt.com) "${distilleries[0]}" "${distilleries[1]}"`,
      `(site:wine-searcher.com OR site:flaviar.com) ${category} buy price`
    );

    // 3. Catalog page searches
    queries.push(
      `"${category} whiskey" buy online price ${simpleExclusions}`,
      `"products" "in stock" ${category} bottle ${simpleExclusions}`,
      `shop ${category} "ml" "proof" ${simpleExclusions}`
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
    }
    
    return queries.slice(0, 15); // Focus on quality over quantity
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
            type: category,
            price: structuredPrice,
            brand: product.brand?.name || product.brand || this.extractBrandFromName(product.name),
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
      
      if (productName && this.isValidProductName(productName, category)) {
        // Check if we already have this from structured data
        const exists = spirits.some(s => s.name.toLowerCase() === productName.toLowerCase());
        if (!exists) {
          spirits.push({
            name: this.cleanProductName(productName),
            type: category,
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
        /(?:price|msrp|our\s+price|sale|now):\s*\$?([\d,]+\.?\d*)/i,
        /\d+ml\s*[.-]*\s*\$?([\d,]+\.?\d*)/i,
        /\$\s*([\d,]+\.?\d{0,2})(?:\s|$|[^\d])/
      ];
      
      for (const pattern of pricePatterns) {
        const match = snippet.match(pattern);
        if (match) {
          const price = this.extractPrice(match[1]);
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
    
    // 8. Extract description from metatags or snippet
    if (spirits.length > 0 && !spirits[0].description) {
      const metaDescription = pagemap?.metatags?.[0]?.['og:description'] || 
                             pagemap?.metatags?.[0]?.['description'];
      if (metaDescription && metaDescription.length > 20 && !metaDescription.includes('JavaScript')) {
        spirits[0].description = metaDescription;
      } else if (snippet && snippet.length > 50) {
        // Clean up snippet to use as description
        const cleanedSnippet = snippet
          .replace(/\.\.\./g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleanedSnippet.length > 30 && !cleanedSnippet.includes('Buy now')) {
          spirits[0].description = cleanedSnippet;
        }
      }
    }

    return spirits;
  }

  /**
   * Check if a product name is valid
   */
  private isValidProductName(name: string, category: string): boolean {
    if (!name || name.length < 5 || name.length > 150) return false;
    
    const lowerName = name.toLowerCase();
    
    // Skip generic/non-product titles
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
    
    // Must contain spirit-related words
    const spiritWords = ['whiskey', 'whisky', 'bourbon', 'rum', 'vodka', 'gin', 'tequila', 'scotch', 'rye', 'brandy', 'cognac'];
    return spiritWords.some(word => lowerName.includes(word));
  }
  
  /**
   * Clean product name
   */
  private cleanProductName(name: string): string {
    // Remove common suffixes and site names
    let cleaned = name
      .replace(/\s*[-|]\s*(Buy|Shop|Store|Online|Price).*$/i, '')
      .replace(/\s*[-|]\s*(Total Wine|Wine\.com|K&L|Whisky Exchange|Master of Malt).*$/i, '')
      .replace(/\s*\(\d+\)\s*$/, '') // Remove SKU numbers
      .replace(/\s*[-–—]\s*$/, '') // Remove trailing dashes
      .replace(/\s+Spirits\s*$/i, '') // Remove "Spirits" suffix
      .trim();
    
    return TextProcessor.fixTextSpacing(cleaned);
  }
  
  /**
   * Extract product from title
   */
  private extractFromTitle(title: string, category: string, link: string): any | null {
    if (!this.isValidProductName(title, category)) {
      return null;
    }

    // Clean the title
    const cleaned = this.cleanProductName(title);
    
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
      brand: brand || this.extractBrandFromName(productName),
      type: category,
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
      /([A-Za-z\s&'.-]+(?:Whiskey|Bourbon|Rum|Vodka|Gin|Tequila|Scotch|Rye)[A-Za-z\s&'.-]*?)\s*[-–...]\s*\$(\d+\.?\d*)/gi,
      /([A-Za-z\s&'.-]+?)\s+(?:Whiskey|Bourbon|Rum|Vodka|Gin|Tequila|Scotch|Rye)\s*[-–...]\s*\$(\d+\.?\d*)/gi
    ];
    
    for (const pattern of pricePatterns) {
      const matches = Array.from(snippet.matchAll(pattern));
      for (const match of matches) {
        const name = match[1].trim();
        if (this.isValidProductName(name, category)) {
          const cleanName = this.cleanProductName(name);
          // Avoid duplicates
          if (!products.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
            products.push({
              name: cleanName,
              brand: this.extractBrandFromName(cleanName),
              type: category,
              price: this.extractPrice(match[2]),
              source_url: link,
              data_source: 'snippet_extraction'
            });
          }
        }
      }
    }
    
    // Pattern 2: Look for product listings without prices
    const listingPattern = /(?:^|\n|;|•|·|\|)\s*([A-Z][A-Za-z\s&'.-]+(?:Whiskey|Bourbon|Rum|Vodka|Gin|Tequila|Scotch|Rye)[A-Za-z\s&'.-]*?)(?:\s*[-–]|$|\n|;)/gi;
    const listingMatches = Array.from(snippet.matchAll(listingPattern));
    
    for (const match of listingMatches) {
      const name = match[1].trim();
      if (this.isValidProductName(name, category) && name.length < 80) {
        const cleanName = this.cleanProductName(name);
        if (!products.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
          products.push({
            name: cleanName,
            brand: this.extractBrandFromName(cleanName),
            type: category,
            source_url: link,
            data_source: 'snippet_listing'
          });
        }
      }
    }

    return products.slice(0, 5); // Limit to avoid noise
  }

  /**
   * Store spirit in database
   */
  private async storeSpirit(spirit: any): Promise<boolean> {
    try {
      // Detect proper type
      const typeDetection = detectSpiritType(spirit.name, spirit.brand || '', spirit.description);
      const detectedType = typeDetection?.type || spirit.type;
      
      // Skip if the detected type doesn't match the category we're searching for
      // Allow some flexibility (e.g., "Whiskey" matches "Bourbon")
      const categoryMap: Record<string, string[]> = {
        'bourbon': ['Bourbon', 'Whiskey', 'Tennessee Whiskey', 'Bottled-in-Bond', 'Kentucky Straight Bourbon'],
        'whiskey': ['Whiskey', 'Bourbon', 'Rye Whiskey', 'Tennessee Whiskey', 'Irish Whiskey', 'Canadian Whisky'],
        'scotch': ['Scotch', 'Single Malt Scotch', 'Blended Scotch', 'Highland', 'Islay', 'Speyside'],
        'tequila': ['Tequila', 'Blanco', 'Reposado', 'Añejo', 'Extra Añejo'],
        'rum': ['Rum', 'White Rum', 'Gold Rum', 'Dark Rum', 'Spiced Rum'],
        'vodka': ['Vodka'],
        'gin': ['Gin', 'London Dry Gin', 'Navy Strength Gin']
      };
      
      const allowedTypes = categoryMap[spirit.type.toLowerCase()] || [spirit.type];
      if (!allowedTypes.some(allowed => detectedType?.includes(allowed))) {
        logger.debug(`⏭️ Skipping ${spirit.name} - type mismatch: ${detectedType} not in [${allowedTypes.join(', ')}]`);
        return false;
      }
      
      const spiritData = {
        name: spirit.name,
        brand: spirit.brand || this.extractBrandFromName(spirit.name),
        type: detectedType,
        category: this.mapTypeToCategory(detectedType),
        price: spirit.price,
        abv: spirit.abv || this.extractABV(spirit.description || spirit.snippet, detectedType),
        proof: spirit.proof,
        volume: spirit.volume || '750ml',
        image_url: spirit.image_url,
        description: spirit.description,
        source_url: spirit.source_url,
        data_source: spirit.data_source,
        data_quality_score: this.calculateQualityScore(spirit),
        // Add metadata if we have extra info
        metadata: spirit.abv || spirit.proof || spirit.age ? {
          abv: spirit.abv,
          proof: spirit.proof,
          age: spirit.age
        } : undefined
      };

      const result = await this.storage.storeSpirit(spiritData);
      
      if (result.success) {
        logger.debug(`✅ Stored: ${spirit.name}`);
        return true;
      } else {
        logger.warn(`❌ Failed to store: ${spirit.name} - Error: ${result.error || 'Unknown error'}`);
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
    console.log(`📈 Efficiency: ${this.metrics.efficiency.toFixed(1)} spirits/call`);
    console.log(`📑 Catalog Pages Found: ${this.metrics.catalogPagesFound}`);
    
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