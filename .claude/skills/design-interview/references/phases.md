# Design Workflow Phases

Detailed definitions and templated prompts for each phase of the design workflow orchestrated by `design-interview`.

## Phase Navigation

Phases are non-linear. Use this decision tree to jump to the right phase:

- **Starting fresh?** → Phase 1 (Interview)
- **Have Design Context, need colors?** → Phase 2 (Theme)
- **Have theme, need components?** → Phase 3 (Components)
- **Have components, need templates?** → Phase 4 (Implement)
- **Design feels off?** → Phase 5 (Refine)
- **Need quality check?** → Phase 6 (Review)
- **Preparing for production?** → Phase 7 (Harden)

**Quick Mode**: If a `## Design Context` section exists in CLAUDE.md, skip Phase 1 and jump directly to the needed phase. Reference the existing context when invoking skills.

---

## Phase 2: Theme

Generate an OKLCH color theme using `daisyui-design-system-generator`.

**When to enter**: After completing the Design Interview (Phase 1) or when redesigning the color system.

**Templated prompt**:

> `/daisyui-design-system-generator` — "Create a DaisyUI 5 OKLCH theme for a [aesthetic] [site-type]. Primary color: [color/direction]. Include light and dark modes. Target WCAG AAA contrast. Brand personality: [3 words from Design Context]."

**Output**: CSS variables for `assets/css/styles.css` with `@plugin "daisyui/theme"` syntax.

**Next**: Proceed to Phase 3 (Components) or Phase 4 (Implement).

---

## Phase 3: Components

Build accessible component patterns using `tailwind-daisyui-design`.

**When to enter**: After theme generation, or when adding new component types.

**Templated prompt**:

> `/tailwind-daisyui-design` — "Build [component-type] for a [aesthetic] [site-type]. Use the existing DaisyUI theme. Requirements: [specific needs]. Target WCAG [level] accessibility."

**Skill routing by component type**:

| Need                            | Skill                        | Prompt Focus                        |
| ------------------------------- | ---------------------------- | ----------------------------------- |
| Navigation, cards, forms        | `tailwind-daisyui-design`    | Component patterns, accessibility   |
| Form validation, loading states | `htmx-pattern-library`       | HTMX interaction patterns           |
| Component selection guidance    | `design-language-to-daisyui` | Map descriptions to DaisyUI classes |

**Next**: Proceed to Phase 4 (Implement) or Phase 5 (Refine).

---

## Phase 4: Implement

Create Hugo layouts, HTMX interactions, and Alpine.js components.

**When to enter**: After component patterns are defined, or when building new pages/partials.

**Templated prompts by task**:

| Task                  | Skill                        | Prompt                                                                                                         |
| --------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Hugo layouts          | `/hugo-templates`            | "Create [layout-type] for [page]. Use DaisyUI components: [list]. Include HTMX endpoints: [list]."             |
| Interactive partials  | `/htmx-alpine-templates`     | "Build [interaction] partial. HTMX swap: [strategy]. Alpine.js state: [describe]. DaisyUI components: [list]." |
| Server HTML responses | `/typescript-html-templates` | "Create HTML response for [endpoint]. Return partial with HX-Trigger: [event]. DaisyUI markup: [describe]."    |

**Motion hierarchy** (prioritize in order):

1. **CSS animations** — Default choice for all motion
2. **Alpine.js transitions** — When CSS isn't sufficient for interactivity
3. **Vanilla JavaScript** — Only when Alpine.js capabilities are exceeded

See [design-patterns.md](design-patterns.md) for hero sections, card grids, and motion techniques.
See [hugo-templates.md](hugo-templates.md) for file responsibilities and layout patterns.

**Next**: Proceed to Phase 5 (Refine) or Phase 6 (Review).

---

## Phase 5: Refine

Adjust visual intensity, color, typography, layout, motion, and personality. Choose the sub-skill that matches the design need.

**When to enter**: After initial implementation, when the design needs adjustment. Re-enter as many times as needed.

**Skill routing by need**:

### Too safe or boring?

> `/design-bolder` — "Amplify the design of [component/page]. Current state: [describe what exists]. Make it more visually striking while keeping it usable. Design Context: [reference]."

### Too aggressive or overwhelming?

> `/design-quieter` — "Tone down [component/page]. Current state: [describe]. Reduce visual intensity while preserving design quality and distinctiveness."

### Needs strategic color?

