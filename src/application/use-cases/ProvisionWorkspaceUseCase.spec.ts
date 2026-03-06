/**
 * Tests for {@link ProvisionWorkspaceUseCase}.
 *
 * Verifies that the use case builds all workspace provisioning entities correctly
 * and delegates persistence to a single atomic batch call via {@link WorkspaceBatchPort}.
 *
 * @module
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { WorkspaceBatchPort } from '../../domain/interfaces/WorkspaceBatchPort.js';

import { ProvisionWorkspaceUseCase } from './ProvisionWorkspaceUseCase.js';

/**
 * Creates a minimal {@link WorkspaceBatchPort} mock.
 *
 * @returns An object with a vi.fn() stub for `provisionBatch`.
 */
function makeBatchPortMock(): { provisionBatch: ReturnType<typeof vi.fn> } {
  return {
    provisionBatch: vi.fn().mockResolvedValue(undefined),
  };
}

describe('ProvisionWorkspaceUseCase', () => {
  let batchPortMock: ReturnType<typeof makeBatchPortMock>;
  let useCase: ProvisionWorkspaceUseCase;

  beforeEach(() => {
    batchPortMock = makeBatchPortMock();
    useCase = new ProvisionWorkspaceUseCase(batchPortMock as unknown as WorkspaceBatchPort);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls provisionBatch with a workspace having the given userId', async () => {
    await useCase.execute({ userId: 'user-1' });

    expect(batchPortMock.provisionBatch).toHaveBeenCalledOnce();
    const workspace = batchPortMock.provisionBatch.mock.calls[0][0] as {
      id: string;
      userId: string;
      createdAt: string;
      updatedAt: string;
    };
    expect(workspace).toMatchObject({ userId: 'user-1' });
    expect(workspace.id).toBeTypeOf('string');
    expect(workspace.createdAt).toBeTypeOf('string');
    expect(workspace.updatedAt).toBeTypeOf('string');
  });

  it('calls provisionBatch with a human actor linked to the workspace and user', async () => {
    await useCase.execute({ userId: 'user-1' });

    expect(batchPortMock.provisionBatch).toHaveBeenCalledOnce();
    const [workspace, actor] = batchPortMock.provisionBatch.mock.calls[0] as [
      { id: string },
      { id: string; userId: string; workspaceId: string; type: string; createdAt: string },
    ];
    expect(actor).toMatchObject({
      userId: 'user-1',
      workspaceId: workspace.id,
      type: 'human',
    });
    expect(actor.id).toBeTypeOf('string');
    expect(actor.createdAt).toBeTypeOf('string');
  });

  it('calls provisionBatch with 3 areas: Work, Personal, Admin', async () => {
    await useCase.execute({ userId: 'user-1' });

    const areas = batchPortMock.provisionBatch.mock.calls[0][2] as Array<{ name: string }>;
    expect(areas).toHaveLength(3);
    const areaNames = areas.map((a) => a.name);
    expect(areaNames).toContain('Work');
    expect(areaNames).toContain('Personal');
    expect(areaNames).toContain('Admin');
  });

  it('calls provisionBatch with areas having active status linked to the workspace', async () => {
    await useCase.execute({ userId: 'user-1' });

    const [workspace, , areas] = batchPortMock.provisionBatch.mock.calls[0] as [
      { id: string },
      unknown,
      Array<{
        id: string;
        workspaceId: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      }>,
    ];
    for (const area of areas) {
      expect(area).toMatchObject({ status: 'active', workspaceId: workspace.id });
      expect(area.id).toBeTypeOf('string');
      expect(area.createdAt).toBeTypeOf('string');
      expect(area.updatedAt).toBeTypeOf('string');
    }
  });

  it('calls provisionBatch with 5 contexts: computer, calls, home, errands, office', async () => {
    await useCase.execute({ userId: 'user-1' });

    const contexts = batchPortMock.provisionBatch.mock.calls[0][3] as Array<{ name: string }>;
    expect(contexts).toHaveLength(5);
    const contextNames = contexts.map((c) => c.name);
    expect(contextNames).toContain('computer');
    expect(contextNames).toContain('calls');
    expect(contextNames).toContain('home');
    expect(contextNames).toContain('errands');
    expect(contextNames).toContain('office');
  });

  it('calls provisionBatch with contexts linked to the workspace', async () => {
    await useCase.execute({ userId: 'user-1' });

    const [workspace, , , contexts] = batchPortMock.provisionBatch.mock.calls[0] as [
      { id: string },
      unknown,
      unknown,
      Array<{ id: string; workspaceId: string; createdAt: string }>,
    ];
    for (const context of contexts) {
      expect(context).toMatchObject({ workspaceId: workspace.id });
      expect(context.id).toBeTypeOf('string');
      expect(context.createdAt).toBeTypeOf('string');
    }
  });

  it('calls provisionBatch with 10 audit events (1 workspace + 1 actor + 3 areas + 5 contexts)', async () => {
    await useCase.execute({ userId: 'user-1' });

    expect(batchPortMock.provisionBatch).toHaveBeenCalledOnce();
    const auditEvents = batchPortMock.provisionBatch.mock.calls[0][4] as unknown[];
    expect(auditEvents).toHaveLength(10);
  });

  it('includes a workspace.provisioned audit event', async () => {
    await useCase.execute({ userId: 'user-1' });

    const auditEvents = batchPortMock.provisionBatch.mock.calls[0][4] as Array<{
      eventType: string;
      entityType: string;
    }>;
    const workspaceEvent = auditEvents.find((e) => e.eventType === 'workspace.provisioned');
    expect(workspaceEvent).toBeDefined();
    expect(workspaceEvent?.entityType).toBe('workspace');
  });

  it('includes an actor.created audit event', async () => {
    await useCase.execute({ userId: 'user-1' });

    const auditEvents = batchPortMock.provisionBatch.mock.calls[0][4] as Array<{
      eventType: string;
      entityType: string;
    }>;
    const actorEvent = auditEvents.find((e) => e.eventType === 'actor.created');
    expect(actorEvent).toBeDefined();
    expect(actorEvent?.entityType).toBe('actor');
  });

  it('includes area.created audit events for each area', async () => {
    await useCase.execute({ userId: 'user-1' });

    const auditEvents = batchPortMock.provisionBatch.mock.calls[0][4] as Array<{
      eventType: string;
    }>;
    const areaEvents = auditEvents.filter((e) => e.eventType === 'area.created');
    expect(areaEvents).toHaveLength(3);
  });

  it('includes context.created audit events for each context', async () => {
    await useCase.execute({ userId: 'user-1' });

    const auditEvents = batchPortMock.provisionBatch.mock.calls[0][4] as Array<{
      eventType: string;
    }>;
    const contextEvents = auditEvents.filter((e) => e.eventType === 'context.created');
    expect(contextEvents).toHaveLength(5);
  });

  it('scopes all audit events to the provisioned workspace', async () => {
    await useCase.execute({ userId: 'user-1' });

    const [workspace, , , , auditEvents] = batchPortMock.provisionBatch.mock.calls[0] as [
      { id: string },
      unknown,
      unknown,
      unknown,
      Array<{ workspaceId: string }>,
    ];
    for (const event of auditEvents) {
      expect(event.workspaceId).toBe(workspace.id);
    }
  });

  it('uses the actor id as actorId on all audit events', async () => {
    await useCase.execute({ userId: 'user-1' });

    const [, actor, , , auditEvents] = batchPortMock.provisionBatch.mock.calls[0] as [
      unknown,
      { id: string },
      unknown,
      unknown,
      Array<{ actorId: string }>,
    ];
    for (const event of auditEvents) {
      expect(event.actorId).toBe(actor.id);
    }
  });

  it('propagates batch port errors', async () => {
    batchPortMock.provisionBatch.mockRejectedValue(new Error('D1 batch failure'));

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow('D1 batch failure');
  });

  it('delegates all entity persistence to a single atomic batch call, not individual repository saves', async () => {
    // Constraint [workspace-v4b]: All entities are persisted via a single provisionBatch()
    // call on the WorkspaceBatchPort, not through individual repository saves. This ensures
    // atomicity — a failure cannot leave a partial workspace with no actor or areas.
    await useCase.execute({ userId: 'user-1' });

    expect(batchPortMock.provisionBatch).toHaveBeenCalledOnce();
  });
});
