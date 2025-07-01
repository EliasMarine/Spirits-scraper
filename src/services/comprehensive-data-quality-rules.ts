/**
 * V3.1.6 Comprehensive Data Quality Rules
 * Based on critical audit findings that revealed 0% acceptable data quality
 */

import { SpiritData } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { whiskyWhiskeyNormalizer } from './whisky-whiskey-normalizer.js';

export interface QualityValidationResult {
  isValid: boolean;
  canStore: boolean;
  score: number;
  errors: QualityError[];
  warnings: QualityWarning[];
  recommendations: string[];
}

export interface QualityError {
  code: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  field: string;
  value?: any;
}

export interface QualityWarning {
  code: string;
  message: string;
  field: string;
  suggestion: string;
}

/**
 * CRITICAL RULE: Product Name Validation
 * Reject obvious non-product names that caused system failure
 */
const INVALID_NAME_PATTERNS = [
  // Article titles and descriptions
  /^(this|these|the)\s+(fine|best|premium|rare|limited|special|exclusive)\s/i,
  /\b(is a|are a|blend of|made from|consists of|contains|includes)\b/i,
  
  // Search queries and marketing copy
  /^(best|top|premium|rare|limited|special|exclusive)\s+(whiskey|bourbon|scotch|rum|gin|vodka|tequila)/i,
  /\b(under \$|budget|cheap|affordable|discount)\b/i,
  /\b(review|rating|stars|recommend|love|hate|best|worst)\b/i,
  
  // Generic descriptions
  /^(how to|guide to|introduction to|history of)/i,
  /^(the complete|ultimate|definitive|comprehensive)\b/i,
  /\b(you should|you must|you need to|you can)\b/i,
  
  // Review fragments
  /^(I love|I hate|This is|Highly recommend|Not recommended)/i,
  /\b(5 stars|4 stars|excellent choice|great choice)\b/i,
];

/**
 * CRITICAL RULE: Category Validation
 * Prevent the 98.4% "Other" classification failure
 */
