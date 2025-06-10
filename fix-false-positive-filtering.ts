// Script to fix false positive filtering issues

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🔧 Fixing false positive filtering issues...\n');

// 1. Fix non-product-filters.ts - tours pattern is too broad
const nonProductFiltersPath = join(process.cwd(), 'src/config/non-product-filters.ts');
let nonProductContent = readFileSync(nonProductFiltersPath, 'utf-8');

// Update tours patterns to be more specific
const oldToursPatterns = `    tours: [
      /\\b(tour|tours|touring|visit|visits|visiting)\\b/i,
      /\\b(experience|experiences|tasting room|visitor center)\\b/i,
      /\\b(distillery tour|brewery tour|winery tour)\\b/i,
      /\\b(book a tour|schedule a visit|plan your visit)\\b/i,
      /\\b(guided tour|self-guided|walking tour)\\b/i,
      /\\b(kentucky distillery & bourbon tours)\\b/i,
      /\\b(whiskey trail home|bourbon trail)\\b/i,
    ],`;

const newToursPatterns = `    tours: [
      /\\b(distillery|brewery|winery)\\s+(tour|tours|visit|experience)\\b/i,
      /\\b(book\\s+a\\s+tour|schedule\\s+a\\s+visit|plan\\s+your\\s+visit)\\b/i,
      /\\b(guided\\s+tour|self\\-guided\\s+tour|walking\\s+tour)\\b/i,
      /\\b(tasting\\s+room|visitor\\s+center)\\s+(hours|open|visit)\\b/i,
      /\\b(kentucky\\s+distillery\\s+&\\s+bourbon\\s+tours)\\b/i,
      /\\b(whiskey\\s+trail\\s+home|bourbon\\s+trail)\\b/i,
      // Avoid matching product names with "Reserve"
      /(?<!reserve\\s)(?<!\\w)tour(?:s)?(?!\\w)/i,
    ],`;

nonProductContent = nonProductContent.replace(oldToursPatterns, newToursPatterns);

// Update food patterns to be more specific
const oldFoodPatterns = `    food: [
      /\\b(food|foods|meal|meals|dish|dishes)\\b/i,
      /\\b(restaurant|dining|kitchen|menu)\\b/i,
      /\\b(pie|cake|dessert|appetizer|entree)\\b/i,
      /\\b(chocolate pecan pie|bourbon sauce)\\b/i,
      /\\b(pairing|pairs well with|accompaniment)\\b/i,
      /\\b(recipe|cooking|baking|ingredients)\\b/i,
    ],`;

const newFoodPatterns = `    food: [
      /\\b(food|foods|meal|meals|dish|dishes)(?!\\s*\\d+\\s*year)/i,
      /\\b(restaurant|dining|kitchen)\\s+(menu|service|hours)\\b/i,
      /\\b(pie|cake|dessert|appetizer|entree)\\b/i,
      /\\b(chocolate\\s+pecan\\s+pie|bourbon\\s+sauce)\\b/i,
      /\\b(recipe|cooking|baking)\\s+(with|for|instructions)\\b/i,
      // Avoid matching spirits with food-like names
      /(?<!wild\\s)(?<!\\w)turkey(?!\\s+\\d+|\\s+rare|\\s+101)(?:\\s+dinner|\\s+sandwich)?/i,
    ],`;

nonProductContent = nonProductContent.replace(oldFoodPatterns, newFoodPatterns);

// Update cocktails patterns to avoid matching product names
const oldCocktailsPatterns = `    cocktails: [
      /\\b(cocktail|cocktails|mixed drink|mixer)\\b/i,
      /\\b(recipe|recipes|ingredients|garnish)\\b/i,
      /\\b(martini|margarita|manhattan|old fashioned)\\b/i,
      /\\b(bourbon sour|whiskey sour|mint julep)\\b/i,
      /\\b(shake|stir|muddle|strain)\\b/i,
      /\\b(simple syrup|bitters|vermouth)\\b/i,
    ],`;

const newCocktailsPatterns = `    cocktails: [
      /\\b(cocktail|cocktails|mixed\\s+drink|mixer)\\s+(recipe|menu|list)\\b/i,
      /\\b(how\\s+to\\s+make|recipe\\s+for|ingredients\\s+for)\\s+\\w+\\s+(cocktail|drink)\\b/i,
      /\\b(martini|margarita|manhattan|old\\s+fashioned)\\s+(recipe|ingredients)\\b/i,
      /\\b(bourbon\\s+sour|whiskey\\s+sour|mint\\s+julep)\\s+(recipe|how\\s+to)\\b/i,
      /\\b(shake|stir|muddle|strain)\\s+(well|until|gently)\\b/i,
      /\\b(simple\\s+syrup|bitters|vermouth)\\s+(recipe|to\\s+taste)\\b/i,
      // Don't match product names that happen to contain cocktail words
      /(?<!piggy)back(?!\\s+\\d+|\\s+bourbon|\\s+rye|\\s+whiskey)/i,
    ],`;

