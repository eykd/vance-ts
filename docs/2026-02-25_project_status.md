# Boilerplate State Summary

**Date:** 2026-02-25
**Branch:** `011-better-auth` (active feature branch)
**Main branch:** `master`

## What This Is

A production-ready, static-first TypeScript web application boilerplate targeting
Cloudflare Workers with Hugo for static pages. Clean Architecture, strict TDD,
and automated spec-to-deploy workflow.

---

## Runtime Stack

| Layer       | Technology                               | Version                       |
| ----------- | ---------------------------------------- | ----------------------------- |
| Compute     | Cloudflare Workers                       | compatibility_date 2025-01-01 |
| Framework   | Hono                                     | 4.12                          |
| Auth        | better-auth + Drizzle ORM                | 1.4 / 0.44                    |
| Static site | Hugo (extended)                          | 0.154.5                       |
| CSS         | TailwindCSS 4 + DaisyUI 5                | 4.1 / 5.0                     |
| Client JS   | HTMX 2.0.8, Alpine.js 3.15.8             | vendored                      |
| Language    | TypeScript                               | 5.9 (extremely strict)        |
| Tests       | Vitest + @cloudflare/vitest-pool-workers | 3.2 / 0.12                    |
| Node        | 22.x (.nvmrc)                            |                               |

## Cloudflare Bindings Available

| Binding              | Type            | Purpose                               |
| -------------------- | --------------- | ------------------------------------- |
| `ASSETS`             | Fetcher         | Hugo static files from `hugo/public/` |
| `DB`                 | D1Database      | User/session storage (better-auth)    |
| `RATE_LIMIT`         | KVNamespace     | Distributed IP rate limiting          |
| `BETTER_AUTH_URL`    | string (secret) | Public base URL                       |
| `BETTER_AUTH_SECRET` | string (secret) | >= 32 bytes entropy                   |

R2 and Durable Objects are supported by the platform but not yet bound.

---

## Architecture (Clean Architecture, 4 Layers)

```
src/
  domain/          Pure business logic, zero external deps
    entities/        AuthUser, AuthSession
    value-objects/   CommonPasswords (OWASP blocklist)
    services/        PBKDF2 password hasher (Web Crypto)

  application/     Use-case orchestration
    ports/           AuthService, RateLimiter (interfaces only)
    use-cases/       SignInUseCase, SignUpUseCase, SignOutUseCase

  infrastructure/  Adapters implementing ports
    BetterAuthService   Maps better-auth responses to Result types
    KvRateLimiter       KV-backed distributed rate limiting
    auth.ts             better-auth singleton factory (D1 + Drizzle)

  presentation/    HTTP layer
    handlers/        ApiHandlers, AuthPageHandlers, StaticAssetHandler, AppPartialHandlers
    middleware/      requireAuth (session + CSRF)
    templates/       authLayout, login page, register page
    utils/           securityHeaders, cookieBuilder, extractClientIp,
                     redirectValidator, html (tagged-template escaping)
    generated/       assetPaths.ts (synced from Hugo build)

  di/              Composition root
    serviceFactory.ts  Lazy singleton wiring per isolate

  shared/          Cross-cutting utilities
    env.ts           Env interface (Cloudflare bindings)
    hex.ts           Binary-to-hex conversion

  worker.ts        Hono app entry point
  index.ts         Re-export
```

**Dependency rule enforced:** Domain <- Application <- Infrastructure/Presentation.
ESLint architecture boundary rules ready to uncomment in `eslint.config.mjs`.

---

## Routes (worker.ts)

| Method   | Path             | Handler                 | Auth        |
| -------- | ---------------- | ----------------------- | ----------- |
| GET      | `/api/health`    | healthCheck             | No          |
| GET/POST | `/api/auth/*`    | better-auth passthrough | No          |
| ALL      | `/api/*`         | apiNotFound (404)       | No          |
| GET      | `/auth/sign-in`  | login form              | No          |
| POST     | `/auth/sign-in`  | sign-in (rate-limited)  | No          |
| GET      | `/auth/sign-up`  | register form           | No          |
| POST     | `/auth/sign-up`  | sign-up (rate-limited)  | No          |
| POST     | `/auth/sign-out` | sign-out                | CSRF        |
| ALL      | `/app/_/*`       | appPartialNotFound      | requireAuth |
| ALL      | `/app/*`         | (middleware only)       | requireAuth |
| ALL      | `*`              | staticAssetFallthrough  | No          |

**Middleware applied:** Security headers on `/api/*`, `/app/_/*`, `/auth/*`.
Auth guard on `/app/*` (redirects to sign-in with `?redirectTo=`).

---

## Security Posture

