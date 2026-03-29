---
name: design-audit
description: Perform comprehensive audit of interface quality across accessibility, performance, theming, and responsive design. Generates detailed report of issues with severity ratings and recommendations. Use after implementation to systematically find quality gaps.
args:
  - name: area
    description: The feature or area to audit (optional)
    required: false
    user-invocable: true
---

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide. Additionally gather: quality bar (MVP vs flagship).

---

Run systematic quality checks and generate a comprehensive audit report with prioritized issues and actionable recommendations. Don't fix issues — document them for other skills to address.

## Diagnostic Scan

Run comprehensive checks across multiple dimensions:

1. **Accessibility (A11y)** — Check for:
   - **Contrast issues**: Text contrast ratios < 4.5:1 (AA) or 7:1 (AAA) — this project targets WCAG 2.2 AAA
   - **Missing ARIA**: Interactive elements without proper roles, labels, or states
   - **Keyboard navigation**: Missing focus indicators, illogical tab order, keyboard traps — DaisyUI provides default focus styles on interactive components
   - **Semantic HTML**: Improper heading hierarchy, missing landmarks, divs instead of buttons
   - **Alt text**: Missing or poor image descriptions
   - **Form issues**: Inputs without labels, poor error messaging, missing required indicators — use DaisyUI `form-control`, `label`, and `label-text-alt`

2. **Performance** — Check for:
   - **Layout thrashing**: Reading/writing layout properties in loops
   - **Expensive animations**: Animating layout properties (width, height, top, left) instead of transform/opacity — use Tailwind `transition-transform`, `transition-opacity`
   - **Missing optimization**: Images without lazy loading, unoptimized assets, missing will-change
   - **Bundle size**: Unnecessary imports, unused dependencies
   - **Render performance**: Unnecessary re-renders in Alpine.js components, missing `x-cloak`

3. **Theming** — Check for:
   - **Hard-coded colors**: Colors not using DaisyUI semantic tokens (`primary`, `secondary`, `accent`, `neutral`, `base-*`, `info`, `success`, `warning`, `error`)
   - **Broken dark mode**: Missing DaisyUI `data-theme` variants, poor contrast in dark theme
   - **Inconsistent tokens**: Using wrong OKLCH tokens, mixing semantic and raw values
   - **Theme switching issues**: Values that don't update on `data-theme` change

4. **Responsive Design** — Check for:
   - **Fixed widths**: Hard-coded widths that break on mobile — use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
   - **Touch targets**: Interactive elements < 44x44px
   - **Horizontal scroll**: Content overflow on narrow viewports
   - **Text scaling**: Layouts that break when text size increases
   - **Missing breakpoints**: No mobile/tablet variants using Tailwind's mobile-first responsive system

5. **Anti-Patterns (CRITICAL)** — Check against ALL the **DON'T** guidelines in the `/design-frontend` skill. Look for AI slop tells (AI color palette, gradient text, glassmorphism, hero metrics, card grids, generic fonts) and general design anti-patterns (gray on color, nested cards, bounce easing, redundant copy).

**CRITICAL**: This is an audit, not a fix. Document issues thoroughly with clear explanations of impact. Use other skills (design-normalize, design-harden, etc.) to fix issues after audit.

## Generate Comprehensive Report

Create a detailed audit report with the following structure:

### Anti-Patterns Verdict

**Start here.** Pass/fail: Does this look AI-generated? List specific tells from the `/design-frontend` skill's Anti-Patterns section. Be brutally honest.

### Executive Summary

- Total issues found (count by severity)
- Most critical issues (top 3-5)
- Overall quality score (if applicable)
- Recommended next steps

### Detailed Findings by Severity

For each issue, document:

- **Location**: Where the issue occurs (component, file, line)
- **Severity**: Critical / High / Medium / Low
- **Category**: Accessibility / Performance / Theming / Responsive
- **Description**: What the issue is
- **Impact**: How it affects users
- **WCAG 2.2/Standard**: Which standard it violates (if applicable)
- **Recommendation**: How to fix it
- **Suggested skill**: Which skill to use (prefer: `/design-colorize`, `/design-typeset`, `/design-arrange`, `/design-animate`, `/design-polish`, `/design-normalize`, `/design-harden`, `/design-adapt`, `/design-clarify`, `/design-bolder`, `/design-quieter` — or other installed skills you're sure exist)

#### Critical Issues

[Issues that block core functionality or violate WCAG 2.2 A]

#### High-Severity Issues

[Significant usability/accessibility impact, WCAG 2.2 AA violations]

#### Medium-Severity Issues

[Quality issues, WCAG 2.2 AAA violations, performance concerns]

#### Low-Severity Issues

[Minor inconsistencies, optimization opportunities]

### Patterns & Systemic Issues

Identify recurring problems:

- "Hard-coded colors appear in 15+ components, should use DaisyUI semantic tokens"
- "Touch targets consistently too small (<44px) throughout mobile experience"
- "Missing focus indicators on all custom interactive components"

### Positive Findings

Note what's working well:

- Good practices to maintain
- Exemplary implementations to replicate elsewhere

### Recommendations by Priority

Create actionable plan:

1. **Immediate**: Critical blockers to fix first
2. **Short-term**: High-severity issues (this sprint)
3. **Medium-term**: Quality improvements (next sprint)
4. **Long-term**: Nice-to-haves and optimizations

### Suggested Skills for Fixes

Map issues to available skills. Prefer these: `/design-colorize`, `/design-typeset`, `/design-arrange`, `/design-animate`, `/design-polish`, `/design-normalize`, `/design-harden`, `/design-adapt`, `/design-clarify`, `/design-bolder`, `/design-quieter`. You may also suggest other installed skills you're sure exist, but never invent skills.

Examples:

- "Use `/design-normalize` to align with DaisyUI design system (addresses N theming issues)"
- "Use `/design-harden` to improve resilience (addresses N edge cases)"
- "Use `/design-adapt` to fix responsive issues (addresses N breakpoint issues)"

**IMPORTANT**: Be thorough but actionable. Too many low-priority issues creates noise. Focus on what actually matters.

**NEVER**:

- Report issues without explaining impact (why does this matter?)
- Mix severity levels inconsistently
- Skip positive findings (celebrate what works)
- Provide generic recommendations (be specific and actionable)
- Forget to prioritize (everything can't be critical)
- Report false positives without verification

**Related skills**: `/tailwind-daisyui-design` — for DaisyUI component accessibility patterns; `/design-frontend` — for design principles and anti-patterns reference

Remember: You're a quality auditor with exceptional attention to detail. Document systematically, prioritize ruthlessly, and provide clear paths to improvement. A good audit makes fixing easy.

Use subagents liberally and aggressively to conserve the main context window.
