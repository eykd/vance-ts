# Multi-Tenant SaaS Database Schema

This document describes the database schema evolution across four stages, from single-user ownership to full multi-tenant organizations with resource-level permissions.

## Evolution Stages

The schema evolves through four distinct stages, each adding complexity to support more sophisticated use cases:

1. **Stage 1: Single User** - Simplest model, each resource belongs to one user
2. **Stage 2: Collaborators** - Per-resource sharing without organizations
3. **Stage 3: Organizations** - Organizational boundaries with role-based membership
4. **Stage 4: Resource Permissions** - Fine-grained permissions within organizations

## Stage 1: Single User

The simplest data model where each resource belongs to exactly one user.

### When to Use

- Building an MVP or early-stage product
- Users don't need to share data with others
- Complexity of multi-tenancy isn't justified yet
- You want the simplest possible authorization model

### Schema

```sql
-- migrations/0001_single_user.sql

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    email_normalized TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
```

### Entity Relationship

```
┌──────────────┐         ┌──────────────┐
│    users     │         │   projects   │
├──────────────┤         ├──────────────┤
│ id           │◄────────│ owner_id     │
│ email        │         │ id           │
│ password_hash│         │ name         │
│ created_at   │         │ description  │
└──────────────┘         └──────────────┘
```

### Authorization Pattern

```typescript
function canAccessProject(userId: string, project: Project): boolean {
  return project.ownerId === userId;
}

// Usage in repository
async function getProject(
  db: D1Database,
  userId: string,
  projectId: string
): Promise<Project | null> {
  return db
    .prepare('SELECT * FROM projects WHERE id = ? AND owner_id = ?')
    .bind(projectId, userId)
    .first<Project>();
}
```

### Advantages

- **Simplicity**: Single query pattern for all access checks
- **Performance**: Simple indexed lookups
- **Security**: Clear ownership, no complex permission logic
- **Maintenance**: Minimal code to maintain

### Signals to Evolve to Stage 2

| Signal             | User Says                                | Action               |
| ------------------ | ---------------------------------------- | -------------------- |
| Sharing needed     | "Can I share this with a colleague?"     | → Stage 2            |
| Team collaboration | "My team needs to work on this together" | → Stage 2 or 3       |
| Role differences   | "I want them to view but not edit"       | → Stage 2 with roles |

## Stage 2: Resource-Level Sharing (Collaborators)

Allow users to share individual resources with others without global teams or organizations.

### When to Use

- Users need to share specific resources (not everything)
- You don't need organizational boundaries (billing, compliance)
- Sharing is resource-specific, not global
- You want to avoid the complexity of full multi-tenancy

### Schema

```sql
-- migrations/0002_collaborators.sql

-- Add collaborators to projects (extends Stage 1)
CREATE TABLE project_collaborators (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')),
    invited_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_collabs_project ON project_collaborators(project_id);
CREATE INDEX idx_project_collabs_user ON project_collaborators(user_id);
```

### Entity Relationship

```
┌──────────────┐         ┌──────────────┐         ┌──────────────────────┐
│    users     │         │   projects   │         │ project_collaborators│
├──────────────┤         ├──────────────┤         ├──────────────────────┤
│ id           │◄────────│ owner_id     │         │ id                   │
│ email        │         │ id           │◄────────│ project_id           │
│ ...          │◄────────┼──────────────┼─────────│ user_id              │
└──────────────┘         │ name         │         │ role                 │
                         │ description  │         │ invited_by           │
                         └──────────────┘         └──────────────────────┘
```

### Role Hierarchy

```
owner (implicit via owner_id)
   │
   ├── admin: Full control except ownership transfer
   │
   ├── editor: Create, read, update content
   │
   └── viewer: Read-only access
```

### Authorization Pattern

