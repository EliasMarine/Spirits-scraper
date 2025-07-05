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
  
  // V3.1.6: Blog and article title patterns (from spirits_rows-7.csv analysis)
  /\breviews\s+ratings\s+and\s+facts\b/i,
  /\bwords\s+of\s+whisky\b/i,
  /\bwhisky\s+blog\b/i,
  /\bheadbangers\s+whisky\b/i,
  /\bgame\s+of\s+thrones\s+(single\s+malts|whisky)\b/i,
  /^if\s+you\s+had\s+to\s+choose\b/i,
  /^my\s+top\s+\d+\s+list\b/i,
  /\btop\s+\d+\s+list\s+of\b/i,
  /\btaste\s+the\s+dram\b/i,
  
  // V3.1.6: Generic category page patterns
  /^scotch\s+\d+\s+year\s+old\s+whisky$/i,  // Too generic
  /^year\s+old\s+(single\s+malt\s+)?scotch\s+whisky$/i,  // Incomplete name
  /^(single\s+malt\s+)?scotch\s+whisky$/i,  // Too generic without brand
  /^(whiskey|whisky|bourbon|scotch)\s+(reviews?|ratings?|facts?)\b/i,
  
  // V3.1.6: Blog post and forum content patterns
  /\b(podcast|episode|show|interview)\b.*\b(whisky|whiskey|bourbon)\b/i,
  /\b(forum|discussion|thread|post)\b.*\b(whisky|whiskey|bourbon)\b/i,
  /\bblog\s+(post|article|entry)\b/i,
  /\b(reddit|facebook|twitter)\b.*\b(whisky|whiskey|bourbon)\b/i,
  
  // V3.1.6: Comparison and list article patterns
  /\bversus\s+/i,
  /\bvs\.?\s+/i,
  /\bcompared\s+to\b/i,
  /\b\d+\s+(best|worst|top|absolute\s+best)\b/i,
  /\bthe\s+(fifty|fifty\s+best|ultimate|complete)\b/i,
  /\bcritic[''']?s\s+choice\b/i,
  /\bbest\s+of\s+\d{4}\b/i,
  
  // V3.1.6: Question and instructional patterns
  /^(why|how|what|when|where)\s+/i,
  /\s+(stands\s+out|responds\s+to|announces|unveils)\b/i,
  /\bcontinues\s+expansion\b/i,
  /^we['']?re\s+(living|tasting|trying)\b/i,
  /^i['']?ve\s+(tried|tasted)\s+hundreds\b/i,
  /^we\s+(tasted|tried)\s+\d+\b/i,
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
  'yelp.com',
  
  // V3.1.6: Blog and content domains (from spirits_rows-7.csv analysis)
  'whiskygospel.com',
  'wordsofwhisky.com',
  'tastethedram.com',
  'scotchmaltwhisky.co.uk',
  'thefiftybestwhiskies.com',
  'whiskybase.com/forum',
  'whiskybase.com/whiskies',
  
  // V3.1.6: Forum and discussion domains
  'scotchmaltwhisky.co.uk/forum',
  'straightbourbon.com/forum',
  'whiskymagazine.com/forum',
  'reddit.com/r/whiskey',
  'reddit.com/r/bourbon',
  'reddit.com/r/scotch',
  
  // V3.1.6: General content and media sites
  'medium.com',
  'wordpress.com',
  'blogspot.com',
  'substack.com',
  'podcasts.apple.com',
  'spotify.com/show',
  'podcasts.google.com'
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
    // V3.1.6 FIX: Use both category and type fields for validation
    const categoryToValidate = spirit.category || (spirit as any).type;
    const categoryValidation = this.validateCategory(spirit.name, spirit.description, categoryToValidate);
    errors.push(...categoryValidation.errors);
    warnings.push(...categoryValidation.warnings);

    // HIGH PRIORITY: Description Quality
    const descriptionValidation = this.validateDescription(spirit.description, spirit.name);
    errors.push(...descriptionValidation.errors);
    warnings.push(...descriptionValidation.warnings);

    // HIGH PRIORITY: Generic Product Detection
    const genericValidation = this.validateNotGenericProduct(spirit.name, spirit.brand);
    errors.push(...genericValidation.errors);
    warnings.push(...genericValidation.warnings);

    // MEDIUM PRIORITY: Data Consistency
    const consistencyValidation = this.validateDataConsistency(spirit);
    errors.push(...consistencyValidation.errors);
    warnings.push(...consistencyValidation.warnings);

    // V3.2 ULTRATHINK: Field Completeness Validation with Smart Defaults
    const completenessValidation = this.validateFieldCompleteness(spirit);
    errors.push(...completenessValidation.errors);
    warnings.push(...completenessValidation.warnings);
    
    // Apply smart defaults if available
    const smartDefaults = completenessValidation.suggestions;
    if (Object.keys(smartDefaults).length > 0) {
      for (const [field, value] of Object.entries(smartDefaults)) {
        recommendations.push(`Auto-detected ${field}: "${value}"`);
      }
    }

    // Calculate quality score
    const score = this.calculateQualityScore(spirit, errors, warnings);

    // V3.2 ULTRATHINK: HARD QUALITY STANDARDS - Minimum Score 70
    const criticalErrors = errors.filter(e => e.severity === 'CRITICAL');
    const highErrors = errors.filter(e => e.severity === 'HIGH');
    
    // ULTRA-STRICT STORAGE REQUIREMENTS
    const meetsCriticalRequirements = criticalErrors.length === 0;
    const meetsScoreRequirement = score >= 70; // RAISED from 60 to 70
    const meetsFieldRequirements = this.validateHardRequiredFields(spirit);
    
    const canStore = meetsCriticalRequirements && meetsScoreRequirement && meetsFieldRequirements;
    
    // Add quality gate warnings
    if (!meetsScoreRequirement && meetsCriticalRequirements) {
      warnings.push({
        code: 'QUALITY_SCORE_TOO_LOW',
        message: `Quality score ${score} is below minimum threshold of 70`,
        field: 'overall',
        suggestion: 'Improve data quality to meet storage requirements'
      });
    }
    
    if (!meetsFieldRequirements) {
      warnings.push({
        code: 'HARD_REQUIRED_FIELDS_MISSING',
        message: 'Missing hard required fields for production storage',
        field: 'overall',
        suggestion: 'Ensure name, source_url, and category are populated'
      });
    }

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
      
      // Check for banned domains (social media, forums, blogs)
      const domain = url.hostname.toLowerCase();
      const fullUrl = sourceUrl.toLowerCase();
      
      for (const bannedDomain of BANNED_DOMAINS) {
        if (domain.includes(bannedDomain) || fullUrl.includes(bannedDomain)) {
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
      
      // V3.1.6: Check for specific problematic URL patterns from CSV analysis
      const problematicUrlPatterns = [
        /\/forum\//i,
        /\/viewtopic\.php/i,
        /\/blog\//i,
        /\/post\//i,
        /\/article\//i,
        /\/review\//i,
        /\/comparison\//i,
        /\/guide\//i,
        /\/episode\//i,
        /\/podcast\//i,
        /\/show\//i,
        /about-scotch-whisky/i,
        /category\.aspx/i,
        /single-post/i,
        /wp-content/i
      ];
      
      for (const pattern of problematicUrlPatterns) {
        if (pattern.test(fullUrl)) {
          errors.push({
            code: 'URL_NON_PRODUCT_PATTERN',
            message: `Source URL appears to be blog/forum/article content: ${url.pathname}`,
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

    // V3.1.6 FIX: Check if category is missing or "Other"
    if (!category || category === 'Other') {
      // Try to detect category from name and description
      const text = `${name || ''} ${description || ''}`.toLowerCase();
      const detectedCategory = this.detectCategory(text);
      
      if (detectedCategory !== 'Other') {
        // V3.1.6 FIX: This should be a warning, not an error - the category CAN be detected
        warnings.push({
          code: 'CATEGORY_AUTO_DETECTABLE',
          message: `Category successfully auto-detected as "${detectedCategory}" from content`,
          field: 'category',
          suggestion: `Auto-detected category: "${detectedCategory}"`
        });
      } else {
        // Only error if we truly cannot detect any category
        errors.push({
          code: 'CATEGORY_DETECTION_FAILED',
          message: 'Category detection failed - cannot classify spirit type from available content',
          severity: 'MEDIUM', // V3.1.6 FIX: Reduced from HIGH to MEDIUM
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
   * Validate description quality to prevent review fragments and navigation contamination
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

    // V3.2 ULTRATHINK: Check for navigation/menu contamination (CRITICAL)
    const navigationPatterns = [
      /\bStaff Pick Notes\b/i,
      /\bYou May Also Enjoy\b/i,
      /\bItem Notes\b/i,
      /\bAdd to Cart\b/i,
      /\bFree Shipping\b/i,
      /\bBuy Now\b/i,
      /\bSelect Options\b/i,
      /\bOut of Stock\b/i,
      /\bIn Stock\b/i,
      /\bShop Now\b/i,
      /\bView Details\b/i,
      /\bProduct Details\b/i,
      /\bQuick View\b/i,
      /\bCompare Products\b/i,
      /\bRelated Products\b/i,
      /\bCustomers Also Bought\b/i,
      /\bCustomers Who Viewed\b/i,
      /\bFrequently Bought Together\b/i
    ];

    for (const pattern of navigationPatterns) {
      if (pattern.test(description)) {
        errors.push({
          code: 'DESCRIPTION_NAVIGATION_CONTAMINATION',
          message: 'Description contains website navigation/menu text instead of product information',
          severity: 'CRITICAL',
          field: 'description',
          value: description.substring(0, 150)
        });
        return { errors, warnings }; // Critical error, don't continue
      }
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

    // V3.2: Check for generic category descriptions
    const genericDescriptions = [
      /^SPIRITS$/i,
      /^Bourbon$/i,
      /^Whiskey$/i,
      /^Rum$/i,
      /^Gin$/i,
      /^Vodka$/i,
      /^Tequila$/i,
      /^(Bourbon|Whiskey|Rum|Gin|Vodka|Tequila),\s*SPIRITS$/i
    ];

    for (const pattern of genericDescriptions) {
      if (pattern.test(description.trim())) {
        errors.push({
          code: 'DESCRIPTION_TOO_GENERIC',
          message: 'Description is too generic (just category name)',
          severity: 'HIGH',
          field: 'description',
          value: description
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
   * V3.1.6: Validate that the product is not a generic category or incomplete name
   * Prevents entries like "Scotch 18 Year Old Whisky" or "Year Old Single Malt Scotch Whisky"
   */
  private validateNotGenericProduct(name?: string, brand?: string): { errors: QualityError[], warnings: QualityWarning[] } {
    const errors: QualityError[] = [];
    const warnings: QualityWarning[] = [];

    if (!name || name.trim() === '') {
      return { errors, warnings };
    }

    const normalizedName = name.toLowerCase().trim();

    // Generic spirit type patterns without specific brand/product
    const genericPatterns = [
      /^(single\s+malt\s+)?scotch\s+whisky?$/i,
      /^(single\s+malt\s+)?whisky?$/i,
      /^bourbon\s+whiskey$/i,
      /^irish\s+whiskey$/i,
      /^rye\s+whiskey$/i,
      /^tennessee\s+whiskey$/i,
      /^vodka$/i,
      /^gin$/i,
      /^rum$/i,
      /^tequila$/i,
      /^cognac$/i,
      /^brandy$/i
    ];

    // Check for generic patterns
    for (const pattern of genericPatterns) {
      if (pattern.test(normalizedName)) {
        errors.push({
          code: 'NAME_TOO_GENERIC',
          message: `Product name is too generic: "${name}" - lacks specific brand or product identification`,
          severity: 'CRITICAL',
          field: 'name',
          value: name
        });
        return { errors, warnings };
      }
    }

    // Incomplete name patterns (missing brand information)
    const incompletePatterns = [
      /^\d+\s+year\s+old\s+(single\s+malt\s+)?scotch\s+whisky?$/i,  // "18 Year Old Scotch Whisky"
      /^year\s+old\s/i,  // "Year Old..." (incomplete)
      /^\d+\s+year\s+old\s+(whisky?|bourbon|vodka|gin|rum)$/i,  // Age without brand
      /^(single\s+malt\s+)?(scotch|irish|bourbon|rye)\s+\d+\s+year\s+old$/i  // Type + age without brand
    ];

    // Check for incomplete patterns
    for (const pattern of incompletePatterns) {
      if (pattern.test(normalizedName)) {
        errors.push({
          code: 'NAME_INCOMPLETE',
          message: `Product name appears incomplete or generic: "${name}" - missing brand or specific product name`,
          severity: 'HIGH',
          field: 'name',
          value: name
        });
        return { errors, warnings };
      }
    }

    // Category description patterns (like category pages)
    const categoryPatterns = [
      /^(discover|browse|explore|shop)\s+/i,
      /\s+(category|collection|selection|range)$/i,
      /^all\s+/i,
      /\s+(products|items|spirits)$/i
    ];

    for (const pattern of categoryPatterns) {
      if (pattern.test(normalizedName)) {
        warnings.push({
          code: 'NAME_CATEGORY_LIKE',
          message: `Product name resembles a category or collection page`,
          field: 'name',
          suggestion: 'Verify this is a specific product, not a category page'
        });
      }
    }

    // If brand is provided but name is still generic relative to brand
    if (brand && brand.trim() !== '') {
      const brandName = brand.toLowerCase().trim();
      // If the name is just the brand + generic type, it's likely not a specific product
      const brandGenericPatterns = [
        new RegExp(`^${brandName}\\s+(whisky?|bourbon|vodka|gin|rum|tequila|scotch)$`, 'i'),
        new RegExp(`^${brandName}\\s+(single\\s+malt|blended)$`, 'i')
      ];

      for (const pattern of brandGenericPatterns) {
        if (pattern.test(normalizedName)) {
          warnings.push({
            code: 'NAME_BRAND_GENERIC',
            message: `Product name appears to be brand + generic type: "${name}"`,
            field: 'name',
            suggestion: 'Look for specific product name, age statement, or expression name'
          });
        }
      }
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
    if (spirit.age_statement) {
      const ageMatch = spirit.age_statement.match(/(\d+)\s*(?:year|yr)/i);
      if (ageMatch) {
        const age = parseInt(ageMatch[1]);
        if (isNaN(age) || age < 1 || age > 100) {
          warnings.push({
            code: 'AGE_INVALID',
            message: `Invalid age statement: ${spirit.age_statement}`,
            field: 'age_statement',
            suggestion: 'Age should be between 1-100 years'
          });
        }
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
   * V3.2 ULTRATHINK: Field completeness validation with smart defaults
   */
  private validateFieldCompleteness(spirit: Partial<SpiritData>): { errors: QualityError[], warnings: QualityWarning[], suggestions: Record<string, any> } {
    const errors: QualityError[] = [];
    const warnings: QualityWarning[] = [];
    const suggestions: Record<string, any> = {};

    // CRITICAL REQUIRED FIELDS
    const requiredFields = ['name', 'source_url', 'category'];
    for (const field of requiredFields) {
      if (!spirit[field] || spirit[field] === '') {
        errors.push({
          code: 'FIELD_REQUIRED_MISSING',
          message: `Required field "${field}" is missing`,
          severity: 'CRITICAL',
          field: field
        });
      }
    }

    // SMART DEFAULTS: origin_country
    if (!spirit.origin_country || spirit.origin_country === '') {
      const detectedCountry = this.detectOriginCountry(spirit.name, spirit.description, spirit.category);
      if (detectedCountry !== 'Unknown') {
        suggestions.origin_country = detectedCountry;
        warnings.push({
          code: 'ORIGIN_COUNTRY_AUTO_DETECTABLE',
          message: `Origin country can be auto-detected as "${detectedCountry}"`,
          field: 'origin_country',
          suggestion: `Set origin_country to: "${detectedCountry}"`
        });
      } else {
        warnings.push({
          code: 'ORIGIN_COUNTRY_MISSING',
          message: 'Origin country is missing and cannot be auto-detected',
          field: 'origin_country',
          suggestion: 'Manually set origin_country for better data quality'
        });
      }
    }

    // SMART DEFAULTS: distillery (if brand is provided)
    if (!spirit.distillery && spirit.brand) {
      const detectedDistillery = this.detectDistillery(spirit.brand, spirit.name);
      if (detectedDistillery !== 'Unknown') {
        suggestions.distillery = detectedDistillery;
        warnings.push({
          code: 'DISTILLERY_AUTO_DETECTABLE',
          message: `Distillery can be auto-detected as "${detectedDistillery}"`,
          field: 'distillery',
          suggestion: `Set distillery to: "${detectedDistillery}"`
        });
      }
    }

    // FIELD QUALITY CHECKS
    // Volume normalization
    if (spirit.volume && spirit.volume !== '') {
      const normalizedVolume = this.normalizeVolume(spirit.volume);
      if (normalizedVolume !== spirit.volume) {
        suggestions.volume = normalizedVolume;
        warnings.push({
          code: 'VOLUME_NORMALIZATION',
          message: `Volume can be normalized from "${spirit.volume}" to "${normalizedVolume}"`,
          field: 'volume',
          suggestion: `Normalize volume to: "${normalizedVolume}"`
        });
      }
    }

    // Price validation
    if (spirit.price !== undefined && spirit.price !== null) {
      if (typeof spirit.price === 'number') {
        if (spirit.price < 0 || spirit.price > 10000) {
          warnings.push({
            code: 'PRICE_INVALID_RANGE',
            message: `Price value is outside reasonable range: ${spirit.price}`,
            field: 'price',
            suggestion: 'Price should be between $0-$10,000'
          });
        }
      } else {
        warnings.push({
          code: 'PRICE_INVALID_TYPE',
          message: `Price should be a number, found: ${typeof spirit.price}`,
          field: 'price',
          suggestion: 'Convert price to numeric value'
        });
      }
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Detect origin country based on spirit characteristics
   */
  private detectOriginCountry(name?: string, description?: string, category?: string): string {
    const text = `${name || ''} ${description || ''} ${category || ''}`.toLowerCase();

    // Priority-based country detection
    const countryPatterns = {
      'United States': [
        /\bbourbon\b/i,
        /\brye\s+whiskey\b/i,
        /\btennessee\s+whiskey\b/i,
        /\bamerican\s+(single\s+malt|whiskey)\b/i,
        /\bkentucky\b/i,
        /\btennessee\b/i,
        /\b(jack\s+daniel's|jim\s+beam|maker's\s+mark|buffalo\s+trace|four\s+roses|wild\s+turkey)\b/i
      ],
      'Scotland': [
        /\bscotch\b/i,
        /\bsingle\s+malt\b/i,
        /\b(highland|speyside|islay|campbeltown|lowland)\b/i,
        /\b(macallan|glenfiddich|glenlivet|johnnie\s+walker|chivas|lagavulin|ardbeg)\b/i
      ],
      'Ireland': [
        /\birish\s+whiskey\b/i,
        /\b(jameson|bushmills|tullamore|redbreast|green\s+spot)\b/i
      ],
      'Japan': [
        /\bjapanese\s+whisky\b/i,
        /\b(yamazaki|hakushu|nikka|hibiki|taketsuru)\b/i
      ],
      'Canada': [
        /\bcanadian\s+whisky\b/i,
        /\b(crown\s+royal|canadian\s+club|forty\s+creek)\b/i
      ],
      'Mexico': [
        /\btequila\b/i,
        /\bmezcal\b/i,
        /\b(blanco|reposado|añejo|extra\s+añejo)\b/i,
        /\b(patron|don\s+julio|herradura|clase\s+azul)\b/i
      ],
      'France': [
        /\bcognac\b/i,
        /\barmagnac\b/i,
        /\bcalvados\b/i,
        /\b(hennessy|rémy\s+martin|martell|courvoisier)\b/i
      ],
      'United Kingdom': [
        /\bgin\b/i,
        /\blondon\s+dry\b/i,
        /\b(hendrick's|tanqueray|bombay|plymouth)\b/i
      ]
    };

    for (const [country, patterns] of Object.entries(countryPatterns)) {
      if (patterns.some(pattern => pattern.test(text))) {
        return country;
      }
    }

    return 'Unknown';
  }

  /**
   * Detect distillery from brand name
   */
  private detectDistillery(brand?: string, name?: string): string {
    if (!brand) return 'Unknown';

    const text = `${brand} ${name || ''}`.toLowerCase();

    // Known brand-to-distillery mappings
    const distilleryMappings = {
      'jack daniel\'s': 'Jack Daniel Distillery',
      'jim beam': 'Jim Beam Distillery',
      'maker\'s mark': 'Maker\'s Mark Distillery',
      'buffalo trace': 'Buffalo Trace Distillery',
      'four roses': 'Four Roses Distillery',
      'wild turkey': 'Wild Turkey Distillery',
      'woodford reserve': 'Woodford Reserve Distillery',
      'macallan': 'The Macallan Distillery',
      'glenfiddich': 'Glenfiddich Distillery',
      'glenlivet': 'The Glenlivet Distillery',
      'johnnie walker': 'Multiple Scottish Distilleries',
      'jameson': 'Midleton Distillery',
      'bushmills': 'Old Bushmills Distillery',
      'yamazaki': 'Yamazaki Distillery',
      'nikka': 'Nikka Distilleries'
    };

    const brandLower = brand.toLowerCase();
    for (const [brandPattern, distillery] of Object.entries(distilleryMappings)) {
      if (brandLower.includes(brandPattern)) {
        return distillery;
      }
    }

    // Default: assume brand name is distillery name
    return `${brand} Distillery`;
  }

  /**
   * Normalize volume to standard formats
   */
  private normalizeVolume(volume: string): string {
    if (!volume) return '';

    const volumeStr = volume.toLowerCase().trim();
    
    // Common volume normalizations
    const normalizations = {
      '0.75l': '750ml',
      '0.7l': '700ml',
      '1l': '1000ml',
      '1.0l': '1000ml',
      '1.75l': '1750ml',
      '50ml': '50ml',
      '100ml': '100ml',
      '200ml': '200ml',
      '375ml': '375ml',
      '500ml': '500ml',
      '750ml': '750ml',
      '1000ml': '1000ml',
      '1750ml': '1750ml'
    };

    // Extract number and unit
    const match = volumeStr.match(/(\d+(?:\.\d+)?)\s*(ml|l|oz|cl)/);
    if (match) {
      const [, number, unit] = match;
      const num = parseFloat(number);
      
      if (unit === 'l') {
        return `${Math.round(num * 1000)}ml`;
      } else if (unit === 'cl') {
        return `${Math.round(num * 10)}ml`;
      } else if (unit === 'oz') {
        return `${Math.round(num * 29.5735)}ml`;
      } else if (unit === 'ml') {
        return `${Math.round(num)}ml`;
      }
    }

    return normalizations[volumeStr] || volume;
  }


  /**
   * V3.2 ULTRATHINK: Validate hard required fields for production storage
   */
  private validateHardRequiredFields(spirit: Partial<SpiritData>): boolean {
    // ABSOLUTE MINIMUM FIELDS FOR PRODUCTION STORAGE
    const hardRequiredFields = [
      'name',        // Product name
      'source_url',  // Source verification
      'category'     // Spirit classification
      // OLD CODE START: origin_country was incorrectly marked as hard required
      // 'origin_country' // Geographic origin
      // OLD CODE END
      // Note: origin_country is now "nice to have" - contributes to quality score but doesn't block storage
    ];

    // Check if all hard required fields are present and non-empty
    for (const field of hardRequiredFields) {
      const value = spirit[field];
      if (!value || value === '' || value === 'Other' || value === 'Unknown') {
        logger.debug(`Hard required field validation failed: ${field} = "${value}"`);
        return false;
      }
    }

    // Additional business logic validation
    // Category cannot be "Other" for production storage
    if (spirit.category === 'Other') {
      logger.debug(`Category validation failed: category cannot be "Other" for production storage`);
      return false;
    }

    // Name cannot be too generic or incomplete
    if (spirit.name && spirit.name.length < 10) {
      logger.debug(`Name validation failed: name too short for production storage`);
      return false;
    }

    return true;
  }

  /**
   * V3.2 ULTRATHINK: Apply smart defaults to spirit data
   */
  applySmartDefaults(spirit: Partial<SpiritData>): Partial<SpiritData> {
    const enhanced = { ...spirit };
    const completenessValidation = this.validateFieldCompleteness(spirit);
    const suggestions = completenessValidation.suggestions;

    // Apply all available smart defaults
    for (const [field, value] of Object.entries(suggestions)) {
      if (!enhanced[field] || enhanced[field] === '') {
        enhanced[field] = value;
        logger.info(`Applied smart default: ${field} = "${value}"`);
      }
    }

    return enhanced;
  }

  /**
   * V3.2 ULTRATHINK: Get enhanced quality validation with smart defaults applied
   */
  validateWithSmartDefaults(spirit: Partial<SpiritData>): QualityValidationResult & { enhancedSpirit: Partial<SpiritData> } {
    // First, apply smart defaults
    const enhancedSpirit = this.applySmartDefaults(spirit);
    
    // Then validate the enhanced version
    const validation = this.validate(enhancedSpirit);
    
    return {
      ...validation,
      enhancedSpirit
    };
  }

  /**
   * V3.2 ULTRATHINK: Get production readiness assessment
   */
  getProductionReadiness(spirit: Partial<SpiritData>): {
    isProductionReady: boolean;
    qualityScore: number;
    missingRequiredFields: string[];
    criticalIssues: string[];
    recommendations: string[];
  } {
    const validation = this.validate(spirit);
    const criticalErrors = validation.errors.filter(e => e.severity === 'CRITICAL');
    const hardFieldsValid = this.validateHardRequiredFields(spirit);
    
    const missingRequiredFields = [];
    const hardRequiredFields = ['name', 'source_url', 'category'];
    
    for (const field of hardRequiredFields) {
      const value = spirit[field];
      if (!value || value === '' || value === 'Other' || value === 'Unknown') {
        missingRequiredFields.push(field);
      }
    }

    const criticalIssues = criticalErrors.map(e => e.message);
    
    return {
      isProductionReady: validation.canStore,
      qualityScore: validation.score,
      missingRequiredFields,
      criticalIssues,
      recommendations: validation.recommendations
    };
  }

  /**
   * V3.2 ULTRATHINK: Batch quality assessment for monitoring
   */
  assessBatchQuality(spirits: Partial<SpiritData>[]): {
    totalSpirits: number;
    productionReady: number;
    averageScore: number;
    scoreBuckets: Record<string, number>;
    topIssues: Record<string, number>;
    categoryDistribution: Record<string, number>;
  } {
    const stats = {
      totalSpirits: spirits.length,
      productionReady: 0,
      averageScore: 0,
      scoreBuckets: {
        'Excellent (90-100)': 0,
        'Good (80-89)': 0,
        'Acceptable (70-79)': 0,
        'Poor (60-69)': 0,
        'Unacceptable (<60)': 0
      },
      topIssues: {} as Record<string, number>,
      categoryDistribution: {} as Record<string, number>
    };

    let totalScore = 0;

    for (const spirit of spirits) {
      const validation = this.validate(spirit);
      totalScore += validation.score;

      if (validation.canStore) {
        stats.productionReady++;
      }

      // Score buckets
      const score = validation.score;
      if (score >= 90) stats.scoreBuckets['Excellent (90-100)']++;
      else if (score >= 80) stats.scoreBuckets['Good (80-89)']++;
      else if (score >= 70) stats.scoreBuckets['Acceptable (70-79)']++;
      else if (score >= 60) stats.scoreBuckets['Poor (60-69)']++;
      else stats.scoreBuckets['Unacceptable (<60)']++;

      // Track issues
      for (const error of validation.errors) {
        stats.topIssues[error.code] = (stats.topIssues[error.code] || 0) + 1;
      }

      // Category distribution
      const category = spirit.category || 'Unknown';
      stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + 1;
    }

    stats.averageScore = totalScore / spirits.length;

    return stats;
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