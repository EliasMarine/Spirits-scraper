# Git Commit Metrics Reporter

## Overview
This file defines the comprehensive metrics and reporting system that the AI agent should execute after completing any git commit and push operation. It provides detailed insights into what was accomplished, impact assessment, and actionable next steps.

## Metrics Collection Commands

### 📊 Basic Git Statistics
```bash
# Branch information
CURRENT_BRANCH=$(git branch --show-current)
BRANCH_TYPE=$(echo $CURRENT_BRANCH | cut -d'/' -f1)
REMOTE_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "No upstream")

# Commit statistics  
LAST_COMMIT_HASH=$(git rev-parse HEAD)
LAST_COMMIT_MESSAGE=$(git log -1 --pretty=format:"%s")
LAST_COMMIT_AUTHOR=$(git log -1 --pretty=format:"%an")
LAST_COMMIT_DATE=$(git log -1 --pretty=format:"%ar")

# File change statistics
FILES_CHANGED=$(git diff --stat HEAD~1 HEAD | tail -1 | awk '{print $1}')
LINES_ADDED=$(git diff --stat HEAD~1 HEAD | tail -1 | awk '{print $4}')
LINES_DELETED=$(git diff --stat HEAD~1 HEAD | tail -1 | awk '{print $6}')

# Repository state
TOTAL_COMMITS=$(git rev-list --count HEAD)
REPOSITORY_URL=$(git config --get remote.origin.url)
```

### 📈 Advanced Code Metrics
```bash
# File type breakdown
git diff --stat HEAD~1 HEAD --name-only | sed 's/.*\.//' | sort | uniq -c | sort -nr

# Directory impact analysis
git diff --stat HEAD~1 HEAD --name-only | xargs dirname | sort | uniq -c | sort -nr

# Commit size category
if [ "$LINES_ADDED" -gt 500 ]; then
    COMMIT_SIZE="Large"
elif [ "$LINES_ADDED" -gt 100 ]; then
    COMMIT_SIZE="Medium"
else
    COMMIT_SIZE="Small"
fi

# Language breakdown (if linguist available)
git diff --stat HEAD~1 HEAD --name-only | xargs file | grep -E "\.(js|ts|tsx|jsx|py|java|go|rb):" | cut -d: -f2 | sort | uniq -c
```

### 🎯 Impact Assessment
```bash
# Version impact prediction
case $BRANCH_TYPE in
    "feat")
        VERSION_IMPACT="MINOR version bump when merged"
        ;;
    "fix"|"security"|"perf")
        VERSION_IMPACT="PATCH version bump when merged"
        ;;
    "feat!"*|*"BREAKING CHANGE"*)
        VERSION_IMPACT="MAJOR version bump when merged"
        ;;
    *)
        VERSION_IMPACT="No version bump"
        ;;
esac

# Critical files affected
CRITICAL_FILES=$(git diff --name-only HEAD~1 HEAD | grep -E "(package\.json|Dockerfile|\.env|config|auth|security)" | wc -l)

# Test coverage impact
TEST_FILES=$(git diff --name-only HEAD~1 HEAD | grep -E "(test|spec)" | wc -l)
```

## Comprehensive Metrics Report Template

### 🎯 **Commit Success Report**

