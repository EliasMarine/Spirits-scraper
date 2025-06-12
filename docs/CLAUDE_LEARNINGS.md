# Claude Code Learning Log

This file tracks learnings and mistakes to avoid for better development practices. It should be updated after each interaction and referenced before responding to queries.

**⚠️ CRITICAL RECURRING ISSUES TO ALWAYS CHECK:**
1. **NEVER use RAISE NOTICE in Supabase SQL** - See Learnings 1, 34, 47
2. **Always check package.json before importing** - See Learning 45
3. **Supabase SQL Editor requires SINGLE UNIONIZED SCRIPTS** - See Learnings 1, 49 - NO SEPARATE QUERIES!

## Quick Reference - Common Issues

### Supabase SQL
- **RAISE NOTICE doesn't work** - Use result sets instead (Learning 1, 34, 47)
- **DO blocks with nested $$** - Move functions outside DO blocks (Learning 36)
- **Partial migrations** - Check all functions exist, not just tables (Learning 35, 38)
- **Function overloads** - Drop all versions before recreating (Learning 39)
- **Column name mismatches** - Verify actual table structure (Learning 40)

### Next.js 15
- **Route params are Promises** - Use `await params` (Learning 2)
- **Dynamic routes with middleware** - Use closure pattern for params access (Learning 38)
- **Client/server separation** - Don't import server modules in client components (Learning 30)
- **cookies() is async** - Must await it (Learning 29)
- **Missing dependencies** - Check package.json before importing (Learning 45)

### TypeScript
- **Optional chaining** - Always use `?.` for potentially undefined objects (Learning 6)
- **Object.entries types** - Add type assertions for values (Learning 18)
- **Nullable returns** - Check for null before using (Learning 31)

### API Development
- **Auth middleware 404s** - Check if middleware is failing (Learning 33)
- **Environment variables** - No quotes in production (Learning 32)
- **Client-side initialization** - Use lazy loading for server dependencies (Learning 28)
- **Database schema mismatches** - Always verify column names match between code and DB (Learning 40)

## Detailed Learnings

### Session: 2024-01-06

#### Learning 1: Supabase SQL Script Requirements
**Context**: User needed database enumeration script for Supabase
**Mistake**: Initially created script with multiple DO blocks that don't execute properly in Supabase SQL Editor
**Learning**: 
- Supabase SQL Editor requires unified scripts in a single DO block
- RAISE NOTICE outputs don't display in the UI - need to return actual query results
- Variables must be declared in DECLARE section before BEGIN

**Will Avoid**:
- Breaking SQL scripts into multiple DO blocks for Supabase
- Using RAISE NOTICE as primary output method
- Using variables without declaring them first

#### Learning 2: Next.js 15 Route Parameters
**Context**: Vercel build error with API route parameters
**Mistake**: Used old Next.js route parameter syntax without Promise wrapper
**Learning**:
- Next.js 15 wraps route params in Promises
- Must use `params: Promise<{ id: string }>` and `await params`
- This applies to all dynamic route segments

**Will Avoid**:
- Using synchronous params access in Next.js 15 routes
- Not checking Next.js version before implementing route handlers

#### Learning 3-5: Code Quality Issues
**Learning 3**: JSX comments in multi-line comments cause syntax errors
**Learning 4**: Git file paths with special characters need quotes
**Learning 5**: Database migrations need data validation before constraints

#### Learning 6-7: TypeScript Safety
**Learning 6**: Always use optional chaining (`?.`) for potentially undefined objects
**Learning 7**: Use null coalescing (`??`) before calling methods on API response properties

#### Learning 8-16: UI and Architecture Patterns
**Learning 8**: UI components must match design system (pill-shaped toggles)
**Learning 9**: Supabase RLS - avoid SECURITY DEFINER views
**Learning 10**: Use dynamic schema discovery in migrations
**Learning 11**: Later migrations can undo earlier fixes
**Learning 12**: Explicitly set SECURITY INVOKER on views
**Learning 13**: Functions need SET search_path
**Learning 14-15**: API authentication system patterns
**Learning 16**: Toggle switch design specifications

