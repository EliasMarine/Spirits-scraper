-- V3.1.3 Aggressive Data Cleanup Script
-- Date: June 27, 2025
-- Purpose: Remove low-quality entries and fix data issues

-- IMPORTANT: Run these queries in order
-- BACKUP YOUR DATABASE FIRST!

DO $$
DECLARE
    deleted_count INTEGER := 0;
    fixed_count INTEGER := 0;
    total_deleted INTEGER := 0;
    total_fixed INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting V3.1.3 aggressive data cleanup...';
    
    -- ============================================
    -- PHASE 1: DELETE INVALID ENTRIES
    -- ============================================
    
    -- 1. Delete entries with invalid brand patterns
    RAISE NOTICE 'Deleting entries with invalid brands...';
    WITH invalid_brands AS (
        DELETE FROM spirits
        WHERE brand ~* '^(Unknown|The|Our|New|We|Top|Year Old|Mystery|Review|News|Here Are|Technically Not|THE MACA|Reviews On|The Essential|These Peaty|The Art|Whisky|Rum|Bourbon|Gin|Vodka|Scotch)$'
           OR brand ~* '^(8 New|Critics Choice|Aged Rum|White|Overrated|Top Shelf|Wheated|Top Premium|Discussion|Facundo Is|Product Description)$'
           OR brand = ''
           OR brand IS NULL
           OR length(brand) < 3
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM invalid_brands;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE '  Deleted % entries with invalid brands', deleted_count;
    
    -- 2. Delete review/blog content
    RAISE NOTICE 'Deleting review and blog content...';
    WITH review_content AS (
        DELETE FROM spirits
        WHERE name ~* '(review|rating|best of|top \d+|we tasted|i tried|discover|you need to try|essential bottles|taste like|how to|guide to)'
           OR name ~* '^(news|breaking|announced|technically not|here are|we''re|if you like|critic)'
           OR description ~* '(blog|article|post|review|rating|stars|guide)'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM review_content;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE '  Deleted % review/blog entries', deleted_count;
    
    -- 3. Delete mystery boxes and subscriptions
    RAISE NOTICE 'Deleting mystery boxes and subscriptions...';
    WITH mystery_boxes AS (
        DELETE FROM spirits
        WHERE name ~* '(mystery|subscription|box|bourbon of the month|whiskey club)'
           OR description ~* '(subscription|mystery box|monthly delivery)'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM mystery_boxes;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE '  Deleted % mystery box/subscription entries', deleted_count;
    
    -- 4. Delete restaurant/venue content
    RAISE NOTICE 'Deleting restaurant and venue content...';
    WITH restaurants AS (
        DELETE FROM spirits
        WHERE name ~* '(steakhouse|restaurant|bar offering|premier dining|hotel|accommodation|venue|event space)'
           OR name ~* 'Louisville.*Premier'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM restaurants;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE '  Deleted % restaurant/venue entries', deleted_count;
    
    -- 5. Delete store collection pages
    RAISE NOTICE 'Deleting store collection pages...';
    WITH store_pages AS (
        DELETE FROM spirits
        WHERE name ~* '(collection$|marketplace$|page \d+$|styles & categories|products$)'
           OR name ~* '(bourbon page|whiskey page|spirits page)'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM store_pages;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE '  Deleted % store collection pages', deleted_count;
    
    -- 6. Delete entries with extremely low quality scores
    RAISE NOTICE 'Deleting entries with quality score < 25...';
    WITH low_quality AS (
        DELETE FROM spirits
        WHERE data_quality_score < 25
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM low_quality;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE '  Deleted % low quality entries', deleted_count;
    
    -- 7. Delete broken name patterns
    RAISE NOTICE 'Deleting entries with broken names...';
    WITH broken_names AS (
        DELETE FROM spirits
        WHERE name ~* '^(Year Old|Scotch Whisky$|Highland Whisky$|Bourbon$|Whiskey$|Rum$)'
           OR name ~* '^\d+\s+Year\s+Old\s+(Whisky|Whiskey|Bourbon|Rum|Scotch)$'
           OR length(name) < 10
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM broken_names;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE '  Deleted % entries with broken names', deleted_count;
    
    -- ============================================
    -- PHASE 2: FIX CORRECTABLE ISSUES
    -- ============================================
    
    -- 1. Remove volume suffixes from names
    RAISE NOTICE 'Removing volume suffixes from names...';
    WITH volume_fixes AS (
        UPDATE spirits
        SET name = REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(name, 
                        '\s+(Bottle|bottle)$', '', 'i'),
                    '\s+70\s*cl$', '', 'i'),
                '\s+750\s*ml$', '', 'i'),
            '\s+1\s*L$', '', 'i')
        WHERE name ~* '\s+(Bottle|70\s*cl|750\s*ml|1\s*L)$'
        RETURNING id
    )
    SELECT COUNT(*) INTO fixed_count FROM volume_fixes;
    total_fixed := total_fixed + fixed_count;
    RAISE NOTICE '  Fixed % names with volume suffixes', fixed_count;
    
    -- 2. Fix spacing issues
    RAISE NOTICE 'Fixing spacing issues...';
    WITH spacing_fixes AS (
        UPDATE spirits
        SET name = REPLACE(REPLACE(name, 'L L', 'll'), 'Ll', 'll')
        WHERE name LIKE '%L L%' OR name LIKE '%Ll%'
        RETURNING id
    )
    SELECT COUNT(*) INTO fixed_count FROM spacing_fixes;
    total_fixed := total_fixed + fixed_count;
    RAISE NOTICE '  Fixed % names with spacing issues', fixed_count;
    
    -- 3. Fix possessive apostrophes in brands
    RAISE NOTICE 'Fixing possessive apostrophes in brands...';
    WITH apostrophe_fixes AS (
        UPDATE spirits
        SET brand = REGEXP_REPLACE(brand, '['']S$', '''s', 'i')
        WHERE brand ~* '['']S$'
        RETURNING id
    )
    SELECT COUNT(*) INTO fixed_count FROM apostrophe_fixes;
    total_fixed := total_fixed + fixed_count;
    RAISE NOTICE '  Fixed % brands with apostrophe issues', fixed_count;
    
    -- 4. Fix category misclassifications
    RAISE NOTICE 'Fixing category misclassifications...';
    
    -- Fix Jack Daniel's as Tennessee Whiskey
    UPDATE spirits
    SET category = 'Tennessee Whiskey'
    WHERE (brand ~* 'jack daniel' OR name ~* 'jack daniel')
      AND category IN ('Whiskey', 'Bourbon', 'Other');
    
    -- Fix obvious bourbons marked as Rye
    UPDATE spirits
    SET category = 'Bourbon'
    WHERE category = 'Rye Whiskey'
      AND name ~* '(bourbon|small batch|single barrel|bottled in bond)'
      AND name !~* 'rye';
    
    -- ============================================
    -- PHASE 3: HANDLE DUPLICATES
    -- ============================================
    
    RAISE NOTICE 'Identifying and removing duplicates...';
    
    -- Delete exact duplicates keeping the one with best data
    WITH duplicates AS (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY LOWER(name), brand
                   ORDER BY 
                       CASE WHEN price IS NOT NULL THEN 1 ELSE 2 END,
                       data_quality_score DESC NULLS LAST,
                       created_at ASC
               ) as rn
        FROM spirits
    )
    DELETE FROM spirits
    WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;
    RAISE NOTICE '  Deleted % duplicate entries', deleted_count;
    
    -- ============================================
    -- SUMMARY
    -- ============================================
    
    RAISE NOTICE '';
    RAISE NOTICE '=== V3.1.3 Cleanup Complete ===';
    RAISE NOTICE 'Total entries deleted: %', total_deleted;
    RAISE NOTICE 'Total entries fixed: %', total_fixed;
    RAISE NOTICE '';
    
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check remaining data quality
SELECT 
    'Total Entries' as metric,
    COUNT(*) as count
FROM spirits
UNION ALL
SELECT 
    'Entries with Prices',
    COUNT(*)
FROM spirits WHERE price IS NOT NULL
UNION ALL
SELECT 
    'Entries with Invalid Brands',
    COUNT(*)
FROM spirits 
WHERE brand ~* '^(Unknown|The|Our|New|We|Top|Year Old|Mystery|Review|News)' 
   OR length(brand) < 3
UNION ALL
SELECT 
    'Entries with Volume Suffixes',
    COUNT(*)
FROM spirits WHERE name ~* '\s+(Bottle|70\s*cl|750\s*ml|1\s*L)$'
UNION ALL
SELECT 
    'Low Quality Entries (score < 50)',
    COUNT(*)
FROM spirits WHERE data_quality_score < 50
UNION ALL
SELECT 
    'Category Distribution - Other',
    COUNT(*)
FROM spirits WHERE category = 'Other';

-- Show sample of remaining good entries
SELECT 
    name,
    brand,
    category,
    price,
    data_quality_score
FROM spirits
WHERE price IS NOT NULL
  AND data_quality_score >= 80
ORDER BY created_at DESC
LIMIT 10;