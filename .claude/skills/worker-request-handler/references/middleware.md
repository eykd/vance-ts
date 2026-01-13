# Middleware Patterns

## Table of Contents

- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Logging](#logging)
- [Integration in Entry Point](#integration-in-entry-point)

## Error Handling

### Global Error Handler

```typescript
// src/presentation/middleware/errorHandler.ts
export function errorHandler(error: unknown): Response {
  console.error('Unhandled error:', error);

  if (error instanceof ValidationError) {
    return new Response(`<div class="alert alert-error">${escapeHtml(error.message)}</div>`, {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (error instanceof NotFoundError) {
    return new Response(`<div class="alert alert-warning">${escapeHtml(error.message)}</div>`, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (error instanceof UnauthorizedError) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/login' },
    });
  }

  // Generic server error
  return new Response(
    `<div class="alert alert-error">Something went wrong. Please try again.</div>`,
    {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}
```

### Domain Error Classes

```typescript
// src/domain/errors.ts
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {}
export class NotFoundError extends DomainError {}
export class UnauthorizedError extends DomainError {}
export class ForbiddenError extends DomainError {}
```

### Error Handler with Request Context

```typescript
export function errorHandler(error: unknown, request: Request): Response {
  const requestId = crypto.randomUUID();
  const url = new URL(request.url);

  // Log error with context
  console.error(
    JSON.stringify({
      requestId,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      path: url.pathname,
      method: request.method,
    })
  );

  // Include requestId in response for debugging
  if (error instanceof Error && !(error instanceof DomainError)) {
    return new Response(
      `<div class="alert alert-error">
        <p>Something went wrong. Please try again.</p>
        <p class="text-xs opacity-60">Reference: ${requestId}</p>
      </div>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  // Handle domain errors...
}
```

## Authentication

### Session-Based Auth

```typescript
// src/presentation/middleware/auth.ts
import type { KVSessionStore, Session } from '@infrastructure/cache/KVSessionStore';

export class AuthMiddleware {
  constructor(private sessionStore: KVSessionStore) {}

  async getSession(request: Request): Promise<Session | null> {
    const cookie = request.headers.get('Cookie');
    if (!cookie) return null;

    const sessionId = this.extractSessionId(cookie);
    if (!sessionId) return null;

    return await this.sessionStore.get(sessionId);
  }

  async requireAuth(request: Request): Promise<Session> {
    const session = await this.getSession(request);
    if (!session) {
      throw new UnauthorizedError('Authentication required');
    }
    return session;
  }

  private extractSessionId(cookie: string): string | null {
    const match = cookie.match(/session=([^;]+)/);
    return match ? match[1] : null;
  }
}
```

### Usage in Handlers

```typescript
export class TaskHandlers {
  constructor(
    private createTaskUseCase: CreateTask,
    private taskRepository: TaskRepository,
    private auth: AuthMiddleware
  ) {}

  // Public endpoint
  async tasksPage(request: Request): Promise<Response> {
    const session = await this.auth.getSession(request);
    const tasks = session ? await this.taskRepository.findByUserId(session.userId) : [];
    return this.htmlResponse(tasksPageTemplate(tasks, session));
  }

  // Protected endpoint
  async createTask(request: Request): Promise<Response> {
    const session = await this.auth.requireAuth(request);
    // ... create task with session.userId
  }
}
```

### Login/Logout Handlers

```typescript
export class AuthHandlers {
  constructor(
    private sessionStore: KVSessionStore,
    private userRepository: UserRepository
  ) {}

  async login(request: Request): Promise<Response> {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = await this.userRepository.findByEmail(email);
    if (!user || !(await user.verifyPassword(password))) {
      return this.htmlResponse(loginForm({ email }, { form: 'Invalid email or password' }), 401);
    }

    const sessionId = await this.sessionStore.create(user.id, user.email);

    return new Response(null, {
      status: 303,
      headers: {
        Location: '/tasks',
        'Set-Cookie': `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
      },
    });
  }

  async logout(request: Request): Promise<Response> {
    const cookie = request.headers.get('Cookie');
    const sessionId = cookie?.match(/session=([^;]+)/)?.[1];

    if (sessionId) {
      await this.sessionStore.delete(sessionId);
    }

    return new Response(null, {
      status: 303,
      headers: {
        Location: '/',
        'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
      },
    });
  }
}
```

## Logging

### Request Logging

```typescript
// src/presentation/middleware/logging.ts
export function logRequest(request: Request): void {
  const url = new URL(request.url);
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      method: request.method,
      path: url.pathname,
      query: url.search,
      userAgent: request.headers.get('user-agent'),
      cfRay: request.headers.get('cf-ray'),
    })
  );
}

export function logResponse(request: Request, response: Response, durationMs: number): void {
  const url = new URL(request.url);
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      method: request.method,
      path: url.pathname,
      status: response.status,
      durationMs: Math.round(durationMs),
    })
  );
}

export function logError(error: Error, request: Request): void {
  const url = new URL(request.url);
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      method: request.method,
      path: url.pathname,
    })
  );
}
```

### Structured Logging Wrapper

```typescript
async function withLogging(request: Request, handler: () => Promise<Response>): Promise<Response> {
  const start = performance.now();
  logRequest(request);

  try {
    const response = await handler();
    logResponse(request, response, performance.now() - start);
    return response;
  } catch (error) {
    logError(error as Error, request);
    throw error;
  }
}
```

## Integration in Entry Point

```typescript
// src/index.ts
import { Router } from './router';
import { errorHandler } from './presentation/middleware/errorHandler';
import { logRequest, logError } from './presentation/middleware/logging';
import { AuthMiddleware } from './presentation/middleware/auth';
import { TaskHandlers } from './presentation/handlers/TaskHandlers';
import { AuthHandlers } from './presentation/handlers/AuthHandlers';
import { D1TaskRepository } from './infrastructure/repositories/D1TaskRepository';
import { KVSessionStore } from './infrastructure/cache/KVSessionStore';
import { CreateTask } from './application/use-cases/CreateTask';

export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const start = performance.now();
    logRequest(request);

    try {
      // Wire up dependencies
      const taskRepository = new D1TaskRepository(env.DB);
      const sessionStore = new KVSessionStore(env.SESSIONS);
      const auth = new AuthMiddleware(sessionStore);

      const createTask = new CreateTask(taskRepository);
      const taskHandlers = new TaskHandlers(createTask, taskRepository, auth);
      const authHandlers = new AuthHandlers(sessionStore, userRepository);

      const router = new Router(env, taskHandlers, authHandlers);
      const response = await router.handle(request);

      console.log(
        JSON.stringify({
          method: request.method,
          path: new URL(request.url).pathname,
          status: response.status,
          durationMs: Math.round(performance.now() - start),
        })
      );

      return response;
    } catch (error) {
      logError(error as Error, request);
      return errorHandler(error, request);
    }
  },
};
```

### Router with Auth Routes

```typescript
// src/router.ts
export class Router {
  constructor(
    private env: Env,
    private taskHandlers: TaskHandlers,
    private authHandlers: AuthHandlers
  ) {
    this.registerRoutes();
  }

  private registerRoutes(): void {
    // Auth routes
    this.get('/login', (req) => this.authHandlers.loginPage(req));
    this.post('/login', (req) => this.authHandlers.login(req));
    this.post('/logout', (req) => this.authHandlers.logout(req));

    // Task routes
    this.get('/', (req) => this.taskHandlers.homePage(req));
    this.get('/tasks', (req) => this.taskHandlers.tasksPage(req));
    this.get('/api/tasks', (req) => this.taskHandlers.listTasks(req));
    this.post('/api/tasks', (req) => this.taskHandlers.createTask(req));
    this.patch('/api/tasks/:id', (req, p) => this.taskHandlers.updateTask(req, p.id));
    this.delete('/api/tasks/:id', (req, p) => this.taskHandlers.deleteTask(req, p.id));

    // Static assets
    this.get('/*', async (req) => this.env.ASSETS.fetch(req));
  }

  // ... route registration methods
}
```
