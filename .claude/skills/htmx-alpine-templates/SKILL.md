---
name: htmx-alpine-templates
description: 'Use when: (1) creating HTML layouts/pages/partials, (2) adding HTMX interactivity, (3) implementing Alpine.js components, (4) using DaisyUI 5 components, (5) building server-rendered UI with partial updates.'
---

# HTMX + Alpine.js HTML Templates

Generate HTML templates as TypeScript tagged template literals for hypermedia-driven applications.

## Template Structure

Templates for Worker-rendered pages live under `app/` (served at `/app/*`):

```
templates/
├── layouts/       # Page scaffolding (base.ts)
└── app/           # Worker-rendered application pages (/app/*)
    ├── dashboard.ts   # /app (dashboard page)
    ├── tasks.ts       # /app/tasks
    └── partials/      # HTMX fragments (/app/_/*)
        ├── task-item.ts
        └── task-list.ts
```

Note: Marketing pages (/, /about, /pricing) are static HTML served from `public/`, not Worker templates.

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

## Key Patterns

For HTMX vs Alpine decisions, see **hypermedia-pattern-advisor**.

For specific implementation patterns (forms, search, loading, OOB, UI components), see **htmx-pattern-library**.

## Template References

- **HTMX patterns**: See [references/htmx-patterns.md](references/htmx-patterns.md) for swap strategies, triggers, loading states, OOB updates
- **Alpine.js patterns**: See [references/alpine-patterns.md](references/alpine-patterns.md) for components, events, transitions
- **Combined patterns**: See [references/combined-patterns.md](references/combined-patterns.md) for HTMX+Alpine integration
- **DaisyUI components**: See [references/daisyui-components.md](references/daisyui-components.md) for TailwindCSS 4 + DaisyUI 5 reference

## Related HTMX Skills

**Workflow**: Use hypermedia-pattern-advisor for decisions → Use htmx-pattern-library for implementations → Use this skill for complete examples

1. **hypermedia-pattern-advisor** - Decision guidance (HTMX vs Alpine, swap/trigger strategies)
   - Quick decision tables
   - When to use each tool
   - Combination strategies

2. **htmx-pattern-library** - Implementation patterns (forms, loading, search, OOB, UI components)
   - Complete code examples for each pattern
   - Server response formats
   - Reference files for deep dives
