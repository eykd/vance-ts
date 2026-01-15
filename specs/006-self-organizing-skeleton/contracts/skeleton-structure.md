# Skeleton Structure Contract

**Feature**: 006-self-organizing-skeleton
**Date**: 2026-01-15

This document defines the exact structure and CLAUDE.md templates for the self-organizing skeleton.

---

## CLAUDE.md Templates

### Layer-Level Template (< 100 lines)

```markdown
# [Layer Name] Layer

[1-2 sentence description of layer responsibility, under 50 words]

## Responsibility

[Brief elaboration on what belongs here vs. other layers]

## Patterns

- **[Pattern 1]**: [Brief description]
- **[Pattern 2]**: [Brief description]
- **[Pattern 3]**: [Brief description]

## Naming Conventions

- [Convention 1]
- [Convention 2]

## Applicable Skills

- `/skill-1` - [Purpose]
- `/skill-2` - [Purpose]
- `/skill-3` - [Purpose]

## Dependencies

- [Layer] → [Allowed dependencies]
- [Layer] ✗ [Forbidden dependencies]

## See Also

- [docs/ddd-clean-code-guide.md](../../../docs/ddd-clean-code-guide.md)
```

### Subdirectory-Level Template (< 50 lines)

```markdown
# [Subdirectory Name]

[1 sentence description, under 25 words]

## Patterns

- [Specific pattern for this subdirectory]

## Skills

- `/skill` - [Purpose]

## Examples

- `EntityName.ts` - [Description]
```

---

## Layer CLAUDE.md Content

### src/domain/CLAUDE.md

```markdown
# Domain Layer

Core business logic with zero external dependencies. Entities, value objects, domain services, and repository interfaces live here.

## Responsibility

This layer contains business rules independent of frameworks, databases, and UI. Code here should be pure TypeScript with no imports from other layers.

## Patterns

- **Entities**: Objects with identity (ID-based equality). Use `create()` factory and `reconstitute()` for hydration.
- **Value Objects**: Immutable objects defined by attributes. Self-validating in constructor.
- **Domain Services**: Stateless logic spanning multiple entities.
- **Repository Interfaces**: Ports defining persistence contracts—NO implementations here.

## Naming Conventions

- Entities: PascalCase noun (`Task.ts`, `User.ts`)
- Value Objects: PascalCase noun (`Email.ts`, `Money.ts`)
- Interfaces: PascalCase + Repository/Service (`TaskRepository.ts`)
- Tests: Same name + `.spec.ts` (colocated)

## Applicable Skills

- `/ddd-domain-modeling` - Entity and value object patterns
- `/typescript-unit-testing` - TDD for domain logic
- `/clean-architecture-validator` - Verify dependency rules

## Dependencies

- Domain → None (pure TypeScript only)
- Domain ✗ Application, Infrastructure, Presentation

## See Also

- [docs/ddd-clean-code-guide.md](../../../docs/ddd-clean-code-guide.md) - Domain Layer section
```

### src/application/CLAUDE.md

```markdown
# Application Layer

Orchestrates domain objects to fulfill use cases. Contains no business logic—that belongs in domain.

## Responsibility

Coordinate domain entities, call repository interfaces, handle transactions. Accept DTOs as input, return DTOs as output.

## Patterns

- **Use Cases**: Single-responsibility classes with `execute()` method.
- **DTOs**: Data transfer objects for layer boundaries (Request/Response).
- **Application Services**: Cross-cutting concerns (authorization, notifications).

## Naming Conventions

- Use Cases: VerbNoun PascalCase (`CreateTask.ts`, `CompleteTask.ts`)
- DTOs: PascalCase + Request/Response (`CreateTaskRequest.ts`)
- Tests: Same name + `.spec.ts` (colocated)

## Applicable Skills

- `/cloudflare-use-case-creator` - Use case structure and DTOs
- `/typescript-unit-testing` - Mock dependencies for isolation
- `/clean-architecture-validator` - Verify no infrastructure imports

## Dependencies

- Application → Domain only
- Application ✗ Infrastructure, Presentation

## See Also

- [docs/ddd-clean-code-guide.md](../../../docs/ddd-clean-code-guide.md) - Application Layer section
```

