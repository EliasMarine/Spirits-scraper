-- Comprehensive Brands Table Cleanup
-- This script fixes the garbage data in the brands table

DO $$
DECLARE
    v_merged_count INT := 0;
    v_deleted_count INT := 0;
    v_fixed_count INT := 0;
    v_temp_count INT;
BEGIN
    -- Create a temporary table to track brand consolidation
    CREATE TEMP TABLE brand_consolidation (
        old_id UUID,
        old_name TEXT,
        new_id UUID,
        new_name TEXT,
        action TEXT
    );

    -- Step 1: Fix poorly extracted brand names (same as spirits table)
    -- These are the same issues we fixed in spirits
    UPDATE brands SET name = 'W.L. Weller' WHERE name = 'w l';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_fixed_count := v_fixed_count + v_temp_count;
    
    UPDATE brands SET name = 'E.H. Taylor' WHERE name IN ('e h taylor', 'E.H. Taylor');
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_fixed_count := v_fixed_count + v_temp_count;
    
    UPDATE brands SET name = 'I.W. Harper' WHERE name = 'i w harper';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_fixed_count := v_fixed_count + v_temp_count;
    
    UPDATE brands SET name = 'Russell''s Reserve' WHERE name IN ('russell s reserve', 'russell''s reserve');
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_fixed_count := v_fixed_count + v_temp_count;
    
    UPDATE brands SET name = 'Angel''s Envy' WHERE name = 'angel s envy';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_fixed_count := v_fixed_count + v_temp_count;
    
    UPDATE brands SET name = 'Old Grand-Dad' WHERE name = 'old grand dad';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_fixed_count := v_fixed_count + v_temp_count;
    
    UPDATE brands SET name = 'Corazon' WHERE name IN ('corazon expressiones', 'corazon expressiones buffalo');
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_fixed_count := v_fixed_count + v_temp_count;

    -- Step 2: Delete garbage entries that aren't real brands
    -- These are fragments, generic words, or non-brand text
    DELETE FROM brands 
    WHERE name IN (
        'Discover', 'Discover the', 'Best Bourbon', 'American Whiskey',
        'Scotch under', 'standard size', 'Spiritless Kentucky',
        'styles of', 'king of', 'same old', 'old', 'new', 'four',
        'wild', 'king', 'bedtime', 'lewis', 'new england',
        '1996 wild', '1988 wild', '2021 william', '1999 bowmore', '2000 bowmore'
    );
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- Step 3: Consolidate duplicate brands
    -- Update spirits to point to the main brand before deleting duplicates
    
    -- W.L. Weller consolidation
    UPDATE spirits SET brand = 'W.L. Weller' 
    WHERE brand IN ('william larue weller', 'william larue', 'Weller');
    
    DELETE FROM brands 
    WHERE name IN ('william larue weller', 'william larue', 'Weller')
    AND name != 'W.L. Weller';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_merged_count := v_merged_count + v_temp_count;

    -- Wild Turkey consolidation  
    UPDATE spirits SET brand = 'Wild Turkey' 
    WHERE brand IN ('1996 wild', '1988 wild', 'wild');
    
    DELETE FROM brands 
    WHERE name IN ('1996 wild', '1988 wild', 'wild')
    AND name != 'Wild Turkey';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_merged_count := v_merged_count + v_temp_count;

    -- Suntory consolidation
    UPDATE spirits SET brand = 'Suntory' 
    WHERE brand = 'suntory ao';
    
    DELETE FROM brands 
    WHERE name = 'suntory ao';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_merged_count := v_merged_count + v_temp_count;

    -- The Last Drop consolidation
    UPDATE spirits SET brand = 'The Last Drop' 
    WHERE brand = 'The Last';
    
    DELETE FROM brands 
    WHERE name = 'The Last';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_merged_count := v_merged_count + v_temp_count;

    -- Step 4: Add proper metadata to remaining brands
    -- Update country for known brands
    UPDATE brands SET country = 'USA' 
    WHERE name IN (
        'Buffalo Trace', 'Wild Turkey', 'Four Roses', 'Maker''s Mark',
        'Jim Beam', 'Woodford Reserve', 'Knob Creek', 'Bulleit',
        'Eagle Rare', 'Elijah Craig', 'Heaven Hill', 'Old Grand-Dad',
        'Russell''s Reserve', 'W.L. Weller', 'E.H. Taylor', 'I.W. Harper',
        'Kentucky Owl', 'Angel''s Envy', 'Barrell Craft', 'High West',
        'WhistlePig', 'George Dickel', 'Jack Daniels', 'Basil Hayden',
        'Larceny', 'Old Elk', 'Laws Whiskey', 'Garrison Brothers'
    );

    UPDATE brands SET country = 'Scotland'
    WHERE name IN ('Glenfiddich', 'Glenlivet', 'Johnnie Walker');

    UPDATE brands SET country = 'Ireland'
    WHERE name IN ('Spot Blue', 'Spot Green', 'Spot 15');

    UPDATE brands SET country = 'Japan'
    WHERE name = 'Suntory';

    UPDATE brands SET country = 'Mexico'
    WHERE name = 'Corazon';

    -- Step 5: Add descriptions for major brands
    UPDATE brands SET description = 'Historic Kentucky bourbon distillery known for Buffalo Trace, Eagle Rare, and the Antique Collection'
    WHERE name = 'Buffalo Trace';

    UPDATE brands SET description = 'Legendary Kentucky distillery producing Wild Turkey 101, Russell''s Reserve, and Rare Breed'
    WHERE name = 'Wild Turkey';

    UPDATE brands SET description = 'Premium bourbon distillery famous for Small Batch, Single Barrel, and Limited Edition releases'
    WHERE name = 'Four Roses';

    UPDATE brands SET description = 'America''s native spirit maker known for red wax-sealed bottles and wheated bourbon recipe'
    WHERE name = 'Maker''s Mark';

    UPDATE brands SET description = 'World''s #1 bourbon producer, making Jim Beam, Knob Creek, Booker''s, and Baker''s'
    WHERE name = 'Jim Beam';

    UPDATE brands SET description = 'The Bourbon Capital''s official distillery, known for Woodford Reserve and Double Oaked'
    WHERE name = 'Woodford Reserve';

    UPDATE brands SET description = 'Small batch bourbon pioneer, part of the Jim Beam family of bourbons'
    WHERE name = 'Knob Creek';

    UPDATE brands SET description = 'Award-winning Kentucky straight bourbon with high-rye mashbill'
    WHERE name = 'Bulleit';

    UPDATE brands SET description = 'Single barrel bourbon from Buffalo Trace, allocated and highly sought-after'
    WHERE name = 'Eagle Rare';

    UPDATE brands SET description = 'Heaven Hill''s premium small batch bourbon, named after Rev. Elijah Craig'
    WHERE name = 'Elijah Craig';

    UPDATE brands SET description = 'Major Kentucky distiller producing Evan Williams, Elijah Craig, and many other brands'
    WHERE name = 'Heaven Hill';

    UPDATE brands SET description = 'Premium wheated bourbon line from Buffalo Trace, including 12 Year, Antique 107, and Full Proof'
    WHERE name = 'W.L. Weller';

    UPDATE brands SET description = 'Ultra-premium single barrel bourbons from Buffalo Trace''s Colonel E.H. Taylor Jr. line'
    WHERE name = 'E.H. Taylor';

    UPDATE brands SET description = 'Historic Pennsylvania distillery revived in 2013, producing exceptional American whiskeys'
    WHERE name = 'Michter''s';

    UPDATE brands SET description = 'Tennessee whiskey distillery using the Lincoln County Process, home of Old No. 7'
    WHERE name = 'Jack Daniels';

    UPDATE brands SET description = 'Vermont-based producer of premium rye whiskeys'
    WHERE name = 'WhistlePig';

    UPDATE brands SET description = 'Utah distillery known for innovative blends like Bourye and American Prairie Bourbon'
    WHERE name = 'High West';

    UPDATE brands SET description = 'Kentucky bourbon finished in port wine barrels'
    WHERE name = 'Angel''s Envy';

    -- Step 6: Fix slugs to match cleaned names
    UPDATE brands SET slug = 'wl-weller' WHERE name = 'W.L. Weller';
    UPDATE brands SET slug = 'eh-taylor' WHERE name = 'E.H. Taylor';
    UPDATE brands SET slug = 'iw-harper' WHERE name = 'I.W. Harper';
    UPDATE brands SET slug = 'russells-reserve' WHERE name = 'Russell''s Reserve';
    UPDATE brands SET slug = 'angels-envy' WHERE name = 'Angel''s Envy';
    UPDATE brands SET slug = 'jack-daniels' WHERE name = 'Jack Daniels';
    UPDATE brands SET slug = 'makers-mark' WHERE name = 'Maker''s Mark';
    UPDATE brands SET slug = 'michters' WHERE name = 'Michter''s';

    -- Step 7: Update spirits_count to be accurate
    UPDATE brands b
    SET spirits_count = (
        SELECT COUNT(*)
        FROM spirits s
        WHERE s.brand = b.name
    );

    -- Step 8: Delete brands with 0 spirits (orphaned entries)
    DELETE FROM brands
    WHERE spirits_count = 0
    AND name NOT IN (
        -- Keep major brands even if temporarily 0 spirits
        'Buffalo Trace', 'Wild Turkey', 'Four Roses', 'Maker''s Mark',
        'Jim Beam', 'Woodford Reserve', 'Heaven Hill', 'Michter''s'
    );
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_deleted_count := v_deleted_count + v_temp_count;

    -- Create summary
    CREATE TEMP TABLE brand_cleanup_summary (
        action TEXT,
        count INT
    );

    INSERT INTO brand_cleanup_summary VALUES
        ('Brands fixed (name/capitalization)', v_fixed_count),
        ('Garbage entries deleted', v_deleted_count),
        ('Duplicate brands merged', v_merged_count),
        ('Total improvements', v_fixed_count + v_deleted_count + v_merged_count);

    -- Show remaining brands
    CREATE TEMP TABLE remaining_brands AS
    SELECT 
        name,
        slug,
        country,
        spirits_count,
        CASE 
            WHEN description IS NOT NULL THEN '✓'
            ELSE '✗'
        END as has_description
    FROM brands
    WHERE spirits_count > 0
    ORDER BY spirits_count DESC, name
    LIMIT 50;

END $$;

-- Show results
SELECT '=== BRAND CLEANUP SUMMARY ===' as report;
SELECT * FROM brand_cleanup_summary;

SELECT '=== TOP BRANDS AFTER CLEANUP ===' as report;
SELECT * FROM remaining_brands;

-- Clean up
DROP TABLE IF EXISTS brand_cleanup_summary;
DROP TABLE IF EXISTS remaining_brands;
DROP TABLE IF EXISTS brand_consolidation;