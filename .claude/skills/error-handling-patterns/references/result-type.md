# Result Type Deep Dive

## Core Definition

```typescript
/**
 * Result type for representing success or failure without throwing exceptions
 */
export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

/**
 * Create a successful Result
 */
export function ok<T>(value: T): Result<T, never> {
  return { success: true, value };
}

/**
 * Create a failed Result
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}
```

## Why Result Types?

### Problems with Throwing Exceptions

```typescript
// ❌ Exceptions hide control flow
async function getUser(id: string): Promise<User> {
  const user = await db.findUser(id);
  if (!user) {
    throw new NotFoundError(); // Hidden failure path
  }
  return user;
}

// Caller doesn't know this might throw
const user = await getUser('123'); // Can throw NotFoundError
```

### Benefits of Result Types

```typescript
// ✅ Result types make errors explicit
async function getUser(id: string): Promise<Result<User, NotFoundError>> {
  const user = await db.findUser(id);
  if (!user) {
    return err(new NotFoundError()); // Explicit failure path
  }
  return ok(user);
}

// Caller must handle both cases
const result = await getUser('123');
if (!result.success) {
  // Handle error
  console.error(result.error);
  return;
}
const user = result.value; // Type-safe access
```

### Type Safety

```typescript
// TypeScript forces you to check success
const result = await getUser('123');

// ❌ This won't compile - result might not have 'value'
console.log(result.value);

// ✅ This compiles - checked success first
if (result.success) {
  console.log(result.value); // TypeScript knows this is safe
} else {
  console.error(result.error); // TypeScript knows this is safe
}
```

## Usage Patterns

### Basic Pattern

```typescript
async function createTask(dto: CreateTaskDto): Promise<Result<Task, ValidationError>> {
  // Validate input
  if (!dto.title) {
    return err(new ValidationError('Title is required'));
  }

  // Create entity
  const task = new Task(dto);

  // Return success
  return ok(task);
}
```

### Chaining Results

```typescript
async function updateTask(
  id: string,
  dto: UpdateTaskDto
): Promise<Result<Task, NotFoundError | ValidationError>> {
  // Get task
  const taskResult = await getTask(id);
  if (!taskResult.success) {
    return taskResult; // Propagate NotFoundError
  }

  // Validate update
  if (!dto.title) {
    return err(new ValidationError('Title is required'));
  }

  // Update task
  const task = taskResult.value;
  task.update(dto);

  return ok(task);
}
```

### Multiple Error Types

```typescript
async function processTask(
  id: string
): Promise<Result<Task, NotFoundError | ValidationError | ConflictError>> {
  const taskResult = await getTask(id);
  if (!taskResult.success) {
    return taskResult; // NotFoundError
  }

  const task = taskResult.value;

  if (!task.canProcess()) {
    return err(new ValidationError('Task is not processable')); // ValidationError
  }

  if (task.isProcessing) {
    return err(new ConflictError('Task is already processing')); // ConflictError
  }

  task.startProcessing();
  return ok(task);
}
```

## Combinators

### map - Transform Success Value

```typescript
/**
 * Apply a function to the success value
 */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (result.success) {
    return ok(fn(result.value));
  }
  return result;
}

// Usage
const taskResult = await getTask('123');
const titleResult = map(taskResult, (task) => task.title);
// Result<string, NotFoundError>
```

### flatMap - Chain Results

```typescript
/**
 * Chain operations that return Results
 */
export function flatMap<T, U, E1, E2>(
  result: Result<T, E1>,
  fn: (value: T) => Result<U, E2>
): Result<U, E1 | E2> {
  if (result.success) {
    return fn(result.value);
  }
  return result;
}

// Usage
const result = flatMap(await getTask('123'), (task) => updateTask(task, dto));
// Result<Task, NotFoundError | ValidationError>
```

### mapError - Transform Error

```typescript
/**
 * Apply a function to the error value
 */
export function mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (!result.success) {
    return err(fn(result.error));
  }
  return result;
}

// Usage
const result = mapError(
  await getTask('123'),
  (error) => new InfrastructureError('Failed to get task', error)
);
```

### unwrapOr - Provide Default

```typescript
/**
 * Get the value or return a default
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.success) {
    return result.value;
  }
  return defaultValue;
}

// Usage
const task = unwrapOr(await getTask('123'), defaultTask);
```

### combine - Combine Multiple Results

```typescript
/**
 * Combine multiple Results into one
 */
export function combine<T extends readonly unknown[], E>(results: {
  [K in keyof T]: Result<T[K], E>;
}): Result<T, E> {
  const values: unknown[] = [];

  for (const result of results) {
    if (!result.success) {
      return result;
    }
    values.push(result.value);
  }

  return ok(values as unknown as T);
}

// Usage
const [userResult, taskResult, projectResult] = await Promise.all([
  getUser('user-1'),
  getTask('task-1'),
  getProject('project-1'),
]);

const combinedResult = combine([userResult, taskResult, projectResult]);
if (combinedResult.success) {
  const [user, task, project] = combinedResult.value;
  // All three are available
}
```

