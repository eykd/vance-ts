# Data Model: ClawTask Vertical Slice

**Feature**: 012-clawtask-vertical-slice
**Branch**: `012-clawtask-vertical-slice`
**Date**: 2026-03-02

---

## Entity Relationship Overview

```
user (better-auth)
  └── workspace (1:1)
        ├── actor (1:1 human actor per workspace in this slice)
        ├── area[] (seeded: Work, Personal, Admin)
        ├── context[] (seeded: computer, calls, home, errands, office)
        ├── inbox_item[]
        │     └── clarified_into → action (optional)
        ├── action[]
        │     ├── area (required, must be active)
        │     └── context (required)
        └── audit_event[] (immutable, append-only)
```

---

## Domain Entities

### Workspace

Tenant boundary. Each user account owns exactly one workspace.

| Field       | Type                    | Constraints                                     |
| ----------- | ----------------------- | ----------------------------------------------- |
| `id`        | `string` (UUID)         | PK                                              |
| `userId`    | `string` (UUID)         | FK → `user.id`, UNIQUE (one workspace per user) |
| `createdAt` | `string` (ISO-8601 UTC) | NOT NULL                                        |
| `updatedAt` | `string` (ISO-8601 UTC) | NOT NULL                                        |

**Factory invariants**:

- `create(userId)`: generates `id`, sets timestamps to now.
- `reconstitute(row)`: hydrates from D1 row; no validation.

**D1 table**: `workspace`

---

### Actor

An identity within a workspace that can author mutations. In this slice, always a human actor linked to the user account.

| Field         | Type                    | Constraints                         |
| ------------- | ----------------------- | ----------------------------------- |
| `id`          | `string` (UUID)         | PK                                  |
| `workspaceId` | `string` (UUID)         | FK → `workspace.id`                 |
| `userId`      | `string` (UUID)         | FK → `user.id` (for human actors)   |
| `type`        | `'human'`               | Enum; `'agent'` reserved for future |
| `createdAt`   | `string` (ISO-8601 UTC) | NOT NULL                            |

**Factory invariants**:

- `createHuman(workspaceId, userId)`: generates `id`, sets `type='human'`.
- `reconstitute(row)`: hydrates from D1 row.

**D1 table**: `actor`

---

### InboxItem

A raw captured thought. Lifecycle: `inbox` → `clarified`.

| Field               | Type                     | Constraints                                  |
| ------------------- | ------------------------ | -------------------------------------------- |
| `id`                | `string` (UUID)          | PK                                           |
| `workspaceId`       | `string` (UUID)          | FK → `workspace.id`                          |
| `title`             | `string`                 | NOT NULL, 1–255 chars                        |
| `description`       | `string \| null`         | Max 2000 chars                               |
| `status`            | `'inbox' \| 'clarified'` | NOT NULL, default `'inbox'`                  |
| `clarifiedIntoType` | `'action' \| null`       | NULL when `status='inbox'`                   |
| `clarifiedIntoId`   | `string (UUID) \| null`  | FK → `action.id`; NULL when `status='inbox'` |
| `createdAt`         | `string` (ISO-8601 UTC)  | NOT NULL                                     |
| `updatedAt`         | `string` (ISO-8601 UTC)  | NOT NULL                                     |

**State machine**:

```
inbox ──clarify()──► clarified
```

**Factory invariants**:

- `create(workspaceId, title, description?)`: validates title non-empty (max 255), generates `id`, sets `status='inbox'`, sets timestamps.
- `clarify(actionId)`: returns new InboxItem with `status='clarified'`, `clarifiedIntoType='action'`, `clarifiedIntoId=actionId`, updated `updatedAt`. Throws `DomainError('invalid_status_transition')` if already clarified.
- `reconstitute(row)`: hydrates from D1 row; no validation.

**Validation errors**: `'title_required'`, `'title_too_long'`, `'description_too_long'`, `'invalid_status_transition'`

**D1 table**: `inbox_item`

---

### Area

A sphere of responsibility (e.g. Work, Personal). Required when creating actions.

