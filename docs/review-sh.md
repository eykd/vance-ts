# review.sh - Automated Code Quality Review

Automated code quality review script that processes TypeScript files through three Claude skills in parallel, creating beads tasks for all findings.

## Overview

`review.sh` is a companion to `ralph.sh` that automates code quality reviews across your TypeScript codebase. It invokes three specialized Claude skills:

- **security-review**: OWASP vulnerabilities, authentication, data security
- **clean-architecture-validator**: Dependency violations, layer boundaries
- **quality-review**: Correctness, test quality, simplicity, code standards

All findings are automatically tracked as beads tasks under the current feature epic, with severity-based prioritization.

## Quick Start

```bash
# Review all TypeScript files with all skills
./review.sh

# Preview what would be reviewed
./review.sh --dry-run

# Review with specific skills only
./review.sh --skills security-review,quality-review

# Review specific files
./review.sh --files src/index.ts src/utils/calculator.ts
```

## How It Works

1. **File Discovery**: Automatically finds all `.ts` files in `src/`, `tests/`, and `functions/` (excluding test files)
2. **Epic Management**: Detects or creates a code review epic for the current branch
3. **Parallel Execution**: Runs up to 3 concurrent Claude invocations for efficiency
4. **Deduplication**: Provides open tasks context to skills to avoid duplicate findings
5. **Task Creation**: Creates beads tasks with severity-mapped priorities (Critical=P0, High=P1, Medium=P2, Low=P3)
6. **Summary**: Generates copy-paste Claude prompt to fix all Critical/High priority issues

## Command-Line Options

### `--dry-run`

Preview what would be reviewed without invoking Claude.

```bash
./review.sh --dry-run
```

Shows:

- Files that would be reviewed
- Skills that would be run
- Full prompts that would be sent to Claude

### `--skills SKILL1,SKILL2`

Filter which skills to run (comma-separated, no spaces).

Valid skills:

- `security-review`
- `clean-architecture-validator`
- `quality-review`

```bash
# Only security review
./review.sh --skills security-review

# Security and quality, skip architecture
./review.sh --skills security-review,quality-review
```

### `--files FILE1 FILE2 ...`

Review specific files instead of auto-discovery.

```bash
# Review single file
./review.sh --files src/index.ts

# Review multiple files
./review.sh --files src/index.ts src/utils/calculator.ts
```

### `--help`

Show usage information.

### `--version`

Show script version.

## Relationship to ralph.sh

Both scripts work with beads tasks but serve different purposes:

| Feature         | review.sh                 | ralph.sh               |
| --------------- | ------------------------- | ---------------------- |
| Purpose         | Code quality review       | Feature implementation |
| Input           | TypeScript files          | Beads ready tasks      |
| Output          | Beads tasks from findings | Completed beads tasks  |
| Parallelization | ✓ (max 3 concurrent)      | ✗ (sequential)         |
| Skills Used     | 3 review skills           | /sp:next               |
| When to Use     | After writing code        | During development     |

### Typical Workflow

1. **Development**: Use `ralph.sh` to implement features via spec workflow
2. **Review**: Use `review.sh` to find quality/security issues
3. **Fix**: Use Claude or `ralph.sh` to resolve findings
4. **Commit**: Use `/commit` skill to create conventional commits

## Epic Management

### Epic Detection

`review.sh` follows the same epic detection logic as `ralph.sh`:

1. Gets current branch name (e.g., `001-my-feature`)
2. Extracts feature name by removing numeric prefix (`my-feature`)
3. Searches for open epic with matching title

### Epic Creation

If no epic exists for the current branch, `review.sh` creates one:

```
Title: Code Review: my-feature
Type: epic
Priority: 0
Description: Automated code review epic for branch: 001-my-feature
```

### Epic Reopening

If the epic is closed, `review.sh` reopens it before creating new tasks.

## Task Creation

Each finding becomes a beads task with:

**Title**: `[skill-name] Finding Title`

- Example: `[security-review] SQL Injection Risk in User Query`

