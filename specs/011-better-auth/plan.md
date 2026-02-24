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

| Complexity Item                           | Justification                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Adding `drizzle-orm` runtime dependency   | Required by better-auth's officially documented D1 adapter; no simpler alternative                                        |
| `di/serviceFactory.ts` (new directory)    | Composition root for wiring better-auth + auth handlers; follows vance-ts pattern; single location for cross-layer wiring |
| Double-submit CSRF for HTML form handlers | better-auth's built-in CSRF covers `/api/auth/*` only; HTML form handlers need their own CSRF; defense-in-depth           |

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
│   └── auth.ts              ← NEW: better-auth factory (getAuth, resetAuth for tests)
│
├── presentation/
│   ├── handlers/
│   │   └── AuthPageHandlers.ts   ← NEW: GET/POST /auth/login|register|logout
│   ├── middleware/
│   │   └── requireAuth.ts        ← NEW: Hono middleware for protected routes
│   ├── templates/
│   │   └── pages/
│   │       ├── login.ts          ← NEW: Login form HTML template
│   │       └── register.ts       ← NEW: Register form HTML template
│   └── utils/
│       ├── cookieBuilder.ts      ← NEW: Build/clear CSRF cookies
│       └── extractClientIp.ts    ← NEW: Extract CF-Connecting-IP / X-Forwarded-For
│
├── domain/
│   └── value-objects/
│       └── common-passwords.ts   ← PORTED from vance-ts (Set<string> of banned passwords)
│
├── di/
│   └── serviceFactory.ts         ← NEW: Composition root (getServiceFactory, resetServiceFactory)
│
└── worker.ts                     ← MODIFIED: Add auth routes + requireAuth middleware

migrations/
└── 0001_better_auth_schema.sql   ← NEW: better-auth schema for D1
```

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
  readonly BETTER_AUTH_SECRET: string; // Min 32-char secret for token signing
}
```

#### 1.2 Port `src/domain/value-objects/common-passwords.ts`

Port the `COMMON_PASSWORDS: Set<string>` export from `~/vance-ts/src/domain/value-objects/common-passwords.ts`. This is the list of ~100 common passwords checked during registration.

Write `.spec.ts` test first (TDD).

#### 1.3 Create `src/infrastructure/auth.ts`

Better-auth factory with isolate-scoped caching:

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import type { Env } from './env';
import { COMMON_PASSWORDS } from '../domain/value-objects/common-passwords';

let _auth: ReturnType<typeof betterAuth> | null = null;

export function getAuth(env: Env): ReturnType<typeof betterAuth> {
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
    },
    rateLimit: {
      enabled: true,
      window: 15 * 60,
      max: 5,
    },
  });
  return _auth;
}

export function resetAuth(): void {
  _auth = null; // For test isolation
}
```

**TDD requirement**: Write `auth.spec.ts` that mocks the D1 binding and verifies the factory creates and caches the auth instance.

#### 1.4 Create D1 Migration

Generate via CLI and store as `migrations/0001_better_auth_schema.sql`. Apply locally with `wrangler d1 migrations apply turtlebased-db --local`.

---

### Phase 2: Presentation — HTML Templates

**Goal**: Build server-rendered login and register pages.

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

### Phase 3: Presentation — Auth Page Handlers

**Goal**: Custom Hono handlers for HTML form flows.

#### 3.1 Create `src/presentation/utils/cookieBuilder.ts`

Ported and adapted from `~/vance-ts/src/presentation/utils/cookieBuilder.ts`. Expose:

- `buildCsrfCookie(token: string): string` — builds `Set-Cookie` header value
- `clearCsrfCookie(): string` — builds clearing `Set-Cookie` header value
- `extractCsrfTokenFromCookies(cookieHeader: string | null): string | null`

Write `.spec.ts` first.

#### 3.2 Create `src/presentation/utils/extractClientIp.ts`

Ported from `~/vance-ts/src/presentation/utils/extractClientIp.ts`. Extracts `CF-Connecting-IP` (preferred) or `X-Forwarded-For` from request headers.

Write `.spec.ts` first.

#### 3.3 Create `src/presentation/middleware/requireAuth.ts`

```typescript
import type { Context, Next } from 'hono';
import type { AppEnv } from '../../worker';
import { getAuth } from '../../infrastructure/auth';

