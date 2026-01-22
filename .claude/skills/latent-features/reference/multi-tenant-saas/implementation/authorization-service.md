# Authorization Service

**Purpose**: Comprehensive guide to implementing AuthorizationService for multi-tenant SaaS applications, including type definitions, core patterns, and security considerations.

## Core Type Definitions

### Actor, Action, and Resource Types

```typescript
// src/domain/authorization/types.ts

/**
 * An Actor is the entity attempting to perform an action.
 * Actors can be users, system processes, or API keys.
 */
export type Actor =
  | { type: 'user'; id: string }
  | { type: 'system'; reason: string }
  | { type: 'api_key'; id: string; scopes: string[] };

/**
 * Actions that can be performed on resources.
 */
export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'invite'
  | 'remove'
  | 'transfer'
  | 'admin';

/**
 * Resource types in the system.
 */
export type ResourceType = 'organization' | 'project' | 'document' | 'membership';

/**
 * A Resource identifies what the action targets.
 * The format is "type:id" with optional parent for nested resources.
 */
export interface Resource {
  type: ResourceType;
  id: string;
  /** Optional parent context for nested resources */
  parent?: Resource;
}

/**
 * The result of an authorization check.
 * Always includes a reason for debugging and audit logging.
 */
export interface AuthorizationResult {
  allowed: boolean;
  reason: string;
  /** The effective role that granted (or would have granted) access */
  effectiveRole?: string;
}

/**
 * Context provides the data needed to evaluate policies.
 * This is loaded once per request and passed to all policy checks.
 */
export interface PolicyContext {
  /** Organization membership for the actor (if user) */
  organizationMembership?: {
    organizationId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
  };
  /** Who owns the resource being accessed */
  resourceOwner?: string;
  /** Which organization the resource belongs to */
  resourceOrganizationId?: string;
  /** Project-specific membership (if checking project access) */
  projectMembership?: {
    role: 'admin' | 'editor' | 'viewer';
  };
}
```

### Type Guards and Extensions

```typescript
/**
 * Type guard for user actors.
 */
export function isUserActor(actor: Actor): actor is { type: 'user'; id: string } {
  return actor.type === 'user';
}

/**
 * Type guard for system actors.
 */
export function isSystemActor(actor: Actor): actor is { type: 'system'; reason: string } {
  return actor.type === 'system';
}

// Extending types for new actors
export type Actor =
  | { type: 'user'; id: string }
  | { type: 'system'; reason: string }
  | { type: 'api_key'; id: string; scopes: string[] }
  | { type: 'service_account'; id: string; service: string }; // New

// Extending resource types
export type ResourceType = 'organization' | 'project' | 'document' | 'membership' | 'billing'; // New

// Extending actions
export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'invite'
  | 'remove'
  | 'transfer'
  | 'admin'
  | 'archive'
  | 'restore'; // New actions
```

## Authorization Service Implementation

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

## Authorization Patterns

### Pattern 1: Resource Ownership

```typescript
// src/domain/authorization/patterns/ownership.ts

/**
 * Check if user is the owner of a resource.
 */
export async function isResourceOwner(
  db: D1Database,
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> {
  const table = getTableForResourceType(resourceType);
  const ownerColumn = getOwnerColumnForResourceType(resourceType);

  const row = await db
    .prepare(`SELECT ${ownerColumn} FROM ${table} WHERE id = ?`)
    .bind(resourceId)
    .first<Record<string, string>>();

  return row?.[ownerColumn] === userId;
}

/**
 * Ownership transfer - only current owner can transfer.
 */
export async function transferOwnership(
  db: D1Database,
  currentOwnerId: string,
  newOwnerId: string,
  resourceType: string,
  resourceId: string
): Promise<void> {
  const isOwner = await isResourceOwner(db, currentOwnerId, resourceType, resourceId);

  if (!isOwner) {
    throw new AuthorizationError('Only the owner can transfer ownership', {
      actor: { type: 'user', id: currentOwnerId },
      action: 'transfer',
      resource: { type: resourceType as ResourceType, id: resourceId },
    });
  }

  const table = getTableForResourceType(resourceType);
  const ownerColumn = getOwnerColumnForResourceType(resourceType);

  await db
    .prepare(`UPDATE ${table} SET ${ownerColumn} = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(newOwnerId, resourceId)
    .run();
}
```

### Pattern 2: Admin Override

```typescript
// src/domain/authorization/patterns/adminOverride.ts

