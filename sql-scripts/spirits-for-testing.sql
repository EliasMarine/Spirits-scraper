-- ============================================
-- Spirits for Algorithm Testing & Improvement
-- ============================================

-- 1. Get spirits with missing brand (need brand extraction)
SELECT 
    id,
    name,
    type,
    category,
    CASE 
        WHEN name ~* '^(macallan|glenfiddich|glenlivet|buffalo trace|maker''s mark|woodford reserve|wild turkey|four roses|ardbeg|balvenie)\b' 
        THEN regexp_match(name, '^(macallan|glenfiddich|glenlivet|buffalo trace|maker''s mark|woodford reserve|wild turkey|four roses|ardbeg|balvenie)\b', 'i')[1]
        ELSE 'UNKNOWN'
    END as potential_brand
FROM spirits
WHERE brand IS NULL
ORDER BY name
LIMIT 20;

-- 2. Get spirits for deduplication testing (age variants)
SELECT 
    s1.id as id1,
    s1.brand,
    s1.name as name1,
    s2.id as id2,
    s2.name as name2,
    -- Calculate what the similarity should be
    CASE 
        WHEN s1.brand = s2.brand 
         AND regexp_replace(s1.name, '\d+\s*year', 'X year', 'gi') = regexp_replace(s2.name, '\d+\s*year', 'X year', 'gi')
        THEN 'Should be LOW (different ages)'
        WHEN s1.brand = s2.brand 
         AND regexp_replace(s1.name, '\d{4}\s*release', 'X release', 'gi') = regexp_replace(s2.name, '\d{4}\s*release', 'X release', 'gi')
        THEN 'Should be HIGH (same product, different release)'
        ELSE 'Should analyze'
    END as expected_result
FROM spirits s1
JOIN spirits s2 ON s1.brand = s2.brand AND s1.id < s2.id
WHERE s1.brand IN ('The Macallan', 'Glenfiddich', 'The Glenlivet')
  AND (
    (s1.name ~* '\d+\s*year' AND s2.name ~* '\d+\s*year') OR
    (s1.name ~* '\d{4}\s*release' AND s2.name ~* '\d{4}\s*release')
  )
ORDER BY s1.brand, s1.name
LIMIT 30;

-- 3. Spirits for autonomous discovery pattern testing
SELECT 
    brand,
    name,
    type,
    category,
    -- Extract patterns for query generation
    ARRAY_REMOVE(ARRAY[
        CASE WHEN name ~* '\d+\s*year' THEN 'age-statement' END,
        CASE WHEN name ~* 'cask strength|barrel proof' THEN 'cask-strength' END,
        CASE WHEN name ~* 'single barrel|single cask' THEN 'single-barrel' END,
        CASE WHEN name ~* 'limited|special.*edition' THEN 'limited-edition' END,
        CASE WHEN name ~* 'reserve' THEN 'reserve' END,
        CASE WHEN name ~* 'vintage|antique' THEN 'vintage' END,
        CASE WHEN name ~* 'double cask|triple cask' THEN 'multi-cask' END,
        CASE WHEN name ~* 'sherry|port|bourbon.*cask' THEN 'cask-finish' END
    ], NULL) as patterns,
    source_url
FROM spirits
WHERE brand IS NOT NULL
ORDER BY RANDOM()
LIMIT 50;

-- 4. Common search patterns from existing data
WITH search_patterns AS (
    SELECT 
        LOWER(brand || ' ' || 
            CASE 
                WHEN name ~* '\d+\s*year' THEN regexp_replace(name, '\d+\s*year', 'AGE year', 'gi')
                ELSE name 
            END
        ) as search_query,
        COUNT(*) as variant_count
    FROM spirits
    WHERE brand IS NOT NULL
    GROUP BY search_query
)
SELECT 
    search_query,
    variant_count,
    -- Generate discovery queries
    ARRAY[
        search_query,
        search_query || ' price',
        search_query || ' review',
        search_query || ' buy online',
        search_query || ' whisky shop'
    ] as suggested_queries
FROM search_patterns
WHERE variant_count >= 2
ORDER BY variant_count DESC
LIMIT 20;

-- 5. Spirits needing data enrichment
SELECT 
    id,
    brand,
    name,
    type,
    category,
    abv,
    ARRAY_LENGTH(ARRAY_REMOVE(ARRAY[
        CASE WHEN abv IS NULL THEN 'abv' END,
        CASE WHEN image_url IS NULL THEN 'image' END,
        CASE WHEN origin_country IS NULL THEN 'country' END,
        CASE WHEN region IS NULL THEN 'region' END,
        CASE WHEN price_range IS NULL THEN 'price' END,
        CASE WHEN flavor_profile IS NULL OR array_length(flavor_profile, 1) = 0 THEN 'flavors' END
    ], NULL), 1) as missing_count,
    source_url
FROM spirits
WHERE brand IS NOT NULL
  AND (abv IS NULL OR image_url IS NULL OR origin_country IS NULL)
ORDER BY missing_count DESC
LIMIT 30;

-- 6. Export sample for manual review
COPY (
    SELECT 
        id,
        brand,
        name,
        type,
        category,
        abv,
        description,
        origin_country,
        region,
        price_range,
        source_url,
        created_at
    FROM spirits
    WHERE brand IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 100
) TO '/tmp/spirits_sample.csv' WITH CSV HEADER;