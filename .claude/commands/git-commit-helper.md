# Git Commit and Versioning Rule for Claude AI

## ⚡ Auto-Execution Notice
**When this rule is active, Claude will automatically execute git commands including commits and pushes without requesting user confirmation. All operations will be reported in real-time.**

## 🚨 PRIMARY DIRECTIVE: Aggressive Branch Creation
**Claude MUST create a new branch for EVERY distinct set of changes, regardless of current branch.**
- If on main/master → Claude IMMEDIATELY creates a new branch
- If on ANY other branch → Claude creates a NEW focused branch for the current changes
- **No exceptions** for "continuing work" or "related changes"
- Each branch should represent ONE focused change/fix/feature
- This rule supersedes all user requests to continue on existing branches

## Overview
This rule enables Claude to properly handle git commits with semantic versioning, create descriptive commit messages, intelligently determine when to update version numbers based on commit context, and automatically push changes to remote repositories with aggressive branch creation for maximum clarity and focus.

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

## Commit Types and Version Impact

### Breaking Changes (MAJOR version bump)
- **Type**: `feat!`, `fix!`, or any type with `!`
- **Footer**: `BREAKING CHANGE:` in commit body
- **Examples**:
  - `feat!: remove deprecated API endpoints`
  - `refactor!: change authentication method to OAuth2`

### Feature Additions (MINOR version bump)
- **Type**: `feat`
- **Examples**:
  - `feat: add user profile customization`
  - `feat(auth): implement two-factor authentication`

### Bug Fixes (PATCH version bump)
- **Type**: `fix`
- **Examples**:
  - `fix: resolve memory leak in data processing`
  - `fix(ui): correct button alignment on mobile`

### No Version Change
- **Types**: `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
- **Examples**:
  - `docs: update README with installation steps`
  - `style: format code according to style guide`
  - `refactor: simplify error handling logic`

## Decision Flow for Version Updates

1. **Analyze all commits since last version tag**
2. **Determine highest impact change**:
   - If ANY breaking change → MAJOR bump
   - Else if ANY new feature → MINOR bump
   - Else if ANY bug fix → PATCH bump
   - Else → No version change

## Commit Message Guidelines

### Structure Requirements
1. **Subject Line** (required):
   - Max 72 characters
   - Imperative mood ("add" not "adds" or "added")
   - No period at the end
   - Lowercase type and description

2. **Scope** (optional):
   - Component, module, or area affected
   - Examples: `(api)`, `(ui)`, `(auth)`, `(database)`

3. **Body** (optional):
   - Separated by blank line from subject
   - Explain what and why, not how
   - Wrap at 72 characters

4. **Footer** (optional):
   - Breaking changes
   - Issue references: `Fixes #123`, `Closes #456`

## Examples

### Major Version Update (1.2.3 → 2.0.0)
```
feat!: replace REST API with GraphQL

BREAKING CHANGE: All REST endpoints have been removed in favor of a single GraphQL endpoint. 
Clients must update their integration to use GraphQL queries and mutations.

Migration guide available at docs/migration/v2.md
```

### Minor Version Update (1.2.3 → 1.3.0)
```
feat(payments): add support for cryptocurrency payments

- Implement Bitcoin and Ethereum payment gateways
- Add wallet address validation
- Include real-time exchange rate conversion

Closes #789
```

### Patch Version Update (1.2.3 → 1.2.4)
```
fix(auth): prevent session timeout during active use

Users were being logged out while actively using the application due to a 
misconfigured session refresh mechanism. This fix ensures sessions are 
properly extended during user activity.

Fixes #234
```

### Multiple Commits Analysis
When analyzing multiple commits for a release:

```
Commits since v1.2.3:
- fix: resolve data export timeout issue
- feat: add CSV import functionality  
- docs: update API documentation
- fix: correct timezone handling in scheduler
- feat!: change user ID format from int to UUID

Result: Version 2.0.0 (due to breaking change)
```

## Automatic Git Push Behavior

### Auto-Push Configuration

