/**
 * WorkspaceD1BatchAdapter spec.
 *
 * Verifies that {@link WorkspaceD1BatchAdapter} persists the full provisioning
 * payload via a single atomic D1 batch call, with audit events last (FK-safe).
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest';

import type { D1Database } from '@cloudflare/workers-types';

import type { Actor } from '../domain/entities/Actor.js';
import type { Area } from '../domain/entities/Area.js';
import type { AuditEvent } from '../domain/entities/AuditEvent.js';
import type { Context } from '../domain/entities/Context.js';
import type { Workspace } from '../domain/entities/Workspace.js';

import { WorkspaceD1BatchAdapter } from './WorkspaceD1BatchAdapter.js';

/** Shared provisioning fixtures. */
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
 * Creates a mock D1Database that records prepared SQL in order.
 *
 * @returns Mock db and the list of captured SQL strings.
 */
function makeMockDb(): { db: D1Database; preparedSql: string[]; mockBatch: ReturnType<typeof vi.fn> } {
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

/** Builds the full production-scale provisioning payload: 3 areas, 5 contexts, 10 audit events. */
function makeFullProvisioningPayload(): {
  workspace: Workspace;
  actor: Actor;
  areas: Area[];
  contexts: Context[];
  auditEvents: AuditEvent[];
} {
  const workspace: Workspace = { id: 'ws-1', userId: 'user-1', createdAt: NOW, updatedAt: NOW };
  const actor: Actor = { id: 'actor-1', workspaceId: 'ws-1', userId: 'user-1', type: 'human', createdAt: NOW };
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
    { id: 'evt-ws', workspaceId: 'ws-1', entityType: 'workspace', entityId: 'ws-1', eventType: 'workspace.provisioned', actorId: 'actor-1', payload: '{}', createdAt: NOW },
    { id: 'evt-actor', workspaceId: 'ws-1', entityType: 'actor', entityId: 'actor-1', eventType: 'actor.created', actorId: 'actor-1', payload: '{}', createdAt: NOW },
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
    const lastNonAuditPrepare = preparedSql.findLastIndex((sql) => !sql.includes('audit_event'));
    expect(auditPrepareStart).toBeGreaterThan(lastNonAuditPrepare);
  });
});
