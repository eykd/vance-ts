import { Hono } from 'hono/tiny';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActionDto } from '../../application/dto/ActionDto.js';
import type { ActivateActionUseCase } from '../../application/use-cases/ActivateActionUseCase.js';
import type { ClarifyInboxItemToActionUseCase } from '../../application/use-cases/ClarifyInboxItemToActionUseCase.js';
import type { CompleteActionUseCase } from '../../application/use-cases/CompleteActionUseCase.js';
import { DomainError } from '../../domain/errors/DomainError.js';

import { createActionApiHandlers } from './ActionApiHandlers.js';

/** Sample action DTO fixture. */
const ACTION_DTO: ActionDto = {
  id: 'action-1',
  title: 'Do thing',
  description: null,
  status: 'ready',
  areaId: 'area-1',
  contextId: 'ctx-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

/**
 * Creates a mock use case.
 *
 * @returns An object with a vi.fn() stub for the execute method.
 */
function makeMock(): { execute: ReturnType<typeof vi.fn> } {
  return { execute: vi.fn() };
}

describe('createActionApiHandlers', () => {
  let clarifyMock: ReturnType<typeof makeMock>;
  let activateMock: ReturnType<typeof makeMock>;
  let completeMock: ReturnType<typeof makeMock>;

  beforeEach(() => {
    clarifyMock = makeMock();
    activateMock = makeMock();
    completeMock = makeMock();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Builds a test app with fake auth middleware.
   *
   * @returns A configured Hono test application.
   */
  function makeTestApp(): Hono {
    const app = new Hono();
    app.use('*', (c, next): Promise<void | Response> => {
      c.set('workspaceId' as never, 'ws-1');
      c.set('actorId' as never, 'actor-1');
      return next();
    });
    const handlers = createActionApiHandlers(
      clarifyMock as unknown as ClarifyInboxItemToActionUseCase,
      activateMock as unknown as ActivateActionUseCase,
      completeMock as unknown as CompleteActionUseCase
    );
    app.post('/api/v1/inbox/:id/clarify', (c) => handlers.handleClarify(c as never));
    app.post('/api/v1/actions/:id/activate', (c) => handlers.handleActivate(c as never));
    app.post('/api/v1/actions/:id/complete', (c) => handlers.handleComplete(c as never));
    return app;
  }

  describe('handleClarify', () => {
    it('returns 200 with created action DTO', async () => {
      clarifyMock.execute.mockResolvedValue(ACTION_DTO);

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Do thing', areaId: 'area-1', contextId: 'ctx-1' }),
        })
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(ACTION_DTO);
      expect(clarifyMock.execute).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        inboxItemId: 'inbox-1',
        title: 'Do thing',
        areaId: 'area-1',
        contextId: 'ctx-1',
        actorId: 'actor-1',
      });
    });

    it('returns 422 for already_clarified error', async () => {
      clarifyMock.execute.mockRejectedValue(new DomainError('already_clarified'));

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Do thing', areaId: 'area-1', contextId: 'ctx-1' }),
        })
      );

      expect(res.status).toBe(422);
      const body: { error: { code: string } } = await res.json();
      expect(body.error.code).toBe('already_clarified');
    });

    it('returns 422 for area_not_found_or_archived error', async () => {
      clarifyMock.execute.mockRejectedValue(new DomainError('area_not_found_or_archived'));

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Do thing', areaId: 'bad', contextId: 'ctx-1' }),
        })
      );

      expect(res.status).toBe(422);
    });

    it('returns 422 for context_not_found error', async () => {
      clarifyMock.execute.mockRejectedValue(new DomainError('context_not_found'));

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Do thing', areaId: 'area-1', contextId: 'bad' }),
        })
      );

      expect(res.status).toBe(422);
    });
  });

  describe('handleActivate', () => {
    it('returns 200 with activated action DTO', async () => {
      const activatedDto = { ...ACTION_DTO, status: 'active' as const };
      activateMock.execute.mockResolvedValue(activatedDto);

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/actions/action-1/activate', {
          method: 'POST',
        })
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(activatedDto);
      expect(activateMock.execute).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        actionId: 'action-1',
        actorId: 'actor-1',
      });
    });

    it('returns 422 for invalid_status_transition', async () => {
      activateMock.execute.mockRejectedValue(new DomainError('invalid_status_transition'));

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/actions/action-1/activate', {
          method: 'POST',
        })
      );

      expect(res.status).toBe(422);
      const body: { error: { code: string } } = await res.json();
      expect(body.error.code).toBe('invalid_status_transition');
    });
  });

  describe('handleComplete', () => {
    it('returns 200 with completed action DTO', async () => {
      const completedDto = { ...ACTION_DTO, status: 'done' as const };
      completeMock.execute.mockResolvedValue(completedDto);

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/actions/action-1/complete', {
          method: 'POST',
        })
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(completedDto);
    });

    it('returns 422 for invalid_status_transition', async () => {
      completeMock.execute.mockRejectedValue(new DomainError('invalid_status_transition'));

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/actions/action-1/complete', {
          method: 'POST',
        })
      );

      expect(res.status).toBe(422);
    });
  });
});
