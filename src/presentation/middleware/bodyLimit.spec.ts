import { Hono } from 'hono/tiny';
import { describe, expect, it } from 'vitest';

import { createBodyLimitMiddleware } from './bodyLimit.js';

/** Default max body size used by the middleware (1 MB). */
const ONE_MB = 1_048_576;

/**
 * Builds a test Hono app with the body limit middleware and a simple echo route.
 *
 * @param maxBytes - Optional override for the maximum body size.
 * @returns A configured Hono test application.
 */
function makeTestApp(maxBytes?: number): Hono {
  const app = new Hono();
  app.use('*', createBodyLimitMiddleware(maxBytes));
  app.post('/test', (c) => c.json({ ok: true }));
  app.put('/test', (c) => c.json({ ok: true }));
  app.patch('/test', (c) => c.json({ ok: true }));
  app.get('/test', (c) => c.json({ ok: true }));
  app.delete('/test', (c) => c.json({ ok: true }));
  return app;
}

describe('createBodyLimitMiddleware', () => {
  describe('skips methods without a body', () => {
    it('passes GET requests through', async () => {
      const app = makeTestApp();
      const res = await app.fetch(new Request('https://example.com/test'));

      expect(res.status).toBe(200);
    });

    it('passes HEAD requests through', async () => {
      const app = makeTestApp();
      const res = await app.fetch(new Request('https://example.com/test', { method: 'HEAD' }));

      expect(res.status).toBe(200);
    });

    it('passes DELETE requests through', async () => {
      const app = makeTestApp();
      const res = await app.fetch(new Request('https://example.com/test', { method: 'DELETE' }));

      expect(res.status).toBe(200);
    });
  });

  describe('rejects oversized Content-Length on POST', () => {
    it('returns 413 when Content-Length exceeds the default limit', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/test', {
          method: 'POST',
          headers: { 'Content-Length': String(ONE_MB + 1) },
          body: 'x',
        })
      );

      expect(res.status).toBe(413);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('content_too_large');
    });

    it('returns 413 when Content-Length is extremely large', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/test', {
          method: 'POST',
          headers: { 'Content-Length': '999999999' },
          body: 'x',
        })
      );

      expect(res.status).toBe(413);
    });
  });

  describe('rejects oversized Content-Length on PUT and PATCH', () => {
    it('returns 413 for PUT with oversized Content-Length', async () => {
      const app = makeTestApp(100);
      const res = await app.fetch(
        new Request('https://example.com/test', {
          method: 'PUT',
          headers: { 'Content-Length': '101' },
          body: 'x',
        })
      );

      expect(res.status).toBe(413);
    });

    it('returns 413 for PATCH with oversized Content-Length', async () => {
      const app = makeTestApp(100);
      const res = await app.fetch(
        new Request('https://example.com/test', {
          method: 'PATCH',
          headers: { 'Content-Length': '101' },
          body: 'x',
        })
      );

      expect(res.status).toBe(413);
    });
  });

  describe('allows requests within the limit', () => {
    it('passes POST with Content-Length exactly at the limit', async () => {
      const app = makeTestApp(100);
      const res = await app.fetch(
        new Request('https://example.com/test', {
          method: 'POST',
          headers: { 'Content-Length': '100', 'Content-Type': 'text/plain' },
          body: 'x'.repeat(100),
        })
      );

      expect(res.status).toBe(200);
    });

    it('passes POST with Content-Length below the limit', async () => {
      const app = makeTestApp(100);
      const res = await app.fetch(
        new Request('https://example.com/test', {
          method: 'POST',
          headers: { 'Content-Length': '50', 'Content-Type': 'text/plain' },
          body: 'x'.repeat(50),
        })
      );

      expect(res.status).toBe(200);
    });

    it('passes POST with no Content-Length header', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request('https://example.com/test', {
          method: 'POST',
          body: 'small body',
        })
      );

      expect(res.status).toBe(200);
    });
  });

  describe('custom limit', () => {
    it('respects a custom byte limit', async () => {
      const app = makeTestApp(50);
      const res = await app.fetch(
        new Request('https://example.com/test', {
          method: 'POST',
          headers: { 'Content-Length': '51' },
          body: 'x',
        })
      );

      expect(res.status).toBe(413);
    });
  });

  describe('edge cases', () => {
    it('ignores non-numeric Content-Length values', async () => {
      const app = makeTestApp(100);
      const res = await app.fetch(
        new Request('https://example.com/test', {
          method: 'POST',
          headers: { 'Content-Length': 'abc' },
          body: 'x',
        })
      );

      expect(res.status).toBe(200);
    });

    it('ignores negative Content-Length values', async () => {
      const app = makeTestApp(100);
      const res = await app.fetch(
        new Request('https://example.com/test', {
          method: 'POST',
          headers: { 'Content-Length': '-1' },
          body: 'x',
        })
      );

      expect(res.status).toBe(200);
    });
  });
});
