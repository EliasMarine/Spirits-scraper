# Git Commit and Versioning Rule for Claude AI

## ⚡ Auto-Execution Notice
**When this rule is active, Claude will automatically execute git commands including commits and pushes without requesting user confirmation. All operations will be reported in real-time.**

## Overview
This rule enables Claude to properly handle git commits with semantic versioning, create descriptive commit messages, intelligently determine when to update version numbers based on commit context, and automatically push changes to remote repositories.

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
   - Feature branches
   - Fix branches  
   - Experimental branches
   - Any non-protected branches

2. **Never Auto-Push for:**
   - Direct commits to main/master (should be prevented entirely)
   - Branches with uncommitted changes
   - When push would fail (conflicts detected)

3. **Auto-Push Workflow:**
   ```bash
   # After commit creation
   git push -u origin <branch-name>  # First push sets upstream
   # or
   git push  # Subsequent pushes
   ```

### Automatic Execution Flow

```
1. Analyze changes
2. Create/switch to appropriate branch
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

#### Auto-Push Examples

**Example 1: Feature Development**
```bash
# Claude executes automatically:
git checkout -b feature/dashboard-widgets
git add .
git commit -m "feat(ui): implement customizable dashboard widgets"
git push -u origin feature/dashboard-widgets

# Output to user:
"✅ Created branch 'feature/dashboard-widgets'
✅ Committed changes with message: feat(ui): implement customizable dashboard widgets  
✅ Pushed to origin/feature/dashboard-widgets
🔗 PR URL: https://github.com/org/repo/pull/new/feature/dashboard-widgets"
```

**Example 2: Bug Fix**
```bash
# Claude executes automatically:
git checkout -b fix/memory-leak
git add src/utils/cache.js
git commit -m "fix(performance): resolve memory leak in cache manager"
git push -u origin fix/memory-leak

# Output to user:
"✅ Branch 'fix/memory-leak' created and pushed
📝 Commit: fix(performance): resolve memory leak in cache manager
🚀 Changes are now on remote repository"
```

**Example 3: Hotfix with Version Tag**
```bash
# Claude executes automatically:
git checkout -b hotfix/2.3.1-security-patch
git add .
git commit -m "fix(security)!: patch XSS vulnerability in user inputs"
git push -u origin hotfix/2.3.1-security-patch

# After merge to main (separate process):
git tag -a v2.3.1 -m "Security patch release v2.3.1"
git push origin v2.3.1

