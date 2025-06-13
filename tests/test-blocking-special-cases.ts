/**
 * Test Special Case Handlers in Blocking Deduplication Service
 * 
 * Tests the specialized logic for handling common duplication patterns:
 * - Size variants (8% of duplicates)
 * - Marketing text variations (6% of duplicates) 
 * - Year variants (4% of duplicates)
 * - Proof notation differences (4% of duplicates)
 * - Type mismatches (3% of duplicates)
 */

import { BlockingDeduplicationService } from './services/blocking-deduplication.js';
import { DatabaseSpirit } from './types/index.js';
import { logger } from './utils/logger.js';

// Test data for each special case pattern
const TEST_SPIRITS: DatabaseSpirit[] = [
  // Size variant test cases (8% of duplicates)
  {
    id: 1,
    name: "Jack Daniel's Old No. 7 Tennessee Whiskey 750ml",
    brand: "Jack Daniel's",
    type: "Tennessee Whiskey",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Jack Daniel's Old No. 7 Tennessee Whiskey 1L",
    brand: "Jack Daniel's", 
    type: "Tennessee Whiskey",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Jack Daniel's Old No. 7 Tennessee Whiskey 1.75L",
    brand: "Jack Daniel's",
    type: "Tennessee Whiskey", 
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Marketing text variation test cases (6% of duplicates)
  {
    id: 4,
    name: "Maker's Mark Small Batch Bourbon",
    brand: "Maker's Mark",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    name: "Maker's Mark Small-Batch Bourbon",
    brand: "Maker's Mark",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 6,
    name: "Elijah Craig Single Barrel Bourbon",
    brand: "Elijah Craig",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 7,
    name: "Elijah Craig Single-Barrel Bourbon",
    brand: "Elijah Craig",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Year variant test cases (4% of duplicates)
  {
    id: 8,
    name: "Blanton's Single Barrel Bourbon 2023",
    brand: "Blanton's",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 9,
    name: "Blanton's Single Barrel Bourbon 2024",
    brand: "Blanton's",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 10,
    name: "Four Roses Limited Edition 2022",
    brand: "Four Roses",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 11,
    name: "Four Roses Limited Edition 2023",
    brand: "Four Roses",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Proof notation test cases (4% of duplicates)
  {
    id: 12,
    name: "Wild Turkey 101 Proof Bourbon",
    brand: "Wild Turkey",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 13,
    name: "Wild Turkey 50.5% ABV Bourbon",
    brand: "Wild Turkey",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 14,
    name: "Booker's 120 Proof Bourbon",
    brand: "Booker's",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 15,
    name: "Booker's 60% ABV Bourbon",
    brand: "Booker's",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Type compatibility test cases (3% of duplicates)
  {
    id: 16,
    name: "Woodford Reserve Bourbon",
    brand: "Woodford Reserve",
    type: "Bourbon",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 17,
    name: "Woodford Reserve American Whiskey",
    brand: "Woodford Reserve",
    type: "American Whiskey",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 18,
    name: "Macallan 18",
    brand: "Macallan",
    type: "Single Malt Scotch",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 19,
    name: "Macallan 18",
    brand: "Macallan",
    type: "Scotch Whisky",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function testSpecialCaseHandlers(): Promise<void> {
  logger.info('=== Testing Special Case Handlers ===');
  
  const service = new BlockingDeduplicationService({
    enableSpecialCaseHandling: true,
    minBlockSize: 2,
    maxBlockSize: 100
  });

  // Create blocks with special case handling enabled
  const blocks = service.createBlocks(TEST_SPIRITS);
  
  logger.info(`Created ${blocks.size} total blocks`);

  // Test 1: Size Variant Blocks
  await testSizeVariantBlocks(blocks);
  
  // Test 2: Marketing Text Blocks
  await testMarketingTextBlocks(blocks);
  
  // Test 3: Year Variant Blocks
  await testYearVariantBlocks(blocks);
  
  // Test 4: Proof Notation Blocks
  await testProofNotationBlocks(blocks);
  
  // Test 5: Type Compatible Blocks
  await testTypeCompatibleBlocks(blocks);

  // Test 6: Overall effectiveness
  await testOverallEffectiveness(service, blocks);
}

async function testSizeVariantBlocks(blocks: Map<string, any>): Promise<void> {
  logger.info('\n--- Testing Size Variant Blocks ---');
  
  const sizeBlocks = Array.from(blocks.values()).filter(b => b.blockKey.type === 'sizeVariant');
  logger.info(`Found ${sizeBlocks.length} size variant blocks`);
  
  // Should group Jack Daniel's different sizes together
  const jackDanielsBlock = sizeBlocks.find(block => 
    block.spirits.some((s: any) => s.brand === "Jack Daniel's")
  );
  
  if (jackDanielsBlock) {
    logger.info(`✓ Jack Daniel's size variants grouped: ${jackDanielsBlock.spirits.length} spirits`);
    jackDanielsBlock.spirits.forEach((spirit: any) => {
      logger.info(`  - ${spirit.name}`);
    });
  } else {
    logger.error('✗ Jack Daniel\'s size variants not properly grouped');
  }
}

async function testMarketingTextBlocks(blocks: Map<string, any>): Promise<void> {
  logger.info('\n--- Testing Marketing Text Blocks ---');
  
  const marketingBlocks = Array.from(blocks.values()).filter(b => b.blockKey.type === 'marketingText');
  logger.info(`Found ${marketingBlocks.length} marketing text blocks`);
  
  // Should group "Small Batch" vs "Small-Batch"
  const makersMarkBlock = marketingBlocks.find(block =>
    block.spirits.some((s: any) => s.brand === "Maker's Mark")
  );
  
  if (makersMarkBlock) {
    logger.info(`✓ Maker's Mark marketing variants grouped: ${makersMarkBlock.spirits.length} spirits`);
    makersMarkBlock.spirits.forEach((spirit: any) => {
      logger.info(`  - ${spirit.name}`);
    });
  } else {
    logger.error('✗ Maker\'s Mark marketing variants not properly grouped');
  }
  
  // Should group "Single Barrel" vs "Single-Barrel"
  const elijahCraigBlock = marketingBlocks.find(block =>
    block.spirits.some((s: any) => s.brand === "Elijah Craig")
  );
  
  if (elijahCraigBlock) {
    logger.info(`✓ Elijah Craig marketing variants grouped: ${elijahCraigBlock.spirits.length} spirits`);
    elijahCraigBlock.spirits.forEach((spirit: any) => {
      logger.info(`  - ${spirit.name}`);
    });
  } else {
    logger.error('✗ Elijah Craig marketing variants not properly grouped');
  }
}

async function testYearVariantBlocks(blocks: Map<string, any>): Promise<void> {
  logger.info('\n--- Testing Year Variant Blocks ---');
  
  const yearBlocks = Array.from(blocks.values()).filter(b => b.blockKey.type === 'yearVariant');
  logger.info(`Found ${yearBlocks.length} year variant blocks`);
  
  // Should group Blanton's 2023 and 2024
  const blantonsBlock = yearBlocks.find(block =>
    block.spirits.some((s: any) => s.brand === "Blanton's")
  );
  
  if (blantonsBlock) {
    logger.info(`✓ Blanton's year variants grouped: ${blantonsBlock.spirits.length} spirits`);
    blantonsBlock.spirits.forEach((spirit: any) => {
      logger.info(`  - ${spirit.name}`);
    });
  } else {
    logger.error('✗ Blanton\'s year variants not properly grouped');
  }
  
  // Should group Four Roses 2022 and 2023
  const fourRosesBlock = yearBlocks.find(block =>
    block.spirits.some((s: any) => s.brand === "Four Roses")
  );
  
  if (fourRosesBlock) {
    logger.info(`✓ Four Roses year variants grouped: ${fourRosesBlock.spirits.length} spirits`);
    fourRosesBlock.spirits.forEach((spirit: any) => {
      logger.info(`  - ${spirit.name}`);
    });
  } else {
    logger.error('✗ Four Roses year variants not properly grouped');
  }
}

async function testProofNotationBlocks(blocks: Map<string, any>): Promise<void> {
  logger.info('\n--- Testing Proof Notation Blocks ---');
  
  const proofBlocks = Array.from(blocks.values()).filter(b => b.blockKey.type === 'proofNotation');
  logger.info(`Found ${proofBlocks.length} proof notation blocks`);
  
  // Should group Wild Turkey 101 proof vs 50.5% ABV
  const wildTurkeyBlock = proofBlocks.find(block =>
    block.spirits.some((s: any) => s.brand === "Wild Turkey")
  );
  
  if (wildTurkeyBlock) {
    logger.info(`✓ Wild Turkey proof variants grouped: ${wildTurkeyBlock.spirits.length} spirits`);
    wildTurkeyBlock.spirits.forEach((spirit: any) => {
      logger.info(`  - ${spirit.name}`);
    });
  } else {
    logger.error('✗ Wild Turkey proof variants not properly grouped');
  }
  
  // Should group Booker's 120 proof vs 60% ABV
  const bookersBlock = proofBlocks.find(block =>
    block.spirits.some((s: any) => s.brand === "Booker's")
  );
  
  if (bookersBlock) {
    logger.info(`✓ Booker's proof variants grouped: ${bookersBlock.spirits.length} spirits`);
    bookersBlock.spirits.forEach((spirit: any) => {
      logger.info(`  - ${spirit.name}`);
    });
  } else {
    logger.error('✗ Booker\'s proof variants not properly grouped');
  }
}

async function testTypeCompatibleBlocks(blocks: Map<string, any>): Promise<void> {
  logger.info('\n--- Testing Type Compatible Blocks ---');
  
  const typeBlocks = Array.from(blocks.values()).filter(b => b.blockKey.type === 'typeCompatible');
  logger.info(`Found ${typeBlocks.length} type compatible blocks`);
  
  // Should group Bourbon and American Whiskey
  const woodfordBlock = typeBlocks.find(block =>
    block.spirits.some((s: any) => s.brand === "Woodford Reserve")
  );
  
  if (woodfordBlock) {
    logger.info(`✓ Woodford Reserve type variants grouped: ${woodfordBlock.spirits.length} spirits`);
    woodfordBlock.spirits.forEach((spirit: any) => {
      logger.info(`  - ${spirit.name} (${spirit.type})`);
    });
  } else {
    logger.error('✗ Woodford Reserve type variants not properly grouped');
  }
  
  // Should group Scotch variants
  const macallanBlock = typeBlocks.find(block =>
    block.spirits.some((s: any) => s.brand === "Macallan")
  );
  
  if (macallanBlock) {
    logger.info(`✓ Macallan type variants grouped: ${macallanBlock.spirits.length} spirits`);
    macallanBlock.spirits.forEach((spirit: any) => {
      logger.info(`  - ${spirit.name} (${spirit.type})`);
    });
  } else {
    logger.error('✗ Macallan type variants not properly grouped');
  }
}

async function testOverallEffectiveness(service: any, blocks: Map<string, any>): Promise<void> {
  logger.info('\n--- Testing Overall Effectiveness ---');
  
  // Calculate comparison reduction
  const reductionStats = service.calculateReduction(TEST_SPIRITS.length, blocks);
  
  logger.info(`Comparison Reduction Analysis:`);
  logger.info(`  Without blocking: ${reductionStats.withoutBlocking} comparisons`);
  logger.info(`  With blocking: ${reductionStats.withBlocking} comparisons`);
  logger.info(`  Reduction: ${reductionStats.reduction} comparisons (${reductionStats.reductionPercentage.toFixed(1)}%)`);
  
  // Count special case blocks
  const specialCaseCounts = {
    sizeVariant: Array.from(blocks.values()).filter(b => b.blockKey.type === 'sizeVariant').length,
    marketingText: Array.from(blocks.values()).filter(b => b.blockKey.type === 'marketingText').length,
    yearVariant: Array.from(blocks.values()).filter(b => b.blockKey.type === 'yearVariant').length,
    proofNotation: Array.from(blocks.values()).filter(b => b.blockKey.type === 'proofNotation').length,
    typeCompatible: Array.from(blocks.values()).filter(b => b.blockKey.type === 'typeCompatible').length
  };
  
  logger.info(`Special Case Block Distribution:`);
  Object.entries(specialCaseCounts).forEach(([type, count]) => {
    logger.info(`  ${type}: ${count} blocks`);
  });
  
  // Test that each major pattern is handled
  const expectedPatterns = [
    { pattern: 'Size variants', minBlocks: 1, actualBlocks: specialCaseCounts.sizeVariant },
    { pattern: 'Marketing text', minBlocks: 1, actualBlocks: specialCaseCounts.marketingText },
    { pattern: 'Year variants', minBlocks: 1, actualBlocks: specialCaseCounts.yearVariant },
    { pattern: 'Proof notation', minBlocks: 1, actualBlocks: specialCaseCounts.proofNotation },
    { pattern: 'Type compatible', minBlocks: 1, actualBlocks: specialCaseCounts.typeCompatible }
  ];
  
  logger.info(`\nPattern Coverage Test:`);
  let allPatternsCovered = true;
  
  expectedPatterns.forEach(({ pattern, minBlocks, actualBlocks }) => {
    if (actualBlocks >= minBlocks) {
      logger.info(`  ✓ ${pattern}: ${actualBlocks} blocks (expected >= ${minBlocks})`);
    } else {
      logger.error(`  ✗ ${pattern}: ${actualBlocks} blocks (expected >= ${minBlocks})`);
      allPatternsCovered = false;
    }
  });
  
  if (allPatternsCovered) {
    logger.info('\n✓ All special case patterns are properly handled!');
  } else {
    logger.error('\n✗ Some special case patterns are missing coverage');
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  testSpecialCaseHandlers()
    .then(() => {
      logger.info('\n=== Special Case Handler Tests Complete ===');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Test failed:', error);
      process.exit(1);
    });
}

export { testSpecialCaseHandlers };