# Event Naming Conventions

**Purpose**: Standardized event naming patterns for consistent log categorization and querying.

## When to Use

Use this reference when naming log events to ensure consistency across your application. Proper event naming enables filtering, alerting, and analysis by following a hierarchical dot-notation convention that clearly communicates what happened.

## Pattern

Use dot-notation following this structure:

```
{domain}.{entity}.{action}[.{outcome}]
```

**Components:**

- **domain**: Business area or layer (e.g., `user`, `task`, `payment`, `http`, `db`)
- **entity**: The thing being acted upon (e.g., `login`, `task`, `charge`, `request`, `query`)
- **action**: What happened (e.g., `created`, `updated`, `deleted`, `received`, `sent`, `executed`)
- **outcome**: Optional result (e.g., `succeeded`, `failed`, `already_completed`)

## Decision Matrix

| Log Category   | Event Pattern                      | Example Events                                          |
| -------------- | ---------------------------------- | ------------------------------------------------------- |
| Domain         | `{aggregate}.{action}[.{outcome}]` | `task.completed`, `user.registered.failed`              |
| Application    | `{layer}.{entity}.{action}`        | `use_case.create_task.started`, `http.request.received` |
| Infrastructure | `{system}.{operation}.{outcome}`   | `db.query.succeeded`, `cache.hit`, `api.call.timeout`   |

## Example Usage

### Domain Events

```typescript
// Business-significant events
logger.info({
  event: 'task.completed',
  category: 'domain',
  aggregate_type: 'Task',
  aggregate_id: 'task-123',
  domain_event: 'TaskCompleted',
});

logger.info({
  event: 'user.login.succeeded',
  category: 'domain',
  user_id: 'user-456',
});

logger.warn({
  event: 'payment.charge.failed',
  category: 'domain',
  aggregate_type: 'Payment',
  aggregate_id: 'pay-789',
  error_code: 'INSUFFICIENT_FUNDS',
});
```

### Application Events

```typescript
// Request/response lifecycle
logger.info({
  event: 'http.request.received',
  category: 'application',
  http_method: 'POST',
  http_path: '/tasks',
});

// Use case execution
logger.info({
  event: 'use_case.complete_task.started',
  category: 'application',
  task_id: 'task-123',
});

logger.warn({
  event: 'use_case.complete_task.validation_failed',
  category: 'application',
  validation_errors: 3,
});
```

### Infrastructure Events

```typescript
// Database operations
logger.info({
  event: 'db.query.succeeded',
  category: 'infrastructure',
  query_type: 'SELECT',
  table: 'tasks',
  duration_ms: 12,
});

// Cache operations
logger.info({
  event: 'cache.hit',
  category: 'infrastructure',
  cache_key: 'user:123:profile',
});

// External API calls
logger.error({
  event: 'api.call.timeout',
  category: 'infrastructure',
  api_endpoint: 'https://payment-gateway.example.com',
  timeout_ms: 5000,
});
```

## Common Event Patterns

| Pattern                       | Description           | Example                        |
| ----------------------------- | --------------------- | ------------------------------ |
| `{entity}.created`            | Entity creation       | `task.created`                 |
| `{entity}.updated`            | Entity modification   | `task.updated`                 |
| `{entity}.deleted`            | Entity deletion       | `task.deleted`                 |
| `{entity}.{action}.succeeded` | Successful operation  | `user.login.succeeded`         |
| `{entity}.{action}.failed`    | Failed operation      | `payment.charge.failed`        |
| `http.{lifecycle}`            | HTTP request/response | `http.request.received`        |
| `use_case.{name}.{phase}`     | Use case execution    | `use_case.create_task.started` |
| `db.{operation}.{outcome}`    | Database interaction  | `db.query.succeeded`           |
| `cache.{result}`              | Cache interaction     | `cache.hit`, `cache.miss`      |

## Edge Cases

### Multiple Outcomes for Same Action

**Scenario**: An action can have multiple terminal states
**Solution**: Use specific outcome suffixes

```typescript
// Payment outcomes
logger.info({ event: 'payment.charge.succeeded' });
logger.warn({ event: 'payment.charge.declined' });
logger.error({ event: 'payment.charge.failed' });
logger.info({ event: 'payment.charge.refunded' });
```

### Compound Actions

**Scenario**: An operation involves multiple steps
**Solution**: Use hierarchical naming with step indicators

```typescript
logger.info({ event: 'user.registration.validation.started' });
logger.info({ event: 'user.registration.email.sent' });
logger.info({ event: 'user.registration.completed' });
```

## Common Mistakes

### ❌ Mistake: Using sentence-like event names

Natural language event names are inconsistent and hard to query.

```typescript
// Bad: Inconsistent naming
logger.info({ event: 'User has logged in successfully' });
logger.info({ event: 'Login was successful for user' });
logger.info({ event: 'Successful login' });
```

### ✅ Correct: Use dot-notation convention

Standardized naming enables consistent querying.

```typescript
// Good: Consistent convention
logger.info({ event: 'user.login.succeeded' });
logger.info({ event: 'user.login.succeeded' });
logger.info({ event: 'user.login.succeeded' });
```

### ❌ Mistake: Too generic or too specific

Balance between overly broad and overly detailed event names.

```typescript
// Bad: Too generic
logger.info({ event: 'event' }); // What happened?
logger.info({ event: 'action' }); // Which action?

// Bad: Too specific
logger.info({ event: 'user.login.with.email.and.password.succeeded.on.production' });
```

### ✅ Correct: Appropriate granularity

Use event name for identity, additional fields for context.

```typescript
// Good: Balanced naming with contextual fields
logger.info({
  event: 'user.login.succeeded',
  auth_method: 'email_password',
  environment: 'production',
});
```

## Testing

```typescript
// src/infrastructure/logging/eventNaming.spec.ts
import { describe, it, expect } from 'vitest';

describe('Event Naming', () => {
  it('follows dot-notation convention', () => {
    const validEvents = [
      'task.created',
      'user.login.succeeded',
      'payment.charge.failed',
      'http.request.received',
      'db.query.succeeded',
    ];

    const pattern = /^[a-z_]+(\.[a-z_]+)+$/;
    for (const event of validEvents) {
      expect(event).toMatch(pattern);
    }
  });

  it('uses snake_case for multi-word components', () => {
    const events = [
      'use_case.create_task.started',
      'http.request.received',
      'payment.charge.succeeded',
    ];

    for (const event of events) {
      expect(event).not.toMatch(/[A-Z]/); // No camelCase
      expect(event).not.toMatch(/-/); // No kebab-case
    }
  });
});
```

## Related References

- [base-fields.md](./base-fields.md) - Event field in BaseLogFields schema
- [../log-categorization/references/decision-matrix.md](../../log-categorization/references/decision-matrix.md) - Categorizing logs by event type
