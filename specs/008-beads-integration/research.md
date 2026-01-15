# Research: Beads CLI Integration

**Feature**: 008-beads-integration
**Date**: 2026-01-15
**Status**: Complete

## Research Questions

### 1. How to initialize beads in a repository?

**Decision**: Use `bd init` (default mode, git-committed)

**Rationale**: Default mode commits the `.beads/` directory to git, providing team visibility and cross-machine sync. This aligns with the clarification that tasks should be git-tracked.

**Command**:

```bash
bd init
```

**Detection of existing initialization**: Check for `.beads/` directory existence before running `bd init`.

**Alternatives considered**:

- `bd init --stealth`: Local-only mode, rejected because we want team visibility
- `bd init --contributor`: Fork workflow, not applicable
- `bd init --team`: Branch workflow, more complex than needed

### 2. How to create epics and map to feature specifications?

**Decision**: Use `bd create` with `-t epic` type and `-p 0` (highest priority)

**Rationale**: Beads supports an `epic` type specifically for parent-level items. Priority 0 ensures the epic appears prominently.

**Command**:

```bash
bd create "Feature: <feature-name>" -t epic -p 0 --json
```

**JSON Output** (example):

```json
{
  "id": "bd-a3f8e9",
  "title": "Feature: Beads Integration",
  "status": "open",
  "priority": 0,
  "issue_type": "epic",
  "created_at": "2025-01-15T10:00:00Z"
}
```

**Epic ID storage**: Store the returned `id` in spec.md metadata or a dedicated `.beads-meta.json` file in the feature directory.

### 3. How to create tasks with parent-child relationships?

**Decision**: Use `bd create` with `--parent <epic-id>` flag

**Rationale**: The `--parent` flag automatically assigns hierarchical IDs (e.g., `bd-a3f8e9.1`, `bd-a3f8e9.2`).

**Commands**:

```bash
# Create task under epic
bd create "User Story 1: Initialize Beads" -p 1 --parent bd-a3f8e9 --json
# Returns: bd-a3f8e9.1

# Create sub-task under task
bd create "Install @beads/bd package" -p 1 --parent bd-a3f8e9.1 --json
# Returns: bd-a3f8e9.1.1
```

**Hierarchy mapping**:
| Spec-Kit Entity | Beads Entity | ID Format |
| --------------- | ------------ | --------- |
| Feature Spec | Epic | `bd-xxxx` |
| User Story | Task | `bd-xxxx.N` |
| Implementation Step | Sub-task | `bd-xxxx.N.M` |

### 4. How to set task dependencies?

**Decision**: Use `bd dep add <child> <parent>` to establish blocking relationships

**Rationale**: This creates a dependency where `child` cannot start until `parent` is complete. The `bd ready` command automatically filters to show only unblocked tasks.

**Commands**:

```bash
# Task bd-a3f8e9.2 depends on bd-a3f8e9.1
bd dep add bd-a3f8e9.2 bd-a3f8e9.1

# View dependency tree
bd dep tree bd-a3f8e9
```

**Parallel tasks**: Tasks without `bd dep add` relationships are considered parallel and will all appear in `bd ready`.

### 5. How to query ready tasks?

**Decision**: Use `bd ready --json` to get machine-readable list of unblocked tasks

**Rationale**: JSON output enables programmatic parsing in command workflows.

**Command**:

```bash
bd ready --json
```

**JSON Output** (example):

```json
[
  {
    "id": "bd-a3f8e9.1",
    "title": "User Story 1: Initialize Beads",
    "status": "open",
    "priority": 1,
    "issue_type": "task"
  }
]
```

**Filtering by epic**: Use `bd list --parent bd-a3f8e9 --status open --json` to get tasks for a specific feature.

### 6. How to update task status?

**Decision**: Use `bd update` for in-progress status, `bd close` for completion

**Rationale**: Separate commands for status update vs. closure provides clear semantic distinction.

**Commands**:

```bash
# Mark task as in-progress
bd update bd-a3f8e9.1 --status in_progress --json

# Mark task as complete
bd close bd-a3f8e9.1 --reason "Implemented successfully" --json
```

**Status values**: `open`, `in_progress`, `closed`

### 7. How to map user story priorities to beads priorities?

**Decision**: Direct mapping P1→1, P2→2, P3→3, etc.

**Rationale**: Beads uses numeric priorities where lower = higher priority. This maps naturally to spec P1/P2/P3 notation.

**Mapping**:
| Spec Priority | Beads Priority |
| ------------- | -------------- |
| P1 (Critical) | 1 |
| P2 (High) | 2 |
| P3 (Medium) | 3 |
| P4+ (Low) | 4+ |

Epic (feature-level) always gets priority 0.

## Package Installation

**Decision**: Install via npm as devDependency

**Command**:

```bash
npm install --save-dev @beads/bd
```

**Verification**:

```bash
npx bd --version
```

**Note**: After npm install, the `bd` command is available via `npx bd` or by adding to PATH.

## Key Findings

1. **Beads is agent-optimized**: JSON output on all commands via `--json` flag
2. **Hash-based IDs prevent merge conflicts**: Safe for multi-agent/multi-branch workflows
3. **Automatic dependency tracking**: `bd ready` shows only unblocked tasks
4. **Hierarchical structure built-in**: Epic → Task → Sub-task via parent-child relationships
5. **Git-native storage**: JSONL files in `.beads/` committed to repository

## Sources

- [Beads GitHub Repository](https://github.com/steveyegge/beads)
- [Beads Quickstart Guide](https://github.com/steveyegge/beads/blob/main/docs/QUICKSTART.md)
- [Introducing Beads (Medium)](https://steve-yegge.medium.com/introducing-beads-a-coding-agent-memory-system-637d7d92514a)
- [The Beads Revolution (Medium)](https://steve-yegge.medium.com/the-beads-revolution-how-i-built-the-todo-system-that-ai-agents-actually-want-to-use-228a5f9be2a9)
