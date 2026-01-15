# Authorization Patterns

**Purpose**: Common authorization patterns for ownership, admin override, system actions, delegation, and hierarchical permissions.

## When to Use

Use this reference when:

- Implementing resource ownership checks and transfers
- Adding admin override capabilities
- Creating system actors for background jobs
- Building delegation (act on behalf of) functionality
- Implementing hierarchical permission inheritance

## Pattern 1: Resource Ownership

The creator of a resource has special privileges over it.

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

## Pattern 2: Admin Override

Organization admins can perform actions that regular members cannot.

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

## Pattern 3: System Actions

Background jobs, migrations, and internal services need to bypass user authorization.

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

## Pattern 4: Delegation (Acting on Behalf Of)

Allow users to delegate specific permissions to others.

```typescript
// src/domain/authorization/patterns/delegation.ts

interface Delegation {
  id: string;
  grantorId: string; // Who granted the delegation
  granteeId: string; // Who received the delegation
  resourceType: ResourceType;
  resourceId: string | '*'; // Specific resource or all of type
  actions: Action[];
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * Check if a user has delegated access.
 */
export async function checkDelegation(
  db: D1Database,
  granteeId: string,
  action: Action,
  resource: Resource
): Promise<AuthorizationResult> {
  const delegation = await db
    .prepare(
      `
      SELECT * FROM delegations
      WHERE grantee_id = ?
        AND resource_type = ?
        AND (resource_id = ? OR resource_id = '*')
        AND (expires_at IS NULL OR expires_at > datetime('now'))
    `
    )
    .bind(granteeId, resource.type, resource.id)
    .first<DelegationRow>();

  if (!delegation) {
    return { allowed: false, reason: 'No delegation found' };
  }

  const delegatedActions = JSON.parse(delegation.actions) as Action[];

  if (!delegatedActions.includes(action)) {
    return {
      allowed: false,
      reason: `Delegation does not include '${action}' action`,
    };
  }

  return {
    allowed: true,
    reason: `Delegated by user ${delegation.grantor_id}`,
    effectiveRole: 'delegate',
  };
}

/**
 * Create a delegation (requires admin access).
 */
export async function createDelegation(
  db: D1Database,
  grantorId: string,
  authz: AuthorizationService,
  delegation: Omit<Delegation, 'id' | 'createdAt'>
): Promise<Delegation> {
  // Verify the grantor has permission to delegate
  const resource: Resource = {
    type: delegation.resourceType,
    id: delegation.resourceId === '*' ? 'any' : delegation.resourceId,
  };

  // Must have admin access to delegate
  await authz.require({ type: 'user', id: grantorId }, 'admin', resource);

  const id = crypto.randomUUID();

  await db
    .prepare(
      `
      INSERT INTO delegations (id, grantor_id, grantee_id, resource_type, resource_id, actions, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `
    )
    .bind(
      id,
      grantorId,
      delegation.granteeId,
      delegation.resourceType,
      delegation.resourceId,
      JSON.stringify(delegation.actions),
      delegation.expiresAt?.toISOString() || null
    )
    .run();

  return { id, ...delegation, createdAt: new Date() };
}
```

## Pattern 5: Hierarchical Permissions

Resources inherit permissions from their parents (Org → Project → Document).

```typescript
// src/domain/authorization/patterns/hierarchy.ts

/**
 * Check permissions up the hierarchy.
 * Higher-level permissions cascade down.
 */
export async function checkHierarchicalAccess(
  db: D1Database,
  userId: string,
  action: Action,
  resource: Resource
): Promise<AuthorizationResult> {
  // Build the resource hierarchy
  const hierarchy = await buildResourceHierarchy(db, resource);

  // Check from top (org) to bottom (resource)
  for (const level of hierarchy) {
    const permission = await getExplicitPermission(db, userId, level);

    if (permission && canPerformAction(permission.role, action)) {
      return {
        allowed: true,
        reason: `Permission inherited from ${level.type}`,
        effectiveRole: permission.role,
      };
    }
  }

  // Check resource-specific permission last
  const directPermission = await getExplicitPermission(db, userId, resource);

  if (directPermission && canPerformAction(directPermission.role, action)) {
    return {
      allowed: true,
      reason: 'Direct permission on resource',
      effectiveRole: directPermission.role,
    };
  }

  return { allowed: false, reason: 'No permission in hierarchy' };
}

async function buildResourceHierarchy(db: D1Database, resource: Resource): Promise<Resource[]> {
  const hierarchy: Resource[] = [];
  let current: Resource | undefined = resource;

  while (current) {
    const parent = await getParentResource(db, current);
    if (parent) {
      hierarchy.unshift(parent); // Add to front (org first)
    }
    current = parent;
  }

  return hierarchy;
}
```

## Pattern Selection Guide

| Pattern        | Use When                                         |
| -------------- | ------------------------------------------------ |
| Ownership      | Resources have a single owner with full control  |
| Admin Override | Org admins need to manage all resources          |
| System Actions | Background jobs or internal services need access |
| Delegation     | Users need to temporarily grant access to others |
| Hierarchical   | Resources are nested (org → project → document)  |

## Integration in AuthorizationService

```typescript
async evaluatePolicy(actor: Actor, action: Action, resource: Resource): Promise<AuthorizationResult> {
  // 1. System actors always allowed
  if (actor.type === 'system') {
    return { allowed: true, reason: `System: ${actor.reason}` };
  }

  // 2. Check admin override
  const orgId = await this.getResourceOrganizationId(resource);
  if (orgId) {
    const adminResult = await canAdminOverride(this.db, actor.id, orgId, action);
    if (adminResult.allowed) return adminResult;
  }

  // 3. Check resource ownership
  if (await isResourceOwner(this.db, actor.id, resource.type, resource.id)) {
    return { allowed: true, reason: 'Resource owner', effectiveRole: 'owner' };
  }

  // 4. Check delegation
  const delegationResult = await checkDelegation(this.db, actor.id, action, resource);
  if (delegationResult.allowed) return delegationResult;

  // 5. Check hierarchical permissions
  return checkHierarchicalAccess(this.db, actor.id, action, resource);
}
```
