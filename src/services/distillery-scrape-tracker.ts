import { Redis } from '@upstash/redis';
import { logger } from '../utils/logger.js';
import { Distillery } from '../config/distilleries.js';

interface DistilleryScrapeRecord {
  distilleryName: string;
  lastScrapedAt: string;
  spiritsFound: number;
  spiritsStored: number;
  apiCallsUsed: number;
  efficiency: number;
  spiritTypes: string[];
}

interface ScrapeSession {
  sessionId: string;
  startedAt: string;
  distilleriesScraped: string[];
  totalApiCalls: number;
  totalSpiritsFound: number;
  totalSpiritsStored: number;
}

export class DistilleryScrapeTracker {
  private redis: Redis;
  private readonly TRACKER_PREFIX = 'distillery_tracker:';
  private readonly SESSION_PREFIX = 'scrape_session:';
  private readonly RECORD_TTL = 30 * 24 * 60 * 60; // 30 days
  private readonly SESSION_TTL = 7 * 24 * 60 * 60; // 7 days

  constructor() {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      throw new Error('Redis credentials not found. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    }

    this.redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }

  /**
   * Record a distillery scrape
   */
  async recordDistilleryScrape(
    distillery: Distillery,
    spiritsFound: number,
    spiritsStored: number,
    apiCallsUsed: number,
    spiritTypes: string[]
  ): Promise<void> {
    const record: DistilleryScrapeRecord = {
      distilleryName: distillery.name,
      lastScrapedAt: new Date().toISOString(),
      spiritsFound,
      spiritsStored,
      apiCallsUsed,
      efficiency: apiCallsUsed > 0 ? spiritsFound / apiCallsUsed : 0,
      spiritTypes: [...new Set(spiritTypes)], // Unique types
    };

    const key = `${this.TRACKER_PREFIX}${distillery.name.toLowerCase().replace(/\s+/g, '_')}`;
    await this.redis.set(key, record, { ex: this.RECORD_TTL });
    
    logger.info(`Recorded scrape for ${distillery.name}: ${spiritsFound} found, ${apiCallsUsed} API calls`);
  }

  /**
   * Get distillery scrape record
   */
  async getDistilleryRecord(distilleryName: string): Promise<DistilleryScrapeRecord | null> {
    const key = `${this.TRACKER_PREFIX}${distilleryName.toLowerCase().replace(/\s+/g, '_')}`;
    const data = await this.redis.get<DistilleryScrapeRecord>(key);
    
    return data || null;
  }

  /**
   * Get distilleries that haven't been scraped recently
   */
  async getUnscrapedDistilleries(
    allDistilleries: Distillery[],
    daysSinceLastScrape: number = 7
  ): Promise<Distillery[]> {
    const unscraped: Distillery[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastScrape);

    // Batch fetch all distillery records to avoid N+1 queries
    logger.info(`Checking ${allDistilleries.length} distilleries for scraping history...`);
    
    // Get all keys at once
    const keys = allDistilleries.map(d => `${this.TRACKER_PREFIX}${d.name}`);
    
    // Use Redis pipeline for batch fetching
    const pipeline = this.redis.pipeline();
    keys.forEach(key => pipeline.get(key));
    
    const results = await pipeline.exec();
    
    // Process results
    for (let i = 0; i < allDistilleries.length; i++) {
      const distillery = allDistilleries[i];
      const record = results[i] as DistilleryScrapeRecord | null;
      
      if (!record || new Date(record.lastScrapedAt) < cutoffDate) {
        unscraped.push(distillery);
      }
    }

    logger.info(`Found ${unscraped.length} unscraped distilleries`);
    return unscraped;
  }

  /**
   * Get distilleries by spirit type that haven't been scraped
   */
  async getUnscrapedDistilleriesByType(
    allDistilleries: Distillery[],
    spiritTypes: string[],
    daysSinceLastScrape: number = 7
  ): Promise<Distillery[]> {
    const unscraped = await this.getUnscrapedDistilleries(allDistilleries, daysSinceLastScrape);
    
    // Filter by spirit types
    return unscraped.filter(distillery => 
      distillery.type.some(t => spiritTypes.includes(t.toLowerCase()))
    );
  }

  /**
   * Get priority distilleries (high-value targets)
   */
  async getPriorityDistilleries(
    allDistilleries: Distillery[],
    limit: number = 10
  ): Promise<Distillery[]> {
    // Priority factors:
    // 1. Never scraped
    // 2. High priority rating
    // 3. Multiple spirit types
    // 4. Well-known brands

    const unscraped = await this.getUnscrapedDistilleries(allDistilleries, 30);
    
    // Sort by priority
    const prioritized = unscraped.sort((a, b) => {
      // Priority score calculation
      const scoreA = (a.priority || 5) + (a.type.length * 2) + (a.product_lines?.length || 0);
      const scoreB = (b.priority || 5) + (b.type.length * 2) + (b.product_lines?.length || 0);
      return scoreB - scoreA;
    });

    return prioritized.slice(0, limit);
  }

  /**
   * Start a new scraping session
   */
  async startSession(): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: ScrapeSession = {
      sessionId,
      startedAt: new Date().toISOString(),
      distilleriesScraped: [],
      totalApiCalls: 0,
      totalSpiritsFound: 0,
      totalSpiritsStored: 0,
    };

    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await this.redis.set(key, session, { ex: this.SESSION_TTL });
    
    return sessionId;
  }

