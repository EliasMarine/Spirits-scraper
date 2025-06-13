import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

async function clearCache() {
  console.log('🧹 Clearing Upstash cache...\n');
  
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  
  try {
    // Option 1: Try to use FLUSHDB (clears entire database)
    console.log('Attempting to flush entire database...');
    await redis.flushdb();
    console.log('✅ Successfully cleared all cache entries!');
  } catch (error: any) {
    console.log('FLUSHDB not available, trying alternative approach...\n');
    
    // Option 2: Clear by pattern types
    const patterns = [
      'spirits-scraper:query:*',
      'spirits-scraper:url:*', 
      'spirits-scraper:spirit:*',
      'spirits-scraper:failed:*'
    ];
    
    let totalDeleted = 0;
    
    for (const pattern of patterns) {
      try {
        console.log(`Clearing pattern: ${pattern}`);
        const keys = await redis.keys(pattern);
        
        if (keys.length > 0) {
          // Delete in chunks of 50 to avoid command size limits
          for (let i = 0; i < keys.length; i += 50) {
            const chunk = keys.slice(i, i + 50);
            await redis.del(...chunk);
            totalDeleted += chunk.length;
            process.stdout.write(`\r  Deleted ${Math.min(i + 50, keys.length)}/${keys.length} keys...`);
          }
          console.log(`\n  ✅ Cleared ${keys.length} keys`);
        } else {
          console.log('  No keys found');
        }
      } catch (err: any) {
        console.error(`  ❌ Error clearing ${pattern}: ${err.message}`);
      }
    }
    
    console.log(`\n✅ Total cleared: ${totalDeleted} cache entries`);
  }
  
  process.exit(0);
}

clearCache().catch(console.error);