/**
 * Comprehensive Deduplication Service
 * 
 * Combines fuzzy matching and brand normalization for intelligent spirit deduplication.
 * Features:
 * - Multi-algorithm fuzzy matching
 * - Brand name normalization
 * - Confidence scoring
 * - Batch processing
 * - Merge strategy recommendations
 */

import { createClient } from '@supabase/supabase-js';
import { fuzzyMatch, findSimilarNames, FuzzyMatchConfig, FuzzyMatchResult, DEFAULT_CONFIG } from './fuzzy-matching.js';
import { normalizeBrandName, BrandNormalizationConfig, BrandNormalizationResult, DEFAULT_BRAND_CONFIG } from './brand-normalization.js';
import { logger } from '../utils/logger.js';
import { SpiritData, DatabaseSpirit } from '../types/index.js';
import { DataValidator } from './data-validator.js';
import { createNormalizedKey, createMultipleKeys, extractVariantInfo } from './normalization-keys.js';
import { ExactMatchDeduplicationService } from './exact-match-deduplication.js';
import { FuzzyMatchDeduplicationService } from './fuzzy-match-deduplication.js';
import { PriceVariationHandler, PriceVariationGroup } from './price-variation-handler.js';
import { BlockingDeduplicationService, SpiritBlock } from './blocking-deduplication.js';

/**
 * Duplicate detection result
 */
export interface DuplicateMatch {
  spirit1: DatabaseSpirit;
  spirit2: DatabaseSpirit;
  similarity: number;
  confidence: 'high' | 'medium' | 'low';
  matchType: 'exact' | 'fuzzy_name' | 'fuzzy_brand' | 'combined';
  details: {
    nameMatch: FuzzyMatchResult;
    brandMatch?: BrandNormalizationResult;
    combinedScore: number;
  };
  recommendedAction: 'merge' | 'flag_for_review' | 'ignore';
}

/**
 * Extracted spirit attributes for comparison
 */
interface SpiritAttributes {
  age?: number;
  proof?: number;
  grainType?: string;
  caskType?: string;
  vintage?: number;
  release?: string;
  edition?: string;
  isLiqueur?: boolean;
  isCaskStrength?: boolean;
  isSingleBarrel?: boolean;
}

/**
 * Deduplication configuration
 */
export interface DeduplicationConfig {
  // Similarity thresholds
  nameThreshold: number;
  brandThreshold: number;
  combinedThreshold: number;
  
  // Fuzzy matching config
  fuzzyConfig: FuzzyMatchConfig;
  
  // Brand normalization config
  brandConfig: BrandNormalizationConfig;
  
  // Processing limits
  batchSize: number;
  maxDuplicates: number;
  
  // Auto-merge settings
  autoMergeThreshold: number;
  requireManualReview: boolean;
  
  // Enhanced matching settings
  extractAttributes?: boolean;
  agePenaltyWeight?: number;
  proofPenaltyWeight?: number;
  grainTypePenaltyWeight?: number;
  sameBrandWeight?: number;
  differentBrandWeight?: number;
}

/**
 * Deduplication results
 */
export interface DeduplicationResult {
  totalProcessed: number;
  duplicatesFound: number;
  autoMerged: number;
  flaggedForReview: number;
  errors: number;
  processingTime: number;
  matches: DuplicateMatch[];
}

/**
 * Default deduplication configuration
 */
export const DEFAULT_DEDUP_CONFIG: DeduplicationConfig = {
  nameThreshold: 0.7,  // Based on analysis: same-brand products need lower threshold
  brandThreshold: 0.85,  // For different brands
  combinedThreshold: 0.6,  // General threshold for all comparisons
  fuzzyConfig: DEFAULT_CONFIG,
  brandConfig: DEFAULT_BRAND_CONFIG,
  batchSize: 100,
  maxDuplicates: 1000,
  autoMergeThreshold: 0.9,  // Auto-merge high confidence matches
  requireManualReview: true,
  // Enhanced matching settings based on duplicate analysis
  extractAttributes: true,
  agePenaltyWeight: 0.2,  // Reduced from 0.3 - age differences less important
  proofPenaltyWeight: 0.15,  // Reduced from 0.2
  grainTypePenaltyWeight: 0.2,  // Reduced from 0.25
  sameBrandWeight: 0.15, // Only 15% weight when same brand
  differentBrandWeight: 0.4, // 40% weight when different brands
};

/**
 * Comprehensive Deduplication Service
 */
export class DeduplicationService {
  private supabase: any;
  private config: DeduplicationConfig;
  private exactMatchService: ExactMatchDeduplicationService;
  private fuzzyMatchService: FuzzyMatchDeduplicationService;
  private priceVariationHandler: PriceVariationHandler;
  private blockingService: BlockingDeduplicationService;

