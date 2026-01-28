# Validation Architecture

## Three-Layer Validation Strategy

Validation in a Clean Architecture application happens at **three distinct layers**, each with different responsibilities:

```
┌──────────────────────────────────────────────────┐
│ Layer 1: Presentation (Input Validation)        │
│ - Type checking (string, number, boolean)       │
│ - Format validation (email format, UUID format)  │
│ - Allowlist validation (enum values)            │
│ - Length limits, character restrictions          │
│ - Returns: 422 Unprocessable Entity              │
└──────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│ Layer 2: Domain (Business Rule Validation)      │
│ - Business logic rules                           │
│ - Value object constraints                       │
│ - Entity invariants                              │
│ - Throws: ValidationError, DomainError           │
└──────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│ Layer 3: Infrastructure (Constraint Validation) │
│ - Uniqueness constraints (UNIQUE indexes)        │
│ - Foreign key constraints                        │
│ - Database-level validation                      │
│ - Throws: ConflictError (from UNIQUE violation)  │
└──────────────────────────────────────────────────┘
```

## Layer 1: Presentation Validation

**Purpose**: Validate request format and type before passing to application layer.

**Location**: HTTP handlers, before calling use cases.

**Tools**: String validators, allowlist validators, format checkers.

**Returns**: 422 status code with field-level errors.

### Implementation

```typescript
// String validator
export class StringValidator {
  constructor(
    private readonly minLength?: number,
    private readonly maxLength?: number,
    private readonly pattern?: RegExp
  ) {}

  validate(value: unknown): Result<string, ValidationError> {
    if (typeof value !== 'string') {
      return err(new ValidationError('Must be a string'));
    }

    if (this.minLength && value.length < this.minLength) {
      return err(new ValidationError(`Must be at least ${this.minLength} characters`));
    }

    if (this.maxLength && value.length > this.maxLength) {
      return err(new ValidationError(`Must be at most ${this.maxLength} characters`));
    }

    if (this.pattern && !this.pattern.test(value)) {
      return err(new ValidationError('Invalid format'));
    }

    return ok(value);
  }
}

// Allowlist validator
export class AllowlistValidator<T extends string> {
  constructor(private readonly allowedValues: readonly T[]) {}

  validate(value: unknown): Result<T, ValidationError> {
    if (typeof value !== 'string') {
      return err(new ValidationError('Must be a string'));
    }

    if (!this.allowedValues.includes(value as T)) {
      return err(new ValidationError(`Must be one of: ${this.allowedValues.join(', ')}`));
    }

    return ok(value as T);
  }
}
```

### Handler Usage

```typescript
export async function handleCreateTask(request: Request): Promise<Response> {
  const body = await request.json();

  // Layer 1: Presentation validation
  const titleValidator = new StringValidator(3, 200);
  const priorityValidator = new AllowlistValidator(['low', 'medium', 'high'] as const);

  const titleResult = titleValidator.validate(body.title);
  if (!titleResult.success) {
    return jsonResponse(422, {
      error: 'Invalid request data',
      fields: { title: [titleResult.error.message] },
    });
  }

  const priorityResult = priorityValidator.validate(body.priority);
  if (!priorityResult.success) {
    return jsonResponse(422, {
      error: 'Invalid request data',
      fields: { priority: [priorityResult.error.message] },
    });
  }

  // Pass validated data to use case
  const dto: CreateTaskDto = {
    title: titleResult.value,
    priority: priorityResult.value,
    userId: body.userId,
  };

  const result = await createTaskUseCase.execute(dto);

  if (!result.success) {
    return errorResponse(result.error);
  }

  return jsonResponse(201, toTaskResponse(result.value));
}
```

### Validation Schema Pattern

For complex requests, use a validation schema:

