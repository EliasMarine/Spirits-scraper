/**
 * Blocking Deduplication Service
 * 
 * Implements blocking techniques to optimize deduplication for large datasets
 * by reducing the comparison space through intelligent grouping.
 */

import { DatabaseSpirit } from '../types/index.js';
import { logger } from '../utils/logger.js';

export interface BlockingKey {
  key: string;
  type: 'brand' | 'type' | 'prefix' | 'soundex' | 'ngramFingerprint' | 'sizeVariant' | 'marketingText' | 'yearVariant' | 'proofNotation' | 'typeCompatible';
  confidence: number;
}

export interface SpiritBlock {
  blockKey: BlockingKey;
  spirits: DatabaseSpirit[];
  size: number;
}

export interface PerformanceMetrics {
  totalProcessingTime: number;
  blockingTime: number;
  memoryUsageMB: number;
  spiritsProcessed: number;
  blocksCreated: number;
  comparisonsAvoidedPercentage: number;
  throughputSpiritsPerSecond: number;
  memoryEfficiency: number;
  blockingPassTimes: { [pass: string]: number };
}

export interface BlockingResult {
  blocks: Map<string, SpiritBlock>;
  metrics: PerformanceMetrics;
  memoryOptimized: boolean;
  usedProgressiveBlocking: boolean;
}

export interface BlockingConfig {
  // Maximum spirits per block before splitting
  maxBlockSize: number;
  // Minimum block size to process (skip single-item blocks)
  minBlockSize: number;
  // Enable multi-pass blocking for higher recall
  enableMultiPass: boolean;
  // Enable soundex blocking for phonetic matching
  enableSoundex: boolean;
  // Enable n-gram fingerprinting
  enableNGramFingerprint: boolean;
  // N-gram size for fingerprinting
  ngramSize: number;
  // Memory optimization: process blocks in batches
  batchSize: number;
  // Enable special case handling for common duplication patterns
  enableSpecialCaseHandling: boolean;
  // Performance optimization settings
  enablePerformanceMonitoring: boolean;
  // Memory limit in MB before switching to streaming mode
  memoryLimitMB: number;
  // Enable progressive blocking for very large datasets
  enableProgressiveBlocking: boolean;
  // Chunk size for progressive processing
  progressiveChunkSize: number;
}

const DEFAULT_CONFIG: BlockingConfig = {
  maxBlockSize: 1000,
  minBlockSize: 2,
  enableMultiPass: true,
  enableSoundex: true,
  enableNGramFingerprint: true,
  ngramSize: 3,
  batchSize: 5,
  enableSpecialCaseHandling: true,
  enablePerformanceMonitoring: true,
  memoryLimitMB: 512, // 512MB memory limit
  enableProgressiveBlocking: true,
  progressiveChunkSize: 10000 // Process 10K spirits at a time for large datasets
};

/**
 * Blocking Deduplication Service
 * 
 * Optimizes deduplication by grouping spirits into blocks that are likely
 * to contain duplicates, dramatically reducing the number of comparisons needed.
 */
export class BlockingDeduplicationService {
  private config: BlockingConfig;
  private performanceMetrics: Partial<PerformanceMetrics> = {};

