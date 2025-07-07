-- V3.3 Database Cleanup Script
-- Purpose: Remove contaminated non-spirit entries from database
-- Date: 2025-07-06
-- WARNING: This will DELETE data. Run a backup first!

-- First, let's see what we're about to delete
DO $$
DECLARE
    fashion_count INTEGER;
    ecommerce_count INTEGER;
    blog_count INTEGER;
    bad_brand_count INTEGER;
    delivery_count INTEGER;
    total_to_delete INTEGER;
BEGIN
    -- Count fashion/clothing contamination
    SELECT COUNT(*) INTO fashion_count
    FROM spirits 
    WHERE (name ILIKE '%scotch & soda%' AND (
        name ILIKE '%joe jonas%' OR
        name ILIKE '%campaign%' OR
        name ILIKE '%spring%summer%' OR
        name ILIKE '%unveil%' OR
        name ILIKE '%launches%' OR
        name ILIKE '%stylish%'
    ));
    
    RAISE NOTICE 'Fashion/clothing entries to delete: %', fashion_count;
    
    -- Count e-commerce pages
    SELECT COUNT(*) INTO ecommerce_count
    FROM spirits 
    WHERE name ILIKE 'order % online%'
       OR name ILIKE '% delivery to your doorstep'
       OR name ILIKE '% home delivery online%'
       OR name ILIKE 'purchase % and our full line%'
       OR name ILIKE 'tequila order premium%'
       OR name ILIKE '% get your top shelf fix%';
    
    RAISE NOTICE 'E-commerce page entries to delete: %', ecommerce_count;
    
    -- Count blog/review content
    SELECT COUNT(*) INTO blog_count
    FROM spirits 
    WHERE name ILIKE '%reviews whiskey%'
       OR name ILIKE '%whiskey reviews%'
       OR name ILIKE '%whiskey shelf reviews%'
       OR name ILIKE 'what % are you drinking%'
       OR name ILIKE 'we did a blind test%'
       OR name ILIKE '%for the ages'
       OR name ILIKE '% shelf reviews %'
       OR name ILIKE '%bottom shelf % taste off%'
       OR name ILIKE '%brian''s whiskey reviews%';
    
    RAISE NOTICE 'Blog/review entries to delete: %', blog_count;
    
    -- Count bad brand extractions
    SELECT COUNT(*) INTO bad_brand_count
    FROM spirits 
    WHERE brand IN ('Order', 'What', 'The Top', 'The World', 'Brian''s', 
                    'Purchase', 'Online Rum', 'The Whiskey', 'Rare Tequila',
                    'Total', 'We Did', 'Scotch &', 'The Classics', 
                    'World''S', 'The', 'Bottom', 'Tequila')
    AND data_quality_score < 70;
    
    RAISE NOTICE 'Bad brand entries to delete: %', bad_brand_count;
    
    -- Count delivery/shipping info entries
    SELECT COUNT(*) INTO delivery_count
    FROM spirits 
    WHERE name ILIKE '%(cannot ship%'
       OR name ILIKE '%local delivery only%'
       OR name ILIKE '%delivery online%'
       OR name ILIKE '%free shipping%'
       OR name ILIKE '%ships as a%';
    
    RAISE NOTICE 'Delivery info entries to delete: %', delivery_count;
    
    total_to_delete := fashion_count + ecommerce_count + blog_count + bad_brand_count + delivery_count;
    RAISE NOTICE 'TOTAL ENTRIES TO DELETE: %', total_to_delete;
    
    -- Now perform the actual deletions
    
    -- 1. Remove fashion/clothing contamination
    DELETE FROM spirits 
    WHERE (name ILIKE '%scotch & soda%' AND (
        name ILIKE '%joe jonas%' OR
        name ILIKE '%campaign%' OR
        name ILIKE '%spring%summer%' OR
        name ILIKE '%unveil%' OR
        name ILIKE '%launches%' OR
        name ILIKE '%stylish%'
    ));
    
    -- 2. Remove e-commerce pages
    DELETE FROM spirits 
    WHERE name ILIKE 'order % online%'
       OR name ILIKE '% delivery to your doorstep'
       OR name ILIKE '% home delivery online%'
       OR name ILIKE 'purchase % and our full line%'
       OR name ILIKE 'tequila order premium%'
       OR name ILIKE '% get your top shelf fix%';
    
    -- 3. Remove blog/review content
    DELETE FROM spirits 
    WHERE name ILIKE '%reviews whiskey%'
       OR name ILIKE '%whiskey reviews%'
       OR name ILIKE '%whiskey shelf reviews%'
       OR name ILIKE 'what % are you drinking%'
       OR name ILIKE 'we did a blind test%'
       OR name ILIKE '%for the ages'
       OR name ILIKE '% shelf reviews %'
       OR name ILIKE '%bottom shelf % taste off%'
       OR name ILIKE '%brian''s whiskey reviews%';
    
    -- 4. Remove "Top" lists and articles
    DELETE FROM spirits 
    WHERE name ILIKE 'the world''s top %'
       OR name ILIKE 'the top %'
       OR name ILIKE '% top rated %'
       OR name ILIKE '% best % for beginners'
       OR name ILIKE 'rare % bottles for sale top%'
       OR name ILIKE '% top hard to find %';
    
    -- 5. Remove entries with bad brand patterns (but only low quality ones)
    DELETE FROM spirits 
    WHERE brand IN ('Order', 'What', 'The Top', 'The World', 'Brian''s', 
                    'Purchase', 'Online Rum', 'The Whiskey', 'Rare Tequila',
                    'Total', 'We Did', 'Scotch &', 'The Classics', 
                    'World''S', 'The', 'Bottom', 'Tequila', 'Order Tequila',
                    'Online', 'Rare', 'Best')
    AND data_quality_score < 70;
    
    -- 6. Remove entries with delivery/shipping info
    DELETE FROM spirits 
    WHERE name ILIKE '%(cannot ship%'
       OR name ILIKE '%local delivery only%'
       OR name ILIKE '%delivery online%'
       OR name ILIKE '%free shipping%'
       OR name ILIKE '%ships as a%';
    
    -- 7. Remove cocktail recipes
    DELETE FROM spirits
    WHERE name ILIKE '%cocktail % is a %'
       OR name ILIKE '%cocktail recipe%'
       OR name ILIKE '%how to make%';
    
    -- 8. Remove incomplete/truncated names ending with common words
    DELETE FROM spirits
    WHERE (name ILIKE '% with' OR 
           name ILIKE '% made with' OR
           name ILIKE '% is a' OR
           name ILIKE '% and') 
    AND LENGTH(name) < 50
    AND data_quality_score < 60;
    
    -- 9. Flag remaining low-quality entries for manual review
    UPDATE spirits 
    SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{needs_review}',
        'true'::jsonb
    )
    WHERE data_quality_score < 50
    AND metadata->>'needs_review' IS NULL;
    
    RAISE NOTICE 'Cleanup complete!';
    
    -- Show updated statistics
    RAISE NOTICE '--- Updated Database Statistics ---';
    
    SELECT 
        COUNT(*) as total_entries,
        AVG(data_quality_score) as avg_quality,
        COUNT(CASE WHEN category = 'Other' THEN 1 END) as other_count,
        COUNT(CASE WHEN data_quality_score < 50 THEN 1 END) as low_quality_count
    INTO STRICT total_to_delete, fashion_count, ecommerce_count, blog_count
    FROM spirits;
    
    RAISE NOTICE 'Total entries remaining: %', total_to_delete;
    RAISE NOTICE 'Average quality score: %', fashion_count;
    RAISE NOTICE 'Other category count: %', ecommerce_count;
    RAISE NOTICE 'Low quality count: %', blog_count;
    
