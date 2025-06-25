# Git Commit and Versioning Rule for Claude AI

## ⚡ Auto-Execution Notice
**When this rule is active, Claude will automatically execute git commands including commits and pushes without requesting user confirmation. All operations will be reported in real-time.**

## 📊 Companion File Required
**This file works with `git-metrics-reporter.md` to provide comprehensive post-commit metrics and reporting. Both files should be used together for complete functionality.**

## 🚨 PRIMARY DIRECTIVE: Smart Branch Type Selection
**Claude intelligently creates the right type of branch for each type of work.**
- If on main/master → Claude IMMEDIATELY creates a new branch
- **Analyze the work** and create appropriate branch type: feat/, fix/, docs/, perf/, refactor/, etc.
- **Each branch represents focused work** that can be reviewed independently
- **No automatic merging** - each branch stands on its own
- **No micro-branching** - only create branches for substantial, focused work

## Overview
This rule enables Claude to intelligently analyze work and create appropriately typed branches (fix/, feat/, docs/, perf/, etc.) while maintaining a clean workflow where each branch represents focused, reviewable work.

## Core Principles

### 1. Semantic Versioning (SemVer)
Follow the MAJOR.MINOR.PATCH format where:
- **MAJOR** (X.0.0): Breaking changes, incompatible API changes
- **MINOR** (0.X.0): New features, backwards-compatible functionality
- **PATCH** (0.0.X): Bug fixes, backwards-compatible patches

### 2. Commit Message Format
Use the Conventional Commits specification:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Smart Branch Type Decision Matrix

### 🐛 **fix/** branches - Bug Fixes & Problem Solving
Create when:
- Fixing broken functionality
- Resolving UI/UX issues
- Correcting data problems
- Patching security vulnerabilities
- Fixing performance bottlenecks

Examples:
- `fix/navbar-routing-404-errors`
- `fix/mobile-responsive-layout`
- `fix/auth-session-timeout`
- `fix/memory-leak-video-player`

### ✨ **feat/** branches - New Features & Enhancements
Create when:
- Adding new functionality
- Building new components
- Implementing new pages
- Creating new user flows
- Adding new integrations

Examples:
- `feat/user-notifications-system`
- `feat/video-upload-interface`
- `feat/dark-mode-toggle`
- `feat/social-sharing-integration`

### 📚 **docs/** branches - Documentation Work
Create when:
- Writing/updating documentation
- Adding code comments
- Creating README files
- API documentation updates
- User guide creation

Examples:
- `docs/api-endpoint-specifications`
- `docs/component-usage-guide`
- `docs/deployment-instructions`

### 🔧 **refactor/** branches - Code Restructuring  
Create when:
- Restructuring existing code
- Improving code organization
- Extracting reusable components
- Consolidating duplicate logic
- Modernizing code patterns

Examples:
- `refactor/auth-middleware-extraction`
- `refactor/component-prop-interfaces`
- `refactor/database-query-optimization`

### ⚡ **perf/** branches - Performance Improvements
Create when:
- Optimizing loading times
- Reducing bundle sizes
- Improving render performance
- Database query optimization
- Memory usage improvements

Examples:
- `perf/lazy-load-video-components`
- `perf/bundle-size-optimization`
- `perf/database-index-improvements`

### 💄 **style/** branches - Visual & Styling Changes
Create when:
- CSS/styling updates
- Design system changes
- Visual consistency improvements
- Layout adjustments
- Theme updates

Examples:
- `style/button-design-system`
- `style/mobile-layout-improvements`
- `style/color-palette-update`

### 🔒 **security/** branches - Security Improvements
Create when:
- Security vulnerability fixes
- Authentication improvements
- Data protection enhancements
- Access control updates

Examples:
- `security/jwt-token-validation`
- `security/sql-injection-prevention`
- `security/user-data-encryption`

### 🏗️ **test/** branches - Testing & Quality
Create when:
- Adding unit tests
- Integration testing
- E2E test implementation
- Test infrastructure setup

Examples:
- `test/auth-component-coverage`
- `test/api-endpoint-integration`
- `test/e2e-user-flows`

### 🔧 **chore/** branches - Maintenance & Tooling
Create when:
- Dependency updates
- Build system changes
- CI/CD improvements
- Development tooling setup

