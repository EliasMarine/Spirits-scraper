/**
 * Enhanced Dry-Run Deduplication Service
 * 
 * Implements comprehensive dry-run mode that simulates deduplication without modifying data.
 * Provides detailed reports, confidence scoring, and similarity cluster visualizations.
 * 
 * Features:
 * - Preview of all merge operations
 * - Detailed similarity analysis
 * - Confidence scoring with explanations
 * - Similarity cluster visualizations
 * - Impact assessment reports
 * - Export capabilities for manual review
 */

import { logger } from '../utils/logger.js';
import { DeduplicationService, DuplicateMatch, DeduplicationConfig } from './deduplication-service.js';
import { DatabaseSpirit } from '../types/index.js';
import { ExactMatchDeduplicationService } from './exact-match-deduplication.js';
import { FuzzyMatchDeduplicationService } from './fuzzy-match-deduplication.js';
import { PriceVariationHandler, PriceVariationGroup } from './price-variation-handler.js';
import { BlockingDeduplicationService } from './blocking-deduplication.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Detailed duplicate match with extended analysis
 */
export interface DryRunDuplicateMatch extends DuplicateMatch {
  matchId: string;
  analysisDetails: {
    nameAnalysis: {
      original1: string;
      original2: string;
      normalized1: string;
      normalized2: string;
      similarity: number;
      matchingTokens: string[];
      differences: string[];
    };
    brandAnalysis: {
      brand1: string;
      brand2: string;
      normalized1: string;
      normalized2: string;
      isSameBrand: boolean;
      similarity: number;
    };
    attributeAnalysis: {
      age: { spirit1?: number; spirit2?: number; match: boolean; penalty: number };
      proof: { spirit1?: number; spirit2?: number; match: boolean; penalty: number };
      type: { spirit1: string; spirit2: string; match: boolean; penalty: number };
      grainType: { spirit1?: string; spirit2?: string; match: boolean; penalty: number };
    };
    priceAnalysis: {
      price1?: number;
      price2?: number;
      priceDifference?: number;
      priceVariationPercentage?: number;
      priceCompatible: boolean;
    };
  };
  mergePreview: {
    actionType: 'merge' | 'flag_for_review' | 'ignore';
    primarySpirit: DatabaseSpirit;
    secondarySpirit: DatabaseSpirit;
    mergedData: Partial<DatabaseSpirit>;
    dataImprovements: string[];
    potentialLosses: string[];
  };
  confidenceExplanation: string;
}

/**
 * Similarity cluster for visualization
 */
export interface SimilarityCluster {
  clusterId: string;
  centerSpirit: DatabaseSpirit;
  members: {
    spirit: DatabaseSpirit;
    similarity: number;
    relationship: 'exact' | 'high_similarity' | 'medium_similarity' | 'low_similarity';
  }[];
  clusterSimilarity: number;
  recommendedAction: 'merge_all' | 'merge_high_confidence' | 'flag_for_review' | 'no_action';
}

/**
 * Comprehensive dry-run report
 */
export interface DryRunReport {
  summary: {
    totalSpiritsAnalyzed: number;
    totalDuplicatesFound: number;
    potentialMerges: number;
    flaggedForReview: number;
    ignoredDuplicates: number;
    processingTime: number;
    estimatedDataQualityImprovement: number;
  };
  matches: DryRunDuplicateMatch[];
  clusters: SimilarityCluster[];
  blockingStats?: {
    totalBlocks: number;
    reductionPercentage: number;
    comparisonsWithoutBlocking: number;
    comparisonsWithBlocking: number;
    averageBlockSize: number;
    largestBlockSize: number;
  };
  priceVariationAnalysis?: {
    groups: PriceVariationGroup[];
    summary: any;
  };
  impactAssessment: {
    spiritsToBeRemoved: number;
    dataFieldsToBeEnhanced: number;
    estimatedDuplicationReduction: number;
    potentialDataLoss: string[];
    dataQualityImprovements: string[];
  };
  exportPaths: {
    detailedReportJson: string;
    matchesCsv: string;
    clustersJson: string;
    summaryTxt: string;
  };
}

/**
 * Enhanced Dry-Run Deduplication Service
 */
export class DryRunDeduplicationService {
  private deduplicationService: DeduplicationService;
  private exactMatchService: ExactMatchDeduplicationService;
  private fuzzyMatchService: FuzzyMatchDeduplicationService;
  private priceVariationHandler: PriceVariationHandler;
  private blockingService: BlockingDeduplicationService;

