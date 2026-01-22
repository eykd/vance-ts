# Privilege Escalation Prevention

**Purpose**: Comprehensive security patterns to prevent users from gaining unauthorized elevated access in multi-tenant SaaS applications.

## Core Principles

### 1. No Self-Promotion

Users cannot increase their own role level.

```typescript
// src/domain/authorization/guards/privilegeEscalation.ts

/**
 * Users cannot change their own role.
 */
export function canModifyMembership(actorId: string, targetUserId: string): boolean {
  // Cannot modify your own membership
  return actorId !== targetUserId;
}

// Usage
if (!canModifyMembership(actorId, targetUserId)) {
  throw new AuthorizationError('Cannot modify your own membership');
}
```

### 2. Grant Only Lower Roles

Users can only grant roles lower than their own level.

```typescript
/**
 * Check if grantor can assign a specific role.
 * Owners can grant any role, others only lower roles.
 */
export function canGrantRole(grantorRole: OrgRole, targetRole: OrgRole): boolean {
  const roleHierarchy: Record<OrgRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  };

  // Owners can grant any role
  if (grantorRole === 'owner') {
    return true;
  }

  // Others can only grant roles strictly below their own
  return roleHierarchy[grantorRole] > roleHierarchy[targetRole];
}
```

### 3. Manage Only Lower Roles

Users can only modify members with lower roles.

```typescript
/**
 * Check if actor can modify target's membership.
 */
export function canModifyMemberRole(
  actorId: string,
  actorRole: OrgRole,
  targetUserId: string,
  targetCurrentRole: OrgRole
): boolean {
  // Cannot modify your own membership
  if (actorId === targetUserId) {
    return false;
  }

  const roleHierarchy: Record<OrgRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  };

  // Must have higher role than target
  return roleHierarchy[actorRole] > roleHierarchy[targetCurrentRole];
}
```

## Complete Validation Function

```typescript
// src/application/services/MembershipService.ts

interface RoleChangeValidation {
  valid: boolean;
  reason?: string;
}

export function validateRoleChange(
  actorId: string,
  actorRole: OrgRole,
  targetUserId: string,
  targetCurrentRole: OrgRole,
  newRole: OrgRole
): RoleChangeValidation {
  // Rule 1: Cannot change own role
  if (actorId === targetUserId) {
    return { valid: false, reason: 'Cannot modify your own membership' };
  }

  // Rule 2: Cannot modify someone with equal or higher role
  if (!canModifyMemberRole(actorId, actorRole, targetUserId, targetCurrentRole)) {
    return { valid: false, reason: 'Cannot modify member with equal or higher role' };
  }

  // Rule 3: Cannot grant role equal to or higher than your own
  if (!canGrantRole(actorRole, newRole)) {
    return { valid: false, reason: 'Cannot grant role equal to or higher than your own' };
  }

  // Rule 4: Only owner can create another admin
  if (newRole === 'admin' && actorRole !== 'owner') {
    return { valid: false, reason: 'Only owner can grant admin role' };
  }

  // Rule 5: Cannot demote owner
  if (targetCurrentRole === 'owner') {
    return { valid: false, reason: 'Cannot change owner role' };
  }

  return { valid: true };
}
```

## Role Change Flow

```typescript
// src/application/services/MembershipService.ts

export async function changeMemberRole(
  db: D1Database,
  actorId: string,
  organizationId: string,
  targetUserId: string,
  newRole: OrgRole
): Promise<void> {
  // Get both memberships
  const [actorMembership, targetMembership] = await Promise.all([
    getOrgMembership(db, actorId, organizationId),
    getOrgMembership(db, targetUserId, organizationId),
  ]);

  if (!actorMembership) {
    throw new AuthorizationError('Not a member of this organization');
  }

  if (!targetMembership) {
    throw new NotFoundError('Target user is not a member');
  }

  // Validate the role change
  const validation = validateRoleChange(
    actorId,
    actorMembership.role,
    targetUserId,
    targetMembership.role,
    newRole
  );

  if (!validation.valid) {
    throw new AuthorizationError(validation.reason!);
  }

  // Perform the role change
  await db
    .prepare(
      `
      UPDATE organization_memberships
      SET role = ?, updated_at = datetime('now')
      WHERE organization_id = ? AND user_id = ?
    `
    )
    .bind(newRole, organizationId, targetUserId)
    .run();
}
```

## Transaction Safety

Role changes must be protected against race conditions. D1 doesn't support traditional transactions, but you can use batch operations with optimistic locking.

### Optimistic Locking Pattern

