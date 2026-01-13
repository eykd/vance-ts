# DaisyUI Color Usage Guide

## Contents

1. [Color System Overview](#color-system-overview)
2. [Semantic Color Application](#semantic-color-application)
3. [Base Colors for Layout](#base-colors-for-layout)
4. [Status Colors](#status-colors)
5. [Theme Integration](#theme-integration)

## Color System Overview

DaisyUI uses semantic color names that automatically adapt to the active theme. **Always use semantic colors, never raw values.**

### Color Categories

| Category    | Colors                                             | Purpose                           |
| ----------- | -------------------------------------------------- | --------------------------------- |
| **Base**    | `base-100`, `base-200`, `base-300`, `base-content` | Backgrounds and body text         |
| **Brand**   | `primary`, `secondary`, `accent`, `neutral`        | Brand identity and actions        |
| **Status**  | `info`, `success`, `warning`, `error`              | Feedback and state                |
| **Content** | `*-content` variants                               | Text/icons on colored backgrounds |

### The Content Pairing Rule

Every colored background has a `-content` counterpart for accessible text:

```html
<div class="bg-primary text-primary-content">Text on primary</div>
<div class="bg-error text-error-content">Text on error</div>
```

## Semantic Color Application

### Primary Actions

```html
<!-- Main CTA - use btn-primary -->
<button class="btn btn-primary">Sign Up</button>

<!-- Primary links -->
<a href="#" class="link link-primary">Learn more</a>

<!-- Primary focus ring -->
<input class="input input-bordered focus:input-primary" />
```

### Secondary Actions

```html
<!-- Less prominent actions -->
<button class="btn btn-secondary">Save Draft</button>
<button class="btn btn-ghost">Cancel</button>
<button class="btn btn-outline">View Details</button>
```

### Accent for Highlights

```html
<!-- Badges and highlights -->
<span class="badge badge-accent">New</span>

<!-- Accent for visual interest -->
<div class="border-l-4 border-accent pl-4">Featured content</div>
```

### Neutral for Dark UI Elements

```html
<!-- Dark backgrounds regardless of theme -->
<footer class="bg-neutral text-neutral-content">
  <p>Footer content</p>
</footer>

<!-- Neutral buttons -->
<button class="btn btn-neutral">Dark Button</button>
```

## Base Colors for Layout

### Depth Layering

```html
<!-- Page background (lightest) -->
<body class="bg-base-200">
  <!-- Card elevated above page -->
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <!-- Inset or recessed area -->
      <div class="bg-base-200 rounded p-4">Recessed content</div>
    </div>
  </div>
</body>
```

### Common Patterns

```html
<!-- Page wrapper -->
<main class="min-h-screen bg-base-200">
  <!-- Cards and modals -->
  <div class="card bg-base-100 shadow-xl">
    <!-- Navigation -->
    <nav class="navbar bg-base-100 shadow">
      <!-- Sidebar -->
      <aside class="bg-base-200 w-64">
        <!-- Dividers -->
        <div class="divider"></div>
        <!-- Uses base-300 automatically -->

        <!-- Borders -->
        <div class="border border-base-300"></div>
      </aside>
    </nav>
  </div>
</main>
```

### Text on Base Colors

```html
<!-- Primary text (high contrast) -->
<p class="text-base-content">Main body text</p>

<!-- Secondary text (reduced emphasis) -->
<p class="text-base-content/70">Supporting text</p>

<!-- Tertiary text (low emphasis) -->
<p class="text-base-content/50">Hint text</p>
```

## Status Colors

### When to Use Each

| Color     | Use For                                      | Never For           |
| --------- | -------------------------------------------- | ------------------- |
| `info`    | Informational messages, tips                 | Primary actions     |
| `success` | Confirmations, completed states              | Decorative elements |
| `warning` | Cautions, potential issues                   | Errors              |
| `error`   | Errors, destructive actions, required fields | Warnings            |

### Alert Patterns

```html
<div class="alert alert-info">
  <svg><!-- info icon --></svg>
  <span>Your session expires in 5 minutes</span>
</div>

<div class="alert alert-success">
  <svg><!-- check icon --></svg>
  <span>Changes saved successfully</span>
</div>

<div class="alert alert-warning">
  <svg><!-- warning icon --></svg>
  <span>This action cannot be undone</span>
</div>

<div class="alert alert-error">
  <svg><!-- error icon --></svg>
  <span>Failed to save changes</span>
</div>
```

### Inline Status Indicators

```html
<!-- Form validation -->
<input class="input input-bordered input-error" />
<span class="text-error text-sm">This field is required</span>

<!-- Status badges -->
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-error">Failed</span>

<!-- Progress states -->
<progress class="progress progress-success w-56" value="100" max="100"></progress>
```

## Theme Integration

### Using with Custom Themes

When using themes generated by `daisyui-design-system-generator`:

```css
@import 'tailwindcss';
@plugin "daisyui";

/* Custom theme with AAA contrast */
@plugin "daisyui/theme" {
  name: 'brand-light';
  default: true;
  color-scheme: light;

  --color-base-100: oklch(99% 0.005 240);
  --color-base-content: oklch(18% 0.02 240);
  --color-primary: oklch(45% 0.22 260);
  --color-primary-content: oklch(99% 0.005 260);
  /* ... */
}
```

### Dark Mode Support

```html
<!-- Theme toggle -->
<html data-theme="light">
  <!-- or "dark" -->

  <!-- Conditional styling (rarely needed with semantic colors) -->
  <div class="bg-white dark:bg-gray-900">
    <!-- Avoid this -->
    <div class="bg-base-100"><!-- Prefer this --></div>
  </div>
</html>
```

### Opacity Modifiers

```html
<!-- Use opacity for subtle variations -->
<div class="bg-primary/10">Light primary tint</div>
<div class="bg-error/20">Light error background</div>
<div class="border-primary/50">Semi-transparent border</div>
```

## Anti-Patterns to Avoid

```html
<!-- ✗ BAD: Raw color values -->
<button class="bg-blue-500 text-white">Submit</button>
<div class="bg-red-100 text-red-800">Error</div>

<!-- ✓ GOOD: Semantic colors -->
<button class="btn btn-primary">Submit</button>
<div class="alert alert-error">Error</div>

<!-- ✗ BAD: Hardcoded dark mode -->
<div class="bg-white dark:bg-slate-800">
  <!-- ✓ GOOD: Theme-aware -->
  <div class="bg-base-100">
    <!-- ✗ BAD: Using status colors decoratively -->
    <h1 class="text-success">Welcome!</h1>

    <!-- ✓ GOOD: Status colors for status only -->
    <div class="alert alert-success">Account created!</div>
  </div>
</div>
```

## Quick Reference

| Intent                | Class Pattern                          |
| --------------------- | -------------------------------------- |
| Page background       | `bg-base-200`                          |
| Card/modal background | `bg-base-100`                          |
| Body text             | `text-base-content`                    |
| Muted text            | `text-base-content/70`                 |
| Primary button        | `btn btn-primary`                      |
| Secondary button      | `btn btn-secondary` or `btn btn-ghost` |
| Destructive button    | `btn btn-error`                        |
| Link                  | `link link-primary`                    |
| Success message       | `alert alert-success`                  |
| Error message         | `alert alert-error`                    |
| Border                | `border-base-300`                      |
| Divider               | `divider` (automatic)                  |
