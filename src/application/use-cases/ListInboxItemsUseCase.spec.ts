import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InboxItemRepository } from '../../domain/interfaces/InboxItemRepository.js';

import { ListInboxItemsUseCase } from './ListInboxItemsUseCase.js';

/**
 * Creates a minimal InboxItemRepository mock.
 *
 * @returns An object with vi.fn() stubs for each InboxItemRepository method.
 */
function makeInboxItemRepoMock(): {
  save: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  listByWorkspaceId: ReturnType<typeof vi.fn>;
  countByWorkspaceId: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn(),
    getById: vi.fn(),
    listByWorkspaceId: vi.fn(),
    countByWorkspaceId: vi.fn(),
  };
}

describe('ListInboxItemsUseCase', () => {
  let repoMock: ReturnType<typeof makeInboxItemRepoMock>;
  let useCase: ListInboxItemsUseCase;

  beforeEach(() => {
    repoMock = makeInboxItemRepoMock();
    useCase = new ListInboxItemsUseCase(repoMock as unknown as InboxItemRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array when the workspace has no inbox items', async () => {
    repoMock.listByWorkspaceId.mockResolvedValue([]);

    const result = await useCase.execute({ workspaceId: 'ws-1' });

    expect(result).toEqual([]);
    expect(repoMock.listByWorkspaceId).toHaveBeenCalledWith('ws-1', 'inbox');
  });

  it('emits console.warn when result count hits the safety cap', async () => {
    const items = Array.from({ length: 500 }, (_, i) => ({
      id: `item-${String(i)}`,
      workspaceId: 'ws-1',
      title: `Item ${String(i)}`,
      description: null,
      status: 'inbox' as const,
      clarifiedIntoType: null,
      clarifiedIntoId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }));
    repoMock.listByWorkspaceId.mockResolvedValue(items);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await useCase.execute({ workspaceId: 'ws-1' });

    expect(warnSpy).toHaveBeenCalledWith(
      '[ListInboxItemsUseCase] Result count hit 500-item safety cap',
      { workspaceId: 'ws-1' }
    );
  });
});
