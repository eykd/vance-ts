# Error Handling Patterns

## Table of Contents

- [Domain Exceptions](#domain-exceptions)
- [Result Pattern](#result-pattern)
- [Handler Error Responses](#handler-error-responses)

## Domain Exceptions

### Define in Domain Layer

```typescript
// src/domain/errors/DomainError.ts
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// src/domain/errors/TaskNotFoundError.ts
export class TaskNotFoundError extends DomainError {
  readonly code = 'TASK_NOT_FOUND';

  constructor(public readonly taskId: string) {
    super(`Task not found: ${taskId}`);
  }
}

// src/domain/errors/ValidationError.ts
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';

  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
  }
}
```

### Throw from Domain Entities

```typescript
// src/domain/entities/Task.ts
export class Task {
  static create(props: { title: string; userId: string }): Task {
    if (!props.title || props.title.trim().length < 3) {
      throw new ValidationError('Task title must be at least 3 characters', 'title');
    }
    // ...
  }

  complete(): void {
    if (this._status.isCompleted) {
      throw new InvalidOperationError('Task is already completed');
    }
    this._status = TaskStatus.completed();
  }
}
```

### Catch in Handler

```typescript
// src/presentation/middleware/errorHandler.ts
export function errorHandler(error: unknown): Response {
  if (error instanceof TaskNotFoundError) {
    return new Response('Task not found', { status: 404 });
  }

  if (error instanceof ValidationError) {
    return htmlResponse(`<div class="alert alert-error">${escapeHtml(error.message)}</div>`, 400);
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);
  return new Response('Internal server error', { status: 500 });
}
```

## Result Pattern

Alternative to exceptions for expected failures:

### Define Result Type

```typescript
// src/domain/types/Result.ts
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export const Result = {
  ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
  },

  err<E>(error: E): Result<never, E> {
    return { ok: false, error };
  },
};
```

### Use in Use Case

```typescript
// src/application/use-cases/CompleteTask.ts
export type CompleteTaskError =
  | { type: 'not_found'; taskId: string }
  | { type: 'already_completed' };

export class CompleteTask {
  async execute(request: { taskId: string }): Promise<Result<TaskResponse, CompleteTaskError>> {
    const task = await this.taskRepository.findById(request.taskId);
    if (!task) {
      return Result.err({ type: 'not_found', taskId: request.taskId });
    }

    if (task.isCompleted) {
      return Result.err({ type: 'already_completed' });
    }

    task.complete();
    await this.taskRepository.save(task);

    return Result.ok(this.toResponse(task));
  }
}
```

### Handle in Handler

```typescript
async completeTask(request: Request, id: string): Promise<Response> {
  const result = await this.completeTaskUseCase.execute({ taskId: id });

  if (!result.ok) {
    switch (result.error.type) {
      case "not_found":
        return new Response("Task not found", { status: 404 });
      case "already_completed":
        return htmlResponse(
          `<div class="alert alert-warning">Task is already completed</div>`,
          400
        );
    }
  }

  return this.htmlResponse(taskItem(result.value));
}
```

## Handler Error Responses

### HTMX-Friendly Errors

Return HTML that can be swapped into the page:

```typescript
private errorResponse(message: string, status = 400): Response {
  return new Response(
    `<div class="alert alert-error" role="alert">
      <span>${escapeHtml(message)}</span>
    </div>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    }
  );
}
```

### With HX-Trigger for Toast Notifications

```typescript
private errorResponse(message: string, status = 400): Response {
  return new Response("", {
    status,
    headers: {
      "HX-Trigger": JSON.stringify({
        notify: { message, type: "error", id: Date.now() }
      })
    }
  });
}
```

### Error Response Matrix

| Error Type       | HTTP Status | Response Type       |
| ---------------- | ----------- | ------------------- |
| Validation error | 400         | Inline HTML alert   |
| Not found        | 404         | Empty or message    |
| Unauthorized     | 401         | Redirect or message |
| Conflict         | 409         | Inline HTML alert   |
| Server error     | 500         | Generic message     |

### Guideline: Exceptions vs Result

| Scenario                 | Approach                    |
| ------------------------ | --------------------------- |
| Programming errors       | Throw exception             |
| Business rule violations | Either (prefer consistency) |
| Expected "not found"     | Result pattern              |
| Infrastructure failures  | Throw exception             |
| Validation failures      | Domain exception or Result  |