#### Learning 17-27: Build and Type Errors
**Learning 17**: Check component interfaces before passing props
**Learning 18**: Object.entries needs type assertions
**Learning 19**: Upstash uses specific Duration type
**Learning 20**: Async Supabase client in server components
**Learning 21**: Variable scoping and duplicate declarations
**Learning 22**: Production environment variables
**Learning 23**: API error handling
**Learning 24**: API route path consistency
**Learning 25**: Select.Item can't have empty string values
**Learning 26**: Production deployment checklist
**Learning 27**: Documentation security patterns

#### Learning 28-35: Critical Production Issues
**Learning 28**: Client-side vs server-side module initialization
**Learning 29**: API error debugging patterns
**Learning 30**: Next.js client/server module separation
**Learning 31**: TypeScript nullable return types
**Learning 32**: Upstash Redis environment variables (no quotes!)
**Learning 33**: API route 404s from auth middleware failures
**Learning 34**: Supabase SQL Editor RAISE NOTICE limitations
**Learning 35**: Debugging API authentication system failures

### Session: 2025-06-03

#### Learning 36: SQL Function Creation Inside DO Blocks
**Context**: User got "syntax error at or near DECLARE" when running API key permissions migration
**Mistake**: Created a function with $$ delimiters inside a DO block that also used $$ delimiters
**Learning**:
- CREATE FUNCTION statements with their own $$ delimiters cannot be nested inside DO blocks
- PostgreSQL gets confused by the nested delimiter scopes
- Move function creation outside the DO block to avoid syntax errors

**Solution Pattern**:
```sql
-- BAD - Function inside DO block
DO $$
BEGIN
    -- policies...
    CREATE OR REPLACE FUNCTION foo() AS $$ ... $$;  -- Error!
END $$;

-- GOOD - Function outside DO block  
DO $$
BEGIN
    -- policies...
END $$;

CREATE OR REPLACE FUNCTION foo() AS $$ ... $$;  -- Works!
```

**Will Avoid**:
- Nesting $$ delimited statements inside other $$ delimited blocks
- Creating functions inside DO blocks
- Mixing delimiter scopes in SQL scripts

#### Learning 37: API Key Access for Non-Admin Users
**Context**: Critical business model issue - only admins could create API keys
**Mistake**: Initial API implementation restricted API key creation to admin users only
**Learning**:
- For a paid API service, ALL users need to create API keys, not just admins
- RLS policies should allow users to manage their own resources
- Business model requirements must drive technical decisions

**Implementation Pattern**:
```sql
-- Allow users to manage their own API keys
CREATE POLICY "Users can view their own api_keys" ON api_keys
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Remove admin checks from functions
-- v_is_admin check removed from generate_api_key function
```

**Will Follow**:
- Consider business model implications when implementing features
- Default to user self-service for resource management
- Only restrict to admins for true administrative functions

#### Learning 38: API Middleware with Dynamic Route Parameters
**Context**: Vercel build error "Target signature provides too few arguments" in dynamic API routes
**Mistake**: Applied withApiAuth middleware to handlers that needed access to Next.js route params
**Learning**:
- withApiAuth expects handlers with signature `(request, authContext) => Promise<NextResponse>`
- Dynamic routes need access to params which come as a separate parameter in Next.js
- Use closure pattern: define handler inside the route function to access params

**Solution Pattern**:
```typescript
// BAD - Middleware can't handle the params parameter
async function handler(request, authContext, { params }) {
  const { id } = await params;
  // ...
}
export const POST = withApiAuth(handler); // Type error!

// GOOD - Use closure to access params
export async function POST(request, { params }) {
  const handler = async (request, authContext) => {
    const { id } = await params; // Access via closure
    // ...
  };
  const authenticatedHandler = withApiAuth(handler);
  return authenticatedHandler(request);
}
```

