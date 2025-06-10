/**
 * Enhanced Fuzzy Match Deduplication Service
 * 
 * Implements TF-IDF vectorization and fuzzy matching for identifying
 * similar but non-identical spirit entries
 */

import { createClient } from '@supabase/supabase-js';
import { fuzzyMatch, FuzzyMatchConfig, FuzzyMatchResult } from './fuzzy-matching.js';
import { createNormalizedKey, extractVariantInfo } from './normalization-keys.js';
import { logger } from '../utils/logger.js';
import { SpiritData } from '../types/index.js';

// Database spirit type
interface DatabaseSpirit extends SpiritData {
  id: string;
  created_at: string;
  updated_at?: string;
}

// TF-IDF vector representation
interface TFIDFVector {
  [term: string]: number;
}

// Fuzzy match candidate
export interface FuzzyMatchCandidate {
  spirit1: DatabaseSpirit;
  spirit2: DatabaseSpirit;
  similarity: number;
  tfidfScore: number;
  fuzzyScore: number;
  confidence: 'high' | 'medium' | 'low';
  matchDetails: {
    nameSimilarity: FuzzyMatchResult;
    descriptionSimilarity?: number;
    brandMatch: boolean;
    typeMatch: boolean;
    variantDifferences: string[];
  };
  recommendedAction: 'merge' | 'review' | 'ignore';
}

// Configuration
export interface FuzzyDeduplicationConfig {
  sameBrandThreshold: number;
  differentBrandThreshold: number;
  tfidfWeight: number;
  fuzzyWeight: number;
  minDescriptionLength: number;
  fuzzyMatchConfig: FuzzyMatchConfig;
}

const DEFAULT_FUZZY_CONFIG: FuzzyDeduplicationConfig = {
  sameBrandThreshold: 0.7, // As specified in task 4.4
  differentBrandThreshold: 0.85,
  tfidfWeight: 0.4,
  fuzzyWeight: 0.6,
  minDescriptionLength: 50,
  fuzzyMatchConfig: {
    threshold: 0.6,
    weights: {
      levenshtein: 0.2,
      jaroWinkler: 0.3,
      nGram: 0.2,
      phonetic: 0.1,
      tokenBased: 0.2,
    },
    nGramSize: 3,
    caseSensitive: false,
    removeStopWords: true,
  }
};

/**
 * Fuzzy Match Deduplication Service
 */
export class FuzzyMatchDeduplicationService {
  private supabase: any;
  private config: FuzzyDeduplicationConfig;
  private documentFrequency: Map<string, number> = new Map();
  private totalDocuments: number = 0;

