import { Hono } from 'hono/tiny';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActionDto } from '../../application/dto/ActionDto.js';
import type { ActivateActionUseCase } from '../../application/use-cases/ActivateActionUseCase.js';
import type { ClarifyInboxItemToActionUseCase } from '../../application/use-cases/ClarifyInboxItemToActionUseCase.js';
import type { CompleteActionUseCase } from '../../application/use-cases/CompleteActionUseCase.js';
import type { ListActionsUseCase } from '../../application/use-cases/ListActionsUseCase.js';

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
  let listMock: ReturnType<typeof makeMock>;

  beforeEach(() => {
    clarifyMock = makeMock();
    activateMock = makeMock();
    completeMock = makeMock();
    listMock = makeMock();
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
      completeMock as unknown as CompleteActionUseCase,
      listMock as unknown as ListActionsUseCase
    );
    app.post('/api/v1/inbox/:id/clarify', (c) => handlers.handleClarify(c as never));
    app.post('/api/v1/actions/:id/activate', (c) => handlers.handleActivate(c as never));
    app.post('/api/v1/actions/:id/complete', (c) => handlers.handleComplete(c as never));
    app.get('/api/v1/actions', (c) => handlers.handleListActions(c as never));
    return app;
  }

  describe('handleClarify', () => {
    it('returns 200 with created action DTO', async () => {
      clarifyMock.execute.mockResolvedValue({ ok: true, data: ACTION_DTO });

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

    it('returns 409 for already_clarified error', async () => {
      clarifyMock.execute.mockResolvedValue({ ok: false, kind: 'already_clarified' });

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Do thing', areaId: 'area-1', contextId: 'ctx-1' }),
        })
      );

      expect(res.status).toBe(409);
      const body: { error: { code: string; message: string } } = await res.json();
      expect(body.error.code).toBe('already_clarified');
      expect(body.error.message).toBe('Already clarified');
    });

    it('returns 404 for area_not_found_or_archived error', async () => {
      clarifyMock.execute.mockResolvedValue({ ok: false, kind: 'area_not_found_or_archived' });

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Do thing', areaId: 'bad', contextId: 'ctx-1' }),
        })
      );

      expect(res.status).toBe(404);
    });

    it('returns 404 for context_not_found error', async () => {
      clarifyMock.execute.mockResolvedValue({ ok: false, kind: 'context_not_found' });

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Do thing', areaId: 'area-1', contextId: 'bad' }),
        })
      );

      expect(res.status).toBe(404);
    });

    it('returns 400 when required fields are missing', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Do thing' }),
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('validation_error');
    });

    it('returns 400 when body is malformed JSON', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{not valid json',
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('invalid_json');
      expect(body.error.message).toBe('Request body must be valid JSON');
    });

    it('does not leak stack traces in malformed JSON error response', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{not valid json',
        })
      );

      const text = await res.text();
      expect(text).not.toContain('stack');
      expect(text).not.toContain('at ');
    });

    it('returns 400 when fields have wrong types', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 123, areaId: 'area-1', contextId: 'ctx-1' }),
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('validation_error');
    });

    it('returns 500 for unexpected errors', async () => {
      clarifyMock.execute.mockRejectedValue(new Error('unexpected'));

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Do thing', areaId: 'area-1', contextId: 'ctx-1' }),
        })
      );

      expect(res.status).toBe(500);
    });
  });

  describe('handleActivate', () => {
    it('returns 200 with activated action DTO', async () => {
      const activatedDto = { ...ACTION_DTO, status: 'active' as const };
      activateMock.execute.mockResolvedValue({ ok: true, data: activatedDto });

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

    it('returns 409 for invalid_status_transition', async () => {
      activateMock.execute.mockResolvedValue({ ok: false, kind: 'invalid_status_transition' });

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/actions/action-1/activate', {
          method: 'POST',
        })
      );

      expect(res.status).toBe(409);
      const body: { error: { code: string; message: string } } = await res.json();
      expect(body.error.code).toBe('invalid_status_transition');
      expect(body.error.message).toBe('Invalid status transition');
    });

    it('returns 500 for unexpected errors', async () => {
      activateMock.execute.mockRejectedValue(new Error('unexpected'));

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/actions/action-1/activate', {
          method: 'POST',
        })
      );

      expect(res.status).toBe(500);
    });
  });

  describe('handleComplete', () => {
    it('returns 200 with completed action DTO', async () => {
      const completedDto = { ...ACTION_DTO, status: 'done' as const };
      completeMock.execute.mockResolvedValue({ ok: true, data: completedDto });

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/actions/action-1/complete', {
          method: 'POST',
        })
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(completedDto);
    });

    it('returns 409 for invalid_status_transition', async () => {
      completeMock.execute.mockResolvedValue({ ok: false, kind: 'invalid_status_transition' });

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/actions/action-1/complete', {
          method: 'POST',
        })
      );

      expect(res.status).toBe(409);
    });

    it('returns 500 for unexpected errors', async () => {
      completeMock.execute.mockRejectedValue(new Error('unexpected'));

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/actions/action-1/complete', {
          method: 'POST',
        })
      );

      expect(res.status).toBe(500);
    });
  });

  describe('handleListActions', () => {
    it('returns 200 with an array of action DTOs', async () => {
      listMock.execute.mockResolvedValue([ACTION_DTO]);

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/actions', { method: 'GET' })
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([ACTION_DTO]);
      expect(listMock.execute).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
      });
    });

    it('returns 500 with error envelope when the use case throws', async () => {
      listMock.execute.mockRejectedValue(new Error('unexpected'));

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/actions', { method: 'GET' })
      );

      expect(res.status).toBe(500);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('service_error');
      expect(typeof body.error.message).toBe('string');
    });
  });
});
