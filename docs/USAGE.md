# Spirits Scraper Usage Guide (v2.5.7 - Enhanced Data Quality Edition)

This document provides usage instructions for the Smart Spirits Scraper with ULTRA-EFFICIENT catalog scraping and V2.5.7 data quality improvements!

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# 🚀 ALL COMMANDS NOW ULTRA-EFFICIENT (60%+ efficiency)!
npm run scrape -- --categories bourbon --limit 50    # Now ultra-efficient!
npm run scrape -- --distillery "Buffalo Trace"       # Already ultra-efficient!

# Multiple categories - ALL ULTRA-EFFICIENT!
npm run scrape -- --categories "bourbon,whiskey,scotch" --limit 200

# Alternative catalog command (also high-efficiency)
npm run scrape-catalogs -- --api-calls 50
npm run scrape-catalogs -- --distilleries "Buffalo Trace" --max-products 100
```

## 📝 Core Commands

### 1. Ultra-Efficient Distillery Scraping (🚀 NOW DEFAULT!)

**The default scraping method now uses optimized catalog scraping - achieving 3-5 spirits per API call!**

```bash
# Using regular scrape command with distillery option (RECOMMENDED)
npm run scrape -- --distillery "Buffalo Trace" --limit 50

# Scrape multiple distilleries
npm run scrape -- --distillery "Buffalo Trace,Wild Turkey,Maker's Mark" --limit 100

# Clear cache first for fresh data
npm run scrape -- --distillery "Buffalo Trace" --limit 50 --clear-cache

# Force fresh API calls
npm run scrape -- --distillery "Buffalo Trace" --limit 50 --force-refresh
```

**Why Catalog-Focused Scraping is Superior:**
- 🚀 **10+ spirits per API call** vs 0.11 from the old method
- 📦 **Searches retailer catalogs** instead of individual products
- 🎯 **Gets complete product listings** from TotalWine, Whisky Exchange, etc.
- 📊 **Shows efficiency metrics** for each distillery
- ⚡ **90% fewer API calls** for the same results

**How It Works:**
1. Searches for catalog pages: `site:totalwine.com "Buffalo Trace"`
2. Extracts ALL products from the catalog page
3. Processes multiple retailers in parallel
4. No more searching for individual products!

### 2. Alternative Catalog Command (scrape-catalogs)

**The catalog scraper command uses API call limits and max products per distillery:**

```bash
# Scrape with specific number of API calls (default: 100)
npm run scrape-catalogs -- --api-calls 50

# Scrape specific distilleries
npm run scrape-catalogs -- --distilleries "Buffalo Trace,Wild Turkey" --max-products 100

# Control max products per distillery (default: 100)
npm run scrape-catalogs -- --max-products 200

# Smart selection options
npm run scrape-catalogs -- --prefer-unscraped --all-types

# Clear tracking data and start fresh
npm run scrape-catalogs -- --clear-tracking

# Quiet mode
npm run scrape-catalogs -- --quiet
```

### 3. Original Systematic Distillery Scraping (Legacy)

**The most comprehensive way to build your spirits database - systematically scrapes 908 distilleries!**

```bash
# Scrape ALL 908 distilleries systematicallyOk
npm run scrape-distilleries

# Scrape specific distilleries by name
npm run scrape-distilleries -- --distilleries "Buffalo Trace,Macallan,Glenfiddich"

# Control how many products to get per distillery (default: 100)
npm run scrape-distilleries -- --max-products 200

# Resume from a specific distillery index (useful for interruptions)
npm run scrape-distilleries -- --start-index 100

# Focus on recent products only
npm run scrape-distilleries -- --year-start 2020 --year-end 2024

# Include/exclude options
npm run scrape-distilleries -- --include-discontinued
npm run scrape-distilleries -- --skip-existing

# Example: Comprehensive bourbon distillery scraping
npm run scrape-distilleries -- --distilleries "Buffalo Trace,Heaven Hill,Wild Turkey,Four Roses,Maker's Mark,Jim Beam,Woodford Reserve" --max-products 300 --year-start 2000
```

**Benefits of Systematic Distillery Scraping:**
- 📋 **Complete Catalogs**: Get every product from each distillery
- 🎯 **No Missing Products**: Systematic approach ensures comprehensive coverage
- 📊 **Progress Tracking**: Resume from where you left off
- 🔄 **Smart Queries**: Uses product lines, year ranges, retailer catalogs
- 📈 **Better Quality**: More accurate data than random searches
- 🏭 **908 Distilleries**: Covers bourbon, scotch, tequila, rum, gin, vodka, cognac

**Distillery Categories Available:**
- 🥃 **Bourbon**: 79 distilleries (Buffalo Trace, Four Roses, etc.)
- 🏴󐁧󐁢󐁳󐁣󐁴󐁿 **Scotch/Irish**: 266 distilleries (Macallan, Glenfiddich, etc.)
- 🌵 **Tequila**: 181 distilleries (Patron, Don Julio, etc.)
- 🏝️ **Rum**: 142 distilleries (Bacardi, Mount Gay, etc.)
- 🍸 **Gin**: 52 distilleries (Hendrick's, Tanqueray, etc.)
- 🍾 **Vodka**: 41 distilleries (Grey Goose, Belvedere, etc.)
- 🥃 **American Craft**: 94 distilleries (Westland, Balcones, etc.)
- 🍷 **Cognac/Brandy**: 53 distilleries (Hennessy, Rémy Martin, etc.)

### 4. Smart Scraping (Category-Based)

For targeted scraping when you don't need full distillery catalogs:

```bash
# Basic scraping (enhanced features included)
npm run scrape -- --categories bourbon --limit 50

