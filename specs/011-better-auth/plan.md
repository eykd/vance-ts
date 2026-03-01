# Implementation Plan: User Authentication

**Branch**: `011-better-auth` | **Date**: 2026-02-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/011-better-auth/spec.md`

---

## Summary

Implement email/password user authentication using **better-auth** and **Hono** for the Cloudflare Workers runtime. Users can register, sign in, sign out, and be authenticated to access protected routes. The system is architected to support future OAuth providers (e.g., Google) via configuration only.

Better-auth is used for core auth logic (password hashing, session management, rate limiting, OAuth extensibility). Custom Hono handlers serve server-rendered HTML login/register pages that bridge HTML form submissions to better-auth's internal API. The session is stored in Cloudflare D1 via better-auth's Drizzle adapter.

---

## Technical Context

**Language/Version**: TypeScript 5.9, ES2022, Cloudflare Workers
**Primary Dependencies**: Hono 4.12+, better-auth 1.4+, drizzle-orm 0.44+
**Storage**: Cloudflare D1 (user, session, account, verification tables via better-auth)
**Testing**: Vitest with @cloudflare/vitest-pool-workers (Workers project)
**Target Platform**: Cloudflare Workers (V8 isolate, Web Standard APIs only)
**Project Type**: Web application (server-rendered HTML + HTMX + static site)
**Performance Goals**: Registration within 60s, login within 30s (SC-001, SC-002)
**Constraints**: Web Standard APIs only; no Node.js; strict TypeScript; 100% test coverage on acceptance pipeline
**Scale/Scope**: Single-tenant app; email/password auth + session management + protected routes

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked below after design._

| Principle                     | Gate                                             | Status  | Notes                                                                   |
| ----------------------------- | ------------------------------------------------ | ------- | ----------------------------------------------------------------------- |
| **I. Test-First Development** | All TypeScript code requires tests written first | ✅ PASS | TDD required; Workers runtime coverage exemption applies                |
| **II. Type Safety**           | No `any`, strict mode, explicit return types     | ✅ PASS | Must be enforced during implementation                                  |
| **III. Code Quality**         | JSDoc on public APIs, naming conventions         | ✅ PASS | Required on all new files                                               |
| **IV. Pre-commit Gates**      | All checks must pass                             | ✅ PASS | Existing hooks cover lint, type-check, tests                            |
| **V. Warning Policy**         | No deferred warnings                             | ✅ PASS | Address any new deprecations immediately                                |
| **VI. Cloudflare Workers**    | No Node.js APIs                                  | ✅ PASS | better-auth and drizzle-orm are Workers-compatible                      |
| **VII. Simplicity**           | YAGNI — no speculative features                  | ✅ PASS | No email verification, no admin roles, no password reset (out of scope) |

**Post-design re-check**:

| Complexity Item                                  | Justification                                                                                                                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Adding `drizzle-orm` runtime dependency          | Required by better-auth's officially documented D1 adapter; no simpler alternative                                                                                                                     |
| `di/serviceFactory.ts` (new top-level directory) | Composition root for wiring better-auth + auth handlers; follows vance-ts pattern; placed at `src/di/` (outside layer hierarchy) — infrastructure cannot import presentation per ESLint boundary rules |
| Double-submit CSRF for HTML form handlers        | better-auth's built-in CSRF covers `/api/auth/*` only; HTML form handlers need their own CSRF; defense-in-depth                                                                                        |

All complexity items are justified. No constitution violations.

---

## Project Structure

### Documentation (this feature)

```text
specs/011-better-auth/
├── plan.md              ← This file
├── research.md          ← Phase 0 decisions
├── data-model.md        ← Schema and entity lifecycle
├── quickstart.md        ← Dev setup guide
└── contracts/
    └── auth-endpoints.md  ← HTTP contract
```

### Source Code

```text
src/
├── infrastructure/
│   ├── env.ts               ← Add DB, BETTER_AUTH_URL, BETTER_AUTH_SECRET
│   ├── auth.ts              ← NEW: better-auth factory (getAuth, resetAuth for tests)
│   ├── BetterAuthService.ts ← NEW: AuthService port adapter (wraps better-auth instance)
│   └── KvRateLimiter.ts     ← NEW: RateLimiter port adapter (wraps KVNamespace)
│
├── application/
│   ├── ports/
│   │   ├── AuthService.ts    ← NEW: port interface (signIn, signUp, signOut, getSession)
│   │   └── RateLimiter.ts    ← NEW: port interface (check, increment)
│   └── use-cases/
│       ├── SignInUseCase.ts    ← NEW: Orchestrates sign-in (validate input → call authService.* → return result)
│       ├── SignUpUseCase.ts    ← NEW: Orchestrates registration (validate → call authService.* → return result)
│       └── SignOutUseCase.ts   ← NEW: Orchestrates sign-out (validate CSRF → call authService.* → return result)
│
├── presentation/
│   ├── types.ts              ← NEW: AppEnv type (Hono Bindings + Variables)
│   ├── handlers/
│   │   └── AuthPageHandlers.ts   ← NEW: GET/POST /auth/sign-in|sign-up|sign-out (calls use cases)
│   ├── middleware/
│   │   └── requireAuth.ts        ← NEW: Hono middleware for protected routes
│   ├── templates/
│   │   └── pages/
│   │       ├── login.ts          ← NEW: Sign-in form HTML template
│   │       └── register.ts       ← NEW: Registration form HTML template
│   └── utils/
│       ├── cookieBuilder.ts      ← NEW: Build/clear CSRF cookies
│       ├── extractClientIp.ts    ← NEW: Extract CF-Connecting-IP (sole source)
│       └── redirectValidator.ts  ← NEW: Validate and sanitize redirectTo parameter
│
├── domain/
│   ├── value-objects/
│   │   └── common-passwords.ts   ← PORTED from vance-ts (Set<string> of banned passwords)
│   ├── services/
│   │   └── passwordHasher.ts     ← NEW: PBKDF2 via Web Crypto (hashPassword, verifyPassword) — pure computation, no I/O; inner layers may import
│   └── entities/
│       └── auth.ts               ← NEW: AuthUser and AuthSession entity types
│
└── worker.ts                     ← MODIFIED: Add auth routes + requireAuth middleware

src/di/
└── serviceFactory.ts             ← NEW: Composition root (getServiceFactory, resetServiceFactory)

migrations/
└── 0001_better_auth_schema.sql   ← NEW: better-auth schema for D1
```

**Layer responsibilities**:

- **`infrastructure/`**: better-auth factory, port adapters (`BetterAuthService`, `KvRateLimiter`) — direct adapter code
- **`application/use-cases/`**: Orchestrates auth flows; calls `authService.*` via the port interface; returns typed results (success/failure). Handlers depend on use-case interfaces, not infrastructure directly.
- **`presentation/`**: HTTP handlers and middleware; parse requests, call use cases, render HTML responses
- **`di/serviceFactory.ts`**: Composition root; wires infrastructure → application → presentation

---

## Implementation Phases

### Phase 1: Infrastructure — Better-Auth Setup

**Goal**: Wire better-auth to D1 and expose `getAuth(env)` factory.

#### 1.1 Update `src/infrastructure/env.ts`

Add new bindings to the `Env` interface:

```typescript
export interface Env {
  readonly ASSETS: Fetcher;
  readonly DB: D1Database; // D1 database for user/session storage
  readonly BETTER_AUTH_URL: string; // Public base URL (e.g., https://app.turtlebased.io)
  readonly BETTER_AUTH_SECRET: string; // MUST be >= 32 bytes of cryptographically random entropy — generate with: openssl rand -hex 32
  readonly RATE_LIMIT: KVNamespace; // KV namespace for distributed rate limiting
}
```

#### 1.2 Port `src/domain/value-objects/common-passwords.ts`

Port the `COMMON_PASSWORDS: Set<string>` export from `~/vance-ts/src/domain/value-objects/common-passwords.ts`. This is the list of ~100 common passwords checked during registration.

Write `.spec.ts` test first (TDD).

#### 1.3 Create `src/domain/services/passwordHasher.ts`

PBKDF2 password hashing using the **Web Crypto API** (`crypto.subtle`). Native in the Workers runtime — no pure-JS overhead, no `limits.cpu_ms` required. Uses only `crypto.subtle` (pure computation, no I/O or infrastructure dependencies) — placing it in the domain layer is correct; inner layers may import from it without boundary violations. Although the functions are async, they perform pure computation with no I/O or side effects; a domain service is the correct location per DDD (not a value object, which represents immutable data).

**Format**: `pbkdf2$<iterations>$<salt-hex>$<derived-hex>` — self-describing so that the iteration count can be increased in future without breaking existing hashes.

```typescript
const ITERATIONS = 600_000; // OWASP 2023 minimum for PBKDF2-HMAC-SHA-256
const DERIVED_BITS = 256;

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) return new Uint8Array(0);
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    DERIVED_BITS
  );
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(bits)}`;
}

const MIN_ITERATIONS = 100_000; // Reject hashes with fewer iterations (tamper protection)

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1] ?? '0', 10);
  if (iterations < MIN_ITERATIONS) return false;
  const salt = fromHex(parts[2] ?? '');
  const expected = fromHex(parts[3] ?? '');
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    DERIVED_BITS
  );
  // Constant-time comparison — prevent timing oracle on hash comparison
  const computed = new Uint8Array(bits);
  if (computed.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= (computed[i] ?? 0) ^ (expected[i] ?? 0);
  }
  return diff === 0;
}
```

**Security requirement**: Each `hashPassword()` call MUST generate a fresh 16-byte (128-bit) cryptographically random salt via `crypto.getRandomValues(new Uint8Array(16))`. This is mandatory — without per-call salt generation, identical passwords produce identical hashes, enabling rainbow-table attacks against the entire account table.

**TDD requirement**: Write `passwordHasher.spec.ts` verifying:

- `hashPassword` returns a string matching `/^pbkdf2\$\d+\$[0-9a-f]+\$[0-9a-f]+$/`
- Two calls with the same password produce **different** hashes (proves per-call random salt)
- `verifyPassword` returns `true` for a matching password
- `verifyPassword` returns `false` for a wrong password
- `verifyPassword` returns `false` for a malformed hash string
- `verifyPassword` returns `false` for a hash with `iterations < MIN_ITERATIONS` (tamper protection)
- `verifyPassword` returns `false` for a hash whose hex segment has odd length (guards `fromHex` against malformed input)

#### 1.4 Create `src/infrastructure/auth.ts`

Better-auth factory with isolate-scoped caching. The `password` block now uses `hashPassword`/`verifyPassword` from `domain/services/passwordHasher.ts` (Web Crypto, Workers-native) and the `validate` hook for common-password rejection:

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import type { Env } from './env';
import { COMMON_PASSWORDS } from '../domain/value-objects/common-passwords';
import { hashPassword, verifyPassword } from '../domain/services/passwordHasher';

let _auth: ReturnType<typeof betterAuth> | null = null;

export function getAuth(env: Env): ReturnType<typeof betterAuth> {
  if (env.BETTER_AUTH_SECRET.length < 64) {
    // 32 bytes of entropy = 64 hex characters (from `openssl rand -hex 32`)
    throw new Error(
      'BETTER_AUTH_SECRET must be >= 32 bytes of cryptographically random entropy (64 hex chars). Generate with: openssl rand -hex 32'
    );
  }
  _auth ??= betterAuth({
    database: drizzleAdapter(drizzle(env.DB), { provider: 'sqlite' }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      password: {
        hash: hashPassword,
        verify: ({ password, hash }) => verifyPassword(password, hash),
        // Verified: password.validate returning false = reject (invalid password).
        // !COMMON_PASSWORDS.has(...) correctly returns false for common passwords.
        async validate(password: string): Promise<boolean> {
          return !COMMON_PASSWORDS.has(password.toLowerCase());
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days (spec clarification 2026-02-24)
      updateAge: 60 * 60 * 24, // 1 day (refresh when < 1 day remaining)
    },
    advanced: {
      useSecureCookies: !env.BETTER_AUTH_URL.startsWith('http://localhost'),
      cookiePrefix: '__Host-',
      ipAddress: { ipAddressHeaders: ['CF-Connecting-IP'] },
    },
    rateLimit: {
      enabled: false, // KV-backed rate limiter handles this; built-in is in-memory only
    },
  });
  return _auth;
}

export function resetAuth(): void {
  _auth = null; // For test isolation
}
```

**TDD requirement**: Write `auth.spec.ts` that mocks the D1 binding and verifies the factory creates and caches the auth instance. Also verify that `getAuth` throws when `BETTER_AUTH_SECRET` is shorter than 64 characters.

#### 1.5a Define Domain Auth Types

Create `src/domain/entities/auth.ts` — project-owned entity types for the authenticated user and session. These are NOT imported from `better-auth`; they represent the domain's view of auth state:

```typescript
/** The authenticated user as known to the domain layer. */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly emailVerified: boolean;
  readonly createdAt: string; // ISO 8601 UTC
}

