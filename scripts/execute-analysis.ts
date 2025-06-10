import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'analyze-spirits.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split the SQL content into individual queries
const queries = sqlContent
  .split(/;[\s\n]+(?=--)/g)
  .map(q => q.trim())
  .filter(q => q && !q.startsWith('--'));

// Extract query titles from comments
function extractTitle(query: string): string {
  const lines = query.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('-- ') && line.includes('.')) {
      return line.substring(3).trim();
    }
  }
  return 'Query';
}

// Execute queries
async function executeAnalysis() {
  console.log('Starting Spirit Database Analysis...\n');
  console.log('='.repeat(80));

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const title = extractTitle(query);
    
    console.log(`\n${title}`);
    console.log('-'.repeat(title.length));

    try {
      // Extract just the SELECT statement (remove comments)
      const cleanQuery = query
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();

      const { data, error } = await supabase.rpc('', {}, {
        // Use raw SQL query
        query: cleanQuery
      }).maybeSingle();

      // For complex queries, we'll use a direct approach
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          query: cleanQuery
        })
      });

      if (!response.ok) {
        // Fallback: execute as raw SQL through the SQL editor endpoint
        const { data: result, error: queryError } = await supabase
          .from('spirits')
          .select('*')
          .sql(cleanQuery);

        if (queryError) {
          console.error(`Error: ${queryError.message}`);
        } else {
          console.log(JSON.stringify(result, null, 2));
        }
      } else {
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
      }

    } catch (error) {
      console.error(`Error executing query: ${error}`);
    }

    console.log('\n' + '='.repeat(80));
  }
}

// Run the analysis
executeAnalysis()
  .then(() => {
    console.log('\nAnalysis complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });