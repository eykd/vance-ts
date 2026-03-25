---
name: design-animate
description: Review a feature and enhance it with purposeful animations, micro-interactions, and motion effects that improve usability and delight. Use when adding motion to Hugo templates, Alpine.js components, or HTMX transitions.
args:
  - name: target
    description: The feature or component to animate (optional)
    required: false
    user-invocable: true
---

Analyze a feature and strategically add animations and micro-interactions that enhance understanding, provide feedback, and create delight.

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide. Additionally gather: performance constraints.

---

## Assess Animation Opportunities

Analyze where motion would improve the experience:

1. **Identify static areas**:
   - **Missing feedback**: Actions without visual acknowledgment (button clicks, form submission, etc.)
   - **Jarring transitions**: Instant state changes that feel abrupt (show/hide, page loads, HTMX swaps)
   - **Unclear relationships**: Spatial or hierarchical relationships that aren't obvious
   - **Lack of delight**: Functional but joyless interactions
   - **Missed guidance**: Opportunities to direct attention or explain behavior

2. **Understand the context**:
   - What's the personality? (Playful vs serious, energetic vs calm)
   - What's the performance budget? (Mobile-first? Complex page?)
   - Who's the audience? (Motion-sensitive users? Power users who want speed?)
   - What matters most? (One hero animation vs many micro-interactions?)

If any of these are unclear from the codebase, ask the user.

**CRITICAL**: Respect `prefers-reduced-motion`. Always provide non-animated alternatives for users who need them.

## Plan Animation Strategy

Create a purposeful animation plan:

- **Hero moment**: What's the ONE signature animation? (Page load? Hero section? Key interaction?)
- **Feedback layer**: Which interactions need acknowledgment?
- **Transition layer**: Which state changes need smoothing?
- **Delight layer**: Where can we surprise and delight?

**IMPORTANT**: One well-orchestrated experience beats scattered animations everywhere. Focus on high-impact moments.

## Implement Animations

Add motion systematically across these categories:

### Entrance Animations

- **Page load choreography**: Stagger element reveals (100-150ms delays), fade + slide combinations — use Tailwind `animate-*` utilities or Alpine.js `x-transition`
- **Hero section**: Dramatic entrance for primary content (scale, parallax, or creative effects)
- **Content reveals**: Scroll-triggered animations using Intersection Observer — use Alpine.js `x-intersect`
- **Modal/drawer entry**: Smooth slide + fade, backdrop fade, focus management — use DaisyUI `modal` with Alpine.js `x-transition`

### Micro-interactions

- **Button feedback**:
  - Hover: Subtle scale (1.02-1.05), color shift, shadow increase — use Tailwind `hover:scale-[1.02] hover:shadow-lg transition-all`
  - Click: Quick scale down then up (0.95 → 1), ripple effect — use Tailwind `active:scale-95 transition-transform`
  - Loading: Spinner or pulse state — use DaisyUI `loading loading-spinner`
- **Form interactions**:
  - Input focus: Border color transition, slight scale or glow — use DaisyUI `input-primary` with Tailwind `transition-colors`
  - Validation: Shake on error, check mark on success, smooth color transitions
- **Toggle switches**: Smooth slide + color transition (200-300ms) — use DaisyUI `toggle` component
- **Checkboxes/radio**: Check mark animation, ripple effect — use DaisyUI `checkbox` / `radio`
- **Like/favorite**: Scale + rotation, particle effects, color transition

### State Transitions

- **Show/hide**: Fade + slide (not instant), appropriate timing (200-300ms) — use Alpine.js `x-show` with `x-transition`
- **Expand/collapse**: Height transition with overflow handling, icon rotation — use DaisyUI `collapse` or Alpine.js `x-collapse`
- **Loading states**: Skeleton screen fades, spinner animations, progress bars — use DaisyUI `skeleton` and `loading`
- **Success/error**: Color transitions, icon animations, gentle scale pulse — use DaisyUI `alert` with Alpine.js transitions
- **Enable/disable**: Opacity transitions, cursor changes

### Navigation & Flow

- **Page transitions**: HTMX `hx-swap` with `transition:true` for View Transitions API integration
- **Tab switching**: Slide indicator, content fade/slide — use DaisyUI `tabs` with Alpine.js state
- **Carousel/slider**: Smooth transforms, snap points, momentum — use DaisyUI `carousel`
- **Scroll effects**: Parallax layers, sticky headers with state changes, scroll progress indicators

