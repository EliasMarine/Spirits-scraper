/**
 * Exact Match Deduplication Service
 * 
 * Groups spirits by normalized keys and identifies exact duplicates
 * Uses the normalization module to find spirits with identical normalized names
 */

import { createClient } from '@supabase/supabase-js';
import { createNormalizedKey, createMultipleKeys, extractVariantInfo } from './normalization-keys.js';
import { logger } from '../utils/logger.js';
import { SpiritData } from '../types/index.js';

// Database spirit type
interface DatabaseSpirit extends SpiritData {
  id: string;
  created_at: string;
  updated_at?: string;
}

// Duplicate group structure
export interface DuplicateGroup {
  normalizedKey: string;
  spirits: DatabaseSpirit[];
  primarySpirit: DatabaseSpirit;
  duplicates: DatabaseSpirit[];
  score: number; // Confidence score
  mergeStrategy: 'auto' | 'manual' | 'skip';
}

// Configuration for exact match deduplication
export interface ExactMatchConfig {
  useStandardKey: boolean;
  useAggressiveKey: boolean;
  useUltraAggressiveKey: boolean;
  minGroupSize: number;
  scoringWeights: {
    dataCompleteness: number;
    createdDate: number;
    hasImage: number;
    hasPrice: number;
    descriptionLength: number;
  };
}

const DEFAULT_CONFIG: ExactMatchConfig = {
  useStandardKey: true,
  useAggressiveKey: true,
  useUltraAggressiveKey: false, // Too aggressive for exact matching
  minGroupSize: 2,
  scoringWeights: {
    dataCompleteness: 0.3,
    createdDate: 0.2,
    hasImage: 0.2,
    hasPrice: 0.15,
    descriptionLength: 0.15,
  }
};

/**
 * Exact Match Deduplication Service
 */
export class ExactMatchDeduplicationService {
  private supabase: any;
  private config: ExactMatchConfig;

