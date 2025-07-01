import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import path from 'path';
import { whiskyWhiskeyNormalizer } from '../src/services/whisky-whiskey-normalizer.js';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

interface SpiritRecord {
  id: string;
  name: string;
  created_at: string;
  source_url: string;
  category: string;
  brand: string;
}

interface DuplicateAnalysis {
  duplicateGroups: Array<{
    normalizedKey: string;
    spirits: Array<SpiritRecord & { 
      normalizedName: string;
      problematicPatterns: { hasProblems: boolean; issues: string[]; shouldDelete: boolean };
    }>;
    reason: string;
    recommendedAction: 'delete_site_references' | 'merge_whisky_variants' | 'manual_review';
    toDelete: string[]; // IDs to delete
    toKeep: string[]; // IDs to keep
  }>;
  siteReferenceEntries: Array<SpiritRecord & { issues: string[] }>;
  statistics: {
    totalSpirits: number;
    duplicateGroups: number;
    affectedSpirits: number;
    siteReferenceEntries: number;
    toDeleteCount: number;
  };
}

async function fetchAllSpirits(): Promise<SpiritRecord[]> {
  console.log('🔍 Fetching all spirits from database...');
  
  const { data, error } = await supabase
    .from('spirits')
    .select('id, name, created_at, source_url, category, brand')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching spirits:', error);
    process.exit(1);
  }

  console.log(`✅ Fetched ${data.length} spirits`);
  return data;
}

function analyzeWhiskyDuplicates(spirits: SpiritRecord[]): DuplicateAnalysis {
  console.log('🔍 Analyzing whisky/whiskey duplicate patterns...');
  
  const duplicateGroups: DuplicateAnalysis['duplicateGroups'] = [];
  const siteReferenceEntries: Array<SpiritRecord & { issues: string[] }> = [];

  // First, identify all spirits with site reference issues
  spirits.forEach(spirit => {
    const problematicPatterns = whiskyWhiskeyNormalizer.hasProblematicPatterns(spirit.name);
    if (problematicPatterns.hasProblems) {
      siteReferenceEntries.push({
        ...spirit,
        issues: problematicPatterns.issues
      });
    }
  });

  // Create enhanced spirit data with normalization
  const enhancedSpirits = spirits.map(spirit => ({
    ...spirit,
    normalizedName: whiskyWhiskeyNormalizer.normalize(spirit.name).normalizedName,
    normalizedKey: whiskyWhiskeyNormalizer.generateNormalizedKey(spirit.name),
    problematicPatterns: whiskyWhiskeyNormalizer.hasProblematicPatterns(spirit.name)
  }));

  // Group by normalized key
  const keyGroups = new Map<string, typeof enhancedSpirits>();
  enhancedSpirits.forEach(spirit => {
    if (!keyGroups.has(spirit.normalizedKey)) {
      keyGroups.set(spirit.normalizedKey, []);
    }
    keyGroups.get(spirit.normalizedKey)!.push(spirit);
  });

  // Analyze groups with duplicates
  keyGroups.forEach((group, normalizedKey) => {
    if (group.length > 1) {
      // Determine the reason for duplication
      let reason = 'Normalized names are identical';
      const hasWhiskyVariations = group.some(s => /whisky/i.test(s.name)) && 
                                 group.some(s => /whiskey/i.test(s.name));
      const hasSiteReferences = group.some(s => s.problematicPatterns.hasProblems);
      
      if (hasWhiskyVariations) {
        reason += ' (whisky/whiskey spelling variations)';
      }
      if (hasSiteReferences) {
        reason += ' (site reference variations)';
      }

      // Determine recommended action and what to delete/keep
      let recommendedAction: 'delete_site_references' | 'merge_whisky_variants' | 'manual_review';
      const toDelete: string[] = [];
      const toKeep: string[] = [];

      if (hasSiteReferences) {
        recommendedAction = 'delete_site_references';
        
        // Delete entries with site references, keep clean ones
        group.forEach(spirit => {
          if (spirit.problematicPatterns.shouldDelete) {
            toDelete.push(spirit.id);
          } else {
            toKeep.push(spirit.id);
          }
        });
        
        // If all have site references, keep the most recent one
        if (toKeep.length === 0 && toDelete.length > 0) {
          // Sort by creation date (most recent first)
          const sorted = group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          toKeep.push(sorted[0].id);
          toDelete.splice(toDelete.indexOf(sorted[0].id), 1);
        }
      } else if (hasWhiskyVariations) {
        recommendedAction = 'merge_whisky_variants';
        
        // Keep the entry with "whisky" spelling (British), delete "whiskey" ones
        const whiskyEntries = group.filter(s => /\bwhisky\b/i.test(s.name));
        const whiskeyEntries = group.filter(s => /\bwhiskey\b/i.test(s.name));
        
        if (whiskyEntries.length > 0) {
          toKeep.push(whiskyEntries[0].id); // Keep first whisky entry
          toDelete.push(...whiskeyEntries.map(s => s.id)); // Delete whiskey entries
          if (whiskyEntries.length > 1) {
            toDelete.push(...whiskyEntries.slice(1).map(s => s.id)); // Delete extra whisky entries
          }
        } else {
          // All are whiskey, keep most recent
          const sorted = group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          toKeep.push(sorted[0].id);
          toDelete.push(...sorted.slice(1).map(s => s.id));
        }
      } else {
        recommendedAction = 'manual_review';
        // For manual review, don't auto-select what to delete
        toKeep.push(...group.map(s => s.id));
      }

      duplicateGroups.push({
        normalizedKey,
        spirits: group,
        reason,
        recommendedAction,
        toDelete,
        toKeep
      });
    }
  });

  const statistics = {
    totalSpirits: spirits.length,
    duplicateGroups: duplicateGroups.length,
    affectedSpirits: duplicateGroups.reduce((sum, group) => sum + group.spirits.length, 0),
    siteReferenceEntries: siteReferenceEntries.length,
    toDeleteCount: duplicateGroups.reduce((sum, group) => sum + group.toDelete.length, 0)
  };

  return {
    duplicateGroups,
    siteReferenceEntries,
    statistics
  };
}

