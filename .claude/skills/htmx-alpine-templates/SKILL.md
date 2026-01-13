---
name: htmx-alpine-templates
description: 'Use when: (1) creating HTML layouts/pages/partials, (2) adding HTMX interactivity, (3) implementing Alpine.js components, (4) using DaisyUI 5 components, (5) building server-rendered UI with partial updates.'
---

# HTMX + Alpine.js HTML Templates

Generate HTML templates as TypeScript tagged template literals for hypermedia-driven applications.

## Template Structure

```
templates/
├── layouts/    # Page scaffolding (base.ts)
├── pages/      # Full page renders (tasks.ts, home.ts)
└── partials/   # HTMX fragments (task-item.ts, task-list.ts)
```

## Core Template Pattern

```typescript
// Always escape dynamic content
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

// Layout template
export function baseLayout({ title, content }: { title: string; content: string }): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/css/app.css">
  <script src="/js/htmx.min.js" defer></script>
  <script src="/js/alpine.min.js" defer></script>
</head>
<body class="min-h-screen bg-base-200">
  <main class="container mx-auto px-4 py-8">${content}</main>
</body>
</html>`;
}

// Page template
export function tasksPage(tasks: Task[]): string {
  return `
    <h1 class="text-3xl font-bold mb-8">Tasks</h1>
    ${taskForm()}
    <ul id="task-list">${tasks.map(taskItem).join('')}</ul>
  `;
}

// Partial template (returned by HTMX endpoints)
export function taskItem(task: Task): string {
  return `<li class="task-item p-3 bg-base-200 rounded-lg">
    ${escapeHtml(task.title)}
  </li>`;
}
```

## HTMX vs Alpine.js Decision

| Scenario                  | Use    | Why                               |
| ------------------------- | ------ | --------------------------------- |
| Form submission           | HTMX   | Server validates, returns HTML    |
| Data list updates         | HTMX   | Server is source of truth         |
| Search/filtering (server) | HTMX   | Server queries database           |
| Dropdown open/close       | Alpine | Pure UI state                     |
| Modal toggle              | Alpine | No server needed                  |
| Client-side validation    | Alpine | Immediate feedback                |
| Tabs (client-only)        | Alpine | No data fetch                     |
| Optimistic UI + confirm   | Both   | Alpine for instant, HTMX confirms |
| Load then filter          | Both   | HTMX loads, Alpine filters        |

## Quick Reference

### HTMX Essentials

```html
<!-- GET request, swap target's innerHTML -->
<button hx-get="/api/items" hx-target="#list">Load</button>

<!-- POST form, append to list -->
<form hx-post="/api/items" hx-target="#list" hx-swap="beforeend">
  <!-- DELETE with confirmation -->
  <button hx-delete="/api/items/1" hx-confirm="Sure?" hx-target="closest .item" hx-swap="outerHTML">
    <!-- Debounced search -->
    <input hx-get="/search" hx-trigger="keyup changed delay:300ms" hx-target="#results" name="q" />
  </button>
</form>
```

### Alpine.js Essentials

```html
<!-- Toggle visibility -->
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open" x-transition>Content</div>
</div>

<!-- Two-way binding -->
<input x-model="search" type="text" />
<span x-text="search"></span>

<!-- Loop -->
<template x-for="item in items" :key="item.id">
  <div x-text="item.name"></div>
</template>
```

### DaisyUI 5 Components

```html
<button class="btn btn-primary">Button</button>
<input class="input input-bordered w-full" type="text" />
<div class="card bg-base-100 shadow"><div class="card-body">Content</div></div>
<div class="alert alert-info"><span>Message</span></div>
<span class="loading loading-spinner"></span>
```

## Detailed References

- **HTMX patterns**: See [references/htmx-patterns.md](references/htmx-patterns.md) for swap strategies, triggers, loading states, OOB updates
- **Alpine.js patterns**: See [references/alpine-patterns.md](references/alpine-patterns.md) for components, events, transitions
- **Combined patterns**: See [references/combined-patterns.md](references/combined-patterns.md) for HTMX+Alpine integration
- **DaisyUI components**: See [references/daisyui-components.md](references/daisyui-components.md) for TailwindCSS 4 + DaisyUI 5 reference
