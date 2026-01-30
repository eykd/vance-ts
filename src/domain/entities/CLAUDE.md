# Entities

Objects with identity that persists over time. Two entities are equal if they have the same ID.

## Patterns

- Private constructor with `create()` factory (new) and `reconstitute()` (from DB)
- Behavior methods enforce invariants (`complete()`, `rename()`)
- No setters—state changes only through behavior methods

## Skills

- `/glossary` - Ensure entity names match domain terminology
- `/ddd-domain-modeling` - Entity patterns

## Examples

- `Task.ts` - Task entity with complete/reopen behavior
- `User.ts` - User entity with email verification
