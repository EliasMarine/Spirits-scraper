#!/usr/bin/env node

import { Command } from 'commander';
import { config } from 'dotenv';
import { spiritExtractor } from './services/spirit-extractor.js';
import { QueryGenerator } from './services/query-generator.js';
import { EnhancedQueryGenerator } from './services/enhanced-query-generator.js';
import { diversifiedQueryGenerator } from './services/diversified-query-generator.js';
import { optimizedQueryGenerator } from './services/optimized-query-generator.js';
import { BatchProcessor } from './services/batch-processor.js';
import { SupabaseStorage } from './services/supabase-storage.js';
import { autonomousDiscovery } from './services/autonomous-discovery.js';
import { spiritDiscovery } from './services/spirit-discovery.js';
import { cacheService } from './services/cache-service.js';
import { backupService } from './services/backup-service.js';
import { deduplicationService } from './services/deduplication-service.js';
import { distilleryScraper } from './services/distillery-scraper.js';
import { catalogFocusedScraper } from './services/catalog-focused-scraper.js';
import { autoDeduplicationService } from './services/auto-deduplication.js';
import { getConfigSummary } from './config/auto-dedup-config.js';
import { optimizedCatalogScraper } from './services/optimized-catalog-scraper.js';
import { ultraEfficientScraper } from './services/ultra-efficient-scraper.js';
import { ALL_DISTILLERIES } from './config/distilleries.js';
import { createClient } from '@supabase/supabase-js';
import { logger } from './utils/logger.js';
import { apiCallTracker } from './services/api-call-tracker.js';
import { isExcludedDomain } from './config/excluded-domains.js';
import { smartSiteSelector } from './services/smart-site-selector.js';
import { distilleryScrapeTracker } from './services/distillery-scrape-tracker.js';
import ora from 'ora';

// Load environment variables
config();

const program = new Command();

program
  .name('spirits-scraper')
  .description('Smart spirits data scraper with enhanced intelligence')
  .version('2.0.0');

