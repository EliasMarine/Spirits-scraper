# AI Scraper Training Ruleset v3.0
*Built from lessons learned in V2.5 through V2.9.1*

## Table of Contents
1. [Core Principles](#core-principles)
2. [Product Validation Rules](#product-validation-rules)
3. [Price Extraction Strategy](#price-extraction-strategy)
4. [Brand & Name Normalization](#brand--name-normalization)
5. [Quality Scoring System](#quality-scoring-system)
6. [Duplicate Detection](#duplicate-detection)
7. [Natural Language Processing Rules](#natural-language-processing-rules)
8. [Error Prevention & Confidence Thresholds](#error-prevention--confidence-thresholds)
9. [Logging & Feedback Loop](#logging--feedback-loop)
10. [Training Data Validation](#training-data-validation)

---

## Core Principles

### 1. Prevention Over Correction
- Filter bad data at the source, not after storage
- Use multi-layer validation: URL → Title → Content → Pre-storage
- Early rejection saves processing time and maintains data quality

### 2. Confidence-Based Decision Making
- Every validation returns a confidence score (0.0 to 1.0)
- Minimum confidence threshold: 0.90 for automatic acceptance
- 0.70-0.89: Flag for manual review
- Below 0.70: Automatic rejection

### 3. Learn From Every Decision
- Track patterns from rejected entries
- Update validation rules based on false positives/negatives
- Maintain a feedback loop for continuous improvement

---

## Product Validation Rules

### Hard Rejection Patterns (Immediate Disqualification)

#### Non-Product Content
```markdown
REJECT IF NAME CONTAINS:
- "cocktail recipe" | "how to make" | "mixed drink"
- "restaurant menu" | "bar menu" | "tap list"
- "podcast" | "episode" | "blog" | "article"
- "gift guide" | "father's day" | "mother's day" | "holiday"
- "top 10" | "best of" | "list of" | "guide to"
- "event space" | "party" | "competition" | "awards"
- "school" | "university" | "academy" | "education"
- "delivery near me" | "open now" | "store hours"
```

#### URL Patterns to Skip
```markdown
SKIP URLS CONTAINING:
- /recipes/ | /cocktails/ | /blog/ | /articles/
- /collections/ | /category/ | /tag/
- /menu/ | /events/ | /podcast/
- podcasts.apple.com | spotify.com | youtube.com
- facebook.com | instagram.com | twitter.com
```

#### E-commerce Metadata (K&L Wine Specific)
```markdown
REJECT IF NAME MATCHES:
- "Ship As A: [Product]"
- "Sku [Number]"
- "Product Details"
- "Case Sale Only"
- "Limited Time Special"
```

### Product Name Quality Checks

#### Minimum Requirements
- Length: 10-150 characters
- Must contain at least one spirit type indicator OR known brand
- Cannot start with lowercase letter
- Cannot end with store name ("Mission", "Wine", "Liquor")
- No broken spacing ("Ba Lcones" → reject unless fixed)

#### Spirit Type Indicators
```markdown
VALID SPIRIT TYPES:
- Whiskey | Whisky | Bourbon | Rye | Scotch
- Vodka | Gin | Rum | Tequila | Mezcal
- Cognac | Brandy | Armagnac | Calvados
- Single Malt | Blended | Grain | Tennessee Whiskey
```

---

## Price Extraction Strategy

### 4-Tier Extraction Approach (V2.9.1)

#### Tier 1: Structured Data
```markdown
CHECK IN ORDER:
1. Meta property="product:price:amount"
2. Meta property="og:price:amount"
3. JSON-LD Product.offers.price
4. JSON-LD AggregateOffer.lowPrice
```

#### Tier 2: Generic Price Tags
```markdown
PATTERNS TO MATCH:
- <meta.*price.*content="([0-9.]+)"
- itemprop="price".*content="([0-9.]+)"
- data-price="([0-9.]+)"
```

#### Tier 3: E-commerce Selectors
```markdown
CSS SELECTORS (60+ patterns):
- .product-price, .price-now, .sale-price
- [class*="price"] span, .price-box .regular-price
- .add-to-cart-price, .product-info .price
```

#### Tier 4: Text Pattern Extraction
```markdown
REGEX PATTERNS (avoid false positives):
- Skip if contains: year (1995), age (12 year), proof (86 proof)
- Match: $XX.XX, USD XX, €XX, £XX
- Context: "price:", "costs:", "MSRP:", "retail:"
- Range: "$XX-$XX" (take lower bound)
```

### Price Validation
- Range: $5.00 to $5,000.00
- Automatic adjustments:
  - If < $5 and ×10 is valid → multiply by 10
  - If > $5,000 and ÷100 is valid → divide by 100
- Currency conversion: GBP×1.27, EUR×1.09

---

## Brand & Name Normalization

### Brand Extraction Rules

#### Known Multi-Word Brands (V2.7.1)
```markdown
PRESERVE EXACT FORMATTING:
- Buffalo Trace | Wild Turkey | Four Roses
- Jack Daniel's | Maker's Mark | Jim Beam
- Russell's Reserve | Angel's Envy | Michter's
- W.L. Weller | E.H. Taylor | Heaven Hill
- Widow Jane | Old Forester | New Riff
```

#### Brand Extraction Patterns
1. Check known brands dictionary first
2. Extract from "Brand Name Product Type" pattern
3. Handle special cases:
   - Year prefixes: "1792 Bourbon" → Brand: "1792"
   - Possessives: "Michter's" (not "Michter S")
   - Initials: "W.L." (not "W L")

#### Invalid Brands to Reject
```markdown
SINGLE WORDS TO REJECT:
- the | a | an | new | old | best
- type | core | unknown | various
- shop | store | buy | sale
```

### Name Cleaning Pipeline

#### Step 1: Remove Noise
```markdown
REMOVE/CLEAN:
- Empty parentheses "()"
- Store suffixes: "- Mission Wine", "| Total Wine"
- HTML entities: &amp; → &, &quot; → "
- Extra whitespace and special characters
```

#### Step 2: Fix Common Issues
```markdown
FIX PATTERNS:
- "Ba Lcones" → "Balcones"
- "Buffa Lo Trace" → "Buffalo Trace"
- "Maker S Mark" → "Maker's Mark"
- "C.Y.P.B." → maintain spacing
- "VSOP" → maintain as uppercase
```

#### Step 3: Standardize Format
```markdown
APPLY FORMATTING:
- Title case for brands and products
- Preserve numbers and special editions
- Keep meaningful descriptors (Limited Edition, Single Barrel)
- Remove redundant spirit types ("Bourbon Bourbon" → "Bourbon")
```

---

## Quality Scoring System

### Base Score Calculation (100 points)

#### Deductions
```markdown
NO PRICE: -20 points (critical signal)
NO/GENERIC BRAND: -15 points
MISSING ABV: -10 points
NO DESCRIPTION: -10 points
SHORT NAME (<15 chars): -20 points
"OTHER" CATEGORY: -25 points
NO DISTILLERY: -5 points
```

#### Bonuses
```markdown
HAS PRICE: +10 points
SPECIFIC CATEGORY: +10 points
KNOWN BRAND: +5 points
HAS ABV/PROOF: +5 points each
AGE STATEMENT: +10 points
DISTILLERY INFO: +10 points
LONG DESCRIPTION: +5 points
SPECIAL ATTRIBUTES: +5 points (Single Barrel, Cask Strength)
```

### Dynamic Thresholds
```markdown
BASE THRESHOLD: 75 points

ADJUSTMENTS:
- Has Price: Lower to 65
- Premium Category (Cognac, Japanese): Lower by 5
- Generic Entry: Raise by 10
- Known Problematic Pattern: Raise by 15
```

---

## Duplicate Detection

### Smart Matching Algorithm (V2.7.1)

#### Exact Match Check
1. Normalize both names (lowercase, remove special chars)
2. If identical → duplicate

#### Variation Detection
```markdown
DIFFERENT = NOT DUPLICATE:
- Different years: "2023" vs "2024"
- Different batches: "Batch 001" vs "Batch 002"  
- Different proofs: "86 Proof" vs "100 Proof"
- Different sizes: "750ml" vs "1.75L"
```

#### Similarity Threshold
```markdown
WORD-BASED SIMILARITY:
- Split names into words
- Count common words
- Similarity = (2 × common) / (words1 + words2)
- Threshold: 0.92 (92% similar)
```

---

## Natural Language Processing Rules

### Fuzzy Matching for Brands
```markdown
COMMON VARIATIONS TO MATCH:
- "Maker's Mark" = "Makers Mark" = "Maker's"
- "Jack Daniel's" = "Jack Daniels" = "JD"
- "W.L. Weller" = "WL Weller" = "William Larue Weller"
```

### Synonym Recognition
```markdown
SPIRIT TYPE SYNONYMS:
- Whisky = Whiskey
- Bourbon = Kentucky Straight Bourbon Whiskey
- Rye = Rye Whiskey = Straight Rye
```

### Noise Word Removal
```markdown
REMOVE UNLESS MEANINGFUL:
- Distillery | Distilleries | Co. | Company
- Limited | Edition | Special | Release
- Small | Batch | Single | Barrel

KEEP WHEN MEANINGFUL:
- "Small Batch" as complete phrase
- "Single Barrel" as complete phrase
- "Limited Edition" with year/batch
```

---

## Error Prevention & Confidence Thresholds

### Confidence Score Calculation
```markdown
START: 1.0 (100% confidence)

DEDUCT FOR:
- Non-product words: -0.2 each
- Missing spirit type: -0.3
- Unknown brand: -0.2
- Too short/long: -0.2
- Bad URL pattern: -0.4
- Review/blog pattern: -0.5

ADD FOR:
- Known brand: +0.2
- Has price: +0.3
- Specific category: +0.2
- Complete metadata: +0.1
```

### Action Thresholds
```markdown
≥ 0.90: AUTO-ACCEPT
0.70-0.89: MANUAL REVIEW QUEUE
0.50-0.69: ATTEMPT AUTO-CORRECTION
< 0.50: AUTO-REJECT
```

### Auto-Correction Rules
```markdown
IF CONFIDENCE 0.50-0.69:
1. Try brand normalization
2. Fix spacing issues
3. Remove store suffixes
4. Extract from description
5. Re-calculate confidence
6. Accept if now ≥ 0.70
```

---

## Logging & Feedback Loop

### Required Log Fields
```markdown
EVERY DECISION MUST LOG:
- timestamp: ISO 8601 format
- action: "added" | "updated" | "rejected" | "corrected"
- spirit_key: Unique identifier
- old_value: Previous state (if update)
- new_value: New state
- confidence: 0.0-1.0
- reason: Specific rule triggered
- source_url: Where found
- validation_rules: Array of rules applied
```

### Summary Report Format
```markdown
=== SCRAPER RUN SUMMARY ===
Date: [ISO timestamp]
Duration: [minutes]

TOTALS:
- Scraped: [n] URLs
- Found: [n] potential spirits
- Added: [n] new spirits
- Updated: [n] existing spirits
- Rejected: [n] invalid entries
- Auto-corrected: [n] entries

TOP REJECTION REASONS:
1. [reason]: [count] ([percentage]%)
2. [reason]: [count] ([percentage]%)
...

TOP AUTO-CORRECTIONS:
1. [type]: [count] (e.g., "brand normalization": 45)
2. [type]: [count]
...

QUALITY METRICS:
- Average confidence: [0.xx]
- Price extraction rate: [xx]%
- Brand match rate: [xx]%

MANUAL REVIEW NEEDED: [n] entries
[List of spirit_keys with confidence 0.70-0.89]
```

### Feedback Integration
```markdown
WEEKLY ANALYSIS:
1. Group false positives by pattern
2. Group false negatives by pattern
3. Update rules based on frequency
4. Test on last 500 DB entries
5. Measure improvement metrics
```

---

## Training Data Validation

### Database Consistency Checks
```markdown
QUERY LAST 500 SPIRITS AND CHECK:
1. Name format consistency
2. Brand standardization
3. Price reasonableness
4. Category accuracy
5. Duplicate entries
```

### Pattern Learning
```markdown
FROM GOOD ENTRIES, EXTRACT:
- Common name structures
- Price ranges by category
- Brand-category associations
- Description patterns

FROM BAD ENTRIES, EXTRACT:
- Problematic URL sources
- Common false positives
- Validation rule gaps
```

### Continuous Improvement
```markdown
MONTHLY TASKS:
1. Analyze rejection logs
2. Update brand dictionary
3. Refine price patterns
4. Add new non-product patterns
5. Adjust confidence thresholds
6. Retrain on updated dataset
```

---

## Implementation Checklist

- [ ] Load latest 500 spirits from database
- [ ] Validate against current rules
- [ ] Flag mismatches and inconsistencies
- [ ] Generate correction candidates
- [ ] Apply auto-corrections where confident
- [ ] Log all changes with reasons
- [ ] Produce summary report
- [ ] Update rules based on findings
- [ ] Schedule next training cycle

---

import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

// Initialize Supabase client (replace with your credentials)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface Spirit {
  id: string;
  name: string;
  brand: string | null;
  type: string | null;
  price: number | null;
  abv: number | null;
  proof: number | null;
  description: string | null;
  data_quality_score: number;
  created_at: string;
  source_url: string | null;
}

interface ValidationResult {
  spiritId: string;
  name: string;
  confidence: number;
  issues: string[];
  corrections: Record<string, any>;
  action: 'accept' | 'review' | 'correct' | 'reject';
}

interface SummaryReport {
  timestamp: string;
  totalProcessed: number;
  accepted: number;
  reviewNeeded: number;
  corrected: number;
  rejected: number;
  topIssues: Record<string, number>;
  topCorrections: Record<string, number>;
  averageConfidence: number;
  priceExtractionRate: number;
  brandMatchRate: number;
}

class AIScraperTrainer {
  private knownBrands = new Set([
    'Buffalo Trace', 'Wild Turkey', 'Four Roses', 'Jack Daniel\'s',
    'Maker\'s Mark', 'Jim Beam', 'Russell\'s Reserve', 'Angel\'s Envy',
    'Michter\'s', 'W.L. Weller', 'E.H. Taylor', 'Heaven Hill',
    'Widow Jane', 'Old Forester', 'New Riff', 'Woodford Reserve',
    'Knob Creek', 'Basil Hayden\'s', 'Booker\'s', 'Baker\'s',
    'Eagle Rare', 'Blanton\'s', 'Colonel E.H. Taylor', 'Sazerac',
    'George T. Stagg', 'Thomas H. Handy', 'William Larue Weller',
    'Elijah Craig', 'Evan Williams', 'Henry McKenna', 'Very Old Barton',
    'Old Grand-Dad', 'Old Fitzgerald', 'Larceny', 'Bernheim',
    'Bulleit', 'High West', 'WhistlePig', 'Templeton', 'Rittenhouse',
    'Balcones', 'Garrison Brothers', 'Stranahan\'s', 'Westland',
    'Glenlivet', 'Glenfiddich', 'Macallan', 'Highland Park',
    'Ardbeg', 'Lagavulin', 'Laphroaig', 'Bowmore', 'Bruichladdich',
    'Grey Goose', 'Belvedere', 'Ketel One', 'Tito\'s', 'Absolut',
    'Tanqueray', 'Hendrick\'s', 'Bombay Sapphire', 'Beefeater',
    'Bacardi', 'Captain Morgan', 'Mount Gay', 'Appleton Estate',
    'Patron', 'Don Julio', 'Casamigos', 'Espolon', 'Herradura',
    'Hennessy', 'Remy Martin', 'Martell', 'Courvoisier'
  ]);

  private nonProductPatterns = [
    /cocktail\s+recipe/i, /how\s+to\s+make/i, /mixed\s+drink/i,
    /restaurant\s+menu/i, /bar\s+menu/i, /tap\s+list/i,
    /podcast/i, /episode/i, /blog/i, /article/i,
    /gift\s+guide/i, /father'?s?\s+day/i, /mother'?s?\s+day/i,
    /top\s+\d+/i, /best\s+of/i, /list\s+of/i,
    /event\s+space/i, /party/i, /competition/i, /awards/i,
    /school/i, /university/i, /academy/i, /education/i,
    /delivery\s+near\s+me/i, /open\s+now/i, /store\s+hours/i,
    /ship\s+as\s+a/i, /sku\s+\d+/i, /product\s+details/i
  ];

  private spiritTypes = new Set([
    'whiskey', 'whisky', 'bourbon', 'rye', 'scotch',
    'vodka', 'gin', 'rum', 'tequila', 'mezcal',
    'cognac', 'brandy', 'armagnac', 'calvados',
    'single malt', 'blended', 'grain', 'tennessee whiskey'
  ]);

  private brandVariations: Record<string, string[]> = {
    'Maker\'s Mark': ['Makers Mark', 'Maker\'s', 'Makers'],
    'Jack Daniel\'s': ['Jack Daniels', 'JD', 'Jack Daniel'],
    'W.L. Weller': ['WL Weller', 'William Larue Weller', 'Weller'],
    'Russell\'s Reserve': ['Russells Reserve', 'Russell\'s', 'Russells'],
    'Angel\'s Envy': ['Angels Envy', 'Angel\'s', 'Angels'],
    'Michter\'s': ['Michters', 'Michter'],
    'E.H. Taylor': ['EH Taylor', 'E.H.Taylor', 'Colonel E.H. Taylor']
  };

  async fetchLatestSpirits(limit: number = 500): Promise<Spirit[]> {
    const { data, error } = await supabase
      .from('spirits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching spirits:', error);
      return [];
    }

    return data || [];
  }

  calculateConfidence(spirit: Spirit): number {
    let confidence = 1.0;

    // Check for non-product patterns
    const nameToCheck = spirit.name.toLowerCase();
    for (const pattern of this.nonProductPatterns) {
      if (pattern.test(nameToCheck)) {
        confidence -= 0.5;
      }
    }

    // Check for spirit type
    const hasType = Array.from(this.spiritTypes).some(type => 
      nameToCheck.includes(type) || spirit.type?.toLowerCase().includes(type)
    );
    if (!hasType) confidence -= 0.3;

    // Check brand
    if (!spirit.brand || spirit.brand === 'Unknown' || spirit.brand.length < 3) {
      confidence -= 0.2;
    } else if (this.knownBrands.has(spirit.brand)) {
      confidence += 0.2;
    }

    // Check price
    if (spirit.price && spirit.price > 0 && spirit.price < 5000) {
      confidence += 0.3;
    } else {
      confidence -= 0.2;
    }

    // Name length check
    if (spirit.name.length < 10 || spirit.name.length > 150) {
      confidence -= 0.2;
    }

    // Bad patterns
    if (nameToCheck.startsWith('the ') || nameToCheck.startsWith('a ')) {
      confidence -= 0.2;
    }

    // Store suffix check
    if (/\s+(mission|wine|liquor|store)$/i.test(spirit.name)) {
      confidence -= 0.3;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  validateSpirit(spirit: Spirit): ValidationResult {
    const confidence = this.calculateConfidence(spirit);
    const issues: string[] = [];
    const corrections: Record<string, any> = {};

    // Name validation
    if (spirit.name.length < 10) {
      issues.push('Name too short');
    }
    if (spirit.name.length > 150) {
      issues.push('Name too long');
    }

    // Check for non-product patterns
    for (const pattern of this.nonProductPatterns) {
      if (pattern.test(spirit.name)) {
        issues.push(`Contains non-product pattern: ${pattern.source}`);
      }
    }

    // Brand validation and correction
    if (!spirit.brand || spirit.brand === 'Unknown') {
      const extractedBrand = this.extractBrand(spirit.name);
      if (extractedBrand) {
        corrections.brand = extractedBrand;
        issues.push(`Missing brand - extracted: ${extractedBrand}`);
      } else {
        issues.push('Missing or unknown brand');
      }
    }

    // Name cleaning suggestions
    const cleanedName = this.cleanName(spirit.name);
    if (cleanedName !== spirit.name) {
      corrections.name = cleanedName;
      issues.push('Name needs cleaning');
    }

    // Price validation
    if (!spirit.price || spirit.price <= 0) {
      issues.push('Missing price');
    } else if (spirit.price < 5) {
      corrections.price = spirit.price * 10;
      issues.push('Price suspiciously low - suggested correction');
    } else if (spirit.price > 5000) {
      corrections.price = spirit.price / 100;
      issues.push('Price suspiciously high - suggested correction');
    }

    // ABV/Proof consistency
    if (spirit.abv && !spirit.proof) {
      corrections.proof = Math.round(spirit.abv * 2);
      issues.push('Missing proof - calculated from ABV');
    }

    // Determine action
    let action: 'accept' | 'review' | 'correct' | 'reject';
    if (confidence >= 0.9 && issues.length === 0) {
      action = 'accept';
    } else if (confidence >= 0.7) {
      action = 'review';
    } else if (confidence >= 0.5 && Object.keys(corrections).length > 0) {
      action = 'correct';
    } else {
      action = 'reject';
    }

    return {
      spiritId: spirit.id,
      name: spirit.name,
      confidence,
      issues,
      corrections,
      action
    };
  }

  extractBrand(name: string): string | null {
    // Check known brands first
    for (const brand of this.knownBrands) {
      if (name.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }

    // Check brand variations
    for (const [canonical, variations] of Object.entries(this.brandVariations)) {
      for (const variation of variations) {
        if (name.toLowerCase().includes(variation.toLowerCase())) {
          return canonical;
        }
      }
    }

    // Extract from pattern "Brand Name Spirit Type"
    const match = name.match(/^([A-Z][A-Za-z'\s&.-]+?)(?:\s+(?:Bourbon|Whiskey|Vodka|Gin|Rum|Tequila|Cognac))/);
    if (match) {
      return match[1].trim();
    }

    return null;
  }

  cleanName(name: string): string {
    let cleaned = name;

    // Remove empty parentheses
    cleaned = cleaned.replace(/\(\s*\)/g, '');

    // Fix broken spacing
    cleaned = cleaned.replace(/\bBa\s+Lcones\b/gi, 'Balcones');
    cleaned = cleaned.replace(/\bBuffa\s+Lo\s+Trace\b/gi, 'Buffalo Trace');
    cleaned = cleaned.replace(/\bMaker\s+s\s+Mark\b/gi, 'Maker\'s Mark');

    // Remove store suffixes
    cleaned = cleaned.replace(/\s*[-|]\s*(Mission|Wine|Liquor|Store|Total Wine|BevMo).*$/i, '');

    // Fix HTML entities
    cleaned = cleaned.replace(/&amp;/g, '&');
    cleaned = cleaned.replace(/&quot;/g, '"');

    // Remove duplicate spirit types
    cleaned = cleaned.replace(/\b(Bourbon|Whiskey|Vodka|Gin|Rum)\s+\1\b/gi, '$1');

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  async logChange(change: any): Promise<void> {
    const { error } = await supabase
      .from('scraper_logs')
      .insert({
        timestamp: new Date().toISOString(),
        action: change.action,
        spirit_key: change.spiritId,
        old_value: change.oldValue,
        new_value: change.newValue,
        confidence: change.confidence,
        reason: change.reason,
        source_url: change.sourceUrl,
        validation_rules: change.validationRules
      });

    if (error) {
      console.error('Error logging change:', error);
    }
  }

  generateSummaryReport(results: ValidationResult[]): SummaryReport {
    const summary: SummaryReport = {
      timestamp: new Date().toISOString(),
      totalProcessed: results.length,
      accepted: results.filter(r => r.action === 'accept').length,
      reviewNeeded: results.filter(r => r.action === 'review').length,
      corrected: results.filter(r => r.action === 'correct').length,
      rejected: results.filter(r => r.action === 'reject').length,
      topIssues: {},
      topCorrections: {},
      averageConfidence: 0,
      priceExtractionRate: 0,
      brandMatchRate: 0
    };

    // Calculate average confidence
    const totalConfidence = results.reduce((sum, r) => sum + r.confidence, 0);
    summary.averageConfidence = totalConfidence / results.length;

    // Aggregate issues
    results.forEach(result => {
      result.issues.forEach(issue => {
        summary.topIssues[issue] = (summary.topIssues[issue] || 0) + 1;
      });
      Object.keys(result.corrections).forEach(correctionType => {
        summary.topCorrections[correctionType] = (summary.topCorrections[correctionType] || 0) + 1;
      });
    });

    return summary;
  }

  async runTraining(): Promise<void> {
    console.log('🚀 Starting AI Scraper Training...\n');

    // Fetch latest spirits
    const spirits = await this.fetchLatestSpirits(500);
    console.log(`📊 Fetched ${spirits.length} latest spirits from database\n`);

    // Validate each spirit
    const results: ValidationResult[] = [];
    for (const spirit of spirits) {
      const result = this.validateSpirit(spirit);
      results.push(result);

      // Log significant issues
      if (result.action === 'reject' || result.action === 'correct') {
        console.log(`❌ ${spirit.name}`);
        console.log(`   Confidence: ${result.confidence.toFixed(2)}`);
        console.log(`   Action: ${result.action}`);
        if (result.issues.length > 0) {
          console.log(`   Issues: ${result.issues.join(', ')}`);
        }
        if (Object.keys(result.corrections).length > 0) {
          console.log(`   Corrections: ${JSON.stringify(result.corrections)}`);
        }
        console.log('');
      }
    }

    // Generate summary report
    const summary = this.generateSummaryReport(results);

    // Display summary
    console.log('\n=== SCRAPER TRAINING SUMMARY ===');
    console.log(`Date: ${summary.timestamp}`);
    console.log(`\nTOTALS:`);
    console.log(`- Processed: ${summary.totalProcessed} spirits`);
    console.log(`- Accepted: ${summary.accepted} (${(summary.accepted / summary.totalProcessed * 100).toFixed(1)}%)`);
    console.log(`- Review needed: ${summary.reviewNeeded} (${(summary.reviewNeeded / summary.totalProcessed * 100).toFixed(1)}%)`);
    console.log(`- Auto-corrected: ${summary.corrected} (${(summary.corrected / summary.totalProcessed * 100).toFixed(1)}%)`);
    console.log(`- Rejected: ${summary.rejected} (${(summary.rejected / summary.totalProcessed * 100).toFixed(1)}%)`);

    console.log(`\nQUALITY METRICS:`);
    console.log(`- Average confidence: ${summary.averageConfidence.toFixed(3)}`);

    // Top issues
    console.log(`\nTOP ISSUES:`);
    const sortedIssues = Object.entries(summary.topIssues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    sortedIssues.forEach(([issue, count], index) => {
      console.log(`${index + 1}. ${issue}: ${count} (${(count / summary.totalProcessed * 100).toFixed(1)}%)`);
    });

    // Top corrections
    if (Object.keys(summary.topCorrections).length > 0) {
      console.log(`\nTOP AUTO-CORRECTIONS:`);
      const sortedCorrections = Object.entries(summary.topCorrections)
        .sort(([, a], [, b]) => b - a);
      sortedCorrections.forEach(([type, count], index) => {
        console.log(`${index + 1}. ${type}: ${count}`);
      });
    }

    // Manual review list
    const reviewNeeded = results.filter(r => r.action === 'review');
    if (reviewNeeded.length > 0) {
      console.log(`\nMANUAL REVIEW NEEDED: ${reviewNeeded.length} entries`);
      console.log('Sample entries needing review:');
      reviewNeeded.slice(0, 5).forEach(entry => {
        console.log(`- ${entry.name} (confidence: ${entry.confidence.toFixed(2)})`);
      });
    }

    // Save summary to database
    await this.saveSummaryToDatabase(summary);
  }

  async saveSummaryToDatabase(summary: SummaryReport): Promise<void> {
    const { error } = await supabase
      .from('scraper_training_summaries')
      .insert({
        timestamp: summary.timestamp,
        summary_data: summary
      });

    if (error) {
      console.error('Error saving summary:', error);
    } else {
      console.log('\n✅ Summary saved to database');
    }
  }
}

// Run the training
const trainer = new AIScraperTrainer();
trainer.runTraining().catch(console.error);

*Last Updated: 2025-06-26*
*Version: 3.0 (Post V2.9.1 ULTRATHINK)*