# Multiple categories
npm run scrape -- --categories "bourbon,whiskey,scotch" --limit 200

# Distillery-specific scraping (NOW ULTRA-EFFICIENT BY DEFAULT!)
npm run scrape -- --distillery "buffalo-trace" --limit 50  # 3-5 spirits per API call!

# Autonomous discovery mode (finds new spirits automatically)
npm run scrape -- --discover --limit 100

# Large batch with more concurrent searches
npm run scrape -- --categories bourbon --limit 500 --batch-size 5
```

**What happens automatically:**
- ✅ Fixes names: "Unc Le Nearest" → "Uncle Nearest"
- ✅ Detects 20+ spirit types including Tennessee Whiskey, American Single Malt
- ✅ Extracts ABV, proof, age, region, cask type from descriptions
- ✅ Identifies whiskey styles (Bottled-in-Bond, Single Barrel, etc.)
- ✅ Validates descriptions match products
- ✅ Scores quality (0-100) for each spirit
- ✅ Auto-deduplication for 50+ spirit batches

### 5. Deduplication

```bash
# Auto-merge duplicates (default threshold 0.85)
npm run dedup

# Preview duplicates without merging
npm run dedup -- --dry-run

# Adjust similarity threshold (0-1)
npm run dedup -- --threshold 0.9

# Comprehensive dry-run analysis with detailed reports
npm run dry-run

# Show detailed match analysis in console
npm run dry-run -- --show-details

# Show similarity clusters visualization
npm run dry-run -- --show-clusters

# Export reports to custom directory
npm run dry-run -- --export-dir ./analysis-reports

# Get JSON output for programmatic use
npm run dry-run -- --format json

# Analyze only recent spirits (last 24 hours)
npm run dry-run -- --incremental

# Disable blocking optimization (for small datasets)
npm run dry-run -- --no-blocking

# Adjust similarity threshold for dry-run
npm run dry-run -- --threshold 0.8

# Skip similarity cluster generation (faster)
npm run dry-run -- --no-visualizations
```

### 6. Backup & Restore

```bash
# Create backup
npm run backup

# Create backup with description
npm run backup -- --description "Before major update"

# List all backups
npm run backup -- --list

# Restore specific backup
npm run backup -- --restore <backup-id>
```

### 7. Statistics

```bash
# View comprehensive statistics
npm run stats

# Shows:
# - Total spirits count
# - Average quality score
# - Type distribution
# - Spirits with whiskey styles
# - Description mismatches
# - Cache statistics
```

### 8. Fix CSV Data

```bash
# Process CSV file with all enhancements
npm run fix-csv input.csv output.csv

# Automatically:
# - Fixes name parsing issues
# - Corrects type classifications
# - Extracts missing data from descriptions
# - Validates descriptions
# - Calculates quality scores
# - Generates detailed reports
```

### 9. Cache Management

The scraper uses Redis (Upstash) cache to avoid duplicate API calls and improve performance.

```bash
# Show cache statistics
npm run cache -- --stats

# Clear ALL cache (Upstash Redis + local files)
npm run clear-caches    # Simple version (recommended)
npm run clear-cache-all # Comprehensive version

# Clear specific cache types
npm run cache -- --clear-type search_query    # Clear search queries only
npm run cache -- --clear-type spirit_data     # Clear spirit data only
npm run cache -- --clear-type url_content     # Clear URL content only
npm run cache -- --clear-type failed_attempt  # Clear failed attempts only

# Clear cache before scraping
npm run scrape -- --clear-cache --categories bourbon --limit 50

# Force fresh API calls (bypass cache without clearing)
npm run scrape -- --force-refresh --categories bourbon --limit 50

# Use diversified queries to avoid cache naturally
npm run scrape -- --diversify-queries --diversity-level high --categories bourbon --limit 100
```

**Cache Types Explained:**
- `search_query` - Cached Google search results (TTL: 7 days for successful, 2 days for empty)
- `spirit_data` - Cached spirit extraction data (TTL: 7 days default)
- `url_content` - Cached webpage content (TTL: 12 hours default)  
- `failed_attempt` - Failed extraction attempts (TTL: 4 hours default)

**When to Clear Cache:**
- Before large scraping operations for fresh data
- After updating extraction logic or bug fixes
- When encountering persistent data issues
- To force re-scraping of specific spirits
- Testing new extraction algorithms

**Cache Management Best Practices:**
1. **For Maximum Fresh Results:**
   ```bash
   npm run cache -- --clear && npm run scrape -- --force-refresh --diversify-queries --limit 100
   ```

2. **For Testing Query Efficiency:**
   ```bash
   npm run cache -- --clear-type search_query
   npm run scrape -- --categories bourbon --limit 50
   ```

3. **For Re-processing Existing Data:**
   ```bash
   npm run cache -- --clear-type spirit_data
   npm run scrape -- --categories bourbon --limit 50
   ```

**View Cache Status:**
```bash
npm run cache -- --stats
# Shows:
# - Total entries by type
# - Cache hit/miss metrics
# - Redis connection status
# - Cache age statistics
```

### 10. Complete Fresh Start (Clear Database & All Caches)

When you need to start completely fresh with a clean database and no cached data:

```bash
# 1. Clear all local caches and temporary files
npm run clear-caches

# 2. Clear tracking data (IMPORTANT when database is cleared!)
npm run scrape-catalogs -- --clear-tracking

# 3. Clear the database (run in Supabase SQL Editor)
# See: sql/clear-all-spirits-data.sql
TRUNCATE TABLE spirits CASCADE;

