# Implementation Tasks: Self-Organizing Seed Repository Skeleton

**Feature**: 006-self-organizing-skeleton
**Generated**: 2026-01-15
**Source**: spec.md, plan.md, data-model.md, contracts/skeleton-structure.md

## Task Overview

| Phase                  | Tasks  | User Stories | Priority |
| ---------------------- | ------ | ------------ | -------- |
| Setup                  | 1      | -            | -        |
| Skeleton               | 5      | US2          | P1       |
| Layer CLAUDE.md        | 4      | US1          | P1       |
| Subdirectory CLAUDE.md | 6      | US1, US4     | P1, P2   |
| Verification           | 2      | US3          | P2       |
| Validation             | 2      | All          | -        |
| **Total**              | **20** |              |          |

---

## Phase 1: Setup

### Task 1.1: Create Feature Branch

**User Story**: Setup
**Priority**: P0
**Depends On**: None

**Description**: Ensure working on the correct feature branch.

**Acceptance Criteria**:

- [x] Branch `006-self-organizing-skeleton` exists and is checked out

**Implementation Notes**:

- Branch was created during `/sp:02-specify`
- Verify with `git branch --show-current`

---

## Phase 2: Directory Skeleton (US2 - P1)

### Task 2.1: Create Domain Layer Directories

**User Story**: US2 - Repository Has Complete Directory Skeleton
**Priority**: P1
**Depends On**: 1.1

**Description**: Create all domain layer directories with `.gitkeep` files.

**Acceptance Criteria**:

- [x] `src/domain/` exists
- [x] `src/domain/entities/` exists with `.gitkeep`
- [x] `src/domain/value-objects/` exists with `.gitkeep`
- [x] `src/domain/services/` exists with `.gitkeep`
- [x] `src/domain/interfaces/` exists with `.gitkeep`

**Implementation Notes**:

```bash
mkdir -p src/domain/{entities,value-objects,services,interfaces}
touch src/domain/entities/.gitkeep
touch src/domain/value-objects/.gitkeep
touch src/domain/services/.gitkeep
touch src/domain/interfaces/.gitkeep
```

---

### Task 2.2: Create Application Layer Directories

**User Story**: US2
**Priority**: P1
**Depends On**: 1.1

**Description**: Create all application layer directories with `.gitkeep` files.

**Acceptance Criteria**:

- [x] `src/application/` exists
- [x] `src/application/use-cases/` exists with `.gitkeep`
- [x] `src/application/services/` exists with `.gitkeep`
- [x] `src/application/dto/` exists with `.gitkeep`

**Implementation Notes**:

```bash
mkdir -p src/application/{use-cases,services,dto}
touch src/application/use-cases/.gitkeep
touch src/application/services/.gitkeep
touch src/application/dto/.gitkeep
```

---

### Task 2.3: Create Infrastructure Layer Directories

**User Story**: US2
**Priority**: P1
**Depends On**: 1.1

**Description**: Create all infrastructure layer directories with `.gitkeep` files.

**Acceptance Criteria**:

- [x] `src/infrastructure/` exists
- [x] `src/infrastructure/repositories/` exists with `.gitkeep`
- [x] `src/infrastructure/cache/` exists with `.gitkeep`
- [x] `src/infrastructure/services/` exists with `.gitkeep`

**Implementation Notes**:

```bash
mkdir -p src/infrastructure/{repositories,cache,services}
touch src/infrastructure/repositories/.gitkeep
touch src/infrastructure/cache/.gitkeep
touch src/infrastructure/services/.gitkeep
```

---

### Task 2.4: Create Presentation Layer Directories

**User Story**: US2
**Priority**: P1
**Depends On**: 1.1

**Description**: Create all presentation layer directories including nested templates.

**Acceptance Criteria**:

