-- V2.5.3 Database Cleanup for Supabase - Handles Brand Slug Conflicts
-- This version fixes the ensure_brand_exists trigger and cleans up existing data

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
    -- First, disable the trigger that's causing problems
    ALTER TABLE spirits DISABLE TRIGGER ensure_spirit_brand_exists;
    
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
    
    -- Step 2: Clean up the brands table first
    -- Merge duplicate Michter's entries
    UPDATE spirits SET brand = 'Michter''s' WHERE brand = 'michter''s';
    UPDATE spirits SET brand = 'Michter''s' WHERE brand = 'michter s';
    
    -- Delete the duplicate brand entries (keep the one with apostrophe)
    DELETE FROM brands WHERE name = 'michter s' AND EXISTS (SELECT 1 FROM brands WHERE name = 'michter''s');
    
    -- Update the slug for brands with apostrophes to use proper slug format
    UPDATE brands SET slug = 'michters' WHERE name = 'Michter''s';
    UPDATE brands SET slug = 'russells-reserve' WHERE name = 'Russell''s Reserve' OR name = 'russell''s reserve';
    UPDATE brands SET slug = 'makers-mark' WHERE name = 'Maker''s Mark' OR name = 'maker''s mark';
    UPDATE brands SET slug = 'angels-envy' WHERE name = 'Angel''s Envy' OR name = 'angel''s envy';
    UPDATE brands SET slug = 'jack-daniels' WHERE name = 'Jack Daniel''s' OR name = 'jack daniel''s';
    
    -- Step 3: Fix empty parentheses
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
    
    -- Step 4: Fix brand names (using temporary variable for each update)
    UPDATE spirits SET brand = 'W.L. Weller' WHERE brand = 'w l';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'E.H. Taylor' WHERE brand = 'e h';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    UPDATE spirits SET brand = 'I.W. Harper' WHERE brand = 'i w';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_brands_fixed := v_brands_fixed + v_temp_count;
    
    -- Michter's was already handled above
    
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
    
    -- Re-enable the trigger
    ALTER TABLE spirits ENABLE TRIGGER ensure_spirit_brand_exists;
    
    -- Step 5: Count problems after fixes
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
    
    -- Create a summary table to show results
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

-- Fix the ensure_brand_exists function to handle apostrophes properly
CREATE OR REPLACE FUNCTION public.ensure_brand_exists()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    -- If brand is provided and doesn't exist, create it
    IF NEW.brand IS NOT NULL THEN
        INSERT INTO public.brands (name, slug)
        VALUES (NEW.brand, LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(NEW.brand, '''', '', 'g'),  -- Remove apostrophes
                '\s+', '-', 'g'                            -- Replace spaces with hyphens
            )
        ))
        ON CONFLICT (name) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$function$;

-- Show the results
SELECT * FROM v253_cleanup_summary;

-- Show sample of cleaned spirits
SELECT * FROM v253_sample_spirits;

-- Show brands that were fixed
SELECT name, slug FROM brands 
WHERE name IN ('Michter''s', 'Russell''s Reserve', 'Maker''s Mark', 'Angel''s Envy', 'Jack Daniel''s')
ORDER BY name;

-- Clean up temp tables
DROP TABLE IF EXISTS v253_cleanup_summary;
DROP TABLE IF EXISTS v253_sample_spirits;