/**
 * Price Variation Handler
 * 
 * Handles cases where the same product has different prices from different retailers.
 * Groups by normalized product name and tracks price variations.
 */

import { DatabaseSpirit } from '../types/index.js';
import { createNormalizedKey } from './normalization-keys.js';
import { logger } from '../utils/logger.js';

export interface PriceVariation {
  min: number;
  max: number;
  average: number;
  median: number;
  count: number;
  prices: Array<{
    price: number;
    source: string;
    date: Date;
  }>;
  standardDeviation: number;
  coefficientOfVariation: number; // Measure of price consistency
}

export interface PriceVariationGroup {
  normalizedKey: string;
  spirits: DatabaseSpirit[];
  primarySpirit: DatabaseSpirit;
  priceVariation: PriceVariation;
  suggestedAction: 'use_average' | 'use_median' | 'flag_for_review' | 'likely_different_products';
}

export interface PriceVariationConfig {
  // Maximum coefficient of variation to consider prices from same product
  maxCoefficientOfVariation: number;
  // Minimum number of prices to calculate statistics
  minPricesForStats: number;
  // Price outlier threshold (as percentage of median)
  outlierThreshold: number;
  // Whether to exclude outliers from calculations
  excludeOutliers: boolean;
}

const DEFAULT_CONFIG: PriceVariationConfig = {
  maxCoefficientOfVariation: 0.5, // 50% variation is reasonable for spirits
  minPricesForStats: 2,
  outlierThreshold: 2.0, // Prices 2x median are outliers
  excludeOutliers: true
};

/**
 * Price Variation Handler Service
 */
export class PriceVariationHandler {
  private config: PriceVariationConfig;

