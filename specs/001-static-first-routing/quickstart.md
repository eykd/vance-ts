# Quickstart: Static-First Routing Verification

**Feature**: 001-static-first-routing
**Date**: 2026-01-14

## Purpose

This guide provides verification steps to confirm documentation and skills have been correctly updated to reflect the static-first routing architecture.

## Verification Checklist

### Documentation Verification

#### 1. Main Guide (cloudflare-interactive-webapp-guide.md)

- [ ] **No Worker root route**: Verify no `this.get('/')` or `this.get('/home')` patterns
- [ ] **App routes prefixed**: All authenticated page routes use `/app/*`
- [ ] **HTMX partials use underscore**: All HTMX endpoints use `/app/_/*` pattern
- [ ] **No ASSETS fallback for routing**: Worker doesn't use `ASSETS.fetch()` as catch-all router
- [ ] **Static-first philosophy documented**: "Static by default, dynamic by intent" explained
- [ ] **SSG role clarified**: Static site generator responsibilities documented

Search patterns to verify removal:

```bash
# Should return NO matches in guide:
grep -n "this.get('/'," docs/cloudflare-interactive-webapp-guide.md
grep -n "this.get('/tasks'," docs/cloudflare-interactive-webapp-guide.md
grep -n "ASSETS.fetch.*fallback" docs/cloudflare-interactive-webapp-guide.md
```

Search patterns to verify presence:

```bash
# Should return matches:
grep -n "/app/" docs/cloudflare-interactive-webapp-guide.md
grep -n "/app/_/" docs/cloudflare-interactive-webapp-guide.md
grep -n "static.*default" docs/cloudflare-interactive-webapp-guide.md
```

#### 2. Security Guide (cloudflare-webapp-security-guide.md)

- [ ] **Auth boundary at /app**: Authentication required for `/app/*` routes
- [ ] **Marketing pages unauthenticated**: Root and `/pricing`, `/about` don't require auth
- [ ] **No auth middleware on static**: Auth middleware only applies to `/app/*` routes

#### 3. Authentication Guide (secure-authentication-guide.md)

- [ ] **Boundary enforcement**: Auth middleware applied at router level for `/app/*`
- [ ] **Public routes listed**: `/auth/login`, `/auth/callback/*` explicitly public

#### 4. Hugo Integration Guide (hugo-cloudflare-integration-guide.md)

- [ ] **SSG primary renderer**: Hugo renders marketing pages
- [ ] **Worker for API only**: Worker handles `/app/_/*` and `/webhooks/*` only
- [ ] **Static forms work**: Forms POST to Worker endpoints from static pages

### Skills Verification

#### 5. Project Scaffolding Skill

- [ ] **SKILL.md updated**: Examples show `/app/*` routing
- [ ] **scaffold.py updated**: Generated router uses static-first pattern
- [ ] **No root route in template**: Generated code doesn't include `this.get('/')`

```bash
# Verify scaffold.py doesn't generate root route:
grep -n "this.get.*'/'.*homePage" .claude/skills/cloudflare-project-scaffolding/scripts/scaffold.py
# Should return NO matches
```

#### 6. Worker Request Handler Skill

- [ ] **SKILL.md examples**: Use `/app/_/*` for HTMX endpoints
- [ ] **middleware.md router**: Shows auth at `/app/*` boundary
- [ ] **No `/api/` prefix**: All examples use `/app/_/*` instead

```bash
# Verify no /api/ endpoints in examples:
grep -n '"/api/' .claude/skills/worker-request-handler/**/*.md
# Should return NO matches (or only in "do not use" context)
```

#### 7. HTMX Templates Skill

- [ ] **Endpoint convention**: All HTMX examples use `/app/_/*`
- [ ] **Form actions**: `hx-post="/app/_/tasks"` not `hx-post="/api/tasks"`

#### 8. HTMX Pattern Library Skill

- [ ] **Pattern endpoints**: All patterns reference `/app/_/*`
- [ ] **Server response examples**: Show `/app/_/*` URLs

### Code Example Verification

#### Router Pattern

Every router example should follow this pattern:

