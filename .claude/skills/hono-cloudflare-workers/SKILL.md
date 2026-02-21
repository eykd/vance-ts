---
name: hono-cloudflare-workers
description: Build Cloudflare Workers APIs using the Hono framework with TypeScript. Use when creating, editing, or debugging Hono routes, middleware, validation, D1/KV integrations, or Workers deployment. Triggers on mentions of Hono, Cloudflare Workers with Hono, or Workers API routes using Hono patterns like `new Hono()`, `c.env`, `c.req`, `zValidator`.
---

# Hono on Cloudflare Workers

## Setup

```bash
npm install hono
npm install --save-dev @cloudflare/workers-types
# Validation (optional)
npm install zod @hono/zod-validator
```

Greenfield: `npm create hono@latest my-app` → select `cloudflare-workers`.

## Core App Pattern

```typescript
// src/types.ts
type Env = {
  DB: D1Database;
  SESSIONS: KVNamespace;
  ENVIRONMENT: string;
  SESSION_SECRET: string;
};

type Variables = {
  user: { id: string; email: string; role: string };
  requestId: string;
};

// src/index.ts
import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.get('/', (c) => c.text('Hello!'));

export default app;
```

Access bindings via `c.env.DB`, `c.env.SESSIONS`, etc. — **never** `process.env`.

## Key Gotchas

1. **Always `await next()` in middleware** — forgetting breaks the chain silently.
2. **Content-Type required for body validation** — `json` validators return `{}` without it. Critical in tests: must include `headers: new Headers({ 'Content-Type': 'application/json' })`.
3. **Header validation uses lowercase keys** — `'content-type'`, not `'Content-Type'`.
4. **`c.env` is per-request** — don't access bindings at module level.
5. **`process.env` doesn't exist** in Workers — use `c.env`.
6. **RPC needs chained routes** — `const route = app.get(...)` not `app.get(...); export type AppType = typeof app`.
7. **Throw `HTTPException`, not `Error`** — plain errors bypass Hono's HTTP semantics.
8. **Variables are request-scoped** — `c.set`/`c.get` don't persist across requests.
9. **Middleware env access** — wrap middleware that reads `c.env` in an async handler (e.g., `basicAuth` with env credentials).
10. **D1 is SQLite** — no PostgreSQL/MySQL syntax.

## Inline Handlers for Type Inference

Hono's type inference works best with inline handlers:

```typescript
// ✅ param('id') is typed
app.get('/books/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ id })
})

// ❌ Loses type inference
const getBook = (c: Context) => { ... }
app.get('/books/:id', getBook)
```

For separate handler files, use `createFactory()` from `hono/factory`.

## Quick Reference

| Task                | Code                                               |
| ------------------- | -------------------------------------------------- |
| Create app          | `new Hono<{ Bindings: B }>()`                      |
| JSON response       | `c.json({ data }, 200)`                            |
| Path param          | `c.req.param('id')`                                |
| Query param         | `c.req.query('q')`                                 |
| Request body        | `await c.req.json()`                               |
| Set header          | `c.header('X-Custom', 'value')`                    |
| Env variable        | `c.env.MY_VAR`                                     |
| Context var set/get | `c.set('key', val)` / `c.get('key')`               |
| Validated data      | `c.req.valid('json')`                              |
| HTTP error          | `throw new HTTPException(404, { message: '...' })` |
| Mount sub-app       | `app.route('/prefix', subApp)`                     |
| Test request        | `await app.request(url, init, env)`                |
| Export for RPC      | `export type AppType = typeof routes`              |

## References (load on demand)

| Topic                                                        | File                                                                       |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Routing, params, context, sub-apps                           | [references/routing.md](references/routing.md)                             |
| Built-in & custom middleware, Zod validation, error handling | [references/middleware-validation.md](references/middleware-validation.md) |
| D1 database & KV store operations                            | [references/storage.md](references/storage.md)                             |
| Testing patterns & Vitest config                             | [references/testing.md](references/testing.md)                             |
| RPC, deployment, project structure, WebSockets               | [references/rpc-deployment.md](references/rpc-deployment.md)               |

## Related Skills

- `worker-request-handler` — Clean Architecture handler patterns
- `typescript-html-templates` — HTML output with XSS prevention (`escapeHtml`)
- `d1-repository-implementation` — Repository pattern for D1
- `kv-session-management` — Session management patterns
- `static-first-routing` — URL path conventions
- `cloudflare-use-case-creator` — Application layer use cases
