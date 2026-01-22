---
name: htmx-pattern-library
description: 'Use when building: (1) forms with validation, (2) infinite scroll/lazy loading, (3) search with debouncing, (4) out-of-band updates, (5) loading states/optimistic UI, (6) modals/dropdowns, (7) tabs/accordions.'
---

# HTMX Pattern Library

Copy-paste patterns for HTMX + Alpine.js. Server returns HTML fragments, not JSON.

## Quick Reference

| Pattern          | HTMX                                     | Alpine                     | Reference                                       |
| ---------------- | ---------------------------------------- | -------------------------- | ----------------------------------------------- |
| Form validation  | `hx-post`, `hx-target`                   | Client validation          | [forms.md](references/forms.md)                 |
| Infinite scroll  | `hx-trigger="revealed"`                  | —                          | [loading.md](references/loading.md)             |
| Lazy loading     | `hx-trigger="load"`                      | —                          | [loading.md](references/loading.md)             |
| Debounced search | `hx-trigger="keyup changed delay:300ms"` | —                          | [search.md](references/search.md)               |
| OOB updates      | `hx-swap-oob="true"`                     | —                          | [oob.md](references/oob.md)                     |
| Loading states   | `htmx-indicator`                         | `submitting` state         | [loading.md](references/loading.md)             |
| Optimistic UI    | `hx-swap="none"`                         | Local state                | [loading.md](references/loading.md)             |
| Modal dialogs    | `hx-get` for content                     | `open` state               | [ui-components.md](references/ui-components.md) |
| Dropdowns        | —                                        | `x-data`, `@click.outside` | [ui-components.md](references/ui-components.md) |
| Tabs             | Optional `hx-get`                        | `activeTab` state          | [ui-components.md](references/ui-components.md) |
| Accordions       | Optional `hx-get`                        | `x-collapse`               | [ui-components.md](references/ui-components.md) |

## Core Concepts

**HTMX** handles server communication and DOM updates. **Alpine.js** manages client-only UI state.

For choosing between HTMX vs Alpine, see **hypermedia-pattern-advisor**.

## Server Response Format

Return HTML fragments, not full pages. Include `HX-Trigger` header for events:

```typescript
return new Response(html, {
  headers: {
    'Content-Type': 'text/html',
    'HX-Trigger': JSON.stringify({ notify: { message: 'Done!', type: 'success' } }),
  },
});
```

## Pattern Selection

**Read the appropriate reference file based on what you're building:**

- **Forms with validation** → [references/forms.md](references/forms.md)
- **Infinite scroll, lazy loading, loading indicators, optimistic updates** → [references/loading.md](references/loading.md)
- **Search/filter with debounce** → [references/search.md](references/search.md)
- **Updating multiple page regions from one response** → [references/oob.md](references/oob.md)
- **Modals, dropdowns, tabs, accordions** → [references/ui-components.md](references/ui-components.md)

## Essential HTMX Attributes

| Attribute                | Purpose                                                                   |
| ------------------------ | ------------------------------------------------------------------------- |
| `hx-get/post/put/delete` | HTTP method                                                               |
| `hx-target`              | Element to update (CSS selector)                                          |
| `hx-swap`                | How to swap: `innerHTML`, `outerHTML`, `beforeend`, `afterbegin`          |
| `hx-trigger`             | Event: `click`, `submit`, `keyup changed delay:300ms`, `revealed`, `load` |
| `hx-indicator`           | Loading indicator selector                                                |
| `hx-disabled-elt`        | Disable during request                                                    |
| `hx-confirm`             | Confirmation dialog                                                       |
| `hx-vals`                | Additional values as JSON                                                 |

## Essential Alpine Directives

| Directive           | Purpose                 |
| ------------------- | ----------------------- |
| `x-data`            | Component state         |
| `x-show`            | Toggle visibility       |
| `x-transition`      | Animate show/hide       |
| `x-model`           | Two-way binding         |
| `@click`, `@submit` | Event handlers          |
| `@click.outside`    | Click outside detection |
| `@keydown.escape`   | Keyboard shortcuts      |
| `:class`            | Dynamic classes         |
| `:disabled`         | Dynamic disabled        |

## Related HTMX Skills

**Workflow**: Use hypermedia-pattern-advisor for decisions → Use this skill for implementations → Use htmx-alpine-templates for complete examples

1. **hypermedia-pattern-advisor** - Decision guidance (HTMX vs Alpine, swap/trigger strategies)
   - Quick decision tables
   - When to use each tool
   - Combination strategies

2. **htmx-alpine-templates** - Complete template examples (full pages, complex scenarios)
   - TypeScript template literal patterns
   - Page layouts and partials
   - DaisyUI 5 integration
