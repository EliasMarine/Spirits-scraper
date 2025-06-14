# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT**: Always reference `docs/CLAUDE_LEARNINGS.md` before responding to queries to avoid repeated mistakes and apply learned best practices.

## 🚨 CRITICAL: ALWAYS TEST BEFORE DECLARING COMPLETE 🚨
**You MUST thoroughly test ALL implementations before telling the user they are complete. This includes:**
- Running the code with various test cases
- Verifying all features work as expected
- Checking for edge cases and error handling
- Ensuring no regression of existing functionality
- Testing with real data when possible

**NEVER** claim something is "done" or "complete" without actually testing it. If you haven't tested, say "I've implemented the changes, let me test them now" or similar.

## 🚨 HIGH IMPORTANCE - SCRAPER FIXES DOCUMENTATION 🚨
**CRITICAL**: When working on the spirits scraper, you MUST check these documents FIRST:
- `docs/V2.6-FIXES.md` - **MOST IMPORTANT** - Latest V2.6 issues, emergency fixes, and current state
- `docs/V2.5.6_FIXES_SUMMARY.md` - Contains all critical fixes for data quality issues
- `docs/V2.5.7-FIXES.md` - Previous improvements (now superseded by V2.6)
- `docs/CATALOG_SCRAPER_ISSUES.md` - Known issues and their solutions

