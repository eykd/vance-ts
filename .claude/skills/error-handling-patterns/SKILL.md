# Error Handling Patterns

## Purpose

Provide comprehensive error handling patterns for TypeScript applications using Result types, error hierarchies, and safe error responses. This skill prevents error disclosure vulnerabilities and ensures consistent error handling across application layers.

## When to Use

Use this skill when:

1. **Implementing use cases** - All use cases must return Result types
2. **Creating error classes** - Domain errors, validation errors, infrastructure errors
3. **Building HTTP handlers** - Mapping errors to safe HTTP responses
4. **Reviewing code** - Checking for error disclosure and inconsistent handling
5. **Questions about error handling** - When to throw vs return, error hierarchies

## Core Principles

### Result Type Pattern

**ALWAYS return Result types from use cases**. Never throw domain or validation errors from use cases.

```typescript
export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

// Helper constructors
export function ok<T>(value: T): Result<T, never> {
  return { success: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}
```

### Error Hierarchy

```
Error (base)
├── DomainError (business logic violations)
│   ├── ValidationError (invalid business rules)
│   ├── NotFoundError (entity not found)
│   └── ConflictError (uniqueness constraint)
├── InfrastructureError (external system failures)
│   ├── DatabaseError (connection, query failures)
│   └── ExternalServiceError (API failures)
└── PresentationError (HTTP-specific errors)
    ├── UnauthorizedError (401)
    └── ForbiddenError (403)
```

### When to Throw vs Return

| Scenario                 | Action                      | Reason                    |
| ------------------------ | --------------------------- | ------------------------- |
| Validation failed        | Return err(ValidationError) | Expected, recoverable     |
| Business rule violated   | Return err(DomainError)     | Expected, recoverable     |
| Entity not found         | Return err(NotFoundError)   | Expected, recoverable     |
| Uniqueness conflict      | Return err(ConflictError)   | Expected, recoverable     |
| Database connection lost | Throw InfrastructureError   | Unexpected, unrecoverable |
| Null pointer (bug)       | Throw Error                 | Programming error         |
| Configuration missing    | Throw Error                 | Startup failure           |

**Rule**: Return errors that are part of normal business flow. Throw errors that indicate system failure or programming bugs.

### Three-Layer Error Handling

```
┌──────────────────────────────────────────┐
│ Presentation Layer (HTTP Handler)       │
│ - Maps Result → HTTP response           │
│ - Returns generic error messages         │
│ - Logs detailed errors                   │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│ Application Layer (Use Case)             │
│ - Returns Result<T, DomainError>         │
│ - Catches infrastructure errors          │
│ - Never throws domain errors             │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│ Domain Layer (Entity, Value Object)      │
│ - Throws ValidationError in constructor  │
│ - Throws DomainError in methods          │
│ - No knowledge of HTTP or database       │
└──────────────────────────────────────────┘
```

## Implementation Patterns

### Use Case Pattern

```typescript
export class CreateTaskUseCase {
  async execute(dto: CreateTaskDto): Promise<Result<Task, ValidationError | ConflictError>> {
    // Validation
    const validated = this.validator.validate(dto);
    if (!validated.success) {
      return err(new ValidationError('Invalid task data', validated.errors));
    }

    // Domain logic (catch domain errors)
    try {
      const task = Task.create({
        title: validated.value.title,
        userId: UserId.fromString(validated.value.userId),
      });

      // Infrastructure (catch infrastructure errors)
      try {
        await this.repository.save(task);
        return ok(task);
      } catch (e) {
        if (e instanceof ConflictError) {
          return err(e);
        }
        // Infrastructure errors bubble up
        throw e;
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        return err(e);
      }
      throw e; // Unexpected errors bubble up
    }
  }
}
```

### HTTP Handler Pattern

```typescript
export async function handleCreateTask(request: Request): Promise<Response> {
  const body = await request.json();

  // Execute use case
  const result = await createTaskUseCase.execute(body);

  // Map Result to HTTP response
  if (!result.success) {
    return errorResponse(result.error);
  }

  return jsonResponse(201, toTaskResponse(result.value));
}

function errorResponse(error: DomainError): Response {
  const statusCode = mapErrorToStatus(error);

  // SECURITY: Return generic message, log details
  const userMessage = getGenericMessage(error);
  logger.error('Request failed', { error, stack: error.stack });

  return jsonResponse(statusCode, { error: userMessage });
}

function mapErrorToStatus(error: DomainError): number {
  if (error instanceof ValidationError) return 422;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ConflictError) return 409;
  if (error instanceof UnauthorizedError) return 401;
  if (error instanceof ForbiddenError) return 403;
  return 500;
}

function getGenericMessage(error: DomainError): string {
  // NEVER expose internal details
  if (error instanceof ValidationError) return 'Invalid request data';
  if (error instanceof NotFoundError) return 'Resource not found';
  if (error instanceof ConflictError) return 'Resource already exists';
  if (error instanceof UnauthorizedError) return 'Authentication required';
  if (error instanceof ForbiddenError) return 'Access denied';
  return 'An error occurred';
}
```

