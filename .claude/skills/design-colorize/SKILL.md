---
name: design-colorize
description: Add strategic color to features that are too monochromatic or lack visual interest. Provides color strategy (when/where to add color) — complements daisyui-design-system-generator which generates OKLCH themes. Use when interfaces feel gray, flat, or lack visual warmth.
args:
  - name: target
    description: The feature or component to colorize (optional)
    required: false
    user-invocable: true
---

Strategically introduce color to designs that are too monochromatic, gray, or lacking in visual warmth and personality.

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide. Additionally gather: existing brand colors.

**Related skill**: `/daisyui-design-system-generator` — defers to this skill for generating OKLCH color themes
**Related skill**: `/tailwind-daisyui-design` — for semantic color application patterns (see `references/color-usage.md`)

---

## Assess Color Opportunity

Analyze the current state and identify opportunities:

1. **Understand current state**:
   - **Color absence**: Pure grayscale? Limited neutrals? One timid accent?
   - **Missed opportunities**: Where could color add meaning, hierarchy, or delight?
   - **Context**: What's appropriate for this domain and audience?
   - **Brand**: Are there existing brand colors we should use?

2. **Identify where color adds value**:
   - **Semantic meaning**: Success (green), error (red), warning (yellow/orange), info (blue) — map to DaisyUI's `success`, `error`, `warning`, `info` semantic colors
   - **Hierarchy**: Drawing attention to important elements — use DaisyUI `primary`, `secondary`, `accent`
   - **Categorization**: Different sections, types, or states
   - **Emotional tone**: Warmth, energy, trust, creativity
   - **Wayfinding**: Helping users navigate and understand structure
   - **Delight**: Moments of visual interest and personality

If any of these are unclear from the codebase, ask the user.

**CRITICAL**: More color ≠ better. Strategic color beats rainbow vomit every time. Every color should have a purpose.

## Plan Color Strategy

Create a purposeful color introduction plan:

- **Color palette**: What colors match the brand/context? (Choose 2-4 colors max beyond neutrals) — define via DaisyUI theme in `styles.css` using OKLCH values
- **Dominant color**: Which color owns 60% of colored elements? — typically maps to DaisyUI `primary`
- **Accent colors**: Which colors provide contrast and highlights? (30% and 10%) — maps to DaisyUI `secondary` and `accent`
- **Application strategy**: Where does each color appear and why?

**IMPORTANT**: Color should enhance hierarchy and meaning, not create chaos. Less is more when it matters more.

## Introduce Color Strategically

Add color systematically across these dimensions:

### Semantic Color

- **State indicators** — use DaisyUI semantic color classes:
  - Success: `text-success`, `bg-success`, `alert-success`
  - Error: `text-error`, `bg-error`, `alert-error`
  - Warning: `text-warning`, `bg-warning`, `alert-warning`
  - Info: `text-info`, `bg-info`, `alert-info`
  - Neutral: `text-neutral`, `bg-neutral` for inactive states

- **Status badges**: Use DaisyUI `badge badge-success`, `badge-warning`, etc. for states (active, pending, completed)
- **Progress indicators**: DaisyUI `progress` or `radial-progress` with semantic colors

### Accent Color Application

- **Primary actions**: Use DaisyUI `btn-primary` for the most important buttons/CTAs
- **Links**: Use `link link-primary` or `link-hover` for clickable text (maintain accessibility)
- **Icons**: Colorize key icons with `text-primary`, `text-accent` for recognition and personality
- **Headers/titles**: Add color to section headers using `text-primary` or `text-accent`
- **Hover states**: Introduce color on interaction — DaisyUI components handle this automatically

### Background & Surfaces

- **Tinted backgrounds**: Replace pure gray with DaisyUI `base-200`, `base-300` surfaces or warm neutrals (`oklch(97% 0.01 60)`)
- **Colored sections**: Use `bg-primary/10`, `bg-secondary/10` for subtle background tints
- **Gradient backgrounds**: Add depth with subtle, intentional gradients (not generic purple-blue)
- **Cards & surfaces**: DaisyUI `card` with `bg-base-100` or tinted backgrounds

**Use OKLCH for custom colors**: It's perceptually uniform, meaning equal steps in lightness _look_ equal. DaisyUI 5 uses OKLCH natively for its theme system.

### Data Visualization

- **Charts & graphs**: Use color to encode categories or values
- **Heatmaps**: Color intensity shows density or importance
- **Comparison**: Color coding for different datasets or timeframes

### Borders & Accents

- **Accent borders**: Use `border-l-4 border-primary` or `border-t-2 border-accent` on cards or sections
- **Underlines**: Color underlines for emphasis — `decoration-primary`
- **Dividers**: DaisyUI `divider` component instead of plain gray lines
- **Focus rings**: `focus:ring-primary` for colored focus indicators matching brand

### Typography Color

- **Colored headings**: Use `text-primary` or `text-secondary` for section headings (maintain contrast)
- **Highlight text**: `text-accent` for emphasis or categories
- **Labels & tags**: DaisyUI `badge` components with semantic colors for metadata

### Decorative Elements

- **Illustrations**: Add colored illustrations or icons
- **Shapes**: Geometric shapes in brand colors as background elements
- **Gradients**: Colorful gradient overlays or mesh backgrounds
- **Blobs/organic shapes**: Soft colored shapes for visual interest

## Balance & Refinement

Ensure color addition improves rather than overwhelms:

### Maintain Hierarchy

- **Dominant color** (60%): `primary` — the main brand color
- **Secondary color** (30%): `secondary` — supporting variety
- **Accent color** (10%): `accent` — high contrast for key moments
- **Neutrals** (remaining): `base-100`/`base-200`/`base-300` and `neutral` for structure

### Accessibility

- **Contrast ratios**: Ensure WCAG compliance (4.5:1 for text, 3:1 for UI components) — DaisyUI semantic colors are designed with contrast in mind, but verify custom combinations
- **Don't rely on color alone**: Use icons, labels, or patterns alongside color
- **Test for color blindness**: Verify red/green combinations work for all users

### Cohesion

- **Consistent palette**: Use colors from the DaisyUI theme, not arbitrary choices
- **Systematic application**: Same color meanings throughout (green always = success)
- **Temperature consistency**: Warm palette stays warm, cool stays cool

**NEVER**:

- Use every color in the rainbow (choose 2-4 colors beyond neutrals)
- Apply color randomly without semantic meaning
- Put gray text on colored backgrounds—it looks washed out; use a darker shade of the background color or transparency instead
- Use pure gray for neutrals—add subtle color tint (warm or cool) for sophistication
- Use pure black (`#000`) or pure white (`#fff`) for large areas — use DaisyUI `base-content` and `base-100`
- Violate WCAG contrast requirements
- Use color as the only indicator (accessibility issue)
- Make everything colorful (defeats the purpose)
- Default to purple-blue gradients (AI slop aesthetic)

## Verify Color Addition

Test that colorization improves the experience:

- **Better hierarchy**: Does color guide attention appropriately?
- **Clearer meaning**: Does color help users understand states/categories?
- **More engaging**: Does the interface feel warmer and more inviting?
- **Still accessible**: Do all color combinations meet WCAG standards?
- **Not overwhelming**: Is color balanced and purposeful?
- **Theme-compatible**: Does it work across all DaisyUI theme variants?

Remember: Color is emotional and powerful. Use it to create warmth, guide attention, communicate meaning, and express personality. But restraint and strategy matter more than saturation and variety. Be colorful, but be intentional.
