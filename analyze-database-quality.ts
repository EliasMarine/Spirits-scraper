import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

interface QualityMetrics {
  totalSpirits: number;
  spiritsWithPrice: number;
  spiritsWithABV: number;
  spiritsWithImage: number;
  spiritsWithDescription: number;
  spiritsWithBrand: number;
  spiritsWithMetadata: number;
  avgQualityScore: number;
  categoryBreakdown: Record<string, {
    count: number;
    priceRate: number;
    abvRate: number;
    imageRate: number;
    descriptionRate: number;
  }>;
  sourceBreakdown: Record<string, {
    count: number;
    priceRate: number;
    abvRate: number;
    imageRate: number;
    avgQuality: number;
  }>;
  recentSpirits: Array<{
    name: string;
    price: number | null;
    abv: number | null;
    image_url: string | null;
    description: string | null;
    source_url: string;
    created_at: string;
  }>;
}

async function analyzeDatabase() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  console.log('📊 ANALYZING DATABASE QUALITY\n');
  console.log('='.repeat(60));

  // Get all spirits
  const { data: spirits, error } = await supabase
    .from('spirits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching spirits:', error);
    return;
  }

  const metrics: QualityMetrics = {
    totalSpirits: spirits.length,
    spiritsWithPrice: 0,
    spiritsWithABV: 0,
    spiritsWithImage: 0,
    spiritsWithDescription: 0,
    spiritsWithBrand: 0,
    spiritsWithMetadata: 0,
    avgQualityScore: 0,
    categoryBreakdown: {},
    sourceBreakdown: {},
    recentSpirits: []
  };

  let totalQuality = 0;

  // Analyze each spirit
  for (const spirit of spirits) {
    // Count data presence
    if (spirit.price && spirit.price > 0) metrics.spiritsWithPrice++;
    if (spirit.abv && spirit.abv > 0) metrics.spiritsWithABV++;
    if (spirit.image_url) metrics.spiritsWithImage++;
    if (spirit.description && spirit.description.length > 20) metrics.spiritsWithDescription++;
    if (spirit.brand) metrics.spiritsWithBrand++;
    if (spirit.metadata && Object.keys(spirit.metadata).length > 0) metrics.spiritsWithMetadata++;
    
    totalQuality += spirit.data_quality_score || 0;

    // Category breakdown
    const category = spirit.category || 'Unknown';
    if (!metrics.categoryBreakdown[category]) {
      metrics.categoryBreakdown[category] = {
        count: 0,
        priceRate: 0,
        abvRate: 0,
        imageRate: 0,
        descriptionRate: 0
      };
    }
    
    const catStats = metrics.categoryBreakdown[category];
    catStats.count++;
    if (spirit.price > 0) catStats.priceRate++;
    if (spirit.abv > 0) catStats.abvRate++;
    if (spirit.image_url) catStats.imageRate++;
    if (spirit.description?.length > 20) catStats.descriptionRate++;

    // Source breakdown
    const source = extractDomain(spirit.source_url);
    if (!metrics.sourceBreakdown[source]) {
      metrics.sourceBreakdown[source] = {
        count: 0,
        priceRate: 0,
        abvRate: 0,
        imageRate: 0,
        avgQuality: 0
      };
    }
    
    const srcStats = metrics.sourceBreakdown[source];
    srcStats.count++;
    if (spirit.price > 0) srcStats.priceRate++;
    if (spirit.abv > 0) srcStats.abvRate++;
    if (spirit.image_url) srcStats.imageRate++;
    srcStats.avgQuality += spirit.data_quality_score || 0;
  }

  // Calculate averages
  metrics.avgQualityScore = totalQuality / metrics.totalSpirits;

  // Calculate rates for categories
  for (const cat in metrics.categoryBreakdown) {
    const stats = metrics.categoryBreakdown[cat];
    const count = stats.count;
    stats.priceRate = (stats.priceRate / count) * 100;
    stats.abvRate = (stats.abvRate / count) * 100;
    stats.imageRate = (stats.imageRate / count) * 100;
    stats.descriptionRate = (stats.descriptionRate / count) * 100;
  }

  // Calculate rates for sources
  for (const src in metrics.sourceBreakdown) {
    const stats = metrics.sourceBreakdown[src];
    const count = stats.count;
    stats.priceRate = (stats.priceRate / count) * 100;
    stats.abvRate = (stats.abvRate / count) * 100;
    stats.imageRate = (stats.imageRate / count) * 100;
    stats.avgQuality = stats.avgQuality / count;
  }

  // Get recent spirits for inspection
  metrics.recentSpirits = spirits.slice(0, 10).map(s => ({
    name: s.name,
    price: s.price,
    abv: s.abv,
    image_url: s.image_url,
    description: s.description,
    source_url: s.source_url,
    created_at: s.created_at
  }));

  // Print results
  console.log('\n📈 OVERALL METRICS:');
  console.log(`Total Spirits: ${metrics.totalSpirits}`);
  console.log(`Average Quality Score: ${metrics.avgQualityScore.toFixed(1)}/100`);
  console.log(`\nData Extraction Rates:`);
  console.log(`  - Price: ${((metrics.spiritsWithPrice / metrics.totalSpirits) * 100).toFixed(1)}%`);
  console.log(`  - ABV: ${((metrics.spiritsWithABV / metrics.totalSpirits) * 100).toFixed(1)}%`);
  console.log(`  - Image: ${((metrics.spiritsWithImage / metrics.totalSpirits) * 100).toFixed(1)}%`);
  console.log(`  - Description: ${((metrics.spiritsWithDescription / metrics.totalSpirits) * 100).toFixed(1)}%`);
  console.log(`  - Brand: ${((metrics.spiritsWithBrand / metrics.totalSpirits) * 100).toFixed(1)}%`);

  console.log('\n📊 CATEGORY BREAKDOWN:');
  const sortedCategories = Object.entries(metrics.categoryBreakdown)
    .sort((a, b) => b[1].count - a[1].count);
  
  for (const [cat, stats] of sortedCategories) {
    console.log(`\n${cat}: ${stats.count} spirits`);
    console.log(`  - Price: ${stats.priceRate.toFixed(1)}%`);
    console.log(`  - ABV: ${stats.abvRate.toFixed(1)}%`);
    console.log(`  - Image: ${stats.imageRate.toFixed(1)}%`);
    console.log(`  - Description: ${stats.descriptionRate.toFixed(1)}%`);
  }

  console.log('\n🌐 TOP SOURCES BY QUALITY:');
  const sortedSources = Object.entries(metrics.sourceBreakdown)
    .sort((a, b) => b[1].avgQuality - a[1].avgQuality)
    .slice(0, 10);
  
  for (const [src, stats] of sortedSources) {
    console.log(`\n${src}: ${stats.count} spirits (Quality: ${stats.avgQuality.toFixed(1)})`);
    console.log(`  - Price: ${stats.priceRate.toFixed(1)}%`);
    console.log(`  - ABV: ${stats.abvRate.toFixed(1)}%`);
    console.log(`  - Image: ${stats.imageRate.toFixed(1)}%`);
  }

  console.log('\n🆕 RECENT SPIRITS (Last 10):');
  for (const spirit of metrics.recentSpirits) {
    console.log(`\n- ${spirit.name}`);
    console.log(`  Price: ${spirit.price || 'N/A'}`);
    console.log(`  ABV: ${spirit.abv || 'N/A'}`);
    console.log(`  Image: ${spirit.image_url ? 'Yes' : 'No'}`);
    console.log(`  Description: ${spirit.description ? spirit.description.substring(0, 50) + '...' : 'N/A'}`);
    console.log(`  Source: ${spirit.source_url}`);
  }

  // Identify patterns
  console.log('\n🔍 EXTRACTION FAILURE PATTERNS:');
  
  // Spirits without prices
  const { data: noPriceSpirits } = await supabase
    .from('spirits')
    .select('name, source_url, category')
    .or('price.is.null,price.eq.0')
    .limit(20);

  console.log('\nSpirits without prices:');
  const noPriceSources: Record<string, number> = {};
  for (const spirit of noPriceSpirits || []) {
    const domain = extractDomain(spirit.source_url);
    noPriceSources[domain] = (noPriceSources[domain] || 0) + 1;
  }
  
  Object.entries(noPriceSources)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([domain, count]) => {
      console.log(`  - ${domain}: ${count} spirits`);
    });

  // Generate recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  
  const priceRate = (metrics.spiritsWithPrice / metrics.totalSpirits) * 100;
  const abvRate = (metrics.spiritsWithABV / metrics.totalSpirits) * 100;
  const imageRate = (metrics.spiritsWithImage / metrics.totalSpirits) * 100;
  
  if (priceRate < 50) {
    console.log(`\n🔴 CRITICAL: Price extraction is only ${priceRate.toFixed(1)}%`);
    console.log('   - Enhance price pattern matching in extractSpiritsFromSearchResult');
    console.log('   - Add price extraction from product structured data');
    console.log('   - Consider fetching actual product pages for price data');
  }
  
  if (abvRate < 30) {
    console.log(`\n🔴 CRITICAL: ABV extraction is only ${abvRate.toFixed(1)}%`);
    console.log('   - Improve ABV/proof pattern matching');
    console.log('   - Extract from product metadata and descriptions');
    console.log('   - Add category-specific ABV defaults');
  }
  
  if (imageRate < 70) {
    console.log(`\n🟡 WARNING: Image extraction is ${imageRate.toFixed(1)}%`);
    console.log('   - Prioritize og:image meta tags');
    console.log('   - Use pagemap.cse_image from search results');
    console.log('   - Extract from product structured data');
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    metrics,
    recommendations: {
      priceExtraction: priceRate < 50 ? 'Critical - needs immediate improvement' : 'Acceptable',
      abvExtraction: abvRate < 30 ? 'Critical - needs immediate improvement' : 'Acceptable',
      imageExtraction: imageRate < 70 ? 'Needs improvement' : 'Good',
      overallQuality: metrics.avgQualityScore < 50 ? 'Poor - significant improvements needed' : 'Acceptable'
    }
  };

  fs.writeFileSync('database-quality-report.json', JSON.stringify(report, null, 2));
  console.log('\n✅ Full report saved to database-quality-report.json');
}

function extractDomain(url: string): string {
  if (!url) return 'unknown';
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

// Run analysis
analyzeDatabase().catch(console.error);