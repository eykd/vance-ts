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

### Commit Strategy

_Added by red team review (sp:04)._

Each phase should be committed separately for clean git history, but with guards against broken intermediate states:

- **Phase A** (License): Safe to commit independently — no dependencies.
- **Phase B** (Rename): Safe to commit — the orchestrator's new phases (Refine/Review/Harden) should reference skills as "coming soon" or use conditional language ("when available, invoke...") until Phase D.
- **Phase C** (design-frontend): Depends on Phase A (NOTICE file). Commit together with Phase A, or after.
- **Phase D** (16 skills): Depends on Phases A and C (attribution + design-frontend references). Commit after C.
- **Phase E** (cross-references): Depends on all prior phases. Commit last.

If interrupted mid-phase, the post-import verification checklist will catch broken cross-references.

### Phase A: License & Attribution

1. Create `.claude/skills/NOTICE` with Apache 2.0 attribution (see contracts/skill-interface.md Contract 3)
2. Define the standard file header for all imported skills (see contracts/skill-interface.md Contract 2)

### Phase B: Rename & Expand `frontend-design` → `design-interview`

1. **Rename**: `git mv .claude/skills/frontend-design/ .claude/skills/design-interview/`
2. **Preserve existing content and update frontmatter**: Keep the current 4-phase workflow (Interview → Color Theme → Components → Implement), design-patterns.md, hugo-templates.md references, anti-pattern guidance, and file edit priority table. Update SKILL.md frontmatter `name` field to `design-interview` and `description` to reflect the expanded orchestrator role. Craft the description to emphasize its role as the **starting point** for design work with trigger words like "Use when starting a new design task, redesigning UI, or needing guidance on which design skill to use next." Verify description stays under the 1024-character skill description limit.
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

6. **Enforce <150-line SKILL.md constraint** _(added by red team review)_: The project convention (README.md) mandates SKILL.md files be <150 lines with progressive disclosure. The expanded orchestrator will exceed this. Extract phase detail into reference documents:
   - `references/phases.md` — full phase definitions with templated prompts
   - `references/design-patterns.md` — existing (preserved)
   - `references/hugo-templates.md` — existing (preserved)
   - SKILL.md retains: frontmatter, workflow overview, interview framework, phase summary table with "See references/phases.md" pointer. Target: ≤150 lines.
