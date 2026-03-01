# Research: User Authentication (011-better-auth)

**Date**: 2026-02-23
**Phase**: Phase 0 — Outline & Research

---

## Decision 1: Better-Auth as the Authentication Library

**Decision**: Use `better-auth` as the primary authentication library per the feature spec.

**Rationale**: The feature spec explicitly requires better-auth. It provides:

- Built-in email/password authentication with secure defaults
- Session management (cookie-based, D1-backed)
- OAuth extensibility via config-only provider additions (satisfies FR-010)
- Built-in rate limiting (satisfies FR-006)
- Built-in CSRF protection for its own API endpoints
- Active maintenance and Cloudflare Workers compatibility

**Alternatives considered**:

- **Port vance-ts architecture (manual)**: No better-auth dependency; full control. Rejected because spec requires better-auth.
- **Passport.js**: Node.js-centric, not Workers-compatible. Rejected.
- **Lucia Auth**: Deprecated as of 2025. Rejected.

---

## Decision 2: D1 Adapter via Drizzle ORM

**Decision**: Use `drizzle-orm` with `drizzle-orm/d1` as the database adapter for better-auth.

**Rationale**: The officially documented and recommended path for better-auth + Cloudflare D1. The `drizzle-orm/d1` dialect correctly handles D1's SQLite dialect. Direct D1 adapters for better-auth without Drizzle are not officially supported.

**Dependencies added**: `drizzle-orm` (production dependency).

**Alternatives considered**:

- **No ORM (raw D1 prepared statements)**: Not supported by better-auth's adapter API.
- **Prisma**: Heavy runtime, not Workers-compatible.
- **better-auth-cloudflare (community)**: Unmaintained, small community, less reliable.

---

## Decision 3: HTML Form Handler Bridge Pattern

**Decision**: Custom Hono handlers at `/auth/sign-in`, `/auth/sign-up`, `/auth/sign-out` call better-auth's internal API (`auth.api.signInEmail`, etc.) with `asResponse: true`, then forward Set-Cookie headers and redirect.

**Rationale**: Our app is server-rendered (HTML + HTMX). Better-auth natively exposes a JSON API at `/api/auth/*`. The bridge pattern lets us:

- Keep server-side HTML rendering (login/register page templates)
- Use better-auth for auth logic (password hashing, sessions, rate limiting)
- Handle post-login redirects server-side
- Forward better-auth's session cookies to the browser

**Flow**:

```
Browser POST /auth/sign-in (form)
  → AuthPageHandlers.handlePostSignIn()
    → Validate CSRF (double-submit cookie)
    → auth.api.signInEmail({ body, asResponse: true })
      → Returns Response with Set-Cookie headers
    → Extract Set-Cookie headers
    → Return 303 redirect + cookies
  → Browser follows redirect
```

**Alternatives considered**:

- **Client-side fetch to `/api/auth/*`**: Requires more Alpine.js, breaks progressive enhancement, doesn't handle server-side redirects naturally.
- **Direct form POST to `/api/auth/sign-in`**: Returns JSON, not a redirect; requires client-side redirect handling.
- **Proxy handler that rewrites JSON response**: Complex; same result as bridge pattern.

---

## Decision 4: Double-Submit CSRF for HTML Form Handlers

**Decision**: Implement double-submit CSRF token pattern (same as vance-ts) for custom HTML form handlers (`/auth/sign-in`, `/auth/sign-up`, `/auth/sign-out`).

**Rationale**: Better-auth's built-in CSRF protection covers its own `/api/auth/*` endpoints but not our custom HTML form endpoints. The double-submit cookie pattern:

- Generates a secure random token on each form page load
- Sets token in both a cookie and a hidden form field
- Validates both match on POST
- Is simple, stateless, and battle-tested

Better-auth sessions use `SameSite=Lax` which prevents cross-origin cookie submission, providing base CSRF protection. Double-submit adds defense-in-depth.

**Alternatives considered**:

- **Rely on SameSite=Lax only**: Adequate for modern browsers but not defense-in-depth.
- **Synchronizer token (session-based)**: Requires session before CSRF validation — chicken-and-egg problem for login page.
- **Delegate to better-auth CSRF**: Only covers `/api/auth/*`, not our HTML handlers.

---

## Decision 5: Better-Auth Instance Factory (Cached per Isolate)

**Decision**: Create a `getAuth(env: Env)` factory function that lazily initialises and caches the better-auth instance at module scope. The cached instance is reused across requests within a Cloudflare Workers isolate.

**Rationale**: Better-auth needs runtime env bindings (D1, secrets) that are only available at request time — not at module initialization. The factory is called once per isolate (cold start), caching the instance for reuse. This is safe because `env` is stable within a Workers isolate.

**Implementation**:

```typescript
let _auth: ReturnType<typeof betterAuth> | null = null;

export function getAuth(env: Env): ReturnType<typeof betterAuth> {
  _auth ??= betterAuth({ database: drizzleAdapter(drizzle(env.DB), ...) });
  return _auth;
}
```

