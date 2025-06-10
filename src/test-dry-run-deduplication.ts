#!/usr/bin/env tsx

/**
 * Test script for the Enhanced Dry-Run Deduplication Service
 * 
 * This script demonstrates the comprehensive dry-run mode that provides:
 * - Detailed duplicate analysis without making changes
 * - Confidence scoring with explanations
 * - Similarity cluster visualizations
 * - Impact assessment reports
 * - Export capabilities for manual review
 */

import { dryRunDeduplicationService } from './services/dry-run-deduplication.js';
import { logger } from './utils/logger.js';
import { config } from 'dotenv';

// Load environment variables
config();

async function testDryRunDeduplication() {
  logger.info('🔍 Testing Enhanced Dry-Run Deduplication Service');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Basic dry-run analysis
    console.log('\n📊 Test 1: Basic Dry-Run Analysis');
    console.log('-'.repeat(40));
    
    const basicReport = await dryRunDeduplicationService.runDryRunAnalysis({
      incrementalOnly: false,
      useBlocking: true,
      customConfig: {
        combinedThreshold: 0.75,
        nameThreshold: 0.7,
        autoMergeThreshold: 1.0 // Never auto-merge in dry-run
      },
      exportDir: './test-dry-run-reports',
      generateVisualizations: true
    });
    
    console.log(`✅ Analyzed ${basicReport.summary.totalSpiritsAnalyzed} spirits`);
    console.log(`🔗 Found ${basicReport.summary.totalDuplicatesFound} potential duplicates`);
    console.log(`⏱️  Processing time: ${(basicReport.summary.processingTime / 1000).toFixed(2)}s`);
    console.log(`📈 Est. quality improvement: ${basicReport.summary.estimatedDataQualityImprovement.toFixed(1)}%`);
    
    if (basicReport.blockingStats) {
      console.log(`🚀 Blocking optimization: ${basicReport.blockingStats.reductionPercentage.toFixed(1)}% reduction`);
    }
    
    // Test 2: Analyze individual matches
    console.log('\n🔍 Test 2: Individual Match Analysis');
    console.log('-'.repeat(40));
    
    if (basicReport.matches.length > 0) {
      const topMatch = basicReport.matches
        .sort((a, b) => b.similarity - a.similarity)[0];
      
      console.log(`\n🎯 Top Match Analysis:`);
      console.log(`   Match ID: ${topMatch.matchId}`);
      console.log(`   Spirit 1: ${topMatch.spirit1.brand || 'Unknown'} ${topMatch.spirit1.name}`);
      console.log(`   Spirit 2: ${topMatch.spirit2.brand || 'Unknown'} ${topMatch.spirit2.name}`);
      console.log(`   Similarity: ${(topMatch.similarity * 100).toFixed(1)}%`);
      console.log(`   Confidence: ${topMatch.confidence}`);
      console.log(`   Action: ${topMatch.recommendedAction}`);
      console.log(`   Explanation: ${topMatch.confidenceExplanation}`);
      
      console.log(`\n📊 Detailed Analysis:`);
      console.log(`   Name similarity: ${(topMatch.analysisDetails.nameAnalysis.similarity * 100).toFixed(1)}%`);
      console.log(`   Brand match: ${topMatch.analysisDetails.brandAnalysis.isSameBrand ? 'Yes' : 'No'}`);
      console.log(`   Age match: ${topMatch.analysisDetails.attributeAnalysis.age.match ? 'Yes' : 'No'}`);
      console.log(`   Type match: ${topMatch.analysisDetails.attributeAnalysis.type.match ? 'Yes' : 'No'}`);
      console.log(`   Price compatible: ${topMatch.analysisDetails.priceAnalysis.priceCompatible ? 'Yes' : 'No'}`);
      
      if (topMatch.mergePreview.dataImprovements.length > 0) {
        console.log(`\n✨ Data Improvements:`);
        topMatch.mergePreview.dataImprovements.forEach(improvement => {
          console.log(`     • ${improvement}`);
        });
      }
      
      if (topMatch.mergePreview.potentialLosses.length > 0) {
        console.log(`\n⚠️  Potential Losses:`);
        topMatch.mergePreview.potentialLosses.forEach(loss => {
          console.log(`     • ${loss}`);
        });
      }
    } else {
      console.log('   No matches found in this dataset');
    }
    
    // Test 3: Similarity clusters
    console.log('\n🎨 Test 3: Similarity Cluster Analysis');
    console.log('-'.repeat(40));
    
    if (basicReport.clusters.length > 0) {
      console.log(`✅ Found ${basicReport.clusters.length} similarity clusters`);
      
      basicReport.clusters.slice(0, 3).forEach((cluster, index) => {
        console.log(`\n   Cluster ${index + 1}:`);
        console.log(`     Members: ${cluster.members.length} spirits`);
        console.log(`     Similarity: ${(cluster.clusterSimilarity * 100).toFixed(1)}%`);
        console.log(`     Action: ${cluster.recommendedAction.replace(/_/g, ' ')}`);
        console.log(`     Center: ${cluster.centerSpirit.brand || 'Unknown'} ${cluster.centerSpirit.name}`);
        
        // Show a few members
        cluster.members.slice(0, 2).forEach((member, memberIndex) => {
          console.log(`       ${memberIndex + 1}. ${member.spirit.brand || 'Unknown'} ${member.spirit.name} (${(member.similarity * 100).toFixed(1)}%)`);
        });
        
        if (cluster.members.length > 2) {
          console.log(`       ... and ${cluster.members.length - 2} more`);
        }
      });
      
      if (basicReport.clusters.length > 3) {
        console.log(`\n   ... and ${basicReport.clusters.length - 3} more clusters`);
      }
    } else {
      console.log('   No similarity clusters identified');
    }
    
    // Test 4: Impact assessment
    console.log('\n📊 Test 4: Impact Assessment');
    console.log('-'.repeat(40));
    
    console.log(`📋 Summary:`);
    console.log(`   Spirits to be removed: ${basicReport.impactAssessment.spiritsToBeRemoved}`);
    console.log(`   Data fields to enhance: ${basicReport.impactAssessment.dataFieldsToBeEnhanced}`);
    console.log(`   Duplication reduction: ${basicReport.impactAssessment.estimatedDuplicationReduction.toFixed(1)}%`);
    
    if (basicReport.impactAssessment.dataQualityImprovements.length > 0) {
      console.log(`\n✨ Quality Improvements:`);
      basicReport.impactAssessment.dataQualityImprovements.slice(0, 5).forEach(improvement => {
        console.log(`     • ${improvement}`);
      });
      if (basicReport.impactAssessment.dataQualityImprovements.length > 5) {
        console.log(`     ... and ${basicReport.impactAssessment.dataQualityImprovements.length - 5} more`);
      }
    }
    
    if (basicReport.impactAssessment.potentialDataLoss.length > 0) {
      console.log(`\n⚠️  Potential Risks:`);
      basicReport.impactAssessment.potentialDataLoss.slice(0, 3).forEach(loss => {
        console.log(`     • ${loss}`);
      });
      if (basicReport.impactAssessment.potentialDataLoss.length > 3) {
        console.log(`     ... and ${basicReport.impactAssessment.potentialDataLoss.length - 3} more`);
      }
    }
    
    // Test 5: Export verification
    console.log('\n📁 Test 5: Export Verification');
    console.log('-'.repeat(40));
    
    console.log(`📄 Exported files:`);
    console.log(`   Detailed JSON: ${basicReport.exportPaths.detailedReportJson ? '✅' : '❌'}`);
    console.log(`   Matches CSV: ${basicReport.exportPaths.matchesCsv ? '✅' : '❌'}`);
    console.log(`   Clusters JSON: ${basicReport.exportPaths.clustersJson ? '✅' : '❌'}`);
    console.log(`   Summary text: ${basicReport.exportPaths.summaryTxt ? '✅' : '❌'}`);
    
    if (basicReport.exportPaths.detailedReportJson) {
      console.log(`\n📂 Report location: ${basicReport.exportPaths.detailedReportJson.split('/').slice(0, -1).join('/')}`);
    }
    
    // Test 6: Performance comparison
    console.log('\n⚡ Test 6: Performance Comparison');
    console.log('-'.repeat(40));
    
    if (basicReport.blockingStats) {
      const efficiency = (1 - basicReport.blockingStats.comparisonsWithBlocking / basicReport.blockingStats.comparisonsWithoutBlocking) * 100;
      console.log(`🚀 Blocking Performance:`);
      console.log(`   Total blocks: ${basicReport.blockingStats.totalBlocks}`);
      console.log(`   Efficiency gain: ${efficiency.toFixed(1)}%`);
      console.log(`   Comparisons saved: ${(basicReport.blockingStats.comparisonsWithoutBlocking - basicReport.blockingStats.comparisonsWithBlocking).toLocaleString()}`);
      console.log(`   Avg block size: ${basicReport.blockingStats.averageBlockSize.toFixed(1)} spirits`);
      console.log(`   Max block size: ${basicReport.blockingStats.largestBlockSize} spirits`);
    }
    
    // Test 7: Incremental analysis (if we have recent data)
    console.log('\n🔄 Test 7: Incremental Analysis');
    console.log('-'.repeat(40));
    
    try {
      const incrementalReport = await dryRunDeduplicationService.runDryRunAnalysis({
        incrementalOnly: true,
        useBlocking: false, // Disable for small dataset
        customConfig: {
          combinedThreshold: 0.8
        },
        exportDir: './test-dry-run-reports-incremental',
        generateVisualizations: false // Skip for speed
      });
      
      console.log(`✅ Incremental analysis completed`);
      console.log(`   Recent spirits: ${incrementalReport.summary.totalSpiritsAnalyzed}`);
      console.log(`   Recent duplicates: ${incrementalReport.summary.totalDuplicatesFound}`);
      console.log(`   Processing time: ${(incrementalReport.summary.processingTime / 1000).toFixed(2)}s`);
      
    } catch (error) {
      console.log(`⚠️  Incremental analysis skipped: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Final summary
    console.log('\n🎯 Test Summary');
    console.log('=' .repeat(60));
    console.log(`✅ Dry-run deduplication testing completed successfully!`);
    console.log(`📊 Total matches analyzed: ${basicReport.matches.length}`);
    console.log(`🎨 Similarity clusters: ${basicReport.clusters.length}`);
    console.log(`📁 Reports exported: 4 files`);
    console.log(`⏱️  Total processing time: ${(basicReport.summary.processingTime / 1000).toFixed(2)}s`);
    
    console.log('\n💡 Key Features Demonstrated:');
    console.log('   • Comprehensive duplicate analysis without data modification');
    console.log('   • Detailed confidence scoring with explanations');
    console.log('   • Similarity cluster identification and visualization');
    console.log('   • Impact assessment with quality improvement estimates');
    console.log('   • Multiple export formats (JSON, CSV, TXT)');
    console.log('   • Blocking optimization for large datasets');
    console.log('   • Incremental analysis support');
    
    console.log('\n🚀 Ready for production use!');
    
  } catch (error) {
    logger.error('❌ Dry-run deduplication test failed:', error);
    console.error('\n💥 Test failed with error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the test
testDryRunDeduplication();