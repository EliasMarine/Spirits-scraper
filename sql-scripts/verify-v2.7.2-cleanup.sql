-- Verify V2.7.2 cleanup results

-- 1. Check for any remaining problematic entries
SELECT 'Remaining Problematic Entries' as check_type, COUNT(*) as count
FROM spirits
WHERE 
  name ~* '\b(party|challenge|winners?|gift|mission\s*$|wine\s*$)\b'
  OR brand ~* '[''´`]S$'
  OR data_quality_score < 75;

-- 2. Show sample of remaining problematic entries (if any)
SELECT name, brand, type, data_quality_score
FROM spirits
WHERE 
  name ~* '\b(party|challenge|winners?|gift|mission\s*$|wine\s*$)\b'
  OR brand ~* '[''´`]S$'
  OR data_quality_score < 75
LIMIT 20;

-- 3. Quality score distribution
SELECT 
  CASE 
    WHEN data_quality_score >= 90 THEN '90-100 (Excellent)'
    WHEN data_quality_score >= 80 THEN '80-89 (Good)'
    WHEN data_quality_score >= 75 THEN '75-79 (Minimum)'
    WHEN data_quality_score >= 70 THEN '70-74 (Below Min)'
    ELSE 'Below 70 (Poor)'
  END as quality_range,
  COUNT(*) as count
FROM spirits
GROUP BY quality_range
ORDER BY quality_range DESC;

-- 4. Check for clean brands (no malformed possessives)
SELECT 'Brands with malformed possessives' as check_type, COUNT(*) as count
FROM spirits
WHERE brand ~* '[''´`]S$';

-- 5. Check for clean names (no store suffixes)
SELECT 'Names with store suffixes' as check_type, COUNT(*) as count
FROM spirits
WHERE name ~* '(mission|wine|&|and|\.{3}|\.\.\.|…)\s*$';

-- 6. Top 10 brands by count
SELECT brand, COUNT(*) as spirit_count
FROM spirits
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY spirit_count DESC
LIMIT 10;

-- 7. Sample of high-quality spirits
SELECT name, brand, type, data_quality_score
FROM spirits
WHERE data_quality_score >= 90
ORDER BY data_quality_score DESC, created_at DESC
LIMIT 10;