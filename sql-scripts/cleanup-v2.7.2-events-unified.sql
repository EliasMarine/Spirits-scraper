-- V2.7.2 Database Cleanup Script (Unified for Supabase SQL Editor)
-- Removes event/competition/gift entries and other non-product content
-- IMPORTANT: Run with caution! Always backup first.

DO $$
DECLARE
    deleted_count INTEGER;
    possessive_fixed_count INTEGER;
    suffix_fixed_count INTEGER;
    description_fixed_count INTEGER;
    total_remaining INTEGER;
    r RECORD;
BEGIN
    RAISE NOTICE 'Starting V2.7.2 cleanup process...';

    -- Create temporary table to store IDs of entries to delete
    RAISE NOTICE 'Creating temporary table of problematic entries...';
    CREATE TEMP TABLE IF NOT EXISTS event_garbage_spirits AS
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

    -- Get counts before deletion
    SELECT COUNT(*) INTO deleted_count FROM event_garbage_spirits;
    RAISE NOTICE 'Found % entries to delete', deleted_count;

    -- Show breakdown by pattern type
    RAISE NOTICE 'Breakdown by issue type:';
    FOR r IN 
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
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '  - %: % entries', r.issue_type, r.count;
    END LOOP;

    -- Delete the garbage entries
    IF deleted_count > 0 THEN
        RAISE NOTICE 'Deleting % garbage entries...', deleted_count;
        DELETE FROM spirits
        WHERE id IN (SELECT id FROM event_garbage_spirits);
        RAISE NOTICE 'Deletion complete';
    ELSE
        RAISE NOTICE 'No entries to delete';
    END IF;

    -- Fix remaining possessive brand issues
    RAISE NOTICE 'Fixing malformed possessive brands...';
    UPDATE spirits
    SET brand = REGEXP_REPLACE(brand, '([A-Z][a-z]+)[''´`]S$', '\1''s', 'g')
    WHERE brand ~* '[''´`]S$';
    GET DIAGNOSTICS possessive_fixed_count = ROW_COUNT;
    RAISE NOTICE 'Fixed % possessive brands', possessive_fixed_count;

    -- Normalize brand apostrophes
    RAISE NOTICE 'Normalizing brand apostrophes...';
    UPDATE spirits
    SET brand = REGEXP_REPLACE(brand, '[''´`]', '''', 'g')
    WHERE brand ~* '[''´`]';

    -- Fix names with store suffixes still present
    RAISE NOTICE 'Removing store suffixes from names...';
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
    GET DIAGNOSTICS suffix_fixed_count = ROW_COUNT;
    RAISE NOTICE 'Fixed % names with store suffixes', suffix_fixed_count;

    -- Clean up descriptions with store disclaimers
    RAISE NOTICE 'Cleaning up store disclaimers in descriptions...';
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
    GET DIAGNOSTICS description_fixed_count = ROW_COUNT;
    RAISE NOTICE 'Fixed % descriptions', description_fixed_count;

    -- Get final count
    SELECT COUNT(*) INTO total_remaining FROM spirits;

    -- Summary
    RAISE NOTICE '==== V2.7.2 Cleanup Summary ====';
    RAISE NOTICE 'Deleted entries: %', deleted_count;
    RAISE NOTICE 'Fixed possessive brands: %', possessive_fixed_count;
    RAISE NOTICE 'Fixed name suffixes: %', suffix_fixed_count;
    RAISE NOTICE 'Fixed descriptions: %', description_fixed_count;
    RAISE NOTICE 'Total spirits remaining: %', total_remaining;
    RAISE NOTICE '================================';

    -- Drop temporary table
    DROP TABLE IF EXISTS event_garbage_spirits;
    
    RAISE NOTICE 'V2.7.2 cleanup completed successfully!';
END $$;

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