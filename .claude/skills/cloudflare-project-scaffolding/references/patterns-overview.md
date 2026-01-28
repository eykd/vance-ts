# Patterns Overview and Cross-Reference

## Purpose

Comprehensive cross-reference map and decision trees for navigating the skill ecosystem. Use this to quickly find the right skill for your task.

## Pattern Decision Tree

### "I'm handling user input"

**Skills to use:**

1. `/error-handling-patterns` - Result types for use case returns
2. `/ddd-domain-modeling` → `validation-architecture.md` - Three-layer validation strategy
3. `/security-review` → `metadata-validation.md` - Content-Type, Content-Length, file upload validation
4. `/worker-request-handler` - Request extraction and error responses

**Flow:**

```
HTTP Request
    ↓
Presentation: Validate format (Content-Type, Content-Length, string length)
    ↓
Application DTO: Validated, type-safe
    ↓
Domain Entity: Business rule validation
    ↓
Infrastructure: Constraint validation (UNIQUE, FOREIGN KEY)
    ↓
Use Case: Return Result<T, E>
    ↓
Handler: Map to HTTP response
```

**Common mistakes:**

- ❌ No Content-Length validation before reading body
- ❌ Using domain entities as DTOs
- ❌ Throwing exceptions from use cases (should return Result)
- ❌ Duplicate validation in multiple layers

### "I'm working with dates/times"

**Skills to use:**

1. `/portable-datetime` - UTC storage, timezone conversion, time injection
2. Check storage: ISO 8601 UTC strings (string type, not Date)
3. Check calculations: setUTC\* methods only
4. Check tests: Time injection pattern

**Rules:**

- ✅ Store timestamps as UTC ISO 8601 strings
- ✅ Calculate with UTC methods (`setUTCHours`, `getUTCDate`)
- ✅ Convert to local timezone only at presentation boundary
- ✅ Inject time in tests: `createTask({ ..., createdAt: '2024-01-28T00:00:00Z' })`
- ❌ Never use Date objects in domain entities
- ❌ Never use local time methods (`setDate`, `getHours`)

**Common mistakes:**

- ❌ Using `new Date()` directly (not testable, timezone issues)
- ❌ Storing Date objects in domain entities
- ❌ Using local time methods for calculations

### "I'm implementing security features"

**Skills to use:**

1. `/security-review` → `rate-limiting.md` - KV-based rate limiter with working code
2. `/security-review` → `web-security.md` - CSP, XSS, CSRF prevention
3. `/security-review` → `data-security.md` - SQL injection, validation
4. `/security-review` → `metadata-validation.md` - Content-Type, file upload validation
5. `/worker-request-handler` → `middleware.md` - Security headers with nonce-based CSP
6. `/error-handling-patterns` → `error-responses.md` - Prevent error disclosure

**Critical implementations:**

- **Rate limiting**: MANDATORY on login, registration, password reset
- **CSP**: Hash-based for static Hugo pages, nonce-based for dynamic Worker responses
- **Request validation**: Content-Type and Content-Length BEFORE parsing body
- **Error responses**: Generic messages only, detailed logging server-side

**Common vulnerabilities:**

- ❌ No rate limiting on authentication endpoints
- ❌ Using `unsafe-inline` in production CSP
- ❌ Reading request body without size limit
- ❌ Exposing stack traces or SQL queries in error responses

### "I'm designing domain models"

**Skills to use:**

1. `/ddd-domain-modeling` → `entities.md` - Entity patterns and factories
2. `/ddd-domain-modeling` → `value-objects.md` - Value object patterns and migration table
3. `/ddd-domain-modeling` → `validation-architecture.md` - Where to validate
4. `/error-handling-patterns` - Domain errors and Result types
5. `/d1-repository-implementation` → `d1-patterns.md` - Avoid anti-patterns (toRow, fromRow)

**Checklist:**

- [ ] IDs use value objects (UserId, TaskId), not string primitives
- [ ] Emails use Email value object, not string
- [ ] Money uses Money value object with currency, not number
- [ ] Entities have business logic methods, not just getters/setters
- [ ] No `toRow()` or `fromRow()` methods in domain entities
- [ ] Repository interfaces in `domain/interfaces/`
- [ ] Timestamps stored as UTC ISO strings (string type)

**Common mistakes:**

- ❌ Primitive obsession (using string for IDs, emails, money)
- ❌ Anemic domain model (entities with no business logic)
- ❌ Database methods in domain entities (`toRow`, `fromRow`)
- ❌ Exposing row types outside repository

### "I'm implementing use cases"

**Skills to use:**

1. `/cloudflare-use-case-creator` - Use case patterns
2. `/cloudflare-use-case-creator` → `dto-mapping.md` - Request → DTO → Entity → Response flow
3. `/error-handling-patterns` - Result types, never throw from use cases
4. `/ddd-domain-modeling` → `repositories.md` - Repository interfaces

**Pattern:**

