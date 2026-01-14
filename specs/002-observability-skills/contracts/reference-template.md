# Reference File Template

This template defines the structure for reference files in the `references/` directory.

## Template Structure

````markdown
# [Topic Name]

## Overview

[2-3 sentence summary of what this reference covers and when to use it]

## Core Concepts

### [Concept 1]

[Explanation with code example]

### [Concept 2]

[Explanation with code example]

## Implementation Patterns

### [Pattern Name]

**Purpose**: [What problem this solves]

```typescript
// Full implementation with JSDoc and explicit types
```
````

### [Pattern Name 2]

**Purpose**: [What problem this solves]

```typescript
// Full implementation
```

## Integration Example

[Complete example showing how patterns work together]

## Testing

[Test patterns specific to this topic, or cross-reference to testing-observability.md]

## Related

- [Link to related reference within skill]
- [Link to related external skill if applicable]

```

## Required Sections by File

### slo-tracking.md
- SLI vs SLO vs SLA explanation
- SLODefinition interface
- Error budget calculation formula
- Burn rate alerting thresholds
- SLOTracker class implementation
- Example SLO definitions (availability, latency)

### request-timing.md
- TimingPhase and RequestTimings interfaces
- RequestTimer class (full implementation)
- Timing middleware factory
- Server-Timing header formatting
- Usage in handlers example

### error-tracking.md
- ErrorCategory enum with all values
- TrackedError and ErrorSummary interfaces
- ErrorTracker class (full implementation)
- Categorization logic explanation
- countsAgainstSLO() rationale

### health-endpoints.md
- HealthStatus enum
- DependencyHealth and HealthCheckResult interfaces
- DependencyChecker interface
- D1HealthCheck class
- KVHealthCheck class
- HttpHealthCheck class
- HealthChecker class
- Health endpoint handlers

### analytics-engine.md
- AnalyticsEngineDataset binding setup
- writeDataPoint field mapping (blobs, doubles, indexes)
- AnalyticsEngineAdapter class
- SQL query examples:
  - Latency percentiles
  - Error rates by endpoint
  - Request trends per minute
  - Slow request identification

### testing-observability.md
- vi.useFakeTimers() for RequestTimer tests
- Mock DependencyChecker pattern
- ErrorTracker test examples
- HealthChecker test examples
- Middleware testing in isolation
- Cross-references:
  - typescript-unit-testing for TDD principles
  - vitest-cloudflare-config for Workers setup

## Code Example Standards

All code examples MUST:

1. Use explicit return types
2. Include JSDoc for public methods
3. Be Workers-compatible (ES2022, no Node.js APIs)
4. Compile with strict TypeScript settings
5. Follow naming conventions from constitution
```
