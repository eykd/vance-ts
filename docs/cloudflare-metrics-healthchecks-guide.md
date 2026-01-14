# Comprehensive Guide: Metrics and Health-Checks in Cloudflare Applications

**Implementing Observability for TypeScript Workers with SLO-Driven Design**

_A companion guide to the Interactive Web Applications on Cloudflare guide_

---

## Table of Contents

1. [Introduction](#introduction)
2. [Philosophy: SLOs First, Dashboards Second](#philosophy-slos-first-dashboards-second)
3. [Architecture Overview](#architecture-overview)
4. [Request Timing Metrics](#request-timing-metrics)
5. [Error Rate Tracking](#error-rate-tracking)
6. [Health Endpoints](#health-endpoints)
7. [SLO Implementation Patterns](#slo-implementation-patterns)
8. [Infrastructure Integration](#infrastructure-integration)
9. [Testing Observability Code](#testing-observability-code)
10. [Complete Reference Implementation](#complete-reference-implementation)
11. [Operational Patterns](#operational-patterns)

---

## Introduction

Observability is not about collecting data—it's about answering questions. Before instrumenting a single endpoint, you must know what questions you need to answer. This guide takes an SLO-first approach: we define what "good" looks like for our users, then build the instrumentation to measure it.

### Why SLOs First?

Many teams start with dashboards: they instrument everything, build elaborate visualizations, and then wonder why they're still surprised by outages. The problem isn't lack of data—it's lack of purpose.

Service Level Objectives (SLOs) flip this approach:

1. **Define user expectations**: "Users expect the task list to load in under 500ms, 99% of the time"
2. **Derive indicators**: We need to measure request latency at the p99 level
3. **Build instrumentation**: Now we know exactly what to collect
4. **Create alerts**: Alert when we're consuming error budget too quickly

This guide implements observability for Cloudflare Workers applications using this SLO-driven methodology.

### What This Guide Covers

| Topic            | Purpose                                      |
| ---------------- | -------------------------------------------- |
| Request Timing   | Measure latency across the request lifecycle |
| Error Rates      | Track and categorize failures                |
| Health Endpoints | Provide operational visibility               |
| SLO Patterns     | Implement error budgets and burn rate alerts |
| Testing          | Verify observability code works correctly    |

---

## Quick Start

This guide shows you how to implement SLO-driven observability for Cloudflare Workers applications. You'll learn to measure request timing, track error rates, implement health endpoints, and build error budget monitoring—all while maintaining clean architecture boundaries. Rather than collecting metrics indiscriminately, we define Service Level Objectives first, then build instrumentation to measure what matters for user experience.

### Minimal Example: Request Timing Middleware

```typescript
// Add request timing to any Worker handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now();

    try {
      const response = await handleRequest(request, env);

      // Record successful request timing
      ctx.waitUntil(
        recordMetric(env, {
          path: new URL(request.url).pathname,
          duration_ms: Date.now() - startTime,
          status: response.status,
          timestamp: Date.now(),
        })
      );

      return response;
    } catch (error) {
      // Record error
      ctx.waitUntil(
        recordError(env, {
          path: new URL(request.url).pathname,
          error: error instanceof Error ? error.message : 'Unknown',
          timestamp: Date.now(),
        })
      );
      throw error;
    }
  },
};
```

**Learn more**:

- [Request Timing Metrics](#request-timing-metrics) - Full implementation patterns
- [Error Rate Tracking](#error-rate-tracking) - Categorizing and measuring failures
- [SLO Implementation Patterns](#slo-implementation-patterns) - Error budgets and burn rate alerts

---

### Relationship to the Main Guide

This guide assumes familiarity with the architecture from the "Interactive Web Applications on Cloudflare" guide. We build on the same Clean Architecture layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│   Metrics middleware, health handlers, timing decorators     │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│   Use case instrumentation, SLO tracking                     │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│   (No metrics here - keep domain pure)                       │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│   Metrics storage (Analytics Engine), external reporting     │
└─────────────────────────────────────────────────────────────┘
```

---

## Philosophy: SLOs First, Dashboards Second

### The Error Budget Mental Model

An SLO is a target reliability level. If your SLO is 99.9% availability, you have a 0.1% error budget—the amount of unreliability you can "spend" before users are impacted beyond acceptable levels.

```
Monthly Error Budget Calculation:

SLO: 99.9% availability
Total minutes in month: 43,200 (30 days)
Error budget: 43,200 × 0.001 = 43.2 minutes of downtime

If you've used 30 minutes by day 15, you've consumed 69% of your budget
at 50% of the time period—you're burning too fast.
```

### The Four Golden Signals

Google's Site Reliability Engineering book identifies four key metrics. For Cloudflare Workers, we implement them as:

| Signal         | Cloudflare Implementation                         |
| -------------- | ------------------------------------------------- |
| **Latency**    | Request duration from Worker entry to response    |
| **Traffic**    | Requests per second by endpoint                   |
| **Errors**     | HTTP 5xx rate, plus application-specific failures |
| **Saturation** | CPU time approaching limits, subrequest counts    |

### SLI → SLO → SLA

Understanding the hierarchy:

- **Service Level Indicator (SLI)**: A metric. "The proportion of requests completing in < 500ms"
- **Service Level Objective (SLO)**: A target. "99% of requests should complete in < 500ms"
- **Service Level Agreement (SLA)**: A contract. "We guarantee 99% of requests in < 500ms, or credit your account"

This guide focuses on SLIs and SLOs. SLAs are business decisions built on top of reliable SLO data.

### Defining Good SLOs

Good SLOs share these characteristics:

1. **User-centric**: They measure what users experience, not internal metrics
2. **Achievable**: 100% is not a valid SLO—systems fail
3. **Measurable**: You must be able to instrument them
4. **Meaningful**: They should correlate with user happiness

Example SLOs for a task management application:

| User Journey   | SLI                              | SLO            |
| -------------- | -------------------------------- | -------------- |
| View task list | Time to first meaningful paint   | 99% < 500ms    |
| Create task    | Time from submit to confirmation | 99.5% < 1000ms |
| Search tasks   | Time to results displayed        | 95% < 800ms    |
| Any request    | Successful response (non-5xx)    | 99.9% success  |

---

## Architecture Overview

### Metrics Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Worker        │────►│  Analytics      │────►│  External       │
│   Request       │     │  Engine         │     │  Monitoring     │
│                 │     │  (Cloudflare)   │     │  (Optional)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        │               │  Cloudflare     │
        │               │  Dashboard      │
        │               └─────────────────┘
        │
        ▼
┌─────────────────┐
│   KV            │
│   (Rate limits, │
│   circuit state)│
└─────────────────┘
```

### Project Structure Addition

Extend the project structure from the main guide:

```
src/
├── observability/                 # New top-level module
│   ├── metrics/
│   │   ├── MetricsCollector.ts
│   │   ├── MetricsCollector.spec.ts
│   │   ├── RequestTimer.ts
│   │   ├── RequestTimer.spec.ts
│   │   ├── ErrorTracker.ts
│   │   └── ErrorTracker.spec.ts
│   ├── health/
│   │   ├── HealthChecker.ts
│   │   ├── HealthChecker.spec.ts
│   │   ├── DependencyCheck.ts
│   │   └── handlers.ts
│   ├── slo/
│   │   ├── SLOTracker.ts
│   │   ├── SLOTracker.spec.ts
│   │   ├── ErrorBudget.ts
│   │   └── definitions.ts         # SLO definitions
│   └── middleware/
│       ├── timingMiddleware.ts
│       ├── errorMiddleware.ts
│       └── metricsMiddleware.ts
├── presentation/
│   ├── handlers/
│   │   └── HealthHandlers.ts      # Health endpoint handlers
│   └── middleware/
│       └── observability.ts       # Integration point
└── infrastructure/
    └── analytics/
        ├── AnalyticsEngineAdapter.ts
        └── AnalyticsEngineAdapter.integration.test.ts
```

### Environment Bindings

Add to `wrangler.jsonc`:

```jsonc
{
  "name": "your-app",
  "analytics_engine_datasets": [
    {
      "binding": "METRICS",
      "dataset": "app_metrics",
    },
  ],
  "kv_namespaces": [
    {
      "binding": "SESSIONS",
      "id": "xxx",
    },
    {
      "binding": "HEALTH_STATE",
      "id": "yyy",
    },
  ],
}
```

TypeScript environment types:

```typescript
// src/types/env.d.ts
interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  HEALTH_STATE: KVNamespace;
  METRICS: AnalyticsEngineDataset;
}
```

---

## Request Timing Metrics

### Core Timing Infrastructure

Request timing must capture multiple phases of request processing. In a Cloudflare Worker, the key phases are:

1. **Total duration**: Entry to response
2. **Routing**: Time to determine handler
3. **Authentication**: Session/token validation
4. **Business logic**: Use case execution
5. **Data access**: D1/KV operations
6. **Rendering**: HTML template generation

### The RequestTimer Class

```typescript
// src/observability/metrics/RequestTimer.ts

export interface TimingPhase {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface RequestTimings {
  requestId: string;
  totalDuration: number;
  phases: Map<string, TimingPhase>;
  metadata: Record<string, string | number>;
}

export class RequestTimer {
  private readonly requestId: string;
  private readonly startTime: number;
  private readonly phases: Map<string, TimingPhase> = new Map();
  private metadata: Record<string, string | number> = {};

  constructor(requestId?: string) {
    this.requestId = requestId ?? crypto.randomUUID();
    this.startTime = performance.now();
  }

  /**
   * Start timing a named phase.
   * Phases can be nested - each is tracked independently.
   */
  startPhase(name: string): void {
    if (this.phases.has(name)) {
      throw new Error(`Phase "${name}" already started`);
    }
    this.phases.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * End timing a named phase.
   * Returns the duration in milliseconds.
   */
  endPhase(name: string): number {
    const phase = this.phases.get(name);
    if (!phase) {
      throw new Error(`Phase "${name}" was never started`);
    }
    if (phase.endTime !== undefined) {
      throw new Error(`Phase "${name}" already ended`);
    }

    phase.endTime = performance.now();
    phase.duration = phase.endTime - phase.startTime;
    return phase.duration;
  }

  /**
   * Execute a function while timing it as a phase.
   * Handles both sync and async functions.
   */
  async timePhase<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
    this.startPhase(name);
    try {
      const result = await fn();
      return result;
    } finally {
      this.endPhase(name);
    }
  }

  /**
   * Add metadata to be included with timing data.
   */
  addMetadata(key: string, value: string | number): void {
    this.metadata[key] = value;
  }

  /**
   * Get the request ID for correlation.
   */
  getRequestId(): string {
    return this.requestId;
  }

  /**
   * Finalize and return all timing data.
   * Call this at the end of request processing.
   */
  finalize(): RequestTimings {
    const endTime = performance.now();

    // End any phases that weren't explicitly ended
    for (const phase of this.phases.values()) {
      if (phase.endTime === undefined) {
        phase.endTime = endTime;
        phase.duration = phase.endTime - phase.startTime;
      }
    }

    return {
      requestId: this.requestId,
      totalDuration: endTime - this.startTime,
      phases: new Map(this.phases),
      metadata: { ...this.metadata },
    };
  }

  /**
   * Get current duration without finalizing.
   */
  getCurrentDuration(): number {
    return performance.now() - this.startTime;
  }

  /**
   * Check if a phase is currently running.
   */
  isPhaseRunning(name: string): boolean {
    const phase = this.phases.get(name);
    return phase !== undefined && phase.endTime === undefined;
  }
}
```

### Unit Tests for RequestTimer

```typescript
// src/observability/metrics/RequestTimer.spec.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestTimer } from './RequestTimer';

describe('RequestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('construction', () => {
    it('generates a request ID if none provided', () => {
      const timer = new RequestTimer();
      expect(timer.getRequestId()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it('uses provided request ID', () => {
      const timer = new RequestTimer('custom-id');
      expect(timer.getRequestId()).toBe('custom-id');
    });
  });

  describe('phase timing', () => {
    it('tracks a single phase duration', () => {
      const timer = new RequestTimer();

      timer.startPhase('database');
      vi.advanceTimersByTime(100);
      const duration = timer.endPhase('database');

      expect(duration).toBe(100);
    });

    it('tracks multiple independent phases', () => {
      const timer = new RequestTimer();

      timer.startPhase('auth');
      vi.advanceTimersByTime(50);
      timer.endPhase('auth');

      timer.startPhase('database');
      vi.advanceTimersByTime(100);
      timer.endPhase('database');

      const timings = timer.finalize();

      expect(timings.phases.get('auth')?.duration).toBe(50);
      expect(timings.phases.get('database')?.duration).toBe(100);
    });

    it('allows nested/overlapping phases', () => {
      const timer = new RequestTimer();

      timer.startPhase('handler');
      vi.advanceTimersByTime(20);

      timer.startPhase('database');
      vi.advanceTimersByTime(80);
      timer.endPhase('database');

      vi.advanceTimersByTime(10);
      timer.endPhase('handler');

      const timings = timer.finalize();

      expect(timings.phases.get('handler')?.duration).toBe(110);
      expect(timings.phases.get('database')?.duration).toBe(80);
    });

    it('throws when starting an already-started phase', () => {
      const timer = new RequestTimer();
      timer.startPhase('test');

      expect(() => timer.startPhase('test')).toThrow('Phase "test" already started');
    });

    it('throws when ending a non-existent phase', () => {
      const timer = new RequestTimer();

      expect(() => timer.endPhase('nonexistent')).toThrow('Phase "nonexistent" was never started');
    });

    it('throws when ending an already-ended phase', () => {
      const timer = new RequestTimer();
      timer.startPhase('test');
      timer.endPhase('test');

      expect(() => timer.endPhase('test')).toThrow('Phase "test" already ended');
    });
  });

  describe('timePhase helper', () => {
    it('times synchronous functions', async () => {
      const timer = new RequestTimer();

      const result = await timer.timePhase('sync', () => {
        vi.advanceTimersByTime(50);
        return 'done';
      });

      expect(result).toBe('done');
      expect(timer.finalize().phases.get('sync')?.duration).toBe(50);
    });

    it('times asynchronous functions', async () => {
      const timer = new RequestTimer();

      const result = await timer.timePhase('async', async () => {
        vi.advanceTimersByTime(100);
        return 'async-done';
      });

      expect(result).toBe('async-done');
      expect(timer.finalize().phases.get('async')?.duration).toBe(100);
    });

    it('ends phase even when function throws', async () => {
      const timer = new RequestTimer();

      await expect(
        timer.timePhase('failing', () => {
          vi.advanceTimersByTime(25);
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');

      expect(timer.finalize().phases.get('failing')?.duration).toBe(25);
    });
  });

  describe('metadata', () => {
    it('includes metadata in finalized timings', () => {
      const timer = new RequestTimer();
      timer.addMetadata('route', '/api/tasks');
      timer.addMetadata('userId', 123);

      const timings = timer.finalize();

      expect(timings.metadata).toEqual({
        route: '/api/tasks',
        userId: 123,
      });
    });
  });

  describe('finalize', () => {
    it('calculates total duration', () => {
      const timer = new RequestTimer();
      vi.advanceTimersByTime(150);

      const timings = timer.finalize();

      expect(timings.totalDuration).toBe(150);
    });

    it('auto-ends unclosed phases', () => {
      const timer = new RequestTimer();
      timer.startPhase('unclosed');
      vi.advanceTimersByTime(75);

      const timings = timer.finalize();

      expect(timings.phases.get('unclosed')?.duration).toBe(75);
    });
  });

  describe('getCurrentDuration', () => {
    it('returns elapsed time without finalizing', () => {
      const timer = new RequestTimer();
      vi.advanceTimersByTime(30);

      expect(timer.getCurrentDuration()).toBe(30);

      vi.advanceTimersByTime(20);

      expect(timer.getCurrentDuration()).toBe(50);
    });
  });

  describe('isPhaseRunning', () => {
    it('returns true for running phases', () => {
      const timer = new RequestTimer();
      timer.startPhase('running');

      expect(timer.isPhaseRunning('running')).toBe(true);
    });

    it('returns false for ended phases', () => {
      const timer = new RequestTimer();
      timer.startPhase('ended');
      timer.endPhase('ended');

      expect(timer.isPhaseRunning('ended')).toBe(false);
    });

    it('returns false for non-existent phases', () => {
      const timer = new RequestTimer();

      expect(timer.isPhaseRunning('nonexistent')).toBe(false);
    });
  });
});
```

### Timing Middleware

```typescript
// src/observability/middleware/timingMiddleware.ts

import { RequestTimer, RequestTimings } from '../metrics/RequestTimer';

// Extend the request context to include timing
declare global {
  interface RequestContext {
    timer: RequestTimer;
  }
}

export interface TimingMiddlewareOptions {
  /**
   * Function to report completed timings.
   * Implement this to send to Analytics Engine or external service.
   */
  onComplete: (timings: RequestTimings, request: Request, response: Response) => void;

  /**
   * Optional function to extract request ID from incoming request.
   * Useful for distributed tracing.
   */
  extractRequestId?: (request: Request) => string | undefined;

  /**
   * Phases to automatically time.
   */
  autoPhases?: {
    routing?: boolean;
    handler?: boolean;
  };
}

export function createTimingMiddleware(options: TimingMiddlewareOptions) {
  return async (
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    next: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
  ): Promise<Response> => {
    // Extract or generate request ID
    const requestId =
      options.extractRequestId?.(request) ?? request.headers.get('X-Request-ID') ?? undefined;

    const timer = new RequestTimer(requestId);

    // Add standard metadata
    timer.addMetadata('method', request.method);
    timer.addMetadata('path', new URL(request.url).pathname);

    // Store timer in a way handlers can access
    // This uses a WeakMap keyed by request for isolation
    requestTimers.set(request, timer);

    let response: Response;

    try {
      if (options.autoPhases?.handler !== false) {
        timer.startPhase('handler');
      }

      response = await next(request, env, ctx);

      if (options.autoPhases?.handler !== false) {
        timer.endPhase('handler');
      }
    } catch (error) {
      timer.addMetadata('error', 'true');
      timer.addMetadata('errorType', error instanceof Error ? error.name : 'Unknown');
      throw error;
    } finally {
      const timings = timer.finalize();

      // Add response metadata
      timer.addMetadata('status', response!?.status ?? 500);

      // Report asynchronously to not block response
      ctx.waitUntil(
        Promise.resolve().then(() => {
          try {
            options.onComplete(timings, request, response!);
          } catch (e) {
            console.error('Failed to report timings:', e);
          }
        })
      );
    }

    // Add timing header for debugging
    const timedResponse = new Response(response.body, response);
    timedResponse.headers.set('X-Request-ID', timer.getRequestId());
    timedResponse.headers.set('Server-Timing', formatServerTiming(timer.finalize()));

    return timedResponse;
  };
}

// WeakMap to store timers per request
const requestTimers = new WeakMap<Request, RequestTimer>();

/**
 * Get the timer for the current request.
 * Use this in handlers to add custom phases.
 */
export function getRequestTimer(request: Request): RequestTimer | undefined {
  return requestTimers.get(request);
}

/**
 * Format timings as Server-Timing header value.
 * This is visible in browser DevTools.
 */
function formatServerTiming(timings: RequestTimings): string {
  const parts: string[] = [];

  parts.push(`total;dur=${timings.totalDuration.toFixed(2)}`);

  for (const [name, phase] of timings.phases) {
    if (phase.duration !== undefined) {
      parts.push(`${name};dur=${phase.duration.toFixed(2)}`);
    }
  }

  return parts.join(', ');
}
```

### Using Timing in Handlers

```typescript
// src/presentation/handlers/TaskHandlers.ts

import { getRequestTimer } from '../../observability/middleware/timingMiddleware';

export class TaskHandlers {
  constructor(
    private readonly listTasks: ListTasksUseCase,
    private readonly createTask: CreateTaskUseCase
  ) {}

  async handleList(request: Request, env: Env): Promise<Response> {
    const timer = getRequestTimer(request);

    // Time the use case execution
    const tasks =
      (await timer?.timePhase('useCase', () => this.listTasks.execute())) ??
      (await this.listTasks.execute());

    // Time template rendering
    const html =
      (await timer?.timePhase('render', () => renderTaskList(tasks))) ?? renderTaskList(tasks);

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  async handleCreate(request: Request, env: Env): Promise<Response> {
    const timer = getRequestTimer(request);

    // Time body parsing
    const body =
      (await timer?.timePhase('parseBody', () => request.formData())) ?? (await request.formData());

    // Time validation
    const validated =
      (await timer?.timePhase('validation', () => validateTaskInput(body))) ??
      validateTaskInput(body);

    // Time use case
    const task =
      (await timer?.timePhase('useCase', () => this.createTask.execute(validated))) ??
      (await this.createTask.execute(validated));

    // Time render
    const html =
      (await timer?.timePhase('render', () => renderTaskItem(task))) ?? renderTaskItem(task);

    return new Response(html, {
      status: 201,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
```

### Timing D1 Operations

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts

import { getRequestTimer } from '../../observability/middleware/timingMiddleware';

export class D1TaskRepository implements TaskRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string, request?: Request): Promise<Task | null> {
    const timer = request ? getRequestTimer(request) : undefined;

    const result =
      (await timer?.timePhase('d1:findById', async () => {
        return this.db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first<TaskRow>();
      })) ?? (await this.db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first<TaskRow>());

    return result ? this.toDomain(result) : null;
  }

  async findAll(request?: Request): Promise<Task[]> {
    const timer = request ? getRequestTimer(request) : undefined;

    const results =
      (await timer?.timePhase('d1:findAll', async () => {
        return this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all<TaskRow>();
      })) ?? (await this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all<TaskRow>());

    return results.results.map((row) => this.toDomain(row));
  }

  async save(task: Task, request?: Request): Promise<void> {
    const timer = request ? getRequestTimer(request) : undefined;

    (await timer?.timePhase('d1:save', async () => {
      await this.db
        .prepare(
          `INSERT INTO tasks (id, title, completed, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           completed = excluded.completed,
           updated_at = excluded.updated_at`
        )
        .bind(
          task.id,
          task.title,
          task.completed ? 1 : 0,
          task.createdAt.toISOString(),
          task.updatedAt.toISOString()
        )
        .run();
    })) ??
      (await this.db
        .prepare(
          `INSERT INTO tasks (id, title, completed, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         completed = excluded.completed,
         updated_at = excluded.updated_at`
        )
        .bind(
          task.id,
          task.title,
          task.completed ? 1 : 0,
          task.createdAt.toISOString(),
          task.updatedAt.toISOString()
        )
        .run());
  }

  private toDomain(row: TaskRow): Task {
    return new Task({
      id: row.id,
      title: row.title,
      completed: row.completed === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
```

---

## Error Rate Tracking

### Error Classification

Not all errors are equal. A 404 is not an error—it's a valid response to a bad request. A 500, however, indicates something wrong with our system. Error tracking must classify errors appropriately:

| Category           | HTTP Status | SLO Impact | Example                             |
| ------------------ | ----------- | ---------- | ----------------------------------- |
| Client Error       | 4xx         | None       | 404 Not Found, 400 Bad Request      |
| Server Error       | 5xx         | Yes        | 500 Internal Error, 503 Unavailable |
| Timeout            | N/A         | Yes        | Request exceeded time limit         |
| Dependency Failure | 5xx         | Yes        | D1 unavailable, external API down   |

### The ErrorTracker Class

```typescript
// src/observability/metrics/ErrorTracker.ts

export enum ErrorCategory {
  CLIENT_ERROR = 'client_error',
  SERVER_ERROR = 'server_error',
  TIMEOUT = 'timeout',
  DEPENDENCY_FAILURE = 'dependency_failure',
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
}

export interface TrackedError {
  id: string;
  timestamp: Date;
  category: ErrorCategory;
  message: string;
  stack?: string;
  metadata: Record<string, string | number | boolean>;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
}

export interface ErrorSummary {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  serverErrorRate: number;
  recentErrors: TrackedError[];
}

export class ErrorTracker {
  private errors: TrackedError[] = [];
  private readonly maxStoredErrors: number;
  private totalRequests = 0;

  constructor(options: { maxStoredErrors?: number } = {}) {
    this.maxStoredErrors = options.maxStoredErrors ?? 100;
  }

  /**
   * Track an error occurrence.
   */
  track(error: Error | unknown, context: Partial<TrackedError> = {}): TrackedError {
    const tracked: TrackedError = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      category: this.categorize(error, context.statusCode),
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      metadata: {},
      ...context,
    };

    this.errors.unshift(tracked);

    // Trim old errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(0, this.maxStoredErrors);
    }

    return tracked;
  }

  /**
   * Record a successful request (for rate calculation).
   */
  recordRequest(): void {
    this.totalRequests++;
  }

  /**
   * Categorize an error based on its type and status code.
   */
  private categorize(error: Error | unknown, statusCode?: number): ErrorCategory {
    // Check for timeout errors
    if (error instanceof Error) {
      if (
        error.message.includes('timeout') ||
        error.message.includes('timed out') ||
        error.name === 'TimeoutError'
      ) {
        return ErrorCategory.TIMEOUT;
      }

      // Check for dependency failures
      if (
        error.message.includes('D1') ||
        error.message.includes('KV') ||
        error.message.includes('fetch failed') ||
        error.message.includes('ECONNREFUSED')
      ) {
        return ErrorCategory.DEPENDENCY_FAILURE;
      }

      // Check for validation errors
      if (error.name === 'ValidationError' || error.message.includes('validation')) {
        return ErrorCategory.VALIDATION_ERROR;
      }
    }

    // Categorize by status code
    if (statusCode !== undefined) {
      if (statusCode === 401) {
        return ErrorCategory.AUTHENTICATION_ERROR;
      }
      if (statusCode === 403) {
        return ErrorCategory.AUTHORIZATION_ERROR;
      }
      if (statusCode >= 400 && statusCode < 500) {
        return ErrorCategory.CLIENT_ERROR;
      }
      if (statusCode >= 500) {
        return ErrorCategory.SERVER_ERROR;
      }
    }

    return ErrorCategory.SERVER_ERROR;
  }

  /**
   * Check if an error should count against SLO.
   */
  countsAgainstSLO(error: TrackedError): boolean {
    const sloImpactingCategories: ErrorCategory[] = [
      ErrorCategory.SERVER_ERROR,
      ErrorCategory.TIMEOUT,
      ErrorCategory.DEPENDENCY_FAILURE,
    ];

    return sloImpactingCategories.includes(error.category);
  }

  /**
   * Get error summary for reporting.
   */
  getSummary(): ErrorSummary {
    const byCategory: Record<ErrorCategory, number> = {
      [ErrorCategory.CLIENT_ERROR]: 0,
      [ErrorCategory.SERVER_ERROR]: 0,
      [ErrorCategory.TIMEOUT]: 0,
      [ErrorCategory.DEPENDENCY_FAILURE]: 0,
      [ErrorCategory.VALIDATION_ERROR]: 0,
      [ErrorCategory.AUTHENTICATION_ERROR]: 0,
      [ErrorCategory.AUTHORIZATION_ERROR]: 0,
    };

    let serverErrors = 0;

    for (const error of this.errors) {
      byCategory[error.category]++;
      if (this.countsAgainstSLO(error)) {
        serverErrors++;
      }
    }

    return {
      total: this.errors.length,
      byCategory,
      serverErrorRate: this.totalRequests > 0 ? serverErrors / this.totalRequests : 0,
      recentErrors: this.errors.slice(0, 10),
    };
  }

  /**
   * Get errors within a time window.
   */
  getErrorsInWindow(windowMs: number): TrackedError[] {
    const cutoff = Date.now() - windowMs;
    return this.errors.filter((e) => e.timestamp.getTime() > cutoff);
  }

  /**
   * Get error rate within a time window.
   */
  getErrorRateInWindow(windowMs: number): number {
    const windowErrors = this.getErrorsInWindow(windowMs);
    const sloErrors = windowErrors.filter((e) => this.countsAgainstSLO(e));
    return this.totalRequests > 0 ? sloErrors.length / this.totalRequests : 0;
  }

  /**
   * Clear all tracked errors.
   */
  clear(): void {
    this.errors = [];
    this.totalRequests = 0;
  }
}
```

### Error Tracking Tests

```typescript
// src/observability/metrics/ErrorTracker.spec.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorTracker, ErrorCategory } from './ErrorTracker';

describe('ErrorTracker', () => {
  let tracker: ErrorTracker;

  beforeEach(() => {
    tracker = new ErrorTracker({ maxStoredErrors: 10 });
  });

  describe('track', () => {
    it('tracks an error with generated ID and timestamp', () => {
      const error = new Error('Test error');
      const tracked = tracker.track(error);

      expect(tracked.id).toBeDefined();
      expect(tracked.timestamp).toBeInstanceOf(Date);
      expect(tracked.message).toBe('Test error');
      expect(tracked.stack).toBeDefined();
    });

    it('includes provided context', () => {
      const tracked = tracker.track(new Error('Test'), {
        requestId: 'req-123',
        path: '/api/tasks',
        method: 'POST',
      });

      expect(tracked.requestId).toBe('req-123');
      expect(tracked.path).toBe('/api/tasks');
      expect(tracked.method).toBe('POST');
    });

    it('handles non-Error objects', () => {
      const tracked = tracker.track('string error');

      expect(tracked.message).toBe('string error');
      expect(tracked.stack).toBeUndefined();
    });

    it('limits stored errors to maxStoredErrors', () => {
      for (let i = 0; i < 15; i++) {
        tracker.track(new Error(`Error ${i}`));
      }

      expect(tracker.getSummary().total).toBe(10);
      expect(tracker.getSummary().recentErrors[0].message).toBe('Error 14');
    });
  });

  describe('categorization', () => {
    it('categorizes timeout errors', () => {
      const tracked = tracker.track(new Error('Request timed out'));
      expect(tracked.category).toBe(ErrorCategory.TIMEOUT);
    });

    it('categorizes D1 errors as dependency failures', () => {
      const tracked = tracker.track(new Error('D1 database unavailable'));
      expect(tracked.category).toBe(ErrorCategory.DEPENDENCY_FAILURE);
    });

    it('categorizes 401 as authentication error', () => {
      const tracked = tracker.track(new Error('Unauthorized'), {
        statusCode: 401,
      });
      expect(tracked.category).toBe(ErrorCategory.AUTHENTICATION_ERROR);
    });

    it('categorizes 403 as authorization error', () => {
      const tracked = tracker.track(new Error('Forbidden'), {
        statusCode: 403,
      });
      expect(tracked.category).toBe(ErrorCategory.AUTHORIZATION_ERROR);
    });

    it('categorizes 4xx as client errors', () => {
      const tracked = tracker.track(new Error('Not found'), {
        statusCode: 404,
      });
      expect(tracked.category).toBe(ErrorCategory.CLIENT_ERROR);
    });

    it('categorizes 5xx as server errors', () => {
      const tracked = tracker.track(new Error('Internal error'), {
        statusCode: 500,
      });
      expect(tracked.category).toBe(ErrorCategory.SERVER_ERROR);
    });

    it('defaults to server error for unknown errors', () => {
      const tracked = tracker.track(new Error('Unknown issue'));
      expect(tracked.category).toBe(ErrorCategory.SERVER_ERROR);
    });
  });

  describe('countsAgainstSLO', () => {
    it('returns true for server errors', () => {
      const tracked = tracker.track(new Error('Server error'), {
        statusCode: 500,
      });
      expect(tracker.countsAgainstSLO(tracked)).toBe(true);
    });

    it('returns true for timeouts', () => {
      const tracked = tracker.track(new Error('Request timed out'));
      expect(tracker.countsAgainstSLO(tracked)).toBe(true);
    });

    it('returns true for dependency failures', () => {
      const tracked = tracker.track(new Error('D1 unavailable'));
      expect(tracker.countsAgainstSLO(tracked)).toBe(true);
    });

    it('returns false for client errors', () => {
      const tracked = tracker.track(new Error('Bad request'), {
        statusCode: 400,
      });
      expect(tracker.countsAgainstSLO(tracked)).toBe(false);
    });

    it('returns false for authentication errors', () => {
      const tracked = tracker.track(new Error('Unauthorized'), {
        statusCode: 401,
      });
      expect(tracker.countsAgainstSLO(tracked)).toBe(false);
    });
  });

  describe('getSummary', () => {
    it('counts errors by category', () => {
      tracker.track(new Error('Server error'), { statusCode: 500 });
      tracker.track(new Error('Client error'), { statusCode: 400 });
      tracker.track(new Error('Request timed out'));
      tracker.track(new Error('D1 unavailable'));

      const summary = tracker.getSummary();

      expect(summary.byCategory[ErrorCategory.SERVER_ERROR]).toBe(1);
      expect(summary.byCategory[ErrorCategory.CLIENT_ERROR]).toBe(1);
      expect(summary.byCategory[ErrorCategory.TIMEOUT]).toBe(1);
      expect(summary.byCategory[ErrorCategory.DEPENDENCY_FAILURE]).toBe(1);
    });

    it('calculates server error rate', () => {
      tracker.recordRequest();
      tracker.recordRequest();
      tracker.recordRequest();
      tracker.recordRequest();

      tracker.track(new Error('Server error'), { statusCode: 500 });

      const summary = tracker.getSummary();

      expect(summary.serverErrorRate).toBe(0.25); // 1 server error / 4 requests
    });
  });
});
```

### Error Middleware

```typescript
// src/observability/middleware/errorMiddleware.ts

import { ErrorTracker, TrackedError } from '../metrics/ErrorTracker';
import { getRequestTimer } from './timingMiddleware';

export interface ErrorMiddlewareOptions {
  tracker: ErrorTracker;
  onError?: (error: TrackedError) => void;
  includeStackInResponse?: boolean;
}

export function createErrorMiddleware(options: ErrorMiddlewareOptions) {
  return async (
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    next: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
  ): Promise<Response> {
    const timer = getRequestTimer(request);
    const url = new URL(request.url);

    try {
      const response = await next(request, env, ctx);

      // Track non-2xx responses as potential errors
      if (response.status >= 400) {
        const tracked = options.tracker.track(
          new Error(`HTTP ${response.status}`),
          {
            requestId: timer?.getRequestId(),
            path: url.pathname,
            method: request.method,
            statusCode: response.status,
          }
        );

        options.onError?.(tracked);
      }

      // Always record the request for rate calculations
      options.tracker.recordRequest();

      return response;
    } catch (error) {
      const tracked = options.tracker.track(error, {
        requestId: timer?.getRequestId(),
        path: url.pathname,
        method: request.method,
        statusCode: 500,
      });

      options.onError?.(tracked);
      options.tracker.recordRequest();

      // Return error response
      const errorResponse = {
        error: true,
        message: error instanceof Error ? error.message : 'Internal server error',
        requestId: timer?.getRequestId(),
        ...(options.includeStackInResponse && error instanceof Error
          ? { stack: error.stack }
          : {}),
      };

      // For HTMX requests, return an error fragment
      if (request.headers.get('HX-Request') === 'true') {
        return new Response(
          `<div class="alert alert-error">
            <span>An error occurred. Please try again.</span>
            <span class="text-xs opacity-70">Request ID: ${timer?.getRequestId()}</span>
          </div>`,
          {
            status: 500,
            headers: { 'Content-Type': 'text/html' },
          }
        );
      }

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}
```

---

## Health Endpoints

### Health Check Philosophy

Health endpoints serve multiple purposes:

1. **Load balancer health**: Simple "is the service running?" check
2. **Dependency health**: Are D1, KV, and external services available?
3. **Operational insight**: What's the current state of the system?

Different consumers need different levels of detail:

| Consumer          | Endpoint           | Information                     |
| ----------------- | ------------------ | ------------------------------- |
| Load balancer     | `/health`          | Simple 200/503                  |
| Monitoring system | `/health/live`     | Liveness (is process running?)  |
| Monitoring system | `/health/ready`    | Readiness (can handle traffic?) |
| Operations team   | `/health/detailed` | Full dependency status          |

### Health Check Types

```typescript
// src/observability/health/types.ts

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface DependencyHealth {
  name: string;
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
  lastChecked: Date;
}

export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: Date;
  version?: string;
  uptime?: number;
  dependencies?: DependencyHealth[];
}
```

### Dependency Checks

```typescript
// src/observability/health/DependencyCheck.ts

import { HealthStatus, DependencyHealth } from './types';

export interface DependencyChecker {
  name: string;
  check(): Promise<DependencyHealth>;
}

/**
 * Check D1 database connectivity.
 */
export class D1HealthCheck implements DependencyChecker {
  readonly name = 'd1';

  constructor(private readonly db: D1Database) {}

  async check(): Promise<DependencyHealth> {
    const start = performance.now();

    try {
      // Simple query to verify connectivity
      await this.db.prepare('SELECT 1').first();

      return {
        name: this.name,
        status: HealthStatus.HEALTHY,
        latencyMs: performance.now() - start,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: this.name,
        status: HealthStatus.UNHEALTHY,
        latencyMs: performance.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      };
    }
  }
}

/**
 * Check KV namespace connectivity.
 */
export class KVHealthCheck implements DependencyChecker {
  readonly name: string;

  constructor(
    private readonly kv: KVNamespace,
    name: string = 'kv'
  ) {
    this.name = name;
  }

  async check(): Promise<DependencyHealth> {
    const start = performance.now();
    const testKey = '__health_check__';

    try {
      // Write and read a test value
      await this.kv.put(testKey, Date.now().toString(), {
        expirationTtl: 60,
      });
      const value = await this.kv.get(testKey);

      if (value === null) {
        return {
          name: this.name,
          status: HealthStatus.DEGRADED,
          latencyMs: performance.now() - start,
          message: 'Write succeeded but read returned null',
          lastChecked: new Date(),
        };
      }

      return {
        name: this.name,
        status: HealthStatus.HEALTHY,
        latencyMs: performance.now() - start,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: this.name,
        status: HealthStatus.UNHEALTHY,
        latencyMs: performance.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      };
    }
  }
}

/**
 * Check an external HTTP endpoint.
 */
export class HttpHealthCheck implements DependencyChecker {
  constructor(
    readonly name: string,
    private readonly url: string,
    private readonly options: {
      timeoutMs?: number;
      expectedStatus?: number;
    } = {}
  ) {}

  async check(): Promise<DependencyHealth> {
    const start = performance.now();
    const timeoutMs = this.options.timeoutMs ?? 5000;
    const expectedStatus = this.options.expectedStatus ?? 200;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(this.url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const latencyMs = performance.now() - start;

      if (response.status !== expectedStatus) {
        return {
          name: this.name,
          status: HealthStatus.DEGRADED,
          latencyMs,
          message: `Expected status ${expectedStatus}, got ${response.status}`,
          lastChecked: new Date(),
        };
      }

      // Check if latency is concerning
      if (latencyMs > timeoutMs * 0.8) {
        return {
          name: this.name,
          status: HealthStatus.DEGRADED,
          latencyMs,
          message: 'Response time approaching timeout threshold',
          lastChecked: new Date(),
        };
      }

      return {
        name: this.name,
        status: HealthStatus.HEALTHY,
        latencyMs,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: this.name,
        status: HealthStatus.UNHEALTHY,
        latencyMs: performance.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      };
    }
  }
}
```

### The HealthChecker Class

```typescript
// src/observability/health/HealthChecker.ts

import { HealthStatus, HealthCheckResult, DependencyHealth } from './types';
import { DependencyChecker } from './DependencyCheck';

export interface HealthCheckerOptions {
  version?: string;
  startTime?: Date;
}

export class HealthChecker {
  private readonly dependencies: DependencyChecker[] = [];
  private readonly version?: string;
  private readonly startTime: Date;

  constructor(options: HealthCheckerOptions = {}) {
    this.version = options.version;
    this.startTime = options.startTime ?? new Date();
  }

  /**
   * Register a dependency to check.
   */
  addDependency(checker: DependencyChecker): void {
    this.dependencies.push(checker);
  }

  /**
   * Simple liveness check - is the worker running?
   */
  async checkLiveness(): Promise<HealthCheckResult> {
    return {
      status: HealthStatus.HEALTHY,
      timestamp: new Date(),
      version: this.version,
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  /**
   * Readiness check - can we handle traffic?
   * Checks critical dependencies only.
   */
  async checkReadiness(criticalDependencies: string[] = []): Promise<HealthCheckResult> {
    const results = await this.checkAllDependencies();

    // If no critical dependencies specified, all must be healthy
    const toCheck =
      criticalDependencies.length > 0
        ? results.filter((r) => criticalDependencies.includes(r.name))
        : results;

    const hasUnhealthy = toCheck.some((r) => r.status === HealthStatus.UNHEALTHY);

    return {
      status: hasUnhealthy ? HealthStatus.UNHEALTHY : HealthStatus.HEALTHY,
      timestamp: new Date(),
      version: this.version,
      dependencies: toCheck,
    };
  }

  /**
   * Full health check with all dependency details.
   */
  async checkDetailed(): Promise<HealthCheckResult> {
    const dependencies = await this.checkAllDependencies();

    const overallStatus = this.calculateOverallStatus(dependencies);

    return {
      status: overallStatus,
      timestamp: new Date(),
      version: this.version,
      uptime: Date.now() - this.startTime.getTime(),
      dependencies,
    };
  }

  /**
   * Check all registered dependencies.
   */
  private async checkAllDependencies(): Promise<DependencyHealth[]> {
    const results = await Promise.all(this.dependencies.map((checker) => checker.check()));
    return results;
  }

  /**
   * Calculate overall status from dependency statuses.
   */
  private calculateOverallStatus(dependencies: DependencyHealth[]): HealthStatus {
    if (dependencies.length === 0) {
      return HealthStatus.HEALTHY;
    }

    const hasUnhealthy = dependencies.some((d) => d.status === HealthStatus.UNHEALTHY);
    const hasDegraded = dependencies.some((d) => d.status === HealthStatus.DEGRADED);

    if (hasUnhealthy) {
      return HealthStatus.UNHEALTHY;
    }
    if (hasDegraded) {
      return HealthStatus.DEGRADED;
    }
    return HealthStatus.HEALTHY;
  }
}
```

### Health Check Tests

```typescript
// src/observability/health/HealthChecker.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthChecker } from './HealthChecker';
import { HealthStatus } from './types';
import { DependencyChecker } from './DependencyCheck';

describe('HealthChecker', () => {
  let checker: HealthChecker;

  beforeEach(() => {
    checker = new HealthChecker({ version: '1.0.0' });
  });

  describe('checkLiveness', () => {
    it('returns healthy status', async () => {
      const result = await checker.checkLiveness();

      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.version).toBe('1.0.0');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('includes uptime', async () => {
      const startTime = new Date(Date.now() - 60000);
      const checkerWithStart = new HealthChecker({ startTime });

      const result = await checkerWithStart.checkLiveness();

      expect(result.uptime).toBeGreaterThanOrEqual(60000);
    });
  });

  describe('checkReadiness', () => {
    it('returns healthy when all dependencies healthy', async () => {
      const healthyDep = createMockDependency('db', HealthStatus.HEALTHY);
      checker.addDependency(healthyDep);

      const result = await checker.checkReadiness();

      expect(result.status).toBe(HealthStatus.HEALTHY);
    });

    it('returns unhealthy when any dependency unhealthy', async () => {
      checker.addDependency(createMockDependency('db', HealthStatus.HEALTHY));
      checker.addDependency(createMockDependency('cache', HealthStatus.UNHEALTHY));

      const result = await checker.checkReadiness();

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
    });

    it('only checks critical dependencies when specified', async () => {
      checker.addDependency(createMockDependency('db', HealthStatus.HEALTHY));
      checker.addDependency(createMockDependency('cache', HealthStatus.UNHEALTHY));

      const result = await checker.checkReadiness(['db']);

      expect(result.status).toBe(HealthStatus.HEALTHY);
      expect(result.dependencies?.length).toBe(1);
    });
  });

  describe('checkDetailed', () => {
    it('returns all dependency details', async () => {
      checker.addDependency(createMockDependency('db', HealthStatus.HEALTHY));
      checker.addDependency(createMockDependency('cache', HealthStatus.DEGRADED));

      const result = await checker.checkDetailed();

      expect(result.dependencies?.length).toBe(2);
      expect(result.status).toBe(HealthStatus.DEGRADED);
    });

    it('includes uptime and version', async () => {
      const result = await checker.checkDetailed();

      expect(result.version).toBe('1.0.0');
      expect(result.uptime).toBeDefined();
    });
  });

  describe('status calculation', () => {
    it('healthy when no dependencies', async () => {
      const result = await checker.checkDetailed();

      expect(result.status).toBe(HealthStatus.HEALTHY);
    });

    it('unhealthy beats degraded', async () => {
      checker.addDependency(createMockDependency('a', HealthStatus.DEGRADED));
      checker.addDependency(createMockDependency('b', HealthStatus.UNHEALTHY));

      const result = await checker.checkDetailed();

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
    });

    it('degraded when no unhealthy', async () => {
      checker.addDependency(createMockDependency('a', HealthStatus.HEALTHY));
      checker.addDependency(createMockDependency('b', HealthStatus.DEGRADED));

      const result = await checker.checkDetailed();

      expect(result.status).toBe(HealthStatus.DEGRADED);
    });
  });
});

function createMockDependency(name: string, status: HealthStatus): DependencyChecker {
  return {
    name,
    check: vi.fn().mockResolvedValue({
      name,
      status,
      latencyMs: 10,
      lastChecked: new Date(),
    }),
  };
}
```

### Health Endpoint Handlers

```typescript
// src/presentation/handlers/HealthHandlers.ts

import { HealthChecker } from '../../observability/health/HealthChecker';
import { HealthStatus } from '../../observability/health/types';

export class HealthHandlers {
  constructor(private readonly healthChecker: HealthChecker) {}

  /**
   * Simple health check for load balancers.
   * GET /health
   */
  async handleSimple(_request: Request): Promise<Response> {
    const result = await this.healthChecker.checkLiveness();

    return new Response(JSON.stringify({ status: result.status }), {
      status: result.status === HealthStatus.HEALTHY ? 200 : 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Liveness probe for Kubernetes-style health checks.
   * GET /health/live
   */
  async handleLiveness(_request: Request): Promise<Response> {
    const result = await this.healthChecker.checkLiveness();

    return new Response(
      JSON.stringify({
        status: result.status,
        version: result.version,
        uptime: result.uptime,
      }),
      {
        status: 200, // Liveness always returns 200 if we can respond
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Readiness probe - can we accept traffic?
   * GET /health/ready
   */
  async handleReadiness(_request: Request): Promise<Response> {
    const result = await this.healthChecker.checkReadiness(['d1']); // D1 is critical

    const statusCode = result.status === HealthStatus.HEALTHY ? 200 : 503;

    return new Response(
      JSON.stringify({
        status: result.status,
        dependencies: result.dependencies?.map((d) => ({
          name: d.name,
          status: d.status,
        })),
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Detailed health check for operations.
   * GET /health/detailed
   */
  async handleDetailed(request: Request): Promise<Response> {
    // Optionally require authentication for detailed health
    const authHeader = request.headers.get('Authorization');
    if (!this.isAuthorizedForDetailedHealth(authHeader)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await this.healthChecker.checkDetailed();

    const statusCode =
      result.status === HealthStatus.HEALTHY
        ? 200
        : result.status === HealthStatus.DEGRADED
          ? 200
          : 503;

    return new Response(JSON.stringify(result, null, 2), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * HTML health page for human operators.
   * GET /health/dashboard
   */
  async handleDashboard(request: Request): Promise<Response> {
    const result = await this.healthChecker.checkDetailed();

    const html = this.renderHealthDashboard(result);

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  private isAuthorizedForDetailedHealth(authHeader: string | null): boolean {
    // Implement your authorization logic
    // This could check for an API key, bearer token, etc.
    if (!authHeader) return false;

    // Example: Check for a specific bearer token
    // In production, use environment variables for the token
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') return false;

    // Replace with actual token validation
    return token === 'health-check-token';
  }

  private renderHealthDashboard(result: HealthCheckResult): string {
    const statusColor = {
      [HealthStatus.HEALTHY]: 'success',
      [HealthStatus.DEGRADED]: 'warning',
      [HealthStatus.UNHEALTHY]: 'error',
    };

    const dependencyRows =
      result.dependencies
        ?.map(
          (d) => `
        <tr>
          <td>${d.name}</td>
          <td><span class="badge badge-${statusColor[d.status]}">${d.status}</span></td>
          <td>${d.latencyMs?.toFixed(2) ?? 'N/A'}ms</td>
          <td>${d.message ?? '-'}</td>
        </tr>
      `
        )
        .join('') ?? '';

    return `
      <!DOCTYPE html>
      <html lang="en" data-theme="light">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Health Status</title>
        <link href="https://cdn.jsdelivr.net/npm/daisyui@5/dist/full.min.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <meta http-equiv="refresh" content="30">
      </head>
      <body class="p-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-6">System Health</h1>
          
          <div class="stats shadow mb-8">
            <div class="stat">
              <div class="stat-title">Status</div>
              <div class="stat-value text-${statusColor[result.status]}">${result.status}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Version</div>
              <div class="stat-value text-lg">${result.version ?? 'Unknown'}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Uptime</div>
              <div class="stat-value text-lg">${this.formatUptime(result.uptime)}</div>
            </div>
          </div>

          <h2 class="text-xl font-semibold mb-4">Dependencies</h2>
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Latency</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                ${dependencyRows}
              </tbody>
            </table>
          </div>

          <div class="text-sm text-gray-500 mt-8">
            Last updated: ${result.timestamp.toISOString()}
            <br>
            Auto-refreshes every 30 seconds
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private formatUptime(uptimeMs?: number): string {
    if (!uptimeMs) return 'Unknown';

    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}
```

### Integrating Health Routes

```typescript
// src/router.ts

import { HealthHandlers } from './presentation/handlers/HealthHandlers';
import { HealthChecker } from './observability/health/HealthChecker';
import { D1HealthCheck, KVHealthCheck } from './observability/health/DependencyCheck';

export function createRouter(env: Env): Router {
  // Set up health checker
  const healthChecker = new HealthChecker({
    version: '1.0.0', // Or read from env/build
  });

  healthChecker.addDependency(new D1HealthCheck(env.DB));
  healthChecker.addDependency(new KVHealthCheck(env.SESSIONS, 'sessions'));

  const healthHandlers = new HealthHandlers(healthChecker);

  // Register routes
  const router = new Router();

  // Health endpoints - no auth required for basic checks
  router.get('/health', (req) => healthHandlers.handleSimple(req));
  router.get('/health/live', (req) => healthHandlers.handleLiveness(req));
  router.get('/health/ready', (req) => healthHandlers.handleReadiness(req));
  router.get('/health/detailed', (req) => healthHandlers.handleDetailed(req));
  router.get('/health/dashboard', (req) => healthHandlers.handleDashboard(req));

  // ... other routes

  return router;
}
```

---

## SLO Implementation Patterns

### Defining SLOs

```typescript
// src/observability/slo/definitions.ts

export interface SLODefinition {
  name: string;
  description: string;
  target: number; // 0.0 to 1.0 (e.g., 0.999 for 99.9%)
  window: {
    duration: number; // milliseconds
    type: 'rolling' | 'calendar';
  };
  indicator: {
    type: 'availability' | 'latency' | 'throughput' | 'custom';
    threshold?: number; // For latency: max ms
    good: (event: SLIEvent) => boolean;
  };
}

export interface SLIEvent {
  timestamp: Date;
  requestId: string;
  latencyMs: number;
  success: boolean;
  metadata: Record<string, string | number>;
}

// Application SLO definitions
export const SLOs: Record<string, SLODefinition> = {
  // 99.9% of requests should succeed
  availability: {
    name: 'Request Success Rate',
    description: 'Percentage of requests that return non-5xx responses',
    target: 0.999,
    window: {
      duration: 30 * 24 * 60 * 60 * 1000, // 30 days
      type: 'rolling',
    },
    indicator: {
      type: 'availability',
      good: (event) => event.success,
    },
  },

  // 99% of page loads should complete in under 500ms
  pageLoadLatency: {
    name: 'Page Load Latency',
    description: 'Time to render full page response',
    target: 0.99,
    window: {
      duration: 7 * 24 * 60 * 60 * 1000, // 7 days
      type: 'rolling',
    },
    indicator: {
      type: 'latency',
      threshold: 500,
      good: (event) => event.latencyMs < 500,
    },
  },

  // 99.5% of task creations should complete in under 1000ms
  taskCreateLatency: {
    name: 'Task Creation Latency',
    description: 'Time from form submit to confirmation',
    target: 0.995,
    window: {
      duration: 7 * 24 * 60 * 60 * 1000, // 7 days
      type: 'rolling',
    },
    indicator: {
      type: 'latency',
      threshold: 1000,
      good: (event) => event.success && event.latencyMs < 1000,
    },
  },
};
```

### The SLOTracker Class

```typescript
// src/observability/slo/SLOTracker.ts

import { SLODefinition, SLIEvent, SLOs } from './definitions';

export interface SLOStatus {
  name: string;
  target: number;
  current: number;
  totalEvents: number;
  goodEvents: number;
  errorBudget: {
    total: number;
    remaining: number;
    consumedPercent: number;
  };
  burnRate: {
    current: number;
    isAlerting: boolean;
  };
}

export class SLOTracker {
  private events: Map<string, SLIEvent[]> = new Map();

  constructor(private readonly definitions: Record<string, SLODefinition>) {
    // Initialize event storage for each SLO
    for (const name of Object.keys(definitions)) {
      this.events.set(name, []);
    }
  }

  /**
   * Record an event that may affect one or more SLOs.
   */
  recordEvent(event: SLIEvent, sloNames?: string[]): void {
    const targetSLOs = sloNames ?? Object.keys(this.definitions);

    for (const sloName of targetSLOs) {
      const events = this.events.get(sloName);
      if (events) {
        events.push(event);
        this.pruneOldEvents(sloName);
      }
    }
  }

  /**
   * Get current status for an SLO.
   */
  getStatus(sloName: string): SLOStatus | null {
    const definition = this.definitions[sloName];
    const events = this.events.get(sloName);

    if (!definition || !events) {
      return null;
    }

    const windowStart = Date.now() - definition.window.duration;
    const windowEvents = events.filter((e) => e.timestamp.getTime() > windowStart);

    const goodEvents = windowEvents.filter((e) => definition.indicator.good(e));

    const current = windowEvents.length > 0 ? goodEvents.length / windowEvents.length : 1;

    // Calculate error budget
    const errorBudgetTotal = 1 - definition.target; // e.g., 0.001 for 99.9%
    const errorRate = 1 - current;
    const errorBudgetRemaining = Math.max(0, errorBudgetTotal - errorRate);
    const errorBudgetConsumed =
      errorBudgetTotal > 0
        ? ((errorBudgetTotal - errorBudgetRemaining) / errorBudgetTotal) * 100
        : 0;

    // Calculate burn rate (how fast we're consuming error budget)
    const burnRate = this.calculateBurnRate(sloName, definition);

    return {
      name: definition.name,
      target: definition.target,
      current,
      totalEvents: windowEvents.length,
      goodEvents: goodEvents.length,
      errorBudget: {
        total: errorBudgetTotal,
        remaining: errorBudgetRemaining,
        consumedPercent: errorBudgetConsumed,
      },
      burnRate,
    };
  }

  /**
   * Get status for all SLOs.
   */
  getAllStatuses(): SLOStatus[] {
    return Object.keys(this.definitions)
      .map((name) => this.getStatus(name))
      .filter((s): s is SLOStatus => s !== null);
  }

  /**
   * Check if any SLO is in alert state.
   */
  hasAlerts(): boolean {
    return this.getAllStatuses().some((s) => s.burnRate.isAlerting);
  }

  /**
   * Calculate burn rate over different time windows.
   * Uses multi-window, multi-burn-rate alerting.
   */
  private calculateBurnRate(
    sloName: string,
    definition: SLODefinition
  ): { current: number; isAlerting: boolean } {
    const events = this.events.get(sloName) ?? [];

    // Short window: 5 minutes
    const shortWindowMs = 5 * 60 * 1000;
    const shortWindowStart = Date.now() - shortWindowMs;
    const shortWindowEvents = events.filter((e) => e.timestamp.getTime() > shortWindowStart);
    const shortWindowGood = shortWindowEvents.filter((e) => definition.indicator.good(e));
    const shortErrorRate =
      shortWindowEvents.length > 0 ? 1 - shortWindowGood.length / shortWindowEvents.length : 0;

    // Long window: 1 hour
    const longWindowMs = 60 * 60 * 1000;
    const longWindowStart = Date.now() - longWindowMs;
    const longWindowEvents = events.filter((e) => e.timestamp.getTime() > longWindowStart);
    const longWindowGood = longWindowEvents.filter((e) => definition.indicator.good(e));
    const longErrorRate =
      longWindowEvents.length > 0 ? 1 - longWindowGood.length / longWindowEvents.length : 0;

    // Error budget for window
    const errorBudget = 1 - definition.target;

    // Burn rate: how many error budgets per window duration
    // If we're using error budget at 10x normal rate, burn rate = 10
    const expectedErrorRatePerWindow = errorBudget / (definition.window.duration / shortWindowMs);
    const currentBurnRate =
      expectedErrorRatePerWindow > 0 ? shortErrorRate / expectedErrorRatePerWindow : 0;

    // Alert if burning faster than sustainable
    // Short window burn rate > 14.4 (consumes 2% budget in 5 min at 30-day window)
    // AND long window burn rate > 6 (confirms it's not just noise)
    const shortBurnThreshold = 14.4;
    const longBurnThreshold = 6;

    const isAlerting =
      currentBurnRate > shortBurnThreshold &&
      longErrorRate / expectedErrorRatePerWindow > longBurnThreshold;

    return {
      current: currentBurnRate,
      isAlerting,
    };
  }

  /**
   * Remove events outside the SLO window.
   */
  private pruneOldEvents(sloName: string): void {
    const definition = this.definitions[sloName];
    const events = this.events.get(sloName);

    if (!definition || !events) return;

    const cutoff = Date.now() - definition.window.duration;
    const filtered = events.filter((e) => e.timestamp.getTime() > cutoff);

    this.events.set(sloName, filtered);
  }

  /**
   * Clear all tracked events.
   */
  clear(): void {
    for (const name of this.events.keys()) {
      this.events.set(name, []);
    }
  }
}
```

### SLO Tracker Tests

```typescript
// src/observability/slo/SLOTracker.spec.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SLOTracker, SLOStatus } from './SLOTracker';
import { SLODefinition, SLIEvent } from './definitions';

describe('SLOTracker', () => {
  const testSLOs: Record<string, SLODefinition> = {
    availability: {
      name: 'Test Availability',
      description: 'Test SLO',
      target: 0.99, // 99%
      window: {
        duration: 60 * 60 * 1000, // 1 hour
        type: 'rolling' as const,
      },
      indicator: {
        type: 'availability' as const,
        good: (event: SLIEvent) => event.success,
      },
    },
    latency: {
      name: 'Test Latency',
      description: 'Test latency SLO',
      target: 0.95, // 95%
      window: {
        duration: 60 * 60 * 1000,
        type: 'rolling' as const,
      },
      indicator: {
        type: 'latency' as const,
        threshold: 200,
        good: (event: SLIEvent) => event.latencyMs < 200,
      },
    },
  };

  let tracker: SLOTracker;

  beforeEach(() => {
    tracker = new SLOTracker(testSLOs);
  });

  function createEvent(overrides: Partial<SLIEvent> = {}): SLIEvent {
    return {
      timestamp: new Date(),
      requestId: crypto.randomUUID(),
      latencyMs: 100,
      success: true,
      metadata: {},
      ...overrides,
    };
  }

  describe('recordEvent', () => {
    it('records events for all SLOs by default', () => {
      tracker.recordEvent(createEvent());

      expect(tracker.getStatus('availability')?.totalEvents).toBe(1);
      expect(tracker.getStatus('latency')?.totalEvents).toBe(1);
    });

    it('records events for specific SLOs when specified', () => {
      tracker.recordEvent(createEvent(), ['availability']);

      expect(tracker.getStatus('availability')?.totalEvents).toBe(1);
      expect(tracker.getStatus('latency')?.totalEvents).toBe(0);
    });
  });

  describe('getStatus', () => {
    it('returns null for unknown SLO', () => {
      expect(tracker.getStatus('unknown')).toBeNull();
    });

    it('returns 100% when no events', () => {
      const status = tracker.getStatus('availability');

      expect(status?.current).toBe(1);
      expect(status?.totalEvents).toBe(0);
    });

    it('calculates correct percentage for availability', () => {
      // 90 good, 10 bad = 90%
      for (let i = 0; i < 90; i++) {
        tracker.recordEvent(createEvent({ success: true }), ['availability']);
      }
      for (let i = 0; i < 10; i++) {
        tracker.recordEvent(createEvent({ success: false }), ['availability']);
      }

      const status = tracker.getStatus('availability');

      expect(status?.current).toBe(0.9);
      expect(status?.totalEvents).toBe(100);
      expect(status?.goodEvents).toBe(90);
    });

    it('calculates correct percentage for latency', () => {
      // 80 fast, 20 slow = 80%
      for (let i = 0; i < 80; i++) {
        tracker.recordEvent(createEvent({ latencyMs: 100 }), ['latency']);
      }
      for (let i = 0; i < 20; i++) {
        tracker.recordEvent(createEvent({ latencyMs: 300 }), ['latency']);
      }

      const status = tracker.getStatus('latency');

      expect(status?.current).toBe(0.8);
    });
  });

  describe('error budget', () => {
    it('calculates error budget correctly', () => {
      // 99% SLO = 1% error budget
      // If we're at 99.5%, we've used half our error budget
      for (let i = 0; i < 995; i++) {
        tracker.recordEvent(createEvent({ success: true }), ['availability']);
      }
      for (let i = 0; i < 5; i++) {
        tracker.recordEvent(createEvent({ success: false }), ['availability']);
      }

      const status = tracker.getStatus('availability');

      expect(status?.errorBudget.total).toBe(0.01); // 1%
      expect(status?.errorBudget.consumedPercent).toBeCloseTo(50, 1);
    });

    it('caps remaining budget at 0', () => {
      // Far below SLO
      for (let i = 0; i < 80; i++) {
        tracker.recordEvent(createEvent({ success: true }), ['availability']);
      }
      for (let i = 0; i < 20; i++) {
        tracker.recordEvent(createEvent({ success: false }), ['availability']);
      }

      const status = tracker.getStatus('availability');

      expect(status?.errorBudget.remaining).toBe(0);
      expect(status?.errorBudget.consumedPercent).toBeGreaterThan(100);
    });
  });

  describe('getAllStatuses', () => {
    it('returns status for all configured SLOs', () => {
      const statuses = tracker.getAllStatuses();

      expect(statuses.length).toBe(2);
      expect(statuses.map((s) => s.name)).toContain('Test Availability');
      expect(statuses.map((s) => s.name)).toContain('Test Latency');
    });
  });

  describe('event pruning', () => {
    it('removes events outside the window', () => {
      vi.useFakeTimers();

      // Add event at time 0
      tracker.recordEvent(createEvent(), ['availability']);

      // Advance past window
      vi.advanceTimersByTime(2 * 60 * 60 * 1000); // 2 hours

      // Add another event
      tracker.recordEvent(createEvent(), ['availability']);

      const status = tracker.getStatus('availability');

      // Only the recent event should be counted
      expect(status?.totalEvents).toBe(1);

      vi.useRealTimers();
    });
  });
});
```

### SLO Integration with Metrics

```typescript
// src/observability/middleware/metricsMiddleware.ts

import { RequestTimer } from '../metrics/RequestTimer';
import { ErrorTracker } from '../metrics/ErrorTracker';
import { SLOTracker } from '../slo/SLOTracker';
import { SLOs, SLIEvent } from '../slo/definitions';

export interface MetricsMiddlewareOptions {
  analyticsEngine?: AnalyticsEngineDataset;
  errorTracker: ErrorTracker;
  sloTracker: SLOTracker;
}

export function createMetricsMiddleware(options: MetricsMiddlewareOptions) {
  return async (
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    next: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
  ): Promise<Response> {
    const timer = new RequestTimer();
    const url = new URL(request.url);

    timer.addMetadata('method', request.method);
    timer.addMetadata('path', url.pathname);

    requestTimers.set(request, timer);

    let response: Response;
    let success = true;

    try {
      response = await next(request, env, ctx);
      success = response.status < 500;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const timings = timer.finalize();

      // Create SLI event
      const sliEvent: SLIEvent = {
        timestamp: new Date(),
        requestId: timer.getRequestId(),
        latencyMs: timings.totalDuration,
        success,
        metadata: {
          path: url.pathname,
          method: request.method,
          status: response!?.status ?? 500,
        },
      };

      // Record to SLO tracker
      options.sloTracker.recordEvent(sliEvent);

      // Record to error tracker
      options.errorTracker.recordRequest();

      // Write to Analytics Engine
      if (options.analyticsEngine) {
        ctx.waitUntil(
          writeToAnalyticsEngine(options.analyticsEngine, timings, sliEvent)
        );
      }
    }

    return response!;
  };
}

async function writeToAnalyticsEngine(
  dataset: AnalyticsEngineDataset,
  timings: RequestTimings,
  event: SLIEvent
): Promise<void> {
  dataset.writeDataPoint({
    blobs: [
      event.requestId,
      event.metadata.path as string,
      event.metadata.method as string,
    ],
    doubles: [
      timings.totalDuration,
      event.success ? 1 : 0,
      event.metadata.status as number,
    ],
    indexes: [event.metadata.path as string],
  });
}

const requestTimers = new WeakMap<Request, RequestTimer>();

export function getRequestTimer(request: Request): RequestTimer | undefined {
  return requestTimers.get(request);
}
```

---

## Infrastructure Integration

### Cloudflare Analytics Engine

Analytics Engine is Cloudflare's native time-series data store, optimized for high-volume metrics.

```typescript
// src/infrastructure/analytics/AnalyticsEngineAdapter.ts

export interface MetricDataPoint {
  timestamp: Date;
  name: string;
  value: number;
  labels: Record<string, string>;
  metadata?: Record<string, string | number>;
}

export class AnalyticsEngineAdapter {
  constructor(private readonly dataset: AnalyticsEngineDataset) {}

  /**
   * Write a request timing metric.
   */
  writeRequestMetric(
    requestId: string,
    path: string,
    method: string,
    durationMs: number,
    statusCode: number
  ): void {
    this.dataset.writeDataPoint({
      blobs: [requestId, path, method, new Date().toISOString()],
      doubles: [durationMs, statusCode],
      indexes: [path], // Index by path for efficient queries
    });
  }

  /**
   * Write an error event.
   */
  writeErrorMetric(
    requestId: string,
    path: string,
    errorCategory: string,
    errorMessage: string
  ): void {
    this.dataset.writeDataPoint({
      blobs: [
        requestId,
        path,
        errorCategory,
        errorMessage.slice(0, 256), // Truncate long messages
        new Date().toISOString(),
      ],
      doubles: [1], // Error count
      indexes: [errorCategory],
    });
  }

  /**
   * Write a health check result.
   */
  writeHealthMetric(dependencyName: string, status: string, latencyMs: number): void {
    this.dataset.writeDataPoint({
      blobs: [dependencyName, status, new Date().toISOString()],
      doubles: [latencyMs, status === 'healthy' ? 1 : 0],
      indexes: [dependencyName],
    });
  }

  /**
   * Write an SLO status snapshot.
   */
  writeSLOMetric(
    sloName: string,
    current: number,
    target: number,
    errorBudgetRemainingPercent: number
  ): void {
    this.dataset.writeDataPoint({
      blobs: [sloName, new Date().toISOString()],
      doubles: [current, target, errorBudgetRemainingPercent],
      indexes: [sloName],
    });
  }
}
```

### Querying Analytics Engine Data

Analytics Engine data can be queried via the Cloudflare API or GraphQL:

```typescript
// Example: Query latency percentiles via Workers
async function getLatencyPercentiles(
  accountId: string,
  apiToken: string,
  datasetName: string,
  hours: number = 24
): Promise<{ p50: number; p95: number; p99: number }> {
  const query = `
    SELECT
      quantileExact(0.5)(double1) as p50,
      quantileExact(0.95)(double1) as p95,
      quantileExact(0.99)(double1) as p99
    FROM ${datasetName}
    WHERE timestamp > now() - interval '${hours}' hour
  `;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );

  const data = await response.json();
  return data.result[0];
}
```

### External Monitoring Integration

For integration with external monitoring (Datadog, Prometheus, etc.):

```typescript
// src/infrastructure/monitoring/ExternalReporter.ts

export interface ExternalMetricsConfig {
  enabled: boolean;
  endpoint: string;
  apiKey: string;
  batchSize: number;
  flushIntervalMs: number;
}

export class ExternalMetricsReporter {
  private buffer: MetricDataPoint[] = [];
  private flushTimer: number | null = null;

  constructor(private readonly config: ExternalMetricsConfig) {}

  /**
   * Queue a metric for reporting.
   */
  record(metric: MetricDataPoint): void {
    if (!this.config.enabled) return;

    this.buffer.push(metric);

    if (this.buffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Send buffered metrics to external service.
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const metrics = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': this.config.apiKey, // Example: Datadog
        },
        body: JSON.stringify({
          series: metrics.map((m) => ({
            metric: m.name,
            points: [[Math.floor(m.timestamp.getTime() / 1000), m.value]],
            tags: Object.entries(m.labels).map(([k, v]) => `${k}:${v}`),
          })),
        }),
      });
    } catch (error) {
      console.error('Failed to send metrics to external service:', error);
      // Re-queue failed metrics (with limit to prevent memory issues)
      if (this.buffer.length < this.config.batchSize * 2) {
        this.buffer.unshift(...metrics);
      }
    }
  }
}
```

### Prometheus-Compatible Endpoint

For systems that scrape Prometheus metrics:

```typescript
// src/presentation/handlers/PrometheusHandlers.ts

import { SLOTracker } from '../../observability/slo/SLOTracker';
import { ErrorTracker } from '../../observability/metrics/ErrorTracker';

export class PrometheusHandlers {
  constructor(
    private readonly sloTracker: SLOTracker,
    private readonly errorTracker: ErrorTracker
  ) {}

  /**
   * Prometheus metrics endpoint.
   * GET /metrics
   */
  async handleMetrics(_request: Request): Promise<Response> {
    const lines: string[] = [];

    // SLO metrics
    const sloStatuses = this.sloTracker.getAllStatuses();
    for (const status of sloStatuses) {
      const safeName = status.name.toLowerCase().replace(/\s+/g, '_');

      lines.push(`# HELP slo_${safeName}_current Current SLO value`);
      lines.push(`# TYPE slo_${safeName}_current gauge`);
      lines.push(`slo_${safeName}_current ${status.current}`);

      lines.push(`# HELP slo_${safeName}_target Target SLO value`);
      lines.push(`# TYPE slo_${safeName}_target gauge`);
      lines.push(`slo_${safeName}_target ${status.target}`);

      lines.push(`# HELP slo_${safeName}_error_budget_remaining Remaining error budget`);
      lines.push(`# TYPE slo_${safeName}_error_budget_remaining gauge`);
      lines.push(`slo_${safeName}_error_budget_remaining ${status.errorBudget.remaining}`);

      lines.push(`# HELP slo_${safeName}_burn_rate Current burn rate`);
      lines.push(`# TYPE slo_${safeName}_burn_rate gauge`);
      lines.push(`slo_${safeName}_burn_rate ${status.burnRate.current}`);
    }

    // Error metrics
    const errorSummary = this.errorTracker.getSummary();
    lines.push('# HELP errors_total Total errors by category');
    lines.push('# TYPE errors_total counter');
    for (const [category, count] of Object.entries(errorSummary.byCategory)) {
      lines.push(`errors_total{category="${category}"} ${count}`);
    }

    lines.push('# HELP error_rate_server Server error rate');
    lines.push('# TYPE error_rate_server gauge');
    lines.push(`error_rate_server ${errorSummary.serverErrorRate}`);

    return new Response(lines.join('\n'), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
```

---

## Testing Observability Code

### Testing Principles

Observability code is infrastructure code—it should be tested like any other code. Key testing strategies:

1. **Unit test metric calculations**: Verify timers, error categorization, SLO math
2. **Unit test middleware in isolation**: Mock dependencies, verify correct calls
3. **Integration test data flow**: Verify metrics reach Analytics Engine
4. **Acceptance test health endpoints**: Verify correct HTTP responses

### Testing Middleware

```typescript
// src/observability/middleware/timingMiddleware.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTimingMiddleware, getRequestTimer } from './timingMiddleware';

describe('timingMiddleware', () => {
  const mockOnComplete = vi.fn();

  const middleware = createTimingMiddleware({
    onComplete: mockOnComplete,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a timer for each request', async () => {
    const request = new Request('https://example.com/test');
    const mockNext = vi.fn().mockResolvedValue(new Response('OK'));
    const mockCtx = {
      waitUntil: vi.fn(),
    } as unknown as ExecutionContext;

    await middleware(request, {} as Env, mockCtx, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('calls onComplete with timing data', async () => {
    const request = new Request('https://example.com/test');
    const mockNext = vi.fn().mockResolvedValue(new Response('OK'));
    const mockCtx = {
      waitUntil: vi.fn((promise) => promise),
    } as unknown as ExecutionContext;

    await middleware(request, {} as Env, mockCtx, mockNext);

    // Wait for async onComplete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockOnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: expect.any(String),
        totalDuration: expect.any(Number),
      }),
      request,
      expect.any(Response)
    );
  });

  it('adds Server-Timing header to response', async () => {
    const request = new Request('https://example.com/test');
    const mockNext = vi.fn().mockResolvedValue(new Response('OK'));
    const mockCtx = {
      waitUntil: vi.fn(),
    } as unknown as ExecutionContext;

    const response = await middleware(request, {} as Env, mockCtx, mockNext);

    expect(response.headers.get('Server-Timing')).toContain('total;dur=');
  });

  it('adds error metadata when handler throws', async () => {
    const request = new Request('https://example.com/test');
    const mockNext = vi.fn().mockRejectedValue(new Error('Test error'));
    const mockCtx = {
      waitUntil: vi.fn((promise) => promise),
    } as unknown as ExecutionContext;

    await expect(middleware(request, {} as Env, mockCtx, mockNext)).rejects.toThrow('Test error');
  });
});
```

### Testing Health Checks

```typescript
// src/observability/health/DependencyCheck.spec.ts

import { describe, it, expect, vi } from 'vitest';
import { D1HealthCheck, KVHealthCheck, HttpHealthCheck } from './DependencyCheck';
import { HealthStatus } from './types';

describe('D1HealthCheck', () => {
  it('returns healthy when query succeeds', async () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue({ 1: 1 }),
      }),
    } as unknown as D1Database;

    const checker = new D1HealthCheck(mockDb);
    const result = await checker.check();

    expect(result.status).toBe(HealthStatus.HEALTHY);
    expect(result.latencyMs).toBeDefined();
  });

  it('returns unhealthy when query fails', async () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        first: vi.fn().mockRejectedValue(new Error('Connection failed')),
      }),
    } as unknown as D1Database;

    const checker = new D1HealthCheck(mockDb);
    const result = await checker.check();

    expect(result.status).toBe(HealthStatus.UNHEALTHY);
    expect(result.message).toContain('Connection failed');
  });
});

describe('KVHealthCheck', () => {
  it('returns healthy when read/write succeeds', async () => {
    const mockKV = {
      put: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue('test-value'),
    } as unknown as KVNamespace;

    const checker = new KVHealthCheck(mockKV, 'test-kv');
    const result = await checker.check();

    expect(result.status).toBe(HealthStatus.HEALTHY);
    expect(result.name).toBe('test-kv');
  });

  it('returns degraded when read returns null', async () => {
    const mockKV = {
      put: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null),
    } as unknown as KVNamespace;

    const checker = new KVHealthCheck(mockKV);
    const result = await checker.check();

    expect(result.status).toBe(HealthStatus.DEGRADED);
  });
});

describe('HttpHealthCheck', () => {
  it('returns healthy for expected status code', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
    });

    const checker = new HttpHealthCheck('api', 'https://api.example.com/health');
    const result = await checker.check();

    expect(result.status).toBe(HealthStatus.HEALTHY);
  });

  it('returns degraded for unexpected status code', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 503,
    });

    const checker = new HttpHealthCheck('api', 'https://api.example.com/health');
    const result = await checker.check();

    expect(result.status).toBe(HealthStatus.DEGRADED);
  });

  it('returns unhealthy on fetch error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const checker = new HttpHealthCheck('api', 'https://api.example.com/health');
    const result = await checker.check();

    expect(result.status).toBe(HealthStatus.UNHEALTHY);
    expect(result.message).toContain('Network error');
  });
});
```

### Acceptance Tests for Health Endpoints

```typescript
// src/presentation/handlers/HealthHandlers.acceptance.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';

describe('Health Endpoints', () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  describe('GET /health', () => {
    it('returns 200 when healthy', async () => {
      const response = await worker.fetch('/health');

      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('healthy');
    });
  });

  describe('GET /health/live', () => {
    it('returns liveness info', async () => {
      const response = await worker.fetch('/health/live');

      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe('healthy');
      expect(body.version).toBeDefined();
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /health/ready', () => {
    it('returns readiness with dependency status', async () => {
      const response = await worker.fetch('/health/ready');

      const body = await response.json();
      expect(body.status).toBeDefined();
      expect(body.dependencies).toBeInstanceOf(Array);
    });
  });

  describe('GET /health/detailed', () => {
    it('requires authorization', async () => {
      const response = await worker.fetch('/health/detailed');

      expect(response.status).toBe(401);
    });

    it('returns detailed info when authorized', async () => {
      const response = await worker.fetch('/health/detailed', {
        headers: {
          Authorization: 'Bearer health-check-token',
        },
      });

      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.dependencies).toBeDefined();
      expect(body.uptime).toBeDefined();
    });
  });
});
```

---

## Complete Reference Implementation

### Worker Entry Point with Observability

```typescript
// src/index.ts

import { HealthChecker } from './observability/health/HealthChecker';
import { D1HealthCheck, KVHealthCheck } from './observability/health/DependencyCheck';
import { ErrorTracker } from './observability/metrics/ErrorTracker';
import { SLOTracker } from './observability/slo/SLOTracker';
import { SLOs } from './observability/slo/definitions';
import { AnalyticsEngineAdapter } from './infrastructure/analytics/AnalyticsEngineAdapter';
import { createMetricsMiddleware } from './observability/middleware/metricsMiddleware';
import { createErrorMiddleware } from './observability/middleware/errorMiddleware';
import { HealthHandlers } from './presentation/handlers/HealthHandlers';
import { PrometheusHandlers } from './presentation/handlers/PrometheusHandlers';
import { createRouter } from './router';

// Global instances (per isolate)
let healthChecker: HealthChecker | null = null;
let errorTracker: ErrorTracker | null = null;
let sloTracker: SLOTracker | null = null;
let analyticsAdapter: AnalyticsEngineAdapter | null = null;

const startTime = new Date();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Initialize on first request (lazy initialization)
    if (!healthChecker) {
      healthChecker = new HealthChecker({
        version: env.VERSION ?? '1.0.0',
        startTime,
      });
      healthChecker.addDependency(new D1HealthCheck(env.DB));
      healthChecker.addDependency(new KVHealthCheck(env.SESSIONS, 'sessions'));
    }

    if (!errorTracker) {
      errorTracker = new ErrorTracker({ maxStoredErrors: 100 });
    }

    if (!sloTracker) {
      sloTracker = new SLOTracker(SLOs);
    }

    if (!analyticsAdapter && env.METRICS) {
      analyticsAdapter = new AnalyticsEngineAdapter(env.METRICS);
    }

    // Create middleware chain
    const metricsMiddleware = createMetricsMiddleware({
      analyticsEngine: env.METRICS,
      errorTracker,
      sloTracker,
    });

    const errorMiddleware = createErrorMiddleware({
      tracker: errorTracker,
      onError: (error) => {
        if (analyticsAdapter) {
          analyticsAdapter.writeErrorMetric(
            error.requestId ?? 'unknown',
            error.path ?? 'unknown',
            error.category,
            error.message
          );
        }
      },
    });

    // Create handlers
    const healthHandlers = new HealthHandlers(healthChecker);
    const prometheusHandlers = new PrometheusHandlers(sloTracker, errorTracker);

    // Route request
    const url = new URL(request.url);

    // Health endpoints (no metrics middleware to avoid circular issues)
    if (url.pathname.startsWith('/health')) {
      return routeHealthEndpoint(url.pathname, request, healthHandlers);
    }

    if (url.pathname === '/metrics') {
      return prometheusHandlers.handleMetrics(request);
    }

    // All other requests go through middleware
    return metricsMiddleware(request, env, ctx, async (req, e, c) => {
      return errorMiddleware(req, e, c, async (req2, e2, c2) => {
        const router = createRouter(e2);
        return router.handle(req2, e2, c2);
      });
    });
  },

  // Scheduled handler for periodic tasks
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Periodically write SLO snapshots
    if (sloTracker && analyticsAdapter) {
      const statuses = sloTracker.getAllStatuses();
      for (const status of statuses) {
        analyticsAdapter.writeSLOMetric(
          status.name,
          status.current,
          status.target,
          100 - status.errorBudget.consumedPercent
        );
      }
    }

    // Periodically run health checks and log
    if (healthChecker && analyticsAdapter) {
      const health = await healthChecker.checkDetailed();
      for (const dep of health.dependencies ?? []) {
        analyticsAdapter.writeHealthMetric(dep.name, dep.status, dep.latencyMs ?? 0);
      }
    }
  },
};

function routeHealthEndpoint(
  pathname: string,
  request: Request,
  handlers: HealthHandlers
): Promise<Response> {
  switch (pathname) {
    case '/health':
      return handlers.handleSimple(request);
    case '/health/live':
      return handlers.handleLiveness(request);
    case '/health/ready':
      return handlers.handleReadiness(request);
    case '/health/detailed':
      return handlers.handleDetailed(request);
    case '/health/dashboard':
      return handlers.handleDashboard(request);
    default:
      return Promise.resolve(new Response('Not Found', { status: 404 }));
  }
}
```

### Wrangler Configuration

```jsonc
// wrangler.jsonc
{
  "name": "my-app",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",

  "analytics_engine_datasets": [
    {
      "binding": "METRICS",
      "dataset": "my_app_metrics",
    },
  ],

  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-app-db",
      "database_id": "your-database-id",
    },
  ],

  "kv_namespaces": [
    {
      "binding": "SESSIONS",
      "id": "your-kv-id",
    },
    {
      "binding": "HEALTH_STATE",
      "id": "your-health-kv-id",
    },
  ],

  "vars": {
    "VERSION": "1.0.0",
  },

  // Scheduled tasks for periodic metrics
  "triggers": {
    "crons": ["*/5 * * * *"], // Every 5 minutes
  },
}
```

---

## Operational Patterns

### Alert Configuration

Based on SLO burn rates, configure alerts:

```typescript
// src/observability/alerts/AlertRules.ts

export interface AlertRule {
  name: string;
  condition: (status: SLOStatus) => boolean;
  severity: 'warning' | 'critical';
  message: (status: SLOStatus) => string;
}

export const alertRules: AlertRule[] = [
  {
    name: 'High Burn Rate',
    condition: (status) => status.burnRate.current > 10,
    severity: 'warning',
    message: (status) =>
      `${status.name} burn rate is ${status.burnRate.current.toFixed(1)}x normal`,
  },
  {
    name: 'Critical Burn Rate',
    condition: (status) => status.burnRate.isAlerting,
    severity: 'critical',
    message: (status) => `${status.name} is burning error budget critically fast`,
  },
  {
    name: 'Error Budget Exhausted',
    condition: (status) => status.errorBudget.remaining <= 0,
    severity: 'critical',
    message: (status) => `${status.name} has exhausted its error budget`,
  },
  {
    name: 'Error Budget Low',
    condition: (status) =>
      status.errorBudget.consumedPercent > 80 && status.errorBudget.remaining > 0,
    severity: 'warning',
    message: (status) =>
      `${status.name} has consumed ${status.errorBudget.consumedPercent.toFixed(0)}% of error budget`,
  },
];

export function checkAlerts(statuses: SLOStatus[]): {
  rule: AlertRule;
  status: SLOStatus;
}[] {
  const triggered: { rule: AlertRule; status: SLOStatus }[] = [];

  for (const status of statuses) {
    for (const rule of alertRules) {
      if (rule.condition(status)) {
        triggered.push({ rule, status });
      }
    }
  }

  return triggered;
}
```

### Incident Response Runbook Template

```markdown
## Incident: SLO Violation

### Detection

- Alert triggered: [Alert name]
- SLO affected: [SLO name]
- Current value: [X%] (target: [Y%])
- Error budget remaining: [Z%]

### Triage Steps

1. **Check Health Dashboard**
   - Navigate to /health/dashboard
   - Identify any unhealthy dependencies
   - Note recent error patterns

2. **Review Recent Deployments**
   - Check deployment history
   - Identify any recent changes
   - Consider rollback if recent deploy correlates

3. **Check Dependency Status**
   - D1 database: [status]
   - KV store: [status]
   - External APIs: [status]

4. **Review Error Logs**
   - Check error categories
   - Identify common patterns
   - Note affected endpoints

### Mitigation Actions

- [ ] Scale down traffic (if applicable)
- [ ] Roll back recent deployment
- [ ] Enable circuit breaker
- [ ] Notify stakeholders

### Resolution

- Root cause: [description]
- Fix applied: [description]
- Prevention: [action items]
```

### Dashboard Queries

Example Analytics Engine SQL queries for dashboards:

```sql
-- Request latency percentiles (last 24 hours)
SELECT
  quantileExact(0.50)(double1) as p50_ms,
  quantileExact(0.95)(double1) as p95_ms,
  quantileExact(0.99)(double1) as p99_ms,
  count() as total_requests
FROM app_metrics
WHERE timestamp > now() - interval '24' hour
  AND blob2 NOT LIKE '/health%'

-- Error rate by endpoint (last hour)
SELECT
  blob2 as path,
  count() as total,
  countIf(double2 >= 500) as errors,
  round(countIf(double2 >= 500) / count() * 100, 2) as error_rate_percent
FROM app_metrics
WHERE timestamp > now() - interval '1' hour
GROUP BY blob2
ORDER BY error_rate_percent DESC
LIMIT 10

-- Requests per minute trend
SELECT
  toStartOfMinute(timestamp) as minute,
  count() as requests
FROM app_metrics
WHERE timestamp > now() - interval '1' hour
GROUP BY minute
ORDER BY minute

-- Slow requests (> 500ms)
SELECT
  blob1 as request_id,
  blob2 as path,
  blob3 as method,
  double1 as duration_ms,
  double2 as status
FROM app_metrics
WHERE timestamp > now() - interval '1' hour
  AND double1 > 500
ORDER BY double1 DESC
LIMIT 20
```

---

## Summary

This guide has covered the complete implementation of metrics and health-checks for Cloudflare Workers applications, following an SLO-first methodology:

### Key Takeaways

1. **Start with SLOs**: Define what "good" means before instrumenting anything. SLOs drive your metrics strategy.

2. **Measure the Four Golden Signals**: Latency, traffic, errors, and saturation give comprehensive visibility.

3. **Layer Your Health Checks**: Simple endpoints for load balancers, detailed endpoints for operations.

4. **Use Error Budgets**: They provide objective criteria for balancing reliability and velocity.

5. **Test Your Observability Code**: Metrics and health checks are code—test them accordingly.

6. **Integrate Thoughtfully**: Use Cloudflare's Analytics Engine for native integration, external services for existing tooling.

### Implementation Checklist

- [ ] Define SLOs for critical user journeys
- [ ] Implement `RequestTimer` for latency tracking
- [ ] Implement `ErrorTracker` with proper categorization
- [ ] Set up health endpoints (`/health`, `/health/ready`, `/health/detailed`)
- [ ] Configure dependency health checks (D1, KV, external APIs)
- [ ] Implement `SLOTracker` with burn rate alerting
- [ ] Connect to Analytics Engine
- [ ] Set up scheduled tasks for periodic metrics
- [ ] Create operational dashboards
- [ ] Document incident response procedures

### Next Steps

After implementing this foundation:

1. **Tune SLO targets**: Adjust based on actual user impact data
2. **Add distributed tracing**: Correlate requests across services
3. **Implement feature flags**: Control rollouts based on SLO health
4. **Automate incident response**: PagerDuty/Slack integrations

---

_This guide reflects best practices as of January 2026. For the latest Cloudflare documentation on Analytics Engine and Workers observability features, consult the official Cloudflare documentation._
