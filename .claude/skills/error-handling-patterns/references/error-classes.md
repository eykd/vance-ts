# Error Class Hierarchy

## Complete Hierarchy

```
Error (JavaScript base)
│
├── DomainError (business logic violations)
│   ├── ValidationError (invalid business rules)
│   ├── NotFoundError (entity not found)
│   ├── ConflictError (uniqueness constraint)
│   ├── AuthorizationError (insufficient permissions)
│   └── BusinessRuleError (generic business rule violation)
│
├── InfrastructureError (external system failures)
│   ├── DatabaseError (connection, query failures)
│   ├── ExternalServiceError (API failures)
│   └── CacheError (KV, cache failures)
│
└── PresentationError (HTTP-specific errors)
    ├── UnauthorizedError (401 - authentication required)
    ├── ForbiddenError (403 - insufficient permissions)
    └── RateLimitError (429 - too many requests)
```

## Base Classes

### DomainError

Business logic violations that are part of normal application flow.

```typescript
/**
 * Base class for domain errors
 * These errors represent expected failures in business logic
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
```

### InfrastructureError

External system failures that are unexpected and unrecoverable.

```typescript
/**
 * Base class for infrastructure errors
 * These errors represent unexpected system failures
 */
export class InfrastructureError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'InfrastructureError';
    Object.setPrototypeOf(this, InfrastructureError.prototype);
  }
}
```

### PresentationError

HTTP-specific errors for the presentation layer.

```typescript
/**
 * Base class for presentation errors
 * These errors represent HTTP-specific failures
 */
export class PresentationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'PresentationError';
    Object.setPrototypeOf(this, PresentationError.prototype);
  }
}
```

## Domain Error Classes

### ValidationError

Used when business rules are violated or data is invalid.

```typescript
/**
 * Validation error with optional field-level errors
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// Usage examples
throw new ValidationError('Invalid task data');

throw new ValidationError('Validation failed', {
  title: ['Title is required', 'Title must be at least 3 characters'],
  dueDate: ['Due date must be in the future'],
});
```

### NotFoundError

Used when an entity cannot be found by identifier.

```typescript
/**
 * Entity not found error
 */
export class NotFoundError extends DomainError {
  constructor(
    message: string,
    public readonly entityType?: string,
    public readonly entityId?: string
  ) {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

// Usage examples
throw new NotFoundError('Task not found');

throw new NotFoundError('Entity not found', 'Task', '123');
```

### ConflictError

Used when uniqueness constraints are violated.

```typescript
/**
 * Conflict error for uniqueness violations
 */
export class ConflictError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

// Usage examples
throw new ConflictError('Task already exists');

throw new ConflictError('Email already registered', 'email');
```

### AuthorizationError

Used when a user lacks permissions for an action.

```typescript
/**
 * Authorization error for permission violations
 */
export class AuthorizationError extends DomainError {
  constructor(
    message: string,
    public readonly userId?: string,
    public readonly resource?: string,
    public readonly action?: string
  ) {
    super(message);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

// Usage examples
throw new AuthorizationError('You do not have permission to delete this task');

throw new AuthorizationError('Permission denied', 'user-123', 'task-456', 'delete');
```

### BusinessRuleError

Generic business rule violation (use specific error types when possible).

```typescript
/**
 * Generic business rule violation
 * Prefer specific error types (ValidationError, ConflictError) when applicable
 */
export class BusinessRuleError extends DomainError {
  constructor(
    message: string,
    public readonly rule?: string
  ) {
    super(message);
    this.name = 'BusinessRuleError';
    Object.setPrototypeOf(this, BusinessRuleError.prototype);
  }
}

// Usage examples
throw new BusinessRuleError('Cannot complete task that is already completed');

throw new BusinessRuleError('Rule violation', 'task-completion-order');
```

## Infrastructure Error Classes

### DatabaseError

Used for database connection or query failures.

```typescript
/**
 * Database error for connection and query failures
 */
export class DatabaseError extends InfrastructureError {
  constructor(
    message: string,
    public readonly query?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

// Usage examples
try {
  await db.prepare(query).run();
} catch (error) {
  throw new DatabaseError('Query execution failed', query, error);
}
```

### ExternalServiceError

Used for external API or service failures.

```typescript
/**
 * External service error for API failures
 */
export class ExternalServiceError extends InfrastructureError {
  constructor(
    message: string,
    public readonly service: string,
    public readonly statusCode?: number,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'ExternalServiceError';
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

// Usage examples
try {
  const response = await fetch('https://api.example.com/data');
  if (!response.ok) {
    throw new ExternalServiceError('API request failed', 'example-api', response.status);
  }
} catch (error) {
  throw new ExternalServiceError('API unreachable', 'example-api', undefined, error);
}
```

### CacheError

Used for cache (KV) operation failures.

```typescript
/**
 * Cache error for KV operation failures
 */
export class CacheError extends InfrastructureError {
  constructor(
    message: string,
    public readonly operation: 'get' | 'put' | 'delete',
    public readonly key?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'CacheError';
    Object.setPrototypeOf(this, CacheError.prototype);
  }
}

// Usage examples
try {
  await env.CACHE.put(key, value);
} catch (error) {
  throw new CacheError('Cache write failed', 'put', key, error);
}
```

## Presentation Error Classes

### UnauthorizedError

Used when authentication is required but not provided.

```typescript
/**
 * Unauthorized error (401) for authentication failures
 */
export class UnauthorizedError extends PresentationError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

// Usage examples
if (!session) {
  throw new UnauthorizedError();
}

if (!isValidToken(token)) {
  throw new UnauthorizedError('Invalid authentication token');
}
```

### ForbiddenError

