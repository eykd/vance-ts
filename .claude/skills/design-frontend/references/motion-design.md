<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: frontend-design
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-21 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

# Motion Design

> **Stack Integration**: Use CSS transitions/animations, Tailwind motion utilities (`transition-*`, `duration-*`, `ease-*`, `motion-reduce:*`), Alpine.js `x-transition` directives, and the Web Animations API. For HTMX transitions, use View Transitions API or `hx-swap` with transition classes.

## Duration: The 100/300/500 Rule

| Duration      | Use Case            | Examples                           | Tailwind                       |
| ------------- | ------------------- | ---------------------------------- | ------------------------------ |
| **100-150ms** | Instant feedback    | Button press, toggle, color change | `duration-100`, `duration-150` |
| **200-300ms** | State changes       | Menu open, tooltip, hover states   | `duration-200`, `duration-300` |
| **300-500ms** | Layout changes      | Accordion, modal, drawer           | `duration-300`, `duration-500` |
| **500-800ms** | Entrance animations | Page load, hero reveals            | Custom CSS                     |

**Exit animations are faster than entrances** — use ~75% of enter duration.

## Easing: Pick the Right Curve

**Don't use `ease`.** It's a compromise that's rarely optimal:

| Curve           | Use For           | CSS                              | Tailwind      |
| --------------- | ----------------- | -------------------------------- | ------------- |
| **ease-out**    | Elements entering | `cubic-bezier(0.16, 1, 0.3, 1)`  | `ease-out`    |
| **ease-in**     | Elements leaving  | `cubic-bezier(0.7, 0, 0.84, 0)`  | `ease-in`     |
| **ease-in-out** | State toggles     | `cubic-bezier(0.65, 0, 0.35, 1)` | `ease-in-out` |

**For micro-interactions, use exponential curves** — they mimic real physics:

```css
/* Define as custom properties for reuse */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1); /* smooth, refined */
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1); /* slightly dramatic */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1); /* snappy, confident */
```

**Avoid bounce and elastic curves.** They feel dated and tacky. Real objects decelerate smoothly.

## The Only Two Properties You Should Animate

**`transform` and `opacity` only** — everything else causes layout recalculation.

For height animations (accordions), use `grid-template-rows: 0fr -> 1fr`:

```css
.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 300ms var(--ease-out-quart);
}
.accordion-content[data-open] {
  grid-template-rows: 1fr;
}
.accordion-content > div {
  overflow: hidden;
}
```

> **Alpine.js pattern**: Use `x-transition` for enter/leave animations:
>
> ```html
> <div
>   x-show="open"
>   x-transition:enter="transition ease-out duration-300"
>   x-transition:enter-start="opacity-0 -translate-y-2"
>   x-transition:enter-end="opacity-100 translate-y-0"
>   x-transition:leave="transition ease-in duration-200"
>   x-transition:leave-start="opacity-100 translate-y-0"
>   x-transition:leave-end="opacity-0 -translate-y-2"
> ></div>
> ```

## Staggered Animations

Use CSS custom properties for cleaner stagger:

```css
.card {
  animation-delay: calc(var(--i, 0) * 50ms);
}
```

```html
<div class="card" style="--i: 0">...</div>
<div class="card" style="--i: 1">...</div>
```

**Cap total stagger time** — 10 items at 50ms = 500ms total. For many items, reduce per-item delay or cap staggered count.

## Reduced Motion

This is not optional. Vestibular disorders affect ~35% of adults over 40.

```css
@media (prefers-reduced-motion: reduce) {
  .card {
    animation: fade-in 200ms ease-out; /* Crossfade instead of motion */
  }
}
```

> **Tailwind shorthand**: Use `motion-reduce:` prefix to disable or simplify animations:
>
> ```html
> <div class="animate-slide-up motion-reduce:animate-none motion-reduce:opacity-100"></div>
> ```

**What to preserve**: Functional animations like progress bars and loading spinners (slowed down) should still work — just without spatial movement.

## Perceived Performance

**The 80ms threshold**: Our brains buffer sensory input for ~80ms. Anything under 80ms feels instant. Target this for micro-interactions.

**Strategies**:

- **Preemptive start**: Begin transitions immediately while loading (skeleton UI)
- **Early completion**: Show content progressively — don't wait for everything
- **Optimistic UI**: Update the interface immediately, handle failures gracefully

> **HTMX pattern**: Use `hx-indicator` to show loading state immediately. Combine with View Transitions API for smooth page transitions.

**Caution**: Too-fast responses can decrease perceived value. Users may distrust instant results for complex operations.

## Performance

Don't use `will-change` preemptively — only when animation is imminent. Use Intersection Observer for scroll-triggered animations; unobserve after animating once. Create motion tokens for consistency.

---

**Avoid**: Animating everything (animation fatigue is real). Using >500ms for UI feedback. Ignoring `prefers-reduced-motion`. Using animation to hide slow loading.

**Related skill**: `/design-animate` — detailed motion design guidance for specific components
