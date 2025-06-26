/**
 * Non-Product Filtering Configuration
 * Version: 2.8.0
 * 
 * This configuration defines patterns to identify and filter out non-spirit products
 * from search results at multiple stages of the scraping process.
 * 
 * V2.8 Changes:
 * - Added marketing language patterns ("buy online", "near me", etc.)
 * - Added store page detection patterns
 * - Enhanced retail patterns based on database analysis
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
  };
  urlPatterns: {
    furniture: string[];
    tours: string[];
    merchandise: string[];
    articles: string[];
    retail: string[];
    storePage: string[];  // V2.8: New category
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
  version: '2.8.0',  // V2.8: Enhanced marketing language and store page detection
  
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
    ],
    
    // Events and tickets
    events: [
      /\b(event|events|festival|celebration)\b/i,
      /\b(ticket|tickets|admission|entry)\b/i,
      /\b(concert|show|performance|entertainment)\b/i,
      /\b(date|dates|schedule|calendar)\b/i,
      /\b(rsvp|register|registration|booking)\b/i,
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