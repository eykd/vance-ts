# Skill File Template: SKILL.md

This template defines the structure for the main SKILL.md file.

## Template

````markdown
---
name: cloudflare-observability
description: 'Use when: (1) defining SLOs for Cloudflare Workers, (2) adding request timing/metrics, (3) implementing health endpoints, (4) tracking errors by category, (5) integrating with Analytics Engine, (6) writing observability tests.'
---

# Cloudflare Observability for Workers

## Quick Decision: Do You Need This?

Use this skill when building observability for Cloudflare Workers:

- **Starting a new Worker?** → Begin with [SLO definitions](#slo-first)
- **Adding metrics to existing Worker?** → See [Pattern Selection](#pattern-selection)
- **Debugging performance issues?** → Start with [request-timing.md](references/request-timing.md)

## SLO-First Philosophy

Observability is not about collecting data—it's about answering questions. Define what "good" means before instrumenting:

| Signal     | Cloudflare Implementation                      |
| ---------- | ---------------------------------------------- |
| Latency    | Request duration from Worker entry to response |
| Traffic    | Requests per second by endpoint                |
| Errors     | HTTP 5xx rate + application failures           |
| Saturation | CPU time approaching limits                    |

## Pattern Selection

| I need to...               | Use pattern         | Reference                                                       |
| -------------------------- | ------------------- | --------------------------------------------------------------- |
| Define reliability targets | SLO/SLI definitions | [slo-tracking.md](references/slo-tracking.md)                   |
| Measure request latency    | RequestTimer        | [request-timing.md](references/request-timing.md)               |
| Categorize errors for SLOs | ErrorTracker        | [error-tracking.md](references/error-tracking.md)               |
| Add health checks          | HealthChecker       | [health-endpoints.md](references/health-endpoints.md)           |
| Persist metrics            | Analytics Engine    | [analytics-engine.md](references/analytics-engine.md)           |
| Test observability code    | Mock patterns       | [testing-observability.md](references/testing-observability.md) |

## Minimal Examples

### Request Timing

```typescript
const timer = new RequestTimer();
timer.startPhase('database');
const result = await db.query(...);
timer.endPhase('database');
const timings = timer.finalize();
```
````

### Health Check

```typescript
const checker = new HealthChecker({ version: '1.0.0' });
checker.addDependency(new D1HealthCheck(env.DB));
const result = await checker.checkReadiness(['d1']);
```

### Error Categorization

```typescript
const tracked = tracker.track(error, { statusCode: 500 });
const countsAgainstSLO = tracker.countsAgainstSLO(tracked);
// true for SERVER_ERROR, TIMEOUT, DEPENDENCY_FAILURE
```

## Detailed References

- **[slo-tracking.md](references/slo-tracking.md)** — SLI/SLO definitions, error budgets, burn rate alerting
- **[request-timing.md](references/request-timing.md)** — RequestTimer class, phase timing, Server-Timing headers
- **[error-tracking.md](references/error-tracking.md)** — ErrorTracker, categorization, SLO impact determination
- **[health-endpoints.md](references/health-endpoints.md)** — Liveness/readiness/detailed endpoints, dependency checks
- **[analytics-engine.md](references/analytics-engine.md)** — Metrics persistence, SQL queries, dashboards
- **[testing-observability.md](references/testing-observability.md)** — Testing patterns for observability code

## Related Skills

- **[typescript-unit-testing](../typescript-unit-testing/SKILL.md)** — General TDD patterns
- **[vitest-cloudflare-config](../vitest-cloudflare-config/SKILL.md)** — Workers test environment setup

```

## Validation Checklist

- [ ] Frontmatter includes name and description
- [ ] Description starts with "Use when:"
- [ ] Total lines < 150
- [ ] All 6 reference files linked
- [ ] Pattern Selection table covers all user stories
- [ ] Minimal examples are 3-5 lines each
- [ ] Related skills cross-referenced
```