These documents contain essential information about:
- ✅ What has been fixed (don't re-implement)
- ❌ What issues existed (don't reintroduce)
- 🎯 What improvements are planned (build upon these)
- 📊 Quality metrics and testing approaches

**ALWAYS** review these documents before making ANY changes to the scraper to ensure you're building on top of existing improvements rather than undoing them.

## 📁 HIGH IMPORTANCE - FILE ORGANIZATION 📁
**CRITICAL**: All documentation and SQL files MUST be placed in their designated directories:
- **Documentation files (`.md`)**: Place ALL markdown files in `/docs/` directory
  - Example: `/docs/V2.5.7-FIXES.md`, `/docs/CLAUDE_LEARNINGS.md`
  - NEVER place .md files in the root directory (except CLAUDE.md and README.md)
- **SQL scripts (`.sql`)**: Place ALL SQL files in `/sql-scripts/` directory
  - Example: `/sql-scripts/clear-bad-v2.5.6-data.sql`
  - NEVER place .sql files in the root directory or other locations

This organization ensures:
- Easy discovery of documentation and scripts
- Clean project root directory
- Consistent file structure across the project
- Better git history tracking

## Mem0 Integration (Claude Code Development Tool Only)
**IMPORTANT**: Mem0 is configured ONLY as a development tool for Claude Code to maintain persistent memory across sessions. It is NOT part of the project code and should NEVER be integrated into the frontend or scraper applications.

The `.mem0-config.json` file (gitignored) contains the API key for Claude Code's use only. See `MEM0_CLAUDE_CODE_ONLY.md` for details about what mem0 remembers from previous sessions.

## Project Structure

This is a monorepo containing:
- `spirits-frontend/` - Next.js 15 frontend application with admin dashboard
- `spirits-scraper/` - Node.js scraper using Google Search API
- `supabase/migrations/` - PostgreSQL database schema and functions

## Essential Commands

### Frontend Development
```bash
cd spirits-frontend
npm run dev          # Start dev server at localhost:3000 with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test:a11y    # Accessibility testing
```

### Scraper Operations (Simplified - Enhanced Features Built-in)
```bash
cd spirits-scraper

# MAIN COMMANDS (All enhanced features enabled by default)
npm run scrape -- --categories bourbon --limit 50     # Smart scraping
npm run scrape -- --categories "bourbon,whiskey,scotch" --limit 200  # Multiple categories
npm run scrape -- --distillery buffalo-trace --limit 50  # Distillery-specific
npm run scrape -- --discover --limit 100              # Autonomous discovery mode

npm run dedup                                          # Auto-merge duplicates
npm run dedup -- --dry-run                            # Preview duplicates first

npm run backup                                         # Create backup
npm run backup -- --list                               # List backups
npm run backup -- --restore <id>                       # Restore backup

npm run stats                                          # View statistics & quality metrics
npm run fix-csv input.csv output.csv                   # Fix existing CSV data

# Testing
npm run test                                           # Test enhanced features
```

### Database Operations
When running deduplication, always run with `--dry-run` first to preview changes.

**Important**: All Supabase SQL migration scripts must be "unionized" (unified) to run as a single script in the Supabase SQL Editor. This means:
- Wrap the entire script in DO blocks for progress tracking
- Include cleanup of existing objects to avoid conflicts
- Add verification at the end to confirm complete execution
- Use RAISE NOTICE for progress updates throughout the script

## Architecture Overview

### Frontend Architecture
- **App Router** structure with route groups for `/admin`, `/dashboard`, `/api`
- **API Routes** in `app/api/` handle CRUD operations and external integrations
- **React Query** for data fetching with caching strategies in `hooks/queries/`
- **Supabase Auth** integration with RLS policies for security
- **Redis caching** via Upstash for performance optimization
- **Design System** inspired by luxury silk fabric with glass morphism effects (see Design Style Guide below)

### Scraper Architecture
- **Service-based design** in `src/services/`:
  - `spirit-extractor.ts` - Parses search results and extracts structured data with priority-based type detection
  - `spirit-discovery.ts` - Extracts actual spirit names from search results (NOT search queries)
  - `deduplication-service.ts` - Fuzzy matching with attribute extraction
  - `autonomous-discovery.ts` - Self-learning query generation
  - `batch-processor.ts` - Concurrent processing with rate limiting and real-time quality metrics
  - `text-processor.ts` - Advanced text normalization, validation, and age statement filtering
  - `brand-normalization.ts` - Standardizes brand names across entries
  - `data-validator.ts` - Validates data with duplicate description detection and volume normalization
  - `content-parser.ts` - Enhanced price extraction and review fragment filtering
  - `enhanced-query-generator.ts` - Generates optimized search queries
- **Domain filtering**:
  - `config/reputable-domains.ts` - 152 trusted spirit retailers
  - `config/excluded-domains.ts` - Social media and forum exclusions
  - `config/distilleries.ts` - Distillery-specific scraping configurations
- **Caching layer** prevents duplicate API calls
- **Backup system** for data safety before major operations

### Database Schema
- **spirits** table with brand normalization
- **duplicate_matches** table for deduplication workflow
- **user_profiles** extends Supabase auth with usage tracking
- RLS policies enforce admin-only access for modifications

## Critical Implementation Details

### Spirit Discovery vs Search Queries
**CRITICAL**: The scraper extracts actual spirit names from search results, NOT the search queries themselves:
- ✅ Correct: "Four Roses Limited Edition Small Batch 2024"
- ❌ Wrong: "budget wheated bourbon whiskey" (search query)
- The `spirit-discovery.ts` service ensures only real product names are stored

### Enhanced Text Processing & Data Extraction (Now Built-in)
Every scrape automatically includes:

**Smart Name Parsing**:
- Fixes: "Unc Le Nearest" → "Uncle Nearest", "Henry Mc Kenna" → "Henry McKenna"
- Removes volume info, fixes concatenated text ("JackDaniels12YearOld")
- Handles edition names, batch numbers, vintage years

**Comprehensive Data Extraction**:
- **ABV & Proof** - Distinguishes from mash bill percentages
- **Age Statement** - Validates ages, filters company history
- **Region** - Kentucky, Tennessee, Highland, Speyside, etc.
- **Cask Type** - Ex-Bourbon, Sherry, Port, Mizunara
- **Mash Bill** - Grain composition percentages
- **Distillery & Bottler** - Producer information
- **Whiskey Style** - Bottled-in-Bond, Single Barrel, etc.

**Quality Validation**:
- Description mismatch detection
- Data quality scoring (0-100)
- Review fragment filtering
- Non-spirit item removal

### Enhanced Spirit Type Detection (Now Built-in)
The scraper now automatically detects 20+ spirit types with subcategories:

**Whiskey Types**:
- **Tennessee Whiskey** - Jack Daniel's, George Dickel, Uncle Nearest
- **American Single Malt** - Westland, Balcones, Stranahan's
- **Bourbon** - With whiskey style detection (Bottled-in-Bond, Single Barrel, Small Batch, Cask Strength)
- **Rye Whiskey** - Restrictive detection to avoid false positives
- **Scotch/Irish/Japanese/Canadian** - Regional whiskey types

**Other Spirits**:
- **Tequila** - Blanco, Reposado, Añejo, Extra Añejo, Cristalino
- **Mezcal** - Espadín, Tobalá, Ensamble
- **Rum** - White, Gold, Dark, Spiced, Aged, Overproof, Rhum Agricole
- **Gin** - London Dry, Old Tom, Navy Strength, Contemporary
- **Vodka, Cognac, Brandy, Liqueur** - With subcategories

Priority-based detection ensures accurate classification (95%+ accuracy).

### Domain Filtering Strategy
- **Excluded domains**: Reddit, Facebook, TripAdvisor, and other social media
- **Trusted retailers**: 152 verified spirit sellers including:
  - US: Total Wine, K&L Wines, Seelbach's, Breaking Bourbon
  - UK/EU: The Whisky Exchange, Master of Malt
  - Priority given to domains with structured product data
- Google searches automatically append exclusions: `-site:reddit.com -site:facebook.com` etc.

### Deduplication Algorithm
The deduplication service uses attribute extraction to prevent false positives:
- Extracts age statements, proof, grain types from spirit names
- Applies penalties for mismatched critical attributes
- Uses dynamic brand weighting (15% for same brand, 40% for different brands)

### Google Search API Integration
- Rate limited to 100 queries/day (free tier)
- Implements exponential backoff for rate limit handling
- User agent rotation to avoid bot detection
- Query generation focuses on trusted sites using `site:` operators

### Performance Optimizations
- Frontend uses Redis for search result caching
- Database has optimized indexes for fuzzy search
- Batch processing limits concurrent operations
- Cache cleanup prevents stale data accumulation

## Environment Variables
Both projects require:
- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Scraper additionally needs `GOOGLE_API_KEY` and `SEARCH_ENGINE_ID`

## Testing Approach
- Frontend: Jest for unit tests, Playwright for E2E
- Scraper: Test individual services with `npm run test`
- Always test deduplication with `--dry-run` flag first

## Common Issues and Solutions

### RLS Security Issues
**SECURITY DEFINER Views**: The following views must NOT have SECURITY DEFINER property:
- `recent_scraping_jobs`
- `spirits_search`
- `spirits_view`
- `spirits_with_brands`
- `spirits_with_categories`
- `user_analytics`

**Fix**: Run migration `20250605_ensure_no_security_definer.sql` which removes SECURITY DEFINER from all views. This migration has the latest date to ensure it runs after all other migrations.

### Data Quality Issues
1. **Concatenated text without spaces**: Fixed by `text-processor.ts`
   - Issue: "MckenzieBottledInBond"
   - Solution: Automatic spacing detection and correction

2. **Wrong categories**: Bourbon incorrectly labeled as "Rye Whiskey"
   - Solution: Priority-based category detection (bourbon checked before rye)
   - Rye detection requires explicit "rye whiskey" to avoid false positives
   - Brand-based detection for known bourbon/rye producers
   - Falls back to "whiskey" for ambiguous cases

3. **Invalid ages**: "150 Year" extracted from "150 months"
   - Solution: Age validation (1-50 years typical, up to 100 for premium)
   - Ignores unrealistic ages from random numbers in text

4. **Review fragments as descriptions**: "I love this whiskey! 5 stars!"
   - Solution: Description validation requires product-focused content
   - Filters out reviews, comments, and non-product text

5. **Social media content**: Reddit posts being scraped
   - Solution: Automatic exclusion of social media domains
   - Focus on 152 trusted retailer domains

### Large-Scale Scraping (500+ spirits)
```bash
# Simplified workflow (enhanced features automatic):
npm run backup -- --description "Before large scrape"
npm run scrape -- --categories bourbon --limit 500 --batch-size 5
# Auto-deduplication runs for 50+ spirits
npm run stats  # View quality metrics
```

### Expected Data Quality Metrics
After improvements, expect:
- 95%+ valid spirit names (real products, not search queries)
- 90%+ spirits with properly extracted prices
- 95%+ correct category classification (bourbon vs rye accuracy improved to 85%+)
- 85%+ valid descriptions (product-focused, not reviews)
- < 5% duplicate rate with proper deduplication
- 0% review fragments in descriptions
- 100% normalized volumes (750ml, 1L, etc.)

## Current Branch
Working on `fix/scraper-data-quality-and-frontend-build` - includes:
- Fixed bourbon vs rye categorization issue (many bourbons were incorrectly marked as "Rye Whiskey")
- Priority-based spirit type detection in `spirit-extractor.ts`
- Enhanced text processing and normalization
- Comprehensive brand lists for bourbon and rye producers
- Social media exclusion
- Improved spirit discovery (extracts names, not queries)
- Enhanced deduplication with attribute awareness
- Added distillery mode configuration for specialized scraping

### Latest Improvements (2025-06-02) - All Built-in by Default
- **Smart Type Detection**: 20+ spirit types including Tennessee Whiskey, American Single Malt
- **Enhanced Name Parsing**: Fixes "Unc Le Nearest", "Sma Ll Batch", spacing issues
- **Comprehensive Data Extraction**: ABV, proof, age, region, cask type, mash bill, distillery
- **Whiskey Style Detection**: Bottled-in-Bond, Single Barrel, Small Batch, Cask Strength
- **Description Validation**: Mismatch detection, review filtering
- **Quality Scoring**: Each spirit gets 0-100 quality score
- **Simplified Commands**: Just 5 essential commands (scrape, dedup, backup, stats, fix-csv)
- **Auto-deduplication**: Runs automatically for 50+ spirit batches

**All enhanced features are now built into the main scraper - no separate "enhanced" commands needed!**

## Design Style Guide

### Design Philosophy
The frontend design system is inspired by luxury silk fabric, creating an elegant, fluid, and premium experience that reflects the sophistication of fine spirits. The aesthetic combines smooth animations, subtle depth, and refined typography.

### Core Design Principles

#### 1. Fluid Motion
- Smooth, silk-like animations using spring physics
- Parallax scrolling effects for depth
- Mouse-responsive interactions that feel organic
- Transition durations: 0.3s (quick), 0.5s (standard), 1.2s (dramatic)

#### 2. Layered Depth
- Multiple translucent layers create visual richness
- Gradient overlays with low opacity (10-20%)
- Backdrop blur for glass morphism effects
- Z-index management for proper layer stacking

#### 3. Refined Minimalism
- Clean, spacious layouts with generous whitespace
- Thin to light font weights for elegance
- Subtle borders and dividers
- Focus on content over decoration

### Color System

#### Primary Colors
- Purple: `#9333EA` - Primary brand color
- Pink: `#EC4899` - Accent highlights
- Indigo: `#6366F1` - Secondary accent

#### Glass Morphism Colors
- Background: `from-white/5 to-white/10`
- Borders: `rgba(255, 255, 255, 0.1)`
- Hover borders: `rgba(255, 255, 255, 0.2)`
- Overlays: `rgba(255, 255, 255, 0.05-0.3)`

#### Category Gradients
- Whisky: `from-amber-600 to-yellow-600`
- Bourbon: `from-orange-600 to-red-600`
- Gin: `from-blue-600 to-indigo-600`
- Vodka: `from-gray-600 to-slate-600`
- Rum: `from-purple-600 to-violet-600`

### Typography
- Font family: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Hero headlines: Font weight 100 (thin)
- Body text: Font weight 300 (light)
- Small text/UI: Font weight 400 (normal)
- Emphasis: Font weight 500 (medium) - use sparingly

### Component Patterns

#### Glass Cards
```jsx
<div className="relative overflow-hidden rounded-2xl 
  bg-gradient-to-br from-white/5 to-white/10 
  backdrop-blur-xl border border-white/10 p-8 
  transition-all duration-500 hover:border-white/20">
  {/* Content */}
</div>
```

#### Primary Button
```jsx
<Button className="bg-white text-black rounded-full px-8 py-6 
  font-light hover:scale-105 transition-transform">
  Action
</Button>
```

#### Secondary Button
```jsx
<Button variant="outline" className="border-white/20 text-white 
  backdrop-blur-sm hover:bg-white/10">
  Action
</Button>
```

### Animation Standards
- Spring config: `{ damping: 30, stiffness: 80 }`
- Fade in: `initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}`
- Hover scale: `whileHover={{ scale: 1.02 }}`
- Transition timing: `duration-300` for interactions, `duration-500` for reveals

### Spacing Guidelines
- Section padding: `py-32 px-4` (8rem vertical, 1rem horizontal)
- Content containers: `max-w-7xl` (standard), `max-w-5xl` (hero), `max-w-4xl` (narrow)
- Grid gaps: `gap-8` (2rem) for cards, `gap-6` (1.5rem) for buttons
- Component spacing: `mb-20` (section headers), `mb-12` (large), `mb-6` (medium)

### Implementation Notes
- All components should follow the glass morphism aesthetic
- Use dark theme (black background) as the default
- Ensure minimum contrast ratio of 4.5:1 for accessibility
- Test all animations with reduced motion preferences
- Mobile-first responsive design with simplified animations on small screens

**For complete design documentation including detailed examples, accessibility requirements, and future considerations, see `spirits-frontend/DESIGN_STYLE_GUIDE.md`**