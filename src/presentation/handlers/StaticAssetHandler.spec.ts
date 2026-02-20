import { Hono } from 'hono/tiny';

import type { Env } from '../../infrastructure/env';

import { staticAssetFallthrough } from './StaticAssetHandler';

describe('StaticAssetHandler', () => {
  describe('staticAssetFallthrough', () => {
    it('delegates to env.ASSETS.fetch and returns its response', async () => {
      const assetResponse = new Response('<html>page</html>', {
        headers: { 'Content-Type': 'text/html' },
      });
      const fetchSpy = jest.fn().mockResolvedValue(assetResponse);

      const app = new Hono<{ Bindings: Env }>();
      app.all('*', staticAssetFallthrough);

      const env: Env = {
        ASSETS: {
          fetch: fetchSpy,
          connect: jest.fn(),
        } as unknown as Fetcher,
      };
      const req = new Request('https://example.com/about');

      const res = await app.fetch(req, env);

      expect(fetchSpy).toHaveBeenCalledWith(req);
      expect(res).toBe(assetResponse);
    });
  });
});
