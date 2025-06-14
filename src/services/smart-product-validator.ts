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
  private readonly LEARNING_THRESHOLD = 5; // Number of examples before pattern is learned
  private readonly CONFIDENCE_THRESHOLD = 0.3; // V2.6.1: Lowered from 0.7 to reduce false rejections

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
        
        // Non-product indicators
        // V2.6.1: Removed overly common words that appear in valid products
        'university': 'NonProduct',
        'academy': 'NonProduct',
        'school': 'NonProduct',
        'tour': 'NonProduct',
        'tours': 'NonProduct',
        'review': 'NonProduct',
        'comparison': 'NonProduct',
        'vs': 'NonProduct',
        'versus': 'NonProduct',
        'article': 'NonProduct',
        'blog': 'NonProduct',
        'news': 'NonProduct',
        'call': 'NonProduct',
        'phone': 'NonProduct',
        
        // Food/non-beverage indicators
        'biscuit': 'NonProduct',
        'biscuits': 'NonProduct',
        'cookie': 'NonProduct',
        'cake': 'NonProduct',
        'coffee': 'NonProduct',
        'sauce': 'NonProduct',
        'pork': 'NonProduct',
        'belly': 'NonProduct',
        'recipe': 'NonProduct',
        'food': 'NonProduct',
        'glazed': 'NonProduct',
        'chunks': 'NonProduct',
        
        // Additional non-product indicators
        // V2.6.1: Removed common words found in valid products
        'about': 'NonProduct',
        'belles': 'NonProduct',
        'women': 'NonProduct',
        'purchase': 'NonProduct',
        'selection': 'NonProduct',
        'available': 'NonProduct'
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
    
    // Check for fragment names (too short or starting with punctuation)
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
    
    // NLP Analysis with compromise
    const doc = nlp(normalizedName);
    
    // Check for non-product patterns
    // V2.6.1: Reduced penalty from 0.5 to 0.2 - many valid products have these words
    if (doc.has('#NonProduct')) {
      confidence -= 0.2;
      issues.push('Contains non-product words');
      
      const nonProductWords = doc.match('#NonProduct').text();
      suggestions.push(`Remove non-product terms: ${nonProductWords}`);
    }

    // Check for review/comparison patterns
    if (doc.has('(review|comparison|vs|versus)')) {
      confidence -= 0.8;
      issues.push('Appears to be a review or comparison');
    }
    
    // Check for article/blog title patterns
    // V2.6.1: Also check for listing/selection patterns
    if (/^(it's|its|all about|the story of|guide to|how to)/i.test(normalizedName)) {
      confidence -= 0.9;
      issues.push('Appears to be an article or guide title');
    }
    
    // Check for store listing patterns
    if (/^(available|selection|purchase)/i.test(normalizedName)) {
      confidence -= 0.8;
      issues.push('Appears to be a store listing');
    }

    // Check for educational content
    if (doc.has('(university|academy|school|tour|experience)')) {
      confidence -= 0.9;
      issues.push('Appears to be educational or tour content');
    }

    // Check for phone numbers
    // V2.6.1: More accurate phone number detection
    if (/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(normalizedName)) {
      confidence -= 0.9;
      issues.push('Contains phone number');
      suggestions.push('Remove phone numbers from product name');
    }
    
    // V2.6: Check for food combinations (spirit + food item)
    const foodWords = ['biscuit', 'biscuits', 'cookie', 'cake', 'coffee', 'sauce', 'pork'];
    const hasSpiritType = doc.has('#SpiritType');
    const hasFoodWord = foodWords.some(word => lowerName.includes(word));
    
    if (hasSpiritType && hasFoodWord) {
      confidence -= 0.9;
      issues.push('Appears to be a food product, not a spirit');
    }
    
    // V2.6: Check for award/ranking patterns
    // V2.6.1: Only penalize if it's JUST an award, not a product with award mention
    if (/^\d{4}\s+(world's|america's|best|top|most|award|winner)/i.test(normalizedName) && normalizedName.length < 30) {
      confidence -= 0.8;
      issues.push('Appears to be an award or ranking announcement');
    } else if (/\d{4}\s+(world's|america's|best|top|most|award|winner)/i.test(normalizedName)) {
      // Product with award mention - small penalty
      confidence -= 0.1;
    }
    
    // V2.6: Check for store/company names ending with "Liquor", "Store", "Shop"
    // V2.6.1: Many products include store names - reduce penalty
    if (/^(liquor|liquors|store|shop|market|outlet)$/i.test(normalizedName)) {
      // Just a store name alone
      confidence -= 0.8;
      issues.push('Appears to be a store or company name');
    } else if (/\b(liquor|liquors|store|shop|market|outlet)$/i.test(normalizedName)) {
      // Product name with store suffix - smaller penalty
      confidence -= 0.2;
    }

    // Check for generic categories (not specific products)
    const genericPatterns = [
      'bottled in bond bourbon',
      'single barrel bourbon',
      'small batch bourbon',
      'straight bourbon whiskey',
      'bourbon whiskey',
      'rye whiskey'
    ];
    
    const isGenericCategory = genericPatterns.some(pattern => 
      lowerName === pattern || lowerName === pattern + 's'
    );
    
    if (isGenericCategory) {
      confidence -= 0.9;
      issues.push('Generic category, not specific product');
    }

    // WinkNLP analysis for deeper understanding
    const winkDoc = wink.readDoc(normalizedName);
    
    // Extract entities and check for suspicious patterns
    const entities = winkDoc.entities().out(its.detail);
    const hasEmail = entities.some(e => e.type === 'EMAIL');
    const hasUrl = entities.some(e => e.type === 'URL');
    
    if (hasEmail || hasUrl) {
      confidence -= 0.5;
      issues.push('Contains email or URL');
      suggestions.push('Remove contact information');
    }

    // Check sentence structure - product names should be noun phrases
    const tokens = winkDoc.tokens();
    const posTags = tokens.out(its.pos);
    
    // Count different POS types
    const posCount = {
      nouns: posTags.filter(tag => tag.startsWith('N')).length,
      verbs: posTags.filter(tag => tag.startsWith('V')).length,
      total: posTags.length
    };
    
    // Product names should be noun-heavy
    // V2.6: Relaxed noun ratio to account for proper nouns, possessives, and brand names
    const nounRatio = posCount.nouns / posCount.total;
    // Only flag if very low noun ratio AND has many verbs (indicative of sentences)
    if (nounRatio < 0.15 && posCount.verbs > 1 && posCount.total > 3) {
      confidence -= 0.3;
      issues.push('Unusual grammar structure for product name');
    }

    // Too many verbs suggest it's a sentence/description
    // V2.6: Increased threshold to allow for complex product names
    if (posCount.verbs > 3) {
      confidence -= 0.4;
      issues.push('Contains too many verbs for a product name');
    }

    // Check against learned patterns
    const patternMatch = this.checkLearnedPatterns(normalizedName);
    if (patternMatch) {
      if (patternMatch.type === 'invalid') {
        confidence *= (1 - patternMatch.confidence);
        issues.push(`Matches known invalid pattern: ${patternMatch.pattern}`);
      } else {
        confidence = Math.min(1.0, confidence * (1 + patternMatch.confidence * 0.5));
      }
    }

    // Positive signals - boost confidence
    if (doc.has('#SpiritType')) {
      confidence = Math.min(1.0, confidence + 0.2);
    }

    // Check for year patterns (good signal)
    if (doc.has('/\\d{4}/') && !doc.has('call')) {
      const year = parseInt(doc.match('/\\d{4}/').text());
      if (year >= 1800 && year <= new Date().getFullYear()) {
        confidence = Math.min(1.0, confidence + 0.1);
      }
    }

    // Final validation
    // V2.6.1: Allow validation if confidence is good OR no critical issues
    // Special case: Reject if contains "belles" and "women" together (non-product book title)
    if (normalizedName.toLowerCase().includes('belles') && normalizedName.toLowerCase().includes('women')) {
      confidence = 0;
      issues.push('Appears to be a book or article title');
    }
    
    const isValid = confidence >= this.CONFIDENCE_THRESHOLD || (confidence >= 0.2 && issues.length <= 1);

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

    // Fix specific patterns using winkNLP
    const winkDoc = wink.readDoc(normalized);
    
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
          existing.examples = existing.examples.slice(-10); // Keep last 10
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

    // Log learning progress
    if (this.learnedPatterns.size % 10 === 0) {
      logger.info(`Smart validator has learned ${this.learnedPatterns.size} patterns`);
    }
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
        value: posTags.slice(0, 3).join('-') // First 3 POS tags
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

    // Extract structural patterns
    const structure = {
      wordCount: words.length,
      hasNumbers: doc.has('#Value'),
      hasYear: doc.has('/\\d{4}/'),
      startsWith: words[0]?.toLowerCase() || '',
      endsWith: words[words.length - 1]?.toLowerCase() || ''
    };
    
    patterns.push({
      type: 'structure',
      value: JSON.stringify(structure)
    });

    return patterns;
  }

  /**
   * Check if name matches learned patterns
   */
  private checkLearnedPatterns(name: string): LearnedPattern | null {
    const doc = nlp(name);
    const patterns = this.extractPatterns(doc);
    
    let bestMatch: LearnedPattern | null = null;
    let bestScore = 0;

    patterns.forEach(pattern => {
      const key = `${pattern.type}:${pattern.value}`;
      const learned = this.learnedPatterns.get(key);
      
      if (learned && learned.count >= this.LEARNING_THRESHOLD) {
        const score = learned.confidence * learned.count;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = learned;
        }
      }
    });

    return bestMatch;
  }

  /**
   * Export learned patterns for persistence
   */
  exportLearnedPatterns(): string {
    const patterns = Array.from(this.learnedPatterns.entries()).map(([key, value]) => ({
      key,
      ...value
    }));
    
    return JSON.stringify(patterns, null, 2);
  }

  /**
   * Import previously learned patterns
   */
  importLearnedPatterns(json: string): void {
    try {
      const patterns = JSON.parse(json);
      patterns.forEach((item: any) => {
        this.learnedPatterns.set(item.key, {
          pattern: item.pattern,
          type: item.type,
          confidence: item.confidence,
          count: item.count,
          examples: item.examples
        });
      });
      
      logger.info(`Imported ${patterns.length} learned patterns`);
    } catch (error) {
      logger.error('Failed to import learned patterns:', error);
    }
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