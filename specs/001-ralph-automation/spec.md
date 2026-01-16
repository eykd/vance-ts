# Feature Specification: Ralph Automation Loop

**Feature Branch**: `001-ralph-automation`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "Adapt the Ralph Wiggum approach from snarktank/ralph to this repository's sp:\* workflow"
**Beads Epic**: `workspace-9w6`

**Beads Phase Tasks**:

- clarify: `workspace-9w6.1`
- plan: `workspace-9w6.2`
- checklist: `workspace-9w6.3`
- tasks: `workspace-9w6.4`
- implement: `workspace-9w6.5`
- review: `workspace-9w6.6`

## Clarifications

### Session 2026-01-16

- Q: How should ralph.sh handle interactive phases like sp:02-clarify? → A: ralph.sh automates phases 03-09 only; phases 01-02 are manual prerequisites. Script must verify sp:02-clarify is complete before starting, and bail with guidance if not.
- Q: What error recovery strategy for Claude failures/timeouts? → A: Retry up to 10 times with exponential backoff, capped at 5-minute maximum delay between retries; exit on persistent failure.
- Q: How does ralph.sh detect task completion? → A: Beads is source of truth. Loop simply checks `bd ready` for epic tasks each iteration; keep invoking Claude until no ready tasks remain or iteration limit hit. No per-task completion tracking needed.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Automated Feature Completion Loop (Priority: P1)

A developer defines a feature through `sp:01-specify` and clarifies it through `sp:02-clarify`, creating a spec with a beads epic and phase tasks. They then run `ralph.sh` which repeatedly invokes Claude with `/sp:next` prompts until all tasks under the epic are complete. The developer can walk away and return to find the feature implemented.

**Why this priority**: This is the core value proposition - enabling unattended, iterative feature development through a simple automation script.

**Independent Test**: Can be tested by creating a simple spec via `sp:01-specify`, then running `ralph.sh` and observing Claude cycle through clarify → plan → checklist → tasks → implement → review phases automatically.

**Acceptance Scenarios**:

1. **Given** a feature spec exists with a beads epic and phase tasks created via `sp:01-specify`, **When** the user runs `ralph.sh`, **Then** the script invokes Claude with `/sp:next` and begins processing the first ready task.

2. **Given** `ralph.sh` is running and Claude completes a phase task, **When** Claude marks the task complete via `bd close`, **Then** the script detects task completion and invokes Claude again with `/sp:next` for the next ready task.

3. **Given** all phase tasks under the epic are complete, **When** the script checks for remaining work, **Then** `ralph.sh` exits with a success message indicating the feature is complete.

4. **Given** Claude encounters an error or fails to complete a task, **When** the script detects the failure, **Then** it logs the error and either retries or exits gracefully with diagnostic information.

---

### User Story 2 - Progress Persistence Across Iterations (Priority: P1)

Each iteration of the Ralph loop preserves context through git commits, beads task status, and optional progress notes. This ensures that if Claude's context resets between invocations, the next instance can pick up where the previous left off.

**Why this priority**: Without persistence, each Claude invocation would lose progress, making multi-phase workflows impossible.

**Independent Test**: Can be tested by running `ralph.sh`, interrupting it mid-feature, then restarting it - the script should resume from the last completed task.

**Acceptance Scenarios**:

1. **Given** Claude completes a phase task and commits changes, **When** the next Claude instance starts via `ralph.sh`, **Then** it can query `bd ready` to find the next task without re-reading all previous context.

2. **Given** the loop was interrupted (user Ctrl+C or system crash), **When** `ralph.sh` is restarted, **Then** it resumes from the last successfully closed beads task.

3. **Given** multiple implementation tasks exist under `sp:07-implement`, **When** Claude completes each task, **Then** progress is tracked granularly via beads rather than losing context.

---

### User Story 3 - Loop Termination and Safeguards (Priority: P2)

The script includes safeguards to prevent runaway loops: maximum iteration limits, timeout handling, and graceful termination. Users can configure these limits or interrupt the loop at any time.

**Why this priority**: Safety mechanisms are essential to prevent infinite loops or excessive resource consumption, but the core loop must work first.

**Independent Test**: Can be tested by setting a low iteration limit (e.g., 3) and observing the script terminate after 3 cycles regardless of task completion.

**Acceptance Scenarios**:

1. **Given** `ralph.sh` has a configurable maximum iteration count (default: 50), **When** the limit is reached before feature completion, **Then** the script exits with a warning and status report.

2. **Given** the user presses Ctrl+C during execution, **When** the signal is caught, **Then** the script terminates cleanly without corrupting beads state or leaving partial commits.

