# Value Objects

Immutable objects defined by attributes. Two value objects are equal if all attributes match.

## Patterns

- Self-validating in constructor
- Provide `equals()` method
- Wrap primitives to add meaning (`Email`, `Money`, `TaskId`)

## Skills

- `/glossary` - Ensure value object names match domain terminology
- `/ddd-domain-modeling` - Value object patterns

## Examples

- `Email.ts` - Validated email with domain extraction
- `Money.ts` - Currency-safe arithmetic
