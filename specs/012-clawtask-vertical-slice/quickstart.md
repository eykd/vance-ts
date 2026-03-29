# Implementation Quickstart: ClawTask Vertical Slice

**Branch**: `012-clawtask-vertical-slice`
**Spec**: `specs/012-clawtask-vertical-slice/spec.md`
**Plan**: `specs/012-clawtask-vertical-slice/plan.md`

---

## Build Order

Implement layers in dependency order. Each layer can only import from layers below it.

```
Domain → Application → Infrastructure → DI + Presentation → Routes
```

Within the domain layer, implement entities from simplest to most complex:

```
Context → Area → Workspace → Actor → InboxItem → Action → AuditEvent
```

---

## Layer 1: Domain Entities

**Location**: `src/domain/entities/`
**TDD**: Write `.spec.ts` before each entity.

For each entity, implement:

1. A TypeScript `class` or `interface` + `type` for the domain object
2. A `create()` factory (validates invariants, generates UUID + timestamps)
3. A `reconstitute()` factory (hydrates from DB row; no validation)
4. Behavior methods for state transitions (return new instances — entities are immutable)
5. A `DomainError` (or reuse existing error type) for invariant violations

**Key implementation notes**:

```typescript
// IDs: always server-generated
const id = crypto.randomUUID();

// Timestamps: ISO-8601 UTC strings
const now = new Date().toISOString();

// Status transitions: throw DomainError on invalid
if (this.status !== 'ready') {
  throw new DomainError(
    'invalid_status_transition',
    `Action cannot be activated from status '${this.status}'`
  );
}
```

**Entities to implement** (in order):

1. `Context` — simplest, no behavior methods
2. `Area` — status: active/archived
3. `Workspace` — no behavior, just factory
4. `Actor` — type: human (only), no behavior
5. `InboxItem` — status: inbox → clarified; `clarify(actionId)` method
6. `Action` — status: ready → active → done; `activate()` + `complete()` methods
7. `AuditEvent` — immutable `record()` factory only

---

## Layer 2: Domain Interfaces (Repository Ports)

**Location**: `src/domain/interfaces/`

Create one interface file per entity:

- `InboxItemRepository.ts`
- `ActionRepository.ts`
- `AreaRepository.ts`
- `ContextRepository.ts`
- `WorkspaceRepository.ts`
- `ActorRepository.ts`
- `AuditEventRepository.ts`

These are TypeScript `interface` definitions only — no implementations.

---

## Layer 3: Application DTOs

**Location**: `src/application/dto/`

Create one DTO file per entity:

- `InboxItemDto.ts` — type alias for the API response shape
- `ActionDto.ts`
- `AreaDto.ts`
- `ContextDto.ts`

Include a mapper function in each DTO file that converts domain entities to DTOs:

```typescript
export function toInboxItemDto(item: InboxItem): InboxItemDto { ... }
```

---

## Layer 4: Application Use Cases

**Location**: `src/application/use-cases/`
**TDD**: Write `.spec.ts` before each use case. Mock all repository dependencies.

Use cases to implement (in order):

1. `ProvisionWorkspaceUseCase` — creates workspace + actor + 3 areas + 5 contexts
2. `CaptureInboxItemUseCase` — creates inbox item + audit event
3. `ListInboxItemsUseCase` — queries by workspace
4. `ListAreasUseCase` — queries by workspace
5. `ListContextsUseCase` — queries by workspace
6. `ClarifyInboxItemToActionUseCase` — validates, creates action, D1 batch
7. `ListActionsUseCase` — queries by workspace + optional status filter
8. `ActivateActionUseCase` — transitions status, saves, records audit event
9. `CompleteActionUseCase` — transitions status, saves, records audit event

**Pattern** (consistent with existing use cases):

```typescript
export type CaptureInboxItemRequest = {
  title: string;
  description?: string;
  workspaceId: string;
  actorId: string;
};
export type CaptureInboxItemResult =
  | { ok: true; item: InboxItemDto }
  | { ok: false; kind: 'validation_error' | 'service_error'; message?: string };

export class CaptureInboxItemUseCase {
  constructor(
    private readonly inboxItemRepo: InboxItemRepository,
    private readonly auditEventRepo: AuditEventRepository
  ) {}

  async execute(request: CaptureInboxItemRequest): Promise<CaptureInboxItemResult> {
    try {
      // 1. Domain validation (via entity factory — throws DomainError)
      // 2. Save entity
      // 3. Record audit event
      // 4. Return DTO
    } catch (err) {
      if (err instanceof DomainError) {
        return { ok: false, kind: 'validation_error', message: err.message };
      }
      return { ok: false, kind: 'service_error' };
    }
  }
}
```

