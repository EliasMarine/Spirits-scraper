/**
 * Content Validator for V3.1.5
 * 
 * Validates spirits data to ensure high quality and prevent
 * non-spirit content from entering the database
 */

import { logger } from '../utils/logger.js';

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: Record<string, any>;
  qualityScore: number;
}

export interface SpiritData {
  name: string;
  brand?: string;
  type?: string;
  category?: string;
  abv?: number;
  price?: number | string;
  description?: string;
  volume?: string;
  source_url?: string;
}

// Patterns that indicate non-spirit content
const INVALID_CONTENT_PATTERNS = [
  // Cleaning products
  /scotch.*brite/i,
  /cleaning.*(?:pad|product|supply)/i,
  /all.*purpose.*cleaning/i,
  
  // Blog posts and articles
  /best.*price/i,
  /essential.*bottles/i,
  /latest.*releases/i,
  /guide.*to/i,
  /how.*to/i,
  /top.*\d+/i,
  /must.*have/i,
  /ultimate.*guide/i,
  
  // Forum posts and discussions
  /substitute.*for/i,
  /vs\.|versus/i,
  /alternative.*to/i,
  /compared.*to/i,
  /better.*than/i,
  
  // Recipes and cocktails
  /mojito.*recipe/i,
  /cocktail.*recipe/i,
  /how.*to.*make/i,
  /mixed.*drinks/i,
  
  // Shopping and service pages
  /shop.*now/i,
  /buy.*online/i,
  /sale.*off/i,
  /free.*shipping/i,
  /delivery.*available/i,
  /order.*today/i,
  
  // News and updates
  /has.*become/i,
  /launches.*new/i,
  /announces/i,
  /revealed/i,
  
  // General non-product content
  /^the\s+\w+$/i, // Generic "The Something"
  /^\w+\s+guide$/i, // "Something Guide"
];

// Valid spirit type list
const VALID_SPIRIT_TYPES = [
  'Bourbon', 'Scotch', 'Whiskey', 'Whisky', 'Rye Whiskey', 'Irish Whiskey',
  'Japanese Whisky', 'Canadian Whisky', 'Tennessee Whiskey', 'American Single Malt',
  'Rum', 'Tequila', 'Mezcal', 'Gin', 'Vodka', 'Cognac', 'Brandy', 'Armagnac',
  'Liqueur', 'Cordial', 'Aperitif', 'Digestif', 'Cachaça', 'Pisco', 'Baijiu',
  'Soju', 'Shochu', 'Aquavit', 'Genever', 'Absinthe'
];

// Brand name corrections
const BRAND_CORRECTIONS: Record<string, string> = {
  "angel's envy": "Angel's Envy",
  "angels envy": "Angel's Envy",
  "angel'S envy": "Angel's Envy",
  "four roses": "Four Roses",
  "widow jane": "Widow Jane",
  "maker's mark": "Maker's Mark",
  "makers mark": "Maker's Mark",
  "buffalo trace": "Buffalo Trace",
  "jack daniel's": "Jack Daniel's",
  "jack daniels": "Jack Daniel's",
  "jim beam": "Jim Beam",
  "wild turkey": "Wild Turkey",
  "woodford reserve": "Woodford Reserve",
  "elijah craig": "Elijah Craig",
  "knob creek": "Knob Creek",
  "bulleit": "Bulleit",
  "basil hayden's": "Basil Hayden's",
  "basil haydens": "Basil Hayden's",
  "blanton's": "Blanton's",
  "blantons": "Blanton's"
};

