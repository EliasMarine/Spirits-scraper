export const AMERICAN_CRAFT_DISTILLERIES = [
    // Pacific Northwest
    {
        name: "Westland",
        variations: ["Westland Distillery", "Westland American Single Malt"],
        region: "Seattle",
        country: "USA",
        type: ["american single malt"],
        parent_company: "Rémy Cointreau",
        website: "westlanddistillery.com",
        priority: 9,
        product_lines: [
            { name: "Westland American Oak", subcategories: [] },
            { name: "Westland Peated", subcategories: [] },
            { name: "Westland Sherry Wood", subcategories: [] },
            { name: "Westland Garryana", subcategories: [] },
            { name: "Westland Solum", subcategories: [] }
        ],
        modifiers: ["American single malt", "Pacific Northwest", "terroir focused"],
        base_queries: ["Westland whiskey", "Westland single malt"]
    },
    {
        name: "Copperworks",
        variations: ["Copperworks Distilling"],
        region: "Seattle",
        country: "USA",
        type: ["american single malt"],
        website: "copperworksdistilling.com",
        priority: 7,
        product_lines: [
            { name: "Copperworks American Single Malt", subcategories: ["Release 001-050"] },
            { name: "Copperworks Peated", subcategories: [] },
            { name: "Copperworks New Oak Rye", subcategories: [] }
        ],
        modifiers: ["craft malting", "small batch", "Seattle waterfront"],
        base_queries: ["Copperworks whiskey", "Copperworks single malt"]
    },
    {
        name: "2bar Spirits",
        variations: ["2bar", "Two Bar"],
        region: "Seattle",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "2barspirits.com",
        priority: 5,
        product_lines: [
            { name: "2bar Bourbon", subcategories: [] },
            { name: "2bar Moonshine", subcategories: [] }
        ],
        modifiers: ["Seattle distillery", "SoDo district"],
        base_queries: ["2bar spirits", "2bar bourbon"]
    },
    {
        name: "Woodinville",
        variations: ["Woodinville Whiskey", "Woodinville Whiskey Co"],
        region: "Woodinville",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        parent_company: "Moët Hennessy",
        website: "woodinvillewhiskeyco.com",
        priority: 8,
        product_lines: [
            { name: "Woodinville Straight Bourbon", subcategories: [] },
            { name: "Woodinville Straight Rye", subcategories: ["100% Rye"] },
            { name: "Woodinville Port Cask", subcategories: [] },
            { name: "Woodinville Cask Strength", subcategories: [] }
        ],
        modifiers: ["Washington whiskey", "Quincy grain", "traditional methods"],
        base_queries: ["Woodinville bourbon", "Woodinville whiskey"]
    },
    {
        name: "Bainbridge",
        variations: ["Bainbridge Organic Distillers", "Bainbridge Distillers"],
        region: "Bainbridge Island",
        country: "USA",
        type: ["american whiskey"],
        website: "bainbridgedistillers.com",
        priority: 5,
        product_lines: [
            { name: "Bainbridge Battle Point", subcategories: ["Wheat Whiskey", "Two Islands"] },
            { name: "Bainbridge Yama", subcategories: ["Mizunara Cask"] }
        ],
        modifiers: ["organic distillery", "Japanese influence", "island whiskey"],
        base_queries: ["Bainbridge whiskey", "Bainbridge distillers"]
    },
    {
        name: "Chambers Bay",
        variations: ["Chambers Bay Distillery"],
        region: "University Place",
        country: "USA",
        type: ["american single malt"],
        website: "chambersbaydistillery.com",
        priority: 5,
        product_lines: [
            { name: "Chambers Bay Single Malt", subcategories: [] },
            { name: "Greenhorn Bourbon", subcategories: [] }
        ],
        modifiers: ["Washington whiskey", "single malt focused"],
        base_queries: ["Chambers Bay whiskey", "Chambers Bay distillery"]
    },
    {
        name: "Clear Creek",
        variations: ["Clear Creek Distillery"],
        region: "Portland",
        country: "USA",
        type: ["american whiskey"],
        parent_company: "Hood River Distillers",
        website: "clearcreekdistillery.com",
        priority: 6,
        product_lines: [
            { name: "McCarthy's Single Malt", subcategories: ["Oregon", "3 Year", "5 Year"] },
            { name: "Clear Creek Eau de Vie", subcategories: [] }
        ],
        modifiers: ["Oregon single malt", "peated whiskey", "fruit brandies"],
        base_queries: ["Clear Creek whiskey", "McCarthy's single malt"]
    },
    {
        name: "House Spirits",
        variations: ["House Spirits Distillery"],
        region: "Portland",
        country: "USA",
        type: ["american whiskey"],
        priority: 6,
        product_lines: [
            { name: "Westward Whiskey", subcategories: ["Oregon Straight Malt", "Cask Strength"] },
            { name: "Casa Magdalena Rum", subcategories: [] }
        ],
        modifiers: ["Oregon whiskey", "American single malt pioneer"],
        base_queries: ["House Spirits whiskey", "Westward whiskey"]
    },
    {
        name: "Ransom",
        variations: ["Ransom Spirits", "Ransom Wine & Spirits"],
        region: "Sheridan",
        country: "USA",
        type: ["american whiskey", "rye whiskey"],
        website: "ransomspirits.com",
        priority: 6,
        product_lines: [
            { name: "Ransom The Emerald", subcategories: ["1865"] },
            { name: "Ransom Rye Barley Wheat", subcategories: [] },
            { name: "Ransom WhipperSnapper", subcategories: [] }
        ],
        modifiers: ["Oregon whiskey", "historic recipes", "wine barrels"],
        base_queries: ["Ransom whiskey", "Ransom spirits"]
    },
    {
        name: "Bull Run",
        variations: ["Bull Run Distilling"],
        region: "Portland",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "bullrundistillery.com",
        priority: 5,
        product_lines: [
            { name: "Bull Run Straight Bourbon", subcategories: [] },
            { name: "Bull Run Cask Strength", subcategories: [] },
            { name: "Bull Run Oregon Single Malt", subcategories: [] }
        ],
        modifiers: ["Oregon whiskey", "Pacific Northwest grains"],
        base_queries: ["Bull Run bourbon", "Bull Run distillery"]
    },
    {
        name: "Rogue",
        variations: ["Rogue Spirits", "Rogue Ales & Spirits"],
        region: "Newport",
        country: "USA",
        type: ["american single malt"],
        website: "rogue.com",
        priority: 5,
        product_lines: [
            { name: "Rogue Dead Guy Whiskey", subcategories: [] },
            { name: "Rogue Rolling Thunder", subcategories: [] },
            { name: "Rogue Oregon Single Malt", subcategories: [] }
        ],
        modifiers: ["Oregon coast", "brewstillery", "ocean aged"],
        base_queries: ["Rogue whiskey", "Rogue spirits"]
    },
    {
        name: "Stein",
        variations: ["Stein Distillery"],
        region: "Joseph",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "steindistillery.com",
        priority: 5,
        product_lines: [
            { name: "Stein Straight Bourbon", subcategories: [] },
            { name: "Stein Straight Rye", subcategories: [] },
            { name: "Stein Oregon Rye", subcategories: [] }
        ],
        modifiers: ["Oregon whiskey", "Wallowa Mountains", "alpine water"],
        base_queries: ["Stein whiskey", "Stein distillery"]
    },
    {
        name: "Heritage",
        variations: ["Heritage Distilling"],
        region: "Gig Harbor",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "heritagedistilling.com",
        priority: 6,
        product_lines: [
            { name: "Heritage Brown Sugar Bourbon", subcategories: [] },
            { name: "Heritage Elk Rider", subcategories: ["Bourbon", "Rye"] },
            { name: "Heritage Cask Strength", subcategories: [] }
        ],
        modifiers: ["Washington whiskey", "brown sugar bourbon", "multiple locations"],
        base_queries: ["Heritage bourbon", "Heritage distilling"]
    },
    // California
    {
        name: "St. George",
        variations: ["St George Spirits", "Saint George"],
        region: "Alameda",
        country: "USA",
        type: ["american single malt", "american whiskey"],
        website: "stgeorgespirits.com",
        priority: 8,
        product_lines: [
            { name: "St. George Single Malt", subcategories: [] },
            { name: "St. George Baller", subcategories: [] },
            { name: "St. George Breaking & Entering", subcategories: ["Bourbon", "American"] }
        ],
        modifiers: ["California whiskey", "craft distillery pioneer", "Alameda Point"],
        base_queries: ["St George whiskey", "St George spirits"]
    },
    {
        name: "Charbay",
        variations: ["Charbay Distillery", "Charbay Winery & Distillery"],
        region: "St. Helena",
        country: "USA",
        type: ["american whiskey"],
        website: "charbay.com",
        priority: 6,
        product_lines: [
            { name: "Charbay Whiskey", subcategories: ["S", "R5"] },
            { name: "Charbay Doubled & Twisted", subcategories: [] },
            { name: "Charbay Hop Flavored Whiskey", subcategories: [] }
        ],
        modifiers: ["Napa Valley", "beer distilled whiskey", "Karakasevic family"],
        base_queries: ["Charbay whiskey", "Charbay distillery"]
    },
    {
        name: "Lost Spirits",
        variations: ["Lost Spirits Distillery"],
        region: "Los Angeles",
        country: "USA",
        type: ["american whiskey"],
        website: "lostspirits.net",
        priority: 6,
        product_lines: [
            { name: "Abomination", subcategories: ["Sayers of the Law", "The Crying of the Puma"] },
            { name: "Lost Spirits Seascape", subcategories: [] }
        ],
        modifiers: ["rapid aging technology", "THEA reactor", "experimental"],
        base_queries: ["Lost Spirits whiskey", "Lost Spirits distillery"]
    },
    {
        name: "Seven Stills",
        variations: ["Seven Stills Brewery & Distillery", "7 Stills"],
        region: "San Francisco",
        country: "USA",
        type: ["american whiskey"],
        website: "sevenstills.com",
        priority: 5,
        product_lines: [
            { name: "Seven Stills Chocasmoke", subcategories: [] },
            { name: "Seven Stills Fluxuate", subcategories: [] },
            { name: "Seven Stills EPIC Stout", subcategories: [] }
        ],
        modifiers: ["brewstillery", "beer whiskey", "Mission district"],
        base_queries: ["Seven Stills whiskey", "7 Stills"]
    },
    {
        name: "Greenbar",
        variations: ["Greenbar Distillery", "Greenbar Craft"],
        region: "Los Angeles",
        country: "USA",
        type: ["american whiskey"],
        website: "greenbar.biz",
        priority: 5,
        product_lines: [
            { name: "Slow Hand Six Woods", subcategories: [] },
            { name: "Slow Hand White Whiskey", subcategories: [] }
        ],
        modifiers: ["organic spirits", "sustainable", "downtown LA"],
        base_queries: ["Greenbar whiskey", "Slow Hand whiskey"]
    },
    {
        name: "Raff",
        variations: ["Raff Distillerie"],
        region: "San Francisco",
        country: "USA",
        type: ["american single malt"],
        website: "raffdistillerie.com",
        priority: 5,
        product_lines: [
            { name: "Raff Single Malt", subcategories: [] },
            { name: "Raff Bière de Whisky", subcategories: [] }
        ],
        modifiers: ["malted barley", "Treasure Island", "French style"],
        base_queries: ["Raff whiskey", "Raff distillerie"]
    },
    {
        name: "Sutherland",
        variations: ["Sutherland Distilling"],
        region: "Livermore",
        country: "USA",
        type: ["american single malt"],
        website: "sutherlanddistilling.com",
        priority: 5,
        product_lines: [
            { name: "Sutherland American Single Malt", subcategories: [] },
            { name: "Sutherland Cask Strength", subcategories: [] }
        ],
        modifiers: ["California single malt", "wine country"],
        base_queries: ["Sutherland whiskey", "Sutherland distilling"]
    },
    // Southwest
    {
        name: "Del Bac",
        variations: ["Del Bac Distillery", "Hamilton Distillers"],
        region: "Tucson",
        country: "USA",
        type: ["american single malt"],
        website: "delbac.com",
        priority: 7,
        product_lines: [
            { name: "Del Bac Classic", subcategories: [] },
            { name: "Del Bac Dorado", subcategories: [] },
            { name: "Del Bac Old Pueblo", subcategories: [] },
            { name: "Del Bac Distiller's Cut", subcategories: [] }
        ],
        modifiers: ["mesquite smoked", "Arizona whiskey", "desert terroir"],
        base_queries: ["Del Bac whiskey", "Hamilton distillers"]
    },
    {
        name: "Desert Diamond",
        variations: ["Desert Diamond Distillery"],
        region: "Kingman",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "desertdiamonddistillery.com",
        priority: 4,
        product_lines: [
            { name: "Gold Miner Bourbon", subcategories: [] },
            { name: "Desert Diamond Rum", subcategories: [] }
        ],
        modifiers: ["Arizona whiskey", "Route 66"],
        base_queries: ["Desert Diamond whiskey", "Gold Miner bourbon"]
    },
    {
        name: "Arizona Distilling",
        variations: ["Arizona Distilling Company"],
        region: "Tempe",
        country: "USA",
        type: ["bourbon"],
        website: "azdistilling.com",
        priority: 5,
        product_lines: [
            { name: "Copper City Bourbon", subcategories: [] },
            { name: "Commerce Gin", subcategories: [] }
        ],
        modifiers: ["Arizona bourbon", "copper state"],
        base_queries: ["Arizona Distilling bourbon", "Copper City bourbon"]
    },
    {
        name: "Thumb Butte",
        variations: ["Thumb Butte Distillery"],
        region: "Prescott",
        country: "USA",
        type: ["american whiskey"],
        website: "thumbbutte.com",
        priority: 4,
        product_lines: [
            { name: "Bloody Basin Bourbon", subcategories: [] },
            { name: "Western Sage Gin", subcategories: [] }
        ],
        modifiers: ["Arizona whiskey", "high desert"],
        base_queries: ["Thumb Butte whiskey", "Bloody Basin bourbon"]
    },
    {
        name: "Santa Fe Spirits",
        variations: ["Santa Fe Spirits Distillery"],
        region: "Santa Fe",
        country: "USA",
        type: ["american single malt", "bourbon"],
        website: "santafespirits.com",
        priority: 6,
        product_lines: [
            { name: "Colkegan Single Malt", subcategories: ["Mesquite Smoked"] },
            { name: "Wheeler's Gin", subcategories: [] },
            { name: "Silver Coyote", subcategories: [] }
        ],
        modifiers: ["New Mexico whiskey", "mesquite smoke", "high altitude"],
        base_queries: ["Santa Fe Spirits whiskey", "Colkegan single malt"]
    },
    {
        name: "Little Toad Creek",
        variations: ["Little Toad Creek Brewery & Distillery"],
        region: "Silver City",
        country: "USA",
        type: ["bourbon"],
        website: "littletoadcreek.com",
        priority: 4,
        product_lines: [
            { name: "High Desert Bourbon", subcategories: [] },
            { name: "Ponderosa Gin", subcategories: [] }
        ],
        modifiers: ["New Mexico bourbon", "brewstillery"],
        base_queries: ["Little Toad Creek bourbon", "High Desert bourbon"]
    },
    {
        name: "Hollows Spirits",
        variations: ["Hollows Spirits Distillery"],
        region: "El Paso",
        country: "USA",
        type: ["american whiskey"],
        priority: 4,
        product_lines: [
            { name: "Hollows American Whiskey", subcategories: [] }
        ],
        modifiers: ["Texas whiskey", "border town"],
        base_queries: ["Hollows Spirits whiskey"]
    },
    // Northeast
    {
        name: "Tuthilltown",
        variations: ["Tuthilltown Spirits"],
        region: "Gardiner",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        parent_company: "William Grant & Sons",
        website: "hudsonwhiskey.com",
        priority: 7,
        product_lines: [
            { name: "Hudson Baby Bourbon", subcategories: [] },
            { name: "Hudson Manhattan Rye", subcategories: [] },
            { name: "Hudson Single Malt", subcategories: [] },
            { name: "Hudson Four Grain", subcategories: [] }
        ],
        modifiers: ["New York whiskey", "farm distillery", "small casks"],
        base_queries: ["Tuthilltown whiskey", "Hudson whiskey"]
    },
    {
        name: "Berkshire Mountain",
        variations: ["Berkshire Mountain Distillers"],
        region: "Sheffield",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "berkshiremountaindistillers.com",
        priority: 6,
        product_lines: [
            { name: "Berkshire Bourbon", subcategories: [] },
            { name: "Berkshire New England Corn Whiskey", subcategories: [] },
            { name: "Smoke & Peat", subcategories: [] }
        ],
        modifiers: ["Massachusetts whiskey", "corn whiskey", "New England"],
        base_queries: ["Berkshire Mountain whiskey", "Berkshire bourbon"]
    },
    {
        name: "Triple Eight",
        variations: ["Triple Eight Distillery", "888"],
        region: "Nantucket",
        country: "USA",
        type: ["american single malt"],
        website: "ciscobrewers.com",
        priority: 5,
        product_lines: [
            { name: "Notch Single Malt", subcategories: [] },
            { name: "The Hurricane", subcategories: [] }
        ],
        modifiers: ["Nantucket whiskey", "island distillery", "ocean influence"],
        base_queries: ["Triple Eight whiskey", "Notch single malt"]
    },
    {
        name: "Bully Boy",
        variations: ["Bully Boy Distillers"],
        region: "Boston",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "bullyboydistillers.com",
        priority: 6,
        product_lines: [
            { name: "Bully Boy Straight Whiskey", subcategories: [] },
            { name: "Bully Boy American Straight", subcategories: [] },
            { name: "Bully Boy Barrel Proof", subcategories: [] }
        ],
        modifiers: ["Boston whiskey", "estate grown", "farm distillery"],
        base_queries: ["Bully Boy whiskey", "Bully Boy distillers"]
    },
    {
        name: "Boston Harbor",
        variations: ["Boston Harbor Distillery"],
        region: "Boston",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "bostonharbordistillery.com",
        priority: 5,
        product_lines: [
            { name: "Putnam Whiskey", subcategories: ["New England Single Malt", "Rye"] },
            { name: "Spirit of Boston", subcategories: [] }
        ],
        modifiers: ["Boston whiskey", "Seaport district", "Samuel Adams heritage"],
        base_queries: ["Boston Harbor whiskey", "Putnam whiskey"]
    },
    {
        name: "Nashoba Valley",
        variations: ["Nashoba Valley Spirits"],
        region: "Bolton",
        country: "USA",
        type: ["american whiskey"],
        website: "nashobawinery.com",
        priority: 4,
        product_lines: [
            { name: "Nashoba Single Malt", subcategories: [] }
        ],
        modifiers: ["Massachusetts whiskey", "winery distillery"],
        base_queries: ["Nashoba Valley whiskey", "Nashoba spirits"]
    },
    {
        name: "Mad River",
        variations: ["Mad River Distillers"],
        region: "Waitsfield",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "madriverdistillers.com",
        priority: 5,
        product_lines: [
            { name: "Mad River Revolution Rye", subcategories: [] },
            { name: "Mad River Bourbon", subcategories: [] },
            { name: "Mad River PX", subcategories: [] }
        ],
        modifiers: ["Vermont whiskey", "cold climate", "Mad River Valley"],
        base_queries: ["Mad River whiskey", "Mad River distillers"]
    },
    {
        name: "Stonecutter",
        variations: ["Stonecutter Spirits"],
        region: "Middlebury",
        country: "USA",
        type: ["american single malt"],
        website: "stonecutterspirits.com",
        priority: 5,
        product_lines: [
            { name: "Stonecutter Single Barrel", subcategories: [] },
            { name: "Stonecutter Heritage Cask", subcategories: [] }
        ],
        modifiers: ["Vermont whiskey", "single malt", "Middlebury"],
        base_queries: ["Stonecutter whiskey", "Stonecutter spirits"]
    },
    {
        name: "WhistlePig",
        variations: ["WhistlePig Farm", "Whistle Pig"],
        region: "Shoreham",
        country: "USA",
        type: ["rye whiskey"],
        website: "whistlepigwhiskey.com",
        priority: 9,
        product_lines: [
            { name: "WhistlePig 10 Year", subcategories: [] },
            { name: "WhistlePig 12 Year", subcategories: ["Old World"] },
            { name: "WhistlePig 15 Year", subcategories: [] },
            { name: "WhistlePig 18 Year", subcategories: [] },
            { name: "WhistlePig Boss Hog", subcategories: [] }
        ],
        modifiers: ["Vermont rye", "premium rye whiskey", "farm distillery"],
        base_queries: ["WhistlePig rye", "Whistle Pig whiskey"]
    },
    {
        name: "Silo",
        variations: ["Silo Distillery"],
        region: "Windsor",
        country: "USA",
        type: ["bourbon"],
        website: "silodistillery.com",
        priority: 4,
        product_lines: [
            { name: "Silo Solera Bourbon", subcategories: [] },
            { name: "Silo Cucumber Vodka", subcategories: [] }
        ],
        modifiers: ["Vermont bourbon", "solera aging"],
        base_queries: ["Silo bourbon", "Silo distillery"]
    },
    {
        name: "Damnation Alley",
        variations: ["Damnation Alley Distillery"],
        region: "Belmont",
        country: "USA",
        type: ["american whiskey"],
        website: "damnationalleydistillery.com",
        priority: 4,
        product_lines: [
            { name: "Damnation Alley Moonshine", subcategories: [] }
        ],
        modifiers: ["Massachusetts whiskey", "moonshine heritage"],
        base_queries: ["Damnation Alley whiskey"]
    },
    {
        name: "Dirty Water",
        variations: ["Dirty Water Distillery"],
        region: "Plymouth",
        country: "USA",
        type: ["bourbon"],
        website: "dirtywaterdistillery.com",
        priority: 4,
        product_lines: [
            { name: "Dirty Water Bourbon", subcategories: [] }
        ],
        modifiers: ["Massachusetts bourbon", "Plymouth"],
        base_queries: ["Dirty Water bourbon", "Dirty Water distillery"]
    },
    {
        name: "GrandTen",
        variations: ["GrandTen Distilling", "Grand Ten"],
        region: "Boston",
        country: "USA",
        type: ["american whiskey"],
        website: "grandten.com",
        priority: 5,
        product_lines: [
            { name: "GrandTen Fire Puncher", subcategories: [] },
            { name: "GrandTen Craneberry", subcategories: [] },
            { name: "GrandTen Wire Works", subcategories: [] }
        ],
        modifiers: ["Boston whiskey", "experimental spirits", "South Boston"],
        base_queries: ["GrandTen whiskey", "Grand Ten distilling"]
    },
    {
        name: "Short Path",
        variations: ["Short Path Distillery"],
        region: "Everett",
        country: "USA",
        type: ["american whiskey"],
        website: "shortpathdistillery.com",
        priority: 4,
        product_lines: [
            { name: "Short Path Whiskey", subcategories: [] },
            { name: "Short Path Gin", subcategories: [] }
        ],
        modifiers: ["Massachusetts whiskey", "Everett"],
        base_queries: ["Short Path whiskey", "Short Path distillery"]
    },
    {
        name: "Litchfield",
        variations: ["Litchfield Distillery"],
        region: "Litchfield",
        country: "USA",
        type: ["bourbon"],
        website: "litchfielddistillery.com",
        priority: 5,
        product_lines: [
            { name: "Batchers' Bourbon", subcategories: [] },
            { name: "Batchers' Double Barreled", subcategories: [] }
        ],
        modifiers: ["Connecticut bourbon", "Litchfield Hills"],
        base_queries: ["Litchfield bourbon", "Batchers bourbon"]
    },
    {
        name: "Westford Hill",
        variations: ["Westford Hill Distillers"],
        region: "Ashford",
        country: "USA",
        type: ["american single malt"],
        website: "westfordhill.com",
        priority: 4,
        product_lines: [
            { name: "Westford Hill Single Malt", subcategories: [] }
        ],
        modifiers: ["Connecticut whiskey", "single malt"],
        base_queries: ["Westford Hill whiskey", "Westford Hill distillers"]
    },
    {
        name: "Newport",
        variations: ["Newport Distilling", "Newport Craft"],
        region: "Newport",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "newportcraft.com",
        priority: 5,
        product_lines: [
            { name: "Thomas Tew Rum", subcategories: [] },
            { name: "Newport Whiskey", subcategories: [] }
        ],
        modifiers: ["Rhode Island whiskey", "coastal distillery"],
        base_queries: ["Newport whiskey", "Newport distilling"]
    },
    {
        name: "Sons of Liberty",
        variations: ["Sons of Liberty Spirits"],
        region: "South Kingstown",
        country: "USA",
        type: ["american whiskey"],
        website: "solspirits.com",
        priority: 5,
        product_lines: [
            { name: "Battle Cry", subcategories: ["Single Malt", "American"] },
            { name: "Uprising", subcategories: [] }
        ],
        modifiers: ["Rhode Island whiskey", "beer whiskey", "seasonal releases"],
        base_queries: ["Sons of Liberty whiskey", "Battle Cry whiskey"]
    },
    {
        name: "Tamworth",
        variations: ["Tamworth Distilling"],
        region: "Tamworth",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "tamworthdistilling.com",
        priority: 5,
        product_lines: [
            { name: "Tamworth Garden", subcategories: ["White Mountain Rye"] },
            { name: "Chocorua", subcategories: ["Straight Rye"] },
            { name: "Camp Robber", subcategories: ["Bottled-in-Bond"] }
        ],
        modifiers: ["New Hampshire whiskey", "scratch made", "White Mountains"],
        base_queries: ["Tamworth whiskey", "Tamworth distilling"]
    },
    {
        name: "Stark",
        variations: ["Stark Spirits"],
        region: "Manchester",
        country: "USA",
        type: ["american whiskey"],
        priority: 4,
        product_lines: [
            { name: "Stark Whiskey", subcategories: [] }
        ],
        modifiers: ["New Hampshire whiskey"],
        base_queries: ["Stark Spirits whiskey"]
    },
    {
        name: "Flag Hill",
        variations: ["Flag Hill Winery & Distillery"],
        region: "Lee",
        country: "USA",
        type: ["bourbon"],
        website: "flaghill.com",
        priority: 4,
        product_lines: [
            { name: "General John Stark Vodka", subcategories: [] },
            { name: "Flag Hill Bourbon", subcategories: [] }
        ],
        modifiers: ["New Hampshire bourbon", "winery distillery"],
        base_queries: ["Flag Hill bourbon", "Flag Hill whiskey"]
    },
    {
        name: "Caledonia Spirits",
        variations: ["Caledonia Spirits Distillery"],
        region: "Montpelier",
        country: "USA",
        type: ["american whiskey"],
        website: "caledoniaspirits.com",
        priority: 5,
        product_lines: [
            { name: "Barr Hill Gin", subcategories: [] },
            { name: "Barr Hill Reserve", subcategories: [] }
        ],
        modifiers: ["Vermont spirits", "honey spirits", "bee focused"],
        base_queries: ["Caledonia Spirits", "Barr Hill"]
    },
    {
        name: "Smugglers' Notch",
        variations: ["Smugglers Notch Distillery"],
        region: "Jeffersonville",
        country: "USA",
        type: ["bourbon"],
        website: "smugglersnotchdistillery.com",
        priority: 4,
        product_lines: [
            { name: "Smugglers' Notch Bourbon", subcategories: [] },
            { name: "Smugglers' Notch Vodka", subcategories: [] }
        ],
        modifiers: ["Vermont bourbon", "prohibition heritage"],
        base_queries: ["Smugglers Notch bourbon", "Smugglers Notch distillery"]
    },
    {
        name: "Split Rock",
        variations: ["Split Rock Distilling"],
        region: "Newcastle",
        country: "USA",
        type: ["bourbon"],
        website: "splitrockdistilling.com",
        priority: 4,
        product_lines: [
            { name: "Split Rock Bourbon", subcategories: [] },
            { name: "Split Rock Vodka", subcategories: [] }
        ],
        modifiers: ["Maine bourbon", "organic grains"],
        base_queries: ["Split Rock bourbon", "Split Rock distilling"]
    },
    {
        name: "Maine Craft",
        variations: ["Maine Craft Distilling"],
        region: "Portland",
        country: "USA",
        type: ["american whiskey"],
        website: "mainecraftdistilling.com",
        priority: 5,
        product_lines: [
            { name: "Chesuncook", subcategories: [] },
            { name: "Luke's Whiskey", subcategories: [] }
        ],
        modifiers: ["Maine whiskey", "farm to flask"],
        base_queries: ["Maine Craft whiskey", "Chesuncook whiskey"]
    },
    {
        name: "Wiggly Bridge",
        variations: ["Wiggly Bridge Distillery"],
        region: "York",
        country: "USA",
        type: ["bourbon"],
        website: "wigglybridgedistillery.com",
        priority: 4,
        product_lines: [
            { name: "Wiggly Bridge Small Barrel Bourbon", subcategories: [] },
            { name: "Wiggly Bridge White Whiskey", subcategories: [] }
        ],
        modifiers: ["Maine bourbon", "small barrels", "York Beach"],
        base_queries: ["Wiggly Bridge bourbon", "Wiggly Bridge distillery"]
    },
    {
        name: "Sweetgrass",
        variations: ["Sweetgrass Farm Winery & Distillery"],
        region: "Union",
        country: "USA",
        type: ["american whiskey"],
        website: "sweetgrasswinery.com",
        priority: 4,
        product_lines: [
            { name: "Back River Gin", subcategories: [] },
            { name: "Cranberry Island Rum", subcategories: [] }
        ],
        modifiers: ["Maine spirits", "farm distillery"],
        base_queries: ["Sweetgrass spirits", "Sweetgrass distillery"]
    },
    // Southeast
    {
        name: "ASW",
        variations: ["ASW Distillery", "American Spirit Works"],
        region: "Atlanta",
        country: "USA",
        type: ["bourbon", "american single malt"],
        website: "aswdistillery.com",
        priority: 6,
        product_lines: [
            { name: "ASW Fiddler Bourbon", subcategories: ["Unison", "Heartwood"] },
            { name: "ASW American Single Malt", subcategories: [] },
            { name: "ASW Duality", subcategories: [] }
        ],
        modifiers: ["Georgia whiskey", "Atlanta distillery", "Southern whiskey"],
        base_queries: ["ASW whiskey", "American Spirit Works"]
    },
    {
        name: "Old Fourth",
        variations: ["Old Fourth Distillery", "O4D"],
        region: "Atlanta",
        country: "USA",
        type: ["bourbon"],
        website: "o4d.com",
        priority: 5,
        product_lines: [
            { name: "Old Fourth Straight Bourbon", subcategories: [] },
            { name: "Old Fourth Bottled-in-Bond", subcategories: [] }
        ],
        modifiers: ["Georgia bourbon", "Atlanta", "grain to glass"],
        base_queries: ["Old Fourth bourbon", "O4D whiskey"]
    },
    {
        name: "Thirteenth Colony",
        variations: ["13th Colony", "Thirteenth Colony Distilleries"],
        region: "Americus",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "thirteenthcolony.com",
        priority: 5,
        product_lines: [
            { name: "Southern Bourbon", subcategories: [] },
            { name: "Southern Rye", subcategories: [] },
            { name: "Double Oaked", subcategories: [] }
        ],
        modifiers: ["Georgia whiskey", "Southern distillery"],
        base_queries: ["Thirteenth Colony bourbon", "13th Colony whiskey"]
    },
    {
        name: "Lazy Guy",
        variations: ["Lazy Guy Distillery"],
        region: "Kennesaw",
        country: "USA",
        type: ["bourbon"],
        website: "lazyguydistillery.com",
        priority: 4,
        product_lines: [
            { name: "Lazy Guy Bourbon", subcategories: [] },
            { name: "Lazy Guy Vodka", subcategories: [] }
        ],
        modifiers: ["Georgia bourbon", "small batch"],
        base_queries: ["Lazy Guy bourbon", "Lazy Guy distillery"]
    },
    {
        name: "Independent",
        variations: ["Independent Distilling Company"],
        region: "Decatur",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "independentdistilling.com",
        priority: 5,
        product_lines: [
            { name: "Independent Straight Bourbon", subcategories: [] },
            { name: "Independent Rye", subcategories: [] }
        ],
        modifiers: ["Georgia whiskey", "Decatur"],
        base_queries: ["Independent bourbon", "Independent distilling"]
    },
    {
        name: "Stillhouse",
        variations: ["Stillhouse Spirits"],
        region: "Multiple",
        country: "USA",
        type: ["american whiskey"],
        priority: 5,
        product_lines: [
            { name: "Stillhouse Original", subcategories: [] },
            { name: "Stillhouse Black Bourbon", subcategories: [] },
            { name: "Stillhouse Apple Crisp", subcategories: [] }
        ],
        modifiers: ["stainless steel can", "unbreakable packaging"],
        base_queries: ["Stillhouse whiskey", "Stillhouse spirits"]
    },
    {
        name: "Fiddler",
        variations: ["Fiddler Bourbon"],
        region: "Atlanta",
        country: "USA",
        type: ["bourbon"],
        priority: 5,
        product_lines: [
            { name: "Fiddler Unison", subcategories: [] },
            { name: "Fiddler Encore", subcategories: [] }
        ],
        modifiers: ["Georgia bourbon", "music themed"],
        base_queries: ["Fiddler bourbon", "Fiddler whiskey"]
    },
    {
        name: "Graybeard",
        variations: ["Graybeard Distillery"],
        region: "Durham",
        country: "USA",
        type: ["bourbon"],
        website: "graybearddistillery.com",
        priority: 4,
        product_lines: [
            { name: "Graybeard Bourbon", subcategories: [] },
            { name: "Bedlam Vodka", subcategories: [] }
        ],
        modifiers: ["North Carolina bourbon", "Durham"],
        base_queries: ["Graybeard bourbon", "Graybeard distillery"]
    },
    {
        name: "TOPO",
        variations: ["TOPO Distillery", "Top of the Hill"],
        region: "Chapel Hill",
        country: "USA",
        type: ["bourbon"],
        website: "topodistillery.com",
        priority: 5,
        product_lines: [
            { name: "TOPO Eight Oak", subcategories: [] },
            { name: "TOPO Carolina Whiskey", subcategories: [] }
        ],
        modifiers: ["North Carolina whiskey", "organic wheat"],
        base_queries: ["TOPO whiskey", "TOPO distillery"]
    },
    {
        name: "Fair Game",
        variations: ["Fair Game Beverage"],
        region: "Pittsboro",
        country: "USA",
        type: ["bourbon"],
        website: "fairgamebeverage.com",
        priority: 4,
        product_lines: [
            { name: "Fair Game Bottled-in-Bond", subcategories: [] },
            { name: "Fair Game Rye", subcategories: [] }
        ],
        modifiers: ["North Carolina bourbon", "woman owned"],
        base_queries: ["Fair Game bourbon", "Fair Game whiskey"]
    },
    {
        name: "Broad Branch",
        variations: ["Broad Branch Distillery"],
        region: "Winston-Salem",
        country: "USA",
        type: ["bourbon", "american single malt"],
        website: "broadbranchdistillery.com",
        priority: 5,
        product_lines: [
            { name: "Broad Branch Single Malt", subcategories: [] },
            { name: "Broad Branch Nightlab", subcategories: [] }
        ],
        modifiers: ["North Carolina whiskey", "single malt focused"],
        base_queries: ["Broad Branch whiskey", "Broad Branch distillery"]
    },
    {
        name: "Southern Distilling",
        variations: ["Southern Distilling Company"],
        region: "Statesville",
        country: "USA",
        type: ["bourbon"],
        website: "southerndistillingcompany.com",
        priority: 5,
        product_lines: [
            { name: "Southern Star", subcategories: ["Standard", "Paragon", "Double Oak"] },
            { name: "Southern Star Single Barrel", subcategories: [] }
        ],
        modifiers: ["North Carolina bourbon", "contract distilling"],
        base_queries: ["Southern Distilling bourbon", "Southern Star whiskey"]
    },
    {
        name: "Defiant",
        variations: ["Defiant Whisky"],
        region: "Bostic",
        country: "USA",
        type: ["american single malt"],
        website: "defiantwhisky.com",
        priority: 5,
        product_lines: [
            { name: "Defiant American Single Malt", subcategories: [] },
            { name: "Defiant Blue Ridge", subcategories: [] }
        ],
        modifiers: ["North Carolina single malt", "Blue Ridge Mountains"],
        base_queries: ["Defiant whisky", "Defiant single malt"]
    },
    {
        name: "Doc Porter's",
        variations: ["Doc Porters", "Doc Porter's Distillery"],
        region: "Charlotte",
        country: "USA",
        type: ["bourbon"],
        website: "docporters.com",
        priority: 4,
        product_lines: [
            { name: "Doc Porter's Bourbon", subcategories: [] },
            { name: "Doc Porter's Rye", subcategories: [] }
        ],
        modifiers: ["North Carolina bourbon", "Charlotte"],
        base_queries: ["Doc Porter's bourbon", "Doc Porters whiskey"]
    },
    {
        name: "Great Wagon Road",
        variations: ["Great Wagon Road Distilling"],
        region: "Charlotte",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "gwrdistilling.com",
        priority: 4,
        product_lines: [
            { name: "Rua Single Malt", subcategories: [] },
            { name: "Migration Bourbon", subcategories: [] }
        ],
        modifiers: ["North Carolina whiskey", "historic trail"],
        base_queries: ["Great Wagon Road whiskey", "Rua single malt"]
    },
    {
        name: "Muddy River",
        variations: ["Muddy River Distillery"],
        region: "Belmont",
        country: "USA",
        type: ["bourbon"],
        website: "muddyriverdistillery.com",
        priority: 4,
        product_lines: [
            { name: "Queen Charlotte Select", subcategories: [] },
            { name: "Carolina Rum", subcategories: [] }
        ],
        modifiers: ["North Carolina bourbon", "rum focused"],
        base_queries: ["Muddy River bourbon", "Queen Charlotte whiskey"]
    },
    {
        name: "Mystic",
        variations: ["Mystic Farm & Distillery"],
        region: "Durham",
        country: "USA",
        type: ["bourbon"],
        website: "mysticfarm.com",
        priority: 4,
        product_lines: [
            { name: "Mystic Bourbon", subcategories: [] }
        ],
        modifiers: ["North Carolina bourbon", "farm distillery"],
        base_queries: ["Mystic bourbon", "Mystic Farm distillery"]
    },
    {
        name: "High Wire",
        variations: ["High Wire Distilling"],
        region: "Charleston",
        country: "USA",
        type: ["bourbon", "american whiskey"],
        website: "highwiredistilling.com",
        priority: 6,
        product_lines: [
            { name: "High Wire New Southern Revival", subcategories: ["Bourbon", "Rye"] },
            { name: "High Wire Jimmy Red", subcategories: [] },
            { name: "High Wire Sorghum", subcategories: [] }
        ],
        modifiers: ["South Carolina whiskey", "heirloom grains", "Jimmy Red corn"],
        base_queries: ["High Wire bourbon", "High Wire distilling"]
    },
    {
        name: "Virgil Kaine",
        variations: ["Virgil Kaine Whiskey"],
        region: "Charleston",
        country: "USA",
        type: ["bourbon"],
        website: "virgilkaine.com",
        priority: 5,
        product_lines: [
            { name: "Virgil Kaine Lowcountry", subcategories: [] },
            { name: "Virgil Kaine Ginger Bourbon", subcategories: [] },
            { name: "Virgil Kaine Robber Baron", subcategories: [] }
        ],
        modifiers: ["South Carolina bourbon", "chef inspired"],
        base_queries: ["Virgil Kaine bourbon", "Virgil Kaine whiskey"]
    },
    {
        name: "Firefly",
        variations: ["Firefly Distillery"],
        region: "North Charleston",
        country: "USA",
        type: ["bourbon"],
        website: "fireflydistillery.com",
        priority: 5,
        product_lines: [
            { name: "Firefly Southern Bourbon", subcategories: [] },
            { name: "Firefly Sweet Tea Vodka", subcategories: [] }
        ],
        modifiers: ["South Carolina bourbon", "sweet tea vodka creator"],
        base_queries: ["Firefly bourbon", "Firefly distillery"]
    },
    {
        name: "Six & Twenty",
        variations: ["Six and Twenty Distillery"],
        region: "Powdersville",
        country: "USA",
        type: ["bourbon"],
        website: "sixandtwenty.com",
        priority: 4,
        product_lines: [
            { name: "5 Grain Bourbon", subcategories: [] },
            { name: "Carolina Cream", subcategories: [] }
        ],
        modifiers: ["South Carolina bourbon", "5 grain mash"],
        base_queries: ["Six and Twenty bourbon", "Six & Twenty whiskey"]
    },
    {
        name: "Palmetto",
        variations: ["Palmetto Distillery"],
        region: "Anderson",
        country: "USA",
        type: ["american whiskey"],
        website: "palmettodistillery.com",
        priority: 4,
        product_lines: [
            { name: "Palmetto Whiskey", subcategories: [] },
            { name: "Palmetto Moonshine", subcategories: [] }
        ],
        modifiers: ["South Carolina whiskey", "moonshine heritage"],
        base_queries: ["Palmetto whiskey", "Palmetto distillery"]
    },
    {
        name: "Copper Horse",
        variations: ["Copper Horse Distilling"],
        region: "Columbia",
        country: "USA",
        type: ["bourbon"],
        website: "copperhorsedistilling.com",
        priority: 4,
        product_lines: [
            { name: "Copper Horse Bourbon", subcategories: [] }
        ],
        modifiers: ["South Carolina bourbon"],
        base_queries: ["Copper Horse bourbon", "Copper Horse distilling"]
    },
    {
        name: "Dark Corner",
        variations: ["Dark Corner Distillery"],
        region: "Greenville",
        country: "USA",
        type: ["american whiskey"],
        website: "darkcornerdistillery.com",
        priority: 4,
        product_lines: [
            { name: "Lewis Redmond Bourbon", subcategories: [] },
            { name: "Moonshine", subcategories: [] }
        ],
        modifiers: ["South Carolina whiskey", "moonshine tradition"],
        base_queries: ["Dark Corner whiskey", "Lewis Redmond bourbon"]
    },
    {
        name: "Striped Pig",
        variations: ["Striped Pig Distillery"],
        region: "Charleston",
        country: "USA",
        type: ["bourbon"],
        website: "stripedpigdistillery.com",
        priority: 4,
        product_lines: [
            { name: "Striped Pig Straight Bourbon", subcategories: [] }
        ],
        modifiers: ["South Carolina bourbon", "Charleston"],
        base_queries: ["Striped Pig bourbon", "Striped Pig distillery"]
    },
    // Midwest
    {
        name: "J. Henry & Sons",
        variations: ["J Henry", "J. Henry Wisconsin"],
        region: "Dane",
        country: "USA",
        type: ["bourbon"],
        website: "jhenryandsons.com",
        priority: 6,
        product_lines: [
            { name: "J. Henry Small Batch", subcategories: [] },
            { name: "J. Henry Single Barrel", subcategories: [] },
            { name: "J. Henry Cask Strength", subcategories: [] },
            { name: "La Flamme Reserve", subcategories: [] }
        ],
        modifiers: ["Wisconsin bourbon", "farm distillery", "red corn"],
        base_queries: ["J Henry bourbon", "J Henry & Sons whiskey"]
    },
    {
        name: "Wollersheim",
        variations: ["Wollersheim Winery & Distillery"],
        region: "Prairie du Sac",
        country: "USA",
        type: ["bourbon"],
        website: "wollersheim.com",
        priority: 5,
        product_lines: [
            { name: "Wollersheim Bourbon", subcategories: [] },
            { name: "Wollersheim Brandy", subcategories: [] }
        ],
        modifiers: ["Wisconsin bourbon", "winery distillery"],
        base_queries: ["Wollersheim bourbon", "Wollersheim whiskey"]
    },
    {
        name: "Driftless Glen",
        variations: ["Driftless Glen Distillery"],
        region: "Baraboo",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "driftlessglen.com",
        priority: 6,
        product_lines: [
            { name: "Driftless Glen Straight Bourbon", subcategories: [] },
            { name: "Driftless Glen Straight Rye", subcategories: [] },
            { name: "Driftless Glen Single Barrel", subcategories: [] }
        ],
        modifiers: ["Wisconsin whiskey", "Driftless region", "gravity fed"],
        base_queries: ["Driftless Glen bourbon", "Driftless Glen whiskey"]
    },
    {
        name: "Central Standard",
        variations: ["Central Standard Craft Distillery"],
        region: "Milwaukee",
        country: "USA",
        type: ["bourbon"],
        website: "thecentralstandard.com",
        priority: 5,
        product_lines: [
            { name: "North Loop Bourbon", subcategories: [] },
            { name: "Central Standard Bourbon", subcategories: [] }
        ],
        modifiers: ["Wisconsin bourbon", "Milwaukee"],
        base_queries: ["Central Standard bourbon", "North Loop whiskey"]
    },
    {
        name: "Great Northern",
        variations: ["Great Northern Distilling"],
        region: "Plover",
        country: "USA",
        type: ["bourbon", "rye whiskey"],
        website: "greatnortherndistilling.com",
        priority: 4,
        product_lines: [
            { name: "Rye Whiskey", subcategories: [] },
            { name: "Herbalist Gin", subcategories: [] }
        ],
        modifiers: ["Wisconsin whiskey", "potato vodka specialists"],
        base_queries: ["Great Northern whiskey", "Great Northern rye"]
    },
    {
        name: "Dancing Goat",
        variations: ["Dancing Goat Distillery"],
        region: "Cambridge",
        country: "USA",
        type: ["bourbon"],
        website: "dancinggoatdistillery.com",
        priority: 4,
        product_lines: [
            { name: "Limousin Rye", subcategories: [] },
            { name: "Dancing Goat Vodka", subcategories: [] }
        ],
        modifiers: ["Wisconsin spirits", "French oak"],
        base_queries: ["Dancing Goat whiskey", "Limousin rye"]
    },
    {
        name: "45th Parallel",
        variations: ["45th Parallel Distillery"],
        region: "New Richmond",
        country: "USA",
        type: ["bourbon"],
        website: "45thparalleldistillery.com",
        priority: 4,
        product_lines: [
            { name: "Border Bourbon", subcategories: [] },
            { name: "Vodka", subcategories: [] }
        ],
        modifiers: ["Wisconsin bourbon", "45th parallel location"],
        base_queries: ["45th Parallel bourbon", "Border bourbon"]
    },
    {
        name: "Door County",
        variations: ["Door County Distillery"],
        region: "Sturgeon Bay",
        country: "USA",
        type: ["bourbon"],
        website: "doordistillery.com",
        priority: 4,
        product_lines: [
            { name: "Door County Bourbon", subcategories: [] }
        ],
        modifiers: ["Wisconsin bourbon", "cherry capital"],
        base_queries: ["Door County bourbon", "Door County distillery"]
    },
    {
        name: "Yahara Bay",
        variations: ["Yahara Bay Distillers"],
        region: "Madison",
        country: "USA",
        type: ["bourbon"],
        website: "yaharabay.com",
        priority: 4,
        product_lines: [
            { name: "Yahara Bay Bourbon", subcategories: [] },
            { name: "Yahara Bay Rye", subcategories: [] }
        ],
        modifiers: ["Wisconsin whiskey", "Madison"],
        base_queries: ["Yahara Bay bourbon", "Yahara Bay whiskey"]
    },
    {
        name: "State Line",
        variations: ["State Line Distillery"],
        region: "Madison",
        country: "USA",
        type: ["american whiskey"],
        website: "statelinedistillery.com",
        priority: 4,
        product_lines: [
            { name: "North Wisconsin Rye", subcategories: [] }
        ],
        modifiers: ["Wisconsin rye", "craft distillery"],
        base_queries: ["State Line whiskey", "State Line distillery"]
    },
    {
        name: "Rock County",
        variations: ["Rock County Distilling"],
        region: "Janesville",
        country: "USA",
        type: ["bourbon"],
        priority: 3,
        product_lines: [
            { name: "Rock County Bourbon", subcategories: [] }
        ],
        modifiers: ["Wisconsin bourbon"],
        base_queries: ["Rock County bourbon", "Rock County distilling"]
    },
    {
        name: "Northwoods",
        variations: ["Northwoods Distillery"],
        region: "Minong",
        country: "USA",
        type: ["bourbon"],
        priority: 3,
        product_lines: [
            { name: "Northwoods Bourbon", subcategories: [] }
        ],
        modifiers: ["Wisconsin bourbon", "north woods"],
        base_queries: ["Northwoods bourbon", "Northwoods distillery"]
    },
    {
        name: "Old Codger",
        variations: ["Old Codger Distilling"],
        region: "Oneida",
        country: "USA",
        type: ["bourbon"],
        priority: 3,
        product_lines: [
            { name: "Old Codger Bourbon", subcategories: [] }
        ],
        modifiers: ["Wisconsin bourbon"],
        base_queries: ["Old Codger bourbon"]
    },
    {
        name: "La Crosse",
        variations: ["La Crosse Distilling"],
        region: "La Crosse",
        country: "USA",
        type: ["bourbon"],
        website: "lacrossedistilling.com",
        priority: 4,
        product_lines: [
            { name: "Rock & Rye", subcategories: [] },
            { name: "Fieldnotes Vodka", subcategories: [] }
        ],
        modifiers: ["Wisconsin spirits", "river city"],
        base_queries: ["La Crosse distilling", "La Crosse whiskey"]
    },
    {
        name: "Twisted Path",
        variations: ["Twisted Path Distillery"],
        region: "Milwaukee",
        country: "USA",
        type: ["american whiskey"],
        website: "twistedpathdistillery.com",
        priority: 4,
        product_lines: [
            { name: "Twisted Path Vodka", subcategories: [] },
            { name: "Twisted Path Gin", subcategories: [] }
        ],
        modifiers: ["Milwaukee spirits", "craft distillery"],
        base_queries: ["Twisted Path spirits", "Twisted Path distillery"]
    }
];
export const ALL_AMERICAN_CRAFT_DISTILLERIES = AMERICAN_CRAFT_DISTILLERIES;