  constructor(config?: DeduplicationConfig) {
    this.deduplicationService = new DeduplicationService(config);
    this.exactMatchService = new ExactMatchDeduplicationService();
    this.fuzzyMatchService = new FuzzyMatchDeduplicationService();
    this.priceVariationHandler = new PriceVariationHandler();
    this.blockingService = new BlockingDeduplicationService();
  }

  /**
   * Run comprehensive dry-run deduplication analysis
   */
  async runDryRunAnalysis(options: {
    incrementalOnly?: boolean;
    useBlocking?: boolean;
    customConfig?: Partial<DeduplicationConfig>;
    exportDir?: string;
    generateVisualizations?: boolean;
  } = {}): Promise<DryRunReport> {
    const {
      incrementalOnly = false,
      useBlocking = true,
      customConfig,
      exportDir = './dry-run-reports',
      generateVisualizations = true
    } = options;

    const startTime = Date.now();
    logger.info('Starting comprehensive dry-run deduplication analysis');

    try {
      // Get spirits for analysis
      const spirits = await this.fetchSpiritsForAnalysis(incrementalOnly);
      logger.info(`Analyzing ${spirits.length} spirits in dry-run mode`);

      const report: DryRunReport = {
        summary: {
          totalSpiritsAnalyzed: spirits.length,
          totalDuplicatesFound: 0,
          potentialMerges: 0,
          flaggedForReview: 0,
          ignoredDuplicates: 0,
          processingTime: 0,
          estimatedDataQualityImprovement: 0
        },
        matches: [],
        clusters: [],
        impactAssessment: {
          spiritsToBeRemoved: 0,
          dataFieldsToBeEnhanced: 0,
          estimatedDuplicationReduction: 0,
          potentialDataLoss: [],
          dataQualityImprovements: []
        },
        exportPaths: {
          detailedReportJson: '',
          matchesCsv: '',
          clustersJson: '',
          summaryTxt: ''
        }
      };

      // Run blocking analysis if enabled
      let blockingStats: any = undefined;
      let blocksToProcess: Map<string, any> | undefined;

      if (useBlocking && spirits.length > 100) {
        logger.info('Running blocking analysis for optimization');
        blocksToProcess = this.blockingService.createBlocks(spirits);
        const reduction = this.blockingService.calculateReduction(spirits.length, blocksToProcess);
        
        blockingStats = {
          totalBlocks: blocksToProcess.size,
          reductionPercentage: reduction.reductionPercentage,
          comparisonsWithoutBlocking: reduction.withoutBlocking,
          comparisonsWithBlocking: reduction.withBlocking,
          averageBlockSize: Array.from(blocksToProcess.values())
            .reduce((sum, block) => sum + block.size, 0) / blocksToProcess.size,
          largestBlockSize: Math.max(...Array.from(blocksToProcess.values()).map(b => b.size))
        };
        
        report.blockingStats = blockingStats;
        logger.info(`Blocking reduces comparisons by ${reduction.reductionPercentage.toFixed(1)}%`);
      }

      // Analyze matches
      const allMatches = await this.findAllDryRunMatches(spirits, customConfig, blocksToProcess);
      
      // Enhance matches with detailed analysis
      const enhancedMatches = await this.enhanceMatchesWithAnalysis(allMatches);
      report.matches = enhancedMatches;
      report.summary.totalDuplicatesFound = enhancedMatches.length;

      // Calculate action counts
      enhancedMatches.forEach(match => {
        switch (match.recommendedAction) {
          case 'merge':
            report.summary.potentialMerges++;
            break;
          case 'flag_for_review':
            report.summary.flaggedForReview++;
            break;
          case 'ignore':
            report.summary.ignoredDuplicates++;
            break;
        }
      });

      // Generate similarity clusters
      if (generateVisualizations) {
        report.clusters = this.generateSimilarityClusters(enhancedMatches);
      }

      // Run price variation analysis
      const priceGroups = this.priceVariationHandler.analyzeByGroups(spirits);
      const priceSummary = this.priceVariationHandler.getPriceSummary(priceGroups);
      report.priceVariationAnalysis = {
        groups: priceGroups,
        summary: priceSummary
      };

      // Calculate impact assessment
      report.impactAssessment = this.calculateImpactAssessment(enhancedMatches, spirits);

      // Calculate data quality improvement estimate
      report.summary.estimatedDataQualityImprovement = this.estimateDataQualityImprovement(enhancedMatches);

      const processingTime = Date.now() - startTime;
      report.summary.processingTime = processingTime;

      // Export reports
      report.exportPaths = await this.exportReports(report, exportDir);

      logger.info('Dry-run analysis completed', {
        totalAnalyzed: report.summary.totalSpiritsAnalyzed,
        duplicatesFound: report.summary.totalDuplicatesFound,
        potentialMerges: report.summary.potentialMerges,
        processingTimeMs: processingTime
      });

      return report;

    } catch (error) {
      logger.error('Dry-run analysis failed:', error);
      throw error;
    }
  }