/** An active user session as known to the domain layer. */
export interface AuthSession {
  readonly id: string;
  readonly token: string; // Session token stored in the cookie; used for CSRF derivation
  readonly userId: string;
  readonly expiresAt: string; // ISO 8601 UTC
  readonly createdAt: string; // ISO 8601 UTC
}
```

Write `.spec.ts` verifying the type shapes (structural compatibility test).

**Rationale**: The presentation and application layers must not import types directly from `better-auth`. Domain types are stable contracts; `better-auth` types may change across library versions.

#### 1.5 Define Port Interfaces

Create `src/application/ports/AuthService.ts`:

```typescript
import type { AuthUser, AuthSession } from '../../domain/entities/auth';

export interface AuthService {
  signIn(params: { email: string; password: string; ip: string }): Promise<
    | { ok: true; sessionCookie: string }
    | {
        ok: false;
        kind: 'invalid_credentials' | 'rate_limited' | 'service_error';
        retryAfter?: number;
      }
  >;
  signUp(params: {
    email: string;
    password: string;
    name: string;
    ip: string;
  }): Promise<
    | { ok: true }
    | { ok: false; kind: 'email_taken' | 'weak_password' | 'rate_limited' | 'service_error' }
  >;
  signOut(params: {
    sessionCookie: string;
  }): Promise<{ ok: true; clearCookieHeader: string } | { ok: false; kind: 'service_error' }>;
  /** `Headers` is acceptable here as it is a Web Standard API available at all layers. */
  getSession(params: {
    headers: Headers;
  }): Promise<{ user: AuthUser; session: AuthSession } | null>;
}
```

**Architecture note**: `AuthService` methods return domain result types, not `Response` objects. The `BetterAuthService` adapter translates better-auth `Response` objects into these domain results at the infrastructure boundary. `Headers` is acceptable in `getSession` as it is a Web Standard API available in all runtime layers. HTTP pass-through to better-auth (`/api/auth/*` delegation) is a presentation/infrastructure routing concern handled by `ServiceFactory.authHandler` — not an application-layer port method.

Create `src/application/ports/RateLimiter.ts`:

```typescript
export interface RateLimiter {
  check(key: string): Promise<{ allowed: boolean; retryAfter?: number }>;
  increment(key: string, ttlSeconds: number): Promise<void>;
}
```

Write `.spec.ts` for each (pure interface contract tests via test-doubles). The adapters — `BetterAuthService` (implements `AuthService`) and `KvRateLimiter` (implements `RateLimiter`) — live in `src/infrastructure/`.

#### 1.6 Create D1 Migration

Generate via CLI and store as `migrations/0001_better_auth_schema.sql`. Apply locally with `wrangler d1 migrations apply turtlebased-db --local`.

**Note on password hash column**: The `account.password` column stores hashes in the `pbkdf2$<iterations>$<salt-hex>$<derived-hex>` format. No schema change is needed — the column is `TEXT` in better-auth's default schema.

---

### Phase 2: Presentation — HTML Templates

**Goal**: Build server-rendered login and register pages.

#### 2.0 Create `src/presentation/types.ts`

Define the `AppEnv` type used by Hono middleware and handlers. Centralising this here breaks the circular dependency that would arise if `requireAuth.ts` imported `AppEnv` from `../../worker`:

```typescript
import type { AuthUser, AuthSession } from '../domain/entities/auth';

export interface AppEnv {
  Bindings: Env;
  Variables: {
    user: AuthUser;
    session: AuthSession;
    csrfToken: string;
  };
}
```

**Note**: `AppEnv.Variables` uses domain types `AuthUser`/`AuthSession` from `src/domain/entities/auth.ts` — NOT `User`/`Session` from `better-auth`. This prevents presentation-layer coupling to the auth library's type signatures.

`worker.ts` imports `AppEnv` from `./presentation/types` rather than defining it inline.

#### 2.1 Create `src/presentation/templates/pages/login.ts`

Extend the existing `authLayout.ts`. Template inputs:

- `csrfToken: string` — hidden form field value
- `redirectTo?: string` — hidden form field value
- `error?: string` — error message to display
- `email?: string` — pre-fill email after failed login
- `registeredSuccess?: boolean` — show "Account created, please sign in" banner

Write `.spec.ts` first verifying:

- CSRF token is rendered in hidden field
- Error message is escaped and rendered when present
- redirectTo is rendered in hidden field when present
- Registration success banner is shown when `registeredSuccess: true`

#### 2.2 Create `src/presentation/templates/pages/register.ts`

Template inputs:

- `csrfToken: string`
- `error?: string` — general error
- `fieldErrors?: Record<string, string>` — per-field validation errors
- `email?: string` — pre-fill email after failed registration

Write `.spec.ts` first verifying HTML output including escaping.

---

### Phase 2.5: Application — Auth Use Cases

**Goal**: Thin orchestration layer between presentation handlers and the auth infrastructure. Handlers must not call `auth.api.*` directly.

#### 2.5.1 Create `src/application/use-cases/SignInUseCase.ts`

**Constructor**: `new SignInUseCase(authService: AuthService, rateLimiter: RateLimiter)` — accepts port interfaces, not concrete infrastructure types.

Accepts validated form inputs (email, password, client IP). Calls `authService.signIn(...)`. Returns a typed result:

- `{ ok: true; sessionCookie: string }` — success; handler constructs `Response` from this value; CSRF is managed independently by `requireAuth` middleware
- `{ ok: false; kind: 'invalid_credentials' | 'rate_limited' | 'service_error'; retryAfter?: number }` — failure

Write `.spec.ts` first. Mock `auth.api.signInEmail` to test each result path.

#### 2.5.2 Create `src/application/use-cases/SignUpUseCase.ts`

**Constructor**: `new SignUpUseCase(authService: AuthService, rateLimiter: RateLimiter)` — accepts port interfaces, not concrete infrastructure types.

Accepts email, password, client IP. Derives `name` from the email prefix (`email.split('@')[0]`) to satisfy better-auth v1.4.x's required `name` argument — the registration form does NOT include a name field. Validates password strength (via `common-passwords.ts`). Calls `authService.signUp({ email, password, name, ip })`. Returns a typed result:

- `{ ok: true }` — success
- `{ ok: false; kind: 'email_taken' | 'weak_password' | 'rate_limited' | 'service_error' }` — failure

Write `.spec.ts` first.

#### 2.5.3 Create `src/application/use-cases/SignOutUseCase.ts`

**Constructor**: `new SignOutUseCase(authService: AuthService)` — accepts port interface, not concrete infrastructure type.

Accepts the session headers. Calls `authService.signOut(...)`. Returns a typed result:

- `{ ok: true; clearCookieHeader: string }` — success; handler constructs `Response` from this value
- `{ ok: false; kind: 'service_error' }` — failure

Write `.spec.ts` first.

Add `useCase` accessors to `ServiceFactory` so handlers obtain use cases via the composition root.

---

### Phase 3: Presentation — Auth Page Handlers

**Goal**: Custom Hono handlers for HTML form flows.

#### 3.1 Create `src/presentation/utils/cookieBuilder.ts`

Ported and adapted from `~/vance-ts/src/presentation/utils/cookieBuilder.ts`. Expose:

- `generateCsrfToken(): string` — `Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2,'0')).join('')` → 256-bit token (shared utility; used by both `AuthPageHandlers` and `requireAuth` — no duplicate inline definitions)
- `deriveCsrfToken(message: string, secret: string): Promise<string>` — HMAC-SHA256(key=secret, message=message) → hex string; used by `requireAuth` for session-bound CSRF tokens
- `buildCsrfCookie(token: string): string` — builds `Set-Cookie` header value for `__Secure-csrf` cookie
- `clearCsrfCookie(): string` — builds clearing `Set-Cookie` header value
- `extractCsrfTokenFromCookies(cookieHeader: string | null): string | null` — reads the `__Secure-csrf` cookie value

Write `.spec.ts` first.

#### 3.2 Create `src/presentation/utils/extractClientIp.ts`

Ported from `~/vance-ts/src/presentation/utils/extractClientIp.ts`. Extracts `CF-Connecting-IP` **only** from request headers. `X-Forwarded-For` is not used — it is client-controlled and enables IP spoofing for rate limit bypass (see Security Considerations).

Write `.spec.ts` first.

#### 3.2b Create `src/presentation/utils/redirectValidator.ts`

Validates and sanitizes the `redirectTo` query parameter used by POST /auth/sign-in (FR-005) to prevent open redirect attacks. Full validation spec in `contracts/auth-endpoints.md` §Post-Sign-In Redirect Validation.

**Exports**:

- `validateRedirectTo(raw: string | null): string` — Returns a safe path or `/` if invalid.

**Validation rules**:

1. Decode: `decodeURIComponent(raw)` (prevents URL-encoded bypass)
2. Canonicalise: `new URL(decoded, 'http://localhost')` — extract only `.pathname + .search`
3. Accept if: starts with `/`, does NOT start with `//`, does NOT start with `/api/` or `/auth/`
4. Default: return `/` for absent, invalid, or rejected input

Write `.spec.ts` first covering: valid paths, `//` prefix, `/api/` prefix, `/auth/` prefix, URL-encoded bypass attempts, missing input, and malformed URL.

#### 3.3 Create `src/presentation/middleware/requireAuth.ts`

Access the auth instance via the composition root (`di/serviceFactory`) — do NOT import from `infrastructure/auth` directly (presentation → infrastructure dependency violation):

```typescript
import type { Context, Next } from 'hono';
import type { AppEnv } from '../types';
import type { AuthService } from '../../application/ports/AuthService';
import { deriveCsrfToken, buildCsrfCookie } from '../utils/cookieBuilder';

/**
 * Creates the requireAuth middleware with AuthService and secret injected.
 * Called from the composition root (ServiceFactory) — never calls getServiceFactory internally.
 */
