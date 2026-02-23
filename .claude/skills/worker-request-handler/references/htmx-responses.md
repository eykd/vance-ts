# HTMX Response Patterns

## Table of Contents

- [HTML Response Helper](#html-response-helper)
- [Full Page Responses](#full-page-responses)
- [Partial Responses](#partial-responses)
- [HX-Trigger Headers](#hx-trigger-headers)
- [Error Responses](#error-responses)
- [Redirect Patterns](#redirect-patterns)

## HTML Response Helper

With Hono, use the built-in `c.html()` helper for HTML responses:

```typescript
import type { Context } from 'hono';
import type { Env } from '../../types/env';

type AppContext = Context<{ Bindings: Env }>;

// Simple HTML response (200)
return c.html('<div>Hello</div>');

// HTML response with status code
return c.html('<div class="alert alert-error">Bad request</div>', 400);

// HTML response with additional headers
c.header('HX-Trigger', JSON.stringify({ notify: { message: 'Done!' } }));
return c.html('<div>Content</div>');
```

## Full Page Responses

For initial page loads (non-HTMX requests):

```typescript
async function tasksPage(c: AppContext): Promise<Response> {
  const tasks = await taskRepository.findAll();
  const content = tasksPageTemplate(tasks);
  return c.html(baseLayout({ title: 'Tasks', content }));
}

// Template: src/presentation/templates/layouts/base.ts
export function baseLayout(props: { title: string; content: string }): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(props.title)} | My App</title>
      <link rel="stylesheet" href="/css/app.css">
      <script src="/js/htmx.min.js"></script>
      <script defer src="/js/alpine.min.js"></script>
    </head>
    <body hx-boost="true">
      <main class="container mx-auto p-4">
        ${props.content}
      </main>
    </body>
    </html>
  `;
}
```

## Partial Responses

For HTMX requests returning HTML fragments:

### List Item Append

```typescript
// POST /app/_/tasks - returns single item to append
async function createTask(c: AppContext): Promise<Response> {
  // ... validation and creation ...
  const task = await createTaskUseCase.execute({ title });

  c.header(
    'HX-Trigger',
    JSON.stringify({
      notify: { message: 'Task created!', type: 'success' },
    })
  );
  return c.html(taskItem(task), 201);
}

// Form: hx-target="#task-list" hx-swap="beforeend"
```

### Item Replacement

```typescript
// PATCH /app/_/tasks/:id - returns updated item
async function updateTask(c: AppContext): Promise<Response> {
  const id = c.req.param('id');
  const task = await taskRepository.findById(id);
  if (!task) {
    return c.html('<div class="alert alert-warning">Not found</div>', 404);
  }

  const formData = await c.req.formData();
  const completed = formData.get('completed') === 'true';

  task.setCompleted(completed);
  await taskRepository.save(task);

  return c.html(taskItem(task));
}

// Checkbox: hx-target="closest .task-item" hx-swap="outerHTML"
```

### Item Deletion

```typescript
// DELETE /app/_/tasks/:id - returns empty (element removed)
async function deleteTask(c: AppContext): Promise<Response> {
  const id = c.req.param('id');
  await taskRepository.delete(id);

  c.header(
    'HX-Trigger',
    JSON.stringify({
      notify: { message: 'Task deleted', type: 'info' },
    })
  );
  return c.body('', 200);
}

// Button: hx-target="closest .task-item" hx-swap="outerHTML"
```

### Full List Refresh

```typescript
// GET /app/_/tasks - returns complete list
async function listTasks(c: AppContext): Promise<Response> {
  const tasks = await taskRepository.findAll();
  return c.html(taskList(tasks));
}

// Container: hx-get="/app/_/tasks" hx-trigger="load"
```

## HX-Trigger Headers

### Notification Events

```typescript
// Success notification
c.header(
  'HX-Trigger',
  JSON.stringify({
    notify: { message: 'Created!', type: 'success' },
  })
);
return c.html(html, 201);

// Error notification
c.header(
  'HX-Trigger',
  JSON.stringify({
    notify: { message: 'Validation failed', type: 'error' },
  })
);
return c.html(html, 400);

// Info notification
c.header(
  'HX-Trigger',
  JSON.stringify({
    notify: { message: 'Deleted', type: 'info' },
  })
);
return c.body('', 200);
```

### Multiple Events

```typescript
c.header(
  'HX-Trigger',
  JSON.stringify({
    notify: { message: 'Task updated', type: 'success' },
    'task-updated': { id: task.id },
    'refresh-sidebar': true,
  })
);
return c.html(html);
```

### Client-Side Listener (Alpine.js)

```html
<div
  x-data="{ notifications: [] }"
  @notify.window="notifications.push({...$event.detail, id: Date.now()})"
>
  <template x-for="n in notifications" :key="n.id">
    <div
      class="alert"
      :class="'alert-' + n.type"
      x-init="setTimeout(() => notifications = notifications.filter(x => x.id !== n.id), 3000)"
    >
      <span x-text="n.message"></span>
    </div>
  </template>
</div>
```

## Error Responses

### Inline Validation Error

```typescript
// Return error in place of expected content
async function createTask(c: AppContext): Promise<Response> {
  const formData = await c.req.formData();
  const title = (formData.get('title') as string)?.trim();

  if (!title || title.length < 3) {
    return c.html(
      `<div class="alert alert-error">
        <span>Title must be at least 3 characters</span>
      </div>`,
      400
    );
  }
  // ...
}
```

### Form Re-render with Errors

```typescript
async function createTask(c: AppContext): Promise<Response> {
  const formData = await c.req.formData();
  const title = (formData.get('title') as string)?.trim();
  const errors: Record<string, string> = {};

  if (!title || title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (Object.keys(errors).length > 0) {
    // Re-render form with errors, preserving input values
    return c.html(taskForm({ title }, errors), 400);
  }
  // ...
}

// Template with error display
function taskForm(values: Partial<TaskFormData>, errors: Record<string, string> = {}): string {
  return `
    <form hx-post="/app/_/tasks" hx-target="#task-list" hx-swap="beforeend">
      <div class="form-control">
        <input type="text" name="title"
               value="${escapeHtml(values.title ?? '')}"
               class="input input-bordered ${errors.title ? 'input-error' : ''}">
        ${errors.title ? `<span class="text-error text-sm">${escapeHtml(errors.title)}</span>` : ''}
      </div>
      <button type="submit" class="btn btn-primary">Add</button>
    </form>
  `;
}
```

### Not Found Response

```typescript
async function getTask(c: AppContext): Promise<Response> {
  const id = c.req.param('id');
  const task = await taskRepository.findById(id);

  if (!task) {
    return c.html(`<div class="alert alert-warning">Task not found</div>`, 404);
  }

  return c.html(taskDetail(task));
}
```

## Redirect Patterns

### Post-Submit Redirect

```typescript
// HX-Redirect header for client-side redirect
async function createTask(c: AppContext): Promise<Response> {
  // ... create task ...

  c.header('HX-Redirect', `/tasks/${task.id}`);
  return c.body('', 201);
}
```

### Standard HTTP Redirect

```typescript
// For non-HTMX requests or full page redirects
async function logout(c: AppContext): Promise<Response> {
  // ... clear session ...
  return c.redirect('/login', 303);
}
```

### Conditional Redirect

```typescript
async function createTask(c: AppContext): Promise<Response> {
  // ... create task ...

  // Check if HTMX request
  const isHtmx = c.req.header('HX-Request') === 'true';

  if (isHtmx) {
    c.header('HX-Trigger', JSON.stringify({ notify: { message: 'Created!' } }));
    return c.html(taskItem(task), 201);
  } else {
    return c.redirect(`/tasks/${task.id}`, 303);
  }
}
```
