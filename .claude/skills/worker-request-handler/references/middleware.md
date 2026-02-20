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
import type { Context } from 'hono';

export function errorHandler(error: unknown, c: Context): Response {
  console.error('Unhandled error:', error);

  if (error instanceof ValidationError) {
    return c.html(`<div class="alert alert-error">${escapeHtml(error.message)}</div>`, 400);
  }

  if (error instanceof NotFoundError) {
    return c.html(`<div class="alert alert-warning">${escapeHtml(error.message)}</div>`, 404);
  }

  if (error instanceof UnauthorizedError) {
    return c.redirect('/auth/login', 302);
  }

  // Generic server error
  return c.html(
    `<div class="alert alert-error">Something went wrong. Please try again.</div>`,
    500
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
export function errorHandler(error: unknown, c: Context): Response {
  const requestId = crypto.randomUUID();
  const url = new URL(c.req.url);

  // Log error with context
  console.error(
    JSON.stringify({
      requestId,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      path: url.pathname,
      method: c.req.method,
    })
  );

  // Include requestId in response for debugging
  if (error instanceof Error && !(error instanceof DomainError)) {
    return c.html(
      `<div class="alert alert-error">
        <p>Something went wrong. Please try again.</p>
        <p class="text-xs opacity-60">Reference: ${requestId}</p>
      </div>`,
      500
    );
  }

  // Handle domain errors...
}
```

## Authentication

### Session-Based Auth

```typescript
// src/presentation/middleware/auth.ts
import type { Context, Next } from 'hono';
import type { KVSessionStore, Session } from '@infrastructure/cache/KVSessionStore';

export class AuthMiddleware {
  constructor(private sessionStore: KVSessionStore) {}

  async getSession(c: Context): Promise<Session | null> {
    const cookie = c.req.header('Cookie');
    if (!cookie) return null;

    const sessionId = this.extractSessionId(cookie);
    if (!sessionId) return null;

    return await this.sessionStore.get(sessionId);
  }

  async requireAuth(c: Context): Promise<Session> {
    const session = await this.getSession(c);
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
// src/presentation/handlers/taskHandlers.ts
import type { Context } from 'hono';
import type { Env } from '../../types/env';

type AppContext = Context<{ Bindings: Env }>;

export function createTaskHandlers(
  createTaskUseCase: CreateTask,
  taskRepository: TaskRepository,
  auth: AuthMiddleware
) {
  return {
    // Public endpoint
    async tasksPage(c: AppContext): Promise<Response> {
      const session = await auth.getSession(c);
      const tasks = session ? await taskRepository.findByUserId(session.userId) : [];
      return c.html(tasksPageTemplate(tasks, session));
    },

    // Protected endpoint
    async createTask(c: AppContext): Promise<Response> {
      const session = await auth.requireAuth(c);
      // ... create task with session.userId
    },
  };
}
```

### Login/Logout Handlers

```typescript
export function createAuthHandlers(sessionStore: KVSessionStore, userRepository: UserRepository) {
  return {
    async login(c: AppContext): Promise<Response> {
      const formData = await c.req.formData();
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      const user = await userRepository.findByEmail(email);
      if (!user || !(await user.verifyPassword(password))) {
        return c.html(loginForm({ email }, { form: 'Invalid email or password' }), 401);
      }

      const sessionId = await sessionStore.create(user.id, user.email);

      return c.redirect('/app/tasks', 303, {
        'Set-Cookie': `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
      });
    },

    async logout(c: AppContext): Promise<Response> {
      const cookie = c.req.header('Cookie');
      const sessionId = cookie?.match(/session=([^;]+)/)?.[1];

      if (sessionId) {
        await sessionStore.delete(sessionId);
      }

      return c.redirect('/', 303, {
        'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
      });
    },
  };
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
const sessionId = await sessionStore.create(user.id, user.email);

c.header(
  'Set-Cookie',
  createSecureCookie('session', sessionId, {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
);
return c.redirect('/app/tasks', 303);

// Logout - delete session cookie
c.header('Set-Cookie', deleteCookie('session'));
return c.redirect('/', 303);
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
const isProduction = c.env.ENVIRONMENT === 'production';
const secureCookie = isProduction
  ? createSecureCookie('session', sessionId)
  : createSecureCookie('session', sessionId).replace('Secure; ', ''); // Remove Secure for local dev
```

## Logging

### Request Logging via Hono Middleware

```typescript
// src/presentation/middleware/logging.ts
import type { Context, Next } from 'hono';

export async function requestLogger(c: Context, next: Next): Promise<void> {
  const start = performance.now();
  const url = new URL(c.req.url);

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      method: c.req.method,
      path: url.pathname,
      query: url.search,
      userAgent: c.req.header('user-agent'),
      cfRay: c.req.header('cf-ray'),
    })
  );

  await next();

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      method: c.req.method,
      path: url.pathname,
      status: c.res.status,
      durationMs: Math.round(performance.now() - start),
    })
  );
}

export function logError(error: Error, c: Context): void {
  const url = new URL(c.req.url);
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      method: c.req.method,
      path: url.pathname,
    })
  );
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
import type { Context, Next } from 'hono';

/**
 * Hono middleware that adds security headers with nonce-based CSP.
 */
export async function securityHeaders(c: Context, next: Next): Promise<void> {
  // Generate unique nonce for this request
  const nonce = crypto.randomUUID();
  c.set('nonce', nonce);

  await next();

  // Add security headers to response
  applySecurityHeaders(c.res.headers, nonce);
}

function applySecurityHeaders(headers: Headers, nonce?: string): void {
  // CSP with nonce for inline scripts
  const scriptSrc = nonce
    ? `script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net`
    : "script-src 'self'";

  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      scriptSrc,
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
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');
}
```

### Usage in Hono App

```typescript
// src/worker.ts
import { Hono } from 'hono';
import { securityHeaders } from './presentation/middleware/securityHeaders';
import { requestLogger } from './presentation/middleware/logging';

const app = new Hono<{ Bindings: Env }>();

// Apply middleware to all dynamic routes
app.use('/app/*', requestLogger);
app.use('/app/*', securityHeaders);
app.use('/api/*', requestLogger);
app.use('/api/*', securityHeaders);
```

**HTMX partial with inline Alpine.js:**

```typescript
// src/presentation/handlers/taskHandlers.ts
async function listTasks(c: AppContext): Promise<Response> {
  const session = await auth.requireAuth(c);
  const tasks = await taskRepository.findByUserId(session.userId);

  // Retrieve nonce set by middleware
  const nonce = c.get('nonce');

  // Use nonce in template for inline scripts
  const html = taskListPartial(tasks, nonce);

  return c.html(html);
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

For responses without inline scripts (JSON API, simple HTML), use the middleware without setting a nonce:

```typescript
// API routes get simpler CSP automatically (no nonce set)
app.use('/api/*', async (c, next) => {
  await next();
  applySecurityHeaders(c.res.headers); // No nonce passed
});
```

### Rate Limit Headers

For endpoints with rate limiting, include rate limit information in headers:

```typescript
/**
 * Add rate limit headers to Hono response
 */
export function setRateLimitHeaders(
  c: Context,
  config: RateLimitConfig,
  result: RateLimitResult
): void {
  c.header('X-RateLimit-Limit', String(config.maxAttempts));
  c.header('X-RateLimit-Remaining', String(result.remaining));
  c.header('X-RateLimit-Reset', String(Math.floor(result.resetAt / 1000)));
}
```

### Testing Security Headers

```typescript
describe('securityHeaders middleware', () => {
  it('adds CSP header with nonce', async () => {
    const app = new Hono();
    app.use('*', securityHeaders);
    app.get('/', (c) => {
      const nonce = c.get('nonce');
      return c.html(`<script nonce="${nonce}">console.log('test')</script>`);
    });

    const response = await app.request('/');

    expect(response.headers.get('Content-Security-Policy')).toContain("script-src 'self' 'nonce-");
  });

  it('adds HSTS header', async () => {
    const app = new Hono();
    app.use('*', securityHeaders);
    app.get('/', (c) => c.text('test'));

    const response = await app.request('/');

    expect(response.headers.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload'
    );
  });

  it('includes nonce in response body matching CSP', async () => {
    const app = new Hono();
    app.use('*', securityHeaders);
    app.get('/', (c) => {
      const nonce = c.get('nonce');
      return c.html(`<script nonce="${nonce}">test</script>`);
    });

    const response = await app.request('/');
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
// src/worker.ts
import { Hono } from 'hono';
import { requestLogger } from './presentation/middleware/logging';
import { securityHeaders } from './presentation/middleware/securityHeaders';
import { createTaskHandlers } from './presentation/handlers/taskHandlers';
import { createAuthHandlers } from './presentation/handlers/authHandlers';
import { D1TaskRepository } from './infrastructure/repositories/D1TaskRepository';
import { KVSessionStore } from './infrastructure/cache/KVSessionStore';
import { AuthMiddleware } from './presentation/middleware/auth';
import { CreateTask } from './application/use-cases/CreateTask';

export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  ASSETS: Fetcher;
}

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', requestLogger);

// Security headers for dynamic routes
app.use('/app/*', securityHeaders);
app.use('/api/*', securityHeaders);

// Error handling
app.onError((error, c) => {
  logError(error as Error, c);
  return errorHandler(error, c);
});

// Auth routes (public)
app.get('/auth/login', async (c) => {
  const handlers = createAuthHandlers(new KVSessionStore(c.env.SESSIONS), userRepository);
  return handlers.loginPage(c);
});
app.post('/auth/login', async (c) => {
  const handlers = createAuthHandlers(new KVSessionStore(c.env.SESSIONS), userRepository);
  return handlers.login(c);
});
app.post('/auth/logout', async (c) => {
  const handlers = createAuthHandlers(new KVSessionStore(c.env.SESSIONS), userRepository);
  return handlers.logout(c);
});

// HTMX partials (authenticated) - all under /app/_
app.get('/app/_/tasks', async (c) => {
  const taskRepository = new D1TaskRepository(c.env.DB);
  const sessionStore = new KVSessionStore(c.env.SESSIONS);
  const auth = new AuthMiddleware(sessionStore);
  const createTask = new CreateTask(taskRepository);
  const handlers = createTaskHandlers(createTask, taskRepository, auth);
  return handlers.listTasks(c);
});

app.post('/app/_/tasks', async (c) => {
  const taskRepository = new D1TaskRepository(c.env.DB);
  const sessionStore = new KVSessionStore(c.env.SESSIONS);
  const auth = new AuthMiddleware(sessionStore);
  const createTask = new CreateTask(taskRepository);
  const handlers = createTaskHandlers(createTask, taskRepository, auth);
  return handlers.createTask(c);
});

// Note: Static pages (/, /about, /pricing) are served by Workers Static Assets, NOT by the Worker
// Workers Static Assets checks for static files FIRST, then falls through to Hono routes

export default app;
```
