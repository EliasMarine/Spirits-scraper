-- Fix V2.5.3 Database Issues
-- This script fixes the existing bad data that's preventing new spirits from being stored

-- 1. First, show the extent of the problems
SELECT 'Spirits with empty parentheses:' as issue, COUNT(*) as count
FROM spirits
WHERE name LIKE '% ()%'
UNION ALL
SELECT 'Spirits with poor brand extraction:' as issue, COUNT(*) as count
FROM spirits
WHERE brand IN ('w l', 'e h', 'i w', 'michter s', 'suntory ao', 'corazon expressiones');

-- 2. Fix empty parentheses in spirit names
UPDATE spirits
SET name = TRIM(REPLACE(REPLACE(name, '()', ''), '  ', ' '))
WHERE name LIKE '% ()%';

-- 3. Fix poorly extracted brand names
UPDATE spirits SET brand = 'W.L. Weller' WHERE brand = 'w l';
UPDATE spirits SET brand = 'E.H. Taylor' WHERE brand = 'e h';
UPDATE spirits SET brand = 'I.W. Harper' WHERE brand = 'i w';
UPDATE spirits SET brand = 'Michter''s' WHERE brand = 'michter s';
UPDATE spirits SET brand = 'Buffalo Trace' WHERE brand = 'buffalo trace';
UPDATE spirits SET brand = 'Four Roses' WHERE brand = 'four roses';
UPDATE spirits SET brand = 'Wild Turkey' WHERE brand = 'wild turkey';
UPDATE spirits SET brand = 'Russell''s Reserve' WHERE brand = 'russell s reserve';
UPDATE spirits SET brand = 'Maker''s Mark' WHERE brand = 'maker s mark';
UPDATE spirits SET brand = 'Jack Daniel''s' WHERE brand = 'jack daniels' OR brand = 'jack daniel s';
UPDATE spirits SET brand = 'George T. Stagg' WHERE brand = 'george t stagg';
UPDATE spirits SET brand = 'Old Grand-Dad' WHERE brand = 'old grand dad';
UPDATE spirits SET brand = 'The Last Drop' WHERE brand = 'the last' OR brand = 'the last drop';
UPDATE spirits SET brand = 'Suntory' WHERE brand = 'suntory ao';
UPDATE spirits SET brand = 'Corazon' WHERE brand = 'corazon expressiones';
UPDATE spirits SET brand = 'High West' WHERE brand = 'high west';
UPDATE spirits SET brand = 'Angel''s Envy' WHERE brand = 'angel s envy';
UPDATE spirits SET brand = 'Elijah Craig' WHERE brand = 'elijah craig';
UPDATE spirits SET brand = 'Heaven Hill' WHERE brand = 'heaven hill';
UPDATE spirits SET brand = 'Joseph Magnus' WHERE brand = 'joseph magnus';
UPDATE spirits SET brand = 'Kentucky Owl' WHERE brand = 'kentucky owl';
UPDATE spirits SET brand = 'WhistlePig' WHERE brand = 'whistle pig' OR brand = 'whistlepig';
UPDATE spirits SET brand = 'George Dickel' WHERE brand = 'george dickel';
UPDATE spirits SET brand = 'Woodford Reserve' WHERE brand = 'woodford reserve';
UPDATE spirits SET brand = 'Knob Creek' WHERE brand = 'knob creek';
UPDATE spirits SET brand = 'Jim Beam' WHERE brand = 'jim beam';
UPDATE spirits SET brand = 'Bulleit' WHERE brand = 'bulleit';
UPDATE spirits SET brand = 'Eagle Rare' WHERE brand = 'eagle rare';

-- 4. Show the results
SELECT 'Fixed empty parentheses:' as action, COUNT(*) as count
FROM spirits
WHERE name NOT LIKE '% ()%'
AND (name LIKE '%Buffalo Trace%' OR name LIKE '%Weller%' OR name LIKE '%Michter%')
UNION ALL
SELECT 'Fixed brand names:' as action, COUNT(*) as count
FROM spirits
WHERE brand IN ('W.L. Weller', 'E.H. Taylor', 'I.W. Harper', 'Michter''s', 'Buffalo Trace', 
                'Four Roses', 'Wild Turkey', 'Russell''s Reserve', 'Maker''s Mark');

-- 5. Show some examples of the cleaned data
SELECT name, brand, type
FROM spirits
WHERE brand IN ('W.L. Weller', 'Buffalo Trace', 'Michter''s')
ORDER BY brand, name
LIMIT 20;