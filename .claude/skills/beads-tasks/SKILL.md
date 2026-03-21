# Beads Task Management

Workflow guide for creating, querying, updating, and closing beads tasks with `br`.

## Gotchas — Read First

| Trap                  | Wrong                                | Correct                                                                                                  |
| --------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| JSON output flag      | `--format json`                      | `--json` (global flag, before or after subcommand)                                                       |
| Start/claim a task    | `br start <id>`                      | `br update <id> --claim` (atomic assign + in_progress)                                                   |
| Priority values       | `"high"`, `"medium"`, `"low"`        | `0-4` or `P0-P4` (integers, 0 = highest; default 2)                                                      |
| JSON field names      | camelCase (`createdAt`, `blockedBy`) | snake_case (`created_at`, `dependency_count`)                                                            |
| Issue type field      | `type`                               | `issue_type` in JSON output                                                                              |
| Ready vs list --ready | `br list --ready` = `br ready`       | **NOT equivalent** — `br ready` uses blocker-aware semantics; `br list --ready` only filters status=open |
| Close reason          | `--close-reason`                     | `br close <id> --reason "..."`                                                                           |

## Task Parenting (ralph automation)

Ad-hoc tasks created during planning, reviews, or mid-implementation **must** be parented to the current branch's `[sp:07-implement]` task — otherwise ralph's leaf-finder ignores them.

**Branch-aware pattern (preferred):**

```bash
# 1. Derive feature name from current branch (strip leading digits)
feature=$(git branch --show-current | sed 's/^[0-9]*-//')

# 2. Find the epic whose title contains the feature name
#    (ralph uses: ascii_downcase, hyphens→spaces, substring match)
epic_id=$(br list --type epic --status open --json | \
  jq -r --arg f "$feature" \
  '.[] | select(.title | ascii_downcase | gsub("-";" ") | contains($f | ascii_downcase | gsub("-";" "))) | .id' | head -n1)

# 3. Find the [sp:07-implement] child of that epic
implement_id=$(br children "$epic_id" --json | \
  jq -r '.[] | select(.title | contains("[sp:07-implement]")) | .id')

# 4. Create with parent
br create --title "Fix edge case in auth" \
  --description "Handle expired tokens gracefully" \
  --parent "$implement_id" --priority 1

# 5. (Optional) Add dependency
br dep add <new-task> <prerequisite>
```

**Filing bugs during testing:**

```bash
feature=$(git branch --show-current | sed 's/^[0-9]*-//')
epic_id=$(br list --type epic --status open --json | \
  jq -r --arg f "$feature" \
  '.[] | select(.title | ascii_downcase | gsub("-";" ") | contains($f | ascii_downcase | gsub("-";" "))) | .id' | head -n1)
impl_id=$(br children "$epic_id" --json | \
  jq -r '.[] | select(.title | contains("[sp:07-implement]")) | .id')
br create --title "Bug: describe the issue" \
  --description "Steps to reproduce and expected behavior" \
  --parent "$impl_id" --priority 1 --add-label "bug"
```

If no matching epic exists, create the task normally and consider starting one with `/sp:01-specify`.

## Quick Command Reference

| Action          | Command                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------ |
| Create task     | `br create --title "..." --description "..." [--parent ID] [--priority 0-4] [--type task]` |
| Create (script) | `br create --title "..." --description "..." --silent` (outputs only ID)                   |
| List open       | `br list` (default: open, limit 50)                                                        |
| List filtered   | `br list --status=in_progress --type=task --assignee=me`                                   |
| Show ready work | `br ready` (blocker-aware, not same as `list --ready`)                                     |
| Show details    | `br show <id> [--children] [--refs] [--json]`                                              |
| Query (DSL)     | `br query "status=open AND priority<=1 AND type=task"`                                     |
| Text search     | `br search "keyword" [--status open] [--limit 20]`                                         |
| Claim task      | `br update <id> --claim`                                                                   |
| Update fields   | `br update <id> --status open --priority 1 --add-label "bug"`                              |
| Close           | `br close <id> [--reason "..."] [--suggest-next]`                                          |
| Close multiple  | `br close id1 id2 id3`                                                                     |
| Add dependency  | `br dep add <blocked> <blocker>`                                                           |
| Dep tree        | `br dep tree <id> [--direction=up\|down\|both]`                                            |
| Epic status     | `br epic status [--eligible-only]`                                                         |
| Children        | `br children <parent-id>`                                                                  |
| Blocked         | `br blocked [--parent <epic-id>]`                                                          |
| Count           | `br count [--status=open] [--type=task]`                                                   |

