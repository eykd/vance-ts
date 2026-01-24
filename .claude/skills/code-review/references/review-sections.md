# Review Sections Reference

Detailed guidance for each section of the code review output.

---

## 1. What Changed

**Purpose**: Help non-technical stakeholders understand the changes.

### Content Guidelines

- Write in plain English, avoiding jargon
- Focus on functionality and user-facing impact
- Explain the "why" behind changes
- Summarize in 2-3 bullet points for quick scanning

### Good Examples

```markdown
## What Changed

- Added a new endpoint for users to update their profile picture
- Fixed a bug where checkout would fail when cart items exceeded 100
- Improved page load speed by lazy-loading product images
```

### Bad Examples

```markdown
## What Changed

- Refactored UserController to use dependency injection
- Added try-catch blocks to async handlers
- Updated TypeScript types for the Cart interface
```

The bad examples focus on technical implementation rather than user value.

---

## 2. Does It Work

**Purpose**: Assess correctness, testing, and production-readiness.

**Audience**: Non-technical managers - explain in business terms.

### Evaluation Criteria

| Aspect               | Questions to Answer                                                 |
| -------------------- | ------------------------------------------------------------------- |
| **Tests**            | Are there tests? Do they cover the happy path and edge cases?       |
| **Safety**           | Error handling present? Validation of inputs? Graceful degradation? |
| **Production Ready** | Logging in place? Performance acceptable? Dependencies secure?      |

### Output Format (Non-Technical Language)

```markdown
## Does It Work

- **Tests**: The changes include automated tests that verify the new functionality works correctly in different scenarios
- **Safety**: The code handles errors gracefully and shows helpful messages when things go wrong
- **Production Ready**: Yes, includes proper logging for troubleshooting and won't slow down the system
```

### Good Examples (Plain English)

```markdown
## Does It Work

- **Tests**: Yes - includes tests that verify login works, handles wrong passwords, and prevents lockouts
- **Safety**: Good - validates all user inputs and shows clear error messages when data is invalid
- **Production Ready**: Yes - ready to deploy with monitoring in place
```

### Bad Examples (Too Technical)

```markdown
## Does It Work

- **Tests**: Unit and integration test coverage at 95%, mocks external dependencies
- **Safety**: Try-catch blocks around async operations with proper error propagation
- **Production Ready**: Implements circuit breaker pattern with exponential backoff
```

### Flags to Raise

- Missing tests for new functionality
- Unhandled error paths
- Missing validation on user inputs
- Performance concerns (N+1 queries, blocking operations)
- Missing logging for debugging

### Test Exemptions

The following file types are exempt from unit test requirements. They are covered by build smoke tests or other validation:

| File Pattern                          | Reason                                             |
| ------------------------------------- | -------------------------------------------------- |
| `hugo/**/*.html`                      | Hugo templates - covered by Hugo build smoke test  |
| `hugo/**/*.css`                       | Hugo styles - covered by TailwindCSS build process |
| `*.md`                                | Documentation - no executable code                 |
| `.github/workflows/*.yml`             | CI configs - covered by actionlint validation      |
| Config files (`.json`, `.toml`, etc.) | Configuration - validated by consuming tools       |

Do NOT flag missing tests for these file types. Instead, verify the appropriate validation exists (e.g., Hugo build passes, actionlint runs).

---

## 3. Simplicity & Maintainability

**Purpose**: Evaluate code clarity and long-term maintenance burden.

**Audience**: Non-technical managers - focus on business impact of complexity.

### Evaluation Criteria

| Aspect         | What to Look For                                         |
| -------------- | -------------------------------------------------------- |
| **Complexity** | Cyclomatic complexity, nesting depth, function length    |
| **Patterns**   | Follows project conventions? DRY? Single responsibility? |
| **Concerns**   | Magic numbers? Hardcoded values? Missing abstractions?   |

### Output Format (Non-Technical Language)

```markdown
## Simplicity & Maintainability

- **Complexity**: Low - the code is straightforward and easy for developers to understand
- **Patterns**: Follows the same patterns as the rest of the codebase
- **Concerns**: None - should be easy to modify and extend in the future
```

### Good Examples (Plain English)

```markdown
## Simplicity & Maintainability

- **Complexity**: Low - clear and easy to understand, which reduces future maintenance costs
- **Patterns**: Consistent with existing code, making it easier for the team to work with
- **Concerns**: None - well-organized and should be easy to modify when requirements change
```

### Bad Examples (Too Technical)

```markdown
## Simplicity & Maintainability

- **Complexity**: Cyclomatic complexity of 8, acceptable within threshold
- **Patterns**: Follows SOLID principles and repository pattern
- **Concerns**: Some code duplication but within acceptable DRY tolerance
```

### Common Issues to Flag

- Functions over 50 lines
- More than 3 levels of nesting
- Duplicated logic across files
- Inconsistent naming or patterns
- Over-engineering for simple problems
- Missing documentation on complex logic

