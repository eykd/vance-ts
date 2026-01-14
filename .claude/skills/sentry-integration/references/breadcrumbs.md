# Breadcrumbs

**Purpose**: Track event sequences leading to errors using Sentry breadcrumbs for enhanced debugging context.

## When to Use

Use this reference when you need to track user actions, application state changes, or external service calls that provide context for error investigation.

## Pattern

```typescript
// src/application/use-cases/CreatePayment.ts
import * as Sentry from '@sentry/cloudflare';

export class CreatePaymentUseCase {
  async execute(request: CreatePaymentRequest): Promise<PaymentResult> {
    // Add breadcrumb for debugging
    Sentry.addBreadcrumb({
      category: 'payment',
      message: 'Starting payment processing',
      level: 'info',
      data: {
        amount: request.amount,
        currency: request.currency,
        // Never include card numbers!
      },
    });

    try {
      const result = await this.paymentGateway.charge(request);

      Sentry.addBreadcrumb({
        category: 'payment',
        message: 'Payment processed successfully',
        level: 'info',
        data: {
          transaction_id: result.transactionId,
        },
      });

      return result;
    } catch (error) {
      // Breadcrumbs are automatically included in error report
      throw error;
    }
  }
}
```

## Breadcrumb Categories

| Category     | Use Case         | Example                         |
| ------------ | ---------------- | ------------------------------- |
| `http`       | HTTP requests    | External API calls, webhooks    |
| `navigation` | Route changes    | Page transitions, redirects     |
| `user`       | User actions     | Button clicks, form submissions |
| `console`    | Console logs     | Debug messages (automatic)      |
| `query`      | Database queries | D1, KV operations               |

## Breadcrumb Levels

| Level     | When to Use              |
| --------- | ------------------------ |
| `debug`   | Detailed diagnostic info |
| `info`    | Normal operations        |
| `warning` | Unexpected but handled   |
| `error`   | Failure events           |

## Example Usage

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts
import * as Sentry from '@sentry/cloudflare';

export class D1TaskRepository {
  async save(task: Task): Promise<void> {
    Sentry.addBreadcrumb({
      category: 'query',
      message: 'Saving task to D1',
      level: 'debug',
      data: {
        task_id: task.id,
        operation: 'INSERT',
      },
    });

    try {
      await this.db.prepare('INSERT INTO tasks...').bind(task.id).run();

      Sentry.addBreadcrumb({
        category: 'query',
        message: 'Task saved successfully',
        level: 'info',
        data: {
          task_id: task.id,
        },
      });
    } catch (error) {
      // Error will include both breadcrumbs
      throw error;
    }
  }
}
```

## Edge Cases

### Breadcrumb Limit

**Scenario**: Sentry limits breadcrumbs to last 100 entries per error
**Solution**: Breadcrumbs are automatically capped - older entries are removed

```typescript
// First breadcrumbs may be dropped if limit exceeded
for (let i = 0; i < 200; i++) {
  Sentry.addBreadcrumb({
    message: `Iteration ${i}`,
    level: 'debug',
  });
}
// Only last 100 are kept
```

### High-Frequency Breadcrumbs

**Scenario**: Logging breadcrumbs in hot loops
**Solution**: Use sampling or aggregate breadcrumbs

```typescript
// Bad - too many breadcrumbs
items.forEach((item) => {
  Sentry.addBreadcrumb({ message: `Processing ${item.id}` });
});

// Good - aggregate breadcrumb
Sentry.addBreadcrumb({
  message: `Processing ${items.length} items`,
  data: { count: items.length },
});
```

## Common Mistakes

### ❌ Mistake: Including sensitive data in breadcrumbs

```typescript
// Bad - includes password
Sentry.addBreadcrumb({
  category: 'user',
  message: 'User login attempt',
  data: {
    username: user.username,
    password: credentials.password, // Never log passwords!
  },
});
```

**Why it's wrong**: Breadcrumbs are sent to Sentry and may expose sensitive data.

### ✅ Correct: Redact sensitive fields

```typescript
// Good - no sensitive data
Sentry.addBreadcrumb({
  category: 'user',
  message: 'User login attempt',
  data: {
    user_id: user.id, // Safe identifier
    // No password or credentials
  },
});
```

## Testing

```typescript
// src/use-cases/CreatePayment.test.ts
import { describe, it, expect, vi } from 'vitest';
import * as Sentry from '@sentry/cloudflare';
import { CreatePaymentUseCase } from './CreatePayment';

vi.mock('@sentry/cloudflare');

describe('CreatePaymentUseCase', () => {
  it('adds breadcrumb before payment processing', async () => {
    const useCase = new CreatePaymentUseCase(mockGateway);

    await useCase.execute({ amount: 100, currency: 'USD' });

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'payment',
        message: 'Starting payment processing',
      })
    );
  });
});
```

## Related References

- [context-management.md](./context-management.md) - Add persistent context to all errors
- [error-capture.md](./error-capture.md) - Capture errors with breadcrumb history