export async function requireAuth(c: Context<AppEnv>, next: Next): Promise<void> {
  const auth = getAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (session === null) {
    const url = new URL(c.req.url);
    const redirectTo = encodeURIComponent(url.pathname + url.search);
    c.header('Location', `/auth/login?redirectTo=${redirectTo}`);
    c.status(302);
    return;
  }
  c.set('user', session.user);
  c.set('session', session.session);
  await next();
}
```

Write `.spec.ts` testing: no session → redirect with preserving URL; valid session → next called.

#### 3.4 Create `src/presentation/handlers/AuthPageHandlers.ts`

Handles all HTML auth page requests. Uses the bridge pattern to call better-auth's internal API.

**Methods**:

- `handleGetLogin(env, request) → Response` — Serve login page + set CSRF cookie
- `handlePostLogin(env, request) → Promise<Response>` — CSRF check → `auth.api.signInEmail` → redirect or re-render
- `handleGetRegister(env, request) → Response` — Serve register page + set CSRF cookie
- `handlePostRegister(env, request) → Promise<Response>` — CSRF check → `auth.api.signUpEmail` → redirect to login
- `handlePostLogout(env, request) → Promise<Response>` — CSRF check → `auth.api.signOut` → redirect to login

**Error normalisation for login**:

- On any auth failure from better-auth: display `"Invalid email or password"` regardless of actual error
- Only `429 Too Many Requests` from better-auth displays rate limit message
- Log actual error internally (no PII)

**Redirect validation** for `redirectTo`:

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
import { getAuth } from '../infrastructure/auth';
import { AuthPageHandlers } from '../presentation/handlers/AuthPageHandlers';

export class ServiceFactory {
  private readonly env: Env;
  private _authPageHandlers: AuthPageHandlers | null = null;

  constructor(env: Env) {
    this.env = env;
  }

  get auth(): ReturnType<typeof getAuth> {
    return getAuth(this.env);
  }

  get authPageHandlers(): AuthPageHandlers {
    this._authPageHandlers ??= new AuthPageHandlers(this.env);
    return this._authPageHandlers;
  }
}

let _factory: ServiceFactory | null = null;

export function getServiceFactory(env: Env): ServiceFactory {
  _factory ??= new ServiceFactory(env);
  return _factory;
}

export function resetServiceFactory(): void {
  _factory = null;
}
```

Write `.spec.ts` verifying singleton behaviour and reset.

---

### Phase 5: Routing — Update `src/worker.ts`

**Goal**: Add auth routes and protected route middleware.

```typescript
import { requireAuth } from './presentation/middleware/requireAuth';
import { getServiceFactory } from './di/serviceFactory';

// Better-auth API (JSON, OAuth callbacks, etc.)
app.on(['GET', 'POST'], '/api/auth/*', async (c) => {
  const { auth } = getServiceFactory(c.env);
  return auth.handler(c.req.raw);
});

// HTML auth pages
app.get('/auth/login', (c) => {
  return getServiceFactory(c.env).authPageHandlers.handleGetLogin(c.env, c.req.raw);
});
app.post('/auth/login', async (c) => {
  return getServiceFactory(c.env).authPageHandlers.handlePostLogin(c.env, c.req.raw);
});
app.get('/auth/register', (c) => {
  return getServiceFactory(c.env).authPageHandlers.handleGetRegister(c.env, c.req.raw);
});
app.post('/auth/register', async (c) => {
  return getServiceFactory(c.env).authPageHandlers.handlePostRegister(c.env, c.req.raw);
});
app.post('/auth/logout', async (c) => {
  return getServiceFactory(c.env).authPageHandlers.handlePostLogout(c.env, c.req.raw);
});

// Protected application routes
app.use('/app/*', requireAuth);
```

Security headers middleware is extended to cover `/auth/*` routes.

Update `worker.spec.ts` to cover new routes.

---

## Key Design Decisions

| Decision                | Choice                                         | Rationale                                                        |
| ----------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| **Auth library**        | better-auth                                    | Required by spec; OAuth extensibility                            |
| **D1 adapter**          | drizzle-orm/d1                                 | Officially documented for D1; no viable alternative              |
| **Session storage**     | D1 (via better-auth)                           | Better-auth manages the session table; simpler than separate KV  |
| **HTML form bridge**    | Call `auth.api.*` with `asResponse: true`      | Keeps server-rendered HTML; delegates auth to better-auth        |
| **CSRF for HTML forms** | Double-submit cookie pattern                   | better-auth CSRF covers `/api/auth/*` only; defense-in-depth     |
| **Password strength**   | `password.validate` hook with common-passwords | NIST 800-63B: length + breach check, no complexity rules         |
| **Error messages**      | Normalise to generic message                   | Prevent email enumeration (FR-007)                               |
| **Rate limiting**       | better-auth built-in (in-memory)               | Simpler; acceptable for this iteration                           |
| **Common passwords**    | Ported from vance-ts                           | Battle-tested; already has spec                                  |
| **Session TTL**         | 30 days + 1-day refresh                        | Spec-mandated (clarification 2026-02-24); `expiresIn: 2_592_000` |
| **OAuth extensibility** | Config-only via `socialProviders`              | FR-010: no structural changes needed for OAuth                   |