Once this rule is initiated, Claude should automatically execute git push commands without requesting user confirmation, following these guidelines:

### Default Auto-Push Rules

1. **Always Auto-Push for:**
   - ALL newly created branches
   - ANY branch that's NOT main/master

2. **FORBIDDEN - Never Auto-Push or Commit to:**
   - main branch (automatic branch creation enforced)
   - master branch (automatic branch creation enforced)
   - Any attempt to bypass branch creation will be refused

3. **Hyper-Assertive Branch Creation Workflow:**
   ```bash
   # Claude ALWAYS creates a new branch regardless of current branch
   # Analyzes changes first, then:
   git checkout -b <change-type>/<focused-description>
   # Then continues with commit and push
   ```

### Automatic Execution Flow

```
1. Analyze changes to determine focus
2. Create NEW branch based on change type/focus
3. Stage changes
4. Create commit with proper message
5. AUTOMATICALLY push to remote
6. Report push status to user
```

### Safety Mechanisms

#### Pre-Push Validation
Before auto-pushing, Claude should verify:
- ✓ All changes are committed
- ✓ No merge conflicts exist
- ✓ Branch allows pushing (not protected)
- ✓ Remote is accessible

#### When NOT to Auto-Push
Claude will halt auto-push and request confirmation for:
- Commits containing passwords, API keys, or secrets detected
- Commits over 100 files (potential mistake)
- Commits deleting over 1000 lines (potential destructive change)
- First push to a new repository
- When credentials are not configured

Example halt message:
```
"⚠️  Detected potential sensitive data in commit
🛑 Auto-push halted for safety
📋 Please review the changes and confirm:
   - No secrets or credentials included
   - Changes are intentional
   
Type 'push confirmed' to proceed"
```

#### Auto-Push Examples

**Example 1: Feature Development (Even when on existing feature branch)**
```bash
# Current branch: feat/user-dashboard
# Changes: Video card UI consistency fixes
# Claude executes automatically:
git checkout -b fix/video-card-aspect-ratio
git add .
git commit -m "fix(ui): standardize video cards to square aspect ratio"
git push -u origin fix/video-card-aspect-ratio

# Output to user:
"✅ Created focused branch 'fix/video-card-aspect-ratio'
✅ Committed changes: fix(ui): standardize video cards to square aspect ratio
✅ Pushed to origin/fix/video-card-aspect-ratio
🔗 PR URL: https://github.com/org/repo/pull/new/fix/video-card-aspect-ratio"
```

**Example 2: Bug Fix (Even when on feature branch)**
```bash
# Current branch: feat/payment-integration  
# Changes: Memory leak fix
# Claude executes automatically:
git checkout -b fix/memory-leak-payment-processor
git add src/utils/cache.js
git commit -m "fix(performance): resolve memory leak in payment processor"
git push -u origin fix/memory-leak-payment-processor

# Output to user:
"✅ Branch 'fix/memory-leak-payment-processor' created and pushed
📝 Commit: fix(performance): resolve memory leak in payment processor
🚀 Changes are now focused and ready for review"
```

**Example 3: Documentation Update (Even on existing docs branch)**
```bash
# Current branch: docs/api-updates
# Changes: Adding new endpoint docs
# Claude executes automatically:
git checkout -b docs/webhook-endpoint-specification
git add .
git commit -m "docs(api): add webhook endpoint specification and examples"
git push -u origin docs/webhook-endpoint-specification

# Output to user:
"✅ Documentation branch created and pushed
📝 Focused on webhook endpoint documentation
🔗 Changes isolated for targeted review"
```

### Force Push Handling

**Never force push automatically.** If push fails due to conflicts:
```bash
# If push fails, Claude reports:
"❌ Push failed due to conflicts
📋 Manual intervention required:
   1. git pull origin <branch>
   2. Resolve conflicts
   3. git push

Would you like me to pull and show the conflicts?"
```

### Automatic Push Summary Messages

