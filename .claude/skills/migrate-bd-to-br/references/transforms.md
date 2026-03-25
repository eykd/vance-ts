# Document Transform Patterns

## Table of Contents

- [Section Headers](#section-headers)
- [Command Transforms](#command-transforms)
- [Sync Transform (behavioral)](#sync-transform-behavioral)
- [Session End Protocol](#session-end-protocol)
- [Non-Invasive Note](#non-invasive-note)
- [Issue ID Convention](#issue-id-convention)
- [Full File Example](#full-file-example)

---

## Section Headers

| Before                                         | After                                                           |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `## Issue Tracking with bd (beads)`            | `## Issue Tracking with br (beads_rust)`                        |
| `## Beads (bd)`                                | `## Beads (br)`                                                 |
| `[beads](https://github.com/steveyegge/beads)` | `[beads_rust](https://github.com/Dicklesworthstone/beads_rust)` |

---

## Command Transforms

### Simple renames (no behavioral change)

```bash
# Before -> After (all identical except name)
bd ready              -> br ready
bd list               -> br list
bd list --status=open -> br list --status=open
bd show <id>          -> br show <id>
bd create             -> br create
bd update <id>        -> br update <id>
bd update <id> --claim -> br update <id> --claim
bd close <id>         -> br close <id>
bd dep add            -> br dep add
bd stats              -> br stats
bd reopen <id>        -> br reopen <id>
bd epic status        -> br epic status
```

### Comment syntax change

```bash
# Before
bd comment <id> "message"

# After
br comments add <id> "message"
```

### npm invocation removal

```bash
# Before
npx bd list --json

# After
br list --json
```

---

## Sync Transform (behavioral)

This is the ONE behavioral difference. Everything else is name-only.

### Before

```bash
bd sync               # Auto-commits to git
```

### After

```bash
br sync --flush-only  # Exports JSONL only (no git ops)
git add .beads/       # YOU stage
git commit -m "..."   # YOU commit
```

### In workflow context

**Before:**

```bash
git add <files>
bd sync
git push
```

**After:**

```bash
git add <files>
br sync --flush-only
git add .beads/
git commit -m "..."
git push
```

---

## Session End Protocol

### Before

```bash
git status
git add <files>
bd sync
git commit -m "..."
bd sync
git push
git status  # MUST show "up to date with origin"
```

### After

```bash
git status
git add <files>
br sync --flush-only
git add .beads/
git commit -m "..."
git push
git status  # MUST show "up to date with origin"
```

---

## Non-Invasive Note

Add immediately after any beads section header in docs:

```markdown
**Note:** `br` is non-invasive and never executes git commands.
After `br sync --flush-only`, you must manually run
`git add .beads/ && git commit`.
```

---

## Issue ID Convention

Issue ID prefixes in thread_ids, subjects, and reasons:

**Before:**

```markdown
thread_id: bd-123
subject: [bd-123] Feature implementation
reason: bd-123
```

**After:**

```markdown
thread_id: br-123
subject: [br-123] Feature implementation
reason: br-123
```

**Note:** Existing issue IDs in the `.beads/issues.jsonl` database
are preserved as-is during import. Only update ID references in
documentation and templates. The actual IDs from the database
(e.g., `workspace-053`) don't change.

---

## Full File Example

### Before (complete section)

```markdown
## Issue Tracking with bd (beads)

All issue tracking goes through **bd**. No other TODO systems.

Key invariants:

- `.beads/` is authoritative state.
- Do not edit `.beads/*.jsonl` directly; only via `bd`.

### Essential Commands

bd ready # Show issues ready to work
bd list --status=open # All open issues
bd create --title="..." --type=task --priority=2
bd update <id> --status=in_progress
bd close <id> --reason="Completed"
bd sync # Commit and push changes

### Session End Checklist

git status
git add <files>
bd sync
git commit -m "..."
git push
```

### After (complete section)

```markdown
## Issue Tracking with br (beads_rust)

All issue tracking goes through **br** (beads_rust). No other TODO systems.

**Note:** `br` is non-invasive and never executes git commands.
After `br sync --flush-only`, you must manually run
`git add .beads/ && git commit`.

Key invariants:

- `.beads/` is authoritative state.
- Do not edit `.beads/*.jsonl` directly; only via `br`.

### Essential Commands

br ready # Show issues ready to work
br list --status=open # All open issues
br create --title="..." --type=task --priority=2
br update <id> --status=in_progress
br close <id> --reason="Completed"
br sync --flush-only # Export to JSONL (no git ops)

### Session End Checklist

git status
git add <files>
br sync --flush-only
git add .beads/
git commit -m "..."
git push
```

---

## What to Remove Entirely

| Pattern                                  | Reason                    |
| ---------------------------------------- | ------------------------- |
| "bd daemon" / daemon references          | br has no daemon          |
| "auto-commits" / auto-commit assumptions | br never commits          |
| "bd hooks run" / hook installation       | br installs no hooks      |
| "RPC mode"                               | br has no RPC             |
| Dolt references (`bd dolt push/test`)    | br uses SQLite            |
| `npm install --save-dev @beads/bd`       | br is a standalone binary |

## What to Keep Unchanged

| Pattern                                       | Reason            |
| --------------------------------------------- | ----------------- |
| SQLite/WAL cautions                           | br still uses WAL |
| Priority system (P0-P4)                       | Same system       |
| Issue types (bug, feature, task, epic, chore) | Same system       |
| Dependency tracking (dep add/remove/tree)     | Same system       |
| `.beads/` as source of truth                  | Same system       |
| `--json` flag for machine output              | Same system       |
