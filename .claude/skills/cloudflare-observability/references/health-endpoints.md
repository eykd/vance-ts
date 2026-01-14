# Health Endpoints

## Overview

Health endpoints provide operational visibility for load balancers, monitoring systems, and operations teams. This reference covers health check types, dependency checkers, the HealthChecker class, and endpoint handlers.

**Use this reference when**: implementing health routes, adding dependency checks, or debugging service availability issues.

## Core Concepts

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

### Health Status Levels

- **HEALTHY**: All systems operational
- **DEGRADED**: Some issues but still functional
- **UNHEALTHY**: Cannot serve traffic reliably

## Implementation Patterns

### HealthStatus Enum and Interfaces

**Purpose**: Define health check types and result structures.

```typescript
/**
 * Possible health states for a service or dependency.
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

/**
 * Health status for a single dependency.
 */
export interface DependencyHealth {
  name: string;
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
  lastChecked: Date;
}

/**
 * Complete health check result.
 */
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: Date;
  version?: string;
  uptime?: number;
  dependencies?: DependencyHealth[];
}
```

### DependencyChecker Interface

**Purpose**: Define contract for dependency health checks.

```typescript
/**
 * Interface for dependency health checkers.
 * Implement this for each dependency type (D1, KV, HTTP, etc.).
 */
export interface DependencyChecker {
  name: string;
  check(): Promise<DependencyHealth>;
}
```

### D1HealthCheck Class

**Purpose**: Check D1 database connectivity.

```typescript
/**
 * Health check for D1 database.
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
```

### KVHealthCheck Class

**Purpose**: Check KV namespace connectivity with write/read verification.

```typescript
/**
 * Health check for KV namespace.
 * Performs write then read to verify full functionality.
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
```

### HttpHealthCheck Class

**Purpose**: Check external HTTP endpoint availability.

```typescript
/**
 * Health check for external HTTP endpoints.
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

### HealthChecker Class

**Purpose**: Orchestrate multiple dependency checks with different check levels.

```typescript
export interface HealthCheckerOptions {
  version?: string;
  startTime?: Date;
}

/**
 * Orchestrates health checks across multiple dependencies.
 */
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
   * Always returns healthy if we can respond.
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
   * @param criticalDependencies - Names of dependencies that must be healthy
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
   * Check all registered dependencies in parallel.
   */
  private async checkAllDependencies(): Promise<DependencyHealth[]> {
    const results = await Promise.all(this.dependencies.map((checker) => checker.check()));
    return results;
  }

  /**
   * Calculate overall status from dependency statuses.
   * UNHEALTHY beats DEGRADED beats HEALTHY.
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

### Health Endpoint Handlers

**Purpose**: HTTP handlers for different health check levels.

```typescript
import { HealthChecker } from './HealthChecker';
import { HealthStatus, HealthCheckResult } from './types';

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
}
```

## Integration Example

Setting up health routes in a Worker:

```typescript
import { HealthHandlers } from './handlers/HealthHandlers';
import { HealthChecker } from './health/HealthChecker';
import { D1HealthCheck, KVHealthCheck } from './health/DependencyCheck';

export function createRouter(env: Env): Router {
  // Set up health checker
  const healthChecker = new HealthChecker({
    version: '1.0.0',
  });

  healthChecker.addDependency(new D1HealthCheck(env.DB));
  healthChecker.addDependency(new KVHealthCheck(env.SESSIONS, 'sessions'));

  const healthHandlers = new HealthHandlers(healthChecker);

  // Register routes
  const router = new Router();

  router.get('/health', (req) => healthHandlers.handleSimple(req));
  router.get('/health/live', (req) => healthHandlers.handleLiveness(req));
  router.get('/health/ready', (req) => healthHandlers.handleReadiness(req));
  router.get('/health/detailed', (req) => healthHandlers.handleDetailed(req));

  return router;
}
```

## Testing

For testing HealthChecker with mock dependencies, see [testing-observability.md](./testing-observability.md).

Key mock pattern:

```typescript
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

it('returns unhealthy when any dependency unhealthy', async () => {
  checker.addDependency(createMockDependency('db', HealthStatus.HEALTHY));
  checker.addDependency(createMockDependency('cache', HealthStatus.UNHEALTHY));

  const result = await checker.checkReadiness();

  expect(result.status).toBe(HealthStatus.UNHEALTHY);
});
```

## Related

- [slo-tracking.md](./slo-tracking.md) — Health status affects availability SLOs
- [analytics-engine.md](./analytics-engine.md) — Persisting health check results
- [testing-observability.md](./testing-observability.md) — Testing health checks
- [d1-repository-implementation](../../d1-repository-implementation/SKILL.md) — D1 patterns (don't duplicate)
