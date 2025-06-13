#!/usr/bin/env node
/**
 * Fix Metadata, Image URLs, and Quality Scores
 * 
 * This script addresses three critical issues found in the CSV data:
 * 1. Empty metadata objects ({})
 * 2. Missing image URLs
 * 3. Incorrect quality scores (default values instead of calculated)
 * 4. Price extraction issues (years being extracted as prices)
 */

import { createClient } from '@supabase/supabase-js';
import { contentParser } from './src/services/content-parser.js';
import { dataValidator } from './src/services/data-validator.js';
import { googleSearchClient } from './src/services/google-search.js';
import { logger } from './src/utils/logger.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface SpiritRecord {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  image_url?: string;
  metadata?: any;
  data_quality_score?: number;
  source_url?: string;
  description?: string;
  abv?: number;
  proof?: number;
  type?: string;
  category?: string;
}

class MetadataImageQualityFixer {
  
  /**
   * Fix metadata extraction - populate empty metadata objects
   */
  private async fixMetadata(spirit: SpiritRecord): Promise<any> {
    const metadata: any = {
      source: "google_search_api",
      version: "1.0", 
      scraped_at: new Date().toISOString(),
      extraction_method: "enhanced_fix"
    };

    // Add structured data if we have source URL
    if (spirit.source_url) {
      try {
        const parsed = await contentParser.parseUrl(spirit.source_url);
        if (parsed?.metadata) {
          metadata.structured_data = parsed.metadata;
          metadata.og_data = {
            title: parsed.metadata.title,
            description: parsed.metadata.description,
            image: parsed.metadata.image
          };
        }
      } catch (error) {
        logger.debug(`Could not parse URL for metadata: ${spirit.source_url}`);
      }
    }

    // Add product metadata
    if (spirit.name) metadata.product_name = spirit.name;
    if (spirit.brand) metadata.brand_name = spirit.brand;
    if (spirit.type) metadata.spirit_type = spirit.type;
    if (spirit.abv) metadata.alcohol_content = `${spirit.abv}% ABV`;
    if (spirit.proof) metadata.proof_rating = `${spirit.proof} proof`;

    return metadata;
  }

  /**
   * Fix image URL extraction - search for missing images
   */
  private async fixImageUrl(spirit: SpiritRecord): Promise<string | undefined> {
    // If we already have a valid image URL, keep it
    if (spirit.image_url && spirit.image_url.startsWith('http')) {
      return spirit.image_url;
    }

    try {
      // Search for images using Google Image Search
      const searchQuery = spirit.brand ? `${spirit.brand} ${spirit.name}` : spirit.name;
      const imageUrls = await googleSearchClient.searchImages(searchQuery);
      
      if (imageUrls && imageUrls.length > 0) {
        // Return the first valid image URL
        const validImage = imageUrls.find(url => 
          url && 
          url.startsWith('http') && 
          !url.includes('placeholder') &&
          !url.includes('no-image') &&
          !url.includes('1x1')
        );
        
        if (validImage) {
          logger.info(`✅ Found image for "${spirit.name}": ${validImage}`);
          return validImage;
        }
      }
    } catch (error) {
      logger.debug(`Could not find image for "${spirit.name}": ${error}`);
    }

    return undefined;
  }

  /**
   * Fix price extraction - remove invalid prices (years, ages, etc.)
   */
  private fixPrice(spirit: SpiritRecord): number | undefined {
    if (!spirit.price) return undefined;

    // Invalid price patterns - likely years, ages, batch numbers
    const invalidPrices = [
      // Years (1990-2025)
      ...Array.from({length: 36}, (_, i) => 1990 + i),
      // Common ages (2-30)
      ...Array.from({length: 29}, (_, i) => 2 + i),
      // Common proof values (80-150, incrementing by 2)
      ...Array.from({length: 36}, (_, i) => 80 + i * 2),
      // Bottle sizes
      375, 500, 700, 750, 1000, 1750,
      // Common batch numbers
      125, 126, 127, 128, 129, 130
    ];

    if (invalidPrices.includes(spirit.price)) {
      logger.info(`❌ Removing invalid price ${spirit.price} for "${spirit.name}" (likely year/age/proof/volume)`);
      return undefined;
    }

    // Valid price range for spirits
    if (spirit.price < 5 || spirit.price > 5000) {
      logger.info(`❌ Removing out-of-range price ${spirit.price} for "${spirit.name}"`);
      return undefined;
    }

    return spirit.price;
  }

