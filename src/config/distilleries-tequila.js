// ========== TEQUILA DISTILLERIES ==========
export const TEQUILA_DISTILLERIES = [
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
    {
        name: "Fortaleza",
        variations: ["Destilería La Fortaleza", "Los Abuelos"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "fortalezatequila.com",
        priority: 9,
        product_lines: [
            { name: "Fortaleza Blanco", modifiers: ["traditional", "tahona crushed"] },
            { name: "Fortaleza Reposado", modifiers: ["aged 8 months", "american oak"] },
            { name: "Fortaleza Añejo", modifiers: ["aged 18 months", "american oak"] },
            { name: "Fortaleza Still Strength", subcategories: ["Blanco", "Reposado", "Añejo"] },
            { name: "Fortaleza Winter Blend", modifiers: ["limited edition", "annual release"] },
            { name: "Fortaleza Lot 100", modifiers: ["special release", "commemorative"] }
        ],
        modifiers: ["stone tahona", "traditional methods", "copper pot still", "estate grown"],
        base_queries: [
            "Fortaleza tequila",
            "Fortaleza still strength",
            "Fortaleza winter blend"
        ]
    },
    {
        name: "El Tesoro",
        variations: ["El Tesoro de Don Felipe", "La Alteña Distillery"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "eltesorotequila.com",
        priority: 8,
        product_lines: [
            { name: "El Tesoro Blanco", modifiers: ["highland agave", "tahona"] },
            { name: "El Tesoro Reposado", modifiers: ["aged 9-11 months"] },
            { name: "El Tesoro Añejo", modifiers: ["aged 2-3 years"] },
            { name: "El Tesoro Extra Añejo", modifiers: ["aged 4-5 years"] },
            { name: "El Tesoro Paradiso", modifiers: ["extra añejo", "cognac barrels"] },
            { name: "El Tesoro Single Barrel", modifiers: ["limited edition", "barrel select"] },
            { name: "El Tesoro 80th Anniversary", modifiers: ["extra añejo", "limited edition"] }
        ],
        modifiers: ["tahona crushed", "highland agave", "family owned", "traditional"],
        base_queries: [
            "El Tesoro tequila",
            "El Tesoro Paradiso",
            "El Tesoro single barrel"
        ]
    },
    {
        name: "Ocho",
        variations: ["Tequila Ocho", "8 Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "ochotequila.com",
        priority: 8,
        product_lines: [
            { name: "Ocho Blanco", modifiers: ["single estate", "vintage dated"] },
            { name: "Ocho Reposado", modifiers: ["aged 8 weeks 8 days", "single estate"] },
            { name: "Ocho Añejo", modifiers: ["aged 1 year", "single estate"] },
            { name: "Ocho Extra Añejo", modifiers: ["aged 3 years", "single estate"] },
            { name: "Single Estate Releases", modifiers: ["vintage", "specific ranch", "terroir"] },
            { name: "Ocho Widow Jane", modifiers: ["barrel finish", "collaboration"] }
        ],
        modifiers: ["single estate", "vintage tequila", "terroir focused", "field to bottle"],
        base_queries: [
            "Ocho tequila",
            "Tequila Ocho single estate",
            "Ocho vintage"
        ]
    },
    {
        name: "G4",
        variations: ["G4 Tequila", "Destilería El Pandillo"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "g4tequila.com",
        priority: 8,
        product_lines: [
            { name: "G4 Blanco", modifiers: ["high proof", "tahona/roller mill"] },
            { name: "G4 Reposado", modifiers: ["aged 6 months", "american oak"] },
            { name: "G4 Añejo", modifiers: ["aged 18 months", "american oak"] },
            { name: "G4 Extra Añejo", modifiers: ["aged 3+ years", "american oak"] },
            { name: "G4 Still Proof", subcategories: ["Blanco", "Reposado"] },
            { name: "G4 5 Year Extra Añejo", modifiers: ["limited edition"] }
        ],
        modifiers: ["Felipe Camarena", "tahona", "deep well water", "high proof"],
        base_queries: [
            "G4 tequila",
            "Felipe Camarena tequila",
            "G4 still proof"
        ]
    },
    {
        name: "Jose Cuervo",
        variations: ["Cuervo", "Jose Cuervo Tequila", "Casa Cuervo"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Becle",
        website: "cuervo.com",
        priority: 9,
        product_lines: [
            { name: "Jose Cuervo Especial", subcategories: ["Silver", "Gold"] },
            { name: "Jose Cuervo Tradicional", subcategories: ["Silver", "Reposado", "Añejo", "Cristalino"] },
            { name: "Jose Cuervo Platino", modifiers: ["silver", "premium"] },
            { name: "Jose Cuervo Reserva de la Familia", subcategories: ["Reposado", "Extra Añejo", "Platino"] },
            { name: "Jose Cuervo 250 Aniversario", modifiers: ["extra añejo", "limited edition"] },
            { name: "1800 Tequila", subcategories: ["Silver", "Coconut", "Reposado", "Añejo", "Cristalino", "Milenio"] },
            { name: "Gran Centenario", subcategories: ["Plata", "Reposado", "Añejo", "Leyenda"] },
            { name: "Maestro Dobel", subcategories: ["Silver", "Reposado", "Añejo", "50 Cristalino", "Atelier"] }
        ],
        modifiers: ["world's oldest tequila", "La Rojeña distillery", "family owned since 1758"],
        base_queries: [
            "Jose Cuervo tequila",
            "Cuervo Reserva de la Familia",
            "1800 tequila",
            "Gran Centenario",
            "Maestro Dobel"
        ]
    },
    {
        name: "Avión",
        variations: ["Avion Tequila", "Tequila Avion"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Pernod Ricard",
        website: "aviontequila.com",
        priority: 8,
        product_lines: [
            { name: "Avión Silver", modifiers: ["unaged", "crisp"] },
            { name: "Avión Reposado", modifiers: ["aged 6 months"] },
            { name: "Avión Añejo", modifiers: ["aged 2 years"] },
            { name: "Avión Cristalino", modifiers: ["añejo cristalino", "charcoal filtered"] },
            { name: "Avión Reserva 44", modifiers: ["extra añejo", "aged 44 months"] },
            { name: "Avión Reserva Cristalino", modifiers: ["ultra premium", "limited edition"] }
        ],
        modifiers: ["single origin agave", "slow roasted", "small batch"],
        base_queries: [
            "Avion tequila",
            "Avion Reserva 44",
            "Avion Cristalino"
        ]
    },
    {
        name: "Espolòn",
        variations: ["Espolon Tequila", "Tequila Espolon"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Campari Group",
        website: "espolontequila.com",
        priority: 7,
        product_lines: [
            { name: "Espolòn Blanco", modifiers: ["silver", "unaged"] },
            { name: "Espolòn Reposado", modifiers: ["aged 6 months"] },
            { name: "Espolòn Añejo", modifiers: ["aged 12 months"] },
            { name: "Espolòn Cristalino", modifiers: ["añejo cristalino"] },
            { name: "Espolòn Añejo X", modifiers: ["extra aged", "bourbon barrels"] }
        ],
        modifiers: ["100% blue agave", "traditional methods", "value premium"],
        base_queries: [
            "Espolon tequila",
            "Espolòn tequila",
            "Espolon cristalino"
        ]
    },
    {
        name: "Milagro",
        variations: ["Milagro Tequila", "Tequila Milagro"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "William Grant & Sons",
        website: "milagrotequila.com",
        priority: 7,
        product_lines: [
            { name: "Milagro Silver", modifiers: ["100% agave", "triple distilled"] },
            { name: "Milagro Reposado", modifiers: ["aged 2-4 months", "american oak"] },
            { name: "Milagro Añejo", modifiers: ["aged 14-24 months", "american oak"] },
            { name: "Milagro Select", subcategories: ["Silver", "Reposado", "Añejo"] },
            { name: "Milagro Cristalino", modifiers: ["añejo cristalino", "charcoal filtered"] },
            { name: "Milagro Romance", modifiers: ["limited edition", "extra añejo"] },
            { name: "Milagro Unico", subcategories: ["Silver", "Reposado", "Añejo"] }
        ],
        modifiers: ["modern methods", "agave forward", "artisanal"],
        base_queries: [
            "Milagro tequila",
            "Milagro Select",
            "Milagro Romance"
        ]
    },
    {
        name: "Olmeca",
        variations: ["Olmeca Tequila", "Tequila Olmeca"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Pernod Ricard",
        website: "olmecatequila.com",
        priority: 6,
        product_lines: [
            { name: "Olmeca Blanco", modifiers: ["silver", "classic"] },
            { name: "Olmeca Gold", modifiers: ["joven", "gold tequila"] },
            { name: "Olmeca Reposado", modifiers: ["aged", "oak barrels"] },
            { name: "Olmeca Altos", subcategories: ["Plata", "Reposado", "Añejo"] },
            { name: "Olmeca Tezon", subcategories: ["Blanco", "Reposado", "Añejo"] }
        ],
        modifiers: ["tahona process", "traditional", "mixto and 100% agave"],
        base_queries: [
            "Olmeca tequila",
            "Olmeca Altos",
            "Olmeca Tezon"
        ]
    },
    {
        name: "Cazadores",
        variations: ["Tequila Cazadores", "Cazadores"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Bacardi Limited",
        website: "cazadores.com",
        priority: 7,
        product_lines: [
            { name: "Cazadores Blanco", modifiers: ["silver", "citrus notes"] },
            { name: "Cazadores Reposado", modifiers: ["aged 2 months", "woody notes"] },
            { name: "Cazadores Añejo", modifiers: ["aged 12 months", "american oak"] },
            { name: "Cazadores Extra Añejo", modifiers: ["aged 3+ years", "limited edition"] },
            { name: "Cazadores Cristalino", modifiers: ["añejo cristalino", "charcoal filtered"] }
        ],
        modifiers: ["100% blue agave", "double fermentation", "hidden recipe"],
        base_queries: [
            "Cazadores tequila",
            "Tequila Cazadores",
            "Cazadores extra añejo"
        ]
    },
    {
        name: "Hornitos",
        variations: ["Hornitos Tequila", "Sauza Hornitos"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Beam Suntory",
        website: "hornitostequila.com",
        priority: 7,
        product_lines: [
            { name: "Hornitos Plata", modifiers: ["silver", "100% agave"] },
            { name: "Hornitos Reposado", modifiers: ["aged 2 months"] },
            { name: "Hornitos Añejo", modifiers: ["aged 12 months"] },
            { name: "Hornitos Black Barrel", modifiers: ["aged 12 months", "whiskey barrels"] },
            { name: "Hornitos Cristalino", modifiers: ["triple distilled", "aged 12 months"] },
            { name: "Hornitos Lime Shot", modifiers: ["flavored", "lime infused"] }
        ],
        modifiers: ["100% blue agave", "double distilled", "Sauza family"],
        base_queries: [
            "Hornitos tequila",
            "Hornitos Black Barrel",
            "Sauza Hornitos"
        ]
    },
    {
        name: "Corralejo",
        variations: ["Tequila Corralejo", "Hacienda Corralejo"],
        region: "Guanajuato",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilacorralejo.mx",
        priority: 7,
        product_lines: [
            { name: "Corralejo Silver", modifiers: ["unaged", "100% agave"] },
            { name: "Corralejo Reposado", modifiers: ["aged 4 months", "three woods"] },
            { name: "Corralejo Añejo", modifiers: ["aged 12 months", "american oak"] },
            { name: "Corralejo 99,000 Horas", modifiers: ["añejo", "aged 18 months"] },
            { name: "Corralejo Gran Añejo", modifiers: ["extra añejo", "aged 3 years"] },
            { name: "Corralejo Extra Añejo 1821", modifiers: ["aged 36 months", "limited edition"] }
        ],
        modifiers: ["estate grown", "French Charentais stills", "unique bottles"],
        base_queries: [
            "Corralejo tequila",
            "Tequila Corralejo",
            "Corralejo 99000 horas"
        ]
    },
    {
        name: "Sauza",
        variations: ["Sauza Tequila", "Casa Sauza"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Beam Suntory",
        website: "sauzatequila.com",
        priority: 7,
        product_lines: [
            { name: "Sauza Blue", subcategories: ["Silver", "Reposado"] },
            { name: "Sauza Gold", modifiers: ["joven", "gold tequila"] },
            { name: "Sauza Signature Blue", subcategories: ["Silver", "Reposado", "Añejo"] },
            { name: "Sauza Tres Generaciones", subcategories: ["Plata", "Reposado", "Añejo"] },
            { name: "Sauza XA", modifiers: ["extra añejo", "aged 3+ years"] },
            { name: "Sauza Conmemorativo", modifiers: ["añejo", "commemorative edition"] }
        ],
        modifiers: ["family heritage", "since 1873", "fresh agave process"],
        base_queries: [
            "Sauza tequila",
            "Sauza Tres Generaciones",
            "Sauza XA"
        ]
    },
    {
        name: "Lunazul",
        variations: ["Lunazul Tequila", "Luna Azul"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Heaven Hill Distilleries",
        website: "lunazultequila.com",
        priority: 6,
        product_lines: [
            { name: "Lunazul Blanco", modifiers: ["100% agave", "unaged"] },
            { name: "Lunazul Reposado", modifiers: ["aged 6 months", "american oak"] },
            { name: "Lunazul Añejo", modifiers: ["aged 12-18 months"] },
            { name: "Lunazul Primero", modifiers: ["cristalino", "añejo filtered"] },
            { name: "Lunazul El Humoso", modifiers: ["mezcal", "100% espadín"] }
        ],
        modifiers: ["100% blue weber agave", "value premium", "Tierra de Agaves"],
        base_queries: [
            "Lunazul tequila",
            "Lunazul Primero",
            "Lunazul El Humoso"
        ]
    },
    {
        name: "Tapatio",
        variations: ["Tequila Tapatio", "El Tesoro Tapatio"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilatapatio.com",
        priority: 8,
        product_lines: [
            { name: "Tapatio Blanco", modifiers: ["110 proof", "tahona crushed"] },
            { name: "Tapatio Reposado", modifiers: ["aged 4 months", "american oak"] },
            { name: "Tapatio Añejo", modifiers: ["aged 18 months", "american oak"] },
            { name: "Tapatio Excelencia", modifiers: ["extra añejo", "aged 4 years"] },
            { name: "Gran Reserva de Don Felipe", modifiers: ["extra añejo", "aged 5+ years"] }
        ],
        modifiers: ["La Alteña distillery", "traditional methods", "high proof"],
        base_queries: [
            "Tapatio tequila",
            "Tequila Tapatio",
            "Tapatio Excelencia"
        ]
    },
    {
        name: "ArteNOM",
        variations: ["ArteNOM Selección", "Arte NOM"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "artenom.com",
        priority: 8,
        product_lines: [
            { name: "ArteNOM 1123", modifiers: ["blanco", "El Arenal"] },
            { name: "ArteNOM 1146", modifiers: ["añejo", "Amatitán"] },
            { name: "ArteNOM 1414", modifiers: ["reposado", "Arandas"] },
            { name: "ArteNOM 1449", modifiers: ["blanco", "Jesus María"] },
            { name: "ArteNOM 1579", modifiers: ["blanco", "Jesus María"] },
            { name: "ArteNOM 1549", modifiers: ["blanco organico", "Capilla de Guadalupe"] }
        ],
        modifiers: ["single distillery", "contract distilled", "terroir focused"],
        base_queries: [
            "ArteNOM tequila",
            "ArteNOM Seleccion",
            "Arte NOM"
        ]
    },
    {
        name: "Siete Leguas",
        variations: ["7 Leguas", "Tequila Siete Leguas"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilasieteleguas.com",
        priority: 8,
        product_lines: [
            { name: "Siete Leguas Blanco", modifiers: ["traditional", "tahona"] },
            { name: "Siete Leguas Reposado", modifiers: ["aged 8 months"] },
            { name: "Siete Leguas Añejo", modifiers: ["aged 24 months"] },
            { name: "D'Antaño", modifiers: ["extra añejo", "aged 5 years"] },
            { name: "Siete Leguas Single Barrel", modifiers: ["limited edition"] }
        ],
        modifiers: ["family owned", "original Patron distillery", "traditional methods"],
        base_queries: [
            "Siete Leguas tequila",
            "7 Leguas tequila",
            "D'Antaño tequila"
        ]
    },
    {
        name: "Casa Noble",
        variations: ["Casa Noble Tequila", "Noble Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Constellation Brands",
        website: "casanoble.com",
        priority: 8,
        product_lines: [
            { name: "Casa Noble Crystal", modifiers: ["blanco", "organic"] },
            { name: "Casa Noble Reposado", modifiers: ["aged 364 days", "french oak"] },
            { name: "Casa Noble Añejo", modifiers: ["aged 2 years", "french oak"] },
            { name: "Casa Noble Single Barrel", subcategories: ["Reposado", "Añejo"] },
            { name: "Casa Noble Santana", modifiers: ["extra añejo", "Carlos Santana"] },
            { name: "Casa Noble Marqués de Casa Noble", modifiers: ["extra añejo", "aged 5 years"] }
        ],
        modifiers: ["certified organic", "triple distilled", "french white oak"],
        base_queries: [
            "Casa Noble tequila",
            "Casa Noble organic",
            "Casa Noble Santana"
        ]
    },
    {
        name: "Partida",
        variations: ["Partida Tequila", "Tequila Partida"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "partidatequila.com",
        priority: 7,
        product_lines: [
            { name: "Partida Blanco", modifiers: ["additive free", "estate grown"] },
            { name: "Partida Reposado", modifiers: ["aged 6 months", "ex-bourbon barrels"] },
            { name: "Partida Añejo", modifiers: ["aged 18 months", "ex-bourbon barrels"] },
            { name: "Partida Cristalino", modifiers: ["añejo cristalino", "charcoal filtered"] },
            { name: "Partida Elegante", modifiers: ["extra añejo", "aged 36-40 months"] },
            { name: "Partida Roble Fino", subcategories: ["Reposado", "Añejo", "Extra Añejo"] }
        ],
        modifiers: ["estate grown agave", "gravity fed stills", "additive free"],
        base_queries: [
            "Partida tequila",
            "Partida Elegante",
            "Partida Roble Fino"
        ]
    },
    {
        name: "Tres Agaves",
        variations: ["3 Agaves", "Tres Agaves Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tresagaves.com",
        priority: 6,
        product_lines: [
            { name: "Tres Agaves Blanco", modifiers: ["organic", "unaged"] },
            { name: "Tres Agaves Reposado", modifiers: ["organic", "aged 6 months"] },
            { name: "Tres Agaves Añejo", modifiers: ["organic", "aged 18 months"] },
            { name: "Tres Agaves Margarita Mix", modifiers: ["organic", "agave nectar"] }
        ],
        modifiers: ["certified organic", "single estate", "sustainable"],
        base_queries: [
            "Tres Agaves tequila",
            "3 Agaves tequila",
            "Tres Agaves organic"
        ]
    },
    {
        name: "Codigo 1530",
        variations: ["Código 1530", "Codigo Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "codigo1530.com",
        priority: 8,
        product_lines: [
            { name: "Código 1530 Blanco", modifiers: ["unrested", "pure agave"] },
            { name: "Código 1530 Rosa", modifiers: ["blanco", "wine barrel rested"] },
            { name: "Código 1530 Reposado", modifiers: ["aged 6 months", "napa cabernet barrels"] },
            { name: "Código 1530 Añejo", modifiers: ["aged 18 months", "napa cabernet barrels"] },
            { name: "Código 1530 Origen", modifiers: ["extra añejo", "aged 6 years"] },
            { name: "Código 1530 Ancestral", modifiers: ["mezcal", "artisanal"] }
        ],
        modifiers: ["private recipe", "no additives", "family heritage"],
        base_queries: [
            "Codigo 1530 tequila",
            "Código 1530",
            "Codigo Rosa"
        ]
    },
    {
        name: "Tequila Ocho",
        variations: ["Ocho Tequila", "8 Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "ochotequila.com",
        priority: 8,
        product_lines: [
            { name: "Ocho Plata", modifiers: ["single estate", "vintage dated"] },
            { name: "Ocho Reposado", modifiers: ["aged 8 weeks 8 days"] },
            { name: "Ocho Añejo", modifiers: ["aged 1 year", "ex-bourbon"] },
            { name: "Ocho Extra Añejo", modifiers: ["aged 3 years", "limited release"] },
            { name: "Ocho Single Barrel", modifiers: ["cask strength", "limited edition"] }
        ],
        modifiers: ["single estate", "vintage tequila", "terroir driven"],
        base_queries: [
            "Tequila Ocho",
            "Ocho single estate",
            "Ocho vintage"
        ]
    },
    {
        name: "KAH",
        variations: ["KAH Tequila", "Tequila KAH"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "kahtequila.com",
        priority: 7,
        product_lines: [
            { name: "KAH Blanco", modifiers: ["skull bottle", "100% agave"] },
            { name: "KAH Reposado", modifiers: ["aged 10 months", "american oak"] },
            { name: "KAH Añejo", modifiers: ["aged 2 years", "american white oak"] },
            { name: "KAH Extra Añejo", modifiers: ["aged 4+ years", "ultra premium"] },
            { name: "KAH Day of the Dead", modifiers: ["limited edition", "collectible"] }
        ],
        modifiers: ["hand-painted bottles", "day of the dead", "ultra premium"],
        base_queries: [
            "KAH tequila",
            "KAH skull bottle",
            "KAH Day of the Dead"
        ]
    },
    {
        name: "Gran Dovejo",
        variations: ["Grand Dovejo", "Dovejo Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "grandovejo.com",
        priority: 7,
        product_lines: [
            { name: "Gran Dovejo Blanco", modifiers: ["high proof", "traditional"] },
            { name: "Gran Dovejo Reposado", modifiers: ["aged 6 months", "used barrels"] },
            { name: "Gran Dovejo Añejo", modifiers: ["aged 18 months", "charred barrels"] },
            { name: "Gran Dovejo High Proof", modifiers: ["blanco", "100 proof"] }
        ],
        modifiers: ["NOM 1558", "La Constancia", "traditional methods"],
        base_queries: [
            "Gran Dovejo tequila",
            "Dovejo high proof",
            "Grand Dovejo"
        ]
    },
    {
        name: "Pasote",
        variations: ["Tequila Pasote", "Pasote"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "pasotetequila.com",
        priority: 8,
        product_lines: [
            { name: "Pasote Blanco", modifiers: ["tahona crushed", "well water"] },
            { name: "Pasote Reposado", modifiers: ["aged 6 months", "used bourbon barrels"] },
            { name: "Pasote Añejo", modifiers: ["aged 12 months", "used bourbon barrels"] },
            { name: "Pasote Extra Añejo", modifiers: ["aged 3 years", "limited release"] }
        ],
        modifiers: ["El Pandillo distillery", "Felipe Camarena", "rainwater, tahona"],
        base_queries: [
            "Pasote tequila",
            "Tequila Pasote",
            "Pasote Felipe Camarena"
        ]
    },
    {
        name: "Volcan De Mi Tierra",
        variations: ["Volcan Tequila", "Volcan"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "LVMH",
        website: "volcandemitierratequila.com",
        priority: 8,
        product_lines: [
            { name: "Volcan Blanco", modifiers: ["lowland/highland blend"] },
            { name: "Volcan Reposado", modifiers: ["aged", "american/european oak"] },
            { name: "Volcan Cristalino", modifiers: ["añejo cristalino", "filtered"] },
            { name: "Volcan X.A", modifiers: ["extra añejo", "aged 3 years"] }
        ],
        modifiers: ["terroir blend", "volcanic soil", "luxury tequila"],
        base_queries: [
            "Volcan De Mi Tierra",
            "Volcan tequila",
            "Volcan XA"
        ]
    },
    {
        name: "123 Organic Tequila",
        variations: ["Uno Dos Tres", "123 Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "123tequila.com",
        priority: 7,
        product_lines: [
            { name: "123 Organic Blanco (Uno)", modifiers: ["organic", "unaged"] },
            { name: "123 Organic Reposado (Dos)", modifiers: ["organic", "aged 6 months"] },
            { name: "123 Organic Añejo (Tres)", modifiers: ["organic", "aged 18 months"] },
            { name: "123 Organic Extra Añejo", modifiers: ["organic", "aged 40 months"] },
            { name: "Diablito", modifiers: ["extra añejo", "aged 40 months", "special release"] }
        ],
        modifiers: ["certified organic", "David Ravandi", "small batch"],
        base_queries: [
            "123 Organic Tequila",
            "Uno Dos Tres tequila",
            "123 Diablito"
        ]
    },
    {
        name: "Corazón",
        variations: ["Corazon Tequila", "Tequila Corazon"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Sazerac Company",
        website: "corazontequila.com",
        priority: 7,
        product_lines: [
            { name: "Corazón Blanco", modifiers: ["unaged", "100% agave"] },
            { name: "Corazón Reposado", modifiers: ["aged 6-8 months"] },
            { name: "Corazón Añejo", modifiers: ["aged 18-24 months"] },
            { name: "Expresiones", subcategories: ["Buffalo Trace", "George T. Stagg", "Sazerac Rye", "Thomas H. Handy"] },
            { name: "Corazón Single Estate", modifiers: ["limited edition"] }
        ],
        modifiers: ["Buffalo Trace barrels", "Casa San Matías", "whiskey barrel aged"],
        base_queries: [
            "Corazon tequila",
            "Corazon Expresiones",
            "Corazon Buffalo Trace"
        ]
    },
    {
        name: "Riazul",
        variations: ["Riazul Tequila", "Tequila Riazul"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "riazultequila.com",
        priority: 7,
        product_lines: [
            { name: "Riazul Plata", modifiers: ["highland agave", "pot still"] },
            { name: "Riazul Reposado", modifiers: ["aged 9 months", "french oak"] },
            { name: "Riazul Añejo", modifiers: ["aged 2 years", "XO cognac barrels"] },
            { name: "Riazul Extra Añejo", modifiers: ["aged 3 years", "limited release"] }
        ],
        modifiers: ["Iñaki Orozco", "highland estate", "cognac barrels"],
        base_queries: [
            "Riazul tequila",
            "Riazul cognac barrel",
            "Riazul añejo"
        ]
    },
    {
        name: "DeLeón",
        variations: ["DeLeon Tequila", "Tequila DeLeon"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Diageo",
        website: "deleontequila.com",
        priority: 8,
        product_lines: [
            { name: "DeLeón Platinum", modifiers: ["silver", "luxury"] },
            { name: "DeLeón Reposado", modifiers: ["aged", "american oak"] },
            { name: "DeLeón Añejo", modifiers: ["aged 14 months", "american oak"] },
            { name: "DeLeón Diamante", modifiers: ["joven", "highland/lowland blend"] },
            { name: "DeLeón Extra Añejo", modifiers: ["aged 36-48 months", "ultra premium"] },
            { name: "DeLeón Leona", modifiers: ["extra añejo", "limited edition"] }
        ],
        modifiers: ["luxury tequila", "P. Diddy", "ultra premium"],
        base_queries: [
            "DeLeon tequila",
            "DeLeón tequila",
            "DeLeon Diddy"
        ]
    },
    {
        name: "Dulce Vida",
        variations: ["Dulce Vida Spirits", "Dulce Vida Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "dulcevidaspirits.com",
        priority: 7,
        product_lines: [
            { name: "Dulce Vida Blanco", modifiers: ["100 proof", "organic"] },
            { name: "Dulce Vida Reposado", modifiers: ["100 proof", "aged 9-11 months"] },
            { name: "Dulce Vida Añejo", modifiers: ["100 proof", "aged 24 months"] },
            { name: "Dulce Vida Extra Añejo", modifiers: ["100 proof", "aged 5 years"] },
            { name: "Dulce Vida Lime", modifiers: ["flavored", "organic lime"] },
            { name: "Dulce Vida Grapefruit", modifiers: ["flavored", "organic grapefruit"] }
        ],
        modifiers: ["organic certified", "100 proof", "woman owned"],
        base_queries: [
            "Dulce Vida tequila",
            "Dulce Vida organic",
            "Dulce Vida 100 proof"
        ]
    },
    {
        name: "República",
        variations: ["Republica Tequila", "Tequila Republica", "Playa Real"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "republicatequila.com",
        priority: 6,
        product_lines: [
            { name: "República Plata", modifiers: ["organic", "estate grown"] },
            { name: "República Reposado", modifiers: ["organic", "aged oak barrels"] },
            { name: "República Añejo", modifiers: ["organic", "aged 18 months"] }
        ],
        modifiers: ["USDA organic", "sustainable", "estate bottled"],
        base_queries: [
            "Republica tequila",
            "República organic tequila",
            "Playa Real tequila"
        ]
    },
    {
        name: "Suerte",
        variations: ["Suerte Tequila", "Tequila Suerte"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "suertetequila.com",
        priority: 7,
        product_lines: [
            { name: "Suerte Blanco", modifiers: ["tahona crushed", "pure"] },
            { name: "Suerte Reposado", modifiers: ["aged 7 months", "american oak"] },
            { name: "Suerte Añejo", modifiers: ["aged 24 months", "american oak"] },
            { name: "Suerte Extra Añejo", modifiers: ["aged 7 years", "limited release"] }
        ],
        modifiers: ["tahona stone", "Lucky Rabbit", "small batch"],
        base_queries: [
            "Suerte tequila",
            "Suerte Lucky Rabbit",
            "Suerte tahona"
        ]
    },
    {
        name: "Mijenta",
        variations: ["Mijenta Tequila", "Maestra Tequilera"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "mijenta.com",
        priority: 8,
        product_lines: [
            { name: "Mijenta Blanco", modifiers: ["sustainable", "artisanal"] },
            { name: "Mijenta Reposado", modifiers: ["aged 6 months", "sustainable"] },
            { name: "Mijenta Cristalino", modifiers: ["aged 18 months", "filtered"] },
            { name: "Mijenta Añejo", modifiers: ["aged 18 months", "limited release"] }
        ],
        modifiers: ["sustainable production", "woman maestra", "Ana María Romero"],
        base_queries: [
            "Mijenta tequila",
            "Mijenta sustainable",
            "Maestra Tequilera"
        ]
    },
    {
        name: "Bribon",
        variations: ["Bribon Tequila", "El Bribon"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "bribontequila.com",
        priority: 6,
        product_lines: [
            { name: "Bribon Blanco", modifiers: ["unaged", "crisp"] },
            { name: "Bribon Reposado", modifiers: ["aged 8 months", "american oak"] },
            { name: "Bribon Añejo", modifiers: ["aged 15 months", "american oak"] }
        ],
        modifiers: ["Amatitán valley", "100% agave", "traditional methods"],
        base_queries: [
            "Bribon tequila",
            "El Bribon tequila"
        ]
    },
    {
        name: "Altos",
        variations: ["Olmeca Altos", "Altos Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Pernod Ricard",
        website: "altostequila.com",
        priority: 7,
        product_lines: [
            { name: "Altos Plata", modifiers: ["100% agave", "highland"] },
            { name: "Altos Reposado", modifiers: ["aged 6-8 months", "ex-bourbon"] },
            { name: "Altos Añejo", modifiers: ["aged 18 months", "ex-bourbon"] }
        ],
        modifiers: ["highland agave", "tahona method", "bartender favorite"],
        base_queries: [
            "Altos tequila",
            "Olmeca Altos",
            "Altos tahona"
        ]
    },
    {
        name: "Arette",
        variations: ["Tequila Arette", "Arette Artesanal"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilaarette.com",
        priority: 7,
        product_lines: [
            { name: "Arette Blanco", modifiers: ["classic", "100% agave"] },
            { name: "Arette Reposado", modifiers: ["aged 6 months"] },
            { name: "Arette Añejo", modifiers: ["aged 14 months"] },
            { name: "Arette Gran Clase", modifiers: ["extra añejo", "aged 36 months"] },
            { name: "Arette Artesanal", subcategories: ["Blanco", "Reposado", "Añejo"] },
            { name: "Arette Fuerte", modifiers: ["101 proof", "high strength"] }
        ],
        modifiers: ["El Llano distillery", "family owned", "award winning"],
        base_queries: [
            "Arette tequila",
            "Tequila Arette",
            "Arette Gran Clase"
        ]
    },
    {
        name: "Centenario",
        variations: ["Gran Centenario", "Centenario Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Gallardo Company",
        website: "grancentenario.com",
        priority: 7,
        product_lines: [
            { name: "Gran Centenario Plata", modifiers: ["fresh agave", "citrus notes"] },
            { name: "Gran Centenario Reposado", modifiers: ["aged 6 months", "oak"] },
            { name: "Gran Centenario Añejo", modifiers: ["aged 18 months", "oak"] },
            { name: "Gran Centenario Cristalino", modifiers: ["filtered añejo"] },
            { name: "Gran Centenario Leyenda", modifiers: ["extra añejo", "aged 4 years"] },
            { name: "Gran Centenario Azul", modifiers: ["limited edition", "ceramic bottle"] }
        ],
        modifiers: ["Selección Suave process", "angel bottle", "since 1857"],
        base_queries: [
            "Gran Centenario",
            "Centenario tequila",
            "Centenario Leyenda"
        ]
    },
    {
        name: "Chinaco",
        variations: ["Tequila Chinaco", "Chinaco"],
        region: "Tamaulipas",
        country: "Mexico",
        type: ["tequila"],
        website: "chinaco.com.mx",
        priority: 7,
        product_lines: [
            { name: "Chinaco Blanco", modifiers: ["Tamaulipas origin", "unique terroir"] },
            { name: "Chinaco Reposado", modifiers: ["aged 11 months", "oak"] },
            { name: "Chinaco Añejo", modifiers: ["aged 30 months", "oak"] },
            { name: "Chinaco Extra Añejo", modifiers: ["aged 4 years", "limited"] },
            { name: "Chinaco Negro", modifiers: ["extra añejo", "aged 5 years"] }
        ],
        modifiers: ["Tamaulipas terroir", "first tequila from region", "González family"],
        base_queries: [
            "Chinaco tequila",
            "Tequila Chinaco",
            "Chinaco Negro"
        ]
    },
    {
        name: "Pura Vida",
        variations: ["Pura Vida Tequila", "PuraVida"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "puravidatequila.com",
        priority: 6,
        product_lines: [
            { name: "Pura Vida Silver", modifiers: ["triple distilled", "smooth"] },
            { name: "Pura Vida Reposado", modifiers: ["aged 6 months"] },
            { name: "Pura Vida Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["triple distilled", "100% agave", "smooth finish"],
        base_queries: [
            "Pura Vida tequila",
            "PuraVida tequila"
        ]
    },
    {
        name: "Teremana",
        variations: ["Teremana Tequila", "The Rock Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "teremana.com",
        priority: 8,
        product_lines: [
            { name: "Teremana Blanco", modifiers: ["small batch", "highland agave"] },
            { name: "Teremana Reposado", modifiers: ["aged 2-4 months", "oak barrels"] },
            { name: "Teremana Añejo", modifiers: ["aged 12+ months", "coming soon"] }
        ],
        modifiers: ["Dwayne Johnson", "small batch", "sustainable"],
        base_queries: [
            "Teremana tequila",
            "The Rock tequila",
            "Dwayne Johnson tequila"
        ]
    },
    {
        name: "Lobos 1707",
        variations: ["Lobos Tequila", "Lobos 1707 Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila", "mezcal"],
        website: "lobos1707.com",
        priority: 8,
        product_lines: [
            { name: "Lobos 1707 Joven", modifiers: ["tequila-mezcal blend", "unique"] },
            { name: "Lobos 1707 Reposado", modifiers: ["aged 6 months", "american oak"] },
            { name: "Lobos 1707 Extra Añejo", modifiers: ["aged 3 years", "PX sherry finish"] },
            { name: "Lobos 1707 Mezcal", modifiers: ["artisanal", "espadín"] }
        ],
        modifiers: ["LeBron James", "Diego Osorio", "carbon neutral"],
        base_queries: [
            "Lobos 1707",
            "Lobos tequila",
            "LeBron James tequila"
        ]
    },
    {
        name: "Cincoro",
        variations: ["Cincoro Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "cincoro.com",
        priority: 8,
        product_lines: [
            { name: "Cincoro Blanco", modifiers: ["small batch", "agave forward"] },
            { name: "Cincoro Reposado", modifiers: ["aged 8-10 months", "american oak"] },
            { name: "Cincoro Añejo", modifiers: ["aged 24-28 months", "american oak"] },
            { name: "Cincoro Extra Añejo", modifiers: ["aged 40-44 months", "ultra premium"] },
            { name: "Cincoro Gold", modifiers: ["blend", "unique process"] }
        ],
        modifiers: ["NBA owners", "Michael Jordan", "luxury tequila"],
        base_queries: [
            "Cincoro tequila",
            "Michael Jordan tequila",
            "Cincoro Gold"
        ]
    },
    {
        name: "818",
        variations: ["818 Tequila", "Eight One Eight"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "drink818.com",
        priority: 8,
        product_lines: [
            { name: "818 Blanco", modifiers: ["smooth", "vanilla notes"] },
            { name: "818 Reposado", modifiers: ["aged 2-4 months", "american oak"] },
            { name: "818 Añejo", modifiers: ["aged 12+ months", "american/french oak"] },
            { name: "818 Eight Reserve", modifiers: ["extra añejo", "aged 8 years"] }
        ],
        modifiers: ["Kendall Jenner", "award winning", "sustainable practices"],
        base_queries: [
            "818 tequila",
            "Kendall Jenner tequila",
            "Eight One Eight tequila"
        ]
    },
    {
        name: "Nosotros",
        variations: ["Nosotros Tequila", "Nosotros Madera"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "nosotrostequila.com",
        priority: 7,
        product_lines: [
            { name: "Nosotros Blanco", modifiers: ["additive free", "sweet agave"] },
            { name: "Nosotros Reposado", modifiers: ["aged 6 months", "oak"] },
            { name: "Nosotros Añejo", modifiers: ["aged 13 months", "oak"] }
        ],
        modifiers: ["additive free", "sustainable", "award winning"],
        base_queries: [
            "Nosotros tequila",
            "Nosotros Madera"
        ]
    },
    {
        name: "Siembra Azul",
        variations: ["Siembra Spirits", "Siembra Azul Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "siembraazul.com",
        priority: 7,
        product_lines: [
            { name: "Siembra Azul Blanco", modifiers: ["tahona crushed"] },
            { name: "Siembra Azul Reposado", modifiers: ["aged 6 months"] },
            { name: "Siembra Azul Añejo", modifiers: ["aged 12 months"] },
            { name: "Siembra Valles", subcategories: ["Blanco", "Reposado", "Añejo"] },
            { name: "Siembra Metl", modifiers: ["ancestral", "limited edition"] }
        ],
        modifiers: ["David Suro", "tahona", "sustainable practices"],
        base_queries: [
            "Siembra Azul",
            "Siembra Valles",
            "Siembra tequila"
        ]
    },
    {
        name: "Tequila Corrido",
        variations: ["Corrido Tequila", "Corrido"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilacorrido.com",
        priority: 6,
        product_lines: [
            { name: "Corrido Blanco", modifiers: ["100% agave"] },
            { name: "Corrido Reposado", modifiers: ["aged 4 months"] },
            { name: "Corrido Añejo", modifiers: ["aged 18 months"] },
            { name: "Corrido Extra Añejo", modifiers: ["aged 36 months"] }
        ],
        modifiers: ["traditional methods", "family owned"],
        base_queries: [
            "Corrido tequila",
            "Tequila Corrido"
        ]
    },
    {
        name: "Tanteo",
        variations: ["Tanteo Tequila", "Tanteo Spirits"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tanteotequila.com",
        priority: 6,
        product_lines: [
            { name: "Tanteo Blanco", modifiers: ["100% agave", "pure"] },
            { name: "Tanteo Jalapeño", modifiers: ["infused", "spicy"] },
            { name: "Tanteo Habanero", modifiers: ["infused", "extra spicy"] },
            { name: "Tanteo Chipotle", modifiers: ["infused", "smoky"] },
            { name: "Tanteo Cocoa", modifiers: ["infused", "chocolate"] }
        ],
        modifiers: ["infused tequilas", "artisanal", "spicy"],
        base_queries: [
            "Tanteo tequila",
            "Tanteo jalapeño",
            "Tanteo infused"
        ]
    },
    {
        name: "21 Seeds",
        variations: ["21 Seeds Tequila", "Twenty One Seeds"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Diageo",
        website: "21seeds.com",
        priority: 6,
        product_lines: [
            { name: "21 Seeds Cucumber Jalapeño", modifiers: ["infused", "blanco base"] },
            { name: "21 Seeds Grapefruit Hibiscus", modifiers: ["infused", "blanco base"] },
            { name: "21 Seeds Valencia Orange", modifiers: ["infused", "reposado base"] }
        ],
        modifiers: ["female founded", "fruit infused", "lower alcohol"],
        base_queries: [
            "21 Seeds tequila",
            "Twenty One Seeds",
            "21 Seeds infused"
        ]
    },
    {
        name: "Tequila Mandala",
        variations: ["Mandala Tequila", "Extra Premium Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "mandalatequila.com",
        priority: 7,
        product_lines: [
            { name: "Mandala Blanco", modifiers: ["hand-blown bottle", "ultra premium"] },
            { name: "Mandala Reposado", modifiers: ["aged 8 months", "french oak"] },
            { name: "Mandala Añejo", modifiers: ["aged 2+ years", "french oak"] },
            { name: "Mandala Extra Añejo", modifiers: ["aged 5 years", "limited edition"] }
        ],
        modifiers: ["hand-blown bottles", "ultra premium", "artisanal"],
        base_queries: [
            "Mandala tequila",
            "Tequila Mandala",
            "Mandala Extra Añejo"
        ]
    },
    {
        name: "Casa Dragones",
        variations: ["Casa Dragones Tequila", "Dragones"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "casadragones.com",
        priority: 9,
        product_lines: [
            { name: "Casa Dragones Joven", modifiers: ["sipping tequila", "small batch"] },
            { name: "Casa Dragones Blanco", modifiers: ["100% blue agave", "crisp"] },
            { name: "Casa Dragones Reposado Mizunara", modifiers: ["japanese oak", "limited"] },
            { name: "Casa Dragones Añejo", modifiers: ["barrel aged", "100% blue agave"] },
            { name: "Casa Dragones Barrel Blend", modifiers: ["añejo nuevo", "extra añejo blend"] }
        ],
        modifiers: ["modern production", "sipping tequila", "luxury brand"],
        base_queries: [
            "Casa Dragones",
            "Casa Dragones joven",
            "Casa Dragones Mizunara"
        ]
    },
    {
        name: "Adictivo",
        variations: ["Tequila Adictivo", "Adictivo Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilaadictivo.com",
        priority: 7,
        product_lines: [
            { name: "Adictivo Plata", modifiers: ["double distilled", "bronze medal"] },
            { name: "Adictivo Reposado", modifiers: ["aged 8 months", "american oak"] },
            { name: "Adictivo Añejo", modifiers: ["aged 2 years", "american oak"] },
            { name: "Adictivo Extra Añejo", modifiers: ["aged 7 years", "french oak"] },
            { name: "Adictivo Black", modifiers: ["extra añejo", "limited edition"] }
        ],
        modifiers: ["Gusano de Oro", "award winning", "double distilled"],
        base_queries: [
            "Adictivo tequila",
            "Tequila Adictivo",
            "Adictivo Extra Añejo"
        ]
    },
    {
        name: "Tequila Esperanto",
        variations: ["Esperanto Tequila", "Esperanto Selección"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilaesperanto.com",
        priority: 6,
        product_lines: [
            { name: "Esperanto Blanco", modifiers: ["organic", "wine bottle"] },
            { name: "Esperanto Reposado", modifiers: ["organic", "aged 6 months"] },
            { name: "Esperanto Añejo", modifiers: ["organic", "aged 15 months"] },
            { name: "Esperanto Selección", modifiers: ["extra añejo", "aged 5 years"] }
        ],
        modifiers: ["organic certified", "wine bottle style", "sustainable"],
        base_queries: [
            "Esperanto tequila",
            "Tequila Esperanto",
            "Esperanto Selección"
        ]
    },
    {
        name: "Villa One",
        variations: ["Villa One Tequila", "One Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "villaone.com",
        priority: 7,
        product_lines: [
            { name: "Villa One Silver", modifiers: ["unaged", "Nick Jonas"] },
            { name: "Villa One Reposado", modifiers: ["aged 6 months", "american oak"] },
            { name: "Villa One Añejo", modifiers: ["aged 18 months", "american oak"] }
        ],
        modifiers: ["Nick Jonas", "John Varvatos", "celebrity owned"],
        base_queries: [
            "Villa One tequila",
            "Villa One Nick Jonas",
            "One tequila"
        ]
    },
    {
        name: "Tequila Komos",
        variations: ["Komos Tequila", "Komos"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilakomos.com",
        priority: 8,
        product_lines: [
            { name: "Komos Reposado Rosa", modifiers: ["wine barrels", "pink tequila"] },
            { name: "Komos Añejo Cristalino", modifiers: ["column distilled", "filtered"] },
            { name: "Komos Extra Añejo", modifiers: ["aged 3 years", "french oak"] }
        ],
        modifiers: ["Mediterranean lifestyle", "wine barrel aged", "ceramic bottles"],
        base_queries: [
            "Komos tequila",
            "Tequila Komos",
            "Komos Rosa"
        ]
    },
    {
        name: "Tears of Llorona",
        variations: ["Tears of Llorona No. 3", "El Lacrimosa"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tearsoflllorona.com",
        priority: 8,
        product_lines: [
            { name: "Tears of Llorona No. 3", modifiers: ["extra añejo", "aged 5 years"] },
            { name: "Tears of Llorona Extra Añejo", modifiers: ["sherry, scotch, cognac casks"] }
        ],
        modifiers: ["German Gonzalez", "ultra premium", "multiple cask aged"],
        base_queries: [
            "Tears of Llorona",
            "Tears of Llorona No 3",
            "El Lacrimosa tequila"
        ]
    },
    {
        name: "Santo",
        variations: ["Santo Tequila", "Santo Spirits"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "santospirits.com",
        priority: 7,
        product_lines: [
            { name: "Santo Blanco", modifiers: ["Sammy Hagar", "Guy Fieri"] },
            { name: "Santo Reposado", modifiers: ["aged 4-6 months"] },
            { name: "Santo Añejo", modifiers: ["aged 12-14 months"] },
            { name: "Santo Mezquila", modifiers: ["tequila-mezcal blend"] }
        ],
        modifiers: ["Sammy Hagar", "Guy Fieri", "celebrity collaboration"],
        base_queries: [
            "Santo tequila",
            "Santo Sammy Hagar",
            "Santo Mezquila"
        ]
    },
    {
        name: "Tequila San Matias",
        variations: ["San Matias", "Casa San Matias"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "casasanmatias.com",
        priority: 7,
        product_lines: [
            { name: "San Matias Legado", subcategories: ["Blanco", "Reposado", "Añejo"] },
            { name: "San Matias Gran Reserva", modifiers: ["extra añejo", "aged 3 years"] },
            { name: "San Matias Tahona", subcategories: ["Blanco", "Reposado", "Añejo"] },
            { name: "Rey Sol", modifiers: ["extra añejo", "aged 6 years", "sun bottle"] }
        ],
        modifiers: ["since 1886", "family owned", "traditional methods"],
        base_queries: [
            "San Matias tequila",
            "Casa San Matias",
            "Rey Sol tequila"
        ]
    },
    {
        name: "Tequila Don Nacho",
        variations: ["Don Nacho", "Don Nacho Premium"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequiladonnacho.com",
        priority: 6,
        product_lines: [
            { name: "Don Nacho Blanco", modifiers: ["100% agave"] },
            { name: "Don Nacho Reposado", modifiers: ["aged 4 months"] },
            { name: "Don Nacho Añejo", modifiers: ["aged 18 months"] },
            { name: "Don Nacho Extra Premium", modifiers: ["extra añejo", "aged 4 years"] }
        ],
        modifiers: ["La Perseverancia distillery", "NOM 1604", "small batch"],
        base_queries: [
            "Don Nacho tequila",
            "Tequila Don Nacho",
            "Don Nacho Extra Premium"
        ]
    },
    {
        name: "Tequila El Mayor",
        variations: ["El Mayor", "El Mayor Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "elmayortequila.com",
        priority: 6,
        product_lines: [
            { name: "El Mayor Blanco", modifiers: ["100% agave"] },
            { name: "El Mayor Reposado", modifiers: ["aged 9 months"] },
            { name: "El Mayor Añejo", modifiers: ["aged 18-24 months"] },
            { name: "El Mayor Cristalino", modifiers: ["filtered añejo"] }
        ],
        modifiers: ["Destiladora González Lux", "award winning"],
        base_queries: [
            "El Mayor tequila",
            "Tequila El Mayor",
            "El Mayor cristalino"
        ]
    },
    {
        name: "Tequila Comisario",
        variations: ["Comisario", "Comisario Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilacomisario.com",
        priority: 6,
        product_lines: [
            { name: "Comisario Blanco", modifiers: ["100% agave", "unaged"] },
            { name: "Comisario Reposado", modifiers: ["aged 6 months"] },
            { name: "Comisario Añejo", modifiers: ["aged 23 months"] }
        ],
        modifiers: ["Feliciano Vivanco y Asociados", "traditional"],
        base_queries: [
            "Comisario tequila",
            "Tequila Comisario"
        ]
    },
    {
        name: "Tromba",
        variations: ["Tromba Tequila", "Tequila Tromba"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "trombatequila.com",
        priority: 6,
        product_lines: [
            { name: "Tromba Blanco", modifiers: ["highland agave"] },
            { name: "Tromba Reposado", modifiers: ["aged 8 months"] },
            { name: "Tromba Añejo", modifiers: ["aged 20 months"] }
        ],
        modifiers: ["Marco Cedano", "Master Distiller", "small batch"],
        base_queries: [
            "Tromba tequila",
            "Tequila Tromba"
        ]
    },
    {
        name: "Los Altos",
        variations: ["Tequila Los Altos", "Los Altos"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilalosalos.com",
        priority: 6,
        product_lines: [
            { name: "Los Altos Blanco", modifiers: ["100% agave"] },
            { name: "Los Altos Reposado", modifiers: ["aged 6-8 months"] },
            { name: "Los Altos Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["highland region", "traditional methods"],
        base_queries: [
            "Los Altos tequila",
            "Tequila Los Altos"
        ]
    },
    {
        name: "Tequila Valle Verde",
        variations: ["Valle Verde", "Valle Verde Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "valleverde.mx",
        priority: 6,
        product_lines: [
            { name: "Valle Verde Blanco", modifiers: ["organic", "kosher"] },
            { name: "Valle Verde Reposado", modifiers: ["organic", "aged 6 months"] },
            { name: "Valle Verde Añejo", modifiers: ["organic", "aged 18 months"] }
        ],
        modifiers: ["organic certified", "kosher certified", "sustainable"],
        base_queries: [
            "Valle Verde tequila",
            "Valle Verde organic"
        ]
    },
    {
        name: "Señor Rio",
        variations: ["Senor Rio Tequila", "Señor Rio"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "senorrio.com",
        priority: 6,
        product_lines: [
            { name: "Señor Rio Blanco", modifiers: ["citrus notes"] },
            { name: "Señor Rio Reposado", modifiers: ["aged 6 months"] },
            { name: "Señor Rio Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["Vivanco family", "traditional production"],
        base_queries: [
            "Señor Rio tequila",
            "Senor Rio tequila"
        ]
    },
    {
        name: "Asombroso",
        variations: ["Tequila Asombroso", "AsomBroso"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "asombrosotequila.com",
        priority: 7,
        product_lines: [
            { name: "AsomBroso Silver", modifiers: ["triple distilled"] },
            { name: "AsomBroso Reposado", modifiers: ["aged 3 months"] },
            { name: "AsomBroso Añejo", modifiers: ["aged 12 months"] },
            { name: "AsomBroso Extra Añejo", modifiers: ["aged 5 years"] },
            { name: "AsomBroso Vintage", modifiers: ["aged 11 years", "bordeaux casks"] }
        ],
        modifiers: ["vintage collection", "wine cask finish", "ultra premium"],
        base_queries: [
            "Asombroso tequila",
            "AsomBroso tequila",
            "Asombroso vintage"
        ]
    },
    {
        name: "Ambhar",
        variations: ["Ambhar Tequila", "Tequila Ambhar"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "ambhartequila.com",
        priority: 6,
        product_lines: [
            { name: "Ambhar Blanco", modifiers: ["hand-blown glass bottle"] },
            { name: "Ambhar Reposado", modifiers: ["aged 4 months"] },
            { name: "Ambhar Añejo", modifiers: ["aged 2 years"] }
        ],
        modifiers: ["hand-blown bottles", "small batch", "premium"],
        base_queries: [
            "Ambhar tequila",
            "Tequila Ambhar"
        ]
    },
    {
        name: "1519 Tequila",
        variations: ["Tequila 1519", "1519 Organic"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequila1519.com",
        priority: 6,
        product_lines: [
            { name: "1519 Blanco", modifiers: ["organic", "pure"] },
            { name: "1519 Reposado", modifiers: ["organic", "aged 6+ months"] },
            { name: "1519 Añejo", modifiers: ["organic", "aged 18+ months"] }
        ],
        modifiers: ["organic certified", "historic name", "traditional"],
        base_queries: [
            "1519 tequila",
            "Tequila 1519",
            "1519 organic"
        ]
    },
    {
        name: "Campo Azul",
        variations: ["Campo Azul Tequila", "Tequila Campo Azul"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "campoazultequila.com",
        priority: 7,
        product_lines: [
            { name: "Campo Azul 1940", modifiers: ["blanco", "traditional"] },
            { name: "Campo Azul Clasico", modifiers: ["reposado", "aged 4 months"] },
            { name: "Campo Azul Añejo", modifiers: ["aged 14 months"] },
            { name: "Campo Azul Especial", modifiers: ["extra añejo", "aged 3 years"] },
            { name: "Campo Azul Gran Especial", modifiers: ["extra añejo", "aged 5 years"] }
        ],
        modifiers: ["3rd generation", "family distillery", "Jesus María"],
        base_queries: [
            "Campo Azul tequila",
            "Tequila Campo Azul",
            "Campo Azul Gran Especial"
        ]
    },
    {
        name: "Don Fulano",
        variations: ["Tequila Don Fulano", "Don Fulano"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "donfulano.com",
        priority: 8,
        product_lines: [
            { name: "Don Fulano Blanco", modifiers: ["estate grown", "mature agave"] },
            { name: "Don Fulano Reposado", modifiers: ["aged 8-10 months"] },
            { name: "Don Fulano Añejo", modifiers: ["aged 30 months"] },
            { name: "Don Fulano Imperial", modifiers: ["extra añejo", "aged 5 years"] },
            { name: "Don Fulano Fuerte", modifiers: ["high proof", "50% ABV"] }
        ],
        modifiers: ["La Tequileña", "5th generation", "mature agave only"],
        base_queries: [
            "Don Fulano tequila",
            "Tequila Don Fulano",
            "Don Fulano Imperial"
        ]
    },
    {
        name: "Tequila Cabeza",
        variations: ["Cabeza Tequila", "Cabeza"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilacabeza.com",
        priority: 6,
        product_lines: [
            { name: "Cabeza Blanco", modifiers: ["pure agave"] },
            { name: "Cabeza Reposado", modifiers: ["aged 2 months"] },
            { name: "Cabeza Añejo", modifiers: ["aged 14 months"] }
        ],
        modifiers: ["Vivanco distillery", "86 proof"],
        base_queries: [
            "Cabeza tequila",
            "Tequila Cabeza"
        ]
    },
    {
        name: "Sangre Azteca",
        variations: ["Tequila Sangre Azteca", "Sangre Azteca"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "sangreazeca.com",
        priority: 6,
        product_lines: [
            { name: "Sangre Azteca Blanco", modifiers: ["100% agave"] },
            { name: "Sangre Azteca Reposado", modifiers: ["aged 6 months"] },
            { name: "Sangre Azteca Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["aztec heritage", "traditional methods"],
        base_queries: [
            "Sangre Azteca tequila",
            "Tequila Sangre Azteca"
        ]
    },
    {
        name: "Cazcanes",
        variations: ["Tequila Cazcanes", "Cazcanes"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilacazcanes.com",
        priority: 7,
        product_lines: [
            { name: "Cazcanes No. 9", modifiers: ["blanco", "still strength"] },
            { name: "Cazcanes No. 10", modifiers: ["blanco", "traditional"] },
            { name: "Cazcanes No. 7", modifiers: ["reposado", "aged 6-8 months"] },
            { name: "Cazcanes No. 8", modifiers: ["reposado", "single barrel"] },
            { name: "Cazcanes Extra Añejo", modifiers: ["aged 3 years"] }
        ],
        modifiers: ["NOM 1604", "high proof options", "traditional production"],
        base_queries: [
            "Cazcanes tequila",
            "Tequila Cazcanes",
            "Cazcanes No 9"
        ]
    },
    {
        name: "Chamucos",
        variations: ["Tequila Chamucos", "Chamucos"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilachamucos.com",
        priority: 7,
        product_lines: [
            { name: "Chamucos Blanco", modifiers: ["100% agave", "citrus forward"] },
            { name: "Chamucos Reposado", modifiers: ["aged 8 months"] },
            { name: "Chamucos Añejo", modifiers: ["aged 15 months"] },
            { name: "Chamucos Extra Añejo", modifiers: ["aged 3 years"] },
            { name: "Diablo Blanco", modifiers: ["special edition", "high proof"] }
        ],
        modifiers: ["NOM 1433", "Cesar Hernández", "artisanal"],
        base_queries: [
            "Chamucos tequila",
            "Tequila Chamucos",
            "Chamucos Diablo"
        ]
    },
    {
        name: "Don Abraham",
        variations: ["Tequila Don Abraham", "Don Abraham Organic"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "donabraham.com",
        priority: 6,
        product_lines: [
            { name: "Don Abraham Blanco", modifiers: ["organic", "unaged"] },
            { name: "Don Abraham Reposado", modifiers: ["organic", "aged 6 months"] },
            { name: "Don Abraham Añejo", modifiers: ["organic", "aged 15 months"] },
            { name: "Don Abraham Extra Añejo", modifiers: ["organic", "aged 3 years"] }
        ],
        modifiers: ["USDA organic", "single estate", "sustainable farming"],
        base_queries: [
            "Don Abraham tequila",
            "Don Abraham organic",
            "Tequila Don Abraham"
        ]
    },
    {
        name: "Don Felix",
        variations: ["Tequila Don Felix", "Don Felix"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequiladonfelix.com",
        priority: 6,
        product_lines: [
            { name: "Don Felix Blanco", modifiers: ["100% agave"] },
            { name: "Don Felix Reposado", modifiers: ["aged 2-4 months"] },
            { name: "Don Felix Añejo", modifiers: ["aged 12-18 months"] }
        ],
        modifiers: ["La Cofradia", "traditional methods"],
        base_queries: [
            "Don Felix tequila",
            "Tequila Don Felix"
        ]
    },
    {
        name: "Don Pilar",
        variations: ["Tequila Don Pilar", "Don Pilar"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "donpilar.com",
        priority: 6,
        product_lines: [
            { name: "Don Pilar Blanco", modifiers: ["estate grown"] },
            { name: "Don Pilar Reposado", modifiers: ["aged 8 months"] },
            { name: "Don Pilar Añejo", modifiers: ["aged 18 months"] },
            { name: "Don Pilar Extra Añejo", modifiers: ["aged 36 months"] }
        ],
        modifiers: ["single estate", "highland agave", "NOM 1443"],
        base_queries: [
            "Don Pilar tequila",
            "Tequila Don Pilar"
        ]
    },
    {
        name: "El Charro",
        variations: ["Tequila El Charro", "El Charro"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "elcharrotequila.com",
        priority: 6,
        product_lines: [
            { name: "El Charro Silver", modifiers: ["100% agave"] },
            { name: "El Charro Reposado", modifiers: ["aged 2-11 months"] },
            { name: "El Charro Añejo", modifiers: ["aged 1-3 years"] }
        ],
        modifiers: ["NOM 1474", "Casa Cuervo"],
        base_queries: [
            "El Charro tequila",
            "Tequila El Charro"
        ]
    },
    {
        name: "El Cristiano",
        variations: ["Tequila El Cristiano", "El Cristiano"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "elcristianotequila.com",
        priority: 6,
        product_lines: [
            { name: "El Cristiano Silver", modifiers: ["blessed tequila"] },
            { name: "El Cristiano Reposado", modifiers: ["aged 6 months"] },
            { name: "El Cristiano Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["blessed by priest", "religious themed", "unique concept"],
        base_queries: [
            "El Cristiano tequila",
            "blessed tequila"
        ]
    },
    {
        name: "El Padrino",
        variations: ["Tequila El Padrino", "El Padrino"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "elpadrinotequila.com",
        priority: 6,
        product_lines: [
            { name: "El Padrino Blanco", modifiers: ["100% de agave"] },
            { name: "El Padrino Reposado", modifiers: ["aged 6 months"] },
            { name: "El Padrino Añejo", modifiers: ["aged 14 months"] },
            { name: "El Padrino Extra Añejo", modifiers: ["aged 40 months"] }
        ],
        modifiers: ["the godfather", "barrel select", "small batch"],
        base_queries: [
            "El Padrino tequila",
            "Tequila El Padrino"
        ]
    },
    {
        name: "Fuenteseca",
        variations: ["Tequila Fuenteseca", "Fuenteseca Cosecha"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "fuentesecatequila.com",
        priority: 8,
        product_lines: [
            { name: "Fuenteseca Blanco", modifiers: ["estate distilled"] },
            { name: "Fuenteseca Cosecha", modifiers: ["vintage dated", "harvest specific"] },
            { name: "Fuenteseca Reserva", modifiers: ["extra añejo", "7-21 years"] },
            { name: "Fuenteseca Commemorativo", modifiers: ["18 year", "limited edition"] }
        ],
        modifiers: ["Enrique Fonseca", "vintage dated", "ultra aged"],
        base_queries: [
            "Fuenteseca tequila",
            "Fuenteseca Cosecha",
            "Fuenteseca 18 year"
        ]
    },
    {
        name: "Herencia Mexicana",
        variations: ["Tequila Herencia Mexicana", "Herencia"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "herenciamexicana.com",
        priority: 6,
        product_lines: [
            { name: "Herencia Mexicana Blanco", modifiers: ["100% agave"] },
            { name: "Herencia Mexicana Reposado", modifiers: ["aged 9 months"] },
            { name: "Herencia Mexicana Añejo", modifiers: ["aged 24 months"] }
        ],
        modifiers: ["Mexican heritage", "traditional production"],
        base_queries: [
            "Herencia Mexicana tequila",
            "Tequila Herencia Mexicana"
        ]
    },
    {
        name: "Hussong's",
        variations: ["Hussong's Tequila", "Hussongs"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "hussongs.com",
        priority: 7,
        product_lines: [
            { name: "Hussong's Platinum", modifiers: ["100% agave", "smooth"] },
            { name: "Hussong's Reposado", modifiers: ["aged 5 months", "american oak"] },
            { name: "Hussong's Añejo", modifiers: ["aged 12 months", "bourbon barrels"] }
        ],
        modifiers: ["Ensenada cantina", "since 1892", "Baja California heritage"],
        base_queries: [
            "Hussong's tequila",
            "Hussongs tequila",
            "Hussong's Platinum"
        ]
    },
    {
        name: "IXÁ",
        variations: ["IXA Tequila", "Tequila IXA"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "ixatequila.com",
        priority: 7,
        product_lines: [
            { name: "IXÁ Silver", modifiers: ["organic", "unaged"] },
            { name: "IXÁ Reposado", modifiers: ["organic", "aged 2 months"] },
            { name: "IXÁ Añejo", modifiers: ["organic", "aged 18 months"] },
            { name: "IXÁ Extra Añejo", modifiers: ["organic", "aged 5 years"] }
        ],
        modifiers: ["USDA organic", "sustainable", "woman owned"],
        base_queries: [
            "IXA tequila",
            "IXÁ tequila",
            "IXA organic"
        ]
    },
    {
        name: "Karma Tequila",
        variations: ["Karma", "Tequila Karma"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "karmatequila.com",
        priority: 6,
        product_lines: [
            { name: "Karma Silver", modifiers: ["100% agave"] },
            { name: "Karma Reposado", modifiers: ["aged 8-10 months"] },
            { name: "Karma Añejo", modifiers: ["aged 2-3 years"] }
        ],
        modifiers: ["artisanal production", "small batch"],
        base_queries: [
            "Karma tequila",
            "Tequila Karma"
        ]
    },
    {
        name: "La Gritona",
        variations: ["Tequila La Gritona", "La Gritona"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "lagritona.com",
        priority: 7,
        product_lines: [
            { name: "La Gritona Reposado", modifiers: ["woman owned", "aged 8 months"] }
        ],
        modifiers: ["all-female operation", "Melly Barajas", "single expression"],
        base_queries: [
            "La Gritona tequila",
            "Tequila La Gritona",
            "La Gritona reposado"
        ]
    },
    {
        name: "Los Arango",
        variations: ["Tequila Los Arango", "Los Arango"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "losarango.com",
        priority: 6,
        product_lines: [
            { name: "Los Arango Blanco", modifiers: ["100% agave"] },
            { name: "Los Arango Reposado", modifiers: ["aged 6 months"] },
            { name: "Los Arango Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["Destiladora del Valle", "traditional methods"],
        base_queries: [
            "Los Arango tequila",
            "Tequila Los Arango"
        ]
    },
    {
        name: "Los Azulejos",
        variations: ["Tequila Los Azulejos", "Los Azulejos"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "losazulejostequila.com",
        priority: 7,
        product_lines: [
            { name: "Los Azulejos Blanco", modifiers: ["talavera bottle"] },
            { name: "Los Azulejos Reposado", modifiers: ["aged 6 months", "talavera bottle"] },
            { name: "Los Azulejos Añejo", modifiers: ["aged 18 months", "talavera bottle"] },
            { name: "Los Azulejos Master Distiller", modifiers: ["extra añejo", "aged 5 years"] }
        ],
        modifiers: ["talavera ceramic bottles", "artisanal", "collectible"],
        base_queries: [
            "Los Azulejos tequila",
            "Tequila Los Azulejos",
            "Los Azulejos talavera"
        ]
    },
    {
        name: "Maracame",
        variations: ["Tequila Maracame", "Maracame"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "maracame.com",
        priority: 6,
        product_lines: [
            { name: "Maracame Plata", modifiers: ["100% agave"] },
            { name: "Maracame Reposado", modifiers: ["aged 8 months"] },
            { name: "Maracame Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["Casa Cueramaro", "traditional production"],
        base_queries: [
            "Maracame tequila",
            "Tequila Maracame"
        ]
    },
    {
        name: "Mi Campo",
        variations: ["Mi Campo Tequila", "Tequila Mi Campo"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "E. & J. Gallo",
        website: "micampotequila.com",
        priority: 7,
        product_lines: [
            { name: "Mi Campo Blanco", modifiers: ["100% agave"] },
            { name: "Mi Campo Reposado", modifiers: ["aged 3 months", "wine barrels"] },
            { name: "Mi Campo Añejo", modifiers: ["aged 14 months", "wine barrels"] }
        ],
        modifiers: ["wine barrel aged", "Gallo family", "unique finish"],
        base_queries: [
            "Mi Campo tequila",
            "Tequila Mi Campo",
            "Mi Campo wine barrel"
        ]
    },
    {
        name: "NueveUno",
        variations: ["NueveUno Tequila", "901 Tequila", "Nueve Uno"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "901tequila.com",
        priority: 6,
        product_lines: [
            { name: "NueveUno Blanco", modifiers: ["kosher", "organic"] },
            { name: "NueveUno Reposado", modifiers: ["kosher", "organic", "aged 6 months"] },
            { name: "NueveUno Añejo", modifiers: ["kosher", "organic", "aged 18 months"] }
        ],
        modifiers: ["kosher certified", "organic certified", "small batch"],
        base_queries: [
            "NueveUno tequila",
            "901 tequila",
            "Nueve Uno tequila"
        ]
    },
    {
        name: "Padre Azul",
        variations: ["Tequila Padre Azul", "Padre Azul"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "padreazul.com",
        priority: 7,
        product_lines: [
            { name: "Padre Azul Silver", modifiers: ["skull bottle", "100% agave"] },
            { name: "Padre Azul Reposado", modifiers: ["aged 8 months", "skull bottle"] },
            { name: "Padre Azul Añejo", modifiers: ["aged 18 months", "skull bottle"] },
            { name: "Padre Azul XA", modifiers: ["extra añejo", "aged 3 years"] }
        ],
        modifiers: ["leather skull bottles", "premium packaging", "Austrian owned"],
        base_queries: [
            "Padre Azul tequila",
            "Tequila Padre Azul",
            "Padre Azul skull"
        ]
    },
    {
        name: "Paqui",
        variations: ["Paqui Tequila", "Tequila Paqui"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "paquitequila.com",
        priority: 6,
        product_lines: [
            { name: "Paqui Silvera", modifiers: ["100% agave", "crisp"] },
            { name: "Paqui Reposado", modifiers: ["aged 6 months"] },
            { name: "Paqui Añejo", modifiers: ["aged 15 months"] }
        ],
        modifiers: ["boutique brand", "small production"],
        base_queries: [
            "Paqui tequila",
            "Tequila Paqui"
        ]
    },
    {
        name: "Piedra Azul",
        variations: ["Tequila Piedra Azul", "Piedra Azul"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "piedraazultequila.com",
        priority: 6,
        product_lines: [
            { name: "Piedra Azul Blanco", modifiers: ["100% agave"] },
            { name: "Piedra Azul Reposado", modifiers: ["aged 4-6 months"] },
            { name: "Piedra Azul Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["blue stone", "traditional methods"],
        base_queries: [
            "Piedra Azul tequila",
            "Tequila Piedra Azul"
        ]
    },
    {
        name: "Proximus",
        variations: ["Proximus Tequila", "Tequila Proximus"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "proximustequila.com",
        priority: 6,
        product_lines: [
            { name: "Proximus Silver", modifiers: ["hard rock cafe", "unaged"] },
            { name: "Proximus Reposado", modifiers: ["aged", "oak barrels"] },
            { name: "Proximus Añejo", modifiers: ["aged 14 months"] }
        ],
        modifiers: ["Hard Rock partnership", "music themed"],
        base_queries: [
            "Proximus tequila",
            "Proximus Hard Rock"
        ]
    },
    {
        name: "Qui",
        variations: ["Qui Tequila", "Tequila Qui"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "quitequila.com",
        priority: 7,
        product_lines: [
            { name: "Qui Platinum", modifiers: ["extra añejo", "rare blend"] },
            { name: "Qui Rare", modifiers: ["extra añejo", "aged 3.5 years"] }
        ],
        modifiers: ["luxury brand", "rare blends", "unique bottles"],
        base_queries: [
            "Qui tequila",
            "Qui Platinum",
            "Qui Rare"
        ]
    },
    {
        name: "Roca Patrón",
        variations: ["Roca Patron", "Patrón Roca"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        parent_company: "Bacardi Limited",
        website: "patrontequila.com",
        priority: 8,
        product_lines: [
            { name: "Roca Patrón Silver", modifiers: ["tahona crushed", "higher proof"] },
            { name: "Roca Patrón Reposado", modifiers: ["aged 5 months", "tahona"] },
            { name: "Roca Patrón Añejo", modifiers: ["aged 14 months", "tahona"] }
        ],
        modifiers: ["tahona process", "higher proof", "Patrón premium line"],
        base_queries: [
            "Roca Patron",
            "Patron Roca",
            "Roca Patrón tahona"
        ]
    },
    {
        name: "Revolucion",
        variations: ["Tequila Revolucion", "Revolucion"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "revoluciontequila.com",
        priority: 6,
        product_lines: [
            { name: "Revolucion Silver", modifiers: ["100% agave"] },
            { name: "Revolucion Reposado", modifiers: ["aged 6 months"] },
            { name: "Revolucion Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["revolutionary spirit", "traditional production"],
        base_queries: [
            "Revolucion tequila",
            "Tequila Revolucion"
        ]
    },
    {
        name: "Santera",
        variations: ["Santera Tequila", "Tequila Santera"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "santeratequila.com",
        priority: 6,
        product_lines: [
            { name: "Santera Blanco", modifiers: ["pure agave"] },
            { name: "Santera Reposado", modifiers: ["aged 2 months"] },
            { name: "Santera Añejo", modifiers: ["aged 16 months"] }
        ],
        modifiers: ["day of the dead theme", "spiritual connection"],
        base_queries: [
            "Santera tequila",
            "Tequila Santera"
        ]
    },
    {
        name: "Sol de Mexico",
        variations: ["Tequila Sol de Mexico", "Sol de Mexico"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "soldemexico.com",
        priority: 6,
        product_lines: [
            { name: "Sol de Mexico Blanco", modifiers: ["100% agave"] },
            { name: "Sol de Mexico Reposado", modifiers: ["aged 6-8 months"] },
            { name: "Sol de Mexico Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["sun of Mexico", "traditional methods"],
        base_queries: [
            "Sol de Mexico tequila",
            "Tequila Sol de Mexico"
        ]
    },
    {
        name: "Storywood",
        variations: ["Storywood Tequila", "Tequila Storywood"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "storywoodtequila.com",
        priority: 7,
        product_lines: [
            { name: "Storywood Blanco", modifiers: ["speyside cask", "unique finish"] },
            { name: "Storywood Reposado", modifiers: ["aged 6 months", "speyside cask"] },
            { name: "Storywood Añejo", modifiers: ["aged 14 months", "speyside cask"] }
        ],
        modifiers: ["Speyside whisky casks", "Scottish influence", "unique aging"],
        base_queries: [
            "Storywood tequila",
            "Storywood Speyside",
            "Tequila Storywood"
        ]
    },
    {
        name: "Tequila 30-30",
        variations: ["30-30 Tequila", "Treinta-Treinta"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequila3030.com",
        priority: 6,
        product_lines: [
            { name: "30-30 Blanco", modifiers: ["100% agave"] },
            { name: "30-30 Reposado", modifiers: ["aged 3 months"] },
            { name: "30-30 Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["rifle themed", "Mexican revolution"],
        base_queries: [
            "30-30 tequila",
            "Tequila 30-30",
            "Treinta-Treinta"
        ]
    },
    {
        name: "Tequila 512",
        variations: ["512 Tequila", "Tequila Five Twelve"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "512tequila.com",
        priority: 6,
        product_lines: [
            { name: "512 Blanco", modifiers: ["triple distilled"] },
            { name: "512 Reposado", modifiers: ["aged 6 months"] },
            { name: "512 Añejo", modifiers: ["aged 14 months"] }
        ],
        modifiers: ["Austin area code", "Texas connection"],
        base_queries: [
            "512 tequila",
            "Tequila 512",
            "Five Twelve tequila"
        ]
    },
    {
        name: "Tequila Alacrán",
        variations: ["Alacran Tequila", "Alacrán"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilaalacran.com",
        priority: 6,
        product_lines: [
            { name: "Alacrán Blanco", modifiers: ["100% agave", "scorpion bottle"] },
            { name: "Alacrán Reposado", modifiers: ["aged 1 year"] },
            { name: "Alacrán Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["scorpion theme", "unique bottles"],
        base_queries: [
            "Alacran tequila",
            "Tequila Alacrán",
            "scorpion tequila"
        ]
    },
    {
        name: "Tequila Baluarte",
        variations: ["Baluarte", "Baluarte Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilabaluarte.com",
        priority: 6,
        product_lines: [
            { name: "Baluarte Blanco", modifiers: ["100% agave"] },
            { name: "Baluarte Reposado", modifiers: ["aged 8 months"] },
            { name: "Baluarte Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["fortress theme", "traditional production"],
        base_queries: [
            "Baluarte tequila",
            "Tequila Baluarte"
        ]
    },
    {
        name: "Tequila Caramba",
        variations: ["Caramba Tequila", "Caramba"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilacaramba.com",
        priority: 6,
        product_lines: [
            { name: "Caramba Silver", modifiers: ["unaged"] },
            { name: "Caramba Gold", modifiers: ["joven"] },
            { name: "Caramba Reposado", modifiers: ["aged oak"] },
            { name: "Caramba Azul", modifiers: ["100% blue agave"] }
        ],
        modifiers: ["vibrant branding", "party tequila"],
        base_queries: [
            "Caramba tequila",
            "Tequila Caramba"
        ]
    },
    {
        name: "Tequila Cava de Oro",
        variations: ["Cava de Oro", "Cava de Oro Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "cavadeoro.com",
        priority: 6,
        product_lines: [
            { name: "Cava de Oro Blanco", modifiers: ["100% agave"] },
            { name: "Cava de Oro Reposado", modifiers: ["aged 6 months"] },
            { name: "Cava de Oro Añejo", modifiers: ["aged 24 months"] },
            { name: "Cava de Oro Extra Añejo", modifiers: ["aged 5 years"] }
        ],
        modifiers: ["golden cave", "premium line"],
        base_queries: [
            "Cava de Oro tequila",
            "Tequila Cava de Oro"
        ]
    },
    {
        name: "Tequila Celosa",
        variations: ["Celosa Tequila", "Celosa"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "celosatequila.com",
        priority: 7,
        product_lines: [
            { name: "Celosa Rose", modifiers: ["rosa tequila", "wine casks"] },
            { name: "Celosa Blanco", modifiers: ["organic", "unaged"] },
            { name: "Celosa Reposado", modifiers: ["organic", "aged 6 months"] },
            { name: "Celosa Añejo", modifiers: ["organic", "aged 24 months"] }
        ],
        modifiers: ["organic certified", "pink tequila", "wine influence"],
        base_queries: [
            "Celosa tequila",
            "Celosa Rose",
            "pink tequila Celosa"
        ]
    },
    {
        name: "Tequila Cimarron",
        variations: ["Cimarron Tequila", "Cimarrón"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "cimarrontequila.com",
        priority: 6,
        product_lines: [
            { name: "Cimarron Blanco", modifiers: ["estate grown"] },
            { name: "Cimarron Reposado", modifiers: ["aged 4 months"] },
            { name: "Cimarron Añejo", modifiers: ["aged 12 months"] }
        ],
        modifiers: ["Atotonilco", "estate distilled", "value premium"],
        base_queries: [
            "Cimarron tequila",
            "Tequila Cimarron",
            "Cimarrón"
        ]
    },
    {
        name: "Tequila Don Ramón",
        variations: ["Don Ramon", "Don Ramón Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "donramontequila.com",
        priority: 6,
        product_lines: [
            { name: "Don Ramón Plata", modifiers: ["100% agave"] },
            { name: "Don Ramón Reposado", modifiers: ["aged 3 months"] },
            { name: "Don Ramón Añejo", modifiers: ["aged 12 months"] },
            { name: "Don Ramón Punta Diamante", modifiers: ["extra añejo", "limited"] }
        ],
        modifiers: ["Casa Don Ramon", "traditional methods"],
        base_queries: [
            "Don Ramon tequila",
            "Don Ramón tequila",
            "Don Ramon Punta Diamante"
        ]
    },
    {
        name: "Tequila El Conde Azul",
        variations: ["El Conde Azul", "Conde Azul"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "elcondeazul.com",
        priority: 6,
        product_lines: [
            { name: "El Conde Azul Blanco", modifiers: ["100% agave"] },
            { name: "El Conde Azul Reposado", modifiers: ["aged 8 months"] },
            { name: "El Conde Azul Añejo", modifiers: ["aged 15 months"] },
            { name: "El Conde Azul Extra Añejo", modifiers: ["aged 38 months"] }
        ],
        modifiers: ["blue count", "artisanal production"],
        base_queries: [
            "El Conde Azul tequila",
            "Conde Azul tequila"
        ]
    },
    {
        name: "Tequila El Reformador",
        variations: ["El Reformador", "Reformador"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "elreformador.com",
        priority: 6,
        product_lines: [
            { name: "El Reformador Blanco", modifiers: ["100% agave"] },
            { name: "El Reformador Reposado", modifiers: ["aged 2 months"] },
            { name: "El Reformador Añejo", modifiers: ["aged 12 months"] }
        ],
        modifiers: ["the reformer", "traditional production"],
        base_queries: [
            "El Reformador tequila",
            "Reformador tequila"
        ]
    },
    {
        name: "Tequila Embajador",
        variations: ["Embajador", "Embajador Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilaembajador.com",
        priority: 6,
        product_lines: [
            { name: "Embajador Blanco", modifiers: ["100% agave", "premium"] },
            { name: "Embajador Reposado", modifiers: ["aged 11 months"] },
            { name: "Embajador Añejo", modifiers: ["aged 24 months"] }
        ],
        modifiers: ["ambassador theme", "diplomatic gift"],
        base_queries: [
            "Embajador tequila",
            "Tequila Embajador"
        ]
    },
    {
        name: "Tequila Espinoza",
        variations: ["Espinoza", "Espinoza Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilaespinoza.com",
        priority: 6,
        product_lines: [
            { name: "Espinoza Blanco", modifiers: ["organic", "kosher"] },
            { name: "Espinoza Reposado", modifiers: ["organic", "aged 6 months"] },
            { name: "Espinoza Añejo", modifiers: ["organic", "aged 14 months"] }
        ],
        modifiers: ["organic certified", "kosher certified"],
        base_queries: [
            "Espinoza tequila",
            "Tequila Espinoza"
        ]
    },
    {
        name: "Tequila Galindo",
        variations: ["Galindo", "Galindo Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilagalindo.com",
        priority: 6,
        product_lines: [
            { name: "Galindo Blanco", modifiers: ["100% agave"] },
            { name: "Galindo Reposado", modifiers: ["aged 8 months"] },
            { name: "Galindo Añejo", modifiers: ["aged 14 months"] }
        ],
        modifiers: ["family heritage", "small batch"],
        base_queries: [
            "Galindo tequila",
            "Tequila Galindo"
        ]
    },
    {
        name: "Tequila Honor",
        variations: ["Honor Tequila", "Honor del Castillo"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "honortequila.com",
        priority: 6,
        product_lines: [
            { name: "Honor Silver", modifiers: ["estate grown"] },
            { name: "Honor Reposado", modifiers: ["aged 6 months"] },
            { name: "Honor Reserve", modifiers: ["extra añejo", "aged 3 years"] }
        ],
        modifiers: ["honor tradition", "estate bottled"],
        base_queries: [
            "Honor tequila",
            "Honor del Castillo"
        ]
    },
    {
        name: "Tequila Huizache",
        variations: ["Huizache", "Huizache Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilahuizache.com",
        priority: 6,
        product_lines: [
            { name: "Huizache Joven", modifiers: ["100% agave", "unaged"] },
            { name: "Huizache Reposado", modifiers: ["aged 6 months"] },
            { name: "Huizache Añejo", modifiers: ["aged 15 months"] }
        ],
        modifiers: ["sweet acacia tree", "traditional methods"],
        base_queries: [
            "Huizache tequila",
            "Tequila Huizache"
        ]
    },
    {
        name: "Tequila Infante",
        variations: ["Infante", "Don Infante"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilainfante.com",
        priority: 6,
        product_lines: [
            { name: "Infante Blanco", modifiers: ["100% agave"] },
            { name: "Infante Reposado", modifiers: ["aged 6 months"] },
            { name: "Infante Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["traditional production", "family owned"],
        base_queries: [
            "Infante tequila",
            "Tequila Infante"
        ]
    },
    {
        name: "Tequila La Cofradía",
        variations: ["La Cofradia", "La Cofradía"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "lacofradia.com",
        priority: 7,
        product_lines: [
            { name: "La Cofradía Blanco", modifiers: ["100% agave"] },
            { name: "La Cofradía Reposado", modifiers: ["aged 6 months"] },
            { name: "La Cofradía Añejo", modifiers: ["aged 12 months"] },
            { name: "La Cofradía Elixir", modifiers: ["aged 18 months", "special blend"] }
        ],
        modifiers: ["brotherhood theme", "ceramic bottles", "artisanal"],
        base_queries: [
            "La Cofradia tequila",
            "La Cofradía tequila"
        ]
    },
    {
        name: "Tequila Los Tres Toños",
        variations: ["Los Tres Toños", "Los Tres Tonos"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "lostrestonos.com",
        priority: 6,
        product_lines: [
            { name: "Los Tres Toños Blanco", modifiers: ["100% agave"] },
            { name: "Los Tres Toños Reposado", modifiers: ["aged 2 months"] },
            { name: "Los Tres Toños Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["three Antonios", "family distillery"],
        base_queries: [
            "Los Tres Toños tequila",
            "Los Tres Tonos"
        ]
    },
    {
        name: "Tequila Revolucionario",
        variations: ["Revolucionario", "Revolucionario 100"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "revolucionario100.com",
        priority: 6,
        product_lines: [
            { name: "Revolucionario 100 Silver", modifiers: ["100 proof"] },
            { name: "Revolucionario 100 Reposado", modifiers: ["100 proof", "aged 6 months"] },
            { name: "Revolucionario 100 Añejo", modifiers: ["100 proof", "aged 18 months"] }
        ],
        modifiers: ["high proof", "revolutionary spirit"],
        base_queries: [
            "Revolucionario tequila",
            "Revolucionario 100"
        ]
    },
    {
        name: "Tequila Siempre",
        variations: ["Siempre Tequila", "Siempre"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "siempretequila.com",
        priority: 6,
        product_lines: [
            { name: "Siempre Plata", modifiers: ["100% agave"] },
            { name: "Siempre Reposado", modifiers: ["aged 6 months"] },
            { name: "Siempre Añejo", modifiers: ["aged 18 months"] },
            { name: "Siempre Supremo", modifiers: ["extra añejo", "aged 4 years"] }
        ],
        modifiers: ["always tequila", "consistent quality"],
        base_queries: [
            "Siempre tequila",
            "Tequila Siempre"
        ]
    },
    {
        name: "Tequila Tierra Noble",
        variations: ["Tierra Noble", "Noble Earth"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tierranoble.com",
        priority: 6,
        product_lines: [
            { name: "Tierra Noble Blanco", modifiers: ["100% agave"] },
            { name: "Tierra Noble Reposado", modifiers: ["aged 4 months"] },
            { name: "Tierra Noble Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["noble earth", "sustainable practices"],
        base_queries: [
            "Tierra Noble tequila",
            "Tequila Tierra Noble"
        ]
    },
    {
        name: "Tequila Xicote",
        variations: ["Xicote", "Xicote Tequila"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "tequilaxicote.com",
        priority: 6,
        product_lines: [
            { name: "Xicote Blanco", modifiers: ["100% agave"] },
            { name: "Xicote Reposado", modifiers: ["aged 4 months"] },
            { name: "Xicote Añejo", modifiers: ["aged 14 months"] }
        ],
        modifiers: ["aztec warrior", "traditional production"],
        base_queries: [
            "Xicote tequila",
            "Tequila Xicote"
        ]
    },
    {
        name: "ZuVaa",
        variations: ["ZuVaa Tequila", "Zu Vaa"],
        region: "Jalisco",
        country: "Mexico",
        type: ["tequila"],
        website: "zuvaa.com",
        priority: 6,
        product_lines: [
            { name: "ZuVaa Silver", modifiers: ["100% agave"] },
            { name: "ZuVaa Reposado", modifiers: ["aged 9 months"] },
            { name: "ZuVaa Añejo", modifiers: ["aged 24 months"] }
        ],
        modifiers: ["premium brand", "modern approach"],
        base_queries: [
            "ZuVaa tequila",
            "Zu Vaa tequila"
        ]
    }
];
// ========== MEZCAL PRODUCERS ==========
export const MEZCAL_PRODUCERS = [
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
    },
    {
        name: "Montelobos",
        variations: ["Montelobos Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "montelobos.com",
        priority: 7,
        product_lines: [
            { name: "Montelobos Espadín", modifiers: ["joven", "100% espadín"] },
            { name: "Montelobos Tobalá", modifiers: ["wild agave", "limited release"] },
            { name: "Montelobos Pechuga", modifiers: ["triple distilled", "seasonal fruits"] },
            { name: "Montelobos Ensamble", modifiers: ["agave blend", "limited edition"] }
        ],
        modifiers: ["organic agave", "artisanal production", "Iván Saldaña"],
        base_queries: [
            "Montelobos mezcal",
            "Montelobos tobala",
            "Montelobos pechuga"
        ]
    },
    {
        name: "Los Danzantes",
        variations: ["Los Nahuales", "Mezcal Los Danzantes"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "losdanzantes.com",
        priority: 7,
        product_lines: [
            { name: "Los Danzantes Joven", modifiers: ["espadín", "unaged"] },
            { name: "Los Danzantes Reposado", modifiers: ["aged 6-8 months"] },
            { name: "Los Danzantes Añejo", modifiers: ["aged 12+ months"] },
            { name: "Los Nahuales", subcategories: ["Joven", "Reposado", "Añejo"] },
            { name: "Alipús", subcategories: ["San Andrés", "San Juan", "Santa Ana", "San Luis"] }
        ],
        modifiers: ["sustainable", "single village", "traditional methods"],
        base_queries: [
            "Los Danzantes mezcal",
            "Los Nahuales mezcal",
            "Alipus mezcal"
        ]
    },
    {
        name: "Bozal",
        variations: ["Bozal Mezcal", "Mezcal Bozal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "bozalmezcal.com",
        priority: 7,
        product_lines: [
            { name: "Bozal Ensamble", modifiers: ["espadín, barril, mexicano"] },
            { name: "Bozal Tobasiche", modifiers: ["wild agave", "limited"] },
            { name: "Bozal Cuixe", modifiers: ["wild agave", "unique profile"] },
            { name: "Bozal Borrego", modifiers: ["pechuga style", "lamb"] },
            { name: "Bozal Sacraficio", modifiers: ["ancestral", "clay pot"] }
        ],
        modifiers: ["artisanal production", "wild agave", "traditional methods"],
        base_queries: [
            "Bozal mezcal",
            "Mezcal Bozal",
            "Bozal wild agave"
        ]
    },
    {
        name: "Mezcal Vago",
        variations: ["Vago Mezcal", "Vago"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "mezcalvago.com",
        priority: 8,
        product_lines: [
            { name: "Vago Elote", modifiers: ["corn infused", "unique"] },
            { name: "Vago Espadín", modifiers: ["Aquilino García"] },
            { name: "Vago Tobalá", modifiers: ["wild agave", "limited"] },
            { name: "Vago Cuixe", modifiers: ["wild agave"] },
            { name: "Vago Mexicano", modifiers: ["wild agave"] },
            { name: "Vago Ensamble", modifiers: ["various mezcaleros"] }
        ],
        modifiers: ["single mezcalero", "traditional production", "terroir focused"],
        base_queries: [
            "Mezcal Vago",
            "Vago mezcal",
            "Vago Elote"
        ]
    },
    {
        name: "El Jolgorio",
        variations: ["El Jolgorio Mezcal", "Jolgorio"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "eljolgoriomezcal.com",
        priority: 8,
        product_lines: [
            { name: "El Jolgorio Espadín", modifiers: ["various villages"] },
            { name: "El Jolgorio Tobalá", modifiers: ["wild agave"] },
            { name: "El Jolgorio Madrecuixe", modifiers: ["wild agave"] },
            { name: "El Jolgorio Tepeztate", modifiers: ["wild agave", "25+ years"] },
            { name: "El Jolgorio Pechuga", modifiers: ["triple distilled", "seasonal"] }
        ],
        modifiers: ["family producers", "traditional methods", "village specific"],
        base_queries: [
            "El Jolgorio mezcal",
            "Jolgorio mezcal",
            "El Jolgorio wild agave"
        ]
    },
    {
        name: "Mezcal Amarás",
        variations: ["Amaras Mezcal", "Amarás"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "amarasmezcal.com",
        priority: 7,
        product_lines: [
            { name: "Amarás Espadín", modifiers: ["joven", "sustainable"] },
            { name: "Amarás Reposado", modifiers: ["aged 8 months"] },
            { name: "Amarás Cupreata", modifiers: ["Guerrero origin"] },
            { name: "Amarás Verde", modifiers: ["organic certified"] },
            { name: "Amarás Logia", modifiers: ["limited editions"] }
        ],
        modifiers: ["sustainable production", "modern approach", "eco-friendly"],
        base_queries: [
            "Amaras mezcal",
            "Mezcal Amarás",
            "Amaras sustainable"
        ]
    },
    {
        name: "Sombra",
        variations: ["Sombra Mezcal", "Mezcal Sombra"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "sombramezcal.com",
        priority: 7,
        product_lines: [
            { name: "Sombra Joven", modifiers: ["100% espadín", "sustainable"] },
            { name: "Sombra Reposado", modifiers: ["aged 2 months", "wine barrels"] },
            { name: "Sombra Ensamble", modifiers: ["tepeztate & tobalá"] }
        ],
        modifiers: ["sustainable", "Adobe Brick Project", "eco-conscious"],
        base_queries: [
            "Sombra mezcal",
            "Mezcal Sombra",
            "Sombra sustainable"
        ]
    },
    {
        name: "Wahaka",
        variations: ["Wahaka Mezcal", "Mezcal Wahaka"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "wahakamezcal.com",
        priority: 7,
        product_lines: [
            { name: "Wahaka Espadín", modifiers: ["joven", "classic"] },
            { name: "Wahaka Reposado con Gusano", modifiers: ["aged", "with worm"] },
            { name: "Wahaka Tobalá", modifiers: ["wild agave"] },
            { name: "Wahaka Madre Cuishe", modifiers: ["wild agave"] },
            { name: "Wahaka Ensamble", modifiers: ["five agave blend"] }
        ],
        modifiers: ["5th generation", "traditional methods", "family owned"],
        base_queries: [
            "Wahaka mezcal",
            "Mezcal Wahaka",
            "Wahaka wild agave"
        ]
    },
    {
        name: "Pierde Almas",
        variations: ["Mezcal Pierde Almas", "Pierde Almas"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "pierdealmas.com",
        priority: 7,
        product_lines: [
            { name: "Pierde Almas Espadín", modifiers: ["joven", "artisanal"] },
            { name: "Pierde Almas Dobadaan", modifiers: ["wild agave"] },
            { name: "Pierde Almas Tobalá", modifiers: ["wild agave", "limited"] },
            { name: "Pierde Almas Conejo", modifiers: ["pechuga", "rabbit"] },
            { name: "Pierde Almas Botanicals", modifiers: ["gin-mezcal hybrid"] }
        ],
        modifiers: ["artisanal", "Jonathan Barbieri", "traditional methods"],
        base_queries: [
            "Pierde Almas mezcal",
            "Mezcal Pierde Almas",
            "Pierde Almas Conejo"
        ]
    },
    {
        name: "Koch",
        variations: ["Koch Mezcal", "Koch El Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "kochmezcal.com",
        priority: 7,
        product_lines: [
            { name: "Koch Espadín", modifiers: ["47% ABV", "artisanal"] },
            { name: "Koch Tobalá", modifiers: ["wild agave", "14 years"] },
            { name: "Koch Arroqueño", modifiers: ["wild agave", "18 years"] },
            { name: "Koch Madrecuixe", modifiers: ["wild agave", "15 years"] },
            { name: "Koch Ensamble", modifiers: ["various wild agaves"] }
        ],
        modifiers: ["artisanal", "San Baltazar Guelavila", "traditional"],
        base_queries: [
            "Koch mezcal",
            "Koch El Mezcal",
            "Koch wild agave"
        ]
    },
    {
        name: "Fidencio",
        variations: ["Fidencio Mezcal", "Mezcal Fidencio"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "fidenciomezcal.com",
        priority: 7,
        product_lines: [
            { name: "Fidencio Clásico", modifiers: ["espadín", "44% ABV"] },
            { name: "Fidencio Único", modifiers: ["espadín", "unique batch"] },
            { name: "Fidencio Pechuga", modifiers: ["triple distilled", "seasonal"] },
            { name: "Fidencio Madrecuixe", modifiers: ["wild agave", "limited"] }
        ],
        modifiers: ["Enrique Jimenez", "4th generation", "traditional"],
        base_queries: [
            "Fidencio mezcal",
            "Mezcal Fidencio",
            "Fidencio Clasico"
        ]
    },
    {
        name: "El Silencio",
        variations: ["El Silencio Mezcal", "Mezcal El Silencio"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "elsilenciomezcal.com",
        priority: 7,
        product_lines: [
            { name: "El Silencio Joven", modifiers: ["100% espadín"] },
            { name: "El Silencio Ensamble", modifiers: ["espadín & tobalá"] },
            { name: "El Silencio Rare", modifiers: ["limited editions"] }
        ],
        modifiers: ["modern design", "traditional production", "black bottle"],
        base_queries: [
            "El Silencio mezcal",
            "Mezcal El Silencio"
        ]
    },
    {
        name: "Gracias a Dios",
        variations: ["Gracias a Dios Mezcal", "GAD Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "graciasdiosmezcal.com",
        priority: 7,
        product_lines: [
            { name: "Gracias a Dios Espadín", modifiers: ["45% ABV", "joven"] },
            { name: "Gracias a Dios Cuixe", modifiers: ["wild agave"] },
            { name: "Gracias a Dios Tepextate", modifiers: ["wild agave", "25 years"] },
            { name: "Gracias a Dios Gin", modifiers: ["agave gin", "unique"] }
        ],
        modifiers: ["thank god", "artisanal", "small batch"],
        base_queries: [
            "Gracias a Dios mezcal",
            "GAD mezcal",
            "Gracias a Dios wild"
        ]
    },
    {
        name: "Rey Campero",
        variations: ["Mezcal Rey Campero", "Rey Campero"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "reycampero.com",
        priority: 8,
        product_lines: [
            { name: "Rey Campero Espadín", modifiers: ["Candelaria Yegolé"] },
            { name: "Rey Campero Cuishe", modifiers: ["wild agave"] },
            { name: "Rey Campero Tepextate", modifiers: ["wild agave", "rare"] },
            { name: "Rey Campero Mexicano", modifiers: ["wild agave"] },
            { name: "Rey Campero Jabali", modifiers: ["wild agave", "extremely rare"] }
        ],
        modifiers: ["Romulo Sanchez Parada", "family tradition", "Candelaria Yegolé"],
        base_queries: [
            "Rey Campero mezcal",
            "Mezcal Rey Campero",
            "Rey Campero wild"
        ]
    },
    {
        name: "Mezcal Nuestra Soledad",
        variations: ["Nuestra Soledad", "Nuestra Soledad Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "nuestrasoledad.com",
        priority: 7,
        product_lines: [
            { name: "Nuestra Soledad San Luis del Rio", modifiers: ["village specific"] },
            { name: "Nuestra Soledad Santiago Matatlán", modifiers: ["village specific"] },
            { name: "Nuestra Soledad La Compañía", modifiers: ["village specific"] },
            { name: "Nuestra Soledad Zoquitlán", modifiers: ["village specific"] },
            { name: "Nuestra Soledad Lachigui", modifiers: ["miahuatlán"] }
        ],
        modifiers: ["single village", "El Jolgorio family", "terroir focused"],
        base_queries: [
            "Nuestra Soledad mezcal",
            "Nuestra Soledad",
            "Nuestra Soledad villages"
        ]
    },
    {
        name: "La Luna",
        variations: ["La Luna Mezcal", "Mezcal La Luna"],
        region: "Michoacán",
        country: "Mexico",
        type: ["mezcal"],
        website: "lalunamezcal.com",
        priority: 7,
        product_lines: [
            { name: "La Luna Cupreata", modifiers: ["Michoacán agave", "joven"] },
            { name: "La Luna Manso Sahuayo", modifiers: ["wild agave"] },
            { name: "La Luna Chino", modifiers: ["wild agave", "rare"] },
            { name: "La Luna Bruto", modifiers: ["wild agave", "limited"] }
        ],
        modifiers: ["Michoacán region", "traditional vinata", "family mezcaleros"],
        base_queries: [
            "La Luna mezcal",
            "Mezcal La Luna",
            "La Luna Michoacan"
        ]
    },
    {
        name: "Tosba",
        variations: ["Tosba Mezcal", "Mezcal Tosba"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "tosbamezcal.com",
        priority: 6,
        product_lines: [
            { name: "Tosba Espadín", modifiers: ["Sierra Norte", "joven"] },
            { name: "Tosba Pechuga", modifiers: ["triple distilled", "turkey breast"] },
            { name: "Tosba Bixá", modifiers: ["corn infused", "unique"] }
        ],
        modifiers: ["Sierra Norte", "collective owned", "indigenous community"],
        base_queries: [
            "Tosba mezcal",
            "Mezcal Tosba",
            "Tosba Sierra Norte"
        ]
    },
    {
        name: "Mezcal Unión",
        variations: ["Union Mezcal", "Unión Uno"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "mezcalunion.com",
        priority: 7,
        product_lines: [
            { name: "Unión Uno", modifiers: ["joven", "espadín & cirial"] },
            { name: "Unión Viejo", modifiers: ["aged", "limited edition"] }
        ],
        modifiers: ["cooperative model", "fair trade", "sustainable"],
        base_queries: [
            "Mezcal Union",
            "Union mezcal",
            "Union Uno"
        ]
    },
    {
        name: "Dos Hombres",
        variations: ["Dos Hombres Mezcal", "Two Men Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "doshombres.com",
        priority: 7,
        product_lines: [
            { name: "Dos Hombres Joven", modifiers: ["espadín", "artisanal"] },
            { name: "Dos Hombres Tobala", modifiers: ["wild agave", "limited"] }
        ],
        modifiers: ["Breaking Bad", "Aaron Paul", "Bryan Cranston"],
        base_queries: [
            "Dos Hombres mezcal",
            "Dos Hombres Breaking Bad",
            "Two Men mezcal"
        ]
    },
    {
        name: "Pelotón de la Muerte",
        variations: ["Peloton de la Muerte", "PDM Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "pelotondelamuerte.com",
        priority: 7,
        product_lines: [
            { name: "Pelotón Espadín", modifiers: ["joven", "traditional"] },
            { name: "Pelotón Arroqueño", modifiers: ["wild agave"] },
            { name: "Pelotón Pechuga", modifiers: ["triple distilled"] }
        ],
        modifiers: ["cycling theme", "death squad", "artisanal"],
        base_queries: [
            "Peloton de la Muerte",
            "PDM mezcal",
            "Pelotón mezcal"
        ]
    },
    {
        name: "Mezcalosfera",
        variations: ["Mezcalosfera Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "mezcalosfera.com",
        priority: 6,
        product_lines: [
            { name: "Mezcalosfera Espadín", modifiers: ["various producers"] },
            { name: "Mezcalosfera Tobalá", modifiers: ["wild agave"] },
            { name: "Mezcalosfera Ensambles", modifiers: ["unique blends"] }
        ],
        modifiers: ["mezcal bar brand", "curated selection", "small batch"],
        base_queries: [
            "Mezcalosfera mezcal",
            "Mezcalosfera"
        ]
    },
    {
        name: "Pal'alma",
        variations: ["Pal alma Mezcal", "Palma Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "palmamezcal.com",
        priority: 6,
        product_lines: [
            { name: "Pal'alma Espadín", modifiers: ["joven", "sustainable"] },
            { name: "Pal'alma Tepextate", modifiers: ["wild agave", "25 years"] },
            { name: "Pal'alma Tobalá", modifiers: ["wild agave", "12 years"] }
        ],
        modifiers: ["for the soul", "sustainable practices", "small batch"],
        base_queries: [
            "Pal alma mezcal",
            "Palma mezcal",
            "Pal'alma"
        ]
    },
    {
        name: "Mezcal Meteoro",
        variations: ["Meteoro Mezcal", "Meteoro"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "meteoromezcal.com",
        priority: 6,
        product_lines: [
            { name: "Meteoro Espadín", modifiers: ["joven", "traditional"] },
            { name: "Meteoro Tobalá", modifiers: ["wild agave"] },
            { name: "Meteoro Ensamble", modifiers: ["blend", "limited"] }
        ],
        modifiers: ["meteor theme", "artisanal", "traditional methods"],
        base_queries: [
            "Meteoro mezcal",
            "Mezcal Meteoro"
        ]
    },
    {
        name: "400 Conejos",
        variations: ["400 Rabbits", "Cuatrocientos Conejos"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        parent_company: "Casa Cuervo",
        website: "400conejos.com",
        priority: 7,
        product_lines: [
            { name: "400 Conejos Joven", modifiers: ["espadín", "traditional"] },
            { name: "400 Conejos Reposado", modifiers: ["aged 2-4 months"] },
            { name: "400 Conejos Ancestral", modifiers: ["clay pot distilled"] }
        ],
        modifiers: ["400 rabbits", "Aztec mythology", "widely available"],
        base_queries: [
            "400 Conejos mezcal",
            "400 Rabbits mezcal",
            "Cuatrocientos Conejos"
        ]
    },
    {
        name: "Convite",
        variations: ["Convite Mezcal", "Mezcal Convite"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "convitemezcal.com",
        priority: 6,
        product_lines: [
            { name: "Convite Esencial", modifiers: ["espadín", "entry level"] },
            { name: "Convite Selección", modifiers: ["premium line"] },
            { name: "Convite Madrecuixe", modifiers: ["wild agave"] }
        ],
        modifiers: ["invitation", "traditional methods", "community focused"],
        base_queries: [
            "Convite mezcal",
            "Mezcal Convite"
        ]
    },
    {
        name: "Banhez",
        variations: ["Banhez Mezcal", "Mezcal Banhez"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "banhez.com",
        priority: 7,
        product_lines: [
            { name: "Banhez Joven", modifiers: ["espadín & barril", "90% 10%"] },
            { name: "Banhez Ensamble", modifiers: ["espadín & barril", "unique"] },
            { name: "Banhez Tepeztate", modifiers: ["wild agave", "limited"] },
            { name: "Banhez Pechuga", modifiers: ["triple distilled", "seasonal"] }
        ],
        modifiers: ["cooperative", "36 families", "sustainable"],
        base_queries: [
            "Banhez mezcal",
            "Mezcal Banhez",
            "Banhez cooperative"
        ]
    },
    {
        name: "Marca Negra",
        variations: ["Mezcal Marca Negra", "Black Mark Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "marcanegramezcal.com",
        priority: 7,
        product_lines: [
            { name: "Marca Negra Espadín", modifiers: ["49% ABV", "traditional"] },
            { name: "Marca Negra Tobalá", modifiers: ["wild agave", "48% ABV"] },
            { name: "Marca Negra Tepeztate", modifiers: ["wild agave", "48.9% ABV"] },
            { name: "Marca Negra Dobadán", modifiers: ["wild agave", "rare"] }
        ],
        modifiers: ["black brand", "small batch", "high proof"],
        base_queries: [
            "Marca Negra mezcal",
            "Black Mark mezcal",
            "Marca Negra wild"
        ]
    },
    {
        name: "Salvadores",
        variations: ["Salvadores Mezcal", "Mezcal Salvadores"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "salvadoresmezcal.com",
        priority: 6,
        product_lines: [
            { name: "Salvadores Espadín", modifiers: ["citrus forward"] },
            { name: "Salvadores Cirial", modifiers: ["unique agave"] },
            { name: "Salvadores Ensamble", modifiers: ["blend"] }
        ],
        modifiers: ["saviors", "artisanal", "small production"],
        base_queries: [
            "Salvadores mezcal",
            "Mezcal Salvadores"
        ]
    },
    {
        name: "Mezcal Carreño",
        variations: ["Carreño Mezcal", "Carreno"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "mezcalcarreno.com",
        priority: 6,
        product_lines: [
            { name: "Carreño Espadín", modifiers: ["traditional methods"] },
            { name: "Carreño Tobalá", modifiers: ["wild agave"] },
            { name: "Carreño Tepextate", modifiers: ["wild agave", "aged 25 years"] }
        ],
        modifiers: ["family tradition", "small batch", "artisanal"],
        base_queries: [
            "Carreño mezcal",
            "Mezcal Carreño"
        ]
    },
    {
        name: "Mezcal de Leyenda",
        variations: ["De Leyenda", "Leyenda Mezcal"],
        region: "Various",
        country: "Mexico",
        type: ["mezcal"],
        website: "mezcaldeleyenda.com",
        priority: 7,
        product_lines: [
            { name: "Leyenda Maguey Verde", modifiers: ["Oaxaca"] },
            { name: "Leyenda Guerrero", modifiers: ["Guerrero state"] },
            { name: "Leyenda Durango", modifiers: ["Durango state"] },
            { name: "Leyenda San Luis Potosí", modifiers: ["SLP state"] },
            { name: "Leyenda Pechuga", modifiers: ["seasonal", "triple distilled"] }
        ],
        modifiers: ["legendary", "multiple regions", "terroir focused"],
        base_queries: [
            "Mezcal de Leyenda",
            "De Leyenda mezcal",
            "Leyenda regional"
        ]
    },
    {
        name: "Siete Misterios",
        variations: ["7 Misterios", "Seven Mysteries"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "sietemisterios.com",
        priority: 7,
        product_lines: [
            { name: "Siete Misterios Doba-Yej", modifiers: ["espadín", "joven"] },
            { name: "Siete Misterios Pechuga", modifiers: ["triple distilled"] },
            { name: "Siete Misterios Barril", modifiers: ["wild agave"] },
            { name: "Siete Misterios Mexicano", modifiers: ["wild agave"] }
        ],
        modifiers: ["seven mysteries", "traditional clay pots", "Eduardo Angeles"],
        base_queries: [
            "Siete Misterios mezcal",
            "7 Misterios",
            "Seven Mysteries mezcal"
        ]
    },
    {
        name: "Real Minero",
        variations: ["Mezcal Real Minero", "Real Minero"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "realminero.com",
        priority: 8,
        product_lines: [
            { name: "Real Minero Espadín", modifiers: ["clay pot distilled"] },
            { name: "Real Minero Barril", modifiers: ["clay pot", "wild agave"] },
            { name: "Real Minero Arroqueño", modifiers: ["clay pot", "wild agave"] },
            { name: "Real Minero Pechuga", modifiers: ["seasonal", "traditional"] }
        ],
        modifiers: ["clay pot distillation", "4th generation", "Santa Catarina Minas"],
        base_queries: [
            "Real Minero mezcal",
            "Mezcal Real Minero",
            "Real Minero clay pot"
        ]
    },
    {
        name: "Alipús",
        variations: ["Alipus Mezcal", "Mezcal Alipus"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        parent_company: "Los Danzantes",
        website: "alipus.com",
        priority: 7,
        product_lines: [
            { name: "Alipús San Andrés", modifiers: ["village specific"] },
            { name: "Alipús San Juan", modifiers: ["village specific"] },
            { name: "Alipús Santa Ana", modifiers: ["village specific"] },
            { name: "Alipús San Luis", modifiers: ["village specific"] }
        ],
        modifiers: ["single village", "social impact", "Los Danzantes project"],
        base_queries: [
            "Alipus mezcal",
            "Mezcal Alipús",
            "Alipus village"
        ]
    },
    {
        name: "Quiquiriqui",
        variations: ["Quiquiriqui Mezcal", "Mezcal Quiquiriqui"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "quiquiriquimezcal.com",
        priority: 6,
        product_lines: [
            { name: "Quiquiriqui Espadín", modifiers: ["joven", "45% ABV"] },
            { name: "Quiquiriqui Tobalá", modifiers: ["wild agave", "limited"] },
            { name: "Quiquiriqui Tepextate", modifiers: ["wild agave", "rare"] }
        ],
        modifiers: ["rooster crow", "Melchor Ramos", "artisanal"],
        base_queries: [
            "Quiquiriqui mezcal",
            "Mezcal Quiquiriqui"
        ]
    },
    {
        name: "Mezcal Miel de Tierra",
        variations: ["Miel de Tierra", "Honey of the Earth"],
        region: "Various",
        country: "Mexico",
        type: ["mezcal"],
        website: "mieldetierra.com",
        priority: 6,
        product_lines: [
            { name: "Miel de Tierra Joven", modifiers: ["various agaves"] },
            { name: "Miel de Tierra Añejo", modifiers: ["aged", "unique"] }
        ],
        modifiers: ["honey of earth", "small batch", "traditional"],
        base_queries: [
            "Miel de Tierra mezcal",
            "Honey of the Earth mezcal"
        ]
    },
    {
        name: "Mezcal Complice",
        variations: ["Complice Mezcal", "Cómplice"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "mezcalcomplice.com",
        priority: 6,
        product_lines: [
            { name: "Cómplice de Aventura", modifiers: ["espadín", "joven"] },
            { name: "Cómplice de Pasión", modifiers: ["reposado"] },
            { name: "Cómplice Único", modifiers: ["limited editions"] }
        ],
        modifiers: ["accomplice", "modern brand", "traditional methods"],
        base_queries: [
            "Complice mezcal",
            "Mezcal Cómplice"
        ]
    },
    {
        name: "Mezcal Lagrimas de Dolores",
        variations: ["Lagrimas de Dolores", "Tears of Dolores"],
        region: "Durango",
        country: "Mexico",
        type: ["mezcal"],
        website: "lagrimasdedolores.com",
        priority: 6,
        product_lines: [
            { name: "Lágrimas de Dolores Añejo", modifiers: ["aged 2 years"] },
            { name: "Lágrimas de Dolores Reposado", modifiers: ["aged 6 months"] }
        ],
        modifiers: ["tears of sorrows", "Durango region", "aged mezcals"],
        base_queries: [
            "Lagrimas de Dolores mezcal",
            "Tears of Dolores"
        ]
    },
    {
        name: "La Venenosa",
        variations: ["Mezcal La Venenosa", "La Venenosa Raicilla"],
        region: "Jalisco",
        country: "Mexico",
        type: ["mezcal", "raicilla"],
        website: "lavenenosa.com",
        priority: 7,
        product_lines: [
            { name: "La Venenosa Sierra", modifiers: ["raicilla", "mountain agave"] },
            { name: "La Venenosa Costa", modifiers: ["raicilla", "coastal agave"] },
            { name: "La Venenosa Tabernas", modifiers: ["raicilla", "traditional"] }
        ],
        modifiers: ["the poisonous one", "raicilla specialist", "Jalisco"],
        base_queries: [
            "La Venenosa mezcal",
            "La Venenosa raicilla",
            "Mezcal La Venenosa"
        ]
    },
    {
        name: "Mezcal Macurichos",
        variations: ["Macurichos", "Macurichos Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "macurichos.com",
        priority: 6,
        product_lines: [
            { name: "Macurichos Espadín", modifiers: ["traditional", "47% ABV"] },
            { name: "Macurichos Madrecuixe", modifiers: ["wild agave"] },
            { name: "Macurichos Pechuga", modifiers: ["triple distilled"] }
        ],
        modifiers: ["Santiago Matatlán", "traditional methods", "small batch"],
        base_queries: [
            "Macurichos mezcal",
            "Mezcal Macurichos"
        ]
    },
    {
        name: "Mezcales de Leyenda",
        variations: ["Mezcales de Leyenda", "Legendary Mezcals"],
        region: "Various",
        country: "Mexico",
        type: ["mezcal"],
        website: "mezcalesdeleyenda.com",
        priority: 7,
        product_lines: [
            { name: "Maguey Melate", modifiers: ["unique profile"] },
            { name: "Single Village Series", modifiers: ["various villages"] },
            { name: "Ancestral Series", modifiers: ["traditional methods"] }
        ],
        modifiers: ["legendary mezcals", "multiple regions", "premium line"],
        base_queries: [
            "Mezcales de Leyenda",
            "Legendary Mezcals"
        ]
    },
    {
        name: "Mezcal San Cosme",
        variations: ["San Cosme", "San Cosme Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "mezcalsancosme.com",
        priority: 6,
        product_lines: [
            { name: "San Cosme Joven", modifiers: ["100% espadín"] },
            { name: "San Cosme Blanco", modifiers: ["unaged", "traditional"] }
        ],
        modifiers: ["Santiago Matatlán", "traditional production"],
        base_queries: [
            "San Cosme mezcal",
            "Mezcal San Cosme"
        ]
    },
    {
        name: "Scorpion Mezcal",
        variations: ["Scorpion", "Alacrán Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "scorpionmezcal.com",
        priority: 6,
        product_lines: [
            { name: "Scorpion Silver", modifiers: ["1 year aged"] },
            { name: "Scorpion Reposado", modifiers: ["aged oak"] },
            { name: "Scorpion Añejo", modifiers: ["5 year aged"] }
        ],
        modifiers: ["scorpion in bottle", "aged mezcals", "unique presentation"],
        base_queries: [
            "Scorpion mezcal",
            "Scorpion in bottle"
        ]
    },
    {
        name: "Se Busca",
        variations: ["Se Busca Mezcal", "Mezcal Se Busca"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "sebuscamezcal.com",
        priority: 6,
        product_lines: [
            { name: "Se Busca Joven", modifiers: ["espadín", "traditional"] },
            { name: "Se Busca Reposado", modifiers: ["aged", "smooth"] },
            { name: "Se Busca Añejo", modifiers: ["aged 18 months"] }
        ],
        modifiers: ["wanted", "outlaw theme", "traditional methods"],
        base_queries: [
            "Se Busca mezcal",
            "Mezcal Se Busca"
        ]
    },
    {
        name: "Sentir",
        variations: ["Sentir Mezcal", "Mezcal Sentir"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "sentirmezcal.com",
        priority: 6,
        product_lines: [
            { name: "Sentir Clásico", modifiers: ["espadín", "traditional"] },
            { name: "Sentir Artesanal", modifiers: ["small batch"] },
            { name: "Sentir Ancestral", modifiers: ["clay pot distilled"] }
        ],
        modifiers: ["to feel", "emotional connection", "artisanal"],
        base_queries: [
            "Sentir mezcal",
            "Mezcal Sentir"
        ]
    },
    {
        name: "Talapa",
        variations: ["Talapa Mezcal", "Mezcal Talapa"],
        region: "Puebla",
        country: "Mexico",
        type: ["mezcal"],
        website: "talapamezcal.com",
        priority: 6,
        product_lines: [
            { name: "Talapa Espadín", modifiers: ["Puebla origin"] },
            { name: "Talapa Papalometl", modifiers: ["butterfly agave"] },
            { name: "Talapa Pichomel", modifiers: ["rare agave"] }
        ],
        modifiers: ["Puebla region", "unique agaves", "traditional"],
        base_queries: [
            "Talapa mezcal",
            "Mezcal Talapa"
        ]
    },
    {
        name: "Mezcal Tío Pesca",
        variations: ["Tio Pesca", "Uncle Fish Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "tiopesca.com",
        priority: 6,
        product_lines: [
            { name: "Tío Pesca Espadín", modifiers: ["traditional"] },
            { name: "Tío Pesca Tobalá", modifiers: ["wild agave"] }
        ],
        modifiers: ["uncle fish", "small production", "artisanal"],
        base_queries: [
            "Tio Pesca mezcal",
            "Uncle Fish mezcal"
        ]
    },
    {
        name: "Xicaru",
        variations: ["Xicaru Mezcal", "Mezcal Xicaru"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "xicarumezcal.com",
        priority: 7,
        product_lines: [
            { name: "Xicaru Silver", modifiers: ["espadín", "102 proof"] },
            { name: "Xicaru Reposado", modifiers: ["aged 2 months"] },
            { name: "Xicaru Añejo", modifiers: ["aged 1 year"] }
        ],
        modifiers: ["beautiful liquor", "Fernando Santibañez", "high proof"],
        base_queries: [
            "Xicaru mezcal",
            "Mezcal Xicaru",
            "Xicaru 102 proof"
        ]
    },
    {
        name: "Yu Baal",
        variations: ["Yuu Baal", "Yu Baal Mezcal"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        website: "yuubaal.com",
        priority: 6,
        product_lines: [
            { name: "Yuu Baal Joven", modifiers: ["espadín", "traditional"] },
            { name: "Yuu Baal Reposado", modifiers: ["aged 6 months"] },
            { name: "Yuu Baal Añejo", modifiers: ["aged 18 months"] },
            { name: "Yuu Baal Pechuga", modifiers: ["triple distilled"] }
        ],
        modifiers: ["earth liquor", "Zapotec language", "traditional"],
        base_queries: [
            "Yu Baal mezcal",
            "Yuu Baal mezcal",
            "Yu Baal earth"
        ]
    },
    {
        name: "Zignum",
        variations: ["Zignum Mezcal", "Mezcal Zignum"],
        region: "Oaxaca",
        country: "Mexico",
        type: ["mezcal"],
        parent_company: "Casa Armando Guillermo Prieto",
        website: "zignum.com",
        priority: 6,
        product_lines: [
            { name: "Zignum Silver", modifiers: ["espadín", "modern"] },
            { name: "Zignum Reposado", modifiers: ["aged oak"] },
            { name: "Zignum Añejo", modifiers: ["aged 16 months"] }
        ],
        modifiers: ["modern production", "widely distributed", "Coca-Cola partnership"],
        base_queries: [
            "Zignum mezcal",
            "Mezcal Zignum"
        ]
    }
];
// Export combined arrays for use in scraper
export const ALL_TEQUILA_PRODUCERS = TEQUILA_DISTILLERIES;
export const ALL_MEZCAL_PRODUCERS = MEZCAL_PRODUCERS;
