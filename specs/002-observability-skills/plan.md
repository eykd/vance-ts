# Implementation Plan: Cloudflare Observability Skill

**Branch**: `002-observability-skills` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-observability-skills/spec.md`

## Summary

Create a single comprehensive `cloudflare-observability` Claude Code skill that guides developers in implementing SLO-driven observability for Cloudflare Workers. The skill uses a decision-tree structure in SKILL.md (<150 lines) with 6 detailed reference files covering: SLO tracking, request timing, error tracking, health endpoints, Analytics Engine integration, and observability-specific testing patterns.

## Technical Context

**Language/Version**: TypeScript (ES2022, NodeNext modules)
**Primary Dependencies**: Cloudflare Workers runtime, Analytics Engine, D1, KV
**Storage**: N/A (skill is documentation, not code)
**Testing**: Vitest with vitest-pool-workers (for code examples)
**Target Platform**: Cloudflare Workers V8 isolate environment
**Project Type**: Documentation (Claude Code skill with markdown files)
**Performance Goals**: SKILL.md under 150 lines for token efficiency
**Constraints**: All code examples must be Workers-compatible TypeScript
**Scale/Scope**: 1 SKILL.md + 6 reference files

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                         | Status | Notes                                                               |
| --------------------------------- | ------ | ------------------------------------------------------------------- |
| I. Test-First Development         | PASS   | Testing reference file includes TDD patterns for observability code |
| II. Type Safety                   | PASS   | All code examples use strict TypeScript with explicit return types  |
| III. Code Quality Standards       | PASS   | JSDoc in examples, consistent naming conventions                    |
| IV. Pre-commit Quality Gates      | N/A    | Skill is documentation, not executable code                         |
| V. Warning/Deprecation Policy     | PASS   | No deprecated patterns in guide                                     |
| VI. Cloudflare Workers Target     | PASS   | All patterns designed for Workers runtime                           |
| VII. Simplicity & Maintainability | PASS   | Progressive disclosure keeps SKILL.md simple                        |

**Gate Status: PASS** - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/002-observability-skills/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (skill structure)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (file templates)
└── tasks.md             # Phase 2 output (via /sp:06-tasks)
```

### Source Code (repository root)

```text
.claude/skills/cloudflare-observability/
├── SKILL.md                    # Decision-tree main file (<150 lines)
└── references/
    ├── slo-tracking.md         # SLI/SLO definitions, error budgets, burn rates
    ├── request-timing.md       # RequestTimer class, phase timing, Server-Timing
    ├── error-tracking.md       # ErrorTracker, categorization, SLO impact
    ├── health-endpoints.md     # Liveness/readiness/detailed, dependency checks
    ├── analytics-engine.md     # writeDataPoint, SQL queries, dashboards
    └── testing-observability.md # Testing patterns specific to observability code
```

**Structure Decision**: Single skill directory under `.claude/skills/` following existing patterns (e.g., `typescript-unit-testing`). SKILL.md provides decision-tree navigation, reference files provide implementation depth.

## Complexity Tracking

No constitution violations to justify. The single-skill approach is the simplest solution that meets all requirements.

## Post-Design Constitution Re-Check

| Principle          | Status | Post-Design Notes                                     |
| ------------------ | ------ | ----------------------------------------------------- |
| I. Test-First      | PASS   | testing-observability.md covers TDD for observability |
| II. Type Safety    | PASS   | Contract templates require explicit types, no `any`   |
| III. Code Quality  | PASS   | Templates include JSDoc requirements                  |
| IV. Pre-commit     | N/A    | Documentation only                                    |
| V. Warnings        | PASS   | Guide source uses current APIs                        |
| VI. Workers Target | PASS   | All patterns verified Workers-compatible              |
| VII. Simplicity    | PASS   | 7 files total, clear progressive disclosure           |

**Post-Design Gate Status: PASS**

## Generated Artifacts

| Artifact              | Path                                                           | Purpose                                  |
| --------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| research.md           | specs/002-observability-skills/research.md                     | Skill pattern decisions                  |
| data-model.md         | specs/002-observability-skills/data-model.md                   | File structure and content relationships |
| quickstart.md         | specs/002-observability-skills/quickstart.md                   | Implementation guide                     |
| skill-template.md     | specs/002-observability-skills/contracts/skill-template.md     | SKILL.md template                        |
| reference-template.md | specs/002-observability-skills/contracts/reference-template.md | Reference file template                  |

## Next Steps

Run `/sp:06-tasks` to generate implementation tasks.
