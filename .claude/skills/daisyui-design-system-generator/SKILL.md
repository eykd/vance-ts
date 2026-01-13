---
name: daisyui-design-system-generator
description: 'Use when: (1) creating WCAG AAA-compliant DaisyUI 5 color themes, (2) generating OKLCH color palettes, (3) ensuring accessible contrast ratios, (4) documenting themes for team handoff.'
---

# DaisyUI Design System Generator

Generate accessible, coherent OKLCH color themes for DaisyUI 5 with WCAG AAA compliance.

## Quick Reference

**WCAG AAA Requirements:**

- Normal text (<24px, <18.5px bold): **7:1** contrast ratio
- Large text (≥24px, ≥18.5px bold): **4.5:1** contrast ratio
- UI components/graphics: **3:1** contrast ratio

**OKLCH Format:** `oklch(L% C H)` where L=lightness (0-100%), C=chroma (0-0.4), H=hue (0-360°)

## Workflow

### 1. Gather Requirements

Determine brand parameters:

- Primary brand color (hex or OKLCH)
- Light/dark mode requirements
- Target contrast level (AAA recommended)
- Existing color constraints

### 2. Generate Base Theme

Use the theme template in [references/theme-template.md](references/theme-template.md).

For each semantic color pair (`primary`/`primary-content`, etc.), ensure contrast ≥7:1:

- Light mode: dark content on light backgrounds
- Dark mode: light content on dark backgrounds

Run `scripts/contrast_checker.py` to validate all pairs.

### 3. Validate Accessibility

```bash
python3 scripts/contrast_checker.py path/to/theme.css
```

The script reports contrast ratios for all color pairs and flags AAA violations.

### 4. Document Theme

Generate documentation using [references/documentation-template.md](references/documentation-template.md). Include:

- Color swatches with OKLCH and hex values
- Contrast ratios for each pair
- Usage guidelines for each semantic color

## Key Principles

**OKLCH for Accessibility:** OKLCH's perceptual uniformity makes contrast calculation more intuitive—lightness (L) directly correlates with perceived brightness.

**AAA Contrast Heuristics:**

- Light themes: `*-content` colors should have L ≤ 25% for backgrounds with L ≥ 95%
- Dark themes: `*-content` colors should have L ≥ 90% for backgrounds with L ≤ 20%
- For colored backgrounds (primary, secondary), adjust content lightness to achieve 7:1

**Color Harmony:** Keep hue (H) consistent or complementary across semantic colors. Vary chroma (C) for visual hierarchy.

## Files

- [references/theme-template.md](references/theme-template.md) - DaisyUI 5 CSS theme structure with all variables
- [references/oklch-contrast.md](references/oklch-contrast.md) - OKLCH color system and contrast calculation details
- [references/documentation-template.md](references/documentation-template.md) - Theme documentation format for handoff
- [scripts/contrast_checker.py](scripts/contrast_checker.py) - Validate contrast ratios in theme files
