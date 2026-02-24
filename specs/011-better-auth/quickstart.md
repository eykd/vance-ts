# Quickstart: User Authentication (011-better-auth)

**Date**: 2026-02-23

---

## Prerequisites

- Node.js ≥ 22
- Wrangler ≥ 4.67 (`wrangler` is already in devDependencies)
- Cloudflare account (for deploying D1 + Workers)

---

## Local Development Setup

### 1. Install New Dependencies

```bash
npm install better-auth drizzle-orm
npm install --save-dev @better-auth/cli
```

### 2. Configure wrangler.toml

Add the following bindings to your `wrangler.toml` (it is gitignored — edit your local copy):

```toml
[[d1_databases]]
binding = "DB"
database_name = "turtlebased-db"
database_id = "your-d1-database-id"   # From: wrangler d1 create turtlebased-db

[vars]
BETTER_AUTH_URL = "http://localhost:8787"
BETTER_AUTH_SECRET = "dev-secret-replace-in-production-minimum-32-chars"
```

### 3. Create D1 Database (First Time)

```bash
# Create the database (outputs the database_id for wrangler.toml)
wrangler d1 create turtlebased-db

# Apply migrations locally
wrangler d1 migrations apply turtlebased-db --local

# Verify tables were created
wrangler d1 execute turtlebased-db --local --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### 4. Run the Development Server

```bash
wrangler dev
```

Visit `http://localhost:8787/auth/login` to see the login page.

### 5. Register a Test Account

Navigate to `http://localhost:8787/auth/register` and create an account with:

- Email: `test@example.com`
- Password: `TestPassword123!` (at least 12 characters, not a common password)

---

## Running Tests

```bash
# All tests (workers + node + acceptance)
npm test

# Watch mode for TDD
npm run test:watch

# Coverage report (node project only — see CLAUDE.md for why)
npm run test:coverage

# Type check + lint + test
npm run check
```

Tests for this feature are located in:

- `src/infrastructure/auth.spec.ts` — better-auth factory
- `src/presentation/handlers/AuthPageHandlers.spec.ts` — Form handlers
- `src/presentation/middleware/requireAuth.spec.ts` — Auth middleware
- `src/presentation/templates/pages/login.spec.ts` — Login template
- `src/presentation/templates/pages/register.spec.ts` — Register template

---

## Generating Better-Auth Schema (When Updating better-auth Config)

If the better-auth configuration changes (e.g., adding an OAuth provider), regenerate the schema:

```bash
npx @better-auth/cli generate
```

This outputs updated SQL. Apply changes as a new numbered migration file in `migrations/`.

---

## Environment Variables

| Variable             | Description                                      | Required |
| -------------------- | ------------------------------------------------ | -------- |
| `DB`                 | D1 database binding                              | Yes      |
| `BETTER_AUTH_URL`    | Public base URL of the app                       | Yes      |
| `BETTER_AUTH_SECRET` | Secret for signing tokens/cookies (min 32 chars) | Yes      |
| `ASSETS`             | Hugo static asset binding (existing)             | Yes      |

### Production Secrets

For production, set `BETTER_AUTH_SECRET` as a Cloudflare Worker secret (not a plaintext var):

```bash
wrangler secret put BETTER_AUTH_SECRET
# Enter a random 32+ character string when prompted
```

---

## Adding an OAuth Provider (Future)

Thanks to better-auth's plugin architecture (FR-010), adding Google login requires only configuration changes:

1. Add Google OAuth app credentials in Google Cloud Console
2. Add to `wrangler.toml`:
   ```toml
   [vars]
   GOOGLE_CLIENT_ID = "your-client-id"
   ```
3. Add secret:
   ```bash
   wrangler secret put GOOGLE_CLIENT_SECRET
   ```
4. Update `src/infrastructure/auth.ts`:
   ```typescript
   socialProviders: {
     google: {
       clientId: env.GOOGLE_CLIENT_ID,
       clientSecret: env.GOOGLE_CLIENT_SECRET,
     },
   },
   ```
5. Add the OAuth callback URL in Google Cloud Console: `{BETTER_AUTH_URL}/api/auth/callback/google`

No structural code changes required — only configuration.

---

## Troubleshooting

### "D1_ERROR: no such table: user"

Run migrations: `wrangler d1 migrations apply turtlebased-db --local`

### "BETTER_AUTH_SECRET is not set"

Add `BETTER_AUTH_SECRET` to your local `wrangler.toml` vars (not committed to git).

### Session not persisting after login

1. Verify the `Set-Cookie` header is present in the response (dev tools → Network → login POST → Response Headers)
2. Check that `BETTER_AUTH_URL` matches the origin you're accessing the app from
3. Ensure `useSecureCookies` is `false` in local dev (better-auth auto-detects from URL)

### CSRF validation failures

1. Clear browser cookies for localhost
2. Reload the login page (new CSRF token is set)
3. Check that form `_csrf` field matches the `_csrf` cookie value
