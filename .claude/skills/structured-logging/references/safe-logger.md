# Safe Logger Implementation

**Purpose**: SafeLogger class with environment-aware PII redaction for production safety.

## When to Use

Use this reference when implementing the core logger class that handles structured log output with automatic redaction of sensitive fields based on environment. SafeLogger ensures PII and secrets never reach production logs while preserving debugging capabilities in development.

## Pattern

```typescript
// src/infrastructure/logging/safeLogger.ts
import { redactValue } from './redaction';
import type { StructuredLogEntry, BaseLogFields, LogLevel } from './schema';

export class SafeLogger {
  constructor(
    private baseContext: BaseLogFields,
    private isProduction: boolean
  ) {}

  private createEntry(level: LogLevel, fields: Partial<StructuredLogEntry>): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      ...this.baseContext,
      ...fields,
      level,
      timestamp: new Date().toISOString(),
    };

    // Always redact in production, optionally in development
    if (this.isProduction) {
      return redactValue(entry) as StructuredLogEntry;
    }

    // In development, still redact critical fields
    return this.redactCriticalFields(entry);
  }

  private redactCriticalFields(entry: StructuredLogEntry): StructuredLogEntry {
    const criticalFields = ['password', 'secret', 'token', 'api_key'];
    const result = { ...entry };

    for (const field of criticalFields) {
      if (field in result) {
        (result as Record<string, unknown>)[field] = '[REDACTED]';
      }
    }

    return result;
  }

  debug(fields: Partial<StructuredLogEntry>): void {
    if (!this.isProduction) {
      const entry = this.createEntry('debug', fields);
      console.log(JSON.stringify(entry));
    }
  }

  info(fields: Partial<StructuredLogEntry>): void {
    const entry = this.createEntry('info', fields);
    console.log(JSON.stringify(entry));
  }

  warn(fields: Partial<StructuredLogEntry>): void {
    const entry = this.createEntry('warn', fields);
    console.warn(JSON.stringify(entry));
  }

  error(fields: Partial<StructuredLogEntry>): void {
    const entry = this.createEntry('error', fields);
    console.error(JSON.stringify(entry));
  }
}
```

## Example Usage

```typescript
// src/application/use-cases/CreateUser.ts
import { createLogger } from '../../infrastructure/logging';

export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<UserResponse> {
    const logger = createLogger({
      service: 'user-api',
      environment: 'production',
      version: '1.0.0',
    });

    logger.info({
      event: 'use_case.create_user.started',
      category: 'application',
      email: request.email, // Automatically masked to e***@domain.com
    });

    // Application logic
  }
}
```

## Edge Cases

### Missing Request Context

**Scenario**: Logger created outside request context (e.g., scheduled handler)
**Solution**: Use fallback request_id 'no-context' and document when context is unavailable

```typescript
const baseFields: BaseLogFields = {
  request_id: context?.requestId ?? 'no-context',
  timestamp: new Date().toISOString(),
  service: 'scheduler',
  // ... other fields
};
```

### Circular References in Log Data

**Scenario**: Logging objects with circular references causes JSON.stringify to fail
**Solution**: Use try-catch and fallback to error message

```typescript
try {
  console.log(JSON.stringify(entry));
} catch (error) {
  console.error('[LOGGING ERROR] Circular reference detected:', error.message);
}
```

## Common Mistakes

### ❌ Mistake: Not checking isProduction before debug logs

Debug logs in production waste resources and may expose sensitive data.

```typescript
// Bad: Always logs debug messages
debug(fields: Partial<StructuredLogEntry>): void {
  const entry = this.createEntry('debug', fields);
  console.log(JSON.stringify(entry));
}
```

### ✅ Correct: Environment-aware debug logging

Only emit debug logs in non-production environments.

```typescript
// Good: Guards debug logs with environment check
debug(fields: Partial<StructuredLogEntry>): void {
  if (!this.isProduction) {
    const entry = this.createEntry('debug', fields);
    console.log(JSON.stringify(entry));
  }
}
```

### ❌ Mistake: Applying redaction only to specific fields

Manual field-by-field redaction is error-prone and misses nested objects.

```typescript
// Bad: Manual redaction
const entry = {
  password: '[REDACTED]',
  token: '[REDACTED]',
  email: maskEmail(fields.email),
  // What about nested objects?
};
```

### ✅ Correct: Use comprehensive redactValue function

Apply systematic redaction to entire log entry.

```typescript
// Good: Comprehensive redaction
if (this.isProduction) {
  return redactValue(entry) as StructuredLogEntry;
}
```

## Testing

```typescript
// src/infrastructure/logging/safeLogger.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SafeLogger } from './safeLogger';

describe('SafeLogger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('redacts sensitive fields in production', () => {
    const logger = new SafeLogger(
      {
        request_id: 'req-123',
        service: 'test',
        environment: 'production',
        version: '1.0.0',
        level: 'info',
        event: '',
        category: 'application',
        timestamp: '2025-01-01T00:00:00Z',
      },
      true
    );

    logger.info({
      event: 'user.login',
      password: 'secret123',
      email: 'user@example.com',
    });

    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.password).toBe('[REDACTED]');
  });

  it('suppresses debug logs in production', () => {
    const logger = new SafeLogger(
      {
        request_id: 'req-123',
        service: 'test',
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
});
```

## Related References

- [base-fields.md](./base-fields.md) - BaseLogFields interface definition
- [../../pii-redaction/references/redaction-functions.md](../../pii-redaction/references/redaction-functions.md) - Comprehensive redaction patterns
