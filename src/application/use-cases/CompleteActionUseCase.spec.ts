/**
 * CompleteActionUseCase unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { mockActionRepo, mockAuditRepo } from '../../../tests/mocks/repositories';
import { Action } from '../../domain/entities/Action';

import { CompleteActionUseCase } from './CompleteActionUseCase';
import type { CompleteActionResult } from './CompleteActionUseCase';

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

describe('CompleteActionUseCase', () => {
  it('completes an active action', async () => {
    const actionRepo = mockActionRepo();
    const auditRepo = mockAuditRepo();
    const action = unwrap(Action.create('ws-1', 'actor-1', 'Do thing', 'area-1', 'ctx-1'));
    const activated = unwrap(Action.activate(action));
    actionRepo.getById.mockResolvedValue(activated);

    const uc = new CompleteActionUseCase(actionRepo, auditRepo);
    const result: CompleteActionResult = await uc.execute({
      workspaceId: 'ws-1',
      actionId: activated.id,
      actorId: 'actor-1',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe('done');
    }
    expect(actionRepo.save).toHaveBeenCalledTimes(1);
    expect(auditRepo.save).toHaveBeenCalledTimes(1);
  });

  it('returns error when action not found', async () => {
    const actionRepo = mockActionRepo();
    const uc = new CompleteActionUseCase(actionRepo);

    const result = await uc.execute({
      workspaceId: 'ws-1',
      actionId: 'nonexistent',
      actorId: 'actor-1',
    });

    expect(result).toEqual({ ok: false, kind: 'action_not_found' });
  });

  it('returns error when action is not active', async () => {
    const actionRepo = mockActionRepo();
    const action = unwrap(Action.create('ws-1', 'actor-1', 'Do thing', 'area-1', 'ctx-1'));
    actionRepo.getById.mockResolvedValue(action);

    const uc = new CompleteActionUseCase(actionRepo);

    const result = await uc.execute({
      workspaceId: 'ws-1',
      actionId: action.id,
      actorId: 'actor-1',
    });

    expect(result).toEqual({ ok: false, kind: 'invalid_status_transition' });
  });

  it('works without audit repo', async () => {
    const actionRepo = mockActionRepo();
    const action = unwrap(Action.create('ws-1', 'actor-1', 'Do thing', 'area-1', 'ctx-1'));
    const activated = unwrap(Action.activate(action));
    actionRepo.getById.mockResolvedValue(activated);

    const uc = new CompleteActionUseCase(actionRepo);
    const result = await uc.execute({
      workspaceId: 'ws-1',
      actionId: activated.id,
      actorId: 'actor-1',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe('done');
    }
  });
});
