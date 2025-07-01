/**
 * Spirit Extractor Service
 * 
 * V2.8 Changes:
 * - Enhanced category mapping to reduce "Other" classifications
 * - Added more international spirit categories
 * - Improved category detection logic with fallback mechanisms
 */

import { googleSearchClient } from './google-search.js';
import { queryGenerator } from './query-generator.js';
import { contentParser } from './content-parser.js';
import { SpiritData } from '../types/index.js';
import { cacheService } from './cache-service.js';
import { logger } from '../utils/logger.js';
import { TextProcessor } from './text-processor.js';
import { getDistilleryForBrand, inferDistilleryFromName } from '../config/brand-distillery-mapping.js';
import { 
  containsNonProductPatterns, 
  hasRequiredSpiritIndicators,
  hasAlcoholContent,
  isNonProductUrl 
} from '../config/non-product-filters.js';
import { detectSpiritType, getWhiskeyStyle, validateSpiritType } from '../config/spirit-types.js';
import { isExcludedDomain } from '../config/excluded-domains.js';
import EnhancedPriceExtractor from './enhanced-price-extractor.js';

export interface ExtractionOptions {
  maxResults?: number;
  includeRetailers?: boolean;
  includeReviews?: boolean;
  deepParse?: boolean; // Whether to fetch and parse actual URLs
  targetSites?: string[];
}

export class SpiritExtractor {
  /**
   * Extract spirit data from search results
   */
  async extractSpirit(
    name: string,
    brand?: string,
    options: ExtractionOptions = {},
  ): Promise<Partial<SpiritData>> {
    const {
      maxResults = 10,
      includeRetailers = true,
      includeReviews = true,
      deepParse = false,
      targetSites = [],
    } = options;

    // Initialize cache service
    await cacheService.initialize();
    
    // Fix the spirit name first using text processor
    const fixedName = TextProcessor.fixTextSpacing(name);
    const fixedBrand = brand ? TextProcessor.fixTextSpacing(brand) : undefined;
    
    // Check cache with fixed names
    const cachedData = await cacheService.getCachedSpiritData(fixedName, fixedBrand || '');
    if (cachedData) {
      // Quiet cache hit
      // logger.info(`Cache hit for spirit: "${fixedName}" by "${fixedBrand || 'unknown'}"`);
      if (typeof cachedData.scraped_at === 'string') {
        cachedData.scraped_at = new Date(cachedData.scraped_at);
      }
      return cachedData;
    }
    
    // Only log cache misses in debug mode
    // logger.info(`Cache miss for spirit: "${fixedName}" by "${fixedBrand || 'unknown'}" - extracting data`);

    // Generate search queries with fixed names
    const queries = queryGenerator.generateSpiritQueries(fixedName, fixedBrand, {
      includeRetailers,
      includeReviews,
      targetSites,
    });

    // Collect all search results
    const allResults = [];
    for (const query of queries) {
      try {
        const results = await googleSearchClient.search({
          query: queryGenerator.optimizeQuery(query),
          num: Math.min(maxResults, 10),
        });

        if (results.items) {
          // V2.9: Filter out non-product URLs before processing
          const validResults = results.items.filter(item => {
            if (!item.link) return false;
            return this.isValidProductUrl(item.link);
          });
          
          // V2.9.1: ULTRATHINK - Additional e-commerce metadata filtering
          const cleanResults = validResults.filter(item => {
            // Filter out K&L Wine shipping metadata in titles
            if (item.title && /\(Ship As A \d+\.\)|Sku \d+$|Product Detail /i.test(item.title)) {
              return false;
            }
            return true;
          });
          
          logger.debug(`Filtered ${results.items.length - cleanResults.length} invalid URLs and metadata from query results`);
          allResults.push(...cleanResults);
        }
      } catch (error: any) {
        console.error(`Search failed for query "${query}":`, error);
        
        // CRITICAL: Check if it's an API limit error and stop immediately
        if (error.message && error.message.includes('Daily API limit')) {
          logger.error('🛑 API limit reached in spirit extractor - stopping all queries');
          throw error; // Re-throw to stop the entire extraction process
        }
      }
    }

    // Initialize extracted data with fixed names
    const cleanedName = this.cleanProductName(fixedName);
    
    // V2.7.4: Early validation for non-spirit items
    if (TextProcessor.containsStoreReference(cleanedName)) {
      logger.warn(`Rejecting spirit with store reference: "${cleanedName}"`);
      return {}; // Return empty object to indicate invalid extraction
    }
    
    // Check for non-spirit categories
    if (containsNonProductPatterns(cleanedName, 'furniture') ||
        containsNonProductPatterns(cleanedName, 'merchandise')) {
      logger.warn(`Rejecting non-spirit item: "${cleanedName}"`);
      return {}; // Return empty object to indicate invalid extraction
    }
    
    const extractedData: Partial<SpiritData> = {
      name: cleanedName,
      source_url: '',
      scraped_at: new Date(),
    };
    
    if (fixedBrand) {
      extractedData.brand = fixedBrand;
    } else {
      // Try to extract brand from the product name if not provided
      const brandFromName = this.extractBrandFromProductName(fixedName);
      if (brandFromName) {
        extractedData.brand = brandFromName;
      }
    }

    // Parse each result
    const parsedResults = [];
    for (const result of allResults) {
      const parsed = contentParser.parseSearchResult(result);
      parsedResults.push({ ...parsed, url: result.link });
    }

    // Deep parse if requested (fetch actual pages)
    if (deepParse && parsedResults.length > 0) {
      // Parse top 3 results
      const topResults = parsedResults.slice(0, 3);
      for (const result of topResults) {
        if (result.url) {
          const deepParsed = await contentParser.parseUrl(result.url);
          if (deepParsed) {
            parsedResults.push({ ...deepParsed, url: result.url });
          }
        }
      }
    }

    // Aggregate data from all parsed results
    extractedData.description = await this.findBestDescriptionWithFallbacks(parsedResults, fixedName, fixedBrand);
    
    // Extract basic data
    extractedData.abv = this.findConsensusABV(parsedResults);
    extractedData.proof = this.findProof(parsedResults);
    
    // V3.1.3: Enhanced price extraction with retry logic
    extractedData.price = this.findPriceEnhanced(parsedResults, allResults);
    extractedData.price_range = this.findPriceRange(parsedResults);
    extractedData.volume = this.findVolume(parsedResults) || '750ml'; // Default to 750ml
    // Extract age statement from name, description, and all text
    const ageFromName = TextProcessor.extractValidAge(fixedName);
    const ageFromDescription = TextProcessor.extractValidAge(extractedData.description || '');
    const ageFromAllText = TextProcessor.extractValidAge(allResults.map(r => `${r.title} ${r.description}`).join(' '));
    
    // Use age from name first (most reliable), then description, then all text
    extractedData.age_statement = ageFromName || ageFromDescription || ageFromAllText || null;
    
    // Log age extraction for debugging
    if (extractedData.age_statement) {
      console.log(`📅 Extracted age: ${extractedData.age_statement} for "${fixedName}"`);
    }
    
    // Type detection - Use the new comprehensive type detection
    const typeResult = detectSpiritType(fixedName, extractedData.brand, extractedData.description);
    extractedData.type = typeResult.type;
    extractedData.subcategory = typeResult.subType;
    
    // Only log type detection in debug mode
    // console.log(`🏷️ Type detection: name="${fixedName}" brand="${extractedData.brand}" -> type="${extractedData.type}"${typeResult.subType ? ` (${typeResult.subType})` : ''} [confidence: ${typeResult.confidence}]`);
    
    // If low confidence or generic type, try text processor as fallback
    if (typeResult.confidence < 0.5 || extractedData.type === 'Spirit') {
      // Only log fallback attempts in debug mode
      // console.log(`🔄 Low confidence (${typeResult.confidence}) or generic type, trying TextProcessor...`);
      const fallbackType = TextProcessor.normalizeCategory(fixedName + ' ' + (extractedData.description || ''), extractedData.type);
      // Only log TextProcessor results in debug mode
      // console.log(`🔄 TextProcessor returned: "${fallbackType}"`);
      
      // Only use fallback if it's more specific
      if (fallbackType !== 'Other' && fallbackType !== 'Spirit') {
        extractedData.type = fallbackType;
      }
    }
    
    // Extract whiskey style for bourbon/whiskey types
    if (extractedData.type === 'Bourbon' || extractedData.type === 'Whiskey') {
      const whiskeyStyle = getWhiskeyStyle(fixedName, extractedData.description);
      if (whiskeyStyle) {
        extractedData.whiskey_style = whiskeyStyle;
      }
    }
    
    // Map type to category - fix method signature
    extractedData.category = this.detectCategory(extractedData.type);
    
    // Extract distillery from brand
    const distillery = this.extractDistillery(extractedData.brand || '', fixedName);
    if (distillery) {
      extractedData.distillery = distillery;
    }
    
    // Extract country based on type
    const originCountry = this.extractOriginCountry(
      extractedData.type || '', 
      fixedName, 
      extractedData.description || '',
      parsedResults[0]?.url || ''
    );
    
    if (originCountry) {
      extractedData.origin_country = originCountry;
    }
    
    // CRITICAL: If bourbon or rye, MUST have USA as origin
    if ((extractedData.type === 'Bourbon' || extractedData.type === 'Rye Whiskey') && !extractedData.origin_country) {
      extractedData.origin_country = 'United States';
      console.log(`🇺🇸 Auto-setting origin country to United States for ${extractedData.type}`);
    }
    
    // Find best image
    let imageUrl = this.findBestImage(parsedResults);
    if (!imageUrl || imageUrl.length === 0) {
      try {
        const imageUrls = await googleSearchClient.searchImages(fixedName, fixedBrand);
        imageUrl = imageUrls[0];
      } catch (error) {
        console.error('Image search failed:', error);
      }
    }
    extractedData.image_url = imageUrl;
    
    // Validate description match
    if (extractedData.description) {
      extractedData.description_mismatch = !TextProcessor.isValidProductDescription(extractedData.description);
    }
    
    // Set stock status (default to true for now)
    extractedData.in_stock = true;
    
    // Detect if it's a limited edition
    extractedData.limited_edition = this.isLimitedEdition(fixedName, extractedData.description);
    
    // Calculate data quality score
    // Calculate a simple data quality score
    extractedData.data_quality_score = this.calculateSimpleQualityScore(extractedData);
    
    // V2.8: Get the most relevant source URL - with enhanced validation
    if (parsedResults.length > 0) {
      // Find first non-excluded domain with valid product URL
      let validSourceUrl = '';
      for (const result of parsedResults) {
        if (result.url && !isExcludedDomain(result.url) && this.isValidProductUrl(result.url)) {
          validSourceUrl = result.url;
          break;
        }
      }
      extractedData.source_url = validSourceUrl;
      
      // CRITICAL: If all sources are excluded domains, reject this spirit
      if (!validSourceUrl && parsedResults.every(r => r.url && isExcludedDomain(r.url))) {
        logger.warn(`❌ Rejecting spirit with only excluded domain sources: "${fixedName}"`);
        return {
          name: fixedName,
          source_url: '',
          scraped_at: new Date(),
          data_quality_score: 0,
        };
      }
    }
    
    // CRITICAL FIX: Double-check source_url doesn't contain excluded domains
    if (extractedData.source_url && isExcludedDomain(extractedData.source_url)) {
      logger.warn(`⚠️ Removing excluded domain from source_url: ${extractedData.source_url}`);
      extractedData.source_url = '';
    }

    // Extract additional metadata
    const metadata = this.extractMetadata(parsedResults);
    if (metadata.flavor_profile) extractedData.flavor_profile = metadata.flavor_profile;
    if (metadata.awards) extractedData.awards = metadata.awards;
    
    // Override age if found in metadata and we don't have one yet
    if (metadata.age_statement && !extractedData.age_statement) {
      extractedData.age_statement = metadata.age_statement;
    }

    // CRITICAL FIX: Populate scraped_data metadata field
    extractedData.scraped_data = {
      source: "google_search_api",
      version: "1.0",
      scraped_at: new Date().toISOString(),
      extraction_method: "spirit_extractor",
      queries_used: queries.length,
      results_processed: allResults.length,
      parsing_results: parsedResults.length
    };

    // Add structured metadata from search results
    if (parsedResults.length > 0) {
      const firstResult = parsedResults[0];
      if (firstResult.metadata) {
        extractedData.scraped_data.page_metadata = firstResult.metadata;
      }
      
      // Add image source information
      if (extractedData.image_url) {
        extractedData.scraped_data.image_source = extractedData.image_url;
        extractedData.scraped_data.image_extraction_method = "search_results";
      }
    }

    // V2.7.4: Check for incomplete name extraction
    if (TextProcessor.isIncompleteExtraction(extractedData.name || '', extractedData.description)) {
      logger.warn(`⚠️ Possible incomplete extraction detected: "${extractedData.name}"`);
      // Could attempt to extract better name from description here
    }

    // CRITICAL: Validate this is actually an alcoholic beverage, not merchandise
    if (!this.isAlcoholicBeverage(fixedName, extractedData.description || '')) {
      logger.warn(`❌ Rejecting non-spirit product: "${fixedName}" (likely merchandise/clothing)`);
      // Return empty data to prevent storage
      return {
        name: fixedName,
        source_url: '',
        scraped_at: new Date(),
        data_quality_score: 0,
      };
    }

    // Cache the extracted data before returning
    await cacheService.cacheSpiritData(fixedName, fixedBrand || '', extractedData);
    // Quiet cache storage
    // logger.info(`Cached spirit data for: "${fixedName}" by "${fixedBrand || 'unknown'}"`);

    return extractedData;
  }

