---
name: design-normalize
description: Normalize design to match your design system and ensure consistency. Aligns features to established DaisyUI/Tailwind patterns. Use when a feature feels inconsistent with the rest of the UI or uses one-off styles instead of design system tokens.
args:
  - name: feature
    description: The page, route, or feature to normalize (optional)
    required: false
    user-invocable: true
---

Analyze and redesign the feature to perfectly match our design system standards, aesthetics, and established patterns.

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide.

**Related skill**: `/daisyui-design-system-generator` — this skill generates the design system; normalize aligns existing UI to it
**Related skill**: `/design-language-to-daisyui` — for translating design vocabulary to DaisyUI classes

---

## Plan

Before making changes, deeply understand the context:

1. **Discover the design system**: In this project, the design system is built on DaisyUI 5 + TailwindCSS 4. Study:
   - DaisyUI theme configuration in `hugo/assets/css/styles.css` (OKLCH color definitions)
   - DaisyUI component conventions used across Hugo layouts and partials
   - Tailwind spacing, typography, and responsive patterns in existing templates
   - Design tokens (colors via DaisyUI semantic names, typography via Tailwind scale, spacing via Tailwind scale)

   **CRITICAL**: If something isn't clear, ask. Don't guess at design system principles.

2. **Analyze the current feature**: Assess what works and what doesn't:
   - Where does it deviate from DaisyUI component patterns?
   - Which inconsistencies are cosmetic vs. functional?
   - What's the root cause—missing DaisyUI classes, one-off implementations, or conceptual misalignment?

3. **Create a normalization plan**: Define specific changes that will align the feature with the design system:
   - Which custom components can be replaced with DaisyUI equivalents (`btn`, `card`, `alert`, `modal`, etc.)?
   - Which inline styles or arbitrary values need to use Tailwind utilities or DaisyUI theme tokens?
   - How can UX patterns match established user flows?

   **IMPORTANT**: Great design is effective design. Prioritize UX consistency and usability over visual polish alone. Think through the best possible experience for your use case and personas first.

## Execute

Systematically address all inconsistencies across these dimensions:

- **Typography**: Use Tailwind type scale (`text-sm`, `text-base`, `text-lg`, etc.) and `leading-*`, `tracking-*` utilities. Replace hard-coded values with consistent classes. For long-form content, use DaisyUI `prose` class.
- **Color & Theme**: Apply DaisyUI semantic colors (`primary`, `secondary`, `accent`, `neutral`, `base-*`, `info`, `success`, `warning`, `error`). Remove one-off hex/rgb colors that break the OKLCH palette.
- **Spacing & Layout**: Use Tailwind spacing scale (`p-*`, `m-*`, `gap-*`). Align with grid/flex patterns used in other Hugo layouts.
- **Components**: Replace custom implementations with DaisyUI components. Ensure component variants match established patterns (`btn-primary`, `btn-ghost`, `card`, `modal`, etc.).
- **Motion & Interaction**: Match animation timing using Tailwind `transition-*`, `duration-*` utilities. Use Alpine.js `x-transition` consistently.
- **Responsive Behavior**: Ensure Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) match patterns in other layouts.
- **Accessibility**: Verify contrast ratios with DaisyUI theme colors, check focus states on DaisyUI interactive components, ensure ARIA labels match conventions.
- **Progressive Disclosure**: Match information hierarchy and complexity management to established Hugo partial patterns.

**NEVER**:

- Create new one-off components when DaisyUI equivalents exist
- Hard-code color values that should use DaisyUI semantic colors
- Introduce new patterns that diverge from the Tailwind/DaisyUI system
- Compromise accessibility for visual consistency

This is not an exhaustive list—apply judgment to identify all areas needing normalization.

## Clean Up

After normalization, ensure code quality:

- **Consolidate reusable components**: If you created new Hugo partials that should be shared, move them to `hugo/layouts/partials/`.
- **Remove orphaned code**: Delete unused Hugo partials, CSS classes, or files made obsolete by normalization.
- **Verify quality**: Run Hugo build with zero warnings, lint CSS, and test according to repository guidelines. Ensure normalization didn't introduce regressions.
- **Ensure DRYness**: Look for duplication introduced during refactoring and consolidate into shared partials.

Remember: You are a brilliant frontend designer with impeccable taste, equally strong in UX and UI. Your attention to detail and eye for end-to-end user experience is world class. Execute with precision and thoroughness.
