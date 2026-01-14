# Logger Factory

**Purpose**: Logger factory with environment-aware configuration and category-specific logger variants.

## When to Use

Use this reference when implementing logger creation patterns that automatically pull request context from AsyncLocalStorage, apply environment-specific configuration, and provide specialized loggers for domain/application/infrastructure layers.

## Pattern

```typescript
// src/infrastructure/logging/index.ts
import { SafeLogger } from './safeLogger';
import { getContext, type RequestContext } from './context';
import type { BaseLogFields, StructuredLogEntry } from './schema';

export interface LoggerOptions {
  service: string;
  environment: string;
  version: string;
}

export function createLogger(options: LoggerOptions): SafeLogger {
  const context = getContext();

  const baseFields: BaseLogFields = {
    request_id: context?.requestId ?? 'no-context',
    trace_id: context?.traceId,
    span_id: context?.spanId,
    timestamp: new Date().toISOString(),
    service: options.service,
    environment: options.environment,
    version: options.version,
    level: 'info',
    event: '',
    category: 'application',
  };

  return new SafeLogger(baseFields, options.environment === 'production');
}

// Convenience loggers for different categories
export function createDomainLogger(options: LoggerOptions) {
  const logger = createLogger(options);
  return {
    info: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.info({ ...fields, category: 'domain' }),
    warn: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.warn({ ...fields, category: 'domain' }),
    error: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.error({ ...fields, category: 'domain' }),
  };
}

export function createApplicationLogger(options: LoggerOptions) {
  const logger = createLogger(options);
  return {
    info: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.info({ ...fields, category: 'application' }),
    warn: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.warn({ ...fields, category: 'application' }),
    error: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.error({ ...fields, category: 'application' }),
  };
}

export function createInfraLogger(options: LoggerOptions) {
  const logger = createLogger(options);
  return {
    debug: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.debug({ ...fields, category: 'infrastructure' }),
    info: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.info({ ...fields, category: 'infrastructure' }),
    warn: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.warn({ ...fields, category: 'infrastructure' }),
    error: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.error({ ...fields, category: 'infrastructure' }),
  };
}

export * from './schema';
export * from './context';
export * from './redaction';
```

## Decision Matrix

| Usage Context              | Logger Factory Function     | Category Auto-Set | Debug Logs? |
| -------------------------- | --------------------------- | ----------------- | ----------- |
| Domain entities/services   | `createDomainLogger()`      | `domain`          | No          |
| Use cases/request handlers | `createApplicationLogger()` | `application`     | No          |
| Repositories/adapters      | `createInfraLogger()`       | `infrastructure`  | Yes         |
| Generic logging            | `createLogger()`            | `application`     | No          |

## Example Usage

### Domain Layer

```typescript
// src/domain/entities/Task.ts
import { createDomainLogger, type LoggerOptions } from '../../infrastructure/logging';

export class Task {
  complete(loggerOptions: LoggerOptions): void {
    const logger = createDomainLogger(loggerOptions);

    if (this.status === TaskStatus.Completed) {
      logger.warn({
        event: 'task.complete.already_completed',
        aggregate_type: 'Task',
        aggregate_id: this.id,
      });
      return;
    }

    this.status = TaskStatus.Completed;
    this.completedAt = new Date();

    logger.info({
      event: 'task.completed',
      aggregate_type: 'Task',
      aggregate_id: this.id,
      domain_event: 'TaskCompleted',
    });
  }
}
```

### Application Layer

```typescript
// src/application/use-cases/CompleteTask.ts
import { createApplicationLogger, type LoggerOptions } from '../../infrastructure/logging';

export class CompleteTaskUseCase {
  constructor(private loggerOptions: LoggerOptions) {}

  async execute(request: CompleteTaskRequest): Promise<CompleteTaskResponse> {
    const logger = createApplicationLogger(this.loggerOptions);
    const startTime = Date.now();

    logger.info({
      event: 'use_case.complete_task.started',
      task_id: request.taskId,
      user_id: request.userId,
    });

    try {
      // Use case logic
      const result = await this.processTask(request);

      logger.info({
        event: 'use_case.complete_task.succeeded',
        task_id: request.taskId,
        duration_ms: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      logger.error({
        event: 'use_case.complete_task.failed',
        task_id: request.taskId,
        error_message: error instanceof Error ? error.message : 'Unknown',
        duration_ms: Date.now() - startTime,
      });
      throw error;
    }
  }
}
```

### Infrastructure Layer

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts
import { createInfraLogger, type LoggerOptions } from '../logging';

export class D1TaskRepository implements TaskRepository {
  constructor(
    private db: D1Database,
    private loggerOptions: LoggerOptions
  ) {}