  constructor(config?: Partial<PriceVariationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Analyze price variations for groups of similar spirits
   */
  analyzeByGroups(spirits: DatabaseSpirit[]): PriceVariationGroup[] {
    // Group spirits by normalized key
    const groups = this.groupByNormalizedKey(spirits);
    
    // Analyze each group
    const results: PriceVariationGroup[] = [];
    
    for (const [key, groupSpirits] of groups.entries()) {
      const priceData = this.extractPrices(groupSpirits);
      
      if (priceData.length === 0) {
        logger.warn(`No prices found for group: ${key}`);
        continue;
      }
      
      const variation = this.calculatePriceVariation(priceData);
      const primarySpirit = this.selectPrimarySpirit(groupSpirits, variation);
      const suggestedAction = this.suggestAction(variation);
      
      results.push({
        normalizedKey: key,
        spirits: groupSpirits,
        primarySpirit,
        priceVariation: variation,
        suggestedAction
      });
    }
    
    return results;
  }

  /**
   * Group spirits by normalized key
   */
  private groupByNormalizedKey(spirits: DatabaseSpirit[]): Map<string, DatabaseSpirit[]> {
    const groups = new Map<string, DatabaseSpirit[]>();
    
    for (const spirit of spirits) {
      const key = createNormalizedKey(spirit.name, {
        removeSize: true,
        removeYear: true,
        // Keep proof as it affects price
        removeMarketingText: true,
        normalizeSpacing: true,
        lowercaseNormalize: true
      });
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(spirit);
    }
    
    return groups;
  }

  /**
   * Extract price data from spirits
   */
  private extractPrices(spirits: DatabaseSpirit[]): Array<{ price: number; source: string; date: Date }> {
    const prices: Array<{ price: number; source: string; date: Date }> = [];
    
    for (const spirit of spirits) {
      if (spirit.price && typeof spirit.price === 'number' && spirit.price > 0) {
        prices.push({
          price: spirit.price,
          source: spirit.source_url || 'unknown',
          date: new Date(spirit.created_at || Date.now())
        });
      }
    }
    
    return prices;
  }

  /**
   * Calculate price variation statistics
   */
  private calculatePriceVariation(priceData: Array<{ price: number; source: string; date: Date }>): PriceVariation {
    let prices = priceData.map(p => p.price);
    
    // Remove outliers if configured
    if (this.config.excludeOutliers && prices.length >= this.config.minPricesForStats) {
      prices = this.removeOutliers(prices);
    }
    
    // Sort prices for median calculation
    const sortedPrices = [...prices].sort((a, b) => a - b);
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const median = this.calculateMedian(sortedPrices);
    
    // Calculate standard deviation
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / prices.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Coefficient of variation (relative standard deviation)
    const coefficientOfVariation = average > 0 ? standardDeviation / average : 0;
    
    return {
      min,
      max,
      average,
      median,
      count: prices.length,
      prices: priceData,
      standardDeviation,
      coefficientOfVariation
    };
  }

  /**
   * Remove price outliers
   */
  private removeOutliers(prices: number[]): number[] {
    const median = this.calculateMedian([...prices].sort((a, b) => a - b));
    
    return prices.filter(price => {
      const ratio = price / median;
      return ratio <= this.config.outlierThreshold && ratio >= (1 / this.config.outlierThreshold);
    });
  }

  /**
   * Calculate median price
   */
  private calculateMedian(sortedPrices: number[]): number {
    const mid = Math.floor(sortedPrices.length / 2);
    
    if (sortedPrices.length % 2 === 0) {
      return (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;
    } else {
      return sortedPrices[mid];
    }
  }

  /**
   * Select primary spirit based on price variation
   */
  private selectPrimarySpirit(spirits: DatabaseSpirit[], variation: PriceVariation): DatabaseSpirit {
    // Sort by how close the price is to median, then by data completeness
    const spiritsWithScore = spirits.map(spirit => {
      let score = 0;
      
      // Price proximity to median (40% weight)
      if (spirit.price && variation.median > 0) {
        const priceRatio = Math.abs(spirit.price - variation.median) / variation.median;
        score += (1 - Math.min(priceRatio, 1)) * 0.4;
      }
      
      // Data completeness (60% weight)
      if (spirit.brand) score += 0.1;
      if (spirit.description) score += 0.1;
      if (spirit.image_url) score += 0.1;
      if (spirit.abv) score += 0.1;
      if (spirit.volume) score += 0.1;
      if (spirit.origin_country) score += 0.1;
      
      return { spirit, score };
    });
    
    // Sort by score descending
    spiritsWithScore.sort((a, b) => b.score - a.score);
    
    return spiritsWithScore[0].spirit;
  }

  /**
   * Suggest action based on price variation
   */
  private suggestAction(variation: PriceVariation): PriceVariationGroup['suggestedAction'] {
    // If very high variation, likely different products
    if (variation.coefficientOfVariation > this.config.maxCoefficientOfVariation) {
      return 'likely_different_products';
    }
    
    // If only 2 prices and they're very different, flag for review
    if (variation.count === 2 && variation.coefficientOfVariation > 0.3) {
      return 'flag_for_review';
    }
    
    // If low variation, use average
    if (variation.coefficientOfVariation < 0.1) {
      return 'use_average';
    }
    
    // Default to median for moderate variation
    return 'use_median';
  }

  /**
   * Apply price strategy to spirits
   */
  applyPriceStrategy(group: PriceVariationGroup): DatabaseSpirit {
    const primarySpirit = { ...group.primarySpirit };
    
    switch (group.suggestedAction) {
      case 'use_average':
        primarySpirit.price = Math.round(group.priceVariation.average * 100) / 100;
        break;
        
      case 'use_median':
        primarySpirit.price = group.priceVariation.median;
        break;
        
      case 'flag_for_review':
        // Keep original price but add metadata
        primarySpirit.metadata = {
          ...primarySpirit.metadata,
          price_variation_flagged: true,
          price_range: `${group.priceVariation.min}-${group.priceVariation.max}`,
          price_sources: group.priceVariation.count
        };
        break;
        
      case 'likely_different_products':
        // Don't merge, keep separate
        break;
    }
    
    // Always store price range metadata
    primarySpirit.metadata = {
      ...primarySpirit.metadata,
      price_min: group.priceVariation.min,
      price_max: group.priceVariation.max,
      price_sources: group.priceVariation.count,
      price_coefficient_variation: group.priceVariation.coefficientOfVariation
    };
    
    return primarySpirit;
  }

  /**
   * Get price analysis summary
   */
  getPriceSummary(groups: PriceVariationGroup[]): {
    totalGroups: number;
    highVariationGroups: number;
    averageCoefficientOfVariation: number;
    suggestedActions: Record<string, number>;
  } {
    const suggestedActions: Record<string, number> = {
      use_average: 0,
      use_median: 0,
      flag_for_review: 0,
      likely_different_products: 0
    };
    
    let totalCV = 0;
    let highVariationCount = 0;
    
    for (const group of groups) {
      suggestedActions[group.suggestedAction]++;
      totalCV += group.priceVariation.coefficientOfVariation;
      
      if (group.priceVariation.coefficientOfVariation > this.config.maxCoefficientOfVariation) {
        highVariationCount++;
      }
    }
    
    return {
      totalGroups: groups.length,
      highVariationGroups: highVariationCount,
      averageCoefficientOfVariation: groups.length > 0 ? totalCV / groups.length : 0,
      suggestedActions
    };
  }
}