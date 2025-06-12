import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { dataValidator } from './data-validator.js';
import { logger } from '../utils/logger.js';
export class SupabaseStorage {
    client;
    constructor() {
        this.client = createClient(config.supabaseUrl, config.supabaseServiceKey, {
            auth: {
                persistSession: false,
            },
        });
    }
    /**
     * Store a single spirit in the database
     */
    async storeSpirit(data) {
        try {
            // Validate data
            const validation = dataValidator.validate(data);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`,
                };
            }
            const spiritData = validation.cleaned;
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
            // Debug logging for ABV and price
            if (spiritData.abv || spiritData.price) {
                logger.info(`🔧 Database insert data:`);
                logger.info(`  Name: ${insertData.name}`);
                logger.info(`  ABV: ${insertData.abv} (type: ${typeof insertData.abv})`);
                logger.info(`  Price: ${insertData.price} (type: ${typeof insertData.price})`);
            }
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
        }
        catch (error) {
            return {
                success: false,
                error: `Storage error: ${String(error)}`,
            };
        }
    }
    /**
     * Store multiple spirits in batch
     */
    async storeBatch(spirits) {
        const results = [];
        // Process in smaller batches to avoid timeouts
        const batchSize = 10;
        for (let i = 0; i < spirits.length; i += batchSize) {
            const batch = spirits.slice(i, i + batchSize);
            // Process batch concurrently
            const batchResults = await Promise.all(batch.map(spirit => this.storeSpirit(spirit)));
            results.push(...batchResults);
        }
        return results;
    }
    /**
     * Check if spirit already exists in database
     */
    async checkDuplicate(spirit) {
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
                // Use higher threshold (0.92) to be less aggressive with duplicates
                if (dataValidator.isDuplicate(spirit, candidate, 0.92)) {
                    // Additional checks for year/batch differences
                    const spiritYear = spirit.name.match(/20\d{2}/)?.[0];
                    const candidateYear = candidate.name.match(/20\d{2}/)?.[0];
                    if (spiritYear && candidateYear && spiritYear !== candidateYear) {
                        continue; // Different years = not duplicate
                    }
                    // Check for batch differences
                    const spiritBatch = spirit.name.match(/batch\s*#?\s*(\w+)/i)?.[1];
                    const candidateBatch = candidate.name.match(/batch\s*#?\s*(\w+)/i)?.[1];
                    if (spiritBatch && candidateBatch && spiritBatch !== candidateBatch) {
                        continue; // Different batches = not duplicate
                    }
                    return candidate;
                }
            }
        }
        return null;
    }
    /**
     * Prepare spirit data for database insertion
     */
    prepareForDatabase(spirit) {
        const dbData = {
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
            scraped_data: spirit.scraped_data || {
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
    async linkCategory(spiritId, category) {
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
        }
        else {
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
    async updateSpirit(id, updates) {
        try {
            const { error } = await this.client
                .from('spirits')
                .update(this.prepareForDatabase(updates))
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
        }
        catch (error) {
            return {
                success: false,
                error: `Update error: ${String(error)}`,
            };
        }
    }
    /**
     * Get spirits that need enrichment (missing data)
     */
    async getSpiritsNeedingEnrichment(limit = 50) {
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
    async getStats() {
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
     * Get count of spirits by category or type
     */
    async getSpiritCountByCategory(category) {
        try {
            // Try matching by category field first
            const { data: categoryCount, error: categoryError } = await this.client
                .from('spirits')
                .select('count', { count: 'exact' })
                .ilike('category', category);
            if (!categoryError && categoryCount?.[0]?.count) {
                return categoryCount[0].count;
            }
            // Also try matching by type field for broader matching
            const { data: typeCount, error: typeError } = await this.client
                .from('spirits')
                .select('count', { count: 'exact' })
                .ilike('type', category);
            if (!typeError && typeCount?.[0]?.count) {
                return typeCount[0].count;
            }
            return 0;
        }
        catch (error) {
            logger.error(`Error counting spirits for category ${category}:`, error);
            return 0;
        }
    }
    /**
     * Search for existing spirits
     */
    async searchSpirits(query, limit = 10) {
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
    async ensureBrandExists(brandName) {
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
        }
        catch (error) {
            // Log error but don't fail the spirit insertion
            console.error(`Error ensuring brand exists for ${brandName}:`, error);
        }
    }
}
// Singleton instance
export const supabaseStorage = new SupabaseStorage();
