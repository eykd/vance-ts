import { describe, expect, it, vi } from 'vitest';

import { AppPageHandlers } from './AppPageHandlers.js';

/**
 * Creates a stub use case with a vi.fn for execute.
 *
 * @returns An object with an `execute` vi.fn stub.
 */
function makeUseCaseMock(): { execute: ReturnType<typeof vi.fn> } {
  return { execute: vi.fn() };
}

/**
 * Creates a minimal Hono-like context with get() returning workspaceId.
 *
 * @param workspaceId - The workspace ID to return from c.get('workspaceId').
 * @returns A minimal context object with get and html stubs.
 */
function makeContext(workspaceId = 'ws-1'): {
  get: ReturnType<typeof vi.fn>;
  html: ReturnType<typeof vi.fn>;
} {
  return {
    get: vi.fn((key: string) => {
      if (key === 'workspaceId') return workspaceId;
      return undefined;
    }),
    html: vi.fn(
      (body: string) =>
        new Response(body, {
          headers: { 'Content-Type': 'text/html; charset=UTF-8' },
        })
    ),
  };
}

describe('AppPageHandlers', () => {
  describe('handleGetDashboard', () => {
    it('returns HTML containing the dashboard with inbox and action counts', async () => {
      const listInbox = makeUseCaseMock();
      listInbox.execute.mockResolvedValue([{ id: '1' }, { id: '2' }]);

      const listActions = makeUseCaseMock();
      listActions.execute.mockResolvedValue([{ id: '3' }]);

      const handlers = new AppPageHandlers(listInbox, listActions);
      const c = makeContext('ws-1');

      await handlers.handleGetDashboard(c as never);

      expect(listInbox.execute).toHaveBeenCalledWith({ workspaceId: 'ws-1' });
      expect(listActions.execute).toHaveBeenCalledWith({ workspaceId: 'ws-1' });
      expect(c.html).toHaveBeenCalledOnce();

      const htmlArg = c.html.mock.calls[0]![0] as string;
      expect(htmlArg).toContain('Inbox: 2');
      expect(htmlArg).toContain('Actions: 1');
    });
  });
});
