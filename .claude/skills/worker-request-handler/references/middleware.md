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
      headers: { Location: '/auth/login' },
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
        Location: '/app/tasks',
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

### Secure Cookie Configuration

Session cookies must be configured with security flags to prevent common attacks:

```typescript
// src/presentation/middleware/cookies.ts

export interface CookieOptions {
  maxAge?: number; // Seconds until expiration
  path?: string; // Cookie path scope
  domain?: string; // Cookie domain scope
  expires?: Date; // Absolute expiration date
}

/**
 * Creates a secure Set-Cookie header value with security flags.
 *
 * Security flags included:
 * - HttpOnly: Prevents JavaScript access (XSS protection)
 * - Secure: Only sent over HTTPS (prevents interception)
 * - SameSite=Strict: Prevents CSRF attacks
 * - Path: Limits cookie scope
 * - Max-Age: Sets expiration time
 */
export function createSecureCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const {
    maxAge = 7 * 24 * 60 * 60, // Default: 7 days
    path = '/',
    domain,
    expires,
  } = options;

  const parts = [`${name}=${value}`];

  // Security flags (always enabled)
  parts.push('HttpOnly'); // Prevents XSS attacks
  parts.push('Secure'); // HTTPS only
  parts.push('SameSite=Strict'); // Prevents CSRF attacks

  // Scoping
  parts.push(`Path=${path}`);
  if (domain) {
    parts.push(`Domain=${domain}`);
  }

  // Expiration
  if (expires) {
    parts.push(`Expires=${expires.toUTCString()}`);
  } else {
    parts.push(`Max-Age=${maxAge}`);
  }

  return parts.join('; ');
}

/**
 * Creates a cookie deletion header.
 */
export function deleteCookie(name: string, path: string = '/'): string {
  return createSecureCookie(name, '', { maxAge: 0, path });
}
```

**Usage in handlers:**

```typescript
// Login - set session cookie
const sessionId = await this.sessionStore.create(user.id, user.email);

return new Response(null, {
  status: 303,
  headers: {
    Location: '/app/tasks',
    'Set-Cookie': createSecureCookie('session', sessionId, {
      maxAge: 7 * 24 * 60 * 60, // 7 days
    }),
  },
});

// Logout - delete session cookie
return new Response(null, {
  status: 303,
  headers: {
    Location: '/',
    'Set-Cookie': deleteCookie('session'),
  },
});
```

**Security flag reference:**

| Flag              | Purpose                                                | Why It Matters                                                                         |
| ----------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `HttpOnly`        | Prevents JavaScript access via `document.cookie`       | Blocks XSS attacks from stealing session tokens                                        |
| `Secure`          | Only transmit over HTTPS                               | Prevents session hijacking on insecure networks                                        |
| `SameSite=Strict` | Cookie only sent on same-site requests                 | Prevents CSRF attacks by blocking cross-site cookie transmission                       |
| `Path=/`          | Limits cookie to specific path                         | Reduces exposure to other applications on same domain                                  |
| `Max-Age`         | Sets expiration in seconds                             | Limits window for session hijacking; prefer over `Expires` for consistency             |
| `Domain`          | (Optional) Limits cookie to specific domain/subdomains | Use sparingly; omitting means cookie only applies to current domain (most restrictive) |

**Important notes:**

- **Always use all three security flags** (`HttpOnly`, `Secure`, `SameSite=Strict`) together
- **Never use `SameSite=None`** unless you have a specific cross-site use case (e.g., OAuth redirects)
- **Prefer `Max-Age` over `Expires`** for consistent behavior across timezones
- **Omit `Domain` flag** unless you need subdomain sharing; omitting is more restrictive and secure
- **Development exception**: `Secure` flag requires HTTPS, which may not work in local development. Consider environment-based configuration:

```typescript
const isProduction = env.ENVIRONMENT === 'production';
const secureCookie = isProduction
  ? createSecureCookie('session', sessionId)
  : createSecureCookie('session', sessionId).replace('Secure; ', ''); // Remove Secure for local dev
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

## Security Headers

### Nonce-Based CSP for Dynamic Responses

For dynamic Worker responses (HTMX partials, API responses), use **nonce-based Content Security Policy** to prevent XSS while allowing inline scripts.

**When to use nonce-based CSP:**

- Dynamic HTML fragments rendered per request
- HTMX partials with Alpine.js state
- Per-user content that varies by request

**When NOT to use nonce-based CSP:**

- Static Hugo pages (use hash-based CSP in `_headers` file instead)
- Responses without inline scripts (simpler CSP without nonces)

```typescript
// src/presentation/middleware/securityHeaders.ts

/**
 * Security headers middleware with nonce-based CSP
 */
