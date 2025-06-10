/**
 * Enhanced Normalization Module for Spirit Name Deduplication
 * 
 * Addresses specific duplication patterns identified in analysis:
 * - Size variants (8%): Sample, Miniature, Magnum, Traveler
 * - Marketing text (6%): Gift Box, Ratings and Reviews, Order Online
 * - Year variants (4%): 2022 vs 2025 releases
 * - Proof notation (4%): Proof vs Pf abbreviation
 * - Type mismatches (3%): Bourbon vs Whiskey classification
 */

export interface NormalizationConfig {
  removeSize: boolean;
  removeMarketing: boolean;
  removeYear: boolean;
  standardizeProof: boolean;
  removeRetailerText: boolean;
  aggressiveMode: boolean;
}

export const DEFAULT_NORMALIZATION_CONFIG: NormalizationConfig = {
  removeSize: true,
  removeMarketing: true,
  removeYear: true,
  standardizeProof: true,
  removeRetailerText: true,
  aggressiveMode: true,
};

/**
 * Size-related patterns to remove
 */
const SIZE_PATTERNS = [
  // Volume measurements
  /\b\d+\s*ml\b/gi,
  /\b\d+\s*m\s*l\b/gi,
  /\b\d+\s*milliliters?\b/gi,
  /\b\d+\s*liters?\b/gi,
  /\b\d+\s*l\b/gi,
  /\b\d+\s*cl\b/gi,
  /\b\d+\s*oz\b/gi,
  /\b\d+\s*ounces?\b/gi,
  
  // Size descriptors
  /\b(sample|samples)\b/gi,
  /\b(miniature|mini|minis)\b/gi,
  /\b(magnum|magnums)\b/gi,
  /\b(traveler|travelers|travel)\s*(size|bottle)?\b/gi,
  /\b(half|quarter)\s*bottle\b/gi,
  /\b(double|triple)\s*size\b/gi,
  /\b(large|small|medium)\s*(bottle|format|size)?\b/gi,
  /\b\d+\s*pack\b/gi,
  /\bpack\s*of\s*\d+\b/gi,
];

/**
 * Marketing and retail-related text patterns
 */
const MARKETING_PATTERNS = [
  // Gift-related
  /\bgift\s*(box|set|pack|package|edition)\b/gi,
  /\b(holiday|christmas|fathers?\s*day|mothers?\s*day)\s*(gift|edition|special)\b/gi,
  /\bwith\s*(glass|glasses|tumbler|rocks\s*glass)\b/gi,
  
  // Online/retail
  /\b(order|buy|shop)\s*online\b/gi,
  /\b(ratings?\s*and\s*reviews?|reviews?\s*and\s*ratings?)\b/gi,
  /\b(online|web)\s*exclusive\b/gi,
  /\b(in\s*stock|out\s*of\s*stock|availability)\b/gi,
  /\b(free\s*shipping|ships?\s*free)\b/gi,
  /\b(limited|special)\s*(time|offer|deal|price)\b/gi,
  /\b(sale|discount|save|off)\s*\d*%?\b/gi,
  
  // Store/retailer specific
  /\b(total\s*wine|klwines|finedrams|thewhiskyexchange)\b/gi,
  /\b(store\s*pick|exclusive\s*selection|private\s*selection)\b/gi,
];

/**
 * Year-related patterns (but preserve age statements)
 */
const YEAR_PATTERNS = [
  // Release years in parentheses
  /\(\d{4}\)/g,
  /\b20\d{2}\s*release\b/gi,
  /\b20\d{2}\s*edition\b/gi,
  /\breleased?\s*in\s*\d{4}\b/gi,
  
  // But NOT age statements
  /(?<!\d\s*)(year|yr)\s*\d{4}/gi,
];

/**
 * Proof notation variations
 */
const PROOF_PATTERNS = [
  { pattern: /\bproof\b/gi, replacement: 'pf' },
  { pattern: /\bpf\b/gi, replacement: 'pf' },
  { pattern: /\bproof\./gi, replacement: 'pf' },
  { pattern: /\bp\.f\./gi, replacement: 'pf' },
];

/**
 * Create a normalized comparison key from a spirit name
 */
