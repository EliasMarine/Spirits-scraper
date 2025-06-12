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
   * Fix text spacing issues in concatenated or camelCase text
   */
  public static fixTextSpacing(text: string): string {
    if (!text) return '';

    let result = text;

    // Fix camelCase by adding spaces before capitals (except consecutive capitals)
    result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Fix lowercase followed by uppercase in product names
    result = result.replace(/([a-z])([A-Z][a-z])/g, '$1 $2');
    
    // Fix numbers concatenated with text
    result = result.replace(/(\d)([A-Za-z])/g, '$1 $2');
    result = result.replace(/([A-Za-z])(\d)/g, '$1 $2');
    
    // Fix common concatenations in spirit names
    result = result.replace(/(\w)(Year|Years|YO|Yr|Proof|ABV|ML|ml|L)(?=[A-Z\s]|$)/g, '$1 $2');
    
    // Fix specific patterns
    result = result.replace(/SingleMalt/g, 'Single Malt');
    result = result.replace(/SmallBatch/g, 'Small Batch');
    result = result.replace(/LimitedEdition/g, 'Limited Edition');
    result = result.replace(/SpecialRelease/g, 'Special Release');
    result = result.replace(/CaskStrength/g, 'Cask Strength');
    result = result.replace(/DoubleOaked/g, 'Double Oaked');
    result = result.replace(/TripleDistilled/g, 'Triple Distilled');
    
    // Clean up multiple spaces
    result = result.replace(/\s+/g, ' ').trim();
    
    // Remove empty parentheses that might remain after volume extraction
    result = result.replace(/\s*\(\s*\)\s*/g, ' ').trim();
    
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
    
    // Common brand name fixes
    const brandFixes: Record<string, string> = {
      "jack daniels": "Jack Daniel's",
      "jack daniel": "Jack Daniel's",
      "makers mark": "Maker's Mark",
      "maker s mark": "Maker's Mark",
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
      "wild turkey": "Wild Turkey",
      "four roses": "Four Roses",
      "woodford reserve": "Woodford Reserve",
      "knob creek": "Knob Creek",
      "bulleit": "Bulleit",
      "buffalo trace": "Buffalo Trace",
      "eagles rare": "Eagle Rare",
      "eagle rare": "Eagle Rare",
      "blantons": "Blanton's",
      "blanton s": "Blanton's",
      "weller": "W.L. Weller",
      "w.l. weller": "W.L. Weller",
      "wl weller": "W.L. Weller",
      "van winkle": "Van Winkle",
      "pappy van winkle": "Pappy Van Winkle",
      "michters": "Michter's",
      "michter s": "Michter's",
      "heaven hill": "Heaven Hill",
      "evan williams": "Evan Williams",
      "elijah craig": "Elijah Craig",
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
      "paul masson": "Paul Masson"
    };

    // Check for exact matches (case-insensitive)
    const lowerResult = result.toLowerCase();
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
    const fixedName = this.fixTextSpacing(spirit.name);
    
    // Normalize brand
    const normalizedBrand = spirit.brand 
      ? this.normalizeBrandName(spirit.brand)
      : this.extractBrandFromName(fixedName);
    
    // Normalize category
    const normalizedCategory = this.normalizeCategory(fixedName, spirit.category);
    
    // Extract age if not provided
    const age = spirit.age || this.extractValidAge(fixedName);
    
    // Validate and clean description
    let validDescription: string | null = null;
    if (spirit.description) {
      const fixedDescription = this.fixTextSpacing(spirit.description);
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
    // Common patterns where brand appears first
    const brandPatterns = [
      /^([A-Z][a-zA-Z\s&'.-]+?)(?:\s+\d+\s*Year|\s+Single\s+Malt|\s+Bourbon|\s+Whiskey|\s+Vodka|\s+Rum|\s+Gin|\s+Tequila)/i,
      /^([A-Z][a-zA-Z\s&'.-]+?)(?:\s+Reserve|\s+Select|\s+Special|\s+Limited|\s+Edition)/i,
      /^([A-Z][a-zA-Z\s&'.-]+?)(?:\s+XO|\s+VSOP|\s+VS|\s+Napoleon)/i
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
}

// Export individual functions for convenience
export const {
  fixTextSpacing,
  normalizeCategory,
  extractValidAge,
  isValidProductDescription,
  normalizeBrandName,
  processSpirit
} = TextProcessor;