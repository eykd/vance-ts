# Implementation Plan: Self-Organizing Seed Repository Skeleton

**Branch**: `006-self-organizing-skeleton` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-self-organizing-skeleton/spec.md`

## Summary

Create a self-organizing seed repository with complete DDD/Clean Architecture directory skeleton, distributed CLAUDE.md files at layer and subdirectory levels, and Claude Skills path alignment verification. This enables developers to receive contextual architectural guidance automatically when working in any directory.

## Technical Context

**Language/Version**: Markdown, shell scripts (no application code)
**Primary Dependencies**: None (skeleton structure only, no runtime deps)
**Storage**: N/A (file system structure only)
**Testing**: Manual verification via directory existence checks
**Target Platform**: Any OS with git support
**Project Type**: Repository scaffold/template
**Performance Goals**: N/A (static files)
**Constraints**: Total CLAUDE.md token overhead < 5,000 tokens; layer files < 100 lines; subdirectory files < 50 lines
**Scale/Scope**: 28 directories total, 26 CLAUDE.md files, 15 Claude Skills with path references verified

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                 | Applies | Status | Notes                                                                           |
| ----------------------------------------- | ------- | ------ | ------------------------------------------------------------------------------- |
| I. Test-First Development                 | NO      | N/A    | No application code being written; skeleton is verified via acceptance criteria |
| II. Type Safety and Static Analysis       | NO      | N/A    | No TypeScript code in deliverables                                              |
| III. Code Quality Standards               | PARTIAL | PASS   | CLAUDE.md files follow consistent structure and naming                          |
| IV. Pre-commit Quality Gates              | YES     | PASS   | Commits will pass lint-staged (markdown files)                                  |
| V. Warning and Deprecation Policy         | YES     | PASS   | Will verify no deprecations in referenced skills                                |
| VI. Cloudflare Workers Target Environment | NO      | N/A    | Skeleton structure, not runtime code                                            |
| VII. Simplicity and Maintainability       | YES     | PASS   | Concise CLAUDE.md files, clear hierarchy, no speculation                        |

**Gate Status**: PASS - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/006-self-organizing-skeleton/
├── plan.md              # This file
├── research.md          # Phase 0: Skills audit, directory mapping
├── data-model.md        # Phase 1: Directory skeleton definition
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/           # Phase 1: CLAUDE.md templates per layer
│   └── skeleton-structure.md
└── tasks.md             # Phase 2 output (/sp:06-tasks command)
```

### Source Code (repository root)

```text
# Skeleton structure to be created (from DDD guide):
src/
├── domain/                    # Core business logic (no dependencies)
│   ├── entities/
│   ├── value-objects/
│   ├── services/
│   └── interfaces/
├── application/               # Use cases and orchestration
│   ├── use-cases/
│   ├── services/
│   └── dto/
├── infrastructure/            # External concerns (adapters)
│   ├── repositories/
│   ├── cache/
│   └── services/
├── presentation/              # HTTP layer
│   ├── handlers/
│   ├── templates/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── partials/
│   ├── middleware/
│   └── utils/
├── index.ts                   # Worker entry point (placeholder)
└── router.ts                  # Route definitions (placeholder)

tests/
├── fixtures/
└── helpers/

migrations/
└── .gitkeep

public/
├── css/
└── js/
```

**Structure Decision**: DDD/Clean Architecture layout as prescribed in `docs/ddd-clean-code-guide.md`. The skeleton creates empty directories with `.gitkeep` files and CLAUDE.md guidance files at each layer and subdirectory.

## Complexity Tracking

> No Constitution Check violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| (none)    | -          | -                                    |

---

## Post-Design Constitution Re-Check

_Re-evaluated after Phase 1 design completion._

| Principle                           | Status | Notes                                                                 |
| ----------------------------------- | ------ | --------------------------------------------------------------------- |
| III. Code Quality Standards         | PASS   | 26 CLAUDE.md files follow consistent templates from contracts/        |
| IV. Pre-commit Quality Gates        | PASS   | Markdown files pass lint-staged                                       |
| V. Warning and Deprecation Policy   | PASS   | All 15 path-referencing skills verified aligned                       |
| VII. Simplicity and Maintainability | PASS   | Layer files < 100 lines, subdirectory < 50 lines, ~3,900 tokens total |

**Final Gate Status**: PASS

---

## Generated Artifacts

| Artifact   | Path                                                                 | Status   |
| ---------- | -------------------------------------------------------------------- | -------- |
| Research   | [research.md](./research.md)                                         | Complete |
| Data Model | [data-model.md](./data-model.md)                                     | Complete |
| Contracts  | [contracts/skeleton-structure.md](./contracts/skeleton-structure.md) | Complete |
| Quickstart | [quickstart.md](./quickstart.md)                                     | Complete |
| Tasks      | [tasks.md](./tasks.md)                                               | Complete |

## Next Steps

Run `/sp:07-implement` to execute the implementation tasks.
