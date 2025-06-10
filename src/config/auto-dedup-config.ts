/**
 * Automatic Deduplication Configuration
 * 
 * Controls how deduplication runs automatically after scraping sessions
 */

export interface AutoDeduplicationConfig {
  // Enable/disable automatic deduplication
  enabled: boolean;
  
  // Minimum number of spirits before auto-dedup runs
  minSpiritsThreshold: number;
  
  // Run exact match deduplication
  runExactMatch: boolean;
  
  // Run fuzzy match deduplication
  runFuzzyMatch: boolean;
  
  // Automatically merge high-confidence matches
  autoMerge: boolean;
  
  // Thresholds for automatic operations
  thresholds: {
    // Similarity threshold for same-brand items
    sameBrand: number;
    
    // Similarity threshold for different-brand items
    differentBrand: number;
    
    // Minimum confidence for auto-merge
    autoMergeConfidence: number;
  };
  
  // Performance settings
  performance: {
    // Max spirits to process in one batch
    batchSize: number;
    
    // Delay between batches (ms)
    batchDelay: number;
    
    // Skip fuzzy matching if too many spirits
    fuzzyMatchLimit: number;
  };
  
  // Notification settings
  notifications: {
    // Show summary after auto-dedup
    showSummary: boolean;
    
    // Show detailed results
    showDetails: boolean;
    
    // Log to file
    logToFile: boolean;
  };
}

/**
 * Default configuration for automatic deduplication
 */
export const DEFAULT_AUTO_DEDUP_CONFIG: AutoDeduplicationConfig = {
  enabled: true,
  minSpiritsThreshold: 10,
  runExactMatch: true,
  runFuzzyMatch: true,
  autoMerge: true,
  
  thresholds: {
    sameBrand: 0.7,        // As per task 4.4 requirements
    differentBrand: 0.85,
    autoMergeConfidence: 0.9,
  },
  
  performance: {
    batchSize: 100,
    batchDelay: 1000,      // 1 second between batches
    fuzzyMatchLimit: 500,  // Skip fuzzy if more than 500 spirits
  },
  
  notifications: {
    showSummary: true,
    showDetails: true,
    logToFile: false,
  }
};

/**
 * Load configuration from environment or use defaults
 */
export function loadAutoDeduplicationConfig(): AutoDeduplicationConfig {
  const config = { ...DEFAULT_AUTO_DEDUP_CONFIG };
  
  // Override from environment variables if present
  if (process.env.AUTO_DEDUP_ENABLED !== undefined) {
    config.enabled = process.env.AUTO_DEDUP_ENABLED === 'true';
  }
  
  if (process.env.AUTO_DEDUP_MIN_SPIRITS !== undefined) {
    config.minSpiritsThreshold = parseInt(process.env.AUTO_DEDUP_MIN_SPIRITS);
  }
  
  if (process.env.AUTO_DEDUP_AUTO_MERGE !== undefined) {
    config.autoMerge = process.env.AUTO_DEDUP_AUTO_MERGE === 'true';
  }
  
  if (process.env.AUTO_DEDUP_SAME_BRAND_THRESHOLD !== undefined) {
    config.thresholds.sameBrand = parseFloat(process.env.AUTO_DEDUP_SAME_BRAND_THRESHOLD);
  }
  
  return config;
}

/**
 * Get user-friendly configuration summary
 */
export function getConfigSummary(config: AutoDeduplicationConfig): string {
  const lines = [
    `Auto-deduplication: ${config.enabled ? 'Enabled' : 'Disabled'}`,
    `Threshold: ${config.minSpiritsThreshold} spirits`,
    `Exact match: ${config.runExactMatch ? 'Yes' : 'No'}`,
    `Fuzzy match: ${config.runFuzzyMatch ? 'Yes' : 'No'}`,
    `Auto-merge: ${config.autoMerge ? 'Yes' : 'No'}`,
    `Same-brand threshold: ${(config.thresholds.sameBrand * 100).toFixed(0)}%`,
  ];
  
  return lines.join('\n');
}