## Advanced Patterns

### Result with Context

```typescript
type ResultContext<T, E> = {
  result: Result<T, E>;
  metadata: {
    duration: number;
    timestamp: string;
  };
};

async function getTaskWithContext(id: string): Promise<ResultContext<Task, NotFoundError>> {
  const start = Date.now();

  const result = await getTask(id);

  return {
    result,
    metadata: {
      duration: Date.now() - start,
      timestamp: new Date().toISOString(),
    },
  };
}
```

### Async Result Helpers

```typescript
/**
 * Wrap an async function that might throw
 */
export async function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

// Usage
const result = await tryCatch(() => db.query('SELECT * FROM tasks'));
if (!result.success) {
  logger.error('Query failed', result.error);
  return errorResponse(500);
}
```

### Collecting Results

```typescript
/**
 * Process array and collect successes and failures separately
 */
export function partition<T, E>(results: Result<T, E>[]): { successes: T[]; failures: E[] } {
  const successes: T[] = [];
  const failures: E[] = [];

  for (const result of results) {
    if (result.success) {
      successes.push(result.value);
    } else {
      failures.push(result.error);
    }
  }

  return { successes, failures };
}

// Usage
const results = await Promise.all(ids.map((id) => getTask(id)));
const { successes, failures } = partition(results);

logger.info(`Processed ${successes.length} tasks, ${failures.length} errors`);
```

## Testing Result Types

### Testing Success Case

```typescript
describe('getTask', () => {
  it('returns ok with task when found', async () => {
    db.findTask.mockResolvedValue({ id: '123', title: 'Test' });

    const result = await getTask('123');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.id).toBe('123');
      expect(result.value.title).toBe('Test');
    }
  });
});
```

### Testing Error Case

```typescript
describe('getTask', () => {
  it('returns err with NotFoundError when not found', async () => {
    db.findTask.mockResolvedValue(null);

    const result = await getTask('123');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(NotFoundError);
      expect(result.error.message).toContain('not found');
    }
  });
});
```

### Testing Combinators

```typescript
describe('map', () => {
  it('transforms success value', () => {
    const result = ok(5);
    const doubled = map(result, (n) => n * 2);

    expect(doubled.success).toBe(true);
    if (doubled.success) {
      expect(doubled.value).toBe(10);
    }
  });

  it('propagates error unchanged', () => {
    const error = new ValidationError('Invalid');
    const result = err(error);
    const doubled = map(result, (n: number) => n * 2);

    expect(doubled.success).toBe(false);
    if (!doubled.success) {
      expect(doubled.error).toBe(error);
    }
  });
});
```

## Best Practices

### DO: Use Result for Expected Errors

```typescript
// ✅ User not found is an expected error
async function getUser(id: string): Promise<Result<User, NotFoundError>> {
  const user = await db.findUser(id);
  if (!user) {
    return err(new NotFoundError(`User ${id} not found`));
  }
  return ok(user);
}
```

### DON'T: Use Result for Programming Errors

```typescript
// ❌ Null pointer is a programming error, should throw
function divide(a: number, b: number): Result<number, Error> {
  if (b === 0) {
    return err(new Error('Division by zero')); // Should throw instead
  }
  return ok(a / b);
}

// ✅ Throw for programming errors
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero'); // Programming error
  }
  return a / b;
}
```

### DO: Make Error Types Explicit

```typescript
// ✅ Explicit error types
async function updateUser(
  id: string,
  dto: UpdateUserDto
): Promise<Result<User, NotFoundError | ValidationError | ConflictError>> {
  // Implementation
}
```

### DON'T: Use Generic Error Type

```typescript
// ❌ Generic Error hides what can go wrong
async function updateUser(id: string, dto: UpdateUserDto): Promise<Result<User, Error>> {
  // What errors can this return? Unknown!
}
```

### DO: Handle All Error Cases

```typescript
// ✅ Handle all error types
const result = await updateUser('123', dto);

if (!result.success) {
  if (result.error instanceof NotFoundError) {
    return jsonResponse(404, { error: 'User not found' });
  }
  if (result.error instanceof ValidationError) {
    return jsonResponse(422, { error: 'Invalid data' });
  }
  if (result.error instanceof ConflictError) {
    return jsonResponse(409, { error: 'Email already exists' });
  }
}

return jsonResponse(200, toUserResponse(result.value));
```

## Type Inference Examples

```typescript
// TypeScript infers Result<Task, NotFoundError>
const taskResult = await getTask('123');

// TypeScript infers Result<string, NotFoundError>
const titleResult = map(taskResult, (task) => task.title);

// TypeScript infers Result<User, NotFoundError | ValidationError>
const userResult = flatMap(taskResult, (task) => getUser(task.userId));

// TypeScript narrows type after success check
if (taskResult.success) {
  // taskResult.value is Task
  console.log(taskResult.value.title);
} else {
  // taskResult.error is NotFoundError
  console.error(taskResult.error.message);
}
```