// Main scrape command - smart by default
program
  .command('scrape')
  .description('Scrape spirits data (enhanced features and API stats enabled by default)')
  .option('-c, --categories <categories>', 'Spirit categories (bourbon,whiskey,scotch,tequila,rum,gin)', 'bourbon')
  .option('-l, --limit <number>', 'Number of spirits to scrape', '50')
  .option('-b, --batch-size <number>', 'Concurrent searches', '3')
  .option('--distillery <name>', 'Scrape specific distillery')
  .option('--discover', 'Enable autonomous discovery mode')
  .option('-q, --quiet', 'Reduce output verbosity')
  .option('-v, --verbose', 'Enable detailed logging')
  .option('--no-auto-dedup', 'Disable automatic deduplication after scraping')
  .option('--dedup-threshold <number>', 'Number of spirits before auto-dedup (default: 10)', '10')
  .option('--force-refresh', 'Bypass cache and force fresh API calls (for testing/development)')
  .option('--clear-cache', 'Clear cache before scraping')
  .option('--cache-only', 'Only use cached results, no API calls')
  .option('--max-cache-age <hours>', 'Maximum cache age in hours', '6')
  .option('--hide-api-stats', 'Hide detailed API call statistics')
  .option('--diversify-queries', 'Use diversified query generation to avoid cache collisions')
  .option('--diversity-level <level>', 'Query diversity level (low|medium|high)', 'medium')
  .option('--optimize-queries', 'Use optimized query generation for maximum API efficiency')
  .option('--target-efficiency <number>', 'Target spirits per API call (default: 3.0)', '3.0')
  .option('--optimized', 'DEPRECATED - Optimized scraper is now the default for distillery mode')
  .action(async (options) => {
    // Set log level based on options
    if (options.quiet) {
      process.env.LOG_LEVEL = 'error';
    } else if (options.verbose) {
      process.env.LOG_LEVEL = 'info';
    } else {
      // Default to clean output
      process.env.LOG_LEVEL = 'warn';
    }
    
    const spinner = ora('Initializing smart scraper...').start();
    
    try {
      // Parse options
      const categories = options.categories.split(',').map((c: string) => c.trim());
      const limit = parseInt(options.limit);
      const batchSize = parseInt(options.batchSize);
      
      spinner.succeed('Smart scraper initialized');
      logger.info(`Categories: ${categories.join(', ')}`);
      logger.info(`Limit: ${limit} spirits`);
      logger.info(`Batch size: ${batchSize}`);
      
      // Initialize services
      const storage = new SupabaseStorage();
      await cacheService.initialize();
      
      // Handle cache management options
      if (options.clearCache) {
        spinner.text = 'Clearing cache...';
        await cacheService.clearCache();
        console.log('🗑️  Cache cleared successfully');
      }
      
      // Set cache bypass mode if force-refresh is enabled
      if (options.forceRefresh) {
        cacheService.setBypassMode(true);
        console.log('🔄 Force refresh enabled - bypassing cache for all API calls');
      }
      
      // Set cache-only mode if enabled
      if (options.cacheOnly) {
        process.env.CACHE_ONLY_MODE = 'true';
        console.log('💾 Cache-only mode enabled - no API calls will be made');
      }
      
      // Set custom cache age if specified
      if (options.maxCacheAge) {
        const maxAgeHours = parseInt(options.maxCacheAge);
        console.log(`⏰ Using cache entries newer than ${maxAgeHours} hours`);
        // TODO: Implement cache age filtering in cache service
      }
      
      const queryGenerator = new QueryGenerator();
      const enhancedGenerator = new EnhancedQueryGenerator();
      const batchProcessor = new BatchProcessor({ concurrency: batchSize });
      
      let totalScraped = 0;
      let totalErrors = 0;
      let cacheHits = 0;
      let apiCalls = 0;
      const startTime = Date.now();
      
      // Generate queries based on options
      let queries: string[] = [];
      
      // Always use optimized scraper for distillery mode (default behavior)
      if (options.distillery) {
        spinner.text = '🚀 Starting HIGH-EFFICIENCY catalog scraping (60%+ efficiency)...';
        
        // Optimized distillery scraping
        const distilleryNames = options.distillery.split(',').map((d: string) => d.trim());
        
        for (const distilleryName of distilleryNames) {
          const distillery = ALL_DISTILLERIES.find(d => 
            d.name.toLowerCase().includes(distilleryName.toLowerCase()) ||
            d.variations.some(v => v.toLowerCase().includes(distilleryName.toLowerCase()))
          );
          
          if (!distillery) {
            console.error(`❌ Distillery "${distilleryName}" not found`);
            continue;
          }
          
          console.log(`\n📊 Optimized scraping for ${distillery.name}...`);
          
          const result = await optimizedCatalogScraper.scrapeDistilleryOptimized(
            distillery,
            parseInt(options.limit) || 10
          );
          
          console.log(`\n✅ ${distillery.name} Results:`);
          console.log(`  API Calls: ${result.apiCalls}`);
          console.log(`  Spirits Found: ${result.spiritsFound}`);
          console.log(`  Spirits Stored: ${result.spiritsStored}`);
          console.log(`  Efficiency: ${(result.efficiency * 100).toFixed(1)}% (${result.efficiency.toFixed(1)} spirits/call)`);
          console.log(`  Catalog Pages: ${result.catalogPagesFound}`);
          
          if (result.efficiency >= 0.6) {
            console.log(`  🎯 Target efficiency achieved!`);
          }
        }
        
        spinner.succeed('Optimized scraping complete!');
        return;
      }
      
      // ALWAYS use ultra-efficient scraper for category-based scraping
      if (options.discover) {
        // Autonomous discovery mode
        spinner.text = 'Running autonomous discovery...';
        const discoveryResult = await autonomousDiscovery.runDiscovery(
          limit,
          categories[0] // Use first category for discovery
        );
        
        // Discovery mode already processes and stores spirits internally
        spinner.succeed(`Discovery complete! Found ${discoveryResult.spiritsFound} spirits`);
        console.log(`📊 Discovered from ${discoveryResult.distilleries.length} distilleries`);
        console.log(`🥃 Found ${discoveryResult.bottles.length} unique bottles`);
        
        // Skip the rest of the processing since discovery handles it
        return;
      } else if (options.diversifyQueries) {
        // Diversified query generation mode
        spinner.text = 'Generating diversified queries to avoid cache collisions...';
        
        const diversityOptions = {
          minCacheAge: parseInt(options.maxCacheAge) || 6,
          maxCacheHitRate: options.diversityLevel === 'high' ? 0.1 : options.diversityLevel === 'low' ? 0.5 : 0.3,
          useTimeRandomization: true,
          useBrandRotation: true,
          useRegionalVariation: true,
          forceUniqueQueries: true,
        };
        
        // Generate queries for each category
        const allQueryResults = [];
        for (const category of categories) {
          const categoryLimit = Math.ceil(limit / categories.length);
          const result = await diversifiedQueryGenerator.generateDiversifiedQueries({
            category,
            limit: categoryLimit,
            ...diversityOptions,
          });
          
          allQueryResults.push(result);
          queries.push(...result.queries);
        }
        
        // Display diversity analytics
        const totalAnalytics = allQueryResults.reduce((acc, result) => ({
          totalGenerated: acc.totalGenerated + result.analytics.totalGenerated,
          expectedCacheMisses: acc.expectedCacheMisses + result.analytics.expectedCacheMisses,
          diversityScore: acc.diversityScore + result.analytics.diversityScore,
        }), { totalGenerated: 0, expectedCacheMisses: 0, diversityScore: 0 });
        
        const avgDiversityScore = totalAnalytics.diversityScore / allQueryResults.length;
        const cacheMissRate = (totalAnalytics.expectedCacheMisses / totalAnalytics.totalGenerated) * 100;
        
        console.log(`🎯 Generated ${totalAnalytics.totalGenerated} diversified queries`);
        console.log(`📊 Expected cache miss rate: ${cacheMissRate.toFixed(1)}%`);
        console.log(`🏆 Average diversity score: ${avgDiversityScore.toFixed(1)}/100`);
        
        queries = queries.slice(0, limit);
      } else if (options.optimizeQueries) {
        // Optimized query generation for maximum API efficiency
        spinner.text = 'Generating optimized queries for maximum API efficiency...';
        
        const targetEfficiency = parseFloat(options.targetEfficiency);
        
        // Generate optimized queries for each category
        const allQueries: string[] = [];
        for (const category of categories) {
          const categoryLimit = Math.ceil(limit / categories.length);
          const optimizedQueries = await optimizedQueryGenerator.generateOptimizedQueries({
            category,
            limit: categoryLimit,
            avoidCachedQueries: true,
            targetEfficiency
          });
          allQueries.push(...optimizedQueries);
        }
        
        queries = allQueries.slice(0, limit);
        
        console.log(`🎯 Generated ${queries.length} optimized queries`);
        console.log(`📈 Target efficiency: ${targetEfficiency} spirits per API call`);
        
        // Analyze query potential
        let totalPotential = 0;
        for (const query of queries.slice(0, 5)) {
          const potential = await optimizedQueryGenerator.analyzeQueryPotential(query);
          totalPotential += potential;
        }
        const avgPotential = totalPotential / 5;
        console.log(`💡 Estimated yield: ${avgPotential.toFixed(1)} spirits per query`);
      } else {
        // DEFAULT: Use ultra-efficient scraper for ALL category-based scraping
        spinner.text = '🚀 Starting ULTRA-EFFICIENT scraping (60%+ efficiency)...';
        console.log('\\n📊 Using ultra-efficient catalog scraping for maximum API efficiency');
        
        // Process each category with ultra-efficient scraper
        let totalSpiritsFound = 0;
        let totalSpiritsStored = 0;
        let totalApiCalls = 0;
        
        for (const category of categories) {
          const categoryLimit = Math.ceil(limit / categories.length);
          
          console.log(`\\n🔍 Scraping ${category} with ultra-efficient mode...`);
          
          const result = await ultraEfficientScraper.scrapeWithUltraEfficiency({
            category,
            limit: categoryLimit,
            targetEfficiency: 60,
            deepExtraction: true // Enable deep extraction to parse catalog pages
          });
          
          totalSpiritsFound += result.spiritsFound;
          totalSpiritsStored += result.spiritsStored;
          totalApiCalls += result.apiCalls;
          
          console.log(`✅ ${category} complete:`);
          console.log(`   Found: ${result.spiritsFound} spirits`);
          console.log(`   Stored: ${result.spiritsStored} spirits`);
          console.log(`   API Calls: ${result.apiCalls}`);
          console.log(`   Efficiency: ${(result.efficiency * 100).toFixed(1)}% (${result.efficiency.toFixed(1)} spirits/call)`);
          console.log(`   Catalog Pages: ${result.catalogPagesFound}`);
        }
        
        // Display final stats
        const overallEfficiency = totalApiCalls > 0 ? totalSpiritsFound / totalApiCalls : 0;
        console.log('\\n' + '='.repeat(60));
        console.log('📊 ULTRA-EFFICIENT SCRAPING COMPLETE');
        console.log('='.repeat(60));
        console.log(`Total API Calls: ${totalApiCalls}`);
        console.log(`Total Spirits Found: ${totalSpiritsFound}`);
        console.log(`Total Spirits Stored: ${totalSpiritsStored}`);
        console.log(`Overall Efficiency: ${(overallEfficiency * 100).toFixed(1)}% (${overallEfficiency.toFixed(1)} spirits/call)`);
        
        spinner.succeed('Ultra-efficient scraping complete!');
        return;
      }
      
      // This code is now unreachable - ultra-efficient scraper is the default
      logger.info(`Generated queries: ${JSON.stringify(queries)}`);
      
      spinner.text = `Processing ${queries.length} queries...`;
      
      // Process queries sequentially with rate limiting
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        const progress = `(${i + 1}/${queries.length})`;
        
        // Show real-time API efficiency in spinner text
        const currentApiStats = apiCallTracker.getStats();
        const efficiencyText = currentApiStats.totalCalls > 0 
          ? ` | Efficiency: ${currentApiStats.efficiency.toFixed(2)} spirits/call` 
          : '';
        
        spinner.text = `${progress} Processing: ${query.substring(0, 35)}...${efficiencyText}`;
        try {
          // First, discover actual spirits from the search query
          const discoveredSpirits = await spiritDiscovery.discoverSpiritsFromQuery(query, 5);
          
          if (discoveredSpirits.length === 0) {
            console.log(`${progress} ⚠️  No spirits found for: ${query.substring(0, 30)}...`);
            continue; // Continue to next query instead of return
          }
          
          // Process each discovered spirit
          for (const discovered of discoveredSpirits) {
            try {
              // Extract detailed spirit data
              const spiritData = await spiritExtractor.extractSpirit(
                discovered.name,
                discovered.brand,
                {
                  deepParse: limit <= 100,
                  maxResults: 10,
                }
              );
              
              // CRITICAL: Final validation before storage
              const cleanName = spiritData.name?.toLowerCase().trim() || '';
              const genericCategories = [
                'bottled in bond bourbon',
                'barrel strength bourbons',
                'cask strength bourbons',
                'single barrel bourbons',
                'small batch bourbons',
                'straight bourbon whiskey',
                'kentucky straight bourbon',
                'bourbon whiskey',
                'rye whiskey',
                'barrel/cask strength bourbons',
                'barrel strength bourbon',
                'cask strength bourbon',
                'single barrel bourbon',
                'small batch bourbon'
              ];
              
              // Skip if it's a generic category
              if (genericCategories.includes(cleanName)) {
                console.log(`❌ Skipping generic category: ${spiritData.name}`);
                continue;
              }
              
              // Skip if data quality is too low
              if ((spiritData.data_quality_score || 0) < 40) {
                console.log(`❌ Skipping low quality data: ${spiritData.name} (score: ${spiritData.data_quality_score})`);
                continue;
              }
              
              // Skip if no valid source URL
              if (!spiritData.source_url || spiritData.source_url.length === 0) {
                console.log(`❌ Skipping - no valid source URL: ${spiritData.name}`);
                continue;
              }
              
              // CRITICAL: Skip if source URL contains excluded domain
              if (spiritData.source_url && isExcludedDomain(spiritData.source_url)) {
                console.log(`❌ Skipping - excluded domain in source URL: ${spiritData.name} (${spiritData.source_url})`);
                continue;
              }
              
              // Store in database
              const stored = await storage.storeSpirit(spiritData);
              
              if (stored.success) {
                totalScraped++;
                const quality = spiritData.data_quality_score || 0;
                const qualityEmoji = quality >= 80 ? '🌟' : quality >= 60 ? '✅' : '⚠️';
                
                // Clean, concise success message
                console.log(`${qualityEmoji} ${spiritData.name} (${spiritData.type}) - Quality: ${quality}/100`);
                
                // Only show style/subcategory if different from type
                if (spiritData.whiskey_style && spiritData.whiskey_style !== spiritData.type) {
                  console.log(`   └─ Style: ${spiritData.whiskey_style}`);
                }
                if (spiritData.subcategory && spiritData.subcategory !== spiritData.type && spiritData.subcategory !== spiritData.whiskey_style) {
                  console.log(`   └─ Category: ${spiritData.subcategory}`);
                }
                if (spiritData.description_mismatch) {
                  console.log(`   ⚠️  Description quality issue detected`);
                }
                
                // Track site metrics for smart site selection
                if (spiritData.source_url) {
                  try {
                    const url = new URL(spiritData.source_url);
                    const domain = url.hostname.replace('www.', '');
                    
                    // Calculate fields populated
                    const fieldsPopulated = [
                      spiritData.name,
                      spiritData.brand,
                      spiritData.type,
                      spiritData.description,
                      spiritData.abv,
                      spiritData.price,
                      spiritData.age_statement,
                      spiritData.distillery,
                      spiritData.origin_country,
                      spiritData.image_url
                    ].filter(field => field !== undefined && field !== null && field !== '').length;
                    
                    // Update site metrics
                    await smartSiteSelector.updateSiteMetrics(
                      domain,
                      true, // success
                      quality, // data quality score
                      fieldsPopulated,
                      spiritData.description?.length || 0,
                      !!spiritData.price
                    );
                  } catch (urlError) {
                    // Ignore URL parsing errors
                  }
                }
              } else if (stored.isDuplicate) {
                console.log(`⏭️  Skipped duplicate: ${spiritData.name}`);
              }
              
              // Don't return here - continue processing other spirits
            } catch (error) {
              console.log(`❌ Failed to extract: ${discovered.name}`);
            }
          }
          
          // Don't return here - continue to next query
        } catch (error) {
          totalErrors++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`${progress} ❌ Error: ${errorMessage.split('\n')[0]}`);
          
          // Check if API limit has been reached
          if (errorMessage.includes('Daily API limit') || errorMessage.includes('API limit reached')) {
            spinner.fail('API limit reached!');
            console.log('\n🛑 Stopping scraper - Daily API limit has been reached.');
            console.log('💡 Tip: Use caching to avoid hitting the API limit. Run with --cache-only to use only cached results.');
            break; // Exit the loop
          }
          
          // Skip silently if in cache-only mode and no cache found
          if (errorMessage.includes('Cache-only mode enabled')) {
            // Don't count as error, just skip
            totalErrors--;
            continue;
          }
        }
        
        // Show periodic efficiency updates for long scraping sessions
        if ((i + 1) % 10 === 0 && i > 0) {
          const currentStats = apiCallTracker.getStats();
          if (currentStats.totalCalls > 0) {
            console.log(`\n📊 Progress Update: ${currentStats.spiritsFound} spirits found from ${currentStats.totalCalls} API calls (${currentStats.efficiency.toFixed(2)} efficiency)`);
            
            // Show recommendations if efficiency is concerning
            if (currentStats.efficiency < 1.0 && currentStats.totalCalls >= 5) {
              const recommendations = apiCallTracker.getEfficiencyRecommendations();
              console.log(`💡 Efficiency tip: ${recommendations[0]}`);
            }
          }
        }
        
        // Rate limiting between queries
        if (i < queries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      }
      
      const duration = (Date.now() - startTime) / 1000;
      
      spinner.succeed('Scraping complete!');
      
      // Display API call efficiency
      apiCallTracker.displayCurrentStats();
      
      // Check if we hit the API limit
      const finalStats = apiCallTracker.getStats();
      const hitApiLimit = finalStats.totalCalls >= finalStats.dailyLimit;
      
      console.log('\n📊 SUMMARY');
      console.log('─'.repeat(40));
      console.log(`✅ Scraped: ${totalScraped} spirits`);
      console.log(`❌ Errors: ${totalErrors}`);
      console.log(`⏱️  Duration: ${duration.toFixed(2)}s`);
      console.log(`⚡ Speed: ${(totalScraped / duration).toFixed(2)} spirits/second`);
      
      if (hitApiLimit) {
        console.log('\n⚠️  API LIMIT REACHED');
        console.log('─'.repeat(40));
        console.log('You have reached your daily Google Search API limit.');
        console.log('\nOptions to continue:');
        console.log('1. Wait until tomorrow for the limit to reset');
        console.log('2. Use --cache-only mode to search only cached results');
        console.log('3. Upgrade your Google Search API quota');
        console.log('\nExample: npm run scrape -- --cache-only --categories bourbon --limit 100');
      } else if (finalStats.totalCalls > finalStats.dailyLimit * 0.8) {
        console.log(`\n⚠️  Warning: ${finalStats.dailyLimit - finalStats.totalCalls} API calls remaining today`);
      }
      
      // Show detailed API statistics (now default, unless hidden)
      if (!options.hideApiStats) {
        console.log('\n🔍 DETAILED API STATISTICS');
        console.log('─'.repeat(50));
        const cacheStats = await cacheService.getStats();
        console.log(`📦 Total cache entries: ${cacheStats.totalEntries}`);
        console.log(`📁 Cache size: ${(cacheStats.sizeBytes / 1024).toFixed(2)} KB`);
        console.log(`🔄 Search queries cached: ${cacheStats.byType.search_query || 0}`);
        console.log(`🌐 URLs cached: ${cacheStats.byType.url_content || 0}`);
        console.log(`🥃 Spirit data cached: ${cacheStats.byType.spirit_data || 0}`);
        console.log(`❌ Failed attempts cached: ${cacheStats.byType.failed_attempt || 0}`);
        
        const apiStats = apiCallTracker.getStats();
        console.log(`\n💡 API EFFICIENCY INSIGHTS:`);
        if (apiStats.efficiency >= 2.0) {
          console.log(`🌟 Excellent! You're getting ${apiStats.efficiency.toFixed(2)} spirits per API call`);
        } else if (apiStats.efficiency >= 1.0) {
          console.log(`✅ Good efficiency: ${apiStats.efficiency.toFixed(2)} spirits per API call`);
        } else {
          console.log(`⚠️  Low efficiency: ${apiStats.efficiency.toFixed(2)} spirits per API call`);
        }

        // Show efficiency recommendations
        const recommendations = apiCallTracker.getEfficiencyRecommendations();
        if (recommendations.length > 0) {
          console.log(`\n🎯 EFFICIENCY RECOMMENDATIONS:`);
          recommendations.forEach(rec => console.log(`  ${rec}`));
        }

        // Show cache analysis
        const cacheAnalysis = apiCallTracker.getCacheAnalysis();
        console.log(`\n📊 CACHE ANALYSIS:`);
        console.log(`  Recent API efficiency: ${cacheAnalysis.cacheHitRate.toFixed(2)} spirits/call`);
        console.log(`  ${cacheAnalysis.recommendation}`);
      }
      
      // Auto-run comprehensive deduplication for quality
      if (options.autoDedup !== false) {
        // Update auto-dedup config if threshold was provided
        if (options.dedupThreshold) {
          autoDeduplicationService.updateConfig({
            minSpiritsThreshold: parseInt(options.dedupThreshold)
          });
        }
        
        // Run auto-deduplication
        const autoDedupResult = await autoDeduplicationService.runIfNeeded(
          totalScraped,
          {
            dryRun: false,
            config: {
              notifications: {
                showSummary: true,
                showDetails: true,
                logToFile: false
              }
            }
          }
        );
        
        if (!autoDedupResult.ran && totalScraped > 0) {
          const config = autoDeduplicationService.getConfig();
          console.log(`\n💡 Tip: Auto-deduplication runs after scraping ${config.minSpiritsThreshold}+ spirits`);
          console.log('   Use --dedup-threshold to change or --no-auto-dedup to disable');
        }
      } else {
        console.log('\n💡 Auto-deduplication was disabled for this run');
      }
      
    } catch (error) {
      spinner.fail('Scraping failed');
      logger.error('Fatal error:', error);
      process.exit(1);
    }
  });

// Deduplication command
program
  .command('dedup')
  .description('Find and merge duplicate spirits')
  .option('-t, --threshold <number>', 'Similarity threshold (0-1)', '0.85')
  .option('--dry-run', 'Preview without making changes')
  .option('--exact-only', 'Run only exact match deduplication')
  .option('--fuzzy-only', 'Run only fuzzy match deduplication')
  .option('--no-blocking', 'Disable blocking optimization for large datasets')
  .option('--blocking-only', 'Show blocking statistics without deduplication')
  .action(async (options) => {
    const spinner = ora('Analyzing spirits for duplicates...').start();
    
    try {
      const threshold = parseFloat(options.threshold);
      const runExactMatch = !options.fuzzyOnly;
      const runFuzzyMatch = !options.exactOnly;
      
      // Check if only showing blocking statistics
      if (options.blockingOnly) {
        const { BlockingDeduplicationService } = await import('./services/blocking-deduplication.js');
        const blockingService = new BlockingDeduplicationService();
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_KEY!
        );
        
        const { data: spirits } = await supabase
          .from('spirits')
          .select('*');
        
        spinner.text = 'Creating blocks...';
        const blocks = blockingService.createBlocks(spirits || []);
        const reduction = blockingService.calculateReduction(spirits?.length || 0, blocks);
        
        spinner.succeed('Blocking analysis complete!');
        console.log('\n🔍 BLOCKING STATISTICS');
        console.log('─'.repeat(40));
        console.log(`Total spirits: ${spirits?.length || 0}`);
        console.log(`Total blocks created: ${blocks.size}`);
        console.log(`Comparisons without blocking: ${reduction.withoutBlocking.toLocaleString()}`);
        console.log(`Comparisons with blocking: ${reduction.withBlocking.toLocaleString()}`);
        console.log(`Reduction: ${reduction.reductionPercentage.toFixed(1)}%`);
        console.log(`\nBlock distribution:`);
        const blockArray = Array.from(blocks.values());
        const sizes = blockArray.map(b => b.size).sort((a, b) => b - a);
        console.log(`  Largest block: ${sizes[0]} spirits`);
        console.log(`  Smallest block: ${sizes[sizes.length - 1]} spirits`);
        console.log(`  Average block size: ${(sizes.reduce((a, b) => a + b, 0) / sizes.length).toFixed(1)} spirits`);
        return;
      }
      
      // Use optimized deduplication with blocking if not disabled
      if (options.blocking !== false) {
        spinner.text = 'Running optimized deduplication with blocking...';
        const result = await deduplicationService.runOptimizedDeduplication({
          dryRun: options.dryRun,
          useBlocking: true,
          customConfig: {
            combinedThreshold: threshold,
            autoMergeThreshold: options.dryRun ? 1.0 : 0.9,
          }
        });
        
        spinner.succeed('Optimized deduplication complete!');
        console.log('\n📊 RESULTS');
        console.log('─'.repeat(40));
        console.log(`📋 Spirits processed: ${result.totalProcessed}`);
        console.log(`🔗 Duplicates found: ${result.duplicatesFound}`);
        console.log(`⏱️  Processing time: ${(result.processingTime / 1000).toFixed(2)}s`);
        
        if (result.blockingStats) {
          console.log('\n🎯 BLOCKING OPTIMIZATION');
          console.log(`📦 Total blocks: ${result.blockingStats.totalBlocks}`);
          console.log(`🚀 Comparison reduction: ${result.blockingStats.reductionPercentage.toFixed(1)}%`);
          console.log(`📉 Comparisons: ${result.blockingStats.comparisonsWithBlocking.toLocaleString()} vs ${result.blockingStats.comparisonsWithoutBlocking.toLocaleString()}`);
        }
        
        if (options.dryRun && result.duplicatesFound > 0) {
          console.log('\n💡 Run without --dry-run to merge these duplicates');
        }
        
      } else {
        // Use comprehensive deduplication without blocking
        const result = await deduplicationService.runComprehensiveDeduplication({
          dryRun: options.dryRun,
          runExactMatch,
          runFuzzyMatch,
          customConfig: {
            combinedThreshold: threshold,
            autoMergeThreshold: options.dryRun ? 1.0 : 0.9,
          }
        });
        
        spinner.succeed('Deduplication complete!');
        console.log('\n📊 RESULTS');
        console.log('─'.repeat(40));
        
        // Show exact match results
        if (result.exactMatchResults) {
          console.log('\n🎯 EXACT MATCH DEDUPLICATION');
          console.log(`📋 Groups found: ${result.exactMatchResults.stats.totalGroups}`);
          console.log(`🔗 Duplicates: ${result.exactMatchResults.stats.totalDuplicates}`);
          console.log(`✅ Auto-merge: ${result.exactMatchResults.stats.byMergeStrategy.auto || 0} groups`);
          console.log(`⚠️  Manual review: ${result.exactMatchResults.stats.byMergeStrategy.manual || 0} groups`);
          console.log(`✨ Merged: ${result.exactMatchResults.mergeResults.merged}`);
        }
        
        // Show fuzzy match results
        if (result.fuzzyMatchResults) {
          console.log('\n🔍 FUZZY MATCH DEDUPLICATION');
          console.log(`📋 Analyzed: ${result.fuzzyMatchResults.totalProcessed} spirits`);
          console.log(`🔗 Duplicates: ${result.fuzzyMatchResults.duplicatesFound}`);
          console.log(`✨ Merged: ${result.fuzzyMatchResults.autoMerged}`);
          console.log(`📝 Flagged: ${result.fuzzyMatchResults.flaggedForReview}`);
        }
        
        // Show price variation results
        if (result.priceVariationResults) {
          console.log('\n💰 PRICE VARIATION ANALYSIS');
          console.log(`📋 Product groups: ${result.priceVariationResults.summary.totalGroups}`);
          console.log(`📈 High variation groups: ${result.priceVariationResults.summary.highVariationGroups}`);
          console.log(`📊 Avg coefficient of variation: ${(result.priceVariationResults.summary.averageCoefficientOfVariation * 100).toFixed(1)}%`);
          
          console.log('\n💡 SUGGESTED ACTIONS:');
          const actions = result.priceVariationResults.summary.suggestedActions;
          if (actions.use_average > 0) console.log(`  Use average: ${actions.use_average} groups`);
          if (actions.use_median > 0) console.log(`  Use median: ${actions.use_median} groups`);
          if (actions.flag_for_review > 0) console.log(`  Flag for review: ${actions.flag_for_review} groups`);
          if (actions.likely_different_products > 0) console.log(`  Likely different products: ${actions.likely_different_products} groups`);
        }
        
        console.log('\n📊 OVERALL SUMMARY');
        console.log(`🔗 Total duplicates found: ${result.totalDuplicatesFound}`);
        console.log(`✨ Total merged: ${result.totalMerged}`);
        
        if (options.dryRun && result.totalDuplicatesFound > 0) {
          console.log('\n💡 Run without --dry-run to merge these duplicates');
        }
      }
      
    } catch (error) {
      spinner.fail('Deduplication failed');
      logger.error('Error:', error);
      process.exit(1);
    }
  });

