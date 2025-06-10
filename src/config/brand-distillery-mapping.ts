/**
 * Brand to Distillery Mapping
 * Maps spirit brands to their parent distilleries
 * Critical for achieving golden data quality (95%+ distillery field coverage)
 */

export const BRAND_TO_DISTILLERY: Record<string, string> = {
  // Buffalo Trace Distillery
  "Buffalo Trace": "Buffalo Trace Distillery",
  "Blanton's": "Buffalo Trace Distillery",
  "Eagle Rare": "Buffalo Trace Distillery",
  "W.L. Weller": "Buffalo Trace Distillery",
  "Pappy Van Winkle": "Buffalo Trace Distillery",
  "E.H. Taylor": "Buffalo Trace Distillery",
  "Stagg": "Buffalo Trace Distillery",
  "Sazerac Rye": "Buffalo Trace Distillery",
  "Hancock's President's Reserve": "Buffalo Trace Distillery",
  "Benchmark": "Buffalo Trace Distillery",
  "Ancient Age": "Buffalo Trace Distillery",
  "Old Charter": "Buffalo Trace Distillery",
  "Rock Hill Farms": "Buffalo Trace Distillery",
  "Elmer T. Lee": "Buffalo Trace Distillery",
  
  // Heaven Hill Distilleries
  "Evan Williams": "Heaven Hill Distilleries",
  "Elijah Craig": "Heaven Hill Distilleries",
  "Henry McKenna": "Heaven Hill Distilleries",
  "Rittenhouse": "Heaven Hill Distilleries",
  "Larceny": "Heaven Hill Distilleries",
  "Old Fitzgerald": "Heaven Hill Distilleries",
  "Bernheim": "Heaven Hill Distilleries",
  "Parker's Heritage": "Heaven Hill Distilleries",
  "Heaven Hill": "Heaven Hill Distilleries",
  "Fighting Cock": "Heaven Hill Distilleries",
  "Mellow Corn": "Heaven Hill Distilleries",
  
  // Wild Turkey Distillery
  "Wild Turkey": "Wild Turkey Distillery",
  "Russell's Reserve": "Wild Turkey Distillery",
  "Rare Breed": "Wild Turkey Distillery",
  "Kentucky Spirit": "Wild Turkey Distillery",
  "Master's Keep": "Wild Turkey Distillery",
  
  // Four Roses Distillery
  "Four Roses": "Four Roses Distillery",
  
  // Maker's Mark Distillery
  "Maker's Mark": "Maker's Mark Distillery",
  "Maker's 46": "Maker's Mark Distillery",
  "Maker's Mark Cask Strength": "Maker's Mark Distillery",
  
  // Jim Beam Distillery
  "Jim Beam": "Jim Beam Distillery",
  "Knob Creek": "Jim Beam Distillery",
  "Booker's": "Jim Beam Distillery",
  "Baker's": "Jim Beam Distillery",
  "Basil Hayden": "Jim Beam Distillery",
  "Old Grand-Dad": "Jim Beam Distillery",
  "Old Crow": "Jim Beam Distillery",
  "Beam's Eight Star": "Jim Beam Distillery",
  
  // Woodford Reserve Distillery
  "Woodford Reserve": "Woodford Reserve Distillery",
  "Old Forester": "Brown-Forman Distillery",
  "Early Times": "Brown-Forman Distillery",
  
  // Jack Daniel's Distillery
  "Jack Daniel's": "Jack Daniel's Distillery",
  "Gentleman Jack": "Jack Daniel's Distillery",
  "Jack Daniel's Single Barrel": "Jack Daniel's Distillery",
  
  // George Dickel Distillery
  "George Dickel": "George Dickel Distillery",
  
  // Bulleit (MGP/Diageo)
  "Bulleit": "MGP Indiana / Diageo",
  
  // Angel's Envy
  "Angel's Envy": "Angel's Envy Distillery",
  
  // Old Forester
  "Old Forester": "Brown-Forman Distillery",
  
  // Michter's
  "Michter's": "Michter's Distillery",
  
  // Scotch Distilleries
  "Macallan": "Macallan Distillery",
  "Glenfiddich": "Glenfiddich Distillery",
  "Glenlivet": "Glenlivet Distillery",
  "Highland Park": "Highland Park Distillery",
  "Ardbeg": "Ardbeg Distillery",
  "Lagavulin": "Lagavulin Distillery",
  "Laphroaig": "Laphroaig Distillery",
  "Talisker": "Talisker Distillery",
  "Oban": "Oban Distillery",
  "Dalmore": "Dalmore Distillery",
  "Balvenie": "Balvenie Distillery",
  "Glenmorangie": "Glenmorangie Distillery",
  "Bowmore": "Bowmore Distillery",
  "Bruichladdich": "Bruichladdich Distillery",
  "Bunnahabhain": "Bunnahabhain Distillery",
  "Caol Ila": "Caol Ila Distillery",
  "Springbank": "Springbank Distillery",
  "Glen Scotia": "Glen Scotia Distillery",
  "Glenfarclas": "Glenfarclas Distillery",
  "Aberlour": "Aberlour Distillery",
  
  // Irish Distilleries
  "Jameson": "Midleton Distillery",
  "Redbreast": "Midleton Distillery",
  "Green Spot": "Midleton Distillery",
  "Yellow Spot": "Midleton Distillery",
  "Powers": "Midleton Distillery",
  "Bushmills": "Bushmills Distillery",
  "Tullamore Dew": "Tullamore Distillery",
  "Teeling": "Teeling Distillery",
  "Proper No. Twelve": "Bushmills Distillery",
  
  // Japanese Distilleries
  "Yamazaki": "Yamazaki Distillery",
  "Hakushu": "Hakushu Distillery",
  "Hibiki": "Suntory Distilleries",
  "Nikka From The Barrel": "Nikka Distilleries",
  "Nikka Coffey": "Nikka Distilleries",
  "Yoichi": "Yoichi Distillery",
  "Miyagikyo": "Miyagikyo Distillery",
  "Chichibu": "Chichibu Distillery",
  "Mars Shinshu": "Mars Shinshu Distillery",
  
  // Canadian Distilleries
  "Crown Royal": "Crown Royal Distillery",
  "Canadian Club": "Hiram Walker Distillery",
  "Seagram's": "Diageo Canada",
  "Pendleton": "Hood River Distillers",
  "Alberta Premium": "Alberta Distillers",
  
  // Tequila Distilleries
  "Patron": "Patron Distillery",
  "Don Julio": "Don Julio Distillery",
  "Casamigos": "Casamigos Distillery",
  "Clase Azul": "Clase Azul Distillery",
  "Casa Noble": "Casa Noble Distillery",
  "Herradura": "Herradura Distillery",
  "El Tesoro": "El Tesoro Distillery",
  "Fortaleza": "Fortaleza Distillery",
  "Espolon": "San Nicolas Distillery",
  "Milagro": "Milagro Distillery",
  "1800": "Jose Cuervo Distillery",
  "Jose Cuervo": "Jose Cuervo Distillery",
  
  // Rum Distilleries
  "Bacardi": "Bacardi Distillery",
  "Captain Morgan": "Captain Morgan Distillery",
  "Mount Gay": "Mount Gay Distillery",
  "Appleton Estate": "Appleton Estate Distillery",
  "Plantation": "Maison Ferrand",
  "Diplomático": "Destilerías Unidas",
  "Ron Zacapa": "Industrias Licoreras de Guatemala",
  "Flor de Caña": "Compañía Licorera de Nicaragua",
  "Havana Club": "San José Distillery",
  "El Dorado": "Demerara Distillers",
  
  // Gin Distilleries
  "Hendrick's": "Hendrick's Gin Distillery",
  "Tanqueray": "Cameron Bridge Distillery",
  "Bombay Sapphire": "Laverstoke Mill Distillery",
  "Beefeater": "Beefeater Distillery",
  "Gordon's": "Cameron Bridge Distillery",
  "Plymouth": "Black Friars Distillery",
  "The Botanist": "Bruichladdich Distillery",
  "Monkey 47": "Black Forest Distillery",
  "Aviation": "House Spirits Distillery",
  
  // Vodka Distilleries
  "Grey Goose": "Grey Goose Distillery",
  "Belvedere": "Polmos Żyrardów Distillery",
  "Absolut": "Absolut Distillery",
  "Ketel One": "Nolet Distillery",
  "Tito's": "Mockingbird Distillery",
  "Smirnoff": "Multiple Distilleries",
  "Stolichnaya": "Latvijas Balzams",
  "Russian Standard": "Russian Standard Distillery",
  "Chopin": "Siedlce Distillery",
  
  // Cognac Houses
  "Hennessy": "Hennessy",
  "Rémy Martin": "Rémy Martin",
  "Martell": "Martell",
  "Courvoisier": "Courvoisier",
  "Camus": "Camus",
  "Hine": "Hine",
  "Hardy": "Hardy Cognac",
  
  // American Craft Distilleries
  "Westland": "Westland Distillery",
  "Balcones": "Balcones Distillery",
  "Stranahan's": "Stranahan's Distillery",
  "High West": "High West Distillery",
  "WhistlePig": "WhistlePig Distillery",
  "Garrison Brothers": "Garrison Brothers Distillery",
  "FEW": "FEW Spirits",
  "St. George": "St. George Spirits",
  "Clear Creek": "Clear Creek Distillery",
  "Corsair": "Corsair Distillery",
  
  // Additional Bourbon/Rye Brands
  "Very Old Barton": "Barton 1792 Distillery",
  "1792": "Barton 1792 Distillery",
  "Old Ezra": "Lux Row Distillers",
  "Rebel Yell": "Lux Row Distillers",
  "David Nicholson": "Lux Row Distillers",
  "Blood Oath": "Lux Row Distillers",
  "Jefferson's": "Kentucky Artisan Distillery",
  "Noah's Mill": "Kentucky Bourbon Distillers",
  "Rowan's Creek": "Kentucky Bourbon Distillers",
  "Black Maple Hill": "Kentucky Bourbon Distillers",
  "Kentucky Owl": "Stoli Group",
  "Uncle Nearest": "Uncle Nearest Distillery",
  "Wheatley": "Buffalo Trace Distillery",
  "Colonel E.H. Taylor": "Buffalo Trace Distillery",
  "George T. Stagg": "Buffalo Trace Distillery",
  "Thomas H. Handy": "Buffalo Trace Distillery",
  "Sazerac": "Buffalo Trace Distillery",
  "Van Winkle": "Buffalo Trace Distillery",
  "McAfee's Benchmark": "Buffalo Trace Distillery",
  "Caribou Crossing": "Buffalo Trace Distillery",
  "Fireball": "Sazerac Company",
  "Southern Comfort": "Sazerac Company",
  
  // MGP Brands (Indiana)
  "Redemption": "MGP Indiana",
  "Smooth Ambler": "MGP Indiana / Smooth Ambler",
  "Belle Meade": "MGP Indiana / Nelson's Green Brier",
  "James E. Pepper": "MGP Indiana / James E. Pepper Distillery",
  "Sagamore Spirit": "MGP Indiana / Sagamore Spirit",
  "Rossville Union": "MGP Indiana",
  "George Remus": "MGP Indiana",
  "Remus Repeal": "MGP Indiana",
  "Eight & Sand": "MGP Indiana",
  
  // Additional Brands
  "Tin Cup": "MGP Indiana",
  "Templeton": "MGP Indiana",
  "Widow Jane": "Widow Jane Distillery",
  "Kings County": "Kings County Distillery",
  "Hudson": "Tuthilltown Distillery",
  "Koval": "Koval Distillery",
  "New Riff": "New Riff Distillery",
  "Rabbit Hole": "Rabbit Hole Distillery",
  "Castle & Key": "Castle & Key Distillery",
  "Bardstown Bourbon Company": "Bardstown Bourbon Company",
  "Barrell": "Independent Bottler (Various Sources)",
  "Joseph Magnus": "Independent Bottler (MGP Indiana)",
  
  // Mezcal
  "Del Maguey": "Various Palenques",
  "Mezcal Vago": "Various Palenques",
  "Ilegal": "Various Palenques",
  "Montelobos": "Montelobos Distillery",
  "Casamigos Mezcal": "Casamigos Distillery",
  "Dos Hombres": "Various Palenques",
  
  // Additional Scotch Brands
  "Johnnie Walker": "Multiple Distilleries (Diageo)",
  "Chivas Regal": "Strathisla Distillery",
  "Dewar's": "Aberfeldy Distillery",
  "Famous Grouse": "Multiple Distilleries",
  "Cutty Sark": "Multiple Distilleries",
  "J&B": "Multiple Distilleries",
  "Ballantine's": "Multiple Distilleries",
  "Grant's": "Girvan Distillery",
  "Teacher's": "Ardmore Distillery",
  "Black & White": "Multiple Distilleries",
  "Buchanan's": "Multiple Distilleries (Diageo)",
  "Compass Box": "Independent Bottler",
  "Monkey Shoulder": "Multiple Distilleries (William Grant)",
};

