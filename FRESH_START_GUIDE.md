# Complete Fresh Start Guide for Spirits Scraper

This guide explains how to completely reset your database and clear all caches for a fresh start.

## Why You Might Need This

- Testing the scraper from scratch
- Corrupted data in the database
- Want to start over with clean data
- Changed scraping logic significantly

## Step-by-Step Process

### 1. Clear the Database (Supabase)

Run this SQL script in your Supabase SQL Editor:

```sql
-- Complete Database Reset for Spirits Data
-- WARNING: This will delete ALL spirits data!

DO $$
BEGIN
    -- Disable triggers to avoid cascading issues
    ALTER TABLE spirits DISABLE TRIGGER ALL;
    ALTER TABLE brands DISABLE TRIGGER ALL;
    ALTER TABLE categories DISABLE TRIGGER ALL;
    
    -- Clear junction tables first (foreign key constraints)
    TRUNCATE TABLE spirit_categories CASCADE;
    TRUNCATE TABLE duplicate_matches CASCADE;
    
    -- Clear main tables
    TRUNCATE TABLE spirits CASCADE;
    TRUNCATE TABLE brands CASCADE;
    -- Optional: Keep categories as they're predefined
    -- TRUNCATE TABLE categories CASCADE;
    
    -- Clear any scraping job history if exists
    TRUNCATE TABLE scraping_jobs CASCADE;
    
    -- Re-enable triggers
    ALTER TABLE spirits ENABLE TRIGGER ALL;
    ALTER TABLE brands ENABLE TRIGGER ALL;
    ALTER TABLE categories ENABLE TRIGGER ALL;
END $$;
```

### 2. Clear All Local Caches

Run the cache clearing script:

```bash
npm run clear-caches
```

Or if that script doesn't exist, run:

```bash
npx tsx clear-all-caches.ts
```

This will:
- Remove the `./cache` directory (file-based cache)
- Clear Redis/Upstash cache if configured
- Clear scrape session tracker for all categories
- Remove temporary CSV and JSON files

### 3. Manual Cache Clearing (if needed)

If the script doesn't work, manually clear:

```bash
# Remove cache directory
rm -rf ./cache

# Remove any temporary files
rm -f spirits_*.csv
rm -f deduplication_*.csv
rm -f backup_*.json
rm -f *.cache
rm -f *-cache.json
```

### 4. Verify Everything is Clean

1. **Check Database**: Run this query in Supabase:
   ```sql
   SELECT 
     (SELECT COUNT(*) FROM spirits) as spirits_count,
     (SELECT COUNT(*) FROM brands) as brands_count,
     (SELECT COUNT(*) FROM spirit_categories) as spirit_categories_count;
   ```
   All counts should be 0.

2. **Check Local Files**: Ensure no cache directory exists:
   ```bash
   ls -la ./cache
   ```
   Should show "No such file or directory"

### 5. Start Fresh Scraping

Now you can start scraping with a completely clean slate:

```bash
# Test with a small batch first
npm run scrape -- --categories bourbon --limit 10

# If that works well, do a larger scrape
npm run scrape -- --categories bourbon --limit 100
```

## Important Notes

### About Duplicate Detection

When you start fresh:
- The first scrape will store ALL found spirits (no duplicates in DB)
- Subsequent scrapes will check against the database
- The duplicate threshold is 90% similarity (V2.5.3)

### About Caching

The scraper uses multiple cache layers:
1. **Search Result Cache**: Stores Google API responses for 24 hours
2. **Session Tracker**: Remembers what was scraped per category
3. **Redis/Upstash**: If configured, caches search results

Clearing all caches ensures:
- Fresh Google API calls (uses your quota)
- No memory of previous scrapes
- Clean duplicate detection (only checks database)

### Tips for Fresh Start

1. **Start Small**: Test with 10-20 spirits first
2. **Check Quality**: Verify the data looks good before large scrapes
3. **Monitor API Usage**: Fresh starts use more Google API calls
4. **Run Deduplication**: After initial scrapes, use `npm run dedup`

## Troubleshooting

### "Duplicate spirit found" on fresh database
- The spirit might genuinely be returned multiple times by Google
- Check if the same product appears on multiple retailer sites

### Cache not clearing properly
- Check file permissions on cache directory
- Ensure Redis/Upstash credentials are correct
- Try manual deletion of cache files

### Database not clearing
- Check you have proper permissions in Supabase
- Ensure no active connections are blocking the TRUNCATE
- Try clearing tables one by one if the DO block fails

## Package.json Script Addition

Add this to your package.json scripts:

```json
"clear-caches": "tsx clear-all-caches.ts"
```

Then you can simply run: `npm run clear-caches`