---
name: org-migration
description: 'Use when: (1) migrating from single-user to multi-tenant, (2) planning organization rollout strategy, (3) implementing shadow organizations, (4) creating database backfill scripts, (5) questions about gradual feature rollout.'
---

# Organization Migration

Strategies for migrating from single-user to multi-tenant without breaking existing users.

## Decision Tree

### Which migration strategy should I use?

**Need transparent migration?**

- Users shouldn't see organizations until needed
- **Go to**: [references/shadow-organizations.md](./references/shadow-organizations.md)

**Need gradual rollout?**

- Want to test with subset of users first
- **Go to**: [references/feature-flags.md](./references/feature-flags.md)

**Need one-time database migration?**

- Simple app, can migrate in maintenance window
- **Go to**: [references/database-backfill.md](./references/database-backfill.md)

## Strategy Comparison

| Strategy      | Risk | Complexity | Rollback              |
| ------------- | ---- | ---------- | --------------------- |
| Shadow Orgs   | Low  | Medium     | Easy (ignore org)     |
| Feature Flags | Low  | High       | Easy (disable flag)   |
| DB Backfill   | High | Low        | Hard (restore backup) |

## Quick Example

```typescript
// Shadow organization pattern
async function ensureUserHasOrganization(db: D1Database, userId: string): Promise<Organization> {
  // Check for existing personal org
  const existing = await db
    .prepare(
      `
      SELECT o.* FROM organizations o
      JOIN organization_memberships om ON o.id = om.organization_id
      WHERE om.user_id = ? AND o.type = 'personal'
    `
    )
    .bind(userId)
    .first<OrganizationRow>();

  if (existing) return toOrganization(existing);

  // Create personal organization transparently
  return createPersonalOrganization(db, userId);
}
```

## Migration Principles

1. **Non-breaking**: Existing users continue working
2. **Gradual**: Roll out to subset first
3. **Reversible**: Ability to rollback
4. **Testable**: Verify in staging first

## Migration Checklist

| Step | Description                             |
| ---- | --------------------------------------- |
| 1    | Add organization_id column (nullable)   |
| 2    | Create organizations/memberships tables |
| 3    | Deploy code with dual-path logic        |
| 4    | Backfill existing resources             |
| 5    | Enable for test users                   |
| 6    | Gradually increase rollout              |
| 7    | Make organization_id required           |
| 8    | Remove legacy code paths                |

## Cross-References

- **[cloudflare-migrations](../cloudflare-migrations/SKILL.md)**: D1 migration file patterns
- **[kv-session-management](../kv-session-management/SKILL.md)**: Feature flag storage
- **[org-data-model](../org-data-model/SKILL.md)**: Target schema stages
- **[org-authorization](../org-authorization/SKILL.md)**: Authorization during migration

## Reference Files

- [references/shadow-organizations.md](./references/shadow-organizations.md): Personal org per user pattern
- [references/feature-flags.md](./references/feature-flags.md): Gradual rollout with KV
- [references/database-backfill.md](./references/database-backfill.md): Schema migration scripts
