import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from 'redis';
import { Redis } from '@upstash/redis';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
export class CacheService {
    cacheDir;
    initialized = false;
    bypassCache = false;
    redisClient = null;
    upstashClient = null;
    useRedis = false;
    useUpstash = false;
    metrics = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        hitRate: 0,
    };
    constructor(cacheDir = './cache') {
        this.cacheDir = cacheDir;
    }
    setBypassMode(bypass) {
        this.bypassCache = bypass;
        if (bypass) {
            logger.info('⚡ Cache bypass mode enabled - forcing fresh API calls');
        }
    }
    getBypassMode() {
        return this.bypassCache;
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Initialize file-based cache directory
            await fs.mkdir(this.cacheDir, { recursive: true });
            // Initialize Redis if configured
            if (config.redis) {
                // Try Upstash REST API first
                if (config.redis.upstashUrl && config.redis.upstashToken) {
                    try {
                        this.upstashClient = new Redis({
                            url: config.redis.upstashUrl,
                            token: config.redis.upstashToken,
                        });
                        // Test connection with a simple ping
                        await this.upstashClient.ping();
                        this.useUpstash = true;
                        logger.info('Upstash Redis REST API initialized successfully');
                    }
                    catch (upstashError) {
                        logger.warn('Failed to initialize Upstash Redis, trying regular Redis:', upstashError);
                        this.useUpstash = false;
                        this.upstashClient = null;
                    }
                }
                // Fall back to regular Redis if Upstash failed and we have a Redis URL
                if (!this.useUpstash && config.redis.url) {
                    try {
                        this.redisClient = createClient({
                            url: config.redis.url,
                            username: config.redis.username,
                            password: config.redis.password,
                            database: config.redis.database,
                            socket: {
                                reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
                            },
                        });
                        this.redisClient.on('error', (err) => {
                            logger.error('Redis client error:', err);
                        });
                        this.redisClient.on('connect', () => {
                            logger.info('Connected to Redis cache');
                        });
                        this.redisClient.on('ready', () => {
                            logger.info('Redis cache ready');
                            this.useRedis = true;
                        });
                        this.redisClient.on('end', () => {
                            logger.warn('Redis connection ended');
                            this.useRedis = false;
                        });
                        await this.redisClient.connect();
                        logger.info('Redis cache initialized successfully');
                    }
                    catch (redisError) {
                        logger.warn('Failed to initialize Redis cache, falling back to file-based cache:', redisError);
                        this.useRedis = false;
                        this.redisClient = null;
                    }
                }
            }
            this.initialized = true;
            const cacheType = this.useUpstash ? 'Upstash' : this.useRedis ? 'Redis' : 'File';
            logger.info(`Cache service initialized (${cacheType} cache ${this.useUpstash || this.useRedis ? 'enabled' : 'disabled'})`);
        }
        catch (error) {
            logger.error('Failed to initialize cache service:', error);
            throw error;
        }
    }
    getCacheFilePath(type) {
        return path.join(this.cacheDir, `${type}.json`);
    }
    generateRedisKey(type, key) {
        return `spirits-scraper:${type}:${key}`;
    }
    updateMetrics(operation) {
        this.metrics[operation === 'hit' ? 'hits' : operation === 'miss' ? 'misses' : operation === 'set' ? 'sets' : 'deletes']++;
        const total = this.metrics.hits + this.metrics.misses;
        this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;
    }
    async getMetrics() {
        return { ...this.metrics };
    }
    async resetMetrics() {
        this.metrics = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            hitRate: 0,
        };
    }
    async setRedisCache(key, data, ttlSeconds) {
        try {
            if (this.useUpstash && this.upstashClient) {
                await this.upstashClient.setex(key, ttlSeconds, JSON.stringify(data));
                this.updateMetrics('set');
                logger.debug(`Upstash cache set: ${key} (TTL: ${ttlSeconds}s)`);
            }
            else if (this.useRedis && this.redisClient) {
                await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
                this.updateMetrics('set');
                logger.debug(`Redis cache set: ${key} (TTL: ${ttlSeconds}s)`);
            }
        }
        catch (error) {
            logger.error('Failed to set cache:', error);
        }
    }
    async getRedisCache(key) {
        try {
            let data = null;
            if (this.useUpstash && this.upstashClient) {
                const result = await this.upstashClient.get(key);
                if (result !== null) {
                    logger.debug(`Upstash cache hit: ${key}`);
                    // Upstash automatically parses JSON, so the result is already an object
                    this.updateMetrics('hit');
                    return result;
                }
            }
            else if (this.useRedis && this.redisClient) {
                data = await this.redisClient.get(key);
                if (data) {
                    logger.debug(`Redis cache hit: ${key}`);
                    const entry = JSON.parse(data);
                    this.updateMetrics('hit');
                    return entry;
                }
            }
            this.updateMetrics('miss');
            return null;
        }
        catch (error) {
            logger.error('Failed to get cache:', error);
            this.updateMetrics('miss');
            return null;
        }
    }
    async deleteRedisCache(key) {
        try {
            if (this.useUpstash && this.upstashClient) {
                await this.upstashClient.del(key);
                this.updateMetrics('delete');
                logger.debug(`Upstash cache deleted: ${key}`);
            }
            else if (this.useRedis && this.redisClient) {
                await this.redisClient.del(key);
                this.updateMetrics('delete');
                logger.debug(`Redis cache deleted: ${key}`);
            }
        }
        catch (error) {
            logger.error('Failed to delete cache:', error);
        }
    }
    async loadCacheFile(type) {
        const filePath = this.getCacheFilePath(type);
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            const entries = JSON.parse(data);
            return new Map(entries);
        }
        catch {
            return new Map();
        }
    }
    async saveCacheFile(type, cache) {
        const filePath = this.getCacheFilePath(type);
        const data = JSON.stringify([...cache.entries()], null, 2);
        await fs.writeFile(filePath, data);
    }
    async cacheSearchQuery(query, options, results, customExpiry) {
        const hasResults = results?.items && results.items.length > 0;
        // Task 14.1 TTL requirements: 7 days for successful results, 2 days for empty results
        let expiry;
        let ttlSeconds;
        if (customExpiry) {
            expiry = customExpiry;
            ttlSeconds = Math.floor((customExpiry - Date.now()) / 1000);
        }
        else {
            if (hasResults) {
                expiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days for successful results
                ttlSeconds = 7 * 24 * 60 * 60; // 7 days in seconds
            }
            else {
                expiry = Date.now() + (2 * 24 * 60 * 60 * 1000); // 2 days for empty results
                ttlSeconds = 2 * 24 * 60 * 60; // 2 days in seconds
            }
        }
        const cacheKey = `${query}_${JSON.stringify(options)}`;
        const cacheEntry = {
            data: { query, options, results },
            timestamp: Date.now(),
            expiry,
            type: 'search_query'
        };
        // Try Redis first, fall back to file cache
        if (this.useUpstash || this.useRedis) {
            const redisKey = this.generateRedisKey('search_query', cacheKey);
            await this.setRedisCache(redisKey, cacheEntry, ttlSeconds);
        }
        else {
            const cache = await this.loadCacheFile('search_query');
            cache.set(cacheKey, cacheEntry);
            await this.saveCacheFile('search_query', cache);
        }
        const cacheType = this.useUpstash ? 'Upstash' : this.useRedis ? 'Redis' : 'file';
        logger.info(`Cached ${hasResults ? 'successful' : 'empty'} query results (TTL: ${hasResults ? '7 days' : '2 days'}) via ${cacheType}`);
    }
    async getCachedSearchQuery(query, options) {
        // If bypass mode is enabled, always return null to force fresh API calls
        if (this.bypassCache) {
            return null;
        }
        const cacheKey = `${query}_${JSON.stringify(options)}`;
        // Try Redis first
        if (this.useUpstash || this.useRedis) {
            const redisKey = this.generateRedisKey('search_query', cacheKey);
            const entry = await this.getRedisCache(redisKey);
            if (entry) {
                const cacheType = this.useUpstash ? 'Upstash' : 'Redis';
                logger.debug(`${cacheType} cache hit for search query: ${cacheKey}`);
                return entry.data.results;
            }
        }
        // Fall back to file cache
        const cache = await this.loadCacheFile('search_query');
        const entry = cache.get(cacheKey);
        if (!entry || Date.now() > entry.expiry) {
            if (entry) {
                cache.delete(cacheKey);
                await this.saveCacheFile('search_query', cache);
            }
            this.updateMetrics('miss');
            return null;
        }
        this.updateMetrics('hit');
        logger.debug(`File cache hit for search query: ${cacheKey}`);
        return entry.data.results;
    }
    async cacheUrlContent(url, content, customExpiry) {
        const expiry = customExpiry || Date.now() + (12 * 60 * 60 * 1000); // 12 hours default
        const ttlSeconds = Math.floor((expiry - Date.now()) / 1000);
        const cacheEntry = {
            data: content,
            timestamp: Date.now(),
            expiry,
            type: 'url_content'
        };
        // Try Redis first, fall back to file cache
        if (this.useUpstash || this.useRedis) {
            const redisKey = this.generateRedisKey('url_content', url);
            await this.setRedisCache(redisKey, cacheEntry, ttlSeconds);
        }
        else {
            const cache = await this.loadCacheFile('url_content');
            cache.set(url, cacheEntry);
            await this.saveCacheFile('url_content', cache);
        }
    }
    async getCachedUrlContent(url) {
        // If bypass mode is enabled, always return null to force fresh API calls
        if (this.bypassCache) {
            return null;
        }
        // Try Redis first
        if (this.useUpstash || this.useRedis) {
            const redisKey = this.generateRedisKey('url_content', url);
            const entry = await this.getRedisCache(redisKey);
            if (entry) {
                const cacheType = this.useUpstash ? 'Upstash' : 'Redis';
                logger.debug(`${cacheType} cache hit for URL content: ${url}`);
                return entry.data;
            }
        }
        // Fall back to file cache
        const cache = await this.loadCacheFile('url_content');
        const entry = cache.get(url);
        if (!entry || Date.now() > entry.expiry) {
            if (entry) {
                cache.delete(url);
                await this.saveCacheFile('url_content', cache);
            }
            this.updateMetrics('miss');
            return null;
        }
        this.updateMetrics('hit');
        logger.debug(`File cache hit for URL content: ${url}`);
        return entry.data;
    }
    async hasUrlContent(url) {
        // Try Redis first
        if (this.useUpstash || this.useRedis) {
            const redisKey = this.generateRedisKey('url_content', url);
            const entry = await this.getRedisCache(redisKey);
            if (entry)
                return true;
        }
        // Fall back to file cache
        const cache = await this.loadCacheFile('url_content');
        const entry = cache.get(url);
        return entry && Date.now() <= entry.expiry || false;
    }
    // Generic cache methods for other services
    async get(type, key) {
        // If bypass mode is enabled, always return null
        if (this.bypassCache) {
            return null;
        }
        // Try Redis first
        if (this.useUpstash || this.useRedis) {
            const redisKey = this.generateRedisKey(type, key);
            const entry = await this.getRedisCache(redisKey);
            if (entry) {
                const cacheType = this.useUpstash ? 'Upstash' : 'Redis';
                logger.debug(`${cacheType} cache hit for ${type}: ${key}`);
                return entry;
            }
        }
        // Fall back to file cache
        const cache = await this.loadCacheFile(type);
        const entry = cache.get(key);
        if (!entry || Date.now() > entry.expiry) {
            if (entry) {
                cache.delete(key);
                await this.saveCacheFile(type, cache);
            }
            this.updateMetrics('miss');
            return null;
        }
        this.updateMetrics('hit');
        logger.debug(`File cache hit for ${type}: ${key}`);
        return entry;
    }
    async set(type, key, data, customExpiry) {
        const expiry = customExpiry || Date.now() + (24 * 60 * 60 * 1000); // 24 hours default
        const ttlSeconds = Math.floor((expiry - Date.now()) / 1000);
        const cacheEntry = {
            data,
            timestamp: Date.now(),
            expiry,
            type
        };
        // Try Redis first, fall back to file cache
        if (this.useUpstash || this.useRedis) {
            const redisKey = this.generateRedisKey(type, key);
            await this.setRedisCache(redisKey, cacheEntry, ttlSeconds);
        }
        else {
            const cache = await this.loadCacheFile(type);
            cache.set(key, cacheEntry);
            await this.saveCacheFile(type, cache);
        }
        const cacheType = this.useUpstash ? 'Upstash' : this.useRedis ? 'Redis' : 'file';
        logger.debug(`Cached ${type} via ${cacheType}: ${key}`);
    }
    async cacheSpiritData(name, brand, data, customExpiry) {
        const expiry = customExpiry || Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days default
        const ttlSeconds = Math.floor((expiry - Date.now()) / 1000);
        const cacheKey = `${brand}_${name}`;
        const cacheEntry = {
            data,
            timestamp: Date.now(),
            expiry,
            type: 'spirit_data'
        };
        // Try Redis first, fall back to file cache
        if (this.useUpstash || this.useRedis) {
            const redisKey = this.generateRedisKey('spirit_data', cacheKey);
            await this.setRedisCache(redisKey, cacheEntry, ttlSeconds);
        }
        else {
            const cache = await this.loadCacheFile('spirit_data');
            cache.set(cacheKey, cacheEntry);
            await this.saveCacheFile('spirit_data', cache);
        }
    }
    async getCachedSpiritData(name, brand) {
        // If bypass mode is enabled, always return null to force fresh API calls
        if (this.bypassCache) {
            return null;
        }
        const cacheKey = `${brand}_${name}`;
        // Try Redis first
        if (this.useUpstash || this.useRedis) {
            const redisKey = this.generateRedisKey('spirit_data', cacheKey);
            const entry = await this.getRedisCache(redisKey);
            if (entry) {
                const cacheType = this.useUpstash ? 'Upstash' : 'Redis';
                logger.debug(`${cacheType} cache hit for spirit data: ${cacheKey}`);
                return entry.data;
            }
        }
        // Fall back to file cache
        const cache = await this.loadCacheFile('spirit_data');
        const entry = cache.get(cacheKey);
        if (!entry || Date.now() > entry.expiry) {
            if (entry) {
                cache.delete(cacheKey);
                await this.saveCacheFile('spirit_data', cache);
            }
            this.updateMetrics('miss');
            return null;
        }
        this.updateMetrics('hit');
        logger.debug(`File cache hit for spirit data: ${cacheKey}`);
        return entry.data;
    }
    async markFailedAttempt(identifier, error, retryAfterHours = 4) {
        const cache = await this.loadCacheFile('failed_attempt');
        const expiry = Date.now() + (retryAfterHours * 60 * 60 * 1000);
        cache.set(identifier, {
            data: { error, attempts: (cache.get(identifier)?.data.attempts || 0) + 1 },
            timestamp: Date.now(),
            expiry,
            type: 'failed_attempt'
        });
        await this.saveCacheFile('failed_attempt', cache);
    }
    async isFailedAttempt(identifier) {
        const cache = await this.loadCacheFile('failed_attempt');
        const entry = cache.get(identifier);
        return entry && Date.now() <= entry.expiry || false;
    }
    async clearCache(type) {
        // Clear Redis cache
        if ((this.useUpstash && this.upstashClient) || (this.useRedis && this.redisClient)) {
            try {
                let keys = [];
                if (type) {
                    // Clear specific cache type from Redis
                    const pattern = this.generateRedisKey(type, '*');
                    if (this.useUpstash && this.upstashClient) {
                        keys = await this.upstashClient.keys(pattern);
                        if (keys.length > 0) {
                            await this.upstashClient.del(...keys);
                        }
                    }
                    else if (this.useRedis && this.redisClient) {
                        keys = await this.redisClient.keys(pattern);
                        if (keys.length > 0) {
                            await this.redisClient.del(keys);
                        }
                    }
                    if (keys.length > 0) {
                        const cacheType = this.useUpstash ? 'Upstash' : 'Redis';
                        logger.info(`Cleared ${keys.length} ${cacheType} cache entries for type: ${type}`);
                    }
                }
                else {
                    // Clear all spirits-scraper cache entries from Redis using SCAN
                    const pattern = 'spirits-scraper:*';
                    if (this.useUpstash && this.upstashClient) {
                        // Use SCAN for Upstash to handle large number of keys
                        let cursor = 0;
                        let totalDeleted = 0;
                        const batchSize = 1000; // Process keys in larger batches
                        let keysToDelete = [];
                        try {
                            do {
                                const result = await this.upstashClient.scan(cursor, {
                                    match: pattern,
                                    count: batchSize
                                });
                                // Upstash returns cursor as string
                                cursor = typeof result[0] === 'string' ? parseInt(result[0], 10) : result[0];
                                const scanKeys = result[1] || [];
                                // If no keys found and cursor is 0, we're done
                                if (scanKeys.length === 0 && cursor === 0) {
                                    break;
                                }
                                keysToDelete.push(...scanKeys);
                                // Delete in batches to avoid command size limits
                                if (keysToDelete.length >= batchSize) {
                                    await this.upstashClient.del(...keysToDelete);
                                    totalDeleted += keysToDelete.length;
                                    keysToDelete = [];
                                }
                                // Safety check to prevent infinite loops
                                if (cursor === 0 && scanKeys.length === 0) {
                                    break;
                                }
                            } while (cursor !== 0 && cursor !== '0');
                            // Delete remaining keys
                            if (keysToDelete.length > 0) {
                                await this.upstashClient.del(...keysToDelete);
                                totalDeleted += keysToDelete.length;
                            }
                            if (totalDeleted > 0) {
                                logger.info(`Cleared ${totalDeleted} Upstash cache entries`);
                            }
                        }
                        catch (scanError) {
                            // If SCAN fails, fall back to clearing specific patterns
                            logger.warn('SCAN failed, falling back to pattern-based clearing:', scanError.message);
                            const patterns = [
                                'spirits-scraper:query:*',
                                'spirits-scraper:url:*',
                                'spirits-scraper:spirit:*',
                                'spirits-scraper:failed:*'
                            ];
                            for (const pat of patterns) {
                                try {
                                    const keys = await this.upstashClient.keys(pat);
                                    if (keys.length > 0) {
                                        // Delete in smaller chunks
                                        for (let i = 0; i < keys.length; i += 100) {
                                            const chunk = keys.slice(i, i + 100);
                                            await this.upstashClient.del(...chunk);
                                            totalDeleted += chunk.length;
                                        }
                                    }
                                }
                                catch (e) {
                                    logger.error(`Failed to clear pattern ${pat}:`, e);
                                }
                            }
                            if (totalDeleted > 0) {
                                logger.info(`Cleared ${totalDeleted} Upstash cache entries using fallback method`);
                            }
                        }
                    }
                    else if (this.useRedis && this.redisClient) {
                        keys = await this.redisClient.keys(pattern);
                        if (keys.length > 0) {
                            await this.redisClient.del(keys);
                            logger.info(`Cleared ${keys.length} Redis cache entries`);
                        }
                    }
                }
            }
            catch (error) {
                logger.error('Error clearing cache:', error);
            }
        }
        // Clear file cache
        if (type) {
            const filePath = this.getCacheFilePath(type);
            try {
                await fs.unlink(filePath);
                logger.info(`Cleared file cache for type: ${type}`);
            }
            catch {
                // File might not exist
            }
        }
        else {
            try {
                const files = await fs.readdir(this.cacheDir);
                await Promise.all(files.map(file => fs.unlink(path.join(this.cacheDir, file))));
                logger.info('Cleared all file cache entries');
            }
            catch (error) {
                logger.error('Error clearing file cache:', error);
            }
        }
        // Reset metrics when clearing cache
        await this.resetMetrics();
    }
    async disconnect() {
        if (this.redisClient) {
            try {
                await this.redisClient.quit();
                logger.info('Redis connection closed');
            }
            catch (error) {
                logger.error('Error closing Redis connection:', error);
            }
            this.redisClient = null;
            this.useRedis = false;
        }
        if (this.upstashClient) {
            // Upstash REST client doesn't need explicit disconnection
            logger.info('Upstash connection closed');
            this.upstashClient = null;
            this.useUpstash = false;
        }
    }
    async cleanup() {
        const types = ['search_query', 'url_content', 'spirit_data', 'failed_attempt'];
        let totalRemoved = 0;
        let totalKept = 0;
        for (const type of types) {
            const cache = await this.loadCacheFile(type);
            const now = Date.now();
            let removed = 0;
            for (const [key, entry] of cache.entries()) {
                if (now > entry.expiry) {
                    cache.delete(key);
                    removed++;
                }
            }
            await this.saveCacheFile(type, cache);
            totalRemoved += removed;
            totalKept += cache.size;
        }
        return { removed: totalRemoved, kept: totalKept };
    }
    /**
     * Generic get method for custom cache entries
     */
    async get(key, type = 'custom') {
        // If bypass mode is enabled, always return null
        if (this.bypassCache) {
            return null;
        }
        // Try Redis first
        if (this.useUpstash || this.useRedis) {
            const redisKey = this.generateRedisKey(type, key);
            const entry = await this.getRedisCache(redisKey);
            if (entry) {
                const cacheType = this.useUpstash ? 'Upstash' : 'Redis';
                logger.debug(`${cacheType} cache hit for ${type}: ${key}`);
                return entry;
            }
        }
        // Fall back to file cache
        const cache = await this.loadCacheFile(type);
        const entry = cache.get(key);
        if (!entry || Date.now() > entry.expiry) {
            if (entry) {
                cache.delete(key);
                await this.saveCacheFile(type, cache);
            }
            this.updateMetrics('miss');
            return null;
        }
        this.updateMetrics('hit');
        logger.debug(`File cache hit for ${type}: ${key}`);
        return entry;
    }
    /**
     * Generic set method for custom cache entries
     */
    async set(key, data, ttlMs = 24 * 60 * 60 * 1000, type = 'custom') {
        const expiry = Date.now() + ttlMs;
        const ttlSeconds = Math.floor(ttlMs / 1000);
        const cacheEntry = {
            data,
            timestamp: Date.now(),
            expiry,
            type
        };
        // Try Redis first, fall back to file cache
        if (this.useUpstash || this.useRedis) {
            const redisKey = this.generateRedisKey(type, key);
            await this.setRedisCache(redisKey, cacheEntry, ttlSeconds);
        }
        else {
            const cache = await this.loadCacheFile(type);
            cache.set(key, cacheEntry);
            await this.saveCacheFile(type, cache);
        }
        const cacheType = this.useUpstash ? 'Upstash' : this.useRedis ? 'Redis' : 'file';
        logger.debug(`Cached ${type} data (TTL: ${ttlMs}ms) via ${cacheType}`);
    }
    async getStats() {
        const types = ['search_query', 'url_content', 'spirit_data', 'failed_attempt'];
        let totalEntries = 0;
        let sizeBytes = 0;
        let oldestEntry = Date.now();
        let newestEntry = 0;
        const byType = {};
        // Get Redis stats if available
        if ((this.useUpstash && this.upstashClient) || (this.useRedis && this.redisClient)) {
            try {
                for (const type of types) {
                    const pattern = this.generateRedisKey(type, '*');
                    let keys = [];
                    if (this.useUpstash && this.upstashClient) {
                        keys = await this.upstashClient.keys(pattern);
                    }
                    else if (this.useRedis && this.redisClient) {
                        keys = await this.redisClient.keys(pattern);
                    }
                    const typeCount = keys.length;
                    totalEntries += typeCount;
                    byType[type] = typeCount;
                }
                const cacheType = this.useUpstash ? 'Upstash' : 'Redis';
                logger.debug(`${cacheType} cache contains ${totalEntries} total entries`);
            }
            catch (error) {
                logger.error('Error getting cache stats:', error);
            }
        }
        // Get file cache stats as fallback or supplement
        for (const type of types) {
            const cache = await this.loadCacheFile(type);
            if (!this.useUpstash && !this.useRedis) {
                // Only count file cache if Redis is not being used
                const typeCount = cache.size;
                totalEntries += typeCount;
                byType[type] = (byType[type] || 0) + typeCount;
            }
            // Calculate approximate size from files
            const filePath = this.getCacheFilePath(type);
            try {
                const stats = await fs.stat(filePath);
                sizeBytes += stats.size;
            }
            catch {
                // File might not exist
            }
            // Find oldest and newest entries from file cache
            for (const entry of cache.values()) {
                if (entry.timestamp < oldestEntry)
                    oldestEntry = entry.timestamp;
                if (entry.timestamp > newestEntry)
                    newestEntry = entry.timestamp;
            }
        }
        return {
            totalEntries,
            sizeBytes,
            oldestEntry: totalEntries > 0 ? oldestEntry : Date.now(),
            newestEntry: totalEntries > 0 ? newestEntry : Date.now(),
            byType,
            redisEnabled: this.useUpstash || this.useRedis,
            cacheType: this.useUpstash ? 'Upstash' : this.useRedis ? 'Redis' : 'File',
            metrics: await this.getMetrics(),
        };
    }
}
// Singleton instance
export const cacheService = new CacheService();
