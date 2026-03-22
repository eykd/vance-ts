<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: design-frontend
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-21 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

---

name: design-frontend
description: Reference hub for design principles, anti-patterns, and the AI Slop Test. Invoked by design-\* skills for aesthetic guidelines, Context Gathering Protocol, and quality checks. Use when you need design direction, want to avoid generic AI aesthetics, or need the Context Gathering Protocol before design work. Not a workflow orchestrator — see /design-interview for guided workflows.

---

Reference hub for distinctive, production-grade frontend design. Contains aesthetic guidelines, anti-patterns, and quality checks that all `design-*` skills depend on.

## Context Gathering Protocol

Design skills produce generic output without project context. You MUST have confirmed design context before doing any design work.

**Required context** — every design skill needs at minimum:

- **Target audience**: Who uses this product and in what context?
- **Use cases**: What jobs are they trying to get done?
- **Brand personality/tone**: How should the interface feel?

Individual skills may require additional context — check the skill's preparation section.

**Gathering order:**

1. **Check CLAUDE.md (instant)**: Look for a `## Design Context` section in the project's CLAUDE.md files. If it contains the required context, proceed immediately.
2. **Run `/design-interview` (if needed)**: If no design context exists, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke — let the user decide.

---

## Design Direction

Commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc.
- **Constraints**: Technical requirements (DaisyUI theme, Hugo template structure, accessibility level).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

Then implement working code that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

### Typography

_See [references/typography.md](references/typography.md) for scales, pairing, and loading strategies._

Choose fonts that are beautiful, unique, and interesting. Pair a distinctive display font with a refined body font.

**DO**: Use a modular type scale with fluid sizing (`clamp()`); vary font weights and sizes for clear hierarchy
**DON'T**: Use overused fonts (Inter, Roboto, Arial, Open Sans, system defaults); use monospace as lazy shorthand for "technical" vibes; put large icons with rounded corners above every heading

### Color & Theme

_See [references/color-and-contrast.md](references/color-and-contrast.md) for OKLCH, palettes, and dark mode._

Commit to a cohesive palette using DaisyUI semantic color roles (`primary`, `secondary`, `accent`, `neutral`). Dominant colors with sharp accents outperform timid, evenly-distributed palettes.

**DO**: Use OKLCH color functions via DaisyUI theme variables; tint neutrals toward your brand hue
**DON'T**: Use gray text on colored backgrounds; use pure black/white; use the AI color palette (cyan-on-dark, purple-to-blue gradients, neon accents); use gradient text for "impact"; default to dark mode with glowing accents

### Layout & Space

_See [references/spatial-design.md](references/spatial-design.md) for grids, rhythm, and container queries._

Create visual rhythm through varied spacing. Embrace asymmetry and unexpected compositions.

**DO**: Create rhythm through varied spacing; use `clamp()` for fluid spacing; use asymmetry and break the grid intentionally
**DON'T**: Wrap everything in cards; nest cards inside cards; use identical card grids; use the hero metric layout template; center everything; use the same spacing everywhere

### Visual Details

**DO**: Use intentional, purposeful decorative elements that reinforce brand
**DON'T**: Use glassmorphism everywhere; use rounded elements with thick colored border on one side; use sparklines as decoration; use rounded rectangles with generic drop shadows; use modals unless truly necessary

### Motion

_See [references/motion-design.md](references/motion-design.md) for timing, easing, and reduced motion._

Focus on high-impact moments: one well-orchestrated page load with staggered reveals beats scattered micro-interactions. Use CSS transitions, Alpine.js `x-transition`, and the Web Animations API.

**DO**: Use motion for state changes; use exponential easing (ease-out-quart/quint/expo); use `grid-template-rows` transitions for height
**DON'T**: Animate layout properties (use `transform` and `opacity` only); use bounce or elastic easing

### Interaction

_See [references/interaction-design.md](references/interaction-design.md) for forms, focus, and loading patterns._

Make interactions feel fast. Use optimistic UI via HTMX `hx-swap` with progressive disclosure through Alpine.js `x-show`.

**DO**: Use progressive disclosure (basic first, advanced behind expandable sections); design teaching empty states; make every interactive surface feel responsive
**DON'T**: Repeat the same information; make every button primary — use DaisyUI `btn-ghost`, `btn-link`, `btn-outline` for hierarchy

### Responsive

_See [references/responsive-design.md](references/responsive-design.md) for mobile-first, fluid design, and container queries._

**DO**: Use container queries (`@container`) for component-level responsiveness; use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) for viewport-level adaptation
**DON'T**: Hide critical functionality on mobile — adapt the interface, don't amputate it

### UX Writing

_See [references/ux-writing.md](references/ux-writing.md) for labels, errors, and empty states._

**Related skill**: `/hugo-copywriting` — for long-form content and editorial style guidance

**DO**: Make every word earn its place
**DON'T**: Repeat information users can already see

---

## The AI Slop Test

**Critical quality check**: If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, that's the problem.

A distinctive interface should make someone ask "how was this made?" not "which AI made this?"

Review the DON'T guidelines above — they are the fingerprints of AI-generated work from 2024-2025.

---

## Implementation Principles

Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code. Minimalist designs need restraint, precision, and careful attention to spacing, typography, and subtle details.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes (via DaisyUI `data-theme`), different fonts, different aesthetics. NEVER converge on common choices across generations.
