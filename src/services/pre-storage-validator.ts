/**
 * Pre-Storage Validator Service
 * 
 * V2.7.1: Final validation layer before database storage
 * Provides quality scoring and last-chance rejection of garbage entries
 * 
 * V2.8 Changes:
 * - Added specific Buffalo Trace store page detection
 * - Added marketing language rejection (near me, delivery, etc.)
 * - Enhanced validation for collection pages vs individual products
 */

import { logger } from '../utils/logger.js';
import { TextProcessor } from './text-processor.js';
import { smartProductValidator } from './smart-product-validator.js';
import { containsNonProductPatterns, NON_PRODUCT_FILTERS } from '../config/non-product-filters.js';

export interface PreStorageValidationResult {
  isValid: boolean;
  qualityScore: number;
  issues: string[];
  cleanedName?: string;
  cleanedBrand?: string;
  rejectionReason?: string;
}

export class PreStorageValidator {
  // V2.9.1: ULTRATHINK - Dynamic quality thresholds based on database analysis
  private readonly MIN_QUALITY_SCORE = 50; // V2.9.1: Reduced to 50 based on price extraction improvements
  private readonly MIN_QUALITY_SCORE_COGNAC = 45; // V2.9.1: Reduced for special spirits
  private readonly MIN_QUALITY_SCORE_WITH_PRICE = 35; // V2.9.1: Much lower if has price (strong signal)
  private readonly EMERGENCY_REJECT_THRESHOLD = 25; // V2.9.1: Emergency rejection for very bad entries
  
  // V2.9.1: Real-time filtering gates
  private readonly GATE_1_PATTERNS = [
    /\(Ship As A \d+\.\)/i,
    /\(Ships As A \d+\.\)/i,
    /Sku \d+$/i,
    /Product Detail$/i,
    /Get .* Online Today/i,
    /^Louisville['']s\s+Premier/i,  // V3.1: Restaurant/steakhouse patterns
    /\bsurf\s+city\s+still\s+works\s+collection/i,  // V3.1: Collection pages
    /\blost\s+lantern.*collection/i,  // V3.1: Collection pages
  ];
  
  private readonly GATE_2_PATTERNS = [
    /\bcocktail\s+recipe/i,
    /\bhow\s+to\s+make\b/i,
    /\bmixed\s+drink\s+recipe/i,
    /\bpodcast\b/i,
    /\bepisode\s+\d+/i,
    /\bgift\s+guide/i,
  ];
  
  private readonly GATE_3_PATTERNS = [
    /\binstacart\b/i,
    /\bdoordash\b/i,
    /\bdelivery\s+near\s+me\b/i,
    /\bpickup\s+near\s+me\b/i,
    /\bfree\s+delivery\b/i,
  ];
  
  // V3.1: Additional filtering gates
  private readonly GATE_4_PATTERNS = [
    /\bmystery\s+(whiskey|box|case)/i,
    /\bsubscription\s+box/i,
    /\bsteakhouse|restaurant|bar\s+offering/i,
    /\breview(ing)?\s+\w+/i,
    /\bnews\s+\w+|bourbon\s+news/i,
    /\brelease\s+calendar/i,
    /\bstash\s+best/i,
    /\bcask\s+aged.*chocolate/i,
    /\bcollection\s+(page|of\s+bourbon)/i,
    /\b(bourbon|whiskey)\s+page\s+\d+/i,
    /\b25\s+year\s+old\s+\w+\s+marketplace/i,
  ];
  
  // V3.1.3: GATE 5 - Sources that MUST have prices
  private readonly PRICE_REQUIRED_SOURCES = [
    'totalwine.com',
    'thewhiskyexchange.com',
    'whiskyexchange.com',
    'klwines.com',
    'wine-searcher.com',
    'masterofmalt.com',
    'drizly.com',
    'reservebar.com',
    'caskers.com',
    'flaviar.com',
    'thewhiskyworld.com',
    'finedrams.com',
    'whisky.com',
    'dekanta.com'
  ];
  