### src/infrastructure/CLAUDE.md

```markdown
# Infrastructure Layer

Implements interfaces defined by domain. Handles databases, caches, external APIs, and other I/O.

## Responsibility

Adapt external systems to domain contracts. Translate between domain objects and persistence/API formats.

## Patterns

- **Repository Implementations**: D1/KV adapters implementing domain interfaces.
- **External Services**: Email, payment, third-party API integrations.
- **Caching**: KV-based session stores, query caches.

## Naming Conventions

- Repositories: PrefixRepository (`D1TaskRepository.ts`, `KVSessionStore.ts`)
- Tests: Same name + `.integration.test.ts`
- External services: ServiceName (`MailgunEmailService.ts`)

## Applicable Skills

- `/d1-repository-implementation` - D1 database patterns
- `/kv-session-management` - KV storage patterns
- `/vitest-integration-testing` - Test with real bindings
- `/cloudflare-migrations` - Database schema changes

## Dependencies

- Infrastructure → Domain (implements interfaces), Application (uses DTOs)
- Infrastructure ✗ Presentation

## See Also

- [docs/ddd-clean-code-guide.md](../../../docs/ddd-clean-code-guide.md) - Infrastructure Layer section
```

### src/presentation/CLAUDE.md

```markdown
# Presentation Layer

HTTP request handling, HTML rendering, middleware. Translates between HTTP and application use cases.

## Responsibility

Parse requests, validate input, call use cases, format responses. Handle authentication, error mapping, HTMX partials.

## Patterns

- **Handlers**: Coordinate HTTP concerns, delegate to use cases.
- **Templates**: Pure functions returning HTML strings.
- **Middleware**: Auth, error handling, logging wrappers.

## Naming Conventions

- Handlers: PascalCase + Handlers (`TaskHandlers.ts`)
- Templates: camelCase function names (`taskList()`, `taskItem()`)
- Middleware: camelCase (`auth.ts`, `errorHandler.ts`)
- Tests: `.spec.ts` for unit, `.acceptance.test.ts` for e2e

## Applicable Skills

- `/worker-request-handler` - Handler patterns, routing
- `/htmx-pattern-library` - HTMX interactions
- `/htmx-alpine-templates` - Template structure
- `/security-review` - Input validation, XSS prevention

## Dependencies

- Presentation → Application (use cases, DTOs), Domain (types only)
- Presentation ✗ Infrastructure (except via dependency injection)

## See Also

- [docs/ddd-clean-code-guide.md](../../../docs/ddd-clean-code-guide.md) - Presentation Layer section
```

---

## Subdirectory CLAUDE.md Content

### src/domain/entities/CLAUDE.md

```markdown
# Entities

Objects with identity that persists over time. Two entities are equal if they have the same ID.

## Patterns

- Private constructor with `create()` factory (new) and `reconstitute()` (from DB)
- Behavior methods enforce invariants (`complete()`, `rename()`)
- No setters—state changes only through behavior methods

## Skills

- `/ddd-domain-modeling` - Entity patterns

## Examples

- `Task.ts` - Task entity with complete/reopen behavior
- `User.ts` - User entity with email verification
```

### src/domain/value-objects/CLAUDE.md

```markdown
# Value Objects

Immutable objects defined by attributes. Two value objects are equal if all attributes match.

## Patterns

- Self-validating in constructor
- Provide `equals()` method
- Wrap primitives to add meaning (`Email`, `Money`, `TaskId`)

## Skills

- `/ddd-domain-modeling` - Value object patterns

## Examples

- `Email.ts` - Validated email with domain extraction
- `Money.ts` - Currency-safe arithmetic
```

### src/domain/services/CLAUDE.md

```markdown
# Domain Services

Stateless business logic that doesn't belong to any single entity.

## Patterns

- Pure functions or stateless classes
- Operate on multiple entities/aggregates
- No side effects

## Skills

- `/ddd-domain-modeling` - Service patterns

## Examples

- `TaskPrioritizer.ts` - Calculate priority across tasks
```

### src/domain/interfaces/CLAUDE.md