---

## Testing Strategy

### Workers Project (`src/**/*.spec.ts`)

All new files get corresponding `.spec.ts` files. 100% branch coverage is targeted (Workers runtime; no v8 coverage report — see CLAUDE.md).

| File                                             | Test Focus                                            |
| ------------------------------------------------ | ----------------------------------------------------- |
| `infrastructure/auth.spec.ts`                    | Factory creates/caches auth; reset works              |
| `domain/value-objects/common-passwords.spec.ts`  | Common passwords are in the Set                       |
| `presentation/utils/cookieBuilder.spec.ts`       | Cookie header format; clear cookie                    |
| `presentation/utils/extractClientIp.spec.ts`     | CF-Connecting-IP; X-Forwarded-For fallback            |
| `presentation/middleware/requireAuth.spec.ts`    | Redirect on no session; next() on valid session       |
| `presentation/handlers/AuthPageHandlers.spec.ts` | CSRF validation; auth success/failure; redirect logic |
| `presentation/templates/pages/login.spec.ts`     | HTML output; escaping; fields                         |
| `presentation/templates/pages/register.spec.ts`  | HTML output; escaping; field errors                   |
| `di/serviceFactory.spec.ts`                      | Singleton; reset                                      |
| `worker.spec.ts`                                 | Route existence for all auth routes                   |

### Mock Strategy

- Better-auth internal API: Mock `auth.api.signInEmail`, `auth.api.signUpEmail`, `auth.api.signOut`, `auth.api.getSession`
- D1 binding: Use vitest-pool-workers D1 fixture or a stub object

---

## Security Checklist

- [ ] **Email enumeration** (FR-007): Login failures always show `"Invalid email or password"` (tested in `AuthPageHandlers.spec.ts`)
- [ ] **CSRF** (FR-011): Double-submit CSRF on all POST HTML form handlers
- [ ] **Open redirect** (FR-005): `redirectTo` validated as relative path before use
- [ ] **Password strength** (FR-008): 12-128 chars, common passwords rejected
- [ ] **Rate limiting** (FR-006): better-auth built-in rate limiting active
- [ ] **Session invalidation** (FR-009): better-auth deletes session row from D1 on logout
- [ ] **Security headers** (FR-011): `applySecurityHeaders()` applied to all auth responses
- [ ] **Secure cookies**: `useSecureCookies` enabled in non-localhost environments
- [ ] **XSS prevention**: All user-supplied values HTML-escaped in templates via `escapeHtml()`
- [ ] **Security logging** (FR-012): Failed logins logged via `console.log` with IP only (no passwords/emails in logs)

---

## Complexity Tracking

| Item                             | Why Needed                                     | Simpler Alternative Rejected Because                                            |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| `drizzle-orm` runtime dependency | better-auth D1 adapter requires it             | No officially supported D1-native better-auth adapter exists                    |
| `di/serviceFactory.ts` directory | Single composition root for cross-layer wiring | Inline factory in worker.ts would violate single-responsibility; harder to test |
| Double-submit CSRF               | HTML form handlers need own CSRF               | better-auth only covers its `/api/auth/*` endpoints                             |

---

## Phase 0.5: Applied Learnings

No prior solution documents exist yet in `.specify/solutions/`. This feature will generate learnings to capture after implementation.

---

## Security Considerations

### Rate Limiting (Distributed — Critical)

Better-auth's built-in `rateLimit` is **in-memory** and does not survive isolate restarts. Cloudflare Workers spawns V8 isolates across hundreds of global edge nodes; each isolate holds its own independent counter. This makes in-memory rate limiting functionally ineffective against any distributed brute-force attempt — FR-006 and SC-003 cannot be met with the in-memory option.

**Required implementation**: Replace with a **KV-backed rate limiter** in `src/infrastructure/rateLimiter.ts`:

