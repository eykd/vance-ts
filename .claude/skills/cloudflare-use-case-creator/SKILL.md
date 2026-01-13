---
name: cloudflare-use-case-creator
description: Generate use cases in the application layer for Cloudflare Workers TypeScript projects using Clean Architecture and DDD. Use when creating new use cases, DTOs (request/response objects), wiring domain services and repository interfaces, or implementing CRUD operations in the application layer. Also use when asked to add a feature, create an endpoint, implement business logic, or add a new capability that requires orchestrating domain objects.
---

# Cloudflare Use Case Creator

Generate application layer use cases following Clean Architecture and Single Responsibility Principle.

## Quick Reference

```
src/application/
├── use-cases/           # One class per use case
│   ├── CreateTask.ts
│   └── CreateTask.spec.ts
└── dto/                 # Request/Response objects
    ├── CreateTaskRequest.ts
    └── TaskResponse.ts
```

## Core Workflow

1. **Identify the use case** - One action, one responsibility (e.g., `CreateTask`, `CompleteTask`)
2. **Define DTOs** - Create request/response interfaces
3. **Implement use case** - Inject repository interfaces, orchestrate domain
4. **Add error handling** - Use Result pattern or domain exceptions
5. **Write unit test** - Mock repository, test business logic

## Use Case Template

```typescript
// src/application/use-cases/[Action][Entity].ts
import type { EntityRepository } from '@domain/interfaces/EntityRepository';
import type { ActionEntityRequest } from '../dto/ActionEntityRequest';
import type { EntityResponse } from '../dto/EntityResponse';

export class ActionEntity {
  constructor(private repository: EntityRepository) {}

  async execute(request: ActionEntityRequest): Promise<EntityResponse> {
    // 1. Validate/transform request
    // 2. Call domain (create/load entity, invoke behavior)
    // 3. Persist via repository
    // 4. Return response DTO
  }
}
```

## DTO Guidelines

**Request DTOs**: Raw input from handlers, validated in use case or domain

```typescript
export interface CreateTaskRequest {
  title: string;
  userId?: string; // Optional fields have defaults
}
```

**Response DTOs**: Serializable output, no domain objects

```typescript
export interface TaskResponse {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO string, not Date
}
```

## Wiring Dependencies

Inject repository interfaces (ports) defined in domain:

```typescript
// Domain defines the interface
// src/domain/interfaces/TaskRepository.ts
export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
}

// Infrastructure implements it
// src/infrastructure/repositories/D1TaskRepository.ts
export class D1TaskRepository implements TaskRepository { ... }

// Use case depends only on interface
export class CreateTask {
  constructor(private taskRepository: TaskRepository) {}
}
```

## Error Handling

Use domain exceptions, catch in use case or let propagate to handler:

```typescript
async execute(request: CreateTaskRequest): Promise<TaskResponse> {
  // Domain throws if invalid
  const task = Task.create({ userId: request.userId, title: request.title });

  await this.taskRepository.save(task);
  return this.toResponse(task);
}
```

For complex error scenarios: See [ERROR-HANDLING.md](references/ERROR-HANDLING.md)

## Unit Test Pattern

```typescript
describe('CreateTask', () => {
  let useCase: CreateTask;
  let mockRepository: TaskRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      // ... other methods
    };
    useCase = new CreateTask(mockRepository);
  });

  it('should create and persist a task', async () => {
    const result = await useCase.execute({ title: 'Test', userId: 'u1' });

    expect(mockRepository.save).toHaveBeenCalled();
    expect(result.title).toBe('Test');
  });
});
```

## Detailed References

- **Complex use cases** (multi-step, transactions): See [USE-CASE-PATTERNS.md](references/USE-CASE-PATTERNS.md)
- **DTO validation and mapping**: See [DTO-PATTERNS.md](references/DTO-PATTERNS.md)
- **Result pattern and error types**: See [ERROR-HANDLING.md](references/ERROR-HANDLING.md)
