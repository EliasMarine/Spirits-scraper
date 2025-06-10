import { z } from 'zod';

// Google Search API types
export interface GoogleSearchResult {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  cacheId?: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  pagemap?: {
    cse_image?: Array<{ src: string }>;
    metatags?: Array<Record<string, string>>;
    product?: Array<Record<string, string>>;
  };
}

export interface GoogleSearchResponse {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    request: Array<{
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
    }>;
    nextPage?: Array<{
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
    }>;
  };
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items?: GoogleSearchResult[];
}

// Spirit data schema
export const SpiritDataSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  abv: z.number().min(0).max(100).optional(),
  proof: z.number().min(0).max(200).optional(),
  volume: z.string().optional(),
  price: z.number().optional(),
  description: z.string().optional(),
  origin_country: z.string().optional(),
  region: z.string().optional(),
  flavor_profile: z.array(z.string()).optional(),
  age_statement: z.string().nullable().optional(),
  price_range: z.string().optional(),
  image_url: z.string().url().optional(),
  source_url: z.string().url(),
  scraped_at: z.date().default(() => new Date()),
  
  // New fields for enhanced data quality
  whiskey_style: z.string().optional(), // Bottled-in-Bond, Single Barrel, etc.
  cask_type: z.string().optional(), // Ex-bourbon, Sherry, Port, etc.
  mash_bill: z.string().optional(), // Grain composition
  distillery: z.string().optional(),
  bottler: z.string().optional(),
  vintage: z.string().optional(),
  batch_number: z.string().optional(),
  release_year: z.string().optional(),
  limited_edition: z.boolean().optional(),
  in_stock: z.boolean().optional(),
  stock_quantity: z.number().optional(),
  data_quality_score: z.number().min(0).max(100).optional(),
  description_mismatch: z.boolean().optional(),
  awards: z.array(z.string()).optional(),
});

export type SpiritData = z.infer<typeof SpiritDataSchema>;

// Database spirit type with additional fields
export interface DatabaseSpirit extends SpiritData {
  id: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

// Redis configuration
export interface RedisConfig {
  url?: string;
  username?: string;
  password?: string;
  database?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
  // Upstash REST API configuration
  upstashUrl?: string;
  upstashToken?: string;
}

// Scraper configuration
export interface ScraperConfig {
  googleApiKey: string;
  searchEngineId: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  batchSize: number;
  rateLimitPerMinute: number;
  retryAttempts: number;
  retryDelayMs: number;
  redis?: RedisConfig;
}

// Search query options
export interface SearchQueryOptions {
  query: string;
  start?: number;
  num?: number;
  dateRestrict?: string;
  exactTerms?: string;
  excludeTerms?: string;
  siteSearch?: string;
  siteSearchFilter?: 'i' | 'e';
}

// Batch processing
export interface BatchResult {
  successful: SpiritData[];
  failed: Array<{
    query: string;
    error: string;
  }>;
  totalProcessed: number;
  duration: number;
}

// Spirit search item
export interface SpiritSearchItem {
  name: string;
  brand?: string;
  metadata?: Record<string, any>;
}