# Multi-Tenant SaaS Architecture Overview

This document describes the multi-tenancy architecture pattern used for building B2B SaaS applications with organizational boundaries, role-based access control, and data isolation.

## Architecture Principles

### Multi-Tenancy Model

Resources are organized by **organizations** (tenants), not individual users. Each organization represents a separate customer, team, or company with:

- **Clear boundaries**: Billing, data, and access are organization-scoped
- **Data isolation**: Organizations cannot access each other's data
- **Self-service administration**: Organization admins manage their own members
- **Role-based access control**: Hierarchical permissions within each organization

### Core Principle: Tenant Isolation

**Every database query for tenant data must include `organization_id` in the WHERE clause.**

```sql
-- CORRECT: Scoped to organization
SELECT * FROM projects WHERE id = ? AND organization_id = ?

-- WRONG: No organization scope - data leak risk!
SELECT * FROM projects WHERE id = ?
```

## Authorization Model

The authorization model answers: **"Can User X do Action Y on Resource Z?"**

### Core Types

#### Actor

An Actor is the entity attempting to perform an action.

```typescript
export type Actor =
  | { type: 'user'; id: string }
  | { type: 'system'; reason: string }
  | { type: 'api_key'; id: string; scopes: string[] };
```

- **user**: A human user authenticated via session
- **system**: Internal system processes (migrations, background jobs)
- **api_key**: API access with scoped permissions

#### Action

Actions that can be performed on resources:

```typescript
export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'invite'
  | 'remove'
  | 'transfer'
  | 'admin';
```

#### Resource

A Resource identifies what the action targets:

```typescript
export type ResourceType = 'organization' | 'project' | 'document' | 'membership';

export interface Resource {
  type: ResourceType;
  id: string;
  /** Optional parent context for nested resources */
  parent?: Resource;
}
```

#### Authorization Result

```typescript
export interface AuthorizationResult {
  allowed: boolean;
  reason: string;
  /** The effective role that granted (or would have granted) access */
  effectiveRole?: string;
}
```

### Authorization Flow

```
Request → Extract Actor → Define Resource → Load Context → Evaluate Policy → Allow/Deny
```

### Policy Context

Context provides the data needed to evaluate authorization policies:

```typescript
export interface PolicyContext {
  /** Organization membership for the actor (if user) */
  organizationMembership?: {
    organizationId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
  };
  /** Who owns the resource being accessed */
  resourceOwner?: string;
  /** Which organization the resource belongs to */
  resourceOrganizationId?: string;
  /** Project-specific membership (if checking project access) */
  projectMembership?: {
    role: 'admin' | 'editor' | 'viewer';
  };
}
```

## Role Hierarchy

The system implements a four-level role hierarchy within organizations:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORGANIZATION ROLE HIERARCHY                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Level 4: owner                                                             │
│  ──────────────────────────────────────────────────────────────────────    │
│  • Full control over organization                                           │
│  • Can delete the organization                                              │
│  • Can transfer ownership to another member                                 │
│  • Can change any member's role (including admins)                          │
│  • Can remove any member                                                    │
│  • Exactly one per organization                                             │
│                                                                             │
│  Level 3: admin                                                             │
│  ──────────────────────────────────────────────────────────────────────    │
│  • Manage organization settings                                             │
│  • Invite new members (up to admin role)                                    │
│  • Remove members (except owner)                                            │
│  • Change member roles (up to admin)                                        │
│  • Full access to all resources                                             │
│  • Cannot transfer ownership                                                │
│  • Cannot delete organization                                               │
│                                                                             │
│  Level 2: member                                                            │
│  ──────────────────────────────────────────────────────────────────────    │
│  • Create new resources                                                     │
│  • Full access to own resources                                             │
│  • Read access to all organization resources                                │
│  • Cannot invite or manage other members                                    │
│  • Cannot change organization settings                                      │
│                                                                             │
│  Level 1: viewer                                                            │
│  ──────────────────────────────────────────────────────────────────────    │
│  • Read-only access to all organization resources                           │
│  • Cannot create, edit, or delete anything                                  │
│  • Cannot invite or manage members                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Permission Matrix

