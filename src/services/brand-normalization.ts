/**
 * Brand Name Normalization Library
 * 
 * Handles normalization of brand names for consistent deduplication:
 * - Canonical brand name lookup
 * - Common abbreviation expansion
 * - Formatting standardization
 * - Known brand variations handling
 */

/**
 * Brand normalization result
 */
export interface BrandNormalizationResult {
  normalized: string;
  canonical: string;
  confidence: 'high' | 'medium' | 'low';
  transformations: string[];
  isKnownBrand: boolean;
}

/**
 * Configuration for brand normalization
 */
export interface BrandNormalizationConfig {
  // Whether to use strict matching for known brands
  strictMatching: boolean;
  // Minimum confidence for accepting normalization
  minimumConfidence: 'low' | 'medium' | 'high';
  // Whether to expand abbreviations
  expandAbbreviations: boolean;
  // Whether to normalize case
  normalizeCase: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_BRAND_CONFIG: BrandNormalizationConfig = {
  strictMatching: false,
  minimumConfidence: 'medium',
  expandAbbreviations: true,
  normalizeCase: true,
};

/**
 * Known brand names and their variations
 * In production, this would be loaded from a database
 */
export const KNOWN_BRANDS: Record<string, string[]> = {
  'Macallan': [
    'macallan', 'the macallan', 'macallen', 'maccallan', 'macallan distillery'
  ],
  'Glenfiddich': [
    'glenfiddich', 'glen fiddich', 'glenfidich', 'glenfiddich distillery'
  ],
  'Johnnie Walker': [
    'johnnie walker', 'johnny walker', 'johnie walker', 'johnnie walkers',
    'johnnie walker & sons', 'walker', 'j walker', 'jw'
  ],
  'Jack Daniels': [
    'jack daniels', 'jack daniel', 'jack daniel\'s', 'jack daniels tennessee whiskey',
    'jack daniel distillery', 'jd', 'j.d.', 'jack daniel\'s old no. 7'
  ],
  'Jameson': [
    'jameson', 'jameson irish whiskey', 'jameson distillery', 'john jameson'
  ],
  'Chivas Regal': [
    'chivas regal', 'chivas', 'chivas bros', 'chivas brothers'
  ],
  'Glenlivet': [
    'glenlivet', 'the glenlivet', 'glen livet', 'glenlivet distillery'
  ],
  'Balvenie': [
    'balvenie', 'the balvenie', 'balvenie distillery', 'david stewart balvenie'
  ],
  'Highland Park': [
    'highland park', 'highland park distillery', 'highland pk'
  ],
  'Ardbeg': [
    'ardbeg', 'ardbeg distillery', 'ardbeg islay'
  ],
  'Lagavulin': [
    'lagavulin', 'lagavulin distillery', 'lagavulin islay'
  ],
  'Laphroaig': [
    'laphroaig', 'laphroaig distillery', 'laphroaig islay'
  ],
  'Oban': [
    'oban', 'oban distillery', 'oban highland'
  ],
  'Talisker': [
    'talisker', 'talisker distillery', 'talisker skye'
  ],
  'Springbank': [
    'springbank', 'springbank distillery', 'springbank campbeltown'
  ],
  'Redbreast': [
    'redbreast', 'red breast', 'redbreast irish whiskey'
  ],
  'Bushmills': [
    'bushmills', 'old bushmills', 'bushmills irish whiskey', 'bushmills distillery'
  ],
  'Crown Royal': [
    'crown royal', 'crown', 'crown royal canadian whisky'
  ],
  'Canadian Club': [
    'canadian club', 'cc', 'c.c.', 'canadian club whisky'
  ],
  'Wild Turkey': [
    'wild turkey', 'wild turkey bourbon', 'wild turkey kentucky'
  ],
  'Buffalo Trace': [
    'buffalo trace', 'buffalo trace distillery', 'buffalo trace bourbon'
  ],
  'Makers Mark': [
    'makers mark', 'maker\'s mark', 'makers mark bourbon', 'maker\'s mark bourbon'
  ],
  'Woodford Reserve': [
    'woodford reserve', 'woodford', 'woodford reserve bourbon'
  ],
  'Four Roses': [
    'four roses', 'four roses bourbon', '4 roses'
  ],
  'Knob Creek': [
    'knob creek', 'knob creek bourbon', 'knob creek kentucky'
  ],
  'Bulleit': [
    'bulleit', 'bulleit bourbon', 'bulleit frontier whiskey'
  ],
  'Hennessy': [
    'hennessy', 'hennessey', 'hennessy cognac', 'jas hennessy'
  ],
  'Rémy Martin': [
    'remy martin', 'rémy martin', 'remy martin cognac', 'rémy martin cognac'
  ],
  'Martell': [
    'martell', 'martell cognac', 'martell & co'
  ],
  'Courvoisier': [
    'courvoisier', 'courvoisier cognac', 'courvoisier vs'
  ],
  'Elijah Craig': [
    'elijah craig', 'elijah craig bourbon', 'elijah craig small batch'
  ],
  'Eagle Rare': [
    'eagle rare', 'eagle rare bourbon', 'eagle rare 10'
  ],
  'Blanton\'s': [
    'blantons', 'blanton\'s', 'blanton bourbon', 'blanton\'s bourbon'
  ],
  'Weller': [
    'weller', 'w.l. weller', 'wl weller', 'weller bourbon'
  ],
  'Pappy Van Winkle': [
    'pappy van winkle', 'pappy', 'van winkle', 'pappy bourbon'
  ],
  'George T. Stagg': [
    'george t stagg', 'george t. stagg', 'stagg', 'george stagg'
  ],
  'Nikka': [
    'nikka', 'nikka whisky', 'nikka japanese whisky'
  ],
  'Suntory': [
    'suntory', 'suntory whisky', 'suntory japanese whisky'
  ],
  'Hibiki': [
    'hibiki', 'hibiki whisky', 'hibiki japanese whisky'
  ],
  'Yamazaki': [
    'yamazaki', 'yamazaki whisky', 'yamazaki single malt'
  ],
  'Hakushu': [
    'hakushu', 'hakushu whisky', 'hakushu single malt'
  ]
};

/**
 * Common abbreviations and their expansions
 */
export const ABBREVIATIONS: Record<string, string> = {
  // Company suffixes
  'co': 'company',
  'corp': 'corporation',
  'inc': 'incorporated',
  'ltd': 'limited',
  'llc': 'limited liability company',
  'bros': 'brothers',
  'distillery': 'distillery',
  'dist': 'distillery',
  
  // Whiskey terms
  'yr': 'year',
  'yrs': 'years',
  'yo': 'year old',
  'aged': 'aged',
  'single': 'single',
  'malt': 'malt',
  'grain': 'grain',
  'blend': 'blend',
  'blended': 'blended',
  'reserve': 'reserve',
  'special': 'special',
  'limited': 'limited',
  'edition': 'edition',
  
  // Geographic
  'islay': 'islay',
  'speyside': 'speyside',
  'highland': 'highland',
  'lowland': 'lowland',
  'campbeltown': 'campbeltown',
  'kentucky': 'kentucky',
  'tennessee': 'tennessee',
  'irish': 'irish',
  'scottish': 'scottish',
  'scotch': 'scotch',
  'canadian': 'canadian',
  
  // Common shortenings
  'whisky': 'whisky',
  'whiskey': 'whiskey',
  'bourbon': 'bourbon',
  'rye': 'rye',
  'cognac': 'cognac',
  'brandy': 'brandy',
  'rum': 'rum',
  'gin': 'gin',
  'vodka': 'vodka',
  'tequila': 'tequila'
};

/**
 * Words to remove from brand names
 */
const BRAND_STOP_WORDS = new Set([
  'the', 'distillery', 'company', 'corporation', 'inc', 'ltd', 'llc', 'co',
  'whisky', 'whiskey', 'bourbon', 'scotch', 'irish', 'canadian', 'tennessee',
  'kentucky', 'single', 'malt', 'grain', 'blended', 'blend'
]);

/**
 * Create reverse lookup for known brands
 */
function createBrandLookup(): Map<string, string> {
  const lookup = new Map<string, string>();
  
  for (const [canonical, variations] of Object.entries(KNOWN_BRANDS)) {
    // Add canonical name
    lookup.set(canonical.toLowerCase(), canonical);
    
    // Add all variations
    for (const variation of variations) {
      lookup.set(variation.toLowerCase(), canonical);
    }
  }
  
  return lookup;
}

const BRAND_LOOKUP = createBrandLookup();

/**
 * Normalize text by removing special characters and extra whitespace
 * FIXED: Preserve original casing for better brand recognition
 */
function normalizeText(text: string, preserveCase: boolean = false): string {
  let result = text;
  
  if (!preserveCase) {
    result = result.toLowerCase();
  }
  
  return result
    .replace(/[^\w\s.']/g, ' ') // Keep apostrophes and dots for brands like W.L. Weller
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Expand common abbreviations in brand name
 */
function expandAbbreviations(text: string): string {
  const words = text.split(/\s+/);
  const expandedWords = words.map(word => {
    const normalized = word.toLowerCase().replace(/[^\w]/g, '');
    return ABBREVIATIONS[normalized] || word;
  });
  
  return expandedWords.join(' ');
}

/**
 * Remove stop words from brand name
 */
function removeStopWords(text: string): string {
  const words = text.split(/\s+/);
  const filteredWords = words.filter(word => 
    !BRAND_STOP_WORDS.has(word.toLowerCase())
  );
  
  return filteredWords.join(' ');
}

/**
 * Extract core brand name by removing common suffixes
 */
function extractCoreBrandName(text: string): string {
  // Remove common patterns at the end
  const patterns = [
    /\s+(distillery|company|corporation|inc|ltd|llc|co\.?)$/i,
    /\s+(whisky|whiskey|bourbon|scotch|irish|canadian)$/i,
    /\s+(single\s+malt|blended|aged?\s+\d+).*$/i
  ];
  
  let result = text;
  for (const pattern of patterns) {
    result = result.replace(pattern, '');
  }
  
  return result.trim();
}

/**
 * Find best matching known brand using fuzzy matching
 */
function findBestBrandMatch(normalizedName: string): { canonical: string; confidence: number } | null {
  // First try exact lookup (case insensitive)
  const lowerName = normalizedName.toLowerCase();
  const exact = BRAND_LOOKUP.get(lowerName);
  if (exact) {
    return { canonical: exact, confidence: 1.0 };
  }
  
  // Try fuzzy matching against known brands
  let bestMatch: { canonical: string; confidence: number } | null = null;
  
  for (const [variation, canonical] of BRAND_LOOKUP.entries()) {
    // Calculate simple similarity score
    const similarity = calculateSimilarity(lowerName, variation);
    
    if (similarity > 0.8 && (!bestMatch || similarity > bestMatch.confidence)) {
      bestMatch = { canonical, confidence: similarity };
    }
  }
  
  return bestMatch;
}

/**
 * Simple similarity calculation (can be replaced with fuzzy matching from previous module)
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2[i - 1] === str1[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Main brand normalization function
 */
export function normalizeBrandName(
  brandName: string,
  config: BrandNormalizationConfig = DEFAULT_BRAND_CONFIG
): BrandNormalizationResult {
  if (!brandName || brandName.trim().length === 0) {
    return {
      normalized: '',
      canonical: '',
      confidence: 'low',
      transformations: ['empty_input'],
      isKnownBrand: false,
    };
  }
  
  const transformations: string[] = [];
  let normalized = brandName.trim();
  
  // Step 1: Normalize case
  if (config.normalizeCase) {
    normalized = normalizeText(normalized);
    transformations.push('normalize_case');
  }
  
  // Step 2: Expand abbreviations
  if (config.expandAbbreviations) {
    const expanded = expandAbbreviations(normalized);
    if (expanded !== normalized) {
      normalized = expanded;
      transformations.push('expand_abbreviations');
    }
  }
  
  // Step 3: Remove stop words
  const withoutStopWords = removeStopWords(normalized);
  if (withoutStopWords !== normalized) {
    normalized = withoutStopWords;
    transformations.push('remove_stop_words');
  }
  
  // Step 4: Extract core brand name
  const coreName = extractCoreBrandName(normalized);
  if (coreName !== normalized) {
    normalized = coreName;
    transformations.push('extract_core_name');
  }
  
  // Step 5: Find canonical brand name
  const brandMatch = findBestBrandMatch(normalized);
  
  let canonical = normalized;
  let confidence: 'high' | 'medium' | 'low' = 'low';
  let isKnownBrand = false;
  
  if (brandMatch) {
    canonical = brandMatch.canonical;
    isKnownBrand = true;
    transformations.push('canonical_lookup');
    
    if (brandMatch.confidence >= 0.95) {
      confidence = 'high';
    } else if (brandMatch.confidence >= 0.8) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
  } else {
    // For unknown brands, preserve original case if case normalization was disabled
    if (!config.normalizeCase) {
      canonical = brandName.trim();
    }
    
    // If no known brand match, determine confidence based on transformations
    if (transformations.length <= 1) {
      confidence = 'medium';
    } else if (transformations.length <= 3) {
      confidence = 'low';
    } else {
      confidence = 'low';
    }
  }
  
  // Apply minimum confidence filter
  const confidenceOrder = { low: 0, medium: 1, high: 2 };
  if (confidenceOrder[confidence] < confidenceOrder[config.minimumConfidence]) {
    return {
      normalized: brandName.trim(),
      canonical: brandName.trim(),
      confidence: 'low',
      transformations: ['insufficient_confidence'],
      isKnownBrand: false,
    };
  }
  
  return {
    normalized,
    canonical,
    confidence,
    transformations,
    isKnownBrand,
  };
}

/**
 * Batch normalize brand names
 */
export function batchNormalizeBrands(
  brandNames: string[],
  config: BrandNormalizationConfig = DEFAULT_BRAND_CONFIG
): Map<string, BrandNormalizationResult> {
  const results = new Map<string, BrandNormalizationResult>();
  
  for (const brandName of brandNames) {
    if (!results.has(brandName)) {
      results.set(brandName, normalizeBrandName(brandName, config));
    }
  }
  
  return results;
}

/**
 * Get all canonical brand names
 */
export function getCanonicalBrandNames(): string[] {
  return Object.keys(KNOWN_BRANDS).sort();
}

/**
 * Add new brand mapping (for admin interface)
 */
export function addBrandMapping(canonical: string, variations: string[]): void {
  KNOWN_BRANDS[canonical] = [...(KNOWN_BRANDS[canonical] || []), ...variations];
  
  // Update lookup table
  const newEntry = new Map<string, string>();
  newEntry.set(canonical.toLowerCase(), canonical);
  
  for (const variation of variations) {
    newEntry.set(variation.toLowerCase(), canonical);
  }
  
  // Merge with existing lookup
  for (const [key, value] of newEntry.entries()) {
    BRAND_LOOKUP.set(key, value);
  }
}

/**
 * Find potential duplicates in brand list
 */
export function findDuplicateBrands(
  brandNames: string[],
  config: BrandNormalizationConfig = DEFAULT_BRAND_CONFIG
): Array<{ brands: string[]; canonical: string; confidence: string }> {
  const normalizedMap = new Map<string, string[]>();
  
  // Group brands by their canonical form
  for (const brandName of brandNames) {
    const result = normalizeBrandName(brandName, config);
    const canonical = result.canonical;
    
    if (!normalizedMap.has(canonical)) {
      normalizedMap.set(canonical, []);
    }
    normalizedMap.get(canonical)!.push(brandName);
  }
  
  // Return groups with more than one brand
  const duplicates: Array<{ brands: string[]; canonical: string; confidence: string }> = [];
  
  for (const [canonical, brands] of normalizedMap.entries()) {
    if (brands.length > 1) {
      // Calculate overall confidence for the group
      const confidences = brands.map(b => normalizeBrandName(b, config).confidence);
      const avgConfidence = confidences.includes('high') ? 'high' : 
                           confidences.includes('medium') ? 'medium' : 'low';
      
      duplicates.push({
        brands,
        canonical,
        confidence: avgConfidence,
      });
    }
  }
  
  return duplicates.sort((a, b) => b.brands.length - a.brands.length);
}