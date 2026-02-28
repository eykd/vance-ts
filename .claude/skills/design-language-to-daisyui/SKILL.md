---
name: design-language-to-daisyui
description: Map natural-language UI screen descriptions to DaisyUI 5 + Tailwind CSS 4 utility classes. Use when building, prototyping, or implementing frontend interfaces described in plain English — e.g. "a primary solid button size large," "a card with a vertical stack," or any UI component description that should become HTML with DaisyUI/Tailwind classes. Also use when the user provides a wireframe, mockup description, or component spec and wants working HTML output.
---

# Design Language → DaisyUI 5 / Tailwind CSS 4

Translate vocabulary-driven UI descriptions into concrete HTML with DaisyUI 5 component classes and Tailwind CSS 4 utilities. Based on the "Stop Designing in Pixels" design vocabulary.

## Translation Workflow

1. **Parse** the description into vocabulary sentences — identify each element's **tone**, **size**, **emphasis**, and **shape**
2. **Map** each vocabulary word to its DaisyUI/Tailwind class using the quick reference below
3. **Compose** the classes on HTML elements, nesting with box-primitive layout utilities
4. **Apply** theme-level tokens (color roles, radius, border, depth) via DaisyUI theme config when needed

For detailed mapping tables, load the appropriate reference:

| Need                              | Reference                                                              |
| --------------------------------- | ---------------------------------------------------------------------- |
| Color roles & tone mapping        | [references/color-tone.md](references/color-tone.md)                   |
| Spacing, sizing & spatial tokens  | [references/spacing-size.md](references/spacing-size.md)               |
| Component patterns (~30 patterns) | [references/patterns-components.md](references/patterns-components.md) |
| Emphasis levels & shape details   | [references/emphasis-shape.md](references/emphasis-shape.md)           |

## Quick Reference Card

### Vocabulary Sentence → Class Composition

Each UI element is described as: **[tone] [emphasis] [component] size [size]**

Example: `"primary soft badge size small"` → `badge badge-soft badge-primary badge-sm`

### Tone → DaisyUI Color Modifier

primary → `*-primary` · secondary → `*-secondary` · accent → `*-accent` · chrome/neutral → `*-neutral` · success → `*-success` · destructive → `*-error` · warning → `*-warning` · info → `*-info`

### Size → DaisyUI Size Modifier

extra-small → `*-xs` · small → `*-sm` · medium → `*-md` · large → `*-lg` · extra-large → `*-xl`

### Emphasis → DaisyUI Style Modifier

solid → _(default, no modifier)_ · outline → `*-outline` · ghost → `*-ghost` · soft → `*-soft` · dash → `*-dash` · link → `btn-link`

### Shape → Tailwind Utilities

default → _(theme radius)_ · pill → `rounded-full` · square → `rounded-none` · circle → `rounded-full` (equal w/h) · Buttons: `btn-circle`, `btn-square`

### Box Primitive (Layout) → Tailwind Utilities

vertical stack → `flex flex-col` · horizontal stack → `flex flex-row` · wrap → `flex flex-row flex-wrap` · overlay → `grid` or `relative`/`absolute` · gap → `gap-{1,2,4,6,8,12,16}` · padding → `p-{1,2,4,6,8,12,16}` · align main → `justify-{start,center,end,between}` · align cross → `items-{start,center,end,stretch}`

### Surface Colors (chrome/background)

page bg → `bg-base-100` · raised surface → `bg-base-200` · border/divider tone → `bg-base-300` / `border-base-300` · text on surfaces → `text-base-content`

### Responsive Modifiers

Any DaisyUI modifier can be prefixed with Tailwind breakpoints: `btn-sm md:btn-md lg:btn-lg`

## Composition Examples

| Description                            | HTML Classes                                      |
| -------------------------------------- | ------------------------------------------------- |
| primary solid button size large        | `btn btn-primary btn-lg`                          |
| chrome ghost button size small         | `btn btn-ghost btn-neutral btn-sm`                |
| destructive outline button size medium | `btn btn-outline btn-error btn-md`                |
| success solid alert                    | `alert alert-success`                             |
| warning soft alert, horizontal         | `alert alert-soft alert-warning alert-horizontal` |
| chrome outline card, pad large         | `card card-border bg-base-100 p-6`                |
| primary soft badge size small          | `badge badge-soft badge-primary badge-sm`         |

## Key Rules

- **Solid emphasis is the default** — no modifier class needed. `btn btn-primary` is already solid.
- **`*-content` colors are automatic** — DaisyUI pairs foreground text with background automatically on components.
- **Card borders** use `card-border` (outline) or `card-dash` (dashed), not the emphasis modifiers directly.
- **Opacity suffixes** work on any color: `bg-primary/50`, `text-base-content/60` for luminance variation.
- **Theme radius tokens**: `rounded-box` (cards/modals), `rounded-field` (inputs/buttons), `rounded-badge` (badges/pills).
