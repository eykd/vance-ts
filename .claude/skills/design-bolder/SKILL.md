<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: bolder
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-22 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

---

name: design-bolder
description: Amplify safe or boring designs to make them more visually interesting and stimulating. Increases impact while maintaining usability. Use when designs feel too generic, timid, or lack personality.
args:

- name: target
  description: The feature or component to make bolder (optional)
  required: false
  user-invocable: true

---

Increase visual impact and personality in designs that are too safe, generic, or visually underwhelming, creating more engaging and memorable experiences.

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide.

---

## Assess Current State

Analyze what makes the design feel too safe or boring:

1. **Identify weakness sources**:
   - **Generic choices**: System fonts, basic colors, standard layouts
   - **Timid scale**: Everything is medium-sized with no drama
   - **Low contrast**: Everything has similar visual weight
   - **Static**: No motion, no energy, no life
   - **Predictable**: Standard patterns with no surprises
   - **Flat hierarchy**: Nothing stands out or commands attention

2. **Understand the context**:
   - What's the brand personality? (How far can we push?)
   - What's the purpose? (Marketing can be bolder than financial dashboards)
   - Who's the audience? (What will resonate?)
   - What are the constraints? (Brand guidelines, accessibility, performance)

If any of these are unclear from the codebase, ask the user.

**CRITICAL**: "Bolder" doesn't mean chaotic or garish. It means distinctive, memorable, and confident. Think intentional drama, not random chaos.

**WARNING - AI SLOP TRAP**: When making things "bolder," AI defaults to the same tired tricks: cyan/purple gradients, glassmorphism, neon accents on dark backgrounds, gradient text on metrics. These are the OPPOSITE of bold—they're generic. Review ALL the DON'T guidelines in the `/design-frontend` skill before proceeding. Bold means distinctive, not "more effects."

## Plan Amplification

Create a strategy to increase impact while maintaining coherence:

- **Focal point**: What should be the hero moment? (Pick ONE, make it amazing)
- **Personality direction**: Maximalist chaos? Elegant drama? Playful energy? Dark moody? Choose a lane.
- **Risk budget**: How experimental can we be? Push boundaries within constraints.
- **Hierarchy amplification**: Make big things BIGGER, small things smaller (increase contrast)

**IMPORTANT**: Bold design must still be usable. Impact without function is just decoration.

## Amplify the Design

Systematically increase impact across these dimensions:

### Typography Amplification

- **Replace generic fonts**: Swap system fonts for distinctive choices (see `/design-frontend` skill for inspiration)
- **Extreme scale**: Create dramatic size jumps (`text-sm` paired with `text-6xl`+, not `text-base` with `text-xl`)
- **Weight contrast**: Pair `font-black` (900) with `font-extralight` (200), not `font-semibold` with `font-normal`
- **Unexpected choices**: Variable fonts, display fonts for headlines, condensed/extended widths, monospace as intentional accent (not as lazy "dev tool" default)

### Color Intensification

- **Increase saturation**: Shift to more vibrant, energetic colors in DaisyUI theme (but not neon)
- **Bold palette**: Introduce unexpected color combinations—avoid the purple-blue gradient AI slop
- **Dominant color strategy**: Let DaisyUI `primary` own 60% of the design
- **Sharp accents**: Use `accent` color for high-contrast pops
- **Tinted neutrals**: Replace pure grays with tinted `base-*` colors that harmonize with your palette
- **Rich gradients**: Intentional multi-stop gradients (not generic purple-to-blue)

### Spatial Drama

- **Extreme scale jumps**: Make important elements 3-5x larger than surroundings
- **Break the grid**: Let hero elements escape containers and cross boundaries
- **Asymmetric layouts**: Replace centered, balanced layouts with tension-filled asymmetry
- **Generous space**: Use white space dramatically (`py-24` to `py-48` gaps, not `py-4` to `py-8`)
- **Overlap**: Layer elements intentionally for depth

### Visual Effects

- **Dramatic shadows**: Large, soft shadows for elevation — use `shadow-xl` or `shadow-2xl` (but not generic drop shadows on rounded rectangles)
- **Background treatments**: Mesh patterns, noise textures, geometric patterns, intentional gradients (not purple-to-blue)
- **Texture & depth**: Grain, halftone, duotone, layered elements—NOT glassmorphism (it's overused AI slop)
- **Borders & frames**: Thick borders, decorative frames, custom shapes (not rounded rectangles with colored border on one side)
- **Custom elements**: Illustrative elements, custom icons, decorative details that reinforce brand

### Motion & Animation

- **Entrance choreography**: Staggered, dramatic page load animations with 50-100ms delays — use Alpine.js `x-transition` with staggered `x-init` timers
- **Scroll effects**: Parallax, reveal animations, scroll-triggered sequences — use Alpine.js `x-intersect`
- **Micro-interactions**: Satisfying hover effects, click feedback, state changes — use Tailwind `hover:` and `active:` variants
- **Transitions**: Smooth, noticeable transitions using `ease-out` with `duration-300`/`duration-500` (not bounce or elastic—they cheapen the effect)

### Composition Boldness

- **Hero moments**: Create clear focal points with dramatic treatment
- **Diagonal flows**: Escape horizontal/vertical rigidity with diagonal arrangements
- **Full-bleed elements**: Use full viewport width/height for impact
- **Unexpected proportions**: Golden ratio? Throw it out. Try 70/30, 80/20 splits

**NEVER**:

- Add effects randomly without purpose (chaos ≠ bold)
- Sacrifice readability for aesthetics (body text must be readable)
- Make everything bold (then nothing is bold - need contrast)
- Ignore accessibility (bold design must still meet WCAG standards)
- Overwhelm with motion (animation fatigue is real)
- Copy trendy aesthetics blindly (bold means distinctive, not derivative)

## Verify Quality

Ensure amplification maintains usability and coherence:

- **NOT AI slop**: Does this look like every other AI-generated "bold" design? If yes, start over.
- **Still functional**: Can users accomplish tasks without distraction?
- **Coherent**: Does everything feel intentional and unified?
- **Memorable**: Will users remember this experience?
- **Performant**: Do all these effects run smoothly?
- **Accessible**: Does it still meet accessibility standards?

**The test**: If you showed this to someone and said "AI made this bolder," would they believe you immediately? If yes, you've failed. Bold means distinctive, not "more AI effects."

Remember: Bold design is confident design. It takes risks, makes statements, and creates memorable experiences. But bold without strategy is just loud. Be intentional, be dramatic, be unforgettable.

Use subagents liberally and aggressively to conserve the main context window.