- **CSRF:** Double-submit token (form field + `__Secure-csrf` cookie), session-bound via HMAC-SHA256
- **Rate limiting:** IP-based via KV, 5 attempts per window (15 min sign-in, 5 min register)
- **Timing oracle defense:** PBKDF2 dummy hash on every non-rate-limited failure
- **Email enumeration prevention:** Same response for email_taken and success on sign-up
- **Password validation:** 12-128 chars (better-auth) + OWASP common-password blocklist
- **Sessions:** `__Host-` prefixed cookies, HttpOnly, Secure, SameSite, 30-day TTL
- **Headers:** HSTS (2yr, preload), CSP, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy
- **HTML escaping:** Tagged template literal with auto-escape (`html` utility)
- **Redirect validation:** Blocks `//`, `/api/`, `/auth/` paths; localhost-base URL parsing
- **IP extraction:** CF-Connecting-IP only (ignores X-Forwarded-For to prevent spoofing)

---

## Database Schema (D1, migrations/)

Single migration: `0001_better_auth_schema.sql`

| Table          | Purpose                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| `user`         | id, name, email (unique), emailVerified, image, timestamps               |
| `session`      | id, userId (FK cascade), token (unique), expiresAt, ipAddress, userAgent |
| `account`      | id, userId (FK cascade), providerId, OAuth tokens, password              |
| `verification` | id, identifier, value, expiresAt (email verify/reset)                    |

All timestamps stored as TEXT in ISO 8601 UTC.

---

## Hugo Static Site

- **Theme:** Custom, DaisyUI "lemonade" palette (oklch colors)
- **Layouts:** baseof, home (hero from YAML data), single (with optional TOC), list (paginated card grid), 404
- **Partials:** header, footer, pagination, hero block, primary/outline buttons
- **SEO:** OpenGraph, Twitter Cards, JSON-LD (WebSite, Article, BreadcrumbList), Google Analytics (optional)
- **Content types:** Pages, posts (with tags and series taxonomies)
- **Security headers:** `static/_headers` for Cloudflare (HSTS, CSP, cache control)
- **Asset fingerprinting:** Hugo Pipes with SRI integrity hashes
- **TailwindCSS scans:** Both Hugo templates and `src/presentation/templates/` for class extraction
- **Build verification:** 8 checks in `test-build.js` (zero-warning policy)

---

## Testing Infrastructure

### Three Vitest Projects

| Project      | Files                                             | Runtime            | Coverage                |
| ------------ | ------------------------------------------------- | ------------------ | ----------------------- |
| `workers`    | `src/**/*.spec.ts`                                | cloudflare:workers | N/A (no node:inspector) |
| `node`       | `acceptance/**/*.spec.ts`, `scripts/**/*.spec.ts` | node               | 100% threshold          |
| `acceptance` | `generated-acceptance-tests/**/*.spec.ts`         | cloudflare:workers | N/A                     |

### Acceptance Test Pipeline (ATDD)

```
specs/acceptance-specs/*.txt  (GWT format)
        |  parser.ts
        v
    IR (intermediate representation)
        |  generator.ts
        v
generated-acceptance-tests/*.spec.ts
```

Commands: `just acceptance` (full pipeline), `just acceptance-run`, `just test-all`.

Existing specs: US01 (health), US02 (API 404). Stubs generated, then manually bound.

### Pre-commit Gate (Husky)

1. `br hooks run pre-commit` (beads validation)
2. `npx lint-staged` (prettier, eslint, tsc, vitest per file)
3. `npm run format:check`
4. `npm run test:coverage` (100% threshold)
5. `npm run build`
6. `commitlint` on commit-msg (conventional commits)

---

## Task Management (Beads)

SQLite-backed task tracker in `.beads/`. Integrates with the spec-kit workflow.

**Hierarchy:** Epic > Phase tasks > User story tasks > Sub-tasks
**Commands:** `br create`, `br list`, `br ready`, `br close`, `br dep add/tree`, `br stats`
**Branch convention:** Feature branches encode epic ID for CI context.

---

## Automation

### Spec-Kit Workflow (10 phases)

| Phase   | Skill               | Purpose                                   |
| ------- | ------------------- | ----------------------------------------- |
| `sp:00` | constitution        | Project principles                        |
| `sp:01` | specify             | Feature spec (creates epic + phase tasks) |
| `sp:02` | clarify             | Interactive interview                     |
| `sp:03` | plan                | Implementation plan + design artifacts    |
| `sp:04` | red-team            | Adversarial review of spec/plan           |
| `sp:05` | tasks               | Generate beads tasks from plan            |
| `sp:06` | analyze             | Cross-artifact consistency check          |
| `sp:07` | implement           | Execute tasks from beads                  |
| `sp:08` | security-review     | Security audit of changes                 |
| `sp:09` | architecture-review | Architecture compliance check             |
| `sp:10` | code-quality-review | General code quality review               |

`/sp:next` queries `br ready` and dispatches to the correct phase skill.

### Ralph (ralph.sh, 1951 lines)