- [x] `src/presentation/` exists
- [x] `src/presentation/handlers/` exists with `.gitkeep`
- [x] `src/presentation/templates/` exists
- [x] `src/presentation/templates/layouts/` exists with `.gitkeep`
- [x] `src/presentation/templates/pages/` exists with `.gitkeep`
- [x] `src/presentation/templates/partials/` exists with `.gitkeep`
- [x] `src/presentation/middleware/` exists with `.gitkeep`
- [x] `src/presentation/utils/` exists with `.gitkeep`

**Implementation Notes**:

```bash
mkdir -p src/presentation/{handlers,middleware,utils}
mkdir -p src/presentation/templates/{layouts,pages,partials}
touch src/presentation/handlers/.gitkeep
touch src/presentation/templates/layouts/.gitkeep
touch src/presentation/templates/pages/.gitkeep
touch src/presentation/templates/partials/.gitkeep
touch src/presentation/middleware/.gitkeep
touch src/presentation/utils/.gitkeep
```

---

### Task 2.5: Create Supporting Directories

**User Story**: US2
**Priority**: P1
**Depends On**: 1.1

**Description**: Create tests/, migrations/, and public/ directories.

**Acceptance Criteria**:

- [x] `tests/` exists
- [x] `tests/fixtures/` exists with `.gitkeep`
- [x] `tests/helpers/` exists with `.gitkeep`
- [x] `migrations/` exists with `.gitkeep`
- [x] `public/` exists
- [x] `public/css/` exists with `.gitkeep`
- [x] `public/js/` exists with `.gitkeep`

**Implementation Notes**:

```bash
mkdir -p tests/{fixtures,helpers}
mkdir -p migrations
mkdir -p public/{css,js}
touch tests/fixtures/.gitkeep
touch tests/helpers/.gitkeep
touch migrations/.gitkeep
touch public/css/.gitkeep
touch public/js/.gitkeep
```

---

## Phase 3: Layer CLAUDE.md Files (US1 - P1)

### Task 3.1: Create Domain Layer CLAUDE.md

**User Story**: US1 - Developer Gets Contextual Guidance
**Priority**: P1
**Depends On**: 2.1

**Description**: Create CLAUDE.md for `src/domain/` layer.

**Acceptance Criteria**:

- [x] `src/domain/CLAUDE.md` exists
- [x] Contains responsibility description (< 50 words)
- [x] Lists patterns: Entities, Value Objects, Domain Services, Repository Interfaces
- [x] References skills: ddd-domain-modeling, typescript-unit-testing, clean-architecture-validator
- [x] Links to DDD guide
- [x] Under 100 lines

**Implementation Notes**:
Use template from `contracts/skeleton-structure.md` section "src/domain/CLAUDE.md"

---

### Task 3.2: Create Application Layer CLAUDE.md

**User Story**: US1
**Priority**: P1
**Depends On**: 2.2

**Description**: Create CLAUDE.md for `src/application/` layer.

**Acceptance Criteria**:

- [x] `src/application/CLAUDE.md` exists
- [x] Contains responsibility description (< 50 words)
- [x] Lists patterns: Use Cases, DTOs, Application Services
- [x] References skills: cloudflare-use-case-creator, typescript-unit-testing, clean-architecture-validator
- [x] Links to DDD guide
- [x] Under 100 lines

**Implementation Notes**:
Use template from `contracts/skeleton-structure.md` section "src/application/CLAUDE.md"

---

### Task 3.3: Create Infrastructure Layer CLAUDE.md

**User Story**: US1
**Priority**: P1
**Depends On**: 2.3

**Description**: Create CLAUDE.md for `src/infrastructure/` layer.

**Acceptance Criteria**:

- [x] `src/infrastructure/CLAUDE.md` exists
- [x] Contains responsibility description (< 50 words)
- [x] Lists patterns: Repository Implementations, External Services, Caching
- [x] References skills: d1-repository-implementation, kv-session-management, vitest-integration-testing, cloudflare-migrations
- [x] Links to DDD guide
- [x] Under 100 lines

