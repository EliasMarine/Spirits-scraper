import { QueryGenerator } from './query-generator';
import { PRIORITY_DOMAINS, getAllReputableDomains } from '../config/reputable-domains.js';
import { DISTILLERIES, getRandomDistilleries, Distillery } from '../config/distilleries.js';

export class EnhancedQueryGenerator extends QueryGenerator {
  /**
   * Get random elements from an array
   */
  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Shuffle an array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  /**
   * Generate comprehensive queries for 20k quota
   */
  generateComprehensiveQueries(): string[] {
    const queries: string[] = [];

    // 1. Major Spirit Categories with detailed breakdowns
    const detailedCategories = {
      whisky: [
        // Scotch regions
        'islay scotch whisky', 'speyside scotch whisky', 'highland scotch whisky',
        'lowland scotch whisky', 'campbeltown scotch whisky', 'island scotch whisky',
        
        // Scotch types
        'single malt scotch', 'blended scotch whisky', 'single grain scotch',
        'blended malt scotch', 'cask strength scotch', 'peated scotch whisky',
        
        // American whiskey
        'kentucky bourbon', 'tennessee whiskey', 'rye whiskey', 'wheat whiskey',
        'bottled in bond bourbon', 'single barrel bourbon', 'small batch bourbon',
        'cask strength bourbon', 'barrel proof bourbon', 'wheated bourbon',
        
        // Other whisky
        'irish whiskey', 'japanese whisky', 'canadian whisky', 'indian whisky',
        'taiwanese whisky', 'australian whisky', 'welsh whisky', 'english whisky',
      ],
      
      rum: [
        'white rum', 'gold rum', 'dark rum', 'spiced rum', 'aged rum',
        'caribbean rum', 'jamaican rum', 'barbados rum', 'cuban rum',
        'puerto rican rum', 'martinique rum', 'rhum agricole', 'cachaça',
        'demerara rum', 'navy strength rum', 'overproof rum', 'premium rum',
      ],
      
      gin: [
        'london dry gin', 'plymouth gin', 'old tom gin', 'genever gin',
        'contemporary gin', 'barrel aged gin', 'navy strength gin',
        'craft gin', 'botanical gin', 'pink gin', 'sloe gin',
      ],
      
      vodka: [
        'premium vodka', 'russian vodka', 'polish vodka', 'french vodka',
        'grain vodka', 'potato vodka', 'craft vodka', 'flavored vodka',
      ],
      
      tequila: [
        'blanco tequila', 'reposado tequila', 'añejo tequila', 'extra añejo tequila',
        'cristalino tequila', 'highland tequila', 'lowland tequila', '100% agave tequila',
        'mezcal', 'raicilla', 'sotol', 'bacanora',
      ],
      
      brandy: [
        'cognac', 'armagnac', 'spanish brandy', 'american brandy',
        'calvados', 'pisco', 'grappa', 'marc', 'eau de vie',
        'fruit brandy', 'apple brandy', 'pear brandy',
      ],
    };

    // Add all detailed category queries
    Object.entries(detailedCategories).forEach(([category, subcategories]) => {
      subcategories.forEach(subcat => {
        queries.push(subcat);
        queries.push(`best ${subcat}`);
        queries.push(`premium ${subcat}`);
        queries.push(`${subcat} reviews`);
      });
    });

    // 2. Brand-specific queries (top 200 brands)
    const topBrands = [
      'Macallan', 'Glenfiddich', 'Glenlivet', 'Johnnie Walker', 'Jameson',
      'Jack Daniels', 'Jim Beam', 'Makers Mark', 'Wild Turkey', 'Buffalo Trace',
      'Pappy Van Winkle', 'Blanton', 'Eagle Rare', 'Weller', 'Stagg',
      'Ardbeg', 'Lagavulin', 'Laphroaig', 'Bowmore', 'Bruichladdich',
      'Highland Park', 'Talisker', 'Oban', 'Dalmore', 'Balvenie',
      'Glenfarclas', 'Aberlour', 'Glenmorangie', 'Springbank', 'Kilchoman',
      // ... add more brands
    ];

    topBrands.forEach(brand => {
      queries.push(`${brand} whisky`);
      queries.push(`${brand} limited edition`);
      queries.push(`${brand} rare bottles`);
      queries.push(`${brand} vintage`);
      queries.push(`${brand} special release`);
    });

    // 3. Price range queries
    const priceRanges = [
      'whisky under $50', 'whisky $50-$100', 'whisky $100-$200',
      'whisky $200-$500', 'whisky $500-$1000', 'whisky over $1000',
      'bourbon under $50', 'bourbon $50-$100', 'bourbon $100-$200',
      'scotch under $100', 'scotch $100-$300', 'scotch over $300',
    ];
    queries.push(...priceRanges);

    // 4. Age-specific queries
    const ages = [3, 5, 8, 10, 12, 15, 18, 21, 25, 30, 40, 50];
    ages.forEach(age => {
      queries.push(`${age} year old whisky`);
      queries.push(`${age} year old scotch`);
      queries.push(`${age} year old bourbon`);
    });

    // 5. Award winners and special editions
    const specialQueries = [
      'whisky of the year 2024', 'whisky of the year 2023',
      'best whisky awards', 'world whisky awards winners',
      'limited edition whisky 2024', 'special release whisky',
      'discontinued whisky', 'allocated bourbon list',
      'rare whisky auctions', 'collectible spirits',
    ];
    queries.push(...specialQueries);

    // 6. Regional specialties
    const regionalQueries = [
      // Japanese
      'nikka whisky', 'suntory whisky', 'hibiki whisky', 'yamazaki whisky',
      'hakushu whisky', 'chichibu whisky', 'japanese grain whisky',
      
      // Craft distilleries
      'craft distillery whisky', 'micro distillery bourbon',
      'small batch whisky', 'independent bottlings',
      
      // Store exclusives
      'costco whisky', 'total wine exclusive', 'specs exclusive',
      'binny\'s exclusive', 'k&l wines exclusive',
    ];
    queries.push(...regionalQueries);

    // 7. Seasonal and trending
    const currentYear = new Date().getFullYear();
    const trendingQueries = [
      `best whisky ${currentYear}`, `new whisky releases ${currentYear}`,
      `whisky trends ${currentYear}`, `upcoming whisky releases`,
      'whisky gift sets', 'whisky advent calendar',
      'father\'s day whisky', 'holiday whisky gifts',
    ];
    queries.push(...trendingQueries);

    // 8. Comparison queries
    const comparisonQueries = [
      'macallan vs glenfiddich', 'bourbon vs scotch',
      'jack daniels vs jim beam', 'irish vs scotch whisky',
      'single malt vs blended', 'cask strength vs regular',
    ];
    queries.push(...comparisonQueries);

    return queries;
  }