```typescript
export async function getProjectAccess(
  db: D1Database,
  userId: string,
  projectId: string
): Promise<{ hasAccess: boolean; role: ProjectRole | null }> {
  // Check ownership first
  const project = await db
    .prepare('SELECT owner_id FROM projects WHERE id = ?')
    .bind(projectId)
    .first<{ owner_id: string }>();

  if (!project) {
    return { hasAccess: false, role: null };
  }

  if (project.owner_id === userId) {
    return { hasAccess: true, role: 'owner' };
  }

  // Check collaboration
  const collab = await db
    .prepare('SELECT role FROM project_collaborators WHERE project_id = ? AND user_id = ?')
    .bind(projectId, userId)
    .first<{ role: string }>();

  if (collab) {
    return { hasAccess: true, role: collab.role as ProjectRole };
  }

  return { hasAccess: false, role: null };
}
```

### Advantages

- **Flexibility**: Per-resource sharing, not all-or-nothing
- **Simplicity**: No organization overhead
- **Gradual rollout**: Can share one project without affecting others
- **User control**: Resource owners control who has access

### Signals to Evolve to Stage 3

| Signal                    | User Says                                   | Action    |
| ------------------------- | ------------------------------------------- | --------- |
| Organizational boundaries | "We need separate billing per team"         | → Stage 3 |
| Global roles              | "All my projects should have the same team" | → Stage 3 |
| Compliance requirements   | "Data must be isolated by company"          | → Stage 3 |

## Stage 3: Organizations with Memberships

Introduce organizational boundaries with role-based membership. Resources belong to organizations, not individual users.

### When to Use

- You need separate billing per customer/team
- Compliance requires data isolation between companies
- Users need global roles across all organization resources
- You want organization admins to manage their own members

### Schema

```sql
-- migrations/0003_organizations.sql

-- Organizations table
CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL REFERENCES users(id),
    settings TEXT DEFAULT '{}',  -- JSON for flexible settings
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_orgs_owner ON organizations(owner_id);
CREATE INDEX idx_orgs_slug ON organizations(slug);

-- Organization memberships
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

-- Migrate projects to belong to organizations
ALTER TABLE projects ADD COLUMN organization_id TEXT REFERENCES organizations(id);
CREATE INDEX idx_projects_org ON projects(organization_id);

-- Note: owner_id on projects now represents "created by" rather than ownership
-- The organization owns the project
```

### Entity Relationship

```
┌──────────────┐         ┌─────────────────────┐         ┌──────────────┐
│    users     │         │   organizations     │         │   projects   │
├──────────────┤         ├─────────────────────┤         ├──────────────┤
│ id           │◄───┐    │ id                  │◄───┐    │ id           │
│ email        │    │    │ name                │    │    │ name         │
│ ...          │    │    │ slug                │    │    │ description  │
└──────────────┘    │    │ owner_id ───────────┼────┘    │ org_id ──────┼───┐
       ▲            │    │ settings            │         │ created_by   │   │
       │            │    └─────────────────────┘         └──────────────┘   │
       │            │              ▲                                        │
       │            │              │                                        │
       │            │    ┌─────────┴─────────┐                              │
       │            │    │ org_memberships   │                              │
       │            │    ├───────────────────┤                              │
       │            └────┤ user_id           │                              │
       │                 │ organization_id ──┼──────────────────────────────┘
       └─────────────────┤ role              │
                         │ invited_by        │
                         └───────────────────┘
```

### Authorization Pattern

```typescript
export async function getOrgMembership(
  db: D1Database,
  userId: string,
  organizationId: string
): Promise<{ role: OrgRole } | null> {
  return db
    .prepare(
      `
      SELECT role FROM organization_memberships
      WHERE organization_id = ? AND user_id = ?
    `
    )
    .bind(organizationId, userId)
    .first<{ role: OrgRole }>();
}

export function canPerformOrgAction(role: OrgRole | null, action: string): boolean {
  if (!role) return false;

  const permissions: Record<OrgRole, string[]> = {
    owner: ['read', 'create', 'update', 'delete', 'invite', 'remove', 'transfer', 'admin'],
    admin: ['read', 'create', 'update', 'delete', 'invite', 'remove', 'admin'],
    member: ['read', 'create', 'update'], // Can only update own resources
    viewer: ['read'],
  };

  return permissions[role]?.includes(action) ?? false;
}
```

### Project Repository (Org-Scoped)