**Implementation Notes**:
Use template from `contracts/skeleton-structure.md` section "src/infrastructure/CLAUDE.md"

---

### Task 3.4: Create Presentation Layer CLAUDE.md

**User Story**: US1
**Priority**: P1
**Depends On**: 2.4

**Description**: Create CLAUDE.md for `src/presentation/` layer.

**Acceptance Criteria**:

- [x] `src/presentation/CLAUDE.md` exists
- [x] Contains responsibility description (< 50 words)
- [x] Lists patterns: Handlers, Templates, Middleware
- [x] References skills: worker-request-handler, htmx-pattern-library, htmx-alpine-templates, security-review
- [x] Links to DDD guide
- [x] Under 100 lines

**Implementation Notes**:
Use template from `contracts/skeleton-structure.md` section "src/presentation/CLAUDE.md"

---

## Phase 4: Subdirectory CLAUDE.md Files (US1, US4 - P1, P2)

### Task 4.1: Create Domain Subdirectory CLAUDE.md Files

**User Story**: US1, US4
**Priority**: P1
**Depends On**: 3.1

**Description**: Create CLAUDE.md for all domain subdirectories.

**Acceptance Criteria**:

- [x] `src/domain/entities/CLAUDE.md` exists (< 50 lines)
- [x] `src/domain/value-objects/CLAUDE.md` exists (< 50 lines)
- [x] `src/domain/services/CLAUDE.md` exists (< 50 lines)
- [x] `src/domain/interfaces/CLAUDE.md` exists (< 50 lines)
- [x] Each references relevant skills from ddd-domain-modeling

**Implementation Notes**:
Use templates from `contracts/skeleton-structure.md`:

- entities: private constructor, create(), reconstitute() patterns
- value-objects: immutable, self-validating, equals() patterns
- services: stateless domain logic patterns
- interfaces: repository port/adapter patterns

---

### Task 4.2: Create Application Subdirectory CLAUDE.md Files

**User Story**: US1, US4
**Priority**: P1
**Depends On**: 3.2

**Description**: Create CLAUDE.md for all application subdirectories.

**Acceptance Criteria**:

- [x] `src/application/use-cases/CLAUDE.md` exists (< 50 lines)
- [x] `src/application/services/CLAUDE.md` exists (< 50 lines)
- [x] `src/application/dto/CLAUDE.md` exists (< 50 lines)
- [x] Each references relevant skills (cloudflare-use-case-creator, org-authorization)

**Implementation Notes**:
Use templates from `contracts/skeleton-structure.md`:

- use-cases: execute() method, Request/Response DTOs
- services: authorization, cross-cutting concerns
- dto: plain interfaces, no behavior

---

### Task 4.3: Create Infrastructure Subdirectory CLAUDE.md Files

**User Story**: US1, US4
**Priority**: P1
**Depends On**: 3.3

**Description**: Create CLAUDE.md for all infrastructure subdirectories.

**Acceptance Criteria**:

- [x] `src/infrastructure/repositories/CLAUDE.md` exists (< 50 lines)
- [x] `src/infrastructure/cache/CLAUDE.md` exists (< 50 lines)
- [x] `src/infrastructure/services/CLAUDE.md` exists (< 50 lines)
- [x] Each references relevant skills (d1-repository-implementation, kv-session-management, vitest-integration-testing)

**Implementation Notes**:
Use templates from `contracts/skeleton-structure.md`:

- repositories: D1 adapter patterns, reconstitute() usage
- cache: KV session store, TTL patterns
- services: third-party API integration patterns

---

### Task 4.4: Create Presentation Subdirectory CLAUDE.md Files

**User Story**: US1, US4
**Priority**: P1
**Depends On**: 3.4

**Description**: Create CLAUDE.md for presentation subdirectories (handlers, middleware, utils).

**Acceptance Criteria**:

