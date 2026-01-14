# Log Categorization

**Use when:** Determining whether logs belong to domain, application, or infrastructure layers following Clean Architecture principles

## Overview

Clean Architecture organizes code into layers with distinct responsibilities. Logs must respect these boundaries to maintain system clarity and debugging efficiency. This skill provides a decision framework to route logs to the correct category based on what the code is doing and where it lives in the architecture.

## Decision Tree

### Need to Log a Business Event?

**When**: Recording something a stakeholder would care about - task completion, order placement, user registration

**Go to**: [references/domain-logging.md](./references/domain-logging.md)

### Need to Log Request Flow or Use Case Execution?

**When**: Tracking HTTP requests, validation failures, use case orchestration, or request lifecycle

**Go to**: [references/application-logging.md](./references/application-logging.md)

### Need to Log External System Interaction?

**When**: Recording database queries, cache operations, API calls, or infrastructure health

**Go to**: [references/infrastructure-logging.md](./references/infrastructure-logging.md)

### Not Sure Which Category?

**When**: Unclear where a log belongs or need quick decision guidance

**Go to**: [references/decision-matrix.md](./references/decision-matrix.md)

## Quick Examples

```typescript
// Domain: Business event a stakeholder cares about
logger.info({
  event: 'task.completed',
  category: 'domain',
  aggregate_type: 'Task',
  aggregate_id: taskId,
  domain_event: 'TaskCompleted',
});

// Application: Request flow and orchestration
logger.info({
  event: 'use_case.complete_task.succeeded',
  category: 'application',
  task_id: taskId,
  user_id: userId,
  duration_ms: 45,
});

// Infrastructure: External system interaction
logger.info({
  event: 'db.query.succeeded',
  category: 'infrastructure',
  query_type: 'UPDATE',
  table: 'tasks',
  duration_ms: 15,
});
```

## Cross-References

- **[structured-logging](../structured-logging/SKILL.md)**: Provides SafeLogger implementation and base field definitions for all log categories
- **[cloudflare-observability](../cloudflare-observability/SKILL.md)**: Configure Workers Observability platform to query and analyze categorized logs

## Reference Files

- [references/decision-matrix.md](./references/decision-matrix.md) - Quick decision questions to determine log category
- [references/domain-logging.md](./references/domain-logging.md) - Log business events from entities and domain services
- [references/application-logging.md](./references/application-logging.md) - Log request flow and use case execution
- [references/infrastructure-logging.md](./references/infrastructure-logging.md) - Log database, cache, and external API interactions
