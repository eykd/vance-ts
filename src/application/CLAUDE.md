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

- `/glossary` - Domain terminology and Ubiquitous Language reference
- `/cloudflare-use-case-creator` - Use case structure and DTOs
- `/typescript-unit-testing` - Mock dependencies for isolation
- `/clean-architecture-validator` - Verify no infrastructure imports

## Dependencies

- Application → Domain only
- Application ✗ Infrastructure, Presentation

## See Also

- [docs/ddd-clean-code-guide.md](../../docs/ddd-clean-code-guide.md) - Application Layer section
