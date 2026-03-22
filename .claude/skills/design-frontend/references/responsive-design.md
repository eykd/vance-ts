<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: design-frontend
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-21 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

# Responsive Design

> **Stack Integration**: This project uses Tailwind CSS 4's mobile-first responsive system. Styles without prefixes apply to mobile; responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) add behaviors at larger breakpoints. DaisyUI components are responsive by default.

## Mobile-First: Write It Right

Start with base styles for mobile, use `min-width` queries (Tailwind prefixes) to layer complexity. Desktop-first means mobile loads unnecessary styles first.

```html
<!-- Tailwind mobile-first pattern -->
<div class="flex flex-col md:flex-row lg:grid lg:grid-cols-3">
  <!-- Stacks vertically on mobile, row on tablet, 3-col grid on desktop -->
</div>
```

| Tailwind Prefix | Min-Width | Typical Use                 |
| --------------- | --------- | --------------------------- |
| _(none)_        | 0px       | Mobile base styles          |
| `sm:`           | 640px     | Large phones, small tablets |
| `md:`           | 768px     | Tablets                     |
| `lg:`           | 1024px    | Laptops                     |
| `xl:`           | 1280px    | Desktops                    |
| `2xl:`          | 1536px    | Large screens               |

## Breakpoints: Content-Driven

Don't chase device sizes — let content tell you where to break. Start narrow, stretch until design breaks, add breakpoint there. Three breakpoints usually suffice. Use `clamp()` for fluid values without breakpoints.

## Detect Input Method, Not Just Screen Size

**Screen size doesn't tell you input method.** Use pointer and hover queries:

```css
/* Fine pointer (mouse, trackpad) */
@media (pointer: fine) {
  .button {
    padding: theme(spacing.2) theme(spacing.4);
  }
}

/* Coarse pointer (touch, stylus) */
@media (pointer: coarse) {
  .button {
    padding: theme(spacing.3) theme(spacing.5);
  } /* Larger touch target */
}

/* Device supports hover */
@media (hover: hover) {
  .card:hover {
    transform: translateY(-2px);
  }
}
```

**Critical**: Don't rely on hover for functionality. Touch users can't hover.

## Safe Areas: Handle the Notch

Modern phones have notches, rounded corners, and home indicators. Use `env()`:

```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.footer {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

**Enable viewport-fit** in Hugo's `baseof.html`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

## Responsive Images

### srcset with Width Descriptors

```html
<img
  src="hero-800.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Hero image"
/>
```

> **Hugo pattern**: Use Hugo's image processing for responsive images:
>
> ```go
> {{ $img := resources.Get "images/hero.jpg" }}
> {{ $small := $img.Resize "400x" }}
> {{ $medium := $img.Resize "800x" }}
> {{ $large := $img.Resize "1200x" }}
> ```

### Picture Element for Art Direction

Use when you need different crops/compositions (not just resolutions):

```html
<picture>
  <source media="(min-width: 768px)" srcset="wide.jpg" />
  <source media="(max-width: 767px)" srcset="tall.jpg" />
  <img src="fallback.jpg" alt="..." />
</picture>
```

## Layout Adaptation Patterns

**Navigation**: Three stages — hamburger + drawer on mobile (Alpine.js `x-show`), horizontal compact on tablet, full with labels on desktop.

**Tables**: Transform to cards on mobile using Tailwind's responsive utilities or DaisyUI's `table` responsive variants.

**Progressive disclosure**: Use `<details>/<summary>` or DaisyUI `collapse` component for content that can collapse on mobile.

## Testing: Don't Trust DevTools Alone

DevTools device emulation misses actual touch interactions, real CPU/memory constraints, network latency, font rendering differences, and browser chrome/keyboard appearances.

**Test on at least**: One real iPhone, one real Android, a tablet if relevant.

---

**Avoid**: Desktop-first design. Device detection instead of feature detection. Separate mobile/desktop codebases. Ignoring tablet and landscape. Assuming all mobile devices are powerful.

**Related skill**: `/design-adapt` — responsive strategy and cross-device adaptation
**Related skill**: `/tailwind-daisyui-design` — responsive component patterns with DaisyUI
