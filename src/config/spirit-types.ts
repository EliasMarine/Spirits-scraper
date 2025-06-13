/**
 * Spirit Type Detection Configuration
 * Version: 1.0.0
 * 
 * This configuration defines comprehensive spirit type detection patterns
 * including priority-based classification and brand mapping.
 */

export interface SpiritTypeConfig {
  version: string;
  types: {
    [key: string]: {
      priority: number; // Lower number = higher priority
      patterns: RegExp[];
      brandIndicators?: string[];
      excludePatterns?: RegExp[];
      subTypes?: {
        [key: string]: RegExp[];
      };
    };
  };
  brandToType: {
    [brand: string]: string;
  };
  defaultType: string;
}

export const SPIRIT_TYPE_CONFIG: SpiritTypeConfig = {
  version: '1.0.0',
  
  types: {
    // WHISKEY TYPES - Priority 1-20
    'Tennessee Whiskey': {
      priority: 1,
      patterns: [
        /\btennessee\s+whiskey\b/i,
        /\bjack\s+daniel['']?s\b/i,
        /\bgeorge\s+dickel\b/i,
        /\buncle\s+nearest\b/i,
        /\blincoln\s+county\s+process\b/i,
      ],
      brandIndicators: ['Jack Daniel\'s', 'George Dickel', 'Uncle Nearest', 'Benjamin Prichard\'s'],
    },
    
    'American Single Malt': {
      priority: 2,
      patterns: [
        /\bamerican\s+single\s+malt\b/i,
        /\bsingle\s+malt\s+whiskey.*(?:usa|america|us)\b/i,
        /\b(?:westland|balcones|stranahan)\b/i,
        /\bsingle\s+malt\b.*\b(?:american|usa|us)\b/i,
      ],
      brandIndicators: ['Westland', 'Balcones', 'Stranahan\'s', 'Copperworks', 'Westward'],
    },
    
    'Single Malt': {
      priority: 2.5,  // After American Single Malt but before Bourbon
      patterns: [
        /\bsingle\s+malt\b/i,
        /\b100%\s+malted\s+barley\b/i,
      ],
      brandIndicators: ['Balcones', 'Westland', 'Stranahan\'s', 'Copperworks', 'Westward'],
      excludePatterns: [
        /\bscotch\b/i,  // Handled by Scotch type
        /\birish\b/i,   // Handled by Irish type
      ]
    },
    
    'Bourbon': {
      priority: 3,
      patterns: [
        /\bbourbon\b/i,
        /\bstraight\s+bourbon\b/i,
        /\bkentucky\s+straight\s+bourbon\b/i,
        /\bsmall\s+batch\s+bourbon\b/i,
        /\bsingle\s+barrel\s+bourbon\b/i,
        /\bbottled[\s-]in[\s-]bond\s+bourbon\b/i,
        /\bwheated\s+bourbon\b/i,
        /\bhigh\s+rye\s+bourbon\b/i,
      ],
      brandIndicators: [
        'Buffalo Trace', 'Maker\'s Mark', 'Woodford Reserve', 'Four Roses',
        'Wild Turkey', 'Jim Beam', 'Elijah Craig', 'Knob Creek', 'Bulleit',
        'Eagle Rare', 'Blanton\'s', 'Pappy Van Winkle', 'W.L. Weller',
        'E.H. Taylor', 'Stagg', 'Booker\'s', 'Baker\'s', 'Basil Hayden\'s',
        'Old Forester', 'Heaven Hill', 'Very Old Barton', 'Evan Williams',
        'Old Grand-Dad', 'Old Crow', 'Early Times', 'Larceny', 'Henry McKenna',
        'Old Fitzgerald', 'Rebel Yell', 'Ancient Age', 'Benchmark',
        'Johnny Drum', 'Green River', 'Blue Run', '1792', 'Redemption'
      ],
      subTypes: {
        'Bottled-in-Bond': [/\bbottled[\s-]in[\s-]bond\b/i, /\b100\s*proof\b/i, /\bbib\b/i],
        'Single Barrel': [/\bsingle\s+barrel\b/i, /\bsingle\s+cask\b/i],
        'Small Batch': [/\bsmall\s+batch\b/i],
        'Cask Strength': [/\bcask\s+strength\b/i, /\bbarrel\s+proof\b/i, /\bfull\s+proof\b/i],
        'Wheated': [/\bwheated\b/i, /\bwheat\s+bourbon\b/i, /\bwheat\s+whiskey\b/i],
        'High Rye': [/\bhigh\s+rye\b/i],
      }
    },
    
    'Rye Whiskey': {
      priority: 4,
      patterns: [
        /\b(?<!high\s)rye\s+whiskey\b/i,  // Negative lookbehind to exclude "high rye"
        /\bstraight\s+rye\s+whiskey\b/i,
        /\b100%\s+rye\b/i,
        /\bmonongahela\s+rye\b/i,
      ],
      brandIndicators: [
        'Rittenhouse', 'Sazerac', 'Whistlepig', 'High West', 'Bulleit Rye',
        'Old Overholt', 'Pikesville', 'Templeton', 'Crown Royal Northern Harvest',
        'Lot 40', 'Alberta Premium', 'Michter\'s Rye', 'Russell\'s Reserve Rye',
        'Wild Turkey Rye', 'Knob Creek Rye', 'Jim Beam Rye', 'Old Forester Rye',
        'Woodford Reserve Rye', 'E.H. Taylor Rye', 'Thomas H. Handy'
      ],
      excludePatterns: [
        /\bhigh\s+rye\s+bourbon\b/i,
        /\bbourbon.*high\s+rye\b/i,
      ]
    },
    
    'Scotch': {
      priority: 5,
      patterns: [
        /\bscotch\b/i,
        /\bsingle\s+malt\s+scotch\b/i,
        /\bblended\s+scotch\b/i,
        /\bhighland\b.*\bwhisk(?:e)?y\b/i,
        /\bislay\b.*\bwhisk(?:e)?y\b/i,
        /\bspeyside\b.*\bwhisk(?:e)?y\b/i,
        /\bcampbeltown\b.*\bwhisk(?:e)?y\b/i,
      ],
      brandIndicators: [
        'Glenfiddich', 'Glenlivet', 'Macallan', 'Highland Park', 'Balvenie',
        'Lagavulin', 'Laphroaig', 'Ardbeg', 'Bowmore', 'Oban', 'Talisker',
        'Johnnie Walker', 'Chivas Regal', 'Dewars', 'Famous Grouse', 'Cutty Sark'
      ],
      subTypes: {
        'Single Malt': [/\bsingle\s+malt\b/i],
        'Blended': [/\bblended\s+scotch\b/i, /\bblended\s+whisky\b/i],
        'Single Grain': [/\bsingle\s+grain\b/i],
        'Blended Malt': [/\bblended\s+malt\b/i],
      }
    },
    
    'Irish Whiskey': {
      priority: 6,
      patterns: [
        /\birish\s+whiskey\b/i,
        /\bwhiskey.*ireland\b/i,
        /\b(?:jameson|bushmills|redbreast|powers|tullamore)\b/i,
      ],
      brandIndicators: [
        'Jameson', 'Bushmills', 'Redbreast', 'Powers', 'Tullamore D.E.W.',
        'Green Spot', 'Yellow Spot', 'Midleton', 'Teeling', 'Connemara'
      ]
    },
    
    'Japanese Whisky': {
      priority: 7,
      patterns: [
        /\bjapanese\s+whisk(?:e)?y\b/i,
        /\bwhisk(?:e)?y.*japan\b/i,
        /\b(?:suntory|nikka|yamazaki|hakushu|yoichi|miyagikyo)\b/i,
      ],
      brandIndicators: [
        'Suntory', 'Nikka', 'Yamazaki', 'Hakushu', 'Hibiki', 'Yoichi',
        'Miyagikyo', 'Taketsuru', 'Chichibu', 'Mars', 'Akashi'
      ]
    },
    
    'Canadian Whisky': {
      priority: 8,
      patterns: [
        /\bcanadian\s+whisk(?:e)?y\b/i,
        /\bwhisk(?:e)?y.*canada\b/i,
        /\bcrown\s+royal\b/i,
      ],
      brandIndicators: [
        'Crown Royal', 'Canadian Club', 'Seagram\'s', 'Gibson\'s', 'Alberta Premium',
        'Lot 40', 'Pike Creek', 'Forty Creek', 'Canadian Mist'
      ]
    },
    
    'Whiskey': {
      priority: 10, // Generic whiskey - lower priority
      patterns: [
        /\bwhisk(?:e)?y\b/i,
        /\bamerican\s+whisk(?:e)?y\b/i,
        /\bblended\s+whisk(?:e)?y\b/i,
      ],
      excludePatterns: [
        /\b(?:bourbon|rye|scotch|irish|japanese|canadian|tennessee)\b/i,
      ]
    },
    
    // AGAVE SPIRITS - Priority 21-30
    'Tequila': {
      priority: 21,
      patterns: [
        /\btequila\b/i,
        /\b100%\s+agave\b/i,
        /\bagave\s+azul\b/i,
      ],
      brandIndicators: [
        'Patron', 'Don Julio', 'Herradura', 'Espolon', 'Cazadores', 'Sauza',
        'Jose Cuervo', 'Hornitos', 'Milagro', 'El Jimador', 'Corralejo',
        'Casamigos', 'Clase Azul', 'Casa Noble', 'Fortaleza', 'Ocho'
      ],
      subTypes: {
        'Blanco': [/\bblanco\b/i, /\bsilver\b/i, /\bplata\b/i],
        'Reposado': [/\breposado\b/i],
        'Añejo': [/\ba[ñn]ejo\b/i],
        'Extra Añejo': [/\bextra\s+a[ñn]ejo\b/i],
        'Cristalino': [/\bcristalino\b/i],
      }
    },
    
    'Mezcal': {
      priority: 22,
      patterns: [
        /\bmezcal\b/i,
        /\bmescal\b/i,
        /\bagave\s+espadin\b/i,
        /\btobala\b/i,
      ],
      brandIndicators: [
        'Del Maguey', 'Montelobos', 'Ilegal', 'Vida', 'El Silencio',
        'Bozal', 'Los Amantes', 'Alipus', 'Real Minero', 'Vago'
      ],
      subTypes: {
        'Joven': [/\bjoven\b/i],
        'Reposado': [/\breposado\b/i],
        'Añejo': [/\ba[ñn]ejo\b/i],
      }
    },
    
    // RUM - Priority 31-35
    'Rum': {
      priority: 31,
      patterns: [
        /\brum\b/i,
        /\brhum\b/i,
        /\bron\b/i,
        /\bcachaça\b/i,
      ],
      brandIndicators: [
        'Bacardi', 'Captain Morgan', 'Malibu', 'Mount Gay', 'Appleton',
        'Plantation', 'Diplomatico', 'Ron Zacapa', 'Flor de Caña', 'Havana Club',
        'Kraken', 'Sailor Jerry', 'Myers\'s', 'Goslings', 'Pusser\'s'
      ],
      subTypes: {
        'White': [/\bwhite\s+rum\b/i, /\bsilver\s+rum\b/i, /\blight\s+rum\b/i],
        'Gold': [/\bgold\s+rum\b/i, /\bamber\s+rum\b/i],
        'Dark': [/\bdark\s+rum\b/i, /\bblack\s+rum\b/i],
        'Spiced': [/\bspiced\s+rum\b/i],
        'Aged': [/\baged\s+rum\b/i, /\ba[ñn]ejo\s+rum\b/i],
        'Overproof': [/\boverproof\s+rum\b/i, /\b151\s+rum\b/i],
        'Rhum Agricole': [/\brhum\s+agricole\b/i],
      }
    },
    
    // GIN - Priority 41-45
    'Gin': {
      priority: 41,
      patterns: [
        /\bgin\b(?!\s*(?:and|&)\s*(?:tonic|juice))/i, // Not "gin and tonic"
        /\blondon\s+dry\s+gin\b/i,
        /\bdistilled\s+gin\b/i,
      ],
      brandIndicators: [
        'Tanqueray', 'Bombay', 'Hendrick\'s', 'Beefeater', 'Gordon\'s',
        'Plymouth', 'Aviation', 'The Botanist', 'Monkey 47', 'Roku',
        'Sipsmith', 'Gray Whale', 'Gin Mare', 'St. George'
      ],
      subTypes: {
        'London Dry': [/\blondon\s+dry\b/i],
        'Old Tom': [/\bold\s+tom\b/i],
        'Navy Strength': [/\bnavy\s+strength\b/i],
        'Contemporary': [/\bcontemporary\s+gin\b/i, /\bnew\s+western\b/i],
      }
    },
    
    // VODKA - Priority 51-55
    'Vodka': {
      priority: 51,
      patterns: [
        /\bvodka\b/i,
        /\b(?:russian|polish)\s+vodka\b/i,
      ],
      brandIndicators: [
        'Absolut', 'Grey Goose', 'Belvedere', 'Ketel One', 'Tito\'s',
        'Stolichnaya', 'Smirnoff', 'Ciroc', 'Chopin', 'Russian Standard',
        'Finlandia', 'Reyka', 'Crystal Head', 'Hangar 1'
      ]
    },
    
    // BRANDY & COGNAC - Priority 61-70
    'Cognac': {
      priority: 61,
      patterns: [
        /\bcognac\b/i,
        /\b(?:xo|vsop|vs)\b.*\b(?:cognac|brandy)\b/i,
        /\bgrande\s+champagne\b/i,
        /\bpetite\s+champagne\b/i,
      ],
      brandIndicators: [
        'Hennessy', 'Remy Martin', 'Martell', 'Courvoisier', 'Camus',
        'Hine', 'Pierre Ferrand', 'Paul Giraud', 'Delamain', 'Frapin'
      ],
      subTypes: {
        'VS': [/\bvs\b/i, /\bvery\s+special\b/i],
        'VSOP': [/\bvsop\b/i, /\bvery\s+superior\s+old\s+pale\b/i],
        'XO': [/\bxo\b/i, /\bextra\s+old\b/i],
        'XXO': [/\bxxo\b/i, /\bextra\s+extra\s+old\b/i],
      }
    },
    
    'Armagnac': {
      priority: 62,
      patterns: [
        /\barmagnac\b/i,
        /\bbas[\s-]armagnac\b/i,
      ],
      brandIndicators: [
        'Chateau du Tariquet', 'Delord', 'Janneau', 'Castarede', 'Darroze'
      ]
    },
    
    'Brandy': {
      priority: 65,
      patterns: [
        /\bbrandy\b/i,
        /\bamerican\s+brandy\b/i,
        /\bspanish\s+brandy\b/i,
        /\bpisco\b/i,
      ],
      brandIndicators: [
        'E&J', 'Christian Brothers', 'Paul Masson', 'Korbel', 'Torres',
        'Fundador', 'Lepanto', 'Cardinal Mendoza'
      ],
      excludePatterns: [
        /\bcognac\b/i,
        /\barmagnac\b/i,
      ]
    },
    
    // LIQUEURS - Priority 9 (check before generic whiskey)
    'Liqueur': {
      priority: 9,
      patterns: [
        /\bliqueur\b/i,
        /\bcream\s+liqueur\b/i,
        /\btriple\s+sec\b/i,
        /\bamaretto\b/i,
        /\blimoncello\b/i,
        /\bschnapps\b/i,
        /\bbailey[''s]*\b/i,
        /\bkahlua\b/i,
        /\bgrand\s+marnier\b/i,
        /\bcointreau\b/i,
        /\bamerican\s+honey\b/i,  // Wild Turkey American Honey
        /\bfireball\b/i,  // Fireball Cinnamon Whisky
        /\bhoney\s+whiskey\b/i,
        /\bcinnamon\s+whisky\b/i,
        /\bflavored\s+whiskey\b/i,
        /\bspiced\s+whiskey\b/i,
      ],
      brandIndicators: [
        'Bailey\'s', 'Kahlua', 'Grand Marnier', 'Cointreau', 'Chambord',
        'St. Germain', 'Campari', 'Aperol', 'Drambuie', 'Frangelico',
        'Disaronno', 'Luxardo', 'Chartreuse', 'Fireball', 'Wild Turkey American Honey'
      ]
    },
    
    // OTHER SPIRITS - Priority 81+
    'Baijiu': {
      priority: 81,
      patterns: [
        /\bbaijiu\b/i,
        /\bchinese\s+spirit\b/i,
        /\bsorghum\s+spirit\b/i,
      ],
      brandIndicators: ['Moutai', 'Wuliangye', 'Luzhou Laojiao', 'Jiannanchun']
    },
    
    'Absinthe': {
      priority: 82,
      patterns: [
        /\babsinthe\b/i,
        /\bgreen\s+fairy\b/i,
      ],
      brandIndicators: ['Pernod', 'St. George', 'Lucid', 'La Fee', 'Kubler']
    },
    
    'Aquavit': {
      priority: 83,
      patterns: [
        /\baquavit\b/i,
        /\bakvavit\b/i,
      ],
      brandIndicators: ['Linie', 'Aalborg', 'O.P. Anderson', 'Brennevin']
    },
  },
  
  // Direct brand to type mapping for common brands
  brandToType: {
    // American Single Malt brands
    'Balcones': 'American Single Malt',
    'Westland': 'American Single Malt',
    'Stranahan\'s': 'American Single Malt',
    'Stranahans': 'American Single Malt',
    'Copperworks': 'American Single Malt',
    'Westward': 'American Single Malt',
    
    // Bourbon brands
    'Buffalo Trace': 'Bourbon',
    'Maker\'s Mark': 'Bourbon',
    'Makers Mark': 'Bourbon',
    'Woodford Reserve': 'Bourbon',
    'Four Roses': 'Bourbon',
    'Wild Turkey': 'Bourbon',
    'Jim Beam': 'Bourbon',
    'Elijah Craig': 'Bourbon',
    'Knob Creek': 'Bourbon',
    'Bulleit': 'Bourbon',  // Note: Also makes rye, need name check
    'Eagle Rare': 'Bourbon',
    'Blanton\'s': 'Bourbon',
    'Blantons': 'Bourbon',
    'Pappy Van Winkle': 'Bourbon',
    'W.L. Weller': 'Bourbon',
    'E.H. Taylor': 'Bourbon',
    'EH Taylor': 'Bourbon',
    'Larceny': 'Bourbon',
    'Old Forester': 'Bourbon',
    'Heaven Hill': 'Bourbon',
    'Evan Williams': 'Bourbon',
    'Ben Holladay': 'Bourbon',
    'Johnny Drum': 'Bourbon',
    'Green River': 'Bourbon',
    'Blue Run': 'Bourbon',
    '1792': 'Bourbon',
    'Redemption': 'Bourbon',
    
    // Tennessee Whiskey brands
    'Jack Daniel\'s': 'Tennessee Whiskey',
    'Jack Daniels': 'Tennessee Whiskey',
    'George Dickel': 'Tennessee Whiskey',
    'Uncle Nearest': 'Tennessee Whiskey',
    
    // Rye brands
    'Rittenhouse': 'Rye Whiskey',
    'Sazerac': 'Rye Whiskey',
    'Whistlepig': 'Rye Whiskey',
    'WhistlePig': 'Rye Whiskey',
    'High West': 'Rye Whiskey',
    'Old Overholt': 'Rye Whiskey',
    'Pikesville': 'Rye Whiskey',
    'Templeton': 'Rye Whiskey',
    
    // Scotch brands
    'Glenfiddich': 'Scotch',
    'Glenlivet': 'Scotch',
    'Macallan': 'Scotch',
    'Highland Park': 'Scotch',
    'Balvenie': 'Scotch',
    'Lagavulin': 'Scotch',
    'Laphroaig': 'Scotch',
    'Ardbeg': 'Scotch',
    'Johnnie Walker': 'Scotch',
    'Chivas Regal': 'Scotch',
    
    // Irish whiskey brands
    'Jameson': 'Irish Whiskey',
    'Bushmills': 'Irish Whiskey',
    'Redbreast': 'Irish Whiskey',
    'Powers': 'Irish Whiskey',
    'Tullamore DEW': 'Irish Whiskey',
    'Tullamore D.E.W.': 'Irish Whiskey',
    
    // Tequila brands
    'Patron': 'Tequila',
    'Don Julio': 'Tequila',
    'Herradura': 'Tequila',
    'Espolon': 'Tequila',
    'Cazadores': 'Tequila',
    'Jose Cuervo': 'Tequila',
    'Casamigos': 'Tequila',
    'Clase Azul': 'Tequila',
    
    // Vodka brands
    'Grey Goose': 'Vodka',
    'Absolut': 'Vodka',
    'Belvedere': 'Vodka',
    'Ketel One': 'Vodka',
    'Tito\'s': 'Vodka',
    'Titos': 'Vodka',
    'Smirnoff': 'Vodka',
    'Stolichnaya': 'Vodka',
    'Wheatley': 'Vodka',
    'Wheatley Vodka': 'Vodka',
    
    // Gin brands
    'Tanqueray': 'Gin',
    'Bombay': 'Gin',
    'Hendrick\'s': 'Gin',
    'Hendricks': 'Gin',
    'Beefeater': 'Gin',
    'Gordon\'s': 'Gin',
    'Gordons': 'Gin',
    
    // Rum brands
    'Bacardi': 'Rum',
    'Captain Morgan': 'Rum',
    'Malibu': 'Rum',
    'Mount Gay': 'Rum',
    'Appleton': 'Rum',
    'Kraken': 'Rum',
    'Sailor Jerry': 'Rum',
    
    // Cognac brands
    'Hennessy': 'Cognac',
    'Remy Martin': 'Cognac',
    'Rémy Martin': 'Cognac',
    'Martell': 'Cognac',
    'Courvoisier': 'Cognac',
  },
  
  defaultType: 'Spirit' // Generic fallback
};

