import { createClient } from '@supabase/supabase-js';
import { config } from './config/index.js';

async function findDuplicateSpirits() {
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey,
    {
      auth: {
        persistSession: false,
      },
    },
  );

  console.log('Searching for duplicate spirits in the database...\n');

  try {
    // Query to find spirits with duplicate name and brand combinations
    const { data: duplicates, error } = await supabase
      .rpc('find_duplicate_spirits');

    if (error) {
      // If the function doesn't exist, use a direct query
      const { data: allSpirits, error: queryError } = await supabase
        .from('spirits')
        .select('id, name, brand, category, abv, price, created_at')
        .order('name', { ascending: true })
        .order('brand', { ascending: true });

      if (queryError) {
        console.error('Error querying spirits:', queryError);
        return;
      }

      if (!allSpirits || allSpirits.length === 0) {
        console.log('No spirits found in the database.');
        return;
      }

      // Find duplicates manually
      const duplicateMap = new Map<string, any[]>();
      
      for (const spirit of allSpirits) {
        const key = `${spirit.name?.toLowerCase().trim()}_${spirit.brand?.toLowerCase().trim()}`;
        
        if (!duplicateMap.has(key)) {
          duplicateMap.set(key, []);
        }
        duplicateMap.get(key)!.push(spirit);
      }

      // Filter to only show actual duplicates (more than one entry)
      const actualDuplicates = Array.from(duplicateMap.entries())
        .filter(([_, spirits]) => spirits.length > 1)
        .map(([key, spirits]) => ({
          key,
          count: spirits.length,
          spirits
        }));

      if (actualDuplicates.length === 0) {
        console.log('No exact duplicate spirits (same name and brand) found in the database.');
        console.log(`\nTotal spirits in database: ${allSpirits.length}`);
        
        // Show sample of spirits
        console.log('\n=== Sample of spirits in database ===');
        const samples = allSpirits.slice(0, 20);
        for (const spirit of samples) {
          console.log(`- "${spirit.name}" by ${spirit.brand || 'Unknown'} (${spirit.category || 'No category'})`);
        }
        
        // Look for potential near-duplicates (same name, different brands)
        const nameMap = new Map<string, any[]>();
        for (const spirit of allSpirits) {
          const nameKey = spirit.name?.toLowerCase().trim();
          if (!nameKey) continue;
          
          if (!nameMap.has(nameKey)) {
            nameMap.set(nameKey, []);
          }
          nameMap.get(nameKey)!.push(spirit);
        }
        
        const sameName = Array.from(nameMap.entries())
          .filter(([_, spirits]) => spirits.length > 1)
          .map(([name, spirits]) => ({
            name,
            count: spirits.length,
            spirits
          }));
          
        if (sameName.length > 0) {
          console.log(`\n=== Spirits with same name but different brands ===`);
          console.log(`Found ${sameName.length} spirit names that appear with multiple brands:\n`);
          
          const examples = sameName.slice(0, 5);
          for (const { name, count, spirits } of examples) {
            console.log(`\n"${spirits[0].name}" appears ${count} times with different brands:`);
            for (const spirit of spirits) {
              console.log(`  - Brand: ${spirit.brand || 'No brand'}, Category: ${spirit.category || 'N/A'}, ID: ${spirit.id}`);
            }
          }
        }
        
        return;
      }

      console.log(`Found ${actualDuplicates.length} sets of duplicate spirits:\n`);

      // Show the first 5 examples
      const examples = actualDuplicates.slice(0, 5);
      
      for (const { key, count, spirits } of examples) {
        console.log(`\n=== Duplicate Set (${count} entries) ===`);
        console.log(`Name: ${spirits[0].name}`);
        console.log(`Brand: ${spirits[0].brand}`);
        console.log('\nDuplicate entries:');
        
        for (const spirit of spirits) {
          console.log(`  - ID: ${spirit.id}`);
          console.log(`    Category: ${spirit.category || 'N/A'}`);
          console.log(`    ABV: ${spirit.abv || 'N/A'}%`);
          console.log(`    Price: ${spirit.price ? `$${spirit.price}` : 'N/A'}`);
          console.log(`    Created: ${new Date(spirit.created_at).toLocaleDateString()}`);
          console.log('');
        }
      }

      if (actualDuplicates.length > 5) {
        console.log(`\n... and ${actualDuplicates.length - 5} more duplicate sets.`);
      }

      // Summary statistics
      console.log('\n=== Summary ===');
      console.log(`Total spirits in database: ${allSpirits.length}`);
      console.log(`Duplicate sets found: ${actualDuplicates.length}`);
      console.log(`Total duplicate entries: ${actualDuplicates.reduce((sum, { count }) => sum + count, 0)}`);
      console.log(`Unique spirits (after deduplication): ${duplicateMap.size - actualDuplicates.length + actualDuplicates.length}`);
      
      // Show sample of spirits in database
      console.log('\n=== Sample of spirits in database ===');
      const samples = allSpirits.slice(0, 10);
      for (const spirit of samples) {
        console.log(`- "${spirit.name}" by ${spirit.brand || 'Unknown'} (${spirit.category || 'No category'})`);
      }

      // Additional analysis - find the most duplicated spirits
      const sortedByCount = actualDuplicates.sort((a, b) => b.count - a.count);
      console.log('\n=== Most Duplicated Spirits ===');
      for (const { count, spirits } of sortedByCount.slice(0, 3)) {
        console.log(`  - "${spirits[0].name}" by ${spirits[0].brand}: ${count} duplicates`);
      }

    } else {
      // If RPC function exists, use its results
      console.log('Found duplicates using database function:', duplicates);
    }

  } catch (error) {
    console.error('Error finding duplicates:', error);
  }
}

// Run the script
findDuplicateSpirits().catch(console.error);