export class ContentValidator {
  /**
   * Validate spirit data and return detailed results
   */
  validateSpirit(spirit: SpiritData): ValidationResult {
    const issues: string[] = [];
    const suggestions: Record<string, any> = {};
    let qualityScore = 100;
    
    // 1. Name validation
    const nameValidation = this.validateName(spirit.name);
    if (!nameValidation.isValid) {
      issues.push(...nameValidation.issues);
      if (nameValidation.suggestion) {
        suggestions.name = nameValidation.suggestion;
      }
      qualityScore -= nameValidation.penalty;
    }
    
    // 2. Check for non-spirit content
    if (this.isNonSpiritContent(spirit.name, spirit.description)) {
      issues.push("Appears to be non-spirit content");
      qualityScore = 0; // Automatic fail
      return { isValid: false, issues, suggestions, qualityScore };
    }
    
    // 3. Brand validation
    const brandValidation = this.validateBrand(spirit.brand);
    if (!brandValidation.isValid) {
      issues.push(...brandValidation.issues);
      if (brandValidation.suggestion) {
        suggestions.brand = brandValidation.suggestion;
      }
      qualityScore -= brandValidation.penalty;
    }
    
    // 4. Type validation
    if (!spirit.type || !this.isValidSpiritType(spirit.type)) {
      issues.push("Invalid or missing spirit type");
      qualityScore -= 15;
    }
    
    // 5. ABV validation
    if (spirit.abv) {
      if (spirit.abv < 20 || spirit.abv > 70) {
        issues.push("ABV out of reasonable range (20-70%)");
        qualityScore -= 10;
      }
    } else {
      issues.push("Missing ABV");
      qualityScore -= 3;  // V3.1.5: Reduced penalty - ABV often missing from sources
    }
    
    // 6. Price validation
    const priceValidation = this.validatePrice(spirit.price);
    if (!priceValidation.isValid) {
      issues.push(...priceValidation.issues);
      qualityScore -= priceValidation.penalty;
    }
    
    // 7. Description validation
    const descValidation = this.validateDescription(spirit.description);
    if (!descValidation.isValid) {
      issues.push(...descValidation.issues);
      if (descValidation.suggestion) {
        suggestions.description = descValidation.suggestion;
      }
      qualityScore -= descValidation.penalty;
    }
    
    // 8. Volume validation
    if (spirit.volume) {
      const volumeValidation = this.validateVolume(spirit.volume);
      if (!volumeValidation.isValid) {
        issues.push(...volumeValidation.issues);
        if (volumeValidation.suggestion) {
          suggestions.volume = volumeValidation.suggestion;
        }
        qualityScore -= volumeValidation.penalty;
      }
    }
    
    return {
      isValid: qualityScore >= 60,  // V3.1.5: Only check quality score, not issues count
      issues,
      suggestions,
      qualityScore: Math.max(0, qualityScore)
    };
  }
  