After each auto-push, provide clear feedback:
```
✅ Successfully pushed to <branch-name>
📊 Stats: X files changed, Y insertions(+), Z deletions(-)
🔗 Remote URL: <repository-url>
📝 Commit: <commit-message-summary>
🎯 Focus: <single-purpose-description>
```

### Configuration Options

Users can configure auto-push behavior:
```yaml
# .claude-git-config.yml (hypothetical)
auto_push:
  enabled: true
  aggressive_branching: true
  branches:
    feature/*: true
    fix/*: true
    hotfix/*: true
    docs/*: true
    refactor/*: true
    main: false
    master: false
  create_pr_link: true
  push_tags: true
```

### Disabling Auto-Push

To temporarily disable auto-push for a specific operation, users can say:
- "commit but don't push"
- "local commit only"
- "hold the push"

Claude will then execute commits locally without pushing.

### Error Handling

If auto-push fails, Claude should:
1. Clearly report the error
2. Suggest fixes
3. NOT attempt to force push
4. Preserve local commits

```
"❌ Auto-push failed: remote rejected push
💡 Possible reasons:
   - Branch protection rules
   - Outdated local branch  
   - Authentication issues
   
📋 Your commits are safe locally. Run 'git pull' to update."
```

## Implementation Rules for Claude

1. **ENFORCE main/master protection** - Never allow commits to these branches
2. **Create NEW branches aggressively** - Even when on existing feature branches
3. **Focus each branch on ONE thing** - Single-purpose branches only
4. **Always analyze the full context** of changes before suggesting a version
5. **Prioritize clarity** in commit messages over brevity
6. **Include relevant issue numbers** when provided
7. **Suggest squashing** similar commits when appropriate
8. **Warn about breaking changes** and suggest migration notes
9. **Automatically create new branches** for EVERY set of changes
10. **Execute git push automatically** without requesting user confirmation
11. **Report all git operations** clearly with success/failure status
12. **Handle push failures gracefully** without attempting force push
13. **Refuse requests** to continue on existing branches - always create new ones

## Version Tag Format
```
git tag -a v<VERSION> -m "Release version <VERSION>"
```

Example:
```
git tag -a v2.1.0 -m "Release version 2.1.0"
```

## Pre-release and Build Metadata
- Pre-release: `v1.2.3-alpha.1`, `v1.2.3-beta.2`, `v1.2.3-rc.1`
- Build metadata: `v1.2.3+build.123`

## Hyper-Aggressive Branch Management

### 🚨 CRITICAL RULE: ALWAYS Create New Branches

**ABSOLUTE REQUIREMENT**: Claude MUST create a new branch for EVERY distinct set of changes, regardless of the current branch. This includes when already on feature branches, bug fix branches, or any other non-main branch.

### Ultra-Assertive Branch Creation Policy

Claude should **NEVER** continue work on an existing branch unless explicitly asked to amend the last commit. Every logical set of changes gets its own focused branch.

#### 1. Always Create New Branch - No Exceptions

**Create new branch for EVERY:**
- Bug fix (even on feature branches)
- New feature component (even on feature branches)  
- Refactoring (even on refactor branches)
- Documentation updates (even on docs branches)
- Style changes (even on style branches)
- Performance improvements (even on perf branches)
- Test additions (even on test branches)

**Branch naming must be hyper-specific:**
```bash
# Instead of continuing on feat/user-dashboard:
git checkout -b fix/dashboard-video-card-aspect-ratio
git checkout -b feat/dashboard-export-pdf-button
git checkout -b refactor/dashboard-component-structure
```

#### 2. Single-Purpose Branch Philosophy

Each branch should represent ONE atomic change that:
- Can be reviewed independently
- Can be merged independently  
- Can be reverted independently
- Has a clear, focused purpose

#### 3. Micro-Branch Strategy Examples

**Current scenario: On `feat/streams-create-UI-v1.2`**
**Changes: Video card consistency fixes**

**❌ What the AI did (Bad):**
```bash
# Stayed on existing branch
git add src/components/ui/mux-thumbnail.tsx
git commit -m "fix(ui): standardize video cards..."
git push origin feat/streams-create-UI-v1.2  # Bad - continued existing branch
```

