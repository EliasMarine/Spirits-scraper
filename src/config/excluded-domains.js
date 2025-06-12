/**
 * List of domains to exclude from spirit searches
 * These are social media, forums, and user-generated content sites
 * that don't provide reliable product information
 */
export const EXCLUDED_DOMAINS = [
    // Social Media
    'reddit.com',
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'pinterest.com',
    'youtube.com',
    'tiktok.com',
    'snapchat.com',
    'linkedin.com',
    'tumblr.com',
    // Forums and Q&A Sites
    'quora.com',
    'answers.yahoo.com',
    'answers.com',
    'ask.com',
    'stackoverflow.com',
    'discord.com',
    'telegram.org',
    'whatsapp.com',
    'signal.org',
    // Review/Travel Sites (user-generated content)
    'tripadvisor.com',
    'yelp.com',
    'foursquare.com',
    'trustpilot.com',
    'sitejabber.com',
    'bbb.org',
    // Blog Platforms and Blog Patterns
    'medium.com',
    'wordpress.com',
    'blogger.com',
    'blogspot.com',
    'substack.com',
    'ghost.io',
    'typepad.com',
    'wix.com',
    'weebly.com',
    'squarespace.com',
    'blog.', // Catches subdomains like blog.example.com
    '/blog/', // Catches URLs with /blog/ path
    // General Reference (not product-focused)
    'wikipedia.org',
    'wikihow.com',
    'wikia.com',
    'fandom.com',
    // News Aggregators
    'news.google.com',
    'flipboard.com',
    'feedly.com',
    // Marketplace (too general)
    'amazon.com',
    'amazon.co.uk',
    'amazon.ca',
    'amazon.de',
    'amazon.fr',
    'amazon.es',
    'amazon.it',
    'amazon.co.jp',
    'amazon.in',
    'amazon.com.au',
    'amazon.com.br',
    'amazon.com.mx',
    'ebay.com',
    'craigslist.org',
    'mercadolibre.com',
    'alibaba.com',
    'aliexpress.com',
    // Other
    'archive.org',
    'waybackmachine.org',
    // Whiskey/Spirits Review Sites (often return comparison articles instead of products)
    'fredminnick.com',
    'breakingbourbon.com',
    'whiskeyinmyweddingring.com',
    'bourbonveach.com',
    'thewhiskeywash.com',
    'whiskyadvocate.com',
    'whiskynotes.be',
    'whiskyanalysis.com',
    'whiskyfun.com',
    'malt-review.com',
    'thebourbonreview.com',
    'modernthirst.com',
    'bourbonculture.com',
    'rarebird101.com',
    'sippncorn.com',
    'thewhiskeyjug.com',
    'blog.thewhiskyexchange.com',
    'dramface.com',
    'scotchnoob.com',
    'whiskeyreview.com',
    'whiskyroma.com',
    'whiskycast.com',
    'bourbon-enthusiast.com',
    'whiskeyconsensus.com',
    'thedrinksbusiness.com',
    'spiritsjournal.com',
    'connosr.com',
    'whiskyconnosr.com',
    'distiller.com/profile',
    'whizzky.net',
    'whiskybase.com',
    'thewhiskyshelf.com',
    'bourbonandbeef.com',
    'bourbonblog.com',
    'whiskeycloset.net',
    'bourbonguy.com',
    'whiskeyprof.com',
    'whiskeywashback.com',
    'thespiritsbusiness.com',
];
/**
 * Check if a URL should be excluded
 */
export function isExcludedDomain(url) {
    const lowerUrl = url.toLowerCase();
    // Check explicit domain list
    if (EXCLUDED_DOMAINS.some(domain => lowerUrl.includes(domain))) {
        return true;
    }
    // Additional blog pattern checks
    const blogPatterns = [
        /\/blog\//,
        /\.blog\./,
        /blog\./,
        /\/blogs?\//,
        /\/news\//,
        /\/articles?\//,
        /\/posts?\//,
        /\/magazine\//,
        /\/journal\//,
        /blogspot/,
        /wordpress/,
        /\.tumblr\./,
        /medium\.com/,
        /\.substack\./,
    ];
    return blogPatterns.some(pattern => pattern.test(lowerUrl));
}
/**
 * Get Google search exclusion string
 */
export function getSearchExclusions() {
    // Priority exclusions (most important to exclude)
    const priorityExclusions = [
        'amazon.com',
        'reddit.com',
        'facebook.com',
        'blogspot.com',
        'wordpress.com',
        'medium.com',
        'twitter.com',
        'instagram.com',
        'pinterest.com',
        'youtube.com',
        'ebay.com',
        'tripadvisor.com',
        'yelp.com',
        'wikipedia.org',
        'tumblr.com',
        // Review sites that return comparisons instead of products
        'fredminnick.com',
        'breakingbourbon.com',
        'connosr.com',
        'whiskeyinmyweddingring.com',
        'thewhiskeywash.com',
        'whiskyadvocate.com',
        'blog.thewhiskyexchange.com',
        'distiller.com',
        'whiskybase.com',
    ];
    return priorityExclusions
        .map(domain => `-site:${domain}`)
        .join(' ');
}
/**
 * Get additional search modifiers to exclude review content
 */
export function getReviewExclusions() {
    return '-review -vs -comparison -"taste test" -blog -forum';
}
