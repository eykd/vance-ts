# Feature Specification: Observability Claude Skills

**Feature Branch**: `002-observability-skills`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Create Claude Skills for observability patterns from docs/cloudflare-metrics-healthchecks-guide.md"

## Clarifications

### Session 2026-01-14

- Q: Should the 6 user stories become 6 granular skills, 2-3 consolidated skills, or 1 comprehensive skill? → A: Single comprehensive "cloudflare-observability" skill with extensive references directory
- Q: What content structure for SKILL.md vs references? → A: Decision-tree structure - SKILL.md contains "when to use which pattern" guidance with minimal code snippets, detailed code in references
- Q: Should observability-specific test patterns be included or deferred to existing testing skills? → A: Include testing-observability.md reference with observability-specific test patterns, cross-link to typescript-unit-testing for general patterns

## User Scenarios & Testing _(mandatory)_

### User Story 1 - SLO-Driven Metrics Design (Priority: P1)

A developer wants to implement observability following an SLO-first approach rather than collecting metrics indiscriminately. They need guidance on defining SLIs (Service Level Indicators), setting SLO targets, calculating error budgets, and implementing burn rate alerting.

**Why this priority**: SLOs are the foundation of the entire observability philosophy in the guide. Without understanding SLOs first, developers will instrument without purpose and be surprised by outages.

**Independent Test**: Can be tested by invoking the skill when defining new SLOs for a feature and validating that the skill provides guidance on target selection, error budget calculation, and burn rate thresholds.

**Acceptance Scenarios**:

1. **Given** a developer needs to define reliability targets, **When** they invoke the SLO skill, **Then** the skill provides guidance on SLI types (availability, latency, throughput), appropriate target percentages, and window duration selection.
2. **Given** a developer has defined an SLO, **When** they need to implement error budget tracking, **Then** the skill provides the ErrorBudget interface and calculation patterns.
3. **Given** a developer wants to alert on SLO violations, **When** they invoke the skill, **Then** the skill provides burn rate calculation formulas and multi-window alerting thresholds.

---

### User Story 2 - Request Timing Implementation (Priority: P1)

A developer needs to add request timing to their Cloudflare Worker to measure latency across different phases of request processing (routing, authentication, business logic, data access, rendering).

**Why this priority**: Request timing is the core mechanism for collecting latency SLIs and is required for any meaningful observability implementation.

**Independent Test**: Can be tested by invoking the skill when adding timing to a Worker handler and validating that the skill provides the RequestTimer class pattern, phase timing methods, and Server-Timing header formatting.

**Acceptance Scenarios**:

1. **Given** a developer needs to time a complete request, **When** they invoke the skill, **Then** the skill provides the RequestTimer class with startPhase/endPhase/finalize methods.
2. **Given** a developer wants to time async operations, **When** they need the timePhase helper, **Then** the skill provides the async wrapper pattern that handles both sync and async functions.
3. **Given** a developer wants browser DevTools visibility, **When** they add timing, **Then** the skill provides Server-Timing header formatting guidance.

---

### User Story 3 - Error Tracking and Categorization (Priority: P2)

A developer needs to track errors and categorize them appropriately to distinguish between errors that impact SLOs (server errors, timeouts, dependency failures) and those that don't (client errors, validation errors).

**Why this priority**: Not all errors are equal. Proper categorization is essential for accurate SLO measurement and meaningful alerting.

**Independent Test**: Can be tested by invoking the skill when implementing error handling and validating that the skill provides error categorization logic and SLO impact determination.

**Acceptance Scenarios**:

1. **Given** an error occurs during request processing, **When** the developer needs to categorize it, **Then** the skill provides the ErrorCategory enum and categorization logic.
2. **Given** a developer needs to determine SLO impact, **When** they have a categorized error, **Then** the skill provides the countsAgainstSLO() pattern.
3. **Given** a developer wants error summaries, **When** they invoke the skill, **Then** the skill provides the ErrorSummary interface and calculation patterns.

---

### User Story 4 - Health Endpoint Implementation (Priority: P2)

A developer needs to implement health endpoints for load balancers, monitoring systems, and operations teams. Different consumers need different levels of detail.

**Why this priority**: Health endpoints are essential for operational visibility but build on the foundation of timing and error tracking.

**Independent Test**: Can be tested by invoking the skill when adding health routes and validating that the skill provides endpoint patterns for /health, /health/live, /health/ready, and /health/detailed.

**Acceptance Scenarios**:

