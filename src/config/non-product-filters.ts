/**
 * Non-Product Filtering Configuration
 * Version: 2.9.0
 * 
 * This configuration defines patterns to identify and filter out non-spirit products
 * from search results at multiple stages of the scraping process.
 * 
 * V2.9 Changes:
 * - Added podcast/content patterns from database analysis
 * - Added recipe/cocktail patterns based on 206 bad entries found
 * - Added delivery/marketplace patterns (instacart, doordash, etc.)
 * - Added gift/promotional patterns from database cleanup
 * - Enhanced educational content patterns
 * - Added forum/discussion patterns
 */

export interface NonProductFilterConfig {
  version: string;
  patterns: {
    furniture: RegExp[];
    tours: RegExp[];
    merchandise: RegExp[];
    beer: RegExp[];
    articles: RegExp[];
    retail: RegExp[];
    cocktails: RegExp[];
    food: RegExp[];
    events: RegExp[];
    storePage: RegExp[];  // V2.8: New category
    podcast: RegExp[];    // V2.9: New category - found 2 bad entries
    recipeContent: RegExp[];  // V2.9: New category - found 206 bad entries
    deliveryMarketplace: RegExp[];  // V2.9: New category - marketing language
    giftPromotion: RegExp[];  // V2.9: New category - promotional content
    educational: RegExp[];  // V2.9: Enhanced category - schools, education
    forumDiscussion: RegExp[];  // V2.9: New category - forum posts, discussions
    ecommerceMetadata: RegExp[];  // V2.9.1: ULTRATHINK - shipping/SKU metadata
  };
  urlPatterns: {
    furniture: string[];
    tours: string[];
    merchandise: string[];
    articles: string[];
    retail: string[];
    storePage: string[];  // V2.8: New category
    podcast: string[];    // V2.9: New category
    recipeContent: string[];  // V2.9: New category
    deliveryMarketplace: string[];  // V2.9: New category
    forumDiscussion: string[];  // V2.9: New category
    ecommerceMetadata: string[];  // V2.9.1: ULTRATHINK - K&L Wine metadata
  };
  requiredSpiritIndicators: RegExp[];
  alcoholContentPatterns: RegExp[];
  confidenceThresholds: {
    high: number;
    medium: number;
    low: number;
  };
}

