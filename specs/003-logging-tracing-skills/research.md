# Research: Logging & Tracing Claude Skills

**Feature**: 003-logging-tracing-skills
**Date**: 2026-01-14
**Purpose**: Document decisions and rationale for skill structure, content organization, and cross-references

## Key Decisions

### Decision 1: Five Separate Skills vs Single Monolithic Skill

**Decision**: Create five separate skills (structured-logging, log-categorization, pii-redaction, sentry-integration, testing-observability) rather than one comprehensive logging-tracing skill.

**Rationale**:

- Each skill addresses a distinct developer concern with minimal overlap
- Separate skills enable targeted invocation (developer only loads relevant content)
- Reduces token usage compared to single large skill
- Follows precedent from existing skills which are focused on specific concerns
- User stories map cleanly to individual skills (User Story 1 → structured-logging, User Story 2 → log-categorization, etc.)

**Alternatives Considered**:

- **Single comprehensive skill**: Would be >500 lines even with references, exceeding token efficiency goals
- **Two consolidated skills** (logging-basics + advanced-patterns): Creates artificial grouping that doesn't match developer workflows

**Supporting Evidence**:

- Existing `typescript-unit-testing` skill is focused (~150 lines)
- `cloudflare-observability` skill from 002 is single-purpose (metrics/SLOs)
- User story priorities indicate structured-logging and log-categorization are P1 (foundational) while others are P2/P3 (incremental)

---

### Decision 2: Progressive Disclosure via References

**Decision**: Each SKILL.md contains decision-tree logic (<150 lines) with detailed implementation patterns in references/ directory.

**Rationale**:

- Keeps SKILL.md token-efficient (SC-001 requirement)
- Developers see "when to use" guidance first, dive into details only when needed
- Matches existing skill patterns (002-observability-skills uses this structure)
- Supports different skill depths: quick-start guidance vs comprehensive implementation

**Alternatives Considered**:

- **Flat structure** (all content in SKILL.md): Violates SC-001 token efficiency requirement
- **External docs references** (link to docs/logging-tracing-guide.md): Loses context-aware guidance specific to skill invocation patterns

**Implementation Pattern**:

```
SKILL.md structure:
- When to use this skill (1-line description)
- Decision tree: "If X, see references/Y.md"
- Quick examples (2-3 code snippets)
- Cross-references to related skills

references/ structure:
- Focused topic files (50-150 lines each)
- Complete code examples with types
- Decision matrices and checklists
```

---

### Decision 3: Cross-Referencing Strategy

**Decision**: Skills cross-reference existing skills (vitest-cloudflare-config, typescript-unit-testing, cloudflare-observability) but do NOT duplicate their content.

**Rationale**:

- FR-004 and FR-011 explicitly require cross-references and no duplication
- Prevents skill sprawl and content conflicts
- Leverages existing established patterns

**Cross-Reference Matrix**:

| This Skill            | Cross-References                                  | For What                                          |
| --------------------- | ------------------------------------------------- | ------------------------------------------------- |
| structured-logging    | cloudflare-observability                          | Request timing patterns, metrics integration      |
| log-categorization    | cloudflare-observability                          | SLO impact categorization                         |
| pii-redaction         | (none - unique concern)                           | -                                                 |
| sentry-integration    | structured-logging                                | Log correlation with Sentry breadcrumbs           |
| testing-observability | vitest-cloudflare-config, typescript-unit-testing | General testing patterns, Workers-specific config |

**Alternatives Considered**:

- **Self-contained skills**: Would duplicate vitest setup patterns, increasing maintenance burden
- **Embedded references**: Would make SKILL.md files too large

---

### Decision 4: Code Example Standards

**Decision**: All code examples must compile with strict TypeScript (ES2022) and be compatible with Cloudflare Workers runtime.

**Rationale**:

- SC-003 requires 100% compilability
- Constitution Principle II (Type Safety) requires strict mode
- Constitution Principle VI (Workers Target) requires runtime compatibility
- Examples must serve as copy-paste patterns, not pseudo-code

**Standards**:

- Explicit return types on all functions
- No `any` types (use `unknown` with type guards)
- AsyncLocalStorage requires `nodejs_als` compatibility flag (documented in assumptions)
- Sentry SDK must be `@sentry/cloudflare` (not `@sentry/browser` or `@sentry/node`)

**Validation Strategy**:

- Code examples will be validated during implementation via `tsc --noEmit`
- Examples reference existing tsconfig.json strict settings

**Alternatives Considered**:

- **Pseudo-code examples**: Would fail SC-003 requirement and reduce trust in patterns
- **Relaxed type checking**: Would violate Constitution and provide poor guidance

---

### Decision 5: Skill Naming Conventions

**Decision**: Use kebab-case skill names matching existing pattern: `structured-logging`, `log-categorization`, `pii-redaction`, `sentry-integration`, `testing-observability`.

**Rationale**:

- Matches existing skill naming (e.g., `typescript-unit-testing`, `cloudflare-observability`)
- Spec Assumptions section explicitly specifies kebab-case
- Consistency with `.claude/skills/` directory structure

**Naming Pattern Analysis**:

- User Story 1 → `structured-logging` (focus on logger setup)
- User Story 2 → `log-categorization` (focus on domain/app/infra boundaries)
- User Story 3 → `pii-redaction` (focus on data protection)
- User Story 4 → `sentry-integration` (focus on external service)
- User Story 5 → `event-naming` initially considered, but merged into `structured-logging` as related concern
- User Story 6 → `testing-observability` (focus on testing patterns)

**Final Count**: 5 skills (event-naming merged into structured-logging since event naming is part of structured log schema)

---

### Decision 6: Testing Strategy for Skills

**Decision**: Skills include testing patterns but do NOT include executable tests (skills are documentation).

**Rationale**:

- Constitution Principle IV (Pre-commit Quality Gates) marked N/A for documentation
- Skills guide others on writing tests, but aren't tested themselves
- Code examples validated via `tsc --noEmit` (compilation check) not test execution

**Testing Scope**:

- `testing-observability` skill provides:
  - Logger unit test patterns (console.log spy)
  - Redaction validation test cases
  - Miniflare integration test setup
- Cross-references `typescript-unit-testing` for general TDD workflow
- Cross-references `vitest-cloudflare-config` for Workers-specific test configuration

**Alternatives Considered**:

- **Executable example tests**: Would require test infrastructure for skill docs, violating simplicity principle
- **No testing guidance**: Would violate User Story 6 and FR-010

---

### Decision 7: Reference File Size Guidelines

**Decision**: Reference files should be 50-150 lines each, focusing on single topics with clear examples.

**Rationale**:

- Balances SC-004 (sufficient detail for implementation) with token efficiency
- 002-observability-skills precedent shows reference files in this range
- Single-topic focus enables progressive disclosure

**Content Density Guidelines**:

- 30-40% code examples (copy-paste ready)
- 30-40% decision matrices/checklists (actionable guidance)
- 20-30% explanatory text (why, not what)

**Quality Checks**:

- Can developer implement pattern without external docs? (SC-004)
- Does file have clear single purpose?
- Are code examples complete (imports, types, exports)?

---

## Unresolved Questions

None. All Technical Context items have clear answers based on spec assumptions and existing patterns.

## Next Steps

Proceed to Phase 1 (Design):

1. Generate data-model.md (skill structure and relationships)
2. Generate contracts/ templates (SKILL.md and reference templates)
3. Generate quickstart.md (implementation sequence)
4. Update agent context