  /**
   * Calculate proper data quality score
   */
  private calculateQualityScore(spirit: SpiritRecord): number {
    let score = 0;
    let maxScore = 0;

    // Core fields (20 points each)
    const coreFields = ['name', 'type', 'brand', 'description'];
    coreFields.forEach(field => {
      maxScore += 20;
      const value = spirit[field as keyof SpiritRecord];
      if (value && value !== '') {
        score += 20;
      }
    });

    // Important fields (10 points each)
    const importantFields = ['abv', 'price', 'image_url', 'source_url'];
    importantFields.forEach(field => {
      maxScore += 10;
      const value = spirit[field as keyof SpiritRecord];
      if (value && value !== '') {
        score += 10;
      }
    });

    // Quality bonuses
    maxScore += 20;
    
    // Good description bonus (10 points)
    if (spirit.description && spirit.description.length > 50 && 
        !spirit.description.includes('I love') && 
        !spirit.description.includes('5 stars')) {
      score += 10;
    }

    // Valid image URL bonus (10 points)
    if (spirit.image_url && spirit.image_url.startsWith('http') && 
        !spirit.image_url.includes('placeholder')) {
      score += 10;
    }

    const finalScore = Math.round((score / maxScore) * 100);
    
    // Ensure minimum score of 20 for spirits with basic info
    return Math.max(finalScore, 20);
  }

  /**
   * Fix a single spirit record
   */
  private async fixSpirit(spirit: SpiritRecord): Promise<any> {
    const updates: any = {};

    // Fix metadata
    const metadata = await this.fixMetadata(spirit);
    updates.metadata = metadata;

    // Fix image URL
    const imageUrl = await this.fixImageUrl(spirit);
    if (imageUrl) {
      updates.image_url = imageUrl;
    }

    // Fix price
    const validPrice = this.fixPrice(spirit);
    if (validPrice !== spirit.price) {
      updates.price = validPrice;
    }

    // Calculate proper quality score
    const qualityScore = this.calculateQualityScore({
      ...spirit,
      ...updates
    });
    updates.data_quality_score = qualityScore;

    return updates;
  }

  /**
   * Process spirits in batches
   */
  async fixAllSpirits(batchSize: number = 50): Promise<void> {
    logger.info('🔧 Starting metadata, image URL, and quality score fixes...');

    let offset = 0;
    let totalProcessed = 0;
    let totalFixed = 0;

    while (true) {
      // Fetch batch of spirits with missing metadata or low quality scores
      const { data: spirits, error } = await supabase
        .from('spirits')
        .select('id, name, brand, price, image_url, metadata, data_quality_score, source_url, description, abv, proof, type, category')
        .or('metadata.is.null,data_quality_score.lt.60,image_url.is.null')
        .range(offset, offset + batchSize - 1)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching spirits:', error);
        break;
      }

      if (!spirits || spirits.length === 0) {
        logger.info('No more spirits to process');
        break;
      }

      logger.info(`\n📦 Processing batch ${Math.floor(offset / batchSize) + 1}: ${spirits.length} spirits`);

      // Process each spirit in the batch
      for (const spirit of spirits) {
        try {
          const updates = await this.fixSpirit(spirit);
          
          // Only update if we have meaningful changes
          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('spirits')
              .update(updates)
              .eq('id', spirit.id);

            if (updateError) {
              logger.error(`Error updating spirit ${spirit.name}:`, updateError);
            } else {
              totalFixed++;
              logger.info(`✅ Fixed: ${spirit.name} (Quality: ${updates.data_quality_score})`);
            }
          }

          totalProcessed++;

          // Rate limiting - avoid overwhelming APIs
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          logger.error(`Error processing spirit ${spirit.name}:`, error);
        }
      }

