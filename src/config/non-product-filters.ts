/**
 * Non-Product Filtering Configuration
 * Version: 1.0.0
 * 
 * This configuration defines patterns to identify and filter out non-spirit products
 * from search results at multiple stages of the scraping process.
 */

export interface NonProductFilterConfig {
  version: string;
  patterns: {
    tours: RegExp[];
    merchandise: RegExp[];
    beer: RegExp[];
    articles: RegExp[];
    retail: RegExp[];
    cocktails: RegExp[];
    food: RegExp[];
    events: RegExp[];
  };
  urlPatterns: {
    tours: string[];
    merchandise: string[];
    articles: string[];
    retail: string[];
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
  version: '1.0.0',
  
  patterns: {
    // Tour and experience patterns
    tours: [
      /\b(distillery|brewery|winery)\s+(tour|tours|visit|experience)\b/i,
      /\b(book\s+a\s+tour|schedule\s+a\s+visit|plan\s+your\s+visit)\b/i,
      /\b(guided\s+tour|self\-guided\s+tour|walking\s+tour)\b/i,
      /\b(tasting\s+room|visitor\s+center)\s+(hours|open|visit)\b/i,
      /\b(kentucky\s+distillery\s+&\s+bourbon\s+tours)\b/i,
      /\b(whiskey\s+trail\s+home|bourbon\s+trail)\b/i,
      // Avoid matching product names with "Reserve"
      /(?<!reserve\s)(?<!\w)tour(?:s)?(?!\w)/i,
    ],
    
    // Merchandise and accessories
    merchandise: [
      /\b(t-?shirt|tee|polo\s+shirt|hoodie|sweatshirt|sweater|apparel)\b/i,
      /\b(baseball\s+cap|beanie|snapback|trucker\s+hat)\b/i,
      /\b(men's|women's|mens|womens|unisex)\s+(shirt|jacket|hoodie|apparel)\b/i,
      /\b(clothing|merchandise|merch)\s+(store|shop|section|available)\b/i,
      /\b(size)\s+(small|medium|large|x+l)\b/i,
      /\b(shot\s+glass|beer\s+mug|pint\s+glass|wine\s+glass)(?!\s*\d+ml)\b/i,
      /\b(glassware|barware)\s+(set|collection|accessories)\b/i,
      /\b(coaster|bottle\s+opener|key\s*chain|sticker|patch|pin|badge)\s+(with|featuring)\b/i,
      /\b(barrel\s+head|barrel\s+stave|wood\s+sign|wall\s+art)\s+(decor|decoration)\b/i,
      /\b(white|black|red|blue|green|navy|gray|grey)\s+(polo|shirt|tee|top|jacket)\b/i,
      /\b(cotton|polyester|fabric|material)\s+(blend|content|made\s+from)\b/i,
      // Don't match spirit names that might contain these words
      /(?<!wild\s+turkey\s+rare\s)breed(?!\s+bourbon|\s+rye|\s+whiskey)/i,
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
    
    // Retail and category pages
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
    ],
    
    // Cocktails and mixed drinks
    cocktails: [
      /\b(cocktail|cocktails|mixed\s+drink|mixer)\s+(recipe|menu|list)\b/i,
      /\b(how\s+to\s+make|recipe\s+for|ingredients\s+for)\s+\w+\s+(cocktail|drink)\b/i,
      /\b(martini|margarita|manhattan|old\s+fashioned)\s+(recipe|ingredients)\b/i,
      /\b(bourbon\s+sour|whiskey\s+sour|mint\s+julep)\s+(recipe|how\s+to)\b/i,
      /\b(shake|stir|muddle|strain)\s+(well|until|gently)\b/i,
      /\b(simple\s+syrup|bitters|vermouth)\s+(recipe|to\s+taste)\b/i,
      // Don't match product names that happen to contain cocktail words
      /(?<!piggy)back(?!\s+\d+|\s+bourbon|\s+rye|\s+whiskey)/i,
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
  },
  
  // URL patterns that indicate non-product pages
  urlPatterns: {
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
  },
  
  // Patterns that MUST be present for a valid spirit product
  requiredSpiritIndicators: [
    /\b(whiskey|whisky|bourbon|scotch|rye|irish)\b/i,
    /\b(vodka|gin|rum|tequila|mezcal|cognac|brandy)\b/i,
    /\b(spirit|spirits|liquor|liqueur|alcohol|distilled)\b/i,
    /\b(bottle|bottles|750ml|1L|liter|proof|abv)\b/i,
    /\b(aged|aging|barrel|cask|distillery|distillation)\b/i,
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