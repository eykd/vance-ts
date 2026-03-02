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

better-auth's `databaseHooks.user.create.after` (or custom plugin if the `after` variant is unavailable) fires synchronously during signup. This guarantees every authenticated user has a workspace. See `research.md` Decision 1 for fallback details.

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

## Applied Learnings

No prior solutions documented yet in `.specify/solutions/`. This is the first feature slice.

---

## Security Considerations

### XSS in HTMX Templates (HIGH)

All templates are pure TypeScript string concatenation. User-supplied fields (`title`, `description`) rendered directly into HTML without escaping are a stored XSS vector. An inbox item with title `<script>alert(1)</script>` would execute in any user's browser who views the page.

**Mitigation**: Implement a mandatory `escapeHtml(value: string): string` utility in `src/presentation/templates/` and call it on every user-supplied string before interpolation into HTML. Apply to: `title`, `description`, `name`, and any other user-provided field rendered in templates. See the `/typescript-html-templates` skill for the standard pattern.

### CSRF for HTMX Mutation Endpoints (HIGH)

The existing CSRF protection (double-submit cookie, `__Host-csrf`) is only validated in `AuthPageHandlers.ts`. The new HTMX mutation endpoints (`POST /app/_/inbox`, `POST /app/_/inbox/:id/clarify`, `POST /app/_/actions/:id/activate`, `POST /app/_/actions/:id/complete`) are susceptible to cross-site request forgery if CSRF validation is not applied.

**Mitigation**: All HTMX mutation handlers must validate the `_csrf` form parameter against the `__Host-csrf` cookie using the existing `timingSafeStringEqual` utility (already in `src/presentation/utils/`). HTMX forms in templates must include `<input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}">`. The `csrfToken` is already set in Hono context by `requireAuth` — pass it through from page handlers to template functions.

### Status Query Parameter Injection (HIGH)

`GET /api/v1/actions?status=<value>` accepts an arbitrary string. The domain `Action` entity has 6 statuses (`ready`, `active`, `done`, `waiting`, `scheduled`, `archived`), but the OpenAPI spec documents only 3 valid filter values (`ready`, `active`, `done`). An undocumented value like `status=waiting` would silently call `listByWorkspaceIdAndStatus` with an unvalidated value, potentially returning unexpected results or exposing future-state data.

**Mitigation**: The `ActionApiHandlers` handler must validate the `status` query parameter against the documented enum `['ready', 'active', 'done']` before passing to the use case. Return 400 `{ "error": { "code": "validation_error", "message": "Invalid status filter" } }` for unknown values.

### UUID Format Validation on Path Parameters (LOW)

Path parameters like `:id` in `/api/v1/inbox/:id/clarify` are used directly in DB queries. While Drizzle parameterizes queries (preventing SQL injection), passing 500-character strings causes unnecessary DB round trips.

**Mitigation**: Validate that `:id` path parameters match UUID v4 format (`/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`) before dispatching to the use case. Return 400 on invalid format.

### Audit Event Payload Size (LOW)

The `payload` column is unbounded TEXT. A max-length description (2000 chars) plus full entity state snapshot could produce very large payloads. No explicit size limit is defined.

**Mitigation**: Document a soft limit: serialize only the defined entity fields. Do not include computed or join fields. Add a note in `AuditEvent.record()` that `payload` should be `JSON.stringify` of the minimal entity snapshot.

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

Consider using a D1 batch for the entire provisioning set for atomicity, with audit events as the final statements in the batch.

### D1 Batch Result Validation (HIGH)

D1 `db.batch()` returns a `D1Result[]` array, one entry per statement. If a statement affects 0 rows (e.g., the inbox item was not found, or was already clarified due to a race), the batch still "succeeds" from D1's perspective — no exception is thrown.

**Mitigation**: After executing the clarification batch, check `results[0].meta.changes` (the `UPDATE inbox_item` result). If `changes === 0`, the operation did not affect the expected row — return 422. Do not assume a non-throwing batch means business logic succeeded.

### Provisioning Hook Failure Leaves Orphaned User (HIGH)

`better-auth`'s `databaseHooks.user.create.after` hook fires after the user row is committed. If the hook throws (e.g., D1 transient error), better-auth may return success to the caller while the user has no workspace. Subsequent requests from this user will hit the `requireWorkspace` 503 path with no recovery mechanism visible to the user.

**Mitigation**:
- Wrap the entire provisioning operation in a try/catch in the hook. Log the error with the `userId`.
- Return a clear 503 with `{ "error": { "code": "provisioning_failed", "message": "Workspace setup is not complete. Please retry or contact support." } }` from `requireWorkspace` when workspace is missing.
- Document the manual recovery path: an admin can re-trigger provisioning for a user by calling `ProvisionWorkspaceUseCase` with their `userId`.
- Consider an idempotency guard: `ProvisionWorkspaceUseCase` should check if a workspace already exists before creating one, to make re-runs safe.

### Concurrent Provisioning (MEDIUM)

If (somehow) two signup requests race for the same user (e.g., retry on network timeout), both could attempt to create a workspace for the same `userId`. The `UNIQUE` constraint on `workspace.user_id` will reject the second insert — but if this unhandled exception propagates, the user could receive a 500.

