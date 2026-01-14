# Tasks: Cloudflare Observability Skill

**Input**: Design documents from `/specs/002-observability-skills/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - omitting test tasks. Reference file `testing-observability.md` covers testing patterns for users.

**Organization**: Tasks are grouped by user story to enable independent implementation. Since this is a documentation project (Claude Code skill files), each "implementation" creates markdown files with TypeScript code examples.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Skill directory**: `.claude/skills/cloudflare-observability/`
- **References directory**: `.claude/skills/cloudflare-observability/references/`
- **Source guide**: `docs/cloudflare-metrics-healthchecks-guide.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create skill directory structure

- [x] T001 Create skill directory structure at `.claude/skills/cloudflare-observability/references/`

---

## Phase 2: Foundational (SKILL.md - Blocking Prerequisite)

**Purpose**: Create the main SKILL.md file that all reference files link back to

**⚠️ CRITICAL**: SKILL.md defines the skill's entry point and navigation structure. Must be created before reference files to ensure consistent linking.

- [x] T002 Create SKILL.md at `.claude/skills/cloudflare-observability/SKILL.md` using template from `specs/002-observability-skills/contracts/skill-template.md` (must be under 150 lines)

**Checkpoint**: SKILL.md ready - reference file implementation can now begin in parallel

---

## Phase 3: User Story 1 - SLO-Driven Metrics Design (Priority: P1) 🎯 MVP

**Goal**: Provide SLI/SLO definitions, error budget calculation, and burn rate alerting patterns

**Independent Test**: Invoke skill when defining new SLOs and verify guidance on target selection, error budget calculation, and burn rate thresholds

### Implementation for User Story 1

- [x] T003 [US1] Create slo-tracking.md at `.claude/skills/cloudflare-observability/references/slo-tracking.md` with:
  - SLI vs SLO vs SLA explanation
  - SLODefinition interface from data-model.md
  - Error budget calculation formula
  - Burn rate alerting thresholds
  - SLOTracker class implementation
  - Example SLO definitions (availability, latency)
  - Source: Guide sections Philosophy (lines 125-180), SLO Implementation Patterns (lines 2093-2542)

**Checkpoint**: SLO tracking reference complete - foundational observability philosophy documented

---

## Phase 4: User Story 2 - Request Timing Implementation (Priority: P1)

**Goal**: Provide RequestTimer class, phase timing, and Server-Timing header patterns

**Independent Test**: Invoke skill when adding timing to a Worker handler and verify RequestTimer class pattern and Server-Timing formatting

### Implementation for User Story 2

- [x] T004 [P] [US2] Create request-timing.md at `.claude/skills/cloudflare-observability/references/request-timing.md` with:
  - TimingPhase and RequestTimings interfaces from data-model.md
  - RequestTimer class (full implementation with startPhase/endPhase/timePhase/finalize)
  - Timing middleware factory
  - Server-Timing header formatting
  - Usage in handlers example
  - Source: Guide section Request Timing Metrics (lines 287-916)

**Checkpoint**: Request timing reference complete - core latency measurement documented

---

## Phase 5: User Story 3 - Error Tracking and Categorization (Priority: P2)

**Goal**: Provide error categorization logic and SLO impact determination

**Independent Test**: Invoke skill when implementing error handling and verify error categorization and countsAgainstSLO pattern

### Implementation for User Story 3

- [x] T005 [P] [US3] Create error-tracking.md at `.claude/skills/cloudflare-observability/references/error-tracking.md` with:
  - ErrorCategory enum with all values
  - TrackedError and ErrorSummary interfaces from data-model.md
  - ErrorTracker class (full implementation with track/recordRequest/getSummary)
  - Categorization logic explanation
  - countsAgainstSLO() rationale
  - Source: Guide section Error Rate Tracking (lines 918-1380)

**Checkpoint**: Error tracking reference complete - error categorization for SLOs documented

---

## Phase 6: User Story 4 - Health Endpoint Implementation (Priority: P2)

**Goal**: Provide health endpoint patterns for liveness, readiness, and detailed checks

**Independent Test**: Invoke skill when adding health routes and verify endpoint patterns for /health, /health/live, /health/ready, /health/detailed

### Implementation for User Story 4