**✅ What the AI should do (Good):**
```bash
# Create focused branch for this specific fix
git checkout -b fix/video-card-square-aspect-ratio
git add src/components/ui/mux-thumbnail.tsx  
git commit -m "fix(ui): standardize video cards to square aspect ratio across all grids"
git push -u origin fix/video-card-square-aspect-ratio

# Then for the documentation:
git checkout feat/streams-create-UI-v1.2  # Go back to base
git checkout -b docs/video-card-fix-tracking
git add tracking-fixes/stream-ui-fixes.md
git commit -m "docs(tracking): document video card consistency fix implementation"
git push -u origin docs/video-card-fix-tracking
```

#### 4. Branch Decision Flow (Ultra-Aggressive)

```
1. Analyze changes:
   ┌─ What is the primary focus of these changes?
   └─ Create a branch name that describes EXACTLY this focus
   
2. ALWAYS create new branch:
   ┌─ On ANY branch? → YES → Create new focused branch
   ├─ Even for tiny changes? → YES → Create new branch
   ├─ Even for related work? → YES → Create new branch  
   ├─ Even for documentation? → YES → Create new branch
   └─ The ONLY exception is amending the last commit
```

### Mandatory Branch Creation Examples

**Claude MUST create focused branches for everything:**

#### Example 1: Multiple Changes = Multiple Branches
```bash
# User has: UI fix + documentation update
# AI creates TWO branches:

# Branch 1: UI Fix
git checkout -b fix/button-alignment-mobile
git add src/components/Button.tsx
git commit -m "fix(ui): correct button alignment on mobile devices"
git push -u origin fix/button-alignment-mobile

# Branch 2: Documentation  
git checkout main  # or appropriate base
git checkout -b docs/button-component-mobile-notes
git add docs/components/button.md
git commit -m "docs(ui): add mobile alignment considerations for Button component"
git push -u origin docs/button-component-mobile-notes
```

#### Example 2: Even Tiny Changes Get New Branches
```bash
# Current: feat/user-authentication
# Change: Fix typo in comment
git checkout -b fix/auth-comment-typo
git add src/auth/validator.js
git commit -m "fix(comments): correct typo in password validation comment"
git push -u origin fix/auth-comment-typo
```

#### Example 3: Logical Separation
```bash
# Current: feat/dashboard-redesign  
# Changes: Performance optimization for dashboard
git checkout -b perf/dashboard-component-memoization
git add src/components/Dashboard.tsx
git commit -m "perf(dashboard): add React.memo to prevent unnecessary re-renders"
git push -u origin perf/dashboard-component-memoization
```

### Assertive Responses to User Requests

#### When User Says "Just commit this"
```
User: "Just commit this quick fix"
Claude: "🎯 Creating focused branch for this fix..."
[Immediately creates: fix/specific-issue-name]
```

#### When User Says "Continue on this branch"  
```
User: "Continue working on the current feature branch"
Claude: "🚀 Creating focused branch for these specific changes..."
[Creates new branch based on the actual changes being made]
```

#### When User Says "This is related work"
```
User: "This is related to the current feature"
Claude: "✅ Creating focused branch to keep changes atomic and reviewable..."
[Creates new branch with specific focus]
```

### Branch Naming Excellence

**Hyper-specific naming patterns:**

#### Fix Branches
```bash
fix/login-timeout-handling
fix/mobile-nav-overflow  
fix/api-response-parsing
fix/memory-leak-user-list
fix/timezone-calculation-error
```

#### Feature Branches  
```bash
feat/password-reset-email
feat/dark-mode-toggle
feat/csv-export-reports
feat/two-factor-authentication
feat/social-media-sharing
```

#### Refactor Branches
```bash
refactor/auth-middleware-extraction
refactor/database-query-optimization
refactor/component-prop-interfaces
refactor/error-handling-consolidation
```

#### Documentation Branches
```bash
docs/api-webhook-examples
docs/deployment-docker-guide
docs/component-usage-patterns
docs/troubleshooting-common-issues
```

