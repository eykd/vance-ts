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

- `/glossary` - Domain terminology and Ubiquitous Language reference
- `/ddd-domain-modeling` - Entity and value object patterns
- `/typescript-unit-testing` - TDD for domain logic
- `/clean-architecture-validator` - Verify dependency rules

## Dependencies

- Domain → None (pure TypeScript only)
- Domain ✗ Application, Infrastructure, Presentation

## See Also

- [docs/ddd-clean-code-guide.md](../../docs/ddd-clean-code-guide.md) - Domain Layer section
