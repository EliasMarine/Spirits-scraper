#!/usr/bin/env tsx
/**
 * Check for generic spirits in the database
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { logger } from './utils/logger.js';

// Load environment variables
config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function checkGenericSpirits() {
  console.log('🔍 Checking for generic spirits in database\n');
  
  try {
    // Get recent spirits
    const { data: spirits, error } = await supabase
      .from('spirits')
      .select('id, name, brand, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      throw error;
    }
    
    if (!spirits || spirits.length === 0) {
      console.log('No spirits found in database.');
      return;
    }
    
    console.log(`Analyzing ${spirits.length} recent spirits...\n`);
    
    const genericSpirits = [];
    const validSpirits = [];
    
    for (const spirit of spirits) {
      // Check if the spirit name looks generic
      const isGeneric = 
        /^(budget|value|premium|mid-range|luxury|ultra-premium)\s+(wheated\s+)?bourbon/i.test(spirit.name) ||
        /catalog\s*page\s*\d+/i.test(spirit.name) ||
        /under\s*\$\d+/i.test(spirit.name) ||
        /^(best|top|good|nice|popular)\s+(bourbon|whiskey|scotch|vodka)/i.test(spirit.name) ||
        /^(smooth|spicy|sweet|complex|rich|mellow)\s+(bourbon|whiskey|scotch|vodka)/i.test(spirit.name) ||
        /^(bourbon|whiskey|scotch|vodka|gin|rum|tequila)\s+(collection|selection|catalog)/i.test(spirit.name) ||
        /ranked\s+(worst\s+to\s+best|best\s+to\s+worst)/i.test(spirit.name) ||
        /^the\s+\d+\s+(best|smoothest)/i.test(spirit.name) ||
        /^20\s+of\s+the\s+best/i.test(spirit.name);
      
      if (isGeneric) {
        genericSpirits.push(spirit);
      } else {
        validSpirits.push(spirit);
      }
    }
    
    // Show results
    console.log('📊 Analysis Results:');
    console.log('='.repeat(60));
    console.log(`Total spirits analyzed: ${spirits.length}`);
    console.log(`✅ Valid spirits: ${validSpirits.length}`);
    console.log(`⚠️  Generic/problematic spirits: ${genericSpirits.length}`);
    console.log('');
    
    if (genericSpirits.length > 0) {
      console.log('\n⚠️  Generic Spirits Found:');
      console.log('─'.repeat(60));
      genericSpirits.forEach((spirit, index) => {
        console.log(`${index + 1}. "${spirit.name}"`);
        console.log(`   Brand: ${spirit.brand || 'None'}`);
        console.log(`   Created: ${new Date(spirit.created_at).toLocaleString()}`);
        console.log(`   ID: ${spirit.id}`);
        console.log('');
      });
      
      console.log('\n💡 Recommendation:');
      console.log('These entries should be removed from the database.');
      console.log('Run: npx tsx scripts/fix-generic-spirits.sql');
    } else {
      console.log('\n✅ Great! No generic spirits found in recent entries.');
    }
    
    // Show some valid spirits as examples
    if (validSpirits.length > 0) {
      console.log('\n✅ Sample Valid Spirits:');
      console.log('─'.repeat(60));
      validSpirits.slice(0, 5).forEach((spirit, index) => {
        console.log(`${index + 1}. "${spirit.name}"`);
        console.log(`   Brand: ${spirit.brand || 'Unknown'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkGenericSpirits().catch(error => {
  logger.error('Check failed:', error);
  process.exit(1);
});