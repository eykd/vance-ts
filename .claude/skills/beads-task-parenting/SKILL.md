---
name: beads-task-parenting
trigger: Use when creating beads tasks outside the sp:* workflow — during planning sessions, ad hoc reviews, or mid-implementation discoveries. Ensures tasks are correctly parented to the active epic so ralph automation can find them.
---

# beads-task-parenting

## When to use

Creating a task ad hoc — not via sp:05-tasks or a review skill.

## Quick pattern (90% case)

1. Find the active implement task:
   `bd list --status=in_progress --json | jq '.[] | select(.title | contains("[sp:07-implement]"))'`
2. Create with --parent:
   `bd create --title="..." --description="..." --type=task --priority=1 --parent <implement-task-id>`
3. Add deps if needed:
   `bd dep add <new-task> <prerequisite>`

## Why this matters

ralph's leaf-finder scopes to `--parent <epic>`. Orphaned tasks are invisible
to automation — they silently block everything that depends on them.

## No active epic?

Create the task normally. If it's part of a feature in flight, consider whether
an epic should be started first (`sp:01-specify`).
