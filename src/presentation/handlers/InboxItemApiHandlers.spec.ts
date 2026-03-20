import { Hono } from 'hono/tiny';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InboxItemDto } from '../../application/dto/InboxItemDto.js';
import type { CaptureInboxItemUseCase } from '../../application/use-cases/CaptureInboxItemUseCase.js';
import type { ListInboxItemsUseCase } from '../../application/use-cases/ListInboxItemsUseCase.js';

import { createInboxItemApiHandlers } from './InboxItemApiHandlers.js';

/**
 * Creates a minimal CaptureInboxItemUseCase mock.
 *
 * @returns An object with a vi.fn() stub for the execute method.
 */
function makeCaptureUseCaseMock(): { execute: ReturnType<typeof vi.fn> } {
  return { execute: vi.fn() };
}

/**
 * Creates a minimal ListInboxItemsUseCase mock.
 *
 * @returns An object with a vi.fn() stub for the execute method.
 */
function makeListUseCaseMock(): { execute: ReturnType<typeof vi.fn> } {
  return { execute: vi.fn() };
}

/** Sample inbox item DTO fixture. */
const INBOX_ITEM_DTO: InboxItemDto = {
  id: 'inbox-1',
  title: 'Buy milk',
  description: null,
  status: 'inbox',
  clarifiedIntoType: null,
  clarifiedIntoId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('createInboxItemApiHandlers', () => {
  let captureUseCaseMock: ReturnType<typeof makeCaptureUseCaseMock>;
  let listUseCaseMock: ReturnType<typeof makeListUseCaseMock>;

  beforeEach(() => {
    captureUseCaseMock = makeCaptureUseCaseMock();
    listUseCaseMock = makeListUseCaseMock();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Builds a test app with a fake auth middleware that sets workspaceId and actorId.
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
    const handlers = createInboxItemApiHandlers(
      captureUseCaseMock as unknown as CaptureInboxItemUseCase,
      listUseCaseMock as unknown as ListInboxItemsUseCase
    );
    app.post('/api/v1/inbox', (c) => handlers.handleCaptureInboxItem(c as never));
    app.get('/api/v1/inbox', (c) => handlers.handleListInboxItems(c as never));
    return app;
  }

  describe('handleCaptureInboxItem', () => {
    it('returns 422 with error envelope when use case returns a domain error', async () => {
      captureUseCaseMock.execute.mockResolvedValue({
        ok: false,
        kind: 'domain_error',
        code: 'title_required',
      });

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'valid title' }),
        })
      );

      expect(res.status).toBe(422);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('title_required');
      expect(body.error.message).toBe('domain_error');
    });

    it('returns 400 when title is missing from body', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('validation_error');
    });

    it('returns 400 when title is not a string', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 123 }),
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('validation_error');
    });

    it('returns 400 when title is an empty string', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '' }),
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('validation_error');
    });

    it('returns 400 when title is whitespace only', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '   ' }),
        })
      );

      expect(res.status).toBe(400);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('validation_error');
    });

    it('returns 400 when body is malformed JSON', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox', {
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
        new Request('https://example.com/api/v1/inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{not valid json',
        })
      );

      const text = await res.text();
      expect(text).not.toContain('stack');
      expect(text).not.toContain('at ');
    });

    it('returns 201 with the created inbox item DTO', async () => {
      captureUseCaseMock.execute.mockResolvedValue({ ok: true, data: INBOX_ITEM_DTO });

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Buy milk' }),
        })
      );

      expect(res.status).toBe(201);
      expect(await res.json()).toEqual(INBOX_ITEM_DTO);
      expect(captureUseCaseMock.execute).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
        title: 'Buy milk',
        actorId: 'actor-1',
      });
    });
  });

  describe('handleListInboxItems', () => {
    it('returns 200 with an array of inbox item DTOs', async () => {
      listUseCaseMock.execute.mockResolvedValue([INBOX_ITEM_DTO]);

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox', { method: 'GET' })
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([INBOX_ITEM_DTO]);
      expect(listUseCaseMock.execute).toHaveBeenCalledWith({
        workspaceId: 'ws-1',
      });
    });

    it('returns 500 with error envelope when the use case throws', async () => {
      listUseCaseMock.execute.mockRejectedValue(new Error('unexpected'));

      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/api/v1/inbox', { method: 'GET' })
      );

      expect(res.status).toBe(500);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('service_error');
      expect(typeof body.error.message).toBe('string');
    });
  });
});
