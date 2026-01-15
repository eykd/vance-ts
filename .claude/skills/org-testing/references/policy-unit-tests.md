# Policy Unit Tests

**Purpose**: Unit test core authorization policies in isolation without database dependencies.

## When to Use

Use this reference when:

- Testing policy decision logic in isolation
- Validating role permissions quickly
- Building a comprehensive permission test suite
- Testing edge cases without database setup overhead

## Test Structure

```typescript
// src/domain/authorization/CorePolicy.spec.ts

import { describe, it, expect } from 'vitest';
import { CorePolicy } from './CorePolicy';
import type { Actor, Resource, PolicyContext } from './types';

describe('CorePolicy', () => {
  const policy = new CorePolicy();

  // Helper to create test actors
  const userActor = (id: string): Actor => ({ type: 'user', id });
  const systemActor = (reason: string): Actor => ({ type: 'system', reason });

  // Helper to create test resources
  const projectResource = (id: string): Resource => ({ type: 'project', id });
  const orgResource = (id: string): Resource => ({ type: 'organization', id });
});
```

## Test System Actors

```typescript
describe('system actors', () => {
  it('allows any action for system actors', async () => {
    const actor: Actor = { type: 'system', reason: 'Background job' };
    const resource: Resource = { type: 'project', id: 'project-1' };

    const result = await policy.check(actor, 'delete', resource, {});

    expect(result.allowed).toBe(true);
    expect(result.effectiveRole).toBe('system');
    expect(result.reason).toContain('System');
  });

  it('logs system reason in result', async () => {
    const actor: Actor = { type: 'system', reason: 'Scheduled maintenance' };

    const result = await policy.check(actor, 'update', projectResource('p1'), {});

    expect(result.reason).toContain('Scheduled maintenance');
  });
});
```

## Test Organization Roles

```typescript
describe('organization owners', () => {
  const ownerContext: PolicyContext = {
    organizationMembership: {
      organizationId: 'org-1',
      role: 'owner',
    },
    resourceOrganizationId: 'org-1',
  };

  it('allows all actions for organization owners', async () => {
    const actor = userActor('user-1');
    const resource = projectResource('project-1');

    for (const action of ['read', 'create', 'update', 'delete', 'invite', 'transfer']) {
      const result = await policy.check(actor, action, resource, ownerContext);
      expect(result.allowed).toBe(true);
      expect(result.effectiveRole).toBe('owner');
    }
  });
});

describe('organization admins', () => {
  const adminContext: PolicyContext = {
    organizationMembership: {
      organizationId: 'org-1',
      role: 'admin',
    },
    resourceOrganizationId: 'org-1',
  };

  it('allows most actions for admins', async () => {
    const actor = userActor('user-1');

    for (const action of ['read', 'create', 'update', 'delete', 'invite', 'remove']) {
      const result = await policy.check(actor, action, projectResource('p1'), adminContext);
      expect(result.allowed).toBe(true);
    }
  });

  it('denies ownership transfer for admins', async () => {
    const actor = userActor('user-1');
    const resource = orgResource('org-1');

    const result = await policy.check(actor, 'transfer', resource, adminContext);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('owner');
  });
});

describe('organization members', () => {
  const memberContext: PolicyContext = {
    organizationMembership: {
      organizationId: 'org-1',
      role: 'member',
    },
    resourceOrganizationId: 'org-1',
  };

  it('allows read and create for members', async () => {
    const actor = userActor('user-1');

    for (const action of ['read', 'create']) {
      const result = await policy.check(actor, action, projectResource('p1'), memberContext);
      expect(result.allowed).toBe(true);
    }
  });

  it('denies admin actions for members', async () => {
    const actor = userActor('user-1');

    for (const action of ['invite', 'remove', 'admin']) {
      const result = await policy.check(actor, action, projectResource('p1'), memberContext);
      expect(result.allowed).toBe(false);
    }
  });
});

describe('organization viewers', () => {
  const viewerContext: PolicyContext = {
    organizationMembership: {
      organizationId: 'org-1',
      role: 'viewer',
    },
    resourceOrganizationId: 'org-1',
  };

  it('allows only read for viewers', async () => {
    const actor = userActor('user-1');

    const readResult = await policy.check(actor, 'read', projectResource('p1'), viewerContext);
    expect(readResult.allowed).toBe(true);

    for (const action of ['create', 'update', 'delete']) {
      const result = await policy.check(actor, action, projectResource('p1'), viewerContext);
      expect(result.allowed).toBe(false);
    }
  });
});
```

