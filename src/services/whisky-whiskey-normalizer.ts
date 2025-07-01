/**
 * Whisky/Whiskey Normalization Service
 * Handles the critical duplication issue where spirits are listed with both "whisky" and "whiskey" spellings
 * and removes site references like "The Whisky" that create artificial duplicates
 */

import { logger } from '../utils/logger.js';

export interface WhiskyNormalizationResult {
  normalizedName: string;
  hasWhiskyVariation: boolean;
  removedSiteReference: boolean;
  originalSpelling: 'whisky' | 'whiskey' | 'none';
  changes: string[];
}

/**
 * Site references that should be removed from product names
 */
const SITE_REFERENCES = [
  /\s+The\s+Whisky\s*$/i,           // "Product Name The Whisky"
  /\s+The\s+Whiskey\s*$/i,          // "Product Name The Whiskey"  
  /\s+The\s*$/i,                    // "Product Name The"
  /\s+Whisky\s+Exchange\s*$/i,      // "Product Name Whisky Exchange"
  /\s+Whiskey\s+Exchange\s*$/i,     // "Product Name Whiskey Exchange"
  /\s+Master\s+of\s+Malt\s*$/i,     // "Product Name Master of Malt"
  /\s+Total\s+Wine\s*$/i,           // "Product Name Total Wine"
  /\s+Fine\s+Drams\s*$/i,           // "Product Name Fine Drams"
  /\s+-\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s*$/i, // "Product Name - Site Name"
];

/**
 * Patterns that indicate whisky/whiskey at the end of product names
 */
const WHISKY_WHISKEY_PATTERNS = [
  /\bwhisky\b/gi,
  /\bwhiskey\b/gi,
];

export class WhiskyWhiskeyNormalizer {
  
  /**
   * Normalize a spirit name by standardizing whisky/whiskey spelling and removing site references
   */
  static normalize(name: string): WhiskyNormalizationResult {
    if (!name || name.trim() === '') {
      return {
        normalizedName: '',
        hasWhiskyVariation: false,
        removedSiteReference: false,
        originalSpelling: 'none',
        changes: []
      };
    }

    let normalizedName = name.trim();
    const changes: string[] = [];
    let removedSiteReference = false;
    let hasWhiskyVariation = false;
    let originalSpelling: 'whisky' | 'whiskey' | 'none' = 'none';

    // Step 1: Remove site references first
    for (const pattern of SITE_REFERENCES) {
      if (pattern.test(normalizedName)) {
        const before = normalizedName;
        normalizedName = normalizedName.replace(pattern, '').trim();
        if (normalizedName !== before) {
          removedSiteReference = true;
          changes.push(`Removed site reference: "${before}" → "${normalizedName}"`);
        }
      }
    }

    // Step 2: Detect original whisky/whiskey spelling
    const whiskyMatches = normalizedName.match(/\bwhisky\b/gi);
    const whiskeyMatches = normalizedName.match(/\bwhiskey\b/gi);
    
    if (whiskyMatches && whiskyMatches.length > 0) {
      originalSpelling = 'whisky';
      hasWhiskyVariation = true;
    } else if (whiskeyMatches && whiskeyMatches.length > 0) {
      originalSpelling = 'whiskey';
      hasWhiskyVariation = true;
    }

    // Step 3: Standardize to "whisky" spelling for consistency
    if (hasWhiskyVariation) {
      const before = normalizedName;
      normalizedName = normalizedName.replace(/\bwhiskey\b/gi, 'whisky');
      if (normalizedName !== before) {
        changes.push(`Standardized spelling: "${before}" → "${normalizedName}"`);
      }
    }

    return {
      normalizedName: normalizedName.trim(),
      hasWhiskyVariation,
      removedSiteReference,
      originalSpelling,
      changes
    };
  }

