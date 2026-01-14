# Feature Specification: Logging & Tracing Claude Skills

**Feature Branch**: `003-logging-tracing-skills`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Consider the guide at @docs/logging-tracing-guide.md. Consider if we are missing any Claude Skills that could further guide and direct the evolution of this codebase according to the principles in this guide."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Structured Logger Setup (Priority: P1)

A developer needs to implement structured logging in their Cloudflare Worker with proper log schemas, request correlation, and environment-aware redaction. They need guidance on logger initialization, context propagation via AsyncLocalStorage, and base field requirements.

**Why this priority**: Structured logging is the foundation of the entire observability system. Without it, logs are unqueryable, uncorrelated, and potentially unsafe (PII leakage). This is the MVP that makes all other logging features possible.

**Independent Test**: Can be tested by invoking the skill when adding logging to a new Worker and validating that the skill provides the SafeLogger class, BaseLogFields interface, and AsyncLocalStorage context pattern.

**Acceptance Scenarios**:

1. **Given** a developer needs to add logging to a Worker, **When** they invoke the skill, **Then** the skill provides the complete logger setup including SafeLogger class, context management, and request ID generation.
2. **Given** a developer needs environment-aware logging, **When** they configure the logger, **Then** the skill provides production vs development redaction strategies and debug log suppression patterns.
3. **Given** a developer needs request correlation, **When** they initialize context, **Then** the skill provides AsyncLocalStorage setup, W3C Trace Context parsing, and context propagation patterns.

---

### User Story 2 - Log Categorization (Domain/Application/Infrastructure) (Priority: P1)

A developer needs to categorize their logs according to Clean Architecture boundaries: domain events for business logic, application logs for request flow, and infrastructure logs for external system interactions.

**Why this priority**: Proper categorization is essential for filtering, debugging, and understanding system behavior. Without clear boundaries, logs become noise. This is part of the MVP foundation that enables meaningful log analysis.

**Independent Test**: Can be tested by invoking the skill when adding logs to a use case or repository and validating that the skill provides the category decision matrix and appropriate logger interfaces (DomainLogger, ApplicationLogger, InfrastructureLogger).

**Acceptance Scenarios**:

1. **Given** a developer adds logging to a domain entity, **When** they need to determine the category, **Then** the skill provides the decision matrix and domain-specific log fields (aggregate_type, aggregate_id, domain_event).
2. **Given** a developer adds logging to a use case, **When** they need to log request flow, **Then** the skill provides application log patterns with HTTP context, timing, and validation failure handling.
3. **Given** a developer adds logging to a repository, **When** they need to log database operations, **Then** the skill provides infrastructure log patterns with query timing, operation types, and connection health.

---

### User Story 3 - PII and Secret Redaction (Priority: P2)

A developer needs to ensure sensitive data (passwords, tokens, emails, IPs) never appears in logs through systematic redaction at multiple defense layers.

**Why this priority**: PII leakage is a compliance and security risk. While not needed for MVP functionality, it must be implemented before production deployment to prevent data breaches.

**Independent Test**: Can be tested by invoking the skill when implementing logger safety and validating that the skill provides redaction patterns, field detection, and URL sanitization utilities.

**Acceptance Scenarios**:

1. **Given** a developer needs to redact sensitive fields, **When** they configure the logger, **Then** the skill provides SENSITIVE_PATTERNS regex dictionary and REDACT_FIELDS/MASK_FIELDS sets.
2. **Given** a developer logs an object with credentials, **When** the logger processes the entry, **Then** the skill provides redactValue() function that recursively sanitizes nested objects and arrays.
3. **Given** a developer logs a URL with query params, **When** the logger processes the entry, **Then** the skill provides redactUrl() function that masks sensitive parameters and long path segments.

---

### User Story 4 - Sentry Integration (Priority: P3)

A developer needs to integrate Sentry for rich error tracking with stack traces, breadcrumbs, and user context, while maintaining structured log correlation.

**Why this priority**: Sentry provides valuable error context but is supplementary to core structured logging. Can be added after the foundational logging system is operational.

**Independent Test**: Can be tested by invoking the skill when adding Sentry to a Worker and validating that the skill provides withSentry wrapper configuration, context management, and breadcrumb patterns.

**Acceptance Scenarios**:

1. **Given** a developer needs to initialize Sentry, **When** they invoke the skill, **Then** the skill provides withSentry configuration with release tracking, environment setup, and sampling rates.
2. **Given** a developer needs custom context, **When** they add Sentry tracking, **Then** the skill provides setSentryContext pattern with user context, tags, and request metadata.
3. **Given** a developer needs breadcrumbs, **When** they track operations, **Then** the skill provides addBreadcrumb pattern with appropriate categories and PII-safe data.

---

### User Story 5 - Event Naming and Schema Compliance (Priority: P2)

A developer needs to follow consistent event naming conventions and schema requirements for queryable, analyzable logs.

**Why this priority**: Inconsistent event names and missing required fields make logs difficult to query and analyze. This is important for log usability but can be refined after basic logging is operational.

**Independent Test**: Can be tested by invoking the skill when defining new log events and validating that the skill provides event naming patterns and required field checklists by category.

**Acceptance Scenarios**:

