/**
 * CompleteActionUseCase unit tests.
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest';

import { Action } from '../../domain/entities/Action';
import { DomainError } from '../../domain/errors/DomainError';
import type { ActionRepository } from '../../domain/interfaces/ActionRepository';
import type { AuditEventRepository } from '../../domain/interfaces/AuditEventRepository';

import { CompleteActionUseCase } from './CompleteActionUseCase';

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

describe('CompleteActionUseCase', () => {
  it('completes an active action', async () => {
    const actionRepo = mockActionRepo();
    const auditRepo = mockAuditRepo();
    const action = Action.create('ws-1', 'actor-1', 'Do thing', 'area-1', 'ctx-1');
    const activated = Action.activate(action);
    actionRepo.getById.mockResolvedValue(activated);

    const uc = new CompleteActionUseCase(
      actionRepo as unknown as ActionRepository,
      auditRepo as unknown as AuditEventRepository
    );
    const result = await uc.execute({
      workspaceId: 'ws-1',
      actionId: activated.id,
      actorId: 'actor-1',
    });

    expect(result.status).toBe('done');
    expect(actionRepo.save).toHaveBeenCalledTimes(1);
    expect(auditRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws when action not found', async () => {
    const actionRepo = mockActionRepo();
    const uc = new CompleteActionUseCase(actionRepo as unknown as ActionRepository);

    await expect(
      uc.execute({
        workspaceId: 'ws-1',
        actionId: 'nonexistent',
        actorId: 'actor-1',
      })
    ).rejects.toThrow(DomainError);
  });

  it('throws when action is not active', async () => {
    const actionRepo = mockActionRepo();
    const action = Action.create('ws-1', 'actor-1', 'Do thing', 'area-1', 'ctx-1');
    actionRepo.getById.mockResolvedValue(action);

    const uc = new CompleteActionUseCase(actionRepo as unknown as ActionRepository);

    await expect(
      uc.execute({
        workspaceId: 'ws-1',
        actionId: action.id,
        actorId: 'actor-1',
      })
    ).rejects.toThrow(DomainError);
  });

  it('works without audit repo', async () => {
    const actionRepo = mockActionRepo();
    const action = Action.create('ws-1', 'actor-1', 'Do thing', 'area-1', 'ctx-1');
    const activated = Action.activate(action);
    actionRepo.getById.mockResolvedValue(activated);

    const uc = new CompleteActionUseCase(actionRepo as unknown as ActionRepository);
    const result = await uc.execute({
      workspaceId: 'ws-1',
      actionId: activated.id,
      actorId: 'actor-1',
    });

    expect(result.status).toBe('done');
  });
});
