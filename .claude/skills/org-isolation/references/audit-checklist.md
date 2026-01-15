# Isolation Audit Checklist

**Purpose**: Systematic checklist for auditing tenant isolation in multi-tenant applications.

## When to Use

Use this reference when:

- Performing security reviews of multi-tenant code
- Onboarding new team members to isolation requirements
- Creating PR review checklists
- Preparing for security audits or compliance reviews

## Database Query Audit

### SELECT Queries

| ✓   | Check                                                       | Example                                                                   |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| [ ] | All SELECT queries on tenant tables include organization_id | `WHERE organization_id = ?`                                               |
| [ ] | JOINs maintain organization scope                           | `JOIN projects p ON ... WHERE p.organization_id = ?`                      |
| [ ] | Subqueries are properly scoped                              | `WHERE project_id IN (SELECT id FROM projects WHERE organization_id = ?)` |
| [ ] | UNION queries scope each part                               | Both SELECT statements include org filter                                 |
| [ ] | Aggregate queries (COUNT, SUM) are scoped                   | `SELECT COUNT(*) FROM projects WHERE organization_id = ?`                 |

### UPDATE Queries

| ✓   | Check                                        | Example                                                             |
| --- | -------------------------------------------- | ------------------------------------------------------------------- |
| [ ] | All UPDATEs include organization_id in WHERE | `UPDATE projects SET name = ? WHERE id = ? AND organization_id = ?` |
| [ ] | Verify rows affected matches expected        | Check `result.meta.changes` is 0/1 as expected                      |
| [ ] | Prevent mass updates without org scope       | Never `UPDATE projects SET x = ?` without WHERE                     |

### DELETE Queries

| ✓   | Check                               | Example                                                          |
| --- | ----------------------------------- | ---------------------------------------------------------------- |
| [ ] | All DELETEs include organization_id | `DELETE FROM projects WHERE id = ? AND organization_id = ?`      |
| [ ] | CASCADE deletes respect boundaries  | Foreign keys within org scope                                    |
| [ ] | Soft deletes maintain org scope     | `UPDATE SET deleted_at = ? WHERE id = ? AND organization_id = ?` |

### INSERT Queries

| ✓   | Check                                      | Example                                                       |
| --- | ------------------------------------------ | ------------------------------------------------------------- |
| [ ] | organization_id is set on creation         | `INSERT INTO projects (organization_id, ...) VALUES (?, ...)` |
| [ ] | organization_id comes from session context | Not from user input                                           |
| [ ] | Related records use same org_id            | Nested creates maintain consistency                           |

## API Endpoint Audit

### Authentication & Context

| ✓   | Check                             | Description                                 |
| --- | --------------------------------- | ------------------------------------------- |
| [ ] | Session includes organization_id  | Every authenticated request has org context |
| [ ] | Organization context is validated | User is member of the organization          |
| [ ] | Org switching requires re-auth    | Changing orgs validates new membership      |

### Resource Access

| ✓   | Check                              | Description                                 |
| --- | ---------------------------------- | ------------------------------------------- |
| [ ] | Resource IDs validated against org | `GET /projects/:id` verifies org ownership  |
| [ ] | List endpoints filter by org       | `GET /projects` returns only org's projects |
| [ ] | Nested resources maintain scope    | `GET /projects/:id/documents` scopes both   |

### Dangerous Patterns

| ⚠️  | Anti-Pattern                       | Risk                              |
| --- | ---------------------------------- | --------------------------------- |
| ❌  | Trusting client-provided org_id    | Attacker can specify victim's org |
| ❌  | SELECT without organization_id     | Returns all tenants' data         |
| ❌  | Caching without org context        | Data leak through cache poisoning |
| ❌  | Logging sensitive data             | PII from other tenants in logs    |
| ❌  | Error messages with other org data | Information disclosure            |

## Code Review Checklist

### Repository Layer

```typescript
// ✅ CORRECT: Organization scoped
async findById(id: string, organizationId: string): Promise<Project | null> {
  return db.prepare(
    'SELECT * FROM projects WHERE id = ? AND organization_id = ?'
  ).bind(id, organizationId).first();
}

// ❌ WRONG: No organization scope
async findById(id: string): Promise<Project | null> {
  return db.prepare('SELECT * FROM projects WHERE id = ?')
    .bind(id).first(); // Can return ANY tenant's project!
}
```

### Service Layer

```typescript
// ✅ CORRECT: Gets org from session context
async getProject(projectId: string, ctx: RequestContext): Promise<Project> {
  return this.repo.findById(projectId, ctx.organizationId);
}

// ❌ WRONG: No org context validation
async getProject(projectId: string): Promise<Project> {
  return this.repo.findById(projectId); // No org boundary!
}
```

### Handler Layer

```typescript
// ✅ CORRECT: Org from authenticated session
export async function handleGetProject(c: Context): Promise<Response> {
  const session = c.get('session');
  const projectId = c.req.param('projectId');
  const project = await service.getProject(projectId, session.organizationId);
  return c.json(project);
}

// ❌ WRONG: Org from URL parameter (attacker controlled)
export async function handleGetProject(c: Context): Promise<Response> {
  const orgId = c.req.param('orgId'); // Attacker can specify any org!
  const projectId = c.req.param('projectId');
  const project = await service.getProject(projectId, orgId);
  return c.json(project);
}
```

## Security Test Cases

Each of these should be verified with automated tests:

| Test                                  | Assertion                        |
| ------------------------------------- | -------------------------------- |
| User A can read their own project     | 200 OK                           |
| User A cannot read User B's project   | 403 Forbidden                    |
| User A cannot update User B's project | 403 Forbidden                    |
| User A cannot delete User B's project | 403 Forbidden                    |
| User A cannot list User B's projects  | Returns empty or 403             |
| Admin of Org A cannot access Org B    | 403 Forbidden                    |
| System actions are audited            | Audit log includes system reason |

## Remediation Guide

When you find an isolation gap:

1. **Immediate**: Add organization_id to the query
2. **Verify**: Check if data was leaked (audit logs)
3. **Test**: Add regression test for the specific case
4. **Review**: Check for similar patterns elsewhere
5. **Document**: Add to team's security checklist
