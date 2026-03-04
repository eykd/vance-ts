/**
 * WorkspaceProvisioningService spec.
 *
 * Verifies that {@link WorkspaceProvisioningService} delegates user-creation events
 * to {@link ProvisionWorkspaceUseCase} with the correct arguments.
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest';

import type { D1Database } from '@cloudflare/workers-types';

import type { ProvisionWorkspaceUseCase } from '../application/use-cases/ProvisionWorkspaceUseCase';
import type { Actor } from '../domain/entities/Actor.js';
import type { Area } from '../domain/entities/Area.js';
import type { AuditEvent } from '../domain/entities/AuditEvent.js';
import type { Context } from '../domain/entities/Context.js';
import type { Workspace } from '../domain/entities/Workspace.js';

import { WorkspaceProvisioningService } from './WorkspaceProvisioningService';

/**
 * Creates a minimal {@link ProvisionWorkspaceUseCase} test double.
 *
 * @param impl - Optional override for the `execute` mock implementation.
 * @returns An object containing the mock function and the cast use case instance.
 */
function makeUseCaseMock(impl?: () => Promise<void>): {
  execute: ReturnType<typeof vi.fn>;
  useCase: ProvisionWorkspaceUseCase;
} {
  const execute = vi.fn().mockImplementation(impl ?? ((): Promise<void> => Promise.resolve()));
  return { execute, useCase: { execute } as unknown as ProvisionWorkspaceUseCase };
}

describe('WorkspaceProvisioningService', () => {
  describe('onUserCreated', () => {
    it('calls provisionWorkspaceUseCase.execute with the given userId', async () => {
      const { execute, useCase } = makeUseCaseMock();
      const service = new WorkspaceProvisioningService(useCase);

      await service.onUserCreated('user-abc-123');

      expect(execute).toHaveBeenCalledOnce();
      expect(execute).toHaveBeenCalledWith({ userId: 'user-abc-123' });
    });

    it('resolves to undefined when the use case resolves', async () => {
      const { useCase } = makeUseCaseMock((): Promise<void> => Promise.resolve());
      const service = new WorkspaceProvisioningService(useCase);

      await expect(service.onUserCreated('user-1')).resolves.toBeUndefined();
    });

    it('propagates errors thrown by the use case', async () => {
      const error = new Error('ProvisionWorkspace failed');
      const { useCase } = makeUseCaseMock((): Promise<void> => Promise.reject(error));
      const service = new WorkspaceProvisioningService(useCase);

      await expect(service.onUserCreated('user-1')).rejects.toThrow('ProvisionWorkspace failed');
    });
  });

  describe('provisionBatch', () => {
    it('is a D1-batch transport that accepts all provisioning entities and persists them atomically', async () => {
      const { useCase } = makeUseCaseMock();
      const service = new WorkspaceProvisioningService(useCase);

      const workspace: Workspace = {
        id: 'ws-1',
        userId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      const actor: Actor = {
        id: 'actor-1',
        workspaceId: 'ws-1',
        userId: 'user-1',
        type: 'human',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      const areas: Area[] = [
        {
          id: 'area-1',
          workspaceId: 'ws-1',
          name: 'Work',
          status: 'active',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ];
      const contexts: Context[] = [
        {
          id: 'ctx-1',
          workspaceId: 'ws-1',
          name: 'computer',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ];
      const auditEvents: AuditEvent[] = [
        {
          id: 'evt-1',
          workspaceId: 'ws-1',
          entityType: 'workspace',
          entityId: 'ws-1',
          eventType: 'workspace.provisioned',
          actorId: 'actor-1',
          payload: '{}',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ];

      // provisionBatch is the D1-batch transport called by ProvisionWorkspaceUseCase.
      // The use case drives orchestration; this service is a thin persistence adapter.
      const mockStatement = { bind: vi.fn().mockReturnThis() };
      const mockPrepare = vi.fn().mockReturnValue(mockStatement);
      const mockBatch = vi.fn().mockResolvedValue([]);
      const mockDb = { prepare: mockPrepare, batch: mockBatch } as unknown as D1Database;

      const serviceAsBatchTransport = service as unknown as {
        provisionBatch(
          db: D1Database,
          workspace: Workspace,
          actor: Actor,
          areas: Area[],
          contexts: Context[],
          auditEvents: AuditEvent[],
        ): Promise<void>;
      };

      await serviceAsBatchTransport.provisionBatch(mockDb, workspace, actor, areas, contexts, auditEvents);

      expect(mockBatch).toHaveBeenCalledOnce();
    });

    it('passes audit event statements as the last entries in the D1 batch (FK ordering)', async () => {
      const { useCase } = makeUseCaseMock();
      const service = new WorkspaceProvisioningService(useCase);

      const workspace: Workspace = {
        id: 'ws-1',
        userId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
      const actor: Actor = {
        id: 'actor-1',
        workspaceId: 'ws-1',
        userId: 'user-1',
        type: 'human',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      const areas: Area[] = [
        {
          id: 'area-1',
          workspaceId: 'ws-1',
          name: 'Work',
          status: 'active',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ];
      const contexts: Context[] = [
        {
          id: 'ctx-1',
          workspaceId: 'ws-1',
          name: 'computer',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ];
      const auditEvents: AuditEvent[] = [
        {
          id: 'evt-1',
          workspaceId: 'ws-1',
          entityType: 'workspace',
          entityId: 'ws-1',
          eventType: 'workspace.provisioned',
          actorId: 'actor-1',
          payload: '{}',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'evt-2',
          workspaceId: 'ws-1',
          entityType: 'actor',
          entityId: 'actor-1',
          eventType: 'actor.created',
          actorId: 'actor-1',
          payload: '{}',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ];

      // Track the SQL prepared in order so we can verify FK-safe statement ordering.
      // Audit events have FKs on workspace_id and actor_id, so they must be last.
      const preparedSql: string[] = [];
      const mockStatement = { bind: vi.fn().mockReturnThis() };
      const mockPrepare = vi.fn().mockImplementation((sql: string) => {
        preparedSql.push(sql);
        return mockStatement;
      });
      const mockBatch2 = vi.fn().mockResolvedValue([]);
      const mockDb2 = { prepare: mockPrepare, batch: mockBatch2 } as unknown as D1Database;

      const serviceAsBatchTransport = service as unknown as {
        provisionBatch(
          db: D1Database,
          workspace: Workspace,
          actor: Actor,
          areas: Area[],
          contexts: Context[],
          auditEvents: AuditEvent[],
        ): Promise<void>;
      };

      await serviceAsBatchTransport.provisionBatch(mockDb2, workspace, actor, areas, contexts, auditEvents);

      // Verify db.batch was called once with all statements
      expect(mockBatch2).toHaveBeenCalledOnce();
      const statements = mockBatch2.mock.calls[0][0] as unknown[];

      // Expect: 1 workspace + 1 actor + 1 area + 1 context + 2 audit events = 6
      expect(statements).toHaveLength(6);

      // Audit events (last 2) must come after workspace+actor+area+context (first 4)
      // This is verified by the prepare call order
      const auditPrepareStart = preparedSql.findIndex((sql) => sql.includes('audit_event'));
      const lastNonAuditPrepare = preparedSql.findLastIndex((sql) => !sql.includes('audit_event'));
      expect(auditPrepareStart).toBeGreaterThan(lastNonAuditPrepare);
    });
  });
});
