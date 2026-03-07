/**
 * CompleteActionUseCase unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { mockActionRepo, mockAuditRepo } from '../../../tests/mocks/repositories';
import { Action } from '../../domain/entities/Action';
import { DomainError } from '../../domain/errors/DomainError';

import { CompleteActionUseCase } from './CompleteActionUseCase';

describe('CompleteActionUseCase', () => {
  it('completes an active action', async () => {
    const actionRepo = mockActionRepo();
    const auditRepo = mockAuditRepo();
    const action = Action.create('ws-1', 'actor-1', 'Do thing', 'area-1', 'ctx-1');
    const activated = Action.activate(action);
    actionRepo.getById.mockResolvedValue(activated);

    const uc = new CompleteActionUseCase(actionRepo, auditRepo);
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
    const uc = new CompleteActionUseCase(actionRepo);

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

    const uc = new CompleteActionUseCase(actionRepo);

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

    const uc = new CompleteActionUseCase(actionRepo);
    const result = await uc.execute({
      workspaceId: 'ws-1',
      actionId: activated.id,
      actorId: 'actor-1',
    });

    expect(result.status).toBe('done');
  });
});
