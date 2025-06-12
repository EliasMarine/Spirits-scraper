import axios from 'axios';
import { config } from '../config/index.js';
import { getSearchExclusions, getReviewExclusions, isExcludedDomain } from '../config/excluded-domains.js';
import { isReputableDomain } from '../config/reputable-domains.js';
import { cacheService } from './cache-service.js';
import { apiCallTracker } from './api-call-tracker.js';
import { logger } from '../utils/logger.js';
export class GoogleSearchClient {
    client;
    apiKey;
    searchEngineId;
    requestCount = 0;
    requestTimestamps = [];
    constructor() {
        this.apiKey = config.googleApiKey;
        this.searchEngineId = config.searchEngineId;
        this.client = axios.create({
            baseURL: 'https://www.googleapis.com/customsearch/v1',
            timeout: 30000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Spirits-Scraper/1.0',
            },
        });
    }
    /**
     * Check if we're within rate limits
     */
    async checkRateLimit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        // Remove timestamps older than 1 minute
        this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
        // Check if we've exceeded rate limit
        if (this.requestTimestamps.length >= config.rateLimitPerMinute) {
            const oldestTimestamp = this.requestTimestamps[0];
            const waitTime = 60000 - (now - oldestTimestamp) + 1000; // Add 1s buffer
            if (waitTime > 0) {
                // Use logger instead of console.log
                // Rate limit notification handled by caller if needed
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        // Record this request
        this.requestTimestamps.push(now);
        this.requestCount++;
    }
    /**
     * Search for spirits using Google Custom Search API
     */
    async search(options) {
        // Initialize cache service if not already done
        await cacheService.initialize();
        // Check cache first
        const cachedResults = await cacheService.getCachedSearchQuery(options.query, options);
        if (cachedResults) {
            logger.info(`Cache hit for query: "${options.query}"`);
            return cachedResults;
        }
        logger.info(`Cache miss for query: "${options.query}" - making API call`);
        await this.checkRateLimit();
        try {
            // Get exclusions from centralized config
            const domainExclusions = getSearchExclusions();
            const reviewExclusions = getReviewExclusions();
            // Append all exclusions to query
            const modifiedQuery = `${options.query} ${domainExclusions} ${reviewExclusions}`.trim();
            // Check if we're in cache-only mode
            if (process.env.CACHE_ONLY_MODE === 'true') {
                logger.info('Cache-only mode - skipping API call');
                throw new Error('Cache-only mode enabled - no API calls allowed');
            }
            // CRITICAL FIX: Check API limit BEFORE making the call
            if (apiCallTracker.isAPILimitReached()) {
                const currentStats = apiCallTracker.getStats();
                logger.error(`🚫 API limit reached: ${currentStats.totalCalls}/${currentStats.dailyLimit} calls used`);
                throw new Error(`Daily API limit of ${currentStats.dailyLimit} calls has been reached. Please try again tomorrow.`);
            }
            const params = {
                key: this.apiKey,
                cx: this.searchEngineId,
                q: modifiedQuery,
                start: options.start || 1,
                num: options.num || 10,
                ...(options.dateRestrict && { dateRestrict: options.dateRestrict }),
                ...(options.exactTerms && { exactTerms: options.exactTerms }),
                ...(options.excludeTerms && { excludeTerms: options.excludeTerms }),
                ...(options.siteSearch && {
                    siteSearch: options.siteSearch,
                    siteSearchFilter: options.siteSearchFilter || 'i',
                }),
            };
            const response = await this.client.get('', { params });
            // CRITICAL: Filter results to exclude non-retail domains
            if (response.data.items) {
                const originalCount = response.data.items.length;
                // Filter out excluded domains and prioritize reputable ones
                response.data.items = response.data.items.filter(item => {
                    if (isExcludedDomain(item.link)) {
                        logger.warn(`Filtering out excluded domain from results: ${item.link}`);
                        return false;
                    }
                    return true;
                });
                // Sort to prioritize reputable domains
                response.data.items.sort((a, b) => {
                    const aReputable = isReputableDomain(a.link) ? 1 : 0;
                    const bReputable = isReputableDomain(b.link) ? 1 : 0;
                    return bReputable - aReputable;
                });
                const filteredCount = response.data.items.length;
                if (filteredCount < originalCount) {
                    logger.info(`Filtered results from ${originalCount} to ${filteredCount} (removed ${originalCount - filteredCount} excluded domains)`);
                }
                // Log warning if too many non-retail results
                const retailCount = response.data.items.filter(item => isReputableDomain(item.link)).length;
                const retailPercentage = (retailCount / filteredCount) * 100;
                if (retailPercentage < 50 && filteredCount > 0) {
                    logger.warn(`Low retail percentage: ${retailPercentage.toFixed(1)}% (${retailCount}/${filteredCount}) - Consider using more site: operators`);
                }
            }
            // Track API call - estimate spirits found from results count
            const estimatedSpirits = response.data.items?.length || 0;
            apiCallTracker.recordAPICall(estimatedSpirits, options.query, true);
            // Cache the successful response
            await cacheService.cacheSearchQuery(options.query, options, response.data);
            logger.info(`Cached results for query: "${options.query}"`);
            return response.data;
        }
        catch (error) {
            // Track failed API call
            apiCallTracker.recordAPICall(0, options.query, false);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 429) {
                    throw new Error('Google API rate limit exceeded. Please try again later.');
                }
                if (error.response?.status === 403) {
                    throw new Error('Google API access forbidden. Check your API key and permissions.');
                }
                throw new Error(`Google Search API error: ${error.response?.data?.error?.message || error.message}`);
            }
            throw error;
        }
    }
    /**
     * Search with automatic pagination
     */
    async searchWithPagination(query, maxResults = 50) {
        const results = [];
        let startIndex = 1;
        const resultsPerPage = 10; // Google API max
        while (results.length < maxResults) {
            const response = await this.search({
                query,
                start: startIndex,
                num: resultsPerPage,
            });
            if (!response.items || response.items.length === 0) {
                break;
            }
            results.push(...response.items);
            // Check if there are more pages
            if (!response.queries.nextPage) {
                break;
            }
            startIndex += resultsPerPage;
            // Respect rate limits between pages
            if (results.length < maxResults) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return results.slice(0, maxResults);
    }
    /**
     * Search for spirit images
     */
    async searchImages(spiritName, brand) {
        const query = `${spiritName} ${brand || ''} bottle product image`.trim();
        const response = await this.search({
            query,
            num: 10,
            siteSearch: undefined, // Search all sites for images
        });
        const imageUrls = [];
        if (response.items) {
            for (const item of response.items) {
                // Extract image from pagemap
                if (item.pagemap?.cse_image?.[0]?.src) {
                    imageUrls.push(item.pagemap.cse_image[0].src);
                }
                // Extract from metatags
                if (item.pagemap?.metatags?.[0]) {
                    const metatags = item.pagemap.metatags[0];
                    const ogImage = metatags['og:image'] || metatags['twitter:image'];
                    if (ogImage && !imageUrls.includes(ogImage)) {
                        imageUrls.push(ogImage);
                    }
                }
            }
        }
        return imageUrls.slice(0, 5); // Return top 5 images
    }
    /**
     * Get request statistics
     */
    getStats() {
        return {
            totalRequests: this.requestCount,
            recentRequests: this.requestTimestamps.length,
            rateLimitRemaining: Math.max(0, config.rateLimitPerMinute - this.requestTimestamps.length),
        };
    }
}
// Singleton instance
export const googleSearchClient = new GoogleSearchClient();
