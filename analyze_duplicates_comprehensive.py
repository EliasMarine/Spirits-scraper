#!/usr/bin/env python3
"""
Comprehensive duplicate analysis including cross-brand duplicates and fuzzy matching.
"""

import csv
import re
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Set
import json
from difflib import SequenceMatcher


def similarity_score(a: str, b: str) -> float:
    """Calculate similarity between two strings."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def normalize_name_aggressive(name: str) -> str:
    """Aggressively normalize spirit name for cross-brand comparison."""
    # Convert to lowercase
    normalized = name.lower()
    
    # Remove all marketing/retail text
    patterns_to_remove = [
        r'\s*-\s*gift\s*box.*$',
        r'\s*-\s*ratings\s*and\s*reviews.*$',
        r'\s*-\s*whiskybase.*$',
        r'\s*-\s*majestic\s*wine.*$',
        r'\s*-\s*star\s*hill\s*farm.*$',
        r'\(lowest\s*prices.*\)$',
        r'\s*the\s*$',
        r'order\s+(.+?)\s+online.*$',
        r'\s*sample$',
        r'\s*miniature$',
        r'\s*magnum$',
        r'\s*traveler$',
        r'dnu\s+',
        r'\s*pf$',
        r'\s*proof$',
        r'\s*\d+ml$',
        r'\s*single\s*barrel\s*select$',
        r'\s*limited\s*edition$',
        r'\s*special\s*release$',
        r'\s*cask\s*strength$',
        r'\s*barrel\s*proof$',
        r'\s*kentucky\s*straight$',
        r'\s*straight\s*bourbon$',
        r'\s*small\s*batch$',
        r'\s*single\s*malt$',
        r'\s*sherry\s*oak$',
        r'\s*-\s*\d{4}\s*release$',
        r'\s*\(\d+(?:\.\d+)?%?\)$',  # Remove ABV in parentheses
        r'\s*batch\s*\w+$',
    ]
    
    for pattern in patterns_to_remove:
        normalized = re.sub(pattern, '', normalized, flags=re.IGNORECASE)
    
    # Normalize punctuation and spacing
    normalized = re.sub(r'[^\w\s]', ' ', normalized)
    normalized = re.sub(r'\s+', ' ', normalized)
    normalized = normalized.strip()
    
    return normalized


def extract_all_attributes(name: str, spirit_data: Dict) -> Dict[str, str]:
    """Extract all possible attributes from product name and data."""
    attributes = {}
    
    # From name
    # Age statement
    age_matches = re.findall(r'(\d+)\s*year', name, re.IGNORECASE)
    if age_matches:
        attributes['ages'] = sorted(set(age_matches))
    
    # Proof/ABV from name
    proof_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:proof|pf|%)', name, re.IGNORECASE)
    if proof_match:
        attributes['stated_proof'] = proof_match.group(1)
    
    # From data
    attributes['type'] = spirit_data.get('type', '').lower()
    attributes['category'] = spirit_data.get('category', '').lower()
    attributes['abv'] = spirit_data.get('abv', '')
    
    # Special characteristics
    characteristics = []
    if re.search(r'cask\s*strength|barrel\s*proof', name, re.IGNORECASE):
        characteristics.append('cask_strength')
    if re.search(r'single\s*barrel', name, re.IGNORECASE):
        characteristics.append('single_barrel')
    if re.search(r'limited\s*edition', name, re.IGNORECASE):
        characteristics.append('limited_edition')
    if re.search(r'kosher', name, re.IGNORECASE):
        characteristics.append('kosher')
    if re.search(r'bottled?\s*in\s*bond', name, re.IGNORECASE):
        characteristics.append('bottled_in_bond')
    
    if characteristics:
        attributes['characteristics'] = characteristics
    
    return attributes


def find_all_duplicate_patterns(spirits: List[Dict]) -> Dict:
    """Find all types of duplicate patterns in the dataset."""
    
    # 1. Exact duplicates within brand (current analysis)
    brand_duplicates = defaultdict(list)
    
    # 2. Cross-brand potential duplicates
    cross_brand_matches = []
    
    # 3. Name similarity groups
    similarity_groups = []
    
    # 4. Pattern-based duplicates
    pattern_duplicates = {
        'size_variants': [],
        'marketing_variants': [],
        'year_variants': [],
        'proof_variants': [],
        'type_mismatches': []
    }
    
    # Group by brand first
    brand_groups = defaultdict(list)
    for spirit in spirits:
        brand_groups[spirit['brand']].append(spirit)
    
    # Find within-brand duplicates
    for brand, brand_spirits in brand_groups.items():
        name_groups = defaultdict(list)
        for spirit in brand_spirits:
            normalized = normalize_name_aggressive(spirit['name'])
            name_groups[normalized].append(spirit)
        
        for normalized_name, group in name_groups.items():
            if len(group) > 1:
                brand_duplicates[brand].append({
                    'normalized_name': normalized_name,
                    'spirits': group
                })
    
    # Find cross-brand matches (same product, different listings)
    all_spirits_normalized = []
    for spirit in spirits:
        normalized = normalize_name_aggressive(spirit['name'])
        all_spirits_normalized.append((normalized, spirit))
    
    # Check for high similarity across brands
    for i, (norm1, spirit1) in enumerate(all_spirits_normalized):
        for j, (norm2, spirit2) in enumerate(all_spirits_normalized[i+1:], i+1):
            if spirit1['brand'] != spirit2['brand']:
                similarity = similarity_score(norm1, norm2)
                if similarity > 0.85:  # High similarity threshold
                    cross_brand_matches.append({
                        'spirit1': spirit1,
                        'spirit2': spirit2,
                        'similarity': similarity,
                        'normalized1': norm1,
                        'normalized2': norm2
                    })
    
    # Identify specific duplicate patterns
    for spirit in spirits:
        name = spirit['name']
        
        # Size variants
        if re.search(r'\b(sample|miniature|magnum|traveler|50ml|375ml|1L|1\.75L)\b', name, re.IGNORECASE):
            pattern_duplicates['size_variants'].append(spirit)
        
        # Marketing text
        if re.search(r'(order.*online|ratings.*reviews|lowest.*prices|gift.*box)', name, re.IGNORECASE):
            pattern_duplicates['marketing_variants'].append(spirit)
        
        # Year variants
        if re.search(r'\b20\d{2}\b', name):
            pattern_duplicates['year_variants'].append(spirit)
        
        # Proof variants
        if re.search(r'\b\d+\s*(proof|pf)\b', name, re.IGNORECASE):
            pattern_duplicates['proof_variants'].append(spirit)
    
    # Find type mismatches (same product, different type classification)
    for brand, brand_spirits in brand_groups.items():
        # Group by core name (without type indicators)
        core_name_groups = defaultdict(list)
        for spirit in brand_spirits:
            # Remove type indicators from name
            core_name = re.sub(r'\b(bourbon|rye|whiskey|scotch|single malt|vodka|gin|rum)\b', '', 
                              spirit['name'], flags=re.IGNORECASE)
            core_name = normalize_name_aggressive(core_name)
            if core_name:  # Only if there's still a name after removing type
                core_name_groups[core_name].append(spirit)
        
        for core_name, group in core_name_groups.items():
            types = set(s['type'] for s in group)
            if len(types) > 1 and len(group) > 1:
                pattern_duplicates['type_mismatches'].append({
                    'core_name': core_name,
                    'spirits': group,
                    'types': list(types)
                })
    
    return {
        'brand_duplicates': dict(brand_duplicates),
        'cross_brand_matches': cross_brand_matches,
        'pattern_duplicates': pattern_duplicates
    }


def print_comprehensive_analysis(csv_file: str):
    """Print comprehensive duplicate analysis."""
    spirits = []
    
    # Read CSV file
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            spirits.append(row)
    
    print(f"Total spirits in file: {len(spirits)}")
    print("=" * 80)
    
    # Get all duplicate patterns
    patterns = find_all_duplicate_patterns(spirits)
    
    # 1. Within-brand duplicates
    print("\n## WITHIN-BRAND DUPLICATES ##\n")
    total_brand_duplicates = 0
    for brand, duplicates in patterns['brand_duplicates'].items():
        duplicate_count = sum(len(d['spirits']) for d in duplicates)
        total_brand_duplicates += duplicate_count
        
        print(f"\n{brand}: {duplicate_count} duplicates in {len(duplicates)} groups")
        for dup in duplicates[:2]:  # Show first 2 groups
            print(f"  '{dup['normalized_name']}':")
            for spirit in dup['spirits']:
                print(f"    - {spirit['name']}")
    
    # 2. Cross-brand matches
    print("\n\n## POTENTIAL CROSS-BRAND DUPLICATES ##\n")
    if patterns['cross_brand_matches']:
        print(f"Found {len(patterns['cross_brand_matches'])} potential cross-brand matches:\n")
        for match in patterns['cross_brand_matches'][:5]:  # Show first 5
            print(f"Similarity: {match['similarity']:.2%}")
            print(f"  1. {match['spirit1']['brand']}: {match['spirit1']['name']}")
            print(f"  2. {match['spirit2']['brand']}: {match['spirit2']['name']}")
            print()
    else:
        print("No cross-brand duplicates found.")
    
    # 3. Pattern-based analysis
    print("\n## DUPLICATE PATTERNS ##\n")
    
    for pattern_type, spirits_list in patterns['pattern_duplicates'].items():
        if pattern_type == 'type_mismatches':
            if spirits_list:
                print(f"\n{pattern_type.replace('_', ' ').title()} ({len(spirits_list)} groups):")
                for mismatch in spirits_list[:3]:
                    print(f"  Core product: '{mismatch['core_name']}'")
                    print(f"  Types found: {', '.join(mismatch['types'])}")
                    for spirit in mismatch['spirits'][:2]:
                        print(f"    - {spirit['name']} (Type: {spirit['type']})")
        else:
            if spirits_list:
                print(f"\n{pattern_type.replace('_', ' ').title()} ({len(spirits_list)} items):")
                # Group by brand and base name
                brand_examples = defaultdict(list)
                for spirit in spirits_list:
                    brand_examples[spirit['brand']].append(spirit['name'])
                
                for brand, names in list(brand_examples.items())[:3]:
                    print(f"  {brand}:")
                    for name in names[:2]:
                        print(f"    - {name}")
    
    # 4. Summary statistics
    print("\n\n## SUMMARY STATISTICS ##\n")
    
    # Calculate unique spirits after deduplication
    all_duplicate_ids = set()
    
    # Add within-brand duplicates
    for duplicates in patterns['brand_duplicates'].values():
        for dup_group in duplicates:
            # Keep first, mark rest as duplicates
            for spirit in dup_group['spirits'][1:]:
                all_duplicate_ids.add(spirit['id'])
    
    unique_count = len(spirits) - len(all_duplicate_ids)
    
    print(f"Total spirits: {len(spirits)}")
    print(f"Within-brand duplicates: {total_brand_duplicates}")
    print(f"Unique spirits (after deduplication): {unique_count}")
    print(f"Duplicate rate: {len(all_duplicate_ids) / len(spirits) * 100:.1f}%")
    
    # Brand distribution
    brand_counts = Counter(s['brand'] for s in spirits)
    print(f"\nBrand distribution:")
    for brand, count in brand_counts.most_common(5):
        print(f"  {brand}: {count} products")
    
    # Type distribution
    type_counts = Counter(s['type'] for s in spirits)
    print(f"\nType distribution:")
    for spirit_type, count in type_counts.most_common():
        print(f"  {spirit_type}: {count}")
    
    # Save comprehensive report
    with open('duplicate_analysis_comprehensive.json', 'w') as f:
        # Convert to serializable format
        report_data = {
            'total_spirits': len(spirits),
            'unique_spirits': unique_count,
            'duplicate_rate': len(all_duplicate_ids) / len(spirits) * 100,
            'within_brand_duplicates': total_brand_duplicates,
            'cross_brand_matches': len(patterns['cross_brand_matches']),
            'pattern_statistics': {
                pattern: len(spirits_list) if pattern != 'type_mismatches' 
                        else len(spirits_list)
                for pattern, spirits_list in patterns['pattern_duplicates'].items()
            }
        }
        json.dump(report_data, f, indent=2)
    
    print("\n\nComprehensive report saved to: duplicate_analysis_comprehensive.json")


if __name__ == '__main__':
    print_comprehensive_analysis('test-spirits.csv')