import { logger } from '../utils/logger';

export class EnhancedPriceExtractor {
  /**
   * Extract price with context awareness and validation
   */
  static extractPrice(input: any, context?: string): number | undefined {
    if (!input) return undefined;
    
    // If already a number, validate it's a reasonable price
    if (typeof input === 'number') {
      return this.isReasonablePrice(input) ? input : undefined;
    }
    
    const str = input.toString();
    
    // Skip if context suggests this is not a price
    if (context && this.isNonPriceContext(context)) {
      return undefined;
    }
    
    // Try structured price extraction first
    const structuredPrice = this.extractStructuredPrice(str);
    if (structuredPrice) return structuredPrice;
    
    // Try pattern-based extraction
    const patternPrice = this.extractPriceFromPatterns(str);
    if (patternPrice) return patternPrice;
    
    return undefined;
  }

  /**
   * Extract price from snippet with enhanced patterns
   */
  static extractPriceFromSnippet(snippet: string, volumeHint?: string): number | undefined {
    if (!snippet) return undefined;
    
    // Enhanced price patterns in order of reliability
    const patterns = [
      // Price with clear markers
      /(?:price|msrp|our\s+price|sale|now):\s*\$?([\d,]+\.?\d*)/i,
      
      // Price after volume (most reliable for spirits)
      /\d+ml\s*[.-]*\s*\$?([\d,]+\.?\d*)/i,
      /\d+\s*liter\s*[.-]*\s*\$?([\d,]+\.?\d*)/i,
      
      // Price with currency symbol
      /\$\s*([\d,]+\.?\d{0,2})(?:\s|$|[^\d])/,
      /USD\s*([\d,]+\.?\d{0,2})/i,
      
      // Price in common formats
      /(?:^|\s)([\d,]+\.99)(?:\s|$)/,
      /(?:^|\s)([\d,]+\.95)(?:\s|$)/,
      /(?:^|\s)([\d,]+\.00)(?:\s|$)/
    ];
    
    // Extract all potential prices
    const potentialPrices: number[] = [];
    
    for (const pattern of patterns) {
      const matches = snippet.matchAll(new RegExp(pattern, 'g'));
      for (const match of matches) {
        const price = this.parsePrice(match[1]);
        if (price && this.isReasonablePrice(price)) {
          potentialPrices.push(price);
        }
      }
    }
    
    // If volume hint provided, prefer prices after that volume
    if (volumeHint && potentialPrices.length > 1) {
      const volumePattern = new RegExp(`${volumeHint}[^$]*\\$([\d,]+\\.?\\d*)`, 'i');
      const volumeMatch = snippet.match(volumePattern);
      if (volumeMatch) {
        const price = this.parsePrice(volumeMatch[1]);
        if (price && this.isReasonablePrice(price)) {
          return price;
        }
      }
    }
    
    // Return the first reasonable price found
    return potentialPrices[0];
  }

  /**
   * Extract price from structured data fields
   */
  static extractFromStructuredData(pagemap: any): number | undefined {
    if (!pagemap) return undefined;
    
    // Check product structured data
    if (pagemap.product) {
      const products = Array.isArray(pagemap.product) ? pagemap.product : [pagemap.product];
      for (const product of products) {
        // Try various price fields
        const priceFields = [
          product.offers?.price,
          product.offers?.lowPrice,
          product.offers?.highPrice,
          product.price,
          product.offers?.[0]?.price,
          product.offers?.[0]?.lowPrice
        ];
        
        for (const field of priceFields) {
          const price = this.extractPrice(field);
          if (price) return price;
        }
      }
    }
    
    // Check offer structured data
    if (pagemap.offer) {
      const offers = Array.isArray(pagemap.offer) ? pagemap.offer : [pagemap.offer];
      for (const offer of offers) {
        const price = this.extractPrice(offer.price || offer.pricecurrency);
        if (price) return price;
      }
    }
    
    // Check metatags
    if (pagemap.metatags?.[0]) {
      const meta = pagemap.metatags[0];
      const priceFields = [
        meta['product:price:amount'],
        meta['product:price'],
        meta['og:price:amount'],
        meta['og:price'],
        meta['price']
      ];
      
      for (const field of priceFields) {
        const price = this.extractPrice(field);
        if (price) return price;
      }
    }
    
    return undefined;
  }

  /**
   * Check if context suggests non-price number
   */
  private static isNonPriceContext(context: string): boolean {
    const nonPriceIndicators = [
      'ml', 'liter', 'year', 'aged', 'proof', 'abv',
      'rating', 'score', 'points', 'stars', 'reviews',
      'sku', 'item', 'product code', 'batch'
    ];
    
    const lowerContext = context.toLowerCase();
    return nonPriceIndicators.some(indicator => lowerContext.includes(indicator));
  }

  /**
   * Extract price from structured format
   */
  private static extractStructuredPrice(str: string): number | undefined {
    // Handle structured price formats
    if (str.includes('USD')) {
      const match = str.match(/USD\s*([\d,]+\.?\d*)/);
      if (match) {
        const price = this.parsePrice(match[1]);
        if (this.isReasonablePrice(price)) return price;
      }
    }
    
    // Handle price with currency code
    const currencyMatch = str.match(/^([\d,]+\.?\d*)\s*USD/);
    if (currencyMatch) {
      const price = this.parsePrice(currencyMatch[1]);
      if (this.isReasonablePrice(price)) return price;
    }
    
    return undefined;
  }

  /**
   * Extract price using patterns
   */
  private static extractPriceFromPatterns(str: string): number | undefined {
    // Simple price patterns
    const patterns = [
      /^\$?([\d,]+\.?\d*)$/,  // Just a price
      /\$\s*([\d,]+\.?\d*)/,   // Price with dollar sign
      /^([\d,]+\.?\d*)$/       // Just numbers
    ];
    
    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match) {
        const price = this.parsePrice(match[1]);
        if (this.isReasonablePrice(price)) {
          return price;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Parse price string to number
   */
  private static parsePrice(priceStr: string): number | null {
    if (!priceStr) return null;
    
    // Remove commas and spaces
    const cleaned = priceStr.replace(/[,\s]/g, '');
    const price = parseFloat(cleaned);
    
    return isNaN(price) ? null : price;
  }

  /**
   * Check if price is in reasonable range for spirits
   */
  private static isReasonablePrice(price: number): boolean {
    // Spirits typically range from $5 to $10,000
    // Most are between $10 and $500
    return price >= 5 && price <= 10000;
  }

  /**
   * Extract multiple prices from text (for comparison)
   */
  static extractAllPrices(text: string): Array<{ price: number; context: string }> {
    const prices: Array<{ price: number; context: string }> = [];
    
    // Find all price patterns with context
    const pricePattern = /([^.]*?)\$\s*([\d,]+\.?\d*)([^.]*)/g;
    const matches = text.matchAll(pricePattern);
    
    for (const match of matches) {
      const price = this.parsePrice(match[2]);
      if (price && this.isReasonablePrice(price)) {
        const context = match[1].slice(-30) + '$' + match[2] + match[3].slice(0, 30);
        prices.push({ price, context: context.trim() });
      }
    }
    
    return prices;
  }

  /**
   * Currency conversion helper
   */
  static convertCurrency(price: number, fromCurrency: string): number {
    const rates: Record<string, number> = {
      'GBP': 1.27,
      'EUR': 1.08,
      'CAD': 0.74,
      'AUD': 0.66
    };
    
    const rate = rates[fromCurrency.toUpperCase()];
    return rate ? price * rate : price;
  }
}

// Export for testing
export default EnhancedPriceExtractor;