  /**
   * Generate queries optimized for finding rare and allocated bottles
   */
  generateRareBottleQueries(): string[] {
    const queries: string[] = [];

    // Allocated bourbons
    const allocatedBourbons = [
      'pappy van winkle 23', 'pappy van winkle 20', 'pappy van winkle 15',
      'old rip van winkle 10', 'van winkle special reserve 12',
      'george t stagg', 'william larue weller', 'thomas h handy',
      'sazerac 18', 'eagle rare 17', 'buffalo trace antique collection',
      'weller 12', 'weller full proof', 'weller single barrel',
      'blanton\'s gold', 'blanton\'s straight from barrel',
      'elmer t lee', 'rock hill farms', 'colonel eh taylor',
    ];

    allocatedBourbons.forEach(bourbon => {
      queries.push(bourbon);
      queries.push(`${bourbon} msrp`);
      queries.push(`${bourbon} retail price`);
      queries.push(`where to buy ${bourbon}`);
    });

    // Rare scotch
    const rareScotch = [
      'macallan 18', 'macallan 25', 'macallan 30', 'macallan lalique',
      'glenfiddich 30', 'glenfiddich 40', 'glenfiddich 50',
      'balvenie 30', 'balvenie portwood 21', 'balvenie tun 1509',
      'highland park 30', 'highland park 40', 'highland park 50',
      'springbank 21', 'springbank 25', 'springbank local barley',
    ];

    rareScotch.forEach(scotch => {
      queries.push(scotch);
      queries.push(`${scotch} price`);
      queries.push(`${scotch} availability`);
    });

    return queries;
  }

  /**
   * Generate location-based queries for major markets
   */
  generateLocationQueries(): string[] {
    const majorMarkets = [
      'new york', 'los angeles', 'chicago', 'houston', 'dallas',
      'san francisco', 'miami', 'atlanta', 'boston', 'seattle',
      'denver', 'portland', 'austin', 'nashville', 'las vegas',
    ];

    const queries: string[] = [];
    majorMarkets.forEach(city => {
      queries.push(`whisky stores ${city}`);
      queries.push(`bourbon selection ${city}`);
      queries.push(`rare spirits ${city}`);
      queries.push(`whisky bar ${city}`);
    });

    return queries;
  }

  /**
   * Generate all comprehensive queries (for 20k quota)
   */
  generateAll20kQueries(): string[] {
    return [
      ...this.generateComprehensiveQueries(),
      ...this.generateRareBottleQueries(),
      ...this.generateLocationQueries(),
      ...this.generateSiteSpecificQueries(),
      ...this.generateSeedQueries(), // Original queries
    ];
  }

