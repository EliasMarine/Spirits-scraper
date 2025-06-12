import { ALL_TEQUILA_PRODUCERS, ALL_MEZCAL_PRODUCERS } from './distilleries-tequila.js';
import { ALL_RUM_DISTILLERIES } from './distilleries-rum.js';
import { ALL_BOURBON_DISTILLERIES } from './distilleries-bourbon.js';
import { ALL_AMERICAN_CRAFT_DISTILLERIES } from './distilleries-american-craft.js';
import { ALL_GIN_DISTILLERIES } from './distilleries-gin.js';
import { ALL_VODKA_DISTILLERIES } from './distilleries-vodka.js';
import { ALL_COGNAC_BRANDY_DISTILLERIES } from './distilleries-cognac.js';
// Query template system for comprehensive scraping
export const QUERY_TEMPLATES = {
    basic: (brand, product_type = '') => `"${brand}" ${product_type}`.trim(),
    limited: (brand) => `"${brand}" limited edition special release exclusive`,
    retailer: (brand, domain) => `site:${domain} "${brand}"`,
    historical: (brand) => `"${brand}" discontinued vintage rare collectible`,
    discovery: (brand, exclude) => `"${brand}" -${exclude.join(' -')}`,
    product_line: (brand, line) => `"${brand}" "${line}"`,
    year_range: (brand, start, end) => {
        const years = [];
        for (let year = start; year <= end; year++) {
            years.push(`"${brand}" ${year}`);
        }
        return years;
    },
    cask_finish: (brand) => `"${brand}" cask finish barrel proof sherry port wine`,
    collaboration: (brand) => `"${brand}" collaboration partnership exclusive release`
};
// Gap-filling discovery strategies
export const DISCOVERY_STRATEGIES = {
    // Automated discovery queries to find unknown products
    temporal: {
        description: 'Search by year ranges to find new and old releases',
        generateQueries: (distillery) => {
            const currentYear = new Date().getFullYear();
            const queries = [];
            // Recent releases
            for (let year = currentYear - 2; year <= currentYear; year++) {
                queries.push(`"${distillery.name}" ${year} release new`);
            }
            // Historical releases
            for (let decade = 1980; decade < currentYear; decade += 10) {
                queries.push(`"${distillery.name}" ${decade}s vintage`);
            }
            return queries;
        }
    },
    retailer_mining: {
        description: 'Search specific retailer sites for comprehensive catalogs',
        retailers: [
            'totalwine.com', 'klwines.com', 'thewhiskyexchange.com',
            'masterofmalt.com', 'finedrams.com', 'whiskybase.com'
        ],
        generateQueries: (distillery, retailer) => `site:${retailer} "${distillery.name}" -cart -checkout`
    },
    auction_discovery: {
        description: 'Search auction sites for rare and discontinued items',
        sites: ['whisky.auction', 'scotchwhiskyauctions.com', 'bonhams.com'],
        generateQueries: (distillery, site) => `site:${site} "${distillery.name}" lot auction`
    },
    press_release: {
        description: 'Search for press releases and announcements',
        generateQueries: (distillery) => [
            `"${distillery.name}" "press release" "new product" announcement`,
            `"${distillery.name}" "launching" "introduces" whiskey bourbon`,
            `"${distillery.parent_company || distillery.name}" portfolio addition`
        ]
    },
    awards_competitions: {
        description: 'Search competition results for unknown products',
        generateQueries: (distillery) => [
            `"${distillery.name}" "gold medal" "double gold" competition`,
            `"${distillery.name}" "whisky awards" winner`,
            `"${distillery.name}" "san francisco spirits" "iwsc" "isc"`
        ]
    }
};
export const DISTILLERIES = [
    // ========== AMERICAN BOURBON DISTILLERIES ==========
    {
        name: "Buffalo Trace",
        variations: ["Buffalo Trace Distillery", "Buffalo Trace Bourbon", "BT"],
        aliases: ["Sazerac Company", "Age International"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye", "whiskey"],
        parent_company: "Sazerac Company",
        website: "buffalotracedistillery.com",
        priority: 10,
        product_lines: [
            { name: "Buffalo Trace", subcategories: ["Kosher", "Single Barrel Select"] },
            { name: "Eagle Rare", subcategories: ["10 Year", "17 Year", "Double Eagle Very Rare"] },
            { name: "Blanton's", subcategories: ["Original Single Barrel", "Gold", "Straight From The Barrel", "Special Reserve", "Takara Red", "Takara Black"] },
            { name: "E.H. Taylor Jr.", subcategories: ["Small Batch", "Single Barrel", "Barrel Proof", "Straight Rye", "Four Grain", "Amaranth", "Cured Oak", "Seasoned Wood", "Warehouse C"] },
            { name: "George T. Stagg", modifiers: ["Antique Collection", "Jr."] },
            { name: "W.L. Weller", subcategories: ["Special Reserve", "Antique 107", "12 Year", "Full Proof", "Single Barrel", "C.Y.P.B."] },
            { name: "Pappy Van Winkle", subcategories: ["15 Year", "20 Year", "23 Year"] },
            { name: "Van Winkle", subcategories: ["Special Reserve 12 Year", "Lot B"] },
            { name: "Elmer T. Lee", subcategories: ["Single Barrel", "100 Year Tribute"] },
            { name: "Rock Hill Farms", subcategories: ["Single Barrel"] },
            { name: "Hancock's President's Reserve", subcategories: ["Single Barrel"] },
            { name: "Ancient Age", subcategories: ["90 Proof", "10 Star", "10 Year"] },
            { name: "Benchmark", subcategories: ["Old No. 8", "Top Floor", "Small Batch", "Full Proof", "Bonded"] }
        ],
        modifiers: ["limited edition", "special release", "experimental collection", "single oak project", "antique collection", "barrel proof", "wheated"],
        base_queries: [
            "Buffalo Trace bourbon",
            "Sazerac distillery products",
            "BTAC bourbon"
        ]
    },
    {
        name: "Heaven Hill",
        variations: ["Heaven Hill Distilleries", "Heaven Hill Distillery", "HH"],
        aliases: ["Bardstown distillery"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye", "whiskey"],
        parent_company: "Heaven Hill Distilleries, Inc.",
        website: "heavenhill.com",
        priority: 9,
        product_lines: [
            { name: "Evan Williams", subcategories: ["Black Label", "Green Label", "White Label Bottled-in-Bond", "Single Barrel", "1783", "Red Label 12 Year"] },
            { name: "Elijah Craig", subcategories: ["Small Batch", "Barrel Proof", "18 Year", "23 Year", "Toasted Barrel", "Rye"] },
            { name: "Henry McKenna", subcategories: ["10 Year Bottled-in-Bond Single Barrel"] },
            { name: "Old Fitzgerald", subcategories: ["Bottled-in-Bond", "9 Year", "11 Year", "13 Year", "14 Year", "15 Year", "16 Year", "17 Year", "19 Year"] },
            { name: "Larceny", subcategories: ["Small Batch", "Barrel Proof"] },
            { name: "Parker's Heritage Collection", modifiers: ["limited edition", "annual release"] },
            { name: "Old Ezra", subcategories: ["7 Year Barrel Strength"] },
            { name: "Very Old Barton", subcategories: ["80 Proof", "86 Proof", "90 Proof", "100 Proof", "Bottled-in-Bond"] },
            { name: "Fighting Cock", subcategories: ["6 Year", "103 Proof"] },
            { name: "J.T.S. Brown", subcategories: ["Bottled-in-Bond"] },
            { name: "Mellow Corn", subcategories: ["Bottled-in-Bond"] }
        ],
        modifiers: ["barrel proof", "bottled-in-bond", "wheated", "small batch", "single barrel", "toasted barrel"],
        base_queries: [
            "Heaven Hill bourbon",
            "Heaven Hill whiskey",
            "HH distillery products"
        ]
    },
    {
        name: "Wild Turkey",
        variations: ["Wild Turkey Distillery", "Wild Turkey Bourbon", "WT"],
        aliases: ["Austin Nichols"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye", "whiskey"],
        parent_company: "Campari Group",
        website: "wildturkeybourbon.com",
        priority: 9,
        product_lines: [
            { name: "Wild Turkey", subcategories: ["81", "101", "Kentucky Spirit", "Rare Breed", "Rare Breed Rye"] },
            { name: "Russell's Reserve", subcategories: ["10 Year", "13 Year", "Single Barrel", "Single Barrel Rye", "6 Year Rye"] },
            { name: "Master's Keep", subcategories: ["17 Year", "Decades", "Revival", "Cornerstone", "One", "Unforgotten", "Bottled-in-Bond"] },
            { name: "Longbranch", modifiers: ["Matthew McConaughey collaboration"] },
            { name: "Diamond Anniversary", modifiers: ["limited edition"] },
            { name: "Tradition", modifiers: ["discontinued", "14 Year"] },
            { name: "American Spirit", modifiers: ["15 Year", "discontinued"] }
        ],
        modifiers: ["barrel proof", "single barrel", "limited edition", "cask strength", "bottled-in-bond"],
        base_queries: [
            "Wild Turkey bourbon",
            "Russell's Reserve",
            "Master's Keep series"
        ]
    },
    {
        name: "Four Roses",
        variations: ["Four Roses Distillery", "Four Roses Bourbon", "4 Roses"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon"],
        parent_company: "Kirin Brewery Company",
        website: "fourrosesbourbon.com",
        priority: 9,
        product_lines: [
            { name: "Four Roses", subcategories: ["Yellow Label", "Small Batch", "Single Barrel", "Small Batch Select"] },
            { name: "Limited Edition", subcategories: ["Small Batch", "Single Barrel"], modifiers: ["annual release", "Al Young 50th Anniversary", "Elliott's Select", "2023 release", "2022 release"] },
            { name: "Private Selection", modifiers: ["OBSV", "OBSK", "OBSO", "OBSQ", "OBSF", "OESV", "OESK", "OESO", "OESQ", "OESF"] }
        ],
        modifiers: ["barrel strength", "limited edition", "single barrel", "small batch", "private selection", "recipe"],
        base_queries: [
            "Four Roses bourbon",
            "Four Roses limited edition",
            "Four Roses recipe"
        ]
    },
    {
        name: "Maker's Mark",
        variations: ["Maker's Mark Distillery", "Makers Mark", "Maker's"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "wheated bourbon"],
        parent_company: "Beam Suntory",
        website: "makersmark.com",
        priority: 8,
        product_lines: [
            { name: "Maker's Mark", subcategories: ["Original", "46", "46 Cask Strength", "Cask Strength", "101"] },
            { name: "Wood Finishing Series", modifiers: ["FAE-01", "FAE-02", "SE4 x PR5", "RC6", "BRT-01", "BRT-02"] },
            { name: "Private Selection", modifiers: ["stave profile", "custom finish"] },
            { name: "Maker's Mark Cellar Aged", modifiers: ["limited release"] }
        ],
        modifiers: ["cask strength", "wood finished", "private selection", "limited release", "wheated"],
        base_queries: [
            "Maker's Mark bourbon",
            "Maker's Mark wood finishing",
            "Maker's wheated bourbon"
        ]
    },
    {
        name: "Jim Beam",
        variations: ["Jim Beam Distillery", "James B. Beam", "Beam"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye", "whiskey"],
        parent_company: "Beam Suntory",
        website: "jimbeam.com",
        priority: 8,
        product_lines: [
            { name: "Jim Beam", subcategories: ["White Label", "Black Extra-Aged", "Double Oak", "Devil's Cut", "Bonded", "Single Barrel", "Repeal Batch"] },
            { name: "Jim Beam Distiller's Cut", modifiers: ["limited edition"] },
            { name: "Jim Beam Signature Craft", subcategories: ["12 Year", "Quarter Cask", "Brown Rice", "High Rye", "Rolled Oat", "Soft Red Wheat", "Triticale"] },
            { name: "Jim Beam Harvest Collection", subcategories: ["Kentucky Dram", "Whole Rolled Oat", "Brown Rice", "Soft Red Wheat"] },
            { name: "Jim Beam Lineage", modifiers: ["limited edition"] },
            { name: "Old Crow", subcategories: ["Original", "Reserve"] },
            { name: "Old Grand-Dad", subcategories: ["80 Proof", "Bonded", "114 Proof"] },
            { name: "Old Overholt", subcategories: ["Straight Rye", "Bonded", "114 Proof"] }
        ],
        modifiers: ["bonded", "single barrel", "small batch", "limited edition", "double aged", "signature craft"],
        base_queries: [
            "Jim Beam bourbon",
            "Jim Beam limited edition",
            "Beam distillery products"
        ]
    },
    {
        name: "Woodford Reserve",
        variations: ["Woodford Reserve Distillery", "Woodford"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye", "malt", "wheat"],
        parent_company: "Brown-Forman",
        website: "woodfordreserve.com",
        priority: 8,
        product_lines: [
            { name: "Woodford Reserve", subcategories: ["Distiller's Select", "Double Oaked", "Batch Proof", "Kentucky Derby Edition"] },
            { name: "Master's Collection", modifiers: ["annual release", "Very Fine Rare Bourbon", "Chocolate Malted Rye", "Five-Malt Stouted Mash", "Historic Barrel Entry"] },
            { name: "Distillery Series", modifiers: ["experimental", "limited release"] },
            { name: "Woodford Reserve Rye", subcategories: ["Straight Rye"] },
            { name: "Woodford Reserve Wheat", subcategories: ["Straight Wheat Whiskey"] },
            { name: "Woodford Reserve Malt", subcategories: ["Straight Malt Whiskey"] }
        ],
        modifiers: ["double oaked", "batch proof", "master's collection", "distillery series", "limited edition"],
        base_queries: [
            "Woodford Reserve bourbon",
            "Woodford Reserve master's collection",
            "Woodford distillery series"
        ]
    },
    {
        name: "Old Forester",
        variations: ["Old Forester Distillery", "Brown-Forman", "Brown Forman"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye"],
        parent_company: "Brown-Forman",
        website: "oldforester.com",
        priority: 8,
        product_lines: [
            { name: "Old Forester", subcategories: ["86 Proof", "100 Proof", "Statesman"] },
            { name: "Whiskey Row Series", subcategories: ["1870 Original Batch", "1897 Bottled in Bond", "1910 Old Fine Whisky", "1920 Prohibition Style"] },
            { name: "Old Forester Single Barrel", modifiers: ["barrel strength", "100 proof"] },
            { name: "Old Forester Rye", subcategories: ["100 Proof"] },
            { name: "President's Choice", modifiers: ["single barrel", "limited edition"] },
            { name: "Birthday Bourbon", modifiers: ["annual release", "limited edition"] },
            { name: "117 Series", modifiers: ["warehouse exclusive", "high angels share"] }
        ],
        modifiers: ["bottled-in-bond", "single barrel", "barrel strength", "prohibition style", "birthday bourbon"],
        base_queries: [
            "Old Forester bourbon",
            "Old Forester whiskey row",
            "Old Forester birthday bourbon"
        ]
    },
    {
        name: "Barton 1792",
        variations: ["1792 Distillery", "Barton Distillery", "1792 Bourbon"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye"],
        parent_company: "Sazerac Company",
        website: "1792bourbon.com",
        priority: 7,
        product_lines: [
            { name: "1792", subcategories: ["Small Batch", "Bottled in Bond", "Single Barrel", "Full Proof", "Sweet Wheat", "High Rye", "Aged 12 Years"] },
            { name: "1792 Limited Edition", modifiers: ["Port Finish", "225th Anniversary"] },
            { name: "Very Old Barton", subcategories: ["80 Proof", "86 Proof", "90 Proof", "100 Proof", "Bottled-in-Bond"] },
            { name: "Kentucky Gentleman", subcategories: ["Bourbon"] },
            { name: "Tom Moore", subcategories: ["Bottled-in-Bond"] }
        ],
        modifiers: ["bottled-in-bond", "single barrel", "full proof", "port finish", "sweet wheat", "high rye"],
        base_queries: [
            "1792 bourbon",
            "Barton distillery bourbon",
            "1792 limited edition"
        ]
    },
    {
        name: "Castle & Key",
        variations: ["Castle and Key", "Castle & Key Distillery", "C&K"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye", "gin", "vodka"],
        website: "castleandkey.com",
        priority: 7,
        product_lines: [
            { name: "Restoration Rye", modifiers: ["batch release"] },
            { name: "Small Batch Bourbon", modifiers: ["wheated"] },
            { name: "Roots of Rye", subcategories: ["Harvest Edition"] },
            { name: "Rise Gin", subcategories: ["Spring", "Summer", "Fall", "Winter"] },
            { name: "Sacred Spring Vodka" }
        ],
        modifiers: ["restoration", "small batch", "limited release", "seasonal"],
        base_queries: [
            "Castle & Key bourbon",
            "Castle Key restoration",
            "Castle and Key whiskey"
        ]
    },
    {
        name: "Michter's",
        variations: ["Michter's Distillery", "Michters", "Michter's Fort Nelson"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye", "american whiskey", "sour mash"],
        parent_company: "Chatham Imports",
        website: "michters.com",
        priority: 8,
        product_lines: [
            { name: "Michter's US*1", subcategories: ["Kentucky Straight Bourbon", "Kentucky Straight Rye", "American Whiskey", "Sour Mash Whiskey"] },
            { name: "Michter's 10 Year", subcategories: ["Bourbon", "Rye"] },
            { name: "Michter's 20 Year", subcategories: ["Bourbon"] },
            { name: "Michter's 25 Year", subcategories: ["Bourbon", "Rye"] },
            { name: "Michter's Toasted Barrel Finish", subcategories: ["Bourbon", "Rye", "Sour Mash"] },
            { name: "Michter's Barrel Strength", subcategories: ["Bourbon", "Rye"] },
            { name: "Michter's Celebration", modifiers: ["limited edition", "sour mash"] }
        ],
        modifiers: ["toasted barrel", "barrel strength", "limited edition", "10 year", "20 year", "25 year"],
        base_queries: [
            "Michter's bourbon",
            "Michter's whiskey",
            "Michter's limited edition"
        ]
    },
    {
        name: "Angel's Envy",
        variations: ["Angels Envy", "Angel's Envy Distillery", "AE"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye"],
        parent_company: "Bacardi Limited",
        website: "angelsenvy.com",
        priority: 8,
        product_lines: [
            { name: "Angel's Envy", subcategories: ["Port Wine Barrel Finish"] },
            { name: "Angel's Envy Cask Strength", modifiers: ["port barrel finished", "annual release"] },
            { name: "Angel's Envy Rye", subcategories: ["Caribbean Rum Cask Finish"] },
            { name: "Cellar Collection", modifiers: ["mizunara", "ice cider", "madeira", "sherry", "tawny port"] },
            { name: "Private Selection", modifiers: ["single barrel"] }
        ],
        modifiers: ["port finish", "rum finish", "cask strength", "cellar collection", "finished whiskey"],
        base_queries: [
            "Angel's Envy bourbon",
            "Angel's Envy finished",
            "Angel's Envy cellar collection"
        ]
    },
    {
        name: "Rabbit Hole",
        variations: ["Rabbit Hole Distillery", "Rabbit Hole Distilling"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye"],
        parent_company: "Pernod Ricard",
        website: "rabbitholedistillery.com",
        priority: 7,
        product_lines: [
            { name: "Cavehill", subcategories: ["Kentucky Straight Bourbon"] },
            { name: "Heigold", subcategories: ["High Rye Bourbon"] },
            { name: "Dareringer", subcategories: ["Straight Bourbon Finished in PX Sherry Casks"] },
            { name: "Boxergrail", subcategories: ["Kentucky Straight Rye"] },
            { name: "Founder's Collection", modifiers: ["limited edition", "Nevallier", "Mizunara"] }
        ],
        modifiers: ["sherry finish", "high rye", "founder's collection", "limited edition"],
        base_queries: [
            "Rabbit Hole bourbon",
            "Rabbit Hole whiskey",
            "Rabbit Hole founder's"
        ]
    },
    {
        name: "New Riff",
        variations: ["New Riff Distillery", "New Riff Distilling"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye", "malt"],
        website: "newriffdistilling.com",
        priority: 8,
        product_lines: [
            { name: "New Riff", subcategories: ["Bottled in Bond Bourbon", "Bottled in Bond Rye", "Kentucky Straight Bourbon", "Kentucky Straight Rye"] },
            { name: "New Riff Single Barrel", subcategories: ["Bourbon", "Rye"] },
            { name: "New Riff Malted Rye", subcategories: ["Bottled in Bond"] },
            { name: "New Riff Winter Whiskey", modifiers: ["seasonal release"] },
            { name: "New Riff Backsetter", subcategories: ["Peated Bourbon", "Peated Rye"] },
            { name: "Whiskey Barreled Gin", modifiers: ["aged gin"] }
        ],
        modifiers: ["bottled-in-bond", "single barrel", "malted", "peated", "backset"],
        base_queries: [
            "New Riff bourbon",
            "New Riff bottled in bond",
            "New Riff whiskey"
        ]
    },
    {
        name: "Bardstown Bourbon Company",
        variations: ["Bardstown Bourbon", "BBC", "BBCo"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye", "whiskey"],
        website: "bardstownbourbon.com",
        priority: 9,
        product_lines: [
            { name: "Origin Series", subcategories: ["Kentucky Straight Bourbon", "Bottled-in-Bond", "Wheated", "High Rye"] },
            { name: "Fusion Series", subcategories: ["#1", "#2", "#3", "#4", "#5", "#6", "#7", "#8", "#9", "#10"] },
            { name: "Discovery Series", subcategories: ["#1", "#2", "#3", "#4", "#5", "#6", "#7", "#8", "#9", "#10", "#11"] },
            { name: "Collaborative Series", modifiers: [
                    "Chateau de Laubade", "Phifer Pavitt", "Foursquare Rum", "Founders KBS Stout",
                    "Goose Island", "Goodwood Honey Ale", "Jefferson's", "Plantation Rum",
                    "Silver Oak", "Stranger & Stranger", "West Virginia Great Barrel Company"
                ] },
            { name: "Destillaré", modifiers: ["orange curaçao finish"] },
            { name: "Château de Laubade", modifiers: ["armagnac cask finish"] }
        ],
        modifiers: ["collaboration", "fusion", "discovery", "origin", "cask finish", "wine barrel"],
        base_queries: [
            "Bardstown Bourbon Company",
            "BBC bourbon",
            "Bardstown collaboration"
        ]
    },
    {
        name: "Lux Row",
        variations: ["Lux Row Distillers", "Luxco"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon"]
    },
    {
        name: "Green River",
        variations: ["Green River Distilling", "Green River Distillery"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon"]
    },
    {
        name: "O.Z. Tyler",
        variations: ["O.Z. Tyler Distillery", "OZ Tyler"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon"]
    },
    {
        name: "Wilderness Trail",
        variations: ["Wilderness Trail Distillery"],
        region: "Kentucky",
        country: "USA",
        type: ["bourbon", "rye"]
    },
    // ========== TENNESSEE WHISKEY ==========
    {
        name: "Jack Daniel's",
        variations: ["Jack Daniels", "Jack Daniel's Distillery"],
        region: "Tennessee",
        country: "USA",
        type: ["tennessee whiskey"]
    },
    {
        name: "George Dickel",
        variations: ["Dickel", "George Dickel Distillery"],
        region: "Tennessee",
        country: "USA",
        type: ["tennessee whiskey", "rye"]
    },
    {
        name: "Uncle Nearest",
        variations: ["Uncle Nearest Distillery"],
        region: "Tennessee",
        country: "USA",
        type: ["tennessee whiskey"]
    },
    {
        name: "Nelson's Green Brier",
        variations: ["Nelson's Green Brier Distillery", "Belle Meade"],
        region: "Tennessee",
        country: "USA",
        type: ["tennessee whiskey", "bourbon"]
    },
    // ========== RYE WHISKEY DISTILLERIES ==========
    {
        name: "WhistlePig",
        variations: ["WhistlePig Farm", "Whistle Pig", "WhistlePig Distillery"],
        region: "Vermont",
        country: "USA",
        type: ["rye"],
        website: "whistlepigwhiskey.com",
        priority: 9,
        product_lines: [
            { name: "WhistlePig 10 Year", subcategories: ["Small Batch Rye", "Single Barrel", "San Diego Barrel Boys"] },
            { name: "WhistlePig 12 Year", subcategories: ["Old World", "Bespoke Blend"] },
            { name: "WhistlePig 15 Year", subcategories: ["Estate Oak Rye"] },
            { name: "WhistlePig 18 Year", subcategories: ["Double Malt Rye"] },
            { name: "Boss Hog", subcategories: [
                    "The Black Prince", "The Spirit of Mortimer", "The Independent",
                    "Magellan's Atlantic", "The Samurai Scientist", "LapuLapu's Pacific",
                    "The Commander", "Juggernaut"
                ], modifiers: ["limited edition", "annual release"] },
            { name: "PiggyBack", subcategories: ["6 Year Rye", "100 Proof", "Single Barrel"] },
            { name: "FarmStock", subcategories: ["Rye Crop 001", "Rye Crop 002", "Rye Crop 003", "Beyond Bonded"] },
            { name: "HomeStock", modifiers: ["limited release"] },
            { name: "RoadStock", modifiers: ["limited release"] }
        ],
        modifiers: ["single barrel", "cask finish", "estate", "farm to bottle", "limited edition"],
        base_queries: [
            "WhistlePig rye",
            "WhistlePig Boss Hog",
            "WhistlePig limited edition"
        ]
    },
    {
        name: "High West",
        variations: ["High West Distillery", "High West Whiskey"],
        region: "Utah",
        country: "USA",
        type: ["rye", "bourbon", "american whiskey"],
        parent_company: "Constellation Brands",
        website: "highwest.com",
        priority: 8,
        product_lines: [
            { name: "Double Rye!", modifiers: ["blend of straight ryes"] },
            { name: "Rendezvous Rye", modifiers: ["limited release", "blend of straight ryes"] },
            { name: "A Midwinter Night's Dram", subcategories: ["Act 1", "Act 2", "Act 3", "Act 4", "Act 5", "Act 6", "Act 7", "Act 8", "Act 9", "Act 10"], modifiers: ["port cask finish"] },
            { name: "American Prairie Bourbon", modifiers: ["blend of straight bourbons"] },
            { name: "Bourye", modifiers: ["limited release", "bourbon rye blend"] },
            { name: "Campfire", modifiers: ["blend of bourbon, rye, and scotch"] },
            { name: "Yippee Ki-Yay", modifiers: ["rye finished in vermouth and syrah barrels"] },
            { name: "High Country", subcategories: ["American Single Malt"] },
            { name: "Bottled in Bond", modifiers: ["limited release"] }
        ],
        modifiers: ["finished", "limited release", "blend", "port finish", "wine barrel finish"],
        base_queries: [
            "High West rye",
            "High West whiskey",
            "High West Midwinter"
        ]
    },
    {
        name: "Rittenhouse",
        variations: ["Rittenhouse Rye", "Heaven Hill Rittenhouse"],
        region: "Kentucky",
        country: "USA",
        type: ["rye"],
        parent_company: "Heaven Hill",
        website: "heavenhill.com",
        priority: 7,
        product_lines: [
            { name: "Rittenhouse", subcategories: ["Bottled in Bond", "Very Rare 21 Year", "Very Rare 23 Year", "Very Rare 25 Year"] }
        ],
        modifiers: ["bottled-in-bond", "aged", "very rare"],
        base_queries: [
            "Rittenhouse rye",
            "Rittenhouse bottled in bond",
            "Rittenhouse very rare"
        ]
    },
    {
        name: "Sazerac Rye",
        variations: ["Sazerac", "Baby Sazerac", "Thomas H. Handy"],
        region: "Louisiana",
        country: "USA",
        type: ["rye"],
        parent_company: "Sazerac Company",
        website: "sazerac.com",
        priority: 8,
        product_lines: [
            { name: "Sazerac Rye", subcategories: ["6 Year", "18 Year"] },
            { name: "Thomas H. Handy Sazerac Rye", modifiers: ["barrel proof", "antique collection"] },
            { name: "Baby Sazerac", modifiers: ["6 year"] }
        ],
        modifiers: ["straight rye", "barrel proof", "antique collection"],
        base_queries: [
            "Sazerac rye whiskey",
            "Thomas H. Handy rye",
            "Buffalo Trace rye"
        ]
    },
    {
        name: "Old Overholt",
        variations: ["Old Overholt Rye", "Overholt"],
        region: "Kentucky",
        country: "USA",
        type: ["rye"],
        parent_company: "Beam Suntory",
        website: "jimbeam.com",
        priority: 6,
        product_lines: [
            { name: "Old Overholt", subcategories: ["Straight Rye", "Bottled in Bond", "114 Proof", "11 Year"] },
            { name: "Old Overholt Cask Strength", modifiers: ["limited release"] }
        ],
        modifiers: ["bottled-in-bond", "114 proof", "aged", "cask strength"],
        base_queries: [
            "Old Overholt rye",
            "Old Overholt bottled in bond",
            "Overholt whiskey"
        ]
    },
    // ========== AMERICAN CRAFT DISTILLERIES ==========
    {
        name: "Westland",
        variations: ["Westland Distillery", "Westland Whiskey"],
        region: "Washington",
        country: "USA",
        type: ["american single malt"],
        parent_company: "Rémy Cointreau",
        website: "westlanddistillery.com",
        priority: 8,
        product_lines: [
            { name: "Westland American Single Malt", subcategories: ["Flagship"] },
            { name: "Westland Peated", modifiers: ["peated american single malt"] },
            { name: "Westland Sherry Wood", modifiers: ["sherry cask"] },
            { name: "Garryana", modifiers: ["native oak", "annual edition"] },
            { name: "Solum", modifiers: ["limited edition"] },
            { name: "Colere", modifiers: ["limited edition", "farm series"] },
            { name: "Outpost Range", subcategories: ["Explorer's Cask", "Cask Exchange"] },
            { name: "Single Cask", modifiers: ["distillery exclusive"] }
        ],
        modifiers: ["pacific northwest", "terroir", "garryana oak", "five malt"],
        base_queries: [
            "Westland whiskey",
            "Westland single malt",
            "Westland garryana"
        ]
    },
    {
        name: "Balcones",
        variations: ["Balcones Distilling", "Balcones Distillery"],
        region: "Texas",
        country: "USA",
        type: ["american single malt", "american whiskey", "corn whiskey", "rye"],
        website: "balconesdistilling.com",
        priority: 8,
        product_lines: [
            { name: "Balcones Texas Single Malt", modifiers: ["classic", "special release"] },
            { name: "Lineage", modifiers: ["texas single malt"] },
            { name: "Mirador", modifiers: ["single malt"] },
            { name: "Peated Texas Single Malt", modifiers: ["islay cask", "sauternes cask"] },
            { name: "Brimstone", modifiers: ["smoked corn whiskey"] },
            { name: "Baby Blue", modifiers: ["corn whiskey"] },
            { name: "True Blue", modifiers: ["100 proof corn whiskey", "cask strength"] },
            { name: "Rumble", modifiers: ["honey spirit"] },
            { name: "Rye", subcategories: ["100 Proof", "Cask Strength"] },
            { name: "Pot Still Bourbon", modifiers: ["texas bourbon"] },
            { name: "Single Barrel", modifiers: ["distillery exclusive"] }
        ],
        modifiers: ["texas whiskey", "blue corn", "smoked", "pot still"],
        base_queries: [
            "Balcones whiskey",
            "Balcones single malt",
            "Balcones texas"
        ]
    },
    {
        name: "Garrison Brothers",
        variations: ["Garrison Brothers Distillery"],
        region: "Texas",
        country: "USA",
        type: ["bourbon"]
    },
    {
        name: "Stranahan's",
        variations: ["Stranahan's Distillery", "Stranahans", "Stranahan's Colorado Whiskey"],
        region: "Colorado",
        country: "USA",
        type: ["american single malt"],
        parent_company: "Proximo Spirits",
        website: "stranahans.com",
        priority: 7,
        product_lines: [
            { name: "Stranahan's Original", modifiers: ["single malt"] },
            { name: "Stranahan's Blue Peak", modifiers: ["single malt"] },
            { name: "Stranahan's Sherry Cask", modifiers: ["single malt", "sherry finish"] },
            { name: "Mountain Angel", modifiers: ["10 year", "limited edition"] },
            { name: "Diamond Peak", modifiers: ["single malt"] },
            { name: "Snowflake", modifiers: ["annual release", "limited edition", "cask finish"] },
            { name: "Single Barrel", modifiers: ["cask strength"] },
            { name: "Distillery Exclusive", modifiers: ["limited release"] }
        ],
        modifiers: ["colorado whiskey", "rocky mountain", "single malt"],
        base_queries: [
            "Stranahan's whiskey",
            "Stranahan's Colorado",
            "Stranahan's Snowflake"
        ]
    },
    {
        name: "St. George Spirits",
        variations: ["St George Spirits", "St. George Distillery"],
        region: "California",
        country: "USA",
        type: ["american single malt", "rye", "gin", "vodka"],
        website: "stgeorgespirits.com",
        priority: 7,
        product_lines: [
            { name: "St. George Single Malt Whiskey", modifiers: ["lot release"] },
            { name: "Baller Single Malt", modifiers: ["japanese inspired"] },
            { name: "Breaking & Entering", subcategories: ["American Whiskey", "Bourbon"] },
            { name: "St. George Rye", modifiers: ["aged rye whiskey"] },
            { name: "Terroir Gin", modifiers: ["california botanicals"] },
            { name: "Botanivore Gin", modifiers: ["19 botanicals"] },
            { name: "Dry Rye Gin", modifiers: ["rye base"] },
            { name: "All Purpose Vodka", modifiers: ["bartender series"] },
            { name: "Green Chile Vodka", modifiers: ["flavored"] }
        ],
        modifiers: ["craft distillery", "california spirits", "single malt"],
        base_queries: [
            "St. George whiskey",
            "St. George single malt",
            "St. George spirits"
        ]
    },
    {
        name: "FEW Spirits",
        variations: ["FEW Distillery", "F.E.W."],
        region: "Illinois",
        country: "USA",
        type: ["bourbon", "rye", "american whiskey"]
    },
    {
        name: "Koval",
        variations: ["Koval Distillery"],
        region: "Illinois",
        country: "USA",
        type: ["bourbon", "rye", "american whiskey"]
    },
    {
        name: "Tuthilltown",
        variations: ["Tuthilltown Spirits", "Hudson Whiskey"],
        region: "New York",
        country: "USA",
        type: ["bourbon", "rye", "american whiskey"]
    },
    {
        name: "Kings County",
        variations: ["Kings County Distillery"],
        region: "New York",
        country: "USA",
        type: ["bourbon", "american whiskey"]
    },
    {
        name: "Copperworks",
        variations: ["Copperworks Distilling", "Copperworks Distillery"],
        region: "Washington",
        country: "USA",
        type: ["american single malt"],
        website: "copperworksdistilling.com",
        priority: 7,
        product_lines: [
            { name: "American Single Malt", subcategories: ["Release No. 001", "Release No. 002", "Release No. 003"] },
            { name: "Peated Single Malt", modifiers: ["peated", "limited release"] },
            { name: "Cask Finished", modifiers: ["port", "sherry", "cognac"] },
            { name: "New Oak", modifiers: ["american oak"] },
            { name: "Single Cask", modifiers: ["cask strength", "distillery exclusive"] },
            { name: "Gin", modifiers: ["small batch"] },
            { name: "Vodka", modifiers: ["craft"] }
        ],
        modifiers: ["seattle", "craft distillery", "american single malt"],
        base_queries: [
            "Copperworks whiskey",
            "Copperworks single malt",
            "Copperworks american"
        ]
    },
    {
        name: "Virginia Distillery",
        variations: ["Virginia Distillery Company", "VDC", "Virginia Distillery Co."],
        region: "Virginia",
        country: "USA",
        type: ["american single malt", "american whiskey"],
        website: "vadistillery.com",
        priority: 7,
        product_lines: [
            { name: "Courage & Conviction", subcategories: ["American Single Malt", "Bourbon Cask", "Sherry Cask", "Cuvee Cask"] },
            { name: "Courage & Conviction BiB", modifiers: ["bottled in bond"] },
            { name: "Vital", modifiers: ["limited edition", "single cask"] },
            { name: "Port Cask Finished", modifiers: ["virginia port"] },
            { name: "Vernal", modifiers: ["limited edition"] },
            { name: "Prelude", modifiers: ["american single malt"] },
            { name: "Brewers Batch", modifiers: ["collaboration", "beer cask"] }
        ],
        modifiers: ["virginia whiskey", "american single malt", "courage conviction"],
        base_queries: [
            "Virginia Distillery whiskey",
            "Courage & Conviction",
            "VDC whiskey"
        ]
    },
    {
        name: "Spirit of Hven",
        variations: ["Backafallsbyn"],
        region: "Other",
        country: "Sweden",
        type: ["single malt"]
    },
    // ========== SCOTCH - SPEYSIDE ==========
    {
        name: "The Macallan",
        variations: ["Macallan", "Macallan Distillery", "The Macallan Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"],
        parent_company: "Edrington Group",
        website: "themacallan.com",
        priority: 10,
        product_lines: [
            { name: "Sherry Oak", subcategories: ["12 Year", "18 Year", "25 Year", "30 Year"] },
            { name: "Double Cask", subcategories: ["12 Year", "15 Year", "18 Year", "30 Year"] },
            { name: "Triple Cask", subcategories: ["12 Year", "15 Year", "18 Year"] },
            { name: "The Macallan Edition", subcategories: ["No. 1", "No. 2", "No. 3", "No. 4", "No. 5", "No. 6", "Red"] },
            { name: "Rare Cask", modifiers: ["batch release"] },
            { name: "Exceptional Single Cask", modifiers: ["vintage", "limited release"] },
            { name: "Fine & Rare", modifiers: ["vintage collection", "1926", "1940s", "1950s", "1960s", "1970s"] },
            { name: "The Macallan M", modifiers: ["lalique decanter"] },
            { name: "Estate", modifiers: ["limited release"] },
            { name: "Archival Series", modifiers: ["folio 1", "folio 2", "folio 3", "folio 4", "folio 5", "folio 6"] },
            { name: "Quest Collection", subcategories: ["Lumina", "Terra", "Enigma"] },
            { name: "Harmony Collection", modifiers: ["rich cacao", "fine cacao", "intense arabica", "smooth arabica"] }
        ],
        modifiers: ["sherry cask", "exceptional cask", "fine & rare", "limited edition", "vintage", "single cask"],
        base_queries: [
            "Macallan whisky",
            "Macallan sherry oak",
            "Macallan limited edition"
        ]
    },
    {
        name: "Glenfiddich",
        variations: ["Glenfiddich Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"],
        parent_company: "William Grant & Sons",
        website: "glenfiddich.com",
        priority: 9,
        product_lines: [
            { name: "Glenfiddich", subcategories: ["12 Year", "15 Year Solera", "18 Year", "21 Year Reserva", "23 Year Grand Cru", "26 Year Grande Couronne", "30 Year", "40 Year", "50 Year"] },
            { name: "Experimental Series", subcategories: ["IPA Experiment", "Project XX", "Fire & Cane", "Winter Storm", "Orchard Experiment"] },
            { name: "Cask Collection", modifiers: ["select cask", "reserve cask", "vintage cask"] },
            { name: "Private Vintage", modifiers: ["single cask", "1973", "1974", "1975", "1976", "1977", "1978"] },
            { name: "Rare Collection", modifiers: ["1937", "1955", "1958", "1959", "1964"] },
            { name: "Grand Series", subcategories: ["Grand Cru", "Grande Couronne", "Grand Yozakura"] },
            { name: "Time Series", modifiers: ["suspended time", "time re:imagined"] }
        ],
        modifiers: ["solera", "experimental", "grand cru", "vintage", "single cask", "rare collection"],
        base_queries: [
            "Glenfiddich whisky",
            "Glenfiddich experimental",
            "Glenfiddich rare"
        ]
    },
    {
        name: "The Glenlivet",
        variations: ["Glenlivet", "Glenlivet Distillery", "The Glenlivet Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"],
        parent_company: "Pernod Ricard",
        website: "theglenlivet.com",
        priority: 9,
        product_lines: [
            { name: "The Glenlivet", subcategories: ["12 Year", "13 Year Cognac Cask", "14 Year", "15 Year French Oak", "18 Year", "21 Year Archive", "25 Year"] },
            { name: "Caribbean Reserve", modifiers: ["rum cask finish"] },
            { name: "Captain's Reserve", modifiers: ["cognac cask finish"] },
            { name: "The Glenlivet Code", modifiers: ["mystery edition"] },
            { name: "The Glenlivet Enigma", modifiers: ["mystery edition"] },
            { name: "The Glenlivet Cipher", modifiers: ["mystery edition"] },
            { name: "Nàdurra", subcategories: ["First Fill", "Oloroso", "Peated", "Cask Strength"] },
            { name: "Spectra", modifiers: ["limited edition", "mystery collection"] },
            { name: "Single Cask", modifiers: ["vintage", "limited release"] },
            { name: "Winchester Collection", modifiers: ["vintage 1966", "vintage 1967"] },
            { name: "Cellar Collection", modifiers: ["1972", "1973", "1974", "1975", "1976", "1977", "1978", "1980", "1981"] }
        ],
        modifiers: ["french oak", "cognac cask", "rum cask", "nàdurra", "single cask", "mystery edition"],
        base_queries: [
            "Glenlivet whisky",
            "Glenlivet nadurra",
            "Glenlivet single cask"
        ]
    },
    {
        name: "Balvenie",
        variations: ["The Balvenie", "Balvenie Distillery", "The Balvenie Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"],
        parent_company: "William Grant & Sons",
        website: "thebalvenie.com",
        priority: 9,
        product_lines: [
            { name: "The Balvenie", subcategories: ["12 Year DoubleWood", "14 Year Caribbean Cask", "15 Year Single Barrel Sherry Cask", "17 Year DoubleWood", "21 Year PortWood", "25 Year", "30 Year", "40 Year", "50 Year"] },
            { name: "Stories Collection", subcategories: ["The Sweet Toast of American Oak", "A Day of Dark Barley", "The Week of Peat", "The Creation of a Classic", "The Second Red Rose", "The Tale of the Dog"] },
            { name: "Tun 1509", subcategories: ["Batch 1", "Batch 2", "Batch 3", "Batch 4", "Batch 5", "Batch 6", "Batch 7", "Batch 8"] },
            { name: "Tun 1858", subcategories: ["Batch 1", "Batch 2", "Batch 3", "Batch 4", "Batch 5"] },
            { name: "DCS Compendium", subcategories: ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5"] },
            { name: "Single Barrel", subcategories: ["12 Year First Fill", "15 Year Sherry Cask", "25 Year"] },
            { name: "Vintage Cask", modifiers: ["edge of burnhead wood"] }
        ],
        modifiers: ["doublewood", "caribbean cask", "portwood", "single barrel", "tun", "stories", "vintage"],
        base_queries: [
            "Balvenie whisky",
            "Balvenie doublewood",
            "Balvenie tun"
        ]
    },
    {
        name: "Glenfarclas",
        variations: ["Glenfarclas Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Aberlour",
        variations: ["Aberlour Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"],
        parent_company: "Pernod Ricard",
        website: "aberlour.com",
        priority: 8,
        product_lines: [
            { name: "Aberlour", subcategories: ["10 Year Forest Reserve", "12 Year Double Cask", "12 Year Non Chill-Filtered", "14 Year Double Cask", "16 Year Double Cask", "18 Year Double Cask"] },
            { name: "A'bunadh", modifiers: ["batch release", "cask strength", "oloroso sherry"] },
            { name: "A'bunadh Alba", modifiers: ["batch release", "cask strength", "bourbon cask"] },
            { name: "Casg Annamh", modifiers: ["batch release", "triple cask"] },
            { name: "White Oak", modifiers: ["Japanese exclusive"] },
            { name: "Single Cask", modifiers: ["hand filled", "distillery exclusive"] }
        ],
        modifiers: ["double cask", "a'bunadh", "cask strength", "sherry cask", "non chill-filtered"],
        base_queries: [
            "Aberlour whisky",
            "Aberlour a'bunadh",
            "Aberlour double cask"
        ]
    },
    {
        name: "GlenAllachie",
        variations: ["Glen Allachie", "GlenAllachie Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Cragganmore",
        variations: ["Cragganmore Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Mortlach",
        variations: ["Mortlach Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "GlenDronach",
        variations: ["Glen Dronach", "Glendronach Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "BenRiach",
        variations: ["Ben Riach", "Benriach Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Glentauchers",
        variations: ["Glentauchers Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Craigellachie",
        variations: ["Craigellachie Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"],
        parent_company: "Bacardi",
        website: "craigellachie.com",
        priority: 7,
        product_lines: [
            { name: "Craigellachie", subcategories: ["13 Year", "17 Year", "23 Year", "31 Year", "33 Year", "51 Year"] },
            { name: "Exceptional Cask Series", modifiers: ["limited release"] },
            { name: "Single Cask", modifiers: ["independent bottlings"] }
        ],
        modifiers: ["worm tub", "meaty", "sulfury", "old school"],
        base_queries: [
            "Craigellachie whisky",
            "Craigellachie 13",
            "Craigellachie aged"
        ]
    },
    {
        name: "Tamdhu",
        variations: ["Tamdhu Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Linkwood",
        variations: ["Linkwood Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Glen Grant",
        variations: ["Glen Grant Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Glen Moray",
        variations: ["Glen Moray Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Longmorn",
        variations: ["Longmorn Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Strathisla",
        variations: ["Strathisla Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Cardhu",
        variations: ["Cardhu Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    // ========== SCOTCH - ISLAY ==========
    {
        name: "Ardbeg",
        variations: ["Ardbeg Distillery"],
        region: "Islay",
        country: "Scotland",
        type: ["single malt scotch"],
        parent_company: "LVMH",
        website: "ardbeg.com",
        priority: 9,
        product_lines: [
            { name: "Ardbeg", subcategories: ["10 Year", "5 Year Wee Beastie", "19 Year Traigh Bhan", "25 Year"] },
            { name: "Ardbeg Uigeadail", modifiers: ["sherry cask finish"] },
            { name: "Ardbeg Corryvreckan", modifiers: ["french oak"] },
            { name: "Ardbeg An Oa", modifiers: ["gathering vat"] },
            { name: "Ardbeg Scorch", modifiers: ["heavily charred casks"] },
            { name: "Ardbeg Blaaack", modifiers: ["pinot noir casks"] },
            { name: "Committee Releases", modifiers: ["Ardcore", "Hypernova", "Heavy Vapours", "BizarreBQ"] },
            { name: "Ardbeg Day Releases", modifiers: ["annual release", "limited edition"] },
            { name: "Ardbeg Supernova", modifiers: ["committee release", "heavily peated"] },
            { name: "Ardbeg Drum", modifiers: ["rum cask"] },
            { name: "Ardbeg Grooves", modifiers: ["wine cask"] },
            { name: "Ardbeg Twenty Something", subcategories: ["22 Year", "23 Year"] }
        ],
        modifiers: ["heavily peated", "committee release", "limited edition", "cask finish", "islay smoke"],
        base_queries: [
            "Ardbeg whisky",
            "Ardbeg committee",
            "Ardbeg limited edition"
        ]
    },
    {
        name: "Lagavulin",
        variations: ["Lagavulin Distillery"],
        region: "Islay",
        country: "Scotland",
        type: ["single malt scotch"],
        parent_company: "Diageo",
        website: "malts.com/lagavulin",
        priority: 9,
        product_lines: [
            { name: "Lagavulin", subcategories: ["8 Year", "9 Year Game of Thrones", "10 Year Offerman Edition", "11 Year Offerman Edition", "12 Year Special Release", "16 Year"] },
            { name: "Distillers Edition", modifiers: ["pedro ximenez finish"] },
            { name: "Special Releases", modifiers: ["annual release", "cask strength", "natural cask strength"] },
            { name: "Feis Ile", modifiers: ["festival bottling", "limited edition"] },
            { name: "Jazz Festival", modifiers: ["limited edition"] },
            { name: "200th Anniversary", modifiers: ["limited edition", "25 Year"] }
        ],
        modifiers: ["peated", "distillers edition", "special release", "pedro ximenez", "islay"],
        base_queries: [
            "Lagavulin whisky",
            "Lagavulin 16",
            "Lagavulin special release"
        ]
    },
    {
        name: "Laphroaig",
        variations: ["Laphroaig Distillery"],
        region: "Islay",
        country: "Scotland",
        type: ["single malt scotch"],
        parent_company: "Beam Suntory",
        website: "laphroaig.com",
        priority: 9,
        product_lines: [
            { name: "Laphroaig", subcategories: ["10 Year", "10 Year Cask Strength", "10 Year Sherry Oak", "16 Year", "18 Year", "25 Year", "27 Year", "30 Year", "32 Year"] },
            { name: "Laphroaig Quarter Cask", modifiers: ["smaller casks"] },
            { name: "Laphroaig Triple Wood", modifiers: ["three cask maturation"] },
            { name: "Laphroaig Four Oak", modifiers: ["four cask types"] },
            { name: "Laphroaig Lore", modifiers: ["richest ever"] },
            { name: "Laphroaig PX Cask", modifiers: ["pedro ximenez finish"] },
            { name: "Laphroaig Cairdeas", modifiers: ["annual release", "friendship bottling", "port wood", "madeira cask", "warehouse 1"] },
            { name: "Laphroaig Select", modifiers: ["five cask types"] },
            { name: "Laphroaig An Cuan Mòr", modifiers: ["travel retail"] },
            { name: "Laphroaig Brodir", modifiers: ["port wood", "travel retail"] }
        ],
        modifiers: ["heavily peated", "medicinal", "quarter cask", "cask strength", "cairdeas"],
        base_queries: [
            "Laphroaig whisky",
            "Laphroaig quarter cask",
            "Laphroaig cairdeas"
        ]
    },
    {
        name: "Bowmore",
        variations: ["Bowmore Distillery"],
        region: "Islay",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Bruichladdich",
        variations: ["Bruichladdich Distillery", "Port Charlotte", "Octomore"],
        region: "Islay",
        country: "Scotland",
        type: ["single malt scotch"],
        parent_company: "Rémy Cointreau",
        website: "bruichladdich.com",
        priority: 9,
        product_lines: [
            { name: "Bruichladdich", subcategories: ["The Classic Laddie", "Islay Barley", "Bere Barley", "Organic", "Black Art", "Redder Still"] },
            { name: "Port Charlotte", subcategories: ["10 Year", "Islay Barley", "MRC:01", "PAC:01", "PMC:01", "OLC:01"], modifiers: ["heavily peated", "40ppm"] },
            { name: "Octomore", subcategories: ["08.1", "08.2", "08.3", "08.4", "09.1", "09.2", "09.3", "10.1", "10.2", "10.3", "10.4", "11.1", "11.2", "11.3", "12.1", "12.2", "12.3", "13.1", "13.2", "13.3"], modifiers: ["super heavily peated", "100+ ppm"] },
            { name: "X4", modifiers: ["quadruple distilled", "new make spirit"] },
            { name: "Micro Provenance", modifiers: ["single cask", "cask samples"] },
            { name: "Infinity", modifiers: ["vatting of all casks"] },
            { name: "Valinch", modifiers: ["distillery exclusive", "cask strength"] }
        ],
        modifiers: ["unpeated", "heavily peated", "terroir", "progressive", "black art", "octomore"],
        base_queries: [
            "Bruichladdich whisky",
            "Port Charlotte whisky",
            "Octomore whisky"
        ]
    },
    {
        name: "Bunnahabhain",
        variations: ["Bunnahabhain Distillery"],
        region: "Islay",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Caol Ila",
        variations: ["Caol Ila Distillery"],
        region: "Islay",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Kilchoman",
        variations: ["Kilchoman Distillery"],
        region: "Islay",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Ardnahoe",
        variations: ["Ardnahoe Distillery"],
        region: "Islay",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    // ========== SCOTCH - HIGHLAND ==========
    {
        name: "Highland Park",
        variations: ["Highland Park Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Glenmorangie",
        variations: ["Glenmorangie Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Dalmore",
        variations: ["The Dalmore", "Dalmore Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Oban",
        variations: ["Oban Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "GlenGoyne",
        variations: ["Glen Goyne", "Glengoyne Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Talisker",
        variations: ["Talisker Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Clynelish",
        variations: ["Clynelish Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Tomatin",
        variations: ["Tomatin Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Balblair",
        variations: ["Balblair Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "AnCnoc",
        variations: ["An Cnoc", "anCnoc Distillery", "Knockdhu"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Ardmore",
        variations: ["Ardmore Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Royal Lochnagar",
        variations: ["Royal Lochnagar Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Fettercairn",
        variations: ["Fettercairn Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Glen Garioch",
        variations: ["Glen Garioch Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Old Pulteney",
        variations: ["Old Pulteney Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Deanston",
        variations: ["Deanston Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Aberfeldy",
        variations: ["Aberfeldy Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Blair Athol",
        variations: ["Blair Athol Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Edradour",
        variations: ["Edradour Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Glen Ord",
        variations: ["Glen Ord Distillery", "The Singleton of Glen Ord"],
        region: "Highland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    // ========== SCOTCH - CAMPBELTOWN ==========
    {
        name: "Springbank",
        variations: ["Springbank Distillery"],
        region: "Campbeltown",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Glen Scotia",
        variations: ["Glen Scotia Distillery"],
        region: "Campbeltown",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Glengyle",
        variations: ["Glengyle Distillery", "Kilkerran"],
        region: "Campbeltown",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    // ========== SCOTCH - LOWLAND ==========
    {
        name: "Auchentoshan",
        variations: ["Auchentoshan Distillery"],
        region: "Lowland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Glenkinchie",
        variations: ["Glenkinchie Distillery"],
        region: "Lowland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Bladnoch",
        variations: ["Bladnoch Distillery"],
        region: "Lowland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Daftmill",
        variations: ["Daftmill Distillery"],
        region: "Lowland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Kingsbarns",
        variations: ["Kingsbarns Distillery"],
        region: "Lowland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    {
        name: "Lindores Abbey",
        variations: ["Lindores Abbey Distillery"],
        region: "Lowland",
        country: "Scotland",
        type: ["single malt scotch"]
    },
    // ===== ADDITIONAL SPEYSIDE DISTILLERIES =====
    {
        name: "Longmorn",
        variations: ["Longmorn Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "16 Year Old", variations: ["Longmorn 16"] },
            { name: "18 Year Old", variations: ["Longmorn 18"] },
            { name: "23 Year Old", variations: ["Longmorn 23"] }
        ]
    },
    {
        name: "Strathisla",
        variations: ["Strathisla Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Strathisla 12"] },
            { name: "18 Year Old", variations: ["Strathisla 18"] },
            { name: "25 Year Old", variations: ["Strathisla 25"] }
        ]
    },
    {
        name: "Craigellachie",
        variations: ["Craigellachie Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "13 Year Old", variations: ["Craigellachie 13"] },
            { name: "17 Year Old", variations: ["Craigellachie 17"] },
            { name: "23 Year Old", variations: ["Craigellachie 23"] }
        ]
    },
    {
        name: "Dailuaine",
        variations: ["Dailuaine Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "16 Year Old", variations: ["Dailuaine 16", "Dailuaine Flora & Fauna"] },
            { name: "Special Releases", variations: ["Dailuaine Special Release"] }
        ]
    },
    {
        name: "Mortlach",
        variations: ["Mortlach Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Mortlach 12", "Mortlach Wee Witchie"] },
            { name: "16 Year Old", variations: ["Mortlach 16"] },
            { name: "20 Year Old", variations: ["Mortlach 20", "Mortlach Cowie's Blue Seal"] }
        ]
    },
    {
        name: "Benrinnes",
        variations: ["Benrinnes Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "15 Year Old", variations: ["Benrinnes 15", "Benrinnes Flora & Fauna"] },
            { name: "21 Year Old", variations: ["Benrinnes 21"] }
        ]
    },
    {
        name: "Linkwood",
        variations: ["Linkwood Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Linkwood 12", "Linkwood Flora & Fauna"] },
            { name: "15 Year Old", variations: ["Linkwood 15"] }
        ]
    },
    {
        name: "Glen Keith",
        variations: ["Glen Keith Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "21 Year Old", variations: ["Glen Keith 21"] },
            { name: "Secret Speyside", variations: ["Glen Keith Secret Speyside"] }
        ]
    },
    {
        name: "Glen Grant",
        variations: ["Glen Grant Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "10 Year Old", variations: ["Glen Grant 10"] },
            { name: "12 Year Old", variations: ["Glen Grant 12"] },
            { name: "15 Year Old", variations: ["Glen Grant 15", "Glen Grant 15 Batch Strength"] },
            { name: "18 Year Old", variations: ["Glen Grant 18", "Glen Grant 18 Rare Edition"] }
        ]
    },
    {
        name: "Strathmill",
        variations: ["Strathmill Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Strathmill 12", "Strathmill Flora & Fauna"] },
            { name: "25 Year Old", variations: ["Strathmill 25"] }
        ]
    },
    {
        name: "Speyburn",
        variations: ["Speyburn Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "10 Year Old", variations: ["Speyburn 10"] },
            { name: "15 Year Old", variations: ["Speyburn 15"] },
            { name: "18 Year Old", variations: ["Speyburn 18"] }
        ]
    },
    {
        name: "Tormore",
        variations: ["Tormore Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Tormore 12"] },
            { name: "14 Year Old", variations: ["Tormore 14"] },
            { name: "16 Year Old", variations: ["Tormore 16"] }
        ]
    },
    {
        name: "Tamdhu",
        variations: ["Tamdhu Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "10 Year Old", variations: ["Tamdhu 10"] },
            { name: "12 Year Old", variations: ["Tamdhu 12"] },
            { name: "15 Year Old", variations: ["Tamdhu 15"] },
            { name: "Batch Strength", variations: ["Tamdhu Batch Strength"] }
        ]
    },
    {
        name: "Knockando",
        variations: ["Knockando Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Knockando 12"] },
            { name: "15 Year Old", variations: ["Knockando 15"] },
            { name: "18 Year Old", variations: ["Knockando 18"] },
            { name: "21 Year Old", variations: ["Knockando 21", "Knockando Master Reserve"] }
        ]
    },
    {
        name: "Tamnavulin",
        variations: ["Tamnavulin Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Double Cask", variations: ["Tamnavulin Double Cask"] },
            { name: "Sherry Cask", variations: ["Tamnavulin Sherry Cask Edition"] }
        ]
    },
    {
        name: "Miltonduff",
        variations: ["Miltonduff Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "10 Year Old", variations: ["Miltonduff 10"] },
            { name: "15 Year Old", variations: ["Miltonduff 15"] }
        ]
    },
    {
        name: "Auchroisk",
        variations: ["Auchroisk Distillery", "The Singleton of Auchroisk"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "10 Year Old", variations: ["Auchroisk 10", "Singleton of Auchroisk 10"] },
            { name: "16 Year Old", variations: ["Auchroisk 16"] }
        ]
    },
    {
        name: "Glen Spey",
        variations: ["Glen Spey Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Glen Spey 12", "Glen Spey Flora & Fauna"] },
            { name: "18 Year Old", variations: ["Glen Spey 18"] }
        ]
    },
    // ===== ADDITIONAL HIGHLAND DISTILLERIES =====
    {
        name: "Balblair",
        variations: ["Balblair Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Balblair 12"] },
            { name: "15 Year Old", variations: ["Balblair 15"] },
            { name: "18 Year Old", variations: ["Balblair 18"] },
            { name: "25 Year Old", variations: ["Balblair 25"] }
        ]
    },
    {
        name: "Royal Brackla",
        variations: ["Royal Brackla Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Royal Brackla 12"] },
            { name: "16 Year Old", variations: ["Royal Brackla 16"] },
            { name: "21 Year Old", variations: ["Royal Brackla 21"] }
        ]
    },
    {
        name: "Pulteney",
        variations: ["Old Pulteney", "Old Pulteney Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Old Pulteney 12"] },
            { name: "15 Year Old", variations: ["Old Pulteney 15"] },
            { name: "18 Year Old", variations: ["Old Pulteney 18"] },
            { name: "21 Year Old", variations: ["Old Pulteney 21"] }
        ]
    },
    {
        name: "Ardmore",
        variations: ["Ardmore Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Legacy", variations: ["Ardmore Legacy"] },
            { name: "12 Year Old", variations: ["Ardmore 12", "Ardmore 12 Port Wood"] },
            { name: "Traditional Cask", variations: ["Ardmore Traditional", "Ardmore Traditional Cask"] }
        ]
    },
    {
        name: "Knockdhu",
        variations: ["anCnoc", "Knockdhu Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["anCnoc 12"] },
            { name: "16 Year Old", variations: ["anCnoc 16"] },
            { name: "18 Year Old", variations: ["anCnoc 18"] },
            { name: "24 Year Old", variations: ["anCnoc 24"] }
        ]
    },
    {
        name: "Royal Lochnagar",
        variations: ["Royal Lochnagar Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Royal Lochnagar 12"] },
            { name: "Selected Reserve", variations: ["Royal Lochnagar Selected Reserve"] }
        ]
    },
    {
        name: "Macduff",
        variations: ["Glen Deveron", "Macduff Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "10 Year Old", variations: ["Glen Deveron 10"] },
            { name: "16 Year Old", variations: ["Glen Deveron 16"] },
            { name: "20 Year Old", variations: ["Glen Deveron 20"] }
        ]
    },
    {
        name: "Tullibardine",
        variations: ["Tullibardine Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Sovereign", variations: ["Tullibardine Sovereign"] },
            { name: "225 Sauternes", variations: ["Tullibardine 225"] },
            { name: "228 Burgundy", variations: ["Tullibardine 228"] },
            { name: "500 Sherry", variations: ["Tullibardine 500"] }
        ]
    },
    {
        name: "Fettercairn",
        variations: ["Fettercairn Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Fettercairn 12"] },
            { name: "16 Year Old", variations: ["Fettercairn 16"] },
            { name: "22 Year Old", variations: ["Fettercairn 22"] }
        ]
    },
    // ===== ADDITIONAL ISLAY DISTILLERIES =====
    {
        name: "Bunnahabhain",
        variations: ["Bunnahabhain Distillery"],
        region: "Islay",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Bunnahabhain 12"] },
            { name: "18 Year Old", variations: ["Bunnahabhain 18"] },
            { name: "25 Year Old", variations: ["Bunnahabhain 25"] },
            { name: "Stiùireadair", variations: ["Bunnahabhain Stiuireadair"] }
        ]
    },
    {
        name: "Kilchoman",
        variations: ["Kilchoman Distillery"],
        region: "Islay",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Machir Bay", variations: ["Kilchoman Machir Bay"] },
            { name: "Sanaig", variations: ["Kilchoman Sanaig"] },
            { name: "Loch Gorm", variations: ["Kilchoman Loch Gorm"] },
            { name: "100% Islay", variations: ["Kilchoman 100% Islay"] }
        ]
    },
    // ===== ADDITIONAL CAMPBELTOWN DISTILLERIES =====
    {
        name: "Glen Scotia",
        variations: ["Glen Scotia Distillery"],
        region: "Campbeltown",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Double Cask", variations: ["Glen Scotia Double Cask"] },
            { name: "15 Year Old", variations: ["Glen Scotia 15"] },
            { name: "18 Year Old", variations: ["Glen Scotia 18"] },
            { name: "25 Year Old", variations: ["Glen Scotia 25"] },
            { name: "Victoriana", variations: ["Glen Scotia Victoriana"] }
        ]
    },
    {
        name: "Glengyle",
        variations: ["Kilkerran", "Glengyle Distillery"],
        region: "Campbeltown",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "12 Year Old", variations: ["Kilkerran 12"] },
            { name: "16 Year Old", variations: ["Kilkerran 16"] },
            { name: "8 Year Old CS", variations: ["Kilkerran 8 Cask Strength"] }
        ]
    },
    // ===== ADDITIONAL LOWLAND DISTILLERIES =====
    {
        name: "Daftmill",
        variations: ["Daftmill Distillery"],
        region: "Lowland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "2006", variations: ["Daftmill 2006"] },
            { name: "2007", variations: ["Daftmill 2007"] },
            { name: "2008", variations: ["Daftmill 2008"] },
            { name: "2009", variations: ["Daftmill 2009"] }
        ]
    },
    {
        name: "Annandale",
        variations: ["Annandale Distillery"],
        region: "Lowland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Man O'Sword", variations: ["Annandale Man O'Sword"] },
            { name: "Man O'Words", variations: ["Annandale Man O'Words"] }
        ]
    },
    {
        name: "Bladnoch",
        variations: ["Bladnoch Distillery"],
        region: "Lowland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "10 Year Old", variations: ["Bladnoch 10"] },
            { name: "11 Year Old", variations: ["Bladnoch 11"] },
            { name: "14 Year Old", variations: ["Bladnoch 14"] },
            { name: "Vinaya", variations: ["Bladnoch Vinaya"] }
        ]
    },
    // ========== IRISH WHISKEY ==========
    {
        name: "Jameson",
        variations: ["Jameson Distillery", "Midleton Distillery"],
        region: "Cork",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Bushmills",
        variations: ["Old Bushmills", "Bushmills Distillery"],
        region: "Antrim",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Teeling",
        variations: ["Teeling Distillery", "Teeling Whiskey"],
        region: "Dublin",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Redbreast",
        variations: ["Redbreast Whiskey", "Midleton"],
        region: "Cork",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Green Spot",
        variations: ["Spot Whiskey", "Mitchell & Son"],
        region: "Cork",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Powers",
        variations: ["Powers Whiskey", "John Power & Son"],
        region: "Cork",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Tullamore DEW",
        variations: ["Tullamore Dew", "Tullamore Distillery"],
        region: "Offaly",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Kilbeggan",
        variations: ["Kilbeggan Distillery", "Cooley"],
        region: "Westmeath",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Dingle",
        variations: ["Dingle Distillery", "Dingle Whiskey"],
        region: "Kerry",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Waterford",
        variations: ["Waterford Distillery", "Waterford Whisky"],
        region: "Waterford",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Killowen",
        variations: ["Killowen Distillery"],
        region: "Down",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Clonakilty",
        variations: ["Clonakilty Distillery"],
        region: "Cork",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Slane",
        variations: ["Slane Distillery", "Slane Castle"],
        region: "Meath",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Roe & Co",
        variations: ["Roe & Co Distillery", "George Roe"],
        region: "Dublin",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Blackwater",
        variations: ["Blackwater Distillery"],
        region: "Waterford",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Glendalough",
        variations: ["Glendalough Distillery"],
        region: "Wicklow",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Double Barrel", variations: ["Glendalough Double Barrel"] },
            { name: "7 Year Old", variations: ["Glendalough 7"] },
            { name: "13 Year Old", variations: ["Glendalough 13"] },
            { name: "17 Year Old", variations: ["Glendalough 17"] }
        ]
    },
    {
        name: "Great Northern",
        variations: ["Great Northern Distillery"],
        region: "Louth",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Two Stacks", variations: ["Two Stacks Irish Whiskey"] },
            { name: "Sliabh Liag", variations: ["Sliabh Liag Distillers"] }
        ]
    },
    {
        name: "Pearse Lyons",
        variations: ["Pearse Lyons Distillery"],
        region: "Dublin",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Pearse Original", variations: ["Pearse Irish Whiskey"] },
            { name: "Pearse Founder's Choice", variations: ["Pearse Founders Choice"] }
        ]
    },
    {
        name: "Tipperary Boutique",
        variations: ["Tipperary Boutique Distillery"],
        region: "Tipperary",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Tipperary Single Malt", variations: ["Tipperary Watershed"] },
            { name: "Knockmealdowns", variations: ["Knockmealdowns Irish Whiskey"] }
        ]
    },
    {
        name: "Boann",
        variations: ["Boann Distillery"],
        region: "Meath",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "The Whistler", variations: ["The Whistler Irish Whiskey"] },
            { name: "Silks", variations: ["Silks Irish Whiskey"] }
        ]
    },
    {
        name: "Royal Oak",
        variations: ["Royal Oak Distillery"],
        region: "Carlow",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Glendalough", variations: ["Royal Oak Glendalough"] }
        ]
    },
    {
        name: "Lough Ree",
        variations: ["Lough Ree Distillery"],
        region: "Longford",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Sling Shot", variations: ["Sling Shot Irish Whiskey"] },
            { name: "Bart's", variations: ["Bart's Irish Whiskey"] }
        ]
    },
    {
        name: "Powerscourt",
        variations: ["Powerscourt Distillery"],
        region: "Wicklow",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Fercullen", variations: ["Fercullen Irish Whiskey"] }
        ]
    },
    {
        name: "Copeland",
        variations: ["Copeland Distillery"],
        region: "Down",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Merchant's Quay", variations: ["Merchants Quay"] }
        ]
    },
    {
        name: "Dublin Liberties",
        variations: ["Dublin Liberties Distillery", "Quintessential Brands"],
        region: "Dublin",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "The Dubliner", variations: ["The Dubliner Irish Whiskey"] },
            { name: "Dublin Liberties", variations: ["Dublin Liberties Whiskey"] }
        ]
    },
    {
        name: "Nephin",
        variations: ["Nephin Whiskey"],
        region: "Mayo",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Kilbeggan Small Batch",
        variations: ["Kilbeggan Distilling Company"],
        region: "Westmeath",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Small Batch Rye", variations: ["Kilbeggan Small Batch Rye"] },
            { name: "21 Year Old", variations: ["Kilbeggan 21"] }
        ]
    },
    {
        name: "Echlinville",
        variations: ["Echlinville Distillery"],
        region: "Down",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Dunville's", variations: ["Dunvilles Irish Whiskey"] },
            { name: "Feckin", variations: ["Feckin Irish Whiskey"] }
        ]
    },
    {
        name: "West Cork",
        variations: ["West Cork Distillers"],
        region: "Cork",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Glengarriff Series", variations: ["West Cork Glengarriff"] },
            { name: "Single Malt", variations: ["West Cork Single Malt"] },
            { name: "Black Cask", variations: ["West Cork Black Cask"] }
        ]
    },
    {
        name: "Connacht",
        variations: ["Connacht Whiskey Company"],
        region: "Mayo",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Ballyhoo", variations: ["Ballyhoo Irish Whiskey"] }
        ]
    },
    {
        name: "Rademon Estate",
        variations: ["Rademon Estate Distillery"],
        region: "Down",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Shortcross", variations: ["Shortcross Gin and Whiskey"] }
        ]
    },
    {
        name: "Ballykeefe",
        variations: ["Ballykeefe Distillery"],
        region: "Kilkenny",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Gortinore",
        variations: ["Gortinore Distillers & Co"],
        region: "Tyrone",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Burren",
        variations: ["Burren Whiskey"],
        region: "Clare",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "Hinch",
        variations: ["Hinch Distillery"],
        region: "Down",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Double Wood", variations: ["Hinch Double Wood"] },
            { name: "10 Year Old", variations: ["Hinch 10"] }
        ]
    },
    // ========== JAPANESE WHISKY ==========
    {
        name: "Suntory Yamazaki",
        variations: ["Yamazaki", "Yamazaki Distillery"],
        region: "Osaka",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Suntory Hakushu",
        variations: ["Hakushu", "Hakushu Distillery"],
        region: "Yamanashi",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Nikka Yoichi",
        variations: ["Yoichi", "Yoichi Distillery"],
        region: "Hokkaido",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Nikka Miyagikyo",
        variations: ["Miyagikyo", "Miyagikyo Distillery", "Sendai"],
        region: "Miyagi",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Chichibu",
        variations: ["Chichibu Distillery", "Ichiro's Malt"],
        region: "Saitama",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Mars Shinshu",
        variations: ["Mars Whisky", "Shinshu Distillery"],
        region: "Nagano",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Akkeshi",
        variations: ["Akkeshi Distillery"],
        region: "Hokkaido",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Fuji Gotemba",
        variations: ["Kirin Fuji", "Fuji Gotemba Distillery"],
        region: "Shizuoka",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Kanosuke",
        variations: ["Kanosuke Distillery"],
        region: "Kagoshima",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Sakurao",
        variations: ["Sakurao Distillery"],
        region: "Hiroshima",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Shizuoka",
        variations: ["Shizuoka Distillery", "Gaia Flow"],
        region: "Shizuoka",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Nagahama",
        variations: ["Nagahama Distillery"],
        region: "Shiga",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Asaka",
        variations: ["Asaka Distillery", "Sasanokawa Shuzo"],
        region: "Fukushima",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Asaka The First", variations: ["Asaka First Edition"] }
        ]
    },
    {
        name: "Okayama",
        variations: ["Okayama Distillery", "Miyashita Shuzo"],
        region: "Okayama",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Single Malt Okayama", variations: ["Okayama Single Malt"] }
        ]
    },
    {
        name: "Saburomaru",
        variations: ["Saburomaru Distillery", "Wakatsuru Shuzo"],
        region: "Toyama",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Saburomaru 1960", variations: ["Saburomaru Distillery 1960"] }
        ]
    },
    {
        name: "Yuza",
        variations: ["Yuza Distillery", "Kinryu"],
        region: "Yamagata",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Komasa",
        variations: ["Komasa Jyozo", "Komasa Distillery"],
        region: "Kagoshima",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Kozuru", variations: ["Komasa Kozuru"] }
        ]
    },
    {
        name: "Kurayoshi",
        variations: ["Matsui Whisky", "Kurayoshi Distillery"],
        region: "Tottori",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Kurayoshi Pure Malt", variations: ["The Kurayoshi"] },
            { name: "Kurayoshi Sherry Cask", variations: ["The Kurayoshi Sherry"] }
        ]
    },
    {
        name: "Tsunuki",
        variations: ["Tsunuki Distillery", "Hombo Shuzo"],
        region: "Kagoshima",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Tsunuki The First", variations: ["Tsunuki First Edition"] }
        ]
    },
    {
        name: "Kaikyo",
        variations: ["Kaikyo Distillery"],
        region: "Hyogo",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Hatozaki", variations: ["Hatozaki Whisky"] }
        ]
    },
    {
        name: "Eigashima",
        variations: ["White Oak Distillery", "Eigashima Shuzo"],
        region: "Hyogo",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Akashi", variations: ["Akashi Whisky", "White Oak Akashi"] },
            { name: "Tokinoka", variations: ["White Oak Tokinoka"] }
        ]
    },
    {
        name: "Kagoshima",
        variations: ["Kagoshima Distillery", "Komasa Gin"],
        region: "Kagoshima",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Kiuchi",
        variations: ["Kiuchi Brewery", "Hitachino"],
        region: "Ibaraki",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Hitachino Nest", variations: ["Hitachino Nest Whisky"] }
        ]
    },
    {
        name: "Wakatsuru",
        variations: ["Wakatsuru Shuzo", "Sunshine Whisky"],
        region: "Toyama",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Sunshine", variations: ["Sunshine Whisky"] }
        ]
    },
    {
        name: "Helios",
        variations: ["Helios Distillery"],
        region: "Okinawa",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Kura", variations: ["Kura The Whisky"] },
            { name: "Reki", variations: ["Helios Reki"] }
        ]
    },
    {
        name: "Numazu",
        variations: ["Numazu Distillery", "Monde Shuzo"],
        region: "Shizuoka",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Three Rivers",
        variations: ["Dekanta Spirits", "Three Rivers Distillery"],
        region: "Gifu",
        country: "Japan",
        type: ["japanese whisky"]
    },
    {
        name: "Gaiaflow",
        variations: ["Gaiaflow Distilling", "Shizuoka Distillery"],
        region: "Shizuoka",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Shizuoka", variations: ["Shizuoka Single Malt"] }
        ]
    },
    {
        name: "Komagatake",
        variations: ["Mars Komagatake", "Hombo Mars"],
        region: "Nagano",
        country: "Japan",
        type: ["japanese whisky"],
        product_lines: [
            { name: "Komagatake", variations: ["Mars Komagatake"] }
        ]
    },
    // ========== CANADIAN WHISKY ==========
    {
        name: "Crown Royal",
        variations: ["Crown Royal Distillery", "Gimli"],
        region: "Manitoba",
        country: "Canada",
        type: ["canadian whisky"]
    },
    {
        name: "Canadian Club",
        variations: ["Hiram Walker", "Canadian Club Distillery"],
        region: "Ontario",
        country: "Canada",
        type: ["canadian whisky"]
    },
    {
        name: "Forty Creek",
        variations: ["Forty Creek Distillery"],
        region: "Ontario",
        country: "Canada",
        type: ["canadian whisky"]
    },
    {
        name: "Alberta Distillers",
        variations: ["Alberta Premium", "Alberta Distillery"],
        region: "Alberta",
        country: "Canada",
        type: ["canadian whisky", "rye"]
    },
    {
        name: "Lot No. 40",
        variations: ["Lot 40", "Corby Distillery"],
        region: "Ontario",
        country: "Canada",
        type: ["canadian whisky", "rye"]
    },
    {
        name: "Shelter Point",
        variations: ["Shelter Point Distillery"],
        region: "British Columbia",
        country: "Canada",
        type: ["canadian whisky"]
    },
    {
        name: "Glenora",
        variations: ["Glenora Distillery", "Glen Breton"],
        region: "Nova Scotia",
        country: "Canada",
        type: ["canadian whisky"]
    },
    // ========== OTHER WORLD WHISKIES ==========
    {
        name: "Starward",
        variations: ["Starward Distillery", "Starward Whisky"],
        region: "Victoria",
        country: "Australia",
        type: ["australian whisky"]
    },
    {
        name: "Sullivan's Cove",
        variations: ["Sullivan's Cove Distillery", "Sullivans Cove"],
        region: "Tasmania",
        country: "Australia",
        type: ["australian whisky"]
    },
    {
        name: "Lark",
        variations: ["Lark Distillery", "Lark Distilling"],
        region: "Tasmania",
        country: "Australia",
        type: ["australian whisky"]
    },
    {
        name: "Overeem",
        variations: ["Overeem Distillery", "Old Hobart"],
        region: "Tasmania",
        country: "Australia",
        type: ["australian whisky"]
    },
    {
        name: "Hellyers Road",
        variations: ["Hellyers Road Distillery"],
        region: "Tasmania",
        country: "Australia",
        type: ["australian whisky"]
    },
    {
        name: "Nant",
        variations: ["Nant Distillery", "Nant Estate"],
        region: "Tasmania",
        country: "Australia",
        type: ["australian whisky"]
    },
    {
        name: "Kavalan",
        variations: ["Kavalan Distillery", "King Car"],
        region: "Yilan",
        country: "Taiwan",
        type: ["taiwanese whisky"]
    },
    {
        name: "Amrut",
        variations: ["Amrut Distillery", "Amrut Distilleries"],
        region: "Bangalore",
        country: "India",
        type: ["indian whisky"]
    },
    {
        name: "Paul John",
        variations: ["Paul John Distillery", "John Distilleries"],
        region: "Goa",
        country: "India",
        type: ["indian whisky"]
    },
    {
        name: "Rampur",
        variations: ["Rampur Distillery", "Radico Khaitan"],
        region: "Uttar Pradesh",
        country: "India",
        type: ["indian whisky"]
    },
    {
        name: "Three Ships",
        variations: ["Three Ships Distillery", "James Sedgwick"],
        region: "Wellington",
        country: "South Africa",
        type: ["south african whisky"]
    },
    {
        name: "Bain's",
        variations: ["Bain's Cape Mountain", "James Sedgwick Distillery"],
        region: "Wellington",
        country: "South Africa",
        type: ["south african whisky"]
    },
    {
        name: "Penderyn",
        variations: ["Penderyn Distillery", "Welsh Whisky Company"],
        region: "Brecon Beacons",
        country: "Wales",
        type: ["welsh whisky"]
    },
    {
        name: "The English Whisky",
        variations: ["St. George's Distillery", "English Whisky Company"],
        region: "Norfolk",
        country: "England",
        type: ["english whisky"]
    },
    {
        name: "Cotswolds",
        variations: ["Cotswolds Distillery"],
        region: "Cotswolds",
        country: "England",
        type: ["english whisky"]
    },
    {
        name: "Bimber",
        variations: ["Bimber Distillery"],
        region: "London",
        country: "England",
        type: ["english whisky"]
    },
    {
        name: "Mackmyra",
        variations: ["Mackmyra Distillery"],
        region: "Gavle",
        country: "Sweden",
        type: ["swedish whisky"]
    },
    {
        name: "Box",
        variations: ["Box Distillery", "High Coast Distillery"],
        region: "Ångermanland",
        country: "Sweden",
        type: ["swedish whisky"]
    },
    {
        name: "Stauning",
        variations: ["Stauning Distillery", "Stauning Whisky"],
        region: "Jutland",
        country: "Denmark",
        type: ["danish whisky"]
    },
    {
        name: "Kyrö",
        variations: ["Kyrö Distillery", "Kyro"],
        region: "Isokyrö",
        country: "Finland",
        type: ["finnish whisky", "rye"]
    },
    {
        name: "Teerenpeli",
        variations: ["Teerenpeli Distillery"],
        region: "Lahti",
        country: "Finland",
        type: ["finnish whisky"]
    },
    // ===== MORE WORLD WHISKY =====
    {
        name: "Starward",
        variations: ["Starward Distillery", "Starward Whisky"],
        region: "Melbourne",
        country: "Australia",
        type: ["australian whisky"],
        product_lines: [
            { name: "Nova", variations: ["Starward Nova"] },
            { name: "Solera", variations: ["Starward Solera"] },
            { name: "Fortis", variations: ["Starward Fortis"] }
        ]
    },
    {
        name: "Sullivan's Cove",
        variations: ["Sullivan's Cove Distillery"],
        region: "Tasmania",
        country: "Australia",
        type: ["australian whisky"],
        product_lines: [
            { name: "Double Cask", variations: ["Sullivan's Cove Double Cask"] },
            { name: "American Oak", variations: ["Sullivan's Cove American Oak"] },
            { name: "French Oak", variations: ["Sullivan's Cove French Oak"] }
        ]
    },
    {
        name: "Bakery Hill",
        variations: ["Bakery Hill Distillery"],
        region: "Victoria",
        country: "Australia",
        type: ["australian whisky"],
        product_lines: [
            { name: "Classic", variations: ["Bakery Hill Classic"] },
            { name: "Peated", variations: ["Bakery Hill Peated Malt"] }
        ]
    },
    {
        name: "New World Whisky",
        variations: ["New World Distillery"],
        region: "Melbourne",
        country: "Australia",
        type: ["australian whisky"]
    },
    {
        name: "Archie Rose",
        variations: ["Archie Rose Distilling"],
        region: "Sydney",
        country: "Australia",
        type: ["australian whisky", "rye whisky"],
        product_lines: [
            { name: "Single Malt", variations: ["Archie Rose Single Malt"] },
            { name: "Rye Malt", variations: ["Archie Rose Rye Malt Whisky"] }
        ]
    },
    {
        name: "Nantou",
        variations: ["Nantou Distillery", "Taiwan Tobacco & Liquor"],
        region: "Nantou",
        country: "Taiwan",
        type: ["taiwanese whisky"],
        product_lines: [
            { name: "Omar", variations: ["Omar Single Malt", "Omar Sherry Cask"] }
        ]
    },
    {
        name: "Yushan",
        variations: ["Yushan Distillery"],
        region: "Chiayi",
        country: "Taiwan",
        type: ["taiwanese whisky"]
    },
    {
        name: "Godawan",
        variations: ["Diageo India"],
        region: "Rajasthan",
        country: "India",
        type: ["indian whisky"]
    },
    {
        name: "Kamet",
        variations: ["Piccadily Distilleries"],
        region: "Indri",
        country: "India",
        type: ["indian whisky"]
    },
    {
        name: "Indri",
        variations: ["Piccadily Agro", "Indri Single Malt"],
        region: "Haryana",
        country: "India",
        type: ["indian whisky"],
        product_lines: [
            { name: "Trini", variations: ["Indri Trini"] },
            { name: "Dru", variations: ["Indri Dru"] }
        ]
    },
    {
        name: "Latitude 22",
        variations: ["22 Degree North"],
        region: "Goa",
        country: "India",
        type: ["indian whisky"]
    },
    {
        name: "Woodburn",
        variations: ["Fullarton Distilleries"],
        region: "Goa",
        country: "India",
        type: ["indian whisky"]
    },
    {
        name: "Copper Republic",
        variations: ["Copper Republic Distillery"],
        region: "Johannesburg",
        country: "South Africa",
        type: ["south african whisky"]
    },
    {
        name: "Drayman's",
        variations: ["Drayman's Distillery"],
        region: "Pretoria",
        country: "South Africa",
        type: ["south african whisky"]
    },
    {
        name: "Distell",
        variations: ["Distell Group"],
        region: "Stellenbosch",
        country: "South Africa",
        type: ["south african whisky"]
    },
    {
        name: "Milk & Honey",
        variations: ["M&H Distillery"],
        region: "Tel Aviv",
        country: "Israel",
        type: ["israeli whisky"],
        product_lines: [
            { name: "Classic", variations: ["M&H Classic"] },
            { name: "Elements", variations: ["M&H Elements Series"] }
        ]
    },
    {
        name: "Golan Heights",
        variations: ["Golan Heights Distillery"],
        region: "Katzrin",
        country: "Israel",
        type: ["israeli whisky"],
        product_lines: [
            { name: "Golani", variations: ["Golani Whisky"] }
        ]
    },
    {
        name: "Teeling",
        variations: ["Cooley Distillery"],
        region: "Dublin",
        country: "Ireland",
        type: ["irish whiskey"]
    },
    {
        name: "The Shed",
        variations: ["Shed Distillery"],
        region: "Leitrim",
        country: "Ireland",
        type: ["irish whiskey"],
        product_lines: [
            { name: "Drumshanbo", variations: ["Drumshanbo Single Pot Still"] }
        ]
    },
    {
        name: "Dornoch",
        variations: ["Dornoch Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Thompson Bros", variations: ["Thompson Brothers"] }
        ]
    },
    {
        name: "Ardnamurchan",
        variations: ["Ardnamurchan Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "AD/", variations: ["Ardnamurchan AD/01", "Ardnamurchan AD/02"] }
        ]
    },
    {
        name: "Torabhaig",
        variations: ["Torabhaig Distillery"],
        region: "Skye",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Legacy", variations: ["Torabhaig Legacy Series"] },
            { name: "Allt Gleann", variations: ["Torabhaig Allt Gleann"] }
        ]
    },
    {
        name: "Raasay",
        variations: ["Isle of Raasay Distillery"],
        region: "Raasay",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "While We Wait", variations: ["Raasay While We Wait"] },
            { name: "Inaugural Release", variations: ["Raasay Inaugural"] }
        ]
    },
    {
        name: "Nc'nean",
        variations: ["Nc'nean Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Organic", variations: ["Nc'nean Organic Single Malt"] },
            { name: "Ainnir", variations: ["Nc'nean Ainnir"] }
        ]
    },
    {
        name: "Lagg",
        variations: ["Lagg Distillery"],
        region: "Arran",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Kilmory", variations: ["Lagg Kilmory"] },
            { name: "Corriecravie", variations: ["Lagg Corriecravie"] }
        ]
    },
    {
        name: "Wolfburn",
        variations: ["Wolfburn Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Northland", variations: ["Wolfburn Northland"] },
            { name: "Aurora", variations: ["Wolfburn Aurora"] }
        ]
    },
    {
        name: "Toulvaddie",
        variations: ["Toulvaddie Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"]
    },
    {
        name: "Eight Lands",
        variations: ["Eight Lands Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Organic", variations: ["Eight Lands Organic Vodka"] }
        ]
    },
    {
        name: "Borders",
        variations: ["The Borders Distillery"],
        region: "Lowland",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Lower East Side", variations: ["Borders Lower East Side"] }
        ]
    },
    {
        name: "Clydeside",
        variations: ["Clydeside Distillery"],
        region: "Glasgow",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "Stobcross", variations: ["Clydeside Stobcross"] }
        ]
    },
    {
        name: "Glasgow",
        variations: ["Glasgow Distillery Company"],
        region: "Glasgow",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "1770", variations: ["1770 Glasgow Single Malt"] }
        ]
    },
    {
        name: "Eden Mill",
        variations: ["Eden Mill Distillery"],
        region: "St Andrews",
        country: "Scotland",
        type: ["scotch"],
        product_lines: [
            { name: "2018 Release", variations: ["Eden Mill First Release"] }
        ]
    },
    {
        name: "Strathearn",
        variations: ["Strathearn Distillery"],
        region: "Highland",
        country: "Scotland",
        type: ["scotch"]
    },
    {
        name: "Ballindalloch",
        variations: ["Ballindalloch Distillery"],
        region: "Speyside",
        country: "Scotland",
        type: ["scotch"]
    },
    {
        name: "Lone Wolf",
        variations: ["BrewDog Distillery"],
        region: "Aberdeenshire",
        country: "Scotland",
        type: ["scotch"]
    },
    // ========== TEQUILA DISTILLERIES ==========
    {
        name: "Patrón",
        variations: ["Patron Tequila", "Patrón Spirits", "Hacienda Patron"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Bacardi Limited",
        website: "patrontequila.com",
        priority: 9,
        product_lines: [
            { name: "Patrón Silver", modifiers: ["blanco", "unaged"] },
            { name: "Patrón Reposado", modifiers: ["aged 2-4 months"] },
            { name: "Patrón Añejo", modifiers: ["aged 12-14 months"] },
            { name: "Patrón Extra Añejo", modifiers: ["aged 3+ years"] },
            { name: "Gran Patrón", subcategories: ["Platinum", "Piedra", "Burdeos", "Smoky"] },
            { name: "Patrón El Cielo", modifiers: ["silver", "small batch"] },
            { name: "Patrón Barrel Select", modifiers: ["cask finished", "limited edition"] },
            { name: "Patrón En Lalique", subcategories: ["Serie 1", "Serie 2", "Serie 3"] },
            { name: "Roca Patrón", subcategories: ["Silver", "Reposado", "Añejo"] },
            { name: "Patrón Cask Collection", modifiers: ["sherry cask", "french oak"] }
        ],
        modifiers: ["100% agave", "tahona", "handcrafted", "premium tequila"],
        base_queries: [
            "Patron tequila",
            "Gran Patron",
            "Patron limited edition"
        ]
    },
    {
        name: "Don Julio",
        variations: ["Don Julio González", "Don Julio Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Diageo",
        website: "donjulio.com",
        priority: 9,
        product_lines: [
            { name: "Don Julio Blanco", modifiers: ["silver", "unaged"] },
            { name: "Don Julio Reposado", modifiers: ["aged 8 months"] },
            { name: "Don Julio Añejo", modifiers: ["aged 18 months"] },
            { name: "Don Julio 70", modifiers: ["cristalino", "añejo claro"] },
            { name: "Don Julio 1942", modifiers: ["extra añejo", "aged 2.5 years"] },
            { name: "Don Julio Real", modifiers: ["extra añejo", "aged 3-5 years"] },
            { name: "Don Julio Primavera", modifiers: ["reposado", "wine cask finish"] },
            { name: "Don Julio Ultima Reserva", modifiers: ["extra añejo", "solera method"] },
            { name: "Don Julio Rosado", modifiers: ["reposado", "ruby port casks"] },
            { name: "Don Julio Lagavulin", modifiers: ["limited edition", "cask finish"] }
        ],
        modifiers: ["100% blue agave", "highland agave", "luxury tequila"],
        base_queries: [
            "Don Julio tequila",
            "Don Julio 1942",
            "Don Julio limited edition"
        ]
    },
    {
        name: "Herradura",
        variations: ["Casa Herradura", "Herradura Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Brown-Forman",
        website: "herradura.com",
        priority: 8,
        product_lines: [
            { name: "Herradura Silver", modifiers: ["blanco", "aged 45 days"] },
            { name: "Herradura Reposado", modifiers: ["aged 11 months"] },
            { name: "Herradura Añejo", modifiers: ["aged 25 months"] },
            { name: "Herradura Ultra", modifiers: ["cristalino", "añejo filtrado"] },
            { name: "Herradura Legend", modifiers: ["añejo", "grooved barrels"] },
            { name: "Herradura Selección Suprema", modifiers: ["extra añejo", "aged 49 months"] },
            { name: "Herradura Double Barrel", modifiers: ["reposado", "port cask finish"] },
            { name: "Herradura Colección de la Casa", modifiers: ["limited edition", "estate reserve"] },
            { name: "Port Cask Finished", modifiers: ["reposado", "limited edition"] },
            { name: "Cognac Cask Finished", modifiers: ["añejo", "limited edition"] }
        ],
        modifiers: ["estate grown", "100% agave", "traditional production"],
        base_queries: [
            "Herradura tequila",
            "Herradura Seleccion Suprema",
            "Herradura limited edition"
        ]
    },
    {
        name: "Clase Azul",
        variations: ["Clase Azul Spirits", "Clase Azul México"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila", "mezcal"],
        website: "claseazul.com",
        priority: 9,
        product_lines: [
            { name: "Clase Azul Plata", modifiers: ["silver", "unaged"] },
            { name: "Clase Azul Reposado", modifiers: ["aged 8 months", "signature bottle"] },
            { name: "Clase Azul Añejo", modifiers: ["aged 25 months", "ultra-premium"] },
            { name: "Clase Azul Ultra", modifiers: ["extra añejo", "aged 5 years", "platinum decanter"] },
            { name: "Clase Azul Gold", modifiers: ["joven", "blend", "24K gold"] },
            { name: "Clase Azul Día de Muertos", modifiers: ["limited edition", "annual release"] },
            { name: "Clase Azul Master Artisans", modifiers: ["limited edition series"] },
            { name: "Clase Azul 25th Anniversary", modifiers: ["extra añejo", "limited edition"] },
            { name: "Clase Azul Mezcal", subcategories: ["Durango", "Guerrero", "San Luis Potosí"] }
        ],
        modifiers: ["handcrafted bottle", "ultra-premium", "artisanal", "ceramic decanter"],
        base_queries: [
            "Clase Azul tequila",
            "Clase Azul Ultra",
            "Clase Azul limited edition"
        ]
    },
    {
        name: "Casamigos",
        variations: ["Casamigos Tequila", "Casamigos Spirits"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila", "mezcal"],
        parent_company: "Diageo",
        website: "casamigos.com",
        priority: 8,
        product_lines: [
            { name: "Casamigos Blanco", modifiers: ["silver", "crisp", "clean"] },
            { name: "Casamigos Reposado", modifiers: ["aged 7 months", "caramel notes"] },
            { name: "Casamigos Añejo", modifiers: ["aged 14 months", "american oak"] },
            { name: "Casamigos Cristalino", modifiers: ["reposado cristalino", "charcoal filtered"] },
            { name: "Casamigos Mezcal", modifiers: ["joven", "100% espadín"] },
            { name: "Casamigos Jalapeño", modifiers: ["flavored", "limited release"] }
        ],
        modifiers: ["small batch", "celebrity owned", "100% blue weber agave"],
        base_queries: [
            "Casamigos tequila",
            "Casamigos George Clooney",
            "Casamigos mezcal"
        ]
    },
    // ========== MEZCAL PRODUCERS ==========
    {
        name: "Del Maguey",
        variations: ["Del Maguey Single Village Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "delmaguey.com",
        priority: 9,
        product_lines: [
            { name: "Vida", modifiers: ["entry level", "cocktail mezcal"] },
            { name: "Vida de Muertos", modifiers: ["limited edition", "day of the dead"] },
            { name: "Single Village", subcategories: ["Chichicapa", "San Luis del Rio", "Santo Domingo Albarradas", "Tobala", "Pechuga", "Arroqueño", "Madrecuixe", "Barril", "Mexicano"] },
            { name: "Vino de Mezcal", modifiers: ["limited edition", "vintage"] },
            { name: "Ibérico", modifiers: ["pechuga", "jamón ibérico"] }
        ],
        modifiers: ["single village", "artisanal", "Ron Cooper", "traditional production"],
        base_queries: [
            "Del Maguey mezcal",
            "Del Maguey single village",
            "Del Maguey Pechuga"
        ]
    },
    {
        name: "Ilegal Mezcal",
        variations: ["Ilegal", "Mezcal Ilegal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "ilegalmezcal.com",
        priority: 8,
        product_lines: [
            { name: "Ilegal Joven", modifiers: ["unaged", "espadín"] },
            { name: "Ilegal Reposado", modifiers: ["aged 4 months", "american oak"] },
            { name: "Ilegal Añejo", modifiers: ["aged 13 months", "french oak"] },
            { name: "Ilegal Caribbean Cask", modifiers: ["rum cask finish", "limited edition"] }
        ],
        modifiers: ["small batch", "handcrafted", "outlaw brand"],
        base_queries: [
            "Ilegal mezcal",
            "Mezcal Ilegal",
            "Ilegal añejo"
        ]
    }
];
// Helper function to get all distillery names including variations
export function getAllDistilleryNames() {
    const names = [];
    DISTILLERIES.forEach(distillery => {
        names.push(distillery.name);
        names.push(...distillery.variations);
    });
    return [...new Set(names)]; // Remove duplicates
}
// Helper function to get distilleries by type
export function getDistilleriesByType(type) {
    return DISTILLERIES.filter(d => d.type.includes(type.toLowerCase()));
}
// Helper function to get distilleries by country
export function getDistilleriesByCountry(country) {
    return DISTILLERIES.filter(d => d.country.toLowerCase() === country.toLowerCase());
}
// Helper function to get distilleries by region
export function getDistilleriesByRegion(region) {
    return DISTILLERIES.filter(d => d.region.toLowerCase() === region.toLowerCase());
}
// Helper function to get a random selection of distilleries
export function getRandomDistilleries(count) {
    const shuffled = [...DISTILLERIES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
// Helper function to find a distillery by name (including variations)
export function findDistillery(name) {
    const normalizedName = name.toLowerCase().trim();
    return DISTILLERIES.find(d => d.name.toLowerCase() === normalizedName ||
        d.variations.some(v => v.toLowerCase() === normalizedName));
}
// Export all distilleries combined
export const ALL_DISTILLERIES = [
    ...DISTILLERIES,
    ...ALL_TEQUILA_PRODUCERS,
    ...ALL_MEZCAL_PRODUCERS,
    ...ALL_RUM_DISTILLERIES,
    ...ALL_BOURBON_DISTILLERIES,
    ...ALL_AMERICAN_CRAFT_DISTILLERIES,
    ...ALL_GIN_DISTILLERIES,
    ...ALL_VODKA_DISTILLERIES,
    ...ALL_COGNAC_BRANDY_DISTILLERIES
];