```typescript
export class CreateTaskUseCase {
  async execute(dto: CreateTaskDto): Promise<Result<Task, ValidationError | ConflictError>> {
    try {
      // Create domain entity
      const task = Task.create(dto);

      // Save via repository
      try {
        await this.repository.save(task);
        return ok(task);
      } catch (error) {
        if (error instanceof ConflictError) {
          return err(error); // Expected error
        }
        throw error; // Infrastructure errors bubble up
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        return err(error); // Domain validation error
      }
      throw error; // Unexpected errors bubble up
    }
  }
}
```

**Rules:**

- ✅ Use cases ALWAYS return `Result<T, E>` types
- ✅ Catch domain errors (ValidationError, NotFoundError) and return as Result
- ✅ Let infrastructure errors (DatabaseError) bubble up
- ❌ Never throw domain errors from use cases
- ❌ Never use domain entities as DTOs

### "I'm implementing repositories"

**Skills to use:**

1. `/d1-repository-implementation` → `d1-patterns.md` - Repository patterns and anti-patterns
2. `/ddd-domain-modeling` → `repositories.md` - Repository interfaces
3. `/cloudflare-migrations` - Database migrations
4. `/vitest-cloudflare-config` - Testing with D1

**Rules:**

- ✅ Interface in `domain/interfaces/TaskRepository.ts`
- ✅ Implementation in `infrastructure/repositories/D1TaskRepository.ts`
- ✅ Row types private to repository implementation
- ✅ All mapping (snake_case ↔ camelCase, types) in repository
- ✅ Catch UNIQUE violations → throw ConflictError
- ❌ Never add `toRow()` or `fromRow()` to domain entities
- ❌ Never expose row types outside repository

### "I'm implementing HTTP handlers"

**Skills to use:**

1. `/worker-request-handler` - Request/response patterns
2. `/worker-request-handler` → `middleware.md` - Security headers, nonce-based CSP
3. `/error-handling-patterns` → `error-responses.md` - Safe error responses
4. `/cloudflare-use-case-creator` → `dto-mapping.md` - Request → DTO transformation
5. `/security-review` → `metadata-validation.md` - Content-Type, Content-Length validation

**Pattern:**

```typescript
export async function handleCreateTask(request: Request, env: Env): Promise<Response> {
  // 1. Validate metadata
  const contentTypeResult = validateContentType(request, 'application/json');
  if (!contentTypeResult.success) {
    return jsonResponse(415, { error: 'Unsupported media type' });
  }

  const lengthResult = validateContentLength(request, 10 * 1024); // 10KB
  if (!lengthResult.success) {
    return jsonResponse(413, { error: 'Request too large' });
  }

  // 2. Parse and validate request
  const body = await request.json();
  const validation = validateCreateTaskRequest(body);
  if (!validation.success) {
    return jsonResponse(422, { error: 'Invalid data', fields: validation.errors });
  }

  // 3. Execute use case
  const result = await createTaskUseCase.execute(validation.value);

  // 4. Map to response
  if (!result.success) {
    return errorResponse(result.error);
  }

  return jsonResponse(201, toTaskResponse(result.value));
}
```

### "I'm reviewing code"

**Skills to use:**

- **Security**: `/security-review` - Authentication, rate limiting, CSP, error disclosure
- **Architecture**: `/clean-architecture-validator` - Layer boundaries, dependencies
- **Quality**: `/quality-review` - Error handling, validation, domain modeling, datetime

**Review order:**

