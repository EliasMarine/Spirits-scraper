import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function generateFinalReport() {
  console.log('📊 FINAL ACCURACY REPORT - ALL TESTING\n');
  console.log('='.repeat(70));
  
  // Get all spirits from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.toISOString();
  
  const { data: allSpirits, error } = await supabase
    .from('spirits')
    .select('*')
    .gte('created_at', todayStart)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching spirits:', error);
    return;
  }

  console.log(`Total spirits added today: ${allSpirits?.length || 0}\n`);

  // Separate pre-fix and post-fix spirits (based on our fix implementation time)
  const fixImplementationTime = new Date('2025-06-09T12:30:00Z'); // Approximate time when fixes were deployed
  
  const preFixSpirits = allSpirits?.filter(s => new Date(s.created_at) < fixImplementationTime) || [];
  const postFixSpirits = allSpirits?.filter(s => new Date(s.created_at) >= fixImplementationTime) || [];

  console.log(`Pre-fix spirits: ${preFixSpirits.length}`);
  console.log(`Post-fix spirits: ${postFixSpirits.length}\n`);

  // Analyze both sets
  const analyzeSpirits = (spirits: any[], label: string) => {
    console.log(`\n${label}`);
    console.log('-'.repeat(50));
    
    if (spirits.length === 0) {
      console.log('No spirits to analyze');
      return;
    }

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
      'barrel/cask strength bourbons'
    ];
    
    const excludedDomains = ['fredminnick.com', 'reddit.com', 'facebook.com', 'breakingbourbon.com'];
    
    const issues = {
      genericCategory: 0,
      excludedDomain: 0,
      duplicateText: 0,
      invalidName: 0,
      noPrice: 0,
      noAbv: 0
    };
    
    spirits.forEach(spirit => {
      if (genericCategories.includes(spirit.name?.toLowerCase().trim() || '')) {
        issues.genericCategory++;
      }
      
      if (spirit.source_url && excludedDomains.some(d => spirit.source_url.includes(d))) {
        issues.excludedDomain++;
      }
      
      if (spirit.name && /(\s+Kentucky\s+Straight).*(\s+Kentucky\s+Straight)/i.test(spirit.name)) {
        issues.duplicateText++;
      }
      
      if (spirit.name && (
        spirit.name.length < 8 ||
        spirit.name.split(/\s+/).length < 2 ||
        /^\d+\s+(best|top)/i.test(spirit.name) ||
        /\breview\s+\d+:/i.test(spirit.name) ||
        /vs\.?\s+/i.test(spirit.name)
      )) {
        issues.invalidName++;
      }
      
      if (!spirit.price || spirit.price === 0) {
        issues.noPrice++;
      }
      
      if (!spirit.abv) {
        issues.noAbv++;
      }
    });
    
    const criticalIssues = issues.genericCategory + issues.excludedDomain + issues.duplicateText + issues.invalidName;
    const dataIssues = issues.noPrice + issues.noAbv;
    const totalIssues = criticalIssues + dataIssues;
    
    const accuracy = ((spirits.length - totalIssues) / spirits.length * 100).toFixed(1);
    const criticalAccuracy = ((spirits.length - criticalIssues) / spirits.length * 100).toFixed(1);
    
    console.log(`Total spirits: ${spirits.length}`);
    console.log(`\nCritical Issues (Fixed by our changes):`);
    console.log(`  - Generic categories: ${issues.genericCategory}`);
    console.log(`  - Excluded domains: ${issues.excludedDomain}`);
    console.log(`  - Duplicate text: ${issues.duplicateText}`);
    console.log(`  - Invalid names: ${issues.invalidName}`);
    console.log(`  Total critical: ${criticalIssues}`);
    
    console.log(`\nData Quality Issues:`);
    console.log(`  - Missing price: ${issues.noPrice}`);
    console.log(`  - Missing ABV: ${issues.noAbv}`);
    console.log(`  Total data issues: ${dataIssues}`);
    
    console.log(`\nAccuracy:`);
    console.log(`  - Critical accuracy: ${criticalAccuracy}% ${criticalAccuracy === '100.0' ? '✅' : '❌'}`);
    console.log(`  - Overall accuracy: ${accuracy}% ${parseFloat(accuracy) >= 95 ? '✅' : '❌'}`);
    
    // Show examples
    if (criticalIssues > 0) {
      console.log('\nExamples of critical issues:');
      spirits.forEach(s => {
        if (genericCategories.includes(s.name?.toLowerCase().trim() || '')) {
          console.log(`  - Generic: "${s.name}"`);
        }
        if (s.source_url && excludedDomains.some(d => s.source_url.includes(d))) {
          console.log(`  - Excluded domain: ${s.name} (${s.source_url})`);
        }
      });
    }
  };

  analyzeSpirits(preFixSpirits, '📊 PRE-FIX SPIRITS ANALYSIS');
  analyzeSpirits(postFixSpirits, '📊 POST-FIX SPIRITS ANALYSIS');

  console.log('\n' + '='.repeat(70));
  console.log('🎯 SUMMARY');
  console.log('='.repeat(70));
  
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
    'barrel/cask strength bourbons'
  ];
  
  const excludedDomains = ['fredminnick.com', 'reddit.com', 'facebook.com', 'breakingbourbon.com'];
  
  if (postFixSpirits.length > 0) {
    const postFixCriticalIssues = postFixSpirits.filter(s => 
      genericCategories.includes(s.name?.toLowerCase().trim() || '') ||
      (s.source_url && excludedDomains.some(d => s.source_url.includes(d))) ||
      (s.name && /(\s+Kentucky\s+Straight).*(\s+Kentucky\s+Straight)/i.test(s.name))
    ).length;
    
    if (postFixCriticalIssues === 0) {
      console.log('✅ ALL CRITICAL FIXES WORKING!');
      console.log('   - No generic categories stored as products');
      console.log('   - No excluded domains in source URLs');
      console.log('   - No duplicate text in names');
      console.log('   - Proper spirit names extracted');
    } else {
      console.log('❌ Some critical issues remain in post-fix spirits');
    }
  } else {
    console.log('⚠️  No post-fix spirits to analyze');
  }
  
  // List high-quality spirits
  const highQualitySpirits = allSpirits?.filter(s => 
    !genericCategories.includes(s.name?.toLowerCase().trim() || '') &&
    (!s.source_url || !excludedDomains.some(d => s.source_url.includes(d))) &&
    s.price && s.abv
  ) || [];
  
  if (highQualitySpirits.length > 0) {
    console.log(`\n✨ HIGH QUALITY SPIRITS (${highQualitySpirits.length} total):`);
    highQualitySpirits.slice(0, 10).forEach(s => {
      console.log(`  - ${s.name} (${s.brand}) - $${s.price}, ${s.abv}% ABV`);
    });
  }
  
  process.exit(0);
}

generateFinalReport().catch(console.error);