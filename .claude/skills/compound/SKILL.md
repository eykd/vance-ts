# Compound Learning Skill

Capture solutions to problems so future planning and review phases can reference them. Knowledge compounds over time — each feature cycle leaves the project smarter than before.

## When to Use

- After solving a tricky bug or implementation problem
- After fixing issues found during review phases (sp:08, sp:09, sp:10)
- After a production incident or deployment issue
- After discovering a non-obvious pattern or workaround
- When review remediation tasks are resolved

This skill is standalone — it can be invoked at any point, not just within the sp:\* workflow.

## Solution Storage

Solutions are stored in `.specify/solutions/{category}/{slug}.md` with an index at `.specify/solutions/INDEX.md`.

### Categories

| Category              | Covers                                                |
| --------------------- | ----------------------------------------------------- |
| `cloudflare-workers/` | Runtime issues, D1/KV/R2 bindings, environment config |
| `test-coverage/`      | 100% coverage patterns, mocking, istanbul ignores     |
| `clean-architecture/` | Layer violations, dependency direction, DDD patterns  |
| `hugo-build/`         | Template issues, zero-warning policy, asset pipeline  |
| `type-safety/`        | Strict TS, ESLint rules, noUncheckedIndexedAccess     |
| `security/`           | Auth, headers, CSP, input validation                  |
| `performance/`        | Caching, query optimization, bundle size              |
| `tooling/`            | Build tools, pre-commit hooks, dependency conflicts   |

### Solution Document Format

```markdown
# {title}

**Category**: {category}
**Date**: {YYYY-MM-DD}
**Feature**: {branch} (optional)
**Tags**: {tag1}, {tag2}

## Problem

{Symptoms and error messages}

## Root Cause

{Why it happened}

## Solution

{Concrete steps, code patterns, or config changes}

## Prevention

{How to avoid this — spec checklist items, plan considerations, review criteria}

## Related

- {links to related solutions}
```

## Workflow

### Step 1: Identify the Problem

Ask the user what problem was solved, or infer from context:

- Check recent git history for fix/refactor commits
- Check beads for recently closed remediation tasks
- Check user input for a description of the problem

If the user provides a description, use it. Otherwise, ask:

> "What problem did you just solve? Describe the symptoms or error you encountered."

### Step 2: Analyze the Solution

Gather details about the fix:

- Read recent git diffs (`git log --oneline -10`, `git diff HEAD~1..HEAD`)
- Check closed beads tasks for context
- Ask user to confirm or elaborate on the root cause

Extract:

- **Problem**: What went wrong (symptoms, errors)
- **Root cause**: Why it happened (the underlying issue)
- **Solution**: What fixed it (concrete steps, code changes)
- **Prevention**: How to avoid it next time

### Step 3: Auto-Categorize

Based on the problem and solution, suggest a category from the table above.

Present the suggestion to the user:

> "This looks like a **{category}** issue. Sound right?"

Let the user confirm or override.

### Step 4: Generate Solution Document

Create the solution document using the format above.

**Slug generation**: Convert the title to lowercase kebab-case, max 50 characters.

Example: "D1 binding not available in test environment" → `d1-binding-not-available-in-tests`

### Step 5: Write Solution File

1. Create category directory if it doesn't exist:

```bash
mkdir -p .specify/solutions/{category}
```

2. Write the solution document:

```
.specify/solutions/{category}/{slug}.md
```

3. Verify the file was written correctly.

### Step 6: Update INDEX.md

Append the new solution to `.specify/solutions/INDEX.md` under the `## Solutions` section.

Format:

```markdown
### {category}

- [{title}]({category}/{slug}.md) — {one-line summary} ({date})
```

If the category heading already exists, add the entry under it. If not, create the heading.

### Step 7: Report

Output:

```markdown
## Learning Captured

**Title**: {title}
**Category**: {category}
**File**: `.specify/solutions/{category}/{slug}.md`

**Prevention tip**: {one-line prevention summary}

This learning will be referenced automatically during `/sp:03-plan` and review phases.
```

## Guidelines

- Keep solution documents concise and actionable
- Focus on the Prevention section — that's what future phases reference
- Use specific error messages and code patterns, not vague descriptions
- Link to related solutions when patterns connect
- One solution per document — don't combine unrelated issues
