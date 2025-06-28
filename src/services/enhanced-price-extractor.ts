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
    
    // V3.1.3: Enhanced price patterns in order of reliability
    const patterns = [
      // Structured data patterns (highest priority)
      /"price":\s*"?(\d+\.?\d*)"?/i,
      /"offers".*?"price":\s*"?(\d+\.?\d*)"?/is,
      /itemprop="price"[^>]*content="(\d+\.?\d*)"/i,
      
      // Price with clear markers
      /(?:price|msrp|our\s+price|sale|now):\s*\$?([\d,]+\.?\d*)/i,
      /retail\s*(?:price)?:\s*\$?([\d,]+\.?\d*)/i,
      /cost:\s*\$?([\d,]+\.?\d*)/i,
      
      // Price after volume (most reliable for spirits)
      /\d+ml\s*[.-]*\s*\$?([\d,]+\.?\d*)/i,
      /\d+\s*liter\s*[.-]*\s*\$?([\d,]+\.?\d*)/i,
      /750ml.*?\$\s*([\d,]+\.?\d*)/i,
      /\$\s*([\d,]+\.?\d*).*?750ml/i,
      
      // Add to cart patterns
      /add\s+to\s+cart.*?\$\s*([\d,]+\.?\d*)/is,
      /\$\s*([\d,]+\.?\d*).*?add\s+to\s+cart/is,
      
      // Price with currency symbol
      /\$\s*([\d,]+\.?\d{0,2})(?:\s|$|[^\d])/,
      /USD\s*([\d,]+\.?\d{0,2})/i,
      /£\s*([\d,]+\.?\d*)/,  // GBP
      /€\s*([\d,]+\.?\d*)/,   // EUR
      
      // Price range patterns (take lower bound)
      /\$\s*([\d,]+\.?\d*)\s*-\s*\$\s*[\d,]+\.?\d*/,
      /from\s*\$\s*([\d,]+\.?\d*)/i,
      /starting\s+at\s*\$\s*([\d,]+\.?\d*)/i,
      
      // Price in common formats
      /(?:^|\s)([\d,]+\.99)(?:\s|$)/,
      /(?:^|\s)([\d,]+\.95)(?:\s|$)/,
      /(?:^|\s)([\d,]+\.00)(?:\s|$)/,
      
      // V3.1.3: Fallback patterns
      /\bprice[^$]*?\$\s*([\d,]+\.?\d*)/i,
      /\bbuy[^$]*?\$\s*([\d,]+\.?\d*)/i,
      /\bpurchase[^$]*?\$\s*([\d,]+\.?\d*)/i
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
  
  /**
   * V3.1.3: Enhanced multi-strategy price extraction
   */
  static extractPriceWithRetry(html: string, url?: string): number | undefined {
    // Strategy 1: Try standard extraction
    let price = this.extractPriceFromSnippet(html);
    if (price) return price;
    
    // Strategy 2: Try structured data extraction
    const structuredPrice = this.extractFromStructuredDataV3(html);
    if (structuredPrice) return structuredPrice;
    
    // Strategy 3: Try near-volume extraction
    const volumePrice = this.extractPriceNearVolume(html);
    if (volumePrice) return volumePrice;
    
    // Strategy 4: Try buy button extraction
    const buyButtonPrice = this.extractPriceNearBuyButton(html);
    if (buyButtonPrice) return buyButtonPrice;
    
    // Strategy 5: Fallback context extraction
    const contextPrice = this.extractPriceFromContext(html);
    if (contextPrice) return contextPrice;
    
    return undefined;
  }
  
  /**
   * V3.1.3: Extract from structured data with more patterns
   */
  private static extractFromStructuredDataV3(html: string): number | undefined {
    // JSON-LD patterns
    const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    const jsonLdMatches = html.matchAll(jsonLdPattern);
    
    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1]);
        const price = this.extractPriceFromJsonLd(data);
        if (price) return price;
      } catch (e) {
        // Continue to next match
      }
    }
    
    return undefined;
  }
  
  /**
   * V3.1.3: Extract price from JSON-LD data
   */
  private static extractPriceFromJsonLd(data: any): number | undefined {
    if (!data) return undefined;
    
    // Check direct price
    if (data.offers?.price) {
      const price = this.parsePrice(data.offers.price.toString());
      if (price && this.isReasonablePrice(price)) return price;
    }
    
    // Check array of offers
    if (Array.isArray(data.offers)) {
      for (const offer of data.offers) {
        const price = this.parsePrice(offer.price?.toString());
        if (price && this.isReasonablePrice(price)) return price;
      }
    }
    
    // Check nested product
    if (data['@graph']) {
      for (const item of data['@graph']) {
        if (item['@type'] === 'Product') {
          return this.extractPriceFromJsonLd(item);
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * V3.1.3: Extract price near volume indicators
   */
  private static extractPriceNearVolume(html: string): number | undefined {
    const volumePatterns = [
      /750\s*ml[^$]{0,50}\$\s*([\d,]+\.?\d*)/gi,
      /1\s*L[^$]{0,50}\$\s*([\d,]+\.?\d*)/gi,
      /\$\s*([\d,]+\.?\d*)[^$]{0,50}750\s*ml/gi,
      /\$\s*([\d,]+\.?\d*)[^$]{0,50}1\s*L/gi
    ];
    
    for (const pattern of volumePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const price = this.parsePrice(match[1]);
        if (price && this.isReasonablePrice(price)) return price;
      }
    }
    
    return undefined;
  }
  
  /**
   * V3.1.3: Extract price near buy/add to cart buttons
   */
  private static extractPriceNearBuyButton(html: string): number | undefined {
    const buyPatterns = [
      /<button[^>]*>.*?add\s+to\s+cart.*?<\/button>[^$]{0,200}\$\s*([\d,]+\.?\d*)/gis,
      /\$\s*([\d,]+\.?\d*)[^$]{0,200}<button[^>]*>.*?add\s+to\s+cart.*?<\/button>/gis,
      /<button[^>]*>.*?buy\s+now.*?<\/button>[^$]{0,200}\$\s*([\d,]+\.?\d*)/gis
    ];
    
    for (const pattern of buyPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const price = this.parsePrice(match[1]);
        if (price && this.isReasonablePrice(price)) return price;
      }
    }
    
    return undefined;
  }
  
  /**
   * V3.1.3: Extract price from context clues
   */
  private static extractPriceFromContext(html: string): number | undefined {
    // Look for prices in product containers
    const containerPattern = /<div[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const containers = html.matchAll(containerPattern);
    
    for (const container of containers) {
      const content = container[1];
      const priceMatch = content.match(/\$\s*([\d,]+\.?\d*)/);
      if (priceMatch) {
        const price = this.parsePrice(priceMatch[1]);
        if (price && this.isReasonablePrice(price)) return price;
      }
    }
    
    return undefined;
  }
}

// Export for testing
export default EnhancedPriceExtractor;