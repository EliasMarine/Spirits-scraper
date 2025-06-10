import { z } from 'zod';
import { SpiritData, SpiritDataSchema } from '../types/index.js';
import { fuzzyMatch, DEFAULT_CONFIG } from './fuzzy-matching.js';
import { normalizeBrandName, DEFAULT_BRAND_CONFIG } from './brand-normalization.js';
import * as crypto from 'crypto';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  cleaned?: SpiritData;
  descriptionFingerprint?: string;
}

// Store for tracking duplicate descriptions globally
export class DescriptionTracker {
  private static descriptions = new Map<string, string[]>(); // fingerprint -> [spirit names]
  
  static addDescription(fingerprint: string, spiritName: string): void {
    const existing = this.descriptions.get(fingerprint) || [];
    if (!existing.includes(spiritName)) {
      existing.push(spiritName);
      this.descriptions.set(fingerprint, existing);
    }
  }
  
  static isDuplicate(fingerprint: string): boolean {
    const spirits = this.descriptions.get(fingerprint) || [];
    return spirits.length > 1;
  }
  
  static getDuplicates(fingerprint: string): string[] {
    return this.descriptions.get(fingerprint) || [];
  }
  
  static clear(): void {
    this.descriptions.clear();
  }
}

export class DataValidator {
  /**
   * Validate and clean spirit data
   */
  validate(data: Partial<SpiritData>): ValidationResult {
    const result: ValidationResult = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    try {
      // Clean the data first
      const cleaned = this.cleanData(data);

      // Validate against schema
      const validated = SpiritDataSchema.parse(cleaned);

      result.isValid = true;
      result.cleaned = validated;
      
      // Create description fingerprint for duplicate tracking
      if (validated.description) {
        result.descriptionFingerprint = this.createDescriptionFingerprint(validated.description);
        DescriptionTracker.addDescription(result.descriptionFingerprint, validated.name);
      }

      // Check for data quality warnings
      this.checkDataQuality(validated, result);

    } catch (error) {
      if (error instanceof z.ZodError) {
        result.errors = error.errors.map(e =>
          `${e.path.join('.')}: ${e.message}`,
        );
      } else {
        result.errors = [String(error)];
      }
    }

    return result;
  }

  /**
   * Clean and normalize spirit data
   */
  private cleanData(data: Partial<SpiritData>): Partial<SpiritData> {
    const cleaned: Partial<SpiritData> = { ...data };

    // Clean name
    if (cleaned.name) {
      cleaned.name = this.cleanString(cleaned.name);
      cleaned.name = this.normalizeSpiritName(cleaned.name);
    }

    // Clean brand
    if (cleaned.brand) {
      cleaned.brand = this.cleanString(cleaned.brand);
      const brandNormalization = normalizeBrandName(cleaned.brand, DEFAULT_BRAND_CONFIG);
      cleaned.brand = brandNormalization.canonical;
    }

    // Clean description
    if (cleaned.description) {
      cleaned.description = this.cleanString(cleaned.description);
      
      // Check for generic/duplicate descriptions
      const fingerprint = this.createDescriptionFingerprint(cleaned.description);
      if (this.isGenericDescription(cleaned.description, fingerprint)) {
        // Mark as generic and try to improve it
        cleaned.description = this.enhanceGenericDescription(cleaned.description, cleaned.name, cleaned.brand);
      }
      
      cleaned.description = this.trimToLength(cleaned.description, 2000);
    }

    // Normalize type
    if (cleaned.type) {
      cleaned.type = this.normalizeType(cleaned.type);
    }

    // Normalize category
    if (cleaned.category) {
      cleaned.category = this.normalizeCategory(cleaned.category);
    }

    // Clean origin country
    if (cleaned.origin_country) {
      cleaned.origin_country = this.normalizeCountry(cleaned.origin_country);
    }

    // Clean and validate ABV
    if (cleaned.abv !== undefined) {
      cleaned.abv = this.validateABV(cleaned.abv);
    }

    // Clean price range
    if (cleaned.price_range) {
      cleaned.price_range = this.normalizePriceRange(cleaned.price_range);
    }
    
    // Normalize volume
    if (cleaned.volume) {
      cleaned.volume = this.validateVolume(cleaned.volume);
    }

    // Clean flavor profile
    if (cleaned.flavor_profile) {
      cleaned.flavor_profile = cleaned.flavor_profile
        .map(f => this.cleanString(f))
        .filter(f => f.length > 0)
        .slice(0, 10); // Limit to 10 flavors
    }

    // Validate image URL
    if (cleaned.image_url) {
      if (!this.isValidUrl(cleaned.image_url)) {
        delete cleaned.image_url;
      }
    }

    // Validate source URL
    if (cleaned.source_url) {
      if (!this.isValidUrl(cleaned.source_url)) {
        cleaned.source_url = '';
      }
    }

    return cleaned;
  }