  constructor(config: DeduplicationConfig = DEFAULT_DEDUP_CONFIG) {
    this.config = config;
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    this.exactMatchService = new ExactMatchDeduplicationService();
    this.fuzzyMatchService = new FuzzyMatchDeduplicationService();
    this.priceVariationHandler = new PriceVariationHandler();
    this.blockingService = new BlockingDeduplicationService();
  }

  /**
   * Run optimized deduplication using blocking techniques
   */
  async runOptimizedDeduplication(
    options: {
      incrementalOnly?: boolean;
      dryRun?: boolean;
      useBlocking?: boolean;
      customConfig?: Partial<DeduplicationConfig>;
    } = {}
  ): Promise<{
    totalProcessed: number;
    duplicatesFound: number;
    blockingStats?: any;
    processingTime: number;
  }> {
    const {
      incrementalOnly = false,
      dryRun = false,
      useBlocking = true,
      customConfig
    } = options;

    const startTime = Date.now();
    const mergedConfig = { ...this.config, ...customConfig };
    
    try {
      // Fetch spirits to process
      const spirits = await this.fetchSpiritsForDeduplication(incrementalOnly);
      logger.info(`Processing ${spirits.length} spirits for optimized deduplication`);

      let totalDuplicatesFound = 0;
      let blockingStats: any = null;

      if (useBlocking && spirits.length > 100) {
        // Use blocking for large datasets
        logger.info('Using blocking optimization for large dataset');
        
        // Create blocks
        const blocks = this.blockingService.createBlocks(spirits);
        
        // Calculate reduction in comparisons
        const reduction = this.blockingService.calculateReduction(spirits.length, blocks);
        logger.info(`Blocking reduces comparisons by ${reduction.reductionPercentage.toFixed(1)}%`);
        
        blockingStats = {
          totalBlocks: blocks.size,
          reductionPercentage: reduction.reductionPercentage,
          comparisonsWithoutBlocking: reduction.withoutBlocking,
          comparisonsWithBlocking: reduction.withBlocking
        };

        // Process blocks in batches
        for await (const blockBatch of this.blockingService.processBlocksInBatches(blocks)) {
          for (const block of blockBatch) {
            if (block.size < 2) continue;
            
            // Run exact match within block
            const exactGroups = await this.exactMatchService.findExactDuplicates(block.spirits);
            totalDuplicatesFound += exactGroups.reduce((sum, g) => sum + g.spirits.length - 1, 0);
            
            if (!dryRun) {
              await this.exactMatchService.mergeDuplicateGroups(
                exactGroups.filter(g => g.mergeStrategy === 'auto'),
                false
              );
            }
            
            // Get unprocessed spirits for fuzzy matching
            const processedIds = new Set<string>();
            for (const group of exactGroups) {
              group.spirits.forEach(spirit => processedIds.add(spirit.id));
            }
            
            // Run fuzzy match on remaining spirits in block
            const fuzzyMatches = await this.fuzzyMatchService.findFuzzyDuplicates(
              block.spirits,
              processedIds
            );
            totalDuplicatesFound += fuzzyMatches.length;
            
            if (!dryRun) {
              await this.fuzzyMatchService.processFuzzyMatches(
                fuzzyMatches.filter(m => m.recommendedAction !== 'ignore'),
                false
              );
            }
          }
        }
      } else {
        // Fall back to comprehensive deduplication for small datasets
        logger.info('Using standard deduplication for small dataset');
        const result = await this.runComprehensiveDeduplication({
          incrementalOnly,
          dryRun,
          customConfig
        });
        totalDuplicatesFound = result.totalDuplicatesFound;
      }

      const processingTime = Date.now() - startTime;
      
      return {
        totalProcessed: spirits.length,
        duplicatesFound: totalDuplicatesFound,
        blockingStats,
        processingTime
      };
      
    } catch (error) {
      logger.error('Optimized deduplication failed:', error);
      throw error;
    }
  }

