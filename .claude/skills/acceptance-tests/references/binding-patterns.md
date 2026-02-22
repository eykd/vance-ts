# Binding Patterns

## Architecture

The acceptance pipeline generates test stubs in `generated-acceptance-tests/`.
Edit generated files directly. The pipeline preserves `it()` blocks that don't
contain the unbound sentinel (`throw new Error("acceptance test not yet bound")`).

### Stub → Bound Test Workflow

1. Run `just acceptance-generate` to create stubs from specs (or let the pipeline run)
2. Read the generated stub to see scenario structure and step comments
3. Edit the generated file directly: replace the sentinel with real test code
4. The pipeline preserves your bound implementations on subsequent runs
5. Use `just acceptance-regen` to force-regenerate all stubs if needed (destroys bound code)

## SELF.fetch Pattern

All acceptance tests exercise the Worker as a black box via `SELF.fetch()`.
Import `SELF` and `env` from `"cloudflare:test"` at the top of each test file.

```typescript
import { env, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';

it('User views their profile.', async () => {
  // GIVEN the user is registered.
  await env.DB.exec(`INSERT INTO users (id, email) VALUES (1, 'alice@example.com')`);

  // WHEN the user views their profile.
  const res = await SELF.fetch(new Request('https://example.com/api/profile/1'));

  // THEN the profile shows the email address.
  expect(res.status).toBe(200);
  const body = (await res.json()) as { email: string };
  expect(body.email).toBe('alice@example.com');
});
```

Key points:

- `SELF.fetch()` — routes through the actual Worker (black box)
- `env.DB.exec(...)` — sets up D1 state for GIVEN preconditions
- Assert on HTTP status, response body, and headers — user-observable behavior only
- Never import internal packages or call handler functions directly in acceptance tests

## Database Setup Patterns

### Single row

```typescript
await env.DB.exec(`INSERT INTO items (id, title) VALUES (1, 'My Item')`);
```

### Multiple rows

```typescript
await env.DB.exec(`
  INSERT INTO items (id, title) VALUES
    (1, 'First Item'),
    (2, 'Second Item'),
    (3, 'Third Item')
`);
```

### Chained setup (multiple tables)

```typescript
await env.DB.exec(`INSERT INTO users (id, email) VALUES (1, 'alice@example.com')`);
await env.DB.exec(`INSERT INTO projects (id, owner_id, name) VALUES (1, 1, 'My Project')`);
```

## HTTP Assertion Patterns

### Status code

```typescript
expect(res.status).toBe(200);
```

### JSON body

```typescript
const body = (await res.json()) as { items: Array<{ title: string }> };
expect(body.items).toHaveLength(2);
expect(body.items[0]?.title).toBe('First Item');
```

### Response headers

```typescript
expect(res.headers.get('Content-Type')).toContain('application/json');
```

### Error response

```typescript
const res = await SELF.fetch(new Request('https://example.com/api/items/999'));
expect(res.status).toBe(404);
const body = (await res.json()) as { error: string };
expect(body.error).toContain('not found');
```

### Redirect

```typescript
expect(res.status).toBe(302);
expect(res.headers.get('Location')).toBe('/login');
```

## Multi-Step Scenario Pattern

When a scenario requires setup via a previous action (not just DB state):

```typescript
it('User updates their display name after logging in.', async () => {
  // GIVEN the user is registered.
  await env.DB.exec(
    `INSERT INTO users (id, email, password_hash) VALUES (1, 'alice@example.com', 'hash')`
  );

  // GIVEN the user is logged in.
  const loginRes = await SELF.fetch(
    new Request('https://example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'alice@example.com', password: 'secret' }),
      headers: { 'Content-Type': 'application/json' },
    })
  );
  const cookies = loginRes.headers.get('Set-Cookie') ?? '';

  // WHEN the user updates their display name.
  const updateRes = await SELF.fetch(
    new Request('https://example.com/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ displayName: 'Alice' }),
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
    })
  );

  // THEN the profile shows the new display name.
  expect(updateRes.status).toBe(200);
  const body = (await updateRes.json()) as { displayName: string };
  expect(body.displayName).toBe('Alice');
});
```

## Using helpers.ts

The hand-maintained `generated-acceptance-tests/helpers.ts` provides convenience wrappers.
Import them in bound test implementations:

```typescript
import { get, post } from './helpers';

it('User sees the list of items.', async () => {
  // GIVEN two items exist.
  await env.DB.exec(`INSERT INTO items (title) VALUES ('Item A'), ('Item B')`);

  // WHEN the user views the items list.
  const res = await get('/api/items');

  // THEN both items are shown.
  expect(res.status).toBe(200);
});
```
