# Research: Static-First Routing Architecture

**Feature**: 001-static-first-routing
**Date**: 2026-01-14
**Status**: Complete

## Overview

This document inventories all files requiring updates to transition from "Worker serves everything" to "static-first" routing architecture.

## Key Decisions

### Decision 1: Routing Model

**Choice**: Static-first with explicit dynamic boundaries
**Rationale**: Simpler mental model, better caching, clearer separation of concerns
**Alternatives Considered**:

- Worker-first with static fallback (current model) - rejected for complexity
- Hybrid routing rules - rejected for configuration overhead

### Decision 2: Dynamic Route Prefix

**Choice**: `/app/*` for authenticated application, `/app/_/*` for HTMX partials
**Rationale**: Clear namespace separation, easy to configure auth middleware, prevents collision with static routes
**Alternatives Considered**:

- `/api/*` prefix - rejected because "API" implies JSON, not HTML
- `/dashboard/*` - rejected as too specific to one use case

### Decision 3: HTMX Partial Convention

**Choice**: `/app/_/[resource]/[action]` for HTMX-only routes
**Rationale**: Underscore prefix indicates "internal/partial", never directly linked
**Alternatives Considered**:

- `/app/partials/*` - rejected as too verbose
- `/app/~/*` - rejected as non-standard character

### Decision 4: Migration Approach

**Choice**: Clean break - no backward compatibility documentation
**Rationale**: Per spec clarification, reduces documentation clutter and maintenance burden
**Alternatives Considered**:

- Migration guide section - rejected per user preference
- Parallel documentation - rejected as confusing

## Affected Files Inventory

### Documentation (docs/)

| File                                     | Priority | Change Type | Summary                                                              |
| ---------------------------------------- | -------- | ----------- | -------------------------------------------------------------------- |
| `cloudflare-interactive-webapp-guide.md` | P0       | Major       | Primary guide - Router examples, project structure, all code samples |
| `cloudflare-webapp-security-guide.md`    | P1       | Moderate    | Auth boundary patterns, session middleware placement                 |
| `secure-authentication-guide.md`         | P1       | Moderate    | Auth middleware boundary enforcement                                 |
| `hugo-cloudflare-integration-guide.md`   | P2       | Moderate    | SSG role clarification, `/api/*` endpoint patterns                   |
| `stripe-cloudflare-integration-guide.md` | P2       | Minor       | Webhook routing clarification                                        |
| `slack-bot-integration-guide.md`         | P2       | Minor       | Webhook vs. authenticated route separation                           |
| `multi-tenant-boundaries-guide.md`       | P3       | Minor       | Authorization boundary references                                    |

### Skills (.claude/skills/)

| Skill                                                | Priority | Change Type | Summary                                    |
| ---------------------------------------------------- | -------- | ----------- | ------------------------------------------ |
| `cloudflare-project-scaffolding/SKILL.md`            | P0       | Major       | Scaffolding examples, project structure    |
| `cloudflare-project-scaffolding/scripts/scaffold.py` | P0       | Major       | Template router generation code            |
| `worker-request-handler/SKILL.md`                    | P1       | Moderate    | Handler patterns and route prefixes        |
| `worker-request-handler/references/middleware.md`    | P1       | Major       | Router examples, auth middleware placement |
| `htmx-alpine-templates/SKILL.md`                     | P1       | Moderate    | Template structure, endpoint conventions   |
| `htmx-alpine-templates/references/htmx-patterns.md`  | P2       | Minor       | Endpoint URL examples                      |
| `htmx-pattern-library/SKILL.md`                      | P2       | Minor       | Pattern endpoint references                |
| `deploy-your-app/SKILL.md`                           | P2       | Minor       | Deployment verification steps              |
| `latent-features/reference/secure-auth/*`            | P1       | Moderate    | Auth pattern files and boundaries          |

## Specific Changes Required

### 1. Router Pattern (cloudflare-interactive-webapp-guide.md, lines 995-1067)

