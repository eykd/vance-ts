# withSentry Wrapper Setup

**Purpose**: Configure Sentry integration using withSentry wrapper with environment-specific settings and required compatibility flags.

## When to Use

Use this reference when setting up initial Sentry integration for a Cloudflare Worker, configuring environment-specific sampling rates, or enabling structured log integration with Sentry's logging API.

## Pattern

```typescript
// src/index.ts
import * as Sentry from '@sentry/cloudflare';

interface Env {
  SENTRY_DSN: string;
  CF_VERSION_METADATA: { id: string };
  ENVIRONMENT: string;
  DB: D1Database;
  SESSIONS: KVNamespace;
}

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    release: env.CF_VERSION_METADATA.id,
    environment: env.ENVIRONMENT,

    // Capture 100% of errors, sample 10% of traces
    tracesSampleRate: env.ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Enable Sentry Logs
    enableLogs: true,

    // Add request headers and IP (be careful with PII)
    sendDefaultPii: false,

    // Filter sensitive data from breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'http') {
        // Redact authorization headers
        if (breadcrumb.data?.headers) {
          breadcrumb.data.headers = redactHeaders(breadcrumb.data.headers);
        }
      }
      return breadcrumb;
    },

    // Filter events before sending
    beforeSend(event) {
      // Redact sensitive data from event
      if (event.request?.headers) {
        event.request.headers = redactHeaders(event.request.headers);
      }
      return event;
    },
  }),
  {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
      return handleRequest(request, env, ctx);
    },
  }
);

function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
  const redacted = { ...headers };

  for (const header of sensitiveHeaders) {
    if (redacted[header]) {
      redacted[header] = '[REDACTED]';
    }
  }

  return redacted;
}
```

## Wrangler Configuration

```jsonc
// wrangler.jsonc
{
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "2024-12-01",
  "compatibility_flags": ["nodejs_als"],

  "version_metadata": {
    "binding": "CF_VERSION_METADATA",
  },

  "observability": {
    "enabled": true,
    "head_sampling_rate": 1.0,
  },
}
```

## Environment Variables

Add to your `.dev.vars` (local) and Cloudflare dashboard (production):

```bash
SENTRY_DSN=https://[public_key]@[host]/[project_id]
ENVIRONMENT=production
```

## Common Mistakes

### ❌ Mistake: Not enabling nodejs_als compatibility flag

```jsonc
// Bad - missing required flag
{
  "compatibility_date": "2024-12-01",
}
```

**Why it's wrong**: Sentry SDK requires AsyncLocalStorage support which needs nodejs_als flag.

### ✅ Correct: Include nodejs_als in compatibility_flags

```jsonc
// Good - includes required flag
{
  "compatibility_date": "2024-12-01",
  "compatibility_flags": ["nodejs_als"],
}
```

### ❌ Mistake: Setting sendDefaultPii: true

```typescript
// Bad - exposes PII by default
Sentry.withSentry((env: Env) => ({
  dsn: env.SENTRY_DSN,
  sendDefaultPii: true, // Sends IP, user agent, cookies
}));
```

**Why it's wrong**: Automatically includes PII in error reports which may violate privacy regulations.

### ✅ Correct: Explicitly control PII with beforeSend

```typescript
// Good - control what gets sent
Sentry.withSentry((env: Env) => ({
  dsn: env.SENTRY_DSN,
  sendDefaultPii: false,
  beforeSend(event) {
    // Explicitly add non-PII context
    return event;
  },
}));
```

## Testing

```typescript
// src/index.test.ts
import { describe, it, expect } from 'vitest';
import * as Sentry from '@sentry/cloudflare';

describe('Sentry Configuration', () => {
  it('should set production sampling rate to 10%', () => {
    const env = {
      SENTRY_DSN: 'https://test@sentry.io/1',
      CF_VERSION_METADATA: { id: 'test-version' },
      ENVIRONMENT: 'production',
    } as Env;

    // Verify tracesSampleRate is environment-aware
    expect(env.ENVIRONMENT === 'production' ? 0.1 : 1.0).toBe(0.1);
  });
});
```

## Related References

- [context-management.md](./context-management.md) - Add custom context to Sentry events
- [error-capture.md](./error-capture.md) - Manually capture errors with additional metadata