**Alternatives considered**:

- **Create auth per request**: Defeats caching; Drizzle instance re-created on every request.
- **Global module-level init**: Fails because `env.DB` is not available at module scope.

---

## Decision 6: Password Strength Enforcement via better-auth Plugin Hook

**Decision**: Configure better-auth's `emailAndPassword.password.validate` hook to enforce:

1. Minimum 12 characters (NIST 800-63B)
2. Maximum 128 characters
3. Reject common passwords (using vance-ts's `common-passwords.ts` list)

**Rationale**: Better-auth supports `minPasswordLength`/`maxPasswordLength` config and a `password.validate` async hook. The common passwords list from vance-ts (already tested) prevents the weakest passwords that meet length requirements.

**Alternatives considered**:

- **Client-side only validation**: Easily bypassed.
- **Add complexity requirements (upper/lower/number/symbol)**: NIST 800-63B recommends against complexity rules in favour of length + breach check.

---

## Decision 7: Error Message Normalisation (Email Enumeration Prevention)

**Decision**: Custom HTML form handlers always display the generic message "Invalid email or password" for any sign-in failure, regardless of better-auth's internal error.

**Rationale**: FR-007 explicitly prohibits revealing whether an email exists. Better-auth may return different error codes/messages for "user not found" vs "wrong password". We normalise all non-rate-limit auth failures to the same generic message in our handler.

**Implementation**: Check `authResponse.ok`. If `false`, log the actual error internally (no PII), display generic message to user.

---

## Decision 8: Session Storage in D1 (Not KV)

**Decision**: Use D1 for session storage as better-auth manages (rather than KV as vance-ts does).

**Rationale**: Better-auth's D1 adapter creates and manages the `session` table. This eliminates the need for a separate KV namespace for sessions, simplifying the infrastructure. D1 sessions support:

- Expiry via `expiresAt` column (queried by better-auth)
- Session lookup by token
- Session deletion on logout
- User-to-sessions lookup

**Trade-off**: KV has automatic TTL deletion; D1 sessions require periodic cleanup. Better-auth handles session validation via `expiresAt` checks, and can be configured to periodically purge expired sessions.

**Alternatives considered**:

- **KV sessions (like vance-ts)**: Would require bypassing better-auth's session management.
- **Durable Objects**: Overkill for session storage at this scale.

---

## Decision 9: No Email Verification (as specified)

**Decision**: Configure `emailAndPassword.requireEmailVerification: false`.

**Rationale**: FR-013 and the interview answer both confirm: users sign in immediately after registering. No email infrastructure needed.

---

## Decision 10: Security Headers Strategy

**Decision**: Apply security headers to all auth-related responses via the existing `applySecurityHeaders()` utility. The existing utility already covers standard headers (CSP, X-Frame-Options, etc.).

**Rationale**: Reuse existing infrastructure rather than adding new header logic. Auth page responses (HTML) and API responses both go through the same security headers middleware.

---

## Cloudflare Workers Compatibility Verified

- `better-auth` uses Web Standard APIs (no Node.js dependencies)
- `drizzle-orm/d1` uses the D1 binding API (Web Standard)
- `@noble/hashes` (used internally by better-auth) is Workers-compatible (loads without import errors; **Note**: pure-JS SHA operations take 200–500ms and may exceed Workers CPU time limits — plan.md §Password Hashing Algorithm Decision mandates PBKDF2 via Web Crypto (native C++, ~10–30ms). This claim refers to the package loading without import errors, not performance viability.)
- No `process.env` usage — all config via `env` parameter

---

## Package Versions (2026-02-23)

| Package            | Version           | Role                     |
| ------------------ | ----------------- | ------------------------ |
| `better-auth`      | `^1.4.18`         | Authentication framework |
| `drizzle-orm`      | `^0.44.0`         | D1 database adapter      |
| `@better-auth/cli` | latest (dev only) | Schema generation        |

---

## Open Items for Implementation

1. **Verify `auth.api.signInEmail` exact method name** — better-auth API names may differ by version; check installed version before implementing handlers. — **Blocking for Phase 2.5**: Verify by inspecting `node_modules/better-auth` exports or type definitions before implementing handlers.
2. **Test better-auth rate limiting in Workers runtime** — ~~in-memory rate limiting may not persist across isolates. Evaluate whether per-isolate rate limiting is acceptable or if KV-backed custom rate limiting is needed.~~ **Resolved**: custom KV-backed rate limiter replaces better-auth's in-memory limiter — see plan.md §Key Design Decisions
3. **Verify better-auth session cookie names** — ~~to implement accurate CSRF cookie patterns.~~ **Resolved**: see plan.md §Cookie Inventory and contracts/auth-endpoints.md
4. **Test `asResponse: true` Set-Cookie forwarding** — confirm Set-Cookie headers are present and properly formatted for browser consumption. — **Blocking for Phase 3**: Verify by writing a minimal test (or inspecting better-auth source) before implementing the response-forwarding logic in AuthPageHandlers.
