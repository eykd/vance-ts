<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: arrange
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-22 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

---

name: design-arrange
description: Improve layout, spacing, and visual rhythm. Fixes monotonous grids, inconsistent spacing, and weak visual hierarchy to create intentional compositions. Use when layouts feel crowded, monotonous, or structurally weak.
args:

- name: target
  description: The feature or component to improve layout for (optional)
  required: false
  user-invocable: true

---

Assess and improve layout and spacing that feels monotonous, crowded, or structurally weak — turning generic arrangements into intentional, rhythmic compositions.

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide.

**Related skill**: `/design-language-to-daisyui` — for translating layout descriptions to DaisyUI classes
**Related skill**: `/ui-design-language` — to describe layouts using the project's standard vocabulary

---

## Assess Current Layout

Analyze what's weak about the current spatial design:

1. **Spacing**:
   - Is spacing consistent or arbitrary? (Random padding/margin values)
   - Is all spacing the same? (Equal padding everywhere = no rhythm)
   - Are related elements grouped tightly, with generous space between groups?

2. **Visual hierarchy**:
   - Apply the squint test: blur your (metaphorical) eyes — can you still identify the most important element, second most important, and clear groupings?
   - Is hierarchy achieved effectively? (Space and weight alone can be enough — but is the current approach working?)
   - Does whitespace guide the eye to what matters?

3. **Grid & structure**:
   - Is there a clear underlying structure, or does the layout feel random?
   - Are identical card grids used everywhere? (Icon + heading + text, repeated endlessly)
   - Is everything centered? (Left-aligned with asymmetric layouts feels more designed, but not a hard and fast rule)

4. **Rhythm & variety**:
   - Does the layout have visual rhythm? (Alternating tight/generous spacing)
   - Is every section structured the same way? (Monotonous repetition)
   - Are there intentional moments of surprise or emphasis?

5. **Density**:
   - Is the layout too cramped? (Not enough breathing room)
   - Is the layout too sparse? (Excessive whitespace without purpose)
   - Does density match the content type? (Data-dense UIs need tighter spacing; marketing pages need more air)

**CRITICAL**: Layout problems are often the root cause of interfaces feeling "off" even when colors and fonts are fine. Space is a design material — use it with intention.

## Plan Layout Improvements

Consult the spatial design reference from the `/design-frontend` skill (see `references/spatial-design.md` in that skill's directory) for detailed guidance on grids, rhythm, and container queries.

Create a systematic plan:

- **Spacing system**: Use Tailwind's spacing scale (`gap-*`, `p-*`, `m-*`, `space-*`) for consistency. The specific values matter less than consistency.
- **Hierarchy strategy**: How will space communicate importance?
- **Layout approach**: What structure fits the content? Flex for 1D, Grid for 2D, named areas for complex page layouts.
- **Rhythm**: Where should spacing be tight vs generous?

## Improve Layout Systematically

### Establish a Spacing System

- Use Tailwind's spacing scale consistently — `gap-2`, `gap-4`, `gap-8`, etc. What matters is that values come from a defined set, not arbitrary numbers.
- Name tokens semantically if using custom properties: `--space-xs` through `--space-xl`, not `--spacing-8`
- Use `gap` for sibling spacing instead of margins — eliminates margin collapse hacks. In Tailwind: `gap-*` on flex/grid containers.
- Apply `clamp()` for fluid spacing that breathes on larger screens — in Tailwind, combine with arbitrary values or responsive prefixes

### Create Visual Rhythm

- **Tight grouping** for related elements (`gap-2` to `gap-3` between siblings)
- **Generous separation** between distinct sections (`py-12` to `py-24`)
- **Varied spacing** within sections — not every row needs the same gap
- **Asymmetric compositions** — break the predictable centered-content pattern when it makes sense

### Choose the Right Layout Tool

- **Use Flexbox for 1D layouts**: Rows of items, nav bars, button groups, card contents, most component internals. In Tailwind: `flex`, `flex-col`, `items-center`, `justify-between`.
- **Use Grid for 2D layouts**: Page-level structure, dashboards, data-dense interfaces, anything where rows AND columns need coordinated control. In Tailwind: `grid`, `grid-cols-*`, `col-span-*`.
- **Don't default to Grid** when Flexbox with `flex-wrap` would be simpler and more flexible.
- Use `grid-cols-[repeat(auto-fit,minmax(280px,1fr))]` for responsive grids without breakpoints.
- Use named grid areas (`grid-template-areas`) for complex page layouts — redefine at breakpoints.

### Break Card Grid Monotony

- Don't default to DaisyUI `card` components for everything — spacing and alignment create visual grouping naturally
- Use cards only when content is truly distinct and actionable — never nest cards inside cards
- Vary card sizes, span columns, or mix cards with non-card content to break repetition

### Strengthen Visual Hierarchy

- Use the fewest dimensions needed for clear hierarchy. Space alone can be enough — generous whitespace around an element draws the eye. Some of the most sophisticated designs achieve rhythm with just space and weight. Add color or size contrast only when simpler means aren't sufficient.
- Be aware of reading flow — in LTR languages, the eye naturally scans top-left to bottom-right, but primary action placement depends on context (e.g., bottom-right in dialogs, top in navigation).
- Create clear content groupings through proximity and separation.

### Manage Depth & Elevation

- Create a semantic z-index scale (dropdown → sticky → modal-backdrop → modal → toast → tooltip) — DaisyUI handles this for its components (`dropdown`, `modal`, `toast`, `tooltip`)
- Build a consistent shadow scale — use Tailwind's `shadow-sm` → `shadow` → `shadow-md` → `shadow-lg` → `shadow-xl`
- Use elevation to reinforce hierarchy, not as decoration

### Optical Adjustments

- If an icon looks visually off-center despite being geometrically centered, nudge it — but only if you're confident it actually looks wrong. Don't adjust speculatively.

**NEVER**:

- Use arbitrary spacing values outside Tailwind's scale
- Make all spacing equal — variety creates hierarchy
- Wrap everything in DaisyUI cards — not everything needs a container
- Nest cards inside cards — use spacing and dividers for hierarchy within
- Use identical card grids everywhere (icon + heading + text, repeated)
- Center everything — left-aligned with asymmetry feels more designed
- Default to the hero metric layout (big number, small label, stats, gradient) as a template. If showing real user data, a prominent metric can work — but it should display actual data, not decorative numbers.
- Default to CSS Grid when Flexbox would be simpler — use the simplest tool for the job
- Use arbitrary z-index values (999, 9999) — build a semantic scale

## Verify Layout Improvements

- **Squint test**: Can you identify primary, secondary, and groupings with blurred vision?
- **Rhythm**: Does the page have a satisfying beat of tight and generous spacing?
- **Hierarchy**: Is the most important content obvious within 2 seconds?
- **Breathing room**: Does the layout feel comfortable, not cramped or wasteful?
- **Consistency**: Is the Tailwind spacing scale applied uniformly?
- **Responsiveness**: Does the layout adapt gracefully across screen sizes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)?

Remember: Space is the most underused design tool. A layout with the right rhythm and hierarchy can make even simple content feel polished and intentional.

Use subagents liberally and aggressively to conserve the main context window.