// Enhanced Dry-Run command
program
  .command('dry-run')
  .description('Comprehensive dry-run deduplication analysis with detailed reports')
  .option('-t, --threshold <number>', 'Similarity threshold (0-1)', '0.85')
  .option('--incremental', 'Analyze only spirits from last 24 hours')
  .option('--no-blocking', 'Disable blocking optimization')
  .option('--no-visualizations', 'Skip similarity cluster generation')
  .option('--export-dir <path>', 'Export directory for reports', './dry-run-reports')
  .option('--show-details', 'Show detailed match analysis in console')
  .option('--show-clusters', 'Show similarity clusters in console')
  .option('--format <type>', 'Output format (summary|detailed|json)', 'summary')
  .action(async (options) => {
    const spinner = ora('Initializing comprehensive dry-run analysis...').start();
    
    try {
      const { dryRunDeduplicationService } = await import('./services/dry-run-deduplication.js');
      
      const threshold = parseFloat(options.threshold);
      
      spinner.text = 'Running comprehensive dry-run analysis...';
      
      const report = await dryRunDeduplicationService.runDryRunAnalysis({
        incrementalOnly: options.incremental,
        useBlocking: options.blocking !== false,
        customConfig: {
          combinedThreshold: threshold,
          autoMergeThreshold: 1.0, // Never auto-merge in dry-run
        },
        exportDir: options.exportDir,
        generateVisualizations: options.visualizations !== false
      });
      
      spinner.succeed('Dry-run analysis completed!');
      
      // Display results based on format
      if (options.format === 'json') {
        console.log(JSON.stringify(report, null, 2));
        return;
      }
      
      // Summary display
      console.log('\n🔍 DRY-RUN DEDUPLICATION ANALYSIS');
      console.log('═'.repeat(60));
      
      console.log('\n📊 OVERVIEW');
      console.log('─'.repeat(40));
      console.log(`🥃 Spirits analyzed: ${report.summary.totalSpiritsAnalyzed.toLocaleString()}`);
      console.log(`🔗 Duplicates found: ${report.summary.totalDuplicatesFound}`);
      console.log(`⏱️  Processing time: ${(report.summary.processingTime / 1000).toFixed(2)}s`);
      console.log(`📈 Est. quality improvement: ${report.summary.estimatedDataQualityImprovement.toFixed(1)}%`);
      
      console.log('\n🎯 RECOMMENDED ACTIONS');
      console.log('─'.repeat(40));
      console.log(`✅ Auto-merge candidates: ${report.summary.potentialMerges}`);
      console.log(`🔍 Flag for review: ${report.summary.flaggedForReview}`);
      console.log(`❌ Ignore (low confidence): ${report.summary.ignoredDuplicates}`);
      
      if (report.blockingStats) {
        console.log('\n🚀 BLOCKING OPTIMIZATION');
        console.log('─'.repeat(40));
        console.log(`📦 Blocks created: ${report.blockingStats.totalBlocks}`);
        console.log(`📉 Comparison reduction: ${report.blockingStats.reductionPercentage.toFixed(1)}%`);
        console.log(`📏 Avg block size: ${report.blockingStats.averageBlockSize.toFixed(1)} spirits`);
        console.log(`📊 Largest block: ${report.blockingStats.largestBlockSize} spirits`);
      }
      
      console.log('\n📊 IMPACT ASSESSMENT');
      console.log('─'.repeat(40));
      console.log(`🗑️  Spirits to be removed: ${report.impactAssessment.spiritsToBeRemoved}`);
      console.log(`📈 Data fields to enhance: ${report.impactAssessment.dataFieldsToBeEnhanced}`);
      console.log(`📉 Duplication reduction: ${report.impactAssessment.estimatedDuplicationReduction.toFixed(1)}%`);
      
      if (report.impactAssessment.dataQualityImprovements.length > 0) {
        console.log('\n✨ DATA QUALITY IMPROVEMENTS');
        console.log('─'.repeat(40));
        report.impactAssessment.dataQualityImprovements.slice(0, 5).forEach(improvement => {
          console.log(`  • ${improvement}`);
        });
        if (report.impactAssessment.dataQualityImprovements.length > 5) {
          console.log(`  ... and ${report.impactAssessment.dataQualityImprovements.length - 5} more`);
        }
      }
      
      if (report.impactAssessment.potentialDataLoss.length > 0) {
        console.log('\n⚠️  POTENTIAL DATA LOSS');
        console.log('─'.repeat(40));
        report.impactAssessment.potentialDataLoss.slice(0, 3).forEach(loss => {
          console.log(`  • ${loss}`);
        });
        if (report.impactAssessment.potentialDataLoss.length > 3) {
          console.log(`  ... and ${report.impactAssessment.potentialDataLoss.length - 3} more`);
        }
      }
      
      if (report.clusters.length > 0) {
        console.log('\n🎨 SIMILARITY CLUSTERS');
        console.log('─'.repeat(40));
        console.log(`📊 Total clusters: ${report.clusters.length}`);
        
        if (options.showClusters) {
          report.clusters.slice(0, 5).forEach((cluster, index) => {
            console.log(`\n  Cluster ${index + 1}: ${cluster.members.length} spirits`);
            console.log(`    Similarity: ${(cluster.clusterSimilarity * 100).toFixed(1)}%`);
            console.log(`    Action: ${cluster.recommendedAction.replace(/_/g, ' ')}`);
            console.log(`    Center: ${cluster.centerSpirit.brand || 'Unknown'} ${cluster.centerSpirit.name}`);
          });
          if (report.clusters.length > 5) {
            console.log(`\n  ... and ${report.clusters.length - 5} more clusters`);
          }
        }
      }
      
      if (options.showDetails && report.matches.length > 0) {
        console.log('\n🔍 DETAILED MATCH ANALYSIS');
        console.log('─'.repeat(60));
        
        // Show top 5 matches
        const topMatches = report.matches
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5);
        
        topMatches.forEach((match, index) => {
          console.log(`\n${index + 1}. ${match.matchId.toUpperCase()}`);
          console.log(`   Spirit 1: ${match.spirit1.brand || 'Unknown'} ${match.spirit1.name}`);
          console.log(`   Spirit 2: ${match.spirit2.brand || 'Unknown'} ${match.spirit2.name}`);
          console.log(`   Similarity: ${(match.similarity * 100).toFixed(1)}% (${match.confidence})`);
          console.log(`   Action: ${match.recommendedAction.replace(/_/g, ' ')}`);
          console.log(`   Explanation: ${match.confidenceExplanation}`);
          
          if (match.mergePreview.dataImprovements.length > 0) {
            console.log(`   Improvements: ${match.mergePreview.dataImprovements.join(', ')}`);
          }
        });
        
        if (report.matches.length > 5) {
          console.log(`\n   ... and ${report.matches.length - 5} more matches`);
        }
      }
      
      console.log('\n📁 EXPORTED REPORTS');
      console.log('─'.repeat(40));
      console.log(`📄 Detailed report: ${report.exportPaths.detailedReportJson}`);
      console.log(`📊 Matches CSV: ${report.exportPaths.matchesCsv}`);
      console.log(`🎨 Clusters JSON: ${report.exportPaths.clustersJson}`);
      console.log(`📝 Summary text: ${report.exportPaths.summaryTxt}`);
      
      console.log('\n💡 NEXT STEPS');
      console.log('─'.repeat(40));
      if (report.summary.potentialMerges > 0) {
        console.log(`• Run deduplication to auto-merge ${report.summary.potentialMerges} high-confidence matches`);
      }
      if (report.summary.flaggedForReview > 0) {
        console.log(`• Review ${report.summary.flaggedForReview} flagged matches manually`);
      }
      console.log('• Use exported reports for detailed analysis');
      console.log('• Consider adjusting similarity threshold if needed');
      
    } catch (error) {
      spinner.fail('Dry-run analysis failed');
      logger.error('Error:', error);
      process.exit(1);
    }
  });

