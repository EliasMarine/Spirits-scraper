-- Fix Generic Spirits in Database
-- This script identifies and removes generic search terms that were incorrectly stored as spirit names

-- First, let's identify the problematic entries
-- These are spirits with names that look like search queries rather than actual products

-- Create a temporary table to store spirits that need review
CREATE TEMP TABLE IF NOT EXISTS generic_spirits AS
WITH suspicious_spirits AS (
  SELECT 
    id,
    name,
    brand,
    created_at,
    -- Flag patterns that indicate generic search terms
    CASE 
      WHEN name ~* '^(budget|value|premium|mid-range|luxury|ultra-premium)\s+(wheated|high rye|traditional)?\s*(bourbon|whiskey|whisky|scotch|vodka|gin|rum|tequila)' THEN 'price_descriptor_pattern'
      WHEN name ~* '^\d+\s+year\s+old\s+(wheated|high rye|traditional)?\s*(bourbon|whiskey|whisky|scotch)' THEN 'age_only_pattern'
      WHEN name ~* '^(smooth|spicy|sweet|complex|rich|mellow)\s+(bourbon|whiskey|whisky|scotch|vodka|gin|rum)' THEN 'flavor_descriptor_pattern'
      WHEN name ~* '^(bourbon|whiskey|whisky|scotch|vodka|gin|rum|tequila)\s+(catalog|collection|list|selection|inventory)\s+page\s+\d+' THEN 'catalog_page_pattern'
      WHEN name ~* '^(online|buy|best|top|premium)\s+(bourbon|whiskey|whisky|scotch|vodka|gin|rum|tequila)\s+(store|shop|catalog)' THEN 'store_search_pattern'
      WHEN name ~* '^(bourbon|whiskey|whisky|scotch|vodka|gin|rum|tequila)\s+under\s+\$\d+' THEN 'price_search_pattern'
      WHEN name ~* '^(new|latest|upcoming)\s+(bourbon|whiskey|whisky|scotch|vodka|gin|rum|tequila)\s+releases?' THEN 'release_search_pattern'
      WHEN brand IS NULL AND name ~* '^(bourbon|whiskey|whisky|scotch|vodka|gin|rum|tequila)\s+(reviews?|ratings?|guide|comparison)' THEN 'review_search_pattern'
    END AS pattern_type
  FROM spirits
  WHERE 
    -- Focus on recent entries (likely from the problematic scraping)
    created_at > NOW() - INTERVAL '7 days'
    -- And entries that have suspiciously generic names
    AND (
      -- No brand and generic category name
      (brand IS NULL AND name ~* '^(budget|value|premium|mid-range|luxury|ultra-premium|smooth|spicy|sweet|complex|rich|mellow)')
      -- Or matches common search query patterns
      OR name ~* '(catalog|collection|list|selection|inventory)\s+page\s+\d+'
      OR name ~* '^(online|buy|best|top|premium)\s+.+\s+(store|shop|catalog)'
      OR name ~* '\s+under\s+\$\d+'
      OR name ~* '^(new|latest|upcoming)\s+.+\s+releases?'
      -- Or is just age + category with no actual product name
      OR (name ~* '^\d+\s+year\s+old\s+' AND brand IS NULL)
    )
)
SELECT * FROM suspicious_spirits WHERE pattern_type IS NOT NULL;

-- Show summary of problematic entries
SELECT 
  pattern_type,
  COUNT(*) as count,
  ARRAY_AGG(name ORDER BY name LIMIT 5) as example_names
FROM generic_spirits
GROUP BY pattern_type
ORDER BY count DESC;

-- Show total count
SELECT COUNT(*) as total_generic_spirits FROM generic_spirits;

-- List all generic spirits for review
SELECT 
  id,
  name,
  brand,
  pattern_type,
  created_at
FROM generic_spirits
ORDER BY pattern_type, name
LIMIT 100;

-- To delete these entries (uncomment and run after review):
/*
DELETE FROM spirits
WHERE id IN (SELECT id FROM generic_spirits);

-- Show deletion summary
SELECT 'Deleted ' || COUNT(*) || ' generic spirit entries' as result
FROM generic_spirits;
*/

-- Additional check: Find spirits with no useful data
-- These are entries that have generic names AND lack other identifying information
SELECT 
  id,
  name,
  brand,
  description,
  image_url,
  abv,
  price_range
FROM spirits
WHERE 
  created_at > NOW() - INTERVAL '7 days'
  AND (
    -- Generic name patterns
    name ~* '^(budget|value|premium|mid-range|luxury|ultra-premium)\s+'
    OR name ~* '^\d+\s+year\s+old\s+'
    OR name ~* '^(smooth|spicy|sweet|complex|rich|mellow)\s+'
  )
  AND (
    -- And lacking real product data
    (description IS NULL OR LENGTH(description) < 20)
    AND image_url IS NULL
    AND abv IS NULL
    AND price_range IS NULL
  )
ORDER BY created_at DESC
LIMIT 50;