  /**
   * Update session progress
   */
  async updateSession(
    sessionId: string,
    distilleryName: string,
    apiCalls: number,
    spiritsFound: number,
    spiritsStored: number
  ): Promise<void> {
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    const session = await this.redis.get<ScrapeSession>(key);
    
    if (!session) {
      logger.error(`Session ${sessionId} not found`);
      return;
    }

    session.distilleriesScraped.push(distilleryName);
    session.totalApiCalls += apiCalls;
    session.totalSpiritsFound += spiritsFound;
    session.totalSpiritsStored += spiritsStored;
    
    await this.redis.set(key, session, { ex: this.SESSION_TTL });
  }

  /**
   * Get scraping statistics
   */
  async getScrapingStats(): Promise<{
    totalDistilleriesScraped: number;
    recentSessions: number;
    averageEfficiency: number;
    topSpiritTypes: Record<string, number>;
  }> {
    // Get all tracker keys
    const keys = await this.redis.keys(`${this.TRACKER_PREFIX}*`);
    
    let totalDistilleries = 0;
    let totalEfficiency = 0;
    const spiritTypeCounts: Record<string, number> = {};

    for (const key of keys) {
      const record = await this.redis.get<DistilleryScrapeRecord>(key);
      if (!record) continue;

      totalDistilleries++;
      totalEfficiency += record.efficiency;
      
      // Count spirit types
      if (record.spiritTypes && Array.isArray(record.spiritTypes)) {
        record.spiritTypes.forEach(type => {
          spiritTypeCounts[type] = (spiritTypeCounts[type] || 0) + 1;
        });
      }
    }

    // Get recent sessions
    const sessionKeys = await this.redis.keys(`${this.SESSION_PREFIX}*`);
    
    return {
      totalDistilleriesScraped: totalDistilleries,
      recentSessions: sessionKeys.length,
      averageEfficiency: totalDistilleries > 0 ? totalEfficiency / totalDistilleries : 0,
      topSpiritTypes: spiritTypeCounts,
    };
  }