Examples:
- `chore/update-react-dependencies`
- `chore/eslint-configuration`
- `chore/github-actions-setup`

### 🎯 **improve/** branches - Bundled Improvements
Create when:
- Multiple related improvements for same feature/component/page
- Combination of UI + performance + docs for same area
- Comprehensive updates that logically belong together
- Multiple enhancement types in same development session

Examples:
- `improve/navbar-comprehensive-enhancements`
- `improve/video-player-multiple-improvements`
- `improve/user-dashboard-ui-perf-docs`

### 🔄 **update/** branches - General Updates
Create when:
- Updating multiple aspects of existing functionality
- Modernizing or refreshing existing features
- Cross-cutting changes affecting multiple areas
- Maintenance updates with mixed types

Examples:
- `update/authentication-system-refresh`
- `update/mobile-responsiveness-improvements`
- `update/api-integration-enhancements`

## Smart Bundling Decision Matrix

### 🎯 **BUNDLE Together** (improve/ or update/ branch) When:

**Feature/Component Cohesion:**
- All changes improve the SAME feature, component, or page
- Changes work together to solve the SAME user problem
- Improvements that enhance the SAME user experience

**Logical Review Unit:**
- Changes that should be reviewed as a complete improvement
- Multiple aspects of the same enhancement (UI + performance + docs)
- Changes that tell a cohesive improvement story

**Development Context:**
- Multiple improvements made in the same work session for the same area
- Related changes that address the same underlying goal
- Comprehensive updates to bring something up to current standards

### 🔀 **SEPARATE** (different branches) When:

**Different Areas:**
- Changes affect completely unrelated features/components
- Bug fix for one area + new feature for different area
- Changes requiring different reviewers or expertise

**Different Priorities:**
- Critical security fix + nice-to-have UI improvement
- Breaking changes + minor documentation updates
- Changes with different urgency levels

**Different Review Cycles:**
- Changes that could/should be merged independently
- One change ready for review, another needs more work
- Changes requiring different approval processes

## Bundling vs Separation Logic

### ✅ Bundle Multiple Changes on ONE Branch When:

**Same Feature/Component Context:**
- UI improvements + performance optimizations + documentation for the same feature
- Multiple enhancements to the same component or page
- Related changes that improve the same user experience

**Logical Grouping:**
- Changes that should be reviewed together
- Improvements that depend on each other
- Updates that form a cohesive improvement story

**Development Session Context:**
- Multiple related improvements made in the same work session
- Changes that address the same underlying issue or goal
- Comprehensive updates to bring something up to standard

### ❌ Separate Into Different Branches When:

**Unrelated Changes:**
- Bug fix for navbar + new feature for footer
- Performance improvement for videos + documentation for API
- Changes affecting completely different parts of the application

**Different Review Requirements:**
- Critical security fix + nice-to-have UI improvement
- Breaking changes + minor documentation updates
- Changes requiring different reviewers or approval processes

### 🎯 Bundling Examples

#### Example 1: Navbar Comprehensive Improvements (Bundle)
```bash
# Changes: UI redesign + performance optimization + documentation
# AI detects: All changes relate to navbar component

git checkout -b improve/navbar-comprehensive-enhancements
git add src/components/layout/Navbar.tsx docs/components/navbar.md src/hooks/useNavigation.ts
git commit -m "improve(navbar): comprehensive UI, performance, and documentation enhancements

UI Improvements:
- Redesign with glassmorphism effects
- Improve mobile responsiveness
- Add smooth hover animations

Performance Optimizations:
- Implement React.memo for unnecessary re-renders
- Lazy load dropdown components
- Optimize notification badge updates

Documentation:
- Add comprehensive component documentation
- Include usage examples and props API
- Document accessibility features

Complete navbar enhancement for better UX and maintainability"
git push -u origin improve/navbar-comprehensive-enhancements
```

