# D1 Database & KV Store

## D1 (SQLite)

Remember: D1 is SQLite — no PostgreSQL/MySQL syntax.

### Basic Queries

```typescript
app.get('/app/users', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, name, email FROM users ORDER BY name'
  ).all();
  return c.json({ users: results });
});

app.get('/app/users/:id', async (c) => {
  const id = c.req.param('id');
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();

  if (!user) throw new HTTPException(404, { message: 'User not found' });
  return c.json(user);
});
```

### Inserts and Updates

```typescript
app.post('/app/users', zValidator('json', CreateUserSchema), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();

  await c.env.DB.prepare('INSERT INTO users (id, name, email) VALUES (?, ?, ?)')
    .bind(id, data.name, data.email)
    .run();

  return c.json({ id, ...data }, 201);
});
```

### Batch Operations

```typescript
const statements = users.map((u) =>
  c.env.DB.prepare('INSERT INTO users (id, name) VALUES (?, ?)').bind(u.id, u.name)
);
await c.env.DB.batch(statements);
```

---

## KV Store

### Session Management Middleware

```typescript
app.use('/app/*', async (c, next) => {
  const sessionId = c.req.header('X-Session-Id');
  if (sessionId) {
    const session = await c.env.SESSIONS.get(sessionId, 'json');
    if (session) c.set('user', session as UserSession);
  }
  await next();
});
```

### KV Operations

```typescript
// Write with TTL (seconds)
await c.env.SESSIONS.put(sessionId, JSON.stringify(session), {
  expirationTtl: 86400, // 24 hours
});

// Read
const value = await c.env.SESSIONS.get('key');
const typed = await c.env.SESSIONS.get<MyType>('key', 'json');

// Delete
await c.env.SESSIONS.delete(sessionId);

// List keys
const list = await c.env.SESSIONS.list({ prefix: 'session:' });
```

---

## wrangler.toml Bindings

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"
minify = true

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "your-database-id"

[[kv_namespaces]]
binding = "SESSIONS"
id = "your-kv-id"
```

Local env variables go in `.dev.vars` (dotenv format), accessed via `c.env.SECRET_KEY`.
