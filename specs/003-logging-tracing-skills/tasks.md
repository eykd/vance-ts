---
description: 'Implementation tasks for Logging & Tracing Claude Skills'
---

# Tasks: Logging & Tracing Claude Skills

**Input**: Design documents from `/specs/003-logging-tracing-skills/`
**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md, contracts/

**Tests**: Not applicable - this feature creates documentation (Claude Code skills), not executable code

**Organization**: Tasks are grouped by user story to enable independent implementation and skill delivery. Event naming (User Story 5) has been merged into structured-logging per research.md Decision 5.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Include exact file paths in descriptions

## Path Conventions

Skills are created under `.claude/skills/{skill-name}/`:

- `SKILL.md` - Main decision-tree file (<150 lines)
- `references/` - Directory containing detailed reference files

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create base skill directory structure

- [x] T001 Create base skills directory structure at .claude/skills/
- [x] T002 Verify existing skill patterns in .claude/skills/typescript-unit-testing/ and .claude/skills/cloudflare-observability/ for reference

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core templates that guide all skill creation

**⚠️ CRITICAL**: Templates must exist before any skill work begins

- [x] T003 Review contract templates in specs/003-logging-tracing-skills/contracts/skill-template.md
- [x] T004 Review contract templates in specs/003-logging-tracing-skills/contracts/reference-template.md
- [x] T005 Review source guide at docs/logging-tracing-guide.md for content extraction

**Checkpoint**: Templates reviewed - skill implementation can now begin in parallel

---

## Phase 3: User Story 1 - Structured Logger Setup (Priority: P1) 🎯 MVP

**Goal**: Provide developers with complete guidance on implementing structured logging in Cloudflare Workers with request correlation and environment-aware redaction

**Independent Test**: Invoke skill when adding logging to a Worker; validate it provides SafeLogger class, BaseLogFields interface, and AsyncLocalStorage context patterns

### Implementation for User Story 1

**Directory Creation**:

- [x] T006 [US1] Create skill directory structure at .claude/skills/structured-logging/ with references/ subdirectory

**SKILL.md Creation** (~130 lines target):

- [x] T007 [US1] Create .claude/skills/structured-logging/SKILL.md using contracts/skill-template.md
- [x] T008 [US1] Add "Use when:" description to SKILL.md: "Use when adding structured logging to Cloudflare Workers with request correlation and environment-aware redaction"
- [x] T009 [US1] Add decision tree to SKILL.md with 4 decision points routing to references
- [x] T010 [US1] Add quick example to SKILL.md showing basic SafeLogger with AsyncLocalStorage (10-15 lines)
- [x] T011 [US1] Add cross-references to SKILL.md: log-categorization, pii-redaction, cloudflare-observability
- [x] T012 [US1] Add reference files list to SKILL.md with one-line descriptions
- [x] T013 [US1] Validate SKILL.md is under 150 lines (SC-001)

**Reference Files Creation** (5 files, parallelizable):

- [x] T014 [P] [US1] Create .claude/skills/structured-logging/references/safe-logger.md (~90 lines) from docs/logging-tracing-guide.md lines 57-105, 1035-1101
- [x] T015 [P] [US1] Create .claude/skills/structured-logging/references/context-management.md (~80 lines) from docs/logging-tracing-guide.md lines 1181-1236
- [x] T016 [P] [US1] Create .claude/skills/structured-logging/references/base-fields.md (~70 lines) from docs/logging-tracing-guide.md lines 199-288
- [x] T017 [P] [US1] Create .claude/skills/structured-logging/references/event-naming.md (~60 lines) from docs/logging-tracing-guide.md lines 289-312
- [x] T018 [P] [US1] Create .claude/skills/structured-logging/references/logger-factory.md (~70 lines) from docs/logging-tracing-guide.md lines 1237-1301

**Validation**:

- [x] T019 [US1] Validate all TypeScript code examples in structured-logging compile with strict mode (SC-003)
- [x] T020 [US1] Verify cross-references in structured-logging SKILL.md are accurate (SC-005)
- [x] T021 [US1] Check reference files provide sufficient implementation detail (SC-004)

**Checkpoint**: structured-logging skill complete and independently usable

---

## Phase 4: User Story 2 - Log Categorization (Priority: P1)

**Goal**: Guide developers in categorizing logs according to Clean Architecture boundaries (domain/application/infrastructure)

**Independent Test**: Invoke skill when adding logs to a use case or repository; validate it provides category decision matrix and logger interfaces

