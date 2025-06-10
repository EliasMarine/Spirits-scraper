# Spirits Scraper Flowchart

## Main Scraping Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SPIRITS SCRAPER FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  USER INPUT  │
│              │
│ npm run      │
│ scrape       │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│         CLI (cli.ts)             │
│ • Parse arguments                │
│ • Validate options               │
│ • --categories, --limit, etc.    │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│    INITIALIZE SCRAPER            │
│ • Load configurations            │
│ • Initialize cache service       │
│ • Create backup                  │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│    BATCH PROCESSOR               │
│ • Set concurrency limits         │
│ • Initialize rate limiter        │
│ • Track progress                 │
└──────────────┬───────────────────┘
               │
               ▼
        ┌──────┴──────┐
        │  SCRAPING   │
        │    MODE?    │
        └──────┬──────┘
               │
    ┌──────────┼──────────┬───────────────┐
    ▼          ▼          ▼               ▼
┌────────┐ ┌────────┐ ┌────────┐    ┌──────────┐
│CATEGORY│ │SPECIFIC│ │DISTILL-│    │DISCOVERY │
│ SEARCH │ │ SPIRIT │ │  ERY   │    │   MODE   │
└────┬───┘ └────┬───┘ └────┬───┘    └────┬─────┘
     │          │          │              │
     └──────────┴──────────┴──────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SPIRIT DISCOVERY SERVICE                      │
│                  (spirit-discovery.ts)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐  │
│  │Generate Query│ --> │ Call Google  │ --> │Get Search    │  │
│  │(query-gen.ts)│     │ Search API   │     │Results (10)  │  │
│  └──────────────┘     └──────────────┘     └──────┬───────┘  │
│                                                    │           │
│                                                    ▼           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  FILTER RESULTS                          │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ❌ Excluded Domains?                                   │  │
│  │     - reddit.com, facebook.com, etc.                    │  │
│  │                                                          │  │
│  │  ❌ Non-Product Patterns?                               │  │
│  │     - "distillery tour", "bourbon menu"                 │  │
│  │     - "whiskey trail", "gift shop"                      │  │
│  │     - Clothing/merchandise patterns                     │  │
│  │                                                          │  │
│  │  ✅ Reputable Domain?                                   │  │
│  │     - totalwine.com, thewhiskyexchange.com, etc.       │  │
│  │                                                          │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │            EXTRACT SPIRIT NAMES                          │  │
│  │  • From title                                           │  │
│  │  • From snippet                                         │  │
│  │  • From structured data                                 │  │
│  │  • Apply name cleaning                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SPIRIT EXTRACTOR                            │
│                    (spirit-extractor.ts)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                               │
│  │Check Cache  │ ──── Found? ──── Yes ──> Return Cached Data   │
│  └──────┬──────┘                                               │
│         │ No                                                    │
│         ▼                                                       │
│  ┌─────────────────────────────────────────┐                   │
│  │         CONTENT PARSER                   │                   │
│  │      (content-parser.ts)                 │                   │
│  ├─────────────────────────────────────────┤                   │
│  │ • Parse search result HTML/JSON          │                   │
│  │ • Extract structured data if available   │                   │
│  │ • Parse price, reviews, descriptions     │                   │
│  └──────────────┬──────────────────────────┘                   │
│                 │                                               │
│                 ▼                                               │
│  ┌─────────────────────────────────────────┐                   │
│  │      EXTRACT INDIVIDUAL FIELDS          │                   │
│  ├─────────────────────────────────────────┤                   │
│  │                                          │                   │
│  │  📝 Name & Brand                        │                   │
│  │     - Clean product name                │                   │
│  │     - Extract brand                     │                   │
│  │     - Fix spacing issues                │                   │
│  │                                          │                   │
│  │  🏷️ Spirit Type                         │                   │
│  │     - Check brand mapping               │                   │
│  │     - Detect from name                  │                   │
│  │     - Fallback to description          │                   │
│  │                                          │                   │
│  │  🥃 ABV/Proof                           │                   │
│  │     - Extract percentage                │                   │
│  │     - Convert proof to ABV             │                   │
│  │                                          │                   │
│  │  💰 Price                               │                   │
│  │     - Extract numeric value             │                   │
│  │     - Handle currency                   │                   │
│  │                                          │                   │
│  │  📖 Description                         │                   │
│  │     - Validate not a review             │                   │
│  │     - Remove date prefixes              │                   │
│  │                                          │                   │
│  │  🕰️ Age Statement                       │                   │
│  │     - Extract years                     │                   │
│  │     - Validate reasonable age           │                   │
│  │                                          │                   │
│  └──────────────┬──────────────────────────┘                   │
│                 │                                               │
└─────────────────┼───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TEXT PROCESSOR                              │
│                    (text-processor.ts)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  • Fix text spacing (WildTurkey → Wild Turkey)                 │
│  • Normalize brand names                                       │
│  • Fix camelCase issues                                        │
│  • Remove website artifacts (-musthave, -bhg)                  │
│  • Fix garbled text (Wi Ld Turkey → Wild Turkey)              │
│                                                                 │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA VALIDATOR                              │
│                    (data-validator.ts)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────┐                                    │
│  │ Is Alcoholic Beverage? │                                    │
│  └───────────┬────────────┘                                    │
│              │                                                  │
│         No ──┴── Yes                                           │
│         │         │                                             │
│      REJECT    CONTINUE                                        │
│                   │                                             │
│              ▼                                                  │
│  ┌────────────────────────┐                                    │
│  │  Validate All Fields   │                                    │
│  │  • Required fields?    │                                    │
│  │  • Valid description?  │                                    │
│  │  • Reasonable values?  │                                    │
│  └───────────┬────────────┘                                    │
│              │                                                  │
└──────────────┼──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ENRICHMENT                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🏭 Add Distillery                                             │
│     - Look up brand → distillery mapping                       │
│     - Infer from product name                                  │
│     - Format with proper suffix                                │
│                                                                 │
│  🌍 Add Origin Country                                         │
│     - Bourbon/Rye → United States                             │
│     - Scotch → Scotland                                        │
│     - Irish → Ireland                                          │
│                                                                 │
│  📊 Calculate Quality Score                                    │
│     - Required fields: 20 points each                         │
│     - Optional fields: 10 points each                         │
│     - Valid description: +10 bonus                            │
│                                                                 │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DEDUPLICATION SERVICE                           │
│                (deduplication-service.ts)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐        ┌──────────────────┐             │
│  │  Load Existing   │        │   Fuzzy Match    │             │
│  │  Spirits from DB │ -----> │  Against Each    │             │
│  └──────────────────┘        └────────┬─────────┘             │
│                                       │                         │
│                              ┌────────┴────────┐                │
│                              │ Similarity > 85%│                │
│                              │  (Same Brand)?  │                │
│                              └────────┬────────┘                │
│                                       │                         │
│                          Yes ─────────┴───────── No             │
│                           │                       │             │
│                           ▼                       ▼             │
│                    ┌─────────────┐        ┌─────────────┐      │
│                    │   DUPLICATE │        │   UNIQUE    │      │
│                    │ Merge Data  │        │ New Entry   │      │
│                    └─────────────┘        └─────────────┘      │
│                                                                 │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SAVE TO DATABASE                              │
│                  (supabase-storage.ts)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  • Batch insert/update operations                              │
│  • Update cache with new data                                  │
│  • Log success/failure                                         │
│  • Update statistics                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                  │
                  ▼
           ┌──────────────┐
           │   COMPLETE   │
           │              │
           │  Summary:    │
           │  • Found: X  │
           │  • Saved: Y  │
           │  • Dupes: Z  │
           └──────────────┘
