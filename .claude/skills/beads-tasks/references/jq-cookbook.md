# jq Cookbook for Beads

Practical jq patterns for processing beads JSON output in batch operations.

## Prerequisites

All beads commands support `--json` (global flag) for machine-readable output:

```bash
npx bd list --json
npx bd ready --json
npx bd show <id> --json
```

**Pitfall:** The flag is `--json`, NOT `--format json`. The `--format` flag is for Go template formatting, not JSON output.

## Basic Extraction Patterns

### Get All Task IDs

```bash
npx bd list --json | jq -r '.[].id'
```

### Get Task Titles and IDs

```bash
npx bd list --json | jq -r '.[] | "\(.id): \(.title)"'
```

### Extract Specific Fields

```bash
# Just titles
npx bd list --json | jq -r '.[].title'

# Title, status, and priority
npx bd list --json | jq -r '.[] | "\(.title) | \(.status) | P\(.priority)"'
```

## Filtering Patterns

### Filter by Status

```bash
# All open tasks
npx bd list --json | jq '.[] | select(.status == "open")'

# All closed tasks (need --all to include closed in list output)
npx bd list --json --all | jq '.[] | select(.status == "closed")'

# In-progress tasks
npx bd list --json | jq '.[] | select(.status == "in_progress")'
```

### Filter by Multiple Conditions

```bash
# High priority tasks that are open (priority 0 or 1)
npx bd list --json | jq '.[] | select(.priority <= 1 and .status == "open")'

# Open tasks of a specific type
npx bd list --json | jq '.[] | select(.status == "open" and .issue_type == "task")'

# Tasks with no dependencies
npx bd list --json | jq '.[] | select(.dependency_count == 0)'
```

### Filter by Label Presence

```bash
# Tasks with a specific label (use bd list --label flag instead when possible)
npx bd list --json --label "bug" | jq -r '.[] | .id'

# Tasks with any labels
npx bd list --json | jq '.[] | select(.labels != null and (.labels | length > 0))'

# Tasks without labels
npx bd list --json | jq '.[] | select(.labels == null or (.labels | length == 0))'
```

## Aggregation Patterns

### Count by Status

```bash
npx bd list --json --limit 0 | jq -r '
  group_by(.status) |
  map({status: .[0].status, count: length}) |
  .[] |
  "\(.status): \(.count)"
'
```

### Count by Priority

```bash
npx bd list --json --limit 0 | jq -r '
  group_by(.priority) |
  map({priority: .[0].priority, count: length}) |
  .[] |
  "P\(.priority): \(.count)"
'
```

### Count by Issue Type

```bash
npx bd list --json --limit 0 | jq -r '
  group_by(.issue_type) |
  map({type: .[0].issue_type, count: length}) |
  .[] |
  "\(.type): \(.count)"
'
```

## Sorting Patterns

### Sort by Created Date (Newest First)

```bash
npx bd list --json | jq 'sort_by(.created_at) | reverse | .[]'
```

### Sort by Priority (Highest First, 0 = Highest)

```bash
npx bd list --json | jq 'sort_by(.priority) | .[]'
```

### Sort by Title (Alphabetical)

```bash
npx bd list --json | jq 'sort_by(.title) | .[]'
```

## Transformation Patterns

### Convert to Markdown Checklist

```bash
npx bd ready --json | jq -r '.[] | "- [ ] \(.title) (`\(.id)`)"'
```

### Generate CSV Output

```bash
# Header
echo "ID,Title,Status,Priority"

# Data rows
npx bd list --json | jq -r '
  .[] |
  [.id, .title, .status, .priority] |
  @csv
'
```

### Create JSON Summary Object

```bash
npx bd list --json --limit 0 | jq '{
  total: length,
  by_status: (group_by(.status) | map({(.[0].status): length}) | add),
  open_count: ([.[] | select(.status == "open")] | length),
  in_progress_count: ([.[] | select(.status == "in_progress")] | length)
}'
```

## Complex Queries

### Find Top-Level Tasks (No Parent)

```bash
npx bd list --json --no-parent | jq -r '.[] | "\(.id): \(.title)"'
```

### Find Tasks by Epic

```bash
# List children of a specific parent
npx bd children <epic-id> --json | jq -r '.[] | "\(.id): \(.title) [\(.status)]"'
```

### Find Blocked Tasks with Details

```bash
npx bd blocked --json | jq -r '
  .[] | "\(.id): \(.title) (status: \(.status))"
'
```

