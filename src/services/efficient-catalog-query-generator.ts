import { logger } from '../utils/logger';

export interface CatalogQuery {
  query: string;
  expectedYield: number; // Expected number of products from this query
  priority: number; // 1-10, higher = more important
}

export class EfficientCatalogQueryGenerator {
  private static readonly PRIORITY_SITES = [
    { domain: 'totalwine.com', yield: 100 },
    { domain: 'thewhiskyexchange.com', yield: 80 },
    { domain: 'wine.com', yield: 60 },
    { domain: 'klwines.com', yield: 50 },
    { domain: 'masterofmalt.com', yield: 40 },
    { domain: 'flaviar.com', yield: 30 },
    { domain: 'reservebar.com', yield: 30 },
    { domain: 'drizly.com', yield: 40 },
    { domain: 'caskcartel.com', yield: 35 },
    { domain: 'seelbachs.com', yield: 25 }
  ];

  private static readonly CATALOG_PATTERNS = [
    // High-yield patterns (find listing/catalog pages)
    'site:{site} {category} whiskey spirits "view all"',
    'site:{site} {category} bourbon collection catalog',
    'site:{site} shop {category} online 750ml',
    'site:{site}/{category}-whiskey/s?',  // URL pattern for category pages
    'site:{site} {category} "products" "sort by" "price"',
    'site:{site} {category} bottles "page 1" "results"',
    'site:{site} browse {category} whiskey spirits',
    
    // Multi-product patterns
    'site:{site} {category} "showing 1" "products"',
    'site:{site} {category} whiskey "items found"',
    'site:{site} {category} spirits inventory list'
  ];

  private static readonly MULTI_SITE_PATTERNS = [
    '{category} whiskey "view all products" online shop',
    '{category} bourbon catalog "sort by" price -reddit -facebook',
    'buy {category} whiskey online 750ml "products" -amazon',
    '{category} spirits collection "page 1" -blog -review',
    '{category} whiskey inventory list bottles -social'
  ];

  private static readonly EXCLUDED_SITES = [
    'reddit.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'pinterest.com', 'youtube.com', 'tiktok.com', 'linkedin.com',
    'amazon.com', 'ebay.com', 'etsy.com', 'walmart.com',
    'blog', 'news', 'article', 'review', 'forum'
  ];

  /**
   * Generate efficient catalog queries that return pages with many products
   */
  static generateCatalogQueries(category: string, limit: number = 50): CatalogQuery[] {
    const queries: CatalogQuery[] = [];
    const normalizedCategory = category.toLowerCase();
    
    // Priority 1: Direct catalog URLs for major sites
    this.PRIORITY_SITES.slice(0, 5).forEach(site => {
      const catalogUrls = this.generateCatalogUrls(site.domain, normalizedCategory);
      catalogUrls.forEach(url => {
        queries.push({
          query: url,
          expectedYield: site.yield,
          priority: 10
        });
      });
    });

    // Priority 2: Site-specific catalog searches
    this.PRIORITY_SITES.forEach(site => {
      this.CATALOG_PATTERNS.slice(0, 3).forEach(pattern => {
        const query = pattern
          .replace('{site}', site.domain)
          .replace('{category}', normalizedCategory);
        
        queries.push({
          query: this.addExclusions(query),
          expectedYield: site.yield,
          priority: 8
        });
      });
    });

    // Priority 3: Multi-site catalog searches
    this.MULTI_SITE_PATTERNS.forEach(pattern => {
      const query = pattern.replace('{category}', normalizedCategory);
      queries.push({
        query: this.addExclusions(query),
        expectedYield: 50, // Average across sites
        priority: 6
      });
    });

    // Sort by priority and expected yield
    queries.sort((a, b) => {
      const priorityDiff = b.priority - a.priority;
      return priorityDiff !== 0 ? priorityDiff : b.expectedYield - a.expectedYield;
    });

    // Return only the most efficient queries
    const topQueries = queries.slice(0, limit);
    
    logger.info(`Generated ${topQueries.length} efficient catalog queries for ${category}`);
    logger.info(`Expected total yield: ${topQueries.reduce((sum, q) => sum + q.expectedYield, 0)} spirits`);
    
    return topQueries;
  }

  /**
   * Generate direct catalog URLs for known site structures
   */
  private static generateCatalogUrls(domain: string, category: string): string[] {
    const urls: string[] = [];
    
    switch (domain) {
      case 'totalwine.com':
        urls.push(
          `site:totalwine.com/spirits-wine/american-whiskey/${category}`,
          `site:totalwine.com/spirits-wine/bourbon/c/000013`,
          `site:totalwine.com/spirits-wine/whiskey/c`
        );
        break;
        
      case 'thewhiskyexchange.com':
        urls.push(
          `site:thewhiskyexchange.com/c/33/american-whiskey`,
          `site:thewhiskyexchange.com/c/304/${category}`,
          `site:thewhiskyexchange.com/search?q=${category}`
        );
        break;
        
      case 'wine.com':
        urls.push(
          `site:wine.com/list/wine/bourbon/7155-135`,
          `site:wine.com/spirits/${category}`,
          `site:wine.com/list/spirits/${category}`
        );
        break;
        
      case 'klwines.com':
        urls.push(
          `site:klwines.com/Products?filters=sv2_36!224`,
          `site:klwines.com/Products/${category}`,
          `site:klwines.com/Spirits/${category}`
        );
        break;
        
      case 'masterofmalt.com':
        urls.push(
          `site:masterofmalt.com/bourbon-whiskey/`,
          `site:masterofmalt.com/american-whiskey/`,
          `site:masterofmalt.com/whisky/american/${category}`
        );
        break;
    }
    
    return urls;
  }

  /**
   * Add exclusions to avoid non-product pages
   */
  private static addExclusions(query: string): string {
    const exclusions = this.EXCLUDED_SITES.map(site => `-site:${site}`).join(' ');
    return `${query} ${exclusions}`;
  }

  /**
   * Generate a small set of extremely high-yield queries
   */
  static generateTopCatalogQueries(category: string, count: number = 10): string[] {
    const queries = this.generateCatalogQueries(category, count);
    return queries.map(q => q.query);
  }

  /**
   * Estimate total spirits yield from a set of queries
   */
  static estimateTotalYield(queries: CatalogQuery[]): number {
    return queries.reduce((total, query) => total + query.expectedYield, 0);
  }
}