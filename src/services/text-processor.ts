/**
 * Text Processing Service
 * 
 * Provides comprehensive text processing utilities for spirit data normalization.
 * Handles spacing, categorization, age extraction, description validation, and brand formatting.
 */

export class TextProcessor {
  // Common spirit categories with variations
  private static readonly CATEGORY_PATTERNS: Record<string, RegExp[]> = {
    whiskey: [
      /whiskey|whisky/i,
      /bourbon/i,
      /scotch/i,
      /rye\s+whiskey/i,
      /irish\s+whiskey/i,
      /single\s+malt/i,
      /blended\s+whiskey/i,
      /tennessee\s+whiskey/i,
      /canadian\s+whisky/i,
      /japanese\s+whisky/i
    ],
    vodka: [
      /vodka/i,
      /flavored\s+vodka/i,
      /premium\s+vodka/i
    ],
    rum: [
      /\brum\b/i,
      /spiced\s+rum/i,
      /dark\s+rum/i,
      /white\s+rum/i,
      /gold\s+rum/i,
      /aged\s+rum/i,
      /caribbean\s+rum/i,
      /rhum/i,
      /cachaca/i
    ],
    gin: [
      /\bgin\b/i,
      /london\s+dry/i,
      /sloe\s+gin/i,
      /genever/i,
      /old\s+tom/i
    ],
    tequila: [
      /tequila/i,
      /blanco/i,
      /reposado/i,
      /añejo/i,
      /extra\s+añejo/i,
      /cristalino/i,
      /mezcal/i
    ],
    brandy: [
      /brandy/i,
      /cognac/i,
      /armagnac/i,
      /calvados/i,
      /pisco/i,
      /grappa/i,
      /marc/i
    ],
    liqueur: [
      /liqueur/i,
      /cordial/i,
      /schnapps/i,
      /amaretto/i,
      /baileys/i,
      /kahlua/i,
      /cointreau/i,
      /grand\s+marnier/i,
      /triple\s+sec/i,
      /creme\s+de/i
    ],
    wine: [
      /\bwine\b/i,
      /champagne/i,
      /prosecco/i,
      /cava/i,
      /sherry/i,
      /port\b/i,
      /vermouth/i,
      /madeira/i
    ],
    beer: [
      /\bbeer\b/i,
      /\bale\b/i,
      /lager/i,
      /stout/i,
      /porter/i,
      /pilsner/i,
      /\bipa\b/i,
      /wheat\s+beer/i
    ],
    other: [
      /absinthe/i,
      /aperitif/i,
      /bitters/i,
      /amaro/i,
      /sake/i,
      /soju/i,
      /baijiu/i
    ]
  };

  // Review and non-product description indicators
  private static readonly REVIEW_INDICATORS = [
    /^(i|we|you|they|he|she)\s/i,
    /taste[sd]?\s+(like|good|bad|great)/i,
    /my\s+(favorite|favourite|go-to)/i,
    /recommend/i,
    /worth\s+the\s+(money|price)/i,
    /\b(love|hate|enjoy|dislike)\s+(this|it)/i,
    /bought\s+this/i,
    /tried\s+this/i,
    /\d+\s+stars?/i,
    /out\s+of\s+\d+/i,
    /rating:/i,
    /review:/i,
    /verified\s+purchase/i,
    /helpful\s+to\s+\d+/i
  ];

  // Product description indicators
  private static readonly PRODUCT_INDICATORS = [
    /aged\s+(\d+|in|for)/i,
    /distilled\s+(from|in|by)/i,
    /crafted\s+(with|from|by)/i,
    /made\s+(with|from|in)/i,
    /blend\s+of/i,
    /notes?\s+of/i,
    /finish(ed)?\s+(with|in)/i,
    /cask|barrel|oak/i,
    /proof|abv|alcohol/i,
    /smooth|crisp|bold|rich/i,
    /flavor|flavour|taste|aroma|nose|palate/i,
    /bottle[sd]?\s+(at|in|by)/i
  ];

  /**
   * V2.7.1: Remove navigation and store prefixes from names
   */
  public static removeNavigationPrefixes(text: string): string {
    if (!text) return '';
    
    let result = text;
    
    // Remove common prefixes
    const prefixPatterns = [
      /^our\s+(bourbon|whiskey|collection|selection|range|products?)\s*/i,
      /^new\s+products?\s*[-–—:]\s*/i,
      /^latest\s+(whiskies|spirits)\s*/i,
      /^shop\s+(now|today|online)\s*/i,
      /^buy\s+(now|today|online)\s*/i,
      /^explore\s+(our|the)\s*/i,
      /^discover\s+(our|the)\s*/i,
      /^browse\s+(our|the)\s*/i,
      /^view\s+(our|the|all)\s*/i,
      /^featured\s+(products?|spirits?|whiskies)\s*/i,
      /^available\s+(at|now)\s*/i,
      /^type\.\s*/i,  // Remove "Type. " prefix
      
      // V2.7.2: Additional prefixes
      /^visit\s+our\s*/i,
      /^check\s+out\s*/i,
      /^find\s+(at|in)\s*/i,
      /^get\s+your\s*/i,
      /^order\s+(now|today|online)\s*/i,
      /^purchase\s+(at|from)\s*/i,
    ];
    
    for (const pattern of prefixPatterns) {
      result = result.replace(pattern, '');
    }
    
    return result.trim();
  }
  