export function createRequireAuth(authService: AuthService, secret: string) {
  return async function requireAuth(c: Context<AppEnv>, next: Next): Promise<Response | void> {
    const session = await authService.getSession({ headers: c.req.raw.headers });
    if (session === null) {
      const url = new URL(c.req.url);
      const redirectTo = encodeURIComponent(url.pathname + url.search);
      return c.redirect(`/auth/sign-in?redirectTo=${redirectTo}`, 302);
    }
    // Derive a session-bound CSRF token via HMAC-SHA256(key=secret, message="csrf:v1:{sessionToken}")
    // Domain prefix "csrf:v1:" prevents cross-protocol token confusion (a token valid for CSRF
    // cannot be replayed in a different HMAC context). Deterministic per session; no KV storage needed.
    const sessionToken = session.session.token; // session token stored in cookie (not the session row UUID)
    const csrfToken = await deriveCsrfToken(`csrf:v1:${sessionToken}`, secret); // HMAC-SHA256(key=secret, message="csrf:v1:{token}") → hex
    c.header('Set-Cookie', buildCsrfCookie(csrfToken), { append: true });
    c.header('Cache-Control', 'no-store, no-cache');
    c.set('user', session.user);
    c.set('session', session.session);
    c.set('csrfToken', csrfToken);
    await next();
  };
}
```

**Architecture note**: `requireAuth` calls `authService.getSession()` via the port interface — NOT `auth.api.getSession()` directly — eliminating the presentation → infrastructure direct coupling. `AuthService` is **injected** via `createRequireAuth(authService)` at the composition root — `requireAuth` never calls `getServiceFactory` internally (that would be the service locator anti-pattern). The return type is `Promise<Response | void>` — Hono middleware that short-circuits via redirect must return a `Response`.

**CSRF token design**: `deriveCsrfToken(message: string, secret: string): Promise<string>` derives the CSRF token via `HMAC-SHA256(key=secret, message=message)` using `crypto.subtle`. `requireAuth` passes `"csrf:v1:{sessionToken}"` as the message — the `"csrf:v1:"` domain-separation prefix prevents cross-protocol token confusion (a token derived for CSRF cannot be replayed in another HMAC context). `secret` is provided via `createRequireAuth(authService, secret)` rather than read from `c.env` inside the closure (eliminates the need for `env` in scope). This is deterministic per session — the same token is produced on every authenticated request, which:

- Survives multi-tab usage (all tabs share the same session and therefore the same CSRF token)
- Eliminates KV storage (no need to store and expire random CSRF tokens)
- Is validated by re-deriving on POST and comparing (constant-time comparison)

**`session.session.token` vs `.id`**: The CSRF token is derived from `session.session.token` (the opaque session token stored in the cookie), not `session.session.id` (the D1 row UUID). The cookie token is already a high-entropy secret known only to the authenticated user; deriving CSRF from it provides binding to the actual credential in use.

Export `deriveCsrfToken` from `src/presentation/utils/cookieBuilder.ts`.

Write `.spec.ts` testing: no session → `302` redirect with preserved URL; valid session → next called with user/session/csrfToken on context.

#### 3.4 Create `src/presentation/handlers/AuthPageHandlers.ts`

Handles all HTML auth page requests. Uses the bridge pattern to call better-auth's internal API.

**Constructor**: `new AuthPageHandlers(signInUseCase, signUpUseCase, signOutUseCase)` — accepts use case instances from the composition root. No `env: Env` parameter (presentation must not depend on infrastructure directly).

**Methods** (no `env` parameter — use cases already hold their dependencies):

- `handleGetSignIn(request) → Response` — Serve sign-in page + set CSRF cookie
- `handlePostSignIn(request) → Promise<Response>` — CSRF check → `signInUseCase.execute(...)` → redirect or re-render
- `handleGetSignUp(request) → Response` — Serve sign-up page + set CSRF cookie
- `handlePostSignUp(request) → Promise<Response>` — CSRF check → `signUpUseCase.execute(...)` → redirect to sign-in
- `handlePostSignOut(request) → Promise<Response>` — CSRF check → `signOutUseCase.execute(...)` → redirect to sign-in

**Error normalisation for login**:

- On any auth failure from better-auth: display `"Invalid email or password"` regardless of actual error
- Only `429 Too Many Requests` from better-auth displays rate limit message
- Log actual error internally (no PII)

**Redirect validation** for `redirectTo`: delegated to `validateRedirectTo()` from `src/presentation/utils/redirectValidator.ts`:

- Must be a relative path starting with `/`
- Must not start with `//` (open redirect prevention)
- Must not point to `/api/*` or `/auth/*`
- Default: `/` if absent or invalid

