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
});
