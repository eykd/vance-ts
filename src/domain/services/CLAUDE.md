# Domain Services

Stateless business logic that doesn't belong to any single entity.

## Patterns

- Pure functions or stateless classes
- Operate on multiple entities/aggregates
- No side effects

## Skills

- `/glossary` - Ensure domain service names match domain terminology
- `/ddd-domain-modeling` - Service patterns

## Examples

- `TaskPrioritizer.ts` - Calculate priority across tasks
