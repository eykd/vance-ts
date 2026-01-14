# Testing Observability Code

## Overview

Observability code is infrastructure code—it should be tested like any other code. This reference covers testing patterns for RequestTimer, ErrorTracker, HealthChecker, and observability middleware.

**Use this reference when**: writing tests for observability code, mocking dependencies, or testing time-dependent behavior.

## Core Concepts

### Testing Strategies

1. **Unit test metric calculations**: Verify timers, error categorization, SLO math
2. **Unit test middleware in isolation**: Mock dependencies, verify correct calls
3. **Integration test data flow**: Verify metrics reach Analytics Engine
4. **Acceptance test health endpoints**: Verify correct HTTP responses

### Key Testing Tools

- `vi.useFakeTimers()` — Control time for timing tests
- `vi.fn()` — Create mock functions for dependencies
- `vi.clearAllMocks()` — Reset mocks between tests

## Implementation Patterns

### Testing RequestTimer with Fake Timers

**Purpose**: Test timing behavior without real-time delays.

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestTimer } from './RequestTimer';

describe('RequestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('auto-ends unclosed phases on finalize', () => {
    const timer = new RequestTimer();
    timer.startPhase('unclosed');
    vi.advanceTimersByTime(75);

    const timings = timer.finalize();

    expect(timings.phases.get('unclosed')?.duration).toBe(75);
  });

  it('timePhase ends phase even when function throws', async () => {
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
```

### Testing ErrorTracker Categorization

**Purpose**: Verify error categorization and SLO impact determination.

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorTracker, ErrorCategory } from './ErrorTracker';

describe('ErrorTracker', () => {
  let tracker: ErrorTracker;

  beforeEach(() => {
    tracker = new ErrorTracker({ maxStoredErrors: 10 });
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

  describe('error rate calculation', () => {
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

### Testing HealthChecker with Mock Dependencies

**Purpose**: Test health check orchestration without real services.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthChecker } from './HealthChecker';
import { HealthStatus } from './types';
import { DependencyChecker } from './DependencyCheck';

/**
 * Create a mock dependency checker for testing.
 */
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
      checker.addDependency(createMockDependency('db', HealthStatus.HEALTHY));

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
    it('calculates overall status correctly', async () => {
      checker.addDependency(createMockDependency('a', HealthStatus.HEALTHY));
      checker.addDependency(createMockDependency('b', HealthStatus.DEGRADED));

      const result = await checker.checkDetailed();

      expect(result.status).toBe(HealthStatus.DEGRADED);
    });

    it('unhealthy beats degraded', async () => {
      checker.addDependency(createMockDependency('a', HealthStatus.DEGRADED));
      checker.addDependency(createMockDependency('b', HealthStatus.UNHEALTHY));

      const result = await checker.checkDetailed();

      expect(result.status).toBe(HealthStatus.UNHEALTHY);
    });
  });
});
```

### Testing D1 and KV Health Checks

**Purpose**: Test dependency checkers with mocked bindings.

```typescript
import { describe, it, expect, vi } from 'vitest';
import { D1HealthCheck, KVHealthCheck } from './DependencyCheck';
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
```

### Testing Middleware in Isolation

**Purpose**: Test middleware without a full Worker.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTimingMiddleware } from './timingMiddleware';

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

  it('adds Server-Timing header to response', async () => {
    const request = new Request('https://example.com/test');
    const mockNext = vi.fn().mockResolvedValue(new Response('OK'));
    const mockCtx = {
      waitUntil: vi.fn(),
    } as unknown as ExecutionContext;

    const response = await middleware(request, {} as Env, mockCtx, mockNext);

    expect(response.headers.get('Server-Timing')).toContain('total;dur=');
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
});
```

### Testing SLOTracker with Time Windows

**Purpose**: Test SLO event pruning and window calculations.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SLOTracker } from './SLOTracker';
import { SLODefinition, SLIEvent } from './definitions';

describe('SLOTracker event pruning', () => {
  it('removes events outside the window', () => {
    vi.useFakeTimers();

    const testSLO: Record<string, SLODefinition> = {
      availability: {
        name: 'Test',
        description: 'Test SLO',
        target: 0.99,
        window: {
          duration: 60 * 60 * 1000, // 1 hour
          type: 'rolling',
        },
        indicator: {
          type: 'availability',
          good: (event: SLIEvent) => event.success,
        },
      },
    };

    const tracker = new SLOTracker(testSLO);

    // Add event at time 0
    tracker.recordEvent({
      timestamp: new Date(),
      requestId: 'old',
      latencyMs: 100,
      success: true,
      metadata: {},
    });

    // Advance past window
    vi.advanceTimersByTime(2 * 60 * 60 * 1000); // 2 hours

    // Add another event
    tracker.recordEvent({
      timestamp: new Date(),
      requestId: 'new',
      latencyMs: 100,
      success: true,
      metadata: {},
    });

    const status = tracker.getStatus('availability');

    // Only the recent event should be counted
    expect(status?.totalEvents).toBe(1);

    vi.useRealTimers();
  });
});
```

## Related Skills

- **[typescript-unit-testing](../../typescript-unit-testing/SKILL.md)** — General TDD principles and patterns
- **[vitest-cloudflare-config](../../vitest-cloudflare-config/SKILL.md)** — Workers test environment setup
