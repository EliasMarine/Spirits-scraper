# Efficient Scraper Learnings

## Last Updated: 2025-06-10

This document tracks learnings from fine-tuning the ultra-efficient scraper to maintain 60%+ efficiency.

## Major Issues Identified (2025-06-10)

### 1. ❌ Price Extraction Issues
**Problem**: Years and other numbers are being extracted as prices
- "1993 Buffalo Trace..." → price: 1993
- "Wild Turkey 8 Year Old..." → price: 8
- "Buffalo Trace Rye Bourbon 125-experimental..." → price: 125
- "Buffalo Trace Kentucky Straight Bourbon (750ml)" → price: 750

**DON'T**: Extract any number from the name as price
**DO**: Only extract price from:
- Structured data (pagemap.product.offers.price)
- Price patterns like "$XX.XX" or "XX.99"
- Price must be between $5 and $5000 for validation

### 2. ❌ Poor Product Name Parsing
**Problem**: Incomplete or poorly parsed names with trailing characters
- "Buffalo Trace K&l Exclusive Single Barrel 74 Kentucky Bourbon ..."
- "Wild Turkey 101 Kentucky Straight Bourbon Whiskey ()-Sku ..."
- "Buffalo Trace Kentucky Straight Bourbon Whiskey ()-Sku ..."

**DON'T**: Leave "()-Sku", "...", or other artifacts in names
**DO**: Clean names properly:
- Remove SKU references
- Remove empty parentheses
- Trim trailing dots
- Keep only the actual product name

### 3. ❌ Non-Product Items Being Scraped
**Problem**: Accessories and non-spirit items
- "Buffalo Trace Toro" (a cigar)
- "Shop Wild Turkey Spirits Collection" (category page)
- "Buffalo Trace Distillery, Home Of Many Legendary Bourbon" (about page)

**DON'T**: Store non-spirit items
**DO**: Validate that item is actually a spirit:
- Must contain volume (750ml, 1L, etc.)
- Must be a drinkable spirit (not cigars, merchandise)
- Skip category/collection page titles

### 4. ✅ Good Efficiency Achievement
**Success**: Achieved 280-340% efficiency (2.8-3.4 spirits per API call)
- Buffalo Trace: 42 spirits from 15 API calls
- Wild Turkey: 51 spirits from 15 API calls

**DO**: Continue using catalog-focused queries
**DO**: Keep targeting high-yield domains (Total Wine, K&L, Whisky Exchange)

### 5. ⚠️ Excessive Empty Queries
**Problem**: Many queries returning no results
- "catalog collection" queries often empty
- "view all" "sort by" queries often empty
- wine.com queries mostly empty

**DON'T**: Use overly specific query patterns
**DO**: Use simpler, more general patterns:
- Instead of: `site:totalwine.com "Buffalo Trace" catalog collection "all products"`
- Try: `site:totalwine.com "Buffalo Trace" bourbon -gift -cigar`

### 6. ❌ Query Exclusions Too Long
**Problem**: Massive exclusion lists making queries too complex
```
-site:amazon.com -site:reddit.com -site:facebook.com -site:blogspot.com -site:wordpress.com -site:medium.com -site:twitter.com -site:instagram.com -site:pinterest.com -site:youtube.com -site:ebay.com -site:tripadvisor.com -site:yelp.com -site:wikipedia.org -site:tumblr.com -site:fredminnick.com -site:breakingbourbon.com -site:connosr.com -site:whiskeyinmyweddingring.com -site:thewhiskeywash.com -site:whiskyadvocate.com -site:blog.thewhiskyexchange.com -site:distiller.com -site:whiskybase.com
```

**DON'T**: Add 20+ exclusions to every query
**DO**: Use only critical exclusions:
- `-reddit -facebook -twitter -youtube`
- Or use site: operators to force specific domains

## Key Performance Metrics to Track
1. **Efficiency**: Spirits found / API calls (target: 60%+ or 0.6+ spirits/call)
2. **Data Quality Score**: Should average 60+ for stored spirits
3. **Catalog Page Hit Rate**: Higher = better efficiency
4. **Empty Query Rate**: Should be < 30%

## Recommended Query Patterns (High Yield)

### Pattern 1: Simple Site Search
```
site:totalwine.com "Buffalo Trace" bourbon whiskey
site:klwines.com "Wild Turkey" products
site:thewhiskyexchange.com intitle:"Buffalo Trace"
```

### Pattern 2: Multi-Site Search
```
(site:totalwine.com OR site:wine.com) "Buffalo Trace" bourbon
(site:klwines.com OR site:flaviar.com) "Wild Turkey"
```

### Pattern 3: General Catalog Search
```
"Buffalo Trace bourbon" buy online price
"Wild Turkey products" shop whiskey
```

## Implementation Priority
1. **HIGH**: Fix price extraction logic
2. **HIGH**: Clean product names properly
3. **HIGH**: Filter out non-spirit items
4. **MEDIUM**: Simplify queries for better results
5. **MEDIUM**: Reduce exclusion list size
6. **LOW**: Add more validation for data quality

## Next Steps
1. ✅ DONE: Updated `extractPrice()` to validate price ranges ($5-$5000)
2. ✅ DONE: Updated `cleanProductName()` to remove artifacts (()-Sku, trailing dots)
3. ✅ DONE: Added `isValidSpirit()` validation (excludes cigars, accessories)
4. ✅ DONE: Simplified query generation patterns
5. ✅ DONE: Reduced exclusion lists to 4 critical sites
6. ✅ DONE: Made optimized scraper the default for distillery mode

## Changes Applied (2025-06-10)

### Price Extraction Fix
```typescript
// Now only extracts from explicit price patterns:
// $29.99, 29.99 USD, price: 29.99
// Validates range: $5-$5000
```

### Name Cleaning Fix
```typescript
// Removes: ()-Sku, ..., empty parentheses
// Cleans K&L specific patterns
```

### Product Validation Fix
```typescript
// Excludes: cigars, accessories, shop pages
// Requires: spirit-related terms (whiskey, bourbon, etc.)
```

### Query Simplification
```typescript
// Before: 23 exclusions per query
// After: 4 exclusions (-reddit -facebook -twitter -youtube)
// Focused on proven patterns
```

## Results After Fine-Tuning
- Optimized scraper is now the DEFAULT for distillery mode
- Cleaner data with proper prices and names
- No more non-spirit items
- Simpler, more effective queries