# Middleware & Validation

## Middleware Execution (Onion Model)

Each middleware runs code before `next()`, inner layers execute, post-processing runs in reverse.

```typescript
app.use(async (_, next) => {
  console.log('1 start');
  await next();
  console.log('1 end');
});
app.use(async (_, next) => {
  console.log('2 start');
  await next();
  console.log('2 end');
});
app.get('/', (c) => {
  console.log('handler');
  return c.text('OK');
});
// Output: 1 start → 2 start → handler → 2 end → 1 end
```

**Critical:** Always `await next()`. Forgetting breaks the chain silently.

## Path-Scoped Middleware

```typescript
app.use('*', logger()); // All routes
app.use('/app/*', cors()); // Only /app/*
app.post('/app/*', rateLimiter()); // Only POST to /app/*
```

## Built-in Middleware

| Middleware      | Import                | Purpose                          |
| --------------- | --------------------- | -------------------------------- |
| `logger`        | `hono/logger`         | Request/response logging         |
| `cors`          | `hono/cors`           | CORS headers                     |
| `basicAuth`     | `hono/basic-auth`     | Basic HTTP authentication        |
| `bearerAuth`    | `hono/bearer-auth`    | Bearer token auth                |
| `jwt`           | `hono/jwt`            | JWT verification                 |
| `secureHeaders` | `hono/secure-headers` | Security headers (CSP, HSTS)     |
| `cache`         | `hono/cache`          | Response caching                 |
| `compress`      | `hono/compress`       | Gzip/Brotli compression          |
| `etag`          | `hono/etag`           | ETag-based caching               |
| `prettyJSON`    | `hono/pretty-json`    | Pretty-print JSON with `?pretty` |
| `requestId`     | `hono/request-id`     | Unique request IDs               |
| `timeout`       | `hono/timeout`        | Request timeouts                 |
| `bodyLimit`     | `hono/body-limit`     | Body size limits                 |
| `csrf`          | `hono/csrf`           | CSRF protection                  |
| `ipRestriction` | `hono/ip-restriction` | IP allowlist/blocklist           |
| `timing`        | `hono/timing`         | Server-Timing headers            |

### Composing Built-in Middleware

```typescript
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { requestId } from 'hono/request-id';
import { timeout } from 'hono/timeout';

app.use('*', logger());
app.use('*', requestId());
app.use('*', secureHeaders());
app.use('*', timeout(30_000));
app.use('/app/*', cors({ origin: ['https://example.com'], credentials: true }));
```

## Custom Middleware

```typescript
import { createMiddleware } from 'hono/factory';

const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const user = await verifyToken(token, c.env.SESSION_SECRET);
  c.set('user', user);
  await next();
});

app.use('/app/*', authMiddleware);
```

## Using Env Variables in Middleware

Middleware is registered at startup but env is per-request. Wrap env-dependent middleware:

```typescript
app.use('/admin/*', async (c, next) => {
  const auth = basicAuth({
    username: c.env.ADMIN_USERNAME,
    password: c.env.ADMIN_PASSWORD,
  });
  return auth(c, next);
});
```

Applies to Bearer auth, JWT, CORS origin from env, and any runtime-config middleware.

---

## Zod Validation

Install: `npm install zod @hono/zod-validator`

### Basic Usage

```typescript
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive(),
});

app.post('/app/users', zValidator('json', CreateUserSchema), (c) => {
  const data = c.req.valid('json'); // Fully typed
  return c.json({ success: true, data }, 201);
});
```

### Validation Targets

Available: `json`, `form`, `query`, `param`, `header`, `cookie`.

```typescript
app.get(
  '/app/users/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  zValidator('query', z.object({ include: z.enum(['profile', 'posts']).optional() })),
  (c) => {
    const { id } = c.req.valid('param');
    const { include } = c.req.valid('query');
    return c.json({ id, include });
  }
);
```

### Custom Error Hook

```typescript
app.post(
  '/app/users',
  zValidator('json', CreateUserSchema, (result, c) => {
    if (!result.success) {
      return c.json({ error: 'Validation failed', issues: result.error.issues }, 400);
    }
  }),
  (c) => {
    const data = c.req.valid('json');
    return c.json({ success: true, data }, 201);
  }
);
```

### Reusable Validator Wrapper

```typescript
// src/lib/validator.ts
import type { ZodSchema } from 'zod';
import type { ValidationTargets } from 'hono';
import { zValidator as zv } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';

export function zValidator<T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) {
  return zv(target, schema, (result, c) => {
    if (!result.success) throw new HTTPException(400, { cause: result.error });
  });
}
```

### Gotcha: Header Keys Must Be Lowercase

```typescript
// ❌ Won't work
zValidator('header', z.object({ 'Idempotency-Key': z.string() }));
// ✅ Works
zValidator('header', z.object({ 'idempotency-key': z.string() }));
```

---

## Error Handling

### HTTPException

```typescript
import { HTTPException } from 'hono/http-exception';

throw new HTTPException(404, { message: 'User not found' });
throw new HTTPException(400, { message: 'Invalid', cause: { field: 'email', reason: 'taken' } });
```

### Global Error Handler

```typescript
app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  if (err instanceof ZodError) {
    return c.json({ error: 'Validation failed', issues: err.issues }, 400);
  }
  console.error('Unexpected error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});
```

### Not Found Handler

```typescript
app.notFound((c) => c.json({ error: 'Not Found', path: c.req.path }, 404));
```

### Rules

- Throw `HTTPException` for client errors (400, 401, 403, 404).
- Don't throw plain `Error` for HTTP errors.
- Use `app.onError` as centralized safety net.
- Don't try/catch around `next()` — Hono routes errors to `onError` internally.

### Layered Error Handling (Clean Architecture)

In a layered architecture, errors propagate outward:

1. **Domain layer** — Domain-specific errors or Result types (never HTTP concepts)
2. **Application layer** — Catches domain errors, returns Result objects
3. **Presentation layer** — Maps Results/domain errors to `HTTPException`

Only the presentation layer (Hono handlers/middleware) should throw `HTTPException`. See `cloudflare-use-case-creator` for the Result/error pattern.