  /**
   * V2.7.2: Remove store suffixes from names
   */
  public static removeStoreSuffixes(text: string): string {
    if (!text) return '';
    
    let result = text;
    
    // Remove common suffixes
    const suffixPatterns = [
      /\s+mission\s*$/i,
      /\s+wine\s*$/i,
      /\s+wine\s*(&|and)?\s*spirits?\s*$/i,
      /\s+liquor\s*store\s*$/i,
      /\s+(&|and)\s*$/i,
      /\s+(\.{3}|\.\.\.|…)\s*$/,  // Truncation indicators
      /\s+\|\s*.*$/,  // Remove everything after pipe
      /\s*[-–—]\s*(shop|store|buy|online).*$/i,
      /\s+at\s+\w+\s*(wine|liquor|spirits).*$/i,
      /\s+available\s+at.*$/i,
      /\s+from\s+\w+.*$/i,
      
      // V2.7.4: Specific store names identified from database cleanup
      /\s+liquor\s+legends?\s*(nz)?\s*$/i,
      /\s+sovereignty\s+wines?\s*$/i,
      /\s+mac\s+arthur\s+beverages?\s*$/i,
      /\s+naija\s+liquor\s*$/i,
      /\s+divine\s+cellar\s*$/i,
      /\s+culturebox\s*$/i,
      /\s+whisky\.my\s*$/i,
      /\s+thewinelist\.cy\s*$/i,
      /\s+port\s+2\s+port\s+(online\s+)?wine\s+store\s*$/i,
      /\s+twin\s+liquors?\s*$/i,
      /\s+wine\s+delight\s*$/i,
      /\s+wine\s*&\s*liquor\s+mart\s*$/i,
      /\s+liquor\s+corporation\s*$/i,
      /\s+lisa'?s\s+liquor\s*$/i,
      /\s+woodland\s+hills\s+wine\s+company\s*$/i,
      /\s+liquorama\s*$/i,
      /\s+superstore\s*$/i,
      /\s+rare\s+whiskey\s*&\s*co\.?\s*$/i,
      /\s+winestore\s+online\s*(\d+[\.,]\d+)?\s*$/i,
      /\s+five\s+towns\s+wine\s*&\s*liquor\s*$/i,
      /\s+scotch\s+malt\s+whisky\s+society\s*(eu\s+store)?\s*$/i,
      /\s+cana\s+wine\s+company\s*$/i,
      /\s+food\s+4\s+less\s*$/i,
      /\s+knast\s+liquor\s*$/i,
    ];
    
    for (const pattern of suffixPatterns) {
      result = result.replace(pattern, '');
    }
    
    return result.trim();
  }

