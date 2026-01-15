# Role Hierarchy

**Purpose**: Define organizational role levels and their associated permissions.

## When to Use

Use this reference when:

- Implementing role-based access checks
- Designing permission levels for new features
- Understanding what each role can and cannot do
- Documenting access control for stakeholders

## Role Levels

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORGANIZATION ROLE HIERARCHY                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Level 4: owner                                                             │
│  ──────────────────────────────────────────────────────────────────────    │
│  • Full control over organization                                           │
│  • Can delete the organization                                              │
│  • Can transfer ownership to another member                                 │
│  • Can change any member's role (including admins)                          │
│  • Can remove any member                                                    │
│  • Exactly one per organization                                             │
│                                                                             │
│  Level 3: admin                                                             │
│  ──────────────────────────────────────────────────────────────────────    │
│  • Manage organization settings                                             │
│  • Invite new members (up to admin role)                                    │
│  • Remove members (except owner)                                            │
│  • Change member roles (up to admin)                                        │
│  • Full access to all resources                                             │
│  • Cannot transfer ownership                                                │
│  • Cannot delete organization                                               │
│                                                                             │
│  Level 2: member                                                            │
│  ──────────────────────────────────────────────────────────────────────    │
│  • Create new resources                                                     │
│  • Full access to own resources                                             │
│  • Read access to all organization resources                                │
│  • Cannot invite or manage other members                                    │
│  • Cannot change organization settings                                      │
│                                                                             │
│  Level 1: viewer                                                            │
│  ──────────────────────────────────────────────────────────────────────    │
│  • Read-only access to all organization resources                           │
│  • Cannot create, edit, or delete anything                                  │
│  • Cannot invite or manage members                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Type Definition

```typescript
// src/domain/authorization/types.ts

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

/**
 * Check if roleA is higher than roleB.
 */
export function isHigherRole(roleA: OrgRole, roleB: OrgRole): boolean {
  return ROLE_HIERARCHY[roleA] > ROLE_HIERARCHY[roleB];
}

/**
 * Check if roleA is at least as high as roleB.
 */
export function isAtLeastRole(roleA: OrgRole, roleB: OrgRole): boolean {
  return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
}
```

## Permission Matrix

```typescript
// src/domain/authorization/permissions.ts

export type OrgAction =
  | 'read' // View resources
  | 'create' // Create new resources
  | 'update' // Modify resources
  | 'delete' // Remove resources
  | 'invite' // Add new members
  | 'remove' // Remove members
  | 'admin' // Manage org settings
  | 'transfer'; // Transfer ownership

const ROLE_PERMISSIONS: Record<OrgRole, OrgAction[]> = {
  owner: ['read', 'create', 'update', 'delete', 'invite', 'remove', 'admin', 'transfer'],
  admin: ['read', 'create', 'update', 'delete', 'invite', 'remove', 'admin'],
  member: ['read', 'create', 'update'],
  viewer: ['read'],
};

/**
 * Check if a role can perform an action.
 */
export function canPerformAction(role: OrgRole, action: OrgAction): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}
```

## Permission Matrix (Visual)

| Action   | Owner | Admin  | Member | Viewer |
| -------- | ----- | ------ | ------ | ------ |
| read     | ✅    | ✅     | ✅     | ✅     |
| create   | ✅    | ✅     | ✅     | ❌     |
| update   | ✅    | ✅     | ✅\*   | ❌     |
| delete   | ✅    | ✅     | ✅\*   | ❌     |
| invite   | ✅    | ✅     | ❌     | ❌     |
| remove   | ✅    | ✅\*\* | ❌     | ❌     |
| admin    | ✅    | ✅     | ❌     | ❌     |
| transfer | ✅    | ❌     | ❌     | ❌     |

\* Members can only update/delete their own resources
\*\* Admins cannot remove owner

## Role Comparison Utilities

```typescript
// src/domain/authorization/roleUtils.ts

/**
 * Get all roles that a given role can manage.
 */
export function getManageableRoles(role: OrgRole): OrgRole[] {
  switch (role) {
    case 'owner':
      return ['admin', 'member', 'viewer'];
    case 'admin':
      return ['member', 'viewer'];
    default:
      return [];
  }
}

/**
 * Get all roles that can be granted by a given role.
 */
export function getGrantableRoles(role: OrgRole): OrgRole[] {
  switch (role) {
    case 'owner':
      return ['admin', 'member', 'viewer'];
    case 'admin':
      return ['member', 'viewer'];
    default:
      return [];
  }
}

/**
 * Check if a role can modify another role.
 */
export function canModifyRole(actorRole: OrgRole, targetRole: OrgRole): boolean {
  // Must have strictly higher role
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}
```

## Usage Examples

### Checking Permission

```typescript
const membership = await getOrgMembership(db, userId, orgId);

if (!canPerformAction(membership.role, 'invite')) {
  return new Response('Forbidden: Cannot invite members', { status: 403 });
}
```

### Role Comparison

```typescript
// Check if user can manage target
const canManage = isHigherRole(actorRole, targetRole);

// Check minimum role requirement
const hasAccess = isAtLeastRole(userRole, 'member');
```

### Listing Manageable Members

```typescript
async function getManageableMembers(
  db: D1Database,
  actorId: string,
  orgId: string
): Promise<Member[]> {
  const actorMembership = await getOrgMembership(db, actorId, orgId);
  const manageable = getManageableRoles(actorMembership.role);

  return db
    .prepare(
      `
      SELECT * FROM organization_memberships
      WHERE organization_id = ? AND role IN (${manageable.map(() => '?').join(',')})
    `
    )
    .bind(orgId, ...manageable)
    .all<Member>()
    .then((r) => r.results);
}
```
