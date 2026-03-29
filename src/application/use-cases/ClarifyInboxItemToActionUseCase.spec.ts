/**
 * ClarifyInboxItemToActionUseCase unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import {
  mockAreaRepo,
  mockBatchPort,
  mockContextRepo,
  mockInboxRepo,
} from '../../../tests/mocks/repositories';
import { InboxItem } from '../../domain/entities/InboxItem';

import { ClarifyInboxItemToActionUseCase } from './ClarifyInboxItemToActionUseCase';
import type { ClarifyInboxItemResult } from './ClarifyInboxItemToActionUseCase';

/**
 * Helper to unwrap a successful Result or fail the test.
 *
 * @param result - The domain Result to unwrap.
 * @param result.success - Whether the result is successful.
 * @param result.value - The success value.
 * @returns The success value.
 */
function unwrap<T>(result: { success: boolean; value?: T }): T {
  if (!result.success) {
    throw new Error('Expected Result to be successful');
  }
  return result.value as T;
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
 * Creates a sample inbox item for testing.
 *
 * @returns An inbox item in 'inbox' status.
 */
function sampleInboxItem(): InboxItem {
  return unwrap(InboxItem.create('ws-1', 'Buy groceries', 'Weekly shopping list'));
}

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

  const uc = new ClarifyInboxItemToActionUseCase(inboxRepo, batchPort, areaRepo, contextRepo);

  return { uc, inboxRepo, batchPort, areaRepo, contextRepo };
}

describe('ClarifyInboxItemToActionUseCase', () => {
  it('clarifies an inbox item into an action', async () => {
    const { uc, inboxRepo, batchPort, areaRepo, contextRepo } = buildUseCase();
    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);
    areaRepo.getActiveById.mockResolvedValue(AREA_STUB);
    contextRepo.getById.mockResolvedValue(CONTEXT_STUB);

    const result: ClarifyInboxItemResult = await uc.execute({
      workspaceId: 'ws-1',
      inboxItemId: item.id,
      title: 'Buy groceries',
      areaId: 'area-1',
      contextId: 'ctx-1',
      actorId: 'actor-1',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe('ready');
      expect(result.data.title).toBe('Buy groceries');
      expect(result.data.areaId).toBe('area-1');
      expect(result.data.contextId).toBe('ctx-1');
    }
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

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.description).toBe('Weekly shopping list');
    }
  });

  it('returns error when inbox item not found', async () => {
    const { uc } = buildUseCase();

    const result = await uc.execute({
      workspaceId: 'ws-1',
      inboxItemId: 'nonexistent',
      title: 'Title',
      areaId: 'area-1',
      contextId: 'ctx-1',
      actorId: 'actor-1',
    });

    expect(result).toEqual({ ok: false, kind: 'inbox_item_not_found' });
  });

  it('returns error when inbox item already clarified', async () => {
    const { uc, inboxRepo, areaRepo, contextRepo } = buildUseCase();
    const item = sampleInboxItem();
    const clarified = unwrap(InboxItem.clarify(item, 'action', 'some-action-id'));
    inboxRepo.getById.mockResolvedValue(clarified);
    areaRepo.getActiveById.mockResolvedValue(AREA_STUB);
    contextRepo.getById.mockResolvedValue(CONTEXT_STUB);

    const result = await uc.execute({
      workspaceId: 'ws-1',
      inboxItemId: item.id,
      title: 'Title',
      areaId: 'area-1',
      contextId: 'ctx-1',
      actorId: 'actor-1',
    });

    expect(result).toEqual({ ok: false, kind: 'already_clarified' });
  });

  it('returns error when area not found or archived', async () => {
    const { uc, inboxRepo } = buildUseCase();
    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);

    const result = await uc.execute({
      workspaceId: 'ws-1',
      inboxItemId: item.id,
      title: 'Title',
      areaId: 'nonexistent',
      contextId: 'ctx-1',
      actorId: 'actor-1',
    });

    expect(result).toEqual({ ok: false, kind: 'area_not_found_or_archived' });
  });

  it('returns error when context not found', async () => {
    const { uc, inboxRepo, areaRepo } = buildUseCase();
    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);
    areaRepo.getActiveById.mockResolvedValue(AREA_STUB);

    const result = await uc.execute({
      workspaceId: 'ws-1',
      inboxItemId: item.id,
      title: 'Title',
      areaId: 'area-1',
      contextId: 'nonexistent',
      actorId: 'actor-1',
    });

    expect(result).toEqual({ ok: false, kind: 'context_not_found' });
  });
});
