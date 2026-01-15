# Stage 1: Single User

**Purpose**: The simplest data model where each resource belongs to exactly one user.

## When to Use

Use this stage when:

- Building an MVP or early-stage product
- Users don't need to share data with others
- Complexity of multi-tenancy isn't justified yet
- You want the simplest possible authorization model

## Schema

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

## Entity Relationship

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

## Authorization

Authorization is simple: user can access a resource if they own it.

```typescript
// src/domain/authorization/SingleUserPolicy.ts

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

// Usage in handler
async function handleGetProject(c: Context): Promise<Response> {
  const userId = c.get('session').userId;
  const projectId = c.req.param('id');

  const project = await getProject(c.env.DB, userId, projectId);

  if (!project) {
    return c.text('Not found', 404);
  }

  return c.json(project);
}
```

## Repository Pattern

```typescript
// src/infrastructure/repositories/ProjectRepository.ts

export class ProjectRepository {
  constructor(private db: D1Database) {}

  async findById(userId: string, id: string): Promise<Project | null> {
    const row = await this.db
      .prepare('SELECT * FROM projects WHERE id = ? AND owner_id = ?')
      .bind(id, userId)
      .first<ProjectRow>();

    return row ? this.toProject(row) : null;
  }

  async listByOwner(userId: string): Promise<Project[]> {
    const result = await this.db
      .prepare('SELECT * FROM projects WHERE owner_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all<ProjectRow>();

    return result.results.map(this.toProject);
  }

  async create(userId: string, input: CreateProjectInput): Promise<Project> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `
        INSERT INTO projects (id, owner_id, name, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      )
      .bind(id, userId, input.name, input.description || null, now, now)
      .run();

    return {
      id,
      ownerId: userId,
      name: input.name,
      description: input.description,
      createdAt: now,
      updatedAt: now,
    };
  }

  async update(userId: string, id: string, input: UpdateProjectInput): Promise<void> {
    const result = await this.db
      .prepare(
        `
        UPDATE projects
        SET name = ?, description = ?, updated_at = datetime('now')
        WHERE id = ? AND owner_id = ?
      `
      )
      .bind(input.name, input.description, id, userId)
      .run();

    if (result.meta.changes === 0) {
      throw new NotFoundError('Project not found');
    }
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.db
      .prepare('DELETE FROM projects WHERE id = ? AND owner_id = ?')
      .bind(id, userId)
      .run();

    if (result.meta.changes === 0) {
      throw new NotFoundError('Project not found');
    }
  }

  private toProject(row: ProjectRow): Project {
    return {
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

## Signals to Evolve

Watch for these signals that Stage 1 is no longer sufficient:

| Signal             | User Says                                | Action               |
| ------------------ | ---------------------------------------- | -------------------- |
| Sharing needed     | "Can I share this with a colleague?"     | → Stage 2            |
| Team collaboration | "My team needs to work on this together" | → Stage 2 or 3       |
| Role differences   | "I want them to view but not edit"       | → Stage 2 with roles |

## Advantages

- **Simplicity**: Single query pattern for all access checks
- **Performance**: Simple indexed lookups
- **Security**: Clear ownership, no complex permission logic
- **Maintenance**: Minimal code to maintain

## Limitations

- No sharing between users
- No team collaboration
- No delegation of access
- Resource ownership is binary (have it or don't)
