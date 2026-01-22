---
name: hypermedia-pattern-advisor
description: 'Use when: (1) deciding HTMX vs Alpine.js for interactions, (2) selecting hx-trigger strategies, (3) choosing swap strategies, (4) using out-of-band updates, (5) troubleshooting hypermedia interactions.'
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

Use OOB when single action affects multiple page regions (counter updates, status indicators, related content updates, toast notifications).

**Decision guidance:**

- Single region update → Standard `hx-target`
- Multiple regions from one response → OOB with `hx-swap-oob="true"`
- Unrelated notifications → OOB with `beforeend` to notification container

For complete implementation patterns and examples, see:

- **htmx-pattern-library**: [references/oob.md](../htmx-pattern-library/references/oob.md) - Implementation patterns

## Combining HTMX + Alpine

**State preservation:** Use `hx-swap="morph"` with `hx-ext="alpine-morph"` to preserve Alpine state across HTMX swaps.

**Event bridge:** Listen to HTMX events in Alpine for coordinated behavior.

For detailed combination patterns, see [references/combination-patterns.md](references/combination-patterns.md).

## Related HTMX Skills

**Workflow**: Use this skill for decisions → Use pattern-library for implementations → Use templates for complete examples

1. **htmx-pattern-library** - Implementation patterns (forms, loading, search, OOB, UI components)
   - Complete code examples for each pattern
   - Server response formats
   - Reference files for deep dives

2. **htmx-alpine-templates** - Complete template examples (full pages, complex scenarios)
   - TypeScript template literal patterns
   - Page layouts and partials
   - DaisyUI 5 integration
