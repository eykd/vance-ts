# DTO Mapping: Three-Layer Type System

## Purpose

Document the three-layer type system (Request → DTO → Entity → Response) to prevent type confusion and duplicate interfaces.

## Three-Layer Type System

```
Presentation     Application      Domain
    ↓                ↓              ↓
Request DTOs  →  Application DTOs  →  Domain Entities
    ↓                ↓              ↓
Response DTOs ←  Application DTOs  ←  Domain Entities
```

### Layer 1: Request DTOs (Presentation)

**Purpose**: Receive raw user input from HTTP requests.

**Characteristics**:

- Mirror HTTP request structure (form fields, JSON body)
- May have incorrect types (everything is string from forms)
- Unvalidated
- No business logic

```typescript
// src/presentation/dto/CreateTaskRequest.ts
export interface CreateTaskRequest {
  title: string; // Raw input from form field
  priority: string; // "high", "medium", "low" as string
  userId: string; // UUID as string
  dueDate?: string; // ISO date string from client
}
```

### Layer 2: Application DTOs (Use Case Boundary)

**Purpose**: Validated, type-safe data for use cases.

**Characteristics**:

- Validated types (enums, proper types)
- Sanitized (trimmed, normalized)
- Safe for business logic
- Still flat data structures

```typescript
// src/application/dto/CreateTaskDto.ts
export interface CreateTaskDto {
  title: string; // Validated, trimmed, 3-200 chars
  priority: 'low' | 'medium' | 'high'; // Enum validated
  userId: string; // UUID format validated
  dueDate?: Date; // Parsed to Date object
}
```

### Layer 3: Domain Entities (Business Logic)

**Purpose**: Encapsulate business logic and invariants.

**Characteristics**:

- Rich domain objects with methods
- Value objects for IDs, emails, money
- Business rule enforcement
- Immutable or controlled mutations

```typescript
// src/domain/entities/Task.ts
export class Task {
  private constructor(
    private readonly id: TaskId, // Value object, not string
    private title: string,
    private readonly userId: UserId, // Value object, not string
    private priority: TaskPriority, // Value object or enum
    private completed: boolean,
    private dueDate: Date | null
  ) {}

  static create(props: {
    title: string;
    userId: UserId;
    priority: TaskPriority;
    dueDate?: Date;
  }): Task {
    // Business rule validation
    if (props.title.length < 3) {
      throw new ValidationError('Title must be at least 3 characters');
    }

    return new Task(
      TaskId.generate(),
      props.title,
      props.userId,
      props.priority,
      false,
      props.dueDate ?? null
    );
  }

  // Business logic methods
  complete(): void {
    if (this.completed) {
      throw new DomainError('Task already completed');
    }
    this.completed = true;
  }
}
```

## Complete Mapping Flow

### Request → DTO → Entity (Create)

