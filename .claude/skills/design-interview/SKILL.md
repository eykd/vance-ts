---
name: design-interview
description: Starting point for all design work. Use when starting a new design task, redesigning UI, planning a site's visual direction, or needing guidance on which design skill to use next. Conducts a structured design interview to establish aesthetic direction, then orchestrates the full design workflow by routing to the right design-* sub-skills at each phase (theme, components, implementation, refinement, review, hardening).
---

# Hugo + TailwindCSS + DaisyUI Design

Design distinctive, accessible Hugo sites. This skill interviews the user to establish design direction, then coordinates implementation with companion skills.

## Workflow Overview

```
1. INTERVIEW    → Establish aesthetic direction (this skill)
2. COLOR THEME  → Generate OKLCH theme (invoke: daisyui-design-system-generator)
3. COMPONENTS   → Build layouts/partials (invoke: tailwind-daisyui-design)
4. IMPLEMENT    → Create Hugo templates (this skill)
```

### Anti-Patterns to Avoid

**CRITICAL:** Avoid converging toward generic "AI slop" aesthetics:

- **Typography**: Never default to Inter, Roboto, Arial, system fonts, or Space Grotesk. Choose distinctive, beautiful fonts that elevate the design.
- **Colors**: Avoid purple gradients on white backgrounds and other clichéd schemes. Commit to cohesive, bold palettes—dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Layouts**: Resist predictable component patterns. Make unexpected choices that feel genuinely designed for the context.
- **Variation**: Think outside the box for EACH project. Vary between light/dark themes, different font families, different aesthetics. Never reuse the same aesthetic twice.

**Design Philosophy:** Create frontends that surprise and delight. Draw from IDE themes, cultural aesthetics, and contextual inspiration rather than generic templates.

## Phase 1: Design Interview

Three steps: scan the codebase, ask structured questions (skipping what the scan already answered), then synthesize a Design Context.

### Step 1: Codebase Scan

Before asking any questions, scan for existing design signals:

- **README / CLAUDE.md** — project description, `## Design Context` section
- **package.json / hugo.toml** — dependencies, theme config, font imports
- **CSS / theme files** — `assets/css/styles.css`, DaisyUI theme variables, custom properties
- **Existing components** — Hugo layouts/partials, Alpine.js components, DaisyUI usage patterns
- **Brand assets** — logos, favicons, color palettes in `static/` or `assets/`
- **Style guides** — any design documentation in `docs/`

Document what was learned. These findings pre-fill the interview — skip questions already answered.

### Step 2: Structured Questions

Ask **one question at a time**. Skip any category fully answered by the codebase scan.

- **Users & Purpose**: Who uses this? What context? What job does the site do? What emotions to evoke?
- **Brand & Personality**: 3-word personality? Reference sites/apps? Anti-references (sites to avoid resembling)?
- **Aesthetic Preferences**: Visual direction (minimal/bold/elegant/playful/technical)? Light/dark/both? Colors to use or avoid? Typography feeling (elegant/technical/bold/friendly/unconventional — distinctive fonts only, no Inter/Roboto)?
- **Accessibility**: Target WCAG level (AA or AAA)? Reduced motion, color blindness, screen reader accommodations?

**Interview rules:** Accept short answers. After 3-4 answers, summarize and confirm. If user says "surprise me," make opinionated choices and explain them.

### Step 3: Design Context Synthesis

After the interview, produce a **Design Context** summary:

```
Users: [who they are, what emotions the experience should evoke]
Brand Personality: [3 words, reference sites, anti-references]
Aesthetic Direction: [visual strategy, light/dark, color approach]
Typography: [font strategy — specify UNIQUE fonts, not defaults]
Accessibility: [WCAG level, specific accommodations]
Design Principles: [3-5 principles derived from the above]
Key Differentiator: [what makes this memorable and unlike other sites]
Creativity Checkpoint: [how will this avoid looking generic?]
```

**Before finalizing:** Verify you're not reusing fonts/aesthetics from previous projects. Ensure bold, distinctive choices.

## Phase 2: Coordinate Theme Generation

With direction established, invoke `daisyui-design-system-generator`:

> "Create a DaisyUI 5 OKLCH theme for a [aesthetic] [site-type]. Primary color: [color/direction]. Include light and dark modes. Target WCAG AAA contrast."

The theme skill will produce CSS for `assets/css/styles.css`.

## Phase 3: Coordinate Component Patterns

Invoke `tailwind-daisyui-design` for specific components:

- **Navigation**: navbar patterns from component-patterns.md
- **Forms**: accessibility patterns from form-accessibility.md
- **Content**: prose styling from typography-readability.md
- **Colors**: semantic usage from color-usage.md

## Phase 4: Hugo Implementation

See [references/hugo-templates.md](references/hugo-templates.md) for:

- File responsibilities and edit priorities
- baseof.html structure
- Layout template patterns
- Partial organization

### Motion Hierarchy

Prioritize in this order:

1. **CSS animations** - Default choice for all motion on HTML
2. **Alpine.js transitions** - When CSS isn't sufficient for interactivity
3. **Vanilla JavaScript** - Only when Alpine.js capabilities are exceeded

Focus on high-impact moments: one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.

See [references/design-patterns.md](references/design-patterns.md) for:

- Hero section variations
- Card grid layouts
- Typography integration
- Motion and atmosphere techniques

## Quick Reference: File Edit Priority

| Priority | File                                      | Design Impact                       |
| -------- | ----------------------------------------- | ----------------------------------- |
| ★★★      | `assets/css/styles.css`                   | Theme colors, fonts, custom classes |
| ★★★      | `layouts/baseof.html`                     | Page structure, SEO, CSS pipeline   |
| ★★       | `layouts/home.html`                       | Landing page, hero integration      |
| ★★       | `layouts/single.html`                     | Post/page reading experience        |
| ★★       | `layouts/list.html`                       | Card grids, section listings        |
| ★        | `layouts/_partials/shared/header.html`    | Navigation, branding                |
| ★        | `layouts/_partials/blocks/home/hero.html` | Hero section                        |

## Key Constraints

- **TailwindCSS 4** syntax (not v3): `@plugin` not `plugins: []`
- **DaisyUI 5** themes: OKLCH colors, `@plugin "daisyui/theme"` syntax
- **Hugo pipes**: CSS processed via `resources.PostCSS`
- **Semantic colors only**: Never raw Tailwind colors (`bg-blue-500`), always DaisyUI (`bg-primary`)
