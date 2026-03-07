/**
 * Unit tests for the InboxItemRepository port interface.
 *
 * Verifies the interface contract can be satisfied by a mock implementation
 * and that InboxItem entities can be round-tripped through it.
 */

import { describe, expect, it } from 'vitest';

import { InboxItem } from '../entities/InboxItem.js';

import type { InboxItemRepository } from './InboxItemRepository';

/**
 * Creates an in-memory InboxItemRepository backed by an array.
 *
 * @returns Object containing the repository and its backing store.
 */
function createInMemoryRepo(): {
  repo: InboxItemRepository;
  store: InboxItem[];
} {
  const store: InboxItem[] = [];

  const byWorkspaceAndStatus = (workspaceId: string, status: InboxItem['status']): InboxItem[] =>
    store.filter((i) => i.workspaceId === workspaceId && i.status === status);

  const repo: InboxItemRepository = {
    save(item) {
      const idx = store.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        store[idx] = item;
      } else {
        store.push(item);
      }
      return Promise.resolve();
    },
    getById(id, workspaceId) {
      return Promise.resolve(
        store.find((i) => i.id === id && i.workspaceId === workspaceId) ?? null
      );
    },
    listByWorkspaceId(workspaceId, status = 'inbox') {
      return Promise.resolve(
        byWorkspaceAndStatus(workspaceId, status).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        )
      );
    },
    countByWorkspaceId(workspaceId, status) {
      return Promise.resolve(byWorkspaceAndStatus(workspaceId, status).length);
    },
  };
  return { repo, store };
}

const WORKSPACE_A = '660e8400-e29b-41d4-a716-446655440000';
const WORKSPACE_B = '770e8400-e29b-41d4-a716-446655440000';

/**
 * Creates a valid clarified InboxItem via reconstitute.
 *
 * @param workspaceId - The workspace UUID.
 * @param title - The item title.
 * @returns A clarified InboxItem with valid clarification fields.
 */
function createClarifiedItem(workspaceId: string, title: string): InboxItem {
  const item = InboxItem.create(workspaceId, title);
  return InboxItem.reconstitute({
    ...item,
    status: 'clarified',
    clarifiedIntoType: 'task',
    clarifiedIntoId: crypto.randomUUID(),
  });
}

