# Spirits Scraper Architecture & Flow Diagram

## Overview
This document provides a detailed visual and textual representation of how the spirits-scraper works during a scanning operation.

## High-Level Architecture Flow

```mermaid
graph TB
    subgraph "Entry Points"
        CLI[CLI Command]
        CRON[Cron Job]
    end

    subgraph "Core Orchestration"
        MAIN[Main Scraper]
        BATCH[Batch Processor]
        DISCO[Spirit Discovery Service]
    end

    subgraph "Query Generation"
        QGEN[Query Generator]
        EQGEN[Enhanced Query Generator]
    end

    subgraph "External APIs"
        GOOGLE[Google Search API]
        WEB[Web Pages]
    end

    subgraph "Data Processing"
        EXTRACT[Spirit Extractor]
        CONTENT[Content Parser]
        TEXT[Text Processor]
        VALID[Data Validator]
    end

    subgraph "Storage & Caching"
        CACHE[Cache Service]
        BACKUP[Backup Service]
        SUPABASE[(Supabase DB)]
    end

    subgraph "Quality Control"
        DEDUP[Deduplication Service]
        BRAND[Brand Normalization]
        FUZZY[Fuzzy Matching]
    end

    CLI --> MAIN
    CRON --> MAIN
    MAIN --> BATCH
    BATCH --> DISCO
    DISCO --> QGEN
    QGEN --> GOOGLE
    GOOGLE --> EXTRACT
    EXTRACT --> CONTENT
    CONTENT --> TEXT
    TEXT --> VALID
    VALID --> DEDUP
    DEDUP --> SUPABASE
    EXTRACT --> CACHE
    CACHE --> EXTRACT
    BATCH --> BACKUP
```

## Detailed Component Flow

### 1. Entry & Initialization

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant Main
    participant Cache
    participant Backup

    User->>CLI: npm run scrape --categories bourbon --limit 50
    CLI->>Main: Parse arguments
    Main->>Cache: Initialize cache service
    Main->>Backup: Create pre-scrape backup
    Main->>Main: Load configurations
```

### 2. Query Generation Phase

```mermaid
graph LR
    subgraph "Query Generation Pipeline"
        INPUT[Spirit Name/Category] --> ENHANCE[Enhanced Query Generator]
        
        ENHANCE --> TEMPLATES{Query Templates}
        TEMPLATES --> |Spirit Info| Q1["name brand bottle whiskey"]
        TEMPLATES --> |Retailer| Q2["site:totalwine.com name"]
        TEMPLATES --> |Reviews| Q3["name review tasting notes"]
        
        Q1 --> OPTIMIZE[Query Optimizer]
        Q2 --> OPTIMIZE
        Q3 --> OPTIMIZE
        
        OPTIMIZE --> EXCLUDE[Add Exclusions]
        EXCLUDE --> |"-site:reddit.com"| FINAL[Final Queries]
        EXCLUDE --> |"-merchandise -shirt"| FINAL
    end
```

### 3. Discovery & Search Phase

```mermaid
flowchart TD
    subgraph "Spirit Discovery Flow"
        START[Start Discovery] --> CHECK{Check Category}
        
        CHECK -->|Specific Spirit| DIRECT[Direct Search]
        CHECK -->|Category| DISCOVER[Autonomous Discovery]
        CHECK -->|Distillery| DISTILLERY[Distillery Mode]
        
        DISCOVER --> PATTERNS[Load Search Patterns]
        PATTERNS --> GENERATE[Generate Queries]
        
        DISTILLERY --> PRODUCTS[Get Product List]
        PRODUCTS --> GENERATE
        
        DIRECT --> GENERATE
        
        GENERATE --> SEARCH[Google Search API]
        SEARCH --> RESULTS[Search Results]
        
        RESULTS --> FILTER{Filter Results}
        FILTER -->|Reputable Domain| PROCESS[Process Result]
        FILTER -->|Excluded Domain| SKIP[Skip Result]
        FILTER -->|Non-Product| SKIP
        
        PROCESS --> EXTRACT[Extract Spirit Names]
    end
```

### 4. Data Extraction Pipeline

```mermaid
flowchart LR
    subgraph "Extraction Pipeline"
        RESULT[Search Result] --> PARSER[Content Parser]
        
        PARSER --> STRUCT{Structured Data?}
        STRUCT -->|Yes| JSON[Parse JSON-LD]
        STRUCT -->|No| HTML[Parse HTML]
        
        JSON --> EXTRACT[Spirit Extractor]
        HTML --> EXTRACT
        
        EXTRACT --> FIELDS[Extract Fields]
        FIELDS --> NAME[Name & Brand]
        FIELDS --> TYPE[Spirit Type]
        FIELDS --> ABV[ABV/Proof]
        FIELDS --> PRICE[Price]
        FIELDS --> DESC[Description]
        FIELDS --> AGE[Age Statement]
        
        NAME --> CLEAN[Text Processor]
        TYPE --> DETECT[Type Detection]
        DESC --> VALIDATE[Description Validator]
        
        CLEAN --> MERGE[Merge Data]
        DETECT --> MERGE
        VALIDATE --> MERGE
    end
