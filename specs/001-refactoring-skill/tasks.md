# Tasks: Refactoring Skill for Red-Green-Refactor

**Input**: Design documents from `/specs/001-refactoring-skill/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, quickstart.md

**Tests**: Not applicable - this is a documentation artifact. Validation is manual against success criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Skill directory**: `.claude/skills/refactoring/`
- **Reference files**: `.claude/skills/refactoring/references/`

---

## Phase 1: Setup (Skill Structure)

**Purpose**: Create skill directory structure and main file skeleton

- [x] T001 Create skill directory at .claude/skills/refactoring/
- [x] T002 Create references subdirectory at .claude/skills/refactoring/references/
- [x] T003 Create SKILL.md skeleton with frontmatter in .claude/skills/refactoring/SKILL.md

---

## Phase 2: Foundational (Code Smell Catalog)

**Purpose**: Establish the complete code smell decision tree that all user stories depend on

**⚠️ CRITICAL**: Reference files cannot be written until smell→refactoring mappings are defined

- [x] T004 Add frontmatter (name, description) to .claude/skills/refactoring/SKILL.md
- [x] T005 Add "The Refactoring Mindset" section with TDD prerequisites to .claude/skills/refactoring/SKILL.md
- [x] T006 Add code smell decision tree structure (6 symptom categories) to .claude/skills/refactoring/SKILL.md
- [x] T007 Map all 22 smells to decision tree categories per data-model.md in .claude/skills/refactoring/SKILL.md
- [x] T008 Add "Quick Reference" table for common refactorings to .claude/skills/refactoring/SKILL.md
- [x] T009 Add reference file links section to .claude/skills/refactoring/SKILL.md
- [x] T010 Add cross-references to related skills (prefactoring, typescript-unit-testing, clean-architecture-validator) to .claude/skills/refactoring/SKILL.md

**Checkpoint**: SKILL.md complete with decision tree; reference files can now be created in parallel

---

## Phase 3: User Story 1 - Identify Code Smells (Priority: P1) 🎯 MVP

**Goal**: Developer can identify appropriate refactoring for any code smell using the decision tree

**Independent Test**: Present code with Long Function smell → skill recommends Extract Function

### Implementation for User Story 1

- [x] T011 [P] [US1] Create understanding category table (Mysterious Name, Long Function, Comments, Primitive Obsession) in .claude/skills/refactoring/SKILL.md
- [x] T012 [P] [US1] Create duplication category table (Duplicated Code, Data Clumps, Repeated Switches) in .claude/skills/refactoring/SKILL.md
- [x] T013 [P] [US1] Create change category table (Divergent Change, Shotgun Surgery, Feature Envy, Message Chains) in .claude/skills/refactoring/SKILL.md
- [x] T014 [P] [US1] Create complexity category table (Long Parameter List, Speculative Generality, Lazy Element, Middle Man, Dead Code, Loops) in .claude/skills/refactoring/SKILL.md
- [x] T015 [P] [US1] Create data category table (Global Data, Mutable Data, Temporary Field) in .claude/skills/refactoring/SKILL.md
- [x] T016 [P] [US1] Create inheritance category table (Large Class, Refused Bequest, Insider Trading, Alternative Classes, Data Class) in .claude/skills/refactoring/SKILL.md
- [x] T017 [US1] Verify all 22 smells are mapped with at least one refactoring in .claude/skills/refactoring/SKILL.md

**Checkpoint**: User Story 1 complete - developer can identify refactorings for any smell

---

## Phase 4: User Story 2 - Detailed Refactoring Patterns (Priority: P2)

**Goal**: Developer can access step-by-step instructions with TypeScript examples for any refactoring technique

**Independent Test**: Access extraction reference → receive Extract Function steps with before/after code

### Implementation for User Story 2

- [x] T018 [P] [US2] Create extraction.md with Extract/Inline Function/Variable patterns in .claude/skills/refactoring/references/extraction.md
- [x] T019 [P] [US2] Create naming.md with Change Function Declaration, Rename Variable/Field patterns in .claude/skills/refactoring/references/naming.md
- [x] T020 [P] [US2] Create encapsulation.md with Encapsulate Variable/Collection/Record patterns in .claude/skills/refactoring/references/encapsulation.md
- [x] T021 [P] [US2] Create moving.md with Move Function/Field/Statements patterns in .claude/skills/refactoring/references/moving.md
- [x] T022 [P] [US2] Create data.md with Split Variable, Loop→Pipeline patterns in .claude/skills/refactoring/references/data.md
- [x] T023 [P] [US2] Create api.md with Parameter Object, Remove Flag Argument patterns in .claude/skills/refactoring/references/api.md
- [x] T024 [P] [US2] Create polymorphism.md with Replace Conditional with Polymorphism patterns in .claude/skills/refactoring/references/polymorphism.md
- [x] T025 [P] [US2] Create simplification.md with Inline Class, Remove Dead Code patterns in .claude/skills/refactoring/references/simplification.md
- [x] T026 [P] [US2] Create inheritance.md with Pull Up/Push Down, Replace with Delegate patterns in .claude/skills/refactoring/references/inheritance.md
- [x] T027 [US2] Add TypeScript code examples (before/after) to all reference files
- [x] T028 [US2] Add step-by-step mechanics to all refactoring patterns
- [x] T029 [US2] Verify all links from SKILL.md resolve to reference files

**Checkpoint**: User Story 2 complete - all refactoring patterns have detailed instructions

---

## Phase 5: User Story 3 - Decision Tree Navigation (Priority: P3)

**Goal**: Developer can diagnose code problems by symptom and navigate to specific smells

**Independent Test**: Present symptom "code is hard to change" → skill identifies Shotgun Surgery

### Implementation for User Story 3

- [x] T030 [P] [US3] Add symptom questions ("Is the code hard to understand?") to decision tree in .claude/skills/refactoring/SKILL.md
- [x] T031 [P] [US3] Add symptom-to-smell navigation hints in category headers in .claude/skills/refactoring/SKILL.md
- [x] T032 [US3] Add "I want to..." quick reference table mapping goals to refactorings in .claude/skills/refactoring/SKILL.md
- [x] T033 [US3] Verify decision tree covers all symptom categories from data-model.md

**Checkpoint**: User Story 3 complete - developers can navigate by symptom

---

## Phase 6: Polish & Validation

**Purpose**: Final validation and cleanup

- [x] T034 [P] Verify SKILL.md is under 150 lines (SC-003) — 103 lines
- [x] T035 [P] Verify all 22 code smells are covered (SC-004) — 25 smells covered
- [x] T036 [P] Verify each reference file has complete step-by-step instructions (SC-002)
- [x] T037 Run quickstart.md validation scenarios
- [x] T038 Update skill description if needed for optimal discoverability
- [x] T039 Verify TDD reminder is prominently placed (FR-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 (smell tables) and US2 (reference files) can proceed in parallel
  - US3 (navigation) can start after US1 creates the category structure
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - creates smell→refactoring mappings
- **User Story 2 (P2)**: Can start after Foundational - creates reference file content (parallel with US1)
- **User Story 3 (P3)**: Depends on US1 category structure - adds navigation layer

### Parallel Opportunities

- All reference files (T018-T026) can be created in parallel
- All smell category tables (T011-T016) can be created in parallel
- US1 and US2 can proceed in parallel after Foundational phase
- All polish validation tasks (T034-T036) can run in parallel

---

## Parallel Example: User Story 2 (Reference Files)

```bash
# Launch all reference files together (9 files, no dependencies between them):
Task: "Create extraction.md in .claude/skills/refactoring/references/extraction.md"
Task: "Create naming.md in .claude/skills/refactoring/references/naming.md"
Task: "Create encapsulation.md in .claude/skills/refactoring/references/encapsulation.md"
Task: "Create moving.md in .claude/skills/refactoring/references/moving.md"
Task: "Create data.md in .claude/skills/refactoring/references/data.md"
Task: "Create api.md in .claude/skills/refactoring/references/api.md"
Task: "Create polymorphism.md in .claude/skills/refactoring/references/polymorphism.md"
Task: "Create simplification.md in .claude/skills/refactoring/references/simplification.md"
Task: "Create inheritance.md in .claude/skills/refactoring/references/inheritance.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (skill directory structure)
2. Complete Phase 2: Foundational (decision tree skeleton)
3. Complete Phase 3: User Story 1 (smell→refactoring tables)
4. **STOP and VALIDATE**: Test that any smell maps to a refactoring
5. Deploy/demo if ready - developers can identify refactorings

### Incremental Delivery

1. Complete Setup + Foundational → Skill skeleton ready
2. Add User Story 1 → Smell identification works (MVP!)
3. Add User Story 2 → Detailed patterns available
4. Add User Story 3 → Navigation by symptom works
5. Each story adds value without breaking previous stories

---

## Notes

- This is a documentation artifact - no code compilation/tests
- Validation is manual against success criteria (SC-001 through SC-005)
- [P] tasks = different files, no dependencies
- All reference files follow same structure: When/Why, Steps, TypeScript Example
- SKILL.md must stay under 150 lines for quick scanning
- Commit after each task or logical group