/**
 * Get distillery for a given brand
 * @param brand The brand name to look up
 * @returns The distillery name or empty string if not found
 */
export function getDistilleryForBrand(brand: string): string {
  // CRITICAL: Special handling for numeric brands like "1792"
  // Only match if it's actually the brand name, not just a number in text
  if (brand === '1792' && BRAND_TO_DISTILLERY['1792']) {
    return BRAND_TO_DISTILLERY['1792'];
  }
  
  // Skip pure numeric strings unless exact match
  if (/^\d+$/.test(brand) && !BRAND_TO_DISTILLERY[brand]) {
    return '';
  }
  
  // Direct lookup
  if (BRAND_TO_DISTILLERY[brand]) {
    return BRAND_TO_DISTILLERY[brand];
  }
  
  // Try case-insensitive lookup
  const brandLower = brand.toLowerCase();
  for (const [key, value] of Object.entries(BRAND_TO_DISTILLERY)) {
    if (key.toLowerCase() === brandLower) {
      return value;
    }
  }
  
  // Try partial match (for variations like "Blanton's Original" -> "Blanton's")
  // BUT skip numeric-only keys to avoid false matches
  for (const [key, value] of Object.entries(BRAND_TO_DISTILLERY)) {
    if (!/^\d+$/.test(key) && (brand.includes(key) || key.includes(brand))) {
      return value;
    }
  }
  
  return '';
}

