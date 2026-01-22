# Error Messages

**Purpose**: Security-safe error message patterns that prevent information disclosure and enumeration attacks in multi-tenant SaaS applications.

## Core Principles

| Principle                     | Description                                                          |
| ----------------------------- | -------------------------------------------------------------------- |
| No internal leakage           | Error messages should not reveal database structure, file paths, etc |
| No resource existence leakage | Don't confirm whether a resource exists in authorization denials     |
| No permission enumeration     | Don't list what permissions exist or what the user lacks             |
| Consistent timing             | Authorization checks should take similar time regardless of outcome  |

## Error Message Patterns

### ❌ Bad Examples (Avoid These)

```typescript
// ❌ BAD: Leaks internal system details
return new Response(
  `User ${userId} does not have permission 'project:delete' on resource ${projectId}`,
  { status: 403 }
);

// ❌ BAD: Reveals resource existence
return new Response(
  `Project ${projectId} belongs to organization ${orgId}, not your organization`,
  { status: 403 }
);

// ❌ BAD: Reveals permission structure
return new Response(`Missing required permissions: project:delete, project:archive`, {
  status: 403,
});

// ❌ BAD: Different errors reveal information
if (!projectExists) {
  return new Response('Project not found', { status: 404 });
}
if (!hasAccess) {
  return new Response('Access denied', { status: 403 });
}
// Attacker learns project exists by getting 403 instead of 404
```

### ✅ Good Examples (Use These)

```typescript
// ✅ GOOD: Generic denial without details
return new Response('Access denied', { status: 403 });

// ✅ GOOD: User-friendly without leaking internals
return new Response('You do not have permission to perform this action', { status: 403 });

// ✅ GOOD: Consistent response for missing/unauthorized
async function handleGetProject(projectId: string, userId: string): Promise<Response> {
  const authz = new AuthorizationService(env.DB, logger);
  const result = await authz.can({ type: 'user', id: userId }, 'read', {
    type: 'project',
    id: projectId,
  });

  // Same 403 response whether project doesn't exist or user lacks permission
  if (!result.allowed) {
    return new Response('Access denied', { status: 403 });
  }

  const project = await getProject(projectId);

  // Only 404 for authenticated, authorized users
  if (!project) {
    return new Response('Project not found', { status: 404 });
  }

  return Response.json(project);
}
```

## Resource Existence Hiding

When a user lacks permission, return the same response whether the resource exists or not:

```typescript
async function handleGetProject(projectId: string, userId: string): Promise<Response> {
  const authz = new AuthorizationService(env.DB, logger);
  const result = await authz.can({ type: 'user', id: userId }, 'read', {
    type: 'project',
    id: projectId,
  });

  // Same 403 response whether project doesn't exist or user lacks permission
  // This prevents attackers from enumerating valid project IDs
  if (!result.allowed) {
    return new Response('Access denied', { status: 403 });
  }

  const project = await getProject(projectId);

  // Only 404 for authenticated, authorized users who can see the resource doesn't exist
  if (!project) {
    return new Response('Project not found', { status: 404 });
  }

  return Response.json(project);
}
```

## Logging vs User Response

Log detailed information for debugging while returning generic messages to users:

```typescript
const result = await authz.can(actor, action, resource);

if (!result.allowed) {
  // Detailed logging for internal audit (with PII redaction)
  logger.warn({
    event: 'authorization.denied',
    category: 'application',
    actor_type: actor.type,
    actor_id: actor.type === 'user' ? actor.id : undefined,
    action,
    resource_type: resource.type,
    resource_id: resource.id,
    denial_reason: result.reason, // Internal use only
  });

  // Generic response to user
  return new Response('Access denied', { status: 403 });
}
```

## Timing Attack Prevention

Ensure authorization checks don't leak information through response timing:

```typescript
/**
 * Perform authorization check with consistent timing.
 * Prevents attackers from inferring resource existence through response time.
 */
async function authorizeWithConsistentTiming(
  authz: AuthorizationService,
  actor: Actor,
  action: Action,
  resource: Resource
): Promise<AuthorizationResult> {
  const startTime = Date.now();
  const minDuration = 50; // Minimum response time in ms

  const result = await authz.can(actor, action, resource);

  // Ensure minimum duration to prevent timing leaks
  const elapsed = Date.now() - startTime;
  if (elapsed < minDuration) {
    await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
  }

  return result;
}
```

## Error Response Standards

### HTTP Status Codes

| Status | Use Case                                   | Message Example                   |
| ------ | ------------------------------------------ | --------------------------------- |
| 401    | Not authenticated                          | "Authentication required"         |
| 403    | Authenticated but not authorized           | "Access denied"                   |
| 404    | Resource not found (after auth check)      | "Not found"                       |
| 429    | Rate limited                               | "Too many requests. Try again in" |
| 500    | Internal error (never expose stack traces) | "Internal server error"           |

### Error Response Format

```typescript
interface ErrorResponse {
  error: string; // Generic user-facing message
  // Never include: stack traces, SQL queries, file paths, internal IDs
}

// ✅ GOOD: Generic error
return Response.json({ error: 'Access denied' }, { status: 403 });

// ❌ BAD: Exposes internal details
return Response.json(
  {
    error: 'Authorization failed',
    details: 'User user-123 lacks permission project:delete on resource proj-456',
    query: 'SELECT role FROM org_memberships WHERE...',
  },
  { status: 403 }
);
```

## Validation Error Messages

For input validation, be specific about what's wrong without revealing system internals:

```typescript
// ✅ GOOD: Specific about user input
if (!email.includes('@')) {
  return Response.json({ error: 'Invalid email address' }, { status: 400 });
}

// ✅ GOOD: Helpful without revealing existence
if (roleNotValid) {
  return Response.json({ error: 'Invalid role. Must be: viewer, member, admin' }, { status: 400 });
}

// ❌ BAD: Reveals whether email is already in use
if (await userExists(email)) {
  return Response.json({ error: 'Email already registered' }, { status: 409 });
}
// Instead, silently succeed or say "If this email is valid, you'll receive..."
```

## Security Checklist

| Check                                          | Done |
| ---------------------------------------------- | ---- |
| [ ] Authorization denials use generic messages |      |
| [ ] Same response for not-found vs no-access   |      |
| [ ] No internal details in error messages      |      |
| [ ] Detailed errors logged, not returned       |      |
| [ ] Timing attacks considered and mitigated    |      |
| [ ] Validation errors don't leak information   |      |
| [ ] 500 errors never include stack traces      |      |

## Cross-References

- **authorization-service.md**: Authorization implementation
- **isolation-audit.md**: Security audit checklist
- **rate-limiting.md**: Rate limiting error responses
