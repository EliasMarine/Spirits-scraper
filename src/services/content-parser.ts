import * as cheerio from 'cheerio';
import axios from 'axios';
import { GoogleSearchResult } from '../types/index.js';
import { cacheService } from './cache-service.js';
import { logger } from '../utils/logger.js';
import EnhancedPriceExtractor from './enhanced-price-extractor.js';

export interface ParsedContent {
  title: string;
  description: string;
  price?: string;
  abv?: number;
  proof?: number;
  volume?: string;
  category?: string;
  brand?: string;
  origin?: string;
  images: string[];
  metadata: Record<string, string>;
}

export class ContentParser {
  /**
   * Parse content from Google Search results without fetching the actual page
   */
  parseSearchResult(result: GoogleSearchResult): Partial<ParsedContent> {
    const parsed: Partial<ParsedContent> = {
      title: this.cleanText(result.title),
      description: this.filterReviewFragments(this.cleanText(result.snippet)),
      images: [],
      metadata: {},
    };

    // Extract images from pagemap
    if (result.pagemap?.cse_image?.[0]?.src) {
      parsed.images!.push(result.pagemap.cse_image[0].src);
    }

    // Extract metadata from pagemap
    if (result.pagemap?.metatags?.[0]) {
      const meta = result.pagemap.metatags[0];

      // Common metadata fields
      parsed.metadata = {
        ogTitle: meta['og:title'] || '',
        ogDescription: meta['og:description'] || '',
        ogImage: meta['og:image'] || '',
        price: meta['product:price:amount'] || meta['price'] || '',
        availability: meta['product:availability'] || '',
        brand: meta['product:brand'] || meta['brand'] || '',
      };

      // V2.9.1: ULTRATHINK - Enhanced price extraction with comprehensive meta source strategy
      let priceMatch = null;
      
      // Strategy 1: Structured product price meta tags (highest priority)
      const structuredPriceFields = [
        'product:price:amount',
        'product:price:value', 
        'og:price:amount',
        'twitter:label1',  // Often used for price
        'twitter:data1',   // Price value
      ];
      
      for (const field of structuredPriceFields) {
        if (meta[field] && !priceMatch) {
          priceMatch = this.extractPrice(meta[field]);
        }
      }
      
      // Strategy 2: Generic price meta tags
      const genericPriceFields = [
        'price',
        'product:price',
        'og:price',
        'item-price',
        'retail-price',
      ];
      
      for (const field of genericPriceFields) {
        if (meta[field] && !priceMatch) {
          priceMatch = this.extractPrice(meta[field]);
        }
      }
      
      // Strategy 3: E-commerce platform specific tags
      const ecommercePriceFields = [
        'shopify-price',
        'woocommerce-price', 
        'magento-price',
        'price-current',
        'price-regular',
        'sale-price',
      ];
      
      for (const field of ecommercePriceFields) {
        if (meta[field] && !priceMatch) {
          priceMatch = this.extractPrice(meta[field]);
        }
      }
      
      // Strategy 4: Try snippet with enhanced patterns
      if (!priceMatch) {
        priceMatch = this.extractPriceAdvanced(result.snippet);
      }
      
      if (priceMatch) {
        parsed.price = priceMatch;
      }
    }

    // V2.8: Always try to extract price from snippet and title if not found in metadata
    if (!parsed.price) {
      // Try snippet first
      const priceFromSnippet = this.extractPrice(result.snippet);
      if (priceFromSnippet) {
        parsed.price = priceFromSnippet;
      } else {
        // Try title as fallback
        const priceFromTitle = this.extractPrice(result.title);
        if (priceFromTitle) {
          parsed.price = priceFromTitle;
        }
      }
    }
    
    // V3.1.3: Final fallback - use enhanced price extractor with retry
    if (!parsed.price && (result.snippet || result.htmlSnippet)) {
      const enhancedPrice = EnhancedPriceExtractor.extractPriceWithRetry(
        result.htmlSnippet || result.snippet, 
        result.link
      );
      if (enhancedPrice) {
        parsed.price = enhancedPrice.toString();
        logger.info(`💰 V3.1.3: Enhanced price extraction found $${enhancedPrice}`);
      }
    }

    // Extract ABV from snippet
    const abvMatch = this.extractABV(result.snippet);
    if (abvMatch) {
      parsed.abv = abvMatch;
    }

    // Extract proof from snippet
    const proofMatch = this.extractProof(result.snippet);
    if (proofMatch) {
      parsed.proof = proofMatch;
    }

    // Extract volume from snippet
    const volumeMatch = this.extractVolume(result.snippet);
    if (volumeMatch) {
      parsed.volume = volumeMatch;
    }

    return parsed;
  }