> `/design-colorize` — "Add strategic color to [component/page]. Current palette: [list OKLCH values]. Brand personality: [3 words]. Target: [specific goal — emphasis, hierarchy, emotion]."

### Typography needs work?

> `/design-typeset` — "Improve typography in [area]. Current fonts: [list]. Current scale: [describe]. Goals: [readability/hierarchy/personality]. Use @tailwindcss/typography prose classes."

### Layout or spacing feels off?

> `/design-arrange` — "Improve layout and spacing of [component/page]. Current structure: [describe]. Issues: [what feels wrong]. Use DaisyUI layout components and Tailwind spacing scale."

### Needs motion or animation?

> `/design-animate` — "Add motion to [component/interaction]. Trigger: [scroll/hover/load/state-change]. Style: [subtle/bold/playful]. Respect prefers-reduced-motion. Use CSS animations first, Alpine.js x-transition if needed."

### Needs personality or delight?

> `/design-delight` — "Add personality to [component/page]. Brand personality: [3 words]. Current state: [describe]. Add moments of joy without sacrificing usability."

### Need ruthless simplification?

> `/design-distill` — "Simplify [component/page]. Current state: [describe complexity]. Remove everything non-essential while preserving core function and design quality."

### Want technically ambitious effects?

> `/design-overdrive` — "Create [ambitious effect] for [component]. Inspiration: [reference]. Constraints: must work without JavaScript where possible, degrade gracefully."

**Next**: Iterate within Phase 5, or proceed to Phase 6 (Review).

---

## Phase 6: Review

Evaluate design quality, identify issues, and polish. Run skills in sequence for a comprehensive review, or pick individual skills for focused evaluation.

**When to enter**: After implementation and refinement, before production hardening. Re-enter after making changes.

### Full review sequence

Run these in order for a comprehensive quality pass:

**Step 1: Critique** — Identify UX issues

> `/design-critique` — "Evaluate the UX of [page/flow]. Check: information hierarchy, interaction patterns, cognitive load, error handling, empty states. Design Context: [reference]."

**Step 2: Audit** — Comprehensive quality check

> `/design-audit` — "Audit [page/component] for quality. Check: accessibility (WCAG [level]), color contrast, focus management, semantic HTML, responsive behavior, loading states."

**Step 3: Polish** — Final quality refinement

> `/design-polish` — "Polish [page/component]. Check: pixel alignment, consistent spacing, typography rhythm, color consistency, hover/focus states, transition smoothness. Use DaisyUI semantic colors only."

**Step 4: Clarify** — UX copy and microcopy

> `/design-clarify` — "Improve UX copy in [page/flow]. Check: button labels, error messages, empty states, tooltips, confirmation dialogs. Cross-reference with `/hugo-copywriting` style guide."

**Next**: Address findings, re-enter Phase 5 (Refine) if needed, or proceed to Phase 7 (Harden).

---

## Phase 7: Harden

Prepare the design for production. Ensure resilience across devices, browsers, and edge cases.

**When to enter**: After review phase is complete and design is approved. This is the final phase before shipping.

**Skill routing by concern**:

### Production resilience

> `/design-harden` — "Harden [page/component] for production. Check: error states, loading skeletons, offline behavior, slow network handling, content overflow, extreme data lengths, missing images."

### Responsive and cross-device

> `/design-adapt` — "Ensure [page/component] works across devices. Check: mobile/tablet/desktop breakpoints, touch targets (min 44px), landscape/portrait, viewport units, container queries. Use Tailwind responsive prefixes (sm:/md:/lg:)."

### Design system alignment

> `/design-normalize` — "Align [page/component] with the design system. Check: consistent use of DaisyUI semantic colors, spacing scale adherence, typography scale consistency, component variant usage, dark mode behavior."

### Onboarding flows

> `/design-onboard` — "Design onboarding for [feature/flow]. Consider: first-time user experience, progressive disclosure, contextual help, empty states that guide action, feature discovery."

**Next**: Ship it. Return to any phase if post-launch feedback requires changes.

---

## Phase Transitions Summary

```
Phase 1 (Interview) ──→ Phase 2 (Theme) ──→ Phase 3 (Components)
                                                      │
                                                      ▼
Phase 7 (Harden) ←── Phase 6 (Review) ←── Phase 5 (Refine) ←── Phase 4 (Implement)
       │                    │                    │
       │                    │                    └── re-enter as needed
       │                    └── re-enter after fixes
       └── return to any phase based on feedback
```
