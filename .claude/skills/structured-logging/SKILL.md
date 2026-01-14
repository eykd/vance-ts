# Structured Logging

**Use when:** Adding structured logging to Cloudflare Workers with request correlation and environment-aware redaction.

## Overview

This skill provides complete guidance on implementing structured logging in Cloudflare Workers applications. It covers SafeLogger implementation with PII redaction, request correlation using AsyncLocalStorage, BaseLogFields schema definition, event naming conventions, and logger factory patterns for domain/application/infrastructure layers.

## Decision Tree

### Need to implement a logger class?

**When**: Creating the core logging infrastructure with PII redaction
**Go to**: [references/safe-logger.md](./references/safe-logger.md)

### Need to manage request context?

**When**: Setting up AsyncLocalStorage for request correlation and trace context
**Go to**: [references/context-management.md](./references/context-management.md)

### Need to define log schema?

**When**: Defining BaseLogFields interface and required fields per category
**Go to**: [references/base-fields.md](./references/base-fields.md)

### Need to name events?

**When**: Creating event naming conventions and categorizing logs
**Go to**: [references/event-naming.md](./references/event-naming.md)

### Need to create logger instances?

**When**: Building logger factory with environment-aware configuration
**Go to**: [references/logger-factory.md](./references/logger-factory.md)

## Quick Example

```typescript
// src/infrastructure/logging/index.ts
import { AsyncLocalStorage } from 'node:async_hooks';

interface RequestContext {
  requestId: string;
  traceId?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function createLogger(service: string, isProduction: boolean) {
  return {
    info(event: string, data: Record<string, unknown>) {
      const ctx = asyncLocalStorage.getStore();
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'info',
          request_id: ctx?.requestId ?? 'no-context',
          trace_id: ctx?.traceId,
          service,
          event,
          ...data,
        })
      );
    },
  };
}

// Usage in request handler
export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return asyncLocalStorage.run(context, fn);
}
```

## Cross-References

- **[log-categorization](../log-categorization/SKILL.md)**: Categorize logs by domain/application/infrastructure layers following Clean Architecture
- **[pii-redaction](../pii-redaction/SKILL.md)**: Implement systematic PII and secret redaction patterns for defense-in-depth data protection
- **[cloudflare-observability](../cloudflare-observability/SKILL.md)**: Configure Workers Observability for automatic trace capture and log indexing

## Reference Files

- [references/safe-logger.md](./references/safe-logger.md) - SafeLogger class with environment-aware PII redaction
- [references/context-management.md](./references/context-management.md) - AsyncLocalStorage patterns for request correlation
- [references/base-fields.md](./references/base-fields.md) - BaseLogFields schema and required fields by category
- [references/event-naming.md](./references/event-naming.md) - Event naming conventions and categorization rules
- [references/logger-factory.md](./references/logger-factory.md) - Logger factory with domain/application/infrastructure variants