### Integration with Auto-Push

With hyper-aggressive branching + auto-push:

```bash
# Complete automated workflow:
1. Analyze changes → Determine focus
2. Create focused branch → Switch to it
3. Stage changes → Commit with proper message  
4. Push immediately → Report success
5. Provide PR link → Ready for review

# All in under 10 seconds, no user interaction needed
```

### When NOT to Create New Branch

**ONLY stay on current branch for:**
- **Nothing** - Always create new branches

**The ONLY exception:**
- Amending the very last commit (git commit --amend)
- And only if explicitly requested by user with "amend last commit"

## Good vs Bad Branch Management Examples

### ❌ Bad: Continuing Existing Branches vs ✅ Good: Focused New Branches

#### Example 1: UI Consistency Fixes
**❌ Bad (Current AI behavior):**
```bash
# On feat/streams-create-UI-v1.2
git add src/components/ui/mux-thumbnail.tsx
git commit -m "fix(ui): standardize video cards..."
git push origin feat/streams-create-UI-v1.2  # Continued existing branch
```

**✅ Good (Desired behavior):**
```bash
# Create focused branch for this specific fix
git checkout -b fix/video-card-aspect-ratio-standardization
git add src/components/ui/mux-thumbnail.tsx
git commit -m "fix(ui): standardize video cards to square aspect ratio across all video grids"
git push -u origin fix/video-card-aspect-ratio-standardization
```

#### Example 2: Mixed Changes
**❌ Bad:**
```bash
# On docs/api-updates
git add docs/api.md src/api/auth.js README.md
git commit -m "update docs and fix auth and update readme"
git push origin docs/api-updates
```

**✅ Good:**
```bash
# Separate into focused branches
git checkout -b docs/auth-endpoint-specification
git add docs/api.md
git commit -m "docs(api): add authentication endpoint specification"
git push -u origin docs/auth-endpoint-specification

git checkout main
git checkout -b fix/auth-token-validation  
git add src/api/auth.js
git commit -m "fix(auth): improve token validation logic"
git push -u origin fix/auth-token-validation

git checkout main
git checkout -b docs/readme-installation-steps
git add README.md
git commit -m "docs: update README with detailed installation steps"
git push -u origin docs/readme-installation-steps
```

#### Example 3: Performance Improvements
**❌ Bad:**
```bash
# On feat/user-dashboard
git add multiple-files-with-different-optimizations
git commit -m "perf improvements"
git push origin feat/user-dashboard
```

**✅ Good:**
```bash
# Create specific performance branches
git checkout -b perf/dashboard-component-memoization
git add src/components/Dashboard.tsx
git commit -m "perf(dashboard): add React.memo to Dashboard component"
git push -u origin perf/dashboard-component-memoization

git checkout main  
git checkout -b perf/api-response-caching
git add src/api/cache.js
git commit -m "perf(api): implement response caching for user data endpoints"
git push -u origin perf/api-response-caching
```

### Common Mistakes to Avoid

1. **Continuing Existing Branches**
   - ❌ "I'm already on a feature branch, I'll just add this fix"
   - ✅ "Creating focused branch for this specific fix"

2. **Mixing Different Types of Changes**
   - ❌ One commit with fixes, features, and documentation
   - ✅ Separate focused branches for each type of change

3. **Vague Branch Names**
   - ❌ `fix/updates` → ✅ `fix/login-form-validation-error`
   - ❌ `feat/improvements` → ✅ `feat/user-profile-avatar-upload`

4. **Fear of "Too Many Branches"**
   - ❌ "I don't want to create too many branches"
   - ✅ "Each branch has a clear purpose and can be reviewed independently"

## Special Considerations

### Initial Development (0.x.x)
- Major version zero (0.y.z) is for initial development
- Anything may change at any time
- Public API should not be considered stable
- **Still use hyper-aggressive branching** for clear development history

### When to Start at 1.0.0
- Public API is defined and stable
- Software is used in production
- Users depend on the stability

