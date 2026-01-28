# HTTP Error Response Mapping

## Security-First Error Responses

**CRITICAL**: Never expose internal error details, stack traces, file paths, database information, or system architecture in error responses.

## Response Format

### Standard Error Response

```typescript
type ErrorResponse = {
  error: string; // Generic user-facing message
  code?: string; // Optional error code for client handling
  fields?: Record<string, string[]>; // Optional field-level validation errors
};
```

### Examples

```json
// Generic error
{
  "error": "An error occurred"
}

// Validation error with field details
{
  "error": "Invalid request data",
  "code": "VALIDATION_ERROR",
  "fields": {
    "email": ["Email is required", "Email must be valid"],
    "password": ["Password must be at least 8 characters"]
  }
}

// Not found error
{
  "error": "Resource not found",
  "code": "NOT_FOUND"
}
```

## Error Mapping

### Complete Mapping Table

| Error Class          | HTTP Status | User Message                      | Log Details                       |
| -------------------- | ----------- | --------------------------------- | --------------------------------- |
| ValidationError      | 422         | "Invalid request data"            | Include validation errors         |
| NotFoundError        | 404         | "Resource not found"              | Include entity type and ID        |
| ConflictError        | 409         | "Resource already exists"         | Include conflicting field         |
| AuthorizationError   | 403         | "Access denied"                   | Include user ID, resource, action |
| BusinessRuleError    | 422         | "Operation not allowed"           | Include business rule name        |
| UnauthorizedError    | 401         | "Authentication required"         | Include authentication method     |
| ForbiddenError       | 403         | "Access denied"                   | Include user role, required role  |
| RateLimitError       | 429         | "Too many requests"               | Include identifier, limits        |
| DatabaseError        | 500         | "An error occurred"               | Include query, error details      |
| ExternalServiceError | 502         | "Service temporarily unavailable" | Include service name, status      |
| CacheError           | 500         | "An error occurred"               | Include operation, key            |
| Error (generic)      | 500         | "An error occurred"               | Include full stack trace          |

## Implementation

### Error Response Builder

```typescript
/**
 * Build safe error response from error
 * Logs detailed errors, returns generic messages
 */
export function errorResponse(error: unknown): Response {
  // Log detailed error for debugging
  logError(error);

  // Map to HTTP status and safe message
  const statusCode = getStatusCode(error);
  const body = buildErrorBody(error);

  return jsonResponse(statusCode, body);
}

function getStatusCode(error: unknown): number {
  if (error instanceof ValidationError) return 422;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ConflictError) return 409;
  if (error instanceof AuthorizationError) return 403;
  if (error instanceof BusinessRuleError) return 422;
  if (error instanceof UnauthorizedError) return 401;
  if (error instanceof ForbiddenError) return 403;
  if (error instanceof RateLimitError) return 429;
  if (error instanceof ExternalServiceError) return 502;
  return 500;
}

function buildErrorBody(error: unknown): ErrorResponse {
  // Validation errors can include field details
  if (error instanceof ValidationError) {
    return {
      error: 'Invalid request data',
      code: 'VALIDATION_ERROR',
      fields: error.fields,
    };
  }

  // Not found errors
  if (error instanceof NotFoundError) {
    return {
      error: 'Resource not found',
      code: 'NOT_FOUND',
    };
  }

  // Conflict errors
  if (error instanceof ConflictError) {
    return {
      error: 'Resource already exists',
      code: 'CONFLICT',
    };
  }

  // Authorization errors
  if (error instanceof AuthorizationError || error instanceof ForbiddenError) {
    return {
      error: 'Access denied',
      code: 'FORBIDDEN',
    };
  }

  // Authentication errors
  if (error instanceof UnauthorizedError) {
    return {
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    };
  }

  // Rate limit errors (include retry-after header separately)
  if (error instanceof RateLimitError) {
    return {
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
    };
  }

  // External service errors
  if (error instanceof ExternalServiceError) {
    return {
      error: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
    };
  }

  // Generic error (infrastructure, database, etc.)
  return {
    error: 'An error occurred',
    code: 'INTERNAL_ERROR',
  };
}
```

### Error Logging

```typescript
/**
 * Log error with context for debugging
 * NEVER log sensitive data (passwords, tokens, credit cards)
 */
function logError(error: unknown): void {
  const timestamp = new Date().toISOString();

  // Base log entry
  const logEntry: Record<string, unknown> = {
    timestamp,
    level: 'error',
  };

  // Add error details
  if (error instanceof Error) {
    logEntry.name = error.name;
    logEntry.message = error.message;
    logEntry.stack = error.stack;

    // Add specific error context
    if (error instanceof DatabaseError) {
      logEntry.query = error.query;
      logEntry.cause = error.cause?.message;
    }

    if (error instanceof ExternalServiceError) {
      logEntry.service = error.service;
      logEntry.statusCode = error.statusCode;
    }

    if (error instanceof NotFoundError) {
      logEntry.entityType = error.entityType;
      logEntry.entityId = error.entityId;
    }

    if (error instanceof ConflictError) {
      logEntry.field = error.field;
    }

    if (error instanceof ValidationError) {
      logEntry.fields = error.fields;
    }
  } else {
    logEntry.error = String(error);
  }

  // Log to console (or external logging service)
  console.error(JSON.stringify(logEntry));
}
```

### Rate Limit Response with Retry-After

```typescript
/**
 * Build rate limit error response with Retry-After header
 */
export function rateLimitResponse(error: RateLimitError): Response {
  logError(error);

  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  // Add Retry-After header if available
  if (error.retryAfter) {
    headers.set('Retry-After', String(Math.ceil(error.retryAfter / 1000)));
  }

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
    }),
    {
      status: 429,
      headers,
    }
  );
}
```

