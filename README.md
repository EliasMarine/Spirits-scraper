# Spirits Scraper v2.2 - Catalog-Focused Edition 🚀

A high-efficiency Node.js spirits scraper that achieves **10+ spirits per API call** by intelligently mining retailer catalog pages instead of searching for individual products.

## 🌟 What's New in v2.2

### 100x Efficiency Improvement!
- **OLD METHOD**: 0.11 spirits per API call (searching for individual products)
- **NEW METHOD**: 10+ spirits per API call (mining catalog pages)
- **HOW**: Searches for retailer catalog pages and extracts ALL products at once

### Real Example
```bash
# OLD: Searching for "Buffalo Trace Kosher Bourbon 750 ml"
# Result: 1 product from 1 API call (if lucky)

# NEW: Searching for site:totalwine.com "Buffalo Trace"
# Result: 50+ products from 1 API call!
```

## Features

- 🚀 **Catalog-Focused Scraping** - Extract 10+ spirits per API call
- 📦 **908 Distilleries** - Comprehensive coverage across all spirit types
- 🔍 **Smart Extraction** - Gets complete product listings from catalogs
- 🎯 **Targeted Retailers** - Focuses on high-yield sites like TotalWine
- 📊 **Efficiency Metrics** - Real-time spirits-per-API-call tracking
- 💾 **Redis Caching** - Avoids duplicate API calls
- 🔄 **Auto-Deduplication** - Merges duplicates automatically
- ✨ **Enhanced Data** - ABV, age, region, cask type extraction
- 📈 **Quality Scoring** - 0-100 quality score for each spirit
- 🛡️ **Smart Validation** - Filters out reviews and non-products

## Quick Start

```bash
# Install
npm install

# Configure environment
cp .env.example .env
# Add your API keys to .env

# Run the NEW high-efficiency catalog scraper
npm run scrape-catalogs

# Or target specific distilleries
npm run scrape-catalogs -- --distilleries "Buffalo Trace,Wild Turkey"
```

## Catalog Scraping Examples

### Scrape All Distilleries (908 total)
```bash
npm run scrape-catalogs
# Processes all 908 distilleries using catalog pages
# Expects 10,000+ spirits with just 1,000 API calls!
```

### Scrape Specific Distilleries
```bash
npm run scrape-catalogs -- --distilleries "Buffalo Trace,Macallan,Glenfiddich"
# Gets complete product catalogs for these distilleries
```

### Control Product Limits
```bash
npm run scrape-catalogs -- --max-products 200
# Get up to 200 products per distillery
```

### Resume Interrupted Scraping
```bash
npm run scrape-catalogs -- --start-index 100
# Resume from distillery #100
```

## How Catalog Scraping Works

1. **Searches Retailer Catalogs**: `site:totalwine.com "Buffalo Trace"`
2. **Extracts Product Grid**: Finds all products on the page
3. **Parallel Processing**: Hits multiple retailers simultaneously
4. **Smart Extraction**: Gets name, price, description from listings
5. **Bulk Storage**: Stores all products from one search

## Efficiency Comparison

| Method | Example Query | Products Found | API Calls | Efficiency |
|--------|--------------|----------------|-----------|------------|
| Old | "Buffalo Trace Kosher Bourbon 750ml" | 1 | 1 | 1.0 |
| Old | "Eagle Rare 10 Year price" | 0-1 | 1 | 0.5 |
| **NEW** | site:totalwine.com "Buffalo Trace" | 50+ | 1 | **50+** |
| **NEW** | site:masterofmalt.com "Macallan" | 75+ | 1 | **75+** |

## All Commands

### Primary Commands (Use These!)
```bash
# 🚀 HIGH EFFICIENCY - Catalog scraping (10+ spirits/call)
npm run scrape-catalogs
npm run scrape-catalogs -- --distilleries "Buffalo Trace"

# Regular smart scraping (1-3 spirits/call)
npm run scrape -- --categories bourbon --limit 50

# Remove duplicates
npm run dedup

# View statistics
npm run stats
```