  /**
   * Generate queries targeted at specific reputable retailer sites
   */
  generateSiteSpecificQueries(): string[] {
    const queries: string[] = [];
    const categories = ['bourbon', 'scotch', 'irish whiskey', 'japanese whisky', 'rye whiskey'];
    
    // Use priority domains for targeted searches
    PRIORITY_DOMAINS.forEach(domain => {
      categories.forEach(category => {
        queries.push(`site:${domain} ${category}`);
        queries.push(`site:${domain} ${category} new arrivals`);
        queries.push(`site:${domain} ${category} limited edition`);
      });
    });

    // Add specific product searches on top retailers
    const topRetailers = [
      'thewhiskyexchange.com',
      'masterofmalt.com',
      'totalwine.com',
      'wine.com',
      'klwines.com',
    ];

    const topBrands = [
      'Buffalo Trace', 'Pappy Van Winkle', 'Blanton',
      'Macallan', 'Glenfiddich', 'Ardbeg',
      'Redbreast', 'Nikka', 'Hibiki',
    ];

    topRetailers.forEach(site => {
      topBrands.forEach(brand => {
        queries.push(`site:${site} ${brand}`);
      });
    });

    return queries;
  }

  /**
   * Generate specific bourbon queries for comprehensive coverage
   */
  generateBourbonQueries(count: number = 1000): string[] {
    const queries: string[] = [];
    
    // Bourbon subcategories
    const subcategories = [
      'wheated bourbon', 'high rye bourbon', 'traditional bourbon',
      'bottled in bond', 'single barrel', 'small batch',
      'cask strength', 'barrel proof', 'finished bourbon'
    ];
    
    // Price descriptors
    const pricePoints = [
      'budget', 'value', 'mid-range', 'premium', 'luxury', 'ultra-premium'
    ];
    
    // Age statements
    const ages = ['4 year', '6 year', '7 year', '8 year', '10 year', '12 year', '15 year', '18 year', '20 year', '23 year'];
    
    // Flavor profiles
    const flavors = [
      'sweet bourbon', 'spicy bourbon', 'smooth bourbon',
      'complex bourbon', 'rich bourbon', 'mellow bourbon'
    ];
    
    // Generate combinations
    subcategories.forEach(sub => {
      pricePoints.forEach(price => {
        queries.push(`${price} ${sub} whiskey`);
      });
      ages.forEach(age => {
        queries.push(`${age} old ${sub}`);
      });
    });
    
    // Specific searches
    for (let i = 0; i < 200; i++) {
      queries.push(`bourbon whiskey catalog page ${i + 1}`);
      queries.push(`online bourbon store inventory page ${i + 1}`);
      queries.push(`bourbon collection list ${i + 1}`);
    }
    
    // Store-specific searches
    const stores = ['total wine', 'specs', 'bevmo', 'liquor barn', 'binny\'s'];
    stores.forEach(store => {
      for (let i = 0; i < 10; i++) {
        queries.push(`${store} bourbon selection page ${i + 1}`);
      }
    });
    
    return queries.slice(0, count);
  }

