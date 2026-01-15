# Implementation Plan: Hugo Project Setup with TailwindCSS and DaisyUI

**Branch**: `007-hugo-project-setup` | **Date**: 2026-01-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-hugo-project-setup/spec.md`

## Summary

Create a fully configured Hugo installation in the `hugo/` subdirectory with TailwindCSS 4 and DaisyUI 5 integration. The setup includes base layouts, page templates (home, single, list, 404), SEO partials (Open Graph, Twitter Cards, schema.org, Google Analytics), and DaisyUI theme configuration. The Hugo project will be self-contained with its own `package.json` for portability.

## Technical Context

**Language/Version**: Hugo 0.147.8+, Go templates, CSS (TailwindCSS 4)
**Primary Dependencies**: TailwindCSS 4, DaisyUI 5, @tailwindcss/typography
**Storage**: N/A (static site generator)
**Testing**: Manual verification (Hugo builds, visual inspection)
**Target Platform**: Static HTML output, deployable to any static hosting (Cloudflare Pages, Netlify, Vercel)
**Project Type**: Static site generator setup (standalone Hugo project in subdirectory)
**Performance Goals**: Production CSS < 50KB, hot reload < 2 seconds, initial build < 30 seconds
**Constraints**: Hugo version requirement (0.147.8+ for css.TailwindCSS pipe), Node.js for npm dependencies
**Scale/Scope**: Single Hugo site setup with 4 layout templates, 10+ partials, 1 DaisyUI theme

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Notes |
| --------- | ------ | ----- |
| I. Test-First Development | N/A | Hugo templates are not TypeScript - no Jest tests applicable. Manual verification via Hugo build and visual inspection. |
| II. Type Safety and Static Analysis | N/A | Hugo templates use Go template syntax, not TypeScript. |
| III. Code Quality Standards | PASS | Will use consistent naming conventions, organized partial structure, JSDoc-style comments where applicable. |
| IV. Pre-commit Quality Gates | PARTIAL | Hugo files won't be linted by ESLint. Prettier can format HTML templates. |
| V. Warning and Deprecation Policy | PASS | Will address any Hugo deprecation warnings in configuration. |
| VI. Cloudflare Workers Target | N/A | Hugo generates static HTML - not Workers code. Output is static assets. |
| VII. Simplicity and Maintainability | PASS | Following exemplar patterns, no over-engineering. |

**Gate Status**: PASS - Constitution principles focused on TypeScript/Workers do not apply to Hugo static site setup. Applicable principles (III, V, VII) are satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/007-hugo-project-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A for static site)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
hugo/
├── hugo.yaml                    # Hugo configuration
├── package.json                 # TailwindCSS/DaisyUI dependencies
├── tailwind.config.js           # TailwindCSS configuration
├── assets/
│   └── css/
│       └── styles.css           # TailwindCSS entry point
├── config/
│   └── _default/
│       ├── params.yaml          # Site parameters
│       └── menus.yaml           # Navigation menus
├── content/
│   └── _index.md                # Homepage content
├── data/
│   └── home/                    # Homepage block data
├── layouts/
│   ├── baseof.html              # Base layout
│   ├── home.html                # Homepage layout
│   ├── single.html              # Single page layout
│   ├── list.html                # List/section layout
│   ├── 404.html                 # Error page layout
│   └── _partials/
│       ├── shared/
│       │   ├── header.html      # Site header
│       │   └── footer.html      # Site footer
│       ├── seo/
│       │   ├── opengraph.html   # Open Graph meta tags
│       │   ├── twitter_cards.html # Twitter Cards
│       │   ├── schema.html      # schema.org JSON-LD
│       │   └── google_analytics.html # GA integration
│       └── components/
│           └── button/          # Button partials
└── static/                      # Static assets (favicon, etc.)
```

**Structure Decision**: Hugo subdirectory follows standard Hugo conventions with layouts at root level (not in themes/), matching the exemplar project structure. SEO partials are organized under `_partials/seo/` for clarity.

## Complexity Tracking

No violations requiring justification. The setup follows Hugo conventions and the exemplar project patterns.
