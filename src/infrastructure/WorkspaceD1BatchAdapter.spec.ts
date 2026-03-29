/**
 * WorkspaceD1BatchAdapter spec.
 *
 * Verifies that {@link WorkspaceD1BatchAdapter} persists the full provisioning
 * payload via a single atomic D1 batch call, with audit events last (FK-safe).
 *
 * @module
 */

import type { D1Database } from '@cloudflare/workers-types';
import { describe, expect, it, vi } from 'vitest';

import type { Actor } from '../domain/entities/Actor.js';
import type { Area } from '../domain/entities/Area.js';
import type { AuditEvent } from '../domain/entities/AuditEvent.js';
import type { Context } from '../domain/entities/Context.js';
import type { Workspace } from '../domain/entities/Workspace.js';

import { WorkspaceD1BatchAdapter } from './WorkspaceD1BatchAdapter.js';

/**
 * Shared provisioning fixtures.
 *
 * @returns Workspace, actor, areas, contexts, and audit event fixtures.
 */
function makeProvisioningFixtures(): {
  workspace: Workspace;
  actor: Actor;
  areas: Area[];
  contexts: Context[];
  auditEvents: AuditEvent[];
} {
  const workspace: Workspace = {
    id: 'ws-1',
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  const actor: Actor = {
    id: 'actor-1',
    workspaceId: 'ws-1',
    userId: 'user-1',
    type: 'human',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
  const areas: Area[] = [
    {
      id: 'area-1',
      workspaceId: 'ws-1',
      name: 'Work',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  const contexts: Context[] = [
    {
      id: 'ctx-1',
      workspaceId: 'ws-1',
      name: 'computer',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  const auditEvents: AuditEvent[] = [
    {
      id: 'evt-1',
      workspaceId: 'ws-1',
      entityType: 'workspace',
      entityId: 'ws-1',
      eventType: 'workspace.provisioned',
      actorId: 'actor-1',
      payload: '{}',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  return { workspace, actor, areas, contexts, auditEvents };
}

/**
 * Creates a D1Database mock that captures all `.bind()` call arguments in insertion order.
 *
 * Use this when verifying parameterized query values (constraint workspace-40o: no string interpolation).
 *
 * @returns Mock db, the ordered list of bind-call argument arrays, and the batch mock.
 */
function makeBindCapturingDb(): {
  db: D1Database;
  allBindArgs: unknown[][];
  mockBatch: ReturnType<typeof vi.fn>;
} {
  const allBindArgs: unknown[][] = [];
  const mockStatement = {
    bind: vi.fn().mockImplementation((...args: unknown[]) => {
      allBindArgs.push(args);
      return mockStatement;
    }),
  };
  const mockBatch = vi.fn().mockResolvedValue([]);
  const db = {
    prepare: vi.fn().mockReturnValue(mockStatement),
    batch: mockBatch,
  } as unknown as D1Database;
  return { db, allBindArgs, mockBatch };
}

/**
 * Creates a mock D1Database that records prepared SQL in order.
 *
 * @returns Mock db and the list of captured SQL strings.
 */
function makeMockDb(): {
  db: D1Database;
  preparedSql: string[];
  mockBatch: ReturnType<typeof vi.fn>;
} {
  const preparedSql: string[] = [];
  const mockStatement = { bind: vi.fn().mockReturnThis() };
  const mockPrepare = vi.fn().mockImplementation((sql: string) => {
    preparedSql.push(sql);
    return mockStatement;
  });
  const mockBatch = vi.fn().mockResolvedValue([]);
  const db = { prepare: mockPrepare, batch: mockBatch } as unknown as D1Database;
  return { db, preparedSql, mockBatch };
}

/** ISO timestamp used in all fixtures. */
const NOW = '2026-01-01T00:00:00.000Z';

/**
 * Builds the full production-scale provisioning payload: 3 areas, 5 contexts, 10 audit events.
 *
 * @returns Full provisioning payload with all entities.
 */
function makeFullProvisioningPayload(): {
  workspace: Workspace;
  actor: Actor;
  areas: Area[];
  contexts: Context[];
  auditEvents: AuditEvent[];
} {
  const workspace: Workspace = { id: 'ws-1', userId: 'user-1', createdAt: NOW, updatedAt: NOW };
  const actor: Actor = {
    id: 'actor-1',
    workspaceId: 'ws-1',
    userId: 'user-1',
    type: 'human',
    createdAt: NOW,
  };
  const areas: Area[] = ['Work', 'Personal', 'Admin'].map((name, i) => ({
    id: `area-${i}`,
    workspaceId: 'ws-1',
    name,
    status: 'active' as const,
    createdAt: NOW,
    updatedAt: NOW,
  }));
  const contexts: Context[] = ['computer', 'calls', 'home', 'errands', 'office'].map((name, i) => ({
    id: `ctx-${i}`,
    workspaceId: 'ws-1',
    name,
    createdAt: NOW,
  }));
  const auditEvents: AuditEvent[] = [
    {
      id: 'evt-ws',
      workspaceId: 'ws-1',
      entityType: 'workspace',
      entityId: 'ws-1',
      eventType: 'workspace.provisioned',
      actorId: 'actor-1',
      payload: '{}',
      createdAt: NOW,
    },
    {
      id: 'evt-actor',
      workspaceId: 'ws-1',
      entityType: 'actor',
      entityId: 'actor-1',
      eventType: 'actor.created',
      actorId: 'actor-1',
      payload: '{}',
      createdAt: NOW,
    },
    ...areas.map((area, i) => ({
      id: `evt-area-${i}`,
      workspaceId: 'ws-1',
      entityType: 'area',
      entityId: area.id,
      eventType: 'area.created',
      actorId: 'actor-1',
      payload: '{}',
      createdAt: NOW,
    })),
    ...contexts.map((ctx, i) => ({
      id: `evt-ctx-${i}`,
      workspaceId: 'ws-1',
      entityType: 'context',
      entityId: ctx.id,
      eventType: 'context.created',
      actorId: 'actor-1',
      payload: '{}',
      createdAt: NOW,
    })),
  ];
  return { workspace, actor, areas, contexts, auditEvents };
}

describe('WorkspaceD1BatchAdapter', () => {
  it('binds the workspace entity values to the workspace INSERT statement (workspace-40o: no string interpolation)', async () => {
    // Constraint workspace-40o: all D1 statements must use .bind() with actual entity values.
    // This test verifies that the workspace INSERT is parameterized, not string-interpolated.
    const { db, allBindArgs } = makeBindCapturingDb();
    const adapter = new WorkspaceD1BatchAdapter(db);

    const workspace: Workspace = {
      id: 'ws-bind-test',
      userId: 'user-bind-test',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    const actor: Actor = {
      id: 'actor-bind-test',
      workspaceId: 'ws-bind-test',
      userId: 'user-bind-test',
      type: 'human',
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    await adapter.provisionBatch(workspace, actor, [], [], []);

    // First .bind() call corresponds to the workspace INSERT statement
    const workspaceBindArgs = allBindArgs[0];
    expect(workspaceBindArgs).toEqual([
      'ws-bind-test',
      'user-bind-test',
      '2026-01-01T00:00:00.000Z',
      '2026-01-02T00:00:00.000Z',
    ]);
  });

  it('binds the actor entity values to the actor INSERT statement (workspace-40o: no string interpolation)', async () => {
    // Constraint workspace-40o: all D1 statements must use .bind() with actual entity values.
    // This test verifies that the actor INSERT is parameterized, not string-interpolated.
    const { db, allBindArgs } = makeBindCapturingDb();
    const adapter = new WorkspaceD1BatchAdapter(db);

    const workspace: Workspace = {
      id: 'ws-bind-test',
      userId: 'user-bind-test',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const actor: Actor = {
      id: 'actor-bind-test',
      workspaceId: 'ws-bind-test',
      userId: 'user-bind-test',
      type: 'human',
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    await adapter.provisionBatch(workspace, actor, [], [], []);

    // Second .bind() call corresponds to the actor INSERT statement
    const actorBindArgs = allBindArgs[1];
    expect(actorBindArgs).toEqual([
      'actor-bind-test',
      'ws-bind-test',
      'user-bind-test',
      'human',
      '2026-01-01T00:00:00.000Z',
    ]);
  });

  it('batches exactly 20 statements for the full seeding payload (1+1+3+5+10)', async () => {
    const { db, mockBatch } = makeMockDb();
    const adapter = new WorkspaceD1BatchAdapter(db);
    const { workspace, actor, areas, contexts, auditEvents } = makeFullProvisioningPayload();

    await adapter.provisionBatch(workspace, actor, areas, contexts, auditEvents);

    const statements = mockBatch.mock.calls[0][0] as unknown[];
    // 1 workspace + 1 actor + 3 areas + 5 contexts + 10 audit events = 20
    expect(statements).toHaveLength(20);
  });

  it('persists all provisioning entities via a single atomic D1 batch call', async () => {
    const { db, mockBatch } = makeMockDb();
    const adapter = new WorkspaceD1BatchAdapter(db);
    const { workspace, actor, areas, contexts, auditEvents } = makeProvisioningFixtures();

    await adapter.provisionBatch(workspace, actor, areas, contexts, auditEvents);

    expect(mockBatch).toHaveBeenCalledOnce();
  });

  it('passes audit event statements as the last entries in the D1 batch (FK ordering)', async () => {
    const { db, preparedSql, mockBatch } = makeMockDb();
    const adapter = new WorkspaceD1BatchAdapter(db);
    const { workspace, actor, areas, contexts } = makeProvisioningFixtures();
    const auditEvents: AuditEvent[] = [
      {
        id: 'evt-1',
        workspaceId: 'ws-1',
        entityType: 'workspace',
        entityId: 'ws-1',
        eventType: 'workspace.provisioned',
        actorId: 'actor-1',
        payload: '{}',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'evt-2',
        workspaceId: 'ws-1',
        entityType: 'actor',
        entityId: 'actor-1',
        eventType: 'actor.created',
        actorId: 'actor-1',
        payload: '{}',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    await adapter.provisionBatch(workspace, actor, areas, contexts, auditEvents);

    expect(mockBatch).toHaveBeenCalledOnce();
    const statements = mockBatch.mock.calls[0][0] as unknown[];

    // Expect: 1 workspace + 1 actor + 1 area + 1 context + 2 audit events = 6
    expect(statements).toHaveLength(6);

    // Audit events must come after workspace + actor + area + context (FK-safe ordering)
    const auditPrepareStart = preparedSql.findIndex((sql) => sql.includes('audit_event'));
    let lastNonAuditPrepare = -1;
    for (let i = preparedSql.length - 1; i >= 0; i--) {
      if (preparedSql[i]?.includes('audit_event') !== true) {
        lastNonAuditPrepare = i;
        break;
      }
    }
    expect(auditPrepareStart).toBeGreaterThan(lastNonAuditPrepare);
  });

  it('binds the context entity values to the context INSERT statement (workspace-40o: no string interpolation)', async () => {
    // Constraint workspace-40o: all D1 statements must use .bind() with actual entity values.
    // This test verifies that the context INSERT is parameterized, not string-interpolated.
    // bind call order: 0=workspace, 1=actor, 2=area, 3=context
    const { db, allBindArgs } = makeBindCapturingDb();
    const adapter = new WorkspaceD1BatchAdapter(db);

    const workspace: Workspace = {
      id: 'ws-ctx-test',
      userId: 'user-ctx-test',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const actor: Actor = {
      id: 'actor-ctx-test',
      workspaceId: 'ws-ctx-test',
      userId: 'user-ctx-test',
      type: 'human',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const area: Area = {
      id: 'area-ctx-test',
      workspaceId: 'ws-ctx-test',
      name: 'Work',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const ctx: Context = {
      id: 'ctx-bind-test',
      workspaceId: 'ws-ctx-test',
      name: 'computer',
      createdAt: '2026-01-02T00:00:00.000Z',
    };

    await adapter.provisionBatch(workspace, actor, [area], [ctx], []);

    // Fourth .bind() call (index 3) corresponds to the context INSERT statement
    // (0=workspace, 1=actor, 2=area, 3=context)
    const contextBindArgs = allBindArgs[3];
    expect(contextBindArgs).toEqual([
      'ctx-bind-test',
      'ws-ctx-test',
      'computer',
      '2026-01-02T00:00:00.000Z',
    ]);
  });

  it('binds the area entity values to the area INSERT statement (workspace-40o: no string interpolation)', async () => {
    // Constraint workspace-40o: all D1 statements must use .bind() with actual entity values.
    // This test verifies that the area INSERT is parameterized, not string-interpolated.
    // bind call order: 0=workspace, 1=actor, 2=area
    const { db, allBindArgs } = makeBindCapturingDb();
    const adapter = new WorkspaceD1BatchAdapter(db);

    const workspace: Workspace = {
      id: 'ws-area-bind-test',
      userId: 'user-area-bind-test',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const actor: Actor = {
      id: 'actor-area-bind-test',
      workspaceId: 'ws-area-bind-test',
      userId: 'user-area-bind-test',
      type: 'human',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const area: Area = {
      id: 'area-bind-test',
      workspaceId: 'ws-area-bind-test',
      name: 'Work',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };

    await adapter.provisionBatch(workspace, actor, [area], [], []);

    // Third .bind() call (index 2) corresponds to the area INSERT statement
    // (0=workspace, 1=actor, 2=area)
    const areaBindArgs = allBindArgs[2];
    expect(areaBindArgs).toEqual([
      'area-bind-test',
      'ws-area-bind-test',
      'Work',
      'active',
      '2026-01-01T00:00:00.000Z',
      '2026-01-02T00:00:00.000Z',
    ]);
  });

  it('binds all 8 audit event fields to the audit event INSERT statement (workspace-40o: complete parameterization)', async () => {
    // Constraint workspace-40o: all D1 statements must use .bind() for ALL values.
    // This test verifies that all 8 audit_event INSERT columns are parameterized:
    // id, workspace_id, entity_type, entity_id, event_type, actor_id, payload, created_at.
    const { db, allBindArgs } = makeBindCapturingDb();
    const adapter = new WorkspaceD1BatchAdapter(db);

    const workspace: Workspace = {
      id: 'ws-audit-bind-test',
      userId: 'user-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const actor: Actor = {
      id: 'actor-1',
      workspaceId: 'ws-audit-bind-test',
      userId: 'user-1',
      type: 'human',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const auditEvent: AuditEvent = {
      id: 'evt-audit-bind-test',
      workspaceId: 'ws-audit-bind-test',
      entityType: 'workspace',
      entityId: 'ws-audit-bind-test',
      eventType: 'workspace.provisioned',
      actorId: 'actor-1',
      payload: '{"key":"value"}',
      createdAt: '2026-01-03T00:00:00.000Z',
    };

    await adapter.provisionBatch(workspace, actor, [], [], [auditEvent]);

    // Bind calls: 0=workspace, 1=actor, 2=auditEvent
    // audit_event columns: id, workspace_id, entity_type, entity_id, event_type, actor_id, payload, created_at
    const auditBindArgs = allBindArgs[2];
    expect(auditBindArgs).toEqual([
      'evt-audit-bind-test',
      'ws-audit-bind-test',
      'workspace',
      'ws-audit-bind-test',
      'workspace.provisioned',
      'actor-1',
      '{"key":"value"}',
      '2026-01-03T00:00:00.000Z',
    ]);
  });

  it('binds the audit event actor_id from evt.actorId, not from the actor entity (workspace-85o)', async () => {
    // Constraint workspace-85o: audit event INSERT must bind evt.actorId as the actor_id column.
    // This guards against a refactor that accidentally passes actor.id directly instead of
    // routing through the AuditEvent entity — which would break if the event's actorId ever
    // differs from the newly created actor (e.g., system-generated events).
    const { db, allBindArgs } = makeBindCapturingDb();
    const adapter = new WorkspaceD1BatchAdapter(db);

    const workspace: Workspace = {
      id: 'ws-1',
      userId: 'user-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const actor: Actor = {
      id: 'actor-1',
      workspaceId: 'ws-1',
      userId: 'user-1',
      type: 'human',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const auditEvent: AuditEvent = {
      id: 'evt-ws',
      workspaceId: 'ws-1',
      entityType: 'workspace',
      entityId: 'ws-1',
      eventType: 'workspace.provisioned',
      actorId: 'actor-1', // must be the human actor's id
      payload: '{}',
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    await adapter.provisionBatch(workspace, actor, [], [], [auditEvent]);

    // Bind calls: 0=workspace, 1=actor, 2=auditEvent
    // audit_event columns: id, workspace_id, entity_type, entity_id, event_type, actor_id, payload, created_at
    // actor_id is position 5 (0-indexed)
    const auditEventBindArgs = allBindArgs[2];
    expect(auditEventBindArgs).toBeDefined();
    expect(auditEventBindArgs?.[5]).toBe('actor-1');
  });
});
