# AuthorizationService Integration Tests

**Purpose**: Test the full authorization flow with database interactions using Miniflare D1.

## When to Use

Use this reference when:

- Testing authorization with real database queries
- Verifying context loading from database
- Testing the complete can/require flow
- Validating database schema supports authorization

## Test Setup

```typescript
// src/application/services/AuthorizationService.integration.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { AuthorizationService } from './AuthorizationService';

describe('AuthorizationService Integration', () => {
  let authz: AuthorizationService;

  beforeEach(async () => {
    authz = new AuthorizationService(env.DB);

    // Set up test data
    await env.DB.exec(`
      INSERT INTO users (id, email, email_normalized, password_hash) VALUES
        ('user-owner', 'owner@test.com', 'owner@test.com', 'hash'),
        ('user-admin', 'admin@test.com', 'admin@test.com', 'hash'),
        ('user-member', 'member@test.com', 'member@test.com', 'hash'),
        ('user-viewer', 'viewer@test.com', 'viewer@test.com', 'hash'),
        ('user-outsider', 'outsider@test.com', 'outsider@test.com', 'hash');

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
});
```

## Test Owner Permissions

```typescript
describe('organization owner', () => {
  it('can delete any project in organization', async () => {
    const result = await authz.can({ type: 'user', id: 'user-owner' }, 'delete', {
      type: 'project',
      id: 'project-1',
    });

    expect(result.allowed).toBe(true);
    expect(result.effectiveRole).toBe('owner');
  });

  it('can transfer organization ownership', async () => {
    const result = await authz.can({ type: 'user', id: 'user-owner' }, 'transfer', {
      type: 'organization',
      id: 'org-1',
    });

    expect(result.allowed).toBe(true);
  });
});
```

## Test Admin Permissions

```typescript
describe('organization admin', () => {
  it('can delete any project in organization', async () => {
    const result = await authz.can({ type: 'user', id: 'user-admin' }, 'delete', {
      type: 'project',
      id: 'project-1',
    });

    expect(result.allowed).toBe(true);
    expect(result.effectiveRole).toBe('admin');
  });

  it('cannot transfer organization ownership', async () => {
    const result = await authz.can({ type: 'user', id: 'user-admin' }, 'transfer', {
      type: 'organization',
      id: 'org-1',
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('owner');
  });
});
```

## Test Resource Ownership

```typescript
describe('resource owner', () => {
  it('allows project creator to delete their project', async () => {
    const result = await authz.can({ type: 'user', id: 'user-member' }, 'delete', {
      type: 'project',
      id: 'project-1',
    });

    expect(result.allowed).toBe(true);
    expect(result.effectiveRole).toBe('resource_owner');
  });

  it('denies member deletion of others project', async () => {
    // Create another project owned by admin
    await env.DB.exec(`
      INSERT INTO projects (id, organization_id, owner_id, name) VALUES
        ('project-2', 'org-1', 'user-admin', 'Admin Project');
    `);

    const result = await authz.can({ type: 'user', id: 'user-member' }, 'delete', {
      type: 'project',
      id: 'project-2',
    });

    expect(result.allowed).toBe(false);
  });
});
```

## Test Viewer Permissions

```typescript
describe('organization viewer', () => {
  it('can read projects', async () => {
    const result = await authz.can({ type: 'user', id: 'user-viewer' }, 'read', {
      type: 'project',
      id: 'project-1',
    });

    expect(result.allowed).toBe(true);
    expect(result.effectiveRole).toBe('viewer');
  });

  it('cannot create projects', async () => {
    const result = await authz.can({ type: 'user', id: 'user-viewer' }, 'create', {
      type: 'project',
      id: 'project-new',
    });

    expect(result.allowed).toBe(false);
  });
});
```

## Test Non-Member Access

```typescript
describe('non-member access', () => {
  it('denies outsider access to project', async () => {
    const result = await authz.can({ type: 'user', id: 'user-outsider' }, 'read', {
      type: 'project',
      id: 'project-1',
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('not a member');
  });

  it('denies all actions for outsiders', async () => {
    const actions = ['read', 'create', 'update', 'delete'];

    for (const action of actions) {
      const result = await authz.can({ type: 'user', id: 'user-outsider' }, action, {
        type: 'project',
        id: 'project-1',
      });

      expect(result.allowed).toBe(false);
    }
  });
});
```

## Test System Actors

```typescript
describe('system actors', () => {
  it('allows system actor to access any resource', async () => {
    const result = await authz.can({ type: 'system', reason: 'Background migration' }, 'update', {
      type: 'project',
      id: 'project-1',
    });

    expect(result.allowed).toBe(true);
    expect(result.effectiveRole).toBe('system');
  });
});
```

## Test require() Method

```typescript
describe('require method', () => {
  it('does not throw when authorized', async () => {
    await expect(
      authz.require({ type: 'user', id: 'user-owner' }, 'read', {
        type: 'project',
        id: 'project-1',
      })
    ).resolves.not.toThrow();
  });

  it('throws AuthorizationError when denied', async () => {
    await expect(
      authz.require({ type: 'user', id: 'user-outsider' }, 'read', {
        type: 'project',
        id: 'project-1',
      })
    ).rejects.toThrow('AuthorizationError');
  });

  it('includes context in error', async () => {
    try {
      await authz.require({ type: 'user', id: 'user-outsider' }, 'delete', {
        type: 'project',
        id: 'project-1',
      });
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error.context.actor.id).toBe('user-outsider');
      expect(error.context.action).toBe('delete');
      expect(error.context.resource.id).toBe('project-1');
    }
  });
});
```

## Test Multi-Organization Setup

```typescript
describe('multi-organization isolation', () => {
  beforeEach(async () => {
    // Add second organization
    await env.DB.exec(`
      INSERT INTO organizations (id, name, slug, owner_id) VALUES
        ('org-2', 'Other Org', 'other-org', 'user-outsider');

      INSERT INTO organization_memberships (id, organization_id, user_id, role) VALUES
        ('mem-5', 'org-2', 'user-outsider', 'owner');

      INSERT INTO projects (id, organization_id, owner_id, name) VALUES
        ('project-org2', 'org-2', 'user-outsider', 'Other Project');
    `);
  });

  it('org-1 owner cannot access org-2 projects', async () => {
    const result = await authz.can({ type: 'user', id: 'user-owner' }, 'read', {
      type: 'project',
      id: 'project-org2',
    });

    expect(result.allowed).toBe(false);
  });

  it('org-2 owner cannot access org-1 projects', async () => {
    const result = await authz.can({ type: 'user', id: 'user-outsider' }, 'read', {
      type: 'project',
      id: 'project-1',
    });

    expect(result.allowed).toBe(false);
  });
});
```

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