```

### 5. Type Detection Logic

```mermaid
graph TD
    subgraph "Spirit Type Detection"
        INPUT[Product Info] --> BRAND{Check Brand}
        
        BRAND -->|Known Bourbon| BOURBON[Return 'Bourbon']
        BRAND -->|Known Rye| RYE[Return 'Rye Whiskey']
        BRAND -->|Known Scotch| SCOTCH[Return 'Scotch']
        
        BRAND -->|Unknown| NAME{Check Name}
        
        NAME -->|Contains 'bourbon'| BOURBON
        NAME -->|Contains 'rye whiskey'| RYE
        NAME -->|Contains 'single malt'| SCOTCH
        NAME -->|Contains 'tequila'| TEQUILA[Return 'Tequila']
        
        NAME -->|No Match| DESC{Check Description}
        DESC -->|Type Keywords| MATCHED[Return Matched Type]
        DESC -->|No Match| OTHER[Return 'Other']
    end
```

### 6. Data Validation & Cleaning

```mermaid
flowchart TD
    subgraph "Validation Pipeline"
        RAW[Raw Data] --> ALCOHOL{Is Alcoholic?}
        
        ALCOHOL -->|No| REJECT[Reject Entry]
        ALCOHOL -->|Yes| CLEAN[Clean Names]
        
        CLEAN --> NORMALIZE[Normalize Brand]
        NORMALIZE --> FIX[Fix Spacing]
        FIX --> REMOVE[Remove Artifacts]
        
        REMOVE --> VDESC{Valid Description?}
        VDESC -->|Review/Date| NULLDESC[Set Null]
        VDESC -->|Product Info| KEEPDESC[Keep Description]
        
        NULLDESC --> ENRICH[Enrich Data]
        KEEPDESC --> ENRICH
        
        ENRICH --> DIST[Add Distillery]
        DIST --> COUNTRY[Add Origin Country]
        COUNTRY --> SCORE[Calculate Quality Score]
    end
```

### 7. Deduplication Process

```mermaid
flowchart LR
    subgraph "Deduplication Flow"
        NEW[New Spirit] --> FUZZY[Fuzzy Matching]
        
        FUZZY --> EXISTING[(Existing Spirits)]
        
        EXISTING --> COMPARE{Similarity Score}
        
        COMPARE -->|>85% Same Brand| DUP[Mark as Duplicate]
        COMPARE -->|>70% Different Brand| CHECK[Manual Check]
        COMPARE -->|<70%| UNIQUE[Mark as Unique]
        
        DUP --> MERGE[Merge Records]
        MERGE --> BEST[Keep Best Data]
        
        UNIQUE --> SAVE[Save to DB]
        BEST --> SAVE
    end
```

### 8. Quality Scoring

```mermaid
graph TD
    subgraph "Quality Score Calculation"
        SPIRIT[Spirit Data] --> REQUIRED{Required Fields}
        
        REQUIRED -->|Name| P20[+20 points]
        REQUIRED -->|Type| P20_2[+20 points]
        REQUIRED -->|Brand| P20_3[+20 points]
        REQUIRED -->|Description| P20_4[+20 points]
        
        SPIRIT --> OPTIONAL{Optional Fields}
        
        OPTIONAL -->|ABV| P10[+10 points]
        OPTIONAL -->|Price| P10_2[+10 points]
        OPTIONAL -->|Age| P10_3[+10 points]
        OPTIONAL -->|Image| P10_4[+10 points]
        
        SPIRIT --> BONUS{Bonus Points}
        BONUS -->|No Mismatch| P10_5[+10 points]
        
        P20 --> SUM[Sum Points]
        P20_2 --> SUM
        P20_3 --> SUM
        P20_4 --> SUM
        P10 --> SUM
        P10_2 --> SUM
        P10_3 --> SUM
        P10_4 --> SUM
        P10_5 --> SUM
        
        SUM --> SCORE[Final Score /100]
    end
