cat >> .claude/skills/latent-features/reference/multi-tenant-saas/implementation/membership-management.md << 'EOFMEM'

## Invitation Schema

```sql
CREATE TABLE organization_invitations (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
    invited_by TEXT NOT NULL REFERENCES users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    accepted_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(organization_id, email)
);

CREATE INDEX idx_invitations_org ON organization_invitations(organization_id);
CREATE INDEX idx_invitations_token ON organization_invitations(token);
```

## Create Invitation

```typescript
export async function createInvitation(
  db: D1Database,
  input: CreateInvitationInput
): Promise<Invitation> {
  const id = crypto.randomUUID();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db
    .prepare(
      `
      INSERT INTO organization_invitations
        (id, organization_id, email, role, invited_by, token, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    )
    .bind(
      id,
      input.organizationId,
      input.email.toLowerCase(),
      input.role,
      input.invitedBy,
      token,
      expiresAt.toISOString()
    )
    .run();

  return { id, token, expiresAt, ...input };
}
```

## Accept Invitation

```typescript
export async function acceptInvitation(
  db: D1Database,
  userId: string,
  token: string
): Promise<void> {
  // Find and validate invitation
  const invitation = await db
    .prepare(
      `
      SELECT * FROM organization_invitations
      WHERE token = ? AND accepted_at IS NULL AND expires_at > datetime('now')
    `
    )
    .bind(token)
    .first<InvitationRow>();

  if (!invitation) {
    throw new NotFoundError('Invitation not found or expired');
  }

  // Verify user email matches invitation
  const user = await db
    .prepare('SELECT email FROM users WHERE id = ?')
    .bind(userId)
    .first<{ email: string }>();

  if (user?.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new ValidationError('Invitation is for a different email address');
  }

  // Check if already a member
  const existingMembership = await db
    .prepare(
      `
      SELECT 1 FROM organization_memberships
      WHERE organization_id = ? AND user_id = ?
    `
    )
    .bind(invitation.organization_id, userId)
    .first();

  if (existingMembership) {
    throw new ValidationError('Already a member of this organization');
  }

  // Create membership and mark invitation accepted
  await db.batch([
    db
      .prepare(
        `
        INSERT INTO organization_memberships
          (id, organization_id, user_id, role, invited_by, accepted_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `
      )
      .bind(
        crypto.randomUUID(),
        invitation.organization_id,
        userId,
        invitation.role,
        invitation.invited_by
      ),
    db
      .prepare(
        `
        UPDATE organization_invitations
        SET accepted_at = datetime('now')
        WHERE id = ?
      `
      )
      .bind(invitation.id),
  ]);
}
```

## Member Removal

```typescript
export async function removeMember(
  db: D1Database,
  actorId: string,
  organizationId: string,
  targetUserId: string
): Promise<void> {
  // Get both memberships
  const [actorMembership, targetMembership] = await Promise.all([
    getOrgMembership(db, actorId, organizationId),
    getOrgMembership(db, targetUserId, organizationId),
  ]);

  if (!actorMembership) {
    throw new AuthorizationError('Not a member');
  }

  if (!targetMembership) {
    throw new NotFoundError('Target is not a member');
  }

  // Cannot remove yourself (use leave instead)
  if (actorId === targetUserId) {
    throw new ValidationError('Use leave to remove yourself');
  }

  // Cannot remove owner
  if (targetMembership.role === 'owner') {
    throw new AuthorizationError('Cannot remove organization owner');
  }

  // Must have higher role than target
  if (!canModifyMemberRole(actorId, actorMembership.role, targetUserId, targetMembership.role)) {
    throw new AuthorizationError('Cannot remove member with equal or higher role');
  }

  await db
    .prepare(
      `
      DELETE FROM organization_memberships
      WHERE organization_id = ? AND user_id = ?
    `
    )
    .bind(organizationId, targetUserId)
    .run();
}
```

## Self-Removal (Leave)

```typescript
export async function leaveOrganization(
  db: D1Database,
  userId: string,
  organizationId: string
): Promise<void> {
  const membership = await getOrgMembership(db, userId, organizationId);

  if (!membership) {
    throw new NotFoundError('Not a member');
  }

  // Owner cannot leave - must transfer first
  if (membership.role === 'owner') {
    throw new ValidationError('Owner cannot leave. Transfer ownership first.');
  }

  await db
    .prepare(
      `
      DELETE FROM organization_memberships
      WHERE organization_id = ? AND user_id = ?
    `
    )
    .bind(organizationId, userId)
    .run();
}
```

## Ownership Transfer

```typescript
export async function transferOwnership(
  db: D1Database,
  currentOwnerId: string,
  organizationId: string,
  newOwnerId: string
): Promise<void> {
  // Verify current owner
  const currentOwnerMembership = await getOrgMembership(db, currentOwnerId, organizationId);

  if (currentOwnerMembership?.role !== 'owner') {
    throw new AuthorizationError('Only the owner can transfer ownership');
  }

  // Verify new owner is a member
  const newOwnerMembership = await getOrgMembership(db, newOwnerId, organizationId);

  if (!newOwnerMembership) {
    throw new ValidationError('New owner must be an existing member');
  }

  if (newOwnerId === currentOwnerId) {
    throw new ValidationError('Already the owner');
  }

  // Transfer ownership atomically
  await db.batch([
    // Demote current owner to admin
    db
      .prepare(
        `
        UPDATE organization_memberships
        SET role = 'admin', updated_at = datetime('now')
        WHERE organization_id = ? AND user_id = ?
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

    // Update organizations table
    db
      .prepare(
        `
        UPDATE organizations
        SET owner_id = ?, updated_at = datetime('now')
        WHERE id = ?
      `
      )
      .bind(newOwnerId, organizationId),
  ]);
}
```

## Audit Events

```typescript
type MembershipEvent =
  | { type: 'member_invited'; email: string; role: OrgRole; invitedBy: string }
  | { type: 'member_joined'; userId: string; role: OrgRole }
  | { type: 'member_removed'; userId: string; removedBy: string }
  | { type: 'member_left'; userId: string }
  | { type: 'role_changed'; userId: string; oldRole: OrgRole; newRole: OrgRole; changedBy: string }
  | { type: 'ownership_transferred'; fromUserId: string; toUserId: string };

async function logMembershipEvent(
  kv: KVNamespace,
  organizationId: string,
  event: MembershipEvent
): Promise<void> {
  const key = `audit:membership:${organizationId}:${Date.now()}`;
  await kv.put(
    key,
    JSON.stringify({
      ...event,
      timestamp: new Date().toISOString(),
    }),
    {
      expirationTtl: 365 * 24 * 60 * 60, // 1 year
    }
  );
}
```

EOFMEM
