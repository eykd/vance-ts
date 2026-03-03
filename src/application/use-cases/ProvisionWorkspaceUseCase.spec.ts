import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActorRepository } from '../../domain/interfaces/ActorRepository.js';
import type { AreaRepository } from '../../domain/interfaces/AreaRepository.js';
import type { AuditEventRepository } from '../../domain/interfaces/AuditEventRepository.js';
import type { ContextRepository } from '../../domain/interfaces/ContextRepository.js';
import type { WorkspaceRepository } from '../../domain/interfaces/WorkspaceRepository.js';

import { ProvisionWorkspaceUseCase } from './ProvisionWorkspaceUseCase.js';

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
    save: vi.fn().mockResolvedValue(undefined),
    getByUserId: vi.fn(),
    getById: vi.fn(),
  };
}

/**
 * Creates a minimal ActorRepository mock.
 *
 * @returns An object with vi.fn() stubs for each ActorRepository method.
 */
function makeActorRepoMock(): {
  save: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  getHumanActorByWorkspaceId: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn(),
    getHumanActorByWorkspaceId: vi.fn(),
  };
}

/**
 * Creates a minimal AreaRepository mock.
 *
 * @returns An object with vi.fn() stubs for each AreaRepository method.
 */
function makeAreaRepoMock(): {
  save: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  getActiveById: ReturnType<typeof vi.fn>;
  listByWorkspaceId: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn(),
    getActiveById: vi.fn(),
    listByWorkspaceId: vi.fn(),
  };
}

/**
 * Creates a minimal ContextRepository mock.
 *
 * @returns An object with vi.fn() stubs for each ContextRepository method.
 */
function makeContextRepoMock(): {
  save: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  listByWorkspaceId: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn(),
    listByWorkspaceId: vi.fn(),
  };
}

/**
 * Creates a minimal AuditEventRepository mock.
 *
 * @returns An object with vi.fn() stubs for each AuditEventRepository method.
 */
function makeAuditRepoMock(): {
  save: ReturnType<typeof vi.fn>;
  saveBatch: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    saveBatch: vi.fn().mockResolvedValue(undefined),
  };
}

