/**
 * D1AreaRepository integration tests.
 *
 * Runs against a real in-memory D1 database via `@cloudflare/vitest-pool-workers`.
 * Verifies persistence, retrieval, status filtering, and tenant isolation for
 * {@link Area} entities.
 *
 * @module
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { D1AreaRepository } from './D1AreaRepository';

/**
 * Minimal schema required for area tests.
 *
 * Includes `user`, `workspace`, and `area` tables with FK dependencies.
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
    name: '0004_area.sql',
    queries: [
      "CREATE TABLE area (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')), created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
      'CREATE INDEX idx_area_workspace_id ON area(workspace_id)',
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
  await env.DB.exec('DELETE FROM area');
  await env.DB.exec('DELETE FROM workspace');
  await env.DB.exec('DELETE FROM `user`');
});

describe('D1AreaRepository', () => {
  let repo: D1AreaRepository;

  beforeEach(() => {
    repo = new D1AreaRepository(env.DB);
  });

  describe('save', () => {
    it('persists a new area', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      const area = {
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Work',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await repo.save(area);

      const found = await repo.getById('area-1', 'ws-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('area-1');
      expect(found?.workspaceId).toBe('ws-1');
      expect(found?.name).toBe('Work');
      expect(found?.status).toBe('active');
      expect(found?.createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(found?.updatedAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('updates name, status, and updatedAt when re-saving an existing area', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Work',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      await repo.save({
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Work Renamed',
        status: 'archived' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-06-01T00:00:00.000Z',
      });

      const found = await repo.getById('area-1', 'ws-1');
      expect(found?.name).toBe('Work Renamed');
      expect(found?.status).toBe('archived');
      expect(found?.updatedAt).toBe('2024-06-01T00:00:00.000Z');
    });
  });

  describe('getById', () => {
    it('returns the area with the given ID and workspace', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Work',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getById('area-1', 'ws-1');
      expect(found?.id).toBe('area-1');
    });

    it('returns null when the area ID does not exist', async () => {
      const found = await repo.getById('nonexistent', 'ws-1');
      expect(found).toBeNull();
    });

    it('returns null when workspaceId does not match (tenant isolation)', async () => {
      await insertUser('user-1');
      await insertUser('user-2');
      await insertWorkspace('ws-1', 'user-1');
      await insertWorkspace('ws-2', 'user-2');
      await repo.save({
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Work',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getById('area-1', 'ws-2');
      expect(found).toBeNull();
    });
  });

  describe('getActiveById', () => {
    it('returns the area when its status is active', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Work',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getActiveById('area-1', 'ws-1');
      expect(found?.id).toBe('area-1');
      expect(found?.status).toBe('active');
    });

    it('returns null when the area is archived', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Work',
        status: 'archived' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const found = await repo.getActiveById('area-1', 'ws-1');
      expect(found).toBeNull();
    });

    it('returns null when the area ID does not exist', async () => {
      const found = await repo.getActiveById('nonexistent', 'ws-1');
      expect(found).toBeNull();
    });
  });

  describe('listByWorkspaceId', () => {
    it('returns all areas for the workspace ordered by createdAt', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Work',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      await repo.save({
        id: 'area-2',
        workspaceId: 'ws-1',
        name: 'Personal',
        status: 'archived' as const,
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z',
      });

      const areas = await repo.listByWorkspaceId('ws-1');
      expect(areas).toHaveLength(2);
      expect(areas[0]?.id).toBe('area-1');
      expect(areas[1]?.id).toBe('area-2');
    });

    it('returns both active and archived areas', async () => {
      await insertUser('user-1');
      await insertWorkspace('ws-1', 'user-1');
      await repo.save({
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Work',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      await repo.save({
        id: 'area-2',
        workspaceId: 'ws-1',
        name: 'Old',
        status: 'archived' as const,
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z',
      });

      const areas = await repo.listByWorkspaceId('ws-1');
      const statuses = areas.map((a) => a.status);
      expect(statuses).toContain('active');
      expect(statuses).toContain('archived');
    });

    it('returns empty array when workspace has no areas', async () => {
      const areas = await repo.listByWorkspaceId('ws-empty');
      expect(areas).toEqual([]);
    });

    it('does not return areas from other workspaces (tenant isolation)', async () => {
      await insertUser('user-1');
      await insertUser('user-2');
      await insertWorkspace('ws-1', 'user-1');
      await insertWorkspace('ws-2', 'user-2');
      await repo.save({
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Work',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const areas = await repo.listByWorkspaceId('ws-2');
      expect(areas).toEqual([]);
    });
  });
});