  /**
   * Run comprehensive deduplication with exact matching first
   */
  async runComprehensiveDeduplication(
    options: {
      incrementalOnly?: boolean;
      dryRun?: boolean;
      runExactMatch?: boolean;
      runFuzzyMatch?: boolean;
      runPriceAnalysis?: boolean;
      customConfig?: Partial<DeduplicationConfig>;
    } = {}
  ): Promise<{
    exactMatchResults?: any;
    fuzzyMatchResults?: DeduplicationResult;
    priceVariationResults?: {
      groups: PriceVariationGroup[];
      summary: any;
    };
    totalMerged: number;
    totalDuplicatesFound: number;
  }> {
    const {
      incrementalOnly = false,
      dryRun = false,
      runExactMatch = true,
      runFuzzyMatch = true,
      runPriceAnalysis = true,
      customConfig
    } = options;

    const results = {
      exactMatchResults: undefined as any,
      fuzzyMatchResults: undefined as DeduplicationResult | undefined,
      priceVariationResults: undefined as any,
      totalMerged: 0,
      totalDuplicatesFound: 0
    };

    try {
      // Step 1: Run exact match deduplication
      if (runExactMatch) {
        logger.info('Starting exact match deduplication phase');
        
        const spirits = await this.fetchSpiritsForDeduplication(incrementalOnly);
        const exactGroups = await this.exactMatchService.findExactDuplicates(spirits);
        
        logger.info(`Found ${exactGroups.length} exact match groups`);
        
        const exactStats = this.exactMatchService.getStatistics(exactGroups);
        results.exactMatchResults = {
          groups: exactGroups,
          stats: exactStats,
          mergeResults: await this.exactMatchService.mergeDuplicateGroups(
            exactGroups.filter(g => g.mergeStrategy === 'auto'),
            dryRun
          )
        };
        
        results.totalDuplicatesFound += exactStats.totalDuplicates;
        results.totalMerged += results.exactMatchResults.mergeResults.merged;
      }

      // Step 2: Run enhanced fuzzy match deduplication with TF-IDF
      if (runFuzzyMatch) {
        logger.info('Starting enhanced fuzzy match deduplication phase');
        
        // Get IDs that were already processed by exact match
        const processedIds = new Set<string>();
        if (results.exactMatchResults?.groups) {
          for (const group of results.exactMatchResults.groups) {
            group.spirits.forEach(spirit => processedIds.add(spirit.id));
          }
        }
        
        // Fetch spirits and run fuzzy matching
        const spirits = await this.fetchSpiritsForDeduplication(incrementalOnly);
        const fuzzyMatches = await this.fuzzyMatchService.findFuzzyDuplicates(spirits, processedIds);
        
        logger.info(`Found ${fuzzyMatches.length} fuzzy match candidates`);
        
        // Process fuzzy matches
        const fuzzyProcessResult = await this.fuzzyMatchService.processFuzzyMatches(
          fuzzyMatches.filter(m => m.recommendedAction !== 'ignore'),
          dryRun
        );
        
        // Get statistics
        const fuzzyStats = this.fuzzyMatchService.getStatistics(fuzzyMatches);
        
        results.fuzzyMatchResults = {
          totalProcessed: spirits.length,
          duplicatesFound: fuzzyMatches.length,
          autoMerged: fuzzyProcessResult.merged,
          flaggedForReview: fuzzyProcessResult.flagged,
          errors: 0,
          processingTime: 0,
          matches: [], // Could include the actual matches if needed
          fuzzyStats // Additional statistics
        } as any;
        
        results.totalDuplicatesFound += fuzzyMatches.length;
        results.totalMerged += fuzzyProcessResult.merged;
      }

      // Step 3: Run price variation analysis
      if (runPriceAnalysis) {
        logger.info('Starting price variation analysis phase');
        
        // Fetch all spirits for price analysis
        const spirits = await this.fetchSpiritsForDeduplication(incrementalOnly);
        
        // Analyze price variations
        const priceGroups = this.priceVariationHandler.analyzeByGroups(spirits);
        
        logger.info(`Found ${priceGroups.length} product groups with price variations`);
        
        // Apply price strategies if not in dry run mode
        if (!dryRun) {
          for (const group of priceGroups) {
            if (group.suggestedAction !== 'likely_different_products') {
              // Apply price strategy to primary spirit
              const updatedSpirit = this.priceVariationHandler.applyPriceStrategy(group);
              
              // Update spirit in database with new price/metadata
              const { error } = await this.supabase
                .from('spirits')
                .update({
                  price: updatedSpirit.price,
                  metadata: updatedSpirit.metadata
                })
                .eq('id', updatedSpirit.id);
              
              if (error) {
                logger.error(`Failed to update spirit ${updatedSpirit.id} with price variation data:`, error);
              }
            }
          }
        }
        
        // Get summary statistics
        const priceSummary = this.priceVariationHandler.getPriceSummary(priceGroups);
        
        results.priceVariationResults = {
          groups: priceGroups,
          summary: priceSummary
        };
      }

      logger.info('Comprehensive deduplication complete', {
        totalDuplicatesFound: results.totalDuplicatesFound,
        totalMerged: results.totalMerged,
        priceVariationsAnalyzed: results.priceVariationResults?.groups.length || 0,
        dryRun
      });

      return results;

    } catch (error) {
      logger.error('Comprehensive deduplication failed:', error);
      throw error;
    }
  }