**Mitigation**: `ProvisionWorkspaceUseCase` should handle `UNIQUE constraint failed` on workspace insertion gracefully — detect it as "workspace already exists" and return success (idempotent behavior).

### Inbox List Returns Clarified Items (LOW)

`GET /api/v1/inbox` returns all inbox items regardless of status (including `clarified` items). The HTMX inbox page removes clarified items via partial swap after successful clarification, but on full page reload, clarified items reappear. This creates a UI inconsistency.

**Mitigation**: Document this as a known design decision. If the HTMX inbox page is intended to show only `inbox` status items (not `clarified`), the `ListInboxItemsUseCase` or the handler should filter to `status='inbox'` by default for the page context. The raw API endpoint may intentionally return all items. Clarify and document the intended behavior in the handler.

---

## Performance Considerations

### Unbounded List Responses (MEDIUM)

`GET /api/v1/inbox` and `GET /api/v1/actions` return all items with no limit. For this slice, data is small (~10 rows) and this is acceptable. However, the absence of a maximum is a latent issue.

**Mitigation**: Document a soft limit of 500 items in both `ListInboxItemsUseCase` and `ListActionsUseCase` as a safety cap (`LIMIT 500` on the SQL query). This is not pagination — it prevents runaway responses if data grows. Log a warning if the result count equals the cap.

### Provisioning Insert Efficiency (LOW)

`ProvisionWorkspaceUseCase` creates 1 workspace + 1 actor + 3 areas + 5 contexts + 10 audit events = 20 separate save() calls if done sequentially through individual repositories. Each `save()` is a D1 round trip.

**Mitigation**: Use a single D1 batch for all 20 inserts. The `WorkspaceProvisioningService` should build all statements upfront and submit them in one `DB.batch([...])` call. This reduces provisioning from ~20 round trips to 1 round trip, which is significant for signup latency.

### Rate Limiting on New Endpoints (MEDIUM)

No rate limiting is defined for any of the new API endpoints (`POST /api/v1/inbox`, `POST /api/v1/inbox/:id/clarify`, `POST /api/v1/actions/*`, HTMX partials). A user or bot could flood the inbox with thousands of items per second, exhausting D1 write capacity.

**Mitigation**: For this slice, rely on the existing session-based authentication as a first line of defense (unauthenticated requests are rejected). Document that per-user rate limiting is a follow-up task for the next slice. If D1 write capacity is a concern in production, add a simple per-user counter in KV (e.g., `ratelimit:inbox:{userId}`) with a 60-second window.

---

## Accessibility Requirements

### ARIA Live Regions for HTMX Updates (HIGH)

When the dashboard quick-capture form submits and the inbox count updates (`hx-swap` targeting the count badge), screen readers are not notified of the DOM change unless the target element has `aria-live="polite"`. The spec scenario requires "the dashboard count updates without a full page reload" — this creates a silent change for assistive technology users.

**Mitigation**: All dynamic count badges (`inbox count`, `active action count`) in `pages/dashboard.ts` must have `aria-live="polite" aria-atomic="true"` on their container elements. Clarify form success/error partial responses must include an `aria-live="polite"` announcement region.

### Focus Management After HTMX Swaps (HIGH)

When the clarify inline form expands (spec scenario 3: click "Clarify" → form appears), keyboard focus remains on the "Clarify" button that triggered the swap. For keyboard users, focus must move to the first field of the newly expanded form, otherwise they must tab through all preceding elements to reach the form.

**Mitigation**: In the `clarifyForm` partial template, include `hx-on::after-settle="this.querySelector('input,select,textarea')?.focus()"` on the swap target, or add a small `autofocus` attribute to the first focusable element in the form partial (browser autofocus moves focus after insertion).

### Color + Text Status Labels (MEDIUM)

Action rows should communicate status through text labels, not color alone. Using only color (e.g., yellow for active, green for done) excludes color-blind users.

**Mitigation**: In `partials/actionRow.ts`, each row must display a text status badge (e.g., `<span class="badge">Ready</span>`) alongside any color indicator. Status badges should use both color and text. Buttons should be labeled by action, not status (e.g., "Activate" not just a colored dot).

### Form Error Accessibility (MEDIUM)

When validation fails during clarification (400/422 responses), the inline error HTML fragment returned by HTMX partial endpoints must be accessible to screen readers.

**Mitigation**: Error fragments must include `role="alert"` on the error container so screen readers announce them immediately. Field-level errors should use `aria-describedby` to link error text to the offending input. In `partials/clarifyForm.ts`, include proper ARIA error patterns.

---

## Audit Trail Design Decisions

### Cascade Delete of Audit Events (MEDIUM)

The `audit_event` table has `REFERENCES workspace(id) ON DELETE CASCADE`. If a workspace is deleted (e.g., via user account deletion), all audit events are permanently deleted. If audit events are intended as compliance/forensic records, they should survive workspace deletion.

**Mitigation**: For this slice (no account deletion), this is not an immediate risk. However, document the design decision explicitly: audit events are operational records for this system, not compliance-grade forensic logs. If compliance-grade immutability is required in a future slice, the cascade should be removed and a soft-delete pattern used instead.
