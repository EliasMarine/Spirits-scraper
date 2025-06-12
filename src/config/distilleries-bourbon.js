export const BOURBON_DISTILLERIES = [
    // Kentucky - Major Producers
    {
        name: "Angel's Envy",
        variations: ["Angels Envy", "Angel's Envy Distillery"],
        region: "Louisville",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        parent_company: "Bacardi Limited",
        website: "angelsenvy.com",
        priority: 8,
        product_lines: [
            { name: "Angel's Envy", subcategories: ["Kentucky Straight Bourbon", "Port Finish"] },
            { name: "Angel's Envy Cask Strength", subcategories: [] },
            { name: "Angel's Envy Rye", subcategories: ["Rum Finish"] },
            { name: "Angel's Envy Private Selection", subcategories: [] }
        ],
        modifiers: ["port cask finish", "Lincoln Henderson", "Louisville distillery"],
        base_queries: ["Angel's Envy bourbon", "Angels Envy whiskey"]
    },
    {
        name: "Bardstown Bourbon Company",
        variations: ["Bardstown Bourbon Co", "BBC"],
        region: "Bardstown",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "bardstownbourbon.com",
        priority: 8,
        product_lines: [
            { name: "Bardstown Bourbon", subcategories: ["Fusion Series", "Discovery Series", "Origin Series"] },
            { name: "Château de Laubade", subcategories: [] },
            { name: "Ferrand Cognac", subcategories: [] },
            { name: "Prisoner Wine Company", subcategories: [] }
        ],
        modifiers: ["modern distillery", "collaborative distilling", "custom whiskey"],
        base_queries: ["Bardstown Bourbon Company", "BBC whiskey"]
    },
    {
        name: "Rabbit Hole",
        variations: ["Rabbit Hole Distillery", "Rabbit Hole Whiskey"],
        region: "Louisville",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        parent_company: "Pernod Ricard",
        website: "rabbitholedistillery.com",
        priority: 7,
        product_lines: [
            { name: "Dareringer", subcategories: ["Straight Bourbon", "Sherry Cask"] },
            { name: "Heigold", subcategories: ["High Rye Bourbon"] },
            { name: "Cavehill", subcategories: ["Four Grain Bourbon"] },
            { name: "Boxergrail", subcategories: ["Rye Whiskey"] }
        ],
        modifiers: ["modern distillery", "urban distillery", "innovative mash bills"],
        base_queries: ["Rabbit Hole bourbon", "Rabbit Hole distillery"]
    },
    {
        name: "Michter's",
        variations: ["Michters", "Michter's Distillery"],
        region: "Louisville",
        country: "USA",
        type: ["bourbon", "rye whiskey", "american whiskey"],
        website: "michters.com",
        priority: 9,
        product_lines: [
            { name: "Michter's US*1", subcategories: ["Bourbon", "Rye", "Sour Mash", "American Whiskey"] },
            { name: "Michter's Toasted Barrel", subcategories: ["Bourbon", "Rye", "Sour Mash"] },
            { name: "Michter's 10 Year", subcategories: ["Bourbon", "Rye"] },
            { name: "Michter's 20 Year", subcategories: ["Bourbon"] },
            { name: "Michter's 25 Year", subcategories: ["Bourbon", "Rye"] }
        ],
        modifiers: ["premium bourbon", "Fort Nelson distillery", "Pennsylvania heritage"],
        base_queries: ["Michter's bourbon", "Michters whiskey"]
    },
    {
        name: "Old Fitzgerald",
        variations: ["Old Fitz", "Old Fitzgerald Distillery"],
        region: "Louisville",
        country: "USA",
        type: ["bourbon"],
        parent_company: "Heaven Hill",
        priority: 8,
        product_lines: [
            { name: "Old Fitzgerald", subcategories: ["Bottled-in-Bond", "8 Year", "9 Year", "11 Year", "13 Year", "14 Year"] },
            { name: "Very Old Fitzgerald", subcategories: ["12 Year"] },
            { name: "Old Fitzgerald Prime", subcategories: [] }
        ],
        modifiers: ["wheated bourbon", "Stitzel-Weller heritage", "decanter series"],
        base_queries: ["Old Fitzgerald bourbon", "Old Fitz whiskey"]
    },
    {
        name: "Lux Row",
        variations: ["Lux Row Distillers"],
        region: "Bardstown",
        country: "USA",
        type: ["bourbon"],
        parent_company: "MGP Ingredients",
        website: "luxrowdistillers.com",
        priority: 7,
        product_lines: [
            { name: "Ezra Brooks", subcategories: ["99", "Bourbon", "Rye", "Single Barrel"] },
            { name: "Rebel", subcategories: ["100", "Distiller's Collection", "Single Barrel"] },
            { name: "Blood Oath", subcategories: ["Pact 1-10"] },
            { name: "Daviess County", subcategories: ["Bourbon", "Cabernet Sauvignon Finish"] }
        ],
        modifiers: ["craft distillery", "visitor center", "custom distilling"],
        base_queries: ["Lux Row distillery", "Ezra Brooks bourbon", "Rebel bourbon"]
    },
    {
        name: "Peerless",
        variations: ["Kentucky Peerless", "Peerless Distilling"],
        region: "Louisville",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "kentuckypeerless.com",
        priority: 8,
        product_lines: [
            { name: "Peerless Small Batch Bourbon", subcategories: [] },
            { name: "Peerless Single Barrel Bourbon", subcategories: [] },
            { name: "Peerless Small Batch Rye", subcategories: [] },
            { name: "Peerless Single Barrel Rye", subcategories: [] },
            { name: "Peerless Double Oak", subcategories: [] }
        ],
        modifiers: ["sweet mash", "craft distillery", "Taylor family heritage"],
        base_queries: ["Peerless bourbon", "Kentucky Peerless whiskey"]
    },
    {
        name: "Willett",
        variations: ["Willett Distillery", "Kentucky Bourbon Distillers"],
        region: "Bardstown",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "kentuckybourbonwhiskey.com",
        priority: 9,
        product_lines: [
            { name: "Willett Pot Still Reserve", subcategories: [] },
            { name: "Willett Family Estate", subcategories: ["Bourbon", "Rye", "Single Barrel"] },
            { name: "Noah's Mill", subcategories: [] },
            { name: "Rowan's Creek", subscategories: [] },
            { name: "Old Bardstown", subcategories: ["Bottled-in-Bond", "Estate"] }
        ],
        modifiers: ["pot still shape bottle", "family distillery", "Kulsveen family"],
        base_queries: ["Willett bourbon", "Willett distillery", "Kentucky Bourbon Distillers"]
    },
    {
        name: "Bulleit",
        variations: ["Bulleit Frontier Whiskey", "Bulleit Distilling"],
        region: "Shelbyville",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        parent_company: "Diageo",
        website: "bulleit.com",
        priority: 8,
        product_lines: [
            { name: "Bulleit Bourbon", subcategories: ["Frontier Whiskey", "10 Year"] },
            { name: "Bulleit Rye", subcategories: ["95 Rye", "12 Year"] },
            { name: "Bulleit Barrel Strength", subcategories: [] },
            { name: "Bulleit Single Barrel", subcategories: [] }
        ],
        modifiers: ["high rye bourbon", "frontier whiskey", "Tom Bulleit"],
        base_queries: ["Bulleit bourbon", "Bulleit whiskey"]
    },
    {
        name: "New Riff",
        variations: ["New Riff Distilling", "New Riff Distillery"],
        region: "Newport",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "newriffdistilling.com",
        priority: 8,
        product_lines: [
            { name: "New Riff Bourbon", subcategories: ["Bottled-in-Bond", "Single Barrel"] },
            { name: "New Riff Rye", subcategories: ["Bottled-in-Bond", "Single Barrel"] },
            { name: "New Riff Maltster", subcategories: ["Malted Rye", "Malted Wheat"] },
            { name: "New Riff Winter Whiskey", subcategories: [] }
        ],
        modifiers: ["sour mash", "non-chill filtered", "Cincinnati region"],
        base_queries: ["New Riff bourbon", "New Riff distillery"]
    },
    {
        name: "Wilderness Trail",
        variations: ["Wilderness Trail Distillery"],
        region: "Danville",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "wildernesstraildistillery.com",
        priority: 7,
        product_lines: [
            { name: "Wilderness Trail Bourbon", subcategories: ["Bottled-in-Bond", "Wheated", "High Rye"] },
            { name: "Wilderness Trail Rye", subcategories: ["Bottled-in-Bond", "Barrel Proof"] },
            { name: "Wilderness Trail Single Barrel", subcategories: [] },
            { name: "Wilderness Trail Harvest Wheat", subcategories: [] }
        ],
        modifiers: ["sweet mash", "scientific approach", "fermentation experts"],
        base_queries: ["Wilderness Trail bourbon", "Wilderness Trail distillery"]
    },
    {
        name: "Limestone Branch",
        variations: ["Limestone Branch Distillery"],
        region: "Lebanon",
        country: "USA",
        type: ["bourbon"],
        parent_company: "Luxco",
        website: "limestonebranch.com",
        priority: 6,
        product_lines: [
            { name: "Yellowstone", subcategories: ["Select", "Limited Edition", "Single Barrel"] },
            { name: "Minor Case", subcategories: ["Straight Rye"] },
            { name: "Moon Taxi", subcategories: [] }
        ],
        modifiers: ["Beam family heritage", "historic brand revival"],
        base_queries: ["Limestone Branch bourbon", "Yellowstone bourbon"]
    },
    {
        name: "MB Roland",
        variations: ["MB Roland Distillery"],
        region: "Pembroke",
        country: "USA",
        type: ["bourbon"],
        website: "mbroland.com",
        priority: 5,
        product_lines: [
            { name: "MB Roland Kentucky Straight", subcategories: [] },
            { name: "MB Roland Single Barrel", subcategories: [] },
            { name: "MB Roland Dark Fired", subcategories: [] }
        ],
        modifiers: ["craft distillery", "Christian County", "dark fired tobacco finish"],
        base_queries: ["MB Roland bourbon", "MB Roland distillery"]
    },
    {
        name: "Boone County",
        variations: ["Boone County Distilling"],
        region: "Independence",
        country: "USA",
        type: ["bourbon"],
        website: "boonedistilling.com",
        priority: 6,
        product_lines: [
            { name: "Boone County Small Batch", subcategories: [] },
            { name: "Boone County Single Barrel", subcategories: [] },
            { name: "Boone County Cask Strength", subcategories: [] },
            { name: "1833", subcategories: ["Small Batch", "Single Barrel"] }
        ],
        modifiers: ["pot still distillation", "Northern Kentucky"],
        base_queries: ["Boone County bourbon", "Boone County distilling"]
    },
    {
        name: "James E. Pepper",
        variations: ["James E Pepper", "J.E. Pepper", "Pepper Distillery"],
        region: "Lexington",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "jamesepepper.com",
        priority: 7,
        product_lines: [
            { name: "James E. Pepper 1776", subcategories: ["Bourbon", "Rye", "Barrel Proof"] },
            { name: "Old Pepper", subcategories: ["Single Barrel", "Bottled-in-Bond"] },
            { name: "Decanter Barrel Proof", subcategories: [] }
        ],
        modifiers: ["historic distillery", "Oscar Pepper legacy", "Lexington"],
        base_queries: ["James E Pepper bourbon", "JE Pepper whiskey"]
    },
    {
        name: "Coopers' Craft",
        variations: ["Coopers Craft", "Cooper's Craft"],
        region: "Louisville",
        country: "USA",
        type: ["bourbon"],
        parent_company: "Brown-Forman",
        priority: 6,
        product_lines: [
            { name: "Coopers' Craft", subcategories: ["Original", "Barrel Reserve"] },
            { name: "Coopers' Craft Chestnut Oak", subcategories: [] }
        ],
        modifiers: ["beech and birch filtration", "barrel making heritage"],
        base_queries: ["Coopers Craft bourbon", "Cooper's Craft whiskey"]
    },
    {
        name: "Early Times",
        variations: ["Early Times Distillery"],
        region: "Louisville",
        country: "USA",
        type: ["bourbon", "kentucky whisky"],
        parent_company: "Sazerac",
        priority: 6,
        product_lines: [
            { name: "Early Times", subcategories: ["Kentucky Whisky", "Bottled-in-Bond"] },
            { name: "Early Times 354", subcategories: [] }
        ],
        modifiers: ["historic brand", "Kentucky whisky category"],
        base_queries: ["Early Times bourbon", "Early Times whisky"]
    },
    {
        name: "Kentucky Owl",
        variations: ["Kentucky Owl Bourbon"],
        region: "Bardstown",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        parent_company: "Stoli Group",
        priority: 8,
        product_lines: [
            { name: "Kentucky Owl Confiscated", subcategories: [] },
            { name: "Kentucky Owl Batch", subcategories: ["#1-12"] },
            { name: "Kentucky Owl Rye", subcategories: ["Batch #1-4"] },
            { name: "Kentucky Owl Takumi Edition", subcategories: [] }
        ],
        modifiers: ["ultra-premium", "limited release", "Dixon Dedman"],
        base_queries: ["Kentucky Owl bourbon", "Kentucky Owl whiskey"]
    },
    {
        name: "Blade and Bow",
        variations: ["Blade & Bow"],
        region: "Louisville",
        country: "USA",
        type: ["bourbon"],
        parent_company: "Diageo",
        priority: 6,
        product_lines: [
            { name: "Blade and Bow", subcategories: ["Kentucky Straight Bourbon"] },
            { name: "Blade and Bow 22 Year", subcategories: [] }
        ],
        modifiers: ["Stitzel-Weller heritage", "solera aging system"],
        base_queries: ["Blade and Bow bourbon", "Blade & Bow whiskey"]
    },
    {
        name: "Redemption",
        variations: ["Redemption Whiskey"],
        region: "Lawrenceburg",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        parent_company: "Deutsch Family",
        priority: 7,
        product_lines: [
            { name: "Redemption High Rye Bourbon", subcategories: [] },
            { name: "Redemption Wheated Bourbon", subcategories: [] },
            { name: "Redemption Rye", subcategories: ["Straight Rye", "Barrel Proof", "10 Year"] },
            { name: "Redemption Cognac Cask", subcategories: [] }
        ],
        modifiers: ["MGP sourced", "high rye content", "barrel proof offerings"],
        base_queries: ["Redemption bourbon", "Redemption whiskey"]
    },
    {
        name: "Noble Oak",
        variations: ["Noble Oak Whiskey"],
        region: "Multiple",
        country: "USA",
        type: ["bourbon"],
        priority: 5,
        product_lines: [
            { name: "Noble Oak Double Oak", subcategories: ["Bourbon", "Rye"] },
            { name: "Noble Oak Quintessence", subcategories: [] }
        ],
        modifiers: ["sherry oak staves", "double oak process"],
        base_queries: ["Noble Oak bourbon", "Noble Oak whiskey"]
    },
    {
        name: "Smooth Ambler",
        variations: ["Smooth Ambler Spirits"],
        region: "West Virginia",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "smoothambler.com",
        priority: 7,
        product_lines: [
            { name: "Old Scout", subcategories: ["Bourbon", "Rye", "Single Barrel"] },
            { name: "Contradiction", subcategories: [] },
            { name: "Big Level", subcategories: ["Bourbon", "Rye"] }
        ],
        modifiers: ["sourced and distilled", "West Virginia", "mountain water"],
        base_queries: ["Smooth Ambler bourbon", "Old Scout whiskey"]
    },
    {
        name: "Joseph Magnus",
        variations: ["Jos. A. Magnus", "Magnus Bourbon"],
        region: "Washington DC",
        country: "USA",
        type: ["bourbon"],
        website: "josephmagnus.com",
        priority: 7,
        product_lines: [
            { name: "Joseph Magnus", subcategories: ["Bourbon", "Triple Cask Finish"] },
            { name: "Joseph Magnus Cigar Blend", subcategories: [] },
            { name: "Murray Hill Club", subcategories: [] }
        ],
        modifiers: ["finished bourbon", "sherry casks", "historic recipes"],
        base_queries: ["Joseph Magnus bourbon", "Jos A Magnus whiskey"]
    },
    {
        name: "Laws Whiskey House",
        variations: ["Laws", "A.D. Laws"],
        region: "Denver",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "lawswhiskeyhouse.com",
        priority: 7,
        product_lines: [
            { name: "Laws Four Grain Bourbon", subcategories: ["Straight", "Bottled-in-Bond"] },
            { name: "Laws San Luis Valley Rye", subcategories: ["Straight", "Bottled-in-Bond"] },
            { name: "Laws Secale Rye", subcategories: [] },
            { name: "Laws Henry Road", subcategories: ["Malt Whiskey"] }
        ],
        modifiers: ["Colorado whiskey", "grain to glass", "terroir focused"],
        base_queries: ["Laws whiskey", "AD Laws bourbon"]
    },
    {
        name: "Breckenridge",
        variations: ["Breckenridge Distillery", "Breck"],
        region: "Breckenridge",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "breckenridgedistillery.com",
        priority: 7,
        product_lines: [
            { name: "Breckenridge Bourbon", subcategories: ["High Proof", "Reserve Blend"] },
            { name: "Breckenridge PX Cask", subcategories: [] },
            { name: "Breckenridge Port Cask", subcategories: [] },
            { name: "Breckenridge Rum Cask", subcategories: [] }
        ],
        modifiers: ["high altitude", "Colorado bourbon", "snow melt water"],
        base_queries: ["Breckenridge bourbon", "Breck whiskey"]
    },
    {
        name: "Old Elk",
        variations: ["Old Elk Distillery"],
        region: "Fort Collins",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "oldelk.com",
        priority: 7,
        product_lines: [
            { name: "Old Elk Bourbon", subcategories: ["Straight", "Wheated", "Sour Mash Reserve"] },
            { name: "Old Elk Straight Rye", subcategories: [] },
            { name: "Old Elk Single Barrel", subcategories: [] },
            { name: "Old Elk Infinity Blend", subcategories: [] }
        ],
        modifiers: ["slow cut proofing", "Greg Metze", "Colorado"],
        base_queries: ["Old Elk bourbon", "Old Elk distillery"]
    },
    {
        name: "Stranahan's",
        variations: ["Stranahans", "Stranahan's Colorado Whiskey"],
        region: "Denver",
        country: "USA",
        type: ["american single malt"],
        parent_company: "Proximo Spirits",
        website: "stranahans.com",
        priority: 8,
        product_lines: [
            { name: "Stranahan's Original", subcategories: [] },
            { name: "Stranahan's Sherry Cask", subcategories: [] },
            { name: "Stranahan's Blue Peak", subcategories: [] },
            { name: "Stranahan's Snowflake", subcategories: [] }
        ],
        modifiers: ["American single malt", "Rocky Mountain water", "Colorado"],
        base_queries: ["Stranahan's whiskey", "Stranahans Colorado"]
    },
    {
        name: "Wyoming Whiskey",
        variations: ["Wyoming Whiskey Company"],
        region: "Kirby",
        country: "USA",
        type: ["bourbon"],
        website: "wyomingwhiskey.com",
        priority: 7,
        product_lines: [
            { name: "Wyoming Whiskey Small Batch", subcategories: [] },
            { name: "Wyoming Whiskey Single Barrel", subcategories: [] },
            { name: "Wyoming Whiskey Outryder", subcategories: ["Straight American", "Bottled-in-Bond"] },
            { name: "Wyoming Whiskey National Parks", subcategories: [] }
        ],
        modifiers: ["Wyoming grain", "limestone water", "Steve Nally"],
        base_queries: ["Wyoming Whiskey bourbon", "Wyoming Whiskey"]
    },
    {
        name: "High West",
        variations: ["High West Distillery"],
        region: "Park City",
        country: "USA",
        type: ["bourbon", "rye whiskey", "american whiskey"],
        parent_company: "Constellation Brands",
        website: "highwest.com",
        priority: 8,
        product_lines: [
            { name: "High West American Prairie", subcategories: ["Bourbon", "Barrel Select"] },
            { name: "High West Double Rye", subcategories: [] },
            { name: "High West Rendezvous Rye", subcategories: [] },
            { name: "High West Campfire", subcategories: [] },
            { name: "High West Midwinter Night's Dram", subcategories: [] }
        ],
        modifiers: ["blended whiskey", "Utah distillery", "ski resort"],
        base_queries: ["High West bourbon", "High West whiskey"]
    },
    {
        name: "Garrison Brothers",
        variations: ["Garrison Bros"],
        region: "Hye",
        country: "USA",
        type: ["bourbon"],
        website: "garrisonbros.com",
        priority: 8,
        product_lines: [
            { name: "Garrison Brothers Small Batch", subcategories: [] },
            { name: "Garrison Brothers Single Barrel", subcategories: [] },
            { name: "Garrison Brothers Cowboy", subcategories: [] },
            { name: "Garrison Brothers Balmorhea", subcategories: [] },
            { name: "Garrison Brothers Laguna Madre", subcategories: [] }
        ],
        modifiers: ["Texas bourbon", "first legal bourbon distillery in Texas", "hot climate aging"],
        base_queries: ["Garrison Brothers bourbon", "Garrison Bros Texas"]
    },
    {
        name: "Balcones",
        variations: ["Balcones Distilling"],
        region: "Waco",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "balconesdistilling.com",
        priority: 8,
        product_lines: [
            { name: "Balcones Texas Pot Still", subcategories: [] },
            { name: "Balcones True Blue", subcategories: ["100 Proof", "Cask Strength"] },
            { name: "Balcones Baby Blue", subcategories: [] },
            { name: "Balcones Single Malt", subcategories: [] },
            { name: "Balcones Brimstone", subcategories: [] }
        ],
        modifiers: ["Texas whiskey", "blue corn", "scrub oak smoked"],
        base_queries: ["Balcones bourbon", "Balcones Texas whiskey"]
    },
    {
        name: "Ironroot Republic",
        variations: ["Ironroot", "Ironroot Distillery"],
        region: "Denison",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "ironrootrepublic.com",
        priority: 6,
        product_lines: [
            { name: "Ironroot Harbinger", subcategories: [] },
            { name: "Ironroot Hubris", subcategories: [] },
            { name: "Ironroot Icarus", subcategories: [] },
            { name: "Ironroot Promethean", subcategories: [] }
        ],
        modifiers: ["Texas whiskey", "French brandy techniques", "purple corn"],
        base_queries: ["Ironroot bourbon", "Ironroot Republic whiskey"]
    },
    {
        name: "Treaty Oak",
        variations: ["Treaty Oak Distilling"],
        region: "Dripping Springs",
        country: "USA",
        type: ["bourbon"],
        website: "treatyoakdistilling.com",
        priority: 6,
        product_lines: [
            { name: "Treaty Oak Ghost Hill", subcategories: [] },
            { name: "Treaty Oak Red Handed", subcategories: ["Bourbon", "Rye"] },
            { name: "Treaty Oak Day Drinker", subcategories: [] }
        ],
        modifiers: ["Texas bourbon", "grain to glass", "Hill Country"],
        base_queries: ["Treaty Oak bourbon", "Treaty Oak Texas"]
    },
    {
        name: "Ranger Creek",
        variations: ["Ranger Creek Brewing & Distilling"],
        region: "San Antonio",
        country: "USA",
        type: ["bourbon"],
        website: "rangercreek.com",
        priority: 5,
        product_lines: [
            { name: ".36 Texas Bourbon", subcategories: [] },
            { name: "Rimfire", subcategories: ["Mesquite Smoked"] },
            { name: "Small Caliber", subcategories: [] }
        ],
        modifiers: ["Texas bourbon", "brewstillery", "mesquite smoke"],
        base_queries: ["Ranger Creek bourbon", ".36 Texas bourbon"]
    },
    {
        name: "Still Austin",
        variations: ["Still Austin Whiskey"],
        region: "Austin",
        country: "USA",
        type: ["bourbon"],
        website: "stillaustin.com",
        priority: 6,
        product_lines: [
            { name: "Still Austin The Musician", subcategories: [] },
            { name: "Still Austin Cask Strength", subcategories: [] },
            { name: "Still Austin Bottled-in-Bond", subcategories: [] }
        ],
        modifiers: ["Texas bourbon", "grain to glass", "slow water reduction"],
        base_queries: ["Still Austin bourbon", "Still Austin whiskey"]
    },
    {
        name: "Whiskey Myers",
        variations: ["Whiskey Myers Whiskey"],
        region: "Texas",
        country: "USA",
        type: ["bourbon"],
        priority: 5,
        product_lines: [
            { name: "Whiskey Myers Red River", subcategories: [] },
            { name: "Whiskey Myers Yellowstone", subcategories: [] }
        ],
        modifiers: ["celebrity whiskey", "Texas band", "limestone water"],
        base_queries: ["Whiskey Myers bourbon", "Whiskey Myers whiskey"]
    },
    {
        name: "Milam & Greene",
        variations: ["Milam and Greene", "Milam & Greene Whiskey"],
        region: "Blanco",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "milamandgreenewhiskey.com",
        priority: 6,
        product_lines: [
            { name: "Milam & Greene Very Small Batch", subcategories: [] },
            { name: "Milam & Greene Single Barrel", subcategories: [] },
            { name: "Milam & Greene Triple Cask", subcategories: [] },
            { name: "Milam & Greene Port Finish Rye", subcategories: [] }
        ],
        modifiers: ["Texas whiskey", "Heather Greene", "port cask finish"],
        base_queries: ["Milam Greene bourbon", "Milam and Greene whiskey"]
    },
    {
        name: "Smoke Wagon",
        variations: ["Smoke Wagon Whiskey"],
        region: "Las Vegas",
        country: "USA",
        type: ["bourbon"],
        website: "smokewagon.com",
        priority: 7,
        product_lines: [
            { name: "Smoke Wagon Straight Bourbon", subcategories: [] },
            { name: "Smoke Wagon Small Batch", subcategories: [] },
            { name: "Smoke Wagon Uncut Unfiltered", subcategories: [] },
            { name: "Smoke Wagon Private Barrel", subcategories: [] }
        ],
        modifiers: ["MGP sourced", "Nevada", "desert aged"],
        base_queries: ["Smoke Wagon bourbon", "Smoke Wagon whiskey"]
    },
    {
        name: "FEW Spirits",
        variations: ["FEW", "FEW Distillery"],
        region: "Evanston",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "fewspirits.com",
        priority: 7,
        product_lines: [
            { name: "FEW Bourbon", subcategories: [] },
            { name: "FEW Straight Rye", subcategories: [] },
            { name: "FEW Single Malt", subcategories: [] },
            { name: "FEW Cold Cut", subcategories: [] }
        ],
        modifiers: ["craft distillery", "Evanston Illinois", "grain to glass"],
        base_queries: ["FEW bourbon", "FEW Spirits whiskey"]
    },
    {
        name: "Koval",
        variations: ["Koval Distillery"],
        region: "Chicago",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "koval-distillery.com",
        priority: 6,
        product_lines: [
            { name: "Koval Bourbon", subcategories: [] },
            { name: "Koval Four Grain", subcategories: [] },
            { name: "Koval Single Barrel", subcategories: ["Bourbon", "Rye", "Wheat", "Oat"] },
            { name: "Koval Millet", subcategories: [] }
        ],
        modifiers: ["organic grains", "kosher", "Chicago distillery"],
        base_queries: ["Koval bourbon", "Koval whiskey"]
    },
    {
        name: "Journeyman",
        variations: ["Journeyman Distillery"],
        region: "Three Oaks",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "journeymandistillery.com",
        priority: 6,
        product_lines: [
            { name: "Journeyman Featherbone", subcategories: [] },
            { name: "Journeyman Silver Cross", subcategories: [] },
            { name: "Journeyman Buggy Whip", subcategories: [] },
            { name: "Journeyman Not a King", subcategories: [] }
        ],
        modifiers: ["organic distillery", "Michigan", "historic Featherbone Factory"],
        base_queries: ["Journeyman bourbon", "Journeyman whiskey"]
    },
    {
        name: "Cedar Ridge",
        variations: ["Cedar Ridge Distillery"],
        region: "Swisher",
        country: "USA",
        type: ["bourbon"],
        website: "cedarridgewhiskey.com",
        priority: 6,
        product_lines: [
            { name: "Cedar Ridge Bourbon", subcategories: [] },
            { name: "Cedar Ridge Single Malt", subcategories: [] },
            { name: "Cedar Ridge QuintEssential", subcategories: [] },
            { name: "Cedar Ridge Reserve", subcategories: [] }
        ],
        modifiers: ["Iowa bourbon", "wine cask finish", "family owned"],
        base_queries: ["Cedar Ridge bourbon", "Cedar Ridge Iowa"]
    },
    {
        name: "Templeton",
        variations: ["Templeton Rye", "Templeton Distillery"],
        region: "Templeton",
        country: "USA",
        type: ["rye whiskey"],
        website: "templetonrye.com",
        priority: 6,
        product_lines: [
            { name: "Templeton Rye", subcategories: ["4 Year", "6 Year", "10 Year"] },
            { name: "Templeton Stout Cask", subcategories: [] },
            { name: "Templeton Barrel Strength", subcategories: [] }
        ],
        modifiers: ["prohibition era recipe", "Iowa rye", "Al Capone's whiskey"],
        base_queries: ["Templeton Rye", "Templeton whiskey"]
    },
    {
        name: "Coppersea",
        variations: ["Coppersea Distilling"],
        region: "New Paltz",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "coppersea.com",
        priority: 5,
        product_lines: [
            { name: "Coppersea Excelsior", subcategories: ["Bourbon", "Rye"] },
            { name: "Coppersea Green Malt", subcategories: [] },
            { name: "Coppersea Raw Rye", subcategories: [] }
        ],
        modifiers: ["heritage grains", "floor malting", "Hudson Valley"],
        base_queries: ["Coppersea bourbon", "Coppersea whiskey"]
    },
    {
        name: "Finger Lakes",
        variations: ["Finger Lakes Distilling"],
        region: "Burdett",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "fingerlakesdistilling.com",
        priority: 5,
        product_lines: [
            { name: "McKenzie Bourbon", subcategories: [] },
            { name: "McKenzie Rye", subcategories: ["Straight", "Bottled-in-Bond"] },
            { name: "McKenzie Single Barrel", subcategories: [] }
        ],
        modifiers: ["New York whiskey", "local grains", "Finger Lakes region"],
        base_queries: ["McKenzie bourbon", "Finger Lakes whiskey"]
    },
    {
        name: "Taconic",
        variations: ["Taconic Distillery"],
        region: "Stanfordville",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "taconicdistillery.com",
        priority: 6,
        product_lines: [
            { name: "Taconic Straight Bourbon", subcategories: [] },
            { name: "Taconic Straight Rye", subcategories: [] },
            { name: "Taconic Cask Strength", subcategories: ["Bourbon", "Rye"] },
            { name: "Taconic Double Barrel", subcategories: [] }
        ],
        modifiers: ["New York whiskey", "Dutchess County water", "rolling hills"],
        base_queries: ["Taconic bourbon", "Taconic distillery"]
    },
    {
        name: "Hudson Whiskey",
        variations: ["Hudson", "Tuthilltown"],
        region: "Gardiner",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        parent_company: "William Grant & Sons",
        website: "hudsonwhiskey.com",
        priority: 7,
        product_lines: [
            { name: "Hudson Baby Bourbon", subcategories: [] },
            { name: "Hudson Do The Rye Thing", subcategories: [] },
            { name: "Hudson Bright Lights Big Bourbon", subcategories: [] },
            { name: "Hudson Short Stack", subcategories: [] }
        ],
        modifiers: ["New York whiskey", "first bourbon in New York", "small barrels"],
        base_queries: ["Hudson bourbon", "Hudson whiskey", "Tuthilltown"]
    },
    {
        name: "Hillrock",
        variations: ["Hillrock Estate Distillery"],
        region: "Ancram",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "hillrockdistillery.com",
        priority: 6,
        product_lines: [
            { name: "Hillrock Solera Aged Bourbon", subcategories: [] },
            { name: "Hillrock Single Malt", subcategories: [] },
            { name: "Hillrock Double Cask Rye", subcategories: [] },
            { name: "Hillrock Estate Rye", subcategories: [] }
        ],
        modifiers: ["solera aging", "estate grown", "Hudson Valley"],
        base_queries: ["Hillrock bourbon", "Hillrock distillery"]
    },
    {
        name: "Kings County",
        variations: ["Kings County Distillery"],
        region: "Brooklyn",
        country: "USA",
        type: ["bourbon"],
        website: "kingscountydistillery.com",
        priority: 6,
        product_lines: [
            { name: "Kings County Straight Bourbon", subcategories: [] },
            { name: "Kings County Bottled-in-Bond", subcategories: [] },
            { name: "Kings County Peated Bourbon", subcategories: [] },
            { name: "Kings County Single Barrel", subcategories: [] }
        ],
        modifiers: ["New York City", "oldest distillery NYC", "pot stills"],
        base_queries: ["Kings County bourbon", "Kings County distillery"]
    },
    {
        name: "Dad's Hat",
        variations: ["Dads Hat", "Dad's Hat Rye"],
        region: "Bristol",
        country: "USA",
        type: ["rye whiskey"],
        website: "dadshatrye.com",
        priority: 6,
        product_lines: [
            { name: "Dad's Hat Pennsylvania Rye", subcategories: [] },
            { name: "Dad's Hat Bottled-in-Bond", subcategories: [] },
            { name: "Dad's Hat Vermouth Finish", subcategories: [] },
            { name: "Dad's Hat Port Finish", subcategories: [] }
        ],
        modifiers: ["Pennsylvania rye", "rye revival", "classic style"],
        base_queries: ["Dad's Hat rye", "Dads Hat whiskey"]
    },
    {
        name: "Wigle",
        variations: ["Wigle Whiskey"],
        region: "Pittsburgh",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "wiglewhiskey.com",
        priority: 5,
        product_lines: [
            { name: "Wigle Straight Bourbon", subcategories: [] },
            { name: "Wigle Pennsylvania Rye", subcategories: [] },
            { name: "Wigle Deep Cut", subcategories: ["Rye", "Bourbon"] },
            { name: "Wigle Kilted Rye", subcategories: [] }
        ],
        modifiers: ["Pittsburgh distillery", "organic grains", "Whiskey Rebellion heritage"],
        base_queries: ["Wigle bourbon", "Wigle whiskey"]
    },
    {
        name: "Kinsey",
        variations: ["Kinsey Whiskey"],
        region: "Philadelphia",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        parent_company: "New Liberty Distillery",
        priority: 5,
        product_lines: [
            { name: "Kinsey Bourbon", subcategories: ["4 Year", "7 Year"] },
            { name: "Kinsey Rye", subcategories: ["4 Year"] }
        ],
        modifiers: ["historic brand revival", "Pennsylvania heritage"],
        base_queries: ["Kinsey bourbon", "Kinsey whiskey"]
    },
    {
        name: "Liberty Pole",
        variations: ["Liberty Pole Spirits"],
        region: "Washington",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "libertypolespirits.com",
        priority: 5,
        product_lines: [
            { name: "Liberty Pole Bourbon", subcategories: [] },
            { name: "Liberty Pole Rye", subcategories: ["Full Rye", "Peated"] },
            { name: "Liberty Pole Corn Whiskey", subcategories: [] }
        ],
        modifiers: ["Pennsylvania whiskey", "Mingo Creek", "craft distillery"],
        base_queries: ["Liberty Pole bourbon", "Liberty Pole spirits"]
    },
    {
        name: "Old Line",
        variations: ["Old Line Spirits"],
        region: "Baltimore",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "oldlinespirits.com",
        priority: 5,
        product_lines: [
            { name: "Old Line American Single Malt", subcategories: [] },
            { name: "Old Line Cask Strength", subcategories: ["Bourbon", "Rye"] }
        ],
        modifiers: ["Maryland whiskey", "American single malt"],
        base_queries: ["Old Line whiskey", "Old Line spirits"]
    },
    {
        name: "Lyon",
        variations: ["Lyon Distilling"],
        region: "St. Michaels",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "lyondistilling.com",
        priority: 5,
        product_lines: [
            { name: "Lyon Bourbon", subcategories: [] },
            { name: "Lyon Rye", subcategories: [] },
            { name: "Lyon Rum", subcategories: [] }
        ],
        modifiers: ["Maryland distillery", "Eastern Shore", "small batch"],
        base_queries: ["Lyon bourbon", "Lyon distilling"]
    },
    {
        name: "Sagamore Spirit",
        variations: ["Sagamore", "Sagamore Rye"],
        region: "Baltimore",
        country: "USA",
        type: ["rye whiskey"],
        website: "sagamorespirit.com",
        priority: 8,
        product_lines: [
            { name: "Sagamore Spirit Signature", subcategories: [] },
            { name: "Sagamore Spirit Cask Strength", subcategories: [] },
            { name: "Sagamore Spirit Double Oak", subcategories: [] },
            { name: "Sagamore Spirit Bottled-in-Bond", subcategories: [] }
        ],
        modifiers: ["Maryland rye", "limestone filtered water", "Kevin Plank"],
        base_queries: ["Sagamore rye", "Sagamore Spirit whiskey"]
    },
    {
        name: "Catoctin Creek",
        variations: ["Catoctin Creek Distilling"],
        region: "Purcellville",
        country: "USA",
        type: ["rye whiskey"],
        website: "catoctincreekdistilling.com",
        priority: 6,
        product_lines: [
            { name: "Catoctin Creek Roundstone Rye", subcategories: ["80 Proof", "92 Proof", "Cask Proof"] },
            { name: "Catoctin Creek Rabble Rouser", subcategories: ["Bottled-in-Bond"] },
            { name: "Catoctin Creek Distiller's Edition", subcategories: [] }
        ],
        modifiers: ["Virginia rye", "organic", "pre-prohibition style"],
        base_queries: ["Catoctin Creek rye", "Roundstone rye"]
    },
    {
        name: "Copper Fox",
        variations: ["Copper Fox Distillery"],
        region: "Sperryville",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "copperfox.biz",
        priority: 5,
        product_lines: [
            { name: "Copper Fox American Single Malt", subcategories: [] },
            { name: "Copper Fox Rye", subcategories: [] },
            { name: "Copper Fox Bourbon", subcategories: [] },
            { name: "Copper Fox Peachwood", subcategories: [] }
        ],
        modifiers: ["fruitwood smoke", "Virginia whiskey", "floor malting"],
        base_queries: ["Copper Fox bourbon", "Copper Fox whiskey"]
    },
    {
        name: "Silverback",
        variations: ["Silverback Distillery"],
        region: "Afton",
        country: "USA",
        type: ["bourbon"],
        website: "silverbackdistillery.com",
        priority: 5,
        product_lines: [
            { name: "Silverback Blackback", subcategories: [] },
            { name: "Silverback Strange Monkey", subcategories: [] }
        ],
        modifiers: ["Virginia bourbon", "Christine Riggleman"],
        base_queries: ["Silverback bourbon", "Silverback distillery"]
    },
    {
        name: "Ragged Branch",
        variations: ["Ragged Branch Distillery"],
        region: "Charlottesville",
        country: "USA",
        type: ["bourbon"],
        website: "raggedbranch.com",
        priority: 5,
        product_lines: [
            { name: "Ragged Branch Signature Bourbon", subcategories: [] },
            { name: "Ragged Branch Bottled-in-Bond", subcategories: [] },
            { name: "Ragged Branch Double Oak", subcategories: [] }
        ],
        modifiers: ["Virginia bourbon", "farm distillery", "estate grown"],
        base_queries: ["Ragged Branch bourbon", "Ragged Branch distillery"]
    },
    {
        name: "Bowman Brothers",
        variations: ["A. Smith Bowman", "Bowman"],
        region: "Fredericksburg",
        country: "USA",
        type: ["bourbon"],
        parent_company: "Sazerac",
        website: "asmithbowman.com",
        priority: 7,
        product_lines: [
            { name: "Bowman Brothers Small Batch", subcategories: [] },
            { name: "John J. Bowman Single Barrel", subcategories: [] },
            { name: "Abraham Bowman", subcategories: ["Limited Edition"] },
            { name: "Isaac Bowman Port Barrel", subcategories: [] }
        ],
        modifiers: ["Virginia bourbon", "Sazerac owned", "historic distillery"],
        base_queries: ["Bowman bourbon", "A Smith Bowman whiskey"]
    },
    {
        name: "Reservoir",
        variations: ["Reservoir Distillery"],
        region: "Richmond",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "reservoirdistillery.com",
        priority: 6,
        product_lines: [
            { name: "Reservoir Bourbon", subcategories: [] },
            { name: "Reservoir Rye", subcategories: ["100% Rye"] },
            { name: "Reservoir Wheat", subcategories: [] },
            { name: "Reservoir Hunter & Scott", subcategories: [] }
        ],
        modifiers: ["100% grain whiskeys", "small barrels", "Richmond Virginia"],
        base_queries: ["Reservoir bourbon", "Reservoir distillery"]
    },
    {
        name: "Belle Meade",
        variations: ["Belle Meade Bourbon"],
        region: "Nashville",
        country: "USA",
        type: ["bourbon"],
        parent_company: "Nelson's Green Brier",
        website: "bellemeadebourbon.com",
        priority: 7,
        product_lines: [
            { name: "Belle Meade Classic", subcategories: [] },
            { name: "Belle Meade Reserve", subcategories: [] },
            { name: "Belle Meade Cask Strength Reserve", subcategories: [] },
            { name: "Belle Meade Cognac Cask", subcategories: [] },
            { name: "Belle Meade Madeira Cask", subcategories: [] }
        ],
        modifiers: ["Tennessee bourbon", "cask finished", "historic brand revival"],
        base_queries: ["Belle Meade bourbon", "Belle Meade whiskey"]
    },
    {
        name: "Nelson's Green Brier",
        variations: ["Nelsons Green Brier", "Green Brier"],
        region: "Nashville",
        country: "USA",
        type: ["bourbon", "tennessee whiskey"],
        website: "greenbrierdistillery.com",
        priority: 6,
        product_lines: [
            { name: "Nelson's Green Brier", subcategories: ["Tennessee Whiskey"] },
            { name: "Belle Meade", subcategories: ["Bourbon", "Reserve"] },
            { name: "Nelson Brothers", subcategories: ["Classic", "Reserve"] }
        ],
        modifiers: ["Tennessee whiskey", "Nelson family", "historic revival"],
        base_queries: ["Nelson's Green Brier", "Green Brier whiskey"]
    },
    {
        name: "Corsair",
        variations: ["Corsair Distillery", "Corsair Artisan"],
        region: "Nashville",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "corsairdistillery.com",
        priority: 6,
        product_lines: [
            { name: "Corsair Triple Smoke", subcategories: [] },
            { name: "Corsair Quinoa Whiskey", subcategories: [] },
            { name: "Corsair Ryemageddon", subcategories: [] },
            { name: "Corsair Dark Rye", subcategories: [] }
        ],
        modifiers: ["experimental whiskey", "alternative grains", "craft distillery"],
        base_queries: ["Corsair bourbon", "Corsair whiskey"]
    },
    {
        name: "Leiper's Fork",
        variations: ["Leipers Fork", "Leiper's Fork Distillery"],
        region: "Franklin",
        country: "USA",
        type: ["bourbon", "tennessee whiskey"],
        website: "leipersforkdistillery.com",
        priority: 5,
        product_lines: [
            { name: "Leiper's Fork Tennessee Whiskey", subcategories: [] },
            { name: "Leiper's Fork Single Barrel", subcategories: [] }
        ],
        modifiers: ["Tennessee whiskey", "small town distillery"],
        base_queries: ["Leiper's Fork whiskey", "Leipers Fork Tennessee"]
    },
    {
        name: "Collier and McKeel",
        variations: ["Collier & McKeel"],
        region: "Nashville",
        country: "USA",
        type: ["tennessee whiskey"],
        website: "collierandmckeel.com",
        priority: 5,
        product_lines: [
            { name: "Collier and McKeel Tennessee Whiskey", subcategories: [] }
        ],
        modifiers: ["Tennessee whiskey", "small batch"],
        base_queries: ["Collier McKeel whiskey", "Collier and McKeel"]
    },
    {
        name: "Prichard's",
        variations: ["Prichards", "Prichard's Distillery"],
        region: "Kelso",
        country: "USA",
        type: ["bourbon", "tennessee whiskey"],
        website: "prichardsdistillery.com",
        priority: 6,
        product_lines: [
            { name: "Prichard's Double Barreled", subcategories: [] },
            { name: "Prichard's Tennessee Whiskey", subcategories: [] },
            { name: "Prichard's Rye", subcategories: [] },
            { name: "Prichard's Single Malt", subcategories: [] }
        ],
        modifiers: ["Tennessee whiskey", "no charcoal filtering", "pot stills"],
        base_queries: ["Prichard's whiskey", "Prichards Tennessee"]
    },
    {
        name: "Short Mountain",
        variations: ["Short Mountain Distillery"],
        region: "Woodbury",
        country: "USA",
        type: ["bourbon", "tennessee whiskey"],
        website: "shortmountaindistillery.com",
        priority: 5,
        product_lines: [
            { name: "Short Mountain Tennessee Bourbon", subcategories: [] },
            { name: "Short Mountain Rye", subcategories: [] },
            { name: "Short Mountain Shine", subcategories: [] }
        ],
        modifiers: ["Tennessee whiskey", "Cannon County"],
        base_queries: ["Short Mountain bourbon", "Short Mountain distillery"]
    },
    {
        name: "Pennington",
        variations: ["Pennington Distilling"],
        region: "Nashville",
        country: "USA",
        type: ["bourbon", "tennessee whiskey"],
        website: "penningtondistillingco.com",
        priority: 5,
        product_lines: [
            { name: "Davidson Reserve", subcategories: ["Tennessee Bourbon", "Rye"] },
            { name: "Whisper Creek", subcategories: [] },
            { name: "Pickers Vodka", subcategories: [] }
        ],
        modifiers: ["Tennessee whiskey", "Music City"],
        base_queries: ["Pennington bourbon", "Davidson Reserve whiskey"]
    },
    {
        name: "Company Distilling",
        variations: ["Company Distilling Co"],
        region: "Alcoa",
        country: "USA",
        type: ["bourbon", "tennessee whiskey"],
        website: "companydistilling.com",
        priority: 5,
        product_lines: [
            { name: "Company Straight Bourbon", subcategories: [] },
            { name: "Company Tennessee Whiskey", subcategories: [] }
        ],
        modifiers: ["Tennessee whiskey", "grain to glass"],
        base_queries: ["Company Distilling bourbon", "Company Distilling whiskey"]
    },
    {
        name: "H Clark",
        variations: ["H Clark Distillery"],
        region: "Thompson's Station",
        country: "USA",
        type: ["bourbon", "tennessee whiskey"],
        website: "hclarkdistillery.com",
        priority: 5,
        product_lines: [
            { name: "Tennessee Bourbon", subcategories: [] },
            { name: "Rye Whiskey", subcategories: [] }
        ],
        modifiers: ["Tennessee whiskey", "small batch"],
        base_queries: ["H Clark bourbon", "H Clark distillery"]
    },
    {
        name: "Old Glory",
        variations: ["Old Glory Distilling"],
        region: "Clarksville",
        country: "USA",
        type: ["bourbon", "tennessee whiskey"],
        website: "oldglorydistilling.com",
        priority: 5,
        product_lines: [
            { name: "Old Glory Tennessee Bourbon", subcategories: [] },
            { name: "Old Glory American Single Malt", subcategories: [] }
        ],
        modifiers: ["Tennessee whiskey", "veteran owned"],
        base_queries: ["Old Glory bourbon", "Old Glory distilling"]
    },
    {
        name: "Sugarlands",
        variations: ["Sugarlands Distilling"],
        region: "Gatlinburg",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "sugarlands.com",
        priority: 6,
        product_lines: [
            { name: "Roaming Man", subcategories: ["Tennessee Straight Rye"] },
            { name: "Sugarlands Shine", subcategories: [] }
        ],
        modifiers: ["Tennessee whiskey", "moonshine heritage", "Smoky Mountains"],
        base_queries: ["Sugarlands bourbon", "Roaming Man whiskey"]
    },
    {
        name: "Bib & Tucker",
        variations: ["Bib and Tucker"],
        region: "Tennessee",
        country: "USA",
        type: ["bourbon"],
        parent_company: "Deutsch Family",
        priority: 6,
        product_lines: [
            { name: "Bib & Tucker Small Batch", subcategories: ["6 Year", "10 Year"] },
            { name: "Bib & Tucker Double Char", subcategories: [] }
        ],
        modifiers: ["Tennessee bourbon", "double char barrels"],
        base_queries: ["Bib Tucker bourbon", "Bib and Tucker whiskey"]
    },
    {
        name: "Bonded Bourbon",
        variations: ["Bonded"],
        region: "Tennessee",
        country: "USA",
        type: ["bourbon"],
        priority: 5,
        product_lines: [
            { name: "Bonded Tennessee Bourbon", subcategories: [] }
        ],
        modifiers: ["bottled-in-bond", "Tennessee"],
        base_queries: ["Bonded bourbon Tennessee"]
    },
    {
        name: "Southern Pride",
        variations: ["Southern Pride Distillery"],
        region: "Tennessee",
        country: "USA",
        type: ["bourbon"],
        priority: 4,
        product_lines: [
            { name: "Southern Pride Bourbon", subcategories: [] },
            { name: "Southern Pride Moonshine", subcategories: [] }
        ],
        modifiers: ["Tennessee bourbon", "small batch"],
        base_queries: ["Southern Pride bourbon", "Southern Pride Tennessee"]
    },
    {
        name: "Spirit of Tennessee",
        variations: ["Spirit of TN"],
        region: "Tennessee",
        country: "USA",
        type: ["bourbon", "tennessee whiskey"],
        priority: 4,
        product_lines: [
            { name: "Spirit of Tennessee Bourbon", subcategories: [] },
            { name: "Spirit of Tennessee Bicentennial", subcategories: [] }
        ],
        modifiers: ["Tennessee whiskey", "commemorative releases"],
        base_queries: ["Spirit of Tennessee bourbon"]
    },
    {
        name: "Fugitives",
        variations: ["Fugitives Spirits"],
        region: "Nashville",
        country: "USA",
        type: ["bourbon"],
        website: "fugitivesspirits.com",
        priority: 5,
        product_lines: [
            { name: "Grandgousier", subcategories: [] },
            { name: "Hellbender", subcategories: [] },
            { name: "Fugitives Rye", subcategories: [] }
        ],
        modifiers: ["Tennessee whiskey", "unique mash bills"],
        base_queries: ["Fugitives bourbon", "Fugitives spirits"]
    }
];
export const ALL_BOURBON_DISTILLERIES = BOURBON_DISTILLERIES;
