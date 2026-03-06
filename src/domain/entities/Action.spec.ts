/**
 * Action entity unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError';

import { Action } from './Action';

describe('Action', () => {
  describe('create', () => {
    it('creates an action with ready status', () => {
      const action = Action.create('ws-1', 'actor-1', 'Do the thing', 'area-1', 'ctx-1');
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
      const action = Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1', 'Some desc');
      expect(action.description).toBe('Some desc');
    });

    it('throws when workspaceId is blank', () => {
      expect(() => Action.create('', 'actor-1', 'Title', 'area-1', 'ctx-1')).toThrow(DomainError);
    });

    it('throws when actorId is blank', () => {
      expect(() => Action.create('ws-1', '', 'Title', 'area-1', 'ctx-1')).toThrow(DomainError);
    });

    it('throws when title is blank', () => {
      expect(() => Action.create('ws-1', 'actor-1', '', 'area-1', 'ctx-1')).toThrow(DomainError);
    });

    it('throws when title exceeds 255 characters', () => {
      const longTitle = 'x'.repeat(256);
      expect(() => Action.create('ws-1', 'actor-1', longTitle, 'area-1', 'ctx-1')).toThrow(
        DomainError
      );
    });

    it('throws when areaId is blank', () => {
      expect(() => Action.create('ws-1', 'actor-1', 'Title', '', 'ctx-1')).toThrow(DomainError);
    });

    it('throws when contextId is blank', () => {
      expect(() => Action.create('ws-1', 'actor-1', 'Title', 'area-1', '')).toThrow(DomainError);
    });

    it('throws when description is blank whitespace', () => {
      expect(() => Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1', '   ')).toThrow(
        DomainError
      );
    });

    it('throws when description exceeds 2000 characters', () => {
      const longDesc = 'x'.repeat(2001);
      expect(() => Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1', longDesc)).toThrow(
        DomainError
      );
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
      const action = Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1');
      const activated = Action.activate(action);
      expect(activated.status).toBe('active');
      expect(activated.updatedAt).toBeDefined();
    });

    it('throws when action is not ready', () => {
      const action = Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1');
      const activated = Action.activate(action);
      expect(() => Action.activate(activated)).toThrow(DomainError);
    });

    it('throws with invalid_status_transition code', () => {
      const action = Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1');
      const activated = Action.activate(action);
      try {
        Action.activate(activated);
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(DomainError);
        expect((err as DomainError).code).toBe('invalid_status_transition');
      }
    });
  });

  describe('complete', () => {
    it('transitions an active action to done', () => {
      const action = Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1');
      const activated = Action.activate(action);
      const completed = Action.complete(activated);
      expect(completed.status).toBe('done');
      expect(completed.updatedAt).toBeDefined();
    });

    it('throws when action is not active', () => {
      const action = Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1');
      expect(() => Action.complete(action)).toThrow(DomainError);
    });

    it('throws when action is already done', () => {
      const action = Action.create('ws-1', 'actor-1', 'Title', 'area-1', 'ctx-1');
      const activated = Action.activate(action);
      const completed = Action.complete(activated);
      expect(() => Action.complete(completed)).toThrow(DomainError);
    });
  });
});
