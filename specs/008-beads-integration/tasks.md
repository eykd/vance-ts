# Tasks: Beads Integration for Spec-Kit Workflow

**Input**: Design documents from `/specs/008-beads-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual workflow validation via acceptance scenarios (no automated tests - this is markdown command files)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Command files**: `.claude/commands/bd/`
- **Existing commands (reference)**: `.claude/commands/sp/`
- **Feature specs**: `specs/008-beads-integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and beads package installation

- [x] T001 Install @beads/bd as devDependency via `npm install --save-dev @beads/bd`
- [x] T002 Initialize beads in repository via `npx bd init`
- [x] T003 Create bd/ command directory at .claude/commands/bd/
- [x] T004 [P] Create README.md for bd/ namespace at .claude/commands/bd/README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core command files that MUST be complete before user story-specific commands

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Copy sp/01-constitution.md to bd/00-constitution.md and update numbering references
- [x] T006 [P] Add beads initialization check helper pattern (check for .beads/ directory)
- [x] T007 [P] Add beads epic lookup helper pattern (find epic by feature branch)
- [x] T008 [P] Add error handling pattern for beads CLI failures

**Checkpoint**: Foundation ready - user story command implementation can now begin

---

## Phase 3: User Story 1 - Initialize Beads in Repository (Priority: P1) 🎯 MVP

**Goal**: Ensure beads is initialized when running /bd:01-specify

**Independent Test**: Run /bd:01-specify on a repo without .beads/ and verify .beads/ directory is created

### Implementation for User Story 1

- [x] T009 [US1] Copy sp/02-specify.md to bd/01-specify.md at .claude/commands/bd/01-specify.md
- [x] T010 [US1] Add beads initialization step to bd/01-specify.md (check .beads/, run bd init if missing)
- [x] T011 [US1] Update handoff references in bd/01-specify.md from sp:_ to bd:_ namespace
- [x] T012 [US1] Add acceptance scenario validation for beads initialization in bd/01-specify.md

**Checkpoint**: User Story 1 complete - /bd:01-specify now initializes beads automatically

---

## Phase 4: User Story 2 - Create Specifications as Epics (Priority: P2)

**Goal**: Create beads epic when generating feature specification

**Independent Test**: Run /bd:01-specify and verify epic is created in beads with correct title

### Implementation for User Story 2

- [x] T013 [US2] Add epic creation step to bd/01-specify.md using `bd create -t epic -p 0 --json`
- [x] T014 [US2] Add epic ID storage in spec.md front matter (**Beads Epic**: `bd-xxxx`)
- [x] T015 [US2] Add duplicate epic detection logic (check existing epic for branch before creating)
- [x] T016 [US2] Add epic update logic for re-running /bd:01-specify on existing feature

**Checkpoint**: User Story 2 complete - /bd:01-specify creates and tracks beads epics

---

## Phase 5: User Story 3 - Generate Tasks in Beads Hierarchy (Priority: P3)

**Goal**: Replace markdown task lists with beads tasks under feature epic

**Independent Test**: Run /bd:05-tasks and verify tasks are created in beads with correct parent-child relationships

### Implementation for User Story 3

- [x] T017 [US3] Copy sp/06-tasks.md to bd/05-tasks.md at .claude/commands/bd/05-tasks.md
- [x] T018 [US3] Add epic ID retrieval from spec.md front matter in bd/05-tasks.md
- [x] T019 [US3] Replace markdown checkbox generation with `bd create --parent <epic-id>` calls
- [x] T020 [US3] Add user story → beads task mapping (P1→priority 1, P2→priority 2, etc.)
- [x] T021 [US3] Add sub-task creation for implementation steps using `bd create --parent <task-id>`
- [x] T022 [US3] Add dependency creation between sequential tasks using `bd dep add`
- [x] T023 [US3] Add parallel task detection ([P] marker → no dependency added)
- [x] T024 [US3] Update handoff references in bd/05-tasks.md from sp:_ to bd:_ namespace

**Checkpoint**: User Story 3 complete - /bd:05-tasks generates beads task hierarchy

---

## Phase 6: User Story 4 - Track Implementation Progress (Priority: P4)

**Goal**: Use beads for task status tracking during implementation

**Independent Test**: Run /bd:06-implement, complete a task, and verify beads shows updated status

### Implementation for User Story 4

- [x] T025 [US4] Copy sp/07-implement.md to bd/06-implement.md at .claude/commands/bd/06-implement.md
- [x] T026 [US4] Replace tasks.md checkbox reading with `bd ready --json` call
- [x] T027 [US4] Add task status update using `bd update --status in_progress`
- [x] T028 [US4] Replace checkbox marking with `bd close --reason` call
- [x] T029 [US4] Add remaining work display using `bd list --parent <epic-id> --status open`
- [x] T030 [US4] Update handoff references in bd/06-implement.md from sp:_ to bd:_ namespace

**Checkpoint**: User Story 4 complete - /bd:06-implement tracks progress in beads

---

## Phase 7: User Story 5 - Query Task Status (Priority: P5)

**Goal**: Enable viewing feature progress via beads commands

