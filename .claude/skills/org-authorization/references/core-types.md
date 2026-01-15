# Core Types

**Purpose**: Define the authorization type system: Actor, Action, Resource, and PolicyContext.

## When to Use

Use this reference when:

- Starting authorization implementation
- Adding new actor types (users, systems, API keys)
- Extending available actions
- Defining new resource types

## Pattern

```typescript
// src/domain/authorization/types.ts

/**
 * An Actor is the entity attempting to perform an action.
 * Actors can be users, system processes, or API keys.
 */
export type Actor =
  | { type: 'user'; id: string }
  | { type: 'system'; reason: string }
  | { type: 'api_key'; id: string; scopes: string[] };

/**
 * Actions that can be performed on resources.
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
 * Resource types in the system.
 */
export type ResourceType = 'organization' | 'project' | 'document' | 'membership';

/**
 * A Resource identifies what the action targets.
 * The format is "type:id" with optional parent for nested resources.
 */
export interface Resource {
  type: ResourceType;
  id: string;
  /** Optional parent context for nested resources */
  parent?: Resource;
}

/**
 * The result of an authorization check.
 * Always includes a reason for debugging and audit logging.
 */
export interface AuthorizationResult {
  allowed: boolean;
  reason: string;
  /** The effective role that granted (or would have granted) access */
  effectiveRole?: string;
}

/**
 * Context provides the data needed to evaluate policies.
 * This is loaded once per request and passed to all policy checks.
 */
export interface PolicyContext {
  /** Organization membership for the actor (if user) */
  organizationMembership?: {
    organizationId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
  };
  /** Who owns the resource being accessed */
  resourceOwner?: string;
  /** Which organization the resource belongs to */
  resourceOrganizationId?: string;
  /** Project-specific membership (if checking project access) */
  projectMembership?: {
    role: 'admin' | 'editor' | 'viewer';
  };
}
```

## Extending Types

### Adding a New Actor Type

```typescript
export type Actor =
  | { type: 'user'; id: string }
  | { type: 'system'; reason: string }
  | { type: 'api_key'; id: string; scopes: string[] }
  | { type: 'service_account'; id: string; service: string }; // New
```

### Adding a New Resource Type

```typescript
export type ResourceType = 'organization' | 'project' | 'document' | 'membership' | 'billing'; // New
```

### Adding Custom Actions

```typescript
export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'invite'
  | 'remove'
  | 'transfer'
  | 'admin'
  | 'archive'
  | 'restore'; // New actions
```

## Type Guards

```typescript
/**
 * Type guard for user actors.
 */
export function isUserActor(actor: Actor): actor is { type: 'user'; id: string } {
  return actor.type === 'user';
}

/**
 * Type guard for system actors.
 */
export function isSystemActor(actor: Actor): actor is { type: 'system'; reason: string } {
  return actor.type === 'system';
}
```

## Usage Example

```typescript
import type { Actor, Action, Resource, AuthorizationResult } from './types';

async function checkAccess(
  actor: Actor,
  action: Action,
  resource: Resource
): Promise<AuthorizationResult> {
  // System actors always allowed
  if (actor.type === 'system') {
    return { allowed: true, reason: `System: ${actor.reason}` };
  }

  // Load context and evaluate policy...
  return { allowed: false, reason: 'Not implemented' };
}
```