  constructor(config: ExactMatchConfig = DEFAULT_CONFIG) {
    this.config = config;
    // Only initialize Supabase if environment variables are present
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
    }
  }

  /**
   * Find exact duplicate groups in the database
   */
  async findExactDuplicates(
    spirits?: DatabaseSpirit[],
    customConfig?: Partial<ExactMatchConfig>
  ): Promise<DuplicateGroup[]> {
    const config = { ...this.config, ...customConfig };
    
    logger.info('Starting exact match deduplication');
    
    // Fetch spirits if not provided
    if (!spirits) {
      spirits = await this.fetchAllSpirits();
    }
    
    logger.info(`Processing ${spirits.length} spirits for exact matches`);
    
    // Group by normalized keys
    const groups = this.groupByNormalizedKeys(spirits, config);
    
    // Filter to only groups with duplicates
    const duplicateGroups = Array.from(groups.values())
      .filter(group => group.length >= config.minGroupSize);
    
    logger.info(`Found ${duplicateGroups.length} groups with potential duplicates`);
    
    // Convert to DuplicateGroup format with scoring
    const scoredGroups = duplicateGroups.map(spirits => 
      this.createDuplicateGroup(spirits, config)
    );
    
    // Sort by confidence score (highest first)
    scoredGroups.sort((a, b) => b.score - a.score);
    
    return scoredGroups;
  }

  /**
   * Group spirits by normalized keys
   */
  private groupByNormalizedKeys(
    spirits: DatabaseSpirit[],
    config: ExactMatchConfig
  ): Map<string, DatabaseSpirit[]> {
    const groups = new Map<string, DatabaseSpirit[]>();
    
    spirits.forEach(spirit => {
      const keys = createMultipleKeys(spirit.name);
      const keysToCheck: string[] = [];
      
      if (config.useStandardKey) keysToCheck.push(keys.standard);
      if (config.useAggressiveKey) keysToCheck.push(keys.aggressive);
      if (config.useUltraAggressiveKey) keysToCheck.push(keys.ultraAggressive);
      
      // Use the most aggressive key that's enabled
      const groupKey = keysToCheck[keysToCheck.length - 1];
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(spirit);
    });
    
    return groups;
  }

  /**
   * Create a duplicate group with scoring
   */
  private createDuplicateGroup(
    spirits: DatabaseSpirit[],
    config: ExactMatchConfig
  ): DuplicateGroup {
    // Score each spirit to determine the primary
    const scoredSpirits = spirits.map(spirit => ({
      spirit,
      score: this.scoreSpirit(spirit, config)
    }));
    
    // Sort by score (highest first)
    scoredSpirits.sort((a, b) => b.score - a.score);
    
    const primarySpirit = scoredSpirits[0].spirit;
    const duplicates = scoredSpirits.slice(1).map(s => s.spirit);
    
    // Calculate group confidence score
    const normalizedKey = createNormalizedKey(primarySpirit.name);
    const groupScore = this.calculateGroupScore(spirits);
    
    // Determine merge strategy
    let mergeStrategy: 'auto' | 'manual' | 'skip' = 'manual';
    if (groupScore >= 0.95) {
      mergeStrategy = 'auto';
    } else if (groupScore < 0.7) {
      mergeStrategy = 'skip';
    }
    
    return {
      normalizedKey,
      spirits,
      primarySpirit,
      duplicates,
      score: groupScore,
      mergeStrategy
    };
  }

  /**
   * Score a spirit based on data completeness and quality
   */
  private scoreSpirit(spirit: DatabaseSpirit, config: ExactMatchConfig): number {
    const weights = config.scoringWeights;
    let score = 0;
    
    // Data completeness score
    let completeness = 0;
    if (spirit.name) completeness += 0.1;
    if (spirit.brand) completeness += 0.1;
    if (spirit.type) completeness += 0.1;
    if (spirit.description) completeness += 0.15;
    if (spirit.abv) completeness += 0.1;
    if (spirit.price_range) completeness += 0.15;
    if (spirit.origin_country) completeness += 0.1;
    if (spirit.region) completeness += 0.1;
    if (spirit.flavor_profile?.length) completeness += 0.1;
    
    score += completeness * weights.dataCompleteness;
    
    // Newer spirits score higher
    if (spirit.created_at) {
      const ageInDays = (Date.now() - new Date(spirit.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 1 - (ageInDays / 365)); // Decay over a year
      score += recencyScore * weights.createdDate;
    }
    
    // Has image
    if (spirit.image_url) {
      score += weights.hasImage;
    }
    
    // Has price
    if (spirit.price_range || spirit.price_usd) {
      score += weights.hasPrice;
    }
    
    // Description quality
    if (spirit.description) {
      const descLength = spirit.description.length;
      const descScore = Math.min(1, descLength / 500); // Max score at 500 chars
      score += descScore * weights.descriptionLength;
    }
    
    return score;
  }

  /**
   * Calculate confidence score for a duplicate group
   */
  private calculateGroupScore(spirits: DatabaseSpirit[]): number {
    if (spirits.length < 2) return 0;
    
    // Base score based on group size
    let score = Math.min(1, spirits.length / 5); // Max at 5 duplicates
    
    // Check brand consistency
    const brands = spirits.map(s => s.brand?.toLowerCase()).filter(Boolean);
    const uniqueBrands = new Set(brands);
    if (uniqueBrands.size === 1 && brands.length === spirits.length) {
      score += 0.2; // All have same brand
    }
    
    // Check type consistency
    const types = spirits.map(s => s.type?.toLowerCase()).filter(Boolean);
    const uniqueTypes = new Set(types);
    if (uniqueTypes.size === 1 && types.length === spirits.length) {
      score += 0.1; // All have same type
    }
    
    // Check variant differences
    const variants = spirits.map(s => extractVariantInfo(s.name));
    const hasSizeVariants = variants.some(v => v.size);
    const hasYearVariants = variants.some(v => v.year);
    const hasGiftSets = variants.some(v => v.giftSet);
    
    // These are expected duplicate patterns
    if (hasSizeVariants) score += 0.1;
    if (hasYearVariants) score += 0.1;
    if (hasGiftSets) score += 0.1;
    
    return Math.min(1, score);
  }

  /**
   * Merge duplicate groups
   */
  async mergeDuplicateGroups(
    groups: DuplicateGroup[],
    dryRun: boolean = false
  ): Promise<{
    processed: number;
    merged: number;
    skipped: number;
    errors: number;
  }> {
    const results = {
      processed: 0,
      merged: 0,
      skipped: 0,
      errors: 0
    };
    
    for (const group of groups) {
      results.processed++;
      
      try {
        if (group.mergeStrategy === 'skip') {
          results.skipped++;
          logger.info(`Skipping group with low confidence: ${group.normalizedKey}`);
          continue;
        }
        
        if (group.mergeStrategy === 'manual') {
          logger.info(`Manual review required for: ${group.normalizedKey}`);
          // In a real implementation, this would flag for manual review
          results.skipped++;
          continue;
        }
        
        // Auto-merge
        if (!dryRun) {
          await this.mergeSpirits(group);
          results.merged++;
          logger.info(`Merged ${group.duplicates.length} duplicates into ${group.primarySpirit.name}`);
        } else {
          results.merged++; // Count what would be merged
          logger.info(`[DRY RUN] Would merge ${group.duplicates.length} duplicates into ${group.primarySpirit.name}`);
        }
        
      } catch (error) {
        results.errors++;
        logger.error(`Error processing group ${group.normalizedKey}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Merge spirits in a duplicate group
   */
  private async mergeSpirits(group: DuplicateGroup): Promise<void> {
    const primary = group.primarySpirit;
    const duplicates = group.duplicates;
    
    // Merge data from duplicates into primary
    const mergedData = this.mergeData(primary, duplicates);
    
    // Update primary spirit with merged data
    const { error: updateError } = await this.supabase
      .from('spirits')
      .update(mergedData)
      .eq('id', primary.id);
    
    if (updateError) {
      throw new Error(`Failed to update primary spirit: ${updateError.message}`);
    }
    
    // Delete duplicates
    const duplicateIds = duplicates.map(d => d.id);
    const { error: deleteError } = await this.supabase
      .from('spirits')
      .delete()
      .in('id', duplicateIds);
    
    if (deleteError) {
      throw new Error(`Failed to delete duplicates: ${deleteError.message}`);
    }
    
    logger.info(`Successfully merged ${duplicates.length} spirits into ${primary.name}`);
  }

  /**
   * Merge data from multiple spirits
   */
  private mergeData(primary: DatabaseSpirit, duplicates: DatabaseSpirit[]): Partial<DatabaseSpirit> {
    const merged: Partial<DatabaseSpirit> = { ...primary };
    
    // Merge fields, preferring non-empty values
    for (const duplicate of duplicates) {
      // Description - prefer longest
      if (duplicate.description && (!merged.description || duplicate.description.length > merged.description.length)) {
        merged.description = duplicate.description;
      }
      
      // Fill missing fields
      if (!merged.abv && duplicate.abv) merged.abv = duplicate.abv;
      if (!merged.price_range && duplicate.price_range) merged.price_range = duplicate.price_range;
      if (!merged.price_usd && duplicate.price_usd) merged.price_usd = duplicate.price_usd;
      if (!merged.image_url && duplicate.image_url) merged.image_url = duplicate.image_url;
      if (!merged.origin_country && duplicate.origin_country) merged.origin_country = duplicate.origin_country;
      if (!merged.region && duplicate.region) merged.region = duplicate.region;
      if (!merged.distillery && duplicate.distillery) merged.distillery = duplicate.distillery;
      if (!merged.bottler && duplicate.bottler) merged.bottler = duplicate.bottler;
      if (!merged.age_statement && duplicate.age_statement) merged.age_statement = duplicate.age_statement;
      if (!merged.cask_type && duplicate.cask_type) merged.cask_type = duplicate.cask_type;
      if (!merged.mash_bill && duplicate.mash_bill) merged.mash_bill = duplicate.mash_bill;
      
      // Merge flavor profiles
      if (duplicate.flavor_profile && duplicate.flavor_profile.length > 0) {
        const existingFlavors = new Set(merged.flavor_profile || []);
        const newFlavors = duplicate.flavor_profile.filter(f => !existingFlavors.has(f));
        merged.flavor_profile = [...(merged.flavor_profile || []), ...newFlavors];
      }
    }
    
    // Update quality score
    merged.data_quality_score = this.calculateDataQualityScore(merged as DatabaseSpirit);
    
    return merged;
  }

  /**
   * Calculate data quality score
   */
  private calculateDataQualityScore(spirit: DatabaseSpirit): number {
    let score = 0;
    let maxScore = 0;
    
    // Required fields (40 points)
    if (spirit.name) score += 10;
    maxScore += 10;
    
    if (spirit.brand) score += 10;
    maxScore += 10;
    
    if (spirit.type) score += 10;
    maxScore += 10;
    
    if (spirit.description && spirit.description.length > 50) score += 10;
    maxScore += 10;
    
    // Important fields (30 points)
    if (spirit.abv) score += 10;
    maxScore += 10;
    
    if (spirit.price_range || spirit.price_usd) score += 10;
    maxScore += 10;
    
    if (spirit.image_url) score += 10;
    maxScore += 10;
    
    // Additional fields (30 points)
    if (spirit.origin_country) score += 5;
    maxScore += 5;
    
    if (spirit.region) score += 5;
    maxScore += 5;
    
    if (spirit.distillery) score += 5;
    maxScore += 5;
    
    if (spirit.age_statement) score += 5;
    maxScore += 5;
    
    if (spirit.flavor_profile && spirit.flavor_profile.length > 0) score += 5;
    maxScore += 5;
    
    if (spirit.whiskey_style) score += 5;
    maxScore += 5;
    
    return Math.round((score / maxScore) * 100);
  }

  /**
   * Fetch all spirits from database
   */
  private async fetchAllSpirits(): Promise<DatabaseSpirit[]> {
    const { data, error } = await this.supabase
      .from('spirits')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch spirits: ${error.message}`);
    }
    
    return data || [];
  }

  /**
   * Get statistics about duplicate groups
   */
  getStatistics(groups: DuplicateGroup[]): {
    totalGroups: number;
    totalDuplicates: number;
    avgGroupSize: number;
    avgConfidence: number;
    byMergeStrategy: Record<string, number>;
  } {
    const totalDuplicates = groups.reduce((sum, g) => sum + g.duplicates.length, 0);
    const avgGroupSize = groups.length > 0 ? 
      groups.reduce((sum, g) => sum + g.spirits.length, 0) / groups.length : 0;
    const avgConfidence = groups.length > 0 ?
      groups.reduce((sum, g) => sum + g.score, 0) / groups.length : 0;
    
    const byMergeStrategy = groups.reduce((acc, g) => {
      acc[g.mergeStrategy] = (acc[g.mergeStrategy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalGroups: groups.length,
      totalDuplicates,
      avgGroupSize,
      avgConfidence,
      byMergeStrategy
    };
  }
}

// Export singleton getter to defer initialization
export const getExactMatchDeduplication = () => {
  return new ExactMatchDeduplicationService();
};