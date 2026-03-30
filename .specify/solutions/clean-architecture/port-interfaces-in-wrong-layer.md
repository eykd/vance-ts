# Port Interfaces Consistently Defined in Application Layer

**Category**: clean-architecture
**Date**: 2026-03-30
**Feature**: 016-prestoplot-core (also 015-galaxy-seed-d1)
**Tags**: ports, dependency-inversion, layer-boundaries, recurring

## Problem

Architecture reviews repeatedly flag port interfaces (`*Port`, `*Repository`) defined in the application layer instead of the domain layer. This has occurred across multiple features:

- **galaxy-seed-d1**: `RouteRepository`, `StarSystemRepository`, `TradePairRepository` created in `src/application/ports/` — moved to domain post-review (commit `f3b44f1`)
- **prestoplot-core**: Duplicate `Rng` interface created in `src/application/prestoplot/RandomSource.ts` — consolidated to domain post-review (commit `1d6cca5`)
- **prestoplot-core**: `StoragePort`, `RandomPort`, `TemplateEnginePort` all created in `src/application/prestoplot/` — flagged by architecture review (tasks `turtlebased-s9rk.6.37–39`)

## Root Cause

During implementation, the developer (or AI assistant) naturally co-locates a port interface with the use case that depends on it. This feels intuitive — the use case "needs" the port, so it "owns" it. But in Clean Architecture, the domain layer owns persistence and service contracts because:

1. The domain defines _what_ capabilities it needs (the interface)
2. Infrastructure provides _how_ (the implementation)
3. Application orchestrates, but doesn't define contracts

The `domain/CLAUDE.md` already states this clearly: "Repository Interfaces: Ports defining persistence contracts—NO implementations here." But during rapid implementation, this rule is easy to overlook because:

- The application layer file is already open
- The port is being designed to serve a specific use case
- There's no compile-time enforcement — only ESLint boundary rules that check import direction, not interface placement

## Solution

Move port interfaces to the domain layer:

- Repository interfaces → `src/domain/interfaces/` or `src/domain/{feature}/`
- Service port interfaces → `src/domain/{feature}/` (e.g., `randomSource.ts`)
- Keep DTOs in application (they are application-layer concerns)
- Update all import paths in application, infrastructure, and DI layers

## Prevention

### During `/sp:03-plan` (Planning Phase)

When a feature introduces new external dependencies (storage, randomness, external services, etc.), the plan MUST explicitly list the port interfaces and place them in the domain layer. Add a checklist item:

- [ ] All new port/repository interfaces are planned for `src/domain/`, not `src/application/`

### During `/sp:07-implement` (Implementation Phase)

Before creating any `*Port` or `*Repository` interface file, verify the target directory is under `src/domain/`. If the interface references application-layer types (like DTOs), split: interface in domain, DTO-aware adapter in application.

### During Architecture Review

This is a known recurring issue — reviewers should specifically check for port interfaces defined outside `src/domain/`.

### Structural Guardrail (Recommended)

Consider adding an ESLint rule or custom lint script that flags any `interface` declaration ending in `Port` or `Repository` that lives outside `src/domain/`. This would catch the issue at pre-commit time rather than post-review.

## Related

- `src/domain/CLAUDE.md` line 14: "Repository Interfaces: Ports defining persistence contracts"
- Commit `f3b44f1`: galaxy repository interfaces moved to domain
- Commit `1d6cca5`: Rng interface consolidated to domain
