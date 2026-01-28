---
name: code-review
description: Launch review.sh for parallel code quality review (security, quality, architecture). Creates beads tasks for findings. Runs in background with Haiku model.
---

# Code Review via review.sh

Run parallel code reviews on TypeScript files using three specialized skills, executed in the background with the Haiku model.

## Quick Usage

```bash
/code-review                     # Review all TypeScript files
/code-review dry run             # Preview what would be reviewed
/code-review the files we changed  # Review staged files
/code-review security only       # Only security review
```

## How It Works

1. **Parse arguments** - Convert natural language to script flags
2. **Detect epic** - Extract from git branch or create new
3. **Launch background agent** - Uses Haiku model for parallel reviews
4. **Run review.sh** - Agent executes three skills in parallel
5. **Create beads tasks** - Findings become trackable tasks
6. **Present summary** - Files reviewed, tasks created, priorities

## Natural Language Arguments

Code-review accepts these patterns:

| You Say                            | Script Flag                                |
| ---------------------------------- | ------------------------------------------ |
| "dry run", "preview"               | `--dry-run`                                |
| "files we changed", "staged files" | `--files $(git diff --name-only --staged)` |
| "security only", "just quality"    | `--skills security-review`                 |
| "files X Y Z"                      | `--files X Y Z`                            |
| "no security", "skip architecture" | `--skills` (filtered list)                 |

## Review Skills (Run in Parallel)

Review.sh invokes three skills concurrently:

### 1. Security Review

- OWASP vulnerabilities (SQL injection, XSS, CSRF)
- Authentication and session issues
- Input validation gaps
- Secrets exposure

### 2. Quality Review