  /**
   * V2.9.1: ULTRATHINK - Real-time quality gates with enhanced validation
   */
  async validate(spiritData: any): Promise<PreStorageValidationResult> {
    // V2.9.1: Gate 1 - Immediate e-commerce metadata rejection
    for (const pattern of this.GATE_1_PATTERNS) {
      if (pattern.test(spiritData.name)) {
        return {
          isValid: false,
          qualityScore: 0,
          issues: ['E-commerce metadata pattern detected'],
          rejectionReason: 'ecommerce_metadata'
        };
      }
    }
    
    // V2.9.1: Gate 2 - Recipe/content pattern rejection
    for (const pattern of this.GATE_2_PATTERNS) {
      if (pattern.test(spiritData.name) || pattern.test(spiritData.description || '')) {
        return {
          isValid: false,
          qualityScore: 0,
          issues: ['Recipe/content pattern detected'],
          rejectionReason: 'recipe_content'
        };
      }
    }
    
    // V2.9.1: Gate 3 - Delivery/marketplace pattern rejection
    for (const pattern of this.GATE_3_PATTERNS) {
      if (pattern.test(spiritData.name) || pattern.test(spiritData.description || '')) {
        return {
          isValid: false,
          qualityScore: 0,
          issues: ['Delivery/marketplace pattern detected'],
          rejectionReason: 'delivery_marketplace'
        };
      }
    }
    
    // V3.1: Gate 4 - Mystery box/subscription/review patterns
    for (const pattern of this.GATE_4_PATTERNS) {
      if (pattern.test(spiritData.name) || pattern.test(spiritData.description || '')) {
        return {
          isValid: false,
          qualityScore: 0,
          issues: ['Mystery box/subscription/review pattern detected'],
          rejectionReason: 'mystery_subscription_review'
        };
      }
    }
    
    // V3.1.3: Gate 5 - Price requirement for premium sources
    if (spiritData.source_domain) {
      const domain = spiritData.source_domain.toLowerCase().replace('www.', '');
      if (this.PRICE_REQUIRED_SOURCES.includes(domain) && !spiritData.price) {
        return {
          isValid: false,
          qualityScore: 0,
          issues: ['Price required from premium source'],
          rejectionReason: 'missing_required_price'
        };
      }
    }
    
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
    
    // V3.1.3: Enhanced name cleaning
    // Remove "Bottle" suffix variations (expanded list)
    cleanedName = cleanedName.replace(/\s+(Bottle|bottle|70\s*cl|750\s*ml|375\s*ml|1\s*L|1L|1\.75\s*L|50\s*ml|200\s*ml|liter|litre)$/i, '');
    // Fix spacing issues like "L L" or "Ll"
    cleanedName = cleanedName.replace(/\bL\s+L\b/g, 'll').replace(/\bLl\b/g, 'll');
    // Fix possessive apostrophes in names
    cleanedName = cleanedName.replace(/['']S\s/gi, "'s ");
    // Remove trailing dots or incomplete words
    cleanedName = cleanedName.replace(/\.\.\.$/, '').replace(/\s+\w{1,2}$/, '');
    
    // V2.7.4: Early rejection for store references and non-spirit items
    if (TextProcessor.containsStoreReference(cleanedName) || TextProcessor.containsStoreReference(spiritData.name)) {
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['Contains store name in title'],
        rejectionReason: 'store_reference_in_name'
      };
    }
    
    // V2.8: Specific Buffalo Trace store page detection
    if (/\b(buffalo\s+trace)\b/i.test(cleanedName)) {
      // Check for store listing patterns
      if (/\b(products|collection|bourbon\s+whiskey$|whiskey$|distillery$)\b/i.test(cleanedName) &&
          !/\b(single\s+barrel|barrel\s+select|antique|kosher|experimental|special\s+edition)\b/i.test(cleanedName)) {
        return {
          isValid: false,
          qualityScore: 0,
          issues: ['Buffalo Trace store listing page'],
          rejectionReason: 'buffalo_trace_store_page'
        };
      }
      
      // Check for multiple spirit names (store collection page)
      const spiritTypeCount = (cleanedName.match(/\b(bourbon|whiskey|vodka|rum|gin)\b/gi) || []).length;
      if (spiritTypeCount > 2) {
        return {
          isValid: false,
          qualityScore: 0,
          issues: ['Multiple spirit types - likely collection page'],
          rejectionReason: 'multiple_spirit_types'
        };
      }
      
      // Check for marketing language
      if (/\b(buy|order|purchase)\s+.+\s+online\b/i.test(cleanedName)) {
        return {
          isValid: false,
          qualityScore: 0,
          issues: ['Marketing language in name'],
          rejectionReason: 'marketing_language'
        };
      }
    }
    
    // V2.8: General marketing language check
    if (/\b(near\s+me|delivery\s+or\s+pickup|instacart|ubereats|doordash|gopuff)\b/i.test(cleanedName)) {
      return {
        isValid: false,
        qualityScore: 0,
        issues: ['Delivery/marketplace language in name'],
        rejectionReason: 'marketplace_language'
      };
    }
    