```typescript
// 1. Presentation: Handler receives request
export async function handleCreateTask(request: Request): Promise<Response> {
  const body = await request.json();

  // Extract Request DTO (raw, unvalidated)
  const requestDto: CreateTaskRequest = {
    title: body.title,
    priority: body.priority,
    userId: body.userId,
    dueDate: body.dueDate,
  };

  // Validate and transform to Application DTO
  const validation = validateCreateTaskRequest(requestDto);
  if (!validation.success) {
    return jsonResponse(422, {
      error: 'Invalid request data',
      fields: validation.errors,
    });
  }

  const applicationDto: CreateTaskDto = validation.value;

  // Execute use case with Application DTO
  const result = await createTaskUseCase.execute(applicationDto);

  if (!result.success) {
    return errorResponse(result.error);
  }

  // Transform to Response DTO
  return jsonResponse(201, toTaskResponse(result.value));
}

// 2. Validation: Transform Request DTO → Application DTO
function validateCreateTaskRequest(
  request: CreateTaskRequest
): Result<CreateTaskDto, Record<string, string[]>> {
  const errors: Record<string, string[]> = {};

  // Validate title
  const title = request.title?.trim();
  if (!title) {
    errors.title = ['Title is required'];
  } else if (title.length < 3) {
    errors.title = ['Title must be at least 3 characters'];
  } else if (title.length > 200) {
    errors.title = ['Title must be at most 200 characters'];
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(request.priority)) {
    errors.priority = [`Priority must be one of: ${validPriorities.join(', ')}`];
  }

  // Validate UUID
  if (!isUUID(request.userId)) {
    errors.userId = ['Invalid user ID format'];
  }

  // Validate date (optional)
  let dueDate: Date | undefined;
  if (request.dueDate) {
    dueDate = new Date(request.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.dueDate = ['Invalid date format'];
    }
  }

  if (Object.keys(errors).length > 0) {
    return err(errors);
  }

  return ok({
    title: title!,
    priority: request.priority as 'low' | 'medium' | 'high',
    userId: request.userId,
    dueDate,
  });
}

// 3. Application: Use case transforms Application DTO → Domain Entity
export class CreateTaskUseCase {
  async execute(dto: CreateTaskDto): Promise<Result<Task, ValidationError | ConflictError>> {
    try {
      // Transform Application DTO → Domain Entity
      const task = Task.create({
        title: dto.title,
        userId: UserId.fromString(dto.userId),
        priority: TaskPriority.fromString(dto.priority),
        dueDate: dto.dueDate,
      });

      // Save domain entity
      await this.repository.save(task);

      return ok(task);
    } catch (error) {
      if (error instanceof ValidationError) {
        return err(error);
      }
      if (error instanceof ConflictError) {
        return err(error);
      }
      throw error; // Infrastructure errors bubble up
    }
  }
}
```

### Entity → Response DTO (Read)

```typescript
// Domain Entity → Response DTO mapping
export function toTaskResponse(task: Task): TaskResponse {
  return {
    id: task.getId().toString(), // Value object → string
    title: task.getTitle(),
    priority: task.getPriority().toString(), // Value object/enum → string
    userId: task.getUserId().toString(), // Value object → string
    completed: task.isCompleted(),
    dueDate: task.getDueDate()?.toISOString() ?? null, // Date → ISO string
    createdAt: task.getCreatedAt().toISOString(), // Date → ISO string
  };
}

// Response DTO (presentation boundary)
export interface TaskResponse {
  id: string; // UUID string for JSON
  title: string;
  priority: string; // "low" | "medium" | "high"
  userId: string; // UUID string for JSON
  completed: boolean;
  dueDate: string | null; // ISO 8601 string
  createdAt: string; // ISO 8601 string
}
```

## Anti-Patterns

### ❌ Using Domain Entities as DTOs

**WRONG**: Exposing domain entities directly in HTTP responses.

```typescript
// ❌ Domain entity used as response
export async function handleGetTask(request: Request): Promise<Response> {
  const task = await repository.findById(taskId);

  // ❌ WRONG - Exposes internal domain structure
  return jsonResponse(200, task);
  // Problem: Value objects, methods, private fields exposed
  // Problem: Internal structure changes break API contract
}
```

**CORRECT**: Map domain entities to response DTOs.

```typescript
// ✅ Map to response DTO
export async function handleGetTask(request: Request): Promise<Response> {
  const task = await repository.findById(taskId);

  // ✅ CORRECT - Explicit mapping to DTO
  const response = toTaskResponse(task);
  return jsonResponse(200, response);
}
```

### ❌ Duplicate Interfaces

**WRONG**: Same structure defined in multiple places.

```typescript
// ❌ Duplicate interface in domain
export interface TaskProps {
  id: string;
  title: string;
  completed: boolean;
}

// ❌ Duplicate interface in application
export interface TaskDto {
  id: string;
  title: string;
  completed: boolean;
}

// ❌ Duplicate interface in presentation
export interface TaskResponse {
  id: string;
  title: string;
  completed: boolean;
}
```

**CORRECT**: Each layer has distinct purpose.

```typescript
// ✅ Domain entity (rich object with methods)
export class Task {
  private constructor(
    private readonly id: TaskId, // Value object
    private title: string,
    private completed: boolean
  ) {}

  complete(): void {
    /* business logic */
  }
}

// ✅ Application DTO (validated, type-safe)
export interface CreateTaskDto {
  title: string; // Validated 3-200 chars
  userId: string; // Validated UUID
}

// ✅ Response DTO (serializable)
export interface TaskResponse {
  id: string; // Converted from value object
  title: string;
  completed: boolean;
  createdAt: string; // ISO 8601 for JSON
}
```

