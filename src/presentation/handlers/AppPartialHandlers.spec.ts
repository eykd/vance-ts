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
      expect(await res.json()).toEqual({ error: 'Not found' });
    });
  });

  describe('handleCaptureInbox', () => {
    it('calls CaptureInboxItemUseCase and returns HTML partial with captured title', async () => {
      const captureInbox = makeUseCaseMock();
      captureInbox.execute.mockResolvedValue({
        id: 'inbox-1',
        title: 'Buy milk',
        status: 'pending',
      });

      const handlers = new AppPartialHandlers(captureInbox);

      const app = new Hono();
      app.post('/app/_/inbox', async (c) => handlers.handleCaptureInbox(c));

      const formData = new FormData();
      formData.set('title', 'Buy milk');

      const req = new Request('https://example.com/app/_/inbox', {
        method: 'POST',
        body: formData,
        headers: { 'HX-Request': 'true' },
      });
      // Simulate workspaceId middleware
      app.use('*', async (c, next) => {
        c.set('workspaceId', 'ws-1');
        await next();
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
  });
});
