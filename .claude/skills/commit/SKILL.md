---
name: commit
description: 'Use when: (1) committing session changes, (2) creating conventional commits, (3) handling pre-commit hook failures. TypeScript projects with commitlint and husky.'
allowed-tools: [Bash, Read]
---

# Commit Changes

Create git commits following conventional commit format.

## Process

### 1. Review Changes

```bash
git status
git diff
```

### 2. Stage and Commit

```bash
# Stage specific files (never use -A or .)
git add file1.ts file2.ts dir/

# Commit with proper format
git commit -m "feat: add new feature

- Implement core functionality
- Add comprehensive test coverage"

git log --oneline -n 3
```

## Commit Message Format

```
<type>: <subject>

<body>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

## Important Rules

**NEVER add co-author information:**

- ❌ No "Generated with Claude Code" messages
- ❌ No "Co-Authored-By: Claude" lines
- ✅ Write commit messages as if the user wrote them

**Stage files explicitly:**

- ❌ Never use `git add -A` or `git add .`
- ✅ Always specify files: `git add file1.ts src/utils/`

**Message quality:**

- Use imperative mood ("add feature" not "added feature")
- Subject line: max 100 characters
- Body: explain WHY, not just WHAT

## Pre-commit Hooks

This project has automatic validation:

- Prettier formatting (auto-fixes)
- ESLint with `--max-warnings 0`
- TypeScript type checking
- Jest tests for changed files

Hooks run automatically. If commit fails, fix issues and retry.

## Reference

- **[troubleshooting.md](references/troubleshooting.md)** — Hook failures, message validation, commit scenarios
