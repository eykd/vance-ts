---
name: design-delight
description: Add moments of joy, personality, and unexpected touches that make interfaces memorable and enjoyable to use. Elevates functional to delightful. Use when interfaces feel correct but lifeless.
args:
  - name: target
    description: The feature or area to add delight to (optional)
    required: false
    user-invocable: true
---

Identify opportunities to add moments of joy, personality, and unexpected polish that transform functional interfaces into delightful experiences.

## MANDATORY PREPARATION

Use the `/design-frontend` skill — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, **ask the user** whether to run `/design-interview` first or proceed with reasonable defaults. Do NOT auto-invoke `/design-interview` — let the user decide. Additionally gather: what's appropriate for the domain (playful vs professional vs quirky vs elegant).

---

## Assess Delight Opportunities

Identify where delight would enhance (not distract from) the experience:

1. **Find natural delight moments**:
   - **Success states**: Completed actions (save, send, publish)
   - **Empty states**: First-time experiences, onboarding
   - **Loading states**: Waiting periods that could be entertaining
   - **Achievements**: Milestones, streaks, completions
   - **Interactions**: Hover states, clicks, drags
   - **Errors**: Softening frustrating moments
   - **Easter eggs**: Hidden discoveries for curious users

2. **Understand the context**:
   - What's the brand personality? (Playful? Professional? Quirky? Elegant?)
   - Who's the audience? (Tech-savvy? Creative? Corporate?)
   - What's the emotional context? (Accomplishment? Exploration? Frustration?)
   - What's appropriate? (Banking app ≠ gaming app)

3. **Define delight strategy**:
   - **Subtle sophistication**: Refined micro-interactions (luxury brands)
   - **Playful personality**: Whimsical illustrations and copy (consumer apps)
   - **Helpful surprises**: Anticipating needs before users ask (productivity tools)
   - **Sensory richness**: Satisfying sounds, smooth animations (creative tools)

If any of these are unclear from the codebase, ask the user.

**CRITICAL**: Delight should enhance usability, never obscure it. If users notice the delight more than accomplishing their goal, you've gone too far.

## Delight Principles

Follow these guidelines:

### Delight Amplifies, Never Blocks

- Delight moments should be quick (< 1 second)
- Never delay core functionality for delight
- Make delight skippable or subtle
- Respect user's time and task focus

### Surprise and Discovery

- Hide delightful details for users to discover
- Reward exploration and curiosity
- Don't announce every delight moment
- Let users share discoveries with others

### Appropriate to Context

