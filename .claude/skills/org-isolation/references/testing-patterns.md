# Tenant Isolation Testing Patterns

**Purpose**: Test patterns to verify cross-tenant access is properly denied.

## When to Use

Use this reference when:

- Writing acceptance tests for tenant isolation
- Creating security regression tests
- Building test fixtures for multi-tenant scenarios
- Verifying authorization boundaries work correctly

## Test Setup Pattern

```typescript
// tests/helpers/multiTenantFixtures.ts

export interface TenantFixture {
  organization: Organization;
  owner: User;
  admin: User;
  member: User;
  project: Project;
  document: Document;
}

/**
 * Create isolated test fixtures for two organizations.
 * Used to verify cross-tenant access is denied.
 */
export async function createTwoTenantFixture(
  db: D1Database
): Promise<{ tenant1: TenantFixture; tenant2: TenantFixture }> {
  // Create Tenant 1
  const tenant1 = await createTenantFixture(db, 'tenant-1');

  // Create Tenant 2
  const tenant2 = await createTenantFixture(db, 'tenant-2');

  return { tenant1, tenant2 };
}

async function createTenantFixture(db: D1Database, prefix: string): Promise<TenantFixture> {
  const owner = await createUser(db, `owner-${prefix}@test.com`);
  const admin = await createUser(db, `admin-${prefix}@test.com`);
  const member = await createUser(db, `member-${prefix}@test.com`);

  const organization = await createOrganization(db, {
    name: `Organization ${prefix}`,
    slug: prefix,
    ownerId: owner.id,
  });

  await createMembership(db, organization.id, admin.id, 'admin');
  await createMembership(db, organization.id, member.id, 'member');

  const project = await createProject(db, {
    name: `Project ${prefix}`,
    organizationId: organization.id,
    ownerId: member.id,
  });

  const document = await createDocument(db, {
    title: `Document ${prefix}`,
    projectId: project.id,
    createdBy: member.id,
  });

  return { organization, owner, admin, member, project, document };
}
```

## Cross-Tenant Access Tests

```typescript
// tests/isolation/crossTenantAccess.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { createTwoTenantFixture } from '../helpers/multiTenantFixtures';
import { AuthorizationService } from '../../src/application/services/AuthorizationService';

describe('Cross-Tenant Access Prevention', () => {
  let tenant1: TenantFixture;
  let tenant2: TenantFixture;
  let authz: AuthorizationService;

  beforeEach(async () => {
    const fixtures = await createTwoTenantFixture(env.DB);
    tenant1 = fixtures.tenant1;
    tenant2 = fixtures.tenant2;
    authz = new AuthorizationService(env.DB);
  });

  describe('project access', () => {
    it('tenant1 owner CANNOT read tenant2 project', async () => {
      const result = await authz.can({ type: 'user', id: tenant1.owner.id }, 'read', {
        type: 'project',
        id: tenant2.project.id,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not a member');
    });

    it('tenant1 admin CANNOT update tenant2 project', async () => {
      const result = await authz.can({ type: 'user', id: tenant1.admin.id }, 'update', {
        type: 'project',
        id: tenant2.project.id,
      });

      expect(result.allowed).toBe(false);
    });

    it('tenant1 member CANNOT delete tenant2 project', async () => {
      const result = await authz.can({ type: 'user', id: tenant1.member.id }, 'delete', {
        type: 'project',
        id: tenant2.project.id,
      });

      expect(result.allowed).toBe(false);
    });
  });

  describe('organization access', () => {
    it('tenant1 owner CANNOT invite to tenant2 org', async () => {
      const result = await authz.can({ type: 'user', id: tenant1.owner.id }, 'invite', {
        type: 'organization',
        id: tenant2.organization.id,
      });

      expect(result.allowed).toBe(false);
    });

    it('tenant1 admin CANNOT remove members from tenant2', async () => {
      const result = await authz.can({ type: 'user', id: tenant1.admin.id }, 'remove', {
        type: 'membership',
        id: tenant2.member.id,
      });

      expect(result.allowed).toBe(false);
    });
  });

  describe('document access', () => {
    it('tenant1 users CANNOT access tenant2 documents', async () => {
      for (const user of [tenant1.owner, tenant1.admin, tenant1.member]) {
        const result = await authz.can({ type: 'user', id: user.id }, 'read', {
          type: 'document',
          id: tenant2.document.id,
        });

        expect(result.allowed).toBe(false);
      }
    });
  });
});
```

## HTTP Endpoint Tests

