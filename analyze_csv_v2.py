#!/usr/bin/env python3

import csv
import sys
import re
from collections import Counter

def analyze_csv_v2(filepath):
    """Enhanced CSV analysis for V2.6.4 improvements"""
    
    # Categories of problematic content
    article_keywords = [
        'Announces', 'Says', 'Responds To', 'To Host', 'Partnership', 
        'Is Back', 'Accusations', 'To Become', "Game Day's", 'Playing Politics',
        'Tours And Tastings', 'Historic Bourbon Tours', 'Heritage'
    ]
    
    store_keywords = [
        'Add To Cart', 'Tagged', 'Our Products', 'Program', 'Membership',
        "Lisa's Liquor Barn", 'Nc Abcc', 'Vine Republic', 'Applejack',
        'Paragon', 'Unicorn Auctions', 'Store Pick'
    ]
    
    broken_spacing_patterns = [
        r'Sma Ll', r'E Lijah', r'Ba Ller', r'Ma Lt', r'Cast Le',
        r'Annua L', r'O Ld', r'(\w) (\w{1,2})\b'
    ]
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        spirits = list(reader)
    
    print(f"=== V2.6.4 ANALYSIS OF {len(spirits)} SPIRITS ===\n")
    
    # 1. Article/News Content
    print("=== ARTICLE/NEWS CONTENT (SHOULD BE REJECTED) ===")
    article_count = 0
    for spirit in spirits:
        name = spirit.get('name', '')
        if any(kw in name for kw in article_keywords):
            article_count += 1
            print(f"❌ {name}")
    print(f"Total: {article_count} article/news entries\n")
    
    # 2. Store/Program Content
    print("=== STORE/PROGRAM CONTENT (SHOULD BE REJECTED) ===")
    store_count = 0
    for spirit in spirits:
        name = spirit.get('name', '')
        if any(kw in name for kw in store_keywords):
            store_count += 1
            print(f"❌ {name}")
    print(f"Total: {store_count} store/program entries\n")
    
    # 3. Broken Spacing
    print("=== BROKEN SPACING ISSUES ===")
    spacing_count = 0
    for spirit in spirits:
        name = spirit.get('name', '')
        for pattern in broken_spacing_patterns:
            if re.search(pattern, name):
                spacing_count += 1
                print(f"❌ {name}")
                break
    print(f"Total: {spacing_count} names with broken spacing\n")
    
    # 4. Generic/Incomplete Names
    print("=== GENERIC/INCOMPLETE NAMES ===")
    generic_count = 0
    generic_patterns = [
        r'^Bourbon Whiskey$',
        r'^Whiskey$',
        r'^Bourbon$',
        r'^\d+ Year',  # Names starting with just a number
        r'\. Over$',  # Truncated names
        r'^B&e ',  # Unclear abbreviations
        r'^Current ',  # Current something
    ]
    for spirit in spirits:
        name = spirit.get('name', '')
        if any(re.match(pattern, name) for pattern in generic_patterns):
            generic_count += 1
            print(f"❌ {name}")
    print(f"Total: {generic_count} generic/incomplete names\n")
    
    # 5. Type Classification Issues
    print("=== TYPE CLASSIFICATION ISSUES ===")
    type_counter = Counter()
    other_count = 0
    for spirit in spirits:
        spirit_type = spirit.get('type', '')
        type_counter[spirit_type] += 1
        if spirit_type == 'Other':
            other_count += 1
    
    print("Type distribution:")
    for type_name, count in type_counter.most_common():
        print(f"  {type_name}: {count}")
    print(f"\n{other_count} spirits marked as 'Other' - many should have specific types\n")
    
    # 6. Non-Spirit Products
    print("=== NON-SPIRIT PRODUCTS ===")
    non_spirit_keywords = ['Cream Liqueur', 'Liqueur', 'Tours', 'Tastings', 'Program']
    non_spirit_count = 0
    for spirit in spirits:
        name = spirit.get('name', '')
        if any(kw in name for kw in non_spirit_keywords):
            non_spirit_count += 1
            print(f"❌ {name}")
    print(f"Total: {non_spirit_count} non-spirit products\n")
    
    # 7. Quality Score Analysis
    print("=== QUALITY SCORE ANALYSIS ===")
    scores = []
    for spirit in spirits:
        score = spirit.get('data_quality_score', '')
        if score and score.isdigit():
            scores.append(int(score))
    
    if scores:
        avg_score = sum(scores) / len(scores)
        print(f"Average quality score: {avg_score:.1f}")
        print(f"Min: {min(scores)}, Max: {max(scores)}")
        print(f"Below 50: {len([s for s in scores if s < 50])} ({len([s for s in scores if s < 50])/len(scores)*100:.1f}%)")
        print(f"Above 80: {len([s for s in scores if s >= 80])} ({len([s for s in scores if s >= 80])/len(scores)*100:.1f}%)")
    
    # 8. Summary of Issues
    print("\n=== SUMMARY OF MAJOR ISSUES ===")
    total_problematic = article_count + store_count + spacing_count + generic_count + non_spirit_count
    print(f"Total problematic entries: {total_problematic} out of {len(spirits)} ({total_problematic/len(spirits)*100:.1f}%)")
    print(f"- Articles/News: {article_count}")
    print(f"- Store/Program content: {store_count}")
    print(f"- Broken spacing: {spacing_count}")
    print(f"- Generic/Incomplete: {generic_count}")
    print(f"- Non-spirit products: {non_spirit_count}")
    
    # 9. Examples of GOOD entries (for reference)
    print("\n=== EXAMPLES OF GOOD ENTRIES ===")
    good_examples = []
    for spirit in spirits:
        name = spirit.get('name', '')
        score = spirit.get('data_quality_score', '')
        
        # Check if it's a good entry
        is_good = True
        if any(kw in name for kw in article_keywords + store_keywords + non_spirit_keywords):
            is_good = False
        if any(re.search(pattern, name) for pattern in broken_spacing_patterns):
            is_good = False
        if any(re.match(pattern, name) for pattern in generic_patterns):
            is_good = False
        
        if is_good and score and int(score) >= 80:
            good_examples.append((name, score))
    
    print(f"Found {len(good_examples)} good entries with score >= 80:")
    for name, score in good_examples[:10]:
        print(f"✅ {name} (score: {score})")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        analyze_csv_v2(sys.argv[1])
    else:
        analyze_csv_v2("/Users/eliasbouzeid/Downloads/spirits_rows (34).csv")