---

## 4. Test Quality

**Purpose**: Evaluate test design when test files are included in changes.

> This section only appears when test files (`*.spec.ts`, `*.test.ts`, `test_*.py`, `*_test.py`) are in the diff.

See [test-quality.md](test-quality.md) for detailed evaluation criteria.

### Quick Checklist

- [ ] Tests are behavioral (test what, not how)
- [ ] Tests are readable and self-documenting
- [ ] Tests are fast and deterministic
- [ ] Tests are isolated (no shared mutable state)
- [ ] Tests are specific (clear failure messages)
- [ ] Mocking is appropriate (roles, not values)

---

## 5. Security Review

**Purpose**: Identify security vulnerabilities and risks.

This section invokes the `/security-review` skill automatically.

### Integration

```markdown
## Security Review

[Results from /security-review skill invocation]

### Critical Issues

[List or "None found"]

### High Priority

[List or "None found"]

### Medium Priority

[List or "None found"]

### Low Priority

[List or "None found"]
```

### Common Vulnerability Categories

- **Injection**: SQL injection, command injection, XSS
- **Authentication**: Weak password handling, session issues
- **Authorization**: Missing access control, privilege escalation
- **Data Exposure**: Sensitive data in logs, insecure storage
- **Configuration**: Hardcoded secrets, insecure defaults

---

## 6. Recommendations

**Purpose**: Provide prioritized, actionable items for improvement.

### Priority Levels

| Priority       | Action                                | Timeline                      |
| -------------- | ------------------------------------- | ----------------------------- |
| **Must Fix**   | Critical/High severity - blocks merge | Before approval               |
| **Should Fix** | Medium severity - recommended         | Before or shortly after merge |
| **Consider**   | Low severity - optional improvement   | When time permits             |

### Output Format

```markdown
## Recommendations

1. **Must Fix**: Fix SQL injection vulnerability in search handler (Critical)
2. **Should Fix**: Add test coverage for error handling paths
3. **Consider**: Extract common validation logic to shared utility
```

### Good Recommendations

- Specific: Reference exact file and line
- Actionable: Clear what needs to change
- Justified: Explain why it matters
- Prioritized: Help the author focus

---

## 7. Copy-Paste Prompt for Claude Code

**Purpose**: Provide a ready-to-use prompt for implementing recommendations.

**REQUIRED**: This section MUST be included when there are any findings (Must Fix, Should Fix, or Consider).

### When to Include

**ALWAYS** include this section when there are findings of any priority level.

### Format

```markdown
## Copy-Paste Prompt for Claude Code
```

Fix the following issues identified in code review:

1. SQL injection in src/search/handler.ts:45
   - Replace string concatenation with parameterized query
   - Use db.prepare().bind() pattern

2. Missing test coverage in src/search/handler.spec.ts
   - Add test case for empty search results
   - Add test case for special characters in search term

Start with the security issue first.

```

```

### Guidelines

- Be specific with file paths and line numbers
- Prioritize the order of fixes
- Include context from the review
- Make it copy-paste ready (no placeholders)
- Keep it focused on the recommendations

---

## Section Order

The review should follow this order:

1. Summary (1-3 sentences)
2. What Changed
3. Does It Work
4. Simplicity & Maintainability
5. Test Quality (if applicable)
6. Security Review
7. Findings (structured for parsing)
8. Recommendations
9. Copy-Paste Prompt (if recommendations exist)
10. Review Metadata

---

## Writing Style for Non-Technical Managers

**CRITICAL**: The entire review is written for non-technical managers, not developers.

### Do

- Use technical jargon when it's precise, but always explain it briefly
- Follow technical terms with concise explanations (e.g., "API endpoint - a way for systems to communicate")
- Keep explanations brief - one short phrase or sentence
- Focus on business impact and risk (cost, security, user experience)
- Use analogies sparingly when they clarify complex concepts
- Provide specific examples in accessible language
- Reference file paths and line numbers for developer handoff
- Explain the "why" behind concerns in business terms

### Don't

- Use technical terms without explaining them
- Over-explain or be verbose - keep it concise
- Be overly critical or harsh
- Make vague suggestions
- Focus on style over substance
- Forget to acknowledge what's done well
- Assume technical knowledge

### Examples of Technical Terms with Explanations

**Good** (jargon + brief explanation):

- "SQL injection - inserting malicious database commands - could allow attackers to access customer data"
- "Race condition - when timing issues cause unpredictable behavior - could cause the system to fail when processing large orders"
- "Tight coupling - components depend too heavily on each other - makes the system harder to maintain, increasing future costs"

**Bad** (unexplained jargon):

- "SQL injection vulnerability in prepared statement"
- "Race condition in async handler"
- "Tight coupling violates dependency inversion principle"

**Also Bad** (overly simple without precision):

- "Database security issue"
- "Timing problem"
- "Code organization issue"
