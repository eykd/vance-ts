# Repository Interfaces

Ports defining how domain expects to persist and retrieve entities. Implementations live in infrastructure.

## Patterns

- Express intent in domain language
- Return domain objects, not database rows
- Define by capability, not implementation

## Skills

- `/glossary` - Ensure repository interface names match domain terminology
- `/ddd-domain-modeling` - Port/adapter pattern
- `/clean-architecture-validator` - Verify no implementation details

## Examples

- `TaskRepository.ts` - findById, save, delete
- `UserRepository.ts` - findByEmail, exists
