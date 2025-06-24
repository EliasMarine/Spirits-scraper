-- V2.7.1 Database Cleanup Script
-- Removes garbage entries identified during analysis
-- IMPORTANT: Run with caution! Always backup first.

BEGIN;

-- Create temporary table to store IDs of entries to delete
CREATE TEMP TABLE garbage_spirits AS
SELECT id, name, brand, type, created_at
FROM spirits
WHERE 
  -- Generic age-only patterns
  name ~* '^\d+\s+year\s+old\s+(whisky|whiskey|bourbon|rum|gin|vodka|tequila)$'
  
  -- Fragment patterns and too short
  OR name ~* '^type\.\s+\w+$'
  OR LENGTH(name) < 10
  OR name ~* '^[a-z]{2,5}\s+[a-z]{2,5}$'  -- "Bcn Gin", "Gin Under"
  
  -- Repeated spirit type words
  OR name ~* '\b(whiskey|whisky|bourbon|rum|gin|vodka|tequila|mezcal|cognac)\s+\1\b'
  
  -- Navigation/store prefixes
  OR name ~* '^our\s+(bourbon|whiskey|collection|selection|range|products?)\b'
  OR name ~* '^new\s+products\b'
  OR name ~* '^latest\s+whisk'
  
  -- HTML/markup artifacts
  OR name ~* '<[^>]+>'
  OR name ~* '\\["\']'
  OR name ~* '&[a-z]+;'
  OR name ~* 'pmeta\s+charset'
  OR name ~* '\bstrong\s*Please\s+note\b'
  
  -- Menu/listing items with price
  OR name ~* '\$\d+\.?\d*\s*\/\s*\d+\s*ml'
  OR name ~* '^\w+\s*&\s*(bourbon|whiskey|whisky)\.\s*'
  
  -- Store language in names
  OR name ~* '\b(shop|buy)\s+(today|now|online|all)\b'
  OR name ~* '\bsimilar\s+products\b'
  OR name ~* '\bexplore\s+related\s+collections\b'
  
  -- Invalid brands
  OR brand ~* '^(unknown|type\.|our|new|[0-9]+|bcn gin|gin under)$'
ORDER BY created_at DESC;

-- Show what will be deleted
SELECT COUNT(*) as total_garbage_entries FROM garbage_spirits;

-- Show sample of entries that will be deleted
SELECT * FROM garbage_spirits LIMIT 20;

-- Delete the garbage entries
DELETE FROM spirits
WHERE id IN (SELECT id FROM garbage_spirits);

-- Fix spacing issues in remaining entries
UPDATE spirits
SET name = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(name, '\bNe\s+Lson\b', 'Nelson', 'gi'),
            '\bMc\s+Kenzie\b', 'McKenzie', 'gi'
          ),
          '\bDoub\s+Le\b', 'Double', 'gi'
        ),
        '\bGo\s+Ld\b', 'Gold', 'gi'
      ),
      '\bMeda\s+L\b', 'Medal', 'gi'
    ),
    '\bC\s+Lassic\b', 'Classic', 'gi'
  ),
  '\b([A-Z])\s+([a-z]{1,4})\b', '\1\2', 'g'
)
WHERE name ~* '\b[A-Z]\s+[a-z]{1,4}\b'
AND name !~* '\b(La|Le|De|Di|Du|Van|Von|Mac|Mc|St)\s+';

-- Remove duplicate spirit type words
UPDATE spirits
SET name = REGEXP_REPLACE(name, '\b(whiskey|whisky|bourbon|rum|gin|vodka|tequila)\s+\1\b', '\1', 'gi')
WHERE name ~* '\b(whiskey|whisky|bourbon|rum|gin|vodka|tequila)\s+\1\b';

-- Fix "Bourbon Whiskey Whiskey" patterns
UPDATE spirits
SET name = REGEXP_REPLACE(name, '\b(bourbon\s+whiskey)\s+whiskey\b', '\1', 'gi')
WHERE name ~* '\b(bourbon\s+whiskey)\s+whiskey\b';

UPDATE spirits
SET name = REGEXP_REPLACE(name, '\b(rye\s+whiskey)\s+whiskey\b', '\1', 'gi')
WHERE name ~* '\b(rye\s+whiskey)\s+whiskey\b';

-- Remove HTML from descriptions
UPDATE spirits
SET description = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(description, '<[^>]+>', '', 'g'),
    '\\["\']', '', 'g'
  ),
  '&[a-z]+;', '', 'gi'
)
WHERE description ~* '(<[^>]+>|\\["\']|&[a-z]+;)';

-- Clean up store language from descriptions
UPDATE spirits
SET description = REGEXP_REPLACE(description, '\b(shop|buy)\s+(today|now|online)\b.*$', '', 'gi')
WHERE description ~* '\b(shop|buy)\s+(today|now|online)\b';

UPDATE spirits
SET description = REGEXP_REPLACE(description, '\bsimilar\s+products.*$', '', 'gi')
WHERE description ~* '\bsimilar\s+products\b';

-- Show summary of changes
SELECT 
  (SELECT COUNT(*) FROM garbage_spirits) as deleted_count,
  (SELECT COUNT(*) FROM spirits WHERE name ~* '\b[A-Z]\s+[a-z]{1,4}\b') as spacing_issues_remaining,
  (SELECT COUNT(*) FROM spirits WHERE name ~* '\b(whiskey|whisky|bourbon)\s+\1\b') as duplicate_words_remaining,
  (SELECT COUNT(*) FROM spirits WHERE description ~* '<[^>]+>') as html_in_descriptions_remaining;

COMMIT;

-- Verify cleanup results
SELECT COUNT(*) as total_spirits_after_cleanup FROM spirits;

-- Show some cleaned entries
SELECT id, name, brand, type 
FROM spirits 
WHERE name ~* '(nelson|mckenzie|double|gold|medal)'
LIMIT 10;