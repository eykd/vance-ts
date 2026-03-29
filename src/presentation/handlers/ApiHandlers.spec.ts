import { Hono } from 'hono/tiny';

import { apiNotFound, healthCheck } from './ApiHandlers';

describe('ApiHandlers', () => {
  const app = new Hono();
  app.get('/api/health', healthCheck);
  app.all('/api/*', apiNotFound);

  describe('healthCheck', () => {
    it('returns 200 JSON with status ok', async () => {
      const req = new Request('https://example.com/api/health');

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ status: 'ok' });
    });
  });

  describe('apiNotFound', () => {
    it('returns 404 JSON with error message', async () => {
      const req = new Request('https://example.com/api/unknown');

      const res = await app.fetch(req);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: { code: 'not_found', message: 'Not found' } });
    });
  });
});