# Output to user:
"🚨 Hotfix branch created and pushed
✅ Security fix committed and pushed to remote
⚠️  Breaking change detected - requires major version bump
📋 Next steps: Create PR for review and merge"
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
```

### Configuration Options

Users can configure auto-push behavior:
```yaml
# .claude-git-config.yml (hypothetical)
auto_push:
  enabled: true
  branches:
    feature/*: true
    fix/*: true
    hotfix/*: true
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

1. **Always analyze the full context** of changes before suggesting a version
2. **Prioritize clarity** in commit messages over brevity
3. **Include relevant issue numbers** when provided
4. **Suggest squashing** similar commits when appropriate
5. **Warn about breaking changes** and suggest migration notes
6. **Intelligently suggest new branches** based on change type and scope
7. **Never commit breaking changes** directly to main/master branch
8. **Provide branch strategy** along with commit messages when appropriate
9. **Execute git push automatically** without requesting user confirmation
10. **Report all git operations** clearly with success/failure status
11. **Handle push failures gracefully** without attempting force push

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

## Intelligent Branch Management

### When to Create a New Branch

Claude should analyze the context and automatically suggest creating a new branch in these scenarios:

#### 1. Feature Development
**Create branch when:**
- Adding new functionality (`feat:` commits)
- Multiple related commits expected
- Changes need review before merging

**Branch naming:** `feature/<description>` or `feat/<description>`
```bash
git checkout -b feature/user-authentication
git checkout -b feat/payment-integration
```

#### 2. Bug Fixes
**Create branch when:**
- Fixing bugs in production code
- Fix requires multiple commits
- Fix needs testing before merge

**Branch naming:** `fix/<description>` or `bugfix/<description>`
```bash
git checkout -b fix/login-timeout
git checkout -b bugfix/data-export-crash
```

#### 3. Hotfixes (Urgent Production Fixes)
**Create branch when:**
- Critical production bug
- Needs immediate deployment
- Bypasses normal development flow

**Branch naming:** `hotfix/<version>-<description>`
```bash
git checkout -b hotfix/2.3.1-security-patch
git checkout -b hotfix/1.5.2-payment-error
```

#### 4. Breaking Changes
**Always create branch when:**
- Any breaking change detected
- Major version bump required
- Significant refactoring

**Branch naming:** `breaking/<description>` or `major/<description>`
```bash
git checkout -b breaking/api-v2-migration
git checkout -b major/database-restructure
```

#### 5. Experimental Changes
**Create branch when:**
- Trying new approaches
- Uncertain about implementation
- POC or spike work

**Branch naming:** `experimental/<description>` or `spike/<description>`
```bash
git checkout -b experimental/websocket-integration
git checkout -b spike/performance-optimization
```

### Branch Decision Flow

```
1. Analyze the commit type and scope
2. Check current branch:
   - If on main/master → likely need new branch
   - If on feature branch → assess if change fits branch purpose
   
3. Determine branch need:
   ┌─ Breaking change? → YES → New branch (breaking/*)
   ├─ New feature? → YES → New branch (feature/*)
   ├─ Bug fix for production? → YES → New branch (fix/* or hotfix/*)
   ├─ Multiple related commits? → YES → New branch
   ├─ Experimental work? → YES → New branch (experimental/*)
   └─ Simple documentation/style? → NO → Current branch okay
```

### Branch Creation Examples

#### Example 1: New Feature
```bash
# Claude detects: Adding user profile functionality
git checkout -b feature/user-profiles
git add .
git commit -m "feat(users): add user profile management

- Implement profile creation and editing
- Add avatar upload functionality
- Include profile visibility settings"
```

#### Example 2: Critical Bug Fix
```bash
# Claude detects: Fixing production authentication issue
git checkout -b hotfix/2.1.1-auth-bypass
git add .
git commit -m "fix(security)!: patch authentication bypass vulnerability

BREAKING CHANGE: Sessions created before this patch must be invalidated.
All users will need to log in again.

CVE-2024-12345"
```

#### Example 3: Breaking API Change
```bash
# Claude detects: Major API restructuring
git checkout -b breaking/api-v3
git add .
git commit -m "feat!: restructure API endpoints for RESTful compliance

BREAKING CHANGE: All endpoints now follow REST conventions:
- /getUsers → GET /users
- /createUser → POST /users
- /updateUser → PUT /users/:id

Migration guide in docs/api-v3-migration.md"
```

### Smart Branch Rules for Claude

1. **Never commit directly to main/master** when:
   - Changes are substantial (>10 lines)
   - Changes affect core functionality
   - Changes need review or testing
   - Breaking changes are involved

2. **Suggest branch protection** when creating branches:
   ```bash
   # After creating feature branch
   "Recommendation: Create PR/MR for review before merging to main"
   ```

3. **Auto-detect branch context** from:
   - Current branch name
   - Recent commit history
   - Files being modified
   - Commit message content

4. **Branch lifecycle management**:
   ```bash
   # Complete feature
   git checkout main
   git merge feature/user-profiles
   git branch -d feature/user-profiles  # Clean up after merge
   ```

### When NOT to Create New Branch

Stay on current branch for:
- Documentation updates (unless major rewrite)
- Code formatting/style changes
- Small typo fixes
- Config updates (unless breaking)
- Adding comments
- Small refactors (<10 lines)

### Integration with Version Bumping

When creating branches, include version strategy:
- **Feature branches**: Will trigger MINOR bump when merged
- **Fix branches**: Will trigger PATCH bump when merged  
- **Breaking branches**: Will trigger MAJOR bump when merged
- **Hotfix branches**: Immediate PATCH bump on production

## Good vs Bad Commit Examples

### ❌ Bad Commits vs ✅ Good Commits

#### Example 1: Bug Fixes
**❌ Bad:**
```
fixed stuff
```
```
bug fix
```
```
Fixed the thing that was broken
```

**✅ Good:**
```
fix(auth): resolve token expiration not being validated

The JWT token expiration was not being checked on API requests, allowing 
expired tokens to access protected resources. Added validation middleware 
to check token expiry before processing requests.

Fixes #1234
```

#### Example 2: Feature Addition
**❌ Bad:**
```
added new feature
```
```
Update code
```
```
new button
```

**✅ Good:**
```
feat(ui): add dark mode toggle to user preferences

- Implement system-wide dark mode with CSS variables
- Add toggle switch in settings menu
- Persist user preference in localStorage
- Automatically detect system preference on first load

Closes #567
```

#### Example 3: Breaking Changes
**❌ Bad:**
```
changed api
```
```
BREAKING: updates
```
```
refactored user system
```

**✅ Good:**
```
feat!: change user authentication from session to JWT tokens

BREAKING CHANGE: Session-based authentication has been replaced with JWT tokens. 
All API endpoints now require Bearer token authentication instead of session cookies.

Migration steps:
1. Update client to store JWT token instead of relying on cookies
2. Include Authorization header in all API requests
3. Implement token refresh logic using /auth/refresh endpoint

See migration guide: docs/migration/jwt-auth.md
```

#### Example 4: Multiple Changes in One Commit
**❌ Bad:**
```
fixed bugs and added features and updated docs
```
```
lots of changes
```
```
monthly update
```

**✅ Good:** (Split into separate commits)
```
fix(api): validate email format in user registration
```
```
feat(api): add password strength requirements
```
```
docs: update API documentation for auth endpoints
```

#### Example 5: Code Refactoring
**❌ Bad:**
```
cleanup
```
```
refactor
```
```
made code better
```

**✅ Good:**
```
refactor(database): extract common query logic into repository pattern

Moved repeated database query logic from controllers into dedicated 
repository classes. This reduces code duplication and improves testability 
by allowing mock repositories in unit tests.
```

### Common Mistakes to Avoid

1. **Vague Descriptions**
   - ❌ "fix bug" → ✅ "fix(cart): prevent negative quantities in cart items"
   - ❌ "update code" → ✅ "refactor(api): consolidate error handling middleware"

2. **Wrong Tense**
   - ❌ "added feature" → ✅ "add feature"
   - ❌ "fixes issue" → ✅ "fix issue"

3. **Missing Context**
   - ❌ "change color" → ✅ "style(ui): change primary button color to match brand guidelines"

4. **No Type Prefix**
   - ❌ "User profile page" → ✅ "feat(ui): implement user profile page"

5. **Too Long Subject Line**
   - ❌ "fix: resolved the issue where users couldn't log in when they had special characters in their passwords due to encoding problems" 
   - ✅ "fix(auth): handle special characters in password validation"

6. **Bundle Unrelated Changes**
   - ❌ One commit with fixes, features, and documentation
   - ✅ Separate commits for each logical change

## Special Considerations

### Initial Development (0.x.x)
- Major version zero (0.y.z) is for initial development
- Anything may change at any time
- Public API should not be considered stable

### When to Start at 1.0.0
- Public API is defined and stable
- Software is used in production
- Users depend on the stability

## Automation Helpers
When asked to handle git operations, Claude will automatically:
1. Analyze changes without prompting
2. Categorize each change by type
3. Create new branch if needed
4. Stage appropriate files
5. Generate and execute commit with proper message
6. Push to remote repository immediately
7. Report operation status with details
8. Provide version bump recommendation

## Complete Workflow Example

When Claude analyzes a change request with auto-push enabled:

```bash
# 1. Claude detects: New feature being added
# 2. Automatically creates feature branch
git checkout -b feature/export-pdf

# 3. Makes commits with proper messages
git add src/export/pdf.js
git commit -m "feat(export): add PDF export functionality

- Implement PDF generation using PDFKit
- Add export button to report interface
- Support custom page layouts and formatting

Closes #892"

# 4. AUTOMATICALLY pushes to remote (no user confirmation needed)
git push -u origin feature/export-pdf

# 5. Reports to user:
"✅ Feature branch 'feature/export-pdf' created and pushed
📝 Commit: feat(export): add PDF export functionality
📊 Stats: 3 files changed, 245 insertions(+)
🔗 Create PR: https://github.com/org/repo/pull/new/feature/export-pdf
📈 Version impact: Will trigger v1.5.0 (minor bump) when merged"

# 6. After PR is merged, for release:
git checkout main
git pull origin main
git tag -a v1.5.0 -m "Release version 1.5.0

Features:
- PDF export functionality (#892)"
git push origin v1.5.0
```

### Key Auto-Push Behaviors

1. **No Confirmation Prompts**: Claude executes git commands automatically
2. **Immediate Feedback**: Reports success/failure after each operation
3. **Smart Branching**: Creates and pushes branches without asking
4. **Error Recovery**: Handles failures gracefully without user panic
5. **Complete Automation**: From analysis to pushed commits in seconds