# Feature Specification: Self-Organizing Seed Repository Skeleton

**Feature Branch**: `006-self-organizing-skeleton`
**Created**: 2026-01-15
**Status**: Draft
**Input**: Create self-organizing seed repository with directory skeleton, distributed CLAUDE.md files aligned with DDD/Clean Code principles, and Claude Skills alignment verification.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Clones Repository and Gets Contextual Guidance (Priority: P1)

A developer clones this seed repository to start a new Cloudflare Workers project. Upon navigating to any directory within `src/`, they find a local `CLAUDE.md` file that provides concise, context-aware guidance for that layer or module. Claude Code automatically loads this context, ensuring the developer receives relevant architectural guidance, naming conventions, and applicable Claude Skills without needing to read the entire 2700+ line global guide.

**Why this priority**: This is the core value proposition—contextual guidance reduces cognitive load and ensures developers follow established patterns from day one. Without this, the repository is just empty directories.

**Independent Test**: Clone the repository, navigate to `src/domain/entities/`, and verify a CLAUDE.md file exists with guidance specific to creating domain entities.

**Acceptance Scenarios**:

1. **Given** a newly cloned repository, **When** a developer navigates to `src/domain/`, **Then** they find a CLAUDE.md file with domain layer guidance including entity and value object patterns.
2. **Given** a developer working in `src/infrastructure/repositories/`, **When** they invoke Claude Code, **Then** it loads local CLAUDE.md context with D1 repository patterns and links to relevant skills.
3. **Given** a developer in any `src/` subdirectory, **When** they check for guidance files, **Then** they find either a local CLAUDE.md or inherit from the nearest parent CLAUDE.md.

---

### User Story 2 - Repository Has Complete Directory Skeleton Ready for Development (Priority: P1)

A developer clones the repository and finds a complete, pre-structured directory skeleton matching the DDD/Clean Architecture layout from the guide. Empty directories are preserved with `.gitkeep` files, allowing immediate development without setup overhead.

**Why this priority**: Equal priority with User Story 1 because the skeleton provides the structure that CLAUDE.md files describe. One without the other delivers incomplete value.

**Independent Test**: Clone the repository and verify all directories from the DDD guide exist: `src/domain/entities/`, `src/application/use-cases/`, `src/infrastructure/repositories/`, `src/presentation/handlers/`, etc.

**Acceptance Scenarios**:

1. **Given** a newly cloned repository, **When** a developer lists directories under `src/`, **Then** they find: domain/, application/, infrastructure/, presentation/, and their prescribed subdirectories.
2. **Given** the skeleton structure, **When** checking for empty directory preservation, **Then** every leaf directory contains a `.gitkeep` file if otherwise empty.
3. **Given** the directory structure, **When** comparing to the DDD/Clean Code guide, **Then** all directory paths match the prescribed structure.

---

### User Story 3 - Claude Skills Reference Established Directory Structure (Priority: P2)

Existing Claude Skills in `.claude/skills/` are verified to be consistent with the established directory skeleton. Each skill that references file paths, directory structures, or code organization aligns with the patterns defined in the DDD/Clean Code guide and Prefactoring principles.

**Why this priority**: Skills that conflict with the skeleton create confusion. This ensures internal consistency but depends on the skeleton being established first.

**Independent Test**: Review the `ddd-domain-modeling` skill and verify its entity patterns reference `src/domain/entities/` correctly.

**Acceptance Scenarios**:

1. **Given** the established skeleton, **When** reviewing a skill like `d1-repository-implementation`, **Then** its file path references match `src/infrastructure/repositories/`.
2. **Given** a skill that mentions directory structures, **When** comparing to the skeleton, **Then** all referenced paths exist in the skeleton or are clearly documented as dynamically created.
3. **Given** any skill referencing architectural layers, **When** cross-referencing the DDD guide, **Then** layer terminology and boundaries match.

---

### User Story 4 - CLAUDE.md Files Reference Relevant Skills (Priority: P2)

Each local CLAUDE.md file in the skeleton includes references to Claude Skills applicable to that directory. A developer working in `src/infrastructure/repositories/` sees skills like `d1-repository-implementation` and `vitest-integration-testing` called out.

**Why this priority**: Skill discoverability accelerates development but requires both skeleton and skills alignment to be complete.

**Independent Test**: Read `src/application/use-cases/CLAUDE.md` and verify it references the `cloudflare-use-case-creator` skill.

**Acceptance Scenarios**:

