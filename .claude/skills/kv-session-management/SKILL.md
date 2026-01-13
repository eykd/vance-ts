---
name: kv-session-management
description: Implement session storage and caching on Cloudflare Workers using KV. Use when (1) implementing user sessions with KV, (2) creating cache layers for expensive queries, (3) setting up TTL/expiration strategies, (4) handling JSON serialization for KV storage, (5) building session middleware, or (6) questions about KV vs D1 for sessions/caching. Applies to TypeScript Workers with @cloudflare/workers-types.
---

# KV Session Management

Implement session storage and caching layers on Cloudflare KV.

## Quick Reference

```typescript
// wrangler.jsonc binding
"kv_namespaces": [{ "binding": "SESSIONS", "id": "your-id" }]

// Env type
interface Env { SESSIONS: KVNamespace; }

// Basic operations
await kv.put(key, JSON.stringify(data), { expirationTtl: 3600 });
const data = JSON.parse(await kv.get(key) ?? "null");
await kv.delete(key);
```

## Session Store Pattern

```typescript
// src/infrastructure/cache/KVSessionStore.ts
export interface Session {
  userId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

export class KVSessionStore {
  private readonly PREFIX = 'session:';
  private readonly TTL = 60 * 60 * 24 * 7; // 7 days (seconds)

  constructor(private kv: KVNamespace) {}

  async create(userId: string, email: string): Promise<string> {
    const id = crypto.randomUUID();
    const now = Date.now();
    const session: Session = {
      userId,
      email,
      createdAt: now,
      expiresAt: now + this.TTL * 1000,
    };
    await this.kv.put(`${this.PREFIX}${id}`, JSON.stringify(session), { expirationTtl: this.TTL });
    return id;
  }

  async get(id: string): Promise<Session | null> {
    const data = await this.kv.get(`${this.PREFIX}${id}`);
    if (!data) return null;
    const session = JSON.parse(data) as Session;
    // Double-check expiry (belt + suspenders with KV TTL)
    if (Date.now() > session.expiresAt) {
      await this.delete(id);
      return null;
    }
    return session;
  }

  async delete(id: string): Promise<void> {
    await this.kv.delete(`${this.PREFIX}${id}`);
  }

  async refresh(id: string): Promise<boolean> {
    const session = await this.get(id);
    if (!session) return false;
    session.expiresAt = Date.now() + this.TTL * 1000;
    await this.kv.put(`${this.PREFIX}${id}`, JSON.stringify(session), { expirationTtl: this.TTL });
    return true;
  }
}
```

## Caching Pattern

```typescript
// Cache-aside pattern for expensive queries
async function getPopularTasks(kv: KVNamespace, repo: TaskRepository): Promise<Task[]> {
  const CACHE_KEY = 'cache:popular-tasks';
  const TTL = 300; // 5 minutes

  const cached = await kv.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const tasks = await repo.findPopular(); // expensive query
  await kv.put(CACHE_KEY, JSON.stringify(tasks), { expirationTtl: TTL });
  return tasks;
}

// Invalidate on write
async function invalidateCache(kv: KVNamespace, pattern: string): Promise<void> {
  await kv.delete(`cache:${pattern}`);
}
```

## TTL Strategies

| Use Case      | TTL      | Rationale           |
| ------------- | -------- | ------------------- |
| User sessions | 7 days   | Balance security/UX |
| Auth tokens   | 1 hour   | Security-sensitive  |
| Query cache   | 5 min    | Freshness matters   |
| Feature flags | 1 hour   | Infrequent changes  |
| Static config | 24 hours | Rarely changes      |

**Key patterns:**

- Store `expiresAt` timestamp in data for application-level checks
- Use KV's `expirationTtl` for automatic cleanup
- Refresh session TTL on activity to implement sliding expiration

## Session Middleware

```typescript
// src/presentation/middleware/auth.ts
export async function withSession(
  request: Request,
  env: Env,
  handler: (session: Session) => Promise<Response>
): Promise<Response> {
  const sessionId = getSessionCookie(request);
  if (!sessionId) return redirectToLogin();

  const store = new KVSessionStore(env.SESSIONS);
  const session = await store.get(sessionId);
  if (!session) return redirectToLogin();

  // Sliding expiration: refresh on each request
  await store.refresh(sessionId);
  return handler(session);
}

function getSessionCookie(request: Request): string | null {
  const cookies = request.headers.get('Cookie') ?? '';
  const match = cookies.match(/session=([^;]+)/);
  return match?.[1] ?? null;
}

function redirectToLogin(): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: '/login' },
  });
}
```

## When to Use KV vs D1

| Scenario        | Use |
| --------------- | --- |
| Session tokens  | KV  |
| Query cache     | KV  |
| Feature flags   | KV  |
| Relational data | D1  |
| Complex queries | D1  |
| Transactions    | D1  |

**KV is optimized for high-read, low-write patterns.**

## Advanced Topics

For detailed patterns on these topics, see [references/advanced-patterns.md](references/advanced-patterns.md):

- Type-safe serialization with validation
- Cache stampede prevention
- Namespace organization strategies
- Integration testing patterns