// Backup command
program
  .command('backup')
  .description('Backup or restore database')
  .option('-r, --restore <backup-id>', 'Restore from backup ID')
  .option('-l, --list', 'List available backups')
  .option('-d, --description <text>', 'Backup description')
  .action(async (options) => {
    const spinner = ora('Processing backup request...').start();
    
    try {
      if (options.list) {
        // List backups
        const backups = await backupService.listBackups();
        spinner.succeed(`Found ${backups.length} backups`);
        
        console.log('\n📦 AVAILABLE BACKUPS');
        console.log('─'.repeat(60));
        backups.forEach(backup => {
          const date = new Date(backup.timestamp).toLocaleString();
          console.log(`📅 ${date} - ${backup.id}`);
          console.log(`   ${backup.description || 'No description'}`);
          console.log(`   Spirits: ${backup.spiritsCount || 0}`);
        });
        
      } else if (options.restore) {
        // Restore backup
        spinner.text = `Restoring backup ${options.restore}...`;
        await backupService.restoreBackup(options.restore);
        spinner.succeed('Backup restored successfully!');
        
      } else {
        // Create backup
        spinner.text = 'Creating backup...';
        const backup = await backupService.createBackup(
          options.description || `Backup created at ${new Date().toISOString()}`
        );
        spinner.succeed(`Backup created: ${backup.id}`);
        console.log(`📦 Backed up ${backup.spiritsCount} spirits`);
      }
      
    } catch (error) {
      spinner.fail('Backup operation failed');
      logger.error('Error:', error);
      process.exit(1);
    }
  });

// Stats command
program
  .command('stats')
  .description('Show database statistics')
  .action(async () => {
    const spinner = ora('Gathering statistics...').start();
    
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );
      
      // Get overall stats
      const { count: totalSpirits } = await supabase
        .from('spirits')
        .select('*', { count: 'exact', head: true });
      
      // Get type distribution
      const { data: typeStats } = await supabase
        .from('spirits')
        .select('type')
        .order('type');
      
      const typeCounts = typeStats?.reduce((acc: any, { type }) => {
        acc[type || 'Unknown'] = (acc[type || 'Unknown'] || 0) + 1;
        return acc;
      }, {});
      
      // Get quality metrics
      const { data: qualityData } = await supabase
        .from('spirits')
        .select('data_quality_score, whiskey_style, subcategory, description_mismatch')
        .not('data_quality_score', 'is', null);
      
      const avgQuality = qualityData && qualityData.length > 0
        ? qualityData.reduce((sum, { data_quality_score }) => sum + (data_quality_score || 0), 0) / qualityData.length
        : 0;
      
      const withWhiskeyStyle = qualityData?.filter(d => d.whiskey_style).length || 0;
      const withSubcategory = qualityData?.filter(d => d.subcategory).length || 0;
      const withMismatch = qualityData?.filter(d => d.description_mismatch).length || 0;
      
      spinner.succeed('Statistics gathered!');
      
      console.log('\n📊 DATABASE STATISTICS');
      console.log('─'.repeat(40));
      console.log(`🥃 Total spirits: ${totalSpirits || 0}`);
      console.log(`📈 Average quality score: ${avgQuality > 0 ? avgQuality.toFixed(1) : 'N/A'}/100`);
      console.log(`🎯 With whiskey style: ${withWhiskeyStyle} (${qualityData?.length > 0 ? (withWhiskeyStyle / qualityData.length * 100).toFixed(1) : '0.0'}%)`);
      console.log(`📂 With subcategory: ${withSubcategory} (${qualityData?.length > 0 ? (withSubcategory / qualityData.length * 100).toFixed(1) : '0.0'}%)`);
      console.log(`⚠️  Description mismatches: ${withMismatch}`);
      
      console.log('\n📊 TYPE DISTRIBUTION');
      console.log('─'.repeat(40));
      const sortedTypes = Object.entries(typeCounts || {})
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 15);
      
      sortedTypes.forEach(([type, count]) => {
        const percentage = ((count as number) / (totalSpirits || 1) * 100).toFixed(1);
        const bar = '█'.repeat(Math.floor((count as number) / (totalSpirits || 1) * 30));
        console.log(`${type.padEnd(20)} ${bar} ${count} (${percentage}%)`);
      });
      
      // Cache stats
      try {
        const cacheStats = await cacheService.getStats();
        console.log('\n💾 CACHE STATISTICS');
        console.log('─'.repeat(40));
        console.log(`Total entries: ${cacheStats.totalEntries}`);
        console.log(`Queries cached: ${cacheStats.byType['search_query'] || 0}`);
        console.log(`Spirits cached: ${cacheStats.byType['spirit_data'] || 0}`);
        console.log(`URLs cached: ${cacheStats.byType['url_content'] || 0}`);
        console.log(`Failed attempts: ${cacheStats.byType['failed_attempt'] || 0}`);
        console.log(`Cache size: ${(cacheStats.sizeBytes / 1024).toFixed(2)} KB`);
      } catch (error) {
        console.log('\n💾 CACHE STATISTICS');
        console.log('─'.repeat(40));
        console.log('✖ Failed to gather statistics');
        logger.error('Error:', error);
      }
      
      // Show API call efficiency if there have been any calls today
      const apiStats = apiCallTracker.getStats();
      if (apiStats.totalCalls > 0) {
        apiCallTracker.displayCurrentStats();
      }
      
    } catch (error) {
      spinner.fail('Failed to gather statistics');
      logger.error('Error:', error);
      process.exit(1);
    }
  });

