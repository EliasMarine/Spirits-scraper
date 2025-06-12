import { GoogleSearchClient } from './google-search';
import { SupabaseStorage } from './supabase-storage';
import { TextProcessor } from './text-processor';
import { detectSpiritType } from '../config/spirit-types';
import { logger } from '../utils/logger';
import { createMultipleKeys } from './normalization-keys';
import { scrapeSessionTracker } from './scrape-session-tracker';
// Enhanced price extraction will be integrated after compilation
import axios from 'axios';
import * as cheerio from 'cheerio';
export class UltraEfficientScraper {
    googleClient;
    storage;
    metrics = {
        apiCalls: 0,
        spiritsFound: 0,
        spiritsStored: 0,
        efficiency: 0,
        catalogPagesFound: 0,
        averageSpiritsPerCatalog: 0,
        topPerformingQueries: []
    };
    constructor() {
        this.googleClient = new GoogleSearchClient();
        this.storage = new SupabaseStorage();
    }
    /**
     * Main scraping method optimized for 60%+ efficiency
     */
    async scrapeWithUltraEfficiency(options) {
        const { category, limit, targetEfficiency = 60, deepExtraction = true } = options;
        logger.info(`🚀 Ultra-Efficient Scraping Mode - Target: ${targetEfficiency}% efficiency`);
        // Check if we should skip this category entirely
        const skipCheck = await scrapeSessionTracker.shouldSkipCategory(category, limit);
        if (skipCheck.skip) {
            logger.info(`📊 ${skipCheck.reason}`);
            logger.info(`✅ Skipping API calls - requirement already satisfied`);
            // Return metrics showing we already have enough
            return {
                apiCalls: 0,
                spiritsFound: skipCheck.existingCount || 0,
                spiritsStored: skipCheck.existingCount || 0,
                efficiency: 0,
                catalogPagesFound: 0,
                averageSpiritsPerCatalog: 0,
                topPerformingQueries: []
            };
        }
        // Initialize new session
        const session = scrapeSessionTracker.initSession(category);
        // Reset metrics
        this.metrics = {
            apiCalls: 0,
            spiritsFound: 0,
            spiritsStored: 0,
            efficiency: 0,
            catalogPagesFound: 0,
            averageSpiritsPerCatalog: 0,
            topPerformingQueries: []
        };
        const processedSpirits = new Set();
        const catalogUrls = new Set();
        // Generate ultra-efficient queries
        const queries = this.generateUltraEfficientQueries(category);
        for (const query of queries) {
            // Check if we've found enough spirits
            if (this.metrics.spiritsFound >= limit) {
                logger.info(`📊 Found ${this.metrics.spiritsFound} spirits - reached target limit`);
                break;
            }
            // Also check API call limit (max 100 per day)
            if (this.metrics.apiCalls >= 100) {
                logger.info('📊 Reached daily API call limit (100)');
                break;
            }
            try {
                logger.info(`\n🔍 Query ${this.metrics.apiCalls + 1}: ${query}`);
                // Track this query in the session
                scrapeSessionTracker.recordQuery(category, query);
                const searchResults = await this.googleClient.search({ query });
                this.metrics.apiCalls++;
                if (!searchResults.items || searchResults.items.length === 0) {
                    logger.warn('No results found');
                    continue;
                }
                let queryYield = 0;
                // Process each search result
                for (const result of searchResults.items) {
                    // Skip if already processed
                    if (catalogUrls.has(result.link))
                        continue;
                    catalogUrls.add(result.link);
                    // Check if this is a catalog page
                    if (this.isCatalogPage(result)) {
                        this.metrics.catalogPagesFound++;
                        logger.info(`  📑 Found catalog page: ${result.title}`);
                    }
                    // Always extract from search result metadata (more efficient than fetching pages)
                    const spirits = this.extractSpiritsFromSearchResult(result, category);
                    // Only process if we actually found spirits with names
                    const validSpirits = spirits.filter(s => s.name && s.name.length > 5 && !s.name.toLowerCase().includes('best local price'));
                    for (const spirit of validSpirits) {
                        const key = this.createSpiritKey(spirit);
                        if (!processedSpirits.has(key)) {
                            processedSpirits.add(key);
                            // Check if already stored in a previous session
                            const alreadyStored = await scrapeSessionTracker.isAlreadyStored(category, key);
                            if (alreadyStored) {
                                logger.debug(`⏭️ Skipping already stored: ${spirit.name}`);
                                continue;
                            }
                            this.metrics.spiritsFound++;
                            scrapeSessionTracker.recordSpiritFound(category);
                            queryYield++;
                            // Add the search result URL as source
                            spirit.source_url = spirit.source_url || result.link;
                            const stored = await this.storeSpirit(spirit);
                            if (stored) {
                                this.metrics.spiritsStored++;
                                scrapeSessionTracker.recordSpiritStored(category, key);
                                logger.info(`✅ Stored: ${spirit.name} (${spirit.price ? '$' + spirit.price : 'no price'})`);
                            }
                            else {
                                logger.warn(`❌ Failed to store: ${spirit.name}`);
                            }
                        }
                    }
                }
                // Track query performance
                const queryEfficiency = this.metrics.apiCalls > 0 ? queryYield : 0;
                this.metrics.topPerformingQueries.push({
                    query,
                    spiritsYield: queryYield,
                    efficiency: queryEfficiency
                });
                // Calculate current efficiency
                this.metrics.efficiency = this.metrics.spiritsFound / this.metrics.apiCalls;
                logger.info(`📊 Current efficiency: ${this.metrics.efficiency.toFixed(1)} spirits/API call`);
                // If we're exceeding target efficiency, we can be more aggressive
                if (this.metrics.efficiency >= targetEfficiency / 100) {
                    logger.info(`🎯 Exceeding target efficiency! Current: ${this.metrics.efficiency.toFixed(1)} spirits/call`);
                }
            }
            catch (error) {
                logger.error(`Error processing query: ${error}`);
            }
            // Rate limiting
            await this.delay(1000);
        }
        // Calculate final metrics
        this.metrics.efficiency = this.metrics.apiCalls > 0
            ? this.metrics.spiritsFound / this.metrics.apiCalls
            : 0;
        this.metrics.averageSpiritsPerCatalog = this.metrics.catalogPagesFound > 0
            ? this.metrics.spiritsFound / this.metrics.catalogPagesFound
            : 0;
        // Sort top queries by efficiency
        this.metrics.topPerformingQueries.sort((a, b) => b.efficiency - a.efficiency);
        this.metrics.topPerformingQueries = this.metrics.topPerformingQueries.slice(0, 10);
        this.logFinalMetrics();
        // Save the session for future reference
        await scrapeSessionTracker.saveSession(category);
        // Log session stats
        const sessionStats = scrapeSessionTracker.getSessionStats(category);
        if (sessionStats) {
            logger.info(`📝 Session tracked: ${sessionStats.spiritsStored} spirits stored, ${sessionStats.uniqueSpirits} unique keys`);
        }
        return this.metrics;
    }
    /**
     * Generate queries specifically designed for maximum yield
     */
    generateUltraEfficientQueries(category) {
        const queries = [];
        // Map categories to popular distilleries/brands for better results
        const categoryDistilleries = {
            'bourbon': ['Buffalo Trace', 'Wild Turkey', 'Four Roses', 'Heaven Hill', 'Jim Beam', 'Maker\'s Mark'],
            'whiskey': ['Jack Daniel\'s', 'Jameson', 'Crown Royal', 'Bushmills', 'Redbreast'],
            'scotch': ['Glenfiddich', 'Macallan', 'Glenlivet', 'Ardbeg', 'Highland Park'],
            'rye': ['WhistlePig', 'Bulleit Rye', 'High West', 'Sazerac', 'Rittenhouse'],
            'tequila': ['Patron', 'Don Julio', 'Casamigos', 'Espolon', 'Herradura'],
            'rum': ['Bacardi', 'Captain Morgan', 'Mount Gay', 'Plantation', 'Appleton'],
            'gin': ['Tanqueray', 'Bombay', 'Hendrick\'s', 'Beefeater', 'Aviation'],
            'vodka': ['Grey Goose', 'Absolut', 'Belvedere', 'Ketel One', 'Tito\'s']
        };
        const distilleries = categoryDistilleries[category.toLowerCase()] || [category];
        const spiritType = category.toLowerCase();
        // Simplified exclusions - only critical ones
        const simpleExclusions = '-reddit -facebook -twitter -youtube';
        // 1. High-yield site-specific searches (proven to work)
        for (const distillery of distilleries.slice(0, 3)) {
            queries.push(`site:totalwine.com "${distillery}" ${spiritType}`, `site:klwines.com "${distillery}" products`, `site:thewhiskyexchange.com intitle:"${distillery}"`, `site:wine.com "${distillery}" spirits`);
        }
        // 2. Multi-site searches with better patterns
        queries.push(`(site:totalwine.com OR site:klwines.com) ${spiritType} -gift -cigar ${simpleExclusions}`, `(site:thewhiskyexchange.com OR site:masterofmalt.com) "${distilleries[0]}" "${distilleries[1]}"`, `(site:wine-searcher.com OR site:flaviar.com) ${category} buy price`);
        // 3. Catalog page searches
        queries.push(`"${category} whiskey" buy online price ${simpleExclusions}`, `"products" "in stock" ${category} bottle ${simpleExclusions}`, `shop ${category} "ml" "proof" ${simpleExclusions}`);
        // 4. Specific searches for popular expressions
        if (spiritType === 'bourbon') {
            queries.push(`"single barrel" bourbon price site:totalwine.com`, `"small batch" bourbon site:klwines.com`, `"bottled in bond" bourbon buy online`);
        }
        else if (spiritType === 'scotch') {
            queries.push(`"single malt" scotch whisky site:thewhiskyexchange.com`, `"aged 12 years" scotch price`, `"highland" OR "islay" scotch buy`);
        }
        return queries.slice(0, 15); // Focus on quality over quantity
    }
    /**
     * Check if a search result is likely a catalog page
     */
    isCatalogPage(result) {
        const catalogIndicators = [
            'products found', 'items found', 'showing', 'results',
            'sort by', 'filter', 'view all', 'page 1', 'grid view',
            'collection', 'catalog', 'browse', 'shop all'
        ];
        const urlIndicators = [
            '/products', '/catalog', '/collection', '/category',
            '/shop', '/spirits/', '/whiskey/', '/bourbon/'
        ];
        const text = `${result.title} ${result.snippet}`.toLowerCase();
        const url = result.link.toLowerCase();
        const hasTextIndicator = catalogIndicators.some(ind => text.includes(ind));
        const hasUrlIndicator = urlIndicators.some(ind => url.includes(ind));
        return hasTextIndicator || hasUrlIndicator;
    }
    /**
     * Extract spirits from a catalog page by fetching and parsing HTML
     */
    async extractSpiritsFromCatalogPage(url, category) {
        const spirits = [];
        try {
            // Add user agent and other headers to avoid blocking
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 10000,
                maxRedirects: 5
            });
            const html = response.data;
            const $ = cheerio.load(html);
            // Site-specific extraction patterns
            if (url.includes('totalwine.com')) {
                spirits.push(...this.extractFromTotalWine($, category));
            }
            else if (url.includes('thewhiskyexchange.com')) {
                spirits.push(...this.extractFromWhiskyExchange($, category));
            }
            else if (url.includes('wine.com')) {
                spirits.push(...this.extractFromWineCom($, category));
            }
            else if (url.includes('klwines.com')) {
                spirits.push(...this.extractFromKLWines($, category));
            }
            else if (url.includes('masterofmalt.com')) {
                spirits.push(...this.extractFromMasterOfMalt($, category));
            }
            else {
                // Generic extraction
                spirits.push(...this.extractGenericProducts($, category));
            }
        }
        catch (error) {
            logger.error(`Error fetching catalog page ${url}: ${error}`);
        }
        return spirits;
    }
    /**
     * Extract products from Total Wine HTML
     */
    extractFromTotalWine($, category) {
        const products = [];
        // Total Wine product selectors
        $('.product-card, .item-tile, [class*="product-item"]').each((_, elem) => {
            const $elem = $(elem);
            const name = $elem.find('.product-title, .item-title, h2, h3').first().text().trim();
            const price = $elem.find('.price, .product-price, [class*="price"]').first().text().trim();
            const image = $elem.find('img').first().attr('src');
            if (name && name.length > 3) {
                const cleanPrice = this.extractPrice(price);
                products.push({
                    name: TextProcessor.fixTextSpacing(name),
                    type: category,
                    price: cleanPrice,
                    image_url: image,
                    source_url: 'totalwine.com',
                    data_source: 'catalog_extraction'
                });
            }
        });
        logger.debug(`Extracted ${products.length} products from Total Wine`);
        return products;
    }
    /**
     * Extract products from The Whisky Exchange HTML
     */
    extractFromWhiskyExchange($, category) {
        const products = [];
        $('.product-card').each((_, elem) => {
            const $elem = $(elem);
            const name = $elem.find('.product-card__name').text().trim();
            const price = $elem.find('.product-card__price').text().trim();
            const meta = $elem.find('.product-card__meta').text().trim();
            const image = $elem.find('img').attr('src');
            if (name) {
                const cleanPrice = this.extractPrice(price);
                const abv = this.extractABV(meta);
                products.push({
                    name: TextProcessor.fixTextSpacing(name),
                    type: category,
                    price: cleanPrice,
                    abv: abv,
                    image_url: image,
                    source_url: 'thewhiskyexchange.com',
                    data_source: 'catalog_extraction'
                });
            }
        });
        return products;
    }
    /**
     * Extract products from Wine.com HTML
     */
    extractFromWineCom($, category) {
        const products = [];
        $('.prodItem').each((_, elem) => {
            const $elem = $(elem);
            const name = $elem.find('.prodItemInfo_name').text().trim();
            const price = $elem.find('.prodItemInfo_price').text().trim();
            const details = $elem.find('.prodItemInfo_details').text().trim();
            if (name) {
                const cleanPrice = this.extractPrice(price);
                products.push({
                    name: TextProcessor.fixTextSpacing(name),
                    type: category,
                    price: cleanPrice,
                    description: details,
                    source_url: 'wine.com',
                    data_source: 'catalog_extraction'
                });
            }
        });
        return products;
    }
    /**
     * Extract products from K&L Wines HTML
     */
    extractFromKLWines($, category) {
        const products = [];
        $('.result-item').each((_, elem) => {
            const $elem = $(elem);
            const name = $elem.find('.result-title').text().trim();
            const price = $elem.find('.result-price').text().trim();
            const details = $elem.find('.result-desc').text().trim();
            if (name) {
                const cleanPrice = this.extractPrice(price);
                const abv = this.extractABV(details);
                products.push({
                    name: TextProcessor.fixTextSpacing(name),
                    type: category,
                    price: cleanPrice,
                    abv: abv,
                    description: details,
                    source_url: 'klwines.com',
                    data_source: 'catalog_extraction'
                });
            }
        });
        return products;
    }
    /**
     * Extract products from Master of Malt HTML
     */
    extractFromMasterOfMalt($, category) {
        const products = [];
        $('.product').each((_, elem) => {
            const $elem = $(elem);
            const name = $elem.find('.product-name').text().trim();
            const price = $elem.find('.product-price').text().trim();
            const volume = $elem.find('.product-volume').text().trim();
            const abv = $elem.find('.product-abv').text().trim();
            if (name) {
                const cleanPrice = this.extractPrice(price);
                const cleanABV = this.extractABV(abv);
                products.push({
                    name: TextProcessor.fixTextSpacing(name),
                    type: category,
                    price: cleanPrice,
                    abv: cleanABV,
                    volume: volume || '700ml',
                    source_url: 'masterofmalt.com',
                    data_source: 'catalog_extraction'
                });
            }
        });
        return products;
    }
    /**
     * Generic product extraction for unknown sites
     */
    extractGenericProducts($, category) {
        const products = [];
        // Common product container selectors
        const selectors = [
            '[class*="product"]',
            '[class*="item"]',
            '[class*="listing"]',
            'article',
            '.grid-item'
        ];
        selectors.forEach(selector => {
            $(selector).each((_, elem) => {
                const $elem = $(elem);
                const text = $elem.text();
                // Look for price pattern
                const priceMatch = text.match(/\$\d+\.?\d*/);
                if (priceMatch) {
                    // Try to extract product name
                    const title = $elem.find('h1, h2, h3, h4, [class*="title"], [class*="name"]').first().text().trim();
                    if (title && title.length > 3) {
                        products.push({
                            name: TextProcessor.fixTextSpacing(title),
                            type: category,
                            price: this.extractPrice(priceMatch[0]),
                            source_url: 'unknown',
                            data_source: 'catalog_extraction'
                        });
                    }
                }
            });
        });
        return products;
    }
    /**
     * Extract spirits from search result metadata
     */
    extractSpiritsFromSearchResult(result, category) {
        const spirits = [];
        const { title, snippet, link, pagemap } = result;
        // Skip non-product pages
        const skipDomains = ['buffalotracedaily.com', 'epicurious.com', 'ohlq.com', 'reddit.com', 'facebook.com'];
        if (skipDomains.some(domain => link.includes(domain))) {
            return spirits;
        }
        // 1. Extract from structured data first (highest quality)
        if (pagemap?.product) {
            const products = Array.isArray(pagemap.product) ? pagemap.product : [pagemap.product];
            for (const product of products) {
                if (product.name && product.name.length > 5 && !product.name.toLowerCase().includes('gift card')) {
                    // Extract price from structured data
                    let structuredPrice;
                    const priceFields = [
                        product.offers?.price,
                        product.offers?.lowPrice,
                        product.price,
                        product.offers?.[0]?.price
                    ];
                    for (const field of priceFields) {
                        const price = this.extractPrice(field);
                        if (price) {
                            structuredPrice = price;
                            break;
                        }
                    }
                    spirits.push({
                        name: TextProcessor.fixTextSpacing(product.name),
                        type: category,
                        price: structuredPrice,
                        brand: product.brand?.name || product.brand || this.extractBrandFromName(product.name),
                        description: product.description,
                        image_url: product.image || product.offers?.image,
                        source_url: link,
                        data_source: 'structured_data'
                    });
                }
            }
        }
        // 2. Extract from metatags
        if (pagemap?.metatags?.[0]) {
            const meta = pagemap.metatags[0];
            const productName = meta['og:title'] || meta['product:name'] || meta['twitter:title'];
            if (productName && this.isValidProductName(productName, category)) {
                // Check if we already have this from structured data
                const exists = spirits.some(s => s.name.toLowerCase() === productName.toLowerCase());
                if (!exists) {
                    spirits.push({
                        name: this.cleanProductName(productName),
                        type: category,
                        price: this.extractPrice(meta['product:price:amount'] || meta['product:price'] || meta['og:price:amount']),
                        brand: meta['product:brand'] || meta['og:brand'],
                        description: meta['og:description'] || meta['description'],
                        image_url: meta['og:image'] || meta['twitter:image'],
                        source_url: link,
                        data_source: 'metatags'
                    });
                }
            }
        }
        // 3. Extract from title (if it looks like a product)
        const titleSpirit = this.extractFromTitle(title, category, link);
        if (titleSpirit && !spirits.some(s => s.name.toLowerCase() === titleSpirit.name.toLowerCase())) {
            spirits.push(titleSpirit);
        }
        // 4. Extract multiple products from snippet
        const snippetSpirits = this.extractFromSnippet(snippet, category, link);
        for (const spirit of snippetSpirits) {
            if (!spirits.some(s => s.name.toLowerCase() === spirit.name.toLowerCase())) {
                spirits.push(spirit);
            }
        }
        // 5. Look for price information in snippet to enhance existing spirits
        if (snippet && spirits.length > 0 && !spirits[0].price) {
            // Extract price from snippet with enhanced patterns
            const pricePatterns = [
                // Standard price patterns
                /(?:price|msrp|our\s+price|sale|now):\s*\$?([\d,]+\.?\d*)/i,
                /\$\s*([\d,]+\.?\d{0,2})(?:\s|$|[^\d])/,
                // Price near volume (750ml - $29.99)
                /(?:750ml|1L|1\.75L)\s*[-–—]\s*\$?([\d,]+\.?\d*)/i,
                /\d+ml\s*[.-]*\s*\$?([\d,]+\.?\d*)/i,
                // Price range patterns
                /\$?([\d,]+\.?\d*)\s*-\s*\$?\d+\.?\d*/,
                /USD\s*([\d,]+\.?\d*)/i,
                // Retail/regular price
                /(?:retail|regular)\s+price[:\s]*\$?([\d,]+\.?\d*)/i,
                /priced?\s+at\s+\$?([\d,]+\.?\d*)/i,
                // Price in parentheses or after colon
                /\(\$?([\d,]+\.?\d*)\)/,
                /:\s*\$?([\d,]+\.?\d*)(?:\s|$)/,
                // Price with currency words
                /(\d+\.?\d*)\s*(?:dollars|bucks)/i,
                // Special Total Wine pattern from their snippets
                /(?:was|now|only)\s+\$?([\d,]+\.?\d*)/i
            ];
            for (const pattern of pricePatterns) {
                const match = snippet.match(pattern);
                if (match) {
                    const price = this.extractPrice(match[1], snippet);
                    if (price) {
                        spirits[0].price = price;
                        break;
                    }
                }
            }
        }
        // 6. Extract ABV/Proof from snippet
        const abvMatch = snippet.match(/(\d+(?:\.\d+)?)\s*%\s*(?:ABV|alc)/i);
        const proofMatch = snippet.match(/(\d+(?:\.\d+)?)\s*proof/i);
        if ((abvMatch || proofMatch) && spirits.length > 0) {
            if (!spirits[0].abv) {
                if (abvMatch) {
                    spirits[0].abv = parseFloat(abvMatch[1]);
                }
                else if (proofMatch) {
                    spirits[0].abv = parseFloat(proofMatch[1]) / 2; // Convert proof to ABV
                }
            }
            if (!spirits[0].proof && proofMatch) {
                spirits[0].proof = parseFloat(proofMatch[1]);
            }
        }
        // 7. Extract image from CSE image data
        if (pagemap?.cse_image?.[0]?.src && spirits.length > 0 && !spirits[0].image_url) {
            spirits[0].image_url = pagemap.cse_image[0].src;
        }
        // 8. Enhanced description extraction with better cleaning
        if (spirits.length > 0) {
            const enhancedDescription = this.extractEnhancedDescription(pagemap, snippet, spirits[0].description);
            if (enhancedDescription) {
                spirits[0].description = enhancedDescription;
            }
        }
        return spirits;
    }
    /**
     * Enhanced description extraction with better cleaning and prioritization
     */
    extractEnhancedDescription(pagemap, snippet, existingDescription) {
        const descriptions = [];
        // 1. Extract FULL meta descriptions (no truncation)
        const metaDescriptions = [
            pagemap?.metatags?.[0]?.['og:description'],
            pagemap?.metatags?.[0]?.['description'],
            pagemap?.metatags?.[0]?.['twitter:description'],
            pagemap?.metatags?.[0]?.['product:description']
        ].filter(Boolean);
        for (const metaDesc of metaDescriptions) {
            const cleaned = this.cleanDescription(metaDesc);
            if (cleaned && cleaned.length > 50) {
                descriptions.push(cleaned);
            }
        }
        // 2. Add existing structured description if good quality
        if (existingDescription && existingDescription.length > 50 && !existingDescription.includes('JavaScript')) {
            const cleaned = this.cleanDescription(existingDescription);
            if (cleaned)
                descriptions.push(cleaned);
        }
        // 3. Add cleaned snippet as supplementary info
        if (snippet && snippet.length > 50) {
            const cleanedSnippet = this.cleanDescription(snippet);
            if (cleanedSnippet && cleanedSnippet.length > 40) {
                descriptions.push(cleanedSnippet);
            }
        }
        // 4. Combine descriptions intelligently
        if (descriptions.length === 0)
            return existingDescription;
        // Remove duplicates and combine
        const uniqueDescriptions = [...new Set(descriptions)];
        // If we have multiple good descriptions, combine them
        if (uniqueDescriptions.length > 1) {
            // Take the longest one as primary, add others as additional info
            const primary = uniqueDescriptions.sort((a, b) => b.length - a.length)[0];
            const additional = uniqueDescriptions.slice(1).filter(d => 
            // Only add if it contains unique information
            !primary.toLowerCase().includes(d.toLowerCase().substring(0, 30)));
            if (additional.length > 0) {
                return `${primary} | ${additional.join(' | ')}`;
            }
            return primary;
        }
        return uniqueDescriptions[0];
    }
    /**
     * Clean and enhance description text
     */
    cleanDescription(text) {
        if (!text || text.length < 20)
            return undefined;
        let cleaned = text
            // Remove ellipsis and truncation marks
            .replace(/\.\.\./g, ' ')
            .replace(/…/g, ' ')
            // Remove common e-commerce junk
            .replace(/\b(buy now|add to cart|shop online|free shipping|in stock|out of stock)\b/gi, '')
            .replace(/\b(price|msrp|sale|discount|save \$\d+)\b/gi, '')
            .replace(/\$\d+\.?\d*\s*(off|savings?)/gi, '')
            // Remove JavaScript errors and technical text
            .replace(/javascript/gi, '')
            .replace(/\berror\b/gi, '')
            .replace(/\b(loading|please wait|404|not found)\b/gi, '')
            // Remove repeated characters and fix spacing
            .replace(/([.!?])\1+/g, '$1')
            .replace(/\s+/g, ' ')
            .replace(/\s*[|\-–—]\s*$/, '') // Remove trailing separators
            // Capitalize first letter if needed
            .trim();
        // Start with capital letter
        if (cleaned.length > 0) {
            cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
        // Validate quality
        const qualityChecks = [
            cleaned.length >= 30,
            cleaned.length <= 500, // Not too long
            !cleaned.toLowerCase().includes('buy'),
            !cleaned.toLowerCase().includes('cart'),
            !cleaned.toLowerCase().includes('shipping'),
            !cleaned.includes('???'),
            !cleaned.includes('undefined')
        ];
        if (qualityChecks.every(check => check)) {
            return cleaned;
        }
        return undefined;
    }
    /**
     * Check if a product name is valid
     */
    isValidProductName(name, category) {
        if (!name || name.length < 5 || name.length > 150)
            return false;
        const lowerName = name.toLowerCase();
        // Skip generic/non-product titles
        const skipPatterns = [
            'shop', 'buy', 'browse', 'search', 'collection', 'catalog',
            'all products', 'home page', 'gift card', 'accessories',
            'glasses', 'barware', 'cigar', 'best local price',
            'compare prices', 'find stores', 'unlock exclusive', 'rewards member',
            'priority access', 'faq', 'sign up', 'newsletter', 'shipping'
        ];
        if (skipPatterns.some(pattern => lowerName.includes(pattern))) {
            return false;
        }
        // Must contain spirit-related words
        const spiritWords = ['whiskey', 'whisky', 'bourbon', 'rum', 'vodka', 'gin', 'tequila', 'scotch', 'rye', 'brandy', 'cognac'];
        return spiritWords.some(word => lowerName.includes(word));
    }
    /**
     * Clean product name
     */
    cleanProductName(name) {
        // Remove common suffixes and site names
        let cleaned = name
            .replace(/\s*[-|]\s*(Buy|Shop|Store|Online|Price).*$/i, '')
            .replace(/\s*[-|]\s*(Total Wine|Wine\.com|K&L|Whisky Exchange|Master of Malt).*$/i, '')
            .replace(/\s*\(\d+\)\s*$/, '') // Remove SKU numbers
            .replace(/\s*\(\s*\)\s*$/g, '') // Remove empty parentheses
            .replace(/\s*[-–—]\s*$/, '') // Remove trailing dashes
            .replace(/\s+Spirits\s*$/i, '') // Remove "Spirits" suffix
            .trim();
        return TextProcessor.fixTextSpacing(cleaned);
    }
    /**
     * Extract product from title
     */
    extractFromTitle(title, category, link) {
        if (!this.isValidProductName(title, category)) {
            return null;
        }
        // Clean the title
        const cleaned = this.cleanProductName(title);
        // Try to extract brand and product info
        const brandMatch = cleaned.match(/^([A-Z][a-zA-Z\s&'.-]+?)\s+(\w+.*)/);
        let brand = '';
        let productName = cleaned;
        if (brandMatch) {
            brand = brandMatch[1].trim();
            // Make sure the brand isn't a generic word
            const genericWords = ['The', 'Buy', 'Shop', 'New', 'Best', 'Premium'];
            if (!genericWords.includes(brand)) {
                productName = cleaned;
            }
        }
        // Extract price from title if present
        const priceMatch = title.match(/\$(\d+\.?\d*)/);
        return {
            name: productName,
            brand: brand || this.extractBrandFromName(productName),
            type: category,
            price: priceMatch ? this.extractPrice(priceMatch[1]) : undefined,
            source_url: link,
            data_source: 'title_extraction'
        };
    }
    /**
     * Extract products from snippet text
     */
    extractFromSnippet(snippet, category, link) {
        const products = [];
        if (!snippet)
            return products;
        // Pattern 1: "Product Name - $XX.XX" or "Product Name ... $XX.XX"
        const pricePatterns = [
            /([A-Za-z\s&'.-]+(?:Whiskey|Bourbon|Rum|Vodka|Gin|Tequila|Scotch|Rye)[A-Za-z\s&'.-]*?)\s*[-–...]\s*\$(\d+\.?\d*)/gi,
            /([A-Za-z\s&'.-]+?)\s+(?:Whiskey|Bourbon|Rum|Vodka|Gin|Tequila|Scotch|Rye)\s*[-–...]\s*\$(\d+\.?\d*)/gi
        ];
        for (const pattern of pricePatterns) {
            const matches = Array.from(snippet.matchAll(pattern));
            for (const match of matches) {
                const name = match[1].trim();
                if (this.isValidProductName(name, category)) {
                    const cleanName = this.cleanProductName(name);
                    // Avoid duplicates
                    if (!products.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
                        products.push({
                            name: cleanName,
                            brand: this.extractBrandFromName(cleanName),
                            type: category,
                            price: this.extractPrice(match[2]),
                            source_url: link,
                            data_source: 'snippet_extraction'
                        });
                    }
                }
            }
        }
        // Pattern 2: Look for product listings without prices
        const listingPattern = /(?:^|\n|;|•|·|\|)\s*([A-Z][A-Za-z\s&'.-]+(?:Whiskey|Bourbon|Rum|Vodka|Gin|Tequila|Scotch|Rye)[A-Za-z\s&'.-]*?)(?:\s*[-–]|$|\n|;)/gi;
        const listingMatches = Array.from(snippet.matchAll(listingPattern));
        for (const match of listingMatches) {
            const name = match[1].trim();
            if (this.isValidProductName(name, category) && name.length < 80) {
                const cleanName = this.cleanProductName(name);
                if (!products.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
                    products.push({
                        name: cleanName,
                        brand: this.extractBrandFromName(cleanName),
                        type: category,
                        source_url: link,
                        data_source: 'snippet_listing'
                    });
                }
            }
        }
        return products.slice(0, 5); // Limit to avoid noise
    }
    /**
     * Extract advanced metadata (age, style, proof) from spirit name and description
     */
    extractAdvancedMetadata(spirit) {
        const text = `${spirit.name || ''} ${spirit.description || ''}`.toLowerCase();
        const metadata = {};
        // Extract age statements
        const agePatterns = [
            /(\d{1,2})\s*year(?:s?)?\s*old/,
            /(\d{1,2})\s*yr\b/,
            /(\d{1,2})\s*years?\b/,
            /aged\s*(\d{1,2})\s*years?/,
            /(\d{1,2})\s*year/
        ];
        for (const pattern of agePatterns) {
            const match = text.match(pattern);
            if (match) {
                const age = parseInt(match[1]);
                if (age >= 3 && age <= 50) { // Reasonable age range
                    // Convert age number to formatted string
                    metadata.age_statement = `${age} Year${age > 1 ? 's' : ''}`;
                    break;
                }
            }
        }
        // Extract whiskey styles
        const stylePatterns = [
            { pattern: /single\s*barrel/, style: 'Single Barrel' },
            { pattern: /small\s*batch/, style: 'Small Batch' },
            { pattern: /cask\s*strength/, style: 'Cask Strength' },
            { pattern: /barrel\s*(?:strength|proof)/, style: 'Barrel Strength' },
            { pattern: /bottled[\s-]*in[\s-]*bond|BiB/, style: 'Bottled-in-Bond' },
            { pattern: /straight\s*bourbon/, style: 'Straight Bourbon' },
            { pattern: /straight\s*rye/, style: 'Straight Rye' },
            { pattern: /straight\s*whiskey/, style: 'Straight Whiskey' },
            { pattern: /single\s*malt/, style: 'Single Malt' },
            { pattern: /double\s*oak/, style: 'Double Oaked' },
            { pattern: /(?:port|sherry|wine|rum|cognac)\s*(?:cask\s*)?finish/, style: 'Finished' },
            { pattern: /reserve(?!\s*(?:bar|restaurant))/, style: 'Reserve' },
            { pattern: /limited\s*edition|special\s*release/, style: 'Limited Edition' },
            { pattern: /private\s*(?:selection|barrel|pick)/, style: 'Private Selection' },
            { pattern: /store\s*pick|exclusive/, style: 'Store Pick' },
            { pattern: /vintage\s*\d{4}/, style: 'Vintage' },
            { pattern: /full\s*proof/, style: 'Full Proof' },
            { pattern: /wheated/, style: 'Wheated' },
            { pattern: /high\s*rye/, style: 'High Rye' },
            { pattern: /toasted\s*barrel/, style: 'Toasted Barrel' },
            { pattern: /triple\s*cask/, style: 'Triple Cask' },
            { pattern: /peated/, style: 'Peated' },
            { pattern: /cask\s*finish/, style: 'Cask Finished' },
            { pattern: /select|selection/, style: 'Select' }
        ];
        const detectedStyles = [];
        for (const { pattern, style } of stylePatterns) {
            if (pattern.test(text)) {
                detectedStyles.push(style);
            }
        }
        if (detectedStyles.length > 0) {
            metadata.whiskey_style = detectedStyles.join(', ');
        }
        // Extract proof alongside ABV
        const proofPatterns = [
            /(\d{2,3}(?:\.\d+)?)\s*proof/,
            /proof[\s:](\d{2,3}(?:\.\d+)?)/,
            /(\d{2,3}(?:\.\d+)?)°?\s*proof/
        ];
        for (const pattern of proofPatterns) {
            const match = text.match(pattern);
            if (match) {
                const proof = parseFloat(match[1]);
                if (proof >= 80 && proof <= 200) { // Reasonable proof range
                    metadata.proof = proof;
                    // Also calculate ABV if not already present
                    if (!spirit.abv) {
                        metadata.abv = proof / 2;
                    }
                    break;
                }
            }
        }
        // Extract region/origin
        const regionPatterns = [
            { pattern: /kentucky/i, region: 'Kentucky' },
            { pattern: /tennessee/i, region: 'Tennessee' },
            { pattern: /highland/i, region: 'Highland' },
            { pattern: /islay/i, region: 'Islay' },
            { pattern: /speyside/i, region: 'Speyside' },
            { pattern: /lowland/i, region: 'Lowland' },
            { pattern: /campbeltown/i, region: 'Campbeltown' },
            { pattern: /irish/i, region: 'Ireland' },
            { pattern: /japanese/i, region: 'Japan' },
            { pattern: /canadian/i, region: 'Canada' }
        ];
        for (const { pattern, region } of regionPatterns) {
            if (pattern.test(text)) {
                metadata.origin_region = region;
                break;
            }
        }
        // Extract cask type
        const caskPatterns = [
            { pattern: /ex[\s-]*bourbon/, cask: 'Ex-Bourbon' },
            { pattern: /sherry\s*cask/, cask: 'Sherry' },
            { pattern: /port\s*cask/, cask: 'Port' },
            { pattern: /wine\s*cask/, cask: 'Wine' },
            { pattern: /cognac\s*cask/, cask: 'Cognac' },
            { pattern: /rum\s*cask/, cask: 'Rum' },
            { pattern: /virgin\s*oak/, cask: 'Virgin Oak' },
            { pattern: /charred\s*oak/, cask: 'Charred Oak' },
            { pattern: /toasted/, cask: 'Toasted' },
            { pattern: /mizunara/, cask: 'Mizunara' }
        ];
        for (const { pattern, cask } of caskPatterns) {
            if (pattern.test(text)) {
                metadata.cask_type = cask;
                break;
            }
        }
        return metadata;
    }
    /**
     * Store spirit in database
     */
    async storeSpirit(spirit) {
        try {
            // Detect proper type
            const typeDetection = detectSpiritType(spirit.name, spirit.brand || '', spirit.description);
            const detectedType = typeDetection?.type || spirit.type;
            // Skip if the detected type doesn't match the category we're searching for
            // Allow some flexibility (e.g., "Whiskey" matches "Bourbon")
            const categoryMap = {
                'bourbon': ['Bourbon', 'Whiskey', 'Tennessee Whiskey', 'Bottled-in-Bond', 'Kentucky Straight Bourbon'],
                'whiskey': ['Whiskey', 'Bourbon', 'Rye Whiskey', 'Tennessee Whiskey', 'Irish Whiskey', 'Canadian Whisky'],
                'scotch': ['Scotch', 'Single Malt Scotch', 'Blended Scotch', 'Highland', 'Islay', 'Speyside'],
                'tequila': ['Tequila', 'Blanco', 'Reposado', 'Añejo', 'Extra Añejo'],
                'rum': ['Rum', 'White Rum', 'Gold Rum', 'Dark Rum', 'Spiced Rum'],
                'vodka': ['Vodka'],
                'gin': ['Gin', 'London Dry Gin', 'Navy Strength Gin']
            };
            const allowedTypes = categoryMap[spirit.type.toLowerCase()] || [spirit.type];
            if (!allowedTypes.some(allowed => detectedType?.includes(allowed))) {
                logger.debug(`⏭️ Skipping ${spirit.name} - type mismatch: ${detectedType} not in [${allowedTypes.join(', ')}]`);
                return false;
            }
            // Extract advanced metadata
            const advancedMetadata = this.extractAdvancedMetadata(spirit);
            const spiritData = {
                name: spirit.name,
                brand: spirit.brand || this.extractBrandFromName(spirit.name),
                type: detectedType,
                category: this.mapTypeToCategory(detectedType),
                price: spirit.price,
                abv: spirit.abv || advancedMetadata.abv || this.extractABV(spirit.description || spirit.snippet, detectedType),
                proof: spirit.proof || advancedMetadata.proof,
                volume: spirit.volume || '750ml',
                image_url: spirit.image_url,
                description: spirit.description,
                source_url: spirit.source_url,
                data_source: spirit.data_source,
                data_quality_score: this.calculateQualityScore(spirit),
                // Enhanced metadata with advanced extraction
                age_statement: advancedMetadata.age_statement,
                whiskey_style: advancedMetadata.whiskey_style,
                origin_region: advancedMetadata.origin_region,
                cask_type: advancedMetadata.cask_type,
                metadata: {
                    ...advancedMetadata,
                    extraction_version: 'v2.5_enhanced'
                }
            };
            const result = await this.storage.storeSpirit(spiritData);
            if (result.success) {
                logger.debug(`✅ Stored: ${spirit.name}`);
                return true;
            }
            else {
                logger.warn(`❌ Failed to store: ${spirit.name} - Error: ${result.error || 'Unknown error'}`);
                return false;
            }
        }
        catch (error) {
            logger.error(`Error storing spirit: ${error}`);
            return false;
        }
    }
    /**
     * Extract price from various formats with enhanced logic
     */
    extractPrice(priceStr, context) {
        if (!priceStr)
            return undefined;
        // If already a number, validate it's a reasonable price
        if (typeof priceStr === 'number') {
            return priceStr >= 5 && priceStr <= 10000 ? priceStr : undefined;
        }
        const str = priceStr.toString();
        // Skip if context suggests this is not a price (volume, year, etc)
        if (context) {
            const nonPriceIndicators = ['ml', 'liter', 'year', 'aged', 'proof', 'abv'];
            const lowerContext = context.toLowerCase();
            if (nonPriceIndicators.some(indicator => lowerContext.includes(indicator))) {
                return undefined;
            }
        }
        // Handle structured price formats
        let price;
        // Try USD format
        if (str.includes('USD')) {
            const match = str.match(/USD\s*([\d,]+\.?\d*)/);
            if (match) {
                price = parseFloat(match[1].replace(/,/g, ''));
            }
        }
        // Try dollar sign format
        if (!price) {
            const match = str.match(/\$\s*([\d,]+\.?\d*)/);
            if (match) {
                price = parseFloat(match[1].replace(/,/g, ''));
            }
        }
        // Try plain number
        if (!price) {
            const cleaned = str.replace(/[^0-9.]/g, '');
            if (cleaned) {
                price = parseFloat(cleaned);
            }
        }
        // Currency conversion
        let multiplier = 1;
        if (str.includes('£') || str.toLowerCase().includes('gbp')) {
            multiplier = 1.27; // GBP to USD
        }
        else if (str.includes('€') || str.toLowerCase().includes('eur')) {
            multiplier = 1.08; // EUR to USD
        }
        if (price) {
            price = price * multiplier;
            // Validate reasonable price range
            return price >= 5 && price <= 10000 ? price : undefined;
        }
        return undefined;
    }
    /**
     * Extract ABV from text with enhanced patterns
     */
    extractABV(text, spiritType) {
        if (!text)
            return undefined;
        // Try various patterns
        const patterns = [
            /(\d+(?:\.\d+)?)\s*%\s*(?:ABV|alc|alcohol)/i,
            /(\d+(?:\.\d+)?)\s*%/,
            /(\d+)\s*proof/i,
            /ABV[:\s]+(\d+(?:\.\d+)?)/i,
            /alcohol[:\s]+(\d+(?:\.\d+)?)\s*%/i,
            /(\d+(?:\.\d+)?)\s*degrees/i
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const value = parseFloat(match[1]);
                // Convert proof to ABV if needed
                if (pattern.toString().includes('proof')) {
                    const abv = value / 2;
                    // Validate ABV range after conversion
                    if (abv >= 20 && abv <= 75) {
                        return abv;
                    }
                }
                else {
                    // Validate ABV range
                    if (value >= 20 && value <= 75) {
                        return value;
                    }
                }
            }
        }
        // Return category defaults if no ABV found
        if (spiritType) {
            const categoryDefaults = {
                'vodka': 40,
                'gin': 40,
                'rum': 40,
                'tequila': 40,
                'bourbon': 45,
                'whiskey': 43,
                'scotch': 43,
                'rye': 45
            };
            const lowerType = spiritType.toLowerCase();
            for (const [key, defaultAbv] of Object.entries(categoryDefaults)) {
                if (lowerType.includes(key)) {
                    logger.debug(`Using default ABV ${defaultAbv}% for ${spiritType}`);
                    return defaultAbv;
                }
            }
        }
        return undefined;
    }
    /**
     * Create unique key for spirit deduplication
     */
    createSpiritKey(spirit) {
        const keys = createMultipleKeys(spirit.name);
        return keys.aggressive;
    }
    /**
     * Enhanced brand extraction from spirit name
     */
    extractBrandFromName(name) {
        if (!name)
            return 'Unknown';
        // Clean the name first
        const cleanName = name.replace(/\s+/g, ' ').trim();
        // Known multi-word brands - check first for exact matches
        const knownBrands = [
            'Russell\'s Reserve', 'Buffalo Trace', 'Wild Turkey', 'Four Roses',
            'Old Forester', 'Maker\'s Mark', 'Elijah Craig', 'Evan Williams',
            'Henry McKenna', 'Very Old Barton', 'Old Grand-Dad', 'Old Ezra',
            'I.W. Harper', 'W.L. Weller', 'George T. Stagg', 'E.H. Taylor',
            'Joseph Magnus', 'High West', 'WhistlePig', 'Angel\'s Envy',
            'Michter\'s', 'Jack Daniel\'s', 'George Dickel', 'Uncle Nearest',
            'Garrison Brothers', 'Balcones', 'Westland', 'Stranahan\'s',
            'Crown Royal', 'Canadian Club', 'Forty Creek', 'Jameson',
            'Redbreast', 'Green Spot', 'Yellow Spot', 'Bushmills',
            'The Macallan', 'Glenfiddich', 'Glenlivet', 'Highland Park',
            'Grey Goose', 'Ketel One', 'Don Julio', 'Patrón', 'Casamigos'
        ];
        // Check for known brands (case insensitive)
        const lowerName = cleanName.toLowerCase();
        for (const brand of knownBrands) {
            if (lowerName.startsWith(brand.toLowerCase())) {
                return brand;
            }
        }
        // Pattern-based extraction for complex names
        const words = cleanName.split(/\s+/);
        // Handle possessive forms (Maker's Mark, Russell's Reserve)
        if (words.length >= 2 && words[0].endsWith('\'s')) {
            if (words.length >= 3 && ['Reserve', 'Mark', 'Choice'].includes(words[1])) {
                return `${words[0]} ${words[1]}`;
            }
            return words[0];
        }
        // Handle "Old" prefixes (Old Forester, Old Grand-Dad)
        if (words[0]?.toLowerCase() === 'old' && words.length >= 2) {
            if (words.length >= 3 && (words[2].includes('-') || words[1].toLowerCase() === 'grand')) {
                return `${words[0]} ${words[1]}-${words[2]}`;
            }
            return `${words[0]} ${words[1]}`;
        }
        // Handle initials (W.L. Weller, E.H. Taylor, I.W. Harper)
        if (words[0]?.match(/^[A-Z]\.[A-Z]\.?$/) && words.length >= 2) {
            return `${words[0]} ${words[1]}`;
        }
        // Handle "The" prefixes (The Macallan)
        if (words[0]?.toLowerCase() === 'the' && words.length >= 2) {
            return `${words[0]} ${words[1]}`;
        }
        // Handle numbered brands (Four Roses, etc.)
        const numberWords = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
        if (words.length >= 2 && numberWords.includes(words[0])) {
            return `${words[0]} ${words[1]}`;
        }
        // Default: Take first 2 words for longer names, single word for short
        if (words.length >= 3) {
            return `${words[0]} ${words[1]}`;
        }
        else if (words.length === 2) {
            // Check if second word looks like a descriptor vs brand name
            const descriptors = ['Bourbon', 'Whiskey', 'Whisky', 'Rye', 'Single', 'Barrel', 'Year', 'Old', 'Proof'];
            if (descriptors.includes(words[1])) {
                return words[0];
            }
            return `${words[0]} ${words[1]}`;
        }
        return words[0] || 'Unknown';
    }
    /**
     * Map spirit type to category
     */
    mapTypeToCategory(type) {
        const mapping = {
            'Bourbon': 'Bourbon',
            'Rye Whiskey': 'Rye Whiskey',
            'Scotch': 'Scotch Whiskey',
            'Irish Whiskey': 'Irish Whiskey',
            'Vodka': 'Vodka',
            'Gin': 'Gin',
            'Rum': 'Rum',
            'Tequila': 'Tequila',
            'Mezcal': 'Mezcal'
        };
        return mapping[type] || 'Other';
    }
    /**
     * Enhanced quality score calculation including advanced metadata
     */
    calculateQualityScore(spirit) {
        let score = 0; // Start from 0
        // Name quality (up to 20 points)
        if (spirit.name && spirit.name.length > 5) {
            score += 10;
            // Extra points for detailed names with year/age/type
            const hasDetail = /\d{2,4}|year|aged|single|barrel|batch|reserve/i.test(spirit.name);
            if (hasDetail && !spirit.name.toLowerCase().includes('shop')) {
                score += 10;
            }
        }
        // Price (20 points - most important for commerce)
        if (spirit.price && spirit.price > 10 && spirit.price < 5000) {
            score += 20;
        }
        // ABV/Proof (15 points)
        if (spirit.abv && spirit.abv >= 20 && spirit.abv <= 75) {
            score += 15;
        }
        else if (spirit.proof && spirit.proof >= 40 && spirit.proof <= 150) {
            score += 15;
        }
        // Brand (15 points)
        if (spirit.brand && spirit.brand.length > 2 && spirit.brand !== 'Unknown') {
            score += 15;
        }
        // Description (15 points)
        if (spirit.description && spirit.description.length > 30) {
            score += 10;
            // Extra points for detailed descriptions
            if (spirit.description.length > 100 && !spirit.description.includes('JavaScript')) {
                score += 5;
            }
        }
        // Image URL (10 points)
        if (spirit.image_url && spirit.image_url.startsWith('http')) {
            score += 10;
        }
        // Source quality (5 points)
        const trustedSources = ['totalwine.com', 'klwines.com', 'thewhiskyexchange.com', 'wine.com', 'masterofmalt.com'];
        if (spirit.source_url && trustedSources.some(domain => spirit.source_url.includes(domain))) {
            score += 5;
        }
        // Advanced metadata bonus points (up to 15 additional points)
        const advancedMetadata = this.extractAdvancedMetadata(spirit);
        // Age statement (5 points)
        if (advancedMetadata.age_statement) {
            score += 5;
        }
        // Whiskey style (5 points)
        if (advancedMetadata.whiskey_style) {
            score += 5;
        }
        // Region/cask info (3 points each)
        if (advancedMetadata.origin_region) {
            score += 3;
        }
        if (advancedMetadata.cask_type) {
            score += 2;
        }
        return Math.min(score, 100);
    }
    /**
     * Log final metrics summary
     */
    logFinalMetrics() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 ULTRA-EFFICIENT SCRAPING RESULTS');
        console.log('='.repeat(60));
        console.log(`\n🔍 API Calls: ${this.metrics.apiCalls}`);
        console.log(`🥃 Spirits Found: ${this.metrics.spiritsFound}`);
        console.log(`💾 Spirits Stored: ${this.metrics.spiritsStored}`);
        console.log(`📈 Efficiency: ${this.metrics.efficiency.toFixed(1)} spirits/call`);
        console.log(`📑 Catalog Pages Found: ${this.metrics.catalogPagesFound}`);
        if (this.metrics.catalogPagesFound > 0) {
            console.log(`📊 Avg Spirits per Catalog: ${this.metrics.averageSpiritsPerCatalog.toFixed(1)}`);
        }
        console.log('\n🏆 TOP PERFORMING QUERIES:');
        this.metrics.topPerformingQueries.slice(0, 5).forEach((q, i) => {
            console.log(`${i + 1}. ${q.query}`);
            console.log(`   Yield: ${q.spiritsYield} spirits`);
        });
        // Show efficiency achievement
        if (this.metrics.efficiency >= 0.6) {
            console.log(`\n🎯 Target efficiency achieved! (60%+ = ${this.metrics.efficiency.toFixed(1)} spirits/call)`);
        }
        else {
            console.log(`\n⚠️ Below target efficiency: ${this.metrics.efficiency.toFixed(1)} spirits/call (target: 0.6+)`);
        }
        console.log('\n' + '='.repeat(60));
    }
    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
export const ultraEfficientScraper = new UltraEfficientScraper();