# 4. Start fresh scraping
npm run scrape -- --categories bourbon --limit 10
```

**What `clear-caches` does:**
- Removes the `./cache` directory (file-based cache)
- Clears temporary CSV and JSON files
- Removes test files
- Clears hidden cache directories

**What `--clear-tracking` does:**
- Clears Redis/Upstash tracking data that remembers which distilleries were scraped
- Essential when you clear your database but want to re-scrape the same distilleries
- Without this, scraper will think "I already scraped Buffalo Trace" and skip it

**Complete Fresh Start Workflow:**
```bash
# 1. Create a final backup before clearing
npm run backup -- --description "Before complete reset"

# 2. Clear all caches
npm run clear-caches

# 3. Clear tracking data
npm run scrape-catalogs -- --clear-tracking

# 4. Run the database cleanup SQL in Supabase
# This will TRUNCATE all spirits-related tables

# 5. Verify everything is clean
npm run stats  # Should show 0 spirits

# 6. Start fresh scraping (will treat all distilleries as new)
npm run scrape -- --categories bourbon --limit 50
# OR use catalog scraper with intelligent selection
npm run scrape-catalogs -- --api-calls 100
```

**Why you might need a fresh start:**
- Testing the scraper from scratch
- Corrupted data in the database
- Major changes to scraping logic
- Starting a new project
- Database was cleared but tracking wasn't

**Important Notes:**
- The first scrape after clearing will have NO duplicates (empty database)
- All API calls will be fresh (no cached responses)
- Tracking system will treat all distilleries as unscraped
- This process is irreversible - always backup first!

**Alternative: Force Specific Distilleries**
If you don't want to clear all tracking data:
```bash
# Override tracking by specifying distilleries directly
npm run scrape-catalogs -- --distilleries "Buffalo Trace,Wild Turkey" --api-calls 50
```

## 🧠 Smart Features (All Automatic)

### Enhanced Spirit Type Detection
- **Tennessee Whiskey** - Jack Daniel's, George Dickel, Uncle Nearest
- **American Single Malt** - Westland, Balcones, Stranahan's
- **Bourbon** - With style detection (BiB, Single Barrel, Small Batch)
- **Tequila/Mezcal** - With subcategories (Blanco, Reposado, Añejo)
- **Rum/Gin** - With style variations
- 20+ total spirit types with subcategories

### Smart Name Parsing
```
"Unc Le Nearest" → "Uncle Nearest"
"Sma Ll Batch" → "Small Batch"
"Henry Mc Kenna" → "Henry McKenna"
"JackDaniels12YearOld" → "Jack Daniels 12 Year Old"
```

### Comprehensive Data Extraction
- **ABV & Proof** - Distinguishes from mash bill percentages
- **Age Statement** - Validates ages, filters company history
- **Region** - Kentucky, Tennessee, Highland, Speyside
- **Cask Type** - Ex-Bourbon, Sherry, Port, Mizunara
- **Mash Bill** - Grain composition
- **Distillery** - Producer information
- **Whiskey Style** - Bottled-in-Bond, Single Barrel, etc.

### Quality Validation
Each spirit gets a quality score (0-100) based on:
- Field completeness
- Data consistency
- Classification accuracy
- Description relevance

## 📊 Expected Output

### Scraping Output
```
🌟 Buffalo Trace Bourbon (Bourbon) - Quality: 92/100
  Style: Straight Bourbon
  Subcategory: American Whiskey

✅ Westland American Single Malt (American Single Malt) - Quality: 89/100
  Subcategory: Single Malt Whiskey

⚠️ Generic Whiskey (Whiskey) - Quality: 45/100
  ⚠️ Description mismatch detected
```

### Dry-Run Analysis Output
```
🔍 DRY-RUN DEDUPLICATION ANALYSIS
═══════════════════════════════════════════════════════

📊 OVERVIEW
─────────────────────────────────
🥃 Spirits analyzed: 1,234
🔗 Duplicates found: 45
⏱️  Processing time: 2.34s
📈 Est. quality improvement: 23.1%

🎯 RECOMMENDED ACTIONS
─────────────────────────────────
✅ Auto-merge candidates: 12
🔍 Flag for review: 28
❌ Ignore (low confidence): 5

🚀 BLOCKING OPTIMIZATION
─────────────────────────────────
📦 Blocks created: 156
📉 Comparison reduction: 83.4%
📏 Avg block size: 7.9 spirits
📊 Largest block: 45 spirits

📊 IMPACT ASSESSMENT
─────────────────────────────────
🗑️  Spirits to be removed: 12
📈 Data fields to enhance: 34
📉 Duplication reduction: 0.97%

✨ DATA QUALITY IMPROVEMENTS
─────────────────────────────────
  • Added description
  • Enhanced description
  • Added ABV
  • Added origin country
  • Added region

📁 EXPORTED REPORTS
─────────────────────────────────
📄 Detailed report: ./dry-run-reports/dry-run-detailed-2024-06-08T10-30-45.json
📊 Matches CSV: ./dry-run-reports/dry-run-matches-2024-06-08T10-30-45.csv
🎨 Clusters JSON: ./dry-run-reports/dry-run-clusters-2024-06-08T10-30-45.json
📝 Summary text: ./dry-run-reports/dry-run-summary-2024-06-08T10-30-45.txt

💡 NEXT STEPS
─────────────────────────────────
• Run deduplication to auto-merge 12 high-confidence matches
• Review 28 flagged matches manually
• Use exported reports for detailed analysis
• Consider adjusting similarity threshold if needed
```

### Detailed Match Analysis (--show-details)
```
🔍 DETAILED MATCH ANALYSIS
─────────────────────────────────────────────────