END $$;

-- Additional cleanup: Normalize some salvageable entries

-- Fix entries where brand is "Unknown" but we can extract from name
UPDATE spirits
SET brand = 
    CASE 
        WHEN name ILIKE 'buffalo trace%' THEN 'Buffalo Trace'
        WHEN name ILIKE 'eagle rare%' THEN 'Eagle Rare'
        WHEN name ILIKE 'weller%' OR name ILIKE 'w.l. weller%' THEN 'W.L. Weller'
        WHEN name ILIKE 'pappy van winkle%' THEN 'Pappy Van Winkle'
        WHEN name ILIKE 'george t. stagg%' THEN 'George T. Stagg'
        WHEN name ILIKE 'blanton%' THEN 'Blanton''s'
        WHEN name ILIKE 'four roses%' THEN 'Four Roses'
        WHEN name ILIKE 'woodford reserve%' THEN 'Woodford Reserve'
        WHEN name ILIKE 'maker%mark%' THEN 'Maker''s Mark'
        WHEN name ILIKE 'jim beam%' THEN 'Jim Beam'
        WHEN name ILIKE 'wild turkey%' THEN 'Wild Turkey'
        WHEN name ILIKE 'knob creek%' THEN 'Knob Creek'
        WHEN name ILIKE 'basil hayden%' THEN 'Basil Hayden''s'
        WHEN name ILIKE 'henry mckenna%' THEN 'Henry McKenna'
        WHEN name ILIKE 'evan williams%' THEN 'Evan Williams'
        WHEN name ILIKE 'elijah craig%' THEN 'Elijah Craig'
        WHEN name ILIKE 'old forester%' THEN 'Old Forester'
        WHEN name ILIKE 'russell%reserve%' THEN 'Russell''s Reserve'
        WHEN name ILIKE 'heaven hill%' THEN 'Heaven Hill'
        WHEN name ILIKE 'michter%' THEN 'Michter''s'
        WHEN name ILIKE 'whistlepig%' OR name ILIKE 'whistle pig%' THEN 'WhistlePig'
        WHEN name ILIKE 'high west%' THEN 'High West'
        WHEN name ILIKE 'redemption%' THEN 'Redemption'
        WHEN name ILIKE 'smooth ambler%' THEN 'Smooth Ambler'
        WHEN name ILIKE 'widow jane%' THEN 'Widow Jane'
        WHEN name ILIKE 'smoke wagon%' THEN 'Smoke Wagon'
        ELSE brand
    END