    // V2.7.4: Check for incomplete extraction
    if (TextProcessor.isIncompleteExtraction(cleanedName, spiritData.description)) {
      qualityScore -= 15;
      issues.push('Possibly incomplete name extraction');
    }
    
    // V2.7.5: Non-product filtering is now handled in spirit-extractor.ts
    // This validator focuses on data quality, not product type validation
    
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
      
      // V3.0: Reject invalid brands from database analysis
      if (/^(we['']re|top\s+premium|discussion|facundo\s+is|product\s+description|aged?\s+rum|\d+\s+year\s+old|white|the\s+\d+|critics?\s+choice)$/i.test(cleanedBrand)) {
        return {
          isValid: false,
          qualityScore: 0,
          issues: ['Invalid brand name pattern'],
          cleanedName,
          rejectionReason: 'invalid_brand_v3'
        };
      }
      
      // V3.1.3: Reject more invalid brand patterns (expanded)
      if (/^(news|review|reviewing|here\s+are|mystery|overrated|top\s+shelf|wheated|technically\s+not|collection|marketplace|essential|our|the\s+\d+|best\s+of|top\s+\d+)$/i.test(cleanedBrand)) {
        return {
          isValid: false,
          qualityScore: 0,
          issues: ['Invalid brand name pattern V3.1.3'],
          cleanedName,
          rejectionReason: 'invalid_brand_v3_1_3'
        };
      }
      
      // V3.1.3: Reject brands that are just ages
      if (/^\d+\s*(year|yr)s?\s*(old)?$/i.test(cleanedBrand)) {
        return {
          isValid: false,
          qualityScore: 0,
          issues: ['Age used as brand name'],
          cleanedName,
          rejectionReason: 'age_as_brand'
        };
      }
      
      // V3.1: Fix possessive brand apostrophes
      if (/['']S$/i.test(cleanedBrand)) {
        cleanedBrand = cleanedBrand.replace(/['']S$/i, "'s");
      }
      