// Site metrics command
program
  .command('site-metrics')
  .description('Display site performance metrics for smart selection')
  .action(async () => {
    const spinner = ora('Loading site metrics...').start();
    
    try {
      const report = await smartSiteSelector.getMetricsReport();
      
      spinner.succeed('Site metrics loaded');
      
      console.log('\n🌟 TOP PERFORMING SITES');
      console.log('─'.repeat(60));
      console.log('Domain'.padEnd(30) + 'Quality'.padEnd(10) + 'Success'.padEnd(10) + 'Fields'.padEnd(10));
      console.log('─'.repeat(60));
      
      report.topPerformers.forEach(site => {
        console.log(
          site.domain.padEnd(30) +
          `${site.avgDataQuality.toFixed(0)}%`.padEnd(10) +
          `${(site.successRate * 100).toFixed(0)}%`.padEnd(10) +
          site.avgFieldsPopulated.toFixed(1).padEnd(10)
        );
      });
      
      if (report.poorPerformers.length > 0) {
        console.log('\n⚠️  POOR PERFORMING SITES');
        console.log('─'.repeat(60));
        console.log('Domain'.padEnd(30) + 'Quality'.padEnd(10) + 'Success'.padEnd(10) + 'Fields'.padEnd(10));
        console.log('─'.repeat(60));
        
        report.poorPerformers.forEach(site => {
          console.log(
            site.domain.padEnd(30) +
            `${site.avgDataQuality.toFixed(0)}%`.padEnd(10) +
            `${(site.successRate * 100).toFixed(0)}%`.padEnd(10) +
            site.avgFieldsPopulated.toFixed(1).padEnd(10)
          );
        });
      }
      
      console.log('\n📊 SUMMARY');
      console.log('─'.repeat(40));
      console.log(`Total sites tracked: ${report.summary.totalSites}`);
      console.log(`Sites used: ${report.summary.sitesUsed}`);
      console.log(`Average quality: ${report.summary.avgQuality.toFixed(1)}%`);
      console.log(`Sites with structured data: ${report.summary.sitesWithStructuredData}`);
      
    } catch (error) {
      spinner.fail('Failed to load site metrics');
      logger.error('Error:', error);
      process.exit(1);
    }
  });

// NEW: Catalog-focused distillery scraping command for HIGH EFFICIENCY
program
  .command('scrape-catalogs')
  .description('🚀 V2.5.6 INTELLIGENT DISTILLERY SCRAPER: Smart selection across all spirit types with cache awareness')
  .option('-a, --api-calls <number>', 'Number of API calls to make (default: 100)', '100')
  .option('-m, --max-products <number>', 'Max products per distillery', '100')
  .option('-d, --distilleries <names>', 'Specific distilleries (comma-separated, overrides smart selection)')
  .option('--prefer-unscraped', 'Prioritize distilleries never scraped before', true)
  .option('--all-types', 'Ensure coverage across all spirit types', true)
  .option('--clear-tracking', 'Clear all tracking data and start fresh')
  .option('-q, --quiet', 'Reduce output verbosity')
  .action(async (options) => {
    // Set log level if quiet mode
    if (options.quiet) {
      process.env.LOG_LEVEL = 'warn';
    }
    
    const apiCallLimit = parseInt(options.apiCalls);
    const maxProducts = parseInt(options.maxProducts);
    const distilleryNames = options.distilleries ? options.distilleries.split(',').map((d: string) => d.trim()) : [];
    
    // Handle clear tracking option
    if (options.clearTracking) {
      const spinner = ora('Clearing all tracking data...').start();
      await distilleryScrapeTracker.clearAllTracking();
      spinner.succeed('Tracking data cleared');
      return;
    }
    
    const spinner = ora(`🧠 V2.5.6 Intelligent Distillery Scraper - ${apiCallLimit} API calls`).start();
    
    try {
      // Start a new scraping session
      const sessionId = await distilleryScrapeTracker.startSession();
      
      // Show current stats
      spinner.text = 'Analyzing scraping history...';
      const stats = await distilleryScrapeTracker.getScrapingStats();
      spinner.succeed('Scraping history analyzed');
      
      console.log('\n📊 Scraping Statistics:');
      console.log(`  Previously scraped: ${stats.totalDistilleriesScraped} distilleries`);
      console.log(`  Average efficiency: ${stats.averageEfficiency.toFixed(1)} spirits/call`);
      if (Object.keys(stats.topSpiritTypes).length > 0) {
        console.log(`  Spirit types found: ${Object.entries(stats.topSpiritTypes)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([type, count]) => `${type} (${count})`)
          .join(', ')}`);
      }
      
      let selectedDistilleries: any[] = [];
      
      if (distilleryNames.length > 0) {
        // Use specific distilleries if provided
        spinner.text = `Finding specified distilleries: ${distilleryNames.join(', ')}`;
        
        selectedDistilleries = distilleryNames.map((name: string) => {
          const distillery = ALL_DISTILLERIES.find((d: any) => 
            d.name.toLowerCase() === name.toLowerCase() ||
            d.variations.some((v: any) => v.toLowerCase() === name.toLowerCase())
          );
          
          if (!distillery) {
            spinner.warn(`⚠️  Distillery "${name}" not found`);
            return null;
          }
          return distillery;
        }).filter((d: any) => d !== null);
        
        if (selectedDistilleries.length === 0) {
          spinner.fail('No valid distilleries found');
          return;
        }
      } else {
        // Use intelligent selection
        spinner.text = `Intelligently selecting from ${ALL_DISTILLERIES.length} distilleries...`;
        
        selectedDistilleries = await distilleryScrapeTracker.getIntelligentDistillerySelection(
          ALL_DISTILLERIES,
          apiCallLimit,
          {
            preferUnscraped: options.preferUnscraped,
            spiritTypeDistribution: options.allTypes,
            priorityWeighting: true,
            avoidRecentlyCached: true,
          }
        );
      }
      
      spinner.succeed(`Selected ${selectedDistilleries.length} distilleries for scraping`);
      
      // Show spirit type distribution
      const typeDistribution: Record<string, number> = {};
      selectedDistilleries.forEach((d: any) => {
        d.type.forEach((t: string) => {
          typeDistribution[t] = (typeDistribution[t] || 0) + 1;
        });
      });
      
      console.log('\n🏭 Selected Distilleries:');
      for (let i = 0; i < selectedDistilleries.length; i++) {
        const d = selectedDistilleries[i];
        const record = await distilleryScrapeTracker.getDistilleryRecord(d.name);
        const lastScraped = record ? ` (last: ${new Date(record.lastScrapedAt).toLocaleDateString()})` : ' (never scraped)';
        console.log(`  ${i + 1}. ${d.name} (${d.country}) - ${d.type.join(', ')}${lastScraped}`);
      }
      
      console.log('\n🍷 Spirit Type Coverage:');
      Object.entries(typeDistribution)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          console.log(`  ${type}: ${count} distilleries`);
        });
      
      // Initialize tracking
      let totalApiCalls = 0;
      let totalSpiritsFound = 0;
      let totalSpiritsStored = 0;
      let cachedQueries = 0;
      const results: any[] = [];
      const spiritTypesFound: Set<string> = new Set();
      
      console.log('\n🚀 Starting V2.5.6 Ultra-Efficient Scraping with Cache Awareness...\n');
      
      // Process each distillery
      for (const distillery of selectedDistilleries) {
        if (totalApiCalls >= apiCallLimit) {
          console.log(`\n📊 API call limit reached (${apiCallLimit} calls)`);
          break;
        }
        
        const remainingCalls = apiCallLimit - totalApiCalls;
        console.log(`\n🥃 Scraping ${distillery.name} (${distillery.type.join(', ')}) - ${remainingCalls} API calls remaining...`);
        
        try {
          // Check if we have recent data for this distillery
          const existingRecord = await distilleryScrapeTracker.getDistilleryRecord(distillery.name);
          if (existingRecord && new Date(existingRecord.lastScrapedAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) {
            console.log(`  ⚡ Recently scraped (${new Date(existingRecord.lastScrapedAt).toLocaleDateString()}) - checking for new products only`);
          }
          
          // Generate smart queries based on distillery type and products
          const queries: string[] = [];
          
          // Add base queries
          if (distillery.base_queries) {
            queries.push(...distillery.base_queries);
          } else {
            // Generate type-specific queries
            distillery.type.forEach(type => {
              queries.push(`"${distillery.name}" ${type}`);
            });
          }
          
          // Add product line queries if available
          if (distillery.product_lines) {
            distillery.product_lines.slice(0, 3).forEach((line: any) => {
              queries.push(`"${distillery.name}" "${line.name}"`);
            });
          }
          
          let distilleryApiCalls = 0;
          let distillerySpiritsFound = 0;
          let distillerySpiritsStored = 0;
          let distilleryCachedQueries = 0;
          const distillerySpiritTypes: string[] = [];
          
          // Process queries for this distillery
          for (const query of queries) {
            if (totalApiCalls >= apiCallLimit) break;
            
            // Check if this query is already cached
            const cacheKey = `search:${query}`;
            const cachedResult = await cacheService.get(cacheKey);
            
            if (cachedResult) {
              console.log(`  ⚡ Using cached results for: ${query}`);
              distilleryCachedQueries++;
              cachedQueries++;
              // Still process cached results to check for new storage opportunities
            }
            
            const searchResult = await ultraEfficientScraper.searchAndExtract(
              query,
              Math.min(maxProducts, remainingCalls - distilleryApiCalls)
            );
            
            distilleryApiCalls += searchResult.apiCalls;
            distillerySpiritsFound += searchResult.spiritsFound;
            distillerySpiritsStored += searchResult.spiritsStored;
            totalApiCalls += searchResult.apiCalls;
            
            // Track spirit types found
            if (searchResult.spiritTypes) {
              distillerySpiritTypes.push(...searchResult.spiritTypes);
              searchResult.spiritTypes.forEach(t => spiritTypesFound.add(t));
            }
          }
          
          totalSpiritsFound += distillerySpiritsFound;
          totalSpiritsStored += distillerySpiritsStored;
          
          const efficiency = distilleryApiCalls > 0 ? distillerySpiritsFound / distilleryApiCalls : 0;
          
          // Record this scrape
          await distilleryScrapeTracker.recordDistilleryScrape(
            distillery,
            distillerySpiritsFound,
            distillerySpiritsStored,
            distilleryApiCalls,
            [...new Set(distillerySpiritTypes)]
          );
          
          // Update session
          await distilleryScrapeTracker.updateSession(
            sessionId,
            distillery.name,
            distilleryApiCalls,
            distillerySpiritsFound,
            distillerySpiritsStored
          );
          
          results.push({
            distillery: distillery.name,
            types: distillery.type,
            apiCalls: distilleryApiCalls,
            spiritsFound: distillerySpiritsFound,
            spiritsStored: distillerySpiritsStored,
            efficiency: efficiency,
            cachedQueries: distilleryCachedQueries
          });
          
          console.log(`  ✅ Found: ${distillerySpiritsFound}, Stored: ${distillerySpiritsStored}, Efficiency: ${efficiency.toFixed(1)} spirits/call`);
          if (distilleryCachedQueries > 0) {
            console.log(`  ⚡ Cached queries used: ${distilleryCachedQueries}/${queries.length}`);
          }
          
        } catch (error) {
          console.error(`  ❌ Error scraping ${distillery.name}:`, error);
          results.push({
            distillery: distillery.name,
            types: distillery.type,
            apiCalls: 0,
            spiritsFound: 0,
            spiritsStored: 0,
            efficiency: 0,
            error: true
          });
        }
      }
      
      // Display final summary
      console.log('\n' + '='.repeat(70));
      console.log('📊 V2.5.6 INTELLIGENT DISTILLERY SCRAPING SUMMARY');
      console.log('='.repeat(70));
      console.log(`🧠 Session ID: ${sessionId}`);
      console.log(`🏭 Distilleries scraped: ${results.length}`);
      console.log(`📞 Total API calls: ${totalApiCalls}/${apiCallLimit}`);
      console.log(`⚡ Cached queries used: ${cachedQueries}`);
      console.log(`🥃 Total spirits found: ${totalSpiritsFound}`);
      console.log(`💾 Total spirits stored: ${totalSpiritsStored}`);
      console.log(`📈 Overall efficiency: ${totalApiCalls > 0 ? (totalSpiritsFound / totalApiCalls).toFixed(1) : '0'} spirits/call`);
      console.log(`🍷 Spirit types discovered: ${spiritTypesFound.size} (${Array.from(spiritTypesFound).join(', ')})`);
      
      // Show top performers
      const topPerformers = results
        .filter(r => !r.error && r.efficiency > 0)
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 5);
      
      if (topPerformers.length > 0) {
        console.log('\n🏆 TOP PERFORMERS:');
        console.log('─'.repeat(70));
        console.log('Distillery'.padEnd(30) + 'Types'.padEnd(20) + 'Efficiency'.padEnd(15) + 'Spirits');
        console.log('─'.repeat(70));
        topPerformers.forEach((r, i) => {
          console.log(
            `${i + 1}. ${r.distillery.padEnd(28)} ${r.types.join(', ').padEnd(18)} ${r.efficiency.toFixed(1).padEnd(13)} ${r.spiritsFound} found`
          );
        });
      }
      
      // Show cache savings
      if (cachedQueries > 0) {
        console.log('\n💰 CACHE SAVINGS:');
        console.log(`  API calls saved: ${cachedQueries}`);
        console.log(`  Cost saved: ~$${(cachedQueries * 0.01).toFixed(2)} (assuming $0.01/call)`);
        console.log(`  Time saved: ~${(cachedQueries * 2).toFixed(0)} seconds`);
      }
      
      // Auto-deduplication check
      if (totalSpiritsStored >= 50) {
        console.log('\n🔍 Running auto-deduplication check...');
        const dedupeConfig = getConfigSummary();
        if (dedupeConfig && dedupeConfig.enabled) {
          const dedupeResult = await autoDeduplicationService.processSpirits('all');
          if (dedupeResult.duplicatesFound > 0) {
            console.log(`✅ Processed ${dedupeResult.duplicatesFound} potential duplicates`);
          }
        }
      }
      
      // Show next recommended run
      console.log('\n📅 NEXT RUN RECOMMENDATION:');
      const unscrapedCount = (await distilleryScrapeTracker.getUnscrapedDistilleries(ALL_DISTILLERIES, 7)).length;
      console.log(`  Unscraped distilleries: ${unscrapedCount}`);
      console.log(`  Recommended API calls: ${Math.min(100, unscrapedCount * 7)}`);
      
    } catch (error) {
      spinner.fail('Intelligent distillery scraping failed');
      logger.error('Fatal error:', error);
      process.exit(1);
    }
  });