  async findById(id: string): Promise<Task | null> {
    const logger = createInfraLogger(this.loggerOptions);
    const startTime = Date.now();

    logger.debug({
      event: 'db.query.started',
      query_type: 'SELECT',
      table: 'tasks',
      operation: 'findById',
    });

    try {
      const result = await this.db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();

      logger.info({
        event: result ? 'db.query.succeeded' : 'db.query.not_found',
        query_type: 'SELECT',
        table: 'tasks',
        duration_ms: Date.now() - startTime,
      });

      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      logger.error({
        event: 'db.query.failed',
        query_type: 'SELECT',
        table: 'tasks',
        error_message: error instanceof Error ? error.message : 'Unknown',
        duration_ms: Date.now() - startTime,
      });
      throw error;
    }
  }
}
```

## Edge Cases

### Missing Request Context

**Scenario**: Logger created outside request context (e.g., scheduled tasks)
**Solution**: Use fallback 'no-context' request_id

```typescript
export function createLogger(options: LoggerOptions): SafeLogger {
  const context = getContext();

  const baseFields: BaseLogFields = {
    request_id: context?.requestId ?? 'no-context',
    // ... other fields
  };

  return new SafeLogger(baseFields, options.environment === 'production');
}
```

### Dynamic Environment Configuration

**Scenario**: Environment and version not known at import time
**Solution**: Pass LoggerOptions at runtime

```typescript
// src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const loggerOptions = {
      service: 'task-api',
      environment: env.ENVIRONMENT,
      version: env.CF_VERSION_METADATA.id,
    };

    const logger = createApplicationLogger(loggerOptions);
    // Use logger
  },
};
```

## Common Mistakes

### ❌ Mistake: Creating logger at module scope

Logger created at import time has stale context.

```typescript
// Bad: Logger has no request context
const logger = createLogger({ service: 'api', environment: 'prod', version: '1.0.0' });

export async function handleRequest(request: Request): Promise<Response> {
  logger.info({ event: 'request.received' }); // request_id: 'no-context'!
}
```

### ✅ Correct: Create logger within request context

Create logger inside runWithContext for proper correlation.

```typescript
// Good: Logger has request context
export async function handleRequest(request: Request): Promise<Response> {
  return runWithContext({ requestId: generateRequestId(), startTime: Date.now() }, () => {
    const logger = createLogger({ service: 'api', environment: 'prod', version: '1.0.0' });
    logger.info({ event: 'request.received' }); // Has request_id!
  });
}
```

### ❌ Mistake: Manually setting category on every log

Repetitive category assignment is error-prone.

```typescript
// Bad: Manual category on each log
const logger = createLogger(options);
logger.info({ event: 'task.completed', category: 'domain' });
logger.info({ event: 'task.updated', category: 'domain' });
```

### ✅ Correct: Use category-specific logger

Category-specific factories set category automatically.

```typescript
// Good: Category set by factory
const logger = createDomainLogger(options);
logger.info({ event: 'task.completed' }); // category: 'domain' auto-set
logger.info({ event: 'task.updated' }); // category: 'domain' auto-set
```

## Testing

```typescript
// src/infrastructure/logging/loggerFactory.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLogger, createDomainLogger, runWithContext, generateRequestId } from './index';

describe('Logger Factory', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('creates logger with request context', () => {
    const requestId = generateRequestId();

    runWithContext({ requestId, startTime: Date.now() }, () => {
      const logger = createLogger({ service: 'test', environment: 'test', version: '1.0.0' });
      logger.info({ event: 'test.event' });

      const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(logged.request_id).toBe(requestId);
    });
  });

  it('uses fallback request_id when no context', () => {
    const logger = createLogger({ service: 'test', environment: 'test', version: '1.0.0' });
    logger.info({ event: 'test.event' });

    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.request_id).toBe('no-context');
  });

  it('automatically sets category for domain logger', () => {
    runWithContext({ requestId: 'req-123', startTime: Date.now() }, () => {
      const logger = createDomainLogger({ service: 'test', environment: 'test', version: '1.0.0' });
      logger.info({ event: 'task.completed' });

      const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(logged.category).toBe('domain');
    });
  });

  it('enables production mode based on environment', () => {
    runWithContext({ requestId: 'req-123', startTime: Date.now() }, () => {
      const logger = createLogger({ service: 'test', environment: 'production', version: '1.0.0' });
      logger.debug({ event: 'debug.event' });

      // Debug logs suppressed in production
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
```

## Related References

- [safe-logger.md](./safe-logger.md) - SafeLogger implementation used by factory
- [context-management.md](./context-management.md) - getContext() for request correlation
- [base-fields.md](./base-fields.md) - BaseLogFields structure