  /**
   * Fix text spacing issues in concatenated or camelCase text
   */
  public static fixTextSpacing(text: string): string {
    if (!text) return '';

    let result = text;

    // CRITICAL FIX: Don't break up words that are already properly spaced!
    // Check if text already has proper spacing (contains spaces between words)
    const hasProperSpacing = /\s/.test(text.trim());
    
    // Only apply aggressive spacing fixes if text appears concatenated
    if (!hasProperSpacing || /[a-z][A-Z]/.test(text)) {
      // Fix camelCase by adding spaces before capitals (except consecutive capitals)
      // But skip if it would break up valid words like "Baller"
      result = result.replace(/([a-z])([A-Z])(?![a-z]{1,2}\s|ller\s)/g, '$1 $2');
    }
    
    // Fix numbers concatenated with text (but not ordinals like 40th)
    result = result.replace(/(\d)(?!st|nd|rd|th)([A-Za-z])/g, '$1 $2');
    result = result.replace(/([A-Za-z])(\d)/g, '$1 $2');
    
    // Fix ordinal numbers that got broken (40 Th -> 40th)
    result = result.replace(/(\d+)\s+(st|nd|rd|th)\b/gi, (match, num, suffix) => {
      return num + suffix.toLowerCase();
    });
    
    // Fix common concatenations in spirit names
    result = result.replace(/(\w)(Year|Years|YO|Yr|Proof|ABV|ML|ml|L)(?=[A-Z\s]|$)/g, '$1 $2');
    
    // Fix specific patterns
    result = result.replace(/SingleMalt/g, 'Single Malt');
    result = result.replace(/SmallBatch/g, 'Small Batch');
    result = result.replace(/StraightBourbon/g, 'Straight Bourbon');
    result = result.replace(/LimitedEdition/g, 'Limited Edition');
    result = result.replace(/SpecialRelease/g, 'Special Release');
    result = result.replace(/CaskStrength/g, 'Cask Strength');
    result = result.replace(/DoubleOaked/g, 'Double Oaked');
    result = result.replace(/TripleDistilled/g, 'Triple Distilled');
    result = result.replace(/BottledInBond/g, 'Bottled in Bond');
    result = result.replace(/SingleBarrel/g, 'Single Barrel');
    
    // V2.6.4: Fix ALL broken word patterns found in CSV analysis
    // Fix specific broken words we've seen
    result = result.replace(/\bBa Ller\b/g, 'Baller');
    result = result.replace(/\bMa Lt\b/g, 'Malt');
    result = result.replace(/\bSma Ll\b/g, 'Small');
    result = result.replace(/\bSing Le\b/g, 'Single');
    result = result.replace(/\bCa Lifornia\b/g, 'California');
    result = result.replace(/\bCast Le\b/gi, 'Castle');
    result = result.replace(/\bE Lijah\b/gi, 'Elijah');
    result = result.replace(/\bO Ld\b/gi, 'Old');
    result = result.replace(/\bAnnua L\b/gi, 'Annual');
    result = result.replace(/\bJ L\b/gi, 'JL');
    result = result.replace(/\bKy\b/gi, 'KY');
    result = result.replace(/\bBev Mo\b/gi, 'BevMo');
    result = result.replace(/\bNc Abcc\b/gi, 'NC ABCC');
    result = result.replace(/\bUs 1\b/gi, 'US1');
    result = result.replace(/\bUs1\b/gi, 'US1');
    result = result.replace(/\bY Ks\b/gi, 'YKS');
    result = result.replace(/\b(\d+) Y\b/gi, '$1Y');
    result = result.replace(/\b(\d+) Yr\b/gi, '$1Yr');
    result = result.replace(/\bYr Old\b/gi, 'Yr Old');
    result = result.replace(/\bBa Lcones\b/gi, 'Balcones');
    result = result.replace(/\bWhistle Pig\b/gi, 'WhistlePig');
    
    // Fix patterns where single letters are separated  
    result = result.replace(/\b([A-Z])\s+([a-z]{1,3})\b/g, (match, letter, suffix) => {
      // Common patterns to fix
      const fixes: Record<string, string> = {
        'E lijah': 'Elijah',
        'O ld': 'Old',
        'A nnual': 'Annual',
        'Y ear': 'Year',
        'B ourbon': 'Bourbon',
        'W hiskey': 'Whiskey',
        'S ingle': 'Single',
        'D istillery': 'Distillery',
        'R ye': 'Rye',
        'M alt': 'Malt',
        'B atch': 'Batch',
        'L imited': 'Limited',
        'R elease': 'Release',
        'S traight': 'Straight',
        'K entucky': 'Kentucky'
      };
      
      const key = `${letter} ${suffix}`;
      return fixes[key] || match;
    });
    
    // V2.7.1: Fix more broken spacing patterns found in database
    result = result.replace(/\bNe Lson\b/gi, 'Nelson');
    result = result.replace(/\bMc Kenzie\b/gi, 'McKenzie');
    result = result.replace(/\bDoub Le\b/gi, 'Double');
    result = result.replace(/\bGo Ld\b/gi, 'Gold');
    result = result.replace(/\bMeda L\b/gi, 'Medal');
    result = result.replace(/\bC Lassic\b/gi, 'Classic');
    result = result.replace(/\bBottled In Bond\b/gi, 'Bottled in Bond');
    
    // V2.7.1: Remove duplicate spirit type words
    result = result.replace(/\b(whiskey|whisky|bourbon|rum|gin|vodka|tequila|mezcal|cognac)\s+\1\b/gi, '$1');
    
    // V2.7.1: Fix "Bourbon Whiskey Whiskey" patterns
    result = result.replace(/\b(bourbon\s+whiskey)\s+whiskey\b/gi, '$1');
    result = result.replace(/\b(rye\s+whiskey)\s+whiskey\b/gi, '$1');
    
    // V2.7.1: Remove HTML artifacts
    result = result.replace(/<[^>]+>/g, '');
    result = result.replace(/\\["']/g, '');
    result = result.replace(/&[a-z]+;/gi, '');
    result = result.replace(/pmeta\s+charset[^"]*"/gi, '');
    result = result.replace(/\bstrong\s*Please\s+note\b/gi, '');
    
    // Clean up multiple spaces
    result = result.replace(/\s+/g, ' ').trim();
    
    // Remove empty parentheses that might remain after volume extraction
    result = result.replace(/\s*\(\s*\)\s*/g, ' ').trim();
    
    // V2.7.2: Fix malformed possessives
    result = result.replace(/([A-Z][a-z]+)[''´`]S\b/g, "$1's");  // Father'S -> Father's
    result = result.replace(/([A-Z][a-z]+)['']s\b/g, "$1's");   // Normalize apostrophes
    result = result.replace(/\b([A-Z])['']S\b/g, "$1's");       // J'S -> J's
    
    return result;
  }

  /**
   * Remove store names and artifacts from product names
   */
  public static removeStoreNames(text: string): string {
    if (!text) return '';
    
    let result = text;
    
    // Common store name patterns to remove
    const storePatterns = [
      // Specific store names
      /\s*(at\s+)?Bev\s*Mo!?$/i,
      /\s*(at\s+)?Total\s+Wine(\s*&\s*More)?$/i,
      /\s*(at\s+)?K\s*&\s*L\s+Wine(s)?$/i,
      /\s*(at\s+)?Astor\s+Wine(s)?(\s*&)?$/i,
      /\s*(at\s+)?Cask\s+Store$/i,
      /\s*(at\s+)?Wine\.com$/i,
      /\s*(at\s+)?ReserveBar$/i,
      /\s*(at\s+)?Drizly$/i,
      /\s*(at\s+)?Master\s+of\s+Malt$/i,
      /\s*(at\s+)?The\s+Whisky\s+Exchange$/i,
      /\s*(at\s+)?Wine\s+Chateau$/i,
      /\s*(at\s+)?Caskers$/i,
      /\s*(at\s+)?Flaviar$/i,
      /\s*(at\s+)?Seelbach'?s?$/i,
      /\s*(at\s+)?Breaking\s+Bourbon$/i,
      /\s*(at\s+)?Mission\s+Wine\s*&\s*Spirits$/i,
      /\s*(at\s+)?Binny's$/i,
      /\s*(at\s+)?Spec's$/i,
      /\s*(at\s+)?ABC\s+(Fine\s+)?Wine\s*&\s*Spirits$/i,
      /\s*(at\s+)?Liquor\s+Barn$/i,
      /\s*(at\s+)?Lisa's\s+Liquor\s+Barn$/i,
      /\s*(at\s+)?Remedy\s+Liquor$/i,
      /\s*(at\s+)?Crown\s+Wine$/i,
      /\s*Crown\s+Wine\s+and$/i,
      /\s*(at\s+)?Vine\s+Republic$/i,
      /\s*Vine\s+Republic$/i,
      /\s*(at\s+)?Paragon\s+Spirits?$/i,
      /\s*(at\s+)?Fine\s+Drams$/i,
      /\s*(at\s+)?Hi\s+Time\s+Wine$/i,
      /\s*(at\s+)?Free\s+Range\s+Wine\s*&?$/i,
      /\s*-?\s*free\s+Range\s+Wine\s*&?$/i,
      /\s*(at\s+)?Musthave\s+Malts?$/i,
      /\s*(at\s+)?J\s*L\s+Gill$/i,
      
      // Generic patterns
      /\s+Available\s+at\s+.+$/i,
      /\s+Available$/i,  // V2.6.4: Also remove trailing "Available"
      /\s+Now\s+at\s+.+$/i,
      /\s+Shop\s+at\s+.+$/i,
      /\s+Buy\s+at\s+.+$/i,
      /\s+From\s+\$\d+.*$/i,
      /\s+On\s+Sale.*$/i,
      /\s+In\s+Stock.*$/i,
      /\s+Free\s+Shipping.*$/i,
      /\s+Ships\s+to.*$/i,
      /\s+Delivered.*$/i,
      
      // Shopping cart / e-commerce artifacts
      /^Add\s+To\s+Cart\.?\s*/i,
      /\s+Add\s+To\s+Cart$/i,
      /^Buy\s+Now\.?\s*/i,
      /\s+Buy\s+Now$/i,
      /\s+View\s+Details$/i,
      /\s+Learn\s+More$/i,
      /\s+See\s+More$/i,
      /\s+Read\s+More$/i,
      
      // Price/sale artifacts
      /\s+\$\d+\.?\d*$/,
      /\s+USD\s*\$?\d+\.?\d*$/i,
      /\s+MSRP.*$/i,
      /\s+Sale\s+Price.*$/i,
      /\s+Regular\s+Price.*$/i,
      /\s+Save\s+\$?\d+.*$/i,
      /\s+\d+%\s+Off$/i,
      /\s+Clearance\s+Sale$/i,
      /\s+Limited\s+Time.*$/i,
      
      // Other artifacts
      /\s+\(\d+\s*Reviews?\)$/i,
      /\s+★+$/,
      /\s+\d+\s*Stars?$/i,
      /\s+Rated\s+\d+.*$/i,
      /\s+Paragon$/i,  // Remove specific store "Paragon" at end
      /\s+Category:.*$/i,
      /\s+SKU:.*$/i,
      /\s+Item\s+#.*$/i,
      /\s+Product\s+Code.*$/i,
      
      // Incomplete fragments
      /\s+&\s*$/,
      /\s+-\s*$/,
      /\s+\.\s*$/,
      /\s+,\s*$/
    ];
    
    // Apply all patterns
    for (const pattern of storePatterns) {
      result = result.replace(pattern, '');
    }
    
    // Clean up any remaining artifacts
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
  }

  /**
   * Normalize and determine the correct category for a spirit
   */
  public static normalizeCategory(name: string, currentCategory?: string): string {
    if (!name) return currentCategory || 'Other'; // Return 'Other' not 'other'

    const lowerName = name.toLowerCase();
    
    console.log(`🔍 TextProcessor.normalizeCategory: name="${name}", currentCategory="${currentCategory}"`);
    
    // PRIORITY 0: Brand-specific rules (highest priority)
    const bourbonBrands = [
      'buffalo trace', 'eagle rare', "blanton's", 'blanton', 'pappy van winkle',
      'w.l. weller', 'weller', 'e.h. taylor', 'eh taylor', 'stagg', 'benchmark',
      'four roses', "maker's mark", 'makers mark', 'wild turkey', "russell's reserve", 'russell',
      'evan williams', 'elijah craig', 'henry mckenna', 'heaven hill', 'larceny',
      'old forester', 'woodford reserve', 'knob creek', 'jim beam', 'booker',
      "booker's", 'basil hayden', 'old grand-dad', 'old granddad', 'very old barton',
      'early times', 'ancient age', '1792', 'old ezra', 'ezra brooks',
      'gray wolf', 'grey wolf', 'william wolf', 'wolf',
      'garrison brothers', 'garrison bros', 'paddock bourbon', 'paddock', 'redwood empire',
      'widow jane', 'smoke wagon', 'barrel', 'barrell', 'calumet', 'penelope',
      'old fitzgerald', 'rebel', 'david nicholson', 'yellowstone', 'kentucky gentleman',
      'town branch', 'pinhook', 'castle & key', 'green river', 'old pepper',
      'james e pepper', 'redemption', 'smooth ambler', 'high west', 'whistlepig'
    ];
    
    for (const brand of bourbonBrands) {
      if (lowerName.includes(brand)) {
        console.log(`✅ TextProcessor: Found bourbon brand "${brand}" -> Bourbon`);
        return 'Bourbon'; // Return proper case
      }
    }
    
    // PRIORITY 1: Check for bourbon patterns first (most common)
    if (/\bbourbon\b/i.test(lowerName)) {
      return 'Bourbon'; // Return proper case
    }
    
    // PRIORITY 2: Check for specific rye whiskey patterns (more restrictive)
    if (/\b(rye\s+whiskey|rye\s+whisky|straight\s+rye)\b/i.test(lowerName)) {
      return 'Rye Whiskey'; // Return proper case
    }
    
    // PRIORITY 3: Check for single malt
    if (/\bsingle\s+malt\b/i.test(lowerName)) {
      return 'Single Malt'; // Return proper case matching spirit-extractor
    }
    
    // PRIORITY 4: Check for blended whiskey
    if (/\bblended\s+(whiskey|whisky|straight)\b/i.test(lowerName)) {
      return 'Blended Whiskey'; // Return proper case
    }
    
    // PRIORITY 5: Check for Tennessee whiskey
    if (/\btennessee\s+(whiskey|whisky)\b/i.test(lowerName)) {
      return 'Tennessee Whiskey'; // Return proper case
    }
    
    // PRIORITY 6: Check other spirit categories
    for (const [category, patterns] of Object.entries(this.CATEGORY_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerName)) {
          // Return more specific categories when possible
          if (category === 'whiskey') {
            return 'Whiskey'; // Generic whiskey fallback with proper case
          }
          // Convert category to proper case for consistency
          const categoryMap: Record<string, string> = {
            'vodka': 'Vodka',
            'rum': 'Rum',
            'gin': 'Gin',
            'tequila': 'Tequila',
            'brandy': 'Brandy',
            'liqueur': 'Liqueur',
            'wine': 'Wine',
            'beer': 'Beer',
            'other': 'Other'
          };
          return categoryMap[category] || 'Other';
        }
      }
    }

    // If no pattern matches, try to clean up the current category
    if (currentCategory) {
      const cleanCategory = currentCategory.toLowerCase().trim();
      
      // Map common variations to standard categories
      const categoryMap: Record<string, string> = {
        'whisk': 'whiskey',
        'whiske': 'whiskey',
        'whisky': 'whiskey',
        'bourbon': 'bourbon',
        'scotch': 'scotch whiskey',
        'rye': 'rye whiskey',
        'vodkas': 'vodka',
        'rums': 'rum',
        'gins': 'gin',
        'tequilas': 'tequila',
        'brandies': 'brandy',
        'cognacs': 'brandy',
        'liqueurs': 'liqueur',
        'wines': 'wine',
        'beers': 'beer',
        'spirits': 'other',
        'spirit': 'other'
      };

      return categoryMap[cleanCategory] || cleanCategory;
    }

    console.log(`⚠️ TextProcessor: No category match found, returning 'Other'`);
    return 'Other'; // Return proper case
  }

  /**
   * Extract valid age statements from text
   */
  public static extractValidAge(text: string): string | null {
    if (!text) return null;

    // Skip age verification text (21+, 18+, etc.)
    if (/\b(18|19|20|21)\+/i.test(text)) {
      return null;
    }

    // Skip large numbers that are obviously not ages
    if (/\b(150|200|225|300|500|1000)\b/i.test(text)) {
      return null;
    }
    
    // Skip company history patterns (e.g., "225 years of craft")
    if (/\b\d{3,}\s*years?\s*(of|in)\s*(craft|tradition|history|heritage|experience)/i.test(text)) {
      return null;
    }
    
    // Skip founding year patterns (e.g., "since 1792", "established 1870")
    if (/\b(since|established|founded|from|in)\s*(17|18|19|20)\d{2}\b/i.test(text)) {
      return null;
    }

    // CRITICAL FIX: Skip numbers that are part of URLs, dates, or unrelated contexts
    // Skip if number appears in URL pattern
    if (/(?:\/|\.com\/|\.html|\.php|\?id=|&p=|page=|item=)\d+/i.test(text)) {
      return null;
    }
    
    // Skip if number is clearly a date (e.g., "2020 release", "46th anniversary")
    if (/\b\d{1,2}(?:st|nd|rd|th)\s*(anniversary|edition|annual|release)/i.test(text)) {
      return null;
    }
    
    // Skip if number is part of a date pattern (e.g., "June 20", "20/06/2024")
    if (/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}\b/i.test(text)) {
      return null;
    }
    
    // Skip if number is clearly a year (2020, 2021, etc.)
    if (/\b20[0-2]\d\b/.test(text) && !/\b20[0-2]\d\s*(?:year|yr)/i.test(text)) {
      return null;
    }

    // Common age patterns - more specific to avoid false positives
    const agePatterns = [
      // MOST SPECIFIC PATTERNS FIRST
      // Direct age statements with clear context
      /\b(\d{1,2})\s*year\s*old\s*(?:bourbon|whiskey|whisky|rum|tequila|cognac|brandy)/i,
      /(?:bourbon|whiskey|whisky|rum|tequila|cognac|brandy)\s*aged\s*(\d{1,2})\s*years?/i,
      
      // Standard age patterns with immediate context
      /aged\s+(?:for\s+)?(?:a\s+minimum\s+of\s+)?(\d{1,2})\s*years?\b/i,
      /\baged\s+(\d{1,2})\s*years?\b/i,
      /\b(\d{1,2})\s*years?\s*aged\b/i,
      /\b(\d{1,2})\s*year\s*old\b/i,
      /\b(\d{1,2})\s*years?\s*old\b/i,
      /\b(\d{1,2})\s*yr\s*old\b/i,
      /\b(\d{1,2})\s*yo\b/i,
      /\b(\d{1,2})\s*años\b/i, // Spanish
      /\b(\d{1,2})\s*ans\b/i,  // French
      /\b(\d{1,2})\s*jahre\b/i, // German
      /\b(\d{1,2})\s*y\.?o\.?\b/i,
      
      // Specific bottled-in-bond pattern (4+ years minimum)
      /minimum\s+of\s+(\d)\s*-?\s*years?/i,
      
      // CRITICAL: Common patterns in spirit names - require more context
      /\b(\d{1,2})\s*Yr\s+(?:old\s+)?(?:bourbon|whiskey|whisky|rum|tequila|cognac)\b/i,
      /\b(\d{1,2})\s*Year\s+(?:old\s+)?(?:bourbon|whiskey|whisky|rum|tequila|cognac)\b/i,
      /\b(?:bourbon|whiskey|whisky|rum|tequila|cognac)\s+(\d{1,2})\s*(?:yr|year)s?\b/i,
      
      // Last resort patterns - only if nothing else matches
      /\b(\d{1,2})\s*-?\s*year\b(?!.*(?:ago|later|after|before|since))/i
    ];

    // Known spirits without age statements - don't extract ages for these
    const noAgeStatementBrands = [
      /woodford\s*reserve(?!\s*(?:batch|master|double))/i,  // Standard Woodford Reserve
      /buffalo\s*trace(?!\s*(?:antique|experimental))/i,     // Standard Buffalo Trace
      /maker'?s?\s*mark(?!\s*(?:46|cask|private))/i,        // Standard Maker's Mark
      /jim\s*beam(?!\s*(?:black|double|single))/i,          // Standard Jim Beam
      /wild\s*turkey(?!\s*101)/i,                           // Standard Wild Turkey
      /bulleit\s*bourbon/i,                                 // Bulleit Bourbon
      /four\s*roses(?!\s*(?:single|small|limited))/i,       // Standard Four Roses
    ];
    
    // Check if this is a known NAS (No Age Statement) product
    for (const pattern of noAgeStatementBrands) {
      if (pattern.test(text)) {
        return null; // Don't extract age for known NAS products
      }
    }

    for (const pattern of agePatterns) {
      const match = text.match(pattern);
      if (match) {
        const age = parseInt(match[1], 10);
        
        // Additional context validation - ensure the number is actually referring to age
        const contextBefore = text.substring(Math.max(0, match.index! - 50), match.index!);
        const contextAfter = text.substring(match.index! + match[0].length, Math.min(text.length, match.index! + match[0].length + 50));
        
        // Skip if the context suggests it's not an age
        const skipContextPatterns = [
          /(?:page|item|product|sku|id|code|batch|lot|case|bottle)\s*(?:#|number|no\.?)?$/i,  // Product codes
          /(?:price|cost|\$|usd|eur|gbp)\s*:?\s*$/i,                                          // Prices
          /(?:review|rating|score|proof|abv|volume|ml|liter)\s*:?\s*$/i,                      // Other numbers
          /(?:founded|established|since|from|copyright|©)\s*$/i,                               // Dates
          /(?:highway|route|road|street|avenue)\s*$/i,                                         // Addresses
        ];
        
        if (skipContextPatterns.some(p => p.test(contextBefore))) {
          continue; // Skip this match
        }
        
        // Validate age is reasonable for spirits
        if (age >= 2 && age <= 30) {
          // Most spirits fall in this range
          return `${age} Year`;
        }
        
        // Premium/rare spirits can be older
        if (age > 30 && age <= 50 && /whiskey|whisky|cognac|armagnac|rum|brandy/i.test(text)) {
          return `${age} Year`;
        }
        
        // Very rare ultra-premium spirits
        if (age > 50 && age <= 100 && /whiskey|whisky|cognac|armagnac/i.test(text)) {
          return `${age} Year`;
        }
      }
    }

    // Check for NAS (No Age Statement) indicators
    if (/no\s*age\s*statement|nas\b/i.test(text)) {
      return 'NAS';
    }

    // Check for vintage years (e.g., "1995 Vintage")
    const vintageMatch = text.match(/\b(19\d{2}|20[0-2]\d)\s*vintage/i);
    if (vintageMatch) {
      const year = parseInt(vintageMatch[1], 10);
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      
      if (age >= 1 && age <= 100) {
        return `${year} Vintage`;
      }
    }

    return null;
  }

  /**
   * Validate if a description is product-focused (not a review)
   */
  public static isValidProductDescription(desc: string): boolean {
    if (!desc || desc.length < 20) return false;

    const lowerDesc = desc.toLowerCase();

    // Check for review indicators
    for (const pattern of this.REVIEW_INDICATORS) {
      if (pattern.test(desc)) {
        return false;
      }
    }

    // Check if it's just a price or availability statement
    if (/^\$?\d+\.?\d*$/.test(desc.trim())) return false;
    if (/^(in stock|out of stock|available|unavailable)/i.test(desc.trim())) return false;
    if (/^(buy now|shop now|order now)/i.test(desc.trim())) return false;

    // Count product description indicators
    let productIndicatorCount = 0;
    for (const pattern of this.PRODUCT_INDICATORS) {
      if (pattern.test(lowerDesc)) {
        productIndicatorCount++;
      }
    }

    // Valid if it has at least 2 product indicators
    return productIndicatorCount >= 2;
  }

  /**
   * Normalize brand names with proper formatting
   */
  public static normalizeBrandName(brand: string): string {
    if (!brand) return '';

    let result = brand.trim();

    // Fix spacing first
    result = this.fixTextSpacing(result);

    // Handle apostrophes and possessives
    result = result.replace(/\s*'\s*/g, "'");
    result = result.replace(/\s+'s\s*/g, "'s");
    
    // Fix common apostrophe capitalizations BEFORE checking brand fixes
    result = result.replace(/(?<=[a-z])'S\b/g, "'s");  // Fix "michter'S" to "michter's"
    result = result.replace(/(?<=[A-Z][a-z]+)'S\b/g, "'s");  // Also fix "Michter'S" to "Michter's"
    
    // V2.6.4: Enhanced brand name fixes from CSV analysis
    const brandFixes: Record<string, string> = {
      "jack daniels": "Jack Daniel's",
      "jack daniel": "Jack Daniel's",
      "makers mark": "Maker's Mark",
      "maker s mark": "Maker's Mark",
      "maker's mark": "Maker's Mark",
      "jim beam": "Jim Beam",
      "johnnie walker": "Johnnie Walker",
      "johnny walker": "Johnnie Walker",
      "grey goose": "Grey Goose",
      "gray goose": "Grey Goose",
      "crown royal": "Crown Royal",
      "captain morgan": "Captain Morgan",
      "capt morgan": "Captain Morgan",
      "jose cuervo": "Jose Cuervo",
      "patron": "Patrón",
      "don julio": "Don Julio",
      "hendricks": "Hendrick's",
      "heaven hill": "Heaven Hill",
      "evan williams": "Evan Williams",
      "elijah craig": "Elijah Craig",
      "e lijah craig": "Elijah Craig",
      "russell's reserve": "Russell's Reserve",
      "russells reserve": "Russell's Reserve",
      "wild turkey": "Wild Turkey",
      "buffalo trace": "Buffalo Trace",
      "eagle rare": "Eagle Rare",
      "blantons": "Blanton's",
      "blanton s": "Blanton's",
      "blanton's": "Blanton's",
      "george t stagg": "George T. Stagg",
      "george t. stagg": "George T. Stagg",
      "michters": "Michter's",
      "michter s": "Michter's",
      "michter's": "Michter's",
      "whistlepig": "WhistlePig",
      "whistle pig": "WhistlePig",
      "castle key": "Castle & Key",
      "castle and key": "Castle & Key",
      "castle & key": "Castle & Key",
      "st george": "St. George Spirits",
      "st. george": "St. George Spirits",
      "st george baller": "St. George Spirits",
      "st. george baller": "St. George Spirits",
      "st george spirits": "St. George Spirits",
      "st. george spirits": "St. George Spirits",
      "hendrick s": "Hendrick's",
      "tanqueray": "Tanqueray",
      "beefeater": "Beefeater",
      "bombay sapphire": "Bombay Sapphire",
      "bombay": "Bombay",
      "absolut": "Absolut",
      "smirnoff": "Smirnoff",
      "bacardi": "Bacardi",
      "havana club": "Havana Club",
      "mount gay": "Mount Gay",
      "mt gay": "Mount Gay",
      "glenfiddich": "Glenfiddich",
      "glenlivet": "Glenlivet",
      "macallan": "Macallan",
      "the macallan": "The Macallan",
      "lagavulin": "Lagavulin",
      "laphroaig": "Laphroaig",
      "ardbeg": "Ardbeg",
      "bowmore": "Bowmore",
      "dalmore": "Dalmore",
      "the dalmore": "The Dalmore",
      "balvenie": "Balvenie",
      "the balvenie": "The Balvenie",
      "highland park": "Highland Park",
      "talisker": "Talisker",
      "oban": "Oban",
      "chivas regal": "Chivas Regal",
      "chivas": "Chivas",
      "dewars": "Dewar's",
      "dewar s": "Dewar's",
      "famous grouse": "Famous Grouse",
      "the famous grouse": "The Famous Grouse",
      "cutty sark": "Cutty Sark",
      "j&b": "J&B",
      "jb": "J&B",
      "ballantines": "Ballantine's",
      "ballantine s": "Ballantine's",
      "grants": "Grant's",
      "grant s": "Grant's",
      "teachers": "Teacher's",
      "teacher s": "Teacher's",
      "bells": "Bell's",
      "bell s": "Bell's",
      "whyte & mackay": "Whyte & Mackay",
      "whyte and mackay": "Whyte & Mackay",
      "william lawsons": "William Lawson's",
      "william lawson s": "William Lawson's",
      "seagrams": "Seagram's",
      "seagram s": "Seagram's",
      "canadian club": "Canadian Club",
      // Duplicates removed - these are already defined earlier in the object
      "eagles rare": "Eagle Rare", // Keep this variation that wasn't in first set
      "weller": "W.L. Weller",
      "w.l. weller": "W.L. Weller",
      "wl weller": "W.L. Weller",
      "van winkle": "Van Winkle",
      "pappy van winkle": "Pappy Van Winkle",
      "old forester": "Old Forester",
      "george dickel": "George Dickel",
      "remy martin": "Rémy Martin",
      "hennessy": "Hennessy",
      "martell": "Martell",
      "courvoisier": "Courvoisier",
      "hine": "Hine",
      "camus": "Camus",
      "e&j": "E&J",
      "ej": "E&J",
      "christian brothers": "Christian Brothers",
      "paul masson": "Paul Masson",
      // Additional variations not covered in first set
      "cast le": "Castle & Key",  // For broken spacing
      "high": "High West",  // Only if standalone
      // Old Grand-Dad
      "old grand dad": "Old Grand-Dad",
      "old grand-dad": "Old Grand-Dad",
      // Basil Hayden's
      "basil haydens": "Basil Hayden's",
      "basil hayden s": "Basil Hayden's",
      "basil hayden": "Basil Hayden's",
      // Henry McKenna
      "henry mckenna": "Henry McKenna",
      "henry mc kenna": "Henry McKenna",
      // Uncle Nearest
      "uncle nearest": "Uncle Nearest",
      "unc le nearest": "Uncle Nearest",
      // Russell's Reserve duplicate removed - already defined earlier
      // Very Old Barton
      "very old barton": "Very Old Barton",
      "vob": "Very Old Barton",
      // Old Fitzgerald
      "old fitzgerald": "Old Fitzgerald",
      "old fitz": "Old Fitzgerald",
      // Redemption
      "redemption": "Redemption",
      // Smooth Ambler
      "smooth ambler": "Smooth Ambler",
      // Town Branch
      "town branch": "Town Branch",
      // Green River
      "green river": "Green River",
      // Widow Jane
      "widow jane": "Widow Jane",
      // Smoke Wagon
      "smoke wagon": "Smoke Wagon",
      // Calumet
      "calumet": "Calumet",
      // Penelope
      "penelope": "Penelope",
      // Bardstown
      "bardstown": "Bardstown Bourbon Company",
      "bardstown bourbon company": "Bardstown Bourbon Company",
      "bardstown bourbon co": "Bardstown Bourbon Company"
    };

    // Check for exact matches (case-insensitive)
    const lowerResult = result.toLowerCase();
    
    // Special handling for "st." - only normalize if it seems to be St. George
    if (lowerResult === "st." || lowerResult === "st") {
      // Don't normalize standalone "st." - too ambiguous
      return result;
    }
    if (brandFixes[lowerResult]) {
      return brandFixes[lowerResult];
    }

    // Title case formatting with special handling
    result = result.split(/\s+/).map((word, index) => {
      // Preserve certain words in lowercase (unless first word)
      const lowerWords = ['de', 'del', 'la', 'el', 'y', 'and', '&', 'of', 'the'];
      if (index > 0 && lowerWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }

      // Preserve acronyms and special cases
      if (/^[A-Z]{2,}$/.test(word)) {
        return word; // Keep all caps for acronyms
      }

      // Handle words with apostrophes
      if (word.includes("'")) {
        const parts = word.split("'");
        return parts.map(part => 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join("'");
      }

      // Regular title case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');

    // Final cleanup
    result = result.replace(/\s+/g, ' ').trim();

    return result;
  }

  /**
   * Process and clean a complete spirit entry
   */
  public static processSpirit(spirit: {
    name: string;
    brand?: string;
    category?: string;
    description?: string;
    age?: string;
  }): {
    name: string;
    brand: string;
    category: string;
    description: string | null;
    age: string | null;
  } {
    // Fix text spacing in name
    let fixedName = this.fixTextSpacing(spirit.name);
    
    // Remove store names and artifacts
    fixedName = this.removeStoreNames(fixedName);
    
    // Normalize brand
    let normalizedBrand: string;
    if (spirit.brand) {
      normalizedBrand = this.normalizeBrandName(spirit.brand);
      // If we have a generic brand like "st." but the name contains a better brand, extract from name
      if ((spirit.brand.toLowerCase() === 'st.' || spirit.brand.toLowerCase() === 'st') && 
          fixedName.toLowerCase().includes('george')) {
        normalizedBrand = this.extractBrandFromName(fixedName);
      }
    } else {
      normalizedBrand = this.extractBrandFromName(fixedName);
    }
    
    // Normalize category
    const normalizedCategory = this.normalizeCategory(fixedName, spirit.category);
    
    // Extract age if not provided
    const age = spirit.age || this.extractValidAge(fixedName);
    
    // Validate and clean description
    let validDescription: string | null = null;
    if (spirit.description) {
      let fixedDescription = this.fixTextSpacing(spirit.description);
      // Also remove store names from descriptions
      fixedDescription = this.removeStoreNames(fixedDescription);
      if (this.isValidProductDescription(fixedDescription)) {
        validDescription = fixedDescription;
      }
    }

    return {
      name: fixedName,
      brand: normalizedBrand,
      category: normalizedCategory,
      description: validDescription,
      age
    };
  }

  /**
   * Extract brand from spirit name (helper method)
   */
  private static extractBrandFromName(name: string): string {
    // V2.6.4: Special cases for known brand patterns
    if (/st\.?\s*george\s*(ba\s*ller|baller|breaking|single|spirits)/i.test(name)) {
      return 'St. George Spirits';  // Always return full brand name for St. George products
    }
    if (/^castle\s*&?\s*key/i.test(name)) {
      return this.normalizeBrandName('Castle & Key');
    }
    
    // V2.7.3: Special handling for cognac names
    // Handle "Cognac Hennessy XO" → "Hennessy"
    if (/^cognac\s+([A-Z][a-zA-Z\s&'.-]+?)(?:\s+XO|\s+VSOP|\s+VS|\s+Napoleon|\s+Extra|\s+Paradis|\s+Richard)/i.test(name)) {
      const match = name.match(/^cognac\s+([A-Z][a-zA-Z\s&'.-]+?)(?:\s+XO|\s+VSOP|\s+VS|\s+Napoleon|\s+Extra|\s+Paradis|\s+Richard)/i);
      if (match) {
        return this.normalizeBrandName(match[1]);
      }
    }
    
    // Handle "Hennessy VS Cognac 750 ml" → "Hennessy"
    if (/^([A-Z][a-zA-Z\s&'.-]+?)(?:\s+XO|\s+VSOP|\s+VS|\s+Napoleon|\s+Extra)\s+(?:Cognac|Brandy|Armagnac)/i.test(name)) {
      const match = name.match(/^([A-Z][a-zA-Z\s&'.-]+?)(?:\s+XO|\s+VSOP|\s+VS|\s+Napoleon|\s+Extra)\s+(?:Cognac|Brandy|Armagnac)/i);
      if (match) {
        return this.normalizeBrandName(match[1]);
      }
    }
    
    // Common patterns where brand appears first
    const brandPatterns = [
      /^([A-Z][a-zA-Z\s&'.-]+?)(?:\s+\d+\s*Year|\s+Single\s+Malt|\s+Bourbon|\s+Whiskey|\s+Vodka|\s+Rum|\s+Gin|\s+Tequila)/i,
      /^([A-Z][a-zA-Z\s&'.-]+?)(?:\s+Reserve|\s+Select|\s+Special|\s+Limited|\s+Edition)/i,
      /^([A-Z][a-zA-Z\s&'.-]+?)(?:\s+XO|\s+VSOP|\s+VS|\s+Napoleon)/i,
      /^([A-Z][a-zA-Z\s&'.-]+?)(?:\s+Baller|\s+Breaking|\s+Terroir)/i  // St. George product names
    ];

    for (const pattern of brandPatterns) {
      const match = name.match(pattern);
      if (match) {
        return this.normalizeBrandName(match[1]);
      }
    }

    // If no pattern matches, take the first 2-3 words as brand
    const words = name.split(/\s+/);
    if (words.length >= 2) {
      const potentialBrand = words.slice(0, Math.min(3, words.length)).join(' ');
      return this.normalizeBrandName(potentialBrand);
    }

    return this.normalizeBrandName(name);
  }

  /**
   * V2.7.4: Detect if a spirit name contains store references
   */
  public static containsStoreReference(text: string): boolean {
    if (!text) return false;
    
    const storePatterns = [
      // Specific store names from database cleanup
      /\bliquor\s+legends?\b/i,
      /\bsovereignty\s+wines?\b/i,
      /\bmac\s+arthur\s+beverages?\b/i,
      /\bnaija\s+liquor\b/i,
      /\bdivine\s+cellar\b/i,
      /\bculturebox\b/i,
      /\bwhisky\.my\b/i,
      /\bthewinelist\.cy\b/i,
      /\bport\s+2\s+port\b/i,
      /\btwin\s+liquors?\b/i,
      /\bwine\s+delight\b/i,
      /\bwine\s*&\s*liquor\s+mart\b/i,
      /\bliquor\s+corporation\b/i,
      /\blisa'?s\s+liquor\b/i,
      /\bwoodland\s+hills\s+wine\s+company\b/i,
      /\bliquorama\b/i,
      /\bsuperstore\b/i,
      /\brare\s+whiskey\s*&\s*co\.?\b/i,
      /\bwinestore\s+online\b/i,
      /\bfive\s+towns\s+wine\s*&\s*liquor\b/i,
      /\bscotch\s+malt\s+whisky\s+society\b/i,
      /\bcana\s+wine\s+company\b/i,
      /\bfood\s+4\s+less\b/i,
      /\bknast\s+liquor\b/i,
      
      // Generic store indicators
      /\b(wine|liquor)\s+(store|shop|mart|company)\b/i,
      /\b(beverage|spirits?)\s+(store|shop|mart|company)\b/i,
      /\b(online\s+)?(wine|liquor|spirits?)\s+retailer\b/i,
    ];
    
    return storePatterns.some(pattern => pattern.test(text));
  }

  /**
   * V2.7.4: Check if name extraction seems incomplete
   */
  public static isIncompleteExtraction(name: string, description?: string): boolean {
    if (!name || !description) return false;
    
    // Check if the name is suspiciously short compared to description
    if (name.length < 10 && description.length > 100) {
      // Look for complete product names in description
      const productPatterns = [
        /\b([A-Z][a-zA-Z\s&'.-]+?\s+\d+\s*year\s*old\s+\w+)/i,
        /\b([A-Z][a-zA-Z\s&'.-]+?\s+XO\s+\w+)/i,
        /\b([A-Z][a-zA-Z\s&'.-]+?\s+VSOP\s+\w+)/i,
        /\b([A-Z][a-zA-Z\s&'.-]+?\s+VS\s+\w+)/i,
      ];
      
      for (const pattern of productPatterns) {
        const match = description.match(pattern);
        if (match && match[1].length > name.length * 1.5) {
          return true; // Found a more complete name in description
        }
      }
    }
    
    // Check for common incomplete patterns
    const incompletePatterns = [
      /^year\s+old\b/i,
      /^old\s+\w+$/i,
      /^\w+\s+year$/i,
      /^single\s+malt$/i,
      /^reserve$/i,
      /^select$/i,
    ];
    
    return incompletePatterns.some(pattern => pattern.test(name.trim()));
  }
}

// Export individual functions for convenience
export const {
  fixTextSpacing,
  removeStoreNames,
  removeNavigationPrefixes,
  removeStoreSuffixes,
  normalizeCategory,
  extractValidAge,
  isValidProductDescription,
  normalizeBrandName,
  processSpirit,
  containsStoreReference,
  isIncompleteExtraction
} = TextProcessor;