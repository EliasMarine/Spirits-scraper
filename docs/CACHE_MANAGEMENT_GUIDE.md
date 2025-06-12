# Cache Management Guide for Fresh Scans

## Quick Commands for Fresh Scanning

### 1. Clear All Cache Before Scanning
```bash
# Clear everything and start fresh
npm run clear-cache-all
npm run scrape -- --categories bourbon --limit 50

# Or do it in one command
npm run scrape -- --clear-cache --categories bourbon --limit 50
```

### 2. Force Fresh API Calls (Without Clearing Cache)
```bash
# Bypass cache completely - good for testing
npm run scrape -- --force-refresh --categories bourbon --limit 50
```

### 3. Clear Specific Cache Types
```bash
# Clear only search queries (keeps spirit data)
npm run cache -- --clear-type search_query

# Clear only spirit data (keeps search queries)
npm run cache -- --clear-type spirit_data

# Clear URL content cache
npm run cache -- --clear-type url_content
```

### 4. Use Diversified Queries (Avoid Cache Naturally)
```bash
# Generate unique queries that won't hit cache
npm run scrape -- --diversify-queries --diversity-level high --categories bourbon --limit 100
```

### 5. Comprehensive Fresh Scan Strategy
```bash
# The ultimate fresh scan approach:
npm run clear-cache-all                     # 1. Clear all cache
npm run scrape -- \
  --categories bourbon \
  --limit 100 \
  --diversify-queries \                      # 2. Use diverse queries
  --diversity-level high \                   # 3. Maximum diversity
  --force-refresh                            # 4. Bypass any remaining cache
```

## Cache Types Explained

1. **search_query** - Cached Google search results
   - TTL: 7 days for successful, 2 days for empty results
   - Clear this when: You want fresh search results from Google

2. **spirit_data** - Cached spirit extraction data
   - TTL: 7 days default
   - Clear this when: You've improved extraction logic

3. **url_content** - Cached webpage content
   - TTL: 12 hours default
   - Clear this when: Websites have updated content

4. **failed_attempt** - Failed extraction attempts
   - TTL: 4 hours default
   - Clear this when: You've fixed extraction issues

## When to Clear Cache

### Clear Everything When:
- Testing new extraction algorithms
- Debugging data quality issues
- Starting a fresh comprehensive scan
- After fixing major bugs

### Clear Search Queries When:
- Google might have new/better results
- You've improved query generation
- Testing API efficiency improvements

### Clear Spirit Data When:
- You've enhanced the extraction logic
- Fixed type detection issues
- Improved data quality algorithms

## Cache Statistics

Check what's in cache before clearing:
```bash
npm run cache -- --stats
```

Output shows:
- Total entries by type
- Cache size in KB
- Oldest/newest entries
- Redis connection status

## Performance Tips

1. **For Maximum Fresh Results**:
   ```bash
   npm run clear-cache-all && npm run scrape -- --force-refresh --diversify-queries --limit 100
   ```

2. **For Testing Query Efficiency**:
   ```bash
   npm run cache -- --clear-type search_query
   npm run scrape -- --categories bourbon --limit 50
   ```

3. **For Re-processing Existing Data**:
   ```bash
   npm run cache -- --clear-type spirit_data
   npm run scrape -- --categories bourbon --limit 50
   ```

## Upstash Redis Notes

- Cache is stored in Upstash Redis (serverless)
- Keys are namespaced: `spirits-scraper:{type}:{key}`
- TTL-based expiration is automatic
- No manual cleanup needed for expired entries

## Troubleshooting

If cache isn't clearing:
1. Check Redis connection: `npm run stats`
2. Try force refresh: `--force-refresh`
3. Check Upstash dashboard for key count
4. Verify environment variables are set