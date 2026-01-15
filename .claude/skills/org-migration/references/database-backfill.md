# Database Backfill Migration

**Purpose**: One-time database migration to add organizations and backfill existing data.

## When to Use

Use this pattern when:

- Application is simple enough for maintenance window
- You can tolerate brief downtime
- You want clean, atomic migration
- Gradual rollout complexity isn't justified

## Complete Migration Script

```sql
-- migrations/0005_add_organizations_backfill.sql

-- ============================================
-- STEP 1: Add organization_id column (nullable for now)
-- ============================================
ALTER TABLE projects ADD COLUMN organization_id TEXT;

-- ============================================
-- STEP 2: Create organizations table
-- ============================================
CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL REFERENCES users(id),
    type TEXT DEFAULT 'personal',
    settings TEXT DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_type ON organizations(type);

-- ============================================
-- STEP 3: Create memberships table
-- ============================================
CREATE TABLE organization_memberships (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    invited_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    invited_at TEXT,
    accepted_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_memberships_org ON organization_memberships(organization_id);
CREATE INDEX idx_memberships_user ON organization_memberships(user_id);

-- ============================================
-- STEP 4: Backfill - Create personal org for each user with resources
-- ============================================
INSERT INTO organizations (id, name, slug, owner_id, type, created_at, updated_at)
SELECT
    'org-' || u.id,
    COALESCE(
        SUBSTR(u.email, 1, INSTR(u.email, '@') - 1) || '''s Workspace',
        'Personal Workspace'
    ),
    'personal-' || LOWER(HEX(RANDOMBLOB(4))),
    u.id,
    'personal',
    datetime('now'),
    datetime('now')
FROM users u
WHERE EXISTS (
    SELECT 1 FROM projects p WHERE p.owner_id = u.id
);

-- ============================================
-- STEP 5: Backfill - Add owner membership for each org
-- ============================================
INSERT INTO organization_memberships (id, organization_id, user_id, role, accepted_at, created_at, updated_at)
SELECT
    'mem-' || o.owner_id,
    o.id,
    o.owner_id,
    'owner',
    datetime('now'),
    datetime('now'),
    datetime('now')
FROM organizations o;

-- ============================================
-- STEP 6: Backfill - Assign projects to personal orgs
-- ============================================
UPDATE projects
SET organization_id = 'org-' || owner_id,
    updated_at = datetime('now')
WHERE organization_id IS NULL;

-- ============================================
-- STEP 7: Add index for organization lookups
-- ============================================
CREATE INDEX idx_projects_org ON projects(organization_id);

-- ============================================
-- STEP 8: Verify migration (run as separate check)
-- ============================================
-- SELECT COUNT(*) as projects_without_org
-- FROM projects
-- WHERE organization_id IS NULL;
-- Expected: 0

-- SELECT COUNT(*) as users_without_org
-- FROM users u
-- WHERE EXISTS (SELECT 1 FROM projects p WHERE p.owner_id = u.id)
--   AND NOT EXISTS (SELECT 1 FROM organization_memberships om WHERE om.user_id = u.id);
-- Expected: 0
```

## Migration Verification Script

```typescript
// scripts/verify-migration.ts

export async function verifyMigration(db: D1Database): Promise<{
  success: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  // Check 1: No projects without organization
  const orphanedProjects = await db
    .prepare('SELECT COUNT(*) as count FROM projects WHERE organization_id IS NULL')
    .first<{ count: number }>();

  if (orphanedProjects?.count && orphanedProjects.count > 0) {
    issues.push(`${orphanedProjects.count} projects without organization`);
  }

  // Check 2: All org owners are members
  const missingMemberships = await db
    .prepare(
      `
      SELECT COUNT(*) as count FROM organizations o
      WHERE NOT EXISTS (
        SELECT 1 FROM organization_memberships om
        WHERE om.organization_id = o.id AND om.user_id = o.owner_id
      )
    `
    )
    .first<{ count: number }>();

  if (missingMemberships?.count && missingMemberships.count > 0) {
    issues.push(`${missingMemberships.count} orgs missing owner membership`);
  }

  // Check 3: All users with resources have orgs
  const usersWithoutOrg = await db
    .prepare(
      `
      SELECT COUNT(DISTINCT u.id) as count FROM users u
      WHERE EXISTS (SELECT 1 FROM projects p WHERE p.owner_id = u.id)
        AND NOT EXISTS (
          SELECT 1 FROM organization_memberships om WHERE om.user_id = u.id
        )
    `
    )
    .first<{ count: number }>();

  if (usersWithoutOrg?.count && usersWithoutOrg.count > 0) {
    issues.push(`${usersWithoutOrg.count} users with resources but no org`);
  }

  return {
    success: issues.length === 0,
    issues,
  };
}
```

## Rollback Script

```sql
-- migrations/0005_rollback.sql
-- ONLY use if migration fails - this loses organization data!

-- Remove organization references from projects
UPDATE projects SET organization_id = NULL;

-- Drop new tables
DROP TABLE IF EXISTS organization_memberships;
DROP TABLE IF EXISTS organizations;

-- Remove column (SQLite doesn't support DROP COLUMN directly)
-- Would need to recreate table without the column
```

## TypeScript Rollback

```typescript
// scripts/rollback-migration.ts

export async function rollbackMigration(db: D1Database): Promise<void> {
  console.log('WARNING: This will delete all organization data!');

  await db.batch([
    db.prepare('UPDATE projects SET organization_id = NULL'),
    db.prepare('DROP TABLE IF EXISTS organization_memberships'),
    db.prepare('DROP TABLE IF EXISTS organizations'),
  ]);

  console.log('Rollback complete. organization_id column remains but is NULL.');
}
```

## Post-Migration Code Changes

```typescript
// Before migration - user-based queries
const projects = await db.prepare('SELECT * FROM projects WHERE owner_id = ?').bind(userId).all();

// After migration - get user's org first, then query by org
const membership = await db
  .prepare(
    `
    SELECT om.organization_id FROM organization_memberships om
    JOIN organizations o ON om.organization_id = o.id
    WHERE om.user_id = ? AND o.type = 'personal'
  `
  )
  .bind(userId)
  .first<{ organization_id: string }>();

const projects = await db
  .prepare('SELECT * FROM projects WHERE organization_id = ?')
  .bind(membership?.organization_id)
  .all();
```

## Migration Checklist

| Step | Action                   | Verification                   |
| ---- | ------------------------ | ------------------------------ |
| 1    | Backup database          | Backup exists and tested       |
| 2    | Enable maintenance mode  | Users see maintenance page     |
| 3    | Run migration script     | No SQL errors                  |
| 4    | Run verification script  | All checks pass                |
| 5    | Deploy new code          | Health checks pass             |
| 6    | Test key workflows       | Create/read/update/delete work |
| 7    | Disable maintenance mode | Users can access again         |
| 8    | Monitor for 24h          | No errors in logs              |

## Considerations

**Advantages:**

- Clean, atomic migration
- No dual code paths to maintain
- Simpler than gradual rollout

**Disadvantages:**

- Requires maintenance window
- No gradual rollout
- Harder to rollback after code changes
- All-or-nothing approach
