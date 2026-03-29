import { Hono } from 'hono/tiny';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ContextDto } from '../../application/dto/ContextDto.js';
import type { ListContextsUseCase } from '../../application/use-cases/ListContextsUseCase.js';

import { createContextApiHandlers } from './ContextApiHandlers.js';

/**
 * Creates a minimal ListContextsUseCase mock.
 *
 * @returns An object with a vi.fn() stub for the execute method.
 */
function makeUseCaseMock(): { execute: ReturnType<typeof vi.fn> } {
  return { execute: vi.fn() };
}

/** Sample context DTO fixture. */
const CONTEXT_DTO: ContextDto = {
  id: 'ctx-1',
  name: 'computer',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('createContextApiHandlers', () => {
  let useCaseMock: ReturnType<typeof makeUseCaseMock>;

  beforeEach(() => {
    useCaseMock = makeUseCaseMock();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Builds a test app with a fake auth middleware that sets workspaceId.
   *
   * @returns A configured Hono test application.
   */
  function makeTestApp(): Hono {
    const app = new Hono();
    // Simulate requireApiAuth having already run and set workspaceId
    app.use('*', (c, next): Promise<void | Response> => {
      c.set('workspaceId' as never, 'ws-1');
      return next();
    });
    const handlers = createContextApiHandlers(useCaseMock as unknown as ListContextsUseCase);
    app.get('/api/v1/contexts', (c) => handlers.handleListContexts(c as never));
    return app;
  }

  describe('handleListContexts', () => {
    it('returns 200 with an empty array when the workspace has no contexts', async () => {
      useCaseMock.execute.mockResolvedValue([]);

      const app = makeTestApp();
      const res = await app.fetch(new Request('https://example.com/api/v1/contexts'));

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it('returns 200 with context DTOs serialized as JSON', async () => {
      useCaseMock.execute.mockResolvedValue([CONTEXT_DTO]);

      const app = makeTestApp();
      const res = await app.fetch(new Request('https://example.com/api/v1/contexts'));

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([CONTEXT_DTO]);
    });

    it('calls the use case with the workspaceId from context', async () => {
      useCaseMock.execute.mockResolvedValue([]);

      const app = makeTestApp();
      await app.fetch(new Request('https://example.com/api/v1/contexts'));

      expect(useCaseMock.execute).toHaveBeenCalledWith({ workspaceId: 'ws-1' });
    });

    it('returns 500 with error envelope when the use case throws', async () => {
      useCaseMock.execute.mockRejectedValue(new Error('unexpected'));

      const app = makeTestApp();
      const res = await app.fetch(new Request('https://example.com/api/v1/contexts'));

      expect(res.status).toBe(500);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('service_error');
      expect(typeof body.error.message).toBe('string');
    });
  });
});
