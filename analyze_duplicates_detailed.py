#!/usr/bin/env python3
"""
Detailed duplicate analysis for spirits CSV file.
Identifies duplicate patterns, groups by brand and normalized name.
"""

import csv
import re
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Set
import json


def normalize_name(name: str) -> str:
    """Normalize spirit name for comparison."""
    # Convert to lowercase
    normalized = name.lower()
    
    # Remove common suffixes/prefixes that don't affect product identity
    patterns_to_remove = [
        r'\s*-\s*gift\s*box.*$',
        r'\s*-\s*ratings\s*and\s*reviews.*$',
        r'\s*-\s*whiskybase.*$',
        r'\s*-\s*majestic\s*wine.*$',
        r'\s*-\s*star\s*hill\s*farm.*$',
        r'\s*\(lowest\s*prices.*\)$',
        r'\s*the\s*$',
        r'order\s+(.+?)\s+online.*$',
        r'\s*sample$',
        r'\s*miniature$',
        r'\s*magnum$',
        r'\s*traveler$',
        r'dnu\s+',  # "Do Not Use" prefix
        r'\s*pf$',  # Proof abbreviation
        r'\s*\d+ml$',  # Volume
        r'\s*single\s*barrel\s*select$',
    ]
    
    for pattern in patterns_to_remove:
        normalized = re.sub(pattern, '', normalized, flags=re.IGNORECASE)
    
    # Normalize special characters and spacing
    normalized = re.sub(r'[^\w\s-]', ' ', normalized)
    normalized = re.sub(r'\s+', ' ', normalized)
    normalized = normalized.strip()
    
    # Handle specific brand variations
    normalized = normalized.replace('makers mark', 'maker\'s mark')
    normalized = normalized.replace('macallan', 'the macallan')
    
    # Extract key product identifiers
    # Remove year variations for same product (e.g., "2022 release" vs "2025")
    normalized = re.sub(r'\b20\d{2}\b', 'YEAR', normalized)
    
    return normalized


def extract_key_attributes(name: str) -> Dict[str, str]:
    """Extract key attributes from product name."""
    attributes = {}
    
    # Age statement
    age_match = re.search(r'(\d+)\s*year', name, re.IGNORECASE)
    if age_match:
        attributes['age'] = age_match.group(1)
    
    # Proof/ABV
    proof_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:proof|pf)', name, re.IGNORECASE)
    if proof_match:
        attributes['proof'] = proof_match.group(1)
    
    # Cask strength
    if re.search(r'cask\s*strength|barrel\s*proof', name, re.IGNORECASE):
        attributes['cask_strength'] = 'true'
    
    # Special editions
    if re.search(r'limited\s*edition|special\s*release', name, re.IGNORECASE):
        attributes['special_edition'] = 'true'
        
    # Cask type
    cask_match = re.search(r'(sherry|bourbon|port|wine)\s*(?:oak|cask|barrel)', name, re.IGNORECASE)
    if cask_match:
        attributes['cask_type'] = cask_match.group(1).lower()
    
    return attributes


