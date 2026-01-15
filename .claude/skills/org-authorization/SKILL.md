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

## Cross-References

- **[security-review](../security-review/SKILL.md)**: Security audit of authorization implementation
- **[ddd-domain-modeling](../ddd-domain-modeling/SKILL.md)**: Actor and Resource as domain entities
- **[org-isolation](../org-isolation/SKILL.md)**: Ensuring cross-tenant isolation
- **[org-membership](../org-membership/SKILL.md)**: Role hierarchy for organization members

## Reference Files

- [references/core-types.md](./references/core-types.md): Actor, Action, Resource, PolicyContext type definitions
- [references/authorization-service.md](./references/authorization-service.md): AuthorizationService implementation
- [references/patterns.md](./references/patterns.md): Ownership, admin override, system actions, delegation patterns
