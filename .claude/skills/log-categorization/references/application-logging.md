# Application Logging

**Purpose**: Guidance for logging request flow, validation, and use case execution in the application layer

## When to Use

When logging from request handlers, use cases, middleware, or application services. Use application logs to track how requests flow through the system and how business operations are orchestrated.

## Pattern

```typescript
// src/application/use-cases/CompleteTask.ts
export interface ApplicationLogger {
  info(fields: ApplicationLogFields): void;
  warn(fields: ApplicationLogFields): void;
  error(fields: ApplicationLogFields): void;
}

interface ApplicationLogFields {
  event: string;
  category: 'application';
  http_method?: string;
  http_path?: string;
  http_status?: number;
  duration_ms?: number;
  [key: string]: unknown;
}

export class CompleteTaskUseCase {
  async execute(
    request: CompleteTaskRequest,
    logger: ApplicationLogger
  ): Promise<CompleteTaskResponse> {
    const startTime = Date.now();

    logger.info({
      event: 'use_case.complete_task.started',
      category: 'application',
      task_id: request.taskId,
      user_id: request.userId,
    });

    try {
      const task = await this.taskRepository.findById(request.taskId);

      if (!task) {
        logger.warn({
          event: 'use_case.complete_task.task_not_found',
          category: 'application',
          task_id: request.taskId,
          user_id: request.userId,
        });
        return { success: false, error: 'TASK_NOT_FOUND' };
      }

      task.complete(logger.forDomain());

      await this.taskRepository.save(task);

      logger.info({
        event: 'use_case.complete_task.succeeded',
        category: 'application',
        task_id: request.taskId,
        user_id: request.userId,
        duration_ms: Date.now() - startTime,
      });

      return { success: true };
    } catch (error) {
      logger.error({
        event: 'use_case.complete_task.failed',
        category: 'application',
        task_id: request.taskId,
        user_id: request.userId,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
        duration_ms: Date.now() - startTime,
      });
      throw error;
    }
  }
}
```

## Required Fields

Application logs **should** include:

- `category: 'application'`
- `event`: Dot-notation event name (e.g., "use_case.complete_task.started")
- `duration_ms`: Operation timing when operation completes
- HTTP context when relevant: `http_method`, `http_path`, `http_status`

## Characteristics

Application logs should:

- Track request flow through the system
- Include timing information for performance monitoring
- Capture validation failures and business rule violations
- Bridge between external requests and domain operations
- Include user context for authorization tracking

## Example Usage

### HTTP Request Handler

```typescript
// src/presentation/handlers/taskHandler.ts
export async function handleCompleteTask(
  request: Request,
  env: Env,
  logger: ApplicationLogger
): Promise<Response> {
  const startTime = Date.now();
  const url = new URL(request.url);

  logger.info({
    event: 'http.request.received',
    category: 'application',
    http_method: request.method,
    http_path: url.pathname,
  });

  try {
    const { taskId } = await request.json();

    const useCase = new CompleteTaskUseCase(env.DB);
    const result = await useCase.execute({ taskId, userId: 'user-123' }, logger);

    const status = result.success ? 200 : 404;

    logger.info({
      event: 'http.response.sent',
      category: 'application',
      http_method: request.method,
      http_path: url.pathname,
      http_status: status,
      duration_ms: Date.now() - startTime,
    });

    return Response.json(result, { status });
  } catch (error) {
    logger.error({
      event: 'http.request.failed',
      category: 'application',
      http_method: request.method,
      http_path: url.pathname,
      http_status: 500,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - startTime,
    });

    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### Validation Logging

```typescript
// src/application/validators/taskValidator.ts
export class TaskValidator {
  validate(request: CreateTaskRequest, logger: ApplicationLogger): ValidationResult {
    const errors: string[] = [];

    if (!request.title || request.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }

    if (request.title && request.title.length > 200) {
      errors.push('Title must be at most 200 characters');
    }

    if (errors.length > 0) {
      logger.warn({
        event: 'validation.failed',
        category: 'application',
        validator: 'TaskValidator',
        error_count: errors.length,
        // Don't log actual errors - may contain PII
      });
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }
}
```

## Common Mistakes

### ❌ Mistake: Logging Domain Events at Application Layer

```typescript
// Wrong: Domain event logged as application event
logger.info({
  event: 'task.completed', // This is a domain event!
  category: 'application',
  aggregate_type: 'Task',
  domain_event: 'TaskCompleted',
});
```

### ✅ Correct: Separate Domain and Application Events

```typescript
// Application log: orchestration
logger.info({
  event: 'use_case.complete_task.succeeded',
  category: 'application',
  task_id: taskId,
  duration_ms: 45,
});

// Domain log: business event (logged from entity)
task.complete(logger.forDomain());
```

### ❌ Mistake: Including Infrastructure Details

```typescript
logger.info({
  event: 'use_case.complete_task.succeeded',
  category: 'application',
  database_query_time: 15, // Infrastructure concern!
  cache_hit: true, // Infrastructure concern!
});
```

### ✅ Correct: Focus on Application Concerns

```typescript
logger.info({
  event: 'use_case.complete_task.succeeded',
  category: 'application',
  task_id: taskId,
  user_id: userId,
  duration_ms: Date.now() - startTime, // Total use case time
});
```

## Testing

```typescript
// Test application logging behavior
describe('CompleteTaskUseCase', () => {
  it('logs use case execution lifecycle', async () => {
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      forDomain: vi.fn(() => mockDomainLogger),
    };

    const useCase = new CompleteTaskUseCase(mockRepository);
    await useCase.execute({ taskId: 'task-1', userId: 'user-1' }, mockLogger);

    // Started event
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'use_case.complete_task.started',
        category: 'application',
        task_id: 'task-1',
      })
    );

    // Succeeded event with duration
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'use_case.complete_task.succeeded',
        category: 'application',
        task_id: 'task-1',
        duration_ms: expect.any(Number),
      })
    );
  });

  it('logs warning when task not found', async () => {
    const mockRepository = {
      findById: vi.fn().mockResolvedValue(null),
    };

    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const useCase = new CompleteTaskUseCase(mockRepository);
    const result = await useCase.execute({ taskId: 'task-1', userId: 'user-1' }, mockLogger);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'use_case.complete_task.task_not_found',
        category: 'application',
      })
    );

    expect(result.success).toBe(false);
  });

  it('logs error with duration when exception occurs', async () => {
    const mockRepository = {
      findById: vi.fn().mockRejectedValue(new Error('Database error')),
    };

    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const useCase = new CompleteTaskUseCase(mockRepository);

    await expect(
      useCase.execute({ taskId: 'task-1', userId: 'user-1' }, mockLogger)
    ).rejects.toThrow();

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'use_case.complete_task.failed',
        category: 'application',
        error_type: 'Error',
        error_message: 'Database error',
        duration_ms: expect.any(Number),
      })
    );
  });
});
```

## Related References

- [decision-matrix.md](./decision-matrix.md) - Determine if a log belongs to application category
- [domain-logging.md](./domain-logging.md) - Log business events from domain entities
- [infrastructure-logging.md](./infrastructure-logging.md) - Log external system interactions
