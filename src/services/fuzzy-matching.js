/**
 * Fuzzy Matching Library for Spirit Names
 *
 * Implements multiple algorithms for detecting similar spirit names:
 * - Levenshtein distance (edit distance)
 * - Jaro-Winkler similarity (optimized for names)
 * - N-gram similarity (character and word-based)
 * - Phonetic matching (Soundex and Metaphone)
 * - Token-based matching for multi-word names
 */
/**
 * Default configuration for spirit name matching
 */
export const DEFAULT_CONFIG = {
    threshold: 0.8,
    weights: {
        levenshtein: 0.15,
        jaroWinkler: 0.25,
        nGram: 0.2,
        phonetic: 0.15,
        tokenBased: 0.25,
    },
    nGramSize: 3,
    caseSensitive: false,
    removeStopWords: true,
};
/**
 * Common stop words to remove from spirit names
 */
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'single', 'double', 'triple', 'malt', 'grain', 'blend', 'blended', 'aged', 'year', 'years',
    'old', 'reserve', 'special', 'limited', 'edition', 'barrel', 'cask', 'proof', 'strength'
]);
/**
 * Normalize text for comparison
 */
function normalizeText(text, config) {
    let normalized = text.trim();
    if (!config.caseSensitive) {
        normalized = normalized.toLowerCase();
    }
    // Remove special characters but keep spaces and alphanumeric
    normalized = normalized.replace(/[^\w\s]/g, ' ');
    // Normalize whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();
    if (config.removeStopWords) {
        const words = normalized.split(' ');
        const filteredWords = words.filter(word => !STOP_WORDS.has(word.toLowerCase()));
        normalized = filteredWords.join(' ');
    }
    return normalized;
}
/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i++) {
        matrix[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j++) {
        matrix[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(matrix[j][i - 1] + 1, // deletion
            matrix[j - 1][i] + 1, // insertion
            matrix[j - 1][i - 1] + indicator // substitution
            );
        }
    }
    return matrix[str2.length][str1.length];
}
/**
 * Calculate Levenshtein similarity (0-1)
 */
function levenshteinSimilarity(str1, str2) {
    if (str1.length === 0 && str2.length === 0)
        return 1;
    if (str1.length === 0 || str2.length === 0)
        return 0;
    const distance = levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
}
/**
 * Calculate Jaro similarity
 */
function jaroSimilarity(str1, str2) {
    if (str1 === str2)
        return 1;
    if (str1.length === 0 || str2.length === 0)
        return 0;
    const matchWindow = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
    const str1Matches = new Array(str1.length).fill(false);
    const str2Matches = new Array(str2.length).fill(false);
    let matches = 0;
    let transpositions = 0;
    // Find matches
    for (let i = 0; i < str1.length; i++) {
        const start = Math.max(0, i - matchWindow);
        const end = Math.min(i + matchWindow + 1, str2.length);
        for (let j = start; j < end; j++) {
            if (str2Matches[j] || str1[i] !== str2[j])
                continue;
            str1Matches[i] = str2Matches[j] = true;
            matches++;
            break;
        }
    }
    if (matches === 0)
        return 0;
    // Count transpositions
    let k = 0;
    for (let i = 0; i < str1.length; i++) {
        if (!str1Matches[i])
            continue;
        while (!str2Matches[k])
            k++;
        if (str1[i] !== str2[k])
            transpositions++;
        k++;
    }
    return (matches / str1.length + matches / str2.length + (matches - transpositions / 2) / matches) / 3;
}
/**
 * Calculate Jaro-Winkler similarity (gives more weight to common prefixes)
 */
function jaroWinklerSimilarity(str1, str2) {
    const jaroSim = jaroSimilarity(str1, str2);
    if (jaroSim < 0.7)
        return jaroSim;
    // Calculate common prefix length (up to 4 characters)
    let prefix = 0;
    for (let i = 0; i < Math.min(str1.length, str2.length, 4); i++) {
        if (str1[i] === str2[i]) {
            prefix++;
        }
        else {
            break;
        }
    }
    return jaroSim + (0.1 * prefix * (1 - jaroSim));
}
/**
 * Generate n-grams from a string
 */