  /**
   * Find all duplicate matches with detailed analysis
   */
  private async findAllDryRunMatches(
    spirits: DatabaseSpirit[],
    customConfig?: Partial<DeduplicationConfig>,
    blocks?: Map<string, any>
  ): Promise<DuplicateMatch[]> {
    const matches: DuplicateMatch[] = [];

    if (blocks) {
      // Process blocks
      for await (const blockBatch of this.blockingService.processBlocksInBatches(blocks)) {
        for (const block of blockBatch) {
          if (block.size < 2) continue;
          
          // Find exact matches within block
          const exactGroups = await this.exactMatchService.findExactDuplicates(block.spirits);
          
          // Convert exact groups to matches
          for (const group of exactGroups) {
            for (let i = 0; i < group.spirits.length; i++) {
              for (let j = i + 1; j < group.spirits.length; j++) {
                const match = this.deduplicationService.compareSpirits(
                  group.spirits[i],
                  group.spirits[j],
                  { ...this.deduplicationService['config'], ...customConfig }
                );
                if (match) {
                  matches.push(match);
                }
              }
            }
          }
          
          // Find fuzzy matches within block
          const processedIds = new Set<string>();
          for (const group of exactGroups) {
            group.spirits.forEach(spirit => processedIds.add(spirit.id));
          }
          
          const fuzzyMatches = await this.fuzzyMatchService.findFuzzyDuplicates(
            block.spirits,
            processedIds
          );
          
          // Convert FuzzyMatchCandidate to DuplicateMatch
          const convertedMatches = fuzzyMatches.map(candidate => ({
            spirit1: candidate.spirit1,
            spirit2: candidate.spirit2,
            similarity: candidate.similarity,
            confidence: candidate.confidence,
            matchType: 'fuzzy_name' as const,
            details: {
              nameMatch: candidate.matchDetails.nameSimilarity,
              brandMatch: undefined,
              combinedScore: candidate.similarity
            },
            recommendedAction: candidate.recommendedAction === 'review' ? 'flag_for_review' as const : 
                             candidate.recommendedAction === 'merge' ? 'merge' as const : 'ignore' as const
          }));
          
          matches.push(...convertedMatches);
        }
      }
    } else {
      // Process all spirits without blocking
      for (let i = 0; i < spirits.length; i++) {
        for (let j = i + 1; j < spirits.length; j++) {
          const match = this.deduplicationService.compareSpirits(
            spirits[i],
            spirits[j],
            { ...this.deduplicationService['config'], ...customConfig }
          );
          if (match) {
            matches.push(match);
          }
        }
      }
    }

    return matches;
  }

  /**
   * Enhance matches with detailed analysis
   */
  private async enhanceMatchesWithAnalysis(matches: DuplicateMatch[]): Promise<DryRunDuplicateMatch[]> {
    return matches.map((match, index) => {
      const matchId = `match_${index + 1}`;
      
      // Name analysis
      const nameAnalysis = this.analyzeNameSimilarity(match.spirit1.name, match.spirit2.name);
      
      // Brand analysis
      const brandAnalysis = this.analyzeBrandSimilarity(
        match.spirit1.brand || '',
        match.spirit2.brand || ''
      );
      
      // Attribute analysis
      const attributeAnalysis = this.analyzeAttributes(match.spirit1, match.spirit2);
      
      // Price analysis
      const priceAnalysis = this.analyzePrices(match.spirit1, match.spirit2);
      
      // Merge preview
      const mergePreview = this.generateMergePreview(match.spirit1, match.spirit2);
      
      // Confidence explanation
      const confidenceExplanation = this.generateConfidenceExplanation(match, {
        nameAnalysis,
        brandAnalysis,
        attributeAnalysis,
        priceAnalysis
      });

      return {
        ...match,
        matchId,
        analysisDetails: {
          nameAnalysis,
          brandAnalysis,
          attributeAnalysis,
          priceAnalysis
        },
        mergePreview,
        confidenceExplanation
      };
    });
  }

