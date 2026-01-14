# Data Model: Cloudflare Observability Skill

**Feature**: 002-observability-skills
**Date**: 2026-01-14

## Overview

This document defines the structure and content organization for the `cloudflare-observability` Claude Code skill. Since this is a documentation project (not executable code), the "data model" describes the file structure and content relationships.

## File Structure

### SKILL.md (Main Entry Point)

```yaml
Location: .claude/skills/cloudflare-observability/SKILL.md
Max Lines: 150
Purpose: Decision-tree navigation to appropriate reference
```

**Required Sections**:
| Section | Purpose | Estimated Lines |
|---------|---------|-----------------|
| Frontmatter | name, description | 5 |
| Quick Decision | "Do I need this skill?" criteria | 15 |
| Pattern Selection | Table mapping need → pattern → reference | 25 |
| SLO Philosophy | Core concept (measure what matters) | 15 |
| Minimal Examples | 3 code snippets (timing, health, error) | 45 |
| Detailed References | Links to 6 reference files | 15 |
| **Total** | | ~120 |

### Reference Files

```yaml
Location: .claude/skills/cloudflare-observability/references/
Count: 6 files
Purpose: Complete implementation patterns with code
```

#### slo-tracking.md

**Content Focus**: SLI/SLO definitions, error budget math, burn rate alerting

| Entity        | Fields/Properties                                                        |
| ------------- | ------------------------------------------------------------------------ |
| SLODefinition | name, description, target (0-1), window.duration, window.type, indicator |
| SLIEvent      | timestamp, requestId, latencyMs, success, metadata                       |
| SLOStatus     | name, target, current, totalEvents, goodEvents, errorBudget, burnRate    |
| ErrorBudget   | total, remaining, consumedPercent                                        |

**Code Patterns**:

- SLO definition examples (availability, latency, throughput)
- Error budget calculation formula
- Burn rate multi-window alerting logic
- SLOTracker class implementation

#### request-timing.md

**Content Focus**: RequestTimer class, phase timing, middleware, Server-Timing

| Entity         | Fields/Properties                                |
| -------------- | ------------------------------------------------ |
| TimingPhase    | name, startTime, endTime?, duration?             |
| RequestTimings | requestId, totalDuration, phases (Map), metadata |
| RequestTimer   | requestId, startTime, phases, metadata           |

**Code Patterns**:

- RequestTimer class with startPhase/endPhase/timePhase/finalize
- Timing middleware factory
- getRequestTimer() retrieval pattern
- Server-Timing header formatting

#### error-tracking.md

**Content Focus**: Error categorization, SLO impact, tracking

| Entity        | Fields/Properties                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| ErrorCategory | CLIENT_ERROR, SERVER_ERROR, TIMEOUT, DEPENDENCY_FAILURE, VALIDATION_ERROR, AUTHENTICATION_ERROR, AUTHORIZATION_ERROR |
| TrackedError  | id, timestamp, category, message, stack?, metadata, requestId?, path?, method?, statusCode?                          |
| ErrorSummary  | total, byCategory, serverErrorRate, recentErrors                                                                     |

**Code Patterns**:

- ErrorTracker class with track/recordRequest/getSummary
- Error categorization logic (by message content, status code)
- countsAgainstSLO() method
- Error middleware integration

#### health-endpoints.md

**Content Focus**: Health check types, dependency checks, handlers

| Entity            | Fields/Properties                                   |
| ----------------- | --------------------------------------------------- |
| HealthStatus      | HEALTHY, DEGRADED, UNHEALTHY                        |
| DependencyHealth  | name, status, latencyMs?, message?, lastChecked     |
| HealthCheckResult | status, timestamp, version?, uptime?, dependencies? |
| DependencyChecker | name, check() → Promise<DependencyHealth>           |

**Code Patterns**:

- HealthChecker class with checkLiveness/checkReadiness/checkDetailed
- D1HealthCheck implementation
- KVHealthCheck implementation
- HttpHealthCheck implementation
- Health endpoint handlers (simple, live, ready, detailed)

#### analytics-engine.md

**Content Focus**: Metrics persistence, SQL queries, dashboards

| Entity                 | Fields/Properties                         |
| ---------------------- | ----------------------------------------- |
| MetricDataPoint        | timestamp, name, value, labels, metadata? |
| AnalyticsEngineAdapter | dataset reference                         |

**Code Patterns**:

- writeDataPoint for requests, errors, health, SLOs
- Blob/double/index field mapping
- SQL queries: latency percentiles, error rates, request trends
- Dashboard query examples

#### testing-observability.md

**Content Focus**: Testing patterns specific to observability code

| Entity                | Fields/Properties                          |
| --------------------- | ------------------------------------------ |
| MockDependencyChecker | Vitest mock implementing DependencyChecker |
| FakeTimer             | vi.useFakeTimers() patterns                |

**Code Patterns**:

- Testing RequestTimer with fake timers
- Testing ErrorTracker categorization
- Testing HealthChecker with mock dependencies
- Testing middleware in isolation
- Cross-reference to typescript-unit-testing
- Cross-reference to vitest-cloudflare-config

## Content Relationships

```
SKILL.md (decision tree)
    │
    ├── slo-tracking.md ◄──────┐
    │       │                   │
    │       └── references error-tracking.md (SLO impact)
    │
    ├── request-timing.md ◄────┤
    │       │                   │
    │       └── feeds data to slo-tracking.md
    │
    ├── error-tracking.md ◄────┤
    │       │                   │
    │       └── categorizes for slo-tracking.md
    │
    ├── health-endpoints.md
    │       │
    │       └── uses dependency patterns (no d1-repo duplication)
    │
    ├── analytics-engine.md
    │       │
    │       └── persists data from all other patterns
    │
    └── testing-observability.md
            │
            ├── cross-refs typescript-unit-testing
            └── cross-refs vitest-cloudflare-config
```

## Validation Rules

| Rule               | Applies To        | Validation                                  |
| ------------------ | ----------------- | ------------------------------------------- |
| Line limit         | SKILL.md          | Must be <150 lines                          |
| TypeScript strict  | All code examples | Explicit return types, no `any`             |
| Workers-compatible | All code examples | ES2022, no Node.js APIs                     |
| Self-contained     | Reference files   | Each file usable independently              |
| No duplication     | All files         | Don't repeat d1-repo, vitest-config content |
