# Tasks: Hugo Cloudflare Skills

**Input**: Design documents from `/specs/004-hugo-skills/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not applicable - this feature creates documentation (skills), not compiled code.

**Organization**: Tasks are grouped by user story. Each skill maps to a specific user story, enabling independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

## Path Conventions

Skills are created in `.claude/skills/` directory following existing patterns.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create skill directory structure

- [x] T001 Create skill directories: `.claude/skills/hugo-templates/references/`
- [x] T002 [P] Create skill directories: `.claude/skills/typescript-html-templates/references/`
- [x] T003 [P] Create skill directories: `.claude/skills/hugo-project-setup/references/`
- [x] T004 [P] Create skill directories: `.claude/skills/static-first-routing/references/`
- [x] T005 [P] Create skill directories: `.claude/skills/hugo-search-indexing/references/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites - skills are independent documentation files

**⚠️ NOTE**: Skills feature has no foundational phase. Each skill is self-contained and can be implemented immediately after directory setup.

**Checkpoint**: Directory structure ready - skill implementation can begin in parallel

---

## Phase 3: User Story 1 - Hugo Template Patterns (Priority: P1) 🎯 MVP

**Goal**: Developers can create Hugo templates with HTMX/Alpine integration by following skill guidance

**Independent Test**: Invoke `/hugo-templates` and receive decision tree with layout, partial, and shortcode patterns

### Implementation for User Story 1

- [x] T006 [US1] Create SKILL.md with decision tree for Hugo templates in `.claude/skills/hugo-templates/SKILL.md`
- [x] T007 [P] [US1] Create layouts-partials.md reference in `.claude/skills/hugo-templates/references/layouts-partials.md`
- [x] T008 [P] [US1] Create shortcodes.md reference in `.claude/skills/hugo-templates/references/shortcodes.md`
- [x] T009 [P] [US1] Create htmx-integration.md reference in `.claude/skills/hugo-templates/references/htmx-integration.md`
- [x] T010 [US1] Validate SKILL.md is under 150 lines and contains cross-references to htmx-pattern-library, tailwind-daisyui-design

**Checkpoint**: hugo-templates skill fully functional - developers can invoke `/hugo-templates`

---

## Phase 4: User Story 2 - TypeScript HTML Templates (Priority: P1)

**Goal**: Developers can create TypeScript HTML response functions with proper escaping and HX-Trigger headers

**Independent Test**: Invoke `/typescript-html-templates` and receive template function patterns with escaping utilities

### Implementation for User Story 2

- [x] T011 [US2] Create SKILL.md with decision tree for TS HTML functions in `.claude/skills/typescript-html-templates/SKILL.md`
- [x] T012 [P] [US2] Create template-functions.md reference in `.claude/skills/typescript-html-templates/references/template-functions.md`
- [x] T013 [P] [US2] Create response-patterns.md reference in `.claude/skills/typescript-html-templates/references/response-patterns.md`
- [x] T014 [P] [US2] Create error-responses.md reference in `.claude/skills/typescript-html-templates/references/error-responses.md`
- [x] T015 [US2] Validate SKILL.md is under 150 lines and contains cross-references to worker-request-handler, tailwind-daisyui-design

**Checkpoint**: typescript-html-templates skill fully functional - developers can invoke `/typescript-html-templates`

---

## Phase 5: User Story 3 - Hugo Project Setup (Priority: P2)

**Goal**: Developers can scaffold new Hugo + Cloudflare Pages projects with correct directory structure

**Independent Test**: Invoke `/hugo-project-setup` and receive directory layout and configuration templates

### Implementation for User Story 3

- [x] T016 [US3] Create SKILL.md with decision tree for project setup in `.claude/skills/hugo-project-setup/SKILL.md`
- [x] T017 [P] [US3] Create directory-structure.md reference in `.claude/skills/hugo-project-setup/references/directory-structure.md`
- [x] T018 [P] [US3] Create configuration.md reference in `.claude/skills/hugo-project-setup/references/configuration.md`
- [x] T019 [P] [US3] Create build-pipeline.md reference in `.claude/skills/hugo-project-setup/references/build-pipeline.md`
- [x] T020 [US3] Validate SKILL.md is under 150 lines and contains cross-references to cloudflare-project-scaffolding, vitest-cloudflare-config

**Checkpoint**: hugo-project-setup skill fully functional - developers can invoke `/hugo-project-setup`

---

## Phase 6: User Story 4 - Static-First Routing (Priority: P2)

**Goal**: Developers understand CDN vs Pages Functions routing and can configure URL structure correctly

**Independent Test**: Invoke `/static-first-routing` and receive request flow diagram and path convention rules

### Implementation for User Story 4

- [x] T021 [US4] Create SKILL.md with decision tree for routing concepts in `.claude/skills/static-first-routing/SKILL.md`
- [x] T022 [P] [US4] Create request-flow.md reference in `.claude/skills/static-first-routing/references/request-flow.md`
- [x] T023 [P] [US4] Create path-conventions.md reference in `.claude/skills/static-first-routing/references/path-conventions.md`
- [x] T024 [US4] Validate SKILL.md is under 150 lines and contains cross-references to worker-request-handler, cloudflare-project-scaffolding

