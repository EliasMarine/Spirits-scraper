/**
 * Pre-Storage Validator Service
 * 
 * V2.7.1: Final validation layer before database storage
 * Provides quality scoring and last-chance rejection of garbage entries
 */

import { logger } from '../utils/logger.js';
import { TextProcessor } from './text-processor.js';
import { smartProductValidator } from './smart-product-validator.js';
import { containsNonProductPatterns } from '../config/non-product-filters.js';

export interface PreStorageValidationResult {
  isValid: boolean;
  qualityScore: number;
  issues: string[];
  cleanedName?: string;
  cleanedBrand?: string;
  rejectionReason?: string;
}

export class PreStorageValidator {
  private readonly MIN_QUALITY_SCORE = 60; // V2.7.5: Reduced from 75 to allow more spirits
  private readonly MIN_QUALITY_SCORE_COGNAC = 55; // V2.7.5: Reduced from 65 to allow more cognac/brandy
  
  /**
   * Perform final validation before storing to database
   */
  async validate(spiritData: any): Promise<PreStorageValidationResult> {
    const issues: string[] = [];
    let qualityScore = 100;
    
    // V2.7.5: Check for special spirit types that need different handling
    const isCognacBrandy = spiritData.type === 'cognac' || spiritData.type === 'brandy' ||
      /\b(cognac|brandy|armagnac)\b/i.test(spiritData.name);
    
    const isJapaneseSpirit = spiritData.type === 'japanese whisky' || spiritData.type === 'sake' ||
      /\b(japanese\s+whisk[ey]|sake|shochu|suntory|nikka|hibiki|yamazaki|hakushu|yoichi|miyagikyo)\b/i.test(spiritData.name);
    
    const isSpecialType = isCognacBrandy || isJapaneseSpirit;
    
    if (!spiritData.name) {
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['No name provided'],
        rejectionReason: 'missing_name'
      };
    }
    
    // V2.7.1: Clean the name first
    let cleanedName = spiritData.name;
    cleanedName = TextProcessor.removeNavigationPrefixes(cleanedName);
    cleanedName = TextProcessor.removeStoreSuffixes(cleanedName);  // V2.7.2: Remove store suffixes
    cleanedName = TextProcessor.fixTextSpacing(cleanedName);
    cleanedName = TextProcessor.removeStoreNames(cleanedName);
    