**Description**:

```
File: src/database/user.ts
Line: 42-45
Severity: Critical
Skill: security-review

Problem:
Direct string interpolation in SQL query allows injection attacks

Fix:
Use parameterized queries with bind() instead of string interpolation
```

**Priority**: Mapped from severity

- Critical → P0
- High → P1
- Medium → P2
- Low → P3

**Parent**: Current feature epic

## Deduplication

To avoid reporting already-tracked issues, `review.sh`:

1. Fetches all open tasks under the current epic
2. Includes this JSON in each skill prompt
3. Instructs skills to compare findings against existing tasks
4. Only reports NEW findings not already tracked

## Parallel Execution

`review.sh` maximizes efficiency by:

- Processing files sequentially
- Running all skills for each file in parallel
- Enforcing max 3 concurrent Claude invocations
- Waiting for completion before summary

Example with 2 files × 3 skills = 6 reviews:

```
Time 0:  security-review(file1)  | clean-arch(file1)  | quality-review(file1)
Time 1:  security-review(file2)  | clean-arch(file2)  | quality-review(file2)
```

## Logging

All operations are logged to `.review.log`:

- Session header with configuration
- Epic initialization
- File discovery results
- Full prompts sent to Claude
- Full outputs received from Claude
- Task creation events
- Session summary

Log file is automatically rotated at 10MB.

Console output shows:

- INFO: Progress and status messages
- WARN: Non-critical issues
- ERROR: Failures and errors

## Lock File

`review.sh` uses `.review.lock` to prevent concurrent runs on the same branch.

Lock file contains:

1. Process ID
2. Timestamp
3. Branch name

The lock is automatically released on exit (success, failure, or Ctrl+C).

If you see "review.sh is already running", either:

- Wait for the other process to complete
- Kill the other process: `kill <PID>`
- Remove stale lock: `rm .review.lock` (only if process not running)

## Summary Output

After completion, `review.sh` displays:

````
[review] =========================================
[review] Summary: Review completed
[review] Tasks created: 5
[review] Elapsed time: 3m 42s
[review] Log file: .review.log
[review] =========================================

## Code Review Summary

Review.sh found 5 issue(s) across the codebase and created beads tasks.

### Tasks Created

- **[Critical] [security-review] SQL Injection Risk** (workspace-abc-123)
  File: src/database/user.ts:42
  Severity: Critical

  Direct string interpolation in SQL query allows injection attacks

  Fix: Use parameterized queries with bind()

...

### Next Steps

You can address these issues by:

1. **Review tasks in beads:**
   ```bash
   npx bd list --parent workspace-abc
````

2. **Start working on high-priority tasks:**

   ```bash
   npx bd ready --parent workspace-abc
   ```

3. **Or ask Claude to fix all Critical and High priority issues:**

   ```
   Please fix all Critical and High priority code review findings:

   - [Critical] SQL Injection Risk in src/database/user.ts:42
     Fix: Use parameterized queries with bind()

   - [High] Missing Input Validation in src/api/handler.ts:23
     Fix: Add zod schema validation
   ```

````

The copy-paste prompt makes it easy to immediately address all high-priority findings.

## Exit Codes

- `0`: Review completed successfully
- `1`: Error occurred (prerequisites failed, Claude failures after retries)
- `130`: Interrupted by SIGINT (Ctrl+C)

## Retry Logic

Claude invocations use exponential backoff:

- Max retries: 10
- Delays: 1s, 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s, 300s (capped at 5min)
- Timeout per invocation: 30 minutes

If a skill fails after all retries, the review continues with remaining skills.

## Error Handling

### No TypeScript Files Found

```bash
[review] No TypeScript files found to review
````

Exits successfully with no action.

### Invalid Skill Name

```bash
Error: Invalid skill 'typo-skill'. Valid skills: security-review clean-architecture-validator quality-review
```

Exits with error.

### File Not Found

```bash
Error: File not found: src/missing.ts
```

Exits with error when using `--files`.