**Will Avoid**:
- Passing route params as handler parameters when using middleware
- Forgetting that middleware signatures are fixed
- Not using closure patterns for accessing outer scope variables

#### Learning 39: PostgreSQL Function Overload Conflicts
**Context**: Non-admin users getting 500 error when creating API keys despite correct policies
**Mistake**: Multiple versions of generate_api_key function with different signatures existed
**Learning**:
- PostgreSQL allows function overloading (same name, different parameters)
- When calling an overloaded function, PostgreSQL might choose the wrong version
- This can cause parameter mismatch errors that appear as generic 500 errors

**Solution Pattern**:
```sql
-- Drop ALL versions of the function before recreating
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT p.oid::regprocedure as func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'function_name'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.func_signature || ' CASCADE';
    END LOOP;
END $$;
```

**Will Avoid**:
- Assuming CREATE OR REPLACE will handle all overloads
- Not checking for multiple function versions when debugging
- Creating functions without cleaning up old versions first

#### Learning 40: Database Column Name Verification
**Context**: API key creation failing with 500 error even after fixing function overloads
**Mistake**: Function was inserting into 'key_preview' column but table had 'key_prefix'
**Learning**:
- Always verify actual database schema matches your code
- Column name mismatches cause silent failures that appear as 500 errors
- Use information_schema to check actual table structure

**Debugging Pattern**:
```sql
-- Always check actual table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'your_table'
ORDER BY ordinal_position;
```

**Will Follow**:
- Check actual database schema before assuming column names
- Use information_schema queries when debugging database issues
- Test functions with simple INSERT statements first
- Return aliased column names when API expects different names

## Patterns to Follow

### SQL Patterns
1. **SINGLE UNIONIZED SCRIPTS ONLY** - Supabase executes only the FIRST statement!
2. Return result sets in Supabase, NEVER use RAISE NOTICE (emphasized due to recurring issue)
3. Use temp tables and SELECT statements for migration progress output
4. Keep functions outside DO blocks to avoid delimiter conflicts
5. Use dynamic schema discovery for robust migrations
6. Always include fallbacks for extension functions
7. Drop all function overloads before recreating functions
8. Verify column names match between functions and tables
9. ALWAYS wrap multiple operations in DO block with temp table for results

### Next.js Patterns
1. Always await route params in Next.js 15
2. Use closure pattern for dynamic routes with middleware
3. Separate client and server code strictly
4. Use lazy loading for server-only dependencies
5. Create API routes when client needs server data

### Security Patterns
1. Enable RLS on all public tables
2. Allow users to manage their own resources by default
3. Use SECURITY INVOKER for views unless DEFINER is required
4. Hash API keys before storage, return full key only once

### Testing Patterns
1. Check environment variables are set correctly (no quotes!)
2. Test API endpoints with proper authentication
3. Verify partial migrations haven't left missing functions
4. Always test as non-admin users for customer-facing features

### Business Logic Patterns
1. Consider business model requirements first
2. Default to user self-service capabilities
3. Only restrict features when security requires it
4. Make paid features accessible to paying users

### UI/Design Patterns
1. Size modals appropriately for their content (max-w-4xl for long content)
2. Use horizontal scrolling for non-wrapping content (API keys, codes)
3. Apply `whitespace-nowrap` for single-line technical content
4. Implement custom scrollbar styling to match design system
5. Test UI components with maximum possible content length

## Common Gotchas

