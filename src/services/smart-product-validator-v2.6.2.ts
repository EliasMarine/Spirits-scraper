import nlp from 'compromise';
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import { logger } from '../utils/logger.js';

// Initialize winkNLP
const wink = winkNLP(model);
const its = wink.its;

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
  normalizedName?: string;
}

interface LearnedPattern {
  pattern: string;
  type: 'valid' | 'invalid';
  confidence: number;
  count: number;
  examples: string[];
}

export class SmartProductValidator {
  private learnedPatterns: Map<string, LearnedPattern> = new Map();
  private readonly LEARNING_THRESHOLD = 5;
  private readonly CONFIDENCE_THRESHOLD = 0.3; // Keep V2.6.1 threshold
  
  // V2.6.2: Hard rejection patterns for non-products
  private readonly HARD_REJECT_PATTERNS = [
    // Event/venue patterns
    /\b(event\s+space|loft|venue|theater|theatre)\b/i,
    /\bthe\s+vendry\b/i,
    
    // Architecture/construction/services
    /\b(architects?|architecture|construction|bottling)\b.*\b(joseph|company|firm|llc|services?)\b/i,
    /\b(design|construction)\s+(by|services?)\b/i,
    /\bdistillery\s+(design|construction)\b/i,
    
    // Tours/experiences/classes
    /\b(experience|tour|academy|tasting\s+room|visitor\s+center)\b/i,
    /\bwinery\b.*\b(oldest|nashville|experience)\b/i,
    /\b(workshop|class|lesson)\s+(experience|for\s+beginners)?\b/i,
    /\b(making|production)\s+class\b/i,
    
    // Food/non-beverage products
    /\b(spices?|smoked|brittle|honey|sauce|coffee|cake|cookie|syrup|marinade)\b/i,
    /\b(barrel\s+aged|smoked|infused)\s+(spices?|coffee|food|maple|syrup)\b/i,
    /\b(candles?|furniture|decor|accessories)\b/i,
    /\bscented\s+candles?\b/i,
    /\b(biscuits?|pork|belly|chunks|glazed)\b/i,
    
    // Articles/guides/educational content
    /^(the\s+)?(ultimate\s+)?(guide|everything|learn|how\s+to|understanding)\b/i,
    /^(the\s+)?(well\s+known|best|top\s+\d+|all\s+about)/i,
    /\b(sweeter\s+notes|tasting\s+notes)\b.*\b(article|blog|guide)\b/i,
    /\bthe\s+well\s+known\s+\w+\s+with\s+\w+\s+notes\b/i,
    /\b(beginner'?s?\s+guide|process\s+explained)\b/i,
    /\bvs\b.*\bwhat'?s?\s+the\s+difference\b/i,
    /^(learn|understand|discover)\s+(about|how)\b/i,
    /\b(history|story|about|our\s+story)\b.*\b(page|distillery)\b/i,
    /\b(belles?|women)\s+and\s+\w+\s+(women|belles?)\b/i,
    /^it'?s?\s+all\s+about\b/i,
    
    // Marketing/taglines/slogans
    /\ba\s+new\s+blend\s+of\s+\w+\s+makers?\b/i,
    /\bcompany\s+a\s+new\s+blend\b/i,
    /^(the\s+)?(spirit|taste|essence)\s+of\s+\w+\s+(since|heritage)\b/i,
    /^crafted\s+for\s+the\s+\w+\s+palate\b/i,
    
    // Store/shopping/availability
    /^(shop|buy|purchase|available|visit)\s+(our|for|online)\b/i,
    /\bavailable\s+for\s+purchase\s+are\b/i,
    /\b(collection|selection)\s+of\s+(bourbon|whiskey)s?\b/i,
    /\bfree\s+shipping\b/i,
    /\b(online|our)\s+(store|shop|whiskey\s+store)\b/i,
    /\bremedy\s+liquor\b/i,
    /^-?\w*\s*(range|wine)\s*&\s*$/i,
    /^-\w+\s+\w+\s+\w+\s*&$/i,
    
    // Contact info/phone numbers
    /\bcall\s*\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}\b/i,
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    
    // Events/meetups/social
    /\bw\/\s+\w+\s+of\s+\w+/i,
    /\b(drink|taste|meet)\s+\w+\s+bourbon\b/i,
    /\bmeet\s+the\s+.*\s+event\b/i,
    /\b(join\s+us|evening\s+at|wednesday\s+nights?)\b/i,
    /\b(monthly|weekly|bourbon\s+club|whiskey\s+club)\s+(meeting|event)\b/i,
    /\b&\s*(jazz|music|dinner)\s+evening\b/i,
    
    // Educational/university
    /\b(university|school|institute|college)\b(?!.*\b(edition|release|batch|barrel)\b)/i,
    /\b(production|mash\s+bill)s?\s+(process\s+)?explained\b/i,
    
    // News/awards as standalone
    /^(breaking|news|announced)\b.*\b(opens?|wins?|awarded)\b/i,
    /^\d{4}\s+world'?s?\s+most\s+\w+\b/i,
    /\bwins?\s+(double\s+)?gold\s+medal\b/i,
    
    // About/company pages
    /^(about|our\s+story)\b/i,
    /^the\s+(history|story)\s+of\b/i,
    
    // Location/destination info  
    /\b(bourbon|whiskey)\s+trail\b/i,
    /\bdistillery\s+.*\btrail\b/i,
    /\b(capital|heart)\s+of\s+the\s+world\b/i,
    
    // Websites/exchanges
    /\bthe\s+whisky\s+exchange\s*$/i,
    
    // Gift sets/samples/collections
    /\b(gift\s+(set|pack)|sample\s+set|tasting\s+set|mini\s+(bottle\s+)?collection)\b/i,
    /\b(set|pack|collection)\s+(with\s+glasses|\d+x\d+ml)\b/i,
    /\bbundles?\s+\w+\s+collection\b/i,
    
    // Invalid/generic names
    /^(core|unknown|generic|basic)\s+(bourbon|whiskey|whisky)\b/i,
    /^\d+\s*[gG]\s+\w+/i,
    
    // Multiple products
    /\b(trace|roses?|turkey|beam|west|daniel|benchmark)\s*(&|&amp;)\s*(trace|roses?|turkey|beam|west|daniel|benchmark)\b/i,
    /\b\w+\s+(trace|roses?|turkey|beam|west|daniel)\s*(&|&amp;)\s*\w+\s+(trace|roses?|turkey|beam|west|daniel)\b/i
  ];

