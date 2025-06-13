// Final production test - scraping 50 spirits to verify 95%+ accuracy
import { exec } from 'child_process';
import { promisify } from 'util';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function runProductionTest() {
  console.log('🚀 FINAL PRODUCTION TEST - 50 SPIRITS\n');
  console.log('Testing all fixes together: generic filtering, excluded domains, duplicate text, name cleaning\n');
  
  // Get timestamp before test
  const testStartTime = new Date();
  
  // Run scraper with diverse categories
  console.log('📊 Starting scraper with mixed categories...\n');
  
  try {
    // Run the scraper
    const { stdout, stderr } = await execAsync(
      'npm run scrape -- --categories "bourbon,whiskey,scotch" --limit 50 --batch-size 5',
      { cwd: process.cwd(), timeout: 600000 } // 10 minute timeout
    );
    
    console.log(stdout);
    if (stderr) console.error('Stderr:', stderr);
    
    // Wait a moment for database updates
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check the results
    console.log('\n📈 Analyzing scraped spirits...\n');
    
    const { data: spirits, error } = await supabase
      .from('spirits')
      .select('*')
      .gte('created_at', testStartTime.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching spirits:', error);
      return;
    }
    
    console.log(`✅ Scraped ${spirits?.length || 0} spirits\n`);
    
    if (spirits && spirits.length > 0) {
      // Detailed quality analysis
      let qualityIssues = 0;
      const issueBreakdown: { [key: string]: number } = {
        genericCategory: 0,
        excludedDomain: 0,
        duplicateText: 0,
        invalidName: 0,
        missingPrice: 0,
        missingABV: 0,
        poorDescription: 0
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
        'barrel/cask strength bourbons',
        'barrel strength bourbon',
        'cask strength bourbon',
        'single barrel bourbon',
        'small batch bourbon'
      ];
      
      const excludedDomains = [
        'fredminnick.com',
        'reddit.com',
        'facebook.com',
        'breakingbourbon.com',
        'whiskyadvocate.com',
        'tripadvisor.com',
        'twitter.com',
        'instagram.com',
        'pinterest.com',
        'youtube.com'
      ];
      
      // Check each spirit
      spirits.forEach((spirit, index) => {
        const issues = [];
        
        // Generic category check
        if (genericCategories.includes(spirit.name?.toLowerCase().trim() || '')) {
          issues.push('Generic category name');
          issueBreakdown.genericCategory++;
        }
        
        // Excluded domain check
        if (spirit.source_url) {
          const hasExcludedDomain = excludedDomains.some(domain => 
            spirit.source_url.toLowerCase().includes(domain)
          );
          if (hasExcludedDomain) {
            issues.push('Excluded domain');
            issueBreakdown.excludedDomain++;
          }
        }
        
        // Duplicate text check
        const duplicatePatterns = [
          /(\s+Kentucky\s+Straight).*(\s+Kentucky\s+Straight)/i,
          /(\s+Bottled\s+in\s+Bond).*(\s+Bottled\s+in\s+Bond)/i,
          /(\s+Single\s+Barrel).*(\s+Single\s+Barrel)/i,
          /(\s+Small\s+Batch).*(\s+Small\s+Batch)/i,
          /(\s+Cask\s+Strength).*(\s+Cask\s+Strength)/i
        ];
        
        if (spirit.name && duplicatePatterns.some(p => p.test(spirit.name))) {
          issues.push('Duplicate text');
          issueBreakdown.duplicateText++;
        }
        
        // Invalid name patterns
        if (spirit.name && (
          spirit.name.length < 8 ||
          spirit.name.split(/\s+/).length < 2 ||
          /^\d+\s+(best|top)/i.test(spirit.name) ||
          /\breview\s+\d+:/i.test(spirit.name) ||
          /vs\.?\s+/i.test(spirit.name) ||
          /\?$/.test(spirit.name) ||
          /collection$/i.test(spirit.name) ||
          /^(whiskey|bourbon|scotch|vodka|gin|rum|tequila)$/i.test(spirit.name)
        )) {
          issues.push('Invalid name pattern');
          issueBreakdown.invalidName++;
        }
        
        // Missing data checks
        if (!spirit.price || spirit.price === 0) {
          issues.push('No price');
          issueBreakdown.missingPrice++;
        }
        
        if (!spirit.abv) {
          issues.push('No ABV');
          issueBreakdown.missingABV++;
        }
        
        // Poor description check
        if (spirit.description && (
          spirit.description.length < 20 ||
          /\b(love|hate|recommend|review|rating|stars)\b/i.test(spirit.description) ||
          /^(I|We|My|Our)\s/i.test(spirit.description)
        )) {
          issues.push('Poor description');
          issueBreakdown.poorDescription++;
        }
        
        // Display results
        if (issues.length > 0) {
          qualityIssues++;
          console.log(`${index + 1}. ❌ ${spirit.name} (${spirit.brand || 'No brand'})`);
          console.log(`   Issues: ${issues.join(', ')}`);
          console.log(`   Source: ${spirit.source_url || 'N/A'}`);
        } else {
          console.log(`${index + 1}. ✅ ${spirit.name} (${spirit.brand || 'No brand'})`);
          console.log(`   Price: $${spirit.price}, ABV: ${spirit.abv}%, Category: ${spirit.category}`);
        }
      });
      
      const accuracy = ((spirits.length - qualityIssues) / spirits.length * 100).toFixed(1);
      
      console.log('\n' + '='.repeat(70));
      console.log('📊 FINAL PRODUCTION TEST RESULTS');
      console.log('='.repeat(70));
      console.log(`Total spirits scraped: ${spirits.length}`);
      console.log(`Quality issues found: ${qualityIssues}`);
      console.log(`Accuracy achieved: ${accuracy}%`);
      console.log(`${accuracy >= 95 ? '✅' : '❌'} ${accuracy >= 95 ? 'MEETS' : 'DOES NOT MEET'} 95% accuracy target\n`);
      
      if (qualityIssues > 0) {
        console.log('Issue Breakdown:');
        Object.entries(issueBreakdown).forEach(([type, count]) => {
          if (count > 0) {
            console.log(`  - ${type}: ${count}`);
          }
        });
      }
      
      // Show examples of high-quality spirits
      const goodSpirits = spirits.filter(s => {
        const hasIssues = genericCategories.includes(s.name?.toLowerCase().trim() || '') ||
                         (s.source_url && excludedDomains.some(d => s.source_url.includes(d))) ||
                         (s.name && duplicatePatterns.some(p => p.test(s.name))) ||
                         !s.price || !s.abv;
        return !hasIssues;
      });
      
      if (goodSpirits.length > 0) {
        console.log(`\n✨ Sample of HIGH QUALITY spirits (${goodSpirits.length} total):`);
        goodSpirits.slice(0, 10).forEach(s => {
          console.log(`  - ${s.name} (${s.brand}) - $${s.price}, ${s.abv}% ABV`);
        });
      }
      
      // Category distribution
      const categoryCount: { [key: string]: number } = {};
      spirits.forEach(s => {
        if (s.category) {
          categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
        }
      });
      
      console.log('\n📊 Category Distribution:');
      Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
          console.log(`  - ${category}: ${count}`);
        });
    }
    
  } catch (error) {
    console.error('Error running scraper:', error);
  }
  
  process.exit(0);
}

runProductionTest().catch(console.error);