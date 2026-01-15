# Data Model: Self-Organizing Seed Repository Skeleton

**Feature**: 006-self-organizing-skeleton
**Date**: 2026-01-15

## Entity: Directory Skeleton

The directory skeleton is the hierarchical file system structure that organizes code according to DDD/Clean Architecture principles.

### Directory Tree

```
project-root/
├── src/
│   ├── domain/                          # Layer 1: Core business logic
│   │   ├── CLAUDE.md                    # Layer guidance
│   │   ├── entities/
│   │   │   ├── CLAUDE.md                # Subdirectory guidance
│   │   │   └── .gitkeep
│   │   ├── value-objects/
│   │   │   ├── CLAUDE.md
│   │   │   └── .gitkeep
│   │   ├── services/
│   │   │   ├── CLAUDE.md
│   │   │   └── .gitkeep
│   │   └── interfaces/
│   │       ├── CLAUDE.md
│   │       └── .gitkeep
│   │
│   ├── application/                     # Layer 2: Use cases
│   │   ├── CLAUDE.md
│   │   ├── use-cases/
│   │   │   ├── CLAUDE.md
│   │   │   └── .gitkeep
│   │   ├── services/
│   │   │   ├── CLAUDE.md
│   │   │   └── .gitkeep
│   │   └── dto/
│   │       ├── CLAUDE.md
│   │       └── .gitkeep
│   │
│   ├── infrastructure/                  # Layer 3: External adapters
│   │   ├── CLAUDE.md
│   │   ├── repositories/
│   │   │   ├── CLAUDE.md
│   │   │   └── .gitkeep
│   │   ├── cache/
│   │   │   ├── CLAUDE.md
│   │   │   └── .gitkeep
│   │   └── services/
│   │       ├── CLAUDE.md
│   │       └── .gitkeep
│   │
│   └── presentation/                    # Layer 4: HTTP layer
│       ├── CLAUDE.md
│       ├── handlers/
│       │   ├── CLAUDE.md
│       │   └── .gitkeep
│       ├── templates/
│       │   ├── CLAUDE.md
│       │   ├── layouts/
│       │   │   ├── CLAUDE.md
│       │   │   └── .gitkeep
│       │   ├── pages/
│       │   │   ├── CLAUDE.md
│       │   │   └── .gitkeep
│       │   └── partials/
│       │       ├── CLAUDE.md
│       │       └── .gitkeep
│       ├── middleware/
│       │   ├── CLAUDE.md
│       │   └── .gitkeep
│       └── utils/
│           ├── CLAUDE.md
│           └── .gitkeep
│
├── tests/
│   ├── CLAUDE.md
│   ├── fixtures/
│   │   ├── CLAUDE.md
│   │   └── .gitkeep
│   └── helpers/
│       ├── CLAUDE.md
│       └── .gitkeep
│
├── migrations/
│   ├── CLAUDE.md
│   └── .gitkeep
│
└── public/
    ├── CLAUDE.md
    ├── css/
    │   └── .gitkeep
    └── js/
        └── .gitkeep
```

### Directory Count

| Category                             | Count                            |
| ------------------------------------ | -------------------------------- |
| Layer directories (src/)             | 4                                |
| Subdirectories under domain/         | 4                                |
| Subdirectories under application/    | 3                                |
| Subdirectories under infrastructure/ | 3                                |
| Subdirectories under presentation/   | 7 (including 3 under templates/) |
| **Total src/ directories**           | **21**                           |
| Test directories                     | 3                                |
| Migrations directory                 | 1                                |
| Public directories                   | 3                                |
| **Grand Total Directories**          | **28**                           |

### CLAUDE.md File Count

| Category                              | Count                                                 |
| ------------------------------------- | ----------------------------------------------------- |
| Layer-level CLAUDE.md                 | 4 (domain, application, infrastructure, presentation) |
| Domain subdirectory CLAUDE.md         | 4                                                     |
| Application subdirectory CLAUDE.md    | 3                                                     |
| Infrastructure subdirectory CLAUDE.md | 3                                                     |
| Presentation subdirectory CLAUDE.md   | 7                                                     |
| Tests CLAUDE.md                       | 3                                                     |
| Migrations CLAUDE.md                  | 1                                                     |
| Public CLAUDE.md                      | 1                                                     |
| **Total CLAUDE.md Files**             | **26**                                                |

---

## Entity: CLAUDE.md File

A CLAUDE.md file provides contextual guidance for Claude Code when working in a specific directory.

### Attributes

| Attribute                  | Layer-Level                  | Subdirectory-Level      |
| -------------------------- | ---------------------------- | ----------------------- |
| Max lines                  | 100                          | 50                      |
| Responsibility description | 1-2 sentences (< 50 words)   | 1 sentence (< 25 words) |
| Patterns section           | 3-5 patterns                 | 1-3 patterns            |
| Skills section             | 3-5 skills with descriptions | 1-3 skills              |
| See Also section           | Link to DDD guide            | Optional                |

### File Naming

- Always `CLAUDE.md` (uppercase, matches root convention)
- Located at directory root, not subdirectory

### Validation Rules

1. Line count MUST be under limit (100 for layer, 50 for subdirectory)
2. Skills referenced MUST exist in `.claude/skills/`
3. No duplicate content between parent and child CLAUDE.md files
4. Child CLAUDE.md takes precedence over parent for that directory

---

## Entity: Claude Skill

Existing skill definitions that may require path updates to align with skeleton.

### Skills Requiring Verification

All 15 skills with path references have been verified (see research.md). No modifications required.

### Skill-to-Directory Mapping

| Skill                        | Primary Directory                               |
| ---------------------------- | ----------------------------------------------- |
| ddd-domain-modeling          | src/domain/                                     |
| clean-architecture-validator | All layers                                      |
| cloudflare-use-case-creator  | src/application/use-cases/                      |
| d1-repository-implementation | src/infrastructure/repositories/                |
| worker-request-handler       | src/presentation/handlers/                      |
| cloudflare-migrations        | migrations/                                     |
| htmx-pattern-library         | src/presentation/handlers/, templates/partials/ |
| htmx-alpine-templates        | src/presentation/templates/                     |
| typescript-unit-testing      | All layers (colocated tests)                    |
| vitest-integration-testing   | src/infrastructure/, tests/                     |
| vitest-cloudflare-config     | tests/                                          |
| kv-session-management        | src/infrastructure/cache/                       |
| security-review              | src/presentation/middleware/, handlers/         |
| tailwind-daisyui-design      | public/                                         |
| typescript-html-templates    | src/presentation/templates/, utils/             |

---

## Relationships

```
Directory Skeleton
    │
    ├── contains ──► CLAUDE.md Files (1:many)
    │                    │
    │                    └── references ──► Claude Skills (many:many)
    │
    └── contains ──► .gitkeep Files (1:many, only in empty dirs)
```

---

## State Transitions

Not applicable - skeleton is static after creation.

---

## Constraints

1. **Token Budget**: Total tokens across all CLAUDE.md files < 5,000
2. **Line Limits**: Layer-level < 100 lines, subdirectory-level < 50 lines
3. **Skill Validity**: All skill references must resolve to existing skills
4. **No Circular References**: CLAUDE.md files do not reference each other
5. **Single Source of Truth**: Each directory has at most one CLAUDE.md file