### Implementation for User Story 2

**Directory Creation**:

- [x] T022 [US2] Create skill directory structure at .claude/skills/log-categorization/ with references/ subdirectory

**SKILL.md Creation** (~120 lines target):

- [x] T023 [US2] Create .claude/skills/log-categorization/SKILL.md using contracts/skill-template.md
- [x] T024 [US2] Add "Use when:" description to SKILL.md: "Use when determining whether logs belong to domain, application, or infrastructure layers following Clean Architecture"
- [x] T025 [US2] Add decision tree to SKILL.md with category routing logic
- [x] T026 [US2] Add quick examples to SKILL.md showing one log per category (20-30 lines)
- [x] T027 [US2] Add cross-references to SKILL.md: structured-logging, cloudflare-observability
- [x] T028 [US2] Add reference files list to SKILL.md with one-line descriptions
- [x] T029 [US2] Validate SKILL.md is under 150 lines (SC-001)

**Reference Files Creation** (4 files, parallelizable):

- [x] T030 [P] [US2] Create .claude/skills/log-categorization/references/decision-matrix.md (~60 lines) from docs/logging-tracing-guide.md lines 512-522
- [x] T031 [P] [US2] Create .claude/skills/log-categorization/references/domain-logging.md (~90 lines) from docs/logging-tracing-guide.md lines 338-380
- [x] T032 [P] [US2] Create .claude/skills/log-categorization/references/application-logging.md (~90 lines) from docs/logging-tracing-guide.md lines 382-451
- [x] T033 [P] [US2] Create .claude/skills/log-categorization/references/infrastructure-logging.md (~90 lines) from docs/logging-tracing-guide.md lines 453-511

**Validation**:

- [x] T034 [US2] Validate all TypeScript code examples in log-categorization compile with strict mode (SC-003)
- [x] T035 [US2] Verify cross-references in log-categorization SKILL.md are accurate (SC-005)
- [x] T036 [US2] Check decision matrix is clear and actionable

**Checkpoint**: log-categorization skill complete and independently usable

---

## Phase 5: User Story 3 - PII and Secret Redaction (Priority: P2)

**Goal**: Provide systematic PII and secret redaction patterns for defense-in-depth data protection

**Independent Test**: Invoke skill when implementing logger safety; validate it provides redaction patterns, field detection, and URL sanitization

### Implementation for User Story 3

**Directory Creation**:

- [x] T037 [US3] Create skill directory structure at .claude/skills/pii-redaction/ with references/ subdirectory

**SKILL.md Creation** (~110 lines target):

- [x] T038 [US3] Create .claude/skills/pii-redaction/SKILL.md using contracts/skill-template.md
- [x] T039 [US3] Add "Use when:" description to SKILL.md: "Use when implementing systematic PII and secret redaction for defense-in-depth data protection in logs"
- [x] T040 [US3] Add decision tree to SKILL.md routing to pattern/field/function/URL references
- [x] T041 [US3] Add quick example to SKILL.md showing redactValue usage (10-15 lines)
- [x] T042 [US3] Add cross-reference to SKILL.md: structured-logging
- [x] T043 [US3] Add reference files list to SKILL.md with one-line descriptions
- [x] T044 [US3] Validate SKILL.md is under 150 lines (SC-001)

**Reference Files Creation** (4 files, parallelizable):

- [x] T045 [P] [US3] Create .claude/skills/pii-redaction/references/sensitive-patterns.md (~110 lines) from docs/logging-tracing-guide.md lines 905-1033
- [x] T046 [P] [US3] Create .claude/skills/pii-redaction/references/field-detection.md (~70 lines) from docs/logging-tracing-guide.md lines 905-1033
- [x] T047 [P] [US3] Create .claude/skills/pii-redaction/references/redaction-functions.md (~110 lines) from docs/logging-tracing-guide.md lines 1035-1101
- [x] T048 [P] [US3] Create .claude/skills/pii-redaction/references/url-sanitization.md (~70 lines) from docs/logging-tracing-guide.md lines 1102-1157

**Validation**:

- [x] T049 [US3] Validate all TypeScript code examples in pii-redaction compile with strict mode (SC-003)
- [x] T050 [US3] Verify redaction patterns align with OWASP and NIST guidelines (SC-006)
- [x] T051 [US3] Test all regex patterns are valid and compilable

**Checkpoint**: pii-redaction skill complete and independently usable

---

## Phase 6: User Story 4 - Sentry Integration (Priority: P3)