  constructor() {
    // Extend compromise with custom patterns for spirits
    nlp.extend({
      tags: {
        SpiritProduct: {
          isA: 'Product',
          notA: 'Place'
        },
        SpiritBrand: {
          isA: 'Brand',
          notA: 'CommonWord'
        },
        SpiritType: {
          isA: 'Product',
          notA: 'Adjective'
        },
        NonProduct: {
          isA: 'Thing',
          notA: 'Product'
        }
      },
      words: {
        // Known spirit types
        'bourbon': 'SpiritType',
        'whiskey': 'SpiritType',
        'whisky': 'SpiritType',
        'scotch': 'SpiritType',
        'vodka': 'SpiritType',
        'gin': 'SpiritType',
        'rum': 'SpiritType',
        'tequila': 'SpiritType',
        'mezcal': 'SpiritType',
        'cognac': 'SpiritType',
        'brandy': 'SpiritType',
        'rye': 'SpiritType',
        
        // V2.6.2: Enhanced non-product indicators
        'university': 'NonProduct',
        'academy': 'NonProduct',
        'school': 'NonProduct',
        'tour': 'NonProduct',
        'tours': 'NonProduct',
        'experience': 'NonProduct',
        'event': 'NonProduct',
        'space': 'NonProduct',
        'loft': 'NonProduct',
        'venue': 'NonProduct',
        'architects': 'NonProduct',
        'architecture': 'NonProduct',
        'winery': 'NonProduct',
        'trail': 'NonProduct',
        'exchange': 'NonProduct',
        'brittle': 'NonProduct',
        'spice': 'NonProduct',
        'spices': 'NonProduct',
        'coffee': 'NonProduct',
        'honey': 'NonProduct'
      }
    });
  }