  /**
   * Validate spirit name
   */
  private validateName(name: string): { 
    isValid: boolean; 
    issues: string[]; 
    suggestion?: string;
    penalty: number;
  } {
    const issues: string[] = [];
    let penalty = 0;
    
    if (!name || name.length < 5) {
      issues.push("Name too short or missing");
      penalty = 30;
      return { isValid: false, issues, penalty };
    }
    
    if (name.length > 100) {
      issues.push("Name too long, likely contains description");
      penalty = 10;
      return { 
        isValid: false, 
        issues, 
        suggestion: name.substring(0, 100).trim(),
        penalty
      };
    }
    
    // Check for formatting issues
    if (/[''']/.test(name)) {
      const fixed = this.fixQuotes(name);
      if (fixed !== name) {
        issues.push("Name contains improper quote formatting");
        penalty = 5;
        return { isValid: false, issues, suggestion: fixed, penalty };
      }
    }
    
    // Check for concatenated text
    if (/[a-z][A-Z]/.test(name) && !/\s/.test(name.match(/[a-z][A-Z]/)?.[0] || '')) {
      const fixed = name.replace(/([a-z])([A-Z])/g, '$1 $2');
      issues.push("Name contains concatenated text without spaces");
      penalty = 5;
      return { isValid: false, issues, suggestion: fixed, penalty };
    }
    
    return { isValid: true, issues: [], penalty: 0 };
  }
  
  /**
   * Validate brand
   */
  private validateBrand(brand?: string): {
    isValid: boolean;
    issues: string[];
    suggestion?: string;
    penalty: number;
  } {
    const issues: string[] = [];
    let penalty = 0;
    
    if (!brand || brand === "Unknown") {
      issues.push("Brand missing or unknown");
      penalty = 15;
      return { isValid: false, issues, penalty };
    }
    
    // Check for truncated brand
    if (brand.length < 3) {
      issues.push("Brand name appears truncated");
      penalty = 10;
      return { isValid: false, issues, penalty };
    }
    
    // Check for brand corrections
    const normalizedBrand = brand.toLowerCase().trim();
    if (BRAND_CORRECTIONS[normalizedBrand]) {
      return {
        isValid: false,
        issues: ["Brand name needs normalization"],
        suggestion: BRAND_CORRECTIONS[normalizedBrand],
        penalty: 5
      };
    }
    
    // Check for generic brands
    const genericBrands = ['the', 'a', 'an', 'new', 'old', 'best', 'top', 'premium'];
    if (genericBrands.includes(normalizedBrand)) {
      issues.push("Brand name is too generic");
      penalty = 20;
      return { isValid: false, issues, penalty };
    }
    
    return { isValid: true, issues: [], penalty: 0 };
  }
  
  /**
   * Check if content is non-spirit
   */
  private isNonSpiritContent(name: string, description?: string): boolean {
    const combined = `${name} ${description || ''}`.toLowerCase();
    
    return INVALID_CONTENT_PATTERNS.some(pattern => pattern.test(combined));
  }
  
  /**
   * Check if spirit type is valid
   */
  private isValidSpiritType(type: string): boolean {
    return VALID_SPIRIT_TYPES.some(validType => 
      validType.toLowerCase() === type.toLowerCase()
    );
  }
  
  /**
   * Validate price
   */
  private validatePrice(price?: number | string): {
    isValid: boolean;
    issues: string[];
    penalty: number;
  } {
    const issues: string[] = [];
    let penalty = 0;
    
    if (!price) {
      issues.push("Missing price");
      penalty = 5;
      return { isValid: true, issues, penalty }; // Not critical
    }
    
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice)) {
      issues.push("Invalid price format");
      penalty = 10;
      return { isValid: false, issues, penalty };
    }
    
    if (numericPrice < 10 || numericPrice > 50000) {
      issues.push("Price out of reasonable range ($10-$50,000)");
      penalty = 15;
      return { isValid: false, issues, penalty };
    }
    
    return { isValid: true, issues: [], penalty: 0 };
  }
  
  /**
   * Validate description
   */
  private validateDescription(description?: string): {
    isValid: boolean;
    issues: string[];
    suggestion?: string;
    penalty: number;
  } {
    const issues: string[] = [];
    let penalty = 0;
    
    if (!description) {
      issues.push("Missing description");
      penalty = 5;
      return { isValid: true, issues, penalty }; // Not critical
    }
    
    // Check for search result snippets
    const searchPatterns = [
      /find the best local for/i,
      /avg \(ex-tax\)/i,
      /find and shop from/i,
      /stores and merchants near you/i
    ];
    
    if (searchPatterns.some(pattern => pattern.test(description))) {
      const cleaned = this.cleanSearchSnippet(description);
      if (cleaned.length < 50) {
        issues.push("Description is just a search result snippet");
        penalty = 20;
        return { isValid: false, issues, penalty };
      }
      return {
        isValid: false,
        issues: ["Description contains search result text"],
        suggestion: cleaned,
        penalty: 10
      };
    }
    
    // Check for minimum quality
    if (description.length < 50) {
      issues.push("Description too short");
      penalty = 10;
      return { isValid: false, issues, penalty };
    }
    
    return { isValid: true, issues: [], penalty: 0 };
  }
  
  /**
   * Validate volume
   */
  private validateVolume(volume: string): {
    isValid: boolean;
    issues: string[];
    suggestion?: string;
    penalty: number;
  } {
    const validVolumes = [
      '50ml', '100ml', '200ml', '375ml', '500ml', '700ml', '750ml', 
      '1L', '1.5L', '1.75L', '3L', '4.5L', '6L'
    ];
    
    const normalized = volume.replace(/\s+/g, '').toLowerCase();
    
    if (!validVolumes.some(v => v.toLowerCase() === normalized)) {
      // Try to extract and normalize
      const match = volume.match(/(\d+(?:\.\d+)?)\s*(ml|l|liter|litre)/i);
      if (match) {
        const amount = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        
        let suggestion: string;
        if (unit.includes('l')) {
          suggestion = `${amount}L`;
        } else {
          suggestion = `${amount}ml`;
        }
        
        return {
          isValid: false,
          issues: ["Volume format needs normalization"],
          suggestion,
          penalty: 5
        };
      }
      
      return {
        isValid: false,
        issues: ["Invalid volume format"],
        penalty: 10
      };
    }
    
    return { isValid: true, issues: [], penalty: 0 };
  }
  
  /**
   * Fix quote formatting
   */
  private fixQuotes(text: string): string {
    return text
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"');
  }
  
  /**
   * Clean search result snippets from description
   */
  private cleanSearchSnippet(desc: string): string {
    return desc
      .replace(/find the best local for.*/i, '')
      .replace(/avg \(ex-tax\).*/i, '')
      .replace(/find and shop from.*/i, '')
      .replace(/stores and merchants near you.*/i, '')
      .replace(/similar products.*/i, '')
      .replace(/related products.*/i, '')
      .trim();
  }
  
  /**
   * Batch validate multiple spirits
   */
  async validateBatch(spirits: SpiritData[]): Promise<ValidationResult[]> {
    return spirits.map(spirit => this.validateSpirit(spirit));
  }
  
  /**
   * Get validation statistics for a batch
   */
  getValidationStats(results: ValidationResult[]): {
    totalValidated: number;
    valid: number;
    invalid: number;
    averageScore: number;
    commonIssues: Record<string, number>;
  } {
    const stats = {
      totalValidated: results.length,
      valid: results.filter(r => r.isValid).length,
      invalid: results.filter(r => !r.isValid).length,
      averageScore: results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length,
      commonIssues: {} as Record<string, number>
    };
    
    // Count common issues
    results.forEach(result => {
      result.issues.forEach(issue => {
        stats.commonIssues[issue] = (stats.commonIssues[issue] || 0) + 1;
      });
    });
    
    return stats;
  }
}

// Export singleton instance
export const contentValidator = new ContentValidator();