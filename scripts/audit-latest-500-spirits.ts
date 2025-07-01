import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';
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

interface SpiritAnalysis {
  id: string;
  name: string;
  category: string;
  issues: string[];
  quality: 'good' | 'bad' | 'review';
  data: any;
}

async function fetchLatest500Spirits() {
  console.log('Fetching latest 500 spirits from database...');
  
  const { data, error } = await supabase
    .from('spirits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Error fetching spirits:', error);
    process.exit(1);
  }

  return data;
}

function analyzeSpirit(spirit: any): SpiritAnalysis {
  const issues: string[] = [];
  let quality: 'good' | 'bad' | 'review' = 'good';

  // Check for empty or missing critical fields
  if (!spirit.name || spirit.name.trim() === '') {
    issues.push('Missing or empty name');
    quality = 'bad';
  }

  // Check for bad name patterns
  if (spirit.name) {
    // Generic or search query-like names
    if (/^(budget|cheap|best|top|premium|rare|limited|special|exclusive)\s+(whiskey|bourbon|scotch|rum|gin|vodka|tequila)/i.test(spirit.name)) {
      issues.push('Search query as name instead of actual product');
      quality = 'bad';
    }
    
    // Concatenated text without spaces
    if (/[a-z][A-Z]/.test(spirit.name) && !spirit.name.includes(' ')) {
      issues.push('Concatenated text without spaces');
      quality = 'review';
    }
    
    // Excessive capitalization
    if (spirit.name === spirit.name.toUpperCase() && spirit.name.length > 5) {
      issues.push('All caps name');
      quality = 'review';
    }
    
    // Too short
    if (spirit.name.length < 3) {
      issues.push('Name too short');
      quality = 'bad';
    }
    
    // Contains review fragments
    if (/\b(stars|rating|review|love|hate|best|worst|recommend)\b/i.test(spirit.name)) {
      issues.push('Contains review language in name');
      quality = 'bad';
    }
  }

  // Check description quality
  if (!spirit.description || spirit.description.trim() === '') {
    issues.push('Missing description');
    quality = quality === 'good' ? 'review' : quality;
  } else {
    // Review fragments in description
    if (/^(I love|I hate|This is|Best|Worst|[0-9]+ stars|Highly recommend)/i.test(spirit.description)) {
      issues.push('Review fragment as description');
      quality = 'bad';
    }
    
    // Too short description
    if (spirit.description.length < 20) {
      issues.push('Description too short');
      quality = quality === 'good' ? 'review' : quality;
    }
    
    // Duplicate of name
    if (spirit.description === spirit.name) {
      issues.push('Description duplicates name');
      quality = 'bad';
    }
  }

  // Check category accuracy
  if (!spirit.category) {
    issues.push('Missing category');
    quality = 'bad';
  } else {
    // Check for misclassified spirits based on name
    if (spirit.name) {
      const nameLower = spirit.name.toLowerCase();
      
      // Bourbon incorrectly labeled as Rye
      if (spirit.category === 'Rye Whiskey' && 
          (nameLower.includes('bourbon') || 
           /buffalo trace|maker's mark|woodford reserve|eagle rare|blanton's/i.test(nameLower))) {
        issues.push('Bourbon misclassified as Rye Whiskey');
        quality = 'bad';
      }
      
      // Tennessee whiskey as bourbon
      if (spirit.category === 'Bourbon' && 
          /jack daniel's|george dickel|uncle nearest/i.test(nameLower)) {
        issues.push('Tennessee Whiskey misclassified as Bourbon');
        quality = 'review';
      }
    }
  }

  // Check price format
  if (spirit.price) {
    if (typeof spirit.price === 'string') {
      // Check if it's properly formatted
      if (!/^\$?[0-9,]+(\.[0-9]{2})?$/.test(spirit.price)) {
        issues.push('Improperly formatted price');
        quality = quality === 'good' ? 'review' : quality;
      }
    }
  }

  // Check URL validity
  if (!spirit.url || spirit.url.trim() === '') {
    issues.push('Missing URL');
    quality = quality === 'good' ? 'review' : quality;
  } else {
    // Check for social media URLs
    if (/reddit\.com|facebook\.com|twitter\.com|instagram\.com|tiktok\.com/i.test(spirit.url)) {
      issues.push('Social media URL instead of retailer');
      quality = 'bad';
    }
  }

  // Check proof/ABV consistency
  if (spirit.proof && spirit.abv) {
    const expectedAbv = parseFloat(spirit.proof) / 2;
    const actualAbv = parseFloat(spirit.abv);
    if (Math.abs(expectedAbv - actualAbv) > 0.1) {
      issues.push(`Proof/ABV mismatch: ${spirit.proof} proof should be ${expectedAbv}% ABV, but found ${actualAbv}%`);
      quality = quality === 'good' ? 'review' : quality;
    }
  }

  // Check age statement validity
  if (spirit.age) {
    const age = parseInt(spirit.age);
    if (isNaN(age) || age < 1 || age > 100) {
      issues.push(`Invalid age statement: ${spirit.age}`);
      quality = quality === 'good' ? 'review' : quality;
    }
  }

  // Check data quality score
  if (spirit.data_quality_score !== null && spirit.data_quality_score < 50) {
    issues.push(`Low data quality score: ${spirit.data_quality_score}`);
    quality = quality === 'good' ? 'review' : quality;
  }

  return {
    id: spirit.id,
    name: spirit.name || 'MISSING',
    category: spirit.category || 'MISSING',
    issues,
    quality,
    data: spirit
  };
}