1. **Supabase SQL Editor**: Only shows query results, NOT RAISE NOTICE (⚠️ RECURRING ISSUE - CHECK EVERY SQL FILE!)
2. **DO blocks**: Can't contain statements with their own $$ delimiters
3. **API 404s**: Often authentication middleware failures, not missing routes
4. **Redis errors**: Environment variables wrapped in quotes
5. **Build errors**: Server modules imported in client components
6. **pgcrypto**: May not be available, always add fallbacks
7. **API keys**: Business model requires user access, not admin-only
8. **Dynamic routes**: Middleware can't access route params directly, use closures
9. **Function overloads**: PostgreSQL might choose wrong version causing parameter errors
10. **Column mismatches**: Database columns might differ from what code expects
11. **PostHog TypeScript**: Strict interfaces - check type definitions before adding config properties
12. **NPM dependencies**: Radix UI components need individual package installations
13. **React useEffect loops**: Non-memoized functions in dependencies cause infinite re-renders
14. **Double tracking**: Don't track in both navigation handlers AND destination pages
15. **Modal overflow**: Long content (API keys, URLs) needs wider modals and horizontal scrolling

### Session: 2025-06-04

#### Learning 41: PostHog Error Tracking Implementation
**Context**: User requested PostHog error tracking integration for production use
**Implementation**:
- PostHog's `captureException` method requires initialization with exception autocapture enabled
- Server-side errors must be sent directly to PostHog's API endpoint (`/capture/`)
- Client-side errors are captured automatically with window error listeners
- React Error Boundaries need manual `captureException` calls

**Key Patterns**:
```typescript
// Client-side initialization
posthog.init(key, {
  api_host: 'https://us.i.posthog.com',
  autocapture: { capture_copied_text: false },
  session_recording: { maskAllInputs: true }
});

// Server-side capture
fetch(`${posthogHost}/capture/`, {
  method: 'POST',
  body: JSON.stringify({
    api_key: key,
    event: '$exception',
    distinct_id: userId || `server_${timestamp}`,
    properties: { $exception_type, $exception_message, $exception_stack_trace }
  })
});
```

**Will Follow**:
- Always use `$exception` event type for errors
- Include stack traces in `$exception_stack_trace` property
- Use distinct_id for server-side events (user ID or generated)
- Mask sensitive data in session recordings
- Don't capture expected errors (400s, 404s)

#### Learning 42: PostHog TypeScript Interface Strictness
**Context**: Vercel build error with PostHog session_recording configuration
**Mistake**: Used `maskTextContent` property which doesn't exist in PostHog's TypeScript types
**Learning**:
- PostHog's TypeScript interfaces are strict and don't allow unknown properties
- The `SessionRecordingOptions` interface only accepts specific properties
- Check PostHog's type definitions when configuring options

**Error Pattern**:
```typescript
// BAD - maskTextContent doesn't exist in SessionRecordingOptions
session_recording: {
  maskAllInputs: true,
  maskTextContent: false, // Type error!
}

// GOOD - Only use properties that exist in the interface
session_recording: {
  maskAllInputs: true,
}
```

**Will Avoid**:
- Adding properties to PostHog config without checking type definitions
- Assuming all PostHog features are available in all versions
- Using outdated PostHog configuration examples without verifying current API

#### Learning 43: Production Console Logs and Debug Statements
**Context**: Production build showing extensive console logs causing performance and security issues
**Mistake**: Using console.log directly throughout the application without environment checks
**Learning**:
- Console logs should be conditionally rendered based on NODE_ENV
- Create a conditional logger utility that only logs in development
- Production builds should have zero console output except critical errors

**Solution Pattern**:
```typescript
// conditional-logger.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const devLog = {
  log: (...args: any[]) => {
    if (isDevelopment) console.log(...args);
  },
  error: (...args: any[]) => {
    if (isDevelopment) console.error(...args);
  }
};

// Usage
devLog.log('This only appears in development');
```

**Will Follow**:
- Always use conditional logging utilities in production code
- Review all console statements before deployment
- Use proper error tracking services (like PostHog) instead of console.error
- Keep production logs clean for better performance

