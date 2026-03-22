<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: design-frontend
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-21 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

# Color & Contrast

> **DaisyUI 5 Integration**: This project uses DaisyUI's semantic color system with OKLCH values defined via `data-theme`. Map the concepts below to DaisyUI roles: `primary`, `secondary`, `accent`, `neutral`, `base-100/200/300`, `info`, `success`, `warning`, `error`. Use `/daisyui-design-system-generator` to create WCAG AAA-compliant themes.

## Color Spaces: Use OKLCH

**Stop using HSL.** Use OKLCH (or LCH) instead. It's perceptually uniform, meaning equal steps in lightness _look_ equal — unlike HSL where 50% lightness in yellow looks bright while 50% in blue looks dark.

```css
/* OKLCH: lightness (0-100%), chroma (0-0.4+), hue (0-360) */
--color-primary: oklch(60% 0.15 250); /* Blue */
--color-primary-light: oklch(85% 0.08 250); /* Same hue, lighter */
--color-primary-dark: oklch(35% 0.12 250); /* Same hue, darker */
```

**Key insight**: As you move toward white or black, reduce chroma (saturation). High chroma at extreme lightness looks garish.

## Building Functional Palettes

### The Tinted Neutral Trap

**Pure gray is dead.** Add a subtle hint of your brand hue to all neutrals:

```css
/* Dead grays */
--gray-100: oklch(95% 0 0); /* No personality */
--gray-900: oklch(15% 0 0);

/* Warm-tinted grays (add brand warmth) */
--gray-100: oklch(95% 0.01 60); /* Hint of warmth */
--gray-900: oklch(15% 0.01 60);

/* Cool-tinted grays (tech, professional) */
--gray-100: oklch(95% 0.01 250); /* Hint of blue */
--gray-900: oklch(15% 0.01 250);
```

The chroma is tiny (0.01) but perceptible. It creates subconscious cohesion.

> **DaisyUI mapping**: DaisyUI's `base-100`, `base-200`, `base-300` serve as your tinted neutrals. Define them with OKLCH values that carry your brand hue.

### Palette Structure

| Role          | Purpose                  | DaisyUI Token                         |
| ------------- | ------------------------ | ------------------------------------- |
| **Primary**   | Brand, CTAs, key actions | `primary` / `primary-content`         |
| **Secondary** | Supporting actions       | `secondary` / `secondary-content`     |
| **Accent**    | Highlights, emphasis     | `accent` / `accent-content`           |
| **Neutral**   | Text, borders            | `neutral` / `neutral-content`         |
| **Surface**   | Backgrounds              | `base-100`, `base-200`, `base-300`    |
| **Semantic**  | Feedback states          | `info`, `success`, `warning`, `error` |

**Skip extra accent colors unless you need them.** Most apps work fine with primary + one accent. Adding more creates decision fatigue.

### The 60-30-10 Rule (Applied Correctly)

- **60%**: Neutral backgrounds (`base-100`), white space, base surfaces
- **30%**: Secondary colors — text (`neutral-content`), borders, inactive states
- **10%**: Accent — CTAs (`primary`), highlights, focus states

The common mistake: using the accent color everywhere because it's "the brand color." Accent colors work _because_ they're rare.

## Contrast & Accessibility

### WCAG Requirements

| Content Type                    | AA Minimum | AAA Target |
| ------------------------------- | ---------- | ---------- |
| Body text                       | 4.5:1      | 7:1        |
| Large text (18px+ or 14px bold) | 3:1        | 4.5:1      |
| UI components, icons            | 3:1        | 4.5:1      |
| Non-essential decorations       | None       | None       |

**The gotcha**: Placeholder text still needs 4.5:1. That light gray placeholder you see everywhere? Usually fails WCAG.

> **DaisyUI note**: Use `/daisyui-design-system-generator` to generate themes with WCAG AAA contrast ratios. The generator validates all `*-content` colors against their backgrounds.

### Dangerous Color Combinations

- Light gray text on white (the #1 accessibility fail)
- **Gray text on any colored background** — gray looks washed out. Use a darker shade of the background color, or transparency
- Red text on green (8% of men can't distinguish these)
- Blue text on red (vibrates visually)
- Yellow text on white (almost always fails)
- Thin light text on images (unpredictable contrast)

### Never Use Pure Gray or Pure Black

Pure gray (`oklch(50% 0 0)`) and pure black (`#000`) don't exist in nature. Even a chroma of 0.005-0.01 is enough to feel natural.

## Theming: Light & Dark Mode

### Dark Mode Is Not Inverted Light Mode

| Light Mode         | Dark Mode                                       |
| ------------------ | ----------------------------------------------- |
| Shadows for depth  | Lighter surfaces for depth (no shadows)         |
| Dark text on light | Light text on dark (reduce font weight)         |
| Vibrant accents    | Desaturate accents slightly                     |
| White backgrounds  | Never pure black — use dark gray (oklch 12-18%) |

> **DaisyUI mapping**: Define separate `[data-theme="light"]` and `[data-theme="dark"]` themes. DaisyUI handles theme switching via the `data-theme` attribute on `<html>`.

```css
/* Dark mode depth via surface color, not shadow */
[data-theme='dark'] {
  --b1: oklch(15% 0.01 250); /* base-100 */
  --b2: oklch(20% 0.01 250); /* base-200: "higher" = lighter */
  --b3: oklch(25% 0.01 250); /* base-300 */
}
```

### Token Hierarchy

Use two layers: primitive tokens (`--blue-500`) and semantic tokens (`--color-primary: var(--blue-500)`). DaisyUI's theme system handles this — define semantic roles, not raw values.

## Alpha Is A Design Smell

Heavy use of transparency usually means an incomplete palette. Alpha creates unpredictable contrast and performance overhead. Define explicit overlay colors for each context instead. Exception: focus rings and interactive states where see-through is needed.

---

**Avoid**: Relying on color alone to convey information. Creating palettes without clear roles. Using pure black (#000) for large areas. Skipping color blindness testing (8% of men affected).

**Related skill**: `/daisyui-design-system-generator` — generate WCAG AAA-compliant OKLCH color themes
**Related skill**: `/design-colorize` — strategic color guidance for adding color to existing designs
