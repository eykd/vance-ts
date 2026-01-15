# Tasks: Multi-Tenant Boundary Skills

**Input**: Design documents from `/specs/005-multi-tenant-skills/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: N/A - This is a documentation-only feature (Claude Code skills). No automated tests required.

**Organization**: Tasks are grouped by user story. Each skill can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

## Path Conventions

- Skills directory: `.claude/skills/`
- Each skill: `.claude/skills/{skill-name}/SKILL.md` + `.claude/skills/{skill-name}/references/`

---

## Phase 1: Setup

**Purpose**: Create skill directory structure and ensure contracts are available

- [x] T001 Create skill directories: `.claude/skills/org-authorization/`, `.claude/skills/org-authorization/references/`
- [x] T002 [P] Create skill directories: `.claude/skills/org-isolation/`, `.claude/skills/org-isolation/references/`
- [x] T003 [P] Create skill directories: `.claude/skills/org-data-model/`, `.claude/skills/org-data-model/references/`
- [x] T004 [P] Create skill directories: `.claude/skills/org-membership/`, `.claude/skills/org-membership/references/`
- [x] T005 [P] Create skill directories: `.claude/skills/org-testing/`, `.claude/skills/org-testing/references/`
- [x] T006 [P] Create skill directories: `.claude/skills/org-migration/`, `.claude/skills/org-migration/references/`

---

## Phase 2: Foundational

**Purpose**: No foundational dependencies - skills are independent documentation files

**Checkpoint**: Directory structure ready - skill implementation can begin in parallel

---

## Phase 3: User Story 1 - Authorization Policy Implementation (Priority: P1) 🎯 MVP

**Goal**: Provide org-authorization skill with Actor/Action/Resource types, AuthorizationService, and common patterns

**Independent Test**: Developer can implement a complete authorization check for a Project resource by following the skill

### Implementation for User Story 1

- [x] T007 [US1] Create SKILL.md decision tree in `.claude/skills/org-authorization/SKILL.md` (extract from guide Section 5-6)
- [x] T008 [P] [US1] Create core-types.md reference in `.claude/skills/org-authorization/references/core-types.md` (Actor, Action, Resource, PolicyContext types from guide Section 5)
- [x] T009 [P] [US1] Create authorization-service.md reference in `.claude/skills/org-authorization/references/authorization-service.md` (AuthorizationService class from guide Section 5-6)
- [x] T010 [P] [US1] Create patterns.md reference in `.claude/skills/org-authorization/references/patterns.md` (ownership, admin override, system actions, delegation from guide Section 7)
- [x] T011 [US1] Verify SKILL.md is under 150 lines and follows contract template
- [x] T012 [US1] Verify cross-references to security-review, ddd-domain-modeling, org-isolation are correct

**Checkpoint**: org-authorization skill complete - developer can implement authorization checks

---

## Phase 4: User Story 2 - Tenant Isolation Implementation (Priority: P1)

**Goal**: Provide org-isolation skill with query scoping patterns, audit checklist, and testing patterns

**Independent Test**: Developer can audit tenant isolation and write cross-tenant tests by following the skill

### Implementation for User Story 2

- [x] T013 [US2] Create SKILL.md decision tree in `.claude/skills/org-isolation/SKILL.md` (extract from guide Section 10)
- [x] T014 [P] [US2] Create tenant-scoped-db.md reference in `.claude/skills/org-isolation/references/tenant-scoped-db.md` (TenantScopedDb wrapper from guide Section 10)
- [x] T015 [P] [US2] Create audit-checklist.md reference in `.claude/skills/org-isolation/references/audit-checklist.md` (security checklist from guide Section 10)
- [x] T016 [P] [US2] Create testing-patterns.md reference in `.claude/skills/org-isolation/references/testing-patterns.md` (cross-tenant test patterns from guide Section 8)
- [x] T017 [US2] Verify SKILL.md is under 150 lines and follows contract template
- [x] T018 [US2] Verify cross-references to d1-repository-implementation, org-authorization, org-testing are correct

**Checkpoint**: org-isolation skill complete - developer can audit and test tenant isolation

---

## Phase 5: User Story 3 - Data Model Evolution (Priority: P2)

**Goal**: Provide org-data-model skill with four-stage evolution schemas

**Independent Test**: Developer can choose the appropriate data model stage and implement schema by following the skill

### Implementation for User Story 3

- [x] T019 [US3] Create SKILL.md decision tree in `.claude/skills/org-data-model/SKILL.md` (decision framework from guide Section 2-3)
- [x] T020 [P] [US3] Create stage-1-single-user.md reference in `.claude/skills/org-data-model/references/stage-1-single-user.md` (user owns resources schema from guide Section 3)
- [x] T021 [P] [US3] Create stage-2-collaborators.md reference in `.claude/skills/org-data-model/references/stage-2-collaborators.md` (resource-level sharing from guide Section 3)
- [x] T022 [P] [US3] Create stage-3-organizations.md reference in `.claude/skills/org-data-model/references/stage-3-organizations.md` (organizations with memberships from guide Section 3)
- [x] T023 [P] [US3] Create stage-4-resource-perms.md reference in `.claude/skills/org-data-model/references/stage-4-resource-perms.md` (per-resource permissions from guide Section 3)
- [x] T024 [US3] Verify SKILL.md is under 150 lines and follows contract template
- [x] T025 [US3] Verify cross-references to cloudflare-migrations, ddd-domain-modeling, org-membership are correct

**Checkpoint**: org-data-model skill complete - developer can choose and implement appropriate schema stage

---

## Phase 6: User Story 4 - Organization Membership Roles (Priority: P2)

**Goal**: Provide org-membership skill with role hierarchies and privilege escalation prevention

**Independent Test**: Developer can implement membership management with proper role checks by following the skill

### Implementation for User Story 4

- [x] T026 [US4] Create SKILL.md decision tree in `.claude/skills/org-membership/SKILL.md` (role patterns from guide Section 3, 7)
- [x] T027 [P] [US4] Create role-hierarchy.md reference in `.claude/skills/org-membership/references/role-hierarchy.md` (owner > admin > member > viewer from guide Section 3)
- [x] T028 [P] [US4] Create privilege-escalation.md reference in `.claude/skills/org-membership/references/privilege-escalation.md` (prevention patterns from guide Section 10)
- [x] T029 [P] [US4] Create membership-management.md reference in `.claude/skills/org-membership/references/membership-management.md` (invite, remove, transfer from guide Section 7)
- [x] T030 [US4] Verify SKILL.md is under 150 lines and follows contract template
- [x] T031 [US4] Verify cross-references to org-authorization, security-review, org-data-model are correct

**Checkpoint**: org-membership skill complete - developer can implement role-based membership

---

## Phase 7: User Story 5 - Authorization Testing (Priority: P2)

**Goal**: Provide org-testing skill with unit, integration, and acceptance test patterns

**Independent Test**: Developer can write comprehensive authorization tests by following the skill

### Implementation for User Story 5

- [x] T032 [US5] Create SKILL.md decision tree in `.claude/skills/org-testing/SKILL.md` (test type selection from guide Section 8)
- [x] T033 [P] [US5] Create policy-unit-tests.md reference in `.claude/skills/org-testing/references/policy-unit-tests.md` (CorePolicy unit tests from guide Section 8)
- [x] T034 [P] [US5] Create integration-tests.md reference in `.claude/skills/org-testing/references/integration-tests.md` (AuthorizationService integration from guide Section 8)
- [x] T035 [P] [US5] Create acceptance-tests.md reference in `.claude/skills/org-testing/references/acceptance-tests.md` (tenant isolation acceptance from guide Section 8)
- [x] T036 [US5] Verify SKILL.md is under 150 lines and follows contract template
- [x] T037 [US5] Verify cross-references to typescript-unit-testing, vitest-integration-testing, org-isolation are correct

**Checkpoint**: org-testing skill complete - developer can write authorization tests

---

## Phase 8: User Story 6 - Multi-Tenant Migration (Priority: P3)

**Goal**: Provide org-migration skill with shadow organizations, feature flags, and database backfill

**Independent Test**: Developer can plan and execute migration to multi-tenancy by following the skill

### Implementation for User Story 6

- [x] T038 [US6] Create SKILL.md decision tree in `.claude/skills/org-migration/SKILL.md` (strategy selection from guide Section 9)
- [x] T039 [P] [US6] Create shadow-organizations.md reference in `.claude/skills/org-migration/references/shadow-organizations.md` (personal org per user from guide Section 9)
- [x] T040 [P] [US6] Create feature-flags.md reference in `.claude/skills/org-migration/references/feature-flags.md` (gradual rollout from guide Section 9)
- [x] T041 [P] [US6] Create database-backfill.md reference in `.claude/skills/org-migration/references/database-backfill.md` (schema migration scripts from guide Section 9)
- [x] T042 [US6] Verify SKILL.md is under 150 lines and follows contract template
- [x] T043 [US6] Verify cross-references to cloudflare-migrations, kv-session-management, org-data-model are correct

**Checkpoint**: org-migration skill complete - developer can plan migration strategy

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Update README and validate skill chain

- [x] T044 Update `.claude/skills/README.md` with new "Multi-Tenant Boundaries" section
- [x] T045 Add skill chain documentation to README (org-authorization → org-isolation → org-data-model → org-membership → org-testing → org-migration)
- [x] T046 [P] Validate all SKILL.md files are under 150 lines (SC-002)
- [x] T047 [P] Validate all cross-references use correct relative paths
- [x] T048 Run quickstart.md validation by following the documented workflows
- [x] T049 Final review: verify 100% of guide patterns covered (SC-003)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A for documentation project
- **User Stories (Phase 3-8)**: Can proceed in parallel after Setup
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - org-authorization**: No dependencies - Start first for MVP
- **User Story 2 (P1) - org-isolation**: No dependencies - Can parallel with US1
- **User Story 3 (P2) - org-data-model**: No dependencies - Can parallel
- **User Story 4 (P2) - org-membership**: No dependencies - Can parallel
- **User Story 5 (P2) - org-testing**: No dependencies - Can parallel
- **User Story 6 (P3) - org-migration**: No dependencies - Can parallel

### Within Each User Story

- Create SKILL.md first (defines structure)
- Reference files can be created in parallel [P]
- Verification tasks (line count, cross-refs) after content complete

### Parallel Opportunities

All 6 skills can be implemented in parallel after Setup phase completes:

```
After T001-T006 (Setup):
├── US1: T007-T012 (org-authorization)
├── US2: T013-T018 (org-isolation)
├── US3: T019-T025 (org-data-model)
├── US4: T026-T031 (org-membership)
├── US5: T032-T037 (org-testing)
└── US6: T038-T043 (org-migration)
```

---

## Parallel Example: User Story 1

```bash
# After T007 creates SKILL.md, launch all references in parallel:
Task: "Create core-types.md reference in .claude/skills/org-authorization/references/core-types.md"
Task: "Create authorization-service.md reference in .claude/skills/org-authorization/references/authorization-service.md"
Task: "Create patterns.md reference in .claude/skills/org-authorization/references/patterns.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 3: User Story 1 - org-authorization (T007-T012)
3. **STOP and VALIDATE**: Test skill by implementing a simple authorization check
4. Partial README update for single skill

### Incremental Delivery

1. Setup → org-authorization → VALIDATE (MVP!)
2. Add org-isolation → VALIDATE
3. Add org-data-model + org-membership → VALIDATE
4. Add org-testing → VALIDATE
5. Add org-migration → VALIDATE
6. Polish (README, final validation)

### Parallel Team Strategy

With multiple developers:

1. Complete Setup together (5 minutes)
2. Each developer takes 1-2 skills:
   - Developer A: org-authorization, org-membership
   - Developer B: org-isolation, org-testing
   - Developer C: org-data-model, org-migration
3. Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies within that phase
- [Story] label maps task to specific user story for traceability
- Each skill is independently completable and usable
- Validation: SKILL.md < 150 lines, cross-refs correct, patterns complete
- Source: Extract patterns from `/docs/multi-tenant-boundaries-guide.md`
- Stop at any checkpoint to validate skill independently