      // V3.0: Reject single-word generic spirit type brands
      if (/^(rum|whiskey|whisky|bourbon|gin|vodka|tequila|brandy|cognac|scotch)$/i.test(cleanedBrand)) {
        qualityScore -= 30;
        issues.push('Generic spirit type as brand');
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
    
    // V2.9.1: Dynamic threshold calculation based on available data signals
    let threshold = isSpecialType ? this.MIN_QUALITY_SCORE_COGNAC : this.MIN_QUALITY_SCORE;
    
    // V2.9.1: Enhanced price validation with string support
    const hasValidPrice = (spiritData.price && 
                          ((typeof spiritData.price === 'number' && spiritData.price > 0 && spiritData.price < 8000) ||
                           (typeof spiritData.price === 'string' && /\$\d+/.test(spiritData.price))));
    
    // V2.9.1: Multiple signal threshold adjustment
    const qualitySignals = [
      hasValidPrice,
      spiritData.abv || spiritData.proof,
      spiritData.age,
      spiritData.distillery,
      spiritData.region,
      spiritData.type && spiritData.type !== 'Other',
    ].filter(Boolean).length;
    
    // V2.9.1: Adaptive threshold based on signals
    if (qualitySignals >= 3) {
      threshold = Math.min(threshold, this.MIN_QUALITY_SCORE_WITH_PRICE - 5); // Even lower for multiple signals
    } else if (hasValidPrice) {
      threshold = Math.min(threshold, this.MIN_QUALITY_SCORE_WITH_PRICE);
    }
    
    // V2.9.1: Price bonus
    if (hasValidPrice) {
      qualityScore = Math.min(100, qualityScore + 15); // Increased bonus for price
    }
    
    // V2.9.1: Emergency rejection for extremely poor quality
    if (qualityScore < this.EMERGENCY_REJECT_THRESHOLD) {
      return {
        isValid: false,
        qualityScore,
        issues: [...issues, 'Emergency rejection - extremely low quality'],
        cleanedName,
        cleanedBrand,
        rejectionReason: 'emergency_low_quality'
      };
    }
    
    // V2.9.1: Enhanced validation with price consideration and dynamic scoring
    const isValid = qualityScore >= threshold;
    
    // V2.9.1: Additional quality bonuses for V2.9.1 improvements
    if (hasValidPrice) {
      // Bonus for price extraction success (indicates good source)
      qualityScore = Math.min(100, qualityScore + 15);
    }
    
    // V2.9.1: Category bonus (successful type detection)
    if (spiritData.type && spiritData.type !== 'Other' && spiritData.type !== 'Spirit') {
      qualityScore = Math.min(100, qualityScore + 10);
    }
    
    // V2.9.1: ABV/Proof bonus (indicates technical product info)
    if (spiritData.abv || spiritData.proof) {
      qualityScore = Math.min(100, qualityScore + 8);
    }
    
    // V2.9.1: Age statement bonus
    if (spiritData.age) {
      qualityScore = Math.min(100, qualityScore + 12);
    }
    
    // V2.9.1: Distillery/region bonus
    if (spiritData.distillery || spiritData.region) {
      qualityScore = Math.min(100, qualityScore + 8);
    }
    
    // Recalculate validity with bonuses
    const finalValid = qualityScore >= threshold;
    
    if (!finalValid) {
      logger.warn(`🔍 Pre-storage validation FAILED for "${spiritData.name}"`);
      logger.warn(`   Cleaned name: "${cleanedName}"`);
      logger.warn(`   Brand: "${spiritData.brand || 'none'}"`);
      logger.warn(`   Type: "${spiritData.type || 'none'}"`);
      logger.warn(`   Price: ${hasValidPrice ? `$${spiritData.price}` : 'none'}`);
      logger.warn(`   ABV/Proof: ${spiritData.abv || spiritData.proof || 'none'}`);
      logger.warn(`   Age: ${spiritData.age || 'none'}`);
      logger.warn(`   Is Special Type (Cognac/Japanese): ${isSpecialType}`);
      logger.warn(`   Has Valid Price: ${hasValidPrice}`);
      logger.warn(`   Quality score: ${qualityScore} (threshold: ${threshold})`);
      logger.warn(`   Issues: ${issues.join(', ')}`);
    } else {
      // V2.9.1: Enhanced logging with more data points
      const priceInfo = hasValidPrice ? ` [price: $${spiritData.price}]` : '';
      const abvInfo = spiritData.abv ? ` [abv: ${spiritData.abv}%]` : '';
      const typeInfo = spiritData.type ? ` [type: ${spiritData.type}]` : '';
      logger.info(`✅ Pre-storage validation PASSED for "${spiritData.name}" (score: ${qualityScore}/${threshold})${priceInfo}${abvInfo}${typeInfo}`);
    }
    
    return {
      isValid: finalValid,
      qualityScore,
      issues,
      cleanedName: cleanedName !== spiritData.name ? cleanedName : undefined,
      cleanedBrand: cleanedBrand !== spiritData.brand ? cleanedBrand : undefined,
      rejectionReason: !finalValid ? 'low_quality_score' : undefined
    };
  }
  
  /**
   * V2.9.1: ULTRATHINK - Real-time quality assessment for early filtering
   */
  quickQualityCheck(spiritData: any): { shouldProcess: boolean; reason?: string } {
    // Quick rejection patterns - don't even process these
    const quickRejectPatterns = [
      ...this.GATE_1_PATTERNS,
      ...this.GATE_2_PATTERNS,
      ...this.GATE_3_PATTERNS,
      ...this.GATE_4_PATTERNS,  // V3.1: Include gate 4 patterns
      /\bschools?\b/i,
      /\bcounty\s+school/i,
      /\brestaurant\s+menu/i,
      /\bbar\s+menu/i,
      /\btap\s+list/i,
    ];
    
    for (const pattern of quickRejectPatterns) {
      if (pattern.test(spiritData.name || '') || pattern.test(spiritData.description || '')) {
        return { shouldProcess: false, reason: 'quick_reject_pattern' };
      }
    }
    
    // Quick quality indicators - fast approval
    const qualityIndicators = [
      // Has price (strong signal)
      spiritData.price && spiritData.price > 5 && spiritData.price < 5000,
      // Has ABV/Proof
      spiritData.abv || spiritData.proof,
      // Has age statement
      spiritData.age,
      // Has known brand
      spiritData.brand && spiritData.brand.length > 3,
      // Has specific spirit type
      spiritData.type && spiritData.type !== 'Other' && spiritData.type !== 'Spirit',
    ];
    
    const qualityCount = qualityIndicators.filter(Boolean).length;
    
    // If has 3+ quality indicators, likely good
    if (qualityCount >= 3) {
      return { shouldProcess: true, reason: 'quality_indicators' };
    }
    
    // Default: process for full validation
    return { shouldProcess: true };
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