1. **Given** a CLAUDE.md in `src/domain/`, **When** checking skill references, **Then** it lists: `ddd-domain-modeling`, `typescript-unit-testing`.
2. **Given** a CLAUDE.md in `src/presentation/handlers/`, **When** checking skill references, **Then** it lists: `worker-request-handler`, `htmx-pattern-library`.
3. **Given** any CLAUDE.md file, **When** listing referenced skills, **Then** all listed skills exist in `.claude/skills/`.

---

### Edge Cases

- What happens when a CLAUDE.md file references a skill that doesn't exist? Document the expected skills so missing ones are obvious.
- How are conflicting guidelines between parent and child CLAUDE.md files resolved? Child takes precedence for that directory.
- What if a developer creates a new directory not in the skeleton? Parent CLAUDE.md guidance applies; new directories follow the closest parent pattern.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Repository MUST contain a complete directory skeleton under `src/` matching the DDD/Clean Code guide structure.
- **FR-002**: Each layer directory AND subdirectory (e.g., `domain/`, `domain/entities/`, `domain/value-objects/`, `application/use-cases/`, etc.) MUST contain a CLAUDE.md file.
- **FR-003**: Empty directories MUST be preserved using `.gitkeep` files.
- **FR-004**: Each layer-level CLAUDE.md MUST include:
  - Brief description of the layer's responsibility (under 50 words)
  - Key patterns/conventions for that layer
  - List of applicable Claude Skills
  - Reference to the global DDD/Clean Code guide for details
- **FR-004a**: Each subdirectory-level CLAUDE.md MUST include:
  - Purpose of the subdirectory (under 25 words)
  - Specific patterns for that subdirectory type
  - Applicable Claude Skills (subset of parent layer skills)
- **FR-005**: Layer-level CLAUDE.md files MUST be under 100 lines; subdirectory-level MUST be under 50 lines to minimize token usage.
- **FR-006**: Claude Skills that reference directory structures MUST be verified for consistency with the skeleton; discrepancies MUST be fixed by updating skill file path references to match the skeleton.
- **FR-007**: Repository MUST include a `tests/` directory structure mirroring the `src/` structure for test fixtures.
- **FR-008**: Repository MUST include a `migrations/` directory for D1 database migrations.
- **FR-009**: Repository MUST include a `public/` directory for static content as prescribed by the guide.

### Key Entities

- **Directory Skeleton**: The hierarchical directory structure under `src/`, `tests/`, `migrations/`, and `public/`.
- **CLAUDE.md File**: A markdown file providing contextual guidance for Claude Code within a specific directory scope.
- **Claude Skill**: An existing skill definition in `.claude/skills/` that may reference or be referenced by the skeleton structure.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Repository contains all 15+ directories prescribed by the DDD/Clean Code guide under `src/`.
- **SC-002**: 100% of layer directories AND their subdirectories have local CLAUDE.md files (12+ files total).
- **SC-003**: Layer-level CLAUDE.md files are under 100 lines; subdirectory-level files are under 50 lines.
- **SC-004**: All existing Claude Skills referencing directory paths are updated to be consistent with skeleton.
- **SC-005**: Developers can clone the repository and begin development within 5 minutes without additional setup.
- **SC-006**: Total token overhead from all CLAUDE.md files combined is under 5,000 tokens.

## Clarifications

### Session 2026-01-15

- Q: Should CLAUDE.md files exist only at layer level or also at subdirectory level? → A: Layer + subdirectory level (12+ files), kept concise and token-efficient.
- Q: What action to take when skill verification finds discrepancies with skeleton? → A: Fix skills in-place by updating file path references to match skeleton.

## Assumptions

- The DDD/Clean Code guide at `docs/ddd-clean-code-guide.md` represents the canonical directory structure.
- Claude Skills in `.claude/skills/` are the authoritative set to verify.
- Prefactoring principles guide the organizational decisions (e.g., "clump data so there is less to think about" → each CLAUDE.md is self-contained).
- The root CLAUDE.md file remains the primary configuration; local files supplement rather than replace.
- TypeScript/Cloudflare Workers is the assumed technology stack per the existing project configuration.

## Out of Scope

- Implementation of actual application code (entities, use cases, etc.)—only skeleton structure.
- Creation of new Claude Skills—existing skills will be updated for path alignment but no new skills created.
- Changes to the DDD/Clean Code guide itself.
- CI/CD configuration or deployment setup.
