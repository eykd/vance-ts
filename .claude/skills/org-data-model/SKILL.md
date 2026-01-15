---
name: org-data-model
description: 'Use when: (1) choosing data model complexity level, (2) planning schema for single-user to enterprise evolution, (3) implementing organization tables, (4) adding membership models, (5) questions about when to upgrade complexity.'
---

# Organization Data Model

Choose the right data model stage for your application's current needs. Evolve when pain grows, not before.

## Decision Tree

### Which stage should I use?

**Q1: Do multiple humans need to access the same data?**

- No → **Stage 1: Single User** - [references/stage-1-single-user.md](./references/stage-1-single-user.md)
- Yes → Continue to Q2

**Q2: Do they need different access levels?**

- No → **Stage 2: Collaborators** - [references/stage-2-collaborators.md](./references/stage-2-collaborators.md)
- Yes → Continue to Q3

**Q3: Do you need organizational boundaries (billing, compliance, data isolation)?**

- No → **Stage 4: Resource Permissions** - [references/stage-4-resource-perms.md](./references/stage-4-resource-perms.md)
- Yes → **Stage 3: Organizations** - [references/stage-3-organizations.md](./references/stage-3-organizations.md)

## Stage Overview

| Stage             | Description                  | When to Use                  |
| ----------------- | ---------------------------- | ---------------------------- |
| 1. Single User    | User owns resources directly | Solo users, no sharing       |
| 2. Collaborators  | Per-resource sharing         | Sharing without global roles |
| 3. Organizations  | Org memberships with roles   | Teams, billing boundaries    |
| 4. Resource Perms | Fine-grained within orgs     | Complex permission models    |

## Quick Schema Reference

```sql
-- Stage 1: Simple ownership
SELECT * FROM projects WHERE owner_id = ?

-- Stage 2: Ownership + collaborators
SELECT * FROM projects p
LEFT JOIN project_collaborators pc ON p.id = pc.project_id
WHERE p.owner_id = ? OR pc.user_id = ?

-- Stage 3: Organization scoped
SELECT * FROM projects WHERE organization_id = ?

-- Stage 4: Org + resource permissions
SELECT * FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
WHERE p.organization_id = ? OR pm.user_id = ?
```

## Evolution Signals

| Signal                         | Current Stage | Action                        |
| ------------------------------ | ------------- | ----------------------------- |
| "Share with my team"           | Stage 1       | → Stage 2: Add collaborators  |
| "Make someone else admin"      | Stage 2       | → Add roles to Stage 2        |
| "Separate billing"             | Any           | → Stage 3: Add organizations  |
| "Different access per project" | Stage 3       | → Stage 4: Add resource perms |

## Cross-References

- **[cloudflare-migrations](../cloudflare-migrations/SKILL.md)**: Creating migration files for schema changes
- **[ddd-domain-modeling](../ddd-domain-modeling/SKILL.md)**: Domain entities for organizations
- **[org-membership](../org-membership/SKILL.md)**: Role hierarchy and membership management
- **[org-authorization](../org-authorization/SKILL.md)**: Authorization patterns for each stage

## Reference Files

- [references/stage-1-single-user.md](./references/stage-1-single-user.md): User owns resources directly
- [references/stage-2-collaborators.md](./references/stage-2-collaborators.md): Resource-level sharing
- [references/stage-3-organizations.md](./references/stage-3-organizations.md): Organizations with memberships
- [references/stage-4-resource-perms.md](./references/stage-4-resource-perms.md): Per-resource permissions within orgs