  /**
   * Check if two spirit names are likely duplicates due to whisky/whiskey variations
   */
  static areWhiskyVariants(name1: string, name2: string): boolean {
    const norm1 = this.normalize(name1);
    const norm2 = this.normalize(name2);

    // If both normalize to the same name, they're variants
    if (norm1.normalizedName === norm2.normalizedName) {
      return true;
    }

    // Check if they differ only by whisky/whiskey spelling
    const name1Standardized = name1.replace(/\bwhiskey\b/gi, 'whisky');
    const name2Standardized = name2.replace(/\bwhiskey\b/gi, 'whisky');
    
    return name1Standardized === name2Standardized;
  }

  /**
   * Generate a normalized key for deduplication purposes
   */
  static generateNormalizedKey(name: string): string {
    const normalized = this.normalize(name);
    
    // Create a key that ignores:
    // - Case differences
    // - Whisky/whiskey spelling variations
    // - Site references
    // - Extra whitespace
    return normalized.normalizedName
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim();
  }

  /**
   * Clean product name for extraction (remove obvious site references)
   */
  static cleanProductName(name: string): string {
    if (!name) return '';
    
    const result = this.normalize(name);
    
    if (result.changes.length > 0) {
      logger.info(`🧹 Cleaned product name: ${result.changes.join(', ')}`);
    }
    
    return result.normalizedName;
  }

  /**
   * Check if a name has problematic patterns that indicate it's a duplicate
   */
  static hasProblematicPatterns(name: string): { 
    hasProblems: boolean; 
    issues: string[];
    shouldDelete: boolean;
  } {
    const issues: string[] = [];
    let shouldDelete = false;

    // Check for site references at the end
    if (/\s+The\s+Whisky\s*$/i.test(name)) {
      issues.push('Ends with "The Whisky" (site reference)');
      shouldDelete = true;
    }

    if (/\s+The\s*$/i.test(name)) {
      issues.push('Ends with "The" (incomplete site reference)');
      shouldDelete = true;
    }

    if (/\s+Whisky\s+Exchange\s*$/i.test(name)) {
      issues.push('Contains "Whisky Exchange" (site name)');
      shouldDelete = true;
    }

    // Check for other problematic patterns
    if (/\s+-\s+[A-Z][a-z]+\s+[A-Z][a-z]+\s*$/i.test(name)) {
      issues.push('Ends with "- Site Name" pattern');
      shouldDelete = true;
    }

    return {
      hasProblems: issues.length > 0,
      issues,
      shouldDelete
    };
  }

  /**
   * Find potential whisky/whiskey duplicates in a list of spirits
   */
  static findWhiskyDuplicates(spirits: Array<{ id: string; name: string }>): Array<{
    group: Array<{ id: string; name: string; normalizedKey: string }>;
    reason: string;
  }> {
    const duplicateGroups: Array<{
      group: Array<{ id: string; name: string; normalizedKey: string }>;
      reason: string;
    }> = [];

    // Create normalized keys for all spirits
    const spiritData = spirits.map(spirit => ({
      ...spirit,
      normalizedKey: this.generateNormalizedKey(spirit.name)
    }));

    // Group by normalized key
    const keyGroups = new Map<string, Array<{ id: string; name: string; normalizedKey: string }>>();

    spiritData.forEach(spirit => {
      if (!keyGroups.has(spirit.normalizedKey)) {
        keyGroups.set(spirit.normalizedKey, []);
      }
      keyGroups.get(spirit.normalizedKey)!.push(spirit);
    });

    // Find groups with multiple entries (duplicates)
    keyGroups.forEach((group, key) => {
      if (group.length > 1) {
        // Check if it's specifically whisky/whiskey variations
        const hasWhiskyVariations = group.some(s => /whisky/i.test(s.name)) && 
                                   group.some(s => /whiskey/i.test(s.name));
        
        const hasSiteReferences = group.some(s => 
          /The\s+Whisky|The\s*$|Whisky\s+Exchange/i.test(s.name)
        );

        let reason = 'Normalized names are identical';
        if (hasWhiskyVariations) {
          reason += ' (whisky/whiskey spelling variations)';
        }
        if (hasSiteReferences) {
          reason += ' (site reference variations)';
        }

        duplicateGroups.push({
          group,
          reason
        });
      }
    });

    return duplicateGroups;
  }
}

export const whiskyWhiskeyNormalizer = WhiskyWhiskeyNormalizer;