  /**
   * Clean string by removing extra whitespace and special characters
   */
  private cleanString(str: string): string {
    return str
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,!?$%&()'"/]/g, '')
      .trim();
  }

  /**
   * Normalize spirit name by removing extra info and applying aggressive normalization
   */
  private normalizeSpiritName(name: string): string {
    // Start with basic cleaning
    let normalized = name;
    
    // Remove volume info with various formats
    normalized = normalized.replace(/\b\d+\s*m\s*l\b/gi, ''); // Handles "750 m L"
    normalized = normalized.replace(/\b\d+ml\b/gi, ''); // Handles "750ml"
    normalized = normalized.replace(/\b\d+\s*liter\b/gi, ''); // Handles "1 liter"
    normalized = normalized.replace(/\b\d+\s*l\b/gi, ''); // Handles "1L"
    normalized = normalized.replace(/\b\d+\.\d+\s*l\b/gi, ''); // Handles "1.75L"
    
    // Remove years in parentheses (vintage years)
    normalized = normalized.replace(/\s*\(\d{4}\)\s*/g, ' ');
    
    // Remove price info
    normalized = normalized.replace(/\$[\d,]+\.?\d*/g, '');
    
    // Remove review site text that might have snuck into names
    normalized = normalized.replace(/\bon\s+whisky\s+connosr\b/gi, '');
    normalized = normalized.replace(/\bwhiskey\s+in\s+my\s+wedding\s+ring\b/gi, '');
    normalized = normalized.replace(/\bvs\b/gi, ''); // Remove "vs" comparisons
    normalized = normalized.replace(/\bin\s+depth\b/gi, '');
    normalized = normalized.replace(/\bcomparison\b/gi, '');
    normalized = normalized.replace(/\breview\b/gi, '');
    
    // Normalize hyphenation variations
    normalized = normalized.replace(/bottled\s*-\s*in\s*-\s*bond/gi, 'Bottled in Bond');
    normalized = normalized.replace(/bottled\s+in\s+bond/gi, 'Bottled in Bond');
    normalized = normalized.replace(/bottled-in-bond/gi, 'Bottled in Bond');
    
    // Normalize spacing issues
    normalized = normalized.replace(/\s+/g, ' '); // Multiple spaces to single
    normalized = normalized.replace(/\s*-\s*/g, '-'); // Normalize hyphens
    normalized = normalized.replace(/\s*'\s*/g, "'"); // Normalize apostrophes
    
    // Remove trailing/leading special characters
    normalized = normalized.replace(/^[\s\-,]+|[\s\-,]+$/g, '');
    
    // Remove any leftover brackets or special characters
    normalized = normalized.replace(/[\[\]{}]/g, '');
    
    // Apply proper title case
    return this.titleCase(normalized).trim();
  }
  
  /**
   * Create a normalized key for deduplication matching
   * This is more aggressive than display normalization
   */
  static createNormalizedKey(name: string): string {
    let key = name.toLowerCase();
    
    // Remove all special characters and spaces
    key = key.replace(/[^a-z0-9]/g, '');
    
    // Remove common words that vary
    key = key.replace(/\b(the|and|of|with)\b/g, '');
    
    // Normalize common variations
    key = key.replace(/whiskey/g, 'whisky');
    key = key.replace(/bottledinbond/g, 'bib');
    key = key.replace(/singlebarre/g, 'sb');
    key = key.replace(/smallbatch/g, 'smb');
    key = key.replace(/straightbourbon/g, 'bourbon');
    key = key.replace(/kentuckystraight/g, 'ky');
    key = key.replace(/caskstrength/g, 'cs');
    key = key.replace(/barrelproof/g, 'bp');
    
    return key;
  }


  /**
   * Normalize spirit type
   */
  private normalizeType(type: string): string {
    const typeMap: Record<string, string> = {
      // Whiskey types
      'whiskey': 'Whiskey',
      'whisky': 'Whisky',
      'bourbon': 'Bourbon',
      'bourbon whiskey': 'Bourbon',
      'kentucky bourbon': 'Bourbon',
      'straight bourbon': 'Bourbon',
      'small batch bourbon': 'Bourbon',
      'single barrel bourbon': 'Bourbon',
      'bottled in bond': 'Bourbon',
      'rye whiskey': 'Rye Whiskey',
      'straight rye': 'Rye Whiskey',
      'straight rye whiskey': 'Rye Whiskey',
      'single malt': 'Single Malt',
      'single malt whisky': 'Single Malt',
      'single malt scotch': 'Single Malt',
      'blended whisky': 'Blended Whisky',
      'blended scotch': 'Blended Scotch',
      'irish whiskey': 'Irish Whiskey',
      'japanese whisky': 'Japanese Whisky',
      'canadian whisky': 'Canadian Whisky',
      // Other spirits
      'vodka': 'Vodka',
      'gin': 'Gin',
      'rum': 'Rum',
      'tequila': 'Tequila',
      'mezcal': 'Mezcal',
      'cognac': 'Cognac',
      'brandy': 'Brandy',
      'liqueur': 'Liqueur',
      // Generic
      'spirit': 'Spirit',
    };

    const lower = type.toLowerCase().trim();
    
    // Check exact match first
    if (typeMap[lower]) {
      return typeMap[lower];
    }
    
    // Check if type contains key patterns
    for (const [key, value] of Object.entries(typeMap)) {
      if (lower.includes(key)) {
        return value;
      }
    }
    
    // Don't default to Single Malt - use the original type in title case
    return this.titleCase(type);
  }

  /**
   * Normalize category
   */
  private normalizeCategory(category: string): string {
    const validCategories = [
      // Whiskey categories
      'Whiskey', 'Bourbon', 'Rye Whiskey', 'Scotch', 'Irish Whiskey', 
      'Japanese Whisky', 'Canadian Whisky', 'Tennessee Whiskey', 
      'American Single Malt', 'Blended Whisky',
      // Other spirits
      'Vodka', 'Gin', 'Rum', 'Tequila', 'Mezcal', 
      'Cognac', 'Brandy', 'Liqueur', 'Other',
    ];

    const titleCased = this.titleCase(category);
    return validCategories.includes(titleCased) ? titleCased : 'Other';
  }

  /**
   * Normalize country name
   */
  private normalizeCountry(country: string): string {
    const countryMap: Record<string, string> = {
      'usa': 'United States',
      'us': 'United States',
      'america': 'United States',
      'uk': 'United Kingdom',
      'england': 'United Kingdom',
      'scotland': 'Scotland',
    };

    const lower = country.toLowerCase();
    return countryMap[lower] || this.titleCase(country);
  }

  /**
   * Validate and normalize ABV
   */
  private validateABV(abv: number): number | undefined {
    // Typical ABV range for spirits
    if (abv < 20 || abv > 75) {
      // Might be proof instead of ABV
      if (abv >= 40 && abv <= 150) {
        return abv / 2; // Convert proof to ABV
      }
      return undefined; // Invalid ABV
    }
    return Math.round(abv * 10) / 10; // Round to 1 decimal
  }

  /**
   * Normalize price range
   */
  private normalizePriceRange(price: string): string {
    // Check if it's already a valid database value
    const validValues = ['budget', 'mid-range', 'premium', 'luxury', 'ultra-luxury'];
    if (validValues.includes(price)) {
      return price;
    }
    
    // Convert old $ format to valid database values
    const dollarCount = (price.match(/\$/g) || []).length;
    if (dollarCount === 1) return 'budget';
    if (dollarCount === 2) return 'mid-range';
    if (dollarCount === 3) return 'premium';
    if (dollarCount === 4) return 'luxury';
    if (dollarCount >= 5) return 'ultra-luxury';
    
    // Default to mid-range if unrecognized
    return 'mid-range';
  }

  /**
   * Check if URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Convert string to title case
   */
  private titleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  }

