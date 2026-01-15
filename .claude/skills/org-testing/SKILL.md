---
name: org-testing
description: 'Use when: (1) testing authorization logic, (2) writing tenant isolation tests, (3) creating test fixtures for multi-tenant scenarios, (4) acceptance testing authorization flows, (5) questions about authorization test design.'
---

# Organization Testing

Test strategies for authorization logic, tenant isolation, and multi-tenant scenarios.

## Decision Tree

### Need to unit test authorization policies?

**When**: Testing core policy logic in isolation
**Go to**: [references/policy-unit-tests.md](./references/policy-unit-tests.md)

### Need to integration test the authorization service?

**When**: Testing full authorization flow with database
**Go to**: [references/integration-tests.md](./references/integration-tests.md)

### Need acceptance tests for tenant isolation?

**When**: Verifying cross-tenant access is properly denied
**Go to**: [references/acceptance-tests.md](./references/acceptance-tests.md)

## Quick Example

```typescript
// Cross-tenant isolation test
describe('Tenant Isolation', () => {
  it('denies access to other tenant projects', async () => {
    const { tenant1, tenant2 } = await createTwoTenantFixture(db);

    const result = await authz.can({ type: 'user', id: tenant1.owner.id }, 'read', {
      type: 'project',
      id: tenant2.project.id,
    });

    expect(result.allowed).toBe(false);
  });
});
```

## Test Categories

| Category    | Purpose             | Tools                   |
| ----------- | ------------------- | ----------------------- |
| Unit        | Test policy logic   | Vitest, no DB           |
| Integration | Test full service   | Vitest, Miniflare D1    |
| Acceptance  | Test HTTP endpoints | Vitest, test app helper |

## Test Fixtures

```typescript
// Create isolated tenants for testing
interface TenantFixture {
  organization: Organization;
  owner: User;
  admin: User;
  member: User;
  project: Project;
}

async function createTwoTenantFixture(db: D1Database): Promise<{
  tenant1: TenantFixture;
  tenant2: TenantFixture;
}> {
  // Creates two completely isolated organizations
  // with users, roles, and sample resources
}
```

## Key Test Scenarios

1. **Role-Based Access**: Each role gets expected permissions
2. **Cross-Tenant Denial**: Users cannot access other orgs
3. **Privilege Escalation**: Self-promotion is blocked
4. **System Actors**: Background jobs bypass authorization
5. **Resource Ownership**: Owners have full access

## Cross-References

- **[typescript-unit-testing](../typescript-unit-testing/SKILL.md)**: General unit testing patterns
- **[vitest-integration-testing](../vitest-integration-testing/SKILL.md)**: Integration testing with databases
- **[org-isolation](../org-isolation/SKILL.md)**: Tenant isolation patterns to test
- **[org-authorization](../org-authorization/SKILL.md)**: Authorization logic being tested

## Reference Files

- [references/policy-unit-tests.md](./references/policy-unit-tests.md): Unit testing CorePolicy
- [references/integration-tests.md](./references/integration-tests.md): AuthorizationService integration tests
- [references/acceptance-tests.md](./references/acceptance-tests.md): HTTP endpoint acceptance tests
