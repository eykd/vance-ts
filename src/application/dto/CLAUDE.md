# Data Transfer Objects

Simple data structures with no behavior for crossing layer boundaries.

## Patterns

- Request DTOs: input to use cases
- Response DTOs: output from use cases
- Plain interfaces, no classes

## Skills

- `/glossary` - Ensure DTO names match domain terminology
- `/cloudflare-use-case-creator` - DTO patterns

## Examples

- `CreateTaskRequest.ts` - userId, title
- `TaskResponse.ts` - id, title, completed, createdAt
