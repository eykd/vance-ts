import { Hono } from 'hono/tiny';
import { describe, expect, it } from 'vitest';

import { createOriginCheckMiddleware, isOriginAllowed } from './originCheck.js';

/** Site origin matching BETTER_AUTH_URL for tests. */
const SITE_ORIGIN = 'https://app.example.com';

/**
 * Builds a test Hono app with the origin-check middleware and a simple echo route.
 *
 * @param siteOrigin - The expected origin to validate against.
 * @returns A configured Hono test application.
 */
function makeTestApp(siteOrigin: string = SITE_ORIGIN): Hono {
  const app = new Hono();
  app.use('/api/auth/*', createOriginCheckMiddleware(siteOrigin));
  app.post('/api/auth/sign-up/email', (c) => c.json({ ok: true }));
  app.post('/api/auth/sign-in/email', (c) => c.json({ ok: true }));
  app.get('/api/auth/session', (c) => c.json({ ok: true }));
  return app;
}

describe('createOriginCheckMiddleware', () => {
  describe('blocks cross-origin POST requests', () => {
    it('returns 403 when Origin header is a foreign domain', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request(`${SITE_ORIGIN}/api/auth/sign-up/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: 'http://evil.com' },
          body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
        })
      );

      expect(res.status).toBe(403);
      const body = await res.json<{ error: { code: string } }>();
      expect(body.error.code).toBe('origin_not_allowed');
    });

    it('returns 403 when Origin header is missing on POST', async () => {
      const app = makeTestApp();
      const req = new Request(`${SITE_ORIGIN}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
      });
      // Ensure no Origin header is present (Request constructor may not add it)
      const res = await app.fetch(req);

      expect(res.status).toBe(403);
    });

    it('returns 403 when Origin is null (privacy redirect)', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request(`${SITE_ORIGIN}/api/auth/sign-up/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: 'null' },
          body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
        })
      );

      expect(res.status).toBe(403);
    });
  });

  describe('allows same-origin POST requests', () => {
    it('passes POST with matching Origin header', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request(`${SITE_ORIGIN}/api/auth/sign-up/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: SITE_ORIGIN },
          body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
        })
      );

      expect(res.status).toBe(200);
    });
  });

  describe('skips safe HTTP methods', () => {
    it('passes GET requests without Origin check', async () => {
      const app = makeTestApp();
      const res = await app.fetch(new Request(`${SITE_ORIGIN}/api/auth/session`));

      expect(res.status).toBe(200);
    });

    it('passes GET requests even with a foreign Origin', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request(`${SITE_ORIGIN}/api/auth/session`, {
          headers: { Origin: 'http://evil.com' },
        })
      );

      expect(res.status).toBe(200);
    });
  });

  describe('origin derivation from URL with path', () => {
    it('strips path from the configured URL to derive origin', async () => {
      const app = makeTestApp('https://app.example.com/some/path');
      const res = await app.fetch(
        new Request('https://app.example.com/api/auth/sign-up/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: 'https://app.example.com' },
          body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
        })
      );

      expect(res.status).toBe(200);
    });
  });

  describe('localhost support', () => {
    it('allows matching localhost origin', async () => {
      const app = makeTestApp('http://localhost:8787');
      const res = await app.fetch(
        new Request('http://localhost:8787/api/auth/sign-up/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:8787' },
          body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
        })
      );

      expect(res.status).toBe(200);
    });

    it('rejects non-matching localhost origin', async () => {
      const app = makeTestApp('http://localhost:8787');
      const res = await app.fetch(
        new Request('http://localhost:8787/api/auth/sign-up/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:9999' },
          body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
        })
      );

      expect(res.status).toBe(403);
    });
  });

  describe('response body format', () => {
    it('returns JSON error envelope with origin_not_allowed code', async () => {
      const app = makeTestApp();
      const res = await app.fetch(
        new Request(`${SITE_ORIGIN}/api/auth/sign-up/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: 'http://evil.com' },
          body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
        })
      );

      expect(res.status).toBe(403);
      expect(res.headers.get('Content-Type')).toContain('application/json');
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('origin_not_allowed');
      expect(body.error.message).toBe('Cross-origin requests are not allowed');
    });
  });
});

describe('isOriginAllowed', () => {
  it('returns true for matching origin', () => {
    expect(isOriginAllowed('https://app.example.com', 'https://app.example.com')).toBe(true);
  });

  it('returns false for foreign origin', () => {
    expect(isOriginAllowed('http://evil.com', 'https://app.example.com')).toBe(false);
  });

  it('returns false for undefined origin', () => {
    expect(isOriginAllowed(undefined, 'https://app.example.com')).toBe(false);
  });

  it('returns false for null string origin', () => {
    expect(isOriginAllowed('null', 'https://app.example.com')).toBe(false);
  });

  it('returns false for empty string origin', () => {
    expect(isOriginAllowed('', 'https://app.example.com')).toBe(false);
  });

  it('strips path from site URL before comparing', () => {
    expect(isOriginAllowed('https://app.example.com', 'https://app.example.com/path')).toBe(true);
  });

  it('matches localhost with port', () => {
    expect(isOriginAllowed('http://localhost:8787', 'http://localhost:8787')).toBe(true);
  });

  it('rejects mismatched localhost port', () => {
    expect(isOriginAllowed('http://localhost:9999', 'http://localhost:8787')).toBe(false);
  });
});
