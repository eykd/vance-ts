# Comprehensive Guide: Logging & Tracing in Cloudflare Applications

**Structured Observability with Sentry and Cloudflare Workers Observability Platform**

_A Latent Track Capability: Zero Value at MVP, Massive Value When Production Breaks_

---

## Table of Contents

1. [Introduction](#introduction)
2. [Philosophy: Why Structured Logging Matters](#philosophy-why-structured-logging-matters)
3. [Architecture Overview](#architecture-overview)
4. [Structured Logging Schema](#structured-logging-schema)
5. [Log Categories: Domain vs Application vs Infrastructure](#log-categories)
6. [Cloudflare Workers Observability Platform](#cloudflare-workers-observability-platform)
7. [Sentry Integration](#sentry-integration)
8. [PII and Secret Redaction](#pii-and-secret-redaction)
9. [Implementation Guide](#implementation-guide)
10. [Testing Observability](#testing-observability)
11. [Claude Skill: Add Structured Logging](#claude-skill-add-structured-logging)
12. [Best Practices and Patterns](#best-practices-and-patterns)

---

## Introduction

This guide presents an opinionated approach to logging and tracing in Cloudflare Workers applications. While observability provides zero value at MVP stage, it becomes invaluable the moment something breaks in production. The investment in structured logging pays dividends when you need to debug a production incident at 3 AM.

### Why This Matters

When a user reports "the app is broken," you need to answer:

- What happened?
- When did it happen?
- Who was affected?
- What was the request context?
- What downstream services were involved?
- How long did each operation take?

Unstructured `console.log("something happened")` statements cannot answer these questions. Structured logging with proper correlation IDs, domain events, and redaction rules can.

### The Latent Track Philosophy

This capability is classified as a "latent track" because:

- **Zero value at MVP**: Early-stage products need features, not observability infrastructure
- **Massive value in production**: When incidents occur, proper logging is the difference between a 5-minute fix and a 5-hour investigation
- **Compound returns**: Well-structured logs enable automated alerting, anomaly detection, and performance optimization

---

## Quick Start

This guide teaches you to implement structured logging and tracing for Cloudflare Workers applications. You'll learn to categorize logs by domain/application/infrastructure boundaries, implement PII redaction, integrate with Sentry and Cloudflare Observability, and correlate logs across distributed requests. While logging provides zero value at MVP stage, it becomes invaluable when debugging production incidents—the investment in structured logging pays dividends when you need to answer "what happened?" at 3 AM.

### Minimal Example: Structured Logger

```typescript
// src/infrastructure/logging/index.ts
export function createLogger(requestId: string, service: string) {
  return {
    info(event: string, data: Record<string, unknown>) {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'info',
          request_id: requestId,
          service,
          event,
          ...data,
        })
      );
    },
    error(event: string, error: Error, data?: Record<string, unknown>) {
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          request_id: requestId,
          service,
          event,
          error_message: error.message,
          error_type: error.constructor.name,
          ...data,
        })
      );
    },
  };
}

// Usage in request handler
const logger = createLogger(crypto.randomUUID(), 'task-api');
logger.info('user.login.succeeded', { user_id: '123', duration_ms: 45 });
```

**Learn more**:

- [Structured Logging Schema](#structured-logging-schema) - Complete field definitions and event naming
- [Log Categories](#log-categories) - Domain vs Application vs Infrastructure logs
- [PII and Secret Redaction](#pii-and-secret-redaction) - Defense-in-depth data protection
- [Sentry Integration](#sentry-integration) - Rich error context and breadcrumbs

---

## Philosophy: Why Structured Logging Matters

### The Problem with printf-Style Logging

```typescript
// ❌ BAD: Unstructured logging
console.log('User login failed');
console.log('Error: ' + error.message);
console.log('Processing order for user ' + userId);
```

These logs are:

- **Unqueryable**: Cannot filter by user, request, or error type
- **Uncorrelated**: Cannot trace a request across multiple log statements
- **Unsafe**: May accidentally include PII or secrets
- **Incomplete**: Missing timestamps, severity levels, and context

### The Structured Alternative

```typescript
// ✅ GOOD: Structured logging
logger.info({
  event: 'user.login.failed',
  request_id: ctx.requestId,
  user_id: userId,
  reason: 'invalid_credentials',
  ip: '[REDACTED]',
  duration_ms: 45,
});
```

Structured logs are:

- **Queryable**: Filter by any field (`event:user.login.failed AND user_id:123`)
- **Correlated**: All logs for a request share `request_id`
- **Safe**: PII redaction is systematic, not ad-hoc
- **Complete**: Schema enforces required context

---

## Architecture Overview

### Observability Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Cloudflare Worker                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Request Handler                                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │  │
│  │  │   Domain    │  │ Application │  │    Infra    │           │  │
│  │  │    Logs     │  │    Logs     │  │    Logs     │           │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘           │  │
│  │         │                │                │                   │  │
│  │         └────────────────┼────────────────┘                   │  │
│  │                          ▼                                    │  │
│  │              ┌───────────────────────┐                        │  │
│  │              │   Structured Logger   │                        │  │
│  │              │  (JSON + Redaction)   │                        │  │
│  │              └───────────┬───────────┘                        │  │
│  └──────────────────────────┼────────────────────────────────────┘  │
│                             ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Workers Observability Runtime                    │   │
│  │         (Automatic Traces + console.log capture)              │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│    Cloudflare     │ │      Sentry       │ │   Third-Party     │
│    Dashboard      │ │   (Errors/Logs/   │ │    OTLP (e.g.,    │
│   (Logs/Traces)   │ │     Traces)       │ │ Grafana/Axiom)    │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

### Two Integration Approaches

| Approach          | Sentry SDK                             | Cloudflare OTLP Export   |
| ----------------- | -------------------------------------- | ------------------------ |
| Setup complexity  | Medium (code changes)                  | Low (config only)        |
| Error capturing   | Full (stack traces, breadcrumbs)       | Basic                    |
| Custom context    | Rich (tags, user context, breadcrumbs) | Limited                  |
| Trace correlation | Built-in                               | Via trace_id propagation |
| Log correlation   | Via Sentry Logs API                    | Via OTLP                 |
| Best for          | Primary error monitoring               | Multi-destination export |

**Recommendation**: Use the Sentry SDK for rich error context and breadcrumbs. Use Cloudflare OTLP export for sending data to additional destinations.

---

## Structured Logging Schema

### Core Schema Definition

Every log entry must conform to this schema:

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

### Event Naming Convention

Use dot-notation for event names following this pattern:

```
{domain}.{entity}.{action}[.{outcome}]
```

**Examples:**

| Event Name                 | Description                |
| -------------------------- | -------------------------- |
| `task.created`             | A task was created         |
| `task.completed`           | A task was marked complete |
| `user.login.succeeded`     | User login succeeded       |
| `user.login.failed`        | User login failed          |
| `payment.charge.succeeded` | Payment charge succeeded   |
| `payment.charge.failed`    | Payment charge failed      |
| `http.request.received`    | HTTP request received      |
| `http.response.sent`       | HTTP response sent         |
| `db.query.executed`        | Database query executed    |
| `cache.hit`                | Cache hit                  |
| `cache.miss`               | Cache miss                 |

### Required Fields by Log Category

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

---

## Log Categories

Understanding where logs belong is crucial for maintainability and debugging efficiency.

### Domain Logs

**Purpose**: Record business-significant events that matter to stakeholders.

**Location**: Within domain entities, services, and use cases.

**Characteristics**:

- Describe what happened in business terms
- Include aggregate identifiers
- Never include technical implementation details
- Should be understandable by non-technical stakeholders

```typescript
// src/domain/entities/Task.ts
export class Task {
  complete(logger: DomainLogger): void {
    if (this.status === TaskStatus.Completed) {
      logger.warn({
        event: 'task.complete.already_completed',
        category: 'domain',
        aggregate_type: 'Task',
        aggregate_id: this.id,
        domain_event: 'TaskCompletionAttempted',
      });
      return;
    }

    this.status = TaskStatus.Completed;
    this.completedAt = new Date();

    logger.info({
      event: 'task.completed',
      category: 'domain',
      aggregate_type: 'Task',
      aggregate_id: this.id,
      domain_event: 'TaskCompleted',
      task_title: this.title, // Safe to log
      days_to_complete: this.daysToComplete(),
    });
  }
}
```

### Application Logs

**Purpose**: Record the flow of requests through the application layer.

**Location**: Request handlers, use cases, middleware.

**Characteristics**:

- Include HTTP context (method, path, status)
- Track request timing and performance
- Capture validation failures and business rule violations
- Bridge between external requests and domain operations

```typescript
// src/application/use-cases/CompleteTask.ts
export class CompleteTaskUseCase {
  async execute(
    request: CompleteTaskRequest,
    logger: ApplicationLogger
  ): Promise<CompleteTaskResponse> {
    const startTime = Date.now();

    logger.info({
      event: 'use_case.complete_task.started',
      category: 'application',
      task_id: request.taskId,
      user_id: request.userId,
    });

    try {
      const task = await this.taskRepository.findById(request.taskId);

      if (!task) {
        logger.warn({
          event: 'use_case.complete_task.task_not_found',
          category: 'application',
          task_id: request.taskId,
          user_id: request.userId,
        });
        return { success: false, error: 'TASK_NOT_FOUND' };
      }

      task.complete(logger.forDomain());

      await this.taskRepository.save(task);

      logger.info({
        event: 'use_case.complete_task.succeeded',
        category: 'application',
        task_id: request.taskId,
        user_id: request.userId,
        duration_ms: Date.now() - startTime,
      });

      return { success: true };
    } catch (error) {
      logger.error({
        event: 'use_case.complete_task.failed',
        category: 'application',
        task_id: request.taskId,
        user_id: request.userId,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_type: error instanceof Error ? error.constructor.name : 'Unknown',
        duration_ms: Date.now() - startTime,
      });
      throw error;
    }
  }
}
```

### Infrastructure Logs

**Purpose**: Record interactions with external systems and infrastructure components.

**Location**: Repository implementations, cache adapters, external API clients.

**Characteristics**:

- Include timing information for performance monitoring
- Track connection states and retry attempts
- Capture query patterns (without sensitive data)
- Enable infrastructure health monitoring

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts
export class D1TaskRepository implements TaskRepository {
  async findById(id: string, logger: InfrastructureLogger): Promise<Task | null> {
    const startTime = Date.now();

    logger.debug({
      event: 'db.query.started',
      category: 'infrastructure',
      query_type: 'SELECT',
      table: 'tasks',
      operation: 'findById',
    });

    try {
      const result = await this.db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();

      const duration = Date.now() - startTime;

      logger.info({
        event: result ? 'db.query.succeeded' : 'db.query.not_found',
        category: 'infrastructure',
        query_type: 'SELECT',
        table: 'tasks',
        operation: 'findById',
        duration_ms: duration,
        row_count: result ? 1 : 0,
      });

      return result ? this.mapToEntity(result) : null;
    } catch (error) {
      logger.error({
        event: 'db.query.failed',
        category: 'infrastructure',
        query_type: 'SELECT',
        table: 'tasks',
        operation: 'findById',
        duration_ms: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }
}
```

### Decision Matrix: Where Does This Log Belong?

| Question                                                          | Yes → Category |
| ----------------------------------------------------------------- | -------------- |
| Does it describe a business event a stakeholder would care about? | Domain         |
| Does it describe request flow, validation, or use case execution? | Application    |
| Does it describe database, cache, or external API interaction?    | Infrastructure |
| Is it about HTTP request/response lifecycle?                      | Application    |
| Is it about connection pooling, retries, or timeouts?             | Infrastructure |
| Would a product manager want to see this in a report?             | Domain         |

---

## Cloudflare Workers Observability Platform

Cloudflare provides built-in observability that captures logs and traces with zero code changes.

### Enabling Workers Logs

Add to your `wrangler.jsonc`:

```jsonc
{
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "2024-12-01",
  "compatibility_flags": ["nodejs_als"],

  "observability": {
    "enabled": true,
    "head_sampling_rate": 1.0, // 1.0 = 100%, 0.1 = 10%
  },
}
```

### Enabling Automatic Tracing

Tracing is currently in beta. Enable it explicitly:

```jsonc
{
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1.0,
    "traces": {
      "enabled": true,
      "head_sampling_rate": 1.0,
    },
  },
}
```

### What Gets Traced Automatically

Cloudflare's runtime automatically instruments:

- **Fetch calls**: External HTTP requests
- **KV operations**: `get`, `put`, `delete`, `list`
- **R2 operations**: Object storage interactions
- **D1 queries**: Database operations
- **Durable Objects**: DO method calls
- **Queue operations**: Queue sends and receives
- **Worker handlers**: `fetch`, `scheduled`, `queue`, etc.

Each operation becomes a span with timing and metadata.

### Structured Logging with Workers Logs

Workers Logs automatically parses JSON from `console.log`:

```typescript
// ✅ Logs are automatically parsed and indexed
console.log(
  JSON.stringify({
    event: 'user.login.succeeded',
    user_id: '123',
    duration_ms: 45,
  })
);
```

### Exporting to Third-Party Destinations

Configure OTLP export in the Cloudflare dashboard:

1. Navigate to **Workers & Pages** → **Workers Observability**
2. Click **Add destination**
3. Configure your OTLP endpoint:

**Wrangler configuration for exports:**

```jsonc
{
  "observability": {
    "enabled": true,
    "logs": {
      "enabled": true,
      "destinations": ["grafana-logs", "sentry-logs"],
    },
    "traces": {
      "enabled": true,
      "destinations": ["grafana-traces", "sentry-traces"],
    },
  },
}
```

### Querying Logs in Cloudflare Dashboard

The Workers Observability dashboard supports filtering by any JSON field:

```
event:user.login.failed AND user_id:123
```

```
category:infrastructure AND duration_ms:>1000
```

```
error_type:DatabaseError
```

---

## Sentry Integration

Sentry provides rich error tracking with stack traces, breadcrumbs, and user context.

### Installation

```bash
npm install @sentry/cloudflare --save
```

### Wrangler Configuration

```jsonc
{
  "compatibility_flags": ["nodejs_als"],
  "version_metadata": {
    "binding": "CF_VERSION_METADATA",
  },
}
```

### Basic Setup with withSentry

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

### Adding Custom Context

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

### Manual Error Capture with Context

```typescript
// src/application/use-cases/CreatePayment.ts
import * as Sentry from '@sentry/cloudflare';

export class CreatePaymentUseCase {
  async execute(request: CreatePaymentRequest): Promise<PaymentResult> {
    try {
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

### Using Sentry Logs API

Sentry now supports structured logs alongside errors:

```typescript
// src/infrastructure/logging/sentryLogger.ts
import * as Sentry from '@sentry/cloudflare';

export function createSentryLogger(baseContext: BaseLogFields) {
  return {
    debug(fields: Partial<StructuredLogEntry>) {
      const entry = { ...baseContext, ...fields, level: 'debug' as const };
      Sentry.logger.debug(formatMessage(entry), entry);
    },

    info(fields: Partial<StructuredLogEntry>) {
      const entry = { ...baseContext, ...fields, level: 'info' as const };
      Sentry.logger.info(formatMessage(entry), entry);
    },

    warn(fields: Partial<StructuredLogEntry>) {
      const entry = { ...baseContext, ...fields, level: 'warn' as const };
      Sentry.logger.warn(formatMessage(entry), entry);
    },

    error(fields: Partial<StructuredLogEntry>) {
      const entry = { ...baseContext, ...fields, level: 'error' as const };
      Sentry.logger.error(formatMessage(entry), entry);
    },
  };
}

function formatMessage(entry: StructuredLogEntry): string {
  return `[${entry.event}] ${entry.category}`;
}
```

### Configuring OTLP Export to Sentry

For automatic trace and log export without the SDK:

1. Get your Sentry OTLP endpoints from Project Settings → Client Keys (DSN)
2. Add destinations in Cloudflare Workers Observability dashboard:

**Traces destination:**

- Name: `sentry-traces`
- Endpoint: `https://{HOST}/api/{PROJECT_ID}/integration/otlp/v1/traces`
- Header: `sentry sentry_key={SENTRY_PUBLIC_KEY}`

**Logs destination:**

- Name: `sentry-logs`
- Endpoint: `https://{HOST}/api/{PROJECT_ID}/integration/otlp/v1/logs`
- Header: `sentry sentry_key={SENTRY_PUBLIC_KEY}`

3. Update `wrangler.jsonc`:

```jsonc
{
  "observability": {
    "traces": {
      "enabled": true,
      "destinations": ["sentry-traces"],
    },
    "logs": {
      "enabled": true,
      "destinations": ["sentry-logs"],
    },
  },
}
```

---

## PII and Secret Redaction

Never log sensitive data. Implement defense in depth with multiple redaction layers.

### Data Classification

| Category              | Examples                                               | Action                                      |
| --------------------- | ------------------------------------------------------ | ------------------------------------------- |
| **Never Log**         | Passwords, API keys, tokens, credit card numbers, SSNs | Block at source                             |
| **Always Redact**     | Email addresses, phone numbers, IP addresses, names    | Mask or hash                                |
| **Conditionally Log** | User IDs, session IDs, request paths                   | Log in non-production, redact in production |
| **Safe to Log**       | Timestamps, error codes, aggregate counts, colo codes  | Log freely                                  |

### Redaction Patterns

```typescript
// src/infrastructure/logging/redaction.ts

/**
 * Patterns for sensitive data that should never appear in logs
 */
export const SENSITIVE_PATTERNS = {
  // API Keys and Tokens
  apiKey:
    /(?:api[_-]?key|apikey|access[_-]?token|auth[_-]?token)['":\s]*[=:]\s*['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi,
  bearerToken: /Bearer\s+[a-zA-Z0-9_\-\.]+/gi,
  jwt: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,

  // AWS Credentials
  awsAccessKey: /(?:AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}/g,
  awsSecretKey: /[a-zA-Z0-9/+=]{40}/g,

  // Credit Cards
  creditCard: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,

  // PII
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

  // Generic Secrets
  password: /(?:password|passwd|pwd)['":\s]*[=:]\s*['"]?([^'"\s]+)['"]?/gi,
  secret: /(?:secret|private[_-]?key)['":\s]*[=:]\s*['"]?([^'"\s]+)['"]?/gi,
};

/**
 * Fields that should always be redacted
 */
export const REDACT_FIELDS = new Set([
  'password',
  'passwd',
  'secret',
  'token',
  'api_key',
  'apiKey',
  'authorization',
  'auth',
  'credit_card',
  'creditCard',
  'card_number',
  'cardNumber',
  'cvv',
  'ssn',
  'social_security',
  'socialSecurity',
]);

/**
 * Fields that should be masked (show partial data)
 */
export const MASK_FIELDS = new Set(['email', 'phone', 'ip', 'ip_address', 'ipAddress']);

export function redactValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (typeof value === 'object') {
    return redactObject(value as Record<string, unknown>);
  }

  return value;
}

function redactString(str: string): string {
  let result = str;

  // Apply all pattern replacements
  for (const pattern of Object.values(SENSITIVE_PATTERNS)) {
    result = result.replace(pattern, '[REDACTED]');
  }

  return result;
}

function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    if (REDACT_FIELDS.has(lowerKey)) {
      result[key] = '[REDACTED]';
    } else if (MASK_FIELDS.has(lowerKey) && typeof value === 'string') {
      result[key] = maskString(value, lowerKey);
    } else {
      result[key] = redactValue(value);
    }
  }

  return result;
}

function maskString(str: string, fieldType: string): string {
  if (fieldType === 'email') {
    const [local, domain] = str.split('@');
    if (local && domain) {
      return `${local[0]}***@${domain}`;
    }
  }

  if (fieldType === 'phone' || fieldType === 'ip' || fieldType === 'ip_address') {
    return str.slice(0, 3) + '***' + str.slice(-2);
  }

  // Default: show first and last characters
  if (str.length > 4) {
    return str[0] + '***' + str[str.length - 1];
  }

  return '[REDACTED]';
}
```

### Safe Logger Implementation

```typescript
// src/infrastructure/logging/safeLogger.ts
import { redactValue } from './redaction';
import type { StructuredLogEntry, BaseLogFields } from './schema';

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

### URL Redaction

Never log full URLs with query parameters:

```typescript
// src/infrastructure/logging/urlRedaction.ts

/**
 * Query parameters that should be redacted
 */
const SENSITIVE_PARAMS = new Set([
  'token',
  'key',
  'api_key',
  'apikey',
  'password',
  'secret',
  'auth',
  'access_token',
  'refresh_token',
  'code', // OAuth codes
  'state', // OAuth state (may contain sensitive data)
]);

export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Redact sensitive query parameters
    for (const param of SENSITIVE_PARAMS) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, '[REDACTED]');
      }
    }

    // Redact path segments that look like tokens
    const pathSegments = parsed.pathname.split('/');
    const redactedPath = pathSegments
      .map((segment) => {
        // Redact long alphanumeric strings (likely tokens/IDs)
        if (/^[a-zA-Z0-9_-]{32,}$/.test(segment)) {
          return '[ID]';
        }
        return segment;
      })
      .join('/');

    parsed.pathname = redactedPath;

    return parsed.toString();
  } catch {
    // If URL parsing fails, return a safe fallback
    return '[INVALID_URL]';
  }
}
```

---

## Implementation Guide

### Project Structure

```
src/
├── infrastructure/
│   └── logging/
│       ├── index.ts              # Public exports
│       ├── schema.ts             # Type definitions
│       ├── redaction.ts          # Redaction utilities
│       ├── safeLogger.ts         # Main logger implementation
│       ├── context.ts            # Request context management
│       └── sentry.ts             # Sentry integration
├── presentation/
│   └── middleware/
│       └── logging.ts            # Request logging middleware
└── index.ts                      # Worker entry point
```

### Request Context Management

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

### Logger Factory

```typescript
// src/infrastructure/logging/index.ts
import { SafeLogger } from './safeLogger';
import { getContext, RequestContext } from './context';
import type { BaseLogFields, StructuredLogEntry } from './schema';

export interface LoggerOptions {
  service: string;
  environment: string;
  version: string;
}

export function createLogger(options: LoggerOptions): SafeLogger {
  const context = getContext();

  const baseFields: BaseLogFields = {
    request_id: context?.requestId ?? 'no-context',
    trace_id: context?.traceId,
    span_id: context?.spanId,
    timestamp: new Date().toISOString(),
    service: options.service,
    environment: options.environment,
    version: options.version,
    level: 'info',
    event: '',
    category: 'application',
  };

  return new SafeLogger(baseFields, options.environment === 'production');
}

// Convenience loggers for different categories
export function createDomainLogger(options: LoggerOptions) {
  const logger = createLogger(options);
  return {
    info: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.info({ ...fields, category: 'domain' }),
    warn: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.warn({ ...fields, category: 'domain' }),
    error: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.error({ ...fields, category: 'domain' }),
  };
}

export function createInfraLogger(options: LoggerOptions) {
  const logger = createLogger(options);
  return {
    debug: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.debug({ ...fields, category: 'infrastructure' }),
    info: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.info({ ...fields, category: 'infrastructure' }),
    warn: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.warn({ ...fields, category: 'infrastructure' }),
    error: (fields: Omit<Partial<StructuredLogEntry>, 'category'>) =>
      logger.error({ ...fields, category: 'infrastructure' }),
  };
}

export * from './schema';
export * from './context';
export * from './redaction';
```

### Request Logging Middleware

```typescript
// src/presentation/middleware/logging.ts
import {
  createLogger,
  runWithContext,
  generateRequestId,
  extractTraceContext,
  type LoggerOptions,
} from '../../infrastructure/logging';
import { redactUrl } from '../../infrastructure/logging/redaction';

export function withRequestLogging(
  options: LoggerOptions,
  handler: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
) {
  return async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
    const requestId = request.headers.get('x-request-id') ?? generateRequestId();
    const { traceId, spanId } = extractTraceContext(request);
    const startTime = Date.now();

    const context = {
      requestId,
      traceId,
      spanId,
      startTime,
    };

    return runWithContext(context, async () => {
      const logger = createLogger(options);

      // Log request received
      logger.info({
        event: 'http.request.received',
        category: 'application',
        http_method: request.method,
        http_path: new URL(request.url).pathname,
        cf_colo: (request.cf?.colo as string) ?? 'unknown',
        cf_country: (request.cf?.country as string) ?? 'unknown',
      });

      try {
        const response = await handler(request, env, ctx);

        // Log response sent
        logger.info({
          event: 'http.response.sent',
          category: 'application',
          http_method: request.method,
          http_path: new URL(request.url).pathname,
          http_status: response.status,
          duration_ms: Date.now() - startTime,
        });

        // Add request ID to response headers for correlation
        const headers = new Headers(response.headers);
        headers.set('x-request-id', requestId);

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (error) {
        const duration = Date.now() - startTime;

        logger.error({
          event: 'http.request.failed',
          category: 'application',
          http_method: request.method,
          http_path: new URL(request.url).pathname,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          error_type: error instanceof Error ? error.constructor.name : 'Unknown',
          duration_ms: duration,
        });

        throw error;
      }
    });
  };
}
```

### Complete Worker Setup

```typescript
// src/index.ts
import * as Sentry from '@sentry/cloudflare';
import { withRequestLogging } from './presentation/middleware/logging';
import { router } from './router';

interface Env {
  SENTRY_DSN: string;
  CF_VERSION_METADATA: { id: string };
  ENVIRONMENT: string;
  DB: D1Database;
  SESSIONS: KVNamespace;
}

const loggerOptions = {
  service: 'task-api',
  environment: '', // Set dynamically
  version: '', // Set dynamically
};

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    release: env.CF_VERSION_METADATA.id,
    environment: env.ENVIRONMENT,
    tracesSampleRate: env.ENVIRONMENT === 'production' ? 0.1 : 1.0,
    enableLogs: true,
    sendDefaultPii: false,
  }),
  {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
      // Update logger options with runtime values
      loggerOptions.environment = env.ENVIRONMENT;
      loggerOptions.version = env.CF_VERSION_METADATA.id;

      // Wrap handler with request logging
      const handler = withRequestLogging(loggerOptions, (req, e, c) => router.handle(req, e, c));

      return handler(request, env, ctx);
    },
  }
);
```

---

## Testing Observability

### Unit Testing the Logger

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
});
```

### Testing Redaction

```typescript
// src/infrastructure/logging/redaction.spec.ts
import { describe, it, expect } from 'vitest';
import { redactValue, redactUrl } from './redaction';

describe('redactValue', () => {
  it('redacts API keys in strings', () => {
    const input = 'api_key: "sk_live_abcdef123456789012345678"';
    const result = redactValue(input);
    expect(result).toBe('[REDACTED]');
  });

  it('redacts JWT tokens', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    const result = redactValue(jwt);
    expect(result).toBe('[REDACTED]');
  });

  it('redacts credit card numbers', () => {
    const input = 'Card: 4111-1111-1111-1111';
    const result = redactValue(input);
    expect(result).toBe('Card: [REDACTED]');
  });

  it('redacts sensitive object fields', () => {
    const input = {
      username: 'john',
      password: 'secret123',
      token: 'abc123',
    };
    const result = redactValue(input);
    expect(result).toEqual({
      username: 'john',
      password: '[REDACTED]',
      token: '[REDACTED]',
    });
  });

  it('masks email addresses', () => {
    const input = { email: 'john.doe@example.com' };
    const result = redactValue(input);
    expect((result as any).email).toBe('j***@example.com');
  });

  it('handles nested objects', () => {
    const input = {
      user: {
        name: 'John',
        credentials: {
          password: 'secret',
        },
      },
    };
    const result = redactValue(input) as any;
    expect(result.user.credentials.password).toBe('[REDACTED]');
    expect(result.user.name).toBe('John');
  });
});

describe('redactUrl', () => {
  it('redacts sensitive query parameters', () => {
    const url = 'https://api.example.com/auth?token=abc123&user=john';
    const result = redactUrl(url);
    expect(result).toBe('https://api.example.com/auth?token=[REDACTED]&user=john');
  });

  it('redacts long path segments', () => {
    const url = 'https://api.example.com/users/abc123def456ghi789jkl012mno345pqr678';
    const result = redactUrl(url);
    expect(result).toContain('[ID]');
  });
});
```

### Integration Testing with Miniflare

```typescript
// src/infrastructure/logging/integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Miniflare } from 'miniflare';

describe('Logging Integration', () => {
  let mf: Miniflare;
  let capturedLogs: string[] = [];

  beforeAll(async () => {
    // Capture console.log output
    const originalLog = console.log;
    console.log = (...args) => {
      capturedLogs.push(args.join(' '));
      originalLog(...args);
    };

    mf = new Miniflare({
      modules: true,
      script: `
        export default {
          async fetch(request, env) {
            console.log(JSON.stringify({
              event: "test.request",
              request_id: "test-123"
            }));
            return new Response("OK");
          }
        }
      `,
    });
  });

  afterAll(async () => {
    await mf.dispose();
  });

  it('emits structured JSON logs', async () => {
    capturedLogs = [];
    await mf.dispatchFetch('http://localhost/test');

    expect(capturedLogs.length).toBeGreaterThan(0);

    const logEntry = JSON.parse(capturedLogs[0]);
    expect(logEntry.event).toBe('test.request');
    expect(logEntry.request_id).toBe('test-123');
  });
});
```

---

## Claude Skill: Add Structured Logging

Use this skill prompt when you want Claude to add structured logging to a use case or component.

### Skill Definition

```markdown
## Skill: Add Structured Logging

### Context

You are adding structured logging to a Cloudflare Workers application that follows
Domain-Driven Design and Clean Architecture principles.

### Requirements

1. **Determine the log category:**
   - Domain: Business events that stakeholders care about
   - Application: Request flow, validation, use case execution
   - Infrastructure: Database, cache, external API interactions

2. **Use the correct event naming convention:**
```

{domain}.{entity}.{action}[.{outcome}]

````

3. **Include required fields based on category:**

- All logs: request_id, timestamp, service, environment, level, event, category
- Domain logs: aggregate_type, aggregate_id, domain_event
- Application logs: http_method, http_path, http_status, duration_ms
- Infrastructure logs: duration_ms, operation details

4. **Never log sensitive data:**

- Passwords, tokens, API keys: Never
- Email, phone, IP: Mask or omit
- User IDs: OK to log
- Request paths: OK, but redact query params

5. **Log at appropriate levels:**

- debug: Detailed diagnostic info (disabled in production)
- info: Normal operations, state changes
- warn: Unexpected but handled situations
- error: Failures requiring attention

6. **Include timing for operations:**
- Capture start time at operation beginning
- Include duration_ms in completion log

### Example Application

**Input:** "Add logging to the CreateTask use case"

**Output:**

```typescript
export class CreateTaskUseCase {
async execute(
 request: CreateTaskRequest,
 logger: ApplicationLogger
): Promise<CreateTaskResponse> {
 const startTime = Date.now();

 logger.info({
   event: "use_case.create_task.started",
   category: "application",
   user_id: request.userId,
 });

 try {
   // Validation
   const validationResult = this.validator.validate(request);
   if (!validationResult.success) {
     logger.warn({
       event: "use_case.create_task.validation_failed",
       category: "application",
       user_id: request.userId,
       validation_errors: validationResult.errors.length,
     });
     return { success: false, errors: validationResult.errors };
   }

   // Domain operation
   const task = Task.create(request.title, request.description);
   task.logCreation(logger.forDomain());

   // Persistence
   await this.taskRepository.save(task);

   logger.info({
     event: "use_case.create_task.succeeded",
     category: "application",
     user_id: request.userId,
     task_id: task.id,
     duration_ms: Date.now() - startTime,
   });

   return { success: true, taskId: task.id };
 } catch (error) {
   logger.error({
     event: "use_case.create_task.failed",
     category: "application",
     user_id: request.userId,
     error_type: error instanceof Error ? error.constructor.name : "Unknown",
     error_message: error instanceof Error ? error.message : "Unknown error",
     duration_ms: Date.now() - startTime,
   });
   throw error;
 }
}
}
````

````

### Usage Examples

**Prompt:** "Add structured logging around the user authentication flow"

**Prompt:** "Add infrastructure logging to the D1 repository"

**Prompt:** "Add domain event logging when a task status changes"

---

## Best Practices and Patterns

### 1. Request ID Propagation

Always propagate request IDs across service boundaries:

```typescript
// When making external requests
const response = await fetch(externalUrl, {
  headers: {
    "x-request-id": getContext()?.requestId ?? generateRequestId(),
    traceparent: `00-${traceId}-${spanId}-01`,
  },
});
````

### 2. Log Levels by Environment

| Level | Development | Staging | Production |
| ----- | ----------- | ------- | ---------- |
| debug | ✓           | ✓       | ✗          |
| info  | ✓           | ✓       | ✓          |
| warn  | ✓           | ✓       | ✓          |
| error | ✓           | ✓       | ✓          |

### 3. Sampling Strategy

For high-traffic applications, sample logs to control costs:

```jsonc
{
  "observability": {
    "head_sampling_rate": 0.1, // Log 10% of requests
    "traces": {
      "head_sampling_rate": 0.01, // Trace 1% of requests
    },
  },
}
```

**Always log errors at 100%** regardless of sampling:

```typescript
// Force logging for errors even when sampled out
if (error) {
  console.error(JSON.stringify(errorEntry)); // Always logged
}
```

### 4. Correlation Across Async Operations

When using queues or Durable Objects, propagate context:

```typescript
// Publishing to a queue
await env.MY_QUEUE.send({
  data: payload,
  metadata: {
    request_id: getContext()?.requestId,
    trace_id: getContext()?.traceId,
  },
});

// Consuming from a queue
async queue(batch: MessageBatch, env: Env) {
  for (const message of batch.messages) {
    const { request_id, trace_id } = message.body.metadata;
    runWithContext({ requestId: request_id, traceId: trace_id }, () => {
      // Process message with correlated logging
    });
  }
}
```

### 5. Avoid These Anti-Patterns

```typescript
// ❌ Logging sensitive data
logger.info({ event: 'user.created', password: user.password });

// ❌ Unstructured logging
console.log('User created: ' + userId);

// ❌ Missing request context
logger.info({ event: 'task.completed' }); // No request_id!

// ❌ Logging in hot paths without sampling
for (const item of millionItems) {
  logger.debug({ event: 'item.processed', item_id: item.id }); // Too many logs!
}

// ❌ Catching and swallowing errors silently
try {
  await riskyOperation();
} catch (error) {
  // No logging = invisible failures
}
```

### 6. Performance Considerations

- **JSON.stringify is cheap**: Don't over-optimize
- **Async logging**: console.log is synchronous but buffered
- **Sample aggressively**: Use head_sampling_rate for high-traffic routes
- **Filter debug logs**: Disable in production via environment check

### 7. Alerting Integration

Configure alerts based on log patterns:

```typescript
// Log with alerting-friendly fields
logger.error({
  event: 'payment.charge.failed',
  category: 'domain',
  alert_severity: 'high', // For routing to PagerDuty
  alert_team: 'payments', // For routing to team channel
  payment_amount: amount,
  error_code: 'INSUFFICIENT_FUNDS',
});
```

---

## Conclusion

Structured logging and tracing transform debugging from archaeology into science. While the upfront investment seems unnecessary at MVP stage, the payoff is immediate once you face your first production incident.

Key takeaways:

1. **Structure from day one**: JSON logs with consistent schemas are infinitely more valuable than printf statements
2. **Categorize thoughtfully**: Domain, application, and infrastructure logs serve different purposes
3. **Redact systematically**: Build redaction into your logging infrastructure, not as an afterthought
4. **Correlate everything**: Request IDs and trace context are your lifeline in distributed debugging
5. **Use both Sentry and Cloudflare**: Sentry for rich error context, Cloudflare for native observability

The patterns in this guide integrate seamlessly with the Clean Architecture and DDD principles from the main Cloudflare Workers guide. Domain entities emit domain events, application services log use case execution, and infrastructure adapters track external interactions—all correlated by request ID and rendered queryable through structured JSON.

---

_This guide reflects best practices as of January 2026. For the latest documentation, consult the official Cloudflare Workers Observability, Sentry, and OpenTelemetry documentation._