## Conditional Logic in jq

### Use Alternative Values

```bash
# Use "none" if assignee is null
npx bd list --json | jq -r '.[] | .assignee // "unassigned"'

# Default for missing fields
npx bd list --json | jq '.[] | .labels // []'
```

### Conditional Field Selection

```bash
# Show different output based on status
npx bd list --json | jq -r '
  .[] |
  if .status == "closed" then
    "DONE \(.title)"
  elif .status == "in_progress" then
    "WIP  \(.title)"
  else
    "TODO \(.title)"
  end
'
```

## Integration with Bash

### Store IDs in Array

```bash
# Store ready task IDs in Bash array
mapfile -t ready_ids < <(npx bd ready --json | jq -r '.[].id')

# Iterate over array
for id in "${ready_ids[@]}"; do
  echo "Processing: $id"
  npx bd update "$id" --claim
done
```

### Conditional Execution Based on Query

```bash
# Check if any tasks are in progress
in_progress=$(npx bd list --json --status=in_progress | jq 'length')

if [ "$in_progress" -gt 0 ]; then
  echo "Tasks in progress: $in_progress"
else
  echo "No tasks in progress"
fi
```

### Capture Single Value

```bash
# Get the first ready task ID
next_task=$(npx bd ready --json --limit 1 | jq -r '.[0].id // empty')

if [ -n "$next_task" ]; then
  echo "Claiming task: $next_task"
  npx bd update "$next_task" --claim
else
  echo "No ready tasks"
fi
```

## Debugging jq Queries

### Pretty Print JSON

```bash
npx bd list --json | jq '.'
```

### View Array Length

```bash
npx bd list --json | jq 'length'
```

### Inspect First Item (see actual field names)

```bash
npx bd list --json | jq '.[0]'
```

### Test Filter Without Processing

```bash
# See how many would be selected
npx bd list --json | jq '[.[] | select(.status == "open")] | length'
```

## Common Pitfalls

### Pitfall: Using `--format json` instead of `--json`

**Problem:** `--format` is for Go template output, not JSON.

**Solution:** Always use `--json` (a global flag):

```bash
# Wrong
npx bd list --format json

# Correct
npx bd list --json
```

### Pitfall: "Cannot index null"

**Problem:** Trying to access a field that doesn't exist on some objects.

**Solution:** Use the optional operator `?` or null coalescing `//`:

```bash
# Bad
jq '.[] | .assignee'

# Good
jq '.[] | .assignee // "none"'
jq '.[] | .assignee?'
```

### Pitfall: Empty Output

**Problem:** Filter is too restrictive or field names are wrong.

**Solution:** Test incrementally and verify field names:

```bash
# Step 1: See all tasks
npx bd list --json | jq '.'

# Step 2: See first task structure (verify field names)
npx bd list --json | jq '.[0]'

# Step 3: Test filter
npx bd list --json | jq '.[] | select(.status == "open")'
```

Remember: fields are **snake_case** (`created_at`, `issue_type`, `dependency_count`), NOT camelCase.

### Pitfall: Using string priority values

**Problem:** Priority is an integer (0-4), not a string.

```bash
# Wrong
jq '.[] | select(.priority == "high")'

# Correct
jq '.[] | select(.priority <= 1)'  # P0 and P1 (highest)
```

### Pitfall: Unexpected Type Errors

**Problem:** Trying to use string operators on arrays or vice versa.

**Solution:** Check types:

```bash
# See type of a field
npx bd list --json | jq '.[0].labels | type'

# Handle arrays vs strings
npx bd list --json | jq '.[] | .labels[]?'  # Iterate array safely
```

## Performance Tips

1. **Use bd's own filters first** — `--status`, `--type`, `--label` filter at the source, reducing JSON size
2. **Filter early in jq** — use `select()` before `sort_by()` or other operations
3. **Limit output** — use `.[0:10]` to take first 10 items if you don't need all
4. **Avoid repeated queries** — store JSON in a variable if you'll process it multiple times

```bash
# Good: Query once
tasks=$(npx bd list --json --limit 0)
echo "$tasks" | jq 'filter expression 1'
echo "$tasks" | jq 'filter expression 2'

# Bad: Query multiple times
npx bd list --json | jq 'filter expression 1'
npx bd list --json | jq 'filter expression 2'
```

## Reference

- [jq Manual](https://jqlang.github.io/jq/manual/)
- [jq Playground](https://jqplay.org/) — test queries online
- CLI reference: see `references/cli-reference.md`
