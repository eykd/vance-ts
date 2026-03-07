/**
 * D1ActionRepository integration tests.
 *
 * Runs against a real in-memory D1 database via `@cloudflare/vitest-pool-workers`.
 *
 * @module
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { Action } from '../../domain/entities/Action';

import { D1ActionRepository } from './D1ActionRepository';

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
    ],
  },
  {
    name: '0004_area.sql',
    queries: [
      "CREATE TABLE area (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')), created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
    ],
  },
  {
    name: '0005_context.sql',
    queries: [
      'CREATE TABLE context (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, name TEXT NOT NULL, created_at TEXT NOT NULL)',
    ],
  },
  {
    name: '0007_action.sql',
    queries: [
      "CREATE TABLE action (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, created_by_actor_id TEXT NOT NULL REFERENCES actor(id), title TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'active', 'done', 'waiting', 'scheduled', 'archived')), area_id TEXT NOT NULL REFERENCES area(id), context_id TEXT NOT NULL REFERENCES context(id), project_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
      'CREATE INDEX idx_action_workspace_id ON action(workspace_id)',
      'CREATE INDEX idx_action_workspace_status ON action(workspace_id, status)',
    ],
  },
];

const NOW = '2024-01-01T00:00:00.000Z';

/**
 * Inserts prerequisite rows for FK constraints.
 */
async function insertPrereqs(): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES ('u1', 'Test', 'u1@example.com', 0, '${NOW}', '${NOW}')`
  ).run();
  await env.DB.prepare(
    `INSERT INTO workspace (id, user_id, created_at, updated_at) VALUES ('ws-1', 'u1', '${NOW}', '${NOW}')`
  ).run();
  await env.DB.prepare(
    `INSERT INTO actor (id, workspace_id, user_id, type, created_at) VALUES ('actor-1', 'ws-1', 'u1', 'human', '${NOW}')`
  ).run();
  await env.DB.prepare(
    `INSERT INTO area (id, workspace_id, name, status, created_at, updated_at) VALUES ('area-1', 'ws-1', 'Work', 'active', '${NOW}', '${NOW}')`
  ).run();
  await env.DB.prepare(
    `INSERT INTO context (id, workspace_id, name, created_at) VALUES ('ctx-1', 'ws-1', 'computer', '${NOW}')`
  ).run();
}

/**
 * Creates a sample Action entity.
 *
 * @returns An Action entity with all fields set.
 */
function sampleAction(): Action {
  return {
    id: 'action-1',
    workspaceId: 'ws-1',
    createdByActorId: 'actor-1',
    title: 'Do the thing',
    description: null,
    status: 'ready',
    areaId: 'area-1',
    contextId: 'ctx-1',
    projectId: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, TEST_MIGRATIONS);
});

beforeEach(async () => {
  await env.DB.exec('DELETE FROM action');
  await env.DB.exec('DELETE FROM context');
  await env.DB.exec('DELETE FROM area');
  await env.DB.exec('DELETE FROM actor');
  await env.DB.exec('DELETE FROM workspace');
  await env.DB.exec('DELETE FROM `user`');
});

describe('D1ActionRepository', () => {
  let repo: D1ActionRepository;

  beforeEach(() => {
    repo = new D1ActionRepository(env.DB);
  });

  describe('save and getById', () => {
    it('persists and retrieves an action', async () => {
      await insertPrereqs();
      const action = sampleAction();

      await repo.save(action);
      const found = await repo.getById('action-1', 'ws-1');

      expect(found).not.toBeNull();
      expect(found?.id).toBe('action-1');
      expect(found?.workspaceId).toBe('ws-1');
      expect(found?.title).toBe('Do the thing');
      expect(found?.status).toBe('ready');
      expect(found?.areaId).toBe('area-1');
      expect(found?.contextId).toBe('ctx-1');
    });
  });

  describe('getById tenant isolation', () => {
    it('returns null for wrong workspace', async () => {
      await insertPrereqs();
      await repo.save(sampleAction());

      const found = await repo.getById('action-1', 'ws-other');
      expect(found).toBeNull();
    });
  });

  describe('listByWorkspaceId', () => {
    it('lists actions filtered by status', async () => {
      await insertPrereqs();
      await repo.save(sampleAction());
      await repo.save({
        ...sampleAction(),
        id: 'action-2',
        title: 'Active thing',
        status: 'active',
      });

      const ready = await repo.listByWorkspaceId('ws-1', 'ready');
      expect(ready).toHaveLength(1);
      expect(ready[0]?.title).toBe('Do the thing');

      const all = await repo.listByWorkspaceId('ws-1');
      expect(all).toHaveLength(2);
    });
  });

  describe('save upsert', () => {
    it('updates an existing action on conflict', async () => {
      await insertPrereqs();
      const action = sampleAction();
      await repo.save(action);

      const updated = {
        ...action,
        status: 'active' as const,
        updatedAt: '2024-06-01T00:00:00.000Z',
      };
      await repo.save(updated);

      const found = await repo.getById('action-1', 'ws-1');
      expect(found?.status).toBe('active');
      expect(found?.updatedAt).toBe('2024-06-01T00:00:00.000Z');
    });

    it('does not overwrite when workspace_id mismatches', async () => {
      await insertPrereqs();
      // Create a second workspace with its own prereqs
      await env.DB.prepare(
        `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES ('u2', 'Other', 'u2@example.com', 0, '${NOW}', '${NOW}')`
      ).run();
      await env.DB.prepare(
        `INSERT INTO workspace (id, user_id, created_at, updated_at) VALUES ('ws-2', 'u2', '${NOW}', '${NOW}')`
      ).run();
      await env.DB.prepare(
        `INSERT INTO actor (id, workspace_id, user_id, type, created_at) VALUES ('actor-2', 'ws-2', 'u2', 'human', '${NOW}')`
      ).run();
      await env.DB.prepare(
        `INSERT INTO area (id, workspace_id, name, status, created_at, updated_at) VALUES ('area-2', 'ws-2', 'Work', 'active', '${NOW}', '${NOW}')`
      ).run();
      await env.DB.prepare(
        `INSERT INTO context (id, workspace_id, name, created_at) VALUES ('ctx-2', 'ws-2', 'computer', '${NOW}')`
      ).run();

      const action = sampleAction();
      await repo.save(action);

      // Attempt to overwrite action-1 with a different workspace_id
      const attacker = {
        ...action,
        workspaceId: 'ws-2',
        createdByActorId: 'actor-2',
        title: 'Hijacked!',
        status: 'active' as const,
        areaId: 'area-2',
        contextId: 'ctx-2',
        updatedAt: '2099-01-01T00:00:00.000Z',
      };
      await repo.save(attacker);

      // Original row should be unchanged
      const found = await repo.getById('action-1', 'ws-1');
      expect(found).not.toBeNull();
      expect(found?.title).toBe('Do the thing');
      expect(found?.status).toBe('ready');
      expect(found?.workspaceId).toBe('ws-1');
    });
  });
});