  /**
   * Generate category-specific discovery queries for focused scraping
   */
  generateCategoryDiscoveryQueries(category: string, count: number = 1000): string[] {
    const normalizedCategory = category.toLowerCase();
    const categoryConfig = this.getCategoryConfig(normalizedCategory);
    
    if (!categoryConfig) {
      // Fallback to general queries for unknown categories
      return this.generateGeneralCategoryQueries(category, count);
    }

    const queries: string[] = [];
    
    // CRITICAL: Priority retail sites for product-focused results
    const retailSites = [
      'totalwine.com',
      'thewhiskyexchange.com',
      'masterofmalt.com',
      'klwines.com',
      'wine.com',
      'caskers.com',
      'reservebar.com',
      'seelbachs.com',
      'flaviar.com',
      'drizly.com',
      'astorwines.com',
      'binnys.com',
      'specsonline.com',
      'bevmo.com',
      'ohlq.com',
      'gotoliquorstore.com',
      'nestorliquor.com',
      'woodencork.com',
      'whiskyshop.com',
      'finedrams.com',
      'whiskysites.co.uk',
      'instacart.com',
      'distiller.com',
      'saratogawine.com',
      'liquorama.net'
    ];
    
    // Shuffle brands and retailers for randomization
    const shuffledBrands = this.shuffleArray([...categoryConfig.brands]);
    const shuffledDescriptors = this.shuffleArray([...categoryConfig.descriptors]);
    const shuffledRetailers = this.shuffleArray([...retailSites]);
    
    // PRIORITY 1: Site-specific searches on retail sites (70% of queries)
    const retailerCount = Math.ceil(count * 0.7);
    let retailerQueriesAdded = 0;
    
    shuffledRetailers.forEach(site => {
      if (retailerQueriesAdded >= retailerCount) return;
      
      // Category-specific searches on retail sites
      queries.push(`site:${site} ${category} bottle 750ml`);
      queries.push(`site:${site} ${category} spirits collection`);
      retailerQueriesAdded += 2;
      
      // Brand-specific searches on retail sites
      const topBrands = this.getRandomElements(shuffledBrands, 5);
      topBrands.forEach(brand => {
        if (retailerQueriesAdded >= retailerCount) return;
        queries.push(`site:${site} ${brand} ${category} bottle`);
        queries.push(`site:${site} ${brand} ${category} 750ml price`);
        retailerQueriesAdded += 2;
      });
      
      // Descriptor searches on retail sites
      const topDescriptors = this.getRandomElements(shuffledDescriptors, 3);
      topDescriptors.forEach(desc => {
        if (retailerQueriesAdded >= retailerCount) return;
        queries.push(`site:${site} ${desc} ${category}`);
        retailerQueriesAdded++;
      });
    });
    
    // PRIORITY 2: Multi-site OR queries (20% of queries)
    const multiSiteCount = Math.ceil(count * 0.2);
    const siteGroups = [
      'site:totalwine.com OR site:wine.com OR site:drizly.com',
      'site:thewhiskyexchange.com OR site:masterofmalt.com',
      'site:klwines.com OR site:astorwines.com OR site:seelbachs.com',
      'site:caskers.com OR site:reservebar.com OR site:flaviar.com'
    ];
    
    shuffledBrands.slice(0, multiSiteCount / 2).forEach((brand, idx) => {
      const siteGroup = siteGroups[idx % siteGroups.length];
      queries.push(`(${siteGroup}) ${brand} ${category}`);
      queries.push(`(${siteGroup}) ${brand} ${category} bottle 750ml`);
    });
    
    // PRIORITY 3: Brand-specific queries with retail focus (remaining 30%)
    shuffledBrands.forEach(brand => {
      const variations = [
        `${brand} ${category} bottle buy online`,
        `${brand} ${category} 750ml price`,
        `${brand} ${category} where to buy online`,
        `${brand} ${category} in stock`,
        `${brand} ${category} shop online`
      ];
      // Randomly select 2-3 variations per brand
      const selectedVariations = this.getRandomElements(variations, Math.floor(Math.random() * 2) + 2);
      queries.push(...selectedVariations);
    });

    // Descriptor combinations with randomization
    shuffledDescriptors.forEach(desc => {
      const baseQueries = [
        `${desc} ${category}`,
        `best ${desc} ${category}`,
        `premium ${desc} ${category}`,
        `top rated ${desc} ${category}`,
        `${desc} ${category} guide`,
        `${desc} ${category} comparison`
      ];
      queries.push(...this.getRandomElements(baseQueries, 3));
      
      // Random brand combinations
      const randomBrands = this.getRandomElements(shuffledBrands, 3);
      randomBrands.forEach(brand => {
        queries.push(`${brand} ${desc} ${category}`);
      });
    });

    // Age statements with temporal variations (for aged spirits)
    if (categoryConfig.ageStatements) {
      const shuffledAges = this.shuffleArray([...categoryConfig.ageStatements]);
      shuffledAges.forEach(age => {
        const ageVariations = [
          `${age} ${category}`,
          `${age} old ${category}`,
          `${category} aged ${age}`,
          `${age} ${category} review`,
          `best ${age} ${category}`,
          `${age} ${category} tasting`
        ];
        queries.push(...this.getRandomElements(ageVariations, 3));
        
        // Random brand combinations with ages
        const randomBrands = this.getRandomElements(shuffledBrands, 2);
        randomBrands.forEach(brand => {
          queries.push(`${brand} ${age} ${category}`);
        });
      });
    }

    // Regional queries with discovery focus
    if (categoryConfig.regions) {
      const shuffledRegions = this.shuffleArray([...categoryConfig.regions]);
      shuffledRegions.forEach(region => {
        const regionVariations = [
          `${region} ${category}`,
          `${category} from ${region}`,
          `${region} ${category} distilleries`,
          `${region} ${category} producers`,
          `${category} made in ${region}`,
          `${region} craft ${category}`,
          `${region} ${category} brands`
        ];
        queries.push(...this.getRandomElements(regionVariations, 4));
      });
    }

    // Temporal and seasonal queries
    const currentYear = new Date().getFullYear();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const seasons = ['spring', 'summer', 'fall', 'winter', 'holiday'];
    
    // Recent releases and trends
    const timeVariations = [
      `${category} releases ${currentYear}`,
      `new ${category} ${currentYear}`,
      `best ${category} ${currentYear}`,
      `${category} trends ${currentYear}`,
      `upcoming ${category} releases`,
      `${category} releases ${currentYear - 1}`,
      `limited edition ${category} ${currentYear}`,
      `award winning ${category} ${currentYear}`
    ];
    queries.push(...timeVariations);
    
    // Seasonal queries
    const randomSeasons = this.getRandomElements(seasons, 3);
    randomSeasons.forEach(season => {
      queries.push(`${season} ${category} releases`);
      queries.push(`${category} for ${season}`);
    });

    // Niche and discovery-focused queries
    const nicheQueries = [
      `rare ${category} bottles`,
      `discontinued ${category}`,
      `${category} collector items`,
      `vintage ${category} collection`,
      `${category} auction results`,
      `investment grade ${category}`,
      `${category} secondary market`,
      `${category} bottle hunting`,
      `allocated ${category} list`,
      `${category} distillery tours`,
      `craft ${category} makers`,
      `independent ${category} bottlers`,
      `${category} barrel picks`,
      `${category} store picks`,
      `single barrel ${category} releases`,
      `${category} distillery exclusives`,
      `${category} club releases`,
      `${category} society bottlings`
    ];
    queries.push(...this.getRandomElements(nicheQueries, 15));

    // Price point queries with specificity
    const priceRanges = [
      'under $30', '$30-50', '$50-100', '$100-200', '$200-500', 'over $500',
      'budget friendly', 'mid-range', 'premium', 'luxury', 'ultra-premium'
    ];
    priceRanges.forEach(price => {
      queries.push(`${category} ${price}`);
      queries.push(`best ${category} ${price}`);
    });

    // CRITICAL: All remaining queries should have site restrictions
    // Never do open-ended searches that allow Reddit/blogs
    
    // Shuffle final queries and return requested count
    const shuffledQueries = this.shuffleArray(queries);
    return shuffledQueries.slice(0, count);
  }

