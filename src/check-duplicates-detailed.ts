import { createClient } from '@supabase/supabase-js';
import { config } from './config/index.js';

async function checkDuplicatesDetailed() {
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey,
    {
      auth: {
        persistSession: false,
      },
    },
  );

  console.log('Performing detailed duplicate analysis...\n');

  try {
    // 1. Check for exact duplicates (name + brand)
    console.log('=== 1. Checking for exact duplicates (same name + brand) ===');
    const { data: exactDuplicates, error: error1 } = await supabase
      .from('spirits')
      .select('name, brand, category, count:id')
      .order('name');

    if (!error1 && exactDuplicates) {
      const duplicateMap = new Map<string, number>();
      exactDuplicates.forEach(spirit => {
        const key = `${spirit.name}|${spirit.brand}`;
        duplicateMap.set(key, (duplicateMap.get(key) || 0) + 1);
      });

      const duplicates = Array.from(duplicateMap.entries())
        .filter(([_, count]) => count > 1)
        .map(([key, count]) => {
          const [name, brand] = key.split('|');
          return { name, brand, count };
        });

      if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} exact duplicates:`);
        duplicates.forEach(d => {
          console.log(`  - "${d.name}" by ${d.brand || 'Unknown'}: ${d.count} entries`);
        });
      } else {
        console.log('No exact duplicates found.');
      }
    }

    // 2. Check for case-insensitive duplicates
    console.log('\n=== 2. Checking for case-insensitive duplicates ===');
    const { data: allSpirits, error: error2 } = await supabase
      .from('spirits')
      .select('id, name, brand, category');

    if (!error2 && allSpirits) {
      const caseInsensitiveMap = new Map<string, any[]>();
      
      allSpirits.forEach(spirit => {
        const key = `${(spirit.name || '').toLowerCase().trim()}|${(spirit.brand || '').toLowerCase().trim()}`;
        if (!caseInsensitiveMap.has(key)) {
          caseInsensitiveMap.set(key, []);
        }
        caseInsensitiveMap.get(key)!.push(spirit);
      });

      const caseInsensitiveDupes = Array.from(caseInsensitiveMap.entries())
        .filter(([_, spirits]) => spirits.length > 1 && 
          // Check if they have different casings
          new Set(spirits.map(s => `${s.name}|${s.brand}`)).size > 1
        );

      if (caseInsensitiveDupes.length > 0) {
        console.log(`Found ${caseInsensitiveDupes.length} case-insensitive duplicates:`);
        caseInsensitiveDupes.slice(0, 5).forEach(([key, spirits]) => {
          console.log(`\nVariations of "${spirits[0].name}":`);
          spirits.forEach(s => {
            console.log(`  - Name: "${s.name}", Brand: "${s.brand || 'None'}", ID: ${s.id}`);
          });
        });
      } else {
        console.log('No case-insensitive duplicates found.');
      }
    }

    // 3. Check for spirits with very similar names (potential typos)
    console.log('\n=== 3. Checking for similar names (potential typos) ===');
    if (!error2 && allSpirits) {
      const similarSpirits: any[] = [];
      
      // Simple similarity check - spirits that start with the same 10 characters
      for (let i = 0; i < allSpirits.length; i++) {
        for (let j = i + 1; j < allSpirits.length; j++) {
          const spirit1 = allSpirits[i];
          const spirit2 = allSpirits[j];
          
          if (spirit1.name && spirit2.name) {
            const name1 = spirit1.name.toLowerCase().trim();
            const name2 = spirit2.name.toLowerCase().trim();
            
            // Check if names are very similar but not identical
            if (name1 !== name2 && 
                name1.length > 10 && name2.length > 10 &&
                name1.substring(0, 10) === name2.substring(0, 10)) {
              similarSpirits.push({
                spirit1,
                spirit2,
                similarity: 'same_prefix'
              });
            }
          }
        }
      }

      if (similarSpirits.length > 0) {
        console.log(`Found ${similarSpirits.length} pairs of spirits with similar names:`);
        similarSpirits.slice(0, 5).forEach(({ spirit1, spirit2 }) => {
          console.log(`\nPotentially similar:`);
          console.log(`  1. "${spirit1.name}" by ${spirit1.brand || 'Unknown'}`);
          console.log(`  2. "${spirit2.name}" by ${spirit2.brand || 'Unknown'}`);
        });
      } else {
        console.log('No spirits with similar names found.');
      }
    }

    // 4. Summary statistics
    console.log('\n=== 4. Database Summary ===');
    const { count: totalCount } = await supabase
      .from('spirits')
      .select('*', { count: 'exact', head: true });

    const { data: brandStats } = await supabase
      .from('spirits')
      .select('brand')
      .not('brand', 'is', null);

    const uniqueBrands = new Set(brandStats?.map(s => s.brand) || []);

    const { data: categoryStats } = await supabase
      .from('spirits')
      .select('category')
      .not('category', 'is', null);

    const uniqueCategories = new Set(categoryStats?.map(s => s.category) || []);

    console.log(`Total spirits: ${totalCount || 0}`);
    console.log(`Unique brands: ${uniqueBrands.size}`);
    console.log(`Unique categories: ${uniqueCategories.size}`);
    
    // Show spirits without brands
    const { count: noBrandCount } = await supabase
      .from('spirits')
      .select('*', { count: 'exact', head: true })
      .is('brand', null);
      
    console.log(`Spirits without brand: ${noBrandCount || 0}`);

  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

// Run the analysis
checkDuplicatesDetailed().catch(console.error);