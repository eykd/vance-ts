# Testing

## `app.request()` (Lightweight, No Server)

```typescript
import app from './index';

describe('GET /', () => {
  it('should return 200', async () => {
    const res = await app.request('http://localhost/');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hello Cloudflare Workers!');
  });
});
```

## Testing with Bindings

Mock Cloudflare bindings by passing an env object as the third argument:

```typescript
describe('GET /app/users/:id', () => {
  it('should return user from D1', async () => {
    const mockEnv = {
      DB: {
        prepare: vi.fn().mockReturnValue({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' }),
          }),
        }),
      },
    };

    const res = await app.request('http://localhost/app/users/1', {}, mockEnv);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: '1', name: 'Alice' });
  });
});
```

## Testing with JSON Bodies

**Critical:** Include `Content-Type` header — without it, `zValidator('json', ...)` receives `{}`.

```typescript
it('should create a user', async () => {
  const res = await app.request(
    'http://localhost/app/users',
    {
      method: 'POST',
      body: JSON.stringify({ name: 'Bob', email: 'bob@test.com', age: 30 }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    },
    mockEnv
  );

  expect(res.status).toBe(201);
});
```

## `testClient` (RPC-Style, Type-Safe)

Requires routes to be chained for RPC type export.

```typescript
import { testClient } from 'hono/testing';

it('should return user by ID', async () => {
  const client = testClient(app);
  const res = await client.app.users[':id'].$get({
    param: { id: '123' },
  });
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ id: '123', name: 'Alice' });
});
```

## `@cloudflare/vitest-pool-workers` (Full Fidelity)

For integration tests with real D1/KV behavior:

```typescript
// vitest.config.ts
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.toml' },
    }),
  ],
  test: {},
});
```

Runs tests inside the Workers runtime with real bindings, matching production behavior.
