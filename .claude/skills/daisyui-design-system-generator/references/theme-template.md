# DaisyUI 5 Theme Template

## Contents

1. [Theme CSS Structure](#theme-css-structure)
2. [Color Variables](#color-variables)
3. [Light Theme Example](#light-theme-example)
4. [Dark Theme Example](#dark-theme-example)
5. [Effect Variables](#effect-variables)

## Theme CSS Structure

DaisyUI 5 themes are defined using the `@plugin "daisyui/theme"` directive:

```css
@import 'tailwindcss';
@plugin "daisyui";

@plugin "daisyui/theme" {
  name: 'mytheme-light';
  default: true; /* Set as default theme */
  prefersdark: false; /* Not the prefers-color-scheme:dark theme */
  color-scheme: light; /* Browser UI color scheme */

  /* Base colors */
  --color-base-100: oklch(98% 0.01 240);
  --color-base-200: oklch(95% 0.02 240);
  --color-base-300: oklch(90% 0.03 240);
  --color-base-content: oklch(20% 0.02 240);

  /* Primary */
  --color-primary: oklch(50% 0.2 260);
  --color-primary-content: oklch(98% 0.01 260);

  /* Secondary */
  --color-secondary: oklch(60% 0.15 200);
  --color-secondary-content: oklch(98% 0.01 200);

  /* Accent */
  --color-accent: oklch(65% 0.2 150);
  --color-accent-content: oklch(15% 0.02 150);

  /* Neutral */
  --color-neutral: oklch(35% 0.02 260);
  --color-neutral-content: oklch(98% 0.01 260);

  /* Status colors */
  --color-info: oklch(65% 0.18 230);
  --color-info-content: oklch(15% 0.02 230);

  --color-success: oklch(60% 0.2 145);
  --color-success-content: oklch(15% 0.02 145);

  --color-warning: oklch(80% 0.18 85);
  --color-warning-content: oklch(20% 0.03 85);

  --color-error: oklch(55% 0.22 25);
  --color-error-content: oklch(98% 0.01 25);
}
```

## Color Variables

### Base Colors

| Variable               | Purpose              | Typical Usage                 |
| ---------------------- | -------------------- | ----------------------------- |
| `--color-base-100`     | Primary background   | Page background, cards        |
| `--color-base-200`     | Secondary background | Sidebars, alternate sections  |
| `--color-base-300`     | Tertiary background  | Borders, dividers             |
| `--color-base-content` | Default text         | Body text on base backgrounds |

### Semantic Colors

Each semantic color has a paired `-content` color for text/icons on that background:

| Color       | Background Use     | Content Use                  |
| ----------- | ------------------ | ---------------------------- |
| `primary`   | CTA buttons, links | Text on primary background   |
| `secondary` | Secondary actions  | Text on secondary background |
| `accent`    | Highlights, badges | Text on accent background    |
| `neutral`   | Dark UI elements   | Text on neutral background   |

### Status Colors

| Color     | Purpose            | Content Contrast               |
| --------- | ------------------ | ------------------------------ |
| `info`    | Information alerts | Needs 7:1 with info-content    |
| `success` | Success states     | Needs 7:1 with success-content |
| `warning` | Warning alerts     | Needs 7:1 with warning-content |
| `error`   | Error states       | Needs 7:1 with error-content   |

## Light Theme Example

AAA-compliant light theme with blue primary:

```css
@plugin "daisyui/theme" {
  name: 'brand-light';
  default: true;
  prefersdark: false;
  color-scheme: light;

  /* Base: near-white backgrounds, dark text */
  --color-base-100: oklch(99% 0.005 240); /* L=99% */
  --color-base-200: oklch(96% 0.01 240); /* L=96% */
  --color-base-300: oklch(92% 0.015 240); /* L=92% */
  --color-base-content: oklch(18% 0.02 240); /* L=18%, ratio ~12:1 */

  /* Primary: medium blue, white text */
  --color-primary: oklch(45% 0.22 260); /* L=45% */
  --color-primary-content: oklch(99% 0.005 260); /* L=99%, ratio ~8:1 */

  /* Secondary: teal */
  --color-secondary: oklch(50% 0.12 195);
  --color-secondary-content: oklch(99% 0.005 195);

  /* Accent: emerald */
  --color-accent: oklch(55% 0.18 155);
  --color-accent-content: oklch(99% 0.005 155);

  /* Neutral: dark slate */
  --color-neutral: oklch(25% 0.02 260);
  --color-neutral-content: oklch(99% 0.005 260);

  /* Status */
  --color-info: oklch(55% 0.15 235);
  --color-info-content: oklch(99% 0.005 235);

  --color-success: oklch(50% 0.18 150);
  --color-success-content: oklch(99% 0.005 150);

  --color-warning: oklch(75% 0.15 80);
  --color-warning-content: oklch(18% 0.02 80);

  --color-error: oklch(50% 0.2 25);
  --color-error-content: oklch(99% 0.005 25);
}
```

## Dark Theme Example

AAA-compliant dark theme paired with light theme above:

```css
@plugin "daisyui/theme" {
  name: 'brand-dark';
  default: false;
  prefersdark: true;
  color-scheme: dark;

  /* Base: dark backgrounds, light text */
  --color-base-100: oklch(15% 0.01 240); /* L=15% */
  --color-base-200: oklch(12% 0.015 240); /* L=12% */
  --color-base-300: oklch(20% 0.02 240); /* L=20% */
  --color-base-content: oklch(95% 0.01 240); /* L=95%, ratio ~12:1 */

  /* Primary: brighter blue for dark mode */
  --color-primary: oklch(65% 0.2 260); /* L=65% */
  --color-primary-content: oklch(12% 0.02 260); /* L=12%, ratio ~8:1 */

  /* Secondary: brighter teal */
  --color-secondary: oklch(70% 0.12 195);
  --color-secondary-content: oklch(12% 0.02 195);

  /* Accent: brighter emerald */
  --color-accent: oklch(72% 0.16 155);
  --color-accent-content: oklch(12% 0.02 155);

  /* Neutral: medium gray */
  --color-neutral: oklch(30% 0.01 260);
  --color-neutral-content: oklch(95% 0.005 260);

  /* Status - adjusted for dark backgrounds */
  --color-info: oklch(70% 0.14 235);
  --color-info-content: oklch(12% 0.02 235);

  --color-success: oklch(68% 0.16 150);
  --color-success-content: oklch(12% 0.02 150);

  --color-warning: oklch(80% 0.14 80);
  --color-warning-content: oklch(15% 0.02 80);

  --color-error: oklch(65% 0.18 25);
  --color-error-content: oklch(12% 0.02 25);
}
```

## Effect Variables

DaisyUI 5 supports optional visual effects:

```css
@plugin "daisyui/theme" {
  name: 'mytheme';
  /* ... color variables ... */

  /* Effects (0 = disabled, 1 = enabled) */
  --depth: 1; /* Subtle depth/shadow on buttons */
  --noise: 0; /* Texture noise effect */
}
```
