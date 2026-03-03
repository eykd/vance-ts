import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AreaRepository } from '../../domain/interfaces/AreaRepository.js';

import { ListAreasUseCase } from './ListAreasUseCase.js';

/**
 * Creates a minimal AreaRepository mock.
 *
 * @returns An object with vi.fn() stubs for each AreaRepository method.
 */
function makeAreaRepoMock(): {
  save: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  getActiveById: ReturnType<typeof vi.fn>;
  listByWorkspaceId: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn(),
    getById: vi.fn(),
    getActiveById: vi.fn(),
    listByWorkspaceId: vi.fn(),
  };
}

describe('ListAreasUseCase', () => {
  let areaRepoMock: ReturnType<typeof makeAreaRepoMock>;
  let useCase: ListAreasUseCase;

  beforeEach(() => {
    areaRepoMock = makeAreaRepoMock();
    useCase = new ListAreasUseCase(areaRepoMock as unknown as AreaRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array when the workspace has no areas', async () => {
    areaRepoMock.listByWorkspaceId.mockResolvedValue([]);

    const result = await useCase.execute({ workspaceId: 'ws-1' });

    expect(result).toEqual([]);
    expect(areaRepoMock.listByWorkspaceId).toHaveBeenCalledWith('ws-1');
  });

  it('maps domain entities to AreaDtos', async () => {
    areaRepoMock.listByWorkspaceId.mockResolvedValue([
      {
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Work',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'area-2',
        workspaceId: 'ws-1',
        name: 'Personal',
        status: 'archived',
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      },
    ]);

    const result = await useCase.execute({ workspaceId: 'ws-1' });

    expect(result).toEqual([
      {
        id: 'area-1',
        name: 'Work',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'area-2',
        name: 'Personal',
        status: 'archived',
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      },
    ]);
  });

  it('does not expose workspaceId on returned DTOs', async () => {
    areaRepoMock.listByWorkspaceId.mockResolvedValue([
      {
        id: 'area-1',
        workspaceId: 'ws-1',
        name: 'Admin',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const result = await useCase.execute({ workspaceId: 'ws-1' });

    expect(result[0]).not.toHaveProperty('workspaceId');
  });

  it('propagates repository errors', async () => {
    areaRepoMock.listByWorkspaceId.mockRejectedValue(new Error('D1 failure'));

    await expect(useCase.execute({ workspaceId: 'ws-1' })).rejects.toThrow('D1 failure');
  });
});
