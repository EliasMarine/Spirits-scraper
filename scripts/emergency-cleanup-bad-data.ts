import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

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

interface BadEntry {
  id: string;
  name: string;
  issues: string[];
  quality: string;
}

async function performEmergencyCleanup() {
  console.log('🚨 EMERGENCY DATABASE CLEANUP STARTING 🚨');
  
  // Load bad entries identified during audit
  const badEntriesPath = path.join(process.cwd(), 'bad-entries-to-clean.json');
  let badEntries: BadEntry[] = [];
  
  try {
    const badEntriesData = readFileSync(badEntriesPath, 'utf-8');
    badEntries = JSON.parse(badEntriesData);
    console.log(`Loaded ${badEntries.length} bad entries for cleanup`);
  } catch (error) {
    console.log('No bad entries file found, proceeding with date-based cleanup');
  }
  
  // Step 1: Count entries that will be affected
  console.log('\n📊 ANALYZING CLEANUP SCOPE...');
  
  const { data: recentStats, error: statsError } = await supabase
    .from('spirits')
    .select('id, name, category, source_url, data_quality_score, created_at')
    .gte('created_at', '2025-06-30T00:00:00.000Z')
    .order('created_at', { ascending: false });
    
  if (statsError) {
    console.error('Error fetching stats:', statsError);
    return;
  }
  
  const stats = {
    total: recentStats.length,
    missingUrl: recentStats.filter(s => !s.source_url || s.source_url.trim() === '').length,
    otherCategory: recentStats.filter(s => s.category === 'Other').length,
    lowQuality: recentStats.filter(s => s.data_quality_score && s.data_quality_score < 50).length,
  };
  
  console.log('CLEANUP IMPACT ANALYSIS:');
  console.log(`- Total recent entries (since 2025-06-30): ${stats.total}`);
  console.log(`- Missing URL: ${stats.missingUrl} (${((stats.missingUrl/stats.total)*100).toFixed(1)}%)`);
  console.log(`- Category "Other": ${stats.otherCategory} (${((stats.otherCategory/stats.total)*100).toFixed(1)}%)`);
  console.log(`- Low quality score (<50): ${stats.lowQuality} (${((stats.lowQuality/stats.total)*100).toFixed(1)}%)`);
  
  // Calculate entries to delete
  const entriesToDelete = recentStats.filter(s => 
    !s.source_url || s.source_url.trim() === '' ||
    s.category === 'Other' ||
    (s.data_quality_score && s.data_quality_score < 50)
  );
  
  console.log(`\n🗑️  ENTRIES TO DELETE: ${entriesToDelete.length}/${stats.total} (${((entriesToDelete.length/stats.total)*100).toFixed(1)}%)`);
  
  if (entriesToDelete.length === 0) {
    console.log('✅ No entries meet deletion criteria. Cleanup not needed.');
    return;
  }
  
  // Step 2: Create backup before deletion
  console.log('\n💾 CREATING BACKUP...');
  const backupData = {
    timestamp: new Date().toISOString(),
    reason: 'Emergency cleanup - V3.1.6 data quality issues',
    entries: entriesToDelete,
    stats
  };
  
  // Save backup to file
  const backupPath = path.join(process.cwd(), `emergency-backup-${Date.now()}.json`);
  writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`✅ Backup saved to: ${backupPath}`);
  
  // Step 3: Perform deletion in batches
  console.log('\n🗑️  STARTING DELETION...');
  
  const BATCH_SIZE = 50;
  let deletedCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < entriesToDelete.length; i += BATCH_SIZE) {
    const batch = entriesToDelete.slice(i, i + BATCH_SIZE);
    const batchIds = batch.map(entry => entry.id);
    
    console.log(`Deleting batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(entriesToDelete.length/BATCH_SIZE)} (${batch.length} entries)...`);
    
    try {
      const { error: deleteError } = await supabase
        .from('spirits')
        .delete()
        .in('id', batchIds);
        
      if (deleteError) {
        console.error(`❌ Error deleting batch:`, deleteError);
        errorCount += batch.length;
      } else {
        deletedCount += batch.length;
        console.log(`✅ Deleted ${batch.length} entries`);
      }
    } catch (error) {
      console.error(`❌ Exception during batch deletion:`, error);
      errorCount += batch.length;
    }
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Step 4: Verify cleanup results
  console.log('\n📊 CLEANUP RESULTS:');
  console.log(`✅ Successfully deleted: ${deletedCount} entries`);
  console.log(`❌ Failed to delete: ${errorCount} entries`);
  console.log(`📁 Backup location: ${backupPath}`);
  
  // Step 5: Post-cleanup validation
  console.log('\n🔍 POST-CLEANUP VALIDATION...');
  
  const { data: remainingEntries, error: validationError } = await supabase
    .from('spirits')
    .select('id, category, source_url, data_quality_score')
    .gte('created_at', '2025-06-30T00:00:00.000Z');
    
  if (validationError) {
    console.error('Error during validation:', validationError);
    return;
  }
  
  const remaining = {
    total: remainingEntries.length,
    missingUrl: remainingEntries.filter(s => !s.source_url || s.source_url.trim() === '').length,
    otherCategory: remainingEntries.filter(s => s.category === 'Other').length,
    lowQuality: remainingEntries.filter(s => s.data_quality_score && s.data_quality_score < 50).length,
  };
  
  console.log('REMAINING ENTRIES AFTER CLEANUP:');
  console.log(`- Total: ${remaining.total}`);
  console.log(`- Missing URL: ${remaining.missingUrl} (${remaining.total > 0 ? ((remaining.missingUrl/remaining.total)*100).toFixed(1) : 0}%)`);
  console.log(`- Category "Other": ${remaining.otherCategory} (${remaining.total > 0 ? ((remaining.otherCategory/remaining.total)*100).toFixed(1) : 0}%)`);
  console.log(`- Low quality: ${remaining.lowQuality} (${remaining.total > 0 ? ((remaining.lowQuality/remaining.total)*100).toFixed(1) : 0}%)`);
  
  if (remaining.missingUrl > 0 || remaining.otherCategory > remaining.total * 0.3) {
    console.log('⚠️  WARNING: Cleanup may be incomplete. Manual review recommended.');
  } else {
    console.log('✅ Cleanup appears successful. Data quality significantly improved.');
  }
  
  console.log('\n🚨 EMERGENCY CLEANUP COMPLETED 🚨');
  console.log('Next steps:');
  console.log('1. Review scraper logic fixes');
  console.log('2. Test scraper with small batch');
  console.log('3. Monitor data quality in future scrapes');
}

// Execute cleanup with confirmation
async function main() {
  console.log('🚨 EMERGENCY DATABASE CLEANUP UTILITY 🚨');
  console.log('This will delete low-quality entries from the database.');
  console.log('A backup will be created before deletion.');
  
  // In production, you might want to add a confirmation prompt
  console.log('\nStarting cleanup in 3 seconds...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    await performEmergencyCleanup();
  } catch (error) {
    console.error('❌ CLEANUP FAILED:', error);
    process.exit(1);
  }
}

main().catch(console.error);