  /**
   * Analyze name similarity in detail
   */
  private analyzeNameSimilarity(name1: string, name2: string) {
    const normalized1 = name1.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const normalized2 = name2.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    const tokens1 = normalized1.split(/\s+/);
    const tokens2 = normalized2.split(/\s+/);
    
    const matchingTokens = tokens1.filter(token => tokens2.includes(token));
    const differences = [
      ...tokens1.filter(token => !tokens2.includes(token)),
      ...tokens2.filter(token => !tokens1.includes(token))
    ];
    
    // Simple Jaccard similarity
    const union = new Set([...tokens1, ...tokens2]);
    const intersection = new Set(matchingTokens);
    const similarity = intersection.size / union.size;

    return {
      original1: name1,
      original2: name2,
      normalized1,
      normalized2,
      similarity,
      matchingTokens,
      differences
    };
  }

  /**
   * Analyze brand similarity in detail
   */
  private analyzeBrandSimilarity(brand1: string, brand2: string) {
    const normalized1 = brand1.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const normalized2 = brand2.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const isSameBrand = normalized1 === normalized2 && normalized1.length > 0;
    
    // Simple similarity for brands
    const similarity = isSameBrand ? 1.0 : 
      (normalized1 && normalized2) ? 
        (normalized1.includes(normalized2) || normalized2.includes(normalized1) ? 0.8 : 0.0) : 0.0;

    return {
      brand1,
      brand2,
      normalized1,
      normalized2,
      isSameBrand,
      similarity
    };
  }

  /**
   * Analyze spirit attributes
   */
  private analyzeAttributes(spirit1: DatabaseSpirit, spirit2: DatabaseSpirit) {
    // Extract age from names
    const extractAge = (name: string) => {
      const match = name.match(/(\d+)\s*(?:year|yr)/i);
      return match ? parseInt(match[1]) : undefined;
    };

    // Extract proof from ABV or name
    const extractProof = (spirit: DatabaseSpirit) => {
      if (spirit.abv) return spirit.abv * 2;
      const match = spirit.name.match(/(\d+(?:\.\d+)?)\s*(?:proof|pf)/i);
      return match ? parseFloat(match[1]) : undefined;
    };

    const age1 = extractAge(spirit1.name);
    const age2 = extractAge(spirit2.name);
    const proof1 = extractProof(spirit1);
    const proof2 = extractProof(spirit2);

    return {
      age: {
        spirit1: age1,
        spirit2: age2,
        match: age1 === age2,
        penalty: (age1 !== undefined && age2 !== undefined && age1 !== age2) ? 
          Math.min(0.3, Math.abs(age1 - age2) / 20) : 0
      },
      proof: {
        spirit1: proof1,
        spirit2: proof2,
        match: proof1 !== undefined && proof2 !== undefined ? Math.abs(proof1 - proof2) <= 2 : true,
        penalty: (proof1 !== undefined && proof2 !== undefined && Math.abs(proof1 - proof2) > 2) ?
          Math.min(0.2, Math.abs(proof1 - proof2) / 100) : 0
      },
      type: {
        spirit1: spirit1.type || 'unknown',
        spirit2: spirit2.type || 'unknown',
        match: (spirit1.type || 'unknown') === (spirit2.type || 'unknown'),
        penalty: (spirit1.type && spirit2.type && spirit1.type !== spirit2.type) ? 0.25 : 0
      },
      grainType: {
        spirit1: this.extractGrainType(spirit1.name),
        spirit2: this.extractGrainType(spirit2.name),
        match: this.extractGrainType(spirit1.name) === this.extractGrainType(spirit2.name),
        penalty: this.getGrainTypePenalty(spirit1.name, spirit2.name)
      }
    };
  }

  /**
   * Extract grain type from spirit name
   */
  private extractGrainType(name: string): string | undefined {
    const lower = name.toLowerCase();
    if (lower.includes('rye')) return 'rye';
    if (lower.includes('wheat')) return 'wheat';
    if (lower.includes('corn')) return 'corn';
    if (lower.includes('barley')) return 'barley';
    return undefined;
  }

  /**
   * Calculate grain type penalty
   */
  private getGrainTypePenalty(name1: string, name2: string): number {
    const grain1 = this.extractGrainType(name1);
    const grain2 = this.extractGrainType(name2);
    return (grain1 && grain2 && grain1 !== grain2) ? 0.25 : 0;
  }

