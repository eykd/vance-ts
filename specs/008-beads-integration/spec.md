# Feature Specification: Beads Integration for Spec-Kit Workflow

**Feature Branch**: `008-beads-integration`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "Integrate beads project for spec-kit workflow task tracking. Replace markdown task lists with beads git-backed graph issue tracker. Map specifications to epics, and tasks to beads task hierarchy."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Initialize Beads in Repository (Priority: P1)

As a developer starting a new feature, I want the spec-kit workflow to automatically initialize beads in my repository so that I have a structured task tracking system ready to use.

**Why this priority**: This is the foundational capability that enables all other beads functionality. Without initialization, no other features work.

**Independent Test**: Can be fully tested by running the initialization workflow and verifying the `.beads/` directory exists with proper configuration, delivering immediate value as the foundation for task tracking.

**Acceptance Scenarios**:

1. **Given** a repository without beads initialized, **When** I run `/bd:01-specify` with a feature description, **Then** beads is initialized (via `bd init`) and the specification is created as an epic in beads.
2. **Given** a repository with beads already initialized, **When** I run `/bd:01-specify`, **Then** the existing beads configuration is preserved and a new epic is created.
3. **Given** a repository where `bd init` has already been run, **When** the workflow attempts initialization, **Then** it detects existing configuration and skips re-initialization gracefully.

---

### User Story 2 - Create Specifications as Epics (Priority: P2)

As a developer defining a feature specification, I want the `/bd:01-specify` command to create a beads epic that represents my feature so that all related tasks are organized under a clear hierarchy.

**Why this priority**: This establishes the top-level organizational structure that all subsequent tasks will belong to. Critical for proper hierarchy.

**Independent Test**: Can be fully tested by running `/bd:01-specify` with a feature description and verifying an epic is created in beads with the correct title and description.

**Acceptance Scenarios**:

1. **Given** a feature description provided to `/bd:01-specify`, **When** the command completes, **Then** a beads epic is created with the feature name as title.
2. **Given** a specification with user stories and requirements, **When** the spec is generated, **Then** the epic description contains a reference to the spec.md file path.
3. **Given** an existing epic for the same feature branch, **When** `/bd:01-specify` is run again, **Then** the existing epic is updated rather than creating a duplicate.

---

### User Story 3 - Generate Tasks in Beads Hierarchy (Priority: P3)

As a developer running `/bd:05-tasks`, I want tasks to be created as beads tasks under the feature epic so that I have a dependency-aware task graph instead of a flat markdown list.

**Why this priority**: This is the core value proposition - replacing static markdown with a dynamic, dependency-tracking task graph.

**Independent Test**: Can be fully tested by running `/bd:05-tasks` after a specification exists, and verifying tasks are created in beads with correct parent-child relationships and dependencies.

**Acceptance Scenarios**:

1. **Given** a feature with a completed specification and plan, **When** I run `/bd:05-tasks`, **Then** tasks are created in beads under the feature epic with proper hierarchy (epic > tasks > sub-tasks).
2. **Given** tasks with dependencies (e.g., setup before implementation), **When** tasks are generated, **Then** beads dependency relationships are established using `bd dep add`.
3. **Given** user stories marked P1, P2, P3 in the spec, **When** tasks are generated, **Then** higher-priority user story tasks have appropriate priority values in beads.
4. **Given** parallel tasks marked with [P] in the old format, **When** tasks are generated, **Then** these tasks have no blocking dependencies between them in beads.

---

### User Story 4 - Track Implementation Progress (Priority: P4)

As a developer implementing a feature, I want `/bd:06-implement` to use beads for progress tracking so that task completion is reflected in the git-backed issue tracker.

**Why this priority**: This completes the workflow loop by ensuring implementation progress is tracked in beads rather than just updating markdown checkboxes.

**Independent Test**: Can be fully tested by running `/bd:06-implement`, completing tasks, and verifying beads shows correct task status updates.

**Acceptance Scenarios**:

1. **Given** tasks created in beads for a feature, **When** I run `/bd:06-implement`, **Then** the workflow shows ready tasks from beads using `bd ready`.
2. **Given** a task being worked on, **When** the implementation starts, **Then** the task status is updated in beads.
3. **Given** a completed task, **When** marked as done, **Then** beads reflects the completed status and dependent tasks become available.
4. **Given** multiple parallel tasks ready, **When** querying for next work, **Then** beads returns all tasks without blocking dependencies.

---

### User Story 5 - Query Task Status (Priority: P5)

As a developer or project manager, I want to query the current state of tasks for any feature so that I can understand progress without reading markdown files.

**Why this priority**: Nice-to-have for visibility, but the core workflow functions without explicit querying since `bd ready` provides immediate next actions.

**Independent Test**: Can be fully tested by creating tasks and running beads commands to view task status, hierarchies, and dependencies.

**Acceptance Scenarios**:

1. **Given** a feature with tasks in beads, **When** I request task status, **Then** beads displays all tasks with their current states.
2. **Given** tasks across multiple features, **When** I query by epic, **Then** only tasks for that specific feature are shown.
3. **Given** completed and pending tasks, **When** viewing the task graph, **Then** the dependency relationships and completion status are visible.

---

### User Story 6 - Namespace Swap (Priority: P6)

