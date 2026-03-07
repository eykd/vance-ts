/**
 * CaptureInboxItemUseCase unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { mockAuditRepo, mockInboxRepo } from '../../../tests/mocks/repositories';

import { CaptureInboxItemUseCase } from './CaptureInboxItemUseCase.js';

describe('CaptureInboxItemUseCase', () => {
  it('saves a new inbox item and returns its DTO', async () => {
    const repoMock = mockInboxRepo();
    const useCase = new CaptureInboxItemUseCase(repoMock);

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
    const repoMock = mockInboxRepo();
    const useCase = new CaptureInboxItemUseCase(repoMock);

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
    const repoMock = mockInboxRepo();
    const auditRepoMock = mockAuditRepo();
    const useCase = new CaptureInboxItemUseCase(repoMock, auditRepoMock);

    const result = await useCase.execute({
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
