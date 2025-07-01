import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function checkSchema() {
  console.log('Checking spirits table schema...');
  
  const { data, error } = await supabase
    .from('spirits')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Available fields:', Object.keys(data[0]));
    console.log('\nSample record structure:');
    const sample = data[0];
    Object.keys(sample).forEach(key => {
      console.log(`  ${key}: ${typeof sample[key]} = ${sample[key]}`);
    });
  } else {
    console.log('No data found in table');
  }
}

checkSchema().catch(console.error);