WHERE brand IN ('Unknown', 'The', 'Single', 'Small', 'Double', 'Triple', 
                'Limited', 'Special', 'Reserve', 'Select', 'Premium')
   OR brand IS NULL
   OR brand = '';

-- Update categories for clearly misclassified items
UPDATE spirits
SET category = 
    CASE
        WHEN name ILIKE '%bourbon%' AND category = 'Other' THEN 'Bourbon'
        WHEN name ILIKE '%scotch%' AND category = 'Other' THEN 'Scotch'
        WHEN name ILIKE '%irish whiskey%' AND category = 'Other' THEN 'Irish Whiskey'
        WHEN name ILIKE '%rye whiskey%' AND category = 'Other' THEN 'Rye Whiskey'
        WHEN name ILIKE '%tennessee whiskey%' AND category = 'Other' THEN 'Tennessee Whiskey'
        WHEN name ILIKE '%single malt%' AND category = 'Other' THEN 'Single Malt'
        WHEN name ILIKE '%rum%' AND category = 'Other' THEN 'Rum'
        WHEN name ILIKE '%vodka%' AND category = 'Other' THEN 'Vodka'
        WHEN name ILIKE '%gin%' AND category = 'Other' THEN 'Gin'
        WHEN name ILIKE '%tequila%' AND category = 'Other' THEN 'Tequila'
        WHEN name ILIKE '%mezcal%' AND category = 'Other' THEN 'Mezcal'
        WHEN name ILIKE '%cognac%' AND category = 'Other' THEN 'Cognac'
        WHEN name ILIKE '%brandy%' AND category = 'Other' THEN 'Brandy'
        ELSE category
    END
WHERE category = 'Other'
  AND data_quality_score >= 70;

-- Final report
SELECT 
    'Cleanup Complete!' as status,
    COUNT(*) as total_entries,
    ROUND(AVG(data_quality_score)::numeric, 1) as avg_quality_score,
    COUNT(CASE WHEN category = 'Other' THEN 1 END) as other_category_count,
    ROUND((COUNT(CASE WHEN category = 'Other' THEN 1 END)::numeric / COUNT(*)::numeric * 100), 1) as other_percentage,
    COUNT(CASE WHEN data_quality_score < 50 THEN 1 END) as low_quality_remaining,
    COUNT(CASE WHEN metadata->>'needs_review' = 'true' THEN 1 END) as flagged_for_review
FROM spirits;