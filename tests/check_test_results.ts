import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function checkTestResults() {
  // Get spirits from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.toISOString();
  
  const { data: spirits, error } = await supabase
    .from('spirits')
    .select('name, brand, category, price, abv, source_url, created_at')
    .gte('created_at', todayStart)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching spirits:', error);
    return;
  }

  console.log(`\n✅ Found ${spirits?.length || 0} spirits from the test\n`);
  
  if (spirits && spirits.length > 0) {
    // Detailed quality analysis
    let qualityIssues = 0;
    const issueTypes: { [key: string]: number } = {
      genericCategory: 0,
      excludedDomain: 0,
      duplicateText: 0,
      invalidName: 0,
      noPrice: 0,
      noAbv: 0
    };
    
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
    
    spirits.forEach((spirit, index) => {
      const issues = [];
      
      // Check for generic category names
      if (genericCategories.includes(spirit.name?.toLowerCase().trim() || '')) {
        issues.push('Generic category as name');
        issueTypes.genericCategory++;
      }
      
      // Check for excluded domains
      if (spirit.source_url) {
        const isExcluded = excludedDomains.some(domain => spirit.source_url.includes(domain));
        if (isExcluded) {
          issues.push('Excluded domain');
          issueTypes.excludedDomain++;
        }
      }
      
      // Check for duplicate text
      if (spirit.name && /(\s+Kentucky\s+Straight).*(\s+Kentucky\s+Straight)/i.test(spirit.name)) {
        issues.push('Duplicate text');
        issueTypes.duplicateText++;
      }
      
      // Check for invalid names
      if (spirit.name && (
        spirit.name.length < 8 ||
        spirit.name.split(/\s+/).length < 2 ||
        /^\d+\s+(best|top)/i.test(spirit.name) ||
        /\breview\s+\d+:/i.test(spirit.name) ||
        /vs\.?\s+/i.test(spirit.name)
      )) {
        issues.push('Invalid name pattern');
        issueTypes.invalidName++;
      }
      
      // Check for missing data
      if (!spirit.price || spirit.price === 0) {
        issues.push('No price');
        issueTypes.noPrice++;
      }
      
      if (!spirit.abv) {
        issues.push('No ABV');
        issueTypes.noAbv++;
      }
      
      if (issues.length > 0) {
        qualityIssues++;
        console.log(`${index + 1}. ❌ ${spirit.name}`);
        console.log(`   Brand: ${spirit.brand || 'N/A'}`);
        console.log(`   Issues: ${issues.join(', ')}`);
        console.log(`   Source: ${spirit.source_url || 'N/A'}`);
      } else {
        console.log(`${index + 1}. ✅ ${spirit.name}`);
        console.log(`   Brand: ${spirit.brand || 'N/A'}`);
        console.log(`   Price: $${spirit.price || 'N/A'}`);
        console.log(`   ABV: ${spirit.abv || 'N/A'}%`);
      }
      console.log('');
    });
    
    const accuracy = ((spirits.length - qualityIssues) / spirits.length * 100).toFixed(1);
    
    console.log('='.repeat(60));
    console.log(`📊 CURRENT TEST RESULTS`);
    console.log('='.repeat(60));
    console.log(`Total spirits: ${spirits.length}`);
    console.log(`Quality issues: ${qualityIssues}`);
    console.log(`Accuracy: ${accuracy}%`);
    console.log(`${accuracy >= 95 ? '✅' : '❌'} ${accuracy >= 95 ? 'MEETS' : 'DOES NOT MEET'} 95% accuracy target\n`);
    
    console.log('Issue Breakdown:');
    Object.entries(issueTypes).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`  - ${type}: ${count}`);
      }
    });
    
    // Sample of good spirits
    const goodSpirits = spirits.filter((s, i) => {
      const hasIssues = genericCategories.includes(s.name?.toLowerCase().trim() || '') ||
                       (s.source_url && excludedDomains.some(d => s.source_url.includes(d))) ||
                       !s.price || !s.abv;
      return !hasIssues;
    });
    
    if (goodSpirits.length > 0) {
      console.log(`\n✅ Sample of HIGH QUALITY spirits (${goodSpirits.length} total):`);
      goodSpirits.slice(0, 5).forEach(s => {
        console.log(`  - ${s.name} (${s.brand}) - $${s.price}, ${s.abv}% ABV`);
      });
    }
  }
  
  process.exit(0);
}

checkTestResults().catch(console.error);