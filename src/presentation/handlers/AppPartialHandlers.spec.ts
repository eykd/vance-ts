import { Hono } from 'hono/tiny';
import { describe, expect, it, vi } from 'vitest';

import { AppPartialHandlers, appPartialNotFound } from './AppPartialHandlers';

/**
 * Creates a stub use case with a vi.fn for execute.
 *
 * @returns An object with an `execute` vi.fn stub.
 */
function makeUseCaseMock(): { execute: ReturnType<typeof vi.fn> } {
  return { execute: vi.fn() };
}

describe('AppPartialHandlers', () => {
  describe('appPartialNotFound', () => {
    const app = new Hono();
    app.all('/app/_/*', appPartialNotFound);

    it('returns 404 JSON with error message', async () => {
      const req = new Request('https://example.com/app/_/unknown');

      const res = await app.fetch(req);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: { code: 'not_found', message: 'Not found' } });
    });
  });

  describe('handleCaptureInbox', () => {
    it('calls CaptureInboxItemUseCase and returns HTML partial with captured title', async () => {
      const captureInbox = makeUseCaseMock();
      captureInbox.execute.mockResolvedValue({
        ok: true,
        data: {
          id: 'inbox-1',
          title: 'Buy milk',
          status: 'pending',
        },
      });

      const handlers = new AppPartialHandlers(
        captureInbox,
        makeUseCaseMock(),
        makeUseCaseMock(),
        makeUseCaseMock()
      );

      const formData = new FormData();
      formData.set('title', 'Buy milk');

      const req = new Request('https://example.com/app/_/inbox', {
        method: 'POST',
        body: formData,
        headers: { 'HX-Request': 'true' },
      });

      const appWithMiddleware = new Hono();
      appWithMiddleware.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        await next();
      });
      appWithMiddleware.post('/app/_/inbox', async (c) => handlers.handleCaptureInbox(c));

      const res = await appWithMiddleware.fetch(req);

      expect(res.status).toBe(200);
      expect(captureInbox.execute).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        title: 'Buy milk',
      });
      const html = await res.text();
      expect(html).toContain('Buy milk');
    });

    it('sets HX-Trigger header with inboxItemCaptured on success', async () => {
      const captureInbox = makeUseCaseMock();
      captureInbox.execute.mockResolvedValue({
        ok: true,
        data: { id: 'inbox-1', title: 'Buy milk', status: 'pending' },
      });

      const handlers = new AppPartialHandlers(
        captureInbox,
        makeUseCaseMock(),
        makeUseCaseMock(),
        makeUseCaseMock()
      );

      const formData = new FormData();
      formData.set('title', 'Buy milk');

      const req = new Request('https://example.com/app/_/inbox', {
        method: 'POST',
        body: formData,
        headers: { 'HX-Request': 'true' },
      });

      const appWithMiddleware = new Hono();
      appWithMiddleware.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        await next();
      });
      appWithMiddleware.post('/app/_/inbox', async (c) => handlers.handleCaptureInbox(c));

      const res = await appWithMiddleware.fetch(req);

      expect(res.headers.get('HX-Trigger')).toBe('inboxItemCaptured');
    });

    it('returns 422 when request has no form body (missing Content-Type)', async () => {
      const captureInbox = makeUseCaseMock();
      const handlers = new AppPartialHandlers(
        captureInbox,
        makeUseCaseMock(),
        makeUseCaseMock(),
        makeUseCaseMock()
      );

      const req = new Request('https://example.com/app/_/inbox', {
        method: 'POST',
      });

      const appWithMiddleware = new Hono();
      appWithMiddleware.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        await next();
      });
      appWithMiddleware.post('/app/_/inbox', async (c) => handlers.handleCaptureInbox(c));

      const res = await appWithMiddleware.fetch(req);

      expect(res.status).toBe(422);
      expect(captureInbox.execute).not.toHaveBeenCalled();
      const html = await res.text();
      expect(html).toContain('Error');
    });

    it('returns 422 when title field is missing from form data', async () => {
      const captureInbox = makeUseCaseMock();
      const handlers = new AppPartialHandlers(
        captureInbox,
        makeUseCaseMock(),
        makeUseCaseMock(),
        makeUseCaseMock()
      );

      const formData = new FormData();

      const req = new Request('https://example.com/app/_/inbox', {
        method: 'POST',
        body: formData,
      });

      const appWithMiddleware = new Hono();
      appWithMiddleware.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        await next();
      });
      appWithMiddleware.post('/app/_/inbox', async (c) => handlers.handleCaptureInbox(c));

      const res = await appWithMiddleware.fetch(req);

      expect(res.status).toBe(422);
      expect(captureInbox.execute).not.toHaveBeenCalled();
      const html = await res.text();
      expect(html).toContain('Error');
    });

    it('does not set HX-Trigger header on failure', async () => {
      const captureInbox = makeUseCaseMock();
      captureInbox.execute.mockResolvedValue({
        ok: false,
        kind: 'validation_error',
      });

      const handlers = new AppPartialHandlers(
        captureInbox,
        makeUseCaseMock(),
        makeUseCaseMock(),
        makeUseCaseMock()
      );

      const formData = new FormData();
      formData.set('title', '');

      const req = new Request('https://example.com/app/_/inbox', {
        method: 'POST',
        body: formData,
        headers: { 'HX-Request': 'true' },
      });

      const appWithMiddleware = new Hono();
      appWithMiddleware.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        await next();
      });
      appWithMiddleware.post('/app/_/inbox', async (c) => handlers.handleCaptureInbox(c));

      const res = await appWithMiddleware.fetch(req);

      expect(res.headers.get('HX-Trigger')).toBeNull();
    });
  });

  describe('handleActivateAction', () => {
    it('calls ActivateActionUseCase and returns HTML partial with activated status', async () => {
      const captureInbox = makeUseCaseMock();
      const clarifyInbox = makeUseCaseMock();
      const activateAction = makeUseCaseMock();
      activateAction.execute.mockResolvedValue({
        ok: true,
        data: {
          id: 'action-1',
          title: 'Buy organic milk',
          status: 'active',
        },
      });

      const handlers = new AppPartialHandlers(
        captureInbox,
        clarifyInbox,
        activateAction,
        makeUseCaseMock()
      );

      const req = new Request('https://example.com/app/_/actions/action-1/activate', {
        method: 'POST',
        headers: { 'HX-Request': 'true' },
      });

      const appWithMiddleware = new Hono();
      appWithMiddleware.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        c.set('actorId', 'actor-1');
        await next();
      });
      appWithMiddleware.post('/app/_/actions/:id/activate', async (c) =>
        handlers.handleActivateAction(c)
      );

      const res = await appWithMiddleware.fetch(req);

      expect(res.status).toBe(200);
      expect(activateAction.execute).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        actionId: 'action-1',
        actorId: 'actor-1',
      });
      const html = await res.text();
      expect(html).toContain('active');
    });
  });

  describe('handleCompleteAction', () => {
    it('calls CompleteActionUseCase and returns HTML partial with done status', async () => {
      const captureInbox = makeUseCaseMock();
      const clarifyInbox = makeUseCaseMock();
      const activateAction = makeUseCaseMock();
      const completeAction = makeUseCaseMock();
      completeAction.execute.mockResolvedValue({
        ok: true,
        data: {
          id: 'action-1',
          title: 'Buy organic milk',
          status: 'done',
        },
      });

      const handlers = new AppPartialHandlers(
        captureInbox,
        clarifyInbox,
        activateAction,
        completeAction
      );

      const req = new Request('https://example.com/app/_/actions/action-1/complete', {
        method: 'POST',
        headers: { 'HX-Request': 'true' },
      });

      const appWithMiddleware = new Hono();
      appWithMiddleware.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        c.set('actorId', 'actor-1');
        await next();
      });
      appWithMiddleware.post('/app/_/actions/:id/complete', async (c) =>
        handlers.handleCompleteAction(c)
      );

      const res = await appWithMiddleware.fetch(req);

      expect(res.status).toBe(200);
      expect(completeAction.execute).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        actionId: 'action-1',
        actorId: 'actor-1',
      });
      const html = await res.text();
      expect(html).toContain('done');
    });
  });

  describe('handleClarifyInbox', () => {
    it('returns error HTML with HX-Retarget and HX-Reswap headers on use case failure', async () => {
      const clarifyInbox = makeUseCaseMock();
      clarifyInbox.execute.mockResolvedValue({
        ok: false,
        kind: 'validation_error',
      });

      const handlers = new AppPartialHandlers(
        makeUseCaseMock(),
        clarifyInbox,
        makeUseCaseMock(),
        makeUseCaseMock()
      );

      const formData = new FormData();
      formData.set('title', '');
      formData.set('areaId', 'area-1');
      formData.set('contextId', 'ctx-1');

      const req = new Request('https://example.com/app/_/inbox/inbox-1/clarify', {
        method: 'POST',
        body: formData,
        headers: { 'HX-Request': 'true' },
      });

      const appWithMiddleware = new Hono();
      appWithMiddleware.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        c.set('actorId', 'actor-1');
        await next();
      });
      appWithMiddleware.post('/app/_/inbox/:id/clarify', async (c) =>
        handlers.handleClarifyInbox(c)
      );

      const res = await appWithMiddleware.fetch(req);

      expect(res.status).toBe(422);
      expect(res.headers.get('HX-Retarget')).toBe('#clarify-error-inbox-1');
      expect(res.headers.get('HX-Reswap')).toBe('innerHTML');
      const html = await res.text();
      expect(html).toContain('alert');
      expect(html).toContain('validation_error');
    });

    it('returns 422 when request has no form body (missing Content-Type)', async () => {
      const clarifyInbox = makeUseCaseMock();
      const handlers = new AppPartialHandlers(
        makeUseCaseMock(),
        clarifyInbox,
        makeUseCaseMock(),
        makeUseCaseMock()
      );

      const req = new Request('https://example.com/app/_/inbox/inbox-1/clarify', {
        method: 'POST',
      });

      const appWithMiddleware = new Hono();
      appWithMiddleware.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        c.set('actorId', 'actor-1');
        await next();
      });
      appWithMiddleware.post('/app/_/inbox/:id/clarify', async (c) =>
        handlers.handleClarifyInbox(c)
      );

      const res = await appWithMiddleware.fetch(req);

      expect(res.status).toBe(422);
      expect(clarifyInbox.execute).not.toHaveBeenCalled();
      const html = await res.text();
      expect(html).toContain('Error');
    });

    it('returns 422 when required form fields are missing', async () => {
      const clarifyInbox = makeUseCaseMock();
      const handlers = new AppPartialHandlers(
        makeUseCaseMock(),
        clarifyInbox,
        makeUseCaseMock(),
        makeUseCaseMock()
      );

      const formData = new FormData();
      formData.set('title', 'Some title');

      const req = new Request('https://example.com/app/_/inbox/inbox-1/clarify', {
        method: 'POST',
        body: formData,
      });

      const appWithMiddleware = new Hono();
      appWithMiddleware.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        c.set('actorId', 'actor-1');
        await next();
      });
      appWithMiddleware.post('/app/_/inbox/:id/clarify', async (c) =>
        handlers.handleClarifyInbox(c)
      );

      const res = await appWithMiddleware.fetch(req);

      expect(res.status).toBe(422);
      expect(clarifyInbox.execute).not.toHaveBeenCalled();
      const html = await res.text();
      expect(html).toContain('Error');
    });

    it('calls ClarifyInboxItemToActionUseCase and returns HTML partial with action title', async () => {
      const captureInbox = makeUseCaseMock();
      const clarifyInbox = makeUseCaseMock();
      clarifyInbox.execute.mockResolvedValue({
        ok: true,
        data: {
          id: 'action-1',
          title: 'Buy organic milk',
          description: null,
          status: 'ready',
          areaId: 'area-1',
          contextId: 'ctx-1',
          createdAt: '2026-03-07T00:00:00.000Z',
          updatedAt: '2026-03-07T00:00:00.000Z',
        },
      });

      const handlers = new AppPartialHandlers(
        captureInbox,
        clarifyInbox,
        makeUseCaseMock(),
        makeUseCaseMock()
      );

      const formData = new FormData();
      formData.set('title', 'Buy organic milk');
      formData.set('areaId', 'area-1');
      formData.set('contextId', 'ctx-1');

      const req = new Request('https://example.com/app/_/inbox/inbox-1/clarify', {
        method: 'POST',
        body: formData,
        headers: { 'HX-Request': 'true' },
      });

      const appWithMiddleware = new Hono();
      appWithMiddleware.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        c.set('actorId', 'actor-1');
        await next();
      });
      appWithMiddleware.post('/app/_/inbox/:id/clarify', async (c) =>
        handlers.handleClarifyInbox(c)
      );

      const res = await appWithMiddleware.fetch(req);

      expect(res.status).toBe(200);
      expect(clarifyInbox.execute).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        inboxItemId: 'inbox-1',
        title: 'Buy organic milk',
        areaId: 'area-1',
        contextId: 'ctx-1',
        actorId: 'actor-1',
      });
      const body = await res.text();
      expect(body).toBe('');
    });
  });
});
