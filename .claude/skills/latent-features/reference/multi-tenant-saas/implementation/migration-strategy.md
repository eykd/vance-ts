# data-model-evolution.md content

cat >> .claude/skills/latent-features/reference/multi-tenant-saas/implementation/data-model-evolution.md << 'EOFDM'

# Data Model Evolution

**Purpose**: Guide for evolving data models from single-user to enterprise multi-tenancy, including stage selection and migration patterns.

## Stage Overview

| Stage             | Description                  | When to Use                  |
| ----------------- | ---------------------------- | ---------------------------- |
| 1. Single User    | User owns resources directly | Solo users, no sharing       |
| 2. Collaborators  | Per-resource sharing         | Sharing without global roles |
| 3. Organizations  | Org memberships with roles   | Teams, billing boundaries    |
| 4. Resource Perms | Fine-grained within orgs     | Complex permission models    |

## Stage 1: Single User

**Schema:**

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
```

**Authorization:**

```typescript
// Simple: user can access if they own it
SELECT * FROM projects WHERE owner_id = ?
```

**Evolution Signals:**

- "Can I share this with a colleague?" → Stage 2
- "My team needs to work together" → Stage 2 or 3

## Stage 2: Collaborators

**Schema Addition:**

```sql
CREATE TABLE project_collaborators (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')),
    invited_by TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(project_id, user_id)
);
```

**Authorization:**

```typescript
// Owner or collaborator can access
SELECT p.* FROM projects p
WHERE p.id = ?
AND (
  p.owner_id = ?
  OR EXISTS (
    SELECT 1 FROM project_collaborators pc
    WHERE pc.project_id = p.id AND pc.user_id = ?
  )
)
```

**Evolution Signals:**

- "Separate billing per team" → Stage 3
- "All projects should have same team" → Stage 3
- "Data must be isolated by company" → Stage 3

## Stage 3: Organizations

**Schema Addition:**

```sql
CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE organization_memberships (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(organization_id, user_id)
);

-- Migrate projects to organizations
ALTER TABLE projects ADD COLUMN organization_id TEXT REFERENCES organizations(id);
CREATE INDEX idx_projects_org ON projects(organization_id);
```

**Authorization:**

```typescript
// Organization-scoped
SELECT * FROM projects WHERE organization_id = ?
```

**Evolution Signals:**

- "Different access per project" → Stage 4
- "External collaborators need limited access" → Stage 4

## Stage 4: Resource-Level Permissions

**Schema Addition:**

```sql
CREATE TABLE project_members (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(project_id, user_id)
);
```

**Permission Resolution (highest wins):**

1. Organization Owner → Full access
2. Organization Admin → Admin access
3. Project-specific role → Applies to that project
4. Organization Member → Read + create
5. Organization Viewer → Read-only

## Migration Patterns

### Stage 1 to Stage 2

```typescript
// No schema changes to existing tables
// Just add collaborators table
// Existing queries still work
```

### Stage 2 to Stage 3

```sql
-- Add organization_id to projects
ALTER TABLE projects ADD COLUMN organization_id TEXT;

-- Create personal orgs for existing users
INSERT INTO organizations (id, name, slug, owner_id, type)
SELECT
  'org-' || id,
  email || '''s Workspace',
  'personal-' || SUBSTR(id, 1, 8),
  id,
  'personal'
FROM users
WHERE EXISTS (SELECT 1 FROM projects WHERE owner_id = users.id);

-- Assign projects to personal orgs
UPDATE projects
SET organization_id = 'org-' || owner_id
WHERE organization_id IS NULL;
```

### Stage 3 to Stage 4

```typescript
// Add project_members table
// Existing org-level access still works
// Project-level grants are additive
```

## Decision Tree

**Q1: Do multiple humans need to access the same data?**

- No → Stage 1
- Yes → Q2

**Q2: Do they need different access levels?**

- No → Stage 2
- Yes → Q3

**Q3: Do you need organizational boundaries (billing, compliance)?**

- No → Stage 4
- Yes → Stage 3

## Cross-References

- **migration-strategy.md**: Detailed migration implementation
- **tenant-isolation.md**: Isolation patterns for Stage 3+
- **authorization-service.md**: Authorization for each stage
  EOFDM
