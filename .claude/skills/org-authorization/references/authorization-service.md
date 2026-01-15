# Authorization Service

**Purpose**: Implement the AuthorizationService that loads context, evaluates policies, and logs decisions.

## When to Use

Use this reference when:

- Building the main authorization entry point
- Implementing policy evaluation logic
- Adding audit logging for authorization decisions
- Integrating authorization into request handlers

## Pattern

```typescript
// src/application/services/AuthorizationService.ts

import type {
  Actor,
  Action,
  Resource,
  AuthorizationResult,
  PolicyContext,
} from '../../domain/authorization/types';
import type { SafeLogger } from '../../infrastructure/logging/safeLogger';

/**
 * AuthorizationService is the main entry point for authorization checks.
 * It loads context, evaluates policies, and logs decisions.
 *
 * @see [structured-logging skill](../../structured-logging/SKILL.md) for SafeLogger implementation
 */
export class AuthorizationService {
  constructor(
    private db: D1Database,
    private logger: SafeLogger
  ) {}

  /**
   * Check if an actor can perform an action on a resource.
   */
  async can(actor: Actor, action: Action, resource: Resource): Promise<AuthorizationResult> {
    // System actors always allowed
    if (actor.type === 'system') {
      return {
        allowed: true,
        reason: `System action: ${actor.reason}`,
        effectiveRole: 'system',
      };
    }

    // Load context needed for policy evaluation
    const context = await this.loadContext(actor, resource);

    // Evaluate the policy
    const result = this.evaluatePolicy(actor, action, resource, context);

    // Log the decision (for audit trail)
    this.logDecision(actor, action, resource, result);

    return result;
  }

  /**
   * Require authorization - throws if not allowed.
   */
  async require(actor: Actor, action: Action, resource: Resource): Promise<void> {
    const result = await this.can(actor, action, resource);
    if (!result.allowed) {
      throw new AuthorizationError(result.reason, { actor, action, resource });
    }
  }

  private async loadContext(actor: Actor, resource: Resource): Promise<PolicyContext> {
    const context: PolicyContext = {};

    if (actor.type !== 'user') {
      return context;
    }

    // Load organization membership
    const orgId = await this.getResourceOrganizationId(resource);
    if (orgId) {
      context.resourceOrganizationId = orgId;
      context.organizationMembership = await this.getOrgMembership(actor.id, orgId);
    }

    // Load resource owner
    context.resourceOwner = await this.getResourceOwner(resource);

    // Load project membership if applicable
    const projectId = this.getProjectId(resource);
    if (projectId) {
      context.projectMembership = await this.getProjectMembership(actor.id, projectId);
    }

    return context;
  }

  private evaluatePolicy(
    actor: Actor,
    action: Action,
    resource: Resource,
    context: PolicyContext
  ): AuthorizationResult {
    if (actor.type !== 'user') {
      return { allowed: false, reason: 'Unknown actor type' };
    }

    // Check organization membership
    const membership = context.organizationMembership;
    if (!membership) {
      return { allowed: false, reason: 'Not a member of this organization' };
    }

    // Verify resource belongs to actor's organization
    if (context.resourceOrganizationId !== membership.organizationId) {
      return { allowed: false, reason: 'Resource belongs to different organization' };
    }

    // Owner can do everything
    if (membership.role === 'owner') {
      return {
        allowed: true,
        reason: 'Organization owner has full access',
        effectiveRole: 'owner',
      };
    }

    // Admin can do everything except ownership transfer
    if (membership.role === 'admin') {
      if (action === 'transfer' && resource.type === 'organization') {
        return { allowed: false, reason: 'Only owner can transfer organization' };
      }
      return {
        allowed: true,
        reason: 'Organization admin has administrative access',
        effectiveRole: 'admin',
      };
    }

    // Resource owner can manage their own resources
    if (context.resourceOwner === actor.id) {
      return {
        allowed: true,
        reason: 'Resource owner has full access',
        effectiveRole: 'resource_owner',
      };
    }

    // Members can create and read
    if (membership.role === 'member') {
      if (action === 'create' || action === 'read') {
        return {
          allowed: true,
          reason: `Members can ${action} resources`,
          effectiveRole: 'member',
        };
      }
    }

    // Viewers can only read
    if (membership.role === 'viewer' && action === 'read') {
      return {
        allowed: true,
        reason: 'Viewers can view resources',
        effectiveRole: 'viewer',
      };
    }

    return { allowed: false, reason: 'No applicable permission found' };
  }

  private async getOrgMembership(
    userId: string,
    orgId: string
  ): Promise<PolicyContext['organizationMembership']> {
    const row = await this.db
      .prepare(
        'SELECT role FROM organization_memberships WHERE user_id = ? AND organization_id = ?'
      )
      .bind(userId, orgId)
      .first<{ role: string }>();

    if (!row) return undefined;

    return {
      organizationId: orgId,
      role: row.role as 'owner' | 'admin' | 'member' | 'viewer',
    };
  }

  private async getResourceOrganizationId(resource: Resource): Promise<string | undefined> {
    if (resource.type === 'organization') {
      return resource.id;
    }

    if (resource.type === 'project') {
      const project = await this.db
        .prepare('SELECT organization_id FROM projects WHERE id = ?')
        .bind(resource.id)
        .first<{ organization_id: string }>();
      return project?.organization_id;
    }

    if (resource.parent) {
      return this.getResourceOrganizationId(resource.parent);
    }

    return undefined;
  }

  private async getResourceOwner(resource: Resource): Promise<string | undefined> {
    if (resource.type === 'project') {
      const project = await this.db
        .prepare('SELECT owner_id FROM projects WHERE id = ?')
        .bind(resource.id)
        .first<{ owner_id: string }>();
      return project?.owner_id;
    }
    return undefined;
  }

  private getProjectId(resource: Resource): string | undefined {
    if (resource.type === 'project') return resource.id;
    if (resource.parent?.type === 'project') return resource.parent.id;
    return undefined;
  }

  private async getProjectMembership(
    userId: string,
    projectId: string
  ): Promise<PolicyContext['projectMembership']> {
    const row = await this.db
      .prepare('SELECT role FROM project_members WHERE user_id = ? AND project_id = ?')
      .bind(userId, projectId)
      .first<{ role: string }>();

    if (!row) return undefined;
    return { role: row.role as 'admin' | 'editor' | 'viewer' };
  }

  /**
   * Log authorization decision for audit trail.
   * Uses SafeLogger for structured logging with PII redaction.
   * @see [structured-logging skill](../../structured-logging/SKILL.md)
   */
  private logDecision(
    actor: Actor,
    action: Action,
    resource: Resource,
    result: AuthorizationResult
  ): void {
    this.logger.info({
      event: 'authorization.decision',
      category: 'application',
      actor_type: actor.type,
      actor_id: actor.type === 'user' ? actor.id : undefined,
      action,
      resource_type: resource.type,
      resource_id: resource.id,
      allowed: result.allowed,
      effective_role: result.effectiveRole,
      // reason logged only on denials for audit purposes
      denial_reason: result.allowed ? undefined : result.reason,
    });
  }
}

/**
 * Error thrown when authorization is denied.
 */
export class AuthorizationError extends Error {
  constructor(
    message: string,
    public context: { actor: Actor; action: Action; resource: Resource }
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}
```

