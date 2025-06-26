-- V2.8 Bad Entry Cleanup Script
-- Purpose: Clean up bad entries based on patterns found in database analysis
-- Created: 2025-06-26
-- 
-- This script identifies and removes various types of non-spirit entries that
-- have been scraped incorrectly, based on analysis of recent data quality issues.

DO $$
DECLARE
    -- Variables for tracking deletions
    deleted_podcast INT := 0;
    deleted_restaurant INT := 0;
    deleted_recipe INT := 0;
    deleted_forum INT := 0;
    deleted_collection INT := 0;
    deleted_marketing INT := 0;
    deleted_buffalo_trace INT := 0;
    deleted_education INT := 0;
    deleted_event INT := 0;
    deleted_award INT := 0;
    deleted_invalid_start INT := 0;
    deleted_too_short INT := 0;
    deleted_very_low_quality INT := 0;
    deleted_non_spirit INT := 0;
    deleted_store_suffix INT := 0;
    deleted_navigation INT := 0;
    deleted_total INT := 0;
    
    -- Variables for tracking fixes
    fixed_prices INT := 0;
    fixed_categories INT := 0;
    fixed_names INT := 0;
    
    r RECORD;
BEGIN
    RAISE NOTICE 'Starting V2.8 bad entry cleanup...';
    
    -- 1. Delete podcast content
    RAISE NOTICE 'Removing podcast content...';
    DELETE FROM spirits
    WHERE (
        name ILIKE '%podcast%' OR 
        name ILIKE '%episode%' OR
        source_url ILIKE '%podcasts.apple.com%' OR
        source_url ILIKE '%spotify.com/show%'
    )
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_podcast = ROW_COUNT;
    RAISE NOTICE 'Deleted % podcast entries', deleted_podcast;
    
    -- 2. Delete restaurant/bar content
    RAISE NOTICE 'Removing restaurant/bar content...';
    DELETE FROM spirits
    WHERE (
        name ILIKE '%restaurant%' OR 
        name ILIKE '%bar menu%' OR
        name ILIKE '%wine bar%' OR
        name ILIKE '%tap list%' OR
        name ILIKE '%happy hour%'
    )
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_restaurant = ROW_COUNT;
    RAISE NOTICE 'Deleted % restaurant/bar entries', deleted_restaurant;
    
    -- 3. Delete recipe/cocktail content
    RAISE NOTICE 'Removing recipe/cocktail content...';
    DELETE FROM spirits
    WHERE (
        name ILIKE '%cocktail recipe%' OR 
        name ILIKE '%recipe' OR
        name ILIKE '%how to make%' OR
        name ILIKE '%mixer%' OR
        name ILIKE '%mixed drink%' OR
        (name ILIKE '%cocktail%' AND data_quality_score < 40)
    )
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_recipe = ROW_COUNT;
    RAISE NOTICE 'Deleted % recipe/cocktail entries', deleted_recipe;
    
    -- 4. Delete forum discussions
    RAISE NOTICE 'Removing forum discussions...';
    DELETE FROM spirits
    WHERE (
        name ILIKE '%forum%' OR 
        name ILIKE '%thread%' OR
        name ILIKE '%discussion%' OR
        name ILIKE '%reddit%' OR
        source_url ILIKE '%reddit.com%' OR
        source_url ILIKE '%forum%'
    )
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_forum = ROW_COUNT;
    RAISE NOTICE 'Deleted % forum discussion entries', deleted_forum;
    
    -- 5. Delete collection/catalog pages
    RAISE NOTICE 'Removing collection/catalog pages...';
    DELETE FROM spirits
    WHERE (
        name ILIKE '%collection%' OR 
        name ILIKE '%products%' OR
        name ILIKE '%catalog%' OR
        name ILIKE '%browse%' OR
        name ILIKE '%shop all%'
    )
    AND data_quality_score < 50
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_collection = ROW_COUNT;
    RAISE NOTICE 'Deleted % collection/catalog entries', deleted_collection;
    
    -- 6. Delete marketing language
    RAISE NOTICE 'Removing marketing language entries...';
    DELETE FROM spirits
    WHERE (
        name ILIKE '%buy%online%' OR 
        name ILIKE '%near me%' OR
        name ILIKE '%delivery%' OR
        name ILIKE '%pickup%' OR
        name ILIKE '%instacart%' OR
        name ILIKE '%doordash%' OR
        name ILIKE '%ubereats%'
    )
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_marketing = ROW_COUNT;
    RAISE NOTICE 'Deleted % marketing language entries', deleted_marketing;
    
    -- 7. Delete Buffalo Trace store pages (specific pattern)
    RAISE NOTICE 'Removing Buffalo Trace store pages...';
    DELETE FROM spirits
    WHERE name ILIKE '%buffalo trace%'
    AND (
        name ILIKE '%bourbon whiskey' OR
        name ILIKE '%distillery%bourbon%' OR
        name ILIKE '%products' OR
        name ILIKE '%producer'
    )
    AND data_quality_score < 30
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_buffalo_trace = ROW_COUNT;
    RAISE NOTICE 'Deleted % Buffalo Trace store page entries', deleted_buffalo_trace;
    
    -- 8. Delete non-spirit educational content
    RAISE NOTICE 'Removing educational content...';
    DELETE FROM spirits
    WHERE (
        name ILIKE '%school%' OR 
        name ILIKE '%county school%' OR
        name ILIKE '%education%' OR
        name ILIKE '%student%' OR
        name ILIKE '%academy%program%'
    )
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_education = ROW_COUNT;
    RAISE NOTICE 'Deleted % educational entries', deleted_education;
    
    -- 9. Delete event listings
    RAISE NOTICE 'Removing event listings...';
    DELETE FROM spirits
    WHERE (
        name ILIKE '%event%' OR 
        name ILIKE '%festival%' OR
        name ILIKE '%tasting%' OR
        name ILIKE '%tour%' OR
        name ILIKE '%experience%'
    )
    AND data_quality_score < 50
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_event = ROW_COUNT;
    RAISE NOTICE 'Deleted % event listing entries', deleted_event;
    
    -- 10. Delete award/competition references
    RAISE NOTICE 'Removing award/competition references...';
    DELETE FROM spirits
    WHERE (
        name ILIKE '%award%' OR 
        name ILIKE '%winner%' OR
        name ILIKE '%competition%' OR
        name ILIKE '%challenge%' OR
        name ILIKE '%best of%'
    )
    AND data_quality_score < 50
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_award = ROW_COUNT;
    RAISE NOTICE 'Deleted % award/competition entries', deleted_award;
    
    -- 11. Delete entries starting with numbers or prices
    RAISE NOTICE 'Removing entries starting with numbers/prices...';
    DELETE FROM spirits
    WHERE (
        name ~ '^[0-9]+' OR 
        name ~ '^\$[0-9]+'
    )
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_invalid_start = ROW_COUNT;
    RAISE NOTICE 'Deleted % entries starting with numbers/prices', deleted_invalid_start;
    
    -- 12. Delete entries with names too short
    RAISE NOTICE 'Removing entries with names too short...';
    DELETE FROM spirits
    WHERE LENGTH(name) < 10
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_too_short = ROW_COUNT;
    RAISE NOTICE 'Deleted % entries with names too short', deleted_too_short;
    
    -- 13. Delete entries with very low quality scores
    RAISE NOTICE 'Removing very low quality entries...';
    DELETE FROM spirits
    WHERE data_quality_score < 25
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_very_low_quality = ROW_COUNT;
    RAISE NOTICE 'Deleted % very low quality entries', deleted_very_low_quality;
    
    -- 14. Delete obvious non-spirit items
    RAISE NOTICE 'Removing obvious non-spirit items...';
    DELETE FROM spirits
    WHERE (
        -- Gift/promotional items
        name ILIKE '%gift%guide%' OR
        name ILIKE '%father%day%' OR
        name ILIKE '%mother%day%' OR
        name ILIKE '%holiday%gift%' OR
        -- Store navigation
        name ILIKE '%explore%' OR
        name ILIKE '%browse%' OR
        name ILIKE '%shop%now%' OR
        name ILIKE '%view all%' OR
        -- Lists and rankings
        name ILIKE '%top 10%' OR
        name ILIKE '%best%of%' OR
        name ILIKE '%list of%' OR
        -- Social content
        name ILIKE '%instagram%' OR
        name ILIKE '%facebook%' OR
        name ILIKE '%twitter%' OR
        -- News/articles
        name ILIKE '%news%' OR
        name ILIKE '%article%' OR
        name ILIKE '%blog%'
    )
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_non_spirit = ROW_COUNT;
    RAISE NOTICE 'Deleted % non-spirit items', deleted_non_spirit;
    
    -- 15. Delete entries with store suffixes
    RAISE NOTICE 'Removing entries with store suffixes...';
    DELETE FROM spirits
    WHERE (
        name ILIKE '%mission wine%' OR
        name ILIKE '%wine & spirits' OR
        name ILIKE '%liquor store' OR
        name ILIKE '%bevmo' OR
        name ILIKE '%total wine'
    )
    AND data_quality_score < 50
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_store_suffix = ROW_COUNT;
    RAISE NOTICE 'Deleted % entries with store suffixes', deleted_store_suffix;
    
    -- 16. Delete navigation/UI elements
    RAISE NOTICE 'Removing navigation/UI elements...';
    DELETE FROM spirits
    WHERE (
        description ILIKE '%click here%' OR
        description ILIKE '%learn more%' OR
        description ILIKE '%sign up%' OR
        description ILIKE '%free shipping%' OR
        description ILIKE '%add to cart%'
    )
    AND data_quality_score < 50
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_navigation = ROW_COUNT;
    RAISE NOTICE 'Deleted % navigation/UI entries', deleted_navigation;
    
    -- Calculate total deletions
    deleted_total := deleted_podcast + deleted_restaurant + deleted_recipe + 
                    deleted_forum + deleted_collection + deleted_marketing + 
                    deleted_buffalo_trace + deleted_education + deleted_event + 
                    deleted_award + deleted_invalid_start + deleted_too_short + 
                    deleted_very_low_quality + deleted_non_spirit + deleted_store_suffix + 
                    deleted_navigation;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== DELETION SUMMARY ===';
    RAISE NOTICE 'Podcast content: %', deleted_podcast;
    RAISE NOTICE 'Restaurant/bar: %', deleted_restaurant;
    RAISE NOTICE 'Recipe/cocktail: %', deleted_recipe;
    RAISE NOTICE 'Forum discussions: %', deleted_forum;
    RAISE NOTICE 'Collection pages: %', deleted_collection;
    RAISE NOTICE 'Marketing language: %', deleted_marketing;
    RAISE NOTICE 'Buffalo Trace store pages: %', deleted_buffalo_trace;
    RAISE NOTICE 'Educational content: %', deleted_education;
    RAISE NOTICE 'Event listings: %', deleted_event;
    RAISE NOTICE 'Award/competition: %', deleted_award;
    RAISE NOTICE 'Invalid start: %', deleted_invalid_start;
    RAISE NOTICE 'Too short: %', deleted_too_short;
    RAISE NOTICE 'Very low quality: %', deleted_very_low_quality;
    RAISE NOTICE 'Non-spirit items: %', deleted_non_spirit;
    RAISE NOTICE 'Store suffixes: %', deleted_store_suffix;
    RAISE NOTICE 'Navigation/UI: %', deleted_navigation;
    RAISE NOTICE 'TOTAL DELETED: %', deleted_total;
    RAISE NOTICE '';
    
    -- Now fix existing entries that can be salvaged
    RAISE NOTICE '=== FIXING SALVAGEABLE ENTRIES ===';
    
    -- Fix categories for entries with clear type indicators but wrong category
    RAISE NOTICE 'Fixing misclassified categories...';
    
    -- Fix Tennessee Whiskey
    UPDATE spirits
    SET type = 'Tennessee Whiskey'
    WHERE (
        name ILIKE '%jack daniel%' OR
        name ILIKE '%george dickel%' OR
        name ILIKE '%uncle nearest%'
    )
    AND type != 'Tennessee Whiskey'
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS fixed_categories = ROW_COUNT;
    
    -- Fix Tequila
    UPDATE spirits
    SET type = 'Tequila'
    WHERE (
        name ILIKE '%tequila%' OR
        brand ILIKE '%patron%' OR
        brand ILIKE '%don julio%' OR
        brand ILIKE '%casamigos%'
    )
    AND type = 'Other'
    AND created_at >= NOW() - INTERVAL '30 days';
    fixed_categories := fixed_categories + ROW_COUNT;
    
    -- Fix Vodka
    UPDATE spirits
    SET type = 'Vodka'
    WHERE (
        name ILIKE '%vodka%' OR
        brand ILIKE '%grey goose%' OR
        brand ILIKE '%absolut%' OR
        brand ILIKE '%tito%'
    )
    AND type = 'Other'
    AND created_at >= NOW() - INTERVAL '30 days';
    fixed_categories := fixed_categories + ROW_COUNT;
    
    -- Fix Rum
    UPDATE spirits
    SET type = 'Rum'
    WHERE (
        name ILIKE '%rum%' OR
        brand ILIKE '%bacardi%' OR
        brand ILIKE '%captain morgan%' OR
        brand ILIKE '%kraken%'
    )
    AND type = 'Other'
    AND created_at >= NOW() - INTERVAL '30 days';
    fixed_categories := fixed_categories + ROW_COUNT;
    
    -- Fix Gin
    UPDATE spirits
    SET type = 'Gin'
    WHERE (
        name ILIKE '%gin%' AND name NOT ILIKE '%ginger%' OR
        brand ILIKE '%tanqueray%' OR
        brand ILIKE '%bombay%' OR
        brand ILIKE '%hendrick%'
    )
    AND type = 'Other'
    AND created_at >= NOW() - INTERVAL '30 days';
    fixed_categories := fixed_categories + ROW_COUNT;
    
    RAISE NOTICE 'Fixed % misclassified categories', fixed_categories;
    
    -- Clean up name formatting issues
    RAISE NOTICE 'Cleaning up name formatting...';
    UPDATE spirits
    SET name = TRIM(REGEXP_REPLACE(name, '\s+', ' ', 'g'))
    WHERE name ~ '\s{2,}'
    AND created_at >= NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS fixed_names = ROW_COUNT;
    RAISE NOTICE 'Fixed % name formatting issues', fixed_names;
    
    -- Extract prices from names/descriptions where missing
    RAISE NOTICE 'Extracting missing prices...';
    FOR r IN 
        SELECT id, name, description, source_url
        FROM spirits
        WHERE price IS NULL
        AND (
            name ~ '\$[0-9]+' OR
            description ~ '\$[0-9]+\.?[0-9]{0,2}'
        )
        AND created_at >= NOW() - INTERVAL '30 days'
        LIMIT 1000
    LOOP
        -- Try to extract price from name or description
        IF r.name ~ '\$([0-9]+\.?[0-9]{0,2})' THEN
            UPDATE spirits
            SET price = SUBSTRING(r.name FROM '\$([0-9]+\.?[0-9]{0,2})')::NUMERIC
            WHERE id = r.id
            AND SUBSTRING(r.name FROM '\$([0-9]+\.?[0-9]{0,2})')::NUMERIC BETWEEN 5 AND 5000;
            fixed_prices := fixed_prices + 1;
        ELSIF r.description ~ '\$([0-9]+\.?[0-9]{0,2})' THEN
            UPDATE spirits
            SET price = SUBSTRING(r.description FROM '\$([0-9]+\.?[0-9]{0,2})')::NUMERIC
            WHERE id = r.id
            AND SUBSTRING(r.description FROM '\$([0-9]+\.?[0-9]{0,2})')::NUMERIC BETWEEN 5 AND 5000;
            fixed_prices := fixed_prices + 1;
        END IF;
    END LOOP;
    RAISE NOTICE 'Fixed % missing prices', fixed_prices;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== CLEANUP COMPLETE ===';
    RAISE NOTICE 'Total entries deleted: %', deleted_total;
    RAISE NOTICE 'Total entries fixed: %', fixed_categories + fixed_names + fixed_prices;
    
