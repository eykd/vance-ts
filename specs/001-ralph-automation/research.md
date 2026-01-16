# Research: Ralph Automation Loop

**Date**: 2026-01-16
**Feature**: 001-ralph-automation

## Research Tasks

### 1. Claude CLI Invocation Pattern

**Question**: How should ralph.sh invoke Claude CLI for non-interactive automation?

**Decision**: Use `claude -p "/sp:next"` (print mode)

**Rationale**:

- The `-p` / `--print` flag runs Claude non-interactively and exits after response
- Prints response to stdout, allowing logging and status inspection
- The `--permission-mode bypassPermissions` can be added if the environment is trusted
- Exit codes can be captured for retry logic

**Alternatives Considered**:

- Interactive mode: Rejected - requires TTY, can't automate
- `--output-format json`: Considered for structured parsing, but text is simpler and sufficient

**Example Invocation**:

```bash
claude -p "/sp:next" 2>&1
exit_code=$?
```

### 2. Beads CLI Ready Task Query

**Question**: How to query ready tasks for a specific epic?

**Decision**: Use `npx bd ready --json` and filter by epic

**Rationale**:

- `bd ready` returns tasks with no blocking dependencies
- JSON output enables programmatic parsing with `jq`
- Filter results to only include tasks under the target epic

**Example**:

```bash
npx bd ready --json 2>/dev/null | jq -r ".[] | select(.id | startswith(\"$epic_id\")) | .id" | head -1
```

**Note**: The `bd ready` output includes all ready tasks across all epics. Must filter to current feature's epic.

### 3. Epic Detection from Branch Name

**Question**: How to find the beads epic ID from the current git branch?

**Decision**: Parse branch name prefix, search beads for matching epic title

**Rationale**:

- Branch names follow pattern: `NNN-feature-name`
- Epics are created with title `Feature: feature-name`
- Use `bd list --type epic --json` and match on title

**Example**:

```bash
branch=$(git branch --show-current)
feature_name=$(echo "$branch" | sed 's/^[0-9]*-//')
epic_id=$(npx bd list --type epic --status open --json 2>/dev/null | \
  jq -r ".[] | select(.title | contains(\"$feature_name\")) | .id" | head -1)
```

### 4. Prerequisite Validation (sp:02-clarify complete)

**Question**: How to verify the clarify phase is complete before starting automation?

**Decision**: Check that the `[sp:02-clarify]` task under the epic has status "closed"

**Rationale**:

- The clarify task ID is stored in spec.md front matter
- Alternatively, query beads for task with `[sp:02-clarify]` in title under epic
- If status is not "closed", exit with guidance message

**Example**:

```bash
clarify_status=$(npx bd list --parent "$epic_id" --json 2>/dev/null | \
  jq -r '.[] | select(.title | contains("[sp:02-clarify]")) | .status')
if [[ "$clarify_status" != "closed" ]]; then
  echo "ERROR: sp:02-clarify not complete. Run /sp:02-clarify first."
  exit 1
fi
```

### 5. Exponential Backoff Implementation

**Question**: How to implement retry with exponential backoff in bash?

**Decision**: Simple loop with calculated delay, capped at 300 seconds

**Rationale**:

- Delays: 1, 2, 4, 8, 16, 32, 64, 128, 256, 300 (capped)
- Formula: `min(2^attempt, 300)`
- Use `sleep` between retries

**Example**:

```bash
retry_with_backoff() {
  local max_retries=10
  local attempt=0
  local delay=1

  while (( attempt < max_retries )); do
    if "$@"; then
      return 0
    fi
    attempt=$((attempt + 1))
    delay=$((delay * 2))
    (( delay > 300 )) && delay=300
    echo "Retry $attempt/$max_retries in ${delay}s..."
    sleep "$delay"
  done
  return 1
}
```

### 6. Lock File Pattern

**Question**: How to prevent concurrent ralph.sh executions?

**Decision**: Create `.ralph.lock` with PID, use `flock` or check-and-create pattern

**Rationale**:

- Lock file in repo root: `.ralph.lock`
- Contains: PID, start timestamp, branch name
- Check for stale locks (process no longer running)
- Clean up on exit (trap SIGINT/EXIT)

**Example**:

```bash
LOCK_FILE=".ralph.lock"

acquire_lock() {
  if [[ -f "$LOCK_FILE" ]]; then
    local old_pid=$(cat "$LOCK_FILE" | head -1)
    if kill -0 "$old_pid" 2>/dev/null; then
      echo "ERROR: Another ralph.sh is running (PID $old_pid)"
      exit 1
    fi
    echo "Removing stale lock file"
    rm -f "$LOCK_FILE"
  fi
  echo "$$" > "$LOCK_FILE"
}

release_lock() {
  rm -f "$LOCK_FILE"
}

trap release_lock EXIT
```

### 7. SIGINT Handling

**Question**: How to handle Ctrl+C gracefully?

**Decision**: Trap SIGINT, clean up lock file, report status, exit cleanly

**Rationale**:

- User should be able to interrupt at any time
- Lock file must be released
- Report how many iterations completed
- Exit with code 130 (standard for SIGINT)

**Example**:

```bash
trap 'echo "Interrupted. Completed $iteration iterations."; release_lock; exit 130' SIGINT
```

## Summary

All technical questions resolved. The implementation approach is:

1. **Invocation**: `claude -p "/sp:next"`
2. **Task query**: `bd ready --json` filtered by epic ID
3. **Epic detection**: Parse branch name → search beads epics
4. **Prerequisites**: Check clarify task status = "closed"
5. **Retry**: Exponential backoff with 10 retries, max 5min delay
6. **Locking**: PID-based lock file with stale detection
7. **Signals**: Trap SIGINT for clean shutdown