nonProductContent = nonProductContent.replace(oldCocktailsPatterns, newCocktailsPatterns);

// Update merchandise patterns to be less aggressive
const oldMerchandisePatterns = `    merchandise: [
      /\\b(shirt|polo|t-shirt|tee|jacket|hoodie|sweatshirt|sweater)\\b/i,
      /\\b(hat|cap|beanie|snapback|trucker)\\b/i,
      /\\b(men's|women's|mens|womens|unisex)\\b/i,
      /\\b(clothing|apparel|merchandise|merch|gear|wear)\\b/i,
      /\\b(small|medium|large|xl|xxl|xxxl|size)\\b/i,
      /\\b(glass|glasses|mug|cup|tumbler|flask|decanter|shaker|jigger)\\b/i,
      /\\b(glassware|barware|accessories|collectibles)\\b/i,
      /\\b(coaster|opener|key\\s*chain|sticker|patch|pin|badge)\\b/i,
      /\\b(barrel\\s+head|barrel\\s+stave|wood\\s+sign|wall\\s+art)\\b/i,
      /\\b(white|black|red|blue|green|navy|gray|grey)\\s+(polo|shirt|tee|top|jacket)\\b/i,
      /\\b(cotton|polyester|fabric|material|blend)\\b/i,
    ],`;

const newMerchandisePatterns = `    merchandise: [
      /\\b(t-?shirt|tee|polo\\s+shirt|hoodie|sweatshirt|sweater|apparel)\\b/i,
      /\\b(baseball\\s+cap|beanie|snapback|trucker\\s+hat)\\b/i,
      /\\b(men's|women's|mens|womens|unisex)\\s+(shirt|jacket|hoodie|apparel)\\b/i,
      /\\b(clothing|merchandise|merch)\\s+(store|shop|section|available)\\b/i,
      /\\b(size)\\s+(small|medium|large|x+l)\\b/i,
      /\\b(shot\\s+glass|beer\\s+mug|pint\\s+glass|wine\\s+glass)(?!\\s*\\d+ml)\\b/i,
      /\\b(glassware|barware)\\s+(set|collection|accessories)\\b/i,
      /\\b(coaster|bottle\\s+opener|key\\s*chain|sticker|patch|pin|badge)\\s+(with|featuring)\\b/i,
      /\\b(barrel\\s+head|barrel\\s+stave|wood\\s+sign|wall\\s+art)\\s+(decor|decoration)\\b/i,
      /\\b(white|black|red|blue|green|navy|gray|grey)\\s+(polo|shirt|tee|top|jacket)\\b/i,
      /\\b(cotton|polyester|fabric|material)\\s+(blend|content|made\\s+from)\\b/i,
      // Don't match spirit names that might contain these words
      /(?<!wild\\s+turkey\\s+rare\\s)breed(?!\\s+bourbon|\\s+rye|\\s+whiskey)/i,
    ],`;

nonProductContent = nonProductContent.replace(oldMerchandisePatterns, newMerchandisePatterns);

writeFileSync(nonProductFiltersPath, nonProductContent);
console.log('✅ Updated non-product-filters.ts with more specific patterns');

// 2. Fix spirit-extractor.ts to add context checking
const spiritExtractorPath = join(process.cwd(), 'src/services/spirit-extractor.ts');
let extractorContent = readFileSync(spiritExtractorPath, 'utf-8');

// Add a context check before rejecting products
const oldIsAlcoholicBeverage = `  private isAlcoholicBeverage(productName: string, description: string): boolean {
    const text = \`\${productName} \${description}\`;
    
    // CRITICAL: Check all non-product categories
    const nonProductCategories = ['merchandise', 'beer', 'tours', 'food', 'events', 'cocktails'] as const;
    
    for (const category of nonProductCategories) {
      if (containsNonProductPatterns(text, category)) {
        logger.warn(\`❌ Product rejected - contains \${category} patterns: "\${productName}"\`);
        return false;
      }
    }`;

