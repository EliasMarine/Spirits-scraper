import { DistilleryConfig } from './index.js';

export const COGNAC_BRANDY_DISTILLERIES: DistilleryConfig[] = [
  // ========== COGNAC HOUSES ==========
  {
    name: "Hennessy",
    variations: ["Jas Hennessy & Co", "Hennessy Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Hennessy VS", "Hennessy Very Special"] },
      { name: "VSOP", variations: ["Hennessy VSOP", "Hennessy Privilege"] },
      { name: "XO", variations: ["Hennessy XO", "Hennessy Extra Old"] },
      { name: "Paradis", variations: ["Hennessy Paradis", "Hennessy Paradis Imperial"] },
      { name: "Richard Hennessy", variations: ["Richard Hennessy"] },
      { name: "Master Blender's Selection", variations: ["Hennessy Master Blender's"] }
    ]
  },
  {
    name: "Rémy Martin",
    variations: ["Remy Martin", "E. Rémy Martin & Co"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VSOP", variations: ["Rémy Martin VSOP"] },
      { name: "1738", variations: ["Rémy Martin 1738 Accord Royal"] },
      { name: "XO", variations: ["Rémy Martin XO", "Rémy Martin Excellence"] },
      { name: "Louis XIII", variations: ["Louis XIII de Rémy Martin"] },
      { name: "Tercet", variations: ["Rémy Martin Tercet"] }
    ]
  },
  {
    name: "Courvoisier",
    variations: ["Courvoisier Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Courvoisier VS"] },
      { name: "VSOP", variations: ["Courvoisier VSOP"] },
      { name: "XO", variations: ["Courvoisier XO"] },
      { name: "Initiale", variations: ["Courvoisier Initiale Extra"] },
      { name: "L'Esprit", variations: ["L'Esprit de Courvoisier"] }
    ]
  },
  {
    name: "Martell",
    variations: ["Martell & Co", "Martell Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Martell VS Single Distillery"] },
      { name: "VSOP", variations: ["Martell VSOP Aged in Red Barrels"] },
      { name: "Cordon Bleu", variations: ["Martell Cordon Bleu"] },
      { name: "XO", variations: ["Martell XO"] },
      { name: "Chanteloup", variations: ["Martell Chanteloup Perspective"] }
    ]
  },
  {
    name: "Camus",
    variations: ["Camus Cognac", "Camus La Grande Marque"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Camus VS Elegance"] },
      { name: "VSOP", variations: ["Camus VSOP Elegance"] },
      { name: "XO", variations: ["Camus XO Elegance"] },
      { name: "Borderies", variations: ["Camus XO Borderies"] },
      { name: "Cuvée", variations: ["Camus Cuvée"] }
    ]
  },
  {
    name: "Hine",
    variations: ["Thomas Hine & Co", "Hine Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "H by Hine", variations: ["H by Hine VSOP"] },
      { name: "Rare", variations: ["Hine Rare VSOP"] },
      { name: "Antique", variations: ["Hine Antique XO"] },
      { name: "Paradis", variations: ["Hine Paradis Extra"] }
    ]
  },
  {
    name: "Delamain",
    variations: ["Delamain Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "Pale & Dry", variations: ["Delamain Pale & Dry XO"] },
      { name: "Vesper", variations: ["Delamain Vesper"] },
      { name: "Extra", variations: ["Delamain Extra de Grande Champagne"] },
      { name: "Réserve de la Famille", variations: ["Delamain Réserve de la Famille"] }
    ]
  },
  {
    name: "Frapin",
    variations: ["Frapin Cognac", "Maison Frapin"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Frapin VS"] },
      { name: "VSOP", variations: ["Frapin VSOP"] },
      { name: "Cigar Blend", variations: ["Frapin Cigar Blend XO"] },
      { name: "VIP", variations: ["Frapin VIP XO"] },
      { name: "Extra", variations: ["Frapin Extra Grande Champagne"] }
    ]
  },
  {
    name: "Pierre Ferrand",
    variations: ["Cognac Ferrand", "Maison Ferrand"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "Ambre", variations: ["Pierre Ferrand Ambre"] },
      { name: "Reserve", variations: ["Pierre Ferrand Reserve"] },
      { name: "Selection des Anges", variations: ["Pierre Ferrand Selection des Anges"] },
      { name: "Abel", variations: ["Pierre Ferrand Abel"] }
    ]
  },
  {
    name: "Gautier",
    variations: ["Gautier Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Gautier VS"] },
      { name: "VSOP", variations: ["Gautier VSOP"] },
      { name: "XO", variations: ["Gautier XO"] },
      { name: "Extra", variations: ["Gautier Extra"] }
    ]
  },
  {
    name: "Hardy",
    variations: ["Hardy Cognac", "Maison Hardy"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Hardy VS"] },
      { name: "VSOP", variations: ["Hardy VSOP Organic"] },
      { name: "XO", variations: ["Hardy XO"] },
      { name: "Noces d'Or", variations: ["Hardy Noces d'Or"] }
    ]
  },
  {
    name: "Meukow",
    variations: ["Meukow Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Meukow VS"] },
      { name: "VSOP", variations: ["Meukow VSOP Superior"] },
      { name: "XO", variations: ["Meukow XO"] },
      { name: "Extra", variations: ["Meukow Extra"] }
    ]
  },
  {
    name: "Bisquit",
    variations: ["Bisquit & Dubouché", "Bisquit Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Bisquit VS Classique"] },
      { name: "VSOP", variations: ["Bisquit VSOP"] },
      { name: "XO", variations: ["Bisquit XO"] }
    ]
  },
  {
    name: "Otard",
    variations: ["Baron Otard", "Otard Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Otard VS"] },
      { name: "VSOP", variations: ["Otard VSOP"] },
      { name: "XO", variations: ["Otard XO Gold"] },
      { name: "Extra", variations: ["Otard Extra 1795"] }
    ]
  },
  {
    name: "Davidoff",
    variations: ["Davidoff Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Davidoff VS"] },
      { name: "VSOP", variations: ["Davidoff VSOP"] },
      { name: "XO", variations: ["Davidoff XO"] }
    ]
  },
  {
    name: "Lheraud",
    variations: ["Cognac Lheraud", "Domaine Lheraud"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Lheraud VS"] },
      { name: "VSOP", variations: ["Lheraud VSOP"] },
      { name: "XO", variations: ["Lheraud XO Charles VII"] },
      { name: "Vintage", variations: ["Lheraud Vintage"] }
    ]
  },
  {
    name: "Paul Giraud",
    variations: ["Paul Giraud Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["Paul Giraud VS"] },
      { name: "VSOP", variations: ["Paul Giraud VSOP"] },
      { name: "XO", variations: ["Paul Giraud XO"] },
      { name: "Vieille Reserve", variations: ["Paul Giraud Vieille Reserve"] }
    ]
  },
  {
    name: "Tesseron",
    variations: ["Tesseron Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "Lot 90", variations: ["Tesseron Lot 90 XO"] },
      { name: "Lot 76", variations: ["Tesseron Lot 76 XO"] },
      { name: "Lot 53", variations: ["Tesseron Lot 53 XO"] },
      { name: "Lot 29", variations: ["Tesseron Lot 29 XO Exception"] }
    ]
  },
  {
    name: "Ragnaud-Sabourin",
    variations: ["Ragnaud Sabourin", "Domaine Ragnaud-Sabourin"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VSOP", variations: ["Ragnaud-Sabourin VSOP"] },
      { name: "Reserve Speciale", variations: ["Ragnaud-Sabourin Reserve Speciale"] },
      { name: "Paradis", variations: ["Ragnaud-Sabourin Paradis"] }
    ]
  },
  {
    name: "A.E. Dor",
    variations: ["AE Dor", "A.E. Dor Cognac"],
    region: "Cognac",
    country: "France",
    type: ["cognac"],
    product_lines: [
      { name: "VS", variations: ["A.E. Dor VS Selection"] },
      { name: "VSOP", variations: ["A.E. Dor VSOP Rare"] },
      { name: "XO", variations: ["A.E. Dor XO"] },
      { name: "Vieille Reserve", variations: ["A.E. Dor Vieille Reserve No 9"] }
    ]
  },

  // ========== ARMAGNAC PRODUCERS ==========
  {
    name: "Darroze",
    variations: ["Armagnac Darroze", "Francis Darroze"],
    region: "Armagnac",
    country: "France",
    type: ["armagnac"],
    product_lines: [
      { name: "Biologic", variations: ["Darroze Biologic"] },
      { name: "Grands Assemblages", variations: ["Darroze 8 Year", "Darroze 12 Year"] },
      { name: "Domaines", variations: ["Darroze Domaine de Couzard", "Darroze Domaine de Rieston"] }
    ]
  },
  {
    name: "Delord",
    variations: ["Armagnac Delord", "Maison Delord"],
    region: "Armagnac",
    country: "France",
    type: ["armagnac"],
    product_lines: [
      { name: "Napoleon", variations: ["Delord Napoleon"] },
      { name: "XO", variations: ["Delord XO"] },
      { name: "Hors d'Age", variations: ["Delord Hors d'Age"] },
      { name: "Vintage", variations: ["Delord Vintage"] }
    ]
  },
  {
    name: "Tariquet",
    variations: ["Chateau du Tariquet", "Armagnac Tariquet"],
    region: "Armagnac",
    country: "France",
    type: ["armagnac"],
    product_lines: [
      { name: "VS", variations: ["Tariquet VS Classique"] },
      { name: "VSOP", variations: ["Tariquet VSOP"] },
      { name: "XO", variations: ["Tariquet XO"] },
      { name: "Blanche", variations: ["Tariquet Blanche Armagnac"] }
    ]
  },
  {
    name: "Castarède",
    variations: ["Armagnac Castarède"],
    region: "Armagnac",
    country: "France",
    type: ["armagnac"],
    product_lines: [
      { name: "VSOP", variations: ["Castarède VSOP"] },
      { name: "XO", variations: ["Castarède XO"] },
      { name: "Vintage", variations: ["Castarède Vintage"] }
    ]
  },
  {
    name: "Janneau",
    variations: ["Armagnac Janneau"],
    region: "Armagnac",
    country: "France",
    type: ["armagnac"],
    product_lines: [
      { name: "VS", variations: ["Janneau VS"] },
      { name: "VSOP", variations: ["Janneau VSOP"] },
      { name: "XO", variations: ["Janneau XO Royal"] },
      { name: "Single Distillery", variations: ["Janneau Single Distillery"] }
    ]
  },
  {
    name: "Baron de Sigognac",
    variations: ["Armagnac Baron de Sigognac"],
    region: "Armagnac",
    country: "France",
    type: ["armagnac"],
    product_lines: [
      { name: "VS", variations: ["Baron de Sigognac VS"] },
      { name: "VSOP", variations: ["Baron de Sigognac VSOP"] },
      { name: "10 Year", variations: ["Baron de Sigognac 10 Ans"] },
      { name: "Vintage", variations: ["Baron de Sigognac Vintage"] }
    ]
  },
  {
    name: "Larressingle",
    variations: ["Armagnac Larressingle"],
    region: "Armagnac",
    country: "France",
    type: ["armagnac"],
    product_lines: [
      { name: "VS", variations: ["Larressingle VS"] },
      { name: "VSOP", variations: ["Larressingle VSOP"] },
      { name: "XO", variations: ["Larressingle XO"] }
    ]
  },
  {
    name: "Château de Laubade",
    variations: ["Laubade", "Armagnac de Laubade"],
    region: "Armagnac",
    country: "France",
    type: ["armagnac"],
    product_lines: [
      { name: "VS", variations: ["Laubade VS"] },
      { name: "VSOP", variations: ["Laubade VSOP"] },
      { name: "XO", variations: ["Laubade XO"] },
      { name: "Intemporel", variations: ["Laubade Intemporel"] }
    ]
  },

  // ========== SPANISH BRANDY ==========
  {
    name: "Cardenal Mendoza",
    variations: ["Brandy Cardenal Mendoza"],
    region: "Jerez",
    country: "Spain",
    type: ["brandy"],
    product_lines: [
      { name: "Clásico", variations: ["Cardenal Mendoza Clásico"] },
      { name: "Carta Real", variations: ["Cardenal Mendoza Carta Real"] },
      { name: "Non Plus Ultra", variations: ["Cardenal Mendoza Non Plus Ultra"] }
    ]
  },
  {
    name: "Lepanto",
    variations: ["Brandy Lepanto", "González Byass"],
    region: "Jerez",
    country: "Spain",
    type: ["brandy"],
    product_lines: [
      { name: "Solera Gran Reserva", variations: ["Lepanto Solera Gran Reserva"] },
      { name: "OV", variations: ["Lepanto OV"] },
      { name: "PX", variations: ["Lepanto PX"] }
    ]
  },
  {
    name: "Carlos I",
    variations: ["Brandy Carlos I", "Carlos Primero"],
    region: "Jerez",
    country: "Spain",
    type: ["brandy"],
    product_lines: [
      { name: "Solera Gran Reserva", variations: ["Carlos I Solera Gran Reserva"] },
      { name: "Imperial", variations: ["Carlos I Imperial XO"] },
      { name: "1520", variations: ["Carlos I 1520"] }
    ]
  },
  {
    name: "Gran Duque de Alba",
    variations: ["Brandy Gran Duque de Alba"],
    region: "Jerez",
    country: "Spain",
    type: ["brandy"],
    product_lines: [
      { name: "Solera Gran Reserva", variations: ["Gran Duque de Alba Solera Gran Reserva"] },
      { name: "XO", variations: ["Gran Duque de Alba XO"] },
      { name: "Oro", variations: ["Gran Duque de Alba Oro"] }
    ]
  },
  {
    name: "Fernando de Castilla",
    variations: ["Brandy Fernando de Castilla"],
    region: "Jerez",
    country: "Spain",
    type: ["brandy"],
    product_lines: [
      { name: "Solera Reserva", variations: ["Fernando de Castilla Solera Reserva"] },
      { name: "Solera Gran Reserva", variations: ["Fernando de Castilla Solera Gran Reserva"] },
      { name: "Único", variations: ["Fernando de Castilla Único"] }
    ]
  },

  // ========== AMERICAN BRANDY ==========
  {
    name: "Copper & Kings",
    variations: ["Copper & Kings American Brandy"],
    region: "Kentucky",
    country: "USA",
    type: ["brandy"],
    product_lines: [
      { name: "American Craft", variations: ["Copper & Kings American Craft Brandy"] },
      { name: "Butchertown", variations: ["Copper & Kings Butchertown"] },
      { name: "Floodwall", variations: ["Copper & Kings Floodwall"] }
    ]
  },
  {
    name: "Germain-Robin",
    variations: ["Germain Robin", "Craft Distillers"],
    region: "California",
    country: "USA",
    type: ["brandy"],
    product_lines: [
      { name: "Select Barrel", variations: ["Germain-Robin Select Barrel XO"] },
      { name: "Coast Road Reserve", variations: ["Germain-Robin Coast Road Reserve"] },
      { name: "Single Barrel", variations: ["Germain-Robin Single Barrel"] }
    ]
  },
  {
    name: "Osocalis",
    variations: ["Osocalis Distillery"],
    region: "California",
    country: "USA",
    type: ["brandy"],
    product_lines: [
      { name: "Rare Alambic", variations: ["Osocalis Rare Alambic Brandy"] },
      { name: "XO", variations: ["Osocalis XO"] }
    ]
  },
  {
    name: "Clear Creek",
    variations: ["Clear Creek Distillery"],
    region: "Oregon",
    country: "USA",
    type: ["brandy"],
    product_lines: [
      { name: "Apple Brandy", variations: ["Clear Creek Apple Brandy"] },
      { name: "Pear Brandy", variations: ["Clear Creek Pear Brandy"] },
      { name: "Blue Plum", variations: ["Clear Creek Blue Plum Brandy"] }
    ]
  },
  {
    name: "St. George",
    variations: ["St. George Spirits"],
    region: "California",
    country: "USA",
    type: ["brandy"],
    product_lines: [
      { name: "Apple Brandy", variations: ["St. George Apple Brandy"] },
      { name: "Pear Brandy", variations: ["St. George Pear Brandy"] },
      { name: "Reserve Apple", variations: ["St. George Reserve Apple Brandy"] }
    ]
  },
  {
    name: "Laird's",
    variations: ["Laird & Company"],
    region: "New Jersey",
    country: "USA",
    type: ["brandy", "applejack"],
    product_lines: [
      { name: "Applejack", variations: ["Laird's Applejack"] },
      { name: "Apple Brandy", variations: ["Laird's Apple Brandy"] },
      { name: "Bottled in Bond", variations: ["Laird's Bottled in Bond"] },
      { name: "Rare Apple", variations: ["Laird's Rare Apple Brandy"] }
    ]
  },

  // ========== CALVADOS PRODUCERS ==========
  {
    name: "Christian Drouin",
    variations: ["Calvados Christian Drouin"],
    region: "Calvados",
    country: "France",
    type: ["calvados"],
    product_lines: [
      { name: "Selection", variations: ["Christian Drouin Selection"] },
      { name: "VSOP", variations: ["Christian Drouin VSOP"] },
      { name: "XO", variations: ["Christian Drouin XO"] },
      { name: "Vintage", variations: ["Christian Drouin Vintage"] }
    ]
  },
  {
    name: "Roger Groult",
    variations: ["Calvados Roger Groult"],
    region: "Calvados",
    country: "France",
    type: ["calvados"],
    product_lines: [
      { name: "3 Year", variations: ["Roger Groult 3 Ans"] },
      { name: "Reserve", variations: ["Roger Groult Reserve"] },
      { name: "Venerable", variations: ["Roger Groult Venerable"] },
      { name: "Doyen d'Age", variations: ["Roger Groult Doyen d'Age"] }
    ]
  },
  {
    name: "Boulard",
    variations: ["Calvados Boulard"],
    region: "Calvados",
    country: "France",
    type: ["calvados"],
    product_lines: [
      { name: "VSOP", variations: ["Boulard VSOP"] },
      { name: "XO", variations: ["Boulard XO"] },
      { name: "Auguste", variations: ["Boulard Auguste"] }
    ]
  },
  {
    name: "Père Magloire",
    variations: ["Calvados Père Magloire"],
    region: "Calvados",
    country: "France",
    type: ["calvados"],
    product_lines: [
      { name: "VS", variations: ["Père Magloire VS"] },
      { name: "VSOP", variations: ["Père Magloire VSOP"] },
      { name: "XO", variations: ["Père Magloire XO"] }
    ]
  },
  {
    name: "Lemorton",
    variations: ["Domaine Lemorton", "Calvados Lemorton"],
    region: "Calvados",
    country: "France",
    type: ["calvados"],
    product_lines: [
      { name: "Reserve", variations: ["Lemorton Reserve"] },
      { name: "Vintage", variations: ["Lemorton Vintage"] }
    ]
  },

  // ========== SOUTH AMERICAN BRANDY ==========
  {
    name: "Pisco Portón",
    variations: ["Portón", "Pisco Portón"],
    region: "Ica",
    country: "Peru",
    type: ["pisco"],
    product_lines: [
      { name: "Mosto Verde", variations: ["Portón Mosto Verde"] },
      { name: "Acholado", variations: ["Portón Acholado"] }
    ]
  },
  {
    name: "Barsol",
    variations: ["Barsol Pisco"],
    region: "Ica",
    country: "Peru",
    type: ["pisco"],
    product_lines: [
      { name: "Quebranta", variations: ["Barsol Quebranta"] },
      { name: "Italia", variations: ["Barsol Italia"] },
      { name: "Torontel", variations: ["Barsol Torontel"] },
      { name: "Acholado", variations: ["Barsol Acholado"] }
    ]
  },
  {
    name: "Capel",
    variations: ["Pisco Capel"],
    region: "Elqui Valley",
    country: "Chile",
    type: ["pisco"],
    product_lines: [
      { name: "Especial", variations: ["Capel Especial"] },
      { name: "Reservado", variations: ["Capel Reservado"] },
      { name: "Moai", variations: ["Capel Moai"] }
    ]
  },
  {
    name: "Alto del Carmen",
    variations: ["Pisco Alto del Carmen"],
    region: "Huasco Valley",
    country: "Chile",
    type: ["pisco"],
    product_lines: [
      { name: "35°", variations: ["Alto del Carmen 35"] },
      { name: "40°", variations: ["Alto del Carmen 40"] },
      { name: "Reservado", variations: ["Alto del Carmen Reservado"] }
    ]
  },

  // ========== GRAPPA PRODUCERS ==========
  {
    name: "Nonino",
    variations: ["Grappa Nonino", "Distilleria Nonino"],
    region: "Friuli",
    country: "Italy",
    type: ["grappa"],
    product_lines: [
      { name: "Vendemmia", variations: ["Nonino Grappa Vendemmia"] },
      { name: "Monovitigno", variations: ["Nonino Monovitigno"] },
      { name: "Riserva", variations: ["Nonino Grappa Riserva"] }
    ]
  },
  {
    name: "Marolo",
    variations: ["Grappa Marolo", "Distilleria Marolo"],
    region: "Piedmont",
    country: "Italy",
    type: ["grappa"],
    product_lines: [
      { name: "Nebbiolo", variations: ["Marolo Grappa di Nebbiolo"] },
      { name: "Barolo", variations: ["Marolo Grappa di Barolo"] },
      { name: "Brunello", variations: ["Marolo Grappa di Brunello"] }
    ]
  },
  {
    name: "Poli",
    variations: ["Poli Grappa", "Distillerie Poli"],
    region: "Veneto",
    country: "Italy",
    type: ["grappa"],
    product_lines: [
      { name: "Sarpa", variations: ["Poli Sarpa di Poli"] },
      { name: "Cleopatra", variations: ["Poli Cleopatra Moscato Oro"] },
      { name: "Museum", variations: ["Poli Grappa Museum"] }
    ]
  },
  {
    name: "Berta",
    variations: ["Grappa Berta", "Distillerie Berta"],
    region: "Piedmont",
    country: "Italy",
    type: ["grappa"],
    product_lines: [
      { name: "Tre Soli Tre", variations: ["Berta Tre Soli Tre"] },
      { name: "Roccanivo", variations: ["Berta Roccanivo"] },
      { name: "Elisi", variations: ["Berta Elisi"] }
    ]
  },
  {
    name: "Nardini",
    variations: ["Grappa Nardini", "Bortolo Nardini"],
    region: "Veneto",
    country: "Italy",
    type: ["grappa"],
    product_lines: [
      { name: "Bianca", variations: ["Nardini Grappa Bianca"] },
      { name: "Riserva", variations: ["Nardini Grappa Riserva"] },
      { name: "Selezione", variations: ["Nardini Selezione Bortolo"] }
    ]
  }
];

export const ALL_COGNAC_BRANDY_DISTILLERIES = COGNAC_BRANDY_DISTILLERIES;