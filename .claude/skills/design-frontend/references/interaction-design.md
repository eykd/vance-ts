<!--
  Original source: https://github.com/pbakaus/impeccable
  Original skill: design-frontend
  Original author: Paul Bakaus
  License: Apache License 2.0
  Adapted: 2026-03-21 — Modified for TailwindCSS 4 + DaisyUI 5 + Hugo + Alpine.js 3 + HTMX stack
-->

# Interaction Design

> **Stack Integration**: This project uses HTMX for server-driven interactions (`hx-swap`, `hx-target`, `hx-trigger`) and Alpine.js for client-side state (`x-data`, `x-show`, `x-transition`). DaisyUI provides component classes for interactive elements. See `/htmx-pattern-library` and `/htmx-alpine-templates` for implementation patterns.

## The Eight Interactive States

Every interactive element needs these states designed:

| State        | When                        | Visual Treatment            | DaisyUI/Tailwind                      |
| ------------ | --------------------------- | --------------------------- | ------------------------------------- |
| **Default**  | At rest                     | Base styling                | `btn`, `input`                        |
| **Hover**    | Pointer over (not touch)    | Subtle lift, color shift    | `hover:` prefix                       |
| **Focus**    | Keyboard/programmatic focus | Visible ring                | `focus-visible:` prefix               |
| **Active**   | Being pressed               | Pressed in, darker          | `active:` prefix                      |
| **Disabled** | Not interactive             | Reduced opacity, no pointer | `btn-disabled`, `disabled:opacity-50` |
| **Loading**  | Processing                  | Spinner, skeleton           | `loading loading-spinner`             |
| **Error**    | Invalid state               | Red border, icon, message   | `input-error`, `text-error`           |
| **Success**  | Completed                   | Green check, confirmation   | `alert-success`                       |

**The common miss**: Designing hover without focus, or vice versa. Keyboard users never see hover states.

## Focus Rings: Do Them Right

**Never `outline: none` without replacement.** Use `:focus-visible` to show focus only for keyboard users:

```css
/* Tailwind handles this with focus-visible: prefix */
/* DaisyUI components include focus styles by default */
button:focus-visible {
  outline: 2px solid oklch(var(--a)); /* accent color */
  outline-offset: 2px;
}
```

**Focus ring design**: High contrast (3:1 minimum), 2-3px thick, offset from element, consistent across all interactive elements.

## Form Design

**Placeholders aren't labels** — they disappear on input. Always use visible `<label>` elements. **Validate on blur**, not on every keystroke (exception: password strength). Place errors **below** fields with `aria-describedby`.

> **DaisyUI forms**: Use `form-control`, `label`, `input`, `select`, `textarea` component classes. Error states use `input-error` + `label-text-alt text-error`. See `/tailwind-daisyui-design` form-accessibility reference.

## Loading States

**Optimistic updates**: Show success immediately, rollback on failure. Use for low-stakes actions (likes, follows), not payments or destructive actions.

**Skeleton screens > spinners** — they preview content shape and feel faster. DaisyUI provides `skeleton` component class.

> **HTMX pattern**: Use `hx-indicator` with `htmx-indicator` class for loading states. HTMX adds `.htmx-request` class during requests — combine with DaisyUI's `loading` component.

## Modals: The Inert Approach

Use DaisyUI's `modal` component with the native `<dialog>` element:

```html
<dialog id="my-modal" class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Modal Title</h3>
    <p>Content</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
```

Or use the `inert` attribute on `<main>` when modal is open.

## The Popover API

For tooltips, dropdowns, and non-modal overlays, use native popovers:

```html
<button popovertarget="menu">Open menu</button>
<div id="menu" popover>
  <button>Option 1</button>
  <button>Option 2</button>
</div>
```

**Benefits**: Light-dismiss, proper stacking, no z-index wars, accessible by default.

> **DaisyUI alternative**: DaisyUI `dropdown` component provides similar functionality with styling.

## Destructive Actions: Undo > Confirm

**Undo is better than confirmation dialogs** — users click through confirmations mindlessly. Remove from UI immediately, show undo toast (DaisyUI `toast` + `alert`), actually delete after toast expires. Use confirmation only for truly irreversible or high-cost actions.

## Keyboard Navigation Patterns

### Roving Tabindex

For component groups (tabs, menu items, radio groups), one item is tabbable; arrow keys move within:

```html
<!-- DaisyUI tabs with roving tabindex -->
<div role="tablist" class="tabs tabs-bordered">
  <button role="tab" class="tab tab-active" tabindex="0">Tab 1</button>
  <button role="tab" class="tab" tabindex="-1">Tab 2</button>
  <button role="tab" class="tab" tabindex="-1">Tab 3</button>
</div>
```

### Skip Links

Provide skip links for keyboard users to jump past navigation. Hide off-screen, show on focus.

## Gesture Discoverability

Swipe-to-delete and similar gestures are invisible. Always provide a visible fallback (menu, button). Don't rely on gestures as the only way to perform actions.

---

**Avoid**: Removing focus indicators without alternatives. Using placeholder text as labels. Touch targets <44x44px. Generic error messages. Custom controls without ARIA/keyboard support.

**Related skill**: `/htmx-pattern-library` — HTMX interaction patterns for server-driven UI
**Related skill**: `/htmx-alpine-templates` — combined HTMX + Alpine.js template patterns