async function main() {
  const spirits = await fetchLatest500Spirits();
  console.log(`Fetched ${spirits.length} spirits`);

  const analyses: SpiritAnalysis[] = spirits.map(analyzeSpirit);
  
  // Categorize results
  const good = analyses.filter(a => a.quality === 'good');
  const bad = analyses.filter(a => a.quality === 'bad');
  const review = analyses.filter(a => a.quality === 'review');

  // Statistics
  const stats = {
    total: analyses.length,
    good: good.length,
    bad: bad.length,
    needsReview: review.length,
    percentageGood: ((good.length / analyses.length) * 100).toFixed(2),
    percentageBad: ((bad.length / analyses.length) * 100).toFixed(2),
    percentageReview: ((review.length / analyses.length) * 100).toFixed(2),
  };

  // Issue frequency
  const issueFrequency: Record<string, number> = {};
  analyses.forEach(a => {
    a.issues.forEach(issue => {
      issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
    });
  });

  // Sort issues by frequency
  const sortedIssues = Object.entries(issueFrequency)
    .sort(([, a], [, b]) => b - a);

  // Category distribution
  const categoryDist: Record<string, number> = {};
  spirits.forEach(s => {
    const cat = s.category || 'MISSING';
    categoryDist[cat] = (categoryDist[cat] || 0) + 1;
  });

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    stats,
    issueFrequency: Object.fromEntries(sortedIssues),
    categoryDistribution: categoryDist,
    badEntries: bad.slice(0, 50), // First 50 bad entries
    reviewEntries: review.slice(0, 50), // First 50 review entries
    goodExamples: good.slice(0, 10), // 10 good examples
  };

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'audit-report-500-spirits.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);

  // Save bad entries for cleanup
  const badEntriesPath = path.join(process.cwd(), 'bad-entries-to-clean.json');
  writeFileSync(badEntriesPath, JSON.stringify(bad, null, 2));
  console.log(`Bad entries saved to: ${badEntriesPath}`);

  // Print summary
  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Total Spirits Analyzed: ${stats.total}`);
  console.log(`Good Quality: ${stats.good} (${stats.percentageGood}%)`);
  console.log(`Bad Quality: ${stats.bad} (${stats.percentageBad}%)`);
  console.log(`Needs Review: ${stats.needsReview} (${stats.percentageReview}%)`);
  
  console.log('\n=== TOP ISSUES ===');
  sortedIssues.slice(0, 10).forEach(([issue, count]) => {
    console.log(`- ${issue}: ${count} occurrences`);
  });

  console.log('\n=== CATEGORY DISTRIBUTION ===');
  Object.entries(categoryDist)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cat, count]) => {
      console.log(`- ${cat}: ${count}`);
    });
}

main().catch(console.error);