# Middleware

Request/response wrappers for auth, logging, error handling.

## Patterns

- Wrap handlers with cross-cutting logic
- Return early for auth failures
- Catch and format errors

## Skills

- `/glossary` - Ensure middleware names match domain terminology
- `/worker-request-handler` - Middleware patterns
- `/security-review` - Auth middleware

## Examples

- `auth.ts` - Session validation
- `errorHandler.ts` - Error formatting
