# Research: Import Impeccable Design Skills

**Branch**: `013-import-design-skills` | **Date**: 2026-03-21

## R1: Source Repository Structure

**Decision**: Import from `pbakaus/impeccable` using `source/skills/` as canonical source (has template placeholders that we'll resolve during adaptation).

**Rationale**: The `source/skills/` directory contains the provider-agnostic versions with `{{model}}`, `{{config_file}}`, and `{{ask_instruction}}` placeholders. These are cleaner to adapt than the pre-compiled `.claude/skills/` versions, which may have Claude-specific assumptions baked in that differ from our project conventions.

**Alternatives considered**:

- Import from `.claude/skills/` directly — rejected because those are build outputs with hardcoded values that may not match our conventions.
- Fork and maintain upstream sync — rejected per spec (one-time import, no ongoing sync).

## R2: Skill Selection (18 of 21)

**Decision**: Import 18 skills, exclude 3.

**Rationale**: Each excluded skill has a clear reason:

| Excluded           | Reason                                                                                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `teach-impeccable` | Functionality folded into `design-interview` (renamed `frontend-design`). Context-gathering questions are valuable but belong in the orchestrator, not a standalone skill.                           |
| `optimize`         | Heavily React-specific (references `memo()`, `useMemo()`, `useCallback()`, React DevTools Profiler). Rewriting for Hugo/Alpine.js would produce a fundamentally different skill with little overlap. |
| `extract`          | Design token extraction is already handled by `daisyui-design-system-generator`, which is more specific to our OKLCH/DaisyUI stack.                                                                  |

**Alternatives considered**:

- Import and heavily rewrite `optimize` — rejected because the skill's value is React performance patterns, not general performance advice.
- Import `extract` alongside existing — rejected because contradictory extraction approaches would confuse users.

## R3: Naming Convention

**Decision**: All imported skills use `design-{name}` prefix. Existing `frontend-design` renamed to `design-interview`.

**Rationale**: The `design-` prefix creates a discoverable namespace. Users typing `design-` in Claude Code see all design skills grouped together. The rename of `frontend-design` → `design-interview` frees the name for impeccable's `frontend-design` (imported as `design-frontend`) and better describes the skill's expanded role as an orchestrator.

**Alternatives considered**:

- `impeccable-{name}` prefix — rejected; ties naming to source rather than function.
- Keep `frontend-design` name, import impeccable version as `impeccable-frontend-design` — rejected; confusing duplication.

## R4: Apache 2.0 Compliance

**Decision**: Three-layer attribution: NOTICE file + per-file headers + license reference.

**Rationale**: Apache 2.0 requires:

1. **NOTICE file**: Must be included with redistributions (Section 4d). Place at `.claude/skills/NOTICE` co-located with attributed content.
2. **Modification notices**: "You must cause any modified files to carry prominent notices stating that You changed the files" (Section 4b). Each adapted SKILL.md gets a header.
3. **License copy**: A copy of the Apache 2.0 license must be given to recipients (Section 4a). Reference the LICENSE text.

**Alternatives considered**:

- NOTICE at repo root — rejected per spec answer (A5: co-located with content).
- Embed full license in each file — rejected; verbose and unnecessary with NOTICE file.

## R5: Adaptation Strategy for Framework References

**Decision**: Direct replacement mapping (React → Hugo/Alpine.js/HTMX equivalents).

**Rationale**: The impeccable skills use framework-agnostic design concepts with framework-specific implementation examples. The design concepts (visual hierarchy, color strategy, typography principles) are universally applicable. Only the implementation references need updating:

| Impeccable Reference            | Project Replacement                               |
| ------------------------------- | ------------------------------------------------- |
| React components / JSX          | Hugo Go template partials                         |
| CSS-in-JS / styled-components   | TailwindCSS 4 utility classes                     |
| Generic design tokens           | DaisyUI 5 OKLCH theme variables (`oklch(L% C H)`) |
| Component library (MUI, Chakra) | DaisyUI 5 component classes                       |
| `useState`, `useEffect`         | Alpine.js `x-data`, `x-init`, `x-effect`          |
| Client-side router transitions  | HTMX `hx-swap`, `hx-target`, View Transitions API |
| React DevTools                  | Browser DevTools + Hugo `--debug`                 |
| `npm run dev` (Vite/CRA)        | `hugo server` + `npx wrangler dev`                |
| `.impeccable.md` context file   | `design-interview` context gathering              |
| `teach-impeccable` command      | `design-interview` skill                          |

**Alternatives considered**:

- Keep generic references and let users translate — rejected; defeats the purpose of adaptation (SC-001 requires zero React references).
- Create a translation glossary instead of inline adaptation — rejected; introduces indirection and cognitive load.

## R6: Orchestrator Design (design-interview)

**Decision**: 7-phase structured orchestrator with templated prompts.

**Rationale**: The spec (FR-010, FR-011) mandates a phased workflow. The 7 phases map to natural design workflow stages and each routes to specific skills:

| Phase         | Purpose                                                  | Primary Skills                                                                                                               |
| ------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1. Interview  | Gather context (users, brand, aesthetics, accessibility) | `design-interview` itself                                                                                                    |
| 2. Theme      | Generate color system                                    | `daisyui-design-system-generator`                                                                                            |
| 3. Components | Define component patterns                                | `tailwind-daisyui-design`                                                                                                    |
| 4. Implement  | Build templates                                          | Hugo template skills, `htmx-alpine-templates`                                                                                |
| 5. Refine     | Adjust aesthetics                                        | `design-bolder`, `design-quieter`, `design-colorize`, `design-typeset`, `design-arrange`, `design-animate`, `design-delight` |
| 6. Review     | Evaluate quality                                         | `design-critique`, `design-audit`, `design-polish`, `design-clarify`                                                         |
| 7. Harden     | Production readiness                                     | `design-harden`, `design-adapt`, `design-normalize`, `design-onboard`                                                        |

Each phase transition includes a templated prompt so developers don't need to memorize skill names.

**Alternatives considered**:

- Flat skill list with no orchestration — rejected per spec (FR-010); 18+ skills are overwhelming without guidance.
- Automated pipeline that runs all phases — rejected; design is iterative and requires human judgment at each phase.

## R7: Reference Document Import

**Decision**: Import all 7 reference documents from impeccable's `frontend-design` skill into `design-frontend/references/`.

**Rationale**: Per FR-009, reference documents must be imported where they contain guidance not already covered. The 7 documents (color-and-contrast, interaction-design, motion-design, responsive-design, spatial-design, typography, ux-writing) provide design-principle-level guidance that complements our existing implementation-focused references.

| Impeccable Reference  | Existing Coverage                                  | Import?                          |
| --------------------- | -------------------------------------------------- | -------------------------------- |
| color-and-contrast.md | Partially by oklch-contrast.md (technical)         | Yes — adds OKLCH design strategy |
| interaction-design.md | Partially by htmx-pattern-library                  | Yes — adds UX perspective        |
| motion-design.md      | Not covered                                        | Yes — new content                |
| responsive-design.md  | Not covered                                        | Yes — new content                |
| spatial-design.md     | Not covered                                        | Yes — new content                |
| typography.md         | Partially by typography-readability.md (technical) | Yes — adds design perspective    |
| ux-writing.md         | Partially by hugo-copywriting                      | Yes — adds UX microcopy focus    |

**Alternatives considered**:

- Skip references, import only SKILL.md files — rejected; references contain the deep knowledge that makes skills effective.
- Merge into existing skill references — rejected; creates confusing mixed-provenance files and complicates attribution.

## R8: Template Placeholder Resolution

**Decision**: Resolve all `{{placeholder}}` values at import time to Claude Code-specific values.

**Mapping**:

- `{{model}}` → `Claude`
- `{{config_file}}` → `CLAUDE.md`
- `{{ask_instruction}}` → Remove (Claude Code handles user interaction natively)
- `{{available_commands}}` → Replace with project's `/design-*` skill list

**Rationale**: The source files are provider-agnostic templates. Since we're doing a one-time import (not maintaining sync), hardcoding the values is simpler and more readable than maintaining a build system.

## R9: Existing Skill Cross-Reference Updates

**Decision**: Add cross-references bidirectionally — existing skills reference new `design-*` skills, and imported skills reference existing skills.

**Skills requiring cross-reference additions**:

- `tailwind-daisyui-design` → reference `design-colorize`, `design-typeset`, `design-arrange`
- `daisyui-design-system-generator` → reference `design-colorize`, `design-normalize`
- `hugo-copywriting` → reference `design-clarify`
- `htmx-pattern-library` → reference `design-animate`
- `design-interview` (new) → reference all phase-appropriate skills

**Alternatives considered**:

- One-directional references (new → old only) — rejected; developers using existing skills should discover complementary new skills.
- No cross-references — rejected per FR-006.
