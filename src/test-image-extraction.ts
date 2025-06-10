import { spiritExtractor } from './services/spirit-extractor.js';
import { config } from './config/index.js';

async function testImageExtraction() {
  console.log('Testing image extraction for spirits...\n');

  const testSpirits = [
    { name: 'Johnnie Walker Black Label', brand: 'Johnnie Walker' },
    { name: 'Glenlivet 12 Year', brand: 'Glenlivet' },
    { name: 'Blanton\'s Single Barrel', brand: 'Blanton\'s' },
    { name: 'Hennessy VS', brand: 'Hennessy' },
    { name: 'Grey Goose Vodka', brand: 'Grey Goose' },
  ];

  for (const spirit of testSpirits) {
    console.log(`\nTesting: ${spirit.name}`);
    console.log('='.repeat(50));
    
    try {
      // Test with deepParse enabled for better results
      const result = await spiritExtractor.extractSpirit(
        spirit.name,
        spirit.brand,
        {
          maxResults: 5,
          includeRetailers: true,
          deepParse: true,
        }
      );

      console.log(`Name: ${result.name}`);
      console.log(`Brand: ${result.brand || 'N/A'}`);
      console.log(`Category: ${result.category || 'N/A'}`);
      console.log(`Type: ${result.type || 'N/A'}`);
      console.log(`ABV: ${result.abv || 'N/A'}%`);
      console.log(`Volume: ${result.volume || 'N/A'}`);
      console.log(`Price: ${result.price ? `$${result.price}` : 'N/A'}`);
      console.log(`Price Range: ${result.price_range || 'N/A'}`);
      console.log(`Image URL: ${result.image_url || 'NO IMAGE FOUND'}`);
      
      if (result.image_url) {
        console.log(`✅ Image extraction successful!`);
      } else {
        console.log(`❌ No image found`);
      }

    } catch (error) {
      console.error(`Error extracting data for ${spirit.name}:`, error);
    }
  }

  console.log('\n\nTest complete!');
}

// Check if we have the required environment variables
if (!config.googleApiKey || !config.searchEngineId) {
  console.error('Missing required environment variables:');
  console.error('- GOOGLE_API_KEY');
  console.error('- SEARCH_ENGINE_ID');
  process.exit(1);
}

// Run the test
testImageExtraction().catch(console.error);