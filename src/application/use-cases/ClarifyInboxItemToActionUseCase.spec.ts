/**
 * ClarifyInboxItemToActionUseCase unit tests.
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest';

import { InboxItem } from '../../domain/entities/InboxItem';
import { DomainError } from '../../domain/errors/DomainError';
import type { ActionRepository } from '../../domain/interfaces/ActionRepository';
import type { AreaRepository } from '../../domain/interfaces/AreaRepository';
import type { AuditEventRepository } from '../../domain/interfaces/AuditEventRepository';
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
 * Creates a mock ActionRepository.
 *
 * @returns An object with vi.fn() stubs for each ActionRepository method.
 */
function mockActionRepo(): {
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
 * Creates a mock AuditEventRepository.
 *
 * @returns An object with vi.fn() stubs for each AuditEventRepository method.
 */
function mockAuditRepo(): {
  save: ReturnType<typeof vi.fn>;
  listByEntityId: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    listByEntityId: vi.fn().mockResolvedValue([]),
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

describe('ClarifyInboxItemToActionUseCase', () => {
  it('clarifies an inbox item into an action', async () => {
    const inboxRepo = mockInboxRepo();
    const actionRepo = mockActionRepo();
    const areaRepo = mockAreaRepo();
    const contextRepo = mockContextRepo();
    const auditRepo = mockAuditRepo();

    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);
    areaRepo.getActiveById.mockResolvedValue({
      id: 'area-1',
      workspaceId: 'ws-1',
      name: 'Work',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    contextRepo.getById.mockResolvedValue({
      id: 'ctx-1',
      workspaceId: 'ws-1',
      name: 'computer',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    const uc = new ClarifyInboxItemToActionUseCase(
      inboxRepo as unknown as InboxItemRepository,
      actionRepo as unknown as ActionRepository,
      areaRepo as unknown as AreaRepository,
      contextRepo as unknown as ContextRepository,
      auditRepo as unknown as AuditEventRepository
    );

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
    expect(inboxRepo.save).toHaveBeenCalledTimes(1);
    expect(actionRepo.save).toHaveBeenCalledTimes(1);
    expect(auditRepo.save).toHaveBeenCalledTimes(2); // inbox_item.clarified + action.created
  });

  it('inherits description from inbox item when not overridden', async () => {
    const inboxRepo = mockInboxRepo();
    const actionRepo = mockActionRepo();
    const areaRepo = mockAreaRepo();
    const contextRepo = mockContextRepo();

    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);
    areaRepo.getActiveById.mockResolvedValue({
      id: 'area-1',
      workspaceId: 'ws-1',
      name: 'Work',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    contextRepo.getById.mockResolvedValue({
      id: 'ctx-1',
      workspaceId: 'ws-1',
      name: 'computer',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    const uc = new ClarifyInboxItemToActionUseCase(
      inboxRepo as unknown as InboxItemRepository,
      actionRepo as unknown as ActionRepository,
      areaRepo as unknown as AreaRepository,
      contextRepo as unknown as ContextRepository
    );

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
    const inboxRepo = mockInboxRepo();
    const actionRepo = mockActionRepo();
    const areaRepo = mockAreaRepo();
    const contextRepo = mockContextRepo();

    const uc = new ClarifyInboxItemToActionUseCase(
      inboxRepo as unknown as InboxItemRepository,
      actionRepo as unknown as ActionRepository,
      areaRepo as unknown as AreaRepository,
      contextRepo as unknown as ContextRepository
    );

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
    const inboxRepo = mockInboxRepo();
    const actionRepo = mockActionRepo();
    const areaRepo = mockAreaRepo();
    const contextRepo = mockContextRepo();

    const item = sampleInboxItem();
    const clarified = InboxItem.clarify(item, 'action', 'some-action-id');
    inboxRepo.getById.mockResolvedValue(clarified);
    areaRepo.getActiveById.mockResolvedValue({
      id: 'area-1',
      workspaceId: 'ws-1',
      name: 'Work',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    contextRepo.getById.mockResolvedValue({
      id: 'ctx-1',
      workspaceId: 'ws-1',
      name: 'computer',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    const uc = new ClarifyInboxItemToActionUseCase(
      inboxRepo as unknown as InboxItemRepository,
      actionRepo as unknown as ActionRepository,
      areaRepo as unknown as AreaRepository,
      contextRepo as unknown as ContextRepository
    );

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
    const inboxRepo = mockInboxRepo();
    const actionRepo = mockActionRepo();
    const areaRepo = mockAreaRepo();
    const contextRepo = mockContextRepo();

    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);
    // areaRepo.getActiveById returns null (not found or archived)

    const uc = new ClarifyInboxItemToActionUseCase(
      inboxRepo as unknown as InboxItemRepository,
      actionRepo as unknown as ActionRepository,
      areaRepo as unknown as AreaRepository,
      contextRepo as unknown as ContextRepository
    );

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
    const inboxRepo = mockInboxRepo();
    const actionRepo = mockActionRepo();
    const areaRepo = mockAreaRepo();
    const contextRepo = mockContextRepo();

    const item = sampleInboxItem();
    inboxRepo.getById.mockResolvedValue(item);
    areaRepo.getActiveById.mockResolvedValue({
      id: 'area-1',
      workspaceId: 'ws-1',
      name: 'Work',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    // contextRepo.getById returns null

    const uc = new ClarifyInboxItemToActionUseCase(
      inboxRepo as unknown as InboxItemRepository,
      actionRepo as unknown as ActionRepository,
      areaRepo as unknown as AreaRepository,
      contextRepo as unknown as ContextRepository
    );

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