- [x] `src/presentation/handlers/CLAUDE.md` exists (< 50 lines)
- [x] `src/presentation/middleware/CLAUDE.md` exists (< 50 lines)
- [x] `src/presentation/utils/CLAUDE.md` exists (< 50 lines)
- [x] Each references relevant skills (worker-request-handler, security-review, typescript-html-templates)

**Implementation Notes**:
Use templates from `contracts/skeleton-structure.md`

---

### Task 4.5: Create Templates Subdirectory CLAUDE.md Files

**User Story**: US1, US4
**Priority**: P1
**Depends On**: 3.4

**Description**: Create CLAUDE.md for templates and its subdirectories.

**Acceptance Criteria**:

- [x] `src/presentation/templates/CLAUDE.md` exists (< 50 lines)
- [x] `src/presentation/templates/layouts/CLAUDE.md` exists (< 50 lines)
- [x] `src/presentation/templates/pages/CLAUDE.md` exists (< 50 lines)
- [x] `src/presentation/templates/partials/CLAUDE.md` exists (< 50 lines)
- [x] Each references relevant skills (htmx-alpine-templates, htmx-pattern-library)

**Implementation Notes**:
Use templates from `contracts/skeleton-structure.md`:

- templates: HTML template composition patterns
- layouts: page wrappers (head, nav, footer)
- pages: full page content
- partials: HTMX fragments for partial updates

---

### Task 4.6: Create Supporting Directory CLAUDE.md Files

**User Story**: US1, US4
**Priority**: P2
**Depends On**: 2.5

**Description**: Create CLAUDE.md for tests/, migrations/, and public/ directories.

**Acceptance Criteria**:

- [x] `tests/CLAUDE.md` exists (< 50 lines)
- [x] `tests/fixtures/CLAUDE.md` exists (< 50 lines)
- [x] `tests/helpers/CLAUDE.md` exists (< 50 lines)
- [x] `migrations/CLAUDE.md` exists (< 50 lines)
- [x] `public/CLAUDE.md` exists (< 50 lines)
- [x] Each references relevant skills

**Implementation Notes**:
Use templates from `contracts/skeleton-structure.md`:

- tests: colocated test organization, vitest-cloudflare-config
- fixtures: builder patterns for test data
- helpers: test application factories
- migrations: D1 SQL migration patterns
- public: static asset organization, CDN routing

---

## Phase 5: Skills Verification (US3 - P2)

### Task 5.1: Verify Skills Path Alignment

**User Story**: US3 - Claude Skills Reference Established Directory Structure
**Priority**: P2
**Depends On**: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6

**Description**: Verify all 15 skills with path references align with skeleton.

**Acceptance Criteria**:

- [x] ddd-domain-modeling paths verified
- [x] clean-architecture-validator paths verified
- [x] cloudflare-use-case-creator paths verified
- [x] d1-repository-implementation paths verified
- [x] worker-request-handler paths verified
- [x] cloudflare-migrations paths verified
- [x] htmx-pattern-library paths verified
- [x] htmx-alpine-templates paths verified
- [x] typescript-unit-testing paths verified
- [x] vitest-integration-testing paths verified
- [x] vitest-cloudflare-config paths verified
- [x] kv-session-management paths verified
- [x] security-review paths verified
- [x] tailwind-daisyui-design paths verified
- [x] typescript-html-templates paths verified

**Implementation Notes**:
Per research.md, all 15 skills are already aligned. This task is verification only.
If discrepancies found, fix per FR-006: update skill file path references.

---

### Task 5.2: Verify CLAUDE.md Skill References

**User Story**: US3, US4
**Priority**: P2
**Depends On**: 5.1

**Description**: Verify all skills referenced in CLAUDE.md files exist.

**Acceptance Criteria**:

- [x] All skills in domain CLAUDE.md files exist
- [x] All skills in application CLAUDE.md files exist
- [x] All skills in infrastructure CLAUDE.md files exist
- [x] All skills in presentation CLAUDE.md files exist
- [x] All skills in supporting CLAUDE.md files exist