```markdown
# Repository Interfaces

Ports defining how domain expects to persist and retrieve entities. Implementations live in infrastructure.

## Patterns

- Express intent in domain language
- Return domain objects, not database rows
- Define by capability, not implementation

## Skills

- `/ddd-domain-modeling` - Port/adapter pattern
- `/clean-architecture-validator` - Verify no implementation details

## Examples

- `TaskRepository.ts` - findById, save, delete
- `UserRepository.ts` - findByEmail, exists
```

### src/application/use-cases/CLAUDE.md

```markdown
# Use Cases

Single-responsibility classes that orchestrate domain objects for specific operations.

## Patterns

- One public `execute()` method
- Accept Request DTO, return Response DTO
- Coordinate domain objects, don't contain business logic

## Skills

- `/cloudflare-use-case-creator` - Use case structure

## Examples

- `CreateTask.ts` - Create and save new task
- `CompleteTask.ts` - Mark task as complete
```

### src/application/services/CLAUDE.md

```markdown
# Application Services

Cross-cutting concerns spanning multiple use cases.

## Patterns

- Authorization checks
- Notification orchestration
- Rate limiting decisions

## Skills

- `/cloudflare-use-case-creator` - Service patterns
- `/org-authorization` - Authorization patterns

## Examples

- `AuthorizationService.ts` - canViewTask, canEditTask
```

### src/application/dto/CLAUDE.md

```markdown
# Data Transfer Objects

Simple data structures with no behavior for crossing layer boundaries.

## Patterns

- Request DTOs: input to use cases
- Response DTOs: output from use cases
- Plain interfaces, no classes

## Skills

- `/cloudflare-use-case-creator` - DTO patterns

## Examples

- `CreateTaskRequest.ts` - userId, title
- `TaskResponse.ts` - id, title, completed, createdAt
```

### src/infrastructure/repositories/CLAUDE.md

```markdown
# Repository Implementations

D1/KV adapters implementing domain repository interfaces.

## Patterns

- Implement domain interface exactly
- Translate between domain entities and database rows
- Use `reconstitute()` to hydrate entities

## Skills

- `/d1-repository-implementation` - D1 query patterns
- `/cloudflare-migrations` - Schema changes
- `/vitest-integration-testing` - Test with real D1

## Examples

- `D1TaskRepository.ts` - SQLite-backed task storage
```

### src/infrastructure/cache/CLAUDE.md

```markdown
# Cache Implementations

KV-based session stores, query caches, and transient storage.

## Patterns

- TTL-based expiration
- JSON serialization for complex objects
- Key prefix conventions

## Skills

- `/kv-session-management` - Session patterns
- `/vitest-integration-testing` - Test with real KV

## Examples

- `KVSessionStore.ts` - Session with auto-refresh
```

### src/infrastructure/services/CLAUDE.md

```markdown
# External Service Adapters

Integrations with third-party APIs (email, payments, etc.).

## Patterns

- Implement domain service interfaces
- Handle API errors gracefully
- Log external calls for debugging

## Skills

- `/vitest-integration-testing` - Mock external APIs

## Examples

- `MailgunEmailService.ts` - Email delivery
- `StripePaymentService.ts` - Payment processing
```

### src/presentation/handlers/CLAUDE.md

```markdown
# Request Handlers

HTTP request handlers coordinating between HTTP and use cases.

## Patterns

- Parse request (form data, JSON, params)
- Validate input at boundary
- Call use case, map response to HTTP

## Skills

- `/worker-request-handler` - Handler patterns
- `/htmx-pattern-library` - HTMX responses
- `/security-review` - Input validation

## Examples

- `TaskHandlers.ts` - CRUD operations for tasks
```

### src/presentation/templates/CLAUDE.md

```markdown
# HTML Templates

Pure functions returning HTML strings. Used for full pages and HTMX partials.

## Patterns

- Escape all user content
- Compose from smaller partials
- Return string, no side effects

## Skills

- `/htmx-alpine-templates` - Template structure
- `/typescript-html-templates` - HTML helpers

## Subdirectories

- `layouts/` - Page wrappers (head, nav, footer)
- `pages/` - Full page content
- `partials/` - HTMX fragments
```

