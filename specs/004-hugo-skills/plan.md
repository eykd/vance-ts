# Implementation Plan: Hugo Cloudflare Skills

**Branch**: `004-hugo-skills` | **Date**: 2026-01-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-hugo-skills/spec.md`

## Summary

Create 5 Claude Code skills providing progressive disclosure guidance for Hugo + Cloudflare Pages hybrid architecture. Skills follow existing patterns: SKILL.md decision tree (<150 lines) with 2-4 themed reference files. Skills cover Hugo Go templates, TypeScript HTML templates, project setup, static-first routing, and search indexing.

## Technical Context

**Language/Version**: Markdown documentation with TypeScript/Go template code examples
**Primary Dependencies**: Existing skills (htmx-pattern-library, worker-request-handler, tailwind-daisyui-design, d1-repository-implementation)
**Storage**: N/A (documentation files only)
**Testing**: Manual validation - SKILL.md <150 lines, code examples lint-clean
**Target Platform**: Claude Code skill system (.claude/skills/ directory)
**Project Type**: Documentation/skills (no compiled code)
**Performance Goals**: Token efficiency - SKILL.md loads fast, references load on demand
**Constraints**: SKILL.md <150 lines, reference files <300 lines, 2-4 references per skill
**Scale/Scope**: 5 skills, 10-20 reference files total

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Applies? | Status  | Notes                                                                                                 |
| ----------------------------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------- |
| I. Test-First Development           | Partial  | ✅ Pass | Skills are documentation, not compiled code. Code examples within skills should be testable patterns. |
| II. Type Safety                     | Partial  | ✅ Pass | TypeScript examples must use strict types, explicit returns, no `any`.                                |
| III. Code Quality Standards         | Yes      | ✅ Pass | JSDoc in code examples, proper naming conventions.                                                    |
| IV. Pre-commit Quality Gates        | Yes      | ✅ Pass | Markdown linting, spell check on skill files.                                                         |
| V. Warning and Deprecation Policy   | N/A      | ✅ Pass | Documentation only.                                                                                   |
| VI. Cloudflare Workers Target       | Yes      | ✅ Pass | All code examples target Workers runtime.                                                             |
| VII. Simplicity and Maintainability | Yes      | ✅ Pass | Progressive disclosure, clear decision trees, no over-abstraction.                                    |

**Gate Status**: ✅ PASSED - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/004-hugo-skills/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (skill structure definition)
├── quickstart.md        # Phase 1 output (skill authoring guide)
├── contracts/           # Phase 1 output (skill interface contracts)
│   └── skill-schema.md  # YAML frontmatter and structure requirements
└── tasks.md             # Phase 2 output (NOT created by /sp:04-plan)
```

### Source Code (repository root)

```text
.claude/skills/
├── hugo-templates/
│   ├── SKILL.md                    # Decision tree for Hugo Go templates
│   └── references/
│       ├── layouts-partials.md     # Layouts, partials, baseof patterns
│       ├── shortcodes.md           # Shortcode patterns with HTMX/Alpine
│       └── htmx-integration.md     # HTMX attributes in Hugo templates
│
├── typescript-html-templates/
│   ├── SKILL.md                    # Decision tree for TS HTML functions
│   └── references/
│       ├── template-functions.md   # HTML string functions, escaping
│       ├── response-patterns.md    # HX-Trigger headers, status codes
│       └── error-responses.md      # Error HTML with DaisyUI alerts
│
├── hugo-project-setup/
│   ├── SKILL.md                    # Decision tree for project scaffolding
│   └── references/
│       ├── directory-structure.md  # hugo/, functions/, src/ layout
│       ├── configuration.md        # hugo.toml, wrangler.toml, package.json
│       └── build-pipeline.md       # npm scripts, TailwindCSS build
│
├── static-first-routing/
│   ├── SKILL.md                    # Decision tree for routing concepts
│   └── references/
│       ├── request-flow.md         # CDN vs function routing diagram
│       └── path-conventions.md     # /app/_/* namespace, conflict resolution
│
└── hugo-search-indexing/
    ├── SKILL.md                    # Decision tree for search index build
    └── references/
        ├── build-script.md         # gray-matter parsing, JSON output
        └── d1-population.md        # Populating search_index table
```

**Structure Decision**: Skills follow existing pattern - SKILL.md at root with references/ subdirectory. 2-4 reference files per skill grouped by theme. Total: 5 SKILL.md files + 13 reference files.

## Complexity Tracking

> No violations requiring justification. Structure follows existing skill patterns exactly.
