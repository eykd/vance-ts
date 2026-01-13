---
name: worker-request-handler
description: 'Use when: (1) creating route handlers for pages/partials, (2) extracting form/query data, (3) connecting handlers to use cases, (4) returning HTML with HX-Trigger headers, (5) implementing middleware (auth/errors/logging).'
---

# Worker Request Handler

Generate typed request handlers that extract/validate request data, call use cases, and return HTML responses for HTMX.

## Handler Class Structure

```typescript
// src/presentation/handlers/TaskHandlers.ts
import type { TaskRepository } from '@domain/interfaces/TaskRepository';
import type { CreateTask } from '@application/use-cases/CreateTask';
import { baseLayout } from '../templates/layouts/base';
import { taskList, taskItem } from '../templates/partials/task-list';

export class TaskHandlers {
  constructor(
    private createTask: CreateTask,
    private taskRepository: TaskRepository
  ) {}

  async listTasks(request: Request): Promise<Response> {
    const tasks = await this.taskRepository.findAll();
    return this.htmlResponse(taskList(tasks));
  }

  async createTask(request: Request): Promise<Response> {
    const formData = await request.formData();
    const title = formData.get('title') as string;

    if (!title || title.trim().length < 3) {
      return this.htmlResponse(
        `<div class="alert alert-error">Title must be at least 3 characters</div>`,
        400
      );
    }

    const task = await this.createTask.execute({ title: title.trim() });

    return this.htmlResponse(taskItem(task), 201, {
      'HX-Trigger': JSON.stringify({
        notify: { message: 'Task created!', type: 'success' },
      }),
    });
  }

  private htmlResponse(html: string, status = 200, headers: Record<string, string> = {}): Response {
    return new Response(html, {
      status,
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers },
    });
  }
}
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