  /**
   * Validate a product name using NLP analysis
   */
  async validateProductName(name: string): Promise<ValidationResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let confidence = 1.0;

    // Basic checks
    if (!name || name.trim().length === 0) {
      return {
        isValid: false,
        confidence: 0,
        issues: ['Empty product name'],
        suggestions: []
      };
    }
    
    // V2.6.2: Check hard rejection patterns FIRST
    // But skip if it's clearly a product with store mention
    const hasValidProductIndicators = /\b(bourbon|whiskey|whisky|rye|vodka|gin|rum|tequila|mezcal|cognac|brandy)\b/i.test(name) &&
      /\b(straight|single\s+(malt|barrel)|small\s+batch|bottled|cask\s+strength|proof|year|aged?|series|limited|edition|reserve)\b/i.test(name) &&
      !/^(core|unknown|generic|basic|bundles?)\b/i.test(name);
    
    const isLikelyProductWithStore = hasValidProductIndicators && 
      /\b(available\s+at|now\s+at|from)\s+\w+/i.test(name);
    
    if (!isLikelyProductWithStore) {
      for (const pattern of this.HARD_REJECT_PATTERNS) {
        if (pattern.test(name)) {
          return {
            isValid: false,
            confidence: 0,
            issues: ['Matches non-product pattern'],
            suggestions: ['This appears to be a non-product listing']
          };
        }
      }
    }
    
    // Check for fragment names
    if (name.trim().length < 5 || /^[.,;:!?]/.test(name.trim())) {
      return {
        isValid: false,
        confidence: 0,
        issues: ['Product name is too short or fragment'],
        suggestions: ['Provide complete product name']
      };
    }

    // Clean and normalize the name
    const normalizedName = this.normalizeProductName(name);
    const lowerName = normalizedName.toLowerCase();
    
    // NLP Analysis
    const doc = nlp(normalizedName);
    
    // V2.6.2: Enhanced non-product detection
    const nonProductCount = doc.match('#NonProduct').length;
    if (nonProductCount > 1) {
      confidence -= 0.3 * nonProductCount;
      issues.push(`Contains ${nonProductCount} non-product indicators`);
    }
    
    // Check for specific problematic patterns
    if (/\b(event|space|loft|venue|tour|experience|trail|winery)\b/i.test(normalizedName)) {
      confidence -= 0.5;
      issues.push('Contains venue/event/tour terminology');
    }
    
    // Check for food/non-beverage products
    if (/\b(brittle|spices?|coffee|honey|sauce|cake|cookie)\b/i.test(normalizedName)) {
      confidence -= 0.7;
      issues.push('Appears to be a food product');
    }
    
    // Check for marketing/tagline patterns
    if (/\ba\s+new\s+blend\s+of\b/i.test(normalizedName) || 
        /\bthe\s+well\s+known\b/i.test(normalizedName)) {
      confidence -= 0.6;
      issues.push('Appears to be marketing copy or tagline');
    }

    // Positive signals - boost confidence
    if (doc.has('#SpiritType')) {
      confidence = Math.min(1.0, confidence + 0.2);
    }
    
    // Check for valid spirit brand patterns
    const knownBrands = [
      'buffalo trace', 'four roses', 'high west', 'bardstown', 'belle meade',
      'wild turkey', 'maker\'s mark', 'jim beam', 'jack daniel', 'woodford'
    ];
    
    const hasKnownBrand = knownBrands.some(brand => lowerName.includes(brand));
    if (hasKnownBrand) {
      confidence = Math.min(1.0, confidence + 0.3);
    }

