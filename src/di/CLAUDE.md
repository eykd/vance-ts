# Dependency Injection

Wires application layers together. Creates concrete instances and injects dependencies into use cases and handlers.

## Files

- `serviceFactory.ts` — Factory that constructs all services from Cloudflare `env` bindings
- `serviceFactory.spec.ts` — Unit tests for factory wiring

## Patterns

- Factory functions accept `env` (Cloudflare bindings) and return fully-wired service instances
- Domain interfaces are resolved to infrastructure implementations here
- This is the only layer allowed to import from all other layers

## Dependencies

- DI → Domain, Application, Infrastructure, Presentation (wiring hub)
