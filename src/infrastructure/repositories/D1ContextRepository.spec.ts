/**
 * D1ContextRepository integration tests.
 *
 * Runs against a real in-memory D1 database via `@cloudflare/vitest-pool-workers`.
 * Verifies persistence, retrieval, and tenant isolation for {@link Context} entities.
 *
 * @module
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { D1ContextRepository } from './D1ContextRepository';

/**
 * Minimal schema required for context tests.
 *
 * Includes `user`, `workspace`, and `context` tables with FK dependencies.
 * SQL is inlined to avoid Node.js fs access from the Workers runtime.
 */
const TEST_MIGRATIONS = [
  {
    name: '0001_user.sql',
    queries: [
      "CREATE TABLE `user` (`id` text NOT NULL, `name` text NOT NULL, `email` text NOT NULL UNIQUE, `emailVerified` integer NOT NULL DEFAULT 0, `image` text, `createdAt` text NOT NULL, `updatedAt` text NOT NULL, PRIMARY KEY(`id`))",
    ],
  },
  {
    name: '0002_workspace.sql',
    queries: [
      'CREATE TABLE workspace (id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)',
    ],
  },
  {
    name: '0005_context.sql',
    queries: [
      'CREATE TABLE context (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, name TEXT NOT NULL, created_at TEXT NOT NULL)',
      'CREATE INDEX idx_context_workspace_id ON context(workspace_id)',
    ],
  },
];

/** Inserts a minimal user row to satisfy FK constraints. */
async function insertUser(id: string): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO `user` (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 0, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')",
  )
    .bind(id, 'Test User', `${id}@example.com`)
    .run();
}

/** Inserts a minimal workspace row to satisfy FK constraints. */
async function insertWorkspace(id: string, userId: string): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO workspace (id, user_id, created_at, updated_at) VALUES (?, ?, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')",
  )
    .bind(id, userId)
    .run();
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, TEST_MIGRATIONS);
});

beforeEach(async () => {
  await env.DB.exec('DELETE FROM context');
  await env.DB.exec('DELETE FROM workspace');
  await env.DB.exec('DELETE FROM `user`');
});

describe('D1ContextRepository', () => {
  let repo: D1ContextRepository;

  beforeEach(() => {
    repo = new D1ContextRepository(env.DB);
  });

  describe('save', () => {
    it('persists a new context', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      const context = {
        id: 'ctx-1',
        workspaceId: 'ws-1',
        name: 'computer',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      await repo.save(context);

      const found = await repo.getById('ctx-1', 'ws-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('ctx-1');
      expect(found?.workspaceId).toBe('ws-1');
      expect(found?.name).toBe('computer');
      expect(found?.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('updates name when re-saving an existing context', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'ctx-1',
        workspaceId: 'ws-1',
        name: 'computer',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      await repo.save({
        id: 'ctx-1',
        workspaceId: 'ws-1',
        name: 'laptop',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getById('ctx-1', 'ws-1');
      expect(found?.name).toBe('laptop');
    });
  });

  describe('getById', () => {
    it('returns the context with the given ID and workspace', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'ctx-1',
        workspaceId: 'ws-1',
        name: 'computer',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getById('ctx-1', 'ws-1');
      expect(found?.id).toBe('ctx-1');
    });

    it('returns null when the context ID does not exist', async () => {
      const found = await repo.getById('nonexistent', 'ws-1');
      expect(found).toBeNull();
    });

    it('returns null when workspaceId does not match (tenant isolation)', async () => {
      await insertUser('user-1');
      await insertUser('user-2');
      await insertWorkspace('ws-1', 'user-1');
      await insertWorkspace('ws-2', 'user-2');
      await repo.save({
        id: 'ctx-1',
        workspaceId: 'ws-1',
        name: 'computer',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getById('ctx-1', 'ws-2');
      expect(found).toBeNull();
    });
  });

  describe('listByWorkspaceId', () => {
    it('returns all contexts for the workspace ordered by createdAt', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'ctx-1',
        workspaceId: 'ws-1',
        name: 'computer',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
      await repo.save({
        id: 'ctx-2',
        workspaceId: 'ws-1',
        name: 'calls',
        createdAt: '2024-02-01T00:00:00.000Z',
      });

      const contexts = await repo.listByWorkspaceId('ws-1');
      expect(contexts).toHaveLength(2);
      expect(contexts[0]?.id).toBe('ctx-1');
      expect(contexts[1]?.id).toBe('ctx-2');
    });

    it('returns empty array when workspace has no contexts', async () => {
      const contexts = await repo.listByWorkspaceId('ws-empty');
      expect(contexts).toEqual([]);
    });

    it('does not return contexts from other workspaces (tenant isolation)', async () => {
      await insertUser('user-1');
      await insertUser('user-2');
      await insertWorkspace('ws-1', 'user-1');
      await insertWorkspace('ws-2', 'user-2');
      await repo.save({
        id: 'ctx-1',
        workspaceId: 'ws-1',
        name: 'computer',
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const contexts = await repo.listByWorkspaceId('ws-2');
      expect(contexts).toEqual([]);
    });
  });
});
