/**
 * WorkspaceProvisioningService — infrastructure adapter bridging better-auth's
 * `databaseHooks.user.create.after` hook to the application-layer provisioning
 * use case.
 *
 * Constructed inside `getAuth(env)` where `env.DB` (raw D1) is available, so
 * the {@link ProvisionWorkspaceUseCase} can be wired with all required
 * repository implementations before being passed here.
 *
 * @module
 */

import type { ProvisionWorkspaceUseCase } from '../application/use-cases/ProvisionWorkspaceUseCase';

/**
 * Infrastructure adapter that bridges better-auth's post-signup user hook
 * to the {@link ProvisionWorkspaceUseCase} application use case.
 *
 * Receives the fully-wired use case from `getAuth(env)`, which constructs all
 * repository dependencies using the raw `env.DB` D1 binding.
 */
export class WorkspaceProvisioningService {
  /** The provisioning use case to delegate workspace creation to. */
  private readonly _useCase: ProvisionWorkspaceUseCase;

  /**
   * Creates a new WorkspaceProvisioningService.
   *
   * @param useCase - The provisioning use case to delegate to on user creation.
   */
  constructor(useCase: ProvisionWorkspaceUseCase) {
    this._useCase = useCase;
  }

  /**
   * Called after a new user is created by better-auth.
   *
   * Delegates workspace provisioning to {@link ProvisionWorkspaceUseCase},
   * which atomically creates the workspace, actor, seeded areas and contexts,
   * and all associated audit events for the new user.
   *
   * Errors are propagated to the caller. The better-auth hook in `auth.ts`
   * wraps this call in a try/catch and logs errors rather than rethrowing,
   * because the user row is already committed by the time this hook fires.
   *
   * @param userId - The newly created user's ID (from better-auth).
   * @returns Resolved promise when provisioning completes successfully.
   * @throws {Error} When the use case fails.
   */
  async onUserCreated(userId: string): Promise<void> {
    await this._useCase.execute({ userId });
  }
}
