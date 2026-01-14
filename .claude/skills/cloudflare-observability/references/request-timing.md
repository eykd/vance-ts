# Request Timing

## Overview

Request timing captures multiple phases of request processing in Cloudflare Workers. This reference covers the RequestTimer class, phase timing methods, timing middleware, and Server-Timing header formatting.

**Use this reference when**: adding latency measurement to a Worker, timing async operations, or debugging performance issues.

## Core Concepts

### Key Timing Phases

In a Cloudflare Worker, the key phases to measure are:

1. **Total duration**: Entry to response
2. **Routing**: Time to determine handler
3. **Authentication**: Session/token validation
4. **Business logic**: Use case execution
5. **Data access**: D1/KV operations
6. **Rendering**: HTML template generation

### Server-Timing Header

The `Server-Timing` header makes timing data visible in browser DevTools, enabling frontend developers to see backend performance without backend access.

## Implementation Patterns

### TimingPhase and RequestTimings Interfaces

**Purpose**: Define the structure for timing data.

```typescript
/**
 * Represents a single timed phase within a request.
 */
export interface TimingPhase {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

/**
 * Complete timing data for a request.
 */
export interface RequestTimings {
  requestId: string;
  totalDuration: number;
  phases: Map<string, TimingPhase>;
  metadata: Record<string, string | number>;
}
```

### RequestTimer Class

**Purpose**: Track timing of request phases with support for nested/overlapping measurements.

```typescript
/**
 * Tracks timing of request processing phases.
 * Supports nested phases and automatic cleanup of unclosed phases.
 */
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
   * @throws Error if phase already started
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
   * @returns Duration in milliseconds
   * @throws Error if phase not started or already ended
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
   * Phase is ended even if function throws.
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
   * Auto-ends any unclosed phases.
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

### Timing Middleware Factory

**Purpose**: Wrap handlers to automatically time requests and add Server-Timing headers.

```typescript
// WeakMap to store timers per request
const requestTimers = new WeakMap<Request, RequestTimer>();

/**
 * Get the timer for the current request.
 * Use this in handlers to add custom phases.
 */
export function getRequestTimer(request: Request): RequestTimer | undefined {
  return requestTimers.get(request);
}

export interface TimingMiddlewareOptions {
  /** Function to report completed timings (Analytics Engine, etc.) */
  onComplete: (timings: RequestTimings, request: Request, response: Response) => void;
  /** Extract request ID from incoming request (for distributed tracing) */
  extractRequestId?: (request: Request) => string | undefined;
  /** Phases to automatically time */
  autoPhases?: {
    routing?: boolean;
    handler?: boolean;
  };
}

/**
 * Create timing middleware that wraps handlers.
 */
export function createTimingMiddleware(options: TimingMiddlewareOptions) {
  return async (
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    next: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
  ): Promise<Response> => {
    const requestId =
      options.extractRequestId?.(request) ?? request.headers.get('X-Request-ID') ?? undefined;

    const timer = new RequestTimer(requestId);

    // Add standard metadata
    timer.addMetadata('method', request.method);
    timer.addMetadata('path', new URL(request.url).pathname);

    // Store timer for handler access
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

    // Add timing headers for debugging
    const timedResponse = new Response(response.body, response);
    timedResponse.headers.set('X-Request-ID', timer.getRequestId());
    timedResponse.headers.set('Server-Timing', formatServerTiming(timer.finalize()));

    return timedResponse;
  };
}

/**
 * Format timings as Server-Timing header value.
 * Visible in browser DevTools Network tab.
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

## Integration Example

Using RequestTimer in handlers:

```typescript
import { getRequestTimer } from './middleware/timingMiddleware';

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
}
```

Timing D1 operations:

```typescript
async findAll(request?: Request): Promise<Task[]> {
  const timer = request ? getRequestTimer(request) : undefined;

  const results = await timer?.timePhase('d1:findAll', async () => {
    return this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all<TaskRow>();
  }) ?? await this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all<TaskRow>();

  return results.results.map((row) => this.toDomain(row));
}
```

## Testing

For testing RequestTimer with fake timers, see [testing-observability.md](./testing-observability.md).

Key testing pattern:

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('tracks phase duration', () => {
  const timer = new RequestTimer();
  timer.startPhase('database');
  vi.advanceTimersByTime(100);
  const duration = timer.endPhase('database');
  expect(duration).toBe(100);
});
```

## Related

- [slo-tracking.md](./slo-tracking.md) — Request timings feed into latency SLOs
- [analytics-engine.md](./analytics-engine.md) — Persisting timing data
- [testing-observability.md](./testing-observability.md) — Testing with fake timers