END $$;

-- Verification queries
RAISE NOTICE '';
RAISE NOTICE '=== VERIFICATION ===';

-- Check remaining quality distribution
SELECT 
    CASE
        WHEN data_quality_score < 30 THEN '0-29'
        WHEN data_quality_score < 40 THEN '30-39'
        WHEN data_quality_score < 50 THEN '40-49'
        WHEN data_quality_score < 60 THEN '50-59'
        WHEN data_quality_score < 70 THEN '60-69'
        WHEN data_quality_score < 80 THEN '70-79'
        WHEN data_quality_score < 90 THEN '80-89'
        ELSE '90-100'
    END as score_range,
    COUNT(*) as count,
    COUNT(CASE WHEN price IS NOT NULL THEN 1 END) as with_price
FROM spirits
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY score_range
ORDER BY score_range;

-- Check category distribution
SELECT 
    type,
    COUNT(*) as count,
    ROUND(AVG(data_quality_score), 1) as avg_quality,
    COUNT(CASE WHEN price IS NOT NULL THEN 1 END) as with_price
FROM spirits
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY type
ORDER BY count DESC
LIMIT 20;

-- Check for remaining problematic patterns
SELECT 
    'Remaining Issues' as check_type,
    COUNT(CASE WHEN name ILIKE '%podcast%' THEN 1 END) as podcast_count,
    COUNT(CASE WHEN name ILIKE '%recipe%' THEN 1 END) as recipe_count,
    COUNT(CASE WHEN name ILIKE '%cocktail%' THEN 1 END) as cocktail_count,
    COUNT(CASE WHEN name ILIKE '%collection%' THEN 1 END) as collection_count,
    COUNT(CASE WHEN data_quality_score < 30 THEN 1 END) as very_low_quality
FROM spirits
WHERE created_at >= NOW() - INTERVAL '7 days';