---
name: tailwind-daisyui-design
description: 'Use when: (1) building accessible UI components/layouts, (2) choosing DaisyUI components, (3) implementing typography for readability, (4) creating accessible forms, (5) applying semantic colors from themes.'
---

# TailwindCSS + DaisyUI Design Patterns

Build accessible, professional UIs by leveraging DaisyUI's component library effectively.

## Core Principle: Prefer Existing Components

DaisyUI provides battle-tested, accessible components. **Always prefer existing components over custom implementations.**

Decision order:

1. **Use as-is** - DaisyUI component matches need exactly
2. **Compose** - Combine multiple DaisyUI components
3. **Extend** - Add Tailwind utilities to DaisyUI component
4. **Customize** - Only when no reasonable alternative exists

## Quick Reference

### Component Selection

```html
<!-- ✓ GOOD: Use semantic DaisyUI classes -->
<button class="btn btn-primary">Submit</button>
<div class="alert alert-error">Error message</div>

<!-- ✗ AVOID: Rebuilding from scratch -->
<button class="bg-blue-500 px-4 py-2 rounded text-white">Submit</button>
```

### Typography for Readability

```html
<!-- Prose content with optimal line length -->
<article class="prose max-w-prose mx-auto">
  <h1>Article Title</h1>
  <p>Long-form content here...</p>
</article>
```

### Accessible Forms

```html
<label class="form-control w-full">
  <div class="label"><span class="label-text">Email</span></div>
  <input type="email" class="input input-bordered" required aria-describedby="email-hint" />
  <div class="label">
    <span class="label-text-alt" id="email-hint">We'll never share your email</span>
  </div>
</label>
```

### Semantic Colors

```html
<!-- Use semantic colors, not raw values -->
<div class="bg-base-100 text-base-content">
  <!-- Page content -->
  <button class="btn btn-primary">
    <!-- Primary action -->
    <div class="alert alert-warning"><!-- Warning state --></div>
  </button>
</div>
```

## Reference Files

- **[references/component-patterns.md](references/component-patterns.md)** - When to use, compose, or customize components
- **[references/typography-readability.md](references/typography-readability.md)** - Typography plugin and column width for readable text
- **[references/form-accessibility.md](references/form-accessibility.md)** - Accessible form structure and validation patterns
- **[references/color-usage.md](references/color-usage.md)** - Semantic color application and theme integration

## Key Reminders

**Accessibility**

- All interactive elements need focus states (DaisyUI provides these)
- Form inputs require visible labels
- Color contrast must meet WCAG AA (DaisyUI themes handle this)
- Error states need `aria-describedby` linking

**Visual Hierarchy**

- One primary action per section (`btn-primary`)
- Use `base-100/200/300` for depth layering
- Status colors (`info`, `success`, `warning`, `error`) for feedback only

**Responsive Design**

- DaisyUI components are responsive by default
- Use Tailwind breakpoints for layout: `sm:`, `md:`, `lg:`
- Stack forms vertically on mobile