```typescript
interface RoleChangeResult {
  success: boolean;
  reason?: string;
}

/**
 * Safely change a member's role with optimistic locking.
 * Returns failure if concurrent modification detected.
 */
export async function changeMemberRoleSafe(
  db: D1Database,
  actorId: string,
  organizationId: string,
  targetUserId: string,
  newRole: OrgRole,
  expectedVersion: number
): Promise<RoleChangeResult> {
  // Validate permissions (same as before)
  const [actorMembership, targetMembership] = await Promise.all([
    getOrgMembership(db, actorId, organizationId),
    getOrgMembership(db, targetUserId, organizationId),
  ]);

  if (!actorMembership || !targetMembership) {
    return { success: false, reason: 'Membership not found' };
  }

  const validation = validateRoleChange(
    actorId,
    actorMembership.role,
    targetUserId,
    targetMembership.role,
    newRole
  );

  if (!validation.valid) {
    return { success: false, reason: validation.reason };
  }

  // Perform update with version check
  const result = await db
    .prepare(
      `
      UPDATE organization_memberships
      SET role = ?, version = version + 1, updated_at = datetime('now')
      WHERE organization_id = ? AND user_id = ? AND version = ?
    `
    )
    .bind(newRole, organizationId, targetUserId, expectedVersion)
    .run();

  if (result.meta.changes === 0) {
    return {
      success: false,
      reason: 'Concurrent modification detected. Please refresh and try again.',
    };
  }

  return { success: true };
}
```

### D1 Batch Operations

```typescript
/**
 * Transfer ownership atomically: demote current owner, promote new owner.
 */
export async function transferOwnership(
  db: D1Database,
  organizationId: string,
  currentOwnerId: string,
  newOwnerId: string
): Promise<void> {
  const statements = [
    // Demote current owner to admin
    db
      .prepare(
        `
        UPDATE organization_memberships
        SET role = 'admin', updated_at = datetime('now')
        WHERE organization_id = ? AND user_id = ? AND role = 'owner'
      `
      )
      .bind(organizationId, currentOwnerId),

    // Promote new owner
    db
      .prepare(
        `
        UPDATE organization_memberships
        SET role = 'owner', updated_at = datetime('now')
        WHERE organization_id = ? AND user_id = ?
      `
      )
      .bind(organizationId, newOwnerId),

    // Update organization owner reference
    db
      .prepare(
        `
        UPDATE organizations
        SET owner_id = ?, updated_at = datetime('now')
        WHERE id = ? AND owner_id = ?
      `
      )
      .bind(newOwnerId, organizationId, currentOwnerId),
  ];

  const results = await db.batch(statements);

  // Verify all statements succeeded
  const totalChanges = results.reduce((sum, r) => sum + (r.meta.changes || 0), 0);
  if (totalChanges !== 3) {
    throw new Error('Ownership transfer failed - some updates did not apply');
  }
}
```

## Test Cases

```typescript
describe('Privilege Escalation Prevention', () => {
  it('prevents self-promotion', async () => {
    const member = await createMember(orgId, 'member');

    await expect(changeMemberRole(db, member.id, orgId, member.id, 'admin')).rejects.toThrow(
      'Cannot modify your own membership'
    );
  });

  it('prevents admin from granting admin role', async () => {
    const admin = await createMember(orgId, 'admin');
    const member = await createMember(orgId, 'member');

    await expect(changeMemberRole(db, admin.id, orgId, member.id, 'admin')).rejects.toThrow(
      'Cannot grant role equal to or higher'
    );
  });

  it('prevents member from inviting anyone', async () => {
    const member = await createMember(orgId, 'member');

    await expect(inviteMember(db, member.id, orgId, 'new@test.com', 'viewer')).rejects.toThrow(
      'Your role cannot invite'
    );
  });

  it('allows owner to promote to admin', async () => {
    const owner = await createMember(orgId, 'owner');
    const member = await createMember(orgId, 'member');

    await changeMemberRole(db, owner.id, orgId, member.id, 'admin');

    const updated = await getOrgMembership(db, member.id, orgId);
    expect(updated.role).toBe('admin');
  });
});
```

## Security Checklist

| Check                                            | Done |
| ------------------------------------------------ | ---- |
| [ ] No endpoint allows self-role modification    |      |
| [ ] Role grants validated against grantor's role |      |
| [ ] Owner role changes require current owner     |      |
| [ ] Admin cannot create other admins             |      |
| [ ] All role changes are audited                 |      |
| [ ] Tests cover all escalation scenarios         |      |
| [ ] Optimistic locking prevents race conditions  |      |
| [ ] Ownership transfer is atomic                 |      |