## Automation Helpers
When asked to handle git operations, Claude will automatically:
1. Analyze changes without prompting
2. Determine the single focused purpose of changes
3. Create new hyper-specific branch for these changes
4. Stage appropriate files
5. Generate and execute commit with proper message
6. Push to remote repository immediately
7. Report operation status with details
8. Provide version bump recommendation

## Complete Hyper-Aggressive Workflow Example

When Claude analyzes ANY change request:

```bash
# Current branch: feat/user-dashboard-v2
# User: "Fix the video thumbnail sizing issue"

# 1. Claude analyzes: This is a UI fix for video thumbnails
# 2. Creates hyper-focused branch:
git checkout -b fix/video-thumbnail-sizing-consistency

# 3. Makes focused commits:
git add src/components/VideoThumbnail.tsx
git commit -m "fix(ui): ensure consistent video thumbnail sizing across all views

- Set fixed aspect ratio of 16:9 for all video thumbnails
- Add responsive scaling while maintaining aspect ratio
- Remove hardcoded width/height values in favor of CSS classes

Fixes display inconsistencies reported in user feedback"

# 4. AUTOMATICALLY pushes to remote:
git push -u origin fix/video-thumbnail-sizing-consistency

# 5. Reports to user:
"✅ Focused branch 'fix/video-thumbnail-sizing-consistency' created and pushed
🎯 Purpose: Video thumbnail sizing consistency fix
📝 Commit: fix(ui): ensure consistent video thumbnail sizing across all views
📊 Stats: 1 file changed, 12 insertions(+), 8 deletions(-)
🔗 Create PR: https://github.com/org/repo/pull/new/fix/video-thumbnail-sizing-consistency
📈 Version impact: Will trigger v1.2.4 (patch bump) when merged

Note: This focused branch can be reviewed and merged independently of other dashboard work."

# 6. If user has more changes:
# User: "Also update the documentation for this fix"

# Claude immediately creates ANOTHER focused branch:
git checkout feat/user-dashboard-v2  # Go back to appropriate base
git checkout -b docs/video-thumbnail-fix-implementation
git add docs/components/video-thumbnail.md
git commit -m "docs(ui): document video thumbnail sizing fix and implementation"
git push -u origin docs/video-thumbnail-fix-implementation

# Output:
"✅ Created separate documentation branch 'docs/video-thumbnail-fix-implementation'
📚 Focus: Documenting the video thumbnail fix
🔗 Independent PR: https://github.com/org/repo/pull/new/docs/video-thumbnail-fix-implementation"
```

### Example: Hyper-Assertive Response to User Instructions

```bash
# User: "Just commit these changes to the current branch"
# Current branch: feat/payment-integration

# Claude's response:
"🎯 Creating focused branch for these specific changes instead of continuing on the general payment integration branch..."

# Claude executes WITHOUT asking:
git checkout -b fix/payment-form-validation-error
git add src/components/PaymentForm.tsx
git commit -m "fix(payment): resolve form validation error for credit card inputs"
git push -u origin fix/payment-form-validation-error

# Output:
"✅ Created focused branch 'fix/payment-form-validation-error'
✅ Committed: fix(payment): resolve form validation error for credit card inputs
✅ Pushed to origin
🎯 Focus: Credit card form validation fix
🔗 Create PR: https://github.com/org/repo/pull/new/fix/payment-form-validation-error

Benefits of this approach:
- This fix can be reviewed and merged independently
- Payment integration work can continue separately  
- Clear separation of concerns for easier debugging
- Atomic changes make rollbacks safer"
```

### Key Hyper-Aggressive Behaviors

1. **Zero Tolerance for Branch Reuse**: Every change gets its own branch
2. **Immediate Branch Creation**: No asking, just create the right branch
3. **Hyper-Specific Naming**: Branch names describe exactly what changes
4. **Atomic Focus**: Each branch solves exactly one problem
5. **Auto-Push Everything**: Push focused branches immediately
6. **Educational Feedback**: Explain why this approach is better
7. **Complete Automation**: From analysis to pushed branch in seconds