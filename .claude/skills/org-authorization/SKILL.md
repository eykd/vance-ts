---
name: org-authorization
description: 'Use when: (1) implementing authorization checks, (2) defining Actor/Action/Resource types, (3) building AuthorizationService, (4) adding new resource types, (5) questions about role-based vs resource-based authorization.'
---

# Organization Authorization

Implement the core authorization pattern: "Can User X do Action Y on Resource Z?"

## Decision Tree

### Need to define authorization types?

**When**: Starting authorization implementation or adding new actors/resources
**Go to**: [references/core-types.md](./references/core-types.md)

### Need to implement the authorization service?

**When**: Building the service that evaluates policies and loads context
**Go to**: [references/authorization-service.md](./references/authorization-service.md)

### Need authorization patterns?

**When**: Implementing ownership checks, admin override, system actions, or delegation
**Go to**: [references/patterns.md](./references/patterns.md)

## Quick Example

```typescript
// src/presentation/handlers/ProjectHandlers.ts
import { AuthorizationService } from '../../application/services/AuthorizationService';
import type { Actor, Resource } from '../../domain/authorization/types';

export async function handleDeleteProject(
  env: Env,
  userId: string,
  projectId: string
): Promise<Response> {
  const actor: Actor = { type: 'user', id: userId };
  const resource: Resource = { type: 'project', id: projectId };

  const authz = new AuthorizationService(env.DB);
  const result = await authz.can(actor, 'delete', resource);

  if (!result.allowed) {
    return new Response(`Forbidden: ${result.reason}`, { status: 403 });
  }

  await deleteProject(env.DB, projectId);
  return new Response(null, { status: 204 });
}
```

## Core Concepts

| Concept       | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| Actor         | Who is attempting the action (user, system, api_key)                  |
| Action        | What they want to do (create, read, update, delete, invite, transfer) |
| Resource      | What they want to act on (type + id, optional parent)                 |
| PolicyContext | Additional data for decisions (memberships, ownership)                |

## Authorization Flow

```
Request → Extract Actor → Define Resource → Load Context → Evaluate Policy → Allow/Deny
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

// ❌ BAD: Reveals permission structure
return new Response(`Missing required permissions: project:delete, project:archive`, {
  status: 403,
});

// ✅ GOOD: Generic denial without details
return new Response('Access denied', { status: 403 });

// ✅ GOOD: User-friendly without leaking internals
return new Response('You do not have permission to perform this action', { status: 403 });
```

#### Resource Existence Hiding

When a user lacks permission, return the same response whether the resource exists or not:

```typescript
async function handleGetProject(projectId: string, userId: string): Promise<Response> {
  const authz = new AuthorizationService(env.DB, logger);
  const result = await authz.can({ type: 'user', id: userId }, 'read', {
    type: 'project',
    id: projectId,
  });

  // Same 403 response whether project doesn't exist or user lacks permission
  // This prevents attackers from enumerating valid project IDs
  if (!result.allowed) {
    return new Response('Access denied', { status: 403 });
  }

  const project = await getProject(projectId);

  // Only 404 for authenticated, authorized users who can see the resource doesn't exist
  if (!project) {
    return new Response('Project not found', { status: 404 });
  }

  return Response.json(project);
}
```

#### Logging vs User Response

Log detailed information for debugging while returning generic messages to users:

```typescript
const result = await authz.can(actor, action, resource);

if (!result.allowed) {
  // Detailed logging for internal audit (with PII redaction)
  logger.warn({
    event: 'authorization.denied',
    category: 'application',
    actor_type: actor.type,
    actor_id: actor.type === 'user' ? actor.id : undefined,
    action,
    resource_type: resource.type,
    resource_id: resource.id,
    denial_reason: result.reason, // Internal use only
  });

  // Generic response to user
  return new Response('Access denied', { status: 403 });
}
```

### Timing Attack Prevention

Ensure authorization checks don't leak information through response timing:

```typescript
/**
 * Perform authorization check with consistent timing.
 * Prevents attackers from inferring resource existence through response time.
 */
async function authorizeWithConsistentTiming(
  authz: AuthorizationService,
  actor: Actor,
  action: Action,
  resource: Resource
): Promise<AuthorizationResult> {
  const startTime = Date.now();
  const minDuration = 50; // Minimum response time in ms

  const result = await authz.can(actor, action, resource);

  // Ensure minimum duration to prevent timing leaks
  const elapsed = Date.now() - startTime;
  if (elapsed < minDuration) {
    await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
  }

  return result;
}
```

## Cross-References

- **[security-review](../security-review/SKILL.md)**: Security audit of authorization implementation
- **[ddd-domain-modeling](../ddd-domain-modeling/SKILL.md)**: Actor and Resource as domain entities
- **[org-isolation](../org-isolation/SKILL.md)**: Ensuring cross-tenant isolation
- **[org-membership](../org-membership/SKILL.md)**: Role hierarchy for organization members

## Reference Files

- [references/core-types.md](./references/core-types.md): Actor, Action, Resource, PolicyContext type definitions
- [references/authorization-service.md](./references/authorization-service.md): AuthorizationService implementation
- [references/patterns.md](./references/patterns.md): Ownership, admin override, system actions, delegation patterns
