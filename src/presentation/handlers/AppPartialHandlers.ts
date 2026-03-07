import type { Context } from 'hono';

/** Use case contract expected by AppPartialHandlers. */
interface CaptureInboxUseCase {
  /** Executes the capture inbox item use case. */
  execute(input: {
    workspaceId: string;
    title: string;
  }): Promise<{ id: string; title: string; status: string }>;
}

/**
 * Handlers for HTMX partial responses under /app/_/.
 */
export class AppPartialHandlers {
  private readonly captureInbox: CaptureInboxUseCase;

  /**
   * Creates an AppPartialHandlers instance.
   *
   * @param captureInbox - Use case for capturing inbox items.
   */
  constructor(captureInbox: CaptureInboxUseCase) {
    this.captureInbox = captureInbox;
  }

  /**
   * Handles POST to capture an inbox item, returning an HTML partial.
   *
   * @param c - Hono context with workspaceId set by middleware.
   * @returns HTML partial response containing the captured item.
   */
  async handleCaptureInbox(c: Context): Promise<Response> {
    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const workspaceId = c.get('workspaceId') as string;
    const result = await this.captureInbox.execute({ workspaceId, title });
    return c.html(`<li>${result.title}</li>`);
  }
}

/**
 * Returns a 404 JSON response for unmatched app partial routes.
 *
 * @param c - Hono context
 * @returns JSON response with 404 status
 */
export function appPartialNotFound(c: Context): Response {
  return c.json({ error: 'Not found' }, 404);
}
