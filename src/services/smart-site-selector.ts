import { getAllReputableDomains, PRIORITY_DOMAINS } from '../config/reputable-domains.js';
import { logger } from '../utils/logger.js';
import { cacheService } from './cache-service.js';

interface SiteMetrics {
  domain: string;
  successRate: number;
  avgDataQuality: number;
  avgFieldsPopulated: number;
  lastUsed: Date;
  totalRequests: number;
  hasStructuredData: boolean;
  avgDescriptionLength: number;
  priceAccuracy: number;
}

interface SiteSelectionOptions {
  category?: string;
  preferStructuredData?: boolean;
  minQualityScore?: number;
  maxSitesPerQuery?: number;
  rotationInterval?: number; // Minutes between using same site
}

export class SmartSiteSelector {
  private siteMetrics: Map<string, SiteMetrics> = new Map();
  private readonly metricsKey = 'site_metrics_v1';
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  
  constructor() {
    // Don't initialize in constructor - will be done lazily
  }

  /**
   * Ensure the service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    if (!this.initPromise) {
      this.initPromise = this.initializeMetrics();
    }
    
    await this.initPromise;
  }

  /**
   * Initialize metrics for all reputable domains
   */
  private async initializeMetrics(): Promise<void> {
    try {
      // Ensure cache service is initialized
      await cacheService.initialize();
      
      // Load cached metrics
      const cached = await cacheService.get('site_metrics', this.metricsKey);
      if (cached && cached.data) {
        this.siteMetrics = new Map(Object.entries(cached.data));
        logger.info(`Loaded site metrics for ${this.siteMetrics.size} domains`);
        this.initialized = true;
        return;
      }
    } catch (error) {
      logger.warn('Failed to load cached site metrics:', error);
    }

    // Initialize with default metrics
    const allDomains = getAllReputableDomains();
    for (const domain of allDomains) {
      this.siteMetrics.set(domain, {
        domain,
        successRate: 0.5,
        avgDataQuality: 50,
        avgFieldsPopulated: 5,
        lastUsed: new Date(0),
        totalRequests: 0,
        hasStructuredData: this.isPriorityDomain(domain),
        avgDescriptionLength: 100,
        priceAccuracy: 0.5
      });
    }
    
    this.initialized = true;
  }

  /**
   * Select best sites for a query based on metrics and options
   */
  async selectSitesForQuery(options: SiteSelectionOptions = {}): Promise<string[]> {
    await this.ensureInitialized();
    
    const {
      category,
      preferStructuredData = true,
      minQualityScore = 60,
      maxSitesPerQuery = 5,
      rotationInterval = 30
    } = options;

    // Get all eligible sites
    const eligibleSites = await this.getEligibleSites(minQualityScore, rotationInterval);
    
    // Score and rank sites
    const scoredSites = eligibleSites.map(site => ({
      domain: site.domain,
      score: this.calculateSiteScore(site, { category, preferStructuredData })
    }));

    // Sort by score
    scoredSites.sort((a, b) => b.score - a.score);

    // Select top sites with diversity
    const selectedSites = this.selectWithDiversity(scoredSites, maxSitesPerQuery);
    
    // Update last used time
    const now = new Date();
    for (const site of selectedSites) {
      const metrics = this.siteMetrics.get(site);
      if (metrics) {
        metrics.lastUsed = now;
      }
    }

    // Save metrics
    await this.saveMetrics();

    logger.info(`Selected ${selectedSites.length} sites for query: ${selectedSites.join(', ')}`);
    return selectedSites;
  }