```

## Key Decision Points

### 1. Domain Filtering
```
                Is Domain Excluded?
                       │
         Yes ─────────┼───────── No
          │            │          │
      Skip Result      ▼          │
                 Is Reputable?    │
                       │          │
         No ──────────┼────── Yes │
          │            │          │
     Low Priority   High Priority │
```

### 2. Product Validation
```
                Is Product Name Valid?
                         │
            Yes ─────────┼───────── No
             │           │          │
             ▼           │      Skip/Reject
        Contains Tour/   │
        Menu Keywords?   │
             │           │
        Yes ─┼─ No      │
         │   │   │      │
     Reject  │   ▼      │
             │  Continue │
```

### 3. Type Detection Priority
```
    ┌─────────────────┐
    │ Check Brand Map │ (Highest Priority)
    └────────┬────────┘
             │ Not Found
             ▼
    ┌─────────────────┐
    │ Check Name Text │ (Medium Priority)
    └────────┬────────┘
             │ Not Found
             ▼
    ┌─────────────────┐
    │Check Description│ (Lower Priority)
    └────────┬────────┘
             │ Not Found
             ▼
    ┌─────────────────┐
    │ Default: Other  │ (Fallback)
    └─────────────────┘
```

## Error Handling Flow

```
         ┌──────────────┐
         │    ERROR     │
         └──────┬───────┘
                │
      ┌─────────┴─────────┐
      │    Error Type?    │
      └─────────┬─────────┘
                │
    ┌───────────┼───────────┬──────────────┐
    ▼           ▼           ▼              ▼
┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐
│  RATE  │ │NETWORK │ │ PARSE   │ │   API    │
│ LIMIT  │ │ ERROR  │ │ ERROR   │ │  ERROR   │
└────┬───┘ └───┬────┘ └────┬────┘ └────┬─────┘
     │         │           │            │
     ▼         ▼           ▼            ▼
 Wait 60s   Retry 3x   Skip Item   Use Cache
     │         │           │            │
     └─────────┴───────────┴────────────┘
                    │
                    ▼
              Continue Flow
```

## Data Quality Gates

Each spirit must pass through these quality gates:

```
Gate 1: Domain Check     ✓ Must be from allowed domain
                        ↓
Gate 2: Product Check   ✓ Must be alcoholic beverage
                        ↓
Gate 3: Name Valid      ✓ Must have valid spirit name
                        ↓
Gate 4: Type Detection  ✓ Must have valid spirit type
                        ↓
Gate 5: Field Complete  ✓ Must have required fields
                        ↓
Gate 6: Description OK  ✓ Must not be review/garbage
                        ↓
Gate 7: No Duplicates   ✓ Must be unique or mergeable
                        ↓
        ACCEPTED FOR DATABASE
```

## Performance Optimizations

1. **Caching Layer**
   - Check cache before API calls
   - 24-hour TTL
   - Reduces API usage by ~70%

2. **Batch Processing**
   - Process 5-10 items concurrently
   - Rate limit: 100 queries/day
   - Automatic throttling

3. **Early Filtering**
   - Skip bad domains immediately
   - Filter non-products before processing
   - Validate names before extraction

4. **Smart Retries**
   - Exponential backoff for rate limits
   - Max 3 retries for network errors
   - Skip permanently failed items

This flowchart shows the complete journey of data through the spirits scraper, from user input to database storage, with all decision points, validations, and quality checks clearly illustrated.