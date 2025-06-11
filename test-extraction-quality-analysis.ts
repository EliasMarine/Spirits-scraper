import { SupabaseStorage } from './src/services/supabase-storage';
import { UltraEfficientScraper } from './src/services/ultra-efficient-scraper';
import { logger } from './src/utils/logger';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

interface ExtractionQualityReport {
  totalSpirits: number;
  spiritsWithPrice: number;
  spiritsWithABV: number;
  spiritsWithImage: number;
  spiritsWithDescription: number;
  spiritsWithBrand: number;
  spiritsWithMetadata: number;
  averageQualityScore: number;
  categoryCounts: Record<string, number>;
  dataCompletenessRate: number;
  priceExtractionRate: number;
  abvExtractionRate: number;
  imageExtractionRate: number;
  descriptionExtractionRate: number;
  commonMissingPatterns: Array<{
    pattern: string;
    count: number;
    examples: string[];
  }>;
  sourceQuality: Record<string, {
    count: number;
    avgQualityScore: number;
    priceRate: number;
    abvRate: number;
  }>;
}

class ExtractionQualityAnalyzer {
  private supabase: any;
  private storage: SupabaseStorage;
  private scraper: UltraEfficientScraper;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    this.storage = new SupabaseStorage();
    this.scraper = new UltraEfficientScraper();
  }

  /**
   * Analyze current database state
   */
  async analyzeDatabaseQuality(): Promise<ExtractionQualityReport> {
    logger.info('🔍 Analyzing current database extraction quality...\n');

    // Get recent spirits (last 1000)
    const { data: spirits, error } = await this.supabase
      .from('spirits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      logger.error('Error fetching spirits:', error);
      throw error;
    }

    const report: ExtractionQualityReport = {
      totalSpirits: spirits.length,
      spiritsWithPrice: 0,
      spiritsWithABV: 0,
      spiritsWithImage: 0,
      spiritsWithDescription: 0,
      spiritsWithBrand: 0,
      spiritsWithMetadata: 0,
      averageQualityScore: 0,
      categoryCounts: {},
      dataCompletenessRate: 0,
      priceExtractionRate: 0,
      abvExtractionRate: 0,
      imageExtractionRate: 0,
      descriptionExtractionRate: 0,
      commonMissingPatterns: [],
      sourceQuality: {}
    };

    // Track missing data patterns
    const missingPricePatterns: Record<string, string[]> = {};
    const missingABVPatterns: Record<string, string[]> = {};
    const missingImagePatterns: Record<string, string[]> = {};

    let totalQualityScore = 0;

    for (const spirit of spirits) {
      // Count data presence
      if (spirit.price && spirit.price > 0) report.spiritsWithPrice++;
      else this.trackMissingPattern(missingPricePatterns, spirit);

      if (spirit.abv && spirit.abv > 0) report.spiritsWithABV++;
      else this.trackMissingPattern(missingABVPatterns, spirit);

      if (spirit.image_url) report.spiritsWithImage++;
      else this.trackMissingPattern(missingImagePatterns, spirit);

      if (spirit.description && spirit.description.length > 20) report.spiritsWithDescription++;
      if (spirit.brand) report.spiritsWithBrand++;
      if (spirit.metadata && Object.keys(spirit.metadata).length > 0) report.spiritsWithMetadata++;

      // Count categories
      const category = spirit.category || 'Unknown';
      report.categoryCounts[category] = (report.categoryCounts[category] || 0) + 1;

      // Track source quality
      const source = this.extractSourceDomain(spirit.source_url);
      if (!report.sourceQuality[source]) {
        report.sourceQuality[source] = {
          count: 0,
          avgQualityScore: 0,
          priceRate: 0,
          abvRate: 0
        };
      }
      
      const sourceStats = report.sourceQuality[source];
      sourceStats.count++;
      sourceStats.avgQualityScore += spirit.data_quality_score || 0;
      if (spirit.price > 0) sourceStats.priceRate++;
      if (spirit.abv > 0) sourceStats.abvRate++;

      totalQualityScore += spirit.data_quality_score || 0;
    }

    // Calculate rates
    report.priceExtractionRate = (report.spiritsWithPrice / report.totalSpirits) * 100;
    report.abvExtractionRate = (report.spiritsWithABV / report.totalSpirits) * 100;
    report.imageExtractionRate = (report.spiritsWithImage / report.totalSpirits) * 100;
    report.descriptionExtractionRate = (report.spiritsWithDescription / report.totalSpirits) * 100;
    report.averageQualityScore = totalQualityScore / report.totalSpirits;

    // Calculate overall completeness
    const completeSpirits = spirits.filter(s => 
      s.price > 0 && s.abv > 0 && s.image_url && s.description && s.brand
    ).length;
    report.dataCompletenessRate = (completeSpirits / report.totalSpirits) * 100;

    // Finalize source quality metrics
    for (const source in report.sourceQuality) {
      const stats = report.sourceQuality[source];
      stats.avgQualityScore = stats.avgQualityScore / stats.count;
      stats.priceRate = (stats.priceRate / stats.count) * 100;
      stats.abvRate = (stats.abvRate / stats.count) * 100;
    }

    // Identify common missing patterns
    report.commonMissingPatterns = this.identifyCommonPatterns({
      price: missingPricePatterns,
      abv: missingABVPatterns,
      image: missingImagePatterns
    });

    return report;
  }

  /**
   * Run comprehensive tests across categories
   */
  async runComprehensiveTests() {
    const categories = ['bourbon', 'scotch', 'rum', 'vodka', 'gin', 'tequila'];
    const testResults: Record<string, any> = {};

    logger.info('🚀 Running comprehensive extraction tests...\n');

    for (const category of categories) {
      logger.info(`\n📦 Testing ${category.toUpperCase()} extraction...`);
      
      try {
        const metrics = await this.scraper.scrapeWithUltraEfficiency({
          category,
          limit: 20, // Small batch for testing
          targetEfficiency: 60,
          deepExtraction: true
        });

        // Get the spirits that were just added
        const { data: recentSpirits } = await this.supabase
          .from('spirits')
          .select('*')
          .eq('category', this.mapCategoryToDBCategory(category))
          .order('created_at', { ascending: false })
          .limit(20);

        // Analyze extraction quality for this category
        const categoryQuality = this.analyzeCategoryQuality(recentSpirits || []);
        
        testResults[category] = {
          metrics,
          quality: categoryQuality,
          spirits: recentSpirits
        };

      } catch (error) {
        logger.error(`Error testing ${category}:`, error);
        testResults[category] = { error: error.message };
      }
    }

    return testResults;
  }

  /**
   * Analyze specific extraction failures
   */
  async analyzeExtractionFailures() {
    logger.info('\n🔍 Analyzing extraction failure patterns...\n');

    // Get spirits with missing critical data
    const { data: missingPrice } = await this.supabase
      .from('spirits')
      .select('name, source_url, type, category')
      .or('price.is.null,price.eq.0')
      .limit(50);

    const { data: missingABV } = await this.supabase
      .from('spirits')
      .select('name, source_url, type, category')
      .or('abv.is.null,abv.eq.0')
      .limit(50);

    const { data: missingImage } = await this.supabase
      .from('spirits')
      .select('name, source_url, type, category')
      .is('image_url', null)
      .limit(50);

    const failurePatterns = {
      priceExtraction: this.analyzeFailurePatterns(missingPrice || [], 'price'),
      abvExtraction: this.analyzeFailurePatterns(missingABV || [], 'abv'),
      imageExtraction: this.analyzeFailurePatterns(missingImage || [], 'image')
    };

    return failurePatterns;
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(
    dbReport: ExtractionQualityReport,
    testResults: Record<string, any>,
    failurePatterns: any
  ): string[] {
    const recommendations: string[] = [];

    // Price extraction recommendations
    if (dbReport.priceExtractionRate < 80) {
      recommendations.push(
        `🔴 Price Extraction: Only ${dbReport.priceExtractionRate.toFixed(1)}% success rate`,
        `   - Consider enhanced price pattern matching in search snippets`,
        `   - Add fallback to fetch actual product pages for price data`,
        `   - Focus on domains with structured price data (${this.getTopPriceSources(dbReport)})`
      );
    }

    // ABV extraction recommendations
    if (dbReport.abvExtractionRate < 70) {
      recommendations.push(
        `🔴 ABV/Proof Extraction: Only ${dbReport.abvExtractionRate.toFixed(1)}% success rate`,
        `   - Improve ABV pattern matching (XX% ABV, XX proof)`,
        `   - Extract from product descriptions and metadata`,
        `   - Consider category-specific ABV defaults as fallback`
      );
    }

    // Image extraction recommendations
    if (dbReport.imageExtractionRate < 90) {
      recommendations.push(
        `🟡 Image Extraction: ${dbReport.imageExtractionRate.toFixed(1)}% success rate`,
        `   - Prioritize og:image and product:image meta tags`,
        `   - Extract from pagemap.cse_image in search results`,
        `   - Consider fetching product pages for image URLs`
      );
    }

    // Source-specific recommendations
    const poorSources = Object.entries(dbReport.sourceQuality)
      .filter(([_, stats]) => stats.avgQualityScore < 50)
      .map(([source]) => source);

    if (poorSources.length > 0) {
      recommendations.push(
        `🟡 Low Quality Sources: ${poorSources.join(', ')}`,
        `   - Consider deprioritizing or removing these sources`,
        `   - Focus on high-quality retailers with structured data`
      );
    }

    // Category-specific recommendations
    for (const [category, result] of Object.entries(testResults)) {
      if (result.quality && result.quality.avgCompleteness < 70) {
        recommendations.push(
          `🟡 ${category.toUpperCase()} extraction needs improvement`,
          `   - Completeness: ${result.quality.avgCompleteness.toFixed(1)}%`,
          `   - Consider category-specific search queries`,
          `   - Add specialized extraction patterns for ${category}`
        );
      }
    }

    return recommendations;
  }

  // Helper methods
  private trackMissingPattern(patterns: Record<string, string[]>, spirit: any) {
    const key = `${spirit.type || 'Unknown'}_${this.extractSourceDomain(spirit.source_url)}`;
    if (!patterns[key]) patterns[key] = [];
    patterns[key].push(spirit.name);
  }

  private extractSourceDomain(url: string): string {
    if (!url) return 'unknown';
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return 'unknown';
    }
  }

  private identifyCommonPatterns(patterns: Record<string, Record<string, string[]>>): any[] {
    const commonPatterns: any[] = [];
    
    for (const [dataType, typePatterns] of Object.entries(patterns)) {
      const sorted = Object.entries(typePatterns)
        .map(([pattern, examples]) => ({ pattern, count: examples.length, examples: examples.slice(0, 3) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      commonPatterns.push(...sorted.map(p => ({ ...p, dataType })));
    }

    return commonPatterns.sort((a, b) => b.count - a.count).slice(0, 10);
  }

  private analyzeCategoryQuality(spirits: any[]): any {
    if (spirits.length === 0) return { avgCompleteness: 0 };

    let totalCompleteness = 0;
    for (const spirit of spirits) {
      let completeness = 0;
      if (spirit.price > 0) completeness += 25;
      if (spirit.abv > 0) completeness += 25;
      if (spirit.image_url) completeness += 25;
      if (spirit.description) completeness += 25;
      totalCompleteness += completeness;
    }

    return {
      avgCompleteness: totalCompleteness / spirits.length,
      count: spirits.length
    };
  }

  private analyzeFailurePatterns(spirits: any[], dataType: string): any {
    const patterns: Record<string, number> = {};
    
    for (const spirit of spirits) {
      const source = this.extractSourceDomain(spirit.source_url);
      const category = spirit.category || 'Unknown';
      const key = `${category}_${source}`;
      patterns[key] = (patterns[key] || 0) + 1;
    }

    return {
      totalMissing: spirits.length,
      topPatterns: Object.entries(patterns)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([pattern, count]) => ({ pattern, count }))
    };
  }

  private getTopPriceSources(report: ExtractionQualityReport): string {
    return Object.entries(report.sourceQuality)
      .filter(([_, stats]) => stats.priceRate > 80)
      .sort(([, a], [, b]) => b.priceRate - a.priceRate)
      .slice(0, 3)
      .map(([source]) => source)
      .join(', ');
  }

  private mapCategoryToDBCategory(category: string): string {
    const mapping: Record<string, string> = {
      'bourbon': 'Bourbon',
      'scotch': 'Scotch Whiskey',
      'rum': 'Rum',
      'vodka': 'Vodka',
      'gin': 'Gin',
      'tequila': 'Tequila'
    };
    return mapping[category.toLowerCase()] || category;
  }
}

// Main execution
async function main() {
  const analyzer = new ExtractionQualityAnalyzer();
  
  try {
    // 1. Analyze current database state
    logger.info('=' .repeat(60));
    logger.info('📊 EXTRACTION QUALITY ANALYSIS');
    logger.info('=' .repeat(60));
    
    const dbReport = await analyzer.analyzeDatabaseQuality();
    
    // Print database report
    console.log('\n📈 DATABASE QUALITY REPORT:');
    console.log('-'.repeat(40));
    console.log(`Total Spirits: ${dbReport.totalSpirits}`);
    console.log(`Average Quality Score: ${dbReport.averageQualityScore.toFixed(1)}/100`);
    console.log(`\nData Extraction Rates:`);
    console.log(`  - Price: ${dbReport.priceExtractionRate.toFixed(1)}% (${dbReport.spiritsWithPrice}/${dbReport.totalSpirits})`);
    console.log(`  - ABV: ${dbReport.abvExtractionRate.toFixed(1)}% (${dbReport.spiritsWithABV}/${dbReport.totalSpirits})`);
    console.log(`  - Image: ${dbReport.imageExtractionRate.toFixed(1)}% (${dbReport.spiritsWithImage}/${dbReport.totalSpirits})`);
    console.log(`  - Description: ${dbReport.descriptionExtractionRate.toFixed(1)}% (${dbReport.spiritsWithDescription}/${dbReport.totalSpirits})`);
    console.log(`  - Complete Records: ${dbReport.dataCompletenessRate.toFixed(1)}%`);
    
    console.log(`\nCategory Distribution:`);
    for (const [category, count] of Object.entries(dbReport.categoryCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  - ${category}: ${count}`);
    }
    
    console.log(`\nTop Source Quality:`);
    const topSources = Object.entries(dbReport.sourceQuality)
      .sort(([, a], [, b]) => b.avgQualityScore - a.avgQualityScore)
      .slice(0, 5);
    for (const [source, stats] of topSources) {
      console.log(`  - ${source}: Score ${stats.avgQualityScore.toFixed(1)}, Price ${stats.priceRate.toFixed(1)}%, ABV ${stats.abvRate.toFixed(1)}%`);
    }

    // 2. Run comprehensive tests
    console.log('\n🧪 Running extraction tests across categories...');
    const testResults = await analyzer.runComprehensiveTests();
    
    // 3. Analyze failure patterns
    const failurePatterns = await analyzer.analyzeExtractionFailures();
    
    console.log('\n❌ Common Extraction Failures:');
    console.log('Price extraction failures:', failurePatterns.priceExtraction.topPatterns);
    console.log('ABV extraction failures:', failurePatterns.abvExtraction.topPatterns);
    console.log('Image extraction failures:', failurePatterns.imageExtraction.topPatterns);

    // 4. Generate recommendations
    const recommendations = analyzer.generateRecommendations(dbReport, testResults, failurePatterns);
    
    console.log('\n💡 RECOMMENDATIONS FOR IMPROVEMENT:');
    console.log('='.repeat(60));
    for (const rec of recommendations) {
      console.log(rec);
    }

    // 5. Save detailed report
    const fullReport = {
      timestamp: new Date().toISOString(),
      databaseQuality: dbReport,
      testResults,
      failurePatterns,
      recommendations
    };

    await require('fs').promises.writeFile(
      'extraction-quality-report.json',
      JSON.stringify(fullReport, null, 2)
    );
    
    logger.info('\n✅ Analysis complete! Report saved to extraction-quality-report.json');

  } catch (error) {
    logger.error('Error in analysis:', error);
  }
}

// Run the analysis
main().catch(console.error);