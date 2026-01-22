# rate-limiting.md

# Rate Limiting

**Purpose**: Protect membership endpoints from abuse, enumeration attacks, and denial of service using KV-based rate limiting.

## Rate Limit Recommendations

| Operation                | Limit            | Window | Rationale                         |
| ------------------------ | ---------------- | ------ | --------------------------------- |
| Invitations sent         | 10 per org       | 1 hour | Prevent spam invitations          |
| Role changes             | 20 per org       | 1 hour | Prevent rapid permission cycling  |
| Authorization failures   | 5 per user       | 15 min | Prevent resource enumeration      |
| Membership list requests | 100 per user     | 1 hour | Prevent org structure enumeration |
| Failed login attempts    | 5 per IP/account | 15 min | Prevent credential stuffing       |

## Rate Limiter Implementation

```typescript
// src/infrastructure/rate-limiting/RateLimiter.ts

interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export class KVRateLimiter {
  constructor(private kv: KVNamespace) {}

  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowSeconds * 1000;
    const kvKey = `ratelimit:${key}`;

    // Get current state
    const stored = await this.kv.get<{ count: number; windowStart: number }>(kvKey, 'json');

    // Reset if window expired
    if (!stored || stored.windowStart < windowStart) {
      await this.kv.put(kvKey, JSON.stringify({ count: 1, windowStart: now }), {
        expirationTtl: config.windowSeconds,
      });
      return {
        allowed: true,
        remaining: config.limit - 1,
        resetAt: new Date(now + config.windowSeconds * 1000),
      };
    }

    // Check limit
    if (stored.count >= config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(stored.windowStart + config.windowSeconds * 1000),
      };
    }

    // Increment counter
    await this.kv.put(
      kvKey,
      JSON.stringify({ count: stored.count + 1, windowStart: stored.windowStart }),
      { expirationTtl: config.windowSeconds }
    );

    return {
      allowed: true,
      remaining: config.limit - stored.count - 1,
      resetAt: new Date(stored.windowStart + config.windowSeconds * 1000),
    };
  }

  async reset(key: string): Promise<void> {
    await this.kv.delete(`ratelimit:${key}`);
  }
}
```

## Invitation Rate Limiting

```typescript
const INVITATION_LIMIT: RateLimitConfig = {
  limit: 10,
  windowSeconds: 3600, // 1 hour
};

export async function inviteMember(
  db: D1Database,
  kv: KVNamespace,
  inviterId: string,
  organizationId: string,
  inviteeEmail: string,
  role: OrgRole
): Promise<Invitation> {
  const rateLimiter = new KVRateLimiter(kv);

  // Rate limit per organization
  const orgLimit = await rateLimiter.check(`invite:org:${organizationId}`, INVITATION_LIMIT);

  if (!orgLimit.allowed) {
    throw new RateLimitError(
      'Too many invitations. Please wait before sending more.',
      orgLimit.resetAt
    );
  }

  // Also rate limit per user
  const userLimit = await rateLimiter.check(`invite:user:${inviterId}`, {
    limit: 20,
    windowSeconds: 3600,
  });

  if (!userLimit.allowed) {
    throw new RateLimitError('You have sent too many invitations. Please wait.', userLimit.resetAt);
  }

  // Proceed with invitation logic...
  return createInvitation(db, { organizationId, email: inviteeEmail, role, invitedBy: inviterId });
}
```

## Authorization Failure Rate Limiting

```typescript
const AUTH_FAILURE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowSeconds: 900, // 15 minutes
};

export async function checkWithEnumerationProtection(
  authz: AuthorizationService,
  kv: KVNamespace,
  actor: Actor,
  action: Action,
  resource: Resource
): Promise<AuthorizationResult> {
  const rateLimiter = new KVRateLimiter(kv);

  // Check if user has too many recent failures
  const userKey = actor.type === 'user' ? actor.id : 'anonymous';
  const limitKey = `authfail:${userKey}:${resource.type}`;

  const preCheck = await rateLimiter.check(limitKey, AUTH_FAILURE_LIMIT);

  // If already at limit, return generic denial
  if (!preCheck.allowed) {
    return {
      allowed: false,
      reason: 'Access denied',
    };
  }

  // Perform actual authorization check
  const result = await authz.can(actor, action, resource);

  // Track failures (but not successes)
  if (!result.allowed) {
    await rateLimiter.check(limitKey, AUTH_FAILURE_LIMIT);
  }

  return result;
}
```

## HTTP Response Headers

```typescript
export function addRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const headers = new Headers(response.headers);

  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000).toString());

  if (!result.allowed) {
    headers.set(
      'Retry-After',
      Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString()
    );
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
```

## Error Handling

```typescript
export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetAt: Date
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// In request handler
if (error instanceof RateLimitError) {
  return new Response(error.message, {
    status: 429,
    headers: {
      'Retry-After': Math.ceil((error.resetAt.getTime() - Date.now()) / 1000).toString(),
    },
  });
}
```

## Security Checklist

| Check                                                     | Done |
| --------------------------------------------------------- | ---- |
| [ ] Invitation endpoints rate limited per org             |      |
| [ ] Role change endpoints rate limited                    |      |
| [ ] Authorization failures tracked to prevent enumeration |      |
| [ ] Rate limit headers included in responses              |      |
| [ ] Retry-After header set on 429 responses               |      |
| [ ] Rate limits cannot be bypassed by changing user agent |      |
| [ ] Tests verify rate limiting behavior                   |      |

## Cross-References

- **privilege-escalation-prevention.md**: Security patterns
- **error-messages.md**: Safe error responses
