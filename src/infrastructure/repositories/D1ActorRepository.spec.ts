/**
 * D1ActorRepository integration tests.
 *
 * Runs against a real in-memory D1 database via `@cloudflare/vitest-pool-workers`.
 * Verifies persistence, retrieval, and tenant isolation for Actor entities.
 *
 * @module
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { D1ActorRepository } from './D1ActorRepository';

/**
 * Minimal schema required for actor tests.
 *
 * Includes `user`, `workspace`, and `actor` tables with FK dependencies.
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
  await env.DB.exec('DELETE FROM actor');
  await env.DB.exec('DELETE FROM workspace');
  await env.DB.exec('DELETE FROM `user`');
});

describe('D1ActorRepository', () => {
  let repo: D1ActorRepository;

  beforeEach(() => {
    repo = new D1ActorRepository(env.DB);
  });

  describe('save', () => {
    it('persists a new actor', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      const actor = {
        id: 'actor-1',
        workspaceId: 'ws-1',
        userId: 'user-1',
        type: 'human' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      await repo.save(actor);

      const found = await repo.getById('actor-1', 'ws-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('actor-1');
      expect(found?.workspaceId).toBe('ws-1');
      expect(found?.userId).toBe('user-1');
      expect(found?.type).toBe('human');
      expect(found?.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('updates type when re-saving an existing actor', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'actor-1',
        workspaceId: 'ws-1',
        userId: 'user-1',
        type: 'human' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      await repo.save({
        id: 'actor-1',
        workspaceId: 'ws-1',
        userId: 'user-1',
        type: 'agent' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getById('actor-1', 'ws-1');
      expect(found?.type).toBe('agent');
    });
  });

  describe('getById', () => {
    it('returns the actor with the given ID and workspace', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'actor-1',
        workspaceId: 'ws-1',
        userId: 'user-1',
        type: 'human' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getById('actor-1', 'ws-1');
      expect(found?.id).toBe('actor-1');
    });

    it('returns null when the actor ID does not exist', async () => {
      const found = await repo.getById('nonexistent', 'ws-1');
      expect(found).toBeNull();
    });

    it('returns null when workspaceId does not match (tenant isolation)', async () => {
      await insertUser('user-1');
      await insertUser('user-2');
      await insertWorkspace('ws-1', 'user-1');
      await insertWorkspace('ws-2', 'user-2');
      await repo.save({
        id: 'actor-1',
        workspaceId: 'ws-1',
        userId: 'user-1',
        type: 'human' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getById('actor-1', 'ws-2');
      expect(found).toBeNull();
    });
  });

  describe('getHumanActorByWorkspaceId', () => {
    it('returns the human actor for the workspace', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'actor-1',
        workspaceId: 'ws-1',
        userId: 'user-1',
        type: 'human' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getHumanActorByWorkspaceId('ws-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('actor-1');
      expect(found?.type).toBe('human');
    });

    it('returns null when no human actor exists for the workspace', async () => {
      const found = await repo.getHumanActorByWorkspaceId('nonexistent-ws');
      expect(found).toBeNull();
    });

    it('returns null for a different workspace (tenant isolation)', async () => {
      await insertUser('user-1');
      await insertUser('user-2');
      await insertWorkspace('ws-1', 'user-1');
      await insertWorkspace('ws-2', 'user-2');
      await repo.save({
        id: 'actor-1',
        workspaceId: 'ws-1',
        userId: 'user-1',
        type: 'human' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getHumanActorByWorkspaceId('ws-2');
      expect(found).toBeNull();
    });
  });
});