Write `.spec.ts` covering all form flows including CSRF failure, auth failure, success, and rate limiting.

---

### Phase 4: Dependency Injection

**Goal**: Single composition root that wires all dependencies.

#### 4.1 Create `src/di/serviceFactory.ts`

```typescript
import type { Env } from '../infrastructure/env';
import type { AuthService } from '../application/ports/AuthService';
import type { RateLimiter } from '../application/ports/RateLimiter';
import { getAuth, resetAuth } from '../infrastructure/auth';
import { BetterAuthService } from '../infrastructure/BetterAuthService';
import { KvRateLimiter } from '../infrastructure/KvRateLimiter';
import { SignInUseCase } from '../application/use-cases/SignInUseCase';
import { SignUpUseCase } from '../application/use-cases/SignUpUseCase';
import { SignOutUseCase } from '../application/use-cases/SignOutUseCase';
import { AuthPageHandlers } from '../presentation/handlers/AuthPageHandlers';
import { createRequireAuth } from '../presentation/middleware/requireAuth';

export class ServiceFactory {
  private readonly env: Env;
  private _authService: AuthService | null = null;
  private _rateLimiter: RateLimiter | null = null;
  private _signInUseCase: SignInUseCase | null = null;
  private _signUpUseCase: SignUpUseCase | null = null;
  private _signOutUseCase: SignOutUseCase | null = null;
  private _authPageHandlers: AuthPageHandlers | null = null;

  private readonly _authInstance: ReturnType<typeof getAuth>;

  constructor(env: Env) {
    this.env = env;
    this._authInstance = getAuth(env);
  }

  /** @internal Use via use-case getters only; not for external consumption. */
  private get _authServiceInstance(): AuthService {
    this._authService ??= new BetterAuthService(this._authInstance);
    return this._authService;
  }

  /** @internal Use via use-case getters only; not for external consumption. */
  private get _rateLimiterInstance(): RateLimiter {
    this._rateLimiter ??= new KvRateLimiter(this.env.RATE_LIMIT);
    return this._rateLimiter;
  }

  /**
   * Exposes the AuthService port for use in middleware and use-case injection.
   * HTTP pass-through delegation uses `authHandler` instead.
   */
  get authService(): AuthService {
    return this._authServiceInstance;
  }

  get signInUseCase(): SignInUseCase {
    this._signInUseCase ??= new SignInUseCase(this._authServiceInstance, this._rateLimiterInstance);
    return this._signInUseCase;
  }

  get signUpUseCase(): SignUpUseCase {
    this._signUpUseCase ??= new SignUpUseCase(this._authServiceInstance, this._rateLimiterInstance);
    return this._signUpUseCase;
  }

  get signOutUseCase(): SignOutUseCase {
    this._signOutUseCase ??= new SignOutUseCase(this._authServiceInstance);
    return this._signOutUseCase;
  }

  get authPageHandlers(): AuthPageHandlers {
    this._authPageHandlers ??= new AuthPageHandlers(
      this.signInUseCase,
      this.signUpUseCase,
      this.signOutUseCase
    );
    return this._authPageHandlers;
  }

  /**
   * Returns the requireAuth middleware with AuthService and secret pre-injected.
   * Use in worker.ts: `app.use('/app/*', (c, next) => factory.requireAuthMiddleware(c, next))`
   */
  get requireAuthMiddleware(): ReturnType<typeof createRequireAuth> {
    return createRequireAuth(this._authServiceInstance, this.env.BETTER_AUTH_SECRET);
  }

  /**
   * Returns the better-auth handler function for direct `/api/auth/*` delegation.
   * Presentation-layer routing concern; kept in the composition root so worker.ts
   * never imports from infrastructure directly.
   */
  get authHandler(): (req: Request) => Promise<Response> {
    return (req: Request) => this._authInstance.handler(req);
  }
}

let _factory: ServiceFactory | null = null;

export function getServiceFactory(env: Env): ServiceFactory {
  _factory ??= new ServiceFactory(env);
  return _factory;
}

export function resetServiceFactory(): void {
  _factory = null;
  resetAuth(); // Reset both module-level singletons together for clean test isolation
}
```

Write `.spec.ts` verifying singleton behaviour and reset.

---

### Phase 5: Routing — Update `src/worker.ts`

**Goal**: Add auth routes and protected route middleware.

```typescript
import { getServiceFactory } from './di/serviceFactory';

// Better-auth API (JSON, OAuth callbacks, etc.)
// Routes via ServiceFactory.authHandler — worker.ts never calls auth.handler() directly
app.on(['GET', 'POST'], '/api/auth/*', async (c) => {
  const authResponse = await getServiceFactory(c.env).authHandler(c.req.raw);
  // Reconstruct to expose mutable headers to the security-headers middleware
  return new Response(authResponse.body, authResponse);
});

// HTML auth pages
app.get('/auth/sign-in', (c) => {
  return getServiceFactory(c.env).authPageHandlers.handleGetSignIn(c.req.raw);
});
app.post('/auth/sign-in', async (c) => {
  return getServiceFactory(c.env).authPageHandlers.handlePostSignIn(c.req.raw);
});
app.get('/auth/sign-up', (c) => {
  return getServiceFactory(c.env).authPageHandlers.handleGetSignUp(c.req.raw);
});
app.post('/auth/sign-up', async (c) => {
  return getServiceFactory(c.env).authPageHandlers.handlePostSignUp(c.req.raw);
});
app.post('/auth/sign-out', async (c) => {
  return getServiceFactory(c.env).authPageHandlers.handlePostSignOut(c.req.raw);
});

