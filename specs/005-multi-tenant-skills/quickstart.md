# Quickstart: Multi-Tenant Boundary Skills

Get started implementing multi-tenant patterns using the org-\* skill family.

## Prerequisites

- Familiarity with [multi-tenant-boundaries-guide.md](/docs/multi-tenant-boundaries-guide.md)
- Cloudflare Workers project with D1 database
- TypeScript with strict mode enabled

## Choose Your Entry Point

### Starting a New Application?

**Start with**: `/org-data-model`

Use the decision tree to choose the right complexity level:

1. Single-user (Stage 1) - simplest
2. Collaborators (Stage 2) - resource sharing
3. Organizations (Stage 3) - full multi-tenancy
4. Resource permissions (Stage 4) - fine-grained within orgs

### Adding Authorization to Existing App?

**Start with**: `/org-authorization`

1. Define Actor, Action, Resource types
2. Implement AuthorizationService
3. Add authorization middleware to handlers

### Running a Security Audit?

**Start with**: `/org-isolation`

1. Review tenant isolation checklist
2. Audit query scoping patterns
3. Run cross-tenant test suite

### Migrating to Multi-Tenant?

**Start with**: `/org-migration`

1. Choose migration strategy (shadow orgs, feature flags, backfill)
2. Follow data model evolution path
3. Test migration with subset of users

## Skill Chain Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MULTI-TENANT SKILL CHAIN                         │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐
  │ org-authorization│ ← Start here for authorization
  │                  │
  │ Actor/Action/    │
  │ Resource types   │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │  org-isolation   │ ← Start here for security audit
  │                  │
  │ Query scoping,   │
  │ tenant isolation │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │  org-data-model  │ ← Start here for new apps
  │                  │
  │ 4-stage evolution│
  │ schema patterns  │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │  org-membership  │
  │                  │
  │ Role hierarchy,  │
  │ privilege checks │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │   org-testing    │
  │                  │
  │ Unit, integration│
  │ acceptance tests │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │  org-migration   │ ← Start here for existing apps
  │                  │
  │ Shadow orgs,     │
  │ feature flags    │
  └──────────────────┘
```

## Quick Example: Full Authorization Flow

```typescript
// 1. Define types (org-authorization/references/core-types.md)
type Actor = { type: 'user'; id: string } | { type: 'system'; reason: string };
type Action = 'create' | 'read' | 'update' | 'delete';
interface Resource {
  type: 'project';
  id: string;
}

// 2. Create service (org-authorization/references/authorization-service.md)
const authz = new AuthorizationService(env.DB);

// 3. Check authorization in handler
export async function handleDeleteProject(
  request: Request,
  env: Env,
  userId: string,
  projectId: string
): Promise<Response> {
  const result = await authz.can({ type: 'user', id: userId }, 'delete', {
    type: 'project',
    id: projectId,
  });

  if (!result.allowed) {
    return new Response(`Forbidden: ${result.reason}`, { status: 403 });
  }

  await deleteProject(env.DB, projectId);
  return new Response(null, { status: 204 });
}
```

## Related Skills

| When You Need          | Use Skill                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Domain entity patterns | [ddd-domain-modeling](../.claude/skills/ddd-domain-modeling/SKILL.md)                   |
| D1 repository patterns | [d1-repository-implementation](../.claude/skills/d1-repository-implementation/SKILL.md) |
| Database migrations    | [cloudflare-migrations](../.claude/skills/cloudflare-migrations/SKILL.md)               |
| Security review        | [security-review](../.claude/skills/security-review/SKILL.md)                           |
| Unit testing           | [typescript-unit-testing](../.claude/skills/typescript-unit-testing/SKILL.md)           |
| Integration testing    | [vitest-integration-testing](../.claude/skills/vitest-integration-testing/SKILL.md)     |

## Validation Checklist

After implementing multi-tenant patterns, verify:

- [ ] All queries include organization_id filter
- [ ] Authorization checked before every state change
- [ ] Role hierarchy prevents privilege escalation
- [ ] Cross-tenant tests pass
- [ ] Migration preserves existing user data
