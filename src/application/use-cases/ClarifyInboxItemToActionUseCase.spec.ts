/**
 * ClarifyInboxItemToActionUseCase unit tests.
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest';

import { InboxItem } from '../../domain/entities/InboxItem';
import { DomainError } from '../../domain/errors/DomainError';
import type { AreaRepository } from '../../domain/interfaces/AreaRepository';
import type { ClarifyInboxItemBatchPort } from '../../domain/interfaces/ClarifyInboxItemBatchPort';
import type { ContextRepository } from '../../domain/interfaces/ContextRepository';
import type { InboxItemRepository } from '../../domain/interfaces/InboxItemRepository';

import { ClarifyInboxItemToActionUseCase } from './ClarifyInboxItemToActionUseCase';

/**
 * Creates a mock InboxItemRepository.
 *
 * @returns An object with vi.fn() stubs for each InboxItemRepository method.
 */
function mockInboxRepo(): {
  save: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  listByWorkspaceId: ReturnType<typeof vi.fn>;
  countByWorkspaceId: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn().mockResolvedValue(null),
    listByWorkspaceId: vi.fn().mockResolvedValue([]),
    countByWorkspaceId: vi.fn().mockResolvedValue(0),
  };
}

/**
 * Creates a mock ClarifyInboxItemBatchPort.
 *
 * @returns An object with vi.fn() stubs for each batch port method.
 */
function mockBatchPort(): { clarifyBatch: ReturnType<typeof vi.fn> } {
  return {
    clarifyBatch: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a mock AreaRepository.
 *
 * @returns An object with vi.fn() stubs for each AreaRepository method.
 */
function mockAreaRepo(): {
  save: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  getActiveById: ReturnType<typeof vi.fn>;
  listByWorkspaceId: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn().mockResolvedValue(null),
    getActiveById: vi.fn().mockResolvedValue(null),
    listByWorkspaceId: vi.fn().mockResolvedValue([]),
  };
}

/**
 * Creates a mock ContextRepository.
 *
 * @returns An object with vi.fn() stubs for each ContextRepository method.
 */
function mockContextRepo(): {
  save: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  listByWorkspaceId: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn().mockResolvedValue(null),
    listByWorkspaceId: vi.fn().mockResolvedValue([]),
  };
}

/**
 * Creates a sample inbox item for testing.
 *
 * @returns An inbox item in 'inbox' status.
 */
function sampleInboxItem(): ReturnType<typeof InboxItem.create> {
  return InboxItem.create('ws-1', 'Buy groceries', 'Weekly shopping list');
}

/**
 * Shared area stub for tests.
 */
