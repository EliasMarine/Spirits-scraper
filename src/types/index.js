import { z } from 'zod';
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
