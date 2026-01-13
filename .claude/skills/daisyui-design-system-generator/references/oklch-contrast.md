# OKLCH Color System & Contrast Calculations

## Contents

1. [OKLCH Basics](#oklch-basics)
2. [WCAG AAA Requirements](#wcag-aaa-requirements)
3. [Contrast Calculation](#contrast-calculation)
4. [Lightness Guidelines](#lightness-guidelines)
5. [Common Hue Values](#common-hue-values)

## OKLCH Basics

OKLCH is a perceptually uniform color space with three components:

| Component         | Range     | Description                               |
| ----------------- | --------- | ----------------------------------------- |
| **L** (Lightness) | 0% - 100% | Perceived brightness (0=black, 100=white) |
| **C** (Chroma)    | 0 - ~0.4  | Color intensity/saturation                |
| **H** (Hue)       | 0° - 360° | Color angle on the color wheel            |

**Syntax:** `oklch(L% C H)` or `oklch(L C H)` (L as decimal)

```css
/* Examples */
--color-blue: oklch(50% 0.2 260); /* Medium saturated blue */
--color-gray: oklch(50% 0.02 260); /* Same lightness, minimal chroma */
--color-white: oklch(100% 0 0); /* Pure white */
--color-black: oklch(0% 0 0); /* Pure black */
```

**Why OKLCH for themes:**

- Lightness (L) directly predicts perceived brightness
- Consistent saturation across hues (unlike HSL)
- P3 wide-gamut support
- CSS native support

## WCAG AAA Requirements

| Text Type                         | Minimum Contrast Ratio |
| --------------------------------- | ---------------------- |
| Normal text (<24px, <18.5px bold) | **7:1**                |
| Large text (≥24px, ≥18.5px bold)  | **4.5:1**              |
| UI components, graphics           | **3:1**                |

**AAA vs AA:**

- AA requires 4.5:1 (normal) / 3:1 (large)
- AAA is stricter: 7:1 (normal) / 4.5:1 (large)
- AAA recommended for better accessibility

## Contrast Calculation

Contrast ratio uses relative luminance (Y):

```
Contrast = (L1 + 0.05) / (L2 + 0.05)
where L1 > L2 (L1 is lighter)
```

### OKLCH Lightness to Luminance (Approximate)

OKLCH lightness correlates with perceived brightness but isn't identical to sRGB luminance. For quick estimation:

| OKLCH L | Approx Luminance | Typical Use       |
| ------- | ---------------- | ----------------- |
| 95-100% | 0.85-1.0         | Light backgrounds |
| 85-95%  | 0.65-0.85        | Light UI elements |
| 50-60%  | 0.20-0.30        | Medium colors     |
| 15-25%  | 0.02-0.05        | Dark text         |
| 0-15%   | 0-0.02           | Dark backgrounds  |

### Quick AAA Contrast Pairs

**Light theme (base L ≥ 95%):**

```
Background L=98%  →  Content L ≤ 25%  (ratio ~10:1)
Background L=95%  →  Content L ≤ 28%  (ratio ~8:1)
```

**Dark theme (base L ≤ 20%):**

```
Background L=15%  →  Content L ≥ 90%  (ratio ~10:1)
Background L=20%  →  Content L ≥ 88%  (ratio ~8:1)
```

**Colored backgrounds:**

```
Primary L=45%  →  Content L ≥ 95%  (white text, ratio ~7:1)
Primary L=65%  →  Content L ≤ 15%  (dark text, ratio ~7:1)
```

## Lightness Guidelines

### Rule of Thumb for 7:1 Contrast

The lightness difference needed depends on the colors involved:

| Background L | Content L Range  | Notes                          |
| ------------ | ---------------- | ------------------------------ |
| 95-100%      | 0-30%            | White/near-white BG, dark text |
| 85-95%       | 0-25%            | Light BG, very dark text       |
| 60-75%       | 0-18% OR 95-100% | Mid tones, use dark OR white   |
| 40-60%       | 95-100%          | Medium BG, white/light text    |
| 15-40%       | 90-100%          | Dark BG, light text            |
| 0-15%        | 85-100%          | Very dark BG, light text       |

### Danger Zone (Hard to Achieve 7:1)

Avoid these background lightness values if AAA is required:

- **L = 50-60%**: Hardest to pair (neither dark nor light text works well)
- Mitigation: Adjust toward L < 45% or L > 65%

## Common Hue Values

Reference hues for building coherent palettes:

| Color  | Hue (H)  | Notes               |
| ------ | -------- | ------------------- |
| Red    | 25-30°   | Error states        |
| Orange | 50-70°   | Warnings            |
| Yellow | 85-95°   | Highlights, caution |
| Green  | 140-160° | Success states      |
| Teal   | 180-200° | Secondary accent    |
| Cyan   | 200-220° | Info states         |
| Blue   | 250-270° | Primary, links      |
| Purple | 290-310° | Accent              |
| Pink   | 340-360° | Accent              |

### Complementary Hue Pairs

For harmonious themes, use complementary or analogous hues:

| Primary Hue   | Complementary | Analogous                  |
| ------------- | ------------- | -------------------------- |
| Blue (260°)   | Orange (60°)  | Purple (290°), Cyan (220°) |
| Green (150°)  | Red (330°)    | Teal (180°), Yellow (90°)  |
| Purple (300°) | Yellow (90°)  | Blue (260°), Pink (340°)   |

## Chroma Guidelines

| C Value   | Result              | Use Case                |
| --------- | ------------------- | ----------------------- |
| 0-0.02    | Near grayscale      | Base colors, neutral    |
| 0.05-0.10 | Subtle tint         | Muted backgrounds       |
| 0.12-0.18 | Moderate saturation | Secondary colors        |
| 0.20-0.30 | Vivid               | Primary, accent         |
| 0.30+     | Very saturated      | Use sparingly, may clip |

**Note:** Maximum achievable chroma varies by hue. Blues/purples support higher C values than yellows/greens in sRGB gamut.
