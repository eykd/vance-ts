# Hono Auth Middleware

**Purpose**: Session extraction, route protection, and auth-aware request handling with Hono

**When to read**: During implementation of authenticated routes and middleware stack

---

## Session Extraction Middleware

Extract the better-auth session into Hono's type-safe context so route handlers can access user/session data without calling better-auth directly.

**File**: `src/middleware/auth.ts`

```typescript
import type { Context, MiddlewareHandler } from 'hono';
import type { Env } from '../env';
import { createAuth } from '../lib/auth';

/** Type for the auth session returned by better-auth */
interface AuthSession {
  user: { id: string; name: string; email: string; emailVerified: boolean; image: string | null };
  session: { id: string; token: string; userId: string; expiresAt: Date };
}

/** Hono app type with auth context variables */
export type AppType = {
  Bindings: Env;
  Variables: {
    user: AuthSession['user'] | null;
    session: AuthSession['session'] | null;
  };
};

/**
 * Middleware that extracts the session from better-auth cookies
 * and sets user/session on the Hono context.
 * Apply to all routes that might need session info.
 */
export function sessionMiddleware(): MiddlewareHandler<AppType> {
  return async (c, next) => {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    c.set('user', session?.user ?? null);
    c.set('session', session?.session ?? null);

    await next();
  };
}
```

---

## Route Protection Middleware

Require a valid session before allowing access. Redirect unauthenticated users to login (for HTML pages) or return 401 (for API/HTMX requests).

```typescript
/**
 * Require authentication. Returns 401 or redirects to login.
 * HTMX requests get HX-Redirect header instead of 302.
 */
export function requireAuth(): MiddlewareHandler<AppType> {
  return async (c, next) => {
    const user = c.get('user');

    if (user === null) {
      const isHtmx = c.req.header('HX-Request') === 'true';
      const returnUrl = encodeURIComponent(new URL(c.req.url).pathname);

      if (isHtmx) {
        // HTMX requests: use HX-Redirect header for client-side redirect
        return c.newResponse(null, 200, {
          'HX-Redirect': `/auth/login?returnUrl=${returnUrl}`,
        });
      }

      // Browser navigation: standard redirect
      return c.redirect(`/auth/login?returnUrl=${returnUrl}`);
    }

    await next();
  };
}
```

---

## Wiring It Together

**File**: `src/index.ts`

```typescript
import { Hono } from 'hono';
import type { AppType } from './middleware/auth';
import { sessionMiddleware, requireAuth } from './middleware/auth';
import { createAuth } from './lib/auth';

const app = new Hono<AppType>();

// ── better-auth API routes (no session middleware needed) ──
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// ── Public routes (optional session for conditional UI) ──
app.use('/auth/*', sessionMiddleware());

app.get('/auth/login', (c) => {
  const user = c.get('user');
  if (user !== null) return c.redirect('/app');
  return c.html(renderLoginPage(c.req.query('returnUrl') ?? '/app'));
});

app.get('/auth/register', (c) => {
  const user = c.get('user');
  if (user !== null) return c.redirect('/app');
  return c.html(renderRegisterPage());
});

// ── Authenticated routes ──
app.use('/app/*', sessionMiddleware());
app.use('/app/*', requireAuth());

app.get('/app', (c) => {
  const user = c.get('user');
  return c.html(renderDashboard(user!));
});

app.get('/app/_/profile', (c) => {
  const user = c.get('user');
  return c.html(renderProfilePartial(user!));
});

export default app;
```

---

## Logout Handler

```typescript
app.post('/auth/logout', sessionMiddleware(), async (c) => {
  const session = c.get('session');
  if (session === null) return c.redirect('/auth/login');

  const auth = createAuth(c.env);
  await auth.api.signOut({ headers: c.req.raw.headers });

  const isHtmx = c.req.header('HX-Request') === 'true';
  if (isHtmx) {
    return c.newResponse(null, 200, { 'HX-Redirect': '/auth/login' });
  }
  return c.redirect('/auth/login');
});
```

---

## Open Redirect Prevention

Validate redirect URLs to prevent open redirect attacks after login/register:

```typescript
/**
 * Validate that a redirect URL is safe (same-origin, path-only).
 * Returns the validated path or a default fallback.
 */
function safeRedirectUrl(url: string | undefined, fallback: string): string {
  if (url === undefined || url.length === 0) return fallback;

  // Only allow relative paths starting with /
  if (!url.startsWith('/')) return fallback;

  // Reject protocol-relative URLs (//evil.com)
  if (url.startsWith('//')) return fallback;

  // Reject URLs with backslash (some browsers interpret \\ as //)
  if (url.includes('\\')) return fallback;

  return url;
}

// Usage in login handler:
app.get('/auth/login', (c) => {
  const returnUrl = safeRedirectUrl(c.req.query('returnUrl'), '/app');
  return c.html(renderLoginPage(returnUrl));
});
```

---

## Testing

### Unit Tests for Middleware

```typescript
import { Hono } from 'hono';
import { sessionMiddleware, requireAuth } from './middleware/auth';

describe('requireAuth middleware', () => {
  it('should redirect unauthenticated browser requests to login', async () => {
    const app = new Hono();
    // Mock: session middleware sets null user
    app.use('*', async (c, next) => {
      c.set('user', null);
      c.set('session', null);
      await next();
    });
    app.use('*', requireAuth());
    app.get('/app', (c) => c.text('ok'));

    const res = await app.request('/app');

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('/auth/login');
  });

  it('should send HX-Redirect for unauthenticated HTMX requests', async () => {
    const app = new Hono();
    app.use('*', async (c, next) => {
      c.set('user', null);
      c.set('session', null);
      await next();
    });
    app.use('*', requireAuth());
    app.get('/app', (c) => c.text('ok'));

    const res = await app.request('/app', {
      headers: { 'HX-Request': 'true' },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('HX-Redirect')).toContain('/auth/login');
  });

  it('should allow authenticated requests through', async () => {
    const app = new Hono();
    app.use('*', async (c, next) => {
      c.set('user', { id: '1', name: 'Test', email: 'test@example.com' });
      c.set('session', { id: 's1', token: 't1', userId: '1', expiresAt: new Date() });
      await next();
    });
    app.use('*', requireAuth());
    app.get('/app', (c) => c.text('ok'));

    const res = await app.request('/app');

    expect(res.status).toBe(200);
  });
});
```

### Testing Open Redirect Prevention

```typescript
describe('safeRedirectUrl', () => {
  it('should allow relative paths', () => {
    expect(safeRedirectUrl('/app/dashboard', '/app')).toBe('/app/dashboard');
  });

  it('should reject absolute URLs', () => {
    expect(safeRedirectUrl('https://evil.com', '/app')).toBe('/app');
  });

  it('should reject protocol-relative URLs', () => {
    expect(safeRedirectUrl('//evil.com', '/app')).toBe('/app');
  });

  it('should reject backslash URLs', () => {
    expect(safeRedirectUrl('/\\evil.com', '/app')).toBe('/app');
  });

  it('should return fallback for empty input', () => {
    expect(safeRedirectUrl('', '/app')).toBe('/app');
    expect(safeRedirectUrl(undefined, '/app')).toBe('/app');
  });
});
```

---

## Next Steps

- For CSRF protection on forms → Read `csrf-protection.md`
- For auth page templates → Read `auth-templates.md`
- For XSS prevention in templates → Read `xss-prevention.md`
