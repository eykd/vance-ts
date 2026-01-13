# HTMX Response Patterns

## Table of Contents

- [HTML Response Helper](#html-response-helper)
- [Full Page Responses](#full-page-responses)
- [Partial Responses](#partial-responses)
- [HX-Trigger Headers](#hx-trigger-headers)
- [Error Responses](#error-responses)
- [Redirect Patterns](#redirect-patterns)

## HTML Response Helper

```typescript
// Base helper method in handler class
private htmlResponse(
  html: string,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...headers
    }
  });
}
```

## Full Page Responses

For initial page loads (non-HTMX requests):

```typescript
async tasksPage(request: Request): Promise<Response> {
  const tasks = await this.taskRepository.findAll();
  const content = tasksPageTemplate(tasks);
  return this.htmlResponse(baseLayout({ title: "Tasks", content }));
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
// POST /api/tasks - returns single item to append
async createTask(request: Request): Promise<Response> {
  // ... validation and creation ...
  const task = await this.createTaskUseCase.execute({ title });

  return this.htmlResponse(taskItem(task), 201, {
    "HX-Trigger": JSON.stringify({
      notify: { message: "Task created!", type: "success" }
    })
  });
}

// Form: hx-target="#task-list" hx-swap="beforeend"
```

### Item Replacement

```typescript
// PATCH /api/tasks/:id - returns updated item
async updateTask(request: Request, id: string): Promise<Response> {
  const task = await this.taskRepository.findById(id);
  if (!task) {
    return new Response("Not found", { status: 404 });
  }

  const formData = await request.formData();
  const completed = formData.get("completed") === "true";

  task.setCompleted(completed);
  await this.taskRepository.save(task);

  return this.htmlResponse(taskItem(task));
}

// Checkbox: hx-target="closest .task-item" hx-swap="outerHTML"
```

### Item Deletion

```typescript
// DELETE /api/tasks/:id - returns empty (element removed)
async deleteTask(request: Request, id: string): Promise<Response> {
  await this.taskRepository.delete(id);

  return new Response("", {
    status: 200,
    headers: {
      "HX-Trigger": JSON.stringify({
        notify: { message: "Task deleted", type: "info" }
      })
    }
  });
}

// Button: hx-target="closest .task-item" hx-swap="outerHTML"
```

### Full List Refresh

```typescript
// GET /api/tasks - returns complete list
async listTasks(request: Request): Promise<Response> {
  const tasks = await this.taskRepository.findAll();
  return this.htmlResponse(taskList(tasks));
}

// Container: hx-get="/api/tasks" hx-trigger="load"
```

## HX-Trigger Headers

### Notification Events

```typescript
// Success notification
return this.htmlResponse(html, 201, {
  'HX-Trigger': JSON.stringify({
    notify: { message: 'Created!', type: 'success' },
  }),
});

// Error notification
return this.htmlResponse(html, 400, {
  'HX-Trigger': JSON.stringify({
    notify: { message: 'Validation failed', type: 'error' },
  }),
});

// Info notification
return this.htmlResponse('', 200, {
  'HX-Trigger': JSON.stringify({
    notify: { message: 'Deleted', type: 'info' },
  }),
});
```

### Multiple Events

```typescript
return this.htmlResponse(html, 200, {
  'HX-Trigger': JSON.stringify({
    notify: { message: 'Task updated', type: 'success' },
    'task-updated': { id: task.id },
    'refresh-sidebar': true,
  }),
});
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
async createTask(request: Request): Promise<Response> {
  const formData = await request.formData();
  const title = (formData.get("title") as string)?.trim();

  if (!title || title.length < 3) {
    return this.htmlResponse(
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
async createTask(request: Request): Promise<Response> {
  const formData = await request.formData();
  const title = (formData.get("title") as string)?.trim();
  const errors: Record<string, string> = {};

  if (!title || title.length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  if (Object.keys(errors).length > 0) {
    // Re-render form with errors, preserving input values
    return this.htmlResponse(
      taskForm({ title }, errors),
      400
    );
  }
  // ...
}

// Template with error display
function taskForm(values: Partial<TaskFormData>, errors: Record<string, string> = {}): string {
  return `
    <form hx-post="/api/tasks" hx-target="#task-list" hx-swap="beforeend">
      <div class="form-control">
        <input type="text" name="title"
               value="${escapeHtml(values.title ?? "")}"
               class="input input-bordered ${errors.title ? "input-error" : ""}">
        ${errors.title ? `<span class="text-error text-sm">${escapeHtml(errors.title)}</span>` : ""}
      </div>
      <button type="submit" class="btn btn-primary">Add</button>
    </form>
  `;
}
```

### Not Found Response

```typescript
async getTask(request: Request, id: string): Promise<Response> {
  const task = await this.taskRepository.findById(id);

  if (!task) {
    return this.htmlResponse(
      `<div class="alert alert-warning">Task not found</div>`,
      404
    );
  }

  return this.htmlResponse(taskDetail(task));
}
```

## Redirect Patterns

### Post-Submit Redirect

```typescript
// HX-Redirect header for client-side redirect
async createTask(request: Request): Promise<Response> {
  // ... create task ...

  return new Response("", {
    status: 201,
    headers: {
      "HX-Redirect": `/tasks/${task.id}`
    }
  });
}
```

### Standard HTTP Redirect

```typescript
// For non-HTMX requests or full page redirects
async logout(request: Request): Promise<Response> {
  // ... clear session ...

  return new Response(null, {
    status: 303,
    headers: {
      "Location": "/login"
    }
  });
}
```

### Conditional Redirect

```typescript
async createTask(request: Request): Promise<Response> {
  // ... create task ...

  // Check if HTMX request
  const isHtmx = request.headers.get("HX-Request") === "true";

  if (isHtmx) {
    return this.htmlResponse(taskItem(task), 201, {
      "HX-Trigger": JSON.stringify({ notify: { message: "Created!" } })
    });
  } else {
    return new Response(null, {
      status: 303,
      headers: { "Location": `/tasks/${task.id}` }
    });
  }
}
```
