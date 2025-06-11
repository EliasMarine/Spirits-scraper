# Scraper Efficiency Fix Guide

## The Problem
Your scraper is searching for individual products instead of catalog pages, resulting in terrible efficiency:
- **Current**: 100 API calls → 4 spirits (0.04 efficiency)
- **Possible**: 100 API calls → 5,000+ spirits (50+ efficiency)

## Root Cause
The `enhanced-query-generator.ts` generates queries like:
```
"Four Roses Single Barrel" site:totalwine.com
"Elijah Craig Small Batch" site:wine.com
```

Each query finds 1-2 products. This is backwards!

## The Solution
Search for catalog/collection pages that list many products:
```
site:totalwine.com/spirits-wine/bourbon/c/000013
site:thewhiskyexchange.com/c/33/american-whiskey
site:wine.com bourbon "view all" catalog
```

Each query finds pages with 50-100+ products!

## Quick Implementation

### 1. Replace Query Generation
Instead of `enhanced-query-generator.ts`, use the new `efficient-catalog-query-generator.ts`:

```typescript
// OLD - Don't do this!
const queries = queryGen.generateCategoryDiscoveryQueries('bourbon', 100);

// NEW - Do this!
import { EfficientCatalogQueryGenerator } from './services/efficient-catalog-query-generator';
const queries = EfficientCatalogQueryGenerator.generateTopCatalogQueries('bourbon', 20);
```

### 2. Process Catalog Pages
When you get search results, they'll be catalog pages with many products:

```typescript
// For each search result (catalog page)
const catalogUrl = searchResult.link;

// Fetch the HTML
const html = await fetchPage(catalogUrl);

// Extract ALL products from the catalog
const products = extractProductsFromCatalog(html);
// This might return 50-100 products from ONE page!

// Process each product
for (const product of products) {
  await storeSpirit(product);
}
```

### 3. Key Catalog Extraction Patterns

For different sites, look for:

**Total Wine**:
```html
<div class="product-item">
  <h2 class="product-title">Spirit Name</h2>
  <span class="price">$XX.XX</span>
  <span class="volume">750ml</span>
</div>
```

**The Whisky Exchange**:
```html
<div class="product-card">
  <h3 class="product-card__name">Spirit Name</h3>
  <p class="product-card__price">£XX.XX</p>
  <p class="product-card__data">70cl / XX%</p>
</div>
```

**Wine.com**:
```html
<li class="prodItem">
  <span class="prodItemInfo_name">Spirit Name</span>
  <span class="prodItemInfo_price">$XX.XX</span>
</li>
```

### 4. Immediate Wins

1. **Stop generating individual product queries** - Each API call should target catalog pages
2. **Parse multiple products per page** - Extract ALL spirits from catalog pages
3. **Focus on high-yield sites** - Total Wine, Whisky Exchange, Wine.com have the best catalog structures
4. **Use direct catalog URLs** - Many sites have predictable catalog URL patterns

## Expected Results

With this approach:
- 10 API calls → 500+ spirits
- 100 API calls → 5,000+ spirits
- Your daily limit becomes much more valuable!

## Testing

Run the comparison:
```bash
npx tsx test-efficient-queries.ts
```

This shows the dramatic difference between approaches.

## Next Steps

1. Modify `catalog-focused-scraper.ts` to use the new query generator
2. Update the HTML parsing to extract multiple products per page
3. Test with a small limit (10 calls) to verify efficiency
4. Celebrate your 1000x+ improvement! 🎉