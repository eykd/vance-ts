# 🏢 Teams, Organizations, and Multi-Tenant Boundaries

**A Pragmatic Guide to Evolving from Single-User to Multi-Tenant Architecture on Cloudflare**

_Companion to the Comprehensive Guide: Interactive Web Applications on Cloudflare_

_January 2026_

---

## Table of Contents

1. [Introduction: Why Not Just "Ship Teams"?](#1-introduction-why-not-just-ship-teams)
2. [The Decision Tree: When Single-Tenant Stops Working](#2-the-decision-tree-when-single-tenant-stops-working)
3. [Data Model Evolution: The Canonical Migration Path](#3-data-model-evolution-the-canonical-migration-path)
4. [Authentication vs. Authorization: Understanding the Distinction](#4-authentication-vs-authorization-understanding-the-distinction)
5. [The Policy Abstraction: Can User X Do Y on Resource Z?](#5-the-policy-abstraction-can-user-x-do-y-on-resource-z)
6. [Implementing Authorization in Cloudflare Workers](#6-implementing-authorization-in-cloudflare-workers)
7. [Common Authorization Patterns](#7-common-authorization-patterns)
8. [Testing Authorization Logic](#8-testing-authorization-logic)
9. [Migration Strategies: From User to Org](#9-migration-strategies-from-user-to-org)
10. [Security Considerations for Multi-Tenancy](#10-security-considerations-for-multi-tenancy)
11. [Complete Implementation Example](#11-complete-implementation-example)

---

## 1. Introduction: Why Not Just "Ship Teams"?

The request seems simple: "We need teams." But "teams" is a feature bundle masquerading as a single concept. It encompasses identity (who are you?), authorization (what can you do?), data isolation (what can you see?), billing boundaries (who pays?), and administrative hierarchy (who controls whom?).

Shipping "teams" without understanding these dimensions leads to one of two outcomes: an inflexible system that can't accommodate real organizational complexity, or a sprawling permissions nightmare that nobody—including the original developers—fully understands.

This guide takes a different approach. Rather than shipping a monolithic "teams" feature, we'll build a foundation that answers one question clearly:

**Can User X perform Action Y on Resource Z?**

Everything else—teams, organizations, workspaces, projects—becomes a configuration of this fundamental abstraction.

### What This Guide Covers

This guide provides a pragmatic approach to multi-tenancy:

1. **A decision framework** for when you actually need multi-tenancy (you might not yet)
2. **A canonical data model** that evolves gracefully from single-user to enterprise
3. **A simple policy abstraction** that handles 90% of authorization needs
4. **Concrete patterns** for ownership, delegation, admin override, and system actions
5. **Implementation details** specific to Cloudflare Workers, D1, and KV

### What This Guide Does Not Cover

This guide focuses on application-level multi-tenancy. It does not cover:

- Cloudflare Access or Zero Trust (external identity providers)
- Database-per-tenant isolation (we assume shared D1 with row-level security)
- Enterprise SSO integration (SAML, OIDC federation)
- Billing and subscription management

---

## 2. The Decision Tree: When Single-Tenant Stops Working

Before adding organizational complexity, ensure you actually need it. Multi-tenancy introduces significant complexity in data modeling, authorization logic, and testing. The wrong abstraction is worse than no abstraction.

### The Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DO YOU NEED MULTI-TENANCY?                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Q1: Do multiple humans need to access the same data?                       │
│                                                                             │
│  Examples:                                                                  │
│  • Team members editing shared documents                                    │
│  • Support staff viewing customer accounts                                  │
│  • Managers reviewing employee submissions                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                          │                    │
                         YES                   NO
                          │                    │
                          ▼                    ▼
                    Continue           ┌──────────────────┐
                                       │ STOP: Single-user│
                                       │ model is fine.   │
                                       │ Add sharing later│
                                       │ when needed.     │
                                       └──────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Q2: Do those humans need DIFFERENT levels of access?                       │
│                                                                             │
│  Examples:                                                                  │
│  • Admins can delete, members can only view                                 │
│  • Owners can invite, contributors cannot                                   │
│  • Managers see reports, employees see only their own data                  │
└─────────────────────────────────────────────────────────────────────────────┘
                          │                    │
                         YES                   NO
                          │                    │
                          ▼                    ▼
                    Continue           ┌──────────────────┐
                                       │ Consider: Simple │
                                       │ sharing model.   │
                                       │ All collaborators│
                                       │ equal. Add roles │
                                       │ when pain grows. │
                                       └──────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Q3: Do you need ORGANIZATIONAL boundaries (billing, compliance, data)?     │
│                                                                             │
│  Examples:                                                                  │
│  • Separate billing per organization                                        │
│  • Data must not leak between organizations (compliance)                    │
│  • Organization admins manage their own members                             │
│  • Different organizations have different feature access                    │
└─────────────────────────────────────────────────────────────────────────────┘
                          │                    │
                         YES                   NO
                          │                    │
                          ▼                    ▼
┌──────────────────────────────┐    ┌──────────────────────────────────────┐
│ FULL MULTI-TENANCY           │    │ RESOURCE-LEVEL PERMISSIONS           │
│                              │    │                                      │
│ Implement:                   │    │ Implement:                           │
│ • Organizations table        │    │ • Resource ownership                 │
│ • Memberships with roles     │    │ • Per-resource collaborators         │
│ • Org-scoped resources       │    │ • Role per resource (not global)     │
│ • Tenant isolation checks    │    │                                      │
│                              │    │ Skip:                                │
│ See Section 3 for full       │    │ • Organizations table                │
│ data model.                  │    │ • Global roles                       │
└──────────────────────────────┘    └──────────────────────────────────────┘
```

### Signals That You Need to Evolve

Even if you start simple, watch for these signals:

| Signal                                   | What It Means                    | Action                      |
| ---------------------------------------- | -------------------------------- | --------------------------- |
| Users asking to "share with my team"     | Multiple users need same data    | Add collaborator model      |
| "Can I make someone else admin?"         | Differentiated access needed     | Add roles to collaborators  |
| "We need separate billing"               | Organizational boundaries needed | Add organizations           |
| "Our compliance requires data isolation" | Tenant isolation critical        | Add org_id to all resources |
| "Managers need to see all team data"     | Hierarchical access patterns     | Add org-level roles         |

### The Cost of Premature Multi-Tenancy

Adding multi-tenancy too early creates real costs:

1. **Cognitive overhead**: Every query must consider "which organization?" even when there's only one
2. **Testing complexity**: All tests must set up organizational context
3. **Onboarding friction**: New users must create or join an organization before doing anything useful
4. **Migration debt**: If you guess wrong about the model, migrating is painful

Start with the simplest model that works. Evolve when you feel the pain, not before.

---

## Quick Start

This guide provides a pragmatic approach to multi-tenancy: a decision framework for when you actually need it, a canonical data model that evolves from single-user to enterprise scale, and a simple policy abstraction answering "Can User X do Action Y on Resource Z?" Everything else—teams, organizations, workspaces—becomes configuration of this fundamental question. You'll learn concrete patterns for ownership, delegation, admin override, system actions, testing authorization logic, and migrating existing applications without breaking them.

### Minimal Example: Authorization Check

```typescript
// src/domain/authorization/types.ts
export type Actor = { type: 'user'; id: string } | { type: 'system'; reason: string };
export type Action = 'create' | 'read' | 'update' | 'delete';
export interface Resource {
  type: 'project';
  id: string;
}

// src/application/services/AuthorizationService.ts
export class AuthorizationService {
  async can(actor: Actor, action: Action, resource: Resource): Promise<boolean> {
    // System actors always allowed
    if (actor.type === 'system') return true;

    // Load context: organization membership, resource ownership
    const context = await this.loadContext(actor, resource);

    // Check org owner → full access
    if (context.orgRole === 'owner') return true;

    // Check resource owner → full access to own resource
    if (context.resourceOwnerId === actor.id) return true;

    // Check specific permissions...
    return false;
  }
}

// Usage in handler
const authz = new AuthorizationService(env.DB);
if (
  !(await authz.can({ type: 'user', id: userId }, 'delete', { type: 'project', id: projectId }))
) {
  return new Response('Forbidden', { status: 403 });
}
```

**Learn more**:

- [The Policy Abstraction](#the-policy-abstraction-can-user-x-do-y-on-resource-z) - Building flexible authorization
- [Data Model Evolution](#data-model-evolution-the-canonical-migration-path) - Growing from single-user to org scale
- [Common Authorization Patterns](#common-authorization-patterns) - Ownership, delegation, admin override
- [Migration Strategies](#migration-strategies-from-user-to-org) - Evolving without breaking

---

## 3. Data Model Evolution: The Canonical Migration Path

This section presents the canonical evolution from single-user to full multi-tenancy. Each stage is complete and functional—you can stop at any stage that meets your needs.

### Stage 1: Single User (User Owns Resources)

The simplest model. Each resource belongs to exactly one user.

```sql
-- migrations/0001_single_user.sql

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    email_normalized TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_projects_owner ON projects(owner_id);
```

**Authorization model**: User can access a project if `project.owner_id = user.id`.

```typescript
// Stage 1: Simple ownership check
function canAccessProject(userId: string, project: Project): boolean {
  return project.ownerId === userId;
}
```

### Stage 2: Resource-Level Sharing (Collaborators)

Users can share individual resources with others. No global teams yet.

```sql
-- migrations/0002_collaborators.sql

-- Add collaborators to projects
CREATE TABLE project_collaborators (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')),
    invited_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_collabs_project ON project_collaborators(project_id);
CREATE INDEX idx_project_collabs_user ON project_collaborators(user_id);
```

**Authorization model**: User can access if owner OR collaborator.

```typescript
// Stage 2: Ownership or collaboration
type ProjectRole = 'owner' | 'admin' | 'editor' | 'viewer';

interface ProjectAccess {
  hasAccess: boolean;
  role: ProjectRole | null;
}

async function getProjectAccess(
  db: D1Database,
  userId: string,
  projectId: string
): Promise<ProjectAccess> {
  // Check ownership first
  const project = await db
    .prepare('SELECT owner_id FROM projects WHERE id = ?')
    .bind(projectId)
    .first<{ owner_id: string }>();

  if (!project) {
    return { hasAccess: false, role: null };
  }

  if (project.owner_id === userId) {
    return { hasAccess: true, role: 'owner' };
  }

  // Check collaboration
  const collab = await db
    .prepare('SELECT role FROM project_collaborators WHERE project_id = ? AND user_id = ?')
    .bind(projectId, userId)
    .first<{ role: string }>();

  if (collab) {
    return { hasAccess: true, role: collab.role as ProjectRole };
  }

  return { hasAccess: false, role: null };
}
```

### Stage 3: Organizations with Memberships

Introduces organizational boundaries. Resources belong to organizations, not individual users.

```sql
-- migrations/0003_organizations.sql

-- Organizations table
CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL REFERENCES users(id),

    -- Organization settings
    settings TEXT DEFAULT '{}',  -- JSON for flexible settings

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_orgs_owner ON organizations(owner_id);
CREATE INDEX idx_orgs_slug ON organizations(slug);

-- Organization memberships
CREATE TABLE organization_memberships (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),

    invited_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    invited_at TEXT,
    accepted_at TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_memberships_org ON organization_memberships(organization_id);
CREATE INDEX idx_memberships_user ON organization_memberships(user_id);

-- Migrate projects to belong to organizations
ALTER TABLE projects ADD COLUMN organization_id TEXT REFERENCES organizations(id);
CREATE INDEX idx_projects_org ON projects(organization_id);

-- Note: owner_id on projects now represents "created by" rather than ownership
-- The organization owns the project; owner_id tracks who created it
```

**Role Hierarchy**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORGANIZATION ROLE HIERARCHY                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  owner ──────► Full control, can delete organization, transfer ownership   │
│    │                                                                        │
│    ▼                                                                        │
│  admin ──────► Manage members, manage all resources, change settings       │
│    │                                                                        │
│    ▼                                                                        │
│  member ─────► Create resources, edit own resources, view all resources    │
│    │                                                                        │
│    ▼                                                                        │
│  viewer ─────► View resources only, no create/edit                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Stage 4: Resource-Level Permissions Within Organizations

Combines organizational boundaries with fine-grained resource permissions.

```sql
-- migrations/0004_resource_permissions.sql

-- Project-level collaborators (within org context)
-- This allows org members to have elevated access to specific projects
CREATE TABLE project_members (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Role on this specific project (can exceed org role)
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),

    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
```

### Complete Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE DATA MODEL                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌─────────────────────┐         ┌──────────────┐
│    users     │         │   organizations     │         │   projects   │
├──────────────┤         ├─────────────────────┤         ├──────────────┤
│ id           │◄───┐    │ id                  │◄───┐    │ id           │
│ email        │    │    │ name                │    │    │ name         │
│ password_hash│    │    │ slug                │    │    │ description  │
│ created_at   │    │    │ owner_id ───────────┼────┘    │ org_id ──────┼───┐
└──────────────┘    │    │ settings            │         │ created_by ──┼───┤
       ▲            │    │ created_at          │         │ created_at   │   │
       │            │    └─────────────────────┘         └──────────────┘   │
       │            │              ▲                            ▲           │
       │            │              │                            │           │
       │            │    ┌─────────┴─────────┐        ┌─────────┴────────┐ │
       │            │    │ org_memberships   │        │ project_members  │ │
       │            │    ├───────────────────┤        ├──────────────────┤ │
       │            └────┤ user_id           │   ┌────┤ user_id          │ │
       │                 │ organization_id ──┼───┘    │ project_id ──────┼─┘
       │                 │ role              │        │ role             │
       └─────────────────┤ invited_by        │        │ created_at       │
                         │ accepted_at       │        └──────────────────┘
                         └───────────────────┘
```

---

## 4. Authentication vs. Authorization: Understanding the Distinction

Before implementing authorization, it's critical to understand how it differs from authentication. These are often conflated, leading to security vulnerabilities and architectural confusion.

### The Distinction

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION VS AUTHORIZATION                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AUTHENTICATION (AuthN)              AUTHORIZATION (AuthZ)                  │
│  "Who are you?"                      "What can you do?"                     │
│                                                                             │
│  ┌─────────────────────────┐         ┌─────────────────────────┐           │
│  │ • Verify identity       │         │ • Check permissions     │           │
│  │ • Validate credentials  │         │ • Enforce access rules  │           │
│  │ • Issue session tokens  │         │ • Apply business logic  │           │
│  │ • Manage login/logout   │         │ • Scope data visibility │           │
│  └─────────────────────────┘         └─────────────────────────┘           │
│                                                                             │
│  Happens ONCE at login               Happens on EVERY request               │
│                                                                             │
│  Result: Session with user ID        Result: Allow or deny action           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Where Each Lives in the Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REQUEST LIFECYCLE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    Request arrives
          │
          ▼
┌─────────────────────┐
│   AUTHENTICATION    │  ◄── Session middleware
│   (Who is this?)    │      Validates session cookie
│                     │      Loads user from session
└─────────────────────┘      Result: ctx.user or null
          │
          │ ctx.user available
          ▼
┌─────────────────────┐
│   AUTHORIZATION     │  ◄── Per-handler or middleware
│   (Can they do X?)  │      Checks permissions
│                     │      May load additional context
└─────────────────────┘      Result: allow or deny
          │
          │ if allowed
          ▼
┌─────────────────────┐
│   BUSINESS LOGIC    │
│   (Do the thing)    │
└─────────────────────┘
```

### Authentication Provides Context, Authorization Makes Decisions

Authentication establishes who is making the request. This happens early in the middleware pipeline and results in a user context being available (or not) for subsequent processing.

Authorization uses that context—plus information about the requested action and target resource—to decide whether to proceed.

```typescript
// Authentication: Establishes user context
interface AuthenticatedContext {
  user: {
    id: string;
    email: string;
  } | null;
  session: Session | null;
}

// Authorization: Makes access decisions
interface AuthorizationContext {
  actor: Actor; // WHO (user, system, api key)
  action: Action; // WHAT (create, read, update, delete)
  resource: Resource; // ON WHICH (project:123, org:456)
}
```

---

## 5. The Policy Abstraction: Can User X Do Y on Resource Z?

The core of any authorization system is answering one question:

**Can Actor X perform Action Y on Resource Z?**

This section builds a simple, extensible policy abstraction that handles this question cleanly.

### The Core Types

```typescript
// src/domain/authorization/types.ts

/**
 * An Actor is the entity attempting to perform an action.
 * This is usually a user, but can also be a system process or API key.
 */
export type Actor =
  | { type: 'user'; id: string }
  | { type: 'system'; reason: string }
  | { type: 'api_key'; id: string; scopes: string[] };

/**
 * An Action is what the actor wants to do.
 * Using string literals for type safety.
 */
export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'invite'
  | 'remove'
  | 'transfer'
  | 'admin';

/**
 * A Resource identifies what the action targets.
 * The format is "type:id" or "type:id:subtype:subid" for nested resources.
 */
export type ResourceType = 'organization' | 'project' | 'document' | 'membership';

export interface Resource {
  type: ResourceType;
  id: string;

  // Optional: parent context for nested resources
  parent?: Resource;
}

/**
 * The result of an authorization check.
 * Always includes a reason for debugging and audit logging.
 */
export interface AuthorizationResult {
  allowed: boolean;
  reason: string;

  // Optional: the effective role that granted (or would have granted) access
  effectiveRole?: string;
}
```

### The Policy Interface

```typescript
// src/domain/authorization/Policy.ts

import type { Actor, Action, Resource, AuthorizationResult } from './types';

/**
 * A Policy answers: "Can this actor perform this action on this resource?"
 *
 * Policies are pure functions with no side effects. They receive all context
 * needed to make a decision and return a result.
 */
export interface Policy {
  /**
   * Check if the actor can perform the action on the resource.
   *
   * @param actor - Who is attempting the action
   * @param action - What action they want to perform
   * @param resource - What resource they want to act on
   * @param context - Additional context needed for the decision
   */
  check(
    actor: Actor,
    action: Action,
    resource: Resource,
    context: PolicyContext
  ): Promise<AuthorizationResult>;
}

/**
 * Context provides the data needed to evaluate policies.
 * This is loaded once per request and passed to all policy checks.
 */
export interface PolicyContext {
  // Organization membership for the actor (if user)
  organizationMembership?: {
    organizationId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
  };

  // Resource-specific context
  resourceOwner?: string;
  resourceOrganizationId?: string;

  // Project-specific membership (if checking project access)
  projectMembership?: {
    role: 'admin' | 'editor' | 'viewer';
  };
}
```

### Implementing the Core Policy

```typescript
// src/domain/authorization/CorePolicy.ts

import type { Actor, Action, Resource, AuthorizationResult, PolicyContext, Policy } from './types';

/**
 * The CorePolicy implements standard authorization rules.
 *
 * Rule precedence (highest to lowest):
 * 1. System actors always allowed (for background jobs, migrations)
 * 2. Organization owners have full access to org resources
 * 3. Organization admins have full access except ownership transfer
 * 4. Resource-specific permissions (project members, etc.)
 * 5. Organization members have base access per their role
 * 6. Default deny
 */
export class CorePolicy implements Policy {
  async check(
    actor: Actor,
    action: Action,
    resource: Resource,
    context: PolicyContext
  ): Promise<AuthorizationResult> {
    // Rule 1: System actors always allowed
    if (actor.type === 'system') {
      return {
        allowed: true,
        reason: `System action: ${actor.reason}`,
        effectiveRole: 'system',
      };
    }

    // Rule 2-6 only apply to user actors
    if (actor.type !== 'user') {
      return this.checkApiKeyAccess(actor, action, resource);
    }

    // Check organization-level access
    const orgAccess = this.checkOrganizationAccess(actor, action, resource, context);
    if (orgAccess.allowed) {
      return orgAccess;
    }

    // Check resource-level access
    const resourceAccess = this.checkResourceAccess(actor, action, resource, context);
    if (resourceAccess.allowed) {
      return resourceAccess;
    }

    // Default deny
    return {
      allowed: false,
      reason: 'No applicable permission found',
    };
  }

  private checkOrganizationAccess(
    actor: { type: 'user'; id: string },
    action: Action,
    resource: Resource,
    context: PolicyContext
  ): AuthorizationResult {
    const membership = context.organizationMembership;

    if (!membership) {
      return { allowed: false, reason: 'Not a member of this organization' };
    }

    // Check if resource belongs to actor's organization
    if (context.resourceOrganizationId !== membership.organizationId) {
      return { allowed: false, reason: 'Resource belongs to different organization' };
    }

    // Owner can do everything
    if (membership.role === 'owner') {
      return {
        allowed: true,
        reason: 'Organization owner has full access',
        effectiveRole: 'owner',
      };
    }

    // Admin can do everything except ownership transfer
    if (membership.role === 'admin') {
      if (action === 'transfer' && resource.type === 'organization') {
        return { allowed: false, reason: 'Only owner can transfer organization' };
      }
      return {
        allowed: true,
        reason: 'Organization admin has administrative access',
        effectiveRole: 'admin',
      };
    }

    // Members can create and edit their own resources
    if (membership.role === 'member') {
      if (action === 'create') {
        return {
          allowed: true,
          reason: 'Members can create resources',
          effectiveRole: 'member',
        };
      }
      if (action === 'read') {
        return {
          allowed: true,
          reason: 'Members can view organization resources',
          effectiveRole: 'member',
        };
      }
      // For update/delete, need to check resource ownership or project membership
      return { allowed: false, reason: 'Checking resource-level access' };
    }

    // Viewers can only read
    if (membership.role === 'viewer') {
      if (action === 'read') {
        return {
          allowed: true,
          reason: 'Viewers can view organization resources',
          effectiveRole: 'viewer',
        };
      }
      return { allowed: false, reason: 'Viewers cannot modify resources' };
    }

    return { allowed: false, reason: 'Unknown role' };
  }

  private checkResourceAccess(
    actor: { type: 'user'; id: string },
    action: Action,
    resource: Resource,
    context: PolicyContext
  ): AuthorizationResult {
    // Resource owner can do anything with their resource
    if (context.resourceOwner === actor.id) {
      return {
        allowed: true,
        reason: 'Resource owner has full access',
        effectiveRole: 'resource_owner',
      };
    }

    // Check project-specific membership
    if (resource.type === 'project' || resource.parent?.type === 'project') {
      const projectMembership = context.projectMembership;

      if (projectMembership) {
        return this.checkProjectRoleAccess(projectMembership.role, action);
      }
    }

    return { allowed: false, reason: 'No resource-level access' };
  }

  private checkProjectRoleAccess(
    role: 'admin' | 'editor' | 'viewer',
    action: Action
  ): AuthorizationResult {
    const rolePermissions: Record<string, Action[]> = {
      admin: ['create', 'read', 'update', 'delete', 'invite', 'remove', 'admin'],
      editor: ['create', 'read', 'update'],
      viewer: ['read'],
    };

    const allowedActions = rolePermissions[role] || [];

    if (allowedActions.includes(action)) {
      return {
        allowed: true,
        reason: `Project ${role} can ${action}`,
        effectiveRole: `project_${role}`,
      };
    }

    return {
      allowed: false,
      reason: `Project ${role} cannot ${action}`,
    };
  }

  private checkApiKeyAccess(
    actor: { type: 'api_key'; id: string; scopes: string[] },
    action: Action,
    resource: Resource
  ): AuthorizationResult {
    // API keys have explicit scopes
    const requiredScope = `${resource.type}:${action}`;
    const wildcardScope = `${resource.type}:*`;

    if (actor.scopes.includes(requiredScope) || actor.scopes.includes(wildcardScope)) {
      return {
        allowed: true,
        reason: `API key has scope ${requiredScope}`,
        effectiveRole: 'api_key',
      };
    }

    return {
      allowed: false,
      reason: `API key missing scope ${requiredScope}`,
    };
  }
}
```

### The Authorization Service

```typescript
// src/application/services/AuthorizationService.ts

import { CorePolicy } from '../../domain/authorization/CorePolicy';
import type {
  Actor,
  Action,
  Resource,
  AuthorizationResult,
  PolicyContext,
} from '../../domain/authorization/types';

/**
 * AuthorizationService is the main entry point for authorization checks.
 * It loads context, evaluates policies, and logs decisions.
 */
export class AuthorizationService {
  constructor(
    private db: D1Database,
    private policy: CorePolicy = new CorePolicy()
  ) {}

  /**
   * Check if an actor can perform an action on a resource.
   */
  async can(actor: Actor, action: Action, resource: Resource): Promise<AuthorizationResult> {
    // Load context needed for policy evaluation
    const context = await this.loadContext(actor, resource);

    // Evaluate the policy
    const result = await this.policy.check(actor, action, resource, context);

    // Log the decision (for audit trail)
    await this.logDecision(actor, action, resource, result);

    return result;
  }

  /**
   * Require authorization - throws if not allowed.
   */
  async require(actor: Actor, action: Action, resource: Resource): Promise<void> {
    const result = await this.can(actor, action, resource);

    if (!result.allowed) {
      throw new AuthorizationError(result.reason, { actor, action, resource });
    }
  }

  /**
   * Load all context needed for policy evaluation.
   */
  private async loadContext(actor: Actor, resource: Resource): Promise<PolicyContext> {
    const context: PolicyContext = {};

    // Load organization membership if actor is a user
    if (actor.type === 'user') {
      const orgId = await this.getResourceOrganizationId(resource);

      if (orgId) {
        context.resourceOrganizationId = orgId;
        context.organizationMembership = await this.getOrgMembership(actor.id, orgId);
      }

      // Load resource owner
      context.resourceOwner = await this.getResourceOwner(resource);

      // Load project membership if applicable
      const projectId = this.getProjectId(resource);
      if (projectId) {
        context.projectMembership = await this.getProjectMembership(actor.id, projectId);
      }
    }

    return context;
  }

  private async getOrgMembership(
    userId: string,
    orgId: string
  ): Promise<PolicyContext['organizationMembership']> {
    const row = await this.db
      .prepare(
        `
        SELECT role FROM organization_memberships 
        WHERE user_id = ? AND organization_id = ?
      `
      )
      .bind(userId, orgId)
      .first<{ role: string }>();

    if (!row) return undefined;

    return {
      organizationId: orgId,
      role: row.role as 'owner' | 'admin' | 'member' | 'viewer',
    };
  }

  private async getResourceOrganizationId(resource: Resource): Promise<string | undefined> {
    switch (resource.type) {
      case 'organization':
        return resource.id;

      case 'project':
        const project = await this.db
          .prepare('SELECT organization_id FROM projects WHERE id = ?')
          .bind(resource.id)
          .first<{ organization_id: string }>();
        return project?.organization_id;

      default:
        // For nested resources, check parent
        if (resource.parent) {
          return this.getResourceOrganizationId(resource.parent);
        }
        return undefined;
    }
  }

  private async getResourceOwner(resource: Resource): Promise<string | undefined> {
    switch (resource.type) {
      case 'organization':
        const org = await this.db
          .prepare('SELECT owner_id FROM organizations WHERE id = ?')
          .bind(resource.id)
          .first<{ owner_id: string }>();
        return org?.owner_id;

      case 'project':
        const project = await this.db
          .prepare('SELECT owner_id FROM projects WHERE id = ?')
          .bind(resource.id)
          .first<{ owner_id: string }>();
        return project?.owner_id;

      default:
        return undefined;
    }
  }

  private getProjectId(resource: Resource): string | undefined {
    if (resource.type === 'project') {
      return resource.id;
    }
    if (resource.parent?.type === 'project') {
      return resource.parent.id;
    }
    return undefined;
  }

  private async getProjectMembership(
    userId: string,
    projectId: string
  ): Promise<PolicyContext['projectMembership']> {
    const row = await this.db
      .prepare(
        `
        SELECT role FROM project_members 
        WHERE user_id = ? AND project_id = ?
      `
      )
      .bind(userId, projectId)
      .first<{ role: string }>();

    if (!row) return undefined;

    return {
      role: row.role as 'admin' | 'editor' | 'viewer',
    };
  }

  private async logDecision(
    actor: Actor,
    action: Action,
    resource: Resource,
    result: AuthorizationResult
  ): Promise<void> {
    // In production, log to analytics or audit table
    console.log({
      type: 'authorization_decision',
      actor,
      action,
      resource,
      allowed: result.allowed,
      reason: result.reason,
      timestamp: new Date().toISOString(),
    });
  }
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public context: { actor: Actor; action: Action; resource: Resource }
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}
```

---

## 6. Implementing Authorization in Cloudflare Workers

This section shows how to integrate the policy abstraction into your Worker handlers.

### Authorization Middleware

```typescript
// src/presentation/middleware/authorization.ts

import {
  AuthorizationService,
  AuthorizationError,
} from '../../application/services/AuthorizationService';
import type { Actor, Action, Resource } from '../../domain/authorization/types';

export interface AuthorizedContext {
  actor: Actor;
  authz: AuthorizationService;
}

/**
 * Create an authorization middleware that extracts the actor from the request
 * and provides the authorization service.
 */
export function createAuthorizationMiddleware(env: Env) {
  return async function authorize(
    request: Request,
    session: Session | null
  ): Promise<AuthorizedContext> {
    const actor = getActorFromRequest(request, session);
    const authz = new AuthorizationService(env.DB);

    return { actor, authz };
  };
}

function getActorFromRequest(request: Request, session: Session | null): Actor {
  // Check for API key first
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey) {
    // In production, validate the API key and load its scopes
    return {
      type: 'api_key',
      id: apiKey,
      scopes: [], // Load from database
    };
  }

  // Check for system token (internal services)
  const systemToken = request.headers.get('X-System-Token');
  if (systemToken && validateSystemToken(systemToken)) {
    return {
      type: 'system',
      reason: request.headers.get('X-System-Reason') || 'Internal service call',
    };
  }

  // Default to session user
  if (session) {
    return {
      type: 'user',
      id: session.userId,
    };
  }

  // No valid actor - this will fail authorization
  throw new Error('No valid authentication');
}

function validateSystemToken(token: string): boolean {
  // In production, validate against env.SYSTEM_TOKEN
  return token.length > 0;
}
```

### Using Authorization in Handlers

```typescript
// src/presentation/handlers/ProjectHandlers.ts

import {
  AuthorizationService,
  AuthorizationError,
} from '../../application/services/AuthorizationService';
import type { Actor, Resource } from '../../domain/authorization/types';
import { html } from '../templates/html';

interface HandlerContext {
  request: Request;
  env: Env;
  actor: Actor;
  authz: AuthorizationService;
  params: Record<string, string>;
}

/**
 * GET /projects/:id
 */
export async function handleGetProject(ctx: HandlerContext): Promise<Response> {
  const projectId = ctx.params.id;

  // Define the resource
  const resource: Resource = {
    type: 'project',
    id: projectId,
  };

  // Check authorization
  const result = await ctx.authz.can(ctx.actor, 'read', resource);

  if (!result.allowed) {
    return new Response(
      html`<div class="alert alert-error">Access denied: ${result.reason}</div>`,
      { status: 403, headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Load and return project
  const project = await loadProject(ctx.env.DB, projectId);
  return renderProject(project, result.effectiveRole);
}

/**
 * POST /projects/:id/delete
 */
export async function handleDeleteProject(ctx: HandlerContext): Promise<Response> {
  const projectId = ctx.params.id;

  const resource: Resource = {
    type: 'project',
    id: projectId,
  };

  // Use require() to throw on unauthorized
  try {
    await ctx.authz.require(ctx.actor, 'delete', resource);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return new Response(
        html`<div class="alert alert-error">Cannot delete: ${error.message}</div>`,
        { status: 403, headers: { 'Content-Type': 'text/html' } }
      );
    }
    throw error;
  }

  // Perform deletion
  await deleteProject(ctx.env.DB, projectId);

  return new Response(null, {
    status: 303,
    headers: { Location: '/projects' },
  });
}

/**
 * POST /projects
 */
export async function handleCreateProject(ctx: HandlerContext): Promise<Response> {
  const formData = await ctx.request.formData();
  const organizationId = formData.get('organization_id') as string;

  // For creation, check against the parent organization
  const resource: Resource = {
    type: 'organization',
    id: organizationId,
  };

  try {
    await ctx.authz.require(ctx.actor, 'create', resource);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return new Response(
        html`<div class="alert alert-error">Cannot create project: ${error.message}</div>`,
        { status: 403, headers: { 'Content-Type': 'text/html' } }
      );
    }
    throw error;
  }

  // Create the project
  const project = await createProject(ctx.env.DB, {
    name: formData.get('name') as string,
    organizationId,
    ownerId: ctx.actor.type === 'user' ? ctx.actor.id : null,
  });

  return new Response(null, {
    status: 303,
    headers: { Location: `/projects/${project.id}` },
  });
}
```

### Scoping Queries by Authorization

```typescript
// src/infrastructure/repositories/ProjectRepository.ts

import type { Actor } from '../../domain/authorization/types';

export class ProjectRepository {
  constructor(private db: D1Database) {}

  /**
   * List projects the actor can access.
   * This applies authorization at the query level for efficiency.
   */
  async listAccessible(actor: Actor): Promise<Project[]> {
    if (actor.type !== 'user') {
      throw new Error('Only user actors can list projects');
    }

    // Get all projects the user can access through:
    // 1. Organization membership
    // 2. Direct project membership
    const projects = await this.db
      .prepare(
        `
        SELECT DISTINCT p.* FROM projects p
        LEFT JOIN organization_memberships om 
          ON p.organization_id = om.organization_id 
          AND om.user_id = ?
        LEFT JOIN project_members pm 
          ON p.id = pm.project_id 
          AND pm.user_id = ?
        WHERE om.user_id IS NOT NULL 
           OR pm.user_id IS NOT NULL
        ORDER BY p.updated_at DESC
      `
      )
      .bind(actor.id, actor.id)
      .all<ProjectRow>();

    return projects.results.map(this.toProject);
  }

  /**
   * List projects within an organization.
   * Caller must verify org access before calling.
   */
  async listByOrganization(organizationId: string): Promise<Project[]> {
    const projects = await this.db
      .prepare(
        `
        SELECT * FROM projects 
        WHERE organization_id = ?
        ORDER BY updated_at DESC
      `
      )
      .bind(organizationId)
      .all<ProjectRow>();

    return projects.results.map(this.toProject);
  }

  private toProject(row: ProjectRow): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      organizationId: row.organization_id,
      ownerId: row.owner_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
```

---

## 7. Common Authorization Patterns

This section covers patterns you'll encounter repeatedly in multi-tenant applications.

### Pattern 1: Resource Ownership

The creator of a resource has special privileges over it.

```typescript
// src/domain/authorization/patterns/ownership.ts

/**
 * Check if user is the owner of a resource.
 */
export async function isResourceOwner(
  db: D1Database,
  userId: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> {
  const table = getTableForResourceType(resourceType);
  const ownerColumn = getOwnerColumnForResourceType(resourceType);

  const row = await db
    .prepare(`SELECT ${ownerColumn} FROM ${table} WHERE id = ?`)
    .bind(resourceId)
    .first<Record<string, string>>();

  return row?.[ownerColumn] === userId;
}

/**
 * Ownership transfer - only current owner can transfer.
 */
export async function transferOwnership(
  db: D1Database,
  currentOwnerId: string,
  newOwnerId: string,
  resourceType: string,
  resourceId: string
): Promise<void> {
  const isOwner = await isResourceOwner(db, currentOwnerId, resourceType, resourceId);

  if (!isOwner) {
    throw new AuthorizationError('Only the owner can transfer ownership', {
      actor: { type: 'user', id: currentOwnerId },
      action: 'transfer',
      resource: { type: resourceType as ResourceType, id: resourceId },
    });
  }

  const table = getTableForResourceType(resourceType);
  const ownerColumn = getOwnerColumnForResourceType(resourceType);

  await db
    .prepare(`UPDATE ${table} SET ${ownerColumn} = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(newOwnerId, resourceId)
    .run();
}
```

### Pattern 2: Admin Override

Organization admins can perform actions that regular members cannot.

```typescript
// src/domain/authorization/patterns/adminOverride.ts

/**
 * Check if user has admin privileges in an organization.
 * Returns the admin level for fine-grained checks.
 */
export type AdminLevel = 'owner' | 'admin' | 'none';

export async function getAdminLevel(
  db: D1Database,
  userId: string,
  organizationId: string
): Promise<AdminLevel> {
  // Check if user is org owner
  const org = await db
    .prepare('SELECT owner_id FROM organizations WHERE id = ?')
    .bind(organizationId)
    .first<{ owner_id: string }>();

  if (org?.owner_id === userId) {
    return 'owner';
  }

  // Check membership role
  const membership = await db
    .prepare('SELECT role FROM organization_memberships WHERE organization_id = ? AND user_id = ?')
    .bind(organizationId, userId)
    .first<{ role: string }>();

  if (membership?.role === 'admin' || membership?.role === 'owner') {
    return 'admin';
  }

  return 'none';
}

/**
 * Admin override for modifying any resource in the org.
 */
export async function canAdminOverride(
  db: D1Database,
  userId: string,
  organizationId: string,
  action: Action
): Promise<AuthorizationResult> {
  const adminLevel = await getAdminLevel(db, userId, organizationId);

  // Owners can do anything
  if (adminLevel === 'owner') {
    return {
      allowed: true,
      reason: 'Organization owner override',
      effectiveRole: 'owner',
    };
  }

  // Admins can do most things except ownership-related actions
  if (adminLevel === 'admin') {
    const ownerOnlyActions: Action[] = ['transfer'];

    if (ownerOnlyActions.includes(action)) {
      return {
        allowed: false,
        reason: 'Only organization owner can perform this action',
      };
    }

    return {
      allowed: true,
      reason: 'Organization admin override',
      effectiveRole: 'admin',
    };
  }

  return {
    allowed: false,
    reason: 'Not an admin of this organization',
  };
}
```

### Pattern 3: System Actions

Background jobs, migrations, and internal services need to bypass user authorization.

```typescript
// src/domain/authorization/patterns/systemActions.ts

/**
 * Create a system actor for internal operations.
 * Always include a reason for audit trail.
 */
export function createSystemActor(reason: string): Actor {
  return {
    type: 'system',
    reason,
  };
}

/**
 * Example: Background job that needs to update all projects.
 */
export async function runProjectMaintenanceJob(db: D1Database): Promise<void> {
  const systemActor = createSystemActor('Scheduled project maintenance');
  const authz = new AuthorizationService(db);

  // System actors bypass normal authorization
  const projects = await db
    .prepare('SELECT id, organization_id FROM projects')
    .all<{ id: string; organization_id: string }>();

  for (const project of projects.results) {
    // Still log the authorization check for audit trail
    const result = await authz.can(systemActor, 'update', { type: 'project', id: project.id });

    // This will always succeed for system actors
    if (result.allowed) {
      await performMaintenance(db, project.id);
    }
  }
}

/**
 * Example: API endpoint that accepts system tokens.
 */
export function validateSystemRequest(request: Request, env: Env): Actor | null {
  const token = request.headers.get('X-System-Token');
  const reason = request.headers.get('X-System-Reason');

  if (!token || !reason) {
    return null;
  }

  // Validate token (in production, use proper secret comparison)
  if (!timingSafeEqual(token, env.SYSTEM_TOKEN)) {
    return null;
  }

  return createSystemActor(reason);
}
```

### Pattern 4: Delegation (Acting on Behalf Of)

Allow users to delegate specific permissions to others.

```typescript
// src/domain/authorization/patterns/delegation.ts

/**
 * A delegation grants one user the ability to act as another
 * for specific resources or actions.
 */
interface Delegation {
  id: string;
  grantorId: string; // Who granted the delegation
  granteeId: string; // Who received the delegation
  resourceType: ResourceType;
  resourceId: string | '*'; // Specific resource or all of type
  actions: Action[]; // Which actions are delegated
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * Check if a user has delegated access.
 */
export async function checkDelegation(
  db: D1Database,
  granteeId: string,
  action: Action,
  resource: Resource
): Promise<AuthorizationResult> {
  const delegation = await db
    .prepare(
      `
      SELECT * FROM delegations 
      WHERE grantee_id = ?
        AND resource_type = ?
        AND (resource_id = ? OR resource_id = '*')
        AND (expires_at IS NULL OR expires_at > datetime('now'))
    `
    )
    .bind(granteeId, resource.type, resource.id)
    .first<DelegationRow>();

  if (!delegation) {
    return {
      allowed: false,
      reason: 'No delegation found',
    };
  }

  const delegatedActions = JSON.parse(delegation.actions) as Action[];

  if (!delegatedActions.includes(action)) {
    return {
      allowed: false,
      reason: `Delegation does not include '${action}' action`,
    };
  }

  return {
    allowed: true,
    reason: `Delegated by user ${delegation.grantor_id}`,
    effectiveRole: 'delegate',
  };
}

/**
 * Create a delegation.
 */
export async function createDelegation(
  db: D1Database,
  grantorId: string,
  authz: AuthorizationService,
  delegation: Omit<Delegation, 'id' | 'createdAt'>
): Promise<Delegation> {
  // Verify the grantor has permission to delegate
  const resource: Resource = {
    type: delegation.resourceType,
    id: delegation.resourceId === '*' ? 'any' : delegation.resourceId,
  };

  // Must have admin access to delegate
  await authz.require({ type: 'user', id: grantorId }, 'admin', resource);

  const id = crypto.randomUUID();

  await db
    .prepare(
      `
      INSERT INTO delegations (id, grantor_id, grantee_id, resource_type, resource_id, actions, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `
    )
    .bind(
      id,
      grantorId,
      delegation.granteeId,
      delegation.resourceType,
      delegation.resourceId,
      JSON.stringify(delegation.actions),
      delegation.expiresAt?.toISOString() || null
    )
    .run();

  return {
    id,
    ...delegation,
    createdAt: new Date(),
  };
}
```

### Pattern 5: Hierarchical Permissions (Org → Project → Document)

Resources inherit permissions from their parents.

```typescript
// src/domain/authorization/patterns/hierarchy.ts

/**
 * Permission inheritance chain:
 * Organization → Project → Document
 *
 * Higher-level permissions cascade down.
 */
export async function checkHierarchicalAccess(
  db: D1Database,
  userId: string,
  action: Action,
  resource: Resource
): Promise<AuthorizationResult> {
  // Build the resource hierarchy
  const hierarchy = await buildResourceHierarchy(db, resource);

  // Check from top (org) to bottom (resource)
  // Stop at first explicit permission found
  for (const level of hierarchy) {
    const permission = await getExplicitPermission(db, userId, level);

    if (permission) {
      if (canPerformAction(permission.role, action)) {
        return {
          allowed: true,
          reason: `Permission inherited from ${level.type}`,
          effectiveRole: permission.role,
        };
      }
    }
  }

  // Check resource-specific permission last
  const directPermission = await getExplicitPermission(db, userId, resource);

  if (directPermission && canPerformAction(directPermission.role, action)) {
    return {
      allowed: true,
      reason: 'Direct permission on resource',
      effectiveRole: directPermission.role,
    };
  }

  return {
    allowed: false,
    reason: 'No permission in hierarchy',
  };
}

async function buildResourceHierarchy(db: D1Database, resource: Resource): Promise<Resource[]> {
  const hierarchy: Resource[] = [];

  // Walk up the hierarchy
  let current: Resource | undefined = resource;

  while (current) {
    // Get parent based on resource type
    const parent = await getParentResource(db, current);
    if (parent) {
      hierarchy.unshift(parent); // Add to front (org first)
    }
    current = parent;
  }

  return hierarchy;
}

async function getParentResource(
  db: D1Database,
  resource: Resource
): Promise<Resource | undefined> {
  switch (resource.type) {
    case 'document':
      // Documents belong to projects
      const doc = await db
        .prepare('SELECT project_id FROM documents WHERE id = ?')
        .bind(resource.id)
        .first<{ project_id: string }>();
      return doc ? { type: 'project', id: doc.project_id } : undefined;

    case 'project':
      // Projects belong to organizations
      const project = await db
        .prepare('SELECT organization_id FROM projects WHERE id = ?')
        .bind(resource.id)
        .first<{ organization_id: string }>();
      return project ? { type: 'organization', id: project.organization_id } : undefined;

    case 'organization':
      // Organizations are top-level
      return undefined;

    default:
      return undefined;
  }
}
```

---

## 8. Testing Authorization Logic

Authorization logic is critical to get right. This section covers testing strategies.

### Unit Testing Policies

```typescript
// src/domain/authorization/CorePolicy.spec.ts

import { describe, it, expect } from 'vitest';
import { CorePolicy } from './CorePolicy';
import type { Actor, Resource, PolicyContext } from './types';

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
      const actor: Actor = { type: 'user', id: 'user-1' };
      const resource: Resource = { type: 'project', id: 'project-1' };
      const context: PolicyContext = {
        organizationMembership: {
          organizationId: 'org-1',
          role: 'owner',
        },
        resourceOrganizationId: 'org-1',
      };

      const result = await policy.check(actor, 'delete', resource, context);

      expect(result.allowed).toBe(true);
      expect(result.effectiveRole).toBe('owner');
    });
  });

  describe('organization admins', () => {
    it('allows most actions for admins', async () => {
      const actor: Actor = { type: 'user', id: 'user-1' };
      const resource: Resource = { type: 'project', id: 'project-1' };
      const context: PolicyContext = {
        organizationMembership: {
          organizationId: 'org-1',
          role: 'admin',
        },
        resourceOrganizationId: 'org-1',
      };

      const result = await policy.check(actor, 'delete', resource, context);

      expect(result.allowed).toBe(true);
      expect(result.effectiveRole).toBe('admin');
    });

    it('denies ownership transfer for admins', async () => {
      const actor: Actor = { type: 'user', id: 'user-1' };
      const resource: Resource = { type: 'organization', id: 'org-1' };
      const context: PolicyContext = {
        organizationMembership: {
          organizationId: 'org-1',
          role: 'admin',
        },
        resourceOrganizationId: 'org-1',
      };

      const result = await policy.check(actor, 'transfer', resource, context);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('owner');
    });
  });

  describe('cross-organization access', () => {
    it('denies access to resources in other organizations', async () => {
      const actor: Actor = { type: 'user', id: 'user-1' };
      const resource: Resource = { type: 'project', id: 'project-1' };
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
  });

  describe('resource owners', () => {
    it('allows resource owner to modify their own resources', async () => {
      const actor: Actor = { type: 'user', id: 'user-1' };
      const resource: Resource = { type: 'project', id: 'project-1' };
      const context: PolicyContext = {
        organizationMembership: {
          organizationId: 'org-1',
          role: 'member', // Just a member
        },
        resourceOrganizationId: 'org-1',
        resourceOwner: 'user-1', // But owns this resource
      };

      const result = await policy.check(actor, 'delete', resource, context);

      expect(result.allowed).toBe(true);
      expect(result.effectiveRole).toBe('resource_owner');
    });
  });
});
```

### Integration Testing Authorization Flows

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
        ('user-outsider', 'outsider@test.com', 'outsider@test.com', 'hash');
        
      INSERT INTO organizations (id, name, slug, owner_id) VALUES
        ('org-1', 'Test Org', 'test-org', 'user-owner');
        
      INSERT INTO organization_memberships (id, organization_id, user_id, role) VALUES
        ('mem-1', 'org-1', 'user-owner', 'owner'),
        ('mem-2', 'org-1', 'user-admin', 'admin'),
        ('mem-3', 'org-1', 'user-member', 'member');
        
      INSERT INTO projects (id, organization_id, owner_id, name) VALUES
        ('project-1', 'org-1', 'user-member', 'Test Project');
    `);
  });

  it('allows org owner to delete any project', async () => {
    const result = await authz.can({ type: 'user', id: 'user-owner' }, 'delete', {
      type: 'project',
      id: 'project-1',
    });

    expect(result.allowed).toBe(true);
  });

  it('allows project creator to delete their project', async () => {
    const result = await authz.can({ type: 'user', id: 'user-member' }, 'delete', {
      type: 'project',
      id: 'project-1',
    });

    expect(result.allowed).toBe(true);
  });

  it('denies outsider access to project', async () => {
    const result = await authz.can({ type: 'user', id: 'user-outsider' }, 'read', {
      type: 'project',
      id: 'project-1',
    });

    expect(result.allowed).toBe(false);
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

### Testing for Authorization Bypass

```typescript
// src/presentation/handlers/ProjectHandlers.acceptance.test.ts

import { describe, it, expect } from 'vitest';
import { createTestApp } from '../../../tests/helpers/testApp';

describe('Project Authorization Acceptance Tests', () => {
  describe('tenant isolation', () => {
    it('prevents accessing projects from other organizations', async () => {
      const app = await createTestApp();

      // Create two organizations with projects
      const org1User = await app.createUser('user1@test.com');
      const org1 = await app.createOrganization('Org 1', org1User.id);
      const org1Project = await app.createProject('Project 1', org1.id, org1User.id);

      const org2User = await app.createUser('user2@test.com');
      const org2 = await app.createOrganization('Org 2', org2User.id);

      // Try to access org1's project as org2's user
      const response = await app.request(`/projects/${org1Project.id}`, {
        user: org2User,
      });

      expect(response.status).toBe(403);
    });

    it('prevents modifying projects through organization boundary', async () => {
      const app = await createTestApp();

      const org1User = await app.createUser('user1@test.com');
      const org1 = await app.createOrganization('Org 1', org1User.id);
      const org1Project = await app.createProject('Project 1', org1.id, org1User.id);

      const org2User = await app.createUser('user2@test.com');
      await app.createOrganization('Org 2', org2User.id);

      // Try to delete org1's project as org2's user
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

  describe('privilege escalation prevention', () => {
    it('prevents members from promoting themselves to admin', async () => {
      const app = await createTestApp();

      const owner = await app.createUser('owner@test.com');
      const member = await app.createUser('member@test.com');
      const org = await app.createOrganization('Test Org', owner.id);
      await app.addMember(org.id, member.id, 'member');

      // Try to promote self
      const response = await app.request(`/organizations/${org.id}/members/${member.id}`, {
        method: 'POST',
        user: member,
        body: { role: 'admin' },
      });

      expect(response.status).toBe(403);
    });
  });
});
```

---

## 9. Migration Strategies: From User to Org

Migrating from single-user to multi-tenant requires careful planning. This section covers strategies for live migrations.

### Strategy 1: Shadow Organization (Recommended)

Create an organization for each user transparently. Users don't see organizations until they need them.

```typescript
// src/application/services/OrganizationMigration.ts

/**
 * Migrate a user to the organization model by creating a "personal" organization.
 * This is transparent to the user until they invite someone.
 */
export async function ensureUserHasOrganization(
  db: D1Database,
  userId: string
): Promise<Organization> {
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

  if (existing) {
    return toOrganization(existing);
  }

  // Create personal organization
  const user = await db
    .prepare('SELECT id, email FROM users WHERE id = ?')
    .bind(userId)
    .first<{ id: string; email: string }>();

  if (!user) {
    throw new Error('User not found');
  }

  const orgId = crypto.randomUUID();
  const slug = generateSlug(user.email);

  await db.batch([
    db
      .prepare(
        `
      INSERT INTO organizations (id, name, slug, owner_id, type, created_at)
      VALUES (?, ?, ?, ?, 'personal', datetime('now'))
    `
      )
      .bind(orgId, `${user.email}'s Workspace`, slug, userId),

    db
      .prepare(
        `
      INSERT INTO organization_memberships (id, organization_id, user_id, role, created_at)
      VALUES (?, ?, ?, 'owner', datetime('now'))
    `
      )
      .bind(crypto.randomUUID(), orgId, userId),
  ]);

  return {
    id: orgId,
    name: `${user.email}'s Workspace`,
    slug,
    ownerId: userId,
    type: 'personal',
    createdAt: new Date(),
  };
}

/**
 * Migrate existing resources to user's personal organization.
 */
export async function migrateUserResourcesToOrg(db: D1Database, userId: string): Promise<void> {
  const org = await ensureUserHasOrganization(db, userId);

  // Update all user's projects to belong to their personal org
  await db
    .prepare(
      `
      UPDATE projects 
      SET organization_id = ?, updated_at = datetime('now')
      WHERE owner_id = ? AND organization_id IS NULL
    `
    )
    .bind(org.id, userId)
    .run();
}
```

### Strategy 2: Explicit Migration with Feature Flag

Let users opt-in to organizations while keeping the old system working.

```typescript
// src/application/services/FeatureFlags.ts

export async function isOrganizationsEnabled(kv: KVNamespace, userId: string): Promise<boolean> {
  // Check user-level flag
  const userFlag = await kv.get(`feature:organizations:user:${userId}`);
  if (userFlag !== null) {
    return userFlag === 'true';
  }

  // Check percentage rollout
  const rolloutPercentage = await kv.get('feature:organizations:rollout');
  if (rolloutPercentage) {
    const hash = await hashUserId(userId);
    const bucket = hash % 100;
    return bucket < parseInt(rolloutPercentage, 10);
  }

  return false;
}

// In handlers, branch based on feature flag
export async function handleListProjects(ctx: HandlerContext): Promise<Response> {
  const useOrgs = await isOrganizationsEnabled(ctx.env.KV, ctx.user.id);

  if (useOrgs) {
    // New org-based flow
    const org = await ensureUserHasOrganization(ctx.env.DB, ctx.user.id);
    const projects = await projectRepo.listByOrganization(org.id);
    return renderProjectsWithOrg(projects, org);
  } else {
    // Legacy user-based flow
    const projects = await projectRepo.listByOwner(ctx.user.id);
    return renderProjectsLegacy(projects);
  }
}
```

### Strategy 3: Database Migration with Backfill

For simpler applications, migrate the database schema and backfill in one operation.

```sql
-- migrations/0005_add_organizations_backfill.sql

-- 1. Add organization columns
ALTER TABLE projects ADD COLUMN organization_id TEXT;

-- 2. Create organizations table
CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL REFERENCES users(id),
    type TEXT DEFAULT 'personal',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Create memberships table
CREATE TABLE organization_memberships (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT NOT NULL DEFAULT 'owner',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(organization_id, user_id)
);

-- 4. Backfill: Create personal org for each user with projects
INSERT INTO organizations (id, name, slug, owner_id, type, created_at)
SELECT
    'org-' || u.id,
    u.email || '''s Workspace',
    'personal-' || u.id,
    u.id,
    'personal',
    datetime('now')
FROM users u
WHERE EXISTS (SELECT 1 FROM projects p WHERE p.owner_id = u.id);

-- 5. Backfill: Add owner membership
INSERT INTO organization_memberships (id, organization_id, user_id, role, created_at)
SELECT
    'mem-' || o.owner_id,
    o.id,
    o.owner_id,
    'owner',
    datetime('now')
FROM organizations o;

-- 6. Backfill: Assign projects to personal orgs
UPDATE projects
SET organization_id = 'org-' || owner_id
WHERE organization_id IS NULL;

-- 7. Add foreign key constraint
CREATE INDEX idx_projects_org ON projects(organization_id);
```

---

## 10. Security Considerations for Multi-Tenancy

Multi-tenancy introduces specific security concerns that must be addressed.

### Tenant Isolation

The most critical security property is that tenants cannot access each other's data.

```typescript
// src/infrastructure/middleware/tenantIsolation.ts

/**
 * Middleware that ensures all queries are scoped to the current tenant.
 */
export function createTenantScopedDb(db: D1Database, organizationId: string): TenantScopedDb {
  return {
    async query<T>(sql: string, ...params: unknown[]): Promise<T[]> {
      // Verify query includes organization scope
      if (!sql.toLowerCase().includes('organization_id')) {
        throw new TenantIsolationError('Query must include organization_id filter');
      }

      // Execute with organization_id automatically added to params
      const result = await db
        .prepare(sql)
        .bind(...params, organizationId)
        .all<T>();

      return result.results;
    },

    // Provide safe table accessors
    projects: {
      async findById(id: string): Promise<Project | null> {
        const row = await db
          .prepare('SELECT * FROM projects WHERE id = ? AND organization_id = ?')
          .bind(id, organizationId)
          .first<ProjectRow>();
        return row ? toProject(row) : null;
      },

      async list(): Promise<Project[]> {
        const result = await db
          .prepare('SELECT * FROM projects WHERE organization_id = ?')
          .bind(organizationId)
          .all<ProjectRow>();
        return result.results.map(toProject);
      },
    },
  };
}

export class TenantIsolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantIsolationError';
  }
}
```

### Authorization Audit Logging

Log all authorization decisions for security review.

```typescript
// src/infrastructure/audit/AuthorizationAuditLog.ts

interface AuthorizationAuditEntry {
  timestamp: string;
  actor: Actor;
  action: Action;
  resource: Resource;
  result: 'allowed' | 'denied';
  reason: string;
  effectiveRole?: string;
  ip?: string;
  userAgent?: string;
}

export class AuthorizationAuditLog {
  constructor(private kv: KVNamespace) {}

  async log(entry: AuthorizationAuditEntry): Promise<void> {
    const key = `audit:authz:${Date.now()}:${crypto.randomUUID()}`;

    await this.kv.put(key, JSON.stringify(entry), {
      expirationTtl: 90 * 24 * 60 * 60, // 90 days
    });

    // Also log to console for real-time monitoring
    console.log({
      type: 'authorization_audit',
      ...entry,
    });
  }

  async queryByActor(
    actorId: string,
    options: { start?: Date; end?: Date; limit?: number }
  ): Promise<AuthorizationAuditEntry[]> {
    // In production, use a proper time-series database
    const entries: AuthorizationAuditEntry[] = [];
    const list = await this.kv.list({ prefix: 'audit:authz:' });

    for (const key of list.keys) {
      const value = await this.kv.get(key.name);
      if (value) {
        const entry = JSON.parse(value) as AuthorizationAuditEntry;
        if (entry.actor.type === 'user' && entry.actor.id === actorId) {
          entries.push(entry);
        }
      }
    }

    return entries.slice(0, options.limit || 100);
  }
}
```

### Preventing Privilege Escalation

```typescript
// src/domain/authorization/guards/privilegeEscalation.ts

/**
 * Prevent users from granting roles higher than their own.
 */
export function canGrantRole(grantorRole: OrgRole, targetRole: OrgRole): boolean {
  const roleHierarchy: Record<OrgRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  };

  // Can only grant roles at or below your own level
  // Exception: owners can grant admin
  if (grantorRole === 'owner') {
    return true; // Owners can grant any role
  }

  return roleHierarchy[grantorRole] > roleHierarchy[targetRole];
}

/**
 * Prevent users from modifying their own role.
 */
export function canModifyMembership(
  actorId: string,
  actorRole: OrgRole,
  targetUserId: string,
  targetCurrentRole: OrgRole
): boolean {
  // Cannot modify your own membership
  if (actorId === targetUserId) {
    return false;
  }

  // Must have higher role than target
  const roleHierarchy: Record<OrgRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  };

  return roleHierarchy[actorRole] > roleHierarchy[targetCurrentRole];
}
```

---

## 11. Complete Implementation Example

This section provides a complete, working example bringing together all concepts.

### Router Setup

```typescript
// src/router.ts

import { Hono } from 'hono';
import { sessionMiddleware } from './presentation/middleware/session';
import { authorizationMiddleware } from './presentation/middleware/authorization';
import * as ProjectHandlers from './presentation/handlers/ProjectHandlers';
import * as OrgHandlers from './presentation/handlers/OrganizationHandlers';
import * as MembershipHandlers from './presentation/handlers/MembershipHandlers';

const app = new Hono<{ Bindings: Env }>();

// Apply session middleware to all routes
app.use('*', sessionMiddleware());

// Organization routes
app.get('/organizations', OrgHandlers.handleListOrganizations);
app.post('/organizations', OrgHandlers.handleCreateOrganization);
app.get(
  '/organizations/:orgId',
  authorizationMiddleware('organization', 'read'),
  OrgHandlers.handleGetOrganization
);
app.post(
  '/organizations/:orgId',
  authorizationMiddleware('organization', 'update'),
  OrgHandlers.handleUpdateOrganization
);
app.post(
  '/organizations/:orgId/delete',
  authorizationMiddleware('organization', 'delete'),
  OrgHandlers.handleDeleteOrganization
);

// Membership routes
app.get(
  '/organizations/:orgId/members',
  authorizationMiddleware('organization', 'read'),
  MembershipHandlers.handleListMembers
);
app.post(
  '/organizations/:orgId/members',
  authorizationMiddleware('organization', 'invite'),
  MembershipHandlers.handleInviteMember
);
app.post(
  '/organizations/:orgId/members/:userId',
  authorizationMiddleware('organization', 'admin'),
  MembershipHandlers.handleUpdateMember
);
app.post(
  '/organizations/:orgId/members/:userId/remove',
  authorizationMiddleware('organization', 'remove'),
  MembershipHandlers.handleRemoveMember
);

// Project routes (scoped to organization)
app.get(
  '/organizations/:orgId/projects',
  authorizationMiddleware('organization', 'read'),
  ProjectHandlers.handleListProjects
);
app.post(
  '/organizations/:orgId/projects',
  authorizationMiddleware('organization', 'create'),
  ProjectHandlers.handleCreateProject
);
app.get(
  '/projects/:projectId',
  authorizationMiddleware('project', 'read'),
  ProjectHandlers.handleGetProject
);
app.post(
  '/projects/:projectId',
  authorizationMiddleware('project', 'update'),
  ProjectHandlers.handleUpdateProject
);
app.post(
  '/projects/:projectId/delete',
  authorizationMiddleware('project', 'delete'),
  ProjectHandlers.handleDeleteProject
);

export default app;
```

### Authorization Middleware Factory

```typescript
// src/presentation/middleware/authorization.ts

import { createMiddleware } from 'hono/factory';
import { AuthorizationService } from '../../application/services/AuthorizationService';
import type { ResourceType, Action, Actor, Resource } from '../../domain/authorization/types';

/**
 * Create authorization middleware for a specific resource type and action.
 */
export function authorizationMiddleware(resourceType: ResourceType, action: Action) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const session = c.get('session');

    if (!session) {
      return c.redirect('/auth/login');
    }

    const actor: Actor = { type: 'user', id: session.userId };
    const resource = extractResource(resourceType, c.req.param());

    const authz = new AuthorizationService(c.env.DB);
    const result = await authz.can(actor, action, resource);

    if (!result.allowed) {
      return c.html(`<div class="alert alert-error">Access denied: ${result.reason}</div>`, 403);
    }

    // Add authorization context for use in handlers
    c.set('authz', authz);
    c.set('actor', actor);
    c.set('resource', resource);
    c.set('effectiveRole', result.effectiveRole);

    await next();
  });
}

function extractResource(type: ResourceType, params: Record<string, string>): Resource {
  switch (type) {
    case 'organization':
      return { type: 'organization', id: params.orgId };
    case 'project':
      return { type: 'project', id: params.projectId };
    default:
      throw new Error(`Unknown resource type: ${type}`);
  }
}
```

---

## Summary

This guide has presented a comprehensive approach to multi-tenant boundaries that avoids the common mistake of shipping a monolithic "teams" feature. Instead, we've built:

1. **A decision framework** that helps you determine when (and if) you need multi-tenancy
2. **A canonical data model** that evolves gracefully from single-user to full organization support
3. **A simple policy abstraction** that answers "Can X do Y on Z?" cleanly
4. **Concrete patterns** for ownership, admin override, system actions, delegation, and hierarchy
5. **Testing strategies** that ensure authorization logic is correct
6. **Migration paths** for evolving existing applications

The key insight is that authorization is about answering one question consistently. Everything else—teams, organizations, workspaces—is configuration of that fundamental question.

Start simple. Add complexity when you feel the pain. Let the policy abstraction grow with your needs rather than building for hypothetical future requirements.

---

_This guide is a companion to the Comprehensive Guide: Interactive Web Applications on Cloudflare. For authentication details, see the Secure Session-Based Authentication Guide. For general security practices, see the Comprehensive Security Guide._

_January 2026_