  /**
   * Update metrics after scraping from a site
   */
  async updateSiteMetrics(
    domain: string, 
    success: boolean, 
    dataQuality?: number,
    fieldsPopulated?: number,
    descriptionLength?: number,
    hasPrice?: boolean
  ): Promise<void> {
    await this.ensureInitialized();
    
    const metrics = this.siteMetrics.get(domain);
    if (!metrics) return;

    // Update metrics with exponential moving average
    const alpha = 0.2; // Weight for new data
    
    metrics.totalRequests++;
    metrics.successRate = (1 - alpha) * metrics.successRate + alpha * (success ? 1 : 0);
    
    if (dataQuality !== undefined) {
      metrics.avgDataQuality = (1 - alpha) * metrics.avgDataQuality + alpha * dataQuality;
    }
    
    if (fieldsPopulated !== undefined) {
      metrics.avgFieldsPopulated = (1 - alpha) * metrics.avgFieldsPopulated + alpha * fieldsPopulated;
    }
    
    if (descriptionLength !== undefined) {
      metrics.avgDescriptionLength = (1 - alpha) * metrics.avgDescriptionLength + alpha * descriptionLength;
    }
    
    if (hasPrice !== undefined) {
      metrics.priceAccuracy = (1 - alpha) * metrics.priceAccuracy + alpha * (hasPrice ? 1 : 0);
    }

    // Detect structured data from consistent high-quality results
    if (dataQuality && dataQuality > 80 && fieldsPopulated && fieldsPopulated > 8) {
      metrics.hasStructuredData = true;
    }

    // Save metrics periodically
    if (metrics.totalRequests % 10 === 0) {
      await this.saveMetrics();
    }
  }

  /**
   * Get eligible sites based on quality and rotation
   */
  private async getEligibleSites(minQuality: number, rotationMinutes: number): Promise<SiteMetrics[]> {
    const now = new Date();
    const rotationMs = rotationMinutes * 60 * 1000;
    
    const eligible: SiteMetrics[] = [];
    
    for (const [_, metrics] of this.siteMetrics) {
      // Check quality threshold
      if (metrics.avgDataQuality < minQuality && metrics.totalRequests > 5) {
        continue;
      }
      
      // Check rotation interval
      const timeSinceLastUse = now.getTime() - metrics.lastUsed.getTime();
      if (timeSinceLastUse < rotationMs && metrics.totalRequests > 0) {
        continue;
      }
      
      eligible.push(metrics);
    }
    
    // If too few eligible, relax constraints
    if (eligible.length < 3) {
      logger.warn('Too few eligible sites, relaxing rotation constraint');
      for (const [_, metrics] of this.siteMetrics) {
        if (metrics.avgDataQuality >= minQuality * 0.8) {
          eligible.push(metrics);
        }
      }
    }
    
    return eligible;
  }

  /**
   * Calculate score for a site based on metrics and preferences
   */
  private calculateSiteScore(metrics: SiteMetrics, preferences: any): number {
    let score = 0;
    
    // Base score from success rate and quality
    score += metrics.successRate * 30;
    score += (metrics.avgDataQuality / 100) * 30;
    
    // Bonus for structured data
    if (preferences.preferStructuredData && metrics.hasStructuredData) {
      score += 20;
    }
    
    // Bonus for high field population
    score += Math.min(metrics.avgFieldsPopulated * 2, 20);
    
    // Bonus for good descriptions
    if (metrics.avgDescriptionLength > 150) {
      score += 10;
    }
    
    // Bonus for price accuracy
    score += metrics.priceAccuracy * 10;
    
    // Category-specific bonuses
    if (preferences.category) {
      score += this.getCategoryBonus(metrics.domain, preferences.category);
    }
    
    // Freshness bonus (prefer sites not used recently)
    const hoursSinceUse = (Date.now() - metrics.lastUsed.getTime()) / (1000 * 60 * 60);
    if (hoursSinceUse > 24) {
      score += 5;
    }
    
    // Priority domain bonus
    if (this.isPriorityDomain(metrics.domain)) {
      score += 15;
    }
    
    return score;
  }

