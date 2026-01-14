# Request Context Management

**Purpose**: AsyncLocalStorage patterns for request correlation and trace context propagation.

## When to Use

Use this reference when implementing request context management using Node.js AsyncLocalStorage to automatically correlate logs across async operations. This enables request_id and trace_id propagation without explicit parameter passing through the call stack.

## Pattern

```typescript
// src/infrastructure/logging/context.ts
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  startTime: number;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return asyncLocalStorage.run(context, fn);
}

export function getContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Extract or generate trace context from request headers
 */
export function extractTraceContext(request: Request): {
  traceId: string;
  spanId: string;
} {
  const traceparent = request.headers.get('traceparent');

  if (traceparent) {
    // Parse W3C Trace Context format: version-traceId-spanId-flags
    const parts = traceparent.split('-');
    if (parts.length >= 3) {
      return {
        traceId: parts[1],
        spanId: parts[2],
      };
    }
  }

  // Generate new trace context
  return {
    traceId: crypto.randomUUID().replace(/-/g, ''),
    spanId: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
  };
}
```

## Example Usage

```typescript
// src/index.ts
import {
  runWithContext,
  generateRequestId,
  extractTraceContext,
} from './infrastructure/logging/context';
import { createLogger } from './infrastructure/logging';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const requestId = request.headers.get('x-request-id') ?? generateRequestId();
    const { traceId, spanId } = extractTraceContext(request);

    const context = {
      requestId,
      traceId,
      spanId,
      startTime: Date.now(),
    };

    return runWithContext(context, async () => {
      const logger = createLogger({
        service: 'api',
        environment: env.ENVIRONMENT,
        version: env.VERSION,
      });

      logger.info({
        event: 'http.request.received',
        category: 'application',
        http_method: request.method,
        http_path: new URL(request.url).pathname,
      });

      const response = await handleRequest(request, env);

      logger.info({
        event: 'http.response.sent',
        category: 'application',
        http_status: response.status,
        duration_ms: Date.now() - context.startTime,
      });

      return response;
    });
  },
};
```

## Edge Cases

### Nested Request Contexts

**Scenario**: Making subrequests or calling Durable Objects with their own context
**Solution**: Preserve parent context while creating child context for correlation

```typescript
export function createChildContext(parentEvent: string): RequestContext {
  const parent = getContext();
  return {
    requestId: parent?.requestId ?? generateRequestId(),
    traceId: parent?.traceId,
    spanId: crypto.randomUUID().replace(/-/g, '').slice(0, 16), // New span
    startTime: Date.now(),
    parentEvent,
  };
}
```

### Context Loss in Queue Handlers

**Scenario**: Queue handlers don't have automatic request context
**Solution**: Serialize context in message metadata and restore on consumption

```typescript
// Publishing
await env.QUEUE.send({
  data: payload,
  metadata: {
    request_id: getContext()?.requestId,
    trace_id: getContext()?.traceId,
  },
});

// Consuming
async queue(batch: MessageBatch, env: Env) {
  for (const message of batch.messages) {
    const context = {
      requestId: message.body.metadata.request_id,
      traceId: message.body.metadata.trace_id,
      startTime: Date.now(),
    };

    runWithContext(context, () => {
      // Process with correlated logging
    });
  }
}
```

## Common Mistakes

### ❌ Mistake: Not using runWithContext wrapper

Directly accessing asyncLocalStorage without runWithContext causes context to be undefined.

```typescript
// Bad: Context not set
export default {
  async fetch(request: Request): Promise<Response> {
    const logger = createLogger(); // getContext() returns undefined!
    return handleRequest(request);
  },
};
```

### ✅ Correct: Wrap handler in runWithContext

Always wrap request handler to establish context.

```typescript
// Good: Context properly established
export default {
  async fetch(request: Request): Promise<Response> {
    const context = { requestId: generateRequestId(), startTime: Date.now() };
    return runWithContext(context, () => handleRequest(request));
  },
};
```

### ❌ Mistake: Mutating shared context object

Context mutations affect all async operations sharing the context.

```typescript
// Bad: Mutating context
const ctx = getContext();
if (ctx) {
  ctx.userId = 'user-123'; // Affects other concurrent requests!
}
```

### ✅ Correct: Create new context for changes

Use immutable updates when modifying context.

```typescript
// Good: Immutable context update
const currentCtx = getContext();
const newCtx = { ...currentCtx, userId: 'user-123' };
runWithContext(newCtx, () => {
  // Use updated context
});
```

## Testing

```typescript
// src/infrastructure/logging/context.spec.ts
import { describe, it, expect } from 'vitest';
import { runWithContext, getContext, generateRequestId } from './context';

describe('Request Context', () => {
  it('makes context available within runWithContext', () => {
    const context = { requestId: 'test-123', startTime: Date.now() };

    runWithContext(context, () => {
      const ctx = getContext();
      expect(ctx?.requestId).toBe('test-123');
    });
  });

  it('isolates contexts across concurrent operations', async () => {
    const results: string[] = [];

    await Promise.all([
      runWithContext({ requestId: 'req-1', startTime: Date.now() }, async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        results.push(getContext()!.requestId);
      }),
      runWithContext({ requestId: 'req-2', startTime: Date.now() }, async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        results.push(getContext()!.requestId);
      }),
    ]);

    expect(results).toContain('req-1');
    expect(results).toContain('req-2');
  });

  it('returns undefined outside runWithContext', () => {
    const ctx = getContext();
    expect(ctx).toBeUndefined();
  });
});
```

## Related References

- [logger-factory.md](./logger-factory.md) - Using context in logger creation
- [base-fields.md](./base-fields.md) - Context fields in BaseLogFields schema
