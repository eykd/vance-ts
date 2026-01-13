---
name: hypermedia-pattern-advisor
description: Advisor for hypermedia-driven web development with HTMX and Alpine.js. Use when deciding between HTMX vs Alpine.js for interactions, selecting hx-trigger strategies, choosing swap strategies (innerHTML, outerHTML, beforeend, etc.), or identifying when to use out-of-band updates. Also use when building interactive web apps with HTMX/Alpine.js patterns, troubleshooting hypermedia interactions, or optimizing client-server communication patterns.
---

# Hypermedia Pattern Advisor

Guide for making effective HTMX and Alpine.js pattern decisions.

## Quick Decision: HTMX vs Alpine.js

| Need                      | Tool       | Reason                          |
| ------------------------- | ---------- | ------------------------------- |
| Server data               | **HTMX**   | Server is source of truth       |
| Form submission           | **HTMX**   | Server validates + persists     |
| List CRUD                 | **HTMX**   | Data changes require server     |
| Search/filter (server)    | **HTMX**   | Server does filtering           |
| Navigation                | **HTMX**   | `hx-boost` for SPA feel         |
| Dropdown/accordion        | **Alpine** | Pure UI state                   |
| Modal open/close          | **Alpine** | No server needed                |
| Tabs (client-only)        | **Alpine** | View state only                 |
| Form validation (instant) | **Alpine** | Immediate feedback              |
| Animations/transitions    | **Alpine** | `x-transition`                  |
| Load + client filter      | **Both**   | HTMX loads, Alpine filters      |
| Optimistic UI             | **Both**   | Alpine immediate, HTMX confirms |
| Complex forms             | **Both**   | Alpine validation, HTMX submit  |

## Trigger Strategy Reference

For common triggers, use directly. For complex patterns, see [references/triggers.md](references/triggers.md).

**Common triggers:**

- `click` (default for buttons)
- `submit` (default for forms)
- `change` (selects, checkboxes)
- `keyup changed delay:300ms` (search inputs)
- `load` (on page load)
- `revealed` (lazy loading)
- `every Ns` (polling)
- `intersect once` (analytics/tracking)

## Swap Strategy Quick Reference

| Strategy     | Use Case                              |
| ------------ | ------------------------------------- |
| `innerHTML`  | Replace contents, keep container      |
| `outerHTML`  | Replace entire element (item updates) |
| `beforeend`  | Append new items to list              |
| `afterbegin` | Prepend new items                     |
| `delete`     | Remove element on success             |
| `none`       | Fire-and-forget (analytics, toggle)   |

For detailed examples and edge cases, see [references/swap-patterns.md](references/swap-patterns.md).

## Out-of-Band Updates

Use OOB when single action affects multiple page regions.

**Pattern:** Include `hx-swap-oob="true"` on elements in response:

```html
<!-- Primary target gets swapped normally -->
<div id="task-list">Updated list</div>
<!-- OOB elements swap by ID automatically -->
<div id="task-count" hx-swap-oob="true">5 tasks</div>
<div id="notifications" hx-swap-oob="beforeend">New item!</div>
```

**When to use OOB:**

- Counter updates (cart count, notification badge)
- Status indicators across page
- Related content updates (sidebar reflects main content change)
- Toast/notification injection

For complete OOB patterns, see [references/oob-patterns.md](references/oob-patterns.md).

## Combining HTMX + Alpine

**State preservation:** Use `hx-swap="morph"` with `hx-ext="alpine-morph"` to preserve Alpine state across HTMX swaps.

**Event bridge:** Listen to HTMX events in Alpine:

```html
<div
  x-data="{ loading: false }"
  @htmx:before-request.window="loading = true"
  @htmx:after-request.window="loading = false"
></div>
```

For detailed combination patterns, see [references/combination-patterns.md](references/combination-patterns.md).
