# Analytics Engine Integration

## Overview

Cloudflare Analytics Engine is a native time-series data store optimized for high-volume metrics. This reference covers the writeDataPoint API, field mapping conventions, SQL query patterns, and the AnalyticsEngineAdapter class.

**Use this reference when**: persisting metrics to Analytics Engine, querying latency percentiles, or building dashboards.

## Core Concepts

### Analytics Engine Field Types

Analytics Engine accepts three types of fields:

| Field Type  | Purpose                                        | Example                     |
| ----------- | ---------------------------------------------- | --------------------------- |
| **blobs**   | String data (paths, IDs, categories)           | `[requestId, path, method]` |
| **doubles** | Numeric data (latency, counts)                 | `[durationMs, statusCode]`  |
| **indexes** | Queryable dimensions (for efficient filtering) | `[path]`                    |

### wrangler.toml Configuration

```toml
[[analytics_engine_datasets]]
binding = "METRICS"
dataset = "worker_metrics"
```

### TypeScript Binding

```typescript
interface Env {
  METRICS: AnalyticsEngineDataset;
}
```

## Implementation Patterns

### MetricDataPoint Interface

**Purpose**: Generic metric structure for reporting.

```typescript
/**
 * Generic metric data point for reporting.
 */
export interface MetricDataPoint {
  timestamp: Date;
  name: string;
  value: number;
  labels: Record<string, string>;
  metadata?: Record<string, string | number>;
}
```

### AnalyticsEngineAdapter Class

**Purpose**: Provide type-safe wrappers around writeDataPoint.

```typescript
/**
 * Adapter for writing metrics to Analytics Engine.
 * Provides type-safe methods for common metric types.
 */
export class AnalyticsEngineAdapter {
  constructor(private readonly dataset: AnalyticsEngineDataset) {}

  /**
   * Write a request timing metric.
   * @param requestId - Unique request identifier
   * @param path - Request path
   * @param method - HTTP method
   * @param durationMs - Request duration in milliseconds
   * @param statusCode - HTTP response status code
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
   * @param requestId - Unique request identifier
   * @param path - Request path
   * @param errorCategory - Error category from ErrorTracker
   * @param errorMessage - Error message (truncated to 256 chars)
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
   * @param dependencyName - Name of the dependency checked
   * @param status - Health status (healthy, degraded, unhealthy)
   * @param latencyMs - Check latency in milliseconds
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
   * @param sloName - Name of the SLO
   * @param current - Current SLO value (0-1)
   * @param target - Target SLO value (0-1)
   * @param errorBudgetRemainingPercent - Remaining error budget percentage
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

### Direct writeDataPoint Usage

**Purpose**: Show raw API usage for custom metrics.

```typescript
// Write request metric directly
env.METRICS.writeDataPoint({
  blobs: [pathname, method],
  doubles: [durationMs, statusCode],
  indexes: [requestId],
});

// Important: Use ctx.waitUntil to not block response
ctx.waitUntil(
  Promise.resolve().then(() => {
    env.METRICS.writeDataPoint({
      blobs: [pathname, method, new Date().toISOString()],
      doubles: [durationMs, statusCode],
      indexes: [pathname],
    });
  })
);
```

## SQL Query Examples

Analytics Engine data can be queried via the Cloudflare API.

> **Security Note**: When building SQL queries dynamically, always validate and sanitize user inputs to prevent SQL injection. Numeric parameters should be validated as integers within expected ranges. String parameters (like dataset names) should be validated against an allowlist of known values when possible.

### Latency Percentiles

```sql
SELECT
  quantileExact(0.5)(double1) as p50,
  quantileExact(0.95)(double1) as p95,
  quantileExact(0.99)(double1) as p99
FROM worker_metrics
WHERE timestamp > now() - interval '24' hour
```

### Error Rates by Endpoint

```sql
SELECT
  blob2 as path,
  countIf(double2 >= 500) as errors,
  count(*) as total,
  countIf(double2 >= 500) / count(*) as error_rate
FROM worker_metrics
WHERE timestamp > now() - interval '1' hour
GROUP BY blob2
ORDER BY error_rate DESC
```

### Request Trends per Minute

```sql
SELECT
  toStartOfMinute(timestamp) as minute,
  count(*) as requests,
  avg(double1) as avg_latency
