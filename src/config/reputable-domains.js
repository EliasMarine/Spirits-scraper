/**
 * List of reputable spirits retailers, auctioneers, and specialized shops
 * These domains are known for selling authentic spirits and providing accurate product information
 */
export const REPUTABLE_SPIRIT_DOMAINS = {
    // Major US Retailers
    US_RETAILERS: [
        'totalwine.com',
        'wine.com',
        'drizly.com',
        'reservebar.com',
        'caskers.com',
        'flaviar.com',
        'thewhiskyexchange.com',
        'masterofmalt.com',
        'klwines.com',
        'binnys.com',
        'specsonline.com',
        'bevmo.com',
        'liquorbarn.com',
        'astorwines.com',
        'sherry-lehmann.com',
        'parkavenueLiquor.com',
        'caskcartel.com',
        'thirstie.com',
        'saucey.com',
        'minibar.com',
    ],
    // UK/European Retailers
    UK_EU_RETAILERS: [
        'thewhiskyexchange.com',
        'masterofmalt.com',
        'whisky.com',
        'thewhiskyshop.com',
        'royalmilewhiskies.com',
        'hardtofindwhisky.com',
        'drinkfinder.co.uk',
        'hedonism.co.uk',
        'selfridges.com',
        'harrods.com',
        'laithwaites.co.uk',
        'majestic.co.uk',
        'waitrose.com',
        'ocado.com',
        'whiskyshop.com',
        'abbeywhisky.com',
        'finedrams.com',
        'dramtime.com',
        'whiskysite.nl',
        'whisky.de',
        'weinquelle.com',
        'whiskyworld.de',
        'whisky.fr',
        'maison-du-whisky.fr',
        'whisky.it',
        'whiskyitalia.it',
    ],
    // Asian Retailers
    ASIAN_RETAILERS: [
        'dekanta.com',
        'whiskyfind.com',
        'mizunara-whisky.com',
        'whiskyimportjapan.com',
        'liquormountain.com',
        'wineconnection.com.sg',
        'asiapalate.com',
        'oakandbarrelasia.com',
        'cellarbration.com.sg',
        '1855thebottleshop.com',
        'whiskybutler.com',
        'drinksdeli.asia',
    ],
    // Australian/NZ Retailers
    OCEANIA_RETAILERS: [
        'danmurphys.com.au',
        'nicks.com.au',
        'boozebud.com',
        'gooddrop.com.au',
        'whiskyandalement.com.au',
        'spiritsoffrance.com.au',
        'smwhisky.com.au',
        'whiskeymate.com.au',
        'finewinedelivery.co.nz',
        'whiskyandmore.co.nz',
    ],
    // Auction Houses
    AUCTION_HOUSES: [
        'whiskyauction.com',
        'scotchwhiskyauctions.com',
        'whiskyauctioneer.com',
        'bonhams.com',
        'sothebys.com',
        'christies.com',
        'whiskyhammer.com',
        'unicornauctions.com',
        'whisky.auction',
        'catawiki.com',
        'onlinewhiskyauctions.com',
        'justwhisky.com',
        'whiskyauctions.com',
        'whiskystats.net',
    ],
    // Specialty & Craft Retailers
    SPECIALTY_RETAILERS: [
        'thewhiskybarrel.com',
        'htfw.com', // Hard to Find Whisky
        'whiskybase.com',
        'oldraregems.com',
        'rarespiritsociety.com',
        'goldeneagleretail.com',
        'aceofcasks.com',
        'whiskybroker.co.uk',
        'celticwhiskeyshop.com',
        'irishmalts.com',
        'greenspotwhiskey.com',
        'singlemalts.com',
        'whiskyloot.com',
        'craftcellars.com',
        'woodencork.com',
        'missionliquor.com',
        'remedyliquor.com',
        'davidsonliquors.com',
        'uncorked.com',
        'liquorama.net',
        'winechateau.com',
        'qualityliquorstore.com',
        'bottledprices.com',
        'seelbachs.com',
        'breakingbourbon.com',
    ],
    // Distillery Direct & Official Stores
    DISTILLERY_STORES: [
        'buffalotracedistillery.com',
        'jimbeam.com',
        'wildturkey.com',
        'makersmark.com',
        'glenfiddich.com',
        'themacallan.com',
        'glenlivet.com',
        'highlandpark.co.uk',
        'ardbeg.com',
        'lagavulin.com',
        'talisker.com',
        'johnniewalker.com',
        'jackdaniels.com',
        'heavenhill.com',
        'fourrosesbourbon.com',
        'woodfordreserve.com',
        'knobcreek.com',
        'bulleit.com',
        'jameson.com',
        'bushmills.com',
    ],
    // Price Comparison & Search Sites
    PRICE_SEARCH_SITES: [
        'wine-searcher.com',
        'whiskyprices.com',
        'drinkprices.com',
        'bottlesearch.com',
        'spiritsearch.com',
    ],
    // Canadian Retailers
    CANADIAN_RETAILERS: [
        'lcbo.com',
        'bcliquorstores.com',
        'liquormarts.ca',
        'alcoolnb.com',
        'mynslc.com',
        'liquordirect.ca',
    ],
    // Latin American Retailers
    LATAM_RETAILERS: [
        'mercadolibre.com', // spirits section
        'elcorteingles.es',
        'carrefour.es',
        'uvinum.es',
        'bodeboca.com',
        'vilaviniteca.es',
    ],
};
/**
 * Get all reputable domains as a flat array
 */
export function getAllReputableDomains() {
    return Object.values(REPUTABLE_SPIRIT_DOMAINS).flat();
}
/**
 * Check if a URL is from a reputable domain
 */
export function isReputableDomain(url) {
    const allDomains = getAllReputableDomains();
    return allDomains.some(domain => url.includes(domain));
}
/**
 * Get retailer type from domain
 */
export function getRetailerType(url) {
    for (const [type, domains] of Object.entries(REPUTABLE_SPIRIT_DOMAINS)) {
        if (domains.some(domain => url.includes(domain))) {
            return type;
        }
    }
    return null;
}
/**
 * Domains to prioritize for product information
 */
export const PRIORITY_DOMAINS = [
    'thewhiskyexchange.com',
    'masterofmalt.com',
    'totalwine.com',
    'wine-searcher.com',
    'whisky.com',
    'klwines.com',
    'dekanta.com',
    'whiskyauction.com',
    'wine.com',
    'caskers.com',
    'flaviar.com',
    'reservebar.com',
    'seelbachs.com',
    'breakingbourbon.com',
];
/**
 * Domains known for having structured product data
 */
export const STRUCTURED_DATA_DOMAINS = [
    'thewhiskyexchange.com',
    'masterofmalt.com',
    'totalwine.com',
    'wine.com',
    'drizly.com',
    'klwines.com',
    'astorwines.com',
    'whisky.com',
    'dekanta.com',
    'danmurphys.com.au',
];
