# Emphasis Levels & Shape

## Emphasis Spectrum (highest → lowest visual weight)

### 1. Solid (Default)

Full background fill + contrasting content text. Maximum visual weight. No modifier class needed.

Use for: primary CTAs, most important interactive elements.

```html
<button class="btn btn-primary">Save Changes</button>
<div class="alert alert-success">Operation complete.</div>
```

### 2. Soft (New in DaisyUI 5)

Tinted, reduced-opacity background. Gentler than solid, more visible than ghost.

Use for: tags, status indicators, secondary actions that need presence without dominance.

```html
<button class="btn btn-soft btn-primary">Save Draft</button>
<div class="alert alert-soft alert-success">Your changes were saved.</div>
<span class="badge badge-soft badge-accent">New</span>
```

### 3. Outline

Transparent background with colored border + text. Lower visual weight than solid.

Use for: secondary actions that should be clearly interactive but not dominant.

```html
<button class="btn btn-outline btn-primary">Edit Profile</button>
<span class="badge badge-outline badge-warning">Pending</span>
```

### 4. Dash (New in DaisyUI 5)

Dashed border with transparent background. Visually lighter than outline. Connotes "placeholder" or "add new."

Use for: empty states, optional elements, "add" affordances.

```html
<button class="btn btn-dash btn-accent">+ Add Item</button>
<div class="card card-dash p-8">Drop files here</div>
```

### 5. Ghost

No background, no border. Color appears only on hover. Minimal visual weight.

Use for: tertiary actions, icon buttons in toolbars, navigation items.

```html
<button class="btn btn-ghost btn-error">Remove</button>
<button class="btn btn-ghost btn-neutral">Settings</button>
```

### 6. Link

Styled text with no button chrome at all. Lowest visual weight for actions.

Use for: inline actions within text, navigation that should look like a hyperlink.

```html
<button class="btn btn-link">Learn More</button>
```

## Emphasis Modifier Summary

| Level   | Modifier           | Components that support it             |
| ------- | ------------------ | -------------------------------------- |
| solid   | _(none — default)_ | btn, badge, alert, and most components |
| soft    | `*-soft`           | btn, badge, alert                      |
| outline | `*-outline`        | btn, badge, alert                      |
| dash    | `*-dash`           | btn, badge, card (`card-dash`), alert  |
| ghost   | `*-ghost`          | btn, input                             |
| link    | `btn-link`         | btn only                               |

## Shape

### Tailwind Shape Utilities

| Vocabulary Shape | Utility                    | Visual                                                       |
| ---------------- | -------------------------- | ------------------------------------------------------------ |
| default          | _(inherits theme radius)_  | Standard corners from `--radius-field`, `--radius-box`, etc. |
| pill             | `rounded-full`             | Fully rounded ends                                           |
| square           | `rounded-none`             | Sharp 90° corners                                            |
| circle           | `rounded-full` (equal w/h) | Perfect circle                                               |

### DaisyUI Button Shape Helpers

- `btn-circle` — equal width and height, fully rounded (for icon-only buttons)
- `btn-square` — equal width and height, theme radius (for icon-only buttons)

### Theme Radius Tokens

| Token           | Variable         | Default Use              |
| --------------- | ---------------- | ------------------------ |
| `rounded-box`   | `--radius-box`   | Cards, modals, dropdowns |
| `rounded-field` | `--radius-field` | Inputs, buttons, selects |
| `rounded-badge` | `--radius-badge` | Badges, tags, pills      |

These are set once in the theme and propagate to all components.
