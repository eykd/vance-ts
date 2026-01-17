---
name: hugo-tailwind-daisyui-design
description: Design frontend for Hugo static sites using TailwindCSS 4 + DaisyUI 5. Use when creating or redesigning Hugo site themes, layouts, or components. Conducts a focused design interview, then coordinates with daisyui-design-system-generator (for OKLCH color themes) and tailwind-daisyui-design (for component patterns). Covers baseof.html, styles.css, page layouts, partials, and hero sections.
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

## Phase 1: Design Interview

On invocation, review any context the user provides, then interview to fill gaps. Ask **one question at a time**. Stop when direction is clear.

### Interview Framework

**Question priority** (ask in order, skip if already known):

1. **Purpose**: "What is this site for—blog, portfolio, product, documentation, or something else?"
2. **Tone**: "Pick a word: professional, playful, minimal, bold, elegant, technical, or describe your own."
3. **Reference**: "Any sites or styles you admire? Even a vague 'like Apple' or 'like a newspaper' helps."
4. **Colors**: "Do you have brand colors, or should I propose a palette based on the tone?"
5. **Typography**: "Preference for serif, sans-serif, monospace, or mixed? Any specific fonts?"

**Interview rules:**

- If user provides detailed input upfront, acknowledge it and skip covered questions
- Accept short answers ("minimal", "blue", "no preference")
- After 3-4 answers, summarize direction and confirm before proceeding
- If user says "surprise me" or similar, make opinionated choices and explain them

### Capturing Direction

After interview, produce a brief **Design Direction Summary**:

```
Site type: [blog/portfolio/product/docs/other]
Aesthetic: [1-3 descriptive words]
Color approach: [brand colors / proposed palette / defer to theme skill]
Typography: [font strategy]
Key differentiator: [what makes this memorable]
```

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
