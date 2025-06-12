-- V2.5.4: Fix ensure_brand_exists trigger to validate brands before creating
-- This prevents garbage brands like "old", "new", "four" from being created

DO $$
BEGIN
    -- Drop existing trigger
    DROP TRIGGER IF EXISTS ensure_brand_exists_on_spirits ON spirits;
    
    -- Create improved function with validation
    CREATE OR REPLACE FUNCTION ensure_brand_exists() 
    RETURNS TRIGGER AS $trigger$
    DECLARE
        v_brand_slug TEXT;
        v_is_valid BOOLEAN;
        v_invalid_words TEXT[] := ARRAY[
            'old', 'new', 'four', 'wild', 'king', 'best', 'discover', 
            'american', 'scotch', 'whiskey', 'bourbon', 'styles', 
            'bedtime', 'lewis', 'england', 'standard', 'size',
            'spiritless', 'kentucky', 'tennessee', 'highland'
        ];
        v_valid_single_brands TEXT[] := ARRAY[
            'Hennessy', 'Patrón', 'Casamigos', 'Bacardi', 'Absolut',
            'Tanqueray', 'Bombay', 'Belvedere', 'Chopin', 'Tito''s',
            'Suntory', 'Nikka', 'Hibiki', 'Yamazaki', 'Hakushu',
            'Macallan', 'Glenfiddich', 'Glenlivet', 'Lagavulin', 'Laphroaig',
            'Ardbeg', 'Talisker', 'Oban', 'Dalmore', 'Balvenie',
            'Jameson', 'Bushmills', 'Redbreast', 'Teeling', 'Tullamore',
            'Bulleit', 'Basil', 'Larceny', 'Blanton''s', 'Michter''s',
            'WhistlePig', 'Westland', 'Balcones', 'Stranahan''s'
        ];
    BEGIN
        -- Only process if brand is provided and different from OLD
        IF NEW.brand IS NOT NULL AND NEW.brand != 'Unknown' AND 
           (TG_OP = 'INSERT' OR NEW.brand IS DISTINCT FROM OLD.brand) THEN
            
            -- Validate brand
            v_is_valid := TRUE;
            
            -- Check length
            IF length(NEW.brand) < 2 THEN
                v_is_valid := FALSE;
            END IF;
            
            -- Check invalid single words
            IF v_is_valid AND NOT NEW.brand LIKE '% %' THEN
                -- Single word brand
                IF lower(NEW.brand) = ANY(v_invalid_words) AND 
                   NOT NEW.brand = ANY(v_valid_single_brands) THEN
                    v_is_valid := FALSE;
                END IF;
            END IF;
            
            -- Check invalid phrases
            IF v_is_valid THEN
                IF NEW.brand ~* '^(discover|best\s|scotch\s+under|american\s+whiskey$|styles\s+of|king\s+of|standard\s+size|spiritless)' THEN
                    v_is_valid := FALSE;
                END IF;
            END IF;
            
            -- Only create brand if valid
            IF v_is_valid THEN
                -- Generate proper slug (remove apostrophes and special chars)
                v_brand_slug := lower(NEW.brand);
                v_brand_slug := regexp_replace(v_brand_slug, '[''"]', '', 'g');
                v_brand_slug := regexp_replace(v_brand_slug, '[^a-z0-9\s-]', ' ', 'g');
                v_brand_slug := regexp_replace(v_brand_slug, '\s+', '-', 'g');
                v_brand_slug := regexp_replace(v_brand_slug, '-+', '-', 'g');
                v_brand_slug := trim(both '-' from v_brand_slug);
                
                -- Insert brand if it doesn't exist
                INSERT INTO brands (name, slug, created_at, updated_at) 
                VALUES (NEW.brand, v_brand_slug, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (name) DO NOTHING;
            ELSE
                -- Invalid brand, set to Unknown
                NEW.brand := 'Unknown';
            END IF;
        END IF;
        
        RETURN NEW;
    END;
    $trigger$ LANGUAGE plpgsql;
    
    -- Recreate trigger
    CREATE TRIGGER ensure_brand_exists_on_spirits 
    BEFORE INSERT OR UPDATE ON spirits 
    FOR EACH ROW 
    EXECUTE FUNCTION ensure_brand_exists();
    
    -- Create result table
    CREATE TEMP TABLE brand_trigger_update_result (
        status TEXT,
        message TEXT
    );
    
    INSERT INTO brand_trigger_update_result VALUES
        ('SUCCESS', 'Brand validation trigger updated successfully'),
        ('INFO', 'The trigger now validates brands before creating them'),
        ('INFO', 'Invalid single words like "old", "new", "four" will be rejected'),
        ('INFO', 'Invalid phrases like "Discover the", "Best Bourbon" will be rejected'),
        ('INFO', 'Brands will be set to "Unknown" if they fail validation');

END $$;

-- Show results
SELECT * FROM brand_trigger_update_result;

-- Clean up
DROP TABLE IF EXISTS brand_trigger_update_result;