**Checkpoint**: static-first-routing skill fully functional - developers can invoke `/static-first-routing`

---

## Phase 7: User Story 5 - Search Index Building (Priority: P3)

**Goal**: Developers can build D1 search index from Hugo markdown content

**Independent Test**: Invoke `/hugo-search-indexing` and receive build script pattern and D1 population guidance

### Implementation for User Story 5

- [x] T025 [US5] Create SKILL.md with decision tree for search indexing in `.claude/skills/hugo-search-indexing/SKILL.md`
- [x] T026 [P] [US5] Create build-script.md reference in `.claude/skills/hugo-search-indexing/references/build-script.md`
- [x] T027 [P] [US5] Create d1-population.md reference in `.claude/skills/hugo-search-indexing/references/d1-population.md`
- [x] T028 [US5] Validate SKILL.md is under 150 lines and contains cross-references to d1-repository-implementation, cloudflare-migrations

**Checkpoint**: hugo-search-indexing skill fully functional - developers can invoke `/hugo-search-indexing`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Update skills catalog and validate all skills

- [x] T029 Update skills catalog in `.claude/skills/README.md` with new Hugo skills section
- [x] T030 [P] Validate all 5 SKILL.md files are under 150 lines
- [x] T031 [P] Validate all 13 reference files are under 300 lines
- [x] T032 Verify all cross-reference links work correctly
- [x] T033 Run spell check on all new skill files (aspell not available, content sourced from guide)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A for documentation feature
- **User Stories (Phase 3-7)**: Depend only on Setup (Phase 1) completion
  - All 5 skills can be implemented in parallel
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 8)**: Depends on all skill phases being complete

### User Story Dependencies

- **User Story 1 (hugo-templates)**: Independent - can start after Phase 1
- **User Story 2 (typescript-html-templates)**: Independent - can start after Phase 1
- **User Story 3 (hugo-project-setup)**: Independent - can start after Phase 1
- **User Story 4 (static-first-routing)**: Independent - can start after Phase 1
- **User Story 5 (hugo-search-indexing)**: Independent - can start after Phase 1

### Within Each User Story

- SKILL.md created first (establishes structure)
- Reference files can be created in parallel [P]
- Validation task runs last (depends on all files)

### Parallel Opportunities

- All Phase 1 directory creation tasks (T001-T005) can run in parallel
- All 5 user stories (Phases 3-7) can be implemented in parallel
- Within each story, reference file tasks marked [P] can run in parallel
- Polish validation tasks marked [P] can run in parallel

---

## Parallel Example: All User Stories

```bash
# After Phase 1 completes, launch all skill SKILL.md files in parallel:
Task: "Create SKILL.md for hugo-templates"
Task: "Create SKILL.md for typescript-html-templates"
Task: "Create SKILL.md for hugo-project-setup"
Task: "Create SKILL.md for static-first-routing"
Task: "Create SKILL.md for hugo-search-indexing"

# Within User Story 1, launch all reference files in parallel:
Task: "Create layouts-partials.md reference"
Task: "Create shortcodes.md reference"
Task: "Create htmx-integration.md reference"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (5 tasks)
2. Complete Phase 3: hugo-templates skill (5 tasks)
3. **STOP and VALIDATE**: Test `/hugo-templates` invocation
4. Developers can immediately use Hugo template guidance

### Incremental Delivery

1. Setup → Directories ready
2. Add hugo-templates (P1) → Test → Usable
3. Add typescript-html-templates (P1) → Test → Usable
4. Add hugo-project-setup (P2) → Test → Usable
5. Add static-first-routing (P2) → Test → Usable
6. Add hugo-search-indexing (P3) → Test → Usable
7. Polish → Complete feature

### Parallel Team Strategy

With multiple contributors:

1. Complete Phase 1 together (5 minutes)
2. Each contributor takes one skill:
   - Contributor A: hugo-templates
   - Contributor B: typescript-html-templates
   - Contributor C: hugo-project-setup
   - Contributor D: static-first-routing
   - Contributor E: hugo-search-indexing
3. Merge and run Phase 8 validation

---

## Summary

| Metric                 | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Total tasks            | 33                                             |
| Setup tasks            | 5                                              |
| User Story 1 tasks     | 5                                              |
| User Story 2 tasks     | 5                                              |
| User Story 3 tasks     | 5                                              |
| User Story 4 tasks     | 4                                              |
| User Story 5 tasks     | 4                                              |
| Polish tasks           | 5                                              |
| Parallel opportunities | 28 tasks marked [P] or parallelizable by phase |
| Files to create        | 18 (5 SKILL.md + 13 reference files)           |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each skill is independently completable and testable
- No compiled code - validation is line counts and link checking
- Commit after each skill phase completes
- Stop at any checkpoint to validate skill independently
