#!/usr/bin/env node

/**
 * Ultra-Efficiency Test
 * 
 * This test will run the scraper and measure efficiency,
 * iterating on strategies until we achieve 60%+ efficiency
 */

import { ultraEfficientScraper, ScrapingMetrics } from './src/services/ultra-efficient-scraper';
import { logger } from './src/utils/logger';
import chalk from 'chalk';
import { apiCallTracker } from './src/services/api-call-tracker';

interface TestRun {
  runNumber: number;
  strategy: string;
  metrics: ScrapingMetrics;
  improvements: string[];
}

async function runEfficiencyTest() {
  console.log(chalk.cyan('\n🚀 ULTRA-EFFICIENCY TEST - Target: 60%+ Efficiency\n'));
  
  const testRuns: TestRun[] = [];
  const targetEfficiency = 0.6; // 60%
  let currentRun = 1;
  let bestEfficiency = 0;
  
  // Test different strategies
  const strategies = [
    {
      name: 'Baseline - Catalog URLs',
      options: {
        category: 'bourbon',
        limit: 10,
        targetEfficiency: 60,
        deepExtraction: false
      }
    },
    {
      name: 'Deep Extraction - Parse HTML',
      options: {
        category: 'bourbon',
        limit: 10,
        targetEfficiency: 60,
        deepExtraction: true
      }
    },
    {
      name: 'Multi-Category Approach',
      options: {
        category: 'whiskey', // Broader category
        limit: 10,
        targetEfficiency: 60,
        deepExtraction: true
      }
    }
  ];

  // Check current API usage
  const currentUsage = apiCallTracker.getUsageStats();
  console.log(chalk.yellow(`Current API usage: ${currentUsage.used}/${currentUsage.limit}\n`));
  
  if (currentUsage.remaining < 10) {
    console.log(chalk.red('⚠️  Not enough API calls remaining for test. Need at least 10 calls.'));
    return;
  }

  for (const strategy of strategies) {
    console.log(chalk.blue(`\n📋 Test Run ${currentRun}: ${strategy.name}`));
    console.log(chalk.gray('─'.repeat(50)));
    
    try {
      const metrics = await ultraEfficientScraper.scrapeWithUltraEfficiency(strategy.options);
      
      const efficiency = metrics.efficiency;
      const improvements: string[] = [];
      
      // Analyze results and suggest improvements
      if (efficiency < targetEfficiency) {
        if (metrics.catalogPagesFound === 0) {
          improvements.push('No catalog pages found - need better catalog detection');
        }
        if (metrics.averageSpiritsPerCatalog < 10) {
          improvements.push('Low yield per catalog - improve extraction patterns');
        }
        if (metrics.spiritsFound < metrics.apiCalls) {
          improvements.push('Less than 1 spirit per API call - focus on high-yield queries');
        }
      }
      
      testRuns.push({
        runNumber: currentRun,
        strategy: strategy.name,
        metrics,
        improvements
      });
      
      if (efficiency > bestEfficiency) {
        bestEfficiency = efficiency;
      }
      
      // Stop if we achieve target
      if (efficiency >= targetEfficiency) {
        console.log(chalk.green(`\n🎯 TARGET ACHIEVED! Efficiency: ${(efficiency * 100).toFixed(1)}%`));
        break;
      }
      
      currentRun++;
      
    } catch (error) {
      console.error(chalk.red(`Error in test run: ${error}`));
    }
    
    // Check if we're approaching API limit
    const usage = apiCallTracker.getUsageStats();
    if (usage.remaining < 5) {
      console.log(chalk.yellow('\n⚠️  Approaching API limit, stopping tests'));
      break;
    }
  }
  
  // Print summary report
  printSummaryReport(testRuns, targetEfficiency);
  
  // Provide recommendations
  printRecommendations(testRuns, targetEfficiency);
}

function printSummaryReport(testRuns: TestRun[], targetEfficiency: number) {
  console.log(chalk.cyan('\n' + '='.repeat(60)));
  console.log(chalk.cyan('📊 EFFICIENCY TEST SUMMARY'));
  console.log(chalk.cyan('='.repeat(60)));
  
  console.log(chalk.white('\nTest Results:'));
  
  testRuns.forEach(run => {
    const efficiency = run.metrics.efficiency * 100;
    const efficiencyColor = efficiency >= targetEfficiency * 100 ? chalk.green : chalk.red;
    
    console.log(`\nRun ${run.runNumber}: ${run.strategy}`);
    console.log(`  API Calls: ${run.metrics.apiCalls}`);
    console.log(`  Spirits Found: ${run.metrics.spiritsFound}`);
    console.log(`  Efficiency: ${efficiencyColor(efficiency.toFixed(1) + '%')}`);
    console.log(`  Catalog Pages: ${run.metrics.catalogPagesFound}`);
    
    if (run.metrics.topPerformingQueries.length > 0) {
      console.log(`  Best Query: "${run.metrics.topPerformingQueries[0].query}"`);
      console.log(`    → Yielded ${run.metrics.topPerformingQueries[0].spiritsYield} spirits`);
    }
  });
  
  // Best performance
  const bestRun = testRuns.reduce((best, run) => 
    run.metrics.efficiency > best.metrics.efficiency ? run : best
  );
  
  console.log(chalk.green(`\n🏆 Best Performance: Run ${bestRun.runNumber} - ${bestRun.strategy}`));
  console.log(chalk.green(`   Efficiency: ${(bestRun.metrics.efficiency * 100).toFixed(1)}%`));
}