  /**
   * Find the best description from multiple sources with fallback options
   */
  private async findBestDescriptionWithFallbacks(results: any[], name: string, brand?: string): Promise<string> {
    // First try the standard extraction
    const primaryDescription = this.findBestDescription(results, name, brand);
    if (primaryDescription && primaryDescription.length > 50) {
      return primaryDescription;
    }
    
    // If no good primary description, try fallback sources
    logger.info(`⚠️  Primary description insufficient for ${name}, trying fallback sources...`);
    
    // Fallback 1: Extract from structured data
    const structuredDescription = this.extractFromStructuredData(results);
    if (structuredDescription && structuredDescription.length > 50) {
      logger.info(`✅ Found description in structured data`);
      return structuredDescription;
    }
    
    // Fallback 2: Generate from product attributes
    const generatedDescription = this.generateDescriptionFromAttributes(results, name, brand);
    if (generatedDescription && generatedDescription.length > 50) {
      logger.info(`✅ Generated description from attributes`);
      return generatedDescription;
    }
    
    // Fallback 3: Extract from meta descriptions
    const metaDescription = this.extractFromMetaDescriptions(results, name, brand);
    if (metaDescription && metaDescription.length > 50) {
      logger.info(`✅ Found description in meta tags`);
      return metaDescription;
    }
    
    // Fallback 4: Use cleaned title + key attributes
    const minimalDescription = this.createMinimalDescription(results, name, brand);
    if (minimalDescription) {
      logger.info(`✅ Created minimal description from available data`);
      return minimalDescription;
    }
    
    // Last resort: return primary description even if short
    return primaryDescription;
  }

