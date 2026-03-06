/**
 * Tests for createRequireWorkspace middleware.
 *
 * @module
 */

import { Hono } from 'hono/tiny';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActorRepository } from '../../domain/interfaces/ActorRepository.js';
import type { WorkspaceRepository } from '../../domain/interfaces/WorkspaceRepository.js';

import { createRequireWorkspace } from './requireWorkspace.js';

/** Minimal workspace fixture matching the Workspace interface exactly. */
const TEST_WORKSPACE = {
  id: 'ws-1',
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const;

/** Minimal actor fixture matching the Actor interface exactly. */
const TEST_ACTOR = {
  id: 'actor-1',
  workspaceId: 'ws-1',
  userId: 'user-1',
  type: 'human' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
} as const;

/**
 * Creates minimal WorkspaceRepository mock.
 *
 * @returns Mock with vi.fn() stubs.
 */
function makeWorkspaceRepoMock(): {
  getByUserId: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
} {
  return {
    getByUserId: vi.fn(),
    getById: vi.fn(),
    save: vi.fn(),
  };
}

/**
 * Creates minimal ActorRepository mock.
 *
 * @returns Mock with vi.fn() stubs.
 */
function makeActorRepoMock(): {
  getHumanActorByWorkspaceId: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
} {
  return {
    getHumanActorByWorkspaceId: vi.fn(),
    getById: vi.fn(),
    save: vi.fn(),
  };
}

describe('createRequireWorkspace', () => {
  let workspaceRepo: ReturnType<typeof makeWorkspaceRepoMock>;
  let actorRepo: ReturnType<typeof makeActorRepoMock>;

  beforeEach(() => {
    workspaceRepo = makeWorkspaceRepoMock();
    actorRepo = makeActorRepoMock();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Builds a test Hono app with requireWorkspace applied, with a pre-seeded user
   * in context (simulating requireAuth having already run).
   *
   * @returns A Hono app instance.
   */
  function makeTestApp(): Hono {
    const app = new Hono();
    // Simulate requireAuth by setting user in context
    app.use('*', async (c, next) => {
      c.set('user' as never, { id: 'user-1', email: 'test@example.com' });
      await next();
    });
    const middleware = createRequireWorkspace(
      workspaceRepo as unknown as WorkspaceRepository,
      actorRepo as unknown as ActorRepository
    );
    app.use('*', middleware);
    app.get('/protected', (c) => c.json({ ok: true }));
    return app;
  }

  it('returns 503 JSON when workspace is not found', async () => {
    workspaceRepo.getByUserId.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(503);
    const body = await res.json<{ error: { code: string } }>();
    expect(body.error.code).toBe('workspace_not_found');
  });

  it('returns 503 with HX-Redirect when HTMX request and workspace not found', async () => {
    workspaceRepo.getByUserId.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(
      new Request('https://example.com/protected', {
        headers: { 'HX-Request': 'true' },
      })
    );

    expect(res.status).toBe(503);
    expect(res.headers.get('HX-Redirect')).toBe('/auth/sign-in');
  });

  it('returns 503 JSON when actor is not found', async () => {
    workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    actorRepo.getHumanActorByWorkspaceId.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(503);
    const body = await res.json<{ error: { code: string } }>();
    expect(body.error.code).toBe('workspace_not_found');
  });

  it('returns 503 JSON when actor exists but has null id (workspace-35c: !actorId guard must not throw)', async () => {
    // Constraint workspace-35c: the null guard must use !actorId, not actor.id.length === 0.
    // At runtime, D1 can return a row where id is null even if the TypeScript type says string.
    // actor.id.length === 0 throws TypeError for null; !actorId safely returns false.
    workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    actorRepo.getHumanActorByWorkspaceId.mockResolvedValue({
      ...TEST_ACTOR,
      id: null as unknown as string,
    });

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(503);
    const body = await res.json<{ error: { code: string } }>();
    expect(body.error.code).toBe('workspace_not_found');
  });

  it('returns 503 JSON when actor exists but has empty id', async () => {
    workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    actorRepo.getHumanActorByWorkspaceId.mockResolvedValue({ ...TEST_ACTOR, id: '' });

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(503);
    const body = await res.json<{ error: { code: string } }>();
    expect(body.error.code).toBe('workspace_not_found');
  });

  it('sets workspaceId and actorId on context and calls next when both found', async () => {
    workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    actorRepo.getHumanActorByWorkspaceId.mockResolvedValue(TEST_ACTOR);

    let capturedWorkspaceId: unknown;
    let capturedActorId: unknown;

    const app = new Hono();
    app.use('*', async (c, next) => {
      c.set('user' as never, { id: 'user-1', email: 'test@example.com' });
      await next();
    });
    const middleware = createRequireWorkspace(
      workspaceRepo as unknown as WorkspaceRepository,
      actorRepo as unknown as ActorRepository
    );
    app.use('*', middleware);
    app.get('/protected', (c) => {
      capturedWorkspaceId = c.get('workspaceId' as never);
      capturedActorId = c.get('actorId' as never);
      return c.json({ ok: true });
    });

    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(200);
    expect(capturedWorkspaceId).toBe('ws-1');
    expect(capturedActorId).toBe('actor-1');
  });

  it('passes through to next handler when workspace and actor are found', async () => {
    workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    actorRepo.getHumanActorByWorkspaceId.mockResolvedValue(TEST_ACTOR);

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('queries workspace by the user ID from context', async () => {
    workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    actorRepo.getHumanActorByWorkspaceId.mockResolvedValue(TEST_ACTOR);

    const app = makeTestApp();
    await app.fetch(new Request('https://example.com/protected'));

    expect(workspaceRepo.getByUserId).toHaveBeenCalledWith('user-1');
  });

  it('queries actor by the workspace ID', async () => {
    workspaceRepo.getByUserId.mockResolvedValue(TEST_WORKSPACE);
    actorRepo.getHumanActorByWorkspaceId.mockResolvedValue(TEST_ACTOR);

    const app = makeTestApp();
    await app.fetch(new Request('https://example.com/protected'));

    expect(actorRepo.getHumanActorByWorkspaceId).toHaveBeenCalledWith('ws-1');
  });
});
