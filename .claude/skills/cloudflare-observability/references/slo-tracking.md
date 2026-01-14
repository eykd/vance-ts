# SLO Tracking

## Overview

Service Level Objectives (SLOs) are reliability targets that define what "good" means for your users. This reference covers SLI/SLO definitions, error budget calculation, burn rate alerting, and the SLOTracker class implementation for Cloudflare Workers.

**Use this reference when**: defining reliability targets, calculating error budgets, or implementing burn rate alerting.

## Core Concepts

### SLI → SLO → SLA Hierarchy

Understanding the relationship:

- **Service Level Indicator (SLI)**: A metric. "The proportion of requests completing in < 500ms"
- **Service Level Objective (SLO)**: A target. "99% of requests should complete in < 500ms"
- **Service Level Agreement (SLA)**: A contract. "We guarantee 99% of requests in < 500ms, or credit your account"

### The Four Golden Signals

Google's SRE book identifies four key metrics. For Cloudflare Workers:

| Signal         | Cloudflare Implementation                         |
| -------------- | ------------------------------------------------- |
| **Latency**    | Request duration from Worker entry to response    |
| **Traffic**    | Requests per second by endpoint                   |
| **Errors**     | HTTP 5xx rate, plus application-specific failures |
| **Saturation** | CPU time approaching limits, subrequest counts    |

### The Error Budget Mental Model

An SLO is a target reliability level. If your SLO is 99.9% availability, you have a 0.1% error budget—the amount of unreliability you can "spend" before users are impacted beyond acceptable levels.

```text
Monthly Error Budget Calculation:

SLO: 99.9% availability
Total minutes in month: 43,200 (30 days)
Error budget: 43,200 × 0.001 = 43.2 minutes of downtime

If you've used 30 minutes by day 15, you've consumed 69% of your budget
at 50% of the time period—you're burning too fast.
```

## Implementation Patterns

### SLODefinition Interface

**Purpose**: Define the structure of an SLO with its indicator and target.

```typescript
/**
 * Defines a Service Level Objective with its measurement criteria.
 */
export interface SLODefinition {
  /** Human-readable name for the SLO */
  name: string;
  /** Description of what this SLO measures */
  description: string;
  /** Target percentage as decimal (e.g., 0.999 for 99.9%) */
  target: number;
  /** Time window for measurement */
  window: {
    /** Duration in milliseconds */
    duration: number;
    /** Rolling (sliding) or calendar (fixed periods) */
    type: 'rolling' | 'calendar';
  };
  /** The indicator that determines if an event is "good" */
  indicator: {
    type: 'availability' | 'latency' | 'throughput' | 'custom';
    /** For latency SLOs: maximum acceptable milliseconds */
    threshold?: number;
    /** Predicate function to determine if event meets SLO */
    good: (event: SLIEvent) => boolean;
  };
}

/**
 * Represents a single event that may affect SLO measurement.
 */
export interface SLIEvent {
  timestamp: Date;
  requestId: string;
  latencyMs: number;
  success: boolean;
  metadata: Record<string, string | number>;
}
```

### Example SLO Definitions

**Purpose**: Show practical SLO configurations for common scenarios.

```typescript
/**
 * Application SLO definitions.
 */
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
      good: (event: SLIEvent): boolean => event.success,
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
      good: (event: SLIEvent): boolean => event.latencyMs < 500,
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
      good: (event: SLIEvent): boolean => event.success && event.latencyMs < 1000,
    },
  },
};
```

### SLOStatus Interface

**Purpose**: Represent the current state of an SLO including error budget status.

```typescript
/**
 * Current status of an SLO including error budget and burn rate.
 */
export interface SLOStatus {
  name: string;
  target: number;
  /** Current percentage as decimal (e.g., 0.995 = 99.5%) */
  current: number;
  totalEvents: number;
  goodEvents: number;
  errorBudget: {
    /** Total error budget (1 - target) */
    total: number;
    /** Remaining error budget */
    remaining: number;
    /** Percentage of budget consumed */
    consumedPercent: number;
  };
  burnRate: {
    /** Current burn rate multiplier */
    current: number;
    /** Whether burn rate exceeds alerting threshold */
    isAlerting: boolean;
  };
}
```

### SLOTracker Class

**Purpose**: Track SLI events and calculate SLO status with error budgets and burn rates.

```typescript
/**
 * Tracks SLI events and calculates SLO status.
 * Implements multi-window, multi-burn-rate alerting.
 */
export class SLOTracker {
  private events: Map<string, SLIEvent[]> = new Map();

  constructor(private readonly definitions: Record<string, SLODefinition>) {
    for (const name of Object.keys(definitions)) {
      this.events.set(name, []);
    }
  }

  /**
   * Record an event that may affect one or more SLOs.
   * @param event - The SLI event to record
   * @param sloNames - Specific SLOs to record for (defaults to all)
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
   * @param sloName - The SLO to get status for
   * @returns SLO status or null if not found
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
    const errorBudgetTotal = 1 - definition.target;
    const errorRate = 1 - current;
    const errorBudgetRemaining = Math.max(0, errorBudgetTotal - errorRate);
    const errorBudgetConsumed =
      errorBudgetTotal > 0
        ? ((errorBudgetTotal - errorBudgetRemaining) / errorBudgetTotal) * 100
        : 0;

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
   * Get status for all configured SLOs.
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
   * Calculate burn rate using multi-window alerting.
   * Short window (5min) catches acute issues.
   * Long window (1hr) confirms sustained problems.
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
    const expectedErrorRatePerWindow = errorBudget / (definition.window.duration / shortWindowMs);
    const currentBurnRate =
      expectedErrorRatePerWindow > 0 ? shortErrorRate / expectedErrorRatePerWindow : 0;

    // Multi-window alerting thresholds
    // Short burn > 14.4 (consumes 2% budget in 5 min at 30-day window)
    // AND long burn > 6 (confirms not just noise)
    const shortBurnThreshold = 14.4;
    const longBurnThreshold = 6;

    const isAlerting =
      currentBurnRate > shortBurnThreshold &&
      longErrorRate / expectedErrorRatePerWindow > longBurnThreshold;

    return { current: currentBurnRate, isAlerting };
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

## Integration Example

Complete example showing SLO tracking in a Worker handler:

```typescript
import { SLOTracker, SLOs, SLIEvent } from './slo';

// Initialize tracker (typically done once at Worker startup)
const sloTracker = new SLOTracker(SLOs);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    let success = true;

    try {
      const response = await handleRequest(request, env);
      success = response.status < 500;
      return response;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      // Record SLI event (non-blocking)
      ctx.waitUntil(
        Promise.resolve().then(() => {
          const event: SLIEvent = {
            timestamp: new Date(),
            requestId,
            latencyMs: Date.now() - startTime,
            success,
            metadata: {
              path: new URL(request.url).pathname,
              method: request.method,
            },
          };
          sloTracker.recordEvent(event);
        })
      );
    }
  },
};
```

## Testing

For testing SLO tracking code, see [testing-observability.md](./testing-observability.md) for:

- Using `vi.useFakeTimers()` for time-dependent tests
- Testing error budget calculations
- Verifying burn rate alerting thresholds

## Related

- [error-tracking.md](./error-tracking.md) — Error categorization that feeds into SLO calculation
- [analytics-engine.md](./analytics-engine.md) — Persisting SLO metrics to Analytics Engine
- [typescript-unit-testing](../../typescript-unit-testing/SKILL.md) — General TDD patterns
