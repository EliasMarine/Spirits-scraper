import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { SpiritData } from '../types/index.js';
import { dataValidator } from './data-validator.js';

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
   * Prepare spirit data for database insertion - TEMPORARY FIX
   * Maps scraper fields to existing database columns
   */
  private prepareForDatabase(spirit: SpiritData): any {
    const dbData: any = {
      name: spirit.name,
      brand: spirit.brand || null,
      category: spirit.category || spirit.type || 'Unknown',
      subcategory: spirit.subcategory || null,
      alcohol_content: spirit.abv || null, // Map abv to alcohol_content
      volume: spirit.volume || null,
      price: spirit.price || null,
      description: spirit.description || null,
      image_url: spirit.image_url || null,
    };

    return dbData;
  }

  // ... rest of the methods remain the same
}