  /**
   * Utility method to shuffle an array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Utility method to get random elements from an array
   */
  private getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  private getCategoryConfig(category: string) {
    const configs = {
      bourbon: {
        brands: ['Buffalo Trace', 'Maker\'s Mark', 'Wild Turkey', 'Four Roses', 'Woodford Reserve', 'Elijah Craig', 'Knob Creek', 'Bulleit', 'Jim Beam', 'Heaven Hill', 'Old Forester', 'Eagle Rare', 'Blanton\'s', 'Pappy Van Winkle', 'Weller', 'George T. Stagg', 'Booker\'s', 'Basil Hayden', 'Angel\'s Envy', 'Michter\'s'],
        descriptors: ['wheated', 'high rye', 'single barrel', 'small batch', 'cask strength', 'barrel proof', 'bottled in bond', 'finished', 'reserve', 'special release'],
        ageStatements: ['4 year', '6 year', '7 year', '8 year', '10 year', '12 year', '15 year', '18 year', '20 year', '23 year'],
        regions: ['Kentucky', 'Tennessee', 'Indiana', 'Texas', 'Colorado']
      },
      scotch: {
        brands: ['Glenfiddich', 'The Macallan', 'The Glenlivet', 'Balvenie', 'GlenDronach', 'Laphroaig', 'Lagavulin', 'Ardbeg', 'Glenmorangie', 'Dalwhinnie', 'Highland Park', 'Springbank', 'Bruichladdich', 'Bunnahabhain'],
        descriptors: ['single malt', 'blended', 'peated', 'sherried', 'port finished', 'wine finished', 'cask strength', 'natural color'],
        ageStatements: ['10 year', '12 year', '15 year', '18 year', '21 year', '25 year', '30 year'],
        regions: ['Islay', 'Speyside', 'Highland', 'Lowland', 'Campbeltown', 'Islands']
      },
      irish: {
        brands: ['Jameson', 'Bushmills', 'Redbreast', 'Green Spot', 'Powers', 'Teeling', 'Connemara', 'Tullamore D.E.W.', 'Midleton', 'Yellow Spot'],
        descriptors: ['single pot still', 'single malt', 'blended', 'single grain', 'cask strength', 'finished'],
        ageStatements: ['10 year', '12 year', '15 year', '18 year', '21 year'],
        regions: ['Dublin', 'Cork', 'Antrim', 'Donegal']
      },
      vodka: {
        brands: ['Grey Goose', 'Belvedere', 'Absolut', 'Tito\'s', 'Ketel One', 'Chopin', 'Żubrówka', 'Russian Standard', 'Smirnoff', 'Stolichnaya'],
        descriptors: ['premium', 'craft', 'potato', 'grain', 'wheat', 'rye', 'filtered'],
        regions: ['Russia', 'Poland', 'France', 'Sweden', 'Texas']
      },
      gin: {
        brands: ['Tanqueray', 'Hendrick\'s', 'Bombay', 'Beefeater', 'The Botanist', 'Monkey 47', 'Plymouth', 'Aviation', 'Roku', 'Botanist'],
        descriptors: ['London Dry', 'contemporary', 'barrel aged', 'navy strength', 'botanical', 'craft'],
        regions: ['London', 'Plymouth', 'Scotland', 'Germany', 'Japan']
      },
      rum: {
        brands: ['Bacardi', 'Captain Morgan', 'Mount Gay', 'Appleton Estate', 'Flor de Caña', 'Diplomatico', 'Ron Zacapa', 'El Dorado', 'Plantation', 'Foursquare'],
        descriptors: ['white', 'gold', 'dark', 'spiced', 'aged', 'overproof', 'navy strength'],
        ageStatements: ['8 year', '12 year', '15 year', '18 year', '21 year', '23 year'],
        regions: ['Jamaica', 'Barbados', 'Cuba', 'Puerto Rico', 'Martinique', 'Guyana']
      }
    };

    return configs[category as keyof typeof configs];
  }

