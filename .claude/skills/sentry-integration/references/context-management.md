# Context Management

**Purpose**: Add custom context to Sentry events including user identification, tags for filtering, and custom context objects for debugging.

## When to Use

Use this reference when you need to add user context for error tracking, set tags for filtering errors in Sentry dashboard, or attach custom context objects with additional debugging information.

## Pattern

```typescript
// src/presentation/middleware/sentryContext.ts
import * as Sentry from '@sentry/cloudflare';

export function setSentryContext(request: Request, userId?: string): void {
  // Set user context (without PII)
  if (userId) {
    Sentry.setUser({
      id: userId,
      // Don't include email, username, or IP unless necessary
    });
  }

  // Set custom tags for filtering
  Sentry.setTag('request_path', new URL(request.url).pathname);
  Sentry.setTag('cf_colo', request.cf?.colo ?? 'unknown');
  Sentry.setTag('cf_country', request.cf?.country ?? 'unknown');

  // Set additional context
  Sentry.setContext('request', {
    method: request.method,
    url: redactUrl(request.url),
    cf_ray: request.headers.get('cf-ray'),
  });
}

function redactUrl(url: string): string {
  const parsed = new URL(url);
  // Remove query parameters that might contain sensitive data
  parsed.search = parsed.search ? '[REDACTED]' : '';
  return parsed.toString();
}
```

## Context Types

| Method         | Purpose                          | Example Use Case                          |
| -------------- | -------------------------------- | ----------------------------------------- |
| `setUser()`    | Identify user for error grouping | Track errors by user_id                   |
| `setTag()`     | Add filterable metadata          | Filter by country, path, feature          |
| `setContext()` | Add structured debug data        | Attach request details, environment state |

## Example Usage

```typescript
// src/application/use-cases/CompleteTask.ts
import * as Sentry from '@sentry/cloudflare';

export class CompleteTaskUseCase {
  async execute(request: CompleteTaskRequest): Promise<CompleteTaskResponse> {
    // Set user context for error correlation
    Sentry.setUser({ id: request.userId });

    // Add tags for filtering
    Sentry.setTag('use_case', 'complete_task');
    Sentry.setTag('task_id', request.taskId);

    // Add custom context for debugging
    Sentry.setContext('task', {
      taskId: request.taskId,
      userId: request.userId,
      // Don't include sensitive data
    });

    // Use case logic...
  }
}
```

## Edge Cases

### Multiple User Context Calls

**Scenario**: Setting user context multiple times in the same request
**Solution**: Last call wins - Sentry replaces previous user context

```typescript
// Both calls are valid, last one takes precedence
Sentry.setUser({ id: 'user-123' });
// Later in request lifecycle
Sentry.setUser({ id: 'user-123', ip_address: request.headers.get('cf-connecting-ip') });
```

### Clearing Context

**Scenario**: Need to remove user context (e.g., after logout)
**Solution**: Set user to null

```typescript
// Clear user context
Sentry.setUser(null);
```

## Common Mistakes

### ❌ Mistake: Including PII in user context

```typescript
// Bad - includes email and username
Sentry.setUser({
  id: user.id,
  email: user.email, // PII!
  username: user.username, // PII!
});
```

**Why it's wrong**: Violates privacy regulations and exposes sensitive data.

### ✅ Correct: Use only non-PII identifiers

```typescript
// Good - only internal identifier
Sentry.setUser({
  id: user.id, // Internal UUID, not email
});
```

### ❌ Mistake: Not redacting URLs with sensitive query params

```typescript
// Bad - exposes token in URL
Sentry.setContext('request', {
  url: request.url, // May contain ?token=secret
});
```

**Why it's wrong**: Query parameters may contain tokens, API keys, or session IDs.

### ✅ Correct: Redact sensitive URL parameters

```typescript
// Good - redacts query string
Sentry.setContext('request', {
  url: redactUrl(request.url),
});
```

## Testing

```typescript
// src/middleware/sentryContext.test.ts
import { describe, it, expect, vi } from 'vitest';
import * as Sentry from '@sentry/cloudflare';
import { setSentryContext } from './sentryContext';

vi.mock('@sentry/cloudflare');

describe('setSentryContext', () => {
  it('sets user context with userId', () => {
    const request = new Request('https://example.com/tasks');

    setSentryContext(request, 'user-123');

    expect(Sentry.setUser).toHaveBeenCalledWith({ id: 'user-123' });
  });

  it('sets tags for request metadata', () => {
    const request = new Request('https://example.com/tasks');

    setSentryContext(request);

    expect(Sentry.setTag).toHaveBeenCalledWith('request_path', '/tasks');
  });
});
```

## Related References

- [breadcrumbs.md](./breadcrumbs.md) - Add event sequence tracking with breadcrumbs
- [error-capture.md](./error-capture.md) - Capture errors with context-specific tags
