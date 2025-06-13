/**
 * Critical fixes for V2.5 scraper issues:
 * 1. Empty parentheses "()" still appearing in spirit names
 * 2. Brand extraction losing caps and punctuation (W.L. Weller -> "w l")
 * 3. Duplicate detection too aggressive (Bourye Whiskey matches Bourbon Whiskey)
 * 4. Zero spirits stored - 100% false duplicate rate
 */

export class V25CriticalFixes {
  /**
   * Fix 1: Remove ALL empty parentheses patterns, including those with spaces
   */
  static removeEmptyParentheses(text: string): string {
    if (!text) return '';
    
    // Remove various forms of empty parentheses
    let result = text
      .replace(/\(\s*\)/g, '') // ( )
      .replace(/\[\s*\]/g, '') // [ ]
      .replace(/\{\s*\}/g, '') // { }
      .replace(/\(\)/g, '')    // ()
      .replace(/\s+\(\s*\)\s*/g, ' ') // space ( ) space
      .replace(/\s{2,}/g, ' ') // multiple spaces to single
      .trim();
    
    return result;
  }

  /**
   * Fix 2: Enhanced brand extraction that preserves capitalization and punctuation
   * V2.5.4: Added validation to prevent garbage brands
   */
  static extractBrandFromName(name: string): string {
    if (!name) return 'Unknown';
    
    // DON'T lowercase or remove punctuation initially
    const originalName = name.trim();
    
    // V2.5.5: Handle year-prefixed spirits (1988 Wild Turkey, 2021 William Larue Weller)
    const yearPrefixMatch = originalName.match(/^(\d{4})\s+(.+)/);
    if (yearPrefixMatch) {
      // Recursively extract brand from the part after the year
      return this.extractBrandFromName(yearPrefixMatch[2]);
    }
    
    // V2.5.4: Invalid single-word brands that should be rejected
    const invalidSingleWords = new Set([
      'old', 'new', 'four', 'wild', 'king', 'best', 'discover', 
      'american', 'scotch', 'whiskey', 'bourbon', 'styles', 
      'bedtime', 'lewis', 'england', 'standard', 'size',
      'spiritless', 'kentucky', 'tennessee', 'highland'
    ]);
    
    // Known multi-word brands with exact capitalization
    const knownBrands = [
      // Bourbon brands with proper capitalization
      'Russell\'s Reserve', 'Buffalo Trace', 'Wild Turkey', 'Four Roses',
      'Old Forester', 'Maker\'s Mark', 'Elijah Craig', 'Evan Williams',
      'Henry McKenna', 'Very Old Barton', 'Old Grand-Dad', 'Old Ezra',
      'I.W. Harper', 'W.L. Weller', 'William Larue Weller', 'George T. Stagg', 'E.H. Taylor',
      'Joseph Magnus', 'High West', 'WhistlePig', 'Angel\'s Envy',
      'Michter\'s', 'Jack Daniel\'s', 'George Dickel', 'Uncle Nearest',
      'Garrison Brothers', 'Balcones', 'Westland', 'Stranahan\'s',
      'King of Kentucky', 'Orphan Barrel', 'Old Carter', 'New Riff',
      
      // Rye brands
      'Sagamore Spirit', 'Templeton', 'Rittenhouse', 'Sazerac',
      'Old Overholt', 'Pikesville', 'Dad\'s Hat', 'New Riff',
      
      // Scotch brands
      'The Macallan', 'Glenfiddich', 'The Glenlivet', 'Highland Park',
      'The Balvenie', 'Johnnie Walker', 'Chivas Regal', 'Dewar\'s',
      
      // Other spirits
      'Grey Goose', 'Ketel One', 'Don Julio', 'Patrón', 'Casamigos',
      'Captain Morgan', 'Bacardi', 'Mount Gay', 'Hennessy', 'Rémy Martin'
    ];
    
    // V2.5.4: Known valid single-word brands (exceptions to the rule)
    const validSingleWordBrands = new Set([
      'Hennessy', 'Patrón', 'Casamigos', 'Bacardi', 'Absolut',
      'Tanqueray', 'Bombay', 'Belvedere', 'Chopin', 'Tito\'s',
      'Suntory', 'Nikka', 'Hibiki', 'Yamazaki', 'Hakushu',
      'Macallan', 'Glenfiddich', 'Glenlivet', 'Lagavulin', 'Laphroaig',
      'Ardbeg', 'Talisker', 'Oban', 'Dalmore', 'Balvenie',
      'Jameson', 'Bushmills', 'Redbreast', 'Teeling', 'Tullamore',
      'Bulleit', 'Basil', 'Larceny', 'Blanton\'s', 'Michter\'s',
      'WhistlePig', 'Westland', 'Balcones', 'Stranahan\'s'
    ]);
    
    // Check for exact known brand match at start of name
    for (const brand of knownBrands) {
      if (originalName.startsWith(brand)) {
        return brand;
      }
      // Also check case-insensitive but return original capitalization
      if (originalName.toLowerCase().startsWith(brand.toLowerCase())) {
        return brand;
      }
    }
    
    // Extract brand with patterns, preserving original case
    const patterns = [
      // Match initials patterns (W.L. Weller, E.H. Taylor)
      /^([A-Z]\.[A-Z]\.?\s+[A-Z][a-zA-Z]+)/,
      
      // Match possessive patterns (Maker's Mark, Russell's Reserve, Blanton's)
      /^([A-Z][a-zA-Z]+\'s)(?:\s+[A-Z][a-zA-Z]+)?/,
      
      // Match "Old" patterns (Old Forester, Old Grand-Dad)
      /^(Old\s+[A-Z][a-zA-Z-]+(?:\s+[A-Z][a-zA-Z]+)?)/,
      
      // Match "The" patterns (The Macallan, The Glenlivet)
      /^(The\s+[A-Z][a-zA-Z]+)/,
      
      // Match numbered brands (Four Roses)
      /^((?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)\s+[A-Z][a-zA-Z]+)/
    ];
    
    for (const pattern of patterns) {
      const match = originalName.match(pattern);
      if (match) {
        const extracted = match[1].trim();
        
        // Check for single-word possessives like Blanton's, Michter's
        if (extracted.match(/^[A-Z][a-zA-Z]+\'s$/)) {
          if (validSingleWordBrands.has(extracted)) {
            return extracted;
          }
        }
        
        return extracted;
      }
    }
    
    // Default: take first word or two, preserving case
    const words = originalName.split(/\s+/);
    
    // V2.5.4: Validate single-word brands
    if (words.length === 1) {
      const singleWord = words[0];
      const lowerWord = singleWord.toLowerCase();
      
      // Reject invalid single words
      if (invalidSingleWords.has(lowerWord) && !validSingleWordBrands.has(singleWord)) {
        return 'Unknown';
      }
      
      // Accept valid single-word brands
      if (validSingleWordBrands.has(singleWord)) {
        return singleWord;
      }
      
      // Reject if too short or doesn't look like a brand
      if (singleWord.length < 3 || !/^[A-Z]/.test(singleWord)) {
        return 'Unknown';
      }
      
      return singleWord;
    }
    
    if (words.length >= 2) {
      // V2.5.4: Check if first word is invalid (case-insensitive)
      const firstLower = words[0].toLowerCase();
      if (invalidSingleWords.has(firstLower) && !validSingleWordBrands.has(words[0])) {
        return 'Unknown';
      }
      
      // Check if second word is a descriptor or number (for age statements)
      const descriptors = ['Bourbon', 'Whiskey', 'Whisky', 'Rye', 'Single', 'Barrel', 'Year', 'Old', 'Proof'];
      const descriptorsLower = descriptors.map(d => d.toLowerCase());
      const isNumber = /^\d+$/.test(words[1]);
      
      if (descriptorsLower.includes(words[1].toLowerCase()) || isNumber) {
        // Return just the first word if it's valid
        const firstWord = words[0];
        
        // Special case for valid single-word brands
        if (validSingleWordBrands.has(firstWord)) {
          return firstWord;
        }
        
        // Otherwise validate it's not an invalid word
        const lowerFirst = firstWord.toLowerCase();
        if (invalidSingleWords.has(lowerFirst)) {
          return 'Unknown';
        }
        
        return firstWord;
      }
      
      // V2.5.4: Don't extract phrases that are clearly not brands
      const phrase = `${words[0]} ${words[1]}`;
      const invalidPhrases = [
        /^discover the/i, /^best bourbon/i, /^american whiskey/i,
        /^scotch under/i, /^styles of/i, /^king of/i,
        /^standard size/i, /^spiritless kentucky/i,
        /^old bourbon/i, /^new whiskey/i, /^four year/i,
        /^wild bourbon/i, /^king whiskey/i
      ];
      
      if (invalidPhrases.some(pattern => pattern.test(phrase))) {
        return 'Unknown';
      }
      
      return phrase;
    }
    
    return 'Unknown';
  }
  
  /**
   * V2.5.4: Validate if a string is a valid brand name
   */
  static isValidBrand(brand: string): boolean {
    if (!brand || brand === 'Unknown' || brand.length < 2) {
      return false;
    }
    
    const lowerBrand = brand.toLowerCase();
    
    // Special case for known multi-word brands containing "invalid" words
    const validMultiWordExceptions = [
      'king of kentucky',
      'old forester',
      'old grand-dad',
      'old carter',
      'new riff',
      'four roses',
      'wild turkey'
    ];
    
    if (validMultiWordExceptions.includes(lowerBrand)) {
      return true;
    }
    
    // Check invalid single words
    const invalidSingleWords = new Set([
      'old', 'new', 'four', 'wild', 'king', 'best', 'discover', 
      'american', 'scotch', 'whiskey', 'bourbon', 'styles', 
      'bedtime', 'lewis', 'england', 'standard', 'size',
      'spiritless', 'kentucky', 'tennessee', 'highland'
    ]);
    
    // Known valid single-word brands
    const validSingleWordBrands = new Set([
      'Hennessy', 'Patrón', 'Casamigos', 'Bacardi', 'Absolut',
      'Tanqueray', 'Bombay', 'Belvedere', 'Chopin', 'Tito\'s',
      'Suntory', 'Nikka', 'Hibiki', 'Yamazaki', 'Hakushu',
      'Macallan', 'Glenfiddich', 'Glenlivet', 'Lagavulin', 'Laphroaig',
      'Ardbeg', 'Talisker', 'Oban', 'Dalmore', 'Balvenie',
      'Jameson', 'Bushmills', 'Redbreast', 'Teeling', 'Tullamore',
      'Bulleit', 'Basil', 'Larceny', 'Blanton\'s', 'Michter\'s',
      'WhistlePig', 'Westland', 'Balcones', 'Stranahan\'s'
    ]);
    
    // Single word validation
    if (!brand.includes(' ')) {
      if (invalidSingleWords.has(lowerBrand) && !validSingleWordBrands.has(brand)) {
        return false;
      }
    }
    
    // Invalid phrases
    const invalidPhrases = [
      /^discover/i, /^best\s/i, /^scotch\s+under/i, 
      /^american\s+whiskey$/i, /^styles\s+of/i, /^king\s+of/i,
      /^standard\s+size/i, /^spiritless/i
    ];
    
    if (invalidPhrases.some(pattern => pattern.test(brand))) {
      return false;
    }
    
    return true;
  }

  /**
   * Fix 3: More precise duplicate detection with better normalization
   */
  static createPreciseNormalizedKey(name: string): string {
    if (!name) return '';
    
    // Start with lowercase
    let key = name.toLowerCase();
    
    // Remove volume info more precisely
    key = key.replace(/\b\d+\s*ml\b/g, '');
    key = key.replace(/\b\d+\s*l\b/g, '');
    key = key.replace(/\b\d+\.\d+\s*l\b/g, '');
    
    // Remove year info but preserve age statements
    key = key.replace(/\s*\(\d{4}\)\s*/g, ' '); // (2024)
    key = key.replace(/\s+20\d{2}\s+(?!year)/g, ' '); // 2024 but not "2024 year"
    
    // Normalize spacing and punctuation
    key = key.replace(/[^\w\s]/g, ' '); // Replace special chars with space
    key = key.replace(/\s+/g, ' '); // Multiple spaces to single
    key = key.trim();
    
    // DON'T normalize whiskey/whisky variations - keep them distinct
    // DON'T remove brand-specific terms
    
    return key;
  }

  /**
   * Fix 3b: Enhanced duplicate checking with better logging
   */
  static isDuplicateWithLogging(spirit1: any, spirit2: any, threshold: number = 0.90): {
    isDuplicate: boolean;
    reason: string;
    similarity: number;
  } {
    // Ensure we have names
    if (!spirit1.name || !spirit2.name) {
      return { isDuplicate: false, reason: 'Missing name', similarity: 0 };
    }
    
    // Create normalized keys
    const key1 = this.createPreciseNormalizedKey(spirit1.name);
    const key2 = this.createPreciseNormalizedKey(spirit2.name);
    
    // Calculate basic similarity
    const similarity = this.calculateSimilarity(key1, key2);
    
    // Check for obvious non-duplicates
    if (similarity < 0.5) {
      return { isDuplicate: false, reason: 'Low similarity', similarity };
    }
    
    // Check for critical differences that indicate different products
    
    // 1. Different years in name
    const year1 = spirit1.name.match(/\b(20\d{2}|19\d{2})\b/);
    const year2 = spirit2.name.match(/\b(20\d{2}|19\d{2})\b/);
    if (year1 && year2 && year1[1] !== year2[1]) {
      return { isDuplicate: false, reason: `Different years: ${year1[1]} vs ${year2[1]}`, similarity };
    }
    
    // 2. Different age statements
    const age1 = spirit1.name.match(/\b(\d{1,2})\s*year/i);
    const age2 = spirit2.name.match(/\b(\d{1,2})\s*year/i);
    if (age1 && age2 && age1[1] !== age2[1]) {
      return { isDuplicate: false, reason: `Different ages: ${age1[1]} vs ${age2[1]}`, similarity };
    }
    
    // 3. Different batch numbers
    const batch1 = spirit1.name.match(/batch\s*#?\s*(\w+)/i);
    const batch2 = spirit2.name.match(/batch\s*#?\s*(\w+)/i);
    if (batch1 && batch2 && batch1[1] !== batch2[1]) {
      return { isDuplicate: false, reason: `Different batches: ${batch1[1]} vs ${batch2[1]}`, similarity };
    }
    
    // 4. Different proof/ABV
    if (spirit1.abv && spirit2.abv && Math.abs(spirit1.abv - spirit2.abv) > 3) {
      return { isDuplicate: false, reason: `Different ABV: ${spirit1.abv} vs ${spirit2.abv}`, similarity };
    }
    
    // 5. Critical word differences
    const criticalDifferences = [
      ['bourbon', 'rye'],
      ['bourbon', 'whiskey'],
      ['single barrel', 'small batch'],
      ['cask strength', 'bottled in bond'],
      ['blanco', 'reposado'],
      ['blanco', 'añejo']
    ];
    
    for (const [word1, word2] of criticalDifferences) {
      const has1in1 = key1.includes(word1);
      const has2in1 = key1.includes(word2);
      const has1in2 = key2.includes(word1);
      const has2in2 = key2.includes(word2);
      
      if ((has1in1 && has2in2 && !has2in1 && !has1in2) || 
          (has2in1 && has1in2 && !has1in1 && !has2in2)) {
        return { isDuplicate: false, reason: `Critical difference: ${word1} vs ${word2}`, similarity };
      }
    }
    
    // 6. Special case: "Bourye" vs "Bourbon"
    if ((key1.includes('bourye') && key2.includes('bourbon')) ||
        (key1.includes('bourbon') && key2.includes('bourye'))) {
      return { isDuplicate: false, reason: 'Bourye vs Bourbon difference', similarity };
    }
    
    // If similarity is very high and no critical differences found
    if (similarity >= threshold) {
      return { isDuplicate: true, reason: `High similarity: ${(similarity * 100).toFixed(1)}%`, similarity };
    }
    
    return { isDuplicate: false, reason: `Below threshold: ${(similarity * 100).toFixed(1)}%`, similarity };
  }

  /**
   * Simple similarity calculation
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0;
    
    // Use Jaccard similarity on word sets
    const words1 = new Set(str1.split(' '));
    const words2 = new Set(str2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Fix 4: Enhanced logging for debugging why spirits aren't stored
   */
  static logStorageAttempt(spirit: any, existingSpirit: any, duplicateCheck: any) {
    console.log('\n📝 Storage Attempt:');
    console.log(`  Spirit: ${spirit.name}`);
    console.log(`  Brand: ${spirit.brand}`);
    console.log(`  Type: ${spirit.type}`);
    console.log(`  Price: ${spirit.price ? '$' + spirit.price : 'N/A'}`);
    
    if (existingSpirit) {
      console.log('\n  ❌ Blocked by existing spirit:');
      console.log(`    Name: ${existingSpirit.name}`);
      console.log(`    Brand: ${existingSpirit.brand}`);
      console.log(`    Similarity: ${(duplicateCheck.similarity * 100).toFixed(1)}%`);
      console.log(`    Reason: ${duplicateCheck.reason}`);
    } else {
      console.log('  ✅ No duplicate found');
    }
  }

  /**
   * V2.5.5: Validate if a string is a valid product name (not an article/guide)
   * ENHANCED 2025-06-12: Much stricter validation to prevent garbage entries
   */
  static isValidProductName(name: string): boolean {
    if (!name) return false;
    
    // CRITICAL: Reject truncated names
    if (name.includes('...') || name.endsWith(' .') || name.match(/\s+\d+\.\s*$/)) {
      console.log(`❌ Rejected truncated name: "${name}"`);
      return false;
    }
    
    // CRITICAL: Reject website domains and URLs
    if (name.match(/\.(com|net|org|co\.uk|shop|store)$/i) || name.includes('-whisky.com')) {
      console.log(`❌ Rejected website/domain: "${name}"`);
      return false;
    }
    
    // CRITICAL: Reject article titles and content
    const articlePatterns = [
      /^the\s+history\s+of/i,
      /^discover\s+the/i,
      /^best\s+bourbon/i,
      /^top\s+\d+/i,
      /^how\s+to/i,
      /guide$/i,
      /^the\s+most\s+popular/i,
      /^what\s+is\s+/i,
      /^why\s+/i,
      /^when\s+/i,
      /distillery\s*[-–]\s*whisky\.com$/i,
      /crown\s+wine\s*\.\.\.$/i,
      /same-day\s+delivery/i,
      /delivery\s*\.\.\.$/i
    ];
    
    if (articlePatterns.some(pattern => pattern.test(name))) {
      console.log(`❌ Rejected article/content: "${name}"`);
      return false;
    }
    
    // Original invalid patterns
    const invalidPatterns = [
      /available\s+in\s+\w+,\s+\w+$/i,
      /^buy\s+/i,
      /^shop\s+/i,
      /^find\s+/i,
      /^learn\s+about/i,
      /^explore\s+our/i,
      /collection$/i,
      /^compare\s+prices/i,
      /^a\s+to\s+z\s+of/i,
      /brands\s*:\s*the\s+whisky\s+exchange$/i,
      /FAQ$/i,
      /^unlock\s+exclusive/i,
      /\s+-\s*$/,  // Names ending with " -"
      /^[a-z]/  // Names starting with lowercase (usually not products)
    ];
    
    // Reject if matches any invalid pattern
    if (invalidPatterns.some(pattern => pattern.test(name))) {
      console.log(`❌ Rejected invalid pattern: "${name}"`);
      return false;
    }
    
    // Reject if too long (likely a sentence/description)
    if (name.length > 100) {
      console.log(`❌ Rejected too long: "${name}" (${name.length} chars)`);
      return false;
    }
    
    // Reject if contains question marks (likely a question/title)
    if (name.includes('?')) {
      console.log(`❌ Rejected question: "${name}"`);
      return false;
    }
    
    // Reject if it's just a single word with a dash (like "Savannah -")
    if (name.match(/^\w+\s*-\s*$/)) {
      console.log(`❌ Rejected incomplete: "${name}"`);
      return false;
    }
    
    // POSITIVE VALIDATION: Must contain spirit-related indicators
    const mustContainPatterns = [
      /whisky|whiskey|bourbon|scotch|rum|vodka|gin|tequila|mezcal|brandy|cognac/i,
      /\d+\s*(year|yr|yo)\s/i,  // Age statements
      /\d+ml|\d+\s*liter|bottle/i,  // Volume indicators
      /single\s+malt|blended|straight|bottled|cask|barrel/i,  // Production terms
      /grand\s+cru|grande\s+couronne|experimental\s+series/i,  // Special editions
      /limited\s+edition|special\s+release|reserve/i  // Premium indicators
    ];
    
    // Known distillery names that indicate a spirit product
    const knownDistilleries = [
      'Glenfiddich', 'Macallan', 'Glenlivet', 'Buffalo Trace', 'Jack Daniel',
      'Maker\'s Mark', 'Wild Turkey', 'Jameson', 'Bushmills', 'Hennessy'
    ];
    
    // Check if it's from a known distillery (more lenient)
    const isKnownDistillery = knownDistilleries.some(distillery => 
      name.toLowerCase().includes(distillery.toLowerCase())
    );
    
    // At least ONE of these patterns must match OR it's from a known distillery
    const hasValidIndicator = mustContainPatterns.some(pattern => pattern.test(name));
    
    if (!hasValidIndicator && !isKnownDistillery) {
      console.log(`❌ Rejected - no spirit indicators: "${name}"`);
      return false;
    }
    
    return true;
  }

  /**
   * Clean truncated names
   */
  static cleanTruncatedName(name: string): string {
    if (!name) return name;
    
    // Remove truncation indicators
    let cleaned = name
      .replace(/\s+\d+\.\s+Crown\s+Wine\s*\.\.\.$/, '')  // Remove "1. Crown Wine ..."
      .replace(/\s+Crown\s+Wine\s*\.\.\.$/, '')  // Remove "Crown Wine ..."
      .replace(/\s+Same-day\s+Delivery\s*\.\.\.$/, '')  // Remove delivery text
      .replace(/\s*\.\.\.\s*$/, '')  // Remove trailing ...
      .replace(/\s+\d+\.\s*$/, '')    // Remove trailing "1."
      .trim();
    
    return cleaned;
  }

  /**
   * Clean store artifacts from names
   */
  static cleanStoreArtifacts(name: string): string {
    if (!name) return name;
    
    let cleaned = name
      // Remove store names at end
      .replace(/\s*[-–]\s*Bottega\s+Whiskey\s*$/i, '')
      .replace(/\s*[-–]\s*Crown\s+Wine\s*$/i, '')
      .replace(/\s*[-–]\s*Total\s+Wine\s*$/i, '')
      .replace(/\s*[-–]\s*K&L\s+Wines\s*$/i, '')
      .replace(/\s*[-–]\s*The\s+Whisky\s+Exchange\s*$/i, '')
      // Remove store names anywhere in string
      .replace(/\s+Bottega\s+Whiskey\s*/gi, '')
      // Remove weird formatting
      .replace(/\s*\(\s*\d+%\s*\)\s*/g, ' ')  // Remove (43%)
      .replace(/Series-(\w)/g, (match, p1) => 'Series ' + p1.toUpperCase())  // Fix Series-orchard to Series Orchard
      .replace(/Series\s+(\w)/g, (match, p1) => 'Series ' + p1.toUpperCase())  // Ensure capitalization after Series
      .replace(/\s+700ml\s*$/i, '')  // Remove volume at end
      .replace(/\s+750ml\s*$/i, '')  // Remove volume at end
      .replace(/\s+1L\s*$/i, '')  // Remove volume at end
      .replace(/\s+1\.75L\s*$/i, '')  // Remove volume at end
      // Fix spacing but don't mess with capitalization if name already has proper caps
      .replace(/\s{2,}/g, ' ')  // Multiple spaces to single
      .trim();
    
    return cleaned;
  }

  /**
   * Apply all fixes to a spirit object
   */
  static applyAllFixes(spirit: any): any {
    const fixed = { ...spirit };
    
    // Fix 1: Remove empty parentheses
    if (fixed.name) {
      fixed.name = this.removeEmptyParentheses(fixed.name);
      // NEW: Clean truncated names
      fixed.name = this.cleanTruncatedName(fixed.name);
      // NEW: Clean store artifacts
      fixed.name = this.cleanStoreArtifacts(fixed.name);
    }
    
    // Fix 2: Better brand extraction
    if (!fixed.brand || fixed.brand === 'Unknown' || fixed.brand.length < 3) {
      fixed.brand = this.extractBrandFromName(fixed.name);
    }
    
    // V2.5.4: Validate the brand
    if (fixed.brand && !this.isValidBrand(fixed.brand)) {
      // Try to extract a better brand or set to Unknown
      const betterBrand = this.extractBrandFromName(fixed.name);
      if (this.isValidBrand(betterBrand)) {
        fixed.brand = betterBrand;
      } else {
        fixed.brand = 'Unknown';
      }
    }
    
    // Ensure description doesn't have empty parentheses either
    if (fixed.description) {
      fixed.description = this.removeEmptyParentheses(fixed.description);
    }
    
    return fixed;
  }
}