7. **Update cross-references** in files that mention `frontend-design` (5 occurrences in 3 files):
   - `.claude/skills/README.md` line 174 — update cross-reference list
   - `.claude/skills/hugo-copywriting/SKILL.md` line 3 (frontmatter description) — update integration mention
   - `.claude/skills/hugo-copywriting/SKILL.md` line 134 — update "Integrates with" list
   - `.claude/skills/hugo-copywriting/SKILL.md` line 136 — update workflow flow description
   - `.claude/skills/hugo-copywriting/references/hugo-claude-integration.md` line 41 — update skill reference
   - **Decision**: Replace `frontend-design` → `design-interview` in these references (since design-interview is the workflow orchestrator that these skills actually integrate with)
   - **Internal reference paths** _(added by red team review)_: After `git mv`, verify that no files outside `.claude/skills/design-interview/` contain path references to the old location: `grep -r "frontend-design/references" .` — must return zero results. Also check `specs/` and `docs/` directories for stale path references.

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
5. **Replace `{{model}}` placeholder** in the Implementation Principles closing section — the source contains "Remember: {{model}} is capable of extraordinary creative work." Replace `{{model}}` with `Claude` or remove the sentence (Claude Code does not need this instruction). Note: `{{config_file}}` is NOT present in `frontend-design` source (only in `teach-impeccable`, which is folded into `design-interview` in Phase B).
6. **Update source attribution header** — the source file references `NOTICE.md` (wrong extension) and "Based on Anthropic's frontend-design skill" (provenance from impeccable's own chain). Replace with the project's attribution header format (Contract 2) pointing to `.claude/skills/NOTICE`. Preserve the upstream provenance chain (Anthropic → pbakaus/impeccable → this project).
7. **Craft `design-frontend` description** to emphasize its role as a **reference hub** for design principles and anti-patterns, invoked by other skills rather than directly by users. Use trigger words like "invoked by design-\* skills for principles and anti-patterns" to reduce accidental direct invocation. Verify description stays under the 1024-character skill description limit.

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

   Replace with _(recursion guard added by red team review)_:

   ```markdown
   ## MANDATORY PREPARATION

   Use the `/design-frontend` skill — it contains design principles,
   anti-patterns, and the **Context Gathering Protocol**. Follow the
   protocol before proceeding — if no design context exists yet,
   **ask the user** whether to run `/design-interview` first or
   proceed with reasonable defaults. Do NOT auto-invoke
   `/design-interview` — let the user decide.
   Additionally gather: {skill-specific}.
   ```

3. **Replace `{{ask_instruction}}` placeholder** — found in some skills in the pattern `"If any of these are unclear from the codebase, {{ask_instruction}}"`. Replace with `"If any of these are unclear from the codebase, ask the user."` (Claude Code handles this natively)
4. **Replace `{{available_commands}}` placeholder** — found in `audit` (2 occurrences) and `critique` (1 occurrence) in recommendation sections like "Prefer these: `{{available_commands}}`". Replace with a curated list of relevant project `design-*` skill names, e.g., `Available skills: /design-colorize, /design-typeset, /design-arrange, /design-animate, /design-polish`.
5. **Preserve `{{area}}` parameter** — `audit` uses `{{area}}` as an intentional user-facing parameter (audit scope). This is NOT a build-system placeholder — preserve it as-is. Do not replace.
6. **No `{{model}}` or `{{config_file}}` replacements needed** — `{{model}}` is present only in `frontend-design` source (handled in Phase C). Not present in standalone skill source files.
7. **Add cross-references** to existing project skills where domains overlap (per Overlap Resolution table below)
8. **Add DaisyUI/Tailwind mapping notes** where skills reference generic CSS patterns — annotate with equivalent Tailwind utility classes or DaisyUI components

**Skills requiring minimal adaptation** (framework-agnostic, only Mandatory Preparation + header + `{{ask_instruction}}`):
polish, arrange, colorize, typeset, clarify, bolder, quieter, normalize, distill

**Skills requiring insertion of Mandatory Preparation block** (block is absent in source):
harden — has no Mandatory Preparation section. ADD the standard template (step 2) rather than replacing one.

**Skills requiring additional framework adaptation** (have React-specific library references):

**Note on overdrive**: Source analysis confirms it is ~95% framework-agnostic, focused on browser-native APIs (View Transitions, scroll-driven animations, WebGL, Canvas, Web Workers, WASM). Only two library references need adaptation:

- "motion (formerly Framer Motion)" → remove or replace with GSAP (already listed in the skill) or Web Animations API
- "TanStack Virtual" → note as vanilla-compatible or replace with custom approach for Alpine.js
  All CSS and vanilla JS techniques work directly with Hugo + Alpine.js.

**Note on delight**: References Framer Motion, React Spring, use-sound (React hook), and Lottie. Replace: Framer Motion → CSS animations + Alpine.js `x-transition`; React Spring → CSS `spring()` timing or Web Animations API; use-sound → Web Audio API or Howler.js (vanilla); Lottie → keep (framework-agnostic).

**Note on animate**: References "Framer Motion (for React projects)". Replace with CSS animations + Alpine.js `x-transition` + Web Animations API.

**Note on adapt**: Source uses desktop-first responsive strategy with fixed pixel breakpoints (320px/768px/1024px). Adapt to Tailwind CSS 4's mobile-first convention:

- Replace pixel breakpoints with Tailwind responsive prefixes (`sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`)
- Reframe "Desktop → Mobile" adaptation advice as mobile-first progressive enhancement
- Add note: "This project uses Tailwind's mobile-first responsive system — styles without prefixes apply to mobile, prefixes add larger-screen behaviors"
- Cross-reference with existing `tailwind-daisyui-design` responsive design section

**Note on distill**: This skill instructs component and code removal. Add project-specific safeguards:

> **Project Safeguard**: In this project's DaisyUI 5 + Hugo stack:
>
> - Do NOT remove DaisyUI component variants that support accessibility states
> - Do NOT simplify Hugo partial structures that enable responsive layouts
> - Do NOT strip theme variables — the OKLCH color system requires all semantic color pairs
> - Before removing any component, verify it is not used across multiple templates with `grep -r`
> - Prefer simplifying custom CSS over removing DaisyUI utility usage

**Note on onboard**: Contains instructions for localStorage-based user tracking and analytics metrics. Add a privacy warning (see Security Considerations → Privacy-Sensitive Skill Instructions).

**Note on harden** _(added by red team review)_: This skill instructs production-resilience changes that may touch security-sensitive files (`static/_headers` for CSP, caching configuration, error handling). Add a project-specific guard:

> **Security Note**: Changes to `static/_headers`, Content Security Policy, caching headers, or service worker configuration must be reviewed against the project's security policies in CLAUDE.md before applying. Do not weaken existing security headers to accommodate design changes.

**Note on audit and critique**: Contain `{{available_commands}}` placeholders requiring replacement (see step 4 above).

### Phase E: Integration & Cross-References

1. **Add cross-references from existing skills** to new `design-*` skills:
   - `tailwind-daisyui-design/SKILL.md` → add: "For color strategy beyond semantic application, see `/design-colorize`. For typography selection and hierarchy, see `/design-typeset`. For layout composition, see `/design-arrange`."
   - `daisyui-design-system-generator/SKILL.md` → add: "For color strategy guidance before generating themes, see `/design-colorize`. To align existing UI to your generated theme, see `/design-normalize`."
   - `hugo-copywriting/SKILL.md` → add: "For UX microcopy (labels, error messages, empty states), see `/design-clarify`."
   - `htmx-pattern-library/SKILL.md` → add: "For motion design guidance on HTMX transitions, see `/design-animate`."
   - `ui-design-language/SKILL.md` → add: "For layout composition strategy, see `/design-arrange`. For UX evaluation, see `/design-critique`. For design anti-patterns and the AI Slop Test, see `/design-frontend`." _(expanded by red team review)_
2. **Verify no contradictions** — spot-check key areas:
   - Color advice: design-colorize vs daisyui-design-system-generator (strategy vs generation — complementary)
   - Typography: design-typeset vs tailwind-daisyui-design typography-readability.md (selection vs application — complementary)
   - Accessibility: design-audit vs tailwind-daisyui-design form-accessibility.md (broad vs form-specific — complementary)
3. **Update CLAUDE.md skill list** — ensure all new `design-*` skills appear in the available skills section
4. **Update `.claude/skills/README.md`** — add a new "### Design" section under "Frontend & UI" containing catalog entries for all 18 imported `design-*` skills plus `design-interview`. Each entry must follow the existing format: name with link, "Use when" triggers, "Provides" summary, "Cross-references" list. Add a "Design Chain" to the Skill Chains section: `design-interview → design-frontend → daisyui-design-system-generator → tailwind-daisyui-design → design-*/refine → design-*/review → design-*/harden`. Add a **new entry** for `design-interview` (there is no existing `frontend-design` entry in README.md to update — it was only referenced in cross-references). Place it first in the Design section as the workflow entry point. _(corrected by red team review)_
5. **Add cross-references for `design-language-to-daisyui`** — this existing skill overlaps with `design-arrange` (layout) and `design-normalize` (system alignment). Add to `design-language-to-daisyui/SKILL.md`: "For layout composition strategy, see `/design-arrange`. For design system alignment, see `/design-normalize`."

### Adaptation Matrix

| Impeccable Reference                 | Project Equivalent                            | Frequency                                         |
| ------------------------------------ | --------------------------------------------- | ------------------------------------------------- |
| `frontend-design` skill ref          | `/design-frontend`                            | Every skill (Mandatory Preparation block)         |
| `teach-impeccable` skill ref         | `/design-interview`                           | Every skill (Mandatory Preparation block)         |
| `{{ask_instruction}}` placeholder    | "ask the user" (Claude Code handles natively) | Some skills (colorize, bolder, others)            |
| `{{available_commands}}` placeholder | Curated list of project `design-*` skills     | audit (×2), critique (×1)                         |
| `{{model}}` placeholder              | `Claude` (or remove sentence)                 | frontend-design only (Phase C step 5)             |
| `{{area}}` placeholder               | **Preserve as-is** (user-facing parameter)    | audit only — intentional, not a build placeholder |
| `.impeccable.md` context file        | CLAUDE.md `## Design Context` section         | frontend-design Context Gathering Protocol only   |
| React components / JSX               | Hugo Go template partials                     | Rare — skills are ~95% framework-agnostic         |
| CSS-in-JS / styled-components        | TailwindCSS 4 utility classes                 | Rare — skills use pure CSS                        |
| Design tokens (generic)              | DaisyUI 5 OKLCH theme variables               | Reference docs (add mapping notes)                |
| Component library (generic)          | DaisyUI 5 component classes                   | Reference docs (add mapping notes)                |
| State management (React)             | Alpine.js `x-data` / HTMX `hx-*`              | Reference docs (interaction-design.md)            |
| Client-side routing                  | Hugo page routing + HTMX partial swaps        | Reference docs (interaction-design.md)            |

**Key finding**: `{{model}}` is present in `frontend-design` source only (handled in Phase C step 5). `{{config_file}}` is NOT present in source skill files. `{{available_commands}}` is present in `audit` and `critique` (handled in Phase D step 4). `{{area}}` in `audit` is an intentional user parameter — preserve it.

### Overlap Resolution

| Imported Skill     | Existing Skill                                        | Resolution                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `design-colorize`  | `daisyui-design-system-generator`                     | design-colorize provides _strategy_ (when/where to add color); existing skill generates _themes_ (OKLCH values). Complementary. design-colorize defers to existing for theme generation.                                                                                                                                   |
| `design-colorize`  | `tailwind-daisyui-design` (color-usage.md)            | design-colorize adds color strategy layer; existing provides semantic application patterns. Cross-reference both.                                                                                                                                                                                                          |
| `design-typeset`   | `tailwind-daisyui-design` (typography-readability.md) | design-typeset provides font selection and hierarchy strategy; existing provides Tailwind prose classes and readability rules. Cross-reference both.                                                                                                                                                                       |
| `design-audit`     | `tailwind-daisyui-design` (form-accessibility.md)     | design-audit is broader (all a11y); existing is form-specific. Complementary.                                                                                                                                                                                                                                              |
| `design-frontend`  | `design-interview`                                    | design-frontend is the reference hub (guidelines, anti-patterns); design-interview is the workflow orchestrator (routes users through phases). Distinct responsibilities.                                                                                                                                                  |
| `design-adapt`     | `htmx-alpine-templates`                               | design-adapt covers responsive strategy; existing provides implementation templates. Complementary.                                                                                                                                                                                                                        |
| `design-normalize` | `daisyui-design-system-generator`                     | design-normalize aligns existing UI to a system; existing generates the system. Sequential.                                                                                                                                                                                                                                |
| `design-clarify`   | `hugo-copywriting`                                    | design-clarify handles UX microcopy (labels, errors); copywriting handles long-form content. Different scope.                                                                                                                                                                                                              |
| `design-arrange`   | `design-language-to-daisyui`                          | design-arrange provides layout strategy; existing translates vocabulary to DaisyUI classes. Cross-reference: design-arrange should note "For translating layout descriptions to DaisyUI classes, see `/design-language-to-daisyui`."                                                                                       |
| `design-normalize` | `design-language-to-daisyui`                          | design-normalize aligns existing UI to design system; existing translates design vocabulary to DaisyUI. Complementary.                                                                                                                                                                                                     |
| `design-arrange`   | `ui-design-language`                                  | design-arrange provides high-level layout strategy (rhythm, visual weight, negative space); ui-design-language provides structured vocabulary for specific layout implementations. Cross-reference: "To describe layouts using the project's standard vocabulary, see `/ui-design-language`." _(added by red team review)_ |
| `design-critique`  | `ui-design-language`                                  | design-critique evaluates UX quality; ui-design-language provides vocabulary for describing UIs. When critique output describes layout changes, it should use ui-design-language vocabulary for consistency. _(added by red team review)_                                                                                  |

## Security Considerations

_Added by red team review (sp:04)._

### Third-Party Content Review

Imported skill files are AI instructions that Claude Code executes directly. The source repo (pbakaus/impeccable) is a known public repository under Apache 2.0, but content should still be reviewed for unexpected instructions before committing.

- **Mitigation**: During Phase D, each imported SKILL.md must be read and reviewed for any instructions that could cause unintended behavior (e.g., instructions to modify files outside `.claude/skills/`, instructions to execute shell commands, or instructions that conflict with project security policies in CLAUDE.md).
- **Verification**: After import, grep all new skill files for patterns like `Bash`, `shell`, `execute`, `run command`, `write file`, `delete` to flag any instruction patterns that warrant manual review.

### License Compliance Integrity

The plan correctly addresses Apache 2.0 attribution (NOTICE file, file headers). No additional security concerns here — the license permits modification and redistribution.

### Privacy-Sensitive Skill Instructions

The `design-onboard` skill instructs Claude to implement localStorage-based user tracking (`localStorage.setItem('onboarding-completed', 'true')`) and analytics metrics (completion time, drop-off points, skip rates). This effectively instructs Claude to add telemetry code to the application.

- **Risk**: Adding client-side tracking without privacy policy coverage could violate GDPR/ePrivacy regulations (localStorage is covered by consent requirements in EU). The skill could cause Claude to silently add tracking code that the developer doesn't realize has privacy implications.
- **Mitigation**: During Phase D adaptation, add a prominent warning to `design-onboard/SKILL.md`:
  ```
  > **Privacy Notice**: Before implementing onboarding tracking (localStorage, completion
  > metrics), verify that:
  > 1. The project's privacy policy covers client-side storage
  > 2. Cookie/storage consent is implemented if targeting EU users (ePrivacy Directive)
  > 3. Tracking data is reviewed against the project's PII redaction policies
  ```

## Edge Cases & Error Handling

_Added by red team review (sp:04)._

### Missing `## Design Context` Section in CLAUDE.md

The plan maps `.impeccable.md` → `CLAUDE.md ## Design Context` section (Phase C, step 3), but **this section does not currently exist** in the root CLAUDE.md. The `design-frontend` skill's Context Gathering Protocol will look for this section and find nothing.

- **Mitigation**: Phase C must include creating a minimal `## Design Context` placeholder section in CLAUDE.md (or in a layer CLAUDE.md) with a note that it will be populated when `/design-interview` is first run. Alternatively, the Context Gathering Protocol should gracefully handle the section's absence by falling back to running `/design-interview`.
- **Decision needed**: Where should Design Context live — root CLAUDE.md (clutters non-design work) or a dedicated `.claude/design-context.md` file referenced from the skill?

### SKILL.md Frontmatter Name Field After Rename

Phase B renames the directory (`git mv .claude/skills/frontend-design/ .claude/skills/design-interview/`) but does not explicitly mention updating the YAML frontmatter `name: frontend-design` → `name: design-interview` inside SKILL.md. The skill loader may use the frontmatter name for display and matching.

- **Mitigation**: Add to Phase B step 2: "Update SKILL.md frontmatter `name` field to `design-interview` and `description` to reflect the expanded orchestrator role."

### Mandatory Preparation Block Format Variance

Phase D assumes all 16 standalone skills have an identical Mandatory Preparation block. Source analysis confirms at least `harden` has NO Mandatory Preparation section at all — it requires insertion rather than replacement.

- **Mitigation**: Before batch replacement, grep all 16 source skill files for `MANDATORY PREPARATION` and compare the exact text. Document any variations and handle them individually. For skills missing the block entirely (confirmed: `harden`), insert the standard template. Add a post-replacement verification step (grep for any remaining `teach-impeccable` or unmodified `frontend-design` references).

### `{{ask_instruction}}` Placeholder Enumeration

The plan notes this placeholder appears "in some skills" but doesn't enumerate which ones. If the placeholder appears in a context other than the expected pattern, it could be missed.

- **Mitigation**: Before import, grep all source skills for `{{ask_instruction}}` and document every occurrence with its surrounding context. Replace each one specifically rather than using a blind find-and-replace.

### Orchestrator Non-Linear Workflow

The 7-phase orchestrator (Interview → Theme → Components → Implement → Refine → Review → Harden) implies a linear progression. Real design work is iterative — developers frequently jump back to earlier phases, skip phases, or run multiple refinement passes.

- **Mitigation**: The orchestrator SKILL.md must include:
  1. A "Current Phase" indicator that the developer can override ("Jump to phase: ...")
  2. Explicit support for re-entering any phase ("Already have a theme? Skip to Components")
  3. Guidance on when to loop back (e.g., "After Review, if critique reveals color issues, return to Refine → `/design-colorize`")
  4. A "Quick Mode" path for developers who only need a specific sub-skill without the full workflow

### Reference Document Internal Cross-References

The 7 reference documents imported into `design-frontend/references/` may cross-reference each other or reference skill names using the original impeccable naming (e.g., referencing `optimize` or `extract` which are excluded from import).

- **Mitigation**: After importing reference docs, grep them for:
  - References to excluded skills (`optimize`, `extract`, `teach-impeccable`)
  - References to skill names without the `design-` prefix
  - Internal cross-references between reference docs (update paths if needed)

### React Library References Beyond `overdrive`

Phase D classifies `delight`, `animate`, and others as "minimal adaptation." Source analysis confirms `delight` references Framer Motion, React Spring, use-sound (React hook), and Lottie. `animate` references "Framer Motion (for React projects)." These skills need the same React library replacement treatment as `overdrive`.

- **Mitigation**: See per-skill notes in Phase D. Also update the Post-Import Verification grep (item 6) to catch space-separated form: `framer motion` in addition to `framer.motion`.

### `adapt` Desktop-First vs Tailwind Mobile-First Conflict

The `design-adapt` source skill defines explicit pixel breakpoints (320-767px mobile, 768-1023px tablet, 1024px+ desktop) and uses a desktop-first approach. Tailwind CSS 4 is mobile-first by convention (responsive prefixes apply min-width, building UP from mobile). This philosophical mismatch would produce guidance contradicting how Tailwind responsive design works.

- **Mitigation**: See per-skill notes in Phase D for `adapt`. Reframe the entire responsive strategy direction from desktop-first to mobile-first.

### `design-language-to-daisyui` Vocabulary Conflict

The existing `design-language-to-daisyui` skill has a vocabulary-based system for describing UI (tone, emphasis, size, shape). If `design-arrange` gives layout advice using different terminology (e.g., "rhythm," "visual weight") than the existing design language system uses ("vertical stack," "gap large"), developers will receive conflicting vocabulary.

- **Mitigation**: Add `design-language-to-daisyui` to the Overlap Resolution table and add cross-references in Phase E.

### Skill Description Length Constraint

The `design-interview` orchestrator will have a significantly expanded role (7-phase workflow coordinator routing to 18+ sub-skills). The skill description frontmatter has a 1024-character limit. Writing a description that adequately covers trigger conditions while differentiating from `design-frontend` within this limit is a real constraint.

- **Mitigation**: Craft the `design-interview` description to emphasize its role as the **starting point** for design work, with trigger words like "Use when starting a new design task, redesigning UI, or needing guidance on which design skill to use next." Verify both `design-interview` and `design-frontend` descriptions stay under 1024 characters and are clearly differentiated (orchestrator vs reference hub).

### README.md Skill Catalog Gap

Phase E mentions updating CLAUDE.md and cross-references in existing skills, but `.claude/skills/README.md` is a 384-line catalog with structured entries for every skill. Without updating it, 18 new skills won't appear in the catalog.

- **Mitigation**: See Phase E step 4 for README.md update plan.

### Recursive Skill Invocation via Mandatory Preparation

_Added by red team review (sp:04) — second pass._

Every imported skill's Mandatory Preparation block says "Use the `/design-frontend` skill... if no design context exists yet, you MUST run `/design-interview` first." The orchestrator then routes users back to these same skills. Without a written `## Design Context` section in CLAUDE.md, the chain becomes: sub-skill → Mandatory Prep → design-frontend → Context Gathering Protocol → "no context found" → MUST run design-interview → Interview phase → eventually recommends the same sub-skill. This recursive loop wastes significant context budget.

- **Mitigation**: The Mandatory Preparation template has been updated (Phase D step 2) to use "ask the user" instead of "MUST run `/design-interview`", converting the hard requirement into a user-controlled decision. This breaks the recursion at the source.

### Historical Status Docs

`docs/2026-02-25_project_status.md` and `docs/2026-03-19-status.md` list `frontend-design` in their skills inventory. These are historical point-in-time snapshots.

- **Decision**: Do NOT update historical status docs — they accurately reflect the project state at their date. Future status snapshots will reflect the rename.

## Post-Import Verification Checklist

_Added by red team review (sp:04)._

After all phases complete, run these verification checks before committing:

1. **Stale references**: `grep -r "teach-impeccable\|{{ask_instruction}}\|{{available_commands}}\|{{model}}\|{{config_file}}\|\.impeccable\.md" .claude/skills/design-*/` — must return zero results
2. **Incomplete renames**: `grep -r "frontend-design" .claude/skills/` — must return zero results (only `design-frontend` and `design-interview` should exist)
3. **Attribution coverage**: Every file in `.claude/skills/design-*/SKILL.md` that was imported must have the Apache 2.0 attribution header
4. **Cross-reference integrity**: Every `design-*` skill mentioned in cross-references must have a corresponding directory in `.claude/skills/`
5. **Frontmatter validity**: Every new SKILL.md must have valid `name` and `description` frontmatter fields; descriptions must be under 1024 characters
6. **Framework references**: `grep -ri "react\|vue\|angular\|styled-components\|css-in-js\|framer.motion\|framer motion\|react spring\|use-sound" .claude/skills/design-*/` — must return zero results (SC-001)
7. **Preserved parameters**: `grep -r "{{area}}" .claude/skills/design-audit/` — must return results (intentional user-facing parameter, not to be replaced)
8. **Privacy warnings**: `design-onboard/SKILL.md` must contain a Privacy Notice warning about localStorage tracking
9. **README.md completeness**: `.claude/skills/README.md` must contain entries for all 18 imported skills plus `design-interview`
10. **NOTICE file completeness** _(added by red team review)_: Count `design-*/SKILL.md` entries in `.claude/skills/NOTICE` — must equal the number of `design-*/SKILL.md` files in `.claude/skills/` (expected: 18). Also verify all 7 reference doc paths are listed.
11. **Stale path references** _(added by red team review)_: `grep -r "frontend-design" .claude/skills/ specs/ docs/` — must return zero results except in historical status docs (docs/2026-\*-status.md) and spec files documenting the rename itself

## Misuse & Abuse Considerations

_Added by red team review (sp:04)._

### `design-distill` Instructs Code Removal

Unlike all other imported skills which add or modify, `design-distill` explicitly instructs removal: "Remove unused code: Dead CSS, unused components, orphaned files" and "Reduce variants." In the context of a DaisyUI project, an AI following this skill could recommend removing DaisyUI component variants, stripping theme definitions, or simplifying Hugo partial structures that exist for valid responsive/accessibility reasons.

- **Mitigation**: Project-specific safeguards added to Phase D (see "Note on distill"). The skill must include a "Project Safeguard" block that prevents removing DaisyUI accessibility variants, Hugo responsive partials, and OKLCH theme variables.

## Performance Considerations

_Added by red team review (sp:04)._

### Skill Loading Impact

Adding 18 new skill directories has **minimal performance impact**:

- Skills use directory-based auto-discovery with on-demand lazy loading
- Reference documents are only loaded when a skill is invoked, not at startup
- Expected size per skill: 20-80 KB (well within normal range)

No mitigation needed — the architecture handles this efficiently.

### Reference Document Context Budget

The 7 reference documents in `design-frontend/references/` will be loaded into Claude Code's context window when `design-frontend` is invoked. If these documents are large, they could consume significant context budget.

- **Mitigation**: During Phase C, review the total size of all 7 reference documents. If combined size exceeds ~50 KB, consider:
  1. Condensing reference docs to essential guidance only (removing verbose examples)
  2. Having the skill load specific references on-demand rather than all at once
  3. Adding a note in the skill to "Read `references/color-and-contrast.md` only when working on color" rather than loading all references upfront

## Accessibility Requirements

_Added by red team review (sp:04)._

### WCAG Version Currency

Imported skills that reference accessibility standards should reference WCAG 2.2 (current) rather than older versions. The existing `tailwind-daisyui-design` skill targets WCAG AAA compliance.

- **Mitigation**: During Phase D adaptation, check all accessibility references in imported skills for WCAG version. Update any references to WCAG 2.0 or 2.1 to note WCAG 2.2 where criteria have changed. Ensure `design-audit` and `design-harden` align with the project's AAA compliance target.

### Consistency with Existing A11y Guidance

The project already has accessibility guidance in `tailwind-daisyui-design` (form-accessibility.md) and `daisyui-design-system-generator` (WCAG AAA color themes). Imported skills (`design-audit`, `design-harden`, `design-adapt`) must not lower the bar.

- **Mitigation**: Imported accessibility guidance must reference the project's AAA target (not just AA). Cross-reference existing accessibility resources in each imported skill that touches a11y.
