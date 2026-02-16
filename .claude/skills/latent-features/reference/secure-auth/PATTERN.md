# Secure Session-Based Authentication Pattern

**Purpose**: OWASP-compliant session-based authentication for Cloudflare Workers using better-auth + Hono

**Trigger keywords**: authentication, login, logout, session, password, user registration, auth

---

## Pattern Overview

**What this pattern provides**:

- OWASP-compliant security architecture (February 2026)
- Session-based auth via better-auth (library-managed)
- Hono HTTP framework with type-safe middleware
- Defense-in-depth with multiple security layers
- Complete implementation examples with tests

**Technologies**:

- [better-auth](https://www.better-auth.com) (authentication library)
- [better-auth-cloudflare](https://github.com/zpg6/better-auth-cloudflare) (D1/KV adapters)
- [Hono](https://hono.dev) (HTTP framework for Cloudflare Workers)
- Cloudflare D1 (user, session, account, verification tables)
- Cloudflare KV (secondary storage for session cache + rate limits)
- HTMX + Alpine.js (frontend)

**What better-auth handles** (you don't write this code):

- User registration and storage (email, password, account linking)
- Password hashing (scrypt default, or custom Argon2id/PBKDF2)
- Session creation, validation, refresh, and revocation
- Cookie management (HttpOnly, Secure, SameSite, configurable prefix)
- Rate limiting with IP detection and IPv6 subnet normalization
- Email verification and password reset token flows
- Database schema and migrations

**What you still implement** (custom code):

- CSRF protection middleware (better-auth doesn't cover HTMX forms)
- XSS prevention and safe HTML templates (server-rendered output encoding)
- Security headers (CSP, HSTS, X-Frame-Options)
- HTML templates for login, register, error pages (HTMX + Alpine.js)
- Hono app wiring and auth middleware (per-request auth instance)
- Open redirect prevention on login/register callbacks

**Routing boundary**:

This pattern uses a static-first routing model:

- `/auth/*` routes are public (login, logout, register)
- `/api/auth/*` routes are better-auth API endpoints
- `/app/*` routes are authenticated (require valid session)
- `/app/_/*` routes are HTMX partials (also authenticated)
- `/webhooks/*` routes use signature verification (no session auth)
- `/` and other static routes are served by Cloudflare Pages (no Worker involvement)

Auth middleware is applied at the `/app/*` boundary in the Hono router, not at individual handlers.

---

## Progressive Disclosure Path

### Level 1: Architecture Overview (~130 lines)

**File**: `architecture/overview.md`

**When to read**: Specification phase, early planning

**What you get**:

- Defense-in-depth security model (5 layers)
- Threat model for authentication
- Browser-to-server security flow diagrams
- Data storage architecture (better-auth managed tables in D1, KV for cache)
- What better-auth handles vs what you implement
- Key architectural decisions

**Use this when**:

- Writing feature specifications
- Understanding security requirements
- Making high-level design decisions

---

### Level 2: Core Setup (~250 lines)

**File**: `implementation/better-auth-setup.md`

**When to read**: Planning phase, initial setup

**What you get**:

- Installing dependencies
- Configuring wrangler.jsonc bindings (D1, KV, secrets)
- Creating the better-auth instance with Cloudflare adapters
- Mounting auth routes in Hono
- Database schema generation and migrations
- Custom password hasher (Argon2id via Web Crypto) if needed
- Testing strategy

**Use this when**:

- Setting up auth infrastructure for the first time
- Planning implementation phases
- Understanding better-auth configuration options

---

### Level 3: Implementation Details (choose based on current work)

#### Hono Auth Middleware (~150 lines)

**File**: `implementation/hono-auth-middleware.md`

**When to read**: Implementing route protection

**What you get**:

- Session extraction middleware for Hono
- Type-safe Hono context variables
- Route protection patterns (public vs authenticated vs admin)
- HTMX-aware redirects (HX-Redirect header)
- Logout handler pattern
- Testing middleware with mock sessions

**Use this when**:

- Protecting authenticated routes
- Accessing user/session in handlers
- Building logout functionality

---

#### CSRF Protection (~200 lines)

**File**: `implementation/csrf-protection.md`

**When to read**: Implementing form submissions

**What you get**:

- Standalone Hono CSRF middleware
- Token generation with `crypto.getRandomValues()`
- HTMX integration (global headers, event listeners)
- Origin/Referer validation for defense-in-depth
- Testing patterns

**Use this when**:

- Implementing POST/PUT/PATCH/DELETE endpoints
- Setting up HTMX forms
- Configuring middleware stack

---

#### XSS Prevention (~460 lines)

**File**: `implementation/xss-prevention.md`

**When to read**: Implementing server-rendered templates

**What you get**:

- HTML encoder (context-specific encoding)
- Safe HTML tagged template literal system
- HTMX security configuration
- Content Security Policy (CSP) setup
- URL validation patterns
- Testing patterns

**Use this when**:

- Building HTML templates
- Rendering user-provided content
- Configuring security headers

---

#### Auth Templates (~200 lines)

**File**: `implementation/auth-templates.md`

**When to read**: Building login/register UI

**What you get**:

- Login form (HTMX + Alpine.js)
- Register form with validation
- Password reset request form
- Error page templates (401, 403, 429)
- Mapping better-auth errors to user-friendly messages
- HTMX partial patterns for inline error display

**Use this when**:

- Building auth UI pages
- Handling form submissions
- Displaying auth errors

---

## Usage by Phase

### Specification Phase (`/sp:01-specify`)

**Goal**: Identify security requirements for feature spec

**Steps**:

1. Load: `architecture/overview.md`
2. Extract: Threat model, security layers, better-auth vs custom boundary
3. Document: Security requirements in spec
4. Note: Implementation details deferred to planning

**Token cost**: ~130 lines

**Example output for spec**:

```markdown
## Security Requirements

This feature requires authentication following OWASP guidelines:

- Authentication: better-auth library with email/password
- Session management: better-auth managed (D1 + KV cache)
- Password security: scrypt (default) or Argon2id (custom hasher)
- Rate limiting: better-auth built-in (IP-based, configurable per-endpoint)
- CSRF protection: Custom double-submit cookie middleware (for HTMX forms)
- XSS prevention: Output encoding for all user data
- Future: Email verification, password reset, 2FA (better-auth plugins)

See latent-features/secure-auth for implementation patterns.
```

---

### Planning Phase (`/sp:03-plan`)

**Goal**: Create implementation plan with setup structure

**Steps**:

1. Load: `architecture/overview.md` (if not already loaded)
2. Load: `implementation/better-auth-setup.md`
3. Extract: Configuration, wiring, migration steps
4. Create: Implementation phases
5. Reference: Specific implementation files for each phase

**Token cost**: ~380 lines (architecture + setup)

**Example plan structure**:

```markdown
## Implementation Plan

### Phase 1: Infrastructure Setup

- Reference: better-auth-setup.md
- Install: better-auth, better-auth-cloudflare, hono, kysely, kysely-d1
- Configure: wrangler.jsonc (D1, KV, secrets)
- Create: Auth instance factory, mount routes in Hono

### Phase 2: Route Protection

- Reference: hono-auth-middleware.md
- Implement: Session extraction middleware
- Configure: Public vs authenticated route boundaries

### Phase 3: CSRF Protection

- Reference: csrf-protection.md
- Implement: CSRF middleware for Hono
- Configure: HTMX integration

### Phase 4: Templates & XSS Prevention

- Reference: xss-prevention.md + auth-templates.md
- Implement: Safe HTML template system
- Build: Login, register, error page templates
- Configure: Security headers (CSP)
```

---

### Implementation Phase

**Goal**: Load specific patterns as needed for current work

**Approach**: On-demand loading based on implementation task

**Examples**:

```
Task: Set up auth infrastructure
→ Load: implementation/better-auth-setup.md
→ Token cost: ~250 lines

Task: Protect app routes
→ Load: implementation/hono-auth-middleware.md
→ Token cost: ~150 lines

Task: Build login form
→ Load: implementation/auth-templates.md
→ Load: implementation/csrf-protection.md
→ Token cost: ~400 lines
```

---

## Token Efficiency Comparison

### Progressive Disclosure Approach

```
Session 1 (Specification): 130 lines
Session 2 (Planning):      250 lines
Session 3 (Middleware):     150 lines
Session 4 (CSRF impl):     200 lines
Session 5 (Templates):     200 lines

Total: ~930 lines across 5 sessions
```

### Monolithic Approach (old hand-rolled pattern)

```
All files combined: ~2,500+ lines
```

**Token savings**: ~63% reduction through progressive disclosure + library delegation

---

## Testing Strategy

Each reference file includes testing patterns:

- **better-auth-setup.md**: Mock better-auth in unit tests, real D1 in integration tests
- **hono-auth-middleware.md**: Mock session extraction, test route protection
- **csrf-protection.md**: Middleware tests, token validation tests
- **xss-prevention.md**: Template encoding tests, XSS attack prevention tests
- **auth-templates.md**: Form rendering tests, error message mapping tests

---

## Dependencies

```json
{
  "dependencies": {
    "better-auth": "^1.x",
    "better-auth-cloudflare": "^0.x",
    "hono": "^4.x",
    "kysely": "^0.x",
    "kysely-d1": "^0.x"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "@cloudflare/vitest-pool-workers": "^0.1.0"
  }
}
```

---

## Future Extensions (better-auth plugins)

better-auth supports these as drop-in plugins when needed:

- **Email verification**: `emailVerification` config with `sendVerificationEmail` callback
- **Password reset**: `sendResetPassword` callback + token-based flow
- **Two-factor authentication**: `twoFactor` plugin (TOTP, OTP, backup codes)
- **Social login**: `socialProviders` config (GitHub, Google, etc.)
- **Account linking**: `accountLinking` config for multi-provider accounts

These require no architectural changes — add plugin config and implement the UI.

---

## Next Steps After Reading This Pattern

1. **For architecture understanding** → Read `architecture/overview.md`
2. **For initial setup** → Read `implementation/better-auth-setup.md`
3. **For route protection** → Read `implementation/hono-auth-middleware.md`
4. **For specific implementation** → Choose from remaining implementation files

---

## Notes

- All patterns follow OWASP guidelines (February 2026)
- Security uses defense-in-depth (multiple overlapping layers)
- Implementation targets Cloudflare Workers (TypeScript)
- better-auth eliminates ~70% of hand-rolled auth code
- Custom code focuses on CSRF, XSS, templates, and Hono wiring