// Original systematic distillery scraping command (keeping for backwards compatibility)
program
  .command('scrape-distilleries')
  .description('Systematically scrape all products from distilleries (older method)')
  .option('-m, --max-products <number>', 'Max products per distillery', '100')
  .option('-s, --start-index <number>', 'Start from distillery index', '0')
  .option('-d, --distilleries <names>', 'Specific distilleries (comma-separated)')
  .option('--skip-existing', 'Skip products already in database', true)
  .option('--include-discontinued', 'Include discontinued products', true)
  .option('--year-start <year>', 'Start year for products', '2010')
  .option('--year-end <year>', 'End year for products', String(new Date().getFullYear()))
  .option('-q, --quiet', 'Reduce output verbosity')
  .action(async (options) => {
    // Set log level if quiet mode
    if (options.quiet) {
      process.env.LOG_LEVEL = 'warn';
    }
    const spinner = ora('Initializing systematic distillery scraper...').start();
    
    try {
      const maxProducts = parseInt(options.maxProducts);
      const startIndex = parseInt(options.startIndex);
      const yearStart = parseInt(options.yearStart);
      const yearEnd = parseInt(options.yearEnd);
      const distilleryNames = options.distilleries ? options.distilleries.split(',').map((d: string) => d.trim()) : [];
      
      spinner.succeed('Distillery scraper initialized');
      
      logger.info(`Max products per distillery: ${maxProducts}`);
      logger.info(`Starting from index: ${startIndex}`);
      logger.info(`Year range: ${yearStart}-${yearEnd}`);
      logger.info(`Skip existing: ${options.skipExisting}`);
      logger.info(`Include discontinued: ${options.includeDiscontinued}`);
      
      if (distilleryNames.length > 0) {
        logger.info(`Specific distilleries: ${distilleryNames.join(', ')}`);
      }
      
      // Run systematic scraping
      spinner.text = 'Starting systematic distillery scraping...';
      
      const results = await distilleryScraper.scrapeAllDistilleries({
        maxProductsPerDistillery: maxProducts,
        startFromDistilleryIndex: startIndex,
        distilleryNames,
        includeDiscontinued: options.includeDiscontinued,
        yearRange: { start: yearStart, end: yearEnd },
        skipExisting: options.skipExisting
      });
      
      spinner.succeed('Distillery scraping complete!');
      
      // Display summary
      console.log('\n📊 SCRAPING SUMMARY');
      console.log('─'.repeat(50));
      console.log(`🏭 Distilleries processed: ${results.length}`);
      console.log(`🥃 Total products found: ${results.reduce((sum, r) => sum + r.productsFound, 0)}`);
      console.log(`💾 Total products stored: ${results.reduce((sum, r) => sum + r.productsStored, 0)}`);
      console.log(`❌ Total errors: ${results.reduce((sum, r) => sum + r.errors, 0)}`);
      
      // Show top performing distilleries
      const topDistilleries = results
        .sort((a, b) => b.productsStored - a.productsStored)
        .slice(0, 10);
      
      console.log('\n🏆 TOP DISTILLERIES');
      console.log('─'.repeat(50));
      topDistilleries.forEach((result, index) => {
        console.log(`${index + 1}. ${result.distillery}: ${result.productsStored} products`);
      });
      
      // Show failed distilleries
      const failedDistilleries = results.filter(r => r.errors > 0 || r.productsStored === 0);
      if (failedDistilleries.length > 0) {
        console.log('\n⚠️  DISTILLERIES WITH ISSUES');
        console.log('─'.repeat(50));
        failedDistilleries.forEach(result => {
          console.log(`- ${result.distillery}: ${result.errors} errors, ${result.productsStored} stored`);
        });
      }
      
    } catch (error) {
      spinner.fail('Distillery scraping failed');
      logger.error('Fatal error:', error);
      process.exit(1);
    }
  });