export function withSecurityHeaders(
  handler: (request: Request, nonce: string) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    // Generate unique nonce for this request
    const nonce = crypto.randomUUID();

    // Execute handler with nonce
    const response = await handler(request, nonce);

    // Add security headers to response
    const headers = new Headers(response.headers);

    // CSP with nonce for inline scripts
    headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net`, // Alpine.js from CDN
        "style-src 'self' 'unsafe-inline'", // Tailwind utility classes
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        'upgrade-insecure-requests',
      ].join('; ')
    );

    // HSTS: Force HTTPS for 2 years
    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // Frame protection
    headers.set('X-Frame-Options', 'DENY');

    // MIME type sniffing protection
    headers.set('X-Content-Type-Options', 'nosniff');

    // Referrer policy
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy
    headers.set(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

/**
 * Build CSP string with nonce
 */
export function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
```

### Usage in Handlers

**HTMX partial with inline Alpine.js:**

```typescript
// src/presentation/handlers/TaskHandlers.ts
export class TaskHandlers {
  // Wrap handler with security headers middleware
  listTasks = withSecurityHeaders(async (request: Request, nonce: string): Promise<Response> => {
    const session = await this.auth.requireAuth(request);
    const tasks = await this.taskRepository.findByUserId(session.userId);

    // Use nonce in template for inline scripts
    const html = taskListPartial(tasks, nonce);

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  });
}
```

**Template with nonce:**

```typescript
// src/presentation/templates/taskListPartial.ts
export function taskListPartial(tasks: Task[], nonce: string): string {
  return html`
    <div class="task-list" x-data="{ expanded: false }">
      ${tasks.map((task) => taskItem(task, nonce)).join('')}

      <!-- Inline script MUST include nonce attribute -->
      <script nonce="${nonce}">
        // Alpine.js component initialization
        document.addEventListener('alpine:init', () => {
          Alpine.data('taskManager', () => ({
            deleteTask(id) {
              // HTMX will handle the actual deletion
              htmx.trigger(this.$el, 'taskDeleted', { id });
            },
          }));
        });
      </script>
    </div>
  `;
}
```

**IMPORTANT**: Every `<script>` tag with inline code MUST include the `nonce="${nonce}"` attribute. Scripts without the nonce will be blocked by CSP.

### CSP Without Nonces (Simpler)

For responses without inline scripts (JSON API, simple HTML), use a simpler CSP without nonces:

```typescript
/**
 * Security headers for API responses (no inline scripts)
 */
export function withApiSecurityHeaders(
  handler: (request: Request) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const response = await handler(request);
    const headers = new Headers(response.headers);

    // Simpler CSP without nonces
    headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'", // No inline scripts allowed
        "style-src 'self'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        'upgrade-insecure-requests',
      ].join('; ')
    );

    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  };
}
```

### Rate Limit Headers

For endpoints with rate limiting, include rate limit information in headers:

```typescript
/**
 * Add rate limit headers to response
 */
export function withRateLimitHeaders(
  response: Response,
  config: RateLimitConfig,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers);

  headers.set('X-RateLimit-Limit', String(config.maxAttempts));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(Math.floor(result.resetAt / 1000)));

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
```

### Testing Security Headers

```typescript
describe('withSecurityHeaders', () => {
  it('adds CSP header with nonce', async () => {
    const handler = withSecurityHeaders(async (request, nonce) => {
      return new Response(`<script nonce="${nonce}">console.log('test')</script>`, {
        headers: { 'Content-Type': 'text/html' },
      });
    });

    const response = await handler(new Request('http://localhost'));

    expect(response.headers.get('Content-Security-Policy')).toContain("script-src 'self' 'nonce-");
  });

  it('adds HSTS header', async () => {
    const handler = withSecurityHeaders(async () => {
      return new Response('test');
    });

    const response = await handler(new Request('http://localhost'));

    expect(response.headers.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload'
    );
  });

  it('includes nonce in response body', async () => {
    const handler = withSecurityHeaders(async (request, nonce) => {
      return new Response(`<script nonce="${nonce}">test</script>`);
    });

    const response = await handler(new Request('http://localhost'));
    const body = await response.text();
    const csp = response.headers.get('Content-Security-Policy');

    // Extract nonce from CSP header
    const nonceMatch = csp?.match(/nonce-([a-f0-9-]+)/);
    expect(nonceMatch).toBeTruthy();

    // Verify nonce in body matches nonce in CSP
    expect(body).toContain(`nonce="${nonceMatch?.[1]}"`);
  });
});
```

## Integration in Entry Point

```typescript
// src/index.ts
import { Router } from './router';
import { errorHandler } from './presentation/middleware/errorHandler';
import { logRequest, logError } from './presentation/middleware/logging';
import { withSecurityHeaders } from './presentation/middleware/securityHeaders';
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

### Router with Static-First Routing

The Worker handles only `/app/*`, `/auth/*`, and `/webhooks/*` routes. Static pages are served by Cloudflare Pages.

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
    // Auth routes (public)
    this.get('/auth/login', (req) => this.authHandlers.loginPage(req));
    this.post('/auth/login', (req) => this.authHandlers.login(req));
    this.post('/auth/logout', (req) => this.authHandlers.logout(req));

    // Application pages (authenticated) - all under /app
    this.get('/app', (req) => this.taskHandlers.dashboardPage(req));
    this.get('/app/tasks', (req) => this.taskHandlers.tasksPage(req));

    // HTMX partials (authenticated) - all under /app/_
    this.get('/app/_/tasks', (req) => this.taskHandlers.listTasks(req));
    this.post('/app/_/tasks', (req) => this.taskHandlers.createTask(req));
    this.patch('/app/_/tasks/:id', (req, p) => this.taskHandlers.updateTask(req, p.id));
    this.delete('/app/_/tasks/:id', (req, p) => this.taskHandlers.deleteTask(req, p.id));

    // Note: Static pages (/, /about, /pricing) are served by Cloudflare Pages, NOT by Worker
  }

  // ... route registration methods
}
```
