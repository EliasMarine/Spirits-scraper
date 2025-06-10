// Final focused test - 10 spirits to verify fixes
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

async function runFinalTest() {
  console.log('🎯 FINAL FOCUSED TEST - 10 SPIRITS\n');
  console.log('Testing fixes: no generic categories, no excluded domains, clean names\n');
  
  // Get timestamp before test
  const testStartTime = new Date();
  
  try {
    // Run the scraper with specific queries
    const { stdout, stderr } = await execAsync(
      'npm run scrape -- --categories "bourbon" --limit 10 --batch-size 3',
      { cwd: process.cwd(), timeout: 300000 } // 5 minute timeout
    );
    
    console.log(stdout);
    if (stderr) console.error('Stderr:', stderr);
    
    // Wait for database updates
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check the results
    console.log('\n📊 Analyzing results...\n');
    
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
      
      const excludedDomains = [
        'fredminnick.com',
        'reddit.com',
        'facebook.com',
        'breakingbourbon.com'
      ];
      
      let criticalIssues = 0;
      let dataIssues = 0;
      
      spirits.forEach((spirit, index) => {
        const issues = [];
        
        // Critical issues (our fixes)
        if (genericCategories.includes(spirit.name?.toLowerCase().trim() || '')) {
          issues.push('❌ GENERIC CATEGORY');
          criticalIssues++;
        }
        
        if (spirit.source_url && excludedDomains.some(d => spirit.source_url.includes(d))) {
          issues.push('❌ EXCLUDED DOMAIN');
          criticalIssues++;
        }
        
        if (spirit.name && /(\s+Kentucky\s+Straight).*(\s+Kentucky\s+Straight)/i.test(spirit.name)) {
          issues.push('❌ DUPLICATE TEXT');
          criticalIssues++;
        }
        
        // Data quality issues (less critical)
        if (!spirit.price || spirit.price === 0) {
          issues.push('⚠️ No price');
          dataIssues++;
        }
        
        if (!spirit.abv) {
          issues.push('⚠️ No ABV');
          dataIssues++;
        }
        
        console.log(`${index + 1}. ${issues.length === 0 || (issues.length > 0 && !issues.some(i => i.includes('❌'))) ? '✅' : '❌'} ${spirit.name}`);
        console.log(`   Brand: ${spirit.brand || 'N/A'}`);
        console.log(`   Category: ${spirit.category}`);
        if (issues.length > 0) {
          console.log(`   Issues: ${issues.join(', ')}`);
        } else {
          console.log(`   Price: $${spirit.price}, ABV: ${spirit.abv}%`);
        }
        console.log(`   Source: ${spirit.source_url || 'N/A'}\n`);
      });
      
      const criticalAccuracy = ((spirits.length - criticalIssues) / spirits.length * 100).toFixed(1);
      const overallAccuracy = ((spirits.length - criticalIssues - dataIssues) / spirits.length * 100).toFixed(1);
      
      console.log('='.repeat(70));
      console.log('📊 FINAL TEST RESULTS');
      console.log('='.repeat(70));
      console.log(`Total spirits: ${spirits.length}`);
      console.log(`Critical issues (fixed by us): ${criticalIssues}`);
      console.log(`Data quality issues: ${dataIssues}`);
      console.log(`\nCritical accuracy (no generic/excluded/duplicate): ${criticalAccuracy}%`);
      console.log(`Overall accuracy (including data quality): ${overallAccuracy}%`);
      console.log(`\n${criticalAccuracy === '100.0' ? '✅' : '❌'} ${criticalAccuracy === '100.0' ? 'ALL CRITICAL FIXES WORKING!' : 'Critical fixes need work'}`);
      console.log(`${overallAccuracy >= 95 ? '✅' : '❌'} ${overallAccuracy >= 95 ? 'MEETS' : 'DOES NOT MEET'} 95% overall accuracy target`);
    }
    
  } catch (error) {
    console.error('Error running test:', error);
  }
  
  process.exit(0);
}

runFinalTest().catch(console.error);