```typescript
// tests/isolation/httpEndpoints.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp } from '../helpers/testApp';

describe('HTTP Endpoint Tenant Isolation', () => {
  let app: TestApp;
  let tenant1: TenantFixture;
  let tenant2: TenantFixture;

  beforeEach(async () => {
    app = await createTestApp();
    const fixtures = await createTwoTenantFixture(app.db);
    tenant1 = fixtures.tenant1;
    tenant2 = fixtures.tenant2;
  });

  describe('GET /projects/:id', () => {
    it('returns 403 when accessing other tenant project', async () => {
      const response = await app.request(`/projects/${tenant2.project.id}`, {
        user: tenant1.owner,
      });

      expect(response.status).toBe(403);
    });

    it('returns 200 when accessing own project', async () => {
      const response = await app.request(`/projects/${tenant1.project.id}`, {
        user: tenant1.owner,
      });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /projects/:id/delete', () => {
    it('returns 403 and preserves other tenant project', async () => {
      const response = await app.request(`/projects/${tenant2.project.id}/delete`, {
        method: 'POST',
        user: tenant1.owner,
      });

      expect(response.status).toBe(403);

      // Verify project still exists
      const project = await app.getProject(tenant2.project.id);
      expect(project).not.toBeNull();
    });
  });

  describe('GET /projects (list)', () => {
    it('returns only own tenant projects', async () => {
      const response = await app.request('/projects', { user: tenant1.owner });

      expect(response.status).toBe(200);
      const projects = await response.json();

      // Should only see tenant1's project
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe(tenant1.project.id);

      // Should NOT see tenant2's project
      expect(projects.find((p: Project) => p.id === tenant2.project.id)).toBeUndefined();
    });
  });
});
```

## Database Layer Tests

```typescript
// tests/isolation/databaseLayer.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { createTenantScopedDb } from '../../src/infrastructure/middleware/tenantIsolation';

describe('TenantScopedDb Isolation', () => {
  let tenant1Db: TenantScopedDb;
  let tenant2Db: TenantScopedDb;
  let tenant1: TenantFixture;
  let tenant2: TenantFixture;

  beforeEach(async () => {
    const fixtures = await createTwoTenantFixture(env.DB);
    tenant1 = fixtures.tenant1;
    tenant2 = fixtures.tenant2;

    tenant1Db = createTenantScopedDb(env.DB, tenant1.organization.id);
    tenant2Db = createTenantScopedDb(env.DB, tenant2.organization.id);
  });

  it('tenant1Db cannot find tenant2 project', async () => {
    const project = await tenant1Db.projects.findById(tenant2.project.id);
    expect(project).toBeNull();
  });

  it('tenant1Db list returns only tenant1 projects', async () => {
    const projects = await tenant1Db.projects.list();
    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe(tenant1.project.id);
  });

  it('tenant1Db update on tenant2 project does nothing', async () => {
    await expect(
      tenant1Db.projects.update(tenant2.project.id, { name: 'Hacked!' })
    ).rejects.toThrow('not found');

    // Verify name unchanged
    const project = await tenant2Db.projects.findById(tenant2.project.id);
    expect(project?.name).not.toBe('Hacked!');
  });

  it('tenant1Db delete on tenant2 project does nothing', async () => {
    await expect(tenant1Db.projects.delete(tenant2.project.id)).rejects.toThrow('not found');

    // Verify still exists
    const project = await tenant2Db.projects.findById(tenant2.project.id);
    expect(project).not.toBeNull();
  });
});
```

## Assertion Helpers

```typescript
// tests/helpers/isolationAssertions.ts

/**
 * Assert that an authorization result denies cross-tenant access.
 */
export function assertCrossTenantDenied(result: AuthorizationResult, context?: string): void {
  expect(result.allowed, context).toBe(false);
  expect(result.reason).toMatch(/(not a member|different organization|access denied)/i);
}

/**
 * Assert that a list operation returns only same-tenant items.
 */
export function assertNoLeakedData<T extends { organizationId: string }>(
  items: T[],
  expectedOrgId: string
): void {
  for (const item of items) {
    expect(item.organizationId).toBe(expectedOrgId);
  }
}

/**
 * Assert that accessing another tenant's resource fails appropriately.
 */
export async function assertResourceIsolated(
  authz: AuthorizationService,
  actorId: string,
  resourceType: ResourceType,
  resourceId: string
): Promise<void> {
  for (const action of ['read', 'update', 'delete'] as Action[]) {
    const result = await authz.can({ type: 'user', id: actorId }, action, {
      type: resourceType,
      id: resourceId,
    });
    assertCrossTenantDenied(result, `${action} should be denied`);
  }
}
```

## Test Coverage Matrix

Ensure tests cover all combinations:

| Actor Tenant | Resource Tenant | Action | Expected   |
| ------------ | --------------- | ------ | ---------- |
| Tenant A     | Tenant A        | read   | ✅ Allowed |
| Tenant A     | Tenant A        | update | ✅ Allowed |
| Tenant A     | Tenant A        | delete | ✅ Allowed |
| Tenant A     | Tenant B        | read   | ❌ Denied  |
| Tenant A     | Tenant B        | update | ❌ Denied  |
| Tenant A     | Tenant B        | delete | ❌ Denied  |
| Tenant B     | Tenant A        | read   | ❌ Denied  |
| Tenant B     | Tenant A        | update | ❌ Denied  |
| Tenant B     | Tenant A        | delete | ❌ Denied  |
