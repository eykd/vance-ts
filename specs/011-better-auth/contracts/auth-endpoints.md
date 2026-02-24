# Auth Endpoints Contract

**Feature**: 011-better-auth
**Date**: 2026-02-23

Two sets of endpoints exist:

1. **HTML Form Endpoints** (`/auth/*`) — server-rendered HTML, form submissions, redirects
2. **Better-Auth API Endpoints** (`/api/auth/*`) — JSON API managed entirely by better-auth

---

## HTML Form Endpoints (Custom Hono Handlers)

### GET /auth/sign-in

Renders the sign-in form page.

**Query Parameters**:

- `redirectTo` (optional) — URL-encoded path to redirect to after successful sign-in. Must be a relative path (validated server-side).
- `registered` (optional, `true`) — Show a success message if set (after successful registration).

**Response**: `200 OK`

```
Content-Type: text/html
Set-Cookie: __Secure-csrf={token}; HttpOnly; Secure; SameSite=Strict; Path=/auth
Cache-Control: no-store, no-cache
```

**Body**: HTML sign-in page with:

- Email input field
- Password input field
- Hidden `_csrf` field
- Hidden `redirectTo` field (if present in query string)

---

### POST /auth/sign-in

Authenticates the user and creates a session.

**Request**:

```
Content-Type: application/x-www-form-urlencoded

email={email}&password={password}&_csrf={token}&redirectTo={path}
```

**CSRF Validation**: Compares `_csrf` form field against `__Secure-csrf` cookie (double-submit pattern). Returns `403 Forbidden` if mismatch.

**Success Response** `303 See Other`:

```
Location: {redirectTo} | /
Set-Cookie: {better-auth session cookie}
Set-Cookie: __Secure-csrf=; Max-Age=0; Path=/auth  (cleared)
```

**Failure Responses**:

- `403 Forbidden` — CSRF validation failed
- `200 OK` — Authentication failed (re-renders form with generic error `"Invalid email or password"`)
- `429 Too Many Requests` — Rate limit exceeded; `Retry-After` header set

**Note**: All authentication failures (wrong password, unknown email, locked account) display the identical generic error message to prevent email enumeration (FR-007).

---

### GET /auth/sign-up

Renders the user registration form page.

**Response**: `200 OK`

```
Content-Type: text/html
Set-Cookie: __Secure-csrf={token}; HttpOnly; Secure; SameSite=Strict; Path=/auth
Cache-Control: no-store, no-cache
```

**Body**: HTML registration page with:

- Email input field
- Password input field
- Hidden `_csrf` field

---

### POST /auth/sign-up

Creates a new user account.

**Request**:

```
Content-Type: application/x-www-form-urlencoded

email={email}&password={password}&_csrf={token}
```

**CSRF Validation**: Same as POST /auth/sign-in.

**Success Response** `303 See Other`:

```
Location: /auth/sign-in?registered=true
```

**Failure Responses**:

- `403 Forbidden` — CSRF validation failed
- `303 See Other` — Email already in use → redirects to `/auth/sign-in?registered=true` (same response as success — prevents email enumeration per FR-007)
- `200 OK` — Registration failed with recoverable validation error (re-renders form with appropriate error)
  - Password too short → `"Password must be at least 12 characters"`
  - Password too common → `"Password is too common. Please choose a different password."`
  - Email format invalid → `"Please enter a valid email address"`
- `429 Too Many Requests` — Rate limit exceeded

**Note**: Duplicate email is treated identically to success (303 redirect) so attackers cannot enumerate registered accounts by probing `/auth/sign-up`. Only format/strength validation errors are surfaced as `200` re-renders.

**Note**: After successful registration, the user is NOT automatically signed in (redirected to sign-in page instead). They sign in immediately after (FR-013 — no email verification required).

---

### POST /auth/sign-out

Terminates the authenticated user's session.

**Request**:

```
Content-Type: application/x-www-form-urlencoded

_csrf={token}
```

**CSRF Validation**: Same as POST /auth/sign-in.

**Authentication**: Requires a valid session (session cookie must be present). If no valid session, redirects to `/auth/sign-in`.

**CSRF Token Source**: The `_csrf` token for the sign-out form is provided by the `requireAuth` middleware, which generates a fresh CSRF token on each authenticated request, sets it as a cookie, and makes it available via the Hono context (`c.get('csrfToken')`). App page handlers embed this value in the hidden `_csrf` field of any sign-out button form.

**Success Response** `303 See Other`:

```
Location: /auth/sign-in
Set-Cookie: {better-auth session cookie cleared (Max-Age=0)}
Set-Cookie: __Secure-csrf=; Max-Age=0; Path=/auth  (cleared)
```

**Failure Responses**:

- `403 Forbidden` — CSRF validation failed

---

## Better-Auth API Endpoints (`/api/auth/*`)

These endpoints are managed entirely by the better-auth library. They expose a JSON API for future client-side and OAuth use.

**Mount**: `app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))`

### Key Better-Auth API Routes

| Method | Path                            | Purpose                              |
| ------ | ------------------------------- | ------------------------------------ |
| `POST` | `/api/auth/sign-in/email`       | JSON sign-in (email + password)      |
| `POST` | `/api/auth/sign-up/email`       | JSON registration (email + password) |
| `POST` | `/api/auth/sign-out`            | JSON sign-out                        |
| `GET`  | `/api/auth/session`             | Get current session info             |
| `GET`  | `/api/auth/callback/{provider}` | OAuth callback (future)              |
| `GET`  | `/api/auth/{provider}`          | OAuth redirect (future)              |