Automated loop: queries `br ready`, invokes `/sp:next`, polls for completion, repeats.
Handles phases 03-09 (01-02 are manual). Up to 50 iterations, 30-min Claude timeout,
10 retries with exponential backoff. Lock file prevents concurrent runs.

### CI/CD (GitHub Actions)

| Workflow                 | Trigger            | Purpose                                             |
| ------------------------ | ------------------ | --------------------------------------------------- |
| `ci.yml`                 | push/PR to master  | Quality gate + deploy (production or preview)       |
| `claude-code-review.yml` | PR open/sync       | 3 parallel reviews: security, architecture, quality |
| `claude.yml`             | `@claude` mentions | Claude responds to issues/PRs                       |
| `dependabot.yml`         | schedule           | Automated dependency updates                        |

---

## Available Skills (56)

Organized by domain:

- **Spec workflow:** latent-features, prefactoring, error-handling-patterns, portable-datetime, glossary
- **Architecture:** clean-architecture-validator, ddd-domain-modeling, static-first-routing, hypermedia-pattern-advisor
- **Workers:** hono-cloudflare-workers, worker-request-handler, cloudflare-project-scaffolding, cloudflare-use-case-creator, cloudflare-migrations, d1-repository-implementation, kv-session-management, cloudflare-observability
- **Testing:** typescript-unit-testing, vitest-cloudflare-config, vitest-integration-testing, acceptance-tests, atdd, spec-check
- **Hugo/Frontend:** hugo-project-setup, hugo-templates, hugo-copywriting, hugo-search-indexing, htmx-pattern-library, htmx-alpine-templates, typescript-html-templates, tailwind-daisyui-design, daisyui-design-system-generator, frontend-design
- **Review/Quality:** security-review, quality-review, code-review, refactoring, compound
- **Logging/Observability:** structured-logging, log-categorization, pii-redaction, testing-observability
- **Automation:** ralph, process-pr-reviews, beads-batch-ops, deploy-your-app, skill-creator
- **Guides:** blog-article-structures, landing-page-wireframe-guide, slack-bot-integration-guide, stripe-cloudflare-integration-guide, wrangler-sprite-auth

---

## Reference Documentation (docs/)

16 guides covering deployment, DDD, security, auth, observability, Hugo integration,
logging, multi-tenancy, cron jobs, Slack, Stripe, TypeScript best practices, landing
pages, and code review automation.

---

## Affordances for Future Work

### Ready to Use (infrastructure in place)

1. **Add new routes** - Hono router in `worker.ts`, add handlers in `presentation/handlers/`
2. **Add new use cases** - Create in `application/use-cases/`, wire in `di/serviceFactory.ts`
3. **Add D1 repositories** - Implement port interfaces, use `env.DB` binding, add migrations
4. **Add new static pages** - Hugo content in `hugo/content/`, layouts in `hugo/layouts/`
5. **HTMX partials** - `/app/_/*` route reserved; add handlers behind auth middleware
6. **OAuth providers** - better-auth supports Google, GitHub, etc.; add provider config
7. **Email verification** - `verification` table exists; configure email provider
8. **Acceptance specs** - Write GWT in `specs/acceptance-specs/`, run `just acceptance`
9. **Automated feature loop** - `./ralph.sh` for hands-off phase 03-09 execution

### Available but Not Yet Bound

10. **R2 object storage** - Add binding in `wrangler.toml`, implement adapter
11. **Durable Objects** - For stateful coordination (websockets, counters)
12. **Cron triggers** - Add `[triggers]` in `wrangler.toml`, implement scheduled handler
13. **Queue consumers** - Cloudflare Queues for async work
14. **Search** - Hugo search indexing skill + D1 FTS5
15. **Multi-tenancy** - Skills and guides ready; needs schema + middleware
16. **Observability** - SLO/SLI metrics, structured logging skills ready
17. **Sentry integration** - Skill available, needs configuration
18. **Stripe payments** - Guide and skill available
19. **Slack bot** - Guide and skill available

### Requires Configuration Only

20. **Production URL** - Set `baseURL` in `hugo/hugo.yaml` (marked STARTUPFIXME)
21. **Site identity** - params.yaml: title, description, logo, author, social links
22. **Google Analytics** - Set `googleAnalytics` in params.yaml
23. **Cloudflare secrets** - `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` via `wrangler secret put`
24. **GitHub secrets** - `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` for CI deploy

---

## Key Commands Quick Reference

```bash
# Development
just dev-worker          # Local Worker dev server
just hugo-dev            # Hugo dev server (localhost:1313)
npx vitest               # TDD watch mode

# Quality
just check               # type-check + lint + test
just ci                  # Full CI pipeline locally
npm run fix              # Auto-fix formatting + linting

# Testing
just test                # Unit tests
just test-all            # Unit + acceptance
just acceptance          # Full ATDD pipeline

# Deploy
just deploy              # Build Hugo + deploy Worker

# Automation
./ralph.sh               # Automated spec-to-deploy loop
```