```typescript
export class ProjectRepository {
  constructor(private db: D1Database) {}

  /**
   * Find project by ID within organization.
   * CRITICAL: Always include organization_id to prevent cross-tenant access.
   */
  async findById(organizationId: string, projectId: string): Promise<Project | null> {
    return this.db
      .prepare('SELECT * FROM projects WHERE id = ? AND organization_id = ?')
      .bind(projectId, organizationId)
      .first<Project>();
  }

  /**
   * List all projects in organization.
   */
  async list(organizationId: string): Promise<Project[]> {
    const result = await this.db
      .prepare('SELECT * FROM projects WHERE organization_id = ? ORDER BY created_at DESC')
      .bind(organizationId)
      .all<Project>();

    return result.results;
  }

  /**
   * Create project in organization.
   */
  async create(
    organizationId: string,
    createdBy: string,
    input: CreateProjectInput
  ): Promise<Project> {
    const id = crypto.randomUUID();

    await this.db
      .prepare(
        `
        INSERT INTO projects (id, organization_id, owner_id, name, description, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `
      )
      .bind(id, organizationId, createdBy, input.name, input.description)
      .run();

    return { id, organizationId, ownerId: createdBy, ...input };
  }
}
```

### Advantages

- **Clear boundaries**: Billing, data, and access are organization-scoped
- **Simple authorization**: Role determines access to all org resources
- **Self-service**: Org admins manage their own members
- **Scalable**: Works well for most B2B SaaS applications

### Signals to Evolve to Stage 4

| Signal                 | User Says                                      | Action    |
| ---------------------- | ---------------------------------------------- | --------- |
| Project-specific roles | "Some people should only see certain projects" | → Stage 4 |
| Complex permissions    | "Editors on Project A, viewers on Project B"   | → Stage 4 |
| Guest access           | "External clients need limited access"         | → Stage 4 |

## Stage 4: Resource-Level Permissions Within Organizations

Combine organizational boundaries with fine-grained per-resource permissions.

### When to Use

- Users need different roles on different resources within the same org
- External collaborators need access to specific projects only
- Complex permission models are required (e.g., project admins)
- Organization-level role isn't granular enough

### Schema

```sql
-- migrations/0004_resource_permissions.sql

-- Project-level members (within org context)
-- This allows org members to have elevated access to specific projects
CREATE TABLE project_members (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
```

### Complete Data Model

```
┌──────────────┐         ┌─────────────────────┐         ┌──────────────┐
│    users     │         │   organizations     │         │   projects   │
├──────────────┤         ├─────────────────────┤         ├──────────────┤
│ id           │◄───┐    │ id                  │◄───┐    │ id           │
│ email        │    │    │ name                │    │    │ name         │
│ ...          │    │    │ slug                │    │    │ org_id ──────┼───┐
└──────────────┘    │    │ owner_id ───────────┼────┘    │ created_by   │   │
       ▲            │    └─────────────────────┘         └──────────────┘   │
       │            │              ▲                            ▲           │
       │            │              │                            │           │
       │            │    ┌─────────┴─────────┐        ┌─────────┴────────┐ │
       │            │    │ org_memberships   │        │ project_members  │ │
       │            │    ├───────────────────┤        ├──────────────────┤ │
       │            └────┤ user_id           │   ┌────┤ user_id          │ │
       │                 │ organization_id ──┼───┘    │ project_id ──────┼─┘
       └─────────────────┤ role              │        │ role             │
                         └───────────────────┘        └──────────────────┘
```

### Permission Resolution

Access is granted by the **highest** applicable permission:

```
1. Organization Owner → Full access to everything
2. Organization Admin → Admin access to everything
3. Project-specific role → Applies to that project
4. Organization Member → Read + create own resources
5. Organization Viewer → Read-only
```

### Authorization Pattern

```typescript
interface EffectiveAccess {
  hasAccess: boolean;
  role: string | null;
  source: 'org_owner' | 'org_admin' | 'project_member' | 'org_member' | 'org_viewer' | null;
}

export async function getProjectAccess(
  db: D1Database,
  userId: string,
  projectId: string
): Promise<EffectiveAccess> {
  // Get project with org info
  const project = await db
    .prepare('SELECT organization_id FROM projects WHERE id = ?')
    .bind(projectId)
    .first<{ organization_id: string }>();

  if (!project) {
    return { hasAccess: false, role: null, source: null };
  }

  // Check org membership
  const orgMembership = await db
    .prepare(
      `
      SELECT role FROM organization_memberships
      WHERE organization_id = ? AND user_id = ?
    `
    )
    .bind(project.organization_id, userId)
    .first<{ role: string }>();

  if (!orgMembership) {
    return { hasAccess: false, role: null, source: null };
  }

  // Org owners and admins have full access
  if (orgMembership.role === 'owner') {
    return { hasAccess: true, role: 'owner', source: 'org_owner' };
  }

  if (orgMembership.role === 'admin') {
    return { hasAccess: true, role: 'admin', source: 'org_admin' };
  }

  // Check project-specific membership
  const projectMembership = await db
    .prepare(
      `
      SELECT role FROM project_members
      WHERE project_id = ? AND user_id = ?
    `
    )
    .bind(projectId, userId)
    .first<{ role: string }>();

  if (projectMembership) {
    return {
      hasAccess: true,
      role: projectMembership.role,
      source: 'project_member',
    };
  }

  // Fall back to org role
  if (orgMembership.role === 'member') {
    return { hasAccess: true, role: 'member', source: 'org_member' };
  }

  if (orgMembership.role === 'viewer') {
    return { hasAccess: true, role: 'viewer', source: 'org_viewer' };
  }

  return { hasAccess: false, role: null, source: null };
}
```

### Permission Matrix

| Org Role | Project Role | Effective Access  |
| -------- | ------------ | ----------------- |
| owner    | -            | Full admin        |
| admin    | -            | Full admin        |
| member   | admin        | Project admin     |
| member   | editor       | Project editor    |
| member   | viewer       | Project viewer    |
| member   | -            | Read + create own |
| viewer   | admin        | Project admin     |
| viewer   | editor       | Project editor    |
| viewer   | -            | Read only         |

### Use Cases

#### 1. Grant Project Admin to Org Member

```typescript
// Org member needs admin access to specific project
await projectMemberRepo.addMember(projectId, userId, 'admin');
```

#### 2. External Collaborator Pattern

```typescript
// Add to org as viewer, then grant project-specific access
await orgRepo.addMember(orgId, externalUserId, 'viewer');
await projectMemberRepo.addMember(projectId, externalUserId, 'editor');
```

### Advantages

- **Flexibility**: Per-project permissions within org context
- **External collaboration**: Invite guests to specific projects
- **Least privilege**: Users only get access they need
- **Audit trail**: Clear record of who has access to what

### Limitations

- **Complexity**: More tables and queries to manage
- **Performance**: Multiple lookups to resolve access
- **UX challenge**: Users may be confused by layered permissions
- **Admin overhead**: More granular = more to manage

## Index Strategy

### Critical Indexes

All stages require efficient queries for authorization checks:

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email_normalized);

-- Ownership lookups (Stage 1-2)
CREATE INDEX idx_projects_owner ON projects(owner_id);

-- Collaboration lookups (Stage 2)
CREATE INDEX idx_project_collabs_project ON project_collaborators(project_id);
CREATE INDEX idx_project_collabs_user ON project_collaborators(user_id);

-- Organization lookups (Stage 3-4)
CREATE INDEX idx_orgs_owner ON organizations(owner_id);
CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_memberships_org ON organization_memberships(organization_id);
CREATE INDEX idx_memberships_user ON organization_memberships(user_id);
CREATE INDEX idx_projects_org ON projects(organization_id);

-- Resource permissions (Stage 4)
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
```

### Composite Indexes

For common query patterns:

```sql
-- Fast lookup: "Get user's role in organization"
CREATE INDEX idx_memberships_user_org ON organization_memberships(user_id, organization_id);

-- Fast lookup: "Get user's role on project"
CREATE INDEX idx_project_members_user_proj ON project_members(user_id, project_id);
```
