import { SpiritData } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { UserAgentManager } from '../utils/user-agent.js';

export interface ExtractionResult {
  spirits: Partial<SpiritData>[];
  errors: string[];
  source: string;
}

export class EnhancedDataExtractor {
  private userAgent: any;

  constructor() {
    this.userAgent = UserAgentManager.getRandomConfig();
  }

  async extractFromUrl(url: string): Promise<ExtractionResult> {
    const result: ExtractionResult = {
      spirits: [],
      errors: [],
      source: url
    };

    try {
      logger.info(`Extracting data from URL: ${url}`);
      
      // Rotate user agent for each request
      this.userAgent = UserAgentManager.getRandomConfig();
      
      const response = await fetch(url, {
        headers: this.userAgent.headers,
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const spirits = this.parseHtmlForSpirits(html, url);
      
      result.spirits = spirits;
      logger.info(`Extracted ${spirits.length} spirits from ${url}`);
      
    } catch (error) {
      const errorMsg = `Failed to extract from ${url}: ${String(error)}`;
      result.errors.push(errorMsg);
      logger.error(errorMsg);
    }

    return result;
  }

  private parseHtmlForSpirits(html: string, sourceUrl: string): Partial<SpiritData>[] {
    const spirits: Partial<SpiritData>[] = [];

    try {
      // Extract structured data (JSON-LD)
      const jsonLdSpirits = this.extractFromJsonLd(html, sourceUrl);
      spirits.push(...jsonLdSpirits);

      // Extract from common e-commerce patterns
      const ecommerceSpirits = this.extractFromEcommercePatterns(html, sourceUrl);
      spirits.push(...ecommerceSpirits);

      // Extract from product listings
      const listingSpirits = this.extractFromProductListings(html, sourceUrl);
      spirits.push(...listingSpirits);

    } catch (error) {
      logger.error('Error parsing HTML for spirits:', error);
    }

    return spirits;
  }

  private extractFromJsonLd(html: string, sourceUrl: string): Partial<SpiritData>[] {
    const spirits: Partial<SpiritData>[] = [];

    try {
      const jsonLdMatches = html.match(/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/gis);
      
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          try {
            const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
            const data = JSON.parse(jsonContent);
            
            if (data['@type'] === 'Product' || (Array.isArray(data) && data.some(item => item['@type'] === 'Product'))) {
              const products = Array.isArray(data) ? data.filter(item => item['@type'] === 'Product') : [data];
              
              for (const product of products) {
                const spirit = this.convertJsonLdToSpirit(product, sourceUrl);
                if (spirit && this.isSpirit(spirit)) {
                  spirits.push(spirit);
                }
              }
            }
          } catch (jsonError) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      logger.error('Error extracting JSON-LD:', error);
    }

    return spirits;
  }

  private convertJsonLdToSpirit(product: any, sourceUrl: string): Partial<SpiritData> | null {
    try {
      const spirit: Partial<SpiritData> = {
        name: product.name || '',
        brand: product.brand?.name || product.manufacturer?.name || '',
        description: product.description || '',
        image_url: product.image?.[0] || product.image || '',
        source_url: sourceUrl,
        scraped_at: new Date().toISOString()
      };

      // Extract price
      if (product.offers) {
        const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
        if (offer.price) {
          spirit.price = parseFloat(offer.price);
        }
      }

      // Extract additional properties
      if (product.additionalProperty) {
        for (const prop of product.additionalProperty) {
          if (prop.name.toLowerCase().includes('abv') || prop.name.toLowerCase().includes('alcohol')) {
            spirit.abv = parseFloat(prop.value);
          }
          if (prop.name.toLowerCase().includes('volume') || prop.name.toLowerCase().includes('size')) {
            spirit.volume = prop.value;
          }
        }
      }

      return spirit;
    } catch (error) {
      return null;
    }
  }

  private extractFromEcommercePatterns(html: string, sourceUrl: string): Partial<SpiritData>[] {
    const spirits: Partial<SpiritData>[] = [];

    // Common e-commerce selectors for spirits
    const patterns = [
      {
        name: /class=["\'][^"\']*product[_-]?name[^"\']*["\'][^>]*>([^<]+)</gi,
        brand: /class=["\'][^"\']*brand[^"\']*["\'][^>]*>([^<]+)</gi,
        price: /class=["\'][^"\']*price[^"\']*["\'][^>]*>.*?[\$£€]([0-9,]+\.?[0-9]*)/gi
      }
    ];

    try {
      const nameMatches = [...html.matchAll(patterns[0].name)];
      const brandMatches = [...html.matchAll(patterns[0].brand)];
      const priceMatches = [...html.matchAll(patterns[0].price)];

      for (let i = 0; i < nameMatches.length; i++) {
        const name = nameMatches[i]?.[1]?.trim();
        if (name && this.isLikelySpirit(name)) {
          const spirit: Partial<SpiritData> = {
            name,
            brand: brandMatches[i]?.[1]?.trim() || '',
            source_url: sourceUrl,
            scraped_at: new Date().toISOString()
          };

          if (priceMatches[i]) {
            spirit.price = parseFloat(priceMatches[i][1].replace(',', ''));
          }

          spirits.push(spirit);
        }
      }
    } catch (error) {
      logger.error('Error extracting from e-commerce patterns:', error);
    }

    return spirits;
  }

  private extractFromProductListings(html: string, sourceUrl: string): Partial<SpiritData>[] {
    const spirits: Partial<SpiritData>[] = [];

    try {
      // Look for product listing containers
      const productContainers = html.match(/<div[^>]*class=["\'][^"\']*product[^"\']*["\'][^>]*>.*?<\/div>/gis);
      
      if (productContainers) {
        for (const container of productContainers) {
          const spirit = this.extractSpiritFromContainer(container, sourceUrl);
          if (spirit && this.isSpirit(spirit)) {
            spirits.push(spirit);
          }
        }
      }
    } catch (error) {
      logger.error('Error extracting from product listings:', error);
    }

    return spirits;
  }

  private extractSpiritFromContainer(html: string, sourceUrl: string): Partial<SpiritData> | null {
    try {
      const spirit: Partial<SpiritData> = {
        source_url: sourceUrl,
        scraped_at: new Date().toISOString()
      };

      // Extract name
      const nameMatch = html.match(/<h[1-6][^>]*>([^<]+)</i) || 
                       html.match(/class=["\'][^"\']*(?:title|name)[^"\']*["\'][^>]*>([^<]+)/i);
      if (nameMatch) {
        spirit.name = nameMatch[1].trim();
      }

      // Extract brand
      const brandMatch = html.match(/class=["\'][^"\']*brand[^"\']*["\'][^>]*>([^<]+)/i);
      if (brandMatch) {
        spirit.brand = brandMatch[1].trim();
      }

      // Extract price
      const priceMatch = html.match(/[\$£€]([0-9,]+\.?[0-9]*)/);
      if (priceMatch) {
        spirit.price = parseFloat(priceMatch[1].replace(',', ''));
      }

      // Extract image
      const imgMatch = html.match(/<img[^>]*src=["\']([^"\']+)["\'][^>]*>/i);
      if (imgMatch) {
        spirit.image_url = imgMatch[1];
      }

      return spirit.name ? spirit : null;
    } catch (error) {
      return null;
    }
  }

  private isSpirit(spirit: Partial<SpiritData>): boolean {
    if (!spirit.name) return false;
    
    return this.isLikelySpirit(spirit.name);
  }

  private isLikelySpirit(name: string): boolean {
    const spiritKeywords = [
      'whiskey', 'whisky', 'bourbon', 'scotch', 'rye',
      'vodka', 'gin', 'rum', 'tequila', 'mezcal',
      'cognac', 'brandy', 'liqueur', 'armagnac',
      'single malt', 'blended', 'reserve', 'aged',
      'distillery', 'proof', 'year old', 'vintage'
    ];

    const lowerName = name.toLowerCase();
    return spiritKeywords.some(keyword => lowerName.includes(keyword));
  }

  async extractMultipleUrls(urls: string[]): Promise<ExtractionResult[]> {
    const results: ExtractionResult[] = [];
    
    for (const url of urls) {
      try {
        const result = await this.extractFromUrl(url);
        results.push(result);
        
        // Rate limiting between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          spirits: [],
          errors: [String(error)],
          source: url
        });
      }
    }
    
    return results;
  }
}