> [!CAUTION]
> **SQL Injection Prevention**: ALWAYS use parameterized queries (prepared statements with `.bind()`) as shown above. NEVER concatenate user input directly into SQL strings.
>
> ```typescript
> // ✅ CORRECT: Parameterized query
> await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
>
> // ❌ DANGEROUS: String concatenation - NEVER DO THIS
> await db.prepare(`SELECT * FROM users WHERE id = '${userId}'`).first();
> ```
>
> Even if input appears sanitized, always use parameterized queries. This protects against injection attacks where malicious input like `'; DROP TABLE users; --` could compromise your database.

## Handler Integration

```typescript
// In request handler
import { createLogger } from '../../infrastructure/logging';

// Create logger with request context
const logger = createLogger({
  service: 'my-api',
  environment: env.ENVIRONMENT,
  version: '1.0.0',
  requestId: request.headers.get('cf-ray') ?? crypto.randomUUID(),
});

const authz = new AuthorizationService(env.DB, logger);

try {
  await authz.require({ type: 'user', id: userId }, 'delete', { type: 'project', id: projectId });
  // Proceed with deletion
} catch (error) {
  if (error instanceof AuthorizationError) {
    // Log authorization failure - don't expose internal details to client
    logger.warn({
      event: 'authorization.denied',
      category: 'application',
      user_id: userId,
      attempted_action: 'delete',
      resource_type: 'project',
    });
    return new Response('Access denied', { status: 403 });
  }
  throw error;
}
```

> [!TIP]
> **Structured Logging Integration**: For complete SafeLogger implementation with PII redaction and request correlation, see the [structured-logging skill](../../structured-logging/SKILL.md).
