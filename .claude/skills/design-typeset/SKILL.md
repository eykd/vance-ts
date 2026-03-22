<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: typeset
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-22 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

---

name: design-typeset
description: Improve typography by fixing font choices, hierarchy, sizing, weight consistency, and readability. Makes text feel intentional and polished. Provides font selection and hierarchy strategy — complements tailwind-daisyui-design which provides prose classes and readability rules.
args:

- name: target
  description: The feature or component to improve typography for (optional)
  required: false
  user-invocable: true

---

Assess and improve typography that feels generic, inconsistent, or poorly structured — turning default-looking text into intentional, well-crafted type.

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide.

**Related skill**: `/tailwind-daisyui-design` — for Tailwind prose classes and DaisyUI typography conventions (see `references/typography-readability.md`)

---

## Assess Current Typography

Analyze what's weak or generic about the current type:

1. **Font choices**:
   - Are we using invisible defaults? (Inter, Roboto, Arial, Open Sans, system defaults)
   - Does the font match the brand personality? (A playful brand shouldn't use a corporate typeface)
   - Are there too many font families? (More than 2-3 is almost always a mess)

2. **Hierarchy**:
   - Can you tell headings from body from captions at a glance?
   - Are font sizes too close together? (14px, 15px, 16px = muddy hierarchy)
   - Are weight contrasts strong enough? (Medium vs Regular is barely visible)

3. **Sizing & scale**:
   - Is there a consistent type scale, or are sizes arbitrary? — Tailwind provides `text-xs` through `text-9xl`
   - Does body text meet minimum readability? (16px+ / `text-base`)
   - Is the sizing strategy appropriate for the context? (Fixed `rem` scales for app UIs; fluid `clamp()` for marketing/content page headings)

4. **Readability**:
   - Are line lengths comfortable? (45-75 characters ideal) — use `max-w-prose` or `max-w-[65ch]`
   - Is line-height appropriate for the font and context? — use Tailwind `leading-*` utilities
   - Is there enough contrast between text and background?

5. **Consistency**:
   - Are the same elements styled the same way throughout?
   - Are font weights used consistently? (Not bold in one section, semibold in another for the same role)
   - Is letter-spacing intentional or default everywhere? — use Tailwind `tracking-*` utilities

**CRITICAL**: The goal isn't to make text "fancier" — it's to make it clearer, more readable, and more intentional. Good typography is invisible; bad typography is distracting.

## Plan Typography Improvements

Consult the typography reference from the `/design-frontend` skill (see `references/typography.md` in that skill's directory) for detailed guidance on scales, pairing, and loading strategies.

Create a systematic plan:

- **Font selection**: Do fonts need replacing? What fits the brand/context?
- **Type scale**: Establish a modular scale (e.g., 1.25 ratio) using Tailwind's type scale or custom values
- **Weight strategy**: Which weights serve which roles? (Regular for body, Semibold for labels, Bold for headings — or whatever fits)
- **Spacing**: Line-heights (`leading-*`), letter-spacing (`tracking-*`), and margins between typographic elements

## Improve Typography Systematically

### Font Selection

If fonts need replacing:

- Choose fonts that reflect the brand personality
- Pair with genuine contrast (serif + sans, geometric + humanist) — or use a single family in multiple weights
- Ensure web font loading doesn't cause layout shift (`font-display: swap`, metric-matched fallbacks)
- Configure fonts in `hugo/assets/css/styles.css` using `@font-face` or in `hugo.toml` params

### Establish Hierarchy

Build a clear type scale:

- **5 sizes cover most needs**: `text-xs`/`text-sm` (caption), `text-sm` (secondary), `text-base` (body), `text-lg`/`text-xl` (subheading), `text-2xl`+ (heading)
- **Use a consistent ratio** between levels (1.25, 1.333, or 1.5)
- **Combine dimensions**: Size + weight (`font-semibold`, `font-bold`) + color (`text-base-content`, `text-primary`) + space for strong hierarchy — don't rely on size alone
- **App UIs**: Use a fixed `rem`-based type scale, optionally adjusted at 1-2 breakpoints via Tailwind responsive prefixes
- **Marketing / content pages**: Use fluid sizing via `clamp(min, preferred, max)` for headings and display text. Keep body text fixed. In Hugo layouts, use Tailwind arbitrary values: `text-[clamp(1.5rem,4vw,3rem)]`

### Fix Readability

- Set `max-width` on text containers: `max-w-prose` (65ch) or `max-w-[65ch]`
- Adjust line-height per context: `leading-tight` for headings (1.1-1.2), `leading-relaxed` or `leading-loose` for body (1.5-1.7)
- Increase line-height slightly for light-on-dark text
- Ensure body text is at least `text-base` (16px / 1rem)
- For long-form content, use DaisyUI's `prose` class from `@tailwindcss/typography`

### Refine Details

- Use `tabular-nums` (Tailwind: `tabular-nums`) for data tables and numbers that should align
- Apply proper `letter-spacing`: `tracking-wide` for small caps and uppercase, `tracking-tight` for large display text
- Use semantic token names (`--text-body`, `--text-heading`), not value names (`--font-16`)
- Set `font-kerning: normal` and consider OpenType features where appropriate

### Weight Consistency

- Define clear roles for each weight and stick to them — use Tailwind: `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- Don't use more than 3-4 weights (Regular, Medium, Semibold, Bold is plenty)
- Load only the weights you actually use (each weight adds to page load)

**NEVER**:

- Use more than 2-3 font families
- Pick sizes arbitrarily — commit to Tailwind's type scale or a custom modular scale
- Set body text below 16px (`text-base`)
- Use decorative/display fonts for body text
- Disable browser zoom (`user-scalable=no`)
- Use `px` for font sizes — use `rem` (Tailwind's default) to respect user settings
- Default to Inter/Roboto/Open Sans when personality matters
- Pair fonts that are similar but not identical (two geometric sans-serifs)

## Verify Typography Improvements

- **Hierarchy**: Can you identify heading vs body vs caption instantly?
- **Readability**: Is body text comfortable to read in long passages?
- **Consistency**: Are same-role elements styled identically throughout?
- **Personality**: Does the typography reflect the brand?
- **Performance**: Are web fonts loading efficiently without layout shift?
- **Accessibility**: Does text meet WCAG contrast ratios? Is it zoomable to 200%?

Remember: Typography is the foundation of interface design — it carries the majority of information. Getting it right is the highest-leverage improvement you can make.
