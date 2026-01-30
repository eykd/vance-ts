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

- `/glossary` - Domain terminology and Ubiquitous Language reference
- `/d1-repository-implementation` - D1 database patterns
- `/kv-session-management` - KV storage patterns
- `/vitest-integration-testing` - Test with real bindings
- `/cloudflare-migrations` - Database schema changes

## Dependencies

- Infrastructure → Domain (implements interfaces), Application (uses DTOs)
- Infrastructure ✗ Presentation

## See Also

- [docs/ddd-clean-code-guide.md](../../docs/ddd-clean-code-guide.md) - Infrastructure Layer section
