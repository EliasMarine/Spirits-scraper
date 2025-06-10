import { spiritExtractor } from './services/spirit-extractor.js';
import { supabaseStorage } from './services/supabase-storage.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

async function enrichMissingImages() {
  logger.info('Starting enrichment of spirits missing images...');

  try {
    // Get spirits that need image enrichment
    const spiritsNeedingImages = await supabaseStorage.getSpiritsNeedingEnrichment(100);
    const spiritsWithoutImages = spiritsNeedingImages.filter(s => !s.image_url);

    logger.info(`Found ${spiritsWithoutImages.length} spirits without images`);

    let successCount = 0;
    let failCount = 0;

    for (const spirit of spiritsWithoutImages) {
      logger.info(`\nProcessing: ${spirit.name} (${spirit.brand || 'No brand'})`);

      try {
        // Extract updated data with focus on images
        const enrichedData = await spiritExtractor.extractSpirit(
          spirit.name,
          spirit.brand,
          {
            maxResults: 10,
            includeRetailers: true,
            deepParse: true, // Enable deep parsing for better image extraction
          }
        );

        // Only update if we found an image
        if (enrichedData.image_url) {
          const updateResult = await supabaseStorage.updateSpirit(spirit.id, {
            image_url: enrichedData.image_url,
            // Also update other fields if they were missing
            abv: spirit.abv || enrichedData.abv,
            volume: spirit.volume || enrichedData.volume,
            price: spirit.price || enrichedData.price,
            price_range: spirit.price_range || enrichedData.price_range,
            description: spirit.description || enrichedData.description,
          });

          if (updateResult.success) {
            successCount++;
            logger.info(`✅ Updated with image: ${enrichedData.image_url}`);
          } else {
            failCount++;
            logger.error(`Failed to update: ${updateResult.error}`);
          }
        } else {
          logger.warn('No image found for this spirit');
          failCount++;
        }

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        failCount++;
        logger.error(`Error processing ${spirit.name}:`, error);
      }
    }

    logger.info('\n=== Enrichment Summary ===');
    logger.info(`Successfully updated: ${successCount}`);
    logger.info(`Failed: ${failCount}`);
    logger.info(`Total processed: ${successCount + failCount}`);

  } catch (error) {
    logger.error('Fatal error during enrichment:', error);
    process.exit(1);
  }
}

// Check environment variables
if (!config.googleApiKey || !config.searchEngineId || !config.supabaseUrl || !config.supabaseServiceKey) {
  logger.error('Missing required environment variables');
  process.exit(1);
}

// Run enrichment
enrichMissingImages().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});