```
╭─────────────────────────────────────────────────────────────╮
│                    🎉 GIT OPERATION COMPLETE                │
╰─────────────────────────────────────────────────────────────╯

📋 BRANCH INFORMATION
┌─────────────────────────────────────────────────────────────┐
│ Branch Name:     [CURRENT_BRANCH]                          │
│ Branch Type:     [BRANCH_TYPE]                             │
│ Remote Status:   [REMOTE_BRANCH]                           │
│ Repository:      [REPOSITORY_URL]                          │
└─────────────────────────────────────────────────────────────┘

💾 COMMIT DETAILS  
┌─────────────────────────────────────────────────────────────┐
│ Hash:           [LAST_COMMIT_HASH]                          │
│ Message:        [LAST_COMMIT_MESSAGE]                      │
│ Author:         [LAST_COMMIT_AUTHOR]                       │
│ Time:           [LAST_COMMIT_DATE]                         │
│ Total Commits:  [TOTAL_COMMITS] in repository              │
└─────────────────────────────────────────────────────────────┘

📊 CHANGE STATISTICS
┌─────────────────────────────────────────────────────────────┐
│ Files Modified:     [FILES_CHANGED] files                  │
│ Lines Added:        +[LINES_ADDED]                         │
│ Lines Deleted:      -[LINES_DELETED]                       │
│ Net Change:         [NET_CHANGE]                           │
│ Commit Size:        [COMMIT_SIZE]                          │
└─────────────────────────────────────────────────────────────┘

🎯 FILE TYPE BREAKDOWN
┌─────────────────────────────────────────────────────────────┐
│ TypeScript:         X files                                │
│ JavaScript:         X files                                │
│ CSS/Styles:         X files                                │
│ Documentation:      X files                                │
│ Configuration:      X files                                │
│ Tests:              X files                                │
└─────────────────────────────────────────────────────────────┘

📂 DIRECTORY IMPACT
┌─────────────────────────────────────────────────────────────┐
│ src/components/     XX files                               │
│ src/pages/          XX files                               │
│ docs/               XX files                               │
│ tests/              XX files                               │
│ Other directories:  XX files                               │
└─────────────────────────────────────────────────────────────┘

🔮 IMPACT ASSESSMENT
┌─────────────────────────────────────────────────────────────┐
│ Version Impact:     [VERSION_IMPACT]                       │
│ Critical Files:     [CRITICAL_FILES] affected              │
│ Test Coverage:      [TEST_FILES] test files modified       │
│ Breaking Changes:   [YES/NO]                               │
│ Security Impact:    [LOW/MEDIUM/HIGH]                      │
└─────────────────────────────────────────────────────────────┘

🔗 REPOSITORY LINKS
┌─────────────────────────────────────────────────────────────┐
│ Create PR:          [PR_CREATION_URL]                      │
│ Branch View:        [BRANCH_VIEW_URL]                      │
│ Commit View:        [COMMIT_VIEW_URL]                      │
│ Compare Changes:    [COMPARE_URL]                          │
└─────────────────────────────────────────────────────────────┘

🚀 NEXT STEPS
┌─────────────────────────────────────────────────────────────┐
│ □ Create Pull Request for review                           │
│ □ Run automated tests locally                              │
│ □ Update related documentation if needed                   │
│ □ Notify team members for review                           │
│ □ Check CI/CD pipeline status                              │
└─────────────────────────────────────────────────────────────┘

⏱️  OPERATION SUMMARY
┌─────────────────────────────────────────────────────────────┐
│ Operation Type:     [SINGLE_COMMIT / BUNDLED_CHANGES]      │
│ Scope:              [FOCUSED / COMPREHENSIVE]              │
│ Ready for Review:   ✅ YES                                  │
│ Merge Strategy:     [SQUASH / MERGE / REBASE RECOMMENDED]   │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Guide for AI Agent

### 📋 **Step-by-Step Metrics Collection**

**1. Immediately After `git push` Success:**
```bash
# Collect all metrics using the commands above
echo "📊 Collecting commit metrics..."

# Execute all metric collection commands
# Format results into the comprehensive report template
# Display the formatted report to user
```

**2. Data Collection Sequence:**
```bash
# Basic git info
BRANCH_DATA=$(git branch --show-current)
COMMIT_DATA=$(git log -1 --stat)
CHANGE_DATA=$(git diff --stat HEAD~1 HEAD)

# Advanced metrics
FILE_TYPES=$(git diff --name-only HEAD~1 HEAD | file_type_analysis)
DIRECTORY_IMPACT=$(git diff --name-only HEAD~1 HEAD | directory_analysis)
IMPACT_ASSESSMENT=$(analyze_version_impact $BRANCH_TYPE)

