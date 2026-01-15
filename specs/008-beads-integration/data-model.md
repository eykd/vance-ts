# Data Model: Beads Integration

**Feature**: 008-beads-integration
**Date**: 2026-01-15

## Entity Mapping: Spec-Kit → Beads

This document defines how spec-kit workflow entities map to beads entities.

### Epic (Feature Specification)

Represents a feature specification created by `/bd:01-specify`.

| Attribute   | Type     | Description                           | Example                                     |
| ----------- | -------- | ------------------------------------- | ------------------------------------------- |
| id          | string   | Hash-based beads ID                   | `bd-a3f8e9`                                 |
| title       | string   | Feature name prefixed with "Feature:" | `Feature: Beads Integration`                |
| description | string   | Reference to spec.md path             | `Spec: specs/008-beads-integration/spec.md` |
| status      | enum     | open, in_progress, closed             | `open`                                      |
| priority    | number   | Always 0 for epics (highest)          | `0`                                         |
| issue_type  | string   | Always "epic"                         | `epic`                                      |
| created_at  | datetime | ISO 8601 timestamp                    | `2026-01-15T10:00:00Z`                      |
| branch      | string   | Git branch name                       | `008-beads-integration`                     |

**Creation**: `bd create "Feature: <name>" -t epic -p 0 --json`

### Task (User Story)

Represents a user story from the specification, created by `/bd:05-tasks`.

| Attribute   | Type   | Description                     | Example                               |
| ----------- | ------ | ------------------------------- | ------------------------------------- |
| id          | string | Parent ID + numeric suffix      | `bd-a3f8e9.1`                         |
| title       | string | User story title                | `US1: Initialize Beads in Repository` |
| description | string | User story description          | `As a developer...`                   |
| status      | enum   | open, in_progress, closed       | `open`                                |
| priority    | number | Maps from spec P1=1, P2=2, etc. | `1`                                   |
| issue_type  | string | Always "task"                   | `task`                                |
| parent_id   | string | Epic ID                         | `bd-a3f8e9`                           |

**Creation**: `bd create "<title>" -p <priority> --parent <epic-id> --json`

### Sub-task (Implementation Step)

Represents a specific implementation step within a user story.

| Attribute   | Type   | Description                              | Example                            |
| ----------- | ------ | ---------------------------------------- | ---------------------------------- |
| id          | string | Task ID + numeric suffix                 | `bd-a3f8e9.1.1`                    |
| title       | string | Implementation step                      | `Install @beads/bd package`        |
| description | string | Details or file path                     | `npm install --save-dev @beads/bd` |
| status      | enum   | open, in_progress, closed                | `open`                             |
| priority    | number | Inherited from parent task               | `1`                                |
| issue_type  | string | "task" (sub-tasks are just nested tasks) | `task`                             |
| parent_id   | string | Task ID                                  | `bd-a3f8e9.1`                      |

**Creation**: `bd create "<title>" -p <priority> --parent <task-id> --json`

### Dependency

Represents a blocking relationship between tasks.

| Attribute | Type   | Description                   | Example       |
| --------- | ------ | ----------------------------- | ------------- |
| child_id  | string | Task that is blocked          | `bd-a3f8e9.2` |
| parent_id | string | Task that must complete first | `bd-a3f8e9.1` |

**Creation**: `bd dep add <child_id> <parent_id>`

## Hierarchy Visualization

```text
Epic (bd-a3f8e9)
├── Task (bd-a3f8e9.1) - US1: Initialize Beads
│   ├── Sub-task (bd-a3f8e9.1.1) - Install package
│   ├── Sub-task (bd-a3f8e9.1.2) - Run bd init
│   └── Sub-task (bd-a3f8e9.1.3) - Verify .beads/ created
├── Task (bd-a3f8e9.2) - US2: Create Specs as Epics
│   ├── Sub-task (bd-a3f8e9.2.1) - Add epic creation to specify
│   └── Sub-task (bd-a3f8e9.2.2) - Store epic ID in metadata
└── Task (bd-a3f8e9.3) - US3: Generate Tasks
    ├── Sub-task (bd-a3f8e9.3.1) - Parse plan.md
    └── Sub-task (bd-a3f8e9.3.2) - Create beads tasks
```

## State Transitions

### Task Lifecycle

```text
┌──────────┐     bd update      ┌─────────────┐     bd close     ┌────────┐
│   open   │ ────────────────→  │ in_progress │ ──────────────→  │ closed │
└──────────┘   --status         └─────────────┘    --reason       └────────┘
                in_progress
```

### Dependency Rules

1. A task with unresolved dependencies does NOT appear in `bd ready`
2. When a blocking task is closed, dependent tasks become ready
3. Circular dependencies are prevented by `bd dep cycles` check

## Metadata Storage

### Option 1: Spec.md Front Matter (Recommended)

Add beads epic ID to spec.md metadata section:

```markdown
**Feature Branch**: `008-beads-integration`
**Created**: 2026-01-15
**Status**: Draft
**Beads Epic**: `bd-a3f8e9`
```

### Option 2: Dedicated Metadata File

Create `specs/<feature>/beads-meta.json`:

```json
{
  "epic_id": "bd-a3f8e9",
  "created_at": "2026-01-15T10:00:00Z",
  "branch": "008-beads-integration"
}
```

**Decision**: Use Option 1 (spec.md front matter) for simplicity - keeps all feature metadata in one place.

## Validation Rules

1. **Epic uniqueness**: One epic per feature branch
2. **Task hierarchy**: Tasks must have a parent epic; sub-tasks must have a parent task
3. **Priority range**: 0 (epic) through 9 (lowest priority task)
4. **Status progression**: open → in_progress → closed (no backwards transitions)
5. **Dependency acyclicity**: No circular dependency chains allowed
