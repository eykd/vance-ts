# Infrastructure Logging

**Purpose**: Guidance for logging interactions with external systems and infrastructure components

## When to Use

When logging from repository implementations, cache adapters, external API clients, or any infrastructure component that interacts with databases, storage, or external services. Use infrastructure logs to track system health and performance.

## Pattern

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts
export interface InfrastructureLogger {
  debug(fields: InfrastructureLogFields): void;
  info(fields: InfrastructureLogFields): void;
  warn(fields: InfrastructureLogFields): void;
  error(fields: InfrastructureLogFields): void;
}

interface InfrastructureLogFields {
  event: string;
  category: 'infrastructure';
  duration_ms?: number;
  query_type?: string;
  table?: string;
  operation?: string;
  [key: string]: unknown;
}

export class D1TaskRepository implements TaskRepository {
  async findById(id: string, logger: InfrastructureLogger): Promise<Task | null> {
    const startTime = Date.now();

    logger.debug({
      event: 'db.query.started',
      category: 'infrastructure',
      query_type: 'SELECT',
      table: 'tasks',
      operation: 'findById',
    });

    try {
      const result = await this.db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();

      const duration = Date.now() - startTime;

      logger.info({
        event: result ? 'db.query.succeeded' : 'db.query.not_found',
        category: 'infrastructure',
        query_type: 'SELECT',
        table: 'tasks',
        operation: 'findById',
        duration_ms: duration,
        row_count: result ? 1 : 0,
      });

      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      logger.error({
        event: 'db.query.failed',
        category: 'infrastructure',
        query_type: 'SELECT',
        table: 'tasks',
        operation: 'findById',
        duration_ms: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }
}
```

## Required Fields

Infrastructure logs **should** include:

- `category: 'infrastructure'`
- `event`: Dot-notation event name (e.g., "db.query.succeeded")
- `duration_ms`: Operation timing for performance monitoring
- Operation context: `query_type`, `table`, `operation`, etc.

## Characteristics

Infrastructure logs should:

- Track timing information for performance monitoring
- Include operation metadata without sensitive data
- Capture connection states and retry attempts
- Enable infrastructure health monitoring
- Never include query parameters that might contain PII

## Example Usage

### Database Repository

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts
export class D1TaskRepository implements TaskRepository {
  async save(task: Task, logger: InfrastructureLogger): Promise<void> {
    const startTime = Date.now();

    logger.debug({
      event: 'db.query.started',
      category: 'infrastructure',
      query_type: 'INSERT',
      table: 'tasks',
      operation: 'save',
    });

    try {
      await this.db
        .prepare('INSERT OR REPLACE INTO tasks (id, title, status, created_at) VALUES (?, ?, ?, ?)')
        .bind(task.id, task.title, task.status, task.createdAt.toISOString())
        .run();

      logger.info({
        event: 'db.query.succeeded',
        category: 'infrastructure',
        query_type: 'INSERT',
        table: 'tasks',
        operation: 'save',
        duration_ms: Date.now() - startTime,
      });
    } catch (error) {
      logger.error({
        event: 'db.query.failed',
        category: 'infrastructure',
        query_type: 'INSERT',
        table: 'tasks',
        operation: 'save',
        duration_ms: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }
}
```

### Cache Adapter

```typescript
// src/infrastructure/cache/KVCacheAdapter.ts
export class KVCacheAdapter implements CachePort {
  async get<T>(key: string, logger: InfrastructureLogger): Promise<T | null> {
    const startTime = Date.now();

    logger.debug({
      event: 'cache.get.started',
      category: 'infrastructure',
      operation: 'get',
      key_prefix: key.split(':')[0], // Log prefix only, not full key
    });

    try {
      const value = await this.kv.get(key, 'json');

      const duration = Date.now() - startTime;

      logger.info({
        event: value ? 'cache.hit' : 'cache.miss',
        category: 'infrastructure',
        operation: 'get',
        key_prefix: key.split(':')[0],
        duration_ms: duration,
      });

      return value as T;
    } catch (error) {
      logger.error({
        event: 'cache.error',
        category: 'infrastructure',
        operation: 'get',
        key_prefix: key.split(':')[0],
        duration_ms: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : 'Unknown',
      });
      // Don't throw - degrade gracefully
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number, logger: InfrastructureLogger): Promise<void> {
    const startTime = Date.now();

    try {
      await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl });

      logger.info({
        event: 'cache.set.succeeded',
        category: 'infrastructure',
        operation: 'set',
        key_prefix: key.split(':')[0],
        ttl_seconds: ttl,
        duration_ms: Date.now() - startTime,
      });
    } catch (error) {
      logger.error({
        event: 'cache.set.failed',
        category: 'infrastructure',
        operation: 'set',
        key_prefix: key.split(':')[0],
        duration_ms: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : 'Unknown',
      });
      // Don't throw - cache failures shouldn't break requests
    }
  }
}
```

### External API Client

```typescript
// src/infrastructure/clients/PaymentGatewayClient.ts
export class PaymentGatewayClient {
  async charge(amount: number, currency: string, logger: InfrastructureLogger): Promise<string> {
    const startTime = Date.now();

    logger.info({
      event: 'external_api.request.started',
      category: 'infrastructure',
      service: 'payment_gateway',
      endpoint: '/charges',
      http_method: 'POST',
    });

    try {
      const response = await fetch('https://api.payment-gateway.com/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ amount, currency }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        logger.warn({
          event: 'external_api.request.failed',
          category: 'infrastructure',
          service: 'payment_gateway',
          endpoint: '/charges',
          http_method: 'POST',
          http_status: response.status,
          duration_ms: duration,
        });
        throw new Error(`Payment gateway returned ${response.status}`);
      }

      const data = await response.json();

      logger.info({
        event: 'external_api.request.succeeded',
        category: 'infrastructure',
        service: 'payment_gateway',
        endpoint: '/charges',
        http_method: 'POST',
        http_status: response.status,
        duration_ms: duration,
      });

      return data.transactionId;
    } catch (error) {
      logger.error({
        event: 'external_api.request.failed',
        category: 'infrastructure',
        service: 'payment_gateway',
        endpoint: '/charges',
        http_method: 'POST',
        duration_ms: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }
}
```

## Common Mistakes

### ❌ Mistake: Logging Business Logic

```typescript
logger.info({
  event: 'db.query.succeeded',
  category: 'infrastructure',
  task_completed: true, // Business logic!
  domain_event: 'TaskCompleted', // Domain concern!
});
```

### ✅ Correct: Focus on Infrastructure Concerns

```typescript
logger.info({
  event: 'db.query.succeeded',
  category: 'infrastructure',
  query_type: 'UPDATE',
  table: 'tasks',
  duration_ms: 15,
  row_count: 1,
});
```

### ❌ Mistake: Logging Sensitive Query Parameters

```typescript
logger.debug({
  event: 'db.query.started',
  category: 'infrastructure',
  query: 'SELECT * FROM users WHERE email = ?',
  parameters: ['user@example.com'], // PII!
});
```

### ✅ Correct: Log Query Pattern Without Parameters

```typescript
logger.debug({
  event: 'db.query.started',
  category: 'infrastructure',
  query_type: 'SELECT',
  table: 'users',
  operation: 'findByEmail',
  // No parameters logged
});
```

## Testing

```typescript
// Test infrastructure logging behavior
describe('D1TaskRepository', () => {
  it('logs query lifecycle with timing', async () => {
    const mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ id: 'task-1', title: 'Test' }),
        }),
      }),
    };

    const repository = new D1TaskRepository(mockDb);
    await repository.findById('task-1', mockLogger);

    // Started event
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'db.query.started',
        category: 'infrastructure',
        query_type: 'SELECT',
        table: 'tasks',
      })
    );

    // Succeeded event with duration
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'db.query.succeeded',
        category: 'infrastructure',
        duration_ms: expect.any(Number),
        row_count: 1,
      })
    );
  });

  it('logs error with duration when query fails', async () => {
    const mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      }),
    };

    const repository = new D1TaskRepository(mockDb);

    await expect(repository.findById('task-1', mockLogger)).rejects.toThrow();

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'db.query.failed',
        category: 'infrastructure',
        error_message: 'Database error',
        duration_ms: expect.any(Number),
      })
    );
  });
});
```

## Related References

- [decision-matrix.md](./decision-matrix.md) - Determine if a log belongs to infrastructure category
- [application-logging.md](./application-logging.md) - Log use case orchestration
- [domain-logging.md](./domain-logging.md) - Log business events