**Goal**: Guide integration of Sentry for rich error tracking with breadcrumbs and context

**Independent Test**: Invoke skill when adding Sentry to a Worker; validate it provides withSentry wrapper configuration, context management, and breadcrumb patterns

### Implementation for User Story 4

**Directory Creation**:

- [x] T052 [US4] Create skill directory structure at .claude/skills/sentry-integration/ with references/ subdirectory

**SKILL.md Creation** (~120 lines target):

- [x] T053 [US4] Create .claude/skills/sentry-integration/SKILL.md using contracts/skill-template.md
- [x] T054 [US4] Add "Use when:" description to SKILL.md: "Use when integrating Sentry for rich error tracking with breadcrumbs and context while maintaining structured log correlation"
- [x] T055 [US4] Add decision tree to SKILL.md routing to setup/context/breadcrumbs/error-capture references
- [x] T056 [US4] Add quick example to SKILL.md showing withSentry wrapper (15-20 lines)
- [x] T057 [US4] Add cross-references to SKILL.md: structured-logging, pii-redaction
- [x] T058 [US4] Add reference files list to SKILL.md with one-line descriptions
- [x] T059 [US4] Validate SKILL.md is under 150 lines (SC-001)

**Reference Files Creation** (4 files, parallelizable):

- [x] T060 [P] [US4] Create .claude/skills/sentry-integration/references/withsentry-setup.md (~90 lines) from docs/logging-tracing-guide.md lines 658-727
- [x] T061 [P] [US4] Create .claude/skills/sentry-integration/references/context-management.md (~80 lines) from docs/logging-tracing-guide.md lines 728-763
- [x] T062 [P] [US4] Create .claude/skills/sentry-integration/references/breadcrumbs.md (~70 lines) from docs/logging-tracing-guide.md lines 764-816
- [x] T063 [P] [US4] Create .claude/skills/sentry-integration/references/error-capture.md (~80 lines) from docs/logging-tracing-guide.md lines 764-816, 817-853

**Validation**:

- [x] T064 [US4] Validate all TypeScript code examples use @sentry/cloudflare SDK (not browser/node)
- [x] T065 [US4] Verify beforeSend and beforeBreadcrumb filtering examples are correct (SC-003)
- [x] T066 [US4] Check cross-references in sentry-integration SKILL.md are accurate (SC-005)

**Checkpoint**: sentry-integration skill complete and independently usable

---

## Phase 7: User Story 6 - Testing Observability Code (Priority: P3)

**Goal**: Provide testing patterns for logging implementation including logger behavior, redaction correctness, and Workers runtime integration

**Independent Test**: Invoke skill when writing tests for logging code; validate it provides test patterns for logger unit tests, redaction validation, and Miniflare integration

**Note**: User Story 5 (Event Naming) was merged into User Story 1 (structured-logging) per research.md Decision 5

### Implementation for User Story 6

**Directory Creation**:

- [x] T067 [US6] Create skill directory structure at .claude/skills/testing-observability/ with references/ subdirectory

**SKILL.md Creation** (~110 lines target):

- [x] T068 [US6] Create .claude/skills/testing-observability/SKILL.md using contracts/skill-template.md
- [x] T069 [US6] Add "Use when:" description to SKILL.md: "Use when writing tests for logging implementation including logger behavior, redaction correctness, and Workers runtime integration"
- [x] T070 [US6] Add decision tree to SKILL.md routing to logger-unit/redaction/miniflare test references
- [x] T071 [US6] Add quick example to SKILL.md showing console.log spy test (15-20 lines)
- [x] T072 [US6] Add cross-references to SKILL.md: typescript-unit-testing, vitest-cloudflare-config
- [x] T073 [US6] Add reference files list to SKILL.md with one-line descriptions
- [x] T074 [US6] Validate SKILL.md is under 150 lines (SC-001)

**Reference Files Creation** (3 files, parallelizable):

- [x] T075 [P] [US6] Create .claude/skills/testing-observability/references/logger-unit-tests.md (~90 lines) from docs/logging-tracing-guide.md lines 1436-1523
- [x] T076 [P] [US6] Create .claude/skills/testing-observability/references/redaction-tests.md (~110 lines) from docs/logging-tracing-guide.md lines 1525-1600
- [x] T077 [P] [US6] Create .claude/skills/testing-observability/references/miniflare-integration.md (~90 lines) from docs/logging-tracing-guide.md lines 1602-1653

**Validation**:

