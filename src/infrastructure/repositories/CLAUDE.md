# Repository Implementations

D1/KV adapters implementing domain repository interfaces.

## Patterns

- Implement domain interface exactly
- Translate between domain entities and database rows
- Use `reconstitute()` to hydrate entities

## Skills

- `/glossary` - Ensure repository names match domain terminology
- `/d1-repository-implementation` - D1 query patterns
- `/cloudflare-migrations` - Schema changes
- `/vitest-integration-testing` - Test with real D1

## Examples

- `D1TaskRepository.ts` - SQLite-backed task storage
