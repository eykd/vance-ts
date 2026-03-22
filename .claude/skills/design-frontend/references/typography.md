<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: design-frontend
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-21 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

# Typography

> **Stack Integration**: Use `@tailwindcss/typography` for prose content (`prose` class) and Tailwind's font utilities (`text-sm`, `text-lg`, `font-bold`) for UI text. DaisyUI inherits Tailwind's typography. See `/tailwind-daisyui-design` typography-readability reference for application patterns.

## Classic Typography Principles

### Vertical Rhythm

Your line-height should be the base unit for ALL vertical spacing. If body text has `leading-normal` (1.5) on `text-base` (16px) = 24px, spacing values should be multiples of 24px (Tailwind: `gap-6`). This creates subconscious harmony.

### Modular Scale & Hierarchy

The common mistake: too many font sizes that are too close together. This creates muddy hierarchy.

**Use fewer sizes with more contrast.** Tailwind's default scale works well:

| Role | Tailwind Class           | Size    | Use Case               |
| ---- | ------------------------ | ------- | ---------------------- |
| xs   | `text-xs`                | 12px    | Captions, legal        |
| sm   | `text-sm`                | 14px    | Secondary UI, metadata |
| base | `text-base`              | 16px    | Body text              |
| lg   | `text-lg` / `text-xl`    | 18-20px | Subheadings, lead text |
| xl+  | `text-2xl` to `text-5xl` | 24-48px | Headlines, hero text   |

### Readability & Measure

Use `max-w-prose` (Tailwind, ~65ch) for text content. Line-height scales inversely with line length — narrow columns need tighter leading, wide columns need more.

**Non-obvious**: Increase line-height for light text on dark backgrounds. The perceived weight is lighter, so text needs more breathing room.

## Font Selection & Pairing

### Choosing Distinctive Fonts

**Avoid the invisible defaults**: Inter, Roboto, Open Sans, Lato, Montserrat. They're everywhere, making your design feel generic.

**Better Google Fonts alternatives**:

- Instead of Inter -> **Instrument Sans**, **Plus Jakarta Sans**, **Outfit**
- Instead of Roboto -> **Onest**, **Figtree**, **Urbanist**
- Instead of Open Sans -> **Source Sans 3**, **Nunito Sans**, **DM Sans**
- For editorial/premium feel -> **Fraunces**, **Newsreader**, **Lora**

**System fonts are underrated**: `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui` looks native, loads instantly, and is highly readable.

### Pairing Principles

**The non-obvious truth**: You often don't need a second font. One well-chosen font family in multiple weights creates cleaner hierarchy than two competing typefaces. Only add a second font when you need genuine contrast.

When pairing, contrast on multiple axes:

- Serif + Sans (structure contrast)
- Geometric + Humanist (personality contrast)
- Condensed display + Wide body (proportion contrast)

**Never pair fonts that are similar but not identical** — they create visual tension without clear hierarchy.

### Web Font Loading

> **Hugo pattern**: Preload fonts in `baseof.html` and use `font-display: swap`:

```html
<!-- In Hugo baseof.html head -->
<link rel="preload" href="/fonts/custom.woff2" as="font" type="font/woff2" crossorigin />
```

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
}

/* Match fallback metrics to minimize layout shift */
@font-face {
  font-family: 'CustomFont-Fallback';
  src: local('Arial');
  size-adjust: 105%;
  ascent-override: 90%;
  descent-override: 20%;
  line-gap-override: 10%;
}
```

## Modern Web Typography

### Fluid Type

Fluid typography via `clamp(min, preferred, max)` scales text smoothly:

```css
.hero-title {
  font-size: clamp(2rem, 5vw + 1rem, 4rem);
}
```

**Use fluid type for**: Headings and display text on marketing/content pages.

**Use fixed `rem` scales for**: App UIs, dashboards, and data-dense interfaces. No major design system uses fluid type in product UI — fixed scales give spatial predictability. Body text should also be fixed.

### OpenType Features

```css
/* Tabular numbers for data alignment */
.data-table {
  font-variant-numeric: tabular-nums;
}

/* Proper fractions */
.recipe-amount {
  font-variant-numeric: diagonal-fractions;
}

/* Small caps for abbreviations */
abbr {
  font-variant-caps: all-small-caps;
}

/* Disable ligatures in code */
code {
  font-variant-ligatures: none;
}
```

## Accessibility Considerations

- **Never disable zoom**: `user-scalable=no` breaks accessibility
- **Use rem/em for font sizes**: Respects user browser settings. Never `px` for body text
- **Minimum 16px body text**: Smaller strains eyes and fails WCAG on mobile
- **Adequate touch targets**: Text links need padding or line-height creating 44px+ tap targets

---

**Avoid**: More than 2-3 font families per project. Skipping fallback font definitions. Ignoring font loading performance (FOUT/FOIT). Using decorative fonts for body text.

**Related skill**: `/design-typeset` — typography refinement and font selection strategy
**Related skill**: `/tailwind-daisyui-design` — typography-readability reference for application patterns