Used when authentication succeeded but authorization failed.

```typescript
/**
 * Forbidden error (403) for authorization failures
 */
export class ForbiddenError extends PresentationError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

// Usage examples
if (user.role !== 'admin') {
  throw new ForbiddenError();
}

if (!user.canAccess(resource)) {
  throw new ForbiddenError('You do not have permission to access this resource');
}
```

### RateLimitError

Used when rate limits are exceeded.

```typescript
/**
 * Rate limit error (429) for too many requests
 */
export class RateLimitError extends PresentationError {
  constructor(
    message = 'Too many requests',
    public readonly retryAfter?: number
  ) {
    super(message, 429);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

// Usage examples
if (!rateLimitResult.allowed) {
  throw new RateLimitError('Rate limit exceeded', rateLimitResult.retryAfter);
}
```

## Usage Guidelines

### When to Use Each Error Type

| Error Type           | Use When                             | Return vs Throw       |
| -------------------- | ------------------------------------ | --------------------- |
| ValidationError      | Invalid input data or business rules | Return from use case  |
| NotFoundError        | Entity lookup fails                  | Return from use case  |
| ConflictError        | Uniqueness constraint violated       | Return from use case  |
| AuthorizationError   | User lacks permissions               | Return from use case  |
| BusinessRuleError    | Generic business rule violation      | Return from use case  |
| DatabaseError        | Database connection/query fails      | Throw (unrecoverable) |
| ExternalServiceError | External API fails                   | Throw (unrecoverable) |
| CacheError           | KV operation fails                   | Throw (unrecoverable) |
| UnauthorizedError    | Authentication required              | Throw from middleware |
| ForbiddenError       | Authorization failed                 | Throw from middleware |
| RateLimitError       | Rate limit exceeded                  | Throw from middleware |

### Layer Responsibilities

```
┌─────────────────────────────────────────────┐
│ Presentation Layer                          │
│ - Throws: UnauthorizedError, ForbiddenError │
│ - Catches: All errors                       │
│ - Maps errors to HTTP responses             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Application Layer (Use Cases)               │
│ - Returns: ValidationError, NotFoundError,  │
│            ConflictError, AuthorizationError│
│ - Catches: Domain errors, converts to Result│
│ - Throws: Infrastructure errors (propagate) │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Domain Layer (Entities, Value Objects)      │
│ - Throws: ValidationError, DomainError      │
│ - No knowledge of HTTP or infrastructure    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Infrastructure Layer (Repositories)         │
│ - Throws: DatabaseError, CacheError,        │
│           ExternalServiceError              │
│ - Catches: Database errors, wraps in        │
│            infrastructure errors            │
└─────────────────────────────────────────────┘
```

## Testing Error Classes

### Testing Error Construction

```typescript
describe('ValidationError', () => {
  it('creates error with message', () => {
    const error = new ValidationError('Invalid data');

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Invalid data');
    expect(error.name).toBe('ValidationError');
  });

  it('creates error with field errors', () => {
    const fields = { email: ['Email is required'] };
    const error = new ValidationError('Validation failed', fields);

    expect(error.fields).toEqual(fields);
  });
});
```

### Testing Error Handling

```typescript
describe('createTask', () => {
  it('returns ValidationError for invalid input', async () => {
    const result = await createTask({ title: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it('throws DatabaseError for database failure', async () => {
    db.prepare.mockImplementation(() => {
      throw new Error('Connection lost');
    });

    await expect(createTask({ title: 'Test' })).rejects.toThrow(DatabaseError);
  });
});
```

### Testing Error Propagation

```typescript
describe('error propagation', () => {
  it('propagates domain errors as Results', async () => {
    // Domain layer throws
    const createTask = (): Task => {
      throw new ValidationError('Invalid title');
    };

    // Application layer catches and returns Result
    const execute = (): Result<Task, ValidationError> => {
      try {
        const task = createTask();
        return ok(task);
      } catch (error) {
        if (error instanceof ValidationError) {
          return err(error);
        }
        throw error;
      }
    };

    const result = execute();
    expect(result.success).toBe(false);
  });

  it('propagates infrastructure errors by throwing', async () => {
    // Infrastructure layer throws
    const saveTask = (): void => {
      throw new DatabaseError('Connection lost');
    };

    // Application layer lets it bubble up
    const execute = async (): Promise<Result<Task, ValidationError>> => {
      const task = new Task({ title: 'Test' });
      await saveTask(); // Throws DatabaseError
      return ok(task);
    };

    await expect(execute()).rejects.toThrow(DatabaseError);
  });
});
```

## Best Practices

### DO: Use Specific Error Types

```typescript
// ✅ Specific error type
if (!user) {
  return err(new NotFoundError('User not found'));
}
```

### DON'T: Use Generic Error

```typescript
// ❌ Generic error
if (!user) {
  return err(new Error('User not found'));
}
```

### DO: Include Context

```typescript
// ✅ Include helpful context
throw new NotFoundError('Entity not found', 'Task', taskId);

throw new DatabaseError('Query failed', query, error);
```

### DON'T: Include Sensitive Data

```typescript
// ❌ Includes password in error
throw new ValidationError(`Invalid password: ${password}`);

// ✅ Generic message
throw new ValidationError('Invalid password');
```

### DO: Set Prototype for instanceof

```typescript
// ✅ Set prototype for instanceof checks
export class MyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MyError';
    Object.setPrototypeOf(this, MyError.prototype); // Important!
  }
}
```

### DON'T: Forget Prototype

```typescript
// ❌ instanceof checks may fail
export class MyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MyError';
    // Missing: Object.setPrototypeOf(this, MyError.prototype);
  }
}
```
