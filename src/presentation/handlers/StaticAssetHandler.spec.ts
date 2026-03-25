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
      expect(await res.text()).toBe('<html>page</html>');
    });

    it('serves 404 page HTML when ASSETS returns empty 404', async () => {
      const emptyNotFound = new Response(null, {
        status: 404,
        headers: { 'Content-Length': '0' },
      });
      const notFoundPage = new Response('<html>404 page</html>', {
        headers: { 'Content-Type': 'text/html' },
      });
      const fetchSpy = vi
        .fn()
        .mockResolvedValueOnce(emptyNotFound)
        .mockResolvedValueOnce(notFoundPage);

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
      const req = new Request('https://example.com/nonexistent');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(await res.text()).toBe('<html>404 page</html>');
      expect(res.headers.get('Content-Type')).toContain('text/html');
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      const secondCallArg = fetchSpy.mock.calls[1]![0] as Request;
      expect(new URL(secondCallArg.url).pathname).toBe('/404.html');
    });

    it('returns original 404 response when 404 page fetch also fails', async () => {
      const emptyNotFound = new Response(null, {
        status: 404,
        headers: { 'Content-Length': '0' },
      });
      const alsoNotFound = new Response(null, { status: 404 });
      const fetchSpy = vi
        .fn()
        .mockResolvedValueOnce(emptyNotFound)
        .mockResolvedValueOnce(alsoNotFound);

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
      const req = new Request('https://example.com/nonexistent');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(await res.text()).toBe('');
    });

    it('passes through non-empty 404 response from ASSETS unchanged', async () => {
      const notFoundWithContent = new Response('<html>custom 404</html>', {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
      const fetchSpy = vi.fn().mockResolvedValue(notFoundWithContent);

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
      const req = new Request('https://example.com/nonexistent');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(await res.text()).toBe('<html>custom 404</html>');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
