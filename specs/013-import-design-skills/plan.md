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

1. Create `.claude/skills/NOTICE` with Apache 2.0 attribution (see contracts/skill-interface.md Contract 3)
2. Define the standard file header for all imported skills (see contracts/skill-interface.md Contract 2)

### Phase B: Rename & Expand `frontend-design` → `design-interview`

1. **Rename**: `git mv .claude/skills/frontend-design/ .claude/skills/design-interview/`
2. **Preserve existing content**: Keep the current 4-phase workflow (Interview → Color Theme → Components → Implement), design-patterns.md, hugo-templates.md references, anti-pattern guidance, and file edit priority table
3. **Fold teach-impeccable context-gathering** into the interview phase. The existing skill already has a 5-question interview; expand it with teach-impeccable's structured approach:
   - **Step 1 (before questions)**: Codebase scan for design signals — README, package.json, existing components, brand assets, CSS variables, style guides. Note what was learned.
   - **Step 2 (questions, skip any answered by codebase scan)**:
     - _Users & Purpose_: Who uses this? Context? What job? What emotions to evoke?
     - _Brand & Personality_: 3-word personality? Reference sites/apps? Anti-references?
     - _Aesthetic Preferences_: Visual direction? Light/dark mode? Colors to use/avoid?
     - _Accessibility_: WCAG level? Reduced motion, color blindness accommodations?
   - **Step 3**: Synthesize into Design Context (Users, Brand Personality, Aesthetic Direction, Design Principles)
4. **Expand to 7-phase orchestrator** (FR-010). The existing skill already covers phases 1-4; add Refine, Review, Harden:

   | Phase         | Existing?    | What to add                                                             |
   | ------------- | ------------ | ----------------------------------------------------------------------- |
   | 1. Interview  | Yes (expand) | teach-impeccable codebase scan + structured questions                   |
   | 2. Theme      | Yes          | No changes — already delegates to `daisyui-design-system-generator`     |
   | 3. Components | Yes          | No changes — already delegates to `tailwind-daisyui-design`             |
   | 4. Implement  | Yes          | No changes — already references Hugo template skills                    |
   | 5. Refine     | **NEW**      | Route to design-bolder/quieter/colorize/typeset/arrange/animate/delight |
   | 6. Review     | **NEW**      | Route to design-critique/audit/polish/clarify                           |
   | 7. Harden     | **NEW**      | Route to design-harden/adapt/normalize/onboard                          |

5. **Add templated prompts** for each phase transition (FR-011). Example format:

   ```markdown
   ### Next: Refine Phase

   Your design is implemented. Choose a refinement direction:

   - **Too safe/boring?** → `/design-bolder` — "Amplify the design of [component].
     Current: [describe]. Make it more visually striking while keeping it usable."
   - **Too aggressive?** → `/design-quieter` — "Tone down [component].
     Current: [describe]. Reduce visual intensity while preserving design quality."
   - **Needs color?** → `/design-colorize` — "Add strategic color to [component].
     Current palette: [list]. Brand colors: [list]."
   - **Typography needs work?** → `/design-typeset` — "Improve typography in [area].
     Current fonts: [list]. Current scale: [describe]."
   ```

6. **Update cross-references** in skills that mention `frontend-design`:
   - `tailwind-daisyui-design` — update any reference
   - `daisyui-design-system-generator` — update any reference
   - `hugo-templates` — update any reference

### Phase C: Import `design-frontend` (impeccable's reference hub)

1. Import impeccable's `frontend-design` SKILL.md as `design-frontend`
2. **Key content to preserve and adapt**:
   - Context Gathering Protocol → update to reference `design-interview` instead of `teach-impeccable`
   - Design Direction framework (Purpose, Tone, Constraints, Differentiation)
   - Frontend Aesthetics Guidelines (Typography, Color & Theme, Layout & Space, Visual Details, Motion, Interaction, Responsive, UX Writing) — each with reference doc pointer
   - AI Slop Test ("If you showed this to someone and said 'AI made this,' would they believe you immediately?")
   - Anti-pattern lists (avoid Inter/Roboto/Arial, avoid cyan-on-dark, purple-to-blue gradients, neon accents, glassmorphism, bounce/elastic easing)
   - Implementation Principles (match complexity to vision, never converge on common choices)
3. **Adapt Context Gathering Protocol lookup chain**:
   - ~~Check `.impeccable.md`~~ → Check CLAUDE.md for `## Design Context` section
   - ~~Run `teach-impeccable`~~ → Run `/design-interview`
4. **Import and adapt 7 reference documents** into `design-frontend/references/`:
   - `color-and-contrast.md` — Framework-agnostic OKLCH advice. Add notes mapping to DaisyUI 5 semantic color tokens (`primary`, `secondary`, `accent`, `neutral`) and `data-theme` attributes. Pure CSS examples are directly applicable.
   - `interaction-design.md` — Add notes mapping to HTMX patterns (`hx-swap`, progressive disclosure) and Alpine.js (`x-data`, `x-show`)
   - `motion-design.md` — Framework-agnostic CSS (cubic-bezier, @media prefers-reduced-motion). Add Tailwind motion utilities (`transition-transform`, `duration-300`, `motion-reduce:*`) and Alpine.js `x-transition` examples.
   - `responsive-design.md` — Add Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) and DaisyUI responsive component variants
   - `spatial-design.md` — Add Tailwind spacing scale and DaisyUI layout components
   - `typography.md` — Add `@tailwindcss/typography` prose classes and DaisyUI typography conventions
   - `ux-writing.md` — Cross-reference with existing `hugo-copywriting` skill
