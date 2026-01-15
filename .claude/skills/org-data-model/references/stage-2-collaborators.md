# Stage 2: Resource-Level Sharing (Collaborators)

**Purpose**: Allow users to share individual resources with others without global teams or organizations.

## When to Use

Use this stage when:

- Users need to share specific resources (not everything)
- You don't need organizational boundaries (billing, compliance)
- Sharing is resource-specific, not global
- You want to avoid the complexity of full multi-tenancy

## Schema

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

## Entity Relationship

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

## Role Hierarchy

```
owner (implicit via owner_id)
   │
   ├── admin: Full control except ownership transfer
   │
   ├── editor: Create, read, update content
   │
   └── viewer: Read-only access
```

## Authorization

```typescript
// src/domain/authorization/CollaboratorPolicy.ts

type ProjectRole = 'owner' | 'admin' | 'editor' | 'viewer';

interface ProjectAccess {
  hasAccess: boolean;
  role: ProjectRole | null;
}

export async function getProjectAccess(
  db: D1Database,
  userId: string,
  projectId: string
): Promise<ProjectAccess> {
  // Check ownership first (highest privilege)
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

export function canPerformAction(role: ProjectRole | null, action: string): boolean {
  if (!role) return false;

  const permissions: Record<ProjectRole, string[]> = {
    owner: ['read', 'create', 'update', 'delete', 'invite', 'remove', 'transfer'],
    admin: ['read', 'create', 'update', 'delete', 'invite', 'remove'],
    editor: ['read', 'create', 'update'],
    viewer: ['read'],
  };

  return permissions[role]?.includes(action) ?? false;
}
```

## Repository Pattern

```typescript
// src/infrastructure/repositories/ProjectRepository.ts

export class ProjectRepository {
  constructor(private db: D1Database) {}

  /**
   * Find project if user has access (owner or collaborator).
   */
  async findById(userId: string, projectId: string): Promise<Project | null> {
    const row = await this.db
      .prepare(
        `
        SELECT p.* FROM projects p
        WHERE p.id = ?
        AND (
          p.owner_id = ?
          OR EXISTS (
            SELECT 1 FROM project_collaborators pc
            WHERE pc.project_id = p.id AND pc.user_id = ?
          )
        )
      `
      )
      .bind(projectId, userId, userId)
      .first<ProjectRow>();

    return row ? this.toProject(row) : null;
  }

  /**
   * List all projects user has access to.
   */
  async listAccessible(userId: string): Promise<ProjectWithRole[]> {
    const result = await this.db
      .prepare(
        `
        SELECT p.*,
          CASE
            WHEN p.owner_id = ? THEN 'owner'
            ELSE pc.role
          END as user_role
        FROM projects p
        LEFT JOIN project_collaborators pc ON p.id = pc.project_id AND pc.user_id = ?
        WHERE p.owner_id = ? OR pc.user_id IS NOT NULL
        ORDER BY p.created_at DESC
      `
      )
      .bind(userId, userId, userId)
      .all<ProjectRow & { user_role: string }>();

    return result.results.map((row) => ({
      ...this.toProject(row),
      userRole: row.user_role as ProjectRole,
    }));
  }

  /**
   * Add a collaborator to a project.
   */
  async addCollaborator(
    projectId: string,
    userId: string,
    role: 'viewer' | 'editor' | 'admin',
    invitedBy: string
  ): Promise<void> {
    await this.db
      .prepare(
        `
        INSERT INTO project_collaborators (id, project_id, user_id, role, invited_by)
        VALUES (?, ?, ?, ?, ?)
      `
      )
      .bind(crypto.randomUUID(), projectId, userId, role, invitedBy)
      .run();
  }

  /**
   * Remove a collaborator from a project.
   */
  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM project_collaborators WHERE project_id = ? AND user_id = ?')
      .bind(projectId, userId)
      .run();
  }

  /**
   * Update a collaborator's role.
   */
  async updateCollaboratorRole(
    projectId: string,
    userId: string,
    role: 'viewer' | 'editor' | 'admin'
  ): Promise<void> {
    await this.db
      .prepare(
        `
        UPDATE project_collaborators
        SET role = ?
        WHERE project_id = ? AND user_id = ?
      `
      )
      .bind(role, projectId, userId)
      .run();
  }
}
```

## Handler Example

```typescript
// src/presentation/handlers/CollaboratorHandlers.ts

export async function handleInviteCollaborator(c: Context): Promise<Response> {
  const userId = c.get('session').userId;
  const projectId = c.req.param('projectId');
  const { email, role } = await c.req.json<{ email: string; role: string }>();

  // Verify inviter has permission
  const access = await getProjectAccess(c.env.DB, userId, projectId);
  if (!canPerformAction(access.role, 'invite')) {
    return c.text('Forbidden', 403);
  }

  // Find user by email
  const invitee = await findUserByEmail(c.env.DB, email);
  if (!invitee) {
    return c.text('User not found', 404);
  }

  // Add as collaborator
  await repo.addCollaborator(projectId, invitee.id, role, userId);

  return c.json({ success: true });
}
```

## Signals to Evolve

| Signal                    | User Says                                   | Action    |
| ------------------------- | ------------------------------------------- | --------- |
| Organizational boundaries | "We need separate billing per team"         | → Stage 3 |
| Global roles              | "All my projects should have the same team" | → Stage 3 |
| Compliance requirements   | "Data must be isolated by company"          | → Stage 3 |

## Advantages

- **Flexibility**: Per-resource sharing, not all-or-nothing
- **Simplicity**: No organization overhead
- **Gradual rollout**: Can share one project without affecting others
- **User control**: Resource owners control who has access

## Limitations

- No global team concept (must invite per resource)
- No organizational billing boundaries
- No tenant isolation guarantees
- Managing many collaborators can be tedious