```typescript
type ValidationSchema<T> = {
  [K in keyof T]: Validator<T[K]>;
};

export class SchemaValidator<T> {
  constructor(private readonly schema: ValidationSchema<T>) {}

  validate(data: unknown): Result<T, ValidationError> {
    if (typeof data !== 'object' || data === null) {
      return err(new ValidationError('Must be an object'));
    }

    const validated: Partial<T> = {};
    const errors: Record<string, string[]> = {};

    for (const [key, validator] of Object.entries(this.schema)) {
      const value = (data as Record<string, unknown>)[key];
      const result = validator.validate(value);

      if (!result.success) {
        errors[key] = [result.error.message];
      } else {
        validated[key as keyof T] = result.value;
      }
    }

    if (Object.keys(errors).length > 0) {
      return err(new ValidationError('Validation failed', errors));
    }

    return ok(validated as T);
  }
}

// Usage
const createTaskSchema = new SchemaValidator<CreateTaskDto>({
  title: new StringValidator(3, 200),
  priority: new AllowlistValidator(['low', 'medium', 'high'] as const),
  userId: new StringValidator(36, 36, UUID_PATTERN),
});

const result = createTaskSchema.validate(body);
if (!result.success) {
  return jsonResponse(422, {
    error: 'Invalid request data',
    fields: result.error.fields,
  });
}
```

## Layer 2: Domain Validation

**Purpose**: Enforce business rules and entity invariants.

**Location**: Entity constructors, value object constructors, domain methods.

**Tools**: Throw ValidationError, throw DomainError.

**Returns**: Use case catches and returns Result<T, ValidationError>.

### Value Object Validation

```typescript
export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    // Business rule: email must be normalized lowercase
    const normalized = value.toLowerCase().trim();

    // Business rule: email must match format
    if (!this.isValidFormat(normalized)) {
      throw new ValidationError('Invalid email format');
    }

    // Business rule: no disposable email domains
    if (this.isDisposable(normalized)) {
      throw new ValidationError('Disposable email addresses are not allowed');
    }

    return new Email(normalized);
  }

  private static isValidFormat(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private static isDisposable(email: string): boolean {
    const domain = email.split('@')[1];
    return ['tempmail.com', '10minutemail.com'].includes(domain);
  }

  toString(): string {
    return this.value;
  }
}
```

### Entity Validation

```typescript
export class Task {
  private constructor(
    private readonly id: TaskId,
    private title: string,
    private readonly userId: UserId,
    private completed: boolean
  ) {}

  static create(props: { title: string; userId: UserId }): Task {
    // Business rule: title must not be empty after trim
    const trimmed = props.title.trim();
    if (trimmed.length === 0) {
      throw new ValidationError('Task title cannot be empty');
    }

    // Business rule: title must not contain profanity
    if (this.containsProfanity(trimmed)) {
      throw new ValidationError('Task title contains inappropriate content');
    }

    return new Task(TaskId.generate(), trimmed, props.userId, false);
  }

  complete(): void {
    // Business rule: cannot complete already completed task
    if (this.completed) {
      throw new DomainError('Task is already completed');
    }

    this.completed = true;
  }

  private static containsProfanity(text: string): boolean {
    // Business logic for profanity detection
    return false;
  }
}
```

### Use Case Error Handling

```typescript
export class CreateTaskUseCase {
  async execute(dto: CreateTaskDto): Promise<Result<Task, ValidationError | ConflictError>> {
    // Layer 2: Domain validation (catch exceptions)
    try {
      const userId = UserId.fromString(dto.userId);
      const task = Task.create({
        title: dto.title,
        userId,
      });

      // Layer 3: Infrastructure (catch exceptions)
      try {
        await this.repository.save(task);
        return ok(task);
      } catch (error) {
        if (error instanceof ConflictError) {
          return err(error);
        }
        throw error; // Infrastructure errors bubble up
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        return err(error); // Domain validation error
      }
      if (error instanceof DomainError) {
        return err(new ValidationError(error.message));
      }
      throw error; // Unexpected errors bubble up
    }
  }
}
```

## Layer 3: Infrastructure Validation

**Purpose**: Enforce database constraints (uniqueness, foreign keys).

**Location**: Repository implementations.

**Tools**: Catch UNIQUE constraint violations, throw ConflictError.

**Returns**: Use case catches and returns Result<T, ConflictError>.

