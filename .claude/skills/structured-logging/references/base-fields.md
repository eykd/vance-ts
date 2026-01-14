# Base Log Fields Schema

**Purpose**: BaseLogFields interface definition and required fields by log category.

## When to Use

Use this reference when defining the structured logging schema for your application. BaseLogFields establishes required fields for every log entry, ensuring consistency and queryability across all logs. Additional interfaces extend the base for domain, application, and infrastructure contexts.

## Pattern

```typescript
// src/infrastructure/logging/schema.ts

/**
 * Severity levels following RFC 5424 (syslog)
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Base fields required on every log entry
 */
export interface BaseLogFields {
  // Correlation
  request_id: string; // UUID for request correlation
  trace_id?: string; // OpenTelemetry trace ID
  span_id?: string; // OpenTelemetry span ID

  // Timing
  timestamp: string; // ISO 8601 with timezone
  duration_ms?: number; // Operation duration

  // Context
  service: string; // e.g., "task-api"
  environment: string; // e.g., "production", "staging"
  version: string; // Deployment version/commit

  // Classification
  level: LogLevel;
  event: string; // Dot-notation event name
  category: 'domain' | 'application' | 'infrastructure';
}

/**
 * Optional identity fields (redacted by default)
 */
export interface IdentityFields {
  user_id?: string; // Internal user identifier
  session_id?: string; // Session identifier
  tenant_id?: string; // Multi-tenant identifier
}

/**
 * HTTP request context
 */
export interface RequestContext {
  http_method?: string;
  http_path?: string; // Path only, no query params
  http_status?: number;
  cf_colo?: string; // Cloudflare colo code
  cf_country?: string; // ISO country code
}

/**
 * Error context
 */
export interface ErrorContext {
  error_code?: string; // Application error code
  error_message?: string; // Safe error message
  error_type?: string; // Error class name
  stack_trace?: string; // Only in non-production
}

/**
 * Domain event fields
 */
export interface DomainEventFields {
  aggregate_type?: string; // e.g., "Task", "User"
  aggregate_id?: string; // Entity identifier
  domain_event?: string; // e.g., "TaskCompleted"
}

/**
 * Complete structured log entry
 */
export type StructuredLogEntry = BaseLogFields &
  Partial<IdentityFields> &
  Partial<RequestContext> &
  Partial<ErrorContext> &
  Partial<DomainEventFields> & {
    // Additional context (must not contain PII)
    [key: string]: unknown;
  };
```

## Decision Matrix

| Field Category     | Required For     | Purpose                        | Example Value              |
| ------------------ | ---------------- | ------------------------------ | -------------------------- |
| **Correlation**    | All logs         | Trace requests across services | `request_id: "uuid-123"`   |
| **Timing**         | All logs         | Temporal ordering              | `timestamp: "2025-01-14T"` |
| **Context**        | All logs         | Environment identification     | `service: "task-api"`      |
| **Classification** | All logs         | Severity and category          | `level: "error"`           |
| **Identity**       | Application logs | User/session tracking          | `user_id: "user-456"`      |
| **HTTP Context**   | Application logs | Request/response details       | `http_status: 200`         |
| **Error**          | Error logs       | Exception details              | `error_type: "TypeError"`  |
| **Domain Event**   | Domain logs      | Business event identification  | `aggregate_type: "Task"`   |

## Required Fields by Log Category

| Field            | Domain | Application | Infrastructure |
| ---------------- | ------ | ----------- | -------------- |
| `request_id`     | ✓      | ✓           | ✓              |
| `timestamp`      | ✓      | ✓           | ✓              |
| `service`        | ✓      | ✓           | ✓              |
| `environment`    | ✓      | ✓           | ✓              |
| `level`          | ✓      | ✓           | ✓              |
| `event`          | ✓      | ✓           | ✓              |
| `category`       | ✓      | ✓           | ✓              |
| `aggregate_type` | ✓      |             |                |
| `aggregate_id`   | ✓      |             |                |
| `domain_event`   | ✓      |             |                |
| `http_method`    |        | ✓           |                |
| `http_path`      |        | ✓           |                |
| `http_status`    |        | ✓           |                |
| `duration_ms`    |        | ✓           | ✓              |

