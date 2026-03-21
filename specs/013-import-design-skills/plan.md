# Implementation Plan: Import Impeccable Design Skills

**Branch**: `013-import-design-skills` | **Date**: 2026-03-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-import-design-skills/spec.md`

## Summary

Import and adapt 18 design skills from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0) into `.claude/skills/design-*/`, namespaced with `design-` prefix. Rename existing `frontend-design` to `design-interview` and expand it into a structured orchestrator. Import impeccable's `frontend-design` as `design-frontend`. Fold `teach-impeccable` context-gathering into `design-interview`. Adapt all imported skills to reference TailwindCSS 4, DaisyUI 5, Hugo, Alpine.js 3, and HTMX instead of generic/React patterns.

## Technical Context

**Language/Version**: Markdown (skill definition files) — no application code
**Primary Dependencies**: Claude Code skill system (`.claude/skills/*/SKILL.md`)
**Storage**: N/A (file-based skill definitions only)
**Testing**: Manual invocation verification; acceptance specs for content validation
**Target Platform**: Claude Code CLI skill loader
**Project Type**: Content/configuration — no `src/` changes
**Performance Goals**: N/A
**Constraints**: Apache 2.0 license compliance; no React/Vue/generic framework references in output
**Scale/Scope**: 18 imported skills + 1 renamed/expanded skill + 7 reference documents + NOTICE file

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Status   | Notes                                                                                                                                                                            |
| ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Test-First Development       | **PASS** | No application code — skill files are markdown. Acceptance specs validate content (SC-001: zero React references). Hugo build tests unaffected.                                  |
| II. Type Safety                 | **N/A**  | No TypeScript code introduced.                                                                                                                                                   |
| III. Code Quality Standards     | **PASS** | Skill files follow existing SKILL.md conventions with JSDoc-equivalent YAML frontmatter.                                                                                         |
| IV. Pre-commit Quality Gates    | **PASS** | Markdown files pass prettier/lint. No TypeScript changes to type-check.                                                                                                          |
| V. Warning/Deprecation Policy   | **PASS** | No new dependencies or deprecation concerns.                                                                                                                                     |
| VI. Cloudflare Workers Target   | **N/A**  | No runtime code.                                                                                                                                                                 |
| VII. Simplicity/Maintainability | **PASS** | Skills are self-contained markdown files. No abstractions or indirections. YAGNI satisfied — only importing skills with documented relevance to the Hugo/Tailwind/DaisyUI stack. |

**Gate result: PASS** — No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/013-import-design-skills/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (skill inventory)
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (skill interface contracts)
```

### Source Code (repository root)

```text
.claude/skills/
├── NOTICE                          # NEW: Apache 2.0 attribution
├── design-interview/               # RENAMED from frontend-design + teach-impeccable folded in
│   ├── SKILL.md                    # Expanded orchestrator with phase routing
│   └── references/                 # Existing refs preserved + new refs
├── design-frontend/                # NEW: imported from impeccable's frontend-design
│   ├── SKILL.md                    # Aesthetic guidelines, AI Slop Test, sub-skill index
│   └── references/                 # 7 reference docs from impeccable
│       ├── color-and-contrast.md
│       ├── interaction-design.md
│       ├── motion-design.md
│       ├── responsive-design.md
│       ├── spatial-design.md
│       ├── typography.md
│       └── ux-writing.md
├── design-polish/SKILL.md          # NEW: final quality pass
├── design-arrange/SKILL.md         # NEW: layout, spacing, rhythm
├── design-colorize/SKILL.md        # NEW: strategic color
├── design-typeset/SKILL.md         # NEW: typography refinement
├── design-animate/SKILL.md         # NEW: motion design
├── design-delight/SKILL.md         # NEW: personality, joy
├── design-critique/SKILL.md        # NEW: UX evaluation
├── design-audit/SKILL.md           # NEW: comprehensive quality audit
├── design-clarify/SKILL.md         # NEW: UX copy, microcopy
├── design-bolder/SKILL.md          # NEW: amplify safe designs
├── design-quieter/SKILL.md         # NEW: tone down aggressive designs
├── design-harden/SKILL.md          # NEW: production resilience
├── design-adapt/SKILL.md           # NEW: responsive/cross-device
├── design-normalize/SKILL.md       # NEW: design system alignment
├── design-onboard/SKILL.md         # NEW: onboarding flows
├── design-overdrive/SKILL.md       # NEW: technically ambitious
└── design-distill/SKILL.md         # NEW: ruthless simplification
```

**Structure Decision**: Content-only feature. All changes are in `.claude/skills/` — new skill directories with SKILL.md files and optional references/ subdirectories. No `src/`, `hugo/`, or `tests/` changes.

## Implementation Strategy

### Phase A: License & Attribution

1. Create `.claude/skills/NOTICE` with Apache 2.0 attribution
2. Define the standard file header for all imported skills

### Phase B: Rename & Expand `frontend-design` → `design-interview`

1. Rename `.claude/skills/frontend-design/` → `.claude/skills/design-interview/`
2. Fold `teach-impeccable` UX context-gathering questions into the interview phase
3. Expand into structured orchestrator with 7 phases (FR-010):
   - Interview → Theme → Components → Implement → Refine → Review → Harden
4. Add templated prompts for each phase transition (FR-011)
5. Update cross-references in other skills that mention `frontend-design`

### Phase C: Import `design-frontend` (impeccable's orchestrator hub)

1. Import impeccable's `frontend-design` as `design-frontend`
2. Adapt to reference project stack (DaisyUI 5, TailwindCSS 4, Hugo, Alpine.js)
3. Import and adapt 7 reference documents
4. Replace template placeholders (`{{model}}` → Claude, etc.)
5. Update cross-references to point to `design-interview` instead of `teach-impeccable`

### Phase D: Import 16 Standalone Design Skills

Import each skill with these adaptations:

1. Add Apache 2.0 header with modification notice
2. Replace React/Vue/generic references → Hugo/Alpine.js/HTMX equivalents
3. Replace `{{model}}`, `{{config_file}}`, etc. with Claude-specific values
4. Update "Mandatory Preparation" blocks to reference `design-frontend` and `design-interview`
5. Add cross-references to existing project skills where domains overlap
6. Ensure DaisyUI 5 components and Tailwind CSS 4 utilities are referenced

### Phase E: Integration & Cross-References

1. Add cross-references from existing skills to new `design-*` skills
2. Verify no contradictory guidance between old and new skills
3. Update skill descriptions for discoverability

### Adaptation Matrix

| Impeccable Reference           | Project Equivalent                         |
| ------------------------------ | ------------------------------------------ |
| React components               | Hugo partials + Alpine.js components       |
| CSS-in-JS / styled-components  | TailwindCSS 4 utility classes              |
| Design tokens (generic)        | DaisyUI 5 OKLCH theme variables            |
| Component library (generic)    | DaisyUI 5 components                       |
| State management (React)       | Alpine.js `x-data` / HTMX `hx-*`           |
| Client-side routing            | Hugo page routing + HTMX partial swaps     |
| `{{model}}` placeholder        | "Claude"                                   |
| `{{config_file}}` placeholder  | "CLAUDE.md"                                |
| `.impeccable.md`               | `.claude/skills/design-interview/` context |
| `teach-impeccable`             | `design-interview`                         |
| `frontend-design` (impeccable) | `design-frontend`                          |

### Overlap Resolution

| Imported Skill     | Existing Skill                                        | Resolution                                                                                                                                                                               |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `design-colorize`  | `daisyui-design-system-generator`                     | design-colorize provides _strategy_ (when/where to add color); existing skill generates _themes_ (OKLCH values). Complementary. design-colorize defers to existing for theme generation. |
| `design-colorize`  | `tailwind-daisyui-design` (color-usage.md)            | design-colorize adds color strategy layer; existing provides semantic application patterns. Cross-reference both.                                                                        |
| `design-typeset`   | `tailwind-daisyui-design` (typography-readability.md) | design-typeset provides font selection and hierarchy strategy; existing provides Tailwind prose classes and readability rules. Cross-reference both.                                     |
| `design-audit`     | `tailwind-daisyui-design` (form-accessibility.md)     | design-audit is broader (all a11y); existing is form-specific. Complementary.                                                                                                            |
| `design-frontend`  | `design-interview`                                    | design-frontend is the reference hub (guidelines, anti-patterns); design-interview is the workflow orchestrator (routes users through phases). Distinct responsibilities.                |
| `design-adapt`     | `htmx-alpine-templates`                               | design-adapt covers responsive strategy; existing provides implementation templates. Complementary.                                                                                      |
| `design-normalize` | `daisyui-design-system-generator`                     | design-normalize aligns existing UI to a system; existing generates the system. Sequential.                                                                                              |
| `design-clarify`   | `hugo-copywriting`                                    | design-clarify handles UX microcopy (labels, errors); copywriting handles long-form content. Different scope.                                                                            |
