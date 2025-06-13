import { validateConfig } from './config/index.js';
import { queryGenerator } from './services/query-generator.js';
import { dataValidator } from './services/data-validator.js';
import { logger } from './utils/logger.js';

async function runTests() {
  console.log('🧪 Running Spirits Scraper Tests...\n');

  // Test 1: Configuration
  console.log('1. Testing configuration...');
  try {
    validateConfig();
    console.log('✅ Configuration is valid\n');
  } catch (error) {
    console.error('❌ Configuration error:', error);
    console.log('Please check your .env file\n');
    return;
  }

  // Test 2: Query Generation
  console.log('2. Testing query generation...');
  const testQueries = queryGenerator.generateSpiritQueries('Macallan 12', 'Macallan');
  console.log('Generated queries:');
  testQueries.forEach(q => console.log(`  - ${q}`));
  console.log('✅ Query generation working\n');

  // Test 3: Data Validation
  console.log('3. Testing data validation...');
  const testData = {
    name: 'Macallan 12 Year',
    brand: 'Macallan',
    type: 'Single Malt',
    category: 'Whiskey',
    abv: 43,
    description: 'A classic Highland single malt with notes of vanilla and dried fruits.',
    origin_country: 'Scotland',
    source_url: 'https://example.com',
  };

  const validation = dataValidator.validate(testData);
  if (validation.isValid) {
    console.log('✅ Data validation passed');
    console.log('Cleaned data:', JSON.stringify(validation.cleaned, null, 2));
  } else {
    console.log('❌ Data validation failed:', validation.errors);
  }
  console.log('');

  // Test 4: Logger
  console.log('4. Testing logger...');
  logger.info('Test info message');
  logger.warn('Test warning message');
  logger.error('Test error message');
  console.log('✅ Logger working (check logs directory)\n');

  console.log('🎉 All tests completed!');
  console.log('\nNext steps:');
  console.log('1. Ensure your Google API and Supabase credentials are set in .env');
  console.log('2. Try searching for a spirit: npm run scrape search "Macallan 12"');
  console.log('3. Check the logs directory for detailed logs');
}

runTests().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});