/**
 * Infer distillery from product name if brand lookup fails
 * @param productName The full product name
 * @returns The distillery name or empty string if not found
 */
export function inferDistilleryFromName(productName: string): string {
  const nameLower = productName.toLowerCase();
  
  // Check for distillery names in the product name itself
  const distilleryPatterns = [
    { pattern: /buffalo trace/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /heaven hill/i, distillery: "Heaven Hill Distilleries" },
    { pattern: /wild turkey/i, distillery: "Wild Turkey Distillery" },
    { pattern: /four roses/i, distillery: "Four Roses Distillery" },
    { pattern: /maker'?s mark/i, distillery: "Maker's Mark Distillery" },
    { pattern: /jim beam/i, distillery: "Jim Beam Distillery" },
    { pattern: /jack daniel/i, distillery: "Jack Daniel's Distillery" },
    { pattern: /george dickel/i, distillery: "George Dickel Distillery" },
    { pattern: /woodford reserve/i, distillery: "Woodford Reserve Distillery" },
    { pattern: /old forester/i, distillery: "Brown-Forman Distillery" },
    { pattern: /evan williams/i, distillery: "Heaven Hill Distilleries" },
    { pattern: /elijah craig/i, distillery: "Heaven Hill Distilleries" },
    { pattern: /knob creek/i, distillery: "Jim Beam Distillery" },
    { pattern: /booker'?s/i, distillery: "Jim Beam Distillery" },
    { pattern: /basil hayden/i, distillery: "Jim Beam Distillery" },
    { pattern: /eagle rare/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /blanton'?s/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /weller/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /pappy/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /van winkle/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /e\.?h\.? taylor/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /colonel taylor/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /stagg/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /sazerac/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /benchmark/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /ancient age/i, distillery: "Buffalo Trace Distillery" },
    { pattern: /henry mckenna/i, distillery: "Heaven Hill Distilleries" },
    { pattern: /rittenhouse/i, distillery: "Heaven Hill Distilleries" },
    { pattern: /larceny/i, distillery: "Heaven Hill Distilleries" },
    { pattern: /old fitzgerald/i, distillery: "Heaven Hill Distilleries" },
    { pattern: /parker'?s heritage/i, distillery: "Heaven Hill Distilleries" },
    { pattern: /russell'?s reserve/i, distillery: "Wild Turkey Distillery" },
    { pattern: /rare breed/i, distillery: "Wild Turkey Distillery" },
    { pattern: /kentucky spirit/i, distillery: "Wild Turkey Distillery" },
    { pattern: /uncle nearest/i, distillery: "Uncle Nearest Distillery" },
    { pattern: /michter'?s/i, distillery: "Michter's Distillery" },
    { pattern: /angel'?s envy/i, distillery: "Angel's Envy Distillery" },
    { pattern: /high west/i, distillery: "High West Distillery" },
    { pattern: /whistlepig/i, distillery: "WhistlePig Distillery" },
    { pattern: /westland/i, distillery: "Westland Distillery" },
    { pattern: /balcones/i, distillery: "Balcones Distillery" },
    { pattern: /stranahan'?s/i, distillery: "Stranahan's Distillery" },
    { pattern: /garrison brothers/i, distillery: "Garrison Brothers Distillery" },
    { pattern: /new riff/i, distillery: "New Riff Distillery" },
    { pattern: /bardstown bourbon/i, distillery: "Bardstown Bourbon Company" },
  ];
  
  for (const { pattern, distillery } of distilleryPatterns) {
    if (pattern.test(productName)) {
      return distillery;
    }
  }
  
  return '';
}