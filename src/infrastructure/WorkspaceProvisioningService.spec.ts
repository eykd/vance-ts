/**
 * WorkspaceProvisioningService spec.
 *
 * Verifies that {@link WorkspaceProvisioningService} delegates user-creation events
 * to {@link ProvisionWorkspaceUseCase} with the correct arguments.
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest';

import type { ProvisionWorkspaceUseCase } from '../application/use-cases/ProvisionWorkspaceUseCase';

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
});
