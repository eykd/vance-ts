# Contract: Beads CLI Interface

**Feature**: 008-beads-integration
**Date**: 2026-01-15

This document defines the beads CLI commands used by each `/bd:*` command.

## Command: bd:00-constitution

**Purpose**: Initialize beads and manage project constitution

**Beads CLI Usage**: None (constitution is spec-kit only)

---

## Command: bd:01-specify

**Purpose**: Create feature specification and beads epic

### Beads CLI Commands Used

#### 1. Check if beads is initialized

```bash
# Check for .beads directory
test -d .beads && echo "initialized" || echo "not_initialized"
```

#### 2. Initialize beads (if needed)

```bash
bd init
```

**Expected Output**: Creates `.beads/` directory
**Error Handling**: If already initialized, command is idempotent

#### 3. Create epic for feature

```bash
bd create "Feature: <feature-name>" -t epic -p 0 --description "Spec: specs/<branch>/spec.md" --json
```

**Input**:

- `<feature-name>`: Extracted from feature description
- `<branch>`: Current git branch name

**Expected JSON Output**:

```json
{
  "id": "bd-xxxx",
  "title": "Feature: <name>",
  "status": "open",
  "priority": 0,
  "issue_type": "epic"
}
```

#### 4. Update existing epic (if re-running)

```bash
bd update <epic-id> --title "Feature: <name>" --json
```

---

## Command: bd:02-clarify

**Purpose**: Clarify specification requirements

**Beads CLI Usage**: None (clarification is spec-kit only, no task changes)

---

## Command: bd:03-plan

**Purpose**: Create implementation plan

**Beads CLI Usage**: None (planning is spec-kit only, no task changes)

---

## Command: bd:04-checklist

**Purpose**: Generate implementation checklists

**Beads CLI Usage**: None (checklists are spec-kit only)

---

## Command: bd:05-tasks

**Purpose**: Generate beads tasks from plan

### Beads CLI Commands Used

#### 1. Get epic ID for feature

```bash
bd list --type epic --status open --json | jq '.[] | select(.title | contains("<feature-name>"))'
```

#### 2. Create task for each user story

```bash
bd create "US<N>: <title>" -p <priority> --parent <epic-id> --description "<user-story-text>" --json
```

**Input**:

- `<N>`: User story number (1, 2, 3...)
- `<title>`: User story title from spec
- `<priority>`: P1→1, P2→2, P3→3...
- `<epic-id>`: Epic ID from step 1

**Expected JSON Output**:

```json
{
  "id": "bd-xxxx.N",
  "title": "US1: <title>",
  "status": "open",
  "priority": 1,
  "parent_id": "bd-xxxx"
}
```

#### 3. Create sub-tasks for implementation steps

```bash
bd create "<step-description>" -p <priority> --parent <task-id> --json
```

#### 4. Add dependencies between tasks

```bash
# Setup tasks must complete before implementation
bd dep add <impl-task-id> <setup-task-id>

# Sequential user stories (if applicable)
bd dep add <us2-task-id> <us1-task-id>
```

#### 5. Verify dependency graph

```bash
bd dep cycles  # Should return empty
bd dep tree <epic-id>  # Visual verification
```

---

## Command: bd:06-implement

**Purpose**: Execute implementation tasks

### Beads CLI Commands Used

#### 1. Get ready tasks

```bash
bd ready --json
```

**Expected JSON Output**:

```json
[
  {
    "id": "bd-xxxx.1.1",
    "title": "Install @beads/bd package",
    "status": "open",
    "priority": 1
  }
]
```

#### 2. Mark task in progress

```bash
bd update <task-id> --status in_progress --json
```

#### 3. Mark task complete

```bash
bd close <task-id> --reason "<completion-summary>" --json
```

#### 4. Check remaining work

```bash
bd list --parent <epic-id> --status open --json
```

---

## Command: bd:07-analyze

**Purpose**: Analyze implementation for consistency

### Beads CLI Commands Used

#### 1. Get task statistics

```bash
bd stats --json
```

#### 2. List all tasks for feature

```bash
bd list --parent <epic-id> --json
```

---

## Command: bd:08-taskstoissues

**Purpose**: Convert tasks to GitHub issues

### Beads CLI Commands Used

#### 1. Export tasks

```bash
bd list --parent <epic-id> --status open --json
```

**Output**: JSON array of tasks to convert to GitHub issues

---

## Error Handling

### Common Errors

| Error                    | Cause               | Resolution                                    |
| ------------------------ | ------------------- | --------------------------------------------- |
| `bd: command not found`  | beads not installed | Run `npm install --save-dev @beads/bd`        |
| `not a beads repository` | .beads/ missing     | Run `bd init`                                 |
| `epic not found`         | Invalid parent ID   | Verify epic exists with `bd list --type epic` |
| `circular dependency`    | Invalid dep chain   | Check with `bd dep cycles`                    |

### Graceful Degradation

If beads commands fail:

1. Log error message clearly
2. Suggest manual resolution steps
3. Do not abort entire workflow if possible
