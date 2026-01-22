# Tenant Isolation

**Purpose**: Implement database access patterns and middleware that enforce organization boundaries on all queries for multi-tenant SaaS applications.

## TenantScopedDb Pattern

```typescript
// src/infrastructure/middleware/tenantIsolation.ts

export interface TenantScopedDb {
  query<T>(sql: string, ...params: unknown[]): Promise<T[]>;
  projects: ProjectAccessor;
  documents: DocumentAccessor;
}

/**
 * Creates a database wrapper that enforces tenant isolation.
 * All queries must include organization_id filter.
 */
export function createTenantScopedDb(db: D1Database, organizationId: string): TenantScopedDb {
  return {
    async query<T>(sql: string, ...params: unknown[]): Promise<T[]> {
      // Verify query includes organization scope
      if (!sql.toLowerCase().includes('organization_id')) {
        throw new TenantIsolationError('Query must include organization_id filter');
      }

      // Execute with organization_id automatically added to params
      const result = await db
        .prepare(sql)
        .bind(...params, organizationId)
        .all<T>();

      return result.results;
    },

    projects: {
      async findById(id: string): Promise<Project | null> {
        const row = await db
          .prepare('SELECT * FROM projects WHERE id = ? AND organization_id = ?')
          .bind(id, organizationId)
          .first<ProjectRow>();
        return row ? toProject(row) : null;
      },

      async list(): Promise<Project[]> {
        const result = await db
          .prepare('SELECT * FROM projects WHERE organization_id = ?')
          .bind(organizationId)
          .all<ProjectRow>();
        return result.results.map(toProject);
      },

      async create(input: CreateProjectInput): Promise<Project> {
        const id = crypto.randomUUID();
        await db
          .prepare(
            `INSERT INTO projects (id, organization_id, name, description, owner_id, created_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`
          )
          .bind(id, organizationId, input.name, input.description, input.ownerId)
          .run();
        return { id, organizationId, ...input };
      },

      async update(id: string, input: UpdateProjectInput): Promise<void> {
        const result = await db
          .prepare(
            `UPDATE projects
             SET name = ?, description = ?, updated_at = datetime('now')
             WHERE id = ? AND organization_id = ?`
          )
          .bind(input.name, input.description, id, organizationId)
          .run();

        if (result.meta.changes === 0) {
          throw new NotFoundError(`Project ${id} not found in organization`);
        }
      },

      async delete(id: string): Promise<void> {
        const result = await db
          .prepare('DELETE FROM projects WHERE id = ? AND organization_id = ?')
          .bind(id, organizationId)
          .run();

        if (result.meta.changes === 0) {
          throw new NotFoundError(`Project ${id} not found in organization`);
        }
      },
    },

    documents: {
      async findById(id: string): Promise<Document | null> {
        // Documents belong to projects, which belong to organizations
        const row = await db
          .prepare(
            `
            SELECT d.* FROM documents d
            JOIN projects p ON d.project_id = p.id
            WHERE d.id = ? AND p.organization_id = ?
          `
          )
          .bind(id, organizationId)
          .first<DocumentRow>();
        return row ? toDocument(row) : null;
      },

      async listByProject(projectId: string): Promise<Document[]> {
        const result = await db
          .prepare(
            `
            SELECT d.* FROM documents d
            JOIN projects p ON d.project_id = p.id
            WHERE d.project_id = ? AND p.organization_id = ?
          `
          )
          .bind(projectId, organizationId)
          .all<DocumentRow>();
        return result.results.map(toDocument);
      },
    },
  };
}

export class TenantIsolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantIsolationError';
  }
}
```

## Middleware Integration

```typescript
// src/presentation/middleware/tenantContext.ts
import { createMiddleware } from 'hono/factory';

/**
 * Middleware that creates tenant-scoped database access.
 */
export function tenantContextMiddleware() {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const session = c.get('session');
    if (!session?.organizationId) {
      return c.text('Organization context required', 400);
    }

    // Create tenant-scoped database wrapper
    const scopedDb = createTenantScopedDb(c.env.DB, session.organizationId);
    c.set('db', scopedDb);

    await next();
  });
}
```

## Handler Usage

```typescript
// src/presentation/handlers/ProjectHandlers.ts

export async function handleListProjects(c: Context): Promise<Response> {
  const db = c.get('db') as TenantScopedDb;

  // Automatically scoped to current organization
  const projects = await db.projects.list();

  return c.json(projects);
}

export async function handleGetProject(c: Context): Promise<Response> {
  const db = c.get('db') as TenantScopedDb;
  const projectId = c.req.param('projectId');

  // Returns null if project doesn't exist OR belongs to different org
  const project = await db.projects.findById(projectId);

  if (!project) {
    return c.text('Not found', 404);
  }

  return c.json(project);
}
```

## Query Scoping Patterns

### Basic WHERE Clause Scoping

```typescript
// Always include organization_id in WHERE clause
SELECT * FROM projects WHERE organization_id = ?

// For updates
UPDATE projects
SET name = ?, updated_at = datetime('now')
WHERE id = ? AND organization_id = ?

// For deletes
DELETE FROM projects WHERE id = ? AND organization_id = ?
```

### JOIN Scoping

```typescript
// Ensure JOINs maintain organization scope
SELECT d.* FROM documents d
JOIN projects p ON d.project_id = p.id
WHERE d.id = ? AND p.organization_id = ?

// Multiple table joins
SELECT t.* FROM tasks t
JOIN projects p ON t.project_id = p.id
JOIN organizations o ON p.organization_id = o.id
WHERE t.id = ? AND o.id = ?
```

### Subquery Scoping

```typescript
// Scope subqueries properly
SELECT * FROM documents
WHERE project_id IN (
  SELECT id FROM projects WHERE organization_id = ?
)

// Use EXISTS for existence checks
SELECT * FROM projects p
WHERE organization_id = ?
AND EXISTS (
  SELECT 1 FROM documents d
  WHERE d.project_id = p.id
)
```

## Raw Query Protection

```typescript
// Enforce organization scope on raw queries
async function safeRawQuery<T>(
  db: D1Database,
  organizationId: string,
  sql: string,
  params: unknown[]
): Promise<T[]> {
  // Validate query structure
  const lowerSql = sql.toLowerCase();

  if (!lowerSql.includes('organization_id')) {
    throw new TenantIsolationError(`Query must include organization_id filter: ${sql}`);
  }

  // Ensure organization_id parameter is included
  const result = await db
    .prepare(sql)
    .bind(...params, organizationId)
    .all<T>();

  return result.results;
}
```

## Key Principles

1. **Always scope by organization_id**: Every query on tenant data must include organization_id
2. **Use typed accessors**: Provide type-safe methods instead of raw SQL
3. **Fail loudly**: Throw errors if isolation is violated, don't silently continue
4. **Defense in depth**: Even if authorization passes, isolation provides second layer

## Cross-References

- **isolation-audit.md**: Checklist for auditing tenant isolation
- **authorization-service.md**: Authorization layer that complements isolation
- **data-model-evolution.md**: Schema design for multi-tenant data
