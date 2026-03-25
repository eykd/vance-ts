<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: critique
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-22 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

---

name: design-critique
description: Evaluate design effectiveness from a UX perspective. Assesses visual hierarchy, information architecture, emotional resonance, and overall design quality with actionable feedback. Use when you need honest design evaluation before shipping.
args:

- name: area
  description: The feature or area to critique (optional)
  required: false
  user-invocable: true

---

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide. Additionally gather: what the interface is trying to accomplish.

---

Conduct a holistic design critique, evaluating whether the interface actually works — not just technically, but as a designed experience. Think like a design director giving feedback.

## Design Critique

Evaluate the interface across these dimensions:

### 1. AI Slop Detection (CRITICAL)

**This is the most important check.** Does this look like every other AI-generated interface from 2024-2025?

Review the design against ALL the **DON'T** guidelines in the `/design-frontend` skill — they are the fingerprints of AI-generated work. Check for the AI color palette, gradient text, dark mode with glowing accents, glassmorphism, hero metric layouts, identical card grids, generic fonts, and all other tells.

**The test**: If you showed this to someone and said "AI made this," would they believe you immediately? If yes, that's the problem.

### 2. Visual Hierarchy

- Does the eye flow to the most important element first?
- Is there a clear primary action? Can you spot it in 2 seconds?
- Do size, color, and position communicate importance correctly?
- Is there visual competition between elements that should have different weights?

### 3. Information Architecture

- Is the structure intuitive? Would a new user understand the organization?
- Is related content grouped logically?
- Are there too many choices at once? (cognitive overload)
- Is the navigation clear and predictable?

### 4. Emotional Resonance

- What emotion does this interface evoke? Is that intentional?
- Does it match the brand personality?
- Does it feel trustworthy, approachable, premium, playful — whatever it should feel?
- Would the target user feel "this is for me"?

### 5. Discoverability & Affordance

- Are interactive elements obviously interactive? Do DaisyUI buttons, links, and form controls look clickable/tappable?
- Would a user know what to do without instructions?
- Are hover/focus states providing useful feedback? (Check DaisyUI component state classes)
- Are there hidden features that should be more visible?

### 6. Composition & Balance

- Does the layout feel balanced or uncomfortably weighted?
- Is whitespace used intentionally or just leftover? (Check Tailwind spacing scale usage)
- Is there visual rhythm in spacing and repetition?
- Does asymmetry feel designed or accidental?

### 7. Typography as Communication

- Does the type hierarchy clearly signal what to read first, second, third? (Check Tailwind type scale: `text-sm` through `text-6xl`)
- Is body text comfortable to read? (line length via `max-w-prose`, spacing via `leading-*`, size)
- Do font choices reinforce the brand/tone?
- Is there enough contrast between heading levels?

**Related skill**: `/design-typeset` — for detailed typography refinement

### 8. Color with Purpose

- Is color used to communicate, not just decorate? (Check DaisyUI semantic color usage: `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`)
- Does the palette feel cohesive? (Check OKLCH theme consistency)
- Are accent colors drawing attention to the right things?
- Does it work for colorblind users? (not just technically — does meaning still come through?)

**Related skill**: `/design-colorize` — for strategic color improvements

### 9. States & Edge Cases

- Empty states: Do they guide users toward action, or just say "nothing here"?
- Loading states: Do they reduce perceived wait time? (Check DaisyUI `loading` component usage)
- Error states: Are they helpful and non-blaming? (Check DaisyUI `alert` components)
- Success states: Do they confirm and guide next steps?

### 10. Microcopy & Voice

- Is the writing clear and concise?
- Does it sound like a human (the right human for this brand)?
- Are labels and buttons unambiguous?
- Does error copy help users fix the problem?

**Related skill**: `/design-clarify` — for UX microcopy improvements

### 11. Accessibility (WCAG 2.2)

- Do contrast ratios meet WCAG 2.2 AAA targets (7:1 for text)?
- Is keyboard navigation logical with visible focus indicators?
- Are ARIA roles and labels complete for interactive elements?
- Does the design work with reduced motion preferences?

## Generate Critique Report

Structure your feedback as a design director would:

### Anti-Patterns Verdict

**Start here.** Pass/fail: Does this look AI-generated? List specific tells from the `/design-frontend` skill's Anti-Patterns section. Be brutally honest.

### Overall Impression

A brief gut reaction — what works, what doesn't, and the single biggest opportunity.

### What's Working

Highlight 2-3 things done well. Be specific about why they work.

### Priority Issues

The 3-5 most impactful design problems, ordered by importance:

For each issue:

- **What**: Name the problem clearly
- **Why it matters**: How this hurts users or undermines goals
- **Fix**: What to do about it (be concrete)
- **Skill**: Which skill to use (prefer: `/design-colorize`, `/design-typeset`, `/design-arrange`, `/design-animate`, `/design-polish`, `/design-normalize`, `/design-harden`, `/design-adapt`, `/design-clarify`, `/design-bolder`, `/design-quieter` — or other installed skills you're sure exist)

### Minor Observations

Quick notes on smaller issues worth addressing.

### Questions to Consider

Provocative questions that might unlock better solutions:

- "What if the primary action were more prominent?"
- "Does this need to feel this complex?"
- "What would a confident version of this look like?"

**Remember**:

- Be direct — vague feedback wastes everyone's time
- Be specific — "the submit button" not "some elements"
- Say what's wrong AND why it matters to users
- Give concrete suggestions, not just "consider exploring..."
- Prioritize ruthlessly — if everything is important, nothing is
- Don't soften criticism — developers need honest feedback to ship great design

Use subagents liberally and aggressively to conserve the main context window.
