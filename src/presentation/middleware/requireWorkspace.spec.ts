import { Hono } from 'hono/tiny';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActorRepository } from '../../domain/interfaces/ActorRepository.js';
import type { WorkspaceRepository } from '../../domain/interfaces/WorkspaceRepository.js';

import { createRequireWorkspace } from './requireWorkspace.js';

/** Fixed workspace fixture. */
const TEST_WORKSPACE = { id: 'ws-123', userId: 'user-1' } as const;

/** Fixed actor fixture. */
const TEST_ACTOR = { id: 'actor-456', workspaceId: 'ws-123', type: 'human' as const } as const;

/** Authenticated user object placed on c.var by requireAuth (simulated via initial context set). */
const TEST_USER = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'User One',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
} as const;

/**
 * Creates mock implementations of WorkspaceRepository and ActorRepository.
 *
 * @returns Object with vi.fn() stubs for each required method.
 */
function makeMocks(): {
  workspaceRepo: { getByUserId: ReturnType<typeof vi.fn> };
  actorRepo: { getHumanActorByWorkspaceId: ReturnType<typeof vi.fn> };
} {
  return {
    workspaceRepo: { getByUserId: vi.fn() },
    actorRepo: { getHumanActorByWorkspaceId: vi.fn() },
  };
}

describe('createRequireWorkspace', () => {
  let mocks: ReturnType<typeof makeMocks>;

  beforeEach(() => {
    mocks = makeMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Builds a minimal Hono app with the requireWorkspace middleware applied and
   * one protected GET route. Pre-seeds `c.var.user` with TEST_USER to simulate
   * requireAuth having already run.
   *
   * @returns A Hono app instance.
   */
  function makeTestApp(): Hono {
    const app = new Hono();
    // Simulate requireAuth having set c.var.user
    app.use('*', async (c, next) => {
      c.set('user' as never, TEST_USER);
      await next();
    });
    const middleware = createRequireWorkspace(
      mocks.workspaceRepo as unknown as WorkspaceRepository,
      mocks.actorRepo as unknown as ActorRepository,
    );
    app.use('*', middleware);
    app.get('/protected', (c) => c.text('protected content'));
    return app;
  }

  it('returns 503 JSON when workspace is not found', async () => {
    mocks.workspaceRepo.getByUserId.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(503);
    const body = await res.json();
    expect((body as { error: { code: string } }).error.code).toBe('provisioning_failed');
  });

  it('returns 503 JSON when actor is not found (security: must not fall through with empty actorId)', async () => {
    mocks.workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    mocks.actorRepo.getHumanActorByWorkspaceId.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(503);
    const body = await res.json();
    expect((body as { error: { code: string } }).error.code).toBe('provisioning_failed');
  });

  it('returns HX-Redirect on HTMX request when workspace is not found', async () => {
    mocks.workspaceRepo.getByUserId.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(
      new Request('https://example.com/protected', {
        headers: { 'HX-Request': 'true' },
      }),
    );

    expect(res.status).toBe(503);
    expect(res.headers.get('HX-Redirect')).toBe('/auth/sign-in');
  });

  it('returns HX-Redirect on HTMX request when actor is not found', async () => {
    mocks.workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    mocks.actorRepo.getHumanActorByWorkspaceId.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(
      new Request('https://example.com/protected', {
        headers: { 'HX-Request': 'true' },
      }),
    );

    expect(res.status).toBe(503);
    expect(res.headers.get('HX-Redirect')).toBe('/auth/sign-in');
  });

  it('passes through to next handler when workspace and actor are found', async () => {
    mocks.workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    mocks.actorRepo.getHumanActorByWorkspaceId.mockResolvedValue(TEST_ACTOR);

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('protected content');
  });

  it('sets workspaceId and actorId on context when workspace and actor are found', async () => {
    mocks.workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    mocks.actorRepo.getHumanActorByWorkspaceId.mockResolvedValue(TEST_ACTOR);

    let capturedWorkspaceId: unknown;
    let capturedActorId: unknown;

    const app = new Hono();
    app.use('*', async (c, next) => {
      c.set('user' as never, TEST_USER);
      await next();
    });
    const middleware = createRequireWorkspace(
      mocks.workspaceRepo as unknown as WorkspaceRepository,
      mocks.actorRepo as unknown as ActorRepository,
    );
    app.use('*', middleware);
    app.get('/protected', (c) => {
      capturedWorkspaceId = c.get('workspaceId' as never);
      capturedActorId = c.get('actorId' as never);
      return c.text('ok');
    });

    await app.fetch(new Request('https://example.com/protected'));

    expect(capturedWorkspaceId).toBe('ws-123');
    expect(capturedActorId).toBe('actor-456');
  });

  it('queries workspaceRepo with the user ID from c.var.user', async () => {
    mocks.workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    mocks.actorRepo.getHumanActorByWorkspaceId.mockResolvedValue(TEST_ACTOR);

    const app = makeTestApp();
    await app.fetch(new Request('https://example.com/protected'));

    expect(mocks.workspaceRepo.getByUserId).toHaveBeenCalledWith('user-1');
  });

  it('queries actorRepo with the workspace ID from the resolved workspace', async () => {
    mocks.workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    mocks.actorRepo.getHumanActorByWorkspaceId.mockResolvedValue(TEST_ACTOR);

    const app = makeTestApp();
    await app.fetch(new Request('https://example.com/protected'));

    expect(mocks.actorRepo.getHumanActorByWorkspaceId).toHaveBeenCalledWith('ws-123');
  });

  it('does not call actorRepo when workspace is not found', async () => {
    mocks.workspaceRepo.getByUserId.mockResolvedValue(null);

    const app = makeTestApp();
    await app.fetch(new Request('https://example.com/protected'));

    expect(mocks.actorRepo.getHumanActorByWorkspaceId).not.toHaveBeenCalled();
  });
});
