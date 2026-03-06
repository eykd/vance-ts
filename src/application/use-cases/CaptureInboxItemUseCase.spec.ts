import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuditEventRepository } from '../../domain/interfaces/AuditEventRepository.js';
import type { InboxItemRepository } from '../../domain/interfaces/InboxItemRepository.js';

import { CaptureInboxItemUseCase } from './CaptureInboxItemUseCase.js';

/**
 * Creates a minimal InboxItemRepository mock.
 *
 * @returns An object with vi.fn() stubs for each InboxItemRepository method.
 */
function makeInboxItemRepoMock(): {
  save: ReturnType<typeof vi.fn>;
  getById: ReturnType<typeof vi.fn>;
  listByWorkspaceId: ReturnType<typeof vi.fn>;
  countByWorkspaceId: ReturnType<typeof vi.fn>;
} {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn(),
    listByWorkspaceId: vi.fn(),
    countByWorkspaceId: vi.fn(),
  };
}

describe('CaptureInboxItemUseCase', () => {
  let repoMock: ReturnType<typeof makeInboxItemRepoMock>;
  let useCase: CaptureInboxItemUseCase;

  beforeEach(() => {
    repoMock = makeInboxItemRepoMock();
    useCase = new CaptureInboxItemUseCase(repoMock as unknown as InboxItemRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('saves a new inbox item and returns its DTO', async () => {
    const result = await useCase.execute({
      workspaceId: 'ws-1',
      title: 'Buy milk',
    });

    expect(repoMock.save).toHaveBeenCalledOnce();
    expect(result.title).toBe('Buy milk');
    expect(result.status).toBe('inbox');
    expect(result.description).toBeNull();
    expect(result.id).toEqual(expect.any(String));
  });

  it('passes an optional description through to the saved entity', async () => {
    const result = await useCase.execute({
      workspaceId: 'ws-1',
      title: 'Buy milk',
      description: 'Whole milk from the corner store',
    });

    expect(result.description).toBe('Whole milk from the corner store');

    const savedEntity = repoMock.save.mock.calls[0]?.[0] as { description: string | null };
    expect(savedEntity.description).toBe('Whole milk from the corner store');
  });

  it('records an audit event for the capture', async () => {
    const auditRepoMock = { save: vi.fn().mockResolvedValue(undefined), saveBatch: vi.fn() };
    const useCaseWithAudit = new CaptureInboxItemUseCase(
      repoMock as unknown as InboxItemRepository,
      auditRepoMock as unknown as AuditEventRepository
    );

    const result = await useCaseWithAudit.execute({
      workspaceId: 'ws-1',
      actorId: 'actor-1',
      title: 'Buy milk',
    });

    expect(auditRepoMock.save).toHaveBeenCalledOnce();
    const auditEvent = auditRepoMock.save.mock.calls[0]?.[0] as {
      entityType: string;
      entityId: string;
      eventType: string;
      workspaceId: string;
      actorId: string;
    };
    expect(auditEvent.entityType).toBe('inbox_item');
    expect(auditEvent.entityId).toBe(result.id);
    expect(auditEvent.eventType).toBe('inbox_item.captured');
    expect(auditEvent.workspaceId).toBe('ws-1');
    expect(auditEvent.actorId).toBe('actor-1');
  });
});