### Domain Error Classes

```typescript
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
```

## Security Requirements

### Error Disclosure Prevention

**CRITICAL**: Never expose internal error details to clients.

❌ **WRONG** - Exposes internal details:

```typescript
return jsonResponse(500, { error: error.message }); // Might expose SQL, file paths
```

✅ **CORRECT** - Generic message with logging:

```typescript
logger.error('Database query failed', { error, query });
return jsonResponse(500, { error: 'An error occurred' });
```

### Error Logging Separation

```typescript
// Log detailed errors for debugging
logger.error('Task creation failed', {
  error: error.message,
  stack: error.stack,
  userId: dto.userId,
  timestamp: new Date().toISOString(),
});

// Return generic message to user
return jsonResponse(422, {
  error: 'Invalid task data',
  // Only include safe field-level errors
  fields: error.fields,
});
```

## Testing Patterns

### Testing Error Paths

```typescript
describe('CreateTaskUseCase', () => {
  it('returns ValidationError for invalid title', async () => {
    const result = await useCase.execute({ title: '', userId: 'user-1' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toContain('title');
    }
  });

  it('returns ConflictError for duplicate task', async () => {
    repository.save.mockRejectedValue(new ConflictError('Task already exists'));

    const result = await useCase.execute({ title: 'Test', userId: 'user-1' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ConflictError);
    }
  });

  it('throws InfrastructureError for database failure', async () => {
    repository.save.mockRejectedValue(new Error('Connection lost'));

    await expect(useCase.execute({ title: 'Test', userId: 'user-1' })).rejects.toThrow(
      'Connection lost'
    );
  });
});
```

### Testing HTTP Error Mapping

```typescript
describe('errorResponse', () => {
  it('returns 422 for ValidationError', () => {
    const error = new ValidationError('Invalid data');
    const response = errorResponse(error);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({ error: 'Invalid request data' });
  });

  it('does not expose internal error details', () => {
    const error = new Error('Database connection to 10.0.0.1 failed');
    const response = errorResponse(error);

    const body = JSON.parse(response.body);
    expect(body.error).not.toContain('10.0.0.1');
    expect(body.error).toBe('An error occurred');
  });
});
```

## Common Mistakes

### ❌ Throwing from Use Cases

```typescript
// WRONG - Use case throws domain error
async execute(dto: CreateTaskDto): Promise<Task> {
  if (!dto.title) {
    throw new ValidationError('Title required'); // ❌ Don't throw
  }
  return task;
}
```

### ✅ Returning Result from Use Cases

```typescript
// CORRECT - Use case returns Result
async execute(dto: CreateTaskDto): Promise<Result<Task, ValidationError>> {
  if (!dto.title) {
    return err(new ValidationError('Title required')); // ✅ Return error
  }
  return ok(task);
}
```

### ❌ Exposing Internal Errors

```typescript
// WRONG - Exposes stack trace
catch (error) {
  return jsonResponse(500, { error: error.toString() }); // ❌ Might expose paths
}
```

### ✅ Generic Messages with Logging

```typescript
// CORRECT - Logs details, returns generic message
catch (error) {
  logger.error('Operation failed', { error, stack: error.stack }); // ✅ Log details
  return jsonResponse(500, { error: 'An error occurred' }); // ✅ Generic message
}
```

## Related Skills

- **security-review**: Error disclosure prevention, safe error responses
- **quality-review**: Consistent error handling, Result type usage
- **cloudflare-use-case-creator**: Use case implementation with Result types
- **worker-request-handler**: HTTP error mapping, response formatting
- **ddd-domain-modeling**: Domain error classes, validation in entities
- **typescript-unit-testing**: Testing error paths, 100% coverage

## References

See the `references/` directory for detailed documentation:

- `result-type.md` - Result type implementation with combinators
- `error-classes.md` - Complete error hierarchy and usage
- `error-responses.md` - HTTP error mapping and security guidelines
