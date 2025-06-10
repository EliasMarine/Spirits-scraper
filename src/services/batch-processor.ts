import pLimit from 'p-limit';
import { spiritExtractor } from './spirit-extractor.js';
import { supabaseStorage } from './supabase-storage.js';
import { queryGenerator } from './query-generator.js';
import { config } from '../config/index.js';
import { loggers } from '../utils/logger.js';
import { BatchResult, SpiritData, SpiritSearchItem } from '../types/index.js';
import { cacheService } from './cache-service.js';

export interface BatchOptions {
  concurrency?: number;
  saveProgress?: boolean;
  progressCallback?: (progress: BatchProgress) => void;
}

export interface BatchProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  duplicates: number;
  currentItem?: string;
  estimatedTimeRemaining?: number;
}

export class BatchProcessor {
  private limit: ReturnType<typeof pLimit>;
  private concurrency: number;
  private startTime: number = 0;
  private progress: BatchProgress = {
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    duplicates: 0,
  };

  constructor(private options: BatchOptions = {}) {
    // Limit to 50 requests per minute to stay under 100/min quota
    this.concurrency = Math.min(options.concurrency || config.batchSize, 5);
    this.limit = pLimit(this.concurrency);
  }

  /**
   * Process a batch of spirit searches
   */
  async processBatch(items: SpiritSearchItem[]): Promise<BatchResult> {
    this.startTime = Date.now();
    this.progress = {
      total: items.length,
      completed: 0,
      successful: 0,
      failed: 0,
      duplicates: 0,
    };

    loggers.scrapeStart(`Batch processing ${items.length} spirits`, {
      concurrency: this.concurrency,
    });

    const results: SpiritData[] = [];
    const errors: Array<{ query: string; error: string }> = [];

    // Process items with concurrency limit
    const promises = items.map(item =>
      this.limit(async () => {
        try {
          this.progress.currentItem = `${item.brand || ''} ${item.name}`.trim();
          
          // Initialize cache service
          await cacheService.initialize();
          
          // Check if we've failed to process this item before
          const failedBefore = await cacheService.isFailedAttempt(`${item.brand || ''}_${item.name}`);
          if (failedBefore) {
            loggers.scrapeError(item.name, new Error('Previously failed - skipping to save API calls'));
            this.progress.failed++;
            errors.push({
              query: item.name,
              error: 'Previously failed - skipping to save API calls',
            });
            return;
          }

          // Extract spirit data
          loggers.scrapeStart(`Processing: ${this.progress.currentItem}`, {});
          const extracted = await spiritExtractor.extractSpirit(
            item.name,
            item.brand,
            {
              maxResults: 20,
              includeRetailers: true,
              includeReviews: true,
              deepParse: false, // Avoid deep parsing in batch mode
            },
          );

          // Add any metadata
          if (item.metadata) {
            Object.assign(extracted, item.metadata);
          }

          // Validate that this is a real spirit name, not a search query
          if (this.looksLikeSearchQuery(extracted.name)) {
            throw new Error(`Invalid spirit name detected: "${extracted.name}" appears to be a search query, not a spirit name`);
          }

          // Store in database
          const storeResult = await supabaseStorage.storeSpirit(extracted);

          if (storeResult.success) {
            results.push(extracted as SpiritData);
            this.progress.successful++;
            loggers.storageSuccess(item.name, storeResult.id!);
            
            // Log key data points for quality monitoring (only if not quiet)
            if (process.env.LOG_LEVEL !== 'warn' && process.env.LOG_LEVEL !== 'error') {
              console.log(`  📊 Data Quality:`);
              console.log(`     - Type: ${extracted.type || 'Unknown'}`);
              console.log(`     - ABV: ${extracted.abv ? `${extracted.abv}%` : 'Missing'}`);
              console.log(`     - Price: ${extracted.price ? `$${extracted.price}` : extracted.price_range || 'Missing'}`);
              console.log(`     - Description: ${extracted.description ? `${extracted.description.substring(0, 50)}...` : 'Missing'}`);
              console.log(`     - Image: ${extracted.image_url ? '✅' : '❌'}`);
            }
          } else if (storeResult.isDuplicate) {
            this.progress.duplicates++;
            loggers.storageDuplicate(item.name, storeResult.id || 'unknown');
          } else {
            throw new Error(storeResult.error || 'Unknown storage error');
          }
        } catch (error) {
          const errorMessage = String(error);
          errors.push({
            query: `${item.brand || ''} ${item.name}`.trim(),
            error: errorMessage,
          });
          this.progress.failed++;
          
          // Mark this item as failed in cache to avoid retrying
          await cacheService.markFailedAttempt(`${item.brand || ''}_${item.name}`, errorMessage);
          
          loggers.scrapeError(item.name, error);
        } finally {
          this.progress.completed++;
          this.updateProgress();
          
          // Add 1 second delay between requests to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }),
    );

    await Promise.all(promises);

    const duration = Date.now() - this.startTime;
    const successRate = (this.progress.successful / this.progress.total) * 100;

    loggers.batchProgress(
      this.progress.completed,
      this.progress.total,
      successRate,
    );

    return {
      successful: results,
      failed: errors,
      totalProcessed: items.length,
      duration,
    };
  }

  /**
   * Process spirits by category
   */
  async processByCategory(category: string, limit: number = 50): Promise<BatchResult> {
    const queries = queryGenerator.generateCategoryQueries(category);
    const spirits: SpiritSearchItem[] = [];

    // Search for spirits in this category
    for (const query of queries.slice(0, 5)) { // Limit queries per category
      try {
        const searchResults = await spiritExtractor.extractSpirit(
          query,
          undefined,
          { maxResults: 10 },
        );

        // Parse results to find individual spirits
        if (searchResults.description) {
          const spiritNames = this.extractSpiritNamesFromText(searchResults.description);
          spirits.push(...spiritNames.slice(0, limit));
        }
      } catch (error) {
        loggers.scrapeError(query, error);
      }
    }

    return this.processBatch(spirits.slice(0, limit));
  }

  /**
   * Process spirits that need enrichment
   */
  async processEnrichment(limit: number = 50): Promise<BatchResult> {
    const needsEnrichment = await supabaseStorage.getSpiritsNeedingEnrichment(limit);

    const items: SpiritSearchItem[] = needsEnrichment.map(spirit => ({
      name: spirit.name,
      brand: spirit.brand,
      metadata: { id: spirit.id }, // Include ID for updating
    }));

    loggers.scrapeStart(`Enriching ${items.length} spirits with missing data`, {});

    return this.processBatch(items);
  }

  /**
   * Process initial seed data
   */
  async processSeedData(): Promise<BatchResult> {
    const queries = queryGenerator.generateSeedQueries();
    const allResults: BatchResult = {
      successful: [],
      failed: [],
      totalProcessed: 0,
      duration: 0,
    };

    // Process seed queries in smaller batches
    const queryBatches = this.chunkArray(queries, 10);

    for (const batch of queryBatches) {
      const items: SpiritSearchItem[] = batch.map(query => ({
        name: query,
        metadata: { isSeeded: true },
      }));

      const batchResult = await this.processBatch(items);

      allResults.successful.push(...batchResult.successful);
      allResults.failed.push(...batchResult.failed);
      allResults.totalProcessed += batchResult.totalProcessed;
      allResults.duration += batchResult.duration;

      // Add delay between batches to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    return allResults;
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress(): void {
    // Calculate estimated time remaining
    const elapsed = Date.now() - this.startTime;
    const itemsPerMs = this.progress.completed / elapsed;
    const remaining = this.progress.total - this.progress.completed;
    this.progress.estimatedTimeRemaining = remaining / itemsPerMs;

    // Notify callback if provided
    if (this.options.progressCallback) {
      this.options.progressCallback({ ...this.progress });
    }

    // Log progress every 10 items
    if (this.progress.completed % 10 === 0) {
      const successRate = (this.progress.successful / this.progress.completed) * 100;
      loggers.batchProgress(
        this.progress.completed,
        this.progress.total,
        successRate,
      );
    }
  }

  /**
   * Extract spirit names from text
   */
  private extractSpiritNamesFromText(text: string): SpiritSearchItem[] {
    const spirits: SpiritSearchItem[] = [];

    // Common patterns for spirit names
    const patterns = [
      /([A-Z][a-zA-Z\s&']+)\s+(\d+\s*Year|XO|VS|VSOP|Single Malt|Bourbon|Vodka|Gin|Rum)/g,
      /([A-Z][a-zA-Z\s&']+)\s+(Whiskey|Whisky|Tequila|Mezcal|Cognac|Brandy)/g,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const name = match[1].trim();
        if (name.length > 3 && name.length < 50) {
          spirits.push({ name });
        }
      }
    }

    // Remove duplicates
    const unique = spirits.filter((spirit, index, self) =>
      index === self.findIndex(s => s.name === spirit.name),
    );

    return unique;
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get current progress
   */
  getProgress(): BatchProgress {
    return { ...this.progress };
  }

  /**
   * Check if a string looks like a search query rather than a spirit name
   */
  private looksLikeSearchQuery(name: string | undefined): boolean {
    if (!name) return false;
    
    const queryPatterns = [
      /^(budget|premium|best|top|cheap|expensive|affordable|rare|quality|smooth|craft)\s+/i,
      /^(good|great|nice|bad|worst|overrated|underrated)\s+/i,
      /^(find|search|looking for|where to buy|how to)\s+/i,
      /^(types of|kinds of|list of|collection of)\s+/i,
      /\s+(under|over|below|above)\s+\$\d+/i,
      /^wheated bourbon whiskey$/i,
      /^single malt scotch$/i,
      /^blended scotch whisky$/i,
      /^premium vodka$/i,
      /^craft gin$/i,
    ];

    // Check if it matches any query pattern
    if (queryPatterns.some(pattern => pattern.test(name))) {
      return true;
    }

    // Check if it's just a category name without a brand
    const genericCategories = ['bourbon', 'whiskey', 'whisky', 'vodka', 'gin', 'rum', 'tequila', 'scotch'];
    const nameLower = name.toLowerCase().trim();
    if (genericCategories.includes(nameLower)) {
      return true;
    }

    return false;
  }
}

// Export singleton for common use cases
export const batchProcessor = new BatchProcessor();