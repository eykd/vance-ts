# Advanced KV Patterns

## Table of Contents

1. [Type-Safe Serialization](#type-safe-serialization)
2. [Cache Stampede Prevention](#cache-stampede-prevention)
3. [Namespace Organization](#namespace-organization)
4. [Integration Testing](#integration-testing)
5. [Generic Cache Wrapper](#generic-cache-wrapper)

---

## Type-Safe Serialization

Validate data on deserialization to catch corruption or schema changes:

```typescript
// Type guard approach
function isSession(data: unknown): data is Session {
  return (
    typeof data === "object" &&
    data !== null &&
    "userId" in data &&
    "email" in data &&
    "expiresAt" in data &&
    typeof (data as Session).userId === "string" &&
    typeof (data as Session).expiresAt === "number"
  );
}

async get(id: string): Promise<Session | null> {
  const raw = await this.kv.get(`${this.PREFIX}${id}`);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (!isSession(data)) {
      console.error("Invalid session data", { id });
      await this.delete(id);
      return null;
    }
    return data;
  } catch {
    await this.delete(id);
    return null;
  }
}
```

For complex types, use Zod:

```typescript
import { z } from 'zod';

const SessionSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  createdAt: z.number(),
  expiresAt: z.number(),
  roles: z.array(z.string()).optional(),
});

type Session = z.infer<typeof SessionSchema>;

function parseSession(raw: string): Session | null {
  const result = SessionSchema.safeParse(JSON.parse(raw));
  return result.success ? result.data : null;
}
```

---

## Cache Stampede Prevention

When cache expires, multiple requests can hit the database simultaneously. Use probabilistic early expiration:

```typescript
interface CachedValue<T> {
  data: T;
  expiresAt: number;
  computedAt: number;
}

async function getWithStampedeProtection<T>(
  kv: KVNamespace,
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>
): Promise<T> {
  const raw = await kv.get(key);

  if (raw) {
    const cached = JSON.parse(raw) as CachedValue<T>;
    const age = Date.now() - cached.computedAt;
    const ttlMs = ttlSeconds * 1000;

    // Probabilistic early recompute: as cache ages, probability increases
    // At 80% of TTL, ~20% chance to recompute; at 95%, ~50% chance
    const expiryRatio = age / ttlMs;
    if (expiryRatio < 0.8 || Math.random() > expiryRatio) {
      return cached.data;
    }
  }

  // Recompute
  const data = await compute();
  const value: CachedValue<T> = {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
    computedAt: Date.now(),
  };
  await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
  return data;
}
```

---

## Namespace Organization

Use prefixes to organize keys and enable logical grouping:

```typescript
const PREFIXES = {
  SESSION: 'session:',
  CACHE: 'cache:',
  USER_PREFS: 'prefs:',
  FEATURE_FLAG: 'flag:',
  RATE_LIMIT: 'rate:',
} as const;

// Consistent key generation
function sessionKey(id: string): string {
  return `${PREFIXES.SESSION}${id}`;
}

function cacheKey(entity: string, id: string): string {
  return `${PREFIXES.CACHE}${entity}:${id}`;
}

function userPrefsKey(userId: string): string {
  return `${PREFIXES.USER_PREFS}${userId}`;
}
```

For multi-tenant apps, include tenant in prefix:

```typescript
function tenantSessionKey(tenantId: string, sessionId: string): string {
  return `tenant:${tenantId}:session:${sessionId}`;
}
```

---

## Integration Testing

Test KV operations with Vitest and Miniflare:

```typescript
// vitest.config.ts (partial)
poolOptions: {
  workers: {
    miniflare: {
      kvNamespaces: ["SESSIONS"]
    },
    isolatedStorage: true // Each test gets clean KV
  }
}
```

```typescript
// src/infrastructure/cache/KVSessionStore.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { KVSessionStore } from './KVSessionStore';

describe('KVSessionStore', () => {
  let store: KVSessionStore;

  beforeEach(() => {
    store = new KVSessionStore(env.SESSIONS);
  });

  it('creates and retrieves a session', async () => {
    const sessionId = await store.create('user-123', 'test@example.com');

    const session = await store.get(sessionId);

    expect(session).not.toBeNull();
    expect(session!.userId).toBe('user-123');
    expect(session!.email).toBe('test@example.com');
  });

  it('returns null for non-existent session', async () => {
    const session = await store.get('non-existent');
    expect(session).toBeNull();
  });

  it('deletes a session', async () => {
    const sessionId = await store.create('user-123', 'test@example.com');
    await store.delete(sessionId);

    const session = await store.get(sessionId);
    expect(session).toBeNull();
  });

  it('refreshes session TTL', async () => {
    const sessionId = await store.create('user-123', 'test@example.com');
    const original = await store.get(sessionId);

    // Wait a bit
    await new Promise((r) => setTimeout(r, 10));

    await store.refresh(sessionId);
    const refreshed = await store.get(sessionId);

    expect(refreshed!.expiresAt).toBeGreaterThan(original!.expiresAt);
  });
});
```

---

## Generic Cache Wrapper

Reusable cache wrapper for any data type:

```typescript
export class KVCache<T> {
  constructor(
    private kv: KVNamespace,
    private prefix: string,
    private defaultTtl: number
  ) {}

  async get(key: string): Promise<T | null> {
    const data = await this.kv.get(`${this.prefix}${key}`);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    await this.kv.put(`${this.prefix}${key}`, JSON.stringify(value), {
      expirationTtl: ttl ?? this.defaultTtl,
    });
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(`${this.prefix}${key}`);
  }

  async getOrSet(key: string, compute: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get(key);
    if (cached !== null) return cached;

    const value = await compute();
    await this.set(key, value, ttl);
    return value;
  }
}

// Usage
const taskCache = new KVCache<Task[]>(env.SESSIONS, 'cache:tasks:', 300);
const tasks = await taskCache.getOrSet('popular', () => repo.findPopular());
```
