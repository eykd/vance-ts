# Domain-Driven Design and Clean Code Guide

**Organizing a Cloudflare Edge Web Application with HTMX, Alpine.js, and TypeScript Workers**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Clean Architecture Overview](#clean-architecture-overview)
3. [The Domain Layer](#the-domain-layer)
4. [The Application Layer](#the-application-layer)
5. [The Infrastructure Layer](#the-infrastructure-layer)
6. [The Presentation Layer](#the-presentation-layer)
7. [Directory Structure](#directory-structure)
8. [Naming Conventions](#naming-conventions)
9. [The Dependency Rule](#the-dependency-rule)
10. [SOLID Principles in Practice](#solid-principles-in-practice)
11. [Clean Code Guidelines](#clean-code-guidelines)
12. [Testing Strategy](#testing-strategy)
13. [Common Patterns](#common-patterns)
14. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
15. [Refactoring Checklist](#refactoring-checklist)

---

## Introduction

This guide establishes principles for organizing a web application built on Cloudflare's edge platform using HTMX, Alpine.js, TailwindCSS 4, DaisyUI 5, and TypeScript Workers. It combines Domain-Driven Design (DDD) strategic and tactical patterns with Robert C. Martin's Clean Code principles to create maintainable, testable, and evolvable software.

### Why These Principles Matter

**Domain-Driven Design** ensures that software models reflect the business domain accurately. When the code speaks the language of the business, communication improves, bugs decrease, and the software becomes easier to evolve as requirements change.

**Clean Code** focuses on readability, simplicity, and maintainability. Code is read far more often than it is written. Clean code reduces cognitive load, makes debugging easier, and enables teams to work effectively on shared codebases.

**Clean Architecture** provides the structural foundation that makes both DDD and Clean Code possible at scale. By organizing code into layers with strict dependency rules, we achieve separation of concerns that enables independent testing, replacement of infrastructure, and protection of business logic from framework changes.

### Core Tenets

1. **The domain is the heart of the software.** Business logic lives in pure domain objects, independent of frameworks, databases, and UI.

2. **Dependencies point inward.** Outer layers depend on inner layers, never the reverse. Infrastructure adapts to the domain, not vice versa.

3. **Code should express intent.** Names, structure, and organization should make the code's purpose obvious to readers.

4. **Tests guide design.** Writing tests first reveals design problems early and ensures code remains testable.

5. **Simplicity over cleverness.** Prefer straightforward solutions. Every line of code is a liability.

---

## Clean Architecture Overview

Clean Architecture organizes code into concentric layers, each with distinct responsibilities and dependencies flowing inward toward the domain.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                       PRESENTATION LAYER                            │
│   HTTP Handlers, HTML Templates, HTMX Partials, Middleware          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                       APPLICATION LAYER                             │
│   Use Cases, Application Services, DTOs, Orchestration              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                         DOMAIN LAYER                                │
│   Entities, Value Objects, Domain Services, Repository Interfaces   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                      INFRASTRUCTURE LAYER                           │
│   D1 Repositories, KV Stores, External APIs, Email Services         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                    Dependencies flow INWARD →
              (Infrastructure → Domain, not Domain → Infrastructure)
```

### Layer Responsibilities

| Layer              | Responsibility                            | Dependencies                     | Changes When                  |
| ------------------ | ----------------------------------------- | -------------------------------- | ----------------------------- |
| **Domain**         | Business rules, entities, core logic      | None (pure TypeScript)           | Business rules change         |
| **Application**    | Orchestrates domain objects for use cases | Domain                           | User workflows change         |
| **Infrastructure** | Implements interfaces defined by domain   | Domain, Application              | Technical requirements change |
| **Presentation**   | HTTP handling, HTML rendering             | Application, Domain (types only) | UI/UX requirements change     |

### The Static-Dynamic Boundary

In this architecture, a clear boundary exists between static and dynamic content:

| Content Type | Location  | Handled By        | Examples                           |
| ------------ | --------- | ----------------- | ---------------------------------- |
| **Static**   | `public/` | Cloudflare Pages  | Marketing pages, blog, assets      |
| **Dynamic**  | `src/`    | TypeScript Worker | `/app/*`, `/auth/*`, `/webhooks/*` |

This separation ensures that marketing content deploys independently from application logic, and static content benefits from CDN caching without Worker invocation.

---

## The Domain Layer

The domain layer is the core of the application. It contains business logic, expressed through entities, value objects, domain services, and repository interfaces. This layer has **zero dependencies** on external frameworks, databases, or infrastructure.

### Location

```
src/domain/
├── entities/           # Aggregate roots and entities
├── value-objects/      # Immutable value types
├── services/           # Domain services (stateless business logic)
└── interfaces/         # Repository and service interfaces (ports)
```

### Entities

Entities are objects with identity that persists over time. Two entities are equal if they have the same identity, regardless of their attributes.

**Characteristics of Well-Designed Entities:**

- Have a unique identifier (usually a UUID)
- Encapsulate business rules and invariants
- Expose behavior through methods, not raw data manipulation
- Validate their own state in constructors and methods
- Are created through factory methods that enforce invariants

**Example: Task Entity**

```typescript
// src/domain/entities/Task.ts
import { TaskId } from '../value-objects/TaskId';
import { TaskStatus } from '../value-objects/TaskStatus';

interface TaskProps {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export class Task {
  private readonly _id: TaskId;
  private readonly _userId: string;
  private _title: string;
  private _status: TaskStatus;
  private readonly _createdAt: Date;

  private constructor(props: TaskProps) {
    this._id = new TaskId(props.id);
    this._userId = props.userId;
    this._title = props.title;
    this._status = props.completed ? TaskStatus.completed() : TaskStatus.pending();
    this._createdAt = props.createdAt;
  }

  // Factory method for NEW tasks - enforces all invariants
  static create(props: { userId: string; title: string }): Task {
    if (!props.title || props.title.trim().length < 3) {
      throw new Error('Task title must be at least 3 characters');
    }

    return new Task({
      id: crypto.randomUUID(),
      userId: props.userId,
      title: props.title.trim(),
      completed: false,
      createdAt: new Date(),
    });
  }

  // Factory method for RECONSTITUTING from persistence
  // Bypasses validation (data is already valid)
  static reconstitute(props: TaskProps): Task {
    return new Task(props);
  }

  // Getters expose state for reading
  get id(): string {
    return this._id.value;
  }
  get userId(): string {
    return this._userId;
  }
  get title(): string {
    return this._title;
  }
  get isCompleted(): boolean {
    return this._status.isCompleted;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  // Business behavior methods
  complete(): void {
    if (this._status.isCompleted) {
      throw new Error('Task is already completed');
    }
    this._status = TaskStatus.completed();
  }

  reopen(): void {
    if (!this._status.isCompleted) {
      throw new Error('Task is not completed');
    }
    this._status = TaskStatus.pending();
  }

  rename(newTitle: string): void {
    if (!newTitle || newTitle.trim().length < 3) {
      throw new Error('Task title must be at least 3 characters');
    }
    this._title = newTitle.trim();
  }
}
```

**Key Design Decisions:**

1. **Private constructor** forces use of factory methods
2. **`create()` vs `reconstitute()`** separates new entity creation from hydration
3. **Behavior methods** (`complete()`, `reopen()`) enforce business rules
4. **Immutable identity** - `_id` and `_userId` cannot change after creation
5. **No setters** - state changes only through behavior methods

### Value Objects

Value objects are immutable objects defined by their attributes, not identity. Two value objects are equal if all their attributes are equal.

**Characteristics of Well-Designed Value Objects:**

- Immutable after construction
- Self-validating in constructor
- Provide equality comparison
- Often wrap primitive types to add meaning and validation
- Can contain behavior related to their value

**Example: Email Value Object**

```typescript
// src/domain/value-objects/Email.ts
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    const normalized = value.toLowerCase().trim();
    if (!this.isValid(normalized)) {
      throw new Error('Invalid email address');
    }
    this._value = normalized;
  }

  private isValid(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  get value(): string {
    return this._value;
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  get localPart(): string {
    return this._value.split('@')[0];
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

**Example: TaskStatus Value Object**

```typescript
// src/domain/value-objects/TaskStatus.ts
export class TaskStatus {
  private constructor(private readonly _completed: boolean) {}

  // Factory methods for controlled construction
  static pending(): TaskStatus {
    return new TaskStatus(false);
  }

  static completed(): TaskStatus {
    return new TaskStatus(true);
  }

  get isCompleted(): boolean {
    return this._completed;
  }

  get isPending(): boolean {
    return !this._completed;
  }

  equals(other: TaskStatus): boolean {
    return this._completed === other._completed;
  }
}
```

**Example: Money Value Object (Complex)**

```typescript
// src/domain/value-objects/Money.ts
export class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: string
  ) {}

  static of(amount: number, currency: string): Money {
    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be a finite number');
    }
    if (!['USD', 'EUR', 'GBP'].includes(currency)) {
      throw new Error('Unsupported currency');
    }
    // Store as cents to avoid floating point issues
    return new Money(Math.round(amount * 100), currency);
  }

  static zero(currency: string): Money {
    return Money.of(0, currency);
  }

  get amount(): number {
    return this._amount / 100;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this._amount - other._amount, this._currency);
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this._amount * factor), this._currency);
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this._amount > other._amount;
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  private ensureSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error('Cannot operate on different currencies');
    }
  }

  toString(): string {
    return `${this._currency} ${this.amount.toFixed(2)}`;
  }
}
```

### Domain Services

Domain services contain business logic that doesn't naturally belong to any single entity. They are stateless and operate on entities and value objects.

**When to Use Domain Services:**

- Logic involves multiple entities/aggregates
- A business operation doesn't conceptually belong to one entity
- Complex calculations or algorithms

**Example: Task Prioritizer Service**

```typescript
// src/domain/services/TaskPrioritizer.ts
import type { Task } from '../entities/Task';

export interface PrioritizedTask {
  task: Task;
  priority: number;
  reason: string;
}

export class TaskPrioritizer {
  prioritize(tasks: Task[]): PrioritizedTask[] {
    return tasks
      .map((task) => this.calculatePriority(task))
      .sort((a, b) => b.priority - a.priority);
  }

  private calculatePriority(task: Task): PrioritizedTask {
    let priority = 0;
    const reasons: string[] = [];

    // Incomplete tasks have higher priority
    if (!task.isCompleted) {
      priority += 50;
      reasons.push('incomplete');
    }

    // Older tasks get slight priority boost
    const ageInDays = this.getAgeInDays(task);
    if (ageInDays > 7) {
      priority += 20;
      reasons.push('aging');
    }

    return {
      task,
      priority,
      reason: reasons.join(', ') || 'normal',
    };
  }

  private getAgeInDays(task: Task): number {
    const now = new Date();
    const created = task.createdAt;
    const diffMs = now.getTime() - created.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
```

### Repository Interfaces (Ports)

Repository interfaces define how the domain expects to persist and retrieve entities. They live in the domain layer but are implemented in the infrastructure layer.

**Characteristics of Good Repository Interfaces:**

- Express intent in domain language
- Return domain objects, not database rows
- Hide persistence details completely
- Are mockable for testing

**Example: Task Repository Interface**

```typescript
// src/domain/interfaces/TaskRepository.ts
import type { Task } from '../entities/Task';

export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findByUserId(userId: string): Promise<Task[]>;
  findPending(): Promise<Task[]>;
  findCompleted(): Promise<Task[]>;
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
```

**Example: User Repository Interface**

```typescript
// src/domain/interfaces/UserRepository.ts
import type { User } from '../entities/User';
import type { Email } from '../value-objects/Email';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  exists(email: Email): Promise<boolean>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
```

---

## The Application Layer

The application layer orchestrates domain objects to fulfill specific use cases. It contains no business logic itself—that belongs in the domain layer. Instead, it coordinates the flow of data and delegates to domain objects.

### Location

```
src/application/
├── use-cases/          # Individual use case implementations
├── services/           # Application services (cross-cutting concerns)
└── dto/                # Data Transfer Objects
```

### Use Cases

Use cases represent specific application operations. Each use case class has a single public method (`execute`) that performs one operation.

**Characteristics of Well-Designed Use Cases:**

- Single responsibility (one operation per class)
- Accept DTOs as input, return DTOs as output
- Coordinate domain objects without containing business logic
- Handle transaction boundaries
- Are testable with mocked dependencies

**Example: CreateTask Use Case**

```typescript
// src/application/use-cases/CreateTask.ts
import { Task } from '@domain/entities/Task';
import type { TaskRepository } from '@domain/interfaces/TaskRepository';
import type { CreateTaskRequest } from '../dto/CreateTaskRequest';
import type { TaskResponse } from '../dto/TaskResponse';

export class CreateTask {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(request: CreateTaskRequest): Promise<TaskResponse> {
    // Delegate to domain for business logic
    const task = Task.create({
      userId: request.userId,
      title: request.title,
    });

    // Coordinate persistence
    await this.taskRepository.save(task);

    // Return DTO (not domain object)
    return this.toResponse(task);
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

**Example: CompleteTask Use Case**

```typescript
// src/application/use-cases/CompleteTask.ts
import type { TaskRepository } from '@domain/interfaces/TaskRepository';
import type { TaskResponse } from '../dto/TaskResponse';

export class CompleteTask {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(taskId: string): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    // Business logic delegated to domain entity
    task.complete();

    await this.taskRepository.save(task);

    return {
      id: task.id,
      title: task.title,
      completed: task.isCompleted,
      createdAt: task.createdAt.toISOString(),
    };
  }
}

export class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`);
    this.name = 'TaskNotFoundError';
  }
}
```

**Example: Complex Use Case with Multiple Repositories**

```typescript
// src/application/use-cases/AssignTaskToUser.ts
import type { TaskRepository } from '@domain/interfaces/TaskRepository';
import type { UserRepository } from '@domain/interfaces/UserRepository';
import type { AssignTaskRequest } from '../dto/AssignTaskRequest';

export class AssignTaskToUser {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(request: AssignTaskRequest): Promise<void> {
    const [task, user] = await Promise.all([
      this.taskRepository.findById(request.taskId),
      this.userRepository.findById(request.userId),
    ]);

    if (!task) {
      throw new TaskNotFoundError(request.taskId);
    }

    if (!user) {
      throw new UserNotFoundError(request.userId);
    }

    // Domain logic happens in entity
    task.assignTo(user.id);

    await this.taskRepository.save(task);
  }
}
```

### Data Transfer Objects (DTOs)

DTOs carry data between layers. They are simple data structures with no behavior.

**Request DTOs** define the input to a use case:

```typescript
// src/application/dto/CreateTaskRequest.ts
export interface CreateTaskRequest {
  userId: string;
  title: string;
}

// src/application/dto/UpdateTaskRequest.ts
export interface UpdateTaskRequest {
  taskId: string;
  title?: string;
  completed?: boolean;
}
```

**Response DTOs** define the output from a use case:

```typescript
// src/application/dto/TaskResponse.ts
export interface TaskResponse {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

// src/application/dto/TaskListResponse.ts
export interface TaskListResponse {
  tasks: TaskResponse[];
  total: number;
  hasMore: boolean;
}
```

### Application Services

Application services handle cross-cutting concerns that span multiple use cases.

```typescript
// src/application/services/AuthorizationService.ts
import type { User } from '@domain/entities/User';
import type { Task } from '@domain/entities/Task';

export class AuthorizationService {
  canViewTask(user: User, task: Task): boolean {
    return task.userId === user.id;
  }

  canEditTask(user: User, task: Task): boolean {
    return task.userId === user.id;
  }

  canDeleteTask(user: User, task: Task): boolean {
    return task.userId === user.id;
  }
}
```

---

## The Infrastructure Layer

The infrastructure layer contains implementations of interfaces defined in the domain layer. It handles external concerns: databases, caches, external APIs, file systems.

### Location

```
src/infrastructure/
├── repositories/       # Database implementations of repository interfaces
├── cache/              # Caching implementations (KV, Redis)
├── services/           # External service integrations
└── adapters/           # Third-party API adapters
```

### Repository Implementations

Repository implementations translate between domain objects and persistence formats.

**Example: D1 Task Repository**

```typescript
// src/infrastructure/repositories/D1TaskRepository.ts
import type { TaskRepository } from '@domain/interfaces/TaskRepository';
import { Task } from '@domain/entities/Task';

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  completed: number; // SQLite stores boolean as 0/1
  created_at: string;
  updated_at: string;
}

export class D1TaskRepository implements TaskRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: string): Promise<Task | null> {
    const row = await this.db.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first<TaskRow>();

    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Task[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM tasks ORDER BY created_at DESC')
      .all<TaskRow>();

    return results.map((row) => this.toDomain(row));
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all<TaskRow>();

    return results.map((row) => this.toDomain(row));
  }

  async findPending(): Promise<Task[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM tasks WHERE completed = 0 ORDER BY created_at DESC')
      .all<TaskRow>();

    return results.map((row) => this.toDomain(row));
  }

  async findCompleted(): Promise<Task[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM tasks WHERE completed = 1 ORDER BY created_at DESC')
      .all<TaskRow>();

    return results.map((row) => this.toDomain(row));
  }

  async save(task: Task): Promise<void> {
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `
        INSERT INTO tasks (id, user_id, title, completed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          completed = excluded.completed,
          updated_at = excluded.updated_at
      `
      )
      .bind(
        task.id,
        task.userId,
        task.title,
        task.isCompleted ? 1 : 0,
        task.createdAt.toISOString(),
        now
      )
      .run();
  }

  async delete(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run();
  }

  // Convert database row to domain entity
  private toDomain(row: TaskRow): Task {
    return Task.reconstitute({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      completed: row.completed === 1,
      createdAt: new Date(row.created_at),
    });
  }
}
```

### KV Cache Implementations

```typescript
// src/infrastructure/cache/KVSessionStore.ts
export interface Session {
  userId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

export class KVSessionStore {
  private readonly PREFIX = 'session:';
  private readonly DEFAULT_TTL = 60 * 60 * 24 * 7; // 7 days

  constructor(private readonly kv: KVNamespace) {}

  async get(sessionId: string): Promise<Session | null> {
    const data = await this.kv.get(this.PREFIX + sessionId, 'json');

    if (!data) return null;

    const session = data as Session;
    if (session.expiresAt < Date.now()) {
      await this.delete(sessionId);
      return null;
    }

    return session;
  }

  async set(sessionId: string, session: Session): Promise<void> {
    await this.kv.put(this.PREFIX + sessionId, JSON.stringify(session), {
      expirationTtl: this.DEFAULT_TTL,
    });
  }

  async delete(sessionId: string): Promise<void> {
    await this.kv.delete(this.PREFIX + sessionId);
  }

  async refresh(sessionId: string): Promise<void> {
    const session = await this.get(sessionId);
    if (session) {
      session.expiresAt = Date.now() + this.DEFAULT_TTL * 1000;
      await this.set(sessionId, session);
    }
  }
}
```

### External Service Adapters

```typescript
// src/infrastructure/services/MailgunEmailService.ts
import type { EmailService } from '@domain/interfaces/EmailService';
import type { Email } from '@domain/value-objects/Email';

export class MailgunEmailService implements EmailService {
  constructor(
    private readonly apiKey: string,
    private readonly domain: string
  ) {}

  async send(to: Email, subject: string, body: string): Promise<void> {
    const response = await fetch(`https://api.mailgun.net/v3/${this.domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`api:${this.apiKey}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        from: `noreply@${this.domain}`,
        to: to.value,
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.statusText}`);
    }
  }
}
```

---

## The Presentation Layer

The presentation layer handles HTTP concerns: routing, request parsing, response formatting, middleware. It translates between HTTP and application use cases.

### Location

```
src/presentation/
├── handlers/           # HTTP request handlers
├── templates/          # HTML template functions
│   ├── layouts/        # Page layouts
│   ├── pages/          # Full page templates
│   └── partials/       # HTMX fragment templates
├── middleware/         # Authentication, error handling, logging
└── utils/              # HTML escaping, response helpers
```

### Request Handlers

Handlers coordinate HTTP concerns and delegate to use cases.

```typescript
// src/presentation/handlers/TaskHandlers.ts
import type { CreateTask } from '@application/use-cases/CreateTask';
import type { CompleteTask } from '@application/use-cases/CompleteTask';
import type { TaskRepository } from '@domain/interfaces/TaskRepository';
import { taskListPartial, taskItemPartial } from '../templates/partials/tasks';
import { tasksPage } from '../templates/pages/tasks';
import { baseLayout } from '../templates/layouts/base';

export class TaskHandlers {
  constructor(
    private readonly createTask: CreateTask,
    private readonly completeTask: CompleteTask,
    private readonly taskRepository: TaskRepository
  ) {}

  // Full page render
  async getTasksPage(request: Request, userId: string): Promise<Response> {
    const tasks = await this.taskRepository.findByUserId(userId);

    return this.html(
      baseLayout({
        title: 'Tasks',
        content: tasksPage(tasks),
      })
    );
  }

  // HTMX partial: list tasks
  async listTasks(request: Request, userId: string): Promise<Response> {
    const tasks = await this.taskRepository.findByUserId(userId);
    return this.html(taskListPartial(tasks));
  }

  // HTMX partial: create task
  async handleCreateTask(request: Request, userId: string): Promise<Response> {
    const formData = await request.formData();
    const title = formData.get('title') as string;

    // Validation at presentation layer
    if (!title || title.trim().length < 3) {
      return this.html(
        `<div class="alert alert-error">
          Title must be at least 3 characters
        </div>`,
        400
      );
    }

    // Delegate to use case
    const task = await this.createTask.execute({
      userId,
      title: title.trim(),
    });

    return this.html(taskItemPartial(task), 201, {
      'HX-Trigger': this.notify('Task created!', 'success'),
    });
  }

  // HTMX partial: complete task
  async handleCompleteTask(request: Request, taskId: string): Promise<Response> {
    try {
      const task = await this.completeTask.execute(taskId);
      return this.html(taskItemPartial(task));
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return new Response('Not found', { status: 404 });
      }
      throw error;
    }
  }

  // Helper methods
  private html(content: string, status = 200, headers: Record<string, string> = {}): Response {
    return new Response(content, {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...headers,
      },
    });
  }

  private notify(message: string, type: 'success' | 'error' | 'info'): string {
    return JSON.stringify({
      notify: { message, type, id: Date.now() },
    });
  }
}
```

### HTML Templates

Templates are pure functions that return HTML strings. They have no side effects and are easily testable.

```typescript
// src/presentation/templates/partials/tasks.ts
import type { TaskResponse } from '@application/dto/TaskResponse';
import { escapeHtml } from '../../utils/escape';

export function taskListPartial(tasks: TaskResponse[]): string {
  if (tasks.length === 0) {
    return `
      <div class="text-center py-8 text-base-content/60">
        No tasks yet. Add one above!
      </div>
    `;
  }

  return tasks.map((task) => taskItemPartial(task)).join('');
}

export function taskItemPartial(task: TaskResponse): string {
  const { id, title, completed } = task;

  return `
    <li class="task-item flex items-center gap-3 p-3 bg-base-200 rounded-lg"
        id="task-${escapeHtml(id)}"
        x-data="{ deleting: false }">
      <input 
        type="checkbox" 
        class="checkbox checkbox-primary"
        ${completed ? 'checked' : ''}
        hx-post="/app/_/tasks/${escapeHtml(id)}/toggle"
        hx-target="closest .task-item"
        hx-swap="outerHTML">
      <span class="flex-1 ${completed ? 'line-through opacity-60' : ''}">
        ${escapeHtml(title)}
      </span>
      <button 
        class="btn btn-ghost btn-sm btn-square text-error"
        @click="deleting = true"
        hx-delete="/app/_/tasks/${escapeHtml(id)}"
        hx-target="closest .task-item"
        hx-swap="outerHTML"
        hx-confirm="Delete this task?"
        :disabled="deleting">
        <span x-show="!deleting">✕</span>
        <span x-show="deleting" class="loading loading-spinner loading-xs"></span>
      </button>
    </li>
  `;
}

export function taskFormPartial(): string {
  return `
    <form 
      hx-post="/app/_/tasks"
      hx-target="#task-list"
      hx-swap="beforeend"
      hx-on::after-request="if(event.detail.successful) this.reset()"
      x-data="{ title: '', submitting: false }"
      @htmx:before-request="submitting = true"
      @htmx:after-request="submitting = false"
      class="flex gap-2">
      <input 
        type="text" 
        name="title"
        x-model="title"
        placeholder="What needs to be done?"
        class="input input-bordered flex-1"
        :disabled="submitting"
        required
        minlength="3">
      <button 
        type="submit" 
        class="btn btn-primary"
        :disabled="title.length < 3 || submitting">
        <span x-show="!submitting">Add</span>
        <span x-show="submitting" class="loading loading-spinner loading-sm"></span>
      </button>
    </form>
  `;
}
```

### Middleware

Middleware handles cross-cutting concerns like authentication and error handling.

```typescript
// src/presentation/middleware/auth.ts
import type { KVSessionStore, Session } from '@infrastructure/cache/KVSessionStore';

export interface AuthContext {
  userId: string;
  session: Session;
}

export async function requireAuth(
  request: Request,
  sessionStore: KVSessionStore
): Promise<AuthContext | Response> {
  const sessionId = getSessionCookie(request);

  if (!sessionId) {
    return redirectToLogin();
  }

  const session = await sessionStore.get(sessionId);

  if (!session) {
    return redirectToLogin(true); // Clear invalid cookie
  }

  return {
    userId: session.userId,
    session,
  };
}

function getSessionCookie(request: Request): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(/session_id=([^;]+)/);
  return match ? match[1] : null;
}

function redirectToLogin(clearCookie = false): Response {
  const headers: Record<string, string> = {
    Location: '/auth/login',
  };

  if (clearCookie) {
    headers['Set-Cookie'] = 'session_id=; Max-Age=0; Path=/';
  }

  return new Response(null, { status: 303, headers });
}
```

```typescript
// src/presentation/middleware/errorHandler.ts
export function errorHandler(
  handler: (request: Request) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('Unhandled error:', error);

      // Check if HTMX request
      const isHtmx = request.headers.get('HX-Request') === 'true';

      if (isHtmx) {
        return new Response(`<div class="alert alert-error">An unexpected error occurred</div>`, {
          status: 500,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      return new Response('Internal Server Error', { status: 500 });
    }
  };
}
```

---

## Directory Structure

The complete directory structure organizes code by architectural layer, with clear boundaries and consistent naming.

```
project-root/
│
├── public/                        # Static content (Cloudflare Pages)
│   ├── index.html                 # Marketing home page
│   ├── about/
│   │   └── index.html
│   ├── pricing/
│   │   └── index.html
│   ├── css/
│   │   └── app.css                # Compiled TailwindCSS
│   └── js/
│       ├── htmx.min.js
│       └── alpine.min.js
│
├── src/
│   │
│   ├── domain/                    # Core business logic (no dependencies)
│   │   ├── entities/
│   │   │   ├── Task.ts
│   │   │   ├── Task.spec.ts       # Unit tests colocated
│   │   │   ├── User.ts
│   │   │   └── User.spec.ts
│   │   ├── value-objects/
│   │   │   ├── Email.ts
│   │   │   ├── Email.spec.ts
│   │   │   ├── TaskId.ts
│   │   │   ├── TaskStatus.ts
│   │   │   └── Money.ts
│   │   ├── services/
│   │   │   ├── TaskPrioritizer.ts
│   │   │   └── TaskPrioritizer.spec.ts
│   │   └── interfaces/            # Repository/service ports
│   │       ├── TaskRepository.ts
│   │       ├── UserRepository.ts
│   │       └── EmailService.ts
│   │
│   ├── application/               # Use cases and orchestration
│   │   ├── use-cases/
│   │   │   ├── CreateTask.ts
│   │   │   ├── CreateTask.spec.ts
│   │   │   ├── CompleteTask.ts
│   │   │   ├── CompleteTask.spec.ts
│   │   │   ├── DeleteTask.ts
│   │   │   └── AssignTaskToUser.ts
│   │   ├── services/
│   │   │   └── AuthorizationService.ts
│   │   └── dto/
│   │       ├── CreateTaskRequest.ts
│   │       ├── UpdateTaskRequest.ts
│   │       ├── TaskResponse.ts
│   │       └── TaskListResponse.ts
│   │
│   ├── infrastructure/            # External concerns (adapters)
│   │   ├── repositories/
│   │   │   ├── D1TaskRepository.ts
│   │   │   ├── D1TaskRepository.integration.test.ts
│   │   │   ├── D1UserRepository.ts
│   │   │   └── D1UserRepository.integration.test.ts
│   │   ├── cache/
│   │   │   ├── KVSessionStore.ts
│   │   │   └── KVSessionStore.integration.test.ts
│   │   └── services/
│   │       ├── MailgunEmailService.ts
│   │       └── StripePaymentService.ts
│   │
│   ├── presentation/              # HTTP layer
│   │   ├── handlers/
│   │   │   ├── TaskHandlers.ts
│   │   │   ├── TaskHandlers.spec.ts
│   │   │   ├── TaskHandlers.acceptance.test.ts
│   │   │   ├── AuthHandlers.ts
│   │   │   └── WebhookHandlers.ts
│   │   ├── templates/
│   │   │   ├── layouts/
│   │   │   │   └── base.ts
│   │   │   ├── pages/
│   │   │   │   ├── dashboard.ts
│   │   │   │   └── tasks.ts
│   │   │   └── partials/
│   │   │       ├── tasks.ts
│   │   │       └── notifications.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   └── utils/
│   │       └── escape.ts
│   │
│   ├── index.ts                   # Worker entry point
│   └── router.ts                  # Route definitions
│
├── tests/
│   ├── setup.ts                   # Global test configuration
│   ├── fixtures/                  # Test data builders
│   │   ├── TaskBuilder.ts
│   │   └── UserBuilder.ts
│   └── helpers/
│       └── testApp.ts             # Test application factory
│
├── migrations/                    # D1 database migrations
│   ├── 0001_initial.sql
│   └── 0002_add_tasks.sql
│
├── wrangler.jsonc                 # Cloudflare configuration
├── vitest.config.ts               # Test configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json
└── README.md
```

### Key Organizational Principles

1. **Layer Separation**: Each layer has its own directory under `src/`

2. **Test Colocation**: Unit tests live next to implementation files (`.spec.ts`)

3. **Integration Test Naming**: Infrastructure tests use `.integration.test.ts` suffix

4. **Acceptance Test Naming**: End-to-end tests use `.acceptance.test.ts` suffix

5. **Template Organization**: Templates grouped by type (layouts, pages, partials)

6. **Static Content Isolation**: `public/` directory serves unchanged by Cloudflare Pages

---

## Naming Conventions

Consistent naming improves readability and makes codebases navigable.

### Files and Directories

| Type                      | Convention                              | Example                                |
| ------------------------- | --------------------------------------- | -------------------------------------- |
| Entity                    | PascalCase                              | `Task.ts`, `User.ts`                   |
| Value Object              | PascalCase                              | `Email.ts`, `TaskStatus.ts`            |
| Use Case                  | PascalCase (verb-noun)                  | `CreateTask.ts`, `CompleteTask.ts`     |
| Repository Interface      | PascalCase + Repository                 | `TaskRepository.ts`                    |
| Repository Implementation | PascalCase (prefix + Repository)        | `D1TaskRepository.ts`                  |
| Handler                   | PascalCase + Handlers                   | `TaskHandlers.ts`                      |
| Template                  | camelCase                               | `taskList.ts`, `taskItem.ts`           |
| Middleware                | camelCase                               | `auth.ts`, `errorHandler.ts`           |
| DTO                       | PascalCase + Request/Response           | `CreateTaskRequest.ts`                 |
| Unit Test                 | same as source + `.spec.ts`             | `Task.spec.ts`                         |
| Integration Test          | same as source + `.integration.test.ts` | `D1TaskRepository.integration.test.ts` |
| Acceptance Test           | same as handler + `.acceptance.test.ts` | `TaskHandlers.acceptance.test.ts`      |

### Classes and Interfaces

| Type                 | Convention                         | Example                       |
| -------------------- | ---------------------------------- | ----------------------------- |
| Entity class         | PascalCase (noun)                  | `Task`, `User`, `Order`       |
| Value Object class   | PascalCase (noun)                  | `Email`, `Money`, `Address`   |
| Use Case class       | PascalCase (verb-noun)             | `CreateTask`, `CompleteOrder` |
| Repository interface | `interface` + PascalCase           | `interface TaskRepository`    |
| Repository impl      | PascalCase (prefix indicates tech) | `class D1TaskRepository`      |
| Service interface    | `interface` + PascalCase + Service | `interface EmailService`      |
| DTO interface        | `interface` + PascalCase           | `interface CreateTaskRequest` |
| Handler class        | PascalCase + Handlers              | `class TaskHandlers`          |

### Methods and Functions

| Type                  | Convention              | Example                                       |
| --------------------- | ----------------------- | --------------------------------------------- |
| Entity factory        | static, verb            | `Task.create()`, `User.register()`            |
| Entity reconstitution | static, `reconstitute`  | `Task.reconstitute(props)`                    |
| Entity behavior       | verb, imperative        | `task.complete()`, `user.updateEmail()`       |
| Entity query          | `is`/`has`/`get` prefix | `task.isCompleted`, `user.hasVerifiedEmail()` |
| Repository methods    | `find`/`save`/`delete`  | `findById()`, `save()`, `delete()`            |
| Use case execution    | `execute`               | `createTask.execute(request)`                 |
| Template functions    | camelCase (noun)        | `taskList()`, `taskItem()`, `baseLayout()`    |
| Private helpers       | camelCase, descriptive  | `toDomain()`, `toResponse()`                  |

### Variables

| Type             | Convention           | Example                          |
| ---------------- | -------------------- | -------------------------------- |
| Private fields   | underscore prefix    | `_id`, `_status`, `_createdAt`   |
| Local variables  | camelCase            | `taskRepository`, `sessionStore` |
| Constants        | SCREAMING_SNAKE_CASE | `DEFAULT_TTL`, `MAX_RETRIES`     |
| Environment vars | SCREAMING_SNAKE_CASE | `DATABASE_URL`, `API_KEY`        |

### HTTP Routes

| Route Type    | Convention          | Example                               |
| ------------- | ------------------- | ------------------------------------- |
| Static page   | `/noun`             | `/`, `/about`, `/pricing`             |
| App full page | `/app/noun`         | `/app/tasks`, `/app/dashboard`        |
| HTMX partial  | `/app/_/noun`       | `/app/_/tasks`, `/app/_/task-list`    |
| Auth routes   | `/auth/action`      | `/auth/login`, `/auth/logout`         |
| Webhooks      | `/webhooks/service` | `/webhooks/stripe`, `/webhooks/slack` |

---

## The Dependency Rule

The dependency rule is the foundation of Clean Architecture: **dependencies point inward, toward the domain**.

```
                    ┌─────────────────┐
                    │                 │
    Infrastructure ─┼──► Application ─┼──► Domain
                    │                 │
    Presentation ───┼──► Application ─┼──► Domain
                    │                 │
                    └─────────────────┘

    Allowed: Infrastructure → Domain (implements interfaces)
    Allowed: Presentation → Application (calls use cases)
    Allowed: Presentation → Domain (uses types only)

    FORBIDDEN: Domain → Infrastructure
    FORBIDDEN: Domain → Application
    FORBIDDEN: Application → Presentation
```

### What This Means in Practice

**Domain Layer:**

- Imports nothing from other layers
- Defines interfaces that infrastructure will implement
- Uses only TypeScript built-ins and domain types

**Application Layer:**

- Imports from domain only
- Receives infrastructure implementations via constructor injection
- Never imports from infrastructure directly

**Infrastructure Layer:**

- Imports from domain (to implement interfaces)
- Imports from application (to use DTOs)
- Never imported by domain or application

**Presentation Layer:**

- Imports from application (use cases, DTOs)
- Imports from domain (entity types, value objects for templates)
- Never imports from infrastructure directly

### Enforcing the Dependency Rule

Use TypeScript path aliases to make violations obvious:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"]
    }
  }
}
```

**Correct imports:**

```typescript
// In application/use-cases/CreateTask.ts
import { Task } from '@domain/entities/Task'; // ✓ App → Domain
import type { TaskRepository } from '@domain/interfaces/TaskRepository'; // ✓

// In infrastructure/repositories/D1TaskRepository.ts
import type { TaskRepository } from '@domain/interfaces/TaskRepository'; // ✓ Infra → Domain
import { Task } from '@domain/entities/Task'; // ✓

// In presentation/handlers/TaskHandlers.ts
import type { CreateTask } from '@application/use-cases/CreateTask'; // ✓ Presentation → App
import type { TaskResponse } from '@application/dto/TaskResponse'; // ✓
```

**Violations to catch:**

```typescript
// In domain/entities/Task.ts
import { D1Database } from '@infrastructure/...'; // ✗ Domain → Infrastructure

// In application/use-cases/CreateTask.ts
import { D1TaskRepository } from '@infrastructure/...'; // ✗ App → Infrastructure

// In domain/services/TaskPrioritizer.ts
import { TaskHandlers } from '@presentation/...'; // ✗ Domain → Presentation
```

### Dependency Injection

Constructor injection allows outer layers to provide implementations to inner layers without violating the dependency rule.

```typescript
// src/index.ts (composition root)
import { D1TaskRepository } from '@infrastructure/repositories/D1TaskRepository';
import { CreateTask } from '@application/use-cases/CreateTask';
import { TaskHandlers } from '@presentation/handlers/TaskHandlers';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Create infrastructure
    const taskRepository = new D1TaskRepository(env.DB);

    // Create use cases with injected dependencies
    const createTask = new CreateTask(taskRepository);

    // Create handlers with injected use cases
    const taskHandlers = new TaskHandlers(createTask, taskRepository);

    // Route and handle request
    // ...
  },
};
```

---

## SOLID Principles in Practice

### Single Responsibility Principle (SRP)

Each class should have one reason to change.

**Good: Separate concerns**

```typescript
// Entity handles business rules
class Task {
  complete(): void {
    /* business logic */
  }
}

// Repository handles persistence
class D1TaskRepository {
  save(task: Task): Promise<void> {
    /* persistence logic */
  }
}

// Use case handles orchestration
class CompleteTask {
  execute(id: string): Promise<TaskResponse> {
    /* orchestration */
  }
}

// Handler handles HTTP
class TaskHandlers {
  handleComplete(request: Request): Promise<Response> {
    /* HTTP logic */
  }
}
```

**Bad: Mixed concerns**

```typescript
// Entity doing persistence - violates SRP
class Task {
  complete(): void {
    /* business logic */
  }

  async save(db: D1Database): Promise<void> {
    // ✗ Persistence in entity
    await db.prepare('UPDATE tasks...').run();
  }
}
```

### Open/Closed Principle (OCP)

Classes should be open for extension but closed for modification.

**Good: Use interfaces and dependency injection**

```typescript
// Domain defines interface
interface NotificationService {
  notify(userId: string, message: string): Promise<void>;
}

// Multiple implementations without changing domain
class EmailNotificationService implements NotificationService {
  async notify(userId: string, message: string): Promise<void> {
    // Send email
  }
}

class SlackNotificationService implements NotificationService {
  async notify(userId: string, message: string): Promise<void> {
    // Send Slack message
  }
}

class CompositeNotificationService implements NotificationService {
  constructor(private services: NotificationService[]) {}

  async notify(userId: string, message: string): Promise<void> {
    await Promise.all(this.services.map((s) => s.notify(userId, message)));
  }
}
```

### Liskov Substitution Principle (LSP)

Subtypes must be substitutable for their base types.

**Good: Consistent behavior**

```typescript
interface TaskRepository {
  findById(id: string): Promise<Task | null>;
}

// Both implementations honor the contract
class D1TaskRepository implements TaskRepository {
  async findById(id: string): Promise<Task | null> {
    // Returns Task or null, never throws for missing
  }
}

class InMemoryTaskRepository implements TaskRepository {
  async findById(id: string): Promise<Task | null> {
    // Same contract: Task or null
  }
}
```

**Bad: Inconsistent behavior**

```typescript
class CachingTaskRepository implements TaskRepository {
  async findById(id: string): Promise<Task | null> {
    // ✗ Throws instead of returning null
    throw new Error('Not found');
  }
}
```

### Interface Segregation Principle (ISP)

Clients shouldn't depend on interfaces they don't use.

**Good: Focused interfaces**

```typescript
// Separate read and write interfaces
interface TaskReader {
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
}

interface TaskWriter {
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}

// Combine when needed
interface TaskRepository extends TaskReader, TaskWriter {}

// Use cases depend only on what they need
class GetTaskDetails {
  constructor(private reader: TaskReader) {} // Only needs read
}

class CreateTask {
  constructor(private writer: TaskWriter) {} // Only needs write
}
```

### Dependency Inversion Principle (DIP)

High-level modules shouldn't depend on low-level modules. Both should depend on abstractions.

**Good: Depend on abstractions**

```typescript
// Domain defines the interface (abstraction)
// src/domain/interfaces/TaskRepository.ts
interface TaskRepository {
  save(task: Task): Promise<void>;
}

// Use case depends on abstraction
// src/application/use-cases/CreateTask.ts
class CreateTask {
  constructor(private taskRepository: TaskRepository) {} // Interface, not implementation
}

// Infrastructure implements abstraction
// src/infrastructure/repositories/D1TaskRepository.ts
class D1TaskRepository implements TaskRepository {
  save(task: Task): Promise<void> {
    /* D1 specific */
  }
}
```

**Bad: Depend on concretions**

```typescript
class CreateTask {
  constructor(private taskRepository: D1TaskRepository) {} // ✗ Concrete class
}
```

---

## Clean Code Guidelines

### Meaningful Names

Names should reveal intent and be pronounceable.

**Good names:**

```typescript
// Variables
const completedTasks = tasks.filter(t => t.isCompleted);
const sessionExpirationMs = 7 * 24 * 60 * 60 * 1000;

// Functions
function calculateTaskPriority(task: Task): number
function findOverdueTasks(tasks: Task[]): Task[]
function formatTaskForDisplay(task: Task): string

// Classes
class TaskPrioritizer
class EmailValidator
class SessionManager
```

**Bad names:**

```typescript
// Too short / unclear
const d = tasks.filter(t => t.c);
const exp = 604800000;

// Misleading
function processTask(task: Task) // What kind of processing?
const taskList = getTask(); // Returns single task, not list

// Noise words
class TaskManager // Manager of what?
class TaskData    // Data about what?
class TaskInfo    // Info about what?
```

### Functions

Functions should be small, do one thing, and have descriptive names.

**Good: Small, focused functions**

```typescript
class TaskHandlers {
  async handleCreateTask(request: Request): Promise<Response> {
    const input = await this.parseTaskInput(request);
    const validationError = this.validateTaskInput(input);

    if (validationError) {
      return this.errorResponse(validationError);
    }

    const task = await this.createTask.execute(input);
    return this.successResponse(task);
  }

  private async parseTaskInput(request: Request): Promise<TaskInput> {
    const formData = await request.formData();
    return {
      title: formData.get('title') as string,
      userId: formData.get('userId') as string,
    };
  }

  private validateTaskInput(input: TaskInput): string | null {
    if (!input.title || input.title.trim().length < 3) {
      return 'Title must be at least 3 characters';
    }
    return null;
  }

  private errorResponse(message: string): Response {
    return new Response(`<div class="alert alert-error">${escapeHtml(message)}</div>`, {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  private successResponse(task: TaskResponse): Response {
    return new Response(taskItemPartial(task), {
      status: 201,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
```

**Bad: Large, multi-purpose function**

```typescript
async handleCreateTask(request: Request): Promise<Response> {
  const formData = await request.formData();
  const title = formData.get('title') as string;
  const userId = formData.get('userId') as string;

  if (!title || title.trim().length < 3) {
    return new Response(
      `<div class="alert alert-error">Title must be at least 3 characters</div>`,
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const task = Task.create({ userId, title: title.trim() });
  await this.taskRepository.save(task);

  const html = `<li class="task-item">...</li>`; // Long HTML string

  return new Response(html, {
    status: 201,
    headers: {
      'Content-Type': 'text/html',
      'HX-Trigger': JSON.stringify({ notify: { message: 'Created!' } })
    }
  });
}
```

### Comments

Code should be self-documenting. Use comments sparingly, primarily for "why" not "what".

**Good comments:**

```typescript
// Domain rule: Tasks older than 30 days are considered stale
// per product decision from 2024-03-15
const STALE_THRESHOLD_DAYS = 30;

// Performance optimization: batch database calls to reduce latency
// See benchmark results in docs/performance.md
const tasks = await Promise.all(ids.map((id) => repository.findById(id)));

// WORKAROUND: D1 doesn't support RETURNING clause yet
// Remove after https://github.com/cloudflare/workers-sdk/issues/XXX
await db.prepare('INSERT...').run();
const inserted = await db.prepare('SELECT...').first();
```

**Bad comments:**

```typescript
// Get the task by id
const task = await repository.findById(id);

// Check if task exists
if (!task) {
  // Return 404
  return new Response('Not found', { status: 404 });
}

// Set completed to true
task.complete();

// Save the task
await repository.save(task);
```

### Error Handling

Use exceptions for exceptional circumstances. Don't return error codes.

**Good: Explicit error types**

```typescript
// Define specific error types
export class TaskNotFoundError extends Error {
  constructor(public readonly taskId: string) {
    super(`Task not found: ${taskId}`);
    this.name = 'TaskNotFoundError';
  }
}

export class TaskAlreadyCompletedError extends Error {
  constructor(public readonly taskId: string) {
    super(`Task already completed: ${taskId}`);
    this.name = 'TaskAlreadyCompletedError';
  }
}

// Use case throws specific errors
class CompleteTask {
  async execute(taskId: string): Promise<TaskResponse> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    if (task.isCompleted) {
      throw new TaskAlreadyCompletedError(taskId);
    }

    task.complete();
    await this.taskRepository.save(task);

    return this.toResponse(task);
  }
}

// Handler catches and maps to HTTP responses
class TaskHandlers {
  async handleComplete(request: Request, taskId: string): Promise<Response> {
    try {
      const task = await this.completeTask.execute(taskId);
      return this.html(taskItemPartial(task));
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        return new Response('Not found', { status: 404 });
      }
      if (error instanceof TaskAlreadyCompletedError) {
        return this.html(`<div class="alert alert-warning">Task already completed</div>`, 400);
      }
      throw error; // Re-throw unexpected errors
    }
  }
}
```

### Code Organization

Keep related code together. Separate code that changes for different reasons.

**File length:** Aim for files under 200-300 lines. If longer, consider splitting.

**Function length:** Aim for functions under 20-30 lines. Extract helper functions.

**Class cohesion:** A class should have a single, clear purpose. All methods should relate to that purpose.

---

## Testing Strategy

Following GOOS (Growing Object-Oriented Software, Guided by Tests) principles, tests are organized in three layers with distinct purposes.

### The Test Pyramid

```
           /\
          /  \         Acceptance Tests
         / AT \        - Few, slow, comprehensive
        /──────\       - Test complete features via HTTP
       /        \      - Use real D1/KV (via Miniflare)
      / Integr.  \     Integration Tests
     /────────────\    - Some, medium speed
    /              \   - Test adapters with real infra
   /    Unit        \  Unit Tests
  /──────────────────\ - Many, fast, isolated
 /                    \- Test domain and use cases
/______________________\- Mock external dependencies
```

### Unit Tests

Unit tests verify individual components in isolation. They are fast, focused, and numerous.

**Entity Unit Tests:**

```typescript
// src/domain/entities/Task.spec.ts
import { describe, it, expect } from 'vitest';
import { Task } from './Task';

describe('Task', () => {
  describe('create', () => {
    it('creates a pending task with the given title', () => {
      const task = Task.create({
        userId: 'user-1',
        title: 'Buy groceries',
      });

      expect(task.title).toBe('Buy groceries');
      expect(task.userId).toBe('user-1');
      expect(task.isCompleted).toBe(false);
      expect(task.id).toBeDefined();
    });

    it('rejects titles shorter than 3 characters', () => {
      expect(() =>
        Task.create({
          userId: 'user-1',
          title: 'ab',
        })
      ).toThrow('Task title must be at least 3 characters');
    });

    it('trims whitespace from title', () => {
      const task = Task.create({
        userId: 'user-1',
        title: '  Buy groceries  ',
      });

      expect(task.title).toBe('Buy groceries');
    });
  });

  describe('complete', () => {
    it('marks a pending task as completed', () => {
      const task = Task.create({ userId: 'user-1', title: 'Test task' });

      task.complete();

      expect(task.isCompleted).toBe(true);
    });

    it('throws when completing an already completed task', () => {
      const task = Task.create({ userId: 'user-1', title: 'Test task' });
      task.complete();

      expect(() => task.complete()).toThrow('Task is already completed');
    });
  });

  describe('rename', () => {
    it('updates the task title', () => {
      const task = Task.create({ userId: 'user-1', title: 'Old title' });

      task.rename('New title');

      expect(task.title).toBe('New title');
    });

    it('rejects empty titles', () => {
      const task = Task.create({ userId: 'user-1', title: 'Test task' });

      expect(() => task.rename('')).toThrow('Task title must be at least 3 characters');
    });
  });
});
```

**Use Case Unit Tests:**

```typescript
// src/application/use-cases/CreateTask.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateTask } from './CreateTask';
import type { TaskRepository } from '@domain/interfaces/TaskRepository';

describe('CreateTask', () => {
  let createTask: CreateTask;
  let mockRepository: TaskRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByUserId: vi.fn(),
      findPending: vi.fn(),
      findCompleted: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    createTask = new CreateTask(mockRepository);
  });

  it('creates a task and saves it to the repository', async () => {
    const result = await createTask.execute({
      userId: 'user-1',
      title: 'Test task',
    });

    expect(result.title).toBe('Test task');
    expect(result.completed).toBe(false);
    expect(result.id).toBeDefined();
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('returns a response DTO, not a domain entity', async () => {
    const result = await createTask.execute({
      userId: 'user-1',
      title: 'Test task',
    });

    // Response should be a plain object, not an entity
    expect(result).toEqual({
      id: expect.any(String),
      title: 'Test task',
      completed: false,
      createdAt: expect.any(String),
    });
  });
});
```

### Integration Tests

Integration tests verify that adapters work correctly with real infrastructure.

```typescript
// src/infrastructure/repositories/D1TaskRepository.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { D1TaskRepository } from './D1TaskRepository';
import { Task } from '@domain/entities/Task';

describe('D1TaskRepository', () => {
  let repository: D1TaskRepository;

  beforeEach(async () => {
    repository = new D1TaskRepository(env.DB);
    // Clean state (migrations applied in setup.ts)
    await env.DB.prepare('DELETE FROM tasks').run();
  });

  describe('save and findById', () => {
    it('persists and retrieves a task', async () => {
      const task = Task.create({
        userId: 'user-1',
        title: 'Integration test task',
      });

      await repository.save(task);
      const found = await repository.findById(task.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(task.id);
      expect(found!.title).toBe('Integration test task');
      expect(found!.userId).toBe('user-1');
      expect(found!.isCompleted).toBe(false);
    });

    it('returns null for non-existent task', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('returns only tasks for the specified user', async () => {
      const task1 = Task.create({ userId: 'user-1', title: 'User 1 task' });
      const task2 = Task.create({ userId: 'user-2', title: 'User 2 task' });
      const task3 = Task.create({ userId: 'user-1', title: 'Another user 1 task' });

      await Promise.all([repository.save(task1), repository.save(task2), repository.save(task3)]);

      const user1Tasks = await repository.findByUserId('user-1');

      expect(user1Tasks).toHaveLength(2);
      expect(user1Tasks.map((t) => t.title)).toContain('User 1 task');
      expect(user1Tasks.map((t) => t.title)).toContain('Another user 1 task');
    });
  });

  describe('save (update)', () => {
    it('updates an existing task', async () => {
      const task = Task.create({ userId: 'user-1', title: 'Original title' });
      await repository.save(task);

      task.complete();
      task.rename('Updated title');
      await repository.save(task);

      const found = await repository.findById(task.id);
      expect(found!.title).toBe('Updated title');
      expect(found!.isCompleted).toBe(true);
    });
  });

  describe('delete', () => {
    it('removes a task', async () => {
      const task = Task.create({ userId: 'user-1', title: 'To be deleted' });
      await repository.save(task);

      await repository.delete(task.id);

      const found = await repository.findById(task.id);
      expect(found).toBeNull();
    });
  });
});
```

### Acceptance Tests

Acceptance tests verify complete features from the user's perspective.

```typescript
// src/presentation/handlers/TaskHandlers.acceptance.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { env, SELF } from 'cloudflare:test';

describe('Task Management Feature', () => {
  beforeEach(async () => {
    // Clean state
    await env.DB.prepare('DELETE FROM tasks').run();
  });

  describe('Creating a task', () => {
    it('creates a task and returns HTML for HTMX', async () => {
      // Given: A user on the tasks page
      const formData = new FormData();
      formData.append('title', 'Buy groceries');
      formData.append('userId', 'user-1');

      // When: They submit the task form
      const response = await SELF.fetch('http://localhost/app/_/tasks', {
        method: 'POST',
        body: formData,
      });

      // Then: The response is successful HTML
      expect(response.status).toBe(201);
      expect(response.headers.get('Content-Type')).toContain('text/html');

      // And: Contains the task
      const html = await response.text();
      expect(html).toContain('Buy groceries');
      expect(html).toContain('task-item');

      // And: Triggers a notification
      const hxTrigger = response.headers.get('HX-Trigger');
      expect(hxTrigger).toBeDefined();
      const trigger = JSON.parse(hxTrigger!);
      expect(trigger.notify.type).toBe('success');
    });

    it('rejects invalid tasks with an error alert', async () => {
      const formData = new FormData();
      formData.append('title', 'ab'); // Too short
      formData.append('userId', 'user-1');

      const response = await SELF.fetch('http://localhost/app/_/tasks', {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(400);
      const html = await response.text();
      expect(html).toContain('alert-error');
      expect(html).toContain('at least 3 characters');
    });
  });

  describe('Completing a task', () => {
    it('toggles completion and returns updated HTML', async () => {
      // Given: An existing task
      const createForm = new FormData();
      createForm.append('title', 'Test task');
      createForm.append('userId', 'user-1');

      const createResponse = await SELF.fetch('http://localhost/app/_/tasks', {
        method: 'POST',
        body: createForm,
      });

      const createHtml = await createResponse.text();
      const idMatch = createHtml.match(/id="task-([^"]+)"/);
      const taskId = idMatch![1];

      // When: The user marks it complete
      const response = await SELF.fetch(`http://localhost/app/_/tasks/${taskId}/toggle`, {
        method: 'POST',
      });

      // Then: The response shows completed state
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain('checked');
      expect(html).toContain('line-through');
    });
  });

  describe('Deleting a task', () => {
    it('removes the task and returns empty response', async () => {
      // Given: An existing task
      const createForm = new FormData();
      createForm.append('title', 'Task to delete');
      createForm.append('userId', 'user-1');

      const createResponse = await SELF.fetch('http://localhost/app/_/tasks', {
        method: 'POST',
        body: createForm,
      });

      const createHtml = await createResponse.text();
      const idMatch = createHtml.match(/id="task-([^"]+)"/);
      const taskId = idMatch![1];

      // When: The user deletes it
      const response = await SELF.fetch(`http://localhost/app/_/tasks/${taskId}`, {
        method: 'DELETE',
      });

      // Then: Success with notification
      expect(response.status).toBe(200);
      const hxTrigger = response.headers.get('HX-Trigger');
      const trigger = JSON.parse(hxTrigger!);
      expect(trigger.notify.message).toContain('deleted');

      // And: Task is gone from database
      const listResponse = await SELF.fetch('http://localhost/app/_/tasks');
      const listHtml = await listResponse.text();
      expect(listHtml).not.toContain(taskId);
    });
  });
});
```

### Test Builders

Test builders create test data with sensible defaults and fluent configuration.

```typescript
// tests/fixtures/TaskBuilder.ts
import { Task } from '@domain/entities/Task';

export class TaskBuilder {
  private props = {
    id: crypto.randomUUID(),
    userId: 'test-user',
    title: 'Test task',
    completed: false,
    createdAt: new Date(),
  };

  static aTask(): TaskBuilder {
    return new TaskBuilder();
  }

  withId(id: string): TaskBuilder {
    this.props.id = id;
    return this;
  }

  withUserId(userId: string): TaskBuilder {
    this.props.userId = userId;
    return this;
  }

  withTitle(title: string): TaskBuilder {
    this.props.title = title;
    return this;
  }

  completed(): TaskBuilder {
    this.props.completed = true;
    return this;
  }

  pending(): TaskBuilder {
    this.props.completed = false;
    return this;
  }

  createdAt(date: Date): TaskBuilder {
    this.props.createdAt = date;
    return this;
  }

  createdDaysAgo(days: number): TaskBuilder {
    const date = new Date();
    date.setDate(date.getDate() - days);
    this.props.createdAt = date;
    return this;
  }

  build(): Task {
    return Task.reconstitute(this.props);
  }
}

// Usage in tests
const task = TaskBuilder.aTask()
  .withTitle('Important task')
  .withUserId('user-123')
  .completed()
  .build();

const oldTask = TaskBuilder.aTask().withTitle('Stale task').createdDaysAgo(45).build();
```

---

## Common Patterns

### Factory Methods for Entity Creation

Use factory methods to enforce invariants and provide clear semantics.

```typescript
class User {
  // For new users (generates ID, validates, sets defaults)
  static register(email: string, name: string): User {
    return new User({
      id: crypto.randomUUID(),
      email: new Email(email),
      name: name.trim(),
      verified: false,
      createdAt: new Date(),
    });
  }

  // For OAuth users (different requirements)
  static fromOAuth(provider: string, providerId: string, email: string, name: string): User {
    return new User({
      id: crypto.randomUUID(),
      email: new Email(email),
      name,
      verified: true, // OAuth emails are pre-verified
      oauthProvider: provider,
      oauthId: providerId,
      createdAt: new Date(),
    });
  }

  // For loading from database (no validation)
  static reconstitute(props: UserProps): User {
    return new User(props);
  }
}
```

### Repository Pattern with Query Methods

Keep repositories focused on persistence, not business logic.

```typescript
interface TaskRepository {
  // Basic CRUD
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;

  // Query methods (no business logic)
  findByUserId(userId: string): Promise<Task[]>;
  findPending(): Promise<Task[]>;
  findCompleted(): Promise<Task[]>;

  // Pagination support
  findByUserIdPaginated(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ tasks: Task[]; total: number }>;
}
```

### Use Case Result Pattern

Return result objects for operations that can fail in expected ways.

```typescript
type Result<T, E> = { success: true; value: T } | { success: false; error: E };

class CompleteTask {
  async execute(taskId: string): Promise<Result<TaskResponse, CompleteTaskError>> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      return { success: false, error: { type: 'NOT_FOUND', taskId } };
    }

    if (task.isCompleted) {
      return { success: false, error: { type: 'ALREADY_COMPLETED', taskId } };
    }

    task.complete();
    await this.taskRepository.save(task);

    return { success: true, value: this.toResponse(task) };
  }
}

type CompleteTaskError =
  | { type: 'NOT_FOUND'; taskId: string }
  | { type: 'ALREADY_COMPLETED'; taskId: string };
```

### Template Composition

Compose templates from smaller, reusable parts.

```typescript
// Layouts wrap content
function baseLayout(props: { title: string; content: string }): string {
  return `
    <!DOCTYPE html>
    <html>
      <head><title>${escapeHtml(props.title)}</title></head>
      <body>
        ${navbar()}
        <main>${props.content}</main>
        ${footer()}
      </body>
    </html>
  `;
}

// Pages compose partials
function tasksPage(tasks: Task[]): string {
  return `
    <div class="container">
      ${taskForm()}
      <div id="task-list">
        ${taskList(tasks)}
      </div>
    </div>
  `;
}

// Partials are self-contained
function taskList(tasks: Task[]): string {
  return tasks.map(taskItem).join('');
}

function taskItem(task: Task): string {
  return `<li>...</li>`;
}
```

---

## Anti-Patterns to Avoid

### Anemic Domain Model

**Problem:** Entities are just data containers with getters/setters, and all logic lives in services.

```typescript
// ✗ Anemic entity
class Task {
  id: string;
  title: string;
  completed: boolean;
}

// ✗ Logic in service instead of entity
class TaskService {
  complete(task: Task): void {
    if (task.completed) throw new Error('Already completed');
    task.completed = true;
  }
}
```

**Solution:** Put behavior in entities.

```typescript
// ✓ Rich entity with behavior
class Task {
  private _completed: boolean;

  complete(): void {
    if (this._completed) throw new Error('Already completed');
    this._completed = true;
  }
}
```

### Leaky Abstractions

**Problem:** Infrastructure details leak into domain.

```typescript
// ✗ Domain entity knows about D1
class Task {
  async save(db: D1Database): Promise<void> {
    await db.prepare('INSERT INTO tasks...').run();
  }
}
```

**Solution:** Keep domain pure, implement persistence in infrastructure.

```typescript
// ✓ Domain defines interface
interface TaskRepository {
  save(task: Task): Promise<void>;
}

// ✓ Infrastructure implements
class D1TaskRepository implements TaskRepository {
  async save(task: Task): Promise<void> {
    await this.db.prepare('INSERT INTO tasks...').run();
  }
}
```

### God Classes

**Problem:** One class does everything.

```typescript
// ✗ God class
class TaskManager {
  createTask() {
    /* ... */
  }
  completeTask() {
    /* ... */
  }
  deleteTask() {
    /* ... */
  }
  sendNotification() {
    /* ... */
  }
  validateTask() {
    /* ... */
  }
  formatTaskForDisplay() {
    /* ... */
  }
  syncWithExternalApi() {
    /* ... */
  }
}
```

**Solution:** Split into focused classes.

```typescript
// ✓ Focused classes
class CreateTask {
  execute() {
    /* ... */
  }
}
class CompleteTask {
  execute() {
    /* ... */
  }
}
class TaskHandlers {
  /* HTTP handling */
}
class NotificationService {
  /* notifications */
}
```

### Primitive Obsession

**Problem:** Using primitives instead of value objects.

```typescript
// ✗ Primitives everywhere
function createUser(email: string, phone: string, zip: string) {
  // No validation, easy to swap parameters
}
```

**Solution:** Use value objects.

```typescript
// ✓ Value objects with validation
class Email {
  constructor(value: string) {
    if (!this.isValid(value)) throw new Error('Invalid email');
    this._value = value;
  }
}

function createUser(email: Email, phone: PhoneNumber, zip: ZipCode) {
  // Type-safe, validated
}
```

### Test Pollution

**Problem:** Tests share state or mock too much.

```typescript
// ✗ Shared mutable state
let globalTask: Task;

beforeAll(() => {
  globalTask = Task.create({ userId: 'user', title: 'Test' });
});

it('test 1', () => {
  globalTask.complete(); // Mutates shared state
});

it('test 2', () => {
  expect(globalTask.isCompleted).toBe(false); // FAILS - state leaked
});
```

**Solution:** Fresh state per test.

```typescript
// ✓ Fresh state per test
describe('Task', () => {
  let task: Task;

  beforeEach(() => {
    task = Task.create({ userId: 'user', title: 'Test' });
  });

  it('test 1', () => {
    task.complete();
    expect(task.isCompleted).toBe(true);
  });

  it('test 2', () => {
    expect(task.isCompleted).toBe(false); // Fresh task
  });
});
```

---

## Refactoring Checklist

Use this checklist when reviewing or refactoring code.

### Domain Layer

- [ ] Entities have private constructors with factory methods
- [ ] Entities validate invariants on construction
- [ ] Business logic is in entities, not services
- [ ] Value objects are immutable
- [ ] Value objects validate in constructor
- [ ] Repository interfaces use domain language
- [ ] No framework imports in domain
- [ ] No async operations in entities

### Application Layer

- [ ] Use cases have single responsibility
- [ ] Use cases accept/return DTOs, not entities
- [ ] Dependencies injected via constructor
- [ ] No direct infrastructure imports
- [ ] Error cases throw specific exceptions

### Infrastructure Layer

- [ ] Implements domain interfaces
- [ ] Translation between domain and persistence formats
- [ ] No business logic (that belongs in domain)
- [ ] Proper error handling and retries

### Presentation Layer

- [ ] Handlers coordinate, don't contain logic
- [ ] Input validation before calling use cases
- [ ] Proper error mapping to HTTP responses
- [ ] Templates are pure functions
- [ ] HTML properly escaped

### Testing

- [ ] Unit tests cover domain entities and use cases
- [ ] Integration tests cover repositories
- [ ] Acceptance tests cover user journeys
- [ ] Tests are isolated (no shared state)
- [ ] Test names describe behavior
- [ ] Test builders for complex objects

### Naming

- [ ] Names reveal intent
- [ ] Consistent naming conventions
- [ ] No abbreviations or acronyms (unless domain-standard)
- [ ] File names match class names

### Code Quality

- [ ] Functions under 30 lines
- [ ] Files under 300 lines
- [ ] Single level of abstraction per function
- [ ] Comments explain "why", not "what"
- [ ] No commented-out code
- [ ] No magic numbers/strings

---

## Conclusion

This guide establishes a foundation for building maintainable web applications on Cloudflare's edge platform. By combining Domain-Driven Design's strategic patterns with Clean Code principles and Clean Architecture's structural guidance, we create systems that are:

**Testable**: Pure domain logic, dependency injection, and clear layer boundaries make testing straightforward and comprehensive.

**Maintainable**: Consistent naming, small focused functions, and single-responsibility classes make code easy to understand and modify.

**Evolvable**: The dependency rule protects business logic from infrastructure changes. Swap D1 for another database, change from HTMX to another approach—the domain remains unchanged.

**Performant**: Edge execution, hypermedia-driven interactions, and minimal JavaScript deliver fast user experiences.

The patterns and practices here are not prescriptive rules but guiding principles. Apply them thoughtfully, adapting to your specific context while maintaining their spirit: code that is clean, expressive, and organized around the domain it serves.

---

_This guide is intended to complement the "Comprehensive Guide: Interactive Web Applications on Cloudflare." Together, they provide both the architectural foundation and the structural discipline needed for building production-quality applications._
