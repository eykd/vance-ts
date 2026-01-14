# Sentry Integration

**Use when:** Integrating Sentry for rich error tracking with breadcrumbs and context while maintaining structured log correlation.

## Overview

This skill guides you through integrating Sentry with Cloudflare Workers for comprehensive error tracking. It covers withSentry wrapper configuration with environment-specific sampling, custom context management for request/user data, breadcrumb patterns for debugging, and manual error capture with additional metadata. All patterns work with @sentry/cloudflare SDK and integrate with structured logging.

## Decision Tree

### Need to set up Sentry?

**When**: Configuring initial Sentry integration with withSentry wrapper and environment variables
**Go to**: [references/withsentry-setup.md](./references/withsentry-setup.md)

### Need to add custom context?

**When**: Setting user context, tags, or request metadata for error correlation
**Go to**: [references/context-management.md](./references/context-management.md)

### Need to track events?

**When**: Adding breadcrumbs to understand the sequence of events leading to errors
**Go to**: [references/breadcrumbs.md](./references/breadcrumbs.md)

### Need to capture errors manually?

**When**: Capturing exceptions with custom tags, extra data, and severity levels
**Go to**: [references/error-capture.md](./references/error-capture.md)

## Quick Example

```typescript
// src/index.ts
import * as Sentry from '@sentry/cloudflare';

interface Env {
  SENTRY_DSN: string;
  CF_VERSION_METADATA: { id: string };
  ENVIRONMENT: string;
}

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    release: env.CF_VERSION_METADATA.id,
    environment: env.ENVIRONMENT,
    tracesSampleRate: env.ENVIRONMENT === 'production' ? 0.1 : 1.0,
    enableLogs: true,
    sendDefaultPii: false,
    beforeSend(event) {
      // Redact sensitive headers
      if (event.request?.headers) {
        const headers = { ...event.request.headers };
        if (headers.authorization) headers.authorization = '[REDACTED]';
        event.request.headers = headers;
      }
      return event;
    },
  }),
  {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
      // Add breadcrumb
      Sentry.addBreadcrumb({
        category: 'http',
        message: `${request.method} ${new URL(request.url).pathname}`,
        level: 'info',
      });

      return new Response('OK');
    },
  }
);
```

## Cross-References

- **[structured-logging](../structured-logging/SKILL.md)**: Correlate Sentry events with structured logs via request_id and trace_id
- **[pii-redaction](../pii-redaction/SKILL.md)**: Apply redaction patterns to Sentry events using beforeSend and beforeBreadcrumb hooks

## Reference Files

- [references/withsentry-setup.md](./references/withsentry-setup.md) - Configure withSentry wrapper with environment-specific settings and wrangler.jsonc
- [references/context-management.md](./references/context-management.md) - Set user context, tags, and custom context for error correlation
- [references/breadcrumbs.md](./references/breadcrumbs.md) - Add breadcrumbs to track event sequences and user actions
- [references/error-capture.md](./references/error-capture.md) - Manually capture exceptions with tags, extra data, and severity levels