| Field         | Type                     | Constraints                  |
| ------------- | ------------------------ | ---------------------------- |
| `id`          | `string` (UUID)          | PK                           |
| `workspaceId` | `string` (UUID)          | FK → `workspace.id`          |
| `name`        | `string`                 | NOT NULL, 1–100 chars        |
| `status`      | `'active' \| 'archived'` | NOT NULL, default `'active'` |
| `createdAt`   | `string` (ISO-8601 UTC)  | NOT NULL                     |
| `updatedAt`   | `string` (ISO-8601 UTC)  | NOT NULL                     |

**State machine**:

```
active ──archive()──► archived
```

**Factory invariants**:

- `create(workspaceId, name)`: validates name, generates `id`, sets `status='active'`.
- `reconstitute(row)`: hydrates from D1 row.

**Business rule**: Only `active` Areas may be used in clarification (FR-012).

**D1 table**: `area`

---

### Context

A situational tag indicating where/how an action can be done (e.g. computer, calls).

| Field         | Type                    | Constraints           |
| ------------- | ----------------------- | --------------------- |
| `id`          | `string` (UUID)         | PK                    |
| `workspaceId` | `string` (UUID)         | FK → `workspace.id`   |
| `name`        | `string`                | NOT NULL, 1–100 chars |
| `createdAt`   | `string` (ISO-8601 UTC) | NOT NULL              |

**Factory invariants**:

- `create(workspaceId, name)`: validates name, generates `id`.
- `reconstitute(row)`: hydrates from D1 row.

**Note**: No status in this slice; all contexts are implicitly active.

**D1 table**: `context`

---

### Action

A concrete, single next step. Always standalone (no project) in this slice.

| Field              | Type                                                                      | Constraints                                               |
| ------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------- |
| `id`               | `string` (UUID)                                                           | PK                                                        |
| `workspaceId`      | `string` (UUID)                                                           | FK → `workspace.id`                                       |
| `createdByActorId` | `string` (UUID)                                                           | FK → `actor.id`                                           |
| `title`            | `string`                                                                  | NOT NULL, 1–255 chars                                     |
| `description`      | `string \| null`                                                          | Max 2000 chars; inherited from InboxItem on clarification |
| `status`           | `'ready' \| 'active' \| 'done' \| 'waiting' \| 'scheduled' \| 'archived'` | NOT NULL, default `'ready'`                               |
| `areaId`           | `string` (UUID)                                                           | FK → `area.id`; required                                  |
| `contextId`        | `string` (UUID)                                                           | FK → `context.id`; required                               |
| `projectId`        | `string (UUID) \| null`                                                   | Reserved for future; always NULL in this slice            |
| `createdAt`        | `string` (ISO-8601 UTC)                                                   | NOT NULL                                                  |
| `updatedAt`        | `string` (ISO-8601 UTC)                                                   | NOT NULL                                                  |

**State machine (this slice)**:

```
ready ──activate()──► active ──complete()──► done
```

Other statuses (`waiting`, `scheduled`, `archived`) are persisted but transitions to/from them are out of scope for this slice.

**Valid transitions in this slice**:
| From | To | Trigger |
|------|-----|---------|
| `ready` | `active` | `activate()` |
| `active` | `done` | `complete()` |

All other transitions throw `DomainError('invalid_status_transition')`.

**Factory invariants**:

- `create(workspaceId, actorId, title, areaId, contextId, description?)`: validates title non-empty (max 255), generates `id`, sets `status='ready'`, `projectId=null`, sets timestamps.
- `activate()`: returns new Action with `status='active'`, updated `updatedAt`. Throws if not `ready`.
- `complete()`: returns new Action with `status='done'`, updated `updatedAt`. Throws if not `active`.
- `reconstitute(row)`: hydrates from D1 row.

**D1 table**: `action`

---

### AuditEvent

Immutable, append-only record of every state-changing mutation.

