-- V2.7.2 Database Cleanup Script
-- Removes event/competition/gift entries and other non-product content
-- IMPORTANT: Run with caution! Always backup first.

BEGIN;

-- Create temporary table to store IDs of entries to delete
CREATE TEMP TABLE event_garbage_spirits AS
SELECT id, name, brand, type, data_quality_score, created_at
FROM spirits
WHERE 
  -- Event/Competition/Awards patterns
  name ~* '\b(party|parties|challenge|winners?|competition|awards?|according\s+to|world''?s?\s+best)\b'
  OR name ~* '\b(cocktail\s+challenge|bourbon\s+classic|release\s+party)\b'
  OR name ~* '\b(award\s+winners?|colonel\s+award|san\s+francisco\s+world\s+spirits)\b'
  OR name ~* '\btickets?\s+(sat|sun|mon|tue|wed|thu|fri)\b'
  OR name ~* '\bspecial\s+guests?\b'
  
  -- Gift/Promotional patterns
  OR name ~* '\b(gift|gifts|guide|father''?s?\s+day|mother''?s?\s+day|holiday|christmas|valentine)\b'
  OR name ~* '\b(gift\s+box|gift\s+set|gift\s+guide|gift\s+ideas?)\b'
  OR name ~* '\b\d{4}\s+(gift|holiday)\s+(guide|ideas?)\b'
  OR name ~* '\bthe\s+best\s+\w+\s+for\s+dad\b'
  
  -- Store/Mission content
  OR name ~* '\b(mission\s+wine|wine\s*(&|and)?\s*spirits?|liquor\s+store)\b'
  OR name ~* '\bmission\s*$'  -- Names ending with "Mission"
  OR name ~* '\bwine\s*$'     -- Names ending with "Wine"
  OR name ~* '\s+(&|and)\s*$' -- Names ending with "&" or "and"
  
  -- School/Non-spirit references
  OR name ~* '\b(schools?|county\s+schools?|education|students?|university)\b'
  OR name ~* '\b(bourbon\s+county\s+schools?)\b'
  
  -- Truncated/Malformed names
  OR name ~* '(&|\.{3}|\.\.\.|…)\s*$'  -- Ending with & or ... or …
  OR name ~* '\s+(whisk|bour|scot|tequ)\s*$'  -- Truncated spirit types at end
  
  -- Low quality scores (V2.7.2: increased threshold)
  OR data_quality_score < 75
  
  -- Generic single-word brands
  OR brand ~* '^(the|unknown|our|new|colonel|award|father''?s?|mother''?s?|world''?s?)$'
  
  -- Malformed possessive brands
  OR brand ~* '[''´`]S$'  -- Father'S, World'S, etc.
  
ORDER BY created_at DESC;

-- Show what will be deleted
SELECT COUNT(*) as total_event_garbage_entries FROM event_garbage_spirits;

-- Show breakdown by pattern type
SELECT 
  CASE 
    WHEN name ~* '\b(party|challenge|winners?|competition|awards?)\b' THEN 'Event/Competition'
    WHEN name ~* '\b(gift|guide|father''?s?\s+day|holiday)\b' THEN 'Gift/Promotional'
    WHEN name ~* '\b(mission|wine\s*(&|and)?\s*spirits?)\b' THEN 'Store/Mission'
    WHEN name ~* '\b(schools?|education|students?)\b' THEN 'School/Non-spirit'
    WHEN name ~* '(&|\.{3}|\.\.\.|…)\s*$' THEN 'Truncated'
    WHEN data_quality_score < 75 THEN 'Low Quality Score'
    WHEN brand ~* '^(the|unknown|our|new|colonel|award)$' THEN 'Generic Brand'
    ELSE 'Other'
  END as issue_type,
  COUNT(*) as count
FROM event_garbage_spirits
GROUP BY issue_type
ORDER BY count DESC;

-- Show sample of entries that will be deleted
SELECT name, brand, type, data_quality_score 
FROM event_garbage_spirits 
LIMIT 20;

-- Delete the garbage entries
DELETE FROM spirits
WHERE id IN (SELECT id FROM event_garbage_spirits);

-- Fix remaining possessive brand issues
UPDATE spirits
SET brand = REGEXP_REPLACE(brand, '([A-Z][a-z]+)[''´`]S$', '\1''s', 'g')
WHERE brand ~* '[''´`]S$';

-- Normalize brand apostrophes
UPDATE spirits
SET brand = REGEXP_REPLACE(brand, '[''´`]', '''', 'g')
WHERE brand ~* '[''´`]';

-- Fix names with store suffixes still present
UPDATE spirits
SET name = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '\s+mission\s*$', '', 'i'),
      '\s+wine\s*$', '', 'i'
    ),
    '\s+(&|and)\s*$', '', 'i'
  ),
  '\s+(\.{3}|\.\.\.|…)\s*$', '', 'i'
)
WHERE name ~* '(mission|wine|&|and|\.{3}|\.\.\.|…)\s*$';

-- Clean up descriptions with store disclaimers
UPDATE spirits
SET description = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      description,
      'The products sold on .* are intended for adults only.*$', '', 'i'
    ),
    'By entering, you certify that you are.*$', '', 'i'
  ),
  'Visit our .* online store.*$', '', 'i'
)
WHERE description ~* '(adults only|certify that you are|visit our.*store)';

-- Show summary of changes
SELECT 
  (SELECT COUNT(*) FROM event_garbage_spirits) as deleted_count,
  (SELECT COUNT(*) FROM spirits WHERE brand ~* '[''´`]S$') as possessive_brands_fixed,
  (SELECT COUNT(*) FROM spirits WHERE name ~* '(mission|wine|&)\s*$') as suffixes_fixed,
  (SELECT COUNT(*) FROM spirits) as total_spirits_remaining;

COMMIT;

-- Verify cleanup results
SELECT COUNT(*) as total_spirits_after_cleanup FROM spirits;

-- Check for any remaining problematic entries
SELECT name, brand, type, data_quality_score
FROM spirits
WHERE 
  name ~* '\b(party|challenge|winners?|gift|mission\s*$|wine\s*$)\b'
  OR brand ~* '[''´`]S$'
  OR data_quality_score < 75
LIMIT 20;