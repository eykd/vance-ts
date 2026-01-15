# Contract: Code Review Skill Invocation

**Version**: 1.0.0
**Date**: 2026-01-15

## Overview

This contract defines how the code-review skill is invoked across different environments.

---

## Local Invocation (Claude Code CLI)

### Basic Invocation

```bash
# Review uncommitted changes (default)
/code-review

# Review staged changes
/code-review --scope staged

# Review last commit
/code-review --scope head

# Review branch changes vs main
/code-review --scope branch --base main

# Review specific refs
/code-review --scope refs --base abc123 --target def456
```

### Parameters

| Parameter  | Type     | Default   | Description                                                   |
| ---------- | -------- | --------- | ------------------------------------------------------------- |
| `--scope`  | enum     | `working` | What to review: `working`, `staged`, `head`, `branch`, `refs` |
| `--base`   | string   | varies    | Base ref for comparison                                       |
| `--target` | string   | `HEAD`    | Target ref (for `refs` mode)                                  |
| `--paths`  | string[] | all       | Limit review to specific paths                                |
| `--format` | enum     | `full`    | Output format: `full`, `summary`, `findings-only`             |

### Environment Variables

| Variable                    | Purpose               | Example |
| --------------------------- | --------------------- | ------- |
| `CLAUDE_CODE_REVIEW_BASE`   | Default base branch   | `main`  |
| `CLAUDE_CODE_REVIEW_FORMAT` | Default output format | `full`  |

---

## GitHub Actions Invocation

### Workflow Configuration

```yaml
- name: Run Claude Code Review
  uses: anthropics/claude-code-action@v1
  with:
    claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
    prompt: |
      REPO: ${{ github.repository }}
      PR NUMBER: ${{ github.event.pull_request.number }}

      Use the /code-review skill to review this pull request.
      Scope: branch changes from ${{ github.event.pull_request.base.ref }}

      After generating the review, use `gh pr comment` to post the results.
    claude_args: '--allowed-tools "Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*)"'
```

### Context Available in GitHub Actions

| Variable                               | Source         | Description  |
| -------------------------------------- | -------------- | ------------ |
| `github.repository`                    | GitHub context | `owner/repo` |
| `github.event.pull_request.number`     | PR event       | PR number    |
| `github.event.pull_request.base.ref`   | PR event       | Base branch  |
| `github.event.pull_request.head.ref`   | PR event       | Head branch  |
| `github.event.pull_request.user.login` | PR event       | PR author    |

---

## sp:review Command Invocation

### Basic Invocation

```bash
# Review current changes and create beads issues
/sp:review

# Review with specific scope
/sp:review --scope staged
```

### Workflow

1. Determine current feature's epic from:
   - `spec.md` "Beads Epic" field
   - Branch name pattern `###-feature-name`
2. Invoke code-review skill with specified scope
3. Parse findings from structured output
4. For each finding:
   - Check for existing issue (file+line+category match)
   - If duplicate: skip and note
   - If new: create beads issue under epic
5. Report summary of created/skipped issues

### Output

```markdown
## sp:review Results

**Epic**: workspace-053 (009-code-review-skill)
**Findings**: 3 total

### Issues Created

1. [workspace-054] SQL Injection in Search Query (P0)
2. [workspace-055] Missing Test Coverage (P2)

### Skipped (Duplicates)

1. Missing input validation (matches workspace-042)

### Summary

- Created: 2 issues
- Skipped: 1 duplicate
- Epic: workspace-053
```

---

## Skill Chaining

### Invoking Security Review

The code-review skill invokes security-review internally:

```markdown
## Security Review Integration

When analyzing code changes, invoke the /security-review skill for security-specific analysis:

1. Identify files with security-relevant patterns
2. Pass relevant file contents to security-review
3. Incorporate findings into Security Review section
4. Preserve severity classifications from security-review
```

### Invoking Test Quality Review

For test files, apply test quality evaluation:

```markdown
## Test Quality Integration

When changes include test files (_.spec.ts, _.test.ts, test\__.py, _\_test.py):

1. Evaluate test classification (unit/integration/acceptance)
2. Check test properties against Kent Beck's Test Desiderata
3. Identify mocking patterns and appropriateness
4. Flag anti-patterns (shared state, testing framework code, missing assertions)
```

---

## Error Handling

### Common Errors

| Error                  | Cause                      | Resolution                              |
| ---------------------- | -------------------------- | --------------------------------------- |
| `Not a git repository` | Invoked outside git repo   | Run from within a git repository        |
| `No changes to review` | No diff in specified scope | Change scope or make changes            |
| `Base ref not found`   | Invalid base reference     | Verify ref exists with `git rev-parse`  |
| `Epic not found`       | sp:review without epic     | Create epic with `/sp:01-specify` first |

### Graceful Degradation

- If security-review skill unavailable: Note in output, continue without security section
- If beads not initialized: Prompt user to run `npx bd init`
- If very large changeset (1000+ lines): Switch to summary mode with warning

---

## Response Format

### Success Response

```json
{
  "status": "success",
  "scope": "working",
  "filesReviewed": 5,
  "findingsCount": 2,
  "sections": ["what-changed", "does-it-work", "simplicity", "security", "recommendations"],
  "output": "[full markdown review]"
}
```

### Error Response

```json
{
  "status": "error",
  "error": "Not a git repository",
  "suggestion": "Run from within a git repository"
}
```

---

## Compatibility Matrix

| Environment     | Scope Support | Beads Integration | Security Review |
| --------------- | ------------- | ----------------- | --------------- |
| Local CLI       | Full          | Via sp:review     | Yes             |
| GitHub Actions  | Branch only   | Manual            | Yes             |
| Remote Session  | Full          | Via sp:review     | Yes             |
| Non-git context | None          | N/A               | N/A             |
