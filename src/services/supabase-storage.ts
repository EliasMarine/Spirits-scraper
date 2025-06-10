import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { SpiritData } from '../types/index.js';
import { dataValidator } from './data-validator.js';
import { logger } from '../utils/logger.js';

export interface StorageResult {
  success: boolean;
  id?: string;
  error?: string;
  isDuplicate?: boolean;
}

export class SupabaseStorage {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey,
      {
        auth: {
          persistSession: false,
        },
      },
    );
  }

  /**
   * Store a single spirit in the database
   */
  async storeSpirit(data: Partial<SpiritData>): Promise<StorageResult> {
    try {
      // Validate data
      const validation = dataValidator.validate(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
        };
      }

      const spiritData = validation.cleaned!;

      // Check for duplicates
      const duplicate = await this.checkDuplicate(spiritData);
      if (duplicate) {
        return {
          success: false,
          isDuplicate: true,
          error: `Duplicate spirit found: ${duplicate.name} by ${duplicate.brand}`,
          id: duplicate.id,
        };
      }

      // Ensure brand exists (the trigger will handle this too, but we'll be explicit)
      if (spiritData.brand) {
        await this.ensureBrandExists(spiritData.brand);
      }

      // Prepare data for insertion
      const insertData = this.prepareForDatabase(spiritData);
      
      // Debug logging for all data
      // Removed verbose debug logging for cleaner output
      // logger.info(`Debug: insertData = ${JSON.stringify(insertData, null, 2)}`);

      // Insert into database
      const { data: inserted, error } = await this.client
        .from('spirits')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: `Database error: ${error.message}`,
        };
      }

      // Store categories if present
      if (spiritData.category && inserted.id) {
        await this.linkCategory(inserted.id, spiritData.category);
      }

      return {
        success: true,
        id: inserted.id,
      };
    } catch (error) {
      return {
        success: false,
        error: `Storage error: ${String(error)}`,
      };
    }
  }

  /**
   * Store multiple spirits in batch
   */
  async storeBatch(spirits: Partial<SpiritData>[]): Promise<StorageResult[]> {
    const results: StorageResult[] = [];

    // Process in smaller batches to avoid timeouts
    const batchSize = 10;
    for (let i = 0; i < spirits.length; i += batchSize) {
      const batch = spirits.slice(i, i + batchSize);

      // Process batch concurrently
      const batchResults = await Promise.all(
        batch.map(spirit => this.storeSpirit(spirit)),
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Check if spirit already exists in database
   */
  private async checkDuplicate(spirit: SpiritData): Promise<any | null> {
    // First, try exact match on name and brand
    if (spirit.brand) {
      const { data: exactMatch } = await this.client
        .from('spirits')
        .select('id, name, brand, abv')
        .eq('name', spirit.name)
        .eq('brand', spirit.brand)
        .single();

      if (exactMatch) {
        return exactMatch;
      }
    }

    // Then, try fuzzy matching
    const { data: candidates } = await this.client
      .from('spirits')
      .select('id, name, brand, abv')
      .or(`name.ilike.%${spirit.name}%,brand.ilike.%${spirit.brand || ''}%`)
      .limit(10);

    if (candidates && candidates.length > 0) {
      for (const candidate of candidates) {
        if (dataValidator.isDuplicate(spirit, candidate)) {
          return candidate;
        }
      }
    }

    return null;
  }

  /**
   * Prepare spirit data for database insertion
   */
  private prepareForDatabase(spirit: SpiritData): any {
    const dbData: any = {
      name: spirit.name,
      brand: spirit.brand || null,
      type: spirit.type || null,
      abv: spirit.abv || null,
      price: spirit.price || null,
      description: spirit.description || null,
      origin_country: spirit.origin_country || null,
      region: spirit.region || null,
      age_statement: spirit.age_statement || null,
      price_range: spirit.price_range || null,
      image_url: spirit.image_url || null,
      source_url: spirit.source_url,
      flavor_profile: spirit.flavor_profile || null,
      is_available: true,
      scraped_data: {
        scraped_at: spirit.scraped_at,
        source: 'google_search_api',
        version: '1.0',
      },
      category: spirit.category || null,
      subcategory: spirit.subcategory || null,
      volume: spirit.volume || null,
      
      // Enhanced data quality fields
      whiskey_style: spirit.whiskey_style || null,
      cask_type: spirit.cask_type || null,
      mash_bill: spirit.mash_bill || null,
      distillery: spirit.distillery || null,
      bottler: spirit.bottler || null,
      vintage: spirit.vintage || null,
      batch_number: spirit.batch_number || null,
      release_year: spirit.release_year || null,
      limited_edition: spirit.limited_edition || null,
      in_stock: spirit.in_stock || null,
      stock_quantity: spirit.stock_quantity || null,
      data_quality_score: spirit.data_quality_score || null,
      description_mismatch: spirit.description_mismatch || null,
      awards: spirit.awards || null,
    };

    return dbData;
  }

  /**
   * Link spirit to category
   */
  private async linkCategory(spiritId: string, category: string): Promise<void> {
    // First, find or create the category
    const { data: categoryData } = await this.client
      .from('categories')
      .select('id')
      .eq('name', category)
      .single();

    if (!categoryData) {
      // Create category if it doesn't exist
      const { data: newCategory } = await this.client
        .from('categories')
        .insert({
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
        })
        .select()
        .single();

      if (newCategory) {
        await this.client
          .from('spirit_categories')
          .insert({
            spirit_id: spiritId,
            category_id: newCategory.id,
          });
      }
    } else {
      // Link to existing category
      await this.client
        .from('spirit_categories')
        .insert({
          spirit_id: spiritId,
          category_id: categoryData.id,
        });
    }
  }

  /**
   * Update existing spirit data
   */
  async updateSpirit(id: string, updates: Partial<SpiritData>): Promise<StorageResult> {
    try {
      const { error } = await this.client
        .from('spirits')
        .update(this.prepareForDatabase(updates as SpiritData))
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: `Update failed: ${error.message}`,
        };
      }

      return {
        success: true,
        id,
      };
    } catch (error) {
      return {
        success: false,
        error: `Update error: ${String(error)}`,
      };
    }
  }

  /**
   * Get spirits that need enrichment (missing data)
   */
  async getSpiritsNeedingEnrichment(limit: number = 50): Promise<any[]> {
    const { data } = await this.client
      .from('spirits')
      .select('id, name, brand, abv, description, price_range, image_url')
      .or('abv.is.null,description.is.null,price_range.is.null,image_url.is.null')
      .limit(limit);

    return data || [];
  }

  /**
   * Get statistics about stored spirits
   */
  async getStats(): Promise<any> {
    const { data: totalCount } = await this.client
      .from('spirits')
      .select('count', { count: 'exact' });

    const { data: byCategory } = await this.client
      .from('spirit_categories')
      .select('category:categories(name)');

    const { data: missingData } = await this.client
      .from('spirits')
      .select('count', { count: 'exact' })
      .or('abv.is.null,description.is.null,price_range.is.null');

    return {
      total: totalCount?.[0]?.count || 0,
      byCategory: byCategory || [],
      needsEnrichment: missingData?.[0]?.count || 0,
    };
  }

  /**
   * Search for existing spirits
   */
  async searchSpirits(query: string, limit: number = 10): Promise<any[]> {
    const { data } = await this.client
      .from('spirits')
      .select('*')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    return data || [];
  }

  /**
   * Ensure brand exists in brands table
   */
  private async ensureBrandExists(brandName: string): Promise<void> {
    try {
      // Check if brand already exists
      const { data: existingBrand } = await this.client
        .from('brands')
        .select('id')
        .eq('name', brandName)
        .single();

      if (!existingBrand) {
        // Create the brand
        const slug = brandName.toLowerCase().replace(/\s+/g, '-');
        await this.client
          .from('brands')
          .insert({
            name: brandName,
            slug: slug,
          })
          .select();
      }
    } catch (error) {
      // Log error but don't fail the spirit insertion
      console.error(`Error ensuring brand exists for ${brandName}:`, error);
    }
  }
}

// Singleton instance
export const supabaseStorage = new SupabaseStorage();