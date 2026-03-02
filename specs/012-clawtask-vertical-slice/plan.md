# Implementation Plan: ClawTask Vertical Slice — Inbox Capture to Completed Action

**Branch**: `012-clawtask-vertical-slice` | **Date**: 2026-03-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/012-clawtask-vertical-slice/spec.md`

---

## Summary

Implement the first end-to-end GTD workflow: signup → workspace auto-provisioning → capture to inbox → clarify into action → activate → complete. This delivers 7 new domain entities (Workspace, Actor, InboxItem, Area, Context, Action, AuditEvent), 9 use cases, 7 D1 repositories, 7 database migrations, 10+ API/HTMX handlers, and all supporting UI templates — on top of the existing better-auth + Hono + D1 + Clean Architecture foundation.

---

## Technical Context

**Language/Version**: TypeScript/ES2022 targeting Cloudflare Workers V8 isolate
**Primary Dependencies**: Hono 4.x, better-auth, Drizzle ORM (sqlite-core + D1 adapter), Vitest 2.x + `@cloudflare/vitest-pool-workers`
**Storage**: Cloudflare D1 (SQLite); D1 batch API for atomic multi-entity mutations
**Testing**: Vitest with `@cloudflare/vitest-pool-workers`; 100% coverage threshold (see CLAUDE.md for Workers runtime exemption)
**Target Platform**: Cloudflare Workers V8 isolate — no Node.js APIs permitted
**Project Type**: Single project (src/ Clean Architecture monorepo)
**Performance Goals**: <100ms p95 for all API endpoints; D1 reads are fast at this data scale
**Constraints**: No Node.js imports; D1 batch (not full ACID) for atomicity; all IDs server-generated UUIDs; all timestamps ISO-8601 UTC strings
**Scale/Scope**: Single workspace per user account; flat arrays (no pagination in this slice); ~10 rows per table initially

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked post-design below._

### I. Test-First Development

**Status**: PASS

TDD is mandatory. All entities, use cases, and handlers require `.spec.ts` written before implementation. Integration tests for D1 repositories. 100% coverage enforced. Acceptance tests for all 4 user stories.

### II. Type Safety and Static Analysis

**Status**: PASS

Strict TypeScript with all flags enabled (already configured). Domain entities use discriminated union result types. No `any` types. Explicit return types on all functions. JSDoc on all public APIs.

### III. Code Quality Standards

**Status**: PASS

Existing ESLint + Prettier configuration applies. JSDoc required for all new public functions/classes/interfaces/types. Naming: PascalCase entities, VerbNoun use cases, snake_case D1 columns, camelCase TypeScript.

### IV. Pre-commit Quality Gates

**Status**: PASS

No changes to pre-commit hooks required. All new code subject to existing Husky + lint-staged pipeline.

### V. Warning and Deprecation Policy

**Status**: PASS (no violations identified)

All new code will be reviewed for warnings. TypeScript strict mode catches most issues at compile time.

### VI. Cloudflare Workers Target Environment

**Status**: PASS

All new code uses Web Standard APIs only (`crypto.randomUUID()`, `Response`, `Request`, `fetch`). D1 via `env.DB`. No `fs`, `path`, `process`, `Buffer`, or other Node.js APIs. Timestamps via `new Date().toISOString()` (not `Date.now()` in string form).

### VII. Simplicity and Maintainability

**Status**: PASS — complexity justified

The 7 entities, 9 use cases, and 7 repositories are the minimum to fulfill the spec. The domain model is a faithful translation of GTD terminology into code. No speculative features. No pagination in this slice. `project_id` on Action is a NULL placeholder only — no project domain code created.

### Post-Design Re-check

_Re-evaluated after Phase 1 design._

No new violations introduced. The data model is flat and straightforward. The D1 batch pattern for ClarifyInboxItemToAction is a necessary constraint of the platform — not over-engineering. All entities have single responsibilities. No new build targets or packages added.

---

## Project Structure

### Documentation (this feature)

```text
specs/012-clawtask-vertical-slice/
├── spec.md              # Feature specification (input)
├── plan.md              # This file
├── research.md          # Phase 0 — technical decisions
├── data-model.md        # Phase 1 — entity definitions + schema DDL
├── quickstart.md        # Phase 1 — implementation guide
└── contracts/
    └── openapi.yaml     # Phase 1 — API contracts