describe('InboxItemRepository', () => {
  it('should save and retrieve an inbox item by id', async () => {
    const { repo } = createInMemoryRepo();

    const item = InboxItem.create(WORKSPACE_A, 'Buy groceries');

    await repo.save(item);

    const found = await repo.getById(item.id, WORKSPACE_A);
    expect(found).toBe(item);
  });

  it('should list only inbox-status items for a given workspace', async () => {
    const { repo } = createInMemoryRepo();

    const inboxItem = InboxItem.create(WORKSPACE_A, 'Buy groceries');
    const clarifiedItem = createClarifiedItem(WORKSPACE_A, 'Plan trip');
    const otherWorkspaceItem = InboxItem.create(WORKSPACE_B, 'Read book');

    await repo.save(inboxItem);
    await repo.save(clarifiedItem);
    await repo.save(otherWorkspaceItem);

    const result = await repo.listByWorkspaceId(WORKSPACE_A);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(inboxItem.id);
  });

  it('should upsert when saving an item with an existing id', async () => {
    const { repo } = createInMemoryRepo();

    const item = InboxItem.create(WORKSPACE_A, 'Buy groceries');
    await repo.save(item);

    const updated: InboxItem = { ...item, title: 'Buy organic groceries' };
    await repo.save(updated);

    const result = await repo.getById(item.id, WORKSPACE_A);
    expect(result?.title).toBe('Buy organic groceries');

    const all = await repo.listByWorkspaceId(WORKSPACE_A);
    expect(all).toHaveLength(1);
  });

  it('should count inbox items by workspace and status', async () => {
    const { repo } = createInMemoryRepo();

    const inboxItem = InboxItem.create(WORKSPACE_A, 'Buy groceries');
    const clarifiedItem = createClarifiedItem(WORKSPACE_A, 'Plan trip');

    await repo.save(inboxItem);
    await repo.save(clarifiedItem);

    const count = await repo.countByWorkspaceId(WORKSPACE_A, 'inbox');
    expect(count).toBe(1);
  });

  it('should list items filtered by provided status', async () => {
    const { repo } = createInMemoryRepo();

    const inboxItem = InboxItem.create(WORKSPACE_A, 'Buy groceries');
    const clarifiedItem = createClarifiedItem(WORKSPACE_A, 'Plan trip');

    await repo.save(inboxItem);
    await repo.save(clarifiedItem);

    const result = await repo.listByWorkspaceId(WORKSPACE_A, 'clarified');

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(clarifiedItem.id);
  });

  it('should save and retrieve an inbox item with a null description', async () => {
    const { repo } = createInMemoryRepo();

    const item = InboxItem.create(WORKSPACE_A, 'Buy groceries');

    await repo.save(item);

    const found = await repo.getById(item.id, WORKSPACE_A);
    expect(found).not.toBeNull();
    expect(found!.description).toBeNull();
  });

  it('should create an inbox item with clarifiedIntoType and clarifiedIntoId as null', async () => {
    const { repo } = createInMemoryRepo();

    const item = InboxItem.create(WORKSPACE_A, 'Buy groceries');
    await repo.save(item);

    const found = await repo.getById(item.id, WORKSPACE_A);
    expect(found).not.toBeNull();
    expect(found).toHaveProperty('clarifiedIntoType', null);
    expect(found).toHaveProperty('clarifiedIntoId', null);
  });

  it('should round-trip an item through reconstitute for DB hydration', async () => {
    const { repo } = createInMemoryRepo();

    const original = InboxItem.create(WORKSPACE_A, 'Buy groceries');
    await repo.save(original);

    const found = await repo.getById(original.id, WORKSPACE_A);
    expect(found).not.toBeNull();

    // Simulate DB hydration via reconstitute — the standard pattern
    // for repositories reconstructing entities from raw DB rows.
    const hydrated = InboxItem.reconstitute({
      id: found!.id,
      workspaceId: found!.workspaceId,
      title: found!.title,
      description: found!.description,
      status: found!.status,
      createdAt: found!.createdAt,
      updatedAt: found!.updatedAt,
      clarifiedIntoType: found!.clarifiedIntoType,
      clarifiedIntoId: found!.clarifiedIntoId,
    });

    expect(hydrated).toEqual(original);
  });

  it('should save and retrieve an inbox item created with a description', async () => {
    const { repo } = createInMemoryRepo();

    const item = InboxItem.create(WORKSPACE_A, 'Buy groceries', 'Get milk, eggs, and bread');

    await repo.save(item);

    const found = await repo.getById(item.id, WORKSPACE_A);
    expect(found).not.toBeNull();
    expect(found!.description).toBe('Get milk, eggs, and bread');
  });

  it('should return null when getById is called with a different workspace (tenant isolation)', async () => {
    const { repo } = createInMemoryRepo();

    const item = InboxItem.create(WORKSPACE_A, 'Buy groceries');
    await repo.save(item);

    const found = await repo.getById(item.id, WORKSPACE_B);
    expect(found).toBeNull();
  });

  it('should return items ordered by createdAt descending (newest first)', async () => {
    const { repo } = createInMemoryRepo();

    const older: InboxItem = {
      ...InboxItem.create(WORKSPACE_A, 'First item'),
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const newer: InboxItem = {
      ...InboxItem.create(WORKSPACE_A, 'Second item'),
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    };

    await repo.save(older);
    await repo.save(newer);

    const result = await repo.listByWorkspaceId(WORKSPACE_A, 'inbox');

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe(newer.id);
    expect(result[1]?.id).toBe(older.id);
  });
});
