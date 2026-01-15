# Output Format Reference

Structured output format for the code-review skill. This format is designed to be:

1. Human-readable as a standalone review
2. Parseable by the `/sp:review` command for beads issue creation
3. Consistent across all invocation environments

---

## Complete Output Template

````markdown
# Code Review: [Brief Description]

**Scope**: [working|staged|head|branch] changes
**Files**: [N] files changed (+[A]/-[R] lines)
**Date**: [YYYY-MM-DD]

## Summary

[1-3 sentence overview of the changes and overall assessment]

---

## What Changed

[Plain English summary of functionality changes]

- [Bullet point 1]
- [Bullet point 2]

---

## Does It Work

[Assessment of correctness, testing, and production-readiness]

- **Tests**: [Present/Missing/Partial]
- **Safety**: [Assessment]
- **Production Ready**: [Yes/No/Conditional]

---

## Simplicity & Maintainability

[Assessment of code clarity and maintainability]

- **Complexity**: [Low/Medium/High]
- **Patterns**: [Follows standards/Deviates - explain]
- **Concerns**: [List any maintainability concerns]

---

## Test Quality

> This section appears only when test files are included in the changes.

[Evaluation using Kent Beck's Test Desiderata]

- **Classification**: [Unit/Integration/Acceptance mix assessment]
- **Properties**: [Behavioral, readable, fast, deterministic, isolated, specific]
- **Mocking**: [Appropriate/Over-mocked/Under-mocked]
- **Anti-patterns**: [List any detected]

---

## Security Review

[Output from security-review skill invocation]

### Critical Issues

[List or "None found"]

### High Priority

[List or "None found"]

### Medium Priority

[List or "None found"]

### Low Priority

[List or "None found"]

---

## Findings

> Structured findings for automated processing.

### Finding: [Title]

- **Severity**: [Critical|High|Medium|Low]
- **Category**: [security|test|quality|architecture|performance]
- **File**: [relative/path/to/file.ext]
- **Line**: [line number]
- **Description**: [Detailed explanation of the issue]
- **Risk**: [What could go wrong if not addressed]
- **Fix**: [Recommended solution]

```[language]
// Code example showing the fix (optional)
```
````

---

## Recommendations

[Prioritized list of actions before merging]

1. **Must Fix**: [Critical/High items that block merge]
2. **Should Fix**: [Medium items recommended before merge]
3. **Consider**: [Low priority improvements]

---

## Copy-Paste Prompt for Claude Code

> Ready-to-use prompt for implementing recommended changes.

```
[Specific, actionable prompt with file paths and line numbers]
```

---

## Review Metadata

- **Reviewer**: Claude (code-review skill)
- **Duration**: [Approximate review time]
- **Changeset Size**: [Small (<100)|Medium (<500)|Large (<1000)|Very Large (1000+)]
- **Findings Count**: [N] ([Critical]/[High]/[Medium]/[Low])

````

---

## Finding Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `security` | Security vulnerabilities | SQL injection, XSS, auth bypass, secrets exposure |
| `test` | Test quality issues | Missing tests, flaky tests, wrong assertions |
| `quality` | Code quality problems | Dead code, poor naming, high complexity |
| `architecture` | Structural issues | Layer violations, coupling, wrong patterns |
| `performance` | Performance concerns | N+1 queries, memory leaks, blocking calls |

---

## Severity Levels

| Level | Criteria | Beads Priority | Action Required |
|-------|----------|----------------|-----------------|
| `Critical` | Security vulnerability, data loss risk, production blocker | P0 | Fix immediately, blocks merge |
| `High` | Significant bug, test gap, important pattern violation | P1 | Fix before merge |
| `Medium` | Code smell, minor bug, improvement opportunity | P2 | Should fix before merge |
| `Low` | Style issue, optional enhancement, documentation | P3 | Consider fixing |

---

## Parsing Rules for sp:review

The `/sp:review` command parses findings using these patterns:

### Detection Patterns

```text
Finding Start: /^### Finding: (.+)$/
Severity:      /^\- \*\*Severity\*\*: (Critical|High|Medium|Low)$/i
Category:      /^\- \*\*Category\*\*: (security|test|quality|architecture|performance)$/i
File:          /^\- \*\*File\*\*: (.+)$/
Line:          /^\- \*\*Line\*\*: (\d+)$/
Description:   /^\- \*\*Description\*\*: (.+)$/
Risk:          /^\- \*\*Risk\*\*: (.+)$/
Fix:           /^\- \*\*Fix\*\*: (.+)$/
````

### Duplicate Key

Findings are uniquely identified by: `{File}:{Line}:{Category}`

This key is used by `/sp:review` to skip creating duplicate beads issues.

---

## Examples

### Clean Review (No Issues)

```markdown
# Code Review: Add user preferences endpoint

**Scope**: branch changes (main..HEAD)
**Files**: 2 files changed (+45/-10 lines)
**Date**: 2026-01-15

## Summary

Clean implementation of user preferences API endpoint following existing patterns.

## What Changed

- Added GET/PUT endpoints for user preferences
- Implemented validation using existing schema patterns

## Does It Work

- **Tests**: Present (unit and integration)
- **Safety**: Good error handling
- **Production Ready**: Yes

## Simplicity & Maintainability

- **Complexity**: Low
- **Patterns**: Follows existing repository patterns
- **Concerns**: None

## Security Review

### Critical Issues

None found.

### High Priority

None found.

## Findings

No issues found.

## Recommendations

No changes required. Ready to merge.

## Review Metadata

- **Reviewer**: Claude (code-review skill)
- **Changeset Size**: Small
- **Findings Count**: 0
```

### Review with Findings

````markdown
# Code Review: Implement search feature

**Scope**: working changes
**Files**: 5 files changed (+234/-12 lines)
**Date**: 2026-01-15

## Summary

Search implementation with security and test coverage concerns that must be addressed.

## What Changed

- Added search endpoint for products
- Implemented full-text search with D1

## Does It Work

- **Tests**: Partial - missing edge case coverage
- **Safety**: Security concern with query handling
- **Production Ready**: No - security issues

## Simplicity & Maintainability

- **Complexity**: Medium
- **Patterns**: Generally follows patterns
- **Concerns**: Query construction could be cleaner

## Security Review

### Critical Issues

1. SQL Injection in search handler

### High Priority

None found.

## Findings

### Finding: SQL Injection in Search Query

- **Severity**: Critical
- **Category**: security
- **File**: src/search/handler.ts
- **Line**: 45
- **Description**: Search term is concatenated into SQL query without sanitization.
- **Risk**: Attackers could execute arbitrary SQL, exposing or modifying data.
- **Fix**: Use parameterized queries with proper binding.

```typescript
// Use parameterized query
const results = db.prepare('SELECT * FROM items WHERE name LIKE ?').bind(`%${searchTerm}%`).all();
```
````

### Finding: Missing Test for Empty Results

- **Severity**: Medium
- **Category**: test
- **File**: src/search/handler.spec.ts
- **Line**: 0
- **Description**: No test case for when search returns empty results.
- **Risk**: Edge case behavior is undefined and could regress.
- **Fix**: Add test case for empty result handling.

## Recommendations

1. **Must Fix**: SQL injection vulnerability (Critical)
2. **Should Fix**: Add empty results test case

## Copy-Paste Prompt for Claude Code

```
Fix the SQL injection vulnerability in src/search/handler.ts:45 by using a parameterized query. Also add a test case in src/search/handler.spec.ts for empty search results.
```

## Review Metadata

- **Reviewer**: Claude (code-review skill)
- **Changeset Size**: Medium
- **Findings Count**: 2 (1 Critical, 0 High, 1 Medium, 0 Low)

````

---

## Changeset Size Thresholds

| Size | Line Count | Review Approach |
|------|------------|-----------------|
| Small | < 100 | Full detailed review |
| Medium | 100-499 | Full review, prioritize complexity |
| Large | 500-999 | Thorough review, may chunk analysis |
| Very Large | 1000+ | Summary mode, focus on high-risk files |

For very large changesets, include a note:

```markdown
> **Note**: This changeset exceeds 1000 lines. Review focuses on high-risk files.
> Consider splitting into smaller, focused pull requests for more thorough review.
````
