import { Hono } from 'hono/tiny';
import { describe, expect, it, vi } from 'vitest';

import type { Env } from '../../shared/env';

import { staticAssetFallthrough } from './StaticAssetHandler';

describe('StaticAssetHandler', () => {
  describe('staticAssetFallthrough', () => {
    it('delegates to env.ASSETS.fetch and returns its response', async () => {
      const assetResponse = new Response('<html>page</html>', {
        headers: { 'Content-Type': 'text/html' },
      });
      const fetchSpy = vi.fn().mockResolvedValue(assetResponse);

      const app = new Hono<{ Bindings: Env }>();
      app.all('*', staticAssetFallthrough);

      const env: Env = {
        ASSETS: {
          fetch: fetchSpy,
          connect: vi.fn(),
        } as unknown as Fetcher,
        DB: {} as D1Database,
        BETTER_AUTH_URL: 'http://localhost',
        BETTER_AUTH_SECRET: 'a'.repeat(32),
        RATE_LIMIT: {} as KVNamespace,
      };
      const req = new Request('https://example.com/about');

      const res = await app.fetch(req, env);

      expect(fetchSpy).toHaveBeenCalledWith(req);
      expect(res).toBe(assetResponse);
    });
  });
});