  constructor(config: FuzzyDeduplicationConfig = DEFAULT_FUZZY_CONFIG) {
    this.config = config;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
    }
  }

  /**
   * Find fuzzy duplicate candidates
   */
  async findFuzzyDuplicates(
    spirits: DatabaseSpirit[],
    excludeIds?: Set<string>
  ): Promise<FuzzyMatchCandidate[]> {
    logger.info('Starting fuzzy match deduplication');
    
    // Filter out spirits that were already processed by exact match
    const eligibleSpirits = excludeIds 
      ? spirits.filter(s => !excludeIds.has(s.id))
      : spirits;
    
    logger.info(`Processing ${eligibleSpirits.length} spirits for fuzzy matching`);
    
    // Build TF-IDF corpus
    this.buildTFIDFCorpus(eligibleSpirits);
    
    // Find candidates
    const candidates: FuzzyMatchCandidate[] = [];
    
    for (let i = 0; i < eligibleSpirits.length; i++) {
      for (let j = i + 1; j < eligibleSpirits.length; j++) {
        const candidate = this.compareSpiritsFuzzy(eligibleSpirits[i], eligibleSpirits[j]);
        if (candidate) {
          candidates.push(candidate);
        }
      }
      
      // Log progress every 100 spirits
      if ((i + 1) % 100 === 0) {
        logger.info(`Processed ${i + 1}/${eligibleSpirits.length} spirits`);
      }
    }
    
    // Sort by similarity (highest first)
    candidates.sort((a, b) => b.similarity - a.similarity);
    
    logger.info(`Found ${candidates.length} fuzzy match candidates`);
    
    return candidates;
  }

  /**
   * Build TF-IDF corpus from spirits
   */
  private buildTFIDFCorpus(spirits: DatabaseSpirit[]): void {
    this.documentFrequency.clear();
    this.totalDocuments = spirits.length;
    
    // Count document frequency for each term
    for (const spirit of spirits) {
      const terms = this.extractTerms(spirit);
      const uniqueTerms = new Set(terms);
      
      for (const term of uniqueTerms) {
        this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
      }
    }
    
    logger.debug(`Built TF-IDF corpus with ${this.documentFrequency.size} unique terms`);
  }

  /**
   * Extract terms from a spirit for TF-IDF
   */
  private extractTerms(spirit: DatabaseSpirit): string[] {
    const terms: string[] = [];
    
    // Extract from name
    if (spirit.name) {
      terms.push(...this.tokenize(spirit.name));
    }
    
    // Extract from brand
    if (spirit.brand) {
      terms.push(...this.tokenize(spirit.brand));
    }
    
    // Extract from description
    if (spirit.description && spirit.description.length >= this.config.minDescriptionLength) {
      terms.push(...this.tokenize(spirit.description));
    }
    
    // Extract from type and category
    if (spirit.type) {
      terms.push(spirit.type.toLowerCase());
    }
    if (spirit.category) {
      terms.push(spirit.category.toLowerCase());
    }
    
    return terms;
  }

  /**
   * Tokenize text into terms
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2 && !this.isStopWord(term));
  }

  /**
   * Check if a word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their'
    ]);
    return stopWords.has(word);
  }

  /**
   * Calculate TF-IDF vector for a spirit
   */
  private calculateTFIDFVector(spirit: DatabaseSpirit): TFIDFVector {
    const terms = this.extractTerms(spirit);
    const termFrequency = new Map<string, number>();
    const vector: TFIDFVector = {};
    
    // Calculate term frequency
    for (const term of terms) {
      termFrequency.set(term, (termFrequency.get(term) || 0) + 1);
    }
    
    // Calculate TF-IDF for each unique term
    for (const [term, tf] of termFrequency) {
      const df = this.documentFrequency.get(term) || 0;
      if (df > 0) {
        const idf = Math.log(this.totalDocuments / df);
        vector[term] = (tf / terms.length) * idf;
      }
    }
    
    return vector;
  }

  /**
   * Calculate cosine similarity between two TF-IDF vectors
   */
  private cosineSimilarity(vector1: TFIDFVector, vector2: TFIDFVector): number {
    const terms = new Set([...Object.keys(vector1), ...Object.keys(vector2)]);
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (const term of terms) {
      const v1 = vector1[term] || 0;
      const v2 = vector2[term] || 0;
      
      dotProduct += v1 * v2;
      magnitude1 += v1 * v1;
      magnitude2 += v2 * v2;
    }
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
  }

  /**
   * Compare two spirits using fuzzy matching and TF-IDF
   */
  private compareSpiritsFuzzy(
    spirit1: DatabaseSpirit,
    spirit2: DatabaseSpirit
  ): FuzzyMatchCandidate | null {
    // Check if they have the same normalized key (already handled by exact match)
    const key1 = createNormalizedKey(spirit1.name);
    const key2 = createNormalizedKey(spirit2.name);
    if (key1 === key2) {
      return null; // Skip, should be handled by exact match
    }
    
    // Fuzzy match on names
    const nameMatch = fuzzyMatch(spirit1.name, spirit2.name, this.config.fuzzyMatchConfig);
    
    // Calculate TF-IDF similarity
    const vector1 = this.calculateTFIDFVector(spirit1);
    const vector2 = this.calculateTFIDFVector(spirit2);
    const tfidfScore = this.cosineSimilarity(vector1, vector2);
    
    // Check brand and type matches
    const brandMatch = spirit1.brand?.toLowerCase() === spirit2.brand?.toLowerCase();
    const typeMatch = spirit1.type?.toLowerCase() === spirit2.type?.toLowerCase();
    
    // Extract variant differences
    const variant1 = extractVariantInfo(spirit1.name);
    const variant2 = extractVariantInfo(spirit2.name);
    const variantDifferences: string[] = [];
    
    if (variant1.size !== variant2.size) {
      variantDifferences.push(`Size: ${variant1.size || 'standard'} vs ${variant2.size || 'standard'}`);
    }
    if (variant1.year !== variant2.year) {
      variantDifferences.push(`Year: ${variant1.year || 'none'} vs ${variant2.year || 'none'}`);
    }
    if (variant1.giftSet !== variant2.giftSet) {
      variantDifferences.push('Gift set variation');
    }
    if (variant1.proof !== variant2.proof) {
      variantDifferences.push(`Proof: ${variant1.proof || 'standard'} vs ${variant2.proof || 'standard'}`);
    }
    
    // Calculate description similarity if both have descriptions
    let descriptionSimilarity: number | undefined;
    if (
      spirit1.description && spirit2.description &&
      spirit1.description.length >= this.config.minDescriptionLength &&
      spirit2.description.length >= this.config.minDescriptionLength
    ) {
      const descMatch = fuzzyMatch(spirit1.description, spirit2.description, this.config.fuzzyMatchConfig);
      descriptionSimilarity = descMatch.similarity;
    }
    
    // Calculate combined similarity score
    const fuzzyScore = nameMatch.similarity;
    const combinedScore = (
      fuzzyScore * this.config.fuzzyWeight +
      tfidfScore * this.config.tfidfWeight
    );
    
    // Determine threshold based on brand match
    const threshold = brandMatch 
      ? this.config.sameBrandThreshold 
      : this.config.differentBrandThreshold;
    
    // Skip if below threshold
    if (combinedScore < threshold) {
      return null;
    }
    
    // Determine confidence
    let confidence: 'high' | 'medium' | 'low';
    if (combinedScore >= 0.9 && brandMatch && typeMatch) {
      confidence = 'high';
    } else if (combinedScore >= 0.8) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
    
    // Determine action
    let recommendedAction: 'merge' | 'review' | 'ignore';
    if (confidence === 'high' && variantDifferences.length <= 1) {
      recommendedAction = 'merge';
    } else if (combinedScore >= threshold) {
      recommendedAction = 'review';
    } else {
      recommendedAction = 'ignore';
    }
    
    return {
      spirit1,
      spirit2,
      similarity: combinedScore,
      tfidfScore,
      fuzzyScore,
      confidence,
      matchDetails: {
        nameSimilarity: nameMatch,
        descriptionSimilarity,
        brandMatch,
        typeMatch,
        variantDifferences
      },
      recommendedAction
    };
  }

  /**
   * Process fuzzy match candidates
   */
  async processFuzzyMatches(
    candidates: FuzzyMatchCandidate[],
    dryRun: boolean = false
  ): Promise<{
    processed: number;
    merged: number;
    flagged: number;
    ignored: number;
  }> {
    const results = {
      processed: 0,
      merged: 0,
      flagged: 0,
      ignored: 0
    };
    
    for (const candidate of candidates) {
      results.processed++;
      
      try {
        switch (candidate.recommendedAction) {
          case 'merge':
            if (!dryRun) {
              await this.mergeSpirits(candidate);
            }
            results.merged++;
            logger.info(`${dryRun ? '[DRY RUN] Would merge' : 'Merged'}: ${candidate.spirit1.name} <-> ${candidate.spirit2.name}`);
            break;
            
          case 'review':
            if (!dryRun) {
              await this.flagForReview(candidate);
            }
            results.flagged++;
            logger.info(`${dryRun ? '[DRY RUN] Would flag' : 'Flagged'} for review: ${candidate.spirit1.name} <-> ${candidate.spirit2.name}`);
            break;
            
          case 'ignore':
            results.ignored++;
            break;
        }
      } catch (error) {
        logger.error(`Error processing fuzzy match candidate:`, error);
      }
    }
    
    return results;
  }

  /**
   * Merge spirits based on fuzzy match
   */
  private async mergeSpirits(candidate: FuzzyMatchCandidate): Promise<void> {
    // Determine which spirit has more complete data
    const spirit1Score = this.calculateCompletenessScore(candidate.spirit1);
    const spirit2Score = this.calculateCompletenessScore(candidate.spirit2);
    
    const primary = spirit1Score >= spirit2Score ? candidate.spirit1 : candidate.spirit2;
    const secondary = primary === candidate.spirit1 ? candidate.spirit2 : candidate.spirit1;
    
    // Merge data
    const merged = this.mergeData(primary, secondary);
    
    // Update primary
    if (this.supabase) {
      const { error: updateError } = await this.supabase
        .from('spirits')
        .update(merged)
        .eq('id', primary.id);
      
      if (updateError) {
        throw new Error(`Failed to update spirit: ${updateError.message}`);
      }
      
      // Delete secondary
      const { error: deleteError } = await this.supabase
        .from('spirits')
        .delete()
        .eq('id', secondary.id);
      
      if (deleteError) {
        throw new Error(`Failed to delete duplicate: ${deleteError.message}`);
      }
    }
  }

  /**
   * Flag candidate for manual review
   */
  private async flagForReview(candidate: FuzzyMatchCandidate): Promise<void> {
    if (!this.supabase) return;
    
    const { error } = await this.supabase
      .from('duplicate_matches')
      .insert({
        spirit1_id: candidate.spirit1.id,
        spirit2_id: candidate.spirit2.id,
        similarity_score: candidate.similarity,
        confidence: candidate.confidence,
        match_type: 'fuzzy',
        details: {
          tfidfScore: candidate.tfidfScore,
          fuzzyScore: candidate.fuzzyScore,
          matchDetails: candidate.matchDetails
        },
        recommended_action: candidate.recommendedAction,
        status: 'pending_review',
        created_at: new Date().toISOString()
      });
    
    if (error && !error.message?.includes('duplicate')) {
      logger.error('Failed to flag for review:', error);
    }
  }

  /**
   * Calculate spirit data completeness score
   */
  private calculateCompletenessScore(spirit: DatabaseSpirit): number {
    let score = 0;
    const fields = [
      'name', 'brand', 'type', 'description', 'abv', 'price_range',
      'image_url', 'origin_country', 'region', 'distillery'
    ];
    
    for (const field of fields) {
      if (spirit[field as keyof DatabaseSpirit]) {
        score++;
      }
    }
    
    return score / fields.length;
  }

  /**
   * Merge data from two spirits
   */
  private mergeData(primary: DatabaseSpirit, secondary: DatabaseSpirit): Partial<DatabaseSpirit> {
    const merged: Partial<DatabaseSpirit> = { ...primary };
    
    // Only fill in missing fields from secondary
    const fields: (keyof DatabaseSpirit)[] = [
      'description', 'abv', 'price_range', 'price_usd', 'image_url',
      'origin_country', 'region', 'distillery', 'bottler', 'age_statement',
      'cask_type', 'mash_bill', 'flavor_profile'
    ];
    
    for (const field of fields) {
      if (!merged[field] && secondary[field]) {
        merged[field] = secondary[field];
      }
    }
    
    // Special handling for description - prefer longer
    if (secondary.description && (!merged.description || 
        secondary.description.length > merged.description.length)) {
      merged.description = secondary.description;
    }
    
    return merged;
  }

  /**
   * Get statistics about fuzzy matches
   */
  getStatistics(candidates: FuzzyMatchCandidate[]): {
    total: number;
    byAction: Record<string, number>;
    byConfidence: Record<string, number>;
    avgSimilarity: number;
    avgTFIDFScore: number;
    avgFuzzyScore: number;
  } {
    const byAction: Record<string, number> = {};
    const byConfidence: Record<string, number> = {};
    
    let totalSimilarity = 0;
    let totalTFIDF = 0;
    let totalFuzzy = 0;
    
    for (const candidate of candidates) {
      byAction[candidate.recommendedAction] = (byAction[candidate.recommendedAction] || 0) + 1;
      byConfidence[candidate.confidence] = (byConfidence[candidate.confidence] || 0) + 1;
      
      totalSimilarity += candidate.similarity;
      totalTFIDF += candidate.tfidfScore;
      totalFuzzy += candidate.fuzzyScore;
    }
    
    return {
      total: candidates.length,
      byAction,
      byConfidence,
      avgSimilarity: candidates.length > 0 ? totalSimilarity / candidates.length : 0,
      avgTFIDFScore: candidates.length > 0 ? totalTFIDF / candidates.length : 0,
      avgFuzzyScore: candidates.length > 0 ? totalFuzzy / candidates.length : 0
    };
  }
}

// Export singleton getter
export const getFuzzyMatchDeduplication = () => {
  return new FuzzyMatchDeduplicationService();
};