### Additional Commands
```bash
# Backup/restore
npm run backup
npm run backup -- --restore <id>

# Cache management
npm run cache -- --stats
npm run cache -- --clear

# Fix existing data
npm run fix-csv input.csv output.csv

# Dry-run deduplication analysis
npm run dry-run
```

## Prerequisites

- Node.js 18+
- Google Cloud Platform account with Custom Search API
- Supabase project for data storage
- Redis instance (Upstash recommended)

## Configuration

Create `.env` file:
```env
# Google Search API
GOOGLE_API_KEY=your_google_api_key
SEARCH_ENGINE_ID=your_search_engine_id

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## Architecture

### Catalog-Focused Design
- **catalog-focused-scraper.ts** - Searches retailer catalogs
- **Multi-product extraction** - Gets all products from search results
- **Retailer targeting** - Prioritizes high-yield sites
- **Efficiency tracking** - Real-time metrics

### Service Architecture
```
src/services/
├── catalog-focused-scraper.ts  # NEW! High-efficiency catalog scraper
├── spirit-extractor.ts         # Enhanced data extraction
├── deduplication-service.ts    # Automatic duplicate merging
├── cache-service.ts           # Redis caching layer
└── supabase-storage.ts        # Database operations
```

### Distillery Coverage
- 🥃 **Bourbon**: 79 distilleries
- 🏴󐁧󐁢󐁳󐁣󐁴󐁿 **Scotch**: 266 distilleries
- 🌵 **Tequila**: 181 distilleries
- 🏝️ **Rum**: 142 distilleries
- 🍸 **Gin**: 52 distilleries
- 🍾 **Vodka**: 41 distilleries
- 🥃 **American Craft**: 94 distilleries
- 🍷 **Cognac**: 53 distilleries

## Performance Optimization

### Why Catalog Scraping is Superior
1. **Bulk Extraction**: Get 50+ products from one search
2. **Structured Data**: Retailers have consistent formats
3. **Complete Listings**: No missing products
4. **Price Data**: Most catalog pages show prices
5. **Fresh Inventory**: Retailer pages are always current

### Tips for Maximum Efficiency
- Clear cache before major scraping: `npm run cache -- --clear`
- Use specific distilleries for testing
- Monitor efficiency with `npm run stats`
- Run deduplication after large batches

## Development

```bash
# Build TypeScript
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run typecheck
```

## API Rate Limits

- Google Search API: 100 queries/day (free tier)
- With catalog scraping: 100 queries = 1,000+ spirits!
- Automatic rate limit detection
- Caching prevents duplicate API calls

## Expected Output

```
🚀 Starting CATALOG-FOCUSED scraping...

📋 Processing: Buffalo Trace
🔍 Searching: site:totalwine.com "Buffalo Trace"
📦 Found 52 products from this catalog search
✅ Stored: Buffalo Trace Kentucky Straight Bourbon
✅ Stored: Buffalo Trace Kosher Wheat Recipe
✅ Stored: Eagle Rare 10 Year
... 49 more products
📊 Efficiency: 52.00 spirits per API call

📊 SUMMARY
─────────────────────────────
🏭 Distilleries processed: 5
🥃 Total products found: 423
💾 Total products stored: 387
📈 Overall efficiency: 21.15 spirits per API call
```

## Troubleshooting

### Low Efficiency?
```bash
# Clear cache for fresh searches
npm run cache -- --clear

# Check which retailers work best
npm run site-metrics
```

### Too Many Duplicates?
```bash
# Run deduplication
npm run dedup

# Preview first
npm run dedup -- --dry-run
```

### API Limit Reached?
```bash
# Check remaining quota
npm run stats

# Use cached results only
npm run scrape -- --cache-only
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Test with small batches first
4. Submit pull request

## License

MIT

---

**Remember**: With catalog scraping, every API call counts! Target retailer catalogs for maximum efficiency. 🚀