  /**
   * Trim string to maximum length
   */
  private trimToLength(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;

    // Try to trim at sentence boundary
    const trimmed = str.substring(0, maxLength);
    const lastPeriod = trimmed.lastIndexOf('.');
    if (lastPeriod > maxLength * 0.8) {
      return trimmed.substring(0, lastPeriod + 1);
    }

    // Trim at word boundary
    const lastSpace = trimmed.lastIndexOf(' ');
    return trimmed.substring(0, lastSpace) + '...';
  }

  /**
   * Check data quality and add warnings
   */
  private checkDataQuality(data: SpiritData, result: ValidationResult): void {
    // Check for missing optional but important fields
    if (!data.abv) {
      result.warnings.push('Missing ABV (alcohol content)');
    }

    if (!data.description || data.description.length < 50) {
      result.warnings.push('Description is missing or too short');
    } else if (result.descriptionFingerprint && DescriptionTracker.isDuplicate(result.descriptionFingerprint)) {
      const duplicates = DescriptionTracker.getDuplicates(result.descriptionFingerprint!);
      result.warnings.push(`Description appears to be duplicated across spirits: ${duplicates.join(', ')}`);
    }

    if (!data.image_url) {
      result.warnings.push('No image URL found');
    }

    if (!data.price_range) {
      result.warnings.push('No price information found');
    }

    if (!data.type || data.type === 'Spirit') {
      result.warnings.push('Specific spirit type not identified');
    }

    if (!data.origin_country) {
      result.warnings.push('Origin country not identified');
    }

    // Check for duplicate detection
    if (data.name && data.brand) {
      const identifier = `${data.brand} ${data.name}`.toLowerCase();
      if (identifier.includes('test') || identifier.includes('sample')) {
        result.warnings.push('May be test/sample data');
      }
    }
  }