| Field         | Type                    | Constraints                                      |
| ------------- | ----------------------- | ------------------------------------------------ |
| `id`          | `string` (UUID)         | PK                                               |
| `workspaceId` | `string` (UUID)         | FK → `workspace.id`                              |
| `entityType`  | `string`                | NOT NULL; e.g. `'inbox_item'`, `'action'`        |
| `entityId`    | `string` (UUID)         | NOT NULL; FK to the affected entity              |
| `eventType`   | `string`                | NOT NULL; see event type table below             |
| `actorId`     | `string` (UUID)         | FK → `actor.id`                                  |
| `payload`     | `string` (JSON)         | NOT NULL; snapshot of entity state at event time |
| `createdAt`   | `string` (ISO-8601 UTC) | NOT NULL                                         |

**Event types**:
| Entity | Event Type | Trigger |
|--------|-----------|---------|
| `inbox_item` | `inbox_item.created` | CaptureInboxItem |
| `inbox_item` | `inbox_item.clarified` | ClarifyInboxItemToAction |
| `action` | `action.created` | ClarifyInboxItemToAction |
| `action` | `action.activated` | ActivateAction |
| `action` | `action.completed` | CompleteAction |
| `workspace` | `workspace.provisioned` | ProvisionWorkspace |
| `area` | `area.created` | ProvisionWorkspace (seed) |
| `context` | `context.created` | ProvisionWorkspace (seed) |
| `actor` | `actor.created` | ProvisionWorkspace |

**Immutability**: No update or delete operations. `record()` factory always appends.

**Factory invariants**:

- `record(workspaceId, entityType, entityId, eventType, actorId, payload)`: generates `id`, sets `createdAt` to now.
- `reconstitute(row)`: hydrates from D1 row.

**D1 table**: `audit_event`

---

## Repository Interfaces

All repository interfaces live in `src/domain/interfaces/`.

```typescript
// InboxItemRepository
interface InboxItemRepository {
  save(item: InboxItem): Promise<void>;
  getById(id: string, workspaceId: string): Promise<InboxItem | null>;
  listByWorkspaceId(workspaceId: string): Promise<InboxItem[]>;
}

// ActionRepository
interface ActionRepository {
  save(action: Action): Promise<void>;
  getById(id: string, workspaceId: string): Promise<Action | null>;
  listByWorkspaceId(workspaceId: string): Promise<Action[]>;
  listByWorkspaceIdAndStatus(workspaceId: string, status: string): Promise<Action[]>;
}

// AreaRepository
interface AreaRepository {
  save(area: Area): Promise<void>;
  getById(id: string, workspaceId: string): Promise<Area | null>;
  getActiveById(id: string, workspaceId: string): Promise<Area | null>;
  listByWorkspaceId(workspaceId: string): Promise<Area[]>;
}

// ContextRepository
interface ContextRepository {
  save(context: Context): Promise<void>;
  getById(id: string, workspaceId: string): Promise<Context | null>;
  listByWorkspaceId(workspaceId: string): Promise<Context[]>;
}

// WorkspaceRepository
interface WorkspaceRepository {
  save(workspace: Workspace): Promise<void>;
  getByUserId(userId: string): Promise<Workspace | null>;
  getById(id: string): Promise<Workspace | null>;
}

// ActorRepository
interface ActorRepository {
  save(actor: Actor): Promise<void>;
  getById(id: string, workspaceId: string): Promise<Actor | null>;
  getHumanActorByWorkspaceId(workspaceId: string): Promise<Actor | null>;
}

// AuditEventRepository
interface AuditEventRepository {
  save(event: AuditEvent): Promise<void>;
  saveBatch(events: AuditEvent[]): Promise<void>;
}
```

---

## Database Migrations

### Migration Sequence

| File                   | Table         | Notes                                                    |
| ---------------------- | ------------- | -------------------------------------------------------- |
| `0002_workspace.sql`   | `workspace`   | FK → `user.id`                                           |
| `0003_actor.sql`       | `actor`       | FK → `workspace.id`, `user.id`                           |
| `0004_area.sql`        | `area`        | FK → `workspace.id`                                      |
| `0005_context.sql`     | `context`     | FK → `workspace.id`                                      |
| `0006_inbox_item.sql`  | `inbox_item`  | FK → `workspace.id`                                      |
| `0007_action.sql`      | `action`      | FK → `workspace.id`, `actor.id`, `area.id`, `context.id` |
| `0008_audit_event.sql` | `audit_event` | FK → `workspace.id`, `actor.id`                          |