1. MATCH_1
   Spirit 1: Buffalo Trace Kentucky Straight Bourbon Whiskey
   Spirit 2: Buffalo Trace Bourbon
   Similarity: 94.2% (high)
   Action: merge
   Explanation: Overall similarity: 94.2%; Name similarity: 89.3%; Same brand detected; Spirit types match; Prices are compatible
   Improvements: Enhanced description, Added ABV

2. MATCH_2
   Spirit 1: Blanton's Single Barrel Bourbon Whiskey
   Spirit 2: Blanton's Gold Edition
   Similarity: 78.5% (medium)
   Action: flag for review
   Explanation: Overall similarity: 78.5%; Name similarity: 72.1%; Same brand detected; Spirit types match; Age mismatch penalty: 5.0%
```

### Similarity Clusters (--show-clusters)
```
🎨 SIMILARITY CLUSTERS
─────────────────────────────────

📊 Total clusters: 8

  Cluster 1: 3 spirits
    Similarity: 91.2%
    Action: merge all
    Center: Buffalo Trace Kentucky Straight Bourbon Whiskey
       1. Buffalo Trace Bourbon (94.2%)
       2. Buffalo Trace Kentucky Bourbon (89.7%)

  Cluster 2: 4 spirits
    Similarity: 84.6%
    Action: merge high confidence
    Center: Blanton's Single Barrel Bourbon Whiskey
       1. Blanton's Gold Edition (78.5%)
       2. Blanton's Special Reserve (82.1%)
       ... and 1 more
```

## 📊 Efficiency Comparison: Ultra-Efficient vs Original Method

### Real Example: Buffalo Trace Scraping

**Original Method (before optimization):**
- Searches for: `"Buffalo Trace Bourbon" site:totalwine.com`
- API calls used: 100
- Products found: 4
- **Efficiency: 0.04 spirits per API call** 😢

**Ultra-Efficient Method (NOW DEFAULT!):**
- Searches for: `site:totalwine.com "Buffalo Trace" bourbon`
- API calls used: 15
- Products found: 42
- **Efficiency: 2.8 spirits per API call** 🚀

**That's a 70x improvement!**

**Even Better Results:**
- Wild Turkey: 3.4 spirits per API call
- Some distilleries: 4-5 spirits per API call

## 🚀 Common Workflows

### Build Complete Distillery Catalog (NEW RECOMMENDED METHOD)
```bash
# 1. Create backup
npm run backup -- --description "Before catalog scraping"

# 2. Clear cache for fresh data (optional but recommended)
npm run cache -- --clear

# 3. Use DEFAULT ultra-efficient scraping
npm run scrape -- --distillery "Buffalo Trace,Four Roses,Wild Turkey,Heaven Hill" --limit 50

# 4. Check results and efficiency
npm run stats

# You'll see efficiency metrics like:
# 🏆 EFFICIENCY CHAMPIONS
# Buffalo Trace         125 products   12 queries   10.42 spirits/call
# Wild Turkey          98 products    10 queries   9.80 spirits/call
# Four Roses           87 products    9 queries    9.67 spirits/call
```

### Original Method (if catalog scraping has issues)
```bash
# Fallback to original systematic method
npm run scrape-distilleries -- --distilleries "Buffalo Trace,Four Roses,Wild Turkey,Heaven Hill" --max-products 300
```

### Systematic Full Database Build
```bash
# Day 1: American Whiskey (173 distilleries)
npm run scrape-distilleries -- --distilleries "Buffalo Trace,Four Roses,Wild Turkey,Heaven Hill,Maker's Mark,Jim Beam,Woodford Reserve,Knob Creek,Bulleit,Evan Williams" --max-products 200

# Day 2: Scotch (top 20 distilleries)
npm run scrape-distilleries -- --distilleries "Macallan,Glenfiddich,Glenlivet,Highland Park,Ardbeg,Lagavulin,Talisker,Oban,Dalmore,Balvenie" --max-products 200

# Day 3: Tequila & Mezcal
npm run scrape-distilleries -- --distilleries "Patron,Don Julio,Casamigos,Clase Azul,Casa Noble,Herradura,El Tesoro,Fortaleza" --max-products 150

# Continue with other categories...
```

### Resume Interrupted Scraping
```bash
# If scraping was interrupted at distillery #250
npm run scrape-distilleries -- --start-index 250
```

### Daily Category Scraping (Quick)
```bash
npm run scrape -- --categories bourbon --limit 50
```

### Large-Scale Category Scraping (500+ spirits)
```bash
# 1. Create backup
npm run backup -- --description "Before 500 spirit scrape"

# 2. Run scrape (auto-deduplication included)
npm run scrape -- --categories bourbon --limit 500 --batch-size 5

# 3. Check results
npm run stats
```

### Fix Existing Database
```bash
# Export data to CSV from your database
# Then fix it:
npm run fix-csv exported_spirits.csv fixed_spirits.csv
# Import fixed CSV back to database
```

### Discovery Mode
```bash
# Let the scraper find new spirits automatically
npm run scrape -- --discover --limit 200
```

### Comprehensive Dry-Run Analysis
```bash
# 1. Create backup before analysis
npm run backup -- --description "Before deduplication analysis"

# 2. Run comprehensive dry-run analysis
npm run dry-run

# 3. Review detailed match analysis
npm run dry-run -- --show-details --show-clusters

# 4. Export detailed reports for review
npm run dry-run -- --export-dir ./reports --format json