  /**
   * Analyze price compatibility
   */
  private analyzePrices(spirit1: DatabaseSpirit, spirit2: DatabaseSpirit) {
    const price1 = this.extractPrice(spirit1);
    const price2 = this.extractPrice(spirit2);
    
    if (!price1 || !price2) {
      return {
        price1,
        price2,
        priceCompatible: true // Unknown prices are compatible
      };
    }

    const priceDifference = Math.abs(price1 - price2);
    const avgPrice = (price1 + price2) / 2;
    const priceVariationPercentage = (priceDifference / avgPrice) * 100;
    const priceCompatible = priceVariationPercentage <= 20; // 20% variation threshold

    return {
      price1,
      price2,
      priceDifference,
      priceVariationPercentage,
      priceCompatible
    };
  }

  /**
   * Extract price from spirit data
   */
  private extractPrice(spirit: DatabaseSpirit): number | undefined {
    // Try to extract from price_range or other fields
    if (typeof spirit.price_range === 'string') {
      const match = spirit.price_range.match(/\$?(\d+(?:\.\d+)?)/);
      if (match) return parseFloat(match[1]);
    }
    return undefined;
  }

  /**
   * Generate merge preview
   */
  private generateMergePreview(spirit1: DatabaseSpirit, spirit2: DatabaseSpirit) {
    // Determine primary spirit (more complete data)
    const score1 = this.calculateCompletenessScore(spirit1);
    const score2 = this.calculateCompletenessScore(spirit2);
    const primary = score1 >= score2 ? spirit1 : spirit2;
    const secondary = primary === spirit1 ? spirit2 : spirit1;

    // Generate merged data
    const mergedData = this.previewMergeData(primary, secondary);
    
    // Identify improvements and potential losses
    const dataImprovements = this.identifyDataImprovements(primary, secondary, mergedData);
    const potentialLosses = this.identifyPotentialLosses(primary, secondary);

    // Determine action type
    let actionType: 'merge' | 'flag_for_review' | 'ignore' = 'ignore';
    if (this.shouldAutoMerge(spirit1, spirit2)) {
      actionType = 'merge';
    } else if (this.shouldFlagForReview(spirit1, spirit2)) {
      actionType = 'flag_for_review';
    }

    return {
      actionType,
      primarySpirit: primary,
      secondarySpirit: secondary,
      mergedData,
      dataImprovements,
      potentialLosses
    };
  }

