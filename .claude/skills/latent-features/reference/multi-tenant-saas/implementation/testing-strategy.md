# testing-strategy.md

# Testing Strategy

**Purpose**: Comprehensive testing strategy for multi-tenant SaaS authorization, including unit tests, integration tests, and acceptance tests.

## Testing Pyramid

```
        /\
       /  \          Acceptance Tests (End-to-end HTTP)
      /____\         - Tenant isolation at API level
     /      \        - Role-based access workflows
    /        \       - Session security
   /__________\
  /            \     Integration Tests (with D1)
 /              \    - Full authorization flow
/________________\   - Database context loading
                     - Multi-org scenarios

 Unit Tests (Pure functions)
 - Policy decision logic
 - Role permissions
 - Type guards
```

## Unit Tests: Policy Logic

```typescript
// src/domain/authorization/CorePolicy.spec.ts

describe('CorePolicy', () => {
  const policy = new CorePolicy();

  describe('system actors', () => {
    it('allows any action for system actors', async () => {
      const actor: Actor = { type: 'system', reason: 'Background job' };
      const resource: Resource = { type: 'project', id: 'project-1' };

      const result = await policy.check(actor, 'delete', resource, {});

      expect(result.allowed).toBe(true);
      expect(result.effectiveRole).toBe('system');
    });
  });

  describe('organization owners', () => {
    it('allows all actions for organization owners', async () => {
      const context: PolicyContext = {
        organizationMembership: { organizationId: 'org-1', role: 'owner' },
        resourceOrganizationId: 'org-1',
      };

      for (const action of ['read', 'create', 'update', 'delete', 'transfer']) {
        const result = await policy.check(userActor('u1'), action, projectResource('p1'), context);
        expect(result.allowed).toBe(true);
        expect(result.effectiveRole).toBe('owner');
      }
    });
  });

  describe('cross-organization access', () => {
    it('denies access to resources in other organizations', async () => {
      const context: PolicyContext = {
        organizationMembership: { organizationId: 'org-1', role: 'admin' },
        resourceOrganizationId: 'org-2', // Different org!
      };

      const result = await policy.check(userActor('u1'), 'read', projectResource('p1'), context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('different organization');
    });
  });
});
```

## Integration Tests: Database Context

```typescript
// src/application/services/AuthorizationService.integration.test.ts

import { env } from 'cloudflare:test';

describe('AuthorizationService Integration', () => {
  let authz: AuthorizationService;

  beforeEach(async () => {
    authz = new AuthorizationService(env.DB);

    await env.DB.exec(`
      INSERT INTO users (id, email, password_hash) VALUES
        ('user-owner', 'owner@test.com', 'hash'),
        ('user-admin', 'admin@test.com', 'hash'),
        ('user-member', 'member@test.com', 'hash'),
        ('user-viewer', 'viewer@test.com', 'hash');

      INSERT INTO organizations (id, name, slug, owner_id) VALUES
        ('org-1', 'Test Org', 'test-org', 'user-owner');

      INSERT INTO organization_memberships (id, organization_id, user_id, role) VALUES
        ('mem-1', 'org-1', 'user-owner', 'owner'),
        ('mem-2', 'org-1', 'user-admin', 'admin'),
        ('mem-3', 'org-1', 'user-member', 'member'),
        ('mem-4', 'org-1', 'user-viewer', 'viewer');

      INSERT INTO projects (id, organization_id, owner_id, name) VALUES
        ('project-1', 'org-1', 'user-member', 'Test Project');
    `);
  });

  describe('organization owner', () => {
    it('can delete any project in organization', async () => {
      const result = await authz.can({ type: 'user', id: 'user-owner' }, 'delete', {
        type: 'project',
        id: 'project-1',
      });

      expect(result.allowed).toBe(true);
      expect(result.effectiveRole).toBe('owner');
    });
  });

  describe('resource owner', () => {
    it('allows project creator to delete their project', async () => {
      const result = await authz.can({ type: 'user', id: 'user-member' }, 'delete', {
        type: 'project',
        id: 'project-1',
      });

      expect(result.allowed).toBe(true);
      expect(result.effectiveRole).toBe('resource_owner');
    });
  });
});
```

## Acceptance Tests: HTTP Endpoints

```typescript
// tests/acceptance/tenantIsolation.test.ts

describe('Tenant Isolation Acceptance', () => {
  let app: TestApp;
  let org1User: TestUser;
  let org1Project: TestProject;
  let org2User: TestUser;

  beforeEach(async () => {
    app = await createTestApp();

    org1User = await app.createUser('user1@test.com');
    const org1 = await app.createOrganization('Org 1', org1User.id);
    org1Project = await app.createProject('Project 1', org1.id, org1User.id);

    org2User = await app.createUser('user2@test.com');
    await app.createOrganization('Org 2', org2User.id);
  });

  describe('cross-tenant read prevention', () => {
    it('prevents accessing projects from other organizations', async () => {
      const response = await app.request(`/projects/${org1Project.id}`, {
        user: org2User,
      });

      expect(response.status).toBe(403);
    });

    it('allows accessing own organization projects', async () => {
      const response = await app.request(`/projects/${org1Project.id}`, {
        user: org1User,
      });

      expect(response.status).toBe(200);
    });
  });

  describe('cross-tenant modification prevention', () => {
    it('prevents modifying projects through organization boundary', async () => {
      const response = await app.request(`/projects/${org1Project.id}`, {
        method: 'POST',
        user: org2User,
        body: { name: 'Hacked!' },
      });

      expect(response.status).toBe(403);

      // Verify project unchanged
      const project = await app.getProject(org1Project.id);
      expect(project?.name).toBe('Project 1');
    });
  });
});
```

## Test Coverage Matrix

| Dimension        | Coverage Areas                                 |
| ---------------- | ---------------------------------------------- |
| Roles            | owner, admin, member, viewer                   |
| Actions          | read, create, update, delete, invite, remove   |
| Resources        | organization, project, document, membership    |
| Cross-tenant     | User A → Org B resources                       |
| Privilege escal  | Self-promotion, admin granting admin           |
| Resource owner   | Member owns resource                           |
| Session security | Role change invalidation, removal invalidation |

## Vitest Configuration

```typescript
// vitest.config.ts
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        isolatedStorage: true,
        miniflare: {
          d1Databases: ['DB'],
        },
      },
    },
  },
});
```

## Cross-References

- **isolation-audit.md**: Audit checklist
- **authorization-service.md**: Implementation to test
