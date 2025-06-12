/**
 * Scrape Session Tracker
 *
 * Tracks which spirits have been scraped for each category to prevent
 * redundant API calls and processing when re-running the same category.
 */
import { cacheService } from './cache-service.js';
import { logger } from '../utils/logger.js';
import { supabaseStorage } from './supabase-storage.js';
export class ScrapeSessionTracker {
    sessions = new Map();
    CACHE_KEY_PREFIX = 'scrape_session';
    SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours
    /**
     * Load session data from cache
     */
    async loadSession(category) {
        try {
            const cacheKey = `${this.CACHE_KEY_PREFIX}_${category}`;
            const cached = await cacheService.get(cacheKey, 'scrape_session');
            if (cached && cached.data) {
                // Convert stored array back to Set
                const session = cached.data;
                session.storedSpiritKeys = new Set(session.storedSpiritKeys);
                this.sessions.set(category, session);
                return session;
            }
        }
        catch (error) {
            logger.error(`Error loading scrape session for ${category}:`, error);
        }
        return null;
    }
    /**
     * Save session data to cache
     */
    async saveSession(category) {
        const session = this.sessions.get(category);
        if (!session)
            return;
        try {
            const cacheKey = `${this.CACHE_KEY_PREFIX}_${category}`;
            // Convert Set to Array for storage
            const sessionData = {
                ...session,
                storedSpiritKeys: Array.from(session.storedSpiritKeys)
            };
            await cacheService.set(cacheKey, sessionData, this.SESSION_TTL, 'scrape_session');
        }
        catch (error) {
            logger.error(`Error saving scrape session for ${category}:`, error);
        }
    }
    /**
     * Check if we should skip this category based on previous session
     */
    async shouldSkipCategory(category, requestedLimit) {
        const session = await this.loadSession(category);
        if (!session) {
            return { skip: false };
        }
        // Check if session is recent (within last 24 hours)
        const sessionAge = Date.now() - session.lastScrapedAt;
        const isRecent = sessionAge < this.SESSION_TTL;
        if (isRecent && session.spiritsStored >= requestedLimit) {
            return {
                skip: true,
                reason: `Already scraped ${session.spiritsStored} ${category} spirits (limit: ${requestedLimit}) ${this.formatTimeAgo(sessionAge)} ago`,
                existingCount: session.spiritsStored
            };
        }
        // Check database for actual count in case session is outdated
        try {
            const dbCount = await this.getDatabaseSpiritCount(category);
            if (dbCount >= requestedLimit) {
                return {
                    skip: true,
                    reason: `Database already contains ${dbCount} ${category} spirits (limit: ${requestedLimit})`,
                    existingCount: dbCount
                };
            }
        }
        catch (error) {
            logger.error('Error checking database spirit count:', error);
        }
        return { skip: false };
    }
    /**
     * Initialize a new scraping session
     */
    initSession(category) {
        const session = {
            category,
            spiritsFound: 0,
            spiritsStored: 0,
            storedSpiritKeys: new Set(),
            lastScrapedAt: Date.now(),
            queries: []
        };
        this.sessions.set(category, session);
        return session;
    }
    /**
     * Check if a spirit was already stored in this or previous sessions
     */
    async isAlreadyStored(category, spiritKey) {
        const session = this.sessions.get(category);
        // Check current session
        if (session && session.storedSpiritKeys.has(spiritKey)) {
            return true;
        }
        // Check previous session from cache
        const previousSession = await this.loadSession(category);
        if (previousSession && previousSession.storedSpiritKeys.has(spiritKey)) {
            // Add to current session to avoid repeated lookups
            if (session) {
                session.storedSpiritKeys.add(spiritKey);
            }
            return true;
        }
        return false;
    }
    /**
     * Record that a spirit was found
     */
    recordSpiritFound(category) {
        const session = this.sessions.get(category);
        if (session) {
            session.spiritsFound++;
        }
    }
    /**
     * Record that a spirit was successfully stored
     */
    recordSpiritStored(category, spiritKey) {
        const session = this.sessions.get(category);
        if (session) {
            session.spiritsStored++;
            session.storedSpiritKeys.add(spiritKey);
        }
    }
    /**
     * Record that a query was processed
     */
    recordQuery(category, query) {
        const session = this.sessions.get(category);
        if (session && !session.queries.includes(query)) {
            session.queries.push(query);
        }
    }
    /**
     * Get session stats for logging
     */
    getSessionStats(category) {
        const session = this.sessions.get(category);
        if (!session)
            return null;
        return {
            spiritsFound: session.spiritsFound,
            spiritsStored: session.spiritsStored,
            uniqueSpirits: session.storedSpiritKeys.size,
            queriesProcessed: session.queries.length,
            sessionDuration: Date.now() - session.lastScrapedAt
        };
    }
    /**
     * Clear session for a category
     */
    async clearSession(category) {
        this.sessions.delete(category);
        const cacheKey = `${this.CACHE_KEY_PREFIX}_${category}`;
        await cacheService.set(cacheKey, null, 1, 'scrape_session'); // Expire immediately
    }
    /**
     * Get actual spirit count from database
     */
    async getDatabaseSpiritCount(category) {
        try {
            return await supabaseStorage.getSpiritCountByCategory(category);
        }
        catch (error) {
            logger.error('Error getting database spirit count:', error);
            return 0;
        }
    }
    /**
     * Format time ago for display
     */
    formatTimeAgo(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        }
        else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
        else {
            return `${seconds} second${seconds > 1 ? 's' : ''}`;
        }
    }
}
// Singleton instance
export const scrapeSessionTracker = new ScrapeSessionTracker();