# Generate URLs
PR_URL=$(generate_pr_url $REPOSITORY_URL $BRANCH_NAME)
COMMIT_URL=$(generate_commit_url $REPOSITORY_URL $COMMIT_HASH)
```

**3. Report Generation:**
```bash
# Replace template variables with actual values
# Apply color coding for better readability
# Include relevant emojis and formatting
# Output the complete formatted report
```

## Custom Metrics for Different Branch Types

### 🔧 **fix/** Branch Metrics
```
🐛 BUG FIX SUMMARY
┌─────────────────────────────────────────────────────────────┐
│ Issue Addressed:    [EXTRACTED_FROM_COMMIT_MESSAGE]        │
│ Files Patched:      [COUNT] files                          │
│ Test Coverage:      [PERCENTAGE] of fix covered by tests   │
│ Risk Level:         [LOW/MEDIUM/HIGH]                      │
│ Rollback Plan:      ✅ Available / ❌ Needs Planning        │
└─────────────────────────────────────────────────────────────┘
```

### ✨ **feat/** Branch Metrics
```
🚀 FEATURE DEVELOPMENT SUMMARY
┌─────────────────────────────────────────────────────────────┐
│ Feature Name:       [EXTRACTED_FROM_BRANCH_NAME]           │
│ Components Added:   [COUNT] new components                 │
│ API Endpoints:      [COUNT] new/modified endpoints         │
│ UI Complexity:      [SIMPLE/MODERATE/COMPLEX]              │
│ Dependencies:       [COUNT] new dependencies added         │
└─────────────────────────────────────────────────────────────┘
```

### 📚 **docs/** Branch Metrics
```
📖 DOCUMENTATION UPDATE SUMMARY
┌─────────────────────────────────────────────────────────────┐
│ Documentation Type: [API/USER_GUIDE/TECHNICAL/README]      │
│ Pages Updated:      [COUNT] documentation pages            │
│ New Guides:         [COUNT] new guides created             │
│ Examples Added:     [COUNT] code examples                  │
│ Coverage Improved:  [AREAS] now documented                 │
└─────────────────────────────────────────────────────────────┘
```

### 🎯 **improve/** Branch Metrics (Bundled Changes)
```
🔧 COMPREHENSIVE IMPROVEMENT SUMMARY
┌─────────────────────────────────────────────────────────────┐
│ Improvement Areas:  UI + Performance + Documentation       │
│ Components Enhanced: [LIST_OF_COMPONENTS]                  │
│ Performance Gains:  [ESTIMATED_IMPROVEMENT]                │
│ Documentation:      [PAGES_UPDATED] pages updated          │
│ Overall Impact:     [HIGH/MEDIUM/LOW] user experience      │
└─────────────────────────────────────────────────────────────┘
```

## Performance and Quality Metrics

### ⚡ **Performance Indicators**
```bash
# Bundle size impact (if applicable)
BUNDLE_SIZE_CHANGE=$(estimate_bundle_size_change)

# Code complexity (if tools available)
COMPLEXITY_CHANGE=$(calculate_complexity_change)

# Performance critical files
PERF_FILES=$(git diff --name-only HEAD~1 HEAD | grep -E "(index|main|app|router|store)" | wc -l)
```

### 🔍 **Quality Indicators**
```bash
# Test-to-code ratio
PRODUCTION_FILES=$(git diff --name-only HEAD~1 HEAD | grep -v -E "(test|spec|\.md)" | wc -l)
TEST_FILES=$(git diff --name-only HEAD~1 HEAD | grep -E "(test|spec)" | wc -l)
TEST_RATIO=$(echo "scale=2; $TEST_FILES / $PRODUCTION_FILES * 100" | bc)

# Documentation coverage
DOC_FILES=$(git diff --name-only HEAD~1 HEAD | grep -E "(\.md|docs/)" | wc -l)
```

## Integration Instructions

### 🔌 **AI Agent Integration**

**Add to git-commit-helper.md:**
```markdown
## Post-Commit Metrics Reporting

After every successful `git push`, the AI agent must:

1. Execute metrics collection commands
2. Generate comprehensive report using template
3. Display formatted metrics to user
4. Provide actionable next steps
5. Include relevant links and suggestions

Use the git-metrics-reporter.md file for complete implementation details.
```

**Example Integration:**
```bash
# In AI agent workflow, after successful git push:
echo "✅ Push successful! Generating metrics report..."
source git-metrics-reporter.sh
generate_comprehensive_report
display_formatted_metrics
suggest_next_steps
```

## Customization Options

### 🎨 **Report Styling**
- Color coding for different metric types
- Progress bars for large changes
- Emoji indicators for status
- Expandable sections for detailed info

### 📊 **Additional Metrics**
- Code quality scores (if linting tools available)
- Dependency vulnerability checks
- Performance benchmarks
- Accessibility impact assessment

### 🔔 **Alert Thresholds**
- Large commit warnings (>1000 lines)
- Critical file modification alerts
- Breaking change notifications
- Security-sensitive file updates

This comprehensive metrics system will provide valuable insights after every git operation, helping track progress, impact, and next steps efficiently!