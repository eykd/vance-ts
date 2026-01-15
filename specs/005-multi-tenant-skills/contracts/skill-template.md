# Skill Template Contract

This document defines the structure contract for SKILL.md files in the org-\* skill family.

## Frontmatter (Required)

```yaml
---
name: org-{skill-name}
description: 'Use when: (1) first condition, (2) second condition, (3) third condition...'
---
```

## Section Order (Required)

1. **H1 Title** - Skill name in title case
2. **Overview** - 1-2 paragraphs describing purpose
3. **H2 Decision Tree** - 3-5 "Need to" questions
4. **H2 Quick Example** - 15-50 line TypeScript
5. **H2 Cross-References** - Links to related skills
6. **H2 Reference Files** - Links to references/

## Decision Tree Format

```markdown
### Need to [action verb phrase]?

**When**: [Contextual trigger - one sentence]
**Go to**: [references/filename.md](./references/filename.md)
```

## Quick Example Requirements

- Must compile as standalone TypeScript
- Must include file path comment
- Must use explicit return types
- Must include JSDoc on exported functions
- 15-50 lines maximum

## Cross-Reference Format

```markdown
- **[skill-name](../skill-name/SKILL.md)**: One-sentence relationship description
```

## Reference Files List Format

```markdown
- [references/filename.md](./references/filename.md): One-sentence purpose
```

## Line Count Constraint

**Maximum**: 150 lines (including frontmatter and blank lines)

## Example Skeleton

```markdown
---
name: org-authorization
description: 'Use when: (1) implementing authorization checks, (2) defining Actor/Action/Resource types, (3) building AuthorizationService, (4) adding new resource types to authorization.'
---

# Organization Authorization

Implement the core authorization pattern: "Can User X do Action Y on Resource Z?"

## Decision Tree

### Need to define authorization types?

**When**: Starting authorization implementation or adding new actors/resources
**Go to**: [references/core-types.md](./references/core-types.md)

### Need to implement the authorization service?

**When**: Building the service that evaluates policies
**Go to**: [references/authorization-service.md](./references/authorization-service.md)

### Need authorization patterns?

**When**: Implementing ownership, admin override, system actions, or delegation
**Go to**: [references/patterns.md](./references/patterns.md)

## Quick Example

\`\`\`typescript
// Usage in handler
const authz = new AuthorizationService(env.DB);
const result = await authz.can(
{ type: 'user', id: userId },
'delete',
{ type: 'project', id: projectId }
);
if (!result.allowed) {
return new Response('Forbidden', { status: 403 });
}
\`\`\`

## Cross-References

- **[security-review](../security-review/SKILL.md)**: Security audit of authorization implementation
- **[ddd-domain-modeling](../ddd-domain-modeling/SKILL.md)**: Actor and Resource as domain entities
- **[org-isolation](../org-isolation/SKILL.md)**: Ensuring cross-tenant isolation

## Reference Files

- [references/core-types.md](./references/core-types.md): Actor, Action, Resource, PolicyContext types
- [references/authorization-service.md](./references/authorization-service.md): AuthorizationService implementation
- [references/patterns.md](./references/patterns.md): Ownership, admin override, system actions, delegation
```