#### Learning 44: API Route Error Handling and Response Types
**Context**: API routes returning HTML 404 pages instead of JSON errors, causing client-side parsing errors
**Mistake**: Not properly checking response content-type before parsing JSON
**Learning**:
- Always check response.ok before attempting to parse JSON
- Verify content-type header includes "application/json"
- API routes should always return consistent JSON responses, even for errors

**Error Pattern**:
```typescript
// BAD - Assumes response is always JSON
const response = await fetch('/api/admin/logs');
const data = await response.json(); // Throws if HTML is returned

// GOOD - Verify response before parsing
const response = await fetch('/api/admin/logs');
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}
const contentType = response.headers.get("content-type");
if (!contentType || !contentType.includes("application/json")) {
  throw new Error("Server returned non-JSON response");
}
const data = await response.json();
```

**Will Follow**:
- Always validate response status and content-type before parsing
- Ensure API routes return JSON for all responses (success and error)
- Add proper error boundaries for fetch operations
- Use consistent error response formats across all API routes

#### Learning 45: Missing NPM Dependencies in Production Builds
**Context**: Vercel build failed with "Module not found: Can't resolve '@radix-ui/react-tooltip'"
**Mistake**: Created a new UI component using @radix-ui/react-tooltip without installing the dependency
**Learning**:
- Always check if external dependencies are installed before importing them
- Vercel builds from package.json, so missing dependencies will cause build failures
- When creating new UI components with Radix UI, ensure the specific package is installed

**Error Pattern**:
```bash
# Build error
Module not found: Can't resolve '@radix-ui/react-tooltip'

# Solution
npm install @radix-ui/react-tooltip
```

**Will Follow**:
- Check package.json before using new Radix UI components
- Install dependencies immediately after creating components that use them
- Test builds locally before pushing to avoid Vercel build failures
- Keep track of which Radix UI packages are already installed vs needed

#### Learning 46: Search Count Overflow and Tracking Issues
**Context**: Users seeing "92 searches used" when limit is 20, and hitting search limit after just one search
**Mistake**: Multiple issues with search tracking:
1. Database continued incrementing counters beyond the limit
2. Frontend displayed raw database counts without capping for free users
3. Usage tracking hook had incorrect calculation logic trying to "fix" the count
**Learning**:
- Database functions should enforce limits when incrementing counters
- Frontend should display capped values for limited plans
- Don't try to "fix" data in the frontend - fix it at the source

**Error Pattern**:
```typescript
// BAD - Confusing calculation in frontend
if (status.isAnonymous && status.remaining > 20) {
  status.remaining = Math.max(0, 20 - (status.remaining - 20));
  status.allowed = status.remaining > 0;
}

// GOOD - Cap at the source and display correctly
const searchesThisMonth = profile?.subscription_plan === 'free' 
  ? Math.min(profile?.searches_this_month || 0, 20)
  : profile?.searches_this_month || 0;
```

**Database Fix Pattern**:
```sql
-- Use LEAST() to cap values when incrementing
UPDATE public.anonymous_sessions
SET search_count = LEAST(search_count + 1, 20)
WHERE session_id = p_session_id;

-- Check limit BEFORE incrementing
IF v_search_count >= 20 THEN
    v_is_allowed := FALSE;
    -- Don't increment
ELSE
    -- Safe to increment
END IF;
```

**Will Follow**:
- Always enforce limits at the database level, not just in UI
- Use LEAST() function to cap values when incrementing
- Check limits before incrementing counters
- Display capped values in UI for consistency
- Fix data issues at the source (database) not in the frontend

#### Learning 47: Supabase SQL Editor RAISE NOTICE Reminder
**⚠️ IMPORTANT: DO NOT DELETE THIS LEARNING - This is a recurring issue that keeps happening**
**Context**: User pointed out migration script using RAISE NOTICE which doesn't work in Supabase
**Mistake**: Used RAISE NOTICE in migration despite knowing it doesn't display in Supabase SQL Editor
**Learning**: This is a recurring issue - must always use result sets for output in Supabase migrations
**Note**: This same issue is documented in Learning 1 and 34. Despite multiple reminders, this mistake keeps happening. ALWAYS check for RAISE NOTICE before submitting SQL migrations.