## Test Cross-Organization Access

```typescript
describe('cross-organization access', () => {
  it('denies access to resources in other organizations', async () => {
    const actor = userActor('user-1');
    const resource = projectResource('project-1');
    const context: PolicyContext = {
      organizationMembership: {
        organizationId: 'org-1',
        role: 'admin',
      },
      resourceOrganizationId: 'org-2', // Different org!
    };

    const result = await policy.check(actor, 'read', resource, context);

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('different organization');
  });

  it('denies all actions when crossing organization boundary', async () => {
    const actor = userActor('user-1');
    const crossOrgContext: PolicyContext = {
      organizationMembership: {
        organizationId: 'org-1',
        role: 'owner',
      },
      resourceOrganizationId: 'org-2',
    };

    for (const action of ['read', 'create', 'update', 'delete']) {
      const result = await policy.check(actor, action, projectResource('p1'), crossOrgContext);
      expect(result.allowed).toBe(false);
    }
  });
});
```

## Test Resource Ownership

```typescript
describe('resource owners', () => {
  it('allows resource owner to modify their own resources', async () => {
    const actor = userActor('user-1');
    const context: PolicyContext = {
      organizationMembership: {
        organizationId: 'org-1',
        role: 'member', // Just a member
      },
      resourceOrganizationId: 'org-1',
      resourceOwner: 'user-1', // But owns this resource
    };

    const result = await policy.check(actor, 'delete', projectResource('p1'), context);

    expect(result.allowed).toBe(true);
    expect(result.effectiveRole).toBe('resource_owner');
  });

  it('denies non-owner members from deleting', async () => {
    const actor = userActor('user-1');
    const context: PolicyContext = {
      organizationMembership: {
        organizationId: 'org-1',
        role: 'member',
      },
      resourceOrganizationId: 'org-1',
      resourceOwner: 'user-2', // Different owner
    };

    const result = await policy.check(actor, 'delete', projectResource('p1'), context);

    expect(result.allowed).toBe(false);
  });
});
```

## Test No Membership

```typescript
describe('non-members', () => {
  it('denies all access to non-members', async () => {
    const actor = userActor('user-1');
    const context: PolicyContext = {
      // No organizationMembership!
      resourceOrganizationId: 'org-1',
    };

    for (const action of ['read', 'create', 'update', 'delete']) {
      const result = await policy.check(actor, action, projectResource('p1'), context);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not a member');
    }
  });
});
```

## Test Matrix Generator

```typescript
// Generate comprehensive permission matrix tests
describe('permission matrix', () => {
  const roles: Array<'owner' | 'admin' | 'member' | 'viewer'> = [
    'owner',
    'admin',
    'member',
    'viewer',
  ];

  const actions = ['read', 'create', 'update', 'delete', 'invite', 'remove', 'transfer'];

  const expectedPermissions: Record<string, string[]> = {
    owner: ['read', 'create', 'update', 'delete', 'invite', 'remove', 'transfer'],
    admin: ['read', 'create', 'update', 'delete', 'invite', 'remove'],
    member: ['read', 'create'],
    viewer: ['read'],
  };

  for (const role of roles) {
    for (const action of actions) {
      const shouldAllow = expectedPermissions[role].includes(action);

      it(`${role} ${shouldAllow ? 'CAN' : 'CANNOT'} ${action}`, async () => {
        const context: PolicyContext = {
          organizationMembership: { organizationId: 'org-1', role },
          resourceOrganizationId: 'org-1',
        };

        const result = await policy.check(
          userActor('user-1'),
          action,
          projectResource('p1'),
          context
        );

        expect(result.allowed).toBe(shouldAllow);
      });
    }
  }
});
```