    // V2.7.4: Early rejection for store references and non-spirit items
    if (TextProcessor.containsStoreReference(cleanedName) || TextProcessor.containsStoreReference(spiritData.name)) {
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['Contains store name in title'],
        rejectionReason: 'store_reference_in_name'
      };
    }
    
    // V2.7.4: Check for incomplete extraction
    if (TextProcessor.isIncompleteExtraction(cleanedName, spiritData.description)) {
      qualityScore -= 15;
      issues.push('Possibly incomplete name extraction');
    }
    
    // V2.7.4: Enhanced non-spirit validation using comprehensive filters
    if (containsNonProductPatterns(cleanedName, 'furniture') ||
        containsNonProductPatterns(cleanedName, 'merchandise')) {
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['Non-spirit merchandise, furniture, or accessory'],
        cleanedName,
        rejectionReason: 'non_spirit_item'
      };
    }
    
    // Check if name became too short after cleaning
    if (cleanedName.length < 10) {
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['Name too short after cleaning'],
        cleanedName,
        rejectionReason: 'name_too_short'
      };
    }
    
    // V2.7.1: Check for generic age-only names
    if (/^\d+\s+year\s+old\s+(whisky|whiskey|bourbon|rum|gin|vodka|tequila)$/i.test(cleanedName)) {
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['Generic age-only name'],
        cleanedName,
        rejectionReason: 'generic_age_only'
      };
    }
    
    // V2.7.1: Check for repeated words
    if (/\b(whiskey|whisky|bourbon|rum|gin|vodka|tequila)\s+\1\b/i.test(cleanedName)) {
      qualityScore -= 30;
      issues.push('Repeated spirit type words');
    }
    
    // V2.7.2: Check for event/competition patterns
    if (/\b(party|challenge|winners?|competition|awards?|according\s+to)\b/i.test(cleanedName)) {
      qualityScore -= 30;
      issues.push('Event or competition reference');
    }
    
    // V2.7.2: Check for gift/promotional patterns
    if (/\b(gift|gifts|guide|father'?s?\s+day|mother'?s?\s+day|holiday)\b/i.test(cleanedName)) {
      qualityScore -= 25;
      issues.push('Gift or promotional content');
    }
    
    // V2.7.2: Check for store/mission references
    if (/\b(mission\s+wine|wine\s*(&|and)?\s*spirits?|liquor\s+store)\b/i.test(cleanedName) ||
        /\bmission\s*$/i.test(cleanedName) ||
        /\bwine\s*$/i.test(cleanedName)) {
      qualityScore -= 20;
      issues.push('Store or mission reference');
    }
    
    // V2.7.2: Check for school/non-spirit content
    if (/\b(schools?|county\s+schools?|education|students?)\b/i.test(cleanedName)) {
      qualityScore -= 30;
      issues.push('Non-spirit educational reference');
    }
    
    // V2.7.1: Check for broken spacing that wasn't fixed
    if (/\b[A-Z]\s+[a-z]{1,4}\b/.test(cleanedName) && 
        !/\b(La|Le|De|Di|Du|Van|Von|Mac|Mc|St)\s+/i.test(cleanedName)) {
      qualityScore -= 20;
      issues.push('Broken spacing detected');
    }
    
    // Check name complexity (should have at least 2 meaningful words)
    const words = cleanedName.split(/\s+/).filter(w => w.length > 2);
    if (words.length < 2) {
      qualityScore -= 30;
      issues.push('Name lacks complexity');
    }
    
    // V2.7.5: Enhanced spirit type detection including Japanese spirits
    const hasSpiritType = /\b(whiskey|whisky|bourbon|rum|gin|vodka|tequila|mezcal|cognac|brandy|liqueur|sake|shochu|baijiu|aquavit|grappa|pisco|calvados|armagnac)\b/i.test(cleanedName);
    
    // V2.7.5: More lenient for special spirit types (cognac, Japanese spirits)
    // These often don't include spirit type in name (e.g., "Hennessy VS", "Suntory Hibiki")
    if (!hasSpiritType && !spiritData.type) {
      // Only penalize if neither name nor type field has spirit type
      const penalty = isSpecialType ? 5 : 10; // Reduced penalty for special types
      qualityScore -= penalty;
      issues.push('No spirit type detected');
    }
    
    // Check brand quality
    let cleanedBrand = spiritData.brand;
    if (cleanedBrand) {
      cleanedBrand = TextProcessor.normalizeBrandName(cleanedBrand);
      
      // V2.7.2: Enhanced brand validation
      // Check for bad brand names
      if (/^(unknown|type\.|our|new|[0-9]+|the|various)$/i.test(cleanedBrand)) {
        qualityScore -= 20;
        issues.push('Invalid brand name');
      }
      
      // V2.7.2: Reject single-word generic brands
      if (/^(the|unknown|our|new|colonel|award|father'?s?|mother'?s?|world'?s?)$/i.test(cleanedBrand)) {
        qualityScore -= 25;
        issues.push('Generic single-word brand');
      }
      
      // V2.7.2: Reject possessive brands with bad apostrophes
      if (/[''´`]s$/i.test(cleanedBrand) && !/^[A-Z][a-z]+['']s$/i.test(cleanedBrand)) {
        qualityScore -= 15;
        issues.push('Malformed possessive brand');
      }
      
      // V2.7.2: Minimum brand length
      if (cleanedBrand.length < 3) {
        qualityScore -= 20;
        issues.push('Brand name too short');
      }
      
      // V2.7.2: Brand must start with letter or number
      if (!/^[A-Za-z0-9]/.test(cleanedBrand)) {
        qualityScore -= 15;
        issues.push('Brand must start with letter or number');
      }
    } else {
      // V2.7.5: Be more lenient for special spirit types missing brands
      const penalty = isSpecialType ? 5 : 15;
      qualityScore -= penalty;
      issues.push('No brand specified');
    }
    
    // Check description quality
    if (spiritData.description) {
      if (/<[^>]+>/.test(spiritData.description)) {
        qualityScore -= 25;
        issues.push('HTML in description');
      }
      if (/\b(shop|buy)\s+(today|now|online)\b/i.test(spiritData.description)) {
        qualityScore -= 20;
        issues.push('Store language in description');
      }
      if (/similar\s+products|explore\s+related/i.test(spiritData.description)) {
        qualityScore -= 20;
        issues.push('Navigation text in description');
      }
    }
    
    // Use smart validator for additional checks
    const smartValidation = await smartProductValidator.validateProductName(cleanedName);
    if (!smartValidation.isValid) {
      // V2.7.5: Be more lenient for special spirit types with smart validator failures
      const penalty = isSpecialType ? 15 : 30; // Reduced penalties
      qualityScore -= penalty;
      issues.push(...smartValidation.issues);
    }
    
    // V2.7.5: Add positive signals for special spirit types
    if (isCognacBrandy) {
      // Grade indicators are strong signals
      if (/\b(XO|VSOP|VS|Napoleon|Extra|Paradis|Hors d'Age)\b/i.test(cleanedName)) {
        qualityScore = Math.min(100, qualityScore + 20);
      }
      // Age statements for cognac
      if (/\b\d{2,3}\s*(year|ans|yr)s?\b/i.test(cleanedName)) {
        qualityScore = Math.min(100, qualityScore + 10);
      }
      // Region indicators
      if (/\b(Fine Champagne|Grande Champagne|Petite Champagne|Borderies)\b/i.test(cleanedName)) {
        qualityScore = Math.min(100, qualityScore + 15);
      }
    }
    
    // V2.7.5: Add positive signals for Japanese spirits
    if (isJapaneseSpirit) {
      // Japanese distillery names are strong signals
      if (/\b(suntory|nikka|hibiki|yamazaki|hakushu|yoichi|miyagikyo|taketsuru|coffey)\b/i.test(cleanedName)) {
        qualityScore = Math.min(100, qualityScore + 25);
      }
      // Japanese whisky age statements
      if (/\b\d{1,2}\s*year/i.test(cleanedName)) {
        qualityScore = Math.min(100, qualityScore + 15);
      }
      // Single malt indicators
      if (/\bsingle\s+malt\b/i.test(cleanedName)) {
        qualityScore = Math.min(100, qualityScore + 10);
      }
    }
    
    // Calculate final score
    qualityScore = Math.max(0, qualityScore);
    
    // V2.7.5: Use appropriate threshold based on spirit type
    const threshold = isSpecialType ? this.MIN_QUALITY_SCORE_COGNAC : this.MIN_QUALITY_SCORE;
    
    // V2.7.5: Enhanced validation logging for debugging
    const isValid = qualityScore >= threshold;
    
    if (!isValid) {
      logger.warn(`🔍 Pre-storage validation FAILED for "${spiritData.name}"`);
      logger.warn(`   Cleaned name: "${cleanedName}"`);
      logger.warn(`   Brand: "${spiritData.brand || 'none'}"`);
      logger.warn(`   Type: "${spiritData.type || 'none'}"`);
      logger.warn(`   Is Special Type (Cognac/Japanese): ${isSpecialType}`);
      logger.warn(`   Quality score: ${qualityScore} (threshold: ${threshold})`);
      logger.warn(`   Issues: ${issues.join(', ')}`);
    } else {
      // V2.7.5: Log successful validations for monitoring
      logger.info(`✅ Pre-storage validation PASSED for "${spiritData.name}" (score: ${qualityScore}/${threshold})`);
    }
    
    return {
      isValid,
      qualityScore,
      issues,
      cleanedName: cleanedName !== spiritData.name ? cleanedName : undefined,
      cleanedBrand: cleanedBrand !== spiritData.brand ? cleanedBrand : undefined,
      rejectionReason: !isValid ? 'low_quality_score' : undefined
    };
  }
  
  /**
   * Get validation statistics
   */
  getStats(): { totalValidated: number; accepted: number; rejected: number } {
    // This could be enhanced to track actual stats
    return {
      totalValidated: 0,
      accepted: 0,
      rejected: 0
    };
  }
}

// Export singleton instance
export const preStorageValidator = new PreStorageValidator();