function generateNGrams(text, n) {
    const ngrams = new Set();
    const paddedText = '#'.repeat(n - 1) + text + '#'.repeat(n - 1);
    for (let i = 0; i < paddedText.length - n + 1; i++) {
        ngrams.add(paddedText.substring(i, i + n));
    }
    return ngrams;
}
/**
 * Calculate n-gram similarity
 */
function nGramSimilarity(str1, str2, n) {
    const ngrams1 = generateNGrams(str1, n);
    const ngrams2 = generateNGrams(str2, n);
    if (ngrams1.size === 0 && ngrams2.size === 0)
        return 1;
    if (ngrams1.size === 0 || ngrams2.size === 0)
        return 0;
    const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
    const union = new Set([...ngrams1, ...ngrams2]);
    return intersection.size / union.size;
}
/**
 * Generate Soundex code for phonetic matching
 */
function soundex(str) {
    if (!str)
        return '';
    const code = str.toUpperCase().replace(/[^A-Z]/g, '');
    if (code.length === 0)
        return '';
    let soundexCode = code[0];
    const mapping = {
        'B': '1', 'F': '1', 'P': '1', 'V': '1',
        'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
        'D': '3', 'T': '3',
        'L': '4',
        'M': '5', 'N': '5',
        'R': '6'
    };
    for (let i = 1; i < code.length; i++) {
        const digit = mapping[code[i]] || '0';
        if (digit !== '0' && digit !== soundexCode[soundexCode.length - 1]) {
            soundexCode += digit;
        }
    }
    return (soundexCode + '0000').substring(0, 4);
}
/**
 * Calculate phonetic similarity using Soundex
 */
function phoneticSimilarity(str1, str2) {
    const soundex1 = soundex(str1);
    const soundex2 = soundex(str2);
    if (soundex1 === soundex2)
        return 1;
    // Calculate similarity based on matching positions
    let matches = 0;
    for (let i = 0; i < Math.min(soundex1.length, soundex2.length); i++) {
        if (soundex1[i] === soundex2[i])
            matches++;
    }
    return matches / Math.max(soundex1.length, soundex2.length);
}
/**
 * Calculate token-based similarity for multi-word names
 */
function tokenBasedSimilarity(str1, str2) {
    const tokens1 = str1.split(/\s+/).filter(token => token.length > 0);
    const tokens2 = str2.split(/\s+/).filter(token => token.length > 0);
    if (tokens1.length === 0 && tokens2.length === 0)
        return 1;
    if (tokens1.length === 0 || tokens2.length === 0)
        return 0;
    // Use bidirectional token matching with normalization
    const matchedTokens = new Set();
    let totalSimilarity = 0;
    let totalTokens = 0;
    // Match tokens from str1 to str2
    for (const token1 of tokens1) {
        let bestMatch = 0;
        let bestToken = '';
        for (const token2 of tokens2) {
            if (matchedTokens.has(token2))
                continue;
            const sim = jaroWinklerSimilarity(token1, token2);
            if (sim > bestMatch) {
                bestMatch = sim;
                bestToken = token2;
            }
        }
        if (bestMatch > 0.5) { // Only count reasonable matches
            totalSimilarity += bestMatch;
            if (bestToken)
                matchedTokens.add(bestToken);
        }
        totalTokens++;
    }
    // Match remaining tokens from str2
    for (const token2 of tokens2) {
        if (matchedTokens.has(token2))
            continue;
        let bestMatch = 0;
        for (const token1 of tokens1) {
            const sim = jaroWinklerSimilarity(token1, token2);
            bestMatch = Math.max(bestMatch, sim);
        }
        if (bestMatch > 0.5) {
            totalSimilarity += bestMatch;
        }
        totalTokens++;
    }
    return totalTokens > 0 ? totalSimilarity / totalTokens : 0;
}
/**
 * Aggressive normalization for deduplication
 * Creates a key by removing all special chars and common variations
 */
