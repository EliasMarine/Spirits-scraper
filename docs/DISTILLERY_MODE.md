# Distillery Mode - Focused Spirit Discovery

The spirits scraper now includes a powerful distillery-focused discovery mode that targets specific distilleries to find their new releases, limited editions, and special bottlings.

## Features

- **150+ Major Distilleries**: Comprehensive database covering bourbon, scotch, Irish, Japanese, and other major whiskey regions
- **Smart Query Generation**: Rotates through distilleries with targeted search patterns
- **Regional Coverage**: Includes distilleries from USA, Scotland, Ireland, Japan, Canada, Australia, Taiwan, India, and more
- **Variation Support**: Handles common name variations (e.g., "Buffalo Trace" vs "Buffalo Trace Distillery")

## Usage

### Scraping with Distillery Mode

```bash
# Basic distillery-focused scraping (100 queries)
npm run scrape -- --mode distillery

# Scrape with custom limit
npm run scrape -- --mode distillery --limit 500

# Large-scale distillery scraping
npm run scrape -- --mode distillery --limit 1000
```

### Discovery with Distillery Mode

```bash
# Discover spirits using distillery queries
npm run discover -- --mode distillery --queries 50

# Discover without cache (fresh results)
npm run discover -- --mode distillery --queries 100 --no-cache
```

## Query Templates

The distillery mode generates various types of queries:

1. **New Releases**: `[Distillery] new releases 2024`
2. **Limited Editions**: `[Distillery] limited edition`
3. **Special Releases**: `[Distillery] special release`
4. **Collections**: `[Distillery] bourbon collection`
5. **Exclusives**: `[Distillery] distillery exclusive`
6. **Barrel Programs**: `[Distillery] single barrel`, `[Distillery] barrel select`
7. **Anniversary Editions**: `[Distillery] anniversary edition`
8. **Travel Retail**: `[Distillery] duty free collection`

## Distillery Coverage by Region

### American Whiskey (37 distilleries)
- **Kentucky Bourbon**: Buffalo Trace, Heaven Hill, Wild Turkey, Four Roses, Maker's Mark, etc.
- **Tennessee**: Jack Daniel's, George Dickel, Uncle Nearest
- **Craft**: Westland, Balcones, High West, Stranahan's, FEW Spirits

### Scotch Whisky (58 distilleries)
- **Speyside**: Macallan, Glenfiddich, Glenlivet, Balvenie, GlenDronach
- **Islay**: Ardbeg, Lagavulin, Laphroaig, Bowmore, Bruichladdich
- **Highland**: Highland Park, Glenmorangie, Dalmore, Oban
- **Campbeltown**: Springbank, Glen Scotia, Glengyle
- **Lowland**: Auchentoshan, Glenkinchie, Bladnoch

### Irish Whiskey (15 distilleries)
- Jameson, Bushmills, Teeling, Redbreast, Green Spot, Powers, Waterford

### Japanese Whisky (12 distilleries)
- Suntory (Yamazaki, Hakushu), Nikka (Yoichi, Miyagikyo), Chichibu, Mars, Akkeshi

### World Whisky (22 distilleries)
- **Canadian**: Crown Royal, Canadian Club, Forty Creek
- **Australian**: Starward, Sullivan's Cove, Lark
- **Other**: Kavalan (Taiwan), Amrut (India), Penderyn (Wales)

## Benefits

1. **Comprehensive Coverage**: Ensures no major distillery is missed
2. **New Release Discovery**: Focuses on finding the latest releases
3. **Efficient Searching**: Rotates through distilleries evenly
4. **Reduced Duplicates**: Targeted searches yield more unique results

## Example Output

```bash
npm run scrape -- --mode distillery --limit 20

🔍 Starting Spirit Scraper
Generated 20 distillery-focused queries
Processing query 1/20: Buffalo Trace new releases 2024
Processing query 2/20: Macallan limited edition
Processing query 3/20: Ardbeg special release
...
✅ Scraping completed:
   Total queries: 20
   Spirits found: 127
   New spirits: 89
   Duplicates: 38
```

## Tips

1. **Start Small**: Test with 20-50 queries first to verify results
2. **Use Categories**: Combine with category filters for more focused results
3. **Monitor Rate Limits**: Google API has daily limits (100 queries/day free tier)
4. **Schedule Regular Runs**: Run weekly to catch new releases
5. **Review Results**: Check the admin dashboard to verify quality

## Advanced Usage

### Combining with Categories

While distillery mode doesn't directly support category filtering, you can achieve similar results by:

1. Running distillery mode first to build a comprehensive database
2. Using the deduplication service to clean up results
3. Filtering results in the admin dashboard by category

### Custom Distillery Lists

To add more distilleries or modify existing ones:

1. Edit `src/config/distilleries.ts`
2. Follow the existing format:
```typescript
{
  name: "Distillery Name",
  variations: ["Alternative Name", "Old Name"],
  region: "Region",
  country: "Country",
  type: ["whisky type"]
}
```

### Integration with Autonomous Discovery

The distillery mode integrates seamlessly with autonomous discovery:

```bash
# Discover spirits with focus on distilleries
npm run discover -- --mode distillery --queries 100

# This will:
# 1. Generate distillery-focused queries
# 2. Search for spirits from each distillery
# 3. Extract detailed information
# 4. Store unique spirits in the database
# 5. Build a comprehensive distillery catalog
```

## Monitoring Results

After running distillery mode:

1. Check the scraping statistics: `npm run stats`
2. Review discovered spirits in the admin dashboard
3. Run deduplication to merge any duplicates: `npm run dedup`
4. Export results for analysis if needed