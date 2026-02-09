# better-auth Setup for Cloudflare Workers

**Purpose**: Core better-auth + Hono + D1 wiring for Cloudflare Workers

**When to read**: During planning phase or initial auth setup

---

## Dependencies

```bash
npm install better-auth better-auth-cloudflare hono kysely kysely-d1
```

---

## Wrangler Configuration

**File**: `wrangler.jsonc`

```jsonc
{
  "name": "my-app",
  "compatibility_date": "2024-12-01",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-app-db",
      "database_id": "<your-database-id>",
    },
  ],
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "<your-kv-namespace-id>",
    },
  ],
}
```

**Secrets** (set via `wrangler secret put`):

- `BETTER_AUTH_SECRET` — 32+ character random string for signing sessions
- `BETTER_AUTH_URL` — Your app's base URL (e.g., `https://myapp.com`)

---

## Environment Type

**File**: `src/env.ts`

```typescript
export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}
```

---

## Auth Instance Factory

**File**: `src/lib/auth.ts`

D1 bindings are only available at request time in Workers, so the auth instance must be created per-request.

```typescript
import { betterAuth } from 'better-auth';
import type { Env } from '../env';

/**
 * Create a better-auth instance bound to the current request's environment.
 * Must be called per-request because D1/KV bindings are runtime-only.
 */
export function createAuth(env: Env): ReturnType<typeof betterAuth> {
  return betterAuth({
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,

    database: {
      type: 'sqlite',
      url: '', // Not used — D1 binding overrides
    },

    // KV as secondary storage for session cache + rate limits
    secondaryStorage: {
      get: async (key: string): Promise<string | null> => {
        return await env.KV.get(key);
      },
      set: async (key: string, value: string, ttl?: number): Promise<void> => {
        await env.KV.put(key, value, {
          expirationTtl: Math.max(ttl ?? 60, 60), // KV minimum TTL is 60s
        });
      },
      delete: async (key: string): Promise<void> => {
        await env.KV.delete(key);
      },
    },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },

    session: {
      expiresIn: 60 * 60 * 24, // 24 hours
      updateAge: 60 * 5, // Refresh session after 5 minutes of activity
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5-minute cookie cache reduces D1 reads
      },
    },

    rateLimit: {
      enabled: true,
      window: 60, // 60s minimum for KV TTL
      max: 100,
      storage: 'secondary-storage',
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
        '/sign-up/email': { window: 60, max: 3 },
      },
    },

    advanced: {
      ipAddress: {
        ipAddressHeaders: ['cf-connecting-ip'],
      },
      database: {
        generateId: (): string => crypto.randomUUID(),
      },
    },
  });
}
```

### Using better-auth-cloudflare (alternative)

If you prefer the `withCloudflare` helper for automatic D1/KV wiring:

```typescript
import { betterAuth } from 'better-auth';
import { withCloudflare } from 'better-auth-cloudflare';
import { drizzle } from 'drizzle-orm/d1';

export function createAuth(env: Env): ReturnType<typeof betterAuth> {
  const db = drizzle(env.DB);

  return betterAuth({
    ...withCloudflare(
      {
        d1: { db },
        kv: env.KV,
        autoDetectIpAddress: true,
      },
      {
        basePath: '/api/auth',
        secret: env.BETTER_AUTH_SECRET,
        baseURL: env.BETTER_AUTH_URL,
        emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
        session: { expiresIn: 86400, updateAge: 300 },
        rateLimit: { enabled: true, window: 60, max: 100 },
      }
    ),
  });
}
```

---

## Hono App with Auth Routes

**File**: `src/index.ts`

```typescript
import { Hono } from 'hono';
import type { Env } from './env';
import { createAuth } from './lib/auth';

const app = new Hono<{ Bindings: Env }>();

// Mount better-auth API routes
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// App routes (authenticated) — see hono-auth-middleware.md
// Auth page routes (login, register forms) — see auth-templates.md

export default app;
```

---

## Database Schema Generation

Generate the schema from your auth configuration:

```bash
npx @better-auth/cli generate --config src/lib/auth.ts --output src/db/auth-schema.sql -y
```

This creates SQL migrations for the 4 core tables: `user`, `session`, `account`, `verification`.

### Running Migrations on D1

```bash
# Local development
npx wrangler d1 execute my-app-db --local --file=src/db/auth-schema.sql

# Production
npx wrangler d1 execute my-app-db --file=src/db/auth-schema.sql
```

### Programmatic Migrations (for CI/CD)