**ClarifyInboxItemToAction special case** — uses D1 batch for atomicity:

```typescript
// This use case receives the raw D1Database binding (not repositories)
// so it can call env.DB.batch([...]) directly for the atomic update+insert.
// The repositories are still used for reads (validation) before the batch.
```

---

## Layer 5: Infrastructure — Drizzle Schema

**Location**: `src/infrastructure/schema/clawtaskSchema.ts`

Define all 6 new tables using `drizzle-orm/sqlite-core`. See `data-model.md` for the full Drizzle schema TypeScript code.

---

## Layer 6: Infrastructure — Repositories

**Location**: `src/infrastructure/repositories/`
**Tests**: Integration tests with `.integration.test.ts` suffix using real D1 bindings via `@cloudflare/vitest-pool-workers`.

For each repository:

1. Implement the domain interface
2. Use Drizzle queries for all reads (type-safe, automatic column mapping)
3. Use Drizzle queries for inserts/updates too (except ClarifyInboxItemToAction batch)
4. Always scope queries with `workspace_id = ?`
5. Map D1 row → domain entity via `reconstitute()`

```typescript
export class D1InboxItemRepository implements InboxItemRepository {
  constructor(private readonly db: DrizzleD1Database) {}

  async getById(id: string, workspaceId: string): Promise<InboxItem | null> {
    const row = await this.db
      .select()
      .from(inboxItemTable)
      .where(and(eq(inboxItemTable.id, id), eq(inboxItemTable.workspaceId, workspaceId)))
      .get();
    return row ? InboxItem.reconstitute(row) : null;
  }
  // ...
}
```

---

## Layer 7: Infrastructure — Workspace Provisioning Service

**Location**: `src/infrastructure/WorkspaceProvisioningService.ts`

This service provisions the full workspace scaffold for a new user:

1. Create `Workspace` entity
2. Create `Actor` entity (human)
3. Create 3 `Area` entities: Work, Personal, Admin
4. Create 5 `Context` entities: computer, calls, home, errands, office
5. Record `AuditEvent` entries for each created entity (or a single batch event)
6. Persist all via their repositories (or use D1 batch for atomicity)

Wire it into `getAuth(env)` in `src/infrastructure/auth.ts` via the `databaseHooks.user.create.after` hook (verify hook name against installed better-auth version — see research.md Decision 1).

---

## Layer 8: Presentation — HTMX Templates

**Location**: `src/presentation/templates/`

All templates are pure TypeScript functions returning `string` (HTML). No JSX.

```typescript
export function dashboardPage(data: DashboardData): string {
  return `<!DOCTYPE html>
<html lang="en">
  ...
  <main>${inboxCountBadge(data.inboxCount)}${quickCaptureForm()}</main>
  ...
</html>`;
}
```

**Pages to implement**:

- `pages/dashboard.ts` — Quick capture form + inbox count + active action count
- `pages/inbox.ts` — Inbox list with inline clarify form
- `pages/actions.ts` — Action list with Activate/Complete buttons

**Partials to implement**:

- `partials/inboxList.ts` — `<tr>` rows for inbox items
- `partials/clarifyForm.ts` — Inline form with area + context selects
- `partials/actionRow.ts` — Single `<tr>` row for an action (with status-appropriate button)

---

## Layer 9: Presentation — API Handlers

**Location**: `src/presentation/handlers/`

```typescript
export class InboxApiHandlers {
  constructor(
    private readonly captureInboxItem: CaptureInboxItemUseCase,
    private readonly listInboxItems: ListInboxItemsUseCase,
    private readonly clarifyInboxItem: ClarifyInboxItemToActionUseCase
  ) {}

  async handlePost(c: Context<AppEnv>): Promise<Response> {
    const { workspaceId, actorId } = c.var; // set by requireWorkspace middleware
    const body = await c.req.json<{ title?: string; description?: string }>();
    // validate → execute → return JSON
  }
}
```

**Handlers to implement**:

