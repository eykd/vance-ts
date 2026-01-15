# Spec-Kit Commands with Beads Integration

This directory contains the spec-kit workflow commands integrated with [beads](https://github.com/steveyegge/beads) for task tracking.

## Command Reference

| Command                | Description                     | Beads Integration            |
| ---------------------- | ------------------------------- | ---------------------------- |
| `/sp:00-constitution`  | Project constitution management | None                         |
| `/sp:01-specify`       | Create feature specification    | Creates epic in beads        |
| `/sp:02-clarify`       | Clarify requirements            | None                         |
| `/sp:03-plan`          | Create implementation plan      | None                         |
| `/sp:04-checklist`     | Generate checklists             | None                         |
| `/sp:05-tasks`         | Generate implementation tasks   | Creates tasks in beads       |
| `/sp:06-implement`     | Execute implementation          | Tracks progress in beads     |
| `/sp:07-analyze`       | Analyze implementation          | Queries beads status         |
| `/sp:08-taskstoissues` | Export to GitHub issues         | Exports from beads           |
| `/sp:09-review`        | Review code and create issues   | Creates issues from findings |

## Workflow

```text
/sp:01-specify  →  /sp:02-clarify  →  /sp:03-plan  →  /sp:05-tasks  →  /sp:06-implement
     ↓                                                      ↓
  Creates            (optional)         (optional)      Creates         Tracks
  Epic                                                  Tasks           Progress
```

## Beads Integration

These commands use beads for task management:

1. **Task Storage**: Tasks stored in beads (`.beads/`) with git-backed persistence
2. **Dependencies**: Managed via `bd dep add` with automatic blocking detection
3. **Progress**: Tracked via `bd update` and `bd close` with status queries
4. **Queries**: Use `bd ready`, `bd list`, `bd stats` for programmatic status access

## Prerequisites

- `@beads/bd` installed as devDependency: `npm install --save-dev @beads/bd`
- Git repository (required for beads)
- Beads initializes automatically on first use via `/sp:01-specify`

## Quick Start

```bash
# Create a new feature specification (initializes beads, creates epic)
/sp:01-specify Add user authentication

# Generate implementation tasks (creates beads tasks with dependencies)
/sp:05-tasks

# Execute implementation (tracks progress in beads)
/sp:06-implement
```

## Checking Task Status

```bash
# View ready tasks (unblocked)
npx bd ready

# View all tasks for a feature epic
npx bd list --parent <epic-id> --json

# View dependency tree
npx bd dep tree <epic-id>

# Get statistics
npx bd stats
```
