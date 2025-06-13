#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function checkLatestSpirits() {
  console.log('🔍 Checking latest spirits in database...\n');
  
  const { data: spirits, error } = await supabase
    .from('spirits')
    .select('name, price, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Latest 10 spirits:');
  console.log('='.repeat(80));
  
  spirits?.forEach((spirit, index) => {
    const date = new Date(spirit.created_at).toLocaleString();
    console.log(`${index + 1}. ${spirit.name}`);
    console.log(`   Price: ${spirit.price ? '$' + spirit.price : 'N/A'}`);
    console.log(`   Created: ${date}\n`);
  });
}

checkLatestSpirits();