  /**
   * Get intelligent distillery selection based on various factors
   */
  async getIntelligentDistillerySelection(
    allDistilleries: Distillery[],
    targetApiCalls: number,
    options: {
      preferUnscraped?: boolean;
      spiritTypeDistribution?: boolean;
      priorityWeighting?: boolean;
      avoidRecentlyCached?: boolean;
    } = {}
  ): Promise<Distillery[]> {
    const {
      preferUnscraped = true,
      spiritTypeDistribution = true,
      priorityWeighting = true,
      avoidRecentlyCached = true,
    } = options;

    // Get unscraped distilleries
    const unscraped = preferUnscraped 
      ? await this.getUnscrapedDistilleries(allDistilleries, avoidRecentlyCached ? 3 : 7)
      : allDistilleries;

    // Group by spirit type for distribution
    const byType: Record<string, Distillery[]> = {};
    unscraped.forEach(d => {
      d.type.forEach(t => {
        if (!byType[t]) byType[t] = [];
        byType[t].push(d);
      });
    });

    // Calculate how many distilleries to select
    const avgApiCallsPerDistillery = 7;
    const targetDistilleries = Math.ceil(targetApiCalls / avgApiCallsPerDistillery);
    
    const selected: Distillery[] = [];
    const selectedNames = new Set<string>();

    if (spiritTypeDistribution) {
      // Distribute across spirit types
      const types = Object.keys(byType);
      const distilleriesPerType = Math.ceil(targetDistilleries / types.length);

      for (const type of types) {
        const typeDistilleries = byType[type]
          .filter(d => !selectedNames.has(d.name))
          .sort((a, b) => {
            if (priorityWeighting) {
              return (b.priority || 5) - (a.priority || 5);
            }
            return Math.random() - 0.5;
          })
          .slice(0, distilleriesPerType);

        typeDistilleries.forEach(d => {
          if (selected.length < targetDistilleries && !selectedNames.has(d.name)) {
            selected.push(d);
            selectedNames.add(d.name);
          }
        });
      }
    }

    // Fill remaining slots with priority distilleries
    if (selected.length < targetDistilleries) {
      const remaining = unscraped
        .filter(d => !selectedNames.has(d.name))
        .sort((a, b) => {
          if (priorityWeighting) {
            const scoreA = (a.priority || 5) + (a.type.length * 2);
            const scoreB = (b.priority || 5) + (b.type.length * 2);
            return scoreB - scoreA;
          }
          return Math.random() - 0.5;
        })
        .slice(0, targetDistilleries - selected.length);

      selected.push(...remaining);
    }

    // Shuffle for variety while maintaining some priority order
    return selected.sort(() => Math.random() - 0.3);
  }

  /**
   * Clear all tracking data (use with caution)
   */
  async clearAllTracking(): Promise<void> {
    const trackerKeys = await this.redis.keys(`${this.TRACKER_PREFIX}*`);
    const sessionKeys = await this.redis.keys(`${this.SESSION_PREFIX}*`);
    
    const allKeys = [...trackerKeys, ...sessionKeys];
    
    if (allKeys.length > 0) {
      await Promise.all(allKeys.map(key => this.redis.del(key)));
      logger.info(`Cleared ${allKeys.length} tracking records`);
    }
  }
}

// Export singleton instance with lazy initialization
let _instance: DistilleryScrapeTracker | null = null;

export const distilleryScrapeTracker = {
  async getScrapingStats() {
    if (!_instance) _instance = new DistilleryScrapeTracker();
    return _instance.getScrapingStats();
  },
  
  async getUnscrapedDistilleries(allDistilleries: Distillery[], daysSinceLastScrape?: number) {
    if (!_instance) _instance = new DistilleryScrapeTracker();
    return _instance.getUnscrapedDistilleries(allDistilleries, daysSinceLastScrape);
  },
  
  async getIntelligentDistillerySelection(allDistilleries: Distillery[], targetApiCalls: number, options?: any) {
    if (!_instance) _instance = new DistilleryScrapeTracker();
    return _instance.getIntelligentDistillerySelection(allDistilleries, targetApiCalls, options);
  },
  
  async startSession() {
    if (!_instance) _instance = new DistilleryScrapeTracker();
    return _instance.startSession();
  },
  
  async updateSession(sessionId: string, distilleryName: string, apiCalls: number, spiritsFound: number, spiritsStored: number) {
    if (!_instance) _instance = new DistilleryScrapeTracker();
    return _instance.updateSession(sessionId, distilleryName, apiCalls, spiritsFound, spiritsStored);
  },
  
  async recordDistilleryScrape(distillery: Distillery, spiritsFound: number, spiritsStored: number, apiCallsUsed: number, spiritTypes: string[]) {
    if (!_instance) _instance = new DistilleryScrapeTracker();
    return _instance.recordDistilleryScrape(distillery, spiritsFound, spiritsStored, apiCallsUsed, spiritTypes);
  },
  
  async getDistilleryRecord(distilleryName: string) {
    if (!_instance) _instance = new DistilleryScrapeTracker();
    return _instance.getDistilleryRecord(distilleryName);
  },
  
  async clearAllTracking() {
    if (!_instance) _instance = new DistilleryScrapeTracker();
    return _instance.clearAllTracking();
  }
};