1. **Given** a load balancer needs simple health checks, **When** the developer implements /health, **Then** the skill provides a simple 200/503 response pattern.
2. **Given** a monitoring system needs readiness probes, **When** the developer implements /health/ready, **Then** the skill provides dependency checking with critical dependency filtering.
3. **Given** operations needs detailed health info, **When** the developer implements /health/detailed, **Then** the skill provides the HealthCheckResult interface with all dependency statuses, latencies, and messages.

---

### User Story 5 - Dependency Health Checks (Priority: P3)

A developer needs to implement health checks for specific Cloudflare dependencies: D1 databases, KV namespaces, and external HTTP endpoints.

**Why this priority**: Builds on health endpoint foundation with specific implementation patterns for Cloudflare services.

**Independent Test**: Can be tested by invoking the skill when adding a D1 or KV health check and validating that the skill provides the DependencyChecker interface implementation.

**Acceptance Scenarios**:

1. **Given** a Worker uses D1, **When** the developer needs D1 health checking, **Then** the skill provides the D1HealthCheck class pattern.
2. **Given** a Worker uses KV, **When** the developer needs KV health checking, **Then** the skill provides the KVHealthCheck class with write/read verification.
3. **Given** a Worker calls external APIs, **When** the developer needs external health checking, **Then** the skill provides the HttpHealthCheck class with timeout and status verification.

---

### User Story 6 - Analytics Engine Integration (Priority: P3)

A developer needs to persist metrics to Cloudflare Analytics Engine and query them for dashboards and analysis.

**Why this priority**: Integration with Analytics Engine is the final step that connects all observability components to persistent storage.

**Independent Test**: Can be tested by invoking the skill when writing metrics to Analytics Engine and validating that the skill provides the AnalyticsEngineAdapter pattern and example SQL queries.

**Acceptance Scenarios**:

1. **Given** a developer needs to write request metrics, **When** they invoke the skill, **Then** the skill provides the writeDataPoint pattern with blobs, doubles, and indexes.
2. **Given** a developer needs latency percentiles, **When** they query Analytics Engine, **Then** the skill provides example SQL with quantileExact functions.
3. **Given** a developer needs error rates by endpoint, **When** they query Analytics Engine, **Then** the skill provides example SQL with countIf and grouping patterns.

---

### Edge Cases

- What happens when a phase is started but never ended? The RequestTimer.finalize() auto-ends unclosed phases.
- What happens when Analytics Engine write fails? Metrics should be written via ctx.waitUntil() to not block responses.
- How does the system handle partial dependency failures? Health status should degrade gracefully (healthy to degraded to unhealthy).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Skill MUST use decision-tree structure in SKILL.md ("when to use which pattern" guidance) with detailed code in references/
- **FR-002**: Skills MUST include "when to use" descriptions matching the skill framework pattern
- **FR-003**: Skills MUST provide TypeScript code patterns compatible with Cloudflare Workers runtime
- **FR-004**: Skills MUST cross-reference existing skills (typescript-unit-testing, vitest-cloudflare-config) where testing patterns apply
- **FR-005**: SLO skill MUST cover SLI types, target selection, error budgets, and burn rate alerting
- **FR-006**: Request timing skill MUST cover phase timing, async timing, and Server-Timing headers
- **FR-007**: Error tracking skill MUST cover error categorization and SLO impact determination
- **FR-008**: Health endpoint skill MUST cover liveness/readiness/detailed patterns and dependency checking
- **FR-009**: Analytics Engine skill MUST cover write patterns and example SQL queries
- **FR-010**: Skills MUST NOT duplicate existing skill content (d1-repository-implementation, vitest-cloudflare-config)

### Key Entities

- **Skill**: A single "cloudflare-observability" Claude Code skill with SKILL.md main file and extensive references/ directory for progressive disclosure
- **Reference File**: A detailed markdown file in references/ covering one topic area (e.g., slo-tracking.md, request-timing.md, error-tracking.md, health-endpoints.md, analytics-engine.md, testing-observability.md)
- **Skill Description**: A concise "when to use" statement focusing on invocation triggers rather than capabilities

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Each new skill SKILL.md is under 150 lines to ensure token efficiency
- **SC-002**: Each skill description fits in one line and starts with "Use when:"
- **SC-003**: 100% of code examples compile in Cloudflare Workers TypeScript environment
- **SC-004**: Reference files provide sufficient detail that developers can implement patterns without external documentation
- **SC-005**: Skills correctly cross-reference related skills to avoid duplication

## Assumptions

- Skills will be stored in `.claude/skills/` following existing directory structure
- Skill names will use kebab-case matching existing patterns
- TypeScript code targets ES2022 with strict type checking
- Vitest is the test framework for all testing patterns
- DaisyUI 5 is available for any HTML dashboard components
