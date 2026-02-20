import { Hono } from 'hono/tiny';

import { appPartialNotFound } from './AppPartialHandlers';

describe('AppPartialHandlers', () => {
  const app = new Hono();
  app.all('/app/_/*', appPartialNotFound);

  describe('appPartialNotFound', () => {
    it('returns 404 JSON with error message', async () => {
      const req = new Request('https://example.com/app/_/unknown');

      const res = await app.fetch(req);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Not found' });
    });
  });
});
