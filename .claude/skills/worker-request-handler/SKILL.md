---
name: worker-request-handler
description: 'Use when: (1) creating Hono route handlers for pages/partials, (2) extracting form/query data, (3) connecting handlers to use cases, (4) returning HTML with HX-Trigger headers, (5) implementing middleware (auth/errors/logging).'
---

# Worker Request Handler

Generate typed Hono route handlers that extract/validate request data, call use cases, and return HTML responses for HTMX.

## Handler Structure

```typescript
// src/presentation/handlers/taskHandlers.ts
import type { Context } from 'hono';
import type { Env } from '../../types/env';
import type { TaskRepository } from '../../domain/interfaces/TaskRepository';
import type { CreateTask } from '../../application/use-cases/CreateTask';
import { baseLayout } from '../templates/layouts/base';
import { taskList, taskItem } from '../templates/partials/task-list';

type AppContext = Context<{ Bindings: Env }>;

export function createTaskHandlers(createTaskUseCase: CreateTask, taskRepository: TaskRepository) {
  return {
    async listTasks(c: AppContext): Promise<Response> {
      const tasks = await taskRepository.findAll();
      return c.html(taskList(tasks));
    },

    async createTask(c: AppContext): Promise<Response> {
      const formData = await c.req.formData();
      const title = formData.get('title') as string;

      if (!title || title.trim().length < 3) {
        return c.html(
          `<div class="alert alert-error">Title must be at least 3 characters</div>`,
          400
        );
      }

      const task = await createTaskUseCase.execute({ title: title.trim() });

      c.header(
        'HX-Trigger',
        JSON.stringify({
          notify: { message: 'Task created!', type: 'success' },
        })
      );
      return c.html(taskItem(task), 201);
    },
  };
}
```

## Hono App Registration

```typescript
// src/worker.ts
import { Hono } from 'hono';
import type { Env } from './types/env';
import { createTaskHandlers } from './presentation/handlers/taskHandlers';

const app = new Hono<{ Bindings: Env }>();

// Wire up dependencies and register routes
app.get('/app/_/tasks', async (c) => {
  const handlers = createTaskHandlers(/* dependencies */);
  return handlers.listTasks(c);
});

app.post('/app/_/tasks', async (c) => {
  const handlers = createTaskHandlers(/* dependencies */);
  return handlers.createTask(c);
});

export default app;
```

## Core Patterns

| Response Type    | Status | HX-Trigger      | Use Case             |
| ---------------- | ------ | --------------- | -------------------- |
| Full page        | 200    | —               | Initial page load    |
| HTML partial     | 200    | Optional notify | HTMX swap            |
| Created item     | 201    | notify success  | Form submission      |
| Validation error | 400    | —               | Invalid input        |
| Empty (delete)   | 200    | notify info     | Item removal         |
| Not found        | 404    | —               | Missing resource     |
| Redirect         | 303    | —               | Post-submit redirect |

## Detailed References

- **Request data extraction**: See [references/request-extraction.md](references/request-extraction.md)
- **HTMX response patterns**: See [references/htmx-responses.md](references/htmx-responses.md)
- **Middleware (auth, errors, logging)**: See [references/middleware.md](references/middleware.md)
