# Tasks: Ralph Automation Loop

**Input**: Design documents from `/specs/001-ralph-automation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Beads Epic**: `workspace-9w6`
**Implement Task**: `workspace-9w6.5`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 - Core Automation Loop (Priority: P1) 🎯 MVP

**Goal**: Implement the main ralph.sh loop that invokes Claude repeatedly until all tasks complete

**Independent Test**: Run `./ralph.sh --dry-run` to see what would be executed

**Beads Task**: `workspace-9w6.5.1`

### Implementation for User Story 1

- [x] T001 [US1] Create ralph.sh with shebang and strict mode in `ralph.sh` (`workspace-9w6.5.1.1`)
  - Create file at repo root with `#!/usr/bin/env bash`
  - Add `set -euo pipefail` for strict error handling
  - Make executable with `chmod +x`

- [x] T002 [US1] Implement argument parsing in `ralph.sh` (`workspace-9w6.5.1.2`)
  - Parse `--dry-run` flag (boolean)
  - Parse `--max-iterations N` (default: 50)
  - Parse `--help` flag (show usage and exit)
  - Store in variables: `DRY_RUN`, `MAX_ITERATIONS`

- [x] T003 [US1] Implement epic detection from branch name in `ralph.sh` (`workspace-9w6.5.1.3`)
  - Get current branch: `git branch --show-current`
  - Extract feature name: strip numeric prefix
  - Query beads: `npx bd list --type epic --status open --json`
  - Match epic by title containing feature name
  - Store `EPIC_ID` variable

- [x] T004 [US1] Implement main loop with bd ready check in `ralph.sh` (`workspace-9w6.5.1.4`)
  - While loop: `while (( iteration < MAX_ITERATIONS ))`
  - Query: `npx bd ready --json`
  - Filter tasks by epic ID prefix
  - Break if no ready tasks (success)
  - Increment iteration counter

- [x] T005 [US1] Implement Claude CLI invocation in `ralph.sh` (`workspace-9w6.5.1.5`)
  - Invoke: `claude -p "/sp:next"`
  - Capture exit code: `exit_code=$?`
  - Log output to stdout
  - Handle non-zero exit codes

- [x] T006 [US1] Implement exponential backoff retry logic in `ralph.sh` (`workspace-9w6.5.1.6`)
  - Create `retry_with_backoff()` function
  - Max 10 retries
  - Delays: 1s, 2s, 4s, 8s, 16s, 32s, 64s, 128s, 256s, 300s (capped)
  - Return 1 if all retries exhausted

**Checkpoint**: Core loop functional - can iterate through tasks

---

## Phase 2: User Story 2 - Progress Persistence (Priority: P1)

**Goal**: Enable interruption and resumption via beads state

**Independent Test**: Run ralph.sh, Ctrl+C, restart - should resume from last task

**Beads Task**: `workspace-9w6.5.2` (CLOSED - handled by beads design)

**Note**: Progress persistence is inherent in the beads-based design:

- Beads tracks task completion state
- `bd ready` returns remaining tasks
- No additional implementation needed beyond US1's beads integration

**Checkpoint**: Persistence verified through US1 implementation

---

## Phase 3: User Story 3 - Safeguards and Termination (Priority: P2)

**Goal**: Add safety mechanisms to prevent runaway loops

**Independent Test**: Set `--max-iterations 3` and observe termination

**Beads Task**: `workspace-9w6.5.3`

### Implementation for User Story 3

- [x] T007 [US3] Implement prerequisite validation in `ralph.sh` (`workspace-9w6.5.3.1`)
  - Check Claude CLI: `command -v claude`
  - Check beads init: `test -d .beads`
  - Check clarify complete: query beads for `[sp:02-clarify]` status = "closed"
  - Exit with guidance message if prerequisites not met

- [x] T008 [US3] Implement lock file mechanism in `ralph.sh` (`workspace-9w6.5.3.2`)
  - Create `acquire_lock()` function
  - Lock file: `.ralph.lock`
  - Content: PID, timestamp, branch name
  - Check for stale locks (process not running)
  - Create `release_lock()` function
  - Trap EXIT to release lock

