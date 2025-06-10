import * as cheerio from 'cheerio';
import axios from 'axios';
import { GoogleSearchResult } from '../types/index.js';
import { cacheService } from './cache-service.js';
import { logger } from '../utils/logger.js';

export interface ParsedContent {
  title: string;
  description: string;
  price?: string;
  abv?: number;
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

      // Try to extract price
      const priceMatch = this.extractPrice(
        meta['product:price:amount'] ||
        meta['price'] ||
        result.snippet,
      );
      if (priceMatch) {
        parsed.price = priceMatch;
      }
    }

    // Always try to extract price from snippet if not found in metadata
    if (!parsed.price) {
      const priceFromSnippet = this.extractPrice(result.snippet);
      if (priceFromSnippet) {
        parsed.price = priceFromSnippet;
      }
    }

    // Extract ABV from snippet
    const abvMatch = this.extractABV(result.snippet);
    if (abvMatch) {
      parsed.abv = abvMatch;
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

      // Extract price
      const priceSelectors = [
        '.price', '.product-price', '.cost',
        '[itemprop="price"]', '[data-price]',
        '.price-tag', '.price-now',
      ];

      for (const selector of priceSelectors) {
        const priceText = $(selector).first().text();
        const price = this.extractPrice(priceText);
        if (price) {
          parsed.price = price;
          break;
        }
      }

      // Extract ABV
      const bodyText = $('body').text();
      const abv = this.extractABV(bodyText);
      if (abv) {
        parsed.abv = abv;
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
   * Extract price from text with enhanced patterns
   */
  private extractPrice(text: string): string | null {
    if (!text) return null;

    // Clean the text
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // Enhanced price patterns
    const patterns = [
      // Standard currency patterns
      /\$\s*(\d+(?:\.\d{2})?)/,
      /USD\s*(\d+(?:\.\d{2})?)/i,
      /€\s*(\d+(?:\.\d{2})?)/,
      /£\s*(\d+(?:\.\d{2})?)/,
      /(\d+(?:\.\d{2})?)\s*(?:USD|EUR|GBP)/i,
      // Patterns with words
      /price:?\s*\$?(\d+(?:\.\d{2})?)/i,
      /(?:was|now|sale|regular|msrp|srp):?\s*\$?(\d+(?:\.\d{2})?)/i,
      // Handle prices without decimal points
      /\$\s*(\d{4,5})(?!\d)/,  // e.g., $2999 -> 29.99
    ];

    for (const pattern of patterns) {
      const match = cleanText.match(pattern);
      if (match) {
        let value = parseFloat(match[1]);
        
        // Handle 4-5 digit prices without decimals
        if (value >= 1000 && value < 100000) {
          // Check if it's likely missing a decimal
          const strValue = match[1];
          if (!strValue.includes('.')) {
            // Convert 2999 to 29.99, 14995 to 149.95
            value = value / 100;
          }
        }
        
        // Sanity check - spirits typically cost between $10 and $10,000
        if (value >= 10 && value <= 10000) {
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

}

// Singleton instance
export const contentParser = new ContentParser();