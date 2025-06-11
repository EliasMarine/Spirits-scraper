# Integration Guide: Optimized Scraper

## Option 1: Add New Command (Recommended)

Add a new `--optimized` flag to use the efficient scraper:

```bash
# Use optimized scraper
npm run scrape -- --categories bourbon --limit 50 --optimized

# Use with distillery mode
npm run scrape -- --distillery buffalo-trace --optimized
```

### Changes needed in `src/cli.ts`:

1. Add import at the top:
```typescript
import { optimizedCatalogScraper } from './services/optimized-catalog-scraper.js';
```

2. Add new option to scrape command (around line 920):
```typescript
.option('--optimized', 'Use optimized high-efficiency scraper')
```

3. Add condition in scrape command handler (around line 1050):
```typescript
// Check if using optimized mode
if (options.optimized) {
  spinner.text = 'Starting OPTIMIZED high-efficiency scraping...';
  
  if (options.distillery) {
    // Scrape specific distillery with optimized method
    const distilleryNames = options.distillery.split(',').map(d => d.trim());
    
    for (const distilleryName of distilleryNames) {
      const distillery = ALL_DISTILLERIES.find(d => 
        d.name.toLowerCase() === distilleryName.toLowerCase()
      );
      
      if (distillery) {
        const result = await optimizedCatalogScraper.scrapeDistilleryOptimized(
          distillery,
          options.limit || 10
        );
        
        console.log(`\n✅ ${distillery.name}: ${result.spiritsFound} spirits found`);
        console.log(`   Efficiency: ${(result.efficiency * 100).toFixed(1)}%`);
      }
    }
  } else {
    // Category-based scraping with optimized method
    console.log('🚧 Category-based optimized scraping not yet implemented');
    console.log('Use --distillery mode for now');
  }
  
  spinner.succeed('Optimized scraping complete!');
  return;
}

// Continue with existing scraper...
```

## Option 2: Replace Existing Scraper (More Aggressive)

Replace the catalog-focused-scraper entirely:

1. In `src/services/catalog-focused-scraper.ts`, replace the `generateCatalogQueries` method:
```typescript
import { EfficientCatalogQueryGenerator } from './efficient-catalog-query-generator.js';

private generateCatalogQueries(distillery: Distillery): string[] {
  // Use new efficient query generator
  return EfficientCatalogQueryGenerator.generateTopCatalogQueries(
    distillery.type?.[0] || 'whiskey',
    20
  );
}
```

## Option 3: Create Standalone Script (Safest)

Create a new file `src/scrape-optimized.ts`:

```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { optimizedCatalogScraper } from './services/optimized-catalog-scraper.js';
import { ALL_DISTILLERIES } from './config/distilleries.js';
import { logger } from './utils/logger.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('scrape-optimized')
  .description('High-efficiency spirit scraper (60%+ efficiency)')
  .version('1.0.0');

program
  .command('distillery <name>')
  .description('Scrape a specific distillery efficiently')
  .option('-l, --limit <number>', 'API call limit', '10')
  .action(async (name, options) => {
    const distillery = ALL_DISTILLERIES.find(d => 
      d.name.toLowerCase().includes(name.toLowerCase())
    );
    
    if (!distillery) {
      console.error(chalk.red(`Distillery "${name}" not found`));
      process.exit(1);
    }
    
    console.log(chalk.cyan(`\n🚀 Optimized scraping for ${distillery.name}\n`));
    
    const result = await optimizedCatalogScraper.scrapeDistilleryOptimized(
      distillery,
      parseInt(options.limit)
    );
    
    if (result.efficiency >= 0.6) {
      console.log(chalk.green('\n✅ Target efficiency achieved!'));
    }
  });

program.parse(process.argv);
```

Then run:
```bash
npx tsx src/scrape-optimized.ts distillery buffalo-trace --limit 10
```

## Current Commands (Unchanged)

The existing commands still use the old inefficient scraper:
```bash
# These still use the OLD scraper
npm run scrape -- --categories bourbon --limit 50
npm run scrape -- --distillery buffalo-trace
```

## Recommendation

Start with **Option 1** - add the `--optimized` flag. This lets you:
- Test the new scraper safely
- Compare results with the old scraper
- Gradually migrate once you're confident

Once tested, you can make it the default by removing the flag check.