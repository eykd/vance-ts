<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: distill
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-22 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

---

name: design-distill
description: Strip designs to their essence by removing unnecessary complexity. Great design is simple, powerful, and clean. Use when interfaces feel cluttered, have too many competing elements, or suffer from feature creep.
args:

- name: target
  description: The feature or component to distill (optional)
  required: false
  user-invocable: true

---

Remove unnecessary complexity from designs, revealing the essential elements and creating clarity through ruthless simplification.

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide.

---

> **Project Safeguard**: In this project's DaisyUI 5 + Hugo stack:
>
> - Do NOT remove DaisyUI component variants that support accessibility states
> - Do NOT simplify Hugo partial structures that enable responsive layouts
> - Do NOT strip theme variables — the OKLCH color system requires all semantic color pairs
> - Before removing any component, verify it is not used across multiple templates with `grep -r`
> - Prefer simplifying custom CSS over removing DaisyUI utility usage

## Assess Current State

Analyze what makes the design feel complex or cluttered:

1. **Identify complexity sources**:
   - **Too many elements**: Competing buttons, redundant information, visual clutter
   - **Excessive variation**: Too many colors, fonts, sizes, styles without purpose
   - **Information overload**: Everything visible at once, no progressive disclosure
   - **Visual noise**: Unnecessary borders, shadows, backgrounds, decorations
   - **Confusing hierarchy**: Unclear what matters most
   - **Feature creep**: Too many options, actions, or paths forward

2. **Find the essence**:
   - What's the primary user goal? (There should be ONE)
   - What's actually necessary vs nice-to-have?
   - What can be removed, hidden, or combined?
   - What's the 20% that delivers 80% of value?

If any of these are unclear from the codebase, ask the user.

**CRITICAL**: Simplicity is not about removing features - it's about removing obstacles between users and their goals. Every element should justify its existence.

## Plan Simplification

Create a ruthless editing strategy:

- **Core purpose**: What's the ONE thing this should accomplish?
- **Essential elements**: What's truly necessary to achieve that purpose?
- **Progressive disclosure**: What can be hidden until needed? — use DaisyUI `collapse`, `dropdown`, or `modal` components
- **Consolidation opportunities**: What can be combined or integrated?

**IMPORTANT**: Simplification is hard. It requires saying no to good ideas to make room for great execution. Be ruthless.

## Simplify the Design

Systematically remove complexity across these dimensions:

### Information Architecture

- **Reduce scope**: Remove secondary actions, optional features, redundant information
- **Progressive disclosure**: Hide complexity behind clear entry points — use DaisyUI `collapse` (accordions), `modal`, HTMX-loaded content
- **Combine related actions**: Merge similar buttons, consolidate forms, group related content
- **Clear hierarchy**: ONE primary action (`btn-primary`), few secondary actions (`btn-ghost`/`btn-outline`), everything else tertiary or hidden
- **Remove redundancy**: If it's said elsewhere, don't repeat it here

### Visual Simplification

- **Reduce color palette**: Use 1-2 DaisyUI semantic colors plus `base-*` neutrals, not 5-7 colors
- **Limit typography**: One font family, 3-4 Tailwind sizes maximum (`text-sm`, `text-base`, `text-lg`, `text-xl`), 2-3 weights
- **Remove decorations**: Eliminate borders, shadows, backgrounds that don't serve hierarchy or function — reduce `shadow-*`, remove gratuitous `border-*`
- **Flatten structure**: Reduce nesting, remove unnecessary containers—never nest DaisyUI cards inside cards
- **Remove unnecessary cards**: DaisyUI `card` components aren't needed for basic layout; use spacing and alignment instead
- **Consistent spacing**: Use Tailwind's spacing scale consistently, remove arbitrary gaps

### Layout Simplification

- **Linear flow**: Replace complex grids with simple `flex flex-col` vertical flow where possible
- **Remove sidebars**: Move secondary content inline or hide it
- **Full-width**: Use available space generously (`max-w-prose`, `container`) instead of complex multi-column layouts
- **Consistent alignment**: Pick left or center, stick with it
- **Generous white space**: Let content breathe with generous `p-*` and `gap-*` values

### Interaction Simplification

- **Reduce choices**: Fewer buttons, fewer options, clearer path forward (paradox of choice is real)
- **Smart defaults**: Make common choices automatic, only ask when necessary
- **Inline actions**: Replace modal flows with inline editing where possible — HTMX `hx-swap="innerHTML"` for inline updates
- **Remove steps**: Can signup be one step instead of three? Can checkout be simplified?
- **Clear CTAs**: ONE obvious `btn-primary` next step, not five competing actions

### Content Simplification

- **Shorter copy**: Cut every sentence in half, then do it again
- **Active voice**: "Save changes" not "Changes will be saved"
- **Remove jargon**: Plain language always wins
- **Scannable structure**: Short paragraphs, bullet points, clear headings
- **Essential information only**: Remove marketing fluff, legalese, hedging
- **Remove redundant copy**: No headers restating intros, no repeated explanations, say it once

### Code Simplification

- **Remove unused code**: Dead CSS classes, unused Hugo partials, orphaned files
- **Flatten component trees**: Reduce Hugo partial nesting depth
- **Consolidate styles**: Merge similar Tailwind class patterns, use DaisyUI components consistently
- **Reduce variants**: Does that DaisyUI component need 12 variations, or can 3 cover 90% of cases?

**NEVER**:

- Remove necessary functionality (simplicity ≠ feature-less)
- Sacrifice accessibility for simplicity (clear labels and ARIA still required)
- Make things so simple they're unclear (mystery ≠ minimalism)
- Remove information users need to make decisions
- Eliminate hierarchy completely (some things should stand out)
- Oversimplify complex domains (match complexity to actual task complexity)
- Remove DaisyUI accessibility variants or OKLCH theme variables (see Project Safeguard above)

## Verify Simplification

Ensure simplification improves usability:

- **Faster task completion**: Can users accomplish goals more quickly?
- **Reduced cognitive load**: Is it easier to understand what to do?
- **Still complete**: Are all necessary features still accessible?
- **Clearer hierarchy**: Is it obvious what matters most?
- **Better performance**: Does simpler design load faster?

## Document Removed Complexity

If you removed features or options:

- Document why they were removed
- Consider if they need alternative access points
- Note any user feedback to monitor

Remember: You have great taste and judgment. Simplification is an act of confidence - knowing what to keep and courage to remove the rest. As Antoine de Saint-Exupéry said: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."