**Solution Pattern**:
```sql
-- BAD - RAISE NOTICE doesn't show in Supabase
DO $$
BEGIN
    RAISE NOTICE 'Starting migration...';
    -- do work
    RAISE NOTICE 'Fixed % records', v_count;
END $$;

-- GOOD - Use temp table and SELECT for output
CREATE TEMP TABLE migration_progress (
    step TEXT,
    affected_rows INTEGER,
    status TEXT
);

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    -- do work
    INSERT INTO migration_progress VALUES 
        ('Fixed records', v_count, 'completed');
END $$;

-- Show results
SELECT * FROM migration_progress;
```

**Will Follow**:
- ALWAYS use temp tables and SELECT for migration output
- Never use RAISE NOTICE in Supabase migrations
- Create structured output tables for better readability
- Include summary queries at the end of migrations
- Reference Learning 1, 34, and 47 when writing SQL for Supabase
- For diagnostic queries, either unionize into a single query OR keep as separate independent queries

### Session: 2025-06-05

#### Learning 48: React useEffect Infinite Loop with Function Dependencies
**Context**: User's search count was jumping from 2 to 20 after clicking one spirit detail
**Mistake**: Included `trackUsage` function in useEffect dependency array without memoization
**Root Cause**: 
- The `trackUsage` function from `useUsageTracking` hook wasn't memoized
- Including it in dependencies caused useEffect to fire on every render
- This created 18-20 rapid "detail" tracking calls when viewing a spirit
- User's search count jumped from 2 to 20 (2 + 18 = 20)

**Error Pattern**:
```typescript
// BAD - trackUsage changes on every render, causing infinite loop
useEffect(() => {
  trackUsage('detail', {
    spiritId: spirit.id,
    category: spirit.category,
  });
}, [spirit.id, spirit.category, trackUsage]); // trackUsage causes re-renders!

// GOOD - Remove unstable function from dependencies
useEffect(() => {
  trackUsage('detail', {
    spiritId: spirit.id,
    category: spirit.category,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [spirit.id, spirit.category]); // Only depend on stable values
```

**Diagnostic Clues**:
- Multiple searches of same type in rapid succession (18-21 "detail" searches in 1 second)
- Search count jumping by exactly the number of rapid-fire calls
- All searches having identical parameters

**Will Follow**:
- Never include non-memoized functions in useEffect dependencies
- Always check for rapid-fire API calls when counts jump unexpectedly
- Use React DevTools Profiler to detect excessive re-renders
- Memoize hook functions with useCallback if they must be dependencies
- Add ESLint disable comment with explanation when omitting dependencies

#### Learning 49: Supabase SQL Editor REQUIRES Single Unionized Scripts
**⚠️ CRITICAL: THIS IS A RECURRING ISSUE - I KEEP MAKING THIS MISTAKE!**
**Context**: User repeatedly pointed out that I created diagnostic scripts with multiple separate SELECT statements
**Mistake**: Created SQL files with multiple independent queries instead of unionizing them into a single script
**Learning**: Supabase SQL Editor will ONLY execute the FIRST query when multiple queries are provided

**Error Pattern**:
```sql
-- BAD - Multiple separate queries (Supabase only runs the first one!)
SELECT * FROM table1;
SELECT * FROM table2; -- This won't run!
SELECT * FROM table3; -- This won't run!

-- GOOD - Single unionized query
CREATE TEMP TABLE results (
    section TEXT,
    data TEXT
);

DO $$
BEGIN
    -- All logic here
    INSERT INTO results VALUES ('Section 1', 'data1');
    INSERT INTO results VALUES ('Section 2', 'data2');
END $$;

SELECT * FROM results;
```

