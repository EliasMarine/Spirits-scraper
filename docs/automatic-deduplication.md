# Automatic Deduplication Guide

The spirits scraper includes an intelligent automatic deduplication system that runs after each scraping session to maintain data quality.

## Overview

Automatic deduplication helps:
- **Prevent duplicate entries** from accumulating in your database
- **Merge similar products** that have minor text variations
- **Maintain data quality** without manual intervention
- **Save storage space** and improve search performance

## How It Works

### 1. **Triggered Automatically**
After each scraping session, if you've scraped 10 or more spirits (configurable), the deduplication process runs automatically.

### 2. **Two-Stage Process**
The system uses a two-stage approach:

#### Stage 1: Exact Match Deduplication
- Groups spirits by normalized names (ignoring size, marketing text, year variants)
- Identifies exact duplicates with high confidence
- Auto-merges duplicates with 95%+ confidence

#### Stage 2: Fuzzy Match Deduplication  
- Uses TF-IDF vectorization and fuzzy matching algorithms
- Identifies near-duplicates with text variations
- Applies different thresholds for same-brand (70%) vs different-brand (85%) items

### 3. **Smart Merging**
When duplicates are found, the system:
- Keeps the spirit with the most complete data
- Merges missing fields from duplicates
- Preserves the best description, images, and metadata
- Deletes redundant entries

## Configuration

### Command-Line Options

```bash
# Disable auto-deduplication for a single run
npm run scrape -- --no-auto-dedup

# Change the threshold for this run
npm run scrape -- --dedup-threshold 25

# View current configuration
npm run auto-dedup-config -- --show

# Disable globally
npm run auto-dedup-config -- --disable

# Change global settings
npm run auto-dedup-config -- --threshold 20
npm run auto-dedup-config -- --same-brand-threshold 0.75
```

### Environment Variables

```bash
# Enable/disable auto-deduplication
AUTO_DEDUP_ENABLED=true

# Minimum spirits before running
AUTO_DEDUP_MIN_SPIRITS=10

# Enable automatic merging
AUTO_DEDUP_AUTO_MERGE=true

# Same-brand similarity threshold
AUTO_DEDUP_SAME_BRAND_THRESHOLD=0.7
```

## Default Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Enabled | true | Auto-deduplication is on by default |
| Min Spirits | 10 | Runs after scraping 10+ spirits |
| Exact Match | true | Runs exact match deduplication |
| Fuzzy Match | true | Runs fuzzy match deduplication |
| Auto Merge | true | Automatically merges high-confidence matches |
| Same Brand Threshold | 70% | Similarity needed for same-brand items |
| Different Brand Threshold | 85% | Similarity needed for different-brand items |
| Auto Merge Confidence | 90% | Minimum confidence for automatic merging |

## Performance Considerations

### Large Datasets
- Fuzzy matching is automatically skipped if processing >500 spirits (configurable)
- Exact matching is always performed as it's fast and accurate
- Processing happens in batches of 100 spirits with delays

### Output

After auto-deduplication runs, you'll see:

```
🔍 Running automatic deduplication...
────────────────────────────────────

📊 Auto-Deduplication Summary
────────────────────────────────────
Duration: 3.45s
Spirits processed: 75

🎯 Exact Matches:
  Groups found: 5
  Merged: 3

🔍 Fuzzy Matches:
  Candidates: 8
  Merged: 2
  Flagged: 6

✨ Total Results:
  Duplicates found: 13
  Spirits merged: 5
```

## Examples of What Gets Caught

### Exact Matches
- "Buffalo Trace Bourbon 750ml" → "Buffalo Trace Bourbon Sample"
- "Maker's Mark Gift Box" → "Maker's Mark"
- "Wild Turkey 101 Proof" → "Wild Turkey 101 Pf"

### Fuzzy Matches
- "E.H. Taylor Small Batch" → "EH Taylor Small Batch"
- "Buffalo Trace Kentucky Straight Bourbon Whiskey" → "Buffalo Trace Bourbon Kentucky Straight Whisky"
- "Maker's Mark" → "Makers Mark" (missing apostrophe)

## Manual Review

Some duplicates are flagged for manual review instead of automatic merging:
- Different age statements (10 Year vs 17 Year)
- Low confidence matches
- Cross-brand potential matches

These are stored in the `duplicate_matches` table for later review.

## Best Practices

1. **Let it run**: The default settings work well for most use cases
2. **Monitor logs**: Check for any errors in auto-deduplication
3. **Review flagged items**: Periodically check items flagged for manual review
4. **Adjust thresholds**: If too many false positives, increase thresholds
5. **Backup first**: Always backup before large scraping sessions

## Troubleshooting

### Auto-deduplication not running?
- Check if you scraped enough spirits (default: 10)
- Verify it's enabled: `npm run auto-dedup-config -- --show`
- Check logs for errors

### Too many false positives?
- Increase same-brand threshold: `--same-brand-threshold 0.8`
- Disable auto-merge: `--auto-merge false`

### Missing obvious duplicates?
- Lower the threshold: `--same-brand-threshold 0.65`
- Ensure fuzzy matching is enabled

## Advanced Configuration

For production environments, you may want to:

1. **Schedule deduplication separately** instead of after each scrape
2. **Increase batch sizes** for better performance
3. **Log results to file** for audit trails
4. **Implement custom merge strategies** for specific brands

See `src/config/auto-dedup-config.ts` for all available options.