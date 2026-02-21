# RPC, Deployment & Architecture

## RPC (End-to-End Type Safety)

Share API types between server and client — no codegen.

### Server: Export Route Types

Chain routes and export the type:

```typescript
// src/routes/users.ts
const app = new Hono()
  .get('/', (c) => c.json({ users: [] }))
  .post('/', zValidator('json', z.object({ name: z.string(), email: z.string().email() })), (c) => {
    const data = c.req.valid('json');
    return c.json({ success: true, user: data }, 201);
  })
  .get('/:id', (c) => c.json({ id: c.req.param('id'), name: 'Alice' }));

export default app;
export type UsersApp = typeof app;
```

```typescript
// src/index.ts
const app = new Hono();
const routes = app.route('/app/users', users);
export default app;
export type AppType = typeof routes;
```

**Key:** Export `typeof routes` (the chained result), not `typeof app`.

### Client: Type-Safe Requests

```typescript
import { hc } from 'hono/client';
import type { AppType } from '../server';

const client = hc<AppType>('https://example.com');

const res = await client.app.users.$post({
  json: { name: 'Alice', email: 'alice@example.com' },
});

if (res.ok) {
  const data = await res.json(); // Fully typed
}
```

### Performance: Large Apps

RPC type inference can slow IDEs with many routes. Export sub-app types separately:

```typescript
const usersClient = hc<UsersApp>('https://example.com/app/users');
const authClient = hc<AuthApp>('https://example.com/auth');
```

---

## Other Event Handlers

Workers support more than HTTP. Export `app.fetch` alongside others:

```typescript
export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledTask(env));
  },

  async queue(batch: MessageBatch, env: Bindings, ctx: ExecutionContext) {
    for (const message of batch.messages) {
      await processMessage(message, env);
    }
  },
};
```

---

## WebSockets

```typescript
import { upgradeWebSocket } from 'hono/cloudflare-workers';

app.get(
  '/app/ws',
  upgradeWebSocket((c) => ({
    onOpen(evt, ws) {
      console.log('Connected');
    },
    onMessage(evt, ws) {
      ws.send(`Echo: ${evt.data}`);
    },
    onClose() {
      console.log('Disconnected');
    },
  }))
);
```

---

## HTMX Fragment Responses

```typescript
app.get('/app/_/user-card/:id', async (c) => {
  const user = await getUser(c.env.DB, c.req.param('id'));
  return c.html(`
    <div class="card" id="user-${user.id}">
      <h2>${user.name}</h2>
      <p>${user.email}</p>
    </div>
  `);
});
```

Requested via `hx-get="/app/_/user-card/123"` and swapped into DOM.

---

## Deployment

```bash
npx wrangler deploy
```

### GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## Recommended Project Structure

```
src/
├── index.ts                   # Entry, middleware stack, route mounting
├── routes/
│   ├── users.ts               # /app/users routes
│   ├── auth.ts                # /auth routes
│   └── webhooks.ts            # /webhooks routes
├── middleware/
│   ├── auth.ts                # Authentication
│   ├── tenant.ts              # Multi-tenant isolation
│   └── logging.ts             # Structured logging
├── domain/
│   ├── user/
│   │   ├── user.ts            # Entity
│   │   ├── user.spec.ts       # Unit tests
│   │   └── user-repository.ts # Repository interface
│   └── org/
├── application/
│   ├── create-user.ts         # Use case
│   └── create-user.spec.ts
├── infrastructure/
│   ├── d1-user-repository.ts  # D1 implementation
│   └── kv-session-store.ts    # KV implementation
├── lib/
│   ├── validator.ts           # Reusable zValidator wrapper
│   └── errors.ts              # Error types
└── types.ts                   # Bindings, Variables, shared types
```

### Static-First Routing Strategy

```
CDN (static)          Worker (Hono)
├── /            ──→  Hugo     ├── /app/*       ──→ Dynamic routes
├── /blog/*      ──→  Hugo     ├── /app/_/*     ──→ HTMX fragments
├── /docs/*      ──→  Hugo     ├── /auth/*      ──→ Authentication
└── /assets/*    ──→  Hugo     └── /webhooks/*  ──→ External integrations
```
