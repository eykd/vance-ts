# Authorization Acceptance Tests

**Purpose**: End-to-end tests for authorization at the HTTP endpoint level.

## When to Use

Use this reference when:

- Testing complete user workflows
- Verifying authorization middleware works correctly
- Testing tenant isolation at HTTP level
- Creating regression tests for security issues

## Test App Helper

```typescript
// tests/helpers/testApp.ts

import { Hono } from 'hono';
import app from '../../src/router';

interface TestUser {
  id: string;
  email: string;
  sessionToken: string;
}

interface TestOrganization {
  id: string;
  name: string;
  slug: string;
}

interface TestProject {
  id: string;
  name: string;
  organizationId: string;
}

export class TestApp {
  constructor(public db: D1Database) {}

  async createUser(email: string): Promise<TestUser> {
    const id = crypto.randomUUID();
    await this.db
      .prepare(
        `
        INSERT INTO users (id, email, email_normalized, password_hash)
        VALUES (?, ?, ?, 'test-hash')
      `
      )
      .bind(id, email, email.toLowerCase())
      .run();

    const sessionToken = crypto.randomUUID();
    await this.db
      .prepare(
        `
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (?, ?, datetime('now', '+1 day'))
      `
      )
      .bind(sessionToken, id)
      .run();

    return { id, email, sessionToken };
  }

  async createOrganization(name: string, ownerId: string): Promise<TestOrganization> {
    const id = crypto.randomUUID();
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    await this.db
      .prepare(
        `
        INSERT INTO organizations (id, name, slug, owner_id)
        VALUES (?, ?, ?, ?)
      `
      )
      .bind(id, name, slug, ownerId)
      .run();

    await this.db
      .prepare(
        `
        INSERT INTO organization_memberships (id, organization_id, user_id, role)
        VALUES (?, ?, ?, 'owner')
      `
      )
      .bind(crypto.randomUUID(), id, ownerId)
      .run();

    return { id, name, slug };
  }

  async createProject(name: string, organizationId: string, ownerId: string): Promise<TestProject> {
    const id = crypto.randomUUID();

    await this.db
      .prepare(
        `
        INSERT INTO projects (id, organization_id, owner_id, name)
        VALUES (?, ?, ?, ?)
      `
      )
      .bind(id, organizationId, ownerId, name)
      .run();

    return { id, name, organizationId };
  }

  async addMember(
    orgId: string,
    userId: string,
    role: 'admin' | 'member' | 'viewer'
  ): Promise<void> {
    await this.db
      .prepare(
        `
        INSERT INTO organization_memberships (id, organization_id, user_id, role)
        VALUES (?, ?, ?, ?)
      `
      )
      .bind(crypto.randomUUID(), orgId, userId, role)
      .run();
  }

  async request(
    path: string,
    options: {
      method?: string;
      user?: TestUser;
      body?: unknown;
    } = {}
  ): Promise<Response> {
    const headers: Record<string, string> = {};

    if (options.user) {
      headers['Cookie'] = `session=${options.user.sessionToken}`;
    }

    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    return app.request(path, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  }

  async getProject(id: string): Promise<TestProject | null> {
    return this.db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first<TestProject>();
  }
}

export async function createTestApp(): Promise<TestApp> {
  const { env } = await import('cloudflare:test');
  return new TestApp(env.DB);
}
```

## Tenant Isolation Tests

```typescript
// tests/acceptance/tenantIsolation.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestApp, TestApp } from '../helpers/testApp';

describe('Tenant Isolation Acceptance', () => {
  let app: TestApp;
  let org1User: TestUser;
  let org1: TestOrganization;
  let org1Project: TestProject;
  let org2User: TestUser;
  let org2: TestOrganization;

  beforeEach(async () => {
    app = await createTestApp();

    // Create two organizations with projects
    org1User = await app.createUser('user1@test.com');
    org1 = await app.createOrganization('Org 1', org1User.id);
    org1Project = await app.createProject('Project 1', org1.id, org1User.id);

    org2User = await app.createUser('user2@test.com');
    org2 = await app.createOrganization('Org 2', org2User.id);
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

    it('prevents deleting projects in other organizations', async () => {
      const response = await app.request(`/projects/${org1Project.id}/delete`, {
        method: 'POST',
        user: org2User,
      });

      expect(response.status).toBe(403);

      // Verify project still exists
      const project = await app.getProject(org1Project.id);
      expect(project).not.toBeNull();
    });
  });

  describe('project listing isolation', () => {
    it('returns only own organization projects', async () => {
      // Create project in org2
      await app.createProject('Org 2 Project', org2.id, org2User.id);

      const response = await app.request('/projects', { user: org1User });

      expect(response.status).toBe(200);
      const projects = await response.json();

      // Should only see org1's project
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe(org1Project.id);
    });
  });
});
```

