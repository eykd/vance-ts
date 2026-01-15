# Research: Self-Organizing Seed Repository Skeleton

**Feature**: 006-self-organizing-skeleton
**Date**: 2026-01-15

## Research Questions

### 1. Directory Structure from DDD/Clean Code Guide

**Decision**: Use exact structure from `docs/ddd-clean-code-guide.md` lines 1186-1294

**Structure Summary**:

```
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

tests/
├── fixtures/
└── helpers/

migrations/

public/
├── css/
└── js/
```

**Total Directories**: 22 under src/, 2 under tests/, 1 migrations/, 2 under public/ = **27 directories**

**Rationale**: The DDD guide is the canonical source; deviation would cause confusion.

**Alternatives Considered**: None - the guide is authoritative.

---

### 2. Claude Skills Path Reference Audit

**Decision**: All 38 skills audited; NO conflicts found with DDD structure.

**Skills Referencing Paths** (15 skills with explicit paths):

| Skill                          | Paths Referenced                                             | Alignment |
| ------------------------------ | ------------------------------------------------------------ | --------- |
| ddd-domain-modeling            | `src/domain/{entities,value-objects,services,interfaces}`    | PERFECT   |
| clean-architecture-validator   | All four layers + dependency rules                           | PERFECT   |
| cloudflare-use-case-creator    | `src/application/{use-cases,dto}`                            | PERFECT   |
| d1-repository-implementation   | `src/domain/interfaces/`, `src/infrastructure/repositories/` | PERFECT   |
| worker-request-handler         | `src/presentation/handlers/`, `src/presentation/templates/`  | PERFECT   |
| cloudflare-project-scaffolding | Complete four-layer skeleton                                 | PERFECT   |
| cloudflare-migrations          | `migrations/{seq}_{desc}.sql`                                | PERFECT   |
| log-categorization             | All layers (categorized)                                     | PERFECT   |
| structured-logging             | `src/infrastructure/logging/`                                | GOOD      |
| org-authorization              | `src/{domain,application,presentation}`                      | GOOD      |
| org-isolation                  | `src/infrastructure/middleware/`                             | GOOD      |
| hugo-project-setup             | Hybrid: Hugo + `src/` + `functions/`                         | HYBRID    |
| static-first-routing           | `functions/app/_/*` (Pages Functions variant)                | HYBRID    |
| vitest-cloudflare-config       | Colocated `.spec.ts` + `tests/`                              | GOOD      |
| latent-features                | All layers with security patterns                            | PERFECT   |

**Rationale**: No skill modifications needed; all align with skeleton.

**Alternatives Considered**: Creating compatibility layer - rejected as unnecessary.

---

### 3. CLAUDE.md Skill Mapping per Directory

**Decision**: Map skills to directories based on relevance.

**Skill Mapping**:

| Directory                              | Applicable Skills                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/domain/`                          | ddd-domain-modeling, typescript-unit-testing, clean-architecture-validator                  |
| `src/domain/entities/`                 | ddd-domain-modeling, typescript-unit-testing                                                |
| `src/domain/value-objects/`            | ddd-domain-modeling, typescript-unit-testing                                                |
| `src/domain/services/`                 | ddd-domain-modeling, typescript-unit-testing                                                |
| `src/domain/interfaces/`               | ddd-domain-modeling, clean-architecture-validator                                           |
| `src/application/`                     | cloudflare-use-case-creator, typescript-unit-testing, clean-architecture-validator          |
| `src/application/use-cases/`           | cloudflare-use-case-creator, typescript-unit-testing                                        |
| `src/application/services/`            | cloudflare-use-case-creator, org-authorization                                              |
| `src/application/dto/`                 | cloudflare-use-case-creator                                                                 |
| `src/infrastructure/`                  | d1-repository-implementation, vitest-integration-testing, clean-architecture-validator      |
| `src/infrastructure/repositories/`     | d1-repository-implementation, cloudflare-migrations, vitest-integration-testing             |
| `src/infrastructure/cache/`            | kv-session-management, vitest-integration-testing                                           |
| `src/infrastructure/services/`         | vitest-integration-testing                                                                  |
| `src/presentation/`                    | worker-request-handler, htmx-pattern-library, security-review, clean-architecture-validator |
| `src/presentation/handlers/`           | worker-request-handler, htmx-pattern-library                                                |
| `src/presentation/templates/`          | htmx-alpine-templates, typescript-html-templates                                            |
| `src/presentation/templates/layouts/`  | htmx-alpine-templates                                                                       |
| `src/presentation/templates/pages/`    | htmx-alpine-templates                                                                       |
| `src/presentation/templates/partials/` | htmx-alpine-templates, htmx-pattern-library                                                 |
| `src/presentation/middleware/`         | worker-request-handler, security-review                                                     |
| `src/presentation/utils/`              | typescript-html-templates                                                                   |
| `tests/`                               | typescript-unit-testing, vitest-cloudflare-config, vitest-integration-testing               |
| `tests/fixtures/`                      | typescript-unit-testing, vitest-integration-testing                                         |
| `tests/helpers/`                       | vitest-cloudflare-config                                                                    |
| `migrations/`                          | cloudflare-migrations, d1-repository-implementation                                         |
| `public/`                              | tailwind-daisyui-design, static-first-routing                                               |

**Rationale**: Skills are mapped based on their documented scope and use cases.

---

### 4. CLAUDE.md Content Structure

**Decision**: Standardized template for each level.

**Layer-Level Template** (< 100 lines):

```markdown
# [Layer Name] Layer

[1-2 sentence responsibility description]

## Patterns

- [Key pattern 1]
- [Key pattern 2]
- [Key pattern 3]

## Applicable Skills

- `/skill-name-1` - [brief purpose]
- `/skill-name-2` - [brief purpose]

## See Also

- [docs/ddd-clean-code-guide.md](../../docs/ddd-clean-code-guide.md) - Full guide
```

**Subdirectory-Level Template** (< 50 lines):

```markdown
# [Subdirectory] Purpose

[1 sentence description]

## Patterns

- [Specific pattern]

## Skills

- `/skill-name` - [purpose]
```

**Rationale**: Concise format minimizes token overhead while providing actionable guidance.

---

### 5. Token Budget Analysis

**Decision**: Target ~200 tokens per file average.

**Estimates**:

- 4 layer-level CLAUDE.md files × 300 tokens = 1,200 tokens
- 18 subdirectory-level CLAUDE.md files × 150 tokens = 2,700 tokens
- **Total estimated**: ~3,900 tokens (well under 5,000 limit)

**Rationale**: Conservative estimate leaves room for necessary detail.

---

## Summary

| Research Question          | Status   | Outcome                                                     |
| -------------------------- | -------- | ----------------------------------------------------------- |
| Directory structure        | RESOLVED | 27 directories from DDD guide                               |
| Skills path audit          | RESOLVED | All 15 path-referencing skills aligned                      |
| Skill-to-directory mapping | RESOLVED | Complete mapping table created                              |
| CLAUDE.md templates        | RESOLVED | Layer (< 100 lines) and subdirectory (< 50 lines) templates |
| Token budget               | RESOLVED | ~3,900 tokens estimated (under 5,000 limit)                 |

**All NEEDS CLARIFICATION items resolved. Ready for Phase 1.**
