/**
 * Automatic Deduplication Service
 * 
 * Handles automatic deduplication after scraping sessions
 */

import { DeduplicationService } from './deduplication-service.js';
import { AutoDeduplicationConfig, loadAutoDeduplicationConfig } from '../config/auto-dedup-config.js';
import { logger } from '../utils/logger.js';

export interface AutoDeduplicationResult {
  ran: boolean;
  startTime: Date;
  endTime: Date;
  duration: number;
  spiritsProcessed: number;
  exactMatchResults?: {
    groupsFound: number;
    merged: number;
  };
  fuzzyMatchResults?: {
    candidatesFound: number;
    merged: number;
    flagged: number;
  };
  totalDuplicatesFound: number;
  totalMerged: number;
  errors: string[];
}

/**
 * Automatic Deduplication Service
 */
export class AutoDeduplicationService {
  private config: AutoDeduplicationConfig;
  private deduplicationService: DeduplicationService;

  constructor(config?: AutoDeduplicationConfig) {
    this.config = config || loadAutoDeduplicationConfig();
    this.deduplicationService = new DeduplicationService();
  }

  /**
   * Run automatic deduplication if conditions are met
   */
  async runIfNeeded(
    spiritsScraped: number,
    options?: {
      forceRun?: boolean;
      dryRun?: boolean;
      config?: Partial<AutoDeduplicationConfig>;
    }
  ): Promise<AutoDeduplicationResult> {
    const startTime = new Date();
    const result: AutoDeduplicationResult = {
      ran: false,
      startTime,
      endTime: new Date(),
      duration: 0,
      spiritsProcessed: 0,
      totalDuplicatesFound: 0,
      totalMerged: 0,
      errors: []
    };

    // Merge config with options
    const config = { ...this.config, ...options?.config };

    // Check if should run
    if (!options?.forceRun) {
      if (!config.enabled) {
        logger.info('Auto-deduplication is disabled');
        return result;
      }

      if (spiritsScraped < config.minSpiritsThreshold) {
        logger.info(
          `Skipping auto-deduplication: ${spiritsScraped} spirits < ${config.minSpiritsThreshold} threshold`
        );
        return result;
      }
    }

    // Run deduplication
    try {
      logger.info('Starting automatic deduplication', {
        spiritsScraped,
        config: {
          exactMatch: config.runExactMatch,
          fuzzyMatch: config.runFuzzyMatch,
          autoMerge: config.autoMerge
        }
      });

      result.ran = true;
      result.spiritsProcessed = spiritsScraped;

      // Determine if fuzzy matching should run based on count
      const runFuzzy = config.runFuzzyMatch && 
        spiritsScraped <= config.performance.fuzzyMatchLimit;

      if (!runFuzzy && config.runFuzzyMatch) {
        logger.warn(
          `Skipping fuzzy matching: ${spiritsScraped} spirits > ${config.performance.fuzzyMatchLimit} limit`
        );
      }

      // Run comprehensive deduplication
      const dedupResult = await this.deduplicationService.runComprehensiveDeduplication({
        dryRun: options?.dryRun || !config.autoMerge,
        runExactMatch: config.runExactMatch,
        runFuzzyMatch: runFuzzy,
        customConfig: {
          combinedThreshold: config.thresholds.sameBrand,
          autoMergeThreshold: config.thresholds.autoMergeConfidence,
          sameBrandWeight: 0.15,  // Lower weight for same brand
          differentBrandWeight: 0.4, // Higher weight for different brands
        }
      });

      // Extract results
      if (dedupResult.exactMatchResults) {
        result.exactMatchResults = {
          groupsFound: dedupResult.exactMatchResults.stats.totalGroups,
          merged: dedupResult.exactMatchResults.mergeResults.merged
        };
      }

      if (dedupResult.fuzzyMatchResults) {
        result.fuzzyMatchResults = {
          candidatesFound: dedupResult.fuzzyMatchResults.duplicatesFound,
          merged: dedupResult.fuzzyMatchResults.autoMerged,
          flagged: dedupResult.fuzzyMatchResults.flaggedForReview
        };
      }

      result.totalDuplicatesFound = dedupResult.totalDuplicatesFound;
      result.totalMerged = dedupResult.totalMerged;

    } catch (error) {
      logger.error('Auto-deduplication failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    // Calculate duration
    result.endTime = new Date();
    result.duration = result.endTime.getTime() - result.startTime.getTime();

    // Log results if configured
    if (config.notifications.showSummary) {
      this.logSummary(result);
    }

    return result;
  }

  /**
   * Log summary of auto-deduplication results
   */
  private logSummary(result: AutoDeduplicationResult): void {
    if (!result.ran) return;

    console.log('\n📊 Auto-Deduplication Summary');
    console.log('─'.repeat(40));
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`Spirits processed: ${result.spiritsProcessed}`);

    if (result.exactMatchResults) {
      console.log('\n🎯 Exact Matches:');
      console.log(`  Groups found: ${result.exactMatchResults.groupsFound}`);
      console.log(`  Merged: ${result.exactMatchResults.merged}`);
    }

    if (result.fuzzyMatchResults) {
      console.log('\n🔍 Fuzzy Matches:');
      console.log(`  Candidates: ${result.fuzzyMatchResults.candidatesFound}`);
      console.log(`  Merged: ${result.fuzzyMatchResults.merged}`);
      console.log(`  Flagged: ${result.fuzzyMatchResults.flagged}`);
    }

    console.log('\n✨ Total Results:');
    console.log(`  Duplicates found: ${result.totalDuplicatesFound}`);
    console.log(`  Spirits merged: ${result.totalMerged}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoDeduplicationConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AutoDeduplicationConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Export singleton instance
export const autoDeduplicationService = new AutoDeduplicationService();