**MEMORIZE THIS**:
- Supabase SQL Editor is NOT like other SQL tools
- It executes ONLY the FIRST statement
- EVERYTHING must be wrapped in a single DO block or UNION query
- Use temp tables to collect results from multiple operations
- End with a single SELECT statement

**Will ALWAYS Follow**:
- Create temp table at the start
- Use DO block for all logic
- INSERT results into temp table
- Single SELECT at the end
- NEVER write multiple separate SELECT statements
- This applies to ALL Supabase SQL scripts - migrations, diagnostics, everything!

#### Learning 50: Double Tracking in List/Detail Navigation Pattern
**Context**: User reported search count still incrementing too fast (3 searches showing as 8/20)
**Mistake**: Tracking "detail" views in BOTH the list component's click handler AND the detail page's useEffect
**Root Cause**:
- List components (spirits-list-client.tsx, spirits-table-view.tsx) tracked on click
- Detail page (spirit-detail-enhanced.tsx) tracked on mount
- Result: Every spirit view was counted twice

**Error Pattern**:
```typescript
// BAD - Tracking in list component click handler
const handleSpiritClick = async (spirit: Spirit) => {
  await trackUsage('detail', { spiritId: spirit.id }); // First tracking
  router.push(`/spirits/${spirit.id}`);
};

// AND ALSO tracking in detail page
useEffect(() => {
  trackUsage('detail', { spiritId: spirit.id }); // Second tracking!
}, [spirit.id]);

// GOOD - Track ONLY in the detail page
const handleSpiritClick = async (spirit: Spirit) => {
  // Don't track here - let the detail page handle it
  router.push(`/spirits/${spirit.id}`);
};
```

**Diagnostic Signs**:
- Same spirit_id tracked twice within 1-2 seconds
- Detail views count exactly double the actual clicks
- Timestamps show pairs of identical tracking calls

**Will Follow**:
- Track page views ONLY in the destination page, not in navigation handlers
- Choose one place for tracking - either click handler OR page mount, never both
- When navigating to a detail page, let the detail page handle its own tracking
- Use diagnostic queries to check for duplicate tracking patterns

### Session: 2025-06-06

#### Learning 51: Dialog Modal Overflow and Responsive Design
**Context**: API key creation dialog had content overflowing beyond modal boundaries
**Mistake**: Used fixed width modal (max-w-2xl) without considering content overflow for long API keys
**Root Cause**:
- API keys are long strings that don't naturally break
- Modal width was too constrained for the content
- No horizontal scrolling or proper text handling implemented

**Error Pattern**:
```tsx
// BAD - Fixed width with text breaking, causing overflow
<DialogContent className="max-w-2xl">
  <code className="block text-sm font-mono text-green-400 break-words">
    {newApiKey.key} // Long string overflows container
  </code>
</DialogContent>

// GOOD - Wider modal with horizontal scrolling
<DialogContent className="max-w-4xl overflow-hidden">
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
    <code className="block text-base font-mono whitespace-nowrap">
      {newApiKey.key}
    </code>
  </div>
</DialogContent>
```

**Solution Components**:
1. Increased modal width: `max-w-2xl` → `max-w-4xl`
2. Added horizontal scrolling with `overflow-x-auto`
3. Used `whitespace-nowrap` to prevent text wrapping
4. Implemented custom scrollbar styling for consistency
5. Added silk design system aesthetics (shimmer effects, gradients)

**Custom Scrollbar CSS**:
```css
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thumb-white\/10::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-thumb-white\/10::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
}
```

**Will Follow**:
- Always consider content width when setting modal constraints
- Use horizontal scrolling for content that shouldn't wrap (API keys, URLs, codes)
- Apply `whitespace-nowrap` for single-line content that needs to stay intact
- Implement custom scrollbar styling to match the design system
- Test modals with longest possible content to ensure no overflow