#### Example 2: Video Player Multi-Enhancement (Bundle)
```bash
# Changes: Bug fix + new features + performance + docs
# AI detects: All changes improve video player experience

git checkout -b improve/video-player-multiple-improvements
git add src/components/video/ docs/video-player.md tests/video-player.test.tsx
git commit -m "improve(video): comprehensive video player enhancements

Bug Fixes:
- Fix fullscreen mode on mobile devices
- Resolve audio sync issues on slow connections

New Features:
- Add picture-in-picture support
- Implement custom playback speed controls
- Add keyboard shortcuts for accessibility

Performance Improvements:
- Optimize video loading with progressive enhancement
- Reduce memory usage during long playback sessions

Documentation & Testing:
- Add comprehensive usage documentation
- Include accessibility guidelines
- Add unit tests for new features

Significantly improves video player functionality and user experience"
git push -u origin improve/video-player-multiple-improvements
```

#### Example 3: User Dashboard Complete Refresh (Bundle)
```bash
# Changes: UI overhaul + API updates + documentation + tests
# AI detects: All changes part of dashboard modernization

git checkout -b update/user-dashboard-modernization
git add src/pages/dashboard/ src/api/dashboard/ docs/dashboard/ tests/dashboard/
git commit -m "update(dashboard): complete modernization with UI, API, docs, and tests

UI Overhaul:
- Modern card-based layout with improved visual hierarchy
- Dark mode support with theme consistency
- Enhanced mobile responsiveness

API Integration:
- Migrate to GraphQL for better data fetching
- Add real-time updates via WebSocket
- Implement optimistic updates for better UX

Documentation:
- Complete user guide for new dashboard features
- API documentation for GraphQL endpoints
- Component documentation for maintainability

Testing:
- Comprehensive unit tests for all components
- Integration tests for API interactions
- E2E tests for critical user flows

Complete dashboard modernization bringing it up to current standards"
git push -u origin update/user-dashboard-modernization
```

#### Example 4: Separate Unrelated Changes
```bash
# Changes: Critical auth bug + new explore page feature
# AI detects: Unrelated changes requiring different review priorities

# Critical bug fix first:
git checkout -b fix/auth-session-security-vulnerability
git add src/auth/session.ts
git commit -m "fix(auth): patch critical session security vulnerability"
git push -u origin fix/auth-session-security-vulnerability

# Then new feature on separate branch:
git checkout main  # or appropriate base
git checkout -b feat/explore-page-social-sharing
git add src/pages/explore/ src/components/social-share/
git commit -m "feat(explore): add social sharing functionality for discoveries"
git push -u origin feat/explore-page-social-sharing
```

## Branch Decision Logic

```
1. Analyze the scope and context of ALL changes:
   ┌─ Multiple related changes in same session/feature? 
   │  ├─ YES → Bundle on ONE appropriately named branch
   │  └─ NO → Create separate focused branches
   │
   ├─ Single type of substantial work? → Create typed branch (fix/, feat/, etc.)
   ├─ Multiple unrelated changes? → Create separate branches for each
   ├─ Incremental work on current feature? → Continue on current branch
   └─ On main/master? → ALWAYS create new branch (never commit to main/master)

2. Branch naming for bundled work:
   ┌─ Feature-focused bundle → feat/feature-name-improvements
   ├─ Component-focused bundle → improve/component-name-enhancements  
   ├─ Page-focused bundle → update/page-name-comprehensive-updates
   └─ General improvements → improve/area-name-multiple-enhancements
```

## Workflow Examples

### Example 1: Bug Fix Detected
```bash
# Current branch: feat/user-dashboard
# Issue: Navigation links are broken

# AI creates appropriate branch type:
git checkout -b fix/navigation-routing-broken-links
git add src/components/layout/Navbar.tsx
git commit -m "fix(nav): resolve broken navigation routing links

- Fix incorrect route paths in navbar component
- Add proper route validation
- Prevent navigation to non-existent pages

Fixes critical navigation issue affecting all users"
git push -u origin fix/navigation-routing-broken-links

# AI reports:
"✅ Created fix/navigation-routing-broken-links
🎯 Focus: Fixing broken navigation functionality
🔗 Branch ready for independent PR review"
```

