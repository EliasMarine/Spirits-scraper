-- Fix empty parentheses in existing spirit names
-- Run this in Supabase SQL Editor to clean up the database

-- First, let's see how many spirits have this issue
SELECT COUNT(*) as affected_count
FROM spirits
WHERE name LIKE '% ()%';

-- Show some examples
SELECT id, name, brand
FROM spirits
WHERE name LIKE '% ()%'
LIMIT 10;

-- Fix the empty parentheses
UPDATE spirits
SET name = TRIM(REPLACE(name, '()', ''))
WHERE name LIKE '% ()%';

-- Verify the fix
SELECT COUNT(*) as remaining_count
FROM spirits
WHERE name LIKE '% ()%';

-- Show the cleaned results
SELECT id, name, brand
FROM spirits
WHERE name LIKE '%Buffalo Trace%' OR name LIKE '%Weller%'
ORDER BY name
LIMIT 20;