/**
 * ActivateActionUseCase unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { mockActionRepo, mockAuditRepo } from '../../../tests/mocks/repositories';
import { Action } from '../../domain/entities/Action';
import { DomainError } from '../../domain/errors/DomainError';

import { ActivateActionUseCase } from './ActivateActionUseCase';

describe('ActivateActionUseCase', () => {
  it('activates a ready action', async () => {
    const actionRepo = mockActionRepo();
    const auditRepo = mockAuditRepo();
    const action = Action.create('ws-1', 'actor-1', 'Do thing', 'area-1', 'ctx-1');
    actionRepo.getById.mockResolvedValue(action);

    const uc = new ActivateActionUseCase(actionRepo, auditRepo);
    const result = await uc.execute({
      workspaceId: 'ws-1',
      actionId: action.id,
      actorId: 'actor-1',
    });

    expect(result.status).toBe('active');
    expect(actionRepo.save).toHaveBeenCalledTimes(1);
    expect(auditRepo.save).toHaveBeenCalledTimes(1);
  });

  it('throws when action not found', async () => {
    const actionRepo = mockActionRepo();
    const uc = new ActivateActionUseCase(actionRepo);

    await expect(
      uc.execute({
        workspaceId: 'ws-1',
        actionId: 'nonexistent',
        actorId: 'actor-1',
      })
    ).rejects.toThrow(DomainError);
  });

  it('throws when action is not in ready status', async () => {
    const actionRepo = mockActionRepo();
    const action = Action.create('ws-1', 'actor-1', 'Do thing', 'area-1', 'ctx-1');
    const activated = Action.activate(action);
    actionRepo.getById.mockResolvedValue(activated);

    const uc = new ActivateActionUseCase(actionRepo);

    await expect(
      uc.execute({
        workspaceId: 'ws-1',
        actionId: activated.id,
        actorId: 'actor-1',
      })
    ).rejects.toThrow(DomainError);
  });

  it('works without audit repo', async () => {
    const actionRepo = mockActionRepo();
    const action = Action.create('ws-1', 'actor-1', 'Do thing', 'area-1', 'ctx-1');
    actionRepo.getById.mockResolvedValue(action);

    const uc = new ActivateActionUseCase(actionRepo);
    const result = await uc.execute({
      workspaceId: 'ws-1',
      actionId: action.id,
      actorId: 'actor-1',
    });

    expect(result.status).toBe('active');
  });
});