1. **Given** a developer needs to name an event, **When** they invoke the skill, **Then** the skill provides the dot-notation pattern ({domain}.{entity}.{action}[.{outcome}]) and examples.
2. **Given** a developer creates a domain log, **When** they check required fields, **Then** the skill provides the domain-specific required fields (aggregate_type, aggregate_id, domain_event) and base fields checklist.
3. **Given** a developer creates an infrastructure log, **When** they check required fields, **Then** the skill provides the infrastructure-specific required fields (duration_ms, operation details) and base fields checklist.

---

### User Story 6 - Testing Observability Code (Priority: P3)

A developer needs to test their logging implementation including logger behavior, redaction correctness, and integration with Workers runtime.

**Why this priority**: Testing is essential for quality but is secondary to implementing the logging system itself. Can be added incrementally as logging features are built.

**Independent Test**: Can be tested by invoking the skill when writing tests for logging code and validating that the skill provides test patterns for logger unit tests, redaction validation, and Miniflare integration tests.

**Acceptance Scenarios**:

1. **Given** a developer needs to test the logger, **When** they write unit tests, **Then** the skill provides console.log spy patterns and JSON.parse validation for structured output.
2. **Given** a developer needs to test redaction, **When** they write redaction tests, **Then** the skill provides test cases for sensitive patterns (API keys, JWT tokens, credit cards, PII) and nested object handling.
3. **Given** a developer needs integration tests, **When** they use Miniflare, **Then** the skill provides Miniflare setup with console capture and JSON log parsing patterns.

---

### Edge Cases

- What happens when AsyncLocalStorage context is unavailable? Logger falls back to "no-context" request ID and continues operating.
- What happens when redaction patterns match legitimate data? Masking functions preserve first/last characters for debugging while protecting sensitive portions.
- How does the system handle circular references in logged objects? Redaction functions detect cycles and replace with "[Circular]" marker.
- What happens when Sentry integration fails? Errors should be caught and logged locally without blocking request processing (fail open pattern).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Skills MUST use decision-tree structure in SKILL.md with detailed code in references/
- **FR-002**: Skills MUST include "when to use" descriptions matching the skill framework pattern
- **FR-003**: Skills MUST provide TypeScript code patterns compatible with Cloudflare Workers runtime (AsyncLocalStorage, console.log JSON parsing)
- **FR-004**: Skills MUST cross-reference existing skills (vitest-cloudflare-config, typescript-unit-testing) where testing patterns apply
- **FR-005**: Structured logger skill MUST cover SafeLogger class, AsyncLocalStorage context, BaseLogFields interface, and logger factory pattern
- **FR-006**: Log categorization skill MUST cover domain/application/infrastructure boundaries, required fields by category, and logger interface variants
- **FR-007**: Redaction skill MUST cover SENSITIVE_PATTERNS, REDACT_FIELDS/MASK_FIELDS, redactValue/redactObject/redactString, and URL sanitization
- **FR-008**: Sentry skill MUST cover withSentry wrapper, context management (user/tags), breadcrumb patterns, and error capture with context
- **FR-009**: Event naming skill MUST cover dot-notation convention, event naming examples by category, and required field checklists
- **FR-010**: Testing skill MUST cover logger unit tests (console spy), redaction validation tests, and Miniflare integration patterns
- **FR-011**: Skills MUST NOT duplicate content from observability skills (002-observability-skills) covering metrics, SLOs, health checks
- **FR-012**: Skills MUST provide progressive disclosure via references/ directory with topic-specific detail files

### Key Entities

- **Skill**: Multiple focused Claude Code skills covering logging/tracing topics (structured-logging, log-categorization, pii-redaction, sentry-integration, testing-observability)
- **Reference File**: Detailed markdown files in each skill's references/ directory covering implementation patterns, code examples, and decision matrices
- **Logger Interface**: TypeScript interfaces and classes for structured logging (SafeLogger, DomainLogger, ApplicationLogger, InfrastructureLogger)
- **Log Schema**: TypeScript interfaces defining required and optional fields (BaseLogFields, IdentityFields, RequestContext, ErrorContext, DomainEventFields)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Each skill SKILL.md is under 150 lines to ensure token efficiency
- **SC-002**: Each skill description fits in one line and starts with "Use when:"
- **SC-003**: 100% of code examples compile in Cloudflare Workers TypeScript environment
- **SC-004**: Reference files provide sufficient detail that developers can implement patterns without external documentation
- **SC-005**: Skills correctly cross-reference related skills (vitest-cloudflare-config, typescript-unit-testing, cloudflare-observability) to avoid duplication
- **SC-006**: All redaction patterns correctly identify and mask/redact test cases from OWASP and NIST sensitive data guidelines

## Assumptions

- Skills will be stored in `.claude/skills/` following existing directory structure
- Skill names will use kebab-case matching existing patterns (structured-logging, log-categorization, pii-redaction, sentry-integration, testing-observability)
- TypeScript code targets ES2022 with strict type checking (as defined in tsconfig.json)
- Vitest is the test framework for all testing patterns
- AsyncLocalStorage is available via `nodejs_als` compatibility flag in wrangler.jsonc
- Console output (console.log/error/warn) is automatically captured by Cloudflare Workers Observability Platform
- Sentry SDK is @sentry/cloudflare (not browser or node SDK)