      offset += batchSize;
      
      // Progress update
      logger.info(`\n📊 Progress: ${totalProcessed} processed, ${totalFixed} fixed`);

      // Break if we processed fewer spirits than batch size (last batch)
      if (spirits.length < batchSize) {
        break;
      }
    }

    logger.info(`\n🎉 Fix complete! Processed ${totalProcessed} spirits, fixed ${totalFixed} spirits`);
  }

  /**
   * Fix specific issues from CSV analysis
   */
  async fixSpecificIssues(): Promise<void> {
    logger.info('🔧 Fixing specific issues identified in CSV analysis...');

    // 1. Fix spirits with years as prices
    const yearPrices = Array.from({length: 36}, (_, i) => 1990 + i); // 1990-2025
    
    for (const year of yearPrices) {
      const { data: spirits, error } = await supabase
        .from('spirits')
        .select('id, name, price')
        .eq('price', year);

      if (spirits && spirits.length > 0) {
        logger.info(`📅 Fixing ${spirits.length} spirits with year ${year} as price`);
        
        const { error: updateError } = await supabase
          .from('spirits')
          .update({ price: null })
          .eq('price', year);
          
        if (updateError) {
          logger.error(`Error fixing year prices for ${year}:`, updateError);
        }
      }
    }

    // 2. Fix spirits with proof values as prices
    const proofValues = Array.from({length: 36}, (_, i) => 80 + i * 2); // 80-150, incrementing by 2
    
    for (const proof of proofValues) {
      const { data: spirits, error } = await supabase
        .from('spirits')
        .select('id, name, price')
        .eq('price', proof);

      if (spirits && spirits.length > 0) {
        logger.info(`🥃 Fixing ${spirits.length} spirits with proof ${proof} as price`);
        
        const { error: updateError } = await supabase
          .from('spirits')
          .update({ price: null })
          .eq('price', proof);
          
        if (updateError) {
          logger.error(`Error fixing proof prices for ${proof}:`, updateError);
        }
      }
    }

    // 3. Fix spirits with ages as prices
    const ages = Array.from({length: 29}, (_, i) => 2 + i); // 2-30
    
    for (const age of ages) {
      const { data: spirits, error } = await supabase
        .from('spirits')
        .select('id, name, price')
        .eq('price', age);

      if (spirits && spirits.length > 0) {
        logger.info(`📅 Fixing ${spirits.length} spirits with age ${age} as price`);
        
        const { error: updateError } = await supabase
          .from('spirits')
          .update({ price: null })
          .eq('price', age);
          
        if (updateError) {
          logger.error(`Error fixing age prices for ${age}:`, updateError);
        }
      }
    }

    // 4. Fix spirits with volume as prices
    const volumes = [750, 1000, 1750];
    
    for (const volume of volumes) {
      const { data: spirits, error } = await supabase
        .from('spirits')
        .select('id, name, price')
        .eq('price', volume);

      if (spirits && spirits.length > 0) {
        logger.info(`📏 Fixing ${spirits.length} spirits with volume ${volume} as price`);
        
        const { error: updateError } = await supabase
          .from('spirits')
          .update({ price: null })
          .eq('price', volume);
          
        if (updateError) {
          logger.error(`Error fixing volume prices for ${volume}:`, updateError);
        }
      }
    }

    logger.info('✅ Specific issue fixes complete');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'fix-all';

  const fixer = new MetadataImageQualityFixer();

  try {
    switch (command) {
      case 'fix-specific':
        await fixer.fixSpecificIssues();
        break;
      case 'fix-all':
      default:
        await fixer.fixSpecificIssues();
        await fixer.fixAllSpirits();
        break;
    }
  } catch (error) {
    logger.error('Error during fix process:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MetadataImageQualityFixer };