const AREA_STUB = {
  id: 'area-1',
  workspaceId: 'ws-1',
  name: 'Work',
  status: 'active' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

/**
 * Shared context stub for tests.
 */
const CONTEXT_STUB = {
  id: 'ctx-1',
  workspaceId: 'ws-1',
  name: 'computer',
  createdAt: '2026-01-01T00:00:00.000Z',
};

/**
 * Builds a use case with mocks and returns all mocks for assertions.
 *
 * @returns Object containing the use case and all mock dependencies.
 */
function buildUseCase(): {
  uc: ClarifyInboxItemToActionUseCase;
  inboxRepo: ReturnType<typeof mockInboxRepo>;
  batchPort: ReturnType<typeof mockBatchPort>;
  areaRepo: ReturnType<typeof mockAreaRepo>;
  contextRepo: ReturnType<typeof mockContextRepo>;
} {
  const inboxRepo = mockInboxRepo();
  const batchPort = mockBatchPort();
  const areaRepo = mockAreaRepo();
  const contextRepo = mockContextRepo();

  const uc = new ClarifyInboxItemToActionUseCase(
    inboxRepo as unknown as InboxItemRepository,
    batchPort as unknown as ClarifyInboxItemBatchPort,
    areaRepo as unknown as AreaRepository,
    contextRepo as unknown as ContextRepository
  );

  return { uc, inboxRepo, batchPort, areaRepo, contextRepo };
}

describe('ClarifyInboxItemToActionUseCase', () => {
  it('clarifies an inbox item into an action', async () => {
    const { uc, inboxRepo, batchPort, areaRepo, contextRepo } = buildUseCase();
    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);
    areaRepo.getActiveById.mockResolvedValue(AREA_STUB);
    contextRepo.getById.mockResolvedValue(CONTEXT_STUB);

    const result = await uc.execute({
      workspaceId: 'ws-1',
      inboxItemId: item.id,
      title: 'Buy groceries',
      areaId: 'area-1',
      contextId: 'ctx-1',
      actorId: 'actor-1',
    });

    expect(result.status).toBe('ready');
    expect(result.title).toBe('Buy groceries');
    expect(result.areaId).toBe('area-1');
    expect(result.contextId).toBe('ctx-1');
    expect(batchPort.clarifyBatch).toHaveBeenCalledTimes(1);
  });

  it('persists inbox item, action, and audit events atomically via batch port', async () => {
    const { uc, inboxRepo, batchPort, areaRepo, contextRepo } = buildUseCase();
    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);
    areaRepo.getActiveById.mockResolvedValue(AREA_STUB);
    contextRepo.getById.mockResolvedValue(CONTEXT_STUB);

    await uc.execute({
      workspaceId: 'ws-1',
      inboxItemId: item.id,
      title: 'Buy groceries',
      areaId: 'area-1',
      contextId: 'ctx-1',
      actorId: 'actor-1',
    });

    expect(batchPort.clarifyBatch).toHaveBeenCalledTimes(1);
    const [clarifiedItem, action, auditEvents] = batchPort.clarifyBatch.mock.calls[0] as unknown[];
    expect(clarifiedItem).toHaveProperty('status', 'clarified');
    expect(action).toHaveProperty('title', 'Buy groceries');
    expect(auditEvents).toHaveLength(2);
  });

  it('inherits description from inbox item when not overridden', async () => {
    const { uc, inboxRepo, areaRepo, contextRepo } = buildUseCase();
    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);
    areaRepo.getActiveById.mockResolvedValue(AREA_STUB);
    contextRepo.getById.mockResolvedValue(CONTEXT_STUB);

    const result = await uc.execute({
      workspaceId: 'ws-1',
      inboxItemId: item.id,
      title: 'Buy groceries',
      areaId: 'area-1',
      contextId: 'ctx-1',
      actorId: 'actor-1',
    });

    expect(result.description).toBe('Weekly shopping list');
  });

  it('throws when inbox item not found', async () => {
    const { uc } = buildUseCase();

    await expect(
      uc.execute({
        workspaceId: 'ws-1',
        inboxItemId: 'nonexistent',
        title: 'Title',
        areaId: 'area-1',
        contextId: 'ctx-1',
        actorId: 'actor-1',
      })
    ).rejects.toThrow(DomainError);
  });

  it('throws when inbox item already clarified', async () => {
    const { uc, inboxRepo, areaRepo, contextRepo } = buildUseCase();
    const item = sampleInboxItem();
    const clarified = InboxItem.clarify(item, 'action', 'some-action-id');
    inboxRepo.getById.mockResolvedValue(clarified);
    areaRepo.getActiveById.mockResolvedValue(AREA_STUB);
    contextRepo.getById.mockResolvedValue(CONTEXT_STUB);

    await expect(
      uc.execute({
        workspaceId: 'ws-1',
        inboxItemId: item.id,
        title: 'Title',
        areaId: 'area-1',
        contextId: 'ctx-1',
        actorId: 'actor-1',
      })
    ).rejects.toThrow(DomainError);
  });

  it('throws when area not found or archived', async () => {
    const { uc, inboxRepo } = buildUseCase();
    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);

    await expect(
      uc.execute({
        workspaceId: 'ws-1',
        inboxItemId: item.id,
        title: 'Title',
        areaId: 'nonexistent',
        contextId: 'ctx-1',
        actorId: 'actor-1',
      })
    ).rejects.toThrow(DomainError);
  });

  it('throws when context not found', async () => {
    const { uc, inboxRepo, areaRepo } = buildUseCase();
    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);
    areaRepo.getActiveById.mockResolvedValue(AREA_STUB);

    await expect(
      uc.execute({
        workspaceId: 'ws-1',
        inboxItemId: item.id,
        title: 'Title',
        areaId: 'area-1',
        contextId: 'nonexistent',
        actorId: 'actor-1',
      })
    ).rejects.toThrow(DomainError);
  });
});
