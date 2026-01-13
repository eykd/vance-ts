# DTO Patterns

## Table of Contents

- [Request DTOs](#request-dtos)
- [Response DTOs](#response-dtos)
- [Mapping Utilities](#mapping-utilities)
- [Validation Strategies](#validation-strategies)

## Request DTOs

### Basic Structure

```typescript
// src/application/dto/CreateTaskRequest.ts
export interface CreateTaskRequest {
  title: string;
  userId?: string;
  dueDate?: string; // ISO string from client
}
```

### With Discriminated Unions

```typescript
// src/application/dto/UpdateTaskRequest.ts
export type UpdateTaskRequest =
  | { type: 'rename'; taskId: string; title: string }
  | { type: 'reschedule'; taskId: string; dueDate: string }
  | { type: 'reassign'; taskId: string; userId: string };
```

### From Form Data (Handler → Use Case)

```typescript
// In handler
async createTask(request: Request): Promise<Response> {
  const formData = await request.formData();

  const dto: CreateTaskRequest = {
    title: formData.get("title") as string,
    userId: formData.get("userId") as string | undefined
  };

  const result = await this.createTaskUseCase.execute(dto);
  // ...
}
```

## Response DTOs

### Basic Structure

```typescript
// src/application/dto/TaskResponse.ts
export interface TaskResponse {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // Always ISO string
  assignee?: UserSummary; // Nested DTO, not domain object
}

export interface UserSummary {
  id: string;
  name: string;
}
```

### Collection Response

```typescript
// src/application/dto/TaskListResponse.ts
export interface TaskListResponse {
  tasks: TaskResponse[];
  total: number;
  hasMore: boolean;
}
```

### Paginated Response

```typescript
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

## Mapping Utilities

### Domain to Response

```typescript
// In use case class
private toResponse(task: Task): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    completed: task.isCompleted,
    createdAt: task.createdAt.toISOString()
  };
}

// Or as standalone mapper
// src/application/dto/mappers/TaskMapper.ts
export const TaskMapper = {
  toResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      completed: task.isCompleted,
      createdAt: task.createdAt.toISOString()
    };
  },

  toResponseList(tasks: Task[]): TaskResponse[] {
    return tasks.map(this.toResponse);
  }
};
```

### With Relations

```typescript
export const TaskMapper = {
  toResponseWithAssignee(task: Task, user: User | null): TaskResponse {
    return {
      ...this.toResponse(task),
      assignee: user ? UserMapper.toSummary(user) : undefined,
    };
  },
};
```

## Validation Strategies

### Strategy 1: Validate in Domain (Recommended)

Let domain entities enforce invariants:

```typescript
// Use case - no validation needed
async execute(request: CreateTaskRequest): Promise<TaskResponse> {
  // Task.create throws if title invalid
  const task = Task.create({
    userId: request.userId ?? "anonymous",
    title: request.title
  });
  // ...
}
```

### Strategy 2: Validate in Use Case

For cross-entity or complex validations:

```typescript
async execute(request: AssignTaskRequest): Promise<TaskResponse> {
  if (!request.taskId || !request.userId) {
    throw new ValidationError("taskId and userId required");
  }

  const user = await this.userRepository.findById(request.userId);
  if (!user) {
    throw new UserNotFoundError(request.userId);
  }
  // ...
}
```

### Strategy 3: Validate in Handler

For early rejection (saves processing):

```typescript
async createTask(request: Request): Promise<Response> {
  const formData = await request.formData();
  const title = formData.get("title") as string;

  // Early validation in handler
  if (!title || title.trim().length < 3) {
    return this.htmlResponse(
      `<div class="alert alert-error">Title must be at least 3 characters</div>`,
      400
    );
  }

  // Proceed to use case
  const result = await this.createTask.execute({ title: title.trim() });
  // ...
}
```

### Guideline: Where to Validate

| Validation Type     | Location       | Example             |
| ------------------- | -------------- | ------------------- |
| Business invariants | Domain entity  | "Title min 3 chars" |
| Cross-entity rules  | Use case       | "User must exist"   |
| Input sanitization  | Handler        | "Trim whitespace"   |
| Format validation   | DTO or Handler | "Valid ISO date"    |
