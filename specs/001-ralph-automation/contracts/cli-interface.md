# CLI Interface Contract: ralph.sh

**Date**: 2026-01-16
**Feature**: 001-ralph-automation

## Command Signature

```
ralph.sh [--dry-run] [--max-iterations N] [--help]
```

## Arguments

| Argument         | Type    | Required | Default | Description                                        |
| ---------------- | ------- | -------- | ------- | -------------------------------------------------- |
| --dry-run        | flag    | No       | false   | Show what would be executed without running Claude |
| --max-iterations | integer | No       | 50      | Maximum number of iterations before exiting        |
| --help           | flag    | No       | -       | Display help message and exit                      |

## Exit Codes

| Code | Name          | Description                                                                     |
| ---- | ------------- | ------------------------------------------------------------------------------- |
| 0    | SUCCESS       | All epic tasks completed successfully                                           |
| 1    | ERROR         | Prerequisites missing, lock conflict, or Claude invocation failed after retries |
| 2    | LIMIT_REACHED | Maximum iterations reached before completion                                    |
| 130  | INTERRUPTED   | User interrupted with Ctrl+C (SIGINT)                                           |

## Output Format

### Standard Output

```
[ralph] <message>
```

All messages prefixed with `[ralph]` for easy filtering.

### Progress Messages

```
[ralph] Starting automation for epic <epic-id>
[ralph] Branch: <branch-name>
[ralph] Max iterations: <N>
[ralph] Iteration <N>: Processing <task-title>
[ralph] Claude invocation complete (exit <code>)
[ralph] Retry <N>/10 in <delay>s...
[ralph] Complete! <N> iterations, <M> tasks completed in <duration>
```

### Error Messages

```
[ralph] ERROR: <error-description>
[ralph] ERROR: sp:02-clarify not complete. Run /sp:02-clarify first.
[ralph] ERROR: Another ralph.sh is running (PID <pid>)
[ralph] ERROR: Epic not found for branch <branch>
[ralph] ERROR: Claude invocation failed after 10 retries
```

## Environment Requirements

| Requirement | Check Command      |
| ----------- | ------------------ |
| Claude CLI  | `which claude`     |
| Beads CLI   | `npx bd --version` |
| Git         | `git --version`    |
| jq          | `which jq`         |
| Bash 5.x    | `bash --version`   |

## File Artifacts

| File          | Purpose                       | Lifecycle                         |
| ------------- | ----------------------------- | --------------------------------- |
| `.ralph.lock` | Prevents concurrent execution | Created on start, removed on exit |

### Lock File Format

```
<PID>
<ISO8601_TIMESTAMP>
<BRANCH_NAME>
```

## Dependencies

### External Commands

- `claude -p "<prompt>"` - Invoke Claude CLI in print mode
- `npx bd ready --json` - Query ready tasks
- `npx bd list --parent <id> --json` - List tasks under epic
- `git branch --show-current` - Get current branch name
- `jq` - JSON parsing

### Beads State Requirements

- Epic must exist matching branch name pattern
- Task `[sp:02-clarify]` must have status "closed"
- Phase tasks must have dependency chain configured
