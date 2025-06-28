/**
 * Duplicate Detector for V3.1.3
 * 
 * Pre-storage duplicate detection to prevent duplicates
 * from entering the database in the first place
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: number;
  existingId?: string;
  existingName?: string;
  reason?: string;
}

export interface SpiritData {
  name: string;
  brand?: string;
  category?: string;
  price?: number | string;
  volume?: string;
  abv?: number;
  description?: string;
}

export class DuplicateDetector {
  private supabase: any;
  
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  /**
   * Check if a spirit is a duplicate before storage
   */
  async checkDuplicate(spirit: SpiritData): Promise<DuplicateCheckResult> {
    try {
      // Strategy 1: Exact name match (case insensitive)
      const exactMatch = await this.checkExactMatch(spirit);
      if (exactMatch.isDuplicate) {
        return exactMatch;
      }
      
      // Strategy 2: Fuzzy match with same brand
      const fuzzyMatch = await this.checkFuzzyMatch(spirit);
      if (fuzzyMatch.isDuplicate) {
        return fuzzyMatch;
      }
      
      // Strategy 3: Similar name + same volume + close price
      const similarMatch = await this.checkSimilarProduct(spirit);
      if (similarMatch.isDuplicate) {
        return similarMatch;
      }
      
      return {
        isDuplicate: false,
        confidence: 0
      };
    } catch (error) {
      logger.error('Error checking duplicate:', error);
      // Don't block on error - let it through
      return {
        isDuplicate: false,
        confidence: 0
      };
    }
  }
  
  /**
   * Check for exact name match
   */
  private async checkExactMatch(spirit: SpiritData): Promise<DuplicateCheckResult> {
    const { data, error } = await this.supabase
      .from('spirits')
      .select('id, name, brand')
      .ilike('name', spirit.name)
      .limit(1);
    
    if (error) {
      logger.error('Error in exact match check:', error);
      return { isDuplicate: false, confidence: 0 };
    }
    
    if (data && data.length > 0) {
      // If brand also matches, very high confidence
      const brandMatch = spirit.brand && 
        data[0].brand && 
        data[0].brand.toLowerCase() === spirit.brand.toLowerCase();
      
      return {
        isDuplicate: true,
        confidence: brandMatch ? 0.95 : 0.85,
        existingId: data[0].id,
        existingName: data[0].name,
        reason: 'exact_name_match'
      };
    }
    
    return { isDuplicate: false, confidence: 0 };
  }
  
  /**
   * Check for fuzzy match with same brand
   */
  private async checkFuzzyMatch(spirit: SpiritData): Promise<DuplicateCheckResult> {
    if (!spirit.brand) {
      return { isDuplicate: false, confidence: 0 };
    }
    
    // Get all products from same brand
    const { data, error } = await this.supabase
      .from('spirits')
      .select('id, name, brand, volume, price')
      .ilike('brand', spirit.brand)
      .limit(50);
    
    if (error || !data) {
      return { isDuplicate: false, confidence: 0 };
    }
    
    // Check each one for similarity
    for (const existing of data) {
      const similarity = this.calculateSimilarity(spirit.name, existing.name);
      
      // High similarity threshold for same brand
      if (similarity > 0.85) {
        // Additional checks for confidence
        let confidence = similarity;
        
        // Volume match increases confidence
        if (spirit.volume && existing.volume && 
            spirit.volume === existing.volume) {
          confidence += 0.05;
        }
        
        // Price similarity increases confidence
        if (spirit.price && existing.price) {
          const priceDiff = Math.abs(
            this.normalizePrice(spirit.price) - 
            this.normalizePrice(existing.price)
          );
          if (priceDiff < 5) {
            confidence += 0.05;
          }
        }
        
        return {
          isDuplicate: true,
          confidence: Math.min(0.95, confidence),
          existingId: existing.id,
          existingName: existing.name,
          reason: 'fuzzy_match_same_brand'
        };
      }
    }
    
    return { isDuplicate: false, confidence: 0 };
  }
  
  /**
   * Check for similar product (different brand but same product)
   */
  private async checkSimilarProduct(spirit: SpiritData): Promise<DuplicateCheckResult> {
    // Extract key product identifiers
    const tokens = this.extractProductTokens(spirit.name);
    
    if (tokens.length < 2) {
      return { isDuplicate: false, confidence: 0 };
    }
    
    // Build search query
    let query = this.supabase
      .from('spirits')
      .select('id, name, brand, volume, price, category');
    
    // Add token filters
    for (const token of tokens.slice(0, 3)) { // Limit to 3 key tokens
      query = query.ilike('name', `%${token}%`);
    }
    
    const { data, error } = await query.limit(20);
    
    if (error || !data) {
      return { isDuplicate: false, confidence: 0 };
    }
    
    // Check each candidate
    for (const existing of data) {
      // Skip if same brand (already checked)
      if (spirit.brand && existing.brand && 
          spirit.brand.toLowerCase() === existing.brand.toLowerCase()) {
        continue;
      }
      
      const similarity = this.calculateSimilarity(spirit.name, existing.name);
      
      // For different brands, need very high similarity
      if (similarity > 0.9) {
        // Must have matching category
        if (spirit.category && existing.category && 
            spirit.category !== existing.category) {
          continue;
        }
        
        // Must have similar volume
        if (spirit.volume && existing.volume && 
            spirit.volume !== existing.volume) {
          continue;
        }
        
        return {
          isDuplicate: true,
          confidence: similarity * 0.8, // Lower confidence for cross-brand
          existingId: existing.id,
          existingName: existing.name,
          reason: 'similar_product_different_brand'
        };
      }
    }
    
    return { isDuplicate: false, confidence: 0 };
  }
  
  /**
   * Calculate string similarity (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    // Exact match
    if (s1 === s2) return 1;
    
    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    // Convert to similarity score
    return 1 - (distance / maxLength);
  }
  
  /**
   * Calculate Levenshtein distance between strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * Extract key product tokens for matching
   */
  private extractProductTokens(name: string): string[] {
    // Remove common words and extract key identifiers
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
      'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about'
    ]);
    
    const tokens = name
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => 
        token.length > 2 && 
        !stopWords.has(token) &&
        !/^\d+$/.test(token) // Not just numbers
      );
    
    // Prioritize specific tokens
    const priorityTokens = tokens.filter(token =>
      /year|aged?|single|barrel|batch|reserve|limited|edition|vintage|cask/i.test(token)
    );
    
    return [...new Set([...priorityTokens, ...tokens])];
  }
  
  /**
   * Normalize price for comparison
   */
  private normalizePrice(price: string | number): number {
    if (typeof price === 'number') return price;
    
    const cleaned = price.toString().replace(/[$,]/g, '');
    return parseFloat(cleaned) || 0;
  }
  
  /**
   * Batch check multiple spirits for duplicates
   */
  async checkBatch(spirits: SpiritData[]): Promise<Map<number, DuplicateCheckResult>> {
    const results = new Map<number, DuplicateCheckResult>();
    
    // Check each spirit
    for (let i = 0; i < spirits.length; i++) {
      const result = await this.checkDuplicate(spirits[i]);
      results.set(i, result);
      
      // Add small delay to avoid rate limiting
      if (i > 0 && i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const duplicateDetector = new DuplicateDetector();