  /**
   * Run full deduplication process on existing spirits
   */
  async runDeduplication(
    incrementalOnly: boolean = false,
    customConfig?: Partial<DeduplicationConfig>
  ): Promise<DeduplicationResult> {
    const startTime = Date.now();
    const config = { ...this.config, ...customConfig };
    
    logger.info('Starting deduplication process', {
      incrementalOnly,
      config: {
        nameThreshold: config.nameThreshold,
        brandThreshold: config.brandThreshold,
        combinedThreshold: config.combinedThreshold,
        batchSize: config.batchSize
      }
    });

    const result: DeduplicationResult = {
      totalProcessed: 0,
      duplicatesFound: 0,
      autoMerged: 0,
      flaggedForReview: 0,
      errors: 0,
      processingTime: 0,
      matches: []
    };

    try {
      // Fetch spirits to process
      const spirits = await this.fetchSpiritsForDeduplication(incrementalOnly);
      result.totalProcessed = spirits.length;

      logger.info(`Processing ${spirits.length} spirits for deduplication`);

      // Process in batches
      const matches: DuplicateMatch[] = [];
      for (let i = 0; i < spirits.length; i += config.batchSize) {
        const batch = spirits.slice(i, i + config.batchSize);
        const batchMatches = await this.processBatch(batch, config);
        matches.push(...batchMatches);

        // Log progress
        logger.info(`Processed batch ${Math.floor(i / config.batchSize) + 1}/${Math.ceil(spirits.length / config.batchSize)}`);
      }

      // Sort matches by similarity (highest first)
      matches.sort((a, b) => b.similarity - a.similarity);

      // Limit to max duplicates
      const limitedMatches = matches.slice(0, config.maxDuplicates);
      result.matches = limitedMatches;
      result.duplicatesFound = limitedMatches.length;

      // Process matches based on confidence and thresholds
      for (const match of limitedMatches) {
        try {
          if (match.similarity >= config.autoMergeThreshold && !config.requireManualReview) {
            await this.autoMergeSpirits(match);
            result.autoMerged++;
          } else {
            await this.flagForReview(match);
            result.flaggedForReview++;
          }
        } catch (error) {
          logger.error('Error processing match:', error);
          result.errors++;
        }
      }

      result.processingTime = Date.now() - startTime;

      logger.info('Deduplication completed', {
        totalProcessed: result.totalProcessed,
        duplicatesFound: result.duplicatesFound,
        autoMerged: result.autoMerged,
        flaggedForReview: result.flaggedForReview,
        errors: result.errors,
        processingTimeMs: result.processingTime
      });

      return result;

    } catch (error) {
      logger.error('Deduplication process failed:', error);
      result.processingTime = Date.now() - startTime;
      result.errors++;
      throw error;
    }
  }