  private generateGeneralCategoryQueries(category: string, count: number): string[] {
    const queries: string[] = [];
    
    // Basic category queries
    queries.push(`${category} brands`);
    queries.push(`best ${category}`);
    queries.push(`premium ${category}`);
    queries.push(`${category} collection`);
    queries.push(`${category} catalog`);
    
    // Expand with variations
    for (let i = 0; i < count / 5; i++) {
      queries.push(`${category} page ${i + 1}`);
      queries.push(`${category} list ${i + 1}`);
      queries.push(`buy ${category} online ${i + 1}`);
      queries.push(`${category} store ${i + 1}`);
      queries.push(`${category} selection ${i + 1}`);
    }
    
    return queries.slice(0, count);
  }

  /**
   * Generate distillery-focused queries for discovering new releases and special editions
   */
  generateDistilleryQueries(limit: number = 100): string[] {
    const queries: string[] = [];
    
    // Get random distilleries to ensure variety
    const selectedDistilleries = getRandomDistilleries(Math.min(limit, DISTILLERIES.length));
    
    // Query templates for distilleries
    const queryTemplates = [
      (d: Distillery) => `${d.name} new releases 2024`,
      (d: Distillery) => `${d.name} limited edition`,
      (d: Distillery) => `${d.name} special release`,
      (d: Distillery) => `${d.name} ${d.type[0]} collection`,
      (d: Distillery) => `${d.name} distillery exclusive`,
      (d: Distillery) => `${d.name} single barrel`,
      (d: Distillery) => `${d.name} cask strength`,
      (d: Distillery) => `${d.name} vintage releases`,
      (d: Distillery) => `${d.name} rare bottles`,
      (d: Distillery) => `${d.name} master collection`,
      (d: Distillery) => `${d.name} distiller's edition`,
      (d: Distillery) => `${d.name} experimental series`,
      (d: Distillery) => `${d.name} barrel select`,
      (d: Distillery) => `${d.name} anniversary edition`,
      (d: Distillery) => `${d.name} discontinued bottles`
    ];
    
    // Time-based templates
    const currentYear = new Date().getFullYear();
    const timeTemplates = [
      (d: Distillery) => `${d.name} releases ${currentYear}`,
      (d: Distillery) => `${d.name} new ${currentYear - 1}`,
      (d: Distillery) => `${d.name} upcoming releases`,
      (d: Distillery) => `${d.name} latest bottlings`
    ];
    
    // Special interest templates
    const specialTemplates = [
      (d: Distillery) => `${d.name} travel retail exclusive`,
      (d: Distillery) => `${d.name} duty free collection`,
      (d: Distillery) => `${d.name} gift sets`,
      (d: Distillery) => `${d.name} miniatures collection`,
      (d: Distillery) => `${d.name} tasting set`
    ];
    
    // Combine all templates
    const allTemplates = [...queryTemplates, ...timeTemplates, ...specialTemplates];
    
    // Generate queries ensuring even distribution across distilleries
    let templateIndex = 0;
    let distilleryIndex = 0;
    
    while (queries.length < limit) {
      const distillery = selectedDistilleries[distilleryIndex % selectedDistilleries.length];
      const template = allTemplates[templateIndex % allTemplates.length];
      
      // Generate query using the template
      queries.push(template(distillery));
      
      // Also add variations using distillery variations
      if (distillery.variations.length > 0 && queries.length < limit) {
        const variation = distillery.variations[0];
        const variationQuery = template({ ...distillery, name: variation });
        if (variationQuery !== queries[queries.length - 1]) {
          queries.push(variationQuery);
        }
      }
      
      // Increment indices
      templateIndex++;
      if (templateIndex % allTemplates.length === 0) {
        distilleryIndex++;
      }
    }
    
    // Add some region-specific distillery queries
    const regionQueries = [
      'kentucky bourbon distilleries new releases',
      'speyside scotch distillery exclusives',
      'islay distillery limited editions',
      'japanese whisky distillery releases 2024',
      'irish distillery special bottlings',
      'american craft distillery collection',
      'texas bourbon distillery releases',
      'tasmanian whisky distillery exclusives'
    ];
    
    // Mix in region queries if we have room
    const finalQueries = [...queries.slice(0, limit - regionQueries.length), ...regionQueries];
    
    // Shuffle for variety
    return this.shuffleArray(finalQueries).slice(0, limit);
  }

