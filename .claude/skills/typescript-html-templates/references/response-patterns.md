# Response Patterns

Patterns for returning HTML responses with proper headers and status codes.

## HTML Response Helper

```typescript
function htmlResponse(html: string, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers },
  });
}
```

## Response Status Codes

| Status | When to Use             | HX-Trigger      |
| ------ | ----------------------- | --------------- |
| 200    | Success, partial update | Optional notify |
| 201    | Resource created        | notify success  |
| 204    | Deleted (no content)    | notify info     |
| 400    | Validation error        | —               |
| 404    | Not found               | —               |
| 500    | Server error            | —               |

## HX-Trigger Notification

Send events to Alpine.js toast container:

```typescript
// Success notification
return htmlResponse(html, 200, {
  'HX-Trigger': JSON.stringify({
    notify: { message: 'Saved successfully!', type: 'success' },
  }),
});

// Error notification
return htmlResponse(html, 400, {
  'HX-Trigger': JSON.stringify({
    notify: { message: 'Please fix the errors below', type: 'error' },
  }),
});

// Info notification
return htmlResponse(html, 200, {
  'HX-Trigger': JSON.stringify({
    notify: { message: 'Item removed', type: 'info' },
  }),
});
```

## Multiple HX-Triggers

```typescript
return htmlResponse(html, 201, {
  'HX-Trigger': JSON.stringify({
    notify: { message: 'Comment posted!', type: 'success' },
    refreshCommentCount: true,
    closeModal: true,
  }),
});
```

## Created Resource Pattern

```typescript
async function handleCreateTask(request: Request): Promise<Response> {
  const formData = await request.formData();
  const title = formData.get('title') as string;

  // Validation...
  const task = await createTask.execute({ title: title.trim() });

  return htmlResponse(taskItem(task), 201, {
    'HX-Trigger': JSON.stringify({
      notify: { message: 'Task created!', type: 'success' },
    }),
  });
}
```

## Delete Pattern (Empty Response)

```typescript
async function handleDeleteTask(taskId: string): Promise<Response> {
  await taskRepository.delete(taskId);

  // Return empty response - HTMX will remove the element
  return htmlResponse('', 200, {
    'HX-Trigger': JSON.stringify({
      notify: { message: 'Task deleted', type: 'info' },
    }),
  });
}
```

## Redirect After Submit

```typescript
// Using HX-Redirect header
return new Response(null, {
  status: 200,
  headers: {
    'HX-Redirect': '/dashboard',
  },
});

// Traditional redirect (non-HTMX)
return new Response(null, {
  status: 303,
  headers: {
    Location: '/dashboard',
  },
});
```

## Swap Strategies via Headers

```typescript
// Force different swap behavior
return htmlResponse(html, 200, {
  'HX-Reswap': 'outerHTML',
  'HX-Retarget': '#container',
});

// Refresh entire page
return new Response(null, {
  status: 200,
  headers: {
    'HX-Refresh': 'true',
  },
});
```

## Response Builder Class

```typescript
class HtmlResponseBuilder {
  private headers: Record<string, string> = {
    'Content-Type': 'text/html; charset=utf-8',
  };
  private triggers: Record<string, unknown> = {};

  notify(message: string, type: 'success' | 'error' | 'info'): this {
    this.triggers['notify'] = { message, type };
    return this;
  }

  trigger(event: string, data?: unknown): this {
    this.triggers[event] = data ?? true;
    return this;
  }

  redirect(url: string): Response {
    return new Response(null, {
      status: 200,
      headers: { 'HX-Redirect': url },
    });
  }

  build(html: string, status = 200): Response {
    if (Object.keys(this.triggers).length > 0) {
      this.headers['HX-Trigger'] = JSON.stringify(this.triggers);
    }
    return new Response(html, { status, headers: this.headers });
  }
}

// Usage
return new HtmlResponseBuilder()
  .notify('Task created!', 'success')
  .trigger('refreshTaskCount')
  .build(taskItem(task), 201);
```

## See Also

- [Template Functions](./template-functions.md) - Creating HTML strings
- [Error Responses](./error-responses.md) - Error response patterns