- Key format: `ratelimit:{endpoint}:{ip}` (e.g., `ratelimit:sign-in:1.2.3.4`)
- KV TTL equals the rate limit window (15 min for sign-in, 5 min for registration)
- Counter is incremented atomically using KV's `put` with `{ expirationTtl }` (KV has no atomic increment; use a read-increment-write with `metadata` version check or accept the small race, which is safe enough for rate limiting)
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

### IP Address Extraction for Rate Limiting

`extractClientIp.ts` falls back to `X-Forwarded-For` — a client-controlled header. Better-auth's internal IP extraction may also use `X-Forwarded-For` independently, which would allow rate limit bypass via IP spoofing.

**Required**: Configure better-auth explicitly to read `CF-Connecting-IP` only. In `getAuth(env)`, set `advanced: { ipAddress: { ipAddressHeaders: ['CF-Connecting-IP'] } }` (verify exact field name against installed v1.4.x). Remove the `X-Forwarded-For` fallback from `extractClientIp.ts` (or keep it only for local dev detection, never for rate limiting). Add a test asserting that a spoofed `X-Forwarded-For` with a valid `CF-Connecting-IP` correctly identifies the CF IP.

### CSRF Token Expiry

Double-submit CSRF tokens set without a `Max-Age` become session cookies (cleared only on browser close). A token open for hours is functionally permanent. If a CSRF token value is captured from a response log, it remains valid indefinitely.

**Required**: Add `Max-Age=3600` to the CSRF cookie in `buildCsrfCookie()`. On CSRF validation failure in handlers, re-serve the form with a fresh token (HTTP 200 + new CSRF cookie) rather than returning a bare 403 — this handles the case where the user's token expired while the form was open. Document the expiry in data-model.md CSRF State section.

### Log Injection via IP

`console.log` of security events uses the IP from `extractClientIp.ts`. In local dev or spoofed `X-Forwarded-For` scenarios, the IP is client-controlled and could contain newlines or log-format characters.

**Required**: Add a `sanitizeIp(raw: string): string` function in `extractClientIp.ts` that strips all characters not matching `/^[0-9A-Fa-f:.]{1,45}$/`; returns `"unknown"` if the result is empty or oversized. Test with newline, tab, and oversized input.

### Request Body Size Limits

No maximum body size is defined for auth POST endpoints. A very large body is parsed into memory before `maxPasswordLength: 128` is enforced.

**Required**: In `handlePostLogin` and `handlePostRegister`, check `Content-Length` header before parsing; reject with 413 if over 4KB. After parsing, enforce: `email` ≤ 254 chars (RFC 5321), `password` ≤ 128 chars. Document these limits in contracts/auth-endpoints.md.

### Email Case Normalisation

D1's `UNIQUE` constraint on the `email` column is case-sensitive by default. If better-auth does not lowercase on insert, `User@Example.com` and `user@example.com` can create separate accounts.

**Required**: Set `emailAndPassword: { normalizeEmail: true }` in the better-auth config (verify v1.4.x API). If unsupported, add `.toLowerCase().trim()` preprocessing in handlers before calling `auth.api.*`. Test that `USER@EXAMPLE.COM` is treated identically to `user@example.com`.

### `/api/auth/*` JSON API Bypasses KV Rate Limiter (Critical)

The KV-backed rate limiter (required finding above) is applied only inside `handlePostLogin` and `handlePostRegister`. However, better-auth's JSON API is mounted directly: `app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))`. An attacker can bypass the custom KV rate limiter entirely by POSTing directly to `POST /api/auth/sign-in/email` or `POST /api/auth/sign-up/email` with JSON credentials — the HTML form path is irrelevant. Better-auth's in-memory rate limiter does not stop distributed brute-force attempts. **FR-006 and SC-003 cannot be met without addressing this.**

**Required**: Add Hono middleware placed BEFORE the `app.on('/api/auth/*', ...)` delegation that intercepts specific auth API paths:

- `POST /api/auth/sign-in/email` → check and increment `ratelimit:sign-in:{ip}` in KV (same key as HTML handler; both paths count toward the shared limit)
- `POST /api/auth/sign-up/email` → check and increment `ratelimit:register:{ip}` in KV
- Return 429 with `Retry-After` header if limit exceeded; otherwise pass through to `auth.handler()`
- Test: after 5 failed HTML form attempts, a direct JSON POST to `/api/auth/sign-in/email` must be rejected with 429

### Rate Limit Contract Discrepancy (High)