describe('ProvisionWorkspaceUseCase', () => {
  let workspaceRepoMock: ReturnType<typeof makeWorkspaceRepoMock>;
  let actorRepoMock: ReturnType<typeof makeActorRepoMock>;
  let areaRepoMock: ReturnType<typeof makeAreaRepoMock>;
  let contextRepoMock: ReturnType<typeof makeContextRepoMock>;
  let auditRepoMock: ReturnType<typeof makeAuditRepoMock>;
  let useCase: ProvisionWorkspaceUseCase;

  beforeEach(() => {
    workspaceRepoMock = makeWorkspaceRepoMock();
    actorRepoMock = makeActorRepoMock();
    areaRepoMock = makeAreaRepoMock();
    contextRepoMock = makeContextRepoMock();
    auditRepoMock = makeAuditRepoMock();
    useCase = new ProvisionWorkspaceUseCase(
      workspaceRepoMock as unknown as WorkspaceRepository,
      actorRepoMock as unknown as ActorRepository,
      areaRepoMock as unknown as AreaRepository,
      contextRepoMock as unknown as ContextRepository,
      auditRepoMock as unknown as AuditEventRepository,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('saves a workspace with the given userId', async () => {
    await useCase.execute({ userId: 'user-1' });

    expect(workspaceRepoMock.save).toHaveBeenCalledOnce();
    const savedWorkspace = workspaceRepoMock.save.mock.calls[0][0];
    expect(savedWorkspace).toMatchObject({ userId: 'user-1' });
    expect(savedWorkspace.id).toBeTypeOf('string');
    expect(savedWorkspace.createdAt).toBeTypeOf('string');
    expect(savedWorkspace.updatedAt).toBeTypeOf('string');
  });

  it('saves a human actor linked to the workspace and user', async () => {
    await useCase.execute({ userId: 'user-1' });

    expect(actorRepoMock.save).toHaveBeenCalledOnce();
    const savedActor = actorRepoMock.save.mock.calls[0][0];
    const savedWorkspace = workspaceRepoMock.save.mock.calls[0][0];
    expect(savedActor).toMatchObject({
      userId: 'user-1',
      workspaceId: savedWorkspace.id,
      type: 'human',
    });
    expect(savedActor.id).toBeTypeOf('string');
    expect(savedActor.createdAt).toBeTypeOf('string');
  });

  it('saves 3 areas: Work, Personal, Admin', async () => {
    await useCase.execute({ userId: 'user-1' });

    expect(areaRepoMock.save).toHaveBeenCalledTimes(3);
    const savedAreaNames = areaRepoMock.save.mock.calls.map(
      (call: [{ name: string }]) => call[0].name,
    );
    expect(savedAreaNames).toContain('Work');
    expect(savedAreaNames).toContain('Personal');
    expect(savedAreaNames).toContain('Admin');
  });

  it('saves areas with active status linked to the workspace', async () => {
    await useCase.execute({ userId: 'user-1' });

    const savedWorkspace = workspaceRepoMock.save.mock.calls[0][0];
    for (const call of areaRepoMock.save.mock.calls) {
      const area = call[0];
      expect(area).toMatchObject({ status: 'active', workspaceId: savedWorkspace.id });
      expect(area.id).toBeTypeOf('string');
      expect(area.createdAt).toBeTypeOf('string');
      expect(area.updatedAt).toBeTypeOf('string');
    }
  });

  it('saves 5 contexts: computer, calls, home, errands, office', async () => {
    await useCase.execute({ userId: 'user-1' });

    expect(contextRepoMock.save).toHaveBeenCalledTimes(5);
    const savedContextNames = contextRepoMock.save.mock.calls.map(
      (call: [{ name: string }]) => call[0].name,
    );
    expect(savedContextNames).toContain('computer');
    expect(savedContextNames).toContain('calls');
    expect(savedContextNames).toContain('home');
    expect(savedContextNames).toContain('errands');
    expect(savedContextNames).toContain('office');
  });

  it('saves contexts linked to the workspace', async () => {
    await useCase.execute({ userId: 'user-1' });

    const savedWorkspace = workspaceRepoMock.save.mock.calls[0][0];
    for (const call of contextRepoMock.save.mock.calls) {
      const context = call[0];
      expect(context).toMatchObject({ workspaceId: savedWorkspace.id });
      expect(context.id).toBeTypeOf('string');
      expect(context.createdAt).toBeTypeOf('string');
    }
  });

  it('calls saveBatch with audit events for every created entity', async () => {
    await useCase.execute({ userId: 'user-1' });

    expect(auditRepoMock.saveBatch).toHaveBeenCalledOnce();
    const events = auditRepoMock.saveBatch.mock.calls[0][0];
    // 1 workspace + 1 actor + 3 areas + 5 contexts = 10 events
    expect(events).toHaveLength(10);
  });

  it('includes a workspace.provisioned audit event', async () => {
    await useCase.execute({ userId: 'user-1' });

    const events = auditRepoMock.saveBatch.mock.calls[0][0];
    const workspaceEvent = events.find(
      (e: { eventType: string }) => e.eventType === 'workspace.provisioned',
    );
    expect(workspaceEvent).toBeDefined();
    expect(workspaceEvent.entityType).toBe('workspace');
  });

  it('includes an actor.created audit event', async () => {
    await useCase.execute({ userId: 'user-1' });

    const events = auditRepoMock.saveBatch.mock.calls[0][0];
    const actorEvent = events.find(
      (e: { eventType: string }) => e.eventType === 'actor.created',
    );
    expect(actorEvent).toBeDefined();
    expect(actorEvent.entityType).toBe('actor');
  });

  it('includes area.created audit events for each area', async () => {
    await useCase.execute({ userId: 'user-1' });

    const events = auditRepoMock.saveBatch.mock.calls[0][0];
    const areaEvents = events.filter(
      (e: { eventType: string }) => e.eventType === 'area.created',
    );
    expect(areaEvents).toHaveLength(3);
  });

  it('includes context.created audit events for each context', async () => {
    await useCase.execute({ userId: 'user-1' });

    const events = auditRepoMock.saveBatch.mock.calls[0][0];
    const contextEvents = events.filter(
      (e: { eventType: string }) => e.eventType === 'context.created',
    );
    expect(contextEvents).toHaveLength(5);
  });

  it('scopes all audit events to the provisioned workspace', async () => {
    await useCase.execute({ userId: 'user-1' });

    const savedWorkspace = workspaceRepoMock.save.mock.calls[0][0];
    const events = auditRepoMock.saveBatch.mock.calls[0][0];
    for (const event of events) {
      expect(event.workspaceId).toBe(savedWorkspace.id);
    }
  });

  it('uses the actor id as actorId on all audit events', async () => {
    await useCase.execute({ userId: 'user-1' });

    const savedActor = actorRepoMock.save.mock.calls[0][0];
    const events = auditRepoMock.saveBatch.mock.calls[0][0];
    for (const event of events) {
      expect(event.actorId).toBe(savedActor.id);
    }
  });

  it('propagates workspace repository errors', async () => {
    workspaceRepoMock.save.mockRejectedValue(new Error('D1 failure'));

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow('D1 failure');
  });

  it('propagates actor repository errors', async () => {
    actorRepoMock.save.mockRejectedValue(new Error('actor D1 failure'));

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow('actor D1 failure');
  });

  it('propagates audit repository errors', async () => {
    auditRepoMock.saveBatch.mockRejectedValue(new Error('audit D1 failure'));

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow('audit D1 failure');
  });
});