1. Security review FIRST (vulnerabilities can't wait)
2. Architecture review SECOND (structure affects everything)
3. Quality review LAST (polish after foundation is solid)

**Common issues to check:**

- Rate limiting on auth endpoints
- CSP headers present (hash-based for static, nonce-based for dynamic)
- Use cases return Result types
- No primitive obsession (string IDs → value objects)
- No database methods in domain entities
- Timestamps as UTC ISO strings
- Generic error messages (no stack traces)

## Integration Map

### Error Handling Integration

| Layer        | Skill                   | Responsibility                     |
| ------------ | ----------------------- | ---------------------------------- |
| Presentation | worker-request-handler  | Map Result → HTTP response         |
| Application  | error-handling-patterns | Return Result<T, E> from use cases |
| Domain       | ddd-domain-modeling     | Throw ValidationError in entities  |
| Domain       | error-handling-patterns | Define error hierarchy             |
| All          | security-review         | Prevent error disclosure           |

### Validation Integration

| Layer          | Skill                                       | Validation Type              |
| -------------- | ------------------------------------------- | ---------------------------- |
| Presentation   | security-review/metadata-validation         | Content-Type, Content-Length |
| Presentation   | worker-request-handler                      | Format validation (types)    |
| Application    | cloudflare-use-case-creator/dto-mapping     | DTO validation               |
| Domain         | ddd-domain-modeling/validation-architecture | Business rules               |
| Infrastructure | d1-repository-implementation                | Constraints (UNIQUE, FK)     |

### Security Integration

| Feature       | Skill                                   | Implementation                     |
| ------------- | --------------------------------------- | ---------------------------------- |
| Rate Limiting | security-review/rate-limiting           | KV-based rate limiter              |
| CSP (Static)  | hugo/static/\_headers                   | Hash-based CSP                     |
| CSP (Dynamic) | worker-request-handler/middleware       | Nonce-based CSP                    |
| Metadata      | security-review/metadata-validation     | Content-Type, size limits          |
| Error Safety  | error-handling-patterns/error-responses | Generic messages, detailed logging |

### Data Flow Integration

```
Request
    ↓
security-review/metadata-validation (Content-Type, Content-Length)
    ↓
worker-request-handler (parse body)
    ↓
cloudflare-use-case-creator/dto-mapping (Request → Application DTO)
    ↓
ddd-domain-modeling (Application DTO → Domain Entity)
    ↓
d1-repository-implementation (Entity → Row)
    ↓
Database
    ↓
d1-repository-implementation (Row → Entity)
    ↓
cloudflare-use-case-creator/dto-mapping (Entity → Response DTO)
    ↓
worker-request-handler (DTO → JSON response)
    ↓
Response
```

## Quick Reference by File Type

### Creating New Files

| What to Create            | Skills to Use                                               |
| ------------------------- | ----------------------------------------------------------- |
| Domain entity             | ddd-domain-modeling/entities, error-handling-patterns       |
| Value object              | ddd-domain-modeling/value-objects (migration table)         |
| Repository interface      | ddd-domain-modeling/repositories                            |
| Repository implementation | d1-repository-implementation/d1-patterns (anti-patterns!)   |
| Use case                  | cloudflare-use-case-creator, error-handling-patterns        |
| HTTP handler              | worker-request-handler, security-review/metadata-validation |
| Request DTO               | cloudflare-use-case-creator/dto-mapping                     |
| Response DTO              | cloudflare-use-case-creator/dto-mapping                     |
| Migration                 | cloudflare-migrations                                       |
| Test                      | typescript-unit-testing, vitest-cloudflare-config           |

### Reviewing Existing Code

| Code to Review  | Skills to Use                                               |
| --------------- | ----------------------------------------------------------- |
| Authentication  | security-review/auth-security, security-review/checklist    |
| Rate limiting   | security-review/rate-limiting                               |
| Domain entities | ddd-domain-modeling, quality-review (section 8)             |
| Repositories    | d1-repository-implementation/d1-patterns (anti-patterns)    |
| Use cases       | error-handling-patterns (Result types)                      |
| HTTP handlers   | worker-request-handler, security-review/metadata-validation |
| Validation      | ddd-domain-modeling/validation-architecture                 |
| Error handling  | error-handling-patterns, security-review (disclosure)       |
| Datetime code   | portable-datetime, quality-review (section 9)               |

## Common Scenarios

### Scenario: User Registration

**Skills needed (in order):**

1. `/security-review/rate-limiting` - Rate limit by IP (3 attempts/hour)
2. `/security-review/metadata-validation` - Validate Content-Type and size
3. `/worker-request-handler` - Extract and validate request
4. `/cloudflare-use-case-creator/dto-mapping` - Request → DTO
5. `/ddd-domain-modeling/value-objects` - Email, UserId value objects
6. `/ddd-domain-modeling/entities` - User entity with validation
7. `/error-handling-patterns` - Result type from use case
8. `/d1-repository-implementation` - Save user, catch UNIQUE violation
9. `/worker-request-handler/middleware` - Security headers in response
10. `/error-handling-patterns/error-responses` - Generic error messages

### Scenario: Task Creation

**Skills needed (in order):**

1. `/worker-request-handler/middleware` - Auth middleware
2. `/security-review/metadata-validation` - Content-Type, Content-Length
3. `/worker-request-handler` - Parse request
4. `/cloudflare-use-case-creator/dto-mapping` - Request → Application DTO
5. `/ddd-domain-modeling/entities` - Task entity factory
6. `/portable-datetime` - CreatedAt as UTC ISO string
7. `/error-handling-patterns` - Use case returns Result
8. `/d1-repository-implementation` - Save task
9. `/cloudflare-use-case-creator/dto-mapping` - Entity → Response DTO
10. `/worker-request-handler` - JSON response

### Scenario: Datetime Display

**Skills needed (in order):**

1. `/portable-datetime` - UTC storage pattern
2. `/d1-repository-implementation` - Store as TEXT in UTC
3. `/ddd-domain-modeling/entities` - Store as string in entity
4. `/cloudflare-use-case-creator/dto-mapping` - Entity → Response DTO (keep as UTC ISO string)
5. `/worker-request-handler` - Return UTC string in JSON
6. **Frontend**: Convert to local timezone for display only

## Related Documentation

- **Architecture**: Clean Architecture layers, dependency rules
- **Security**: OWASP Top 10, rate limiting, CSP
- **Domain Design**: DDD patterns, value objects, aggregates
- **Data Access**: Repository pattern, migrations, testing
- **Error Handling**: Result types, error hierarchies, safe responses
- **Validation**: Three-layer strategy, separation of concerns
- **Datetime**: UTC storage, portable calculations, timezone conversion
