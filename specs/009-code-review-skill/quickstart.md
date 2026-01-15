# Quickstart: Code Review Skill

**Feature**: 009-code-review-skill
**Date**: 2026-01-15

## Overview

This guide helps you get started with the code-review skill for comprehensive code review in Claude Code.

---

## Installation

The code-review skill is a Claude Code skill (markdown file). No installation required beyond having Claude Code configured.

### Prerequisites

1. **Git repository**: The skill requires git for diff generation
2. **Claude Code**: Installed and authenticated
3. **For sp:review**: Beads initialized (`npx bd init`)

---

## Basic Usage

### Review Uncommitted Changes

```bash
# In Claude Code, simply invoke:
/code-review
```

This reviews all uncommitted changes in your working directory.

### Review Staged Changes

```bash
/code-review --scope staged
```

Review only what you're about to commit.

### Review Last Commit

```bash
/code-review --scope head
```

Review the most recent commit (useful after committing).

### Review Branch Changes

```bash
/code-review --scope branch --base main
```

Review all changes on your branch vs the main branch.

---

## Output Sections

The review provides these sections:

| Section                          | Purpose                                |
| -------------------------------- | -------------------------------------- |
| **What Changed**                 | Plain English summary of functionality |
| **Does It Work**                 | Assessment of correctness and testing  |
| **Simplicity & Maintainability** | Code clarity and future maintenance    |
| **Test Quality**                 | Test evaluation (when tests present)   |
| **Security Review**              | Security vulnerability analysis        |
| **Recommendations**              | Prioritized action items               |
| **Copy-Paste Prompt**            | Ready-to-use fix prompt                |

---

## Integration with sp:review

For spec-kit workflow integration:

```bash
# Create issues from review findings
/sp:review
```

This:

1. Runs the code-review skill
2. Creates beads issues for each finding
3. Links issues to your feature's epic
4. Skips duplicate issues automatically

### Prerequisites for sp:review

1. Be on a feature branch (`###-feature-name` pattern)
2. Have a spec.md with "Beads Epic" field, OR
3. The command will prompt to create an epic

---

## Example Workflow

### Pre-commit Review

```bash
# Make changes
vim src/feature.ts

# Review before staging
/code-review

# Fix any critical issues
# ... make fixes ...

# Stage and review again
git add -p
/code-review --scope staged

# Commit when clean
git commit -m "feat: add new feature"
```

### Feature Branch Review

```bash
# On feature branch, review all branch changes
/code-review --scope branch --base main

# If using spec-kit workflow, create issues for findings
/sp:review
```

### CI/CD Review (GitHub Actions)

The code-review skill is invoked automatically on PR events via the GitHub workflow.

---

## Severity Levels

Findings are classified by severity:

| Severity     | When to Use                               | Priority              |
| ------------ | ----------------------------------------- | --------------------- |
| **Critical** | Security vulnerabilities, data loss risks | P0 - Fix immediately  |
| **High**     | Significant bugs, test gaps               | P1 - Fix before merge |
| **Medium**   | Code smells, improvements                 | P2 - Should fix       |
| **Low**      | Style issues, documentation               | P3 - Optional         |

---

## Common Scenarios

### "No changes to review"

```bash
# Check if you have changes
git status

# If working on staged changes
/code-review --scope staged
```

### "Very large changeset"

For changesets over 1000 lines, the skill:

- Provides a high-level summary
- Focuses on highest-risk files
- Recommends splitting into smaller PRs

### "Epic not found" (sp:review)

```bash
# Create a feature specification first
/sp:01-specify Your feature description

# Then run sp:review
/sp:review
```

---

## Tips

1. **Review early, review often**: Run `/code-review` before committing to catch issues early
2. **Use scope parameters**: Target your review to relevant changes
3. **Follow up on Critical/High**: These should be fixed before merging
4. **Use Copy-Paste Prompt**: The generated prompt helps implement fixes quickly
5. **Track with sp:review**: Use the sp: integration to track findings as issues

---

## Related Skills

- `/security-review` - Deep security analysis (invoked automatically)
- `/commit` - Create conventional commits after review
- `/sp:06-implement` - Implement fixes from beads issues

---

## Troubleshooting

### Skill not found

Ensure the skill file exists at `.claude/skills/code-review/SKILL.md`.

### Git errors

```bash
# Verify you're in a git repository
git status

# Verify the base ref exists
git rev-parse main
```

### Beads errors

```bash
# Initialize beads if needed
npx bd init

# Check beads status
npx bd stats
```