// Cache management command
program
  .command('cache')
  .description('Manage cache storage')
  .option('--clear', 'Clear all cache files')
  .option('--clear-type <type>', 'Clear specific cache type (search_query, url_content, spirit_data, failed_attempt)')
  .option('--stats', 'Show cache statistics')
  .option('--cleanup', 'Remove expired cache entries')
  .action(async (options) => {
    const spinner = ora('Processing cache request...').start();
    
    try {
      await cacheService.initialize();
      
      if (options.clear) {
        await cacheService.clearCache();
        spinner.succeed('All cache cleared successfully!');
        
      } else if (options.clearType) {
        await cacheService.clearCache(options.clearType);
        spinner.succeed(`Cache type '${options.clearType}' cleared successfully!`);
        
      } else if (options.cleanup) {
        const result = await cacheService.cleanup();
        spinner.succeed('Cache cleanup completed!');
        console.log(`📊 Removed ${result.removed} expired entries, kept ${result.kept} valid entries`);
        
      } else if (options.stats) {
        const stats = await cacheService.getStats();
        spinner.succeed('Cache statistics:');
        
        console.log('\n💾 CACHE STATISTICS');
        console.log('─'.repeat(40));
        console.log(`Total entries: ${stats.totalEntries}`);
        console.log(`Cache size: ${(stats.sizeBytes / 1024).toFixed(2)} KB`);
        console.log('\nBy type:');
        for (const [type, count] of Object.entries(stats.byType)) {
          console.log(`  ${type}: ${count} entries`);
        }
        
        if (stats.totalEntries > 0) {
          const oldestDate = new Date(stats.oldestEntry).toLocaleString();
          const newestDate = new Date(stats.newestEntry).toLocaleString();
          console.log(`\nOldest entry: ${oldestDate}`);
          console.log(`Newest entry: ${newestDate}`);
        }
        
      } else {
        // Default: show stats
        const stats = await cacheService.getStats();
        spinner.succeed('Cache information:');
        
        console.log('\n💾 CACHE STATUS');
        console.log('─'.repeat(40));
        console.log(`Total entries: ${stats.totalEntries}`);
        console.log(`Cache size: ${(stats.sizeBytes / 1024).toFixed(2)} KB`);
        console.log('\nAvailable commands:');
        console.log('  --stats     Show detailed statistics');
        console.log('  --cleanup   Remove expired entries');
        console.log('  --clear     Clear all cache');
        console.log('  --clear-type <type>  Clear specific type');
      }
      
    } catch (error) {
      spinner.fail('Cache operation failed');
      logger.error('Error:', error);
      process.exit(1);
    }
  });

// Auto-dedup configuration command
program
  .command('auto-dedup-config')
  .description('Configure automatic deduplication settings')
  .option('-e, --enable', 'Enable auto-deduplication')
  .option('-d, --disable', 'Disable auto-deduplication')
  .option('-t, --threshold <number>', 'Set minimum spirits threshold')
  .option('--same-brand-threshold <number>', 'Set same-brand similarity threshold (0-1)')
  .option('--auto-merge <boolean>', 'Enable/disable automatic merging')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    const spinner = ora('Configuring auto-deduplication...').start();
    
    try {
      const currentConfig = autoDeduplicationService.getConfig();
      
      if (options.show) {
        spinner.succeed('Current auto-deduplication configuration:');
        console.log('\n' + getConfigSummary(currentConfig));
        console.log('\nPerformance Settings:');
        console.log(`  Batch size: ${currentConfig.performance.batchSize}`);
        console.log(`  Fuzzy match limit: ${currentConfig.performance.fuzzyMatchLimit} spirits`);
        return;
      }
      
      // Update configuration
      const updates: any = {};
      
      if (options.enable) updates.enabled = true;
      if (options.disable) updates.enabled = false;
      if (options.threshold) updates.minSpiritsThreshold = parseInt(options.threshold);
      if (options.sameBrandThreshold) {
        updates.thresholds = {
          ...currentConfig.thresholds,
          sameBrand: parseFloat(options.sameBrandThreshold)
        };
      }
      if (options.autoMerge !== undefined) {
        updates.autoMerge = options.autoMerge === 'true';
      }
      
      autoDeduplicationService.updateConfig(updates);
      
      spinner.succeed('Auto-deduplication configuration updated!');
      console.log('\n' + getConfigSummary(autoDeduplicationService.getConfig()));
      
    } catch (error) {
      spinner.fail('Configuration failed');
      logger.error('Error:', error);
      process.exit(1);
    }
  });

// Help text enhancement
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ npm run scrape -- --categories bourbon --limit 100');
  console.log('  $ npm run scrape -- --categories bourbon --limit 50 --verbose');
  console.log('  $ npm run scrape -- --distillery "buffalo-trace" --limit 50    # 🚀 HIGH EFFICIENCY (default)');
  console.log('  $ npm run scrape -- --distillery "buffalo-trace,wild-turkey"  # 🚀 Multiple distilleries');
  console.log('  $ npm run scrape -- --discover --limit 200');
  console.log('');
  console.log('API efficiency and cache management:');
  console.log('  $ npm run scrape -- --limit 100 --force-refresh    # Force fresh API calls, bypass cache');
  console.log('  $ npm run scrape -- --limit 100 --clear-cache      # Clear cache before scraping');
  console.log('  $ npm run scrape -- --limit 100 --hide-api-stats   # Hide detailed API usage statistics');
  console.log('  $ npm run scrape -- --limit 50 --max-cache-age 2   # Use cache entries newer than 2 hours');
  console.log('  $ npm run scrape -- --limit 100 --diversify-queries # Use diversified queries to avoid cache');
  console.log('  $ npm run scrape -- --limit 100 --diversify-queries --diversity-level high # Maximum diversity');
  console.log('  $ npm run dedup -- --threshold 0.9');
  console.log('  $ npm run dry-run -- --threshold 0.85 --show-details');
  console.log('  $ npm run backup -- --description "Before major update"');
  console.log('  $ npm run stats');
  console.log('');
  console.log('High-efficiency scraping (🚀 NOW DEFAULT for distillery mode):');
  console.log('  $ npm run scrape -- --distillery "buffalo-trace"          # 3-5 spirits per API call!');
  console.log('  $ npm run scrape -- --distillery "jack-daniels,makers-mark"');
  console.log('  $ npm run scrape-catalogs                                  # Alternative catalog command');
  console.log('  $ npm run scrape-catalogs -- --max-products 200           # Get up to 200 products');
  console.log('');
  console.log('Original distillery scraping (slower):');
  console.log('  $ npm run scrape-distilleries                              # Scrape all distilleries');
  console.log('  $ npm run scrape-distilleries -- --max-products 200       # Get up to 200 products per distillery');
  console.log('  $ npm run scrape-distilleries -- --distilleries "Buffalo Trace,Macallan"');
  console.log('  $ npm run scrape-distilleries -- --start-index 100        # Resume from distillery #100');
  console.log('  $ npm run scrape-distilleries -- --year-start 2020        # Only products from 2020 onwards');
  console.log('');
  console.log('Auto-deduplication:');
  console.log('  $ npm run scrape -- --no-auto-dedup           # Disable auto-dedup for this run');
  console.log('  $ npm run scrape -- --dedup-threshold 25      # Run auto-dedup after 25 spirits');
  console.log('  $ npm run auto-dedup-config -- --show         # View current settings');
  console.log('  $ npm run auto-dedup-config -- --disable      # Disable auto-dedup globally');
  console.log('  $ npm run auto-dedup-config -- --threshold 20 # Change global threshold');
  console.log('');
  console.log('Dry-run deduplication analysis:');
  console.log('  $ npm run dry-run                                  # Comprehensive analysis with reports');
  console.log('  $ npm run dry-run -- --show-details               # Show detailed match analysis');
  console.log('  $ npm run dry-run -- --show-clusters              # Show similarity clusters');
  console.log('  $ npm run dry-run -- --export-dir ./reports       # Export to custom directory');
  console.log('  $ npm run dry-run -- --format json                # Output as JSON');
  console.log('  $ npm run dry-run -- --incremental                # Analyze recent spirits only');
  console.log('  $ npm run dry-run -- --no-blocking                # Disable blocking optimization');
  console.log('');
  console.log('Cache management:');
  console.log('  $ npm run cache                           # Show cache status');
  console.log('  $ npm run cache -- --stats                # Detailed cache statistics');
  console.log('  $ npm run cache -- --cleanup              # Remove expired entries');
  console.log('  $ npm run cache -- --clear                # Clear all cache');
  console.log('  $ npm run cache -- --clear-type search_query  # Clear specific type');
  console.log('');
  console.log('API call efficiency:');
  console.log('  $ npm run scrape -- --force-refresh       # Bypass cache for fresh API calls');
  console.log('  $ npm run stats                           # View API efficiency metrics');
  console.log('');
  console.log('Fix CSV data:');
  console.log('  $ npm run fix-csv input.csv output.csv');
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}