-- Final Brand Cleanup for V2.5.4
-- This script cleans up all the garbage brands and standardizes names

DO $$
DECLARE
    v_deleted_count INT := 0;
    v_updated_count INT := 0;
    v_temp_count INT := 0;
BEGIN
    -- First, temporarily disable the trigger to avoid conflicts
    ALTER TABLE spirits DISABLE TRIGGER ensure_brand_exists_on_spirits;
    
    -- Step 1: Update spirits to use correct brand names
    UPDATE spirits SET brand = 'Russell''s Reserve' WHERE brand IN ('russell s reserve', 'russell''s reserve');
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_updated_count := v_updated_count + v_temp_count;
    
    UPDATE spirits SET brand = 'Michter''s' WHERE brand = 'michter''s';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_updated_count := v_updated_count + v_temp_count;
    
    UPDATE spirits SET brand = 'W.L. Weller' WHERE brand IN ('w l', 'william larue weller', 'william larue', 'Weller');
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_updated_count := v_updated_count + v_temp_count;
    
    UPDATE spirits SET brand = 'E.H. Taylor' WHERE brand = 'e h taylor';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_updated_count := v_updated_count + v_temp_count;
    
    UPDATE spirits SET brand = 'I.W. Harper' WHERE brand = 'i w harper';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_updated_count := v_updated_count + v_temp_count;
    
    UPDATE spirits SET brand = 'Basil Hayden' WHERE brand = 'basil hayden';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_updated_count := v_updated_count + v_temp_count;
    
    UPDATE spirits SET brand = 'Angel''s Envy' WHERE brand = 'angel s envy';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_updated_count := v_updated_count + v_temp_count;
    
    UPDATE spirits SET brand = 'Old Grand-Dad' WHERE brand = 'old grand dad';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_updated_count := v_updated_count + v_temp_count;
    
    UPDATE spirits SET brand = 'Barrell Craft' WHERE brand = 'barrell craft';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_updated_count := v_updated_count + v_temp_count;
    
    UPDATE spirits SET brand = 'Corazon' WHERE brand LIKE 'corazon%';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_updated_count := v_updated_count + v_temp_count;
    
    UPDATE spirits SET brand = 'The Last Drop' WHERE brand = 'The Last';
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_updated_count := v_updated_count + v_temp_count;
    
    UPDATE spirits SET brand = 'George Dickel' WHERE brand = 'george dickel';
    UPDATE spirits SET brand = 'Heaven Hill' WHERE brand = 'heaven hill';
    UPDATE spirits SET brand = 'High West' WHERE brand = 'high west';
    UPDATE spirits SET brand = 'Jim Beam' WHERE brand = 'jim beam';
    UPDATE spirits SET brand = 'Joseph Magnus' WHERE brand = 'joseph magnus';
    UPDATE spirits SET brand = 'WhistlePig' WHERE brand = 'whistlepig';
    
    -- Step 2: Delete ALL brands to start fresh (since we have garbage data)
    DELETE FROM brands;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Step 3: Insert clean brands with proper formatting
    INSERT INTO brands (name, slug, created_at, updated_at) VALUES 
        -- Major bourbon brands
        ('Buffalo Trace', 'buffalo-trace', NOW(), NOW()),
        ('Wild Turkey', 'wild-turkey', NOW(), NOW()),
        ('Four Roses', 'four-roses', NOW(), NOW()),
        ('Maker''s Mark', 'makers-mark', NOW(), NOW()),
        ('Jim Beam', 'jim-beam', NOW(), NOW()),
        ('Woodford Reserve', 'woodford-reserve', NOW(), NOW()),
        ('Knob Creek', 'knob-creek', NOW(), NOW()),
        ('Bulleit', 'bulleit', NOW(), NOW()),
        ('Elijah Craig', 'elijah-craig', NOW(), NOW()),
        ('Eagle Rare', 'eagle-rare', NOW(), NOW()),
        ('Basil Hayden', 'basil-hayden', NOW(), NOW()),
        ('Old Grand-Dad', 'old-grand-dad', NOW(), NOW()),
        ('Russell''s Reserve', 'russells-reserve', NOW(), NOW()),
        ('W.L. Weller', 'wl-weller', NOW(), NOW()),
        ('E.H. Taylor', 'eh-taylor', NOW(), NOW()),
        ('I.W. Harper', 'iw-harper', NOW(), NOW()),
        ('Michter''s', 'michters', NOW(), NOW()),
        ('Angel''s Envy', 'angels-envy', NOW(), NOW()),
        ('Heaven Hill', 'heaven-hill', NOW(), NOW()),
        ('George Dickel', 'george-dickel', NOW(), NOW()),
        ('Jack Daniels', 'jack-daniels', NOW(), NOW()),
        ('High West', 'high-west', NOW(), NOW()),
        ('WhistlePig', 'whistlepig', NOW(), NOW()),
        ('Barrell Craft', 'barrell-craft', NOW(), NOW()),
        ('Kentucky Owl', 'kentucky-owl', NOW(), NOW()),
        ('Old Elk', 'old-elk', NOW(), NOW()),
        ('Joseph Magnus', 'joseph-magnus', NOW(), NOW()),
        ('Garrison Brothers', 'garrison-brothers', NOW(), NOW()),
        ('Larceny', 'larceny', NOW(), NOW()),
        ('Laws Whiskey', 'laws-whiskey', NOW(), NOW()),
        
        -- Scotch brands
        ('Macallan', 'macallan', NOW(), NOW()),
        ('Glenfiddich', 'glenfiddich', NOW(), NOW()),
        ('Glenlivet', 'glenlivet', NOW(), NOW()),
        ('Johnnie Walker', 'johnnie-walker', NOW(), NOW()),
        
        -- Irish whiskey
        ('Spot Blue', 'spot-blue', NOW(), NOW()),
        ('Spot Green', 'spot-green', NOW(), NOW()),
        ('Spot 15', 'spot-15', NOW(), NOW()),
        
        -- Japanese whiskey
        ('Suntory', 'suntory', NOW(), NOW()),
        
        -- Other spirits
        ('Corazon', 'corazon', NOW(), NOW()),
        ('The Last Drop', 'the-last-drop', NOW(), NOW()),
        
        -- Smaller brands found in data
        ('Boulevard Bourbon', 'boulevard-bourbon', NOW(), NOW()),
        ('Bowman Brothers', 'bowman-brothers', NOW(), NOW()),
        ('Calumet Farm', 'calumet-farm', NOW(), NOW()),
        ('Denver Distillery', 'denver-distillery', NOW(), NOW()),
        ('Dry Fly', 'dry-fly', NOW(), NOW()),
        ('Hillrock', 'hillrock', NOW(), NOW()),
        ('Lazy Guy', 'lazy-guy', NOW(), NOW()),
        ('Old Carter', 'old-carter', NOW(), NOW()),
        ('Old Williamsburg', 'old-williamsburg', NOW(), NOW()),
        ('Orphan Barrel', 'orphan-barrel', NOW(), NOW()),
        ('Peg Leg', 'peg-leg', NOW(), NOW()),
        ('Penelope Bourbon', 'penelope-bourbon', NOW(), NOW()),
        ('Smooth Ambler', 'smooth-ambler', NOW(), NOW()),
        ('Sonoma Distilling', 'sonoma-distilling', NOW(), NOW())
    ON CONFLICT (name) DO NOTHING;
    
    -- Step 4: Update spirits_count for all brands
    UPDATE brands b
    SET spirits_count = (
        SELECT COUNT(*)
        FROM spirits s
        WHERE s.brand = b.name
    );
    
    -- Step 5: Re-enable the trigger
    ALTER TABLE spirits ENABLE TRIGGER ensure_brand_exists_on_spirits;
    
    -- Create result summary
    CREATE TEMP TABLE brand_cleanup_final_result (
        action TEXT,
        value TEXT
    );
    
    INSERT INTO brand_cleanup_final_result VALUES
        ('Spirits updated to correct brands', v_updated_count::TEXT),
        ('Old brands deleted', v_deleted_count::TEXT),
        ('New clean brands created', (SELECT COUNT(*) FROM brands)::TEXT),
        ('Brands with spirits', (SELECT COUNT(*) FROM brands WHERE spirits_count > 0)::TEXT);
        
END $$;

-- Show results
SELECT * FROM brand_cleanup_final_result;

-- Show top brands by spirit count
SELECT name, spirits_count 
FROM brands 
WHERE spirits_count > 0
ORDER BY spirits_count DESC, name
LIMIT 20;