  /**
   * Check if two spirits are likely duplicates using advanced fuzzy matching
   */
  isDuplicate(spirit1: Partial<SpiritData>, spirit2: any, threshold: number = 0.85): boolean {
    // Exact match on name and brand
    if (spirit1.name === spirit2.name && spirit1.brand === spirit2.brand) {
      return true;
    }

    // Ensure we have names to compare
    if (!spirit1.name || !spirit2.name) {
      return false;
    }

    // Advanced fuzzy name matching
    const nameMatch = fuzzyMatch(spirit1.name, spirit2.name, DEFAULT_CONFIG);
    
    // Brand matching with normalization
    let brandScore = 0;
    if (spirit1.brand && spirit2.brand) {
      const brand1Norm = normalizeBrandName(spirit1.brand, DEFAULT_BRAND_CONFIG);
      const brand2Norm = normalizeBrandName(spirit2.brand, DEFAULT_BRAND_CONFIG);
      
      if (brand1Norm.canonical === brand2Norm.canonical) {
        brandScore = 1.0;
      } else {
        const brandMatch = fuzzyMatch(brand1Norm.canonical, brand2Norm.canonical, DEFAULT_CONFIG);
        brandScore = brandMatch.similarity;
      }
    }

    // Calculate combined score (name weighted more heavily)
    const nameWeight = 0.7;
    const brandWeight = 0.3;
    const combinedScore = (nameMatch.similarity * nameWeight) + (brandScore * brandWeight);

    // Additional validation checks
    if (combinedScore >= threshold) {
      // Check for significant differences that would indicate different products
      if (spirit1.abv && spirit2.abv && Math.abs(spirit1.abv - spirit2.abv) > 3) {
        return false; // Very different ABV suggests different products
      }
      
      // If types are specified and very different, likely not duplicates
      if (spirit1.type && spirit2.type && 
          spirit1.type !== spirit2.type && 
          !this.areCompatibleTypes(spirit1.type, spirit2.type)) {
        return false;
      }
      
      return true;
    }

    return false;
  }

