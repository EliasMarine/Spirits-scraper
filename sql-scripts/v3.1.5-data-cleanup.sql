-- V3.1.5 Data Cleanup SQL Script
-- Date: June 30, 2025
-- Purpose: Clean up bad data identified in the audit

DO $$
DECLARE
    deleted_count INTEGER := 0;
    updated_count INTEGER := 0;
    duplicate_count INTEGER := 0;
    r RECORD;
BEGIN
    RAISE NOTICE 'Starting V3.1.5 data cleanup...';
    
    -- 1. Delete non-spirit content
    RAISE NOTICE 'Removing non-spirit content...';
    WITH bad_entries AS (
        DELETE FROM spirits
        WHERE 
            -- Cleaning products
            LOWER(name) LIKE '%scotch%brite%' OR
            LOWER(name) LIKE '%cleaning%' OR
            -- Blog titles
            LOWER(name) LIKE '%best%price%' OR
            LOWER(name) LIKE '%essential%bottles%' OR
            LOWER(name) LIKE '%latest%releases%' OR
            -- Forum posts
            LOWER(name) LIKE '%substitute%for%' OR
            -- Recipes
            LOWER(name) LIKE '%mojito%recipe%' OR
            LOWER(name) LIKE '%cocktail%recipe%' OR
            -- Generic entries
            (name = 'Scotch Whisky' AND brand = 'Unknown') OR
            -- Very short names
            LENGTH(name) < 5 OR
            -- News/blog content
            LOWER(name) LIKE '%has become%' OR
            LOWER(name) LIKE '%essential%guide%' OR
            LOWER(name) LIKE '%latest%whisky%' OR
            -- Shopping content
            LOWER(name) LIKE '%shop%now%' OR
            LOWER(name) LIKE '%buy%online%' OR
            LOWER(name) LIKE '%sale%off%' OR
            -- Additional patterns from audit
            LOWER(name) LIKE '%mystery%box%' OR
            LOWER(name) LIKE '%subscription%box%' OR
            LOWER(name) LIKE '%steakhouse%' OR
            LOWER(name) LIKE '%restaurant%' OR
            LOWER(name) LIKE '%review%whiskey%' OR
            LOWER(name) LIKE '%bourbon%news%' OR
            LOWER(name) LIKE '%release%calendar%' OR
            -- E-commerce metadata
            name ~ '\(Ship As A \d+\.\)' OR
            name ~ 'Sku \d+$' OR
            name ~ 'Product Detail$'
        RETURNING 1
    )
    SELECT COUNT(*) INTO deleted_count FROM bad_entries;
    RAISE NOTICE 'Deleted % non-spirit entries', deleted_count;
    
    -- 2. Fix brand names
    RAISE NOTICE 'Normalizing brand names...';
    WITH brand_updates AS (
        UPDATE spirits 
        SET brand = CASE
            WHEN LOWER(brand) LIKE '%angel%envy%' THEN 'Angel''s Envy'
            WHEN LOWER(brand) LIKE '%four%roses%' THEN 'Four Roses'
            WHEN brand = 'Widow' AND name LIKE 'Widow Jane%' THEN 'Widow Jane'
            WHEN LOWER(brand) LIKE '%buffalo%trace%' THEN 'Buffalo Trace'
            WHEN LOWER(brand) LIKE '%maker%mark%' THEN 'Maker''s Mark'
            WHEN LOWER(brand) LIKE '%jack%daniel%' THEN 'Jack Daniel''s'
            WHEN LOWER(brand) LIKE '%jim%beam%' THEN 'Jim Beam'
            WHEN LOWER(brand) LIKE '%wild%turkey%' THEN 'Wild Turkey'
            WHEN LOWER(brand) LIKE '%woodford%reserve%' THEN 'Woodford Reserve'
            WHEN LOWER(brand) LIKE '%elijah%craig%' THEN 'Elijah Craig'
            WHEN LOWER(brand) LIKE '%knob%creek%' THEN 'Knob Creek'
            WHEN LOWER(brand) LIKE '%bulleit%' THEN 'Bulleit'
            WHEN LOWER(brand) LIKE '%basil%hayden%' THEN 'Basil Hayden''s'
            WHEN LOWER(brand) LIKE '%blanton%' THEN 'Blanton''s'
            WHEN LOWER(brand) LIKE '%heaven%hill%' THEN 'Heaven Hill'
            WHEN LOWER(brand) LIKE '%old%forester%' THEN 'Old Forester'
            WHEN LOWER(brand) LIKE '%evan%williams%' THEN 'Evan Williams'
            WHEN LOWER(brand) LIKE '%henry%mckenna%' THEN 'Henry McKenna'
            WHEN LOWER(brand) LIKE '%eagle%rare%' THEN 'Eagle Rare'
            WHEN LOWER(brand) LIKE '%george%stagg%' THEN 'George T. Stagg'
            WHEN LOWER(brand) LIKE '%pappy%van%winkle%' THEN 'Pappy Van Winkle'
            WHEN LOWER(brand) LIKE '%weller%' THEN 'W.L. Weller'
            WHEN LOWER(brand) LIKE '%macallan%' THEN 'The Macallan'
            WHEN LOWER(brand) LIKE '%glenfiddich%' THEN 'Glenfiddich'
            WHEN LOWER(brand) LIKE '%glenlivet%' THEN 'The Glenlivet'
            WHEN LOWER(brand) LIKE '%johnnie%walker%' THEN 'Johnnie Walker'
            WHEN LOWER(brand) LIKE '%chivas%regal%' THEN 'Chivas Regal'
            WHEN LOWER(brand) LIKE '%highland%park%' THEN 'Highland Park'
            WHEN LOWER(brand) LIKE '%balvenie%' THEN 'The Balvenie'
            WHEN LOWER(brand) LIKE '%lagavulin%' THEN 'Lagavulin'
            WHEN LOWER(brand) LIKE '%laphroaig%' THEN 'Laphroaig'
            WHEN LOWER(brand) LIKE '%ardbeg%' THEN 'Ardbeg'
            ELSE brand
        END
        WHERE created_at > CURRENT_DATE - INTERVAL '30 days' 
        AND (
            LOWER(brand) LIKE '%angel%envy%' OR
            LOWER(brand) LIKE '%four%roses%' OR
            (brand = 'Widow' AND name LIKE 'Widow Jane%') OR
            LOWER(brand) LIKE '%buffalo%trace%' OR
            LOWER(brand) LIKE '%maker%mark%' OR
            LOWER(brand) LIKE '%jack%daniel%' OR
            LOWER(brand) LIKE '%jim%beam%' OR
            LOWER(brand) LIKE '%wild%turkey%' OR
            LOWER(brand) LIKE '%woodford%reserve%' OR
            LOWER(brand) LIKE '%elijah%craig%' OR
            LOWER(brand) LIKE '%knob%creek%' OR
            LOWER(brand) LIKE '%bulleit%' OR
            LOWER(brand) LIKE '%basil%hayden%' OR
            LOWER(brand) LIKE '%blanton%' OR
            LOWER(brand) LIKE '%heaven%hill%' OR
            LOWER(brand) LIKE '%old%forester%' OR
            LOWER(brand) LIKE '%evan%williams%' OR
            LOWER(brand) LIKE '%henry%mckenna%' OR
            LOWER(brand) LIKE '%eagle%rare%' OR
            LOWER(brand) LIKE '%george%stagg%' OR
            LOWER(brand) LIKE '%pappy%van%winkle%' OR
            LOWER(brand) LIKE '%weller%' OR
            LOWER(brand) LIKE '%macallan%' OR
            LOWER(brand) LIKE '%glenfiddich%' OR
            LOWER(brand) LIKE '%glenlivet%' OR
            LOWER(brand) LIKE '%johnnie%walker%' OR
            LOWER(brand) LIKE '%chivas%regal%' OR
            LOWER(brand) LIKE '%highland%park%' OR
            LOWER(brand) LIKE '%balvenie%' OR
            LOWER(brand) LIKE '%lagavulin%' OR
            LOWER(brand) LIKE '%laphroaig%' OR
            LOWER(brand) LIKE '%ardbeg%'
        )
        RETURNING 1
    )
    SELECT COUNT(*) INTO updated_count FROM brand_updates;
    RAISE NOTICE 'Updated % brand names', updated_count;
    
    -- 3. Remove duplicates keeping highest quality score
    RAISE NOTICE 'Removing duplicates...';
    WITH duplicates AS (
        SELECT id, name, data_quality_score,
               ROW_NUMBER() OVER (
                   PARTITION BY LOWER(TRIM(name)) 
                   ORDER BY data_quality_score DESC, created_at DESC
               ) as rn
        FROM spirits
        WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
    ),
    duplicate_deletes AS (
        DELETE FROM spirits
        WHERE id IN (
            SELECT id FROM duplicates WHERE rn > 1
        )
        RETURNING 1
    )
    SELECT COUNT(*) INTO duplicate_count FROM duplicate_deletes;
    RAISE NOTICE 'Removed % duplicate entries', duplicate_count;
    
    -- 4. Fix search result descriptions
    RAISE NOTICE 'Cleaning search result descriptions...';
    UPDATE spirits
    SET description = NULL
    WHERE description IS NOT NULL
    AND (
        description LIKE 'Find the best local for%' OR
        description LIKE '%Avg (ex-tax)%' OR
        description LIKE '%Find and shop from stores%' OR
        description LIKE '%merchants near you%'
    )
    AND created_at > CURRENT_DATE - INTERVAL '30 days';
    
    -- 5. Delete entries with very low quality scores
    RAISE NOTICE 'Removing very low quality entries...';
    DELETE FROM spirits
    WHERE data_quality_score < 30
    AND created_at > CURRENT_DATE - INTERVAL '7 days';
    
    -- 6. Fix name formatting issues
    RAISE NOTICE 'Fixing name formatting...';
    UPDATE spirits
    SET name = REPLACE(REPLACE(name, '''', ''''), ''', '''')
    WHERE name LIKE '%'%' OR name LIKE '%'%';
    
    -- 7. Remove generic brands
    DELETE FROM spirits
    WHERE brand IN ('The', 'A', 'An', 'New', 'Old', 'Best', 'Top', 'Premium', 'Unknown')
    AND created_at > CURRENT_DATE - INTERVAL '7 days';
    
    RAISE NOTICE 'Cleanup complete!';
    RAISE NOTICE 'Total deleted: %', deleted_count + duplicate_count;
    RAISE NOTICE 'Total updated: %', updated_count;
    
END $$;

-- Verification queries
SELECT 'Statistics after cleanup:' as info;

SELECT 
    COUNT(*) as total_spirits,
    COUNT(CASE WHEN data_quality_score >= 80 THEN 1 END) as high_quality,
    COUNT(CASE WHEN data_quality_score >= 60 AND data_quality_score < 80 THEN 1 END) as medium_quality,
    COUNT(CASE WHEN data_quality_score < 60 THEN 1 END) as low_quality,
    COUNT(CASE WHEN price IS NOT NULL THEN 1 END) as has_price,
    COUNT(CASE WHEN abv IS NOT NULL THEN 1 END) as has_abv,
    COUNT(CASE WHEN description IS NOT NULL AND LENGTH(description) > 50 THEN 1 END) as has_good_description,
    AVG(data_quality_score) as avg_quality_score
FROM spirits
WHERE created_at > CURRENT_DATE - INTERVAL '7 days';

-- Check for remaining duplicates
SELECT 'Remaining duplicates:' as info;
SELECT name, COUNT(*) as count
FROM spirits
WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 10;