# Skill Inventory Contract

Complete inventory of skills and reference files to be created.

## Skills Summary

| Skill             | SKILL.md | References | Total Files |
| ----------------- | -------- | ---------- | ----------- |
| org-authorization | 1        | 3          | 4           |
| org-isolation     | 1        | 3          | 4           |
| org-data-model    | 1        | 4          | 5           |
| org-membership    | 1        | 3          | 4           |
| org-testing       | 1        | 3          | 4           |
| org-migration     | 1        | 3          | 4           |
| **Total**         | **6**    | **19**     | **25**      |

## Detailed Inventory

### org-authorization

**Directory**: `.claude/skills/org-authorization/`

| File                                | Type      | Purpose                                               |
| ----------------------------------- | --------- | ----------------------------------------------------- |
| SKILL.md                            | Skill     | Decision tree for authorization patterns              |
| references/core-types.md            | Reference | Actor, Action, Resource, PolicyContext types          |
| references/authorization-service.md | Reference | AuthorizationService implementation                   |
| references/patterns.md              | Reference | Ownership, admin override, system actions, delegation |

**Cross-references to**: security-review, ddd-domain-modeling, org-isolation

---

### org-isolation

**Directory**: `.claude/skills/org-isolation/`

| File                           | Type      | Purpose                                |
| ------------------------------ | --------- | -------------------------------------- |
| SKILL.md                       | Skill     | Decision tree for tenant isolation     |
| references/tenant-scoped-db.md | Reference | TenantScopedDb wrapper implementation  |
| references/audit-checklist.md  | Reference | Security audit checklist for isolation |
| references/testing-patterns.md | Reference | Cross-tenant test patterns             |

**Cross-references to**: d1-repository-implementation, org-authorization, org-testing

---

### org-data-model

**Directory**: `.claude/skills/org-data-model/`

| File                                 | Type      | Purpose                               |
| ------------------------------------ | --------- | ------------------------------------- |
| SKILL.md                             | Skill     | Decision tree: which evolution stage? |
| references/stage-1-single-user.md    | Reference | User owns resources schema            |
| references/stage-2-collaborators.md  | Reference | Resource-level sharing schema         |
| references/stage-3-organizations.md  | Reference | Organizations with memberships schema |
| references/stage-4-resource-perms.md | Reference | Per-resource permissions within org   |

**Cross-references to**: cloudflare-migrations, ddd-domain-modeling, org-membership

---

### org-membership

**Directory**: `.claude/skills/org-membership/`

| File                                | Type      | Purpose                               |
| ----------------------------------- | --------- | ------------------------------------- |
| SKILL.md                            | Skill     | Decision tree for membership patterns |
| references/role-hierarchy.md        | Reference | owner > admin > member > viewer       |
| references/privilege-escalation.md  | Reference | Prevention patterns                   |
| references/membership-management.md | Reference | Invite, remove, transfer ownership    |

**Cross-references to**: org-authorization, security-review, org-data-model

---

### org-testing

**Directory**: `.claude/skills/org-testing/`

| File                            | Type      | Purpose                                 |
| ------------------------------- | --------- | --------------------------------------- |
| SKILL.md                        | Skill     | Decision tree for authorization testing |
| references/policy-unit-tests.md | Reference | CorePolicy unit test patterns           |
| references/integration-tests.md | Reference | AuthorizationService integration tests  |
| references/acceptance-tests.md  | Reference | Tenant isolation acceptance tests       |

**Cross-references to**: typescript-unit-testing, vitest-integration-testing, org-isolation

---

### org-migration

**Directory**: `.claude/skills/org-migration/`

| File                               | Type      | Purpose                                |
| ---------------------------------- | --------- | -------------------------------------- |
| SKILL.md                           | Skill     | Decision tree for migration strategy   |
| references/shadow-organizations.md | Reference | Personal organization per user pattern |
| references/feature-flags.md        | Reference | Gradual rollout with KV flags          |
| references/database-backfill.md    | Reference | Schema migration and data backfill     |

**Cross-references to**: cloudflare-migrations, kv-session-management, org-data-model

## Validation Checklist

For each skill:

- [ ] SKILL.md exists and follows template
- [ ] SKILL.md is under 150 lines
- [ ] All listed reference files exist
- [ ] All reference files follow template
- [ ] Cross-references use correct paths
- [ ] Code examples compile (TypeScript strict mode)

## README.md Updates

After skills are created, update `.claude/skills/README.md`:

1. Add new section: "### Multi-Tenant Boundaries"
2. Add entry for each skill with description
3. Add skill chain documentation

```markdown
### Multi-Tenant Boundaries

**[org-authorization](./org-authorization/SKILL.md)**

- **Use when:** Implementing authorization checks, defining Actor/Action/Resource types
- **Provides:** CorePolicy, AuthorizationService, ownership patterns
- **Cross-references:** security-review, ddd-domain-modeling, org-isolation

[... remaining skills ...]

**Multi-Tenant Chain:**
\`\`\`
org-authorization → org-isolation → org-data-model → org-membership → org-testing → org-migration
\`\`\`
```