export function createNormalizedKey(
  name: string,
  config: NormalizationConfig = DEFAULT_NORMALIZATION_CONFIG
): string {
  let normalized = name.trim();
  
  // Step 1: Remove size-related text
  if (config.removeSize) {
    SIZE_PATTERNS.forEach(pattern => {
      normalized = normalized.replace(pattern, ' ');
    });
  }
  
  // Step 2: Remove marketing text
  if (config.removeMarketing) {
    MARKETING_PATTERNS.forEach(pattern => {
      normalized = normalized.replace(pattern, ' ');
    });
  }
  
  // Step 3: Remove year variants (but keep age statements)
  if (config.removeYear) {
    // First, protect age statements by temporarily replacing them
    const ageStatements: string[] = [];
    normalized = normalized.replace(/\b(\d{1,3})\s*(year|yr|y\.o\.|yo)\b/gi, (match) => {
      ageStatements.push(match);
      return `__AGE_${ageStatements.length - 1}__`;
    });
    
    // Remove year patterns
    YEAR_PATTERNS.forEach(pattern => {
      normalized = normalized.replace(pattern, ' ');
    });
    
    // Restore age statements
    ageStatements.forEach((age, index) => {
      normalized = normalized.replace(`__AGE_${index}__`, age);
    });
  }
  
  // Step 4: Standardize proof notation
  if (config.standardizeProof) {
    PROOF_PATTERNS.forEach(({ pattern, replacement }) => {
      normalized = normalized.replace(pattern, replacement);
    });
  }
  
  // Step 5: Additional normalization
  normalized = normalized
    // Convert to lowercase
    .toLowerCase()
    // Normalize whiskey/whisky
    .replace(/\bwhiskey\b/g, 'whisky')
    // Normalize common abbreviations
    .replace(/\bbottled\s*in\s*bond\b/gi, 'bib')
    .replace(/\bsingle\s*barrel\b/gi, 'sb')
    .replace(/\bsingle-barrel\b/gi, 'sb')
    .replace(/\bsmall\s*batch\b/gi, 'smb')
    .replace(/\bcask\s*strength\b/gi, 'cs')
    .replace(/\bbarrel\s*proof\b/gi, 'bp')
    .replace(/\bstraight\s*bourbon\s*whisky\b/gi, 'bourbon')
    .replace(/\bstraight\s*bourbon\b/gi, 'bourbon')
    .replace(/\bkentucky\s*straight\s*bourbon\b/gi, 'ky bourbon')
    .replace(/\bkentucky\s*straight\b/gi, 'ky')
    // Normalize apostrophes and quotes
    .replace(/[''`]/g, '')
    .replace(/[""]/g, '')
    // Normalize hyphens and dashes
    .replace(/[‐‑‒–—―]/g, '-')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove leading/trailing spaces
    .trim();
  
  // Step 6: Aggressive mode - remove all special characters
  if (config.aggressiveMode) {
    normalized = normalized
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  return normalized;
}

/**
 * Create multiple normalization keys with different levels of aggressiveness
 */
export function createMultipleKeys(name: string): {
  standard: string;
  aggressive: string;
  ultraAggressive: string;
} {
  // Standard normalization
  const standard = createNormalizedKey(name, {
    ...DEFAULT_NORMALIZATION_CONFIG,
    aggressiveMode: false,
  });
  
  // Aggressive normalization
  const aggressive = createNormalizedKey(name, DEFAULT_NORMALIZATION_CONFIG);
  
  // Ultra-aggressive: remove ALL spaces and numbers
  const ultraAggressive = aggressive
    .replace(/\s/g, '')
    .replace(/\d/g, '');
  
  return {
    standard,
    aggressive,
    ultraAggressive,
  };
}

/**
 * Check if two names are likely duplicates based on normalized keys
 */
export function areNamesDuplicate(
  name1: string,
  name2: string,
  threshold: number = 0.95
): boolean {
  const keys1 = createMultipleKeys(name1);
  const keys2 = createMultipleKeys(name2);
  
  // Exact match on any key level
  if (
    keys1.standard === keys2.standard ||
    keys1.aggressive === keys2.aggressive ||
    keys1.ultraAggressive === keys2.ultraAggressive
  ) {
    return true;
  }
  
  // Check similarity if not exact match
  // This would integrate with fuzzy matching
  return false;
}

/**
 * Extract variant information that was normalized away
 */
export function extractVariantInfo(name: string): {
  size?: string;
  year?: string;
  giftSet?: boolean;
  proof?: string;
} {
  const info: any = {};
  
  // Extract size
  const sizeMatch = name.match(/\b(\d+)\s*(ml|m\s*l|liter|l)\b/i);
  if (sizeMatch) {
    info.size = sizeMatch[0].replace(/\s+/g, '').toLowerCase();
  }
  
  // Extract year (not age)
  const yearMatch = name.match(/\((\d{4})\)/);
  if (yearMatch) {
    info.year = yearMatch[1];
  }
  
  // Check for gift set
  if (/gift\s*(box|set|pack)/i.test(name)) {
    info.giftSet = true;
  }
  
  // Extract proof
  const proofMatch = name.match(/\b(\d+)\s*(proof|pf|p\.f\.)\b/i);
  if (proofMatch) {
    info.proof = proofMatch[1];
  }
  
  return info;
}

/**
 * Group names by normalized key for deduplication
 */
export function groupByNormalizedKey(
  names: string[]
): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  
  names.forEach(name => {
    const key = createNormalizedKey(name);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(name);
  });
  
  return groups;
}