- [x] T078 [US6] Validate all test examples use Vitest (not Jest) (SC-003)
- [x] T079 [US6] Verify vitest-pool-workers integration patterns are correct
- [x] T080 [US6] Check cross-references in testing-observability SKILL.md are accurate (SC-005)

**Checkpoint**: testing-observability skill complete and independently usable

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation updates that affect all skills

- [x] T081 [P] Validate all SKILL.md files start descriptions with "Use when:" (SC-002)
- [x] T082 [P] Validate no content duplication from 002-observability-skills (FR-011)
- [x] T083 [P] Verify all skills follow progressive disclosure pattern (FR-012)
- [x] T084 Validate all cross-references are bidirectional where appropriate (SC-005)
- [x] T085 Update .claude/CLAUDE.md with new skill references (already done via update-agent-context.sh)
- [x] T086 [P] Create .claude/skills/README.md with skill usage examples (if doesn't exist)
- [x] T087 [P] Add skill invocation patterns documentation to main CLAUDE.md

**Checkpoint**: All skills validated and documented - feature complete

---

## Dependencies Between User Stories

```
Phase 1 (Setup)
     ↓
Phase 2 (Foundational - Templates)
     ↓
     ├──→ Phase 3: US1 (structured-logging) [P1] 🎯 MVP
     │         ↓
     ├──→ Phase 4: US2 (log-categorization) [P1] (depends on US1 for cross-reference)
     │         ↓
     ├──→ Phase 5: US3 (pii-redaction) [P2] (depends on US1 for cross-reference)
     │         ↓
     ├──→ Phase 6: US4 (sentry-integration) [P3] (depends on US1, US3 for cross-references)
     │         ↓
     └──→ Phase 7: US6 (testing-observability) [P3] (independent, cross-refs external skills)
              ↓
Phase 8 (Polish) - validates all skills
```

**Parallel Opportunities**:

- All reference files within each user story can be created in parallel (tasks marked with [P])
- Validation tasks can run in parallel (T081, T082, T083)
- Documentation tasks can run in parallel (T086, T087)

---

## Implementation Strategy

### MVP Scope (Recommended)

**User Story 1 (structured-logging) ONLY** - Tasks T001-T021

- Provides foundational structured logging capability
- Independently testable and deliverable
- Estimated effort: 7-12 hours

### Incremental Delivery

1. **Phase 1**: US1 (structured-logging) - Foundation [P1]
2. **Phase 2**: US2 (log-categorization) - Clean Architecture boundaries [P1]
3. **Phase 3**: US3 (pii-redaction) - Production safety [P2]
4. **Phase 4**: US4 + US6 - Advanced features [P3] (can be done in parallel)

### Parallel Execution Examples

**Within User Story 1** (after T007-T013 complete):

```bash
# All 5 reference files can be created simultaneously
Parallel [T014, T015, T016, T017, T018]
Then Sequential [T019, T020, T021] # Validation depends on all files
```

**Across User Stories** (after Phase 2 complete):

```bash
# US1 and US2 can be developed independently up to cross-reference validation
Parallel [US1: T006-T018, US2: T022-T033]
Then [US1: T019-T021] # US1 validation
Then [US2: T034-T036] # US2 validation (needs US1 complete for cross-ref check)
```

---

## Summary

**Total Tasks**: 87 tasks

- Setup: 2 tasks
- Foundational: 3 tasks
- User Story 1: 16 tasks (MVP)
- User Story 2: 15 tasks
- User Story 3: 15 tasks
- User Story 4: 15 tasks
- User Story 6: 14 tasks (User Story 5 merged into US1)
- Polish: 7 tasks

**Tasks per User Story**:

- US1 (P1): 16 tasks - structured-logging skill
- US2 (P1): 15 tasks - log-categorization skill
- US3 (P2): 15 tasks - pii-redaction skill
- US4 (P3): 15 tasks - sentry-integration skill
- US6 (P3): 14 tasks - testing-observability skill

**Parallel Opportunities**: 38 tasks marked with [P] can run in parallel within their phases

**Independent Test Criteria**:

- US1: Invoke skill → provides SafeLogger, BaseLogFields, AsyncLocalStorage patterns
- US2: Invoke skill → provides decision matrix and logger interfaces
- US3: Invoke skill → provides redaction patterns and sanitization
- US4: Invoke skill → provides withSentry configuration and context patterns
- US6: Invoke skill → provides test patterns for logger/redaction/Miniflare

**Format Validation**: ✅ All tasks follow `- [ ] [ID] [P?] [Story?] Description with file path` format
