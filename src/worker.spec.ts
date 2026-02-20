/* eslint-disable no-undef -- Fetcher is a @cloudflare/workers-types ambient global */
import type { Env } from './infrastructure/env';
import app from './worker';

/**
 * Builds a mock Env with a spy for ASSETS.fetch.
 *
 * @param assetResponse - Optional Response to return from ASSETS.fetch.
 * @returns A mock Env with ASSETS.fetch as a Jest spy.
 */
function mockEnv(assetResponse?: Response): Env {
  return {
    ASSETS: {
      fetch: jest.fn().mockResolvedValue(assetResponse ?? new Response('static')),
      connect: jest.fn(),
    } as unknown as Fetcher,
  };
}

describe('Worker', () => {
  describe('GET /api/health', () => {
    it('returns 200 JSON with status ok', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/health');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ status: 'ok' });
    });

    it('includes security headers', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/health');

      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('GET /api/nonexistent', () => {
    it('returns 404 JSON', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/nonexistent');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Not found' });
    });

    it('includes security headers on 404', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/nonexistent');

      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('POST /app/_/nonexistent', () => {
    it('returns 404 JSON', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/_/nonexistent', { method: 'POST' });

      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Not found' });
    });

    it('includes security headers on 404', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/_/nonexistent', { method: 'POST' });

      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('static asset fallthrough', () => {
    it('delegates non-API/app paths to env.ASSETS.fetch', async () => {
      const assetResponse = new Response('<html>homepage</html>', {
        headers: { 'Content-Type': 'text/html' },
      });
      const fetchSpy = jest.fn().mockResolvedValue(assetResponse);
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
