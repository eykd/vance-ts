# Use Cases

Single-responsibility classes that orchestrate domain objects for specific operations.

## Patterns

- One public `execute()` method
- Accept Request DTO, return Response DTO
- Coordinate domain objects, don't contain business logic

## Skills

- `/cloudflare-use-case-creator` - Use case structure

## Examples

- `CreateTask.ts` - Create and save new task
- `CompleteTask.ts` - Mark task as complete