### Epic Not Found

Creates a new epic automatically.

### Closed Epic

Reopens the epic automatically.

### Another Instance Running

```bash
[review] ERROR: review.sh is already running on branch 'master' (PID: 12345)
If this is stale, remove .review.lock manually.
```

Exits with error. Check if process is running with `ps -p 12345`.

## Integration with GitHub Actions

While `review.sh` can run locally, it's designed to integrate with CI/CD:

```yaml
# .github/workflows/code-review.yml
name: Automated Code Review

on:
  push:
    branches: ['**']

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Run code review
        run: ./review.sh
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Tips and Best Practices

### When to Run Reviews

- **After implementing a feature**: Before creating a PR
- **Before committing**: As a pre-commit check
- **After major refactoring**: To ensure quality maintained
- **Periodically**: As part of CI/CD pipeline

### Interpreting Results

- **No findings**: Great! Code is clean
- **Low/Medium findings**: Address at your convenience
- **High findings**: Fix before merge
- **Critical findings**: Fix immediately (security/correctness issues)

### Customizing Skills

To add/remove skills:

1. Update `VALID_SKILLS` array in `review.sh`
2. Ensure skill exists in `.claude/skills/`
3. Use `--skills` flag to test

### Performance Optimization

- Use `--skills` to run only needed reviews
- Use `--files` to review only changed files
- Let `MAX_CONCURRENT=3` handle parallelization
- Don't run multiple `review.sh` instances simultaneously

### Debugging

Check `.review.log` for:

- Full prompts sent to skills
- Full outputs received from skills
- Error messages and stack traces
- Timing information

## Troubleshooting

### "Claude CLI not found"

Install and authenticate:

```bash
npm install -g @anthropic/claude-cli
claude auth
```

### "Beads not initialized"

Initialize beads:

```bash
npx bd init
```

### "Permission denied: ./review.sh"

Make executable:

```bash
chmod +x review.sh
```

### Unexpected task duplicates

Skills use best-effort deduplication. If duplicates occur:

1. Close duplicate tasks manually
2. Improve task descriptions for better matching
3. Run with `--dry-run` to preview before creating tasks

### Slow performance

- Use `--skills` to reduce number of reviews
- Use `--files` to review only changed files
- Check network connectivity (Claude API)
- Verify no other heavy processes running

## Examples

### Daily Development Workflow

```bash
# Work on feature using ralph
./ralph.sh

# Review what you built
./review.sh

# Fix critical/high priority findings
# (use copy-paste prompt from summary)

# Commit everything
# (use /commit skill)
```

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Get staged TypeScript files
staged_files=$(git diff --cached --name-only --diff-filter=ACM | grep '\.ts$' | grep -v '\.spec\.ts$' | grep -v '\.test\.ts$')

if [ -n "$staged_files" ]; then
    echo "Running code review on staged files..."
    ./review.sh --files $staged_files

    # Fail commit if critical issues found
    critical_count=$(npx bd list --priority 0 --status open --json | jq 'length')
    if [ "$critical_count" -gt 0 ]; then
        echo "❌ Cannot commit: $critical_count critical issues found"
        exit 1
    fi
fi
```

### CI/CD Integration

```bash
# Review only changed files in PR
changed_files=$(git diff --name-only origin/main...HEAD | grep '\.ts$' | grep -v '\.spec\.ts$')

if [ -n "$changed_files" ]; then
    ./review.sh --files $changed_files
fi
```

### Focused Security Review

```bash
# Only security review on auth-related files
./review.sh --skills security-review --files \
    src/auth/login.ts \
    src/auth/session.ts \
    src/middleware/auth.ts
```

## See Also

- `ralph.sh` - Automated feature development loop
- `.claude/skills/security-review/SKILL.md` - Security review skill documentation
- `.claude/skills/clean-architecture-validator/SKILL.md` - Architecture review skill documentation
- `.claude/skills/quality-review/SKILL.md` - Quality review skill documentation
- `CLAUDE.md` - Project code quality standards