### Example 2: New Feature Implementation
```bash
# Current branch: feat/user-dashboard
# Work: Adding notification system

# AI creates appropriate branch type:
git checkout -b feat/real-time-notifications-system
git add src/components/notifications/ src/hooks/useNotifications.ts
git commit -m "feat(notifications): implement real-time notification system

- Add notification bell component with badge counts
- Implement WebSocket connection for real-time updates
- Create notification dropdown with action buttons
- Add notification persistence and mark-as-read functionality

Enables users to receive instant updates for comments, invites, and activities"
git push -u origin feat/real-time-notifications-system

# AI reports:
"✅ Created feat/real-time-notifications-system
🎯 Focus: New notification feature implementation
🔗 Branch ready for independent PR review"
```

### Example 3: Performance Optimization
```bash
# Current branch: feat/video-streaming
# Issue: Video components loading slowly

# AI creates appropriate branch type:
git checkout -b perf/video-component-lazy-loading
git add src/components/video/ src/hooks/useLazyVideo.ts
git commit -m "perf(video): implement lazy loading for video components

- Add intersection observer for video loading
- Implement progressive thumbnail loading
- Reduce initial bundle size by 40%
- Improve page load times for video-heavy pages

Significantly improves performance on video grid pages"
git push -u origin perf/video-component-lazy-loading

# AI reports:
"✅ Created perf/video-component-lazy-loading
🎯 Focus: Video component performance optimization
🔗 Branch ready for independent PR review"
```

### Example 4: Documentation Update
```bash
# Current branch: feat/api-integration
# Work: Adding API documentation

# AI creates appropriate branch type:
git checkout -b docs/api-integration-guide
git add docs/api/ README.md
git commit -m "docs(api): add comprehensive API integration guide

- Document all available endpoints with examples
- Add authentication flow documentation
- Include error handling patterns
- Provide integration code samples

Helps developers integrate with the API effectively"
git push -u origin docs/api-integration-guide

# AI reports:
"✅ Created docs/api-integration-guide
🎯 Focus: API integration documentation
🔗 Branch ready for independent PR review"
```

### Example 5: Incremental Work - Stay on Current Branch
```bash
# Current branch: feat/user-dashboard
# Work: Minor styling tweaks

# AI continues on current branch:
git add src/components/Dashboard.tsx
git commit -m "style(dashboard): adjust card spacing and hover effects"
git push origin feat/user-dashboard

# AI reports:
"✅ Committed to feat/user-dashboard
🎯 Focus: Incremental styling improvements
📝 Minor changes - continuing current feature development"
```

## When to Create New Branch vs Continue vs Bundle

### ✅ Create New SINGLE-TYPE Branch When:
- **Single focused work** of one type (pure fix, pure feature, pure docs)
- **Clear single purpose** that fits one branch type
- **Independent work** not related to current development

### ✅ Create New BUNDLED Branch When:
- **Multiple improvements** for the same feature/component/page
- **Related changes** that should be reviewed together (UI + perf + docs for same area)
- **Comprehensive updates** that form a cohesive improvement story
- **Same development session** with logically connected changes

### ✅ Continue Current Branch When:
- **Incremental progress** on existing work
- **Minor adjustments** to recently implemented features
- **Small styling tweaks** or copy changes
- **Follow-up fixes** directly related to current branch work

## Branch Naming Conventions

### Pattern: `type/descriptive-kebab-case-name`

**Single-Type Branches:**
- `feat/user-authentication-system`
- `fix/mobile-navigation-overlay`
- `perf/database-query-optimization`
- `docs/component-api-reference`
- `refactor/auth-middleware-consolidation`
- `style/design-system-colors`
- `security/jwt-token-validation`
- `chore/dependency-security-updates`

**Bundled/Multi-Type Branches:**
- `improve/navbar-comprehensive-enhancements`
- `improve/video-player-ui-perf-docs`
- `update/dashboard-modernization`
- `update/mobile-responsiveness-improvements`
- `improve/auth-system-multiple-fixes`
- `update/api-integration-enhancements`

**Bad Examples:**
- `fix/stuff` (too vague)
- `feat/updates` (not descriptive)
- `branch1` (no type or description)
- `fix-navigation` (missing type/ prefix)

## Auto-Push Behavior

### Always Auto-Push To:
- Any branch that's NOT main/master
- Newly created branches immediately after creation
- Updated branches after commits

