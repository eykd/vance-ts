# Component Patterns → DaisyUI 5

~30 patterns across 6 categories. Each pattern accepts the four dimensions: tone, size, emphasis, shape.

## Containers

| Pattern                 | DaisyUI Component         | Key Modifiers                                                           |
| ----------------------- | ------------------------- | ----------------------------------------------------------------------- |
| card                    | `card`                    | `card-border` (outline), `card-dash` (dashed), `card-xs` thru `card-xl` |
| modal / dialog          | `modal`                   | Opened via `<dialog>` element or checkbox toggle                        |
| accordion / collapsible | `collapse` or `accordion` | `collapse-arrow`, `collapse-plus`                                       |
| fieldset / form group   | `fieldset`                | Accessible grouping for form elements                                   |

### Card Example

```html
<!-- chrome outline card, pad large -->
<div class="card card-border bg-base-100 p-6">
  <div class="flex flex-col gap-4">
    <h2 class="text-xl font-bold text-base-content">Title</h2>
    <p class="text-sm text-base-content/80">Content</p>
  </div>
</div>
```

## Actions

| Pattern                | DaisyUI Component | Key Modifiers                                                                                                                                                                               |
| ---------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| button                 | `btn`             | Tone: `btn-primary`, `btn-error`, etc. Emphasis: `btn-outline`, `btn-ghost`, `btn-soft`, `btn-dash`, `btn-link`. Size: `btn-xs`–`btn-xl`. Shape: `btn-circle`, `btn-square`, `rounded-full` |
| dropdown               | `dropdown`        | Uses Popover API + anchor positioning in DaisyUI 5                                                                                                                                          |
| swap / toggle action   | `swap`            | Toggles between two states                                                                                                                                                                  |
| floating action button | `fab`             | New in DaisyUI 5; speed-dial variant available                                                                                                                                              |

## Inputs

| Pattern                | DaisyUI Component | Key Modifiers                                         |
| ---------------------- | ----------------- | ----------------------------------------------------- |
| text input             | `input`           | `input-xs`–`input-xl`, `input-primary`, `input-ghost` |
| textarea               | `textarea`        | Same sizing and color patterns as input               |
| select                 | `select`          | Same size/color convention                            |
| checkbox               | `checkbox`        | `checkbox-primary`, `checkbox-sm`, etc.               |
| radio                  | `radio`           | `radio-primary`, `radio-sm`, etc.                     |
| toggle / switch        | `toggle`          | `toggle-primary`, `toggle-sm`–`toggle-xl`             |
| range / slider         | `range`           | `range-primary`, `range-sm`, etc.                     |
| file input             | `file-input`      | Standard sizing pattern                               |
| calendar / date picker | `calendar`        | Compatible with Cally, Pikaday, React Day Picker      |

## Navigation

| Pattern           | DaisyUI Component | Key Modifiers                                                       |
| ----------------- | ----------------- | ------------------------------------------------------------------- |
| navbar            | `navbar`          | Flexible header layout                                              |
| tabs              | `tab`             | `tab-bordered`, `tab-lifted`, `tab-boxed`. Sizes: `tab-xs`–`tab-xl` |
| breadcrumbs       | `breadcrumbs`     | Semantic breadcrumb trail                                           |
| menu              | `menu`            | Vertical link list with optional icons                              |
| dock / bottom nav | `dock`            | New in DaisyUI 5. Sizes: `dock-xs`–`dock-xl`                        |
| pagination        | `pagination`      | Page navigation with join groups                                    |
| steps             | `steps`           | Progress indicator for multi-step flows                             |
| link              | `link`            | `link-primary`, `link-hover`, etc.                                  |

## Content

| Pattern           | DaisyUI Component | Key Modifiers                                                      |
| ----------------- | ----------------- | ------------------------------------------------------------------ |
| badge / tag       | `badge`           | Tone, emphasis (`badge-outline`, `badge-soft`, `badge-dash`), size |
| avatar            | `avatar`          | Supports online/offline indicator                                  |
| stat / key metric | `stat`            | Label, value, optional description                                 |
| table             | `table`           | `table-zebra`, `table-pin-rows`, `table-pin-cols`, sizes           |
| list              | `list`            | New in DaisyUI 5                                                   |
| timeline          | `timeline`        | Horizontal or vertical event sequence                              |
| chat bubble       | `chat`            | `chat-start`, `chat-end`                                           |
| keyboard shortcut | `kbd`             | Keyboard key display                                               |
| countdown         | `countdown`       | Animated number countdown                                          |
| carousel          | `carousel`        | Horizontally scrolling content                                     |

## Feedback

| Pattern              | DaisyUI Component | Key Modifiers                                                                                                                                  |
| -------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| alert / notification | `alert`           | Tone: `alert-success`, `alert-error`, etc. Emphasis: `alert-outline`, `alert-soft`, `alert-dash`. Layout: `alert-vertical`, `alert-horizontal` |
| toast / snackbar     | `toast`           | Positioned container for alerts                                                                                                                |
| loading indicator    | `loading`         | `loading-spinner`, `loading-dots`, `loading-ring`, `loading-ball`. Sizes supported                                                             |
| progress bar         | `progress`        | `progress-primary`, etc.                                                                                                                       |
| radial progress      | `radial-progress` | Circular progress indicator                                                                                                                    |
| skeleton loader      | `skeleton`        | Placeholder for loading content                                                                                                                |
| tooltip              | `tooltip`         | `tooltip-top`, `tooltip-bottom`, etc. Supports HTML content in DaisyUI 5                                                                       |
| status indicator     | `status`          | Small colored dot for online/offline/busy                                                                                                      |

## Box Primitive (Layout)

Every element is a box. Tailwind utilities compose the box primitive:

| Property          | Tailwind Utility                                                    |
| ----------------- | ------------------------------------------------------------------- |
| vertical stack    | `flex flex-col`                                                     |
| horizontal stack  | `flex flex-row`                                                     |
| horizontal wrap   | `flex flex-row flex-wrap`                                           |
| overlay stack     | `grid` (stacked children) or `relative`/`absolute`                  |
| gap               | `gap-*`                                                             |
| padding           | `p-*`, `px-*`, `py-*`                                               |
| align main axis   | `justify-start`, `justify-center`, `justify-end`, `justify-between` |
| align cross axis  | `items-start`, `items-center`, `items-end`, `items-stretch`         |
| fill / background | `bg-base-100`, `bg-primary`, etc.                                   |
| border            | `border`, `border-2` + `border-base-300`                            |
| radius            | `rounded-box`, `rounded-field`, `rounded-lg`, etc.                  |
| shadow            | `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`                     |
| overflow          | `overflow-hidden`, `overflow-auto`, `overflow-visible`              |

### Complex Composition Example

Description: _A chrome outline card, pad large, radius large, shadow small. Inside, a vertical stack, gap medium. Header has a heading extra-large bold. Body has three info rows size small. Footer has a destructive ghost button and a primary solid button, both size medium._

```html
<div class="card card-border bg-base-100 p-6 rounded-lg shadow-sm">
  <div class="flex flex-col gap-4">
    <h2 class="text-xl font-bold text-base-content">Card Title</h2>
    <div class="flex flex-col gap-2">
      <p class="text-sm text-base-content/80">First row of information</p>
      <p class="text-sm text-base-content/80">Second row of information</p>
      <p class="text-sm text-base-content/80">Third row of information</p>
    </div>
    <div class="flex flex-row justify-end gap-2">
      <button class="btn btn-ghost btn-error btn-md">Delete</button>
      <button class="btn btn-primary btn-md">Confirm</button>
    </div>
  </div>
</div>
```
