/**
 * D1WorkspaceRepository integration tests.
 *
 * Runs against a real in-memory D1 database via `@cloudflare/vitest-pool-workers`.
 * Verifies persistence, retrieval, and upsert semantics for {@link Workspace} entities.
 *
 * @module
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { D1WorkspaceRepository } from './D1WorkspaceRepository';

/**
 * Minimal schema required for workspace tests.
 *
 * Includes the `user` table (FK dependency) and `workspace` table.
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
];

/** Inserts a minimal user row to satisfy FK constraints. */
async function insertUser(id: string): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO `user` (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 0, '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')",
  )
    .bind(id, 'Test User', `${id}@example.com`)
    .run();
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, TEST_MIGRATIONS);
});

beforeEach(async () => {
  await env.DB.exec('DELETE FROM workspace');
  await env.DB.exec('DELETE FROM `user`');
});

describe('D1WorkspaceRepository', () => {
  let repo: D1WorkspaceRepository;

  beforeEach(() => {
    repo = new D1WorkspaceRepository(env.DB);
  });

  describe('save', () => {
    it('persists a new workspace', async () => {
      await insertUser('user-1');
      const workspace = {
        id: 'ws-1',
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await repo.save(workspace);

      const found = await repo.getById('ws-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('ws-1');
      expect(found?.userId).toBe('user-1');
      expect(found?.createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(found?.updatedAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('updates updatedAt when re-saving an existing workspace', async () => {
      await insertUser('user-1');
      const workspace = {
        id: 'ws-1',
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      await repo.save(workspace);

      const updated = { ...workspace, updatedAt: '2024-06-01T00:00:00.000Z' };
      await repo.save(updated);

      const found = await repo.getById('ws-1');
      expect(found?.updatedAt).toBe('2024-06-01T00:00:00.000Z');
    });
  });

  describe('getByUserId', () => {
    it('returns the workspace for the given user', async () => {
      await insertUser('user-1');
      await repo.save({
        id: 'ws-1',
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getByUserId('user-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('ws-1');
      expect(found?.userId).toBe('user-1');
    });

    it('returns null when no workspace exists for the user', async () => {
      const found = await repo.getByUserId('nonexistent-user');
      expect(found).toBeNull();
    });
  });

  describe('getById', () => {
    it('returns the workspace with the given ID', async () => {
      await insertUser('user-1');
      await repo.save({
        id: 'ws-1',
        userId: 'user-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getById('ws-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('ws-1');
    });

    it('returns null when the workspace ID does not exist', async () => {
      const found = await repo.getById('nonexistent-ws');
      expect(found).toBeNull();
    });
  });
});