- `InboxApiHandlers` — POST /api/v1/inbox, GET /api/v1/inbox, POST /api/v1/inbox/:id/clarify
- `ActionApiHandlers` — POST /api/v1/actions/:id/activate, POST /api/v1/actions/:id/complete, GET /api/v1/actions
- `AreaApiHandlers` — GET /api/v1/areas
- `ContextApiHandlers` — GET /api/v1/contexts
- `AppPageHandlers` — GET /app, GET /app/inbox, GET /app/actions
- `AppPartialHandlers` — POST/GET /app/\_/\* routes

---

## Layer 10: Middleware — requireWorkspace

**Location**: `src/presentation/middleware/requireWorkspace.ts`

Runs after `requireAuth`. Resolves workspace and actor from the authenticated user:

```typescript
export async function requireWorkspace(c: Context<AppEnv>, next: Next): Promise<void> {
  const user = c.var.user;
  const workspace = await workspaceRepo.getByUserId(user.id);
  if (!workspace) {
    c.status(503);
    return c.json({ error: { code: 'workspace_not_found', message: '...' } });
  }
  const actor = await actorRepo.getHumanActorByWorkspaceId(workspace.id);
  c.set('workspaceId', workspace.id);
  c.set('actorId', actor?.id ?? '');
  await next();
}
```

---

## Layer 11: DI Wiring

**Location**: `src/di/serviceFactory.ts` (extend existing)

Add lazy getters for all new repositories and use cases. Follow the existing `??=` lazy initialization pattern. Add `requireWorkspaceMiddleware` getter for use in `worker.ts`.

---

## Layer 12: Route Registration

**Location**: `src/worker.ts` (extend existing)

```typescript
// API v1 routes
const v1 = app.basePath('/api/v1');
v1.use('/*', requireWorkspaceMiddleware);
v1.get('/inbox', handleGetInbox);
v1.post('/inbox', handlePostInbox);
v1.post('/inbox/:id/clarify', handleClarifyInboxItem);
v1.get('/actions', handleGetActions);
v1.post('/actions/:id/activate', handleActivateAction);
v1.post('/actions/:id/complete', handleCompleteAction);
v1.get('/areas', handleGetAreas);
v1.get('/contexts', handleGetContexts);

// App pages
app.use('/app/*', requireWorkspaceMiddleware); // add to existing requireAuth chain
app.get('/app', handleDashboard);
app.get('/app/inbox', handleInboxPage);
app.get('/app/actions', handleActionsPage);

// App partials
app.post('/app/_/inbox', handleCapturePartial);
app.get('/app/_/inbox', handleInboxListPartial);
app.get('/app/_/inbox/:id/clarify-form', handleClarifyFormPartial);
app.post('/app/_/inbox/:id/clarify', handleClarifyPartial);
app.get('/app/_/actions', handleActionsListPartial);
app.post('/app/_/actions/:id/activate', handleActivatePartial);
app.post('/app/_/actions/:id/complete', handleCompletePartial);
```

---

## Database Migrations

**Location**: `migrations/`

Run migrations in order: `0002_workspace.sql` through `0008_audit_event.sql`. See `data-model.md` for full DDL.

Apply locally:

```bash
npx wrangler d1 execute clawtask-dev --local --file=migrations/0002_workspace.sql
# ... repeat for each migration
```

---

## Testing Strategy

**Unit tests** (colocated `.spec.ts`):

- Domain entities: factory invariants, state machine transitions, invalid transition errors
- Use cases: all happy paths + error branches; mock all repositories with `vi.fn()`
- Handlers: mock use cases; verify HTTP status codes + response shapes

**Integration tests** (colocated `.integration.test.ts`):

- D1 repositories: real SQLite via `@cloudflare/vitest-pool-workers`; verify workspace scoping

**Acceptance tests** (`specs/acceptance-specs/`):

- US01: Signup → workspace provisioned → areas + contexts accessible
- US03: Capture inbox item → 201 + audit event
- US04: Clarify inbox item → action created + inbox item clarified + 2 audit events
- US05: Activate + complete action → status transitions + audit events

**Coverage**: 100% required for all TypeScript in `src/` (unit + integration). Workers runtime code is exempt from v8 coverage but must be tested via acceptance tests.

---

## Acceptance Specs Skeleton

For each user story, create a GWT spec file at `specs/acceptance-specs/`:

- `US01-workspace-provisioning.spec`
- `US03-inbox-capture.spec`
- `US04-clarify-inbox-item.spec`
- `US05-activate-complete-action.spec`

Follow the `/acceptance-tests` skill for spec format and stub binding.
