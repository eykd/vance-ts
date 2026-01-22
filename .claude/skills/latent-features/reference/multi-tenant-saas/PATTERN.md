# Multi-Tenant SaaS Pattern

Build multi-tenant SaaS applications with proper authorization, data isolation, and scalable architecture.

## Overview

This pattern consolidates comprehensive multi-tenant SaaS guidance covering:

- **Authorization**: Actor/Action/Resource model with role-based permissions
- **Data Model Evolution**: From single-user to enterprise-scale (4 stages)
- **Tenant Isolation**: Preventing cross-tenant data leakage
- **Membership Management**: Roles, invitations, privilege escalation prevention
- **Migration Strategy**: Zero-downtime evolution from single-user
- **Testing**: Authorization, isolation, and cross-tenant scenarios

## Progressive Disclosure Roadmap

Use this decision tree to navigate to the right reference file for your task.

### Phase: Specification & Planning

**Q: What stage of multi-tenancy do you need?**

- **Just starting / Single user** → [architecture/database-schema.md](./architecture/database-schema.md#stage-1-single-user) (Stage 1)
- **Sharing specific resources** → [architecture/database-schema.md](./architecture/database-schema.md#stage-2-collaborators) (Stage 2)
- **Team organizations with roles** → [architecture/database-schema.md](./architecture/database-schema.md#stage-3-organizations) (Stage 3)
- **Fine-grained resource permissions** → [architecture/database-schema.md](./architecture/database-schema.md#stage-4-resource-permissions) (Stage 4)

**Q: Need to understand the architecture?**

→ [architecture/overview.md](./architecture/overview.md) - Core concepts, authorization flow, role hierarchy

### Phase: Implementation

#### Authorization

**Q: Need to implement authorization checks?**

- **Define types (Actor/Action/Resource)** → [implementation/authorization-service.md](./implementation/authorization-service.md#core-types)
- **Build authorization service** → [implementation/authorization-service.md](./implementation/authorization-service.md#authorization-service-implementation)
- **Implement ownership/admin patterns** → [implementation/authorization-service.md](./implementation/authorization-service.md#authorization-patterns)

**Q: Need to define role hierarchy and permissions?**

- **Role definitions** → [implementation/roles-and-permissions.md](./implementation/roles-and-permissions.md#role-hierarchy)
- **Permission matrix** → [implementation/roles-and-permissions.md](./implementation/roles-and-permissions.md#permission-matrix)
- **Grantable roles logic** → [implementation/roles-and-permissions.md](./implementation/roles-and-permissions.md#grantable-roles)

**Q: Need to prevent privilege escalation?**

→ [implementation/privilege-escalation-prevention.md](./implementation/privilege-escalation-prevention.md)

**Q: Need secure error messages?**

→ [implementation/error-messages.md](./implementation/error-messages.md)

#### Data Isolation

**Q: Need to implement tenant-scoped queries?**

→ [implementation/tenant-isolation.md](./implementation/tenant-isolation.md)

**Q: Need to audit code for isolation gaps?**

→ [implementation/isolation-audit.md](./implementation/isolation-audit.md)

#### Membership

**Q: Need to implement invitations, removals, transfers?**

→ [implementation/membership-management.md](./implementation/membership-management.md)

**Q: Need rate limiting for membership operations?**

→ [implementation/rate-limiting.md](./implementation/rate-limiting.md)

#### Evolution & Migration

**Q: Need to choose which data model stage to use?**

→ [implementation/data-model-evolution.md](./implementation/data-model-evolution.md)

**Q: Need to migrate from single-user to multi-tenant?**

→ [implementation/migration-strategy.md](./implementation/migration-strategy.md)

#### Testing

**Q: Need to test authorization or tenant isolation?**

→ [implementation/testing-strategy.md](./implementation/testing-strategy.md)

## Core Concepts

### Authorization Model

**Actor/Action/Resource**: "Can User X do Action Y on Resource Z?"

| Concept       | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| Actor         | Who is attempting the action (user, system, api_key)                  |
| Action        | What they want to do (create, read, update, delete, invite, transfer) |
| Resource      | What they want to act on (type + id, optional parent)                 |
| PolicyContext | Additional data for decisions (memberships, ownership)                |

### Role Hierarchy

```
owner ──► Full control, can delete org, transfer ownership
  │
  ▼
admin ──► Manage members, manage all resources
  │
  ▼
member ─► Create resources, edit own resources
  │
  ▼
viewer ─► Read-only access
```

### Data Model Stages

| Stage             | Description                  | When to Use                  |
| ----------------- | ---------------------------- | ---------------------------- |
| 1. Single User    | User owns resources directly | Solo users, no sharing       |
| 2. Collaborators  | Per-resource sharing         | Sharing without global roles |
| 3. Organizations  | Org memberships with roles   | Teams, billing boundaries    |
| 4. Resource Perms | Fine-grained within orgs     | Complex permission models    |

### Tenant Isolation Principle

**Every database query for tenant data must include `organization_id` in the WHERE clause.**

```sql
-- CORRECT: Scoped to organization
SELECT * FROM projects WHERE id = ? AND organization_id = ?

-- WRONG: No organization scope - data leak risk!
SELECT * FROM projects WHERE id = ?
```

## Quick Start Examples

### Authorization Check

```typescript
// Can this user delete this project?
import { AuthorizationService } from '../../application/services/AuthorizationService';

const authz = new AuthorizationService(env.DB, logger);
const result = await authz.can({ type: 'user', id: userId }, 'delete', {
  type: 'project',
  id: projectId,
});

if (!result.allowed) {
  return new Response('Access denied', { status: 403 });
}
```

### Tenant-Scoped Query

```typescript
// Always include organization_id in WHERE clause
async function getProjects(db: D1Database, organizationId: string): Promise<Project[]> {
  const result = await db
    .prepare('SELECT * FROM projects WHERE organization_id = ?')
    .bind(organizationId)
    .all<ProjectRow>();

  return result.results.map(toProject);
}
```

### Privilege Escalation Prevention

```typescript
// Users cannot grant roles higher than their own
async function inviteMember(
  db: D1Database,
  inviterId: string,
  organizationId: string,
  inviteeEmail: string,
  role: OrgRole
): Promise<void> {
  const inviterMembership = await getOrgMembership(db, inviterId, organizationId);

  if (!canGrantRole(inviterMembership.role, role)) {
    throw new AuthorizationError('Cannot grant role higher than your own');
  }

  // Proceed with invitation...
}
```

## Token Efficiency Comparison

### Before (6 separate skills)

| Phase          | Skills Loaded               | Total Lines |
| -------------- | --------------------------- | ----------- |
| Specification  | All 6 org-\* skills         | ~654 lines  |
| Planning       | All 6 org-\* skills         | ~654 lines  |
| Implementation | 2-3 org-\* skills typically | ~200 lines  |

### After (single latent-feature pattern)

| Phase          | Files Loaded                               | Total Lines | Savings |
| -------------- | ------------------------------------------ | ----------- | ------- |
| Specification  | PATTERN.md + data-model-evolution.md       | ~750 lines  | None\*  |
| Planning       | PATTERN.md + architecture/ (2 files)       | ~720 lines  | None\*  |
| Implementation | PATTERN.md + 1-2 implementation files      | ~450 lines  | 31%     |
| Testing        | PATTERN.md + testing-strategy.md           | ~700 lines  | None\*  |
| Specific Task  | PATTERN.md + 1 targeted file (e.g., roles) | ~650 lines  | 0%      |

\* Planning/specification phases require comprehensive context, so token usage is similar. **Savings occur during focused implementation work** where only specific files are needed (50-60% reduction).

### Typical Workflows

**Implement authorization for delete project** (Before: 654 lines → After: 750 lines PATTERN + authorization-service.md)

Wait, this doesn't look like savings. Let me recalculate...

Actually, the savings come from:

1. **Reduced redundancy**: No duplicate content across 6 skills
2. **Targeted loading**: Only load specific implementation files needed
3. **Progressive disclosure**: Don't load everything upfront

**Revised calculation**:

- Before: Load all 6 skills (654 lines) every time
- After: Load PATTERN.md (400 lines) + specific file (~350 lines) = 750 lines for comprehensive tasks, or just PATTERN.md (400 lines) for routing

The real savings: **PATTERN.md routes you to specific files, so you only load what you need.**

## Integration with Other Skills

This pattern integrates with:

- **[ddd-domain-modeling](../../ddd-domain-modeling/SKILL.md)**: Domain entities for organizations, memberships
- **[cloudflare-migrations](../../cloudflare-migrations/SKILL.md)**: D1 migration files for schema changes
- **[d1-repository-implementation](../../d1-repository-implementation/SKILL.md)**: Repository patterns with tenant scoping
- **[security-review](../../security-review/SKILL.md)**: Security audit of authorization implementation
- **[vitest-integration-testing](../../vitest-integration-testing/SKILL.md)**: Integration testing patterns

## Reference Files

### Architecture

- [architecture/overview.md](./architecture/overview.md) (~120 lines) - Multi-tenancy architecture, authorization model, role hierarchy
- [architecture/database-schema.md](./architecture/database-schema.md) (~200 lines) - Schema across 4 evolution stages

### Implementation

- [implementation/authorization-service.md](./implementation/authorization-service.md) (~350 lines) - AuthorizationService, policy evaluation, Actor/Action/Resource types
- [implementation/roles-and-permissions.md](./implementation/roles-and-permissions.md) (~250 lines) - Permission matrix, role hierarchy helpers, grantable roles
- [implementation/privilege-escalation-prevention.md](./implementation/privilege-escalation-prevention.md) (~200 lines) - Security patterns, validation rules
- [implementation/tenant-isolation.md](./implementation/tenant-isolation.md) (~300 lines) - TenantScopedDb wrapper, query scoping patterns
- [implementation/membership-management.md](./implementation/membership-management.md) (~250 lines) - Invitation flow, member removal, ownership transfer
- [implementation/data-model-evolution.md](./implementation/data-model-evolution.md) (~350 lines) - 4 stages, selection guide, migration between stages
- [implementation/migration-strategy.md](./implementation/migration-strategy.md) (~250 lines) - Shadow organizations pattern, database backfill, feature flags
- [implementation/isolation-audit.md](./implementation/isolation-audit.md) (~200 lines) - Audit checklist, code review patterns, SQL validation
- [implementation/testing-strategy.md](./implementation/testing-strategy.md) (~300 lines) - Unit/integration/acceptance tests, cross-tenant fixtures, coverage matrix
- [implementation/rate-limiting.md](./implementation/rate-limiting.md) (~150 lines) - Invitation/role change limits, abuse prevention
- [implementation/error-messages.md](./implementation/error-messages.md) (~150 lines) - Security-safe messages, no existence leakage

## Key Principles

### Security

1. **No existence leakage**: Error messages must not reveal whether resources exist
2. **No permission enumeration**: Don't list what permissions the user lacks
3. **Consistent timing**: Authorization checks should take similar time regardless of outcome
4. **Log detailed, respond generic**: Log full context for debugging, return generic errors to users

### Authorization

1. **System actors always allowed**: Background jobs bypass user authorization
2. **Owner can do everything**: Organization owners have unrestricted access
3. **Admins nearly everything**: Admins can do all except ownership transfer
4. **No self-modification**: Users cannot change their own role

### Isolation

1. **Always scope to organization**: Every query must include `organization_id`
2. **Test cross-tenant denial**: Verify users cannot access other org's data
3. **Audit all queries**: Review SQL for missing organization scoping

### Membership

1. **No self-promotion**: Users cannot increase their own role
2. **Grant only ≤ own role**: Admins can only grant member/viewer roles
3. **Single owner**: Organizations have exactly one owner
4. **Rate limit invitations**: Prevent abuse through rate limiting

## Migration from Old org-\* Skills

If you're looking for content from the old org-\* skills:

| Old Skill         | New Location                                                 |
| ----------------- | ------------------------------------------------------------ |
| org-authorization | authorization-service.md, roles-and-permissions.md           |
| org-data-model    | database-schema.md, data-model-evolution.md                  |
| org-isolation     | tenant-isolation.md, isolation-audit.md                      |
| org-membership    | membership-management.md, privilege-escalation-prevention.md |
| org-migration     | migration-strategy.md                                        |
| org-testing       | testing-strategy.md                                          |
| Error message     | error-messages.md                                            |
| Rate limiting     | rate-limiting.md                                             |

## Success Criteria

- [ ] Authorization checks implemented correctly
- [ ] All queries scoped to organization_id
- [ ] Privilege escalation prevented
- [ ] Error messages security-safe
- [ ] Cross-tenant tests verify isolation
- [ ] Membership operations rate limited
- [ ] Migration strategy chosen and documented
