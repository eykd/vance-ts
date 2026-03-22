<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: frontend-design
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-21 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

# Spatial Design

> **Stack Integration**: Tailwind CSS 4 provides a spacing scale (`p-1` = 4px through `p-16` = 64px) and layout utilities (`flex`, `grid`, `gap-*`). DaisyUI adds layout components like `card`, `stack`, `divider`. Use Tailwind's spacing for rhythm; DaisyUI's components for structure.

## Spacing Systems

### Use 4pt Base, Not 8pt

8pt systems are too coarse — you'll frequently need 12px (between 8 and 16). Use 4pt for granularity.

| Tailwind Class    | Pixels | Use Case                              |
| ----------------- | ------ | ------------------------------------- |
| `gap-1` / `p-1`   | 4px    | Tight: icon-to-text, inline elements  |
| `gap-2` / `p-2`   | 8px    | Compact: list items, form labels      |
| `gap-3` / `p-3`   | 12px   | Default: card padding, button padding |
| `gap-4` / `p-4`   | 16px   | Comfortable: section padding          |
| `gap-6` / `p-6`   | 24px   | Generous: between sections            |
| `gap-8` / `p-8`   | 32px   | Large: major separations              |
| `gap-12` / `p-12` | 48px   | XL: page sections                     |
| `gap-16` / `p-16` | 64px   | Hero spacing                          |

### Use `gap` Instead of Margins

Use `gap` for sibling spacing — it eliminates margin collapse and cleanup hacks:

```html
<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Grid Systems

### The Self-Adjusting Grid

```html
<!-- Responsive grid without breakpoints -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
  <div class="card">...</div>
  <div class="card">...</div>
  <div class="card">...</div>
</div>
```

Columns are at least 280px, as many as fit per row, leftovers stretch.

For complex layouts, use named grid areas and redefine them at breakpoints.

## Visual Hierarchy

### The Squint Test

Blur your eyes (or screenshot and blur). Can you still identify the most important element? The second? Clear groupings? If everything looks the same weight blurred, you have a hierarchy problem.

### Hierarchy Through Multiple Dimensions

Don't rely on size alone. Combine:

| Tool         | Strong Hierarchy             | Weak Hierarchy                 |
| ------------ | ---------------------------- | ------------------------------ |
| **Size**     | 3:1 ratio or more            | <2:1 ratio                     |
| **Weight**   | `font-bold` vs `font-normal` | `font-medium` vs `font-normal` |
| **Color**    | High contrast                | Similar tones                  |
| **Position** | Top/left (primary)           | Bottom/right                   |
| **Space**    | Surrounded by whitespace     | Crowded                        |

**The best hierarchy uses 2-3 dimensions at once**: A heading that's `text-3xl font-bold` with `mt-12 mb-4` spacing.

### Cards Are Not Required

Cards are overused. Spacing and alignment create visual grouping naturally. Use cards only when content is truly distinct and actionable, needs visual comparison in a grid, or needs clear interaction boundaries.

**Never nest cards inside cards** — use spacing, typography, and DaisyUI `divider` for hierarchy within a card.

## Container Queries

Viewport queries are for page layouts. **Container queries are for components**:

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    grid-template-columns: 120px 1fr;
  }
}
```

A card in a narrow sidebar stays compact; the same card in main content expands — automatically.

## Optical Adjustments

Text at `margin-left: 0` looks indented due to letterform whitespace — use negative margin (`-0.05em`) to optically align. Geometrically centered icons often look off-center.

### Touch Targets vs Visual Size

Buttons can look small but need large touch targets (44px minimum). Use padding or pseudo-elements:

```html
<!-- DaisyUI btn classes handle minimum touch targets -->
<button class="btn btn-sm">Small but tappable</button>

<!-- For custom icon buttons -->
<button class="btn btn-ghost btn-square">
  <svg class="w-5 h-5">...</svg>
</button>
```

## Depth & Elevation

Create semantic z-index scales (dropdown -> sticky -> modal-backdrop -> modal -> toast -> tooltip). For shadows, create a consistent elevation scale.

**Key insight**: Shadows should be subtle — if you can clearly see it, it's probably too strong. Use Tailwind's `shadow-sm`, `shadow`, `shadow-md` scale.

---

**Avoid**: Arbitrary spacing values outside the Tailwind scale. Making all spacing equal (variety creates hierarchy). Creating hierarchy through size alone — combine size, weight, color, and space.

**Related skill**: `/design-arrange` — layout composition strategy
**Related skill**: `/ui-design-language` — structured vocabulary for describing spatial layouts
