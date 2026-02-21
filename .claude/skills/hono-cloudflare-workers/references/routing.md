# Routing & Context

## HTTP Methods

```typescript
app.get('/users', (c) => c.json({ users: [] }));
app.post('/users', (c) => c.json({ created: true }, 201));
app.put('/users/:id', (c) => c.json({ updated: true }));
app.delete('/users/:id', (c) => c.text('Deleted', 204));
app.all('/health', (c) => c.text('OK'));
```

## Path Parameters

```typescript
app.get('/users/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ id });
});

// Multiple params
app.get('/orgs/:orgId/members/:memberId', (c) => {
  const { orgId, memberId } = c.req.param();
  return c.json({ orgId, memberId });
});
```

## Wildcards

```typescript
app.get('/files/*', (c) => {
  const path = c.req.param('*'); // Everything after /files/
  return c.text(`File path: ${path}`);
});
```

## Query Parameters

```typescript
app.get('/search', (c) => {
  const q = c.req.query('q'); // Single
  const tags = c.req.queries('tag'); // Multiple (?tag=a&tag=b)
  return c.json({ q, tags });
});
```

## Route Grouping with `app.route()`

```typescript
// src/presentation/handlers/users.ts
const users = new Hono<{ Bindings: Env }>();
users.get('/', (c) => c.json({ users: [] }));
users.get('/:id', (c) => c.json({ id: c.req.param('id') }));
users.post('/', (c) => c.json({ created: true }, 201));
export default users;

// src/index.ts
import users from './presentation/handlers/users';
import auth from './presentation/handlers/auth';

const app = new Hono<{ Bindings: Env }>();
app.route('/app/users', users);
app.route('/auth', auth);
export default app;
```

## Context Object

### Request Access

```typescript
app.post('/upload', async (c) => {
  const body = await c.req.json();
  const formData = await c.req.formData();
  const raw = await c.req.text();
  const arrayBuf = await c.req.arrayBuffer();
  const userAgent = c.req.header('User-Agent');
  const method = c.req.method;
  const url = c.req.url;
  const path = c.req.path;
  return c.json({ received: true });
});
```

### Response Methods

```typescript
c.text('Hello'); // text/plain
c.json({ ok: true }); // application/json
c.json({ created: true }, 201); // with status
c.html('<h1>Hello</h1>'); // text/html
c.redirect('/new-location'); // 302
c.redirect('/new-location', 301); // 301
c.notFound(); // 404
c.body(arrayBuffer); // raw body
```

### Headers and Status

```typescript
app.get('/download', (c) => {
  c.status(200);
  c.header('Content-Type', 'application/pdf');
  c.header('Cache-Control', 'max-age=3600');
  return c.body(pdfBuffer);
});
```

### Context Variables

```typescript
// Middleware sets
app.use('*', async (c, next) => {
  c.set('requestId', crypto.randomUUID());
  await next();
});

// Handler reads
app.get('/me', (c) => {
  const requestId = c.get('requestId');
  return c.json({ requestId });
});
```

Variables are scoped to a single request.

## `createFactory()` for Separate Handler Files

```typescript
import { createFactory } from 'hono/factory';

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers((c) => {
  return c.json({ message: 'typed!' });
});

app.get('/api', ...handlers);
```
