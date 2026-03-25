<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: quieter
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-22 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

---

name: design-quieter
description: Tone down overly bold or visually aggressive designs. Reduces intensity while maintaining design quality and impact. Use when designs feel too loud, overstimulating, or visually heavy.
args:

- name: target
  description: The feature or component to make quieter (optional)
  required: false
  user-invocable: true

---

Reduce visual intensity in designs that are too bold, aggressive, or overstimulating, creating a more refined and approachable aesthetic without losing effectiveness.

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide.

---

## Assess Current State

Analyze what makes the design feel too intense:

1. **Identify intensity sources**:
   - **Color saturation**: Overly bright or saturated colors
   - **Contrast extremes**: Too much high-contrast juxtaposition
   - **Visual weight**: Too many bold, heavy elements competing
   - **Animation excess**: Too much motion or overly dramatic effects
   - **Complexity**: Too many visual elements, patterns, or decorations
   - **Scale**: Everything is large and loud with no hierarchy

2. **Understand the context**:
   - What's the purpose? (Marketing vs tool vs reading experience)
   - Who's the audience? (Some contexts need energy)
   - What's working? (Don't throw away good ideas)
   - What's the core message? (Preserve what matters)

If any of these are unclear from the codebase, ask the user.

**CRITICAL**: "Quieter" doesn't mean boring or generic. It means refined, sophisticated, and easier on the eyes. Think luxury, not laziness.

## Plan Refinement

Create a strategy to reduce intensity while maintaining impact:

- **Color approach**: Desaturate or shift to more sophisticated tones? Adjust OKLCH chroma values in DaisyUI theme.
- **Hierarchy approach**: Which elements should stay bold (very few), which should recede?
- **Simplification approach**: What can be removed entirely?
- **Sophistication approach**: How can we signal quality through restraint?

**IMPORTANT**: Great quiet design is harder than great bold design. Subtlety requires precision.

## Refine the Design

Systematically reduce intensity across these dimensions:

### Color Refinement

- **Reduce saturation**: Shift from fully saturated to 70-85% saturation — lower chroma values in OKLCH theme definitions
- **Soften palette**: Replace bright DaisyUI theme colors with muted, sophisticated tones
- **Reduce color variety**: Use fewer colors more thoughtfully — lean on `base-*` neutrals
- **Neutral dominance**: Let `base-100`/`base-200`/`base-300` do more work, use `primary`/`accent` sparingly (10% rule)
- **Gentler contrasts**: High contrast only where it matters most
- **Tinted grays**: Use warm or cool tinted `base-*` colors instead of pure gray—adds sophistication without loudness
- **Never gray on color**: If you have gray text on a colored background, use a darker shade of that color or transparency instead

### Visual Weight Reduction

- **Typography**: Reduce font weights (`font-bold` → `font-semibold`, `font-black` → `font-bold`), decrease sizes where appropriate
- **Hierarchy through subtlety**: Use `font-medium`, `text-sm`/`text-base`, and spacing instead of color and boldness
- **White space**: Increase breathing room — use more generous `p-*`, `gap-*`, `space-*` values
- **Borders & lines**: Use `border-base-200` instead of `border-base-300`, decrease opacity with `border-opacity-50`, or remove entirely

### Simplification

- **Remove decorative elements**: Gradients, shadows, patterns, textures that don't serve purpose — reduce `shadow-lg` to `shadow-sm` or `shadow-none`
- **Simplify shapes**: Reduce border radius extremes, simplify custom shapes — standardize on DaisyUI's default radius
- **Reduce layering**: Flatten visual hierarchy where possible
- **Clean up effects**: Reduce or remove blur effects, glows, multiple shadows

### Motion Reduction

- **Reduce animation intensity**: Shorter distances, gentler easing — `duration-150` instead of `duration-500`
- **Remove decorative animations**: Keep functional motion, remove flourishes
- **Subtle micro-interactions**: Replace dramatic effects with gentle feedback — use Tailwind `transition-colors` rather than `transition-all`
- **Refined easing**: Use `ease-out` for smooth, understated motion—never bounce or elastic
- **Remove animations entirely** if they're not serving a clear purpose — use `motion-reduce:*` Tailwind variants generously

### Composition Refinement

- **Reduce scale jumps**: Smaller contrast between sizes creates calmer feeling
- **Align to grid**: Bring rogue elements back into systematic alignment using Tailwind grid/flex utilities
- **Even out spacing**: Replace extreme spacing variations with consistent rhythm from Tailwind's spacing scale

**NEVER**:

- Make everything the same size/weight (hierarchy still matters)
- Remove all color (quiet ≠ grayscale)
- Eliminate all personality (maintain character through refinement)
- Sacrifice usability for aesthetics (functional elements still need clear affordances)
- Make everything small and light (some anchors needed)

## Verify Quality

Ensure refinement maintains quality:

- **Still functional**: Can users still accomplish tasks easily?
- **Still distinctive**: Does it have character, or is it generic now?
- **Better reading**: Is text easier to read for extended periods?
- **Sophistication**: Does it feel more refined and premium?

Remember: Quiet design is confident design. It doesn't need to shout. Less is more, but less is also harder. Refine with precision and maintain intentionality.

Use subagents liberally and aggressively to conserve the main context window.
