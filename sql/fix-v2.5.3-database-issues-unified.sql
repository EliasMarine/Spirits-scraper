-- V2.5.3 Database Cleanup - Unified Script for Supabase
-- This script fixes existing database issues that are preventing new spirits from being stored

DO $$
DECLARE
    -- Variables for tracking progress
    v_empty_parentheses_before INT;
    v_empty_parentheses_after INT;
    v_poor_brands_before INT;
    v_poor_brands_after INT;
    v_brands_fixed INT := 0;
    v_names_fixed INT := 0;
    
    -- Sample data for verification
    v_sample_spirits RECORD;
    v_sample_count INT := 0;
BEGIN
    -- Start transaction
    RAISE NOTICE 'Starting V2.5.3 database cleanup...';
    RAISE NOTICE '========================================';
    
    -- Step 1: Count initial problems
    RAISE NOTICE 'Step 1: Analyzing current database issues...';
    
    SELECT COUNT(*) INTO v_empty_parentheses_before
    FROM spirits
    WHERE name LIKE '% ()%' OR name LIKE '% ( )%' OR name LIKE '% (  )%';
    
    SELECT COUNT(*) INTO v_poor_brands_before
    FROM spirits
    WHERE brand IN ('w l', 'e h', 'i w', 'michter s', 'suntory ao', 'corazon expressiones',
                   'buffalo trace', 'four roses', 'wild turkey', 'russell s reserve',
                   'maker s mark', 'jack daniels', 'jack daniel s', 'george t stagg',
                   'old grand dad', 'the last', 'the last drop', 'high west',
                   'angel s envy', 'elijah craig', 'heaven hill', 'joseph magnus',
                   'kentucky owl', 'whistle pig', 'whistlepig', 'george dickel',
                   'woodford reserve', 'knob creek', 'jim beam', 'bulleit', 'eagle rare');
    
    RAISE NOTICE 'Found % spirits with empty parentheses', v_empty_parentheses_before;
    RAISE NOTICE 'Found % spirits with poorly extracted brands', v_poor_brands_before;
    
    -- Step 2: Fix empty parentheses
    RAISE NOTICE '';
    RAISE NOTICE 'Step 2: Removing empty parentheses from spirit names...';
    
    UPDATE spirits
    SET name = TRIM(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(name, '\(\s*\)', '', 'g'),  -- Remove ( ) with any spaces
                    '\[\s*\]', '', 'g'                         -- Remove [ ] with any spaces
                ),
                '\{\s*\}', '', 'g'                             -- Remove { } with any spaces
            ),
            '\s{2,}', ' ', 'g'                                 -- Collapse multiple spaces
        )
    )
    WHERE name ~ '[\(\[\{]\s*[\)\]\}]';  -- Match any empty bracket pattern
    
    GET DIAGNOSTICS v_names_fixed = ROW_COUNT;
    RAISE NOTICE 'Fixed % spirit names', v_names_fixed;
    
    -- Step 3: Fix brand names
    RAISE NOTICE '';
    RAISE NOTICE 'Step 3: Fixing poorly extracted brand names...';
    
    -- Fix each brand with proper capitalization and punctuation
    UPDATE spirits SET brand = 'W.L. Weller' WHERE brand = 'w l';
    GET DIAGNOSTICS v_brands_fixed = ROW_COUNT;
    
    UPDATE spirits SET brand = 'E.H. Taylor' WHERE brand = 'e h';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'I.W. Harper' WHERE brand = 'i w';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Michter''s' WHERE brand = 'michter s';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Buffalo Trace' WHERE brand = 'buffalo trace';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Four Roses' WHERE brand = 'four roses';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Wild Turkey' WHERE brand = 'wild turkey';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Russell''s Reserve' WHERE brand = 'russell s reserve';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Maker''s Mark' WHERE brand = 'maker s mark';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Jack Daniel''s' WHERE brand IN ('jack daniels', 'jack daniel s');
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'George T. Stagg' WHERE brand = 'george t stagg';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Old Grand-Dad' WHERE brand = 'old grand dad';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'The Last Drop' WHERE brand IN ('the last', 'the last drop');
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Suntory' WHERE brand = 'suntory ao';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Corazon' WHERE brand = 'corazon expressiones';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'High West' WHERE brand = 'high west';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Angel''s Envy' WHERE brand = 'angel s envy';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Elijah Craig' WHERE brand = 'elijah craig';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Heaven Hill' WHERE brand = 'heaven hill';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Joseph Magnus' WHERE brand = 'joseph magnus';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Kentucky Owl' WHERE brand = 'kentucky owl';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'WhistlePig' WHERE brand IN ('whistle pig', 'whistlepig');
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'George Dickel' WHERE brand = 'george dickel';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Woodford Reserve' WHERE brand = 'woodford reserve';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Knob Creek' WHERE brand = 'knob creek';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Jim Beam' WHERE brand = 'jim beam';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Bulleit' WHERE brand = 'bulleit';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    UPDATE spirits SET brand = 'Eagle Rare' WHERE brand = 'eagle rare';
    GET DIAGNOSTICS v_brands_fixed = v_brands_fixed + ROW_COUNT;
    
    RAISE NOTICE 'Fixed % brand names', v_brands_fixed;
    
    -- Step 4: Verify fixes
    RAISE NOTICE '';
    RAISE NOTICE 'Step 4: Verifying cleanup results...';
    
    SELECT COUNT(*) INTO v_empty_parentheses_after
    FROM spirits
    WHERE name LIKE '% ()%' OR name LIKE '% ( )%' OR name LIKE '% (  )%';
    
    SELECT COUNT(*) INTO v_poor_brands_after
    FROM spirits
    WHERE brand IN ('w l', 'e h', 'i w', 'michter s', 'suntory ao', 'corazon expressiones',
                   'buffalo trace', 'four roses', 'wild turkey', 'russell s reserve',
                   'maker s mark', 'jack daniels', 'jack daniel s', 'george t stagg',
                   'old grand dad', 'the last', 'the last drop', 'high west',
                   'angel s envy', 'elijah craig', 'heaven hill', 'joseph magnus',
                   'kentucky owl', 'whistle pig', 'whistlepig', 'george dickel',
                   'woodford reserve', 'knob creek', 'jim beam', 'bulleit', 'eagle rare');
    
    RAISE NOTICE 'Empty parentheses: % before → % after', v_empty_parentheses_before, v_empty_parentheses_after;
    RAISE NOTICE 'Poor brands: % before → % after', v_poor_brands_before, v_poor_brands_after;
    
    -- Step 5: Show sample of cleaned data
    RAISE NOTICE '';
    RAISE NOTICE 'Step 5: Sample of cleaned spirits...';
    RAISE NOTICE '----------------------------------------';
    
    FOR v_sample_spirits IN 
        SELECT name, brand, type
        FROM spirits
        WHERE brand IN ('W.L. Weller', 'Buffalo Trace', 'Michter''s', 'E.H. Taylor', 
                       'I.W. Harper', 'Russell''s Reserve', 'Maker''s Mark')
        ORDER BY brand, name
        LIMIT 20
    LOOP
        v_sample_count := v_sample_count + 1;
        RAISE NOTICE '% | % | %', 
            RPAD(v_sample_spirits.brand, 20), 
            RPAD(SUBSTRING(v_sample_spirits.name, 1, 40), 40),
            v_sample_spirits.type;
    END LOOP;
    
    -- Final summary
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'V2.5.3 Database Cleanup Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Fixed % spirit names with empty parentheses', v_names_fixed;
    RAISE NOTICE '  - Fixed % brand names', v_brands_fixed;
    RAISE NOTICE '  - Empty parentheses remaining: %', v_empty_parentheses_after;
    RAISE NOTICE '  - Poor brand names remaining: %', v_poor_brands_after;
    RAISE NOTICE '';
    RAISE NOTICE 'The database is now ready for the V2.5.3 scraper!';
    RAISE NOTICE 'New spirits should no longer be rejected as duplicates.';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
        RAISE NOTICE 'Rolling back changes...';
        RAISE;
END $$;