### Feedback & Guidance

- **Hover hints**: Tooltip fade-ins, cursor changes, element highlights — use DaisyUI `tooltip`
- **Drag & drop**: Lift effect (shadow + scale), drop zone highlights, smooth repositioning
- **Copy/paste**: Brief highlight flash on paste, "copied" confirmation
- **Focus flow**: Highlight path through form or workflow

### Delight Moments

- **Empty states**: Subtle floating animations on illustrations
- **Completed actions**: Confetti, check mark flourish, success celebrations
- **Easter eggs**: Hidden interactions for discovery
- **Contextual animation**: Weather effects, time-of-day themes, seasonal touches

**Related skill**: `/design-delight` — for comprehensive delight strategy beyond animation

## Technical Implementation

Use appropriate techniques for each animation:

### Timing & Easing

**Durations by purpose:**

- **100-150ms**: Instant feedback (button press, toggle)
- **200-300ms**: State changes (hover, menu open)
- **300-500ms**: Layout changes (accordion, modal)
- **500-800ms**: Entrance animations (page load)

**Easing curves (use these, not CSS defaults):**

```css
/* Recommended - natural deceleration */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1); /* Smooth, refined */
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1); /* Slightly snappier */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1); /* Confident, decisive */

/* AVOID - feel dated and tacky */
/* bounce: cubic-bezier(0.34, 1.56, 0.64, 1); */
/* elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6); */
```

**Exit animations are faster than entrances.** Use ~75% of enter duration.

### CSS Animations

```css
/* Prefer for simple, declarative animations */
- Tailwind transition utilities (transition-*, duration-*, ease-*)
- @keyframes for complex sequences
- transform + opacity only (GPU-accelerated)
```

### Alpine.js Transitions

```html
<!-- Use x-transition for Alpine.js state-driven animations -->
<div
  x-show="open"
  x-transition:enter="transition ease-out duration-300"
  x-transition:enter-start="opacity-0 transform -translate-y-2"
  x-transition:enter-end="opacity-100 transform translate-y-0"
  x-transition:leave="transition ease-in duration-200"
  x-transition:leave-start="opacity-100"
  x-transition:leave-end="opacity-0"
></div>
```

### JavaScript Animation

```javascript
/* Use for complex, interactive animations */
- Web Animations API for programmatic control
- CSS animations + Alpine.js x-transition for component-level motion
- GSAP for complex sequences
```

### HTMX Transition Integration

```html
<!-- Smooth HTMX content swaps -->
<div hx-get="/partial" hx-swap="innerHTML transition:true">
  <!-- View Transitions API integration for HTMX swaps -->
</div>
```

### Performance

- **GPU acceleration**: Use `transform` and `opacity`, avoid layout properties
- **will-change**: Add sparingly for known expensive animations
- **Reduce paint**: Minimize repaints, use `contain` where appropriate
- **Monitor FPS**: Ensure 60fps on target devices

### Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Use Tailwind's `motion-reduce:*` variant for per-element control:

```html
<div class="animate-bounce motion-reduce:animate-none">...</div>
```

**NEVER**:

- Use bounce or elastic easing curves—they feel dated and draw attention to the animation itself
- Animate layout properties (width, height, top, left)—use transform instead
- Use durations over 500ms for feedback—it feels laggy
- Animate without purpose—every animation needs a reason
- Ignore `prefers-reduced-motion`—this is an accessibility violation
- Animate everything—animation fatigue makes interfaces feel exhausting
- Block interaction during animations unless intentional

## Verify Quality

Test animations thoroughly:

- **Smooth at 60fps**: No jank on target devices
- **Feels natural**: Easing curves feel organic, not robotic
- **Appropriate timing**: Not too fast (jarring) or too slow (laggy)
- **Reduced motion works**: Animations disabled or simplified appropriately — verify Tailwind `motion-reduce:*` variants
- **Doesn't block**: Users can interact during/after animations
- **Adds value**: Makes interface clearer or more delightful

**Related skills**: `/design-frontend` — motion design principles and anti-patterns; `/htmx-pattern-library` — HTMX transition patterns

Remember: Motion should enhance understanding and provide feedback, not just add decoration. Animate with purpose, respect performance constraints, and always consider accessibility. Great animation is invisible - it just makes everything feel right.
