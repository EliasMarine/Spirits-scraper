-- V2.5.3 Database Cleanup for Supabase SQL Editor
-- Fixes existing database issues preventing new spirits from being stored

DO $$
DECLARE
    -- Variables for tracking progress
    v_empty_parentheses_before INT;
    v_empty_parentheses_after INT;
    v_poor_brands_before INT;
    v_poor_brands_after INT;
    v_brands_fixed INT := 0;
    v_names_fixed INT := 0;
    v_temp_count INT;
BEGIN
    -- Step 1: Count initial problems
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
    
    -- Step 2: Fix empty parentheses
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
    
    -- Step 3: Fix brand names (using temporary variable for each update)
    UPDATE spirits SET brand = 'W.L. Weller' WHERE brand = 'w l';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'E.H. Taylor' WHERE brand = 'e h';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'I.W. Harper' WHERE brand = 'i w';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Michter''s' WHERE brand = 'michter s';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Buffalo Trace' WHERE brand = 'buffalo trace';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Four Roses' WHERE brand = 'four roses';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Wild Turkey' WHERE brand = 'wild turkey';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Russell''s Reserve' WHERE brand = 'russell s reserve';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Maker''s Mark' WHERE brand = 'maker s mark';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Jack Daniel''s' WHERE brand IN ('jack daniels', 'jack daniel s');
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'George T. Stagg' WHERE brand = 'george t stagg';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Old Grand-Dad' WHERE brand = 'old grand dad';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'The Last Drop' WHERE brand IN ('the last', 'the last drop');
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Suntory' WHERE brand = 'suntory ao';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Corazon' WHERE brand = 'corazon expressiones';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'High West' WHERE brand = 'high west';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Angel''s Envy' WHERE brand = 'angel s envy';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Elijah Craig' WHERE brand = 'elijah craig';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Heaven Hill' WHERE brand = 'heaven hill';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Joseph Magnus' WHERE brand = 'joseph magnus';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Kentucky Owl' WHERE brand = 'kentucky owl';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'WhistlePig' WHERE brand IN ('whistle pig', 'whistlepig');
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'George Dickel' WHERE brand = 'george dickel';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Woodford Reserve' WHERE brand = 'woodford reserve';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Knob Creek' WHERE brand = 'knob creek';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Jim Beam' WHERE brand = 'jim beam';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Bulleit' WHERE brand = 'bulleit';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'Eagle Rare' WHERE brand = 'eagle rare';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    -- Step 4: Count problems after fixes
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
    
    -- Create a summary table to show results (since RAISE NOTICE doesn't work)
    CREATE TEMP TABLE v253_cleanup_summary (
        metric TEXT,
        before_count INT,
        after_count INT,
        fixed_count INT
    );
    
    INSERT INTO v253_cleanup_summary VALUES 
        ('Empty Parentheses in Names', v_empty_parentheses_before, v_empty_parentheses_after, v_names_fixed),
        ('Poor Brand Names', v_poor_brands_before, v_poor_brands_after, v_brands_fixed),
        ('Total Issues Fixed', v_empty_parentheses_before + v_poor_brands_before, v_empty_parentheses_after + v_poor_brands_after, v_names_fixed + v_brands_fixed);
    
    -- Create sample table of fixed spirits
    CREATE TEMP TABLE v253_sample_spirits AS
    SELECT name, brand, type
    FROM spirits
    WHERE brand IN ('W.L. Weller', 'Buffalo Trace', 'Michter''s', 'E.H. Taylor', 
                    'I.W. Harper', 'Russell''s Reserve', 'Maker''s Mark')
    ORDER BY brand, name
    LIMIT 20;
    
END $$;

-- Show the results
SELECT * FROM v253_cleanup_summary;

-- Show sample of cleaned spirits
SELECT * FROM v253_sample_spirits;

-- Clean up temp tables
DROP TABLE IF EXISTS v253_cleanup_summary;
DROP TABLE IF EXISTS v253_sample_spirits;