export const NON_PRODUCT_FILTERS: NonProductFilterConfig = {
  version: '2.9.1',  // V2.9.1: ULTRATHINK database cleanup findings - K&L Wine shipping metadata
  
  patterns: {
    // V2.7.4: Furniture and home decor
    furniture: [
      /\b(sconce|sconces|nightstand|nightstands|table|tables|chair|chairs)\b/i,
      /\b(sofa|couch|loveseat|ottoman|bench|stool|dresser|armoire)\b/i,
      /\b(cabinet|shelf|shelves|bookcase|desk|vanity|mirror)\b/i,
      /\b(lamp|lamps|chandelier|lighting|light\s+fixture)\b/i,
      /\b(rug|carpet|curtain|curtains|drape|drapes|blinds)\b/i,
      /\b(furniture|decor|decoration|decorative|home\s+goods)\b/i,
      /\b(interior\s+design|home\s+decor|room\s+decor)\b/i,
      /\b(dining\s+set|bedroom\s+set|living\s+room)\b/i,
    ],
    
    // Tour and experience patterns
    tours: [
      /\b(distillery|brewery|winery)\s+(tour|tours|visit|experience)\b/i,
      /\b(book\s+a\s+tour|schedule\s+a\s+visit|plan\s+your\s+visit)\b/i,
      /\b(guided\s+tour|self\-guided\s+tour|walking\s+tour)\b/i,
      /\b(tasting\s+room|visitor\s+center)\s+(hours|open|visit)\b/i,
      /\b(kentucky\s+distillery\s+&\s+bourbon\s+tours)\b/i,
      /\b(whiskey\s+trail\s+home|bourbon\s+trail)\b/i,
      // Only match "tour" or "tours" as complete words, not within other words
      /\btours?\b(?!\s+(?:reserve|special|limited|edition|single|barrel|bourbon|whiskey|whisky))/i,
    ],
    
    // Merchandise and accessories - V2.7.5: More targeted patterns
    merchandise: [
      // Clothing patterns - must be explicit apparel items
      /\b(t-?shirt|tee|polo\s+shirt|hoodie|sweatshirt|sweater)\s*(for\s+men|for\s+women|unisex)?\b/i,
      /\b(baseball\s+cap|beanie|snapback|trucker\s+hat)\b/i,
      /\b(men's|women's|mens|womens|unisex)\s+(shirt|jacket|hoodie|apparel)\b/i,
      /\b(clothing|merchandise|merch)\s+(store|shop|section|available)\b/i,
      /\bsize\s+(small|medium|large|x+l)\b/i,
      
      // Glassware - only when sold as accessories, not containing spirits
      /\b(shot\s+glass|beer\s+mug|pint\s+glass|wine\s+glass)\s+(set|gift|with\s+logo)\b/i,
      /\b(glassware|barware)\s+(set|collection|accessories)\b/i,
      
      // Promotional items - only with specific context
      /\b(coaster|bottle\s+opener|key\s*chain|sticker|patch|pin|badge)\s+(with|featuring|branded)\b/i,
      /\b(barrel\s+head|barrel\s+stave|wood\s+sign|wall\s+art)\s+(decor|decoration|for\s+sale)\b/i,
      
      // Fashion items - be very specific
      /\b(sandal|sandals|boot|boots|shoe|shoes)\s+(in\s+cognac|leather|fashion)\b/i,
      /\b(earring|necklace|bracelet)\s+(jewelry|jewellery|fashion)\b/i,
      /\b(handbag|purse|wallet)\s+(leather|designer|fashion)\b/i,
      /\b(watch|timepiece)\s+(luxury|designer|fashion)\b/i,
      
      // Craft supplies - only when clearly craft context
      /\b(knitting|crochet|sewing)\s+(yarn|fabric|supplies)\b/i,
      /\b(yarn|fabric|textile)\s+(for\s+knitting|for\s+crafts|supplies)\b/i,
      
      // V2.9: Office supplies found in database
      /\b3\s*m\s+scotch/i,
      /\bscotch\s+(tape|weld|adhesive|glue|magic\s+tape)/i,
      /\bepoxy\s+adhesive/i,
      /\bdry\s+erase\s+tape/i,
      /\bscotch\s+brand/i,
      /\btape\s+refill\s+rolls/i,
      /\boffice\s+supplies/i,
    ],
    
    // Beer and non-spirit beverages
    beer: [
      // Direct beer type indicators - must be the primary product type
      /\b(?:goose\s+island\s+bourbon\s+county\s+stout)\b/i,  // Specific known beer
      /\b(?:beer|beers|ale|ales|lager|lagers|stout|stouts)(?:\s|$)/i,  // Beer as product, not ingredient
      /\b(?:ipa|porter|pilsner|wheat\s+beer|craft\s+beer)\b/i,
      /\b(?:draft|draught|on\s+tap|beer\s+list)\b/i,
      // Brewery context - only when it's about beer production
      /\bbrewery\s+(?:tour|visit|experience)\b/i,
      /\b(?:brewing\s+company|craft\s+brewery)\b/i,
      // Beer-specific descriptions
      /\b(?:hops|hoppy|malty)\s+(?:flavor|aroma|notes)\b/i,
      /\b(?:beer|ale|stout)\s+(?:aged|aging)\s+in\s+bourbon\s+barrels\b/i,
      // Avoid matching bourbon/whiskey aged in barrels
      /(?<!bourbon\s)(?<!whiskey\s)(?<!whisky\s)barrel\s+aged\s+(?:beer|ale|stout)\b/i,
    ],
    
    // Articles, blogs, and news
    articles: [
      /\b(article|articles|blog|blogs|news|newsletter)\b/i,
      /\b(review|reviews|reviewing|comparison|versus|vs\.?)\b/i,
      /\b(guide|guides|how to|tutorial|tips)\b/i,
      /\b(story|stories|history|heritage|timeline)\b/i,
      /\b(interview|feature|spotlight|profile)\b/i,
      /\b(continues expansion|responds to|announces|unveils)\b/i,
      /\b(why .+ stands out|best .+ of \d{4})\b/i,
      /\b(archives?|press release|media)\b/i,
      
      // V3.0: Blog post patterns from database analysis
      /^we['']re\s+/i,  // "We're Living In A Golden Age"
      /^i['']ve\s+tried/i,  // "I've Tried Hundreds Of"
      /^we\s+tasted/i,  // "We Tasted 19 Non Alcoholic"
      /^we['']ve\s+tasted/i,  // "We've Tasted Hundreds"
      /^top\s+\d+\s+/i,  // "Top 10", "Top 5"
      /^\d+\s+(best|absolute\s+best)/i,  // "14 Absolute Best", "8 Best"
      /\bthe\s+fifty\s+best\b/i,  // "The Fifty Best"
      /\bcritici?['']s\s+choice\b/i,  // "Critic's Choice"
      /\bbest\s+of\s+\d{4}\b/i,  // "Best Of 2025"
    ],
    
    // Retail and category pages - V2.8: Enhanced based on database analysis
    retail: [
      /\b(retail|retailer|store|shop|shopping)\b/i,
      /\b(category|categories|catalog|collection)\b/i,
      /\b(browse|search results|product list)\b/i,
      /\b(bourbon-bhg|spirits-bhg|whiskey-bhg)\b/i,
      /\b(menu|menus|price list|inventory)\b/i,
      /\b(buy online|add to cart|checkout)\b/i,
      // Seasonal/promotional patterns
      /\b(holiday|christmas|thanksgiving|easter|summer|winter|spring|fall)\s+(release|releases|special|collection|edition)\b/i,
      /\b(special|limited|seasonal)\s+(release|releases|available|offerings?)\b/i,
      /\b(available\s+now|just\s+released|new\s+arrivals?|coming\s+soon)\b/i,
      /\b(holiday\s+cask\s+strength\s+single\s+barrels)\b/i,  // Specific pattern from CSV
      // V2.8: Marketing language patterns from database analysis
      /\bbuy\s+.+\s+online\b/i,
      /\border\s+.+\s+near\s+me\b/i,
      /\bproducts?\s+delivery\s+or\s+pickup\b/i,
      /\b(delivery|pickup)\s+near\s+me\b/i,
      /\bis\s+a\s+premium\s+(whiskey|bourbon|spirit|tequila|rum|gin|vodka)\b/i,
      /\bproducts-\w+\b/i,  // Products- prefix pattern
      /\bgift\s+guide\b/i,
      /\bcase\s+bundle\b/i,
      /\b(find|order|locate)\s+.+\s+near\s+(me|you)\b/i,
      
      // V3.0: Category and collection pages
      /^discover\s+/i,  // "Discover Premium Gold Rum"
      /\bbest\s+price\s+guarantee\b/i,
      /^all\s+extra\s+.+\s+best\s+selection\b/i,
      /\b(ratings|ratings\s+and\s+reviews)\b/i,
      /^product\s+(detail|description)\b/i,
      /^products\s+/i,  // "Products The Southern Whiskey Society"
      /\bcollection\s+(bourbon|gin|vodka|rum|whiskey|tequila)\b/i,
      /^new\s+.+\s+arrivals?\b/i,
      /^contact\s+us\b/i,
    ],
    
    // Cocktails and mixed drinks - V2.7.5: Only match clear cocktail contexts
    cocktails: [
      /\b(cocktail|cocktails|mixed\s+drink|mixer)\s+(recipe|menu|list|how\s+to)\b/i,
      /\b(how\s+to\s+make|recipe\s+for|ingredients\s+for)\s+.{0,20}\s+(cocktail|drink)\b/i,
      /\b(martini|margarita|manhattan|old\s+fashioned)\s+(recipe|ingredients|how\s+to\s+make)\b/i,
      /\b(bourbon\s+sour|whiskey\s+sour|mint\s+julep)\s+(recipe|how\s+to|ingredients)\b/i,
      /\b(shake|stir|muddle|strain)\s+(well|until|gently)\s+.{0,20}\s+(cocktail|drink)\b/i,
      /\b(simple\s+syrup|bitters|vermouth)\s+(recipe|to\s+taste|for\s+cocktail)\b/i,
    ],
    
    // Food and restaurant items
    food: [
      /\b(food|foods|meal|meals|dish|dishes)(?!\s*\d+\s*year)/i,
      /\b(restaurant|dining|kitchen)\s+(menu|service|hours)\b/i,
      /\b(pie|cake|dessert|appetizer|entree)\b/i,
      /\b(chocolate\s+pecan\s+pie|bourbon\s+sauce)\b/i,
      /\b(recipe|cooking|baking)\s+(with|for|instructions)\b/i,
      // Avoid matching spirits with food-like names
      /(?<!wild\s)(?<!\w)turkey(?!\s+\d+|\s+rare|\s+101)(?:\s+dinner|\s+sandwich)?/i,
      // V2.9: Specific patterns found in database
      /\bscotch\s+eggs?\b/i,
      /\btaco\s*(bar|restaurant|cantina)/i,
      /\btequila\s+escape\b/i,
      /\bmr\.\s*tequila\s+mexican\s+restaurant/i,
      /\bxo\s+taco\s+taco\s*&\s*tequila\s+bar/i,
      /\bauthentic\s+mexican\s+restaurant/i,
    ],
    
    // Events and tickets
    events: [
      /\b(event|events|festival|celebration)\b/i,
      /\b(ticket|tickets|admission|entry)\b/i,
      /\b(concert|show|performance|entertainment)\b/i,
      /\b(date|dates|schedule|calendar)\b/i,
      /\b(rsvp|register|registration|booking)\b/i,
      // V2.9: Specific patterns found in database
      /\beventbrite\b/i,
      /\btequila\s+and\s+tacos\s+(festival|tickets)/i,
      /\brn\s*b\s+tequila\s+festival/i,
      /\btacos\s+and\s+tequila\s+festival/i,
      /\bdreamville\s+festival/i,
    ],
    
    // V2.8: Store/brand pages rather than specific products
    storePage: [
      // Brand collection pages
      /\b(buffalo\s+trace|jack\s+daniels|jim\s+beam)\s+(products|bourbon|whiskey|collection)\b/i,
      /\bproducts?\s*-\s*(old\s+town|epicurious|barbank)\b/i,
      /\b(brands|collections)\/(buffalo-trace|jack-daniels|jim-beam)\b/i,
      // Generic store listings
      /\b(all|browse|shop)\s+(buffalo\s+trace|bourbon|whiskey|spirits)\b/i,
      /\b(buffalo\s+trace|bourbon|whiskey)\s+(page|section|category)\b/i,
      // Multiple products in name
      /\b(bourbon|whiskey|vodka|rum|gin)\s+.+\s+(bourbon|whiskey|vodka|rum|gin)\s+.+\s+(bourbon|whiskey|vodka|rum|gin)\b/i,
      // Store navigation
      /\bview\s+all\s+(products|spirits|bourbon|whiskey)\b/i,
      /\bsort\s+by\s+(price|name|popularity)\b/i,
    ],
    
    // V2.9: Podcast and media content - found 2 bad entries
    podcast: [
      /\bpodcast\b/i,
      /\bepisode\s+\d+/i,
      /\bapple\s+podcasts\b/i,
      /\bspotify\b.*\bpodcast\b/i,
      /\b(listen|subscribe)\s+on\s+(apple|spotify|google)\b/i,
      /\b(podcast|show)\s+(host|guest|interview)\b/i,
      /\b(bourbon|whiskey)\s+(podcast|show|obsessed)\b/i,
    ],
    
    // V2.9: Recipe and cocktail content - found 206 bad entries (largest category)
    recipeContent: [
      /\bcocktail\s+recipe/i,
      /\brecipe\s+for\b/i,
      /\bhow\s+to\s+make\b/i,
      /\bmixed\s+drink\s+recipe/i,
      /\bdrink\s+recipes?\b/i,
      /\bcocktails?\s+to\s+try/i,
      /\b\d+\s+.*\s+cocktails?\b/i, // "20 Vodka Cocktails"
      /\bcocktail\s+(ingredients|instructions|directions)\b/i,
      /\bmixer\s+recipe/i,
      /\b(shake|stir|muddle|strain)\s+.+\s+(cocktail|drink)\b/i,
      /\bbartender\s+(guide|recipe)\b/i,
      /\b(bourbon|vodka|gin|rum)\s+cocktail\s+recipe/i,
      /\bsummer\s+(tequila|bourbon|vodka)\s+cocktail/i,
    ],
    
    // V2.9: Delivery and marketplace patterns - marketing language
    deliveryMarketplace: [
      /\binstacart\b/i,
      /\bdoordash\b/i,
      /\bubereats\b/i,
      /\bgopuff\b/i,
      /\bdelivery\s+near\s+me\b/i,
      /\bpickup\s+near\s+me\b/i,
      /\bdelivery\s+or\s+pickup\b/i,
      /\bsame\s+day\s+delivery\b/i,
      /\b(order|buy)\s+.+\s+near\s+me\b/i,
      /\b(available|eligible)\s+for\s+delivery\b/i,
      /\bfree\s+delivery\b/i,
    ],
    
    // V2.9: Gift and promotional content
    giftPromotion: [
      /\bgift\s+guide\b/i,
      /\bfather'?s?\s+day\b/i,
      /\bmother'?s?\s+day\b/i,
      /\bholiday\s+gift/i,
      /\bvalentine'?s?\s+day\b/i,
      /\bchristmas\s+gift/i,
      /\bthanksgiving\s+gift/i,
      /\bbest\s+gifts?\s+for\b/i,
      /\bgift\s+ideas?\b/i,
      /\bunder\s+\$\d+\b/i, // "Under $50"
      /\bgifts?\s+(under|for)\b/i,
      /\bperfect\s+gift\b/i,
    ],
    
    // V2.9: Enhanced educational content - schools, education
    educational: [
      /\bschool\b/i,
      /\bschools\b/i,
      /\bcounty\s+school/i,
      /\beducation\b/i,
      /\bstudent/i,
      /\bstudents\b/i,
      /\bacademy\b.*\bprogram\b/i,
      /\buniversity\b/i,
      /\bcollege\b/i,
      /\blearning\b/i,
      /\bcourse\b/i,
      /\btraining\b/i,
    ],
    
    // V2.9: Forum and discussion content - found 6 bad entries
    forumDiscussion: [
      /\bforum\b/i,
      /\bthread\b/i,
      /\bdiscussion\b/i,
      /\breddit\b/i,
      /\bpost\s+by\b/i,
      /\bposted\s+by\b/i,
      /\breplies?\b/i,
      /\bcomments?\b/i,
      /\bupvote/i,
      /\bdownvote/i,
      /\bmoderator\b/i,
      /\bOP\s+(said|posted)\b/i,
    ],
    
    // V2.9.1: ULTRATHINK - E-commerce metadata patterns (K&L Wine specific)
    ecommerceMetadata: [
      /\(Ship As A \d+\.\)/i,
      /\(Ships As A \d+\.\)/i,
      /Sku \d+$/i,
      /Sku$/i,
      /Product Detail /i,
      /Get .* Online Today/i,
      /Limited Stock$/i,
      /\bDue To Bottle Size\/shape\)/i,
      /\(Can't Be Shipped\)/i,
      /\bSku \d{7}/i,  // K&L Wine 7-digit SKUs
    ],
  },
  
  // URL patterns that indicate non-product pages
  urlPatterns: {
    furniture: [
      '/furniture', '/home-decor', '/lighting', '/lamps',
      '/tables', '/chairs', '/bedroom', '/living-room',
      '/interior-design', '/home-goods', '/decor',
    ],
    tours: [
      '/tour', '/tours', '/visit', '/visitor', '/experience',
      '/distillery-tour', '/book-tour', '/plan-visit',
    ],
    merchandise: [
      '/shop', '/merchandise', '/merch', '/store', '/gift-shop',
      '/apparel', '/accessories', '/clothing',
    ],
    articles: [
      '/blog', '/news', '/article', '/stories', '/press',
      '/review', '/comparison', '/guide', '/tips',
    ],
    retail: [
      '/category', '/catalog', '/browse', '/search',
      '/retail', '/wholesale', '/trade',
    ],
    // V2.8: Store page URL patterns
    storePage: [
      '/collections/', '/brands/', '/all-products',
      '/bourbon-collection', '/whiskey-collection',
      '/buffalo-trace-collection', '/product-category/',
      '?sort=', '?filter=', '/page/', '/products?',
    ],
    
    // V2.9: Podcast URL patterns
    podcast: [
      '/podcast', '/podcasts', '/show', '/episode',
      'podcasts.apple.com', 'spotify.com/show',
      'podcasts.google.com', '/listen', '/episodes',
    ],
    
    // V2.9: Recipe and cocktail URL patterns
    recipeContent: [
      '/recipe', '/recipes', '/cocktail', '/cocktails',
      '/how-to-make', '/mixed-drink', '/bartender',
      '/drink-recipe', '/cocktail-recipe',
    ],
    
    // V2.9: Delivery and marketplace URL patterns
    deliveryMarketplace: [
      'instacart.com', 'doordash.com', 'ubereats.com',
      'gopuff.com', '/delivery', '/pickup',
      '/same-day-delivery', '/order-online',
    ],
    
    // V2.9: Forum and discussion URL patterns
    forumDiscussion: [
      'reddit.com', '/forum', '/forums', '/discussion',
      '/thread', '/post', '/community', '/talk',
    ],
    
    // V2.9.1: ULTRATHINK - E-commerce metadata URL patterns
    ecommerceMetadata: [
      '/p/i?i=', // K&L Wine product ID pattern
      '/detail.asp?sku=', // K&L Wine detail pattern
      '/products/details/', // K&L Wine product details
      '?userReferral=', // K&L Wine referral tracking
      '?searchId=', // K&L Wine search tracking
    ],
    
    // V3.1: Mystery subscription URLs
    mysterySubscription: [
      '/subscription', '/mystery-box', '/monthly-box',
      '/membership', '/club', '/subscribe',
    ],
    
    // V3.1: Restaurant URLs
    restaurant: [
      '/restaurant', '/steakhouse', '/dining',
      '/menu', '/reservations', '/book-table',
    ],
  },
  
  // Patterns that MUST be present for a valid spirit product
  requiredSpiritIndicators: [
    /\b(whiskey|whisky|bourbon|scotch|rye|irish)\b/i,
    /\b(vodka|gin|rum|tequila|mezcal|cognac|brandy)\b/i,
    /\b(spirit|spirits|liquor|liqueur|alcohol|distilled)\b/i,
    /\b(bottle|bottles|750ml|1L|liter|proof|abv)\b/i,
    /\b(aged|aging|barrel|cask|distillery|distillation)\b/i,
    // V2.7.5: Japanese and international spirits
    /\b(japanese|sake|shochu|baijiu|aquavit|grappa|pisco|calvados|armagnac)\b/i,
    // V2.7.5: Japanese whisky distilleries/brands
    /\b(suntory|nikka|hibiki|yamazaki|hakushu|yoichi|miyagikyo|chichibu|mars|akashi|taketsuru)\b/i,
    // V2.7.5: Common Japanese whisky descriptors
    /\b(single\s+malt|blended|pure\s+malt|grain|malt)\b/i,
    // V2.7.5: International brand indicators
    /\b(hennessy|martell|remy|patron|grey\s+goose|johnnie|macallan|glenfiddich)\b/i,
  ],
  
  // Alcohol content patterns for validation
  alcoholContentPatterns: [
    /\b\d{1,2}\.?\d*\s*%\s*(abv|alcohol|alc)/i,
    /\b\d{2,3}\s*proof\b/i,
    /\babv\s*:?\s*\d{1,2}\.?\d*\s*%/i,
    /\balcohol\s*:?\s*\d{1,2}\.?\d*\s*%/i,
    /\b(40|43|45|47|50|53|55|57|60)\s*%/i, // Common spirit ABVs
  ],
  
  // Confidence thresholds for filtering decisions
  confidenceThresholds: {
    high: 0.9,    // Very confident it's not a spirit
    medium: 0.7,  // Moderately confident
    low: 0.5,     // Low confidence, needs more checks
  },
};

/**
 * Helper function to check if a text contains non-product patterns
 */
export function containsNonProductPatterns(
  text: string,
  category: keyof NonProductFilterConfig['patterns']
): boolean {
  const patterns = NON_PRODUCT_FILTERS.patterns[category];
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Helper function to check if a URL contains non-product patterns
 */
export function isNonProductUrl(url: string): { isNonProduct: boolean; category?: string } {
  const lowerUrl = url.toLowerCase();
  
  for (const [category, patterns] of Object.entries(NON_PRODUCT_FILTERS.urlPatterns)) {
    if (patterns.some(pattern => lowerUrl.includes(pattern))) {
      return { isNonProduct: true, category };
    }
  }
  
  return { isNonProduct: false };
}

/**
 * Helper function to check if text contains required spirit indicators
 */
export function hasRequiredSpiritIndicators(text: string): boolean {
  return NON_PRODUCT_FILTERS.requiredSpiritIndicators.some(pattern => pattern.test(text));
}

/**
 * Helper function to detect alcohol content in text
 */
export function hasAlcoholContent(text: string): boolean {
  return NON_PRODUCT_FILTERS.alcoholContentPatterns.some(pattern => pattern.test(text));
}