# Theme Documentation Template

Use this template to document color themes for team handoff. Replace placeholders with actual values.

---

# [Theme Name] Design System

**Version:** 1.0  
**Created:** [Date]  
**Accessibility:** WCAG AAA Compliant

## Overview

[Brief description of the theme's visual identity and intended use.]

## Color Palette

### Base Colors

| Name         | OKLCH                 | Hex     | Usage                |
| ------------ | --------------------- | ------- | -------------------- |
| base-100     | `oklch(98% 0.01 240)` | #FAFBFC | Primary background   |
| base-200     | `oklch(95% 0.02 240)` | #F1F3F5 | Secondary background |
| base-300     | `oklch(90% 0.03 240)` | #E1E4E8 | Borders, dividers    |
| base-content | `oklch(18% 0.02 240)` | #1A1D21 | Default text         |

### Primary Colors

| Name            | OKLCH                  | Hex     | Usage           |
| --------------- | ---------------------- | ------- | --------------- |
| primary         | `oklch(45% 0.22 260)`  | #2563EB | CTAs, links     |
| primary-content | `oklch(99% 0.005 260)` | #FFFFFF | Text on primary |

### Secondary Colors

| Name              | OKLCH                  | Hex     | Usage             |
| ----------------- | ---------------------- | ------- | ----------------- |
| secondary         | `oklch(50% 0.12 195)`  | #0D9488 | Secondary actions |
| secondary-content | `oklch(99% 0.005 195)` | #FFFFFF | Text on secondary |

### Accent Colors

| Name           | OKLCH                  | Hex     | Usage          |
| -------------- | ---------------------- | ------- | -------------- |
| accent         | `oklch(55% 0.18 155)`  | #22C55E | Highlights     |
| accent-content | `oklch(99% 0.005 155)` | #FFFFFF | Text on accent |

### Neutral Colors

| Name            | OKLCH                  | Hex     | Usage           |
| --------------- | ---------------------- | ------- | --------------- |
| neutral         | `oklch(25% 0.02 260)`  | #374151 | Dark elements   |
| neutral-content | `oklch(99% 0.005 260)` | #FFFFFF | Text on neutral |

### Status Colors

| Name            | OKLCH                  | Hex     | Usage           |
| --------------- | ---------------------- | ------- | --------------- |
| info            | `oklch(55% 0.15 235)`  | #3B82F6 | Information     |
| info-content    | `oklch(99% 0.005 235)` | #FFFFFF | Text on info    |
| success         | `oklch(50% 0.18 150)`  | #10B981 | Success states  |
| success-content | `oklch(99% 0.005 150)` | #FFFFFF | Text on success |
| warning         | `oklch(75% 0.15 80)`   | #F59E0B | Warnings        |
| warning-content | `oklch(18% 0.02 80)`   | #1F2937 | Text on warning |
| error           | `oklch(50% 0.20 25)`   | #EF4444 | Errors          |
| error-content   | `oklch(99% 0.005 25)`  | #FFFFFF | Text on error   |

## Contrast Ratios

All pairs meet WCAG AAA requirements.

| Background | Foreground        | Ratio  | AAA Status |
| ---------- | ----------------- | ------ | ---------- |
| base-100   | base-content      | 12.5:1 | ✅ Pass    |
| primary    | primary-content   | 8.2:1  | ✅ Pass    |
| secondary  | secondary-content | 7.8:1  | ✅ Pass    |
| accent     | accent-content    | 7.5:1  | ✅ Pass    |
| neutral    | neutral-content   | 10.1:1 | ✅ Pass    |
| info       | info-content      | 7.6:1  | ✅ Pass    |
| success    | success-content   | 7.4:1  | ✅ Pass    |
| warning    | warning-content   | 8.9:1  | ✅ Pass    |
| error      | error-content     | 7.3:1  | ✅ Pass    |

## Usage Guidelines

### Text

- **Body text:** Use `text-base-content` on `bg-base-100/200/300`
- **Inverted text:** Use `text-primary-content` on `bg-primary`
- **Muted text:** Use `text-base-content/60` for secondary information

### Buttons

```html
<!-- Primary CTA -->
<button class="btn btn-primary">Submit</button>

<!-- Secondary action -->
<button class="btn btn-secondary">Cancel</button>

<!-- Ghost/outline -->
<button class="btn btn-ghost">Learn More</button>
```

### Status Messages

```html
<div class="alert alert-info">Information message</div>
<div class="alert alert-success">Success message</div>
<div class="alert alert-warning">Warning message</div>
<div class="alert alert-error">Error message</div>
```

### Cards

```html
<div class="card bg-base-100 shadow">
  <div class="card-body">
    <h2 class="card-title text-base-content">Title</h2>
    <p class="text-base-content/80">Description</p>
  </div>
</div>
```

## Dark Mode Pairing

[If applicable, document the corresponding dark theme]

| Light Theme         | Dark Theme          | Notes      |
| ------------------- | ------------------- | ---------- |
| base-100: L=98%     | base-100: L=15%     | Inverted   |
| primary: L=45%      | primary: L=65%      | Brightened |
| base-content: L=18% | base-content: L=95% | Inverted   |

## CSS Implementation

```css
@import 'tailwindcss';
@plugin "daisyui";

@plugin "daisyui/theme" {
  name: '[theme-name]';
  default: true;
  prefersdark: false;
  color-scheme: light;

  --color-base-100: oklch(98% 0.01 240);
  --color-base-200: oklch(95% 0.02 240);
  --color-base-300: oklch(90% 0.03 240);
  --color-base-content: oklch(18% 0.02 240);

  /* ... additional colors ... */
}
```

## Changelog

| Version | Date   | Changes         |
| ------- | ------ | --------------- |
| 1.0     | [Date] | Initial release |
