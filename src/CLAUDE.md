# Source Code

TypeScript source for the Cloudflare Workers application, organized as Clean Architecture layers.

## Layer Structure

- `domain/` — Core business logic, zero external dependencies (see domain/CLAUDE.md)
- `application/` — Use case orchestration over domain (see application/CLAUDE.md)
- `infrastructure/` — D1/KV/external service adapters (see infrastructure/CLAUDE.md)
- `presentation/` — HTTP handlers, templates, middleware (see presentation/CLAUDE.md)
- `di/` — Dependency injection wiring (see di/CLAUDE.md)
- `shared/` — Cross-cutting utilities (see shared/CLAUDE.md)

## Architecture Boundary Enforcement

ESLint enforces Clean Architecture layer boundaries:

- **Domain** (`domain/`) cannot import from: `application/`, `infrastructure/`, `presentation/`
- **Application** (`application/`) cannot import from: `infrastructure/`, `presentation/`
- **Infrastructure** (`infrastructure/`) cannot import from: `presentation/`

Violations fail pre-commit hooks. See `/clean-architecture-validator` skill for auditing.

## Applicable Skills

- `/prefactoring` — design, naming, type structure
- `/error-handling-patterns` — Result types, error mapping
- `/portable-datetime` — UTC storage, timezone handling
- `/glossary` — Ubiquitous Language for domain terms