3. **Given** a single Claude invocation exceeds a timeout threshold, **When** the timeout fires, **Then** the script logs the timeout and proceeds to the next iteration (allowing recovery).

---

### User Story 4 - Visual Progress Feedback (Priority: P3)

While running, the script provides visual feedback showing which phase/task is being processed, iteration count, and elapsed time. This helps developers monitor progress when watching the automation.

**Why this priority**: Nice-to-have UX improvement - the core automation works without it.

**Independent Test**: Can be tested by running `ralph.sh` and observing terminal output shows current task, iteration number, and timing.

**Acceptance Scenarios**:

1. **Given** `ralph.sh` starts a new iteration, **When** it invokes Claude, **Then** it displays the current iteration number and the task being processed.

2. **Given** multiple iterations complete, **When** the feature finishes, **Then** the script displays a summary: total iterations, elapsed time, and tasks completed.

---

### Edge Cases

- What happens when `bd ready` returns no tasks but the epic is not complete (orphaned tasks with unmet dependencies)?
- How does the system handle network failures during Claude invocation?
- What happens when Claude produces no output or hangs indefinitely?
- How are concurrent runs of `ralph.sh` on the same branch prevented?
- Resolved: Interactive phases (sp:01-specify, sp:02-clarify) are manual prerequisites; ralph.sh only automates phases 03-09.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a `ralph.sh` bash script in the repository root that orchestrates the automation loop.
- **FR-002**: System MUST invoke the Claude CLI with `/sp:next` prompt at each iteration to process the next ready task.
- **FR-003**: System MUST query beads via `bd ready` to determine if tasks remain under the current epic.
- **FR-004**: System MUST detect when all epic tasks are complete and terminate the loop successfully.
- **FR-005**: System MUST track iteration count and enforce a configurable maximum limit (default: 50) to prevent infinite loops.
- **FR-006**: System MUST handle SIGINT (Ctrl+C) gracefully, terminating without state corruption.
- **FR-007**: System MUST log each iteration's start, task processed, and outcome to stdout.
- **FR-008**: System MUST detect the active feature epic by reading the current branch name and matching it to a beads epic.
- **FR-009**: System MUST pass context to Claude about which epic to process via the `/sp:next` prompt or environment.
- **FR-010**: System MUST support a `--dry-run` flag that shows what would be executed without invoking Claude.
- **FR-011**: System MUST support a `--max-iterations N` flag to override the default iteration limit.
- **FR-012**: System MUST exit with appropriate exit codes: 0 for success, 1 for failure, 2 for timeout/limit reached.
- **FR-013**: System MUST create a lock file to prevent concurrent runs on the same branch.
- **FR-014**: System MUST verify that sp:02-clarify phase task is closed before starting automation; if not, exit with message guiding user to complete `/sp:01-specify` and `/sp:02-clarify` first.
- **FR-015**: System MUST only automate phases 03-09 (plan, checklist, tasks, implement, review); phases 01-02 (specify, clarify) are manual prerequisites.
- **FR-016**: System MUST retry failed Claude invocations up to 10 times with exponential backoff (max 5-minute delay between retries); exit with failure status after exhausting retries.

### Key Entities

- **Epic**: A beads task of type "epic" representing the entire feature, created by `sp:01-specify`.
- **Phase Task**: A beads task representing a workflow phase (clarify, plan, checklist, tasks, implement, review) with dependencies forming a chain.
- **Implementation Task**: Granular tasks created by `sp:05-tasks` under the implement phase, each representing a single unit of work.
- **Iteration**: A single cycle of the ralph loop: invoke Claude → process task → check completion.
- **Lock File**: A file indicating `ralph.sh` is running on this branch, preventing concurrent execution.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A developer can define a feature via `sp:01-specify` and complete it via `ralph.sh` with zero manual intervention after initial spec creation.
- **SC-002**: The script successfully orchestrates all 6 workflow phases (clarify → plan → checklist → tasks → implement → review) in correct order.
- **SC-003**: Interrupting and restarting `ralph.sh` resumes from the last completed task within one additional iteration.
- **SC-004**: The script terminates within 5 seconds of receiving SIGINT without corrupting state.
- **SC-005**: 90% of simple features (≤10 implementation tasks) complete within 50 iterations.
- **SC-006**: Loop progress is visible to the user within 2 seconds of each iteration starting.

## Assumptions

- The Claude CLI is available and authenticated in the execution environment.
- The beads CLI (`bd`) is installed and initialized in the repository.
- The `sp:*` skills are properly configured and functional.
- Git is available for branch detection and commit operations.
- The terminal supports standard output for progress display.
- Each phase skill (`sp:02-clarify`, `sp:03-plan`, etc.) marks its corresponding beads task complete when finished.