  /**
   * Check if two spirit types are compatible (e.g., "Whiskey" and "Bourbon")
   */
  private areCompatibleTypes(type1: string, type2: string): boolean {
    const compatibleGroups = [
      ['Whiskey', 'Bourbon', 'Rye Whiskey', 'Single Malt', 'Blended Whisky'],
      ['Vodka'],
      ['Gin'],
      ['Rum'],
      ['Tequila', 'Mezcal'],
      ['Brandy', 'Cognac'],
    ];

    for (const group of compatibleGroups) {
      if (group.includes(type1) && group.includes(type2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get detailed duplicate analysis for debugging
   */
  getDuplicateAnalysis(spirit1: Partial<SpiritData>, spirit2: any): {
    isDuplicate: boolean;
    nameMatch: any;
    brandScore: number;
    combinedScore: number;
    factors: string[];
  } {
    const factors: string[] = [];
    
    // Name matching
    const nameMatch = fuzzyMatch(spirit1.name || '', spirit2.name || '', DEFAULT_CONFIG);
    factors.push(`Name similarity: ${(nameMatch.similarity * 100).toFixed(1)}%`);
    
    // Brand matching
    let brandScore = 0;
    if (spirit1.brand && spirit2.brand) {
      const brand1Norm = normalizeBrandName(spirit1.brand, DEFAULT_BRAND_CONFIG);
      const brand2Norm = normalizeBrandName(spirit2.brand, DEFAULT_BRAND_CONFIG);
      
      if (brand1Norm.canonical === brand2Norm.canonical) {
        brandScore = 1.0;
        factors.push(`Brand: Exact match (${brand1Norm.canonical})`);
      } else {
        const brandMatch = fuzzyMatch(brand1Norm.canonical, brand2Norm.canonical, DEFAULT_CONFIG);
        brandScore = brandMatch.similarity;
        factors.push(`Brand similarity: ${(brandScore * 100).toFixed(1)}%`);
      }
    } else {
      factors.push('Brand: Missing from one or both spirits');
    }

    // Combined score
    const combinedScore = (nameMatch.similarity * 0.7) + (brandScore * 0.3);
    factors.push(`Combined score: ${(combinedScore * 100).toFixed(1)}%`);

    // Additional factors
    if (spirit1.abv && spirit2.abv) {
      const abvDiff = Math.abs(spirit1.abv - spirit2.abv);
      factors.push(`ABV difference: ${abvDiff.toFixed(1)}%`);
    }

    if (spirit1.type && spirit2.type) {
      factors.push(`Types: ${spirit1.type} vs ${spirit2.type}`);
    }

    return {
      isDuplicate: this.isDuplicate(spirit1, spirit2),
      nameMatch,
      brandScore,
      combinedScore,
      factors
    };
  }

  /**
   * Create a fingerprint for description to detect duplicates
   */
  private createDescriptionFingerprint(description: string): string {
    // Normalize the description for comparison
    const normalized = description
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9 ]/g, '')
      .trim();
    
    // Create a hash of the normalized description
    return crypto.createHash('md5').update(normalized).digest('hex');
  }
  
  /**
   * Check if description is generic (e.g., copied from another product)
   */
  private isGenericDescription(description: string, fingerprint?: string): boolean {
    const genericPatterns = [
      // Jim Beam generic description that appears across multiple products
      /aged twice what the law requires.*each sip reveals flavors of sweet caramel and vanilla/i,
      /taste more than 225 years of craft/i,
      
      // Other generic marketing phrases
      /^(?:discover|experience|enjoy) the (?:rich|smooth|bold) (?:flavor|taste)/i,
      /^this (?:premium|exceptional|award-winning) (?:bourbon|whiskey|spirit)/i,
      
      // Placeholder text
      /lorem ipsum/i,
      /description not available/i,
      /coming soon/i,
    ];
    
    // Check against known generic patterns
    for (const pattern of genericPatterns) {
      if (pattern.test(description)) {
        return true;
      }
    }
    
    // Check if this exact description has been seen before
    if (fingerprint && DescriptionTracker.isDuplicate(fingerprint)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Enhance generic descriptions with more specific information
   */
  private enhanceGenericDescription(description: string, name?: string, brand?: string): string {
    // If it's a known generic description, replace it with a better one
    if (/aged twice what the law requires/i.test(description)) {
      const spiritName = [brand, name].filter(Boolean).join(' ');
      return `${spiritName} is a carefully crafted spirit that showcases the distillery's expertise and tradition.`;
    }
    
    // For other generic descriptions, prefix with product name
    if (name && brand) {
      return `${brand} ${name} - ${description}`;
    }
    
    return description;
  }
  
  /**
   * Validate volume and normalize to standard sizes
   */
  validateVolume(volume: string): string | undefined {
    if (!volume) return undefined;
    
    // Extract numeric value
    const match = volume.match(/(\d+(?:\.\d+)?)\s*(ml|l|cl)/i);
    if (!match) return undefined;
    
    let value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    // Convert to ml
    if (unit === 'l') {
      value = value * 1000;
    } else if (unit === 'cl') {
      value = value * 10;
    }
    
    // Standard bottle sizes
    const standardSizes = [50, 100, 200, 375, 500, 700, 750, 1000, 1500, 1750, 3000];
    
    // Find closest standard size
    const closest = standardSizes.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    
    // If within 5% of a standard size, use the standard size
    if (Math.abs(closest - value) / closest <= 0.05) {
      return `${closest}ml`;
    }
    
    // Otherwise return the original value in ml
    return `${Math.round(value)}ml`;
  }

}

// Singleton instance
export const dataValidator = new DataValidator();