```typescript
// CORRECT - Static-first pattern
private registerRoutes(): void {
  // Auth routes (open)
  this.get('/auth/login', (req) => this.authHandlers.loginPage(req));
  this.post('/auth/login', (req) => this.authHandlers.login(req));
  this.post('/auth/logout', (req) => this.authHandlers.logout(req));

  // Webhook routes (signature verification)
  this.post('/webhooks/stripe', (req) => this.webhookHandlers.stripe(req));

  // App routes (authenticated) - all under /app
  this.get('/app', (req, session) => this.appHandlers.dashboard(req, session));
  this.get('/app/tasks', (req, session) => this.taskHandlers.tasksPage(req, session));

  // HTMX partials - all under /app/_
  this.get('/app/_/tasks', (req, session) => this.taskHandlers.listTasks(req, session));
  this.post('/app/_/tasks', (req, session) => this.taskHandlers.createTask(req, session));

  // NO root route - static pages served by Pages
  // NO ASSETS.fetch fallback - static routing handled by Cloudflare
}
```

```typescript
// INCORRECT - Worker-first pattern (should NOT appear)
private registerRoutes(): void {
  this.get('/', (req) => this.homePage(req));  // ❌ NO
  this.get('/tasks', (req) => this.tasksPage(req));  // ❌ NO
  this.get('/api/tasks', (req) => this.listTasks(req));  // ❌ NO - use /app/_/
  this.get('/*', async (req) => this.env.ASSETS.fetch(req));  // ❌ NO
}
```

#### HTMX Form Pattern

```html
<!-- CORRECT -->
<form hx-post="/app/_/tasks" hx-target="#task-list" hx-swap="beforeend">
  <!-- INCORRECT -->
  <form hx-post="/api/tasks" hx-target="#task-list" hx-swap="beforeend"><!-- ❌ --></form>
</form>
```

#### Project Structure

```
CORRECT Structure:
project/
├── public/                 # Static marketing site (served by Pages)
│   ├── index.html         # / - Home page
│   ├── about/index.html   # /about
│   ├── pricing/index.html # /pricing
│   └── assets/            # CSS, JS, images
├── src/
│   ├── presentation/
│   │   └── templates/
│   │       └── app/       # /app/* pages (served by Worker)
│   │           ├── dashboard.ts
│   │           ├── tasks.ts
│   │           └── partials/  # /app/_/* fragments
│   └── index.ts           # Worker entry
└── wrangler.jsonc

INCORRECT Structure:
project/
├── public/                 # Only assets
├── src/
│   ├── presentation/
│   │   └── templates/
│   │       ├── pages/     # ❌ All pages in Worker
│   │       │   ├── home.ts    # ❌
│   │       │   └── tasks.ts
│   │       └── partials/
```

## Quick Validation Commands

Run these commands to verify updates are complete:

```bash
# 1. Check for forbidden patterns (should return empty)
echo "=== Checking for old patterns (should be empty) ==="
grep -rn "this.get.*'/'.*homePage\|this.get.*'/tasks'" docs/ .claude/skills/
grep -rn 'hx-post="/api/' docs/ .claude/skills/
grep -rn 'hx-get="/api/' docs/ .claude/skills/

# 2. Check for required patterns (should return matches)
echo "=== Checking for new patterns (should have matches) ==="
grep -rn '/app/_/' docs/ .claude/skills/ | head -20
grep -rn '/app/' docs/ .claude/skills/ | head -20
grep -rn 'static.*default' docs/ | head -5

# 3. Verify route ownership documentation
echo "=== Checking for static-first documentation ==="
grep -rn "Static by default" docs/
```

## Success Criteria

All verification items checked means the static-first routing architecture is correctly documented across all files.

### Final Checklist

- [ ] All documentation files updated per research.md inventory
- [ ] All skills files updated per research.md inventory
- [ ] No `/api/*` endpoint patterns remain (replaced with `/app/_/*`)
- [ ] No root route (`/`) handlers in Worker examples
- [ ] No `ASSETS.fetch()` fallback routing patterns
- [ ] Auth boundary documented at `/app/*`
- [ ] "Static by default, dynamic by intent" philosophy documented
- [ ] SSG role as primary renderer for marketing pages documented
