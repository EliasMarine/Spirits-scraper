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
import { TextProcessor } from './text-processor.js';

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
          
          // Debug: Log the extracted products with data
          if (productsFromResults.length > 0) {
            productsFromResults.forEach(p => {
              logger.debug(`Product: ${p.name} | Price: ${p.price || 'N/A'} | ABV: ${p.abv || 'N/A'}`);
            });
          }

          // PHASE 4: Process discovered products
          for (const product of productsFromResults) {
            if (processedProducts.size >= maxProducts) break;

            const productKey = `${product.name}-${distillery.name}`.toLowerCase();
            if (discoveredProducts.has(productKey)) continue;
            
            discoveredProducts.add(productKey);
            result.productsFound++;

            // Skip if exists
            if (skipExisting && await this.checkProductExists(product.name, distillery.name)) {
              logger.info(`⏭️ Skipping existing product: ${product.name}`);
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
            const inferredType = this.inferTypeFromProduct(product, distillery);
            
            // Ensure type is always a string, not an array
            let finalType = inferredType; // Default to inferred type
            
            if (fullProductData?.type) {
              finalType = Array.isArray(fullProductData.type) ? fullProductData.type[0] : fullProductData.type;
            } else if (product.type) {
              finalType = Array.isArray(product.type) ? product.type[0] : product.type;
            }
            
            // Extract ABV from description if not already found
            let finalABV = fullProductData?.abv || product.abv;
            if (!finalABV && (product.description || fullProductData?.description)) {
              const desc = product.description || fullProductData?.description || '';
              
              // Try multiple ABV patterns
              const abvPatterns = [
                /(\d+(?:\.\d+)?)\s*%\s*(?:ABV|ALC|alcohol)?/i,  // "40%", "40% ABV"
                /(?:ABV|alcohol)[:\s]+(\d+(?:\.\d+)?)\s*%/i,    // "ABV: 40%"
                /(\d+(?:\.\d+)?)\s*proof/i,                      // "80 proof"
                /proof[:\s]+(\d+)/i,                             // "proof: 80"
                /\b(\d+)\s*pf\b/i                                // "80pf"
              ];
              
              for (const pattern of abvPatterns) {
                const match = desc.match(pattern);
                if (match) {
                  const value = parseFloat(match[1]);
                  // Check if it's proof (typically 70-200) or ABV (typically 20-75)
                  if (pattern.toString().includes('proof') || pattern.toString().includes('pf')) {
                    if (value >= 70 && value <= 200) {
                      finalABV = value / 2; // Convert proof to ABV
                      break;
                    }
                  } else {
                    // It's already ABV
                    if (value >= 20 && value <= 75) {
                      finalABV = value;
                      break;
                    } else if (value >= 70 && value <= 200) {
                      // Might be proof even without "proof" keyword
                      finalABV = value / 2;
                      break;
                    }
                  }
                }
              }
            }
            
            // Convert string ABV to number
            const abvNumber = typeof finalABV === 'string' ? parseFloat(finalABV) : finalABV;
            
            // Extract price properly
            let finalPrice = fullProductData?.price || product.price;
            
            // If no price found, try to extract from description
            if (!finalPrice && (product.description || fullProductData?.description)) {
              const desc = product.description || fullProductData?.description || '';
              const pricePatterns = [
                /\$(\d+(?:\.\d{2})?)/,                          // "$29.99"
                /(\d+(?:\.\d{2})?)\s*(?:USD|dollars)/i,         // "29.99 USD"
                /price[:\s]+\$?(\d+(?:\.\d{2})?)/i,             // "price: $29.99"
                /MSRP[:\s]+\$?(\d+(?:\.\d{2})?)/i,              // "MSRP: $29.99"
              ];
              
              for (const pattern of pricePatterns) {
                const match = desc.match(pattern);
                if (match) {
                  const value = parseFloat(match[1]);
                  if (value >= 5 && value <= 50000) { // Reasonable price range
                    finalPrice = value;
                    break;
                  }
                }
              }
            }
            
            // Convert string price to number
            if (typeof finalPrice === 'string') {
              if (finalPrice.startsWith('$')) {
                finalPrice = parseFloat(finalPrice.replace('$', ''));
              } else {
                finalPrice = parseFloat(finalPrice);
              }
              
              // Validate price range
              if (isNaN(finalPrice) || finalPrice < 5 || finalPrice > 50000) {
                finalPrice = undefined;
              }
            }
            
            // Extract age statement if present
            const ageStatement = TextProcessor.extractValidAge(
              fullProductData?.name || product.name || ''
            ) || TextProcessor.extractValidAge(
              fullProductData?.description || product.description || ''
            );
            
            // Validate description
            const description = fullProductData?.description || product.description;
            const validDescription = description && TextProcessor.isValidProductDescription(description)
              ? description
              : undefined;
            
            const spiritData = {
              name: fullProductData?.name || product.name,
              brand: TextProcessor.normalizeBrandName(
                fullProductData?.brand || product.brand || this.extractBrandFromName(product.name, distillery)
              ),
              distillery: distillery.name,
              type: TextProcessor.normalizeCategory(product.name, finalType),
              region: fullProductData?.region || distillery.region,
              country: fullProductData?.origin_country || distillery.country,
              price: typeof finalPrice === 'number' ? finalPrice : undefined,
              abv: abvNumber,
              age_statement: ageStatement,
              volume: fullProductData?.volume || product.volume || '750ml',
              image_url: fullProductData?.image_url || product.image,
              source_url: product.url,
              description: validDescription,
              data_source: 'catalog_scraper',
              data_quality_score: this.calculateQualityScore({
                ...product,
                ...fullProductData,
                abv: abvNumber,
                price: finalPrice
              })
            };
            

            // Debug log the data before storing
            if (spiritData.abv || spiritData.price) {
              logger.info(`📊 Storing spirit with data:`);
              logger.info(`  Name: ${spiritData.name}`);
              logger.info(`  ABV: ${spiritData.abv} (type: ${typeof spiritData.abv})`);
              logger.info(`  Price: ${spiritData.price} (type: ${typeof spiritData.price})`);
            }
            
            // Store the product
            const stored = await this.storage.storeSpirit(spiritData);
            if (stored.success) {
              result.productsStored++;
              processedProducts.add(productKey);
              logger.info(`✅ Stored: ${spiritData.name} (${spiritData.type})`);
            } else {
              logger.error(`❌ Failed to store: ${spiritData.name} - ${stored.error}`);
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
            // Try to extract ABV from snippet if not in structured data
            if (!product.abv && result.snippet) {
              const abvMatch = result.snippet.match(/(\d+(?:\.\d+)?)\s*%|(\d+)\s*proof/i);
              if (abvMatch) {
                const value = parseFloat(abvMatch[1] || abvMatch[2]);
                if (abvMatch[0].toLowerCase().includes('proof')) {
                  product.abv = value >= 70 && value <= 200 ? (value / 2).toString() : undefined;
                } else {
                  product.abv = value >= 20 && value <= 75 ? value.toString() : undefined;
                }
              }
            }
            // Store the snippet as description if available
            if (!product.description && result.snippet) {
              product.description = result.snippet;
            }
            products.push(product);
          }
        }

        // Check if it's a catalog page
        if (this.isCatalogPage(result)) {
          const catalogProducts = this.extractFromCatalogSnippet(result.snippet, distillery);
          for (const product of catalogProducts) {
            product.url = result.link;
            // Store snippet as description
            if (!product.description && result.snippet) {
              product.description = result.snippet;
            }
            products.push(product);
          }
        } else {
          // Try to extract individual products from title/snippet
          const titleProduct = this.extractProductFromTitle(result.title, distillery);
          if (titleProduct) {
            titleProduct.url = result.link;
            // Try to extract ABV from snippet if not in title
            if (!titleProduct.abv && result.snippet) {
              const abvMatch = result.snippet.match(/(\d+(?:\.\d+)?)\s*%|(\d+)\s*proof/i);
              if (abvMatch) {
                const value = parseFloat(abvMatch[1] || abvMatch[2]);
                if (abvMatch[0].toLowerCase().includes('proof')) {
                  titleProduct.abv = value >= 70 && value <= 200 ? (value / 2).toString() : undefined;
                } else {
                  titleProduct.abv = value >= 20 && value <= 75 ? value.toString() : undefined;
                }
              }
            }
            // Store snippet as description
            if (!titleProduct.description && result.snippet) {
              titleProduct.description = result.snippet;
            }
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
      'history of', 'story of', 'how to', 'cocktail recipe',
      'gift set', 'gift pack', 'merchandise', 'accessories',
      'chocolate', 'candy', 'cigar', 'tobacco', 'robusto',
      'event/', '/event', 'tasting/', '/tasting',
      'master-distiller-for', 'master distiller for'
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

    // Extract product details from title with improved patterns
    const priceMatch = cleanTitle.match(/\$(\d+(?:\.\d{2})?)/);
    
    // Improved ABV extraction
    let abv: string | undefined;
    const abvPatterns = [
      /(\d+(?:\.\d+)?)\s*%\s*(?:ABV|ALC)/i,
      /(\d+(?:\.\d+)?)\s*%/,
      /(\d+)\s*proof/i,
      /(\d+)\s*pf/i
    ];
    
    for (const pattern of abvPatterns) {
      const match = cleanTitle.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        if (pattern.toString().includes('proof') || pattern.toString().includes('pf')) {
          if (value >= 70 && value <= 200) {
            abv = (value / 2).toString();
            break;
          }
        } else if (value >= 20 && value <= 75) {
          abv = value.toString();
          break;
        }
      }
    }
    
    // Improved volume extraction
    const volumeMatch = cleanTitle.match(/(\d+(?:\.\d+)?)\s*(ml|mL|ML|liter|litre|L|cl)/i);
    let volume: string | undefined;
    if (volumeMatch) {
      let value = parseFloat(volumeMatch[1]);
      const unit = volumeMatch[2].toLowerCase();
      
      if (unit === 'l' || unit === 'liter' || unit === 'litre') {
        value = value * 1000;
      } else if (unit === 'cl') {
        value = value * 10;
      }
      
      if (value >= 50 && value <= 3000) {
        volume = `${Math.round(value)}ml`;
      }
    }

    // Clean the product name of price/ABV/volume info before returning
    let productName = cleanTitle
      .replace(/\s*\$\d+(?:\.\d{2})?/, '') // Remove price
      .replace(/\s*\d+(?:\.\d+)?\s*%/, '') // Remove ABV
      .replace(/\s*\d+\s*proof/i, '') // Remove proof
      .replace(/\s*\d+(?:\.\d+)?\s*(?:ml|mL|ML|liter|litre|L|cl)/i, '') // Remove volume
      .trim();

    return {
      name: this.cleanProductName(productName, distillery),
      price: priceMatch ? `$${priceMatch[1]}` : undefined,
      abv: abv,
      volume: volume || '750ml', // Default to 750ml if not found
      url: ''
    };
  }

  /**
   * Extract products from snippet text
   */
  private extractProductsFromSnippet(snippet: string, distillery: Distillery): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];
    if (!snippet) return products;

    // Extract ABV patterns
    const extractABV = (text: string): string | undefined => {
      // Match patterns like "40%", "80 proof", "40% ABV", "80pf"
      const abvPatterns = [
        /(\d+(?:\.\d+)?)\s*%\s*(?:ABV|ALC|alcohol)/i,
        /(\d+(?:\.\d+)?)\s*%/,
        /(\d+)\s*proof/i,
        /(\d+)\s*pf/i,
        /ABV[:\s]+(\d+(?:\.\d+)?)\s*%/i,
        /alcohol[:\s]+(\d+(?:\.\d+)?)\s*%/i
      ];
      
      for (const pattern of abvPatterns) {
        const match = text.match(pattern);
        if (match) {
          const value = parseFloat(match[1]);
          // If it's proof, convert to ABV
          if (pattern.toString().includes('proof') || pattern.toString().includes('pf')) {
            if (value >= 70 && value <= 200) { // Valid proof range
              return (value / 2).toString();
            }
          } else if (value >= 20 && value <= 75) { // Valid ABV range
            return value.toString();
          }
        }
      }
      return undefined;
    };

    // Extract price patterns
    const extractPrice = (text: string): string | undefined => {
      const pricePatterns = [
        /\$(\d+(?:\.\d{2})?)/,
        /USD\s*(\d+(?:\.\d{2})?)/i,
        /(\d+(?:\.\d{2})?)\s*(?:dollars|USD)/i
      ];
      
      for (const pattern of pricePatterns) {
        const match = text.match(pattern);
        if (match) {
          const value = parseFloat(match[1]);
          if (value >= 5 && value <= 50000) { // Reasonable price range
            return `$${match[1]}`;
          }
        }
      }
      return undefined;
    };

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
        const extractedProduct: ExtractedProduct = {
          name: this.cleanProductName(productName, distillery),
          price: `$${match[2]}`,
          url: ''
        };
        
        // Try to extract ABV from the surrounding context
        const contextStart = Math.max(0, snippet.lastIndexOf(productName) - 50);
        const contextEnd = Math.min(snippet.length, snippet.indexOf(productName) + productName.length + 100);
        const context = snippet.substring(contextStart, contextEnd);
        
        const abv = extractABV(context);
        if (abv) extractedProduct.abv = abv;
        
        products.push(extractedProduct);
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

    // Helper function to reconstruct JSON strings that have been character-split
    const reconstructJsonString = (obj: any): any => {
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        // Check if this looks like a character-split string (has numeric keys)
        const keys = Object.keys(obj);
        if (keys.every(k => /^\d+$/.test(k))) {
          // Reconstruct the string
          const chars: string[] = [];
          for (let i = 0; keys.includes(String(i)); i++) {
            chars.push(obj[String(i)]);
          }
          const reconstructed = chars.join('');
          try {
            // Try to parse as JSON
            return JSON.parse(reconstructed);
          } catch {
            // If not JSON, return the string
            return reconstructed;
          }
        }
      }
      return obj;
    };

    // Check for product structured data
    if (pagemap.product) {
      const productData = Array.isArray(pagemap.product) ? pagemap.product : [pagemap.product];
      for (const rawProduct of productData) {
        const product = reconstructJsonString(rawProduct);
        const actualProducts = Array.isArray(product) ? product : [product];
        
        for (const p of actualProducts) {
          if (p.name && this.isValidProductName(p.name, distillery)) {
            products.push({
              name: this.cleanProductName(p.name, distillery),
              price: p.offers?.price || p.price,
              brand: p.brand || this.extractBrandFromName(p.name, distillery),
              description: p.description,
              image: p.image,
              url: ''
            });
          }
        }
      }
    }

    // Check for offer/aggregate rating which often indicates products
    if (pagemap.offer) {
      const offerData = Array.isArray(pagemap.offer) ? pagemap.offer : [pagemap.offer];
      for (const rawOffer of offerData) {
        const offer = reconstructJsonString(rawOffer);
        const actualOffers = Array.isArray(offer) ? offer : [offer];
        
        for (const o of actualOffers) {
          if (o.price) {
            // Try to find the associated product name
            let productName = o.name;
            
            // If no name in offer, check if there's a product with matching price
            if (!productName && pagemap.product) {
              const productData = reconstructJsonString(pagemap.product);
              const products = Array.isArray(productData) ? productData : [productData];
              productName = products[0]?.name;
            }
            
            if (productName && this.isValidProductName(productName, distillery)) {
              const existingProduct = products.find(p => p.name === this.cleanProductName(productName, distillery));
              if (existingProduct) {
                // Update existing product with price
                existingProduct.price = `$${o.price}`;
              } else {
                products.push({
                  name: this.cleanProductName(productName, distillery),
                  price: `$${o.price}`,
                  brand: this.extractBrandFromName(productName, distillery),
                  url: ''
                });
              }
            }
          }
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

    // Helper functions for data extraction
    const extractABV = (text: string): string | undefined => {
      const abvPatterns = [
        /(\d+(?:\.\d+)?)\s*%\s*(?:ABV|ALC|alcohol)/i,
        /(\d+(?:\.\d+)?)\s*%/,
        /(\d+)\s*proof/i,
        /(\d+)\s*pf/i,
        /ABV[:\s]+(\d+(?:\.\d+)?)\s*%/i,
        /alcohol[:\s]+(\d+(?:\.\d+)?)\s*%/i
      ];
      
      for (const pattern of abvPatterns) {
        const match = text.match(pattern);
        if (match) {
          const value = parseFloat(match[1]);
          if (pattern.toString().includes('proof') || pattern.toString().includes('pf')) {
            if (value >= 70 && value <= 200) {
              return (value / 2).toString();
            }
          } else if (value >= 20 && value <= 75) {
            return value.toString();
          }
        }
      }
      return undefined;
    };

    const extractVolume = (text: string): string | undefined => {
      const volumePatterns = [
        /(\d+(?:\.\d+)?)\s*(ml|mL|ML)/,
        /(\d+(?:\.\d+)?)\s*(L|liter|litre)/i,
        /(\d+(?:\.\d+)?)\s*cl/i
      ];
      
      for (const pattern of volumePatterns) {
        const match = text.match(pattern);
        if (match) {
          let value = parseFloat(match[1]);
          const unit = match[2].toLowerCase();
          
          // Convert to ml
          if (unit === 'l' || unit === 'liter' || unit === 'litre') {
            value = value * 1000;
          } else if (unit === 'cl') {
            value = value * 10;
          }
          
          // Validate reasonable volume
          if (value >= 50 && value <= 3000) {
            return `${Math.round(value)}ml`;
          }
        }
      }
      return undefined;
    };

    // Pattern 1: "Product Name $XX.XX" or "Product Name - $XX"
    const pricePattern = /([^$\n]+?)\s*[$](\d+(?:\.\d{2})?)/g;
    const matches = Array.from(snippet.matchAll(pricePattern));
    
    for (const match of matches) {
      const name = match[1].trim();
      if (this.isValidProductName(name, distillery)) {
        const product: ExtractedProduct = {
          name: this.cleanProductName(name, distillery),
          price: `$${match[2]}`,
          url: ''
        };
        
        // Extract additional data from context
        const contextStart = Math.max(0, snippet.lastIndexOf(name) - 100);
        const contextEnd = Math.min(snippet.length, snippet.indexOf(name) + name.length + 200);
        const context = snippet.substring(contextStart, contextEnd);
        
        const abv = extractABV(context);
        if (abv) product.abv = abv;
        
        const volume = extractVolume(context);
        if (volume) product.volume = volume;
        
        products.push(product);
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

    // Strict non-product filtering
    const nonProductTerms = [
      // Reviews and articles
      'review', 'article', 'blog', 'news', 'story', 'guide', 'tour',
      'vs', 'versus', 'comparison', 'recipe', 'cocktail',
      // Non-spirit products
      'gift set', 'merchandise', 'glassware', 'accessories',
      'chocolate', 'candy', 'cigar', 'robusto', 'cigarette', 'tobacco',
      'clothing', 'hat', 'shirt', 'glass', 'mug', 'cup', 'tumbler',
      'decanter', 'rocks glass', 'shot glass',
      // Store/shopping terms
      'shop buffalo trace', 'buffalo trace shop', 'at the best prices',
      'buy from', 'world\'s best', 'drinks shop', 'store', 'outlet',
      // Events and experiences
      'event', 'tasting', 'master distiller for', 'distillery tour',
      'experience', 'masterclass', 'seminar', 'workshop',
      // Generic pages
      'spirits', 'brand/', '/brand', 'category/', '/category',
      'collection/', '/collection'
    ];

    const lowerName = name.toLowerCase();
    
    // Check for non-product terms
    if (nonProductTerms.some(term => lowerName.includes(term))) {
      return false;
    }
    
    // Additional validation: must contain actual spirit indicators
    const spiritIndicators = [
      'whiskey', 'whisky', 'bourbon', 'rye', 'scotch', 'vodka', 
      'gin', 'rum', 'tequila', 'mezcal', 'brandy', 'cognac',
      'liqueur', 'cream', 'white dog', 'mash', 'proof', 'aged',
      'straight', 'single barrel', 'small batch', 'reserve'
    ];
    
    // Special case: if name is too generic (just distillery + "spirits"), reject
    if (lowerName === `${distillery.name.toLowerCase()} spirits` ||
        lowerName === `${distillery.name.toLowerCase()}-spirits` ||
        lowerName === `${distillery.name.toLowerCase()} - spirits`) {
      return false;
    }
    
    return true;
  }

  /**
   * Clean and normalize product name
   */
  private cleanProductName(name: string, distillery: Distillery): string {
    // First fix any spacing issues
    let cleaned = TextProcessor.fixTextSpacing(name);
    
    // Then apply our cleaning rules
    cleaned = cleaned
      .replace(/^\s*buy\s+/i, '')
      .replace(/\s+online$/i, '')
      .replace(/\s*\|.*$/, '')
      .replace(/\s*-\s*\d+ml$/i, '')
      .replace(/\s*\$\d+(?:\.\d{2})?/, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Remove common retailer suffixes
    const retailerSuffixes = [
      /\s*:\s*The Whisky Exchange$/i,
      /\s*:\s*Master of Malt$/i,
      /\s*:\s*Total Wine$/i,
      /\s*:\s*K&L Wines$/i,
      /\s*-\s*Buy from.*$/i,
      /\s*\|\s*.*(?:Wine|Liquor|Spirits).*$/i,
      /\s*-\s*SKU.*$/i,
      /\s*\(.*ml\)$/i,  // Remove volume in parentheses
      /\s*\.\.\.\s*$/,   // Remove trailing ellipsis
      /\s*Whiskey$/i,     // Remove generic "Whiskey" suffix if distillery already contains it
    ];
    
    for (const suffix of retailerSuffixes) {
      cleaned = cleaned.replace(suffix, '');
    }
    
    // Remove any remaining special characters at the end
    cleaned = cleaned.replace(/[:\-–—|]+\s*$/, '').trim();
    
    // Special cleaning for phrases that got extracted incorrectly
    if (cleaned.toLowerCase().includes('is a really classy')) {
      cleaned = cleaned.replace(/\s+is a really classy.*$/i, '');
    }
    if (cleaned.toLowerCase().includes('has partnered with')) {
      cleaned = cleaned.replace(/\s+has partnered with.*$/i, '');
    }
    if (cleaned.toLowerCase().includes('that is handcrafted')) {
      cleaned = cleaned.replace(/\s+that is handcrafted.*$/i, '');
    }
    if (cleaned.toLowerCase().includes('is a sumptuous')) {
      cleaned = cleaned.replace(/\s+is a sumptuous.*$/i, '');
    }
    
    // Fix specific issues
    cleaned = cleaned.replace(/\s+Whiskey\s+Whiskey$/i, ' Whiskey');
    cleaned = cleaned.replace(/\bA\s+premium\s+bourbon.*$/i, '');

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
    // Fix spacing issues first
    const fixed = TextProcessor.fixTextSpacing(name);
    
    return fixed
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
          return TextProcessor.normalizeBrandName(line.name);
        }
      }
    }

    // Otherwise use distillery name with proper formatting
    return TextProcessor.normalizeBrandName(distillery.name);
  }

  /**
   * Infer spirit type from product and distillery
   */
  private inferTypeFromProduct(product: ExtractedProduct, distillery: Distillery): string {
    // First try to detect from product name and description
    const detected = detectSpiritType(
      product.name, 
      product.brand || distillery.name,
      product.description
    );
    
    // If we have a confident detection, use it
    if (detected && detected.type && detected.type !== 'Spirit' && detected.confidence >= 0.7) {
      return detected.type;
    }

    // For lower confidence detections, check if it makes sense for this distillery
    if (detected && detected.type) {
      // Special case: Buffalo Trace makes various products including vodka (Wheatley)
      if (distillery.name === 'Buffalo Trace' && detected.type === 'Vodka') {
        return 'Vodka';
      }
      
      // If detected type is compatible with distillery types, use it
      if (distillery.type && Array.isArray(distillery.type)) {
        // Check if the detected type is in the distillery's known types
        if (distillery.type.some(t => t.toLowerCase() === detected.type.toLowerCase())) {
          return detected.type;
        }
        
        // For generic distillery types like "whiskey", allow more specific detections
        if (distillery.type.includes('whiskey') || distillery.type.includes('whisky')) {
          const whiskeyCategoryTypes = ['Bourbon', 'Rye Whiskey', 'Tennessee Whiskey', 'Scotch', 'Irish Whiskey'];
          if (whiskeyCategoryTypes.includes(detected.type)) {
            return detected.type;
          }
        }
      }
    }

    // Default to distillery's primary type
    if (distillery.type && Array.isArray(distillery.type) && distillery.type.length > 0) {
      return distillery.type[0];
    }

    // Last resort default
    return detected?.type || 'Whiskey';
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