### Repository Implementation

```typescript
export class D1TaskRepository implements TaskRepository {
  async save(task: Task): Promise<void> {
    const query = `
      INSERT INTO tasks (id, user_id, title, completed)
      VALUES (?, ?, ?, ?)
    `;

    try {
      await this.db
        .prepare(query)
        .bind(
          task.getId().toString(),
          task.getUserId().toString(),
          task.getTitle(),
          task.isCompleted() ? 1 : 0
        )
        .run();
    } catch (error) {
      // Layer 3: Uniqueness constraint violation
      if (error instanceof Error && error.message.includes('UNIQUE')) {
        throw new ConflictError('Task already exists');
      }

      // Layer 3: Foreign key constraint violation
      if (error instanceof Error && error.message.includes('FOREIGN KEY')) {
        throw new ValidationError('User does not exist');
      }

      // Infrastructure error (connection lost, etc.)
      throw new DatabaseError('Failed to save task', query, error as Error);
    }
  }

  async findByUserAndTitle(userId: UserId, title: string): Promise<Task | null> {
    const query = `
      SELECT id, user_id, title, completed
      FROM tasks
      WHERE user_id = ? AND title = ?
    `;

    try {
      const result = await this.db.prepare(query).bind(userId.toString(), title).first<TaskRow>();

      if (!result) {
        return null;
      }

      return this.toDomain(result);
    } catch (error) {
      throw new DatabaseError('Failed to find task', query, error as Error);
    }
  }

  private toDomain(row: TaskRow): Task {
    return Task.reconstitute({
      id: TaskId.fromString(row.id),
      userId: UserId.fromString(row.user_id),
      title: row.title,
      completed: row.completed === 1,
    });
  }
}
```

### Database Schema with Constraints

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Layer 3: Uniqueness constraint
  UNIQUE(user_id, title),

  -- Layer 3: Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Layer 3: Index for lookups
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

## Validation Flow Summary

### Example: Create Task Request

```typescript
// Request body
{
  "title": "  Buy groceries  ",
  "priority": "high",
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}

// Layer 1: Presentation (HTTP handler)
// ✅ title is string, 3-200 chars
// ✅ priority is 'low' | 'medium' | 'high'
// ✅ userId is valid UUID format
// → Pass to use case

// Layer 2: Domain (Entity)
// ✅ Trim title: "Buy groceries"
// ✅ Title not empty after trim
// ✅ Title contains no profanity
// → Create entity

// Layer 3: Infrastructure (Repository)
// ✅ Check UNIQUE(user_id, title)
// ❌ User already has task "Buy groceries"
// → Throw ConflictError

// Use case catches ConflictError
// → Return err(ConflictError)

// Handler maps to HTTP response
// → 409 Conflict
{
  "error": "Resource already exists",
  "code": "CONFLICT"
}
```

## Anti-Patterns

### ❌ Validation in Wrong Layer

```typescript
// ❌ WRONG - Business logic in presentation layer
export async function handleCreateTask(request: Request): Promise<Response> {
  const body = await request.json();

  // ❌ Business rule (profanity check) in presentation layer
  if (containsProfanity(body.title)) {
    return jsonResponse(422, { error: 'Title contains profanity' });
  }

  // This belongs in domain layer (Task.create)
}

// ❌ WRONG - Format validation in domain layer
export class Email {
  static create(value: string): Email {
    // ❌ Type checking belongs in presentation layer
    if (typeof value !== 'string') {
      throw new ValidationError('Email must be a string');
    }

    // ✅ Business rules belong here
    if (!this.isValidFormat(value)) {
      throw new ValidationError('Invalid email format');
    }

    return new Email(value);
  }
}
```

### ❌ Duplicate Validation

```typescript
// ❌ WRONG - Duplicate validation in multiple layers
export async function handleCreateTask(request: Request): Promise<Response> {
  const body = await request.json();

  // ❌ Checking title length here
  if (!body.title || body.title.length < 3) {
    return jsonResponse(422, { error: 'Title too short' });
  }

  const dto = { title: body.title, userId: body.userId };
  const result = await createTaskUseCase.execute(dto);
  // ...
}

export class Task {
  static create(props: { title: string }): Task {
    // ❌ And also checking title length here
    if (props.title.length < 3) {
      throw new ValidationError('Title too short');
    }
    // ...
  }
}
```