  /**
   * Find the best description from multiple sources
   */
  private findBestDescription(results: any[], name: string, brand?: string): string {
    // Only log if there are many descriptions (debugging purposes)
    if (results.length > 50) {
      logger.info(`🔍 Evaluating ${results.length} descriptions for quality...`);
    }
    
    const spiritName = name.toLowerCase();
    const spiritBrand = (brand || '').toLowerCase();
    
    const descriptions = results
      .map(r => r.description)
      .filter(d => d && d.length > 50)
      .filter(d => {
        const desc = d.toLowerCase();
        
        // CRITICAL: Check for copy-paste errors from other products
        // If the description mentions a specific product name that's NOT our product, reject it
        const wrongProductPatterns = [
          // Bourbon brands (when we're not looking for them)
          { pattern: /elijah craig/i, brands: ['elijah craig'] },
          { pattern: /evan williams/i, brands: ['evan williams'] },
          { pattern: /buffalo trace/i, brands: ['buffalo trace'] },
          { pattern: /eagle rare/i, brands: ['eagle rare'] },
          { pattern: /blanton'?s/i, brands: ['blanton', 'blantons'] },
          { pattern: /maker'?s mark/i, brands: ['maker', 'makers mark'] },
          { pattern: /jim beam/i, brands: ['jim beam'] },
          { pattern: /wild turkey/i, brands: ['wild turkey'] },
          { pattern: /four roses/i, brands: ['four roses'] },
          { pattern: /knob creek/i, brands: ['knob creek'] },
          { pattern: /woodford reserve/i, brands: ['woodford'] },
          { pattern: /bulleit/i, brands: ['bulleit'] },
          { pattern: /basil hayden/i, brands: ['basil hayden'] },
          { pattern: /henry mckenna/i, brands: ['henry mckenna'] },
          { pattern: /old forester/i, brands: ['old forester'] },
          { pattern: /george t\.? stagg/i, brands: ['stagg', 'george t stagg'] },
          { pattern: /pappy van winkle/i, brands: ['pappy', 'van winkle'] },
          { pattern: /weller/i, brands: ['weller'] },
          { pattern: /michter'?s/i, brands: ['michter'] },
          { pattern: /high west/i, brands: ['high west'] },
          { pattern: /angel'?s envy/i, brands: ['angel', 'angels envy'] },
          { pattern: /uncle nearest/i, brands: ['uncle nearest'] },
          // Scotch brands
          { pattern: /macallan/i, brands: ['macallan'] },
          { pattern: /glenfiddich/i, brands: ['glenfiddich'] },
          { pattern: /glenlivet/i, brands: ['glenlivet'] },
          { pattern: /johnnie walker/i, brands: ['johnnie walker'] },
          { pattern: /ardbeg/i, brands: ['ardbeg'] },
          { pattern: /lagavulin/i, brands: ['lagavulin'] },
          { pattern: /laphroaig/i, brands: ['laphroaig'] },
          // Other spirits
          { pattern: /jack daniel'?s/i, brands: ['jack daniel', 'jack daniels'] },
          { pattern: /jameson/i, brands: ['jameson'] },
          { pattern: /crown royal/i, brands: ['crown royal'] },
          { pattern: /grey goose/i, brands: ['grey goose'] },
          { pattern: /patron/i, brands: ['patron'] },
          { pattern: /hennessy/i, brands: ['hennessy'] },
        ];
        
        // Check each pattern
        for (const { pattern, brands } of wrongProductPatterns) {
          if (pattern.test(desc)) {
            // Check if this is actually the product we're looking for
            const isOurProduct = brands.some(b => 
              spiritName.includes(b) || spiritBrand.includes(b)
            );
            
            if (!isOurProduct) {
              // Silently reject wrong product descriptions
              return false; // This is a copy-paste error from another product
            }
          }
        }
        
        // Check for technical spec copy-paste (MASH BILL format)
        if (/MASH BILL.*PROOF.*AGE.*DISTILLERY/i.test(d)) {
          // Silently reject technical spec formats
          return false;
        }
        
        // CRITICAL: Remove date-prefixed content (review snippets)
        // Pattern: "Nov 5, 2020 . Content..."
        const datePrefix = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\s*\.\s*/i;
        if (datePrefix.test(d)) {
          // Silently reject review snippets
          return false;
        }
        
        // Check for allocation codes (e.g., "A009337, 1792 B.I.B...")
        if (/^[A-Z]\d{6},/i.test(d)) {
          // Silently reject allocation codes
          return false;
        }
        
        // Skip generic non-product descriptions
        const skipPatterns = [
          /\b(buy|shop|order|purchase|free shipping|discount|sale|price)\b/i,
          /\b(login|sign up|register|account|password)\b/i,
          /\b(privacy policy|terms of service|cookie)\b/i,
          /\b(website|navigation|menu|click here)\b/i,
          /\b(product details product description flavor availability)\b/i,
        ];
        
        if (skipPatterns.some(pattern => pattern.test(d))) {
          return false;
        }
        
        // Validate it's a product description
        return TextProcessor.isValidProductDescription(d);
      })
      .sort((a, b) => {
        // Prefer descriptions that mention the product name or brand
        const aScore = this.scoreDescription(a, spiritName, spiritBrand);
        const bScore = this.scoreDescription(b, spiritName, spiritBrand);
        
        if (aScore !== bScore) return bScore - aScore;
        
        // Then sort by length
        return b.length - a.length;
      });

    if (descriptions.length === 0) {
      logger.warn('⚠️  No valid descriptions found after filtering');
      return '';
    }

    // Get the best scored description
    const best = descriptions[0];
    // Log only for debugging when needed
    // logger.info(`✅ Selected best description (${best.length} chars)`);

    // Clean up the description - ENHANCED CLEANING
    let cleaned = best
      .replace(/\s+/g, ' ')
      .replace(/\.\.\./g, '.')
      .replace(/\s*\|\s*/g, '. ') // Replace pipes with periods
      .replace(/([.!?])\1+/g, '$1') // Remove duplicate punctuation
      .trim();
    
    // Final safety check - remove any date prefix that might have slipped through
    cleaned = cleaned.replace(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\s*\.\s*/i, '');
    
    // Remove allocation codes at start
    cleaned = cleaned.replace(/^[A-Z]\d{6},\s*/g, '');
    
    return cleaned.trim();
  }

  /**
   * Score a description based on relevance to the product
   */
  private scoreDescription(description: string, name: string, brand: string): number {
    let score = 0;
    const desc = description.toLowerCase();
    
    // Check if description mentions the product name or brand
    if (name && desc.includes(name.toLowerCase())) score += 10;
    if (brand && desc.includes(brand.toLowerCase())) score += 10;
    
    // Prefer descriptions with tasting notes
    const tastingKeywords = [
      'notes', 'flavor', 'taste', 'aroma', 'nose', 'palate', 'finish',
      'smooth', 'rich', 'complex', 'balanced', 'oak', 'vanilla', 'caramel'
    ];
    
    tastingKeywords.forEach(keyword => {
      if (desc.includes(keyword)) score += 2;
    });
    
    // Prefer descriptions with production details
    const productionKeywords = [
      'aged', 'distilled', 'barrel', 'cask', 'proof', 'abv', 'year'
    ];
    
    productionKeywords.forEach(keyword => {
      if (desc.includes(keyword)) score += 3;
    });
    
    return score;
  }

  /**
   * Find consensus ABV from multiple sources
   */
  private findConsensusABV(results: any[]): number | undefined {
    const abvValues = results
      .map(r => r.abv)
      .filter(v => v !== null && v !== undefined)
      .map(v => parseFloat(v));

    if (abvValues.length === 0) return undefined;

    // If we have multiple values, find the most common or average
    if (abvValues.length === 1) return abvValues[0];

    // Count occurrences
    const counts = new Map<number, number>();
    abvValues.forEach(v => {
      counts.set(v, (counts.get(v) || 0) + 1);
    });

    // Find most common value
    let maxCount = 0;
    let consensusABV = abvValues[0];
    counts.forEach((count, abv) => {
      if (count > maxCount) {
        maxCount = count;
        consensusABV = abv;
      }
    });

    return consensusABV;
  }

  /**
   * V3.1.3: Enhanced price extraction with multiple strategies
   */
  private findPriceEnhanced(parsedResults: any[], searchResults: any[]): number | undefined {
    // Strategy 1: Try existing parsed prices
    const existingPrice = this.findPrice(parsedResults);
    if (existingPrice) {
      return existingPrice;
    }
    
    // Strategy 2: Try enhanced extraction from snippets and HTML
    for (const result of searchResults) {
      if (result.snippet) {
        const snippetPrice = EnhancedPriceExtractor.extractPriceWithRetry(result.snippet, result.link);
        if (snippetPrice) {
          logger.info(`💰 Enhanced price extraction found: $${snippetPrice} from snippet`);
          return snippetPrice;
        }
      }
      
      // Try from HTML snippet if available
      if (result.htmlSnippet) {
        const htmlPrice = EnhancedPriceExtractor.extractPriceWithRetry(result.htmlSnippet, result.link);
        if (htmlPrice) {
          logger.info(`💰 Enhanced price extraction found: $${htmlPrice} from HTML`);
          return htmlPrice;
        }
      }
    }
    
    // Strategy 3: Try from pagemap data
    for (const result of searchResults) {
      if (result.pagemap) {
        const pagemap = result.pagemap;
        
        // Check product data
        if (pagemap.product) {
          const productPrice = EnhancedPriceExtractor.extractFromStructuredData(pagemap);
          if (productPrice) {
            logger.info(`💰 Enhanced price extraction found: $${productPrice} from pagemap`);
            return productPrice;
          }
        }
        
        // Check offer data
        if (pagemap.offer) {
          const offerPrice = EnhancedPriceExtractor.extractFromStructuredData(pagemap);
          if (offerPrice) {
            logger.info(`💰 Enhanced price extraction found: $${offerPrice} from offer data`);
            return offerPrice;
          }
        }
      }
    }
    
    return undefined;
  }

  /**
   * Find numeric price from multiple sources (original method)
   */
  private findPrice(results: any[]): number | undefined {
    const prices = results
      .map(r => r.price)
      .filter(p => p)
      .map(p => {
        // Handle various price formats
        let priceStr = String(p);
        
        // Remove currency symbols and spaces
        priceStr = priceStr.replace(/[$£€\s,]/g, '');
        
        // Handle prices like "3999" that should be "39.99"
        // If we have 4 digits with no decimal, assume last 2 are cents
        if (/^\d{4}$/.test(priceStr)) {
          const dollars = priceStr.substring(0, priceStr.length - 2);
          const cents = priceStr.substring(priceStr.length - 2);
          priceStr = `${dollars}.${cents}`;
        }
        
        // Extract numeric value
        const match = priceStr.match(/\d+(?:\.\d{1,2})?/);
        if (!match) return null;
        
        const price = parseFloat(match[0]);
        
        // Sanity check - spirits typically cost between $10 and $5000
        if (price < 10 || price > 5000) {
          // Check if it might be missing decimal (e.g., "2999" -> "29.99")
          if (price > 1000 && price < 10000) {
            return price / 100;
          }
          return null;
        }
        
        return price;
      })
      .filter(p => p !== null && p > 0) as number[];

    if (prices.length === 0) return undefined;

    // Return the median price for better accuracy
    prices.sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    return prices.length % 2 !== 0 
      ? prices[mid] 
      : (prices[mid - 1] + prices[mid]) / 2;
  }

  /**
   * Find price range from multiple sources
   * Returns one of: 'budget', 'mid-range', 'premium', 'luxury', 'ultra-luxury'
   */
  private findPriceRange(results: any[]): string | undefined {
    const prices = results
      .map(r => r.price)
      .filter(p => p)
      .map(p => {
        const match = p.match(/\d+(?:\.\d{2})?/);
        return match ? parseFloat(match[0]) : null;
      })
      .filter(p => p !== null && p > 0) as number[];

    if (prices.length === 0) {
      // If no numeric prices found, check for non-numeric price strings
      const priceStrings = results
        .map(r => r.price)
        .filter(p => p && typeof p === 'string');
      
      if (priceStrings.length > 0) {
        // Count $ symbols to determine price range
        const dollarCount = priceStrings[0].match(/\$/g)?.length || 0;
        if (dollarCount === 1) return 'budget';
        if (dollarCount === 2) return 'mid-range';
        if (dollarCount === 3) return 'premium';
        if (dollarCount === 4) return 'luxury';
        if (dollarCount >= 5) return 'ultra-luxury';
      }
      return undefined;
    }

    // Use the average price for categorization
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Categorize into valid database price ranges
    if (avgPrice < 30) return 'budget';
    if (avgPrice < 60) return 'mid-range';
    if (avgPrice < 150) return 'premium';
    if (avgPrice < 500) return 'luxury';
    return 'ultra-luxury';
  }

  /**
   * Find volume from results
   */
  private findVolume(results: any[]): string | undefined {
    const volumes = results
      .map(r => r.volume)
      .filter(v => v);

    if (volumes.length === 0) return undefined;

    // Count occurrences of each volume
    const volumeCounts = new Map<string, number>();
    volumes.forEach(v => {
      volumeCounts.set(v, (volumeCounts.get(v) || 0) + 1);
    });

    // Return the most common volume
    let maxCount = 0;
    let mostCommon = volumes[0];
    volumeCounts.forEach((count, volume) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = volume;
      }
    });

    return mostCommon;
  }

  /**
   * Find the best image from multiple sources
   */
  private findBestImage(results: any[]): string | undefined {
    const allImages: string[] = [];
    
    // Collect images from various sources
    results.forEach(result => {
      // Direct images array
      if (result.images && Array.isArray(result.images)) {
        allImages.push(...result.images);
      }
      
      // Open Graph image from metadata
      if (result.metadata?.ogImage) {
        allImages.push(result.metadata.ogImage);
      }
      
      // Product images from structured data
      if (result.metadata?.structuredData?.image) {
        const structuredImages = Array.isArray(result.metadata.structuredData.image) 
          ? result.metadata.structuredData.image 
          : [result.metadata.structuredData.image];
        allImages.push(...structuredImages);
      }
    });

    // Remove duplicates and filter invalid URLs
    const uniqueImages = [...new Set(allImages)].filter(img => {
      if (!img || typeof img !== 'string') return false;
      if (!img.startsWith('http://') && !img.startsWith('https://')) return false;
      if (img.includes('placeholder') || img.includes('no-image')) return false;
      if (img.includes('1x1') || img.includes('pixel')) return false;
      return true;
    });

    if (uniqueImages.length === 0) return undefined;

    // Prefer images from known good sources
    const preferredDomains = [
      'totalwine.com',
      'wine.com',
      'wine-searcher.com',
      'thewhiskyexchange.com',
      'masterofmalt.com',
      'drizly.com',
      'reservebar.com',
      'caskers.com',
      'flaviar.com',
      'spiritsandspice.com',
    ];

    // Score images based on domain and URL patterns
    const scoredImages = uniqueImages.map(img => {
      let score = 0;
      
      // Check preferred domains
      for (const domain of preferredDomains) {
        if (img.includes(domain)) {
          score += 10;
          break;
        }
      }
      
      // Prefer product images
      if (img.includes('/product') || img.includes('/bottle') || img.includes('/spirits')) {
        score += 5;
      }
      
      // Prefer larger images
      if (img.includes('large') || img.includes('zoom') || img.includes('detail')) {
        score += 3;
      }
      
      // Avoid thumbnails
      if (img.includes('thumb') || img.includes('small') || img.includes('tiny')) {
        score -= 5;
      }
      
      return { url: img, score };
    });

    // Sort by score and return the best image
    scoredImages.sort((a, b) => b.score - a.score);
    return scoredImages[0]?.url;
  }

  /**
   * Detect spirit type from name and search results
   * @deprecated Use detectSpiritType from spirit-types.ts instead
   */
  private detectSpiritTypeLegacy(name: string, brand: string | undefined, results: any[]): string {
    const fullName = `${name} ${brand || ''}`.toLowerCase();
    const allText = results.map(r => `${r.title} ${r.description}`).join(' ').toLowerCase();

    console.log(`🔍 Detecting spirit type for: name="${name}", brand="${brand}"`);

    // PRIORITY 0: Brand-based detection (HIGHEST PRIORITY)
    if (brand) {
      const brandLower = brand.toLowerCase();
      console.log(`🔍 Checking brand: "${brandLower}"`);
      
      // Known bourbon brands - EXPANDED LIST
      const bourbonBrands = [
        'buffalo trace', 'eagle rare', "blanton's", 'blanton', 'pappy van winkle',
        'w.l. weller', 'weller', 'e.h. taylor', 'eh taylor', 'stagg', 'benchmark',
        'four roses', "maker's mark", 'makers mark', 'wild turkey', "russell's reserve", 'russell',
        'evan williams', 'elijah craig', 'henry mckenna', 'heaven hill', 'larceny',
        'old forester', 'woodford reserve', 'knob creek', 'jim beam', 'booker',
        "booker's", 'basil hayden', 'old grand-dad', 'old granddad', 'very old barton',
        'early times', 'ancient age', '1792', 'old ezra', 'ezra brooks',
        'bulleit bourbon', 'bulleit', 'jefferson', 'noah\'s mill', 'rowan\'s creek',
        'kentucky owl', 'wilderness trail', 'new riff', 'bardstown', 'rabbit hole',
        'gray wolf', 'grey wolf', 'old carter', 'william wolf', 'wolf',
        'garrison brothers', 'garrison bros', 'paddock bourbon', 'paddock', 'redwood empire',
        'widow jane', 'smoke wagon', 'barrel', 'barrell', 'calumet', 'penelope',
        'old fitzgerald', 'rebel', 'david nicholson', 'yellowstone', 'kentucky gentleman',
        'town branch', 'pinhook', 'castle & key', 'green river', 'old pepper',
        'james e pepper', 'redemption', 'smooth ambler', 'high west', 'whistlepig'
      ];
      
      for (const bourbonBrand of bourbonBrands) {
        if (brandLower.includes(bourbonBrand) || fullName.includes(bourbonBrand)) {
          console.log(`✅ Brand-based detection: "${brand}" matches bourbon brand "${bourbonBrand}" -> Bourbon`);
          return 'Bourbon';
        }
      }
      
      // Known rye brands
      const ryeBrands = [
        'sazerac rye', 'rittenhouse', 'pikesville', 'whistlepig', 'michter\'s rye',
        'high west rye', 'bulleit rye', 'old overholt', 'few rye', 'templeton'
      ];
      
      for (const ryeBrand of ryeBrands) {
        if (brandLower.includes(ryeBrand) || fullName.includes(ryeBrand)) {
          return 'Rye Whiskey';
        }
      }
      
      // Known scotch brands
      const scotchBrands = [
        'macallan', 'glenfiddich', 'glenlivet', 'highland park', 'ardbeg',
        'lagavulin', 'laphroaig', 'talisker', 'oban', 'dalmore', 'balvenie',
        'glenmorangie', 'bowmore', 'bruichladdich', 'bunnahabhain', 'springbank'
      ];
      
      for (const scotchBrand of scotchBrands) {
        if (brandLower.includes(scotchBrand)) {
          return 'Single Malt Scotch';
        }
      }
      
      // Tennessee whiskey brands
      const tennesseeWhiskeyBrands = ['jack daniel', 'george dickel', 'uncle nearest'];
      for (const tnBrand of tennesseeWhiskeyBrands) {
        if (brandLower.includes(tnBrand)) {
          return 'Tennessee Whiskey';
        }
      }
    }

    // PRIORITY 1: Check for BOURBON FIRST (most common in our dataset)
    // Check the product name itself first, not just search results
    if (/\bbourbon\b/i.test(fullName)) {
      console.log(`✅ Name contains "bourbon" -> Bourbon`)
      return 'Bourbon';
    }
    // Check for Kentucky Straight pattern (strongly indicates bourbon)
    if (/\b(kentucky\s+straight|straight\s+bourbon|wheated\s+bourbon|bottled\s+in\s+bond)\b/i.test(fullName)) {
      console.log(`✅ Name contains bourbon pattern -> Bourbon`)
      return 'Bourbon';
    }
    // Check for bourbon in allText but be more specific
    if (/\b(kentucky straight bourbon|straight bourbon whiskey|bourbon whiskey|wheated bourbon|bottled in bond bourbon)\b/i.test(allText) &&
        !(/\b(rum|mezcal|tequila|vodka|gin)\b/i.test(fullName))) {  // Make sure name doesn't contain other spirit types
      console.log(`✅ Search results indicate bourbon -> Bourbon`)
      return 'Bourbon';
    }
    
    // PRIORITY 2: Check for TEQUILA/MEZCAL (be more specific)
    if (/\b(tequila|mezcal)\b/i.test(fullName)) {  // Only check name, not all text
      // Further classify tequila types
      if (/\bmezcal\b/i.test(fullName)) {
        return 'Mezcal';
      }
      return 'Tequila';
    }
    // Check for tequila-specific terms but only if name suggests it
    if (/\b(blanco|reposado|añejo|anejo|extra añejo|cristalino|joven)\b/i.test(fullName) &&
        /\b(agave|tequila|mezcal)\b/i.test(allText)) {
      return 'Tequila';
    }
    
    // PRIORITY 3: Check for RUM (be more specific - avoid false positives)
    if (/\b(rum|rhum|ron)\b/i.test(fullName) && !(/\b(forum|premium|drum|crumb|rumor)\b/i.test(fullName))) {
      // Make sure it's actually rum, not a word containing "rum"
      return 'Rum';
    }
    // Check allText only if very specific rum patterns
    if (/\b(spiced rum|dark rum|white rum|gold rum|aged rum|caribbean rum|jamaican rum|puerto rican rum)\b/i.test(allText) &&
        !(/\b(bourbon|whiskey|whisky)\b/i.test(fullName))) {
      return 'Rum';
    }
    
    // PRIORITY 4: Check for GIN (be more specific)
    if (/\bgin\b/i.test(fullName) && !(/\b(ginger|engine|begin|origin)\b/i.test(fullName))) {
      return 'Gin';
    }
    if (/\b(london dry gin|old tom gin|genever|plymouth gin|navy strength gin)\b/i.test(allText) &&
        !(/\b(bourbon|whiskey|whisky)\b/i.test(fullName))) {
      return 'Gin';
    }
    
    // PRIORITY 5: Check for VODKA
    if (/\bvodka\b/i.test(fullName)) {
      return 'Vodka';
    }
    
    // PRIORITY 6: Check for COGNAC/BRANDY
    if (/\b(cognac|armagnac|brandy|calvados|pisco)\b/i.test(fullName)) {
      if (/\bcognac\b/i.test(fullName)) {
        return 'Cognac';
      }
      return 'Brandy';
    }
    
    // PRIORITY 7: Check for LIQUEUR
    if (/\b(liqueur|cordial|creme de)\b/i.test(fullName)) {
      return 'Liqueur';
    }
    
    // PRIORITY 2: Check for SINGLE MALT
    if (/\b(single malt|american single malt|asm)\b/i.test(fullName) || 
        /\b(single malt|american single malt|asm)\b/i.test(allText)) {
      return 'Single Malt';
    }
    
    // PRIORITY 3: Check for RYE WHISKEY (more specific patterns to avoid false positives)
    // Only match if it's specifically called "rye whiskey" or has high rye content
    if (/\b(rye whiskey|rye whisky|straight rye|95%.*rye|rye grain whiskey)\b/i.test(fullName)) {
      return 'Rye Whiskey';
    }
    // Check for high rye mash bills (75%+ rye content indicates rye whiskey)
    if (/\b(7[5-9]|8[0-9]|9[0-9]|100)%?\s*(rye|ryemalt)/i.test(allText)) {
      return 'Rye Whiskey';
    }
    if (/\b(rye whiskey|straight rye whiskey|95%.*rye|high rye content|rye mash bill)\b/i.test(allText) &&
        !/\bbourbon\b/i.test(fullName)) {  // Don't categorize as rye if bourbon is in the name
      return 'Rye Whiskey';
    }
    
    // PRIORITY 4: Other specific whiskey types
    const typePatterns = [
      // Scotch
      { pattern: /\b(blended scotch|blended whisky|scotch whisky|highland|speyside|islay)\b/i, type: 'Blended Scotch' },
      
      // Irish
      { pattern: /\b(irish whiskey|irish whisky|pot still irish)\b/i, type: 'Irish Whiskey' },
      
      // Japanese
      { pattern: /\b(japanese whisky|japanese whiskey)\b/i, type: 'Japanese Whisky' },
      
      // Canadian
      { pattern: /\b(canadian whisky|canadian whiskey)\b/i, type: 'Canadian Whisky' },
      
      // Other spirits
      { pattern: /\bvodka\b/i, type: 'Vodka' },
      { pattern: /\bgin\b/i, type: 'Gin' },
      { pattern: /\brum\b/i, type: 'Rum' },
      { pattern: /\btequila\b/i, type: 'Tequila' },
      { pattern: /\bmezcal\b/i, type: 'Mezcal' },
      { pattern: /\bcognac\b/i, type: 'Cognac' },
      { pattern: /\bbrandy\b/i, type: 'Brandy' },
      { pattern: /\bliqueur\b/i, type: 'Liqueur' },
    ];

    // Check patterns in order
    for (const { pattern, type } of typePatterns) {
      if (pattern.test(fullName) || pattern.test(allText)) {
        return type;
      }
    }

    // Check brand-based detection for known bourbon brands
    const bourbonBrands = [
      'hudson', 'woodinville', 'balcones', 'starlight', 
      'wilderness trail', 'ammunition', 'yellowstone',
      'maker\'s mark', 'jim beam', 'wild turkey', 'buffalo trace',
      'four roses', 'knob creek', 'old forester', 'heaven hill',
      'barrell', 'barrel', 'elijah craig', 'old carter', 'larceny', 'michter',
      'smoke wagon', 'legends', '1792', 'daviess county', 'william wolf',
      'pinhook', 'henry mckenna', 'evan williams', 'bulleit', 'basil hayden',
      'booker\'s', 'baker\'s', 'blanton\'s', 'eagle rare', 'e.h. taylor',
      'george t. stagg', 'pappy van winkle', 'weller', 'calumet farm',
      'old ezra', 'very old barton', 'ancient age', 'benchmark',
      'traveller', 'uncle nearest', 'old grand-dad', 'fighting cock',
      'garrison brothers', 'garrison bros', 'paddock bourbon', 'paddock',
      'redwood empire', 'widow jane', 'penelope', 'old fitzgerald', 'rebel',
      'david nicholson', 'kentucky gentleman', 'town branch', 'castle & key',
      'green river', 'old pepper', 'james e pepper', 'redemption', 
      'smooth ambler', 'high west', 'whistlepig'
    ];
    
    // Remove brands that make multiple types of whiskey
    const multiTypeProducers = ['mckenzie', 'never say die'];
    
    if (brand && !multiTypeProducers.some(m => brand.toLowerCase().includes(m)) && 
        bourbonBrands.some(b => brand.toLowerCase().includes(b))) {
      // Double-check it's not explicitly a rye from a bourbon brand
      if (!/\b(rye whiskey|straight rye)\b/i.test(fullName)) {
        return 'Bourbon';
      }
    }

    // Check for known rye whiskey brands
    const ryeBrands = [
      'redemption', 'rittenhouse', 'sazerac rye', 'whistlepig', 'templeton',
      'high west', 'ragtime', 'old overholt', 'pikesville', 'wild turkey rye',
      'bulleit rye', 'knob creek rye', 'jim beam rye', 'george dickel rye',
      'sagamore', 'sagamore spirit', 'mgp rye', 'rossville union', 'minor case',
      'jack daniel\'s rye', 'crown royal rye', 'lot 40', 'alberta premium'
    ];
    
    if (brand && ryeBrands.some(b => brand.toLowerCase().includes(b))) {
      return 'Rye Whiskey';
    }

    // If it contains whiskey/whisky but no specific type, default to Whiskey
    if (/\b(whiskey|whisky)\b/i.test(fullName) || /\b(whiskey|whisky)\b/i.test(allText)) {
      return 'Whiskey';
    }

    console.log(`⚠️ No type match found, defaulting to 'Other'`);
    return 'Other';
  }

  /**
   * Detect category from type
   */
  private detectCategory(type: string): string {
    if (!type) return 'Other';

    // V2.8: Enhanced category mapping to reduce "Other" classifications
    const categoryMap: Record<string, string> = {
      // Whiskey categories
      'Single Malt': 'Single Malt Whiskey',
      'Blended Scotch': 'Scotch Whiskey',
      'Scotch': 'Scotch Whiskey',
      'Bourbon': 'Bourbon',
      'Rye Whiskey': 'Rye Whiskey',
      'Irish Whiskey': 'Irish Whiskey',
      'Japanese Whisky': 'Japanese Whiskey',
      'Canadian Whisky': 'Canadian Whiskey',
      'Tennessee Whiskey': 'Tennessee Whiskey',
      'American Single Malt': 'American Single Malt',
      'Whiskey': 'Whiskey',
      'Whisky': 'Whiskey',
      
      // Clear spirits
      'Vodka': 'Vodka',
      'Gin': 'Gin',
      
      // Aged spirits
      'Rum': 'Rum',
      'Tequila': 'Tequila',
      'Mezcal': 'Mezcal',
      
      // Brandy categories
      'Cognac': 'Cognac',
      'Brandy': 'Brandy',
      'Armagnac': 'Brandy',
      'Calvados': 'Brandy',
      'Pisco': 'Brandy',
      
      // Liqueurs
      'Liqueur': 'Liqueur',
      'Cream Liqueur': 'Liqueur',
      'Coffee Liqueur': 'Liqueur',
      'Herbal Liqueur': 'Liqueur',
      
      // International spirits
      'Sake': 'Sake',
      'Shochu': 'Other Asian Spirits',
      'Baijiu': 'Other Asian Spirits',
      'Soju': 'Other Asian Spirits',
      'Aquavit': 'Other European Spirits',
      'Grappa': 'Other European Spirits',
      'Schnapps': 'Other European Spirits',
      
      // Special categories
      'Absinthe': 'Absinthe',
      'Aperitif': 'Aperitif',
      'Digestif': 'Digestif',
      'Vermouth': 'Vermouth',
      'Amaro': 'Amaro',
      
      // Lowercase variations
      'single malt': 'Single Malt Whiskey',
      'bourbon': 'Bourbon',
      'rye whiskey': 'Rye Whiskey',
      'whiskey': 'Whiskey',
      'vodka': 'Vodka',
      'gin': 'Gin',
      'rum': 'Rum',
      'tequila': 'Tequila',
      'cognac': 'Cognac',
      'brandy': 'Brandy',
      
      // Default mappings
      'Spirit': 'Other',
      'Other': 'Other',
      'other': 'Other'
    };

    // Try exact match first
    let mapped = categoryMap[type];
    
    // Try lowercase match if no exact match
    if (!mapped && type) {
      mapped = categoryMap[type.toLowerCase()];
    }
    
    // Try to extract category from type if still no match
    if (!mapped) {
      // Check if type contains known spirit words
      const spiritKeywords = [
        'whiskey', 'whisky', 'bourbon', 'rum', 'gin', 'vodka', 
        'tequila', 'mezcal', 'cognac', 'brandy', 'liqueur',
        'sake', 'absinthe', 'schnapps'
      ];
      
      for (const keyword of spiritKeywords) {
        if (type.toLowerCase().includes(keyword)) {
          mapped = categoryMap[keyword] || 'Other';
          break;
        }
      }
    }
    
    // Default to Other if still no match
    if (!mapped) {
      mapped = 'Other';
    }
    
    // Only log category mapping in debug mode
    // console.log(`📂 Category mapping: type="${type}" -> category="${mapped}"`);
    return mapped;
  }

  /**
   * Extract additional metadata from results
   */
  private extractMetadata(results: any[]): Record<string, any> {
    const metadata: Record<string, any> = {};
    const allText = results.map(r => `${r.title} ${r.description}`).join(' ');

    // Extract origin country
    const countryPatterns = [
      /made in (\w+)/i,
      /from (\w+)/i,
      /(\w+) whisky/i,
      /(\w+) vodka/i,
    ];

    for (const pattern of countryPatterns) {
      const match = allText.match(pattern);
      if (match) {
        const country = match[1];
        if (this.isValidCountry(country)) {
          metadata.origin_country = country;
          break;
        }
      }
    }

    // Extract age statement using proper validation
    const validAge = TextProcessor.extractValidAge(allText);
    if (validAge) {
      metadata.age_statement = validAge;
    }

    // Extract flavor notes
    const flavorMatch = allText.match(/notes of ([^.]+)/i);
    if (flavorMatch) {
      metadata.flavor_profile = flavorMatch[1]
        .split(/,|and/)
        .map(f => f.trim())
        .filter(f => f.length > 0 && f.length < 50);
    }

    // Extract awards
    const awardPatterns = [
      /won\s+(.+?)\s+award/i,
      /awarded\s+(.+?)\s+medal/i,
      /(\d+)\s+gold\s+medal/i,
      /double\s+gold/i,
      /best\s+in\s+class/i,
      /world\s+whisky\s+awards/i,
      /san\s+francisco\s+world\s+spirits/i,
    ];

    const awards: string[] = [];
    for (const pattern of awardPatterns) {
      const match = allText.match(pattern);
      if (match) {
        awards.push(match[0]);
      }
    }
    
    if (awards.length > 0) {
      metadata.awards = [...new Set(awards)];
    }

    return metadata;
  }
  
  /**
   * Validate and fix spirit name based on search results
   */
  private validateSpiritName(name: string, results: any[]): string {
    // Check if the name matches what's in the search results
    const titles = results.map(r => r.title || '').filter(t => t);
    const descriptions = results.map(r => r.description || '').filter(d => d);
    
    // Look for consistent product names in results
    const productNamePattern = /([A-Za-z0-9\s&'.-]+(?:Bourbon|Whiskey|Whisky|Rum|Vodka|Gin|Tequila|Mezcal|Cognac|Brandy))/i;
    
    const extractedNames: string[] = [];
    [...titles, ...descriptions].forEach(text => {
      const match = text.match(productNamePattern);
      if (match) {
        extractedNames.push(TextProcessor.fixTextSpacing(match[1].trim()));
      }
    });
    
    // If we found consistent names in results, use the most common one
    if (extractedNames.length > 0) {
      const nameCounts = new Map<string, number>();
      extractedNames.forEach(n => {
        nameCounts.set(n, (nameCounts.get(n) || 0) + 1);
      });
      
      let mostCommon = name;
      let maxCount = 0;
      nameCounts.forEach((count, extractedName) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommon = extractedName;
        }
      });
      
      return mostCommon;
    }
    
    return name;
  }
  
  /**
   * Validate description matches the product
   */
  private validateDescription(description: string | undefined, name: string, type: string): string | undefined {
    if (!description) return undefined;
    
    const nameLower = name.toLowerCase();
    const descLower = description.toLowerCase();
    
    // Check if description is about a different product
    const differentProductIndicators = [
      // If name contains "81 Proof" but description mentions "101"
      (nameLower.includes('81') && descLower.includes('101')),
      // If types don't match
      (type === 'Bourbon' && descLower.includes('tequila')),
      (type === 'Tequila' && descLower.includes('bourbon')),
      (type === 'Rum' && descLower.includes('whiskey')),
      (type === 'Vodka' && descLower.includes('whiskey')),
      // Check for completely different brand mentions
      (!nameLower.includes('wild turkey') && descLower.includes('wild turkey 101')),
      (!nameLower.includes('evan williams') && descLower.includes('evan williams')),
    ];
    
    if (differentProductIndicators.some(indicator => indicator)) {
      logger.warn(`Description appears to be for a different product than "${name}"`);
      return undefined;
    }
    
    return description;
  }

  /**
   * Check if a string is a valid country name
   */
  private isValidCountry(country: string): boolean {
    const validCountries = [
      'Scotland', 'Ireland', 'USA', 'United States', 'America',
      'Canada', 'Japan', 'France', 'Mexico', 'Russia', 'Poland',
      'Sweden', 'Finland', 'Norway', 'Netherlands', 'England',
      'Spain', 'Italy', 'Germany', 'India', 'Taiwan', 'Australia',
    ];

    return validCountries.some(vc =>
      vc.toLowerCase() === country.toLowerCase(),
    );
  }

  /**
   * Extract distillery from brand name
   */
  private extractDistillery(brand: string, productName: string): string {
    // If brand is missing, try to extract it from product name first
    if (!brand) {
      // Try to extract brand from patterns like "E H Taylor Jr Barrel Proof"
      const brandPatterns = [
        /^(?:Col(?:onel)?.?\s*)?E.?\s*H.?\s*Taylor(?:\s*Jr.?)?/i,
        /^Barrel\s+Proof\s+(?:Nashville|NOLA|Kentucky)/i,
        /^Nashville\s+Barrel\s+Company/i,
        /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)s+(?:Straight|Kentucky|Tennessee|Bottled|Single|Small|Barrel)/i,
      ];
      
      for (const pattern of brandPatterns) {
        const match = productName.match(pattern);
        if (match) {
          brand = match[0].trim();
          break;
        }
      }
    }
    
    // First try brand lookup
    let distillery = getDistilleryForBrand(brand);
    
    // If not found, try inferring from product name
    if (!distillery) {
      distillery = inferDistilleryFromName(productName);
    }
    
    // Format distillery name with proper suffix if needed
    if (distillery) {
      distillery = this.formatDistilleryName(distillery);
    }
    
    return distillery;
  }
  
  /**
   * Format distillery name with proper suffix
   */
  private formatDistilleryName(distillery: string): string {
    if (!distillery) return '';
    
    // Skip if already has proper suffix
    if (distillery.includes('Distillery') || distillery.includes('Distilleries') || 
        distillery.includes('Distillers') || distillery.includes('Distilling')) {
      return distillery;
    }
    
    // Known companies that use "Distilleries" plural
    const pluralDistilleries = [
      'Heaven Hill', 'Four Roses', 'Suntory', 'Nikka', 'Diageo'
    ];
    
    // Check if should use plural
    for (const plural of pluralDistilleries) {
      if (distillery.includes(plural)) {
        return distillery + ' Distilleries';
      }
    }
    
    // Default to singular "Distillery"
    return distillery + ' Distillery';
  }
  
  /**
   * Extract origin country from type, name, description and URL
   */
  private extractOriginCountry(type: string, name: string, description: string, url: string): string {
    const text = `${name} ${description} ${url}`.toLowerCase();
    const typeLower = type.toLowerCase();
    
    // Type-based rules - CRITICAL: Check case-insensitive and return proper country name
    if (typeLower === 'bourbon' || typeLower === 'rye whiskey' || typeLower === 'tennessee whiskey' || 
        typeLower === 'american single malt' || type === 'Bourbon' || type === 'Rye Whiskey') {
      return 'United States';
    }
    
    if (type === 'scotch' || type.includes('scotch')) {
      return 'Scotland';
    }
    
    if (type === 'irish' || type.includes('irish')) {
      return 'Ireland';
    }
    
    if (type === 'canadian' || type.includes('canadian')) {
      return 'Canada';
    }
    
    if (type === 'japanese' || type.includes('japanese')) {
      return 'Japan';
    }
    
    // Text-based detection
    if (text.includes('kentucky') || text.includes('tennessee') || text.includes('texas') || 
        text.includes('indiana') || text.includes('colorado') || text.includes('oregon') ||
        text.includes('washington') || text.includes('american') || text.includes('united states')) {
      return 'United States';
    }
    
    if (text.includes('scotch') || text.includes('scottish') || text.includes('highland') || 
        text.includes('islay') || text.includes('speyside') || text.includes('campbeltown')) {
      return 'Scotland';
    }
    
    if (text.includes('irish')) {
      return 'Ireland';
    }
    
    if (text.includes('canadian')) {
      return 'Canada';
    }
    
    if (text.includes('japanese') || text.includes('japan')) {
      return 'Japan';
    }
    
    if (text.includes('mexican') || text.includes('mexico')) {
      return 'Mexico';
    }
    
    if (text.includes('french') || text.includes('france') || text.includes('cognac') || text.includes('armagnac')) {
      return 'France';
    }
    
    if (text.includes('spanish') || text.includes('spain')) {
      return 'Spain';
    }
    
    if (text.includes('cuban') || text.includes('cuba')) {
      return 'Cuba';
    }
    
    if (text.includes('jamaican') || text.includes('jamaica')) {
      return 'Jamaica';
    }
    
    if (text.includes('barbados')) {
      return 'Barbados';
    }
    
    if (text.includes('puerto rico')) {
      return 'Puerto Rico';
    }
    
    // Tequila/Mezcal are from Mexico
    if (type === 'tequila' || type === 'mezcal') {
      return 'Mexico';
    }
    
    // Default for whiskey types
    if (typeLower.includes('whiskey') || typeLower.includes('whisky')) {
      return 'United States'; // Most common
    }
    
    return '';
  }
  
  /**
   * Find proof from multiple sources
   */
  private findProof(results: any[]): number | undefined {
    for (const result of results) {
      if (result.description) {
        const proofMatch = result.description.match(/(\d+(?:\.\d+)?)\s*proof/i);
        if (proofMatch) {
          return parseFloat(proofMatch[1]);
        }
      }
    }
    return undefined;
  }

  /**
   * Determine country based on type and region
   */
  private determineCountry(type: string, region?: string): string {
    // Region-based determination
    if (region) {
      const regionCountryMap: Record<string, string> = {
        'Kentucky': 'USA',
        'Tennessee': 'USA',
        'Indiana': 'USA',
        'Texas': 'USA',
        'Colorado': 'USA',
        'Oregon': 'USA',
        'Washington': 'USA',
        'California': 'USA',
        'Highland': 'Scotland',
        'Speyside': 'Scotland',
        'Islay': 'Scotland',
        'Campbeltown': 'Scotland',
        'Lowland': 'Scotland',
        'Islands': 'Scotland',
        'Ireland': 'Ireland',
        'Japan': 'Japan',
        'Mexico': 'Mexico',
      };
      
      if (regionCountryMap[region]) {
        return regionCountryMap[region];
      }
    }
    
    // Type-based determination
    const typeCountryMap: Record<string, string> = {
      'Tennessee Whiskey': 'USA',
      'American Single Malt': 'USA',
      'Bourbon': 'USA',
      'Rye Whiskey': 'USA',
      'Scotch Whisky': 'Scotland',
      'Irish Whiskey': 'Ireland',
      'Japanese Whisky': 'Japan',
      'Canadian Whisky': 'Canada',
      'Tequila': 'Mexico',
      'Mezcal': 'Mexico',
      'Cognac': 'France',
      'Armagnac': 'France',
      'Calvados': 'France',
      'Pisco': 'Peru',
    };
    
    return typeCountryMap[type] || '';
  }

  /**
   * Detect if spirit is limited edition
   */
  private isLimitedEdition(name: string, description?: string): boolean {
    const text = `${name} ${description || ''}`.toLowerCase();
    
    const limitedPatterns = [
      /limited edition/i,
      /limited release/i,
      /special edition/i,
      /special release/i,
      /single cask/i,
      /single barrel select/i,
      /private selection/i,
      /store pick/i,
      /allocated/i,
      /rare release/i,
      /annual release/i,
      /vintage \d{4}/i,
      /batch #?\d+/i,
      /cask #?\d+/i,
      /barrel #?\d+/i,
    ];
    
    return limitedPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Check if a product is an alcoholic beverage (not merchandise)
   */
  private isAlcoholicBeverage(productName: string, description: string): boolean {
    const text = `${productName} ${description}`;
    
    // First check if it's clearly a spirit product
    const spiritIndicators = [
      /\b\d+\s*year\s*(old|aged)\b/i,
      /\b(bourbon|whiskey|whisky|scotch|rye|vodka|gin|rum|tequila|cognac)\b/i,
      /\b(single\s+barrel|small\s+batch|cask\s+strength|barrel\s+proof)\b/i,
      /\b(distillery|distilled|aged|matured)\b/i,
      /\b\d{2,3}\s*proof\b/i,
      /\b\d+(\.\d+)?%\s*(abv|alcohol)\b/i,
    ];
    
    // V2.7.5: Require 3+ indicators for strong confidence, or 2+ with specific keywords
    const indicatorCount = spiritIndicators.filter(pattern => pattern.test(productName)).length;
    const hasSpecificSpiritName = /\b(bourbon|whiskey|whisky|scotch|rye|vodka|gin|rum|tequila|cognac|brandy)\b/i.test(productName);
    const hasStrongSpiritIndicators = indicatorCount >= 3 || (indicatorCount >= 2 && hasSpecificSpiritName);
    
    // V2.7.5: Known valid spirits that might trigger false positives
    const knownValidSpirits = [
      /\blarceny\s+.*bourbon/i,  // Larceny bourbon products
      /\bmethod\s+and\s+madness/i,  // Method and Madness Irish Whiskey
      /\bknob\s+creek/i,  // Knob Creek bourbon
      /\bwild\s+turkey/i,  // Wild Turkey bourbon
      /\brare\s+breed/i,  // Rare Breed bourbon
      /\bpiggyback/i,  // Piggyback bourbon
    ];
    
    // Check if this is a known valid spirit
    const isKnownValid = knownValidSpirits.some(pattern => pattern.test(productName));
    
    // CRITICAL: Check all non-product categories with context
    const nonProductCategories = ['merchandise', 'beer', 'tours', 'food', 'events', 'cocktails'] as const;
    
    for (const category of nonProductCategories) {
      if (containsNonProductPatterns(text, category)) {
        // If it's a known valid spirit, skip rejection
        if (isKnownValid) {
          logger.info(`✅ Known valid spirit despite ${category} pattern: "${productName}"`);
          continue;
        }
        
        // If it has strong spirit indicators, it's probably a false positive
        if (hasStrongSpiritIndicators) {
          logger.info(`✅ Product has strong spirit indicators despite ${category} pattern: "${productName}"`);
          continue;
        }
        
        // Additional context checks for specific categories
        if (category === 'tours' && /reserve|\d+\s*year|limited\s+edition|single\s+barrel/i.test(productName)) {
          continue; // Likely product, not a tour
        }
        
        if (category === 'merchandise' && /\d+\s*year|\d+ml|\d+\s*proof|limited\s+edition/i.test(productName)) {
          continue; // Likely spirit with volume/proof, not merchandise
        }
        
        logger.warn(`❌ Product rejected - contains ${category} patterns: "${productName}"`);
        return false;
      }
    }
    
    // Special check for beer products slipping through
    if (/\b(stout|ale|lager|ipa|pilsner|porter)\b/i.test(productName)) {
      logger.warn(`❌ Product rejected - beer product: "${productName}"`);
      return false;
    }
    
    // Check for specific non-products from latest analysis
    const specificNonProducts = [
      /goose\s+island\s+bourbon\s+county\s+stout/i,  // Beer product
      /retail\s+bourbon-bhg/i,  // Retail page
      /single\s+estate\s+farm\s+continues\s+expansion/i,  // News article
      /founder's\s+original\s+bourbon\s+sour/i,  // Cocktail
    ];
    
    for (const pattern of specificNonProducts) {
      if (pattern.test(productName)) {
        logger.warn(`❌ Product rejected - specific non-product pattern: "${productName}"`);
        return false;
      }
    }
    
    // Must have required spirit indicators
    if (!hasRequiredSpiritIndicators(text)) {
      logger.warn(`❌ Product rejected - no spirit indicators: "${productName}"`);
      return false;
    }
    
    // Should have alcohol content (ABV/proof) mentioned
    if (!hasAlcoholContent(text) && !hasAlcoholContent(productName)) {
      // It's okay if no ABV in description, but name should indicate it's a spirit
      const nameHasSpirit = /\b(whiskey|whisky|bourbon|vodka|gin|rum|tequila|scotch|cognac|brandy)\b/i.test(productName);
      if (!nameHasSpirit) {
        logger.warn(`⚠️  Product may not be alcoholic - no ABV found: "${productName}"`);
      }
    }
    
    return true;
  }

  /**
   * Clean product name - remove website artifacts, normalize format
   */
  private cleanProductName(name: string): string {
    let cleaned = name
      // Remove website artifacts
      .replace(/-musthave.*$/i, '') // "Black-musthave Malts"
      .replace(/Proof-bourbon-kentucky$/i, '') // "81 Proof-bourbon-kentucky"
      .replace(/-bourbon-.*$/i, '') // Any trailing "-bourbon-location" patterns
      .replace(/^Mini\s+/i, '') // Remove "Mini" prefix for miniature bottles
      // Remove review site suffixes
      .replace(/\s+On\s+(?:Whisky\s+)?Connosr$/i, '') // "On Whisky Connosr"
      .replace(/\s+Buy\s+Single\s+Barrel$/i, ' Single Barrel') // Clean up "Buy Single Barrel"
      // Remove any allocation codes at start
      .replace(/^[A-Z]\d{6},?\s*/g, '')
      // Fix hyphenated product names from CSV data
      .replace(/^Straight\s+Bourbon\s+Whiskey-woodford\s+Reserve$/i, 'Woodford Reserve Straight Bourbon Whiskey')
      .replace(/^Wheat\s+Whiskey-woodford\s+Reserve$/i, 'Woodford Reserve Wheat Whiskey')  
      .replace(/^Wheat\s+Whiskey\s+Bottled\s+In\s+Bond-woodford\s+Reserve$/i, 'Woodford Reserve Wheat Whiskey Bottled In Bond')
      .replace(/^Westward\s+Whiskey-spirits$/i, 'Westward Whiskey')
      .replace(/^Retail\s+Bourbon-bhg$/i, '') // Not a product
      .replace(/^Wi\s+Ld\s+Turkey/i, 'Wild Turkey')
      .replace(/^Mu\s+Lho\s+L\s+Land/i, 'Mulholland')
      // Normalize spacing
      .replace(/\s+/g, ' ')
      .trim();
    
    // Apply text processor fixes for spacing
    cleaned = TextProcessor.fixTextSpacing(cleaned);
    
    // V2.7.4: Remove store suffixes and clean up
    cleaned = TextProcessor.removeStoreSuffixes(cleaned);
    cleaned = TextProcessor.removeNavigationPrefixes(cleaned);
    
    return cleaned;
  }

  /**
   * Calculate a comprehensive data quality score - FIXED for proper scoring
   */
  private calculateSimpleQualityScore(data: Partial<SpiritData>): number {
    let score = 0;
    let maxScore = 0;

    // Core required fields (20 points each)
    const coreFields = ['name', 'type', 'brand', 'description'];
    coreFields.forEach(field => {
      maxScore += 20;
      const value = data[field as keyof SpiritData];
      if (value && value !== '' && value !== 'Other' && value !== 'Spirit') {
        score += 20;
        
        // Bonus for high-quality values
        if (field === 'description' && typeof value === 'string') {
          if (value.length > 100) score += 5; // Long description bonus
          if (value.includes('aged') || value.includes('proof') || value.includes('barrel')) score += 5; // Content quality bonus
        }
        
        if (field === 'type' && value !== 'Whiskey' && value !== 'Other') {
          score += 5; // Specific type bonus
        }
      }
    });

    // Important optional fields (10 points each)
    const importantFields = ['abv', 'proof', 'price', 'age_statement', 'image_url', 'source_url'];
    importantFields.forEach(field => {
      maxScore += 10;
      const value = data[field as keyof SpiritData];
      if (value && value !== '' && value !== null && value !== undefined) {
        score += 10;
      }
    });

    // Quality bonuses (20 points total)
    maxScore += 20;
    
    // Valid description bonus (10 points)
    if (data.description && typeof data.description === 'string' && 
        data.description.length > 50 && 
        !data.description_mismatch &&
        !data.description.includes('I love') && 
        !data.description.includes('5 stars') &&
        !data.description.includes('buy now') &&
        !data.description.includes('add to cart')) {
      score += 10;
    }

    // Valid image URL bonus (5 points)
    if (data.image_url && typeof data.image_url === 'string' && 
        data.image_url.startsWith('http') && 
        !data.image_url.includes('placeholder') &&
        !data.image_url.includes('no-image')) {
      score += 5;
    }

    // Valid source URL bonus (5 points)
    if (data.source_url && typeof data.source_url === 'string' && 
        data.source_url.startsWith('http')) {
      score += 5;
    }

    const finalScore = Math.round((score / maxScore) * 100);
    
    // Ensure minimum score of 30 for spirits with basic info, max of 95
    return Math.max(Math.min(finalScore, 95), 30);
  }

  /**
   * Extract brand from product name when not provided
   */
  private extractBrandFromProductName(productName: string): string | undefined {
    // Known brand patterns
    const brandPatterns: Array<{pattern: RegExp, brand: string}> = [
      { pattern: /^(?:Col(?:onel)?.?\s*)?E\.?H\.?\s*Taylor(?:\s*Jr\.?)?/i, brand: 'E.H. Taylor' },
      { pattern: /^Barrel\s+Proof\s+Nashville/i, brand: 'Nashville Barrel Company' },
      { pattern: /^Barrel\s+Proof\s+NOLA/i, brand: 'NOLA Barrel Proof' },
      { pattern: /^Nashville\s+Barrel\s+Company/i, brand: 'Nashville Barrel Company' },
      { pattern: /^Blanton's/i, brand: "Blanton's" },
      { pattern: /^Eagles+Rare/i, brand: 'Eagle Rare' },
      { pattern: /^Buffalos+Trace/i, brand: 'Buffalo Trace' },
      { pattern: /^W.?L.?s*Weller/i, brand: 'W.L. Weller' },
      { pattern: /^Pappys+Vans+Winkle/i, brand: 'Pappy Van Winkle' },
      { pattern: /^Georges+T.?s*Stagg/i, brand: 'George T. Stagg' },
      { pattern: /^Fours+Roses/i, brand: 'Four Roses' },
      { pattern: /^Wilds+Turkey/i, brand: 'Wild Turkey' },
      { pattern: /^Knobs+Creek/i, brand: 'Knob Creek' },
      { pattern: /^Maker'ss+Mark/i, brand: "Maker's Mark" },
      { pattern: /^Woodfords+Reserve/i, brand: 'Woodford Reserve' },
      { pattern: /^Jims+Beam/i, brand: 'Jim Beam' },
      { pattern: /^Jacks+Daniel's/i, brand: "Jack Daniel's" },
      { pattern: /^Jameson/i, brand: 'Jameson' },
      { pattern: /^Bulleit/i, brand: 'Bulleit' },
      { pattern: /^Angel'ss+Envy/i, brand: "Angel's Envy" },
      { pattern: /^Jefferson's/i, brand: "Jefferson's" },
      { pattern: /^Elijahs+Craig/i, brand: 'Elijah Craig' },
      { pattern: /^Henrys+McKenna/i, brand: 'Henry McKenna' },
      { pattern: /^Olds+Forester/i, brand: 'Old Forester' },
      { pattern: /^Evans+Williams/i, brand: 'Evan Williams' },
      { pattern: /^Heavens+Hill/i, brand: 'Heaven Hill' },
      { pattern: /^Michter's/i, brand: "Michter's" },
      { pattern: /^Highs+West/i, brand: 'High West' },
      { pattern: /^Basils+Hayden/i, brand: 'Basil Hayden' },
      { pattern: /^Booker's/i, brand: "Booker's" },
      { pattern: /^Baker's/i, brand: "Baker's" },
      { pattern: /^Larceny/i, brand: 'Larceny' },
      { pattern: /^Verys+Olds+Barton/i, brand: 'Very Old Barton' },
      { pattern: /^Ancients+Age/i, brand: 'Ancient Age' },
      { pattern: /^Olds+Grand[- ]Dad/i, brand: 'Old Grand-Dad' },
      { pattern: /^Olds+Ezra/i, brand: 'Old Ezra' },
      { pattern: /^Rebel/i, brand: 'Rebel' },
      { pattern: /^Fightings+Cock/i, brand: 'Fighting Cock' },
      { pattern: /^Earlys+Times/i, brand: 'Early Times' },
      { pattern: /^Olds+Crow/i, brand: 'Old Crow' },
      { pattern: /^Benchmark/i, brand: 'Benchmark' },
      { pattern: /^1792/i, brand: '1792' },
      { pattern: /^Yellowstone/i, brand: 'Yellowstone' },
      { pattern: /^Makers\s+Mark/i, brand: "Maker's Mark" },
      { pattern: /^Baker's/i, brand: "Baker's" },
      { pattern: /^Old\s+Ezra/i, brand: 'Old Ezra' },
      { pattern: /^Old\s+Crow/i, brand: 'Old Crow' },
      { pattern: /^Michter's/i, brand: "Michter's" },
    ];
    
    // Check each pattern
    for (const { pattern, brand } of brandPatterns) {
      if (pattern.test(productName)) {
        return brand;
      }
    }
    
    // If no known brand found, try generic extraction
    // Pattern: First 1-3 words before spirit type indicators
    const genericMatch = productName.match(/^([A-Z][a-zA-Z']+(?:s+[A-Z][a-zA-Z']+){0,2})s+(?:Bourbon|Whiskey|Whisky|Rye|Scotch|Vodka|Gin|Rum|Tequila|Straight|Kentucky|Tennessee|Single|Small|Barrel|Batch|Proof)/i);
    if (genericMatch && genericMatch[1]) {
      const potentialBrand = genericMatch[1].trim();
      // Don't return generic words as brands
      const genericWords = ['The', 'Single', 'Small', 'Barrel', 'Batch', 'Straight', 'Kentucky', 'Tennessee', 'Bottled', 'Bond'];
      if (!genericWords.includes(potentialBrand)) {
        return potentialBrand;
      }
    }
    
    return undefined;
  }

  /**
   * Extract description from structured data (JSON-LD, Open Graph, etc.)
   */
  private extractFromStructuredData(results: any[]): string {
    for (const result of results) {
      // Check for structured data in metadata
      if (result.metadata?.structuredData) {
        const structured = result.metadata.structuredData;
        if (structured.description && structured.description.length > 30) {
          // Clean and validate it's product-focused
          const cleaned = this.cleanText(structured.description);
          if (TextProcessor.isValidProductDescription(cleaned)) {
            return cleaned;
          }
        }
      }
      
      // Check Open Graph description
      if (result.ogDescription && result.ogDescription.length > 30) {
        const cleaned = this.cleanText(result.ogDescription);
        if (TextProcessor.isValidProductDescription(cleaned)) {
          return cleaned;
        }
      }
    }
    return '';
  }

  /**
   * Generate description from extracted attributes
   */
  private generateDescriptionFromAttributes(results: any[], name: string, brand?: string): string {
    const attributes: string[] = [];
    
    // Start with brand and name
    if (brand) {
      attributes.push(`${brand} ${name}`);
    } else {
      attributes.push(name);
    }
    
    // Add proof/ABV
    const abv = this.findConsensusABV(results);
    const proof = this.findProof(results);
    if (proof) {
      attributes.push(`${proof} proof`);
    } else if (abv) {
      attributes.push(`${abv}% ABV`);
    }
    
    // Add age statement
    const age = TextProcessor.extractValidAge(name);
    if (age) {
      attributes.push(`aged ${age}`);
    }
    
    // Add type information
    const typeResult = detectSpiritType(name, brand || '', '');
    if (typeResult.type !== 'Other' && typeResult.type !== 'Spirit') {
      attributes.push(typeResult.type.toLowerCase());
    }
    
    // Add region if detected
    const regions = ['Kentucky', 'Tennessee', 'Highland', 'Speyside', 'Islay', 'Japanese', 'Irish'];
    for (const region of regions) {
      if (name.includes(region)) {
        attributes.push(`from ${region}`);
      }
    }
    
    // Add special characteristics
    if (/single barrel/i.test(name)) attributes.push('single barrel');
    if (/small batch/i.test(name)) attributes.push('small batch');
    if (/cask strength/i.test(name)) attributes.push('cask strength');
    if (/bottled in bond/i.test(name)) attributes.push('bottled in bond');
    if (/limited edition/i.test(name)) attributes.push('limited edition');
    
    // Combine into a natural description
    if (attributes.length > 2) {
      const description = `${attributes[0]} is a ${attributes.slice(1).join(', ')}.`;
      return description;
    }
    
    return '';
  }

  /**
   * Extract from meta descriptions with validation
   */
  private extractFromMetaDescriptions(results: any[], name: string, brand?: string): string {
    const nameLower = name.toLowerCase();
    const brandLower = (brand || '').toLowerCase();
    
    for (const result of results) {
      // Check various meta fields
      const metaFields = [
        result.metaDescription,
        result.metadata?.description,
        result.metadata?.ogDescription,
        result.pageDescription
      ];
      
      for (const field of metaFields) {
        if (field && field.length > 30) {
          const cleaned = this.cleanText(field);
          const cleanedLower = cleaned.toLowerCase();
          
          // Must mention the product or brand
          if ((nameLower && cleanedLower.includes(nameLower.substring(0, 10))) ||
              (brandLower && cleanedLower.includes(brandLower))) {
            
            // Validate it's product-focused
            if (TextProcessor.isValidProductDescription(cleaned)) {
              return cleaned;
            }
          }
        }
      }
    }
    
    return '';
  }

  /**
   * Create minimal description from available data
   */
  private createMinimalDescription(results: any[], name: string, brand?: string): string {
    const parts: string[] = [];
    
    // Add product name with brand
    const fullName = brand ? `${brand} ${name}` : name;
    parts.push(fullName);
    
    // Try to add at least one fact
    const abv = this.findConsensusABV(results);
    const proof = this.findProof(results);
    const price = this.findPrice(results);
    const volume = this.findVolume(results);
    
    if (proof) {
      parts.push(`at ${proof} proof`);
    } else if (abv) {
      parts.push(`at ${abv}% ABV`);
    }
    
    if (volume && volume !== '750ml') {
      parts.push(`(${volume})`);
    }
    
    // Add type if we can determine it
    const typeResult = detectSpiritType(name, brand || '', '');
    if (typeResult.type !== 'Other' && typeResult.type !== 'Spirit') {
      parts.push(`- a ${typeResult.type.toLowerCase()}`);
    }
    
    // Create a simple sentence
    if (parts.length > 1) {
      return parts.join(' ') + '.';
    }
    
    return '';
  }

  /**
   * Clean text helper
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\.\.\./g, '.')
      .replace(/\s*\|\s*/g, '. ')
      .replace(/([.!?])\1+/g, '$1')
      .trim();
  }
  
  /**
   * V2.9: Validate if URL is likely a product page (Enhanced with database analysis)
   */
  private isValidProductUrl(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    
    // V2.9: Use the comprehensive non-product URL patterns
    const urlCheck = isNonProductUrl(url);
    if (urlCheck.isNonProduct) {
      logger.debug(`Rejecting URL (${urlCheck.category}): ${url}`);
      return false;
    }
    
    // V2.9: Additional specific invalid patterns from database analysis
    const additionalInvalidPatterns = [
      // Podcast platforms
      'podcasts.apple.com', 'spotify.com/show', 'podcasts.google.com',
      // Social media
      'instagram.com', 'facebook.com', 'twitter.com', 'pinterest.com',
      // Recipe sites
      '/recipe', '/recipes', '/cocktail', '/cocktails', '/how-to-make',
      // Forum/discussion
      'reddit.com', '/forum', '/forums', '/discussion', '/thread',
      // News/blog
      '/blog', '/news', '/article', '/articles', '/press',
      // Navigation pages
      '/sitemap', '/about', '/contact', '/terms', '/privacy',
      // Non-specific patterns that indicate non-product pages
      '/gift-guide', '/father-day', '/mother-day', '/holiday',
      '/events', '/tours', '/experience', '/visit',
    ];
    
    for (const pattern of additionalInvalidPatterns) {
      if (lowerUrl.includes(pattern)) {
        logger.debug(`Rejecting URL (additional pattern): ${url}`);
        return false;
      }
    }
    
    // Accept URLs that look like product pages
    const validPatterns = [
      '/product/', '/products/', '/item/', '/spirits/',
      '/bourbon/', '/whiskey/', '/whisky/', '/rum/', '/gin/', '/vodka/', '/tequila/',
      '/cognac/', '/brandy/', '/scotch/', '/irish-whiskey/',
      // Common product ID patterns
      /\/[a-z0-9-]+-\d{3,}/, // slug-123 pattern
      /\/\d{5,}/, // numeric product ID
      /\/[a-z0-9]{8,}$/, // alphanumeric product ID at end
      // Specific product indicators
      /\/(750ml|1l|liter|bottle)/,
      /\/proof-\d+/, // proof-86 pattern
      /\/age-\d+/, // age-12 pattern
    ];
    
    for (const pattern of validPatterns) {
      if (pattern instanceof RegExp) {
        if (pattern.test(lowerUrl)) {
          logger.debug(`Accepting URL (valid pattern): ${url}`);
          return true;
        }
      } else if (lowerUrl.includes(pattern)) {
        logger.debug(`Accepting URL (valid pattern): ${url}`);
        return true;
      }
    }
    
    // V2.9: Be more restrictive - default to false if no patterns match
    // This prevents scraping ambiguous URLs that might be non-product pages
    logger.debug(`Rejecting URL (no valid patterns matched): ${url}`);
    return false;
  }

}

// Singleton instance
export const spiritExtractor = new SpiritExtractor();