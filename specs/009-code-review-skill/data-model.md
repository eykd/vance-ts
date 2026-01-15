# Data Model: Code Review Skill

**Date**: 2026-01-15
**Feature**: 009-code-review-skill

## Overview

This document defines the conceptual data model for the code-review skill. Since skills are markdown-based prompts (not executable code), this model describes the structured information flow rather than TypeScript types.

---

## Entities

### ReviewScope

Defines what code changes to analyze.

| Field     | Type      | Description                                 | Example                                       |
| --------- | --------- | ------------------------------------------- | --------------------------------------------- |
| mode      | enum      | Scope mode for diff generation              | `working`, `staged`, `head`, `branch`, `refs` |
| baseRef   | string?   | Base reference for comparison               | `main`, `HEAD~1`, `abc123`                    |
| targetRef | string?   | Target reference (defaults to working tree) | `HEAD`, `feature-branch`                      |
| paths     | string[]? | Optional path filters                       | `["src/", "lib/"]`                            |

**Git Command Mapping**:

- `working`: `git diff [paths]`
- `staged`: `git diff --cached [paths]`
- `head`: `git diff HEAD~1 [paths]`
- `branch`: `git diff <baseRef>..HEAD [paths]`
- `refs`: `git diff <baseRef>..<targetRef> [paths]`

---

### ReviewFinding

A single issue or observation from the code review.

| Field       | Type    | Description                      | Example                                                      |
| ----------- | ------- | -------------------------------- | ------------------------------------------------------------ |
| id          | string  | Unique identifier (generated)    | `finding-001`                                                |
| title       | string  | Brief description of the finding | `Missing input validation`                                   |
| severity    | enum    | Impact level                     | `critical`, `high`, `medium`, `low`                          |
| category    | enum    | Classification of finding        | `security`, `test`, `quality`, `architecture`, `performance` |
| file        | string  | Relative file path               | `src/handlers/user.ts`                                       |
| line        | number? | Line number (if applicable)      | `42`                                                         |
| lineEnd     | number? | End line for multi-line issues   | `50`                                                         |
| description | string  | Detailed explanation             | `User input is passed directly to SQL query...`              |
| risk        | string  | What could go wrong              | `SQL injection could expose database`                        |
| fix         | string  | Recommended solution             | `Use parameterized queries`                                  |
| codeExample | string? | Example fix code                 | `db.prepare('SELECT...').bind(userId)`                       |

**Severity Mapping to Beads Priority**:

- `critical` → P0
- `high` → P1
- `medium` → P2
- `low` → P3

---

### ReviewSection

A thematic section of the review output.

| Field    | Type            | Description                |
| -------- | --------------- | -------------------------- |
| name     | string          | Section identifier         |
| title    | string          | Display title              |
| content  | string          | Section content (markdown) |
| findings | ReviewFinding[] | Findings in this section   |

**Standard Sections**:

1. `what-changed` - "What Changed"
2. `does-it-work` - "Does It Work"
3. `simplicity` - "Simplicity & Maintainability"
4. `test-quality` - "Test Quality" (conditional)
5. `security` - "Security Review"
6. `recommendations` - "Recommendations"
7. `copy-paste` - "Copy-Paste Prompt for Claude Code"

---

### ReviewOutput

The complete result of a code review.

| Field    | Type            | Description                 |
| -------- | --------------- | --------------------------- |
| scope    | ReviewScope     | What was reviewed           |
| summary  | string          | One-paragraph summary       |
| sections | ReviewSection[] | Review sections in order    |
| findings | ReviewFinding[] | All findings (aggregated)   |
| metrics  | ReviewMetrics   | Statistics about the review |

---

### ReviewMetrics

Statistics about the reviewed changes.

| Field             | Type    | Description                    |
| ----------------- | ------- | ------------------------------ |
| filesChanged      | number  | Number of files in diff        |
| linesAdded        | number  | Lines added                    |
| linesRemoved      | number  | Lines removed                  |
| totalLines        | number  | Total lines changed            |
| isLargeChangeset  | boolean | Exceeds 1000 lines threshold   |
| testFilesIncluded | boolean | Whether test files are in diff |

---

### BeadsIssue

An issue created in beads from a review finding.

| Field       | Type   | Description               |
| ----------- | ------ | ------------------------- |
| id          | string | Beads issue ID            |
| title       | string | From finding.title        |
| description | string | Formatted from finding    |
| priority    | number | 0-3 mapped from severity  |
| type        | string | Always `task`             |
| parentId    | string | Epic ID from spec.md      |
| status      | string | Always `open` on creation |

**Duplicate Detection Key**: `{file}:{line}:{category}`

---

## State Transitions

### ReviewFinding Lifecycle

```
[Identified] → [Reported in Output] → [Issue Created in Beads] → [Resolved]
                                              ↓
                                      [Skipped as Duplicate]
```

### Review Workflow States

```
[Scope Determined] → [Diff Generated] → [Changes Analyzed] → [Findings Collected]
                                                                    ↓
                                                            [Output Generated]
                                                                    ↓
                                                            [Issues Created] (sp:review only)
```

---

## Validation Rules

### ReviewScope

- `mode` is required
- `baseRef` required when mode is `branch` or `refs`
- `targetRef` required when mode is `refs`

### ReviewFinding

- `title` max 100 characters
- `severity` must be one of: critical, high, medium, low
- `category` must be one of: security, test, quality, architecture, performance
- `file` must be relative path from repo root
- `line` must be positive integer when present

### ReviewOutput

- Must include at least `what-changed` and `recommendations` sections
- `findings` array may be empty (clean review)
- `isLargeChangeset` triggers summarized mode when true

---

## Relationships

```
ReviewScope (1) ──contains──> ReviewOutput (1)
ReviewOutput (1) ──contains──> ReviewSection (many)
ReviewSection (1) ──contains──> ReviewFinding (many)
ReviewFinding (1) ──creates──> BeadsIssue (0..1)
```

---

## Example: Structured Finding Output

````markdown
## Finding: SQL Injection in User Query

- **Severity**: Critical
- **Category**: security
- **File**: src/handlers/user.ts
- **Line**: 42
- **Description**: User ID from request is concatenated directly into SQL query string, allowing SQL injection attacks.
- **Risk**: Attackers could read, modify, or delete any data in the database.
- **Fix**: Use parameterized queries with bound parameters.

```typescript
// Before (vulnerable)
const result = db.prepare(`SELECT * FROM users WHERE id = '${userId}'`);

// After (safe)
const result = db.prepare('SELECT * FROM users WHERE id = ?').bind(userId);
```
````

```

This format is both human-readable and parseable for beads issue creation.
```