function generateReport(analysis: DuplicateAnalysis): string {
  let report = '\n🔍 WHISKY/WHISKEY DUPLICATE ANALYSIS REPORT\n';
  report += '='.repeat(60) + '\n';
  
  report += `📊 STATISTICS:\n`;
  report += `- Total Spirits: ${analysis.statistics.totalSpirits}\n`;
  report += `- Duplicate Groups Found: ${analysis.statistics.duplicateGroups}\n`;
  report += `- Spirits Affected: ${analysis.statistics.affectedSpirits}\n`;
  report += `- Site Reference Entries: ${analysis.statistics.siteReferenceEntries}\n`;
  report += `- Entries to Delete: ${analysis.statistics.toDeleteCount}\n`;
  
  if (analysis.duplicateGroups.length > 0) {
    report += '\n🔄 DUPLICATE GROUPS:\n';
    report += '-'.repeat(40) + '\n';
    
    analysis.duplicateGroups.forEach((group, index) => {
      report += `\n${index + 1}. ${group.reason}\n`;
      report += `   Normalized Key: "${group.normalizedKey}"\n`;
      report += `   Action: ${group.recommendedAction}\n`;
      report += `   Spirits in Group:\n`;
      
      group.spirits.forEach(spirit => {
        const action = group.toDelete.includes(spirit.id) ? '❌ DELETE' : '✅ KEEP';
        report += `     ${action} - "${spirit.name}" (${spirit.id})\n`;
        if (spirit.problematicPatterns.hasProblems) {
          report += `       Issues: ${spirit.problematicPatterns.issues.join(', ')}\n`;
        }
        report += `       Created: ${spirit.created_at}\n`;
      });
    });
  }

  if (analysis.siteReferenceEntries.length > 0) {
    report += '\n🚨 ENTRIES WITH SITE REFERENCES:\n';
    report += '-'.repeat(40) + '\n';
    
    analysis.siteReferenceEntries.slice(0, 20).forEach(entry => {
      report += `- "${entry.name}" (${entry.id})\n`;
      report += `  Issues: ${entry.issues.join(', ')}\n`;
    });
    
    if (analysis.siteReferenceEntries.length > 20) {
      report += `... and ${analysis.siteReferenceEntries.length - 20} more\n`;
    }
  }

  return report;
}

async function main() {
  console.log('🚀 Starting Whisky/Whiskey Duplicate Analysis...');
  
  try {
    // Fetch all spirits
    const spirits = await fetchAllSpirits();
    
    // Analyze duplicates
    const analysis = analyzeWhiskyDuplicates(spirits);
    
    // Generate and display report
    const report = generateReport(analysis);
    console.log(report);
    
    // Save detailed analysis to file
    const analysisPath = path.join(process.cwd(), 'whisky-duplicate-analysis.json');
    writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
    console.log(`\n💾 Detailed analysis saved to: ${analysisPath}`);
    
    // Save deletion script
    const idsToDelete = analysis.duplicateGroups.flatMap(group => group.toDelete);
    if (idsToDelete.length > 0) {
      const deletionScript = {
        timestamp: new Date().toISOString(),
        reason: 'Whisky/Whiskey duplicate cleanup',
        totalToDelete: idsToDelete.length,
        idsToDelete,
        analysis: {
          duplicateGroups: analysis.statistics.duplicateGroups,
          affectedSpirits: analysis.statistics.affectedSpirits
        }
      };
      
      const deletionPath = path.join(process.cwd(), 'whisky-duplicates-to-delete.json');
      writeFileSync(deletionPath, JSON.stringify(deletionScript, null, 2));
      console.log(`💾 Deletion script saved to: ${deletionPath}`);
      
      console.log(`\n🎯 SUMMARY:`);
      console.log(`- Found ${analysis.statistics.duplicateGroups} duplicate groups`);
      console.log(`- ${idsToDelete.length} entries marked for deletion`);
      console.log(`- Run the deletion script to clean up duplicates`);
    } else {
      console.log('\n✅ No duplicates found requiring deletion!');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);