```

## Component Descriptions

### Core Services

1. **CLI (cli.ts)**
   - Parses command line arguments
   - Validates options
   - Initializes main scraper

2. **Main Scraper (index.ts)**
   - Orchestrates the entire process
   - Manages configuration
   - Handles errors and retries

3. **Batch Processor (batch-processor.ts)**
   - Manages concurrent operations
   - Rate limiting (100 queries/day)
   - Progress tracking
   - Real-time quality metrics

4. **Spirit Discovery Service (spirit-discovery.ts)**
   - Discovers actual spirit names from searches
   - Filters non-spirit results
   - Validates spirit names
   - Extracts from multiple sources

### Query Generation

5. **Query Generator (query-generator.ts)**
   - Generates targeted search queries
   - Adds site-specific operators
   - Excludes social media domains

6. **Enhanced Query Generator (enhanced-query-generator.ts)**
   - Adds merchandise exclusions
   - Optimizes for better results
   - Category-specific queries

### Data Processing

7. **Spirit Extractor (spirit-extractor.ts)**
   - Main extraction logic
   - Type detection
   - Field extraction
   - Quality scoring

8. **Content Parser (content-parser.ts)**
   - Parses HTML/JSON-LD
   - Extracts structured data
   - Price extraction
   - Review filtering

9. **Text Processor (text-processor.ts)**
   - Fixes spacing issues
   - Normalizes brands
   - Category detection
   - Age extraction

10. **Data Validator (data-validator.ts)**
    - Validates spirit data
    - Checks required fields
    - Description validation
    - Duplicate detection

### Quality Control

11. **Deduplication Service (deduplication-service.ts)**
    - Fuzzy name matching
    - Attribute-based comparison
    - Merge strategies
    - Threshold management

12. **Brand Normalization (brand-normalization.ts)**
    - Standardizes brand names
    - Fixes common variations
    - Maintains consistency

13. **Fuzzy Matching (fuzzy-matching.ts)**
    - String similarity algorithms
    - Weighted comparisons
    - Penalty calculations

### Storage & Caching

14. **Cache Service (cache-service.ts)**
    - Prevents duplicate API calls
    - 24-hour TTL
    - Auto-cleanup
    - JSON file storage

15. **Backup Service (backup-service.ts)**
    - Pre-scrape backups
    - Timestamped snapshots
    - Restore functionality
    - Data safety

16. **Supabase Storage (supabase-storage.ts)**
    - Database operations
    - Batch inserts/updates
    - Transaction management
    - Error handling

## Data Flow Example

Here's a complete example of scraping "Buffalo Trace Bourbon":

1. **User Input**: `npm run scrape --categories bourbon --limit 10`

2. **Query Generation**:
   ```
   - "Buffalo Trace Bourbon bottle whiskey"
   - "site:totalwine.com Buffalo Trace"
   - "Buffalo Trace bourbon -site:reddit.com -merchandise"
   ```

3. **Google Search**: Returns 10 results from various retailers

4. **Discovery Phase**:
   - Filters out reddit.com results
   - Finds "Buffalo Trace Kentucky Straight Bourbon Whiskey"
   - Extracts from totalwine.com product page

5. **Extraction**:
   - Name: "Buffalo Trace Kentucky Straight Bourbon Whiskey"
   - Brand: "Buffalo Trace"
   - Type: "Bourbon" (brand-based detection)
   - ABV: "45%"
   - Price: "$24.99"
   - Description: "This deep amber whiskey has a complex aroma..."

6. **Validation**:
   - ✓ Is alcoholic beverage
   - ✓ Valid product description
   - ✓ All required fields present

7. **Enrichment**:
   - Distillery: "Buffalo Trace Distillery"
   - Origin Country: "United States"
   - Quality Score: 95/100

8. **Deduplication**:
   - Checks against existing entries
   - No duplicates found
   - Saves to database

9. **Result**: High-quality spirit data ready for use!

## Error Handling & Recovery

```mermaid
graph TD
    subgraph "Error Recovery Flow"
        ERROR[Error Occurs] --> TYPE{Error Type}
        
        TYPE -->|Rate Limit| WAIT[Wait & Retry]
        TYPE -->|Network| RETRY[Immediate Retry]
        TYPE -->|Parse Error| SKIP[Skip & Log]
        TYPE -->|API Error| FALLBACK[Use Cache]
        
        WAIT --> RESUME[Resume Processing]
        RETRY --> RESUME
        SKIP --> NEXT[Next Item]
        FALLBACK --> CONTINUE[Continue with Cached]
    end
```

## Performance Optimizations

1. **Caching**: Prevents redundant API calls
2. **Batch Processing**: Concurrent operations with limits
3. **Smart Retries**: Exponential backoff for rate limits
4. **Selective Parsing**: Only parse promising results
5. **Early Filtering**: Skip non-products before processing

## Configuration Files

- **Domain Lists**: Reputable retailers, excluded domains
- **Brand Mappings**: Brand to distillery relationships
- **Query Templates**: Optimized search patterns
- **Type Patterns**: Spirit type detection rules
- **Text Fixes**: Common text normalization patterns

This architecture ensures high-quality data extraction while respecting API limits and maintaining data integrity throughout the scraping process.