import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// Analysis queries
const queries = [
  {
    title: '1. Overview Statistics',
    query: `
      SELECT 
        COUNT(*) as total_spirits,
        COUNT(DISTINCT brand) as unique_brands,
        COUNT(DISTINCT category) as unique_categories,
        COUNT(DISTINCT type) as unique_types,
        COUNT(CASE WHEN brand IS NULL THEN 1 END) as missing_brand,
        COUNT(CASE WHEN category IS NULL THEN 1 END) as missing_category,
        COUNT(CASE WHEN type IS NULL THEN 1 END) as missing_type,
        COUNT(CASE WHEN abv IS NULL THEN 1 END) as missing_abv,
        COUNT(CASE WHEN description IS NULL THEN 1 END) as missing_description,
        COUNT(CASE WHEN image_url IS NULL THEN 1 END) as missing_image
      FROM spirits
    `
  },
  {
    title: '2. Brand Distribution (Top 20)',
    query: `
      SELECT 
        COALESCE(brand, 'NO BRAND') as brand_name,
        COUNT(*) as spirit_count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM spirits), 2) as percentage
      FROM spirits
      GROUP BY brand
      ORDER BY spirit_count DESC
      LIMIT 20
    `
  },
  {
    title: '3. Category and Type Distribution',
    query: `
      SELECT 
        COALESCE(category, 'NO CATEGORY') as category_name,
        COALESCE(type, 'NO TYPE') as type_name,
        COUNT(*) as count
      FROM spirits
      GROUP BY category, type
      ORDER BY count DESC
      LIMIT 30
    `
  },
  {
    title: '4. Sample Spirits for Algorithm Testing',
    query: `
      SELECT 
        id,
        brand,
        name,
        type,
        category,
        abv,
        CASE 
          WHEN name ~* '\\d+\\s*year' THEN 'Has Age Statement'
          WHEN name ~* '\\d+\\s*(proof|pf)' THEN 'Has Proof Statement'
          WHEN name ~* '(cask strength|barrel proof)' THEN 'Cask Strength'
          WHEN name ~* '(single barrel|single cask)' THEN 'Single Barrel'
          WHEN name ~* '(limited|special)\\s*edition' THEN 'Limited Edition'
          WHEN name ~* '\\d{4}\\s*release' THEN 'Vintage Release'
          ELSE 'Standard'
        END as pattern_type,
        created_at
      FROM spirits
      WHERE brand IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 50
    `
  },
  {
    title: '5. Potential Duplicate Patterns',
    query: `
      WITH name_patterns AS (
        SELECT 
          brand,
          name,
          CASE 
            WHEN name ~* '(\\d+)\\s*year' THEN 
              regexp_replace(name, '(\\d+)\\s*year', 'XX year', 'gi')
            ELSE name 
          END as normalized_name
        FROM spirits
        WHERE brand IS NOT NULL
      )
      SELECT 
        brand,
        normalized_name,
        COUNT(*) as variant_count,
        STRING_AGG(name, ' | ' ORDER BY name) as variants
      FROM name_patterns
      GROUP BY brand, normalized_name
      HAVING COUNT(*) > 1
      ORDER BY variant_count DESC, brand
      LIMIT 20
    `
  },
  {
    title: '6. Spirits with Missing Critical Data',
    query: `
      SELECT 
        id,
        brand,
        name,
        type,
        category,
        abv,
        CASE 
          WHEN brand IS NULL AND type IS NULL AND category IS NULL AND abv IS NULL THEN 4
          WHEN (brand IS NULL AND type IS NULL AND category IS NULL) OR 
               (brand IS NULL AND type IS NULL AND abv IS NULL) OR
               (brand IS NULL AND category IS NULL AND abv IS NULL) OR
               (type IS NULL AND category IS NULL AND abv IS NULL) THEN 3
          WHEN (brand IS NULL AND type IS NULL) OR 
               (brand IS NULL AND category IS NULL) OR
               (brand IS NULL AND abv IS NULL) OR
               (type IS NULL AND category IS NULL) OR
               (type IS NULL AND abv IS NULL) OR
               (category IS NULL AND abv IS NULL) THEN 2
          ELSE 1
        END as missing_fields_count
      FROM spirits
      WHERE brand IS NULL 
         OR type IS NULL 
         OR category IS NULL 
         OR abv IS NULL
      ORDER BY missing_fields_count DESC
      LIMIT 30
    `
  },
  {
    title: '7. Brand Name Variations',
    query: `
      WITH brand_analysis AS (
        SELECT 
          brand,
          COUNT(*) as count,
          LOWER(TRIM(brand)) as normalized,
          REGEXP_REPLACE(LOWER(TRIM(brand)), '\\s+(distillery|distilleries|brewery|winery|co\\.?|company|ltd\\.?|limited|inc\\.?)$', '', 'gi') as cleaned
        FROM spirits
        WHERE brand IS NOT NULL
        GROUP BY brand
      )
      SELECT 
        cleaned as potential_canonical_brand,
        COUNT(DISTINCT brand) as variation_count,
        STRING_AGG(DISTINCT brand || ' (' || count || ')', ', ' ORDER BY count DESC) as variations
      FROM brand_analysis
      GROUP BY cleaned
      HAVING COUNT(DISTINCT brand) > 1
      ORDER BY variation_count DESC
      LIMIT 20
    `
  },
  {
    title: '8. Age Statement Analysis',
    query: `
      SELECT 
        SUBSTRING(name FROM '(\\d+)\\s*-?\\s*[Yy]ear') as age,
        COUNT(*) as count,
        STRING_AGG(DISTINCT brand, ', ' ORDER BY brand) as brands
      FROM spirits
      WHERE name ~* '\\d+\\s*-?\\s*year'
      GROUP BY SUBSTRING(name FROM '(\\d+)\\s*-?\\s*[Yy]ear')
      ORDER BY count DESC
      LIMIT 20
    `
  },
  {
    title: '9. Recent Additions (Last 30 Days)',
    query: `
      SELECT 
        DATE(created_at) as date_added,
        COUNT(*) as spirits_added,
        COUNT(DISTINCT brand) as unique_brands,
        COUNT(CASE WHEN brand IS NULL THEN 1 END) as missing_brand,
        ROUND(AVG(CASE WHEN description IS NOT NULL THEN LENGTH(description) ELSE 0 END)) as avg_description_length
      FROM spirits
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date_added DESC
    `
  },
  {
    title: '10. Spirits Name Patterns for Discovery Algorithm',
    query: `
      SELECT 
        CASE 
          WHEN name ~* 'bourbon' THEN 'Bourbon'
          WHEN name ~* 'scotch' THEN 'Scotch'
          WHEN name ~* 'irish' THEN 'Irish'
          WHEN name ~* 'rye' THEN 'Rye'
          WHEN name ~* 'vodka' THEN 'Vodka'
          WHEN name ~* 'gin' THEN 'Gin'
          WHEN name ~* 'rum' THEN 'Rum'
          WHEN name ~* 'tequila' THEN 'Tequila'
          WHEN name ~* 'whiskey|whisky' THEN 'Whiskey/Whisky'
          ELSE 'Other'
        END as detected_type,
        COUNT(*) as count,
        COUNT(CASE WHEN category IS NULL THEN 1 END) as missing_category
      FROM spirits
      GROUP BY detected_type
      ORDER BY count DESC
    `
  }
];

// Execute analysis
async function runAnalysis() {
  console.log('Spirit Database Analysis Report');
  console.log('===============================');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Database: ${supabaseUrl}\n`);

  for (const { title, query } of queries) {
    console.log(`\n${title}`);
    console.log('-'.repeat(title.length));

    try {
      // Execute raw SQL query
      const { data, error } = await supabase.rpc('exec_sql', { query });

      if (error) {
        // Fallback: try direct query approach
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query })
        });

        if (!response.ok) {
          console.error(`Error: Unable to execute query - ${response.statusText}`);
          continue;
        }

        const result = await response.json();
        console.table(result);
      } else {
        console.table(data);
      }
    } catch (error) {
      console.error(`Error executing query: ${error}`);
    }
  }

  console.log('\n\nAnalysis complete!');
}

// Run the analysis
runAnalysis().catch(console.error);