## Example Usage

```typescript
// Domain log
const domainLog: StructuredLogEntry = {
  request_id: 'req-123',
  timestamp: new Date().toISOString(),
  service: 'task-api',
  environment: 'production',
  version: '1.2.0',
  level: 'info',
  event: 'task.completed',
  category: 'domain',
  aggregate_type: 'Task',
  aggregate_id: 'task-456',
  domain_event: 'TaskCompleted',
};

// Application log
const applicationLog: StructuredLogEntry = {
  request_id: 'req-123',
  timestamp: new Date().toISOString(),
  service: 'task-api',
  environment: 'production',
  version: '1.2.0',
  level: 'info',
  event: 'http.response.sent',
  category: 'application',
  http_method: 'POST',
  http_path: '/tasks',
  http_status: 201,
  duration_ms: 45,
};

// Infrastructure log
const infrastructureLog: StructuredLogEntry = {
  request_id: 'req-123',
  timestamp: new Date().toISOString(),
  service: 'task-api',
  environment: 'production',
  version: '1.2.0',
  level: 'info',
  event: 'db.query.succeeded',
  category: 'infrastructure',
  query_type: 'INSERT',
  table: 'tasks',
  duration_ms: 12,
};
```

## Edge Cases

### Missing Optional Fields

**Scenario**: Not all logs have trace_id or span_id
**Solution**: Mark as optional and handle undefined in queries

```typescript
export interface BaseLogFields {
  trace_id?: string; // Optional - may not have distributed trace
  span_id?: string; // Optional - may not be instrumented
}
```

### Dynamic Additional Fields

**Scenario**: Domain-specific fields vary by event
**Solution**: Use index signature for extensibility

```typescript
export type StructuredLogEntry = BaseLogFields & {
  [key: string]: unknown; // Allows event-specific fields
};
```

## Common Mistakes

### ❌ Mistake: Making all fields required

Forcing all fields to be required makes logging verbose and error-prone.

```typescript
// Bad: Everything required
export interface BaseLogFields {
  request_id: string;
  trace_id: string; // Not always available!
  user_id: string; // Not in all contexts!
}
```

### ✅ Correct: Required core, optional context

Only require fields present in all log contexts.

```typescript
// Good: Core required, context optional
export interface BaseLogFields {
  request_id: string; // Always present
  trace_id?: string; // Present when using distributed tracing
}
```

### ❌ Mistake: Logging PII in standard fields

Sensitive data in standard fields bypasses redaction.

```typescript
// Bad: Email in standard field
const log = {
  ...baseFields,
  event: 'user.created',
  user_email: 'john@example.com', // Should be redacted!
};
```

### ✅ Correct: Mark sensitive fields for redaction

Use standard field names that trigger automatic redaction.

```typescript
// Good: Standard field triggers redaction
const log = {
  ...baseFields,
  event: 'user.created',
  email: 'john@example.com', // Automatically masked by redaction
};
```

## Testing

```typescript
// src/infrastructure/logging/schema.spec.ts
import { describe, it, expect } from 'vitest';
import type { BaseLogFields, StructuredLogEntry } from './schema';

describe('BaseLogFields Schema', () => {
  it('enforces required fields at compile time', () => {
    const baseFields: BaseLogFields = {
      request_id: 'req-123',
      timestamp: new Date().toISOString(),
      service: 'test-service',
      environment: 'test',
      version: '1.0.0',
      level: 'info',
      event: 'test.event',
      category: 'application',
    };

    expect(baseFields.request_id).toBeDefined();
    expect(baseFields.service).toBeDefined();
  });

  it('allows optional fields to be undefined', () => {
    const entry: StructuredLogEntry = {
      request_id: 'req-123',
      timestamp: new Date().toISOString(),
      service: 'test',
      environment: 'test',
      version: '1.0.0',
      level: 'info',
      event: 'test.event',
      category: 'application',
      // trace_id is optional - OK to omit
    };

    expect(entry.trace_id).toBeUndefined();
  });
});
```

## Related References

- [event-naming.md](./event-naming.md) - Event naming conventions for the `event` field
- [safe-logger.md](./safe-logger.md) - Using BaseLogFields in SafeLogger
