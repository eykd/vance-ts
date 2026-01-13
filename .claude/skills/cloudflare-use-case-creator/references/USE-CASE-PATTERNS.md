# Use Case Patterns

## Table of Contents

- [Query vs Command](#query-vs-command)
- [Multi-Entity Operations](#multi-entity-operations)
- [Domain Service Integration](#domain-service-integration)
- [Complete CRUD Set](#complete-crud-set)

## Query vs Command

Separate read and write operations for clarity:

### Command (Write)

```typescript
// src/application/use-cases/CompleteTask.ts
export class CompleteTask {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: { taskId: string }): Promise<void> {
    const task = await this.taskRepository.findById(request.taskId);
    if (!task) throw new TaskNotFoundError(request.taskId);

    task.complete();
    await this.taskRepository.save(task);
  }
}
```

### Query (Read)

```typescript
// src/application/use-cases/GetTasksByUser.ts
export class GetTasksByUser {
  constructor(private taskRepository: TaskRepository) {}

  async execute(request: { userId: string }): Promise<TaskResponse[]> {
    const tasks = await this.taskRepository.findByUserId(request.userId);
    return tasks.map(this.toResponse);
  }

  private toResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      completed: task.isCompleted,
      createdAt: task.createdAt.toISOString(),
    };
  }
}
```

## Multi-Entity Operations

When a use case spans multiple aggregates:

```typescript
// src/application/use-cases/AssignTaskToUser.ts
export class AssignTaskToUser {
  constructor(
    private taskRepository: TaskRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: AssignTaskRequest): Promise<TaskResponse> {
    const [task, user] = await Promise.all([
      this.taskRepository.findById(request.taskId),
      this.userRepository.findById(request.userId),
    ]);

    if (!task) throw new TaskNotFoundError(request.taskId);
    if (!user) throw new UserNotFoundError(request.userId);

    task.assignTo(user.id);
    await this.taskRepository.save(task);

    return this.toResponse(task);
  }
}
```

## Domain Service Integration

When business logic spans entities, inject domain services:

```typescript
// src/domain/services/TaskPrioritizer.ts
export class TaskPrioritizer {
  prioritize(tasks: Task[], userPreferences: UserPreferences): Task[] {
    return tasks.sort((a, b) => {
      // Domain logic for prioritization
      const aScore = this.calculateScore(a, userPreferences);
      const bScore = this.calculateScore(b, userPreferences);
      return bScore - aScore;
    });
  }

  private calculateScore(task: Task, prefs: UserPreferences): number {
    // Pure domain logic, no I/O
  }
}

// src/application/use-cases/GetPrioritizedTasks.ts
export class GetPrioritizedTasks {
  constructor(
    private taskRepository: TaskRepository,
    private taskPrioritizer: TaskPrioritizer
  ) {}

  async execute(request: { userId: string }): Promise<TaskResponse[]> {
    const tasks = await this.taskRepository.findByUserId(request.userId);
    const prioritized = this.taskPrioritizer.prioritize(tasks, request.preferences);
    return prioritized.map(this.toResponse);
  }
}
```

## Complete CRUD Set

Standard pattern for entity management:

| Use Case       | Request                | Response               | Notes                  |
| -------------- | ---------------------- | ---------------------- | ---------------------- |
| `CreateTask`   | `{ title, userId }`    | `TaskResponse`         | Returns created entity |
| `GetTask`      | `{ taskId }`           | `TaskResponse \| null` | Single entity query    |
| `ListTasks`    | `{ userId?, filter? }` | `TaskResponse[]`       | Collection query       |
| `UpdateTask`   | `{ taskId, title? }`   | `TaskResponse`         | Partial update         |
| `DeleteTask`   | `{ taskId }`           | `void`                 | No return needed       |
| `CompleteTask` | `{ taskId }`           | `void`                 | Domain behavior        |

### Naming Convention

```
[Action][Entity].ts
```

Actions: `Create`, `Get`, `List`, `Update`, `Delete`, `Complete`, `Archive`, `Assign`

### File Organization

```
src/application/use-cases/
├── tasks/
│   ├── CreateTask.ts
│   ├── CreateTask.spec.ts
│   ├── GetTask.ts
│   ├── GetTask.spec.ts
│   ├── ListTasks.ts
│   ├── UpdateTask.ts
│   ├── DeleteTask.ts
│   └── CompleteTask.ts
└── users/
    ├── CreateUser.ts
    └── GetUser.ts
```