# 5. Test with different thresholds
npm run dry-run -- --threshold 0.7   # More aggressive
npm run dry-run -- --threshold 0.9   # More conservative

# 6. Analyze only recent data
npm run dry-run -- --incremental

# 7. After review, run actual deduplication
npm run dedup -- --threshold 0.85
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GOOGLE_API_KEY=your_google_api_key
SEARCH_ENGINE_ID=your_search_engine_id
```

### CLI Options

**For Category/Random Scraping (`npm run scrape`):**
- `--categories` - Spirit categories (comma-separated)
- `--limit` - Number of spirits to scrape
- `--batch-size` - Concurrent searches (default: 3)
- `--distillery` - Specific distillery name
- `--discover` - Enable autonomous discovery

**For Ultra-Efficient Distillery Scraping (`npm run scrape --distillery`):**
- `--distillery` - Distillery names (comma-separated) - NOW USES OPTIMIZED SCRAPER!
- `--limit` - Number of API calls to make (default: 50)

**For Catalog Scraping (`npm run scrape-catalogs`):**
- `--api-calls <number>` - Number of API calls to make (default: 100)
- `--max-products <number>` - Max products per distillery (default: 100)
- `--distilleries <names>` - Specific distillery names (comma-separated)
- `--prefer-unscraped` - Prioritize distilleries never scraped before (default: true)
- `--all-types` - Ensure coverage across all spirit types (default: true)
- `--clear-tracking` - Clear all tracking data and start fresh
- `--quiet` - Reduce output verbosity

**For Deduplication (`npm run dedup`):**
- `--dry-run` - Preview mode without merging
- `--threshold` - Similarity threshold (0-1, default: 0.85)

**For Dry-Run Analysis (`npm run dry-run`):**
- `--threshold` - Similarity threshold (0-1, default: 0.85)
- `--show-details` - Show detailed match analysis in console
- `--show-clusters` - Show similarity clusters in console
- `--export-dir` - Export directory for reports (default: ./dry-run-reports)
- `--format` - Output format: summary|detailed|json (default: summary)
- `--incremental` - Analyze only spirits from last 24 hours
- `--no-blocking` - Disable blocking optimization
- `--no-visualizations` - Skip similarity cluster generation

## 📈 Performance Tips

1. **Start Small**: Test with `--limit 10` first
2. **Optimal Batch Size**: Use 3-5 for best performance
3. **Regular Backups**: Always backup before 100+ spirit operations
4. **Check Quality**: Run `npm run stats` to monitor data quality
5. **Fix Old Data**: Use `npm run fix-csv` to improve existing data

## 🐛 Troubleshooting

### High Error Rate
```bash
# Check statistics
npm run stats

