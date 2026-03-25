<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: adapt
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-22 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack;
  Desktop-first responsive strategy reframed to Tailwind's mobile-first convention with responsive prefixes
-->

---

name: design-adapt
description: Adapt designs to work across different screen sizes, devices, contexts, or platforms. Uses Tailwind's mobile-first responsive system. Ensures consistent experience across varied environments.
args:

- name: target
  description: The feature or component to adapt (optional)
  required: false
- name: context
  description: What to adapt for (mobile, tablet, desktop, print, email, etc.)
  required: false
  user-invocable: true

---

Adapt existing designs to work effectively across different contexts - different screen sizes, devices, platforms, or use cases.

**This project uses Tailwind's mobile-first responsive system** — styles without prefixes apply to mobile, responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) add larger-screen behaviors progressively.

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide. Additionally gather: target platforms/devices and usage contexts.

---

## Assess Adaptation Challenge

Understand what needs adaptation and why:

1. **Identify the source context**:
   - What was it designed for originally? (Desktop web? Mobile app?)
   - What assumptions were made? (Large screen? Mouse input? Fast connection?)
   - What works well in current context?

2. **Understand target context**:
   - **Device**: Mobile, tablet, desktop, TV, watch, print?
   - **Input method**: Touch, mouse, keyboard, voice, gamepad?
   - **Screen constraints**: Size, resolution, orientation?
   - **Connection**: Fast wifi, slow 3G, offline?
   - **Usage context**: On-the-go vs desk, quick glance vs focused reading?
   - **User expectations**: What do users expect on this platform?

3. **Identify adaptation challenges**:
   - What won't fit? (Content, navigation, features)
   - What won't work? (Hover states on touch, tiny touch targets)
   - What's inappropriate? (Desktop patterns on mobile, mobile patterns on desktop)

**CRITICAL**: Adaptation is not just scaling - it's rethinking the experience for the new context.

**Related skill**: `/tailwind-daisyui-design` — for responsive design patterns and DaisyUI component usage; `/htmx-alpine-templates` — for responsive Hugo template implementation

## Plan Adaptation Strategy

Design mobile-first, then progressively enhance for larger screens.

### Mobile-First Base (no prefix)

The default styles target mobile — the smallest, most constrained context:

**Layout Strategy** — Tailwind mobile-first defaults:

- Single column layout (`flex flex-col` or `grid`)
- Vertical stacking instead of side-by-side
- Full-width components (`w-full`)
- Bottom navigation for primary actions

**Interaction Strategy**:

- Touch targets 44x44px minimum (`min-h-11 min-w-11`) — use DaisyUI component sizing
- Swipe gestures where appropriate (lists, carousels)
- Bottom sheets instead of dropdowns — use DaisyUI `drawer` or `modal`
- Thumbs-first design (controls within thumb reach)
- Larger tap areas with more spacing (`gap-3`, `p-4`)

**Content Strategy**:

