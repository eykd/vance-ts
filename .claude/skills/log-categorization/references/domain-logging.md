# Domain Logging

**Purpose**: Guidance for logging business-significant events within domain entities and services

## When to Use

When logging events from domain entities, value objects, domain services, or domain events. Use domain logs to capture what happened in business terms that stakeholders would understand.

## Pattern

```typescript
// src/domain/entities/Task.ts
export interface DomainLogger {
  info(fields: DomainLogFields): void;
  warn(fields: DomainLogFields): void;
  error(fields: DomainLogFields): void;
}

interface DomainLogFields {
  event: string;
  category: 'domain';
  aggregate_type: string;
  aggregate_id: string;
  domain_event: string;
  [key: string]: unknown;
}

export class Task {
  complete(logger: DomainLogger): void {
    if (this.status === TaskStatus.Completed) {
      logger.warn({
        event: 'task.complete.already_completed',
        category: 'domain',
        aggregate_type: 'Task',
        aggregate_id: this.id,
        domain_event: 'TaskCompletionAttempted',
      });
      return;
    }

    this.status = TaskStatus.Completed;
    this.completedAt = new Date();

    logger.info({
      event: 'task.completed',
      category: 'domain',
      aggregate_type: 'Task',
      aggregate_id: this.id,
      domain_event: 'TaskCompleted',
      task_title: this.title, // Safe to log
      days_to_complete: this.daysToComplete(),
    });
  }

  private daysToComplete(): number {
    if (!this.completedAt || !this.createdAt) return 0;
    return Math.floor(
      (this.completedAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}
```

## Required Fields

Domain logs **must** include:

- `category: 'domain'`
- `aggregate_type`: The entity type (e.g., "Task", "User", "Order")
- `aggregate_id`: The entity identifier
- `domain_event`: The domain event name (e.g., "TaskCompleted", "UserRegistered")
- `event`: Dot-notation event name (e.g., "task.completed")

## Characteristics

Domain logs should:

- Describe **what happened** in business terms
- Be understandable by non-technical stakeholders
- Never include technical implementation details
- Focus on state changes and business rules
- Include only safe-to-log business data

## Example Usage

```typescript
// Domain entity with business rules
export class Order {
  constructor(
    public readonly id: string,
    private items: OrderItem[],
    private status: OrderStatus,
    private total: number
  ) {}

  public cancel(reason: string, logger: DomainLogger): void {
    if (this.status === OrderStatus.Shipped) {
      logger.warn({
        event: 'order.cancel.cannot_cancel_shipped',
        category: 'domain',
        aggregate_type: 'Order',
        aggregate_id: this.id,
        domain_event: 'OrderCancellationDenied',
        order_status: this.status,
        reason,
      });
      throw new Error('Cannot cancel shipped order');
    }

    this.status = OrderStatus.Cancelled;

    logger.info({
      event: 'order.cancelled',
      category: 'domain',
      aggregate_type: 'Order',
      aggregate_id: this.id,
      domain_event: 'OrderCancelled',
      reason,
      order_total: this.total,
      item_count: this.items.length,
    });
  }
}
```

## Common Mistakes

### ❌ Mistake: Including Technical Details

```typescript
logger.info({
  event: 'task.completed',
  category: 'domain',
  aggregate_type: 'Task',
  aggregate_id: this.id,
  database_connection_time: 45, // Technical detail!
  cache_hit: true, // Infrastructure detail!
});
```

### ✅ Correct: Pure Business Data

```typescript
logger.info({
  event: 'task.completed',
  category: 'domain',
  aggregate_type: 'Task',
  aggregate_id: this.id,
  domain_event: 'TaskCompleted',
  task_priority: this.priority,
  days_to_complete: this.daysToComplete(),
});
```

### ❌ Mistake: Logging HTTP Context

```typescript
logger.info({
  event: 'task.completed',
  category: 'domain',
  http_method: 'POST', // Wrong layer!
  http_status: 200, // Wrong layer!
});
```

### ✅ Correct: Domain Context Only

```typescript
logger.info({
  event: 'task.completed',
  category: 'domain',
  aggregate_type: 'Task',
  aggregate_id: this.id,
  domain_event: 'TaskCompleted',
});
```

## Testing

```typescript
// Test domain logging behavior
describe('Task.complete', () => {
  it('logs domain event when task is completed', () => {
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const task = new Task('task-1', 'Test task', TaskStatus.InProgress);
    task.complete(mockLogger);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'task.completed',
        category: 'domain',
        aggregate_type: 'Task',
        aggregate_id: 'task-1',
        domain_event: 'TaskCompleted',
      })
    );
  });

  it('logs warning when attempting to complete already completed task', () => {
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const task = new Task('task-1', 'Test task', TaskStatus.Completed);
    task.complete(mockLogger);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'task.complete.already_completed',
        category: 'domain',
      })
    );
  });
});
```

## Related References

- [decision-matrix.md](./decision-matrix.md) - Determine if a log belongs to domain category
- [application-logging.md](./application-logging.md) - Log request flow and use case execution