- Correctness and production-readiness
- Test quality (Kent Beck's Test Desiderata)
- Simplicity and maintainability
- Code standards compliance

### 3. Clean Architecture Validator

- Layer boundary violations
- Dependency direction issues
- Interface placement
- Coupling concerns

## Output Format

Review.sh provides a structured summary:

```
Review complete!

Files reviewed: 5 TypeScript files
Skills: security-review, quality-review, clean-architecture-validator

Findings:
- Security: 1 task (1 High)
- Quality: 3 tasks (1 High, 2 Medium)
- Architecture: 0 tasks

Total: 4 tasks created under epic workspace-abc

Next Steps:
- Review tasks: npx bd list --parent workspace-abc
- Start working: npx bd ready --parent workspace-abc
```

## File Discovery

By default, review.sh auto-discovers TypeScript files:

**Scanned directories**:

- `src/` - Implementation code
- `tests/` - Test files
- `functions/` - Cloudflare Functions

**Excluded**:

- `*.spec.ts` - Test files (reviewed but not as implementation)
- `*.test.ts` - Test files
- `node_modules/` - Dependencies
- `.claude/` - Claude Code files
- `dist/` - Build output

**File size limits**:

- Warns if file > 10KB
- Skips if file > 100KB

## Epic Management

Review.sh handles epic detection and creation:

### Automatic Epic Detection

1. Get current branch: `git branch --show-current`
2. Extract feature name: Remove numeric prefix (e.g., "001-feature" → "feature")
3. Find matching epic: Search by feature name in title

### Epic Creation

If no epic found for the branch:

```
No epic found for feature 'my-feature', creating...
Created epic: workspace-abc
```

### Epic Reopening

If epic is closed and findings exist:

```
Reopening closed epic workspace-abc
```

Review.sh ensures the epic is open before creating tasks.

## Task Creation

For each finding, review.sh creates a beads task:

**Task format**:

```
Title: [security-review] SQL Injection in search

Description:
File: src/search.ts
Line: 45
Severity: Critical
Skill: security-review

Problem:
User input concatenated into SQL query without sanitization.

Fix:
Use parameterized queries with proper binding.

Priority: 0 (Critical)
Parent: workspace-abc
```

### Severity to Priority Mapping

| Severity | Priority | Description                                      |
| -------- | -------- | ------------------------------------------------ |
| Critical | 0        | Security vulnerability, data loss risk           |
| High     | 1        | Significant bug, test gap, pattern violation     |
| Medium   | 2        | Code smell, minor bug, improvement opportunity   |
| Low      | 3        | Style issue, optional enhancement, documentation |

## Deduplication

Review.sh checks existing open tasks to avoid duplicates:

1. Queries all open tasks under the epic
2. Passes task list to Claude in review prompt
3. Claude compares findings to existing tasks
4. Only creates NEW findings not already tracked

## Edge Cases

### No TypeScript Files

```
No TypeScript files found to review
```

**Fix**: Ensure you have `.ts` files in `src/`, `tests/`, or `functions/`

### No Findings

```
Review complete!
Files reviewed: 5 TypeScript files
No issues found! ✓
```

All files passed review.

### Lock File Exists

```
Error: review.sh is already running (PID: 12345)
If this is stale, remove .review.lock manually.
```

**Fix**: Check if review is running. If not, remove lock:

```bash
rm .review.lock
```

### Not a Git Repository

```
Error: Not in a git repository or HEAD is detached
```

**Fix**: Run from within a git repository

### Beads Not Initialized

Review.sh handles this gracefully:

- Creates epic even without beads
- Initializes beads if needed
- Creates tasks under new epic

### Authentication Failure (Exit 130)

```
Error: Claude CLI authentication issue (exit code 130)
```

**Fix**: Re-authenticate Claude CLI:

```bash
claude auth
```

## Skill Filtering

Review only specific aspects:

### Security Only

```bash
/code-review security only
```

Runs only the security-review skill.

### Skip Architecture

```bash
/code-review no architecture
```

Runs security-review and quality-review, skips clean-architecture-validator.

### Custom Combination

```bash
/code-review security and quality
```

Runs security-review and quality-review only.

## File Filtering

Review specific files:

### Staged Files

```bash
/code-review the files we changed
```

Reviews only files in git staging area.

### Specific Files

```bash
/code-review files src/auth.ts src/login.ts
```

Reviews only the specified files.

### Pattern Matching

```bash
/code-review files src/**/*.ts
```

Reviews all TypeScript files in src/ (including subdirectories).

## Background Execution

Review.sh runs as a background task:

- ✅ Continue working in main chat
- ✅ Monitor progress via .review.log
- ✅ Parallel skill execution (3 concurrent)
- ✅ Haiku model for cost efficiency

## Logs

Detailed logs are written to `.review.log`:

- Session start/end timestamps
- Configuration (skills, files, flags)
- Skill invocations and outputs
- Task creation details
- Error messages

Use these logs to debug or audit the review.

## Examples

### Basic Usage

```bash
# Review all TypeScript files with all skills
/code-review
```

### Preview Mode

```bash
# See what would be reviewed
/code-review dry run
```

### Review Staged Changes

```bash
# Review only files you're about to commit
/code-review the files we changed
```

### Security-Only Review

```bash
# Quick security scan before commit
/code-review security only
```

### Review Specific Files

```bash
# Review files mentioned in code review feedback
/code-review files src/payment.ts src/checkout.ts
```

## Workflow Integration

### After Implementation

```bash
# Implement feature
/sp:07-implement

# Review what you built
/code-review

# Address findings
npx bd ready  # See tasks created by review
# Work on high-priority findings

# Commit fixes
/commit
```

### Before Pull Request

```bash
# Stage changes
git add .

# Review staged files
/code-review the files we changed

# Fix issues
# (work on tasks created)

# Create PR
/create-pr
```

### Continuous Review

```bash
# Review during development
/code-review files src/new-feature.ts

# Fix issues immediately
# Create commit

# Review again
/code-review files src/new-feature.ts

# Repeat until clean
```

## When to Use Code Review

Use code-review when you want to:

- ✅ Find security vulnerabilities before commit
- ✅ Validate code quality across multiple files
- ✅ Check architectural compliance
- ✅ Get actionable feedback as beads tasks
- ✅ Review before creating a pull request

Don't use code-review for:

- ❌ Git diff review (base..HEAD) - Use `/sp:08-security-review`, `/sp:09-architecture-review`, `/sp:10-code-quality-review` instead
- ❌ Single-file quick checks - Just ask Claude directly
- ❌ Work in progress - Wait until code is ready for review

## Difference from sp:\* Review Commands

| Aspect          | /code-review (this skill)      | /sp:08, /sp:09, /sp:10              |
| --------------- | ------------------------------ | ----------------------------------- |
| **Scope**       | Reviews files directly         | Reviews git diff (base..HEAD)       |
| **When**        | During development             | After implementation phase complete |
| **Files**       | Auto-discover or specify files | All changes in branch               |
| **Integration** | Standalone skill               | Part of spec-kit workflow           |
| **Use case**    | Iterative review during coding | Final review before merge           |

## Performance Tips

### Use Haiku Model (Default)

Review.sh uses Haiku by default for cost-effective reviews. If you need higher quality:

```bash
# Use sonnet model for more thorough review
# (Advanced: requires manual script invocation)
./review.sh --claude-flags '--model sonnet'
```

### Limit File Count

Review fewer files at once for faster results:

```bash
# Review by directory
/code-review files src/auth/**/*.ts

# Review recent changes
/code-review the files we changed
```

### Filter Skills

Run only the skills you need:

```bash
# Quick security check
/code-review security only

# Skip expensive architecture analysis
/code-review no architecture
```

## Troubleshooting

### Reviews Taking Too Long

- Reduce file count (use filters)
- Run specific skills only
- Check .review.log for slow files

### No Tasks Created

- Check if findings were duplicates of existing tasks
- Review .review.log for Claude's output
- Verify epic was detected/created

### Permission Errors

- Ensure you can write to `.review.log`
- Check beads initialization
- Verify git repository access

## Safety Features

Review.sh enforces safety:

- ✅ **Lock file** - Prevents concurrent runs
- ✅ **Timeout** - 30-minute max per skill invocation
- ✅ **Retry logic** - Exponential backoff for transient failures
- ✅ **Deduplication** - Checks existing tasks before creating
- ✅ **File size limits** - Skips very large files
- ✅ **Epic reopening** - Reopens closed epics when needed

## Next Steps After Review

Once review.sh completes:

1. **Check tasks created**:

   ```bash
   npx bd list --parent <epic-id>
   ```

2. **Start with high-priority**:

   ```bash
   npx bd ready --parent <epic-id>
   ```

3. **Work on findings**:
   - Security (P0) - Fix immediately
   - Quality (P1) - Fix before merge
   - Architecture (P1) - Fix before merge
   - Low priority (P3) - Optional improvements

4. **Re-review after fixes**:

   ```bash
   /code-review
   ```

5. **Commit when clean**:
   ```bash
   /commit
   ```