### Schema DDL

```sql
-- 0002_workspace.sql
CREATE TABLE workspace (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 0003_actor.sql
CREATE TABLE actor (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('human', 'agent')),
  created_at TEXT NOT NULL
);
CREATE INDEX idx_actor_workspace_id ON actor(workspace_id);

-- 0004_area.sql
CREATE TABLE area (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_area_workspace_id ON area(workspace_id);

-- 0005_context.sql
CREATE TABLE context (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_context_workspace_id ON context(workspace_id);

-- 0006_inbox_item.sql
CREATE TABLE inbox_item (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'clarified')),
  clarified_into_type TEXT CHECK (clarified_into_type IN ('action')),
  clarified_into_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_inbox_item_workspace_id ON inbox_item(workspace_id);

-- 0007_action.sql
CREATE TABLE action (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  created_by_actor_id TEXT NOT NULL REFERENCES actor(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('ready', 'active', 'done', 'waiting', 'scheduled', 'archived')),
  area_id TEXT NOT NULL REFERENCES area(id),
  context_id TEXT NOT NULL REFERENCES context(id),
  project_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_action_workspace_id ON action(workspace_id);
CREATE INDEX idx_action_workspace_status ON action(workspace_id, status);

-- 0008_audit_event.sql
CREATE TABLE audit_event (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor_id TEXT NOT NULL REFERENCES actor(id),
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_audit_event_workspace_id ON audit_event(workspace_id);
CREATE INDEX idx_audit_event_entity ON audit_event(entity_type, entity_id);
```

---

## DTOs

All DTOs live in `src/application/dto/`.

```typescript
// InboxItemDto.ts
export type InboxItemDto = {
  id: string;
  title: string;
  description: string | null;
  status: 'inbox' | 'clarified';
  clarifiedIntoType: 'action' | null;
  clarifiedIntoId: string | null;
  createdAt: string;
  updatedAt: string;
};

// ActionDto.ts
export type ActionDto = {
  id: string;
  createdByActorId: string;
  title: string;
  description: string | null;
  status: 'ready' | 'active' | 'done' | 'waiting' | 'scheduled' | 'archived';
  areaId: string;
  contextId: string;
  createdAt: string;
  updatedAt: string;
};

// AreaDto.ts
export type AreaDto = {
  id: string;
  name: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
};

// ContextDto.ts
export type ContextDto = {
  id: string;
  name: string;
  createdAt: string;
};
```

---

## Drizzle Schema (TypeScript)

Location: `src/infrastructure/schema/clawtaskSchema.ts`

```typescript
import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const workspaceTable = sqliteTable('workspace', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const actorTable = sqliteTable('actor', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  userId: text('user_id').notNull(),
  type: text('type', { enum: ['human', 'agent'] }).notNull(),
  createdAt: text('created_at').notNull(),
});

export const areaTable = sqliteTable('area', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  name: text('name').notNull(),
  status: text('status', { enum: ['active', 'archived'] })
    .notNull()
    .default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const contextTable = sqliteTable('context', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
});

export const inboxItemTable = sqliteTable('inbox_item', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['inbox', 'clarified'] })
    .notNull()
    .default('inbox'),
  clarifiedIntoType: text('clarified_into_type', { enum: ['action'] }),
  clarifiedIntoId: text('clarified_into_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const actionTable = sqliteTable('action', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  createdByActorId: text('created_by_actor_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['ready', 'active', 'done', 'waiting', 'scheduled', 'archived'],
  })
    .notNull()
    .default('ready'),
  areaId: text('area_id').notNull(),
  contextId: text('context_id').notNull(),
  projectId: text('project_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const auditEventTable = sqliteTable('audit_event', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  eventType: text('event_type').notNull(),
  actorId: text('actor_id').notNull(),
  payload: text('payload').notNull(),
  createdAt: text('created_at').notNull(),
});
```