## Security Guidelines

### ❌ NEVER Expose

```typescript
// ❌ WRONG - Exposes database query
return jsonResponse(500, {
  error: `Query failed: SELECT * FROM users WHERE email = '${email}'`,
});

// ❌ WRONG - Exposes file path
return jsonResponse(500, {
  error: error.stack, // Contains file paths
});

// ❌ WRONG - Exposes internal architecture
return jsonResponse(500, {
  error: 'Database connection to 10.0.0.5:5432 failed',
});

// ❌ WRONG - Exposes validation logic
return jsonResponse(422, {
  error: 'Password must match regex: ^(?=.*[A-Z])(?=.*[0-9])...',
});
```

### ✅ ALWAYS Use Generic Messages

```typescript
// ✅ CORRECT - Generic message, log details
logger.error('Query failed', { query, error });
return jsonResponse(500, { error: 'An error occurred' });

// ✅ CORRECT - No stack trace in response
logger.error('Internal error', { error: error.stack });
return jsonResponse(500, { error: 'An error occurred' });

// ✅ CORRECT - Generic message
logger.error('Database connection failed', { host, port });
return jsonResponse(500, { error: 'An error occurred' });

// ✅ CORRECT - Generic validation message
logger.info('Password validation failed', { rules });
return jsonResponse(422, { error: 'Password does not meet requirements' });
```

## Use Case Error Handling

### Pattern: Use Case Returns Result

```typescript
export class CreateTaskUseCase {
  async execute(dto: CreateTaskDto): Promise<Result<Task, ValidationError | ConflictError>> {
    // Validate
    const validation = this.validator.validate(dto);
    if (!validation.success) {
      return err(new ValidationError('Invalid task data', validation.errors));
    }

    // Domain logic
    try {
      const task = Task.create(validation.value);

      // Save
      try {
        await this.repository.save(task);
        return ok(task);
      } catch (e) {
        // Infrastructure errors bubble up
        if (e instanceof ConflictError) {
          return err(e);
        }
        throw e;
      }
    } catch (e) {
      // Domain errors become Result
      if (e instanceof ValidationError) {
        return err(e);
      }
      throw e;
    }
  }
}
```

### Pattern: Handler Maps Result to Response

```typescript
export async function handleCreateTask(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    // Execute use case
    const result = await createTaskUseCase.execute(body);

    // Map success
    if (result.success) {
      return jsonResponse(201, toTaskResponse(result.value));
    }

    // Map errors
    return errorResponse(result.error);
  } catch (error) {
    // Infrastructure errors caught here
    return errorResponse(error);
  }
}
```

## Validation Error Details

### Safe Field-Level Errors

```typescript
// ✅ SAFE - Generic field messages
{
  "error": "Invalid request data",
  "fields": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Unsafe Field-Level Errors

```typescript
// ❌ UNSAFE - Exposes validation logic
{
  "error": "Invalid request data",
  "fields": {
    "email": ["Must match /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/"],
    "password": ["Must match /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/"]
  }
}

// ❌ UNSAFE - Exposes business logic
{
  "error": "Invalid request data",
  "fields": {
    "email": ["Email admin@example.com is reserved for system use"]
  }
}
```

## Testing Error Responses

### Test Generic Messages

```typescript
describe('errorResponse', () => {
  it('returns generic message for DatabaseError', () => {
    const error = new DatabaseError('Connection to 10.0.0.5 failed');

    const response = errorResponse(error);

    expect(response.status).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('An error occurred');
    expect(body.error).not.toContain('10.0.0.5'); // No internal details
  });

  it('returns generic message for Error', () => {
    const error = new Error('Null pointer at /app/src/handlers/task.ts:42');

    const response = errorResponse(error);

    expect(response.status).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('An error occurred');
    expect(body.error).not.toContain('/app/src'); // No file paths
  });
});
```

### Test Safe Field Errors

```typescript
describe('validation error response', () => {
  it('includes safe field-level errors', () => {
    const error = new ValidationError('Validation failed', {
      email: ['Email is required'],
      password: ['Password must be at least 8 characters'],
    });

    const response = errorResponse(error);

    expect(response.status).toBe(422);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Invalid request data');
    expect(body.fields).toEqual({
      email: ['Email is required'],
      password: ['Password must be at least 8 characters'],
    });
  });

  it('does not include validation regex', () => {
    const error = new ValidationError('Invalid email format');

    const response = errorResponse(error);

    const body = JSON.parse(response.body);
    expect(JSON.stringify(body)).not.toMatch(/regex|\\w|\\d|\[\^/); // No regex
  });
});
```

### Test Error Logging

```typescript
describe('logError', () => {
  it('logs detailed error information', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const error = new DatabaseError('Query failed', 'SELECT * FROM tasks');
    logError(error);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('DatabaseError'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM tasks'));

    consoleSpy.mockRestore();
  });

  it('does not log passwords', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const error = new ValidationError('Invalid credentials');
    logError(error);

    const loggedData = consoleSpy.mock.calls[0][0];
    expect(loggedData).not.toContain('password');
    expect(loggedData).not.toContain('secret');
    expect(loggedData).not.toContain('token');

    consoleSpy.mockRestore();
  });
});
```

## Best Practices Checklist

- [ ] Return generic error messages to clients
- [ ] Log detailed errors server-side
- [ ] Never expose stack traces, file paths, or SQL queries
- [ ] Use specific HTTP status codes (422, 404, 409, etc.)
- [ ] Include safe field-level validation errors
- [ ] Add Retry-After header for rate limit errors
- [ ] Use error codes for client-side error handling
- [ ] Test that internal details are not exposed
- [ ] Log errors with structured data (JSON)
- [ ] Never log passwords, tokens, or sensitive data