function printRecommendations(testRuns: TestRun[], targetEfficiency: number) {
  console.log(chalk.yellow('\n💡 RECOMMENDATIONS:'));
  console.log(chalk.yellow('─'.repeat(50)));
  
  const bestRun = testRuns.reduce((best, run) => 
    run.metrics.efficiency > best.metrics.efficiency ? run : best
  );
  
  if (bestRun.metrics.efficiency >= targetEfficiency) {
    console.log(chalk.green('\n✅ Target efficiency achieved!'));
    console.log('\nTo maintain this efficiency:');
    console.log('1. Use the ' + chalk.cyan(bestRun.strategy) + ' approach');
    console.log('2. Focus on these query patterns:');
    
    bestRun.metrics.topPerformingQueries.slice(0, 3).forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.query.substring(0, 60)}...`);
    });
    
    console.log('\n3. Key success factors:');
    if (bestRun.metrics.catalogPagesFound > 0) {
      console.log('   - Successfully identified catalog pages');
    }
    if (bestRun.metrics.averageSpiritsPerCatalog > 20) {
      console.log('   - High yield per catalog page');
    }
    
  } else {
    console.log(chalk.red('\n❌ Target efficiency not achieved yet.'));
    console.log('\nSuggested improvements:');
    
    // Collect all improvements
    const allImprovements = new Set<string>();
    testRuns.forEach(run => {
      run.improvements.forEach(imp => allImprovements.add(imp));
    });
    
    let i = 1;
    allImprovements.forEach(improvement => {
      console.log(`${i}. ${improvement}`);
      i++;
    });
    
    console.log('\nAdditional strategies to try:');
    console.log('1. Implement result caching to avoid duplicate API calls');
    console.log('2. Use OR operators to combine multiple sites in one query');
    console.log('3. Focus exclusively on known high-yield domains');
    console.log('4. Implement parallel processing for catalog pages');
    console.log('5. Use more specific URL patterns for catalog pages');
  }
  
  console.log(chalk.cyan('\n' + '='.repeat(60) + '\n'));
}

// Mock implementation for testing without API calls
async function runMockTest() {
  console.log(chalk.yellow('\n🧪 Running MOCK test (no API calls)...\n'));
  
  // Simulate different efficiency scenarios
  const mockRuns: TestRun[] = [
    {
      runNumber: 1,
      strategy: 'Individual Product Queries (OLD)',
      metrics: {
        apiCalls: 100,
        spiritsFound: 4,
        spiritsStored: 4,
        efficiency: 0.04,
        catalogPagesFound: 0,
        averageSpiritsPerCatalog: 0,
        topPerformingQueries: []
      },
      improvements: ['Switch to catalog-based queries']
    },
    {
      runNumber: 2,
      strategy: 'Catalog URL Queries',
      metrics: {
        apiCalls: 10,
        spiritsFound: 150,
        spiritsStored: 145,
        efficiency: 15,
        catalogPagesFound: 8,
        averageSpiritsPerCatalog: 18.75,
        topPerformingQueries: [
          {
            query: 'site:totalwine.com/spirits-wine/bourbon/c',
            spiritsYield: 45,
            efficiency: 45
          }
        ]
      },
      improvements: []
    },
    {
      runNumber: 3,
      strategy: 'Deep HTML Extraction',
      metrics: {
        apiCalls: 10,
        spiritsFound: 750,
        spiritsStored: 720,
        efficiency: 75,
        catalogPagesFound: 10,
        averageSpiritsPerCatalog: 75,
        topPerformingQueries: [
          {
            query: 'site:totalwine.com bourbon "products found" "sort by"',
            spiritsYield: 120,
            efficiency: 120
          }
        ]
      },
      improvements: []
    }
  ];
  
  printSummaryReport(mockRuns, 0.6);
  printRecommendations(mockRuns, 0.6);
}

// Main execution
(async () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--mock')) {
    await runMockTest();
  } else {
    console.log(chalk.yellow('⚠️  This will use real API calls. Use --mock for simulation.'));
    console.log(chalk.yellow('Starting in 3 seconds... Press Ctrl+C to cancel.\n'));
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await runEfficiencyTest();
  }
})();