  /**
   * Find duplicates for a specific spirit
   */
  async findDuplicatesForSpirit(
    targetSpirit: DatabaseSpirit,
    customConfig?: Partial<DeduplicationConfig>
  ): Promise<DuplicateMatch[]> {
    const config = { ...this.config, ...customConfig };
    
    // Fetch all other spirits
    const { data: spirits, error } = await this.supabase
      .from('spirits')
      .select('*')
      .neq('id', targetSpirit.id);

    if (error) {
      throw new Error(`Failed to fetch spirits: ${error.message}`);
    }

    // Compare against all spirits
    const matches: DuplicateMatch[] = [];
    for (const spirit of spirits) {
      const match = this.compareSpirits(targetSpirit, spirit, config);
      if (match && match.similarity >= config.combinedThreshold) {
        matches.push(match);
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Extract critical attributes from spirit name and properties
   */
  private extractAttributes(spirit: DatabaseSpirit): SpiritAttributes {
    const attributes: SpiritAttributes = {};
    const fullName = `${spirit.brand || ''} ${spirit.name}`.toLowerCase();

    // Extract age statement
    const ageMatch = fullName.match(/(\d+)\s*-?\s*year/i);
    if (ageMatch) {
      attributes.age = parseInt(ageMatch[1]);
    }

    // Extract proof
    const proofMatch = fullName.match(/(\d+(?:\.\d+)?)\s*(?:proof|pf)/i);
    if (proofMatch) {
      attributes.proof = parseFloat(proofMatch[1]);
    } else if (spirit.abv) {
      attributes.proof = spirit.abv * 2; // Convert ABV to proof
    }

    // Extract grain type
    if (fullName.includes('rye')) attributes.grainType = 'rye';
    else if (fullName.includes('wheat')) attributes.grainType = 'wheat';
    else if (fullName.includes('corn')) attributes.grainType = 'corn';
    else if (fullName.includes('barley')) attributes.grainType = 'barley';

    // Extract cask type
    const caskTypes = ['sherry', 'bourbon', 'port', 'madeira', 'rum', 'wine'];
    for (const cask of caskTypes) {
      if (fullName.includes(cask)) {
        attributes.caskType = cask;
        break;
      }
    }

    // Extract vintage
    const vintageMatch = fullName.match(/\b(19\d{2}|20\d{2})\b/);
    if (vintageMatch && !fullName.includes('release')) {
      attributes.vintage = parseInt(vintageMatch[1]);
    }

    // Extract release year
    const releaseMatch = fullName.match(/(\d{4})\s*release/i);
    if (releaseMatch) {
      attributes.release = releaseMatch[1];
    }

    // Special editions
    if (fullName.includes('limited edition') || fullName.includes('special edition')) {
      attributes.edition = 'limited';
    }

    // Product types
    attributes.isLiqueur = fullName.includes('liqueur') || fullName.includes('cream');
    attributes.isCaskStrength = fullName.includes('cask strength') || fullName.includes('barrel proof');
    attributes.isSingleBarrel = fullName.includes('single barrel') || fullName.includes('single cask');

    return attributes;
  }

  /**
   * Calculate attribute similarity/penalty
   */
  private calculateAttributePenalty(attrs1: SpiritAttributes, attrs2: SpiritAttributes, config: DeduplicationConfig): number {
    let penalty = 0;

    // Age mismatch penalty
    if (attrs1.age !== undefined && attrs2.age !== undefined && attrs1.age !== attrs2.age) {
      const ageDiff = Math.abs(attrs1.age - attrs2.age);
      // Severe penalty for different ages
      penalty += (config.agePenaltyWeight || 0.3) * Math.min(1, ageDiff / 10);
    }

    // Proof mismatch penalty
    if (attrs1.proof !== undefined && attrs2.proof !== undefined) {
      const proofDiff = Math.abs(attrs1.proof - attrs2.proof);
      if (proofDiff > 2) { // Allow small variations
        penalty += (config.proofPenaltyWeight || 0.2) * Math.min(1, proofDiff / 50);
      }
    }

    // Grain type mismatch penalty (severe)
    if (attrs1.grainType && attrs2.grainType && attrs1.grainType !== attrs2.grainType) {
      penalty += (config.grainTypePenaltyWeight || 0.25);
    }

    // Product type mismatches
    if (attrs1.isLiqueur !== attrs2.isLiqueur) penalty += 0.3;
    if (attrs1.isCaskStrength !== attrs2.isCaskStrength) penalty += 0.15;
    if (attrs1.isSingleBarrel !== attrs2.isSingleBarrel) penalty += 0.1;

    // Vintage mismatch
    if (attrs1.vintage && attrs2.vintage && attrs1.vintage !== attrs2.vintage) {
      penalty += 0.2;
    }

    // Different releases of same product (less severe)
    if (attrs1.release && attrs2.release && attrs1.release !== attrs2.release) {
      penalty += 0.05; // Small penalty as these might be mergeable
    }

    return Math.min(1, penalty); // Cap at 1.0
  }

  /**
   * Compare two spirits for similarity
   */
  compareSpirits(
    spirit1: DatabaseSpirit,
    spirit2: DatabaseSpirit,
    config: DeduplicationConfig = this.config
  ): DuplicateMatch | null {
    // First check with enhanced normalization keys
    const keys1 = createMultipleKeys(spirit1.name);
    const keys2 = createMultipleKeys(spirit2.name);
    
    // Check for exact normalized match
    const hasExactNormalizedMatch = 
      keys1.standard === keys2.standard ||
      keys1.aggressive === keys2.aggressive ||
      keys1.ultraAggressive === keys2.ultraAggressive;
    
    // Extract variant information
    const variant1 = extractVariantInfo(spirit1.name);
    const variant2 = extractVariantInfo(spirit2.name);
    
    // Extract attributes if enabled
    const attrs1 = config.extractAttributes !== false ? this.extractAttributes(spirit1) : {};
    const attrs2 = config.extractAttributes !== false ? this.extractAttributes(spirit2) : {};

    // Calculate attribute penalty
    const attributePenalty = this.calculateAttributePenalty(attrs1, attrs2, config);

    // Early exit if critical attributes don't match (unless normalized keys match)
    if (attributePenalty > 0.7 && !hasExactNormalizedMatch) {
      return null; // Too different to be duplicates
    }

    // Fuzzy name matching - boost score if normalized keys match
    let nameMatch = fuzzyMatch(spirit1.name, spirit2.name, config.fuzzyConfig);
    if (hasExactNormalizedMatch) {
      // Boost the similarity score for normalized matches
      nameMatch.similarity = Math.max(nameMatch.similarity, 0.95);
    }
    
    // Brand matching with dynamic weight
    let brandScore = 0;
    let brandWeight = config.differentBrandWeight || 0.4;
    let brandMatch: BrandNormalizationResult | undefined;
    
    if (spirit1.brand && spirit2.brand) {
      const brand1Norm = normalizeBrandName(spirit1.brand, config.brandConfig);
      const brand2Norm = normalizeBrandName(spirit2.brand, config.brandConfig);
      
      brandMatch = brand1Norm;
      
      if (brand1Norm.canonical === brand2Norm.canonical) {
        brandScore = 1.0;
        // Use lower weight for same brand comparisons
        brandWeight = config.sameBrandWeight || 0.15;
      } else {
        const brandFuzzy = fuzzyMatch(brand1Norm.canonical, brand2Norm.canonical, config.fuzzyConfig);
        brandScore = brandFuzzy.similarity;
      }
    }

    // Calculate name weight dynamically (inverse of brand weight)
    const nameWeight = 1 - brandWeight;
    
    // Base combined score
    const baseScore = (nameMatch.similarity * nameWeight) + (brandScore * brandWeight);
    
    // Apply attribute penalty
    const penalizedScore = baseScore * (1 - attributePenalty);

    // Additional context bonuses (smaller than before)
    let bonusScore = 0;
    
    // Only give bonuses if attributes match
    if (attrs1.age === attrs2.age && attrs1.age !== undefined) bonusScore += 0.02;
    if (attrs1.grainType === attrs2.grainType && attrs1.grainType !== undefined) bonusScore += 0.02;
    
    const finalScore = Math.min(1.0, penalizedScore + bonusScore);

    // Determine if this is a match
    // Use lower threshold for same-brand products
    const isSameBrand = brand1 && brand2 && brand1Norm?.canonical === brand2Norm?.canonical;
    const effectiveThreshold = isSameBrand ? 0.5 : config.combinedThreshold;  // Lowered from 0.65 to 0.5 for aggressive duplicate detection
    
    if (finalScore < effectiveThreshold) {
      return null;
    }

    // Log debug info for potential matches
    if (finalScore > config.combinedThreshold) {
      logger.debug('Potential match found', {
        spirit1: `${spirit1.brand} ${spirit1.name}`,
        spirit2: `${spirit2.brand} ${spirit2.name}`,
        nameMatch: nameMatch.similarity.toFixed(3),
        brandScore: brandScore.toFixed(3),
        brandWeight: brandWeight.toFixed(3),
        attributePenalty: attributePenalty.toFixed(3),
        finalScore: finalScore.toFixed(3),
        attrs1,
        attrs2
      });
    }

    // Determine match type
    let matchType: 'exact' | 'fuzzy_name' | 'fuzzy_brand' | 'combined';
    if (nameMatch.similarity >= 0.95 && brandScore >= 0.95 && attributePenalty < 0.1) {
      matchType = 'exact';
    } else if (brandScore === 1.0) {
      matchType = 'fuzzy_brand';
    } else if (nameMatch.similarity >= config.nameThreshold) {
      matchType = 'fuzzy_name';
    } else {
      matchType = 'combined';
    }

    // Determine confidence based on attribute matching
    let confidence: 'high' | 'medium' | 'low';
    if (finalScore >= 0.95 && attributePenalty < 0.1) {
      confidence = 'high';
    } else if (finalScore >= 0.85 && attributePenalty < 0.2) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    // Determine recommended action
    let recommendedAction: 'merge' | 'flag_for_review' | 'ignore';
    if (finalScore >= config.autoMergeThreshold && confidence === 'high') {
      recommendedAction = 'merge';
    } else if (finalScore >= config.combinedThreshold) {
      recommendedAction = 'flag_for_review';
    } else {
      recommendedAction = 'ignore';
    }

    return {
      spirit1,
      spirit2,
      similarity: finalScore,
      confidence,
      matchType,
      details: {
        nameMatch,
        brandMatch,
        combinedScore: finalScore
      },
      recommendedAction
    };
  }

  /**
   * Check for exact match (optimization)
   */
  private isExactMatch(spirit1: DatabaseSpirit, spirit2: DatabaseSpirit): boolean {
    return (
      spirit1.name.toLowerCase().trim() === spirit2.name.toLowerCase().trim() &&
      (spirit1.brand || '').toLowerCase().trim() === (spirit2.brand || '').toLowerCase().trim()
    );
  }

  /**
   * Fetch spirits for deduplication
   */
  private async fetchSpiritsForDeduplication(incrementalOnly: boolean): Promise<DatabaseSpirit[]> {
    let query = this.supabase
      .from('spirits')
      .select('*')
      .order('created_at', { ascending: false });

    if (incrementalOnly) {
      // Only fetch spirits from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      query = query.gte('created_at', yesterday.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch spirits: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Process a batch of spirits for deduplication
   */
  private async processBatch(
    spirits: DatabaseSpirit[],
    config: DeduplicationConfig
  ): Promise<DuplicateMatch[]> {
    const matches: DuplicateMatch[] = [];

    // Compare each spirit with every other spirit in the batch
    for (let i = 0; i < spirits.length; i++) {
      for (let j = i + 1; j < spirits.length; j++) {
        const match = this.compareSpirits(spirits[i], spirits[j], config);
        if (match) {
          matches.push(match);
        }
      }
    }

    return matches;
  }

  /**
   * Auto-merge two spirits
   */
  private async autoMergeSpirits(match: DuplicateMatch): Promise<void> {
    logger.info('Auto-merging spirits', {
      spirit1: match.spirit1.name,
      spirit2: match.spirit2.name,
      similarity: match.similarity
    });

    // Determine which spirit to keep (newer or more complete)
    const keepSpirit = this.chooseSpiritToKeep(match.spirit1, match.spirit2);
    const removeSpirit = keepSpirit.id === match.spirit1.id ? match.spirit2 : match.spirit1;

    // Merge data from both spirits
    const mergedData = this.mergeSpirits(keepSpirit, removeSpirit);

    // Update the kept spirit with merged data
    const { error: updateError } = await this.supabase
      .from('spirits')
      .update(mergedData)
      .eq('id', keepSpirit.id);

    if (updateError) {
      throw new Error(`Failed to update merged spirit: ${updateError.message}`);
    }

    // Delete the duplicate spirit
    const { error: deleteError } = await this.supabase
      .from('spirits')
      .delete()
      .eq('id', removeSpirit.id);

    if (deleteError) {
      throw new Error(`Failed to delete duplicate spirit: ${deleteError.message}`);
    }

    logger.info('Spirits merged successfully', {
      keptSpirit: keepSpirit.id,
      removedSpirit: removeSpirit.id
    });
  }

  /**
   * Flag match for manual review
   */
  private async flagForReview(match: DuplicateMatch): Promise<void> {
    try {
      // Store in duplicate_matches table for review
      const { error } = await this.supabase
        .from('duplicate_matches')
        .insert({
          spirit1_id: match.spirit1.id,
          spirit2_id: match.spirit2.id,
          similarity_score: match.similarity,
          confidence: match.confidence,
          match_type: match.matchType,
          details: match.details,
          recommended_action: match.recommendedAction,
          status: 'pending_review',
          created_at: new Date().toISOString()
        });

      if (error) {
        // Check if it's a duplicate entry error (which is fine - means we already flagged this pair)
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          logger.info(`Duplicate match already exists for spirits ${match.spirit1.id} and ${match.spirit2.id}`);
          return;
        }

        // Check if table doesn't exist
        if (error.code === '42P01' || error.message?.includes('relation "duplicate_matches" does not exist')) {
          logger.warn('duplicate_matches table does not exist. Please run the database migration first.');
          logger.warn('Run: supabase db reset or apply migration 20250601_create_duplicate_matches_table.sql');
          return;
        }

        logger.error('Failed to store duplicate match for review:', {
          error: error.message,
          code: error.code,
          spirits: `${match.spirit1.id} vs ${match.spirit2.id}`,
          similarity: match.similarity
        });
      } else {
        logger.info(`Successfully flagged duplicate match: ${match.spirit1.brand || 'Unknown'} ${match.spirit1.name} vs ${match.spirit2.brand || 'Unknown'} ${match.spirit2.name} (${(match.similarity * 100).toFixed(1)}%)`);
      }
    } catch (error) {
      logger.error('Exception while flagging match for review:', error);
    }
  }

  /**
   * Choose which spirit to keep during merge
   */
  private chooseSpiritToKeep(spirit1: DatabaseSpirit, spirit2: DatabaseSpirit): DatabaseSpirit {
    // Prefer newer spirits
    if (spirit1.created_at && spirit2.created_at) {
      if (spirit1.created_at > spirit2.created_at) return spirit1;
      if (spirit2.created_at > spirit1.created_at) return spirit2;
    }

    // Prefer spirits with more complete data
    const spirit1Score = this.calculateCompletenessScore(spirit1);
    const spirit2Score = this.calculateCompletenessScore(spirit2);

    return spirit1Score >= spirit2Score ? spirit1 : spirit2;
  }

  /**
   * Calculate completeness score for a spirit
   */
  private calculateCompletenessScore(spirit: DatabaseSpirit): number {
    let score = 0;
    
    if (spirit.name) score += 1;
    if (spirit.brand) score += 1;
    if (spirit.description && spirit.description.length > 50) score += 1;
    if (spirit.abv) score += 1;
    if (spirit.type) score += 1;
    if (spirit.category) score += 1;
    if (spirit.origin_country) score += 1;
    if (spirit.region) score += 1;
    if (spirit.price_range) score += 1;
    if (spirit.image_url) score += 1;
    if (spirit.flavor_profile && spirit.flavor_profile.length > 0) score += 1;
    
    return score;
  }

  /**
   * Merge data from two spirits
   */
  private mergeSpirits(primary: DatabaseSpirit, secondary: DatabaseSpirit): Partial<DatabaseSpirit> {
    const merged: Partial<DatabaseSpirit> = { ...primary };

    // Merge fields, preferring non-empty values
    if (!merged.description && secondary.description) {
      merged.description = secondary.description;
    } else if (merged.description && secondary.description && secondary.description.length > merged.description.length) {
      merged.description = secondary.description;
    }

    if (!merged.abv && secondary.abv) merged.abv = secondary.abv;
    if (!merged.type && secondary.type) merged.type = secondary.type;
    if (!merged.category && secondary.category) merged.category = secondary.category;
    if (!merged.origin_country && secondary.origin_country) merged.origin_country = secondary.origin_country;
    if (!merged.region && secondary.region) merged.region = secondary.region;
    if (!merged.price_range && secondary.price_range) merged.price_range = secondary.price_range;
    if (!merged.image_url && secondary.image_url) merged.image_url = secondary.image_url;

    // Merge flavor profiles
    if (secondary.flavor_profile && secondary.flavor_profile.length > 0) {
      const existingFlavors = new Set(merged.flavor_profile || []);
      const newFlavors = secondary.flavor_profile.filter(f => !existingFlavors.has(f));
      merged.flavor_profile = [...(merged.flavor_profile || []), ...newFlavors];
    }

    return merged;
  }

  /**
   * Compatibility method for CLI - maps to runDeduplication
   */
  async findAndHandleDuplicates(options?: {
    threshold?: number;
    dryRun?: boolean;
    autoMerge?: boolean;
  }): Promise<{
    totalPairs: number;
    mergedCount: number;
  }> {
    const result = await this.runDeduplication({
      combinedThreshold: options?.threshold || 0.7,
      requireManualReview: options?.dryRun ?? true,
      autoMergeThreshold: options?.autoMerge ? (options.threshold || 0.85) : 1.0,
    });
    
    return {
      totalPairs: result.duplicatesFound,
      mergedCount: result.autoMerged,
    };
  }

  /**
   * Get deduplication statistics
   */
  async getDeduplicationStats(): Promise<{
    totalSpirits: number;
    pendingReview: number;
    autoMergedToday: number;
    duplicateRate: number;
  }> {
    try {
      const [spiritsResult, pendingResult] = await Promise.all([
        this.supabase.from('spirits').select('id', { count: 'exact' }),
        this.supabase.from('duplicate_matches').select('id', { count: 'exact' }).eq('status', 'pending_review')
      ]);

      const totalSpirits = spiritsResult.count || 0;
      
      // Handle case where duplicate_matches table doesn't exist yet
      let pendingReview = 0;
      if (pendingResult.error) {
        if (pendingResult.error.code === '42P01' || pendingResult.error.message?.includes('duplicate_matches')) {
          logger.info('duplicate_matches table not found, returning zero pending reviews');
        } else {
          logger.error('Error fetching pending reviews:', pendingResult.error);
        }
      } else {
        pendingReview = pendingResult.count || 0;
      }

      // Get auto-merged count for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let autoMergedToday = 0;
      try {
        const { count, error } = await this.supabase
          .from('duplicate_matches')
          .select('id', { count: 'exact' })
          .eq('status', 'auto_merged')
          .gte('created_at', today.toISOString());

        if (!error) {
          autoMergedToday = count || 0;
        }
      } catch (error) {
        // Ignore errors for auto-merged count if table doesn't exist
        logger.debug('Could not fetch auto-merged count:', error);
      }

      return {
        totalSpirits,
        pendingReview,
        autoMergedToday,
        duplicateRate: totalSpirits > 0 ? (pendingReview / totalSpirits) * 100 : 0
      };
    } catch (error) {
      logger.error('Error getting deduplication stats:', error);
      return {
        totalSpirits: 0,
        pendingReview: 0,
        autoMergedToday: 0,
        duplicateRate: 0
      };
    }
  }
}

// Singleton instance
export const deduplicationService = new DeduplicationService();