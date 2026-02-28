# Color Roles & Tone Mapping

## Brand Color Roles

| Vocabulary Role | DaisyUI Name                      | Tailwind Utility                      | Purpose                              |
| --------------- | --------------------------------- | ------------------------------------- | ------------------------------------ |
| primary         | `primary` / `primary-content`     | `bg-primary text-primary-content`     | Main brand color, primary CTAs       |
| secondary       | `secondary` / `secondary-content` | `bg-secondary text-secondary-content` | Supporting brand, secondary actions  |
| accent          | `accent` / `accent-content`       | `bg-accent text-accent-content`       | Highlights, badges, attention detail |
| chrome          | `neutral` / `neutral-content`     | `bg-neutral text-neutral-content`     | Structural interface chrome          |

## Surface Colors (Chrome Surfaces)

| Role             | DaisyUI Name   | Use                                                   |
| ---------------- | -------------- | ----------------------------------------------------- |
| Page background  | `base-100`     | `bg-base-100` — lightest surface                      |
| Raised surface   | `base-200`     | `bg-base-200` — cards, sidebars                       |
| Border/divider   | `base-300`     | `bg-base-300` / `border-base-300` — borders, dividers |
| Text on surfaces | `base-content` | `text-base-content` — default body text               |

## Semantic Tones

| Vocabulary Tone | DaisyUI Name                  | Tailwind Utility                  | Purpose                          |
| --------------- | ----------------------------- | --------------------------------- | -------------------------------- |
| success         | `success` / `success-content` | `bg-success text-success-content` | Positive outcomes, confirmations |
| destructive     | `error` / `error-content`     | `bg-error text-error-content`     | Danger, deletion, errors         |
| warning         | `warning` / `warning-content` | `bg-warning text-warning-content` | Caution, attention required      |
| info            | `info` / `info-content`       | `bg-info text-info-content`       | Informational (DaisyUI addition) |

## Content Color Pairing

Every `*-content` color is the foreground for its corresponding background. DaisyUI components enforce this automatically — `btn-primary` sets both `bg-primary` and `text-primary-content`.

## Luminance Variation

DaisyUI does not expose 5 steps per semantic color. Two mechanisms approximate this:

- **Base trio**: `base-100`, `base-200`, `base-300` give 3 graduated surface steps
- **Opacity modifiers**: `bg-primary/50`, `text-primary-content/60` provide smooth variation
- **Custom extensions**: Define `--color-primary-muted` in theme and register with `@theme`

## Theme Definition (OKLCH recommended)

```css
@import 'tailwindcss';
@plugin "daisyui";

@plugin "daisyui/theme" {
  name: 'my-brand-light';
  default: true;
  color-scheme: light;

  --color-base-100: oklch(99% 0.005 240);
  --color-base-200: oklch(96% 0.01 240);
  --color-base-300: oklch(92% 0.015 240);
  --color-base-content: oklch(18% 0.02 240);

  --color-primary: oklch(45% 0.22 260);
  --color-primary-content: oklch(99% 0.005 260);
  --color-secondary: oklch(50% 0.12 195);
  --color-secondary-content: oklch(99% 0.005 195);
  --color-accent: oklch(55% 0.18 155);
  --color-accent-content: oklch(99% 0.005 155);
  --color-neutral: oklch(25% 0.02 260);
  --color-neutral-content: oklch(99% 0.005 260);

  --color-success: oklch(50% 0.18 150);
  --color-success-content: oklch(99% 0.005 150);
  --color-warning: oklch(75% 0.15 80);
  --color-warning-content: oklch(18% 0.02 80);
  --color-error: oklch(50% 0.2 25);
  --color-error-content: oklch(99% 0.005 25);
  --color-info: oklch(55% 0.15 235);
  --color-info-content: oklch(99% 0.005 235);
}
```

## Dark Mode

Same class names, different theme values. Define a paired dark theme:

```css
@plugin "daisyui/theme" {
  name: 'my-brand-dark';
  prefersdark: true;
  color-scheme: dark;

  --color-base-100: oklch(15% 0.01 240);
  --color-base-200: oklch(12% 0.015 240);
  --color-base-300: oklch(20% 0.02 240);
  --color-base-content: oklch(95% 0.01 240);

  --color-primary: oklch(65% 0.2 260);
  --color-primary-content: oklch(12% 0.02 260);
  /* ... remaining colors adjusted for dark backgrounds */
}
```

No conditional classes needed. The vocabulary sentence stays the same; only the rendered values change.