const newIsAlcoholicBeverage = `  private isAlcoholicBeverage(productName: string, description: string): boolean {
    const text = \`\${productName} \${description}\`;
    
    // First check if it's clearly a spirit product
    const spiritIndicators = [
      /\\b\\d+\\s*year\\s*(old|aged)\\b/i,
      /\\b(bourbon|whiskey|whisky|scotch|rye|vodka|gin|rum|tequila|cognac)\\b/i,
      /\\b(single\\s+barrel|small\\s+batch|cask\\s+strength|barrel\\s+proof)\\b/i,
      /\\b(distillery|distilled|aged|matured)\\b/i,
      /\\b\\d{2,3}\\s*proof\\b/i,
      /\\b\\d+(\\.\\d+)?%\\s*(abv|alcohol)\\b/i,
    ];
    
    const hasStrongSpiritIndicators = spiritIndicators.filter(pattern => pattern.test(productName)).length >= 2;
    
    // CRITICAL: Check all non-product categories with context
    const nonProductCategories = ['merchandise', 'beer', 'tours', 'food', 'events', 'cocktails'] as const;
    
    for (const category of nonProductCategories) {
      if (containsNonProductPatterns(text, category)) {
        // If it has strong spirit indicators, it's probably a false positive
        if (hasStrongSpiritIndicators) {
          logger.info(\`✅ Product has strong spirit indicators despite \${category} pattern: "\${productName}"\`);
          continue;
        }
        
        // Additional context checks for specific categories
        if (category === 'tours' && /reserve|\\d+\\s*year/i.test(productName)) {
          continue; // Likely "Reserve" product, not a tour
        }
        
        if (category === 'food' && /wild\\s+turkey|\\d+\\s*year/i.test(productName)) {
          continue; // Likely Wild Turkey bourbon, not food
        }
        
        if (category === 'merchandise' && /rare\\s+breed|\\d+\\s*year/i.test(productName)) {
          continue; // Likely Rare Breed bourbon, not merchandise
        }
        
        if (category === 'cocktails' && /piggyback\\s+\\d+\\s*year/i.test(productName)) {
          continue; // Likely Piggyback bourbon, not a cocktail
        }
        
        logger.warn(\`❌ Product rejected - contains \${category} patterns: "\${productName}"\`);
        return false;
      }
    }`;

extractorContent = extractorContent.replace(oldIsAlcoholicBeverage, newIsAlcoholicBeverage);

writeFileSync(spiritExtractorPath, extractorContent);
console.log('✅ Updated spirit-extractor.ts with context-aware filtering');

// 3. Fix name parsing issues (spacing in "750 m L")
const textProcessorPath = join(process.cwd(), 'src/services/text-processor.ts');
if (textProcessorPath) {
  try {
    let textProcessorContent = readFileSync(textProcessorPath, 'utf-8');
    
    // Add fix for broken volume patterns
    const volumeFixPattern = `
    // Fix broken volume patterns
    cleaned = cleaned.replace(/\\b(\\d+)\\s+m\\s+L\\b/gi, '$1ml');
    cleaned = cleaned.replace(/\\b(\\d+)\\s+m\\s+l\\b/gi, '$1ml');
    cleaned = cleaned.replace(/\\b(\\d+\\.\\d+)\\s+L\\b/gi, '$1L');`;
    
    // Find a good place to insert it (after other cleaning operations)
    const insertAfter = 'cleaned = cleaned.replace(/\\s+/g, \' \').trim();';
    if (textProcessorContent.includes(insertAfter)) {
      textProcessorContent = textProcessorContent.replace(
        insertAfter,
        insertAfter + '\n' + volumeFixPattern
      );
      writeFileSync(textProcessorPath, textProcessorContent);
      console.log('✅ Added volume pattern fix to text-processor.ts');
    }
  } catch (error) {
    console.log('⚠️  Could not update text-processor.ts - may need manual fix');
  }
}

// 4. Add API limit check to prevent wasted calls
const cliPath = join(process.cwd(), 'src/cli.ts');
let cliContent = readFileSync(cliPath, 'utf-8');

// Find the scraping loop and add early exit on API limit
const apiLimitCheck = `
          // Check if we've hit API limit and should stop
          if (apiCallsUsed >= 100) {
            console.log('\\n⚠️  API limit reached (100 calls). Stopping scrape to prevent errors.');
            console.log(\`   Scraped \${spiritsFound.length} spirits before hitting limit.\`);
            break;
          }`;

// Insert after error handling in the main loop
const insertPoint = 'console.log(`(${i + 1}/${limit}) ❌ Error: ${error.message}`);';
if (cliContent.includes(insertPoint) && !cliContent.includes('API limit reached')) {
  cliContent = cliContent.replace(
    insertPoint,
    insertPoint + apiLimitCheck
  );
  writeFileSync(cliPath, cliContent);
  console.log('✅ Added API limit check to cli.ts');
}

console.log('\n✅ All fixes applied!');
console.log('\nChanges made:');
console.log('1. Made non-product patterns more specific to reduce false positives');
console.log('2. Added context checking - strong spirit indicators override weak patterns');
console.log('3. Fixed volume parsing for "750 m L" -> "750ml"');
console.log('4. Added early exit when API limit is reached');

console.log('\nTest the fixes with:');
console.log('npm run scrape -- --categories bourbon --limit 10');