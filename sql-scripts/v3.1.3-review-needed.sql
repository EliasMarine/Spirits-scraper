-- V3.1.3 Entries Requiring Manual Review
-- Date: June 27, 2025
-- Purpose: Export entries that need human verification before deletion

-- Export uncertain cases to CSV for manual review
COPY (
    SELECT 
        id,
        name,
        brand,
        category,
        price,
        data_quality_score,
        LEFT(description, 200) as description_preview,
        source_url,
        created_at,
        -- Reason for review
        CASE
            WHEN data_quality_score BETWEEN 25 AND 50 THEN 'Low quality score'
            WHEN brand ~* '^(Limited|Special|Rare|Premium|Select|Reserve)$' THEN 'Generic brand - might be valid'
            WHEN name ~* 'Year Old' AND brand !~* 'Year Old' THEN 'Age in name - verify extraction'
            WHEN price::numeric > 1000 THEN 'High price - verify authenticity'
            WHEN price::numeric < 10 THEN 'Very low price - verify accuracy'
            WHEN category = 'Other' AND data_quality_score > 70 THEN 'High quality but uncategorized'
            ELSE 'Other concern'
        END as review_reason
    FROM spirits
    WHERE (
        -- Borderline quality scores
        (data_quality_score BETWEEN 25 AND 50)
        -- Potentially valid but generic brands
        OR (brand ~* '^(Limited|Special|Rare|Premium|Select|Reserve|Classic|Original)$')
        -- Age patterns that might be valid
        OR (name ~* '\d+\s+Year\s+Old' AND brand !~* 'Year Old')
        -- Extreme prices
        OR (price IS NOT NULL AND (price::numeric > 1000 OR price::numeric < 10))
        -- High quality "Other" category items
        OR (category = 'Other' AND data_quality_score > 70)
        -- Names that might be truncated
        OR (name ~* '\.\.\.$' OR name ~* '\s+\w{1,2}$')
    )
    ORDER BY data_quality_score DESC, created_at DESC
) TO '/tmp/spirits_review_needed_v3.1.3.csv' WITH CSV HEADER;

-- Summary of items needing review
SELECT 
    review_reason,
    COUNT(*) as count,
    AVG(data_quality_score) as avg_quality_score
FROM (
    SELECT 
        CASE
            WHEN data_quality_score BETWEEN 25 AND 50 THEN 'Low quality score'
            WHEN brand ~* '^(Limited|Special|Rare|Premium|Select|Reserve)$' THEN 'Generic brand - might be valid'
            WHEN name ~* 'Year Old' AND brand !~* 'Year Old' THEN 'Age in name - verify extraction'
            WHEN price::numeric > 1000 THEN 'High price - verify authenticity'
            WHEN price::numeric < 10 THEN 'Very low price - verify accuracy'
            WHEN category = 'Other' AND data_quality_score > 70 THEN 'High quality but uncategorized'
            ELSE 'Other concern'
        END as review_reason,
        data_quality_score
    FROM spirits
    WHERE (
        (data_quality_score BETWEEN 25 AND 50)
        OR (brand ~* '^(Limited|Special|Rare|Premium|Select|Reserve|Classic|Original)$')
        OR (name ~* '\d+\s+Year\s+Old' AND brand !~* 'Year Old')
        OR (price IS NOT NULL AND (price::numeric > 1000 OR price::numeric < 10))
        OR (category = 'Other' AND data_quality_score > 70)
        OR (name ~* '\.\.\.$' OR name ~* '\s+\w{1,2}$')
    )
) review_analysis
GROUP BY review_reason
ORDER BY count DESC;