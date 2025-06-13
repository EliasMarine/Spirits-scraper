#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { V25CriticalFixes } from '../src/fixes/v2.5-critical-fixes.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function cleanupBadData() {
  console.log('🧹 Starting database cleanup...\n');
  
  // Step 1: Find and remove bad entries
  const badPatterns = [
    // Websites
    '%whisky.com%',
    '%whiskey.com%',
    '%.com',
    '%.net',
    '%.org',
    // Articles
    'The History Of%',
    'The history of%',
    'How to%',
    'Why %',
    'What is%',
    // Truncated
    '%...',
    '% .',
    // Delivery/shopping
    '%Same-day Delivery%',
    '%Same-Day Delivery%',
    'Buy %',
    'Shop %'
  ];
  
  console.log('🔍 Finding bad entries to remove...');
  
  let totalDeleted = 0;
  
  for (const pattern of badPatterns) {
    const { data: badSpirits, error: selectError } = await supabase
      .from('spirits')
      .select('id, name')
      .like('name', pattern);
      
    if (selectError) {
      console.error(`Error selecting with pattern "${pattern}":`, selectError);
      continue;
    }
    
    if (badSpirits && badSpirits.length > 0) {
      console.log(`\nFound ${badSpirits.length} entries matching "${pattern}":`);
      badSpirits.forEach(spirit => {
        console.log(`  - ${spirit.name}`);
      });
      
      // Delete them
      const ids = badSpirits.map(s => s.id);
      const { error: deleteError, count } = await supabase
        .from('spirits')
        .delete()
        .in('id', ids);
        
      if (deleteError) {
        console.error(`❌ Error deleting:`, deleteError);
      } else {
        console.log(`✅ Deleted ${badSpirits.length} entries`);
        totalDeleted += badSpirits.length;
      }
    }
  }
  
  // Step 2: Fix store artifacts in existing names
  console.log('\n\n🔧 Fixing store artifacts in names...');
  
  const artifactPatterns = [
    '%Bottega Whiskey%',
    '%Crown Wine%',
    '%(43%)%',
    '%(45%)%',
    '%Series-orchard%',
    '%Series-highland%'
  ];
  
  let totalFixed = 0;
  
  for (const pattern of artifactPatterns) {
    const { data: spiritsToFix, error: selectError } = await supabase
      .from('spirits')
      .select('id, name')
      .like('name', pattern);
      
    if (selectError) {
      console.error(`Error selecting with pattern "${pattern}":`, selectError);
      continue;
    }
    
    if (spiritsToFix && spiritsToFix.length > 0) {
      console.log(`\nFound ${spiritsToFix.length} entries to fix matching "${pattern}":`);
      
      for (const spirit of spiritsToFix) {
        const cleanedName = V25CriticalFixes.cleanStoreArtifacts(spirit.name);
        
        if (cleanedName !== spirit.name) {
          console.log(`  Fixing: "${spirit.name}" → "${cleanedName}"`);
          
          const { error: updateError } = await supabase
            .from('spirits')
            .update({ name: cleanedName })
            .eq('id', spirit.id);
            
          if (updateError) {
            console.error(`    ❌ Error updating:`, updateError);
          } else {
            console.log(`    ✅ Fixed`);
            totalFixed++;
          }
        }
      }
    }
  }
  
  // Step 3: Fix suspicious prices
  console.log('\n\n💰 Fixing suspicious prices...');
  
  // Find very low prices
  const { data: lowPriceSpirits } = await supabase
    .from('spirits')
    .select('id, name, price')
    .lt('price', 30)
    .not('price', 'is', null);
    
  if (lowPriceSpirits && lowPriceSpirits.length > 0) {
    console.log(`\nFound ${lowPriceSpirits.length} spirits with suspiciously low prices:`);
    
    for (const spirit of lowPriceSpirits) {
      console.log(`  ${spirit.name}: $${spirit.price}`);
      
      // If multiplying by 10 makes it reasonable, fix it
      if (spirit.price * 10 >= 30 && spirit.price * 10 <= 500) {
        const newPrice = spirit.price * 10;
        console.log(`    → Adjusting to $${newPrice}`);
        
        const { error } = await supabase
          .from('spirits')
          .update({ price: newPrice })
          .eq('id', spirit.id);
          
        if (!error) {
          console.log(`    ✅ Fixed`);
        }
      } else {
        // Otherwise, null it out
        console.log(`    → Removing unrealistic price`);
        const { error } = await supabase
          .from('spirits')
          .update({ price: null })
          .eq('id', spirit.id);
          
        if (!error) {
          console.log(`    ✅ Removed`);
        }
      }
    }
  }
  
  // Find very high prices
  const { data: highPriceSpirits } = await supabase
    .from('spirits')
    .select('id, name, price')
    .gt('price', 2000);
    
  if (highPriceSpirits && highPriceSpirits.length > 0) {
    console.log(`\nFound ${highPriceSpirits.length} spirits with suspiciously high prices:`);
    
    for (const spirit of highPriceSpirits) {
      console.log(`  ${spirit.name}: $${spirit.price}`);
      
      // If dividing by 100 makes it reasonable, fix it
      if (spirit.price / 100 >= 25 && spirit.price / 100 <= 500) {
        const newPrice = spirit.price / 100;
        console.log(`    → Adjusting to $${newPrice}`);
        
        const { error } = await supabase
          .from('spirits')
          .update({ price: newPrice })
          .eq('id', spirit.id);
          
        if (!error) {
          console.log(`    ✅ Fixed`);
        }
      } else if (spirit.price / 10 >= 30 && spirit.price / 10 <= 500) {
        // Try dividing by 10
        const newPrice = spirit.price / 10;
        console.log(`    → Adjusting to $${newPrice}`);
        
        const { error } = await supabase
          .from('spirits')
          .update({ price: newPrice })
          .eq('id', spirit.id);
          
        if (!error) {
          console.log(`    ✅ Fixed`);
        }
      }
    }
  }
  
  console.log('\n\n📊 Cleanup Summary:');
  console.log(`  🗑️  Deleted ${totalDeleted} bad entries`);
  console.log(`  🔧 Fixed ${totalFixed} spirit names`);
  console.log('\n✅ Cleanup completed!');
}

// Run the cleanup
cleanupBadData().catch(console.error);