- Match delight to emotional moment (celebrate success, empathize with errors)
- Respect the user's state (don't be playful during critical errors)
- Match brand personality and audience expectations
- Cultural sensitivity (what's delightful varies by culture)

### Compound Over Time

- Delight should remain fresh with repeated use
- Vary responses (not same animation every time)
- Reveal deeper layers with continued use
- Build anticipation through patterns

## Delight Techniques

Add personality and joy through these methods:

### Micro-interactions & Animation

**Button delight** — use Tailwind transition utilities:

```css
/* Satisfying button press */
.btn {
  @apply transition-transform duration-100;
}
.btn:active {
  @apply translate-y-0.5 shadow-sm;
}

/* Smooth lift on hover */
.btn:hover {
  @apply -translate-y-0.5;
  transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); /* ease-out-quart */
}
```

Or with DaisyUI + Tailwind utility classes:

```html
<button
  class="btn btn-primary transition-transform duration-100 hover:-translate-y-0.5 active:translate-y-0.5"
>
  Click me
</button>
```

**Loading delight**:

- Playful loading animations (not just spinners) — use DaisyUI `loading` variants
- Personality in loading messages (write product-specific ones, not generic AI filler)
- Progress indication with encouraging messages
- Skeleton screens with subtle animations — use DaisyUI `skeleton`

**Success animations**:

- Checkmark draw animation
- Confetti burst for major achievements
- Gentle scale + fade for confirmation — use Alpine.js `x-transition`
- Satisfying sound effects (subtle)

**Hover surprises**:

- Icons that animate on hover — use Tailwind `hover:rotate-12` or `hover:scale-110`
- Color shifts or glow effects — use Tailwind `hover:text-primary`
- Tooltip reveals with personality — use DaisyUI `tooltip`
- Cursor changes (custom cursors for branded experiences)

**Related skill**: `/design-animate` — for comprehensive animation implementation

### Personality in Copy

**Playful error messages**:

```
"Error 404"
"This page is playing hide and seek. (And winning)"

"Connection failed"
"Looks like the internet took a coffee break. Want to retry?"
```

**Encouraging empty states**:

```
"No projects"
"Your canvas awaits. Create something amazing."

"No messages"
"Inbox zero! You're crushing it today."
```

**Playful labels & tooltips**:

```
"Delete"
"Send to void" (for playful brand)

"Help"
"Rescue me" (tooltip)
```

**IMPORTANT**: Match copy personality to brand. Banks shouldn't be wacky, but they can be warm.

**Related skill**: `/design-clarify` — for UX microcopy guidance; `/hugo-copywriting` — for long-form content tone

### Illustrations & Visual Personality

**Custom illustrations**:

- Empty state illustrations (not stock icons)
- Error state illustrations (friendly monsters, quirky characters)
- Loading state illustrations (animated characters)
- Success state illustrations (celebrations)

**Icon personality**:

- Custom icon set matching brand personality
- Animated icons (subtle motion on hover/click)
- Illustrative icons (more detailed than generic)
- Consistent style across all icons

**Background effects**:

- Subtle particle effects
- Gradient mesh backgrounds — use Tailwind gradient utilities (`bg-gradient-to-r`, `from-*`, `to-*`)
- Geometric patterns
- Parallax depth
- Time-of-day themes (morning vs night) — implement with DaisyUI theme switching

### Satisfying Interactions

**Drag and drop delight**:

- Lift effect on drag (shadow, scale) — use Tailwind `shadow-xl scale-105`
- Snap animation when dropped
- Satisfying placement sound
- Undo toast ("Dropped in wrong place? [Undo]") — use DaisyUI `toast` + `alert`

**Toggle switches**:

- Smooth slide with spring physics — use DaisyUI `toggle` with Tailwind transitions
- Color transition
- Haptic feedback on mobile
- Optional sound effect

**Progress & achievements**:

- Streak counters with celebratory milestones
- Progress bars that "celebrate" at 100% — use DaisyUI `progress`
- Badge unlocks with animation — use DaisyUI `badge`
- Playful stats ("You're on fire! 5 days in a row")

**Form interactions**:

- Input fields that animate on focus — use DaisyUI `input` with Tailwind `focus:*` utilities
- Checkboxes with a satisfying scale pulse when checked — use DaisyUI `checkbox`
- Success state that celebrates valid input
- Auto-grow textareas — use DaisyUI `textarea`

### Sound Design

**Subtle audio cues** (when appropriate) — use Web Audio API or Howler.js:

- Notification sounds (distinctive but not annoying)
- Success sounds (satisfying "ding")
- Error sounds (empathetic, not harsh)
- Typing sounds for chat/messaging
- Ambient background audio (very subtle)

**IMPORTANT**:

- Respect system sound settings
- Provide mute option
- Keep volumes quiet (subtle cues, not alarms)
- Don't play on every interaction (sound fatigue is real)

### Easter Eggs & Hidden Delights

**Discovery rewards**:

- Konami code unlocks special theme — implement with Alpine.js `x-data` keyboard listener
- Hidden keyboard shortcuts (Cmd+K for special features)
- Hover reveals on logos or illustrations
- Alt text jokes on images (for screen reader users too!)
- Console messages for developers ("Like what you see? We're hiring!")

**Seasonal touches**:

- Holiday themes (subtle, tasteful) — implement with DaisyUI theme switching
- Seasonal color shifts
- Weather-based variations
- Time-based changes (dark at night, light during day)

**Contextual personality**:

- Different messages based on time of day
- Responses to specific user actions
- Randomized variations (not same every time) — use Alpine.js `x-data` for state
- Progressive reveals with continued use

### Loading & Waiting States

**Make waiting engaging**:

- Interesting loading messages that rotate — use Alpine.js `x-data` with interval
- Progress bars with personality — use DaisyUI `progress`
- Mini-games during long loads
- Fun facts or tips while waiting
- Countdown with encouraging messages

```
Loading messages — write ones specific to your product, not generic AI filler:
- "Crunching your latest numbers..."
- "Syncing with your team's changes..."
- "Preparing your dashboard..."
- "Checking for updates since yesterday..."
```

**WARNING**: Avoid cliched loading messages like "Herding pixels", "Teaching robots to dance", "Consulting the magic 8-ball", "Counting backwards from infinity". These are AI-slop copy — instantly recognizable as machine-generated. Write messages that are specific to what your product actually does.

### Celebration Moments

**Success celebrations**:

- Confetti for major milestones
- Animated checkmarks for completions
- Progress bar celebrations at 100% — use DaisyUI `progress` with Alpine.js transitions
- "Achievement unlocked" style notifications — use DaisyUI `toast` + `alert alert-success`
- Personalized messages ("You published your 10th article!")

**Milestone recognition**:

- First-time actions get special treatment
- Streak tracking and celebration
- Progress toward goals
- Anniversary celebrations

## Implementation Patterns

**Animation** — CSS + Alpine.js + Web APIs:

- CSS animations + Tailwind `animate-*` utilities (simple transitions)
- Alpine.js `x-transition` (component-level state animations)
- Web Animations API (programmatic control, complex choreography)
- GSAP (complex sequences, timeline-based)
- Lottie (After Effects animations — framework-agnostic)
- Canvas confetti (party effects)

**Sound** — vanilla JS libraries:

- Howler.js (audio management — framework-agnostic)
- Web Audio API (native browser audio, no dependency needed)

**Physics** — Web APIs + vanilla libraries:

- Web Animations API with spring-like easing via `cubic-bezier()` curves
- Popmotion (animation primitives — framework-agnostic)
- CSS `spring()` timing function (when browser support allows)

**IMPORTANT**: File size matters. Compress images, optimize animations, lazy load delight features.

**NEVER**:

- Delay core functionality for delight
- Force users through delightful moments (make skippable)
- Use delight to hide poor UX
- Overdo it (less is more)
- Ignore accessibility (animate responsibly, provide alternatives) — use Tailwind `motion-reduce:*`
- Make every interaction delightful (special moments should be special)
- Sacrifice performance for delight
- Be inappropriate for context (read the room)

## Verify Delight Quality

Test that delight actually delights:

- **User reactions**: Do users smile? Share screenshots?
- **Doesn't annoy**: Still pleasant after 100th time?
- **Doesn't block**: Can users opt out or skip?
- **Performant**: No jank, no slowdown
- **Appropriate**: Matches brand and context
- **Accessible**: Works with reduced motion, screen readers — verify `motion-reduce:*` variants

Remember: Delight is the difference between a tool and an experience. Add personality, surprise users positively, and create moments worth sharing. But always respect usability - delight should enhance, never obstruct.