```

### Source Code Changes

```text
src/
├── domain/
│   ├── entities/
│   │   ├── InboxItem.ts         ← NEW
│   │   ├── InboxItem.spec.ts    ← NEW
│   │   ├── Action.ts            ← NEW
│   │   ├── Action.spec.ts       ← NEW
│   │   ├── Area.ts              ← NEW
│   │   ├── Area.spec.ts         ← NEW
│   │   ├── Context.ts           ← NEW
│   │   ├── Context.spec.ts      ← NEW
│   │   ├── Workspace.ts         ← NEW
│   │   ├── Workspace.spec.ts    ← NEW
│   │   ├── Actor.ts             ← NEW
│   │   ├── Actor.spec.ts        ← NEW
│   │   ├── AuditEvent.ts        ← NEW
│   │   └── AuditEvent.spec.ts   ← NEW
│   ├── interfaces/
│   │   ├── InboxItemRepository.ts     ← NEW
│   │   ├── ActionRepository.ts        ← NEW
│   │   ├── AreaRepository.ts          ← NEW
│   │   ├── ContextRepository.ts       ← NEW
│   │   ├── WorkspaceRepository.ts     ← NEW
│   │   ├── ActorRepository.ts         ← NEW
│   │   └── AuditEventRepository.ts    ← NEW
│   └── errors/
│       └── DomainError.ts             ← NEW (reused across entities)
│
├── application/
│   ├── dto/
│   │   ├── InboxItemDto.ts      ← NEW
│   │   ├── ActionDto.ts         ← NEW
│   │   ├── AreaDto.ts           ← NEW
│   │   └── ContextDto.ts        ← NEW
│   └── use-cases/
│       ├── ProvisionWorkspaceUseCase.ts      ← NEW
│       ├── ProvisionWorkspaceUseCase.spec.ts ← NEW
│       ├── CaptureInboxItemUseCase.ts        ← NEW
│       ├── CaptureInboxItemUseCase.spec.ts   ← NEW
│       ├── ClarifyInboxItemToActionUseCase.ts        ← NEW
│       ├── ClarifyInboxItemToActionUseCase.spec.ts   ← NEW
│       ├── ActivateActionUseCase.ts          ← NEW
│       ├── ActivateActionUseCase.spec.ts     ← NEW
│       ├── CompleteActionUseCase.ts          ← NEW
│       ├── CompleteActionUseCase.spec.ts     ← NEW
│       ├── ListInboxItemsUseCase.ts          ← NEW
│       ├── ListInboxItemsUseCase.spec.ts     ← NEW
│       ├── ListActionsUseCase.ts             ← NEW
│       ├── ListActionsUseCase.spec.ts        ← NEW
│       ├── ListAreasUseCase.ts               ← NEW
│       ├── ListAreasUseCase.spec.ts          ← NEW
│       ├── ListContextsUseCase.ts            ← NEW
│       └── ListContextsUseCase.spec.ts       ← NEW
│
├── infrastructure/
│   ├── schema/
│   │   └── clawtaskSchema.ts    ← NEW (Drizzle table defs for 6 new tables)
│   ├── repositories/
│   │   ├── D1InboxItemRepository.ts          ← NEW
│   │   ├── D1InboxItemRepository.spec.ts     ← NEW
│   │   ├── D1ActionRepository.ts             ← NEW
│   │   ├── D1ActionRepository.spec.ts        ← NEW
│   │   ├── D1AreaRepository.ts               ← NEW
│   │   ├── D1AreaRepository.spec.ts          ← NEW
│   │   ├── D1ContextRepository.ts            ← NEW
│   │   ├── D1ContextRepository.spec.ts       ← NEW
│   │   ├── D1WorkspaceRepository.ts          ← NEW
│   │   ├── D1WorkspaceRepository.spec.ts     ← NEW
│   │   ├── D1ActorRepository.ts              ← NEW
│   │   ├── D1ActorRepository.spec.ts         ← NEW
│   │   ├── D1AuditEventRepository.ts         ← NEW
│   │   └── D1AuditEventRepository.spec.ts    ← NEW
│   └── WorkspaceProvisioningService.ts       ← NEW
│       WorkspaceProvisioningService.spec.ts  ← NEW
│   └── auth.ts                               ← MODIFIED (add databaseHooks.user.create.after)
│
├── presentation/
│   ├── handlers/
│   │   ├── InboxApiHandlers.ts       ← NEW
│   │   ├── InboxApiHandlers.spec.ts  ← NEW
│   │   ├── ActionApiHandlers.ts      ← NEW
│   │   ├── ActionApiHandlers.spec.ts ← NEW
│   │   ├── AreaApiHandlers.ts        ← NEW
│   │   ├── AreaApiHandlers.spec.ts   ← NEW
│   │   ├── ContextApiHandlers.ts     ← NEW
│   │   ├── ContextApiHandlers.spec.ts ← NEW
│   │   ├── AppPageHandlers.ts        ← NEW (dashboard, inbox page, actions page)
│   │   ├── AppPageHandlers.spec.ts   ← NEW
│   │   ├── AppPartialHandlers.ts     ← MODIFIED (add HTMX partial routes)
│   │   └── AppPartialHandlers.spec.ts ← MODIFIED
│   ├── middleware/
│   │   ├── requireWorkspace.ts       ← NEW (resolves workspaceId + actorId)
│   │   └── requireWorkspace.spec.ts  ← NEW
│   └── templates/
│       ├── pages/
│       │   ├── dashboard.ts          ← NEW
│       │   ├── inbox.ts              ← NEW
│       │   └── actions.ts            ← NEW
│       └── partials/
│           ├── inboxList.ts          ← NEW
│           ├── clarifyForm.ts        ← NEW
│           └── actionRow.ts          ← NEW
│
├── di/
│   ├── serviceFactory.ts             ← MODIFIED (wire new use cases + repos)
│   └── serviceFactory.spec.ts        ← MODIFIED (add new test cases)
│
└── worker.ts                         ← MODIFIED (register /api/v1/* + /app/* routes)

migrations/
├── 0002_workspace.sql    ← NEW
├── 0003_actor.sql        ← NEW
├── 0004_area.sql         ← NEW
├── 0005_context.sql      ← NEW
├── 0006_inbox_item.sql   ← NEW
├── 0007_action.sql       ← NEW
└── 0008_audit_event.sql  ← NEW

specs/acceptance-specs/   ← NEW directory
├── US01-workspace-provisioning.spec
├── US03-inbox-capture.spec
├── US04-clarify-inbox-item.spec
└── US05-activate-complete-action.spec
```

**Structure Decision**: Single project with the existing Clean Architecture layout. No new packages, modules, or build targets. All code lives in `src/`. Migrations use the existing zero-padded sequence.

---

## Key Design Decisions

### 1. Workspace Provisioning Hook

better-auth's `databaseHooks.user.create.after` fires after the user row is committed to D1 during signup. Confirmed available in better-auth v1.4.x — no custom plugin fallback required. This guarantees every authenticated user has a workspace. See `research.md` Decision 1.

**Note on social login (GitHub issue #7260)**: In some better-auth versions, `databaseHooks.user.create.after` executes within an uncommitted DB transaction during OAuth/social login, causing FK violations when the provisioner inserts workspace rows referencing the new user ID. This slice uses email-based signup only (no social providers configured), making this low risk for now. If social login is added in a future slice, switch to `hooks.after` middleware (runs post-commit) filtered by `ctx.path`.

### 2. Atomic Clarification

`ClarifyInboxItemToAction` uses `env.DB.batch([...])` directly (D1 native batch API) rather than Drizzle ORM. This is the only use case that bypasses Drizzle — all others use Drizzle queries. The use case receives `env.DB` as a dependency alongside the repository interfaces.

### 3. requireWorkspace Middleware

A new middleware (`src/presentation/middleware/requireWorkspace.ts`) sits after `requireAuth` on all `/api/v1/*` and `/app/*` routes. It resolves workspace and actor once per request and injects them into Hono context. Returns 503 if workspace is missing (indicates provisioning failure).

### 4. Error Envelope

All API errors return `{ "error": { "code": "...", "message": "..." } }` (FR-014). HTMX partial errors return an inline error HTML fragment (for swap into the form target). See `contracts/openapi.yaml` for all error codes.

### 5. Audit Events

Every state-changing mutation records exactly one audit event per affected entity. Clarification records 2 events (inbox_item.clarified + action.created) in the same D1 batch. Provisioning records events for workspace + actor + each area + each context.

### 6. Cross-Workspace Isolation

All repository queries include `WHERE workspace_id = ?` alongside the entity `id`. If an entity is not found (or belongs to another workspace), the repository returns `null`. Handlers return 404 — making resources invisible across workspace boundaries (FR-009, spec edge cases).

---

## Complexity Tracking

No constitution violations. All design choices are the minimum required by the spec.

---

## Concrete Implementation Patterns

> Resolved during second deepen-plan pass (2026-03-02). These sections convert vague implementation guidance into copy-ready code patterns.

### A. AppEnv Variables Extension

`src/presentation/types.ts` must extend `AppEnv.Variables` with the two new per-request values set by `requireWorkspace`:

```typescript
export interface AppEnv {
  Bindings: Env;
  Variables: {
    /** The authenticated user, populated by requireAuth middleware. */
    user: AuthUserDto;
    /** The active session, populated by requireAuth middleware. */
    session: AuthSessionDto;
    /** Session-bound CSRF token derived via HMAC-SHA256, set by requireAuth. */
    csrfToken: string;
    /** Workspace ID for the authenticated user, set by requireWorkspace middleware. */
    workspaceId: string;
    /** Actor ID (human) for the authenticated user, set by requireWorkspace middleware. */
    actorId: string;
  };
}
```

Without this change, TypeScript will error on `c.set('workspaceId', ...)` and `c.var.workspaceId` throughout handlers and middleware.

### B. requireWorkspace Factory Pattern

`requireWorkspace` must follow the existing `createRequireAuth` factory pattern — not a plain exported `async function`. This keeps dependencies injected (testable) and matches the `ServiceFactory` getter style:

```typescript
// src/presentation/middleware/requireWorkspace.ts
export function createRequireWorkspace(
  workspaceRepo: WorkspaceRepository,
  actorRepo: ActorRepository,
): (c: Context<AppEnv>, next: Next) => Promise<Response | void> {
  return async function requireWorkspace(c, next): Promise<Response | void> {
    const user = c.var.user;
    const workspace = await workspaceRepo.getByUserId(user.id);
    if (!workspace) {
      if (c.req.header('HX-Request') === 'true') {
        return new Response(null, {
          status: 503,
          headers: { 'HX-Redirect': '/auth/sign-in' },
        });
      }
      return c.json(
        { error: { code: 'workspace_not_found', message: 'Workspace setup is not complete.' } },
        503,
      );
    }
    const actor = await actorRepo.getHumanActorByWorkspaceId(workspace.id);
    if (!actor) {
      // See edge case: Empty Actor ID in requireWorkspace
      return c.json(
        { error: { code: 'workspace_not_found', message: 'Workspace actor not found.' } },
        503,
      );
    }
    c.set('workspaceId', workspace.id);
    c.set('actorId', actor.id);
    await next();
  };
}
```

`ServiceFactory` exposes this as a lazy getter:
```typescript
get requireWorkspaceMiddleware(): ReturnType<typeof createRequireWorkspace> {
  this._requireWorkspaceMiddleware ??= createRequireWorkspace(
    this._workspaceRepositoryInstance,
    this._actorRepositoryInstance,
  );
  return this._requireWorkspaceMiddleware;
}
```

### C. Drizzle db Instance Sharing in ServiceFactory

All D1 repositories need a `DrizzleD1Database` instance. `ServiceFactory` creates exactly one shared instance — not one per repository — since `drizzle()` is cheap to construct but the underlying `D1Database` binding is already shared:

```typescript
import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { wrapD1ForDrizzle } from '../infrastructure/d1DateProxy.js';

class ServiceFactory {
  // Lazily created shared Drizzle instance
  private _db: DrizzleD1Database | null = null;

  private get db(): DrizzleD1Database {
    this._db ??= drizzle(wrapD1ForDrizzle(this.env.DB));
    return this._db;
  }

  private get _inboxItemRepositoryInstance(): D1InboxItemRepository {
    this._inboxItemRepository ??= new D1InboxItemRepository(this.db);
    return this._inboxItemRepository;
  }

  private get _actionRepositoryInstance(): D1ActionRepository {
    this._actionRepository ??= new D1ActionRepository(this.db);
    return this._actionRepository;
  }

  private get _areaRepositoryInstance(): D1AreaRepository {
    this._areaRepository ??= new D1AreaRepository(this.db);
    return this._areaRepository;
  }

  private get _contextRepositoryInstance(): D1ContextRepository {
    this._contextRepository ??= new D1ContextRepository(this.db);
    return this._contextRepository;
  }

  private get _workspaceRepositoryInstance(): D1WorkspaceRepository {
    this._workspaceRepository ??= new D1WorkspaceRepository(this.db);
    return this._workspaceRepository;
  }

  private get _actorRepositoryInstance(): D1ActorRepository {
    this._actorRepository ??= new D1ActorRepository(this.db);
    return this._actorRepository;
  }

  private get _auditEventRepositoryInstance(): D1AuditEventRepository {
    this._auditEventRepository ??= new D1AuditEventRepository(this.db);
    return this._auditEventRepository;
  }
}
```

`wrapD1ForDrizzle` is already imported in `auth.ts` — import from the same path.

**Note**: `auth.ts` creates its own `drizzle(wrapD1ForDrizzle(env.DB))` for the better-auth adapter. These are two separate Drizzle instances sharing the same underlying `D1Database` binding. This is intentional: the better-auth adapter uses `authSchema` tables only; the new repositories use `clawtaskSchema` tables only. They never conflict.

### D. auth.ts Modification for user.create.after Hook

The `user.create.after` hook receives only the `user` data object — not `env`. To call `WorkspaceProvisioningService` inside the hook, the provisioner must be constructed inside `getAuth(env)` where `env.DB` is available. Pattern:

```typescript
// Inside getAuth(env), after const secret = env.BETTER_AUTH_SECRET:
const provisioningDb = drizzle(wrapD1ForDrizzle(env.DB));  // dedicated Drizzle instance
const provisioner = new WorkspaceProvisioningService(env.DB); // receives raw D1 for batch API