  /**
   * Fetch and parse content from a URL
   */
  async parseUrl(url: string): Promise<ParsedContent | null> {
    try {
      // Initialize cache service
      await cacheService.initialize();
      
      // Check cache first
      const cachedContent = await cacheService.getCachedUrlContent(url);
      if (cachedContent) {
        logger.info(`Cache hit for URL: ${url}`);
        return cachedContent;
      }
      
      logger.info(`Cache miss for URL: ${url} - fetching content`);
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Spirits-Scraper/1.0)',
        },
      });

      const $ = cheerio.load(response.data);

      const parsed: ParsedContent = {
        title: '',
        description: '',
        images: [],
        metadata: {},
      };

      // Extract title
      parsed.title = this.cleanText(
        $('h1').first().text() ||
        $('title').text() ||
        $('meta[property="og:title"]').attr('content') || '',
      );

      // Extract description
      const rawDescription = this.cleanText(
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        $('p').first().text() || '',
      );
      parsed.description = this.filterReviewFragments(rawDescription);

      // V2.9: Enhanced price extraction with more selectors and structured data
      
      // First try to extract from structured data (JSON-LD)
      const structuredPrice = this.extractFromJsonLd($);
      if (structuredPrice && structuredPrice.price) {
        parsed.price = structuredPrice.price;
      }
      
      // If no structured data price, try meta tags
      if (!parsed.price) {
        const metaPrice = this.extractFromMetaTags($);
        if (metaPrice) {
          parsed.price = metaPrice;
        }
      }
      
      // If still no price, try comprehensive CSS selector strategy
      if (!parsed.price) {
        // V2.9.1: ULTRATHINK - Comprehensive CSS selector strategy 
        const priceSelectors = [
          // High priority selectors (most specific)
          '[itemprop="price"]', '[data-price]', '[data-cost]',
          '.price', '.product-price', '.item-price',
          
          // E-commerce platform specific
          '.price-current', '.price-now', '.current-price',
          '.sale-price', '.regular-price', '.list-price',
          '.retail-price', '.msrp', '.srp',
          
          // Container/wrapper selectors
          '.price-box', '.price-container', '.price-wrapper',
          '.price-section', '.pricing', '.price-area',
          
          // Value/amount selectors
          '.price-value', '.price-amount', '.amount',
          '.cost', '.cost-amount', '.product-cost',
          
          // Display/format selectors
          '.price-display', '.price-final', '.price-total',
          '.price-tag', '.price-label', '.price-text',
          
          // Action-specific selectors
          '.add-to-cart-price', '.buy-now-price', '.checkout-price',
          '.cart-price', '.order-price',
          
          // Unit/bottle specific
          '.price-per-bottle', '.unit-price', '.bottle-price',
          '.per-unit', '.each-price',
          
          // Industry specific selectors
          '.wine-price', '.spirit-price', '.whiskey-price',
          '.liquor-price', '.bottle-cost', '.spirit-cost',
          
          // Generic attribute selectors
          '[class*="price"]', '[id*="price"]',
          '[class*="cost"]', '[id*="cost"]',
          '[data-testid*="price"]', '[data-qa*="price"]',
          '[data-test*="price"]',
          
          // CSS class variations
          '.Price', '.PRICE', // Case variations
          '.price_current', '.price-current', // Underscore variations
          '.priceNow', '.priceRegular', '.priceSale', // CamelCase
          
          // Last resort generic selectors
          '.money', '.currency', '.dollar', '.usd',
          '.cost-value', '.amount-value', '.price-info',
        ];

        for (const selector of priceSelectors) {
          const element = $(selector).first();
          if (element.length > 0) {
            // Try content attribute first, then text
            const priceText = element.attr('content') || 
                             element.attr('data-price') || 
                             element.attr('data-cost') ||
                             element.text();
            
            if (priceText) {
              const price = this.extractPriceAdvanced(priceText);
              if (price) {
                parsed.price = price;
                break;
              }
            }
          }
        }
      }

      // Extract ABV
      const bodyText = $('body').text();
      const abv = this.extractABV(bodyText);
      if (abv) {
        parsed.abv = abv;
      }

      // Extract proof
      const proof = this.extractProof(bodyText);
      if (proof) {
        parsed.proof = proof;
      }

      // Extract volume
      const volume = this.extractVolume(bodyText);
      if (volume) {
        parsed.volume = volume;
      }

      // Extract images
      $('img').each((_, elem) => {
        const src = $(elem).attr('src') || $(elem).attr('data-src');
        if (src && this.isValidImageUrl(src, url)) {
          parsed.images.push(this.resolveUrl(src, url));
        }
      });

      // Extract structured data
      $('script[type="application/ld+json"]').each((_, elem) => {
        try {
          const jsonLd = JSON.parse($(elem).text());
          if (jsonLd['@type'] === 'Product' || jsonLd['@type'] === 'Offer') {
            parsed.metadata.structuredData = jsonLd;

            // Extract specific fields
            if (jsonLd.name) parsed.title = jsonLd.name;
            if (jsonLd.description) parsed.description = jsonLd.description;
            if (jsonLd.offers?.price) parsed.price = `$${jsonLd.offers.price}`;
            if (jsonLd.brand?.name) parsed.brand = jsonLd.brand.name;
            if (jsonLd.image) {
              const images = Array.isArray(jsonLd.image) ? jsonLd.image : [jsonLd.image];
              parsed.images.push(...images);
            }
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      });

      // Extract Open Graph metadata
      $('meta[property^="og:"]').each((_, elem) => {
        const property = $(elem).attr('property')?.replace('og:', '');
        const content = $(elem).attr('content');
        if (property && content) {
          parsed.metadata[property] = content;
        }
      });

      // Cache the parsed content before returning
      await cacheService.cacheUrlContent(url, parsed);
      logger.info(`Cached parsed content for URL: ${url}`);

      return parsed;
    } catch (error) {
      console.error(`Failed to parse URL ${url}:`, error);
      return null;
    }
  }

  /**
   * Extract ABV (Alcohol By Volume) from text
   */
  private extractABV(text: string): number | null {
    if (!text) return null;

    // Patterns for ABV extraction - highly specific to avoid mash bill percentages
    const patterns = [
      // Most specific patterns first
      /(\d+(?:\.\d+)?)\s*%\s*ABV\b/i,
      /\bABV\s*:?\s*(\d+(?:\.\d+)?)\s*%/i,
      /\bAlcohol\s*(?:by\s*volume\s*)?:?\s*(\d+(?:\.\d+)?)\s*%/i,
      /bottled\s*at\s*(\d+(?:\.\d+)?)\s*%\s*ABV/i,
      /(\d+(?:\.\d+)?)\s*%\s*alcohol\s*by\s*volume/i,
      /(\d+(?:\.\d+)?)\s*%\s*ALC\b/i,
      // Proof conversion - be very specific
      /(?:bottled\s*at\s*|proof\s*:?\s*)(\d+(?:\.\d+)?)\s*proof\b/i,
      /\b(\d+(?:\.\d+)?)\s*proof\b(?!\s*mash)/i, // Not followed by "mash"
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);

        // If it's proof, convert to ABV (US standard)
        if (pattern.toString().includes('Proof') && value > 0) {
          const abv = value / 2;
          // Validate converted ABV
          if (abv >= 20 && abv <= 80) {
            return abv;
          }
          continue;
        }

        // Validate ABV range for spirits
        if (value >= 20 && value <= 80) {
          // Skip values that are clearly mash bill percentages
          if (this.isProbablyMashBill(text, value)) {
            continue;
          }
          return value;
        }
        
        // Special case for lower ABV spirits (liqueurs, etc.)
        if (value >= 15 && value < 20) {
          return value;
        }
      }
    }

    return null;
  }

  /**
   * Check if a percentage is likely a mash bill component rather than ABV
   */
  private isProbablyMashBill(text: string, value: number): boolean {
    // Extract a window of text around the percentage for context
    const textLower = text.toLowerCase();
    const valueStr = value.toString();
    const valueIndex = textLower.indexOf(valueStr + '%');
    
    if (valueIndex !== -1) {
      // Get 50 characters before and after the percentage
      const start = Math.max(0, valueIndex - 50);
      const end = Math.min(textLower.length, valueIndex + valueStr.length + 50);
      const contextWindow = textLower.substring(start, end);
      
      // Check for mash bill keywords in the context window
      const mashBillKeywords = /\b(corn|rye|wheat|barley|malt|mash\s*bill|grain|mashbill)\b/i;
      if (mashBillKeywords.test(contextWindow)) {
        return true;
      }
    }
    
    // Values typically used in mash bills but not ABV
    const definitelyMashBillValues = [51, 60, 70, 72, 75, 80, 95];
    if (definitelyMashBillValues.includes(Math.floor(value))) {
      return true;
    }
    
    // If the value is in a sequence (like "72% Corn 22% Rye 5% Barley")
    if (/\d+%.*\d+%.*\d+%/i.test(text)) {
      return true;
    }
    
    return false;
  }

  /**
   * Extract proof value from text (without converting to ABV)
   */
  private extractProof(text: string): number | null {
    if (!text) return null;

    // Patterns for proof extraction - specific to avoid false positives
    const patterns = [
      /(\d+(?:\.\d+)?)\s*proof\b/i,
      /\bproof\s*:?\s*(\d+(?:\.\d+)?)\b/i,
      /bottled\s*at\s*(\d+(?:\.\d+)?)\s*proof/i,
      /\b(\d+(?:\.\d+)?)\s*°\s*proof/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        
        // Validate proof range (typically 40-200 for spirits)
        if (value >= 40 && value <= 200) {
          // Skip if it's likely a mash bill percentage
          if (this.isProbablyMashBill(text, value)) {
            continue;
          }
          return value;
        }
      }
    }

    return null;
  }

  /**
   * V2.9.1: ULTRATHINK - Advanced price extraction with comprehensive patterns
   */
  private extractPriceAdvanced(text: string): string | null {
    if (!text) return null;

    // Clean the text
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // V2.9.1: Enhanced disqualification patterns
    const disqualifyingPatterns = [
      // Years (but allow in price context)
      /\b(19\d{2}|20\d{2})\b(?!.*(?:\$|price|cost|usd|eur|gbp))/i,
      // Age statements
      /\b\d+\s*(year|yr|age)\s*old\b/i,
      // Proof values
      /\b\d+\s*(?:proof|°\s*proof)\b/i,
      // Batch/lot numbers
      /\bbatch\s*#?\s*\d+/i,
      /\blot\s*#?\s*\d+/i,
      // ABV percentages
      /\b\d+(?:\.\d+)?\s*%\s*(?:abv|alc)/i,
      // Volume measurements
      /\b\d+\s*(?:ml|cl|L|liter|litre)\b/i,
      // Ratings and scores
      /\b\d+\s*(?:points?|stars?|rating)\b/i,
      /\b\d+\/\d+\b/, // X/Y ratings
    ];

    // Check for disqualifying patterns
    for (const pattern of disqualifyingPatterns) {
      if (pattern.test(cleanText)) {
        return null;
      }
    }

    // V2.9.1: Comprehensive price extraction patterns
    const patterns = [
      // Currency symbols with amounts (highest priority)
      /\$\s*(\d{1,4}(?:\.\d{2})?)\b/,
      /USD\s*(\d{1,4}(?:\.\d{2})?)\b/i,
      /€\s*(\d{1,4}(?:\.\d{2})?)\b/,
      /£\s*(\d{1,4}(?:\.\d{2})?)\b/,
      /(\d{1,4}(?:\.\d{2})?)\s*(?:USD|EUR|GBP|dollars?)\b/i,
      
      // Explicit price context patterns
      /\b(?:price|cost|retail|msrp|srp)\s*:?\s*\$?(\d{1,4}(?:\.\d{2})?)\b/i,
      /\b(?:was|now|sale|regular|list)\s*:?\s*\$?(\d{1,4}(?:\.\d{2})?)\b/i,
      /\b(?:starting|from)\s+\$?(\d{1,4}(?:\.\d{2})?)\b/i,
      
      // E-commerce action patterns
      /\b(?:buy|purchase|order)\s+(?:for|at)?\s*\$?(\d{1,4}(?:\.\d{2})?)\b/i,
      /\b(?:add\s+to\s+cart|buy\s+now).*?\$?(\d{1,4}(?:\.\d{2})?)\b/i,
      /\$?(\d{1,4}(?:\.\d{2})?)\s+(?:add\s+to\s+cart|buy\s+now)/i,
      
      // Structured data patterns
      /"?price"?\s*:\s*"?\$?(\d{1,4}(?:\.\d{2})?)/i,
      /"?amount"?\s*:\s*"?(\d{1,4}(?:\.\d{2})?)/i,
      
      // Range patterns (extract lower price)
      /\$?(\d{1,4}(?:\.\d{2})?)\s*[-–—]\s*\$?\d{1,4}(?:\.\d{2})?/,
      /\bbetween\s+\$?(\d{1,4}(?:\.\d{2})?)\s+(?:and|to)/i,
      
      // Simple amount patterns (with validation)
      /\b(\d{2,3})\.\d{2}\b/,  // XX.XX or XXX.XX patterns
      /\$(\d{2,4})\b/,  // Simple dollar amounts
      
      // Context-specific patterns
      /\b(?:bottle|each|per\s+bottle)\s*:?\s*\$?(\d{1,4}(?:\.\d{2})?)\b/i,
      /\$?(\d{1,4}(?:\.\d{2})?)\s+(?:per\s+bottle|each)\b/i,
      
      // Wine/spirit specific patterns
      /\b(?:750ml|1L|liter)\s+(?:for|at|costs?)\s*\$?(\d{1,4}(?:\.\d{2})?)\b/i,
      /\b(?:priced|pricing)\s+at\s*\$?(\d{1,4}(?:\.\d{2})?)\b/i,
    ];

    for (const pattern of patterns) {
      const match = cleanText.match(pattern);
      if (match) {
        let value = parseFloat(match[1]);
        
        // Handle large integers as cents (e.g., 2999 -> 29.99)
        if (value >= 1000 && value < 100000 && !match[1].includes('.')) {
          value = value / 100;
        }
        
        // Validate price range for spirits (more permissive for V2.9.1)
        if (value >= 3 && value <= 8000) {
          // Additional validation: avoid common false positives
          const invalidPrices = [
            // Years
            ...Array.from({length: 50}, (_, i) => 1975 + i),
            // Common ages 
            ...Array.from({length: 49}, (_, i) => 2 + i),
            // Common proof values
            ...Array.from({length: 100}, (_, i) => 70 + i),
            // Bottle sizes
            375, 500, 700, 750, 1000, 1500, 1750,
            // Common batch/lot numbers
            ...Array.from({length: 50}, (_, i) => 100 + i),
          ];
          
          // Allow the price if it doesn't match common false positives
          if (!invalidPrices.includes(Math.round(value))) {
            return `$${value.toFixed(2)}`;
          }
        }
      }
    }

    return null;
  }

  /**
   * Extract price from text with enhanced patterns - FIXED to avoid years/ages/proof
   */
  private extractPrice(text: string): string | null {
    if (!text) return null;

    // Clean the text
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // CRITICAL: Skip text that contains years, ages, or proof values
    // This prevents extracting "1993" from "1993 Buffalo Trace" as a price
    if (/\b(19\d{2}|20\d{2})\b/.test(cleanText)) {
      // Contains a year - check if it's part of a price context
      if (!/(\$|price|cost|usd|eur|gbp)/i.test(cleanText)) {
        return null; // Year without price context, skip
      }
    }

    // Skip if contains age statements
    if (/\b\d+\s*(year|yr|age)\b/i.test(cleanText)) {
      return null;
    }

    // Skip if contains proof values
    if (/\b\d+\s*proof\b/i.test(cleanText)) {
      return null;
    }

    // Skip if contains batch numbers
    if (/\bbatch\s*#?\s*\d+/i.test(cleanText)) {
      return null;
    }

    // V2.8: Enhanced price patterns - more comprehensive extraction
    const patterns = [
      // Standard currency patterns with explicit currency symbols
      /\$\s*(\d+(?:\.\d{2})?)\b/,
      /USD\s*(\d+(?:\.\d{2})?)\b/i,
      /€\s*(\d+(?:\.\d{2})?)\b/,
      /£\s*(\d+(?:\.\d{2})?)\b/,
      /(\d+(?:\.\d{2})?)\s*(?:USD|EUR|GBP)\b/i,
      // Patterns with explicit price context
      /\bprice:?\s*\$?(\d+(?:\.\d{2})?)\b/i,
      /\b(?:cost|retail|msrp|srp):?\s*\$?(\d+(?:\.\d{2})?)\b/i,
      /\b(?:was|now|sale|regular):?\s*\$(\d+(?:\.\d{2})?)\b/i,
      // Structured product price data
      /\bproduct:price:amount["\s]*(\d+(?:\.\d{2})?)/i,
      // V2.8: Additional patterns based on real data
      /\$(\d{2,4})\b/,  // Simple dollar amounts
      /\b(\d{2,3})\.\d{2}\b/,  // XX.XX or XXX.XX patterns
      /\bfor\s+\$(\d+(?:\.\d{2})?)/i,  // "for $XX"
      /\bat\s+\$(\d+(?:\.\d{2})?)/i,   // "at $XX"
      /\bonly\s+\$(\d+(?:\.\d{2})?)/i, // "only $XX"
      /\bbuy\s+(?:for|at)\s+\$(\d+(?:\.\d{2})?)/i, // "buy for/at $XX"
      /\b(\d{2,3})(?:\s*\$|\s*dollars?)/i,  // "XX $" or "XX dollars"
      // Spirit-specific price patterns
      /\b(?:bottle|750ml|1L|liter)\s+(?:for|at|costs?)\s+\$?(\d+(?:\.\d{2})?)/i,
      /\b(?:priced|pricing)\s+at\s+\$?(\d+(?:\.\d{2})?)/i,
    ];

    for (const pattern of patterns) {
      const match = cleanText.match(pattern);
      if (match) {
        let value = parseFloat(match[1]);
        
        // Handle 4-5 digit prices without decimals (e.g., $2999 -> $29.99)
        if (value >= 1000 && value < 100000) {
          const strValue = match[1];
          if (!strValue.includes('.')) {
            value = value / 100;
          }
        }
        
        // STRICT validation - spirits typically cost between $5 and $5000
        if (value >= 5 && value <= 5000) {
          // Additional validation: avoid extracting years as prices
          const invalidValues = [
            // Years (1990-2025)
            ...Array.from({length: 36}, (_, i) => 1990 + i),
            // Common ages (2-30)
            ...Array.from({length: 29}, (_, i) => 2 + i),
            // Common proof values (80-150, incrementing by 2)
            ...Array.from({length: 36}, (_, i) => 80 + i * 2),
            // Bottle sizes
            375, 500, 700, 750, 1000, 1750,
            // Common batch numbers
            125, 126, 127, 128, 129, 130
          ];
          
          if (invalidValues.includes(Math.round(value))) {
            continue; // Skip this value, try next pattern
          }
          
          return `$${value.toFixed(2)}`;
        }
      }
    }

    return null;
  }

  /**
   * Extract volume from text
   */
  private extractVolume(text: string): string | null {
    if (!text) return null;

    // Volume patterns
    const patterns = [
      /(\d+(?:\.\d+)?)\s*ml\b/i,
      /(\d+(?:\.\d+)?)\s*mL\b/i,
      /(\d+(?:\.\d+)?)\s*liter/i,
      /(\d+(?:\.\d+)?)\s*litre/i,
      /(\d+(?:\.\d+)?)\s*L\b/,
      /(\d+)\s*cl\b/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let value = parseFloat(match[1]);
        let unit = pattern.toString().match(/ml|mL|liter|litre|L|cl/i)?.[0] || '';

        // Convert to ml for consistency
        if (unit.toLowerCase() === 'l' || unit.toLowerCase().includes('liter') || unit.toLowerCase().includes('litre')) {
          value = value * 1000;
          unit = 'ml';
        } else if (unit.toLowerCase() === 'cl') {
          value = value * 10;
          unit = 'ml';
        }

        // Common bottle sizes
        const commonSizes = [50, 100, 200, 375, 500, 700, 750, 1000, 1500, 1750, 3000];
        if (commonSizes.includes(value) || (value >= 50 && value <= 3000)) {
          return `${value}ml`;
        }
      }
    }

    return null;
  }

  /**
   * Clean and normalize text - remove HTML artifacts
   */
  private cleanText(text: string): string {
    let cleaned = text;
    
    // Remove HTML tags and attributes
    cleaned = cleaned
      // Remove span tags with data attributes
      .replace(/<span[^>]*data-mce-fragment[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')
      // Remove br tags with data attributes
      .replace(/<br[^>]*data-mce-fragment[^>]*>/gi, ' ')
      .replace(/<br[^>]*>/gi, ' ')
      // Remove any remaining HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Clean up HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&[a-z]+;/gi, ' ')
      // Clean up data attributes that leaked through
      .replace(/\bdata-mce-fragment["\s]*\d*["\s]*/gi, '')
      .replace(/\bspan\s+data-[^"]+"\d+"/gi, '')
      .replace(/\bbr\s+data-[^"]+"\d+"/gi, '')
      // Clean up any quotes around numbers
      .replace(/"(\d+)"/g, '$1')
      // Remove special characters except common ones
      .replace(/[^\w\s\-.,!?$%&()]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  }

  /**
   * Check if URL is a valid image
   */
  private isValidImageUrl(url: string, _baseUrl: string): boolean {
    if (!url) return false;

    // Skip data URLs and tiny images
    if (url.startsWith('data:')) return false;
    if (url.includes('1x1') || url.includes('pixel')) return false;

    // Check for image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasImageExtension = imageExtensions.some(ext =>
      url.toLowerCase().includes(ext),
    );

    // Check for image-related paths
    const hasImagePath = /\/(images?|img|pics?|photos?|products?)\//i.test(url);

    return hasImageExtension || hasImagePath;
  }

  /**
   * Resolve relative URLs to absolute
   */
  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    try {
      const base = new URL(baseUrl);
      if (url.startsWith('//')) {
        return `${base.protocol}${url}`;
      }
      if (url.startsWith('/')) {
        return `${base.origin}${url}`;
      }
      // Relative path
      const basePath = base.pathname.substring(0, base.pathname.lastIndexOf('/'));
      return `${base.origin}${basePath}/${url}`;
    } catch (e) {
      return url;
    }
  }

  /**
   * Filter out review fragments and personal anecdotes
   */
  private filterReviewFragments(text: string): string {
    if (!text) return '';
    
    // Patterns that indicate review/personal content
    const reviewPatterns = [
      // First person narratives
      /^(I |We |My |Our |Me )/i,
      /\b(I |We |My |Our |Me )\b.*?(love|hate|tried|bought|wanted|knew|had|think|feel|believe|recommend)/i,
      // Review indicators
      /^(When I |I've |I had |If you |You'll |Don't |Won't |Can't )/i,
      /\b(five stars|5 stars|4 stars|three stars|one star|\d+ out of \d+)/i,
      // Personal preferences
      /\b(my favorite|my go-to|I prefer|I like|I love|I hate)/i,
      // Date-based personal stories
      /^(\w+\s+\d{1,2},\s+\d{4})\s*\.\s*(I |We |My )/,
    ];
    
    // Check if text starts with a review pattern
    for (const pattern of reviewPatterns) {
      if (pattern.test(text)) {
        // Try to extract product info after the review
        const productMatch = text.match(/\.\s*([A-Z][^.]+(?:whiskey|bourbon|rum|vodka|gin|tequila)[^.]+)/i);
        if (productMatch) {
          return productMatch[1].trim();
        }
        
        // If no product info found, check if there's a sentence without personal pronouns
        const sentences = text.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (sentence.trim() && !/(\bI\b|\bWe\b|\bMy\b|\bOur\b|\bMe\b)/i.test(sentence)) {
            // Check if it contains product-related content
            if (/\b(aged|proof|abv|distilled|bourbon|whiskey|rum|vodka|notes|flavor|taste|aroma)/i.test(sentence)) {
              return sentence.trim();
            }
          }
        }
        
        // Last resort: return empty string for review content
        return '';
      }
    }
    
    // Filter out common non-product descriptions
    const skipPatterns = [
      /^(Buy|Shop|Order|Purchase|Free shipping|On sale|Limited time)/i,
      /^(Sign up|Login|Register|Subscribe|Join our)/i,
      /^(Click here|Learn more|Read more|View all|See details)/i,
    ];
    
    for (const pattern of skipPatterns) {
      if (pattern.test(text)) {
        return '';
      }
    }
    
    return text;
  }

  /**
   * Check if text contains valid product description
   */
  private isValidProductDescription(text: string): boolean {
    if (!text || text.length < 20) return false;
    
    // Must contain at least one product-related keyword
    const productKeywords = [
      'aged', 'proof', 'abv', 'alcohol', 'distilled', 'barrel', 'cask',
      'bourbon', 'whiskey', 'whisky', 'rum', 'vodka', 'gin', 'tequila',
      'notes', 'flavor', 'taste', 'aroma', 'palate', 'finish',
      'smooth', 'rich', 'complex', 'balanced'
    ];
    
    const hasProductKeyword = productKeywords.some(keyword => 
      new RegExp(`\\b${keyword}\\b`, 'i').test(text)
    );
    
    return hasProductKeyword;
  }

  /**
   * V2.9.1: ULTRATHINK - Enhanced JSON-LD structured data extraction
   */
  private extractFromJsonLd($: CheerioStatic): { price?: string; [key: string]: any } | null {
    let result: any = {};
    
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const jsonLd = JSON.parse($(elem).text());
        
        // Handle arrays of JSON-LD objects
        const objects = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
        
        for (const obj of objects) {
          // Product schema
          if (obj['@type'] === 'Product') {
            if (obj.name) result.name = obj.name;
            if (obj.brand?.name) result.brand = obj.brand.name;
            if (obj.description) result.description = obj.description;
            
            // Enhanced price extraction from offers
            if (obj.offers) {
              const offers = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
              
              // Primary price fields
              const priceFields = ['price', 'lowPrice', 'highPrice', 'minPrice', 'maxPrice'];
              
              for (const field of priceFields) {
                if (offers[field] && !result.price) {
                  const price = parseFloat(offers[field]);
                  if (price >= 3 && price <= 8000) {
                    result.price = this.formatPrice(price);
                    break;
                  }
                }
              }
              
              // Price range extraction
              if (!result.price && offers.priceRange) {
                const rangePatterns = [
                  /\$?(\d+(?:\.\d{2})?)\s*[-–—]\s*\$?\d+/,
                  /from\s+\$?(\d+(?:\.\d{2})?)/i,
                  /starting\s+at\s+\$?(\d+(?:\.\d{2})?)/i,
                ];
                
                for (const pattern of rangePatterns) {
                  const match = offers.priceRange.match(pattern);
                  if (match) {
                    const price = parseFloat(match[1]);
                    if (price >= 3 && price <= 8000) {
                      result.price = this.formatPrice(price);
                      break;
                    }
                  }
                }
              }
              
              // Additional offer properties
              if (offers.availability) result.availability = offers.availability;
              if (offers.priceCurrency) result.currency = offers.priceCurrency;
              if (offers.priceValidUntil) result.priceValidUntil = offers.priceValidUntil;
            }
            
            // Additional product properties
            if (obj.sku) result.sku = obj.sku;
            if (obj.gtin13 || obj.gtin12) result.gtin = obj.gtin13 || obj.gtin12;
            if (obj.mpn) result.mpn = obj.mpn;
            if (obj.model) result.model = obj.model;
            if (obj.category) result.category = obj.category;
            
            // Additional brand information
            if (obj.manufacturer?.name && !result.brand) {
              result.brand = obj.manufacturer.name;
            }
          }
          
          // Standalone Offer schema
          if (obj['@type'] === 'Offer') {
            const priceFields = ['price', 'lowPrice', 'highPrice', 'minPrice', 'maxPrice'];
            
            for (const field of priceFields) {
              if (obj[field] && !result.price) {
                const price = parseFloat(obj[field]);
                if (price >= 3 && price <= 8000) {
                  result.price = this.formatPrice(price);
                  break;
                }
              }
            }
            
            if (obj.priceCurrency) result.currency = obj.priceCurrency;
            if (obj.availability) result.availability = obj.availability;
          }
          
          // AggregateOffer schema (for products with multiple offers)
          if (obj['@type'] === 'AggregateOffer') {
            const priceFields = ['lowPrice', 'highPrice', 'minPrice', 'maxPrice'];
            
            for (const field of priceFields) {
              if (obj[field] && !result.price) {
                const price = parseFloat(obj[field]);
                if (price >= 3 && price <= 8000) {
                  result.price = this.formatPrice(price);
                  break;
                }
              }
            }
            
            if (obj.priceCurrency) result.currency = obj.priceCurrency;
            if (obj.offerCount) result.offerCount = obj.offerCount;
          }
        }
      } catch (e) {
        // Invalid JSON, continue to next script tag
      }
    });
    
    return Object.keys(result).length > 0 ? result : null;
  }

  /**
   * V2.9.1: ULTRATHINK - Comprehensive meta tag price extraction
   */
  private extractFromMetaTags($: CheerioStatic): string | null {
    // Comprehensive meta tag strategy
    const metaTagStrategies = [
      // High priority structured data
      { tags: ['product:price:amount', 'product:price:value'], priority: 1 },
      { tags: ['og:price:amount', 'og:price:value'], priority: 1 },
      
      // Medium priority e-commerce tags
      { tags: ['product:price', 'og:price', 'price'], priority: 2 },
      { tags: ['item-price', 'retail-price', 'list-price'], priority: 2 },
      
      // Social media price tags
      { tags: ['twitter:data1', 'twitter:label1'], priority: 3 },
      { tags: ['twitter:app:name:iphone', 'twitter:app:name:ipad'], priority: 3 },
      
      // Platform-specific price tags
      { tags: ['shopify:price', 'woocommerce:price'], priority: 2 },
      { tags: ['magento:price', 'prestashop:price'], priority: 2 },
      
      // Generic price indicators
      { tags: ['price-current', 'price-regular', 'sale-price'], priority: 4 },
      { tags: ['cost', 'amount', 'value'], priority: 5 },
    ];
    
    // Sort by priority and try extraction
    const sortedStrategies = metaTagStrategies.sort((a, b) => a.priority - b.priority);
    
    for (const strategy of sortedStrategies) {
      for (const tag of strategy.tags) {
        // Try both property and name attributes
        const content = $(`meta[property="${tag}"]`).attr('content') || 
                       $(`meta[name="${tag}"]`).attr('content') ||
                       $(`meta[itemprop="${tag}"]`).attr('content');
        
        if (content) {
          const price = this.extractPriceAdvanced(content);
          if (price) return price;
        }
      }
    }
    
    // Microdata extraction (comprehensive)
    const microdataSelectors = [
      '[itemprop="price"]',
      '[itemprop="lowPrice"]', 
      '[itemprop="highPrice"]',
      '[itemtype*="Product"] [itemprop="offers"] [itemprop="price"]',
      '[itemtype*="Offer"] [itemprop="price"]',
    ];
    
    for (const selector of microdataSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const content = element.attr('content') || element.text();
        if (content) {
          const price = this.extractPriceAdvanced(content);
          if (price) return price;
        }
      }
    }
    
    // Data attributes (last resort)
    const dataSelectors = [
      '[data-price]',
      '[data-cost]', 
      '[data-amount]',
      '[data-product-price]',
      '[data-regular-price]',
      '[data-sale-price]',
    ];
    
    for (const selector of dataSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const content = element.attr('data-price') || 
                       element.attr('data-cost') ||
                       element.attr('data-amount') ||
                       element.text();
        if (content) {
          const price = this.extractPriceAdvanced(content);
          if (price) return price;
        }
      }
    }
    
    return null;
  }

  /**
   * V2.9.1: ULTRATHINK - Enhanced price formatting with better validation
   */
  private formatPrice(value: number): string | null {
    // More permissive range for V2.9.1 to catch more valid prices
    if (value >= 3 && value <= 8000) {
      // Handle special cases
      if (value < 1) {
        return null; // Too low to be a real price
      }
      
      // Round to 2 decimal places
      return `$${value.toFixed(2)}`;
    }
    return null;
  }

}

// Singleton instance
export const contentParser = new ContentParser();