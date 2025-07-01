import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
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

interface DeletionScript {
  timestamp: string;
  reason: string;
  totalToDelete: number;
  idsToDelete: string[];
  analysis: {
    duplicateGroups: number;
    affectedSpirits: number;
  };
}

async function loadDeletionScript(): Promise<DeletionScript> {
  const filePath = path.join(process.cwd(), 'whisky-duplicates-to-delete.json');
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to load deletion script:', error);
    process.exit(1);
  }
}

async function verifyEntriesToDelete(idsToDelete: string[]): Promise<void> {
  console.log('🔍 Verifying entries to delete...');
  
  const { data, error } = await supabase
    .from('spirits')
    .select('id, name, created_at')
    .in('id', idsToDelete);

  if (error) {
    console.error('❌ Error verifying entries:', error);
    process.exit(1);
  }

  if (!data || data.length !== idsToDelete.length) {
    console.error(`❌ Verification failed: Expected ${idsToDelete.length} entries, found ${data?.length || 0}`);
    process.exit(1);
  }

  console.log(`✅ Verified ${data.length} entries to delete:`);
  data.forEach((entry, index) => {
    console.log(`   ${index + 1}. "${entry.name}" (${entry.id})`);
  });
}

async function deleteEntries(idsToDelete: string[]): Promise<void> {
  console.log('🗑️  Deleting entries...');
  
  const { error } = await supabase
    .from('spirits')
    .delete()
    .in('id', idsToDelete);

  if (error) {
    console.error('❌ Error deleting entries:', error);
    process.exit(1);
  }

  console.log(`✅ Successfully deleted ${idsToDelete.length} entries`);
}

async function verifyDeletion(idsToDelete: string[]): Promise<void> {
  console.log('🔍 Verifying deletion...');
  
  const { data, error } = await supabase
    .from('spirits')
    .select('id')
    .in('id', idsToDelete);

  if (error) {
    console.error('❌ Error verifying deletion:', error);
    process.exit(1);
  }

  if (data && data.length > 0) {
    console.error(`❌ Deletion verification failed: ${data.length} entries still exist`);
    process.exit(1);
  }

  console.log('✅ Deletion verified - all entries successfully removed');
}

async function main() {
  console.log('🚀 Starting Whisky/Whiskey Duplicate Cleanup...');
  
  try {
    // Load deletion script
    const deletionScript = await loadDeletionScript();
    
    console.log(`📋 Deletion Script Details:`);
    console.log(`- Timestamp: ${deletionScript.timestamp}`);
    console.log(`- Reason: ${deletionScript.reason}`);
    console.log(`- Total to Delete: ${deletionScript.totalToDelete}`);
    console.log(`- Duplicate Groups: ${deletionScript.analysis.duplicateGroups}`);
    console.log(`- Affected Spirits: ${deletionScript.analysis.affectedSpirits}`);
    
    // Verify entries exist before deletion
    await verifyEntriesToDelete(deletionScript.idsToDelete);
    
    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete the entries listed above.');
    console.log('Proceeding with deletion in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Perform deletion
    await deleteEntries(deletionScript.idsToDelete);
    
    // Verify deletion was successful
    await verifyDeletion(deletionScript.idsToDelete);
    
    console.log('\n🎯 CLEANUP SUMMARY:');
    console.log(`✅ Successfully removed ${deletionScript.totalToDelete} duplicate entries`);
    console.log(`✅ Cleaned up ${deletionScript.analysis.duplicateGroups} duplicate groups`);
    console.log('✅ Whisky/Whiskey duplicate cleanup complete!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);