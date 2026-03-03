import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ContextRepository } from '../../domain/interfaces/ContextRepository.js';

import { ListContextsUseCase } from './ListContextsUseCase.js';

/**
 * Creates a minimal ContextRepository mock.
 *
 * @returns An object with vi.fn() stubs for each ContextRepository method.
 */
function makeContextRepoMock(): {
  save: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  listByWorkspaceId: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn(),
    getById: vi.fn(),
    listByWorkspaceId: vi.fn(),
  };
}

describe('ListContextsUseCase', () => {
  let contextRepoMock: ReturnType<typeof makeContextRepoMock>;
  let useCase: ListContextsUseCase;

  beforeEach(() => {
    contextRepoMock = makeContextRepoMock();
    useCase = new ListContextsUseCase(contextRepoMock as unknown as ContextRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array when the workspace has no contexts', async () => {
    contextRepoMock.listByWorkspaceId.mockResolvedValue([]);

    const result = await useCase.execute({ workspaceId: 'ws-1' });

    expect(result).toEqual([]);
    expect(contextRepoMock.listByWorkspaceId).toHaveBeenCalledWith('ws-1');
  });

  it('maps domain entities to ContextDtos', async () => {
    contextRepoMock.listByWorkspaceId.mockResolvedValue([
      {
        id: 'ctx-1',
        workspaceId: 'ws-1',
        name: 'computer',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'ctx-2',
        workspaceId: 'ws-1',
        name: 'calls',
        createdAt: '2026-01-02T00:00:00.000Z',
      },
    ]);

    const result = await useCase.execute({ workspaceId: 'ws-1' });

    expect(result).toEqual([
      { id: 'ctx-1', name: 'computer', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'ctx-2', name: 'calls', createdAt: '2026-01-02T00:00:00.000Z' },
    ]);
  });

  it('does not expose workspaceId on returned DTOs', async () => {
    contextRepoMock.listByWorkspaceId.mockResolvedValue([
      {
        id: 'ctx-1',
        workspaceId: 'ws-1',
        name: 'home',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const result = await useCase.execute({ workspaceId: 'ws-1' });

    expect(result[0]).not.toHaveProperty('workspaceId');
  });

  it('propagates repository errors', async () => {
    contextRepoMock.listByWorkspaceId.mockRejectedValue(new Error('D1 failure'));

    await expect(useCase.execute({ workspaceId: 'ws-1' })).rejects.toThrow('D1 failure');
  });
});