As a project maintainer, I want to replace the existing `/sp:*` commands with the validated `/bd:*` commands so that beads becomes the default task tracking system.

**Why this priority**: This is the final step that completes the migration. It must happen only after all `/bd:*` commands are validated and working.

**Independent Test**: Can be fully tested by running the swap operation and verifying `/sp:*` commands now use beads while original functionality is preserved.

**Acceptance Scenarios**:

1. **Given** all `/bd:*` commands are validated and working, **When** I run the namespace swap, **Then** `/sp:*` commands are replaced with `/bd:*` implementations.
2. **Given** the namespace swap has completed, **When** I run `/sp:02-specify`, **Then** it creates beads epics (same behavior as `/bd:01-specify` before swap).
3. **Given** the namespace swap has completed, **When** I check the `.claude/commands/` directory, **Then** the `bd/` directory no longer exists and `sp/` contains beads-integrated commands.

---

### Edge Cases

- What happens when `bd` command is not installed when running spec-kit commands?
- How does the system handle network failures during beads sync operations?
- What happens if beads initialization fails partway through?
- How are existing markdown task files migrated for features already in progress?
- What happens when a task in beads is deleted externally while implementation is in progress?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST install `@beads/bd` as a dev dependency when not already present.
- **FR-002**: System MUST initialize beads in the repository (via `bd init`) before creating any epics or tasks.
- **FR-003**: System MUST create a new command namespace `/bd:*` that mirrors the existing `/sp:*` commands but uses beads for task tracking.
- **FR-004**: System MUST create a beads epic when `/bd:01-specify` generates a new specification.
- **FR-005**: System MUST store the beads epic ID in the feature's spec.md or a dedicated metadata file for reference.
- **FR-006**: System MUST generate beads tasks (not markdown checkboxes) when `/bd:05-tasks` is executed.
- **FR-007**: System MUST establish task dependencies in beads when tasks have sequential requirements.
- **FR-008**: System MUST map user story priorities (P1, P2, P3) to beads task priorities.
- **FR-009**: System MUST use `bd ready` to determine which tasks are available for implementation.
- **FR-010**: System MUST update task status in beads when tasks are completed during `/bd:06-implement`.
- **FR-011**: System MUST support hierarchical task structure: epic (specification) > task (user story) > sub-task (implementation step).
- **FR-012**: System MUST gracefully handle the case where beads is already initialized in the repository.
- **FR-013**: System MUST provide clear error messages when beads commands fail.
- **FR-014**: System MUST preserve existing `/sp:*` commands unchanged until final namespace swap.
- **FR-015**: System MUST support a final step to replace `/sp:*` with `/bd:*` after validation.
- **FR-016**: System MUST use default beads sync mode (git-committed, remote-synced) rather than stealth mode.
- **FR-017**: System MUST number `/bd:*` commands starting from 00 (constitution=00, specify=01, clarify=02, plan=03, checklist=04, tasks=05, implement=06, analyze=07, taskstoissues=08).

### Key Entities

- **Epic**: Top-level beads item representing a feature specification. Contains title (feature name), description (reference to spec.md), and owns all tasks for that feature. ID format: `bd-xxxx`.
- **Task**: Mid-level beads item representing a user story or major implementation phase. Belongs to an epic, may have dependencies on other tasks. ID format: `bd-xxxx.N`.
- **Sub-task**: Granular beads item representing a specific implementation step. Belongs to a task, may have dependencies on other sub-tasks. ID format: `bd-xxxx.N.M`.
- **Dependency**: Relationship between tasks indicating one must complete before another can start. Managed via `bd dep add`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All beads-integrated commands (`/bd:01-specify`, `/bd:05-tasks`, `/bd:06-implement`) successfully create and manage items in beads within a single workflow execution.
- **SC-002**: Task dependencies are correctly reflected in beads such that `bd ready` returns only tasks without blocking incomplete dependencies.
- **SC-003**: Users can view feature progress by querying beads without needing to read or parse markdown files.
- **SC-004**: Existing `/sp:*` commands remain unchanged and functional throughout development of `/bd:*` commands.
- **SC-005**: After namespace swap, all new features use beads exclusively for task tracking via `/sp:*` commands.
- **SC-006**: The hierarchical relationship (epic > task > sub-task) is preserved and queryable for any feature.

## Clarifications

### Session 2026-01-15

- Q: How should existing features in progress be migrated? → A: Build new `bd:*` namespace in parallel with existing `sp:*`, then swap namespaces as final step to avoid bootstrapping issues.
- Q: Which beads synchronization mode should be used? → A: Default mode (tasks committed to git and synced with remote for team visibility).
- Q: How should commands be numbered in the new namespace? → A: Start from 00 (e.g., `bd:00-constitution`, `bd:01-specify`, etc.).

## Assumptions

- The `@beads/bd` npm package is publicly available and installable via npm.
- The beads CLI (`bd`) provides JSON output format for programmatic parsing (confirmed via `--json` flag).
- Git is available and configured in the repository (required for beads' git-backed storage).
- The `.beads/` directory will be committed to version control (default beads behavior).
- Beads uses hash-based IDs (e.g., `bd-a1b2`) which eliminates merge conflicts.
- The spec-kit workflow commands (`.claude/commands/sp/*.md`) can be modified to integrate beads calls.