function createAggressiveKey(name) {
    let key = name.toLowerCase();
    // Remove volume info
    key = key.replace(/\b\d+\s*m\s*l\b/gi, '');
    key = key.replace(/\b\d+ml\b/gi, '');
    key = key.replace(/\b\d+\s*liter\b/gi, '');
    key = key.replace(/\b\d+\s*l\b/gi, '');
    // Remove all non-alphanumeric
    key = key.replace(/[^a-z0-9]/g, '');
    // Normalize common variations
    key = key.replace(/whiskey/g, 'whisky');
    key = key.replace(/bottledinbond/g, 'bib');
    key = key.replace(/singlebarre/g, 'sb');
    key = key.replace(/smallbatch/g, 'smb');
    key = key.replace(/straightbourbon/g, 'bourbon');
    key = key.replace(/kentuckystraight/g, 'ky');
    key = key.replace(/caskstrength/g, 'cs');
    key = key.replace(/barrelproof/g, 'bp');
    return key;
}
/**
 * Main fuzzy matching function
 */
export function fuzzyMatch(name1, name2, config = DEFAULT_CONFIG) {
    // Normalize inputs
    const norm1 = normalizeText(name1, config);
    const norm2 = normalizeText(name2, config);
    // Also create aggressive keys for better deduplication
    const key1 = createAggressiveKey(name1);
    const key2 = createAggressiveKey(name2);
    // If aggressive keys match exactly, it's a very high confidence match
    if (key1 === key2 && key1.length > 0) {
        return {
            similarity: 0.98, // Not 1.0 to leave room for exact matches
            confidence: 'high',
            breakdown: {
                levenshtein: 0.98,
                jaroWinkler: 0.98,
                nGram: 0.98,
                phonetic: 0.98,
                tokenBased: 0.98,
                weighted: 0.98,
            },
            normalizedNames: {
                name1: norm1,
                name2: norm2,
            },
        };
    }
    // Calculate individual similarities
    const levenshtein = levenshteinSimilarity(norm1, norm2);
    const jaroWinkler = jaroWinklerSimilarity(norm1, norm2);
    const nGram = nGramSimilarity(norm1, norm2, config.nGramSize);
    const phonetic = phoneticSimilarity(norm1, norm2);
    const tokenBased = tokenBasedSimilarity(norm1, norm2);
    // Calculate weighted similarity
    const weighted = (levenshtein * config.weights.levenshtein +
        jaroWinkler * config.weights.jaroWinkler +
        nGram * config.weights.nGram +
        phonetic * config.weights.phonetic +
        tokenBased * config.weights.tokenBased);
    // Determine confidence level
    let confidence;
    if (weighted >= 0.9) {
        confidence = 'high';
    }
    else if (weighted >= 0.7) {
        confidence = 'medium';
    }
    else {
        confidence = 'low';
    }
    return {
        similarity: weighted,
        confidence,
        breakdown: {
            levenshtein,
            jaroWinkler,
            nGram,
            phonetic,
            tokenBased,
            weighted,
        },
        normalizedNames: {
            name1: norm1,
            name2: norm2,
        },
    };
}
/**
 * Find similar names from a list
 */
export function findSimilarNames(targetName, nameList, config = DEFAULT_CONFIG) {
    const results = nameList
        .map(name => ({
        name,
        result: fuzzyMatch(targetName, name, config),
    }))
        .filter(item => item.result.similarity >= config.threshold)
        .sort((a, b) => b.result.similarity - a.result.similarity);
    return results;
}
/**
 * Batch compare names for deduplication
 */
export function batchFuzzyMatch(names, config = DEFAULT_CONFIG) {
    const results = [];
    for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) {
            const result = fuzzyMatch(names[i], names[j], config);
            if (result.similarity >= config.threshold) {
                results.push({
                    name1: names[i],
                    name2: names[j],
                    result,
                });
            }
        }
    }
    return results.sort((a, b) => b.result.similarity - a.result.similarity);
}