**Independent Test**: Create tasks and query status using beads CLI commands

### Implementation for User Story 5

- [x] T031 [US5] Copy sp/08-analyze.md to bd/07-analyze.md at .claude/commands/bd/07-analyze.md
- [x] T032 [US5] Add task statistics retrieval using `bd stats --json`
- [x] T033 [US5] Add feature task listing using `bd list --parent <epic-id> --json`
- [x] T034 [US5] Update handoff references in bd/07-analyze.md from sp:_ to bd:_ namespace

**Checkpoint**: User Story 5 complete - /bd:07-analyze shows beads task status

---

## Phase 8: User Story 6 - Namespace Swap (Priority: P6)

**Goal**: Replace sp/_ with bd/_ commands after validation

**Independent Test**: Run namespace swap and verify /sp:02-specify creates beads epics

### Implementation for User Story 6

- [x] T035 [P] [US6] Copy remaining sp/ commands to bd/ namespace:
  - [x] T035a [P] [US6] Copy sp/03-clarify.md to bd/02-clarify.md at .claude/commands/bd/02-clarify.md
  - [x] T035b [P] [US6] Copy sp/04-plan.md to bd/03-plan.md at .claude/commands/bd/03-plan.md
  - [x] T035c [P] [US6] Copy sp/05-checklist.md to bd/04-checklist.md at .claude/commands/bd/04-checklist.md
  - [x] T035d [P] [US6] Copy sp/09-taskstoissues.md to bd/08-taskstoissues.md at .claude/commands/bd/08-taskstoissues.md
- [x] T036 [US6] Update all internal references in copied files from sp:_ to bd:_ namespace
- [x] T037 [US6] Add task export logic to bd/08-taskstoissues.md using `bd list --parent <epic-id> --status open --json`
- [x] T038 [US6] Validate all /bd:\* commands work end-to-end on a test feature
- [x] T039 [US6] Create namespace swap script to backup sp/ and move bd/ to sp/
- [x] T040 [US6] Execute namespace swap (backup sp/ to sp-backup/, rename bd/ to sp/)
- [x] T041 [US6] Update CLAUDE.md skill references from bd:_ back to sp:_
- [x] T042 [US6] Delete sp-backup/ after validation

**Checkpoint**: User Story 6 complete - /sp:\* commands now use beads

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and documentation

- [x] T043 [P] Update specs/008-beads-integration/quickstart.md with final command syntax
- [x] T044 [P] Update .claude/commands/sp/README.md to document beads integration
- [x] T045 Run full workflow validation: /sp:01-specify → /sp:03-plan → /sp:05-tasks → /sp:07-implement
- [x] T046 Clean up any temporary files or backup directories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 (Initialize): Can start after Foundational
  - US2 (Epic Creation): Depends on US1 (builds on specify command)
  - US3 (Task Generation): Depends on US2 (needs epic to exist)
  - US4 (Progress Tracking): Depends on US3 (needs tasks to exist)
  - US5 (Query Status): Can run parallel with US4 (different command)
  - US6 (Namespace Swap): Depends on US1-US5 all being complete
- **Polish (Phase 9)**: Depends on US6 completion

### User Story Dependencies

```text
US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4)
                                    ↓
                               US5 (P5) [parallel with US4]
                                    ↓
                               US6 (P6) [after all above]
```

### Within Each User Story

- Copy existing sp/\* command as starting point
- Modify to add beads integration
- Update namespace references
- Validate acceptance scenarios

### Parallel Opportunities

- T003, T004 in Setup can run in parallel
- T006, T007, T008 in Foundational can run in parallel
- T035a, T035b, T035c, T035d can run in parallel (different files)
- T043, T044 in Polish can run in parallel

---

## Parallel Example: User Story 6 (Remaining Commands)

```bash
# Launch all remaining command copies together:
Task: "Copy sp/03-clarify.md to bd/02-clarify.md"
Task: "Copy sp/04-plan.md to bd/03-plan.md"
Task: "Copy sp/05-checklist.md to bd/04-checklist.md"
Task: "Copy sp/09-taskstoissues.md to bd/08-taskstoissues.md"
```

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

1. Complete Phase 1: Setup (install beads, create bd/ directory)
2. Complete Phase 2: Foundational (copy constitution, add helpers)
3. Complete Phase 3: User Story 1 (beads initialization in specify)
4. Complete Phase 4: User Story 2 (epic creation)
5. **STOP and VALIDATE**: Test /bd:01-specify creates .beads/ and epic
6. Can demo beads integration with spec creation

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 → Can create specs with epics (early validation)
3. Add US3 → Can generate beads tasks (core value)
4. Add US4 → Can track implementation in beads
5. Add US5 → Can query task status
6. Add US6 → Full migration to beads as default

### Single Developer Strategy

Work through user stories sequentially in priority order:

1. US1 → US2 → US3 → US4 → US5 → US6
2. Each story builds on previous
3. Validate at each checkpoint before continuing

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Copy sp/\* commands first, then modify (avoids rewriting from scratch)
- Test each command after modification before moving to next story
- Commit after each user story completion
- Keep sp/ unchanged until US6 namespace swap
