---
name: code-review
description: Review code changes for quality, correctness, and security. Use when (1) reviewing code before committing, (2) evaluating staged changes, (3) reviewing PR or branch changes, (4) getting feedback on implementation quality, (5) identifying security issues in changes, (6) assessing test coverage and quality, or (7) preparing changes for team review.
---

# Code Review Skill

Comprehensive code review following best practices for quality, security, and maintainability.

## Review Process

1. **Determine scope**: Use git diff based on scope parameter (default: working directory)
2. **Analyze changes**: Understand what changed and why
3. **Evaluate quality**: Check correctness, simplicity, and patterns
4. **Security review**: Invoke `/security-review` skill for security analysis
5. **Test quality**: Evaluate tests when test files are present
6. **Generate output**: Structured report with actionable recommendations

## Scope Parameter

| Scope               | Git Command               | Description            |
| ------------------- | ------------------------- | ---------------------- |
| `working` (default) | `git diff`                | Uncommitted changes    |
| `staged`            | `git diff --cached`       | Staged changes         |
| `head`              | `git diff HEAD~1`         | Last commit            |
| `branch`            | `git diff <base>..HEAD`   | Branch changes vs base |
| `refs`              | `git diff <ref1>..<ref2>` | Custom ref comparison  |

### Usage Examples

```bash
# Review uncommitted changes
/code-review

# Review staged changes
/code-review --scope staged

# Review last commit
/code-review --scope head

# Review branch changes
/code-review --scope branch --base main
```

## Review Sections

See [references/review-sections.md](references/review-sections.md) for detailed guidance on each section:

1. **What Changed**: Plain English summary of functionality
2. **Does It Work**: Correctness, testing, production-readiness
3. **Simplicity & Maintainability**: Code clarity and future maintenance
4. **Test Quality**: When test files present (see [references/test-quality.md](references/test-quality.md))
5. **Security Review**: Via `/security-review` skill invocation
6. **Recommendations**: Prioritized action items
7. **Copy-Paste Prompt**: Ready-to-use fix prompt

## Output Format

See [references/output-format.md](references/output-format.md) for the complete structured format.

### Finding Format (for automated parsing)

```markdown
### Finding: [Title]

- **Severity**: Critical|High|Medium|Low
- **Category**: security|test|quality|architecture|performance
- **File**: path/to/file.ts
- **Line**: 42
- **Description**: What's wrong
- **Risk**: What could go wrong
- **Fix**: How to fix it
```

## Large Changeset Handling

For changesets over 1000 lines:

- Provide high-level summary of all changes
- Focus detailed review on highest-risk files
- Note that full review was not possible due to size
- Recommend splitting into smaller changesets

## Integration with Other Skills

### Security Review

Automatically invoke `/security-review` skill to identify vulnerabilities:

- SQL injection, XSS, CSRF
- Authentication/session issues
- Input validation gaps
- Secrets exposure

### Test Quality

When test files are detected (`*.spec.ts`, `*.test.ts`, `test_*.py`, `*_test.py`):

- Apply Kent Beck's Test Desiderata
- Evaluate test classification (unit/integration/acceptance)
- Check mocking appropriateness
- Flag anti-patterns

## Edge Cases

- **No changes**: Report "No changes detected" and exit gracefully
- **Outside git repo**: Report error explaining git repository requirement
- **Binary files**: Note but don't analyze; focus on text-based source files
- **Very large changesets**: Switch to summary mode with warning

## Review Guidelines

### Audience: Non-Technical Managers

**CRITICAL**: Write the ENTIRE review for non-technical managers, not developers.

- Technical jargon is OK when explained briefly and concisely
- Always follow technical terms with plain English explanation (e.g., "SQL injection - inserting malicious database commands")
- Explain impacts in business terms (risk, cost, user experience)
- Focus on "what" and "why", not implementation details
- Keep explanations concise - don't over-explain
- Keep all sections accessible to non-technical readers

### Prioritize Findings

1. **Critical**: Security vulnerabilities, data loss risks - block merge
2. **High**: Significant bugs, test gaps - fix before merge
3. **Medium**: Code smells, improvements - should fix
4. **Low**: Style issues, documentation - optional

### Focus on Value

- Summarize for non-technical stakeholders
- Explain the "why" not just the "what"
- Provide actionable recommendations
- Include specific file and line references

### Always Include Copy-Paste Prompt

**REQUIRED**: Every review with findings MUST end with a copy-paste prompt in a code block that the customer can paste directly into Claude Code to implement the recommended fixes.