### ❌ Validation in Multiple Places

**WRONG**: Same validation in handler, use case, and entity.

```typescript
// ❌ Validation in handler
if (title.length < 3) throw new Error('Too short');

// ❌ Validation in use case
if (dto.title.length < 3) throw new Error('Too short');

// ❌ Validation in entity
if (this.title.length < 3) throw new Error('Too short');
```

**CORRECT**: Validation at appropriate layer only.

```typescript
// ✅ Format validation in presentation (Request → DTO)
const validation = validateCreateTaskRequest(request);

// ✅ Business rule validation in domain (DTO → Entity)
const task = Task.create(dto); // Throws if business rules violated

// ✅ Constraint validation in infrastructure (Entity → DB)
await repository.save(task); // Throws ConflictError if UNIQUE violated
```

## Type Flow Summary

| Layer        | Type            | Purpose                      | Example                                                           |
| ------------ | --------------- | ---------------------------- | ----------------------------------------------------------------- |
| Presentation | Request DTO     | Raw HTTP input               | `{ title: "  task  ", priority: "high" }`                         |
| Presentation | Validation      | Transform & sanitize         | Trim, validate format, parse types                                |
| Application  | Application DTO | Validated, type-safe         | `{ title: "task", priority: "high" as const }`                    |
| Application  | Use Case        | Transform DTO → Entity       | Parse value objects, invoke entity factory                        |
| Domain       | Domain Entity   | Business logic, encapsulated | `Task` class with `complete()` method                             |
| Domain       | Value Objects   | Type-safe identifiers        | `TaskId`, `UserId`, `Email`                                       |
| Application  | Use Case Return | Entity → DTO                 | Extract data from entity                                          |
| Presentation | Response DTO    | Serializable for JSON        | `{ id: "uuid", title: "task", createdAt: "2024-01-28T00:00:00Z"}` |
| Presentation | HTTP Response   | JSON string                  | `JSON.stringify(responseDto)`                                     |

## Benefits of Three-Layer System

1. **Clear Boundaries**: Each layer has distinct responsibility
2. **Type Safety**: Validated types flow through system
3. **Maintainability**: Changes isolated to appropriate layer
4. **Testability**: Each layer testable independently
5. **Security**: Validation and sanitization at boundaries
6. **API Stability**: Response DTOs decouple from domain changes

## Common Questions

### Q: When do I create a new DTO vs reuse?

**A**: Create separate DTOs when structure or purpose differs:

- **Request DTO**: For each unique request shape
- **Application DTO**: For each use case input
- **Response DTO**: For each unique response shape

Reuse DTOs only when structure AND semantics are identical.

### Q: Should DTOs be classes or interfaces?

**A**: Use interfaces for DTOs (data only), classes for entities (behavior).

```typescript
// ✅ DTOs are interfaces (plain data)
export interface CreateTaskDto {
  title: string;
  userId: string;
}

// ✅ Entities are classes (behavior)
export class Task {
  complete(): void {
    /* ... */
  }
}
```

### Q: Where do I validate request data?

**A**: Three-layer validation:

1. **Presentation**: Format validation (types, lengths, patterns)
2. **Domain**: Business rules (title not empty, due date in future)
3. **Infrastructure**: Constraints (UNIQUE violations)

See [validation-architecture.md](../../ddd-domain-modeling/references/validation-architecture.md) for details.

### Q: Can I skip Application DTOs?

**A**: No. Request DTOs are unvalidated; Domain Entities require validated input. Application DTOs are the validated boundary.

```
Request DTO (unvalidated) → Validation → Application DTO (validated) → Domain Entity
```

## Related Skills

- **validation-architecture**: Three-layer validation strategy
- **error-handling-patterns**: Result types for use case returns
- **ddd-domain-modeling**: Domain entities, value objects
- **worker-request-handler**: Request extraction, response formatting