// Protected application routes
app.use('/app/*', async (c, next) => getServiceFactory(c.env).requireAuthMiddleware(c, next));
```

Security headers middleware is extended to cover `/auth/*` routes (`/auth/sign-in`, `/auth/sign-up`, `/auth/sign-out`).

Update `worker.spec.ts` to cover new routes.

---

## Key Design Decisions

| Decision                | Choice                                               | Rationale                                                                                                                                           |
| ----------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth library**        | better-auth                                          | Required by spec; OAuth extensibility                                                                                                               |
| **D1 adapter**          | drizzle-orm/d1                                       | Officially documented for D1; no viable alternative                                                                                                 |
| **Session storage**     | D1 (via better-auth)                                 | Better-auth manages the session table; simpler than separate KV                                                                                     |
| **HTML form bridge**    | Call `auth.api.*` with `asResponse: true`            | Keeps server-rendered HTML; delegates auth to better-auth                                                                                           |
| **CSRF for HTML forms** | Double-submit cookie pattern                         | better-auth CSRF covers `/api/auth/*` only; defense-in-depth                                                                                        |
| **Password hashing**    | PBKDF2-HMAC-SHA-256 via Web Crypto (600k iterations) | Native Workers runtime; no pure-JS overhead; no `limits.cpu_ms` required; OWASP 2023 compliant                                                      |
| **Password strength**   | `password.validate` hook with common-passwords       | NIST 800-63B: length + breach check, no complexity rules                                                                                            |
| **Error messages**      | Normalise to generic message                         | Prevent email enumeration (FR-007)                                                                                                                  |
| **Rate limiting**       | KV-backed rate limiter (`RATE_LIMIT` namespace)      | better-auth built-in is in-memory and non-functional across Workers isolates; KV provides shared distributed counters required by FR-006 and SC-003 |
| **Common passwords**    | Ported from vance-ts                                 | Battle-tested; already has spec                                                                                                                     |
| **Session TTL**         | 30 days + 1-day refresh                              | Spec-mandated (clarification 2026-02-24); `expiresIn: 2_592_000`                                                                                    |
| **OAuth extensibility** | Config-only via `socialProviders`                    | FR-010: no structural changes needed for OAuth                                                                                                      |

---

## Testing Strategy

### Workers Project (`src/**/*.spec.ts`)

All new files get corresponding `.spec.ts` files. 100% branch coverage is targeted (Workers runtime; no v8 coverage report — see CLAUDE.md).

| File                                             | Test Focus                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| `infrastructure/auth.spec.ts`                    | Factory creates/caches auth; reset works                                  |
| `domain/services/passwordHasher.spec.ts`         | Hash format; salt randomness; verify correct/wrong/malformed              |
| `domain/value-objects/common-passwords.spec.ts`  | Common passwords are in the Set                                           |
| `application/use-cases/SignInUseCase.spec.ts`    | Success; invalid credentials; rate limited; service error                 |
| `application/use-cases/SignUpUseCase.spec.ts`    | Success; email taken; weak password; rate limited; service error          |
| `application/use-cases/SignOutUseCase.spec.ts`   | Success; service error                                                    |
| `presentation/utils/cookieBuilder.spec.ts`       | Cookie header format; clear cookie                                        |
| `presentation/utils/extractClientIp.spec.ts`     | CF-Connecting-IP only; spoofed X-Forwarded-For ignored; sanitizeIp        |
| `presentation/middleware/requireAuth.spec.ts`    | Redirect on no session; next() on valid session; CSRF token on context    |
| `presentation/handlers/AuthPageHandlers.spec.ts` | CSRF validation; use-case success/failure; redirect logic                 |
| `presentation/templates/pages/login.spec.ts`     | HTML output; escaping; fields                                             |
| `presentation/templates/pages/register.spec.ts`  | HTML output; escaping; field errors                                       |
| `di/serviceFactory.spec.ts`                      | Singleton; reset; use-case accessors; resetServiceFactory calls resetAuth |
| `worker.spec.ts`                                 | Route existence for all auth routes                                       |

### Mock Strategy

- Better-auth internal API: Mock `auth.api.signInEmail`, `auth.api.signUpEmail`, `auth.api.signOut`, `auth.api.getSession`
- D1 binding: Use vitest-pool-workers D1 fixture or a stub object

---

## Security Checklist

- [ ] **Email enumeration** (FR-007): Login failures always show `"Invalid email or password"` (tested in `AuthPageHandlers.spec.ts`)
- [ ] **CSRF** (FR-011): Double-submit CSRF on all POST HTML form handlers
- [ ] **Open redirect** (FR-005): `redirectTo` validated as relative path before use
- [ ] **Password hashing**: PBKDF2-HMAC-SHA-256 via Web Crypto, 600k iterations, random 16-byte salt, constant-time verify
- [ ] **Password strength** (FR-008): 12-128 chars, common passwords rejected
- [ ] **Rate limiting** (FR-006): KV-backed rate limiter active; better-auth built-in disabled
- [ ] **CSRF constant-time comparison**: CSRF token comparison uses a byte-by-byte XOR loop (same pattern as `verifyPassword`) — not `===` — to prevent timing-based token prefix leakage
- [ ] **Session invalidation** (FR-009): better-auth deletes session row from D1 on logout
- [ ] **Security headers** (FR-011): `applySecurityHeaders()` applied to all auth responses
- [ ] **Secure cookies**: `useSecureCookies` enabled in non-localhost environments
- [ ] **BETTER_AUTH_SECRET entropy**: Verified at startup that secret is >= 64 hex chars (32 bytes); generated with `openssl rand -hex 32`; runtime throws if condition is not met
- [ ] **XSS prevention**: All user-supplied values HTML-escaped in templates via `escapeHtml()`
- [ ] **Security logging** (FR-012): Failed logins logged via `console.log` with IP only (no passwords/emails in logs)
- [ ] **Route naming alignment**: All routes use `/auth/sign-in`, `/auth/sign-up`, `/auth/sign-out` per spec clarification (not `/auth/login`, `/auth/register`, `/auth/logout`)
- [ ] **Logout CSRF**: `requireAuth` middleware derives a session-bound CSRF token via HMAC-SHA256 on each authenticated request; app page handlers embed `c.get('csrfToken')` in sign-out form hidden fields
- [ ] **Cache-Control on auth pages**: All authenticated pages served via `requireAuth` set `Cache-Control: no-store, no-cache` to prevent CDN/browser caching of session-specific content
- [ ] **Timing oracle** (FR-007): `verifyPassword` called with dummy hash on all sign-in failures to equalise timing between "user not found" (~5ms D1 miss) and "wrong password" (~30ms PBKDF2)

---

## Complexity Tracking

| Item                                         | Why Needed                                                                                        | Simpler Alternative Rejected Because                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `drizzle-orm` runtime dependency             | better-auth D1 adapter requires it                                                                | No officially supported D1-native better-auth adapter exists                               |
| `di/serviceFactory.ts` (top-level directory) | Single composition root for cross-layer wiring; outside layer hierarchy per ESLint boundary rules | Inline factory in worker.ts would violate single-responsibility; harder to test            |
| Double-submit CSRF                           | HTML form handlers need own CSRF                                                                  | better-auth only covers its `/api/auth/*` endpoints                                        |
| `domain/services/passwordHasher.ts`          | Custom PBKDF2 hashing via Web Crypto instead of default                                           | Default argon2id/scrypt uses pure-JS `@noble/hashes` which exceeds Workers CPU time limits |

---

## Phase 0.5: Applied Learnings

No prior solution documents exist yet in `.specify/solutions/`. This feature will generate learnings to capture after implementation.

---

## Security Considerations

### Rate Limiting (Distributed — Critical)

Better-auth's built-in `rateLimit` is **in-memory** and does not survive isolate restarts. Cloudflare Workers spawns V8 isolates across hundreds of global edge nodes; each isolate holds its own independent counter. This makes in-memory rate limiting functionally ineffective against any distributed brute-force attempt — FR-006 and SC-003 cannot be met with the in-memory option.

**Required implementation**: Replace with a **KV-backed rate limiter** in `src/infrastructure/KvRateLimiter.ts`:

- Key format: `ratelimit:{endpoint}:{ip}` (e.g., `ratelimit:sign-in:1.2.3.4`)
- KV TTL equals the rate limit window (15 min for sign-in, 5 min for registration)
- Counter is incremented atomically using KV's `put` with `{ expirationTtl }` (KV has no atomic increment; use a read-increment-write with `metadata` version check or accept the small race, which is safe enough for rate limiting). **Accepted risk**: This race is documented as a known limitation; create a tracking beads task (priority=4) to revisit with an atomic solution (e.g., Durable Objects counter) if abuse is observed.
- Disable better-auth's built-in `rateLimit` block entirely; the KV limiter is called at the handler level before delegating to `auth.api.*`
- The `RATE_LIMIT` KV namespace binding must be added to `env.ts` and `wrangler.toml`
- **Do not mark FR-006 or SC-003 as complete until this is implemented**

### Rate Limit Window Alignment (Spec vs Contract)

FR-006 specifies: sign-in = 5 attempts / 15 min per IP; registration = 5 attempts / 5 min per IP. The contracts/auth-endpoints.md Rate Limits table must match these values exactly. The KV rate limiter must use separate keys per endpoint to support different windows.

### Open Redirect via URL-Encoded Paths

The `redirectTo` validation ("starts with `/`; not `//`; not `/api/*` or `/auth/*`") is bypassable via URL-encoded attacks:

- `/%2F%2Fevil.com` starts with `/` and passes all string checks, but resolves to `//evil.com`
- `%0d%0aevil-header: injected` can poison the `Location` response header

**Required validation sequence in `AuthPageHandlers.ts`**:

1. Decode: `decodeURIComponent(raw)` — if `URIError` is thrown, reject
2. Construct: `new URL(decoded, 'http://localhost')` — extract only `.pathname + .search`
3. Apply existing prefix checks on the decoded, canonicalised path
4. Spec tests must cover `/%2F%2Fevil.com`, `/%0d%0a`, null bytes, and 200+ char paths

### IP Address Extraction for Rate Limiting (Resolved)

`extractClientIp.ts` falls back to `X-Forwarded-For` — a client-controlled header. Better-auth's internal IP extraction may also use `X-Forwarded-For` independently, which would allow rate limit bypass via IP spoofing.

**Required**: Configure better-auth explicitly to read `CF-Connecting-IP` only. In `getAuth(env)`, set `advanced: { ipAddress: { ipAddressHeaders: ['CF-Connecting-IP'] } }` (verify exact field name against installed v1.4.x). Remove the `X-Forwarded-For` fallback from `extractClientIp.ts` (or keep it only for local dev detection, never for rate limiting). Add a test asserting that a spoofed `X-Forwarded-For` with a valid `CF-Connecting-IP` correctly identifies the CF IP.

**Resolved**: `getAuth(env)` already sets `advanced: { ipAddress: { ipAddressHeaders: ['CF-Connecting-IP'] } }` (see Phase 1.4 code example). This ensures better-auth's internal IP extraction uses `CF-Connecting-IP` exclusively, consistent with `extractClientIp.ts`'s sole-source contract (line 504). The contradiction with line 505 is resolved — `X-Forwarded-For` is not used by either the custom rate limiter or better-auth's internal IP detection.

### CSRF Token Expiry

Double-submit CSRF tokens set without a `Max-Age` become session cookies (cleared only on browser close). A token open for hours is functionally permanent. If a CSRF token value is captured from a response log, it remains valid indefinitely.

**Required**: Add `Max-Age=3600` to the CSRF cookie in `buildCsrfCookie()`. On CSRF validation failure in handlers, re-serve the form with a fresh token (HTTP 200 + new CSRF cookie) rather than returning a bare 403 — this handles the case where the user's token expired while the form was open. Document the expiry in data-model.md CSRF State section.

### Log Injection via IP

`console.log` of security events uses the IP from `extractClientIp.ts`. In local dev or spoofed `X-Forwarded-For` scenarios, the IP is client-controlled and could contain newlines or log-format characters.

**Required**: Add a `sanitizeIp(raw: string): string` function in `extractClientIp.ts` that strips all characters not matching `/^[0-9A-Fa-f:.]{1,45}$/`; returns `"unknown"` if the result is empty or oversized. Test with newline, tab, and oversized input.

### Request Body Size Limits

No maximum body size is defined for auth POST endpoints. A very large body is parsed into memory before `maxPasswordLength: 128` is enforced.

**Required**: In `handlePostSignIn` and `handlePostSignUp`, check `Content-Length` header before parsing; reject with 413 if over the size limit. Limits: HTML form submissions (`/auth/*`) max **4 KB** (email ≤254 + password ≤128 + CSRF ≤64 + overhead ≈ ~450 bytes; 50 KB was ~100x too large and unnecessarily expanded the attack surface for form-parser amplification); JSON API requests (`/api/auth/*`) max 10 KB. After parsing, enforce: `email` ≤ 254 chars (RFC 5321), `password` ≤ 128 chars. Document these limits in contracts/auth-endpoints.md.

### Email Case Normalisation

D1's `UNIQUE` constraint on the `email` column is case-sensitive by default. If better-auth does not lowercase on insert, `User@Example.com` and `user@example.com` can create separate accounts.

**Required**: Set `emailAndPassword: { normalizeEmail: true }` in the better-auth config (verify v1.4.x API). If unsupported, add `.toLowerCase().trim()` preprocessing in handlers before calling `auth.api.*`. Test that `USER@EXAMPLE.COM` is treated identically to `user@example.com`.

### Login Timing Oracle (High)

For non-existent emails, better-auth returns immediately after a ~5ms D1 miss (no password hash to verify). For wrong passwords, it runs PBKDF2-HMAC-SHA-256 at 600,000 iterations (~10–30ms). Statistical timing over N requests distinguishes the two paths even though error messages are identical — violating FR-007.

**Required**: In `handlePostSignIn`, when better-auth returns a non-OK response, call `verifyPassword(submittedPassword, DUMMY_HASH)` before returning the error response, where `DUMMY_HASH` is a pre-computed constant hash stored in `AuthPageHandlers` (a real PBKDF2 hash of a random value). This equalises response time for both failure modes.

`DUMMY_HASH` must be a valid `pbkdf2$600000$...` format string so `verifyPassword` runs the full PBKDF2 computation.

### `/api/auth/*` JSON API Bypasses KV Rate Limiter (Critical)

The KV-backed rate limiter (required finding above) is applied only inside `handlePostSignIn` and `handlePostSignUp`. However, better-auth's JSON API is mounted directly: `app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))`. An attacker can bypass the custom KV rate limiter entirely by POSTing directly to `POST /api/auth/sign-in/email` or `POST /api/auth/sign-up/email` with JSON credentials — the HTML form path is irrelevant. Better-auth's in-memory rate limiter does not stop distributed brute-force attempts. **FR-006 and SC-003 cannot be met without addressing this.**

**Required**: Add Hono middleware placed BEFORE the `app.on('/api/auth/*', ...)` delegation that intercepts specific auth API paths:

- `POST /api/auth/sign-in/email` → check and increment `ratelimit:sign-in:{ip}` in KV (same key as HTML handler; both paths count toward the shared limit)
- `POST /api/auth/sign-up/email` → check and increment `ratelimit:register:{ip}` in KV
- Return 429 with `Retry-After` header if limit exceeded; otherwise pass through to `auth.handler()`
- Test: after 5 failed HTML form attempts, a direct JSON POST to `/api/auth/sign-in/email` must be rejected with 429

### Rate Limit Contract Discrepancy (Resolved)

~~`contracts/auth-endpoints.md` Rate Limits table contained values inconsistent with FR-006 and acceptance scenario US1-5.~~

**Resolved**: `contracts/auth-endpoints.md` was updated in the same PR to show `5 min / 5 attempts` for registration endpoints, matching FR-006. The KV rate limiter must use these corrected values.

### Password Hashing Algorithm (Resolved)

**Decision**: Use **PBKDF2-HMAC-SHA-256** via `crypto.subtle` (Web Crypto API) at 600,000 iterations rather than better-auth's default argon2id/scrypt (both implemented in pure JS via `@noble/hashes`).

**Rationale**: The pure-JS hashing implementations take 200–500ms per operation in the Workers runtime, which exceeds the Workers CPU time limit (50ms default on paid plans). `crypto.subtle` is a native Workers API executed in C++, not the JS event loop — 600,000 PBKDF2 iterations run in ~10–30ms in the Workers runtime. No `limits.cpu_ms` configuration or paid-plan-specific tuning is required.

**Trade-off accepted**: PBKDF2 is not memory-hard (unlike argon2id/scrypt), making GPU-based attacks on a leaked database somewhat more feasible. At 600,000 iterations this remains OWASP 2023 compliant. The decision is logged as a Key Design Decision.

**Implementation**: `src/domain/services/passwordHasher.ts` (Phase 1.3). The hash format `pbkdf2$<iterations>$<salt-hex>$<derived-hex>` is self-describing, allowing iteration counts to be increased in future without invalidating existing hashes.

### Security Headers on better-auth's Native Response (Resolved)

The existing Hono middleware pattern:

```typescript
app.use('/api/*', async (c, next) => {
  await next();
  applySecurityHeaders(c.res.headers); // modifies c.res.headers
});
```

This works correctly when route handlers call Hono's own response builders (`c.json()`, `c.text()`, etc.), because Hono stores the response in `c.res` and the headers object is mutable. However, `auth.handler(c.req.raw)` returns a native `Response` object created by better-auth. In the Workers runtime, native `Response` objects have **immutable headers** after construction. Hono sets `c.res` to this immutable Response, and the subsequent `c.res.headers.set(...)` call in the middleware may throw a `TypeError: Cannot set property` or silently no-op, leaving security headers absent from all `/api/auth/*` responses.

**Required**: In `worker.ts`, wrap better-auth's response before returning it so headers are mutable:

```typescript
app.on(['GET', 'POST'], '/api/auth/*', async (c) => {
  const authResponse = await getServiceFactory(c.env).authHandler(c.req.raw);
  // Reconstruct to expose mutable headers to the security-headers middleware
  return new Response(authResponse.body, authResponse);
});
```

Alternatively, apply `applySecurityHeaders` inside the route handler directly rather than relying on middleware mutation. Verify in `worker.spec.ts` that security headers are present on `/api/auth/*` responses.

Apply the same fix to the `/auth/*` HTML form handlers: add `app.use('/auth/*', ...)` security headers middleware (currently only `/api/*` and `/app/_/*` are covered).

**Resolved**: The `authHandler` getter on `ServiceFactory` (see Phase 4) returns `(req: Request) => Promise<Response>` — the better-auth handler function directly. In `worker.ts`, the `/api/auth/*` route calls `getServiceFactory(c.env).authHandler(c.req.raw)` and reconstructs the response as `new Response(authResponse.body, authResponse)` to expose mutable headers to the security-headers middleware. `const { auth }` was a copy-paste error — `auth` is not a property on `ServiceFactory`.

### Route Registration Ordering Conflict (High)

The existing `worker.ts` has:

```typescript
app.all('/api/*', apiNotFound); // catch-all — line 32
```

Hono matches routes in registration order. The new `/api/auth/*` handler must be registered **before** this catch-all or all auth API requests will be handled by `apiNotFound` and return 404.

**Required**: In `worker.ts`, register auth routes immediately after the security-headers middleware registration and before any `app.all('/api/*', ...)` catch-all. Add a `worker.spec.ts` test asserting that `GET /api/auth/session` returns a non-404 status code (i.e., reaches better-auth's handler).

### API Endpoint Fingerprinting via Wildcard Mount (Resolved)

Mounting `app.on(['GET', 'POST'], '/api/auth/*', ...)` delegates all matching requests to `auth.handler()`. Better-auth exposes routes for **all features it knows about**, including disabled features (`/api/auth/forget-password`, `/api/auth/verify-email`, `/api/auth/callback/:provider`). Even with `requireEmailVerification: false` and no OAuth configured, these routes return responses (typically 400 or 500) rather than 404. An attacker can enumerate these to:

- Confirm the auth library is better-auth
- Determine the version by probing endpoints added/removed between versions
- Discover which features will be activated in future (OAuth callback URLs)

**Required**: After calling `auth.handler(c.req.raw)`, inspect the response status. If better-auth returns 404 for an unknown path, pass it through. If it returns a non-404 for a route that is not in the expected set (`/sign-in/email`, `/sign-up/email`, `/sign-out`, `/session`), override it with a standard 404. Document the expected route set in `contracts/auth-endpoints.md`. Alternatively, accept this risk and document the decision if complexity is not warranted.

**Resolved**: After calling `getServiceFactory(c.env).authHandler(c.req.raw)` in the `/api/auth/*` route handler, inspect the response path against the allowlist (`/api/auth/sign-in/email`, `/api/auth/sign-up/email`, `/api/auth/sign-out`, `/api/auth/session`). If better-auth returns a non-404 response for a path not in this allowlist, override with `new Response(null, { status: 404 })`. This is enforced via Phase 5 implementation and tested in `worker.spec.ts`.

### Cache-Control on Auth Form Pages (Resolved)

`GET /auth/sign-in` and `GET /auth/sign-up` render HTML containing a CSRF token in a hidden form field AND set a CSRF cookie via `Set-Cookie`. If the HTML response is served from a browser or CDN cache:

- The cached HTML contains a **stale CSRF token** from a previous response
- The `Set-Cookie` header from that original response is NOT re-sent from cache
- If the user's CSRF cookie has since expired (>1 hour, per the `Max-Age=3600` requirement), the stale form token no longer matches any valid cookie → CSRF validation fails on POST
- The user sees a mysterious form error despite entering correct credentials

**Required**: Add `Cache-Control: no-store, no-cache` (and `Pragma: no-cache` for legacy) to all responses from `handleGetSignIn` and `handleGetSignUp`. This prevents both browser and intermediate proxy caching of auth form pages. Add a test asserting the `Cache-Control` header is present with value `no-store` on GET `/auth/sign-in` and GET `/auth/sign-up` responses.

**Resolved**: `AuthPageHandlers.handleGetSignIn` and `AuthPageHandlers.handleGetSignUp` must include `Cache-Control: no-store` and `Pragma: no-cache` headers in their responses. This is enforced in `AuthPageHandlers.spec.ts` by asserting the header is present on all GET auth form page responses.

### Route Naming Discrepancy (Resolved)

~~`plan.md`, `contracts/auth-endpoints.md`, and the `requireAuth` middleware code all used `/auth/login`, `/auth/logout`, and `/auth/register` — inconsistent with the spec clarification which mandates `/auth/sign-in`, `/auth/sign-out`, `/auth/sign-up`.~~

**Resolved**: All route names in `plan.md` (Phase 3.3, Phase 5, Edge Cases) and `contracts/auth-endpoints.md` have been updated to match the spec. The `requireAuth` middleware redirects to `/auth/sign-in?redirectTo=...`.

### Logout CSRF Token Source (Medium)

The plan's successful login response clears the CSRF cookie (`Set-Cookie: __Secure-csrf=; Max-Age=0`). Protected app pages (`/app/*`) that render a logout button must embed a CSRF token as a hidden field in the form — but no mechanism is defined for how these pages obtain that token.

The CSRF cookie is `HttpOnly`, so server-side app page handlers cannot read it to embed the value in the template. After login, no CSRF cookie is present. The logout form on `/app/dashboard` would have no CSRF token to include, causing every logout attempt to fail validation.

**Required**: Extend `requireAuth` middleware to derive a session-bound CSRF token on each authenticated request and provide it via the Hono context:

```typescript
// Inside requireAuth, after session validation:
const sessionToken = session.session.token; // cookie token, not row UUID
const csrfToken = await deriveCsrfToken(`csrf:v1:${sessionToken}`, secret); // HMAC-SHA256(key=secret, message="csrf:v1:{token}") → hex
c.header('Set-Cookie', buildCsrfCookie(csrfToken), { append: true });
c.header('Cache-Control', 'no-store, no-cache');
c.set('csrfToken', csrfToken);
await next();
```

App page handlers that render logout buttons access `c.get('csrfToken')` and embed it in the form's hidden `_csrf` field. The `AppEnv` type must be extended with `Variables: { user: AuthUser; session: AuthSession; csrfToken: string }`. The `requireAuth.spec.ts` tests must assert that the CSRF token is set on the context and the `__Secure-csrf` cookie is present in the response for authenticated requests.

**Note**: The vance-ts reference implementation avoids this gap because its `LoginUseCase` returns a session-paired CSRF token that is set as a cookie on login success and persists for the session. The better-auth approach (which uses better-auth's internal session management) requires the `requireAuth` middleware to handle this instead.

---

## Edge Cases & Error Handling

### D1 Unavailability

The spec lists "How does the system behave when the database is temporarily unavailable during sign-in?" as an open edge case — the plan must answer it.

**`requireAuth` middleware**: Wrap `auth.api.getSession` in `try/catch`. On exception, log the error (no PII) and return 503 with `Retry-After: 30` header and a user-facing "Authentication service temporarily unavailable" message. Do not expose the underlying error.

**`handlePostSignIn` / `handlePostSignUp`**: Distinguish error classes from `auth.api.*`:

- Status 429 → render rate limit message
- Status 5xx → return 503 ("Service temporarily unavailable") — do NOT show "Invalid email or password"
- Status 400/401/403 (auth failure) → render "Invalid email or password"

Add test cases for each mock response status.

### `requireAuth` Redirect Response

The plan's `requireAuth` code calls `c.header(...)`, `c.status(302)`, and `return` (void). Hono requires middleware that terminates the chain to return a `Response` object.

**Required fix**: Use `return c.redirect(\`/auth/sign-in?redirectTo=${redirectTo}\`, 302)`instead of manual header-setting + void return. Update spec to assert`response.status === 302`and`response.headers.get('location')` contains the correct path.

### Session TTL (Fixed)

`expiresIn` is set to `2_592_000` (30 days) matching the spec clarification. `Out of Scope` no longer lists "persistent sessions beyond 7 days." Test `auth.spec.ts` should assert the exact value of `expiresIn` to prevent future regression.

### Concurrent Sessions

The spec asks "What is the behavior when the same user logs in from multiple devices simultaneously?" — decision: **unlimited concurrent sessions are allowed** (better-auth default). No per-user session cap is enforced in this iteration. This must be documented as a Key Design Decision (added below) so a future "log out all devices" feature can plan the required schema changes.

### User-Agent Header Length Not Bounded (Resolved)

The `session.userAgent` column stores the client-provided `User-Agent` request header. Better-auth reads this header directly and inserts it into the session row without documented truncation. A Cloudflare Worker accepts up to 16KB of headers; an attacker sending an inflated `User-Agent` on every login request can bloat D1 session rows and inflate storage costs.

**Required**: Before delegating to `auth.handler()` in the `/api/auth/*` route, and before calling `auth.api.*` in HTML handlers, ensure the `User-Agent` header is truncated to 500 characters AND control characters are stripped: `userAgent.replace(/[\x00-\x1F\x7F]/g, '')` after truncation. This sanitization runs parallel to `sanitizeIp()` — document both in `extractClientIp.ts` or a shared `sanitize.ts` utility. One approach: construct a synthetic `Request` with the header rewritten before passing to better-auth. Test: create a session with a 10,000-character User-Agent and assert the stored value is ≤ 500 characters; test with newlines/control characters in User-Agent and assert they are stripped.

**Resolved**: Before delegating to `authHandler` in the `/api/auth/*` route (via `getServiceFactory(c.env).authHandler`), construct a synthetic `Request` with the `User-Agent` header rewritten: truncate to 500 characters and strip control characters via `userAgent.slice(0, 500).replace(/[\x00-\x1F\x7F]/g, '')`. Apply the same sanitization before calling `auth.api.*` in HTML handlers. Implement in a shared `sanitize.ts` utility alongside `sanitizeIp()`.

### `redirectTo` Preservation Through Register→Sign-In Flow (Medium)

The `requireAuth` middleware captures the original requested URL and redirects to `/auth/sign-in?redirectTo=/app/foo`. However, the sign-in page template's "Create account" link points to `/auth/sign-up` without forwarding the `redirectTo` parameter. Once the user navigates to registration, the original destination is lost:

1. User visits `/app/dashboard` → redirected to `/auth/sign-in?redirectTo=/app/dashboard`
2. User clicks "Create account" → navigates to `/auth/sign-up` (no `redirectTo`)
3. Registration succeeds → user is redirected to `/auth/sign-in` (no `redirectTo`)
4. User signs in → redirected to `/` (default), not `/app/dashboard`

**Required**:

- `login.ts` template: Accept `redirectTo?: string` prop and include it in the "Create account" link: `href="/auth/sign-up?redirectTo=${encodeURIComponent(redirectTo)}"`
- `register.ts` template: Accept `redirectTo?: string` prop and render it as a hidden field AND include it in the sign-in link
- `handleGetSignUp` and `handlePostSignUp`: Extract `redirectTo` from query string and pass it through to the rendered template and the redirect-to-sign-in response
- On successful registration, redirect to `/auth/sign-in?redirectTo=${redirectTo}&registered=1` (preserving destination + triggering success banner)
- Test: simulate the full unauthenticated-user → sign-in page → register page → sign-in page → app flow and assert the user ends up at the original destination

### Content-Type Validation on POST Handlers (Medium)

`handlePostSignIn` and `handlePostSignUp` call `request.formData()` without validating the `Content-Type` header first. The body size check (Content-Length → 413) does not prevent a request with `Content-Type: application/json` or `Content-Type: multipart/form-data` from reaching `formData()`. On an unexpected Content-Type, `formData()` may throw or return empty fields, producing an unhandled error path (potential 500 with stack trace in local dev; generic error in prod).

**Required**: At the start of `handlePostSignIn` and `handlePostSignUp`, check that `Content-Type` starts with `application/x-www-form-urlencoded`. If not, return `415 Unsupported Media Type` immediately (before any parsing). Test with `Content-Type: application/json` and `Content-Type: multipart/form-data`.

### Account Deletion with Active Sessions (Medium — spec open question resolved)

The spec lists "What happens if a user's account is deleted while they have an active session?" The D1 schema answers this via `ON DELETE CASCADE`: `session.userId REFERENCES user(id) ON DELETE CASCADE`. When a user row is deleted, all associated session rows are automatically removed from D1. The next call to `auth.api.getSession` in `requireAuth` returns `null`, and the middleware redirects to `/auth/sign-in`. No additional code is required. Document as a Key Design Decision.

---

## Performance Considerations

### Session Validation Latency

Every request to `/app/*` calls `auth.api.getSession`, which queries D1 (~5ms per call). This is acceptable for the current scale. If D1 latency becomes a bottleneck, a KV cache keyed by session token (TTL = 60s) can be layered in front of the D1 check without schema changes.

### KV Rate Limiter Overhead

The KV-backed rate limiter adds one KV read + one KV write per auth attempt. KV reads are low-latency (~1ms). The write is the counter increment. This is acceptable — rate limiting only runs on auth endpoints, not on every request.

### Expired Session Row Accumulation (High)

D1 has no TTL on rows. Sessions expire when `expiresAt < NOW` (checked by better-auth on each `getSession` call), but expired rows are never automatically deleted unless the user explicitly signs out (which runs `DELETE FROM session WHERE token = ?`). With a 30-day TTL, every login that does not end in an explicit logout leaves a dead row in the session table indefinitely. Over time this degrades UNIQUE index scan performance on the `token` column and consumes D1 storage unnecessarily.

**Required**: Verify whether better-auth v1.4.x includes a session cleanup mechanism (e.g., `deleteExpiredSessions` plugin option). If not:

- Add a `scheduled` export to `src/worker.ts` (Cloudflare Workers cron trigger)
- Handler runs: `db.prepare("DELETE FROM session WHERE expiresAt < datetime('now')").run()`
- Configure the trigger in `wrangler.toml` (e.g., `[triggers] crons = ["0 3 * * *"]`)
- Write a unit test for the cleanup handler against a mocked D1 binding

---

## Accessibility Requirements

### Form Error Announcements

When a form POST fails and the page re-renders with error messages, screen readers do not automatically detect new content unless the error container uses an ARIA live region.

**Required**: In `login.ts` and `register.ts` templates:

- Wrap the global error message in `<div role="alert">` (or `aria-live="assertive"`)
- Wrap per-field errors in `<span role="alert" id="field-error-{name}">`
- Associate each error span with its input via `aria-describedby="field-error-{name}"`

**Test requirement**: `login.spec.ts` and `register.spec.ts` must assert `role="alert"` is present on the error container when `error` is set, and absent when no error is set.

### Form Labels and Input Association

All form inputs must have explicit `<label for="...">` associations (not implicit wrapping). WCAG 2.1 AA requires this. Add test assertions that each input (`email`, `password`, `csrfToken`) has a matching `<label for>` in the rendered HTML.

### Autocomplete Attributes on Form Fields (Medium)

Neither the login nor register templates specify `autocomplete` attributes. Password managers and assistive technologies (iOS VoiceOver, Windows Narrator, browser autofill) rely on `autocomplete` to correctly identify field purpose, trigger autofill, and enable biometric unlock. Missing `autocomplete` degrades usability for low-vision users who rely on autofill and assistive technology users who depend on password managers.

**Required**:

- `login.ts`: `<input type="email" autocomplete="email">`, `<input type="password" autocomplete="current-password">`
- `register.ts`: `<input type="email" autocomplete="email">`, `<input type="password" autocomplete="new-password">`
- Add test assertions verifying `autocomplete` attribute values in rendered HTML output (`.spec.ts` files)

### Error Container DOM Order (Medium)

When a form POST fails and the page re-renders, `role="alert"` announces errors to screen reader users. For keyboard-only non-screen-reader users, the error summary must appear early in the DOM tab order — reachable without tabbing through all form fields first. If the error container is placed after the form inputs in the HTML source, keyboard users encounter the form fields before the error explanation.

**Required**: The error container (`<div role="alert">`) must appear in the HTML source **before** the first `<input>` element. Add test assertions that, when `error` is set, the `role="alert"` element's position in the rendered HTML string is lower (earlier) than the position of the email `<input>`.

---

## Key Design Decisions (additions)

| Decision                     | Choice                                                     | Rationale                                                                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rate limiting storage**    | Cloudflare KV (`RATE_LIMIT` namespace)                     | In-memory rate limiting is non-functional across Workers isolates and edge nodes; KV provides distributed, TTL-keyed counters (red team finding #1)                       |
| **Concurrent sessions**      | Unlimited (better-auth default)                            | Supports multi-device use; no product requirement for session cap; document for future "log out all" feature                                                              |
| **Account deletion cascade** | D1 `ON DELETE CASCADE` on `session.userId → user(id)`      | Sessions for deleted users are removed automatically; `getSession` returns null on next request, middleware redirects to sign-in; no explicit invalidation logic required |
| **KV rate limiting scope**   | Applied to both HTML handlers and `/api/auth/*` middleware | Direct JSON API access must share the same per-IP counters as HTML form handlers to prevent rate limit bypass                                                             |

---

## Out of Scope

- Email verification
- Password reset via email
- Admin roles / permissions
- Two-factor authentication
- Account deletion
- Profile management (name, avatar)
- Remember-me tokens (separate from the 30-day session cookie)
