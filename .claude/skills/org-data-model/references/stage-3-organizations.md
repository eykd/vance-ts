# Stage 3: Organizations with Memberships

**Purpose**: Introduce organizational boundaries with role-based membership. Resources belong to organizations, not individual users.

## When to Use

Use this stage when:

- You need separate billing per customer/team
- Compliance requires data isolation between companies
- Users need global roles across all organization resources
- You want organization admins to manage their own members

## Schema

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

## Entity Relationship

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

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORGANIZATION ROLE HIERARCHY                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  owner ──────► Full control, can delete organization, transfer ownership   │
│    │                                                                        │
│    ▼                                                                        │
│  admin ──────► Manage members, manage all resources, change settings       │
│    │                                                                        │
│    ▼                                                                        │
│  member ─────► Create resources, edit own resources, view all resources    │
│    │                                                                        │
│    ▼                                                                        │
│  viewer ─────► View resources only, no create/edit                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Authorization

```typescript
// src/domain/authorization/OrganizationPolicy.ts

type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';

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

## Repository Pattern

```typescript
// src/infrastructure/repositories/OrganizationRepository.ts

export class OrganizationRepository {
  constructor(private db: D1Database) {}

  async create(input: CreateOrgInput, ownerId: string): Promise<Organization> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create organization
    await this.db
      .prepare(
        `
        INSERT INTO organizations (id, name, slug, owner_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      )
      .bind(id, input.name, input.slug, ownerId, now, now)
      .run();

    // Add owner as member with 'owner' role
    await this.db
      .prepare(
        `
        INSERT INTO organization_memberships (id, organization_id, user_id, role, accepted_at)
        VALUES (?, ?, ?, 'owner', ?)
      `
      )
      .bind(crypto.randomUUID(), id, ownerId, now)
      .run();

    return { id, name: input.name, slug: input.slug, ownerId, createdAt: now };
  }

  async findByUser(userId: string): Promise<OrganizationWithRole[]> {
    const result = await this.db
      .prepare(
        `
        SELECT o.*, om.role as user_role
        FROM organizations o
        JOIN organization_memberships om ON o.id = om.organization_id
        WHERE om.user_id = ?
        ORDER BY o.name
      `
      )
      .bind(userId)
      .all<OrgRow & { user_role: string }>();

    return result.results.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      userRole: row.user_role as OrgRole,
    }));
  }

  async getMembers(organizationId: string): Promise<Member[]> {
    const result = await this.db
      .prepare(
        `
        SELECT u.id, u.email, om.role, om.created_at as joined_at
        FROM organization_memberships om
        JOIN users u ON om.user_id = u.id
        WHERE om.organization_id = ?
        ORDER BY om.created_at
      `
      )
      .bind(organizationId)
      .all<MemberRow>();

    return result.results.map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role as OrgRole,
      joinedAt: row.joined_at,
    }));
  }
}
```

## Project Repository (Org-Scoped)

```typescript
// src/infrastructure/repositories/ProjectRepository.ts

export class ProjectRepository {
  constructor(private db: D1Database) {}

  /**
   * Find project by ID within organization.
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

## Signals to Evolve

| Signal                 | User Says                                      | Action    |
| ---------------------- | ---------------------------------------------- | --------- |
| Project-specific roles | "Some people should only see certain projects" | → Stage 4 |
| Complex permissions    | "Editors on Project A, viewers on Project B"   | → Stage 4 |
| Guest access           | "External clients need limited access"         | → Stage 4 |

## Advantages

- **Clear boundaries**: Billing, data, and access are organization-scoped
- **Simple authorization**: Role determines access to all org resources
- **Self-service**: Org admins manage their own members
- **Scalable**: Works well for most B2B SaaS applications

## Limitations

- All-or-nothing access within org (no per-resource permissions)
- Users have same role across all organization resources
- External collaborators require full membership
