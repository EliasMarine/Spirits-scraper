-- Complete Database Reset for Spirits Data
-- WARNING: This will delete ALL spirits data!

DO $$
BEGIN
    -- Disable triggers to avoid cascading issues
    ALTER TABLE spirits DISABLE TRIGGER ALL;
    ALTER TABLE brands DISABLE TRIGGER ALL;
    ALTER TABLE categories DISABLE TRIGGER ALL;
    
    -- Clear junction tables first (foreign key constraints)
    TRUNCATE TABLE spirit_categories CASCADE;
    TRUNCATE TABLE duplicate_matches CASCADE;
    
    -- Clear main tables
    TRUNCATE TABLE spirits CASCADE;
    TRUNCATE TABLE brands CASCADE;
    -- Optional: Keep categories as they're predefined
    -- TRUNCATE TABLE categories CASCADE;
    
    -- Clear any scraping job history if exists
    TRUNCATE TABLE scraping_jobs CASCADE;
    
    -- Re-enable triggers
    ALTER TABLE spirits ENABLE TRIGGER ALL;
    ALTER TABLE brands ENABLE TRIGGER ALL;
    ALTER TABLE categories ENABLE TRIGGER ALL;
    
    -- Reset sequences to start IDs from 1 again (if using serial IDs)
    -- ALTER SEQUENCE spirits_id_seq RESTART WITH 1;
    -- ALTER SEQUENCE brands_id_seq RESTART WITH 1;
    
    -- Create summary
    CREATE TEMP TABLE reset_summary AS
    SELECT 
        'Spirits' as table_name, 
        (SELECT COUNT(*) FROM spirits) as remaining_count
    UNION ALL
    SELECT 
        'Brands' as table_name, 
        (SELECT COUNT(*) FROM brands) as remaining_count
    UNION ALL
    SELECT 
        'Spirit Categories' as table_name, 
        (SELECT COUNT(*) FROM spirit_categories) as remaining_count
    UNION ALL
    SELECT 
        'Duplicate Matches' as table_name, 
        (SELECT COUNT(*) FROM duplicate_matches) as remaining_count;
        
END $$;

-- Show results
SELECT * FROM reset_summary;

-- Verify the reset
SELECT 
    'Database has been reset. All spirits data cleared.' as status,
    'You can now start fresh scraping.' as next_step;

-- Clean up
DROP TABLE IF EXISTS reset_summary;