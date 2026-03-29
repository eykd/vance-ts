/**
 * D1InboxItemRepository integration tests.
 *
 * Runs against a real in-memory D1 database via `@cloudflare/vitest-pool-workers`.
 * Verifies persistence, retrieval, and tenant isolation for InboxItem entities.
 *
 * @module
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { D1InboxItemRepository } from './D1InboxItemRepository';

/**
 * Minimal schema required for inbox item tests.
 *
 * Includes `user`, `workspace`, and `inbox_item` tables with FK dependencies.
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
    name: '0006_inbox_item.sql',
    queries: [
      "CREATE TABLE inbox_item (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'clarified')), clarified_into_type TEXT CHECK (clarified_into_type IN ('action')), clarified_into_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
      'CREATE INDEX idx_inbox_item_workspace_id ON inbox_item(workspace_id)',
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

beforeAll(async () => {
  await applyD1Migrations(env.DB, TEST_MIGRATIONS);
});

beforeEach(async () => {
  await env.DB.exec('DELETE FROM inbox_item');
  await env.DB.exec('DELETE FROM workspace');
  await env.DB.exec('DELETE FROM `user`');
});

describe('D1InboxItemRepository', () => {
  let repo: D1InboxItemRepository;

  beforeEach(() => {
    repo = new D1InboxItemRepository(env.DB);
  });

  describe('save', () => {
    it('persists a new inbox item', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      const item = {
        id: 'inbox-1',
        workspaceId: 'ws-1',
        title: 'Buy milk',
        description: null,
        status: 'inbox' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        clarifiedIntoType: null,
        clarifiedIntoId: null,
      };

      await repo.save(item);

      const found = await repo.getById('inbox-1', 'ws-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('inbox-1');
      expect(found?.workspaceId).toBe('ws-1');
      expect(found?.title).toBe('Buy milk');
      expect(found?.description).toBeNull();
      expect(found?.status).toBe('inbox');
      expect(found?.createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(found?.updatedAt).toBe('2024-01-01T00:00:00.000Z');
      expect(found?.clarifiedIntoType).toBeNull();
      expect(found?.clarifiedIntoId).toBeNull();
    });
  });
});
