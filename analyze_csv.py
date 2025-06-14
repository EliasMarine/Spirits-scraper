#!/usr/bin/env python3

import csv
import sys
from collections import Counter

def analyze_csv(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        # Collect data
        names = []
        brands = []
        types = []
        quality_scores = []
        proof_abv_mismatch = []
        
        for row in reader:
            names.append(row.get('name', ''))
            brands.append(row.get('brand', ''))
            types.append(row.get('type', ''))
            
            # Check quality score
            score = row.get('data_quality_score', '')
            if score and score.isdigit():
                quality_scores.append(int(score))
            
            # Check proof/ABV mismatch
            abv = row.get('abv', '')
            proof = row.get('proof', '')
            if abv and proof:
                try:
                    abv_val = float(abv)
                    proof_val = float(proof)
                    expected_proof = abv_val * 2
                    if abs(proof_val - expected_proof) > 1:
                        proof_abv_mismatch.append({
                            'name': row.get('name', ''),
                            'abv': abv_val,
                            'proof': proof_val,
                            'expected_proof': expected_proof
                        })
                except:
                    pass
        
        # Analyze issues
        print("=== CSV ANALYSIS ===\n")
        
        print(f"Total entries: {len(names)}")
        print(f"\n=== QUALITY SCORES ===")
        if quality_scores:
            print(f"Average: {sum(quality_scores)/len(quality_scores):.1f}")
            print(f"Min: {min(quality_scores)}")
            print(f"Max: {max(quality_scores)}")
            print(f"Below 50: {len([s for s in quality_scores if s < 50])}")
        
        print(f"\n=== NAME ISSUES ===")
        # Check for broken spacing
        broken_names = [n for n in names if '  ' in n or 'Ll ' in n or 'Ma Lt' in n or 'Ba Ller' in n]
        print(f"Broken spacing: {len(broken_names)}")
        if broken_names:
            print("Examples:")
            for n in broken_names[:5]:
                print(f"  - {n}")
        
        # Check for non-product names
        non_product_keywords = ['Is Back', 'Says', 'Program', 'Membership', 'Our Products', 'Tagged', 
                                'Add To Cart', 'Releasing Its First', "World's Most Admired", 
                                'Kentucky Bourbon Trail', 'All About The', 'Wisdom With']
        non_products = [n for n in names if any(kw in n for kw in non_product_keywords)]
        print(f"\nNon-product names: {len(non_products)}")
        if non_products:
            print("Examples:")
            for n in non_products[:5]:
                print(f"  - {n}")
        
        print(f"\n=== BRAND ISSUES ===")
        brand_counter = Counter(brands)
        print(f"Total unique brands: {len(brand_counter)}")
        print(f"Empty brands: {brand_counter.get('', 0)}")
        print("Most common brands:")
        for brand, count in brand_counter.most_common(10):
            if brand and not brand.isdigit():
                print(f"  - {brand}: {count}")
        
        print(f"\n=== TYPE DISTRIBUTION ===")
        type_counter = Counter(types)
        for type_name, count in type_counter.most_common():
            print(f"  - {type_name}: {count}")
        
        print(f"\n=== PROOF/ABV MISMATCHES ===")
        print(f"Total mismatches: {len(proof_abv_mismatch)}")
        if proof_abv_mismatch:
            print("Examples:")
            for m in proof_abv_mismatch[:5]:
                print(f"  - {m['name']}: ABV={m['abv']}, Proof={m['proof']} (expected {m['expected_proof']:.0f})")

if __name__ == "__main__":
    analyze_csv("/Users/eliasbouzeid/Downloads/spirits_rows (33).csv")