`contracts/auth-endpoints.md` Rate Limits table contains values inconsistent with FR-006 and acceptance scenario US1-5:

| Endpoint                     | contracts/auth-endpoints.md | FR-006 (authoritative) |
| ---------------------------- | --------------------------- | ---------------------- |
| POST /auth/register          | 1 hour / 3 attempts         | **5 min / 5 attempts** |
| POST /api/auth/sign-up/email | 1 hour / 3 attempts         | **5 min / 5 attempts** |

**Required**: Update `contracts/auth-endpoints.md` Rate Limits table to match FR-006 before task generation. The KV rate limiter implementation must use the spec values (5-minute window, max 5 attempts) for registration endpoints. A developer implementing from the contracts file alone would build the wrong rate limits.

---

## Edge Cases & Error Handling

### D1 Unavailability

The spec lists "How does the system behave when the database is temporarily unavailable during sign-in?" as an open edge case — the plan must answer it.

**`requireAuth` middleware**: Wrap `auth.api.getSession` in `try/catch`. On exception, log the error (no PII) and return 503 with `Retry-After: 30` header and a user-facing "Authentication service temporarily unavailable" message. Do not expose the underlying error.

**`handlePostLogin` / `handlePostRegister`**: Distinguish error classes from `auth.api.*`:

- Status 429 → render rate limit message
- Status 5xx → return 503 ("Service temporarily unavailable") — do NOT show "Invalid email or password"
- Status 400/401/403 (auth failure) → render "Invalid email or password"

Add test cases for each mock response status.

### `requireAuth` Redirect Response

The plan's `requireAuth` code calls `c.header(...)`, `c.status(302)`, and `return` (void). Hono requires middleware that terminates the chain to return a `Response` object.

**Required fix**: Use `return c.redirect(\`/auth/login?redirectTo=${redirectTo}\`, 302)`instead of manual header-setting + void return. Update spec to assert`response.status === 302`and`response.headers.get('location')` contains the correct path.

### Session TTL (Fixed)

`expiresIn` is set to `2_592_000` (30 days) matching the spec clarification. `Out of Scope` no longer lists "persistent sessions beyond 7 days." Test `auth.spec.ts` should assert the exact value of `expiresIn` to prevent future regression.

### Concurrent Sessions

The spec asks "What is the behavior when the same user logs in from multiple devices simultaneously?" — decision: **unlimited concurrent sessions are allowed** (better-auth default). No per-user session cap is enforced in this iteration. This must be documented as a Key Design Decision (added below) so a future "log out all devices" feature can plan the required schema changes.

### User-Agent Header Length Not Bounded (High)

The `session.userAgent` column stores the client-provided `User-Agent` request header. Better-auth reads this header directly and inserts it into the session row without documented truncation. A Cloudflare Worker accepts up to 16KB of headers; an attacker sending an inflated `User-Agent` on every login request can bloat D1 session rows and inflate storage costs.

**Required**: Before delegating to `auth.handler()` in the `/api/auth/*` route, and before calling `auth.api.*` in HTML handlers, ensure the `User-Agent` header is truncated to 500 characters. One approach: construct a synthetic `Request` with the header rewritten before passing to better-auth. Test: create a session with a 10,000-character User-Agent and assert the stored value is ≤ 500 characters.

### Content-Type Validation on POST Handlers (Medium)

`handlePostLogin` and `handlePostRegister` call `request.formData()` without validating the `Content-Type` header first. The body size check (Content-Length → 413) does not prevent a request with `Content-Type: application/json` or `Content-Type: multipart/form-data` from reaching `formData()`. On an unexpected Content-Type, `formData()` may throw or return empty fields, producing an unhandled error path (potential 500 with stack trace in local dev; generic error in prod).

**Required**: At the start of `handlePostLogin` and `handlePostRegister`, check that `Content-Type` starts with `application/x-www-form-urlencoded`. If not, return `415 Unsupported Media Type` immediately (before any parsing). Test with `Content-Type: application/json` and `Content-Type: multipart/form-data`.

### Account Deletion with Active Sessions (Medium — spec open question resolved)

The spec lists "What happens if a user's account is deleted while they have an active session?" The D1 schema answers this via `ON DELETE CASCADE`: `session.userId REFERENCES user(id) ON DELETE CASCADE`. When a user row is deleted, all associated session rows are automatically removed from D1. The next call to `auth.api.getSession` in `requireAuth` returns `null`, and the middleware redirects to `/auth/login`. No additional code is required. Document as a Key Design Decision.

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
