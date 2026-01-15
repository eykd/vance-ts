---
name: org-membership
description: 'Use when: (1) implementing membership management, (2) defining role hierarchies, (3) preventing privilege escalation, (4) handling invitations and removals, (5) questions about role-based access control.'
---

# Organization Membership

Manage organization members with proper role hierarchy and privilege escalation prevention.

## Decision Tree

### Need to understand role hierarchy?

**When**: Implementing role checks or designing permission levels
**Go to**: [references/role-hierarchy.md](./references/role-hierarchy.md)

### Need to prevent privilege escalation?

**When**: Implementing role changes, invitations, or self-modification prevention
**Go to**: [references/privilege-escalation.md](./references/privilege-escalation.md)

### Need to implement membership operations?

**When**: Building invite, remove, transfer, or role change functionality
**Go to**: [references/membership-management.md](./references/membership-management.md)

### Need to protect membership endpoints?

**When**: Implementing rate limiting for invitations, role changes, or preventing enumeration attacks
**Go to**: [references/rate-limiting.md](./references/rate-limiting.md)

## Quick Example

```typescript
// Invite with privilege escalation check
async function inviteMember(
  db: D1Database,
  inviterId: string,
  organizationId: string,
  inviteeEmail: string,
  role: OrgRole
): Promise<void> {
  // Get inviter's role
  const inviterMembership = await getOrgMembership(db, inviterId, organizationId);

  if (!inviterMembership) {
    throw new AuthorizationError('Not a member');
  }

  // Check privilege escalation
  if (!canGrantRole(inviterMembership.role, role)) {
    throw new AuthorizationError('Cannot grant role higher than your own');
  }

  // Proceed with invitation...
}
```

## Role Hierarchy

```
owner ──► Full control, can delete org, transfer ownership
  │
  ▼
admin ──► Manage members, manage all resources
  │
  ▼
member ─► Create resources, edit own resources
  │
  ▼
viewer ─► Read-only access
```

## Key Rules

| Rule                       | Description                          |
| -------------------------- | ------------------------------------ |
| No self-promotion          | Users cannot increase their own role |
| No self-demotion to escape | Users cannot change their own role   |
| Grant only ≤ own role      | Admins can only grant member/viewer  |
| Owners can do anything     | Only owners can transfer ownership   |
| Single owner               | Organizations have exactly one owner |

## Cross-References

- **[org-authorization](../org-authorization/SKILL.md)**: Authorization patterns using membership
- **[security-review](../security-review/SKILL.md)**: Security audit of membership logic
- **[org-data-model](../org-data-model/SKILL.md)**: Database schema for memberships
- **[org-isolation](../org-isolation/SKILL.md)**: Ensuring member operations respect tenant boundaries

## Reference Files

- [references/role-hierarchy.md](./references/role-hierarchy.md): Role definitions and permissions
- [references/privilege-escalation.md](./references/privilege-escalation.md): Prevention patterns
- [references/membership-management.md](./references/membership-management.md): Invite, remove, transfer operations
- [references/rate-limiting.md](./references/rate-limiting.md): Rate limiting for membership endpoints