  constructor(config?: Partial<BlockingConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current memory usage in MB
   */
  private getMemoryUsageMB(): number {
    const memUsage = process.memoryUsage();
    return Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100;
  }

  /**
   * Check if we should use progressive blocking based on dataset size and memory
   */
  private shouldUseProgressiveBlocking(spiritCount: number): boolean {
    const estimatedMemoryMB = (spiritCount * 2) / 1024; // Rough estimate: 2KB per spirit
    return this.config.enableProgressiveBlocking && 
           (spiritCount > this.config.progressiveChunkSize || 
            estimatedMemoryMB > this.config.memoryLimitMB);
  }

  /**
   * Create blocks from spirits using multiple blocking strategies
   * Returns enhanced blocking result with performance metrics
   */
  createBlocks(spirits: DatabaseSpirit[]): Map<string, SpiritBlock> {
    const result = this.createBlocksWithMetrics(spirits);
    return result.blocks;
  }

  /**
   * Create blocks with detailed performance metrics and optimization
   */
  createBlocksWithMetrics(spirits: DatabaseSpirit[]): BlockingResult {
    const overallStartTime = Date.now();
    const initialMemory = this.getMemoryUsageMB();
    
    logger.info(`Creating blocks for ${spirits.length} spirits`);
    
    // Check if we need progressive blocking for large datasets
    const useProgressiveBlocking = this.shouldUseProgressiveBlocking(spirits.length);
    
    if (useProgressiveBlocking) {
      return this.createBlocksProgressively(spirits, overallStartTime, initialMemory);
    } else {
      return this.createBlocksStandard(spirits, overallStartTime, initialMemory);
    }
  }

  /**
   * Standard blocking for smaller datasets
   */
  private createBlocksStandard(spirits: DatabaseSpirit[], startTime: number, initialMemory: number): BlockingResult {
    const blocks = new Map<string, SpiritBlock>();
    const passTimings: { [pass: string]: number } = {};
    
    // Pass 1: Brand-based blocking (highest precision)
    const brandStart = Date.now();
    this.createBrandBlocks(spirits, blocks);
    passTimings['brand'] = Date.now() - brandStart;
    
    // Pass 2: Type-based blocking
    const typeStart = Date.now();
    this.createTypeBlocks(spirits, blocks);
    passTimings['type'] = Date.now() - typeStart;
    
    // Pass 3: Prefix blocking
    const prefixStart = Date.now();
    this.createPrefixBlocks(spirits, blocks);
    passTimings['prefix'] = Date.now() - prefixStart;
    
    // Pass 4: Soundex blocking
    if (this.config.enableSoundex) {
      const soundexStart = Date.now();
      this.createSoundexBlocks(spirits, blocks);
      passTimings['soundex'] = Date.now() - soundexStart;
    }
    
    // Pass 5: N-gram fingerprint blocking
    if (this.config.enableNGramFingerprint) {
      const ngramStart = Date.now();
      this.createNGramBlocks(spirits, blocks);
      passTimings['ngram'] = Date.now() - ngramStart;
    }
    
    // Pass 6: Special case handling
    if (this.config.enableSpecialCaseHandling) {
      const specialStart = Date.now();
      this.createSizeVariantBlocks(spirits, blocks);
      this.createMarketingTextBlocks(spirits, blocks);
      this.createYearVariantBlocks(spirits, blocks);
      this.createProofNotationBlocks(spirits, blocks);
      this.createTypeCompatibleBlocks(spirits, blocks);
      passTimings['specialCases'] = Date.now() - specialStart;
    }

    return this.finalizeBlockingResult(spirits, blocks, startTime, initialMemory, passTimings, false);
  }

  /**
   * Progressive blocking for large datasets to optimize memory usage
   */
  private createBlocksProgressively(spirits: DatabaseSpirit[], startTime: number, initialMemory: number): BlockingResult {
    logger.info(`Using progressive blocking for ${spirits.length} spirits (chunks of ${this.config.progressiveChunkSize})`);
    
    const blocks = new Map<string, SpiritBlock>();
    const passTimings: { [pass: string]: number } = {};
    const totalPasses = Math.ceil(spirits.length / this.config.progressiveChunkSize);
    
    for (let i = 0; i < spirits.length; i += this.config.progressiveChunkSize) {
      const chunk = spirits.slice(i, i + this.config.progressiveChunkSize);
      const chunkNumber = Math.floor(i / this.config.progressiveChunkSize) + 1;
      
      logger.info(`Processing chunk ${chunkNumber}/${totalPasses} (${chunk.length} spirits)`);
      
      // Process this chunk with all blocking strategies
      const chunkResult = this.createBlocksStandard(chunk, Date.now(), this.getMemoryUsageMB());
      
      // Merge blocks from this chunk
      this.mergeBlocks(blocks, chunkResult.blocks);
      
      // Aggregate pass timings
      Object.entries(chunkResult.metrics.blockingPassTimes).forEach(([pass, time]) => {
        passTimings[pass] = (passTimings[pass] || 0) + time;
      });
      
      // Log memory usage to detect potential issues
      const currentMemory = this.getMemoryUsageMB();
      if (currentMemory > this.config.memoryLimitMB * 0.8) {
        logger.warn(`High memory usage detected: ${currentMemory}MB (limit: ${this.config.memoryLimitMB}MB)`);
      }
    }
    
    return this.finalizeBlockingResult(spirits, blocks, startTime, initialMemory, passTimings, true);
  }

  /**
   * Merge blocks from a chunk into the main blocks map
   */
  private mergeBlocks(mainBlocks: Map<string, SpiritBlock>, chunkBlocks: Map<string, SpiritBlock>): void {
    for (const [key, chunkBlock] of chunkBlocks.entries()) {
      if (mainBlocks.has(key)) {
        // Merge spirits into existing block
        const existingBlock = mainBlocks.get(key)!;
        existingBlock.spirits.push(...chunkBlock.spirits);
        existingBlock.size = existingBlock.spirits.length;
      } else {
        // Add new block
        mainBlocks.set(key, chunkBlock);
      }
    }
  }

  /**
   * Finalize blocking result with metrics
   */
  private finalizeBlockingResult(
    spirits: DatabaseSpirit[], 
    blocks: Map<string, SpiritBlock>, 
    startTime: number, 
    initialMemory: number,
    passTimings: { [pass: string]: number },
    usedProgressive: boolean
  ): BlockingResult {
    const totalTime = Date.now() - startTime;
    const finalMemory = this.getMemoryUsageMB();
    const reductionStats = this.calculateReduction(spirits.length, blocks);
    
    const metrics: PerformanceMetrics = {
      totalProcessingTime: totalTime,
      blockingTime: totalTime,
      memoryUsageMB: finalMemory,
      spiritsProcessed: spirits.length,
      blocksCreated: blocks.size,
      comparisonsAvoidedPercentage: reductionStats.reductionPercentage,
      throughputSpiritsPerSecond: spirits.length / (totalTime / 1000),
      memoryEfficiency: finalMemory - initialMemory,
      blockingPassTimes: passTimings
    };

    if (this.config.enablePerformanceMonitoring) {
      this.logPerformanceMetrics(metrics, usedProgressive);
    }

    return {
      blocks,
      metrics,
      memoryOptimized: finalMemory < this.config.memoryLimitMB,
      usedProgressiveBlocking: usedProgressive
    };
  }

  /**
   * Log detailed performance metrics
   */
  private logPerformanceMetrics(metrics: PerformanceMetrics, usedProgressive: boolean): void {
    logger.info('Blocking Performance Metrics:', {
      totalTime: `${metrics.totalProcessingTime}ms`,
      throughput: `${metrics.throughputSpiritsPerSecond.toFixed(2)} spirits/sec`,
      memoryUsed: `${metrics.memoryUsageMB}MB`,
      memoryEfficiency: `${metrics.memoryEfficiency > 0 ? '+' : ''}${metrics.memoryEfficiency}MB`,
      blocksCreated: metrics.blocksCreated,
      comparisonsAvoided: `${metrics.comparisonsAvoidedPercentage.toFixed(2)}%`,
      progressiveBlocking: usedProgressive,
      passBreakdown: metrics.blockingPassTimes
    });
  }

  /**
   * Create brand-based blocks
   */
  private createBrandBlocks(spirits: DatabaseSpirit[], blocks: Map<string, SpiritBlock>): void {
    const brandGroups = new Map<string, DatabaseSpirit[]>();
    
    for (const spirit of spirits) {
      if (!spirit.brand) continue;
      
      const normalizedBrand = this.normalizeBrand(spirit.brand);
      if (!brandGroups.has(normalizedBrand)) {
        brandGroups.set(normalizedBrand, []);
      }
      brandGroups.get(normalizedBrand)!.push(spirit);
    }
    
    // Create blocks from brand groups
    for (const [brand, brandSpirits] of brandGroups.entries()) {
      if (brandSpirits.length < this.config.minBlockSize) continue;
      
      // Split large blocks if needed
      if (brandSpirits.length > this.config.maxBlockSize) {
        this.splitLargeBlock(brand, brandSpirits, blocks, 'brand');
      } else {
        const blockKey: BlockingKey = {
          key: `brand:${brand}`,
          type: 'brand',
          confidence: 0.95
        };
        
        blocks.set(blockKey.key, {
          blockKey,
          spirits: brandSpirits,
          size: brandSpirits.length
        });
      }
    }
  }

  /**
   * Create type-based blocks
   */
  private createTypeBlocks(spirits: DatabaseSpirit[], blocks: Map<string, SpiritBlock>): void {
    const typeGroups = new Map<string, DatabaseSpirit[]>();
    
    for (const spirit of spirits) {
      const type = spirit.type || 'Unknown';
      if (!typeGroups.has(type)) {
        typeGroups.set(type, []);
      }
      typeGroups.get(type)!.push(spirit);
    }
    
    // Create blocks from type groups
    for (const [type, typeSpirits] of typeGroups.entries()) {
      if (typeSpirits.length < this.config.minBlockSize) continue;
      
      // Type blocks are usually large, so we create sub-blocks by brand
      const brandSubGroups = new Map<string, DatabaseSpirit[]>();
      for (const spirit of typeSpirits) {
        const brand = this.normalizeBrand(spirit.brand || 'Unknown');
        const subKey = `${type}:${brand}`;
        if (!brandSubGroups.has(subKey)) {
          brandSubGroups.set(subKey, []);
        }
        brandSubGroups.get(subKey)!.push(spirit);
      }
      
      // Create blocks from sub-groups
      for (const [subKey, subSpirits] of brandSubGroups.entries()) {
        if (subSpirits.length < this.config.minBlockSize) continue;
        
        const blockKey: BlockingKey = {
          key: `type:${subKey}`,
          type: 'type',
          confidence: 0.85
        };
        
        blocks.set(blockKey.key, {
          blockKey,
          spirits: subSpirits,
          size: subSpirits.length
        });
      }
    }
  }

  /**
   * Create prefix-based blocks
   */
  private createPrefixBlocks(spirits: DatabaseSpirit[], blocks: Map<string, SpiritBlock>): void {
    const prefixGroups = new Map<string, DatabaseSpirit[]>();
    
    for (const spirit of spirits) {
      const prefix = this.getNamePrefix(spirit.name);
      if (!prefix) continue;
      
      if (!prefixGroups.has(prefix)) {
        prefixGroups.set(prefix, []);
      }
      prefixGroups.get(prefix)!.push(spirit);
    }
    
    // Create blocks from prefix groups
    for (const [prefix, prefixSpirits] of prefixGroups.entries()) {
      if (prefixSpirits.length < this.config.minBlockSize) continue;
      
      const blockKey: BlockingKey = {
        key: `prefix:${prefix}`,
        type: 'prefix',
        confidence: 0.75
      };
      
      blocks.set(blockKey.key, {
        blockKey,
        spirits: prefixSpirits,
        size: prefixSpirits.length
      });
    }
  }

  /**
   * Create soundex-based blocks for phonetic matching
   */
  private createSoundexBlocks(spirits: DatabaseSpirit[], blocks: Map<string, SpiritBlock>): void {
    const soundexGroups = new Map<string, DatabaseSpirit[]>();
    
    for (const spirit of spirits) {
      const soundex = this.soundex(spirit.name);
      if (!soundex) continue;
      
      // Combine with brand for better precision
      const brand = this.normalizeBrand(spirit.brand || '');
      const key = brand ? `${soundex}:${brand}` : soundex;
      
      if (!soundexGroups.has(key)) {
        soundexGroups.set(key, []);
      }
      soundexGroups.get(key)!.push(spirit);
    }
    
    // Create blocks from soundex groups
    for (const [key, soundexSpirits] of soundexGroups.entries()) {
      if (soundexSpirits.length < this.config.minBlockSize) continue;
      
      const blockKey: BlockingKey = {
        key: `soundex:${key}`,
        type: 'soundex',
        confidence: 0.70
      };
      
      blocks.set(blockKey.key, {
        blockKey,
        spirits: soundexSpirits,
        size: soundexSpirits.length
      });
    }
  }

  /**
   * Create n-gram fingerprint blocks
   */
  private createNGramBlocks(spirits: DatabaseSpirit[], blocks: Map<string, SpiritBlock>): void {
    const ngramGroups = new Map<string, DatabaseSpirit[]>();
    
    for (const spirit of spirits) {
      const fingerprint = this.getNGramFingerprint(spirit.name);
      if (!fingerprint) continue;
      
      if (!ngramGroups.has(fingerprint)) {
        ngramGroups.set(fingerprint, []);
      }
      ngramGroups.get(fingerprint)!.push(spirit);
    }
    
    // Create blocks from n-gram groups
    for (const [fingerprint, ngramSpirits] of ngramGroups.entries()) {
      if (ngramSpirits.length < this.config.minBlockSize) continue;
      
      const blockKey: BlockingKey = {
        key: `ngram:${fingerprint}`,
        type: 'ngramFingerprint',
        confidence: 0.65
      };
      
      blocks.set(blockKey.key, {
        blockKey,
        spirits: ngramSpirits,
        size: ngramSpirits.length
      });
    }
  }

  /**
   * Create blocks for size variants (8% of duplicates)
   * Groups spirits that differ only by bottle size (750ml, 1L, 1.75L, etc.)
   */
  private createSizeVariantBlocks(spirits: DatabaseSpirit[], blocks: Map<string, SpiritBlock>): void {
    const sizeGroups = new Map<string, DatabaseSpirit[]>();
    
    for (const spirit of spirits) {
      const normalizedName = this.normalizeSizeVariants(spirit.name);
      const brand = this.normalizeBrand(spirit.brand || '');
      const key = `${brand}:${normalizedName}`;
      
      if (!sizeGroups.has(key)) {
        sizeGroups.set(key, []);
      }
      sizeGroups.get(key)!.push(spirit);
    }
    
    // Create blocks from size groups
    for (const [key, sizeSpirits] of sizeGroups.entries()) {
      if (sizeSpirits.length < this.config.minBlockSize) continue;
      
      const blockKey: BlockingKey = {
        key: `size:${key}`,
        type: 'sizeVariant',
        confidence: 0.92
      };
      
      blocks.set(blockKey.key, {
        blockKey,
        spirits: sizeSpirits,
        size: sizeSpirits.length
      });
    }
  }

  /**
   * Create blocks for marketing text variations (6% of duplicates)
   * Groups spirits that differ only by marketing text variations
   */
  private createMarketingTextBlocks(spirits: DatabaseSpirit[], blocks: Map<string, SpiritBlock>): void {
    const marketingGroups = new Map<string, DatabaseSpirit[]>();
    
    for (const spirit of spirits) {
      const normalizedName = this.normalizeMarketingText(spirit.name);
      const brand = this.normalizeBrand(spirit.brand || '');
      const key = `${brand}:${normalizedName}`;
      
      if (!marketingGroups.has(key)) {
        marketingGroups.set(key, []);
      }
      marketingGroups.get(key)!.push(spirit);
    }
    
    // Create blocks from marketing groups
    for (const [key, marketingSpirits] of marketingGroups.entries()) {
      if (marketingSpirits.length < this.config.minBlockSize) continue;
      
      const blockKey: BlockingKey = {
        key: `marketing:${key}`,
        type: 'marketingText',
        confidence: 0.88
      };
      
      blocks.set(blockKey.key, {
        blockKey,
        spirits: marketingSpirits,
        size: marketingSpirits.length
      });
    }
  }

  /**
   * Create blocks for year variants (4% of duplicates)
   * Groups spirits that differ only by release year
   */
  private createYearVariantBlocks(spirits: DatabaseSpirit[], blocks: Map<string, SpiritBlock>): void {
    const yearGroups = new Map<string, DatabaseSpirit[]>();
    
    for (const spirit of spirits) {
      const normalizedName = this.normalizeYearVariants(spirit.name);
      const brand = this.normalizeBrand(spirit.brand || '');
      const type = spirit.type || 'Unknown';
      const key = `${brand}:${type}:${normalizedName}`;
      
      if (!yearGroups.has(key)) {
        yearGroups.set(key, []);
      }
      yearGroups.get(key)!.push(spirit);
    }
    
    // Create blocks from year groups
    for (const [key, yearSpirits] of yearGroups.entries()) {
      if (yearSpirits.length < this.config.minBlockSize) continue;
      
      const blockKey: BlockingKey = {
        key: `year:${key}`,
        type: 'yearVariant',
        confidence: 0.85
      };
      
      blocks.set(blockKey.key, {
        blockKey,
        spirits: yearSpirits,
        size: yearSpirits.length
      });
    }
  }

  /**
   * Create blocks for proof notation differences (4% of duplicates)
   * Groups spirits that differ only by proof/ABV notation
   */
  private createProofNotationBlocks(spirits: DatabaseSpirit[], blocks: Map<string, SpiritBlock>): void {
    const proofGroups = new Map<string, DatabaseSpirit[]>();
    
    for (const spirit of spirits) {
      const normalizedName = this.normalizeProofNotation(spirit.name);
      const brand = this.normalizeBrand(spirit.brand || '');
      const key = `${brand}:${normalizedName}`;
      
      if (!proofGroups.has(key)) {
        proofGroups.set(key, []);
      }
      proofGroups.get(key)!.push(spirit);
    }
    
    // Create blocks from proof groups
    for (const [key, proofSpirits] of proofGroups.entries()) {
      if (proofSpirits.length < this.config.minBlockSize) continue;
      
      const blockKey: BlockingKey = {
        key: `proof:${key}`,
        type: 'proofNotation',
        confidence: 0.90
      };
      
      blocks.set(blockKey.key, {
        blockKey,
        spirits: proofSpirits,
        size: proofSpirits.length
      });
    }
  }

  /**
   * Create blocks for type compatibility (3% of duplicates)
   * Groups spirits with compatible types (bourbon/whiskey, scotch/whisky, etc.)
   */
  private createTypeCompatibleBlocks(spirits: DatabaseSpirit[], blocks: Map<string, SpiritBlock>): void {
    const typeGroups = new Map<string, DatabaseSpirit[]>();
    
    for (const spirit of spirits) {
      const compatibleType = this.getCompatibleType(spirit.type || 'Unknown');
      const brand = this.normalizeBrand(spirit.brand || '');
      const normalizedName = this.normalizeBasicName(spirit.name);
      const key = `${compatibleType}:${brand}:${normalizedName}`;
      
      if (!typeGroups.has(key)) {
        typeGroups.set(key, []);
      }
      typeGroups.get(key)!.push(spirit);
    }
    
    // Create blocks from type compatible groups
    for (const [key, typeSpirits] of typeGroups.entries()) {
      if (typeSpirits.length < this.config.minBlockSize) continue;
      
      const blockKey: BlockingKey = {
        key: `typecompat:${key}`,
        type: 'typeCompatible',
        confidence: 0.80
      };
      
      blocks.set(blockKey.key, {
        blockKey,
        spirits: typeSpirits,
        size: typeSpirits.length
      });
    }
  }

  /**
   * Split large blocks into smaller chunks
   */
  private splitLargeBlock(
    baseKey: string,
    spirits: DatabaseSpirit[],
    blocks: Map<string, SpiritBlock>,
    type: BlockingKey['type']
  ): void {
    // Sort spirits by name for consistent splitting
    spirits.sort((a, b) => a.name.localeCompare(b.name));
    
    const chunkSize = Math.ceil(this.config.maxBlockSize * 0.8); // 80% of max to leave room
    let chunkIndex = 0;
    
    for (let i = 0; i < spirits.length; i += chunkSize) {
      const chunk = spirits.slice(i, i + chunkSize);
      const blockKey: BlockingKey = {
        key: `${type}:${baseKey}:chunk${chunkIndex}`,
        type,
        confidence: 0.9
      };
      
      blocks.set(blockKey.key, {
        blockKey,
        spirits: chunk,
        size: chunk.length
      });
      
      chunkIndex++;
    }
  }

  /**
   * Normalize size variants from spirit names
   * Removes bottle size information (750ml, 1L, 1.75L, etc.)
   */
  private normalizeSizeVariants(name: string): string {
    return name
      .toLowerCase()
      .trim()
      // Remove common bottle sizes (specific patterns first)
      .replace(/\b1\.75l\b/gi, '')
      .replace(/\b1\.75\s*l\b/gi, '')
      .replace(/\b1750ml\b/gi, '')
      .replace(/\b(375|750|1000)ml?\b/gi, '')
      .replace(/\b(0\.375|0\.75|1)l?\b/gi, '')
      .replace(/\b(375ml|750ml|1l)\b/gi, '')
      .replace(/\b(pint|quart|half\s*gallon|gallon)\b/gi, '')
      .replace(/\b(50ml|100ml|200ml|350ml|500ml|700ml)\b/gi, '')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalize marketing text variations
   * Standardizes common marketing text differences
   */
  private normalizeMarketingText(name: string): string {
    return name
      .toLowerCase()
      .trim()
      // Standardize hyphenation and spacing in marketing terms
      .replace(/\bsmall[\s-]*batch\b/gi, 'smallbatch')
      .replace(/\bsingle[\s-]*barrel\b/gi, 'singlebarrel')
      .replace(/\bcask[\s-]*strength\b/gi, 'caskstrength')
      .replace(/\bbottled[\s-]*in[\s-]*bond\b/gi, 'bottledinbond')
      .replace(/\blimited[\s-]*edition\b/gi, 'limitededition')
      .replace(/\bprivate[\s-]*selection\b/gi, 'privateselection')
      .replace(/\bmaster[\s-]*distiller\b/gi, 'masterdistiller')
      .replace(/\bdistillery[\s-]*exclusive\b/gi, 'distilleryexclusive')
      // Remove common marketing words that vary
      .replace(/\b(premium|reserve|select|special|finest|quality|craft|artisan)\b/gi, '')
      // Clean up spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalize year variants from spirit names
   * Removes year information while preserving age statements
   */
  private normalizeYearVariants(name: string): string {
    return name
      .toLowerCase()
      .trim()
      // Remove 4-digit years (2018, 2019, etc.) but keep age statements
      .replace(/\b(19|20)\d{2}\b/g, '')
      // Remove vintage/release year patterns
      .replace(/\b(vintage|release|bottled|distilled)\s*(19|20)\d{2}\b/gi, '')
      .replace(/\b(19|20)\d{2}\s*(vintage|release|bottled|distilled)\b/gi, '')
      // Remove year ranges
      .replace(/\b(19|20)\d{2}-(19|20)\d{2}\b/g, '')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalize proof notation differences
   * Standardizes proof/ABV representations
   */
  private normalizeProofNotation(name: string): string {
    return name
      .toLowerCase()
      .trim()
      // Convert common proof to ABV patterns
      .replace(/\b(\d+(?:\.\d+)?)\s*proof\b/gi, (match, number) => {
        const abv = parseFloat(number) / 2;
        return `${abv}abv`;
      })
      // Standardize ABV notation
      .replace(/\b(\d+(?:\.\d+)?)\s*%?\s*abv\b/gi, '$1abv')
      .replace(/\b(\d+(?:\.\d+)?)\s*%\b/gi, '$1abv')
      // Remove alcohol content entirely for basic matching
      .replace(/\b\d+(?:\.\d+)?(abv|proof|%)\b/gi, '')
      // Clean up spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get compatible type for type mismatch handling
   * Groups similar spirit types together
   */
  private getCompatibleType(type: string): string {
    const normalizedType = type.toLowerCase().trim();
    
    // Bourbon and American Whiskey are compatible
    if (normalizedType.includes('bourbon') || 
        normalizedType.includes('american whiskey') ||
        normalizedType.includes('tennessee whiskey')) {
      return 'american-whiskey';
    }
    
    // Scotch variations
    if (normalizedType.includes('scotch') || 
        normalizedType.includes('single malt') ||
        normalizedType.includes('blended scotch')) {
      return 'scotch-whisky';
    }
    
    // Irish whiskey
    if (normalizedType.includes('irish')) {
      return 'irish-whiskey';
    }
    
    // Japanese whisky
    if (normalizedType.includes('japanese')) {
      return 'japanese-whisky';
    }
    
    // Canadian whisky
    if (normalizedType.includes('canadian')) {
      return 'canadian-whisky';
    }
    
    // Rye whiskey
    if (normalizedType.includes('rye')) {
      return 'rye-whiskey';
    }
    
    // Generic whiskey/whisky
    if (normalizedType.includes('whisk')) {
      return 'whiskey';
    }
    
    // Gin variations
    if (normalizedType.includes('gin')) {
      return 'gin';
    }
    
    // Vodka
    if (normalizedType.includes('vodka')) {
      return 'vodka';
    }
    
    // Rum variations
    if (normalizedType.includes('rum')) {
      return 'rum';
    }
    
    // Tequila variations
    if (normalizedType.includes('tequila')) {
      return 'tequila';
    }
    
    // Brandy/Cognac
    if (normalizedType.includes('brandy') || normalizedType.includes('cognac')) {
      return 'brandy';
    }
    
    return normalizedType;
  }

  /**
   * Basic name normalization for type compatibility
   * Removes type-specific words and common variations
   */
  private normalizeBasicName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      // Remove type words that might vary
      .replace(/\b(bourbon|whiskey|whisky|scotch|irish|american|tennessee|rye|single|malt|blended)\b/gi, '')
      // Remove common descriptors
      .replace(/\b(straight|bottled|distilled)\b/gi, '')
      // Remove age statements for basic matching
      .replace(/\b\d+\s*(year|yr)s?\s*(old)?\b/gi, '')
      // Remove proof/ABV
      .replace(/\b\d+(?:\.\d+)?\s*(proof|abv|%)\b/gi, '')
      // Clean up spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Normalize brand name for blocking
   */
  private normalizeBrand(brand: string): string {
    return brand
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '')
      .replace(/distillery|distilleries|brewing|brewery|spirits/gi, '');
  }

  /**
   * Get name prefix for blocking
   */
  private getNamePrefix(name: string): string {
    const normalized = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');
    
    // Use first 4 characters as prefix
    return normalized.substring(0, 4);
  }

  /**
   * Soundex algorithm for phonetic matching
   */
  private soundex(name: string): string {
    const a = name.toLowerCase().split('');
    const firstLetter = a[0];
    const codes: { [key: string]: string } = {
      a: '', e: '', i: '', o: '', u: '', y: '', h: '', w: '',
      b: '1', f: '1', p: '1', v: '1',
      c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
      d: '3', t: '3',
      l: '4',
      m: '5', n: '5',
      r: '6'
    };
    
    const encoded = a
      .map(char => codes[char] || '')
      .filter((val, idx, arr) => idx === 0 || val !== arr[idx - 1])
      .join('');
    
    return (firstLetter + encoded + '000').slice(0, 4).toUpperCase();
  }

  /**
   * Generate n-gram fingerprint
   */
  private getNGramFingerprint(text: string): string {
    const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const ngrams = new Set<string>();
    
    // Generate n-grams
    for (let i = 0; i <= normalized.length - this.config.ngramSize; i++) {
      ngrams.add(normalized.substring(i, i + this.config.ngramSize));
    }
    
    // Sort and concatenate first few n-grams as fingerprint
    const sortedNgrams = Array.from(ngrams).sort();
    return sortedNgrams.slice(0, 5).join('');
  }

  /**
   * Get blocking statistics
   */
  private getBlockingStatistics(blocks: Map<string, SpiritBlock>): any {
    const blockSizes = Array.from(blocks.values()).map(b => b.size);
    const totalSpirits = blockSizes.reduce((sum, size) => sum + size, 0);
    
    return {
      totalBlocks: blocks.size,
      totalSpirits,
      avgBlockSize: (totalSpirits / blocks.size).toFixed(2),
      minBlockSize: Math.min(...blockSizes),
      maxBlockSize: Math.max(...blockSizes),
      blockTypes: {
        brand: Array.from(blocks.values()).filter(b => b.blockKey.type === 'brand').length,
        type: Array.from(blocks.values()).filter(b => b.blockKey.type === 'type').length,
        prefix: Array.from(blocks.values()).filter(b => b.blockKey.type === 'prefix').length,
        soundex: Array.from(blocks.values()).filter(b => b.blockKey.type === 'soundex').length,
        ngram: Array.from(blocks.values()).filter(b => b.blockKey.type === 'ngramFingerprint').length,
        sizeVariant: Array.from(blocks.values()).filter(b => b.blockKey.type === 'sizeVariant').length,
        marketingText: Array.from(blocks.values()).filter(b => b.blockKey.type === 'marketingText').length,
        yearVariant: Array.from(blocks.values()).filter(b => b.blockKey.type === 'yearVariant').length,
        proofNotation: Array.from(blocks.values()).filter(b => b.blockKey.type === 'proofNotation').length,
        typeCompatible: Array.from(blocks.values()).filter(b => b.blockKey.type === 'typeCompatible').length
      }
    };
  }

  /**
   * Enhanced multi-pass blocking for higher recall
   * Creates overlapping blocks with different strategies to catch more potential duplicates
   */
  createBlocksMultiPass(spirits: DatabaseSpirit[]): BlockingResult {
    if (!this.config.enableMultiPass) {
      return this.createBlocksWithMetrics(spirits);
    }

    logger.info(`Running multi-pass blocking for enhanced recall on ${spirits.length} spirits`);
    
    const overallStartTime = Date.now();
    const initialMemory = this.getMemoryUsageMB();
    const allBlocks = new Map<string, SpiritBlock>();
    const aggregatedTimings: { [pass: string]: number } = {};

    // Pass 1: Conservative blocking (high precision)
    const conservativeConfig = { ...this.config, maxBlockSize: 500, minBlockSize: 3 };
    const conservativeService = new BlockingDeduplicationService(conservativeConfig);
    const conservativeResult = conservativeService.createBlocksWithMetrics(spirits);
    
    this.mergeBlocksWithPrefix(allBlocks, conservativeResult.blocks, 'conservative_');
    Object.entries(conservativeResult.metrics.blockingPassTimes).forEach(([pass, time]) => {
      aggregatedTimings[`conservative_${pass}`] = time;
    });

    // Pass 2: Aggressive blocking (higher recall)
    const aggressiveConfig = { 
      ...this.config, 
      maxBlockSize: 2000, 
      minBlockSize: 2,
      enableSoundex: true,
      enableNGramFingerprint: true
    };
    const aggressiveService = new BlockingDeduplicationService(aggressiveConfig);
    const aggressiveResult = aggressiveService.createBlocksWithMetrics(spirits);
    
    this.mergeBlocksWithPrefix(allBlocks, aggressiveResult.blocks, 'aggressive_');
    Object.entries(aggressiveResult.metrics.blockingPassTimes).forEach(([pass, time]) => {
      aggregatedTimings[`aggressive_${pass}`] = time;
    });

    // Pass 3: Fuzzy blocking (maximum recall)
    const fuzzyConfig = { 
      ...this.config, 
      maxBlockSize: 5000,
      minBlockSize: 2,
      ngramSize: 2, // Smaller n-grams for more fuzzy matching
      enableSpecialCaseHandling: true
    };
    const fuzzyService = new BlockingDeduplicationService(fuzzyConfig);
    const fuzzyResult = fuzzyService.createBlocksWithMetrics(spirits);
    
    this.mergeBlocksWithPrefix(allBlocks, fuzzyResult.blocks, 'fuzzy_');
    Object.entries(fuzzyResult.metrics.blockingPassTimes).forEach(([pass, time]) => {
      aggregatedTimings[`fuzzy_${pass}`] = time;
    });

    const totalTime = Date.now() - overallStartTime;
    const finalMemory = this.getMemoryUsageMB();
    const reductionStats = this.calculateReduction(spirits.length, allBlocks);

    const metrics: PerformanceMetrics = {
      totalProcessingTime: totalTime,
      blockingTime: totalTime,
      memoryUsageMB: finalMemory,
      spiritsProcessed: spirits.length,
      blocksCreated: allBlocks.size,
      comparisonsAvoidedPercentage: reductionStats.reductionPercentage,
      throughputSpiritsPerSecond: spirits.length / (totalTime / 1000),
      memoryEfficiency: finalMemory - initialMemory,
      blockingPassTimes: aggregatedTimings
    };

    if (this.config.enablePerformanceMonitoring) {
      logger.info('Multi-pass blocking completed:', {
        totalBlocks: allBlocks.size,
        conservativeBlocks: conservativeResult.blocks.size,
        aggressiveBlocks: aggressiveResult.blocks.size,
        fuzzyBlocks: fuzzyResult.blocks.size,
        totalTime: `${totalTime}ms`,
        comparisonsAvoided: `${metrics.comparisonsAvoidedPercentage.toFixed(2)}%`
      });
    }

    return {
      blocks: allBlocks,
      metrics,
      memoryOptimized: finalMemory < this.config.memoryLimitMB,
      usedProgressiveBlocking: false
    };
  }

  /**
   * Merge blocks with a prefix to avoid key conflicts
   */
  private mergeBlocksWithPrefix(mainBlocks: Map<string, SpiritBlock>, newBlocks: Map<string, SpiritBlock>, prefix: string): void {
    for (const [key, block] of newBlocks.entries()) {
      const prefixedKey = `${prefix}${key}`;
      mainBlocks.set(prefixedKey, {
        ...block,
        blockKey: { ...block.blockKey, key: prefixedKey }
      });
    }
  }

  /**
   * Process blocks in batches to optimize memory usage
   */
  async* processBlocksInBatches(
    blocks: Map<string, SpiritBlock>
  ): AsyncGenerator<SpiritBlock[], void, unknown> {
    const blockArray = Array.from(blocks.values());
    
    // Sort blocks by confidence (highest first) and size (largest first)
    blockArray.sort((a, b) => {
      const confDiff = b.blockKey.confidence - a.blockKey.confidence;
      if (confDiff !== 0) return confDiff;
      return b.size - a.size;
    });
    
    // Yield blocks in batches
    for (let i = 0; i < blockArray.length; i += this.config.batchSize) {
      const batch = blockArray.slice(i, i + this.config.batchSize);
      yield batch;
    }
  }

  /**
   * Calculate reduction in comparisons
   */
  calculateReduction(totalSpirits: number, blocks: Map<string, SpiritBlock>): {
    withoutBlocking: number;
    withBlocking: number;
    reduction: number;
    reductionPercentage: number;
  } {
    // Without blocking: n*(n-1)/2 comparisons
    const withoutBlocking = (totalSpirits * (totalSpirits - 1)) / 2;
    
    // With blocking: sum of comparisons within each block
    let withBlocking = 0;
    for (const block of blocks.values()) {
      if (block.size >= 2) {
        withBlocking += (block.size * (block.size - 1)) / 2;
      }
    }
    
    const reduction = withoutBlocking - withBlocking;
    const reductionPercentage = (reduction / withoutBlocking) * 100;
    
    return {
      withoutBlocking,
      withBlocking,
      reduction,
      reductionPercentage
    };
  }
}

// Singleton instance
export const blockingDeduplicationService = new BlockingDeduplicationService();