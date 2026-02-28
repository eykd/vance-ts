# Spacing, Sizing & Spatial Tokens

## The Named Scale

A single 7-step scale applies to ALL spatial properties: padding, gap, font size, radius, shadow, control height, icon size.

| Vocabulary Name    | Shorthand | Typical Role                                        |
| ------------------ | --------- | --------------------------------------------------- |
| extra-small        | `xs`      | Tight internal gaps, thin borders, icon details     |
| small              | `sm`      | Compact padding, minor gaps, small text             |
| medium             | `md`      | Default padding/gaps, body text, standard controls  |
| large              | `lg`      | Comfortable padding, prominent gaps, large controls |
| extra-large        | `xl`      | Generous padding, section spacing, headlines        |
| double-extra-large | `2xl`     | Major section breaks, hero spacing                  |
| triple-extra-large | `3xl`     | Maximum breathing room, splash screens              |

## Spacing (Padding & Gap) → Tailwind

| Vocabulary Step    | Tailwind Class    | Value   |
| ------------------ | ----------------- | ------- |
| extra-small        | `p-1` / `gap-1`   | 0.25rem |
| small              | `p-2` / `gap-2`   | 0.5rem  |
| medium             | `p-4` / `gap-4`   | 1rem    |
| large              | `p-6` / `gap-6`   | 1.5rem  |
| extra-large        | `p-8` / `gap-8`   | 2rem    |
| double-extra-large | `p-12` / `gap-12` | 3rem    |
| triple-extra-large | `p-16` / `gap-16` | 4rem    |

Also: `px-*`, `py-*`, `pt-*`, `pb-*`, `pl-*`, `pr-*` for directional padding. `m-*` variants for margin.

## Component Sizing → DaisyUI Modifiers

DaisyUI components accept `xs`, `sm`, `md`, `lg`, `xl` modifiers that scale height, padding, font size, and internal proportions together via an internal `--size` CSS variable.

| Vocabulary Step | DaisyUI Modifier | Example                           |
| --------------- | ---------------- | --------------------------------- |
| extra-small     | `*-xs`           | `btn-xs`, `badge-xs`, `input-xs`  |
| small           | `*-sm`           | `btn-sm`, `card-sm`, `input-sm`   |
| medium          | `*-md`           | `btn-md`, `input-md`, `toggle-md` |
| large           | `*-lg`           | `btn-lg`, `input-lg`, `tab-lg`    |
| extra-large     | `*-xl`           | `btn-xl`, `card-xl`, `dock-xl`    |

## Border Radius → DaisyUI Semantic Tokens

| Vocabulary Concept     | DaisyUI Utility | Theme Variable   | Use                      |
| ---------------------- | --------------- | ---------------- | ------------------------ |
| Container radius       | `rounded-box`   | `--radius-box`   | Cards, modals, dropdowns |
| Field/button radius    | `rounded-field` | `--radius-field` | Inputs, buttons, selects |
| Badge/indicator radius | `rounded-badge` | `--radius-badge` | Badges, tags, pills      |

Plus Tailwind built-ins: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`, `rounded-none`

## Border Width

Theme variable `--border` controls base border width across all components. Change once, propagates everywhere.

## Shadow & Depth → Tailwind + DaisyUI

Tailwind shadows (ascending weight): `shadow-sm` → `shadow` → `shadow-md` → `shadow-lg` → `shadow-xl` → `shadow-2xl`

DaisyUI theme variables:

- `--depth: 1` enables subtle depth effect on interactive components (buttons, checkboxes, toggles). `0` disables.
- `--noise: 1` adds textured grain to surfaces. `0` disables.

## Theme Spatial Configuration

```css
@plugin "daisyui/theme" {
  name: 'my-theme';
  /* ... colors ... */

  --radius-box: 1rem;
  --radius-field: 0.5rem;
  --radius-badge: 1.9rem;
  --border: 1px;
  --depth: 1;
  --noise: 0;
}
```