  /**
   * Generate smart queries for a category with enhanced patterns
   * CRITICAL: Force retail site results to avoid Reddit/blog contamination
   */
  generateSmartQueries(category: string, limit: number = 50): string[] {
    // For high limits, use diverse strategies to avoid cache collisions
    if (limit > 50) {
      return this.generateHighDiversityQueries(category, limit);
    }
    
    const queries: string[] = [];
    
    // PRIORITY RETAIL SITES - these have actual products, not discussions
    const priorityRetailers = [
      'totalwine.com',
      'thewhiskyexchange.com',
      'masterofmalt.com',
      'wine.com',
      'klwines.com',
      'caskers.com',
      'reservebar.com',
      'seelbachs.com',
      'drizly.com',
      'flaviar.com'
    ];
    
    // Generate site-specific queries first (70% of limit)
    const siteQueryCount = Math.ceil(limit * 0.7);
    let addedQueries = 0;
    
    // Rotate through retailers for category searches
    priorityRetailers.forEach((site, index) => {
      if (addedQueries >= siteQueryCount) return;
      
      // Basic category search on retailer
      queries.push(`site:${site} ${category} spirits bottle 750ml`);
      addedQueries++;
      
      // Category with descriptors
      if (category.toLowerCase() === 'bourbon' && addedQueries < siteQueryCount) {
        queries.push(`site:${site} kentucky straight bourbon whiskey`);
        queries.push(`site:${site} small batch bourbon 750ml`);
        queries.push(`site:${site} single barrel bourbon bottle`);
        addedQueries += 3;
      } else if (category.toLowerCase() === 'scotch' && addedQueries < siteQueryCount) {
        queries.push(`site:${site} single malt scotch whisky`);
        queries.push(`site:${site} highland scotch 750ml`);
        queries.push(`site:${site} speyside scotch bottle`);
        addedQueries += 3;
      }
    });
    
    // Multi-site OR queries (20% of limit)
    const multiSiteCount = Math.ceil(limit * 0.2);
    const siteGroups = [
      '(site:totalwine.com OR site:wine.com OR site:drizly.com)',
      '(site:thewhiskyexchange.com OR site:masterofmalt.com)',
      '(site:klwines.com OR site:caskers.com OR site:reservebar.com)'
    ];
    
    const smartPatterns: Record<string, string[]> = {
      bourbon: [
        'Kentucky Straight Bourbon Whiskey',
        'Small Batch Bourbon',
        'Single Barrel Bourbon',
        'Bottled in Bond Bourbon',
        'Wheated Bourbon',
        'High Rye Bourbon',
        'Barrel Proof Bourbon',
        'Cask Strength Bourbon',
        'Tennessee Bourbon',
        'Craft Bourbon Whiskey',
        'Limited Edition Bourbon',
        'Allocated Bourbon',
        'Store Pick Bourbon',
        'Private Selection Bourbon',
      ],
      whiskey: [
        'American Single Malt Whiskey',
        'Tennessee Whiskey',
        'Rye Whiskey',
        'American Whiskey',
        'Blended American Whiskey',
        'Straight Whiskey',
        'Craft Whiskey',
        'Single Barrel Whiskey',
        'Cask Strength Whiskey',
      ],
      scotch: [
        'Single Malt Scotch Whisky',
        'Blended Scotch Whisky',
        'Highland Single Malt',
        'Speyside Single Malt',
        'Islay Single Malt',
        'Campbeltown Single Malt',
        'Lowland Single Malt',
        'Island Single Malt',
        'Peated Scotch Whisky',
        'Sherry Cask Scotch',
        'Cask Strength Scotch',
      ],
      tequila: [
        'Blanco Tequila',
        'Reposado Tequila',
        'Añejo Tequila',
        'Extra Añejo Tequila',
        'Cristalino Tequila',
        'Highland Tequila',
        'Valley Tequila',
        '100% Agave Tequila',
        'Organic Tequila',
        'Single Estate Tequila',
      ],
      rum: [
        'White Rum',
        'Gold Rum',
        'Dark Rum',
        'Spiced Rum',
        'Aged Rum',
        'Overproof Rum',
        'Rhum Agricole',
        'Navy Strength Rum',
        'Single Estate Rum',
        'Pot Still Rum',
      ],
      gin: [
        'London Dry Gin',
        'Plymouth Gin',
        'Old Tom Gin',
        'Navy Strength Gin',
        'Contemporary Gin',
        'Sloe Gin',
        'Barrel Aged Gin',
        'Craft Gin',
        'Botanical Gin',
      ],
    };

    const patterns = smartPatterns[category.toLowerCase()] || [`${category} spirits`];

    // Add category patterns
    patterns.forEach(pattern => {
      queries.push(pattern);
      
      // Add brand variations for certain categories
      if (category.toLowerCase() === 'bourbon') {
        const bourbonBrands = ['Buffalo Trace', 'Four Roses', 'Wild Turkey', 'Makers Mark', 'Woodford Reserve'];
        const randomBrands = this.getRandomElements(bourbonBrands, 2);
        randomBrands.forEach(brand => {
          queries.push(`${brand} ${pattern}`);
        });
      }
    });

    // Continue with pattern-based queries using site groups
    siteGroups.forEach((siteGroup, idx) => {
      if (queries.length >= siteQueryCount + multiSiteCount) return;
      
      patterns.slice(idx * 3, (idx + 1) * 3).forEach(pattern => {
        queries.push(`${siteGroup} ${pattern}`);
      });
    });
    
    // Final 10%: Brand-specific searches on retail sites
    if (category.toLowerCase() === 'bourbon') {
      const bourbonBrands = ['Buffalo Trace', 'Four Roses', 'Wild Turkey', 'Makers Mark', 'Woodford Reserve'];
      const retailSite = priorityRetailers[0];
      bourbonBrands.slice(0, Math.ceil(limit * 0.1)).forEach(brand => {
        queries.push(`site:${retailSite} ${brand} bourbon bottle`);
      });
    }
    
    // CRITICAL: Never add generic queries without site: operators
    // This prevents Reddit/blog contamination
    
    // Shuffle for variety but maintain retail focus
    return this.shuffleArray(queries).slice(0, limit);
  }

