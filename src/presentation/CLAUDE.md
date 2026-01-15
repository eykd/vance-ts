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

- [docs/ddd-clean-code-guide.md](../../docs/ddd-clean-code-guide.md) - Presentation Layer section
