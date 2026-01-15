# Shadow Organizations

**Purpose**: Create personal organizations transparently for each user, enabling multi-tenancy without disrupting existing users.

## When to Use

Use this pattern when:

- You want a zero-friction migration experience
- Users shouldn't see "organizations" until they invite someone
- You need to maintain backward compatibility
- You want gradual transition to team features

## Core Pattern

```typescript
// src/application/services/OrganizationMigration.ts

/**
 * Ensure every user has a personal organization.
 * This is created transparently - users don't see it
 * until they invite someone.
 */
export async function ensureUserHasOrganization(
  db: D1Database,
  userId: string
): Promise<Organization> {
  // Check for existing personal org
  const existing = await db
    .prepare(
      `
      SELECT o.* FROM organizations o
      JOIN organization_memberships om ON o.id = om.organization_id
      WHERE om.user_id = ? AND o.type = 'personal'
    `
    )
    .bind(userId)
    .first<OrganizationRow>();

  if (existing) {
    return toOrganization(existing);
  }

  // Get user details
  const user = await db
    .prepare('SELECT id, email FROM users WHERE id = ?')
    .bind(userId)
    .first<{ id: string; email: string }>();

  if (!user) {
    throw new Error('User not found');
  }

  // Create personal organization
  const orgId = crypto.randomUUID();
  const slug = generateSlug(user.email);

  await db.batch([
    db
      .prepare(
        `
        INSERT INTO organizations (id, name, slug, owner_id, type, created_at)
        VALUES (?, ?, ?, ?, 'personal', datetime('now'))
      `
      )
      .bind(orgId, `${user.email}'s Workspace`, slug, userId),

    db
      .prepare(
        `
        INSERT INTO organization_memberships (id, organization_id, user_id, role, created_at)
        VALUES (?, ?, ?, 'owner', datetime('now'))
      `
      )
      .bind(crypto.randomUUID(), orgId, userId),
  ]);

  return {
    id: orgId,
    name: `${user.email}'s Workspace`,
    slug,
    ownerId: userId,
    type: 'personal',
    createdAt: new Date(),
  };
}

function generateSlug(email: string): string {
  const base = email.split('@')[0] || 'user';
  const sanitized = base.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const random = crypto.randomUUID().slice(0, 8);
  return `${sanitized}-${random}`;
}
```

## Migrate Existing Resources

```typescript
/**
 * Move user's existing resources to their personal org.
 * Call this after ensureUserHasOrganization.
 */
export async function migrateUserResourcesToOrg(db: D1Database, userId: string): Promise<void> {
  const org = await ensureUserHasOrganization(db, userId);

  // Update all user's projects to belong to their personal org
  await db
    .prepare(
      `
      UPDATE projects
      SET organization_id = ?, updated_at = datetime('now')
      WHERE owner_id = ? AND organization_id IS NULL
    `
    )
    .bind(org.id, userId)
    .run();

  // Update other resources similarly...
}
```

## Integration in Request Handler

```typescript
// src/presentation/middleware/organizationContext.ts

export function organizationContextMiddleware() {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const session = c.get('session');

    if (!session) {
      return c.redirect('/auth/login');
    }

    // Ensure user has organization (creates if needed)
    const org = await ensureUserHasOrganization(c.env.DB, session.userId);

    // Migrate resources if needed
    await migrateUserResourcesToOrg(c.env.DB, session.userId);

    // Set organization context
    c.set('organization', org);

    await next();
  });
}
```

## Handler Updates

```typescript
// Before: User-based queries
const projects = await db.prepare('SELECT * FROM projects WHERE owner_id = ?').bind(userId).all();

// After: Organization-based queries
const org = c.get('organization');
const projects = await db
  .prepare('SELECT * FROM projects WHERE organization_id = ?')
  .bind(org.id)
  .all();
```

## UI Considerations

```typescript
// Show "invite team" instead of "create organization"
function getTeamActionText(org: Organization): string {
  if (org.type === 'personal') {
    return 'Invite your team'; // Creates team feel
  }
  return 'Manage team';
}

// Only show organization switcher if user has multiple orgs
function shouldShowOrgSwitcher(orgs: Organization[]): boolean {
  return orgs.length > 1;
}

// Personal orgs can be "upgraded" to team orgs
async function convertToTeamOrg(db: D1Database, orgId: string, newName: string): Promise<void> {
  await db
    .prepare(
      `
      UPDATE organizations
      SET name = ?, type = 'team', updated_at = datetime('now')
      WHERE id = ? AND type = 'personal'
    `
    )
    .bind(newName, orgId)
    .run();
}
```

## Schema Changes

```sql
-- Add type column to distinguish personal vs team orgs
ALTER TABLE organizations ADD COLUMN type TEXT DEFAULT 'personal';

-- Index for quick personal org lookup
CREATE INDEX idx_orgs_owner_type ON organizations(owner_id, type);
```

## Advantages

- **Zero friction**: Users don't need to "set up" anything
- **Backward compatible**: Old features keep working
- **Natural progression**: Solo → Team is seamless
- **Easy rollback**: Just ignore organization_id

## Migration Timeline

1. **Day 1**: Deploy shadow org creation code
2. **Day 2-7**: All active users get personal orgs created
3. **Day 8**: Enable "invite team" UI for early adopters
4. **Day 15**: General availability of team features
5. **Day 30**: Deprecate legacy user-based queries
