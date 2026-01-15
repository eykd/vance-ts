# Stage 4: Resource-Level Permissions Within Organizations

**Purpose**: Combine organizational boundaries with fine-grained per-resource permissions.

## When to Use

Use this stage when:

- Users need different roles on different resources within the same org
- External collaborators need access to specific projects only
- Complex permission models are required (e.g., project admins)
- Organization-level role isn't granular enough

## Schema

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

## Complete Data Model

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

## Permission Resolution

Access is granted by the **highest** applicable permission:

```
1. Organization Owner → Full access to everything
2. Organization Admin → Admin access to everything
3. Project-specific role → Applies to that project
4. Organization Member → Read + create own resources
5. Organization Viewer → Read-only
```

## Authorization

```typescript
// src/domain/authorization/ResourcePermissionPolicy.ts

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

export function canPerformProjectAction(access: EffectiveAccess, action: string): boolean {
  if (!access.hasAccess || !access.role) return false;

  const permissions: Record<string, string[]> = {
    owner: ['read', 'create', 'update', 'delete', 'invite', 'remove', 'admin'],
    admin: ['read', 'create', 'update', 'delete', 'invite', 'remove', 'admin'],
    editor: ['read', 'create', 'update'],
    member: ['read', 'create'], // Org members can create/read
    viewer: ['read'],
  };

  return permissions[access.role]?.includes(action) ?? false;
}
```

## Repository Pattern

```typescript
// src/infrastructure/repositories/ProjectMemberRepository.ts

export class ProjectMemberRepository {
  constructor(private db: D1Database) {}

  /**
   * Add member to project with specific role.
   */
  async addMember(
    projectId: string,
    userId: string,
    role: 'admin' | 'editor' | 'viewer'
  ): Promise<void> {
    // First verify user is org member (required for project access)
    const project = await this.db
      .prepare('SELECT organization_id FROM projects WHERE id = ?')
      .bind(projectId)
      .first<{ organization_id: string }>();

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const orgMembership = await this.db
      .prepare(
        `
        SELECT 1 FROM organization_memberships
        WHERE organization_id = ? AND user_id = ?
      `
      )
      .bind(project.organization_id, userId)
      .first();

    if (!orgMembership) {
      throw new ValidationError('User must be organization member');
    }

    await this.db
      .prepare(
        `
        INSERT INTO project_members (id, project_id, user_id, role)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (project_id, user_id) DO UPDATE SET role = ?
      `
      )
      .bind(crypto.randomUUID(), projectId, userId, role, role)
      .run();
  }

  /**
   * Remove member from project (reverts to org-level access).
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?')
      .bind(projectId, userId)
      .run();
  }

  /**
   * List all project members with their roles.
   */
  async listMembers(projectId: string): Promise<ProjectMember[]> {
    const result = await this.db
      .prepare(
        `
        SELECT u.id, u.email, pm.role, pm.created_at
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = ?
        ORDER BY pm.created_at
      `
      )
      .bind(projectId)
      .all<{ id: string; email: string; role: string; created_at: string }>();

    return result.results.map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role as 'admin' | 'editor' | 'viewer',
      addedAt: row.created_at,
    }));
  }
}
```

## Use Cases

### 1. Grant Project Admin to Org Member

```typescript
// Org member needs admin access to specific project
await projectMemberRepo.addMember(projectId, userId, 'admin');
```

### 2. Restrict Viewer to Specific Projects

```typescript
// Org viewer should only see certain projects
// Don't add to project_members - they use org viewer role
// For explicit restriction, you'd need a deny list (not covered here)
```

### 3. External Collaborator Pattern

```typescript
// Add to org as viewer, then grant project-specific access
await orgRepo.addMember(orgId, externalUserId, 'viewer');
await projectMemberRepo.addMember(projectId, externalUserId, 'editor');
```

## Permission Matrix

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

## Advantages

- **Flexibility**: Per-project permissions within org context
- **External collaboration**: Invite guests to specific projects
- **Least privilege**: Users only get access they need
- **Audit trail**: Clear record of who has access to what

## Limitations

- **Complexity**: More tables and queries to manage
- **Performance**: Multiple lookups to resolve access
- **UX challenge**: Users may be confused by layered permissions
- **Admin overhead**: More granular = more to manage