5. **No `{{model}}` or `{{config_file}}` placeholders** in the `frontend-design` source — these are not present in the actual source files. The only adaptation needed is the Mandatory Preparation/Context Gathering references.

### Phase D: Import 16 Standalone Design Skills

**Key finding from source analysis**: The standalone skills are ~95% framework-agnostic. They use pure CSS, web standards, and design principles. The adaptation work is narrower than initially estimated.

**Adaptation checklist per skill** (apply to each of the 16):

1. **Add Apache 2.0 attribution header** (see Contract 2)
2. **Replace Mandatory Preparation block** — every skill has this pattern:
   ```markdown
   ## MANDATORY PREPARATION

   Use the frontend-design skill — it contains design principles,
   anti-patterns, and the **Context Gathering Protocol**. Follow the
   protocol before proceeding — if no design context exists yet, you
   MUST run teach-impeccable first. Additionally gather: {skill-specific}.
   ```
   Replace with:
   ```markdown
   ## MANDATORY PREPARATION

   Use the `/design-frontend` skill — it contains design principles,
   anti-patterns, and the **Context Gathering Protocol**. Follow the
   protocol before proceeding — if no design context exists yet, you
   MUST run `/design-interview` first. Additionally gather: {skill-specific}.
   ```
3. **Replace `{{ask_instruction}}` placeholder** — found in some skills in the pattern `"If any of these are unclear from the codebase, {{ask_instruction}}"`. Replace with `"If any of these are unclear from the codebase, ask the user."` (Claude Code handles this natively)
4. **No `{{model}}` or `{{config_file}}` replacements needed** — these are not present in standalone skill source files
5. **Add cross-references** to existing project skills where domains overlap (per Overlap Resolution table below)
6. **Add DaisyUI/Tailwind mapping notes** where skills reference generic CSS patterns — annotate with equivalent Tailwind utility classes or DaisyUI components

**Skills requiring minimal adaptation** (framework-agnostic, only Mandatory Preparation + header):
polish, arrange, colorize, typeset, animate, delight, critique, audit, clarify, bolder, quieter, harden, adapt, normalize, onboard, distill

**Skills requiring moderate adaptation** (has some framework-specific examples):
overdrive — may reference WebGL/advanced APIs; verify examples work in Hugo/Alpine.js context

### Phase E: Integration & Cross-References

1. **Add cross-references from existing skills** to new `design-*` skills:
   - `tailwind-daisyui-design/SKILL.md` → add: "For color strategy beyond semantic application, see `/design-colorize`. For typography selection and hierarchy, see `/design-typeset`. For layout composition, see `/design-arrange`."
   - `daisyui-design-system-generator/SKILL.md` → add: "For color strategy guidance before generating themes, see `/design-colorize`. To align existing UI to your generated theme, see `/design-normalize`."
   - `hugo-copywriting/SKILL.md` → add: "For UX microcopy (labels, error messages, empty states), see `/design-clarify`."
   - `htmx-pattern-library/SKILL.md` → add: "For motion design guidance on HTMX transitions, see `/design-animate`."
   - `ui-design-language/SKILL.md` → add: "For design anti-patterns and the AI Slop Test, see `/design-frontend`."
2. **Verify no contradictions** — spot-check key areas:
   - Color advice: design-colorize vs daisyui-design-system-generator (strategy vs generation — complementary)
   - Typography: design-typeset vs tailwind-daisyui-design typography-readability.md (selection vs application — complementary)
   - Accessibility: design-audit vs tailwind-daisyui-design form-accessibility.md (broad vs form-specific — complementary)
3. **Update CLAUDE.md skill list** — ensure all new `design-*` skills appear in the available skills section

### Adaptation Matrix

| Impeccable Reference              | Project Equivalent                            | Frequency                                       |
| --------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| `frontend-design` skill ref       | `/design-frontend`                            | Every skill (Mandatory Preparation block)       |
| `teach-impeccable` skill ref      | `/design-interview`                           | Every skill (Mandatory Preparation block)       |
| `{{ask_instruction}}` placeholder | "ask the user" (Claude Code handles natively) | Some skills (colorize, bolder, others)          |
| `.impeccable.md` context file     | CLAUDE.md `## Design Context` section         | frontend-design Context Gathering Protocol only |
| React components / JSX            | Hugo Go template partials                     | Rare — skills are ~95% framework-agnostic       |
| CSS-in-JS / styled-components     | TailwindCSS 4 utility classes                 | Rare — skills use pure CSS                      |
| Design tokens (generic)           | DaisyUI 5 OKLCH theme variables               | Reference docs (add mapping notes)              |
| Component library (generic)       | DaisyUI 5 component classes                   | Reference docs (add mapping notes)              |
| State management (React)          | Alpine.js `x-data` / HTMX `hx-*`              | Reference docs (interaction-design.md)          |
| Client-side routing               | Hugo page routing + HTMX partial swaps        | Reference docs (interaction-design.md)          |

**Key finding**: `{{model}}` and `{{config_file}}` placeholders are NOT present in the source skill files (only in the build system's output). No replacement needed for these.

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