### ✅ Correct: Single Responsibility

```typescript
// ✅ CORRECT - Format validation in presentation
export async function handleCreateTask(request: Request): Promise<Response> {
  const body = await request.json();

  // ✅ Format validation only
  const titleValidator = new StringValidator(3, 200);
  const titleResult = titleValidator.validate(body.title);
  if (!titleResult.success) {
    return jsonResponse(422, { error: 'Invalid format' });
  }

  const dto = { title: titleResult.value, userId: body.userId };
  const result = await createTaskUseCase.execute(dto);
  // ...
}

// ✅ CORRECT - Business rules in domain
export class Task {
  static create(props: { title: string }): Task {
    // ✅ Business rules only
    const trimmed = props.title.trim();
    if (trimmed.length === 0) {
      throw new ValidationError('Title cannot be empty');
    }
    if (this.containsProfanity(trimmed)) {
      throw new ValidationError('Title contains profanity');
    }
    return new Task(TaskId.generate(), trimmed, false);
  }
}
```

## Testing Each Layer

### Test Presentation Validation

```typescript
describe('StringValidator', () => {
  it('validates string length', () => {
    const validator = new StringValidator(3, 10);

    expect(validator.validate('ab').success).toBe(false);
    expect(validator.validate('abc').success).toBe(true);
    expect(validator.validate('1234567890').success).toBe(true);
    expect(validator.validate('12345678901').success).toBe(false);
  });
});

describe('handleCreateTask', () => {
  it('returns 422 for invalid title format', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ title: 'ab', userId: 'user-1' }),
    });

    const response = await handleCreateTask(request);

    expect(response.status).toBe(422);
  });
});
```

### Test Domain Validation

```typescript
describe('Task.create', () => {
  it('throws ValidationError for empty title', () => {
    expect(() => {
      Task.create({ title: '   ', userId: UserId.generate() });
    }).toThrow(ValidationError);
  });

  it('throws ValidationError for profanity', () => {
    expect(() => {
      Task.create({ title: 'bad word here', userId: UserId.generate() });
    }).toThrow(ValidationError);
  });

  it('creates task with valid title', () => {
    const task = Task.create({ title: 'Valid title', userId: UserId.generate() });
    expect(task).toBeInstanceOf(Task);
  });
});
```

### Test Infrastructure Validation

```typescript
describe('D1TaskRepository', () => {
  it('throws ConflictError for duplicate task', async () => {
    const task = Task.create({ title: 'Buy groceries', userId: UserId.generate() });

    await repository.save(task);

    const duplicate = Task.create({ title: 'Buy groceries', userId: task.getUserId() });

    await expect(repository.save(duplicate)).rejects.toThrow(ConflictError);
  });

  it('throws ValidationError for invalid foreign key', async () => {
    const invalidUserId = UserId.generate();
    const task = Task.create({ title: 'Test', userId: invalidUserId });

    await expect(repository.save(task)).rejects.toThrow(ValidationError);
  });
});
```

## Best Practices

1. **Single Responsibility**: Each layer validates what it's responsible for
2. **No Duplication**: Don't validate the same thing in multiple layers
3. **Fail Fast**: Validate at the earliest appropriate layer
4. **Clear Errors**: Use specific error types (ValidationError, ConflictError)
5. **Type Safety**: Use TypeScript types to prevent invalid states
6. **Test Each Layer**: Unit test validators, domain logic, and constraints separately

## Related Skills

- **error-handling-patterns**: Result types, error hierarchy, error responses
- **security-review**: Input validation, allowlist validation, metadata validation
- **worker-request-handler**: Request extraction, error mapping
- **d1-repository-implementation**: Constraint handling, error mapping
- **ddd-domain-modeling**: Value objects, entities, domain errors