**Current**:

```typescript
this.get('/', (req) => this.taskHandlers.homePage(req));
this.get('/tasks', (req) => this.taskHandlers.tasksPage(req));
this.get('/api/tasks', (req) => this.taskHandlers.listTasks(req));
this.post('/api/tasks', (req) => this.taskHandlers.createTask(req));
// Static assets fallback
this.get('/*', async (req) => {
  const response = await this.env.ASSETS.fetch(req);
  if (response.status === 404) {
    return new Response('Not found', { status: 404 });
  }
  return response;
});
```

**Target**:

```typescript
// Application pages (authenticated)
this.get('/app', (req) => this.taskHandlers.dashboardPage(req));
this.get('/app/tasks', (req) => this.taskHandlers.tasksPage(req));

// HTMX partials
this.get('/app/_/tasks', (req) => this.taskHandlers.listTasks(req));
this.post('/app/_/tasks', (req) => this.taskHandlers.createTask(req));
this.patch('/app/_/tasks/:id', (req, p) => this.taskHandlers.updateTask(req, p.id));
this.delete('/app/_/tasks/:id', (req, p) => this.taskHandlers.deleteTask(req, p.id));

// Auth routes
this.get('/auth/login', (req) => this.authHandlers.loginPage(req));
this.post('/auth/login', (req) => this.authHandlers.login(req));
this.post('/auth/logout', (req) => this.authHandlers.logout(req));

// Webhooks (no auth)
this.post('/webhooks/stripe', (req) => this.webhookHandlers.stripe(req));

// Static content: NOT handled by Worker (served by Pages at /, /about, /pricing, etc.)
```

### 2. Entry Point Pattern (index.ts)

**Current**: Worker handles all requests, falls back to ASSETS for static
**Target**: Worker only receives `/app/*`, `/auth/*`, `/webhooks/*` requests

### 3. Auth Middleware Placement

**Current**: Auth checked inside individual handlers
**Target**: Auth middleware applied at `/app/*` boundary in router

```typescript
// New auth boundary pattern
private registerRoutes(): void {
  // Public routes (no auth)
  this.get('/auth/login', (req) => this.authHandlers.loginPage(req));
  this.post('/auth/login', (req) => this.authHandlers.login(req));

  // Webhook routes (signature verification, no session auth)
  this.post('/webhooks/stripe', (req) => this.webhookHandlers.stripe(req));

  // Authenticated routes (all /app/*)
  this.group('/app', this.authMiddleware.requireAuth, () => {
    this.get('/', (req) => this.appHandlers.dashboard(req));
    this.get('/tasks', (req) => this.taskHandlers.tasksPage(req));
    this.get('/_/tasks', (req) => this.taskHandlers.listTasks(req));
    // ...
  });
}
```

### 4. Project Structure (scaffold.py)

**Current**: Worker serves root, templates in `presentation/templates/pages/`
**Target**:

- Marketing pages in `public/` (served by Pages)
- App pages in `src/presentation/templates/app/`
- Partials in `src/presentation/templates/app/partials/`

### 5. HTMX Form Actions

**Current**: `hx-post="/api/tasks"`
**Target**: `hx-post="/app/_/tasks"`

## Verification Checklist

After updates, verify:

- [ ] No Worker routes for `/`, `/about`, `/pricing`, `/blog/*`
- [ ] All `/api/*` references replaced with `/app/_/*` or `/app/*`
- [ ] Auth middleware applied at `/app/*` boundary
- [ ] Webhook routes under `/webhooks/*` with signature verification
- [ ] Static assets served from `public/` without Worker involvement
- [ ] wrangler.jsonc routes configuration reflects static-first model
- [ ] All HTMX examples use `/app/_/*` convention

## Next Steps

1. Phase 1: Create data-model.md with canonical routing table
2. Phase 1: Create quickstart.md verification guide
3. Phase 2: Generate tasks.md via `/sp:06-tasks`