def analyze_duplicates(csv_file: str):
    """Analyze duplicates in the spirits CSV file."""
    spirits = []
    
    # Read CSV file
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            spirits.append(row)
    
    print(f"Total spirits in file: {len(spirits)}")
    print("=" * 80)
    
    # Group by brand
    brand_groups = defaultdict(list)
    for spirit in spirits:
        brand_groups[spirit['brand']].append(spirit)
    
    # Analyze duplicates within each brand
    duplicate_groups = defaultdict(list)
    all_duplicates = []
    
    for brand, brand_spirits in brand_groups.items():
        # Group by normalized name within brand
        name_groups = defaultdict(list)
        for spirit in brand_spirits:
            normalized = normalize_name(spirit['name'])
            name_groups[normalized].append(spirit)
        
        # Find duplicates
        for normalized_name, group in name_groups.items():
            if len(group) > 1:
                duplicate_groups[brand].append({
                    'normalized_name': normalized_name,
                    'spirits': group,
                    'count': len(group)
                })
                all_duplicates.extend(group)
    
    # Print detailed analysis
    print("\n## DUPLICATE ANALYSIS BY BRAND ##\n")
    
    total_duplicates = 0
    for brand in sorted(duplicate_groups.keys()):
        groups = duplicate_groups[brand]
        brand_duplicate_count = sum(g['count'] for g in groups)
        total_duplicates += brand_duplicate_count
        
        print(f"\n### {brand} ###")
        print(f"Total products: {len(brand_groups[brand])}")
        print(f"Duplicate products: {brand_duplicate_count}")
        print(f"Unique duplicate groups: {len(groups)}")
        
        for group in groups:
            print(f"\n  Normalized: '{group['normalized_name']}' ({group['count']} duplicates)")
            for spirit in group['spirits']:
                print(f"    - {spirit['name']} (Type: {spirit['type']}, ABV: {spirit['abv']}%)")
    
    # Overall statistics
    print("\n" + "=" * 80)
    print("\n## OVERALL STATISTICS ##\n")
    print(f"Total spirits: {len(spirits)}")
    print(f"Total duplicate spirits: {len(all_duplicates)}")
    print(f"Unique spirits (after deduplication): {len(spirits) - len(all_duplicates) + len(duplicate_groups)}")
    print(f"Duplicate rate: {len(all_duplicates) / len(spirits) * 100:.1f}%")
    
    # Brand statistics
    print(f"\nBrands with duplicates: {len(duplicate_groups)} out of {len(brand_groups)}")
    
    # Type distribution in duplicates
    type_counter = Counter(spirit['type'] for spirit in all_duplicates)
    print("\nDuplicate distribution by type:")
    for spirit_type, count in type_counter.most_common():
        print(f"  - {spirit_type}: {count}")
    
    # Common duplicate patterns
    print("\n## COMMON DUPLICATE PATTERNS ##\n")
    
    # Analyze name patterns that lead to duplicates
    pattern_examples = {
        'Marketing text': ['online', 'ratings and reviews', 'whiskybase'],
        'Size variations': ['miniature', 'magnum', 'sample', 'traveler'],
        'Retailer info': ['majestic wine', 'star hill farm'],
        'Minor variations': ['pf vs proof', 'single barrel vs single barrel select'],
        'Year releases': ['2022 release', '2025']
    }
    
    for pattern_type, keywords in pattern_examples.items():
        matches = []
        for brand_duplicates in duplicate_groups.values():
            for group in brand_duplicates:
                for spirit in group['spirits']:
                    name_lower = spirit['name'].lower()
                    if any(keyword in name_lower for keyword in keywords):
                        matches.append(spirit['name'])
                        break
        
        if matches:
            print(f"\n{pattern_type} ({len(matches)} cases):")
            for match in matches[:3]:  # Show first 3 examples
                print(f"  - {match}")
    
    # Exact duplicates vs variations
    print("\n## DUPLICATE TYPES ##\n")
    
    exact_duplicates = 0
    variation_duplicates = 0
    
    for brand_duplicates in duplicate_groups.values():
        for group in brand_duplicates:
            spirits_in_group = group['spirits']
            # Check if all have same type and ABV
            types = set(s['type'] for s in spirits_in_group)
            abvs = set(s['abv'] for s in spirits_in_group)
            
            if len(types) == 1 and len(abvs) == 1:
                exact_duplicates += len(spirits_in_group)
            else:
                variation_duplicates += len(spirits_in_group)
    
    print(f"Exact duplicates (same type & ABV): {exact_duplicates}")
    print(f"Variation duplicates (different type or ABV): {variation_duplicates}")
    
    # Save detailed report
    report = {
        'total_spirits': len(spirits),
        'total_duplicates': len(all_duplicates),
        'duplicate_rate': len(all_duplicates) / len(spirits) * 100,
        'brands_with_duplicates': len(duplicate_groups),
        'total_brands': len(brand_groups),
        'duplicate_groups': {}
    }
    
    for brand, groups in duplicate_groups.items():
        report['duplicate_groups'][brand] = [
            {
                'normalized_name': g['normalized_name'],
                'count': g['count'],
                'spirits': [
                    {
                        'id': s['id'],
                        'name': s['name'],
                        'type': s['type'],
                        'abv': s['abv']
                    }
                    for s in g['spirits']
                ]
            }
            for g in groups
        ]
    
    with open('duplicate_analysis_detailed_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n\nDetailed report saved to: duplicate_analysis_detailed_report.json")


if __name__ == '__main__':
    analyze_duplicates('test-spirits.csv')