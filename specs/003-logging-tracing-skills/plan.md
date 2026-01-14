# Implementation Plan: Logging & Tracing Claude Skills

**Branch**: `003-logging-tracing-skills` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-logging-tracing-skills/spec.md`

## Summary

Create multiple focused Claude Code skills that guide developers in implementing structured logging and tracing for Cloudflare Workers following Clean Architecture principles. The skills cover: structured logger setup (SafeLogger, AsyncLocalStorage, request correlation), log categorization (domain/application/infrastructure boundaries), PII/secret redaction (defense-in-depth patterns), Sentry integration (rich error tracking), event naming conventions (dot-notation schema), and testing observability code. Each skill uses a decision-tree structure in SKILL.md (<150 lines) with detailed reference files for progressive disclosure.

## Technical Context

**Language/Version**: TypeScript (ES2022, NodeNext modules)
**Primary Dependencies**: Cloudflare Workers runtime, AsyncLocalStorage (nodejs_als), @sentry/cloudflare
**Storage**: N/A (skills are documentation, not code)
**Testing**: Vitest with vitest-pool-workers (for code examples)
**Target Platform**: Cloudflare Workers V8 isolate environment
**Project Type**: Documentation (Claude Code skills with markdown files)
**Performance Goals**: Each SKILL.md under 150 lines for token efficiency
**Constraints**: All code examples must be Workers-compatible TypeScript with strict type checking
**Scale/Scope**: 5 SKILL.md files + reference directories (structured-logging, log-categorization, pii-redaction, sentry-integration, testing-observability)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                         | Status | Notes                                                                     |
| --------------------------------- | ------ | ------------------------------------------------------------------------- |
| I. Test-First Development         | PASS   | Testing skill (User Story 6) includes TDD patterns for observability code |
| II. Type Safety                   | PASS   | All code examples use strict TypeScript with explicit return types        |
| III. Code Quality Standards       | PASS   | JSDoc in examples, consistent naming conventions                          |
| IV. Pre-commit Quality Gates      | N/A    | Skills are documentation, not executable code                             |
| V. Warning/Deprecation Policy     | PASS   | No deprecated patterns in skills                                          |
| VI. Cloudflare Workers Target     | PASS   | All patterns designed for Workers runtime (AsyncLocalStorage, console)    |
| VII. Simplicity & Maintainability | PASS   | Progressive disclosure via references keeps skills simple                 |

**Gate Status: PASS** - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/003-logging-tracing-skills/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (skills structure)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (file templates)
└── tasks.md             # Phase 2 output (via /sp:06-tasks)
```

### Source Code (repository root)

```text
.claude/skills/
├── structured-logging/
│   ├── SKILL.md                     # Main decision-tree (<150 lines)
│   └── references/
│       ├── safe-logger.md           # SafeLogger class, redaction integration
│       ├── context-management.md    # AsyncLocalStorage, request correlation
│       ├── base-fields.md           # BaseLogFields, schema requirements
│       └── logger-factory.md        # Factory patterns, environment config
│
├── log-categorization/
│   ├── SKILL.md                     # Decision-tree for categorization
│   └── references/
│       ├── decision-matrix.md       # When to use each category
│       ├── domain-logging.md        # Domain events, aggregate logging
│       ├── application-logging.md   # Request flow, use case patterns
│       └── infrastructure-logging.md # Repository, external system patterns
│
├── pii-redaction/
│   ├── SKILL.md                     # Redaction decision-tree
│   └── references/
│       ├── sensitive-patterns.md    # SENSITIVE_PATTERNS regex catalog
│       ├── field-detection.md       # REDACT_FIELDS, MASK_FIELDS sets
│       ├── redaction-functions.md   # redactValue, redactObject, redactString
│       └── url-sanitization.md      # redactUrl, query param handling
│
├── sentry-integration/
│   ├── SKILL.md                     # Sentry integration guide
│   └── references/
│       ├── withsentry-setup.md      # Initial configuration, sampling
│       ├── context-management.md    # setUser, setTag, setContext patterns
│       ├── breadcrumbs.md           # addBreadcrumb, categories
│       └── error-capture.md         # captureException with context
│
└── testing-observability/
    ├── SKILL.md                     # Testing decision-tree
    └── references/
        ├── logger-unit-tests.md     # console.log spy patterns
        ├── redaction-tests.md       # Pattern validation test cases
        └── miniflare-integration.md # Workers integration testing
```

**Structure Decision**: Five separate skill directories under `.claude/skills/` following existing patterns (e.g., `typescript-unit-testing`, `cloudflare-observability`). Each skill has SKILL.md providing decision-tree navigation and reference files providing implementation depth. This structure supports progressive disclosure and allows developers to invoke only the skills relevant to their current task.

## Complexity Tracking

No constitution violations to justify. The five-skill approach (vs single monolithic skill) is warranted because:

- Each skill corresponds to a distinct developer concern (setup, categorization, redaction, Sentry, testing)
- Separate skills enable targeted invocation (developer only loads what they need)
- Follows progressive disclosure principle (simple decision-tree SKILL.md → detailed references)
- Aligns with existing skill patterns in the codebase

## Post-Design Constitution Re-Check

| Principle          | Status | Post-Design Notes                                                                |
| ------------------ | ------ | -------------------------------------------------------------------------------- |
| I. Test-First      | PASS   | testing-observability skill covers TDD for logging code                          |
| II. Type Safety    | PASS   | Contract templates require explicit types, no `any`                              |
| III. Code Quality  | PASS   | Templates include JSDoc requirements                                             |
| IV. Pre-commit     | N/A    | Documentation only                                                               |
| V. Warnings        | PASS   | Guide source (docs/logging-tracing-guide.md) uses current APIs                   |
| VI. Workers Target | PASS   | All patterns verified Workers-compatible (AsyncLocalStorage, @sentry/cloudflare) |
| VII. Simplicity    | PASS   | 5 skills × ~4 references = 25 files total, clear progressive disclosure          |

**Post-Design Gate Status: PASS**

## Generated Artifacts

| Artifact              | Path                                                             | Purpose                          |
| --------------------- | ---------------------------------------------------------------- | -------------------------------- |
| research.md           | specs/003-logging-tracing-skills/research.md                     | Skill structure decisions        |
| data-model.md         | specs/003-logging-tracing-skills/data-model.md                   | File structure and relationships |
| quickstart.md         | specs/003-logging-tracing-skills/quickstart.md                   | Implementation sequence guide    |
| skill-template.md     | specs/003-logging-tracing-skills/contracts/skill-template.md     | SKILL.md template                |
| reference-template.md | specs/003-logging-tracing-skills/contracts/reference-template.md | Reference file template          |

## Next Steps

Run `/sp:06-tasks` to generate implementation tasks from this plan.