### Never Auto-Push To:
- main branch (automatic branch creation enforced)
- master branch (automatic branch creation enforced)

### Workflow:
```bash
# AI automatically executes:
1. Analyze work → Determine branch type
2. Create appropriate branch → git checkout -b type/description
3. Stage changes → git add files
4. Commit with proper message → git commit -m "type(scope): description"
5. Push to remote → git push -u origin type/description
6. Generate comprehensive metrics report → See git-metrics-reporter.md
7. Display detailed statistics and next steps → Formatted output with all metrics
```

## Implementation Rules for Claude

1. **ENFORCE main/master protection** - Never allow commits to these branches
2. **Analyze work type** - Choose correct branch prefix (feat/, fix/, docs/, etc.)
3. **Create meaningful branch names** - Descriptive, specific, kebab-case
4. **No automatic merging** - Each branch stands independently
5. **Smart decisions** - New branch for substantial work, continue for incremental
6. **Auto-push everything** - Push all branches immediately
7. **Generate comprehensive metrics** - Use git-metrics-reporter.md after every push
8. **Display detailed statistics** - Show formatted metrics report with all insights
9. **Provide actionable next steps** - Include PR links, suggestions, and alerts
10. **Clear communication** - Explain branch creation decisions with metrics context

## Communication Templates

### When Creating Single-Type Branch:
```
"🎯 Detected [work-type] work: [description]. Creating focused [type]/ branch...

✅ Created: [type]/[branch-name]
✅ Committed: [commit-message-summary]
✅ Pushed: origin/[type]/[branch-name]
🎯 Focus: [specific-purpose]
🔗 Branch ready for independent PR review

📊 Generating comprehensive metrics report..."
[Display full metrics report from git-metrics-reporter.md]
```

### When Creating Bundled Branch:
```
"🎯 Detected multiple related improvements for [area/component]: [types]. Bundling on single branch...

✅ Created: improve/[area-name]-comprehensive-enhancements
✅ Bundled changes:
   • [change-type-1]: [description]
   • [change-type-2]: [description]  
   • [change-type-3]: [description]
✅ Committed: [commit-message-summary]
✅ Pushed: origin/improve/[branch-name]
🎯 Focus: Comprehensive improvements to [area]
🔗 Branch ready for holistic PR review

📊 Generating comprehensive metrics report..."
[Display full metrics report from git-metrics-reporter.md]
```

### When Continuing Current Branch:
```
"📝 This appears to be incremental work for [current-feature]. Continuing on [current-branch]...

✅ Committed: [commit-message-summary]
✅ Pushed: origin/[current-branch]
🎯 Focus: [incremental-progress-description]

📊 Generating metrics report..."
[Display metrics report from git-metrics-reporter.md]
```

## Version Impact

### Branch Types and Version Bumps:
- **feat/** branches → MINOR version bump when merged
- **fix/** branches → PATCH version bump when merged
- **security/** branches → PATCH version bump (urgent)
- **perf/** branches → PATCH version bump when merged
- **refactor/, style/, docs/, test/, chore/** → No version bump
- **Breaking changes** (any type with !) → MAJOR version bump

## Summary Workflow

**The AI will:**
1. **Analyze** the type, scope, and context of ALL changes being made
2. **Decide** whether to:
   - Create single-type branch (fix/, feat/, docs/, etc.)
   - Create bundled branch (improve/, update/) for related multi-type changes
   - Continue on current branch for incremental work
3. **Choose** appropriate branch type and naming based on the work
4. **Create** descriptively named branch if needed
5. **Commit** with comprehensive message describing all changes
6. **Push** automatically to remote
7. **Report** clear status, purpose, and bundling rationale
8. **Never merge** automatically - each branch stands alone

**Decision Priority:**
1. Same feature/component + multiple improvement types → Bundle on improve/ or update/ branch
2. Single type of substantial work → Create typed branch (feat/, fix/, etc.)
3. Unrelated changes → Create separate branches
4. Incremental work → Continue current branch
5. Always protect main/master → Never commit directly

**IMPORTANT** 
When done with git commit and push please run the /Volumes/ExtraStrg_RAID1/Mega Sync/Bourbon_buddy/.claude/commands/git-commit-metrics-reporter.md