  /**
   * Select sites with diversity (different TLDs, regions)
   */
  private selectWithDiversity(scoredSites: {domain: string, score: number}[], maxSites: number): string[] {
    const selected: string[] = [];
    const usedTlds = new Set<string>();
    const usedRegions = new Set<string>();
    
    for (const site of scoredSites) {
      if (selected.length >= maxSites) break;
      
      const tld = this.getTld(site.domain);
      const region = this.getRegion(site.domain);
      
      // Prefer diversity in TLDs and regions
      if (selected.length > 0 && (usedTlds.has(tld) || usedRegions.has(region))) {
        // Skip if we already have similar sites, unless score is very high
        if (site.score < scoredSites[0].score * 0.8) {
          continue;
        }
      }
      
      selected.push(site.domain);
      usedTlds.add(tld);
      usedRegions.add(region);
    }
    
    // Fill remaining slots if needed
    while (selected.length < maxSites && selected.length < scoredSites.length) {
      const nextSite = scoredSites[selected.length];
      if (!selected.includes(nextSite.domain)) {
        selected.push(nextSite.domain);
      }
    }
    
    return selected;
  }

  /**
   * Get category-specific bonus for certain sites
   */
  private getCategoryBonus(domain: string, category: string): number {
    const categoryBonuses: Record<string, Record<string, number>> = {
      bourbon: {
        'breakingbourbon.com': 10,
        'bourbonculture.com': 8,
        'thewhiskeywash.com': 5,
        'gobourbon.com': 5
      },
      scotch: {
        'thewhiskyexchange.com': 10,
        'masterofmalt.com': 10,
        'whiskyshop.com': 8,
        'royalmilewhiskies.com': 8
      },
      tequila: {
        'tequilamatchmaker.com': 15,
        'oldtowntequila.com': 10,
        'tequila.net': 8
      },
      rum: {
        'therumhowlerblog.com': 8,
        'ministryofrum.com': 8,
        'rumratings.com': 5
      }
    };
    
    const bonuses = categoryBonuses[category.toLowerCase()];
    if (bonuses && bonuses[domain]) {
      return bonuses[domain];
    }
    
    return 0;
  }

  /**
   * Helper methods
   */
  private isPriorityDomain(domain: string): boolean {
    return PRIORITY_DOMAINS.includes(domain);
  }

  private getTld(domain: string): string {
    const parts = domain.split('.');
    return parts[parts.length - 1];
  }

  private getRegion(domain: string): string {
    if (domain.endsWith('.uk') || domain.includes('whiskyexchange')) return 'UK';
    if (domain.endsWith('.eu') || domain.endsWith('.de') || domain.endsWith('.fr')) return 'EU';
    if (domain.endsWith('.ca')) return 'CA';
    if (domain.endsWith('.au')) return 'AU';
    return 'US';
  }

  /**
   * Save metrics to cache
   */
  private async saveMetrics(): Promise<void> {
    try {
      const metricsObject: Record<string, SiteMetrics> = {};
      for (const [domain, metrics] of this.siteMetrics) {
        metricsObject[domain] = metrics;
      }
      
      await cacheService.set('site_metrics', this.metricsKey, metricsObject, Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    } catch (error) {
      logger.error('Failed to save site metrics:', error);
    }
  }

  /**
   * Get metrics report for analysis
   */
  async getMetricsReport(): Promise<{topPerformers: SiteMetrics[], poorPerformers: SiteMetrics[], summary: any}> {
    await this.ensureInitialized();
    
    const allMetrics = Array.from(this.siteMetrics.values())
      .filter(m => m.totalRequests > 0)
      .sort((a, b) => b.avgDataQuality - a.avgDataQuality);
    
    return {
      topPerformers: allMetrics.slice(0, 10),
      poorPerformers: allMetrics.slice(-10).reverse(),
      summary: {
        totalSites: this.siteMetrics.size,
        sitesUsed: allMetrics.length,
        avgQuality: allMetrics.reduce((sum, m) => sum + m.avgDataQuality, 0) / allMetrics.length,
        sitesWithStructuredData: allMetrics.filter(m => m.hasStructuredData).length
      }
    };
  }
}

// Export singleton instance
export const smartSiteSelector = new SmartSiteSelector();