## Privilege Escalation Tests

```typescript
// tests/acceptance/privilegeEscalation.test.ts

describe('Privilege Escalation Prevention', () => {
  let app: TestApp;
  let owner: TestUser;
  let member: TestUser;
  let org: TestOrganization;

  beforeEach(async () => {
    app = await createTestApp();
    owner = await app.createUser('owner@test.com');
    member = await app.createUser('member@test.com');
    org = await app.createOrganization('Test Org', owner.id);
    await app.addMember(org.id, member.id, 'member');
  });

  it('prevents members from promoting themselves to admin', async () => {
    const response = await app.request(`/organizations/${org.id}/members/${member.id}`, {
      method: 'POST',
      user: member,
      body: { role: 'admin' },
    });

    expect(response.status).toBe(403);
  });

  it('prevents members from inviting new members', async () => {
    const response = await app.request(`/organizations/${org.id}/members`, {
      method: 'POST',
      user: member,
      body: { email: 'new@test.com', role: 'viewer' },
    });

    expect(response.status).toBe(403);
  });

  it('prevents viewers from creating resources', async () => {
    const viewer = await app.createUser('viewer@test.com');
    await app.addMember(org.id, viewer.id, 'viewer');

    const response = await app.request(`/organizations/${org.id}/projects`, {
      method: 'POST',
      user: viewer,
      body: { name: 'New Project' },
    });

    expect(response.status).toBe(403);
  });
});
```

## Authentication Tests

```typescript
// tests/acceptance/authentication.test.ts

describe('Authentication Required', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = await createTestApp();
  });

  it('requires authentication for protected endpoints', async () => {
    const response = await app.request('/projects');

    expect(response.status).toBe(401);
  });

  it('rejects invalid session tokens', async () => {
    const response = await app.request('/projects', {
      user: { id: 'fake', email: 'fake', sessionToken: 'invalid-token' },
    });

    expect(response.status).toBe(401);
  });

  it('rejects expired sessions', async () => {
    const user = await app.createUser('user@test.com');

    // Expire the session
    await app.db
      .prepare(
        `
        UPDATE sessions SET expires_at = datetime('now', '-1 day')
        WHERE id = ?
      `
      )
      .bind(user.sessionToken)
      .run();

    const response = await app.request('/projects', { user });

    expect(response.status).toBe(401);
  });
});
```

## Role-Based Access Tests

```typescript
// tests/acceptance/roleBasedAccess.test.ts

describe('Role-Based Access Control', () => {
  let app: TestApp;
  let org: TestOrganization;
  let project: TestProject;
  let owner: TestUser;
  let admin: TestUser;
  let member: TestUser;
  let viewer: TestUser;

  beforeEach(async () => {
    app = await createTestApp();

    owner = await app.createUser('owner@test.com');
    admin = await app.createUser('admin@test.com');
    member = await app.createUser('member@test.com');
    viewer = await app.createUser('viewer@test.com');

    org = await app.createOrganization('Test Org', owner.id);
    await app.addMember(org.id, admin.id, 'admin');
    await app.addMember(org.id, member.id, 'member');
    await app.addMember(org.id, viewer.id, 'viewer');

    project = await app.createProject('Test Project', org.id, member.id);
  });

  const testCases = [
    { user: 'owner', action: 'delete', expected: 200 },
    { user: 'admin', action: 'delete', expected: 200 },
    { user: 'member', action: 'delete', expected: 403 }, // Not owner of this project
    { user: 'viewer', action: 'delete', expected: 403 },
  ];

  for (const { user, action, expected } of testCases) {
    it(`${user} ${expected === 200 ? 'CAN' : 'CANNOT'} ${action} project`, async () => {
      const testUser = { owner, admin, member, viewer }[user]!;

      const response = await app.request(`/projects/${project.id}/${action}`, {
        method: 'POST',
        user: testUser,
      });

      expect(response.status).toBe(expected);
    });
  }
});
```
