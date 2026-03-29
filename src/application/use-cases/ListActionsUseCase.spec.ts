import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActionRepository } from '../../domain/interfaces/ActionRepository.js';

import { ListActionsUseCase } from './ListActionsUseCase.js';

/**
 * Creates a minimal ActionRepository mock.
 *
 * @returns An object with vi.fn() stubs for each ActionRepository method.
 */
function makeActionRepoMock(): {
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

describe('ListActionsUseCase', () => {
  let repoMock: ReturnType<typeof makeActionRepoMock>;
  let useCase: ListActionsUseCase;

  beforeEach(() => {
    repoMock = makeActionRepoMock();
    useCase = new ListActionsUseCase(repoMock as unknown as ActionRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array when the workspace has no actions', async () => {
    repoMock.listByWorkspaceId.mockResolvedValue([]);

    const result = await useCase.execute({ workspaceId: 'ws-1' });

    expect(result).toEqual([]);
    expect(repoMock.listByWorkspaceId).toHaveBeenCalledWith('ws-1', undefined);
  });

  it('passes an explicit status filter to the repository when provided', async () => {
    repoMock.listByWorkspaceId.mockResolvedValue([]);

    await useCase.execute({ workspaceId: 'ws-1', status: 'active' });

    expect(repoMock.listByWorkspaceId).toHaveBeenCalledWith('ws-1', 'active');
  });

  it('maps domain entities to DTOs', async () => {
    const action = {
      id: 'action-1',
      workspaceId: 'ws-1',
      title: 'Do thing',
      description: null,
      status: 'ready' as const,
      areaId: 'area-1',
      contextId: 'ctx-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    repoMock.listByWorkspaceId.mockResolvedValue([action]);

    const result = await useCase.execute({ workspaceId: 'ws-1' });

    expect(result).toEqual([
      {
        id: 'action-1',
        title: 'Do thing',
        description: null,
        status: 'ready',
        areaId: 'area-1',
        contextId: 'ctx-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('emits console.warn when result count hits the safety cap', async () => {
    const items = Array.from({ length: 500 }, (_, i) => ({
      id: `action-${String(i)}`,
      workspaceId: 'ws-1',
      title: `Action ${String(i)}`,
      description: null,
      status: 'ready' as const,
      areaId: 'area-1',
      contextId: 'ctx-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }));
    repoMock.listByWorkspaceId.mockResolvedValue(items);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await useCase.execute({ workspaceId: 'ws-1' });

    expect(warnSpy).toHaveBeenCalledWith(
      '[ListActionsUseCase] Result count hit 500-item safety cap',
      { workspaceId: 'ws-1' }
    );
  });
});