# Clear cache and try again
rm -rf cache/*.json

# Try smaller batch size
npm run scrape -- --batch-size 1 --limit 10
```

### Need to Restore
```bash
# List backups
npm run backup -- --list

# Restore latest
npm run backup -- --restore <backup-id>
```

### Poor Data Quality
```bash
# Clear cache to force fresh extraction
rm -rf cache/*.json

# Fix existing data
npm run fix-csv spirits.csv spirits_fixed.csv
```

### Stale or Incorrect Data
```bash
# Clear specific spirit from cache
jq 'del(.[] | select(.[0] | contains("Spirit Name")))' cache/spirit_data.json > temp.json && mv temp.json cache/spirit_data.json

# Or clear all cache for complete refresh
rm -rf cache/*.json
```

## 🚨 Known Issues from Latest Distillery Scraping (June 2025)

Based on recent Buffalo Trace distillery scraping results, several critical issues have been identified:

### 1. **Duplicate Products** 🔄
- **Issue**: Same product scraped multiple times with slight variations
- **Examples**: 
  - "Blanton's Gold Edition" appears 3 times
  - "Eagle Rare 17 Year" has multiple entries for different years
- **Fix**: Run deduplication after scraping
```bash
npm run dedup  # Automatically merges duplicates
```

### 2. **Wrong Spirit Types** ❌
- **Issue**: Many bourbons marked as "Other" instead of "Bourbon"
- **Examples**: Blanton's Gold Edition, Buffalo Trace Vs Eagle Rare
- **Root Cause**: Review/comparison articles being scraped as products
- **Fix**: Enhanced type detection already in place, clear cache to use it
```bash
rm -rf cache/*.json
npm run scrape-distilleries -- --distilleries "Buffalo Trace" --max-products 100
```

### 3. **Review Articles as Products** 📰
- **Issue**: Comparison articles scraped as actual products
- **Examples**: 
  - "Buffalo Trace Vs Eagle Rare In Depth"
  - "Buffalo Trace Vs Blanton's Black Comparison"
  - "Blanton's Gold - Whiskey in My Wedding Ring"
- **Root Cause**: Google returns review sites mixed with product pages
- **Fix**: Implement URL filtering for known review sites
```bash
# These domains should be excluded:
# - breakingbourbon.com/review/*
# - whiskeyinmyweddingring.com
# - blog.thewhiskyexchange.com
```

### 4. **Truncated Product Names** ✂️
- **Issue**: Product names cut off or missing parts
- **Example**: "Buffalo Trace Kentucky Straight" (missing "Bourbon Whiskey")
- **Fix**: Already fixed in enhanced parser, clear cache

### 5. **Invalid Data in Fields** 🚫
- **Issue**: Wrong data types in fields
- **Examples**:
  - Proof: 2023 (should be ~101)
  - Price: Missing for many products
  - Volume: Inconsistent (700ml vs 750ml)
- **Fix**: Enhanced validation already in place

### 6. **Poor Descriptions** 📝
- **Issue**: Descriptions are review snippets or incomplete sentences
- **Examples**: 
  - "Nov 12, 2015 . This higher proof version..."
  - "Dec 30, 2024 . As a Buffalo Trace Antique..."
- **Root Cause**: Extracting first text found instead of product descriptions
- **Fix**: Description validation filters these out

### 7. **Missing Age Statements** 📅
- **Issue**: Age not extracted even when in product name
- **Examples**: 
  - "Eagle Rare 10 Year" → age_statement: null
  - "Eagle Rare 17 Year" → age_statement: null
- **Fix**: Enhanced extraction already handles this

### 8. **Low Data Quality Scores** 📊
- **Issue**: Most products scoring 50-80 out of 100
- **Indicates**: Missing data, poor descriptions, validation failures
- **Fix**: Re-scrape with enhanced features after cache clear

### 9. **Retailer Noise** 🏪
- **Issue**: Retailer-specific text in descriptions
- **Examples**: "Product Details Product Description Flavor Availability returns Customer Reviews"
- **Fix**: Enhanced content parser strips this

### 10. **Special Characters in Names** 🔤
- **Issue**: HTML entities and special formatting
- **Examples**: "750 M L" instead of "750ml"
- **Fix**: Text normalization in enhanced parser

## 📋 Recommended Fix Workflow

1. **Clear all cache** (important!)
```bash
rm -rf cache/*.json
```

2. **Create backup** before fixes
```bash
npm run backup -- --description "Before fixing distillery data"
```

3. **Export current data** to CSV
```bash
# Export from your database to CSV
```

4. **Fix with enhanced parser**
```bash
npm run fix-csv spirits_export.csv spirits_fixed.csv
```

5. **Clear database** and re-import
```bash
# Clear spirits table
# Import spirits_fixed.csv
```

6. **Re-run distillery scraping** with enhanced features
```bash
npm run scrape-distilleries -- --distilleries "Buffalo Trace" --max-products 100 --skip-existing
```

7. **Run deduplication**
```bash
npm run dedup
```

8. **Verify improvements**
```bash
npm run stats
# Should show:
# - Average quality score > 85
# - Fewer "Other" type spirits
# - No description mismatches
```

## 🛡️ Prevention Tips

1. **Always clear cache** before major scraping operations
2. **Use distillery scraping** for better data quality
3. **Run deduplication** after every 50+ spirit batch
4. **Monitor quality scores** - aim for 85+ average
5. **Review stats** regularly to catch issues early
6. **Exclude review sites** from scraping domains
7. **Use smaller batches** (100-200) for better quality control
8. **Use dry-run analysis** before deduplication to understand impact

## 📊 Expected Results After Fixes

- ✅ No duplicate products (deduplication merges them)
- ✅ Correct spirit types (95%+ accuracy)
- ✅ Complete product names
- ✅ Valid proof/ABV values
- ✅ Extracted age statements
- ✅ Product descriptions (not review snippets)
- ✅ Quality scores 85+ average
- ✅ No comparison/review articles as products

## 🔍 Dry-Run Analysis Deep Dive

The `npm run dry-run` command provides comprehensive deduplication analysis without making any changes to your data. This is essential for understanding what deduplication will do before running it.

### When to Use Dry-Run Analysis

1. **Before first deduplication** - Understand your data's duplicate landscape
2. **After large scraping sessions** - See how many duplicates were created
3. **When testing thresholds** - Find the optimal similarity threshold
4. **Before production deployment** - Verify deduplication logic
5. **For quality assurance** - Ensure no false positives

### Understanding the Reports

#### 1. Console Summary (Default)
- **Overview**: Total analyzed, duplicates found, processing time
- **Actions**: Auto-merge candidates, manual review needed, ignored
- **Impact**: Spirits to remove, data improvements, quality boost
- **Performance**: Blocking optimization stats

#### 2. Detailed Match Analysis (--show-details)
Each potential duplicate shows:
- **Similarity percentage** with confidence level
- **Detailed explanation** of why it's a match
- **Attribute analysis**: Name, brand, age, type, price compatibility
- **Merge preview**: What data would be improved or lost
- **Recommended action**: merge, review, or ignore

#### 3. Similarity Clusters (--show-clusters)
- **Cluster visualization** of related duplicates
- **Center spirit** that represents the cluster
- **Member relationships** with similarity scores
- **Cluster actions**: merge all, merge high confidence, review

#### 4. Exported Files
- **JSON** (`detailed-report.json`): Complete analysis data for processing
- **CSV** (`matches.csv`): Spreadsheet-friendly match data
- **TXT** (`summary.txt`): Human-readable summary report
- **Clusters** (`clusters.json`): Similarity cluster data

### Interpreting Similarity Scores

| Similarity | Confidence | Typical Action | Meaning |
|------------|------------|----------------|---------|
| 95-100% | High | Auto-merge | Virtually identical spirits |
| 85-94% | High | Auto-merge | Very likely duplicates |
| 70-84% | Medium | Review | Possible duplicates, manual check |
| 50-69% | Low | Ignore | Probably different spirits |
| <50% | Very Low | Ignore | Definitely different spirits |

### Sample Workflow with Dry-Run

```bash
# 1. Analyze current state
npm run dry-run

# 2. Test conservative threshold
npm run dry-run -- --threshold 0.9 --show-details

# 3. Test aggressive threshold  
npm run dry-run -- --threshold 0.7 --show-details

# 4. Export for detailed review
npm run dry-run -- --export-dir ./analysis --threshold 0.85

# 5. Review exported CSV in spreadsheet
open ./analysis/dry-run-matches-*.csv

# 6. Run actual deduplication with chosen threshold
npm run dedup -- --threshold 0.85

# 7. Verify results
npm run stats
```

### Red Flags in Dry-Run Results

Watch out for these warning signs:
- **High auto-merge count** (>20% of total spirits) - threshold too low
- **Many different spirit types** matching - logic issues
- **Price mismatches** in high-confidence matches - data quality problems
- **Age statement conflicts** - need manual review
- **Grain type mismatches** (bourbon vs rye) - classification errors

## 🎯 Best Practices

1. **Use distillery scraping for completeness** - Best way to build comprehensive database
2. **Always use smart scraper** - Don't use old commands
3. **Let auto-dedup run** - For 50+ spirits
4. **Monitor quality scores** - Aim for 70+ average
5. **Regular backups** - Before major operations
6. **Fix CSVs** - Clean existing data periodically
7. **Resume capability** - Use `--start-index` if interrupted
8. **Always dry-run first** - Before deduplication operations

## 📈 Latest Progress Report (June 2025 - Update 2)

### Improvements Observed ✅
Comparing the latest scraping results to the previous run:

1. **Better Data Quality Scores** 
   - Average improved from 73 to 78 (still below target 85)
   - More products scoring 80+ (60% vs 40% before)

2. **Fewer Review Articles**
   - Reduced from 20% to 12% of results
   - But still getting "Buffalo Trace Vs Eagle Rare", "Evan Williams Black Label On Whisky Connosr"

3. **More Complete Data**
   - ABV/Proof present in 70% (up from 50%)
   - Prices available for 50% (up from 30%)

4. **Better Spirit Type Detection**
   - Bourbon detection improved to 80% accuracy
   - Still misclassifying some as "Other" or "Whiskey"

### Remaining Critical Issues ❌

#### 1. **Persistent Duplicate Names** 🔄
- "Evan Williams White Label Bottled In Bond" appears twice
- "Blanton's Gold Edition" still has variations
- **Root Cause**: Different retailers use slightly different names
- **Impact**: Database pollution, user confusion

#### 2. **Review Sites Still Appearing** 📰
- "Evan Williams Black Label On Whisky Connosr" - review site
- Breaking Bourbon URLs still in results
- **Root Cause**: Excluded domains not being applied during Google search
- **Fix Needed**: Implement exclusion at search query level

#### 3. **Incorrect Descriptions** 📝
Still getting technical/spec descriptions instead of product descriptions:
- "BLANTONS SINGLE BARREL Barrel 1587 bottled 91218 MASH BILL..."
- "ELIJAH CRAIG SMALL BATCH BOURBON. Elijah Craig Small Batch..."
- **These are copy-paste errors from other products!**

#### 4. **Missing Critical Data** 🚫
- Origin Country: 100% missing
- Region: 100% missing (all show "Kentucky" but not extracted properly)
- Distillery field: 100% missing
- Age statements: Still null even for "Single Barrel Vintage 2005"

#### 5. **Volume Inconsistencies** 📏
- Most show 750ml correctly
- But seeing "500ml" for one product (likely European)
- Need normalization for US vs EU bottle sizes

## 🏆 Road to Golden Data - Action Plan

### Phase 1: Fix Search Quality (Priority 1) 🔍
```bash
# Implement search exclusions at query generation
query = `"${distillery}" "${product}" -site:reddit.com -site:breakingbourbon.com -review -vs -comparison`

# Use site restriction for trusted retailers
query += ` site:totalwine.com OR site:thewhiskyexchange.com OR site:masterofmalt.com`
```

### Phase 2: Improve Data Extraction (Priority 2) 📊
```typescript
// Add these extractions to spirit-extractor.ts
extractOriginCountry(text: string): string {
  // Look for "Kentucky Straight Bourbon" → USA
  // "Scotch Whisky" → Scotland
  // "Irish Whiskey" → Ireland
}

extractDistillery(text: string, brand: string): string {
  // Map brands to distilleries
  const distilleryMap = {
    "Buffalo Trace": "Buffalo Trace Distillery",
    "Blanton's": "Buffalo Trace Distillery",
    "Evan Williams": "Heaven Hill Distilleries"
  };
}

extractRegion(text: string): string {
  // Extract from URLs, descriptions
  // "Kentucky Straight" → "Kentucky"
  // "Highland Single Malt" → "Highland"
}
```

### Phase 3: Fix Description Quality (Priority 3) 📄
```typescript
// Reject bad descriptions
function isValidDescription(desc: string): boolean {
  // Reject if contains another product name
  if (/BLANTONS|ELIJAH CRAIG|EVAN WILLIAMS/.test(desc) && 
      !desc.includes(currentProductName)) {
    return false;
  }
  
  // Reject technical specs
  if (/MASH BILL|PROOF \d+|bottled \d+/.test(desc)) {
    return false;
  }
  
  // Require actual description language
  return /flavor|taste|aroma|notes|smooth|rich/.test(desc);
}
```

### Phase 4: Implement Deduplication Rules (Priority 4) 🔀
```typescript
// Normalize product names before storing
function normalizeProductName(name: string): string {
  return name
    .replace(/bottled[\s-]?in[\s-]?bond/gi, "Bottled in Bond")
    .replace(/(\d+)\s*ml/gi, "") // Remove volume
    .replace(/\s+/g, " ")
    .trim();
}
```

### Phase 5: Add Post-Processing Validation (Priority 5) ✅
```typescript
interface QualityGates {
  hasName: boolean;          // Required
  hasType: boolean;          // Required, not "Other"
  hasDescription: boolean;   // Required, >50 chars
  hasValidProof: boolean;    // 80-150 range
  hasPrice: boolean;         // Recommended
  hasDistillery: boolean;    // Required for whiskey
  hasRegion: boolean;        // Required for whiskey
  descriptionQuality: boolean; // Not technical specs
}

// Only store if passes minimum gates
const requiredGates = ['hasName', 'hasType', 'hasDescription', 'descriptionQuality'];
```

## 📊 Golden Data Metrics Target

To achieve "golden data" quality, aim for:

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Quality Score | 78 | 90+ | ❌ Need +12 |
| Type Accuracy | 80% | 98% | ⚠️ Need +18% |
| Has Description | 95% | 100% | ⚠️ Need better quality |
| Has Price | 50% | 80% | ❌ Need +30% |
| Has Distillery | 0% | 95% | ❌ Critical gap |
| Has Region | 0% | 90% | ❌ Critical gap |
| Duplicate Rate | 15% | <2% | ❌ Need -13% |
| Review Articles | 12% | 0% | ❌ Still appearing |

## 🔧 Immediate Actions for Next Run

1. **Clear cache completely**
```bash
rm -rf cache/*.json
```

2. **Update excluded domains in search query**
```bash
# Add to google-search.ts
const exclusions = "-site:connosr.com -site:breakingbourbon.com -site:blog.* -review -vs";
```

3. **Run smaller test batch first**
```bash
npm run scrape-distilleries -- --distilleries "Buffalo Trace" --max-products 10
```

4. **Verify improvements before full run**
```bash
npm run stats
# Check: Quality >85, Type accuracy >95%, Distillery field populated
```

5. **Then run full distillery scrape**
```bash
npm run scrape-distilleries -- --distilleries "Buffalo Trace,Heaven Hill" --max-products 100
```

## 🎯 Definition of Golden Data

**Golden Data** means:
- ✅ **Complete**: All important fields populated (>90%)
- ✅ **Accurate**: Correct types, valid data (>98%)
- ✅ **Unique**: No duplicates (<2%)
- ✅ **Verified**: From trusted sources only
- ✅ **Consistent**: Normalized formats
- ✅ **Quality**: Rich descriptions, not specs
- ✅ **Enriched**: Distillery, region, awards data

Current status: **Bronze Data** (needs significant improvement)
Next milestone: **Silver Data** (85+ quality score)
Final goal: **Golden Data** (90+ quality score with all fields)

## 📊 What's New in v2.5.7?

- **Enhanced Data Quality** - V2.5.7 fixes for proof calculation, brand extraction
- **Improved Product Validation** - Rejects food items, fragments, broken names
- **Better Type Detection** - Single Malt properly classified
- **Proof Calculation** - Now calculated from ABV (proof = ABV * 2)
- **Brand Name Fixes** - "Ba Lcones" → "Balcones", weight prefixes removed
- **Stricter Name Validation** - Rejects fragments like ". Bourbon. Result"

## 📊 What's New in v2.2?

- **Catalog-Focused Scraping** - Multiple spirits per API call
- **Efficiency Metrics** - See exactly how many spirits you get per API call
- **Retailer Catalog Mining** - Extracts complete product listings from catalog pages
- **Smart Site Selection** - Targets high-yield retailers like TotalWine, Whisky Exchange
- **Multi-Product Extraction** - Gets all products from search results, not just one

## 📊 What's New in v2.1?

- **NEW: Systematic Distillery Scraping** - Scrape all 908 distilleries comprehensively
- **Smart Query Generation** - Uses product lines, year ranges, press releases
- **Progress Tracking** - Resume interrupted scraping sessions
- **Complete Coverage** - Get entire product catalogs, not random samples
- **No more `scrape-enhanced`** - Just `scrape` (smart by default)
- **No more 20+ commands** - Just 6 essential ones
- **No configuration needed** - All features automatic
- **Better accuracy** - 95%+ classification accuracy
- **Quality scoring** - Know your data quality
- **Auto-deduplication** - For large batches

## 🎨 Choosing Between Scraping Methods

| Use Case | Method | Command | Efficiency |
|----------|--------|---------|------------|
| **Build complete catalog** 🚀 | Ultra-Efficient (Default) | `npm run scrape -- --distillery "Buffalo Trace"` | 3-5 spirits/call |
| Multiple distilleries | Ultra-Efficient (Default) | `npm run scrape -- --distillery "Buffalo Trace,Wild Turkey"` | 3-5 spirits/call |
| Very large catalogs | Catalog Command | `npm run scrape-catalogs -- --max-products 5000` | 3-5 spirits/call |
| Original method (legacy) | Distillery Scraping | `npm run scrape-distilleries` | 0.1-2 spirits/call |
| Quick daily updates | Category Scraping | `npm run scrape -- --categories bourbon` | 1-3 spirits/call |
| Find new releases | Discovery Mode | `npm run scrape -- --discover` | 1-3 spirits/call |
| Random sampling | Category Scraping | `npm run scrape -- --categories whiskey --limit 100` | 1-3 spirits/call |
| Analyze duplicates safely | Dry-Run Analysis | `npm run dry-run` | N/A |
| Test deduplication settings | Dry-Run Analysis | `npm run dry-run -- --threshold 0.8` | N/A |
| Remove duplicates | Deduplication | `npm run dedup` | N/A |

---

For advanced API integration, see the source code. For issues, check IMPROVEMENTS.md.