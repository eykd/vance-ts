# Error Tracking

## Overview

Error tracking categorizes errors to distinguish between those that impact SLOs (server errors, timeouts, dependency failures) and those that don't (client errors, validation errors). This reference covers the ErrorTracker class, categorization logic, and SLO impact determination.

**Use this reference when**: implementing error handling, categorizing errors for alerting, or determining SLO impact.

## Core Concepts

### Error Classification

Not all errors are equal. A 404 is not an error—it's a valid response to a bad request. A 500 indicates something wrong with our system.

| Category           | HTTP Status | SLO Impact | Example                             |
| ------------------ | ----------- | ---------- | ----------------------------------- |
| Client Error       | 4xx         | None       | 404 Not Found, 400 Bad Request      |
| Server Error       | 5xx         | Yes        | 500 Internal Error, 503 Unavailable |
| Timeout            | N/A         | Yes        | Request exceeded time limit         |
| Dependency Failure | 5xx         | Yes        | D1 unavailable, external API down   |

### SLO Impact Principle

Only errors that represent failures in **our system** count against SLOs:

- **Counts**: Server errors, timeouts, dependency failures
- **Doesn't count**: Client errors (user's fault), validation errors (bad input), authentication errors (invalid credentials)

## Implementation Patterns

### ErrorCategory Enum

**Purpose**: Define all possible error categories for classification.

```typescript
/**
 * Categories for error classification.
 * Used to determine SLO impact and alerting.
 */
export enum ErrorCategory {
  CLIENT_ERROR = 'client_error',
  SERVER_ERROR = 'server_error',
  TIMEOUT = 'timeout',
  DEPENDENCY_FAILURE = 'dependency_failure',
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
}
```

### TrackedError and ErrorSummary Interfaces

**Purpose**: Define the structure for tracked errors and summaries.

```typescript
/**
 * Represents a tracked error occurrence.
 */
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

/**
 * Summary of tracked errors for reporting.
 */
export interface ErrorSummary {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  serverErrorRate: number;
  recentErrors: TrackedError[];
}
```

### ErrorTracker Class

**Purpose**: Track and categorize errors, calculate error rates, determine SLO impact.

```typescript
/**
 * Tracks errors and categorizes them for SLO measurement.
 */
export class ErrorTracker {
  private errors: TrackedError[] = [];
  private readonly maxStoredErrors: number;
  private totalRequests = 0;

  constructor(options: { maxStoredErrors?: number } = {}) {
    this.maxStoredErrors = options.maxStoredErrors ?? 100;
  }

  /**
   * Track an error occurrence.
   * @param error - The error to track (Error object or any value)
   * @param context - Additional context (requestId, path, statusCode, etc.)
   * @returns The tracked error record
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

    // Trim old errors to prevent memory growth
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

    // Default to server error for unknown errors
    return ErrorCategory.SERVER_ERROR;
  }

  /**
   * Check if an error should count against SLO.
   * Only server-side failures impact SLOs.
   * @param error - The tracked error to check
   * @returns true if error counts against SLO
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

### Error Middleware

**Purpose**: Wrap handlers to automatically track errors and return appropriate responses.

```typescript
import { ErrorTracker, TrackedError } from '../metrics/ErrorTracker';
import { getRequestTimer } from './timingMiddleware';

export interface ErrorMiddlewareOptions {
  tracker: ErrorTracker;
  onError?: (error: TrackedError) => void;
  includeStackInResponse?: boolean;
}

/**
 * Create error middleware that tracks and handles errors.
 */
export function createErrorMiddleware(options: ErrorMiddlewareOptions) {
  return async (
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    next: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
  ): Promise<Response> => {
    const timer = getRequestTimer(request);
    const url = new URL(request.url);

    try {
      const response = await next(request, env, ctx);

      // Track non-2xx responses as potential errors
      if (response.status >= 400) {
        const tracked = options.tracker.track(new Error(`HTTP ${response.status}`), {
          requestId: timer?.getRequestId(),
          path: url.pathname,
          method: request.method,
          statusCode: response.status,
        });

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

      return new Response(
        JSON.stringify({
          error: true,
          message: error instanceof Error ? error.message : 'Internal server error',
          requestId: timer?.getRequestId(),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}
```

## Integration Example

Complete error tracking setup:

```typescript
import { ErrorTracker } from './metrics/ErrorTracker';
import { createErrorMiddleware } from './middleware/errorMiddleware';

// Initialize tracker
const errorTracker = new ErrorTracker({ maxStoredErrors: 100 });

// Create middleware
const errorMiddleware = createErrorMiddleware({
  tracker: errorTracker,
  onError: (tracked) => {
    // Send to Analytics Engine
    if (errorTracker.countsAgainstSLO(tracked)) {
      console.error('SLO-impacting error:', tracked.message);
    }
  },
});

// In handler
async function handleRequest(request: Request): Promise<Response> {
  try {
    // ... business logic
  } catch (error) {
    const tracked = errorTracker.track(error, {
      path: new URL(request.url).pathname,
      statusCode: 500,
    });

    // Only alert on SLO-impacting errors
    if (errorTracker.countsAgainstSLO(tracked)) {
      // Send alert
    }

    throw error;
  }
}
```

## Testing

For testing ErrorTracker categorization, see [testing-observability.md](./testing-observability.md).

Key test patterns:

```typescript
it('categorizes timeout errors', () => {
  const tracked = tracker.track(new Error('Request timed out'));
  expect(tracked.category).toBe(ErrorCategory.TIMEOUT);
});

it('returns true for SLO-impacting errors', () => {
  const tracked = tracker.track(new Error('Server error'), { statusCode: 500 });
  expect(tracker.countsAgainstSLO(tracked)).toBe(true);
});

it('returns false for client errors', () => {
  const tracked = tracker.track(new Error('Bad request'), { statusCode: 400 });
  expect(tracker.countsAgainstSLO(tracked)).toBe(false);
});
```

## Related

- [slo-tracking.md](./slo-tracking.md) — Error tracking feeds into SLO calculation
- [analytics-engine.md](./analytics-engine.md) — Persisting error data
- [testing-observability.md](./testing-observability.md) — Testing error categorization
