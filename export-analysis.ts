import { supabaseStorage } from './src/services/supabase-storage.js';

async function analyzeSpirits() {
  console.log('Exporting spirits for analysis...\n');
  
  // Access the Supabase client directly
  const client = (supabaseStorage as any).client;
  
  const { data: spirits, error } = await client
    .from('spirits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(13);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Total spirits analyzed: ${spirits.length}`);
  console.log(`Average quality score: ${(spirits.reduce((sum, s) => sum + (s.data_quality_score || 0), 0) / spirits.length).toFixed(1)}/100`);
  
  // Analyze data quality
  let perfectSpirits = 0;
  let highQualitySpirits = 0;
  let issues: string[] = [];
  
  spirits.forEach((spirit, index) => {
    console.log(`\n${index + 1}. ${spirit.name}`);
    console.log(`   Type: ${spirit.type || 'Unknown'}`);
    console.log(`   Brand: ${spirit.brand || 'Unknown'}`);
    console.log(`   Quality Score: ${spirit.data_quality_score || 0}/100`);
    console.log(`   Has Price: ${spirit.price ? 'Yes' : 'No'}`);
    console.log(`   Has Description: ${spirit.description ? 'Yes' : 'No'}`);
    console.log(`   Source: ${spirit.source_url || 'None'}`);
    
    // Check for issues
    const spiritIssues: string[] = [];
    
    if (!spirit.name || spirit.name.length < 3) {
      spiritIssues.push('Invalid name');
    }
    
    if (!spirit.type || spirit.type === 'Other' || spirit.type === 'Spirit') {
      spiritIssues.push('Generic/missing type');
    }
    
    if (!spirit.brand) {
      spiritIssues.push('Missing brand');
    }
    
    if (!spirit.description || spirit.description.length < 50) {
      spiritIssues.push('Missing/short description');
    }
    
    if (spirit.description_mismatch) {
      spiritIssues.push('Description mismatch');
    }
    
    if (!spirit.price && !spirit.price_range) {
      spiritIssues.push('No pricing info');
    }
    
    if (!spirit.source_url || spirit.source_url.includes('reddit.com') || spirit.source_url.includes('facebook.com')) {
      spiritIssues.push('Invalid/excluded source');
    }
    
    if (spiritIssues.length === 0) {
      perfectSpirits++;
      console.log('   ✅ Perfect spirit!');
    } else {
      console.log('   ⚠️  Issues:', spiritIssues.join(', '));
      issues.push(`${spirit.name}: ${spiritIssues.join(', ')}`);
    }
    
    if ((spirit.data_quality_score || 0) >= 80) {
      highQualitySpirits++;
    }
  });
  
  console.log('\n📊 SUMMARY');
  console.log('─'.repeat(50));
  console.log(`Perfect spirits: ${perfectSpirits}/${spirits.length} (${(perfectSpirits/spirits.length*100).toFixed(1)}%)`);
  console.log(`High quality (80+): ${highQualitySpirits}/${spirits.length} (${(highQualitySpirits/spirits.length*100).toFixed(1)}%)`);
  console.log(`Accuracy rate: ${((perfectSpirits + highQualitySpirits/2) / spirits.length * 100).toFixed(1)}%`);
  
  if (issues.length > 0) {
    console.log('\n⚠️  ISSUES FOUND:');
    issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  // Calculate final accuracy
  const accuracy = (perfectSpirits / spirits.length) * 100;
  console.log(`\n🎯 FINAL ACCURACY: ${accuracy.toFixed(1)}%`);
  
  if (accuracy >= 95) {
    console.log('✅ TARGET ACHIEVED: 95%+ accuracy!');
  } else {
    console.log(`❌ Below target: Need ${(95 - accuracy).toFixed(1)}% improvement`);
  }
  
  process.exit(0);
}

analyzeSpirits().catch(console.error);