/**
 * Detect spirit type based on name, brand, and description
 */
export function detectSpiritType(
  name: string,
  brand?: string,
  description?: string
): { type: string; subType?: string; confidence: number } {
  // Ensure all parameters are strings
  const safeName = String(name || '');
  const safeBrand = String(brand || '');
  const safeDescription = String(description || '');
  
  const searchText = `${safeName} ${safeBrand} ${safeDescription}`.toLowerCase();
  
  // First check for flavored/liqueur products even with known brands
  const flavoredPatterns = [
    /american\s+honey/i,
    /honey\s+whiskey/i,
    /cinnamon\s+whisky/i,
    /apple\s+whisky/i,
    /flavored/i,
    /liqueur/i
  ];
  
  if (flavoredPatterns.some(pattern => pattern.test(searchText))) {
    return { type: 'Liqueur', confidence: 0.9 };
  }
  
  // Then check direct brand mapping - but handle special cases
  if (brand) {
    const normalizedBrand = brand.trim();
    
    // Special case: Bulleit makes both bourbon and rye
    if (normalizedBrand === 'Bulleit' || normalizedBrand.toLowerCase() === 'bulleit') {
      // Check for "High Rye Bourbon" first - it's bourbon, not rye
      if (/\bhigh\s+rye\s+bourbon\b/i.test(name) || /\bbourbon\b/i.test(name)) {
        return { type: 'Bourbon', subType: 'High Rye', confidence: 0.95 };
      }
      // Only mark as Rye if it explicitly says "Rye" WITHOUT "Bourbon"
      if (/\brye\b/i.test(name) && !/\bbourbon\b/i.test(name)) {
        return { type: 'Rye Whiskey', confidence: 0.95 };
      }
      // Default to bourbon for other Bulleit products
      return { type: 'Bourbon', confidence: 0.95 };
    }
    
    if (SPIRIT_TYPE_CONFIG.brandToType[normalizedBrand]) {
      const mappedType = SPIRIT_TYPE_CONFIG.brandToType[normalizedBrand];
      const typeConfig = SPIRIT_TYPE_CONFIG.types[mappedType];
      
      // Check for subtypes
      let detectedSubType: string | undefined;
      if (typeConfig?.subTypes) {
        for (const [subType, patterns] of Object.entries(typeConfig.subTypes)) {
          if (patterns.some(pattern => pattern.test(searchText))) {
            detectedSubType = subType;
            break;
          }
        }
      }
      
      return { 
        type: mappedType, 
        subType: detectedSubType,
        confidence: 0.95 
      };
    }
  }
  
  // Sort types by priority
  const sortedTypes = Object.entries(SPIRIT_TYPE_CONFIG.types)
    .sort(([, a], [, b]) => a.priority - b.priority);
  
  // Check each type in priority order
  for (const [typeName, config] of sortedTypes) {
    // Check exclude patterns first
    if (config.excludePatterns?.some(pattern => pattern.test(searchText))) {
      continue;
    }
    
    // Check positive patterns
    const hasPattern = config.patterns.some(pattern => pattern.test(searchText));
    const hasBrandIndicator = config.brandIndicators?.some(
      indicator => searchText.includes(indicator.toLowerCase())
    );
    
    if (hasPattern || hasBrandIndicator) {
      // Check for subtypes
      let detectedSubType: string | undefined;
      if (config.subTypes) {
        for (const [subType, patterns] of Object.entries(config.subTypes)) {
          if (patterns.some(pattern => pattern.test(searchText))) {
            detectedSubType = subType;
            break;
          }
        }
      }
      
      // Calculate confidence
      let confidence = 0.7;
      if (hasPattern && hasBrandIndicator) confidence = 0.9;
      else if (hasPattern) confidence = 0.8;
      else if (hasBrandIndicator) confidence = 0.75;
      
      return { 
        type: typeName, 
        subType: detectedSubType,
        confidence 
      };
    }
  }
  
  // Default fallback
  return { 
    type: SPIRIT_TYPE_CONFIG.defaultType, 
    confidence: 0.3 
  };
}

