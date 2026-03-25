import { describe, expect, it, vi } from 'vitest';

import { SECURITY_HEADERS } from '../utils/securityHeaders';

import { htmxErrorFragment, serveErrorPage } from './ErrorPageHandlers';

/**
 * Creates a mock Fetcher whose fetch spy uses the given implementation.
 * Returns both the Fetcher and the spy so callers can inspect calls
 * without triggering the unbound-method lint rule on `assets.fetch`.
 *
 * @param fetchImpl - The mock implementation for fetch
 * @returns An object with the mock Fetcher and the fetch spy
 */
function createMockAssets(fetchImpl: (...args: unknown[]) => Promise<Response>): {
  assets: Fetcher;
  fetchSpy: ReturnType<typeof vi.fn>;
} {
  const fetchSpy = vi.fn(fetchImpl);
  const assets = {
    fetch: fetchSpy,
    connect: vi.fn(),
  } as unknown as Fetcher;
  return { assets, fetchSpy };
}

/**
 * Asserts that all security headers are present on the response.
 *
 * @param response - The response to check
 */
function expectSecurityHeaders(response: Response): void {
  for (const [name, value] of SECURITY_HEADERS) {
    expect(response.headers.get(name)).toBe(value);
  }
}

/**
 * Returns a resolved promise with an ok Response.
 *
 * @param body - The response body text
 * @returns A promise resolving to a 200 Response
 */
function okResponse(body = 'ok'): Promise<Response> {
  return Promise.resolve(new Response(body, { status: 200 }));
}

/**
 * Returns a rejected promise simulating an ASSETS failure.
 *
 * @param message - The error message
 * @returns A rejected promise with the given error
 */
function throwingFetch(message = 'fail'): Promise<Response> {
  return Promise.reject(new Error(message));
}

describe('ErrorPageHandlers', () => {
  describe('serveErrorPage', () => {
    it('returns ASSETS content with correct status code and Content-Type for 500', async () => {
      const assetBody = '<html><body>500 Error</body></html>';
      const { assets } = createMockAssets(() =>
        Promise.resolve(new Response(assetBody, { status: 200 }))
      );

      const response = await serveErrorPage(assets, 500);

      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
      expect(await response.text()).toBe(assetBody);
    });

    it('fetches /500/ from ASSETS for status codes >= 500', async () => {
      const { assets, fetchSpy } = createMockAssets(() => okResponse());

      await serveErrorPage(assets, 500);

      const calledRequest = fetchSpy.mock.calls[0]?.[0] as Request;
      expect(new URL(calledRequest.url).pathname).toBe('/500/');
    });

    it('fetches /404.html from ASSETS for status codes < 500', async () => {
      const { assets, fetchSpy } = createMockAssets(() => okResponse());

      await serveErrorPage(assets, 404);

      const calledRequest = fetchSpy.mock.calls[0]?.[0] as Request;
      expect(new URL(calledRequest.url).pathname).toBe('/404.html');
    });

    it('uses synthetic origin to avoid coupling to request URL', async () => {
      const { assets, fetchSpy } = createMockAssets(() => okResponse());

      await serveErrorPage(assets, 500);

      const calledRequest = fetchSpy.mock.calls[0]?.[0] as Request;
      expect(new URL(calledRequest.url).origin).toBe('https://worker.internal');
    });

    it('sends Accept: text/html header without cache-validation headers', async () => {
      const { assets, fetchSpy } = createMockAssets(() => okResponse());

      await serveErrorPage(assets, 500);

      const calledRequest = fetchSpy.mock.calls[0]?.[0] as Request;
      expect(calledRequest.headers.get('Accept')).toBe('text/html');
      expect(calledRequest.headers.get('If-Modified-Since')).toBeNull();
      expect(calledRequest.headers.get('If-None-Match')).toBeNull();
    });

    it('applies security headers to ASSETS response', async () => {
      const { assets } = createMockAssets(() => okResponse());

      const response = await serveErrorPage(assets, 500);

      expectSecurityHeaders(response);
    });

    it('sets Cache-Control: no-store, no-cache on ASSETS response', async () => {
      const { assets } = createMockAssets(() => okResponse());

      const response = await serveErrorPage(assets, 500);

      expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache');
    });

    it('falls back to inline HTML when ASSETS.fetch() throws', async () => {
      const { assets } = createMockAssets(() => throwingFetch('subrequest limit exceeded'));

      const response = await serveErrorPage(assets, 500);

      expect(response.status).toBe(500);
      expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
      const body = await response.text();
      expect(body).toContain('<!DOCTYPE html>');
      expect(body).toContain('lang="en"');
      expect(body).toContain('Server Error');
    });

    it('applies security headers to fallback response', async () => {
      const { assets } = createMockAssets(() => throwingFetch());

      const response = await serveErrorPage(assets, 500);

      expectSecurityHeaders(response);
    });

    it('sets Cache-Control on fallback response', async () => {
      const { assets } = createMockAssets(() => throwingFetch());

      const response = await serveErrorPage(assets, 500);

      expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache');
    });

    it('falls back to inline HTML when ASSETS returns non-ok response', async () => {
      const { assets } = createMockAssets(() =>
        Promise.resolve(new Response('not found', { status: 404 }))
      );

      const response = await serveErrorPage(assets, 500);

      expect(response.status).toBe(500);
      const body = await response.text();
      expect(body).toContain('<!DOCTYPE html>');
      expect(body).toContain('Server Error');
    });

    it('fallback HTML includes viewport meta tag', async () => {
      const { assets } = createMockAssets(() => throwingFetch());

      const response = await serveErrorPage(assets, 500);
      const body = await response.text();

      expect(body).toContain('<meta name="viewport" content="width=device-width,initial-scale=1">');
    });

    it('fallback HTML sanitizes status code with Math.floor', async () => {
      const { assets } = createMockAssets(() => throwingFetch());

      const response = await serveErrorPage(assets, 500.7);
      const body = await response.text();

      expect(body).toContain('500');
      expect(body).not.toContain('500.7');
    });

    it('fallback HTML shows Not Found for status codes < 500', async () => {
      const { assets } = createMockAssets(() => throwingFetch());

      const response = await serveErrorPage(assets, 404);
      const body = await response.text();

      expect(body).toContain('Not Found');
      expect(body).toContain('could not be found');
    });

    it('fallback HTML does not expose internal details (FR-005)', async () => {
      const { assets } = createMockAssets(() => throwingFetch('secret database connection string'));

      const response = await serveErrorPage(assets, 500);
      const body = await response.text();

      expect(body).not.toContain('secret');
      expect(body).not.toContain('database');
      expect(body).not.toContain('connection');
    });

    it('fallback HTML includes a Go Home link', async () => {
      const { assets } = createMockAssets(() => throwingFetch());

      const response = await serveErrorPage(assets, 500);
      const body = await response.text();

      expect(body).toContain('<a href="/">Go Home</a>');
    });
  });

  describe('htmxErrorFragment', () => {
    it('returns an alert-error div with error message', () => {
      const fragment = htmxErrorFragment();

      expect(fragment).toContain('class="alert alert-error"');
      expect(fragment).toContain('Something went wrong.');
    });

    it('includes a reload link with hx-boost="false"', () => {
      const fragment = htmxErrorFragment();

      expect(fragment).toContain('hx-boost="false"');
      expect(fragment).toContain('Reload page');
      expect(fragment).toContain('href=""');
    });
  });
});
