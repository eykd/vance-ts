# Implementation Plan: Static-First Routing Architecture

**Branch**: `001-static-first-routing` | **Date**: 2026-01-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-static-first-routing/spec.md`

## Summary

Adapt all documentation and Claude Code skills from a "dynamic-first" model (Worker serves /) to a "static-first" model (Pages serve /) where:

- Static HTML pages (marketing site) are served at root (/, /pricing, /about, /blog/\*)
- The Worker handles only /app/_, /auth/_, and /webhooks/\* routes
- HTMX partial endpoints use the /app/\_/ convention
- Clean break approach: remove all references to the old pattern, no migration guidance

## Technical Context

**Language/Version**: Markdown documentation, TypeScript code examples
**Primary Dependencies**: N/A (documentation update only)
**Storage**: N/A
**Testing**: Manual review for documentation accuracy
**Target Platform**: Claude Code skills (.claude/skills/), Documentation (docs/)
**Project Type**: Documentation/Skills update (no code implementation)
**Performance Goals**: N/A
**Constraints**: Clean break - no backward compatibility references
**Scale/Scope**: ~15-20 files across docs/ and .claude/skills/

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Status | Notes                                                   |
| ----------------------------------- | ------ | ------------------------------------------------------- |
| I. Test-First Development           | N/A    | Documentation update only - no code implementation      |
| II. Type Safety                     | N/A    | No code changes                                         |
| III. Code Quality Standards         | PASS   | Documentation updates follow existing style             |
| IV. Pre-commit Quality Gates        | PASS   | Will use conventional commits                           |
| V. Warning/Deprecation Policy       | PASS   | Clean break eliminates deprecated patterns              |
| VI. Cloudflare Workers Target       | PASS   | Documentation describes valid Workers patterns          |
| VII. Simplicity and Maintainability | PASS   | Simpler mental model (static default, explicit dynamic) |

**Gate Status**: PASS - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-static-first-routing/
├── plan.md              # This file
├── research.md          # Phase 0 output - affected files inventory
├── data-model.md        # Phase 1 output - routing model definition
├── quickstart.md        # Phase 1 output - verification guide
└── tasks.md             # Phase 2 output (via /sp:06-tasks)
```

### Affected Files (to be updated)

```text
docs/
├── cloudflare-interactive-webapp-guide.md  # PRIMARY - Main guide
├── cloudflare-webapp-security-guide.md     # Auth boundaries
├── secure-authentication-guide.md          # Auth middleware patterns
├── hugo-cloudflare-integration-guide.md    # SSG role
└── stripe-cloudflare-integration-guide.md  # Webhook routing

.claude/skills/
├── cloudflare-project-scaffolding/
│   ├── SKILL.md                            # Project structure
│   └── scripts/scaffold.py                 # Generated wrangler.toml
├── worker-request-handler/
│   ├── SKILL.md                            # Handler patterns
│   └── references/middleware.md            # Router examples
├── htmx-alpine-templates/
│   ├── SKILL.md                            # Template structure
│   └── references/htmx-patterns.md         # Endpoint patterns
├── htmx-pattern-library/
│   └── SKILL.md                            # Pattern quick reference
├── deploy-your-app/
│   └── SKILL.md                            # Deployment steps
└── latent-features/
    └── reference/secure-auth/              # Auth pattern files
```

**Structure Decision**: Documentation-only update affecting existing files. No new directories needed.

## Complexity Tracking

> No violations requiring justification. This is a documentation refactoring task following the KISS principle by establishing a simpler "static by default" mental model.
