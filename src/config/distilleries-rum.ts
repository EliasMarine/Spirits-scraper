import { DistilleryConfig } from './index.js';

export const RUM_DISTILLERIES: DistilleryConfig[] = [
  // Caribbean - Barbados
  {
    name: "Mount Gay",
    variations: ["Mount Gay Rum", "Mount Gay Distilleries"],
    region: "Barbados",
    country: "Barbados",
    type: ["rum"],
    parent_company: "Rémy Cointreau",
    website: "mountgayrum.com",
    priority: 9,
    product_lines: [
      { name: "Mount Gay Silver", subcategories: [] },
      { name: "Mount Gay Eclipse", subcategories: [] },
      { name: "Mount Gay Black Barrel", subcategories: [] },
      { name: "Mount Gay XO", subcategories: [] },
      { name: "Mount Gay 1703", subcategories: ["Master Select", "Old Cask Selection"] }
    ],
    modifiers: ["oldest rum distillery", "since 1703", "Barbados rum"],
    base_queries: ["Mount Gay rum", "Mount Gay Barbados"]
  },
  {
    name: "Foursquare",
    variations: ["Foursquare Rum Distillery", "R.L. Seale"],
    region: "Barbados",
    country: "Barbados",
    type: ["rum"],
    parent_company: "R.L. Seale & Company",
    website: "foursquarerum.com",
    priority: 9,
    product_lines: [
      { name: "Doorly's", subcategories: ["3 Year", "5 Year", "8 Year", "12 Year", "XO"] },
      { name: "Real McCoy", subcategories: ["3 Year", "5 Year", "12 Year"] },
      { name: "Foursquare ECS", subcategories: ["2007", "2008", "2009", "Sagacity", "Dominus"] },
      { name: "Probitas", subcategories: [] }
    ],
    modifiers: ["exceptional cask selection", "pot and column still", "single blended rum"],
    base_queries: ["Foursquare rum", "Doorly's rum", "Real McCoy rum"]
  },
  {
    name: "Plantation",
    variations: ["Plantation Rum", "Maison Ferrand"],
    region: "Barbados",
    country: "Barbados",
    type: ["rum"],
    parent_company: "Maison Ferrand",
    website: "plantationrum.com",
    priority: 8,
    product_lines: [
      { name: "Plantation 3 Stars", subcategories: [] },
      { name: "Plantation Original Dark", subcategories: [] },
      { name: "Plantation Grande Reserve", subcategories: ["5 Year", "Barbados"] },
      { name: "Plantation XO", subcategories: ["20th Anniversary"] },
      { name: "Plantation Single Cask", subcategories: ["Fiji", "Jamaica", "Barbados", "Trinidad"] }
    ],
    modifiers: ["double aging", "cognac cask finish", "terroir series"],
    base_queries: ["Plantation rum", "Plantation XO"]
  },

  // Caribbean - Jamaica
  {
    name: "Appleton Estate",
    variations: ["Appleton", "J. Wray & Nephew"],
    region: "Jamaica",
    country: "Jamaica",
    type: ["rum"],
    parent_company: "Campari Group",
    website: "appletonestate.com",
    priority: 9,
    product_lines: [
      { name: "Appleton Estate Signature", subcategories: [] },
      { name: "Appleton Estate Reserve", subcategories: ["8 Year"] },
      { name: "Appleton Estate Rare", subcategories: ["12 Year"] },
      { name: "Appleton Estate", subcategories: ["15 Year", "21 Year", "30 Year", "50 Year"] },
      { name: "Joy Anniversary Blend", subcategories: ["25 Year", "35 Year"] }
    ],
    modifiers: ["Jamaica rum", "pot still", "Nassau Valley"],
    base_queries: ["Appleton Estate rum", "Appleton Jamaica"]
  },
  {
    name: "Hampden Estate",
    variations: ["Hampden", "Hampden Rum"],
    region: "Trelawny",
    country: "Jamaica",
    type: ["rum"],
    priority: 8,
    product_lines: [
      { name: "Rum Fire", subcategories: [] },
      { name: "Hampden Estate", subcategories: ["46", "60"] },
      { name: "Hampden Great House", subcategories: ["2020", "2021"] },
      { name: "Hampden Single Mark", subcategories: ["HLCF", "LROK", "DOK"] }
    ],
    modifiers: ["high ester", "funky rum", "pot still only"],
    base_queries: ["Hampden Estate rum", "Hampden Jamaica"]
  },
  {
    name: "Worthy Park",
    variations: ["Worthy Park Estate", "Rum Bar"],
    region: "Jamaica",
    country: "Jamaica",
    type: ["rum"],
    priority: 8,
    product_lines: [
      { name: "Rum Bar Silver", subcategories: [] },
      { name: "Rum Bar Gold", subcategories: [] },
      { name: "Rum Bar Overproof", subcategories: [] },
      { name: "Worthy Park Single Estate", subcategories: [] },
      { name: "Worthy Park 109", subcategories: [] }
    ],
    modifiers: ["single estate", "pot still", "column still"],
    base_queries: ["Worthy Park rum", "Rum Bar Jamaica"]
  },

  // Caribbean - Puerto Rico
  {
    name: "Bacardi",
    variations: ["Bacardi Rum", "Casa Bacardi"],
    region: "Puerto Rico",
    country: "Puerto Rico",
    type: ["rum"],
    parent_company: "Bacardi Limited",
    website: "bacardi.com",
    priority: 10,
    product_lines: [
      { name: "Bacardi Superior", subcategories: [] },
      { name: "Bacardi Gold", subcategories: [] },
      { name: "Bacardi Black", subcategories: [] },
      { name: "Bacardi 8", subcategories: [] },
      { name: "Bacardi Reserva Ocho", subcategories: [] },
      { name: "Bacardi Gran Reserva", subcategories: ["10 Year", "16 Year", "Limitada"] }
    ],
    modifiers: ["world's most awarded", "white rum", "Puerto Rico"],
    base_queries: ["Bacardi rum", "Bacardi Puerto Rico"]
  },
  {
    name: "Don Q",
    variations: ["DonQ", "Destilería Serrallés"],
    region: "Ponce",
    country: "Puerto Rico",
    type: ["rum"],
    parent_company: "Destilería Serrallés",
    website: "donq.com",
    priority: 8,
    product_lines: [
      { name: "Don Q Cristal", subcategories: [] },
      { name: "Don Q Gold", subcategories: [] },
      { name: "Don Q Añejo", subcategories: [] },
      { name: "Don Q Gran Añejo", subcategories: [] },
      { name: "Don Q Single Barrel", subcategories: ["2007", "2009"] }
    ],
    modifiers: ["Puerto Rican rum", "Serrallés family", "since 1865"],
    base_queries: ["Don Q rum", "DonQ Puerto Rico"]
  },

  // Caribbean - Cuba
  {
    name: "Havana Club",
    variations: ["Havana Club International", "Havana Club Cuban"],
    region: "Havana",
    country: "Cuba",
    type: ["rum"],
    parent_company: "Pernod Ricard/Cuba Ron",
    website: "havana-club.com",
    priority: 9,
    product_lines: [
      { name: "Havana Club Añejo", subcategories: ["3 Años", "Especial", "7 Años"] },
      { name: "Havana Club Reserva", subcategories: [] },
      { name: "Havana Club Selección de Maestros", subcategories: [] },
      { name: "Havana Club Unión", subcategories: [] },
      { name: "Havana Club Máximo", subcategories: [] }
    ],
    modifiers: ["Cuban rum", "aged in Cuba", "ron de Cuba"],
    base_queries: ["Havana Club rum", "Havana Club Cuban"]
  },
  {
    name: "Santiago de Cuba",
    variations: ["Ron Santiago de Cuba", "Santiago"],
    region: "Santiago de Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Santiago de Cuba Carta Blanca", subcategories: [] },
      { name: "Santiago de Cuba Añejo", subcategories: [] },
      { name: "Santiago de Cuba 11 Años", subcategories: [] },
      { name: "Santiago de Cuba 12 Años", subcategories: [] },
      { name: "Santiago de Cuba Extra Añejo", subcategories: ["20 Años", "25 Años"] }
    ],
    modifiers: ["Cuban heritage", "Santiago distillery"],
    base_queries: ["Santiago de Cuba rum", "Ron Santiago"]
  },

  // Caribbean - Trinidad
  {
    name: "Angostura",
    variations: ["House of Angostura", "Angostura Rum"],
    region: "Trinidad",
    country: "Trinidad and Tobago",
    type: ["rum"],
    website: "angostura.com",
    priority: 8,
    product_lines: [
      { name: "Angostura Reserva", subcategories: [] },
      { name: "Angostura 5 Year", subcategories: [] },
      { name: "Angostura 7 Year", subcategories: [] },
      { name: "Angostura 1824", subcategories: [] },
      { name: "Angostura 1919", subcategories: [] },
      { name: "Angostura Single Barrel", subcategories: [] }
    ],
    modifiers: ["Trinidad rum", "butterfly logo", "House of Angostura"],
    base_queries: ["Angostura rum", "Angostura Trinidad"]
  },

  // Caribbean - Dominican Republic
  {
    name: "Brugal",
    variations: ["Ron Brugal", "Brugal Rum"],
    region: "Puerto Plata",
    country: "Dominican Republic",
    type: ["rum"],
    parent_company: "Edrington Group",
    website: "brugal-rum.com",
    priority: 8,
    product_lines: [
      { name: "Brugal Añejo", subcategories: [] },
      { name: "Brugal Extra Dry", subcategories: [] },
      { name: "Brugal Extra Viejo", subcategories: [] },
      { name: "Brugal 1888", subcategories: [] },
      { name: "Brugal Leyenda", subcategories: [] },
      { name: "Brugal Papá Andrés", subcategories: [] }
    ],
    modifiers: ["Dominican rum", "dry rum", "desde 1888"],
    base_queries: ["Brugal rum", "Ron Brugal Dominican"]
  },
  {
    name: "Barceló",
    variations: ["Ron Barceló", "Barcelo Rum"],
    region: "Santo Domingo",
    country: "Dominican Republic",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Barceló Añejo", subcategories: [] },
      { name: "Barceló Gran Añejo", subcategories: [] },
      { name: "Barceló Imperial", subcategories: [] },
      { name: "Barceló Imperial Premium Blend", subcategories: ["30 Aniversario"] },
      { name: "Barceló Organic", subcategories: [] }
    ],
    modifiers: ["Dominican tradition", "Ron Dominicano"],
    base_queries: ["Barcelo rum", "Ron Barcelo"]
  },

  // Caribbean - Martinique (Rhum Agricole)
  {
    name: "Rhum Clément",
    variations: ["Clement", "Rhum Clement"],
    region: "Martinique",
    country: "Martinique",
    type: ["rum", "rhum agricole"],
    website: "rhum-clement.com",
    priority: 8,
    product_lines: [
      { name: "Clément Blanc", subcategories: ["50°", "55°"] },
      { name: "Clément Select Barrel", subcategories: [] },
      { name: "Clément VSOP", subcategories: [] },
      { name: "Clément XO", subcategories: [] },
      { name: "Clément Colonne Créole", subcategories: [] }
    ],
    modifiers: ["rhum agricole", "AOC Martinique", "sugarcane juice"],
    base_queries: ["Rhum Clement", "Clement Martinique"]
  },
  {
    name: "Rhum JM",
    variations: ["J.M", "Rhum J.M"],
    region: "Macouba",
    country: "Martinique",
    type: ["rum", "rhum agricole"],
    priority: 8,
    product_lines: [
      { name: "JM Blanc", subcategories: ["50°", "55°"] },
      { name: "JM Gold", subcategories: [] },
      { name: "JM VSOP", subcategories: [] },
      { name: "JM XO", subcategories: [] },
      { name: "JM Vintage", subcategories: ["1997", "1999", "2000"] }
    ],
    modifiers: ["volcanic terroir", "single estate", "AOC Martinique"],
    base_queries: ["Rhum JM", "JM Martinique"]
  },
  {
    name: "Neisson",
    variations: ["Rhum Neisson", "Distillerie Neisson"],
    region: "Carbet",
    country: "Martinique",
    type: ["rum", "rhum agricole"],
    priority: 7,
    product_lines: [
      { name: "Neisson Blanc", subcategories: ["50°", "52.5°", "70°"] },
      { name: "Neisson Élevé Sous Bois", subcategories: [] },
      { name: "Neisson Réserve Spéciale", subcategories: [] },
      { name: "Neisson Extra Vieux", subcategories: [] },
      { name: "Neisson Single Cask", subcategories: [] }
    ],
    modifiers: ["family distillery", "AOC Martinique", "Savalle column"],
    base_queries: ["Rhum Neisson", "Neisson agricole"]
  },

  // Central America
  {
    name: "Flor de Caña",
    variations: ["Flor de Cana", "Compañía Licorera de Nicaragua"],
    region: "Chichigalpa",
    country: "Nicaragua",
    type: ["rum"],
    website: "flordecana.com",
    priority: 8,
    product_lines: [
      { name: "Flor de Caña 4", subcategories: ["Extra Seco", "Gold"] },
      { name: "Flor de Caña 5", subcategories: [] },
      { name: "Flor de Caña 7", subcategories: [] },
      { name: "Flor de Caña 12", subcategories: [] },
      { name: "Flor de Caña 18", subcategories: [] },
      { name: "Flor de Caña 25", subcategories: [] }
    ],
    modifiers: ["Nicaragua rum", "volcanic soil", "carbon neutral"],
    base_queries: ["Flor de Caña rum", "Flor de Cana Nicaragua"]
  },
  {
    name: "Ron Zacapa",
    variations: ["Zacapa", "Ron Zacapa Centenario"],
    region: "Quetzaltenango",
    country: "Guatemala",
    type: ["rum"],
    parent_company: "Diageo",
    website: "zacaparum.com",
    priority: 9,
    product_lines: [
      { name: "Zacapa 23", subcategories: [] },
      { name: "Zacapa Edición Negra", subcategories: [] },
      { name: "Zacapa XO", subcategories: [] },
      { name: "Zacapa Royal", subcategories: [] },
      { name: "Zacapa La Doma", subcategories: [] }
    ],
    modifiers: ["sistema solera", "house above the clouds", "Guatemala"],
    base_queries: ["Ron Zacapa", "Zacapa rum Guatemala"]
  },
  {
    name: "Diplomático",
    variations: ["Ron Diplomatico", "Diplomatico Rum"],
    region: "La Miel",
    country: "Venezuela",
    type: ["rum"],
    website: "diplomaticorum.com",
    priority: 8,
    product_lines: [
      { name: "Diplomático Planas", subcategories: [] },
      { name: "Diplomático Mantuano", subcategories: [] },
      { name: "Diplomático Reserva Exclusiva", subcategories: [] },
      { name: "Diplomático Single Vintage", subcategories: ["2007", "2008"] },
      { name: "Diplomático Ambassador", subcategories: [] }
    ],
    modifiers: ["Venezuelan rum", "Don Juancho", "sugar cane honey"],
    base_queries: ["Diplomatico rum", "Ron Diplomatico Venezuela"]
  },

  // South America
  {
    name: "Cachaça 51",
    variations: ["51", "Pirassununga 51"],
    region: "Pirassununga",
    country: "Brazil",
    type: ["rum", "cachaça"],
    priority: 7,
    product_lines: [
      { name: "Cachaça 51", subcategories: [] },
      { name: "51 Gold", subcategories: [] },
      { name: "51 Ice", subcategories: [] }
    ],
    modifiers: ["Brazilian cachaça", "most consumed"],
    base_queries: ["Cachaça 51", "51 Brazil"]
  },
  {
    name: "Leblon",
    variations: ["Leblon Cachaça"],
    region: "Minas Gerais",
    country: "Brazil",
    type: ["rum", "cachaça"],
    priority: 7,
    product_lines: [
      { name: "Leblon Cachaça", subcategories: [] },
      { name: "Leblon Reserva Especial", subcategories: [] }
    ],
    modifiers: ["premium cachaça", "sugarcane brandy"],
    base_queries: ["Leblon cachaça", "Leblon Brazil"]
  },
  {
    name: "Novo Fogo",
    variations: ["Novo Fogo Cachaça"],
    region: "Morretes",
    country: "Brazil",
    type: ["rum", "cachaça"],
    priority: 6,
    product_lines: [
      { name: "Novo Fogo Silver", subcategories: [] },
      { name: "Novo Fogo Gold", subcategories: [] },
      { name: "Novo Fogo Barrel-Aged", subcategories: [] },
      { name: "Novo Fogo Single Barrel", subcategories: [] }
    ],
    modifiers: ["organic cachaça", "rainforest"],
    base_queries: ["Novo Fogo cachaça", "Novo Fogo organic"]
  },

  // Caribbean - Other Islands
  {
    name: "Mount Gilboa",
    variations: ["Mount Gilboa Rum"],
    region: "St. Vincent",
    country: "Saint Vincent and the Grenadines",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Mount Gilboa White", subcategories: [] },
      { name: "Mount Gilboa Dark", subcategories: [] },
      { name: "Mount Gilboa Spiced", subcategories: [] }
    ],
    modifiers: ["St. Vincent rum", "small island"],
    base_queries: ["Mount Gilboa rum", "St Vincent rum"]
  },
  {
    name: "Bumbu",
    variations: ["Bumbu Rum Company"],
    region: "Barbados",
    country: "Barbados",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Bumbu Original", subcategories: [] },
      { name: "Bumbu XO", subcategories: [] },
      { name: "Bumbu Crème", subcategories: [] }
    ],
    modifiers: ["craft rum", "spiced rum", "heritage blend"],
    base_queries: ["Bumbu rum", "Bumbu Barbados"]
  },
  {
    name: "Chairman's Reserve",
    variations: ["Chairman's", "St. Lucia Distillers"],
    region: "St. Lucia",
    country: "Saint Lucia",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Chairman's Reserve Original", subcategories: [] },
      { name: "Chairman's Reserve Spiced", subcategories: [] },
      { name: "Chairman's Reserve White Label", subcategories: [] },
      { name: "Chairman's Reserve Forgotten Casks", subcategories: [] },
      { name: "Chairman's Reserve Legacy", subcategories: [] }
    ],
    modifiers: ["St. Lucia rum", "pot and column blend"],
    base_queries: ["Chairman's Reserve rum", "St Lucia rum"]
  },

  // Spiced and Flavored Rums
  {
    name: "Captain Morgan",
    variations: ["Captain Morgan Rum"],
    region: "Multiple",
    country: "Multiple",
    type: ["rum", "spiced rum"],
    parent_company: "Diageo",
    website: "captainmorgan.com",
    priority: 9,
    product_lines: [
      { name: "Captain Morgan Original Spiced", subcategories: [] },
      { name: "Captain Morgan White", subcategories: [] },
      { name: "Captain Morgan Black Spiced", subcategories: [] },
      { name: "Captain Morgan Private Stock", subcategories: [] },
      { name: "Captain Morgan 100 Proof", subcategories: [] }
    ],
    modifiers: ["spiced rum", "Caribbean rum"],
    base_queries: ["Captain Morgan rum", "Captain Morgan spiced"]
  },
  {
    name: "Sailor Jerry",
    variations: ["Sailor Jerry Spiced Rum"],
    region: "Caribbean",
    country: "Multiple",
    type: ["rum", "spiced rum"],
    parent_company: "William Grant & Sons",
    priority: 8,
    product_lines: [
      { name: "Sailor Jerry Spiced", subcategories: [] },
      { name: "Sailor Jerry Savage Apple", subcategories: [] }
    ],
    modifiers: ["Navy rum", "spiced rum", "Norman Collins"],
    base_queries: ["Sailor Jerry rum", "Sailor Jerry spiced"]
  },
  {
    name: "Kraken",
    variations: ["The Kraken", "Kraken Black Spiced Rum"],
    region: "Caribbean",
    country: "Trinidad and Tobago",
    type: ["rum", "spiced rum"],
    parent_company: "Proximo Spirits",
    priority: 8,
    product_lines: [
      { name: "Kraken Black Spiced", subcategories: [] },
      { name: "Kraken Gold Spiced", subcategories: [] },
      { name: "Kraken Black Roast", subcategories: [] }
    ],
    modifiers: ["black spiced rum", "94 proof", "squid ink bottle"],
    base_queries: ["Kraken rum", "Kraken black spiced"]
  },

  // Premium and Craft Rums
  {
    name: "Privateer",
    variations: ["Privateer Rum"],
    region: "Massachusetts",
    country: "USA",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Privateer Silver Reserve", subcategories: [] },
      { name: "Privateer Amber", subcategories: [] },
      { name: "Privateer Navy Yard", subcategories: [] },
      { name: "Privateer Queen's Share", subcategories: [] },
      { name: "Privateer Letter of Marque", subcategories: [] }
    ],
    modifiers: ["American rum", "New England rum", "craft distillery"],
    base_queries: ["Privateer rum", "Privateer Massachusetts"]
  },
  {
    name: "Richland",
    variations: ["Richland Rum", "Richland Distilling"],
    region: "Georgia",
    country: "USA",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Richland Single Estate", subcategories: [] },
      { name: "Richland Rum", subcategories: [] },
      { name: "Richland Virgin Coastal", subcategories: [] }
    ],
    modifiers: ["single estate rum", "Georgia rum", "virgin sugarcane"],
    base_queries: ["Richland rum", "Richland Georgia"]
  },
  {
    name: "Koloa",
    variations: ["Koloa Rum Company"],
    region: "Hawaii",
    country: "USA",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Koloa White", subcategories: [] },
      { name: "Koloa Gold", subcategories: [] },
      { name: "Koloa Dark", subcategories: [] },
      { name: "Koloa Spice", subcategories: [] },
      { name: "Koloa Coffee", subcategories: [] }
    ],
    modifiers: ["Hawaiian rum", "Kauai", "single batch"],
    base_queries: ["Koloa rum", "Koloa Hawaii"]
  },

  // Asian Rums
  {
    name: "Tanduay",
    variations: ["Tanduay Distillers"],
    region: "Philippines",
    country: "Philippines",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Tanduay Superior", subcategories: [] },
      { name: "Tanduay Select", subcategories: [] },
      { name: "Tanduay Double Rum", subcategories: [] },
      { name: "Tanduay Asian Rum", subcategories: ["Gold", "Silver"] }
    ],
    modifiers: ["Philippine rum", "Asian rum"],
    base_queries: ["Tanduay rum", "Tanduay Philippines"]
  },
  {
    name: "Old Monk",
    variations: ["Old Monk Rum"],
    region: "Ghaziabad",
    country: "India",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Old Monk 7 Year", subcategories: [] },
      { name: "Old Monk Gold Reserve", subcategories: [] },
      { name: "Old Monk Supreme", subcategories: [] },
      { name: "Old Monk Legend", subcategories: [] }
    ],
    modifiers: ["Indian rum", "dark rum", "iconic bottle"],
    base_queries: ["Old Monk rum", "Old Monk India"]
  },
  {
    name: "Mekhong",
    variations: ["Mekhong Spirit", "Mekhong Thai Spirit"],
    region: "Thailand",
    country: "Thailand",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Mekhong", subcategories: [] },
      { name: "Mekhong Black", subcategories: [] }
    ],
    modifiers: ["Thai spirit", "sugarcane and rice"],
    base_queries: ["Mekhong rum", "Mekhong Thailand"]
  },

  // Australian Rums
  {
    name: "Bundaberg",
    variations: ["Bundy", "Bundaberg Rum"],
    region: "Queensland",
    country: "Australia",
    type: ["rum"],
    parent_company: "Diageo",
    priority: 8,
    product_lines: [
      { name: "Bundaberg Original", subcategories: [] },
      { name: "Bundaberg Select Vat", subcategories: [] },
      { name: "Bundaberg Small Batch", subcategories: [] },
      { name: "Bundaberg Master Distillers' Collection", subcategories: [] },
      { name: "Bundaberg Black", subcategories: [] }
    ],
    modifiers: ["Australian rum", "Bundy bear", "Queensland"],
    base_queries: ["Bundaberg rum", "Bundy rum Australia"]
  },
  {
    name: "Beenleigh",
    variations: ["Beenleigh Artisan Distillers"],
    region: "Queensland",
    country: "Australia",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Beenleigh White", subcategories: [] },
      { name: "Beenleigh Copper Pot", subcategories: [] },
      { name: "Beenleigh 5 Year", subcategories: [] },
      { name: "Beenleigh Double Cask", subcategories: [] }
    ],
    modifiers: ["oldest distillery Australia", "artisan rum"],
    base_queries: ["Beenleigh rum", "Beenleigh Queensland"]
  },

  // European Rums
  {
    name: "Black Tot",
    variations: ["Black Tot Rum"],
    region: "UK",
    country: "United Kingdom",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Black Tot Rum", subcategories: [] },
      { name: "Black Tot Finest Caribbean", subcategories: [] },
      { name: "Black Tot Master Blender's Reserve", subcategories: [] },
      { name: "Black Tot 50th Anniversary", subcategories: [] }
    ],
    modifiers: ["British Navy tradition", "last consignment"],
    base_queries: ["Black Tot rum", "Black Tot British Navy"]
  },
  {
    name: "Trois Rivières",
    variations: ["Trois Rivieres", "3 Rivières"],
    region: "Martinique",
    country: "Martinique",
    type: ["rum", "rhum agricole"],
    priority: 7,
    product_lines: [
      { name: "Trois Rivières Blanc", subcategories: ["50°", "55°"] },
      { name: "Trois Rivières Ambré", subcategories: [] },
      { name: "Trois Rivières VSOP", subcategories: [] },
      { name: "Trois Rivières Triple Millésime", subcategories: [] },
      { name: "Trois Rivières Single Cask", subcategories: [] }
    ],
    modifiers: ["AOC Martinique", "plantation rum", "Petite Guinée"],
    base_queries: ["Trois Rivières rhum", "3 Rivieres Martinique"]
  },

  // More Caribbean Producers
  {
    name: "Cockspur",
    variations: ["Cockspur Rum"],
    region: "Barbados",
    country: "Barbados",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Cockspur Fine Rum", subcategories: [] },
      { name: "Cockspur VSOR", subcategories: [] },
      { name: "Cockspur 12", subcategories: [] },
      { name: "Cockspur Old Gold", subcategories: [] }
    ],
    modifiers: ["Barbados rum", "since 1884"],
    base_queries: ["Cockspur rum", "Cockspur Barbados"]
  },
  {
    name: "El Dorado",
    variations: ["El Dorado Rum", "Demerara Distillers"],
    region: "Demerara",
    country: "Guyana",
    type: ["rum"],
    priority: 8,
    product_lines: [
      { name: "El Dorado 3 Year", subcategories: [] },
      { name: "El Dorado 5 Year", subcategories: [] },
      { name: "El Dorado 8 Year", subcategories: [] },
      { name: "El Dorado 12 Year", subcategories: [] },
      { name: "El Dorado 15 Year", subcategories: [] },
      { name: "El Dorado 21 Year", subcategories: [] }
    ],
    modifiers: ["Demerara rum", "wooden stills", "Guyana"],
    base_queries: ["El Dorado rum", "Demerara rum Guyana"]
  },
  {
    name: "Goslings",
    variations: ["Gosling's", "Goslings Rum"],
    region: "Bermuda",
    country: "Bermuda",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Goslings Black Seal", subcategories: [] },
      { name: "Goslings Gold", subcategories: [] },
      { name: "Goslings Old Rum", subcategories: [] },
      { name: "Goslings Family Reserve", subcategories: [] }
    ],
    modifiers: ["Bermuda rum", "Dark 'n Stormy", "black seal"],
    base_queries: ["Goslings rum", "Goslings Bermuda"]
  },
  {
    name: "Myers's",
    variations: ["Myers's Rum", "Myers Dark Rum"],
    region: "Jamaica",
    country: "Jamaica",
    type: ["rum"],
    parent_company: "Sazerac",
    priority: 7,
    product_lines: [
      { name: "Myers's Original Dark", subcategories: [] },
      { name: "Myers's Legend", subcategories: [] }
    ],
    modifiers: ["Jamaican dark rum", "planters punch"],
    base_queries: ["Myers's rum", "Myers dark rum"]
  },
  {
    name: "Pusser's",
    variations: ["Pussers", "Pusser's Rum"],
    region: "British Virgin Islands",
    country: "British Virgin Islands",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Pusser's Blue Label", subcategories: [] },
      { name: "Pusser's Select Aged 151", subcategories: [] },
      { name: "Pusser's Gunpowder Proof", subcategories: [] },
      { name: "Pusser's 15 Year", subcategories: [] }
    ],
    modifiers: ["British Navy rum", "original navy rum", "wooden pot still"],
    base_queries: ["Pusser's rum", "Pussers navy rum"]
  },
  {
    name: "Ron del Barrilito",
    variations: ["Barrilito", "Ron del Barrilito"],
    region: "Bayamón",
    country: "Puerto Rico",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Ron del Barrilito 2 Star", subcategories: [] },
      { name: "Ron del Barrilito 3 Star", subcategories: [] },
      { name: "Ron del Barrilito 5 Star", subcategories: [] }
    ],
    modifiers: ["Puerto Rico rum", "oldest rum Puerto Rico", "since 1880"],
    base_queries: ["Ron del Barrilito", "Barrilito Puerto Rico"]
  },
  {
    name: "Wray & Nephew",
    variations: ["Wray and Nephew", "J. Wray"],
    region: "Jamaica",
    country: "Jamaica",
    type: ["rum"],
    parent_company: "Campari Group",
    priority: 8,
    product_lines: [
      { name: "Wray & Nephew White Overproof", subcategories: [] },
      { name: "Wray & Nephew Gold", subcategories: [] }
    ],
    modifiers: ["overproof rum", "white rum", "63% ABV"],
    base_queries: ["Wray and Nephew rum", "Wray Nephew overproof"]
  },

  // More Central American Producers
  {
    name: "Ron Abuelo",
    variations: ["Abuelo", "Varela Hermanos"],
    region: "Pesé",
    country: "Panama",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Ron Abuelo Añejo", subcategories: [] },
      { name: "Ron Abuelo 7 Años", subcategories: [] },
      { name: "Ron Abuelo 12 Años", subcategories: [] },
      { name: "Ron Abuelo XV", subcategories: ["Finish Collection", "Tawny", "Oloroso", "Napoleon"] },
      { name: "Ron Abuelo Centuria", subcategories: [] }
    ],
    modifiers: ["Panama rum", "estate grown", "since 1908"],
    base_queries: ["Ron Abuelo rum", "Abuelo Panama"]
  },
  {
    name: "Ron Botran",
    variations: ["Botran", "Casa Botran"],
    region: "Quetzaltenango",
    country: "Guatemala",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Botran Añejo", subcategories: ["8", "12", "15", "18"] },
      { name: "Botran Solera 1893", subcategories: [] },
      { name: "Botran Cobre", subcategories: [] },
      { name: "Botran No. 75", subcategories: [] }
    ],
    modifiers: ["Guatemala rum", "solera system", "high altitude aging"],
    base_queries: ["Ron Botran", "Botran Guatemala rum"]
  },
  {
    name: "Ron Matusalem",
    variations: ["Matusalem", "Matusalem Rum"],
    region: "Originally Cuba",
    country: "Dominican Republic",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Matusalem Platino", subcategories: [] },
      { name: "Matusalem Clásico", subcategories: [] },
      { name: "Matusalem Añejo", subcategories: [] },
      { name: "Matusalem Solera", subcategories: ["15", "23"] },
      { name: "Matusalem Gran Reserva", subcategories: [] }
    ],
    modifiers: ["solera rum", "Cuban heritage", "since 1872"],
    base_queries: ["Ron Matusalem", "Matusalem rum"]
  },

  // African Rums
  {
    name: "Chairmans",
    variations: ["Chairmans Rum"],
    region: "South Africa",
    country: "South Africa",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Chairmans Original", subcategories: [] },
      { name: "Chairmans Reserve", subcategories: [] }
    ],
    modifiers: ["South African rum"],
    base_queries: ["Chairmans rum South Africa"]
  },
  {
    name: "New Grove",
    variations: ["New Grove Rum"],
    region: "Mauritius",
    country: "Mauritius",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "New Grove Tradition", subcategories: [] },
      { name: "New Grove Old Tradition", subcategories: ["5 Year", "8 Year"] },
      { name: "New Grove Single Barrel", subcategories: [] },
      { name: "New Grove Vintage", subcategories: ["2004", "2007", "2009"] }
    ],
    modifiers: ["Mauritius rum", "pure cane"],
    base_queries: ["New Grove rum", "New Grove Mauritius"]
  },
  {
    name: "Takamaka",
    variations: ["Takamaka Rum"],
    region: "Seychelles",
    country: "Seychelles",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Takamaka White", subcategories: [] },
      { name: "Takamaka Coco", subcategories: [] },
      { name: "Takamaka Dark Spiced", subcategories: [] },
      { name: "Takamaka Extra Noir", subcategories: [] }
    ],
    modifiers: ["Seychelles rum", "island rum"],
    base_queries: ["Takamaka rum", "Takamaka Seychelles"]
  },

  // More Premium/Craft Producers
  {
    name: "Smith & Cross",
    variations: ["Smith and Cross"],
    region: "Jamaica",
    country: "Jamaica",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Smith & Cross Traditional Jamaica Rum", subcategories: [] }
    ],
    modifiers: ["navy strength", "pot still", "Hampden and Wedderburn"],
    base_queries: ["Smith and Cross rum", "Smith Cross Jamaica"]
  },
  {
    name: "Banks",
    variations: ["Banks Rum"],
    region: "Multiple",
    country: "Multiple",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Banks 5 Island", subcategories: [] },
      { name: "Banks 7 Golden Age", subcategories: [] }
    ],
    modifiers: ["blend of rums", "multiple terroirs"],
    base_queries: ["Banks rum", "Banks 5 Island"]
  },
  {
    name: "Parce",
    variations: ["Parce Rum"],
    region: "Colombia",
    country: "Colombia",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Parce 8 Year", subcategories: [] },
      { name: "Parce 12 Year", subcategories: [] }
    ],
    modifiers: ["Colombian rum", "straight rum"],
    base_queries: ["Parce rum", "Parce Colombia"]
  },
  {
    name: "La Hechicera",
    variations: ["Ron La Hechicera"],
    region: "Colombia",
    country: "Colombia",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "La Hechicera Fine Aged", subcategories: [] },
      { name: "La Hechicera Experimental", subcategories: ["No.1", "No.2"] }
    ],
    modifiers: ["Colombian rum", "solera aged", "Casa Santana"],
    base_queries: ["La Hechicera rum", "Ron La Hechicera"]
  },
  {
    name: "Dictador",
    variations: ["Dictador Rum"],
    region: "Cartagena",
    country: "Colombia",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Dictador 12 Years", subcategories: [] },
      { name: "Dictador 20 Years", subcategories: [] },
      { name: "Dictador XO", subcategories: ["Perpetual", "Insolent"] },
      { name: "Dictador Generations", subcategories: [] }
    ],
    modifiers: ["Colombian rum", "sugar cane honey", "Don Julio Arango"],
    base_queries: ["Dictador rum", "Dictador Colombia"]
  },
  {
    name: "Pyrat",
    variations: ["Pyrat Rum"],
    region: "Anguilla",
    country: "Anguilla",
    type: ["rum"],
    parent_company: "Patrón Spirits",
    priority: 6,
    product_lines: [
      { name: "Pyrat Pistol", subcategories: [] },
      { name: "Pyrat XO Reserve", subcategories: [] },
      { name: "Pyrat Cask 1623", subcategories: [] }
    ],
    modifiers: ["Caribbean blend", "orange rum", "Hoti bottle"],
    base_queries: ["Pyrat rum", "Pyrat XO"]
  },
  {
    name: "Renegade",
    variations: ["Renegade Rum Distillery"],
    region: "Grenada",
    country: "Grenada",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Renegade Pre-Cask", subcategories: [] },
      { name: "Renegade Cask Strength", subcategories: [] }
    ],
    modifiers: ["terroir driven", "farm to bottle", "Mark Reynier"],
    base_queries: ["Renegade rum", "Renegade Grenada"]
  },
  {
    name: "Clairin",
    variations: ["Rhum Clairin"],
    region: "Haiti",
    country: "Haiti",
    type: ["rum", "clairin"],
    priority: 6,
    product_lines: [
      { name: "Clairin Vaval", subcategories: [] },
      { name: "Clairin Sajous", subcategories: [] },
      { name: "Clairin Casimir", subcategories: [] },
      { name: "Clairin Le Rocher", subcategories: [] }
    ],
    modifiers: ["Haitian rum", "pot still", "wild fermentation"],
    base_queries: ["Clairin rum", "Clairin Haiti"]
  },
  {
    name: "Santa Teresa",
    variations: ["Ron Santa Teresa"],
    region: "Aragua",
    country: "Venezuela",
    type: ["rum"],
    priority: 7,
    product_lines: [
      { name: "Santa Teresa Claro", subcategories: [] },
      { name: "Santa Teresa Gran Reserva", subcategories: [] },
      { name: "Santa Teresa 1796", subcategories: [] },
      { name: "Santa Teresa Bicentenario", subcategories: [] }
    ],
    modifiers: ["Venezuelan rum", "solera method", "Hacienda Santa Teresa"],
    base_queries: ["Santa Teresa rum", "Ron Santa Teresa 1796"]
  },
  {
    name: "English Harbour",
    variations: ["English Harbour Rum"],
    region: "Antigua",
    country: "Antigua and Barbuda",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "English Harbour 5 Year", subcategories: [] },
      { name: "English Harbour 10 Year", subcategories: [] },
      { name: "English Harbour Port Cask Finish", subcategories: [] },
      { name: "English Harbour 1981", subcategories: [] }
    ],
    modifiers: ["Antigua rum", "copper pot stills"],
    base_queries: ["English Harbour rum", "English Harbour Antigua"]
  },
  {
    name: "HSE",
    variations: ["Habitation Saint-Étienne", "Rhum HSE"],
    region: "Martinique",
    country: "Martinique",
    type: ["rum", "rhum agricole"],
    priority: 7,
    product_lines: [
      { name: "HSE Blanc", subcategories: ["50°", "55°"] },
      { name: "HSE VSOP", subcategories: [] },
      { name: "HSE XO", subcategories: [] },
      { name: "HSE Black Sheriff", subcategories: [] },
      { name: "HSE Parcellaire", subcategories: [] }
    ],
    modifiers: ["AOC Martinique", "estate rhum", "Habitation Saint-Étienne"],
    base_queries: ["HSE rhum", "Habitation Saint-Etienne"]
  },
  {
    name: "La Favorite",
    variations: ["Rhum La Favorite"],
    region: "Fort-de-France",
    country: "Martinique",
    type: ["rum", "rhum agricole"],
    priority: 6,
    product_lines: [
      { name: "La Favorite Blanc", subcategories: ["Coeur de Canne", "55°"] },
      { name: "La Favorite Ambré", subcategories: [] },
      { name: "La Favorite Vieux", subcategories: [] },
      { name: "La Favorite Cuvée Spéciale", subcategories: ["30 ans", "40 ans"] }
    ],
    modifiers: ["AOC Martinique", "family distillery"],
    base_queries: ["La Favorite rhum", "Rhum La Favorite"]
  },
  {
    name: "Depaz",
    variations: ["Rhum Depaz"],
    region: "Saint-Pierre",
    country: "Martinique",
    type: ["rum", "rhum agricole"],
    priority: 7,
    product_lines: [
      { name: "Depaz Blanc", subcategories: ["45°", "55°"] },
      { name: "Depaz Ambré", subcategories: [] },
      { name: "Depaz VSOP", subcategories: [] },
      { name: "Depaz XO", subcategories: [] },
      { name: "Depaz Hors d'Age", subcategories: [] }
    ],
    modifiers: ["AOC Martinique", "Montagne Pelée", "Blue cane"],
    base_queries: ["Depaz rhum", "Rhum Depaz Martinique"]
  },
  {
    name: "Père Labat",
    variations: ["Pere Labat", "Rhum Père Labat"],
    region: "Marie-Galante",
    country: "Guadeloupe",
    type: ["rum", "rhum agricole"],
    priority: 6,
    product_lines: [
      { name: "Père Labat Blanc", subcategories: ["40°", "59°"] },
      { name: "Père Labat Ambré", subcategories: [] },
      { name: "Père Labat VSOP", subcategories: [] },
      { name: "Père Labat Hors d'Age", subcategories: [] }
    ],
    modifiers: ["Marie-Galante rhum", "Poisson distillery"],
    base_queries: ["Pere Labat rhum", "Rhum Pere Labat"]
  },
  {
    name: "Damoiseau",
    variations: ["Rhum Damoiseau"],
    region: "Guadeloupe",
    country: "Guadeloupe",
    type: ["rum", "rhum agricole"],
    priority: 7,
    product_lines: [
      { name: "Damoiseau Blanc", subcategories: ["50°", "55°"] },
      { name: "Damoiseau Rhum Vieux", subcategories: ["VSOP", "XO", "6 ans", "8 ans"] },
      { name: "Damoiseau Millésime", subcategories: ["1989", "1991", "1995"] },
      { name: "Damoiseau Subprime", subcategories: [] }
    ],
    modifiers: ["Guadeloupe rhum", "largest distillery Guadeloupe"],
    base_queries: ["Damoiseau rhum", "Rhum Damoiseau"]
  },
  {
    name: "Longueteau",
    variations: ["Rhum Longueteau"],
    region: "Guadeloupe",
    country: "Guadeloupe",
    type: ["rum", "rhum agricole"],
    priority: 6,
    product_lines: [
      { name: "Longueteau Blanc", subcategories: ["50°", "55°", "62°"] },
      { name: "Longueteau Ambré", subcategories: [] },
      { name: "Longueteau Vieux", subcategories: ["VSOP", "XO"] },
      { name: "Longueteau Genesis", subcategories: [] }
    ],
    modifiers: ["Guadeloupe rhum", "red cane", "Domaine du Marquisat"],
    base_queries: ["Longueteau rhum", "Rhum Longueteau"]
  },
  {
    name: "Bielle",
    variations: ["Rhum Bielle"],
    region: "Marie-Galante",
    country: "Guadeloupe",
    type: ["rum", "rhum agricole"],
    priority: 6,
    product_lines: [
      { name: "Bielle Blanc", subcategories: ["50°", "59°"] },
      { name: "Bielle Ambré", subcategories: [] },
      { name: "Bielle Vieux", subcategories: [] },
      { name: "Bielle Premium", subcategories: [] }
    ],
    modifiers: ["Marie-Galante rhum", "windmill distillery"],
    base_queries: ["Bielle rhum", "Rhum Bielle Marie-Galante"]
  },
  {
    name: "Bellevue",
    variations: ["Rhum Bellevue", "Distillerie Bellevue"],
    region: "Marie-Galante",
    country: "Guadeloupe",
    type: ["rum", "rhum agricole"],
    priority: 5,
    product_lines: [
      { name: "Bellevue Blanc", subcategories: [] },
      { name: "Bellevue Ambré", subcategories: [] },
      { name: "Bellevue Vieux", subcategories: [] }
    ],
    modifiers: ["Marie-Galante rhum", "traditional methods"],
    base_queries: ["Bellevue rhum", "Rhum Bellevue"]
  },
  {
    name: "River Antoine",
    variations: ["River Antoine Royale", "Rivers"],
    region: "Grenada",
    country: "Grenada",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "River Antoine Royale", subcategories: [] },
      { name: "Rivers Rum", subcategories: [] }
    ],
    modifiers: ["Grenada rum", "water wheel", "since 1785"],
    base_queries: ["River Antoine rum", "Rivers rum Grenada"]
  },
  {
    name: "Savanna",
    variations: ["Rhum Savanna"],
    region: "Réunion",
    country: "Réunion",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Savanna Blanc", subcategories: ["Créol", "Métis", "Lontan"] },
      { name: "Savanna Vieux", subcategories: ["5 ans", "7 ans", "10 ans"] },
      { name: "Savanna Grand Arôme", subcategories: [] },
      { name: "Savanna Single Cask", subcategories: [] }
    ],
    modifiers: ["Réunion rum", "high ester", "Indian Ocean"],
    base_queries: ["Savanna rhum", "Rhum Savanna Reunion"]
  },
  {
    name: "Charrette",
    variations: ["Rhum Charrette"],
    region: "Réunion",
    country: "Réunion",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Charrette Blanc", subcategories: [] },
      { name: "Charrette Traditionnel", subcategories: [] },
      { name: "Charrette Arrangé", subcategories: [] }
    ],
    modifiers: ["Réunion rum", "traditional rum"],
    base_queries: ["Charrette rhum", "Rhum Charrette Reunion"]
  },
  {
    name: "Kirk and Sweeney",
    variations: ["Kirk & Sweeney"],
    region: "Dominican Republic",
    country: "Dominican Republic",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Kirk and Sweeney 12", subcategories: [] },
      { name: "Kirk and Sweeney 18", subcategories: [] },
      { name: "Kirk and Sweeney 23", subcategories: [] }
    ],
    modifiers: ["Dominican rum", "rum runners", "prohibition era"],
    base_queries: ["Kirk and Sweeney rum", "Kirk Sweeney Dominican"]
  },
  {
    name: "Vizcaya",
    variations: ["Vizcaya VXOP"],
    region: "Dominican Republic",
    country: "Dominican Republic",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Vizcaya VXOP", subcategories: [] },
      { name: "Vizcaya Cristal", subcategories: [] }
    ],
    modifiers: ["Cuban formula", "Dominican made"],
    base_queries: ["Vizcaya rum", "Vizcaya VXOP"]
  },
  {
    name: "Atlantico",
    variations: ["Ron Atlantico"],
    region: "Dominican Republic",
    country: "Dominican Republic",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Atlantico Platino", subcategories: [] },
      { name: "Atlantico Reserva", subcategories: [] },
      { name: "Atlantico Private Cask", subcategories: [] }
    ],
    modifiers: ["small batch", "Enrique Iglesias"],
    base_queries: ["Atlantico rum", "Ron Atlantico"]
  },
  {
    name: "Oliver & Oliver",
    variations: ["Oliver y Oliver"],
    region: "Dominican Republic",
    country: "Dominican Republic",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Opthimus", subcategories: ["12", "15", "18", "21", "25"] },
      { name: "Unhiq XO", subcategories: [] },
      { name: "Cubaney", subcategories: [] }
    ],
    modifiers: ["Cuban heritage", "solera system"],
    base_queries: ["Oliver Oliver rum", "Opthimus rum"]
  },
  {
    name: "Mocambo",
    variations: ["Ron Mocambo"],
    region: "Veracruz",
    country: "Mexico",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Mocambo Silver", subcategories: [] },
      { name: "Mocambo 10 Year", subcategories: [] },
      { name: "Mocambo 20 Year", subcategories: [] }
    ],
    modifiers: ["Mexican rum", "Art Edition"],
    base_queries: ["Mocambo rum", "Ron Mocambo Mexico"]
  },
  {
    name: "Montanya",
    variations: ["Montanya Distillers"],
    region: "Colorado",
    country: "USA",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Montanya Platino", subcategories: [] },
      { name: "Montanya Oro", subcategories: [] },
      { name: "Montanya Exclusiva", subcategories: [] }
    ],
    modifiers: ["mountain rum", "woman owned", "American craft"],
    base_queries: ["Montanya rum", "Montanya Colorado"]
  },
  {
    name: "Siesta Key",
    variations: ["Siesta Key Rum"],
    region: "Florida",
    country: "USA",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Siesta Key Silver", subcategories: [] },
      { name: "Siesta Key Gold", subcategories: [] },
      { name: "Siesta Key Spiced", subcategories: [] },
      { name: "Siesta Key Reserve", subcategories: [] }
    ],
    modifiers: ["Florida rum", "beach rum"],
    base_queries: ["Siesta Key rum", "Siesta Key Florida"]
  },
  {
    name: "Journeyman",
    variations: ["Journeyman Distillery"],
    region: "Michigan",
    country: "USA",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Journeyman Road's End Rum", subcategories: [] },
      { name: "Journeyman Silver Cross", subcategories: [] }
    ],
    modifiers: ["organic rum", "Michigan craft"],
    base_queries: ["Journeyman rum", "Roads End rum"]
  },
  {
    name: "Maggie's Farm",
    variations: ["Maggies Farm", "Maggie's Farm Rum"],
    region: "Pennsylvania",
    country: "USA",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Maggie's Farm White", subcategories: [] },
      { name: "Maggie's Farm Spiced", subcategories: [] },
      { name: "Maggie's Farm Queen's Share", subcategories: [] },
      { name: "Maggie's Farm Single Barrel", subcategories: [] }
    ],
    modifiers: ["Pittsburgh rum", "craft rum"],
    base_queries: ["Maggie's Farm rum", "Maggies Farm Pennsylvania"]
  },
  {
    name: "Stolen",
    variations: ["Stolen Rum"],
    region: "Multiple",
    country: "Multiple",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Stolen White", subcategories: [] },
      { name: "Stolen Gold", subcategories: [] },
      { name: "Stolen Dark", subcategories: [] },
      { name: "Stolen Overproof", subcategories: [] },
      { name: "Stolen Smoked", subcategories: [] }
    ],
    modifiers: ["craft blend", "artist series"],
    base_queries: ["Stolen rum", "Stolen spirits"]
  },
  {
    name: "Ron Izalco",
    variations: ["Izalco"],
    region: "El Salvador",
    country: "El Salvador",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Ron Izalco 10 Year", subcategories: [] },
      { name: "Ron Izalco 15 Year", subcategories: [] },
      { name: "Ron Izalco 18 Year", subcategories: [] }
    ],
    modifiers: ["El Salvador rum", "Cihuatán"],
    base_queries: ["Ron Izalco", "Izalco El Salvador"]
  },
  {
    name: "XM",
    variations: ["Banks XM", "XM Rum"],
    region: "Guyana",
    country: "Guyana",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "XM Classic", subcategories: [] },
      { name: "XM Gold", subcategories: [] },
      { name: "XM Royal", subcategories: ["7 Year", "10 Year", "12 Year"] },
      { name: "XM Supreme", subcategories: ["15 Year"] }
    ],
    modifiers: ["Demerara rum", "Banks DIH"],
    base_queries: ["XM rum", "Banks XM Guyana"]
  },
  {
    name: "Bristol",
    variations: ["Bristol Spirits", "Bristol Rum"],
    region: "UK",
    country: "United Kingdom",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Bristol Classic Rum", subcategories: [] },
      { name: "Bristol Reserve Rum", subcategories: [] },
      { name: "Bristol Anniversary Edition", subcategories: [] }
    ],
    modifiers: ["independent bottler", "single cask"],
    base_queries: ["Bristol rum", "Bristol Spirits rum"]
  },
  {
    name: "Arehucas",
    variations: ["Ron Arehucas"],
    region: "Gran Canaria",
    country: "Spain",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Arehucas Oro", subcategories: [] },
      { name: "Arehucas 7 Años", subcategories: [] },
      { name: "Arehucas 12 Años", subcategories: [] },
      { name: "Arehucas 18 Años", subcategories: [] }
    ],
    modifiers: ["Canary Islands rum", "Spanish rum"],
    base_queries: ["Arehucas rum", "Ron Arehucas Canarias"]
  },
  {
    name: "Quorhum",
    variations: ["Ron Quorhum"],
    region: "Dominican Republic",
    country: "Dominican Republic",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Quorhum 12", subcategories: [] },
      { name: "Quorhum 15", subcategories: [] },
      { name: "Quorhum 23", subcategories: [] },
      { name: "Quorhum 30", subcategories: [] }
    ],
    modifiers: ["solera system", "Oliver & Oliver"],
    base_queries: ["Quorhum rum", "Ron Quorhum"]
  },
  {
    name: "Rum Nation",
    variations: ["RumNation"],
    region: "Multiple",
    country: "Multiple",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Rum Nation Jamaica", subcategories: ["5 Year", "8 Year", "Pot Still"] },
      { name: "Rum Nation Barbados", subcategories: ["8 Year", "10 Year"] },
      { name: "Rum Nation Guatemala", subcategories: [] },
      { name: "Rum Nation Reunion", subcategories: [] }
    ],
    modifiers: ["independent bottler", "Fabio Rossi"],
    base_queries: ["Rum Nation", "RumNation bottles"]
  },
  {
    name: "Kill Devil",
    variations: ["Kill Devil Rum"],
    region: "Multiple",
    country: "Multiple",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Kill Devil Single Cask", subcategories: ["Barbados", "Jamaica", "Guyana", "Trinidad"] }
    ],
    modifiers: ["Hunter Laing", "single cask"],
    base_queries: ["Kill Devil rum", "Kill Devil single cask"]
  },
  
  // More Caribbean Producers
  {
    name: "Monymusk",
    variations: ["Monymusk Plantation"],
    region: "Jamaica",
    country: "Jamaica",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Monymusk Classic Gold", subcategories: [] },
      { name: "Monymusk Special Reserve", subcategories: [] },
      { name: "Monymusk Overproof", subcategories: [] }
    ],
    modifiers: ["Clarendon distillery", "Jamaica rum"],
    base_queries: ["Monymusk rum", "Monymusk Jamaica"]
  },
  {
    name: "Rum-Bar",
    variations: ["Rum Bar", "Worthy Park Estate"],
    region: "Jamaica",
    country: "Jamaica",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Rum-Bar White Overproof", subcategories: [] },
      { name: "Rum-Bar Gold", subcategories: [] },
      { name: "Rum-Bar Silver", subcategories: [] }
    ],
    modifiers: ["pot still", "estate rum"],
    base_queries: ["Rum-Bar Jamaica", "Rum Bar worthy park"]
  },
  {
    name: "Doctor Bird",
    variations: ["Doctor Bird Rum"],
    region: "Jamaica",
    country: "Jamaica",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Doctor Bird Rum", subcategories: [] }
    ],
    modifiers: ["pot still", "Two James Spirits"],
    base_queries: ["Doctor Bird rum", "Doctor Bird Jamaica"]
  },
  {
    name: "Blackwell",
    variations: ["Blackwell Fine Jamaican Rum"],
    region: "Jamaica",
    country: "Jamaica",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Blackwell Fine Jamaican Rum", subcategories: [] },
      { name: "Blackwell 007 Limited Edition", subcategories: [] }
    ],
    modifiers: ["Chris Blackwell", "Island Records"],
    base_queries: ["Blackwell rum", "Blackwell Jamaica"]
  },
  {
    name: "Sangster's",
    variations: ["Sangsters", "Sangster's Rum"],
    region: "Jamaica",
    country: "Jamaica",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Sangster's Original", subcategories: [] },
      { name: "Sangster's Rum Cream", subcategories: ["Coconut", "Coffee", "Banana"] }
    ],
    modifiers: ["rum cream", "Jamaica"],
    base_queries: ["Sangster's rum", "Sangsters Jamaica"]
  },
  {
    name: "Coruba",
    variations: ["Coruba Rum"],
    region: "Jamaica",
    country: "Jamaica",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Coruba Original", subcategories: [] },
      { name: "Coruba NPU", subcategories: [] },
      { name: "Coruba 12 Year", subcategories: [] },
      { name: "Coruba 18 Year", subcategories: [] }
    ],
    modifiers: ["dark rum", "Switzerland"],
    base_queries: ["Coruba rum", "Coruba Jamaica"]
  },
  {
    name: "Clarke's Court",
    variations: ["Clarkes Court", "Clarke's Court Rum"],
    region: "Grenada",
    country: "Grenada",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Clarke's Court White", subcategories: [] },
      { name: "Clarke's Court Special Dark", subcategories: [] },
      { name: "Clarke's Court Pure White", subcategories: [] },
      { name: "Clarke's Court Old Grog", subcategories: [] }
    ],
    modifiers: ["Grenada rum", "pot still"],
    base_queries: ["Clarke's Court rum", "Clarkes Court Grenada"]
  },
  {
    name: "Westerhall",
    variations: ["Westerhall Estate", "Westerhall Rum"],
    region: "Grenada",
    country: "Grenada",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Westerhall Superb Light", subcategories: [] },
      { name: "Westerhall Plantation Rum", subcategories: [] },
      { name: "Westerhall Vintage", subcategories: [] }
    ],
    modifiers: ["estate rum", "Grenada"],
    base_queries: ["Westerhall rum", "Westerhall Grenada"]
  },
  {
    name: "J. Bally",
    variations: ["Rhum J. Bally", "Bally"],
    region: "Martinique",
    country: "Martinique",
    type: ["rum", "rhum agricole"],
    priority: 7,
    product_lines: [
      { name: "J. Bally Blanc", subcategories: [] },
      { name: "J. Bally Ambré", subcategories: [] },
      { name: "J. Bally Vieux", subcategories: ["7 ans", "12 ans"] },
      { name: "J. Bally Millésime", subcategories: ["1982", "1989", "1998", "2002"] }
    ],
    modifiers: ["AOC Martinique", "pyramid bottles"],
    base_queries: ["J Bally rhum", "Rhum Bally Martinique"]
  },
  {
    name: "Saint James",
    variations: ["Rhum Saint James", "St. James"],
    region: "Martinique",
    country: "Martinique",
    type: ["rum", "rhum agricole"],
    priority: 8,
    product_lines: [
      { name: "Saint James Blanc", subcategories: ["40°", "50°", "55°"] },
      { name: "Saint James Ambré", subcategories: [] },
      { name: "Saint James Vieux", subcategories: [] },
      { name: "Saint James XO", subcategories: [] },
      { name: "Saint James Cuvée 1765", subcategories: [] }
    ],
    modifiers: ["AOC Martinique", "oldest distillery Martinique"],
    base_queries: ["Saint James rhum", "St James Martinique"]
  },
  {
    name: "La Mauny",
    variations: ["Rhum La Mauny", "Distillerie La Mauny"],
    region: "Martinique",
    country: "Martinique",
    type: ["rum", "rhum agricole"],
    priority: 6,
    product_lines: [
      { name: "La Mauny Blanc", subcategories: ["50°", "55°"] },
      { name: "La Mauny Ambré", subcategories: [] },
      { name: "La Mauny VSOP", subcategories: [] },
      { name: "La Mauny XO", subcategories: [] },
      { name: "La Mauny 1749", subcategories: [] }
    ],
    modifiers: ["AOC Martinique", "Maison La Mauny"],
    base_queries: ["La Mauny rhum", "Rhum La Mauny"]
  },
  {
    name: "Karukera",
    variations: ["Rhum Karukera"],
    region: "Guadeloupe",
    country: "Guadeloupe",
    type: ["rum", "rhum agricole"],
    priority: 6,
    product_lines: [
      { name: "Karukera Blanc", subcategories: [] },
      { name: "Karukera Vieux", subcategories: [] },
      { name: "Karukera Black Edition", subcategories: [] },
      { name: "Karukera L'Expression", subcategories: [] }
    ],
    modifiers: ["Guadeloupe rhum", "Marquisat de Sainte-Marie"],
    base_queries: ["Karukera rhum", "Rhum Karukera"]
  },
  {
    name: "Bologne",
    variations: ["Rhum Bologne", "Distillerie Bologne"],
    region: "Guadeloupe",
    country: "Guadeloupe",
    type: ["rum", "rhum agricole"],
    priority: 6,
    product_lines: [
      { name: "Bologne Blanc", subcategories: ["50°", "55°"] },
      { name: "Bologne Vieux", subcategories: [] },
      { name: "Bologne Black Cane", subcategories: [] },
      { name: "Bologne 1887", subcategories: [] }
    ],
    modifiers: ["black cane", "Guadeloupe"],
    base_queries: ["Bologne rhum", "Rhum Bologne"]
  },
  {
    name: "Montebello",
    variations: ["Rhum Montebello"],
    region: "Guadeloupe",
    country: "Guadeloupe",
    type: ["rum", "rhum agricole"],
    priority: 5,
    product_lines: [
      { name: "Montebello Blanc", subcategories: [] },
      { name: "Montebello Vieux", subcategories: ["6 ans", "8 ans", "10 ans"] },
      { name: "Montebello Integral", subcategories: [] }
    ],
    modifiers: ["Guadeloupe rhum", "Carrère distillery"],
    base_queries: ["Montebello rhum", "Rhum Montebello"]
  },
  {
    name: "Séverin",
    variations: ["Rhum Séverin", "Domaine de Séverin"],
    region: "Guadeloupe",
    country: "Guadeloupe",
    type: ["rum", "rhum agricole"],
    priority: 5,
    product_lines: [
      { name: "Séverin Blanc", subcategories: ["50°", "55°"] },
      { name: "Séverin ER", subcategories: [] },
      { name: "Séverin Vieux", subcategories: [] }
    ],
    modifiers: ["small distillery", "Guadeloupe"],
    base_queries: ["Severin rhum", "Rhum Severin"]
  },
  {
    name: "Courcelles",
    variations: ["Rhum Courcelles"],
    region: "Guadeloupe",
    country: "Guadeloupe",
    type: ["rum", "rhum agricole"],
    priority: 4,
    product_lines: [
      { name: "Courcelles Blanc", subcategories: [] },
      { name: "Courcelles Vieux", subcategories: [] }
    ],
    modifiers: ["Grande-Terre", "Guadeloupe"],
    base_queries: ["Courcelles rhum"]
  },
  {
    name: "Isautier",
    variations: ["Rhum Isautier"],
    region: "Réunion",
    country: "Réunion",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Isautier Blanc", subcategories: ["40°", "49°", "55°"] },
      { name: "Isautier Barrik", subcategories: [] },
      { name: "Isautier Vieux", subcategories: ["5 ans", "7 ans", "10 ans"] },
      { name: "Isautier Arrangé", subcategories: [] }
    ],
    modifiers: ["Réunion rum", "family distillery"],
    base_queries: ["Isautier rhum", "Rhum Isautier Reunion"]
  },
  {
    name: "Rivière du Mât",
    variations: ["Riviere du Mat", "Rhum Rivière du Mât"],
    region: "Réunion",
    country: "Réunion",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Rivière du Mât Blanc", subcategories: [] },
      { name: "Rivière du Mât Ambré", subcategories: [] },
      { name: "Rivière du Mât Vieux", subcategories: [] },
      { name: "Rivière du Mât XO", subcategories: [] }
    ],
    modifiers: ["Réunion rum", "Indian Ocean"],
    base_queries: ["Riviere du Mat rum", "Rhum Riviere du Mat"]
  },
  {
    name: "Ron Añejo",
    variations: ["Añejo Rum"],
    region: "Ecuador",
    country: "Ecuador",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Ron Añejo Especial", subcategories: [] },
      { name: "Ron Añejo Reserve", subcategories: [] }
    ],
    modifiers: ["Ecuador rum"],
    base_queries: ["Ron Anejo Ecuador", "Anejo rum Ecuador"]
  },
  {
    name: "Cartavio",
    variations: ["Ron Cartavio"],
    region: "La Libertad",
    country: "Peru",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Cartavio Superior", subcategories: [] },
      { name: "Cartavio Black", subcategories: [] },
      { name: "Cartavio XO", subcategories: [] },
      { name: "Cartavio Solera", subcategories: [] }
    ],
    modifiers: ["Peru rum", "since 1929"],
    base_queries: ["Cartavio rum", "Ron Cartavio Peru"]
  },
  {
    name: "Millonario",
    variations: ["Ron Millonario"],
    region: "Peru",
    country: "Peru",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Millonario Solera", subcategories: ["10", "15"] },
      { name: "Millonario XO", subcategories: [] },
      { name: "Millonario Cincuentenario", subcategories: [] }
    ],
    modifiers: ["solera system", "Peru"],
    base_queries: ["Millonario rum", "Ron Millonario"]
  },
  {
    name: "Pomalca",
    variations: ["Ron Pomalca"],
    region: "Lambayeque",
    country: "Peru",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Pomalca Añejo", subcategories: [] },
      { name: "Pomalca Reserve", subcategories: [] }
    ],
    modifiers: ["Peru rum"],
    base_queries: ["Pomalca rum", "Ron Pomalca"]
  },
  {
    name: "Caña Brava",
    variations: ["Cana Brava", "Caña Brava Rum"],
    region: "Panama",
    country: "Panama",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Caña Brava", subcategories: [] }
    ],
    modifiers: ["Panama rum", "Francisco Fernandez"],
    base_queries: ["Cana Brava rum", "Caña Brava Panama"]
  },
  {
    name: "Pedro Mandinga",
    variations: ["Ron Pedro Mandinga"],
    region: "Panama",
    country: "Panama",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Pedro Mandinga Silver", subcategories: [] },
      { name: "Pedro Mandinga Gold", subcategories: [] },
      { name: "Pedro Mandinga Gran Reserva", subcategories: [] }
    ],
    modifiers: ["Panama rum", "pirate heritage"],
    base_queries: ["Pedro Mandinga rum", "Ron Pedro Mandinga"]
  },
  {
    name: "Grander",
    variations: ["Ron Grander", "Grander Rum"],
    region: "Panama",
    country: "Panama",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Grander Single Barrel", subcategories: [] },
      { name: "Grander 8 Year", subcategories: [] },
      { name: "Grander 12 Year", subcategories: [] }
    ],
    modifiers: ["Panama rum"],
    base_queries: ["Grander rum", "Ron Grander Panama"]
  },
  {
    name: "Cañita",
    variations: ["Canita", "Cañita Rum"],
    region: "Costa Rica",
    country: "Costa Rica",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Cañita Premium", subcategories: [] },
      { name: "Cañita Gold", subcategories: [] }
    ],
    modifiers: ["Costa Rica rum"],
    base_queries: ["Canita rum", "Cañita Costa Rica"]
  },
  {
    name: "Ron Centenario",
    variations: ["Centenario"],
    region: "Costa Rica",
    country: "Costa Rica",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Centenario Añejo", subcategories: ["7", "9", "12"] },
      { name: "Centenario Fundación", subcategories: ["20", "25", "30"] },
      { name: "Centenario Real", subcategories: [] }
    ],
    modifiers: ["Costa Rica rum", "solera system"],
    base_queries: ["Ron Centenario", "Centenario Costa Rica"]
  },
  {
    name: "Malecon",
    variations: ["Ron Malecon", "Malecón"],
    region: "Panama",
    country: "Panama",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Malecon Añejo", subcategories: ["3", "5", "8"] },
      { name: "Malecon Reserva Superior", subcategories: ["12", "15", "18"] },
      { name: "Malecon Rare Proof", subcategories: ["18", "25"] }
    ],
    modifiers: ["Panama rum", "Don Jose distillery"],
    base_queries: ["Malecon rum", "Ron Malecon"]
  },
  {
    name: "Ron La Progresiva",
    variations: ["La Progresiva"],
    region: "Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "La Progresiva 13", subcategories: [] },
      { name: "La Progresiva 15", subcategories: [] }
    ],
    modifiers: ["Cuban rum", "limited release"],
    base_queries: ["Ron La Progresiva", "La Progresiva Cuba"]
  },
  {
    name: "Eminente",
    variations: ["Ron Eminente"],
    region: "Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Eminente Reserva", subcategories: ["7 Años"] },
      { name: "Eminente Ambar Claro", subcategories: [] }
    ],
    modifiers: ["Cuban rum", "Moët Hennessy"],
    base_queries: ["Eminente rum", "Ron Eminente Cuba"]
  },
  {
    name: "Legendario",
    variations: ["Ron Legendario"],
    region: "Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Legendario Añejo", subcategories: [] },
      { name: "Legendario Elixir", subcategories: [] },
      { name: "Legendario Gran Reserva", subcategories: ["15 Años"] }
    ],
    modifiers: ["Cuban rum", "sweet profile"],
    base_queries: ["Legendario rum", "Ron Legendario"]
  },
  {
    name: "Mulata",
    variations: ["Ron Mulata"],
    region: "Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Mulata Añejo", subcategories: ["3", "5", "7"] },
      { name: "Mulata Gran Reserva", subcategories: ["15"] },
      { name: "Mulata Elixir", subcategories: [] }
    ],
    modifiers: ["Cuban rum"],
    base_queries: ["Ron Mulata", "Mulata Cuba rum"]
  },
  {
    name: "Edmundo Dantés",
    variations: ["Ron Edmundo Dantes", "Conde de Montecristo"],
    region: "Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Edmundo Dantés 15 Years", subcategories: [] },
      { name: "Edmundo Dantés 25 Years", subcategories: [] }
    ],
    modifiers: ["Cuban rum", "premium"],
    base_queries: ["Edmundo Dantes rum", "Ron Edmundo Dantes"]
  },
  {
    name: "Ron Caney",
    variations: ["Caney"],
    region: "Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 3,
    product_lines: [
      { name: "Caney Carta Blanca", subcategories: [] },
      { name: "Caney Añejo", subcategories: ["5", "7", "12"] },
      { name: "Caney Centuria", subcategories: [] }
    ],
    modifiers: ["Cuban rum", "Santiago de Cuba"],
    base_queries: ["Ron Caney", "Caney Cuba rum"]
  },
  {
    name: "Varadero",
    variations: ["Ron Varadero"],
    region: "Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Varadero Añejo", subcategories: ["3", "5", "7"] },
      { name: "Varadero Gran Reserva", subcategories: ["15"] },
      { name: "Varadero Silver Dry", subcategories: [] }
    ],
    modifiers: ["Cuban rum", "tourist favorite"],
    base_queries: ["Ron Varadero", "Varadero Cuba rum"]
  },
  {
    name: "Arecha",
    variations: ["Ron Arecha"],
    region: "Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 3,
    product_lines: [
      { name: "Arecha Carta Blanca", subcategories: [] },
      { name: "Arecha Dorado", subcategories: [] },
      { name: "Arecha Añejo", subcategories: [] }
    ],
    modifiers: ["Cuban rum", "local brand"],
    base_queries: ["Ron Arecha", "Arecha Cuba"]
  },
  {
    name: "Perla del Norte",
    variations: ["Ron Perla del Norte"],
    region: "Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 3,
    product_lines: [
      { name: "Perla del Norte Blanco", subcategories: [] },
      { name: "Perla del Norte Añejo", subcategories: [] }
    ],
    modifiers: ["Cuban rum", "northern Cuba"],
    base_queries: ["Perla del Norte rum", "Ron Perla del Norte"]
  },
  {
    name: "Santero",
    variations: ["Ron Santero"],
    region: "Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 3,
    product_lines: [
      { name: "Santero Añejo", subcategories: [] },
      { name: "Santero Palma Superior", subcategories: [] }
    ],
    modifiers: ["Cuban rum", "traditional"],
    base_queries: ["Ron Santero", "Santero Cuba"]
  },
  {
    name: "Cubay",
    variations: ["Ron Cubay"],
    region: "Cuba",
    country: "Cuba",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Cubay Añejo", subcategories: [] },
      { name: "Cubay Carta Blanca", subcategories: [] },
      { name: "Cubay Extra Añejo", subcategories: ["10", "14"] }
    ],
    modifiers: ["Cuban rum", "Santo Domingo"],
    base_queries: ["Ron Cubay", "Cubay rum"]
  },
  {
    name: "Ron Collins",
    variations: ["Collins E. Beam"],
    region: "Multiple",
    country: "Multiple",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Ron Collins Caribbean", subcategories: [] },
      { name: "Ron Collins Premium", subcategories: [] }
    ],
    modifiers: ["Caribbean blend"],
    base_queries: ["Ron Collins", "Collins rum"]
  },
  {
    name: "Ron Jaguar",
    variations: ["Jaguar"],
    region: "Venezuela",
    country: "Venezuela",
    type: ["rum"],
    priority: 3,
    product_lines: [
      { name: "Jaguar Edición Limitada", subcategories: [] },
      { name: "Jaguar Ultra Aged", subcategories: [] }
    ],
    modifiers: ["Venezuelan rum", "aged rum"],
    base_queries: ["Ron Jaguar", "Jaguar Venezuela rum"]
  },
  {
    name: "Ron Carúpano",
    variations: ["Carupano", "Carúpano"],
    region: "Maracaibo",
    country: "Venezuela",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Carúpano Añejo", subcategories: ["6", "12", "18"] },
      { name: "Carúpano XO", subcategories: [] },
      { name: "Carúpano Legendario", subcategories: [] }
    ],
    modifiers: ["Venezuelan rum", "Hacienda Altamira"],
    base_queries: ["Ron Carupano", "Carupano rum"]
  },
  {
    name: "Ron Roble",
    variations: ["Roble"],
    region: "Venezuela",
    country: "Venezuela",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Roble Viejo", subcategories: [] },
      { name: "Roble Extra Añejo", subcategories: [] },
      { name: "Roble Ultra Añejo", subcategories: [] }
    ],
    modifiers: ["Venezuelan rum", "DUSA"],
    base_queries: ["Ron Roble", "Roble rum Venezuela"]
  },
  {
    name: "Ron Estelar",
    variations: ["Estelar"],
    region: "Venezuela",
    country: "Venezuela",
    type: ["rum"],
    priority: 3,
    product_lines: [
      { name: "Estelar Añejo", subcategories: [] },
      { name: "Estelar Premium", subcategories: [] }
    ],
    modifiers: ["Venezuelan rum"],
    base_queries: ["Ron Estelar", "Estelar Venezuela"]
  },
  {
    name: "Ron Cacique",
    variations: ["Cacique"],
    region: "Venezuela",
    country: "Venezuela",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Cacique Añejo", subcategories: [] },
      { name: "Cacique 500", subcategories: [] },
      { name: "Cacique Antiguo", subcategories: [] }
    ],
    modifiers: ["Venezuelan rum", "Diageo"],
    base_queries: ["Ron Cacique", "Cacique rum"]
  },
  {
    name: "Ron Veroes",
    variations: ["Veroes"],
    region: "Venezuela",
    country: "Venezuela",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Veroes Añejo", subcategories: [] },
      { name: "Veroes Don Pancho Fernandez", subcategories: [] }
    ],
    modifiers: ["Venezuelan rum", "premium"],
    base_queries: ["Ron Veroes", "Veroes rum"]
  },
  {
    name: "Ron Pampero",
    variations: ["Pampero"],
    region: "Venezuela",
    country: "Venezuela",
    type: ["rum"],
    priority: 6,
    product_lines: [
      { name: "Pampero Blanco", subcategories: [] },
      { name: "Pampero Especial", subcategories: [] },
      { name: "Pampero Aniversario", subcategories: [] }
    ],
    modifiers: ["Venezuelan rum", "Diageo", "little leather pouch"],
    base_queries: ["Ron Pampero", "Pampero rum"]
  },
  {
    name: "Old Parr",
    variations: ["Ron Old Parr Superior"],
    region: "Colombia",
    country: "Colombia",
    type: ["rum"],
    priority: 4,
    product_lines: [
      { name: "Old Parr Superior", subcategories: [] },
      { name: "Old Parr Tribute", subcategories: [] }
    ],
    modifiers: ["Colombian rum"],
    base_queries: ["Ron Old Parr", "Old Parr rum Colombia"]
  },
  {
    name: "Ron Viejo de Caldas",
    variations: ["Viejo de Caldas"],
    region: "Caldas",
    country: "Colombia",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Viejo de Caldas Tradicional", subcategories: [] },
      { name: "Viejo de Caldas Gran Reserva", subcategories: [] },
      { name: "Viejo de Caldas Carta de Oro", subcategories: [] }
    ],
    modifiers: ["Colombian rum", "ILC"],
    base_queries: ["Ron Viejo de Caldas", "Viejo de Caldas"]
  },
  {
    name: "Ron Medellín",
    variations: ["Medellin", "Ron Medellín"],
    region: "Antioquia",
    country: "Colombia",
    type: ["rum"],
    priority: 5,
    product_lines: [
      { name: "Ron Medellín Añejo", subcategories: ["3", "5", "8"] },
      { name: "Ron Medellín Gran Reserva", subcategories: ["12"] }
    ],
    modifiers: ["Colombian rum", "FLA"],
    base_queries: ["Ron Medellin", "Medellin rum"]
  },
  {
    name: "Tres Esquinas",
    variations: ["Ron Tres Esquinas"],
    region: "Colombia",
    country: "Colombia",
    type: ["rum"],
    priority: 3,
    product_lines: [
      { name: "Tres Esquinas Blanco", subcategories: [] },
      { name: "Tres Esquinas Añejo", subcategories: [] }
    ],
    modifiers: ["Colombian rum"],
    base_queries: ["Tres Esquinas rum", "Ron Tres Esquinas"]
  },
  {
    name: "Ron Boyacá",
    variations: ["Boyaca"],
    region: "Boyacá",
    country: "Colombia",
    type: ["rum"],
    priority: 3,
    product_lines: [
      { name: "Ron Boyacá Añejo", subcategories: [] },
      { name: "Ron Boyacá Premium", subcategories: [] }
    ],
    modifiers: ["Colombian rum", "high altitude"],
    base_queries: ["Ron Boyaca", "Boyaca rum"]
  },
  {
    name: "Aguardiente Antioqueño",
    variations: ["Antioqueno"],
    region: "Antioquia",
    country: "Colombia",
    type: ["rum", "aguardiente"],
    priority: 5,
    product_lines: [
      { name: "Aguardiente Antioqueño Traditional", subcategories: [] },
      { name: "Aguardiente Antioqueño Sin Azúcar", subcategories: [] }
    ],
    modifiers: ["Colombian spirit", "anise flavored"],
    base_queries: ["Aguardiente Antioqueno", "Antioqueno"]
  }
];

export const ALL_RUM_DISTILLERIES = RUM_DISTILLERIES;