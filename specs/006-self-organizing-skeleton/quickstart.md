# Quickstart: Self-Organizing Seed Repository Skeleton

**Feature**: 006-self-organizing-skeleton
**Date**: 2026-01-15

## Overview

This guide explains how to implement the self-organizing skeleton for the seed repository.

## Prerequisites

- Git repository initialized
- Access to `.claude/skills/` directory
- `docs/ddd-clean-code-guide.md` available

## Implementation Steps

### Step 1: Create Directory Structure

Create all directories under `src/`:

```bash
# Domain layer
mkdir -p src/domain/{entities,value-objects,services,interfaces}

# Application layer
mkdir -p src/application/{use-cases,services,dto}

# Infrastructure layer
mkdir -p src/infrastructure/{repositories,cache,services}

# Presentation layer
mkdir -p src/presentation/{handlers,middleware,utils}
mkdir -p src/presentation/templates/{layouts,pages,partials}

# Tests
mkdir -p tests/{fixtures,helpers}

# Migrations and public
mkdir -p migrations
mkdir -p public/{css,js}
```

### Step 2: Add .gitkeep Files

Add `.gitkeep` to preserve empty directories:

```bash
# Find all empty directories and add .gitkeep
find src tests migrations public -type d -empty -exec touch {}/.gitkeep \;
```

### Step 3: Create Layer CLAUDE.md Files

Create the four layer-level CLAUDE.md files:

1. `src/domain/CLAUDE.md`
2. `src/application/CLAUDE.md`
3. `src/infrastructure/CLAUDE.md`
4. `src/presentation/CLAUDE.md`

Use templates from `contracts/skeleton-structure.md`.

### Step 4: Create Subdirectory CLAUDE.md Files

Create CLAUDE.md for each subdirectory (22 files total):

**Domain subdirectories:**

- `src/domain/entities/CLAUDE.md`
- `src/domain/value-objects/CLAUDE.md`
- `src/domain/services/CLAUDE.md`
- `src/domain/interfaces/CLAUDE.md`

**Application subdirectories:**

- `src/application/use-cases/CLAUDE.md`
- `src/application/services/CLAUDE.md`
- `src/application/dto/CLAUDE.md`

**Infrastructure subdirectories:**

- `src/infrastructure/repositories/CLAUDE.md`
- `src/infrastructure/cache/CLAUDE.md`
- `src/infrastructure/services/CLAUDE.md`

**Presentation subdirectories:**

- `src/presentation/handlers/CLAUDE.md`
- `src/presentation/templates/CLAUDE.md`
- `src/presentation/templates/layouts/CLAUDE.md`
- `src/presentation/templates/pages/CLAUDE.md`
- `src/presentation/templates/partials/CLAUDE.md`
- `src/presentation/middleware/CLAUDE.md`
- `src/presentation/utils/CLAUDE.md`

**Other directories:**

- `tests/CLAUDE.md`
- `tests/fixtures/CLAUDE.md`
- `tests/helpers/CLAUDE.md`
- `migrations/CLAUDE.md`
- `public/CLAUDE.md`

### Step 5: Verify Skills Alignment

All skills have been audited and align with the skeleton. No modifications required.

If future skills are added, verify they reference paths consistent with this skeleton.

### Step 6: Validate Token Budget

Count lines in all CLAUDE.md files:

```bash
find src tests migrations public -name "CLAUDE.md" -exec wc -l {} \; | awk '{sum += $1} END {print "Total lines:", sum}'
```

**Target**: Under 2,000 total lines (approximately 4,000-5,000 tokens)

### Step 7: Commit Structure

```bash
git add src/ tests/ migrations/ public/
git commit -m "feat: add self-organizing skeleton with CLAUDE.md guidance"
```

## Verification Checklist

- [ ] 28 directories created
- [ ] 26 CLAUDE.md files created
- [ ] All empty directories have .gitkeep
- [ ] Layer CLAUDE.md files under 100 lines each
- [ ] Subdirectory CLAUDE.md files under 50 lines each
- [ ] Total token budget under 5,000
- [ ] All skill references valid

## Directory Summary

| Path                                 | CLAUDE.md   | Purpose                     |
| ------------------------------------ | ----------- | --------------------------- |
| src/domain/                          | Yes (layer) | Core business logic         |
| src/domain/entities/                 | Yes         | Identity-based objects      |
| src/domain/value-objects/            | Yes         | Immutable attribute objects |
| src/domain/services/                 | Yes         | Stateless domain logic      |
| src/domain/interfaces/               | Yes         | Repository/service ports    |
| src/application/                     | Yes (layer) | Use case orchestration      |
| src/application/use-cases/           | Yes         | Single-operation classes    |
| src/application/services/            | Yes         | Cross-cutting services      |
| src/application/dto/                 | Yes         | Data transfer objects       |
| src/infrastructure/                  | Yes (layer) | External adapters           |
| src/infrastructure/repositories/     | Yes         | D1/KV implementations       |
| src/infrastructure/cache/            | Yes         | Session/query caches        |
| src/infrastructure/services/         | Yes         | Third-party integrations    |
| src/presentation/                    | Yes (layer) | HTTP handling               |
| src/presentation/handlers/           | Yes         | Request handlers            |
| src/presentation/templates/          | Yes         | HTML templates              |
| src/presentation/templates/layouts/  | Yes         | Page wrappers               |
| src/presentation/templates/pages/    | Yes         | Full pages                  |
| src/presentation/templates/partials/ | Yes         | HTMX fragments              |
| src/presentation/middleware/         | Yes         | Auth/error wrappers         |
| src/presentation/utils/              | Yes         | Response helpers            |
| tests/                               | Yes         | Test infrastructure         |
| tests/fixtures/                      | Yes         | Test builders               |
| tests/helpers/                       | Yes         | Test utilities              |
| migrations/                          | Yes         | D1 migrations               |
| public/                              | Yes         | Static assets               |

## Next Steps

After skeleton creation:

1. Run `/sp:06-tasks` to generate implementation tasks
2. Begin implementing entities in `src/domain/entities/`
3. Add migrations as needed in `migrations/`
4. Build handlers in `src/presentation/handlers/`