const REQUIRED_CATEGORY_PATTERNS = {
  'Bourbon': [
    /\bbourbon\b/i,
    /kentucky straight/i,
    /\b(maker's mark|buffalo trace|woodford|eagle rare|blanton's|four roses|wild turkey)\b/i,
    /bottled.?in.?bond/i
  ],
  'Scotch Whisky': [
    /\b(scotch|scotland|highland|speyside|islay|campbeltown)\b/i,
    /\b(macallan|glenfiddich|glenlivet|johnnie walker|chivas|balvenie|ardbeg|lagavulin)\b/i,
    /single malt/i,
    /blended scotch/i
  ],
  'Tennessee Whiskey': [
    /tennessee whiskey/i,
    /\b(jack daniel's|george dickel|uncle nearest)\b/i
  ],
  'Irish Whiskey': [
    /irish whiskey/i,
    /\b(jameson|bushmills|tullamore|redbreast|green spot|yellow spot)\b/i
  ],
  'Rye Whiskey': [
    /\brye whiskey\b/i,  // Must be explicit to avoid bourbon misclassification
    /\b(rittenhouse|sazerac rye|pikesville|michter's rye)\b/i
  ],
  'American Single Malt': [
    /american single malt/i,
    /\b(westland|balcones|stranahan's|breckenridge)\b/i
  ],
  'Gin': [
    /\bgin\b/i,
    /\b(hendrick's|tanqueray|bombay|plymouth|aviation)\b/i,
    /london dry/i,
    /navy strength/i
  ],
  'Vodka': [
    /\bvodka\b/i,
    /\b(grey goose|belvedere|absolut|smirnoff|tito's)\b/i
  ],
  'Rum': [
    /\brum\b/i,
    /\b(bacardi|captain morgan|mount gay|appleton|zacapa)\b/i,
    /rhum agricole/i
  ],
  'Tequila': [
    /\btequila\b/i,
    /\b(patron|don julio|herradura|espolon|clase azul)\b/i,
    /\b(blanco|reposado|añejo|extra añejo)\b/i
  ],
  'Mezcal': [
    /\bmezcal\b/i,
    /\b(del maguey|vida|espadin|tobala)\b/i
  ],
  'Cognac': [
    /\bcognac\b/i,
    /\b(hennessy|rémy martin|martell|courvoisier)\b/i,
    /\b(vs|vsop|xo|extra)\b/i
  ],
  'Brandy': [
    /\bbrandy\b/i,
    /armagnac/i,
    /calvados/i
  ]
};

/**
 * CRITICAL RULE: Source URL Validation
 * Prevent the 100% missing URL failure
 */
const TRUSTED_DOMAINS = [
  'totalwine.com',
  'klwines.com',
  'masterofmalt.com',
  'thewhiskyexchange.com',
  'bevmo.com',
  'caskers.com',
  'finewineandgoodspirits.com',
  'astorwines.com',
  'hitimewine.net',
  'whiskybase.com'
];

const BANNED_DOMAINS = [
  'reddit.com',
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'tiktok.com',
  'youtube.com',
  'pinterest.com',
  'tripadvisor.com',
  'yelp.com'
];

export class ComprehensiveDataQualityValidator {
  
  /**
   * Main validation method - applies all critical rules
   */
  validate(spirit: Partial<SpiritData>): QualityValidationResult {
    const errors: QualityError[] = [];
    const warnings: QualityWarning[] = [];
    const recommendations: string[] = [];

    // CRITICAL VALIDATION: Product Name
    const nameValidation = this.validateProductName(spirit.name);
    errors.push(...nameValidation.errors);
    warnings.push(...nameValidation.warnings);

    // CRITICAL VALIDATION: Source URL
    const urlValidation = this.validateSourceUrl(spirit.source_url);
    errors.push(...urlValidation.errors);
    warnings.push(...urlValidation.warnings);

    // CRITICAL VALIDATION: Category
    const categoryValidation = this.validateCategory(spirit.name, spirit.description, spirit.category);
    errors.push(...categoryValidation.errors);
    warnings.push(...categoryValidation.warnings);

    // HIGH PRIORITY: Description Quality
    const descriptionValidation = this.validateDescription(spirit.description, spirit.name);
    errors.push(...descriptionValidation.errors);
    warnings.push(...descriptionValidation.warnings);

    // MEDIUM PRIORITY: Data Consistency
    const consistencyValidation = this.validateDataConsistency(spirit);
    errors.push(...consistencyValidation.errors);
    warnings.push(...consistencyValidation.warnings);

    // Calculate quality score
    const score = this.calculateQualityScore(spirit, errors, warnings);

    // Determine if data can be stored
    const criticalErrors = errors.filter(e => e.severity === 'CRITICAL');
    const canStore = criticalErrors.length === 0 && score >= 60;

    return {
      isValid: errors.length === 0,
      canStore,
      score,
      errors,
      warnings,
      recommendations
    };
  }

  /**
   * CRITICAL: Validate product name to prevent article titles and search queries
   */
  private validateProductName(name?: string): { errors: QualityError[], warnings: QualityWarning[] } {
    const errors: QualityError[] = [];
    const warnings: QualityWarning[] = [];

    if (!name || name.trim() === '') {
      errors.push({
        code: 'NAME_MISSING',
        message: 'Product name is required',
        severity: 'CRITICAL',
        field: 'name'
      });
      return { errors, warnings };
    }

    // Check for invalid patterns (article titles, search queries, etc.)
    for (const pattern of INVALID_NAME_PATTERNS) {
      if (pattern.test(name)) {
        errors.push({
          code: 'NAME_INVALID_PATTERN',
          message: `Product name appears to be article title or search query: "${name}"`,
          severity: 'CRITICAL',
          field: 'name',
          value: name
        });
        return { errors, warnings };
      }
    }

    // Check for too short names
    if (name.length < 3) {
      errors.push({
        code: 'NAME_TOO_SHORT',
        message: 'Product name too short',
        severity: 'HIGH',
        field: 'name',
        value: name
      });
    }

    // Check for all caps (likely poor formatting)
    if (name === name.toUpperCase() && name.length > 5) {
      warnings.push({
        code: 'NAME_ALL_CAPS',
        message: 'Product name is all uppercase',
        field: 'name',
        suggestion: 'Consider proper title case formatting'
      });
    }

    // Check for concatenated text without spaces
    if (/[a-z][A-Z]/.test(name) && !name.includes(' ')) {
      warnings.push({
        code: 'NAME_CONCATENATED',
        message: 'Product name appears to have concatenated text without spaces',
        field: 'name',
        suggestion: 'Add proper spacing between words'
      });
    }

    // V3.1.6: Check for whisky/whiskey duplication patterns and site references
    const whiskyAnalysis = whiskyWhiskeyNormalizer.hasProblematicPatterns(name);
    if (whiskyAnalysis.hasProblems) {
      for (const issue of whiskyAnalysis.issues) {
        if (whiskyAnalysis.shouldDelete) {
          errors.push({
            code: 'NAME_SITE_REFERENCE',
            message: `Product name contains site reference: ${issue}`,
            severity: 'CRITICAL',
            field: 'name',
            value: name
          });
        } else {
          warnings.push({
            code: 'NAME_SITE_REFERENCE_WARNING',
            message: issue,
            field: 'name',
            suggestion: 'Remove site references from product name'
          });
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * CRITICAL: Validate source URL to prevent 100% missing URLs
   */
  private validateSourceUrl(sourceUrl?: string): { errors: QualityError[], warnings: QualityWarning[] } {
    const errors: QualityError[] = [];
    const warnings: QualityWarning[] = [];

    if (!sourceUrl || sourceUrl.trim() === '') {
      errors.push({
        code: 'URL_MISSING',
        message: 'Source URL is required for all spirits',
        severity: 'CRITICAL',
        field: 'source_url'
      });
      return { errors, warnings };
    }

    // Validate URL format
    try {
      const url = new URL(sourceUrl);
      
      // Check for banned domains (social media, forums)
      const domain = url.hostname.toLowerCase();
      for (const bannedDomain of BANNED_DOMAINS) {
        if (domain.includes(bannedDomain)) {
          errors.push({
            code: 'URL_BANNED_DOMAIN',
            message: `Source URL from banned domain: ${domain}`,
            severity: 'CRITICAL',
            field: 'source_url',
            value: sourceUrl
          });
          return { errors, warnings };
        }
      }

      // Check if domain is trusted
      const isTrusted = TRUSTED_DOMAINS.some(trusted => domain.includes(trusted));
      if (!isTrusted) {
        warnings.push({
          code: 'URL_UNTRUSTED_DOMAIN',
          message: `Source URL from untrusted domain: ${domain}`,
          field: 'source_url',
          suggestion: 'Verify this is a legitimate retailer'
        });
      }
      
    } catch (error) {
      errors.push({
        code: 'URL_INVALID_FORMAT',
        message: 'Source URL is not a valid URL',
        severity: 'HIGH',
        field: 'source_url',
        value: sourceUrl
      });
    }

    return { errors, warnings };
  }

  /**
   * CRITICAL: Validate category to prevent 98.4% "Other" classification
   */
  private validateCategory(name?: string, description?: string, category?: string): { errors: QualityError[], warnings: QualityWarning[] } {
    const errors: QualityError[] = [];
    const warnings: QualityWarning[] = [];

    if (!category || category === 'Other') {
      // Try to detect category from name and description
      const text = `${name || ''} ${description || ''}`.toLowerCase();
      const detectedCategory = this.detectCategory(text);
      
      if (detectedCategory !== 'Other') {
        warnings.push({
          code: 'CATEGORY_AUTO_DETECTABLE',
          message: `Category could be auto-detected as "${detectedCategory}" but was "${category || 'missing'}"`,
          field: 'category',
          suggestion: `Consider setting category to "${detectedCategory}"`
        });
      } else {
        errors.push({
          code: 'CATEGORY_DETECTION_FAILED',
          message: 'Category detection failed - cannot classify spirit type',
          severity: 'HIGH',
          field: 'category',
          value: category
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Detect category using enhanced patterns
   */
  private detectCategory(text: string): string {
    // Priority-based detection to prevent bourbon/rye misclassification
    const priorities = [
      'Tennessee Whiskey',
      'American Single Malt', 
      'Bourbon',
      'Rye Whiskey',  // After bourbon to prevent false positives
      'Scotch Whisky',
      'Irish Whiskey',
      'Gin',
      'Vodka',
      'Rum',
      'Tequila',
      'Mezcal',
      'Cognac',
      'Brandy'
    ];

    for (const category of priorities) {
      const patterns = REQUIRED_CATEGORY_PATTERNS[category];
      if (patterns && patterns.some(pattern => pattern.test(text))) {
        return category;
      }
    }

    return 'Other';
  }

  /**
   * Validate description quality to prevent review fragments
   */
  private validateDescription(description?: string, name?: string): { errors: QualityError[], warnings: QualityWarning[] } {
    const errors: QualityError[] = [];
    const warnings: QualityWarning[] = [];

    if (!description || description.trim() === '') {
      warnings.push({
        code: 'DESCRIPTION_MISSING',
        message: 'Description is missing',
        field: 'description',
        suggestion: 'Add product description for better quality'
      });
      return { errors, warnings };
    }

    // Check for review fragments
    const reviewPatterns = [
      /^(I love|I hate|This is|Best|Worst|[0-9]+ stars|Highly recommend)/i,
      /\b(love this|hate this|amazing product|terrible product)\b/i
    ];

    for (const pattern of reviewPatterns) {
      if (pattern.test(description)) {
        errors.push({
          code: 'DESCRIPTION_REVIEW_FRAGMENT',
          message: 'Description contains review fragment instead of product information',
          severity: 'HIGH',
          field: 'description',
          value: description.substring(0, 100)
        });
        break;
      }
    }

    // Check if description duplicates name
    if (description === name) {
      errors.push({
        code: 'DESCRIPTION_DUPLICATES_NAME',
        message: 'Description is identical to product name',
        severity: 'MEDIUM',
        field: 'description',
        value: description
      });
    }

    // Check for minimum length
    if (description.length < 20) {
      warnings.push({
        code: 'DESCRIPTION_TOO_SHORT',
        message: 'Description is very short',
        field: 'description',
        suggestion: 'Add more detailed product information'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate data consistency (proof/ABV, age, etc.)
   */
  private validateDataConsistency(spirit: Partial<SpiritData>): { errors: QualityError[], warnings: QualityWarning[] } {
    const errors: QualityError[] = [];
    const warnings: QualityWarning[] = [];

    // Proof/ABV consistency
    if (spirit.proof && spirit.abv) {
      const expectedAbv = parseFloat(spirit.proof.toString()) / 2;
      const actualAbv = parseFloat(spirit.abv.toString());
      if (Math.abs(expectedAbv - actualAbv) > 0.2) {
        warnings.push({
          code: 'PROOF_ABV_MISMATCH',
          message: `Proof/ABV mismatch: ${spirit.proof} proof should be ${expectedAbv}% ABV, but found ${actualAbv}%`,
          field: 'proof,abv',
          suggestion: 'Verify proof and ABV values are correct'
        });
      }
    }

    // Age validation
    if (spirit.age) {
      const age = parseInt(spirit.age.toString());
      if (isNaN(age) || age < 1 || age > 100) {
        warnings.push({
          code: 'AGE_INVALID',
          message: `Invalid age statement: ${spirit.age}`,
          field: 'age',
          suggestion: 'Age should be between 1-100 years'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Calculate overall quality score (0-100)
   */
  private calculateQualityScore(spirit: Partial<SpiritData>, errors: QualityError[], warnings: QualityWarning[]): number {
    let score = 100;

    // Deduct points for errors
    errors.forEach(error => {
      switch (error.severity) {
        case 'CRITICAL':
          score -= 40;
          break;
        case 'HIGH':
          score -= 25;
          break;
        case 'MEDIUM':
          score -= 15;
          break;
      }
    });

    // Deduct points for warnings
    score -= warnings.length * 5;

    // Bonus points for completeness
    const fields = ['name', 'description', 'source_url', 'category', 'abv', 'proof'];
    const completedFields = fields.filter(field => spirit[field] && spirit[field] !== '').length;
    const completenessBonus = (completedFields / fields.length) * 10;
    score += completenessBonus;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Quick validation for critical blocking issues
   */
  hasCriticalErrors(spirit: Partial<SpiritData>): boolean {
    // Quick checks for immediate rejection
    if (!spirit.name || !spirit.source_url) {
      return true;
    }

    // Check for obvious bad names
    for (const pattern of INVALID_NAME_PATTERNS) {
      if (pattern.test(spirit.name)) {
        return true;
      }
    }

    // Check for banned domains
    if (spirit.source_url) {
      try {
        const domain = new URL(spirit.source_url).hostname.toLowerCase();
        for (const bannedDomain of BANNED_DOMAINS) {
          if (domain.includes(bannedDomain)) {
            return true;
          }
        }
      } catch {
        return true; // Invalid URL
      }
    }

    return false;
  }
}

export const comprehensiveDataQualityValidator = new ComprehensiveDataQualityValidator();