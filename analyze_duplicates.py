import csv
import json
from collections import defaultdict, Counter
from difflib import SequenceMatcher

def similarity(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def normalize_name(name):
    # Remove common variations
    name = name.lower()
    name = name.replace('makers mark', 'maker\'s mark')
    name = name.replace('maker\'s', 'makers')
    name = name.replace('\'', '')
    name = name.replace('-', ' ')
    name = name.replace('kentucky straight bourbon', 'bourbon')
    name = name.replace('whiskey', '')
    name = name.replace('bourbon', '')
    return ' '.join(name.split())

# Read CSV
spirits = []
with open('/Users/eliasbouzeid/Downloads/spirits_rows (14).csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        spirits.append(row)

print(f'Total spirits: {len(spirits)}')
print()

# 1. Count exact duplicates by name
name_counts = Counter(row['name'] for row in spirits)
exact_duplicates = {name: count for name, count in name_counts.items() if count > 1}
print('=== EXACT NAME DUPLICATES ===')
for name, count in sorted(exact_duplicates.items(), key=lambda x: x[1], reverse=True):
    print(f'{count}x: {name}')
print(f'Total exact duplicates: {len(exact_duplicates)}')
print()

# 2. Find similar names (potential duplicates)
print('=== POTENTIAL DUPLICATES (Similar Names) ===')
found_similar = set()
for i in range(len(spirits)):
    for j in range(i+1, len(spirits)):
        if i in found_similar and j in found_similar:
            continue
        name1 = spirits[i]['name']
        name2 = spirits[j]['name']
        
        # Skip if already counted as exact match
        if name1 == name2:
            continue
            
        sim = similarity(name1, name2)
        if sim > 0.7:
            found_similar.add(i)
            found_similar.add(j)
            print(f'Similarity {sim:.2f}:')
            print(f'  - {name1}')
            print(f'  - {name2}')
            print()

# 3. Group by normalized brand/product
print('=== BRAND/PRODUCT GROUPING ===')
brand_groups = defaultdict(list)
for spirit in spirits:
    name = spirit['name']
    # Extract likely brand
    brand_keywords = ['buffalo trace', 'woodford reserve', 'four roses', 'makers mark', 'maker\'s mark', 
                      'wild turkey', 'elijah craig', 'bulleit', 'larceny']
    
    found_brand = None
    for brand in brand_keywords:
        if brand in name.lower():
            found_brand = brand
            break
    
    if found_brand:
        brand_groups[found_brand].append(spirit)

for brand, items in sorted(brand_groups.items(), key=lambda x: len(x[1]), reverse=True):
    if len(items) > 1:
        print(f'{brand.upper()} ({len(items)} variants):')
        for item in items:
            price = item.get('price', 'N/A')
            print(f'  - {item["name"]} - ${price}')
        print()

# 4. Price variations for same products
print('=== SAME PRODUCT, DIFFERENT PRICES ===')
for brand, items in brand_groups.items():
    if len(items) > 1:
        # Group by normalized name within brand
        product_prices = defaultdict(list)
        for item in items:
            norm_name = normalize_name(item['name'])
            if item.get('price'):
                try:
                    price = float(item['price'])
                    product_prices[norm_name].append((item['name'], price, item.get('source_url', '')))
                except:
                    pass
        
        for norm_name, price_list in product_prices.items():
            if len(price_list) > 1:
                prices = [p[1] for p in price_list]
                if max(prices) - min(prices) > 5:  # More than $5 difference
                    print(f'{brand.upper()} - {norm_name}:')
                    for name, price, url in sorted(price_list, key=lambda x: x[1]):
                        print(f'  ${price:.2f} - {name}')
                    print()

# 5. Analyze why fuzzy matching isn't catching these
print('=== FUZZY MATCHING ANALYSIS ===')
print('Current thresholds: nameThreshold=0.7, combinedThreshold=0.6')
print()

# Test some specific pairs
test_pairs = [
    ('Buffalo Trace Bourbon', 'Buffalo Trace Kentucky Straight Bourbon'),
    ('Woodford Reserve Bourbon', 'Woodford Reserve Kentucky Straight Bourbon'),
    ('Makers Mark Bourbon', 'Maker\'s Mark Bourbon'),
    ('Four Roses Bourbon', 'Four Roses Single Barrel Bourbon Oesk')
]

for name1, name2 in test_pairs:
    # Find these in our data
    spirit1 = next((s for s in spirits if s['name'] == name1), None)
    spirit2 = next((s for s in spirits if s['name'] == name2), None)
    
    if spirit1 and spirit2:
        name_sim = similarity(name1, name2)
        
        # Check other attributes
        abv_sim = 1.0
        if spirit1.get('abv') and spirit2.get('abv'):
            try:
                abv1 = float(spirit1['abv'])
                abv2 = float(spirit2['abv'])
                abv_diff = abs(abv1 - abv2)
                abv_sim = max(0, 1 - (abv_diff / 20))  # 20% difference = 0 similarity
            except:
                pass
        
        # Combined score (simplified)
        combined = (name_sim * 0.6) + (abv_sim * 0.2) + 0.2  # Base similarity
        
        print(f'{name1} vs {name2}:')
        print(f'  Name similarity: {name_sim:.3f} (threshold: 0.7)')
        print(f'  ABV similarity: {abv_sim:.3f}')
        print(f'  Combined score: {combined:.3f} (threshold: 0.6)')
        print(f'  Would match: {"YES" if name_sim >= 0.7 and combined >= 0.6 else "NO"}')
        print()

# Calculate actual duplicate rate
unique_products = len(spirits) - sum(count - 1 for count in name_counts.values() if count > 1)
duplicate_rate = (len(spirits) - unique_products) / len(spirits) * 100

print(f'\nSUMMARY:')
print(f'Total spirits: {len(spirits)}')
print(f'Unique products (estimate): {unique_products}')
print(f'Duplicate rate: {duplicate_rate:.1f}%')