- Progressive disclosure (don't show everything at once) — use DaisyUI `collapse` or `tabs`
- Prioritize primary content (secondary content in tabs/accordions)
- Shorter text (more concise)
- Minimum 16px text (`text-base`)

**Navigation Strategy**:

- DaisyUI `navbar` with hamburger menu or bottom navigation (`btm-nav`)
- Reduce navigation complexity
- Sticky headers for context (`sticky top-0`)
- Back button in navigation flow

### Tablet Enhancement (`md:` prefix — 768px+)

```html
<!-- Two-column on tablet, single on mobile -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"></div>
```

**Layout Strategy**:

- Two-column layouts (`md:grid-cols-2`)
- Side panels for secondary content — use DaisyUI `drawer` with `md:drawer-open`
- Master-detail views (list + detail)
- Adaptive based on orientation (portrait vs landscape)

**Interaction Strategy**:

- Support both touch and pointer
- Touch targets 44x44px but allow denser layouts than phone
- Side navigation drawers — use DaisyUI `drawer`
- Multi-column forms where appropriate

### Desktop Enhancement (`lg:` prefix — 1024px+)

```html
<!-- Three columns on desktop, two on tablet, one on mobile -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"></div>
```

**Layout Strategy**:

- Multi-column layouts (`lg:grid-cols-3`, `xl:grid-cols-4`)
- Side navigation always visible — use DaisyUI `drawer` with `lg:drawer-open`
- Multiple information panels simultaneously
- Max-width constraints (`max-w-7xl mx-auto`) — don't stretch to 4K

**Interaction Strategy**:

- Hover states for additional information (`hover:*` utilities)
- Keyboard shortcuts — implement with Alpine.js `@keydown.window`
- Right-click context menus
- Drag and drop where helpful
- Multi-select with Shift/Cmd

**Content Strategy**:

- Show more information upfront (less progressive disclosure)
- Data tables with many columns — use DaisyUI `table`
- Richer visualizations
- More detailed descriptions

### Wide Screen Enhancement (`xl:` 1280px+, `2xl:` 1536px+)

```html
<div class="max-w-7xl xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto"></div>
```

- Extra columns or wider content areas
- Dashboard-style multi-panel layouts
- Side-by-side comparisons

### Print Adaptation (`print:` variant)

```html
<nav class="print:hidden">...</nav>
<div class="hidden print:block">Print-only content</div>
```

**Layout Strategy**:

- Page breaks at logical points (`break-before-page`, `break-after-avoid`)
- Remove navigation, footer, interactive elements (`print:hidden`)
- Black and white (or limited color)
- Proper margins for binding

**Content Strategy**:

- Expand shortened content (show full URLs, hidden sections)
- Add page numbers, headers, footers
- Include metadata (print date, page title)
- Convert charts to print-friendly versions

### Email Adaptation (Web → Email)

**Layout Strategy**:

- Narrow width (600px max)
- Single column only
- Inline CSS (no external stylesheets)
- Table-based layouts (for email client compatibility)

**Interaction Strategy**:

- Large, obvious CTAs (buttons not text links)
- No hover states (not reliable)
- Deep links to web app for complex interactions

## Implement Adaptations

Apply changes systematically using Tailwind's responsive system:

### Responsive Breakpoints — Tailwind Mobile-First

Tailwind responsive prefixes use `min-width` — styles build UP from mobile:

| Prefix   | Min-width | Usage                        |
| -------- | --------- | ---------------------------- |
| _(none)_ | 0px       | Mobile base styles           |
| `sm:`    | 640px     | Large phones / small tablets |
| `md:`    | 768px     | Tablets                      |
| `lg:`    | 1024px    | Desktop                      |
| `xl:`    | 1280px    | Wide desktop                 |
| `2xl:`   | 1536px    | Ultra-wide                   |

Or use content-driven breakpoints with arbitrary values: `min-[600px]:grid-cols-2`

### Layout Adaptation Techniques

- **Tailwind Grid/Flexbox**: Reflow layouts automatically with responsive prefixes
  ```html
  <div class="flex flex-col md:flex-row gap-4"></div>
  ```
- **Container Queries**: Adapt based on container, not viewport — use `@container` with Tailwind
- **`clamp()`**: Fluid sizing between min and max — use Tailwind `text-[clamp(1rem,2vw,1.5rem)]`
- **Responsive visibility**: Show/hide elements per context — `hidden md:block` / `md:hidden`

### Touch Adaptation

- Increase touch target sizes (44x44px minimum) — DaisyUI components handle this by default
- Add more spacing between interactive elements (`gap-3` on mobile)
- Remove hover-dependent interactions on touch — use `@media (hover: hover)` or Alpine.js device detection
- Add touch feedback — use DaisyUI's built-in active states
- Consider thumb zones (easier to reach bottom than top)

### Content Adaptation

- Use `hidden md:block` for progressive enhancement (content loads only when displayed with `<template>`)
- Progressive enhancement (core content first, enhancements on larger screens)
- Lazy loading for off-screen content — use Alpine.js `x-intersect`
- Responsive images (`srcset`, `<picture>` element) — configure in Hugo templates

### Navigation Adaptation

- Transform complex nav to hamburger/drawer on mobile — use DaisyUI `drawer` with Alpine.js toggle
- Bottom nav bar for mobile apps — use DaisyUI `btm-nav`
- Persistent side navigation on desktop — `lg:drawer-open`
- Breadcrumbs on smaller screens for context — use DaisyUI `breadcrumbs`

**IMPORTANT**: Test on real devices, not just browser DevTools. Device emulation is helpful but not perfect.

**NEVER**:

- Hide core functionality on mobile (if it matters, make it work)
- Assume desktop = powerful device (consider accessibility, older machines)
- Use different information architecture across contexts (confusing)
- Break user expectations for platform (mobile users expect mobile patterns)
- Forget landscape orientation on mobile/tablet
- Use generic breakpoints blindly (use content-driven breakpoints when Tailwind defaults don't fit)
- Ignore touch on desktop (many desktop devices have touch)

## Verify Adaptations

Test thoroughly across contexts:

- **Real devices**: Test on actual phones, tablets, desktops
- **Different orientations**: Portrait and landscape
- **Different browsers**: Safari, Chrome, Firefox, Edge
- **Different OS**: iOS, Android, Windows, macOS
- **Different input methods**: Touch, mouse, keyboard
- **Edge cases**: Very small screens (320px), very large screens (4K) — verify with Tailwind responsive prefixes
- **Slow connections**: Test on throttled network
- **Accessibility**: Verify WCAG 2.2 AAA compliance at all breakpoints — this project targets AAA

**Related skills**: `/tailwind-daisyui-design` — responsive design patterns and accessibility; `/htmx-alpine-templates` — responsive Hugo template patterns; `/design-frontend` — responsive design reference docs

Remember: You're a cross-platform design expert. Make experiences that feel native to each context while maintaining brand and functionality consistency. Adapt intentionally, test thoroughly.

Use subagents liberally and aggressively to conserve the main context window.