**Implementation Notes**:
Cross-reference each skill name in CLAUDE.md against `.claude/skills/` directory.
Skills are referenced as `/skill-name` format.

---

## Phase 6: Validation

### Task 6.1: Verify Directory Count and Structure

**User Story**: All
**Priority**: P1
**Depends On**: 2.1, 2.2, 2.3, 2.4, 2.5

**Description**: Verify all 28 directories exist with correct structure.

**Acceptance Criteria**:

- [x] 21 directories under `src/` (4 layers + 17 subdirectories)
- [x] 3 directories under `tests/`
- [x] 1 `migrations/` directory
- [x] 3 directories under `public/`
- [x] All leaf directories have `.gitkeep` files
- [x] Total: 28 directories

**Implementation Notes**:

```bash
find src tests migrations public -type d | wc -l
# Expected: 28
find src tests migrations public -name ".gitkeep" | wc -l
# Expected: matches empty directory count
```

---

### Task 6.2: Validate Token Budget

**User Story**: All
**Priority**: P1
**Depends On**: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6

**Description**: Verify total CLAUDE.md token count is under 5,000.

**Acceptance Criteria**:

- [x] Total lines under 2,000 (approximately 4,000-5,000 tokens)
- [x] Layer CLAUDE.md files under 100 lines each
- [x] Subdirectory CLAUDE.md files under 50 lines each
- [x] Total token overhead under 5,000

**Implementation Notes**:

```bash
# Count total lines
find src tests migrations public -name "CLAUDE.md" -exec wc -l {} \; | awk '{sum += $1} END {print "Total lines:", sum}'

# Verify layer files
wc -l src/domain/CLAUDE.md src/application/CLAUDE.md src/infrastructure/CLAUDE.md src/presentation/CLAUDE.md

# Spot check subdirectory files
wc -l src/domain/entities/CLAUDE.md
```

Target: ~3,900 tokens (well under 5,000 limit per research.md)

---

## Summary

| Phase                     | Task Count | Dependencies |
| ------------------------- | ---------- | ------------ |
| 1. Setup                  | 1          | None         |
| 2. Skeleton               | 5          | 1.1          |
| 3. Layer CLAUDE.md        | 4          | 2.x          |
| 4. Subdirectory CLAUDE.md | 6          | 3.x          |
| 5. Verification           | 2          | 4.x          |
| 6. Validation             | 2          | 2.x, 4.x     |
| **Total**                 | **20**     |              |

## Dependency Graph

```
1.1 Setup
 └──► 2.1, 2.2, 2.3, 2.4, 2.5 (Skeleton - parallel)
       │
       ├──► 3.1 Domain CLAUDE.md (depends on 2.1)
       │     └──► 4.1 Domain subdirs
       │
       ├──► 3.2 Application CLAUDE.md (depends on 2.2)
       │     └──► 4.2 Application subdirs
       │
       ├──► 3.3 Infrastructure CLAUDE.md (depends on 2.3)
       │     └──► 4.3 Infrastructure subdirs
       │
       ├──► 3.4 Presentation CLAUDE.md (depends on 2.4)
       │     ├──► 4.4 Presentation subdirs
       │     └──► 4.5 Templates subdirs
       │
       └──► 4.6 Supporting CLAUDE.md (depends on 2.5)
             │
             └──► 5.1 Skills verification
                   └──► 5.2 Reference verification
                         │
                         └──► 6.1, 6.2 Validation (parallel)
```

## Implementation Order

1. **Batch 1** (parallel): Tasks 2.1-2.5 (create all directories)
2. **Batch 2** (parallel): Tasks 3.1-3.4 (create layer CLAUDE.md files)
3. **Batch 3** (parallel): Tasks 4.1-4.6 (create subdirectory CLAUDE.md files)
4. **Batch 4** (sequential): Tasks 5.1, 5.2 (verification)
5. **Batch 5** (parallel): Tasks 6.1, 6.2 (validation)

Total estimated implementation: 5 batches, highly parallelizable.