  /**
   * Calculate completeness score for a spirit
   */
  private calculateCompletenessScore(spirit: DatabaseSpirit): number {
    let score = 0;
    if (spirit.name) score += 2;
    if (spirit.brand) score += 2;
    if (spirit.description && spirit.description.length > 50) score += 3;
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
   * Preview merged data
   */
  private previewMergeData(primary: DatabaseSpirit, secondary: DatabaseSpirit): Partial<DatabaseSpirit> {
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
   * Identify data improvements from merge
   */
  private identifyDataImprovements(
    primary: DatabaseSpirit,
    secondary: DatabaseSpirit,
    merged: Partial<DatabaseSpirit>
  ): string[] {
    const improvements: string[] = [];
    
    if (!primary.description && merged.description) {
      improvements.push('Added description');
    } else if (primary.description && merged.description && merged.description.length > primary.description.length) {
      improvements.push('Enhanced description');
    }
    
    if (!primary.abv && merged.abv) improvements.push('Added ABV');
    if (!primary.origin_country && merged.origin_country) improvements.push('Added origin country');
    if (!primary.region && merged.region) improvements.push('Added region');
    if (!primary.price_range && merged.price_range) improvements.push('Added price information');
    if (!primary.image_url && merged.image_url) improvements.push('Added image');
    
    const originalFlavors = primary.flavor_profile?.length || 0;
    const mergedFlavors = merged.flavor_profile?.length || 0;
    if (mergedFlavors > originalFlavors) {
      improvements.push(`Added ${mergedFlavors - originalFlavors} flavor profile entries`);
    }

    return improvements;
  }

  /**
   * Identify potential data losses
   */
  private identifyPotentialLosses(primary: DatabaseSpirit, secondary: DatabaseSpirit): string[] {
    const losses: string[] = [];
    
    if (secondary.description && primary.description && secondary.description !== primary.description) {
      losses.push('Alternative description will be lost');
    }
    if (secondary.image_url && primary.image_url && secondary.image_url !== primary.image_url) {
      losses.push('Alternative image URL will be lost');
    }
    if (secondary.price_range && primary.price_range && secondary.price_range !== primary.price_range) {
      losses.push('Alternative price information will be lost');
    }

    return losses;
  }

  /**
   * Check if spirits should be auto-merged
   */
  private shouldAutoMerge(spirit1: DatabaseSpirit, spirit2: DatabaseSpirit): boolean {
    // Very conservative auto-merge criteria
    const nameMatch = this.analyzeNameSimilarity(spirit1.name, spirit2.name);
    const brandMatch = this.analyzeBrandSimilarity(spirit1.brand || '', spirit2.brand || '');
    
    return nameMatch.similarity >= 0.95 && 
           brandMatch.isSameBrand && 
           (spirit1.type || '') === (spirit2.type || '');
  }

  /**
   * Check if spirits should be flagged for review
   */
  private shouldFlagForReview(spirit1: DatabaseSpirit, spirit2: DatabaseSpirit): boolean {
    const nameMatch = this.analyzeNameSimilarity(spirit1.name, spirit2.name);
    const brandMatch = this.analyzeBrandSimilarity(spirit1.brand || '', spirit2.brand || '');
    
    return nameMatch.similarity >= 0.7 || (brandMatch.isSameBrand && nameMatch.similarity >= 0.5);
  }

  /**
   * Generate confidence explanation
   */
  private generateConfidenceExplanation(match: DuplicateMatch, analysis: any): string {
    const explanations: string[] = [];
    
    explanations.push(`Overall similarity: ${(match.similarity * 100).toFixed(1)}%`);
    explanations.push(`Name similarity: ${(analysis.nameAnalysis.similarity * 100).toFixed(1)}%`);
    
    if (analysis.brandAnalysis.isSameBrand) {
      explanations.push('Same brand detected');
    } else if (analysis.brandAnalysis.similarity > 0) {
      explanations.push(`Brand similarity: ${(analysis.brandAnalysis.similarity * 100).toFixed(1)}%`);
    }
    
    if (analysis.attributeAnalysis.age.match) {
      explanations.push('Age statements match');
    } else if (analysis.attributeAnalysis.age.penalty > 0) {
      explanations.push(`Age mismatch penalty: ${(analysis.attributeAnalysis.age.penalty * 100).toFixed(1)}%`);
    }
    
    if (analysis.attributeAnalysis.type.match) {
      explanations.push('Spirit types match');
    } else {
      explanations.push('Spirit types differ');
    }
    
    if (analysis.priceAnalysis.priceCompatible) {
      explanations.push('Prices are compatible');
    } else if (analysis.priceAnalysis.priceVariationPercentage) {
      explanations.push(`Price variation: ${analysis.priceAnalysis.priceVariationPercentage.toFixed(1)}%`);
    }

    return explanations.join('; ');
  }

  /**
   * Generate similarity clusters for visualization
   */
  private generateSimilarityClusters(matches: DryRunDuplicateMatch[]): SimilarityCluster[] {
    const clusters: SimilarityCluster[] = [];
    const processedSpirits = new Set<string>();
    
    // Group matches by spirits
    const spiritConnections = new Map<string, Set<string>>();
    
    matches.forEach(match => {
      const id1 = match.spirit1.id;
      const id2 = match.spirit2.id;
      
      if (!spiritConnections.has(id1)) spiritConnections.set(id1, new Set());
      if (!spiritConnections.has(id2)) spiritConnections.set(id2, new Set());
      
      spiritConnections.get(id1)!.add(id2);
      spiritConnections.get(id2)!.add(id1);
    });
    
    // Build clusters using connected components
    spiritConnections.forEach((connections, spiritId) => {
      if (processedSpirits.has(spiritId)) return;
      
      // Find all connected spirits (simple BFS)
      const clusterSpirits = new Set<string>();
      const queue = [spiritId];
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (clusterSpirits.has(currentId)) continue;
        
        clusterSpirits.add(currentId);
        processedSpirits.add(currentId);
        
        const currentConnections = spiritConnections.get(currentId);
        if (currentConnections) {
          currentConnections.forEach(connectedId => {
            if (!clusterSpirits.has(connectedId)) {
              queue.push(connectedId);
            }
          });
        }
      }
      
      if (clusterSpirits.size > 1) {
        // Find center spirit and build cluster
        const clusterMatches = matches.filter(m => 
          clusterSpirits.has(m.spirit1.id) && clusterSpirits.has(m.spirit2.id)
        );
        
        if (clusterMatches.length > 0) {
          const centerSpirit = clusterMatches[0].spirit1; // Simplified center selection
          const members = Array.from(clusterSpirits)
            .map(id => {
              const spirit = matches.find(m => m.spirit1.id === id || m.spirit2.id === id);
              const relevantMatch = clusterMatches.find(m => 
                m.spirit1.id === id || m.spirit2.id === id
              );
              
              if (spirit && relevantMatch) {
                return {
                  spirit: spirit.spirit1.id === id ? spirit.spirit1 : spirit.spirit2,
                  similarity: relevantMatch.similarity,
                  relationship: this.categorizeRelationship(relevantMatch.similarity)
                };
              }
              return null;
            })
            .filter(Boolean) as any[];
          
          const avgSimilarity = clusterMatches.reduce((sum, m) => sum + m.similarity, 0) / clusterMatches.length;
          
          clusters.push({
            clusterId: `cluster_${clusters.length + 1}`,
            centerSpirit,
            members,
            clusterSimilarity: avgSimilarity,
            recommendedAction: this.determineClusterAction(clusterMatches)
          });
        }
      }
    });
    
    return clusters;
  }

  /**
   * Categorize relationship based on similarity
   */
  private categorizeRelationship(similarity: number): 'exact' | 'high_similarity' | 'medium_similarity' | 'low_similarity' {
    if (similarity >= 0.95) return 'exact';
    if (similarity >= 0.85) return 'high_similarity';
    if (similarity >= 0.7) return 'medium_similarity';
    return 'low_similarity';
  }

  /**
   * Determine recommended action for cluster
   */
  private determineClusterAction(matches: DryRunDuplicateMatch[]): 'merge_all' | 'merge_high_confidence' | 'flag_for_review' | 'no_action' {
    const highConfidenceMatches = matches.filter(m => m.confidence === 'high').length;
    const totalMatches = matches.length;
    
    if (highConfidenceMatches === totalMatches && totalMatches > 0) {
      return 'merge_all';
    } else if (highConfidenceMatches > 0) {
      return 'merge_high_confidence';
    } else if (totalMatches > 0) {
      return 'flag_for_review';
    }
    return 'no_action';
  }

  /**
   * Calculate impact assessment
   */
  private calculateImpactAssessment(matches: DryRunDuplicateMatch[], allSpirits: DatabaseSpirit[]) {
    const spiritsToBeRemoved = matches.filter(m => m.recommendedAction === 'merge').length;
    const dataFieldsToBeEnhanced = matches.reduce((sum, match) => 
      sum + match.mergePreview.dataImprovements.length, 0
    );
    
    const estimatedDuplicationReduction = (spiritsToBeRemoved / allSpirits.length) * 100;
    
    const potentialDataLoss = Array.from(new Set(
      matches.flatMap(m => m.mergePreview.potentialLosses)
    ));
    
    const dataQualityImprovements = Array.from(new Set(
      matches.flatMap(m => m.mergePreview.dataImprovements)
    ));

    return {
      spiritsToBeRemoved,
      dataFieldsToBeEnhanced,
      estimatedDuplicationReduction,
      potentialDataLoss,
      dataQualityImprovements
    };
  }

  /**
   * Estimate data quality improvement
   */
  private estimateDataQualityImprovement(matches: DryRunDuplicateMatch[]): number {
    if (matches.length === 0) return 0;
    
    const improvementPoints = matches.reduce((sum, match) => {
      return sum + match.mergePreview.dataImprovements.length * 2; // 2 points per improvement
    }, 0);
    
    return Math.min(100, improvementPoints); // Cap at 100%
  }

  /**
   * Export comprehensive reports
   */
  private async exportReports(report: DryRunReport, exportDir: string): Promise<DryRunReport['exportPaths']> {
    try {
      // Ensure export directory exists
      const fs = await import('fs');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Export paths
      const paths = {
        detailedReportJson: join(exportDir, `dry-run-detailed-${timestamp}.json`),
        matchesCsv: join(exportDir, `dry-run-matches-${timestamp}.csv`),
        clustersJson: join(exportDir, `dry-run-clusters-${timestamp}.json`),
        summaryTxt: join(exportDir, `dry-run-summary-${timestamp}.txt`)
      };

      // Export detailed JSON report
      writeFileSync(paths.detailedReportJson, JSON.stringify(report, null, 2));

      // Export matches CSV
      const csvHeaders = [
        'Match ID', 'Spirit 1', 'Spirit 2', 'Similarity', 'Confidence', 'Action',
        'Name Similarity', 'Brand Match', 'Age Match', 'Type Match', 'Price Compatible'
      ];
      const csvRows = report.matches.map(match => [
        match.matchId,
        `"${match.spirit1.brand || ''} ${match.spirit1.name}"`,
        `"${match.spirit2.brand || ''} ${match.spirit2.name}"`,
        (match.similarity * 100).toFixed(1) + '%',
        match.confidence,
        match.recommendedAction,
        (match.analysisDetails.nameAnalysis.similarity * 100).toFixed(1) + '%',
        match.analysisDetails.brandAnalysis.isSameBrand ? 'Yes' : 'No',
        match.analysisDetails.attributeAnalysis.age.match ? 'Yes' : 'No',
        match.analysisDetails.attributeAnalysis.type.match ? 'Yes' : 'No',
        match.analysisDetails.priceAnalysis.priceCompatible ? 'Yes' : 'No'
      ]);
      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
      writeFileSync(paths.matchesCsv, csvContent);

      // Export clusters JSON
      writeFileSync(paths.clustersJson, JSON.stringify(report.clusters, null, 2));

      // Export summary text
      const summaryText = this.generateSummaryText(report);
      writeFileSync(paths.summaryTxt, summaryText);

      logger.info('Dry-run reports exported successfully', { exportDir, files: Object.keys(paths).length });
      
      return paths;
      
    } catch (error) {
      logger.error('Failed to export dry-run reports:', error);
      return {
        detailedReportJson: '',
        matchesCsv: '',
        clustersJson: '',
        summaryTxt: ''
      };
    }
  }

  /**
   * Generate summary text report
   */
  private generateSummaryText(report: DryRunReport): string {
    const lines: string[] = [];
    
    lines.push('DRY-RUN DEDUPLICATION ANALYSIS SUMMARY');
    lines.push('=' .repeat(50));
    lines.push('');
    
    lines.push('OVERVIEW:');
    lines.push(`  Total spirits analyzed: ${report.summary.totalSpiritsAnalyzed.toLocaleString()}`);
    lines.push(`  Total duplicates found: ${report.summary.totalDuplicatesFound}`);
    lines.push(`  Processing time: ${(report.summary.processingTime / 1000).toFixed(2)}s`);
    lines.push('');
    
    lines.push('RECOMMENDED ACTIONS:');
    lines.push(`  Auto-merge candidates: ${report.summary.potentialMerges}`);
    lines.push(`  Flag for review: ${report.summary.flaggedForReview}`);
    lines.push(`  Ignore (low confidence): ${report.summary.ignoredDuplicates}`);
    lines.push('');
    
    if (report.blockingStats) {
      lines.push('BLOCKING OPTIMIZATION:');
      lines.push(`  Total blocks created: ${report.blockingStats.totalBlocks}`);
      lines.push(`  Comparison reduction: ${report.blockingStats.reductionPercentage.toFixed(1)}%`);
      lines.push(`  Largest block size: ${report.blockingStats.largestBlockSize} spirits`);
      lines.push('');
    }
    
    lines.push('IMPACT ASSESSMENT:');
    lines.push(`  Spirits to be removed: ${report.impactAssessment.spiritsToBeRemoved}`);
    lines.push(`  Data fields to be enhanced: ${report.impactAssessment.dataFieldsToBeEnhanced}`);
    lines.push(`  Estimated duplication reduction: ${report.impactAssessment.estimatedDuplicationReduction.toFixed(1)}%`);
    lines.push(`  Estimated data quality improvement: ${report.summary.estimatedDataQualityImprovement.toFixed(1)}%`);
    lines.push('');
    
    if (report.impactAssessment.dataQualityImprovements.length > 0) {
      lines.push('DATA QUALITY IMPROVEMENTS:');
      report.impactAssessment.dataQualityImprovements.forEach(improvement => {
        lines.push(`  - ${improvement}`);
      });
      lines.push('');
    }
    
    if (report.impactAssessment.potentialDataLoss.length > 0) {
      lines.push('POTENTIAL DATA LOSS:');
      report.impactAssessment.potentialDataLoss.forEach(loss => {
        lines.push(`  - ${loss}`);
      });
      lines.push('');
    }
    
    lines.push('SIMILARITY CLUSTERS:');
    lines.push(`  Total clusters identified: ${report.clusters.length}`);
    report.clusters.forEach((cluster, index) => {
      lines.push(`  Cluster ${index + 1}: ${cluster.members.length} spirits, avg similarity ${(cluster.clusterSimilarity * 100).toFixed(1)}%`);
      lines.push(`    Recommended action: ${cluster.recommendedAction.replace(/_/g, ' ')}`);
    });
    
    return lines.join('\n');
  }

  /**
   * Fetch spirits for analysis
   */
  private async fetchSpiritsForAnalysis(incrementalOnly: boolean): Promise<DatabaseSpirit[]> {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    let query = supabase
      .from('spirits')
      .select('*')
      .order('created_at', { ascending: false });

    if (incrementalOnly) {
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
}

// Export singleton instance
export const dryRunDeduplicationService = new DryRunDeduplicationService();