```typescript
import { getMigrations } from 'better-auth/db';

app.get('/api/migrate', async (c) => {
  const auth = createAuth(c.env);
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  return c.json({ success: true });
});
```

**Warning**: Protect or remove this endpoint in production.

---

## Local Development

**File**: `.dev.vars`

```
BETTER_AUTH_SECRET=development-secret-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:8787
```

Start the dev server:

```bash
npx wrangler dev
```

---

## Custom Password Hasher (Optional)

better-auth defaults to scrypt, which works on Cloudflare Workers paid plan with `nodejs_compat`. For the free tier or if you prefer PBKDF2 via Web Crypto:

```typescript
emailAndPassword: {
  enabled: true,
  minPasswordLength: 12,
  maxPasswordLength: 128,
  password: {
    hash: async (password: string): Promise<string> => {
      const encoder = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'],
      );
      const hash = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 600_000, hash: 'SHA-256' },
        keyMaterial, 256,
      );
      const combined = new Uint8Array(salt.length + new Uint8Array(hash).length);
      combined.set(salt);
      combined.set(new Uint8Array(hash), salt.length);
      return `pbkdf2:${btoa(String.fromCharCode(...combined))}`;
    },
    verify: async ({ password, hash }: { password: string; hash: string }): Promise<boolean> => {
      if (!hash.startsWith('pbkdf2:')) return false;
      const encoder = new TextEncoder();
      const combined = Uint8Array.from(atob(hash.slice(7)), (c) => c.charCodeAt(0));
      const salt = combined.slice(0, 16);
      const storedHash = combined.slice(16);
      const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'],
      );
      const derivedHash = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 600_000, hash: 'SHA-256' },
        keyMaterial, 256,
      );
      // Constant-time comparison
      const a = new Uint8Array(derivedHash);
      if (a.length !== storedHash.length) return false;
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        result |= (a[i] ?? 0) ^ (storedHash[i] ?? 0);
      }
      return result === 0;
    },
  },
},
```

---

## Email Verification (Future Extension)

Add to auth config when ready:

```typescript
emailAndPassword: {
  requireEmailVerification: true,
  sendResetPassword: async ({ user, url }) => {
    await sendTransactionalEmail(user.email, 'Reset Password', url);
  },
},
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    await sendTransactionalEmail(user.email, 'Verify Email', url);
  },
  sendOnSignUp: true,
  autoSignInAfterVerification: true,
},
```

---

## Two-Factor Authentication (Future Extension)

Add the `twoFactor` plugin when ready:

```typescript
import { twoFactor } from 'better-auth/plugins';

plugins: [
  twoFactor({
    issuer: 'My App',
    otpOptions: {
      async sendOTP({ user, otp }) {
        await sendTransactionalEmail(user.email, 'Your login code', otp);
      },
    },
  }),
],
```

Run migrations after adding: `npx @better-auth/cli migrate`

---

## Audit Logging via Hooks

Use better-auth hooks to log security events:

```typescript
databaseHooks: {
  session: {
    create: {
      after: async (session) => {
        console.log(`Session created: user=${session.userId} ip=${session.ipAddress}`);
      },
    },
  },
  user: {
    create: {
      after: async (user) => {
        console.log(`User registered: ${user.email}`);
      },
    },
  },
},
```

---

## Testing Strategy

### Unit Tests

Mock the auth instance to test handlers in isolation:

```typescript
const mockAuth = {
  api: {
    getSession: jest.fn().mockResolvedValue({
      user: { id: 'user-1', name: 'Test', email: 'test@example.com' },
      session: { id: 'session-1', token: 'token-1', expiresAt: new Date() },
    }),
    signOut: jest.fn().mockResolvedValue({ success: true }),
  },
  handler: jest.fn().mockResolvedValue(new Response('ok')),
};
```

### Integration Tests

Use Miniflare with real D1 for end-to-end auth flows:

```typescript
import { unstable_dev } from 'wrangler';

const worker = await unstable_dev('src/index.ts', {
  experimental: { disableExperimentalWarning: true },
});

// Test sign-up flow
const signUp = await worker.fetch('/api/auth/sign-up/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test',
    email: 'test@example.com',
    password: 'secure-password-123',
  }),
});
expect(signUp.status).toBe(200);

await worker.stop();
```

---

## Next Steps

- For route protection → Read `hono-auth-middleware.md`
- For CSRF protection → Read `csrf-protection.md`
- For auth page templates → Read `auth-templates.md`