Better-auth auto-generates these routes based on configuration. All return JSON responses with appropriate session cookies.

---

## Protected Routes

Routes using the `requireAuth` middleware:

```
/app/*  — All application routes (middleware applied)
```

### `requireAuth` Middleware Behaviour

1. Extract session token from better-auth session cookie
2. Call `authService.getSession({ headers: request.headers })` (via the `AuthService` port, not `auth.api` directly)
3. If no valid session:
   - Capture original `pathname + search` as `redirectTo`
   - Return `302 Found` → `/auth/sign-in?redirectTo={encodeURIComponent(originalPath)}`
4. If valid session:
   - Generate a fresh CSRF token and set as `__Secure-csrf` cookie (for sign-out form on app pages)
   - Set `user`, `session`, and `csrfToken` on Hono context
   - Call `next()`

### Post-Sign-In Redirect Validation

The `redirectTo` parameter (from `/auth/sign-in?redirectTo=...`) is validated to:

- Be a relative path (starts with `/`, no `//`, no protocol)
- Decoded via `decodeURIComponent` before checks (prevents URL-encoded bypass)
- Canonicalised via `new URL(decoded, 'http://localhost')` — only `.pathname + .search` used
- Not redirect to `/api/*` or `/auth/*`
- Defaults to `/` if absent or invalid

---

## Security Headers

Applied to all responses from auth page handlers and inherited from the existing `applySecurityHeaders()` utility:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Rate Limits

| Endpoint                     | Window | Max Attempts | Block Duration |
| ---------------------------- | ------ | ------------ | -------------- |
| POST /api/auth/sign-in/email | 15 min | 5            | 15 min         |
| POST /api/auth/sign-up/email | 5 min  | 5            | 5 min          |
| POST /auth/sign-in (custom)  | 15 min | 5            | 15 min         |
| POST /auth/sign-up (custom)  | 5 min  | 5            | 5 min          |

**Note**: Rate limits are enforced via the shared KV rate limiter (`RATE_LIMIT` namespace). Both the HTML form handlers and the `/api/auth/*` JSON API paths share the same per-IP counters (keys `ratelimit:sign-in:{ip}` and `ratelimit:register:{ip}`). This prevents bypass via direct API access.

**Note**: Rate limiting is enforced by a **KV-backed rate limiter** (`src/infrastructure/KvRateLimiter.ts`) — NOT by better-auth's built-in in-memory rate limiter, which is non-functional across Cloudflare Workers isolates (each edge node has its own independent counter). The KV rate limiter is applied via Hono middleware before both the HTML form handlers and the `/api/auth/*` delegation, using shared per-IP KV keys so that both access paths count against the same limit.

**Per-account rate limits**: In addition to per-IP limits, sign-in attempts are rate-limited per email address (account-level) to prevent targeted brute-force against specific accounts from distributed botnets:

| Endpoint                     | Window | Max Attempts | Block Duration | KV Key                                 |
| ---------------------------- | ------ | ------------ | -------------- | -------------------------------------- |
| POST /api/auth/sign-in/email | 60 min | 10           | 60 min         | `ratelimit:signin:email:{hashedEmail}` |
| POST /auth/sign-in (custom)  | 60 min | 10           | 60 min         | `ratelimit:signin:email:{hashedEmail}` |

**Note**: Email is hashed before use as a KV key to avoid storing PII in KV key names. Use `crypto.subtle.digest('SHA-256', new TextEncoder().encode(email.toLowerCase()))` and encode as hex.

---

## Cookie Inventory

| Cookie Name                        | Set By           | Purpose                                    | Flags                                         |
| ---------------------------------- | ---------------- | ------------------------------------------ | --------------------------------------------- |
| `__Host-better-auth.session_token` | better-auth      | Session authentication                     | HttpOnly; Secure; SameSite=Lax; Path=/        |
| `__Secure-csrf`                    | AuthPageHandlers | CSRF protection for HTML forms (pre-login) | HttpOnly; Secure; SameSite=Strict; Path=/auth |
| `__Secure-csrf`                    | requireAuth      | CSRF protection for sign-out on app pages  | HttpOnly; Secure; SameSite=Strict; Path=/auth |

**`__Host-` prefix requirement**: The `__Host-` cookie prefix prevents subdomain cookie injection by requiring `Secure`, `Path=/`, and no `Domain` attribute. Configure in `src/infrastructure/auth.ts` via:

```typescript
advanced: {
  cookiePrefix: '__Host-',
}
```

Verify that better-auth v1.4.x supports this option before implementation. If the `cookiePrefix` option is absent or does not apply the prefix correctly in the installed version, document this as an accepted risk with a tracking issue for the next better-auth upgrade.

---

## Body Size Limits

| Request type                      | Max size |
| --------------------------------- | -------- |
| HTML form submissions (`/auth/*`) | 4 KB     |
| JSON API requests (`/api/auth/*`) | 10 KB    |

These complement per-field limits: `email` ≤ 254 characters (RFC 5321), `password` ≤ 128 characters. Requests exceeding the body size limit are rejected with `413 Content Too Large` before parsing. The HTML form limit (4 KB) is sized to actual payload (email ≤254 + password ≤128 + CSRF ≤64 + field names/encoding overhead ≈ ~450 bytes; 4 KB provides a generous margin). The JSON API limit (10 KB) is tighter since only structured credentials are expected.