  /**
   * Generate high diversity queries for large limits to avoid cache collisions
   * CRITICAL: All queries must use site: operators to force retail results
   */
  generateHighDiversityQueries(category: string, limit: number): string[] {
    const queries: string[] = [];
    
    // Retail sites to rotate through
    const retailSites = [
      'totalwine.com', 'thewhiskyexchange.com', 'masterofmalt.com',
      'klwines.com', 'wine.com', 'caskers.com', 'reservebar.com',
      'seelbachs.com', 'drizly.com', 'flaviar.com', 'astorwines.com',
      'binnys.com', 'specsonline.com', 'bevmo.com'
    ];
    
    // 1. Site-specific category queries (40%)
    const siteQueries = Math.ceil(limit * 0.4);
    let siteIndex = 0;
    for (let i = 0; i < siteQueries; i++) {
      const site = retailSites[siteIndex % retailSites.length];
      queries.push(`site:${site} ${category} spirits bottle`);
      siteIndex++;
    }
    
    // 2. Multi-site discovery queries (30%)
    const multiSiteQueries = this.generateSiteSpecificQueries().slice(0, Math.ceil(limit * 0.3));
    queries.push(...multiSiteQueries);
    
    // 3. Time-based with site restrictions (15%)
    const timeQueries = this.generateTimeBasedQueries(category, Math.ceil(limit * 0.15));
    const siteRestrictedTimeQueries = timeQueries.map((q, idx) => {
      const site = retailSites[idx % retailSites.length];
      return `site:${site} ${q}`;
    });
    queries.push(...siteRestrictedTimeQueries);
    
    // 4. Rarity queries with site restrictions (15%)
    const rarityQueriesBase = this.generateRarityQueries(category, Math.ceil(limit * 0.15));
    const siteRestrictedRarityQueries = rarityQueriesBase.map((q, idx) => {
      const site = retailSites[(idx + 5) % retailSites.length];
      return `site:${site} ${q}`;
    });
    queries.push(...siteRestrictedRarityQueries);
    
    // Shuffle for maximum diversity and return requested count
    return this.shuffleArray(queries).slice(0, limit);
  }

  private generateDiscoveryQueries(category: string, count: number): string[] {
    const retailSites = [
      'totalwine.com', 'wine.com', 'thewhiskyexchange.com',
      'masterofmalt.com', 'klwines.com', 'caskers.com'
    ];
    
    const discoveryPatterns = [
      `${category} bottle 750ml`,
      `${category} spirits collection`,
      `${category} buy online`,
      `${category} in stock`,
      `limited edition ${category}`,
      `premium ${category}`,
      `craft ${category}`
    ];
    
    const queries: string[] = [];
    discoveryPatterns.forEach((pattern, idx) => {
      const site = retailSites[idx % retailSites.length];
      queries.push(`site:${site} ${pattern}`);
    });
    
    return this.getRandomElements(queries, count);
  }

  private generateTimeBasedQueries(category: string, count: number): string[] {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    const timeQueries = [
      `${category} releases ${currentYear}`,
      `${category} ${currentMonth} ${currentYear}`,
      `upcoming ${category} releases`,
      `${category} holiday ${currentYear}`,
      `${category} spring collection`,
      `${category} fall releases`,
      `${category} limited ${currentYear}`,
      `new ${category} ${currentMonth}`,
      `${category} special edition ${currentYear}`,
      `${category} anniversary ${currentYear}`
    ];
    
    return this.getRandomElements(timeQueries, count);
  }

  private generateRarityQueries(category: string, count: number): string[] {
    const rarityTerms = [
      'rare', 'limited edition', 'special release', 'single barrel',
      'cask strength', 'barrel proof', 'allocated', 'exclusive',
      'collector', 'vintage', 'premium', 'ultra-premium'
    ];
    
    const queries: string[] = [];
    rarityTerms.forEach(term => {
      queries.push(`${term} ${category}`);
      queries.push(`${category} ${term}`);
    });
    
    return this.getRandomElements(queries, count);
  }
}