## Batch Operations

**Core principle: one script, many operations.** Create a single Bash script that executes multiple `br` commands rather than making separate tool calls.

### Batch create with parent

```bash
#!/usr/bin/env bash
set -euo pipefail

parent_id="$1"  # e.g., the [sp:07-implement] task ID

for task in \
  "Implement auth|Add JWT-based auth with login/logout" \
  "Add password hashing|Use bcrypt for secure password storage" \
  "Create auth middleware|Verify JWT tokens on protected routes" \
; do
  IFS='|' read -r title desc <<< "$task"
  id=$(br create --title "$title" --description "$desc" \
    --parent "$parent_id" --priority 2 --silent)
  echo "Created: $id - $title"
done
```

### Claim and work on next ready task

```bash
next=$(br ready --json --limit 1 | jq -r '.[0].id // empty')
if [ -n "$next" ]; then
  br update "$next" --claim
  echo "Claimed: $next"
fi
```

### Bulk close completed tasks

```bash
br close task-1 task-2 task-3 --reason "Sprint cleanup"
```

### Status report

```bash
tasks=$(br list --json --limit 0)
echo "$tasks" | jq -r '
  group_by(.status) |
  map({status: .[0].status, count: length}) |
  .[] | "  \(.status): \(.count)"
'
```

## JSON Output + jq

Always use the `--json` global flag (not `--format json`):

```bash
br list --json                    # Array of task objects
br show <id> --json               # Array with single object (+ dependents)
br ready --json                   # Array of ready tasks
br create --title "..." --json    # Created task object
```

**Actual field names** (snake_case, from live CLI output):

```
id, title, description, status, priority (int), issue_type,
owner, assignee, created_at, created_by, updated_at,
closed_at, close_reason, dependency_count, dependent_count,
comment_count, parent_id, labels, metadata
```

### Common jq patterns

```bash
# Extract IDs
br list --json | jq -r '.[].id'

# Filter by status
br list --json | jq '.[] | select(.status == "in_progress")'

# Count by status
br list --json | jq 'group_by(.status) | map({s: .[0].status, n: length}) | .[]'

# Sort by priority (0 = highest)
br list --json | jq 'sort_by(.priority)'

# Markdown checklist
br ready --json | jq -r '.[] | "- [ ] \(.title) (`\(.id)`)"'
```

## Best Practices

1. **Always include `--description`** when creating tasks — descriptions explain purpose, not just repeat titles
2. **Use `--silent`** in scripts to capture only the ID from `br create`
3. **Use `set -euo pipefail`** in batch scripts to fail fast
4. **Parent to `[sp:07-implement]`** for ad-hoc tasks during active epics
5. **Use `br ready`** (not `br list --ready`) to find truly claimable work
6. **Use `br update --claim`** (not `br start`) to atomically claim a task
7. **Store JSON in a variable** if processing it multiple times to avoid redundant queries
8. **Use `--limit 0`** with `br list` for unlimited results (default is 50)

## References

| File                                                | Contents                                                      |
| --------------------------------------------------- | ------------------------------------------------------------- |
| [cli-reference.md](./references/cli-reference.md)   | Complete command reference from actual `--help` output        |
| [batch-patterns.md](./references/batch-patterns.md) | Detailed batch scripting patterns with 5 recipes              |
| [jq-cookbook.md](./references/jq-cookbook.md)       | jq extraction, filtering, aggregation, and debugging patterns |
