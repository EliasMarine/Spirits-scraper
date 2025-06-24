/**
 * Pre-Storage Validator Service
 * 
 * V2.7.1: Final validation layer before database storage
 * Provides quality scoring and last-chance rejection of garbage entries
 */

import { logger } from '../utils/logger.js';
import { TextProcessor } from './text-processor.js';
import { smartProductValidator } from './smart-product-validator.js';

export interface PreStorageValidationResult {
  isValid: boolean;
  qualityScore: number;
  issues: string[];
  cleanedName?: string;
  cleanedBrand?: string;
  rejectionReason?: string;
}

export class PreStorageValidator {
  private readonly MIN_QUALITY_SCORE = 75; // V2.7.2: Increased from 70
  
  /**
   * Perform final validation before storing to database
   */
  async validate(spiritData: any): Promise<PreStorageValidationResult> {
    const issues: string[] = [];
    let qualityScore = 100;
    
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
    
    // Check for proper spirit type
    const hasSpiritType = /\b(whiskey|whisky|bourbon|rum|gin|vodka|tequila|mezcal|cognac|brandy|liqueur)\b/i.test(cleanedName);
    
    // V2.7.3: If type is already detected and set, don't penalize for missing type in name
    // This is especially important for cognac, where brands like "Hennessy VS" don't include "cognac"
    if (!hasSpiritType && !spiritData.type) {
      // Only penalize if neither name nor type field has spirit type
      qualityScore -= 10;
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
      qualityScore -= 15;
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
      qualityScore -= 40;
      issues.push(...smartValidation.issues);
    }
    
    // Calculate final score
    qualityScore = Math.max(0, qualityScore);
    
    // Log detailed validation for debugging
    if (qualityScore < this.MIN_QUALITY_SCORE) {
      logger.warn(`🔍 Pre-storage validation FAILED for "${spiritData.name}"`);
      logger.warn(`   Cleaned name: "${cleanedName}"`);
      logger.warn(`   Brand: "${spiritData.brand || 'none'}"`);
      logger.warn(`   Type: "${spiritData.type || 'none'}"`);
      logger.warn(`   Quality score: ${qualityScore}`);
      logger.warn(`   Issues: ${issues.join(', ')}`);
    }
    
    return {
      isValid: qualityScore >= this.MIN_QUALITY_SCORE,
      qualityScore,
      issues,
      cleanedName: cleanedName !== spiritData.name ? cleanedName : undefined,
      cleanedBrand: cleanedBrand !== spiritData.brand ? cleanedBrand : undefined,
      rejectionReason: qualityScore < this.MIN_QUALITY_SCORE ? 'low_quality_score' : undefined
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