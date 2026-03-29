/**
 * Action entity unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError';

import { Action } from './Action';

/**
 * Helper to unwrap a successful Result or fail the test.
 *
 * @param result - The Result to unwrap.
 * @returns The success value.
 */
function unwrap<T>(
  result: { success: true; value: T } | { success: false; error: DomainError }
): T {
  if (!result.success) {
    throw new Error(`Unexpected failure: ${result.error.code}`);
  }
  return result.value;
}

describe('Action', () => {
  describe('create', () => {
    it('creates an action with ready status', () => {
      const result = Action.create('ws-1', 'actor-1', 'Do the thing', 'area-1', 'ctx-1');

      expect(result.success).toBe(true);
      const action = unwrap(result);
      expect(action.workspaceId).toBe('ws-1');
      expect(action.createdByActorId).toBe('actor-1');
      expect(action.title).toBe('Do the thing');
      expect(action.areaId).toBe('area-1');
      expect(action.contextId).toBe('ctx-1');
      expect(action.status).toBe('ready');
      expect(action.description).toBeNull();
      expect(action.projectId).toBeNull();
      expect(action.id).toBeDefined();
      expect(action.createdAt).toBeDefined();
      expect(action.updatedAt).toBeDefined();
    });

    it('accepts an optional description', () => {
      const action = unwrap(
        Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1', 'Some desc')
      );
      expect(action.description).toBe('Some desc');
    });

    it('returns failure when workspaceId is blank', () => {
      const result = Action.create('', 'actor-1', 'Title', 'area-1', 'ctx-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
        expect(result.error.code).toBe('workspace_id_required');
      }
    });

    it('returns failure when actorId is blank', () => {
      const result = Action.create('ws-1', '', 'Title', 'area-1', 'ctx-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
      }
    });

    it('returns failure when title is blank', () => {
      const result = Action.create('ws-1', 'actor-1', '', 'area-1', 'ctx-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
      }
    });

    it('returns failure when title exceeds 255 characters', () => {
      const longTitle = 'x'.repeat(256);
      const result = Action.create('ws-1', 'actor-1', longTitle, 'area-1', 'ctx-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
      }
    });

    it('returns failure when areaId is blank', () => {
      const result = Action.create('ws-1', 'actor-1', 'Title', '', 'ctx-1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
      }
    });

    it('returns failure when contextId is blank', () => {
      const result = Action.create('ws-1', 'actor-1', 'Title', 'area-1', '');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
      }
    });

    it('returns failure when description is blank whitespace', () => {
      const result = Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1', '   ');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
      }
    });

    it('returns failure when description exceeds 2000 characters', () => {
      const longDesc = 'x'.repeat(2001);
      const result = Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1', longDesc);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
      }
    });
  });

  describe('reconstitute', () => {
    it('hydrates an action from raw fields', () => {
      const fields: Action = {
        id: 'action-1',
        workspaceId: 'ws-1',
        createdByActorId: 'actor-1',
        title: 'Title',
        description: null,
        status: 'ready',
        areaId: 'area-1',
        contextId: 'ctx-1',
        projectId: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      const action = Action.reconstitute(fields);
      expect(action).toEqual(fields);
    });
  });

  describe('activate', () => {
    it('transitions a ready action to active', () => {
      const action = unwrap(Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1'));
      const result = Action.activate(action);

      expect(result.success).toBe(true);
      const activated = unwrap(result);
      expect(activated.status).toBe('active');
      expect(activated.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('returns failure when action is not ready', () => {
      const action = unwrap(Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1'));
      const activated = unwrap(Action.activate(action));
      const result = Action.activate(activated);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
      }
    });

    it('returns failure with invalid_status_transition code', () => {
      const action = unwrap(Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1'));
      const activated = unwrap(Action.activate(action));
      const result = Action.activate(activated);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
        expect(result.error.code).toBe('invalid_status_transition');
      }
    });
  });

  describe('complete', () => {
    it('transitions an active action to done', () => {
      const action = unwrap(Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1'));
      const activated = unwrap(Action.activate(action));
      const result = Action.complete(activated);

      expect(result.success).toBe(true);
      const completed = unwrap(result);
      expect(completed.status).toBe('done');
      expect(completed.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('returns failure when action is not active', () => {
      const action = unwrap(Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1'));
      const result = Action.complete(action);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
      }
    });

    it('returns failure when action is already done', () => {
      const action = unwrap(Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1'));
      const activated = unwrap(Action.activate(action));
      const completed = unwrap(Action.complete(activated));
      const result = Action.complete(completed);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError);
      }
    });
  });
});