/**
 * Get whiskey style for bourbon/whiskey types
 */
export function getWhiskeyStyle(name: string, description?: string): string | undefined {
  const searchText = `${name} ${description || ''}`.toLowerCase();
  const bourbonConfig = SPIRIT_TYPE_CONFIG.types['Bourbon'];
  
  if (bourbonConfig?.subTypes) {
    for (const [style, patterns] of Object.entries(bourbonConfig.subTypes)) {
      if (patterns.some(pattern => pattern.test(searchText))) {
        return style;
      }
    }
  }
  
  return undefined;
}

/**
 * Validate detected type against known patterns
 */
export function validateSpiritType(
  detectedType: string,
  name: string,
  brand?: string
): boolean {
  const config = SPIRIT_TYPE_CONFIG.types[detectedType];
  if (!config) return false;
  
  // Ensure all parameters are strings
  const safeName = String(name || '');
  const safeBrand = String(brand || '');
  
  const searchText = `${safeName} ${safeBrand}`.toLowerCase();
  
  // Check if it matches the patterns for this type
  const matchesPattern = config.patterns.some(pattern => pattern.test(searchText));
  const matchesBrand = config.brandIndicators?.some(
    indicator => searchText.includes(indicator.toLowerCase())
  );
  
  return matchesPattern || matchesBrand || false;
}