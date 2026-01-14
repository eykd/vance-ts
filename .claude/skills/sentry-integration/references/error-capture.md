# Error Capture

**Purpose**: Manually capture exceptions with Sentry including tags, extra context, and severity levels for enhanced error tracking.

## When to Use

Use this reference when you need to manually capture errors with additional context, set custom severity levels, or capture non-error conditions that require tracking.

## Pattern

```typescript
// src/application/use-cases/CreatePayment.ts
import * as Sentry from '@sentry/cloudflare';

export class CreatePaymentUseCase {
  async execute(request: CreatePaymentRequest): Promise<PaymentResult> {
    try {
      const result = await this.paymentGateway.charge(request);
      return result;
    } catch (error) {
      // Capture with additional context
      Sentry.captureException(error, {
        tags: {
          payment_provider: 'stripe',
          payment_type: request.type,
        },
        extra: {
          amount: request.amount,
          currency: request.currency,
          // Add debugging info without PII
        },
      });

      throw error;
    }
  }
}
```

## Capture Methods

| Method                             | Use Case                | When to Use                 |
| ---------------------------------- | ----------------------- | --------------------------- |
| `captureException(error, options)` | Capture Error objects   | Standard exception handling |
| `captureMessage(message, level)`   | Capture string messages | Non-error conditions        |
| `captureEvent(event)`              | Full control            | Custom event structure      |

## Severity Levels

```typescript
import * as Sentry from '@sentry/cloudflare';

// Informational
Sentry.captureMessage('User completed onboarding', 'info');

// Warning
Sentry.captureMessage('API rate limit approaching', 'warning');

// Error
Sentry.captureException(error, { level: 'error' });

// Fatal
Sentry.captureException(error, { level: 'fatal' });
```

## Example Usage with Tags and Extra Data

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts
import * as Sentry from '@sentry/cloudflare';

export class D1TaskRepository {
  async save(task: Task): Promise<void> {
    try {
      await this.db.prepare('INSERT INTO tasks...').bind(task.id).run();
    } catch (error) {
      // Capture with repository context
      Sentry.captureException(error, {
        tags: {
          repository: 'D1TaskRepository',
          operation: 'save',
          table: 'tasks',
        },
        extra: {
          task_id: task.id,
          aggregate_type: 'Task',
          // Include non-sensitive debugging info
        },
        level: 'error',
      });

      throw error;
    }
  }
}
```

## Sentry Logs API Integration

```typescript
// src/infrastructure/logging/sentryLogger.ts
import * as Sentry from '@sentry/cloudflare';
import type { BaseLogFields, StructuredLogEntry } from './schema';

export function createSentryLogger(baseContext: BaseLogFields) {
  return {
    debug(fields: Partial<StructuredLogEntry>): void {
      const entry = { ...baseContext, ...fields, level: 'debug' as const };
      Sentry.logger.debug(formatMessage(entry), entry);
    },

    info(fields: Partial<StructuredLogEntry>): void {
      const entry = { ...baseContext, ...fields, level: 'info' as const };
      Sentry.logger.info(formatMessage(entry), entry);
    },

    warn(fields: Partial<StructuredLogEntry>): void {
      const entry = { ...baseContext, ...fields, level: 'warn' as const };
      Sentry.logger.warn(formatMessage(entry), entry);
    },

    error(fields: Partial<StructuredLogEntry>): void {
      const entry = { ...baseContext, ...fields, level: 'error' as const };
      Sentry.logger.error(formatMessage(entry), entry);
    },
  };
}

function formatMessage(entry: StructuredLogEntry): string {
  return `[${entry.event}] ${entry.category}`;
}
```

## Edge Cases

### Capturing Non-Error Objects

**Scenario**: Need to capture errors that aren't Error instances
**Solution**: Wrap in Error object or use captureMessage

```typescript
try {
  // Some API returns { error: 'message' }
  const result = await externalApi.call();
  if (result.error) {
    // Convert to Error
    const error = new Error(result.error);
    Sentry.captureException(error, {
      extra: { api_response: result },
    });
  }
} catch (error) {
  // Standard error handling
  Sentry.captureException(error);
}
```

### Rate Limiting

**Scenario**: High error rates may hit Sentry quotas
**Solution**: Use beforeSend to sample errors

```typescript
// In withSentry configuration
beforeSend(event) {
  // Sample specific error types
  if (event.exception?.values?.[0]?.type === 'ValidationError') {
    // Only send 10% of validation errors
    if (Math.random() > 0.1) return null;
  }
  return event;
}
```

## Common Mistakes

### ❌ Mistake: Not re-throwing captured errors

```typescript
// Bad - error is swallowed
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  // Error not propagated!
}
```

**Why it's wrong**: Error is captured but caller doesn't know operation failed.

### ✅ Correct: Capture and re-throw

```typescript
// Good - error is captured AND propagated
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: 'riskyOperation' },
  });
  throw error; // Propagate to caller
}
```

### ❌ Mistake: Including PII in extra data

```typescript
// Bad - includes email
Sentry.captureException(error, {
  extra: {
    user_email: user.email, // PII!
    user_phone: user.phone, // PII!
  },
});
```

**Why it's wrong**: Exposes sensitive data in error reports.

### ✅ Correct: Use non-PII identifiers

```typescript
// Good - only internal IDs
Sentry.captureException(error, {
  extra: {
    user_id: user.id, // Safe identifier
    // No email, phone, or other PII
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
  it('captures exception with payment context', async () => {
    const mockGateway = {
      charge: vi.fn().mockRejectedValue(new Error('Payment failed')),
    };
    const useCase = new CreatePaymentUseCase(mockGateway);

    await expect(useCase.execute({ amount: 100, currency: 'USD', type: 'card' })).rejects.toThrow(
      'Payment failed'
    );

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          payment_provider: 'stripe',
          payment_type: 'card',
        },
      })
    );
  });
});
```

## Related References

- [breadcrumbs.md](./breadcrumbs.md) - Add event sequences automatically included in error reports
- [context-management.md](./context-management.md) - Set persistent context attached to all errors