### src/presentation/templates/layouts/CLAUDE.md

```markdown
# Layout Templates

Page wrappers providing consistent structure (head, navigation, footer).

## Skills

- `/htmx-alpine-templates` - Layout patterns

## Examples

- `base.ts` - HTML skeleton with nav and footer
```

### src/presentation/templates/pages/CLAUDE.md

```markdown
# Page Templates

Full page content rendered within layouts.

## Skills

- `/htmx-alpine-templates` - Page composition

## Examples

- `dashboard.ts` - User dashboard
- `tasks.ts` - Task list page
```

### src/presentation/templates/partials/CLAUDE.md

```markdown
# Partial Templates

HTMX fragments for partial page updates. Returned by `/app/_/*` endpoints.

## Skills

- `/htmx-pattern-library` - Partial patterns
- `/htmx-alpine-templates` - Fragment structure

## Examples

- `taskList.ts` - Task list fragment
- `taskItem.ts` - Single task item
```

### src/presentation/middleware/CLAUDE.md

```markdown
# Middleware

Request/response wrappers for auth, logging, error handling.

## Patterns

- Wrap handlers with cross-cutting logic
- Return early for auth failures
- Catch and format errors

## Skills

- `/worker-request-handler` - Middleware patterns
- `/security-review` - Auth middleware

## Examples

- `auth.ts` - Session validation
- `errorHandler.ts` - Error formatting
```

### src/presentation/utils/CLAUDE.md

```markdown
# Presentation Utilities

Helper functions for HTML rendering and response formatting.

## Skills

- `/typescript-html-templates` - Escape utilities

## Examples

- `escape.ts` - HTML escaping
- `response.ts` - Response helpers
```

### tests/CLAUDE.md

```markdown
# Tests Directory

Shared test infrastructure: fixtures, helpers, setup.

## Organization

- Unit tests: Colocated with source (`.spec.ts`)
- Integration tests: Colocated (`.integration.test.ts`)
- Acceptance tests: Colocated (`.acceptance.test.ts`)
- Fixtures/helpers: This directory

## Skills

- `/typescript-unit-testing` - Unit test patterns
- `/vitest-cloudflare-config` - Test configuration
- `/vitest-integration-testing` - Integration patterns
```

### tests/fixtures/CLAUDE.md

```markdown
# Test Fixtures

Test data builders for creating consistent test objects.

## Patterns

- Builder pattern with fluent API
- Sensible defaults, override as needed

## Skills

- `/typescript-unit-testing` - Builder patterns

## Examples

- `TaskBuilder.ts` - Build test tasks
- `UserBuilder.ts` - Build test users
```

### tests/helpers/CLAUDE.md

```markdown
# Test Helpers

Shared test utilities and application factories.

## Skills

- `/vitest-cloudflare-config` - Test setup

## Examples

- `testApp.ts` - Create test application instance
```

### migrations/CLAUDE.md

```markdown
# Database Migrations

D1 SQL migration files for schema changes.

## Patterns

- Zero-padded sequence: `0001_description.sql`
- Atomic changes per file
- Seed data: `9999_development_seeds.sql`

## Skills

- `/cloudflare-migrations` - Migration patterns
- `/d1-repository-implementation` - Schema design

## Examples

- `0001_initial.sql` - Initial schema
- `0002_add_tasks.sql` - Add tasks table
```

### public/CLAUDE.md

```markdown
# Static Content

Static assets served by Cloudflare Pages CDN. Marketing pages, CSS, JS.

## Organization

- `css/` - Compiled TailwindCSS
- `js/` - HTMX, Alpine.js bundles

## Skills

- `/tailwind-daisyui-design` - Styling patterns
- `/static-first-routing` - CDN vs Worker routing

## Notes

Changes here deploy independently from Worker code.
```

---

## Implementation Checklist

- [ ] Create all 28 directories with .gitkeep files
- [ ] Create 26 CLAUDE.md files from templates above
- [ ] Verify all referenced skills exist
- [ ] Count total lines and estimate tokens
- [ ] Verify < 5,000 token budget