- [x] T006 [P] [US4] Create health-endpoints.md at `.claude/skills/cloudflare-observability/references/health-endpoints.md` with:
  - HealthStatus enum
  - DependencyHealth and HealthCheckResult interfaces from data-model.md
  - DependencyChecker interface
  - HealthChecker class (checkLiveness/checkReadiness/checkDetailed)
  - Health endpoint handlers (simple, live, ready, detailed)
  - Cross-reference to d1-repository-implementation (don't duplicate D1 patterns)
  - Source: Guide section Health Endpoints (lines 1382-2090)

**Checkpoint**: Health endpoints reference complete - operational visibility patterns documented

---

## Phase 7: User Story 5 - Dependency Health Checks (Priority: P3)

**Goal**: Provide specific health check implementations for D1, KV, and HTTP dependencies

**Independent Test**: Invoke skill when adding D1 or KV health check and verify DependencyChecker implementations

### Implementation for User Story 5

- [x] T007 [US5] Add dependency checker implementations to `.claude/skills/cloudflare-observability/references/health-endpoints.md`:
  - D1HealthCheck class (query verification pattern)
  - KVHealthCheck class (write/read verification pattern)
  - HttpHealthCheck class (timeout and status verification pattern)
  - Note: Add to existing health-endpoints.md rather than separate file
  - Source: Guide section Health Endpoints (lines 1382-2090)

**Checkpoint**: Dependency health checks added to health-endpoints.md

---

## Phase 8: User Story 6 - Analytics Engine Integration (Priority: P3)

**Goal**: Provide Analytics Engine write patterns and SQL query examples

**Independent Test**: Invoke skill when writing metrics and verify writeDataPoint pattern and SQL query examples

### Implementation for User Story 6

- [x] T008 [P] [US6] Create analytics-engine.md at `.claude/skills/cloudflare-observability/references/analytics-engine.md` with:
  - AnalyticsEngineDataset binding setup
  - writeDataPoint field mapping (blobs, doubles, indexes)
  - AnalyticsEngineAdapter class from data-model.md
  - SQL query examples:
    - Latency percentiles (quantileExact)
    - Error rates by endpoint (countIf, grouping)
    - Request trends per minute
    - Slow request identification
  - Source: Guide section Infrastructure Integration (lines 2646-2904)

**Checkpoint**: Analytics Engine reference complete - metrics persistence documented

---

## Phase 9: Testing Patterns (Cross-Cutting Reference)

**Goal**: Provide observability-specific testing patterns with cross-references to existing testing skills

**Independent Test**: Invoke skill for testing observability code and verify mock patterns and fake timer usage

### Implementation for Testing Reference

- [x] T009 [P] Create testing-observability.md at `.claude/skills/cloudflare-observability/references/testing-observability.md` with:
  - vi.useFakeTimers() for RequestTimer tests
  - Mock DependencyChecker pattern
  - ErrorTracker test examples
  - HealthChecker test examples
  - Middleware testing in isolation
  - Cross-references:
    - typescript-unit-testing for TDD principles
    - vitest-cloudflare-config for Workers setup
  - Source: Guide section Testing Observability Code (lines 2906-3175)

**Checkpoint**: Testing patterns reference complete - all core skill content created

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Validate all files meet quality standards

- [x] T010 Validate SKILL.md is under 150 lines in `.claude/skills/cloudflare-observability/SKILL.md`
- [x] T011 [P] Verify all TypeScript code examples use explicit return types (no `any`) across all reference files
- [x] T012 [P] Verify all cross-references resolve correctly between skill files
- [x] T013 Run validation checklist from `specs/002-observability-skills/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all reference file creation
- **User Stories (Phases 3-9)**: All depend on SKILL.md completion
  - US1 (T003) can proceed first as foundational SLO content
  - US2-US6 (T004-T009) can proceed in parallel after T003
  - Exception: T007 depends on T006 (adds to same file)
- **Polish (Phase 10)**: Depends on all reference files being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after SKILL.md - No dependencies on other stories
- **User Story 2 (P1)**: Can start after SKILL.md - References SLO concepts from US1
- **User Story 3 (P2)**: Can start after SKILL.md - References SLO impact from US1
- **User Story 4 (P2)**: Can start after SKILL.md - Independent
- **User Story 5 (P3)**: **Depends on US4** - Adds content to health-endpoints.md
- **User Story 6 (P3)**: Can start after SKILL.md - Independent

### Parallel Opportunities

Once SKILL.md (T002) is complete:

- T003 (US1 - slo-tracking.md) should be first for foundational context
- T004, T005, T006, T008, T009 can all run in parallel (different files)
- T007 must wait for T006 (same file)
- T010-T013 can run in parallel (validation tasks)

---

## Parallel Example: Reference File Creation

```bash
# After T002 (SKILL.md) and T003 (slo-tracking.md) complete:
# Launch these reference files in parallel:
Task T004: "Create request-timing.md at .claude/skills/cloudflare-observability/references/request-timing.md"
Task T005: "Create error-tracking.md at .claude/skills/cloudflare-observability/references/error-tracking.md"
Task T006: "Create health-endpoints.md at .claude/skills/cloudflare-observability/references/health-endpoints.md"
Task T008: "Create analytics-engine.md at .claude/skills/cloudflare-observability/references/analytics-engine.md"
Task T009: "Create testing-observability.md at .claude/skills/cloudflare-observability/references/testing-observability.md"

# Then after T006 completes:
Task T007: "Add dependency checker implementations to health-endpoints.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: SKILL.md (T002)
3. Complete Phase 3: slo-tracking.md (T003)
4. **STOP and VALIDATE**: Skill can be invoked for SLO guidance
5. Core observability philosophy is immediately useful

### Incremental Delivery

1. T001-T002 → Skill directory and navigation ready
2. T003 (US1) → SLO-first philosophy available (MVP!)
3. T004 (US2) → Request timing patterns available
4. T005 (US3) → Error tracking patterns available
5. T006-T007 (US4-US5) → Health endpoint patterns available
6. T008 (US6) → Analytics Engine integration available
7. T009 → Testing patterns available
8. T010-T013 → Quality validation complete

### Recommended Execution

Given this is a documentation project with one implementer:

1. T001 → T002 → T003 (foundation first)
2. T004, T005, T006 in parallel (core references)
3. T007 (depends on T006)
4. T008, T009 in parallel (remaining references)
5. T010-T013 (validation)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each reference file should be self-contained and usable independently
- Source guide: `docs/cloudflare-metrics-healthchecks-guide.md`
- All code examples must compile in Cloudflare Workers TypeScript environment
- Cross-reference existing skills (typescript-unit-testing, vitest-cloudflare-config) don't duplicate
