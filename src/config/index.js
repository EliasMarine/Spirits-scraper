import dotenv from 'dotenv';
dotenv.config();
export const config = {
    googleApiKey: process.env.GOOGLE_API_KEY || '',
    searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
    batchSize: parseInt(process.env.BATCH_SIZE || '10', 10),
    rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '100', 10),
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
    retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),
    redis: (process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) ? {
        url: process.env.REDIS_URL,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        database: process.env.REDIS_DATABASE ? parseInt(process.env.REDIS_DATABASE, 10) : undefined,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        // Upstash REST API configuration
        upstashUrl: process.env.UPSTASH_REDIS_REST_URL,
        upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    } : undefined,
};
export function validateConfig() {
    const required = [
        'googleApiKey',
        'searchEngineId',
        'supabaseUrl',
        'supabaseServiceKey',
    ];
    const missing = required.filter((key) => !config[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}. Please check your .env file.`);
    }
}
// Spirit categories for search queries
export const SPIRIT_CATEGORIES = [
    'Whiskey',
    'Bourbon',
    'Scotch',
    'Vodka',
    'Gin',
    'Rum',
    'Tequila',
    'Mezcal',
    'Brandy',
    'Cognac',
    'Liqueur',
    'Aperitif',
    'Digestif',
];
// Common spirit brands for initial seeding
export const SPIRIT_BRANDS = [
    'Jack Daniels',
    'Johnnie Walker',
    'Jameson',
    'Crown Royal',
    'Makers Mark',
    'Buffalo Trace',
    'Macallan',
    'Glenfiddich',
    'Grey Goose',
    'Absolut',
    'Ketel One',
    'Hendricks',
    'Tanqueray',
    'Bombay Sapphire',
    'Bacardi',
    'Captain Morgan',
    'Patron',
    'Don Julio',
    'Jose Cuervo',
    'Hennessy',
    'Remy Martin',
    'Courvoisier',
];
// Comprehensive non-product exclusions for all search queries
const SEARCH_EXCLUSIONS = [
    // Merchandise
    '-shirt', '-polo', '-hat', '-cap', '-clothing', '-merchandise', '-apparel',
    '-jacket', '-hoodie', '-tee', '-glassware', '-accessories', '-gift-box',
    '-coaster', '-opener', '-sticker', '-keychain',
    // Tours and experiences
    '-tour', '-visit', '-experience', '-tasting-room', '-distillery-tour',
    // Food and cocktails
    '-recipe', '-cocktail', '-mixed-drink', '-food', '-menu',
    // Beer products
    '-beer', '-ale', '-stout', '-lager', '-ipa',
    // Articles and blogs
    '-blog', '-article', '-news', '-guide', '-comparison',
].join(' ');
// Search query templates with comprehensive exclusions
export const SEARCH_TEMPLATES = {
    spiritInfo: (name, brand) => `${name} ${brand || ''} bottle whiskey bourbon spirit alcohol ABV proof ${SEARCH_EXCLUSIONS}`.trim(),
    spiritReview: (name, brand) => `${name} ${brand || ''} review tasting notes flavor profile whiskey bourbon ${SEARCH_EXCLUSIONS}`.trim(),
    spiritRetailer: (name, brand) => `${name} ${brand || ''} buy bottle 750ml online price ${SEARCH_EXCLUSIONS}`.trim(),
    categorySearch: (category) => `${category} bottle buy online price 750ml ${SEARCH_EXCLUSIONS}`,
    brandCatalog: (brand) => `${brand} whiskey bourbon bottle buy online ${SEARCH_EXCLUSIONS}`,
};
