/**
 * CaptureInboxItemUseCase unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { mockAuditRepo, mockInboxRepo } from '../../../tests/mocks/repositories';

import { CaptureInboxItemUseCase } from './CaptureInboxItemUseCase.js';
import type { CaptureInboxItemResult } from './CaptureInboxItemUseCase.js';

describe('CaptureInboxItemUseCase', () => {
  it('saves a new inbox item and returns its DTO', async () => {
    const repoMock = mockInboxRepo();
    const useCase = new CaptureInboxItemUseCase(repoMock);

    const result: CaptureInboxItemResult = await useCase.execute({
      workspaceId: 'ws-1',
      title: 'Buy milk',
    });

    expect(result.ok).toBe(true);
    expect(repoMock.save).toHaveBeenCalledOnce();
    if (result.ok) {
      expect(result.data.title).toBe('Buy milk');
      expect(result.data.status).toBe('inbox');
      expect(result.data.description).toBeNull();
      expect(result.data.id).toEqual(expect.any(String));
    }
  });

  it('passes an optional description through to the saved entity', async () => {
    const repoMock = mockInboxRepo();
    const useCase = new CaptureInboxItemUseCase(repoMock);

    const result = await useCase.execute({
      workspaceId: 'ws-1',
      title: 'Buy milk',
      description: 'Whole milk from the corner store',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.description).toBe('Whole milk from the corner store');
    }

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

    expect(result.ok).toBe(true);
    expect(auditRepoMock.save).toHaveBeenCalledOnce();
    if (result.ok) {
      const auditEvent = auditRepoMock.save.mock.calls[0]?.[0] as {
        entityType: string;
        entityId: string;
        eventType: string;
        workspaceId: string;
        actorId: string;
      };
      expect(auditEvent.entityType).toBe('inbox_item');
      expect(auditEvent.entityId).toBe(result.data.id);
      expect(auditEvent.eventType).toBe('inbox_item.captured');
      expect(auditEvent.workspaceId).toBe('ws-1');
      expect(auditEvent.actorId).toBe('actor-1');
    }
  });

  it('returns domain_error for invalid input', async () => {
    const repoMock = mockInboxRepo();
    const useCase = new CaptureInboxItemUseCase(repoMock);

    const result = await useCase.execute({
      workspaceId: '',
      title: 'Buy milk',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe('domain_error');
      expect(result.code).toBe('workspace_id_required');
    }
  });
});
