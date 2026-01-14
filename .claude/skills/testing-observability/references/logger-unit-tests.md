# Logger Unit Tests

**Purpose**: Test logger behavior including base fields, redaction, and environment-aware log suppression.

## When to Use

Use this reference when writing unit tests for SafeLogger or custom logger classes to verify base field inclusion, PII redaction in production, and debug log suppression. Essential for validating logger implementation before integration testing.

## Pattern

```typescript
// src/infrastructure/logging/safeLogger.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SafeLogger } from './safeLogger';

describe('SafeLogger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('includes all base fields in log output', () => {
    const logger = new SafeLogger(
      {
        request_id: 'req-123',
        service: 'test-service',
        environment: 'test',
        version: '1.0.0',
        level: 'info',
        event: '',
        category: 'application',
        timestamp: '2025-01-01T00:00:00Z',
      },
      false
    );

    logger.info({ event: 'test.event' });

    expect(consoleSpy).toHaveBeenCalledOnce();
    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);

    expect(logged.request_id).toBe('req-123');
    expect(logged.service).toBe('test-service');
    expect(logged.event).toBe('test.event');
    expect(logged.level).toBe('info');
  });
});
```

## Testing Redaction Behavior

```typescript
it('redacts sensitive fields in production', () => {
  const logger = new SafeLogger(
    {
      request_id: 'req-123',
      service: 'test-service',
      environment: 'production',
      version: '1.0.0',
      level: 'info',
      event: '',
      category: 'application',
      timestamp: '2025-01-01T00:00:00Z',
    },
    true // isProduction
  );

  logger.info({
    event: 'user.login',
    password: 'secret123',
    email: 'user@example.com',
  });

  const logged = JSON.parse(consoleSpy.mock.calls[0][0]);

  expect(logged.password).toBe('[REDACTED]');
  expect(logged.email).toMatch(/^u\*\*\*@example\.com$/);
});
```

## Testing Environment-Aware Suppression

```typescript
it('suppresses debug logs in production', () => {
  const logger = new SafeLogger(
    {
      request_id: 'req-123',
      service: 'test-service',
      environment: 'production',
      version: '1.0.0',
      level: 'debug',
      event: '',
      category: 'application',
      timestamp: '2025-01-01T00:00:00Z',
    },
    true
  );

  logger.debug({ event: 'debug.message' });

  expect(consoleSpy).not.toHaveBeenCalled();
});
```

## Edge Cases

### Empty Base Fields

**Scenario**: Logger initialized with missing optional fields
**Solution**: Provide sensible defaults or fail fast

```typescript
it('handles missing optional fields', () => {
  const logger = new SafeLogger(
    {
      request_id: 'req-123',
      service: 'test-service',
      environment: 'test',
      version: '1.0.0',
      level: 'info',
      event: '',
      category: 'application',
      timestamp: '2025-01-01T00:00:00Z',
    },
    false
  );

  logger.info({ event: 'test' });
  const logged = JSON.parse(consoleSpy.mock.calls[0][0]);

  expect(logged.trace_id).toBeUndefined(); // Optional field absent
});
```

## Common Mistakes

### ❌ Mistake: Not mocking console.log

Testing without mocking causes noise in test output and prevents assertions.

```typescript
// Bad: No mock, can't verify output
it('logs something', () => {
  const logger = new SafeLogger(baseFields, false);
  logger.info({ event: 'test' }); // Output goes to console
  // No way to assert what was logged
});
```

### ✅ Correct: Mock and capture output

```typescript
// Good: Mock console, verify output
beforeEach(() => {
  consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});

it('logs correctly', () => {
  logger.info({ event: 'test' });
  expect(consoleSpy).toHaveBeenCalledOnce();
});
```

## Testing Strategy

**Unit test focus**:

- Base field inclusion (all required fields present)
- Redaction behavior (production vs development)
- Log level suppression (debug in production)
- JSON structure validation

For AsyncLocalStorage context and Workers runtime integration, see [miniflare-integration.md](./miniflare-integration.md).

## Related References

- [redaction-tests.md](./redaction-tests.md) - Comprehensive redaction pattern testing
- [miniflare-integration.md](./miniflare-integration.md) - Workers runtime integration testing
- [structured-logging: safe-logger](../../structured-logging/references/safe-logger.md) - SafeLogger implementation