    // Check for year patterns (good signal)
    if (doc.has('/\\d{4}/') && !doc.has('call')) {
      const year = parseInt(doc.match('/\\d{4}/').text());
      if (year >= 1800 && year <= new Date().getFullYear()) {
        confidence = Math.min(1.0, confidence + 0.1);
      }
    }
    
    // V2.6.2: Stricter validation - require higher confidence
    const isValid = confidence >= 0.5 && issues.length <= 2;

    return {
      isValid,
      confidence,
      issues,
      suggestions,
      normalizedName: normalizedName !== name ? normalizedName : undefined
    };
  }

  /**
   * Normalize product name using NLP
   */
  private normalizeProductName(name: string): string {
    let normalized = name;

    // Use compromise for smart normalization
    const doc = nlp(normalized);
    
    // Fix spacing issues
    normalized = doc.normalize({
      whitespace: true,
      punctuation: true,
      unicode: true
    }).text();

    // Remove trailing punctuation except for possessives
    normalized = normalized.replace(/[.,;:!?]+$/, '');
    
    // Fix common spacing issues
    normalized = normalized
      .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to spaces
      .replace(/(\d+)\s*ml\b/gi, '$1ml') // normalize ml
      .replace(/\s+/g, ' ') // multiple spaces to single
      .trim();

    return normalized;
  }

  /**
   * Learn from validation feedback
   */
  learnFromFeedback(name: string, isValid: boolean, reason?: string): void {
    const normalizedName = this.normalizeProductName(name);
    const doc = nlp(normalizedName);
    
    // Extract patterns from the name
    const patterns = this.extractPatterns(doc);
    
    patterns.forEach(pattern => {
      const key = `${pattern.type}:${pattern.value}`;
      const existing = this.learnedPatterns.get(key);
      
      if (existing) {
        // Update existing pattern
        existing.count++;
        existing.examples.push(name);
        if (existing.examples.length > 10) {
          existing.examples = existing.examples.slice(-10);
        }
        
        // Update confidence based on consistency
        const consistencyRate = existing.type === (isValid ? 'valid' : 'invalid') ? 1 : 0;
        existing.confidence = (existing.confidence * (existing.count - 1) + consistencyRate) / existing.count;
      } else {
        // Create new pattern
        this.learnedPatterns.set(key, {
          pattern: pattern.value,
          type: isValid ? 'valid' : 'invalid',
          confidence: 1.0,
          count: 1,
          examples: [name]
        });
      }
    });
  }

  /**
   * Extract patterns from text for learning
   */
  private extractPatterns(doc: any): Array<{type: string, value: string}> {
    const patterns: Array<{type: string, value: string}> = [];
    
    // Extract POS patterns
    const posTags = doc.out('tags');
    if (posTags.length > 0) {
      patterns.push({
        type: 'pos_pattern',
        value: posTags.slice(0, 3).join('-')
      });
    }

    // Extract word patterns
    const words = doc.terms().out('array');
    if (words.length >= 2) {
      // Bigrams
      for (let i = 0; i < words.length - 1; i++) {
        patterns.push({
          type: 'bigram',
          value: `${words[i]}_${words[i + 1]}`
        });
      }
    }

    return patterns;
  }

  /**
   * Get validation statistics
   */
  getStats(): {
    totalPatterns: number;
    validPatterns: number;
    invalidPatterns: number;
    avgConfidence: number;
  } {
    let validCount = 0;
    let invalidCount = 0;
    let totalConfidence = 0;

    this.learnedPatterns.forEach(pattern => {
      if (pattern.type === 'valid') {
        validCount++;
      } else {
        invalidCount++;
      }
      totalConfidence += pattern.confidence;
    });

    return {
      totalPatterns: this.learnedPatterns.size,
      validPatterns: validCount,
      invalidPatterns: invalidCount,
      avgConfidence: this.learnedPatterns.size > 0 
        ? totalConfidence / this.learnedPatterns.size 
        : 0
    };
  }
}

// Export singleton instance
export const smartProductValidator = new SmartProductValidator();