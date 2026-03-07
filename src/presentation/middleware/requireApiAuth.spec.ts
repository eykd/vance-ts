import { Hono } from 'hono/tiny';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthService } from '../../application/ports/AuthService.js';
import type { WorkspaceRepository } from '../../domain/interfaces/WorkspaceRepository.js';

import { createRequireApiAuth } from './requireApiAuth.js';

/**
 * Creates a minimal AuthService mock.
 *
 * @returns An object with vi.fn() stubs for each AuthService method.
 */
function makeAuthServiceMock(): {
  getSession: ReturnType<typeof vi.fn>;
  signIn: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  verifyDummyPassword: ReturnType<typeof vi.fn>;
  hasSession: ReturnType<typeof vi.fn>;
} {
  return {
    getSession: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    verifyDummyPassword: vi.fn().mockResolvedValue(undefined),
    hasSession: vi.fn().mockReturnValue(false),
  };
}

/**
 * Creates a minimal WorkspaceRepository mock.
 *
 * @returns An object with vi.fn() stubs for each WorkspaceRepository method.
 */
function makeWorkspaceRepoMock(): {
  save: ReturnType<typeof vi.fn>;
  getByUserId: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn(),
    getByUserId: vi.fn(),
    getById: vi.fn(),
  };
}

/** Valid session cookie for tests. */
const SESSION_COOKIE = '__Host-better-auth.session_token=test-token';

/** Minimal user fixture. */
const TEST_USER = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test',
  emailVerified: false,
  createdAt: '2026-01-01T00:00:00.000Z',
} as const;

/** Minimal session fixture. */
const TEST_SESSION = {
  id: 'sess-1',
  token: 'test-token',
  userId: 'user-1',
  expiresAt: '2027-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
} as const;

/** Minimal workspace fixture. */
const TEST_WORKSPACE = {
  id: 'ws-1',
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const;

describe('createRequireApiAuth', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let workspaceRepoMock: ReturnType<typeof makeWorkspaceRepoMock>;

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    workspaceRepoMock = makeWorkspaceRepoMock();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Builds a test Hono app with the middleware and a protected route.
   *
   * @returns A configured Hono test application.
   */
  function makeTestApp(): Hono {
    const app = new Hono();
    const middleware = createRequireApiAuth(
      authServiceMock as unknown as AuthService,
      workspaceRepoMock as unknown as WorkspaceRepository
    );
    app.use('*', middleware);
    app.get('/api/v1/test', (c) => c.json({ ok: true }));
    return app;
  }

  it('returns 401 JSON when no session cookie is present', async () => {
    const app = makeTestApp();

    const res = await app.fetch(new Request('https://example.com/api/v1/test'));

    expect(res.status).toBe(401);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    const body = await res.json<{ error: { code: string; message: string } }>();
    expect(body.error.code).toBe('unauthenticated');
  });

  it('returns 503 with Retry-After when AuthService.getSession throws', async () => {
    authServiceMock.getSession.mockRejectedValue(new Error('D1 error'));

    const app = makeTestApp();
    const res = await app.fetch(
      new Request('https://example.com/api/v1/test', {
        headers: { Cookie: SESSION_COOKIE },
      })
    );

    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('30');
    const body = await res.json<{ error: { code: string } }>();
    expect(body.error.code).toBe('service_error');
  });

  it('returns 401 JSON when session is expired or invalid (null return)', async () => {
    authServiceMock.getSession.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(
      new Request('https://example.com/api/v1/test', {
        headers: { Cookie: SESSION_COOKIE },
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json<{ error: { code: string } }>();
    expect(body.error.code).toBe('unauthenticated');
  });

  it('returns 503 with Retry-After when WorkspaceRepository.getByUserId throws', async () => {
    authServiceMock.getSession.mockResolvedValue({ user: TEST_USER, session: TEST_SESSION });
    workspaceRepoMock.getByUserId.mockRejectedValue(new Error('D1 error'));

    const app = makeTestApp();
    const res = await app.fetch(
      new Request('https://example.com/api/v1/test', {
        headers: { Cookie: SESSION_COOKIE },
      })
    );

    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('30');
    const body = await res.json<{ error: { code: string } }>();
    expect(body.error.code).toBe('service_error');
  });

  it('returns 503 when workspace is null (not provisioned)', async () => {
    authServiceMock.getSession.mockResolvedValue({ user: TEST_USER, session: TEST_SESSION });
    workspaceRepoMock.getByUserId.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(
      new Request('https://example.com/api/v1/test', {
        headers: { Cookie: SESSION_COOKIE },
      })
    );

    expect(res.status).toBe(503);
    const body = await res.json<{ error: { code: string } }>();
    expect(body.error.code).toBe('service_error');
  });

  it('calls next and returns 200 on valid session and workspace', async () => {
    authServiceMock.getSession.mockResolvedValue({ user: TEST_USER, session: TEST_SESSION });
    workspaceRepoMock.getByUserId.mockResolvedValue(TEST_WORKSPACE);

    const app = makeTestApp();
    const res = await app.fetch(
      new Request('https://example.com/api/v1/test', {
        headers: { Cookie: SESSION_COOKIE },
      })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('looks up workspace using the authenticated user ID', async () => {
    authServiceMock.getSession.mockResolvedValue({ user: TEST_USER, session: TEST_SESSION });
    workspaceRepoMock.getByUserId.mockResolvedValue(TEST_WORKSPACE);

    const app = makeTestApp();
    await app.fetch(
      new Request('https://example.com/api/v1/test', {
        headers: { Cookie: SESSION_COOKIE },
      })
    );

    expect(workspaceRepoMock.getByUserId).toHaveBeenCalledWith('user-1');
  });

  it('sets user, session, and workspaceId on context for downstream handlers', async () => {
    authServiceMock.getSession.mockResolvedValue({ user: TEST_USER, session: TEST_SESSION });
    workspaceRepoMock.getByUserId.mockResolvedValue(TEST_WORKSPACE);

    let capturedWorkspaceId: unknown;
    let capturedUserId: unknown;

    const app = new Hono();
    const middleware = createRequireApiAuth(
      authServiceMock as unknown as AuthService,
      workspaceRepoMock as unknown as WorkspaceRepository
    );
    app.use('*', middleware);
    app.get('/api/v1/test', (c) => {
      capturedWorkspaceId = c.get('workspaceId' as never);
      capturedUserId = (c.get('user' as never) as { id: string } | undefined)?.id;
      return c.json({ ok: true });
    });

    await app.fetch(
      new Request('https://example.com/api/v1/test', {
        headers: { Cookie: SESSION_COOKIE },
      })
    );

    expect(capturedWorkspaceId).toBe('ws-1');
    expect(capturedUserId).toBe('user-1');
  });
});
