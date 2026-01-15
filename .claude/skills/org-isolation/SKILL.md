---
name: org-isolation
description: 'Use when: (1) auditing tenant isolation, (2) implementing query scoping, (3) writing cross-tenant tests, (4) creating TenantScopedDb wrappers, (5) preventing data leakage between organizations.'
---

# Organization Isolation

Ensure tenants cannot access each other's data. The most critical security property of multi-tenancy.

## Decision Tree

### Need to implement tenant-scoped queries?

**When**: Building database access patterns that enforce organization boundaries
**Go to**: [references/tenant-scoped-db.md](./references/tenant-scoped-db.md)

### Need to audit existing code for isolation gaps?

**When**: Reviewing code for cross-tenant data leakage vulnerabilities
**Go to**: [references/audit-checklist.md](./references/audit-checklist.md)

### Need to test tenant isolation?

**When**: Writing tests to verify cross-tenant access is properly denied
**Go to**: [references/testing-patterns.md](./references/testing-patterns.md)

## Quick Example

```typescript
// src/infrastructure/middleware/tenantIsolation.ts

export function createTenantScopedDb(db: D1Database, organizationId: string): TenantScopedDb {
  return {
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
    },
  };
}
```

## Core Principle

**Every database query for tenant data must include `organization_id` in the WHERE clause.**

```sql
-- CORRECT: Scoped to organization
SELECT * FROM projects WHERE id = ? AND organization_id = ?

-- WRONG: No organization scope - data leak risk!
SELECT * FROM projects WHERE id = ?
```

## Isolation Checklist

| Check                             | Description                             |
| --------------------------------- | --------------------------------------- |
| All SELECT queries include org_id | Prevents reading other tenants' data    |
| All UPDATE queries include org_id | Prevents modifying other tenants' data  |
| All DELETE queries include org_id | Prevents deleting other tenants' data   |
| API validates org context         | Ensures users can only access their org |
| Tests verify cross-tenant denial  | Acceptance tests prove isolation works  |

## Cross-References

- **[d1-repository-implementation](../d1-repository-implementation/SKILL.md)**: Repository patterns with tenant scoping
- **[org-authorization](../org-authorization/SKILL.md)**: Authorization checks before database access
- **[org-testing](../org-testing/SKILL.md)**: Testing strategies for tenant isolation
- **[security-review](../security-review/SKILL.md)**: Security audit of isolation implementation

## Reference Files

- [references/tenant-scoped-db.md](./references/tenant-scoped-db.md): TenantScopedDb wrapper implementation
- [references/audit-checklist.md](./references/audit-checklist.md): Security audit checklist for isolation
- [references/testing-patterns.md](./references/testing-patterns.md): Cross-tenant test patterns
