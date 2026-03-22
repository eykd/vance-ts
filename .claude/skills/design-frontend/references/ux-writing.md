<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: frontend-design
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-21 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

# UX Writing

> **Stack Integration**: For Hugo site content (blog posts, landing pages), see `/hugo-copywriting`. This reference covers UX microcopy: button labels, error messages, empty states, loading text, and confirmation dialogs — the short functional text inside interactive components.

## The Button Label Problem

**Never use "OK", "Submit", or "Yes/No".** Use specific verb + object patterns:

| Bad        | Good           | Why                           |
| ---------- | -------------- | ----------------------------- |
| OK         | Save changes   | Says what will happen         |
| Submit     | Create account | Outcome-focused               |
| Yes        | Delete message | Confirms the action           |
| Cancel     | Keep editing   | Clarifies what "cancel" means |
| Click here | Download PDF   | Describes the destination     |

**For destructive actions**, name the destruction:

- "Delete" not "Remove" (delete is permanent, remove implies recoverable)
- "Delete 5 items" not "Delete selected" (show the count)

> **DaisyUI pattern**: Use button hierarchy to reinforce intent:
>
> ```html
> <button class="btn btn-error">Delete project</button>
> <button class="btn btn-ghost">Keep project</button>
> ```

## Error Messages: The Formula

Every error message should answer: (1) What happened? (2) Why? (3) How to fix it?

### Error Message Templates

| Situation             | Template                                                                       |
| --------------------- | ------------------------------------------------------------------------------ |
| **Format error**      | "[Field] needs to be [format]. Example: [example]"                             |
| **Missing required**  | "Please enter [what's missing]"                                                |
| **Permission denied** | "You don't have access to [thing]. [What to do instead]"                       |
| **Network error**     | "We couldn't reach [thing]. Check your connection and [action]."               |
| **Server error**      | "Something went wrong on our end. We're looking into it. [Alternative action]" |

### Don't Blame the User

Reframe: "Please enter a date in MM/DD/YYYY format" not "You entered an invalid date".

> **DaisyUI pattern**: Use `alert` component for contextual messages:
>
> ```html
> <div class="alert alert-error">
>   <svg>...</svg>
>   <span>Email address needs an @ symbol. Example: name@example.com</span>
> </div>
> ```

## Empty States Are Opportunities

Empty states are onboarding moments: (1) Acknowledge briefly, (2) Explain the value of filling it, (3) Provide a clear action.

"No projects yet. Create your first one to get started." not just "No items".

> **HTMX pattern**: Empty states can include an `hx-get` action to create the first item inline.

## Voice vs Tone

**Voice** is your brand's personality — consistent everywhere.
**Tone** adapts to the moment.

| Moment              | Tone Shift                                                     |
| ------------------- | -------------------------------------------------------------- |
| Success             | Celebratory, brief: "Done! Your changes are live."             |
| Error               | Empathetic, helpful: "That didn't work. Here's what to try..." |
| Loading             | Reassuring: "Saving your work..."                              |
| Destructive confirm | Serious, clear: "Delete this project? This can't be undone."   |

**Never use humor for errors.** Users are already frustrated. Be helpful, not cute.

## Writing for Accessibility

**Link text** must have standalone meaning — "View pricing plans" not "Click here". **Alt text** describes information, not the image — "Revenue increased 40% in Q4" not "Chart". Use `alt=""` for decorative images. **Icon buttons** need `aria-label`.

## Writing for Translation

### Plan for Expansion

German text is ~30% longer than English. Allocate space:

| Language | Expansion                          |
| -------- | ---------------------------------- |
| German   | +30%                               |
| French   | +20%                               |
| Finnish  | +30-40%                            |
| Chinese  | -30% (fewer chars, but same width) |

### Translation-Friendly Patterns

Keep numbers separate ("New messages: 3" not "You have 3 new messages"). Use full sentences as single strings. Avoid abbreviations. Give translators context about where strings appear.

> **Hugo i18n**: Use Hugo's i18n system with complete sentences as translation keys, not concatenated fragments.

## Consistency: The Terminology Problem

Pick one term and stick with it:

| Inconsistent                     | Consistent |
| -------------------------------- | ---------- |
| Delete / Remove / Trash          | Delete     |
| Settings / Preferences / Options | Settings   |
| Sign in / Log in / Enter         | Sign in    |
| Create / Add / New               | Create     |

Build a terminology glossary and enforce it. See `/glossary` skill.

## Loading States

Be specific: "Saving your draft..." not "Loading...". For long waits, set expectations ("This usually takes 30 seconds") or show progress.

> **HTMX pattern**: Use `hx-indicator` with descriptive text inside the loading indicator.

## Confirmation Dialogs: Use Sparingly

Most confirmation dialogs are design failures — consider undo instead. When you must confirm: name the action, explain consequences, use specific button labels ("Delete project" / "Keep project", not "Yes" / "No").

---

**Avoid**: Jargon without explanation. Blaming users. Vague errors. Varying terminology for variety. Humor for errors.

**Related skill**: `/hugo-copywriting` — long-form content, editorial style, readability metrics
**Related skill**: `/design-clarify` — UX microcopy refinement and clarity
**Related skill**: `/glossary` — domain terminology consistency