FROM worker_metrics
WHERE timestamp > now() - interval '1' hour
GROUP BY minute
ORDER BY minute
```

### Slow Request Identification

```sql
SELECT
  blob1 as request_id,
  blob2 as path,
  blob3 as method,
  double1 as latency_ms,
  double2 as status_code
FROM worker_metrics
WHERE timestamp > now() - interval '1' hour
  AND double1 > 1000
ORDER BY double1 DESC
LIMIT 100
```

### Query via Workers

```typescript
/**
 * Query latency percentiles from Analytics Engine.
 * @param accountId - Cloudflare account ID
 * @param apiToken - API token with Analytics Engine read access
 * @param datasetName - Analytics Engine dataset name
 * @param hours - Time window in hours (validated to prevent SQL injection)
 * @throws Error if hours is invalid
 * @security Always validate inputs before interpolating into SQL queries
 */
async function getLatencyPercentiles(
  accountId: string,
  apiToken: string,
  datasetName: string,
  hours: number = 24
): Promise<{ p50: number; p95: number; p99: number }> {
  // Validate hours parameter to prevent SQL injection
  if (!Number.isInteger(hours) || hours < 0 || hours > 8760) {
    throw new Error('hours must be a positive integer <= 8760');
  }

  // Note: datasetName should also be validated/sanitized in production use
  // to prevent SQL injection if accepting from untrusted sources

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

## Integration Example

Complete metrics setup in a Worker:

```typescript
import { AnalyticsEngineAdapter } from './analytics/AnalyticsEngineAdapter';
import { RequestTimer } from './metrics/RequestTimer';
import { ErrorTracker } from './metrics/ErrorTracker';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const analytics = new AnalyticsEngineAdapter(env.METRICS);
    const timer = new RequestTimer();
    const url = new URL(request.url);

    try {
      const response = await handleRequest(request, env, timer);

      // Write metrics asynchronously
      ctx.waitUntil(
        Promise.resolve().then(() => {
          const timings = timer.finalize();
          analytics.writeRequestMetric(
            timings.requestId,
            url.pathname,
            request.method,
            timings.totalDuration,
            response.status
          );
        })
      );

      return response;
    } catch (error) {
      // Write error metric
      ctx.waitUntil(
        Promise.resolve().then(() => {
          analytics.writeErrorMetric(
            timer.getRequestId(),
            url.pathname,
            'server_error',
            error instanceof Error ? error.message : 'Unknown error'
          );
        })
      );
      throw error;
    }
  },
};
```

## Prometheus-Compatible Endpoint

For integration with Prometheus scraping:

```typescript
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

    lines.push(`# HELP slo_${safeName}_error_budget_remaining Remaining error budget`);
    lines.push(`# TYPE slo_${safeName}_error_budget_remaining gauge`);
    lines.push(`slo_${safeName}_error_budget_remaining ${status.errorBudget.remaining}`);
  }

  // Error metrics
  const errorSummary = this.errorTracker.getSummary();
  lines.push('# HELP errors_total Total errors by category');
  lines.push('# TYPE errors_total counter');
  for (const [category, count] of Object.entries(errorSummary.byCategory)) {
    lines.push(`errors_total{category="${category}"} ${count}`);
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

## Testing

Analytics Engine writes are fire-and-forget, so testing focuses on verifying the adapter is called correctly:

```typescript
it('writes request metric with correct fields', () => {
  const mockDataset = { writeDataPoint: vi.fn() };
  const adapter = new AnalyticsEngineAdapter(mockDataset);

  adapter.writeRequestMetric('req-123', '/api/tasks', 'GET', 150, 200);

  expect(mockDataset.writeDataPoint).toHaveBeenCalledWith({
    blobs: expect.arrayContaining(['req-123', '/api/tasks', 'GET']),
    doubles: [150, 200],
    indexes: ['/api/tasks'],
  });
});
```

## Related

- [slo-tracking.md](./slo-tracking.md) — SLO data to persist
- [request-timing.md](./request-timing.md) — Timing data to persist
- [error-tracking.md](./error-tracking.md) — Error data to persist
- [health-endpoints.md](./health-endpoints.md) — Health check results to persist
