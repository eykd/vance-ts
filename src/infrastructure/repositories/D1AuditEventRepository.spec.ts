/**
 * D1AuditEventRepository integration tests.
 *
 * Runs against a real in-memory D1 database via `@cloudflare/vitest-pool-workers`.
 * Verifies append-only persistence and batch insert semantics for
 * AuditEvent entities.
 *
 * @module
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { D1AuditEventRepository } from './D1AuditEventRepository';

/**
 * Minimal schema required for audit event tests.
 *
 * Includes `user`, `workspace`, `actor`, and `audit_event` tables.
 * SQL is inlined to avoid Node.js fs access from the Workers runtime.
 */
const TEST_MIGRATIONS = [
  {
    name: '0001_user.sql',
    queries: [
      'CREATE TABLE `user` (`id` text NOT NULL, `name` text NOT NULL, `email` text NOT NULL UNIQUE, `emailVerified` integer NOT NULL DEFAULT 0, `image` text, `createdAt` text NOT NULL, `updatedAt` text NOT NULL, PRIMARY KEY(`id`))',
    ],
  },
  {
    name: '0002_workspace.sql',
    queries: [
      'CREATE TABLE workspace (id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)',
    ],
  },
  {
    name: '0003_actor.sql',
    queries: [
      "CREATE TABLE actor (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, type TEXT NOT NULL CHECK (type IN ('human', 'agent')), created_at TEXT NOT NULL)",
      'CREATE INDEX idx_actor_workspace_id ON actor(workspace_id)',
    ],
  },
  {
    name: '0008_audit_event.sql',
    queries: [
      'CREATE TABLE audit_event (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, event_type TEXT NOT NULL, actor_id TEXT NOT NULL REFERENCES actor(id), payload TEXT NOT NULL, created_at TEXT NOT NULL)',
      'CREATE INDEX idx_audit_event_workspace_id ON audit_event(workspace_id)',
      'CREATE INDEX idx_audit_event_entity ON audit_event(entity_type, entity_id)',
    ],
  },
];

/**
 * Inserts a minimal user row to satisfy FK constraints.
 *
 * @param id - The user ID to insert.
 */
async function insertUser(id: string): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO `user` (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 0, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')"
  )
    .bind(id, 'Test User', `${id}@example.com`)
    .run();
}

/**
 * Inserts a minimal workspace row to satisfy FK constraints.
 *
 * @param id - The workspace ID to insert.
 * @param userId - The owning user ID.
 */
async function insertWorkspace(id: string, userId: string): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO workspace (id, user_id, created_at, updated_at) VALUES (?, ?, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')"
  )
    .bind(id, userId)
    .run();
}

/**
 * Inserts a minimal actor row to satisfy FK constraints.
 *
 * @param id - The actor ID to insert.
 * @param workspaceId - The workspace this actor belongs to.
 * @param userId - The user account linked to this actor.
 */
async function insertActor(id: string, workspaceId: string, userId: string): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO actor (id, workspace_id, user_id, type, created_at) VALUES (?, ?, ?, 'human', '2024-01-01T00:00:00.000Z')"
  )
    .bind(id, workspaceId, userId)
    .run();
}

/**
 * Counts rows in audit_event for a given workspace.
 *
 * @param workspaceId - The workspace to count events for.
 * @returns The number of audit events.
 */
async function countEvents(workspaceId: string): Promise<number> {
  const result = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM audit_event WHERE workspace_id = ?'
  )
    .bind(workspaceId)
    .first<{ count: number }>();
  return result?.count ?? 0;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, TEST_MIGRATIONS);
});

beforeEach(async () => {
  await env.DB.exec('DELETE FROM audit_event');
  await env.DB.exec('DELETE FROM actor');
  await env.DB.exec('DELETE FROM workspace');
  await env.DB.exec('DELETE FROM `user`');
});

describe('D1AuditEventRepository', () => {
  let repo: D1AuditEventRepository;

  beforeEach(() => {
    repo = new D1AuditEventRepository(env.DB);
  });

  describe('save', () => {
    it('appends a single audit event to the log', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await insertActor('actor-1', 'ws-1', 'user-1');

      await repo.save({
        id: 'event-1',
        workspaceId: 'ws-1',
        entityType: 'workspace',
        entityId: 'ws-1',
        eventType: 'workspace.provisioned',
        actorId: 'actor-1',
        payload: '{"id":"ws-1"}',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const count = await countEvents('ws-1');
      expect(count).toBe(1);
    });

    it('persists all audit event fields correctly', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await insertActor('actor-1', 'ws-1', 'user-1');
      const event = {
        id: 'event-1',
        workspaceId: 'ws-1',
        entityType: 'actor',
        entityId: 'actor-1',
        eventType: 'actor.created',
        actorId: 'actor-1',
        payload: '{"id":"actor-1","type":"human"}',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      await repo.save(event);

      const row = await env.DB.prepare('SELECT * FROM audit_event WHERE id = ?')
        .bind('event-1')
        .first<{
          id: string;
          workspace_id: string;
          entity_type: string;
          entity_id: string;
          event_type: string;
          actor_id: string;
          payload: string;
          created_at: string;
        }>();
      expect(row?.workspace_id).toBe('ws-1');
      expect(row?.entity_type).toBe('actor');
      expect(row?.entity_id).toBe('actor-1');
      expect(row?.event_type).toBe('actor.created');
      expect(row?.actor_id).toBe('actor-1');
      expect(row?.payload).toBe('{"id":"actor-1","type":"human"}');
      expect(row?.created_at).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('saveBatch', () => {
    it('appends multiple audit events atomically', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await insertActor('actor-1', 'ws-1', 'user-1');
      const events = [
        {
          id: 'event-1',
          workspaceId: 'ws-1',
          entityType: 'workspace',
          entityId: 'ws-1',
          eventType: 'workspace.provisioned',
          actorId: 'actor-1',
          payload: '{"id":"ws-1"}',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'event-2',
          workspaceId: 'ws-1',
          entityType: 'actor',
          entityId: 'actor-1',
          eventType: 'actor.created',
          actorId: 'actor-1',
          payload: '{"id":"actor-1"}',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'event-3',
          workspaceId: 'ws-1',
          entityType: 'area',
          entityId: 'area-1',
          eventType: 'area.created',
          actorId: 'actor-1',
          payload: '{"id":"area-1","name":"Work"}',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      await repo.saveBatch(events);

      const count = await countEvents('ws-1');
      expect(count).toBe(3);
    });

    it('resolves immediately when given an empty array', async () => {
      await expect(repo.saveBatch([])).resolves.toBeUndefined();
    });
  });
});