| Action   | Owner | Admin  | Member | Viewer |
| -------- | ----- | ------ | ------ | ------ |
| read     | ✅    | ✅     | ✅     | ✅     |
| create   | ✅    | ✅     | ✅     | ❌     |
| update   | ✅    | ✅     | ✅\*   | ❌     |
| delete   | ✅    | ✅     | ✅\*   | ❌     |
| invite   | ✅    | ✅     | ❌     | ❌     |
| remove   | ✅    | ✅\*\* | ❌     | ❌     |
| admin    | ✅    | ✅     | ❌     | ❌     |
| transfer | ✅    | ❌     | ❌     | ❌     |

\* Members can only update/delete their own resources
\*\* Admins cannot remove owner

### Role Utilities

```typescript
export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export function isHigherRole(roleA: OrgRole, roleB: OrgRole): boolean {
  return ROLE_HIERARCHY[roleA] > ROLE_HIERARCHY[roleB];
}

export function canPerformAction(role: OrgRole, action: OrgAction): boolean {
  const ROLE_PERMISSIONS: Record<OrgRole, OrgAction[]> = {
    owner: ['read', 'create', 'update', 'delete', 'invite', 'remove', 'admin', 'transfer'],
    admin: ['read', 'create', 'update', 'delete', 'invite', 'remove', 'admin'],
    member: ['read', 'create', 'update'],
    viewer: ['read'],
  };

  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}
```

## Data Isolation Guarantees

### Isolation Checklist

| Check                             | Description                             |
| --------------------------------- | --------------------------------------- |
| All SELECT queries include org_id | Prevents reading other tenants' data    |
| All UPDATE queries include org_id | Prevents modifying other tenants' data  |
| All DELETE queries include org_id | Prevents deleting other tenants' data   |
| API validates org context         | Ensures users can only access their org |
| Tests verify cross-tenant denial  | Acceptance tests prove isolation works  |

### Tenant-Scoped Database Pattern

Always scope database access to the current organization:

```typescript
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

## Security Considerations

### Error Message Security

Authorization error messages must balance user helpfulness with security. Overly detailed errors can reveal system internals and enable enumeration attacks.

#### Principles

| Principle                     | Description                                                          |
| ----------------------------- | -------------------------------------------------------------------- |
| No internal leakage           | Error messages should not reveal database structure, file paths, etc |
| No resource existence leakage | Don't confirm whether a resource exists in authorization denials     |
| No permission enumeration     | Don't list what permissions exist or what the user lacks             |
| Consistent timing             | Authorization checks should take similar time regardless of outcome  |

#### Error Message Examples

```typescript
// ❌ BAD: Leaks internal system details
return new Response(
  `User ${userId} does not have permission 'project:delete' on resource ${projectId}`,
  { status: 403 }
);

// ❌ BAD: Reveals resource existence
return new Response(
  `Project ${projectId} belongs to organization ${orgId}, not your organization`,
  { status: 403 }
);

// ✅ GOOD: Generic denial without details
return new Response('Access denied', { status: 403 });

// ✅ GOOD: User-friendly without leaking internals
return new Response('You do not have permission to perform this action', { status: 403 });
```

### Resource Existence Hiding

When a user lacks permission, return the same response whether the resource exists or not:

```typescript
async function handleGetProject(projectId: string, userId: string): Promise<Response> {
  const result = await authz.can({ type: 'user', id: userId }, 'read', {
    type: 'project',
    id: projectId,
  });

  // Same 403 response whether project doesn't exist or user lacks permission
  if (!result.allowed) {
    return new Response('Access denied', { status: 403 });
  }

  const project = await getProject(projectId);

  // Only 404 for authenticated, authorized users
  if (!project) {
    return new Response('Project not found', { status: 404 });
  }

  return Response.json(project);
}
```

### Logging vs User Response

Log detailed information for debugging while returning generic messages to users:

```typescript
const result = await authz.can(actor, action, resource);

if (!result.allowed) {
  // Detailed logging for internal audit
  logger.warn({
    event: 'authorization.denied',
    actor_type: actor.type,
    action,
    resource_type: resource.type,
    resource_id: resource.id,
    denial_reason: result.reason, // Internal use only
  });

  // Generic response to user
  return new Response('Access denied', { status: 403 });
}
```