_auth = betterAuth({
  // ... existing config ...
  databaseHooks: {
    session: { /* existing session hooks */ },
    verification: { /* existing verification hooks */ },
    user: {
      create: {
        after: async (user: { id: string; email: string }): Promise<void> => {
          try {
            await provisioner.provisionForUser(user.id, user.email);
          } catch (err) {
            // Log but don't throw — better-auth has already committed the user row.
            // The user will hit the 503 requireWorkspace path on first login.
            // Manual recovery: call ProvisionWorkspaceUseCase with userId.
            console.error('[WorkspaceProvisioner] Failed to provision workspace', {
              userId: user.id,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        },
      },
    },
  },
});
```

`WorkspaceProvisioningService` receives the raw `D1Database` (not Drizzle) because it uses `env.DB.batch([...])` for the single 20-statement provisioning batch. It constructs its own statement array using raw SQL strings (not Drizzle ORM) to avoid the Drizzle `.toSQL()` + manual D1 statement construction complexity.

**Warning**: Do not call `resetAuth()` without also clearing the provisioner reference. Since the provisioner is created inside the `getAuth` closure, it is garbage-collected when `_auth` is reset. No additional teardown is needed.

### E. Inbox List Filter Decision (Resolved)

**Decision**: Both `GET /api/v1/inbox` and the HTMX inbox page default to returning only `status='inbox'` items. Rationale: the inbox is an "in-tray" — once clarified, items move conceptually out of the inbox. Showing clarified items on reload creates the illusion that clarification failed.

Implementation:
- `ListInboxItemsUseCase` accepts an optional `status` filter, defaulting to `'inbox'`
- `GET /api/v1/inbox` passes no filter → defaults to `status='inbox'`
- No "all items" endpoint is exposed in this slice
- If a future slice needs history, add `GET /api/v1/inbox?includeAll=true`

```typescript
// D1InboxItemRepository
async listByWorkspaceId(workspaceId: string, status: InboxItemStatus = 'inbox'): Promise<InboxItem[]> {
  const rows = await this.db
    .select()
    .from(inboxItemTable)
    .where(and(eq(inboxItemTable.workspaceId, workspaceId), eq(inboxItemTable.status, status)))
    .orderBy(desc(inboxItemTable.createdAt))
    .limit(500)
    .all();
  return rows.map(InboxItem.reconstitute);
}
```

### F. D1 Batch Coupling in ClarifyInboxItemToAction

**Decision**: `ClarifyInboxItemToActionUseCase` does not receive `env.DB` directly (which would couple the application layer to D1). Instead, introduce a thin interface `ClarificationStore` in the domain interfaces:

```typescript
// src/domain/interfaces/ClarificationStore.ts
export interface ClarificationStore {
  /** Atomically clarifies an inbox item into an action. Returns false if the
   *  inbox item was not in 'inbox' status (TOCTOU race detected). */
  clarifyAtomically(inboxItemId: string, action: Action, auditEvents: AuditEvent[]): Promise<boolean>;
}
```

`D1ClarificationStore` in `src/infrastructure/repositories/D1ClarificationStore.ts` implements this using the raw `D1Database` binding (not the shared Drizzle instance), because `env.DB.batch([...])` is called directly on the D1 binding — Drizzle does not wrap the batch API. Constructor signature:

```typescript
// src/infrastructure/repositories/D1ClarificationStore.ts
export class D1ClarificationStore implements ClarificationStore {
  constructor(private readonly db: D1Database) {}
  // ...
}
```

Wired in `ServiceFactory` alongside the other repositories (passed `this.env.DB`, not the shared drizzle instance). The use case receives only the `ClarificationStore` interface:

```typescript
class ClarifyInboxItemToActionUseCase {
  constructor(
    private readonly inboxRepo: InboxItemRepository,
    private readonly clarificationStore: ClarificationStore,
  ) {}
}
```

This keeps the application layer clean of D1 imports and makes the use case testable with a simple mock. The D1 implementation handles the raw batch SQL internally.

---

## Applied Learnings

No prior solutions documented in `.specify/solutions/` — this is the first feature slice. The following research findings were incorporated during plan deepening (2026-03-02, three passes):

**First pass:**
- **better-auth v1.4.x `databaseHooks.user.create.after`**: Confirmed available; no custom plugin fallback required. FK constraint risk during OAuth flows documented (GitHub issue #7260); mitigated by email-only auth scope in this slice.
- **CSP + `hx-on::after-settle` incompatibility**: The existing `script-src 'self'` CSP blocks `hx-on::after-settle` (uses `new Function()` internally). All focus-management patterns updated from `hx-on::after-settle` to Alpine.js `x-on:htmx:after-settle.window` — this applies to both the clarify form and the dashboard quick-capture form.
- **Provisioning D1 batch — definitive decision**: "Consider using a D1 batch" language replaced with a hard requirement for a single batch of 20 inserts with audit events last (FK ordering).
- **Provisioning idempotency — definitive requirement**: `ProvisionWorkspaceUseCase` MUST check for an existing workspace before inserting (was "consider").

**Second pass (Concrete Implementation Patterns section above):**
- **AppEnv Variables extension**: `workspaceId: string` and `actorId: string` must be added to `AppEnv.Variables` in `src/presentation/types.ts` — without this, TypeScript will error on all middleware `c.set()` and handler `c.var` accesses.
- **requireWorkspace factory pattern**: Must use `createRequireWorkspace(workspaceRepo, actorRepo)` factory (not plain exported function), consistent with `createRequireAuth` pattern and `ServiceFactory` lazy getter wiring.
- **Drizzle db sharing**: `ServiceFactory` creates one shared `DrizzleD1Database` instance (via `drizzle(wrapD1ForDrizzle(this.env.DB))`) passed to all 7 repositories. `auth.ts` retains its own separate Drizzle instance for the better-auth adapter.
- **auth.ts `user.create.after` hook**: `WorkspaceProvisioningService` is constructed inside `getAuth(env)` using `env.DB` (raw D1, not Drizzle) since it uses the D1 batch API. Hook catches provisioning errors rather than propagating — user is already committed.
- **Inbox list filter decision**: Both API and HTMX page default to `status='inbox'` only. Resolved the "clarify and document" ambiguity with a concrete default filter.
- **ClarifyInboxItemToAction D1 coupling**: Resolved via `ClarificationStore` interface in domain/interfaces — keeps use case framework-agnostic while `D1ClarificationStore` handles the raw batch internally.

**Third pass (codebase research against live implementation, 2026-03-02):**
- **requireAuth HTMX gap confirmed**: Verified against `src/presentation/middleware/requireAuth.ts` — existing implementation has zero HTMX detection. It calls `c.redirect()` unconditionally on all session-expiry paths. Both `requireAuth` AND `requireWorkspace` must be updated; "if necessary" language removed. New test required in `requireAuth.spec.ts` asserting `HX-Redirect` on `HX-Request: true` requests.
- **requireAuth three-client-type dispatch**: Error Code Enum section updated with the explicit three-path dispatch required in `requireAuth`: HTMX clients → `HX-Redirect`, API JSON clients (`Accept: application/json`) → JSON 401 envelope, browser navigation → 302 redirect.
- **D1ClarificationStore constructor pattern**: File path and constructor signature now concrete: `src/infrastructure/repositories/D1ClarificationStore.ts` with `constructor(private readonly db: D1Database)`. Uses raw `D1Database` (not the shared Drizzle instance) because `env.DB.batch([...])` operates on the D1 binding directly.
- **Focus management pattern made prescriptive**: Belt-and-suspenders now required — both `autofocus` on the first input AND Alpine.js `x-on:htmx:after-settle.window` on the swap target. The conditional "if autofocus alone is insufficient" language replaced with a mandatory dual-pattern with rationale.
- **Area filtering option resolved**: Option (b) — `AppPartialHandlers` calls `listActiveByWorkspaceId()` — upgraded from "preferred" to "chosen". JSDoc documentation requirement added.
- **Quick-capture error-path behavior documented**: `x-on:htmx:after-settle.window` fires on all responses (success and error); resetting the title field on error is explicitly correct behavior for the quick-capture form.

**Fourth pass (codebase research — live implementation, 2026-03-02):**
- **ServiceFactory repository getters made explicit**: `// ... same pattern for all 7 repositories` placeholder replaced with concrete private getter implementations for all 7 repositories (`D1ActionRepository`, `D1AreaRepository`, `D1ContextRepository`, `D1WorkspaceRepository`, `D1ActorRepository`, `D1AuditEventRepository`).
- **CSRF template escaping clarified**: Templates use the `html` tagged template literal which auto-escapes all interpolated values. The CSRF hidden input uses `${csrfToken}` (auto-escaped) NOT `${escapeHtml(csrfToken)}` (double-escape). Earlier plan drafts had this wrong.
- **D1 batch result type made concrete**: `D1Database.batch()` returns `Promise<D1Result<unknown>[]>`. Each `D1Result.meta.changes: number` indicates rows affected. Concrete TypeScript snippet added to D1 Batch Result Validation edge case showing array indexing (`results[0]?.meta.changes ?? 0`).
- **D1 UNIQUE constraint detection pattern added**: SQLite/D1 throws `Error` with `message.includes('UNIQUE constraint failed')`. Concrete `try/catch` pattern added to Concurrent Provisioning mitigation — including rationale that the `catch` is a secondary guard behind the idempotency pre-check.
- **`/app/_/` underscore convention confirmed**: Verified against `src/worker.ts` — `app.use('/app/_/*', withSecurityHeaders)` and `app.all('/app/_/*', appPartialNotFound)` are established patterns. HTMX partial routes belong under `/app/_/`.
- **AppEnv.Variables extension confirmed necessary**: `src/presentation/types.ts` currently defines only `user`, `session`, `csrfToken`. Adding `workspaceId: string` and `actorId: string` is mandatory (TypeScript will error otherwise).
- **requireWorkspace middleware does not yet exist**: Confirmed via directory listing. `src/presentation/middleware/` contains only `requireAuth.ts` and `apiAuthRateLimit.ts`.

**Fifth pass (codebase research — live implementation, 2026-03-02):**
- **FK `ON DELETE` for `clarified_into_id` resolved**: `ON DELETE RESTRICT` chosen (not `SET NULL`, not `CASCADE`). Drizzle syntax confirmed from `authSchema.ts`: `.references(() => actionTable.id, { onDelete: 'restrict' })`. SQL inline: `TEXT REFERENCES \`action\`(\`id\`) ON DELETE RESTRICT`.
- **TOCTOU optimistic lock placement resolved**: Must be in **use case UPDATE statements**, NOT in `save()`. Confirmed `save()` uses `ON CONFLICT(id) DO UPDATE SET` upsert (from `d1-patterns.md`) — this pattern cannot enforce conditional prior status. `ActivateAction` and `CompleteAction` use cases issue their own `UPDATE ... WHERE id = ? AND workspace_id = ? AND status = ?` directly, bypassing `save()` for state transitions.
- **Body size guard pattern confirmed from existing code**: `AuthPageHandlers.ts` already implements `MAX_BODY_BYTES = 4096` via `request.text()` + length check. New JSON handlers follow identical pattern with `MAX_API_BODY_BYTES = 16_384`, reading body as text once then parsing with `JSON.parse()`. Applies only to JSON mutation endpoints — HTMX form endpoints are already guarded by the form handler pattern.
- **Unbounded list warning mechanism confirmed**: `console.warn()` in Cloudflare Workers goes to tail logs. Warning emitted in the **use case** (not repository) after counting results. `LIST_SAFETY_CAP = 500` shared constant.
- **List ordering: specific query sites named**: `D1InboxItemRepository.listByWorkspaceId()` and `D1ActionRepository.listByWorkspaceIdAndStatus()` — these are the two exact methods requiring `ORDER BY created_at DESC`.
- **Status badge DaisyUI classes resolved**: `badge-warning` (ready), `badge-info` (active), `badge-success` (done). TypeScript `Record<ActionStatus, ...>` map pattern specified to prevent exhaustiveness gap.
- **Form error ID pattern confirmed from existing templates**: `register.ts` uses constant-named IDs (`EMAIL_ERROR_ID`, `PASSWORD_ERROR_ID`). New clarify form uses same pattern: `TITLE_ERROR_ID = 'clarify-title-error'` etc. `aria-describedby` points to the constant ID. Multiple errors on one field collapse to a single `<p>` (priority: required > format > length).
- **`hx-swap` mode constraint for Alpine.js focus**: The Alpine.js `x-data` wrapper must not be the HTMX swap target. Using `hx-swap="outerHTML"` on the wrapper removes the Alpine.js element before the `htmx:afterSettle` event fires. Mandated: clarify form's `hx-target` points to a child `<div>` using `hx-swap="innerHTML"` (default) — Alpine.js parent remains intact.

---

## Security Considerations

### XSS in HTMX Templates (HIGH)

All templates are pure TypeScript string concatenation. User-supplied fields (`title`, `description`) rendered directly into HTML without escaping are a stored XSS vector. An inbox item with title `<script>alert(1)</script>` would execute in any user's browser who views the page.

**Mitigation**: The codebase already provides `html` tagged template literal and `safe()` in `src/presentation/utils/html.ts`. New templates (`pages/dashboard.ts`, `pages/inbox.ts`, `pages/actions.ts`, `partials/inboxList.ts`, `partials/clarifyForm.ts`, `partials/actionRow.ts`) MUST use the `html` tagged template — NOT raw string concatenation or manual `escapeHtml()` calls. The tagged template automatically escapes every interpolated value unless wrapped with `safe()` (reserved for pre-escaped nested template output). All template functions must import `html` from `../utils/html.js` and use it consistently. See the `/typescript-html-templates` skill for the standard pattern.

**Correction note**: Earlier plan drafts described implementing a new `escapeHtml` utility. The utility already exists in `src/presentation/utils/html.ts`. Do not duplicate it.

### CSRF for HTMX Mutation Endpoints (HIGH)

The existing CSRF protection (double-submit cookie, `__Host-csrf`) is only validated in `AuthPageHandlers.ts`. The new HTMX mutation endpoints (`POST /app/_/inbox`, `POST /app/_/inbox/:id/clarify`, `POST /app/_/actions/:id/activate`, `POST /app/_/actions/:id/complete`) are susceptible to cross-site request forgery if CSRF validation is not applied.

**Mitigation**: All HTMX mutation handlers must validate the `_csrf` form parameter against the `__Host-csrf` cookie using the existing `timingSafeStringEqual` utility (already in `src/presentation/utils/`). HTMX forms in templates must include `<input type="hidden" name="_csrf" value="${csrfToken}">` — since templates use the `html` tagged template literal, `csrfToken` is automatically escaped; do NOT call `escapeHtml(csrfToken)` manually (that would double-escape and double-escape the value). The `csrfToken` is already set in Hono context by `requireAuth` — pass it through from page handlers to template functions.

### Status Query Parameter Injection (HIGH)

`GET /api/v1/actions?status=<value>` accepts an arbitrary string. The domain `Action` entity has 6 statuses (`ready`, `active`, `done`, `waiting`, `scheduled`, `archived`), but the OpenAPI spec documents only 3 valid filter values (`ready`, `active`, `done`). An undocumented value like `status=waiting` would silently call `listByWorkspaceIdAndStatus` with an unvalidated value, potentially returning unexpected results or exposing future-state data.

**Mitigation**: The `ActionApiHandlers` handler must validate the `status` query parameter against the documented enum `['ready', 'active', 'done']` before passing to the use case. Validation is **case-sensitive exact match** — `Ready`, `READY`, or `rEaDy` must all return 400. Do not normalise to lowercase before checking. Return 400 `{ "error": { "code": "validation_error", "message": "Invalid status filter" } }` for unknown or mismatched-case values. An absent `status` parameter is valid (returns all actions); an empty string `?status=` is treated as an invalid value (returns 400), not as absent.

### UUID Format Validation on Path Parameters (LOW)

Path parameters like `:id` in `/api/v1/inbox/:id/clarify` are used directly in DB queries. While Drizzle parameterizes queries (preventing SQL injection), passing 500-character strings causes unnecessary DB round trips.

**Mitigation**: Validate that `:id` path parameters match UUID v4 format (`/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`) before dispatching to the use case. Return 400 on invalid format.

### Content-Type Validation on JSON Endpoints (MEDIUM)

`POST /api/v1/inbox` and `POST /api/v1/inbox/:id/clarify` call `req.json()` to parse the request body. If a client sends a request with `Content-Type: text/plain` or `Content-Type: multipart/form-data`, `req.json()` throws a runtime exception that propagates as an unhandled 500 error rather than a clean 400 validation error.

**Mitigation**: Before calling `req.json()`, validate that `req.headers.get('content-type')?.includes('application/json')` is true. Return 400 `{ "error": { "code": "validation_error", "message": "Content-Type must be application/json" } }` if the check fails.

### Error Code Enum Inconsistency (MEDIUM)

The OpenAPI `ErrorEnvelope` schema defines an `error.code` enum that does not include `unauthenticated`, but the `Unauthenticated` response object references that exact value. The existing `requireAuth` middleware returns either a 302 redirect (`c.redirect()`) or a `503 Service Unavailable` plain-text response — neither conforms to the `ErrorEnvelope` JSON shape expected by API clients.

**Mitigation**: Two coordinated changes required:
1. Add `unauthenticated` and `workspace_not_found` to the `ErrorEnvelope.error.code` enum in `contracts/openapi.yaml`.
2. API routes under `/api/v1/*` are accessed by programmatic clients that expect JSON. For these routes, `requireAuth` must detect `Accept: application/json` (or absence of `HX-Request`) and return `{ "error": { "code": "unauthenticated", "message": "Authentication required." } }` with status 401, not a redirect. The existing HTMX path returns `HX-Redirect` (no body). The browser-navigation path returns a 302 redirect. All three paths are now explicit: HTMX → `HX-Redirect`, API (`Accept: application/json`) → JSON 401, browser → 302 redirect.

### CSP Blocks `hx-on` Inline Event Handlers (HIGH)

The existing Content Security Policy (confirmed in `src/presentation/utils/securityHeaders.ts`) sets `script-src 'self'` without `'unsafe-eval'`. HTMX's `hx-on::after-settle` attribute directive internally uses `new Function(...)` to construct an event handler from the attribute string — this is equivalent to `eval()` and is blocked by a strict `script-src` without `'unsafe-eval'`. The accessibility mitigations in this plan (§ Accessibility Requirements) specify `hx-on::after-settle="this.querySelector(...)?.focus()"` patterns for focus management and form reset. These will **silently fail** in production — focus will not move after HTMX swaps, breaking keyboard navigation for screen reader and keyboard-only users.

**Mitigation**: Replace all `hx-on::after-settle` patterns with Alpine.js event listeners, which execute in the Alpine.js runtime context (loaded via `script-src 'self'`) and are not blocked by CSP. Pattern:
```html
<!-- INSTEAD OF: hx-on::after-settle="this.querySelector('input')?.focus()" -->
<div x-data x-on:htmx:after-settle.window="$el.querySelector('input')?.focus()">...</div>
```
For the clarify form expansion, add `x-on:htmx:after-settle.window` on the swap target element. For the dashboard quick-capture form reset, use `x-on:htmx:after-settle.window` on the form element. Do **not** add `'unsafe-eval'` to `script-src` — the CSP restriction is correct and should be preserved.

### Request Body Size Limit Before JSON Parsing (LOW)

`POST /api/v1/inbox` and `POST /api/v1/inbox/:id/clarify` call `req.json()` which reads the full request body into Worker memory before parsing. A malicious client can send a 10MB+ request body, forcing the Worker to buffer it entirely before the Content-Type or domain validation runs. Cloudflare Workers have a 128MB memory limit per isolate; repeated large-body attacks can force isolate recycling and increase cold-start frequency across other tenants.

**Mitigation**: Apply to all JSON mutation endpoints (`POST /api/v1/inbox`, `POST /api/v1/inbox/:id/clarify`) — not to GET endpoints or HTMX HTML partials (which use form-encoded bodies already guarded by the 4 KB `MAX_BODY_BYTES` pattern in `AuthPageHandlers.ts`). Hono has no built-in body size middleware; implement the same manual pattern already established in `AuthPageHandlers.parseValidatedAuthForm()`:

```typescript
// In each JSON mutation handler, before req.json():
const contentLength = Number(c.req.header('Content-Length') ?? '0');
if (contentLength > 16_384) {
  return c.json({ error: { code: 'payload_too_large', message: 'Request body exceeds maximum size' } }, 413);
}
// Chunked encoding guard (Content-Length may be absent):
const rawBody = await c.req.text();
if (rawBody.length > 16_384) {
  return c.json({ error: { code: 'payload_too_large', message: 'Request body exceeds maximum size' } }, 413);
}
const body = JSON.parse(rawBody) as unknown;
```

The `16384` limit (16 KB) covers the maximum valid payload: 255-char title + 2000-char description + JSON key/value overhead + CSRF token, with headroom. This pattern reads the body exactly once as text, checks size, then parses JSON — avoiding the double-read issue of checking `Content-Length` and then calling `req.json()`. Define a shared constant `MAX_API_BODY_BYTES = 16_384` in `src/presentation/handlers/AppApiHandlers.ts`.

### Audit Event Payload Size (LOW)

The `payload` column is unbounded TEXT. A max-length description (2000 chars) plus full entity state snapshot could produce very large payloads. No explicit size limit is defined.

**Mitigation**: Document a soft limit: serialize only the defined entity fields. Do not include computed or join fields. Add a note in `AuditEvent.record()` that `payload` should be `JSON.stringify` of the minimal entity snapshot.

### OpenAPI ErrorEnvelope Missing Error Codes (LOW)

The "Error Code Enum Inconsistency" finding covers adding `unauthenticated` and `workspace_not_found` to the `ErrorEnvelope.error.code` enum. Three additional codes defined in the plan's implementation patterns are also absent from the enum at `contracts/openapi.yaml` lines 26–33:

- `payload_too_large` (returned as 413 from JSON mutation endpoints per Request Body Size Limit mitigation)
- `provisioning_failed` (returned as 503 from `requireWorkspace` when workspace setup failed per Provisioning Hook Failure mitigation)
- `internal_error` (returned as 500 from the global `app.onError()` handler per No Global Error Handler mitigation)

**Mitigation**: Add all five missing codes (`unauthenticated`, `workspace_not_found`, `payload_too_large`, `provisioning_failed`, `internal_error`) to the `ErrorEnvelope.error.code` enum in `contracts/openapi.yaml`. Clients using generated SDK types from the spec will otherwise receive unknown enum values for these responses.

### HTMX Session Expiry — 302 Redirect Swaps Login Into Content (HIGH)

`requireAuth` issues a 302 redirect to `/auth/sign-in?redirectTo=...` when a session is missing or expired. For standard browser navigation this is correct. For HTMX XHR requests (`HX-Request: true` header present), the browser follows the 302 redirect transparently and HTMX swaps the login page HTML into whatever `hx-target` the partial was addressing — rendering the login form inside the inbox list, action row, or dashboard widget. The user sees broken layout and has no way to recover without a full page reload.

**Mitigation**: The existing `requireAuth` implementation (confirmed: `src/presentation/middleware/requireAuth.ts`) unconditionally calls `c.redirect()` — there is no HTMX detection in the current code. Both `requireAuth` AND `requireWorkspace` must be updated to detect HTMX requests via the `HX-Request` header and respond with `HX-Redirect` instead of a 302. Pattern:

```typescript
if (c.req.header('HX-Request') === 'true') {
  return new Response(null, {
    status: 401,
    headers: { 'HX-Redirect': `/auth/sign-in?redirectTo=${encodeURIComponent(url.pathname)}` },
  });
}
return c.redirect(`/auth/sign-in?redirectTo=${redirectTo}`, 302);
```

Apply to all 401 and 503 early-exit paths in both `requireAuth` and `requireWorkspace`. The `requireAuth` update must include a matching `requireAuth.spec.ts` test that sends `HX-Request: true` and asserts `HX-Redirect` in the response headers (not a 302).

### HTMX Partial Responses Missing Cache-Control (HIGH)

HTMX partial endpoints (`POST /app/_/inbox`, `GET /app/_/inbox/list`, `POST /app/_/inbox/:id/clarify`, `POST /app/_/actions/:id/activate`, `POST /app/_/actions/:id/complete`) return user-specific HTML fragments containing inbox items, action rows, and counts belonging to the authenticated user. Without `Cache-Control: no-store`, Cloudflare's edge cache or any intermediate proxy could cache one user's response and serve it to a different user who requests the same URL from the same IP or cache node.

The existing `AuthPageHandlers` pattern calls `applySecurityHeaders()` AND explicitly sets `Cache-Control: no-store, no-cache` via `makeFreshAuthHeaders()`. The new handlers must follow the same pattern.

**Mitigation**: All new HTML response builders in `AppPageHandlers` and `AppPartialHandlers` must set `Cache-Control: no-store` on every response that contains user-specific data. Helper function pattern:

```typescript
function makeUserHtmlHeaders(): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  applySecurityHeaders(headers);
  return headers;
}
```

The existing `applySecurityHeaders()` in `src/presentation/utils/securityHeaders.ts` must be called on all new HTML responses (page and partial). It is already imported and used in `AuthPageHandlers` — new handler files must import and apply it consistently.

---

## Edge Cases & Error Handling

### TOCTOU Race on Clarification (CRITICAL)

The `ClarifyInboxItemToAction` use case reads `inbox_item` status (via repository), validates it is `'inbox'`, then executes a D1 batch. Two concurrent requests can both pass the read-time check and both proceed to the batch, resulting in two actions being created for one inbox item and an inbox item with `clarified_into_id` pointing to the most-recently-written action.

**Mitigation**: The D1 batch `UPDATE inbox_item` statement must use a conditional `WHERE id = ? AND status = 'inbox'` (not just `WHERE id = ?`). After executing the batch, check `results[0].meta.changes === 1`. If `changes === 0`, the inbox item was already clarified by a concurrent request — abort and return 422 `invalid_status_transition`. This turns the batch into an optimistic-lock.

### Empty Actor ID in `requireWorkspace` Middleware (CRITICAL)

The plan's `requireWorkspace` code sets `actorId` to `''` if no actor is found:
```typescript
c.set('actorId', actor?.id ?? '');
```
An empty string `''` is not a valid UUID. Any use case that writes an audit event with `actorId = ''` will fail the `actor_id NOT NULL REFERENCES actor(id)` FK constraint at the D1 level, producing an unhandled 500 error instead of a clean 503.

**Mitigation**: If the actor lookup returns `null`, return 503 immediately — the same as the missing workspace case. Do not fall through with an empty actorId:
```typescript
if (!actor) {
  return c.json({ error: { code: 'workspace_not_found', message: 'Workspace actor not found' } }, 503);
}
c.set('actorId', actor.id);
```

### Audit Event FK Ordering in Workspace Provisioning (CRITICAL)

`ProvisionWorkspaceUseCase` creates a workspace, actor, 3 areas, and 5 contexts — and records audit events for each. The `audit_event.actor_id` column has `REFERENCES actor(id)` FK. If any audit events are recorded before the actor row is persisted, the FK constraint will fail.

**Mitigation**: The provisioning operation order must be strictly enforced:
1. `INSERT workspace` (no FK dependencies in this table)
2. `INSERT actor` (depends on workspace)
3. `INSERT area` × 3 (depends on workspace)
4. `INSERT context` × 5 (depends on workspace)
5. `INSERT audit_event` × 10 (depends on actor for `actor_id`) — ALL audit events last

**Use a single D1 batch for all provisioning inserts** (workspace + actor + 3 areas + 5 contexts + 10 audit events = 20 statements). Audit event statements must appear last in the batch array to ensure the actor row is committed before audit events reference it. This is the definitive implementation approach — see also the Provisioning Insert Efficiency note in Performance Considerations.

### D1 Batch Result Validation (HIGH)

D1 `db.batch()` returns a `D1Result[]` array, one entry per statement. If a statement affects 0 rows (e.g., the inbox item was not found, or was already clarified due to a race), the batch still "succeeds" from D1's perspective — no exception is thrown.

**Mitigation**: After executing the clarification batch, check `results[0].meta.changes` (the `UPDATE inbox_item` result). If `changes === 0`, the operation did not affect the expected row — return 422. Do not assume a non-throwing batch means business logic succeeded.

**Concrete TypeScript typing**: `D1Database.batch()` returns `Promise<D1Result<unknown>[]>`. Each `D1Result` has `meta: { changes: number; duration: number; last_row_id: number; rows_read: number; rows_written: number; }`. For the clarification batch, the `UPDATE inbox_item` is always statement index `0`; `Action` INSERT is index `1`; audit event INSERTs are indices 2+. Check with:
```typescript
const results = await this.db.batch([updateInboxItem, insertAction, ...insertAuditEvents]);
const inboxChanges = results[0]?.meta.changes ?? 0;
if (inboxChanges === 0) return false; // TOCTOU: inbox item already clarified
```

### Provisioning Hook Failure Leaves Orphaned User (HIGH)

`better-auth`'s `databaseHooks.user.create.after` hook fires after the user row is committed. If the hook throws (e.g., D1 transient error), better-auth may return success to the caller while the user has no workspace. Subsequent requests from this user will hit the `requireWorkspace` 503 path with no recovery mechanism visible to the user.

**Mitigation**:
- Wrap the entire provisioning operation in a try/catch in the hook. Log the error with the `userId`.
- Return a clear 503 with `{ "error": { "code": "provisioning_failed", "message": "Workspace setup is not complete. Please retry or contact support." } }` from `requireWorkspace` when workspace is missing.
- Document the manual recovery path: an admin can re-trigger provisioning for a user by calling `ProvisionWorkspaceUseCase` with their `userId`.
- **Required idempotency guard**: `ProvisionWorkspaceUseCase` MUST check whether a workspace already exists for the `userId` before executing any inserts. If a workspace is found, return it immediately (no-op). This makes re-runs safe and prevents `UNIQUE constraint failed` errors from concurrent provisioning attempts or hook retries.

### Concurrent Provisioning (MEDIUM)

If (somehow) two signup requests race for the same user (e.g., retry on network timeout), both could attempt to create a workspace for the same `userId`. The `UNIQUE` constraint on `workspace.user_id` will reject the second insert — but if this unhandled exception propagates, the user could receive a 500.

**Mitigation**: `ProvisionWorkspaceUseCase` should handle `UNIQUE constraint failed` on workspace insertion gracefully — detect it as "workspace already exists" and return success (idempotent behavior).

**Concrete detection pattern**: D1 throws a standard `Error` whose `.message` includes `"UNIQUE constraint failed"` (SQLite error text). Detect it as:
```typescript
try {
  await this.db.batch([insertWorkspace, insertActor, ...insertAreas, ...insertContexts, ...insertAuditEvents]);
} catch (err: unknown) {
  if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
    // Concurrent provisioning race — workspace already exists, treat as success
    return;
  }
  throw err;
}
```
This guard is secondary to the idempotency pre-check (`getByUserId()` before batching). The `catch` covers the narrow window between the pre-check and the batch execution.

### No Global Error Handler for Unhandled Exceptions (MEDIUM)

`worker.ts` has no `app.onError()` registration. If an unhandled exception escapes a handler's try/catch (e.g., a D1 runtime error from a malformed query, a Drizzle schema mismatch, or an unexpected null dereference in `serviceFactory`), Hono's default error handling returns either a plain-text `Internal Server Error` or the raw exception message in the response body. This leaks stack traces, SQL query fragments, or Drizzle error details to the client, and breaks the `{ "error": { "code": "...", "message": "..." } }` error envelope contract (FR-014).

**Mitigation**: Register a global `app.onError()` in `worker.ts` before route registration:
```typescript
app.onError((err, c) => {
  // Log internally for diagnostics
  console.error('Unhandled error', err);
  return c.json({ error: { code: 'internal_error', message: 'An unexpected error occurred' } }, 500);
});
```
This ensures all paths return a consistent error envelope, and no internal details are exposed. The handler must be registered before route definitions so it catches errors from all registered handlers.

### Non-Deterministic List Ordering (MEDIUM)

`ListInboxItemsUseCase` and `ListActionsUseCase` execute SQL `SELECT` queries with no `ORDER BY` clause. D1 (SQLite) returns rows in insertion order under normal conditions but does not guarantee this — rows can appear in different orders after B-tree rebalancing following DELETE operations (which can occur in future slices). Users will see their inbox items and actions in inconsistent order between page loads, making the HTMX UI confusing and making acceptance tests that assert list contents by position unreliable.

**Mitigation**: The following specific queries in these two repositories must add `ORDER BY created_at DESC`:
- `D1InboxItemRepository.listByWorkspaceId()` — the `SELECT * FROM inbox_item WHERE workspace_id = ?` query
- `D1ActionRepository.listByWorkspaceIdAndStatus()` — the `SELECT * FROM action WHERE workspace_id = ? AND status = ?` query
- `D1ActionRepository.listByWorkspaceId()` (if it exists as a general lister) — same pattern

Document `sort: "created_at DESC"` in the OpenAPI spec description for `GET /api/v1/inbox` and `GET /api/v1/actions`. Acceptance tests must assert that the first item in the response is the most recently created item — this makes ordering observable and regression-protected.

### Inbox List Returns Clarified Items (LOW)

`GET /api/v1/inbox` returns all inbox items regardless of status (including `clarified` items). The HTMX inbox page removes clarified items via partial swap after successful clarification, but on full page reload, clarified items reappear. This creates a UI inconsistency.

**Mitigation**: Document this as a known design decision. If the HTMX inbox page is intended to show only `inbox` status items (not `clarified`), the `ListInboxItemsUseCase` or the handler should filter to `status='inbox'` by default for the page context. The raw API endpoint may intentionally return all items. Clarify and document the intended behavior in the handler.

### Whitespace-Only Title Inputs (MEDIUM)

The domain validates `title.length >= 1` and `title.length <= 255`, but a title of `"   "` (255 spaces) passes both checks. Such a title is semantically empty and would render as blank text in the UI.

**Mitigation**: Add `.trim()` validation in domain factory methods: `InboxItem.create()` and `Action.create()` must call `title.trim()` before length-checking and store the trimmed value. Return `DomainError('title_required')` if the trimmed length is 0. Apply the same trim-before-validate logic to `description`.

### Description Field Max Length Not Validated in Domain (MEDIUM)

The OpenAPI contract defines `description` as `maxLength: 2000` for both InboxItem and Action. However, the plan specifies domain validation only for `title` (1–255 chars, trim). If `InboxItem.create()` and `Action.create()` do not validate `description.length <= 2000`, a client can send a 100 000-character description that passes domain validation, succeeds in D1 (TEXT is unbounded), and is serialized in full in both the DTO response and the audit event payload — violating the contract and inflating response/audit sizes.

**Mitigation**: `InboxItem.create()` and `Action.create()` must validate that `description`, when provided and non-empty after trim, does not exceed 2000 characters. Return `DomainError('description_too_long')` on violation. This aligns domain enforcement with the OpenAPI schema.

### Missing FK Constraint on `clarified_into_id` (HIGH)

The `inbox_item` DDL defines `clarified_into_id TEXT` without `REFERENCES action(id)`. If an action row is deleted (possible in a future slice), the inbox item retains a dangling `clarified_into_id` that points to nothing. D1 will not detect this inconsistency and the DTO will serialize a UUID pointing to a non-existent action.

**Mitigation**: Add `REFERENCES action(id) ON DELETE RESTRICT` to the `clarified_into_id` column in `0006_inbox_item.sql`. `ON DELETE RESTRICT` prevents action deletion while an inbox item still references it — the correct invariant, since a clarified inbox item's provenance should not silently disappear. `ON DELETE CASCADE` would destroy the inbox item record (too destructive); `ON DELETE SET NULL` would silently create a dangling reference in the DTO. The Drizzle schema must declare `.references(() => actionTable.id, { onDelete: 'restrict' })` on `clarifiedIntoId`, matching the existing `authSchema.ts` `.references(() => user.id, { onDelete: 'cascade' })` syntax. Concrete SQL column definition:
```sql
`clarified_into_id` TEXT REFERENCES `action`(`id`) ON DELETE RESTRICT
```

### TOCTOU Race on Activate and Complete (MEDIUM)

The plan addresses the TOCTOU race for `ClarifyInboxItemToAction` with optimistic locking (`WHERE id = ? AND status = 'inbox'`). The same race exists for `ActivateAction` (`ready → active`) and `CompleteAction` (`active → done`). Two concurrent activate requests both read `status='ready'`, both pass domain validation, and both update to `active` — producing two `action.activated` audit events for one transition.

**Mitigation**: Apply the same optimistic-lock pattern — but **NOT in `save()`**. The `save()` method uses an `ON CONFLICT(id) DO UPDATE SET` upsert pattern (per `d1-patterns.md`) which unconditionally overwrites the row and cannot enforce a conditional prior status. Instead, `ActivateAction` and `CompleteAction` use cases must issue their own targeted UPDATE statement directly, separate from any `save()` call:

```typescript
// In ActivateActionUseCase.execute():
const stmt = db.prepare(
  `UPDATE action SET status = 'active', updated_at = ? WHERE id = ? AND workspace_id = ? AND status = 'ready'`
).bind(now, actionId, workspaceId);
const result = await stmt.run();
if ((result.meta.changes ?? 0) === 0) {
  return { ok: false, kind: 'invalid_status_transition' };
}
```

The same pattern applies to `CompleteAction` with `status = 'done'` and `AND status = 'active'`. The `save()` method remains for the initial `INSERT` (via `ON CONFLICT DO UPDATE`) of a new action row; all state transitions bypass it and use conditional UPDATEs. This scope is limited to `ActivateAction` and `CompleteAction` — no other state transitions exist in this slice.

### HTMX Mutation Partial Success Response Contract Undefined (HIGH)

The plan defines HTMX error response shapes in detail (inline form with errors, `role="alert"` container), but leaves the **success response format** unspecified for all three mutation partials. Without a concrete contract, implementers make inconsistent choices that may violate the US02 spec scenarios.

**Affected endpoints and required response contracts**:

1. **`POST /app/_/inbox/:id/clarify` success** → The inbox item row must disappear. Return `200 OK` with an empty body. The `hx-target` on the clarify trigger element must point to the `<li>` or `<div>` wrapper for the entire inbox row (not the inner form `<div>` used as the form swap target). The HTMX attribute on the row wrapper must be `hx-swap="outerHTML"` — an empty response replaces the outer element with nothing, removing the row from the DOM. Additionally, emit `HX-Trigger: {"inboxItemClarified": null}` so the dashboard inbox-count badge can listen for this event and refresh itself (the badge's HTMX `hx-trigger="inboxItemClarified from:body"` re-fetches its partial count).

2. **`POST /app/_/actions/:id/activate` success** → The action row must update in-place showing the "Complete" button. Return `200 OK` with the full updated `actionRow` partial HTML for the now-`active` action. Use `hx-swap="outerHTML"` on the action row's outer wrapper so the entire row is replaced.

3. **`POST /app/_/actions/:id/complete` success** → The action row must update in-place showing the "Done" badge with no action button. Return `200 OK` with the full updated `actionRow` partial HTML for the now-`done` action. Use `hx-swap="outerHTML"` on the action row's outer wrapper.

**Alpine.js constraint**: The Alpine.js `x-on:htmx:after-settle.window` event listener must be on a **parent element not replaced by the swap**. For clarify (empty response / row removal), no focus management is needed post-swap. For activate/complete, the row wrapper itself is replaced — the Alpine.js wrapper (if any) must be the row's parent container (`<ul>` or table body), not the row itself.

**Template structure discipline**: The two different swap targets (inner `<div>` for form expansion via `innerHTML`; outer row wrapper for row replacement via `outerHTML`) must use different `id` attributes so HTMX `hx-target` selectors are unambiguous. Confirm IDs are unique per-row (e.g., `id="inbox-row-${item.id}"`).

### `clarifiedIntoType`/`clarifiedIntoId` Nullability Invariant (LOW)

The domain enforces that `clarifiedIntoType` and `clarifiedIntoId` are always set together (both non-null when `status='clarified'`, both null when `status='inbox'`). However, `reconstitute(row)` hydrates from D1 without validating this invariant. A corrupted row with `status='clarified'` but `clarified_into_id=NULL` would produce an inconsistent DTO without any error.

**Mitigation**: `reconstitute()` should assert the invariant: if `status === 'clarified'` then both `clarifiedIntoType` and `clarifiedIntoId` must be non-null. Throw an `Error('Corrupted inbox_item row')` on violation. This makes data corruption detectable at hydration time rather than silently propagating to API consumers.

### Archived Areas in Clarify Form Select (HIGH)

`GET /api/v1/areas` returns areas of all statuses (both `active` and `archived`). The HTMX clarify inline form's area select is populated from this endpoint. An archived area will appear as a selectable option. When submitted, the clarification fails with 422 `area_not_active`. Users are presented a selection that appears valid but is rejected — a confusing UX with no visual indication in the dropdown.

**Mitigation**: The HTMX clarify form's area `<select>` must be populated from a filtered source that returns only `active` areas. **Chosen approach: Option (b)** — the `AppPartialHandlers` clarify form endpoint calls `AreaRepository.listActiveByWorkspaceId()` and passes only active areas to the template. This avoids changing the public `GET /api/v1/areas` contract, keeps API design clean, and is consistent with the partial handler's role of assembling view-specific data. Add a JSDoc comment in `AppPartialHandlers` noting that the clarify form uses a filtered area list (active only) distinct from the general areas API.

---

## Performance Considerations

### Unbounded List Responses (MEDIUM)

`GET /api/v1/inbox` and `GET /api/v1/actions` return all items with no limit. For this slice, data is small (~10 rows) and this is acceptable. However, the absence of a maximum is a latent issue.

**Mitigation**: Add `LIMIT 500` to both queries in `D1InboxItemRepository.listByWorkspaceId()` and `D1ActionRepository.listByWorkspaceIdAndStatus()`. After retrieving results, emit a `console.warn()` in the **use case** (not the repository) if the result count hits the cap:

```typescript
// In ListInboxItemsUseCase.execute():
const items = await this.inboxRepo.listByWorkspaceId(workspaceId);
if (items.length === 500) {
  console.warn('[ListInboxItemsUseCase] Result count hit 500-item safety cap', { workspaceId });
}
```

`console.warn()` in Workers runtime goes to the Cloudflare Workers tail log / real-time logs — no external logging service is needed. The 500 cap is not a UX pagination limit but a memory-safety guard; at the current 10-row scale it will never trigger. The cap value should be defined as a module constant `LIST_SAFETY_CAP = 500` shared between `ListInboxItemsUseCase` and `ListActionsUseCase`.

### Provisioning Insert Efficiency (LOW)

`ProvisionWorkspaceUseCase` creates 1 workspace + 1 actor + 3 areas + 5 contexts + 10 audit events = 20 separate save() calls if done sequentially through individual repositories. Each `save()` is a D1 round trip.

**Mitigation**: Use a single D1 batch for all 20 inserts. The `WorkspaceProvisioningService` should build all statements upfront and submit them in one `DB.batch([...])` call. This reduces provisioning from ~20 round trips to 1 round trip, which is significant for signup latency.

### Rate Limiting on New Endpoints (MEDIUM)

No rate limiting is defined for any of the new API endpoints (`POST /api/v1/inbox`, `POST /api/v1/inbox/:id/clarify`, `POST /api/v1/actions/*`, HTMX partials). A user or bot could flood the inbox with thousands of items per second, exhausting D1 write capacity.

**Mitigation**: For this slice, rely on the existing session-based authentication as a first line of defense (unauthenticated requests are rejected). Document that per-user rate limiting is a follow-up task for the next slice. If D1 write capacity is a concern in production, add a simple per-user counter in KV (e.g., `ratelimit:inbox:{userId}`) with a 60-second window.

### `requireWorkspace` Double D1 Round Trip (LOW)

The `requireWorkspace` middleware makes two serial D1 queries on every authenticated request: `getByUserId()` (workspace lookup) and `getHumanActorByWorkspaceId()` (actor lookup). At the current scale this adds ~4ms per request. For the dashboard page, which then makes further queries for inbox count and action count, this compounds.

**Mitigation**: For this slice, the overhead is acceptable given the single-user workspace model. Document this as a future optimization: cache the `(workspaceId, actorId)` tuple in KV keyed by session token, with a short TTL (e.g., 5 minutes). This would reduce middleware overhead from 2 D1 round trips to 1 KV read on cache hit.

---

## Accessibility Requirements

### ARIA Live Regions for HTMX Updates (HIGH)

When the dashboard quick-capture form submits and the inbox count updates (`hx-swap` targeting the count badge), screen readers are not notified of the DOM change unless the target element has `aria-live="polite"`. The spec scenario requires "the dashboard count updates without a full page reload" — this creates a silent change for assistive technology users.

**Mitigation**: All dynamic count badges (`inbox count`, `active action count`) in `pages/dashboard.ts` must have `aria-live="polite" aria-atomic="true"` on their container elements. Clarify form success/error partial responses must include an `aria-live="polite"` announcement region.

### Focus Management After HTMX Swaps (HIGH)

When the clarify inline form expands (spec scenario 3: click "Clarify" → form appears), keyboard focus remains on the "Clarify" button that triggered the swap. For keyboard users, focus must move to the first field of the newly expanded form, otherwise they must tab through all preceding elements to reach the form.

**Mitigation**: Use both mechanisms belt-and-suspenders — `autofocus` alone is unreliable across HTMX swap modes and is insufficient when the target element is outside the viewport. Required pattern:

1. Add `autofocus` attribute to the first focusable `<input>` in the `clarifyForm` partial template.
2. Wrap the HTMX swap target `<div>` (the action row container) with Alpine.js: `x-data x-on:htmx:after-settle.window="$el.querySelector('input,select,textarea')?.focus()"`.

Both must be present. The Alpine.js handler fires via the `htmx:afterSettle` DOM event on `window` regardless of which swap target triggered it, providing a reliable fallback when `autofocus` is not processed.

**Critical constraint on `hx-swap` mode**: The Alpine.js wrapper element (`x-data x-on:htmx:after-settle.window="..."`) must NOT be the element replaced by the HTMX swap. If `hx-swap="outerHTML"` targets the wrapper itself, Alpine.js removes the element from the DOM (along with its event listener) before the event fires. The clarify form `hx-target` must point to an **inner container** element (a child `<div>`) so the Alpine.js parent remains in the DOM across swaps. Use `hx-swap="innerHTML"` (the HTMX default) on the target child element — this leaves the Alpine.js `x-data` wrapper untouched. Never use `hx-swap="outerHTML"` on the element decorated with `x-on:htmx:after-settle.window`.

**Do NOT use `hx-on::after-settle`** — it is blocked by the existing `script-src 'self'` CSP (see CSP section above).

### Color + Text Status Labels (MEDIUM)

Action rows should communicate status through text labels, not color alone. Using only color (e.g., yellow for active, green for done) excludes color-blind users.

**Mitigation**: In `partials/actionRow.ts`, each row must display a DaisyUI `badge` with both a semantic color modifier and a text label. Use these specific DaisyUI 5 classes aligned to status semantics:

| Status | Badge class | Label text |
|--------|-------------|------------|
| `ready` | `badge badge-warning` | `Ready` |
| `active` | `badge badge-info` | `Active` |
| `done` | `badge badge-success` | `Done` |

Concrete pattern:
```typescript
const statusBadge = (status: ActionStatus): string => {
  const map: Record<ActionStatus, { cls: string; label: string }> = {
    ready:     { cls: 'badge badge-warning', label: 'Ready' },
    active:    { cls: 'badge badge-info',    label: 'Active' },
    done:      { cls: 'badge badge-success', label: 'Done' },
    // waiting/scheduled/archived not shown in this slice's list views
  };
  const { cls, label } = map[status] ?? { cls: 'badge', label: status };
  return `<span class="${cls}">${escapeHtml(label)}</span>`;
};
```

Color conveys status at a glance; the text label ensures color-blind users receive the same information. Buttons remain action-labeled: `<button>Activate</button>`, `<button>Complete</button>` — never just an icon or color indicator.

### Quick-Capture Form Missing Accessible Label (MEDIUM)

The plan covers `aria-describedby`, form error IDs, `role="alert"`, and `aria-live` regions extensively for the clarify form and count badges. However, it doesn't explicitly require an accessible `<label>` element for the dashboard quick-capture title input. Placeholder text is not a programmatically determinable label — it disappears on focus and is not reliably read by all screen readers (WCAG 2.1 SC 1.3.1 "Info and Relationships", SC 1.3.5 "Identify Input Purpose").

**Mitigation**: The title input in `pages/dashboard.ts` must have an explicit `<label>` associated via `for` attribute. Use a visually hidden label (DaisyUI/Tailwind `sr-only`) to preserve the visual card design while satisfying the accessibility requirement:

```typescript
html`
  <label for="capture-title" class="sr-only">Capture a thought or task</label>
  <input id="capture-title" name="title" type="text"
         placeholder="What do you need to do?"
         class="input input-bordered w-full" required />
`
```

Apply the same principle to any other new input elements across the UI that rely on placeholder text as their only label (e.g., area name or context name inputs in future slices).

### Form Error Accessibility (MEDIUM)

When validation fails during clarification (400/422 responses), the inline error HTML fragment returned by HTMX partial endpoints must be accessible to screen readers.

**Mitigation**: Follow the established pattern from `src/presentation/templates/pages/register.ts` (which uses constant IDs and `aria-describedby`). In `partials/clarifyForm.ts`:

1. Define deterministic error element IDs as module constants (not random, not runtime-generated):
```typescript
const TITLE_ERROR_ID = 'clarify-title-error';
const AREA_ERROR_ID  = 'clarify-area-error';
const CTX_ERROR_ID   = 'clarify-ctx-error';
```

2. Render field-level errors with `id` matching the constant, and link via `aria-describedby` on the input:
```typescript
// Input:
`<input id="clarify-title" name="title" aria-describedby="${TITLE_ERROR_ID}" ... />`
// Error (only when present):
`<p id="${TITLE_ERROR_ID}" class="text-error text-sm mt-1">${escapeHtml(fieldError)}</p>`
```

3. Wrap the form's general error in a `role="alert"` container (announced immediately by screen readers):
```typescript
`<div role="alert" class="alert alert-error mb-4">${escapeHtml(generalError)}</div>`
```

4. When multiple errors exist on one field (e.g., required + too long), collapse them into a single `<p>` element — `aria-describedby` points to one ID only. Priority order: required > format > length.

This pattern is consistent with the existing auth pages and requires no new utility functions.

### Activate/Complete Buttons Missing In-Flight Disabled State (MEDIUM)

The plan's TOCTOU optimistic lock handles duplicate server-side requests, but doesn't address the UX consequence: a user with a slow connection who double-clicks "Activate" sees a confusing 422 `invalid_status_transition` error swapped into the action row while the first request is already succeeding. This is disorienting — the user performed a valid action and got an error response.

**Mitigation**: Add `hx-disabled-elt="this"` to the Activate and Complete `<button>` elements in `partials/actionRow.ts`. This is a native HTMX feature (no custom JS required) that disables the triggering element for the duration of the request. The button is re-enabled if the request fails (preserving recovery ability) or is replaced if the request succeeds (the outerHTML swap replaces the entire row). Apply `hx-disabled-elt="this"` to the Quick-Capture submit button as well.

**Note**: This does NOT relax the TOCTOU lock requirement — both defences are needed. `hx-disabled-elt` protects the single browser tab; the server lock protects against concurrent requests from multiple tabs, API clients, and race conditions the browser cannot prevent.

### Dashboard Quick-Capture Focus After Submit (MEDIUM)

The plan addresses focus management for the clarify form (focus moves to first field on expansion), but not for the dashboard quick-capture form. After a capture submission, the form input should reset and focus should return to the title field so users can immediately capture a second item without clicking again.

**Mitigation**: Use Alpine.js on the quick-capture form. **Do NOT use `hx-on::after-settle`** — blocked by the existing `script-src 'self'` CSP (see CSP section above). Pattern for the form element in `pages/dashboard.ts`:
```html
<form x-data
      x-on:htmx:after-settle.window="$el.querySelector('[name=title]').value=''; $el.querySelector('[name=title]').focus()"
      hx-post="/app/_/inbox" ...>
```

**Note on error path**: `x-on:htmx:after-settle.window` fires on ALL responses, including 4xx validation errors. For the quick-capture form this is the correct behavior — on a validation error the title field resets and receives focus, allowing the user to try again immediately without a click. The error message is rendered in the HTMX swap target (separate element), so clearing the title input on error is intentional.

---

## Audit Trail Design Decisions

### Cascade Delete of Audit Events (MEDIUM)

The `audit_event` table has `REFERENCES workspace(id) ON DELETE CASCADE`. If a workspace is deleted (e.g., via user account deletion), all audit events are permanently deleted. If audit events are intended as compliance/forensic records, they should survive workspace deletion.

**Mitigation**: For this slice (no account deletion), this is not an immediate risk. However, document the design decision explicitly: audit events are operational records for this system, not compliance-grade forensic logs. If compliance-grade immutability is required in a future slice, the cascade should be removed and a soft-delete pattern used instead.

### PII Retention in Audit Event Payloads (LOW)

The `payload` column stores a full JSON snapshot of the entity at event time, including `title` and `description` fields. Users may capture PII in these fields (names, phone numbers, email addresses, medical information). Audit events are immutable and append-only — even if a user later edits or deletes an entity, the audit trail permanently retains the prior snapshot with PII intact.

**Mitigation**: For this slice, document this as a known design decision: audit payloads contain entity snapshots as-of the mutation. PII handling and retention policy (e.g., right-to-erasure under GDPR) is deferred to a future slice. If right-to-erasure support is required, audit payloads should store only entity IDs and changed field names — not field values — with the full snapshot stored in a separate time-limited store.