export type AdminLevel = 'owner' | 'admin' | 'none';

/**
 * Check if user has admin privileges in an organization.
 */
export async function getAdminLevel(
  db: D1Database,
  userId: string,
  organizationId: string
): Promise<AdminLevel> {
  // Check if user is org owner
  const org = await db
    .prepare('SELECT owner_id FROM organizations WHERE id = ?')
    .bind(organizationId)
    .first<{ owner_id: string }>();

  if (org?.owner_id === userId) {
    return 'owner';
  }

  // Check membership role
  const membership = await db
    .prepare('SELECT role FROM organization_memberships WHERE organization_id = ? AND user_id = ?')
    .bind(organizationId, userId)
    .first<{ role: string }>();

  if (membership?.role === 'admin' || membership?.role === 'owner') {
    return 'admin';
  }

  return 'none';
}

/**
 * Admin override for modifying any resource in the org.
 */
export async function canAdminOverride(
  db: D1Database,
  userId: string,
  organizationId: string,
  action: Action
): Promise<AuthorizationResult> {
  const adminLevel = await getAdminLevel(db, userId, organizationId);

  // Owners can do anything
  if (adminLevel === 'owner') {
    return {
      allowed: true,
      reason: 'Organization owner override',
      effectiveRole: 'owner',
    };
  }

  // Admins can do most things except ownership-related actions
  if (adminLevel === 'admin') {
    const ownerOnlyActions: Action[] = ['transfer'];

    if (ownerOnlyActions.includes(action)) {
      return {
        allowed: false,
        reason: 'Only organization owner can perform this action',
      };
    }

    return {
      allowed: true,
      reason: 'Organization admin override',
      effectiveRole: 'admin',
    };
  }

  return {
    allowed: false,
    reason: 'Not an admin of this organization',
  };
}
```

### Pattern 3: System Actions

```typescript
// src/domain/authorization/patterns/systemActions.ts

/**
 * Create a system actor for internal operations.
 * Always include a reason for audit trail.
 */
export function createSystemActor(reason: string): Actor {
  return {
    type: 'system',
    reason,
  };
}

/**
 * Example: Background job that needs to update all projects.
 */
export async function runProjectMaintenanceJob(db: D1Database): Promise<void> {
  const systemActor = createSystemActor('Scheduled project maintenance');
  const authz = new AuthorizationService(db);

  const projects = await db
    .prepare('SELECT id, organization_id FROM projects')
    .all<{ id: string; organization_id: string }>();

  for (const project of projects.results) {
    // Still log the authorization check for audit trail
    const result = await authz.can(systemActor, 'update', { type: 'project', id: project.id });

    if (result.allowed) {
      await performMaintenance(db, project.id);
    }
  }
}

/**
 * Validate system request headers.
 */
export function validateSystemRequest(request: Request, env: Env): Actor | null {
  const token = request.headers.get('X-System-Token');
  const reason = request.headers.get('X-System-Reason');

  if (!token || !reason) {
    return null;
  }

  // Use timing-safe comparison in production
  if (!timingSafeEqual(token, env.SYSTEM_TOKEN)) {
    return null;
  }

  return createSystemActor(reason);
}
```

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

## Pattern Selection Guide

| Pattern        | Use When                                         |
| -------------- | ------------------------------------------------ |
| Ownership      | Resources have a single owner with full control  |
| Admin Override | Org admins need to manage all resources          |
| System Actions | Background jobs or internal services need access |
