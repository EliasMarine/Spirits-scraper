#!/usr/bin/env tsx

import dotenv from 'dotenv';

dotenv.config();

console.log('Environment check:');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Not set');
console.log('- SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Not set');
console.log('- GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? '✓ Set' : '✗ Not set');
console.log('- SEARCH_ENGINE_ID:', process.env.SEARCH_ENGINE_ID ? '✓ Set' : '✗ Not set');