-- V2.5.6 Database Cleanup - Unified Script for Supabase SQL Editor
-- Clear the bad data that's blocking new spirits from being stored

DO $$
DECLARE
    spirits_before INTEGER;
    spirits_after INTEGER;
    brands_before INTEGER;
    brands_after INTEGER;
    bad_spirits_count INTEGER;
    bad_brands_deleted INTEGER;
    cleanup_summary TEXT;
BEGIN
    -- Count initial state
    SELECT COUNT(*) INTO spirits_before FROM spirits;
    SELECT COUNT(*) INTO brands_before FROM brands;
    
    -- Count problematic spirits
    SELECT COUNT(*) INTO bad_spirits_count
    FROM spirits 
    WHERE brand IN ('unknown', 'orphan', 'king', 'wild') 
       OR brand IS NULL
       OR name LIKE '%King%Kentucky%'
       OR name LIKE '%Orphan%Barrel%';
    
    -- Delete ALL spirits to start fresh
    -- Since there are only 3 spirits and they have bad data
    DELETE FROM spirits;
    
    -- Delete bad brands and count them
    WITH deleted AS (
        DELETE FROM brands 
        WHERE name IN ('unknown', 'orphan', 'king', 'wild', 'new', 'old')
           OR length(name) < 3
           OR name ~ '^[a-z]' -- starts with lowercase
        RETURNING 1
    )
    SELECT COUNT(*) INTO bad_brands_deleted FROM deleted;
    
    -- Count final state
    SELECT COUNT(*) INTO spirits_after FROM spirits;
    SELECT COUNT(*) INTO brands_after FROM brands;
    
    -- Create summary
    cleanup_summary := format(
        'V2.5.6 Cleanup Complete: Spirits deleted: %s (had %s bad), Brands cleaned: %s bad brands removed (from %s to %s total)',
        spirits_before, 
        bad_spirits_count,
        bad_brands_deleted,
        brands_before,
        brands_after
    );
    
    -- Create a temporary table to show the results (since RAISE NOTICE doesn't work)
    CREATE TEMP TABLE cleanup_results AS
    SELECT 
        cleanup_summary as summary,
        spirits_before as spirits_deleted,
        bad_spirits_count as bad_spirits_found,
        bad_brands_deleted as bad_brands_removed,
        brands_before as brands_before_cleanup,
        brands_after as brands_after_cleanup,
        NOW() as cleanup_time;
END $$;

-- Display combined results in a single query (Supabase only shows the last SELECT)
WITH cleanup_info AS (
    SELECT * FROM cleanup_results
),
remaining_brands AS (
    SELECT 
        COUNT(*) as remaining_count,
        string_agg(name, ', ' ORDER BY name) as sample_brands
    FROM (
        SELECT name FROM brands ORDER BY name LIMIT 10
    ) b
)
SELECT 
    ci.summary,
    ci.spirits_deleted,
    ci.bad_spirits_found,
    ci.bad_brands_removed,
    ci.brands_before_cleanup,
    ci.brands_after_cleanup,
    rb.remaining_count as brands_remaining,
    COALESCE(rb.sample_brands, 'None') as remaining_brand_names,
    ci.cleanup_time
FROM cleanup_info ci
CROSS JOIN remaining_brands rb;