- [x] T009 [US3] Implement SIGINT trap handler in `ralph.sh` (`workspace-9w6.5.3.3`)
  - Trap SIGINT signal
  - Log "Interrupted. Completed N iterations."
  - Call `release_lock()`
  - Exit with code 130

- [x] T010 [P] [US3] Implement max iterations limit in `ralph.sh` (`workspace-9w6.5.3.4`)
  - Check iteration count in main loop
  - Log warning when limit approaching
  - Exit loop when limit reached

- [x] T011 [US3] Implement exit codes in `ralph.sh` (`workspace-9w6.5.3.5`)
  - 0: All tasks complete (success)
  - 1: Error (prerequisites, Claude failures after retries)
  - 2: Max iterations reached
  - 130: SIGINT received

**Checkpoint**: Safeguards complete - script handles all termination cases

---

## Phase 4: User Story 4 - Visual Progress Feedback (Priority: P3)

**Goal**: Provide clear feedback during execution

**Independent Test**: Run ralph.sh and observe logging

**Beads Task**: `workspace-9w6.5.4`

### Implementation for User Story 4

- [x] T012 [P] [US4] Implement iteration start logging in `ralph.sh` (`workspace-9w6.5.4.1`)
  - Log format: `[ralph] Iteration N: Processing <task-title>`
  - Log epic and branch info at startup
  - Log retry attempts with delay info

- [x] T013 [P] [US4] Implement completion summary in `ralph.sh` (`workspace-9w6.5.4.2`)
  - Calculate elapsed time
  - Count completed tasks
  - Log format: `[ralph] Complete! N iterations, M tasks in Xm Ys`
  - Include summary on all exit paths (success, limit, interrupt)

**Checkpoint**: Full feature complete

---

## Dependencies & Execution Order

### Beads Dependency Chain

```
workspace-9w6.5.1 (US1: Core Loop)
    ├── workspace-9w6.5.1.1 (create file)
    ├── workspace-9w6.5.1.2 (args) → depends on .1.1
    ├── workspace-9w6.5.1.3 (epic) → depends on .1.2
    ├── workspace-9w6.5.1.4 (loop) → depends on .1.3
    ├── workspace-9w6.5.1.5 (claude) → depends on .1.4
    └── workspace-9w6.5.1.6 (retry) → depends on .1.5

workspace-9w6.5.3 (US3: Safeguards) → depends on US1
    ├── workspace-9w6.5.3.1 (prereqs)
    ├── workspace-9w6.5.3.2 (lock) → depends on .3.1
    ├── workspace-9w6.5.3.3 (SIGINT) → depends on .3.2
    ├── workspace-9w6.5.3.4 (max-iter) → depends on .3.1
    └── workspace-9w6.5.3.5 (exit codes) → depends on .3.3 and .3.4

workspace-9w6.5.4 (US4: Feedback) → depends on US1
    ├── workspace-9w6.5.4.1 (iteration log) [P]
    └── workspace-9w6.5.4.2 (summary) [P]
```

### User Story Dependencies

- **US1 (P1)**: No dependencies - start immediately
- **US2 (P1)**: Implicitly satisfied by US1's beads design - no separate tasks
- **US3 (P2)**: Depends on US1 completion - safeguards build on core loop
- **US4 (P3)**: Depends on US1 completion - logging needs the loop

### Parallel Opportunities

- Within US3: T010 (max-iter) can run parallel with T008-T009 (lock/SIGINT path)
- Within US4: T012 and T013 can run in parallel (different log functions)
- US3 and US4 could theoretically run in parallel (both just add to US1), but sequential is simpler

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001-T006 (US1 tasks)
2. **STOP and VALIDATE**: `./ralph.sh --dry-run` works
3. Test with a simple feature
4. Deploy if ready

### Incremental Delivery

1. US1 → Working loop (MVP!)
2. US3 → Safe execution
3. US4 → User-friendly output

---

## Notes

- All code in single file: `ralph.sh` at repository root
- Use shellcheck for linting
- No external bash libraries - pure bash + jq
- Each task modifies same file but different functions/sections
