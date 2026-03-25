---
name: design-onboard
description: Design or improve onboarding flows, empty states, and first-time user experiences. Helps users get started successfully and understand value quickly. Use when building first-run experiences, empty states, or feature discovery flows.
args:
  - name: target
    description: The feature or area needing onboarding (optional)
    required: false
    user-invocable: true
---

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide. Additionally gather: the "aha moment" you want users to reach, and users' experience level.

> **Privacy Notice**: Before implementing onboarding tracking (localStorage, completion
> metrics), verify that:
>
> 1. The project's privacy policy covers client-side storage
> 2. Cookie/storage consent is implemented if targeting EU users (ePrivacy Directive)
> 3. Tracking data is reviewed against the project's PII redaction policies

---

Create or improve onboarding experiences that help users understand, adopt, and succeed with the product quickly.

## Assess Onboarding Needs

Understand what users need to learn and why:

1. **Identify the challenge**:
   - What are users trying to accomplish?
   - What's confusing or unclear about current experience?
   - Where do users get stuck or drop off?
   - What's the "aha moment" we want users to reach?

2. **Understand the users**:
   - What's their experience level? (Beginners, power users, mixed?)
   - What's their motivation? (Excited and exploring? Required by work?)
   - What's their time commitment? (5 minutes? 30 minutes?)
   - What alternatives do they know? (Coming from competitor? New to category?)

3. **Define success**:
   - What's the minimum users need to learn to be successful?
   - What's the key action we want them to take? (First project? First invite?)
   - How do we know onboarding worked? (Completion rate? Time to value?)

If any of these are unclear from the codebase, ask the user.

**CRITICAL**: Onboarding should get users to value as quickly as possible, not teach everything possible.

## Onboarding Principles

Follow these core principles:

### Show, Don't Tell

- Demonstrate with working examples, not just descriptions
- Provide real functionality in onboarding, not separate tutorial mode
- Use progressive disclosure — teach one thing at a time

### Make It Optional (When Possible)

- Let experienced users skip onboarding
- Don't block access to product
- Provide "Skip" or "I'll explore on my own" options

### Time to Value

- Get users to their "aha moment" ASAP
- Front-load most important concepts
- Teach 20% that delivers 80% of value
- Save advanced features for contextual discovery

### Context Over Ceremony

- Teach features when users need them, not upfront
- Empty states are onboarding opportunities
- Tooltips and hints at point of use

### Respect User Intelligence

- Don't patronize or over-explain
- Be concise and clear
- Assume users can figure out standard patterns

## Design Onboarding Experiences

Create appropriate onboarding for the context:

### Initial Product Onboarding

**Welcome Screen** — use DaisyUI `hero` component:

- Clear value proposition (what is this product?)
- What users will learn/accomplish
- Time estimate (honest about commitment)
- Option to skip (for experienced users) — DaisyUI `btn btn-ghost`

**Account Setup**:

- Minimal required information (collect more later)
- Explain why you're asking for each piece of information
- Smart defaults where possible
- Social login when appropriate

**Core Concept Introduction**:

- Introduce 1-3 core concepts (not everything)
- Use simple language and examples
- Interactive when possible (do, don't just read) — use HTMX for interactive steps
- Progress indication — DaisyUI `steps` component

**First Success**:

- Guide users to accomplish something real
- Pre-populated examples or templates
- Celebrate completion (but don't overdo it) — use DaisyUI `toast` + `alert alert-success`
- Clear next steps

### Feature Discovery & Adoption

**Empty States** — use DaisyUI `hero` or `card` components:

Instead of blank space, show:

- What will appear here (description + screenshot/illustration)
- Why it's valuable
- Clear CTA to create first item — DaisyUI `btn btn-primary`
- Example or template option

Example:

```html
<div class="hero min-h-48 bg-base-200 rounded-box">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h2 class="text-xl font-bold">No projects yet</h2>
      <p class="py-4">Projects help you organize your work and collaborate with your team.</p>
      <div class="flex gap-2 justify-center">
        <button class="btn btn-primary">Create your first project</button>
        <button class="btn btn-ghost">Start from template</button>
      </div>
    </div>
  </div>
</div>
```

**Contextual Tooltips** — use DaisyUI `tooltip` component:

- Appear at relevant moment (first time user sees feature)
- Point directly at relevant UI element
- Brief explanation + benefit
- Dismissable (with "Don't show again" option) — manage with Alpine.js `x-data` state
- Optional "Learn more" link

**Feature Announcements** — use DaisyUI `alert` or `toast`:

- Highlight new features when they're released
- Show what's new and why it matters
- Let users try immediately
- Dismissable — use Alpine.js `x-show` with `x-transition`

**Progressive Onboarding**:

- Teach features when users encounter them
- Badges or indicators on new/unused features — DaisyUI `badge badge-secondary`
- Unlock complexity gradually (don't show all options immediately)
- Use HTMX `hx-trigger="revealed"` for lazy-loaded onboarding content

### Guided Tours & Walkthroughs

**When to use**:

- Complex interfaces with many features
- Significant changes to existing product
- Industry-specific tools needing domain knowledge

**How to design**:

- Spotlight specific UI elements (dim rest of page) — overlay with Alpine.js `x-show` + Tailwind `bg-black/50`
- Keep steps short (3-7 steps max per tour)
- Allow users to click through tour freely
- Include "Skip tour" option — DaisyUI `btn btn-ghost btn-sm`
- Make replayable (help menu)

**Best practices**:

- Interactive > passive (let users click real buttons)
- Focus on workflow, not features ("Create a project" not "This is the project button")
- Provide sample data so actions work

### Interactive Tutorials

**When to use**:

- Users need hands-on practice
- Concepts are complex or unfamiliar
- High stakes (better to practice in safe environment)

**How to design**:

- Sandbox environment with sample data
- Clear objectives ("Create a chart showing sales by region")
- Step-by-step guidance — DaisyUI `steps` component for progress
- Validation (confirm they did it right) — DaisyUI `alert alert-success`
- Graduation moment (you're ready!)

### Documentation & Help

**In-product help**:

- Contextual help links throughout interface
- Keyboard shortcut reference
- Searchable help center
- Video tutorials for complex workflows

**Help patterns**:

- `?` icon near complex features — DaisyUI `btn btn-circle btn-ghost btn-xs`
- "Learn more" links in tooltips — DaisyUI `link link-primary`
- Keyboard shortcut hints (`⌘K` shown on search box)

## Empty State Design

Every empty state needs:

### What Will Be Here

"Your recent projects will appear here"

### Why It Matters

"Projects help you organize your work and collaborate with your team"

### How to Get Started

`<button class="btn btn-primary">Create project</button>` or `<button class="btn btn-ghost">Import from template</button>`

### Visual Interest

Illustration or icon (not just text on blank page) — consider DaisyUI `avatar` placeholder or custom SVG

### Contextual Help

"Need help getting started? [Watch 2-min tutorial]" — use DaisyUI `link link-primary`

**Empty state types**:

- **First use**: Never used this feature (emphasize value, provide template)
- **User cleared**: Intentionally deleted everything (light touch, easy to recreate)
- **No results**: Search or filter returned nothing (suggest different query, clear filters)
- **No permissions**: Can't access (explain why, how to get access)
- **Error state**: Failed to load (explain what happened, retry option) — use DaisyUI `alert alert-error`

**Related skill**: `/design-clarify` — for UX microcopy in empty states and onboarding text

## Implementation Patterns

### Technical approaches

**Tooltip positioning**: DaisyUI `tooltip` component with directional classes (`tooltip-top`, `tooltip-bottom`, `tooltip-left`, `tooltip-right`)

**Tour/spotlight overlay** — Alpine.js + Tailwind:

```html
<!-- Tour step with Alpine.js state management -->
<div x-data="{ step: 1, showTour: true }">
  <!-- Backdrop overlay -->
  <div x-show="showTour" x-transition class="fixed inset-0 bg-black/50 z-40"></div>

  <!-- Spotlight target (elevated above overlay) -->
  <div :class="showTour && step === 1 ? 'relative z-50' : ''">
    <button class="btn btn-primary">Create Project</button>
  </div>

  <!-- Tour tooltip -->
  <div
    x-show="showTour && step === 1"
    x-transition
    class="fixed z-50 card bg-base-100 shadow-xl p-4 max-w-sm"
  >
    <p class="font-bold">Start here!</p>
    <p>Create your first project to get started.</p>
    <div class="card-actions justify-end mt-2">
      <button class="btn btn-ghost btn-sm" @click="showTour = false">Skip</button>
      <button class="btn btn-primary btn-sm" @click="step++">Next</button>
    </div>
  </div>
</div>
```

**Modal patterns**: DaisyUI `modal` component with `<dialog>` element (handles focus trap natively)

**Progress tracking**:

> **Privacy Notice**: The following localStorage patterns require user consent under GDPR/ePrivacy if targeting EU users. See the Privacy Notice in Mandatory Preparation above. Ensure your project's PII redaction policies (see `/pii-redaction` skill) are applied to any tracking data.

```javascript
// Track which onboarding steps user has seen
// ⚠️ Requires consent if targeting EU users (ePrivacy Directive)
localStorage.setItem('onboarding-completed', 'true');
localStorage.setItem('feature-tooltip-seen-reports', 'true');
```

Alternative: Use server-side session storage (KV) for consent-free progress tracking — the user's authenticated session can store onboarding state without client-side storage consent requirements.

**Progress indicators** — DaisyUI `steps` component:

```html
<ul class="steps">
  <li class="step step-primary">Setup</li>
  <li class="step step-primary">Explore</li>
  <li class="step">Create</li>
  <li class="step">Done</li>
</ul>
```

### Onboarding Analytics

> **Privacy Notice**: Tracking completion rates, drop-off points, and skip rates constitutes user analytics. Verify consent requirements before implementing. Review data against PII redaction policies.

Track these metrics (with appropriate consent):

- **Completion rate**: How many users finish onboarding?
- **Drop-off points**: Where do users abandon?
- **Time to completion**: How long does onboarding take?
- **Skip rate**: Are too many users skipping?

**IMPORTANT**: Don't show same onboarding twice (annoying). Track completion and respect dismissals.

**NEVER**:

- Force users through long onboarding before they can use product
- Patronize users with obvious explanations
- Show same tooltip repeatedly (respect dismissals)
- Block all UI during tour (let users explore)
- Create separate tutorial mode disconnected from real product
- Overwhelm with information upfront (progressive disclosure!)
- Hide "Skip" or make it hard to find
- Forget about returning users (don't show initial onboarding again)
- Add client-side tracking without verifying privacy policy coverage

## Verify Onboarding Quality

Test with real users:

- **Time to completion**: Can users complete onboarding quickly?
- **Comprehension**: Do users understand after completing?
- **Action**: Do users take desired next step?
- **Skip rate**: Are too many users skipping? (Maybe it's too long/not valuable)
- **Completion rate**: Are users completing? (If low, simplify)
- **Time to value**: How long until users get first value?
- **Accessibility**: Verify keyboard navigation through all onboarding steps (WCAG 2.2)

**Related skills**: `/design-delight` — for adding joy to onboarding moments; `/design-clarify` — for clear onboarding copy; `/design-adapt` — for responsive onboarding across devices

Remember: You're a product educator with excellent teaching instincts. Get users to their "aha moment" as quickly as possible. Teach the essential, make it contextual, respect user time and intelligence.
